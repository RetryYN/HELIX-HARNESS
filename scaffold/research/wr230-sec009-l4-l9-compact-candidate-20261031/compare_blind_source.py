#!/usr/bin/env python3
"""Read-only comparison of the frozen blind SEC009 source derivation and candidate sources."""
from __future__ import annotations

import hashlib
import json
import subprocess
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
HERE = Path(__file__).resolve().parent
BLIND = HERE / "blind-source-derivation.json"
EXPECTED_BLIND_SHA = "1cffa3e3bb88921435ae2e3e0ecd56cdd89701154007f926ff68390660dfdfc3"
BLIND_COMMENT = "https://github.com/RetryYN/HELIX-HARNESS/issues/3510#issuecomment-6532859151"
OLD_REV = "aa124441198b3b89cbe089be3dbd46805634201d"
NEW_REV = "c8f20a4f91456f6d5e5c16e1be0083c34aab6651"
L4_PATH = "docs/helix-security/L4-basic-design/revoke-quarantine-propagation.json"
L5_PATH = "docs/helix-security/L5-detail-design/revoke-quarantine-propagation.json"
L9_PATH = "docs/helix-security/L9-integration-verification/revoke-quarantine-propagation.json"


def sha(raw: bytes) -> str:
    return hashlib.sha256(raw).hexdigest()


def canon(value: object) -> bytes:
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8")


def git_bytes(revision: str, path: str) -> bytes:
    return subprocess.check_output(["git", "show", f"{revision}:{path}"], cwd=ROOT)


def get_pointer(document: object, pointer: str) -> object:
    if pointer == "":
        return document
    value = document
    for token in pointer.lstrip("/").split("/"):
        token = token.replace("~1", "/").replace("~0", "~")
        value = value[int(token)] if isinstance(value, list) else value[token]
    return value


def run() -> dict[str, object]:
    failures: list[str] = []
    blind_raw = BLIND.read_bytes()
    blind_hash = sha(blind_raw)
    if blind_hash != EXPECTED_BLIND_SHA:
        failures.append("frozen_blind_artifact_sha_mismatch")
    blind = json.loads(blind_raw)
    old_rev = blind["sources"]["repository_head"]
    if old_rev != OLD_REV:
        failures.append("blind_repository_head_mismatch")
    if blind["sources"]["files"][L4_PATH]["sha256"] != "dde56181db3d564d97222ba9cacdb3fb204888a669b72ed562f19bb77bd41fb5":
        failures.append("blind_l4_pin_mismatch")

    old_l4_raw = git_bytes(old_rev, L4_PATH)
    new_l4_raw = git_bytes(NEW_REV, L4_PATH)
    old_l4, new_l4 = json.loads(old_l4_raw), json.loads(new_l4_raw)
    old_l4_sha, new_l4_sha = sha(old_l4_raw), sha(new_l4_raw)
    if old_l4_sha != blind["sources"]["files"][L4_PATH]["sha256"]:
        failures.append("old_l4_git_blob_does_not_match_blind_pin")
    candidate_pins = json.loads((HERE / "compact-candidate.json").read_text(encoding="utf-8"))["source_pins"]
    candidate_l4_pin = next((x for x in candidate_pins if x["path"] == L4_PATH), None)
    if not candidate_l4_pin or candidate_l4_pin["sha256"] != new_l4_sha:
        failures.append("candidate_l4_pin_mismatch")

    compact_summary_path = HERE / "verification-summary.json"
    compact_summary_raw = compact_summary_path.read_bytes()
    compact_summary = json.loads(compact_summary_raw)
    if compact_summary.get("result") != "PASS":
        failures.append("compact_candidate_static_validation_not_pass")

    # Validate every blind-cited source file at the revision declared by the blind record.
    blind_source_results = []
    l3_l10_rev = blind["sources"]["l3_l10_pinned_revision"]
    for path, record in blind["sources"]["files"].items():
        revision = old_rev if path == L4_PATH else l3_l10_rev
        actual = sha(git_bytes(revision, path))
        match = actual == record["sha256"]
        blind_source_results.append({"path": path, "revision": revision, "expected_sha256": record["sha256"], "actual_sha256": actual, "match": match})
        if not match:
            failures.append(f"blind_cited_source_pin_mismatch:{path}")

    # The artifact's approved_object_canonical_sha256 is the L3 requirement object digest;
    # L10 is an independently cited verification pointer and has no shared object digest.
    approved_links_checked = 0
    l3_digest_matches = 0
    l10_pointers_resolved = 0
    for link in blind["approved_requirement_links"]:
        l3_filename, l3_pointer = link["l3_pointer"].split("#", 1)
        l10_filename, l10_pointer = link["l10_pointer"].split("#", 1)
        l3_path = f"docs/helix-security/L3-requirements/{l3_filename}"
        l10_path = f"docs/helix-security/L10-verification/{l10_filename}"
        l3_doc = json.loads(git_bytes(l3_l10_rev, l3_path))
        l10_doc = json.loads(git_bytes(l3_l10_rev, l10_path))
        l3_obj, l10_obj = get_pointer(l3_doc, l3_pointer), get_pointer(l10_doc, l10_pointer)
        expected = link["approved_object_canonical_sha256"]
        if sha(canon(l3_obj)) != expected:
            failures.append(f"approved_L3_object_digest_mismatch:{link['id']}")
        else:
            l3_digest_matches += 1
        if not isinstance(l10_obj, dict):
            failures.append(f"approved_L10_pointer_does_not_resolve_to_object:{link['id']}")
        else:
            l10_pointers_resolved += 1
        approved_links_checked += 1

    old_code_classes = old_l4["diagnostic_contract"]["code_classes"]
    new_code_classes = new_l4["diagnostic_contract"]["code_classes"]
    code_classes_equal = old_code_classes == new_code_classes
    if not code_classes_equal:
        failures.append("diagnostic_code_classes_changed_across_source_revisions")

    old_contract_keys = [set(c) for c in old_l4["contracts"]]
    new_contract_class_counts = [len(c.get("negative_classifications", [])) for c in new_l4["contracts"]]
    old_has_top_classes = "failure_classifications" in old_l4
    new_class_rows = new_l4.get("failure_classifications", [])
    if old_has_top_classes or len(new_class_rows) != 30:
        failures.append("expected_old_vs_candidate_failure_classification_structure_not_observed")

    blind_groups = blind["l4_explicit_class_assignments"]
    blind_violation = set(blind_groups["violation"])
    blind_unknown = set(blind_groups["unknown"])
    blind_code_classes = set(old_code_classes)
    blind_category_exact = (
        blind_violation == {code for code, category in old_code_classes.items() if category == "violation"}
        and blind_unknown == {code for code, category in old_code_classes.items() if category == "unknown"}
    )
    if not blind_category_exact:
        failures.append("blind_category_lists_disagree_with_pinned_old_l4_code_classes")

    # Count source-native records, not inferred case membership. Current class keys are resolved
    # from L4/L5; exact full-key equality is only a duplicate check, never a way to assign cases.
    l5 = json.loads(git_bytes(NEW_REV, L5_PATH))
    l9 = json.loads(git_bytes(NEW_REV, L9_PATH))
    l5_by_code = {r["code"]: r for r in l5["failure_rules"]}
    full_keys = []
    finding_codes: set[str] = set()
    coarse = Counter()
    current_expected_classification_counts = Counter()
    current_class_codes = set()
    for row in new_class_rows:
        code = row["code"]
        rule = l5_by_code.get(code)
        if rule is None:
            failures.append(f"candidate_l5_rule_missing:{code}")
            continue
        owner = {"kind": "function_ref", "id": rule["function_ref"]} if "function_ref" in rule else {"kind": "contract_ref", "id": rule.get("contract_ref")}
        key = {
            "classification": code,
            "finding_codes": row["expected"]["finding_codes"],
            "backflow_owner": row["backflow_owner"],
            "expected_axis": row["expected_axis"],
            "expected_state": row["expected_state"],
            "owner_ref": owner,
        }
        full_keys.append(canon(key))
        current_class_codes.add(code)
        finding_codes.update(row["expected"]["finding_codes"])
        current_expected_classification_counts[row["expected_classification"]] += 1
        coarse[(row["expected_classification"], canon(row["expected"]["finding_codes"]))] += 1
    if len(full_keys) != 30 or len(set(full_keys)) != 30:
        failures.append("candidate_full_six_attribute_signature_not_unique_30")

    repeated_coarse = []
    for (_, finding_json), count in sorted(coarse.items(), key=lambda item: item[0][1]):
        if count > 1:
            repeated_coarse.append({"finding_codes": json.loads(finding_json), "current_L4_rows": count})

    # Existing L9 population and recorded assignments are counted as recorded. Blind artifact has
    # deliberately no L9/case rows, so there is no casewise blind join or value-based remapping.
    audit = l9["negative_class_assignment_audit"]
    assigned = sum(len(c.get("existing_l9_assignment_pointers", [])) for c in json.loads((HERE / "compact-candidate.json").read_text())["classes"])
    current_case_row_count = sum(len(c["positive_cases"]) + len(c["negative_cases"]) for c in l9["cases"]) + len(l9["multi_contract_residual"]["positive_cases"]) + len(l9["multi_contract_residual"]["negative_cases"])
    if assigned != audit["assigned_single_contract_negative_case_count"] or current_case_row_count != 356:
        failures.append("candidate_assignment_or_population_count_disagrees_with_existing_l9_audit")
    ambiguous_pointers = [x["case_pointer"] for x in audit["unassigned_single_contract_negative_cases"]]
    multi_review = l9["negative_class_assignment_audit"]["multi_contract_residual_review"]

    old_size, new_size = len(old_l4_raw), len(new_l4_raw)
    current_findings_not_in_blind = sorted(finding_codes - blind_code_classes)
    blind_findings_not_in_current_rows = sorted(blind_code_classes - finding_codes)
    direct_class_id_join_count = len(current_class_codes & blind_code_classes)

    return {
        "schema": "wr230-sec009-blind-comparison.v1",
        "comparison_kind": "post_freeze_static_source_and_inventory_comparison",
        "blind_artifact": {
            "path": "scaffold/research/wr230-sec009-l4-l9-compact-candidate-20261031/blind-source-derivation.json",
            "sha256": blind_hash,
            "expected_sha256": EXPECTED_BLIND_SHA,
            "bytes": len(blind_raw),
            "frozen_reference": BLIND_COMMENT,
            "bytes_unchanged": blind_hash == EXPECTED_BLIND_SHA,
        },
        "compact_candidate_static_validation": {
            "path": "scaffold/research/wr230-sec009-l4-l9-compact-candidate-20261031/verification-summary.json",
            "sha256": sha(compact_summary_raw),
            "result": compact_summary.get("result"),
            "case_rows_resolved": compact_summary.get("checks", {}).get("case_rows_resolved"),
            "unique_six_attribute_class_keys": compact_summary.get("checks", {}).get("unique_six_attribute_class_keys"),
            "existing_case_assignments_resolved": compact_summary.get("checks", {}).get("existing_case_assignment_pointers_resolved"),
        },
        "source_revisions": {
            "blind_repository_head": old_rev,
            "blind_l4_path": L4_PATH,
            "blind_l4_sha256": old_l4_sha,
            "candidate_revision": NEW_REV,
            "candidate_l4_path": L4_PATH,
            "candidate_l4_sha256": new_l4_sha,
            "l4_file_bytes": {"blind": old_size, "candidate": new_size},
            "l4_source_bytes_identical": old_l4_raw == new_l4_raw,
            "candidate_l4_matches_candidate_pin": bool(candidate_l4_pin and candidate_l4_pin["sha256"] == new_l4_sha),
            "blind_l4_matches_blind_pin": old_l4_sha == blind["sources"]["files"][L4_PATH]["sha256"],
        },
        "blind_cited_source_pin_results": blind_source_results,
        "approved_l3_l10_links_checked": approved_links_checked,
        "approved_l3_object_digest_matches": l3_digest_matches,
        "approved_l10_pointers_resolved": l10_pointers_resolved,
        "l4_revision_delta": {
            "blind_consulted_pointers": ["/diagnostic_contract/code_classes", "/contracts/0", "/contracts/1", "/contracts/2"],
            "candidate_consulted_pointers": ["/diagnostic_contract/code_classes", "/contracts/0/negative_classifications", "/contracts/1/negative_classifications", "/contracts/2/negative_classifications", "/failure_classifications"],
            "old_contracts_have_negative_classifications": ["negative_classifications" in keys for keys in old_contract_keys],
            "candidate_contract_negative_classification_counts": new_contract_class_counts,
            "old_top_level_failure_classifications_present": old_has_top_classes,
            "candidate_top_level_failure_classification_count": len(new_class_rows),
            "diagnostic_code_classes_equal_across_revisions": code_classes_equal,
            "blind_violation_code_count": len(blind_violation),
            "blind_unknown_code_count": len(blind_unknown),
            "blind_category_entry_counts": {"violation": len(blind_violation), "unknown": len(blind_unknown)},
            "candidate_expected_classification_row_counts": dict(sorted(current_expected_classification_counts.items())),
            "blind_category_lists_match_pinned_old_code_classes": blind_category_exact,
            "current_unique_finding_code_count": len(finding_codes),
            "current_finding_tokens_not_in_blind_vocabulary": current_findings_not_in_blind,
            "blind_vocabulary_tokens_without_current_single_contract_class_row": blind_findings_not_in_current_rows,
            "raw_row_count_difference_30_minus_24": len(new_class_rows) - len(blind_code_classes),
            "unmatched_count_delta_only": len(new_class_rows) - len(blind_code_classes),
            "raw_count_difference_interpretation": "30 current L4 rows are context-specific class rows; 24 blind entries are unique finding-code categories. They are different units. The raw delta of 6 is not evidence of six missing classes and is not converted into assignments.",
            "direct_class_code_to_blind_finding_code_join_count": direct_class_id_join_count,
            "case_assignment_comparison_limit": "Blind derivation contains no L9/case assignments or case IDs. Therefore no casewise agreement/disagreement against the existing 275 L9 assignments is available; no expected-value matching or remapping was used.",
        },
        "signature_observation": {
            "six_attribute_typed_owner_key_count": len(full_keys),
            "duplicate_full_six_attribute_keys": len(full_keys) - len(set(full_keys)),
            "repeated_coarse_expected_classification_and_finding_signatures": repeated_coarse,
            "interpretation": "Repeated finding-code projections are kept separate by the full axis/state/typed-owner key; no singleton class or collapse was created.",
        },
        "existing_l9_inventory": {
            "source_population_count": current_case_row_count,
            "assigned_single_contract_negative_case_count": assigned,
            "ambiguous_single_contract_negative_case_count": len(ambiguous_pointers),
            "ambiguous_case_pointers": ambiguous_pointers,
            "multi_contract_residual_total_count": audit["multi_contract_residual_total_count"],
            "multi_contract_residual_positive_count": audit["multi_contract_residual_positive_count"],
            "multi_contract_residual_negative_count": audit["multi_contract_residual_negative_count"],
            "multi_contract_residual_pointer": "/multi_contract_residual",
            "multi_contract_residual_moved_case_count": multi_review["moved_case_count"],
            "comparison_treatment": "Existing counts/reasons are recorded unchanged. The blind artifact has no case assignments; ambiguous and multi-contract rows remain unassigned and are not matched by values.",
        },
        "historical_basis": {
            "legacy_asset_ids": ["LEGACY-ASSET-D461943347D372ECF6DA", "LEGACY-ASSET-B62E49D2E156232B8C63"],
            "failure_record": "Issue #3510; PR #3918 and #3925; current L9 /negative_class_assignment_audit",
            "meaning_change_claimed": False,
        },
        "boundary": {
            "authority_effect": "none",
            "operation_effect": "none",
            "formal_four_way_status": "not_established",
            "canonical_l4_l9_edited": False,
            "authentication_authorization_credentials_production_external_action_touched": False,
            "legacy_runtime_test_ci_or_algorithm_run": False,
        },
        "result": "PASS" if not failures else "FAIL",
        "failures": failures,
    }


if __name__ == "__main__":
    report = run()
    sys.stdout.write(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
    raise SystemExit(0 if report["result"] == "PASS" else 1)

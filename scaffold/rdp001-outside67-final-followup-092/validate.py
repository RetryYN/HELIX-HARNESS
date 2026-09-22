#!/usr/bin/env python3
"""Validate the final 048/049/050/051/053 static outside67 evidence bundle."""

from __future__ import annotations

import argparse
import difflib
import hashlib
import json
import subprocess
import sys
from pathlib import Path


FOUR = ["HELIX-HARNESS", "HELIX-OS", "HELIX-Web", "HELIX-Web-OS"]
IDS = [
    "OUTSIDE67-PATH-048",
    "OUTSIDE67-PATH-049",
    "OUTSIDE67-PATH-050",
    "OUTSIDE67-PATH-051",
    "OUTSIDE67-PATH-053",
]
PRE = "2d4991042be55268bac30a8bbcdac45b3865030a"
ARCH = "064280b5c1c5c98f949e6e3be5ef87cbe4a4b658"
HEAD = "36accee66242338ded01dcc24d44148faadd3045"
PREVIOUS_HEAD = "15c2a145c06aedb4e1a081e288e5b302dc4182cf"
BASE_DRIFT_REASON = "#2039 exact reviewed HEAD ad11da4 was merged into main at 36accee; this final bundle was rebaselined onto that merge HEAD. If the reviewed parent lineage changes before push, stop and rebaseline."
UNEXPLORED_SCOPE = "all outside67 path_revision_pair not in the existing 62 or this five-source research set; formal requirement and product accounting remain outside this path research"
BATCH_WIDTH_POLICY = "width 5 is the observed verification width for this bundle; no safe batch upper bound is asserted; a later batch requires independent source-chain review from then-current origin/main"
WORKTREE_PROVENANCE = "/home/tenni/HELIX-HARNESS-outside-final-next5"
HOLDING = "docs/governance/pre-isolation-outside-holding-67-source-holding.jsonl"
REGISTER = "docs/governance/management-provisional-requirement-register.jsonl"
LEDGERS = [
    "docs/governance/legacy-asset-disposition.jsonl",
    "docs/governance/legacy-asset-decisions.jsonl",
    "docs/governance/legacy-asset-copy-read-after.jsonl",
    "docs/governance/legacy-asset-decision-log.md",
    "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl",
    "docs/governance/legacy-requirement-implementation-crosswalk-bootstrap.jsonl",
    "docs/governance/legacy-ir-product-unit-decomposition-bootstrap.jsonl",
]
SOURCE = {
    "OUTSIDE67-PATH-048": "docs/governance/audits/l2-requirements/pillar-target-crosswalk.md",
    "OUTSIDE67-PATH-049": "docs/governance/audits/l2-requirements/product-requirement-placement-audit-2026-09-14.md",
    "OUTSIDE67-PATH-050": "docs/governance/audits/l2-requirements/refinement-target-crosswalk.md",
    "OUTSIDE67-PATH-051": "docs/governance/audits/l2-requirements/requirements-v1.3-target-crosswalk.md",
    "OUTSIDE67-PATH-053": "docs/governance/candidates/helix-concept-v4.1.md",
}
COUNTERPART = {
    "OUTSIDE67-PATH-048": "docs/governance/audits/source-rebaseline/pillar-target-crosswalk.md",
    "OUTSIDE67-PATH-049": "docs/governance/audits/source-rebaseline/product-requirement-placement-audit-2026-09-14.md",
    "OUTSIDE67-PATH-050": "docs/governance/audits/source-rebaseline/refinement-target-crosswalk.md",
    "OUTSIDE67-PATH-051": "docs/governance/audits/source-rebaseline/requirements-v1.3-target-crosswalk.md",
    "OUTSIDE67-PATH-053": "docs/concept/helix-concept-v4.1.md",
}
ANCHOR_LINES = {
    "OUTSIDE67-PATH-048": [3, 7, 11, 14, 25],
    "OUTSIDE67-PATH-049": [3, 14, 21, 30, 42],
    "OUTSIDE67-PATH-050": [3, 6, 25, 31, 36],
    "OUTSIDE67-PATH-051": [3, 7, 13, 25, 38],
    "OUTSIDE67-PATH-053": [3, 5, 23, 37, 62],
}
ROOT_KEYS = {
    "schema", "candidate_id", "status", "authority_effect", "meaning_change_applied",
    "successor_requirement_ids", "human_decision_ref", "formal_register_append",
    "old_runtime_test_ci_execution", "scope", "source_holding", "selection",
    "classification_basis", "four_products", "documents", "product_unit_count",
    "product_unit_ids", "unknown_counts", "source_diffs", "evidence_scan",
    "prohibited_inference", "findings", "unresolved_questions", "verification_scope",
}
SCOPE_KEYS = {
    "worktree", "base_origin_main", "base_origin_main_expected_before_fetch", "base_drift_observed",
    "base_drift_from", "base_drift_to", "base_drift_reason", "read_only", "static_only",
    "holding_registration_id", "holding_path", "holding_sha256", "holding_path_revision_pair_denominator",
    "holding_record_count", "current_live_source_holding_count", "management_register_path",
    "management_register_sha256", "existing_reviewed_ids", "remaining_before_candidate_selection",
    "candidate_ids", "candidate_count", "remaining_after_candidate_selection", "accounting_status",
    "unexplored_scope", "pre_isolation_commit", "archive_commit", "historical_capture_commit",
    "source_unit", "requirement_atoms_are_not_path_pairs", "batch_width_observed", "batch_width_policy",
    "origin_main_rebaseline_required_after_2016_merge", "parent_pr_number", "parent_branch", "parent_exact_head",
    "parent_head_change_stop_condition", "parent_merged_main_head", "binding_reservation", "binding_registration_status",
}
UNIT_KEYS = {
    "authority_effect", "candidate_kind", "candidate_product", "consumer_status",
    "current_degradation_status", "current_implementation_status", "decision_status",
    "degradation_status", "diff_observation", "failure_status", "implementation_status",
    "inference_status", "legacy_degradation_status", "legacy_implementation_status",
    "meaning_change_applied", "normalized_statement", "phase_candidate", "phase_status",
    "product_candidates", "product_status", "retained_meaning", "selection_reason",
    "semantic_fields", "source_anchor", "source_fragment", "source_item_id", "source_path",
    "source_support", "successor_requirement_ids", "unit_id", "unresolved_questions",
}
ITEM_KEYS = {
    "archive_counterpart", "archive_revision", "artifact_kind", "candidate_phase", "candidate_product",
    "legacy_evidence", "phase_status", "pre_isolation", "product_candidates", "product_status",
    "reported_holding", "source_item_id", "source_path", "source_unit", "status",
}
ANCHOR_KEYS = {"commit", "line", "line_sha256", "source_fragment"}
NORM_KEYS = {"source_ref", "status", "text"}
RETAINED_KEYS = {"items", "source_ref", "status"}
UNRESOLVED_KEYS = {"items", "scope", "status"}
DIFF_KEYS = {"source_ref", "status", "text"}
SEMANTIC_FIELDS = {key: "unresolved" for key in ["action", "actor", "condition", "guard", "sequence"]}
UNRESOLVED_ITEMS = [
    "composite_line_decomposition", "product_boundary_owner", "phase_authority", "implementation",
    "degradation", "failure", "consumer", "decision", "current_counterpart_relation",
]
SELECTION_REASON = (
    "旧source／判断史／failure／consumer境界に関係するlineを静的保持する。"
    "fragment外のactor/action/condition/guard/sequence、正式要求identity、owner、phase authority、"
    "implementation、degradation、failure、consumer、decisionのclosureを生成しない。"
)
KINDS = {
    "OUTSIDE67-PATH-048": ["pillar_crosswalk_date_boundary", "pillar_crosswalk_scope_boundary", "pillar_crosswalk_harness_boundary", "pillar_crosswalk_pair_boundary", "pillar_crosswalk_gap_boundary"],
    "OUTSIDE67-PATH-049": ["placement_audit_date_boundary", "placement_audit_owner_boundary", "placement_audit_result_boundary", "placement_audit_webos_boundary", "placement_audit_closure_boundary"],
    "OUTSIDE67-PATH-050": ["refinement_crosswalk_source_boundary", "refinement_crosswalk_digest_boundary", "refinement_crosswalk_approval_boundary", "refinement_crosswalk_authority_boundary", "refinement_crosswalk_json_boundary"],
    "OUTSIDE67-PATH-051": ["requirements_crosswalk_date_boundary", "requirements_crosswalk_scope_boundary", "requirements_crosswalk_measurement_boundary", "requirements_crosswalk_legacy_boundary", "requirements_crosswalk_split_boundary"],
    "OUTSIDE67-PATH-053": ["concept_candidate_version_boundary", "concept_candidate_authority_boundary", "concept_candidate_definition_boundary", "concept_candidate_product_boundary", "concept_candidate_vocabulary_boundary"],
}


def digest(value: bytes | str | Path) -> str:
    if isinstance(value, Path):
        value = value.read_bytes()
    if isinstance(value, str):
        value = value.encode()
    return hashlib.sha256(value).hexdigest()


def git_blob(root: Path, commit: str, path: str) -> bytes:
    return subprocess.check_output(["git", "-C", str(root), "show", f"{commit}:{path}"])


def load(path: Path, errors: list[str], code: str):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception as exc:  # pragma: no cover - reported as evidence failure
        errors.append(f"{code}:{exc}")
        return None


def load_lines(path: Path, errors: list[str], code: str):
    try:
        return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines()]
    except Exception as exc:  # pragma: no cover - reported as evidence failure
        errors.append(f"{code}:{exc}")
        return []


def fail(errors: list[str], code: str, condition: bool) -> None:
    if condition:
        errors.append(code)


def validate(root_arg: str | None) -> list[str]:
    root = Path(root_arg or Path(__file__).resolve().parents[2]).resolve()
    out = root / "scaffold/rdp001-outside67-final-followup-092"
    errors: list[str] = []
    inventory = load(out / "inventory.json", errors, "E_INVENTORY")
    if not isinstance(inventory, dict):
        return errors
    fail(errors, "E_ROOT_KEYS", set(inventory) != ROOT_KEYS)
    fail(errors, "E_ID", inventory.get("candidate_id") != "RDP-001-OUTSIDE67-FINAL-FOLLOWUP-048-049-050-051-053")
    fail(errors, "E_AUTHORITY", inventory.get("status") != "findings_only" or inventory.get("authority_effect") != "none" or inventory.get("meaning_change_applied") is not False or inventory.get("old_runtime_test_ci_execution") is not False)
    scope = inventory.get("scope", {})
    fail(errors, "E_SCOPE_KEYS", set(scope) != SCOPE_KEYS)
    expected_scope = {
        "base_origin_main": HEAD,
        "base_origin_main_expected_before_fetch": PREVIOUS_HEAD,
        "base_drift_observed": True,
        "base_drift_from": PREVIOUS_HEAD,
        "base_drift_to": HEAD,
        "base_drift_reason": BASE_DRIFT_REASON,
        "read_only": True,
        "static_only": True,
        "holding_registration_id": "MPR-SH-OUTSIDE67-001",
        "holding_path": HOLDING,
        "holding_path_revision_pair_denominator": 67,
        "holding_record_count": 67,
        "current_live_source_holding_count": 14,
        "management_register_path": REGISTER,
        "remaining_before_candidate_selection": 5,
        "candidate_ids": IDS,
        "candidate_count": 5,
        "remaining_after_candidate_selection": 0,
        "accounting_status": "provisional_67_of_67_research_no_formal_holding_admission",
        "unexplored_scope": UNEXPLORED_SCOPE,
        "pre_isolation_commit": PRE,
        "archive_commit": ARCH,
        "historical_capture_commit": "3df81ad27157c471e004083783f37a5860eaa2ee",
        "source_unit": "path_revision_pair",
        "requirement_atoms_are_not_path_pairs": True,
        "batch_width_observed": 5,
        "batch_width_policy": BATCH_WIDTH_POLICY,
        "origin_main_rebaseline_required_after_2016_merge": False,
        "parent_pr_number": 2039,
        "parent_branch": "research/outside67-next5-residual-090",
        "parent_exact_head": "ad11da4a854e1a25a1cb0663450d54cce0e8684c",
        "parent_merged_main_head": HEAD,
        "parent_head_change_stop_condition": "if reviewed parent HEAD differs from ad11da4 before merge, or merged main HEAD differs from parent_merged_main_head before push, stop and rebaseline",
        "binding_reservation": "SCF-B-0092",
        "binding_registration_status": "registered",
    }
    fail(errors, "E_SCOPE_WORKTREE", scope.get("worktree") != WORKTREE_PROVENANCE)
    for key, value in expected_scope.items():
        fail(errors, f"E_SCOPE:{key}", scope.get(key) != value)
    fail(errors, "E_SCOPE_DIGEST", scope.get("holding_sha256") != digest(root / HOLDING) or scope.get("management_register_sha256") != digest(root / REGISTER))
    fail(errors, "E_BASE_ANCESTOR", subprocess.run(["git", "-C", str(root), "merge-base", "--is-ancestor", HEAD, "HEAD"], stderr=subprocess.DEVNULL).returncode != 0)

    holding = load_lines(root / HOLDING, errors, "E_HOLDING")
    by_id = {row.get("source_item_id"): row for row in holding}
    fail(errors, "E_HOLDING_COUNT", len(holding) != 67)
    previous = load(root / "scaffold/rdp001-outside67-residual-followup-090/inventory.json", errors, "E_PREVIOUS") or {}
    expected_existing = previous.get("scope", {}).get("existing_reviewed_ids", []) + previous.get("scope", {}).get("candidate_ids", [])
    fail(errors, "E_PREVIOUS_ACCOUNTING", len(expected_existing) != 62 or set(expected_existing) & set(IDS) or scope.get("existing_reviewed_ids") != expected_existing)
    fail(errors, "E_NONOVERLAP", set(IDS) & set(expected_existing) or len(set(IDS)) != 5)
    fail(errors, "E_RESIDUAL", set(IDS) & {row.get("source_item_id") for row in holding if row.get("source_item_id") not in expected_existing} != set(IDS))
    selection = inventory.get("selection", {})
    fail(errors, "E_SELECTION", selection.get("candidate_ids") != IDS or selection.get("excluded_existing_ids") != expected_existing)

    selected = load_lines(out / "selected-source-items.jsonl", errors, "E_SELECTED")
    fail(errors, "E_SELECTED_ORDER", [row.get("source_item_id") for row in selected] != IDS)
    current_bytes = {}
    source_diffs = load(out / "source-diffs.json", errors, "E_DIFFS") or {}
    diff_by_id = {row.get("source_item_id"): row for row in source_diffs.get("items", [])}
    for item in selected:
        sid = item.get("source_item_id")
        fail(errors, f"E_ITEM_KEYS:{sid}", set(item) != ITEM_KEYS)
        fail(errors, f"E_ITEM_ID:{sid}", sid not in IDS or item.get("source_path") != SOURCE.get(sid) or sid in expected_existing)
        row = by_id.get(sid, {})
        fail(errors, f"E_HOLDING:{sid}", row.get("semantic_disposition") != "not_started" or row.get("legacy_catalog_record_count") != 0 or row.get("human_decision_ref") is not None)
        current_bytes[sid] = git_blob(root, HEAD, COUNTERPART[sid])
        counterpart = item.get("archive_counterpart", {})
        current_hash_equal = current_bytes[sid] == git_blob(root, ARCH, SOURCE[sid])
        fail(errors, f"E_COUNTERPART:{sid}", counterpart.get("path") != COUNTERPART.get(sid) or counterpart.get("bytes") != len(current_bytes[sid]) or counterpart.get("sha256") != digest(current_bytes[sid]) or counterpart.get("content_hash_matches_archive") is not current_hash_equal)
        fail(errors, f"E_REVISION:{sid}", item.get("pre_isolation", {}).get("commit") != PRE or item.get("archive_revision", {}).get("commit") != ARCH)
        for side, commit, filename in [("pre_isolation", PRE, "pre-isolation.md"), ("archive_revision", ARCH, "archive-revision.md")]:
            actual = git_blob(root, commit, SOURCE[sid])
            stored = out / "source-snapshots" / sid / filename
            fail(errors, f"E_SNAPSHOT:{sid}:{side}", not stored.is_file() or stored.read_bytes() != actual)
            recorded = item.get(side, {})
            fail(errors, f"E_SOURCE_RECEIPT:{sid}:{side}", recorded.get("sha256") != digest(actual) or recorded.get("bytes") != len(actual) or recorded.get("blob_oid") != subprocess.check_output(["git", "-C", str(root), "rev-parse", f"{commit}:{SOURCE[sid]}"], text=True).strip())
        d = diff_by_id.get(sid, {})
        pre = git_blob(root, PRE, SOURCE[sid])
        archive = git_blob(root, ARCH, SOURCE[sid])
        unified = "".join(difflib.unified_diff(pre.decode().splitlines(True), archive.decode().splitlines(True), fromfile="pre-isolation", tofile="archive-revision", n=3))
        fail(errors, f"E_DIFF:{sid}", d.get("pre_sha256") != digest(pre) or d.get("archive_sha256") != digest(archive) or d.get("unified_diff") != unified or d.get("status") != ("same" if pre == archive else "different"))

    units = load_lines(out / "product-units.jsonl", errors, "E_UNITS")
    fail(errors, "E_UNIT_COUNT", len(units) != 25)
    seen_anchors: set[tuple[str, int]] = set()
    for unit in units:
        uid = unit.get("unit_id")
        sid = unit.get("source_item_id")
        fail(errors, f"E_UNIT_KEYS:{uid}", set(unit) != UNIT_KEYS)
        unit_number = int(uid.rsplit("-U", 1)[1]) if isinstance(uid, str) and "-U" in uid else 0
        fail(errors, f"E_UNIT_BOUNDARY:{uid}", sid not in IDS or unit.get("source_path") != SOURCE.get(sid) or unit.get("candidate_product") != "shared-cross-product" or unit.get("phase_candidate") != "upstream-governance-or-crosswalk" or unit.get("product_candidates") != FOUR or unit.get("source_support") != "exact_line_anchor_only" or unit.get("inference_status") != "none" or unit.get("authority_effect") != "none" or unit.get("meaning_change_applied") is not False or unit.get("successor_requirement_ids") != [] or unit.get("phase_status") != "unknown_path_based_candidate_only" or unit.get("product_status") != "unknown_path_based_candidate_only" or unit_number < 1 or unit_number > 5 or unit.get("candidate_kind") != KINDS.get(sid, [None] * 5)[unit_number - 1] or unit.get("selection_reason") != SELECTION_REASON)
        fail(errors, f"E_UNIT_UNKNOWN:{uid}", any(unit.get(key) != "unknown" for key in ["implementation_status", "current_implementation_status", "legacy_implementation_status", "degradation_status", "current_degradation_status", "legacy_degradation_status", "failure_status", "consumer_status", "decision_status"]))
        fail(errors, f"E_UNIT_SEMANTIC:{uid}", unit.get("semantic_fields") != SEMANTIC_FIELDS)
        fail(errors, f"E_UNIT_NESTED_KEYS:{uid}", set(unit.get("normalized_statement", {})) != NORM_KEYS or set(unit.get("retained_meaning", {})) != RETAINED_KEYS or set(unit.get("unresolved_questions", {})) != UNRESOLVED_KEYS or set(unit.get("diff_observation", {})) != DIFF_KEYS)
        expected_pre_archive = "same" if sid in SOURCE and git_blob(root, PRE, SOURCE[sid]) == git_blob(root, ARCH, SOURCE[sid]) else "different"
        fail(errors, f"E_UNIT_CANONICAL:{uid}", unit.get("normalized_statement", {}).get("source_ref") != "source_fragment" or unit.get("normalized_statement", {}).get("status") != "source_supported_exact_fragment" or unit.get("normalized_statement", {}).get("text") != unit.get("source_fragment") or unit.get("retained_meaning", {}).get("source_ref") != "source_fragment" or unit.get("retained_meaning", {}).get("status") != "preserved_source_meaning" or unit.get("retained_meaning", {}).get("items") != [unit.get("source_fragment")] or unit.get("unresolved_questions") != {"items": UNRESOLVED_ITEMS, "scope": "unit", "status": "open_unknowns"} or unit.get("diff_observation", {}).get("source_ref") != "source-diffs.json" or unit.get("diff_observation", {}).get("status") != expected_pre_archive or unit.get("diff_observation", {}).get("text") != "pre/archive relation is retained as a byte-level observation; no semantic equivalence is inferred")
        anchor = unit.get("source_anchor", {})
        fail(errors, f"E_ANCHOR_ROOT:{uid}", set(anchor) != {"pre_isolation", "archive"})
        pre_anchor = anchor.get("pre_isolation", {})
        archive_anchor = anchor.get("archive", {})
        fail(errors, f"E_ANCHOR_KEYS:{uid}", set(pre_anchor) != ANCHOR_KEYS or set(archive_anchor) != ANCHOR_KEYS)
        if set(pre_anchor) == ANCHOR_KEYS and sid in SOURCE:
            pre_lines = git_blob(root, PRE, SOURCE[sid]).decode().splitlines()
            archive_lines = git_blob(root, ARCH, SOURCE[sid]).decode().splitlines()
            line = pre_anchor.get("line")
            archive_line = archive_anchor.get("line")
            fail(errors, f"E_ANCHOR:{uid}", not isinstance(line, int) or line not in ANCHOR_LINES[sid] or pre_lines[line - 1] != pre_anchor.get("source_fragment") or digest(pre_anchor.get("source_fragment", "")) != pre_anchor.get("line_sha256") or pre_anchor.get("commit") != PRE or archive_line != line or archive_lines[archive_line - 1] != archive_anchor.get("source_fragment") or digest(archive_anchor.get("source_fragment", "")) != archive_anchor.get("line_sha256") or archive_anchor.get("commit") != ARCH)
            key = (sid, line)
            fail(errors, f"E_DUP_ANCHOR:{uid}", key in seen_anchors)
            seen_anchors.add(key)
            fail(errors, f"E_FRAGMENT:{uid}", unit.get("source_fragment") != pre_anchor.get("source_fragment") or unit.get("normalized_statement", {}).get("text") != unit.get("source_fragment") or unit.get("retained_meaning", {}).get("items") != [unit.get("source_fragment")])

    fail(errors, "E_UNIT_IDS", inventory.get("product_unit_count") != 25 or inventory.get("product_unit_ids") != [unit.get("unit_id") for unit in units] or len({unit.get("unit_id") for unit in units}) != 25)
    fail(errors, "E_PRODUCTS", inventory.get("four_products") != [{"product": product, "status": "candidate_boundary_only", "authority_effect": "none"} for product in FOUR])
    fail(errors, "E_DOCUMENTS", [item.get("source_item_id") for item in inventory.get("documents", [])] != IDS or any(item.get("current_counterpart_path") != COUNTERPART.get(item.get("source_item_id")) for item in inventory.get("documents", [])))

    scan = load(out / "evidence-scan.json", errors, "E_SCAN") or {}
    fail(errors, "E_SCAN_IDS", scan.get("selected_ids") != IDS or scan.get("existing_reviewed_ids") != expected_existing)
    exact_hits = scan.get("exact_ledger_hits", {})
    fail(errors, "E_SCAN_HITS", exact_hits != {sid: [] for sid in IDS})
    expected_equal = [sid for sid in IDS if current_bytes.get(sid, b"") == git_blob(root, ARCH, SOURCE[sid])]
    expected_drift = [sid for sid in IDS if sid not in expected_equal]
    fail(errors, "E_SCAN_RELATION", scan.get("current_counterpart_relocation_ids") != IDS or scan.get("archive_relocation_ids") != IDS or scan.get("current_counterpart_hash_equal_archive_ids") != expected_equal or scan.get("current_counterpart_content_drift_ids") != expected_drift or scan.get("current_counterpart_drift_ids") != expected_drift)
    for ledger in LEDGERS:
        text = (root / ledger).read_text(encoding="utf-8", errors="replace")
        fail(errors, f"E_LEDGER_DIGEST:{ledger}", scan.get("files", {}).get(ledger, {}).get("sha256") != digest(text))
        fail(errors, f"E_LEDGER_SCAN:{ledger}", any(token in text for token in IDS + list(SOURCE.values())))

    fail(errors, "E_UNKNOWN_COUNTS", inventory.get("unknown_counts") != {key: 5 for key in ["implementation", "degradation", "failure", "consumer", "decision", "phase", "authority", "legacy_implementation", "current_implementation", "legacy_degradation", "current_degradation"]})
    meta = load(out / "meta.json", errors, "E_META") or {}
    fail(errors, "E_META", meta.get("binding_reservation") != "SCF-B-0092" or meta.get("base_origin_main") != HEAD or meta.get("combined_count") != 67 or meta.get("remaining_after_research") != 0 or meta.get("anchor_count") != 25 or meta.get("old_runtime_test_ci_execution") is not False or meta.get("authority_effect") != "none")
    ledger = load(out / "ledger.json", errors, "E_LEDGER") or {}
    fail(errors, "E_LEDGER", ledger.get("selected_ids") != IDS or ledger.get("selected_source_count") != 5 or ledger.get("product_unit_candidate_count") != 25 or ledger.get("source_anchor_count") != 25 or ledger.get("exact_ledger_hit_count") != 0 or ledger.get("formal_admission") is not False)
    return errors


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root")
    args = parser.parse_args()
    errors = validate(args.root)
    if errors:
        print("FAIL outside67 final follow-up validator\n" + "\n".join(errors))
        return 1
    print("PASS outside67 final follow-up validator: 5 source pairs / 25 exact anchors / provisional 67-of-67 static-only")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

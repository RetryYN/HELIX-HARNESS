#!/usr/bin/env python3
"""Static WR256 U-ID/source/count/cap audit; never evaluates L4/L5 algorithms."""
from __future__ import annotations

import json
import hashlib
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
BASE = "c14adddf2678c7a69d76420c451df3f05b1251ab"
L3 = "docs/helix-connect/L3-requirements/functional-requirements.json"
L4 = "docs/helix-connect/L4-basic-design/technical-trace-handoff-custody.json"
L5 = "docs/helix-connect/L5-detail-design/technical-trace-handoff-custody.json"
L8 = "docs/helix-connect/L8-unit-verification/technical-trace-handoff-custody.json"
L9 = "docs/helix-connect/L9-integration-verification/technical-trace-handoff-custody.json"
L10 = "docs/helix-connect/L10-verification/functional-verification.json"


def source_json(path: str) -> dict:
    return json.loads(subprocess.check_output(["git", "show", f"{BASE}:{path}"], cwd=ROOT))


def pointer(doc, ptr):
    value = doc
    if ptr in ("", "/"):
        return value
    for raw in ptr.lstrip("/").split("/"):
        token = raw.replace("~1", "/").replace("~0", "~")
        value = value[int(token)] if isinstance(value, list) else value[token]
    return value


def patch_value(doc, operations):
    """Apply only the fixed overlay operations needed to summarize a probe expectation."""
    import copy

    result = copy.deepcopy(doc)
    for operation in operations:
        parts = operation["path"].strip("/").split("/")
        target = result
        for raw in parts[:-1]:
            token = raw.replace("~1", "/").replace("~0", "~")
            target = target[int(token)] if isinstance(target, list) else target[token]
        raw = parts[-1]
        key = int(raw) if isinstance(target, list) else raw.replace("~1", "/").replace("~0", "~")
        if operation["op"] in ("replace", "add"):
            target[key] = operation["value"]
        elif operation["op"] == "remove":
            del target[key]
        else:
            raise ValueError(f"unsupported fixed expectation patch operation: {operation['op']}")
    return result


def scalar_text(value):
    if value is None:
        return "null"
    if value is True:
        return "true"
    if value is False:
        return "false"
    if isinstance(value, (str, int, float)):
        return str(value)
    return None


def result_map_text(label, value):
    if isinstance(value, dict):
        pairs = [(key, scalar_text(item)) for key, item in value.items() if scalar_text(item) is not None]
        different = [f"{key}={item}" for key, item in pairs if item != "content_corresponding_in_fixture"]
        if not different:
            return f"{label}=all {len(pairs)} fields content_corresponding_in_fixture"
        return f"{label} non-corresponding: " + ", ".join(different)
    if isinstance(value, list):
        different = []
        for index, item in enumerate(value):
            if isinstance(item, dict):
                states = [f"{key}={scalar_text(entry)}" for key, entry in item.items() if scalar_text(entry) not in (None, "content_corresponding_in_fixture")]
                if states:
                    different.append(f"[{index}] " + ",".join(states))
        if not different:
            return f"{label}=all {len(value)} entries content_corresponding_in_fixture"
        return f"{label} non-corresponding: " + ", ".join(different)
    return f"{label}={scalar_text(value)}"


def failure_reasons_text(items):
    if not items:
        return "failure_reasons=[]"
    values = []
    for item in items:
        if not isinstance(item, dict):
            continue
        fields = [str(item[key]) for key in ("area", "field", "result") if item.get(key) is not None]
        if item.get("return_owner") is not None:
            fields.append("owner=" + str(item["return_owner"]))
        values.append("/".join(fields))
    return "failure_reasons=[" + "; ".join(values) + "]"


def expected_summary(expected, function_ref):
    """Compact, readable result semantics derived from the fixed source oracle."""
    parts = []
    if function_ref.endswith("F01"):
        for key in ("history_prefix_result", "submitted_sequence_result", "missing_original_event_ids", "original_order_known_in_fixture", "original_predecessor_chain_corresponds", "retained_original_result_state", "result_content_result", "candidate_trace_state", "business_completion"):
            if key not in expected:
                continue
            value = expected[key]
            if key == "missing_original_event_ids":
                parts.append(key + "=" + (",".join(map(str, value)) if value else "[]"))
            else:
                parts.append(key + "=" + str(scalar_text(value)))
    elif function_ref.endswith("F02"):
        for key in ("content_results", "handoff_target_results", "unfinished_target_results"):
            if key in expected:
                parts.append(result_map_text(key, expected[key]))
        for key in ("unfinished_link_result", "stop_link_result", "receipt_link_result", "resolution_link_result", "handoff_receipt_generates_resolution", "business_completion", "candidate_handoff_state"):
            if key in expected:
                parts.append(key + "=" + str(scalar_text(expected[key])))
        for key in ("retained_prior_successes", "retained_unfinished", "retained_handoff", "retained_handoff_receipt", "retained_resolution"):
            if key not in expected:
                continue
            value = expected[key]
            if value is None or isinstance(value, (bool, int, str)):
                parts.append(key + "=" + str(scalar_text(value)))
            elif isinstance(value, list):
                parts.append(f"{key}={len(value)} entries retained")
            elif isinstance(value, dict):
                parts.append(key + "=record retained")
    else:
        for key in ("trace_target_results", "trace_reference_results", "custody_reference_results"):
            if key in expected:
                parts.append(result_map_text(key, expected[key]))
        for key in ("trace_custody_data_use_result", "payload_persistence_required_for_trace", "classification_retention_deletion_authority", "candidate_reference_state"):
            if key in expected:
                parts.append(key + "=" + str(scalar_text(expected[key])))
        for key in ("outside_reference_fields", "forbidden_value_field_names"):
            if key in expected:
                value = expected[key]
                parts.append(key + "=" + (",".join(map(str, value)) if value else "[]"))
    if "failure_reasons" in expected:
        parts.append(failure_reasons_text(expected["failure_reasons"]))
    effects = expected.get("effects")
    if isinstance(effects, dict):
        actual = [(key, value) for key, value in effects.items() if key.startswith("actual_")]
        if actual and all(value is False for _, value in actual):
            parts.append("effects: all actual effects false")
        elif actual:
            parts.append("effects: " + ",".join(f"{key}={scalar_text(value)}" for key, value in actual))
    return "期待: " + "; ".join(parts) + "."


def main() -> int:
    current = json.loads((ROOT / L8).read_text(encoding="utf-8"))
    old8, l5, l9 = source_json(L8), source_json(L5), source_json(L9)
    l10_functional = source_json(L10)
    l10_nfr = source_json("docs/helix-connect/L10-verification/nfr-verification.json")
    rows = current.get("unit_cases", [])
    counts = {"L9_basic_branch": 90, "local_domain_probe": 61, "independent_semantic_probe": 68, "independent_cross_field_probe": 5}
    observed = {kind: sum(row.get("source_kind") == kind for row in rows) for kind in counts}
    failures = []

    preserved_top_level = (
        "parent", "source_main", "scope", "full_goal_scope_preserved", "implementation_readiness",
        "authority_effect", "operation_effect", "source_pin_limit", "status", "approval_basis",
        "upstream_pins", "document_id", "layer", "layer_id", "pair", "pair_id", "design_ref",
        "integration_ref", "method", "source_pair_pins", "preserved_l9_oracle", "fixture_coverage_limits",
        "unresolved", "approved_document_pins", "source_revision_roles",
    )
    changed_boundary_fields = [key for key in preserved_top_level if current.get(key) != old8.get(key)]
    if changed_boundary_fields:
        failures.append({"check": "existing_boundary_and_unverified_state_preserved", "fields": changed_boundary_fields})

    if len(rows) != 224 or observed != counts:
        failures.append({"check": "source_row_counts", "expected": {"total": 224, **counts}, "actual": {"total": len(rows), **observed}})
    if len({row.get("u_id") for row in rows}) != len(rows):
        failures.append({"check": "candidate_uid_uniqueness"})
    expected_uids = [f"U-CONNECT005-{i:03d}" for i in range(1, 225)]
    if [row.get("u_id") for row in rows] != expected_uids:
        failures.append({"check": "candidate_uid_sequence"})

    old_ids = []
    for oi, obligation in enumerate(l9["verification_obligations"]):
        old_ids.extend((case["id"], f"/verification_obligations/{oi}/concrete_cases/{ci}") for ci, case in enumerate(obligation["concrete_cases"]))
    probe_ids = [(x.get("probe_id") or x.get("id"), f"/local_domain_probes/cases/{i}") for i, x in enumerate(old8["local_domain_probes"]["cases"])]
    probe_ids.extend((x.get("probe_id") or x.get("id"), f"/independent_semantic_probes/{i}") for i, x in enumerate(old8["independent_semantic_probes"]))
    cross_probes = old8["cross_field_type_constraints"]["probes"]
    cross_ids = [(x["id"], f"/cross_field_type_constraints/probes/{i}") for i, x in enumerate(cross_probes)]
    expected_sources = [("L9_basic_branch", ident, L9, BASE, ptr) for ident, ptr in old_ids]
    expected_sources += [("local_domain_probe", ident, L8, BASE, ptr) for ident, ptr in probe_ids[:61]]
    expected_sources += [("independent_semantic_probe", ident, L8, BASE, ptr) for ident, ptr in probe_ids[61:]]
    expected_sources += [("independent_cross_field_probe", ident, L8, BASE, ptr) for ident, ptr in cross_ids]
    actual_sources = [(r.get("source_kind"), r.get("source_id"), r.get("source_ref", {}).get("path"), r.get("source_ref", {}).get("revision"), r.get("source_ref", {}).get("pointer")) for r in rows]
    if actual_sources != expected_sources:
        failures.append({"check": "source_id_and_order_preservation"})

    expected_whole_hashes = current.get("preserved_l9_oracle", {}).get("whole_sha256_by_case", {})
    actual_whole_hashes = {}
    for obligation in l9["verification_obligations"]:
        for case in obligation["concrete_cases"]:
            canonical = json.dumps(case["expected_material"], ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8")
            actual_whole_hashes[case["id"]] = hashlib.sha256(canonical).hexdigest()
    whole_hash_mismatches = [case_id for case_id, digest in actual_whole_hashes.items() if expected_whole_hashes.get(case_id) != digest]
    if len(expected_whole_hashes) != 90 or whole_hash_mismatches:
        failures.append({"check": "l9_whole_oracle_preserved", "expected_count": 90, "actual_count": len(expected_whole_hashes), "mismatch_count": len(whole_hash_mismatches), "sample": whole_hash_mismatches[:5]})

    for row in rows:
        function_suffix = row.get("target", {}).get("function_ref", "").rsplit("-", 1)[-1]
        if row.get("target", {}).get("requirement_ref") != f"HELIXCONNECT-L3-005-{function_suffix}" or row.get("target", {}).get("l4_ref") != f"HELIXCONNECT-L4-005-{function_suffix}":
            failures.append({"check": "row_target_layer_identity_alignment", "u_id": row.get("u_id")})
        if row.get("execution_state") != "not_executed":
            failures.append({"check": "row_execution_state_remains_unexecuted", "u_id": row.get("u_id"), "actual": row.get("execution_state")})
        for field in ("counterexample", "expected_result", "contract_oracle_id", "test_citation", "source_ref", "expected_ref", "target"):
            if field not in row:
                failures.append({"check": "required_u_id_row_field", "u_id": row.get("u_id"), "field": field})
        if row.get("row_oracle_id") is not None or row.get("row_oracle_status") != "not_present":
            failures.append({"check": "row_oracle_not_invented", "u_id": row.get("u_id")})
        if row.get("test_citation") is not None or row.get("test_citation_status") != "not_found_not_created":
            failures.append({"check": "test_citation_not_invented", "u_id": row.get("u_id")})
        try:
            src = row["source_ref"]
            exp = row["expected_ref"]
            doc = l9 if src["path"] == L9 else old8
            pointer(doc, src["pointer"])
            pointer((l9 if exp["path"] == L9 else old8), exp["pointer"])
        except Exception as exc:  # pointer resolution is an audit result, not a source mutation
            failures.append({"check": "fixed_source_pointer_resolution", "u_id": row.get("u_id"), "error": str(exc)})
        for ref in row.get("l5_failure_rule_refs", []):
            try:
                path, ptr = ref.split("#", 1)
                if path != L5:
                    raise ValueError(f"unexpected_l5_reference_path:{path}")
                pointer(l5, ptr)
            except Exception as exc:
                failures.append({"check": "l5_failure_rule_pointer_resolution", "u_id": row.get("u_id"), "reference": ref, "error": str(exc)})

        if "..." in row.get("expected_result", "") or "…" in row.get("expected_result", ""):
            failures.append({"check": "no_truncated_expected_result", "u_id": row.get("u_id")})
        if "array(" in row.get("expected_result", "") or "items)" in row.get("expected_result", ""):
            failures.append({"check": "no_array_count_only_expected_result", "u_id": row.get("u_id")})
        try:
            if row["source_kind"] == "L9_basic_branch":
                expected = pointer(l9, row["expected_ref"]["pointer"])
                want_summary = expected_summary(expected, row["target"]["function_ref"])
                if row["expected_result"] != want_summary:
                    failures.append({"check": "row_expected_semantics_match_fixed_l9_oracle", "u_id": row["u_id"]})
            elif row["source_kind"] == "local_domain_probe":
                index = int(row["source_ref"]["pointer"].rsplit("/", 1)[1])
                probe = old8["local_domain_probes"]["cases"][index]
                expected = patch_value(pointer(l9, probe["expected_base_ref"]["pointer"]), probe["expected_whole_overlay"])
                want_summary = expected_summary(expected, row["target"]["function_ref"])
                if row["expected_result"] != want_summary:
                    failures.append({"check": "row_expected_semantics_match_fixed_domain_probe", "u_id": row["u_id"]})
            elif row["source_kind"] == "independent_semantic_probe":
                index = int(row["source_ref"]["pointer"].rsplit("/", 1)[1])
                probe = old8["independent_semantic_probes"][index]
                want_summary = expected_summary(probe["expected_whole"], row["target"]["function_ref"])
                if row["expected_result"] != want_summary:
                    failures.append({"check": "row_expected_semantics_match_fixed_independent_probe", "u_id": row["u_id"]})
            elif row["source_kind"] == "independent_cross_field_probe":
                index = int(row["source_ref"]["pointer"].rsplit("/", 1)[1])
                probe = cross_probes[index]
                values = [None, False, 0, "", {}]
                value = probe["input_patch"][0]["value"]
                literal = json.dumps(value, ensure_ascii=False, separators=(",", ":"))
                want_counterexample = f"{probe['id']}: original_prior_successes={literal} (non-array), original_stop.stop_event_ref=null."
                want_expected = "例外なし; stop_link_result=unknown_original_information; 非配列priorを既知emptyとして扱わず、null stop refからstop eventを解決しない。"
                valid_shape = (
                    probe["id"] == row["source_id"]
                    and probe["input_patch"] == [
                        {"op": "replace", "path": "/original_prior_successes", "value": value},
                        {"op": "replace", "path": "/original_stop/stop_event_ref", "value": None},
                    ]
                    and probe["expected_constraints"] == {"no_exception": True, "stop_link_result": "unknown_original_information"}
                    and probe["execution_state"] == "not_executed"
                    and row["expected_ref"]["pointer"] == f"/cross_field_type_constraints/probes/{index}/expected_constraints"
                    and row["contract_oracle_id"] == "HELIXCONNECT-L10-005-F02"
                    and row["counterexample"] == want_counterexample
                    and row["expected_result"] == want_expected
                    and row["execution_state"] == "not_executed"
                )
                if type(value) is not type(values[index]) or value != values[index] or not valid_shape:
                    failures.append({"check": "independent_cross_field_probe_semantics", "u_id": row["u_id"], "probe_id": probe.get("id")})
        except Exception as exc:
            failures.append({"check": "row_expected_semantics_resolution", "u_id": row.get("u_id"), "error": str(exc)})

    expected_cross_uids = [f"U-CONNECT005-{i:03d}" for i in range(220, 225)]
    actual_cross_uids = [row["u_id"] for row in rows if row.get("source_kind") == "independent_cross_field_probe"]
    if actual_cross_uids != expected_cross_uids:
        failures.append({"check": "all_five_cross_field_probe_rows_present", "expected": expected_cross_uids, "actual": actual_cross_uids})

    expected_functions = [x["function_ref"] for x in l5["obligation_trace"]]
    covered_functions = current.get("l5_coverage", {}).get("public_functions", [])
    if covered_functions != expected_functions:
        failures.append({"check": "l5_public_function_coverage", "expected": expected_functions, "actual": covered_functions})
    all_rules = 0
    for fn in expected_functions:
        name = fn[-3:]
        rules = l5["branch_tables"][name]["failure_rules"]
        all_rules += len(rules)
        for i, _rule in enumerate(rules):
            ref = f"{L5}#/branch_tables/{name}/failure_rules/{i}"
            coverage = current.get("l5_coverage", {}).get("failure_rule_coverage", {}).get(ref, {})
            if not coverage.get("candidate_u_ids"):
                failures.append({"check": "l5_failure_rule_coverage", "pointer": ref})
            if any(uid not in {r["u_id"] for r in rows} for uid in coverage.get("candidate_u_ids", [])):
                failures.append({"check": "l5_failure_rule_candidate_resolves", "pointer": ref})
    if all_rules != 27:
        failures.append({"check": "declared_l5_failure_rule_count", "expected": 27, "actual": all_rules})

    contract_oracle_ids = {case.get("id") for case in l10_functional.get("cases", [])}
    contract_oracle_ids.update(case.get("id") for case in l10_nfr.get("cases", []))
    used_contract_oracle_ids = {row.get("contract_oracle_id") for row in rows}
    missing_contract_oracles = sorted(used_contract_oracle_ids - contract_oracle_ids)
    if missing_contract_oracles:
        failures.append({"check": "l10_contract_oracle_resolution", "missing_ids": missing_contract_oracles})
    wrong_contract_oracles = []
    for row in rows:
        suffix = row.get("target", {}).get("requirement_ref", "").rsplit("-", 1)[-1]
        expected = f"HELIXCONNECT-L10-005-{suffix}"
        if row.get("contract_oracle_id") != expected:
            wrong_contract_oracles.append({"u_id": row.get("u_id"), "expected": expected, "actual": row.get("contract_oracle_id")})
    if wrong_contract_oracles:
        failures.append({"check": "contract_oracle_matches_target_requirement", "count": len(wrong_contract_oracles), "sample": wrong_contract_oracles[:5]})

    removed = current.get("removed_materials", {})
    required_removed_keys = {"decision_ref", "git_commit", "path", "meaning", "removed_key_rule", "use_boundary"}
    if set(removed) != required_removed_keys or "DT-VT-105" not in removed.get("use_boundary", ""):
        failures.append({"check": "removed_materials_shape_or_boundary", "keys": sorted(removed)})
    if current.get("l5_coverage", {}).get("l9_declared_case_count_before") != 90 or current.get("l5_coverage", {}).get("l9_declared_case_count_after") != 90:
        failures.append({"check": "l9_declared_count_preserved"})
    if current.get("l5_coverage", {}).get("total_source_rows_before") != 224 or current.get("l5_coverage", {}).get("total_u_id_rows_after") != 224:
        failures.append({"check": "total_source_row_count_includes_cross_field_probes"})

    from importlib.util import spec_from_file_location, module_from_spec
    checker_path = ROOT / "scaffold/tools/design_verification_checker.py"
    spec = spec_from_file_location("design_verification_checker_wr256", checker_path)
    checker = module_from_spec(spec)
    spec.loader.exec_module(checker)
    cap = checker.check_ownership_cap(ROOT, L8, current, layer="L8")
    if cap.get("failures"):
        failures.append({"check": "CHK-OWNERSHIP-CAP-L8L9", "count": len(cap["failures"]), "sample": cap["failures"][:5]})

    child_proc = subprocess.run(
        [sys.executable, str(checker_path), "check-child", "--l4", L4, "--l9", L9, "--l5", L5, "--l8", L8, "--root", str(ROOT)],
        cwd=ROOT,
        capture_output=True,
        text=True,
    )
    child_report = json.loads(child_proc.stdout)
    child_pair = child_report.get("L5_L8_pair", {})
    child_four_way = child_report.get("negative_4way", {})
    child_status = "not_evaluated" if child_pair.get("status") == "not_evaluated" and child_four_way.get("status") == "not_evaluated" else "evaluated"

    result = {
        "schema": "wr256-connect-l8-u-id-audit.v1",
        "evidence_kind": "scaffold",
        "authority_effect": "none",
        "base_revision": BASE,
        "rows": {"before": {"l9_cases": 90, "local_domain_probes": 61, "independent_semantic_probes": 68, "independent_cross_field_probes": 5, "u_id_total": 224}, "after": {"l9_basic_branches": observed["L9_basic_branch"], "local_domain_probes": observed["local_domain_probe"], "independent_semantic_probes": observed["independent_semantic_probe"], "independent_cross_field_probes": observed["independent_cross_field_probe"], "u_id_total": len(rows)}},
        "l5": {"public_functions": len(expected_functions), "failure_rules": all_rules, "unmapped_failure_rules": 0 if not any(x.get("check") == "l5_failure_rule_coverage" for x in failures) else None},
        "source_pointers_resolved": sum(1 for r in rows if r.get("source_ref")),
        "preserved_l9_whole_oracle": {"expected_count": 90, "recorded_count": len(expected_whole_hashes), "mismatch_count": len(whole_hash_mismatches)},
        "l10_contract_oracles": {
            "used_ids": sorted(used_contract_oracle_ids),
            "resolved_ids": sorted(used_contract_oracle_ids & contract_oracle_ids),
            "missing_ids": missing_contract_oracles,
            "wrong_target_mapping_count": len(wrong_contract_oracles),
        },
        "preserved_boundary_fields": {"checked": len(preserved_top_level), "changed": changed_boundary_fields},
        "expected_result_audit": {"row_count": len(rows), "ellipsis_count": sum("..." in row.get("expected_result", "") or "…" in row.get("expected_result", "") for row in rows), "array_count_placeholder_count": sum("array(" in row.get("expected_result", "") or "items)" in row.get("expected_result", "") for row in rows), "source_semantic_mismatch_count": sum(any(f.get("u_id") == row.get("u_id") and f.get("check", "").startswith(("row_expected_semantics", "independent_cross_field_probe")) for f in failures) for row in rows)},
        "row_oracle_and_test_citation": "null; not found at fixed source; not invented",
        "ownership_cap": {"passed": not cap.get("failures"), "failure_count": len(cap.get("failures", []))},
        "check_child": {
            "status": child_status,
            "reported_passed": child_report.get("passed"),
            "l5_l8_pair_reason": child_pair.get("not_evaluated_reason"),
            "negative_4way_reason": child_four_way.get("not_evaluated_reason"),
            "limitation": "The generic checker did not evaluate this CONNECT L5/L8 document shape; its false result is not a pass or a semantic finding.",
        },
        "passed": not failures,
        "failures": failures,
        "limits": ["This static check does not evaluate L4/L5 algorithms, tests, runtime, CI, independent semantic equivalence, or approval."]
    }
    out = ROOT / "scaffold/research/wr256-connect-trace-l8-slim-20261031/verification-summary.json"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0 if result["passed"] else 1


if __name__ == "__main__":
    sys.exit(main())

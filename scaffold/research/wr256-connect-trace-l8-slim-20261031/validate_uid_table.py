#!/usr/bin/env python3
"""Static WR256 U-ID/source/count/cap audit; never evaluates L4/L5 algorithms."""
from __future__ import annotations

import json
import re
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


def project_structure(value):
    """Keep result field names and order while excluding raw fixture values."""
    if isinstance(value, dict):
        return {key: project_structure(item) for key, item in value.items()}
    if isinstance(value, list):
        return {"$array": {str(index): project_structure(item) for index, item in enumerate(value)}}
    return value


def result_map_text(label, value):
    """Return named result fields as structure, never a field-count placeholder."""
    return project_structure(value)


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
    """Project source outcome distinctions into a compact structured expectation."""
    result = {}
    if function_ref.endswith("F01"):
        for key in ("history_prefix_result", "submitted_sequence_result", "missing_original_event_ids", "original_order_known_in_fixture", "original_predecessor_chain_corresponds", "retained_original_result_state", "result_content_result", "candidate_trace_state", "business_completion", "claim_results"):
            if key in expected:
                result[key] = project_structure(expected[key])
    elif function_ref.endswith("F02"):
        for key in ("content_results", "handoff_target_results", "unfinished_target_results"):
            if key in expected:
                result[key] = result_map_text(key, expected[key])
        for key in ("unfinished_link_result", "stop_link_result", "receipt_link_result", "resolution_link_result", "handoff_receipt_generates_resolution", "business_completion", "candidate_handoff_state", "claim_results"):
            if key in expected:
                result[key] = project_structure(expected[key])
        for key in ("retained_prior_successes", "retained_unfinished", "retained_handoff", "retained_handoff_receipt", "retained_resolution"):
            if key not in expected:
                continue
            value = expected[key]
            if value is None or isinstance(value, (bool, int, str)):
                result[key] = value
            elif isinstance(value, list):
                result[key] = "all original items retained" if value else "no original items"
            elif isinstance(value, dict):
                result[key] = "original record retained" if value else "no original record"
    else:
        for key in ("trace_target_results", "trace_reference_results", "custody_reference_results"):
            if key in expected:
                result[key] = result_map_text(key, expected[key])
        for key in ("trace_custody_data_use_result", "payload_persistence_required_for_trace", "classification_retention_deletion_authority", "candidate_reference_state", "claim_results"):
            if key in expected:
                result[key] = project_structure(expected[key])
        for key in ("outside_reference_fields", "forbidden_value_field_names"):
            if key in expected:
                result[key] = project_structure(expected[key])
    if "failure_reasons" in expected:
        result["failure_reasons"] = failure_reasons_text(expected["failure_reasons"])
    effects = expected.get("effects")
    if isinstance(effects, dict):
        result["effects"] = {key: value for key, value in effects.items() if key.startswith("actual_")}
    return result


def flatten_projection(value, prefix=""):
    """Flatten only object structure; values remain semantic result leaves."""
    if isinstance(value, dict) and value:
        result = {}
        for key, item in value.items():
            escaped = str(key).replace("~", "~0").replace("/", "~1")
            result.update(flatten_projection(item, prefix + "/" + escaped))
        return result
    return {prefix: value}


def display_path(path):
    return path.lstrip("/").replace("/$array/", "[").replace("/$array", "[]").replace("/", ".").replace("~1", "/").replace("~0", "~")


def concise_expected_label(group, sets, removes):
    """Render one primary row-specific semantic outcome; detailed source audit stays in scaffold."""
    if group == "independent_cross_field_probe":
        raise ValueError("typed cross-field expectations are generated from the typed input literal")
    failure = sets.get("/failure_reasons")
    if isinstance(failure, str) and failure != "failure_reasons=[]":
        body = failure.removeprefix("failure_reasons=[").removesuffix("]")
        primary = body.split("; ", 1)[0]
        return "期待: source failure " + primary + "."
    candidates = []
    for path, value in sets.items():
        leaf = path.rsplit("/", 1)[-1]
        if leaf in ("actual_authority", "actual_operation", "actual_implementation_ready", "actual_acceptance", "actual_business_completion", "actual_transmission", "actual_storage", "actual_append") or leaf == "business_completion":
            continue
        priority = 0 if leaf in ("candidate_trace_state", "candidate_handoff_state", "candidate_reference_state") else 1
        shown = json.dumps(value, ensure_ascii=False, separators=(",", ":")) if isinstance(value, (dict, list)) else str(value)
        candidates.append((priority, f"{display_path(path)}={shown}"))
    for path in removes:
        leaf = path.rsplit("/", 1)[-1]
        if leaf not in ("actual_authority", "actual_operation", "actual_implementation_ready", "actual_acceptance", "actual_business_completion", "actual_transmission", "actual_storage", "actual_append", "business_completion"):
            candidates.append((2, f"{display_path(path)} absent"))
    candidates.sort(key=lambda item: (item[0], item[1]))
    if not candidates:
        raise ValueError("row has no concise unique semantic deviation")
    labels = [item[1] for item in candidates[:2]]
    return "期待: " + "; ".join(labels) + "."


def cross_field_expected_label(value):
    literal = json.dumps(value, ensure_ascii=False, separators=(",", ":"))
    return f"期待: original_prior_successes={literal}を空配列へ強制変換しない。"


def main() -> int:
    current = json.loads((ROOT / L8).read_text(encoding="utf-8"))
    old8, l5, l9 = source_json(L8), source_json(L5), source_json(L9)
    l10_functional = source_json(L10)
    l10_nfr = source_json("docs/helix-connect/L10-verification/nfr-verification.json")
    l3_nfr = source_json("docs/helix-connect/L3-requirements/nfr-grade.json")
    l4 = source_json(L4)
    rows = current.get("unit_cases", [])
    counts = {"L9_basic_branch": 90, "local_domain_probe": 61, "independent_semantic_probe": 68, "independent_cross_field_probe": 5}
    observed = {kind: sum(row.get("source_kind") == kind for row in rows) for kind in counts}
    failures = []

    preserved_top_level = (
        "parent", "source_main", "scope", "full_goal_scope_preserved", "implementation_readiness",
        "authority_effect", "operation_effect", "source_pin_limit", "status", "approval_basis",
        "upstream_pins", "document_id", "layer", "layer_id", "pair", "pair_id", "design_ref",
        "integration_ref", "source_pair_pins", "preserved_l9_oracle", "fixture_coverage_limits",
        "unresolved", "approved_document_pins", "source_revision_roles",
    )
    changed_boundary_fields = [key for key in preserved_top_level if current.get(key) != old8.get(key)]
    if changed_boundary_fields:
        failures.append({"check": "existing_boundary_and_unverified_state_preserved", "fields": changed_boundary_fields})
    expected_method = "候補U-ID表は、固定されたL3/L4/L5/L10の契約と参照されたL9/probeの反例・期待差分を対応づける。全行はnot_executed。L5 AST評価、test実行、L8 pass/fail判定は行わず、行別意味監査はsource-semantic-audit.jsonに記録する。"
    if current.get("method") != expected_method:
        failures.append({"check": "method_matches_static_candidate_role_and_unexecuted_boundary"})

    l4_contracts = {item["id"]: item for item in l4["contracts"]}
    l3_requirements = {item["id"]: item for item in source_json(L3)["requirements"]}
    l3_requirements.update({item["id"]: item for item in l3_nfr["requirements"]})
    l10_cases = {item["id"]: item for item in l10_functional["cases"]}
    l10_cases.update({item["id"]: item for item in l10_nfr["cases"]})
    output_literals = l5["output_literals"]
    expected_contract_outcomes = {
        "qualification_boundary": {
            "authority_effect": l4["authority_effect"],
            "operation_effect": l4["operation_effect"],
            "actual_effects_false": {field: False for field in output_literals["effects_false_fields"]},
            "qualification_rule": l4_contracts["HELIXCONNECT-L4-005-F01"]["qualification_rule"],
        },
        "functions": {}
    }
    for suffix in ("F01", "F02", "N01"):
        requirement_id = f"HELIXCONNECT-L3-005-{suffix}"
        design = l4_contracts[f"HELIXCONNECT-L4-005-{suffix}"]
        oracle = l10_cases[f"HELIXCONNECT-L10-005-{suffix}"]
        expected_contract_outcomes["functions"][suffix] = {
            "requirement_ref": requirement_id,
            "requirement_obligation": l3_requirements[requirement_id]["obligation"],
            "l4_output_meanings": design["output_meanings"],
            "l5_fixed_outputs": l5["branch_tables"][suffix]["fixed_outputs"],
            "l10_expected_observation": oracle["expected_observation"],
            "l10_failure_observation": oracle["failure_observation"],
        }
    if current.get("contract_outcome_boundaries") != expected_contract_outcomes:
        failures.append({"check": "short_contract_outcome_boundaries_match_L3_L4_L5_L10"})

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

    def source_projection(row):
        kind = row["source_kind"]
        if kind == "L9_basic_branch":
            expected = pointer(l9, row["expected_ref"]["pointer"])
            group = row["target"]["function_ref"].rsplit("-", 1)[-1]
            return group, expected_summary(expected, row["target"]["function_ref"])
        if kind == "local_domain_probe":
            index = int(row["source_ref"]["pointer"].rsplit("/", 1)[1])
            probe = old8["local_domain_probes"]["cases"][index]
            expected = patch_value(pointer(l9, probe["expected_base_ref"]["pointer"]), probe["expected_whole_overlay"])
            group = row["target"]["function_ref"].rsplit("-", 1)[-1]
            return group, expected_summary(expected, row["target"]["function_ref"])
        if kind == "independent_semantic_probe":
            index = int(row["source_ref"]["pointer"].rsplit("/", 1)[1])
            probe = old8["independent_semantic_probes"][index]
            group = row["target"]["function_ref"].rsplit("-", 1)[-1]
            return group, expected_summary(probe["expected_whole"], row["target"]["function_ref"])
        index = int(row["source_ref"]["pointer"].rsplit("/", 1)[1])
        probe = cross_probes[index]
        return "independent_cross_field_probe", probe["expected_constraints"]

    source_projections = {}
    grouped = {}
    for row in rows:
        try:
            group, projection = source_projection(row)
            source_projections[row["u_id"]] = (group, projection)
            grouped.setdefault(group, []).append(projection)
        except Exception as exc:
            failures.append({"check": "row_expected_semantics_resolution", "u_id": row.get("u_id"), "error": str(exc)})
    expected_baselines = {}
    for group, projections in grouped.items():
        flattened = [flatten_projection(item) for item in projections]
        paths = set().union(*(item.keys() for item in flattened))
        baseline_fields = {}
        for path in sorted(paths):
            encoded = [json.dumps({"value": item[path]}, ensure_ascii=False, sort_keys=True, separators=(",", ":")) if path in item else "<MISSING>" for item in flattened]
            frequencies = {}
            for value in encoded:
                frequencies[value] = frequencies.get(value, 0) + 1
            mode = sorted(frequencies.items(), key=lambda pair: (-pair[1], pair[0]))[0][0]
            if mode != "<MISSING>":
                baseline_fields[path] = json.loads(mode)["value"]
        expected_baselines[group] = baseline_fields

    source_audit_rows = []
    source_deltas = {}
    for row in rows:
        group, projection = source_projections[row["u_id"]]
        flat = flatten_projection(projection)
        baseline = expected_baselines[group]
        sets = {path: value for path, value in flat.items() if path not in baseline or baseline[path] != value}
        removes = sorted(path for path in baseline if path not in flat)
        if group == "independent_cross_field_probe":
            index = int(row["source_ref"]["pointer"].rsplit("/", 1)[1])
            probe = cross_probes[index]
            literal_value = probe["input_patch"][0]["value"]
            label = cross_field_expected_label(literal_value)
        else:
            try:
                label = concise_expected_label(group, sets, removes)
            except Exception as exc:
                failures.append({"check": "concise_unique_expected_result_generation", "u_id": row["u_id"], "error": str(exc)})
                label = ""
        source_deltas[row["u_id"]] = {"baseline_ref": group, "set": sets, "remove": removes, "expected_result": label}
        source_audit_rows.append({
            "u_id": row["u_id"], "source_kind": row["source_kind"], "source_id": row["source_id"],
            "source_ref": row["source_ref"], "expected_ref": row["expected_ref"],
            "contract_oracle_id": row["contract_oracle_id"],
            "projection_sha256": hashlib.sha256(json.dumps(flat, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8")).hexdigest(),
            "source_semantic_projection": flat,
            "modal_comparison_delta": {"set": sets, "remove": removes},
            "formal_expected_result": label,
        })
    expectation_text = json.dumps({"audit": source_audit_rows, "formal": [row.get("expected_result") for row in rows]}, ensure_ascii=False)
    ellipsis_count = expectation_text.count("...") + expectation_text.count("…")
    array_placeholder_count = len(re.findall(r"array\(\d+ items\)", expectation_text))
    if ellipsis_count or array_placeholder_count:
        failures.append({"check": "no_truncated_or_array_count_only_expectation", "ellipsis_count": ellipsis_count, "array_placeholder_count": array_placeholder_count})

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
        except Exception as exc:
            failures.append({"check": "fixed_source_pointer_resolution", "u_id": row.get("u_id"), "error": str(exc)})
        for ref in row.get("l5_failure_rule_refs", []):
            try:
                path, ptr = ref.split("#", 1)
                if path != L5:
                    raise ValueError(f"unexpected_l5_reference_path:{path}")
                pointer(l5, ptr)
            except Exception as exc:
                failures.append({"check": "l5_failure_rule_pointer_resolution", "u_id": row.get("u_id"), "reference": ref, "error": str(exc)})

        try:
            expected_label = source_deltas[row["u_id"]]["expected_result"]
            if row["expected_result"] != expected_label:
                failures.append({"check": "row_expected_result_matches_concise_source_semantics", "u_id": row["u_id"]})
        except Exception as exc:
            failures.append({"check": "row_expected_delta_resolution", "u_id": row.get("u_id"), "error": str(exc)})

        if row["source_kind"] == "independent_cross_field_probe":
            try:
                index = int(row["source_ref"]["pointer"].rsplit("/", 1)[1])
                probe = cross_probes[index]
                values = [None, False, 0, "", {}]
                value = probe["input_patch"][0]["value"]
                literal = json.dumps(value, ensure_ascii=False, separators=(",", ":"))
                want_counterexample = f"{probe['id']}: original_prior_successes={literal} (non-array), original_stop.stop_event_ref=null."
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
                    and row["expected_result"] == cross_field_expected_label(value)
                    and row["execution_state"] == "not_executed"
                )
                if type(value) is not type(values[index]) or value != values[index] or not valid_shape:
                    failures.append({"check": "independent_cross_field_probe_semantics", "u_id": row["u_id"], "probe_id": probe.get("id")})
            except Exception as exc:
                failures.append({"check": "independent_cross_field_probe_resolution", "u_id": row.get("u_id"), "error": str(exc)})

    expected_cross_common = {
        "applies_to_source_ids": [probe["id"] for probe in cross_probes],
        "shared_expected_result": {"no_exception": True, "stop_link_result": "unknown_original_information"},
        "shared_boundary": "original_prior_successesの非配列値を空配列へ変換しない。original_stop.stop_event_ref=nullからstop eventを解決しない。",
    }
    if current.get("cross_field_type_expectation") != expected_cross_common:
        failures.append({"check": "cross_field_shared_expectation_matches_fixed_source"})

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

    source_audit = {
        "schema": "wr256-connect-l8-source-semantic-audit.v1",
        "evidence_kind": "scaffold",
        "authority_effect": "none",
        "base_revision": BASE,
        "contract_outcome_boundaries": expected_contract_outcomes,
        "groups": {group: {"row_count": len(items), "modal_source_projection": expected_baselines[group]} for group, items in sorted(grouped.items())},
        "rows": source_audit_rows,
        "limits": ["This is a fixed-source semantic audit projection, not an executed oracle or full-return fixture."],
    }
    audit_path = ROOT / "scaffold/research/wr256-connect-trace-l8-slim-20261031/source-semantic-audit.json"
    audit_path.write_text(json.dumps(source_audit, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

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
        "method_boundary": {"passed": not any(item.get("check") == "method_matches_static_candidate_role_and_unexecuted_boundary" for item in failures), "L5_AST_test_execution_or_L8_pass_fail": "not_performed"},
        "contract_outcome_boundaries": {"checked_functions": sorted(expected_contract_outcomes["functions"]), "mismatch_count": sum(item.get("check") == "short_contract_outcome_boundaries_match_L3_L4_L5_L10" for item in failures)},
        "source_semantic_audit": {"path": str(audit_path.relative_to(ROOT)), "row_count": len(source_audit_rows), "sha256": hashlib.sha256(audit_path.read_bytes()).hexdigest()},
        "contract_outcome_boundary_count": sum(len(items["l5_fixed_outputs"]) for items in expected_contract_outcomes["functions"].values()),
        "expected_result_audit": {"row_count": len(rows), "baseline_groups": {group: {"rows": len(grouped[group]), "audit_baseline_fields": len(expected_baselines[group])} for group in sorted(grouped)}, "audit_baseline_field_total": sum(len(fields) for fields in expected_baselines.values()), "audit_row_delta_fields": sum(len(item["set"]) + len(item["remove"]) for item in source_deltas.values()), "max_audit_row_delta_fields": max((len(item["set"]) + len(item["remove"]) for item in source_deltas.values()), default=0), "formal_expected_result_kind": "concise row-specific semantic statement", "formal_expected_result_length_max": max((len(row.get("expected_result", "")) for row in rows), default=0), "ellipsis_count": ellipsis_count, "array_count_placeholder_count": array_placeholder_count, "source_semantic_mismatch_count": sum(any(f.get("u_id") == row.get("u_id") and f.get("check", "").startswith(("row_expected_delta", "row_expected_semantics_resolution", "row_expected_result", "independent_cross_field_probe")) for f in failures) for row in rows)},
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

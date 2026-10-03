#!/usr/bin/env python3
"""DOC-002候補のfail-close負例。旧archiveは実行せずvalidatorをin-memoryで呼ぶ。"""
from __future__ import annotations

import copy
import hashlib
import importlib.util
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("doc002_validator", HERE / "validate.py")
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)
base = json.loads((HERE / "inventory.json").read_text(encoding="utf-8"))
binding = json.loads((HERE.parent / "bindings/SCF-B-0048.json").read_text(encoding="utf-8"))


def canonical_digest(value, *, sort_keys=True):
    payload = json.dumps(
        value,
        ensure_ascii=False,
        sort_keys=sort_keys,
        separators=(",", ":"),
    ).encode("utf-8")
    return hashlib.sha256(payload).hexdigest()


def semantic_rows(candidate):
    return [
        {field: atom.get(field) for field in mod.SEMANTIC_ATOM_FIELDS}
        for atom in candidate["atoms"]
    ]


def shared_relation_rows(candidate):
    return [
        {field: relation.get(field) for field in ("relation_id", "atom_ids", "reason")}
        for relation in candidate["shared_source_relations"]
    ]


baseline_errors = mod.check(copy.deepcopy(base), copy.deepcopy(binding))
if baseline_errors:
    raise SystemExit("FAIL selfcheck: no-op baseline guard: " + ",".join(baseline_errors))
print("PASS no-op baseline guard")


def must_fail(label, mutate, expected):
    candidate = copy.deepcopy(base)
    mutate(candidate)
    errors = mod.check(candidate, copy.deepcopy(binding))
    expected_codes = (expected,) if isinstance(expected, str) else tuple(expected)
    if not errors:
        raise SystemExit("FAIL selfcheck: " + label + " unexpectedly passed")
    def matches(error, code):
        return error == code or error.startswith(code + ":") or code.endswith("_") and error.startswith(code)

    if not any(matches(error, code) for error in errors for code in expected_codes):
        raise SystemExit(
            "FAIL selfcheck: " + label + " missing expected code "
            + "/".join(expected_codes) + "; got " + ",".join(errors)
        )
    print("PASS", label, "[" + "/".join(expected_codes) + "]")


must_fail("authority promotion", lambda x: x.update(authority_effect="adopted"), "E_AUTHORITY")
must_fail("source digest drift", lambda x: x["source_document"].update(sha256="0" * 64), "E_SOURCE_ROW_sha256")
must_fail("reference target drift", lambda x: x["reference_edges"][0].update(target_sha256="0" * 64), "E_REFERENCE_DELEGATED-REF-0301_target_sha256")
must_fail("reference edge omission", lambda x: x["reference_edges"].pop(), "E_REFERENCE_SCOPE")
must_fail("atom exact text drift", lambda x: x["atoms"][0]["source_span"].update(exact_source_text="changed\n"), "E_ATOM_TEXT_RDP002048-SEM-DOC-002-METADATA")
must_fail("atom span line-id drift", lambda x: x["atoms"][1]["source_line_ids"].pop(), "E_ATOM_LINE_IDS_RDP002048-SEM-DOC-002-PURPOSE-ATOMIC-SLICE")
must_fail("undeclared atom overlap", lambda x: (x["atoms"][4]["source_span"].update(start_line=25), x["atoms"][4].update(source_line_ids=[25, 26])), "E_UNDECLARED_ATOM_OVERLAP")
must_fail("shared relation omission", lambda x: x["shared_source_relations"].pop(), "E_SHARED_RELATION_COUNT")
must_fail("shared fragment text drift", lambda x: x["shared_source_relations"][0]["shared_source_fragments"][0].update(exact_source_text="changed\n"), "E_SHARED_FRAGMENT_TEXT_DOC002-SHARED-001")
must_fail("shared relation reason drift", lambda x: x["shared_source_relations"][0].update(reason="reversed meaning"), "E_SHARED_RELATION_PIN")
must_fail("shared relation reason+digest drift", lambda x: (x["shared_source_relations"][0].update(reason="reversed meaning"), x.update(shared_source_relations_digest=canonical_digest(shared_relation_rows(x)))), "E_SHARED_RELATION_PIN")
must_fail("residual line omission", lambda x: x["unresolved_source_lines"].pop(), "E_FULL_LINE_COVERAGE")
must_fail("residual text drift", lambda x: x["unresolved_source_lines"][0].update(exact_source_text="changed\n"), "E_RESIDUAL_TEXT")
must_fail("source coverage denominator", lambda x: x["source_document"]["atom_coverage"].update(covered_line_count=111), "E_DOC_COVERED_LINES")
must_fail("product candidate loss", lambda x: x["product_boundary"]["product_candidates"].pop(), "E_PRODUCT_BOUNDARY_PIN")
must_fail("product allocation reversal", lambda x: x["product_boundary"].update(allocation_rule="OS owns all requirements"), "E_PRODUCT_BOUNDARY_PIN")
must_fail("atom product candidate loss", lambda x: x["atoms"][0]["product_candidates"].pop(), "E_ATOM_PRODUCTS_RDP002048-SEM-DOC-002-METADATA")
must_fail("semantic candidate kind drift", lambda x: x["atoms"][0].update(candidate_kind="requirement"), "E_SEMANTIC_ATOM_PIN")
must_fail("semantic original id drift", lambda x: x["atoms"][0].update(original_id="DOC-002-ALTERED"), "E_SEMANTIC_ATOM_PIN")
must_fail("semantic owner candidates drift", lambda x: x["atoms"][0].update(owner_candidates=["HELIX-OS"]), "E_SEMANTIC_ATOM_PIN")
must_fail("semantic consumer candidates drift", lambda x: x["atoms"][0].update(consumer_candidates=[]), "E_SEMANTIC_ATOM_PIN")
must_fail("semantic normalized statement drift", lambda x: x["atoms"][0].update(normalized_statement="reversed statement"), "E_SEMANTIC_ATOM_PIN")
must_fail("semantic actors drift", lambda x: x["atoms"][0].update(actors=["attacker"]), "E_SEMANTIC_ATOM_PIN")
must_fail("semantic authority conditions drift", lambda x: x["atoms"][0].update(authority_conditions=["accepted"]), "E_SEMANTIC_ATOM_PIN")
must_fail("semantic negative conditions drift", lambda x: x["atoms"][0].update(negative_conditions=[]), "E_SEMANTIC_ATOM_PIN")
must_fail("normalized text+digest simultaneous drift", lambda x: (x["atoms"][0].update(normalized_statement="reversed statement"), x["normalized_statements"].__setitem__(0, "reversed statement"), x.update(normalized_statements_digest=canonical_digest(x["normalized_statements"], sort_keys=False))), "E_NORMALIZED_STATEMENTS")
must_fail("normalized digest drift", lambda x: x.update(normalized_statements_digest="0" * 64), "E_NORMALIZED_DIGEST")
must_fail("semantic digest drift", lambda x: x.update(semantic_atoms_digest="0" * 64), "E_SEMANTIC_DIGEST")
must_fail("phase authority promotion", lambda x: x["atoms"][0]["legacy_state"].update(phase_authority_status="confirmed"), "E_ATOM_PHASE_AUTHORITY_RDP002048-SEM-DOC-002-METADATA")
must_fail("legacy implementation promotion", lambda x: x["atoms"][0]["legacy_state"].update(legacy_implementation_status="implemented"), "E_ATOM_IMPL_RDP002048-SEM-DOC-002-METADATA")
must_fail("degraded promotion", lambda x: x["atoms"][0]["legacy_state"].update(degraded_status="degraded"), "E_ATOM_DEGRADED_RDP002048-SEM-DOC-002-METADATA")
must_fail("failure closure", lambda x: x["atoms"][0]["legacy_state"].update(failure_status="closed"), "E_ATOM_FAILURE_RDP002048-SEM-DOC-002-METADATA")
must_fail("consumer closure", lambda x: x["atoms"][0]["legacy_state"].update(consumer_status="closed"), "E_ATOM_CONSUMER_RDP002048-SEM-DOC-002-METADATA")
must_fail("decision history invention", lambda x: x["legacy_asset_review"]["decision_history"].update(status="decided"), "E_DECISION_HISTORY_STATUS")
must_fail("B0010 relation preemption", lambda x: x["comparison"]["existing_candidate_connection"].update(relationship="replacement"), "E_B0010_RELATION")
must_fail("runtime execution", lambda x: x.update(old_runtime_test_ci_execution=True), "E_OLD_EXECUTION")
must_fail("closure adoption", lambda x: x["closure_guard"].update(adoption_state="adopted"), "E_CLOSURE_GUARD_PIN")
must_fail("closure prohibited inference reversal", lambda x: x["closure_guard"]["prohibited_inference"].reverse(), "E_CLOSURE_GUARD_PIN")
must_fail("review limit reversal", lambda x: x["review_limits"].__setitem__(0, "authority confirmed"), "E_REVIEW_LIMITS_PIN")
must_fail("coverage policy reversal", lambda x: x["coverage_policy"].update(residuals_are_not_dropped=False), "E_COVERAGE_POLICY_PIN")
must_fail("candidate resolution promotion", lambda x: x["candidate_resolution"].update(phase_scope="PHCAP-11"), "E_CANDIDATE_RESOLUTION_PIN")
must_fail("unknown nested merge admission", lambda x: x["atoms"][0]["legacy_state"].update(merge_admission="accepted"), "E_KEYSET:$.atoms[].legacy_state")
must_fail("unknown nested accepted", lambda x: x["closure_guard"].update(accepted=True), "E_KEYSET:$.closure_guard")
must_fail("unknown nested authority", lambda x: x["shared_source_relations"][0].update(authority="confirmed"), "E_KEYSET:$.shared_source_relations[]")
print("PASS RDP-001 DOC-002 selfcheck: 43 negative cases + no-op guard")

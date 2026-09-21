#!/usr/bin/env python3
"""PHCAP-18 refactor research premise validator; read-only static checks."""
import hashlib, json, re, sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
INV = HERE / "inventory.json"
ASSET = ROOT / "docs/governance/legacy-asset-disposition.jsonl"
PHASE = ROOT / "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl"
DECISION = ROOT / "docs/governance/legacy-asset-decisions.jsonl"
PREFIX = "archive/legacy-generation-2026-09-14/root/"
ASSET_IDS = [
    "LEGACY-ASSET-12E2CD9B07EFAC343ED0",
    "LEGACY-ASSET-603D0E8D8193914F4AC0",
    "LEGACY-ASSET-3B8F5F0230F7469B5D11",
    "LEGACY-ASSET-7EBF2130DE1840722A6B",
    "LEGACY-ASSET-E56701056732E5CF9A1C",
]
EXPECTED_RESOLUTIONS = {
    "CONTR-01": "preserved candidate/history versus ledger state; no current authority, adoption or completion is generated",
    "CONTR-02": "preserved source presence versus unknown execution/implementation; no current oracle or pass is generated",
    "CONTR-03": "Web/Web-OS remain unknown; candidate boundary refs do not close direct evidence gap",
    "CONTR-04": "preserved historical test claim; no current acceptance, implementation or freeze is generated",
}

def digest(data):
    return hashlib.sha256(data).hexdigest()

def jsonl(path):
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]

def text(path, start, end):
    lines = path.read_text(encoding="utf-8").splitlines()
    return "\n".join(lines[start - 1:end]) + "\n" if 1 <= start <= end <= len(lines) else None

def req(errors, condition, code):
    if not condition:
        errors.append(code)

def validate(data):
    errors = []
    req(errors, data.get("schema") == "phcap18-refactor-research/v1", "E_SCHEMA")
    req(errors, data.get("status") == "research_premise_candidate", "E_STATUS")
    req(errors, data.get("authority_effect") == "none", "E_AUTHORITY")
    req(errors, data.get("meaning_change_applied") is False, "E_MEANING")
    req(errors, data.get("successor_requirement_ids") == [] and data.get("human_decision_ref") is None, "E_DECISION")
    req(errors, data.get("equivalence_claim") is None, "E_EQUIVALENCE")
    req(errors, data.get("old_runtime_test_ci_execution") is False, "E_OLD_EXECUTION")
    transition = data.get("candidate_transition", {})
    req(errors, transition.get("from") == "legacy_reference_only", "E_TRANSITION_FROM")
    req(errors, transition.get("to") == "research_premise_candidate", "E_TRANSITION_TO")
    req(errors, transition.get("degradation") == "degraded_to_candidate", "E_DEGRADATION")
    req(errors, transition.get("authority_effect") == "none", "E_TRANSITION_AUTHORITY")
    req(errors, transition.get("current_gap_status") == "unknown", "E_TRANSITION_GAP")
    legacy_summary = data.get("legacy_summary", {})
    req(errors, legacy_summary.get("layers_evidenced") == ["candidate requirements", "L5", "L6", "L7 implementation/test"], "E_LEGACY_LAYERS")
    req(errors, legacy_summary.get("maximum_layer_evidenced") == "L7", "E_LEGACY_MAX_LAYER")
    req(errors, legacy_summary.get("capability_status") == "implemented_with_tests", "E_LEGACY_PHASE_STATUS")
    req(errors, legacy_summary.get("capability_status_scope") == "phase-level historical inventory summary; not per-asset current implementation evidence", "E_LEGACY_STATUS_SCOPE")
    req(errors, legacy_summary.get("asset_record_status") == "all five selected ledger rows remain unresolved; implementation_status unknown; consumer_refs empty", "E_LEGACY_ASSET_STATUS")
    req(errors, legacy_summary.get("transition_assessment") == "degraded_to_candidate", "E_LEGACY_TRANSITION")
    req(errors, legacy_summary.get("new_build_allowed") is False, "E_NEW_BUILD")
    req(errors, legacy_summary.get("authority_effect") == "inventory_and_work_projection_only", "E_LEGACY_AUTHORITY")
    base = data.get("base", {})
    req(errors, base.get("repository") == "HELIX-HARNESS" and base.get("branch") == "origin/main", "E_BASE")
    req(errors, base.get("commit") == "c354b7d9177ad3ea92dec30c66c36e6ce2d66ae3", "E_BASE_REVISION")

    gap = data.get("gap_interpretation", {})
    req(errors, gap.get("inventory_product_targets") == ["HELIX-HARNESS", "HELIX-OS", "HELIX-Web", "HELIX-Web-OS"], "E_SCOPE_PRODUCTS")
    req(errors, gap.get("inventory_current_evidence_products") == ["HELIX-HARNESS", "HELIX-OS"], "E_CURRENT_PRODUCTS")
    req(errors, gap.get("direct_current_evidence_products") == ["HELIX-HARNESS", "HELIX-OS"], "E_DIRECT_PRODUCTS")
    req(errors, gap.get("direct_current_evidence_refs") == [
        "docs/governance/audits/source-rebaseline/new-generation-refactoring-trigger-source-crosswalk.md",
        "docs/helix-harness/L2-requirements/product-requirements.md",
    ], "E_DIRECT_REF_PATHS")
    req(errors, set(gap.get("missing_direct_current_products", [])) == {"HELIX-Web", "HELIX-Web-OS"}, "E_MISSING_PRODUCTS")
    req(errors, gap.get("missing_status") == "unknown", "E_UNKNOWN")
    req(errors, gap.get("prohibited_inference") == "HELIX-Web/Web-OS direct-ref absence is not an implementation absence claim", "E_UNKNOWN_BOUNDARY")
    boundary = {x.get("product"): x.get("status") for x in data.get("product_boundary_candidates", [])}
    req(errors, set(boundary) == {"HELIX-HARNESS", "HELIX-OS", "HELIX-Web", "HELIX-Web-OS"}, "E_BOUNDARY_PRODUCTS")
    req(errors, boundary.get("HELIX-Web") == "unknown_due_to_missing_direct_ref", "E_WEB_UNKNOWN")
    req(errors, boundary.get("HELIX-Web-OS") == "unknown_due_to_missing_direct_ref", "E_WEBOS_UNKNOWN")

    assets = {x.get("asset_id"): x for x in jsonl(ASSET)}
    phases = {x.get("asset_id"): x for x in jsonl(PHASE)}
    decisions = jsonl(DECISION)
    legacy = data.get("legacy_assets", [])
    expected = set(data.get("scope", {}).get("bounded_asset_ids", []))
    req(errors, len(legacy) == 5 and expected == set(ASSET_IDS) and expected == {x.get("asset_id") for x in legacy}, "E_ASSET_SCOPE")
    req(errors, data.get("counts", {}).get("source_spans") == 22 and data.get("counts", {}).get("semantic_atoms") == 17, "E_COUNTS")
    req(errors, data.get("counts", {}).get("decision_records_found") == 0, "E_DECISION_COUNT")
    req(errors, data.get("counts", {}).get("legacy_consumer_refs_observed") == 0, "E_CONSUMER_COUNT")

    for item in legacy:
        aid, old, phase = item.get("asset_id"), assets.get(item.get("asset_id")), phases.get(item.get("asset_id"))
        req(errors, old is not None and phase is not None, "E_LEDGER:" + str(aid))
        if old:
            for key, value in {"disposition": "unresolved", "implementation_status": "unknown", "consumer_refs": [],
                               "product_target": "unresolved", "authority_status": "historical",
                               "decision_record_ref": None}.items():
                req(errors, old.get(key) == value, "E_ASSET_STATE:%s:%s" % (aid, key))
            for key, value in item.get("ledger_record", {}).items():
                req(errors, old.get(key) == value, "E_LEDGER_SNAPSHOT:%s:%s" % (aid, key))
        if phase:
            req(errors, phase.get("consumer_closure_status") == "pending", "E_PHASE_CONSUMER:" + str(aid))
            req(errors, phase.get("consumer_refs") == [], "E_PHASE_CONSUMER_REFS:" + str(aid))
            req(errors, phase.get("legacy_implementation_status") == "unknown", "E_PHASE_IMPL:" + str(aid))
            req(errors, phase.get("legacy_execution_performed") is False, "E_PHASE_EXEC:" + str(aid))
            for key in ("classification_id", "candidate_phase_targets", "candidate_product_targets",
                        "phase_classification_status", "product_classification_status", "consumer_closure_status",
                        "consumer_refs", "legacy_implementation_status", "legacy_execution_performed", "unresolved"):
                req(errors, item.get("phase_classification_record", {}).get(key) == phase.get(key), "E_PHASE_SNAPSHOT:%s:%s" % (aid, key))
        req(errors, not [x for x in decisions if x.get("asset_id") == aid], "E_DECISION_MATCH:" + str(aid))
        req(errors, item.get("decision_history", {}).get("matching_decision_record_count") == 0, "E_DECISION_HISTORY:" + str(aid))
        source = ROOT / item.get("archive_path", "")
        req(errors, item.get("archive_path", "").startswith(PREFIX) and source.is_file(), "E_ARCHIVE:" + str(aid))
        if source.is_file():
            req(errors, digest(source.read_bytes()) == item.get("source_sha256"), "E_SOURCE_SHA:" + str(aid))
            req(errors, len(source.read_text(encoding="utf-8").splitlines()) == item.get("source_line_count"), "E_SOURCE_LINES:" + str(aid))
            span_ids = {x.get("span_id") for x in item.get("source_spans", [])}
            for selected in item.get("source_spans", []):
                req(errors, selected.get("path") == item.get("archive_path"), "E_SPAN_PATH:" + str(selected.get("span_id")))
                value = text(source, selected.get("start_line", 0), selected.get("end_line", 0))
                req(errors, value is not None, "E_SPAN_BOUNDS:" + str(selected.get("span_id")))
                if value is not None:
                    req(errors, value == selected.get("exact_text"), "E_SPAN_TEXT:" + str(selected.get("span_id")))
                    req(errors, digest(value.encode()) == selected.get("sha256"), "E_SPAN_SHA:" + str(selected.get("span_id")))
            for key in ("failure_evidence", "consumer_evidence"):
                records = item.get(key, [])
                req(errors, bool(records), "E_%s:%s" % (key.upper(), aid))
                for record in records:
                    req(errors, record.get("span_id") in span_ids and bool(record.get("finding")), "E_%s_REF:%s" % (key.upper(), aid))

    span_map = {s.get("span_id"): a.get("asset_id") for a in legacy for s in a.get("source_spans", [])}
    seen = set()
    for atom in data.get("atoms", []):
        atom_id = atom.get("atom_id")
        req(errors, isinstance(atom_id, str) and atom_id not in seen, "E_ATOM_DUP:" + str(atom_id))
        seen.add(atom_id)
        req(errors, span_map.get(atom.get("source_span_id")) == atom.get("source_asset_id"), "E_ATOM_SPAN:" + str(atom_id))
        req(errors, bool(atom.get("actor_candidate")) and bool(atom.get("legacy_authority_or_enforced_by")), "E_ATOM_ACTOR:" + str(atom_id))
        req(errors, bool(atom.get("failure_or_unresolved")) and bool(atom.get("consumer_candidate")), "E_ATOM_BOUNDARY:" + str(atom_id))
        req(errors, any(word in str(atom.get("evidence_status", "")) for word in ("unknown", "unresolved", "observed", "unexecuted", "contradiction")), "E_ATOM_STATUS:" + str(atom_id))
    req(errors, len(seen) == data.get("counts", {}).get("semantic_atoms"), "E_ATOM_COUNT")

    refs = data.get("current_refs", [])
    req(errors, len(refs) == data.get("counts", {}).get("current_refs_recorded") == 6, "E_CURRENT_COUNT")
    direct = []
    for ref in refs:
        path = ROOT / ref.get("path", "")
        req(errors, path.is_file(), "E_CURRENT_MISSING:" + str(ref.get("ref_id")))
        if path.is_file():
            req(errors, digest(path.read_bytes()) == ref.get("sha256"), "E_CURRENT_SHA:" + str(ref.get("ref_id")))
            value = text(path, ref.get("start_line", 0), ref.get("end_line", 0))
            req(errors, value == ref.get("exact_text"), "E_CURRENT_TEXT:" + str(ref.get("ref_id")))
            if value is not None:
                req(errors, digest(value.encode()) == ref.get("line_sha256"), "E_CURRENT_LINE_SHA:" + str(ref.get("ref_id")))
        req(errors, ref.get("classification") in {"direct_current_ref", "direct_boundary_current_ref", "adjacent_current_ref", "boundary_candidate"}, "E_CURRENT_CLASS:" + str(ref.get("ref_id")))
        if ref.get("classification") == "direct_current_ref":
            direct.append(ref)
    req(errors, {x.get("ref_id") for x in direct} == {"CUR-XW-18", "CUR-HARNESS-L2-REF"}, "E_DIRECT_REFS")
    req(errors, {x.get("product") for x in direct} == {"HELIX-HARNESS"}, "E_DIRECT_REF_PRODUCT")
    req(errors, data.get("counts", {}).get("direct_current_refs") == 2 and data.get("counts", {}).get("harness_direct_current_refs") == 2, "E_DIRECT_COUNTS")

    contradictions = data.get("contradictions_preserved", [])
    req(errors, len(contradictions) == 4, "E_CONTRADICTIONS_COUNT")
    seen = set()
    for contradiction in contradictions:
        cid = contradiction.get("id")
        req(errors, cid in EXPECTED_RESOLUTIONS and cid not in seen, "E_CONTRADICTION_ID:" + str(cid))
        seen.add(cid)
        req(errors, set(contradiction) == {"id", "status", "left", "right", "resolution"}, "E_CONTRADICTION_FIELDS:" + str(cid))
        req(errors, contradiction.get("status") == "unresolved_preserved", "E_CONTRADICTION_STATUS:" + str(cid))
        req(errors, contradiction.get("resolution") == EXPECTED_RESOLUTIONS.get(cid), "E_CONTRADICTION_RESOLUTION:" + str(cid))
        req(errors, bool(str(contradiction.get("left", "")).strip()) and bool(str(contradiction.get("right", "")).strip()), "E_CONTRADICTION_TEXT:" + str(cid))
    req(errors, seen == set(EXPECTED_RESOLUTIONS), "E_CONTRADICTION_SET")
    unresolved = data.get("unresolved", [])
    req(errors, len(unresolved) >= 10 and all(isinstance(x, str) and x.strip() for x in unresolved), "E_UNRESOLVED")
    return errors

if __name__ == "__main__":
    failures = validate(json.loads(INV.read_text(encoding="utf-8")))
    if failures:
        print("FAIL PHCAP-18 validator")
        print("\n".join(failures))
        sys.exit(1)
    print("PASS PHCAP-18 validator: static source/ledger/current-boundary/unknown checks")

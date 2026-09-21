#!/usr/bin/env python3
"""PHCAP-06 research premise candidate; read-only static validation."""
import hashlib
import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
INV = HERE / "inventory.json"
ASSETS = ROOT / "docs/governance/legacy-asset-disposition.jsonl"
PHASES = ROOT / "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl"
DECISIONS = ROOT / "docs/governance/legacy-asset-decisions.jsonl"
ARCHIVE_PREFIX = "archive/legacy-generation-2026-09-14/root/"
BASE = "569d7373c32287bbafadeec6043472563937c5c7"
PRODUCTS = {"HELIX-HARNESS", "HELIX-OS", "HELIX-Web", "HELIX-Web-OS"}
DIRECT = {"HELIX-HARNESS", "HELIX-OS"}
ADJACENT = {"HELIX-HARNESS", "HELIX-OS", "HELIX-Web", "HELIX-Web-OS"}

EXPECTED_CONTRADICTIONS = {
    "CONTR-01": {
        "left": "selected legacy design documents and metadata claim confirmed or canonical design authority",
        "right": "selected ledger rows remain historical, unresolved, implementation unknown and without consumer closure",
        "resolution": "preserved historical authority claims versus ledger state; no current authority or reuse decision is generated",
    },
    "CONTR-02": {
        "left": "legacy implementation source describes executable registry/lint contracts and failure codes",
        "right": "implementation status is unknown and old runtime/test/CI execution is prohibited",
        "resolution": "preserved source presence versus unknown execution/implementation; no current oracle or pass is generated",
    },
    "CONTR-03": {
        "left": "PHCAP-06 product_targets include all four products",
        "right": "current direct candidate refs are HARNESS/OS while Web/Web-OS have only adjacent refs",
        "resolution": "Web/Web-OS remain unknown; adjacent product text does not close direct PHCAP-06 evidence",
    },
    "CONTR-04": {
        "left": "current HARNESS/OS candidate documents describe template semantic and lifecycle boundaries",
        "right": "candidate docs are draft/awaiting approval or proposed upstream waiting and do not establish formal L3",
        "resolution": "retained as current research premise; no formal L3, implementation, acceptance or CI is created",
    },
}


def sha(data):
    return hashlib.sha256(data).hexdigest()


def load_jsonl(path):
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def line_text(path, start, end):
    lines = path.read_text(encoding="utf-8").splitlines()
    if not isinstance(start, int) or not isinstance(end, int) or not (1 <= start <= end <= len(lines)):
        return None
    return "\n".join(lines[start - 1:end]) + "\n"


def fail(errors, condition, message):
    if not condition:
        errors.append(message)


def validate(inv):
    errors = []
    fail(errors, inv.get("schema") == "phcap06-design-research/v1", "E_SCHEMA")
    fail(errors, inv.get("status") == "research_premise_candidate", "E_STATUS")
    fail(errors, inv.get("authority_effect") == "none", "E_AUTHORITY")
    fail(errors, inv.get("meaning_change_applied") is False, "E_MEANING")
    fail(errors, inv.get("successor_requirement_ids") == [] and inv.get("human_decision_ref") is None, "E_DECISION_FIELDS")
    fail(errors, inv.get("equivalence_claim") is None, "E_EQUIVALENCE")
    fail(errors, inv.get("old_runtime_test_ci_execution") is False, "E_OLD_EXECUTION")
    fail(errors, inv.get("base", {}).get("commit") == BASE, "E_BASE")

    gap = inv.get("gap_interpretation", {})
    fail(errors, gap.get("inventory_product_targets") == sorted(PRODUCTS), "E_TARGETS")
    fail(errors, gap.get("inventory_current_evidence_products") == ["HELIX-HARNESS", "HELIX-OS"], "E_INVENTORY_DIRECT")
    fail(errors, set(gap.get("direct_current_evidence_products", [])) == DIRECT, "E_DIRECT_PRODUCTS")
    fail(errors, gap.get("missing_direct_current_products") == ["HELIX-Web", "HELIX-Web-OS"], "E_MISSING_PRODUCTS")
    fail(errors, gap.get("missing_status") == "unknown", "E_UNKNOWN_STATUS")
    fail(errors, gap.get("prohibited_inference") == "HELIX-Web/Web-OS direct PHCAP-06 ref absence is not an implementation absence claim", "E_NEGATIVE_BOUNDARY")
    fail(errors, gap.get("direct_current_evidence_refs") == [
        "docs/governance/candidates/design-template-system-requirements.md",
        "docs/governance/feature-tickets/FT-HARNESS-DESIGNTPL-001.md",
        "docs/governance/feature-tickets/FT-OS-DESIGNTPL-001.md",
    ], "E_DIRECT_REFS")

    legacy_rows = load_jsonl(ASSETS)
    phase_rows = load_jsonl(PHASES)
    decisions = load_jsonl(DECISIONS)
    asset_map = {row.get("asset_id"): row for row in legacy_rows}
    phase_map = {row.get("asset_id"): row for row in phase_rows}
    legacy = inv.get("legacy_assets", [])
    bounded = set(inv.get("scope", {}).get("bounded_asset_ids", []))
    fail(errors, len(legacy) == 6 and {x.get("asset_id") for x in legacy} == bounded, "E_ASSET_SCOPE")
    fail(errors, inv.get("counts", {}).get("legacy_assets") == 6, "E_ASSET_COUNT")
    fail(errors, inv.get("counts", {}).get("decision_records_found") == 0, "E_DECISION_COUNT")
    fail(errors, inv.get("counts", {}).get("legacy_consumer_refs_observed") == 0, "E_CONSUMER_COUNT")
    fail(errors, inv.get("legacy_summary", {}).get("new_build_allowed") is False, "E_NEW_BUILD")
    fail(errors, inv.get("legacy_summary", {}).get("maximum_layer_evidenced") == "L6", "E_MAX_LAYER")
    fail(errors, inv.get("legacy_summary", {}).get("capability_status") == "documented_with_implementation_assets", "E_CAPABILITY_STATUS")
    fail(errors, inv.get("legacy_summary", {}).get("transition_assessment") == "degraded_to_candidate", "E_TRANSITION")

    span_map = {}
    for item in legacy:
        aid = item.get("asset_id")
        old = asset_map.get(aid)
        phase = phase_map.get(aid)
        fail(errors, old is not None and phase is not None, "E_LEDGER:" + str(aid))
        if old is None or phase is None:
            continue
        expected = {
            "disposition": "unresolved", "implementation_status": "unknown", "consumer_refs": [],
            "product_target": "unresolved", "authority_status": "historical", "decision_record_ref": None,
        }
        for key, value in expected.items():
            fail(errors, old.get(key) == value, "E_ASSET_STATE:%s:%s" % (aid, key))
        for key, value in item.get("ledger_record", {}).items():
            fail(errors, old.get(key) == value, "E_LEDGER_SNAPSHOT:%s:%s" % (aid, key))
        for key in ("classification_id", "candidate_phase_targets", "candidate_product_targets", "phase_classification_status",
                    "product_classification_status", "consumer_closure_status", "consumer_refs",
                    "legacy_implementation_status", "legacy_execution_performed", "unresolved"):
            fail(errors, item.get("phase_classification_record", {}).get(key) == phase.get(key), "E_PHASE_SNAPSHOT:%s:%s" % (aid, key))
        fail(errors, phase.get("consumer_closure_status") == "pending", "E_PHASE_CONSUMER:" + aid)
        fail(errors, phase.get("consumer_refs") == [], "E_PHASE_CONSUMER_REFS:" + aid)
        fail(errors, phase.get("legacy_implementation_status") == "unknown", "E_PHASE_IMPL:" + aid)
        fail(errors, phase.get("legacy_execution_performed") is False, "E_PHASE_EXEC:" + aid)
        matches = [row for row in decisions if aid in json.dumps(row, ensure_ascii=False)]
        fail(errors, item.get("decision_history", {}).get("matching_decision_record_count") == len(matches), "E_DECISION_MATCH:" + aid)
        fail(errors, len(matches) == 0 and item.get("decision_history", {}).get("status") == "no_matching_append_only_decision_record", "E_DECISION_STATUS:" + aid)

        archive_path = item.get("archive_path", "")
        path = ROOT / archive_path
        fail(errors, archive_path.startswith(ARCHIVE_PREFIX), "E_ARCHIVE_PATH:" + aid)
        fail(errors, path.is_file(), "E_ARCHIVE_MISSING:" + aid)
        if path.is_file():
            fail(errors, sha(path.read_bytes()) == item.get("source_sha256"), "E_SOURCE_SHA:" + aid)
            fail(errors, len(path.read_text(encoding="utf-8").splitlines()) == item.get("source_line_count"), "E_SOURCE_LINES:" + aid)
            for span in item.get("source_spans", []):
                sid = span.get("span_id")
                span_map[sid] = (aid, span)
                text = line_text(path, span.get("start_line"), span.get("end_line"))
                fail(errors, text is not None, "E_SPAN_BOUNDS:" + str(sid))
                if text is not None:
                    fail(errors, text == span.get("exact_text"), "E_SPAN_TEXT:" + str(sid))
                    fail(errors, sha(text.encode()) == span.get("sha256"), "E_SPAN_SHA:" + str(sid))
        for kind in ("failure_evidence", "consumer_evidence"):
            records = item.get(kind, [])
            fail(errors, bool(records), "E_%s:%s" % (kind.upper(), aid))
            for record in records:
                fail(errors, record.get("span_id") in {x.get("span_id") for x in item.get("source_spans", [])}, "E_%s_SPAN:%s" % (kind.upper(), aid))

    atoms = inv.get("atoms", [])
    atom_ids = set()
    for atom in atoms:
        atom_id = atom.get("atom_id")
        fail(errors, isinstance(atom_id, str) and atom_id not in atom_ids, "E_ATOM_DUP:" + str(atom_id))
        atom_ids.add(atom_id)
        source_span = atom.get("source_span_id")
        fail(errors, source_span in span_map, "E_ATOM_SPAN:" + str(atom_id))
        if source_span in span_map:
            fail(errors, span_map[source_span][0] == atom.get("source_asset_id"), "E_ATOM_ASSET:" + str(atom_id))
        for key in ("meaning_candidate", "actor_candidate", "product_unit_candidate", "consumer_candidate", "failure_or_unresolved", "legacy_authority_or_enforced_by", "evidence_status"):
            fail(errors, isinstance(atom.get(key), str) and bool(atom.get(key).strip()), "E_ATOM_FIELD:%s:%s" % (atom_id, key))
        fail(errors, "unknown" in atom.get("evidence_status", "") or "unresolved" in atom.get("evidence_status", "") or "observed_legacy_text" in atom.get("evidence_status", ""), "E_ATOM_STATUS:" + str(atom_id))
    fail(errors, len(atoms) == 29 and len(atom_ids) == inv.get("counts", {}).get("semantic_atoms") == 29, "E_ATOM_COUNT")

    refs = inv.get("current_refs", [])
    fail(errors, len(refs) == 18 and len(refs) == inv.get("counts", {}).get("current_refs_recorded"), "E_CURRENT_COUNT")
    classifications = {"audit_context", "phase_inventory_ref", "direct_current_candidate", "adjacent_current_ref"}
    for ref in refs:
        rid = str(ref.get("ref_id"))
        path = ROOT / ref.get("path", "")
        fail(errors, path.is_file(), "E_CURRENT_MISSING:" + rid)
        if path.is_file():
            fail(errors, sha(path.read_bytes()) == ref.get("sha256"), "E_CURRENT_SHA:" + rid)
            text = line_text(path, ref.get("start_line"), ref.get("end_line"))
            fail(errors, text == ref.get("exact_text"), "E_CURRENT_TEXT:" + rid)
            if text is not None:
                fail(errors, sha(text.encode()) == ref.get("line_sha256"), "E_CURRENT_LINE_SHA:" + rid)
        fail(errors, ref.get("classification") in classifications, "E_CURRENT_CLASS:" + rid)
        fail(errors, ref.get("product") in ADJACENT or ref.get("product") == "all", "E_CURRENT_PRODUCT:" + rid)
    fail(errors, inv.get("counts", {}).get("direct_current_refs") == 4, "E_DIRECT_COUNT")
    fail(errors, inv.get("counts", {}).get("harness_direct_current_refs") == 2, "E_HARNESS_DIRECT_COUNT")
    fail(errors, inv.get("counts", {}).get("os_direct_current_refs") == 2, "E_OS_DIRECT_COUNT")
    fail(errors, inv.get("counts", {}).get("adjacent_current_refs") == 12, "E_ADJACENT_COUNT")
    fail(errors, inv.get("counts", {}).get("context_current_refs") == 2, "E_CONTEXT_COUNT")
    fail(errors, sum(r.get("classification") in {"audit_context", "phase_inventory_ref"} for r in refs) == 2, "E_CONTEXT_REF_CLASS_COUNT")
    fail(errors, sum(r.get("classification") == "direct_current_candidate" for r in refs) == 4, "E_DIRECT_REF_CLASS_COUNT")
    fail(errors, sum(r.get("classification") == "adjacent_current_ref" for r in refs) == 12, "E_ADJACENT_REF_CLASS_COUNT")

    products = inv.get("product_boundary_candidates", [])
    pmap2 = {row.get("product"): row for row in products}
    fail(errors, set(pmap2) == PRODUCTS, "E_PRODUCT_BOUNDARIES")
    for product in DIRECT:
        fail(errors, pmap2.get(product, {}).get("status") == "direct_current_candidate", "E_PRODUCT_DIRECT:" + product)
    for product in {"HELIX-Web", "HELIX-Web-OS"}:
        fail(errors, pmap2.get(product, {}).get("status") == "unknown_due_to_missing_direct_ref", "E_PRODUCT_UNKNOWN:" + product)
    fail(errors, "unknown" in pmap2.get("HELIX-Web", {}).get("boundary", "").lower(), "E_WEB_UNKNOWN_TEXT")
    fail(errors, "unknown" in pmap2.get("HELIX-Web-OS", {}).get("boundary", "").lower(), "E_WEBOS_UNKNOWN_TEXT")

    contradictions = inv.get("contradictions_preserved")
    fail(errors, isinstance(contradictions, list) and len(contradictions) == 4, "E_CONTRADICTIONS")
    seen = set()
    if isinstance(contradictions, list):
        for item in contradictions:
            cid = item.get("id") if isinstance(item, dict) else None
            fail(errors, cid in EXPECTED_CONTRADICTIONS and cid not in seen, "E_CONTRADICTION_ID:" + str(cid))
            seen.add(cid)
            expected = EXPECTED_CONTRADICTIONS.get(cid, {})
            fail(errors, isinstance(item, dict) and set(item) == {"id", "status", "left", "right", "resolution"}, "E_CONTRADICTION_FIELDS:" + str(cid))
            for key, value in expected.items():
                fail(errors, item.get(key) == value, "E_CONTRADICTION_TEXT:%s:%s" % (cid, key))
            fail(errors, item.get("status") == "unresolved_preserved", "E_CONTRADICTION_STATUS:" + str(cid))
    fail(errors, seen == set(EXPECTED_CONTRADICTIONS), "E_CONTRADICTION_SET")

    unresolved = inv.get("unresolved")
    fail(errors, isinstance(unresolved, list) and len(unresolved) == 14, "E_UNRESOLVED_COUNT")
    if isinstance(unresolved, list):
        for i, text in enumerate(unresolved):
            fail(errors, isinstance(text, str) and bool(text.strip()), "E_UNRESOLVED_TEXT:%d" % i)
    counts = inv.get("counts", {})
    fail(errors, counts.get("related_reference_assets") == 8, "E_RELATED_COUNT")
    fail(errors, counts.get("phase_candidate_asset_count") == 375, "E_PHASE_DENOMINATOR")
    fail(errors, counts.get("phase_and_product_candidate_asset_count") == 235, "E_PRODUCT_DENOMINATOR")
    for item in inv.get("related_reference_assets", []):
        state = item.get("ledger_state", {})
        for key, value in {"disposition": "unresolved", "implementation_status": "unknown", "consumer_refs": [], "decision_record_ref": None, "authority_status": "historical"}.items():
            fail(errors, state.get(key) == value, "E_RELATED_STATE:%s:%s" % (item.get("asset_id"), key))
    return errors


if __name__ == "__main__":
    errors = validate(json.loads(INV.read_text(encoding="utf-8")))
    if errors:
        print("FAIL PHCAP-06 validator")
        print("\n".join(errors))
        sys.exit(1)
    print("PASS PHCAP-06 validator: static source/ledger/phase/product/unknown checks")

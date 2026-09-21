#!/usr/bin/env python3
"""PHCAP-14 release research premise validator; static read-only checks only."""
import hashlib
import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
INV = HERE / "inventory.json"
LEDGER = ROOT / "docs/governance/legacy-asset-disposition.jsonl"
PHASE = ROOT / "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl"
DECISIONS = ROOT / "docs/governance/legacy-asset-decisions.jsonl"
ARCHIVE_PREFIX = "archive/legacy-generation-2026-09-14/root/"

CONTRADICTIONS = {
    "CONTR-01": {
        "left": "legacy source metadata and ADR/roadmap text describe confirmed or accepted release decisions and paths",
        "right": "selected asset ledgers remain historical, unresolved, implementation unknown, with no append-only decision closure",
        "resolution": "preserved historical decision claims versus ledger state; no current authority, adoption or completion is generated",
    },
    "CONTR-02": {
        "left": "legacy L10/test and implementation source describe release, promotion and rollback checks",
        "right": "legacy test/runtime/CI execution is prohibited and implementation status remains unknown",
        "resolution": "preserved source/test presence versus unknown execution/implementation; no current oracle or pass is generated",
    },
    "CONTR-03": {
        "left": "PHCAP-14 product_targets contains Web and Web-OS",
        "right": "inventory current.evidence_products contains only HARNESS and OS; Web/Web-OS refs are adjacent candidates",
        "resolution": "Web/Web-OS remain unknown; adjacent boundary text does not close direct PHCAP-14 evidence",
    },
    "CONTR-04": {
        "left": "Web-OS L2 names service release, artifact, deployment and rollback",
        "right": "Web-OS L2/L11 are draft/unexecuted and phase inventory does not list Web-OS as PHCAP-14 direct evidence",
        "resolution": "preserved as adjacent candidate responsibility; no current release implementation, promotion or rollback pass is generated",
    },
}


def digest(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def jsonl(path: Path):
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def fail(errors, condition, message):
    if not condition:
        errors.append(message)


def line_text(path: Path, start: int, end: int):
    lines = path.read_text(encoding="utf-8").splitlines()
    if not (1 <= start <= end <= len(lines)):
        return None
    return "\n".join(lines[start - 1 : end]) + "\n"


def validate(inv):
    errors = []
    fail(errors, inv.get("schema") == "phcap14-release-research/v1", "E_SCHEMA")
    fail(errors, inv.get("status") == "research_premise_candidate", "E_STATUS")
    fail(errors, inv.get("authority_effect") == "none", "E_AUTHORITY")
    fail(errors, inv.get("meaning_change_applied") is False, "E_MEANING")
    fail(errors, inv.get("successor_requirement_ids") == [] and inv.get("human_decision_ref") is None, "E_DECISION_FIELDS")
    fail(errors, inv.get("equivalence_claim") is None, "E_EQUIVALENCE")
    fail(errors, inv.get("old_runtime_test_ci_execution") is False, "E_OLD_EXECUTION")
    fail(errors, inv.get("base", {}).get("commit") == "569d7373c32287bbafadeec6043472563937c5c7", "E_BASE")

    gap = inv.get("gap_interpretation", {})
    fail(errors, gap.get("direct_current_evidence_products") == ["HELIX-HARNESS", "HELIX-OS"], "E_DIRECT_PRODUCTS")
    fail(errors, gap.get("missing_direct_current_products") == ["HELIX-Web", "HELIX-Web-OS"], "E_MISSING_PRODUCTS")
    fail(errors, gap.get("missing_status") == "unknown", "E_MISSING_STATUS")
    fail(errors, gap.get("prohibited_inference") == "HELIX-Web/Web-OS direct PHCAP-14 ref absence is not an implementation absence claim", "E_NEGATIVE_BOUNDARY")

    ledger = {x.get("asset_id"): x for x in jsonl(LEDGER)}
    phase = {x.get("asset_id"): x for x in jsonl(PHASE)}
    decision_rows = jsonl(DECISIONS)
    selected = inv.get("legacy_assets", [])
    expected_ids = set(inv.get("scope", {}).get("bounded_asset_ids", []))
    fail(errors, len(selected) == 4 and {x.get("asset_id") for x in selected} == expected_ids, "E_ASSET_SCOPE")
    fail(errors, inv.get("counts", {}).get("decision_records_found") == 0, "E_DECISION_COUNT")
    fail(errors, inv.get("counts", {}).get("legacy_consumer_refs_observed") == 0, "E_CONSUMER_COUNT")

    all_span_ids = set()
    for item in selected:
        aid = item.get("asset_id")
        old = ledger.get(aid)
        ph = phase.get(aid)
        fail(errors, old is not None and ph is not None, "E_LEDGER:" + str(aid))
        if old:
            for key, value in {
                "disposition": "unresolved",
                "implementation_status": "unknown",
                "consumer_refs": [],
                "product_target": "unresolved",
                "authority_status": "historical",
                "decision_record_ref": None,
            }.items():
                fail(errors, old.get(key) == value, f"E_ASSET_STATE:{aid}:{key}")
            for key, value in item.get("ledger_record", {}).items():
                fail(errors, old.get(key) == value, f"E_LEDGER_SNAPSHOT:{aid}:{key}")
        if ph:
            for key in ("consumer_closure_status", "consumer_refs", "legacy_implementation_status", "legacy_execution_performed"):
                expected = {"consumer_closure_status": "pending", "consumer_refs": [], "legacy_implementation_status": "unknown", "legacy_execution_performed": False}[key]
                fail(errors, ph.get(key) == expected, f"E_PHASE_STATE:{aid}:{key}")
            for key in ("classification_id", "candidate_phase_targets", "candidate_product_targets", "phase_classification_status", "product_classification_status", "consumer_closure_status", "consumer_refs", "legacy_implementation_status", "legacy_execution_performed", "unresolved"):
                fail(errors, item.get("phase_classification_record", {}).get(key) == ph.get(key), f"E_PHASE_SNAPSHOT:{aid}:{key}")
        matches = [x for x in decision_rows if aid in json.dumps(x, ensure_ascii=False)]
        fail(errors, not matches, "E_DECISION_MATCH:" + aid)
        fail(errors, item.get("decision_history", {}).get("matching_decision_record_count") == 0, "E_DECISION_HISTORY:" + aid)
        fail(errors, item.get("decision_history", {}).get("status") == "no_matching_append_only_decision_record", "E_DECISION_STATUS:" + aid)

        archive_path = item.get("archive_path", "")
        source = ROOT / archive_path
        fail(errors, archive_path.startswith(ARCHIVE_PREFIX), "E_ARCHIVE_PATH:" + aid)
        fail(errors, source.is_file(), "E_ARCHIVE_MISSING:" + aid)
        if source.is_file():
            fail(errors, digest(source.read_bytes()) == item.get("source_sha256"), "E_SOURCE_SHA:" + aid)
            fail(errors, len(source.read_text(encoding="utf-8").splitlines()) == item.get("source_line_count"), "E_SOURCE_LINES:" + aid)
            for source_span in item.get("source_spans", []):
                sid = source_span.get("span_id")
                all_span_ids.add(sid)
                text = line_text(source, source_span.get("start_line", 0), source_span.get("end_line", 0))
                fail(errors, text is not None, "E_SPAN_BOUNDS:" + str(sid))
                if text is not None:
                    fail(errors, text == source_span.get("exact_text"), "E_SPAN_TEXT:" + str(sid))
                    fail(errors, digest(text.encode()) == source_span.get("sha256"), "E_SPAN_SHA:" + str(sid))
        for evidence_key in ("failure_evidence", "consumer_evidence"):
            entries = item.get(evidence_key, [])
            fail(errors, bool(entries), f"E_{evidence_key.upper()}:{aid}")
            for entry in entries:
                fail(errors, entry.get("span_id") in {x.get("span_id") for x in item.get("source_spans", [])}, f"E_{evidence_key.upper()}_SPAN:{aid}")

    atoms = inv.get("atoms", [])
    atom_ids = set()
    for atom in atoms:
        atom_id = atom.get("atom_id")
        fail(errors, atom_id and atom_id not in atom_ids, "E_ATOM_DUP:" + str(atom_id))
        atom_ids.add(atom_id)
        fail(errors, atom.get("source_span_id") in all_span_ids, "E_ATOM_SPAN:" + str(atom_id))
        for key in ("meaning_candidate", "actor_candidate", "product_unit_candidate", "consumer_candidate", "failure_or_unresolved", "legacy_authority_or_enforced_by", "evidence_status"):
            fail(errors, isinstance(atom.get(key), str) and bool(atom.get(key).strip()), f"E_ATOM_FIELD:{atom_id}:{key}")
        fail(errors, "unknown" in atom.get("evidence_status", "") or "unresolved" in atom.get("evidence_status", "") or "historical" in atom.get("evidence_status", ""), "E_ATOM_STATUS:" + str(atom_id))
    fail(errors, len(atom_ids) == inv.get("counts", {}).get("semantic_atoms"), "E_ATOM_COUNT")

    refs = inv.get("current_refs", [])
    fail(errors, len(refs) == inv.get("counts", {}).get("current_refs_recorded"), "E_CURRENT_COUNT")
    direct = 0
    harness_direct = 0
    os_direct = 0
    adjacent = 0
    for current in refs:
        path = ROOT / current.get("path", "")
        fail(errors, path.is_file(), "E_CURRENT_MISSING:" + str(current.get("ref_id")))
        classification = current.get("classification")
        if classification in {"direct_current_ref", "direct_boundary_current_ref"}:
            direct += 1
            if current.get("product") == "HELIX-HARNESS":
                harness_direct += 1
            if current.get("product") == "HELIX-OS":
                os_direct += 1
        elif classification in {"adjacent_current_ref", "adjacent_boundary_current_ref"}:
            adjacent += 1
        else:
            fail(errors, False, "E_CURRENT_CLASS:" + str(current.get("ref_id")))
        if path.is_file():
            fail(errors, digest(path.read_bytes()) == current.get("sha256"), "E_CURRENT_SHA:" + str(current.get("ref_id")))
            text = line_text(path, current.get("start_line", 0), current.get("end_line", 0))
            fail(errors, text == current.get("exact_text"), "E_CURRENT_TEXT:" + str(current.get("ref_id")))
            if text is not None:
                fail(errors, digest(text.encode()) == current.get("line_sha256"), "E_CURRENT_LINE_SHA:" + str(current.get("ref_id")))
    fail(errors, direct == inv.get("counts", {}).get("direct_current_refs"), "E_DIRECT_REF_COUNT")
    fail(errors, harness_direct == inv.get("counts", {}).get("harness_direct_current_refs"), "E_HARNESS_DIRECT_COUNT")
    fail(errors, os_direct == inv.get("counts", {}).get("os_direct_current_refs"), "E_OS_DIRECT_COUNT")
    fail(errors, adjacent == inv.get("counts", {}).get("adjacent_current_refs"), "E_ADJACENT_REF_COUNT")

    related = inv.get("related_reference_assets", [])
    fail(errors, len(related) == inv.get("counts", {}).get("related_reference_assets"), "E_RELATED_COUNT")
    for item in related:
        old = ledger.get(item.get("asset_id"))
        fail(errors, old is not None, "E_RELATED_LEDGER:" + str(item.get("asset_id")))
        if old:
            for key in ("disposition", "implementation_status", "consumer_refs", "decision_record_ref", "product_target", "authority_status"):
                fail(errors, item.get("ledger_state", {}).get(key) == old.get(key), f"E_RELATED_STATE:{item.get('asset_id')}:{key}")

    contradictions = inv.get("contradictions_preserved", [])
    fail(errors, len(contradictions) == 4, "E_CONTRADICTIONS")
    seen = set()
    for item in contradictions:
        cid = item.get("id")
        fail(errors, cid in CONTRADICTIONS and cid not in seen, "E_CONTRADICTION_ID:" + str(cid))
        seen.add(cid)
        fail(errors, item.get("status") == "unresolved_preserved", "E_CONTRADICTION_STATUS:" + str(cid))
        for key, value in CONTRADICTIONS.get(cid, {}).items():
            fail(errors, item.get(key) == value, f"E_CONTRADICTION_TEXT:{cid}:{key}")
    fail(errors, seen == set(CONTRADICTIONS), "E_CONTRADICTION_SET")

    unresolved = inv.get("unresolved", [])
    fail(errors, isinstance(unresolved, list) and len(unresolved) == 12, "E_UNRESOLVED")
    for index, item in enumerate(unresolved):
        fail(errors, isinstance(item, str) and bool(item.strip()), f"E_UNRESOLVED_TEXT:{index}")
    fail(errors, inv.get("counts", {}).get("source_spans") == len(all_span_ids) == 15, "E_SOURCE_SPAN_COUNT")
    return errors


if __name__ == "__main__":
    errors = validate(json.loads(INV.read_text(encoding="utf-8")))
    if errors:
        print("FAIL PHCAP-14 validator")
        print("\n".join(errors))
        sys.exit(1)
    print("PASS PHCAP-14 validator: static source/ledger/boundary/unknown checks")

#!/usr/bin/env python3
"""PHCAP-17 incident research premise validator; read-only static checks."""
import hashlib, json, os, sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
INV = HERE / "inventory.json"
ASSET_LEDGER = ROOT / "docs/governance/legacy-asset-disposition.jsonl"
PHASE_LEDGER = ROOT / "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl"
DECISION_LOG = ROOT / "docs/governance/legacy-asset-decisions.jsonl"
ARCHIVE_PREFIX = "archive/legacy-generation-2026-09-14/root/"

def digest(data): return hashlib.sha256(data).hexdigest()
def load_jsonl(path):
    return [json.loads(x) for x in path.read_text(encoding="utf-8").splitlines() if x.strip()]
def fail(errors, cond, msg):
    if not cond: errors.append(msg)
def line_text(path, start, end):
    lines = path.read_text(encoding="utf-8").splitlines()
    if not (1 <= start <= end <= len(lines)): return None
    return "\n".join(lines[start-1:end]) + "\n"

def validate(inv):
    errors=[]
    fail(errors, inv.get("schema") == "phcap17-incident-research/v1", "E_SCHEMA")
    fail(errors, inv.get("status") == "research_premise_candidate", "E_STATUS")
    fail(errors, inv.get("authority_effect") == "none", "E_AUTHORITY")
    fail(errors, inv.get("meaning_change_applied") is False, "E_MEANING")
    fail(errors, inv.get("successor_requirement_ids") == [] and inv.get("human_decision_ref") is None, "E_DECISION_FIELDS")
    fail(errors, inv.get("equivalence_claim") is None, "E_EQUIVALENCE")
    fail(errors, inv.get("old_runtime_test_ci_execution") is False, "E_OLD_EXECUTION")
    fail(errors, inv.get("base", {}).get("commit") == "bcd54942763835492478d998ced6c3b56566b89b", "E_BASE")
    gap=inv.get("gap_interpretation", {})
    fail(errors, gap.get("harness_direct_current_evidence") == [] and gap.get("harness_status") == "unknown", "E_HARNESS_UNKNOWN")
    fail(errors, gap.get("prohibited_inference") == "HARNESS current-ref absence is not an implementation absence claim", "E_HARNESS_BOUNDARY")
    assets=load_jsonl(ASSET_LEDGER); phases=load_jsonl(PHASE_LEDGER); decisions=load_jsonl(DECISION_LOG)
    amap={x.get("asset_id"):x for x in assets}; pmap={x.get("asset_id"):x for x in phases}
    legacy=inv.get("legacy_assets", [])
    expected=set(inv.get("scope", {}).get("bounded_asset_ids", []))
    fail(errors, len(legacy)==4 and {x.get("asset_id") for x in legacy}==expected, "E_ASSET_SCOPE")
    fail(errors, inv.get("counts", {}).get("decision_records_found") == 0, "E_DECISION_COUNT")
    fail(errors, inv.get("counts", {}).get("legacy_consumer_refs_observed") == 0, "E_CONSUMER_COUNT")
    for item in legacy:
        aid=item.get("asset_id"); old=amap.get(aid); phase=pmap.get(aid)
        fail(errors, old is not None and phase is not None, "E_LEDGER:"+str(aid))
        if old:
            expected_fields={"disposition":"unresolved","implementation_status":"unknown","consumer_refs":[],"product_target":"unresolved","authority_status":"historical","decision_record_ref":None}
            for key,val in expected_fields.items(): fail(errors, old.get(key)==val, "E_ASSET_STATE:%s:%s"%(aid,key))
            for key,val in item.get("ledger_record", {}).items(): fail(errors, old.get(key)==val, "E_LEDGER_SNAPSHOT:%s:%s"%(aid,key))
        if phase:
            fail(errors, phase.get("consumer_closure_status")=="pending", "E_PHASE_CONSUMER:"+aid)
            fail(errors, phase.get("consumer_refs")==[], "E_PHASE_CONSUMER_REFS:"+aid)
            fail(errors, phase.get("legacy_implementation_status")=="unknown", "E_PHASE_IMPL:"+aid)
            fail(errors, phase.get("legacy_execution_performed") is False, "E_PHASE_EXEC:"+aid)
            for key in ("classification_id", "candidate_phase_targets", "candidate_product_targets", "phase_classification_status", "product_classification_status", "consumer_closure_status", "consumer_refs", "legacy_implementation_status", "legacy_execution_performed", "unresolved"):
                fail(errors, item.get("phase_classification_record", {}).get(key) == phase.get(key), "E_PHASE_SNAPSHOT:%s:%s" % (aid, key))
        fail(errors, item.get("decision_history", {}).get("matching_decision_record_count")==0, "E_DECISION_MATCH:"+aid)
        fail(errors, item.get("decision_history", {}).get("status")=="no_matching_append_only_decision_record", "E_DECISION_STATUS:"+aid)
        source_path=ROOT / item.get("archive_path", "")
        fail(errors, item.get("archive_path", "").startswith(ARCHIVE_PREFIX), "E_ARCHIVE_PATH:"+aid)
        fail(errors, source_path.is_file(), "E_ARCHIVE_MISSING:"+aid)
        if source_path.is_file():
            fail(errors, digest(source_path.read_bytes())==item.get("source_sha256"), "E_SOURCE_SHA:"+aid)
            fail(errors, len(source_path.read_text(encoding="utf-8").splitlines()) == item.get("source_line_count"), "E_SOURCE_LINES:"+aid)
            for span in item.get("source_spans", []):
                text=line_text(source_path, span.get("start_line",0), span.get("end_line",0))
                fail(errors, text is not None, "E_SPAN_BOUNDS:"+span.get("span_id", ""))
                if text is not None:
                    fail(errors, text==span.get("exact_text"), "E_SPAN_TEXT:"+span.get("span_id", ""))
                    fail(errors, digest(text.encode())==span.get("sha256"), "E_SPAN_SHA:"+span.get("span_id", ""))
        for evidence_key in ("failure_evidence", "consumer_evidence"):
            records=item.get(evidence_key, [])
            fail(errors, bool(records), "E_ASSET_%s:%s" % (evidence_key.upper(), aid))
            for record in records:
                fail(errors, record.get("span_id") in {s.get("span_id") for s in item.get("source_spans", [])}, "E_ASSET_%s_SPAN:%s" % (evidence_key.upper(), aid))
    span_map={s.get("span_id"):(a.get("asset_id"), s) for a in legacy for s in a.get("source_spans", [])}
    span_ids=set(span_map)
    atoms=inv.get("atoms",[]); atom_ids=set()
    for atom in atoms:
        aid=atom.get("atom_id"); fail(errors, aid and aid not in atom_ids, "E_ATOM_DUP:"+str(aid)); atom_ids.add(aid)
        fail(errors, atom.get("source_span_id") in span_ids, "E_ATOM_SPAN:"+str(aid))
        if atom.get("source_span_id") in span_map:
            fail(errors, span_map[atom.get("source_span_id")][0] == atom.get("source_asset_id"), "E_ATOM_ASSET_SPAN:"+str(aid))
        fail(errors, atom.get("actor_candidate") and atom.get("legacy_authority_or_enforced_by"), "E_ATOM_ACTOR_AUTH:"+str(aid))
        fail(errors, atom.get("failure_or_unresolved") and atom.get("consumer_candidate"), "E_ATOM_FAILURE_CONSUMER:"+str(aid))
        fail(errors, "candidate" in atom.get("product_unit_candidate","") or "unresolved" in atom.get("product_unit_candidate","") or "connection" in atom.get("product_unit_candidate","") , "E_ATOM_PRODUCT_BOUNDARY:"+str(aid))
        fail(errors, "unknown" in atom.get("evidence_status","") or "unresolved" in atom.get("evidence_status","") or "observed_legacy_text" in atom.get("evidence_status","") or "contradiction" in atom.get("evidence_status","") , "E_ATOM_STATUS:"+str(aid))
    fail(errors, len(atom_ids)==inv.get("counts",{}).get("semantic_atoms"), "E_ATOM_COUNT")
    refs=inv.get("current_refs",[]); fail(errors, len(refs)==inv.get("counts",{}).get("current_refs_recorded"), "E_CURRENT_COUNT")
    for ref in refs:
        path=ROOT/ref.get("path",""); fail(errors, path.is_file(), "E_CURRENT_MISSING:"+str(ref.get("ref_id")))
        if path.is_file():
            fail(errors, digest(path.read_bytes())==ref.get("sha256"), "E_CURRENT_SHA:"+str(ref.get("ref_id")))
            text=line_text(path, ref.get("start_line",0), ref.get("end_line",0)); fail(errors, text==ref.get("exact_text"), "E_CURRENT_TEXT:"+str(ref.get("ref_id")))
            if text is not None: fail(errors, digest(text.encode())==ref.get("line_sha256"), "E_CURRENT_LINE_SHA:"+str(ref.get("ref_id")))
        fail(errors, ref.get("classification") in {"direct_current_ref","direct_boundary_current_ref","adjacent_current_ref","boundary_candidate"}, "E_CURRENT_CLASS:"+str(ref.get("ref_id")))
    fail(errors, inv.get("counts",{}).get("harness_direct_current_refs")==0, "E_HARNESS_DIRECT_COUNT")
    fail(errors, len(inv.get("contradictions_preserved",[]))>=3, "E_CONTRADICTIONS")
    fail(errors, len(inv.get("unresolved",[]))>=7, "E_UNRESOLVED")
    return errors

if __name__ == "__main__":
    errors=validate(json.loads(INV.read_text(encoding="utf-8")))
    if errors:
        print("FAIL PHCAP-17 validator")
        print("\n".join(errors))
        sys.exit(1)
    print("PASS PHCAP-17 validator: static source/ledger/boundary/unknown checks")

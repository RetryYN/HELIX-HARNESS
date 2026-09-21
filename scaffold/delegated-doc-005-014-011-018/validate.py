#!/usr/bin/env python3
"""RDP-001 delegated pair scaffold validator; read-only and fail-closed."""
import hashlib
import importlib.util
import json
import os
import re
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
INV = os.path.join(HERE, "inventory.json")
SOURCE = "docs/governance/delegated-requirement-document-source-holding.jsonl"
REF = "docs/governance/delegated-requirement-document-reference-holding.jsonl"
ASSET = "docs/governance/legacy-asset-disposition.jsonl"
PHASE = "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl"
EXPECTED_BASE = "ec80948df480d144022ff5e510ff94f0839f8a7a"
EXPECTED_DOCS = {"DELEGATED-DOC-005", "DELEGATED-DOC-014", "DELEGATED-DOC-011", "DELEGATED-DOC-018"}
EXPECTED_EDGES = {"DELEGATED-REF-0305", "DELEGATED-REF-0763", "DELEGATED-REF-0373", "DELEGATED-REF-0783"}
PRIOR_DOCS = {
    "DELEGATED-DOC-003", "DELEGATED-DOC-028", "DELEGATED-DOC-008", "DELEGATED-DOC-017",
    "DELEGATED-DOC-006", "DELEGATED-DOC-015", "DELEGATED-DOC-002", "DELEGATED-DOC-013",
    "DELEGATED-DOC-004", "DELEGATED-DOC-029",
}
PRIOR_EDGES = {
    "DELEGATED-REF-0303", "DELEGATED-REF-0759", "DELEGATED-REF-0760", "DELEGATED-REF-0341",
    "DELEGATED-REF-0342", "DELEGATED-REF-0414", "DELEGATED-REF-0415", "DELEGATED-REF-0772",
    "DELEGATED-REF-0308", "DELEGATED-REF-0424", "DELEGATED-REF-0425", "DELEGATED-REF-0765",
    "DELEGATED-REF-0301", "DELEGATED-REF-0302", "DELEGATED-REF-0422", "DELEGATED-REF-0423",
    "DELEGATED-REF-0757", "DELEGATED-REF-0758", "DELEGATED-REF-0304", "DELEGATED-REF-0419",
    "DELEGATED-REF-0761", "DELEGATED-REF-0762",
}
EXPECTED_CLOSURE_GUARD = {
    "authority_effect": "none",
    "meaning_change_applied": False,
    "successor_requirement_ids": [],
    "human_decision_ref": None,
    "source_carry_status": "preserved_pending_atomization",
    "reference_carry_status": "preserved_pending_atomization",
    "adoption_state": "none",
    "holding_closure": "not_performed",
    "prohibited_inference": [
        "owner adoption", "phase authority", "legacy implementation", "consumer closure",
        "acceptance completion", "L3/L10 freeze", "runtime or CI readiness",
    ],
}
AC_ID = re.compile(r"\b(?:[A-Z][A-Z0-9]*-AC-[A-Za-z0-9]+|LSAC-[A-Za-z0-9]+)\b")
CANON_ID = re.compile(r"\b(?:GOP-(?:FR|AC)-[A-Za-z0-9]+|WCC-(?:FR|AC)-[A-Za-z0-9]+)\b")
TEST_ID = re.compile(r"\b(?:GOP-T-[A-Za-z0-9]+|HAT-WCC-[A-Za-z0-9]+)\b")


def digest(data):
    return hashlib.sha256(data).hexdigest()


def read_jsonl(rel):
    with open(os.path.join(ROOT, rel), encoding="utf-8") as fh:
        return [json.loads(line) for line in fh if line.strip()]


def load_inventory(path=INV):
    with open(path, encoding="utf-8") as fh:
        return json.load(fh)


def fixed_blob_acceptance_sets(pair, docs, root=ROOT):
    """Recompute AC definitions and explicit L10 test-to-AC references from archive blobs."""
    l3 = docs[pair["l3_document_id"]]
    l10 = docs[pair["l10_document_id"]]
    with open(os.path.join(root, l3["archive_path"]), encoding="utf-8") as fh:
        l3_lines = fh.read().splitlines()
    with open(os.path.join(root, l10["archive_path"]), encoding="utf-8") as fh:
        l10_lines = fh.read().splitlines()
    defined = set(AC_ID.findall("\n".join(l3_lines)))
    test_refs = {}
    for line_no, line in enumerate(l10_lines, 1):
        tests = TEST_ID.findall(line)
        if not tests:
            continue
        refs = AC_ID.findall(line)
        for test_id in tests:
            test_refs.setdefault(test_id, []).extend(refs)
    referenced = {ref for refs in test_refs.values() for ref in refs}
    return defined, referenced, test_refs


def validate_inventory(inv, root=ROOT):
    errors = []

    def req(condition, message):
        if not condition:
            errors.append(message)

    req(inv.get("schema") == "rdp001-delegated-document-pair-scaffold/v1", "E_SCHEMA")
    req(inv.get("status") == "scaffold_candidate_pending_review", "E_STATE")
    req(inv.get("authority_effect") == "none", "E_AUTHORITY")
    req(inv.get("meaning_change_applied") is False, "E_MEANING")
    req(inv.get("successor_requirement_ids") == [] and inv.get("human_decision_ref") is None, "E_DECISION")
    req(inv.get("equivalence_claim") is None, "E_EQUIVALENCE")
    req(inv.get("old_runtime_test_ci_execution") is False, "E_EXECUTION")
    req(inv.get("comparison", {}).get("fixed_source_revision") == EXPECTED_BASE, "E_BASE_REVISION")
    guard = inv.get("closure_guard")
    req(guard == EXPECTED_CLOSURE_GUARD, "E_CLOSURE_GUARD_EXACT")
    if isinstance(guard, dict):
        req(inv.get("authority_effect") == guard.get("authority_effect"), "E_CLOSURE_TOP_AUTHORITY")
        req(inv.get("meaning_change_applied") == guard.get("meaning_change_applied"), "E_CLOSURE_TOP_MEANING")
        req(inv.get("successor_requirement_ids") == guard.get("successor_requirement_ids"), "E_CLOSURE_TOP_SUCCESSOR")
        req(inv.get("human_decision_ref") == guard.get("human_decision_ref"), "E_CLOSURE_TOP_DECISION")

    docs = {x.get("source_document_id"): x for x in inv.get("source_documents", [])}
    refs = {x.get("reference_id"): x for x in inv.get("reference_edges", [])}
    req(set(docs) == EXPECTED_DOCS, "E_SCOPE_DOCS")
    req(set(refs) == EXPECTED_EDGES, "E_SCOPE_REFS")
    req(not set(docs) & PRIOR_DOCS and not set(refs) & PRIOR_EDGES, "E_OVERLAP")
    srows, rrows = read_jsonl(SOURCE), read_jsonl(REF)
    arows, prows = read_jsonl(ASSET), read_jsonl(PHASE)
    smap = {x["source_document_id"]: x for x in srows}
    rmap = {x["reference_id"]: x for x in rrows}
    amap = {x["source_path"]: x for x in arows}
    pmap = {x["source_path"]: x for x in prows}
    req(len(srows) == 114 and len(rrows) == 788, "E_DENOM_LEDGER")
    hd = inv.get("comparison", {}).get("holding_denominator", {})
    req(hd.get("source_documents_total") == 114 and hd.get("reference_edges_total") == 788, "E_DENOM_TOTAL")
    req(hd.get("prior_candidate_source_document_count") == 10 and hd.get("prior_candidate_reference_edge_count") == 22, "E_DENOM_PRIOR")
    req(hd.get("remaining_before_this_batch_source_documents") == 104 and hd.get("remaining_before_this_batch_reference_edges") == 766, "E_DENOM_REMAINDER")
    req(hd.get("selected_source_document_count") == 4 and hd.get("selected_reference_edge_count") == 4, "E_DENOM_SELECTED")
    req(hd.get("remaining_source_documents_after_prior_and_selected") == 100 and hd.get("remaining_reference_edges_after_prior_and_selected") == 762, "E_DENOM_AFTER")
    req(len(inv.get("unresolved_crossdoc_references", [])) >= 1, "E_MISSING_REFS")

    for did, doc in docs.items():
        src = smap.get(did)
        req(src is not None, "E_SOURCE_LEDGER:" + str(did))
        if not src:
            continue
        req(doc.get("source_path") == src["source_path"] and doc.get("archive_path") == src["archive_path"], "E_SOURCE_PATH:" + did)
        req(doc.get("sha256") == src["sha256"], "E_SOURCE_SHA:" + did)
        path = os.path.join(root, doc["archive_path"])
        req(os.path.isfile(path), "E_SOURCE_MISSING:" + did)
        if not os.path.isfile(path):
            continue
        data = open(path, "rb").read()
        lines = data.decode("utf-8").splitlines()
        req(digest(data) == src["sha256"], "E_SOURCE_BLOB:" + did)
        req(doc.get("line_count") == len(lines), "E_SOURCE_LINES:" + did)
        spans = doc.get("coverage_spans", [])
        req(len(spans) == 1 and spans[0].get("start_line") == 1 and spans[0].get("end_line") == len(lines), "E_COVERAGE_FULL:" + did)
        if len(spans) == 1 and spans[0].get("start_line") == 1 and spans[0].get("end_line") == len(lines):
            req(spans[0].get("sha256") == "sha256:" + digest(data), "E_COVERAGE_SHA:" + did)
        atom_lines = set()
        for atom in inv.get("atoms", []):
            if atom.get("source_document_id") != did:
                continue
            span = atom.get("source_span", {})
            start, end = span.get("start_line"), span.get("end_line")
            if start and end:
                req(1 <= start <= end <= len(lines), "E_ATOM_BOUNDS:" + str(atom.get("semantic_atom_id")))
                atom_lines.update(range(start, end + 1))
        uncovered = sorted(set(range(1, len(lines) + 1)) - atom_lines)
        coverage = doc.get("atom_coverage", {})
        uncovered_text = "\n".join(lines[line - 1] for line in uncovered) + "\n" if uncovered else ""
        req(coverage.get("covered_line_count") == len(atom_lines), "E_ATOM_COVERED_LINES:" + did)
        req(coverage.get("uncovered_line_count") == len(uncovered), "E_ATOM_UNCOVERED_COUNT:" + did)
        req(coverage.get("uncovered_lines") == uncovered, "E_ATOM_UNCOVERED_LIST:" + did)
        req(coverage.get("uncovered_line_sha256") == "sha256:" + digest(uncovered_text.encode()), "E_ATOM_UNCOVERED_SHA:" + did)
        req(coverage.get("source_grounding") and coverage.get("fail_close_rule"), "E_ATOM_COVERAGE_POLICY:" + did)
        old, phase, state = amap.get(doc["source_path"]), pmap.get(doc["source_path"]), doc.get("legacy_state", {})
        req(old is not None and phase is not None, "E_LEGACY_LEDGER:" + did)
        if old and phase:
            req(state.get("asset_id") == old.get("asset_id"), "E_ASSET_ID:" + did)
            req(state.get("implementation_status") == "unknown" and state.get("legacy_implementation_status") == "unknown", "E_LEGACY_IMPL:" + did)
            req(state.get("legacy_execution_performed") is False, "E_LEGACY_EXECUTION:" + did)
            req(state.get("consumer_status") == "pending" and state.get("consumer_refs") == [], "E_LEGACY_CONSUMER:" + did)
            req(state.get("phase_authority_status") == "unconfirmed", "E_PHASE_AUTHORITY:" + did)

    denom = inv.get("atom_denominator", {})
    covered = sum(x.get("atom_coverage", {}).get("covered_line_count", -1) for x in docs.values())
    uncovered = sum(x.get("atom_coverage", {}).get("uncovered_line_count", -1) for x in docs.values())
    req(denom.get("source_documents") == 4 and denom.get("source_lines") == sum(x.get("line_count", 0) for x in docs.values()), "E_ATOM_SOURCE_DENOM")
    req(denom.get("semantic_atoms") == len(inv.get("atoms", [])), "E_ATOM_COUNT")
    req(denom.get("atom_covered_lines") == covered, "E_ATOM_COVERED_DENOM")
    req(denom.get("atom_uncovered_lines") == uncovered, "E_ATOM_UNCOVERED_DENOM")
    req(denom.get("reference_edges") == 4 and denom.get("full_blob_coverage_spans") == 4, "E_ATOM_EDGE_DENOM")

    for rid, ref in refs.items():
        ledger = rmap.get(rid)
        req(ledger is not None, "E_REF_LEDGER:" + rid)
        if ledger:
            for key in ("source_path", "source_file_sha256", "source_line", "target_path", "target_sha256", "reference_origin", "carry_status"):
                req(ref.get(key) == ledger.get(key), "E_REF:" + rid + ":" + key)

    seen = set()
    for atom in inv.get("atoms", []):
        aid = atom.get("semantic_atom_id")
        req(aid and aid not in seen, "E_ATOM_DUP:" + str(aid))
        seen.add(aid)
        did = atom.get("source_document_id")
        doc = docs.get(did)
        req(doc is not None, "E_ATOM_SOURCE:" + str(aid))
        req(atom.get("candidate_target") == "unresolved", "E_ATOM_TARGET:" + str(aid))
        req(set(atom.get("owner_candidates", [])) >= {"HELIX-HARNESS", "HELIX-OS"}, "E_ATOM_OWNER:" + str(aid))
        req(set(atom.get("consumer_candidates", [])) >= {"HELIX-HARNESS", "HELIX-OS"}, "E_ATOM_CONSUMER:" + str(aid))
        state = atom.get("legacy_state", {})
        req(state.get("legacy_implementation_status") == "unknown" and state.get("legacy_execution_performed") is False, "E_ATOM_IMPL:" + str(aid))
        req(state.get("consumer_status") == "pending" and state.get("consumer_refs") == [], "E_ATOM_CLOSED_CONSUMER:" + str(aid))
        req(state.get("phase_authority_status") == "unconfirmed", "E_ATOM_PHASE:" + str(aid))
        req(atom.get("actors") and atom.get("authority_conditions") and atom.get("negative_conditions"), "E_ATOM_CONTEXT:" + str(aid))
        span = atom.get("source_span", {})
        req(atom.get("original_id") and span.get("exact_source_text"), "E_ATOM_ID_SPAN:" + str(aid))
        if doc and span.get("start_line") and span.get("end_line"):
            with open(os.path.join(root, doc["archive_path"]), encoding="utf-8") as fh:
                lines = fh.read().splitlines()
            start, end = span["start_line"], span["end_line"]
            exact = "\n".join(lines[start - 1:end]) + "\n"
            req(span.get("exact_source_text") == exact, "E_ATOM_TEXT:" + str(aid))
            req(span.get("sha256") == "sha256:" + digest(exact.encode()), "E_ATOM_SHA:" + str(aid))
            req(atom.get("original_id") in exact, "E_ATOM_ORIGINAL_ID:" + str(aid))
    req(len(seen) == denom.get("semantic_atoms"), "E_ATOM_DENOM")

    for pair in inv.get("comparison", {}).get("pair_groups", []):
        req(set(pair.get("reference_edge_ids", [])) <= set(refs), "E_PAIR_REFS:" + str(pair.get("pair_id")))
        req(pair.get("unresolved_crossdoc_references") is not None, "E_PAIR_GAPS:" + str(pair.get("pair_id")))
        l3, l10 = pair["l3_document_id"], pair["l10_document_id"]
        defined, referenced, test_refs = fixed_blob_acceptance_sets(pair, docs, root)
        req(sorted(defined) == sorted(pair.get("l3_defined_acceptance_ids", [])), "E_PAIR_AC_DEFINED:" + str(pair.get("pair_id")))
        req(sorted(referenced) == sorted(pair.get("l10_test_acceptance_refs", [])), "E_PAIR_AC_REFERENCED:" + str(pair.get("pair_id")))
        diff = defined - referenced
        unresolved_records = {x.get("original_id") for x in pair.get("unresolved_crossdoc_references", []) if x.get("original_id") in defined}
        req(sorted(diff) == sorted(pair.get("unresolved_acceptance_difference_ids", [])), "E_PAIR_AC_DIFFERENCE:" + str(pair.get("pair_id")))
        req(diff == unresolved_records, "E_PAIR_AC_UNRESOLVED_RECORD:" + str(pair.get("pair_id")))
        req(not (referenced - defined), "E_PAIR_AC_UNDEFINED_REFERENCE:" + str(pair.get("pair_id")))
        req(sorted(set(CANON_ID.findall("\n".join(open(os.path.join(root, docs[l3]["archive_path"]), encoding="utf-8").read().splitlines())))) == sorted(pair.get("l3_original_ids", [])), "E_PAIR_L3_IDS:" + str(pair.get("pair_id")))
        req(sorted(set(TEST_ID.findall("\n".join(open(os.path.join(root, docs[l10]["archive_path"]), encoding="utf-8").read().splitlines())))) == sorted(pair.get("l10_original_ids", [])), "E_PAIR_L10_IDS:" + str(pair.get("pair_id")))
        for test_id in pair.get("l10_original_ids", []):
            req(len(set(test_refs.get(test_id, []))) == 1, "E_PAIR_T_AC_CARDINALITY:" + test_id)
            for atom in inv.get("atoms", []):
                if atom.get("source_document_id") == l10 and atom.get("original_id") == test_id:
                    req(set(test_refs.get(test_id, [])).issubset(set(AC_ID.findall(atom.get("source_span", {}).get("exact_source_text", "")))), "E_PAIR_ATOM_PARITY:" + test_id)
    return errors


if __name__ == "__main__":
    inventory = load_inventory()
    errors = validate_inventory(inventory)
    if errors:
        for error in errors:
            print(error, file=sys.stderr)
        raise SystemExit(1)
    d = inventory["atom_denominator"]
    print("PASS RDP-001 delegated pairs: docs=4 lines=%d atoms=%d edges=4 residual=100/762" % (d["source_lines"], d["semantic_atoms"]))

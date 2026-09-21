#!/usr/bin/env python3
"""RDP-001 delegated pair scaffold validator; read-only and fail-closed."""
import hashlib, json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
INV = os.path.join(HERE, "inventory.json")
SOURCE = "docs/governance/delegated-requirement-document-source-holding.jsonl"
REF = "docs/governance/delegated-requirement-document-reference-holding.jsonl"
ASSET = "docs/governance/legacy-asset-disposition.jsonl"
PHASE = "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl"
EXPECTED_DOCS = {"DELEGATED-DOC-002", "DELEGATED-DOC-013", "DELEGATED-DOC-004", "DELEGATED-DOC-029"}
EXPECTED_EDGES = {"DELEGATED-REF-0301", "DELEGATED-REF-0302", "DELEGATED-REF-0422", "DELEGATED-REF-0423", "DELEGATED-REF-0757", "DELEGATED-REF-0758", "DELEGATED-REF-0304", "DELEGATED-REF-0419", "DELEGATED-REF-0761", "DELEGATED-REF-0762"}
PRIOR_DOCS = {"DELEGATED-DOC-003", "DELEGATED-DOC-028", "DELEGATED-DOC-008", "DELEGATED-DOC-017", "DELEGATED-DOC-006", "DELEGATED-DOC-015"}
PRIOR_EDGES = {"DELEGATED-REF-0303", "DELEGATED-REF-0759", "DELEGATED-REF-0760", "DELEGATED-REF-0341", "DELEGATED-REF-0342", "DELEGATED-REF-0414", "DELEGATED-REF-0415", "DELEGATED-REF-0772", "DELEGATED-REF-0308", "DELEGATED-REF-0424", "DELEGATED-REF-0425", "DELEGATED-REF-0765"}
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
        "owner adoption",
        "phase authority",
        "legacy implementation",
        "consumer closure",
        "acceptance completion",
        "L3/L10 freeze",
        "runtime or CI readiness",
    ],
}
AC_ID = re.compile(r"\bGH-AC-\d{3}\b")
TEST_ID = re.compile(r"\bGH-T-\d{3}\b")

def digest(data):
    return hashlib.sha256(data).hexdigest()

def line_digest(lines, start, end):
    return digest(("\n".join(lines[start - 1:end]) + "\n").encode())

def read_jsonl(rel):
    with open(os.path.join(ROOT, rel), encoding="utf-8") as f:
        return [json.loads(x) for x in f if x.strip()]

def load_inventory(path=INV):
    with open(path, encoding="utf-8") as f:
        return json.load(f)

def fixed_blob_acceptance_sets(pair, docs, root):
    """Derive AC definitions and explicit L10 T→AC references from fixed archive blobs."""
    l3 = docs[pair["l3_document_id"]]
    l10 = docs[pair["l10_document_id"]]
    with open(os.path.join(root, l3["archive_path"]), encoding="utf-8") as f:
        l3_lines = f.read().splitlines()
    with open(os.path.join(root, l10["archive_path"]), encoding="utf-8") as f:
        l10_lines = f.read().splitlines()
    defined = set(AC_ID.findall("\n".join(l3_lines)))
    test_refs = {}
    for line_no, line in enumerate(l10_lines, 1):
        tests = TEST_ID.findall(line)
        if not tests:
            continue
        refs = AC_ID.findall(line)
        for test_id in tests:
            test_refs.setdefault(test_id, []).extend(refs)
    referenced = set(ref for values in test_refs.values() for ref in values)
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
    req(hd.get("prior_candidate_source_document_count") == 6 and hd.get("prior_candidate_reference_edge_count") == 12, "E_DENOM_PRIOR")
    req(hd.get("selected_source_document_count") == 4 and hd.get("selected_reference_edge_count") == 10, "E_DENOM_SELECTED")
    req(hd.get("remaining_source_documents_after_prior_and_selected") == 104 and hd.get("remaining_reference_edges_after_prior_and_selected") == 766, "E_DENOM_REMAINING")
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
        spans = sorted(doc.get("coverage_spans", []), key=lambda x: x.get("start_line", 0))
        cursor = 1
        req(spans, "E_COVERAGE_NONE:" + did)
        for span in spans:
            req(span.get("start_line") == cursor, "E_COVERAGE_GAP:" + did)
            start, end = span.get("start_line", 0), span.get("end_line", 0)
            req(1 <= start <= end <= len(lines), "E_COVERAGE_BOUNDS:" + did)
            if 1 <= start <= end <= len(lines):
                req(span.get("sha256") == "sha256:" + line_digest(lines, start, end), "E_COVERAGE_SHA:" + did)
            cursor = end + 1
        req(cursor == len(lines) + 1, "E_COVERAGE_INCOMPLETE:" + did)
        atom_lines = set()
        for atom in inv.get("atoms", []):
            if atom.get("source_document_id") != did:
                continue
            atom_span = atom.get("source_span", {})
            if atom_span.get("start_line") and atom_span.get("end_line"):
                atom_lines.update(range(atom_span["start_line"], atom_span["end_line"] + 1))
        uncovered = sorted(set(range(1, len(lines) + 1)) - atom_lines)
        atom_coverage = doc.get("atom_coverage", {})
        uncovered_text = "\n".join(lines[line_no - 1] for line_no in uncovered) + "\n" if uncovered else ""
        req(atom_coverage.get("covered_line_count") == len(atom_lines), "E_ATOM_COVERED_LINES:" + did)
        req(atom_coverage.get("uncovered_line_count") == len(uncovered), "E_ATOM_UNCOVERED_COUNT:" + did)
        req(atom_coverage.get("uncovered_lines") == uncovered, "E_ATOM_UNCOVERED_LIST:" + did)
        req(atom_coverage.get("uncovered_line_sha256") == "sha256:" + digest(uncovered_text.encode()), "E_ATOM_UNCOVERED_SHA:" + did)
        req(atom_coverage.get("source_grounding") and atom_coverage.get("fail_close_rule"), "E_ATOM_COVERAGE_POLICY:" + did)
        ls = doc.get("legacy_state", {})
        old, phase = amap.get(doc["source_path"]), pmap.get(doc["source_path"])
        req(old is not None and phase is not None, "E_LEGACY_LEDGER:" + did)
        if old and phase:
            req(ls.get("asset_id") == old.get("asset_id") and ls.get("implementation_status") == "unknown", "E_LEGACY_IMPL:" + did)
            req(ls.get("legacy_implementation_status") == "unknown" and ls.get("legacy_execution_performed") is False, "E_LEGACY_EXECUTION:" + did)
            req(ls.get("consumer_status") == "pending" and ls.get("consumer_refs") == [], "E_LEGACY_CONSUMER:" + did)
            req(ls.get("phase_authority_status") == "unconfirmed", "E_PHASE_AUTHORITY:" + did)
    denominator = inv.get("atom_denominator", {})
    covered_total = sum(x.get("atom_coverage", {}).get("covered_line_count", -1) for x in docs.values())
    uncovered_total = sum(x.get("atom_coverage", {}).get("uncovered_line_count", -1) for x in docs.values())
    req(denominator.get("atom_covered_lines") == covered_total, "E_ATOM_COVERED_DENOM")
    req(denominator.get("atom_uncovered_lines") == uncovered_total, "E_ATOM_UNCOVERED_DENOM")
    for rid, ref in refs.items():
        ledger = rmap.get(rid)
        req(ledger is not None, "E_REF_LEDGER:" + rid)
        if ledger:
            for key in ("source_path", "source_file_sha256", "source_line", "target_path", "target_sha256", "reference_origin", "carry_status"):
                req(ref.get(key) == ledger.get(key), "E_REF:" + rid + ":" + key)
    atoms = inv.get("atoms", [])
    seen = set()
    for atom in atoms:
        aid = atom.get("semantic_atom_id")
        req(aid and aid not in seen, "E_ATOM_DUP:" + str(aid))
        seen.add(aid)
        doc = docs.get(atom.get("source_document_id"))
        req(doc is not None, "E_ATOM_SOURCE:" + str(aid))
        req(atom.get("candidate_target") == "unresolved", "E_ATOM_TARGET:" + str(aid))
        req(set(atom.get("owner_candidates", [])) >= {"HELIX-HARNESS", "HELIX-OS"}, "E_ATOM_OWNER:" + str(aid))
        req("HELIX-OS" in atom.get("consumer_candidates", []), "E_ATOM_CONSUMER:" + str(aid))
        state = atom.get("legacy_state", {})
        req(state.get("legacy_implementation_status") == "unknown", "E_ATOM_IMPL:" + str(aid))
        req(state.get("consumer_status") == "pending", "E_ATOM_CLOSED_CONSUMER:" + str(aid))
        req(state.get("phase_authority_status") == "unconfirmed", "E_ATOM_PHASE:" + str(aid))
        req(atom.get("actors") and atom.get("authority_conditions") and atom.get("negative_conditions"), "E_ATOM_CONTEXT:" + str(aid))
        span = atom.get("source_span", {})
        req(span.get("start_line") and span.get("end_line") and span.get("exact_source_text"), "E_ATOM_SPAN:" + str(aid))
        if doc and span.get("start_line") and span.get("end_line"):
            lines = open(os.path.join(root, doc["archive_path"]), encoding="utf-8").read().splitlines()
            start, end = span["start_line"], span["end_line"]
            req(1 <= start <= end <= len(lines), "E_ATOM_BOUNDS:" + str(aid))
            if 1 <= start <= end <= len(lines):
                exact = "\n".join(lines[start - 1:end]) + "\n"
                req(span["exact_source_text"] == exact, "E_ATOM_TEXT:" + str(aid))
                req(span.get("sha256") == "sha256:" + digest(exact.encode()), "E_ATOM_SHA:" + str(aid))
    req(len(seen) == inv.get("atom_denominator", {}).get("semantic_atoms"), "E_ATOM_DENOM")
    for pair in inv.get("comparison", {}).get("pair_groups", []):
        req(set(pair.get("reference_edge_ids", [])) <= set(refs), "E_PAIR_REFS:" + str(pair.get("pair_id")))
        req(pair.get("unresolved_crossdoc_references") is not None, "E_PAIR_GAPS:" + str(pair.get("pair_id")))
        defined_acs, referenced_acs, test_refs = fixed_blob_acceptance_sets(pair, docs, root)
        req(sorted(defined_acs) == sorted(pair.get("l3_defined_acceptance_ids", [])), "E_PAIR_AC_DEFINED:" + str(pair.get("pair_id")))
        req(sorted(referenced_acs) == sorted(pair.get("l10_test_acceptance_refs", [])), "E_PAIR_AC_REFERENCED:" + str(pair.get("pair_id")))
        unresolved_records = {x.get("original_id") for x in pair.get("unresolved_crossdoc_references", []) if x.get("original_id", "").startswith("GH-AC-")}
        unresolved_difference = defined_acs - referenced_acs
        req(sorted(unresolved_difference) == sorted(pair.get("unresolved_acceptance_difference_ids", [])), "E_PAIR_AC_DIFFERENCE:" + str(pair.get("pair_id")))
        req(unresolved_difference == unresolved_records, "E_PAIR_AC_UNRESOLVED_RECORD:" + str(pair.get("pair_id")))
        req(not (referenced_acs - defined_acs), "E_PAIR_AC_UNDEFINED_REFERENCE:" + str(pair.get("pair_id")))
        for test_id in pair.get("l10_original_ids", []):
            if not test_id.startswith("GH-T-"):
                continue
            refs_for_test = test_refs.get(test_id, [])
            req(len(set(refs_for_test)) == 1, "E_PAIR_T_AC_CARDINALITY:" + test_id)
        for atom in atoms:
            if atom.get("source_document_id") == pair.get("l10_document_id") and atom.get("original_id", "").startswith("GH-T-"):
                n = atom["original_id"].split("-")[-1]
                req(atom.get("related_original_ids") == ["GH-AC-" + n], "E_PAIR_PARITY:" + atom["original_id"])
    return errors

if __name__ == "__main__":
    inventory = load_inventory()
    errors = validate_inventory(inventory)
    if errors:
        for error in errors:
            print(error, file=sys.stderr)
        raise SystemExit(1)
    print("PASS RDP-001 delegated pairs: docs=4 lines=%d atoms=%d edges=10 residual=104/766" % (inventory["atom_denominator"]["source_lines"], inventory["atom_denominator"]["semantic_atoms"]))

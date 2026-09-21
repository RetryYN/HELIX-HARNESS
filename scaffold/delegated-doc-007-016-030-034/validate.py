#!/usr/bin/env python3
"""Fail-closed static validator for the RDP-001 delegated-document scaffold."""
from __future__ import annotations

import hashlib
import json
import os
import re
import sys
from collections import defaultdict
from typing import Any

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
INV = os.path.join(HERE, "inventory.json")
SOURCE = "docs/governance/delegated-requirement-document-source-holding.jsonl"
REF = "docs/governance/delegated-requirement-document-reference-holding.jsonl"
ASSET = "docs/governance/legacy-asset-disposition.jsonl"
PHASE = "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl"
EXPECTED_DOCS = {"DELEGATED-DOC-007", "DELEGATED-DOC-016", "DELEGATED-DOC-030", "DELEGATED-DOC-034"}
EXPECTED_EDGES = {"DELEGATED-REF-0320", "DELEGATED-REF-0766", "DELEGATED-REF-0316", "DELEGATED-REF-0739"}
PRIOR_DOCS = {
    "DELEGATED-DOC-003", "DELEGATED-DOC-028", "DELEGATED-DOC-008", "DELEGATED-DOC-017",
    "DELEGATED-DOC-006", "DELEGATED-DOC-015", "DELEGATED-DOC-002", "DELEGATED-DOC-013",
    "DELEGATED-DOC-004", "DELEGATED-DOC-029", "DELEGATED-DOC-005", "DELEGATED-DOC-014",
    "DELEGATED-DOC-011", "DELEGATED-DOC-018",
}
PRIOR_EDGES = {
    "DELEGATED-REF-0303", "DELEGATED-REF-0759", "DELEGATED-REF-0760", "DELEGATED-REF-0341",
    "DELEGATED-REF-0342", "DELEGATED-REF-0414", "DELEGATED-REF-0415", "DELEGATED-REF-0772",
    "DELEGATED-REF-0308", "DELEGATED-REF-0424", "DELEGATED-REF-0425", "DELEGATED-REF-0765",
    "DELEGATED-REF-0301", "DELEGATED-REF-0302", "DELEGATED-REF-0422", "DELEGATED-REF-0423",
    "DELEGATED-REF-0757", "DELEGATED-REF-0758", "DELEGATED-REF-0304", "DELEGATED-REF-0419",
    "DELEGATED-REF-0761", "DELEGATED-REF-0762", "DELEGATED-REF-0305", "DELEGATED-REF-0763",
    "DELEGATED-REF-0373", "DELEGATED-REF-0783",
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
PAIR_IDS = {"RDP-001-PAIR-DOC-007-016", "RDP-001-PAIR-DOC-030-034"}
HEX40 = re.compile(r"^[0-9a-f]{40}$")


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def sha_text(text: str) -> str:
    return sha(text.encode("utf-8"))


def line_digest(lines: list[str], start: int, end: int) -> str:
    return sha_text("\n".join(lines[start - 1:end]) + "\n")


def read_jsonl(rel: str) -> list[dict[str, Any]]:
    with open(os.path.join(ROOT, rel), encoding="utf-8") as handle:
        return [json.loads(row) for row in handle if row.strip()]


def expand_compact_ids(text: str, prefix: str) -> set[str]:
    found: set[str] = set()
    pattern = rf"\b{re.escape(prefix)}-(\d{{2}})([a-z](?:/[a-z])*)\b"
    for match in re.finditer(pattern, text):
        for suffix in match.group(2).split("/"):
            found.add(f"{prefix}-{match.group(1)}{suffix}")
    return found


def source_original_ids(document_id: str, text: str) -> set[str]:
    if document_id == "DELEGATED-DOC-007":
        return expand_compact_ids(text, "LSAC") | set(re.findall(r"\bLSS-FR-\d{2}\b", text))
    if document_id == "DELEGATED-DOC-016":
        return expand_compact_ids(text, "LSAC") | set(re.findall(r"\bLSAT-\d{2}\b", text))
    if document_id == "DELEGATED-DOC-030":
        return set(re.findall(r"\bHR-FR-HIL-\d{2}\b", text)) | set(re.findall(r"\bHAC-HIL-\d{2}[a-c]\b", text))
    if document_id == "DELEGATED-DOC-034":
        return set(re.findall(r"\bHAT-HIL-\d{2}\b", text)) | set(re.findall(r"\bHAC-HIL-\d{2}[a-c]\b", text))
    return set()


def fixed_blob_acceptance_sets(pair: dict[str, Any], docs: dict[str, dict[str, Any]], root: str) -> tuple[set[str], set[str], dict[str, list[str]]]:
    l3 = docs[pair["l3_document_id"]]
    l10 = docs[pair["l10_document_id"]]
    with open(os.path.join(root, l3["archive_path"]), encoding="utf-8") as handle:
        l3_lines = handle.read().splitlines()
    with open(os.path.join(root, l10["archive_path"]), encoding="utf-8") as handle:
        l10_lines = handle.read().splitlines()
    if pair["pair_id"].endswith("007-016"):
        defined = expand_compact_ids("\n".join(l3_lines), "LSAC")
        test_pattern = re.compile(r"\bLSAT-\d{2}\b")
        ac_pattern = re.compile(r"\bLSAC-\d{2}[a-c]\b")
    else:
        defined = set(re.findall(r"\bHAC-HIL-\d{2}[a-c]\b", "\n".join(l3_lines)))
        test_pattern = re.compile(r"\bHAT-HIL-\d{2}\b")
        ac_pattern = re.compile(r"\bHAC-HIL-\d{2}[a-c]\b")
    per_test: dict[str, list[str]] = defaultdict(list)
    for line in l10_lines:
        tests = test_pattern.findall(line)
        refs = (sorted(expand_compact_ids(line, "LSAC")) if pair["pair_id"].endswith("007-016") else ac_pattern.findall(line))
        for test_id in tests:
            per_test[test_id].extend(refs)
    return defined, set(value for values in per_test.values() for value in values), dict(per_test)


def validate_inventory(inv: dict[str, Any], root: str = ROOT) -> list[str]:
    errors: list[str] = []

    def req(condition: bool, code: str) -> None:
        if not condition:
            errors.append(code)

    req(inv.get("schema") == "rdp001-delegated-document-pair-scaffold/v1", "E_SCHEMA")
    req(inv.get("status") == "scaffold_candidate_pending_review", "E_STATE")
    req(inv.get("authority_effect") == "none", "E_AUTHORITY")
    req(inv.get("meaning_change_applied") is False, "E_MEANING")
    req(inv.get("successor_requirement_ids") == [], "E_SUCCESSOR")
    req(inv.get("human_decision_ref") is None, "E_HUMAN_DECISION")
    req(inv.get("equivalence_claim") is None, "E_EQUIVALENCE_NULL")
    req(inv.get("old_runtime_test_ci_execution") is False, "E_OLD_EXECUTION")
    guard = inv.get("closure_guard")
    req(guard == EXPECTED_CLOSURE_GUARD, "E_CLOSURE_GUARD_FULL_EQUALITY")
    if isinstance(guard, dict):
        req(inv.get("authority_effect") == guard.get("authority_effect"), "E_GUARD_TOP_AUTHORITY")
        req(inv.get("meaning_change_applied") == guard.get("meaning_change_applied"), "E_GUARD_TOP_MEANING")
        req(inv.get("successor_requirement_ids") == guard.get("successor_requirement_ids"), "E_GUARD_TOP_SUCCESSOR")
        req(inv.get("human_decision_ref") == guard.get("human_decision_ref"), "E_GUARD_TOP_DECISION")

    docs = {row.get("source_document_id"): row for row in inv.get("source_documents", [])}
    refs = {row.get("reference_id"): row for row in inv.get("reference_edges", [])}
    req(set(docs) == EXPECTED_DOCS, "E_SCOPE_DOCUMENTS")
    req(set(refs) == EXPECTED_EDGES, "E_SCOPE_EDGES")
    req(not set(docs) & PRIOR_DOCS, "E_DOCUMENT_OVERLAP")
    req(not set(refs) & PRIOR_EDGES, "E_EDGE_OVERLAP")
    req(inv.get("candidate_id") == "RDP-001-SCF-B-0017-DOC-007-016-030-034", "E_CANDIDATE_ID")

    source_rows = read_jsonl(SOURCE)
    ref_rows = read_jsonl(REF)
    asset_rows = read_jsonl(ASSET)
    phase_rows = read_jsonl(PHASE)
    source_map = {row["source_document_id"]: row for row in source_rows}
    ref_map = {row["reference_id"]: row for row in ref_rows}
    asset_map = {row["source_path"]: row for row in asset_rows}
    phase_map = {row["source_path"]: row for row in phase_rows}
    req(len(source_rows) == 114 and len(ref_rows) == 788, "E_HOLDING_TOTAL")
    denominator = inv.get("comparison", {}).get("holding_denominator", {})
    req(denominator.get("source_documents_total") == 114 and denominator.get("reference_edges_total") == 788, "E_DENOM_TOTAL")
    req(denominator.get("prior_candidate_source_document_count") == 14 and denominator.get("prior_candidate_reference_edge_count") == 26, "E_DENOM_PRIOR")
    req(denominator.get("remaining_before_this_batch_source_documents") == 100 and denominator.get("remaining_before_this_batch_reference_edges") == 762, "E_DENOM_BEFORE")
    req(denominator.get("selected_source_document_count") == 4 and denominator.get("selected_reference_edge_count") == 4, "E_DENOM_SELECTED")
    req(denominator.get("remaining_source_documents_after_prior_and_selected") == 96 and denominator.get("remaining_reference_edges_after_prior_and_selected") == 758, "E_DENOM_REMAINING")
    req(len(inv.get("unresolved_crossdoc_references", [])) >= 3, "E_UNRESOLVED_CROSSDOC")
    req(HEX40.fullmatch(inv.get("comparison", {}).get("fixed_source_revision", "")) is not None, "E_FIXED_REVISION_FORMAT")

    atom_rows = inv.get("atoms", [])
    atoms_by_doc: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for atom in atom_rows:
        atoms_by_doc[atom.get("source_document_id")].append(atom)
    for did, doc in docs.items():
        source = source_map.get(did)
        req(source is not None, f"E_SOURCE_LEDGER:{did}")
        if source is None:
            continue
        req(doc.get("source_path") == source.get("source_path"), f"E_SOURCE_PATH:{did}")
        req(doc.get("archive_path") == source.get("archive_path"), f"E_ARCHIVE_PATH:{did}")
        req(doc.get("sha256") == source.get("sha256"), f"E_SOURCE_SHA:{did}")
        path = os.path.join(root, doc["archive_path"])
        req(os.path.isfile(path), f"E_SOURCE_MISSING:{did}")
        if not os.path.isfile(path):
            continue
        data = open(path, "rb").read()
        lines = data.decode("utf-8").splitlines()
        req(sha(data) == source["sha256"], f"E_SOURCE_BLOB:{did}")
        req(doc.get("line_count") == len(lines), f"E_SOURCE_LINE_COUNT:{did}")
        spans = sorted(doc.get("coverage_spans", []), key=lambda row: row.get("start_line", 0))
        cursor = 1
        for span in spans:
            start, end = span.get("start_line"), span.get("end_line")
            req(start == cursor, f"E_FULL_COVERAGE_GAP:{did}:{start}")
            req(isinstance(start, int) and isinstance(end, int) and 1 <= start <= end <= len(lines), f"E_FULL_COVERAGE_BOUNDS:{did}")
            if isinstance(start, int) and isinstance(end, int) and 1 <= start <= end <= len(lines):
                req(span.get("sha256") == "sha256:" + line_digest(lines, start, end), f"E_FULL_COVERAGE_SHA:{did}:{start}")
            cursor = end + 1 if isinstance(end, int) else cursor
        req(bool(spans) and cursor == len(lines) + 1, f"E_FULL_COVERAGE_INCOMPLETE:{did}")

        atom_lines: set[int] = set()
        for atom in atoms_by_doc.get(did, []):
            span = atom.get("source_span", {})
            if isinstance(span.get("start_line"), int) and isinstance(span.get("end_line"), int):
                atom_lines.update(range(span["start_line"], span["end_line"] + 1))
        uncovered = sorted(set(range(1, len(lines) + 1)) - atom_lines)
        coverage = doc.get("atom_coverage", {})
        uncovered_text = "\n".join(lines[n - 1] for n in uncovered) + "\n" if uncovered else ""
        req(coverage.get("covered_line_count") == len(atom_lines), f"E_ATOM_COVERED_COUNT:{did}")
        req(coverage.get("uncovered_line_count") == len(uncovered), f"E_ATOM_UNCOVERED_COUNT:{did}")
        req(coverage.get("uncovered_lines") == uncovered, f"E_ATOM_UNCOVERED_LIST:{did}")
        req(coverage.get("uncovered_line_sha256") == "sha256:" + sha_text(uncovered_text), f"E_ATOM_UNCOVERED_SHA:{did}")
        req(coverage.get("source_grounding") and coverage.get("fail_close_rule"), f"E_ATOM_COVERAGE_POLICY:{did}")

        expected_ids = sorted(source_original_ids(did, data.decode("utf-8")))
        partition = doc.get("original_id_inventory", {})
        atomized: set[str] = set()
        for atom in atoms_by_doc.get(did, []):
            atomized.update(str(x) for x in atom.get("original_ids", []))
        atomized &= set(expected_ids)
        actual_partition = {
            "all_original_ids": expected_ids,
            "atomized_original_ids": sorted(atomized),
            "unatomized_original_ids": sorted(set(expected_ids) - atomized),
        }
        req(partition == actual_partition, f"E_ORIGINAL_ID_PARTITION:{did}")
        legacy = doc.get("legacy_state", {})
        old = asset_map.get(doc.get("source_path"))
        phase = phase_map.get(doc.get("source_path"))
        req(old is not None and phase is not None, f"E_LEGACY_LEDGER:{did}")
        if old is not None and phase is not None:
            req(legacy.get("asset_id") == old.get("asset_id"), f"E_ASSET_ID:{did}")
            req(legacy.get("implementation_status") == "unknown" and legacy.get("legacy_implementation_status") == "unknown", f"E_IMPLEMENTATION_UNKNOWN:{did}")
            req(legacy.get("legacy_execution_performed") is False, f"E_LEGACY_EXECUTION:{did}")
            req(legacy.get("phase_authority_status") == "unconfirmed", f"E_PHASE_UNCONFIRMED:{did}")
            req(legacy.get("consumer_status") == "pending" and legacy.get("consumer_refs") == [], f"E_CONSUMER_PENDING:{did}")

    atom_denominator = inv.get("atom_denominator", {})
    req(atom_denominator.get("source_documents") == 4, "E_ATOM_DOC_DENOM")
    req(atom_denominator.get("source_lines") == sum(row.get("line_count", 0) for row in docs.values()), "E_ATOM_SOURCE_LINE_DENOM")
    req(atom_denominator.get("semantic_atoms") == len(atom_rows), "E_ATOM_COUNT_DENOM")
    req(atom_denominator.get("reference_edges") == 4, "E_ATOM_EDGE_DENOM")
    req(atom_denominator.get("atom_covered_lines") == sum(row.get("atom_coverage", {}).get("covered_line_count", -1) for row in docs.values()), "E_ATOM_COVERED_DENOM")
    req(atom_denominator.get("atom_uncovered_lines") == sum(row.get("atom_coverage", {}).get("uncovered_line_count", -1) for row in docs.values()), "E_ATOM_UNCOVERED_DENOM")
    req(atom_denominator.get("source_original_ids") == 240, "E_ORIGINAL_ID_SOURCE_DENOM")
    req(atom_denominator.get("atomized_original_ids") == 240, "E_ORIGINAL_ID_ATOMIZED_DENOM")
    req(atom_denominator.get("unatomized_original_ids") == 0, "E_ORIGINAL_ID_UNATOMIZED_DENOM")

    seen_atoms: set[str] = set()
    for atom in atom_rows:
        aid = atom.get("semantic_atom_id")
        req(isinstance(aid, str) and aid not in seen_atoms, f"E_ATOM_UNIQUE:{aid}")
        if isinstance(aid, str):
            seen_atoms.add(aid)
        did = atom.get("source_document_id")
        doc = docs.get(did)
        req(doc is not None, f"E_ATOM_SOURCE:{aid}")
        req(atom.get("candidate_target") == "unresolved", f"E_ATOM_TARGET:{aid}")
        req(set(atom.get("owner_candidates", [])) >= {"HELIX-HARNESS", "HELIX-OS"}, f"E_ATOM_OWNER_CANDIDATES:{aid}")
        req(set(atom.get("consumer_candidates", [])) >= {"HELIX-HARNESS", "HELIX-OS"}, f"E_ATOM_CONSUMER_CANDIDATES:{aid}")
        req(atom.get("actors") and atom.get("authority_conditions") and atom.get("negative_conditions"), f"E_ATOM_CONTEXT:{aid}")
        state = atom.get("legacy_state", {})
        req(state.get("legacy_implementation_status") == "unknown", f"E_ATOM_IMPLEMENTATION:{aid}")
        req(state.get("phase_authority_status") == "unconfirmed", f"E_ATOM_PHASE:{aid}")
        req(state.get("legacy_execution_performed") is False, f"E_ATOM_EXECUTION:{aid}")
        req(state.get("consumer_status") == "pending" and state.get("consumer_refs") == [], f"E_ATOM_CONSUMER_PENDING:{aid}")
        span = atom.get("source_span", {})
        req(isinstance(span.get("start_line"), int) and isinstance(span.get("end_line"), int) and span.get("exact_source_text"), f"E_ATOM_SPAN:{aid}")
        if doc and isinstance(span.get("start_line"), int) and isinstance(span.get("end_line"), int):
            path = os.path.join(root, doc["archive_path"])
            lines = open(path, encoding="utf-8").read().splitlines()
            start, end = span["start_line"], span["end_line"]
            req(1 <= start <= end <= len(lines), f"E_ATOM_BOUNDS:{aid}")
            if 1 <= start <= end <= len(lines):
                exact = "\n".join(lines[start - 1:end]) + "\n"
                req(span.get("exact_source_text") == exact, f"E_ATOM_EXACT_TEXT:{aid}")
                req(atom.get("original_id") in exact, f"E_ATOM_ORIGINAL_ID:{aid}")
                req(span.get("sha256") == "sha256:" + sha_text(exact), f"E_ATOM_EXACT_SHA:{aid}")
                req(atom.get("normalized_statement") == exact.rstrip("\n"), f"E_ATOM_NORMALIZED_TEXT:{aid}")

    for rid, ref in refs.items():
        ledger = ref_map.get(rid)
        req(ledger is not None, f"E_REF_LEDGER:{rid}")
        if ledger is None:
            continue
        for key in ("source_path", "source_file_sha256", "source_line", "target_path", "target_sha256", "reference_origin", "relation_key", "carry_status"):
            req(ref.get(key) == ledger.get(key), f"E_REF_FIELD:{rid}:{key}")
        path_to_doc = {row.get("source_path"): did for did, row in docs.items()}
        req(ref.get("source_document_id") == path_to_doc.get(ref.get("source_path")), f"E_REF_SOURCE_DOC:{rid}")
        target_to_doc = {row.get("source_path"): did for did, row in docs.items()}
        req(ref.get("target_document_id") == target_to_doc.get(ref.get("target_path")), f"E_REF_TARGET_DOC:{rid}")
        req(ref.get("meaning_change_applied") is False and ref.get("human_decision_ref") is None, f"E_REF_GUARD:{rid}")

    for pair in inv.get("comparison", {}).get("pair_groups", []):
        pid = pair.get("pair_id")
        req(pid in PAIR_IDS, f"E_PAIR_ID:{pid}")
        l3 = docs.get(pair.get("l3_document_id"), {})
        l10 = docs.get(pair.get("l10_document_id"), {})
        req(set(pair.get("reference_edge_ids", [])) <= set(refs), f"E_PAIR_EDGE_SCOPE:{pid}")
        defined, referenced, tests = fixed_blob_acceptance_sets(pair, docs, root)
        req(sorted(defined) == sorted(pair.get("l3_defined_acceptance_ids", [])), f"E_AC_DEFINED_FIXED_BLOB:{pid}")
        req(sorted(referenced) == sorted(pair.get("l10_test_acceptance_refs", [])), f"E_AC_REFERENCED_FIXED_BLOB:{pid}")
        difference = defined - referenced
        expected_difference = set(pair.get("unresolved_acceptance_difference_ids", []))
        req(difference == expected_difference, f"E_AC_DIFFERENCE_EXACT:{pid}")
        unresolved_ids = {record.get("original_id") for record in pair.get("unresolved_crossdoc_references", []) if record.get("original_id")}
        req(difference == unresolved_ids, f"E_AC_DIFFERENCE_RECORDS:{pid}")
        req(not (referenced - defined), f"E_AC_UNDEFINED_REFERENCE:{pid}")
        req(set(pair.get("l3_defined_acceptance_ids", [])) == set(pair.get("l10_test_acceptance_refs", [])), f"E_AC_PARITY_SET:{pid}")
        for test_id, test_refs in tests.items():
            req(len(test_refs) >= 1, f"E_TEST_CARDINALITY:{pid}:{test_id}")
            req(len(set(test_refs)) == len(test_refs), f"E_TEST_DUPLICATE_AC:{pid}:{test_id}")
            req(set(test_refs) <= defined, f"E_TEST_UNDEFINED_AC:{pid}:{test_id}")
        for atom in atom_rows:
            if atom.get("source_document_id") != pair.get("l10_document_id"):
                continue
            test_id = atom.get("original_id", "")
            if test_id not in tests:
                continue
            expected = sorted(set(tests[test_id]))
            req(sorted(atom.get("related_original_ids", [])) == expected, f"E_TEST_ATOM_PARITY:{pid}:{test_id}")
            exact = atom.get("source_span", {}).get("exact_source_text", "")
            explicit = (expand_compact_ids(exact, "LSAC") if pid.endswith("007-016") else set(re.findall(r"\bHAC-HIL-\d{2}[a-c]\b", exact)))
            req(set(expected) <= explicit, f"E_TEST_ATOM_EXPLICIT_AC:{pid}:{test_id}")
        req(pair.get("unresolved_crossdoc_references") is not None, f"E_PAIR_UNRESOLVED_RECORD:{pid}")
        req(pair.get("source_line_denominator", {}).get("l3_lines") == l3.get("line_count"), f"E_PAIR_L3_LINES:{pid}")
        req(pair.get("source_line_denominator", {}).get("l10_lines") == l10.get("line_count"), f"E_PAIR_L10_LINES:{pid}")
        req(sorted(pair.get("l3_original_ids", [])) == sorted(l3.get("original_id_inventory", {}).get("all_original_ids", [])), f"E_PAIR_L3_ORIGINAL_IDS:{pid}")
        expected_l10_ids = sorted(x for x in l10.get("original_id_inventory", {}).get("all_original_ids", []) if x.startswith(("LSAT-", "HAT-HIL-")))
        req(sorted(pair.get("l10_original_ids", [])) == expected_l10_ids, f"E_PAIR_L10_ORIGINAL_IDS:{pid}")

    req(len(inv.get("comparison", {}).get("pair_groups", [])) == 2, "E_PAIR_COUNT")
    return errors


if __name__ == "__main__":
    with open(INV, encoding="utf-8") as handle:
        inventory = json.load(handle)
    failures = validate_inventory(inventory)
    if failures:
        for failure in failures:
            print(failure, file=sys.stderr)
        raise SystemExit(1)
    d = inventory["atom_denominator"]
    print(f"PASS RDP-001 delegated pairs: docs=4 lines={d['source_lines']} atoms={d['semantic_atoms']} edges=4 residual=96/758 original_ids=240/240/0")

#!/usr/bin/env python3
"""DOC-009 semantic atom candidateのread-only静的検証。"""

from __future__ import annotations

import hashlib
import json
import re
import subprocess
import sys
from pathlib import Path


HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
INVENTORY = HERE / "inventory.json"
SOURCE_LEDGER = ROOT / "docs/governance/delegated-requirement-document-source-holding.jsonl"
ASSET_LEDGER = ROOT / "docs/governance/legacy-asset-disposition.jsonl"
PHASE_LEDGER = ROOT / "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl"
DECISIONS_LEDGER = ROOT / "docs/governance/legacy-asset-decisions.jsonl"
ARCHIVE_COMMIT = "064280b5c1c5c98f949e6e3be5ef87cbe4a4b658"
REPORT_COMMIT = "fa8f5426882ee56a56e28975746e2db590cd515f"
LATEST_MAIN = "2fa9aca42ff3ffdd5dea9b2186c49ee50db7dc2c"
SOURCE_ID = "DELEGATED-DOC-009"
SOURCE_PATH = "docs/design/helix/L3-requirements/universal-workflow-ai-judgment-engine.md"
ARCHIVE_PATH = "archive/legacy-generation-2026-09-14/root/" + SOURCE_PATH
EXPECTED_RANGES = [
    (1, 11), (12, 15), (16, 25), (26, 28),
    *[(line, line) for line in range(29, 40)],
    (40, 44), *[(line, line) for line in range(45, 63)],
    (63, 67), *[(line, line) for line in range(68, 80)],
    (80, 81), (82, 83), (84, 85), (86, 87),
]
APPROVED_PRODUCTS = {"HELIX-HARNESS", "HELIX-OS", "HELIX-Web", "HELIX-Web-OS"}
LEXICAL = {
    "failure": re.compile(r"failure|fail|失敗|障害", re.I),
    "degraded": re.compile(r"degrad|縮退|degradation", re.I),
    "implementation": re.compile(r"implement|implementation|実装|未実装", re.I),
    "consumer": re.compile(r"consumer|downstream|利用先|利用者|消費", re.I),
    "decision": re.compile(r"decision|approval|判断|承認", re.I),
}


def load_jsonl(path: Path) -> list[dict]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def archive_blob() -> bytes:
    return subprocess.run(["git", "show", f"{ARCHIVE_COMMIT}:{ARCHIVE_PATH}"], cwd=ROOT, check=True, stdout=subprocess.PIPE).stdout


def report_blob() -> dict:
    raw = subprocess.run(["git", "show", f"{REPORT_COMMIT}:scaffold/rdp001-delegated-doc003-unprocessed8/report.json"], cwd=ROOT, check=True, stdout=subprocess.PIPE).stdout
    return json.loads(raw)


def expect(errors: list[str], ok: bool, message: str) -> None:
    if not ok:
        errors.append(message)


def validate(inventory_override: dict | None = None) -> list[str]:
    errors: list[str] = []
    try:
        inventory = inventory_override if inventory_override is not None else json.loads(INVENTORY.read_text(encoding="utf-8"))
        blob = archive_blob()
        report = report_blob()
    except Exception as exc:
        return [f"入力読込失敗: {exc}"]

    expect(errors, inventory.get("schema") == "helix-scaffold-delegated-doc-semantic-atom-candidate.v1", "schema不一致")
    expect(errors, inventory.get("candidate_id") == "RDP-001-DELEGATED-DOC-009-ATOM-0033", "candidate_id不一致")
    for field, value in (("status", "candidate_pending_independent_review"), ("authority_effect", "none"), ("meaning_change_applied", False), ("successor_requirement_ids", []), ("human_decision_ref", None), ("equivalence_claim", None), ("old_runtime_test_ci_execution", False)):
        expect(errors, inventory.get(field) == value, f"{field} boundary不一致")

    source = inventory.get("source_document", {})
    lines = blob.decode("utf-8").splitlines(keepends=True)
    expected_sha = hashlib.sha256(blob).hexdigest()
    expect(errors, source.get("source_document_id") == SOURCE_ID, "source ID不一致")
    expect(errors, source.get("source_path") == SOURCE_PATH, "source path不一致")
    expect(errors, source.get("archive_path") == ARCHIVE_PATH, "archive path不一致")
    expect(errors, source.get("source_sha256") == expected_sha == "e20f475a3d1d082842415c2b734233e33a59f1b0bb1046c41e4ff4ec9c700e5b", "source SHA不一致")
    expect(errors, source.get("archive_blob_oid") == "bd7d8209586ab5b7e4f49b35b08192c681da60c2", "archive blob OID不一致")
    expect(errors, source.get("bytes") == 7967 == len(blob), "byte分母不一致")
    expect(errors, source.get("physical_line_count") == source.get("logical_line_count") == len(lines) == 87, "line分母不一致")
    for field, value in (("source_declared_status", "confirmed"), ("source_relation", "requirements_v1.3_reference_line_255"), ("holding_granularity", "file_blob"), ("carry_status", "preserved_pending_atomization"), ("meaning_change_applied", False), ("successor_refs", []), ("human_decision_ref", None)):
        expect(errors, source.get(field) == value, f"source {field}不一致")

    try:
        holding = next(x for x in load_jsonl(SOURCE_LEDGER) if x.get("source_document_id") == SOURCE_ID)
        asset = next(x for x in load_jsonl(ASSET_LEDGER) if x.get("asset_id") == "LEGACY-ASSET-5EE032D657C221184B00")
        phase = next(x for x in load_jsonl(PHASE_LEDGER) if x.get("asset_id") == "LEGACY-ASSET-5EE032D657C221184B00")
        decisions = [x for x in load_jsonl(DECISIONS_LEDGER) if x.get("asset_id") == "LEGACY-ASSET-5EE032D657C221184B00"]
    except (StopIteration, OSError, json.JSONDecodeError) as exc:
        return errors + [f"上流台帳のDOC-009行を読めない: {exc}"]
    for field in ("source_path", "archive_path", "source_declared_status", "source_relation", "holding_granularity", "carry_status", "meaning_change_applied", "successor_refs", "human_decision_ref"):
        expect(errors, source.get(field) == holding.get(field), f"holding {field}不一致")
    expect(errors, source.get("source_sha256") == holding.get("sha256"), "holding sha256不一致")
    expect(errors, asset.get("source_path") == SOURCE_PATH, "asset source path不一致")
    expect(errors, asset.get("implementation_status") == "unknown", "asset implementation status不一致")
    expect(errors, asset.get("disposition") == "unresolved", "asset disposition不一致")
    expect(errors, asset.get("consumer_refs") == [], "asset consumer refs不一致")
    expect(errors, phase.get("candidate_phase_targets") == [], "phase candidateが空でない")
    expect(errors, phase.get("candidate_product_targets") == ["HELIX-HARNESS"], "bootstrap product candidate不一致")
    expect(errors, phase.get("legacy_implementation_status") == "unknown", "phase implementation status不一致")
    expect(errors, phase.get("consumer_closure_status") == "pending", "phase consumer closure不一致")
    expect(errors, phase.get("product_classification_status") == "candidate_needs_semantic_review", "phase product status不一致")
    expect(errors, decisions == [], "matching legacy asset decision record exists")
    expect(errors, inventory.get("ledger_provenance", {}).get("asset_decisions_sha256") == hashlib.sha256(DECISIONS_LEDGER.read_bytes()).hexdigest(), "asset decisions digest不一致")

    comparison = inventory.get("comparison", {})
    expect(errors, comparison.get("archive_commit") == ARCHIVE_COMMIT, "archive commit不一致")
    expect(errors, comparison.get("candidate_base_commit") == LATEST_MAIN, "candidate capture base不一致")
    try:
        expect(errors, subprocess.run(["git", "merge-base", "--is-ancestor", LATEST_MAIN, "HEAD"], cwd=ROOT).returncode == 0, "candidate capture baseがHEADの祖先でない")
    except subprocess.CalledProcessError as exc:
        errors.append(f"origin/main読込失敗: {exc}")
    expect(errors, comparison.get("input_report", {}).get("commit") == REPORT_COMMIT, "input report commit不一致")
    expect(errors, comparison.get("input_report", {}).get("sha256") == "870f88c0cd5e427ef4032d8921699f78ea1da2906747cc7852a00bf5c3e8b39f", "input report digest不一致")
    report_doc = next((x for x in report.get("documents", []) if x.get("id") == SOURCE_ID), None)
    expect(errors, report_doc is not None, "PR #1964 reportにDOC-009が無い")
    if report_doc:
        expect(errors, report_doc.get("lines") == 87, "PR #1964 report DOC-009 lines不一致")
        expect(errors, report_doc.get("source_sha256") == expected_sha, "PR #1964 report source SHA不一致")

    spans = inventory.get("source_spans", [])
    expect(errors, len(spans) == len(EXPECTED_RANGES) == 51, "span count不一致")
    consumed: list[int] = []
    for index, (span, expected_range) in enumerate(zip(spans, EXPECTED_RANGES), 1):
        start, end = expected_range
        exact = "".join(lines[start - 1:end])
        expect(errors, span.get("span_id") == f"DOC009-SPAN-{index:03d}", f"span id不一致 {index}")
        expect(errors, (span.get("start_line"), span.get("end_line")) == expected_range, f"span anchor不一致 {index}")
        expect(errors, span.get("exact_source_text") == exact, f"span原文不一致 {index}")
        expect(errors, span.get("sha256") == "sha256:" + hashlib.sha256(exact.encode()).hexdigest(), f"span digest不一致 {index}")
        consumed.extend(range(start, end + 1))
    expect(errors, sorted(consumed) == list(range(1, 88)), "span line coverageが1..87でない")
    expect(errors, len(set(consumed)) == len(consumed), "span line重複")
    coverage = inventory.get("source_line_coverage", {})
    expect(errors, coverage.get("physical_lines_consumed_once") == list(range(1, 88)), "coverage consumed_once不一致")
    expect(errors, coverage.get("unresolved_lines") == [], "unresolved source lineが残っている")

    atoms = inventory.get("atoms", [])
    expect(errors, len(atoms) == 51, "atom count不一致")
    atom_refs = []
    for index, atom in enumerate(atoms, 1):
        expect(errors, atom.get("semantic_atom_id") == f"UWJ-SEM-{index:03d}", f"atom id不一致 {index}")
        expect(errors, atom.get("source_document_id") == SOURCE_ID, f"atom source ID不一致 {index}")
        expect(errors, atom.get("source_path") == SOURCE_PATH, f"atom source path不一致 {index}")
        expect(errors, atom.get("source_revision") == ARCHIVE_COMMIT, f"atom source revision不一致 {index}")
        expected_ref = f"DOC009-SPAN-{index:03d}"
        expect(errors, atom.get("source_span_ref") == expected_ref, f"atom span ref不一致 {index}")
        atom_refs.append(atom.get("source_span_ref"))
        expect(errors, atom.get("candidate_kind") in {"metadata", "navigation", "premise", "example", "requirement", "connection", "acceptance"}, f"atom kind不正 {index}")
        expect(errors, atom.get("candidate_target") in APPROVED_PRODUCTS | {"unresolved"}, f"atom product target不正 {index}")
        expect(errors, set(atom.get("owner_candidates", [])) <= APPROVED_PRODUCTS, f"atom owner candidate不正 {index}")
        expect(errors, atom.get("normalized_statement"), f"atom normalized statement欠落 {index}")
        legacy = atom.get("legacy_state", {})
        expect(errors, legacy.get("implementation_status") == "unknown", f"atom implementation status不一致 {index}")
        expect(errors, legacy.get("legacy_execution_performed") is False, f"atom execution status不一致 {index}")
        expect(errors, legacy.get("degraded_status") == "unknown", f"atom degraded status不一致 {index}")
        expect(errors, legacy.get("failure_status") == "unknown", f"atom failure status不一致 {index}")
        expect(errors, legacy.get("consumer_status") == "pending", f"atom consumer status不一致 {index}")
        expect(errors, legacy.get("consumer_refs") == [], f"atom consumer refs不一致 {index}")
        expect(errors, legacy.get("decision_status") == "missing", f"atom decision status不一致 {index}")
        expect(errors, legacy.get("decision_record_ref") is None, f"atom decision ref不一致 {index}")
        expect(errors, legacy.get("unconfirmed") is True, f"atom unconfirmed欠落 {index}")
    expect(errors, atom_refs == [f"DOC009-SPAN-{index:03d}" for index in range(1, 52)], "atom span refs不一致")

    text = blob.decode("utf-8")
    for name, pattern in LEXICAL.items():
        expect(errors, inventory.get("legacy_status", {}).get("lexical_signal_counts", {}).get(name) == len(pattern.findall(text)), f"lexical signal count不一致 {name}")
    legacy_status = inventory.get("legacy_status", {})
    for field, value in (("asset_class", "Historical"), ("authority_status", "historical"), ("disposition", "unresolved"), ("implementation_status", "unknown"), ("degraded_status", "unknown"), ("failure_status", "unknown"), ("consumer_closure_status", "pending"), ("consumer_refs", []), ("decision_record_ref", None), ("decision_status", "missing")):
        expect(errors, legacy_status.get(field) == value, f"top legacy {field}不一致")
    expect(errors, legacy_status.get("decision_evidence"), "decision evidenceが欠落")
    products = inventory.get("product_phase_classification", {})
    expect(errors, set(products.get("approved_products", [])) == APPROVED_PRODUCTS, "approved products 4件不一致")
    expect(errors, products.get("candidate_products") == ["HELIX-HARNESS", "HELIX-OS"], "candidate products不一致")
    expect(errors, products.get("source_declared_layer") == "L3", "source layer不一致")
    expect(errors, products.get("capability_phase_candidates") == [], "capability phase candidatesはunknown保持")
    expect(errors, products.get("phase_status") == "unresolved", "phase status不一致")
    expect(errors, inventory.get("unresolved_consumer_failure_decision"), "unresolved consumer/failure/decision記録欠落")

    base = comparison.get("candidate_base_commit")
    if base:
        current_path = subprocess.run(["git", "cat-file", "-e", f"{base}:{SOURCE_PATH}"], cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL).returncode
        expect(errors, current_path != 0, "candidate baseにcurrent source pathが存在する")
    return errors


def main() -> int:
    errors = validate()
    if errors:
        print("FAIL rdp001-delegated-doc009-atom")
        for error in errors:
            print("  - " + error)
        print(f"errors={len(errors)}")
        return 1
    print("PASS rdp001-delegated-doc009-atom: DOC-009 87 lines / 51 spans / 51 atoms; implementation=unknown")
    return 0


if __name__ == "__main__":
    sys.exit(main())

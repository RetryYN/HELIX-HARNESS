#!/usr/bin/env python3
"""DELEGATED-DOC-001 semantic atom candidate のread-only静的検証。"""

from __future__ import annotations

import hashlib
import json
import subprocess
from collections import Counter
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
CANDIDATE = ROOT / "scaffold/rdp001-delegated-doc001-atom-030/inventory.json"
ARCHIVE_REL = "archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/ai-vision-design-harness-engine.md"
SOURCE_REL = "docs/design/helix/L3-requirements/ai-vision-design-harness-engine.md"
SOURCE_COMMIT = "569d7373c32287bbafadeec6043472563937c5c7"
CURRENT_HEAD = "2fa9aca42ff3ffdd5dea9b2186c49ee50db7dc2c"
CURRENT_REF = "origin/main"
EXPECTED_IDS = {f"DD001-SEM-VDH-FR-{i:03d}" for i in range(1, 20)}
EXPECTED_PRODUCT_SET = {"HELIX-HARNESS", "HELIX-OS", "HELIX-Web", "HELIX-Web-OS"}
EXPECTED_PHASE_SET = {"PHCAP-01", "PHCAP-06", "PHCAP-16", "PHCAP-18", "PHCAP-19"}
EXPECTED_KIND_COUNTS = {
    "requirement": 19,
    "relation": 29,
    "layout": 12,
    "metadata": 7,
    "constraint": 5,
    "acceptance": 3,
    "premise": 1,
}


def digest(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def load_jsonl(path: Path) -> list[dict]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def check(candidate: dict | None = None) -> list[str]:
    errors: list[str] = []
    if candidate is None:
        try:
            candidate = json.loads(CANDIDATE.read_text(encoding="utf-8"))
        except Exception as exc:
            return [f"候補JSONを読めない: {exc}"]
    archive = ROOT / ARCHIVE_REL
    if not archive.is_file():
        return [f"archive source不存在: {ARCHIVE_REL}"]
    raw = archive.read_bytes()
    lines = raw.decode("utf-8").splitlines(keepends=True)
    comparison = candidate.get("comparison", {})
    if comparison.get("source_commit") != SOURCE_COMMIT:
        errors.append("source commitがorigin/main revisionと不一致")
    if comparison.get("current_head") != CURRENT_HEAD:
        errors.append("rebaseline後のorigin/main HEADが不一致")
    if comparison.get("current_ref") != CURRENT_REF:
        errors.append("rebaseline後のcurrent refが不一致")
    if comparison.get("source_path") != SOURCE_REL or comparison.get("archive_path") != ARCHIVE_REL:
        errors.append("source/archive path不一致")
    if comparison.get("source_sha256") != digest(raw):
        errors.append("source SHA-256不一致")
    if comparison.get("source_line_count") != len(lines) or comparison.get("source_byte_count") != len(raw):
        errors.append("source bytes/lines分母不一致")
    blob = subprocess.run(
        ["git", "cat-file", "blob", f"{SOURCE_COMMIT}:{ARCHIVE_REL}"],
        cwd=ROOT,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        check=False,
    )
    if blob.returncode != 0 or blob.stdout != raw:
        errors.append("固定source commitのarchive blobとworktree archiveが不一致")

    report_path = ROOT / "scaffold/rdp001-delegated-doc003-unprocessed8/report.json"
    try:
        selected_report = json.loads(report_path.read_text(encoding="utf-8"))
    except Exception as exc:
        errors.append(f"#1964 source reportを読めない: {exc}")
        selected_report = {}
    selected_doc = next((doc for doc in selected_report.get("documents", []) if doc.get("id") == "DELEGATED-DOC-001"), None)
    observed = comparison.get("source_report_observed", {})
    if selected_doc is None:
        errors.append("#1964 source reportにDELEGATED-DOC-001がない")
    else:
        observed_keys = {"bytes": "report_bytes", "source_sha256": "report_sha256", "lines": "report_lines"}
        for key, observed_key in observed_keys.items():
            if observed.get(observed_key) != selected_doc.get(key):
                errors.append(f"#1964 report {key}観測値不一致")
        if selected_doc.get("lines") != len(lines) or selected_doc.get("lines") != 126:
            errors.append("#1964 reportのDOC-001行数が126でない")
        if observed.get("line_count_discrepancy") is not False:
            errors.append("staleな127/126 line discrepancyが残っている")
        expected_disposition = "PR #1964でreportのDOC-001行数が126へ訂正され、archive bytes／SHA／exact line anchorsと一致している"
        if observed.get("disposition") != expected_disposition:
            errors.append("#1964 reportのline denominator修正注記が不一致")

    holding = next((r for r in load_jsonl(ROOT / "docs/governance/delegated-requirement-document-source-holding.jsonl") if r.get("source_document_id") == "DELEGATED-DOC-001"), None)
    if holding is None:
        errors.append("DELEGATED-DOC-001 holding rowがない")
    else:
        for key, expected in {
            "source_path": SOURCE_REL,
            "archive_path": ARCHIVE_REL,
            "sha256": comparison.get("source_sha256"),
            "source_declared_status": "confirmed",
            "holding_granularity": "file_blob",
            "carry_status": "preserved_pending_atomization",
        }.items():
            if holding.get(key) != expected:
                errors.append(f"holding {key}不一致: {holding.get(key)!r} != {expected!r}")
    asset = next((r for r in load_jsonl(ROOT / "docs/governance/legacy-asset-disposition.jsonl") if r.get("source_path") == SOURCE_REL), None)
    if asset is None:
        errors.append("legacy asset rowがない")
    else:
        legacy = candidate.get("legacy_asset", {})
        for key in ("asset_id", "asset_class", "authority_status", "disposition", "product_target", "implementation_status", "executability_status", "external_effect_status", "decision_record_ref", "reuse_exclusion_class"):
            if legacy.get(key) != asset.get(key):
                errors.append(f"legacy asset {key}不一致")
        if legacy.get("consumer_refs") != asset.get("consumer_refs"):
            errors.append("legacy asset consumer_refs不一致")
    phase = next((r for r in load_jsonl(ROOT / "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl") if r.get("source_path") == SOURCE_REL), None)
    phase_summary = candidate.get("phase_product_classification", {})
    if phase is None:
        errors.append("phase/product rowがない")
    else:
        for key, out_key in (("classification_id", "classification_id"), ("candidate_phase_targets", "phase_candidates"), ("candidate_product_targets", "product_candidates"), ("phase_classification_status", "phase_classification_status"), ("product_classification_status", "product_classification_status"), ("consumer_closure_status", "consumer_closure_status"), ("implementation_evidence_state", "implementation_evidence_state"), ("legacy_implementation_status", "legacy_implementation_status"), ("legacy_execution_performed", "legacy_execution_performed")):
            if phase_summary.get(out_key) != phase.get(key):
                errors.append(f"phase/product {out_key}不一致")
        if set(phase_summary.get("phase_candidates", [])) != EXPECTED_PHASE_SET:
            errors.append("phase候補がPHCAP-01/06/16/18/19の全件を保持していない")
        if set(phase_summary.get("product_candidates", [])) != EXPECTED_PRODUCT_SET:
            errors.append("phase/product台帳の4対象product候補を保持していない")
        if phase_summary.get("product_classification_status") != "candidate_needs_semantic_review":
            errors.append("product classificationをreview前に確定している")
        if phase_summary.get("legacy_implementation_status") != "unknown" or phase_summary.get("implementation_evidence_state") != "document_present":
            errors.append("phase/product implementation evidence境界が不正")

    atoms = candidate.get("atoms", [])
    if len(atoms) != candidate.get("atomization", {}).get("atom_count") or len(atoms) != 76:
        errors.append(f"atom count不一致: {len(atoms)}")
    kind_counts = Counter(atom.get("candidate_kind") for atom in atoms)
    if kind_counts != Counter(EXPECTED_KIND_COUNTS):
        errors.append(f"candidate_kind counts不一致: {dict(kind_counts)}")
    if candidate.get("atomization", {}).get("requirement_atom_count") != EXPECTED_KIND_COUNTS["requirement"]:
        errors.append("requirement atom count不一致")
    if candidate.get("atomization", {}).get("relation_atom_count") != EXPECTED_KIND_COUNTS["relation"]:
        errors.append("relation atom count不一致")
    ids = [atom.get("semantic_atom_id") for atom in atoms]
    if len(set(ids)) != len(ids):
        errors.append("semantic_atom_id重複")
    if not EXPECTED_IDS.issubset(set(ids)):
        errors.append("VDH-FR-001..019のsemantic atomが不足")
    covered: set[int] = set()
    for atom in atoms:
        atom_id = atom.get("semantic_atom_id")
        span = atom.get("source_span", {})
        start, end = span.get("start_line"), span.get("end_line")
        if not isinstance(start, int) or not isinstance(end, int) or start < 1 or end < start or end > len(lines):
            errors.append(f"{atom_id}: line span不正")
            continue
        exact = "".join(lines[start - 1 : end])
        covered.update(range(start, end + 1))
        if span.get("exact_source_text") != exact:
            errors.append(f"{atom_id}: exact_source_text不一致")
        if span.get("sha256") != "sha256:" + digest(exact.encode("utf-8")):
            errors.append(f"{atom_id}: span SHA-256不一致")
        if atom.get("source_document_id") != "DELEGATED-DOC-001" or atom.get("source_path") != SOURCE_REL:
            errors.append(f"{atom_id}: source identity不一致")
        if atom.get("candidate_target") not in EXPECTED_PRODUCT_SET | {"unresolved"}:
            errors.append(f"{atom_id}: candidate targetが語彙外")
        if not set(atom.get("owner_candidates", [])) <= EXPECTED_PRODUCT_SET:
            errors.append(f"{atom_id}: owner候補が語彙外")
        state = atom.get("legacy_state", {})
        if state.get("phase_candidates") != sorted(EXPECTED_PHASE_SET):
            errors.append(f"{atom_id}: phase候補の保持境界が不一致")
        if state.get("implementation_status") != "unknown" or state.get("degraded_status") != "unknown" or state.get("failure_status") != "unknown":
            errors.append(f"{atom_id}: unknown境界が改変されている")
        if state.get("legacy_execution_performed") is not False or state.get("asset_disposition") != "unresolved":
            errors.append(f"{atom_id}: legacy実行／disposition境界が不正")
        if atom.get("successor_requirement_ids") != [] or atom.get("meaning_change_applied") is not False:
            errors.append(f"{atom_id}: successorまたはmeaning changeを許している")
        if atom.get("authority_vocabulary_relation", {}).get("current_authority_claim") is not False:
            errors.append(f"{atom_id}: current authority claimを許している")
    if covered != set(range(1, len(lines) + 1)):
        errors.append(f"source line coverage欠落: {sorted(set(range(1, len(lines) + 1)) - covered)}")
    if candidate.get("atomization", {}).get("unresolved_source_lines") != []:
        errors.append("unresolved source linesが空でない")
    product_routing = candidate.get("product_routing", {})
    if product_routing.get("approved_product_vocabulary") != sorted(EXPECTED_PRODUCT_SET):
        errors.append("approved product vocabularyが不一致")
    if set(product_routing.get("semantic_owner_candidates", {})) != EXPECTED_PRODUCT_SET:
        errors.append("product routingが4対象の候補責務を保持していない")
    if product_routing.get("owner_decision") != "unresolved" or product_routing.get("current_authority_claim") is not False:
        errors.append("product routingが未確定境界を越えている")
    for evidence in candidate.get("current_authority_evidence", []):
        path = ROOT / evidence.get("path", "")
        if not path.is_file():
            errors.append(f"current authority evidence不存在: {evidence.get('path')}")
        elif evidence.get("sha256") != digest(path.read_bytes()):
            errors.append(f"current authority evidence digest stale: {evidence.get('path')}")
    if candidate.get("authority_effect") != "none" or candidate.get("status") != "candidate_pending_independent_review":
        errors.append("候補status／authority effect境界が不正")
    return errors


def main() -> int:
    errors = check()
    if errors:
        for error in errors:
            print("FAIL", error)
        return 1
    print("PASS DOC-001 semantic atoms: atoms=76 requirements=19 relation=29 source_lines=126")
    print("PASS boundaries: product owner candidate only; implementation/degraded/failure/consumer unknown or pending; successor=0")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

#!/usr/bin/env python3
"""SCF-B-0006: DELEGATED-DOC-008/017 の read-only atom 候補検証。

正本台帳と固定 Git archive blob のみを読み、原文coverage、RDJ-FR/RDJ-AC ID、参照edge、
product boundary、旧phase／実装／consumer未確認境界を fail-close で検査する。
旧archiveのruntime/test/CI、GitHub、Issue、DBは実行・更新しない。
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DEFAULT_CANDIDATE = ROOT / "scaffold/delegated-doc-008-017/inventory.json"
SOURCE_LEDGER = ROOT / "docs/governance/delegated-requirement-document-source-holding.jsonl"
REFERENCE_LEDGER = ROOT / "docs/governance/delegated-requirement-document-reference-holding.jsonl"
ASSET_LEDGER = ROOT / "docs/governance/legacy-asset-disposition.jsonl"
PHASE_LEDGER = ROOT / "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl"
SOURCE_COMMIT = "9573119070cdf8f1f70e368bc310f575e8a3538c"
SOURCE_IDS = {"DELEGATED-DOC-008", "DELEGATED-DOC-017"}
REF_IDS = {"DELEGATED-REF-0341", "DELEGATED-REF-0342", "DELEGATED-REF-0414", "DELEGATED-REF-0415", "DELEGATED-REF-0772"}
PATHS = {
    "DELEGATED-DOC-008": "docs/design/helix/L3-requirements/requirement-discovery-json-authority.md",
    "DELEGATED-DOC-017": "docs/test-design/helix/requirement-discovery-json-authority-acceptance.md",
}
EXPECTED_COVERAGE = {
    "DELEGATED-DOC-008": [(1, 22), (23, 41), (42, 57), (58, 66), (67, 77), (78, 90)],
    "DELEGATED-DOC-017": [(1, 19), (20, 31), (32, 36)],
}
EXPECTED_REF_SHAPE = {
    "DELEGATED-REF-0341": (PATHS["DELEGATED-DOC-008"], "docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md", 14, "frontmatter_relation", "parent_design"),
    "DELEGATED-REF-0342": (PATHS["DELEGATED-DOC-008"], PATHS["DELEGATED-DOC-017"], 15, "frontmatter_relation", "pair_artifact"),
    "DELEGATED-REF-0414": ("docs/governance/helix-harness-requirements_v1.3.md", PATHS["DELEGATED-DOC-008"], 419, "body_reference", None),
    "DELEGATED-REF-0415": ("docs/governance/helix-harness-requirements_v1.3.md", PATHS["DELEGATED-DOC-017"], 420, "body_reference", None),
    "DELEGATED-REF-0772": (PATHS["DELEGATED-DOC-017"], PATHS["DELEGATED-DOC-008"], 13, "frontmatter_relation", "pair_artifact"),
}
PRODUCT_SOURCES = {
    "docs/concept/product-boundary.md": "097f27311060c56e387cf49fe6ec75731e5fd9dc04ac1a4be987d285e02ee038",
    "docs/helix-harness/L1-planning/product-intent.md": "a49da594e9593557eb42cbfe54edc7e9751ce40fea95d1fe9367f5780184ee04",
    "docs/helix-os/L1-planning/system-intent.md": "0f7f30d9d6984578f09c31ed1ef4e826d7c360bf752297982bde5201e7e99ca8",
}
FR_IDS = {f"RDJ-FR-{i:03d}" for i in range(1, 13)}
AC_IDS = {f"RDJ-AC-{i:03d}" for i in range(1, 13)}
META_IDS = {"RDJ-META-008", "RDJ-AUTHORITY-008", "RDJ-LIFECYCLE-008", "RDJ-TEMPLATE-008", "RDJ-PARTITION-008", "RDJ-META-017", "RDJ-BOUNDARY-017"}
CONSUMER_IDS = {"RDJ-FR-002", "RDJ-FR-008", "RDJ-FR-010", "RDJ-FR-011", "RDJ-AC-002", "RDJ-AC-008", "RDJ-AC-010", "RDJ-AC-011"}
GENERIC_BOUNDARY_STATEMENT = "原文のmetadata／責務境界／停止条件を候補として保持し、採否・実装・完了を生成しない"
EXPECTED_BOUNDARY_STATEMENTS = {
    "RDJ-META-008": "DOC-008はL3要件draftとしてL10 pair、parent_design、既存HR-FR refinement、freeze_blockingを宣言する候補metadataである",
    "RDJ-AUTHORITY-008": "既存Requirement Engineの4 owner責務とAI Vision Design HARNESSを再利用し、L1 Markdown→L2 append-only event/candidate projection→L3 strict JSON IRのauthority順序とG1/G3 human freeze gateを固定する",
    "RDJ-LIFECYCLE-008": "L2 candidateをhypothesisからfrozenまで段階管理し、rejected等のside/terminal状態を保持し、accepted/specified/frozenの人間・compile・G1/G3条件とPR-1 contract-only境界を適用する",
    "RDJ-TEMPLATE-008": "Requirement JSONからtemplate IDs・obligation IDs・artifact kindsを型付き出力し、未解決templateをpendingに留め、#290のtemplate移送とJSON ID束縛をPR-6/#288後まで保留する",
    "RDJ-PARTITION-008": "PR-1からPR-6へ契約、event/lifecycle、shadow JSON、generated view、JSON cutover、freeze packetを重複なく割り当て、PR-6で集合差分0を検査する",
    "RDJ-META-017": "DOC-017はQA/TL所有のL10受入設計draftで、DOC-008とのL3/L10 pairとRDJ-AC表を候補oracleとして保持するが、受入実行結果は持たない",
    "RDJ-BOUNDARY-017": "DOC-017のPR-1受入範囲を文書契約・既存owner mapping・Issue #30 hold・completion partitionへ限定し、PR-2以降runtime oracleは未実装として表示する",
}


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def load_jsonl(path: Path, errors: list[str]) -> list[dict]:
    try:
        lines = path.read_text(encoding="utf-8").splitlines()
    except OSError as exc:
        errors.append(f"台帳を読めない: {path}: {exc}")
        return []
    records = []
    for line_no, line in enumerate(lines, 1):
        if not line.strip():
            continue
        try:
            item = json.loads(line)
        except json.JSONDecodeError as exc:
            errors.append(f"台帳JSON不正: {path}:{line_no}: {exc}")
            continue
        if not isinstance(item, dict):
            errors.append(f"台帳recordがobjectではない: {path}:{line_no}")
            continue
        records.append(item)
    return records


def git_blob(commit: str, path: str, label: str, errors: list[str]) -> bytes | None:
    result = subprocess.run(["git", "cat-file", "blob", f"{commit}:{path}"], cwd=ROOT, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=False)
    if result.returncode:
        errors.append(f"{label}の固定Git blobを読めない: {commit}:{path}")
        return None
    return result.stdout


def blob_oid(data: bytes) -> str:
    return hashlib.sha1(f"blob {len(data)}\0".encode("ascii") + data).hexdigest()


def span_bytes(data: bytes, start: int, end: int) -> bytes | None:
    lines = data.splitlines(keepends=True)
    if start < 1 or end < start or end > len(lines):
        return None
    return b"".join(lines[start - 1:end])


def check_span(errors: list[str], label: str, data: bytes, declaration: dict) -> None:
    start, end = declaration.get("start_line"), declaration.get("end_line")
    if not isinstance(start, int) or not isinstance(end, int):
        errors.append(f"{label} span lineが整数ではない")
        return
    actual = span_bytes(data, start, end)
    if actual is None:
        errors.append(f"{label} span不正: {start}-{end}")
        return
    if declaration.get("exact_source_text") != actual.decode("utf-8"):
        errors.append(f"{label} exact_source_text不一致")
    expected = "sha256:" + hashlib.sha256(actual).hexdigest()
    if declaration.get("sha256") != expected:
        errors.append(f"{label} span SHA-256不一致")


def main() -> int:
    parser = argparse.ArgumentParser(description="SCF-B-0006 delegated document atom candidate static check")
    parser.add_argument("--candidate", type=Path, default=DEFAULT_CANDIDATE)
    args = parser.parse_args()
    errors: list[str] = []
    try:
        candidate = json.loads(args.candidate.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        print(f"FAIL: candidateを読めない: {exc}")
        return 1

    if candidate.get("schema") != "helix-scaffold-delegated-doc-ref-atom-candidate.v1": errors.append("candidate schema不正")
    if candidate.get("candidate_id") != "RDP-001-DELEGATED-DOC-008-017-REF-0341-0342-0414-0415-0772": errors.append("candidate_id不正")
    if candidate.get("status") != "candidate_pending_atomization_review": errors.append("candidate status不正")
    for field, expected in (("authority_effect", "none"), ("meaning_change_applied", False), ("successor_requirement_ids", []), ("human_decision_ref", None), ("equivalence_claim", None), ("old_runtime_test_ci_execution", False)):
        if candidate.get(field) != expected: errors.append(f"candidate {field}が候補境界に反する")

    comparison = candidate.get("comparison", {})
    if comparison.get("source_commit") != SOURCE_COMMIT: errors.append("source_commitが最新main固定値と不一致")
    if comparison.get("source_documents") != sorted(SOURCE_IDS): errors.append("source_documents ID集合不一致")
    if comparison.get("reference_edges") != sorted(REF_IDS): errors.append("reference_edges ID集合不一致")

    source_records = load_jsonl(SOURCE_LEDGER, errors)
    reference_records = load_jsonl(REFERENCE_LEDGER, errors)
    asset_records = load_jsonl(ASSET_LEDGER, errors)
    phase_records = load_jsonl(PHASE_LEDGER, errors)
    source_by_id = {x.get("source_document_id"): x for x in source_records}
    ref_by_id = {x.get("reference_id"): x for x in reference_records}
    asset_by_path = {x.get("source_path"): x for x in asset_records}
    phase_by_path = {x.get("source_path"): x for x in phase_records}

    prov = candidate.get("ledger_provenance", {})
    for label, path, field in (("source", SOURCE_LEDGER, "source_holding_sha256"), ("reference", REFERENCE_LEDGER, "reference_holding_sha256"), ("asset", ASSET_LEDGER, "asset_ledger_sha256"), ("phase", PHASE_LEDGER, "phase_ledger_sha256")):
        if prov.get(field) != digest(path): errors.append(f"{label} ledger SHA-256不一致")
    scope = candidate.get("holding_scope", {})
    if (len(source_records), len(reference_records)) != (114, 788): errors.append("holding台帳の全件数が114/788ではない")
    if scope.get("source_record_count") != 114 or scope.get("reference_record_count") != 788: errors.append("holding_scope全件数不一致")
    if scope.get("excluded_source_document_ids") != ["DELEGATED-DOC-003", "DELEGATED-DOC-028"]: errors.append("除外source scope不一致")
    if scope.get("excluded_reference_ids") != ["DELEGATED-REF-0303", "DELEGATED-REF-0759", "DELEGATED-REF-0760"]: errors.append("除外reference scope不一致")
    if scope.get("remaining_source_record_count") != 112 or scope.get("remaining_reference_record_count") != 785: errors.append("remaining holding件数不一致")

    source_items = candidate.get("source_documents")
    if not isinstance(source_items, list) or {x.get("source_document_id") for x in source_items if isinstance(x, dict)} != SOURCE_IDS:
        errors.append("source_documents ID集合不一致")
        source_items = source_items if isinstance(source_items, list) else []
    source_blobs: dict[str, bytes] = {}
    for item in source_items:
        if not isinstance(item, dict): errors.append("source documentがobjectではない"); continue
        doc_id = item.get("source_document_id")
        record = source_by_id.get(doc_id)
        if doc_id not in SOURCE_IDS or record is None:
            errors.append(f"未知または欠落のsource document: {doc_id}"); continue
        for field in ("source_path", "archive_path", "sha256", "source_declared_status", "source_relation", "holding_granularity", "carry_status", "meaning_change_applied", "successor_refs", "human_decision_ref"):
            if item.get(field) != record.get(field): errors.append(f"{doc_id} candidate/ledger {field}不一致")
        if item.get("source_path") != PATHS[doc_id]: errors.append(f"{doc_id} source_path不一致")
        data = git_blob(SOURCE_COMMIT, item.get("archive_path", ""), doc_id, errors)
        if data is None: continue
        source_blobs[doc_id] = data
        if item.get("source_blob_sha256") != "sha256:" + hashlib.sha256(data).hexdigest(): errors.append(f"{doc_id} source blob SHA-256不一致")
        if item.get("source_blob_oid") != blob_oid(data): errors.append(f"{doc_id} source blob OID不一致")
        if item.get("line_count") != len(data.splitlines(keepends=True)): errors.append(f"{doc_id} line_count不一致")
        if item.get("source_declared_status") != "draft": errors.append(f"{doc_id} source statusをdraft以外へ昇格している")

    # Exact five ledger edges, including the parent dependency and inbound authority records.
    edge_items = candidate.get("reference_edges")
    if not isinstance(edge_items, list) or {x.get("reference_id") for x in edge_items if isinstance(x, dict)} != REF_IDS:
        errors.append("reference_edges ID集合不一致")
        edge_items = edge_items if isinstance(edge_items, list) else []
    for item in edge_items:
        if not isinstance(item, dict): errors.append("reference edgeがobjectではない"); continue
        ref_id = item.get("reference_id")
        record = ref_by_id.get(ref_id)
        expected = EXPECTED_REF_SHAPE.get(ref_id)
        if record is None or expected is None:
            errors.append(f"未知または欠落のreference edge: {ref_id}"); continue
        if item != record: errors.append(f"{ref_id} candidate/ledger record不一致")
        if (item.get("source_path"), item.get("target_path"), item.get("source_line"), item.get("reference_origin"), item.get("relation_key")) != expected:
            errors.append(f"{ref_id} edge shape不一致")

    legacy_items = candidate.get("legacy_asset_status")
    if not isinstance(legacy_items, list) or {x.get("source_document_id") for x in legacy_items if isinstance(x, dict)} != SOURCE_IDS:
        errors.append("legacy_asset_status ID集合不一致")
        legacy_items = legacy_items if isinstance(legacy_items, list) else []
    legacy_by_doc = {x.get("source_document_id"): x for x in legacy_items if isinstance(x, dict)}
    for doc_id in SOURCE_IDS:
        item = legacy_by_doc.get(doc_id); source = source_by_id.get(doc_id)
        if item is None or source is None: errors.append(f"{doc_id} legacy status欠落"); continue
        path = source["source_path"]; asset = asset_by_path.get(path); phase = phase_by_path.get(path)
        if asset is None or phase is None: errors.append(f"{doc_id} asset/phase ledger record欠落"); continue
        declared_a = item.get("asset_ledger", {}); declared_p = item.get("phase_product_bootstrap", {})
        if item.get("asset_id") != asset.get("asset_id"): errors.append(f"{doc_id} asset_id不一致")
        for field in ("asset_class", "authority_status", "disposition", "implementation_status", "executability_status", "external_effect_status", "consumer_refs", "product_target", "pair_ids", "reuse_exclusion_class", "revision"):
            if declared_a.get(field) != asset.get(field): errors.append(f"{doc_id} asset {field}不一致")
        for field in ("classification_id", "artifact_evidence_kind", "phase_classification_status", "candidate_phase_targets", "candidate_product_targets", "product_classification_status", "consumer_closure_status", "implementation_evidence_state", "legacy_execution_performed", "legacy_implementation_status", "unresolved"):
            if declared_p.get(field) != phase.get(field): errors.append(f"{doc_id} phase {field}不一致")
        if asset.get("asset_class") != "Historical" or asset.get("authority_status") != "historical" or asset.get("disposition") != "unresolved" or asset.get("implementation_status") != "unknown" or asset.get("consumer_refs") != []: errors.append(f"{doc_id} old asset pending境界不一致")
        if phase.get("consumer_closure_status") != "pending" or phase.get("legacy_execution_performed") is not False or phase.get("legacy_implementation_status") != "unknown": errors.append(f"{doc_id} phase/consumer未確認境界不一致")
        if phase.get("candidate_product_targets") != ["HELIX-HARNESS"]: errors.append(f"{doc_id} product候補をHARNESS以外へ拡張している")

    # Lossless coverage partition.
    coverage = candidate.get("coverage_spans")
    if not isinstance(coverage, list) or len(coverage) != 9: errors.append("coverage_spansは9件でなければならない"); coverage = coverage if isinstance(coverage, list) else []
    by_doc = {x: [] for x in SOURCE_IDS}
    for item in coverage:
        if not isinstance(item, dict): errors.append("coverage spanがobjectではない"); continue
        doc_id = item.get("source_document_id"); declaration = item.get("source_span")
        if doc_id not in SOURCE_IDS or not isinstance(declaration, dict): errors.append(f"coverage span source/declaration不正: {item.get('coverage_span_id')}"); continue
        if item.get("source_path") != PATHS[doc_id]: errors.append(f"{item.get('coverage_span_id')} source_path不一致")
        by_doc[doc_id].append((declaration.get("start_line"), declaration.get("end_line")))
        if doc_id in source_blobs: check_span(errors, item.get("coverage_span_id", "coverage"), source_blobs[doc_id], declaration)
    for doc_id, expected in EXPECTED_COVERAGE.items():
        if sorted(by_doc[doc_id]) != expected: errors.append(f"{doc_id} coverage span集合不一致: {by_doc[doc_id]}")
        line_count = len(source_blobs.get(doc_id, b"").splitlines(keepends=True))
        covered = [line for start, end in sorted(by_doc[doc_id]) for line in range(start, end + 1)]
        if covered != list(range(1, line_count + 1)): errors.append(f"{doc_id} coverageに欠落または重複")

    atoms = candidate.get("atoms")
    if not isinstance(atoms, list) or len(atoms) != 31: errors.append("semantic atomsは31件でなければならない"); atoms = atoms if isinstance(atoms, list) else []
    atom_ids = {x.get("semantic_atom_id") for x in atoms if isinstance(x, dict)}
    if len(atom_ids) != len(atoms): errors.append("semantic atom ID重複を検出した")
    original_ids = {x.get("original_id") for x in atoms if isinstance(x, dict)}
    expected_original = FR_IDS | AC_IDS | META_IDS
    if original_ids != expected_original: errors.append(f"original ID集合不一致: missing={sorted(expected_original-original_ids)} extra={sorted(original_ids-expected_original)}")
    for atom in atoms:
        if not isinstance(atom, dict): errors.append("semantic atomがobjectではない"); continue
        aid = atom.get("semantic_atom_id"); original = atom.get("original_id"); doc_id = atom.get("source_document_id")
        if doc_id not in SOURCE_IDS or atom.get("source_path") != PATHS.get(doc_id): errors.append(f"{aid} source document/path不一致")
        if atom.get("source_revision") != SOURCE_COMMIT: errors.append(f"{aid} source_revision不一致")
        if atom.get("candidate_target") not in {"HELIX-HARNESS", "unresolved"}: errors.append(f"{aid} candidate_target不正")
        if atom.get("candidate_target") == "HELIX-HARNESS" and "HELIX-OS" in atom.get("owner_candidates", []): errors.append(f"{aid} OS consumerをownerへ混入している")
        if not isinstance(atom.get("owner_candidates"), list) or not atom.get("owner_candidates"): errors.append(f"{aid} owner_candidates欠落")
        consumers = atom.get("consumer_product_candidates")
        if not isinstance(consumers, list) or not set(consumers) <= {"HELIX-OS", "HELIX-Web", "HELIX-Web-OS"}: errors.append(f"{aid} consumer product候補不正")
        if not atom.get("normalized_statement") or not atom.get("questions"): errors.append(f"{aid} normalized/questions欠落")
        if original in EXPECTED_BOUNDARY_STATEMENTS:
            if atom.get("normalized_statement") == GENERIC_BOUNDARY_STATEMENT: errors.append(f"{aid} generic boundary placeholderを拒否")
            if atom.get("normalized_statement") != EXPECTED_BOUNDARY_STATEMENTS[original]: errors.append(f"{aid} boundary normalized_statementが原文固有の要約ではない")
            if any(value == "原IDまたは境界spanのexact source textを保持する" for value in atom.get("retained_meaning", [])): errors.append(f"{aid} generic retained_meaning placeholderを拒否")
            if any("sourceのfailure／authority／actor条件を下流設計へ移す許可はあるか" == value for value in atom.get("questions", [])): errors.append(f"{aid} generic question placeholderを拒否")
        if not atom.get("actor_conditions") or not atom.get("authority_conditions") or not atom.get("failure_negative_conditions"): errors.append(f"{aid} actor/authority/failure条件欠落")
        if atom.get("legacy_status_ref") not in SOURCE_IDS or atom.get("legacy_status_unconfirmed") is not True: errors.append(f"{aid} legacy未確認境界欠落")
        expected_state = {
          "phase_candidates": phase_by_path.get(PATHS.get(doc_id), {}).get("candidate_phase_targets"),
          "phase_status": phase_by_path.get(PATHS.get(doc_id), {}).get("phase_classification_status"),
          "implementation_status": asset_by_path.get(PATHS.get(doc_id), {}).get("implementation_status"),
          "implementation_evidence_state": phase_by_path.get(PATHS.get(doc_id), {}).get("implementation_evidence_state"),
          "legacy_implementation_status": phase_by_path.get(PATHS.get(doc_id), {}).get("legacy_implementation_status"),
          "consumer_status": phase_by_path.get(PATHS.get(doc_id), {}).get("consumer_closure_status"),
          "consumer_refs": asset_by_path.get(PATHS.get(doc_id), {}).get("consumer_refs"),
          "unconfirmed": True,
        }
        if atom.get("legacy_state") != expected_state: errors.append(f"{aid} legacy state snapshot不一致")
        if not isinstance(atom.get("reference_edge_ids"), list) or not set(atom.get("reference_edge_ids", [])) <= REF_IDS: errors.append(f"{aid} reference edge ID不正")
        declaration = atom.get("source_span")
        if not isinstance(declaration, dict): errors.append(f"{aid} source_span欠落")
        elif doc_id in source_blobs: check_span(errors, aid, source_blobs[doc_id], declaration)
        if original in FR_IDS | AC_IDS:
            if original not in declaration.get("exact_source_text", ""): errors.append(f"{aid} original IDのsource groundingがない")
            if atom.get("candidate_kind") != ("requirement" if original in FR_IDS else "acceptance"): errors.append(f"{aid} candidate_kind不一致")
            if declaration.get("start_line") != declaration.get("end_line"): errors.append(f"{aid} FR/AC atomが単一行spanではない")
        elif original in META_IDS and atom.get("candidate_kind") not in {"metadata", "boundary"}: errors.append(f"{aid} metadata/boundary kind不正")

    atomization = candidate.get("semantic_atomization", {})
    if atomization.get("original_id_sets") != {"RDJ-FR": 12, "RDJ-AC": 12} or atomization.get("metadata_or_boundary_atoms") != 7 or atomization.get("semantic_atom_count") != 31 or atomization.get("coverage_span_count") != 9 or atomization.get("source_lines_total") != 126 or atomization.get("coverage_and_semantics_are_separate") is not True: errors.append("semantic_atomization count/scope不一致")
    if set(atomization.get("consumer_boundary_ids", [])) != CONSUMER_IDS: errors.append("consumer boundary ID集合不一致")

    linkage = candidate.get("reference_edge_linkage")
    if not isinstance(linkage, dict) or set(linkage) != REF_IDS: errors.append("reference_edge_linkageのedge集合不一致")
    else:
        for ref_id, linked in linkage.items():
            if not isinstance(linked, list) or not linked or not set(linked) <= atom_ids: errors.append(f"{ref_id} linkage atom不正")
            expected_linked = {a.get("semantic_atom_id") for a in atoms if isinstance(a, dict) and ref_id in (a.get("reference_edge_ids") or [])}
            if not any(ref_id in (a.get("reference_edge_ids") or []) for a in atoms if isinstance(a, dict)): errors.append(f"{ref_id}がatomから参照されていない")
            if set(linked) != expected_linked: errors.append(f"{ref_id} reference_edge_linkageの双方向対応が不一致")

    negatives = candidate.get("negative_conditions")
    if not isinstance(negatives, list) or len(negatives) != 14: errors.append("negative_conditionsは14件でなければならない"); negatives = negatives if isinstance(negatives, list) else []
    neg_ids = set()
    for item in negatives:
        if not isinstance(item, dict): errors.append("negative conditionがobjectではない"); continue
        neg_ids.add(item.get("negative_id"))
        if not item.get("condition") or not item.get("source_atom_ids") or not set(item["source_atom_ids"]) <= atom_ids: errors.append(f"negative condition不正: {item.get('negative_id')}")
    expected_neg_ids = {f"SCF006-NEG-{i:03d}" for i in range(1, 15)}
    if neg_ids != expected_neg_ids: errors.append(f"negative ID集合不一致: missing={sorted(expected_neg_ids-neg_ids)} extra={sorted(neg_ids-expected_neg_ids)}")

    product = candidate.get("product_boundary", {})
    if product.get("product_owner_candidates") != ["HELIX-HARNESS"] or product.get("consumer_product_candidates") != ["HELIX-OS"] or product.get("boundary_status") != "candidate_only" or product.get("consumer_boundary_status") != "candidate_only": errors.append("product boundary候補境界不一致")
    product_sources = product.get("sources")
    if not isinstance(product_sources, list) or len(product_sources) != len(PRODUCT_SOURCES) or {item.get("path") for item in product_sources if isinstance(item, dict)} != set(PRODUCT_SOURCES): errors.append("product boundary source集合が期待3件と不一致")
    for item in product_sources if isinstance(product_sources, list) else []:
        path = ROOT / item.get("path", "")
        if item.get("path") not in PRODUCT_SOURCES or not path.is_file() or digest(path) != item.get("sha256") or item.get("sha256") != PRODUCT_SOURCES.get(item.get("path")): errors.append(f"product boundary source digest不一致: {item.get('path')}")

    boundary_edges = candidate.get("boundary_edges", {})
    if boundary_edges.get("DELEGATED-REF-0341", {}).get("status") != "outside_selected_batch": errors.append("REF-0341 parent boundaryを保持していない")

    if errors:
        print("FAIL: SCF-B-0006 DELEGATED-DOC-008/017 + 5 edges")
        for error in errors: print(f"- {error}")
        return 1
    counts = {owner: sum(1 for atom in atoms if atom.get("candidate_target") == owner) for owner in ("HELIX-HARNESS", "unresolved")}
    print("PASS: SCF-B-0006 DELEGATED-DOC-008/017 + 5 edges")
    print(f"documents=2; references=5; coverage_spans=9; semantic_atoms=31; source_lines=126; negative_conditions=14")
    print(f"candidate_target_counts={counts}; original_ids=RDJ-FR:12/RDJ-AC:12; consumer_boundary_ids={len(CONSUMER_IDS)}")
    print("authority_effect=none; atomization=unresolved; legacy_runtime_test_ci=forbidden; phase/implementation/consumer=unconfirmed")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())

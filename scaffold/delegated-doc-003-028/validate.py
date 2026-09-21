#!/usr/bin/env python3
"""DELEGATED-DOC-003/028 + REF-0303/0759/0760 のread-only静的確認。

正本台帳、固定Git archive blob、製品境界候補だけを読み、候補atomのspan／digestと
line coverageを検査する。旧runtime、test、CI、GitHub、DBは実行・更新しない。
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import subprocess
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
DEFAULT_CANDIDATE = ROOT / "scaffold/delegated-doc-003-028/inventory.json"
SOURCE_LEDGER = ROOT / "docs/governance/delegated-requirement-document-source-holding.jsonl"
REFERENCE_LEDGER = ROOT / "docs/governance/delegated-requirement-document-reference-holding.jsonl"
ASSET_LEDGER = ROOT / "docs/governance/legacy-asset-disposition.jsonl"
PHASE_LEDGER = ROOT / "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl"
EXPECTED_SOURCE_IDS = {"DELEGATED-DOC-003", "DELEGATED-DOC-028"}
EXPECTED_REFERENCE_IDS = {"DELEGATED-REF-0303", "DELEGATED-REF-0759", "DELEGATED-REF-0760"}
EXPECTED_SOURCE_COMMIT = "17ce6830d2d4c684c96d55705cdc65790a4fdaa4"
EXPECTED_PATHS = {
    "DELEGATED-DOC-003": "docs/design/helix/L3-requirements/github-autonomous-operations-requirements.md",
    "DELEGATED-DOC-028": "docs/test-design/helix/github-autonomous-operations-acceptance.md",
}
EXPECTED_SPANS = {
    "DELEGATED-DOC-003": [(1, 18), (19, 35), (36, 58), (59, 77), (78, 89), (90, 115), (116, 148), (149, 160), (161, 178), (179, 196)],
    "DELEGATED-DOC-028": [(1, 19), (20, 32), (33, 40), (41, 48)],
}
EXPECTED_REF_SHAPE = {
    "DELEGATED-REF-0303": (EXPECTED_PATHS["DELEGATED-DOC-003"], EXPECTED_PATHS["DELEGATED-DOC-028"], 9, "frontmatter_relation", "pair_artifact"),
    "DELEGATED-REF-0759": (EXPECTED_PATHS["DELEGATED-DOC-028"], EXPECTED_PATHS["DELEGATED-DOC-003"], 12, "frontmatter_relation", "pair_artifact"),
    "DELEGATED-REF-0760": (EXPECTED_PATHS["DELEGATED-DOC-028"], EXPECTED_PATHS["DELEGATED-DOC-003"], 17, "body_reference", None),
}
EXPECTED_PRODUCT_SOURCES = {
    ("docs/concept/product-boundary.md", "097f27311060c56e387cf49fe6ec75731e5fd9dc04ac1a4be987d285e02ee038"),
    ("docs/helix-harness/L1-planning/product-intent.md", "a49da594e9593557eb42cbfe54edc7e9751ce40fea95d1fe9367f5780184ee04"),
    ("docs/helix-os/L1-planning/system-intent.md", "0f7f30d9d6984578f09c31ed1ef4e826d7c360bf752297982bde5201e7e99ca8"),
}
EXPECTED_REFERENCE_LINKAGE = {
    "DELEGATED-REF-0303": {"DD328-SEM-DOC-003-METADATA", "DD328-SEM-GH-FR-001", "DD328-SEM-DOC-028-METADATA"},
    "DELEGATED-REF-0759": {"DD328-SEM-DOC-028-METADATA", "DD328-SEM-DOC-003-METADATA"},
    "DELEGATED-REF-0760": {"DD328-SEM-DOC-028-METADATA", "DD328-SEM-DOC-003-METADATA"},
}
EXPECTED_NEGATIVE_IDS = {f"DD328-NEG-{index:03d}" for index in range(1, 8)}
EXPECTED_TARGET_BY_ORIGINAL_ID = {
    **{f"GH-FR-{index:03d}": "HELIX-HARNESS" for index in (1, 2, 3, 4, 5, 6, 7, 15)},
    **{f"GH-FR-{index:03d}": "HELIX-OS" for index in (9, 10, 11, 13, 17)},
    **{f"GH-FR-{index:03d}": "unresolved" for index in (8, 12, 14, 16)},
    "GH-NFR-001": "unresolved", "GH-NFR-002": "HELIX-OS", "GH-NFR-003": "unresolved",
    "GH-NFR-004": "HELIX-OS", "GH-NFR-005": "HELIX-OS", "GH-NFR-006": "unresolved",
    "GH-NFR-007": "HELIX-OS", "GH-NFR-008": "unresolved",
    **{f"GH-AC-{index:03d}": "HELIX-HARNESS" for index in (1, 2, 3, 4, 11)},
    **{f"GH-AC-{index:03d}": "HELIX-OS" for index in (5, 6, 7, 8, 9, 10, 13)},
    "GH-AC-012": "unresolved",
    **{f"GH-T-{index:03d}": "HELIX-HARNESS" for index in (1, 2, 3, 4, 11, 12)},
    **{f"GH-T-{index:03d}": "HELIX-OS" for index in (5, 6, 7, 8, 9, 10)},
    **{f"GH-T-{index:03d}": "unresolved" for index in (13, 14, 15, 16)},
    "DOC-003-METADATA": "unresolved", "DOC-003-OBJECTS": "unresolved", "DOC-003-UT-FREEZE": "unresolved",
    "DOC-028-METADATA": "unresolved", "DOC-028-EVIDENCE": "unresolved",
}
EXPECTED_NORMALIZED_STATEMENTS = {
    "GH-AC-001": "Issue Form・workflow identity・registryの検査器が、必須欠落・部分tuple・未知axis／ID・stale registry・legacy current・複数候補をreason code付きでadmission拒否し、current exact tupleだけをPLAN候補にする。",
    "GH-AC-002": "PR scope検査器が、requirement closure外のファイル・依存・機能を含むfixtureをscope_expansionとしてblockする。",
    "GH-AC-003": "branch guardがbranch名・base SHA・寿命・ownershipの各違反を機械検出し、違反の判定結果を返す。",
    "GH-AC-004": "PR trace生成器がledgerからtrace blockを作成し、検証器が改竄・orphan ID・欠落pairを拒否する。",
    "GH-AC-005": "CI aggregateがLinux／Windows required legのfailure・cancel・skipを受けたfixtureを全て失敗と判定する。",
    "GH-AC-006": "policy drift検出器がauthoring policyとGitHub Rulesetを比較し、required check・strict・force・deletion・bypassの各差分を検出する。",
    "GH-AC-007": "CI failureからのevent列再生器が、同一episodeの修正再pushまたはRecovery遷移までを再現する。",
    "GH-AC-008": "merge後のprojectionがIssue close・PLAN／AC closure・DB revision・memory eventを同一HEADへ収束させる。",
    "GH-AC-009": "tag receipt逆引き器がlayer・version・HEAD・requirements digest・CI run・DB revisionを辿れるようにする。",
    "GH-AC-010": "chat追加要求の取り込み器がledgerへ記録し、対応requirement／ACまたは明示reject decisionへ到達させる。",
    "GH-AC-011": "UIなし案件のL2判定が証拠付きnot_applicableを生成し、工程欠落として扱わない。",
    "GH-AC-012": "closure評価器がrequirement・AC・edge・pair・findingの全分母一致を確認し、orphan 0かつ未解決blocker 0の場合だけ100%と判定する（製品ownerは未解決）。",
    "GH-AC-013": "Closes #N付きPRのclosure gateがOutcome・closure receipt・子Issue disposition欠落をblockし、rejected／quarantinedは終端decision receiptでcloseを許可し、superseded／cancelledはPO decision欠落時にblockする。",
    "GH-T-001": "GH-AC-001 fixtureでexact tuple・必須欠落・部分tuple・未知axis／ID・stale registry・legacy current・複数候補を投入し、exact tupleだけadmit、他はreason code付きfail-close、分類失敗のFull V／Forward／Scrum丸めを拒否する。",
    "GH-T-002": "GH-AC-002 fixtureでrequirement closure外のPR diffを投入し、mergeを拒否して分離Issue候補を生成する。",
    "GH-T-003": "GH-AC-003 fixtureで不正prefix・stale base・foreign ownership branchを投入し、branch guardが全件検出する。",
    "GH-T-004": "GH-AC-004 fixtureで正常・改竄・orphan・片肺PR trace blockを投入し、正常fixtureだけvalidateする。",
    "GH-T-005": "GH-AC-005 fixtureでrequired legのsuccess／failure／cancel／skip直積を投入し、全leg success以外をaggregate failにする。",
    "GH-T-006": "GH-AC-006 fixtureでRuleset driftを投入し、check・strict・force・deletion・bypass各差分を個別finding化する。",
    "GH-T-007": "GH-AC-007 fixtureでCI failure webhook重複配送を含むevent列を投入し、self-healを1 episodeに統合し、上限到達時はRecoveryを1件記録する。",
    "GH-T-008": "GH-AC-008 fixtureでmerge webhookを再送し、projectionを冪等処理し、全recordを同一HEADへ収束する。",
    "GH-T-009": "GH-AC-009 fixtureでlayer／release tag receiptを投入し、receipt完全時だけtag候補にし、欠落時はrejectする。",
    "GH-T-010": "GH-AC-010 fixtureでchat追加要求を投入し、provenance付きledger rowとdispositionを生成する。",
    "GH-T-011": "GH-AC-011 fixtureでCLI-only HARNESS案件を投入し、L2を暗黙欠落とせずN/A evidenceを生成する。",
    "GH-T-012": "GH-AC-012 fixtureでcount mismatch・orphan・重複・unresolved blockerを投入し、完了率100%を拒否する。",
    "GH-T-013": "GH-AC-013 fixtureでCloses #N付きPRのOutcome・closure receipt・子Issue disposition・PO decisionを各一つ欠落させ、rejected／quarantined／superseded／cancelledを投入し、resolved系欠落はblock、不採用系はdecision receiptのみ受理、superseded／cancelledはPO decision欠落で拒否する。",
    "GH-T-014": "GH-AC-016 fixtureでCI green・AI-B receiptなし、AI-BがHEAD編集、review後drift、全receipt同一HEADを投入し、前3つを拒否し、read-only AI-B reviewかつ全receipt同一HEADだけ明示merge可能とする。",
    "GH-T-015": "GH-AC-017 fixtureでcurrent contract内局所correctness／security、独立lifecycle、性能改善、命名提案のfindingを投入し、前者はcurrent PR修正、後3者は後続Issueへ分離してcurrent PRへ再流入させない。",
    "GH-T-016": "GH-AC-034 fixtureでrequired CI greenかつnative auto-merge設定済みPRと、AI-Bがcurrent HEADを再照合するPRを投入し、native auto-mergeを拒否し後者だけ明示mergeを許可する。",
}
EXPECTED_SUMMARY_SOURCE_ANCHORS = {
    "GH-AC-001": ("必須項目欠落", "current exact tuple"),
    "GH-AC-002": ("scope外", "scope_expansion"),
    "GH-AC-003": ("branch名", "ownership"),
    "GH-AC-004": ("PR trace block", "orphan ID"),
    "GH-AC-005": ("Linux/Windows", "aggregate"),
    "GH-AC-006": ("authoring policy", "GitHub Ruleset"),
    "GH-AC-007": ("同一episode", "Recovery"),
    "GH-AC-008": ("同一HEAD", "DB revision"),
    "GH-AC-009": ("tag receipt", "requirements digest"),
    "GH-AC-010": ("chat追加要求", "reject decision"),
    "GH-AC-011": ("not_applicable", "工程欠落"),
    "GH-AC-012": ("orphan 0", "未解決 blocker 0"),
    "GH-AC-013": ("Outcome", "PO decision"),
    "GH-T-001": ("current workflow identity exact tuple", "fail-close"),
    "GH-T-002": ("requirement closure外", "分離Issue候補"),
    "GH-T-003": ("不正prefix", "foreign ownership branch"),
    "GH-T-004": ("正常/改竄/orphan/片肺PR trace block", "正常のみvalidate"),
    "GH-T-005": ("required legのsuccess/failure/cancel/skip直積", "aggregate fail"),
    "GH-T-006": ("Ruleset drift fixture", "個別finding化"),
    "GH-T-007": ("CI failure webhookの重複配送", "Recovery 1件"),
    "GH-T-008": ("merge webhook再送", "同一HEADへ収束"),
    "GH-T-009": ("layer/release tag fixture", "欠落時reject"),
    "GH-T-010": ("chatで追加された要求", "provenance付きledger row"),
    "GH-T-011": ("CLI-only HARNESS案件", "N/A evidence"),
    "GH-T-012": ("count mismatch/orphan/重複/unresolved blocker fixture", "完了率100%"),
    "GH-T-013": ("Outcome", "superseded/cancelled"),
    "GH-T-014": ("CI greenだがAI-B receiptなし", "全receipt同一HEAD"),
    "GH-T-015": ("current contract内の局所correctness/security", "後続Issue"),
    "GH-T-016": ("native auto-merge設定済み", "current HEADを再照合"),
}
EXPECTED_UNRESOLVED_ATOM_LINKS = {
    "GH-T-014": "RDP-UNRESOLVED-GH-AC-016",
    "GH-T-015": "RDP-UNRESOLVED-GH-AC-017",
    "GH-T-016": "RDP-UNRESOLVED-GH-AC-034",
}
EXPECTED_ORIGINAL_IDS = {
    *(f"GH-FR-{index:03d}" for index in range(1, 18)),
    *(f"GH-NFR-{index:03d}" for index in range(1, 9)),
    *(f"GH-AC-{index:03d}" for index in range(1, 14)),
    *(f"GH-T-{index:03d}" for index in range(1, 17)),
}
EXPECTED_SEMANTIC_COUNT = 59
EXPECTED_COVERAGE_SPANS = {
    "DELEGATED-DOC-003": [(1, 18), (19, 35), (36, 58), (59, 77), (78, 89), (90, 115), (116, 148), (149, 160), (161, 178), (179, 196)],
    "DELEGATED-DOC-028": [(1, 19), (20, 32), (33, 40), (41, 48)],
}
SHA256 = re.compile(r"^sha256:[0-9a-f]{64}$")


def fail(errors: list[str], message: str) -> None:
    errors.append(message)


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def load_jsonl(path: Path, errors: list[str]) -> list[dict]:
    records: list[dict] = []
    try:
        lines = path.read_text(encoding="utf-8").splitlines()
    except OSError as exc:
        fail(errors, f"台帳を読めない: {path}: {exc}")
        return records
    for line_no, line in enumerate(lines, 1):
        if not line.strip():
            continue
        try:
            value = json.loads(line)
        except json.JSONDecodeError as exc:
            fail(errors, f"台帳JSON不正: {path}:{line_no}: {exc}")
            continue
        if not isinstance(value, dict):
            fail(errors, f"台帳recordがobjectではない: {path}:{line_no}")
            continue
        records.append(value)
    return records


def git_blob(commit: str, archive_path: str, label: str, errors: list[str]) -> bytes | None:
    result = subprocess.run(
        ["git", "cat-file", "blob", f"{commit}:{archive_path}"],
        cwd=ROOT,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        check=False,
    )
    if result.returncode != 0:
        fail(errors, f"{label}のGit blobを読めない: {commit}:{archive_path}")
        return None
    return result.stdout


def git_blob_oid(blob: bytes) -> str:
    return hashlib.sha1(f"blob {len(blob)}\0".encode("ascii") + blob).hexdigest()


def span_bytes(blob: bytes, start: int, end: int) -> bytes | None:
    if start < 1 or end < start:
        return None
    lines = blob.splitlines(keepends=True)
    if end > len(lines):
        return None
    return b"".join(lines[start - 1 : end])


def check_span(errors: list[str], label: str, blob: bytes, declaration: dict) -> None:
    start = declaration.get("start_line")
    end = declaration.get("end_line")
    if not isinstance(start, int) or not isinstance(end, int):
        fail(errors, f"{label} line spanが整数ではない")
        return
    actual = span_bytes(blob, start, end)
    if actual is None:
        fail(errors, f"{label} line span不正: {start}-{end}")
        return
    if declaration.get("exact_source_text") != actual.decode("utf-8", errors="replace"):
        fail(errors, f"{label} exact_source_text不一致")
    actual_sha = "sha256:" + hashlib.sha256(actual).hexdigest()
    if declaration.get("sha256") != actual_sha:
        fail(errors, f"{label} span SHA-256不一致: {actual_sha}")


def fixed_acceptance_ids(blob: bytes) -> list[str]:
    """DOC-003固定blobのAC定義行だけを抽出する。DOC-028参照行とは分離する。"""
    ids = set()
    for line in blob.decode("utf-8").splitlines():
        match = re.match(r"^\|\s*(GH-AC-\d{3})\s*\|", line)
        if match:
            ids.add(match.group(1))
    return sorted(ids)


def fixed_acceptance_references(blob: bytes) -> dict[str, tuple[str, int]]:
    """DOC-028固定blobのTest ID→AC IDとsource lineを抽出する。"""
    refs: dict[str, tuple[str, int]] = {}
    for line_no, line in enumerate(blob.decode("utf-8").splitlines(), 1):
        match = re.match(r"^\|\s*(GH-T-\d{3})\s*\|\s*(GH-AC-\d{3})\s*\|", line)
        if match:
            refs[match.group(2)] = (match.group(1), line_no)
    return refs


def main() -> int:
    parser = argparse.ArgumentParser(description="DELEGATED-DOC/REF atom candidate static check")
    parser.add_argument("--candidate", type=Path, default=DEFAULT_CANDIDATE)
    args = parser.parse_args()
    errors: list[str] = []
    try:
        candidate = json.loads(args.candidate.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        print(f"FAIL: candidateを読めない: {exc}")
        return 1

    if candidate.get("schema") != "helix-scaffold-delegated-doc-ref-atom-candidate.v1":
        fail(errors, "candidate schema不正")
    if candidate.get("status") != "candidate_pending_atomization_review":
        fail(errors, "candidate status不正")
    for field, expected in (("authority_effect", "none"), ("meaning_change_applied", False), ("successor_requirement_ids", []), ("human_decision_ref", None), ("equivalence_claim", None), ("old_runtime_test_ci_execution", False)):
        if candidate.get(field) != expected:
            fail(errors, f"candidate {field}が候補境界に反する")

    comparison = candidate.get("comparison", {})
    source_commit = comparison.get("source_commit")
    if source_commit != EXPECTED_SOURCE_COMMIT:
        fail(errors, f"comparison source_commit不一致: {source_commit}")
    if comparison.get("source_documents") != sorted(EXPECTED_SOURCE_IDS):
        fail(errors, "comparison source_documents不一致")
    if comparison.get("reference_edges") != sorted(EXPECTED_REFERENCE_IDS):
        fail(errors, "comparison reference_edges不一致")

    ledgers = {
        "source": (SOURCE_LEDGER, candidate.get("ledger_provenance", {}).get("source_holding_sha256")),
        "reference": (REFERENCE_LEDGER, candidate.get("ledger_provenance", {}).get("reference_holding_sha256")),
        "asset": (ASSET_LEDGER, candidate.get("ledger_provenance", {}).get("asset_ledger_sha256")),
        "phase": (PHASE_LEDGER, candidate.get("ledger_provenance", {}).get("phase_ledger_sha256")),
    }
    ledger_records: dict[str, dict] = {}
    asset_records: dict[str, dict] = {}
    phase_records: dict[str, dict] = {}
    for kind, (path, declared_digest) in ledgers.items():
        if not path.is_file():
            continue
        if declared_digest != digest(path):
            fail(errors, f"{kind} ledger SHA-256不一致")
        for record in load_jsonl(path, errors):
            if kind == "source":
                key = record.get("source_document_id")
                if key is not None:
                    ledger_records[key] = record
            elif kind == "reference":
                key = record.get("reference_id")
                if key is not None:
                    ledger_records[key] = record
            elif kind == "asset" and record.get("source_path"):
                asset_records[record["source_path"]] = record
            elif kind == "phase" and record.get("source_path"):
                phase_records[record["source_path"]] = record

    source_items = candidate.get("source_documents")
    source_ids = [x.get("source_document_id") for x in source_items if isinstance(x, dict)] if isinstance(source_items, list) else []
    if len(source_ids) != 2 or len(set(source_ids)) != 2 or set(source_ids) != EXPECTED_SOURCE_IDS:
        fail(errors, "source_documentsは重複なしの2 ID集合でなければならない")
        source_items = source_items if isinstance(source_items, list) else []
    source_blobs: dict[str, bytes] = {}
    for source in source_items:
        if not isinstance(source, dict):
            fail(errors, "source documentがobjectではない")
            continue
        source_id = source.get("source_document_id")
        expected_path = EXPECTED_PATHS.get(source_id)
        if expected_path is None:
            fail(errors, f"未知のsource document ID: {source_id}")
            continue
        record = ledger_records.get(source_id)
        if record is None:
            fail(errors, f"source holdingにIDがない: {source_id}")
            continue
        for field in ("source_path", "archive_path", "sha256", "source_declared_status", "source_relation", "holding_granularity", "carry_status", "meaning_change_applied", "successor_refs", "human_decision_ref"):
            if source.get(field) != record.get(field):
                fail(errors, f"{source_id} candidate/ledger {field}不一致")
        if source.get("source_path") != expected_path:
            fail(errors, f"{source_id} source_path不一致")
        blob = git_blob(source_commit, source.get("archive_path", ""), source_id, errors)
        if blob is None:
            continue
        source_blobs[source_id] = blob
        if source.get("source_blob_sha256") != "sha256:" + hashlib.sha256(blob).hexdigest():
            fail(errors, f"{source_id} source blob SHA-256不一致")
        if source.get("source_blob_oid") != git_blob_oid(blob):
            fail(errors, f"{source_id} source blob OID不一致")
        if source.get("line_count") != len(blob.splitlines(keepends=True)):
            fail(errors, f"{source_id} line_count不一致")
        if source.get("source_declared_status") not in {"confirmed", "proposed"}:
            fail(errors, f"{source_id} source status候補が不正")

    # Pair closure must not invent AC definitions. Recompute both sets from the
    # fixed archive blobs and require an explicit unresolved record per missing ID.
    pair_audit = candidate.get("pair_acceptance_reference_audit")
    doc3_blob = source_blobs.get("DELEGATED-DOC-003")
    doc28_blob = source_blobs.get("DELEGATED-DOC-028")
    defined_ac_ids = fixed_acceptance_ids(doc3_blob) if doc3_blob is not None else []
    referenced_ac_rows = fixed_acceptance_references(doc28_blob) if doc28_blob is not None else {}
    missing_ac_ids = sorted(set(referenced_ac_rows) - set(defined_ac_ids))
    expected_unresolved_ids = [f"RDP-UNRESOLVED-{ac_id}" for ac_id in missing_ac_ids]
    expected_pair_audit = {
        "method": "recompute exact GH-AC definitions from DOC-003 fixed archive blob and GH-T→GH-AC references from DOC-028 fixed archive blob",
        "source_document_id": "DELEGATED-DOC-003",
        "source_defined_acceptance_ids": defined_ac_ids,
        "reference_document_id": "DELEGATED-DOC-028",
        "referenced_acceptance_ids": sorted(referenced_ac_rows),
        "missing_from_pair": missing_ac_ids,
        "unresolved_decision_ids": expected_unresolved_ids,
        "admission": "fail-close; no AC meaning, owner, authority, acceptance, or parity is inferred for missing IDs",
    }
    if pair_audit != expected_pair_audit:
        fail(errors, f"pair_acceptance_reference_auditが固定blob再計算結果と不一致: expected={expected_pair_audit} actual={pair_audit}")
    unresolved_records = candidate.get("unresolved_decisions")
    if not isinstance(unresolved_records, list):
        fail(errors, "unresolved_decisionsはlistでなければならない")
        unresolved_records = []
    unresolved_objects = [
        record for record in unresolved_records
        if isinstance(record, dict) and str(record.get("decision_id", "")).startswith("RDP-UNRESOLVED-GH-AC-")
    ]
    if len(unresolved_objects) != len(expected_unresolved_ids) or {record.get("decision_id") for record in unresolved_objects} != set(expected_unresolved_ids):
        fail(errors, f"unresolved_decisionsのmissing AC ID集合が不一致: expected={expected_unresolved_ids}")
    for ac_id in missing_ac_ids:
        test_id, source_line = referenced_ac_rows[ac_id]
        expected_record = {
            "decision_id": f"RDP-UNRESOLVED-{ac_id}",
            "acceptance_id": ac_id,
            "test_id": test_id,
            "status": "unresolved",
            "source_document_id": "DELEGATED-DOC-028",
            "source_line": source_line,
            "pair_document_id": "DELEGATED-DOC-003",
            "defined_acceptance_ids_in_pair": defined_ac_ids,
            "reason": f"{ac_id} is referenced by {test_id} in DELEGATED-DOC-028 but no matching {ac_id} definition exists in DELEGATED-DOC-003 fixed archive blob",
            "required_resolution": "human decision or a lossless pair-source definition is required before acceptance closure; do not infer meaning from the test row",
        }
        actual_record = next((record for record in unresolved_objects if record.get("decision_id") == expected_record["decision_id"]), None)
        if actual_record != expected_record:
            fail(errors, f"{expected_record['decision_id']} unresolved recordが固定blob差分と不一致")

    legacy_status = candidate.get("legacy_asset_status")
    if not isinstance(legacy_status, list) or {x.get("source_document_id") for x in legacy_status if isinstance(x, dict)} != EXPECTED_SOURCE_IDS:
        fail(errors, "legacy_asset_statusのsource ID集合不一致")
        legacy_status = legacy_status if isinstance(legacy_status, list) else []
    for status in legacy_status:
        if not isinstance(status, dict):
            fail(errors, "legacy_asset_status itemがobjectではない")
            continue
        source_id = status.get("source_document_id")
        source = next((x for x in source_items if isinstance(x, dict) and x.get("source_document_id") == source_id), None)
        source_path = source.get("source_path") if source else None
        asset = asset_records.get(source_path)
        phase = phase_records.get(source_path)
        if asset is None or phase is None:
            fail(errors, f"{source_id} asset／phase ledger record欠落")
            continue
        if status.get("asset_id") != asset.get("asset_id"):
            fail(errors, f"{source_id} asset_id不一致")
        declared_asset = status.get("asset_ledger", {})
        for field in ("asset_class", "authority_status", "disposition", "implementation_status", "executability_status", "external_effect_status", "consumer_refs", "product_target", "pair_ids", "reuse_exclusion_class", "revision"):
            if declared_asset.get(field) != asset.get(field):
                fail(errors, f"{source_id} asset status {field}不一致")
        declared_phase = status.get("phase_product_bootstrap", {})
        for field in ("classification_id", "artifact_evidence_kind", "phase_classification_status", "candidate_phase_targets", "candidate_product_targets", "product_classification_status", "consumer_closure_status", "implementation_evidence_state", "legacy_execution_performed", "legacy_implementation_status", "unresolved"):
            if declared_phase.get(field) != phase.get(field):
                fail(errors, f"{source_id} phase status {field}不一致")
        if asset.get("disposition") != "unresolved" or asset.get("implementation_status") != "unknown" or asset.get("consumer_refs") != []:
            fail(errors, f"{source_id} old asset statusがpending境界を外れている")
        if phase.get("consumer_closure_status") != "pending" or phase.get("legacy_execution_performed") is not False or phase.get("legacy_implementation_status") != "unknown":
            fail(errors, f"{source_id} phase／consumer statusがpending境界を外れている")
    legacy_status_by_doc = {x.get("source_document_id"): x for x in legacy_status if isinstance(x, dict)}

    refs = candidate.get("reference_edges")
    reference_ids = [x.get("reference_id") for x in refs if isinstance(x, dict)] if isinstance(refs, list) else []
    if len(reference_ids) != 3 or len(set(reference_ids)) != 3 or set(reference_ids) != EXPECTED_REFERENCE_IDS:
        fail(errors, "reference_edgesは重複なしの3 ID集合でなければならない")
        refs = refs if isinstance(refs, list) else []
    for ref in refs:
        if not isinstance(ref, dict):
            fail(errors, "reference edgeがobjectではない")
            continue
        ref_id = ref.get("reference_id")
        expected = EXPECTED_REF_SHAPE.get(ref_id)
        record = ledger_records.get(ref_id)
        if expected is None:
            fail(errors, f"未知のreference ID: {ref_id}")
            continue
        if record is None:
            fail(errors, f"reference holdingにIDがない: {ref_id}")
            continue
        if ref != record:
            fail(errors, f"{ref_id} candidate/ledger record不一致")
        source_path, target_path, source_line, origin, relation_key = expected
        if (ref.get("source_path"), ref.get("target_path"), ref.get("source_line"), ref.get("reference_origin"), ref.get("relation_key")) != expected:
            fail(errors, f"{ref_id} edge shape不一致")

    coverage_spans = candidate.get("coverage_spans")
    if not isinstance(coverage_spans, list) or len(coverage_spans) != 14:
        fail(errors, "coverage_spansは14件でなければならない")
        coverage_spans = coverage_spans if isinstance(coverage_spans, list) else []
    coverage_by_doc: dict[str, list[tuple[int, int]]] = {source_id: [] for source_id in EXPECTED_SOURCE_IDS}
    coverage_ids: set[str] = set()
    for coverage in coverage_spans:
        if not isinstance(coverage, dict):
            fail(errors, "coverage spanがobjectではない")
            continue
        coverage_id = coverage.get("coverage_span_id")
        if coverage_id in coverage_ids:
            fail(errors, f"coverage span ID重複: {coverage_id}")
        coverage_ids.add(coverage_id)
        source_id = coverage.get("source_document_id")
        if source_id not in EXPECTED_SOURCE_IDS:
            fail(errors, f"{coverage_id} source document不正")
            continue
        span = coverage.get("source_span")
        if not isinstance(span, dict):
            fail(errors, f"{coverage_id} source_span欠落")
            continue
        start, end = span.get("start_line"), span.get("end_line")
        if not isinstance(start, int) or not isinstance(end, int):
            fail(errors, f"{coverage_id} source span line不正")
            continue
        coverage_by_doc[source_id].append((start, end))
        blob = source_blobs.get(source_id)
        if blob is not None:
            check_span(errors, coverage_id, blob, span)
    for source_id, expected_spans in EXPECTED_COVERAGE_SPANS.items():
        if sorted(coverage_by_doc[source_id]) != expected_spans:
            fail(errors, f"{source_id} coverage span集合不一致: {coverage_by_doc[source_id]}")
        line_count = len(source_blobs.get(source_id, b"").splitlines(keepends=True))
        covered = []
        for start, end in sorted(coverage_by_doc[source_id]):
            covered.extend(range(start, end + 1))
        if covered != list(range(1, line_count + 1)):
            fail(errors, f"{source_id} composite line coverageに欠落または重複")

    atoms = candidate.get("atoms")
    if not isinstance(atoms, list) or len(atoms) != EXPECTED_SEMANTIC_COUNT:
        fail(errors, f"semantic atomsは{EXPECTED_SEMANTIC_COUNT}件でなければならない")
        atoms = atoms if isinstance(atoms, list) else []
    atom_ids: set[str] = set()
    original_ids: set[str] = set()
    metadata_ids: set[str] = set()
    for atom in atoms:
        if not isinstance(atom, dict):
            fail(errors, "semantic atomがobjectではない")
            continue
        atom_id = atom.get("semantic_atom_id")
        if atom_id in atom_ids:
            fail(errors, f"semantic atom ID重複: {atom_id}")
        atom_ids.add(atom_id)
        source_id = atom.get("source_document_id")
        if source_id not in EXPECTED_SOURCE_IDS:
            fail(errors, f"{atom_id} source document不正")
            continue
        if atom.get("source_path") != EXPECTED_PATHS[source_id]:
            fail(errors, f"{atom_id} source path不一致")
        original_id = atom.get("original_id")
        if isinstance(original_id, str) and original_id in EXPECTED_ORIGINAL_IDS:
            original_ids.add(original_id)
            expected_prefix = "acceptance" if original_id.startswith(("GH-AC-", "GH-T-")) else "constraint" if original_id.startswith("GH-NFR-") else "requirement"
            if atom.get("candidate_kind") != expected_prefix:
                fail(errors, f"{atom_id} {original_id} candidate_kind不一致")
            if original_id not in atom.get("source_span", {}).get("exact_source_text", ""):
                fail(errors, f"{atom_id} original IDのsource groundingがない")
        elif isinstance(original_id, str) and original_id.startswith("DOC-"):
            metadata_ids.add(original_id)
            if atom.get("candidate_kind") not in {"metadata", "constraint"}:
                fail(errors, f"{atom_id} metadata candidate_kind不正")
        else:
            fail(errors, f"{atom_id} original_id不正")
        if original_id in EXPECTED_TARGET_BY_ORIGINAL_ID and atom.get("candidate_target") != EXPECTED_TARGET_BY_ORIGINAL_ID[original_id]:
            fail(errors, f"{atom_id} candidate_targetが固定owner境界と不一致: expected={EXPECTED_TARGET_BY_ORIGINAL_ID[original_id]} actual={atom.get('candidate_target')}")
        if atom.get("source_revision") != source_commit:
            fail(errors, f"{atom_id} source_revision不一致")
        if atom.get("candidate_target") not in {"HELIX-HARNESS", "HELIX-OS", "HELIX-Web", "HELIX-Web-OS", "unresolved"}:
            fail(errors, f"{atom_id} candidate_target不正")
        if not isinstance(atom.get("owner_candidates"), list) or not atom.get("owner_candidates"):
            fail(errors, f"{atom_id} owner_candidates欠落")
        if atom.get("candidate_target") != "unresolved" and atom.get("candidate_target") not in atom.get("owner_candidates", []):
            fail(errors, f"{atom_id} candidate_targetがowner_candidatesにない")
        normalized_statement = atom.get("normalized_statement")
        if not normalized_statement or not atom.get("questions"):
            fail(errors, f"{atom_id} review questionまたはnormalized statement欠落")
        if isinstance(normalized_statement, str) and re.fullmatch(r"acceptance (?:condition|fixture) GH-(?:AC|T)-\d{3}", normalized_statement):
            fail(errors, f"{atom_id} normalized_statementがplaceholder")
        if original_id in EXPECTED_NORMALIZED_STATEMENTS and normalized_statement != EXPECTED_NORMALIZED_STATEMENTS[original_id]:
            fail(errors, f"{atom_id} normalized_statementが固定候補要約と不一致")
        if original_id in EXPECTED_SUMMARY_SOURCE_ANCHORS:
            source_text = atom.get("source_span", {}).get("exact_source_text", "")
            for anchor in EXPECTED_SUMMARY_SOURCE_ANCHORS[original_id]:
                if anchor not in source_text:
                    fail(errors, f"{atom_id} normalized_statementのsource grounding不足: {anchor}")
        if original_id in EXPECTED_UNRESOLVED_ATOM_LINKS:
            unresolved_id = EXPECTED_UNRESOLVED_ATOM_LINKS[original_id]
            if atom.get("unresolved_decision_ids") != [unresolved_id]:
                fail(errors, f"{atom_id} unresolved_decision_idsが未定義または不一致")
            if not any(unresolved_id in str(value) for value in atom.get("possible_conflicts", [])):
                fail(errors, f"{atom_id} possible_conflictsが{unresolved_id}へ紐付いていない")
            if not any(unresolved_id in str(value) for value in atom.get("questions", [])):
                fail(errors, f"{atom_id} questionsが{unresolved_id}へ紐付いていない")
        if atom.get("legacy_status_ref") not in EXPECTED_SOURCE_IDS or atom.get("legacy_status_unconfirmed") is not True:
            fail(errors, f"{atom_id} legacy status未確認境界がない")
        legacy_snapshot = atom.get("legacy_state", {})
        status_snapshot = legacy_status_by_doc.get(atom.get("legacy_status_ref"), {})
        asset_snapshot = status_snapshot.get("asset_ledger", {})
        phase_snapshot = status_snapshot.get("phase_product_bootstrap", {})
        expected_legacy_snapshot = {
            "phase_candidates": phase_snapshot.get("candidate_phase_targets"),
            "phase_status": phase_snapshot.get("phase_classification_status"),
            "implementation_status": asset_snapshot.get("implementation_status"),
            "implementation_evidence_state": phase_snapshot.get("implementation_evidence_state"),
            "legacy_implementation_status": phase_snapshot.get("legacy_implementation_status"),
            "consumer_status": phase_snapshot.get("consumer_closure_status"),
            "consumer_refs": asset_snapshot.get("consumer_refs"),
            "unconfirmed": True,
        }
        if legacy_snapshot != expected_legacy_snapshot:
            fail(errors, f"{atom_id} phase／implementation／consumer snapshot不一致")
        for ref_id in atom.get("reference_edge_ids", []):
            if ref_id not in EXPECTED_REFERENCE_IDS:
                fail(errors, f"{atom_id} unknown reference edge: {ref_id}")
        span = atom.get("source_span")
        if not isinstance(span, dict):
            fail(errors, f"{atom_id} source_span欠落")
            continue
        blob = source_blobs.get(source_id)
        if blob is not None:
            check_span(errors, atom_id, blob, span)
    if original_ids != EXPECTED_ORIGINAL_IDS:
        fail(errors, f"原ID集合不一致: missing={sorted(EXPECTED_ORIGINAL_IDS-original_ids)} extra={sorted(original_ids-EXPECTED_ORIGINAL_IDS)}")
    if metadata_ids != {"DOC-003-METADATA", "DOC-003-OBJECTS", "DOC-003-UT-FREEZE", "DOC-028-METADATA", "DOC-028-EVIDENCE"}:
        fail(errors, f"metadata atom集合不一致: {sorted(metadata_ids)}")
    if len(atom_ids) != EXPECTED_SEMANTIC_COUNT:
        fail(errors, "semantic atom ID件数不一致")

    atomization = candidate.get("semantic_atomization", {})
    if atomization.get("semantic_atom_count") != EXPECTED_SEMANTIC_COUNT or atomization.get("coverage_span_count") != 14:
        fail(errors, "semantic_atomization count不一致")
    if atomization.get("source_lines_total") != 244 or atomization.get("coverage_and_semantics_are_separate") is not True:
        fail(errors, "semantic_atomization coverage boundary不一致")
    mixed_ids = set(atomization.get("mixed_owner_ids", []))
    for atom in atoms:
        if not isinstance(atom, dict) or atom.get("original_id") not in mixed_ids:
            continue
        if atom.get("candidate_target") != "unresolved" or not {"HELIX-HARNESS", "HELIX-OS"} <= set(atom.get("owner_candidates", [])):
            fail(errors, f"{atom.get('original_id')} mixed ownerをunresolved候補として保持していない")

    linkage = candidate.get("reference_edge_linkage")
    if not isinstance(linkage, dict) or set(linkage) != EXPECTED_REFERENCE_IDS:
        fail(errors, "reference_edge_linkageのedge集合不一致")
    else:
        for ref_id, linked_atoms in linkage.items():
            actual_linked = set(linked_atoms) if isinstance(linked_atoms, list) else set()
            if actual_linked != EXPECTED_REFERENCE_LINKAGE[ref_id]:
                fail(errors, f"{ref_id} linkage atom集合不一致")
            if not actual_linked <= atom_ids:
                fail(errors, f"{ref_id} linkage atomが未知")
        inverse_linkage = {ref_id: set() for ref_id in EXPECTED_REFERENCE_IDS}
        for atom in atoms:
            if not isinstance(atom, dict):
                continue
            atom_id = atom.get("semantic_atom_id")
            for ref_id in atom.get("reference_edge_ids", []):
                if ref_id in inverse_linkage:
                    inverse_linkage[ref_id].add(atom_id)
        if inverse_linkage != EXPECTED_REFERENCE_LINKAGE:
            fail(errors, f"atomからedgeへの逆向きlinkage不一致: {inverse_linkage}")

    if candidate.get("negative_conditions") and not isinstance(candidate["negative_conditions"], list):
        fail(errors, "negative_conditionsはlist")
    negative_ids = set()
    for negative in candidate.get("negative_conditions", []):
        if not isinstance(negative, dict):
            fail(errors, "negative conditionがobjectではない")
            continue
        negative_ids.add(negative.get("negative_id"))
        if not negative.get("condition"):
            fail(errors, f"negative conditionが空: {negative.get('negative_id')}")
        if not set(negative.get("source_atom_ids", [])) <= atom_ids:
            fail(errors, f"negativeが未知atomを参照: {negative.get('negative_id')}")
    if negative_ids != EXPECTED_NEGATIVE_IDS:
        fail(errors, f"negative ID集合不一致: {negative_ids}")

    product_sources = candidate.get("product_boundary", {}).get("sources", [])
    actual_product_sources = {
        (item.get("path"), item.get("sha256")) for item in product_sources if isinstance(item, dict)
    }
    if actual_product_sources != EXPECTED_PRODUCT_SOURCES:
        fail(errors, f"product boundary source集合不一致: {actual_product_sources}")
    for product_source in product_sources:
        path = ROOT / product_source.get("path", "")
        if not path.is_file() or digest(path) != product_source.get("sha256"):
            fail(errors, f"product boundary source digest不一致: {product_source.get('path')}")

    if errors:
        print("FAIL: DELEGATED-DOC-003/028 + REF-0303/0759/0760 atom candidate")
        for error in errors:
            print(f"- {error}")
        return 1
    print("PASS: DELEGATED-DOC-003/028 + REF-0303/0759/0760 atom candidate")
    owner_counts = {owner: sum(1 for atom in atoms if atom.get("candidate_target") == owner) for owner in ("HELIX-HARNESS", "HELIX-OS", "unresolved")}
    print(f"documents=2; references=3; coverage_spans=14; semantic_atoms=59; source_lines=244; negative_conditions=7")
    print(f"candidate_target_counts={owner_counts}; original_ids=GH-FR:17/GH-NFR:8/GH-AC:13/GH-T:16")
    print("authority_effect=none; atomization=unresolved; legacy_runtime_test_ci=forbidden")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

#!/usr/bin/env python3
"""旧要求unit×assetのdirect semantic review wave 1を独立検証する。"""
from __future__ import annotations

import hashlib
import json
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[3]
GOV = ROOT / "docs/governance"
LEDGER = GOV / "legacy-requirement-direct-semantic-review-wave1.jsonl"
META = GOV / "legacy-requirement-direct-semantic-review-wave1.meta.json"
CROSSWALK = GOV / "legacy-requirement-implementation-crosswalk-bootstrap.jsonl"
CATALOG = GOV / "legacy-asset-phase-product-classification-bootstrap.jsonl"
MANIFEST = ROOT / "archive/legacy-generation-2026-09-14/MANIFEST.sha256"
ARCHIVE_PREFIX = "archive/legacy-generation-2026-09-14/root/"
EXPECTED_UNITS = {
    "IRUNIT-HIL-BR-01-HELIX-HARNESS",
    "IRUNIT-HIL-FR-12-HELIX-OS",
}
EXPECTED_EDGES = {
    ("IRUNIT-HIL-BR-01-HELIX-HARNESS", "LEGACY-ASSET-02319C2481B9E01698D5"),
    ("IRUNIT-HIL-BR-01-HELIX-HARNESS", "LEGACY-ASSET-D6339A02201B20481C3F"),
    ("IRUNIT-HIL-BR-01-HELIX-HARNESS", "LEGACY-ASSET-F17ABDB90E1340D09746"),
    ("IRUNIT-HIL-FR-12-HELIX-OS", "LEGACY-ASSET-447711D94AA87E82F544"),
    ("IRUNIT-HIL-FR-12-HELIX-OS", "LEGACY-ASSET-7B8261E520354DF48FD0"),
    ("IRUNIT-HIL-FR-12-HELIX-OS", "LEGACY-ASSET-8EB0EDD06A4197FD3532"),
}

EXPECTED_DECISIONS = {
    ("IRUNIT-HIL-BR-01-HELIX-HARNESS", "LEGACY-ASSET-02319C2481B9E01698D5"): ("confirmed", "direct_requirement_contract_not_implementation", ("人のL3承認後", "不可逆境界以外を無人完走する")),
    ("IRUNIT-HIL-BR-01-HELIX-HARNESS", "LEGACY-ASSET-D6339A02201B20481C3F"): ("rejected", "canonical_shadow_promotion_not_br01_execution_contract", ()),
    ("IRUNIT-HIL-BR-01-HELIX-HARNESS", "LEGACY-ASSET-F17ABDB90E1340D09746"): ("unresolved", "human_l3_gate_partial_but_product_boundary_unresolved", ("人のL3承認後",)),
    ("IRUNIT-HIL-FR-12-HELIX-OS", "LEGACY-ASSET-7B8261E520354DF48FD0"): ("confirmed", "direct_partial_drift_report_only", ("手編集drift",)),
    ("IRUNIT-HIL-FR-12-HELIX-OS", "LEGACY-ASSET-8EB0EDD06A4197FD3532"): ("confirmed", "direct_partial_agent_and_model_effort_guard", ("未登録agent", "model/effort override", "fail-closeする")),
    ("IRUNIT-HIL-FR-12-HELIX-OS", "LEGACY-ASSET-447711D94AA87E82F544"): ("unresolved", "context_packet_and_path_boundary_without_access_enforcement", ("forbidden path",)),
}


def require(ok: bool, message: str) -> None:
    if not ok:
        raise ValueError(message)


def load_jsonl(path: Path) -> list[dict]:
    return [json.loads(line) for line in path.read_text().splitlines() if line.strip()]


def digest_bytes(data: bytes) -> str:
    return "sha256:" + hashlib.sha256(data).hexdigest()


def digest_file(path: Path) -> str:
    return digest_bytes(path.read_bytes())


def canonical_digest(value: object) -> str:
    data = json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()
    return digest_bytes(data)


def manifest_entries() -> dict[str, str]:
    result: dict[str, str] = {}
    for line in MANIFEST.read_text().splitlines():
        if not line.strip():
            continue
        digest, path = line.split("  ", 1)
        result[path] = digest
    return result


def git_blob(parent: str, path: str) -> bytes:
    return subprocess.run(
        ["git", "show", f"{parent}:{path}"], cwd=ROOT, check=True, capture_output=True
    ).stdout


def main() -> None:
    records = load_jsonl(LEDGER)
    meta = json.loads(META.read_text())
    crosswalk = {row["unit_candidate_id"]: row for row in load_jsonl(CROSSWALK)}
    catalog = {row["asset_id"]: row for row in load_jsonl(CATALOG)}
    manifest = manifest_entries()

    require(meta["status"] == "research_premise_candidate", "batch statusがresearch premiseでない")
    require(meta["authority_effect"] == "none", "batchがauthorityを生成")
    require(meta["legacy_execution_performed"] is False, "旧資産実行を記録")
    require(meta["new_build_allowed"] is False, "new buildを許可")
    require(meta["consumer_closure_status"] == "pending", "consumer closureを過大主張")
    require(len(records) == meta["record_count"] == 6, "review record数不一致")
    require(digest_file(LEDGER) == meta["output_sha256"], "ledger digest不一致")

    expected_inputs = {
        str(CROSSWALK.relative_to(ROOT)): digest_file(CROSSWALK),
        str(CATALOG.relative_to(ROOT)): digest_file(CATALOG),
        str(MANIFEST.relative_to(ROOT)): digest_file(MANIFEST),
    }
    require(meta["inputs"] == expected_inputs, "入力digest不一致")
    for path, digest in expected_inputs.items():
        require(digest_bytes(git_blob(meta["parent_revision"], path)) == digest, f"親revision入力不一致: {path}")

    edges = {(row["unit_candidate_id"], row["asset_id"]) for row in records}
    require(edges == EXPECTED_EDGES, "review edge exact set不一致")
    require(len(edges) == len(records), "review edge重複")
    require(set(meta["reviewed_unit_ids"]) == EXPECTED_UNITS, "review unit exact set不一致")
    require(
        {(row["unit_candidate_id"], row["asset_id"]) for row in meta["reviewed_edges"]} == EXPECTED_EDGES,
        "meta review edge exact set不一致",
    )

    for row in records:
        review_id = row["review_id"]
        require(row["schema_revision"] == 1, f"schema revision不一致: {review_id}")
        require(row["authority_effect"] == "none", f"authority生成: {review_id}")
        require(row["review_scope"] == "unit_asset_edge", f"review scope不一致: {review_id}")
        require(row["phase_authority_status"] == "candidate_unchanged", f"phaseを承認へ昇格: {review_id}")
        require(row["candidate_membership_semantics"] == "search_candidate_only_not_semantic_evidence", f"候補poolを意味証拠化: {review_id}")
        require(row["legacy_execution_status"] == "not_run", f"旧資産実行claim: {review_id}")
        require(row["current_requirement_implementation_status"] == "not_established", f"現行実装成立を過大主張: {review_id}")
        require(row["consumer_closure_status"] == "pending" and not row["consumer_closure_evidence"], f"consumer closureを生成: {review_id}")
        require(row["new_build_allowed"] is False, f"new buildを許可: {review_id}")
        require(row["semantic_link_status"] in {"confirmed", "rejected", "unresolved"}, f"未知のsemantic status: {review_id}")
        expected_decision = EXPECTED_DECISIONS[(row["unit_candidate_id"], row["asset_id"])]
        require((row["semantic_link_status"], row["semantic_relation"], tuple(row["covered_requirement_atoms"])) == expected_decision, f"review decision exact set不一致: {review_id}")

        unit = crosswalk.get(row["unit_candidate_id"])
        require(unit is not None, f"crosswalk unit欠落: {review_id}")
        for key in ("source_requirement_id", "source_statement_semantic_digest", "source_text_spans", "product_scope"):
            require(row[key] == unit[key], f"unit source不一致 {key}: {review_id}")
        require(row["phase_candidates"] == unit["direct_phase_candidates"], f"phase候補不一致: {review_id}")
        require(row["asset_id"] in unit["candidate_asset_pool"]["phase_candidate_asset_ids"], f"対象assetが対象unit phase pool外: {review_id}")

        asset = catalog.get(row["asset_id"])
        require(asset is not None, f"catalog asset欠落: {review_id}")
        mapping = {
            "classification_id": "classification_id",
            "source_path": "source_path",
            "source_sha256": "source_sha256",
            "artifact_evidence_kind": "artifact_evidence_kind",
            "legacy_asset_evidence_state": "implementation_evidence_state",
            "catalog_legacy_implementation_status": "legacy_implementation_status",
            "candidate_phase_targets": "candidate_phase_targets",
            "candidate_product_targets": "candidate_product_targets",
            "observed_consumer_refs": "consumer_refs",
        }
        for output_key, input_key in mapping.items():
            require(row[output_key] == asset[input_key], f"asset catalog不一致 {output_key}: {review_id}")
        archive_path = ROOT / ARCHIVE_PREFIX / row["source_path"]
        require(archive_path.is_file(), f"archive source欠落: {review_id}")
        actual_sha = hashlib.sha256(archive_path.read_bytes()).hexdigest()
        require(actual_sha == row["source_sha256"], f"archive source digest不一致: {review_id}")
        require(manifest.get(row["source_path"]) == actual_sha, f"archive manifest不一致: {review_id}")

        if row["semantic_link_status"] == "confirmed":
            require(row["covered_requirement_atoms"], f"confirmedにcovered atomなし: {review_id}")
            require(row["evidence_refs"], f"confirmedにsource evidenceなし: {review_id}")
        if row["semantic_link_status"] == "rejected":
            require(not row["covered_requirement_atoms"], f"rejectedにcovered atomあり: {review_id}")
            require(row["counterevidence"], f"rejectedに反証なし: {review_id}")
        for atom in row["covered_requirement_atoms"]:
            require(any(atom in span for span in row["source_text_spans"]), f"covered atomが要求原文外: {review_id}: {atom}")
        for evidence in row["evidence_refs"]:
            require(evidence["archive_path"] == ARCHIVE_PREFIX + row["source_path"], f"evidence sourceずれ: {review_id}")
            lines = (ROOT / evidence["archive_path"]).read_text().splitlines()
            start, end = evidence["line_start"], evidence["line_end"]
            require(1 <= start <= end <= len(lines), f"evidence line範囲不正: {review_id}")
            excerpt = ("\n".join(lines[start - 1 : end]) + "\n").encode()
            require(digest_bytes(excerpt) == evidence["excerpt_sha256"], f"evidence excerpt digest不一致: {review_id}")

        if row["legacy_requirement_implementation_contribution"] == "partial_static_implementation_evidence_unexecuted":
            require(row["artifact_evidence_kind"] == "implementation_source", f"source以外から実装証拠生成: {review_id}")
            require(row["semantic_link_status"] == "confirmed", f"未確定edgeから実装証拠生成: {review_id}")
        require("implemented" not in row["current_requirement_implementation_status"], f"current implemented claim: {review_id}")

    status_counts = {name: sum(row["semantic_link_status"] == name for row in records) for name in ("confirmed", "rejected", "unresolved")}
    require(meta["semantic_link_counts"] == status_counts == {"confirmed": 3, "rejected": 1, "unresolved": 2}, "semantic status集計不一致")

    for unit_id in EXPECTED_UNITS:
        reviewed = {asset_id for uid, asset_id in edges if uid == unit_id}
        remaining = sorted(set(crosswalk[unit_id]["candidate_asset_pool"]["phase_candidate_asset_ids"]) - reviewed)
        receipt = meta["unreviewed_candidate_edges"][unit_id]
        require(receipt["source_pool"] == "phase_candidate_asset_ids", f"unreviewed pool不一致: {unit_id}")
        require(receipt["count"] == len(remaining), f"unreviewed count不一致: {unit_id}")
        require(receipt["asset_ids_sha256"] == canonical_digest(remaining), f"unreviewed exact set digest不一致: {unit_id}")

    aggregates = {row["unit_candidate_id"]: row for row in meta["unit_aggregates"]}
    require(set(aggregates) == EXPECTED_UNITS, "unit aggregate exact set不一致")
    harness = aggregates["IRUNIT-HIL-BR-01-HELIX-HARNESS"]
    os_unit = aggregates["IRUNIT-HIL-FR-12-HELIX-OS"]
    require(harness["direct_confirmed_implementation_asset_ids"] == [], "HARNESS contract文書を実装asset化")
    require(harness["legacy_requirement_implementation_status"].startswith("unknown_"), "HARNESS旧実装状態を過大主張")
    require(os_unit["legacy_requirement_implementation_status"] == "partial_static_implementation_evidence_unexecuted", "OS旧実装部分証拠の集計不一致")
    direct_os = sorted(row["asset_id"] for row in records if row["unit_candidate_id"] == os_unit["unit_candidate_id"] and row["semantic_link_status"] == "confirmed" and row["artifact_evidence_kind"] == "implementation_source")
    require(os_unit["direct_confirmed_implementation_asset_ids"] == direct_os, "OS direct implementation evidence集計不一致")
    for aggregate in aggregates.values():
        require(aggregate["current_requirement_implementation_status"] == "not_established", "aggregate current実装過大主張")
        require(aggregate["consumer_closure_status"] == "pending", "aggregate consumer closure過大主張")
        require(aggregate["phase_authority_status"] == "candidate_unchanged", "aggregate phase authority生成")
        require(aggregate["new_build_allowed"] is False, "aggregate new build許可")
        require("implemented" not in aggregate["legacy_requirement_implementation_status"], "legacy implemented claimを禁止")

    print("legacy requirement direct semantic review wave1: 6 edges / 2 product units verified")


if __name__ == "__main__":
    main()

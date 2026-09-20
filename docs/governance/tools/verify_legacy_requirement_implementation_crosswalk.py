#!/usr/bin/env python3
"""要求unitとphase・旧asset候補crosswalkの静的一致を検証する。"""

from __future__ import annotations

import hashlib
import json
from pathlib import Path
import sys


ROOT = Path(__file__).resolve().parents[3]
TOOLS = Path(__file__).resolve().parent
sys.path.insert(0, str(TOOLS))
import build_legacy_requirement_implementation_crosswalk as builder  # noqa: E402


def require(condition: bool, message: str) -> None:
    if not condition:
        raise ValueError(message)


def main() -> None:
    actual = builder.load_jsonl(builder.OUTPUT_PATH)
    expected = builder.build_records()
    asset_catalog = [json.loads(line) for line in builder.ASSET_PATH.read_text().splitlines() if line.strip()]
    require(actual == expected, "crosswalkがsource inputsからの再導出結果と不一致")
    require(len(actual) == 218, "unit exact setが218件ではない")
    require(len({record["crosswalk_id"] for record in actual}) == 218, "crosswalk ID重複")
    require(len({record["unit_candidate_id"] for record in actual}) == 218, "unit ID欠落・重複")
    require(all(record["authority_effect"] == "none" for record in actual), "authority生成")
    require(all(not record["legacy_execution_performed"] for record in actual), "旧asset実行を記録")
    require(all(not record["new_build_allowed"] for record in actual), "new buildを許可")
    require(all(not record["direct_legacy_asset_links"] for record in actual), "意味review前に直接asset linkを生成")
    require(all(record["legacy_requirement_implementation_status"] == "unknown_pending_direct_asset_semantic_review" for record in actual), "要求実装状態を過大主張")
    require(all(record["current_requirement_implementation_status"] == "not_established" for record in actual), "現行実装成立を過大主張")
    require(all(record["consumer_closure_status"] == "pending" for record in actual), "consumer closureを過大主張")
    require(sum(bool(record["direct_phase_candidates"]) for record in actual) == 188, "phase候補あり件数不一致")
    require(sum(not record["direct_phase_candidates"] for record in actual) == 30, "phase未解決件数不一致")
    for record in actual:
        require(
            [item["phase_id"] for item in record["phase_capability_evidence"]]
            == record["direct_phase_candidates"],
            f"phase evidence不一致: {record['unit_candidate_id']}",
        )
        for evidence in record["phase_capability_evidence"]:
            require(evidence["status_scope"] == "phase_capability", "phase状態scope不一致")
            require(evidence["phase_id"] in evidence["source_phase_rationale"], "phase rationale対応不一致")
            if evidence["evidence_trace_status"] != "unresolved_no_exact_source_span":
                require(bool(evidence["evidence_spans"]), "trace済みphaseに根拠spanなし")
                require(all(any(span in source for source in record["source_text_spans"]) for span in evidence["evidence_spans"]), "phase根拠spanがunit原文外")
                require(all(f"「{span}」" in evidence["source_phase_rationale"] for span in evidence["evidence_spans"]), "phase根拠spanがrationale引用外")
                require(evidence["evidence_spans"] == [item["text"] for item in evidence["evidence_span_matches"]], "phase根拠spanとmatch detail不一致")
                kinds = {item["match_kind"] for item in evidence["evidence_span_matches"]}
                expected_status = (
                    "exact_source_span_element_traced" if kinds == {"exact_source_span_element"}
                    else "source_substring_quote_traced" if kinds == {"source_span_substring"}
                    else "mixed_exact_and_substring_quote_traced"
                )
                require(evidence["evidence_trace_status"] == expected_status, "phase根拠spanの一致種別不正")
                for item in evidence["evidence_span_matches"]:
                    if item["match_kind"] == "exact_source_span_element":
                        require(item["text"] in record["source_text_spans"], "exact element一致でないphase根拠")
                    else:
                        require(item["match_kind"] == "source_span_substring", "未知のphase根拠一致種別")
                        require(item["text"] not in record["source_text_spans"], "完全一致をsubstring扱い")
            else:
                require(not evidence["evidence_spans"], "unresolved phaseに根拠spanあり")
                require(not evidence["evidence_span_matches"], "unresolved phaseにmatch detailあり")
        require(record["status_scope"]["legacy_requirement_implementation_status"] == "requirement_unit", "要求実装状態scope不一致")
        require(record["status_scope"]["candidate_asset_pool"] == "search_candidate_pool", "候補pool scope不一致")
        representative_ids = [asset["asset_id"] for asset in record["representative_legacy_assets"]]
        require(representative_ids == sorted(set(representative_ids)), f"代表asset重複: {record['unit_candidate_id']}")
        require(all(asset["direct_requirement_semantic_link"] is False for asset in record["representative_legacy_assets"]), "phase代表assetを要求直接linkへ昇格")
        require(all(asset["archive_manifest_digest_match"] is True for asset in record["representative_legacy_assets"]), "phase代表assetのarchive digest不一致")
        require(all(asset["normalized_requirement_implementation_state"] == "unknown" for asset in record["representative_legacy_assets"]), "phase代表assetから要求実装状態を生成")
        require(all(asset["semantic_review_state"] == "direct_requirement_link_pending" for asset in record["representative_legacy_assets"]), "phase代表assetの意味review状態不一致")
        pool = record["candidate_asset_pool"]
        require(pool["membership_semantics"] == "search_candidate_only_not_direct_semantic_link", "候補poolの意味境界不一致")
        require(
            pool["phase_candidate_asset_ids"] == sorted(set(pool["phase_candidate_asset_ids"])),
            f"phase候補asset ID重複: {record['unit_candidate_id']}",
        )
        require(
            pool["phase_and_product_candidate_asset_ids"]
            == sorted(set(pool["phase_and_product_candidate_asset_ids"])),
            f"製品候補asset ID重複: {record['unit_candidate_id']}",
        )
        require(len(pool["phase_candidate_asset_ids"]) == pool["phase_candidate_asset_count"], "phase候補asset件数不一致")
        require(len(pool["phase_and_product_candidate_asset_ids"]) == pool["phase_and_product_candidate_asset_count"], "製品候補asset件数不一致")
        require(set(pool["phase_and_product_candidate_asset_ids"]) <= set(pool["phase_candidate_asset_ids"]), "製品候補poolがphase候補pool外")
        independently_derived_phase_ids = sorted(
            asset["asset_id"]
            for asset in asset_catalog
            if set(asset["candidate_phase_targets"]) & set(record["direct_phase_candidates"])
        )
        independently_derived_product_ids = sorted(
            asset["asset_id"]
            for asset in asset_catalog
            if set(asset["candidate_phase_targets"]) & set(record["direct_phase_candidates"])
            and set(asset["candidate_product_targets"]) & set(record["product_scope"])
        )
        require(pool["phase_candidate_asset_ids"] == independently_derived_phase_ids, f"phase候補pool独立再計算不一致: {record['unit_candidate_id']}")
        require(pool["phase_and_product_candidate_asset_ids"] == independently_derived_product_ids, f"製品候補pool独立再計算不一致: {record['unit_candidate_id']}")

    output_bytes = builder.OUTPUT_PATH.read_bytes()
    actual_meta = json.loads(builder.META_PATH.read_text())
    expected_meta = builder.build_meta(expected)
    expected_meta["output_sha256"] = "sha256:" + hashlib.sha256(output_bytes).hexdigest()
    require(actual_meta == expected_meta, "metadataが再導出結果と不一致")
    require(actual_meta["all_phase_representative_legacy_asset_count"] == 84, "全phase代表asset件数不一致")
    require(len(actual_meta["unreferenced_phase_representative_assets"]) == 6, "未接続phase代表asset件数不一致")
    require(
        {phase for asset in actual_meta["unreferenced_phase_representative_assets"] for phase in asset["phase_ids"]}
        == {"PHCAP-15", "PHCAP-17"},
        "未接続phase代表assetのphase集合不一致",
    )
    require(sum(actual_meta["phase_evidence_trace_counts"].values()) == actual_meta["unit_phase_link_count"], "phase trace集計不一致")
    require(len(actual_meta["direct_phase_unresolved_review_queue"]) == 30, "phase未解決queue件数不一致")
    require(len(actual_meta["phase_evidence_trace_review_queue"]) == actual_meta["units_with_untraced_phase_candidate_count"], "phase根拠trace queue件数不一致")
    print(
        "ok records=218 phase_linked=188 phase_unresolved=30 "
        f"unit_phase_links={actual_meta['unit_phase_link_count']} "
        f"representative_assets={actual_meta['unique_representative_legacy_asset_count']}"
    )


if __name__ == "__main__":
    try:
        main()
    except (ValueError, KeyError, TypeError, json.JSONDecodeError) as error:
        raise SystemExit("verify failed: " + str(error))

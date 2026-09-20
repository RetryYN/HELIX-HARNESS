---
title: "製品要求unit・旧HELIX実装証拠crosswalk方法"
status: research_method
authority_effect: none
source_revision: legacy-generation-2026-09-14
---

# 製品要求unit・旧HELIX実装証拠crosswalk方法

## 目的

製品別に分けた218件の要求unit候補を、20件のPhase Capability Inventoryと旧asset分類へ接続する。新規設計の前に読むべき旧HELIXの代表asset、旧到達層、現行縮退、phase上の不足を要求unit単位で検索可能にする。

このcrosswalkは要求とassetの意味的一致、旧実装の稼働、現行への適合、再利用許可を確定しない。旧runtime、CI、test、hook、adapterは実行しない。

## 入力

- `legacy-ir-product-unit-decomposition-bootstrap.jsonl`: 217 product unit候補と1 connection候補、直接phase候補。
- `phase-capability-inventory.json`: phaseごとの現行状態、旧到達層、旧能力状態、transition assessment、代表asset。
- `legacy-asset-phase-product-classification-bootstrap.jsonl`: 旧asset 4,020件のphase／製品候補と静的存在状態。

三入力のdigestをmetadataへ固定し、出力218件を要求unitのexact setとして再導出する。

## 接続規則

1. unitの`direct_phase_candidates`だけをPhase Capability Inventoryへ接続する。一般語やasset pathから新しいphaseを追加しない。各phaseのrationaleを個別entryへ分け、引用文字列がunitの逐語`source_text_spans`に存在する場合だけ`exact_source_quote_traced`とする。逐語引用がない候補は`unresolved_no_exact_source_span`としてreview queueへ残す。
2. phaseの`current.status`、`legacy.capability_status`、`transition_assessment`、`gaps`は改名・要約せず転記する。
3. phaseの代表assetは`representative_legacy_assets`へ置き、asset ID、path、source digest、artifact kind、静的存在状態、観測済みconsumer、closure状態を保持する。ただし`direct_requirement_semantic_link: false`と要求実装状態`unknown`を固定し、phase代表であることから要求への直接対応を生成しない。
4. 4,020件の候補台帳から、phase集合との交差asset ID集合と、さらに製品候補との交差asset ID集合を記録する。各IDの詳細はmetadataでdigestを固定したasset catalog参照と正規化joinして再読する。unitごとに同じasset metadataを複製しない。製品候補は直接根拠未確認のlow confidenceであるため、候補pool membershipを直接意味linkとして扱わない。
5. 直接phaseがない30 unitは`unavailable_direct_phase_unresolved`とし、語彙類似だけで旧assetを結ばない。30 unitのID、製品scope、原文spanをmetadataのreview queueへ保持する。
6. 全unitで`direct_legacy_asset_links: []`、`legacy_requirement_implementation_status: unknown_pending_direct_asset_semantic_review`、`current_requirement_implementation_status: not_established`を維持する。
7. consumer closure、successor、人間による製品境界判断が終わるまで`new_build_allowed: false`とする。

## 状態の読み方

`legacy_capability_status`はphase能力に実装source、test、workflow、文書が静的に存在したことを表す。要求unit自体が実装済みだったという判定ではない。旧testのpassや運用成立も表さない。

`transition_assessment`は旧phase能力と現行phase状態の差である。`not_reimplemented_formally`や`degraded_*`は、要求unitがそのphase候補を持つため参照されるが、要求unit固有の欠落を証明しない。

`implementation_evidence_state`はarchive manifestと一致するbytesの種類と未実行状態を示す。`implementation_source_present_unexecuted`や`test_source_present_unexecuted`から`implemented`、`tested`、`operational`を生成しない。

## 後続の意味review

各unitについて次の順で閉じる。

1. phase候補を人間decision対象revisionへ固定する。
2. phase代表assetとphase候補poolから、unitの原文義務に一致するassetを全文で読む。
3. assetのsource、判断史、failure、consumerを確認し、保持する契約と現行差分を記録する。
4. direct link、非該当理由、consumer closure、実装状態を独立reviewする。
5. 既存能力で満たせない承認済み差分だけを新規設計候補へ送る。

## 静的検証

検証scriptは218 unitのexact set、入力からの完全再導出、321 unit-phase候補link、phase別の逐語根拠、候補asset ID集合、phase／asset参照、状態転記、metadata集計、出力digestを確認する。Phase Capability Inventoryの代表asset全84件と、要求unit側に対応phaseがないため未接続となるassetもexact setで検査する。また、直接意味review前のasset link、要求実装済み、consumer closure、new build許可が生成されていないことを確認する。

この検証は意味的一致、旧実装の動作、現行適合、人間承認を証明しない。

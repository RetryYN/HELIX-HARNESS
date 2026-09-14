---
title: "UI Domain・Pattern Profile L7単体テスト設計（L6 pair）"
layer: L6
sub_doc: unit-test-design
artifact_type: test_design
executed_at_layer: L7
kind: add-design
status: draft
created: 2026-08-08
updated: 2026-08-08
owner: QA
pair_artifact: docs/design/helix/L6-function-design/ui-domain-pattern-profile.md
github_issue_id: 209
---

# UI Domain・Pattern Profile L7単体テスト設計（L6 pair）

L6機能設計 §0-§2 の型・signature・DbC を正本とする。実装スライス起票時に L8 で具体化する
（test citation は実装 PLAN が確定する）。

| U-ID | 対象 | 反例と期待結果 |
|---|---|---|
| U-UDP-001 | `canonicalizeUiDomain` | kind 別 prefix regex 逸脱・class 名/file path/DOM selector 主キーを `UDP_ID_INVALID` で拒否。順序違い同義入力は同 semantic_digest、完全重複は dedup。schema_version 不一致・`authority=stale|retired` の canonical 渡しは `UDP_STALE_INPUT`（全 pure API 共通の入口検査） |
| U-UDP-002 | `validatePatternContract` | required/forbidden の同一対象競合は `UDP_CONTRACT_CONFLICT`、対象 entity 非実在は fail-close、競合なし contract は判定基盤（required/forbidden 索引）を返す。schema_version 不一致・stale/retired 入力は `UDP_STALE_INPUT`（共通入口検査） |
| U-UDP-003 | `guardRulePackIsolation` | 共通 Rule Pack への product namespace 値（profile_id 参照・brand token 実値・product 文言）混入を `UDP_PRODUCT_VALUE_IN_COMMON_PACK` で全列挙 fail-close。profile→共通 pack 参照（順方向）は green。schema_version 不一致・stale/retired 入力は `UDP_STALE_INPUT` |
| U-UDP-004 | `validateUiProfile` | information_priority / 許容集合 / responsive 宣言 / motion budget + reduced-motion 代替 / a11y / brand / surface 分類のいずれの欠落も `UDP_PROFILE_INCOMPLETE` で欠落 field 全列挙。schema_version 不一致は `UDP_STALE_INPUT` |
| U-UDP-005 | `selectPairwiseFixtures` | 全 2 軸ペア被覆 100%・high risk entry 全件包含（部分指定 entry は指定軸 seed 固定 + 残余軸 pairwise 補完、Cartesian 展開なし）・決定的順序（同一入力→同一 selection_digest）。全積要求=`UDP_CARTESIAN_EXPLOSION`、被覆欠落=`UDP_PAIRWISE_UNCOVERED`、high risk 欠落=`UDP_RISK_UNCOVERED`、schema_version 不一致=`UDP_STALE_INPUT` |

---
title: "UI Domain・Pattern Profile 単体テスト設計（L8実行正本）"
layer: L8
sub_doc: unit-test-design
artifact_type: test_design
executed_at_layer: L7
kind: add-design
status: draft
created: 2026-08-08
updated: 2026-08-08
owner: QA
pair_artifact: docs/design/helix/L6-function-design/ui-domain-pattern-profile.md
pair_freeze_exempt: true
pair_freeze_exempt_kind: cross_layer_meta
pair_freeze_exempt_reason: "PLAN-L7-520 以降（#209）の実装スライス群が共有する L8 具体化正本。canonical な pair chain（L6 design ↔ L6-ui-domain-pattern-profile-unit-test-design.md）が pair_artifact slot を専有しているため、本 doc は L6 設計への cross-layer 補助 binding として module 単位 1 件だけ pair-freeze 対象外とする（#175/#177 の L8 共有正本と同型、PLAN 毎の exemption 増殖はしない）"
github_issue_id: 209
---

# UI Domain・Pattern Profile 単体テスト設計（L8実行正本）

L6機能設計 `docs/design/helix/L6-function-design/ui-domain-pattern-profile.md` §0-§2 と
L6単体テスト設計の U-UDP 行を L8 で具体化する。スライス構成は L6 §3（純関数群 →
pairwise selector → registry consumer 接続 / CLI 表面）に従い、本書には着地済み
スライスの oracle 行のみを登録する。

## スライス1（PLAN-L7-520: 純関数群）

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-UDP-001 | `canonicalizeUiDomain` | kind 別 prefix regex 逸脱・class 名/file path/DOM selector 主キー・schema_version 不一致・stale/retired の canonical 渡しを `UDP_ID_INVALID`/`UDP_STALE_INPUT` で fail-close。順序違い同義入力は同 semantic_digest、完全重複は dedup。regex 判定・入口検査・digest 正規化のいずれを外す mutation も red で kill する | `tests/ui-domain-canonicalize.test.ts` |
| U-UDP-002 | `validatePatternContract` | required/forbidden の同一対象競合は `UDP_CONTRACT_CONFLICT`、対象 entity 非実在は fail-close、schema 不一致は `UDP_STALE_INPUT`。競合なし contract は required/forbidden 索引を返す。競合判定・実在検査のいずれを外す mutation も red で kill する | `tests/ui-domain-contract.test.ts` |
| U-UDP-003 | `guardRulePackIsolation` | 共通 Rule Pack への product namespace 値（profile_id 参照・brand token 実値・product 文言）混入を `UDP_PRODUCT_VALUE_IN_COMMON_PACK` で全列挙 fail-close。profile→共通 pack 参照（順方向）は green。schema 不一致は `UDP_STALE_INPUT`。混入判定の各枝を外す mutation も red で kill する | `tests/ui-domain-rulepack.test.ts` |
| U-UDP-004 | `validateUiProfile` | information_priority / 許容集合 / responsive 宣言 / motion budget + reduced-motion 代替 / a11y / brand / surface 分類のいずれの欠落も `UDP_PROFILE_INCOMPLETE` で欠落 field 全列挙。schema 不一致は `UDP_STALE_INPUT`。必須判定の各枝を外す mutation も red で kill する | `tests/ui-domain-profile.test.ts` |

## スライス2（PLAN-L7-521: pairwise selector）

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-UDP-005 | `selectPairwiseFixtures` | 全 2 軸ペア被覆 100%（未被覆ペアの機械検算で確認）・high risk entry 全件包含（部分指定 entry は指定軸を固定 seed に最低 1 fixture を決定的生成、残余軸は pairwise 補完で Cartesian 展開なし）・決定的順序（同一入力 2 回で同一 selection_digest）。全積要求（mode 逸脱）=`UDP_CARTESIAN_EXPLOSION`、被覆欠落=`UDP_PAIRWISE_UNCOVERED`、high risk 欠落=`UDP_RISK_UNCOVERED`、schema 不一致・空軸=`UDP_STALE_INPUT`。被覆検算・seed 包含・決定性のいずれを外す mutation も red で kill する | `tests/ui-domain-pairwise.test.ts` |

## スライス3（PLAN-L7-522: registry consumer 接続）

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-UDP-006 | `buildUiConsumerTrace` | #177 共有 ID 空間（SCR-/FLW-/CMP-/TOK-/CNT-）entity の registry node 欠落・kind 不対応・`authority≠canonical`（shadow/stale/retired）参照を `UDP_TRACE_UNBOUND` で全列挙 fail-close（欠落と kind 不対応の混在も個別列挙）。UI-local prefix（NAV-/RGN-/PTN-/FBK-/UST-）は binding 不要で entries に含めない。trace entry は entity_id 昇順の決定的列で、graph node 順序・domain entity 順序を入れ替えた意味的同一入力でも trace_digest 一致。graph 側の重複 entity_id と schema 不一致=`UDP_STALE_INPUT`。IT-UDP-001（canonicalize→contract→profile 連結 fail-close）と IT-UDP-002（risk→fixture 選定→consumer trace の決定性と ID 空間整合）を同 test で結合検査する。binding 判定・全列挙・決定性のいずれを外す mutation も red で kill する | `tests/ui-domain-consumer-trace.test.ts` |

## 後続スライス（未登録）

CLI 表面・L9 system assertion の oracle 行は各実装 PLAN の起票時に本書へ追記する。

---
title: "UI Domain・Pattern Profile 単体テスト設計（L8実行正本）"
layer: L8
sub_doc: unit-test-design
artifact_type: test_design
executed_at_layer: L7
kind: add-design
status: draft
created: 2026-08-08
updated: 2026-08-10
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

## スライス4（PLAN-L7-523: CLI 表面）

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-UDP-007 | `evaluateUiDomainBundle` / `helix ui-domain check` | 全 section green の bundle は ok=true・決定的 report_digest（同一入力 2 回で一致）。section 逸脱（contract 競合・pack 混入・profile 欠落・trace unbound・pairwise mode 逸脱）は当該 section 名へ帰属した typed failure で ok=false（他 section の green を潰さず並記）。bundle schema 不一致・非 record=`UDP_STALE_INPUT`。section 内容の構造不正（schema_version 正・必須ネスト field 欠落/null）は section-malformed の `UDP_STALE_INPUT` へ fail-close し他 section の green を保持。report_digest は value_digest を含む実内容 fingerprint（中身の異なる green bundle は異なる digest）。CLI は green bundle で exit 0 + `ui-domain-cli.v1` JSON、fail bundle で exit 1、入力 file 欠落で exit 1 typed error。section 帰属・malformed fail-close・digest 非衝突・決定性・exit 規約のいずれを外す mutation も red で kill する | `tests/ui-domain-cli.test.ts` |

## スライス5（PLAN-L7-540: 実 asset 正本 + 実 gate 配線 + L9 system assertion）

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-UDP-008 | `checkUiDomainBundleGate` / `analyzeUiDomainBundleGate`（SA-UDP-02） | 実 repo の実 asset 一式（domain / contract / profile / pack / pairwise 同時 load）が実 gate 経路で green（OK message 1 行）。実 asset への注入反例 3 系: (1) profile brand 実値を共通 pack rule value へ混入 → pack section の `UDP_PRODUCT_VALUE_IN_COMMON_PACK`、(2) required と同一 term の forbidden 注入 → contract section の `UDP_CONTRACT_CONFLICT`、(3) 5 section いずれかの削除（骨抜き）→ `section-missing:<name>`。いずれも同一 gate 関数経由で fail-close する | `tests/ui-domain-system.test.ts` |
| U-UDP-008b | doctor 配線 | gate 関数が存在しても runFullDoctor の集約から漏れれば実行環境では効かない。ok 集計・全体 ok チェーン・メッセージ集約の 3 点の uiDomainBundle 参照を機械確認する | `tests/ui-domain-system.test.ts` |
| U-UDP-008c | fail-open 禁止 | asset 欠落 root は `asset-missing:` で ok=false、非 record 入力も ok=false（読めない・壊れた asset を green にしない） | `tests/ui-domain-system.test.ts` |
| U-UDP-009 | 実 risk matrix → fixture 生成 → consumer 接続（SA-UDP-03） | 実 asset の pairwise 宣言から `selectPairwiseFixtures` で生成した fixture 列に対し、被覆 3 条件を selector の自己申告に依らず独立検算する: (1) 全 2 軸ペア被覆 100%（8 軸の全ペア×全 level 組を機械列挙）、(2) 実 high risk entry 全件包含 + high_risk_included 一致、(3) 決定的順序（再実行で selection_digest・列とも一致）。consumer 接続可能性 = 各 fixture が 8 軸完全代入かつ fixture_id 一意（テスト実行計画の行として消費可能な形） | `tests/ui-domain-system.test.ts` |
| U-UDP-009b | 実バリエーション下の被覆維持 | 実 matrix への level 追加（input へ keyboard-with-reader）でも同一生成経路で被覆 3 条件が維持され、追加 level が fixture へ実際に現れる（変動が生成経路へ届いている） | `tests/ui-domain-system.test.ts` |

## 後続スライス（未登録）

SA-UDP-01 の oracle 行は #257 到達後の実装 PLAN 起票時に本書へ追記する。

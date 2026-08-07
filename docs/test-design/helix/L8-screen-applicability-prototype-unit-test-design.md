---
title: "ScreenApplicabilityGate L8単体テスト設計（PLAN-L7-510/511/512 共有正本）"
layer: L8
sub_doc: unit-test-design
artifact_type: test_design
executed_at_layer: L7
kind: add-design
status: draft
created: 2026-08-07
updated: 2026-08-07
owner: QA
pair_artifact: docs/design/helix/L6-function-design/screen-applicability-prototype.md
pair_freeze_exempt: true
pair_freeze_exempt_kind: cross_layer_meta
pair_freeze_exempt_reason: "PLAN-L7-510/511/512（#175）が共有する L8 具体化正本。canonical な pair chain（L6 design ↔ L6-screen-applicability-prototype-unit-test-design.md）は fixture manifest（layer-ledger-pair-gate-progress-s01）と design-catalog に pin 済みで pair_artifact slot を専有しているため、本 doc は L6 設計への cross-layer 補助 binding として module 単位 1 件だけ pair-freeze 対象外とする（PLAN 毎の exemption 増殖はしない）"
---

# ScreenApplicabilityGate L8単体テスト設計（共有正本）

Issue #175 の実装スライス群（PLAN-L7-510 / L7-511 / L7-512）が共有する L8 単体テスト設計。
L6テスト設計 `L6-screen-applicability-prototype-unit-test-design.md` の U-SAP 行を PLAN 単位で具体化する。
primary U / HST の分母は変更しない（canonical assertion primary 表は L6 テスト設計のまま）。

## §1 slice1（PLAN-L7-510）: 評価器コア（U-SAP-001〜005）

L6設計 `docs/design/helix/L6-function-design/screen-applicability-prototype.md` §0-§1 の型・signature・DbC を
正本とし、write authority を持たない pure evaluator 5 本を対象とする（Issue #175 第1スライス、
L6テスト設計 `L6-screen-applicability-prototype-unit-test-design.md` の U-SAP-001〜005 行の L8 具体化）。
fake clock（trustedNow 文字列注入）と fixed scope fixture を使い、filesystem / DB / browser には触れない。

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-SAP-001 | `canonicalizeScreenScope` | field欠落・unknown capability・absolute locator を typed failure で拒否し、capability 順序違いの同義入力は同一 scope_digest | `tests/screen-scope.test.ts` |
| U-SAP-002 | `evaluateScreenApplicability` | no-UI / UI / free-text / unknown reason を matrix 評価し、free-text・deferred pass・二route同時選択を拒否（route は exactly-one） | `tests/screen-applicability.test.ts` |
| U-SAP-003 | `validateNoUiReceipt` | reason / actor / evidence / reentry / scope / rule / expiry を一件ずつ欠落・改変して valid 0（HIL_SCREEN_SKIP_EVIDENCE_MISSING / HIL_SCREEN_RECEIPT_STALE） | `tests/no-ui-receipt.test.ts` |
| U-SAP-004 | `evaluateScreenReentry` | capability / rule / scope digest の 1 箇所改変で stale + 再判定 task exactly-one、同一入力再送は増分 0（決定的同値） | `tests/screen-reentry.test.ts` |
| U-SAP-005 | `planPrototypeDiscovery` | screen / interaction / state / data obligation の欠落と no-UI route を拒否（task 0）、prototype_required では task exactly-one で義務 digest を全保持 | `tests/prototype-discovery.test.ts` |

U-SAP-006〜012（prototype artifact・walkthrough・agreement・backprop・freeze・stage closure gate・
plan route composition）は後続スライスで L8 化する。本設計は canonical assertion primary 表の分母を
変更しない（primary U/HST は L6 テスト設計のまま）。

## §2 slice2（PLAN-L7-511）: prototype検証 evaluator（U-SAP-006〜009）

L6設計 `docs/design/helix/L6-function-design/screen-applicability-prototype.md` §1-§2 の型・signature・DbC を
正本とし、prototype 検証系 pure evaluator 4 本を対象とする（Issue #175 第2スライス、
L6テスト設計 `L6-screen-applicability-prototype-unit-test-design.md` の U-SAP-006〜009 行の L8 具体化）。
slice1（PLAN-L7-510、本doc §1）と同じく filesystem / clock / DB /
browser には触れず、fixed fixture のみを使う。

walkthrough の iteration 上限は L6/L5 に数値未規定のため、本スライスで module 定数
`WALKTHROUGH_ITERATION_LIMIT` として export し docstring に根拠を明記する（後続 transaction port /
store スライスで policy 化を再検討する申し送り）。

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-SAP-006 | `validatePrototypeArtifact` | static-only（executable_locator / build / startup_command / startup_receipt digest の欠落 = `HIL_PROTOTYPE_NOT_EXECUTABLE`）、screen / interaction / state / data trace の一件ずつ欠落（`HIL_PROTOTYPE_ARTIFACT_INCOMPLETE`）、9 状態を一件ずつ削除・重複（`HIL_PROTOTYPE_STATE_MISSING`）、task 側 field 不正（capability_id / obligation_digest 欠落・非整数 requirement_revision・status=complete への再発行）と manifest_digest 改変で ready 0（L6 §2 の `PrototypeManifestV1` に capability field は無く、receipt への capability bind は task 側検査が唯一の入口）。正常系は 9 状態完備で receipt exactly-one、同義入力は同 receipt_digest | `tests/prototype-artifact.test.ts` |
| U-SAP-007 | `recordWalkthroughIteration` | actor / observation / target（delta 時）の欠落、artifact_revision 不一致、iteration が `WALKTHROUGH_ITERATION_LIMIT` 超過、prior 列の非連続 iteration で receipt 0（`HIL_PROTOTYPE_DELTA_MISSING` / `HIL_WALKTHROUGH_RECEIPT_MISSING`）。rebuild は入力 field ではなく出力 bind（delta 時に rebuilt_artifact_revision = artifact.revision+1）を正常系で検査する。正常系は iteration = prior末尾+1 の receipt exactly-one（上限ちょうどの iteration も成功）、同一入力再送は決定的同値 | `tests/prototype-walkthrough.test.ts` |
| U-SAP-008 | `evaluatePrototypeAgreement` | walkthrough 空（`HIL_PROTOTYPE_WALKTHROUGH_MISSING`）、旧 artifact revision への review、人以外 reviewer（authority_receipt_id 欠落）、verdict=rejected、walkthrough set / review digest 不一致で agreement 0。正常系は latest artifact + 完結 walkthrough + approved review を同 digest へ bind した agreement exactly-one | `tests/prototype-agreement.test.ts` |
| U-SAP-009 | `validateRequirementsBackprop` | delta 未 disposition（artifact_revision>1 なのに revision が previous_revision+1 へ進んでいない）、wrong L1 revision（previous_revision 連鎖不整合）、no_delta 偽装（artifact_revision>1 なのに previous_revision null）で backprop 0（`HIL_PROTOTYPE_BACKPROP_MISSING`）。正常系は delta 経路（revision trace 完備）と純 no_delta 経路（artifact_revision=1 + previous_revision null）で receipt exactly-one | `tests/prototype-backprop.test.ts` |

U-SAP-010〜012（freeze / stage closure gate / plan route composition）と transaction port / store は
後続スライスで L8 化する。本設計は canonical assertion primary 表の分母を変更しない
（primary U / HST は L6 テスト設計のまま）。

## §3 slice3（PLAN-L7-512）: freeze候補生成とplan route合成（U-SAP-010, 012）

L6設計 `docs/design/helix/L6-function-design/screen-applicability-prototype.md` §1-§2 の型・signature・DbC を
正本とし、`evaluateScreenFreeze`（pure candidate 生成）と `aggregatePlanScreenRoute` →
`commitPlanScreenRoute`（composition、port 委譲）を対象とする（Issue #175 第3スライス、
L6テスト設計 U-SAP-010 / U-SAP-012 行の L8 具体化）。U-SAP-011（store / stage closure gate）は
後続スライスで L8 化する。

`ScreenGateReceiptV1` の operation / commit / head 系 field（operation_id 以外の commit_receipt_digest・
before/after_revision・event_head）は、pure candidate 生成の時点では commit 前 placeholder
（空文字列・0）とし、実値の採番は唯一の gate write authority（`commitStageClosureAndGate`、後続スライス）
だけが行う。candidate の operation_id は入力 digest から決定的に導出する。

`commitPlanScreenRoute` の unit テストは L6 §2 `ScreenTransactionPortV1` の in-memory fake（委譲回数と
受領 bundle を記録するだけの test double）を使い、DB / filesystem には触れない。

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-SAP-010 | `evaluateScreenFreeze` | skip/agreement 両欠落（`HIL_SCREEN_GATE_EVIDENCE_MISSING`）、両方同時（`HIL_SCREEN_IMPLICIT_SKIP`）、decision stale（`HIL_SCREEN_DECISION_MISSING`）、route deferred（`HIL_SCREEN_DEFERRED_NOT_CLOSED`）、partial transaction（agreement 有り backprop 無し等の片肺 = `HIL_SCREEN_GATE_EVIDENCE_MISSING`）、scope/decision digest 不一致で passed 0。正常系は no-UI+skip / UI+agreement+backprop の各 exactly-one route で verdict=passed の candidate を決定的生成（commit 系 field は placeholder） | `tests/screen-freeze.test.ts` |
| U-SAP-012 | `aggregatePlanScreenRoute` → `commitPlanScreenRoute` | aggregate 固有: capability ID 欠落/余剰/重複、decision stale/deferred、scope digest 不一致、UI 優先 route（1件でも prototype_required なら plan route も prototype_required）。commit 固有: append_order 改変、write_set_digest 改変、operation_digest 不一致、plan aggregate と decision 集合の不一致、prototype task の UI capability exact set 逸脱、port 受領 receipt の identity 不一致、port fault 透過。全反例で receipt 0・port 委譲 0 回（bundle 検査は委譲前）または fault 透過、正常系は port 委譲 exactly-one で `gate_write_count=0` の receipt | `tests/screen-plan-route.test.ts` |

いずれの API も write authority 0 を維持し、gate payload を bundle へ混入できない型（`PlanScreenRouteCommitBundleV1`
に gate field が存在しない）と `gate_write_count: 0` の型・実測 assert を両方置く。本設計は canonical assertion
primary 表の分母を変更しない（primary U / HST は L6 テスト設計のまま）。

## §4 slice4（PLAN-L7-513）: stage closure store と gate 発行（U-SAP-011）

L6設計 §2/§5 の `ScreenApplicabilityStoreV1` を in-memory reference store として具体化する。
trustedNow は文字列注入とし、head/revision の CAS・append 順
（`stage_completion -> stage_projection -> gate_receipt -> terminal_receipt`）・write-set digest を
決定的に検査する。gate row への write authority は `commitStageClosureAndGate` の成功経路のみ。

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-SAP-011 | `commitStageClosureAndGate` | current plan route 不在/head 不一致、no-UI 三者（decision/skip/completion）identity 不一致、skip authority の stale/superseded、UI agreement/backprop authority の receipt ID/digest/current head/canonical bytes 改変、trustedNow freshness 超過、requirement revision 連鎖不整合、分母集合の欠落/余剰/重複、write_set/operation digest 改変、同 operation の二重 gate、append 順逆転、CAS 不一致で stage/gate 増分 0（typed failure）。正常系は stage closure と gate receipt を同一 operation で atomic commit し、before/after head と write-set digest を receipt へ bind する | `tests/screen-stage-closure-gate.test.ts` |

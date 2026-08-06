---
title: "ScreenApplicabilityGate prototype検証 L8単体テスト設計"
layer: L8
sub_doc: unit-test-design
artifact_type: test_design
executed_at_layer: L7
kind: add-design
status: draft
created: 2026-08-07
updated: 2026-08-07
owner: QA
plan: docs/plans/PLAN-L7-511-screen-applicability-proto.md
pair_artifact: docs/design/helix/L6-function-design/screen-applicability-prototype.md
---

# ScreenApplicabilityGate prototype検証 L8単体テスト設計

L6設計 `docs/design/helix/L6-function-design/screen-applicability-prototype.md` §1-§2 の型・signature・DbC を
正本とし、prototype 検証系 pure evaluator 4 本を対象とする（Issue #175 第2スライス、
L6テスト設計 `L6-screen-applicability-prototype-unit-test-design.md` の U-SAP-006〜009 行の L8 具体化）。
slice1（PLAN-L7-510 / `L8-screen-applicability-core-unit-test-design.md`）と同じく filesystem / clock / DB /
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

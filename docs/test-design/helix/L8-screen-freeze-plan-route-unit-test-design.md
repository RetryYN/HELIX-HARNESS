---
title: "ScreenApplicabilityGate freeze / plan route L8単体テスト設計"
layer: L8
sub_doc: unit-test-design
artifact_type: test_design
executed_at_layer: L7
kind: add-design
status: draft
created: 2026-08-07
updated: 2026-08-07
owner: QA
plan: docs/plans/PLAN-L7-512-screen-freeze-plan-route.md
pair_artifact: docs/design/helix/L6-function-design/screen-applicability-prototype.md
---

# ScreenApplicabilityGate freeze / plan route L8単体テスト設計

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

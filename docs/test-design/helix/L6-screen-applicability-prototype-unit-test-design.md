---
title: "HELIX L7 単体テスト設計 — screen applicability prototype"
layer: L6
executed_at_layer: L7
artifact_type: test_design
status: draft
created: 2026-07-15
updated: 2026-07-15
owner: QA / TL
plan: PLAN-L1-07-infinity-loop-platform-requirements
design_slice: HDS-HIL-15
related_l3: docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md
related_l4: docs/design/helix/L4-basic-design/infinity-loop-platform-basic-design.md
related_hst:
  - HST-HIL-012
  - HST-HIL-024
pair_artifact: docs/design/helix/L6-function-design/screen-applicability-prototype.md
next_pair_freeze: L6
requirements:
  - HR-FR-HIL-15
  - HAC-HIL-15a
  - HAC-HIL-15b
  - HAC-HIL-15c
---

# HELIX L7 単体テスト設計 — screen applicability prototype

fake clock、fixed scope、in-memory transaction port、artifact/browser spyを使う。全caseは未実装である。

| ID | exact function | mutation／期待結果 | write-count／citation |
|---|---|---|---|
| `U-SAP-001` | `canonicalizeScreenScope` | field欠落、unknown capability、順序変更、absolute locatorをrejectし同義入力は同digest | write 0／`tests/screen-scope.test.ts` |
| `U-SAP-002` | `evaluateScreenApplicability` | no-UI/UI/deferred/free-textをmatrix評価し二route同時選択0 | proposal最大1／`tests/screen-applicability.test.ts` |
| `U-SAP-003` | `validateNoUiReceipt` | reason/actor/evidence/provenance/reentry/expiryを一件ずつ欠落 | valid 0／`tests/no-ui-receipt.test.ts` |
| `U-SAP-004` | `evaluateScreenReentry` | capability/rule/scope digestを1 byte変更、同一入力再送 | stale/task各1、再送増分0／`tests/screen-reentry.test.ts` |
| `U-SAP-005` | `planPrototypeDiscovery` | screen/interaction/state/data obligation欠落とno-UI routeを拒否 | task 0／`tests/prototype-discovery.test.ts` |
| `U-SAP-006` | `validatePrototypeArtifact` | static-only、startup failure、trace欠落、9状態を一件ずつ削除、digest改変 | ready 0／`tests/prototype-artifact.test.ts` |
| `U-SAP-007` | `recordWalkthroughIteration` | actor/observation/delta/target/rebuild欠落、iteration超過 | receipt 0／`tests/prototype-walkthrough.test.ts` |
| `U-SAP-008` | `evaluatePrototypeAgreement` | walkthrough無し、旧artifact、人以外review、digest不一致 | agreement 0／`tests/prototype-agreement.test.ts` |
| `U-SAP-009` | `validateRequirementsBackprop` | delta一件未disposition、wrong L1 revision、no_delta偽装 | backprop 0／`tests/prototype-backprop.test.ts` |
| `U-SAP-010` | `evaluateScreenFreeze` | skip/agreement両欠落、両方、stale、deferred、partial transaction | passed 0／`tests/screen-freeze.test.ts` |
| `U-SAP-011` | `commitStageClosureAndGate` | current plan route後にno-UI三者identity/skip authorityと、UI agreement/backprop authority receipt ID/digest/current head/canonical bytes/freshnessを検査。stale/superseded/swap、二重gate、順序逆転を拒否 | 唯一gate authorityだけがstage+passed gateを同一CAS。authority/順序/fault反例はstage/gate 0／`tests/screen-stage-closure-gate.test.ts` |
| `U-SAP-012` | composition: `aggregatePlanScreenRoute` → `commitPlanScreenRoute` | aggregate固有mutationとしてcapability ID欠落/余剰/重複、decision stale/deferred、set digest、UI優先route、prototype task exact setを各改変する。commit固有mutationとしてbundle/receipt、expected head/CAS、stage projection、port委譲回数、gate payload/`gate_write_count`を各改変する。集約と同一PLAN route identityのcommitを一件として採点 | plan/stage準備だけcurrent、gate writeは常に0。全反例でplan/stage/receipt増分0、直接passed、二重委譲を拒否／`tests/screen-plan-route.test.ts` |

## canonical assertion primary表

| HST正本 | 主U | 主API | supporting主IT | pre_state | expected_state | failure正本 |
|---|---|---|---|---|---|---|
| `HST-CASE-012-01` | `U-SAP-002` | `evaluateScreenApplicability` | `IT-SAP-001` | `undecided` | `not_applicable` | `なし（正常系）` |
| `HST-CASE-012-02` | `U-SAP-010` | `evaluateScreenFreeze` | `IT-SAP-002` | `undecided` | `undecided` | `HIL_SCREEN_DECISION_MISSING` |
| `HST-CASE-012-03` | `U-SAP-004` | `evaluateScreenReentry` | `IT-SAP-003` | `not_applicable` | `stale` | `HIL_SCREEN_RECEIPT_STALE` |
| `HST-CASE-012-04` | `U-SAP-003` | `validateNoUiReceipt` | `IT-SAP-002` | `undecided` | `undecided` | `HIL_SCREEN_SKIP_EVIDENCE_MISSING` |
| `HST-CASE-012-05` | `U-SAP-010` | `evaluateScreenFreeze` | `IT-SAP-002` | `deferred` | `deferred` | `HIL_SCREEN_DEFERRED_NOT_CLOSED` |
| `HST-CASE-012-06` | `U-SAP-002` | `evaluateScreenApplicability` | `IT-SAP-004` | `undecided` | `prototype_required` | `なし（正常系）` |
| `HST-CASE-012-07` | `U-SAP-010` | `evaluateScreenFreeze` | `IT-SAP-002` | `assertion_input_ready` | `assertion_pass` | `HIL_SCREEN_DECISION_MISSING` |
| `HST-CASE-012-08` | `U-SAP-002` | `evaluateScreenApplicability` | `IT-SAP-004` | `assertion_input_ready` | `assertion_pass` | `HIL_SCREEN_APPLICABILITY_INVALID` |
| `HST-CASE-012-09` | `U-SAP-010` | `evaluateScreenFreeze` | `IT-SAP-002` | `assertion_input_ready` | `assertion_pass` | `HIL_SCREEN_GATE_EVIDENCE_MISSING` |
| `HST-CASE-012-10` | `U-SAP-010` | `evaluateScreenFreeze` | `IT-SAP-002` | `assertion_input_ready` | `assertion_pass` | `HIL_SCREEN_IMPLICIT_SKIP` |
| `HST-CASE-024-01` | `U-SAP-008` | `evaluatePrototypeAgreement` | `IT-SAP-007` | `prototype_ready` | `agreement_ready` | `なし（正常系）` |
| `HST-CASE-024-02` | `U-SAP-006` | `validatePrototypeArtifact` | `IT-SAP-005` | `prototype_required` | `prototype_required` | `HIL_PROTOTYPE_NOT_EXECUTABLE` |
| `HST-CASE-024-03` | `U-SAP-006` | `validatePrototypeArtifact` | `IT-SAP-006` | `building` | `building` | `HIL_PROTOTYPE_STATE_MISSING` |
| `HST-CASE-024-04` | `U-SAP-008` | `evaluatePrototypeAgreement` | `IT-SAP-007` | `prototype_ready` | `prototype_ready` | `HIL_PROTOTYPE_WALKTHROUGH_MISSING` |
| `HST-CASE-024-05` | `U-SAP-007` | `recordWalkthroughIteration` | `IT-SAP-008` | `walking` | `walking` | `HIL_PROTOTYPE_DELTA_MISSING` |
| `HST-CASE-024-06` | `U-SAP-009` | `validateRequirementsBackprop` | `IT-SAP-008` | `walkthrough_complete` | `walkthrough_complete` | `HIL_PROTOTYPE_BACKPROP_MISSING` |
| `HST-CASE-024-07` | `U-SAP-006` | `validatePrototypeArtifact` | `IT-SAP-005` | `assertion_input_ready` | `assertion_pass` | `HIL_PROTOTYPE_ARTIFACT_INCOMPLETE` |
| `HST-CASE-024-08` | `U-SAP-007` | `recordWalkthroughIteration` | `IT-SAP-007` | `assertion_input_ready` | `assertion_pass` | `HIL_WALKTHROUGH_RECEIPT_MISSING` |

## 合否

U 12/12、canonical 18/18、typed Result、mixed capability、stable digest、write-count、port faultを保存する。mock successだけでgreenにしない。

`U-SAP-011`はcurrent plan route receipt後に`NoUiCapabilityCompletionV1[]`と`UiCapabilityCompletionV1[]`をexact setとして検査し、
UI/no-UI交差、分母差分、completion/skip authorityのidentity/digest swap、agreement/backprop authority head/digest/receipt swap、
stale/superseded/freshness、順序逆転、二重gate、CAS/store faultを個別mutationする。
`U-SAP-012`のexact function setは`aggregatePlanScreenRoute` → `commitPlanScreenRoute`だけである。aggregate laneとcommit protocol laneを別fixtureでmutationし、plan route bundleへgate payloadを混入できない型と`gate_write_count=0`をassertする。全反例はstage receipt 0、gate passed 0とする。

`U-SAP-005`は`prototype_required` decisionをpreconditionとしてprototype task exactly-oneを生成する
`HST-CASE-012-06`のsupporting oracle/evidence edgeである。primary Uは`U-SAP-002`のまま維持し、
`undecided -> prototype_required`遷移分母へ`U-SAP-005`を算入しない。

`U-SAP-002`はdetector ID/version/result/provenanceを一件ずつ欠落・swapし、`U-SAP-006`はcontent/build/startup receiptとscreen/interaction/state/data traceを一件ずつ欠落させる。`U-SAP-010`/`U-SAP-011`はgate receipt自身のoperation/digest、commit receipt、before/after revision、event headを偽装し、API返却intersectionにだけbindingがある偽gateをrejectする。

---
title: "HELIX L7 単体テスト設計 — intake contract normalization"
layer: L6
executed_at_layer: L7
artifact_type: test_design
status: draft
created: 2026-07-15
updated: 2026-07-15
owner: QA / TL
plan: PLAN-L1-07-infinity-loop-platform-requirements
design_slice: HDS-HIL-01
related_l3: docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md
related_l4: docs/design/helix/L4-basic-design/infinity-loop-platform-basic-design.md
related_hat:
  - HAT-HIL-01
related_hst:
  - HST-HIL-001
pair_artifact: docs/design/helix/L6-function-design/intake-contract-normalization.md
next_pair_freeze: L6
requirements:
  - HR-FR-HIL-01
  - HAC-HIL-01a
  - HAC-HIL-01b
  - HAC-HIL-01c
source_capabilities:
  - HU-CAP-002
---

# HELIX L7 単体テスト設計 — intake contract normalization

全caseは未実装である。fake schema/authority/route/budget registry、in-memory Node port、dispatch spyを使い、外部I/Oを行わない。
本書は`HST-CASE-001-01`、`-02`、`-03`、`-05`、`-07`、`-08`、`-10`の7件だけを採点する。
`-04`、`-06`、`-09`はHDS-HIL-02が所有し、initial cause/transition/budget metadata handoffの型検査を除き再採点しない。

| ID | exact function | scenarioと期待結果 | HAC | exact HST | pre_state | expected_state | canonical failure | test citation |
|---|---|---|---|---|---|---|---|---|
| `U-ICN-001` | `normalizeUntrustedIngress` | 4 unionの全順列が同じcommon shapeと別source metadataを返し、unknown schema/field欠落はproposal 0 | `HAC-HIL-01a` | `HST-CASE-001-01` | `intake` | `admitted` | `なし（正常系）` | `tests/intake-envelope-normalizer.test.ts` |
| `U-ICN-002` | `evaluateIntakeDuplicate` | 同operation/同digestを反復・並行評価しprior receipt、増分0 | `HAC-HIL-01b` | `HST-CASE-001-02` | `admitted` | `admitted` | `HIL_INTAKE_DUPLICATE_EFFECT` | `tests/intake-idempotency.test.ts` |
| `U-ICN-003` | `detectIntakeOperationConflict` | payload digestを1 byte変異しconflict一件、contract mutation 0 | `HAC-HIL-01b` | `HST-CASE-001-03` | `admitted` | `admitted` | `HIL_INTAKE_IDEMPOTENCY_CONFLICT` | `tests/intake-idempotency.test.ts` |
| `U-ICN-004` | `resolveIssueAdmissionRoute` | 4 ingressでmode/drive/Reverse/Forwardの各fieldを欠落・unknown化しroute 0 | `HAC-HIL-01a` | `HST-CASE-001-05` | `assertion_input_ready` | `assertion_pass` | `HIL_INTAKE_ROUTE_INCOMPLETE` | `tests/intake-route.test.ts` |
| `U-ICN-005` | `validateIssueContractAdmission` | 必須field全mutation、空/重複/unknown、不要CLI/API/schema/dependency/configを拒否。後者はlocal minimality causeも保持 | `HAC-HIL-01b` | `HST-CASE-001-07` | `assertion_input_ready` | `assertion_pass` | `HIL_ISSUE_CONTRACT_INCOMPLETE` | `tests/issue-contract-admission.test.ts` |
| `U-ICN-006` | `commitIssueAdmissionExactlyOnce` | 先行custody receiptを固定して各admission append直後fault、並行CAS、再送を実行。custody増分0、admission partial 0、winner一件。initial cause/transition/budget metadataも同じadmission transactionへbind | `HAC-HIL-01b` | `HST-CASE-001-08` | `assertion_input_ready` | `assertion_pass` | `HIL_IDEMPOTENCY_VIOLATION` | `tests/issue-admission-transaction.test.ts` |
| `U-ICN-007` | `isolateUntrustedIngressContent` | shell/tool/prompt/path/macro payloadを4 ingressへ投入しartifact一件、dispatch spy 0 | `HAC-HIL-01c` | `HST-CASE-001-10` | `assertion_input_ready` | `assertion_pass` | `HIL_UNTRUSTED_INPUT_EXECUTED` | `tests/intake-trust-boundary.test.ts` |
| `U-ICN-008` | `appendIntakeCustodyBeforeValidation` | invalid入力も一件、同source event/op/digest再送0、同operation異digest candidate custody一件 | `HAC-HIL-01b` | supporting | `received` | `custodied` | `HIL_INTAKE_CUSTODY_CONFLICT` | `tests/intake-custody.test.ts` |
| `U-ICN-009` | `validateTransportActorAuthority` | declared class、transport actor、source kind、policy revision/expiryを一fieldずつ変異しauthority 0 | `HAC-HIL-01b`, `HAC-HIL-01c` | supporting | `custodied` | `validated` | `HIL_INTAKE_AUTHORITY_INVALID` | `tests/intake-authority.test.ts` |
| `U-ICN-010` | `reconcileIssueAdmissionReservation` | reserved/committing crash、same/different digest、stale operation headをmatrix化しsame digestだけreceipt一件 | `HAC-HIL-01b` | supporting | `reserved` | `committed` | `HIL_INTAKE_RECONCILE_FAILED` | `tests/intake-admission-reconcile.test.ts` |
| `U-ICN-011` | `loadCurrentInitialHandoff` | Issue/revision key、contract/route/snapshot/policy digestを個別変異しstale handoff 0 | `HAC-HIL-01a` | supporting | `admitted` | `handoff_ready` | `HIL_INTAKE_HANDOFF_STALE` | `tests/intake-handoff.test.ts` |

## §1 合否

### supporting APIのL8 exact join

| L7 oracle | 対象関数 | L8 oracle | typed fault oracle |
|---|---|---|---|
| `U-ICN-008` | `appendIntakeCustodyBeforeValidation` | `IT-ICN-008` | `CustodyAppendV1` / `CustodyReceiptV1`、duplicate時write 0 |
| `U-ICN-009` | `validateTransportActorAuthority` | `IT-ICN-008` | actor/policy不一致でadmission 0 |
| `U-ICN-010` | `reconcileIssueAdmissionReservation` | `IT-ICN-009` | `AdmissionReceiptV1` / `ProjectionDigestV1`、stale headでwrite 0 |
| `U-ICN-011` | `loadCurrentInitialHandoff` | `IT-ICN-010` | current Issue/revision以外handoff 0 |

本slice所有7/7でRed/Green、HAT-HIL-01、HAC、exact HST/pre_state/expected_state/failure、Result、stable order、row/event/write/dispatch count、
contract/initial cause/transition/budget metadata/route/idempotency digestを保存する。pure testはexternal adapterを起動せずport resultを注入する。

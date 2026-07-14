---
title: "HELIX L6 機能設計 — intake contract normalization"
layer: L6
kind: add-design
status: draft
created: 2026-07-15
updated: 2026-07-15
owner: Codex / TL
plan: PLAN-L1-07-infinity-loop-platform-requirements
design_slice: HDS-HIL-01
related_l3: docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md
related_l4: docs/design/helix/L4-basic-design/infinity-loop-platform-basic-design.md
related_l5: docs/design/helix/L5-detail/intake-contract-normalization.md
related_hat:
  - HAT-HIL-01
related_hst:
  - HST-HIL-001
pair_artifact: docs/test-design/helix/L6-intake-contract-normalization-unit-test-design.md
next_pair_freeze: L7
requirements:
  - HR-FR-HIL-01
  - HAC-HIL-01a
  - HAC-HIL-01b
  - HAC-HIL-01c
source_capabilities:
  - HU-CAP-002
---

# HELIX L6 機能設計 — intake contract normalization

## §0 関数境界

pure functionはDB、filesystem、network、shell、AI runtime、clockを直接読まない。4 ingress envelope、schema registry、authority policy、
route catalog、budget policyを値として受け、stable orderのResultを返す。custody/idempotency/event/contract appendはinjected Node portだけが行う。
外部本文を含むfieldはopaque artifact referenceとして扱い、adapterへ再dispatchしない。

本書はHST-HIL-001 familyのうち`HST-CASE-001-01`、`-02`、`-03`、`-05`、`-07`、`-08`、`-10`を所有する。
`-04`、`-06`、`-09`の全loop causality/state/budget判定はHDS-HIL-02が所有し、本書はその入力となるtyped metadataだけを生成する。

## §1 public APIとexact oracle

| API（関数） | signature（型） | DbC／result（契約） | L7 oracle（単体） | HAC | exact HST（正本） | pre_state（前） | expected_state（後） | canonical failure（失敗） |
|---|---|---|---|---|---|---|---|---|
| `normalizeUntrustedIngress` | `(envelope, schemaRegistry, trustPolicy) => Result<NormalizedIngress, IntakeFailure[]>` | 4 unionをsource固有metadata付きcommon headerへ変換、本文はopaque | `U-ICN-001` | `HAC-HIL-01a` | `HST-CASE-001-01` | `intake` | `admitted` | `なし（正常系）` |
| `evaluateIntakeDuplicate` | `(operation, payloadDigest, existing) => Result<DuplicateReceipt, IntakeFailure>` | 同operation/同digestはprior receipt、副作用増分0 | `U-ICN-002` | `HAC-HIL-01b` | `HST-CASE-001-02` | `admitted` | `admitted` | `HIL_INTAKE_DUPLICATE_EFFECT` |
| `detectIntakeOperationConflict` | `(operation, payloadDigest, existing) => Result<Reservation, ConflictReceipt>` | 同operation/異digestは既存contractを変更せずconflict | `U-ICN-003` | `HAC-HIL-01b` | `HST-CASE-001-03` | `admitted` | `admitted` | `HIL_INTAKE_IDEMPOTENCY_CONFLICT` |
| `resolveIssueAdmissionRoute` | `(ingress, authority, routeCatalog) => Result<IssueRoute, IntakeFailure[]>` | mode/drive/Reverse/Forwardを全ingress同契約へ決定 | `U-ICN-004` | `HAC-HIL-01a` | `HST-CASE-001-05` | `assertion_input_ready` | `assertion_pass` | `HIL_INTAKE_ROUTE_INCOMPLETE` |
| `validateIssueContractAdmission` | `(proposal, schema, scopeAuthority, surfaceDelta) => Result<ValidatedIssueContract, IntakeFailure[]>` | 必須field/enum/digestとminimum necessaryを検査、不要surface拒否 | `U-ICN-005` | `HAC-HIL-01b` | `HST-CASE-001-07` | `assertion_input_ready` | `assertion_pass` | `HIL_ISSUE_CONTRACT_INCOMPLETE` |
| `commitIssueAdmissionExactlyOnce` | `(bundle, operation, port) => Promise<Result<AdmissionReceipt, IntakeFailure[]>>` | 先行durable custody receiptを参照し、contract/route/initial handoff/idempotencyだけをall-or-nothing append。custody自体は再appendしない | `U-ICN-006` | `HAC-HIL-01b` | `HST-CASE-001-08` | `assertion_input_ready` | `assertion_pass` | `HIL_IDEMPOTENCY_VIOLATION` |
| `isolateUntrustedIngressContent` | `(envelope, artifactPort, dispatchSpy) => Promise<Result<TrustReceipt, IntakeFailure>>` | bodyをartifact化しmetadataだけ返す、dispatch count 0 | `U-ICN-007` | `HAC-HIL-01c` | `HST-CASE-001-10` | `assertion_input_ready` | `assertion_pass` | `HIL_UNTRUSTED_INPUT_EXECUTED` |
| `appendIntakeCustodyBeforeValidation` | `(receipt, store) => Promise<Result<CustodyReceipt, IntakeFailure>>` | invalidを含む受信事実をsemantic validationより先にdurable化。同一source event/op/digestは既存receipt | `U-ICN-008` | `HAC-HIL-01b` | supporting | `received` | `custodied` | `HIL_INTAKE_CUSTODY_CONFLICT` |
| `validateTransportActorAuthority` | `(header, transportActor, policyReceipt, now) => Result<VerifiedIngressAuthority, IntakeFailure[]>` | actor/source/authority/policy revision/expiryをexact照合 | `U-ICN-009` | `HAC-HIL-01b`, `HAC-HIL-01c` | supporting | `custodied` | `validated` | `HIL_INTAKE_AUTHORITY_INVALID` |
| `reconcileIssueAdmissionReservation` | `(operation, immutableEvidence, store) => Promise<Result<AdmissionReceipt, IntakeFailure[]>>` | reserved/committing crashを同digest/headだけでresumeしcustody/Issue再append 0 | `U-ICN-010` | `HAC-HIL-01b` | supporting | `reserved` | `committed` | `HIL_INTAKE_RECONCILE_FAILED` |
| `loadCurrentInitialHandoff` | `(issueId, revision, store) => Promise<Result<InitialOrchestrationHandoffV1, IntakeFailure>>` | HDS02向けhandoff実体をIssue/revision一意keyで取得しsnapshot/policy freshnessを検証 | `U-ICN-011` | `HAC-HIL-01a` | supporting | `admitted` | `handoff_ready` | `HIL_INTAKE_HANDOFF_STALE` |

`validateIssueContractAdmission`は不足fieldのcanonical tokenを保持し、不要CLI/API/schema/dependency/configにはlocal cause
`HIL_UNJUSTIFIED_CAPABILITY`を併記する。minimality failureをfield欠落へ偽装せず、どちらもadmission 0とする。

## §2 schema

```ts
type IntakeIngressEnvelopeV1 =
  | UserChatIngressEnvelopeV1
  | GithubIngressEnvelopeV1
  | ProductIngressEnvelopeV1
  | ZipSourceIngressEnvelopeV1;

interface IntakeEnvelopeHeaderV1 {
  schema_version: "helix-intake-envelope.v1";
  ingress_kind: "user_chat" | "github" | "product" | "zip_source";
  source_event_id: string;
  source_schema_revision: string;
  operation_id: string;
  payload_digest: string;
  cause_id: string;
  received_at: string;
  actor_id: string;
  authority_class: "po" | "human" | "external" | "product" | "source";
  payload_artifact_ref: string;
  transport_metadata_digest: string;
}

interface AdmissionBundleV1 {
  schema_version: "helix-issue-admission-bundle.v1";
  envelope_digest: string;
  custody_receipt_digest: string;
  idempotency_reservation_digest: string;
  issue_contract: IssueContractV1;
  issue_contract_digest: string;
  route_receipt_digest: string;
  initial_cause_edge_digest: string;
  minimality_receipt_digest: string;
  initial_transition_digest: string;
  scope_budget_metadata_digest: string;
  operation_id: string;
  payload_digest: string;
  expected_operation_head: string;
  expected_issue_revision: number | null;
  initial_handoff: InitialOrchestrationHandoffV1;
}

interface IntakeConflictReceiptV1 {
  schema_version: "helix-intake-conflict.v1";
  operation_id: string;
  prior_payload_digest: string;
  candidate_payload_digest: string;
  prior_contract_digest: string;
  resolution_route: "manual_review" | "po_decision";
  conflict_event_digest: string;
}

interface InitialOrchestrationHandoffV1 {
  issue_id: string;
  issue_revision: number;
  admission_operation_id: string;
  initial_cause_edge_digest: string;
  initial_transition_digest: string;
  scope_budget_metadata_digest: string;
  contract_digest: string;
  route_digest: string;
  snapshot_digest: string;
  policy_revision_digest: string;
}

interface IntakeAdmissionStore {
  appendCustodyBeforeValidation(input: CustodyAppend): Promise<CustodyReceipt>;
  transactAdmission<T>(expectedOperationHead: string, expectedIssueRevision: number | null, fn: (tx: IntakeAdmissionTx) => Promise<T>): Promise<T>;
  readOperation(operationId: string): Promise<IntakeOperationState | null>;
  readAdmissionReceipt(operationId: string): Promise<AdmissionReceipt | null>;
  readInitialHandoff(issueId: string, revision: number): Promise<InitialOrchestrationHandoffV1 | null>;
  rebuildProjectionFromEvents(issueId: string): Promise<ProjectionDigest>;
}

```

IssueContractV1はL5 §3を正本とする。raw payload/body、secret、credential、未redact PII、executable command、自由形式tool argsを
AdmissionBundle/IssueContractへ持たせない。source固有unionはcommon headerと別schema revisionを持ち、unknown fieldはpolicyに従いrejectまたは
opaque extension digestへ隔離する。

## §3 不変条件

1. 4 ingressは全てuntrustedで、source固有metadataを維持したまま一つのIssueContractV1へ収束する。
2. custodyはclassify/route/admissionより先にappendされる。
3. operation ID＋payload digestが同じ再送はauthoritative副作用0、同operation異digestはconflictである。
4. receipt-level custodyは受信時に先行durable化し、admission transactionの外側で保持する。contract revision、route、initial cause/transition/budget metadata、handoff、admission receiptだけをNode transactionで全commitまたは全rollbackし、bundleはcurrent custody receiptを参照する。
5. 外部本文からcommand/prompt/task/tool dispatchを一件も生成しない。
6. contractはsource/cause/schema/authority/custody/route/budget/digestを欠かさない。
7. initial admission transitionはcause/previous digestへbindし、全loop state順序とbudget checkpointはHDS-HIL-02へ委譲する。
8. acceptanceに不要なCLI/API/schema/dependency/config/plugin surfaceを追加しない。

## §4 配置候補

| path候補 | 責務 |
|---|---|
| `src/schema/intake-contract.ts` | 4 envelope、Issue contract、admission/conflict、typed handoff型 |
| `src/intake/trust-boundary.ts` | trust分類、payload隔離、dispatch禁止 |
| `src/intake/envelope-normalizer.ts` | 4 union検証とcommon header生成 |
| `src/intake/idempotency.ts` | operation reservation、duplicate、conflict判定 |
| `src/intake/issue-contract.ts` | contract正規化、field/minimality検査 |
| `src/intake/route.ts` | authority付きroute決定 |
| `src/intake/admission.ts` | Node transaction、initial cause/transition/budget metadata、receiptの生成 |
| `src/state-db/intake-contract-projection.ts` | L5 §7 table projectionとrebuild |

## §5 完了境界

本slice所有L7 7件、L8 7件、HST-HIL-001所有7 caseのstate/token、HDS-HIL-02へのtyped handoff、4 ingress、HU-CAP-002 pinned source、minimality mutation、
別runtime reviewが揃うまでdraftとし、実装完了を主張しない。配置候補は新規surfaceを許可する指示ではなく、実装時に既存moduleへ
統合できる場合はScope Gateが狭い変更を優先する。

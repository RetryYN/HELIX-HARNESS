---
title: "HELIX L6 機能設計 — screen applicability prototype"
layer: L6
kind: add-design
status: draft
created: 2026-07-15
updated: 2026-07-15
owner: Codex / TL
plan: PLAN-L1-07-infinity-loop-platform-requirements
design_slice: HDS-HIL-15
related_l3: docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md
related_l4: docs/design/helix/L4-basic-design/infinity-loop-platform-basic-design.md
related_l5: docs/design/helix/L5-detail/screen-applicability-prototype.md
related_hst:
  - HST-HIL-012
  - HST-HIL-024
pair_artifact: docs/test-design/helix/L6-screen-applicability-prototype-unit-test-design.md
next_pair_freeze: L7
requirements:
  - HR-FR-HIL-15
  - HAC-HIL-15a
  - HAC-HIL-15b
  - HAC-HIL-15c
---

# HELIX L6 機能設計 — screen applicability prototype

## §0 型とauthority

pure APIはfilesystem、clock、DB、browserを直接読まず、versioned inputとtrusted receiptを受ける。writeはNode transaction port、
prototype builderはartifact proposal、人reviewはagreement inputだけを返す。

```ts
type ScreenRouteV1 = "prototype_required" | "not_applicable" | "deferred";
type SettledScreenRouteV1 = Exclude<ScreenRouteV1, "deferred">;
type PrototypeStateKindV1 = "empty" | "loading" | "loaded" | "partial" | "error" |
  "permission_denied" | "offline" | "conflict" | "completed";
type ScreenFailureV1 =
  | { code: "HIL_SCREEN_DECISION_MISSING" | "HIL_SCREEN_RECEIPT_STALE" | "HIL_SCREEN_SKIP_EVIDENCE_MISSING" | "HIL_SCREEN_DEFERRED_NOT_CLOSED" | "HIL_SCREEN_APPLICABILITY_INVALID" | "HIL_SCREEN_GATE_EVIDENCE_MISSING" | "HIL_SCREEN_IMPLICIT_SKIP"; evidence_digest: string }
  | { code: "HIL_PROTOTYPE_NOT_EXECUTABLE" | "HIL_PROTOTYPE_STATE_MISSING" | "HIL_PROTOTYPE_WALKTHROUGH_MISSING" | "HIL_PROTOTYPE_DELTA_MISSING" | "HIL_PROTOTYPE_BACKPROP_MISSING" | "HIL_PROTOTYPE_ARTIFACT_INCOMPLETE" | "HIL_WALKTHROUGH_RECEIPT_MISSING"; evidence_digest: string };
type ScreenResultV1<T> =
  | { ok: true; value: T }
  | { ok: false; failures: readonly ScreenFailureV1[] };
```

## §1 public API／DbCの契約

| API | 完全signature | DbC | 主U |
|---|---|---|---|
| `canonicalizeScreenScope` | `(raw: unknown, policy: ScreenPolicyV1) => ScreenResultV1<ScreenScopeSnapshotV1>` | scope/capability/phase/public surfaceをstable sortしdigest化 | `U-SAP-001` |
| `evaluateScreenApplicability` | `(scope: ScreenScopeSnapshotV1, rules: ScreenRuleSetV1) => ScreenResultV1<ScreenDecisionV1>` | UI有無をdeterministic評価、自由文/deferredをpassしない | `U-SAP-002` |
| `validateNoUiReceipt` | `(decision: ScreenDecisionV1, candidate: NoUiReceiptV1, trustedNow: string) => ScreenResultV1<NoUiReceiptV1>` | reason/actor/evidence/reentry/scope/rule/expiryを完全照合 | `U-SAP-003` |
| `evaluateScreenReentry` | `(prior: NoUiReceiptV1, current: ScreenScopeSnapshotV1) => ScreenResultV1<ReentryPlanV1>` | scope/capability/rule差でstale＋task一件 | `U-SAP-004` |
| `planPrototypeDiscovery` | `(decision: ScreenDecisionV1, requirements: ScreenRequirementV1[]) => ScreenResultV1<PrototypeTaskV1>` | prototype_requiredだけ、screen/interaction/state/data義務を全保持 | `U-SAP-005` |
| `validatePrototypeArtifact` | `(task: PrototypeTaskV1, manifest: PrototypeManifestV1, states: PrototypeStateFixtureV1[]) => ScreenResultV1<PrototypeReadyReceiptV1>` | executable/startup、trace、exact 9 state、digest/provenance必須 | `U-SAP-006` |
| `recordWalkthroughIteration` | `(artifact: PrototypeReadyReceiptV1, input: WalkthroughInputV1, prior: WalkthroughReceiptV1[]) => ScreenResultV1<WalkthroughReceiptV1>` | user actor、observation、delta/no_delta、target、rebuild、bounded iterationを検査 | `U-SAP-007` |
| `evaluatePrototypeAgreement` | `(artifact: PrototypeReadyReceiptV1, walkthrough: WalkthroughReceiptV1[], review: HumanReviewV1) => ScreenResultV1<PrototypeAgreementV1>` | latest artifact、complete walkthrough、人reviewを同digestへbind | `U-SAP-008` |
| `validateRequirementsBackprop` | `(agreement: PrototypeAgreementV1, l1Revision: RequirementRevisionV1) => ScreenResultV1<BackpropReceiptV1>` | 全delta dispositionまたはno_delta、revision trace必須 | `U-SAP-009` |
| `evaluateScreenFreeze` | `(scope: ScreenScopeSnapshotV1, decision: ScreenDecisionV1, skip: NoUiReceiptV1 | null, agreement: PrototypeAgreementV1 | null, backprop: BackpropReceiptV1 | null) => ScreenResultV1<ScreenGateReceiptV1>` | currentな二routeのexactly-oneをpure評価するcandidate生成だけ。gate write authorityは0 | `U-SAP-010` |
| `aggregatePlanScreenRoute` | `(scope: ScreenScopeSnapshotV1, decisions: ScreenDecisionV1[]) => ScreenResultV1<PlanScreenDecisionV1>` | capability ID exact set、全decision current/settled、set digest一致を要求し、一件でもUIならprototype_requiredを優先 | `U-SAP-012` |
| `commitPlanScreenRoute` | `(bundle: PlanScreenRouteCommitBundleV1, port: ScreenTransactionPortV1) => Promise<ScreenResultV1<PlanScreenRouteReceiptV1>>` | decision、PLAN aggregate、prototype task、stage projectionだけをCAS commitしgateを書かない | `U-SAP-012` |
| `commitStageClosureAndGate` | `(bundle: ScreenStageClosureCommitV1, store: ScreenApplicabilityStoreV1, trustedNow: string) => Promise<ScreenResultV1<ScreenStageReceiptV1>>` | current plan route後、UI/no-UI completion＋全authority exact setを検証し、唯一のgate write authorityでstageとpassed gateをatomic commit | `U-SAP-011` |

`U-SAP-012`は`aggregatePlanScreenRoute` → `commitPlanScreenRoute`のstable順exact function setを持つplan-route compositionである。
aggregate固有mutationはcapability ID exact set、decision current/settled、set digest、UI優先route、prototype task集合であり、commit固有mutationは
bundle/receipt、expected head、CAS、stage projection、port委譲回数、`gate_write_count=0`である。集約結果とその永続化を同じPLAN route identityで
採点し、gate authorityを持たない一つの外部observable transactionとして扱うため、別Uは追加しない。

## §2 schemaとtransaction port

```ts
interface ScreenDecisionV1 { decision_id: string; decision_revision: number; scope_digest: string; capability_id: string; phase: "L2"; status: "current" | "stale"; route: ScreenRouteV1; reason_code: string; evidence_digest: string; detector_id: string; detector_version: string; detector_result_digest: string; detector_provenance_digest: string; actor_id: string; rule_digest: string; reentry_trigger: string; decision_digest: string }
interface ScreenPolicyV1 { policy_id: string; revision: number; capability_ids: string[]; rule_set_digest: string }
interface ScreenScopeSnapshotV1 { snapshot_id: string; revision: number; capability_ids: string[]; phase: "L2"; public_surface_digest: string; scope_digest: string }
interface ScreenRuleSetV1 { rule_set_id: string; revision: number; rules_digest: string; authority_receipt_id: string }
interface ScreenRequirementV1 { requirement_id: string; revision: number; capability_id: string; screen_obligation_digest: string; interaction_obligation_digest: string; state_obligation_digest: string; data_obligation_digest: string }
interface PrototypeTaskV1 { task_id: string; capability_id: string; requirement_revision: number; obligation_digest: string; status: "planned" | "building" | "complete" }
interface PrototypeStateFixtureV1 { state: PrototypeStateKindV1; fixture_id: string; input_digest: string; expected_view_digest: string }
interface PrototypeReadyReceiptV1 { artifact_id: string; revision: number; manifest_digest: string; state_set_digest: string; capability_id: string; receipt_digest: string }
interface WalkthroughInputV1 { actor_id: string; artifact_revision: number; observation_digest: string; disposition: "delta" | "no_delta"; target_requirement_id: string | null }
interface WalkthroughReceiptV1 { receipt_id: string; artifact_id: string; iteration: number; actor_id: string; observation_digest: string; delta_digest: string | null; rebuilt_artifact_revision: number | null; receipt_digest: string }
interface HumanReviewV1 { reviewer_id: string; authority_receipt_id: string; artifact_revision: number; verdict: "approved" | "rejected"; review_digest: string }
interface PrototypeAgreementV1 { agreement_id: string; capability_id: string; artifact_revision: number; walkthrough_set_digest: string; review_digest: string; agreement_digest: string }
interface RequirementRevisionV1 { requirement_id: string; revision: number; content_digest: string; previous_revision: number | null }
interface BackpropReceiptV1 { receipt_id: string; agreement_id: string; from_requirement_revision: number; to_requirement_revision: number; delta_disposition_digest: string; receipt_digest: string }
interface ReentryPlanV1 { capability_id: string; stale_receipt_id: string; trigger_digest: string; task_id: string; expected_revision: number }
interface NoUiReceiptV1 { receipt_id: string; decision_id: string; decision_revision: number; capability_id: string; capability_revision: number; scope_digest: string; rule_digest: string; reason_code: string; evidence_digest: string; actor_id: string; reentry_trigger_digest: string; issued_at: string; expires_at: string; receipt_digest: string }
interface PrototypeManifestV1 { artifact_id: string; revision: number; executable_locator: string; content_digest: string; build_digest: string; startup_command_digest: string; startup_receipt_digest: string; manifest_digest: string; screen_trace_digest: string; interaction_trace_digest: string; state_trace_digest: string; data_trace_digest: string; temporary_data_boundary_digest: string; producer_digest: string }
interface PlanScreenDecisionV1 { snapshot_id: string; snapshot_revision: number; capability_ids: string[]; capability_set_digest: string; decision_ids: string[]; decision_aggregate_digest: string; route: SettledScreenRouteV1 }
interface ScreenGateReceiptV1 { gate_receipt_id: string; operation_id: string; operation_digest: string; commit_receipt_digest: string; before_revision: number; after_revision: number; event_head: string; snapshot_id: string; snapshot_revision: number; capability_set_digest: string; decision_aggregate_digest: string; route: SettledScreenRouteV1; skip_digest: string | null; agreement_digest: string | null; l1_revision: number; verdict: "passed" | "failed"; failure_codes: ScreenFailureV1["code"][] }
type ScreenAppendStepV1 = "decision" | "no_ui_receipt" | "artifact_state_set" | "walkthrough" | "backprop" | "agreement" | "decision_stale" | "skip_stale" | "artifact_stale" | "walkthrough_stale" | "agreement_stale" | "gate_stale" | "process_event" | "prototype_task" | "projection" | "gate_receipt";
interface ScreenOperationEnvelopeV1 { operation_id: string; operation_digest: string; snapshot_id: string; capability_set_digest: string; expected_snapshot_revision: number; expected_subject_revisions: Record<string, number>; append_order: ScreenAppendStepV1[]; write_set: { table: string; key: string; action: "insert" | "update" }[]; write_set_digest: string }
interface SkipCommitBundleV1 extends ScreenOperationEnvelopeV1 { kind: "skip"; append_order: ["decision", "no_ui_receipt", "process_event", "projection"]; decision: ScreenDecisionV1; skip: NoUiReceiptV1 }
interface AgreementCommitBundleV1 extends ScreenOperationEnvelopeV1 { kind: "agreement"; append_order: ["artifact_state_set", "walkthrough", "backprop", "agreement", "process_event", "projection"]; artifact: PrototypeReadyReceiptV1; walkthrough: WalkthroughReceiptV1[]; backprop: BackpropReceiptV1; agreement: PrototypeAgreementV1 }
interface ReentryCommitBundleV1 extends ScreenOperationEnvelopeV1 { kind: "reentry"; prior_decision_ids: string[]; stale_subject_ids: string[]; task: PrototypeTaskV1 }
interface PrototypeCapabilityCompletionV1 { capability_id: string; task: PrototypeTaskV1; agreement: PrototypeAgreementV1; backprop: BackpropReceiptV1; completion_digest: string }
interface PlanScreenRouteCommitBundleV1 extends ScreenOperationEnvelopeV1 { kind: "plan_screen_route"; append_order: ["decision", "prototype_task", "process_event", "projection"]; decisions: ScreenDecisionV1[]; plan: PlanScreenDecisionV1; prototype_tasks: PrototypeTaskV1[] }
interface PlanScreenRouteReceiptV1 { plan_route_receipt_id: string; operation_id: string; snapshot_id: string; snapshot_revision: number; capability_set_digest: string; decision_aggregate_digest: string; route: SettledScreenRouteV1; prototype_task_set_digest: string; stage_head: string; receipt_digest: string; gate_write_count: 0 }
interface ScreenCommitReceiptV1 { operation_id: string; operation_digest: string; before_revision: number; after_revision: number; event_sequence: number; write_set_digest: string; counts: Record<string, { inserted: number; updated: number }> }
interface ScreenTransactionPortV1 { commitSkip(bundle: SkipCommitBundleV1): Promise<ScreenResultV1<ScreenCommitReceiptV1>>; commitAgreement(bundle: AgreementCommitBundleV1): Promise<ScreenResultV1<ScreenCommitReceiptV1>>; staleForReentry(bundle: ReentryCommitBundleV1): Promise<ScreenResultV1<ReentryPlanV1 & { commit_receipt: ScreenCommitReceiptV1 }>>; commitPlanScreenRoute(bundle: PlanScreenRouteCommitBundleV1): Promise<ScreenResultV1<PlanScreenRouteReceiptV1>> }
```

append順はskip=`decision,no_ui_receipt,process_event,projection`、agreement=
`artifact_state_set,walkthrough,backprop,agreement,process_event,projection`、reentry=
`decision_stale,skip_stale,artifact_stale,walkthrough_stale,agreement_stale,gate_stale,process_event,prototype_task,projection`のexact sequenceとする。
portはexpected revisionをCASし、同operation同digestは元receipt＋全count 0、異digest/revision conflict/各append faultはrollbackして全count 0にする。
plan routeのappend順は`decision -> prototype_task -> process_event -> projection`とし、decisionはcapability ID順、
prototype taskはUI capability ID順で固定する。全decision集合とPLAN aggregate、task setだけを同一operation digestへbindし、
`gate_write_count=0`を型と実測で要求する。passed gateは後続`commitStageClosureAndGate`だけが書く。

## §3 canonical assertion primary表

| HST正本 | 主API | 主U | supporting主IT | pre_state | expected_state | failure正本 |
|---|---|---|---|---|---|---|
| `HST-CASE-012-01` | `evaluateScreenApplicability` | `U-SAP-002` | `IT-SAP-001` | `undecided` | `not_applicable` | `なし（正常系）` |
| `HST-CASE-012-02` | `evaluateScreenFreeze` | `U-SAP-010` | `IT-SAP-002` | `undecided` | `undecided` | `HIL_SCREEN_DECISION_MISSING` |
| `HST-CASE-012-03` | `evaluateScreenReentry` | `U-SAP-004` | `IT-SAP-003` | `not_applicable` | `stale` | `HIL_SCREEN_RECEIPT_STALE` |
| `HST-CASE-012-04` | `validateNoUiReceipt` | `U-SAP-003` | `IT-SAP-002` | `undecided` | `undecided` | `HIL_SCREEN_SKIP_EVIDENCE_MISSING` |
| `HST-CASE-012-05` | `evaluateScreenFreeze` | `U-SAP-010` | `IT-SAP-002` | `deferred` | `deferred` | `HIL_SCREEN_DEFERRED_NOT_CLOSED` |
| `HST-CASE-012-06` | `evaluateScreenApplicability` | `U-SAP-002` | `IT-SAP-004` | `undecided` | `prototype_required` | `なし（正常系）` |
| `HST-CASE-012-07` | `evaluateScreenFreeze` | `U-SAP-010` | `IT-SAP-002` | `assertion_input_ready` | `assertion_pass` | `HIL_SCREEN_DECISION_MISSING` |
| `HST-CASE-012-08` | `evaluateScreenApplicability` | `U-SAP-002` | `IT-SAP-004` | `assertion_input_ready` | `assertion_pass` | `HIL_SCREEN_APPLICABILITY_INVALID` |
| `HST-CASE-012-09` | `evaluateScreenFreeze` | `U-SAP-010` | `IT-SAP-002` | `assertion_input_ready` | `assertion_pass` | `HIL_SCREEN_GATE_EVIDENCE_MISSING` |
| `HST-CASE-012-10` | `evaluateScreenFreeze` | `U-SAP-010` | `IT-SAP-002` | `assertion_input_ready` | `assertion_pass` | `HIL_SCREEN_IMPLICIT_SKIP` |
| `HST-CASE-024-01` | `evaluatePrototypeAgreement` | `U-SAP-008` | `IT-SAP-007` | `prototype_ready` | `agreement_ready` | `なし（正常系）` |
| `HST-CASE-024-02` | `validatePrototypeArtifact` | `U-SAP-006` | `IT-SAP-005` | `prototype_required` | `prototype_required` | `HIL_PROTOTYPE_NOT_EXECUTABLE` |
| `HST-CASE-024-03` | `validatePrototypeArtifact` | `U-SAP-006` | `IT-SAP-006` | `building` | `building` | `HIL_PROTOTYPE_STATE_MISSING` |
| `HST-CASE-024-04` | `evaluatePrototypeAgreement` | `U-SAP-008` | `IT-SAP-007` | `prototype_ready` | `prototype_ready` | `HIL_PROTOTYPE_WALKTHROUGH_MISSING` |
| `HST-CASE-024-05` | `recordWalkthroughIteration` | `U-SAP-007` | `IT-SAP-008` | `walking` | `walking` | `HIL_PROTOTYPE_DELTA_MISSING` |
| `HST-CASE-024-06` | `validateRequirementsBackprop` | `U-SAP-009` | `IT-SAP-008` | `walkthrough_complete` | `walkthrough_complete` | `HIL_PROTOTYPE_BACKPROP_MISSING` |
| `HST-CASE-024-07` | `validatePrototypeArtifact` | `U-SAP-006` | `IT-SAP-005` | `assertion_input_ready` | `assertion_pass` | `HIL_PROTOTYPE_ARTIFACT_INCOMPLETE` |
| `HST-CASE-024-08` | `recordWalkthroughIteration` | `U-SAP-007` | `IT-SAP-007` | `assertion_input_ready` | `assertion_pass` | `HIL_WALKTHROUGH_RECEIPT_MISSING` |

`HST-CASE-012-06`の状態遷移authorityは`evaluateScreenApplicability`である。`planPrototypeDiscovery`／`U-SAP-005`は
`prototype_required`確定後に設計義務からtask一件を生成するsupporting oracle/evidence edgeであり、system正本の期待evidenceを
同じ`IT-SAP-004` compositionで閉じる。primary Uにはせず、`undecided`からの遷移証拠へ算入しない。
`canonicalizeScreenScope`／`U-SAP-001`は同compositionの先頭supporting oracleであり、`IT-SAP-004`と
`HST-CASE-012-08`へreverse joinする。exact function setは`canonicalizeScreenScope` → `evaluateScreenApplicability` →
`planPrototypeDiscovery`で、scope正規化、route遷移、task生成のmutation laneを分離する。primary U/HST分母は変更しない。

## §4 完了境界

L7 12/12とL8 9/9、canonical 18/18、typed failure、mixed capability、transaction fault、人review evidenceが揃うまでdraftとする。

## §5 no-UI完了schema

```ts
interface NoUiCapabilityCompletionV1 { capability_id: string; capability_revision: number; capability_digest: string; applicability_decision_id: string; applicability_decision_revision: number; applicability_rule_id: string; applicability_rule_revision: number; applicability_rule_digest: string; scope_digest: string; requirement_obligation_digest: string; design_obligation_digest: string; test_obligation_digest: string; skip_receipt_id: string; skip_receipt_digest: string; authority_receipt_id: string; authority_receipt_digest: string; expected_authority_head: string; issued_at: string; expires_at: string; reentry_trigger_digest: string }
interface NoUiSkipAuthorityV1 { authority_receipt_id: string; skip_receipt_id: string; skip_receipt_digest: string; decision_id: string; decision_revision: number; current_authority_head: string; receipt_digest: string }
interface UiCapabilityCompletionV1 { capability_id: string; agreement_receipt_id: string; agreement_receipt_digest: string; agreement_authority_receipt_id: string; agreement_authority_receipt_digest: string; expected_agreement_authority_head: string; backprop_receipt_id: string; backprop_receipt_digest: string; backprop_authority_receipt_id: string; backprop_authority_receipt_digest: string; expected_backprop_authority_head: string; from_requirement_revision: number; to_requirement_revision: number; completion_digest: string }
interface CurrentAgreementAuthorityV1 { authority_receipt_id: string; authority_receipt_digest: string; receipt: PrototypeAgreementV1; canonical_bytes: string; current_authority_head: string; status: "current" }
interface CurrentBackpropAuthorityV1 { authority_receipt_id: string; authority_receipt_digest: string; receipt: BackpropReceiptV1; canonical_bytes: string; current_authority_head: string; status: "current" }
interface ScreenStageClosureV1 { denominator_revision: number; denominator_capability_ids: string[]; ui_capability_ids: string[]; no_ui_completions: NoUiCapabilityCompletionV1[]; ui_completions: UiCapabilityCompletionV1[]; agreement_receipt_exact_set_digest: string; backprop_receipt_exact_set_digest: string; stage_receipt_digest: string }
interface ScreenStageClosureCommitV1 { operation_id: string; operation_digest: string; plan_route_receipt: PlanScreenRouteReceiptV1; closure: ScreenStageClosureV1; gate: ScreenGateReceiptV1; expected_stage_head: string; expected_gate_head: string; exact_write_set: { table: string; key: string; action: "insert" | "update" }[]; append_order: ["stage_completion", "stage_projection", "gate_receipt", "terminal_receipt"]; write_set_digest: string }
interface ScreenStageReceiptV1 { operation_id: string; operation_digest: string; denominator_revision: number; before_stage_head: string; after_stage_head: string; before_gate_head: string; after_gate_head: string; closure_digest: string; gate_receipt_digest: string; status: "committed"; inserted_completion_count: number; write_set_digest: string }
interface ScreenApplicabilityStoreV1 {
  gate_write_authority: "screen_stage_closure_store";
  readPlanRouteReceipt(receiptId: string, expectedStageHead: string): Promise<ScreenResultV1<PlanScreenRouteReceiptV1>>;
  readSkipReceipt(receiptId: string, trustedNow: string): Promise<ScreenResultV1<NoUiReceiptV1>>;
  readSkipAuthority(authorityReceiptId: string, expectedAuthorityHead: string, trustedNow: string): Promise<ScreenResultV1<NoUiSkipAuthorityV1>>;
  readAgreementAuthority(authorityReceiptId: string, expectedReceiptId: string, expectedReceiptDigest: string, expectedAuthorityHead: string, trustedNow: string): Promise<ScreenResultV1<CurrentAgreementAuthorityV1>>;
  readBackpropAuthority(authorityReceiptId: string, expectedReceiptId: string, expectedReceiptDigest: string, expectedAuthorityHead: string, trustedNow: string): Promise<ScreenResultV1<CurrentBackpropAuthorityV1>>;
  validateAgreementBackpropPair(agreement: PrototypeAgreementV1, backprop: BackpropReceiptV1, completion: UiCapabilityCompletionV1): Promise<ScreenResultV1<UiCapabilityCompletionV1>>;
  commitStageClosureAndGate(bundle: ScreenStageClosureCommitV1): Promise<ScreenResultV1<ScreenStageReceiptV1>>;
}
```

`NoUiCapabilityCompletionV1.applicability_decision_id/revision`と`NoUiReceiptV1.decision_id/revision`は、対応する
`ScreenDecisionV1.decision_id/revision`を名称付きFKとして投影した同一identityであり、completion/receipt側でrevisionを採番しない。
storeは3者のID/revision exact equalityを検査してから固定分母のUI/no-UI disjoint exact setを再導出し、各skip receiptのcapability/rule/scope/revision/digest/freshness、
各UI completionのagreement/backprop authority receipt ID/digest、expected current head、canonical current receipt、trustedNow freshness、
requirement revision連鎖を照合する。stale/superseded authorityやcaller receipt swapは受理しない。stage closureとgate receiptは同じ
operation、CAS、exact write-setでatomic commitする。`ScreenApplicabilityStoreV1.commitStageClosureAndGate`だけがgate rowへのwrite authorityを持ち、
plan route、skip、agreement portのgate writeは型上0とする。current plan routeより先のgate commit、同operationの二重gate、順序逆転、
caller集計、agreement/backprop/skip authority swap、stale、CAS、各append faultではstage/gate増分0とする。

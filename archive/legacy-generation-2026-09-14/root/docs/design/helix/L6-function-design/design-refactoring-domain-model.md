---
title: "HELIX L6 機能設計 — design refactoring domain model"
layer: L6
kind: add-design
status: draft
created: 2026-07-15
updated: 2026-07-15
owner: Codex / TL
plan: PLAN-L1-07-infinity-loop-platform-requirements
design_slice: HDS-HIL-16
related_l3: docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md
related_l4: docs/design/helix/L4-basic-design/infinity-loop-platform-basic-design.md
related_hst: [HST-HIL-025, HST-HIL-026]
related_l5: docs/design/helix/L5-detail/design-refactoring-domain-model.md
pair_artifact: docs/test-design/helix/L6-design-refactoring-domain-model-unit-test-design.md
next_pair_freeze: L7
requirements: [HR-FR-HIL-16, HAC-HIL-16a, HAC-HIL-16b, HAC-HIL-16c]
---

# HELIX L6 機能設計 — design refactoring domain model

## §0 typed contractの型定義

```ts
type DesignTransformV1 = "externalize" | "commonize" | "objectize" | "semantic_rename";
type DomainRoleV1 = "Entity" | "ValueObject" | "Aggregate" | "DomainService" | "Policy" | "Specification" | "Command" | "Query" | "DomainEvent" | "Receipt" | "Port" | "Adapter" | "Repository";
type TraceTargetKindV1 = "requirement" | "service" | "domain_object" | "template_obligation" | "unit_oracle" | "integration_oracle" | "implementation_symbol";
type DesignDomainFailureCodeV1 =
  | "HIL_DESIGN_REFACTOR_BEHAVIOR_CHANGED" | "HIL_DESIGN_REFACTOR_RETROFIT_REQUIRED" | "HIL_DESIGN_REFACTOR_NAME_ONLY"
  | "HIL_DESIGN_REFACTOR_CONSUMER_MISSING" | "HIL_DESIGN_REFACTOR_ROLLBACK_MISSING" | "HIL_DESIGN_REFACTOR_UNJUSTIFIED"
  | "HIL_DESIGN_REFACTOR_ROUTE_INVALID" | "HIL_DESIGN_REFACTOR_INVARIANT_BROKEN" | "HIL_DOMAIN_ENTITY_IDENTITY_MISSING"
  | "HIL_DOMAIN_VALUE_OBJECT_MUTABLE" | "HIL_DOMAIN_AGGREGATE_ROOT_MISSING" | "HIL_DOMAIN_SERVICE_RESPONSIBILITY_MISSING"
  | "HIL_DOMAIN_POLICY_AUTHORITY_MISSING" | "HIL_DOMAIN_SPECIFICATION_SIDE_EFFECT" | "HIL_DOMAIN_COMMAND_INTENT_MISSING"
  | "HIL_DOMAIN_QUERY_SIDE_EFFECT" | "HIL_DOMAIN_EVENT_NOT_COMPLETED_FACT" | "HIL_DOMAIN_RECEIPT_PROVENANCE_MISSING"
  | "HIL_DOMAIN_PORT_DEPENDENCY_INVERTED" | "HIL_DOMAIN_ADAPTER_PORT_MISSING" | "HIL_DOMAIN_REPOSITORY_AGGREGATE_MISSING"
  | "HIL_DOMAIN_NAME_AMBIGUOUS" | "HIL_DOMAIN_PUBLIC_RENAME_REDESIGN" | "HIL_DOMAIN_PERSISTED_RENAME_RETROFIT"
  | "HIL_DOMAIN_ORACLE_PRIVATE_SYMBOL_BOUND" | "HIL_DOMAIN_CANONICAL_TERM_CONFLICT" | "HIL_DOMAIN_MODEL_CONTRACT_INVALID"
  | "HIL_DESIGN_DOMAIN_INTERNAL_ERROR";
interface DesignDomainFailureV1 { code: DesignDomainFailureCodeV1; subject_id: string; evidence_digest: string; route?: "Refactor" | "Redesign" | "Retrofit" }
type DesignDomainResultV1<T> =
  | { ok: true; value: T }
  | { ok: false; failures: readonly DesignDomainFailureV1[] };
interface TrustedExecutionResultBindingV1 { result_bytes_digest: string; observable_bytes_digest: string; behavior_signature_digest: string; target_commit_digest: string }
interface TrustedExecutionReceiptV1 { receipt_id: string; receipt_revision: number; producer_id: string; producer_version: string; execution_identity_digest: string; result_binding: TrustedExecutionResultBindingV1; commit_head: string; event_head: string; executed_at: string; issued_at: string; fresh_until: string; supersedes_receipt_revision: number | null; supersession_terminal: boolean; receipt_bytes_digest: string }
interface ObservableSnapshotV1 { observable_digest: string; graph_revision: number; provenance_digest: string; execution_receipt: TrustedExecutionReceiptV1 }
interface OracleResultV1 { oracle_id: string; result_digest: string; graph_revision: number; provenance_digest: string; execution_receipt: TrustedExecutionReceiptV1 }
interface OracleTrustContextV1 { current_graph_revision: number; trusted_now: string; allowed_producer_ids: string[]; expected_event_head: string; receipt_store: TrustedExecutionReceiptStoreV1 }
interface DesignSubjectV1 { subject_id: string; revision: number; kind: string; content_digest: string }
interface DesignGraphV1 { graph_id: string; revision: number; node_ids: string[]; edge_digest: string }
interface SemanticSignatureV1 { signature_digest: string; input_digest: string; output_digest: string; effect_digest: string; failure_digest: string; state_digest: string; oracle_digest: string }
interface CandidateV1 { candidate_id: string; subject_id: string; transform: DesignTransformV1; evidence_digest: string }
interface AcceptedCandidateV1 { candidate_id: string; authority_receipt_id: string; scope_digest: string; signature_digest: string }
interface ScopeAuthorityV1 { authority_receipt_id: string; subject_ids: string[]; issued_at: string; fresh_until: string }
interface RefactorClassificationV1 { candidate_id: string; transform: DesignTransformV1; classification_digest: string }
interface ConsumerContractV1 { consumer_id: string; subject_id: string; contract_digest: string; oracle_id: string }
interface ConsumerResultV1 { consumer_id: string; result_digest: string; passed: boolean; execution_receipt_id: string }
interface SemanticEquivalenceV1 { before_signature_digest: string; after_signature_digest: string; difference_set: string[]; equivalent: boolean }
interface ResponsibilityBoundaryV1 { owner_id: string; state_digest: string; invariant_digest: string; authority_digest: string; lifecycle_digest: string }
interface NamingCatalogV1 { catalog_id: string; revision: number; term_digest: string }
interface RefactorStepV1 { step_id: string; candidate_id: string; transform: DesignTransformV1; precondition_digest: string; postcondition_digest: string; rollback_digest: string }
interface BehaviorReceiptV1 { before_digest: string; after_digest: string; oracle_set_digest: string; behavior_signature_digest: string; passed: boolean }
interface CoverageReceiptV1 { expected_consumer_ids: string[]; actual_consumer_ids: string[]; result_set_digest: string; passed: boolean }
interface DesignDeltaV1 { subject_id: string; behavior_changed: boolean; public_contract_changed: boolean; persisted_schema_changed: boolean; requirement_changed: boolean; delta_digest: string }
interface PairReceiptV1 { pair_id: string; left_digest: string; right_digest: string; status: "current" | "stale" }
interface RollbackTargetV1 { target_id: string; revision: number; content_digest: string }
interface RefactorPlanV1 { plan_id: string; candidate_id: string; step_ids: string[]; consumer_ids: string[]; oracle_ids: string[]; authority_receipt_id: string }
interface FencedPlanV1 { plan_id: string; pair_receipt_ids: string[]; rollback_target_id: string; fence_digest: string }
interface DomainSchemaV1 { schema_id: string; revision: number; allowed_roles: DomainRoleV1[]; schema_digest: string }
interface DomainObjectVersionV1 { object_id: string; revision: number; role: DomainRoleV1; name: string; identity_digest: string; invariant_digest: string; authority_digest: string; status: "current" | "superseded" }
interface RoleInvariantReceiptV1 { object_id: string; revision: number; role: DomainRoleV1; invariant_digest: string; passed: boolean }
interface DomainRelationV1 { relation_id: string; source_object_id: string; target_object_id: string; relation: "depends_on" | "implements" | "persists"; direction_digest: string }
interface DependencyReceiptV1 { object_ids: string[]; relation_ids: string[]; graph_digest: string; passed: boolean }
interface TermCatalogV1 { catalog_id: string; revision: number; canonical_terms: Record<string, string>; catalog_digest: string }
interface NamingDecisionV1 { decision_id: string; object_id: string; canonical_name: string; term_catalog_revision: number; evidence_digest: string }
interface SymbolEdgeV1 { edge_id: string; object_id: string; symbol_id: string; symbol_visibility: "public" | "internal" | "private"; symbol_digest: string }
interface OracleEdgeV1 { edge_id: string; object_id: string; oracle_id: string; behavior_signature_digest: string; oracle_digest: string }
interface TraceBindingV1 { binding_id: string; object_id: string; target_kind: TraceTargetKindV1; symbol_edge_id: string; oracle_edge_id: string; binding_digest: string }
interface DesignDomainEventV1 { event_id: string; operation_id: string; sequence: number; event_type: "bundle_committed" | "bundle_rejected"; payload_digest: string; previous_event_head: string; event_head: string }
interface DesignDomainProjectionV1 { graph_id: string; graph_revision: number; catalog_revision: number; object_root_digest: string; relation_root_digest: string; trace_root_digest: string; event_head: string }
```

failure codeはL5 §5の34行にあるexact unionだけをknown failureとして許可し、unknownはcause digest付き
`HIL_DESIGN_DOMAIN_INTERNAL_ERROR`へ境界変換する。

## §1 public API／DbCの契約

| API | 完全signature | DbC | 主U |
|---|---|---|---|
| `buildDesignSemanticSignature` | `(subject: DesignSubjectV1, graph: DesignGraphV1) => DesignDomainResultV1<SemanticSignatureV1>` | I/O、副作用、failure、state、call graph、consumer/oracleをcanonical化 | `U-DRDM-001` |
| `classifyDesignRefactorCandidate` | `(candidate: CandidateV1, signature: SemanticSignatureV1, authority: ScopeAuthorityV1) => DesignDomainResultV1<RefactorClassificationV1>` | lexical/future-useをrejectしone transformへ分類 | `U-DRDM-002` |
| `planExternalize` | `(candidate: AcceptedCandidateV1, consumers: ConsumerContractV1[]) => DesignDomainResultV1<RefactorStepV1>` | policy owner/validation boundaryを維持 | `U-DRDM-003` |
| `planCommonize` | `(candidate: AcceptedCandidateV1, equivalence: SemanticEquivalenceV1) => DesignDomainResultV1<RefactorStepV1>` | 全consumer semantic同等と差分吸収規則 | `U-DRDM-004` |
| `planObjectize` | `(candidate: AcceptedCandidateV1, ownership: ResponsibilityBoundaryV1) => DesignDomainResultV1<RefactorStepV1>` | responsibility/state/invariant/authority/lifecycleを一ownerへ | `U-DRDM-005` |
| `planSemanticRename` | `(candidate: AcceptedCandidateV1, naming: NamingCatalogV1) => DesignDomainResultV1<RefactorStepV1>` | lexical distance単独禁止、stable oracle/object ID | `U-DRDM-006` |
| `validateBehaviorPreservation` | `(before: ObservableSnapshotV1, after: ObservableSnapshotV1, oracles: OracleResultV1[], trust: OracleTrustContextV1) => DesignDomainResultV1<BehaviorReceiptV1>` | observable digest、provenance、current graph revision、登録execution receipt、freshnessと全oracle一致 | `U-DRDM-007` |
| `validateConsumerCompatibility` | `(step: RefactorStepV1, expected: ConsumerContractV1[], actual: ConsumerResultV1[]) => DesignDomainResultV1<CoverageReceiptV1>` | expected=actualの完全集合、100% passを検査 | `U-DRDM-008` |
| `routeDesignDelta` | `(delta: DesignDeltaV1) => DesignDomainResultV1<"Refactor" | "Redesign" | "Retrofit">` | behavior/public/requirementはRedesign、persistedはRetrofit | `U-DRDM-009` |
| `validateRefactorFence` | `(plan: RefactorPlanV1, pairs: PairReceiptV1[], rollback: RollbackTargetV1) => DesignDomainResultV1<FencedPlanV1>` | consumer/pair/oracle/authority/rollback必須 | `U-DRDM-010` |
| `parseDomainObjectVersion` | `(raw: unknown, catalog: DomainSchemaV1) => DesignDomainResultV1<DomainObjectVersionV1>` | 13 role、unknown field拒否、stable object/revision | `U-DRDM-011` |
| `validateDomainRoleInvariant` | `(object: DomainObjectVersionV1) => DesignDomainResultV1<RoleInvariantReceiptV1>` | role固有identity/mutability/root/authority/side-effect等を検査 | `U-DRDM-012` |
| `validateDomainDependencyDirection` | `(objects: DomainObjectVersionV1[], relations: DomainRelationV1[]) => DesignDomainResultV1<DependencyReceiptV1>` | domain→Port、Adapter→Port、Repository→Aggregateの方向を検査 | `U-DRDM-013` |
| `decideCanonicalDomainName` | `(object: DomainObjectVersionV1, signature: SemanticSignatureV1, terms: TermCatalogV1) => DesignDomainResultV1<NamingDecisionV1>` | ambiguous/conflictをreject、同義統一/異義分離 | `U-DRDM-014` |
| `bindDomainSymbolAndOracle` | `(object: DomainObjectVersionV1, symbol: SymbolEdgeV1, oracle: OracleEdgeV1) => DesignDomainResultV1<TraceBindingV1>` | edge分離、private symbolだけへのoracle bind禁止 | `U-DRDM-015` |
| `commitDesignDomainBundle` | `(bundle: DesignDomainBundleV1, port: DesignDomainTransactionPortV1) => Promise<DesignDomainResultV1<CommitReceiptV1>>` | version/relation/trace/name/eventをall-or-nothing CAS | `U-DRDM-016` |
| `validateOracleTrustBinding` | `(oracles: OracleResultV1[], trust: OracleTrustContextV1) => DesignDomainResultV1<TrustedOracleSetV1>` | producer/provenance/graph revision/registered receipt/freshnessをexact照合 | `U-DRDM-017` |
| `commitRefactorPlanFence` | `(bundle: RefactorPlanFenceBundleV1, port: RefactorPlanFenceTransactionPortV1, graphStore: DesignGraphSnapshotStoreV1, oracleStore: TrustedOracleAuthorityStoreV1, scopeStore: ScopeAuthorityStoreV1, trustedNow: string) => Promise<DesignDomainResultV1<RefactorPlanFenceReceiptV1>>` | 3 authority storeのcurrent head/canonical bytesとcaller snapshot/oracle/Scope Authorityをexact照合後、plan substanceを同一CASでfence | `U-DRDM-018` |
| `commitRefactorTransformVerification` | `(bundle: RefactorTransformVerificationBundleV1, port: RefactorTransformVerificationTransactionPortV1, fenceStore: RefactorFenceReceiptStoreV1) => Promise<DesignDomainResultV1<RefactorTransformVerificationReceiptV1>>` | current fence receiptとcandidate/plan/stepを再照合しconsumer/pair/behavior/rollback/refactor/eventを同一CASでverified化 | `U-DRDM-019` |

## §2 bundle／transaction port契約

```ts
type DesignDomainAppendStepV1 = "object_versions" | "relations" | "trace_edges" | "naming_decisions" | "design_domain_event" | "projection" | "commit_receipt";
interface DesignDomainBundleV1 {
  operation_id: string; operation_digest: string; graph_id: string; expected_graph_revision: number;
  catalog_id: string; expected_catalog_revision: number; append_order: DesignDomainAppendStepV1[];
  write_set: { table: string; key: string; action: "insert" | "update" }[]; write_set_digest: string;
  object_versions: DomainObjectVersionV1[]; relations: DomainRelationV1[]; trace_edges: TraceBindingV1[];
  naming_decisions: NamingDecisionV1[]; event: DesignDomainEventV1; projection: DesignDomainProjectionV1;
}
interface CommitReceiptV1 {
  operation_id: string; operation_digest: string; before_graph_revision: number; after_graph_revision: number;
  before_catalog_revision: number; after_catalog_revision: number; event_sequence: number; write_set_digest: string;
  oracle_bindings: { oracle_id: string; result_digest: string; observable_digest: string; execution_receipt_digest: string }[];
  oracle_binding_digest: string;
  counts: Record<DesignDomainAppendStepV1, { inserted: number; updated: number }>;
}
interface DesignDomainTransactionPortV1 { commit(bundle: DesignDomainBundleV1): Promise<DesignDomainResultV1<CommitReceiptV1>> }

interface RefactorPlanFenceBundleV1 {
  operation_id: string; operation_digest: string; candidate: AcceptedCandidateV1; plan: RefactorPlanV1;
  current_snapshot: DesignGraphV1; current_snapshot_digest: string; trusted_oracle_set: TrustedOracleSetV1;
  scope_authority_receipt: ScopeAuthorityV1; expected_graph_head: string; expected_oracle_authority_head: string; expected_scope_authority_head: string;
  steps: RefactorStepV1[]; consumers: ConsumerContractV1[]; pair_receipts: PairReceiptV1[];
  rollback: RollbackTargetV1; expected_plan_head: string;
  exact_write_set: { table: string; key: string; action: "insert" | "update" }[];
  append_order: ["current_snapshot", "scope_authority", "trusted_oracle_set", "candidate", "plan", "steps", "consumer_set", "pair_set", "rollback", "fence_receipt"];
  write_set_digest: string;
}
interface RefactorPlanFenceReceiptV1 { fence_receipt_id: string; operation_id: string; operation_digest: string; candidate_id: string; plan_id: string; step_set_digest: string; before_plan_head: string; after_plan_head: string; current_fence_head: string; fence_digest: string; receipt_digest: string; write_set_digest: string; status: "fenced" }
interface DesignGraphSnapshotStoreV1 { readCurrent(graphId: string, expectedGraphHead: string): Promise<DesignDomainResultV1<{ snapshot: DesignGraphV1; snapshot_digest: string; current_graph_head: string; canonical_bytes: string }>> }
interface TrustedOracleAuthorityStoreV1 { readCurrent(oracleSetId: string, expectedAuthorityHead: string, trustedNow: string): Promise<DesignDomainResultV1<{ oracle_set: TrustedOracleSetV1; current_authority_head: string; canonical_bytes: string }>> }
interface ScopeAuthorityStoreV1 { readCurrent(receiptId: string, expectedAuthorityHead: string, trustedNow: string): Promise<DesignDomainResultV1<{ authority: ScopeAuthorityV1; canonical_bytes: string; current_authority_head: string }>> }
interface RefactorPlanFenceTransactionPortV1 { commitFence(bundle: RefactorPlanFenceBundleV1, graphStore: DesignGraphSnapshotStoreV1, oracleStore: TrustedOracleAuthorityStoreV1, scopeStore: ScopeAuthorityStoreV1, trustedNow: string): Promise<DesignDomainResultV1<RefactorPlanFenceReceiptV1>> }

interface RefactorTransformVerificationBundleV1 {
  operation_id: string; operation_digest: string; candidate: AcceptedCandidateV1; fenced_plan: FencedPlanV1;
  fence_receipt: RefactorPlanFenceReceiptV1; expected_current_fence_head: string;
  steps: RefactorStepV1[]; consumer_checks: ConsumerResultV1[]; pair_receipts: PairReceiptV1[];
  behavior_receipt: BehaviorReceiptV1; rollback: RollbackTargetV1; refactor_receipt: CommitReceiptV1;
  event: DesignDomainEventV1;
  expected_verification_head: string;
  exact_write_set: { table: string; key: string; action: "insert" | "update" }[];
  append_order: ["candidate", "fenced_plan", "fence_receipt", "steps", "consumer_checks", "pair_set", "behavior", "rollback", "refactor_receipt", "design_domain_event", "verification_receipt"];
  write_set_digest: string;
}
interface RefactorTransformVerificationReceiptV1 { operation_id: string; operation_digest: string; plan_id: string; fence_receipt_id: string; fence_receipt_digest: string; source_fence_head: string; before_verification_head: string; after_verification_head: string; consumer_set_digest: string; pair_set_digest: string; behavior_digest: string; rollback_digest: string; refactor_receipt_digest: string; status: "verified" }
interface RefactorFenceReceiptStoreV1 { readCurrent(receiptId: string, expectedFenceHead: string): Promise<DesignDomainResultV1<{ receipt: RefactorPlanFenceReceiptV1; canonical_bytes: string; current_fence_head: string }>> }
interface RefactorTransformVerificationTransactionPortV1 { commitVerification(bundle: RefactorTransformVerificationBundleV1, fenceStore: RefactorFenceReceiptStoreV1): Promise<DesignDomainResultV1<RefactorTransformVerificationReceiptV1>> }
```

portは`object_versions,relations,trace_edges,naming_decisions,design_domain_event,projection,commit_receipt`のexact順を検査し、
graph/catalog両revisionを一度にCASする。各append直後faultは全rollback、同operation同digestは元receiptと全count 0、
同operation異digest・CAS不一致・write set/order差はreceiptを作らず全count 0とする。
commit receiptは全trusted oracleの`oracle_id/result_digest/observable_digest/execution_receipt_digest` exact setを保持し、
bundleのtrace edgeとbehavior receiptから再導出したbinding digestが一致しなければcurrent化しない。
plan fenceはgraph/oracle/scopeの3 authority storeからcurrent canonical bytes/headを再読し、callerのsnapshot実体/digest、trusted oracle
exact set、Scope Authority receiptとexact一致した場合だけcandidate、plan、全step、全consumer、pair、rollbackを一transactionへ固定する。
transform verificationはfence storeからcurrentな`RefactorPlanFenceReceiptV1`を再読し、receiptのcandidate ID、plan ID、step set digest、
current fence headをbundleとexact照合してからconsumer check、pair、behavior、rollback、refactor receipt、DesignDomainEventを結ぶ。
caller payloadだけをcurrent証拠にしない。いずれもpayload欠落・入替、CAS、
append faultで全増分0とし、fenceだけ／behaviorだけをverifiedへ読み替えない。

## §3 canonical assertion primary表

| HST正本 | 主U | 主API | supporting主IT | pre_state | expected_state | failure正本 |
|---|---|---|---|---|---|---|
| `HST-CASE-025-01` | `U-DRDM-003` | `planExternalize` | `IT-DRDM-001` | `transforming` | `verified` | `なし（正常系）` |
| `HST-CASE-025-02` | `U-DRDM-004` | `planCommonize` | `IT-DRDM-001` | `transforming` | `verified` | `なし（正常系）` |
| `HST-CASE-025-03` | `U-DRDM-005` | `planObjectize` | `IT-DRDM-001` | `transforming` | `verified` | `なし（正常系）` |
| `HST-CASE-025-04` | `U-DRDM-006` | `planSemanticRename` | `IT-DRDM-001` | `transforming` | `verified` | `なし（正常系）` |
| `HST-CASE-025-05` | `U-DRDM-009` | `routeDesignDelta` | `IT-DRDM-002` | `transforming` | `rerouted` | `HIL_DESIGN_REFACTOR_BEHAVIOR_CHANGED` |
| `HST-CASE-025-06` | `U-DRDM-009` | `routeDesignDelta` | `IT-DRDM-003` | `transforming` | `rerouted` | `HIL_DESIGN_REFACTOR_RETROFIT_REQUIRED` |
| `HST-CASE-025-07` | `U-DRDM-002` | `classifyDesignRefactorCandidate` | `IT-DRDM-004` | `triage_pending` | `rejected` | `HIL_DESIGN_REFACTOR_NAME_ONLY` |
| `HST-CASE-025-08` | `U-DRDM-008` | `validateConsumerCompatibility` | `IT-DRDM-005` | `draft` | `draft` | `HIL_DESIGN_REFACTOR_CONSUMER_MISSING` |
| `HST-CASE-025-09` | `U-DRDM-010` | `validateRefactorFence` | `IT-DRDM-005` | `draft` | `draft` | `HIL_DESIGN_REFACTOR_ROLLBACK_MISSING` |
| `HST-CASE-025-10` | `U-DRDM-002` | `classifyDesignRefactorCandidate` | `IT-DRDM-004` | `triage_pending` | `rejected` | `HIL_DESIGN_REFACTOR_UNJUSTIFIED` |
| `HST-CASE-025-11` | `U-DRDM-002` | `classifyDesignRefactorCandidate` | `IT-DRDM-001` | `assertion_input_ready` | `assertion_pass` | `HIL_DESIGN_REFACTOR_ROUTE_INVALID` |
| `HST-CASE-025-12` | `U-DRDM-001` | `buildDesignSemanticSignature` | `IT-DRDM-001` | `assertion_input_ready` | `assertion_pass` | `HIL_DESIGN_REFACTOR_INVARIANT_BROKEN` |
| `HST-CASE-026-01` | `U-DRDM-016` | `commitDesignDomainBundle` | `IT-DRDM-006` | `catalog_ready` | `verified` | `なし（正常系）` |
| `HST-CASE-026-02` | `U-DRDM-012` | `validateDomainRoleInvariant` | `IT-DRDM-007` | `staged` | `rejected` | `HIL_DOMAIN_ENTITY_IDENTITY_MISSING` |
| `HST-CASE-026-03` | `U-DRDM-012` | `validateDomainRoleInvariant` | `IT-DRDM-007` | `staged` | `rejected` | `HIL_DOMAIN_VALUE_OBJECT_MUTABLE` |
| `HST-CASE-026-04` | `U-DRDM-012` | `validateDomainRoleInvariant` | `IT-DRDM-007` | `staged` | `rejected` | `HIL_DOMAIN_AGGREGATE_ROOT_MISSING` |
| `HST-CASE-026-05` | `U-DRDM-012` | `validateDomainRoleInvariant` | `IT-DRDM-007` | `staged` | `rejected` | `HIL_DOMAIN_SERVICE_RESPONSIBILITY_MISSING` |
| `HST-CASE-026-06` | `U-DRDM-012` | `validateDomainRoleInvariant` | `IT-DRDM-007` | `staged` | `rejected` | `HIL_DOMAIN_POLICY_AUTHORITY_MISSING` |
| `HST-CASE-026-07` | `U-DRDM-012` | `validateDomainRoleInvariant` | `IT-DRDM-007` | `staged` | `rejected` | `HIL_DOMAIN_SPECIFICATION_SIDE_EFFECT` |
| `HST-CASE-026-08` | `U-DRDM-012` | `validateDomainRoleInvariant` | `IT-DRDM-008` | `staged` | `rejected` | `HIL_DOMAIN_COMMAND_INTENT_MISSING` |
| `HST-CASE-026-09` | `U-DRDM-012` | `validateDomainRoleInvariant` | `IT-DRDM-008` | `staged` | `rejected` | `HIL_DOMAIN_QUERY_SIDE_EFFECT` |
| `HST-CASE-026-10` | `U-DRDM-012` | `validateDomainRoleInvariant` | `IT-DRDM-008` | `staged` | `rejected` | `HIL_DOMAIN_EVENT_NOT_COMPLETED_FACT` |
| `HST-CASE-026-11` | `U-DRDM-012` | `validateDomainRoleInvariant` | `IT-DRDM-008` | `staged` | `rejected` | `HIL_DOMAIN_RECEIPT_PROVENANCE_MISSING` |
| `HST-CASE-026-12` | `U-DRDM-013` | `validateDomainDependencyDirection` | `IT-DRDM-009` | `staged` | `rejected` | `HIL_DOMAIN_PORT_DEPENDENCY_INVERTED` |
| `HST-CASE-026-13` | `U-DRDM-013` | `validateDomainDependencyDirection` | `IT-DRDM-009` | `staged` | `rejected` | `HIL_DOMAIN_ADAPTER_PORT_MISSING` |
| `HST-CASE-026-14` | `U-DRDM-013` | `validateDomainDependencyDirection` | `IT-DRDM-009` | `staged` | `rejected` | `HIL_DOMAIN_REPOSITORY_AGGREGATE_MISSING` |
| `HST-CASE-026-15` | `U-DRDM-014` | `decideCanonicalDomainName` | `IT-DRDM-010` | `pending` | `rejected` | `HIL_DOMAIN_NAME_AMBIGUOUS` |
| `HST-CASE-026-16` | `U-DRDM-015` | `bindDomainSymbolAndOracle` | `IT-DRDM-010` | `current` | `current` | `なし（正常系）` |
| `HST-CASE-026-17` | `U-DRDM-009` | `routeDesignDelta` | `IT-DRDM-011` | `current` | `rerouted` | `HIL_DOMAIN_PUBLIC_RENAME_REDESIGN` |
| `HST-CASE-026-18` | `U-DRDM-009` | `routeDesignDelta` | `IT-DRDM-011` | `current` | `rerouted` | `HIL_DOMAIN_PERSISTED_RENAME_RETROFIT` |
| `HST-CASE-026-19` | `U-DRDM-015` | `bindDomainSymbolAndOracle` | `IT-DRDM-010` | `staged` | `rejected` | `HIL_DOMAIN_ORACLE_PRIVATE_SYMBOL_BOUND` |
| `HST-CASE-026-20` | `U-DRDM-014` | `decideCanonicalDomainName` | `IT-DRDM-010` | `staged` | `rejected` | `HIL_DOMAIN_CANONICAL_TERM_CONFLICT` |
| `HST-CASE-026-21` | `U-DRDM-016` | `commitDesignDomainBundle` | `IT-DRDM-006` | `assertion_input_ready` | `assertion_pass` | `HIL_DOMAIN_MODEL_CONTRACT_INVALID` |
| `HST-CASE-026-22` | `U-DRDM-012` | `validateDomainRoleInvariant` | `IT-DRDM-006` | `assertion_input_ready` | `assertion_pass` | `HIL_DOMAIN_MODEL_CONTRACT_INVALID` |

## §4 完了境界

U 19/19、IT 12/12、canonical 34/34、typed Result、oracle trust反証とtransaction port faultが揃うまでdraftとする。

## §5 trusted receipt完全schema

```ts
interface TrustedOracleSetV1 { oracle_set_id: string; oracle_ids: string[]; receipt_ids: string[]; behavior_signature_digest: string; target_commit_digest: string; set_digest: string }
interface TrustedExecutionReceiptStoreV1 { readCurrent(receiptId: string, expectedEventHead: string, trustedNow: string): Promise<DesignDomainResultV1<{ receipt: TrustedExecutionReceiptV1; canonical_bytes: string; current_event_head: string }>> }
```

`validateOracleTrustBinding`はstoreから得たcanonical bytesのreceipt digest、producer/version、freshness、supersession terminal、result bindingを再計算し、`TrustedOracleSetV1`のbehavior/commit exact bindを検査する。caller digest authorityは0で、receipt/result/observable/behavior/commit swap、stale、CAS/store faultではcurrent/event/receipt増分0とする。
`executed_at`は対象command/oracleが実際に終了したtrusted execution時刻、`issued_at`はNode authorityが結果を検証してreceiptを
発行した時刻とし、`executed_at <= issued_at < fresh_until`を要求する。untrusted worker clockをいずれのfieldにも採用しない。

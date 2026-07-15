---
title: "HELIX L6 機能設計 — Issue・scope・authority gate"
layer: L6
kind: add-design
status: draft
created: 2026-07-15
updated: 2026-07-15
owner: Codex / TL
plan: PLAN-L1-07-infinity-loop-platform-requirements
design_slice: HDS-HIL-05
related_l3: docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md
related_l4: docs/design/helix/L4-basic-design/infinity-loop-platform-basic-design.md
related_l5: docs/design/helix/L5-detail/issue-scope-authority-gates.md
related_hst:
  - HST-HIL-019
  - HST-HIL-021
  - HST-HIL-023
pair_artifact: docs/test-design/helix/L6-issue-scope-authority-gates-unit-test-design.md
next_pair_freeze: L7
requirements:
  - HR-FR-HIL-05
  - HAC-HIL-05a
  - HAC-HIL-05b
  - HAC-HIL-05c
---

# HELIX L6 機能設計 — Issue・scope・authority gate

## §0 関数境界

pure functionはDB、filesystem、clock、GitHub、AI runtimeを直接読まない。custody append、event append、transition CASはinjected Node portだけが行う。
判定は入力配列順に依存せず、全`GateResultV1` failureがcanonical tokenとredacted evidence digestを返す。

## §1 public APIとexact oracle

| API | signature | DbC／result | L7 oracle | HAC | exact HST | canonical failure（正本failure） |
|---|---|---|---|---|---|---|
| `captureDirectiveBeforeClassification` | `(input, operation, port) => Promise<GateResultV1<DirectiveCustodyReceiptV1, GateFailureV1>>` | durable append成功後だけclassifiable | `U-ISAG-001` | `HAC-HIL-05a`, `HAC-HIL-05b` | `HST-CASE-019-01`, `HST-CASE-019-02` | `なし（正常系）`; `HIL_DIRECTIVE_CUSTODY_MISSING` |
| `validateDirectiveClassificationAdmission` | `(custody, currentDirective) => GateResultV1<CurrentCustodyBindingV1, GateFailureV1>` | directive/revision/content digest一致のdurable current receiptだけclassify/dedupe/disposition可 | `U-ISAG-001` | `HAC-HIL-05a`, `HAC-HIL-05b` | `HST-CASE-019-02` | `HIL_DIRECTIVE_CUSTODY_MISSING` |
| `validateDirectiveAppendOnly` | `(custody, current, candidate, operation) => GateResultV1<DirectiveRevisionV1, GateFailureV1>` | current custody bind必須、UPDATE/DELETE禁止、superseding appendだけ | `U-ISAG-002` | `HAC-HIL-05b` | `HST-CASE-019-07` | `HIL_DIRECTIVE_APPEND_ONLY_VIOLATION` |
| `resolveDirectiveDuplicate` | `(custody, directive, target, oracleProof) => GateResultV1<DispositionReceiptV1, GateFailureV1>` | current custody bind＋target生存＋oracle包含＋appeal | `U-ISAG-003` | `HAC-HIL-05b` | `HST-CASE-019-03` | `HIL_DIRECTIVE_DUPLICATE_TARGET_MISSING` |
| `validateDirectiveFalsePositive` | `(custody, directive, refutation, verifier) => GateResultV1<DispositionReceiptV1, GateFailureV1>` | current custody bind＋独立provider/role反証必須 | `U-ISAG-004` | `HAC-HIL-05b` | `HST-CASE-019-04` | `HIL_DIRECTIVE_FALSE_POSITIVE_UNVERIFIED` |
| `validatePoDirectiveDisposition` | `(custody, directive, kind, actor, receipt) => GateResultV1<DispositionReceiptV1, GateFailureV1>` | current custody bind、accepted-risk/cancel/supersedeはPOだけ | `U-ISAG-005` | `HAC-HIL-05b` | `HST-CASE-019-05`, `HST-CASE-019-06`, `HST-CASE-019-09` | `HIL_DIRECTIVE_RISK_APPROVAL_MISSING`; `HIL_DIRECTIVE_CANCEL_UNAUTHORIZED`; `HIL_DIRECTIVE_TERMINATED_BY_AI` |
| `preventAiDirectiveTermination` | `(custody, directive, proposedEvent, actor) => GateResultV1<NonTerminalDispositionV1, GateFailureV1>` | AI terminal verbは必ずErr、state/event増分0。非terminal proposalだけOk | `U-ISAG-006` | `HAC-HIL-05b` | `HST-CASE-019-08` | `HIL_DIRECTIVE_CUSTODY_VIOLATION` |
| `buildScopeAuthorityGraph` | `(rootEvidence: AuthorityRootEvidenceV1[], nodes, edges, current) => GateResultV1<AuthorityGraphV1, GateFailureV1>` | custody/L0 confirmed/PO approval receiptを種類別検証し、stale root、revision不一致、orphan拒否 | `U-ISAG-007` | `HAC-HIL-05a` | `HST-CASE-021-01` | `なし（正常系）` |
| `detectScopeAuthorityCycle` | `(graph, sameChangeSet) => GateResultV1<AcyclicGraphV1, GateFailureV1>` | self/同時HIL/複合cycleを全件検出 | `U-ISAG-008` | `HAC-HIL-05b` | `HST-CASE-021-02`, `HST-CASE-021-08`, `HST-CASE-021-10` | `HIL_SCOPE_AUTHORITY_CYCLE`; `HIL_SCOPE_AUTHORITY_CYCLE`; `HIL_SCOPE_DERIVATION_CYCLE` |
| `resolveScopeAuthorityRoot` | `(capability, graph, rootPolicy, current) => GateResultV1<RootPathV1, GateFailureV1>` | verified chat/L0/PO rootへ一意到達し、forged/stale/multiple-root conflictを拒否 | `U-ISAG-009` | `HAC-HIL-05a`, `HAC-HIL-05b` | `HST-CASE-021-01`, `HST-CASE-021-07` | `なし（正常系）`; `HIL_SCOPE_AUTHORITY_INVALID` |
| `evaluateAcceptanceContribution` | `(changeAtom, oracleGraph) => GateResultV1<ContributionReceiptV1, GateFailureV1>` | authoritative oracleへの寄与必須 | `U-ISAG-010` | `HAC-HIL-05b` | `HST-CASE-021-03`, `HST-CASE-021-09` | `HIL_SCOPE_MINIMUM_NECESSITY_MISSING`; `HIL_SCOPE_NECESSITY_MISSING` |
| `evaluateMinimumNecessaryChange` | `(changeAtom, alternatives, contribution) => GateResultV1<MinimalityReceiptV1, GateFailureV1>` | 狭い代替との比較、最小cost | `U-ISAG-011` | `HAC-HIL-05b` | `HST-CASE-021-04` | `HIL_SCOPE_ALTERNATIVE_MISSING` |
| `accountScopeCapabilityBudget` | `(budget, changeAtoms) => GateResultV1<BudgetReceiptV1, GateFailureV1>` | capability/surface/dependency/complexity/operationsを加算 | `U-ISAG-012` | `HAC-HIL-05b` | `HST-CASE-021-05` | `HIL_SCOPE_BUDGET_EXCEEDED` |
| `compareScopeContractToDiff` | `(scope, diffAtoms, trace, budget) => GateResultV1<ScopeEvaluationReceiptV1, GateFailureV1>` | allowed/non-goal/trace/minimalityを全diff照合 | `U-ISAG-013` | `HAC-HIL-05b` | `HST-CASE-021-06`, `HST-CASE-021-07` | `HIL_UNJUSTIFIED_CAPABILITY`; `HIL_SCOPE_AUTHORITY_INVALID` |
| `inheritChildIssueScopeAuthority` | `(parentReceipt, childDelta) => GateResultV1<ChildScopeReceiptV1, GateFailureV1>` | root/non-goal/budget残量を継承、拡張禁止 | `U-ISAG-014` | `HAC-HIL-05b` | `HST-CASE-021-06` | `HIL_UNJUSTIFIED_CAPABILITY` |
| `classifyHighImpactAction` | `(action, policy) => HighImpactDecisionV1` | auth/PII/license/destructive/prod/external等を固定分類 | `U-ISAG-015` | `HAC-HIL-05c` | `HST-CASE-017-08` | `HIL_ACTION_BINDING_APPROVAL_MISSING` |
| `validateActionBindingApproval` | `(action, approval, current) => GateResultV1<ApprovalReceiptV1, GateFailureV1>` | actor/tool/target/params/snapshot/scope/evidence/expiryをexact照合 | `U-ISAG-016` | `HAC-HIL-05c` | `HST-CASE-017-08` | `HIL_ACTION_BINDING_APPROVAL_MISSING` |
| `validateIssueEvidenceReceipt` | `(requirement, receipt, current) => GateResultV1<VerifiedEvidenceV1, GateFailureV1>` | producer/subject/snapshot/digest/expiry/predecessor照合 | `U-ISAG-017` | `HAC-HIL-05a`, `HAC-HIL-05b` | `HST-CASE-003-13`, `HST-CASE-018-11` | `HIL_CI_RECEIPT_LINEAGE_INVALID`; `HIL_REVERSE_SEMANTIC_COVERAGE_INCOMPLETE` |
| `evaluateIssueGateChain` | `(issue, transition, policy, receipts, approval) => GateResultV1<GateBundleReceiptV1, GateFailureV1[]>` | custody→root→scope→minimality→evidence→approvalを固定順評価 | `U-ISAG-018` | `HAC-HIL-05a`, `HAC-HIL-05b`, `HAC-HIL-05c` | `HST-CASE-002-08`, `HST-CASE-002-10`, `HST-CASE-003-05`, `HST-CASE-018-09` | `HIL_ISSUE_GATE_BYPASS`; `HIL_IMPLEMENTATION_NOT_READY`; `HIL_CI_STAGE_BYPASS`; `HIL_REVERSE_SUBSTANCE_HOLLOW` |
| `authorizeIssueTransition` | `(current, requested, gateBundle, actor: IssueTerminalActorV1, operation, port) => Promise<GateResultV1<TransitionReceiptV1, GateFailureV1>>` | actor/authority明示、AI terminal禁止、current bundle＋CAS、欠落時event 0 | `U-ISAG-019` | `HAC-HIL-05a`, `HAC-HIL-05b` | `HST-CASE-002-08` | `HIL_ISSUE_GATE_BYPASS` |
| `evaluateIssueClosureEvidence` | `(issue, currentHead, currentSnapshot, receipts, children, poAuthority) => GateResultV1<IssueClosureEvidenceV1, GateFailureV1[]>` | PR/merge/三段CI/audit/oracle/memory/child/PO authorityを同一head/snapshotへ結合 | `U-ISAG-020` | `HAC-HIL-05a`, `HAC-HIL-05b` | `HST-CASE-023-02`, `HST-CASE-023-03`, `HST-CASE-023-04`, `HST-CASE-023-05`, `HST-CASE-023-07` | `HIL_CLOSURE_AUDIT_MISSING`; `HIL_CLOSURE_MEMORY_MISSING`; `HIL_CLOSURE_CHILD_OPEN`; `HIL_CLOSURE_ORACLE_MISSING`; `HIL_CLOSURE_EVIDENCE_MISSING` |
| `createIssueClosureReceipt` | `(issue, evidence: IssueClosureEvidenceV1, actor: IssueTerminalActorV1, operation, port) => Promise<GateResultV1<IssueClosureReceiptV1, GateFailureV1>>` | actor/authority明示、AI発行0、current evidenceでmerged_closedへexactly-once | `U-ISAG-021` | `HAC-HIL-05a` | `HST-CASE-023-01` | `なし（正常系）` |
| `checkpointIssueGateContinuation` | `(issue, bundle, obligations, now, port) => Promise<GateResultV1<GateCheckpointV1, GateFailureV1>>` | closeせず未完obligationとnext actionをseal | `U-ISAG-022` | `HAC-HIL-05a` | `HST-CASE-023-06` | `なし（正常系）` |
| `buildIssueGovernanceCommitBundle` | `(mutation, current, operation) => GateResultV1<IssueGovernanceCommitBundleV1, GateFailureV1>` | disposition/authority/scope/transitionのwrite setとexpected headsを正規化。pending proposalはterminalと別operation | `U-ISAG-023` | `HAC-HIL-05a`, `HAC-HIL-05b` | supporting | `HIL_ISSUE_TRANSACTION_CONFLICT` |
| `commitIssueGovernanceBundle` | `(bundle, store) => Promise<GateResultV1<IssueGovernanceCommitReceiptV1, GateFailureV1>>` | event/projection/receipt/evidence/node/edgeを単一Node transactionでCAS commit。同operation同digestはno-op | `U-ISAG-024` | `HAC-HIL-05a`, `HAC-HIL-05b` | supporting | `HIL_ISSUE_TRANSACTION_CONFLICT` |
| `reconcileIssueGovernanceCommit` | `(operationId, immutableEvidence, store) => Promise<GateResultV1<IssueGovernanceCommitReceiptV1, GateFailureV1>>` | partial commitを認めずimmutable event/evidenceからprojection/receiptだけを復元 | `U-ISAG-025` | `HAC-HIL-05a` | supporting | `HIL_ISSUE_TRANSACTION_RECONCILE_FAILED` |

## §2 schema

```ts
type GateResultV1<T, E> =
  | { ok: true; value: T }
  | { ok: false; error: E };

interface DirectiveRevisionV1 { directive_id: string; revision: number; supersedes_revision: number | null; custody_receipt_digest: string; content_digest: string; source_span_digest: string; operation_id: string; event_digest: string; status: "current" }
interface DispositionReceiptV1 { directive_id: string; directive_revision: number; kind: "duplicate" | "false_positive" | "accepted_risk" | "cancel" | "supersede"; target_id: string | null; actor_authority_digest: string; evidence_digest: string; approval_receipt_digest: string | null; appeal_route_digest: string; terminal: boolean; event_digest: string }
interface NonTerminalDispositionV1 { directive_id: string; directive_revision: number; proposal_kind: string; actor_authority_digest: string; evidence_digest: string; event_digest: string; terminal: false }
interface AuthorityGraphV1 { graph_revision: number; snapshot_digest: string; node_ids: string[]; edge_ids: string[]; root_evidence_ids: string[]; node_count: number; edge_count: number; graph_digest: string }
interface AcyclicGraphV1 extends AuthorityGraphV1 { stable_topological_order: string[]; cycle_count: 0; validation_digest: string }
interface RootPathV1 { capability_id: string; root_id: string; ordered_node_ids: string[]; ordered_edge_ids: string[]; root_evidence_digest: string; snapshot_digest: string; graph_revision: number; path_digest: string }
interface ContributionReceiptV1 { change_atom_id: string; oracle_ids: string[]; requirement_ids: string[]; contribution_kind: string; evidence_digest: string; receipt_digest: string }
interface MinimalityReceiptV1 { change_atom_id: string; selected_alternative_id: string; compared_alternative_ids: string[]; cost_vector: Record<string, number>; contribution_digest: string; alternative_set_digest: string; minimum: true; receipt_digest: string }
interface BudgetReceiptV1 { budget_revision: number; before: Record<string, number>; consumed: Record<string, number>; remaining: Record<string, number>; change_atom_ids: string[]; exceeded_dimensions: string[]; pass: boolean; receipt_digest: string }
interface ChildScopeReceiptV1 { parent_scope_revision: number; child_scope_revision: number; authority_root_digest: string; non_goal_digest: string; inherited_budget_digest: string; child_delta_digest: string; remaining_budget_digest: string; scope_expanded: false; receipt_digest: string }
interface HighImpactDecisionV1 { action_digest: string; policy_digest: string; matched_classes: string[]; high_impact: boolean; approval_required: boolean; decision_digest: string }
interface ApprovalReceiptV1 { approval_id: string; actor_id: string; tool_contract_id: string; target_digest: string; params_digest: string; snapshot_digest: string; scope_digest: string; evidence_digest: string; expires_at: string; pass: boolean; receipt_digest: string }
interface VerifiedEvidenceV1 { requirement_id: string; receipt_id: string; producer_digest: string; subject_digest: string; snapshot_digest: string; predecessor_receipt_id: string | null; expires_at: string; current: boolean; evidence_digest: string }
interface TransitionReceiptV1 { issue_id: string; issue_revision: number; from_state: string; to_state: string; gate_bundle_digest: string; actor_digest: string; operation_id: string; before_head: string; after_head: string; event_digest: string }
interface GateCheckpointV1 { issue_id: string; issue_revision: number; gate_bundle_digest: string; open_obligation_ids: string[]; next_action_digest: string; resume_token_digest: string; checkpoint_digest: string; terminal: false }

interface ProjectionDigestV1 {
  schema_version: "helix-projection-digest.v1";
  subject_kind: string;
  subject_id: string;
  subject_revision: number;
  event_head: string;
  projection_head: string;
  state_digest: string;
  row_count_digest: string;
}

interface DirectiveCustodyReceiptV1 { directive_id: string; directive_revision: number; operation_id: string; content_digest: string; source_span_digest: string; actor_identity_digest: string; event_digest: string; status: "captured" | "duplicate" }

interface CurrentCustodyBindingV1 {
  directive_id: string;
  directive_revision: number;
  content_digest: string;
  custody_receipt_digest: string;
  current_projection_digest: string;
}

interface AuthorityRootEvidenceV1 {
  root_id: string;
  root_kind: "custodied_chat" | "confirmed_l0" | "po_approved_parent_scope";
  root_revision: number;
  root_snapshot_digest: string;
  custody_receipt_digest: string | null;
  l0_confirmation_receipt_digest: string | null;
  po_scope_approval_receipt_digest: string | null;
  issued_at: string;
  expires_at: string | null;
  evidence_digest: string;
}

interface IssueTerminalActorV1 {
  actor_id: string;
  actor_identity_digest: string;
  authority: "po" | "authorized-human" | "ai" | "external";
  role_contract_digest: string;
}

interface GateBundleReceiptV1 {
  schema_version: "helix-issue-gate-bundle.v1";
  issue_id: string;
  issue_revision: number;
  transition: "ready" | "implement" | "merge" | "close";
  policy_version: string;
  custody_digest: string;
  authority_root_digest: string;
  scope_digest: string;
  minimality_digest: string;
  evidence_set_digest: string;
  approval_digest: string | null;
  input_snapshot_digest: string;
  failure_codes: string[];
  pass: boolean;
}

interface ScopeEvaluationReceiptV1 {
  schema_version: "helix-scope-evaluation.v1";
  issue_id: string;
  scope_revision: number;
  authority_path_digest: string;
  allowed_change_digest: string;
  non_goal_digest: string;
  trace_digest: string;
  contribution_digest: string;
  alternative_digest: string;
  budget_digest: string;
  diff_atom_set_digest: string;
}

interface IssueClosureEvidenceV1 {
  issue_id: string;
  issue_revision: number;
  current_head_sha: string;
  current_snapshot_digest: string;
  pr_receipt_digest: string;
  merge_receipt_digest: string;
  three_stage_ci_lineage_digest: string;
  audit_receipt_digest: string;
  oracle_receipt_digest: string;
  memory_receipt_digest: string;
  child_issue_state_set_digest: string;
  open_child_count: 0;
  po_authority_receipt_digest: string;
  evidence_set_digest: string;
}

interface IssueClosureReceiptV1 extends IssueClosureEvidenceV1 {
  closure_receipt_digest: string;
  actor: IssueTerminalActorV1;
  resulting_state: "merged_closed";
}

interface IssueGovernanceCommitBundleV1 {
  operation_id: string;
  payload_digest: string;
  mutation_kind: "pending_disposition" | "terminal_disposition" | "authority_graph" | "scope_receipt" | "gate_transition";
  subject_revision: number;
  expected_event_head: string;
  expected_projection_head: string;
  event_digest: string;
  projection_digest: string;
  receipt_evidence_digest: string;
  authority_write_set_digest: string | null;
}

interface IssueGovernanceCommitReceiptV1 {
  operation_id: string;
  payload_digest: string;
  mutation_kind: IssueGovernanceCommitBundleV1["mutation_kind"];
  subject_revision: number;
  before_event_head: string;
  after_event_head: string;
  before_projection_head: string;
  after_projection_head: string;
  write_set_digest: string;
  row_count_digest: string;
}

interface IssueGovernanceImmutableEvidenceV1 {
  operation_id: string;
  payload_digest: string;
  mutation_kind: IssueGovernanceCommitBundleV1["mutation_kind"];
  subject_revision: number;
  event_digest: string;
  receipt_evidence_digest: string;
  expected_event_head: string;
  expected_projection_head: string;
}

interface IssueGovernanceStoreV1 {
  commit(bundle: IssueGovernanceCommitBundleV1): Promise<GateResultV1<IssueGovernanceCommitReceiptV1, GateFailureV1>>;
  readOperation(operationId: string): Promise<IssueGovernanceCommitReceiptV1 | null>;
  readEventHead(subjectRevision: number): Promise<string>;
  readProjectionHead(subjectRevision: number): Promise<string>;
  reconcile(operationId: string, evidence: IssueGovernanceImmutableEvidenceV1): Promise<GateResultV1<IssueGovernanceCommitReceiptV1, GateFailureV1>>;
  rebuildProjection(subjectRevision: number): Promise<ProjectionDigestV1>;
}

type GateFailureV1 = {
  code: "HIL_ACTION_BINDING_APPROVAL_MISSING" | "HIL_CI_RECEIPT_LINEAGE_INVALID" | "HIL_CI_STAGE_BYPASS" | "HIL_CLOSURE_AUDIT_MISSING" | "HIL_CLOSURE_CHILD_OPEN" | "HIL_CLOSURE_EVIDENCE_MISSING" | "HIL_CLOSURE_MEMORY_MISSING" | "HIL_CLOSURE_ORACLE_MISSING" | "HIL_DIRECTIVE_APPEND_ONLY_VIOLATION" | "HIL_DIRECTIVE_CANCEL_UNAUTHORIZED" | "HIL_DIRECTIVE_CUSTODY_MISSING" | "HIL_DIRECTIVE_CUSTODY_VIOLATION" | "HIL_DIRECTIVE_DUPLICATE_TARGET_MISSING" | "HIL_DIRECTIVE_FALSE_POSITIVE_UNVERIFIED" | "HIL_DIRECTIVE_RISK_APPROVAL_MISSING" | "HIL_DIRECTIVE_TERMINATED_BY_AI" | "HIL_IMPLEMENTATION_NOT_READY" | "HIL_ISSUE_GATE_BYPASS" | "HIL_ISSUE_TRANSACTION_CONFLICT" | "HIL_ISSUE_TRANSACTION_RECONCILE_FAILED" | "HIL_REVERSE_SEMANTIC_COVERAGE_INCOMPLETE" | "HIL_REVERSE_SUBSTANCE_HOLLOW" | "HIL_SCOPE_ALTERNATIVE_MISSING" | "HIL_SCOPE_AUTHORITY_CYCLE" | "HIL_SCOPE_AUTHORITY_INVALID" | "HIL_SCOPE_BUDGET_EXCEEDED" | "HIL_SCOPE_DERIVATION_CYCLE" | "HIL_SCOPE_MINIMUM_NECESSITY_MISSING" | "HIL_SCOPE_NECESSITY_MISSING" | "HIL_UNJUSTIFIED_CAPABILITY";
  evidence_digest: string;
  operation_id?: string;
};
```

`U-ISAG-001`のstable exact function setは`captureDirectiveBeforeClassification` →
`validateDirectiveClassificationAdmission`である。前者はdurable append／operation conflict／receipt発行、後者はcurrent
directive/revision/content bindingと下流副作用0を固有mutationとして持ち、`IT-ISAG-001`と`IT-ISAG-002`へ同じidentityでjoinする。

`ProjectionDigestV1`の共有semantic shape正本はL4基本設計 §2.3とする。reconcileは`IssueGovernanceImmutableEvidenceV1`のoperation/payload/mutation/head一致からだけ復元し、authorityやterminal dispositionを推測しない。

## §3 不変条件

1. classify/dedupe/disposition開始時点でcurrent directive revisionへbindしたdurable custody receiptが必ず一件ある。
2. AI actorはdirective/Issueをterminalにできない。
3. authority graphはacyclicで、種類別provenance receiptがcurrentな唯一の許可rootへ到達する。
4. scope passは全diff atomのoracle寄与、minimality、alternative、budget passを含む。
5. approvalは不足gateをoverrideせず、high-impact action tupleとcurrent snapshotへexact bindする。
6. transition eventはcurrent gate bundleなしにappendされない。
7. closeはPR/merge/三段CI/audit/oracle/memory/child/PO authorityが同じcurrent head/snapshotへbindし、open child 0の場合だけ。
8. budget到達はcheckpointでありcloseではない。

## §4 実装配置候補

| path候補 | 責務 |
|---|---|
| `src/schema/issue-scope-gates.ts` | custody、authority、scope、evidence、approval、transition型 |
| `src/issue/directive-custody.ts` | 分類前appendとdisposition authority |
| `src/issue/scope-authority.ts` | graph、root、cycle、inheritanceの判定 |
| `src/issue/scope-minimality.ts` | contribution、alternative、budget、diff照合 |
| `src/issue/action-binding.ts` | high-impact分類とapproval exact bind |
| `src/issue/gate-chain.ts` | ordered gate bundleとtransition authorization |
| `src/issue/closure.ts` | closure evidence、receipt、checkpointの生成 |
| `src/state-db/issue-scope-projection.ts` | L5 §8 table、event append、rebuildを担当 |

## §5 実装順と完了境界

schema/custody→disposition→authority graph→minimality/budget→evidence→approval→gate chain/transition→closure/checkpointの順で実装する。
L7 22件、L8 16件、primary HST 26件、approval/dependency oracle、別runtime reviewまでdraftとし、実装完了を主張しない。

## atomic state tuple台帳

各caseを正本stateとU oracleへ一対一で結線する。

| HST case識別子 | `pre_state` | `expected_state` | 正本failure | U結線 |
|---|---|---|---|---|
| `HST-CASE-019-01` | `received` | `captured` | `なし（正常系）` | `U-ISAG-001` |
| `HST-CASE-019-02` | `received` | `received` | `HIL_DIRECTIVE_CUSTODY_MISSING` | `U-ISAG-001` |
| `HST-CASE-019-03` | `pending` | `pending` | `HIL_DIRECTIVE_DUPLICATE_TARGET_MISSING` | `U-ISAG-003` |
| `HST-CASE-019-04` | `pending` | `pending` | `HIL_DIRECTIVE_FALSE_POSITIVE_UNVERIFIED` | `U-ISAG-004` |
| `HST-CASE-019-05` | `pending` | `pending` | `HIL_DIRECTIVE_RISK_APPROVAL_MISSING` | `U-ISAG-005` |
| `HST-CASE-019-06` | `captured` | `captured` | `HIL_DIRECTIVE_CANCEL_UNAUTHORIZED` | `U-ISAG-005` |
| `HST-CASE-019-07` | `captured` | `captured` | `HIL_DIRECTIVE_APPEND_ONLY_VIOLATION` | `U-ISAG-002` |
| `HST-CASE-021-01` | `pending` | `verified` | `なし（正常系）` | `U-ISAG-007`, `U-ISAG-009` |
| `HST-CASE-021-02` | `pending` | `rejected` | `HIL_SCOPE_AUTHORITY_CYCLE` | `U-ISAG-008` |
| `HST-CASE-021-03` | `pending` | `rejected` | `HIL_SCOPE_MINIMUM_NECESSITY_MISSING` | `U-ISAG-010` |
| `HST-CASE-021-04` | `pending` | `rejected` | `HIL_SCOPE_ALTERNATIVE_MISSING` | `U-ISAG-011` |
| `HST-CASE-021-05` | `verified` | `rejected` | `HIL_SCOPE_BUDGET_EXCEEDED` | `U-ISAG-012` |
| `HST-CASE-023-01` | `closure_ready` | `merged_closed` | `なし（正常系）` | `U-ISAG-021` |
| `HST-CASE-023-02` | `closure_ready` | `closure_ready` | `HIL_CLOSURE_AUDIT_MISSING` | `U-ISAG-020` |
| `HST-CASE-023-03` | `closure_ready` | `closure_ready` | `HIL_CLOSURE_MEMORY_MISSING` | `U-ISAG-020` |
| `HST-CASE-023-04` | `closure_ready` | `closure_ready` | `HIL_CLOSURE_CHILD_OPEN` | `U-ISAG-020` |
| `HST-CASE-023-05` | `closure_ready` | `closure_ready` | `HIL_CLOSURE_ORACLE_MISSING` | `U-ISAG-020` |
| `HST-CASE-023-06` | `running` | `checkpointed` | `なし（正常系）` | `U-ISAG-022` |
| `HST-CASE-019-08` | `assertion_input_ready` | `assertion_pass` | `HIL_DIRECTIVE_CUSTODY_VIOLATION` | `U-ISAG-006` |
| `HST-CASE-021-06` | `assertion_input_ready` | `assertion_pass` | `HIL_UNJUSTIFIED_CAPABILITY` | `U-ISAG-013`, `U-ISAG-014` |
| `HST-CASE-021-07` | `assertion_input_ready` | `assertion_pass` | `HIL_SCOPE_AUTHORITY_INVALID` | `U-ISAG-009`, `U-ISAG-013` |
| `HST-CASE-023-07` | `assertion_input_ready` | `assertion_pass` | `HIL_CLOSURE_EVIDENCE_MISSING` | `U-ISAG-020` |
| `HST-CASE-021-08` | `assertion_input_ready` | `assertion_pass` | `HIL_SCOPE_AUTHORITY_CYCLE` | `U-ISAG-008` |
| `HST-CASE-021-09` | `assertion_input_ready` | `assertion_pass` | `HIL_SCOPE_NECESSITY_MISSING` | `U-ISAG-010` |
| `HST-CASE-019-09` | `assertion_input_ready` | `assertion_pass` | `HIL_DIRECTIVE_TERMINATED_BY_AI` | `U-ISAG-005` |
| `HST-CASE-021-10` | `assertion_input_ready` | `assertion_pass` | `HIL_SCOPE_DERIVATION_CYCLE` | `U-ISAG-008` |

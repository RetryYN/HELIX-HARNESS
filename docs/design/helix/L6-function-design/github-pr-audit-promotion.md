---
title: "HELIX L6 機能設計 — GitHub PR audit promotion"
layer: L6
kind: add-design
status: draft
created: 2026-07-15
updated: 2026-07-22
owner: Codex / TL
plan: PLAN-L1-07-infinity-loop-platform-requirements
design_slice: HDS-HIL-03
related_l3: docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md
related_l4: docs/design/helix/L4-basic-design/infinity-loop-platform-basic-design.md
related_l5: docs/design/helix/L5-detail/github-pr-audit-promotion.md
related_hst:
  - HST-HIL-004
  - HST-HIL-005
  - HST-HIL-034
  - HST-HIL-035
  - HST-HIL-036
  - HST-HIL-037
  - HST-HIL-038
  - HST-HIL-039
  - HST-HIL-040
pair_artifact: docs/test-design/helix/L6-github-pr-audit-promotion-unit-test-design.md
next_pair_freeze: L7
requirements:
  - HR-FR-HIL-03
  - HAC-HIL-03a
  - HAC-HIL-03b
  - HAC-HIL-03c
  - GH-FR-018
  - GH-FR-019
  - GH-FR-020
  - GH-FR-021
  - GH-FR-022
  - GH-NFR-009
  - GH-NFR-010
  - GH-NFR-011
  - GH-NFR-012
  - GH-NFR-013
  - GH-NFR-014
  - GH-AC-014
  - GH-AC-015
  - GH-AC-016
  - GH-AC-017
  - GH-AC-018
  - GH-AC-019
  - GH-AC-020
  - GH-AC-021
  - GH-AC-022
  - GH-AC-023
  - GH-AC-024
  - GH-AC-025
  - GH-AC-026
  - GH-AC-027
  - GH-AC-028
  - GH-AC-029
---

# HELIX L6 機能設計 — GitHub PR audit promotion

## §0 型付きfailure

```ts
type PromotionMemberKindV1 = "issue" | "reverse" | "memory_summary" | "codex_queue";
type PrAuditFailureV1 =
  | { code: "HIL_GITHUB_DELIVERY_DUPLICATE" | "HIL_PR_DELIVERY_DUPLICATED"; delivery_id: string; evidence_digest: string }
  | { code: "HIL_GITHUB_HEAD_MISMATCH" | "HIL_PR_AUDIT_HOOK_MISSED"; expected_head: string; observed_head: string; evidence_digest: string }
  | { code: "HIL_FORWARD_LOOP_NOT_CONVERGED"; missing_join_ids: readonly string[]; evidence_digest: string }
  | { code: "HIL_FINDING_PROMOTION_PARTIAL" | "HIL_FINDING_DROPPED"; missing_members: readonly PromotionMemberKindV1[]; evidence_digest: string }
  | { code: "HIL_FINDING_DUPLICATE_TARGET_MISSING" | "HIL_FINDING_DISPOSITION_INVALID"; finding_id: string; evidence_digest: string }
  | { code: "HIL_GITHUB_DELIVERY_CONFLICT" | "HIL_AUDIT_ROLE_NOT_SEPARATED" | "HIL_AUDIT_FINDING_STALE"; digest: string };
type PrAuditResultV1<T> =
  | { ok: true; value: T }
  | { ok: false; failures: readonly PrAuditFailureV1[] };

type GithubPrActionV1 = "opened" | "reopened" | "synchronize" | "ready_for_review" | "closed" | "completed";
interface RawPrDeliveryV1 { schema_version: "helix-github-pr-delivery-input.v1"; provider: "github"; delivery_id: string; event_name: "pull_request" | "workflow_run"; action: GithubPrActionV1; repository_id: string; pr_number: number; base_ref: string; base_sha: string; base_tree_digest: string; head_ref: string; head_sha: string; head_tree_digest: string; payload_digest: string; received_at: string }
interface DeliverySchemaV1 { schema_version: "helix-github-pr-delivery-schema.v1"; schema_revision: number; allowed_events: readonly ("pull_request" | "workflow_run")[]; allowed_actions: readonly GithubPrActionV1[]; required_field_ids: readonly string[]; schema_digest: string }
interface TransportReceiptV1 { schema_version: "helix-github-transport-receipt.v1"; provider: "github"; delivery_id: string; signature_algorithm: "sha256"; signature_verified: true; body_digest: string; transport_metadata_digest: string; received_at: string; receipt_digest: string }
interface VerifiedPrDeliveryV1 { schema_version: "helix-verified-pr-delivery.v1"; pr_delivery_id: string; provider: "github"; delivery_id: string; action: GithubPrActionV1; repository_id: string; pr_number: number; base_ref: string; base_sha: string; base_tree_digest: string; head_ref: string; payload_head_sha: string; payload_head_tree_digest: string; payload_digest: string; transport_receipt_digest: string; delivery_digest: string }

interface PrHeadObservationV1 { schema_version: "helix-pr-head-observation.v1"; repository_id: string; pr_number: number; base_ref: string; base_sha: string; base_tree_digest: string; head_ref: string; head_sha: string; head_tree_digest: string; merge_base_sha: string; merge_base_tree_digest: string; diff_base_digest: string; observed_at: string; provider_receipt_digest: string; observation_digest: string }
interface CurrentPrHeadV1 { schema_version: "helix-current-pr-head.v1"; pr_head_id: string; repository_id: string; pr_number: number; base_ref: string; base_sha: string; base_tree_digest: string; head_ref: string; head_sha: string; head_tree_digest: string; merge_base_sha: string; merge_base_tree_digest: string; diff_base_digest: string; delivery_digest: string; status: "current"; head_identity_digest: string }
interface PriorDeliveryV1 { schema_version: "helix-prior-pr-delivery.v1"; pr_delivery_id: string; delivery_id: string; delivery_digest: string; idempotency_receipt_digest: string; job_id: string | null; status: "accepted" | "duplicate" | "conflict" | "stale" }
interface DeliveryDecisionV1 { schema_version: "helix-pr-delivery-decision.v1"; delivery_id: string; delivery_digest: string; verdict: "accept" | "duplicate_noop" | "conflict"; prior_receipt_digest: string | null; authoritative_increment: 0 | 1; decision_digest: string }

interface AuditPolicyV1 { schema_version: "helix-pr-audit-policy.v1"; policy_id: string; policy_version: string; include_all_base_branches: true; required_view_kinds: readonly ("issue" | "contract" | "design" | "test" | "ci" | "coverage")[]; finding_schema_version: "helix-audit-finding.v1"; policy_digest: string }
interface AuditRoleIdentityV1 { runtime: "claude" | "codex"; identity_id: string; role: "auditor" | "implementer"; provider_family: string; model_family: string; identity_digest: string }
interface AuditRoleSetV1 { schema_version: "helix-audit-role-set.v1"; claude: AuditRoleIdentityV1; codex: AuditRoleIdentityV1; separation_policy_digest: string; role_set_digest: string }
interface PrAuditJobPlanV1 { schema_version: "helix-pr-audit-job-plan.v1"; audit_job_id: string; delivery: VerifiedPrDeliveryV1; head: CurrentPrHeadV1; policy: AuditPolicyV1; roles: AuditRoleSetV1; cause_id: string; input_view_set_digest: string; diff_artifact_digest: string; operation_id: string; expected_event_head: string; job_key_digest: string; plan_digest: string }
interface PrAuditJobV1 { schema_version: "helix-pr-audit-job.v1"; audit_job_id: string; repository_id: string; pr_number: number; head_identity_digest: string; comparison: PrComparisonIdentityV1; policy_digest: string; role_set_digest: string; input_view_set_digest: string; diff_artifact_digest: string; state: "queued" | "running" | "completed" | "failed" | "stale"; lease_id: string | null; fence_digest: string | null; current_event_digest: string; job_digest: string }
interface PrComparisonIdentityV1 { schema_version: "helix-pr-comparison-identity.v1"; repository_id: string; pr_number: number; head_sha: string; head_tree_digest: string; base_sha: string; base_tree_digest: string; merge_base_sha: string; merge_base_tree_digest: string; diff_base_digest: string; identity_digest: string }
interface AuditJobInvalidationDecisionV1 { schema_version: "helix-audit-job-invalidation-decision.v1"; audit_job_id: string; stale_required: boolean; changed_fields: readonly ("base_sha" | "base_tree" | "merge_base_sha" | "merge_base_tree" | "diff_base")[]; superseding_job_required: boolean; invalidation_digest: string }

interface AuditViewV1 { view_kind: "issue" | "contract" | "design" | "test" | "ci" | "coverage"; subject_id: string; subject_revision: number; subject_digest: string; query_digest: string; status: "current" | "stale" }
interface AuditViewSetV1 { schema_version: "helix-audit-view-set.v1"; views: readonly AuditViewV1[]; view_ids: readonly string[]; view_set_digest: string }
interface PrDiffArtifactV1 { schema_version: "helix-pr-diff-artifact.v1"; repository_id: string; pr_number: number; head_identity_digest: string; changed_path_digests: readonly string[]; diff_bytes_digest: string; artifact_digest: string }
interface ClaudeAuditTaskV1 { schema_version: "helix-claude-audit-task.v1"; task_id: string; audit_job_id: string; head_identity_digest: string; policy_digest: string; view_set_digest: string; diff_artifact_digest: string; auditor_identity_digest: string; implementer_identity_digest: string; role_brief_digest: string; authority_scope: "finding_proposal_only"; read_only: true; task_digest: string }

type AuditFindingCategoryV1 = "bug" | "risk" | "behavior_regression" | "missing_test" | "design_gap" | "telemetry";
type AuditFindingSeverityV1 = "blocker" | "critical" | "major" | "minor" | "suggestion";
type DesignLayerV1 = "L0" | "L1" | "L2" | "L3" | "L4" | "L5" | "L6" | "L7" | "L8" | "L9" | "L10" | "L11" | "L12" | "L13" | "L14";
interface FindingSubjectSpanV1 { artifact_id: string; artifact_digest: string; start_line: number; end_line: number; span_digest: string }
interface AuditFindingProposalV1 { schema_version: "helix-audit-finding-proposal.v1"; audit_job_id: string; head_identity_digest: string; policy_digest: string; category: AuditFindingCategoryV1; severity: AuditFindingSeverityV1; affected_layer: DesignLayerV1; subject_spans: readonly FindingSubjectSpanV1[]; evidence_digest: string; db_query_digest: string; diff_digest: string; recommended_route: "redesign" | "reverse" | "implementation" | "risk_decision" | "telemetry"; producer_identity_digest: string; producer_role: "auditor"; producer_provider_family: string; proposal_digest: string }
interface EvidenceIndexEntryV1 { evidence_id: string; evidence_kind: "artifact" | "db_query" | "diff" | "review" | "approval" | "target"; subject_digest: string; locator_digest: string; status: "current" | "stale"; evidence_digest: string }
interface EvidenceIndexV1 { schema_version: "helix-audit-evidence-index.v1"; entries: readonly EvidenceIndexEntryV1[]; evidence_ids: readonly string[]; index_digest: string }
interface AuditFindingV1 { schema_version: "helix-audit-finding.v1"; finding_id: string; audit_job_id: string; head_identity_digest: string; policy_digest: string; category: AuditFindingCategoryV1; severity: AuditFindingSeverityV1; affected_layer: DesignLayerV1; subject_spans: readonly FindingSubjectSpanV1[]; evidence_digest: string; db_query_digest: string; diff_digest: string; recommended_route: "redesign" | "reverse" | "implementation" | "risk_decision" | "telemetry"; producer_identity_digest: string; finding_fingerprint: string; state: "finding_open" | "disposition_pending" | "promoted" | "closed" | "stale"; finding_digest: string }

type FindingDispositionKindV1 = "actionable" | "duplicate" | "false_positive" | "accepted_risk" | "telemetry";
interface DispositionProposalV1 { schema_version: "helix-finding-disposition-proposal.v1"; finding_id: string; expected_finding_digest: string; disposition: FindingDispositionKindV1; target_id: string | null; target_digest: string | null; evidence_digests: readonly string[]; reviewer_receipt_digest: string | null; approval_receipt_digest: string | null; observation_owner: string | null; expires_at: string | null; appeal_route_digest: string; proposal_digest: string }
interface AuthorityIndexEntryV1 { authority_kind: "independent_review" | "po_approval" | "target_acceptance" | "telemetry_owner"; authority_id: string; subject_digest: string; issued_at: string; fresh_until: string; receipt_digest: string }
interface AuthorityIndexV1 { schema_version: "helix-finding-authority-index.v1"; entries: readonly AuthorityIndexEntryV1[]; authority_ids: readonly string[]; index_digest: string }
interface DispositionReceiptV1 { schema_version: "helix-finding-disposition-receipt.v1"; receipt_id: string; finding_id: string; finding_digest: string; revision: number; disposition: FindingDispositionKindV1; status: "actionable" | "closed" | "disposition_pending"; target_id: string | null; target_digest: string | null; evidence_set_digest: string; authority_receipt_digest: string | null; appeal_route_digest: string; receipt_digest: string }

interface IssueContractDraftV1 { schema_version: "helix-promotion-issue-contract-draft.v1"; issue_id: string; issue_revision: number; contract_digest: string; finding_id: string; cause_id: string }
interface ReverseTaskDraftV1 { schema_version: "helix-promotion-reverse-task-draft.v1"; reverse_run_id: string; phase: "R0"; issue_id: string; issue_revision: number; finding_id: string; cause_id: string; reverse_digest: string }
interface MemoryIssueSummaryDraftV1 { schema_version: "helix-memory-issue-summary-draft.v1"; summary_id: string; issue_id: string; issue_revision: number; finding_id: string; cause_id: string; sanitized_summary_digest: string; raw_finding_included: false; summary_digest: string }
interface CodexQueueDraftV1 { schema_version: "helix-codex-queue-draft.v1"; queue_item_id: string; issue_id: string; issue_revision: number; reverse_run_id: string; gate_reference_digest: string; finding_id: string; cause_id: string; state: "blocked_on_reverse"; queue_digest: string }
interface FindingPromotionMemberV1 { member_kind: PromotionMemberKindV1; target_id: string; target_revision: number; target_digest: string; cause_id: string; state: "prepared" }
interface FindingPromotionBundleV1 { schema_version: "helix-finding-promotion-bundle.v1"; promotion_id: string; cause_id: string; operation_id: string; operation_digest: string; finding: AuditFindingV1; disposition: DispositionReceiptV1; head_identity_digest: string; issue: IssueContractDraftV1; reverse: ReverseTaskDraftV1; memory: MemoryIssueSummaryDraftV1; queue: CodexQueueDraftV1; members: readonly [FindingPromotionMemberV1, FindingPromotionMemberV1, FindingPromotionMemberV1, FindingPromotionMemberV1]; member_set_digest: string; expected_event_head: string; expected_projection_digest: string; bundle_digest: string }

interface AuditJobReceiptV1 { schema_version: "helix-pr-audit-job-receipt.v1"; operation_id: string; delivery_id: string; audit_job_id: string; before_event_head: string; after_event_head: string; job_state: "queued"; authoritative_increment: 0 | 1; write_set_digest: string; receipt_digest: string }
interface PromotionReceiptV1 { schema_version: "helix-finding-promotion-receipt.v1"; promotion_id: string; operation_id: string; finding_id: string; cause_id: string; issue_member_digest: string; reverse_member_digest: string; memory_member_digest: string; queue_member_digest: string; member_set_digest: string; status: "queue_ready"; before_projection_digest: string; after_projection_digest: string; authoritative_increment: 0 | 1; receipt_digest: string }
interface PrAuditStorePortV1 { commitJob(plan: PrAuditJobPlanV1): Promise<PrAuditResultV1<AuditJobReceiptV1>> }
interface FindingPromotionStorePortV1 { commitPromotion(bundle: FindingPromotionBundleV1): Promise<PrAuditResultV1<PromotionReceiptV1>> }
```

## §1 完全signatureとDbC

| function | TypeScript signature | DbC | 一意owner U |
|---|---|---|---|
| `verifyGithubPrDelivery` | `(raw: RawPrDeliveryV1, schema: DeliverySchemaV1, transport: TransportReceiptV1) => PrAuditResultV1<VerifiedPrDeliveryV1>` | 必須field、action allowlist、payload/transport digest | `U-GPAP-001` |
| `resolveCurrentPrHead` | `(delivery: VerifiedPrDeliveryV1, observed: PrHeadObservationV1) => PrAuditResultV1<CurrentPrHeadV1>` | repo/PR/SHA/tree exact、lookup failureはjob 0 | `U-GPAP-003` |
| `decidePrDeliveryIdempotency` | `(delivery: VerifiedPrDeliveryV1, prior: PriorDeliveryV1 | null) => PrAuditResultV1<DeliveryDecisionV1>` | 同一digestは増分0、異digestはconflict | `U-GPAP-002` |
| `planPrAuditJob` | `(delivery: VerifiedPrDeliveryV1, head: CurrentPrHeadV1, policy: AuditPolicyV1, roles: AuditRoleSetV1) => PrAuditResultV1<PrAuditJobPlanV1>` | base filterなし、job key一意、Claude≠Codex | `U-GPAP-004` |
| `invalidateAuditJobForBaseChange` | `(current: PrAuditJobV1, observed: PrComparisonIdentityV1) => PrAuditResultV1<AuditJobInvalidationDecisionV1>` | head不変でもbase SHA/tree、merge-base SHA/tree、diff-base変更で旧job stale | `U-GPAP-017` |
| `commitPrAuditJobExactlyOnce` | `(plan: PrAuditJobPlanV1, port: PrAuditStorePortV1) => Promise<PrAuditResultV1<AuditJobReceiptV1>>` | delivery/head/job/event/projectionを不可分commit | `U-GPAP-007` |
| `buildClaudeAuditTask` | `(job: PrAuditJobV1, views: AuditViewSetV1, diff: PrDiffArtifactV1) => PrAuditResultV1<ClaudeAuditTaskV1>` | current head、DB view digest、読取専用、role brief | `U-GPAP-005` |
| `validateAuditFinding` | `(proposal: AuditFindingProposalV1, job: PrAuditJobV1, evidence: EvidenceIndexV1) => PrAuditResultV1<AuditFindingV1>` | affected layer/span/evidence/fingerprint、producer分離 | `U-GPAP-006` |
| `evaluateFindingDisposition` | `(finding: AuditFindingV1, proposal: DispositionProposalV1, authority: AuthorityIndexV1) => PrAuditResultV1<DispositionReceiptV1>` | kind別evidence、non-terminal、appeal route | `U-GPAP-010` |
| `buildFindingPromotion` | `(finding: AuditFindingV1, disposition: DispositionReceiptV1, issue: IssueContractDraftV1, reverse: ReverseTaskDraftV1, memory: MemoryIssueSummaryDraftV1, queue: CodexQueueDraftV1) => PrAuditResultV1<FindingPromotionBundleV1>` | 4 member exactly-once、同cause/head/digest | `U-GPAP-008` |
| `commitFindingPromotionAtomically` | `(bundle: FindingPromotionBundleV1, port: FindingPromotionStorePortV1) => Promise<PrAuditResultV1<PromotionReceiptV1>>` | finding/disposition/promotion/4 target/event/projection全commit | `U-GPAP-009` |

上表はpublic APIごとの単体責務を所有する唯一のUである。composition Uは複数owner Uを置換せず、境界間の引き渡しと
all-or-nothing性だけを検証する。canonical分母は既存の`U-GPAP-001`〜`U-GPAP-017`から増やさない。

| composition U | exact function set（stable順） | compositionである根拠 | 主IT |
|---|---|---|---|
| `U-GPAP-011` | `verifyGithubPrDelivery` → `decidePrDeliveryIdempotency` → `resolveCurrentPrHead` → `planPrAuditJob` → `commitPrAuditJobExactlyOnce` | delivery受理からcurrent-head job commitまでを一つの外部observable transitionとして検証する | `IT-GPAP-001` |
| `U-GPAP-012` | `decidePrDeliveryIdempotency` → `commitPrAuditJobExactlyOnce` | concurrent duplicateのpure decisionとDB winner/loser receiptを同じoperation identityで照合する | `IT-GPAP-007` |
| `U-GPAP-013` | `buildClaudeAuditTask` → `validateAuditFinding` | read-only監査taskから返るproposalが同じjob/head/policy/evidenceへbindする境界を検証する | `IT-GPAP-014` |
| `U-GPAP-014` | `planPrAuditJob` → `buildClaudeAuditTask` → `validateAuditFinding` | planner、dispatch、ingestの全境界でClaude/Codex identity-role-provider分離を維持する | `IT-GPAP-015` |
| `U-GPAP-015` | `commitPrAuditJobExactlyOnce` | public APIの別ownerではなく、同APIが使用する`PrAuditStorePortV1`の各append fault/retry protocolを検証する | `IT-GPAP-013` |
| `U-GPAP-016` | `commitFindingPromotionAtomically` | public APIの別ownerではなく、同APIが使用する`FindingPromotionStorePortV1`のidempotent retry/rebuild protocolを検証する | `IT-GPAP-016` |

`U-GPAP-017`はcompositionではなく、`invalidateAuditJobForBaseChange`の一意owner Uであり`IT-GPAP-017`へ結線する。
`PrAuditJobV1.comparison`はjob作成時の比較identity snapshotであり、`U-GPAP-017`が変更fieldを推測せず導出するための必須入力とする。

### §1.1 API→U→IT厳密結線

owner Uを先頭に置き、そのAPIを使うcomposition／port protocol Uと既存ITを同じ行へexact joinする。

| 公開API | owner U／composition U／port U | 既存IT |
|---|---|---|
| `verifyGithubPrDelivery` | `U-GPAP-001`, `U-GPAP-011` | `IT-GPAP-001`, `IT-GPAP-006` |
| `decidePrDeliveryIdempotency` | `U-GPAP-002`, `U-GPAP-011`, `U-GPAP-012` | `IT-GPAP-001`, `IT-GPAP-002`, `IT-GPAP-007` |
| `resolveCurrentPrHead` | `U-GPAP-003`, `U-GPAP-011` | `IT-GPAP-001`, `IT-GPAP-003` |
| `planPrAuditJob` | `U-GPAP-004`, `U-GPAP-011`, `U-GPAP-014` | `IT-GPAP-001`, `IT-GPAP-004`, `IT-GPAP-015` |
| `buildClaudeAuditTask` | `U-GPAP-005`, `U-GPAP-013`, `U-GPAP-014` | `IT-GPAP-005`, `IT-GPAP-014`, `IT-GPAP-015` |
| `validateAuditFinding` | `U-GPAP-006`, `U-GPAP-013`, `U-GPAP-014` | `IT-GPAP-014`, `IT-GPAP-015` |
| `commitPrAuditJobExactlyOnce` | `U-GPAP-007`, `U-GPAP-011`, `U-GPAP-012`, `U-GPAP-015` | `IT-GPAP-001`, `IT-GPAP-007`, `IT-GPAP-013` |
| `buildFindingPromotion` | `U-GPAP-008` | `IT-GPAP-011` |
| `commitFindingPromotionAtomically` | `U-GPAP-009`, `U-GPAP-016` | `IT-GPAP-008`, `IT-GPAP-009`, `IT-GPAP-016` |
| `evaluateFindingDisposition` | `U-GPAP-010` | `IT-GPAP-010`, `IT-GPAP-012` |
| `invalidateAuditJobForBaseChange` | `U-GPAP-017` | `IT-GPAP-017` |

## §2 主系API tuple

| HSTケース | 主API | 主U | 事前状態 | 期待状態 | 正規failure |
|---|---|---|---|---|
| `HST-CASE-004-01` | `verifyGithubPrDelivery` → `decidePrDeliveryIdempotency` → `resolveCurrentPrHead` → `planPrAuditJob` → `commitPrAuditJobExactlyOnce` | `U-GPAP-011` | `no_audit_job` | `audit_queued` | `なし（正常系）` |
| `HST-CASE-004-02` | `decidePrDeliveryIdempotency` | `U-GPAP-002` | `audit_queued` | `audit_queued` | `HIL_GITHUB_DELIVERY_DUPLICATE` |
| `HST-CASE-004-03` | `resolveCurrentPrHead` | `U-GPAP-003` | `no_audit_job` | `no_audit_job` | `HIL_GITHUB_HEAD_MISMATCH` |
| `HST-CASE-004-04` | `planPrAuditJob` | `U-GPAP-004` | `no_audit_job` | `audit_queued` | `なし（正常系）` |
| `HST-CASE-004-05` | `buildClaudeAuditTask` | `U-GPAP-005` | `assertion_input_ready` | `assertion_pass` | `HIL_FORWARD_LOOP_NOT_CONVERGED` |
| `HST-CASE-004-06` | `verifyGithubPrDelivery` | `U-GPAP-001` | `assertion_input_ready` | `assertion_pass` | `HIL_PR_AUDIT_HOOK_MISSED` |
| `HST-CASE-004-07` | `decidePrDeliveryIdempotency` → `commitPrAuditJobExactlyOnce` | `U-GPAP-012` | `assertion_input_ready` | `assertion_pass` | `HIL_PR_DELIVERY_DUPLICATED` |
| `HST-CASE-005-01` | `commitFindingPromotionAtomically` | `U-GPAP-009` | `finding_open` | `queue_ready` | `なし（正常系）` |
| `HST-CASE-005-02` | `commitFindingPromotionAtomically` | `U-GPAP-009` | `finding_open` | `finding_open` | `HIL_FINDING_PROMOTION_PARTIAL` |
| `HST-CASE-005-03` | `evaluateFindingDisposition` | `U-GPAP-010` | `disposition_pending` | `disposition_pending` | `HIL_FINDING_DUPLICATE_TARGET_MISSING` |
| `HST-CASE-005-04` | `buildFindingPromotion` | `U-GPAP-008` | `assertion_input_ready` | `assertion_pass` | `HIL_FINDING_DROPPED` |
| `HST-CASE-005-05` | `evaluateFindingDisposition` | `U-GPAP-010` | `assertion_input_ready` | `assertion_pass` | `HIL_FINDING_DISPOSITION_INVALID` |

## §3 schema要点と配置

`VerifiedPrDeliveryV1`はrepository/PR/base/head SHA/tree/delivery/action/payload/transport digest、`PrAuditJobV1`は
head/base/merge-base/diff-base/policy/view-set/diffとClaude/Codex roleのdigest、`AuditFindingV1`は
監査対象のjob/head/category/severity/layer/span/evidence/fingerprint、
`FindingPromotionBundleV1`はpromotion/cause/operation/headとIssue/Reverse/memory/queueの実在target keyを持つ。raw body/log/credential/PIIは型へ入れない。

pure coreは`src/github/pr-delivery.ts`、`pr-audit-job.ts`、`src/audit/finding-disposition.ts`、`finding-promotion.ts`、
adapterは`src/runtime/claude-audit-adapter.ts`、Node portは`src/state-db/pr-audit-projection.ts`へ置く候補とする。
既存Issue/Reverse/memory/queue schemaは再定義せず、同じharness.db内の既存keyへ物理FKで参照する。
将来targetが外部DBへ分離される場合も自由形式IDへ縮退せず、Nodeが検証したtarget registryの物理FKとresolver receiptを
同promotion transactionへ含める。

## §4 完了境界

L7主系12/12、canonical U 17件、L8 17件、head race、transaction fault、projection rebuild、別runtime reviewまでdraftとする。

## §5 current HEAD merge admission型契約

```ts
type RequiredReviewContextKindV1 =
  | "authority_l0" | "prototype_l2" | "requirements_l3" | "basic_design_l4"
  | "issue_plan" | "diff" | "trace_consumers" | "security_blast_radius";
interface ReviewContextMaterialV1 { kind: RequiredReviewContextKindV1; locator: string; content_digest: string; decision: "required" | "not_applicable"; authority_digest: string }
interface ContextualPrReviewPacketV1 { schema_version: "helix-contextual-pr-review-packet.v1"; repository_id: string; pr_number: number; head_sha: string; head_tree_digest: string; base_sha: string; policy_digest: string; author_identity: string; author_session_id: string; worker_context_digest: string; materials: readonly ReviewContextMaterialV1[]; packet_digest: string }
interface ContextualPrReviewReceiptV1 { schema_version: "helix-contextual-pr-review-receipt.v1"; packet_digest: string; head_sha: string; reviewer_identity: string; reviewer_session_id: string; reviewer_context_digest: string; verdict: "approve" | "request_changes"; findings_digest: string; reviewed_at: string; receipt_digest: string }
interface PrDatabaseConvergenceProbeV1 { schema_version: "helix-pr-db-convergence-probe.v1"; repository_id: string; pr_number: number; head_sha: string; event_head_digest: string; checkpoint_locator_digest: string; expected_schema_revision: number; rebuild_policy_digest: string; probe_digest: string }
interface PrDatabaseConvergenceObservationV1 { schema_version: "helix-pr-db-convergence-observation.v1"; source_head: string; event_head_digest: string; projection_digest: string; replay_projection_digest: string; checkpoint_digest: string; replay_checkpoint_digest: string; schema_revision: number; stale_count: number; orphan_count: number; rebuild_finding_count: number; observation_digest: string }
interface PrDatabaseConvergenceReceiptV1 { schema_version: "helix-pr-db-convergence-receipt.v1"; probe_digest: string; head_sha: string; projection_digest: string; checkpoint_digest: string; schema_revision: number; stale_count: 0; orphan_count: 0; rebuild_finding_count: 0; receipt_digest: string }
interface LayerAuditGraphV1 { schema_version: "helix-layer-audit-graph.v1"; nodes: readonly string[]; edges: readonly { from: string; to: string; kind: "vertical" | "v_pair" | "consumer" }[]; graph_digest: string }
interface LayerAuditPlanV1 { schema_version: "helix-layer-audit-plan.v1"; changed_nodes: readonly string[]; affected_nodes: readonly string[]; ordered_checks: readonly string[]; reviewer_identity_must_differ: true; plan_digest: string }
type MergeAdmissionFailureV1 = { code: "HIL_CONTEXT_REVIEW_INCOMPLETE" | "HIL_PR_DATABASE_NOT_CONVERGED" | "HIL_AUDIT_FIX_SELF_APPROVED" | "HIL_CI_PERFORMANCE_RECOVERY_MISSING" | "HIL_REQUIREMENT_USER_APPROVAL_MISSING" | "HIL_MAIN_RECOVERY_INCOMPLETE" | "HIL_PRODUCTION_PROMOTION_UNSAFE" | "HIL_UPDATE_BACKLOG_CLASSIFICATION_INVALID"; fields: readonly string[]; evidence_digest: string };
type MergeAdmissionResultV1<T> = { ok: true; value: T } | { ok: false; failures: readonly MergeAdmissionFailureV1[] };
```

全digestはUTF-8 canonical JSONのkey順sort、配列順維持、`sha256:` prefixで計算する。時刻はreceipt identityへ含めず、
再生成可能なmaterial/decision digestと分離する。reviewer identity/session/contextのいずれかがauthor/fixerと同一ならapproveを無効化する。

## §6 追加signatureとDbC

| 関数 | TypeScript署名 | DbC | 所有unit |
|---|---|---|---|
| `buildContextualPrReviewPacket` | `(input: ContextualPrReviewPacketInputV1) => MergeAdmissionResultV1<ContextualPrReviewPacketV1>` | 8 context kind exact、重複0、N/Aはauthority必須、current HEAD束縛 | `U-GPAP-018` |
| `validateContextualPrReviewReceipt` | `(packet, receipt, currentHead, fixer?) => MergeAdmissionResultV1<ContextualPrReviewReceiptV1>` | packet/HEAD exact、identity/session/context分離 | `U-GPAP-019` |
| `buildPrDatabaseConvergenceProbe` | `(input: PrDatabaseConvergenceProbeInputV1) => MergeAdmissionResultV1<PrDatabaseConvergenceProbeV1>` | absolute DB path、SQL、既存DB copy指示を型に持たない | `U-GPAP-020` |
| `evaluatePrDatabaseConvergence` | `(probe, observation) => MergeAdmissionResultV1<PrDatabaseConvergenceReceiptV1>` | source/event/projection/checkpoint/schema一致、stale/orphan/finding 0 | `U-GPAP-021` |
| `commitPrMergeAdmissionReceipts` | `(bundle, port) => Promise<MergeAdmissionResultV1<MergeAdmissionCommitReceiptV1>>` | event→member→projection→checkpoint→公開を単一transaction、CAS | `U-GPAP-022` |
| `planLayerAwareAudit` | `(changedNodes, graph, registry) => MergeAdmissionResultV1<LayerAuditPlanV1>` | unknown/cycle/orphan禁止、上下・V-pair・consumer閉包 | `U-GPAP-023` |
| `validateAuditFixReview` | `(plan, receipt, fixerIdentity, fixerSession, currentHead) => MergeAdmissionResultV1<ContextualPrReviewReceiptV1>` | fixer自己承認と旧HEADを拒否 | `U-GPAP-024` |
| `evaluateCiPerformanceRecovery` | `(runs, budget) => MergeAdmissionResultV1<CiPerformanceDecisionV1>` | correctnessと性能を分離、検査縮退禁止 | `U-GPAP-025` |
| `evaluateRequirementApproval` | `(revision, history, approval) => MergeAdmissionResultV1<RequirementApprovalDecisionV1>` | 回答・mock往復・5問履歴・current revision・人間approver | `U-GPAP-026` |
| `evaluateMainRecoveryRelease` | `(lock, evidence) => MergeAdmissionResultV1<MainRecoveryReleaseDecisionV1>` | Issue/PR/review/doctor/CI/closureが同一fix HEAD | `U-GPAP-027` |
| `prioritizeRecoveryAudit` | `(items) => MergeAdmissionResultV1<readonly AuditQueueItemV1[]>` | active main Recoveryを通常Featureより先にstable sort | `U-GPAP-028` |
| `resolveDeploymentProfile` | `(requirements, risk) => MergeAdmissionResultV1<DeploymentProfileDecisionV1>` | 標準profile、逸脱理由、未知risk fail-close | `U-GPAP-029` |
| `evaluateDeploymentCapability` | `(evidence) => MergeAdmissionResultV1<DeploymentCapabilityDecisionV1>` | plan/concurrency/self-review/OIDC/role分離 | `U-GPAP-030` |
| `evaluateEnvironmentPromotion` | `(candidate) => MergeAdmissionResultV1<PromotionDecisionV1>` | artifact同一、staging/approval/backup/rollback/health/monitoring。proposal-only | `U-GPAP-031` |
| `evaluateProductionMigration` | `(candidate) => MergeAdmissionResultV1<MigrationDecisionV1>` | expand→deploy→contract、restore/compatibility/oracle/個別approval。SQLを返さない | `U-GPAP-032` |
| `classifyUpdateBacklogItem` | `(issue) => MergeAdmissionResultV1<UpdateBacklogDecisionV1>` | 正常futureはactive分母外、異常だけfinding、Feature変換禁止 | `U-GPAP-033` |

## §7 L6/L7 closure更新

canonical owner Uは`U-GPAP-001..033`の33件、L8 ITは`IT-GPAP-001..033`の33件とする。
旧§1の「17件から増やさない」はHST-HIL-004/005 sliceだけの旧境界であり、HST-HIL-034..040追加後の分母には適用しない。
L7で33 owner/composition oracle、current HEAD stale mutation、8 context単独欠落、DB 7比較、transaction 5 fault、
production external write 0を実行し、全greenかつ独立review receiptが揃うまで本書はdraftとする。

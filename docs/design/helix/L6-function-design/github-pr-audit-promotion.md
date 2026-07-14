---
title: "HELIX L6 機能設計 — GitHub PR audit promotion"
layer: L6
kind: add-design
status: draft
created: 2026-07-15
updated: 2026-07-15
owner: Codex / TL
plan: PLAN-L1-07-infinity-loop-platform-requirements
design_slice: HDS-HIL-03
related_l3: docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md
related_l4: docs/design/helix/L4-basic-design/infinity-loop-platform-basic-design.md
related_l5: docs/design/helix/L5-detail/github-pr-audit-promotion.md
related_hst:
  - HST-HIL-004
  - HST-HIL-005
pair_artifact: docs/test-design/helix/L6-github-pr-audit-promotion-unit-test-design.md
next_pair_freeze: L7
requirements:
  - HR-FR-HIL-03
  - HAC-HIL-03a
  - HAC-HIL-03b
  - HAC-HIL-03c
---

# HELIX L6 機能設計 — GitHub PR audit promotion

## §0 型付きfailure

```ts
type PrAuditFailure =
  | { code: "HIL_GITHUB_DELIVERY_DUPLICATE" | "HIL_PR_DELIVERY_DUPLICATED"; delivery_id: string }
  | { code: "HIL_GITHUB_HEAD_MISMATCH" | "HIL_PR_AUDIT_HOOK_MISSED"; expected_head: string; observed_head: string }
  | { code: "HIL_FORWARD_LOOP_NOT_CONVERGED"; missing_join_ids: string[] }
  | { code: "HIL_FINDING_PROMOTION_PARTIAL" | "HIL_FINDING_DROPPED"; missing_members: PromotionMemberKind[] }
  | { code: "HIL_FINDING_DUPLICATE_TARGET_MISSING" | "HIL_FINDING_DISPOSITION_INVALID"; finding_id: string }
  | { code: "HIL_GITHUB_DELIVERY_CONFLICT" | "HIL_AUDIT_ROLE_NOT_SEPARATED" | "HIL_AUDIT_FINDING_STALE"; digest: string };
type PromotionMemberKind = "issue" | "reverse" | "memory_summary" | "codex_queue";
```

## §1 完全signatureとDbC

| function | TypeScript signature | DbC | 一意owner U |
|---|---|---|---|
| `verifyGithubPrDelivery` | `(raw: unknown, schema: DeliverySchema, transport: TransportReceipt) => Result<VerifiedPrDelivery, PrAuditFailure[]>` | 必須field、action allowlist、payload/transport digest | `U-GPAP-001` |
| `resolveCurrentPrHead` | `(delivery: VerifiedPrDelivery, observed: PrHeadObservation) => Result<CurrentPrHead, PrAuditFailure>` | repo/PR/SHA/tree exact、lookup failureはjob 0 | `U-GPAP-003` |
| `decidePrDeliveryIdempotency` | `(delivery: VerifiedPrDelivery, prior: PriorDelivery | null) => DeliveryDecision` | 同一digestは増分0、異digestはconflict | `U-GPAP-002` |
| `planPrAuditJob` | `(delivery: VerifiedPrDelivery, head: CurrentPrHead, policy: AuditPolicy, roles: AuditRoleSet) => Result<PrAuditJobPlan, PrAuditFailure[]>` | base filterなし、job key一意、Claude≠Codex | `U-GPAP-004` |
| `invalidateAuditJobForBaseChange` | `(current: PrAuditJob, observed: PrComparisonIdentity) => AuditJobInvalidationDecision` | head不変でもbase SHA/tree、merge-base SHA/tree、diff-base変更で旧job stale | `U-GPAP-017` |
| `commitPrAuditJobExactlyOnce` | `(plan: PrAuditJobPlan, port: PrAuditStorePort) => Promise<Result<AuditJobReceipt, PrAuditFailure[]>>` | delivery/head/job/event/projectionを不可分commit | `U-GPAP-007` |
| `buildClaudeAuditTask` | `(job: PrAuditJob, views: AuditViewSet, diff: PrDiffArtifact) => Result<ClaudeAuditTask, PrAuditFailure[]>` | current head、DB view digest、読取専用、role brief | `U-GPAP-005` |
| `validateAuditFinding` | `(proposal: unknown, job: PrAuditJob, evidence: EvidenceIndex) => Result<AuditFinding, PrAuditFailure[]>` | affected layer/span/evidence/fingerprint、producer分離 | `U-GPAP-006` |
| `evaluateFindingDisposition` | `(finding: AuditFinding, proposal: DispositionProposal, authority: AuthorityIndex) => Result<DispositionReceipt, PrAuditFailure>` | kind別evidence、non-terminal、appeal route | `U-GPAP-010` |
| `buildFindingPromotion` | `(finding: AuditFinding, disposition: DispositionReceipt, issue: IssueContractDraft, reverse: ReverseTaskDraft, memory: MemoryIssueSummaryDraft, queue: CodexQueueDraft) => Result<FindingPromotionBundle, PrAuditFailure[]>` | 4 member exactly-once、同cause/head/digest | `U-GPAP-008` |
| `commitFindingPromotionAtomically` | `(bundle: FindingPromotionBundle, port: FindingPromotionStorePort) => Promise<Result<PromotionReceipt, PrAuditFailure[]>>` | finding/disposition/promotion/4 target/event/projection全commit | `U-GPAP-009` |

上表はpublic APIごとの単体責務を所有する唯一のUである。composition Uは複数owner Uを置換せず、境界間の引き渡しと
all-or-nothing性だけを検証する。canonical分母は既存の`U-GPAP-001`〜`U-GPAP-017`から増やさない。

| composition U | exact function set（stable順） | compositionである根拠 | 主IT |
|---|---|---|---|
| `U-GPAP-011` | `verifyGithubPrDelivery` → `decidePrDeliveryIdempotency` → `resolveCurrentPrHead` → `planPrAuditJob` → `commitPrAuditJobExactlyOnce` | delivery受理からcurrent-head job commitまでを一つの外部observable transitionとして検証する | `IT-GPAP-001` |
| `U-GPAP-012` | `decidePrDeliveryIdempotency` → `commitPrAuditJobExactlyOnce` | concurrent duplicateのpure decisionとDB winner/loser receiptを同じoperation identityで照合する | `IT-GPAP-007` |
| `U-GPAP-013` | `buildClaudeAuditTask` → `validateAuditFinding` | read-only監査taskから返るproposalが同じjob/head/policy/evidenceへbindする境界を検証する | `IT-GPAP-014` |
| `U-GPAP-014` | `planPrAuditJob` → `buildClaudeAuditTask` → `validateAuditFinding` | planner、dispatch、ingestの全境界でClaude/Codex identity-role-provider分離を維持する | `IT-GPAP-015` |
| `U-GPAP-015` | `commitPrAuditJobExactlyOnce` | public APIの別ownerではなく、同APIが使用する`PrAuditStorePort`の各append fault/retry protocolを検証する | `IT-GPAP-013` |
| `U-GPAP-016` | `commitFindingPromotionAtomically` | public APIの別ownerではなく、同APIが使用する`FindingPromotionStorePort`のidempotent retry/rebuild protocolを検証する | `IT-GPAP-016` |

`U-GPAP-017`はcompositionではなく、`invalidateAuditJobForBaseChange`の一意owner Uであり`IT-GPAP-017`へ結線する。

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

`VerifiedPrDelivery`はrepository/PR/base/head SHA/tree/delivery/action/payload/transport digest、`PrAuditJob`は
head/base/merge-base/diff-base/policy/view-set/diffとClaude/Codex roleのdigest、`AuditFinding`は
監査対象のjob/head/category/severity/layer/span/evidence/fingerprint、
`FindingPromotionBundle`はpromotion/cause/operation/headとIssue/Reverse/memory/queueの実在target keyを持つ。raw body/log/credential/PIIは型へ入れない。

pure coreは`src/github/pr-delivery.ts`、`pr-audit-job.ts`、`src/audit/finding-disposition.ts`、`finding-promotion.ts`、
adapterは`src/runtime/claude-audit-adapter.ts`、Node portは`src/state-db/pr-audit-projection.ts`へ置く候補とする。
既存Issue/Reverse/memory/queue schemaは再定義せず、同じharness.db内の既存keyへ物理FKで参照する。
将来targetが外部DBへ分離される場合も自由形式IDへ縮退せず、Nodeが検証したtarget registryの物理FKとresolver receiptを
同promotion transactionへ含める。

## §4 完了境界

L7主系12/12、canonical U 17件、L8 17件、head race、transaction fault、projection rebuild、別runtime reviewまでdraftとする。

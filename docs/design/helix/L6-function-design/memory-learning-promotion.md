---
title: "HELIX L6 機能設計 — memory learning promotion"
layer: L6
kind: add-design
status: draft
created: 2026-07-15
updated: 2026-07-15
owner: Codex / TL
plan: PLAN-L1-07-infinity-loop-platform-requirements
design_slice: HDS-HIL-07
related_hst:
  - HST-HIL-015
  - HST-HIL-016
related_l5: docs/design/helix/L5-detail/memory-learning-promotion.md
related_l3: docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md
related_l4: docs/design/helix/L4-basic-design/infinity-loop-platform-basic-design.md
pair_artifact: docs/test-design/helix/L6-memory-learning-promotion-unit-test-design.md
next_pair_freeze: L7
requirements:
  - HR-FR-HIL-07
  - HAC-HIL-07a
  - HAC-HIL-07b
  - HAC-HIL-07c
system_tests:
  - HST-HIL-015
  - HST-HIL-016
---

# HELIX L6 機能設計 — memory learning promotion

## §0 関数境界

pure functionはmemory file、harness.db、clock、provider transcriptを直接読まない。completion、continuation、finding、fixture、metric、
review、current revisionを明示snapshotとして受け取る。memory append、DB event、shadow runner、artifact disableはinjected portだけが行う。
既存`compactMemory`は物理整理、`memoryPromotionNudge`は警告であり、以下のAPIの代用にしない。

## §1 public APIとexact oracle

全APIは対応するHST caseの`(case_id, pre_state, expected_state, canonical_failure)`をL5 §9のatomic tupleから受け、成功・失敗の双方でpre_stateを照合してからexpected_stateを返す。state不一致時はwrite/event/receipt 0とし、L7 oracleはResultだけでなくstate tupleを独立assertする。

| API | signature | DbC／result | L7 oracle | HAC | HST exact case | 正規failure |
|---|---|---|---|---|---|---|
| `parseVerifiedCompletionPacket` | `(raw, verificationIndex, authorityResolver, bounds) => ResultV1<VerifiedCompletionPacketV1, MemoryLearningFailureV1>` | verified receipt、causality、digest、typed bounded refのauthority/revision/digest/count/bytesをstrict検証 | `U-MLP-001` | `HAC-HIL-07a` | `HST-CASE-015-06` | `HIL_MEMORY_COMPACTION_INVALID` |
| `partitionCompletionKnowledge` | `(packet, candidates, continuation) => KnowledgePartitionDecisionV1` | 全candidateをdurable/continuation/forbidden/duplicate/no-valueへ一意分類 | `U-MLP-002` | `HAC-HIL-07a`, `HAC-HIL-07b` | `HST-CASE-015-03`, `HST-CASE-015-06`, `HST-CASE-015-07` | `HIL_MEMORY_PROGRESS_FORBIDDEN`; `HIL_MEMORY_COMPACTION_INVALID`; `HIL_MEMORY_EVENT_MIXED` |
| `classifyForbiddenMemoryContent` | `(candidate, policy) => MemoryContentDecisionV1` | body/metadataのraw log、progress、secret/credential/PIIを同じpolicyで検出 | `U-MLP-003` | `HAC-HIL-07b` | `HST-CASE-015-02`, `HST-CASE-015-03`, `HST-CASE-015-04` | `HIL_MEMORY_RAW_LOG_FORBIDDEN`; `HIL_MEMORY_PROGRESS_FORBIDDEN`; `HIL_MEMORY_SECRET_FORBIDDEN` |
| `buildDurableKnowledgeCandidate` | `(packet, partition, currentMemory) => KnowledgeCandidateDecisionV1` | decision/constraint/referenceだけをpromote/supersede/no-promotion候補化 | `U-MLP-004` | `HAC-HIL-07a` | `HST-CASE-015-01` | `なし（正常系）` |
| `enforceKnowledgePromoterSeparation` | `(actors: PromotionActorSetV1, policy) => RoleSeparationDecisionV1` | worker/promoter/reviewer/final verifierの全6 pairでidentity、role、provider family collisionを拒否 | `U-MLP-005` | `HAC-HIL-07b` | `HST-CASE-015-05` | `HIL_MEMORY_PROMOTER_NOT_INDEPENDENT` |
| `validateKnowledgePromotionProposal` | `(packet, candidate, promoter, policy) => ResultV1<ValidatedKnowledgePromotionV1, MemoryLearningFailureV1>` | provenance、partition、event kind、supersession、forbidden count 0を要求 | `U-MLP-006` | `HAC-HIL-07a`, `HAC-HIL-07b` | `HST-CASE-015-06`, `HST-CASE-015-07` | `HIL_MEMORY_COMPACTION_INVALID`; `HIL_MEMORY_EVENT_MIXED` |
| `planKnowledgePromotionCommit` | `(validated, memoryHead, ledgerHead) => KnowledgePromotionCommitPlanV1` | memory appendとledger eventを同operationへbindしterminal exactly-one | `U-MLP-007` | `HAC-HIL-07a` | `HST-CASE-015-01` | `なし（正常系）` |
| `commitKnowledgePromotion` | `(plan, memoryPort, dbPort) => Promise<ResultV1<KnowledgePromotionCommitOutcomeV1, MemoryLearningFailureV1>>` | Node portだけ。JSONL append後DB faultはprojection_pending、terminal 0 | `U-MLP-008` | `HAC-HIL-07a`, `HAC-HIL-07b` | `HST-CASE-015-01`, `HST-CASE-015-06` | `なし（正常系）`; `HIL_MEMORY_COMPACTION_INVALID` |
| `reconcileKnowledgePromotionProjection` | `(pending, memoryPort, dbPort) => Promise<ResultV1<KnowledgePromotionReceiptV1, MemoryLearningFailureV1>>` | operation/entry digest/head一致時だけ再開し、JSONL増分0、DB一件、terminal exactly-one | `U-MLP-008` | `HAC-HIL-07a` | `HST-CASE-015-01` | `なし（正常系）`; `HIL_MEMORY_COMPACTION_INVALID` |
| `buildNoKnowledgePromotionReceipt` | `(packet, reason, evidence) => NoPromotionReceiptV1` | duplicate/no-value/continuation-onlyをbody非包含digestで終端化 | `U-MLP-009` | `HAC-HIL-07a` | `HST-CASE-015-01` | `なし（正常系）` |
| `aggregateLearningPattern` | `(findingRefs, repairRefs, policy) => PatternDecisionV1` | cause重複排除、support/独立causality、source digestを固定 | `U-MLP-010` | `HAC-HIL-07c` | `HST-CASE-016-07` | `HIL_LEARNING_PROMOTION_PREMATURE` |
| `buildLearningRecipe` | `(pattern, scope, oracle, fixtureContract) => RecipeDecisionV1` | 再現手順、scope/non-goal、oracle、fixture契約を必須化 | `U-MLP-011` | `HAC-HIL-07c` | `HST-CASE-016-02` | `HIL_PROMOTION_FIXTURE_MISSING` |
| `validatePromotionFixture` | `(recipe, fixture, sourceSnapshot) => FixtureValidationDecisionV1` | version、input/oracle、source、expected result、digestをstrict検証 | `U-MLP-012` | `HAC-HIL-07c` | `HST-CASE-016-02` | `HIL_PROMOTION_FIXTURE_MISSING` |
| `planPromotionShadowRun` | `(recipe, fixture, baseline, candidate) => ShadowRunPlanV1` | 同一fixture/oracle、non-blocking、stable input digestを固定 | `U-MLP-013` | `HAC-HIL-07c` | `HST-CASE-016-01` | `なし（正常系）` |
| `measurePromotionEffect` | `(plan, before, after, coveragePolicy) => PromotionEffectDecisionV1` | success、FP/FN、coverage、runtime/costを同一分母で比較 | `U-MLP-014` | `HAC-HIL-07c` | `HST-CASE-016-03` | `HIL_PROMOTION_EFFECT_MISSING` |
| `validateIndependentPromotionReview` | `(actors, effect, review) => PromotionReviewDecisionV1` | 4主体全6 pairのidentity/provider分離、effect/fixture/rollback bindを要求 | `U-MLP-015` | `HAC-HIL-07b`, `HAC-HIL-07c` | `HST-CASE-015-05`, `HST-CASE-016-03`, `HST-CASE-016-07` | `HIL_MEMORY_PROMOTER_NOT_INDEPENDENT`; `HIL_PROMOTION_EFFECT_MISSING`; `HIL_LEARNING_PROMOTION_PREMATURE` |
| `decidePromotionShadowVerdict` | `(effect, review, regressionPolicy) => ShadowVerdictV1` | 改善＋退行0だけverified、一件退行でrollback | `U-MLP-016` | `HAC-HIL-07c` | `HST-CASE-016-01`, `HST-CASE-016-04` | `なし（正常系）`; `HIL_PROMOTION_SHADOW_REGRESSION` |
| `validateLearningPromotionTransition` | `(current, next, evidenceSet) => PromotionTransitionDecisionV1` | 許可graph、fixture/effect/review/rollback prerequisiteを評価 | `U-MLP-017` | `HAC-HIL-07b`, `HAC-HIL-07c` | `HST-CASE-016-05`, `HST-CASE-016-08` | `HIL_PROMOTION_IMMEDIATE_GATE_FORBIDDEN`; `HIL_PROMOTION_STAGE_BYPASS` |
| `planSkillPromotion` | `(shadow, effect, review, rollback) => SkillPromotionPlanV1` | shadow_verified、目的metric改善、独立review、rollbackを要求 | `U-MLP-018` | `HAC-HIL-07c` | `HST-CASE-016-03`, `HST-CASE-016-06` | `HIL_PROMOTION_EFFECT_MISSING`; `HIL_PROMOTION_ROLLBACK_MISSING` |
| `planDetectorPromotion` | `(shadow, effect, review, rollback) => DetectorPromotionPlanV1` | FP/FN policy、finding schema、限定scope、rollbackを要求 | `U-MLP-019` | `HAC-HIL-07c` | `HST-CASE-016-06` | `HIL_PROMOTION_ROLLBACK_MISSING` |
| `planBlockingGatePromotion` | `(activeCapability, effect, review, rollback, coverage) => GatePromotionPlanV1` | active skill/detector、coverage改善、退行0、rollbackを要求 | `U-MLP-020` | `HAC-HIL-07b`, `HAC-HIL-07c` | `HST-CASE-016-05`, `HST-CASE-016-07` | `HIL_PROMOTION_IMMEDIATE_GATE_FORBIDDEN`; `HIL_LEARNING_PROMOTION_PREMATURE` |
| `planLearningRollback` | `(activeRevision, regression, rollbackTarget) => LearningRollbackPlanV1` | target digest、disable集合、cause、retire/fenceを不可分計画 | `U-MLP-021` | `HAC-HIL-07c` | `HST-CASE-016-04`, `HST-CASE-016-06` | `HIL_PROMOTION_SHADOW_REGRESSION`; `HIL_PROMOTION_ROLLBACK_MISSING` |
| `validateRetiredPromotionReentry` | `(retired, candidate, evidenceSet) => ReentryDecisionV1` | 同revision/同evidence再active拒否、新revision/shadow/reviewer必須 | `U-MLP-022` | `HAC-HIL-07c` | `HST-CASE-016-08` | `HIL_PROMOTION_STAGE_BYPASS` |
| `buildLearningActivationBundle` | `(plan, current, evidence, operation) => ResultV1<LearningActivationCommitBundleV1, MemoryLearningFailureV1>` | active pointer、artifact/config/gate state、event/projection/receipt、rollback targetとexpected headsを正規化 | `U-MLP-023` | `HAC-HIL-07b`, `HAC-HIL-07c` | supporting | `HIL_PROMOTION_ACTIVATION_CONFLICT` |
| `commitLearningActivation` | `(bundle, store) => Promise<ResultV1<LearningActivationReceiptV1, MemoryLearningFailureV1>>` | skill/detector/gate active化write setを単一Node transactionでCAS commit | `U-MLP-024` | `HAC-HIL-07b`, `HAC-HIL-07c` | supporting | `HIL_PROMOTION_ACTIVATION_CONFLICT` |
| `buildLearningRollbackBundle` | `(plan, current, evidence, operation) => ResultV1<LearningRollbackCommitBundleV1, MemoryLearningFailureV1>` | current disable、target restore、pointer/event/projection/receiptを正規化 | `U-MLP-025` | `HAC-HIL-07c` | supporting | `HIL_PROMOTION_ROLLBACK_MISSING` |
| `commitLearningRollback` | `(bundle, store) => Promise<ResultV1<LearningRollbackReceiptV1, MemoryLearningFailureV1>>` | disable/restore/publish/receiptを単一Node transactionでCAS commit | `U-MLP-026` | `HAC-HIL-07c` | supporting | `HIL_PROMOTION_ACTIVATION_CONFLICT` |
| `reconcileLearningActivationTransaction` | `(operationId, immutableEvidence, store) => Promise<ResultV1<LearningTransactionReceiptV1, MemoryLearningFailureV1>>` | immutable evidenceからactive/rollback projectionだけを復元 | `U-MLP-027` | `HAC-HIL-07c` | supporting | `HIL_PROMOTION_RECONCILE_FAILED` |

## §2 schema

公開signatureの閉包対象は成功結果23件と共通failure 1件の計24件であり、すべて本節のslice-local `*V1`を参照する。補助alias/port/bundleも本節内で解決し、型のversion化によってAPI/U/IT/HST/failureの分母、owner、exact join、memory/recipe/skill/detector/gateのpromotion authorityを変更しない。

```ts
type ResultV1<T, E> =
  | { ok: true; value: T }
  | { ok: false; error: E };
type KnowledgePromotionDecisionV1 = "promote" | "supersede" | "no_promotion";
type LearningSubjectKindV1 = "recipe" | "skill" | "detector" | "gate";
type LearningCapabilityKindV1 = "skill" | "detector" | "gate";
type LearningPromotionStageV1 =
  | "raw_event_ref" | "pattern" | "recipe" | "shadow" | "shadow_verified"
  | "skill_candidate" | "skill_active" | "detector_candidate" | "detector_active"
  | "gate_candidate" | "gate_active" | "rolled_back" | "retired";
type KnowledgePromotionCommitStateV1 =
  | "planned"
  | "memory_appended"
  | "projection_pending"
  | "projected"
  | "terminal";

type BoundedFactAuthorityV1 =
  | "completion_receipt"
  | "pull_request"
  | "ci_receipt"
  | "audit_finding"
  | "oracle_receipt"
  | "design_decision"
  | "raw_log_evidence";

interface BoundedFactRefV1 {
  schema_version: "helix-bounded-fact-ref.v1";
  authority: BoundedFactAuthorityV1;
  authority_id: string;
  immutable_revision: string;
  content_digest: string;
  media_kind: "durable_fact" | "raw_log_reference";
  item_count: number;
  byte_count: number;
}

interface VerifiedCompletionPacketV1 {
  schema_version: "helix-verified-completion-packet.v1";
  causality_id: string;
  issue_id: string;
  completion_receipt_digest: string;
  worker_identity_digest: string;
  verification_receipt_digest: string;
  pr_head_digest: string | null;
  ci_receipt_digests: string[];
  audit_finding_digests: string[];
  oracle_receipt_digests: string[];
  candidate_fact_refs: BoundedFactRefV1[];
  continuation_ref: BoundedFactRefV1 | null;
  packet_digest: string;
}

interface KnowledgePartitionDecisionV1 {
  packet_digest: string;
  classifications: Array<{ fact_ref_digest: string; classification: "durable_knowledge" | "continuation" | "forbidden" | "duplicate" | "no_value"; reason_code: string; evidence_digest: string }>;
  durable_count: number; continuation_count: number; forbidden_count: number;
  duplicate_count: number; no_value_count: number; classification_set_digest: string; complete: true;
}

interface MemoryContentDecisionV1 {
  candidate_digest: string; body_digest: string; metadata_digest: string;
  classification: "allowed" | "raw_log" | "progress" | "secret_or_pii";
  failure_code: MemoryLearningFailureV1["code"] | null; allowed: boolean;
  policy_digest: string; decision_digest: string;
}

interface KnowledgeCandidateDecisionV1 {
  causality_id: string; decision: KnowledgePromotionDecisionV1; memory_key: string;
  proposed_revision: number | null; supersedes_entry_digest: string | null;
  durable_fact_ref_digests: string[]; continuation_ref_digest: string | null; candidate_digest: string;
}

interface PromotionActorIdentityV1 {
  role: "worker" | "promoter" | "reviewer" | "final_verifier";
  identity_digest: string;
  role_contract_digest: string;
  provider_family: string;
}

interface PromotionActorSetV1 {
  worker: PromotionActorIdentityV1;
  promoter: PromotionActorIdentityV1;
  reviewer: PromotionActorIdentityV1;
  final_verifier: PromotionActorIdentityV1;
}

interface RoleSeparationDecisionV1 {
  actor_set_digest: string; checked_pair_count: 6; identity_collision_count: number;
  role_collision_count: number; provider_family_collision_count: number;
  separated: boolean; decision_digest: string;
}

interface ValidatedKnowledgePromotionV1 {
  causality_id: string; completion_receipt_digest: string; candidate_digest: string;
  promoter_identity_digest: string; verification_receipt_digest: string; partition_digest: string;
  provenance_digest: string; supersession_digest: string | null; forbidden_count: 0;
  event_kind: "completion"; valid: true; validation_digest: string;
}

interface KnowledgePromotionCommitPlanV1 {
  operation_id: string; payload_digest: string; causality_id: string;
  decision: KnowledgePromotionDecisionV1; expected_memory_head_digest: string;
  expected_ledger_head_digest: string; memory_entry_digest: string | null;
  ledger_event_digest: string; terminal_receipt_digest: string;
  append_order: readonly ["memory_jsonl", "harness_db"]; plan_digest: string;
}

interface KnowledgePromotionCommitOutcomeV1 {
  operation_id: string;
  state: KnowledgePromotionCommitStateV1;
  memory_entry_digest: string;
  expected_db_head_digest: string;
  receipt: KnowledgePromotionReceiptV1 | null;
}

interface KnowledgePromotionReceiptV1 {
  schema_version: "helix-knowledge-promotion-receipt.v1";
  operation_id: string;
  causality_id: string;
  completion_receipt_digest: string;
  worker_identity_digest: string;
  promoter_identity_digest: string;
  reviewer_identity_digest: string;
  final_verifier_identity_digest: string;
  worker_provider_family: string;
  promoter_provider_family: string;
  reviewer_provider_family: string;
  final_verifier_provider_family: string;
  verification_receipt_digest: string;
  decision: KnowledgePromotionDecisionV1;
  memory_entry_digest: string | null;
  supersedes_entry_digest: string | null;
  continuation_ref_digest: string | null;
  input_digest: string;
  output_digest: string;
  node_authority: true;
}

interface NoPromotionReceiptV1 {
  schema_version: "helix-no-knowledge-promotion-receipt.v1"; causality_id: string;
  completion_receipt_digest: string; reason: "duplicate" | "no_value" | "continuation_only";
  input_digest: string; output_digest: string; continuation_ref_digest: string | null;
  body_included: false; node_authority: true;
}

interface PatternDecisionV1 {
  pattern_id: string; finding_ref_digests: string[]; repair_ref_digests: string[];
  support_count: number; independent_causality_count: number; threshold_met: boolean;
  state: "raw_event_ref" | "pattern"; source_set_digest: string; decision_digest: string;
}

interface RecipeDecisionV1 {
  recipe_id: string; pattern_id: string; recipe_version: number; reproduction_steps_digest: string;
  scope_digest: string; non_goal_digest: string; oracle_digest: string;
  fixture_contract_digest: string; owner_authority_digest: string;
  state: "pattern" | "recipe"; decision_digest: string;
}

interface FixtureValidationDecisionV1 {
  fixture_id: string; fixture_version: number; recipe_id: string; source_snapshot_digest: string;
  input_digest: string; oracle_digest: string; expected_result_digest: string;
  fixture_digest: string; valid: boolean; decision_digest: string;
}

interface ShadowRunPlanV1 {
  shadow_run_id: string; recipe_id: string; candidate_subject_digest: string;
  source_snapshot_digest: string; fixture_digest: string; oracle_digest: string; input_digest: string;
  baseline_revision: string; candidate_revision: string; blocking_side_effect_count: 0; plan_digest: string;
}

interface PromotionEffectDecisionV1 {
  shadow_run_plan_digest: string; before_result_digest: string; after_result_digest: string;
  metric_denominator: number; success_rate_delta: number; false_positive_rate_delta: number;
  false_negative_rate_delta: number; coverage_denominator: number; design_coverage_delta: number;
  runtime_cost_delta: number; regression_count: number; verified: boolean; effect_digest: string;
}

interface PromotionReviewDecisionV1 {
  actor_set_digest: string; effect_digest: string; fixture_digest: string; rollback_target_digest: string;
  reviewer_identity_digest: string; final_verifier_identity_digest: string; role_separated: true;
  decision: "approve" | "reject" | "rollback"; review_digest: string;
}

interface ShadowVerdictV1 {
  shadow_run_digest: string; effect_digest: string; review_digest: string; from_stage: "shadow";
  to_stage: "shadow_verified" | "rolled_back"; regression_count: number;
  active_write_count: 0; rollback_required: boolean; verdict_digest: string;
}

interface PromotionTransitionDecisionV1 {
  subject_kind: LearningSubjectKindV1; subject_id: string; subject_revision: number;
  from_stage: LearningPromotionStageV1; to_stage: LearningPromotionStageV1;
  prerequisite_receipt_digests: string[]; rollback_target_digest: string | null;
  allowed: boolean; decision_digest: string;
}

interface SkillPromotionPlanV1 {
  subject_kind: "skill"; skill_id: string; subject_revision: number; shadow_receipt_digest: string;
  effect_receipt_digest: string; review_receipt_digest: string; rollback_target_digest: string;
  scope_digest: string; artifact_digest: string; target_stage: "skill_candidate" | "skill_active"; plan_digest: string;
}

interface DetectorPromotionPlanV1 {
  subject_kind: "detector"; detector_id: string; subject_revision: number; finding_schema_digest: string;
  false_positive_negative_policy_digest: string; scope_digest: string; shadow_receipt_digest: string;
  effect_receipt_digest: string; review_receipt_digest: string; rollback_target_digest: string;
  detector_config_digest: string; target_stage: "detector_candidate" | "detector_active"; plan_digest: string;
}

interface GatePromotionPlanV1 {
  subject_kind: "gate"; gate_id: string; subject_revision: number;
  source_capability_kind: "skill" | "detector"; source_capability_id: string;
  source_capability_revision: number; coverage_digest: string; effect_receipt_digest: string;
  review_receipt_digest: string; rollback_target_digest: string; gate_policy_digest: string;
  scope_digest: string; blocking: true; target_stage: "gate_candidate" | "gate_active"; plan_digest: string;
}

interface LearningRollbackPlanV1 {
  subject_kind: LearningCapabilityKindV1; subject_id: string; subject_revision: number;
  regression_digest: string; current_revision_digest: string; target_revision_digest: string;
  disable_current_digest: string; restore_target_digest: string; retire_digest: string;
  fence_digest: string; plan_digest: string;
}

interface ReentryDecisionV1 {
  subject_kind: LearningCapabilityKindV1; subject_id: string; retired_revision: number;
  candidate_revision: number; prior_evidence_digest: string; new_evidence_digest: string;
  new_shadow_receipt_digest: string; new_reviewer_receipt_digest: string;
  allowed: boolean; decision_digest: string;
}

interface PromotionEffectReceiptV1 {
  schema_version: "helix-promotion-effect-receipt.v1";
  subject_kind: LearningSubjectKindV1;
  subject_version: string;
  fixture_set_digest: string;
  oracle_set_digest: string;
  before_result_digest: string;
  after_result_digest: string;
  success_rate_delta: number;
  false_positive_rate_delta: number;
  false_negative_rate_delta: number;
  design_coverage_delta: number;
  regression_count: number;
  worker_identity_digest: string;
  promoter_identity_digest: string;
  reviewer_identity_digest: string;
  final_verifier_identity_digest: string;
  worker_provider_family: string;
  promoter_provider_family: string;
  reviewer_provider_family: string;
  final_verifier_provider_family: string;
  review_receipt_digest: string;
  rollback_target_digest: string;
}
```

receiptはraw body、log、transcript、secret、PII、credentialを持たない。continuationはopaque ref digestだけを持ち、state本文を持たない。
effectの比率は分母、sample count、policy versionを別evidenceへbindし、値だけの比較を許さない。

```ts
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

interface LearningActivationCommitBundleV1 {
  operation_id: string;
  payload_digest: string;
  subject_kind: "skill" | "detector" | "gate";
  subject_id: string;
  subject_revision: number;
  expected_event_head: string;
  expected_projection_head: string;
  prior_active_revision: number | null;
  artifact_config_or_gate_digest: string;
  shadow_effect_review_verifier_digest: string;
  authority_freshness_digest: string;
  rollback_target_digest: string;
}

interface LearningRollbackCommitBundleV1 extends LearningActivationCommitBundleV1 {
  disable_current_digest: string;
  restore_publish_target_digest: string;
}

interface LearningTransactionReceiptV1 {
  operation_id: string;
  payload_digest: string;
  transaction_kind: "activation" | "rollback";
  subject_kind: LearningActivationCommitBundleV1["subject_kind"];
  subject_id: string;
  subject_revision: number;
  before_active_revision: number | null;
  after_active_revision: number | null;
  before_event_head: string;
  after_event_head: string;
  before_projection_head: string;
  after_projection_head: string;
  write_set_digest: string;
  row_count_digest: string;
}

interface LearningActivationReceiptV1 extends LearningTransactionReceiptV1 { transaction_kind: "activation" }
interface LearningRollbackReceiptV1 extends LearningTransactionReceiptV1 { transaction_kind: "rollback" }

interface LearningImmutableEvidenceV1 {
  operation_id: string;
  payload_digest: string;
  transaction_kind: LearningTransactionReceiptV1["transaction_kind"];
  subject_kind: LearningSubjectKindV1;
  subject_id: string;
  subject_revision: number;
  artifact_config_or_gate_digest: string;
  rollback_target_digest: string;
  expected_event_head: string;
  expected_projection_head: string;
}

interface LearningPromotionStoreV1 {
  commitActivation(bundle: LearningActivationCommitBundleV1): Promise<ResultV1<LearningActivationReceiptV1, MemoryLearningFailureV1>>;
  commitRollback(bundle: LearningRollbackCommitBundleV1): Promise<ResultV1<LearningRollbackReceiptV1, MemoryLearningFailureV1>>;
  readOperation(operationId: string): Promise<LearningTransactionReceiptV1 | null>;
  readActiveRevision(subjectKind: LearningSubjectKindV1, subjectId: string): Promise<number | null>;
  readEventHead(subjectKind: LearningSubjectKindV1, subjectId: string): Promise<string>;
  readProjectionHead(subjectKind: LearningSubjectKindV1, subjectId: string): Promise<string>;
  reconcile(operationId: string, evidence: LearningImmutableEvidenceV1): Promise<ResultV1<LearningTransactionReceiptV1, MemoryLearningFailureV1>>;
  rebuildProjection(subjectKind: LearningSubjectKindV1, subjectId: string): Promise<ProjectionDigestV1>;
}

type MemoryLearningFailureV1 = {
  code: "HIL_LEARNING_PROMOTION_PREMATURE" | "HIL_MEMORY_COMPACTION_INVALID" | "HIL_MEMORY_EVENT_MIXED" | "HIL_MEMORY_PROGRESS_FORBIDDEN" | "HIL_MEMORY_PROMOTER_NOT_INDEPENDENT" | "HIL_MEMORY_RAW_LOG_FORBIDDEN" | "HIL_MEMORY_SECRET_FORBIDDEN" | "HIL_PROMOTION_ACTIVATION_CONFLICT" | "HIL_PROMOTION_EFFECT_MISSING" | "HIL_PROMOTION_FIXTURE_MISSING" | "HIL_PROMOTION_IMMEDIATE_GATE_FORBIDDEN" | "HIL_PROMOTION_RECONCILE_FAILED" | "HIL_PROMOTION_ROLLBACK_MISSING" | "HIL_PROMOTION_SHADOW_REGRESSION" | "HIL_PROMOTION_STAGE_BYPASS";
  evidence_digest: string;
  operation_id: string | null;
  subject_kind: LearningSubjectKindV1 | null;
  subject_id: string | null;
  retryable: boolean;
};
```

`ProjectionDigestV1`の共有semantic shape正本はL4基本設計 §2.3とする。reconcileは`LearningImmutableEvidenceV1`のsubject tuple、transaction kind、artifact/rollback/headをexact照合し、新revisionを生成しない。

## §3 不変条件とidempotency

1. verified completion以外からknowledge promotionを作らない。
2. candidate全件が一分類へ収束し、continuation/forbidden countをdurable countへ含めない。
3. raw log、progress、secret/PIIを含むpacketのmemory authoritative増分は0。
4. worker、promoter、independent reviewer、final verifierのidentity、role、provider familyを全6 pairで一致させない。
5. completionごとのterminal compaction receiptはexactly-one。
6. learning stageはL5 §4のedgeだけを通り、shadow中のactive workflow変更は0。
7. before/afterは同じfixture/oracle/source snapshotを使う。
8. regression countが1以上ならactive化0、rollback receipt一件。
9. blocking gateはactive skill/detector、coverage改善、review、rollback targetを必須とする。
10. rolled_back/retired revisionは再active化せず、新revisionで再評価する。

同じoperation ID＋同digestは同receiptを返し増分0、異digestは該当する具体的canonical failureで停止する。
unknown例外を`HIL_MEMORY_COMPACTION_INVALID`または`HIL_PROMOTION_STAGE_BYPASS`へ境界変換しても、
raw/progress/secret/fixture/effect/rollbackの具体tokenを丸めない。

## §4 実装配置候補

| path候補 | 責務 |
|---|---|
| `src/schema/memory-learning-promotion.ts` | packet、partition、receipt、learning stage、effect、failure型 |
| `src/runtime/completion-knowledge-partitioner.ts` | verified completionとcontinuation分離、content classification |
| `src/runtime/knowledge-promotion.ts` | role分離、proposal検証、promote/supersede/no-promotion計画 |
| `src/runtime/learning-pattern.ts` | finding/repair causality集約とrecipe化 |
| `src/runtime/learning-shadow.ts` | fixture、shadow plan、effect、独立review判定 |
| `src/runtime/learning-promotion.ts` | skill/detector/gate transitionとrollback/retire |
| `src/state-db/memory-learning-projection.ts` | L5 §7のevent append、projection、reconcile |

既存`src/memory/*`、`src/runtime/continuation.ts`、`src/runtime/memory-promotion.ts`を破壊的に置換せず、明示portで接続する。
既存のmemory write成功やnudge消失をknowledge promotion receiptとみなさない。
knowledge data authorityはJSONLだけとし、DBはprocess projectionである。reconcileはJSONLのkey/revision/payloadをDBから生成・上書きせず、
JSONL entry digestを入力にDB projectionを追随させる。

## §5 実装順と完了境界

実装順は、(1) schema/failure、(2) completion/continuationの分離、(3) 禁止内容、(4) role分離、
(5) memory提案/commit/no-promotion、(6) pattern/recipe/fixture、(7) shadow効果/review、(8) skill/detector/gate、
(9) rollback/retire、(10) L7 22件、L8 15件、HST-HIL-015/016、別runtime reviewとする。

本書はdraftであり、既存memory v2、compaction CLI、promotion nudge、skill efficacy reportを本slice実装済みとは主張しない。

## atomic state tuple台帳

各caseを正本stateとU oracleへ一対一で結線する。

| HST case識別子 | `pre_state` | `expected_state` | 正本failure | U結線 |
|---|---|---|---|---|
| `HST-CASE-015-01` | `completion_verified` | `compacted` | `なし（正常系）` | `U-MLP-004`, `U-MLP-007`, `U-MLP-008`, `U-MLP-009` |
| `HST-CASE-015-02` | `completion_verified` | `rejected` | `HIL_MEMORY_RAW_LOG_FORBIDDEN` | `U-MLP-003` |
| `HST-CASE-015-03` | `completion_verified` | `rejected` | `HIL_MEMORY_PROGRESS_FORBIDDEN` | `U-MLP-002`, `U-MLP-003` |
| `HST-CASE-015-04` | `completion_verified` | `rejected` | `HIL_MEMORY_SECRET_FORBIDDEN` | `U-MLP-003` |
| `HST-CASE-015-05` | `completion_verified` | `completion_verified` | `HIL_MEMORY_PROMOTER_NOT_INDEPENDENT` | `U-MLP-005`, `U-MLP-015` |
| `HST-CASE-016-01` | `recipe` | `shadow_verified` | `なし（正常系）` | `U-MLP-013`, `U-MLP-016` |
| `HST-CASE-016-02` | `pattern` | `pattern` | `HIL_PROMOTION_FIXTURE_MISSING` | `U-MLP-011`, `U-MLP-012` |
| `HST-CASE-016-03` | `shadow` | `shadow` | `HIL_PROMOTION_EFFECT_MISSING` | `U-MLP-014`, `U-MLP-015`, `U-MLP-018` |
| `HST-CASE-016-04` | `shadow` | `rolled_back` | `HIL_PROMOTION_SHADOW_REGRESSION` | `U-MLP-016`, `U-MLP-021` |
| `HST-CASE-016-05` | `recipe` | `recipe` | `HIL_PROMOTION_IMMEDIATE_GATE_FORBIDDEN` | `U-MLP-017`, `U-MLP-020` |
| `HST-CASE-016-06` | `shadow_verified` | `shadow_verified` | `HIL_PROMOTION_ROLLBACK_MISSING` | `U-MLP-018`, `U-MLP-019`, `U-MLP-021` |
| `HST-CASE-015-06` | `assertion_input_ready` | `assertion_pass` | `HIL_MEMORY_COMPACTION_INVALID` | `U-MLP-001`, `U-MLP-002`, `U-MLP-006`, `U-MLP-008` |
| `HST-CASE-016-07` | `assertion_input_ready` | `assertion_pass` | `HIL_LEARNING_PROMOTION_PREMATURE` | `U-MLP-010`, `U-MLP-015`, `U-MLP-020` |
| `HST-CASE-015-07` | `assertion_input_ready` | `assertion_pass` | `HIL_MEMORY_EVENT_MIXED` | `U-MLP-002`, `U-MLP-006` |
| `HST-CASE-016-08` | `assertion_input_ready` | `assertion_pass` | `HIL_PROMOTION_STAGE_BYPASS` | `U-MLP-017`, `U-MLP-022` |

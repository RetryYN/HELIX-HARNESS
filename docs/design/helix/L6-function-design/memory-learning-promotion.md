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
| `parseVerifiedCompletionPacket` | `(raw, verificationIndex, authorityResolver, bounds) => Result<VerifiedCompletionPacket, MemoryLearningFailure>` | verified receipt、causality、digest、typed bounded refのauthority/revision/digest/count/bytesをstrict検証 | `U-MLP-001` | `HAC-HIL-07a` | `HST-CASE-015-06` | `HIL_MEMORY_COMPACTION_INVALID` |
| `partitionCompletionKnowledge` | `(packet, candidates, continuation) => KnowledgePartitionDecision` | 全candidateをdurable/continuation/forbidden/duplicate/no-valueへ一意分類 | `U-MLP-002` | `HAC-HIL-07a`, `HAC-HIL-07b` | `HST-CASE-015-03`, `HST-CASE-015-06`, `HST-CASE-015-07` | `HIL_MEMORY_PROGRESS_FORBIDDEN`; `HIL_MEMORY_COMPACTION_INVALID`; `HIL_MEMORY_EVENT_MIXED` |
| `classifyForbiddenMemoryContent` | `(candidate, policy) => MemoryContentDecision` | body/metadataのraw log、progress、secret/credential/PIIを同じpolicyで検出 | `U-MLP-003` | `HAC-HIL-07b` | `HST-CASE-015-02`, `HST-CASE-015-03`, `HST-CASE-015-04` | `HIL_MEMORY_RAW_LOG_FORBIDDEN`; `HIL_MEMORY_PROGRESS_FORBIDDEN`; `HIL_MEMORY_SECRET_FORBIDDEN` |
| `buildDurableKnowledgeCandidate` | `(packet, partition, currentMemory) => KnowledgeCandidateDecision` | decision/constraint/referenceだけをpromote/supersede/no-promotion候補化 | `U-MLP-004` | `HAC-HIL-07a` | `HST-CASE-015-01` | `なし（正常系）` |
| `enforceKnowledgePromoterSeparation` | `(actors: PromotionActorSet, policy) => RoleSeparationDecision` | worker/promoter/reviewer/final verifierの全6 pairでidentity、role、provider family collisionを拒否 | `U-MLP-005` | `HAC-HIL-07b` | `HST-CASE-015-05` | `HIL_MEMORY_PROMOTER_NOT_INDEPENDENT` |
| `validateKnowledgePromotionProposal` | `(packet, candidate, promoter, policy) => Result<ValidatedKnowledgePromotion, MemoryLearningFailure>` | provenance、partition、event kind、supersession、forbidden count 0を要求 | `U-MLP-006` | `HAC-HIL-07a`, `HAC-HIL-07b` | `HST-CASE-015-06`, `HST-CASE-015-07` | `HIL_MEMORY_COMPACTION_INVALID`; `HIL_MEMORY_EVENT_MIXED` |
| `planKnowledgePromotionCommit` | `(validated, memoryHead, ledgerHead) => KnowledgePromotionCommitPlan` | memory appendとledger eventを同operationへbindしterminal exactly-one | `U-MLP-007` | `HAC-HIL-07a` | `HST-CASE-015-01` | `なし（正常系）` |
| `commitKnowledgePromotion` | `(plan, memoryPort, dbPort) => Promise<Result<KnowledgePromotionCommitOutcome, MemoryLearningFailure>>` | Node portだけ。JSONL append後DB faultはprojection_pending、terminal 0 | `U-MLP-008` | `HAC-HIL-07a`, `HAC-HIL-07b` | `HST-CASE-015-01`, `HST-CASE-015-06` | `なし（正常系）`; `HIL_MEMORY_COMPACTION_INVALID` |
| `reconcileKnowledgePromotionProjection` | `(pending, memoryPort, dbPort) => Promise<Result<KnowledgePromotionReceipt, MemoryLearningFailure>>` | operation/entry digest/head一致時だけ再開し、JSONL増分0、DB一件、terminal exactly-one | `U-MLP-008` | `HAC-HIL-07a` | `HST-CASE-015-01` | `なし（正常系）`; `HIL_MEMORY_COMPACTION_INVALID` |
| `buildNoKnowledgePromotionReceipt` | `(packet, reason, evidence) => NoPromotionReceipt` | duplicate/no-value/continuation-onlyをbody非包含digestで終端化 | `U-MLP-009` | `HAC-HIL-07a` | `HST-CASE-015-01` | `なし（正常系）` |
| `aggregateLearningPattern` | `(findingRefs, repairRefs, policy) => PatternDecision` | cause重複排除、support/独立causality、source digestを固定 | `U-MLP-010` | `HAC-HIL-07c` | `HST-CASE-016-07` | `HIL_LEARNING_PROMOTION_PREMATURE` |
| `buildLearningRecipe` | `(pattern, scope, oracle, fixtureContract) => RecipeDecision` | 再現手順、scope/non-goal、oracle、fixture契約を必須化 | `U-MLP-011` | `HAC-HIL-07c` | `HST-CASE-016-02` | `HIL_PROMOTION_FIXTURE_MISSING` |
| `validatePromotionFixture` | `(recipe, fixture, sourceSnapshot) => FixtureValidationDecision` | version、input/oracle、source、expected result、digestをstrict検証 | `U-MLP-012` | `HAC-HIL-07c` | `HST-CASE-016-02` | `HIL_PROMOTION_FIXTURE_MISSING` |
| `planPromotionShadowRun` | `(recipe, fixture, baseline, candidate) => ShadowRunPlan` | 同一fixture/oracle、non-blocking、stable input digestを固定 | `U-MLP-013` | `HAC-HIL-07c` | `HST-CASE-016-01` | `なし（正常系）` |
| `measurePromotionEffect` | `(plan, before, after, coveragePolicy) => PromotionEffectDecision` | success、FP/FN、coverage、runtime/costを同一分母で比較 | `U-MLP-014` | `HAC-HIL-07c` | `HST-CASE-016-03` | `HIL_PROMOTION_EFFECT_MISSING` |
| `validateIndependentPromotionReview` | `(actors, effect, review) => PromotionReviewDecision` | 4主体全6 pairのidentity/provider分離、effect/fixture/rollback bindを要求 | `U-MLP-015` | `HAC-HIL-07b`, `HAC-HIL-07c` | `HST-CASE-015-05`, `HST-CASE-016-03`, `HST-CASE-016-07` | `HIL_MEMORY_PROMOTER_NOT_INDEPENDENT`; `HIL_PROMOTION_EFFECT_MISSING`; `HIL_LEARNING_PROMOTION_PREMATURE` |
| `decidePromotionShadowVerdict` | `(effect, review, regressionPolicy) => ShadowVerdict` | 改善＋退行0だけverified、一件退行でrollback | `U-MLP-016` | `HAC-HIL-07c` | `HST-CASE-016-01`, `HST-CASE-016-04` | `なし（正常系）`; `HIL_PROMOTION_SHADOW_REGRESSION` |
| `validateLearningPromotionTransition` | `(current, next, evidenceSet) => PromotionTransitionDecision` | 許可graph、fixture/effect/review/rollback prerequisiteを評価 | `U-MLP-017` | `HAC-HIL-07b`, `HAC-HIL-07c` | `HST-CASE-016-05`, `HST-CASE-016-08` | `HIL_PROMOTION_IMMEDIATE_GATE_FORBIDDEN`; `HIL_PROMOTION_STAGE_BYPASS` |
| `planSkillPromotion` | `(shadow, effect, review, rollback) => SkillPromotionPlan` | shadow_verified、目的metric改善、独立review、rollbackを要求 | `U-MLP-018` | `HAC-HIL-07c` | `HST-CASE-016-03`, `HST-CASE-016-06` | `HIL_PROMOTION_EFFECT_MISSING`; `HIL_PROMOTION_ROLLBACK_MISSING` |
| `planDetectorPromotion` | `(shadow, effect, review, rollback) => DetectorPromotionPlan` | FP/FN policy、finding schema、限定scope、rollbackを要求 | `U-MLP-019` | `HAC-HIL-07c` | `HST-CASE-016-06` | `HIL_PROMOTION_ROLLBACK_MISSING` |
| `planBlockingGatePromotion` | `(activeCapability, effect, review, rollback, coverage) => GatePromotionPlan` | active skill/detector、coverage改善、退行0、rollbackを要求 | `U-MLP-020` | `HAC-HIL-07b`, `HAC-HIL-07c` | `HST-CASE-016-05`, `HST-CASE-016-07` | `HIL_PROMOTION_IMMEDIATE_GATE_FORBIDDEN`; `HIL_LEARNING_PROMOTION_PREMATURE` |
| `planLearningRollback` | `(activeRevision, regression, rollbackTarget) => LearningRollbackPlan` | target digest、disable集合、cause、retire/fenceを不可分計画 | `U-MLP-021` | `HAC-HIL-07c` | `HST-CASE-016-04`, `HST-CASE-016-06` | `HIL_PROMOTION_SHADOW_REGRESSION`; `HIL_PROMOTION_ROLLBACK_MISSING` |
| `validateRetiredPromotionReentry` | `(retired, candidate, evidenceSet) => ReentryDecision` | 同revision/同evidence再active拒否、新revision/shadow/reviewer必須 | `U-MLP-022` | `HAC-HIL-07c` | `HST-CASE-016-08` | `HIL_PROMOTION_STAGE_BYPASS` |
| `buildLearningActivationBundle` | `(plan, current, evidence, operation) => Result<LearningActivationCommitBundleV1, LearningFailure>` | active pointer、artifact/config/gate state、event/projection/receipt、rollback targetとexpected headsを正規化 | `U-MLP-023` | `HAC-HIL-07b`, `HAC-HIL-07c` | supporting | `HIL_PROMOTION_ACTIVATION_CONFLICT` |
| `commitLearningActivation` | `(bundle, store) => Promise<Result<LearningActivationReceiptV1, LearningFailure>>` | skill/detector/gate active化write setを単一Node transactionでCAS commit | `U-MLP-024` | `HAC-HIL-07b`, `HAC-HIL-07c` | supporting | `HIL_PROMOTION_ACTIVATION_CONFLICT` |
| `buildLearningRollbackBundle` | `(plan, current, evidence, operation) => Result<LearningRollbackCommitBundleV1, LearningFailure>` | current disable、target restore、pointer/event/projection/receiptを正規化 | `U-MLP-025` | `HAC-HIL-07c` | supporting | `HIL_PROMOTION_ROLLBACK_MISSING` |
| `commitLearningRollback` | `(bundle, store) => Promise<Result<LearningRollbackReceiptV1, LearningFailure>>` | disable/restore/publish/receiptを単一Node transactionでCAS commit | `U-MLP-026` | `HAC-HIL-07c` | supporting | `HIL_PROMOTION_ACTIVATION_CONFLICT` |
| `reconcileLearningActivationTransaction` | `(operationId, immutableEvidence, store) => Promise<Result<LearningTransactionReceiptV1, LearningFailure>>` | immutable evidenceからactive/rollback projectionだけを復元 | `U-MLP-027` | `HAC-HIL-07c` | supporting | `HIL_PROMOTION_RECONCILE_FAILED` |

## §2 schema

```ts
type KnowledgePromotionDecision = "promote" | "supersede" | "no_promotion";
type LearningSubjectKind = "recipe" | "skill" | "detector" | "gate";
type KnowledgePromotionCommitState =
  | "planned"
  | "memory_appended"
  | "projection_pending"
  | "projected"
  | "terminal";

interface PromotionActorIdentityV1 {
  role: "worker" | "promoter" | "reviewer" | "final_verifier";
  identity_digest: string;
  role_contract_digest: string;
  provider_family: string;
}

interface PromotionActorSet {
  worker: PromotionActorIdentityV1;
  promoter: PromotionActorIdentityV1;
  reviewer: PromotionActorIdentityV1;
  final_verifier: PromotionActorIdentityV1;
}

interface KnowledgePromotionCommitOutcome {
  operation_id: string;
  state: KnowledgePromotionCommitState;
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
  decision: KnowledgePromotionDecision;
  memory_entry_digest: string | null;
  supersedes_entry_digest: string | null;
  continuation_ref_digest: string | null;
  input_digest: string;
  output_digest: string;
  node_authority: true;
}

interface PromotionEffectReceiptV1 {
  schema_version: "helix-promotion-effect-receipt.v1";
  subject_kind: LearningSubjectKind;
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
interface LearningActivationCommitBundleV1 {
  operation_id: string;
  payload_digest: string;
  subject_kind: "skill" | "detector" | "gate";
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
```

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

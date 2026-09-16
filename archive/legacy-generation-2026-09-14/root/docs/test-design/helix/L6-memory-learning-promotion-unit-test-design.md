---
title: "HELIX L7 単体テスト設計 — memory learning promotion"
layer: L6
executed_at_layer: L7
artifact_type: test_design
status: draft
created: 2026-07-15
updated: 2026-07-15
owner: QA / TL
plan: PLAN-L1-07-infinity-loop-platform-requirements
design_slice: HDS-HIL-07
related_hst:
  - HST-HIL-015
  - HST-HIL-016
related_l3: docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md
related_l4: docs/design/helix/L4-basic-design/infinity-loop-platform-basic-design.md
pair_artifact: docs/design/helix/L6-function-design/memory-learning-promotion.md
next_pair_freeze: L6
requirements:
  - HR-FR-HIL-07
  - HAC-HIL-07a
  - HAC-HIL-07b
  - HAC-HIL-07c
system_tests:
  - HST-HIL-015
  - HST-HIL-016
---

# HELIX L7 単体テスト設計 — memory learning promotion

各U oracleは対応するHST caseについてL5 §9のatomic `case_id/pre_state/expected_state/canonical_failure`を入力し、failure tokenとは独立にpre→expected stateをexact assertする。複数caseを扱う関数もcaseごとのtupleを混合せず個別実行する。

全caseは固定clock/ID、in-memory port、redacted fixtureを使い、外部runtime、network、実memoryを変更しない。全caseは未実装である。

| ID | exact function | 反例と期待結果 | HAC | HST exact case | canonical failure | test参照先 |
|---|---|---|---|---|---|---|
| `U-MLP-001` | `parseVerifiedCompletionPacket` | verification/causality/digest/ref欠落、raw body field、stale revision、dangling ID、untrusted authority、digest mismatch、65件、各512 bytes・解決後各16 KiB・合計256 KiB超過を個別拒否 | `HAC-HIL-07a` | `HST-CASE-015-06` | `HIL_MEMORY_COMPACTION_INVALID` | `tests/completion-knowledge-partitioner.test.ts` |
| `U-MLP-002` | `partitionCompletionKnowledge` | durable/continuation/forbidden/duplicate/no-valueを全件一意分類し不明分類で全promotion 0 | `HAC-HIL-07a`, `HAC-HIL-07b` | `HST-CASE-015-03`, `HST-CASE-015-06`, `HST-CASE-015-07` | `HIL_MEMORY_PROGRESS_FORBIDDEN`; `HIL_MEMORY_COMPACTION_INVALID`; `HIL_MEMORY_EVENT_MIXED` | `tests/completion-knowledge-partitioner.test.ts` |
| `U-MLP-003` | `classifyForbiddenMemoryContent` | body/metadataへraw log、progress、secret、credential、PIIを個別混入しexact分類 | `HAC-HIL-07b` | `HST-CASE-015-02`, `HST-CASE-015-03`, `HST-CASE-015-04` | `HIL_MEMORY_RAW_LOG_FORBIDDEN`; `HIL_MEMORY_PROGRESS_FORBIDDEN`; `HIL_MEMORY_SECRET_FORBIDDEN` | `tests/knowledge-content-policy.test.ts` |
| `U-MLP-004` | `buildDurableKnowledgeCandidate` | 新規、既存更新、重複、continuation-onlyからpromote/supersede/no-promotionを決定 | `HAC-HIL-07a` | `HST-CASE-015-01` | `なし（正常系）` | `tests/knowledge-promotion.test.ts` |
| `U-MLP-005` | `enforceKnowledgePromoterSeparation` | worker/promoter/reviewer/final verifierの全6 pairについてsame identity/role/providerを個別拒否し、4主体分離だけ受理 | `HAC-HIL-07b` | `HST-CASE-015-05` | `HIL_MEMORY_PROMOTER_NOT_INDEPENDENT` | `tests/knowledge-promotion-role.test.ts` |
| `U-MLP-006` | `validateKnowledgePromotionProposal` | unverified、event混在、provenance欠落、forbidden count非0、supersedes不明を拒否 | `HAC-HIL-07a`, `HAC-HIL-07b` | `HST-CASE-015-06`, `HST-CASE-015-07` | `HIL_MEMORY_COMPACTION_INVALID`; `HIL_MEMORY_EVENT_MIXED` | `tests/knowledge-promotion.test.ts` |
| `U-MLP-007` | `planKnowledgePromotionCommit` | promote/supersede/no-promotionを同operationへbindしterminal複数を拒否 | `HAC-HIL-07a` | `HST-CASE-015-01` | `なし（正常系）` | `tests/knowledge-promotion-commit.test.ts` |
| `U-MLP-008` | `commitKnowledgePromotion` / `reconcileKnowledgePromotionProjection` | JSONL append後DB faultでprojection_pending・terminal 0、同operation retryでJSONL増分0・DB一件・terminal exactly-one。異digest/head、raw body DB eventは拒否 | `HAC-HIL-07a`, `HAC-HIL-07b` | `HST-CASE-015-01`, `HST-CASE-015-06` | `なし（正常系）`; `HIL_MEMORY_COMPACTION_INVALID` | `tests/knowledge-promotion-commit.test.ts` |
| `U-MLP-009` | `buildNoKnowledgePromotionReceipt` | duplicate/no-value/continuation-onlyをbody非包含のstable receiptへ変換 | `HAC-HIL-07a` | `HST-CASE-015-01` | `なし（正常系）` | `tests/knowledge-promotion.test.ts` |
| `U-MLP-010` | `aggregateLearningPattern` | 同cause重複をsupportへ二重計上せず、閾値未満の強制化を拒否 | `HAC-HIL-07c` | `HST-CASE-016-07` | `HIL_LEARNING_PROMOTION_PREMATURE` | `tests/learning-pattern.test.ts` |
| `U-MLP-011` | `buildLearningRecipe` | scope/oracle/fixture contract/non-goal欠落をrecipe readyにしない | `HAC-HIL-07c` | `HST-CASE-016-02` | `HIL_PROMOTION_FIXTURE_MISSING` | `tests/learning-recipe.test.ts` |
| `U-MLP-012` | `validatePromotionFixture` | version/input/oracle/source/expected/digestを一つずつ欠落・改変 | `HAC-HIL-07c` | `HST-CASE-016-02` | `HIL_PROMOTION_FIXTURE_MISSING` | `tests/learning-fixture.test.ts` |
| `U-MLP-013` | `planPromotionShadowRun` | baseline/candidateへ同一fixture/oracle/inputを固定しblocking side effect 0 | `HAC-HIL-07c` | `HST-CASE-016-01` | `なし（正常系）` | `tests/learning-shadow.test.ts` |
| `U-MLP-014` | `measurePromotionEffect` | before欠落、分母差、coverage分母差、metric欠落をeffect verifiedにしない | `HAC-HIL-07c` | `HST-CASE-016-03` | `HIL_PROMOTION_EFFECT_MISSING` | `tests/learning-effect.test.ts` |
| `U-MLP-015` | `validateIndependentPromotionReview` | 4主体全6 pairのidentity/provider collisionとfixture/effect/rollback不一致を拒否し、final verifier bindを必須化 | `HAC-HIL-07b`, `HAC-HIL-07c` | `HST-CASE-015-05`, `HST-CASE-016-03`, `HST-CASE-016-07` | `HIL_MEMORY_PROMOTER_NOT_INDEPENDENT`; `HIL_PROMOTION_EFFECT_MISSING`; `HIL_LEARNING_PROMOTION_PREMATURE` | `tests/learning-review.test.ts` |
| `U-MLP-016` | `decidePromotionShadowVerdict` | 改善＋退行0はverified、一fixture退行はrolled_back＋active 0 | `HAC-HIL-07c` | `HST-CASE-016-01`, `HST-CASE-016-04` | `なし（正常系）`; `HIL_PROMOTION_SHADOW_REGRESSION` | `tests/learning-shadow.test.ts` |
| `U-MLP-017` | `validateLearningPromotionTransition` | recipe→gate、pattern→shadow、逆行、rollback省略を個別拒否 | `HAC-HIL-07b`, `HAC-HIL-07c` | `HST-CASE-016-05`, `HST-CASE-016-08` | `HIL_PROMOTION_IMMEDIATE_GATE_FORBIDDEN`; `HIL_PROMOTION_STAGE_BYPASS` | `tests/learning-transition.test.ts` |
| `U-MLP-018` | `planSkillPromotion` | effect/review/rollback欠落とshadow未verifiedをactive化0 | `HAC-HIL-07c` | `HST-CASE-016-03`, `HST-CASE-016-06` | `HIL_PROMOTION_EFFECT_MISSING`; `HIL_PROMOTION_ROLLBACK_MISSING` | `tests/learning-skill-promotion.test.ts` |
| `U-MLP-019` | `planDetectorPromotion` | FP/FN policy、finding schema、scope、rollback欠落をactive化0 | `HAC-HIL-07c` | `HST-CASE-016-06` | `HIL_PROMOTION_ROLLBACK_MISSING` | `tests/learning-detector-promotion.test.ts` |
| `U-MLP-020` | `planBlockingGatePromotion` | recipe/shadowから直行、coverage非改善、review欠落、過広scopeをgate 0 | `HAC-HIL-07b`, `HAC-HIL-07c` | `HST-CASE-016-05`, `HST-CASE-016-07` | `HIL_PROMOTION_IMMEDIATE_GATE_FORBIDDEN`; `HIL_LEARNING_PROMOTION_PREMATURE` | `tests/learning-gate-promotion.test.ts` |
| `U-MLP-021` | `planLearningRollback` | regression時はtargetへ戻しartifactをdisable、target欠落時はactive変更0 | `HAC-HIL-07c` | `HST-CASE-016-04`, `HST-CASE-016-06` | `HIL_PROMOTION_SHADOW_REGRESSION`; `HIL_PROMOTION_ROLLBACK_MISSING` | `tests/learning-rollback.test.ts` |
| `U-MLP-022` | `validateRetiredPromotionReentry` | rolled_back/retired同revisionと同evidence再activeを拒否し新revisionだけ再shadow | `HAC-HIL-07c` | `HST-CASE-016-08` | `HIL_PROMOTION_STAGE_BYPASS` | `tests/learning-rollback.test.ts` |

| `U-MLP-023` | `buildLearningActivationBundle` | `(subject_kind, subject_id)`別write set、rollback target、shadow/effect/review/verifier、authority/freshness、expected heads欠落を拒否 | `HAC-HIL-07b`, `HAC-HIL-07c` | supporting | `tests/learning-activation-transaction.test.ts` |
| `U-MLP-024` | `commitLearningActivation` | append faultで全write 0。同operation同digest一件、異digest/stale head conflict。同kind別subjectのhead/pointerを変更しない | `HAC-HIL-07b`, `HAC-HIL-07c` | supporting | `tests/learning-activation-transaction.test.ts` |
| `U-MLP-025` | `buildLearningRollbackBundle` | disable/restore/publish/pointer/event/projection/receiptの欠落とstale targetを拒否 | `HAC-HIL-07c` | supporting | `tests/learning-rollback-transaction.test.ts` |
| `U-MLP-026` | `commitLearningRollback` | 任意append faultでcurrent activeを維持し、全成功時だけtargetへatomic切替 | `HAC-HIL-07c` | supporting | `tests/learning-rollback-transaction.test.ts` |
| `U-MLP-027` | `reconcileLearningActivationTransaction` | `(subject_kind, subject_id)`とimmutable evidence一致時だけactive/rollback projectionを復元し、新revisionや同kind別subjectを推測しない | `HAC-HIL-07c` | supporting | `tests/learning-promotion-reconcile.test.ts` |

## §1 合否

L6 §2の公開成功結果23件＋`MemoryLearningFailureV1` 1件がすべて定義済みで、公開signatureに非`V1`の抽象result/failure型が0件であることをstatic oracleとする。これは28 public API functionsと`U-MLP-001`〜`U-MLP-027`のowner（`U-MLP-008`だけ2関数）、既存HAC/HST/failure分母、下記API→U→IT結線を変更しない。

### supporting transactionのL8 exact join

`U-MLP-023/024`は`IT-MLP-016`、`U-MLP-025/026`は`IT-MLP-017`、`U-MLP-027`は`IT-MLP-016/017`へexact joinする。`LearningImmutableEvidenceV1`のsubject tuple/head差替えはwrite 0、rebuild結果は`ProjectionDigestV1`で照合する。

`U-MLP-001`から`U-MLP-022`の22件すべてでRed/Green、exact HAC/HST/canonical failure、role、digest、state、
authoritative増分、effect、coverage、rollbackを保存する。正常caseだけ`なし（正常系）`とし、外部runtimeやnetworkを起動しない。

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

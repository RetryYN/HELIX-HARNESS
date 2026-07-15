---
title: "HELIX L8 結合テスト設計 — memory learning promotion"
layer: L5
executed_at_layer: L8
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
pair_artifact: docs/design/helix/L5-detail/memory-learning-promotion.md
next_pair_freeze: L5
requirements:
  - HR-FR-HIL-07
  - HAC-HIL-07a
  - HAC-HIL-07b
  - HAC-HIL-07c
system_tests:
  - HST-HIL-015
  - HST-HIL-016
---

# HELIX L8 結合テスト設計 — memory learning promotion

## §0 共通oracle

全caseは固定completion/finding/Issue/commit fixture、fake Claude promoter、promoterと別providerのfake reviewer、前3主体と別identity/role/providerのfake final verifier、isolated memory port、
isolated harness.db、固定clock/IDを使い、外部AI runtimeやnetworkを起動しない。packet、source、role、memory、continuation、
fixture、metric、coverage、review、stage、rollbackのdigestとauthoritative増分を直接測る。全caseは未実装である。

| ID | 前提／操作 | 期待結果／evidence | HAC | HST exact case | canonical failure | 対応するL5箇所 |
|---|---|---|---|---|---|---|
| `IT-MLP-001` | verified completionからdurable decisionと重複candidateをcompactし、memory append直後のDB faultを注入して同operationをretry | decisionはJSONLへ一件、初回はprojection_pendingでterminal 0、retryはJSONL増分0・DB projection一件・terminal receipt exactly-one。重複はno-promotion | `HAC-HIL-07a` | `HST-CASE-015-01` | `なし（正常系）` | `§2`, `§3`, `§7` |
| `IT-MLP-002` | command output、provider transcript、diff全文をcandidateへ個別混入 | packet rejected、memory/receipt増分0、raw本文evidence 0 | `HAC-HIL-07b` | `HST-CASE-015-02` | `HIL_MEMORY_RAW_LOG_FORBIDDEN` | `§2`, `§8` |
| `IT-MLP-003` | progress、current state、next action、leaseをcandidateへ個別混入 | memory write 0、continuation projectionだけが元eventを保持 | `HAC-HIL-07a`, `HAC-HIL-07b` | `HST-CASE-015-03` | `HIL_MEMORY_PROGRESS_FORBIDDEN` | `§2`, `§3` |
| `IT-MLP-004` | secret-like、credential、PIIをbody/metadataへ個別混入 | memory/DB promotion 0、redacted分類findingだけ保存 | `HAC-HIL-07b` | `HST-CASE-015-04` | `HIL_MEMORY_SECRET_FORBIDDEN` | `§2`, `§8` |
| `IT-MLP-005` | worker、promoter、reviewer、final verifierのidentity/role/providerを6組の各pairで同一化してreceipt発行 | 各collisionでreceipt/memory write 0、4主体すべてが別identity/role/providerの場合だけ受理 | `HAC-HIL-07b` | `HST-CASE-015-05` | `HIL_MEMORY_PROMOTER_NOT_INDEPENDENT` | `§1`, `§2` |
| `IT-MLP-006` | raw-log本文ではなくallowlist済みopaque raw-log参照、PR/CI/finding bounded ref、永続決定、continuationを一packetへ投入し、stale/dangling/untrusted/digest mismatch/65件/byte超過も個別投入 | 正常refでは永続決定だけmemory、raw-log参照は本文非解決、進捗はcontinuation。各不正bounded refと不明分類では全promotion 0 | `HAC-HIL-07a` | `HST-CASE-015-06` | `HIL_MEMORY_COMPACTION_INVALID` | `§2`, `§3` |
| `IT-MLP-007` | admission summary、completion knowledge、continuation eventを同じevent種別へ混載 | promotion 0、各正規event種別で再投入時だけ個別receipt | `HAC-HIL-07a`, `HAC-HIL-07b` | `HST-CASE-015-07` | `HIL_MEMORY_EVENT_MIXED` | `§2`, `§3` |
| `IT-MLP-008` | versioned fixture付きrecipeを同一baseline/candidateへshadow実行 | effect/coverage差分、独立review、rollback targetを持ちshadow_verified | `HAC-HIL-07c` | `HST-CASE-016-01` | `なし（正常系）` | `§4`, `§5` |
| `IT-MLP-009` | finding patternからfixtureなしrecipeをshadowへ遷移 | stage/event/active増分0、recipeのまま | `HAC-HIL-07c` | `HST-CASE-016-02` | `HIL_PROMOTION_FIXTURE_MISSING` | `§4`, `§5` |
| `IT-MLP-010` | before metricまたは独立review receiptを欠落させskill active化 | active/receipt増分0、shadow state不変 | `HAC-HIL-07c` | `HST-CASE-016-03` | `HIL_PROMOTION_EFFECT_MISSING` | `§5`, `§7` |
| `IT-MLP-011` | shadow fixture一件へacceptance/coverage/authority退行を注入 | rolled_back、active化0、rollback receipt一件 | `HAC-HIL-07c` | `HST-CASE-016-04` | `HIL_PROMOTION_SHADOW_REGRESSION` | `§5`, `§6` |
| `IT-MLP-012` | recipe生成直後にblocking gate active化 | gate増分0、recipe state不変、shortcut finding | `HAC-HIL-07b`, `HAC-HIL-07c` | `HST-CASE-016-05` | `HIL_PROMOTION_IMMEDIATE_GATE_FORBIDDEN` | `§4`, `§8` |
| `IT-MLP-013` | rollback targetなしのshadow_verified detectorをactive化 | detector/receipt増分0、shadow_verified維持 | `HAC-HIL-07c` | `HST-CASE-016-06` | `HIL_PROMOTION_ROLLBACK_MISSING` | `§5`, `§6` |
| `IT-MLP-014` | supportだけ多いfindingをfixture/shadow/review前にgate化 | active増分0、pattern/recipeへ戻すrouteを記録 | `HAC-HIL-07b`, `HAC-HIL-07c` | `HST-CASE-016-07` | `HIL_LEARNING_PROMOTION_PREMATURE` | `§4`, `§5` |
| `IT-MLP-015` | stage飛越、逆行、rollback省略、rolled_back revision再activeを個別投入 | 全反例でstage増分0、正順rollback/retireだけappend | `HAC-HIL-07c` | `HST-CASE-016-08` | `HIL_PROMOTION_STAGE_BYPASS` | `§4`, `§6`, `§7` |

| `IT-MLP-016` | 同kind異subjectを含むskill/detector/gate activationのpointer、artifact/config/gate state、event/projection/receipt各appendへfault、stale shadow/review、role/authority違反、同operation再送を投入 | fault/freshness/authority/CAS失敗はactive変更0。同operation同digestはreceipt一件、異digestはconflict。全write成功時だけ対象`(kind,id)`が切替わり、同kind別subjectは増分0 | `HAC-HIL-07b`, `HAC-HIL-07c` | supporting activation oracle | supporting | `tests/learning-activation-transaction.integration.test.ts` |
| `IT-MLP-017` | 同kind異subjectを保持したままrollbackのdisable、target restore/publish、pointer、event/projection/receipt各appendへfaultを注入し、immutable evidenceでreconcile | 部分rollback 0。成功時は対象`(kind,id)`だけcurrent disableとtarget復帰が同時成立し、別subject増分0。reconcile/再送後もactive revisionとreceiptは一件 | `HAC-HIL-07c` | supporting rollback oracle | supporting | `tests/learning-rollback-transaction.integration.test.ts` |

## §1 合否

L6 public APIの成功結果23件＋共通failure 1件はslice-local closed `*V1`契約として解決し、非`V1`の抽象result/failure型を許さない。型閉包後も`IT-MLP-001`〜`IT-MLP-017`、15 HST/canonical failure、authority増分とownerの分母は固定し、plan/resultの生成だけでmemory/recipe/skill/detector/gateをactive扱いしない。

### 補助API→U→IT exact join

`IT-MLP-016`は`U-MLP-023`,`U-MLP-024`,`U-MLP-027`、`IT-MLP-017`は`U-MLP-025`,`U-MLP-026`,`U-MLP-027`をexact joinし、activationとrollbackのimmutable evidenceを混同しない。

### §0.1 主exact tuple oracle

主oracleは次のatomic 4-tupleをcase IDごとにexactly-once評価する。

| HST case識別子 | `pre_state` | `expected_state` | 正本failure | 主IT結線 |
|---|---|---|---|---|
| `HST-CASE-015-01` | `completion_verified` | `compacted` | `なし（正常系）` | `IT-MLP-001` |
| `HST-CASE-015-02` | `completion_verified` | `rejected` | `HIL_MEMORY_RAW_LOG_FORBIDDEN` | `IT-MLP-002` |
| `HST-CASE-015-03` | `completion_verified` | `rejected` | `HIL_MEMORY_PROGRESS_FORBIDDEN` | `IT-MLP-003` |
| `HST-CASE-015-04` | `completion_verified` | `rejected` | `HIL_MEMORY_SECRET_FORBIDDEN` | `IT-MLP-004` |
| `HST-CASE-015-05` | `completion_verified` | `completion_verified` | `HIL_MEMORY_PROMOTER_NOT_INDEPENDENT` | `IT-MLP-005` |
| `HST-CASE-015-06` | `assertion_input_ready` | `assertion_pass` | `HIL_MEMORY_COMPACTION_INVALID` | `IT-MLP-006` |
| `HST-CASE-015-07` | `assertion_input_ready` | `assertion_pass` | `HIL_MEMORY_EVENT_MIXED` | `IT-MLP-007` |
| `HST-CASE-016-01` | `recipe` | `shadow_verified` | `なし（正常系）` | `IT-MLP-008` |
| `HST-CASE-016-02` | `pattern` | `pattern` | `HIL_PROMOTION_FIXTURE_MISSING` | `IT-MLP-009` |
| `HST-CASE-016-03` | `shadow` | `shadow` | `HIL_PROMOTION_EFFECT_MISSING` | `IT-MLP-010` |
| `HST-CASE-016-04` | `shadow` | `rolled_back` | `HIL_PROMOTION_SHADOW_REGRESSION` | `IT-MLP-011` |
| `HST-CASE-016-05` | `recipe` | `recipe` | `HIL_PROMOTION_IMMEDIATE_GATE_FORBIDDEN` | `IT-MLP-012` |
| `HST-CASE-016-06` | `shadow_verified` | `shadow_verified` | `HIL_PROMOTION_ROLLBACK_MISSING` | `IT-MLP-013` |
| `HST-CASE-016-07` | `assertion_input_ready` | `assertion_pass` | `HIL_LEARNING_PROMOTION_PREMATURE` | `IT-MLP-014` |
| `HST-CASE-016-08` | `assertion_input_ready` | `assertion_pass` | `HIL_PROMOTION_STAGE_BYPASS` | `IT-MLP-015` |

`IT-MLP-001`から`IT-MLP-015`の15件すべてで、exact HAC/HST/canonical failure、role、state、digest、
memory/continuation/DB増分、shadow effect、coverage、rollbackをassertする。正常caseだけ`なし（正常系）`とし、
既存memory write、物理compaction、自然言語review、mock call countで代替しない。

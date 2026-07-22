---
title: "HELIX L5 詳細設計 — GitHub PR audit promotion"
layer: L5
kind: add-design
status: draft
created: 2026-07-15
updated: 2026-07-22
owner: Codex / TL
plan: PLAN-L1-07-infinity-loop-platform-requirements
design_slice: HDS-HIL-03
related_l3: docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md
related_l4: docs/design/helix/L4-basic-design/infinity-loop-platform-basic-design.md
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
pair_artifact: docs/test-design/helix/L5-github-pr-audit-promotion-integration-test-design.md
next_pair_freeze: L8
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

# HELIX L5 詳細設計 — GitHub PR audit promotion

## §0 境界と既知hook事実

本sliceはbase/stacked PRのcreate、update/synchronize、completion deliveryをcurrent head監査jobへexactly-once変換し、
Claude監査findingをIssue、Universal Reverse、memory issue-summary、Codex ready queueへ原子的昇格する。
Claude Code拡張hookがPR作成後を検知できる事実はlocal trigger capabilityとして採用するが、現行repo hookは
`PreToolUse/PostToolUse/Stop`等のlocal surfaceであり、GitHub webhook deliveryの真正性やremote current headを代替しない。
正本はdelivery ID、payload digest、repository/PR、GitHub current head lookup、policy snapshotをNode bridgeが検証したDB eventである。

ClaudeはPR diffとDB relation/coverage/contract/impact viewを監査しproposalだけを返す。Codexはready Issueの実行者であり、
自分の実装を監査済みへ昇格せず、finding dispositionやpromotion transactionを直接writeしない。

## §1 componentとauthority

| component | 責務 | write authority | fail-close条件 |
|---|---|---|---|
| `GitHubDeliveryVerifier` | signature済みmetadata、delivery/action/repo/PR/head/payload digestを検証 | verified envelope | field欠落、同delivery異digest |
| `CurrentPrHeadResolver` | read-only GitHub viewとdelivery headを比較 | head observation | lookup不能、SHA/tree不一致 |
| `PrAuditJobPlanner` | 全base branchを含むcurrent head＋policyへjobを一意化 | job proposal | base filter、stale head、policy不明 |
| `PrAuditJobCommitter` | delivery、head、job、idempotency receiptを原子的commit | Node DB transaction | duplicate side effect、partial job |
| `ClaudeAuditAdapter` | diff＋DB views＋role briefをClaude taskへ投影 | finding proposal only | Codex視点の自己追試、provenance欠落 |
| `AuditFindingIngestor` | finding schema/evidence/affected layerをNodeで再検証 | finding event | prose-only、別head、raw log/secret |
| `FindingDispositionGate` | actionable/duplicate/false-positive/risk/telemetryを証拠評価 | disposition receipt | AI終端、target/independent review/approval欠落 |
| `FindingPromotionPipeline` | actionable findingから4 targetを同一causeで生成 | promotion transaction | target欠落、cause/digest不一致 |
| `CodexQueueProjector` | Reverse/Issue/gate ready後だけexecution itemを公開 | queue projection | Reverse未作成、claim自己承認 |

## §2 deliveryからcurrent-head jobまで

accepted actionは`opened`、`reopened`、`synchronize`、`ready_for_review`、`closed/completed`で、base branch名による除外を禁止する。
delivery keyはprovider＋repository ID＋delivery ID、job keyはrepository ID＋PR number＋current head SHA/tree＋
base SHA/tree＋merge-base SHA/tree＋diff-base digest＋audit policy digestである。
同delivery同digestはprior receiptを返しjob増分0、異digestはconflict、payload headがcurrent headでなければstale receipt一件とjob 0とする。
head更新時に加え、head不変でもbase push/rebase、merge-baseまたはdiff-base変更時は旧queued/running jobをstale化して
新jobを一件作る。completionもcurrent head監査を省略しない。

job inputはbase/head ref、双方のSHA/tree、merge-base SHA/tree、diff-base digest、PR diff/artifact digest、Issue/contract/design/test/CI/coverage relation view digest、
audit policy/version、Claude role/provider、Codex implementation identityを持つ。ClaudeとCodexのidentity/role/provider familyが
同じ場合はaudit dispatch 0とする。local hook eventはdelivery locatorを運ぶtriggerであり、上記job keyを省略できない。

## §3 finding dispositionとatomic promotion

findingは`finding_id`、job/head/policy、category/severity、affected layer、subject spans、evidence/DB query/diff digest、
recommended route、producer identity/role/providerを必須とする。非actionable分類はfindingを削除せずappend-only receiptとappeal/reopen routeを残す。
`duplicate`は生存target＋acceptance包含証拠、`false_positive`は独立review、`accepted_risk`はaction-binding PO receipt、
`telemetry`は観測owner/expiryを要求する。証拠不足は`disposition_pending`のままとする。

actionable promotionは一つの`promotion_id/cause_id/operation_id`で次を不可分に生成する。

1. version管理されたIssue contract revision。
2. Issueに先行するUniversal Reverse task R0 entry。
3. raw finding本文を含まないmemory issue-summary candidate。
4. Reverse/Issue/gate referenceを持つCodex queue item。

4 targetはpromotion memberとしてdigest/FKを持ち、全件insert後だけ`queue_ready`を公開する。任意insert直後のfault、
duplicate promotion、stale finding/headでは4 target増分0とする。memory knowledge promotionやCodex完了compactionは
HDS-HIL-07所有であり、本sliceのissue-summaryは候補参照に限定する。

## §4 harness.db物理契約

| table | PK | FK／unique | 必須field・CHECK |
|---|---|---|---|
| `github_pr_deliveries` | `pr_delivery_id` | provider/repositoryへの外部key、`provider+repository+delivery_id`一意 | event/action/PR/base/head/payload/transport digest、受信時刻、状態 |
| `github_pr_heads` | `pr_head_id` | deliveryへの外部key、`repository+pr_number+head_sha+head_tree+base_sha+base_tree+merge_base`一意 | base/head refとSHA/tree、merge-base SHA/tree、diff-base digest、観測時刻、current/stale判定 |
| `pr_audit_jobs` | `audit_job_id` | head/policyへの外部key、`repository+pr+head+head_tree+base+base_tree+merge_base+diff_base+policy_digest`一意 | 原因、入力view集合、Claude identity、状態、lease/fence |
| `pr_audit_job_events` | `audit_job_event_id` | jobへの外部key、`job+event_seq`、operation一意 | 遷移前後、直前/event digest、actor/time。追記専用 |
| `pr_audit_findings` | `audit_finding_id` | job/headへの外部key、`job+finding_fingerprint`一意 | category/severity/layer/span/evidence/diff/query digest、状態 |
| `finding_disposition_events` | `disposition_event_id` | finding/target/reviewerへの外部key、`finding+revision`一意 | 種別、evidence/authority/appeal digest、遷移前後 |
| `finding_promotions` | `finding_promotion_id` | finding/disposition/Issue FK、operation unique、actionable findingへ最大1 | cause、head、member-set digest、status |
| `finding_promotion_issue_members` | `finding_promotion_id` | promotion FK、`issue_contract_revisions(issue_id, revision)` FK、promotion一意 | Issue revision/digest、状態 |
| `finding_promotion_reverse_members` | `finding_promotion_id` | promotion FK、`reverse_runs(reverse_run_id)` FK、promotion一意 | Reverse run/digest、状態 |
| `finding_promotion_memory_members` | `finding_promotion_id` | promotion FK、`memory_issue_summary_candidates(summary_id)` FK、promotion一意 | summary digest、状態 |
| `finding_promotion_queue_members` | `finding_promotion_id` | promotion FK、`issue_queue(queue_item_id)` FK、promotion一意 | Codex queue digest、状態 |
| `pr_audit_projections` | `audit_job_id` | job一対一 | current head/job/finding/disposition/promotion digest、open count |

全FK、enum CHECK、partial uniqueをDBで強制する。delivery→job commitとfinding→4 member promotionは別transactionとし、
各transaction内ではevent/projection/idempotency receiptをall-or-nothingにする。eventからprojectionを決定的rebuildできる。
`memory_issue_summary_candidates`も同transactionでfinding FK付き生成し、kind文字列だけのtargetや実在しないtarget IDをcommitできない。

## §5 failure契約

正本tokenは`HIL_GITHUB_DELIVERY_DUPLICATE`、`HIL_GITHUB_HEAD_MISMATCH`、`HIL_FORWARD_LOOP_NOT_CONVERGED`、
`HIL_PR_AUDIT_HOOK_MISSED`、`HIL_PR_DELIVERY_DUPLICATED`、`HIL_FINDING_PROMOTION_PARTIAL`、
`HIL_FINDING_DUPLICATE_TARGET_MISSING`、`HIL_FINDING_DROPPED`、`HIL_FINDING_DISPOSITION_INVALID`である。
詳細causeは`HIL_GITHUB_DELIVERY_CONFLICT`、`HIL_AUDIT_ROLE_NOT_SEPARATED`、`HIL_AUDIT_FINDING_STALE`に限定する。

## §6 HST主系の厳密追跡

| HSTケース | L8主oracle | primary U | exact function set（stable順） | 事前状態 | 期待状態 | 正規failure |
|---|---|---|---|---|---|---|
| `HST-CASE-004-01` | `IT-GPAP-001` | `U-GPAP-011`（composition） | `verifyGithubPrDelivery` → `decidePrDeliveryIdempotency` → `resolveCurrentPrHead` → `planPrAuditJob` → `commitPrAuditJobExactlyOnce` | `no_audit_job` | `audit_queued` | `なし（正常系）` |
| `HST-CASE-004-02` | `IT-GPAP-002` | `U-GPAP-002` | `decidePrDeliveryIdempotency` | `audit_queued` | `audit_queued` | `HIL_GITHUB_DELIVERY_DUPLICATE` |
| `HST-CASE-004-03` | `IT-GPAP-003` | `U-GPAP-003` | `resolveCurrentPrHead` | `no_audit_job` | `no_audit_job` | `HIL_GITHUB_HEAD_MISMATCH` |
| `HST-CASE-004-04` | `IT-GPAP-004` | `U-GPAP-004` | `planPrAuditJob` | `no_audit_job` | `audit_queued` | `なし（正常系）` |
| `HST-CASE-004-05` | `IT-GPAP-005` | `U-GPAP-005` | `buildClaudeAuditTask` | `assertion_input_ready` | `assertion_pass` | `HIL_FORWARD_LOOP_NOT_CONVERGED` |
| `HST-CASE-004-06` | `IT-GPAP-006` | `U-GPAP-001` | `verifyGithubPrDelivery` | `assertion_input_ready` | `assertion_pass` | `HIL_PR_AUDIT_HOOK_MISSED` |
| `HST-CASE-004-07` | `IT-GPAP-007` | `U-GPAP-012`（composition） | `decidePrDeliveryIdempotency` → `commitPrAuditJobExactlyOnce` | `assertion_input_ready` | `assertion_pass` | `HIL_PR_DELIVERY_DUPLICATED` |
| `HST-CASE-005-01` | `IT-GPAP-008` | `U-GPAP-009` | `commitFindingPromotionAtomically` | `finding_open` | `queue_ready` | `なし（正常系）` |
| `HST-CASE-005-02` | `IT-GPAP-009` | `U-GPAP-009` | `commitFindingPromotionAtomically` | `finding_open` | `finding_open` | `HIL_FINDING_PROMOTION_PARTIAL` |
| `HST-CASE-005-03` | `IT-GPAP-010` | `U-GPAP-010` | `evaluateFindingDisposition` | `disposition_pending` | `disposition_pending` | `HIL_FINDING_DUPLICATE_TARGET_MISSING` |
| `HST-CASE-005-04` | `IT-GPAP-011` | `U-GPAP-008` | `buildFindingPromotion` | `assertion_input_ready` | `assertion_pass` | `HIL_FINDING_DROPPED` |
| `HST-CASE-005-05` | `IT-GPAP-012` | `U-GPAP-010` | `evaluateFindingDisposition` | `assertion_input_ready` | `assertion_pass` | `HIL_FINDING_DISPOSITION_INVALID` |

public APIの単体責務ownerはL6の一意owner U表を正本とする。`U-GPAP-011`と`012`は複数APIの結果を一つの外部observable
transitionへ結ぶcompositionであり、各APIのowner Uを置換しない。補助`IT-GPAP-013`〜`017`もL8のprimary U/function set表とexact joinする。

### §6.1 完全API→U→IT正本

全input/outputのslice-local closed V1契約はL6 §0/§1を正本とする。owner Uを先頭に置き、composition／port
protocol Uをownerへ昇格させず、既存17 U／17 IT／12 HSTの分母を維持する。

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

## §7 freeze条件

主系12/12、全base/stacked lifecycle、head race、duplicate/conflict、role分離、finding schema、全disposition mutation、
4 member fault/write-count、projection rebuild、別runtime reviewが揃うまでdraftとする。

## §8 current HEAD merge admission 詳細契約

### §8.1 public APIと閉じた型

L3 `GH-FR-018..022` と L4 `ContextualPrReviewRouter` 以降を、次のpure decision APIとNode commit APIへ降下する。
全receiptは `schema_version`、`repository_id`、`pr_number`、`head_sha`、`head_tree_digest`、`base_sha`、
`policy_digest`、`producer_identity`、`producer_session_id`、`produced_at`、`receipt_digest` を共通fieldとして持つ。
自由文のPASS、CI statusだけのreceipt、HEADを持たないapprovalは入力型で拒否する。

| API | input | output | side effect / authority | 正規failure |
|---|---|---|---|---|
| `buildContextualPrReviewPacket` | current head、L0/L2/L3/L4、Issue/PLAN、diff、trace consumer、security/blast-radiusのlocator＋digest、AI-A identity/session | immutable packet＋required-context manifest | なし。provider task生成前のpure build | `HIL_CONTEXT_REVIEW_INCOMPLETE` |
| `validateContextualPrReviewReceipt` | packet、AI-B receipt、current head observation | `valid` またはfield単位finding | なし。AI-A/AI-Bのidentity/sessionをpairwise比較 | `HIL_CONTEXT_REVIEW_INCOMPLETE` |
| `buildPrDatabaseConvergenceProbe` | current head、event journal head、schema revision、checkpoint locator、rebuild policy | 隔離rebuild command descriptor | なし。absolute DB pathやSQLをworkerへ渡さない | `HIL_PR_DATABASE_NOT_CONVERGED` |
| `evaluatePrDatabaseConvergence` | probe result、source/event/projection/checkpoint digest、schema revision、stale/orphan count | convergence decision＋receipt proposal | なし。全比較を同一snapshotで行う | `HIL_PR_DATABASE_NOT_CONVERGED` |
| `planLayerAwareAudit` | changed artifact set、versioned layer/pair/consumer graph、test registry | impact closure＋ordered verification plan | なし。未知edge/cycleはscopeを縮退せずblock | `HIL_AUDIT_FIX_SELF_APPROVED` |
| `evaluateCiPerformanceRecovery` | internal/GitHub/full run receipt、duration、correctness、environment/cache metadata | merge decisionとRecovery proposalを分離 | なし。correctness failureを性能超過へ変換しない | `HIL_CI_PERFORMANCE_RECOVERY_MISSING` |
| `evaluateRequirementApproval` | requirement revision、回答source、5問batch履歴、mock往復、approver、head | approval decision | なし。AI identityをapproverにできない | `HIL_REQUIREMENT_USER_APPROVAL_MISSING` |
| `evaluateMainRecoveryRelease` | failed main head、Recovery Issue/PR、独立review、doctor、GitHub CI、closure receipt | merge-stop解除decision | なし。全receiptが同一修正HEADの場合だけ解除 | `HIL_MAIN_RECOVERY_INCOMPLETE` |
| `resolveDeploymentProfile` | requirement/risk/cost/data classification | provider-neutral profile＋decision reasons | なし。質問待ちを標準動作にしない | `HIL_PRODUCTION_PROMOTION_UNSAFE` |
| `evaluateDeploymentCapability` | GitHub plan、Environment、concurrency、OIDC、account/role separation evidence | preflight decision | なし。UI設定名だけではgreenにしない | `HIL_PRODUCTION_PROMOTION_UNSAFE` |
| `evaluateEnvironmentPromotion` | immutable artifact/schema digest、staging receipt、approval、backup/rollback/health/monitoring | promotion decision | なし。production writeは別action-binding executor所有 | `HIL_PRODUCTION_PROMOTION_UNSAFE` |
| `evaluateProductionMigration` | expand/deploy/contract plan、compatibility window、backup/restore rehearsal、migration/rollback oracle、個別approval | migration decision | なし。apply commandやSQLを出力しない | `HIL_PRODUCTION_PROMOTION_UNSAFE` |
| `classifyUpdateBacklogItem` | Issue type/label/lifecycle/priority/area/trace | backlog projectionまたはfinding | なし。正常future itemをactive blockerへ入れない | `HIL_UPDATE_BACKLOG_CLASSIFICATION_INVALID` |
| `commitPrMergeAdmissionReceipts` | operation id、上記validated receipt bundle、current head CAS | event＋projection＋checkpointのatomic commit receipt | Node `HarnessDbPort`だけが書込。provider/workerはproposal-only | receipt別failureまたは`HIL_PR_DATABASE_NOT_CONVERGED` |

### §8.2 review packetとreceipt不変条件

review packetは対象本文をpromptへ無制限注入せず、locator、content digest、抽出されたreview question、上限付きexcerptを持つ。
`required_context` は `authority_l0`、`prototype_l2`、`requirements_l3`、`basic_design_l4`、`issue_plan`、
`diff`、`trace_consumers`、`security_blast_radius` の8区分を固定し、各区分に最低1件のmaterialを要求する。
非該当区分は空欄で済ませず、authorityと根拠digestを持つ`not_applicable` decisionを必要とする。

review receiptはpacket digest、全material digest、finding/disposition、reviewer identity/session/provider、review開始・終了時刻を持つ。
author、fixer、reviewerのidentityまたはsessionが同一、reviewer context digestがworker context digestと同一、packet作成後のpush、
base更新、CI self-heal、正本digest変更が一つでもある場合はstaleとする。部分receiptの差し替えは禁止し、current HEADでpacketと
receipt bundle全体を再生成する。

### §8.3 DB convergenceとcommit順序

隔離rebuildは追跡済みsourceとcurrent PR HEADだけから新規temporary DBを作り、作業中のproduction `harness.db`をcopyしてはならない。
比較対象は `source_head`、append-only `event_head`、replayed `projection_digest`、`checkpoint_digest`、
`schema_revision`、`stale_count=0`、`orphan_count=0`、`rebuild_finding_count=0` である。一項目でも不一致ならreceiptを発行しない。

正規commit順は (1) admission event append、(2) receipt member insert、(3) projection更新、(4) checkpoint CAS、
(5) bundle receipt公開で、単一`BEGIN IMMEDIATE` transaction内に置く。同じ`operation_id+bundle_digest`は増分0、
同operation異digestはconflictとする。event append後、projection前、checkpoint前、公開前の各fault pointでrollback後のrow増分0を要求する。
rebuildはevent chainから同じprojection/checkpoint digestを再現し、公開receiptだけが存在する片肺状態を許可しない。

### §8.4 audit・CI・Recovery状態機械

PR admission episodeは
`authoring -> internal_ci_green -> contextual_review_pending -> db_convergence_pending -> github_ci_pending -> merge_review_pending -> merge_ready`
の隣接遷移だけを許可する。audit修正が入った時点で`internal_ci_green`へ戻し、旧HEADのreview/DB/GitHub CI receiptを全てstale化する。
監査AIが修正した場合は、別identity・別sessionのreviewerへ必ず再委譲し、修正主体による自己承認を禁止する。

correctness failureは`blocked_correctness`、correctness greenかつbudget超過は`performance_recovery_open`へ分離する。
Recovery receiptはrun環境、cold/warm cache、区間、before/after p50/p95、検査集合digestを持ち、閾値緩和・test除外・
GitHub Actionsへの先送りを改善とみなさない。main merge後Full failureは`main_recovery_lock`を立て、Recovery修正HEADの
Issue/PR、独立review、doctor、GitHub CI、Issue closureが全て揃うまで通常mergeを許可しない。

### §8.5 production promotion安全境界

stagingとproductionはGitHub Environment、identity、secret scope、deployment history、rollback targetを分離する。
promotion対象はstagingで検証済みの同一artifact digestとschema contractだけであり、provider adapterがartifactをbuildし直してはならない。
production preflightはGitHub plan capability、environment concurrency、self-review禁止、OIDC trust、account/role separationを検査する。
標準profileはECS Fargate/CDK TypeScriptをreferenceとするが、receipt schemaとgateはprovider-neutralに保つ。

production deploy/migrationは本設計の自動write authority外である。`evaluateEnvironmentPromotion`と
`evaluateProductionMigration`はdecision proposalまでを返し、対象操作へ束縛した人間approval、backup、rollback、health/monitoring、
restore rehearsalが揃ってもapplyは別のaction-binding executorだけが行う。migrationはexpand→deploy→compatibility window→contractを正規順とし、
downtimeが必要な場合は停止時間・影響・復旧条件を含む追加approvalを要求する。

### §8.6 backlog投影

Update Issueは`update`、lifecycle、priority、area、traceが揃うopen itemを`future_backlog`へ投影する。
`future_backlog`はactive completion分母とblocker countから除外するが、Issue自体をclose/archiveしない。label欠落、lifecycle矛盾、
trace orphan、誤active化、無証拠closeだけをfindingとし、UpdateをFeatureへ暗黙変換しない。

## §9 L8 unit-test設計seedとL3→L5 trace closure

| HST | L3追跡 | L4構成要素 | L5所有API | L8 oracle seed | 失敗token |
|---|---|---|---|---|---|
| HST-HIL-034 | GH-FR-018 / GH-AC-014 | ContextualPrReviewRouter | `buildContextualPrReviewPacket`, `validateContextualPrReviewReceipt` | `U-GPAP-018..019` | `HIL_CONTEXT_REVIEW_INCOMPLETE` |
| HST-HIL-035 | GH-FR-018 / GH-AC-015 | PrDatabaseConvergenceGate | `buildPrDatabaseConvergenceProbe`, `evaluatePrDatabaseConvergence`, `commitPrMergeAdmissionReceipts` | `U-GPAP-020..022` | `HIL_PR_DATABASE_NOT_CONVERGED` |
| HST-HIL-036 | GH-FR-019 / GH-AC-016 | LayerAwareAuditPlanner | `planLayerAwareAudit`, `validateContextualPrReviewReceipt` | `U-GPAP-023..024` | `HIL_AUDIT_FIX_SELF_APPROVED` |
| HST-HIL-037 | GH-NFR-009..011 / GH-AC-017..018 | `CiPerformanceRecoveryRouter` | `evaluateCiPerformanceRecovery` | `U-GPAP-025` | `HIL_CI_PERFORMANCE_RECOVERY_MISSING` |
| HST-HIL-038 | GH-FR-020 / GH-NFR-012 / GH-AC-019..022 | `RequirementApprovalGate` / `MainRecoveryController` | `evaluateRequirementApproval`, `evaluateMainRecoveryRelease`, `planLayerAwareAudit` | `U-GPAP-026..028` | `HIL_REQUIREMENT_USER_APPROVAL_MISSING`, `HIL_MAIN_RECOVERY_INCOMPLETE` |
| HST-HIL-039 | GH-FR-021 / GH-NFR-013..014 / GH-AC-023..028 | `DeploymentProfileResolver` / `DeploymentCapabilityPreflight` / `EnvironmentPromotionController` / `CloudDeploymentAdapter` / `ProductionMigrationGate` | `resolveDeploymentProfile`, `evaluateDeploymentCapability`, `evaluateEnvironmentPromotion`, `evaluateProductionMigration` | `U-GPAP-029..032` | `HIL_PRODUCTION_PROMOTION_UNSAFE` |
| HST-HIL-040 | GH-FR-022 / GH-AC-029 | UpdateBacklogClassifier | `classifyUpdateBacklogItem` | `U-GPAP-033` | `HIL_UPDATE_BACKLOG_CLASSIFICATION_INVALID` |

L8では各seedに正常1件、必須field単独欠落mutation、HEAD/base/policy drift、identity/session collision、transaction faultを割り当てる。
`U-GPAP-018..033`は本書で予約する設計IDであり、L6実装開始前にL8 unit-test artifactへfixture、expected row/write/dispatch count、
property境界を確定する。L3要件、L4 component、L5 API、L9 HSTのどれかが未接続ならL5 freezeをfail-closeする。

## §10 更新後freeze条件

従来§7に加え、HST-HIL-034..040の7/7、GH-FR-018..022、GH-NFR-009..014、GH-AC-014..029の27/27が
本書のAPI・state・DB・failure・L8 seedへexact joinし、TBD/aggregate-only/N/A根拠欠落が0であることをL5完了条件とする。
production apply、migration apply、GitHub Environment変更は本freezeの対象外であり、action-binding approvalなしに実行しない。

---
title: "HELIX L8 結合テスト設計 — GitHub PR audit promotion"
layer: L5
executed_at_layer: L8
artifact_type: test_design
kind: add-design
status: draft
created: 2026-07-15
updated: 2026-07-22
owner: QA / TL
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
pair_artifact: docs/design/helix/L5-detail/github-pr-audit-promotion.md
next_pair_freeze: L5
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

# HELIX L8 結合テスト設計 — GitHub PR audit promotion

isolated harness.db、fake GitHub delivery/current-head reader、fake Claude audit adapter、Codex queue spy、固定clock/IDを使う。
remote writeと実AIは起動せず、delivery/job/finding/disposition/promotion/member/event/projectionのcountとdigestをassertする。

## §1 主系atomic case

| HSTケース | 主IT | primary U | exact function set（stable順） | 事前状態 | 期待状態 | 正規failure | scenario／write-count oracle |
|---|---|---|---|---|---|---|---|
| `HST-CASE-004-01` | `IT-GPAP-001` | `U-GPAP-011`（composition） | `verifyGithubPrDelivery` → `decidePrDeliveryIdempotency` → `resolveCurrentPrHead` → `planPrAuditJob` → `commitPrAuditJobExactlyOnce` | `no_audit_job` | `audit_queued` | `なし（正常系）` | base PR createでdelivery/head/job/event各1、Claude dispatch 1 |
| `HST-CASE-004-02` | `IT-GPAP-002` | `U-GPAP-002` | `decidePrDeliveryIdempotency` | `audit_queued` | `audit_queued` | `HIL_GITHUB_DELIVERY_DUPLICATE` | 同delivery/digest再送で全authoritative増分0、prior receipt同digest |
| `HST-CASE-004-03` | `IT-GPAP-003` | `U-GPAP-003` | `resolveCurrentPrHead` | `no_audit_job` | `no_audit_job` | `HIL_GITHUB_HEAD_MISMATCH` | payload headを旧SHAへしstale receipt 1、job/dispatch 0 |
| `HST-CASE-004-04` | `IT-GPAP-004` | `U-GPAP-004` | `planPrAuditJob` | `no_audit_job` | `audit_queued` | `なし（正常系）` | baseがmain以外のstacked PR synchronizeでもjob 1 |
| `HST-CASE-004-05` | `IT-GPAP-005` | `U-GPAP-005` | `buildClaudeAuditTask` | `assertion_input_ready` | `assertion_pass` | `HIL_FORWARD_LOOP_NOT_CONVERGED` | Codex実装→PR→Claude監査を一周し、同provider自己監査0、未完joinではclosure 0 |
| `HST-CASE-004-06` | `IT-GPAP-006` | `U-GPAP-001` | `verifyGithubPrDelivery` | `assertion_input_ready` | `assertion_pass` | `HIL_PR_AUDIT_HOOK_MISSED` | base/stackedのcreate/update/completion全deliveryにcurrent-head job各1 |
| `HST-CASE-004-07` | `IT-GPAP-007` | `U-GPAP-012`（composition） | `decidePrDeliveryIdempotency` → `commitPrAuditJobExactlyOnce` | `assertion_input_ready` | `assertion_pass` | `HIL_PR_DELIVERY_DUPLICATED` | 同deliveryを並行N回送りjob 1、idempotency receipt N-1 |
| `HST-CASE-005-01` | `IT-GPAP-008` | `U-GPAP-009` | `commitFindingPromotionAtomically` | `finding_open` | `queue_ready` | `なし（正常系）` | actionable findingからpromotion/Issue/Reverse/memory-summary/queue各1、cause一致 |
| `HST-CASE-005-02` | `IT-GPAP-009` | `U-GPAP-009` | `commitFindingPromotionAtomically` | `finding_open` | `finding_open` | `HIL_FINDING_PROMOTION_PARTIAL` | 4 member各insert直後faultで全member/Issue/Reverse/queue増分0 |
| `HST-CASE-005-03` | `IT-GPAP-010` | `U-GPAP-010` | `evaluateFindingDisposition` | `disposition_pending` | `disposition_pending` | `HIL_FINDING_DUPLICATE_TARGET_MISSING` | target missing/stale/acceptance非包含でclose 0、challenge 1 |
| `HST-CASE-005-04` | `IT-GPAP-011` | `U-GPAP-008` | `buildFindingPromotion` | `assertion_input_ready` | `assertion_pass` | `HIL_FINDING_DROPPED` | Claude actionable findingごと4 member join、欠落時queue ready 0 |
| `HST-CASE-005-05` | `IT-GPAP-012` | `U-GPAP-010` | `evaluateFindingDisposition` | `assertion_input_ready` | `assertion_pass` | `HIL_FINDING_DISPOSITION_INVALID` | 5 dispositionの必須evidenceを各欠落しpending、appeal route保持 |

## §2 補助fault matrix

| ID | primary U／exact function set（stable順） | fault | 期待結果 |
|---|---|---|---|
| `IT-GPAP-013` | `U-GPAP-015`: `commitPrAuditJobExactlyOnce` | delivery/head/job/projection各write直後fault | 全rollback、同operation再試行だけexactly-one commit |
| `IT-GPAP-014` | `U-GPAP-013`: `buildClaudeAuditTask` → `validateAuditFinding` | queued中にhead更新、旧jobからfinding返却 | 旧job/finding stale、新head job 1、promotion 0 |
| `IT-GPAP-015` | `U-GPAP-014`: `planPrAuditJob` → `buildClaudeAuditTask` → `validateAuditFinding` | ClaudeとCodexのidentity/role/providerを各一致 | audit dispatch 0、role separation finding 1 |
| `IT-GPAP-016` | `U-GPAP-016`: `commitFindingPromotionAtomically` | eventからpromotion projectionをrebuild | open finding/promotion/member-set digest一致 |
| `IT-GPAP-017` | `U-GPAP-017`: `invalidateAuditJobForBaseChange` | PR head SHAを固定したままbase push/rebaseでbase tree、merge-base、diff-baseを各変更 | 旧job stale、新head job 1、旧job finding/promotion 0 |

### §2.1 完全API→U→IT逆引き

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

PR hook監査jobは`IT-GPAP-001`／`007`／`013`でdelivery decisionとatomic job commitを別mutationとして採点する。
finding promotionは`IT-GPAP-008`／`009`／`016`で4 member全insertとprojectionを不可分に採点し、部分targetを成功へ数えない。

## §3 合否

主系12件と補助5件を全件実行する。branch sample、代表disposition、4 memberの一部だけで分母を縮小しない。
delivery payload本文、raw log、secret/PIIをevidenceへ保存せず、sanitized digestとDB query digestを残す。

## §4 current HEAD merge admission追加case

追加caseは追跡済みsourceだけから作る隔離DB、固定layer graph、fake GitHub observation、fake clock/identity/sessionを使う。
production deploy/migration、GitHub Environment変更、外部provider writeは行わず、decisionとreceipt proposalだけを検査する。

| IT | owner U / API | fixture | 期待oracle |
|---|---|---|---|
| `IT-GPAP-018` | `U-GPAP-018`: `buildContextualPrReviewPacket` | 8 context区分を各1件ずつ欠落、根拠なしN/A、digest改竄 | 完全packetだけ生成し、欠落ごと`HIL_CONTEXT_REVIEW_INCOMPLETE` |
| `IT-GPAP-019` | `U-GPAP-019`: `validateContextualPrReviewReceipt` | author/fixer/reviewer identity・session衝突、別HEAD、push/base/policy drift | current HEADの独立reviewだけvalid、旧receiptは全体stale |
| `IT-GPAP-020` | `U-GPAP-020`: `buildPrDatabaseConvergenceProbe` | production DB copy、absolute path/SQLをworker inputへ混入 | clean isolated rebuild descriptorだけ許可し、既存DB依存を拒否 |
| `IT-GPAP-021` | `U-GPAP-021`: `evaluatePrDatabaseConvergence` | source/event/projection/checkpoint/schemaを各単独不一致、stale/orphan各1 | 全一致かつcount 0だけreceipt proposal、他は`HIL_PR_DATABASE_NOT_CONVERGED` |
| `IT-GPAP-022` | `U-GPAP-022`: `commitPrMergeAdmissionReceipts` | event/member/projection/checkpoint/publication各直後fault、CAS競合、duplicate operation | fault時全増分0、同operation同digest再送0、rebuild digest一致 |
| `IT-GPAP-023` | `U-GPAP-023`: `planLayerAwareAudit` | unknown edge、cycle、上下pair/V-pair/consumer各欠落 | 影響閉包を縮退せずblockし、正常graphはstable ordered plan |
| `IT-GPAP-024` | `U-GPAP-024`: `validateContextualPrReviewReceipt` | audit AIが修正後に自己review、修正前receipt再利用 | 別identity/sessionの新HEAD reviewまで`HIL_AUDIT_FIX_SELF_APPROVED` |
| `IT-GPAP-025` | `U-GPAP-025`: `evaluateCiPerformanceRecovery` | correctness fail、60秒/3分超過、cache/env欠落、test除外、閾値緩和 | correctnessと性能routeを分離し、縮退改善を拒否 |
| `IT-GPAP-026` | `U-GPAP-026`: `evaluateRequirementApproval` | 回答source/5問履歴/mock往復/current revision/人間approverを各欠落 | 全履歴をcurrent revisionへ束縛した人間承認だけPR可 |
| `IT-GPAP-027` | `U-GPAP-027`: `evaluateMainRecoveryRelease` | Recovery Issue/PR/review/doctor/GitHub CI/closureを各欠落または別HEAD化 | 同一修正HEADの完全closureだけmerge-stop解除 |
| `IT-GPAP-028` | `U-GPAP-028`: `planLayerAwareAudit` | main Recoveryと通常Featureを同時投入 | Recoveryを先にscheduleし、通常mergeをlockしたまま保持 |
| `IT-GPAP-029` | `U-GPAP-029`: `resolveDeploymentProfile` | 標準要件、明示逸脱理由、未分類riskを投入 | 標準profileを決定し、逸脱は理由付き、未知riskはfail-close |
| `IT-GPAP-030` | `U-GPAP-030`: `evaluateDeploymentCapability` | plan機能、concurrency、self-review禁止、OIDC、role分離を各欠落 | 全preflight greenまでproduction disabled |
| `IT-GPAP-031` | `U-GPAP-031`: `evaluateEnvironmentPromotion` | artifact drift、staging欠落、approval/backup/rollback/health/monitoring各欠落 | decision denied、external write 0、全証拠時もproposal-only |
| `IT-GPAP-032` | `U-GPAP-032`: `evaluateProductionMigration` | 順序違反、restore rehearsal/compatibility/oracle/approval欠落、downtime未承認 | apply command/SQL 0、完全proposalだけeligible |
| `IT-GPAP-033` | `U-GPAP-033`: `classifyUpdateBacklogItem` | 正常future、label/state/trace欠落、active化、close、Feature変換 | 正常はfuture_backlogかつactive分母外、異常だけfinding |

## §5 追加HST→IT closure

| HST | 必須IT | pass条件 |
|---|---|---|
| `HST-HIL-034` | `IT-GPAP-018..019` | 8 context区分、独立identity/session、current HEAD stale規則が全green |
| `HST-HIL-035` | `IT-GPAP-020..022` | isolated rebuild、7収束比較、atomic commit/rebuildが全green |
| `HST-HIL-036` | `IT-GPAP-023..024` | graph closureと修正後独立reviewがgreen |
| `HST-HIL-037` | `IT-GPAP-025` | correctness/performance分離と非縮退Recoveryがgreen |
| `HST-HIL-038` | `IT-GPAP-026..028` | 人間要件承認、同一HEAD main Recovery、優先scheduleがgreen |
| `HST-HIL-039` | `IT-GPAP-029..032` | profile/preflight/promotion/migration decisionがgreen、external write 0 |
| `HST-HIL-040` | `IT-GPAP-033` | future backlog分類と異常finding分離がgreen |

追加16件は代表caseでまとめず、必須field単独欠落、各stale trigger、各transaction faultをparameterized mutationとして全実行する。
合否分母は既存17件＋追加16件の33件で、追加caseはL6実装前でもfixture、expected decision、row/write/dispatch countが確定していることを要求する。

---
title: "HELIX L8 結合テスト設計 — GitHub PR audit promotion"
layer: L5
executed_at_layer: L8
artifact_type: test_design
kind: add-design
status: draft
created: 2026-07-15
updated: 2026-07-15
owner: QA / TL
plan: PLAN-L1-07-infinity-loop-platform-requirements
design_slice: HDS-HIL-03
related_l3: docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md
related_l4: docs/design/helix/L4-basic-design/infinity-loop-platform-basic-design.md
related_hst:
  - HST-HIL-004
  - HST-HIL-005
pair_artifact: docs/design/helix/L5-detail/github-pr-audit-promotion.md
next_pair_freeze: L5
requirements:
  - HR-FR-HIL-03
  - HAC-HIL-03a
  - HAC-HIL-03b
  - HAC-HIL-03c
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

## §3 合否

主系12件と補助5件を全件実行する。branch sample、代表disposition、4 memberの一部だけで分母を縮小しない。
delivery payload本文、raw log、secret/PIIをevidenceへ保存せず、sanitized digestとDB query digestを残す。

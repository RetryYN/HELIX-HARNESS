---
title: "HELIX L7 単体テスト設計 — GitHub PR audit promotion"
layer: L6
executed_at_layer: L7
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
pair_artifact: docs/design/helix/L6-function-design/github-pr-audit-promotion.md
next_pair_freeze: L6
requirements:
  - HR-FR-HIL-03
  - HAC-HIL-03a
  - HAC-HIL-03b
  - HAC-HIL-03c
---

# HELIX L7 単体テスト設計 — GitHub PR audit promotion

全testは固定clock/ID、in-memory ports、fake current-head readerを使い、GitHub/Claude/Codexを起動しない。

## §0 公開APIのowner unit

各public APIの単体責務ownerは次の一件だけとし、composition Uやport protocol Uをownerとして数えない。

| owner U | 公開API | 直接oracle |
|---|---|---|
| `U-GPAP-001` | `verifyGithubPrDelivery` | schema、action許可一覧、payload/transport digest |
| `U-GPAP-002` | `decidePrDeliveryIdempotency` | 同一digestはno-op、異なるdigestはconflict |
| `U-GPAP-003` | `resolveCurrentPrHead` | repository/PR/SHA/tree exact一致 |
| `U-GPAP-004` | `planPrAuditJob` | base非除外、job key、role separation |
| `U-GPAP-005` | `buildClaudeAuditTask` | current head、view/diff digest、read-only role briefへの拘束 |
| `U-GPAP-006` | `validateAuditFinding` | job/head/policy/span/evidence/fingerprint/producerへの拘束 |
| `U-GPAP-007` | `commitPrAuditJobExactlyOnce` | delivery/head/job/event/projectionのatomic commit |
| `U-GPAP-008` | `buildFindingPromotion` | exact 4 member、cause/head/member-set digestの一致 |
| `U-GPAP-009` | `commitFindingPromotionAtomically` | promotion/4 target/event/projectionのatomic commit |
| `U-GPAP-010` | `evaluateFindingDisposition` | kind別authority、pending、appeal route |
| `U-GPAP-017` | `invalidateAuditJobForBaseChange` | comparison identity変更時のstale/new-job decision |

## §1 主系atomic case

| HSTケース | 主unit | exact function set（stable順） | 事前状態 | 期待状態 | 正規failure | mutation oracle |
|---|---|---|---|---|---|---|
| `HST-CASE-004-01` | `U-GPAP-011`（composition） | `verifyGithubPrDelivery` → `decidePrDeliveryIdempotency` → `resolveCurrentPrHead` → `planPrAuditJob` → `commitPrAuditJobExactlyOnce` | `no_audit_job` | `audit_queued` | `なし（正常系）` | valid createのdelivery/head/job/event/projectionを不可分commitしjob一件 |
| `HST-CASE-004-02` | `U-GPAP-002` | `decidePrDeliveryIdempotency` | `audit_queued` | `audit_queued` | `HIL_GITHUB_DELIVERY_DUPLICATE` | same delivery/digest反復でno-op、write count 0 |
| `HST-CASE-004-03` | `U-GPAP-003` | `resolveCurrentPrHead` | `no_audit_job` | `no_audit_job` | `HIL_GITHUB_HEAD_MISMATCH` | SHA/tree/repo/PRを各変異しhead result 0 |
| `HST-CASE-004-04` | `U-GPAP-004` | `planPrAuditJob` | `no_audit_job` | `audit_queued` | `なし（正常系）` | base名の全fixtureで同job plan、stacked除外0 |
| `HST-CASE-004-05` | `U-GPAP-005` | `buildClaudeAuditTask` | `assertion_input_ready` | `assertion_pass` | `HIL_FORWARD_LOOP_NOT_CONVERGED` | required join/role/view digestを各欠落しtask 0 |
| `HST-CASE-004-06` | `U-GPAP-001` | `verifyGithubPrDelivery` | `assertion_input_ready` | `assertion_pass` | `HIL_PR_AUDIT_HOOK_MISSED` | lifecycle action全件を検査し未対応action集合0 |
| `HST-CASE-004-07` | `U-GPAP-012`（composition） | `decidePrDeliveryIdempotency` → `commitPrAuditJobExactlyOnce` | `assertion_input_ready` | `assertion_pass` | `HIL_PR_DELIVERY_DUPLICATED` | 並行commitでwinner 1、loser receipt、異digest conflict |
| `HST-CASE-005-01` | `U-GPAP-009` | `commitFindingPromotionAtomically` | `finding_open` | `queue_ready` | `なし（正常系）` | 4実在target FKと同cause/head/member-set digestを不可分commit |
| `HST-CASE-005-02` | `U-GPAP-009` | `commitFindingPromotionAtomically` | `finding_open` | `finding_open` | `HIL_FINDING_PROMOTION_PARTIAL` | 4 write位置faultでcommit count全0 |
| `HST-CASE-005-03` | `U-GPAP-010` | `evaluateFindingDisposition` | `disposition_pending` | `disposition_pending` | `HIL_FINDING_DUPLICATE_TARGET_MISSING` | target null/stale/non-coveringを拒否しappeal route保持 |
| `HST-CASE-005-04` | `U-GPAP-008` | `buildFindingPromotion` | `assertion_input_ready` | `assertion_pass` | `HIL_FINDING_DROPPED` | 各memberを一つずつ欠落・別cause化しbundle 0 |
| `HST-CASE-005-05` | `U-GPAP-010` | `evaluateFindingDisposition` | `assertion_input_ready` | `assertion_pass` | `HIL_FINDING_DISPOSITION_INVALID` | 5 kindのtarget/reviewer/approval/owner/appealを各欠落しpending |

## §2 補助unit

| ID | 種別／exact function set（stable順） | 反例と直接assert |
|---|---|---|
| `U-GPAP-013` | composition: `buildClaudeAuditTask` → `validateAuditFinding` | head/policy/span/evidence/fingerprint/providerを各変異し、taskとfindingのjob/head bind不一致ではfinding 0 |
| `U-GPAP-014` | composition: `planPrAuditJob` → `buildClaudeAuditTask` → `validateAuditFinding` | Claude/Codex identity、role、provider familyの各衝突でdispatch/finding 0 |
| `U-GPAP-015` | port protocol: `commitPrAuditJobExactlyOnce` | `PrAuditStorePort`のdelivery/head/job/event/projection各faultでpartial 0 |
| `U-GPAP-016` | port protocol: `commitFindingPromotionAtomically` | `FindingPromotionStorePort`へsame operation/digest再送時は増分0、異digest時は既存target変更0 |
| `U-GPAP-017` | owner: `invalidateAuditJobForBaseChange` | head固定でbase SHA/tree、merge-base SHA/tree、diff-baseを各変異し旧job stale、新job required |

## §3 合否

public APIの一意ownerは`U-GPAP-001`〜`010`と`017`、composition/port protocolは`U-GPAP-011`〜`016`である。
従ってcanonical ID集合は既存どおり`U-GPAP-001`〜`017`のexact 17件で、欠番・追加IDはない。
主系12 caseをrangeやfamily行へまとめず一意に採点する。全mutationでtyped Result、stable error順、
row/event/write/dispatch count、before/after digestをassertし、mock call成功やClaude proseだけをgreenにしない。

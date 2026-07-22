---
title: "HELIX L7 単体テスト設計 — GitHub PR audit promotion"
layer: L6
executed_at_layer: L7
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
pair_artifact: docs/design/helix/L6-function-design/github-pr-audit-promotion.md
next_pair_freeze: L6
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
| `U-GPAP-014` | composition: `planPrAuditJob` → `buildClaudeAuditTask` → `validateAuditFinding` | AI-A/AI-B の identity、session、context、role の各衝突でdispatch/finding 0。provider family の一致だけでは拒否しない |
| `U-GPAP-015` | port protocol: `commitPrAuditJobExactlyOnce` | `PrAuditStorePort`のdelivery/head/job/event/projection各faultでpartial 0 |
| `U-GPAP-016` | port protocol: `commitFindingPromotionAtomically` | `FindingPromotionStorePort`へsame operation/digest再送時は増分0、異digest時は既存target変更0 |
| `U-GPAP-017` | owner: `invalidateAuditJobForBaseChange` | head固定でbase SHA/tree、merge-base SHA/tree、diff-baseを各変異し旧job stale、新job required |

### §2.1 完全API→U→IT逆引き

exact V1 signatureはpair先L6 §0/§1を正本とし、ownerとcomposition／port protocolを次へ固定する。

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

## §3 合否

public APIの一意ownerは`U-GPAP-001`〜`010`と`017`、composition/port protocolは`U-GPAP-011`〜`016`である。
従ってcanonical ID集合は既存どおり`U-GPAP-001`〜`017`のexact 17件で、欠番・追加IDはない。
主系12 caseをrangeやfamily行へまとめず一意に採点する。全mutationでtyped Result、stable error順、
row/event/write/dispatch count、before/after digestをassertし、mock call成功やClaude proseだけをgreenにしない。

## §4 current HEAD merge admissionの所有unit

| owner U | 公開API | 直接oracle |
|---|---|---|
| `U-GPAP-018` | `buildContextualPrReviewPacket` | 8 context kind exact、重複・欠落・偽N/A拒否、決定的digest |
| `U-GPAP-019` | `validateContextualPrReviewReceipt` | packet/HEADとidentity/session/context分離、stale trigger全件 |
| `U-GPAP-020` | `buildPrDatabaseConvergenceProbe` | production DB copy、absolute path、SQL入力面が存在しない |
| `U-GPAP-021` | `evaluatePrDatabaseConvergence` | source/event/projection/checkpoint/schema、stale/orphan/findingを個別変異 |
| `U-GPAP-022` | `commitPrMergeAdmissionReceipts` | 5 write位置fault、CAS、same operation replay |
| `U-GPAP-023` | `planLayerAwareAudit` | unknown edge、cycle、上下pair、V-pair、consumer閉包 |
| `U-GPAP-024` | `validateAuditFixReview` | fixer自己承認、同session/context、修正前HEAD receipt拒否 |
| `U-GPAP-025` | `evaluateCiPerformanceRecovery` | correctness/性能分離、60秒/3分、環境/cache、非縮退集合 |
| `U-GPAP-026` | `evaluateRequirementApproval` | 回答source、5問履歴、mock往復、revision、人間approver |
| `U-GPAP-027` | `evaluateMainRecoveryRelease` | 6 receiptの同一fix HEAD closure |
| `U-GPAP-028` | `prioritizeRecoveryAudit` | main Recovery優先、独立item順序安定 |
| `U-GPAP-029` | `resolveDeploymentProfile` | 標準profile、理由付き逸脱、未知risk拒否 |
| `U-GPAP-030` | `evaluateDeploymentCapability` | GitHub plan/concurrency/self-review/OIDC/role分離 |
| `U-GPAP-031` | `evaluateEnvironmentPromotion` | artifact・staging・approval・backup・rollback・health・monitoring、外部write 0 |
| `U-GPAP-032` | `evaluateProductionMigration` | 順序、restore、互換期間、oracle、approval、SQL 0 |
| `U-GPAP-033` | `classifyUpdateBacklogItem` | 正常futureをactive分母外、異常finding、Feature変換0 |

## §5 追加mutationと合否

`U-GPAP-018..033`は各owner APIの正常系1件と必須field単独欠落を全件実行する。digestはkey順を変えた同値objectで一致し、
material配列順・changed node順の規約違反を検出する。DB convergenceはin-memory rebuildを2回行いprojection/checkpoint digest一致、
stale/orphan/finding 0をassertする。production系はeligible decisionでもexecutor、shell command、SQL、credentialを出力しない。

canonical分母は既存17件＋追加16件の33件である。`U-GPAP-001..033`の欠番、重複owner、L6 signature不一致、
対応`IT-GPAP-001..033`欠落が一件でもあればL7 closureをfail-closeする。

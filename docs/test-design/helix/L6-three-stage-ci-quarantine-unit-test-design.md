---
title: "HELIX L7 単体テスト設計 — three-stage CI quarantine"
layer: L6
executed_at_layer: L7
artifact_type: test_design
status: draft
created: 2026-07-15
updated: 2026-07-15
owner: QA / TL
plan: PLAN-L1-07-infinity-loop-platform-requirements
design_slice: HDS-HIL-06
related_l3: docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md
related_l4: docs/design/helix/L4-basic-design/infinity-loop-platform-basic-design.md
related_hst:
  - HST-HIL-003
  - HST-HIL-022
pair_artifact: docs/design/helix/L6-function-design/three-stage-ci-quarantine.md
next_pair_freeze: L6
requirements:
  - HR-FR-HIL-06
  - HAC-HIL-06a
  - HAC-HIL-06b
  - HAC-HIL-06c
source_capabilities:
  - HU-CAP-006
---

# HELIX L7 単体テスト設計 — three-stage CI quarantine

全caseは未実装である。fake Git graph/provider/clockとin-memory portを使い、external API、Git write、DB writeを行わない。
各caseはresultだけでなくHAC、canonical HST/failure、state不変、check/fixture件数、SHA/tree/check-set/input-scope digestをassertする。

| ID | exact function | 反例と期待結果 | HAC | exact HST disposition | test citation |
|---|---|---|---|---|---|
| `U-CIQ-001` | `parseCiSourceCapabilityBinding` | root/base/source commit/tree、11-entry set/unique delta、各blob/span/dispositionを一つずつ改変し、PLAN-L7-221をdeltaへ混入したfixtureも拒否 | `HAC-HIL-06a` | `HST-CASE-003-01` → `なし（正常系）` | `tests/ci-source-capability-binding.test.ts` |
| `U-CIQ-002` | `buildCiRequiredCheckProfile` | universal PR trigger欠落、base filter、source/pack step混同、command/input scope欠落を拒否 | `HAC-HIL-06a`, `HAC-HIL-06b` | `HST-CASE-003-08` → `HIL_CI_REQUIRED_CHECK_MISSING` | `tests/ci-required-check-profile.test.ts` |
| `U-CIQ-003` | `createThreeStageCiChain` | 同一Issue/Reverse/source/profileは同一identity、SHA/tree/profile差は別identity | `HAC-HIL-06a` | `HST-CASE-003-01` → `なし（正常系）` | `tests/three-stage-ci-chain.test.ts` |
| `U-CIQ-004` | `planReversePrejoinStage` | ordinal 1と全checkを生成し、一件failureではForward join 0 | `HAC-HIL-06a`, `HAC-HIL-06b` | `HST-CASE-003-02` → `HIL_CI_PREJOIN_FAILED` | `tests/three-stage-ci-chain.test.ts` |
| `U-CIQ-005` | `validateForwardJoinReceipt` | prejoin未accepted、candidate parent SHA/tree不一致、join result欠落を拒否 | `HAC-HIL-06b` | `HST-CASE-003-05` → `HIL_CI_STAGE_BYPASS` | `tests/ci-forward-join-binding.test.ts` |
| `U-CIQ-006` | `planForwardPostjoinStage` | prejoin/join bind済みだけordinal 2を生成し、required failureでPR plan 0 | `HAC-HIL-06a`, `HAC-HIL-06b` | `HST-CASE-003-03` → `HIL_CI_POSTJOIN_FAILED` | `tests/three-stage-ci-chain.test.ts` |
| `U-CIQ-007` | `parseGithubExternalDelivery` | repo/PR/head/workflow/check suite/delivery欠落と旧headを拒否 | `HAC-HIL-06b` | `HST-CASE-003-09` → `HIL_CI_SHA_STALE` | `tests/github-ci-delivery.test.ts` |
| `U-CIQ-008` | `planGithubExternalStage` | postjoin SHA/treeとPR head一致時だけordinal 3を生成し、external failureでmerge 0 | `HAC-HIL-06a`, `HAC-HIL-06b` | `HST-CASE-003-04` → `HIL_CI_EXTERNAL_FAILED` | `tests/three-stage-ci-chain.test.ts` |
| `U-CIQ-009` | `validateCiStageOrder` | ordinal重複/飛越/逆転、predecessor欠落、terminal再開を拒否 | `HAC-HIL-06b` | `HST-CASE-003-11` → `HIL_CI_STAGE_BYPASS`; `HST-CASE-003-12` → `HIL_CI_STAGE_LINEAGE_INVALID` | `tests/ci-stage-lineage.test.ts` |
| `U-CIQ-010` | `validateCiStageLineage` | 別chain/SHA、同SHA異tree、check-set/input-scope/predecessor差を個別拒否 | `HAC-HIL-06b` | `HST-CASE-003-06` → `HIL_CI_LINEAGE_MISMATCH`; `HST-CASE-003-07` → `HIL_CI_TREE_DIGEST_MISMATCH`; `HST-CASE-003-13` → `HIL_CI_RECEIPT_LINEAGE_INVALID` | `tests/ci-stage-lineage.test.ts` |
| `U-CIQ-011` | `aggregateCiCheckResults` | missing result、neutral/skipped/cancelled/unknown、retry時check/fixture削減をpassed 0にする | `HAC-HIL-06a`, `HAC-HIL-06b` | `HST-CASE-003-08` → `HIL_CI_REQUIRED_CHECK_MISSING`; `HST-CASE-003-10` → `HIL_CI_CONCLUSION_NOT_GREEN` | `tests/ci-check-aggregation.test.ts` |
| `U-CIQ-012` | `invalidateCiChainForHeadChange` | force-push/self-heal commitで旧stage/eligibilityを全てstale化し新chain pointerを返す | `HAC-HIL-06b` | `HST-CASE-003-09` → `HIL_CI_SHA_STALE` | `tests/ci-chain-invalidation.test.ts` |
| `U-CIQ-013` | `deriveCiFailureFingerprint` | path/time/run ID差を吸収し、rule/stack/toolchain意味差を別fingerprintにする | `HAC-HIL-06c` | `HST-CASE-022-02` → `HIL_QUARANTINE_FINGERPRINT_MISMATCH` | `tests/ci-failure-fingerprint.test.ts` |
| `U-CIQ-014` | `parseCiQuarantineRule` | typed scopeの空/重複/unknown/空ID、wildcard/directory/all-check/無期限、reason/evidence/source/pack/check-profile/approval/owner/Issue欠落を個別拒否 | `HAC-HIL-06c` | `HST-CASE-022-05` → `HIL_QUARANTINE_WILDCARD_FORBIDDEN`; `HST-CASE-022-06` → `HIL_QUARANTINE_REMEDIATION_MISSING`; `HST-CASE-022-10` → `HIL_QUARANTINE_OVERBROAD` | `tests/ci-quarantine-rule.test.ts` |
| `U-CIQ-015` | `evaluateCiQuarantineApplication` | exact既知全件だけcanonical quarantine stateへ遷移し、fingerprint差、新failure混在、scope/profile差ではapplication 0 | `HAC-HIL-06c` | `HST-CASE-022-01` → `なし（正常系）`; `HST-CASE-022-02` → `HIL_QUARANTINE_FINGERPRINT_MISMATCH`; `HST-CASE-022-08` → `HIL_CI_QUARANTINE_INVALID`; `HST-CASE-022-09` → `HIL_QUARANTINE_SCOPE_INVALID` | `tests/ci-quarantine-application.test.ts` |
| `U-CIQ-016` | `validateCiMinimumGate` | gate欠落/非green、元workload省略、minimum gate自身のquarantineを拒否 | `HAC-HIL-06b`, `HAC-HIL-06c` | `HST-CASE-022-04` → `HIL_QUARANTINE_MINIMUM_GATE_MISSING` | `tests/ci-quarantine-minimum-gate.test.ts` |
| `U-CIQ-017` | `evaluateCiQuarantineExpiry` | trusted clock境界、期限超過、baseline/tree/profile/scope driftをexpired/staleにする | `HAC-HIL-06c` | `HST-CASE-022-03` → `HIL_QUARANTINE_EXPIRED` | `tests/ci-quarantine-expiry.test.ts` |
| `U-CIQ-018` | `planCiSelfHealRoute` | same-tree transient、repush可能failure、低confidence、security/permission/unknown、上限到達を別routeへ送る | `HAC-HIL-06b`, `HAC-HIL-06c` | `HST-CASE-022-07` → `HIL_QUARANTINE_EXHAUSTED` | `tests/ci-self-heal-plan.test.ts` |
| `U-CIQ-019` | `recordCiRecoveryAttemptResult` | retryのsame-tree/full workloadと、repushのprior attempt/rerequest/log/root-cause/diff/green/push/PR head/new-chain三段receiptを一件ずつ欠落・旧head・同chain化しResult失敗、merge 0 | `HAC-HIL-06b` | `HST-CASE-003-08` → `HIL_CI_REQUIRED_CHECK_MISSING` | `tests/ci-self-heal-attempt.test.ts` |
| `U-CIQ-020` | `finalizeCiMergeEligibility` | current PR head以外、三段欠落、quarantine-only green、branch policy差をmerge不可にする | `HAC-HIL-06a`, `HAC-HIL-06b`, `HAC-HIL-06c` | `HST-CASE-003-13` → `HIL_CI_RECEIPT_LINEAGE_INVALID`; `HST-CASE-022-01` → `なし（正常系）` | `tests/ci-merge-eligibility.test.ts` |

| `U-CIQ-021` | `buildCiMutationCommitBundle` | 入力順差を同digestへ正規化し、stage/quarantine/self-healとrule create/update/expire別の必須write set・rule revision・approval/freshness欠落を拒否 | `HAC-HIL-06a`, `HAC-HIL-06b`, `HAC-HIL-06c` | supporting | `tests/ci-mutation-transaction.test.ts` |
| `U-CIQ-022` | `commitCiMutationBundle` | check/event/projection/receipt/lineage/outcomeおよびrule row各append faultで当該transaction全write 0。同operation同digestは一件、異digest/stale event・projection・rule headはconflict | `HAC-HIL-06a`, `HAC-HIL-06b`, `HAC-HIL-06c` | supporting | `tests/ci-mutation-transaction.test.ts` |
| `U-CIQ-023` | `reconcileCiMutationCommit` | immutable evidence一致時だけprojection/receipt/rule expiry eventを復元し、missing rule/check/greenを補完しない | `HAC-HIL-06b` | supporting | `tests/ci-mutation-reconcile.test.ts` |

### canonical 23件の単体oracle結線

次表をcase単位のatomic合否正本とし、各caseの主unit oracle、state pair、failureを同じ行でassertする。

| HST正本 | 単体oracle | 対象関数 | 前state | 後state | failure正本 |
|---|---|---|---|---|---|
| `HST-CASE-003-01` | `U-CIQ-003` | `createThreeStageCiChain` | `implemented` | `prejoin_accepted` | `なし（正常系）` |
| `HST-CASE-003-02` | `U-CIQ-004` | `planReversePrejoinStage` | `implemented` | `failed` | `HIL_CI_PREJOIN_FAILED` |
| `HST-CASE-003-03` | `U-CIQ-006` | `planForwardPostjoinStage` | `postjoin_running` | `failed` | `HIL_CI_POSTJOIN_FAILED` |
| `HST-CASE-003-04` | `U-CIQ-008` | `planGithubExternalStage` | `external_running` | `failed` | `HIL_CI_EXTERNAL_FAILED` |
| `HST-CASE-003-05` | `U-CIQ-005` | `validateForwardJoinReceipt` | `created` | `created` | `HIL_CI_STAGE_BYPASS` |
| `HST-CASE-003-06` | `U-CIQ-010` | `validateCiStageLineage` | `prejoin_accepted` | `prejoin_accepted` | `HIL_CI_LINEAGE_MISMATCH` |
| `HST-CASE-003-07` | `U-CIQ-010` | `validateCiStageLineage` | `prejoin_accepted` | `prejoin_accepted` | `HIL_CI_TREE_DIGEST_MISMATCH` |
| `HST-CASE-003-08` | `U-CIQ-011` | `aggregateCiCheckResults` | `external_running` | `failed` | `HIL_CI_REQUIRED_CHECK_MISSING` |
| `HST-CASE-003-09` | `U-CIQ-012` | `invalidateCiChainForHeadChange` | `external_accepted` | `stale` | `HIL_CI_SHA_STALE` |
| `HST-CASE-003-10` | `U-CIQ-011` | `aggregateCiCheckResults` | `external_running` | `failed` | `HIL_CI_CONCLUSION_NOT_GREEN` |
| `HST-CASE-003-11` | `U-CIQ-009` | `validateCiStageOrder` | `assertion_input_ready` | `assertion_pass` | `HIL_CI_STAGE_BYPASS` |
| `HST-CASE-003-12` | `U-CIQ-009` | `validateCiStageOrder` | `assertion_input_ready` | `assertion_pass` | `HIL_CI_STAGE_LINEAGE_INVALID` |
| `HST-CASE-003-13` | `U-CIQ-010` | `validateCiStageLineage` | `assertion_input_ready` | `assertion_pass` | `HIL_CI_RECEIPT_LINEAGE_INVALID` |
| `HST-CASE-022-01` | `U-CIQ-015` | `evaluateCiQuarantineApplication` | `failed` | `quarantined` | `なし（正常系）` |
| `HST-CASE-022-02` | `U-CIQ-015` | `evaluateCiQuarantineApplication` | `failed` | `failed` | `HIL_QUARANTINE_FINGERPRINT_MISMATCH` |
| `HST-CASE-022-03` | `U-CIQ-017` | `evaluateCiQuarantineExpiry` | `failed` | `failed` | `HIL_QUARANTINE_EXPIRED` |
| `HST-CASE-022-04` | `U-CIQ-016` | `validateCiMinimumGate` | `failed` | `failed` | `HIL_QUARANTINE_MINIMUM_GATE_MISSING` |
| `HST-CASE-022-05` | `U-CIQ-014` | `parseCiQuarantineRule` | `proposed` | `proposed` | `HIL_QUARANTINE_WILDCARD_FORBIDDEN` |
| `HST-CASE-022-06` | `U-CIQ-014` | `parseCiQuarantineRule` | `proposed` | `proposed` | `HIL_QUARANTINE_REMEDIATION_MISSING` |
| `HST-CASE-022-07` | `U-CIQ-018` | `planCiSelfHealRoute` | `exhausted` | `failed` | `HIL_QUARANTINE_EXHAUSTED` |
| `HST-CASE-022-08` | `U-CIQ-015` | `evaluateCiQuarantineApplication` | `assertion_input_ready` | `assertion_pass` | `HIL_CI_QUARANTINE_INVALID` |
| `HST-CASE-022-09` | `U-CIQ-015` | `evaluateCiQuarantineApplication` | `assertion_input_ready` | `assertion_pass` | `HIL_QUARANTINE_SCOPE_INVALID` |
| `HST-CASE-022-10` | `U-CIQ-014` | `parseCiQuarantineRule` | `assertion_input_ready` | `assertion_pass` | `HIL_QUARANTINE_OVERBROAD` |

## §1 合否

20/20のRed/Green、HAC/HST/failure、required check/fixture count、全attempt、state/receipt digestを保存する。
mockの`success`、check名の存在、minimum gateだけ、repush plan/push receiptだけでは合格にしない。処理量削減はcanonical
`HIL_CI_REQUIRED_CHECK_MISSING`とlocal `HIL_CI_WORKLOAD_REDUCTION_FORBIDDEN`の両方をassertする。

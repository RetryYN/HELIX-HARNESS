---
title: "HELIX L9 結合テスト設計 — three-stage CI quarantine"
layer: L5
executed_at_layer: L8
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
pair_artifact: docs/design/helix/L5-detail/three-stage-ci-quarantine.md
next_pair_freeze: L5
requirements:
  - HR-FR-HIL-06
  - HAC-HIL-06a
  - HAC-HIL-06b
  - HAC-HIL-06c
source_capabilities:
  - HU-CAP-006
---

# HELIX L9 結合テスト設計 — three-stage CI quarantine

## §0 共通oracle

全caseは固定Git graph、Reverse候補tree、Forward join fixture、source/pack check profile、fake GitHub delivery、Node trusted clock、
isolated DBを使い、外部GitHub APIへ接続しない。`HU-CAP-006`をbase commit/tree
`e506a67e9c243cc9781ff4a6d8d1870b072fd37b`／`2f0eda9a0ec69213a0a91ea9b1d3030d14f0c720`、source commit/tree
`9bcdbe5af48345af13485c1d098390cd4de935bc`／`188b01f01db15b17c690bdd28b59ca7d3f493ad8`、11-entry set digest
`af66836b3277f6d5476fa47b80ddb70b0eec444446fc44918a66cb85226d68e8`、unique delta digest
`ef3770ec2c8dcf8e4dd961b4e55d109a19fed51831d7a31eb0af5ed43ee0b33a`、L5 §1の11 blob/span/dispositionへbindする。
`PLAN-L7-221`はmain既存fixtureとして別枠にし、branch delta件数へ算入しない。

各caseはchain/stage/attempt、SHA/tree/check-set/input-scope、predecessor/join/delivery、command/exit、artifact/output/event digest、
quarantine rule/application/minimum gate、self-heal routeを保存する。retry/quarantineでも全required checkとfixtureを実行し、
raw provider log、secret、credential、PIIをmemory/evidence本文へ保存しない。全caseは未実装である。

| ID | 結合scenario | 期待結果 | HAC | exact state pair | exact HST disposition | test citation |
|---|---|---|---|---|---|---|
| `IT-CIQ-001` | `implemented`のReverse候補でprejoin全checkを実行し、Forward join後SHAでpostjoin、同じPR head/treeでexternal全checkを実行 | 中間assertで`implemented -> prejoin_accepted`とSHA/tree/check-set bind済みpassed receiptを確認してからjoinする。ordinal 1→2→3、各receiptが直前receiptとSHA/tree変換へbindし`external_accepted`。quarantine green count 0 | `HAC-HIL-06a` | `HST-CASE-003-01`: `implemented -> prejoin_accepted` | `HST-CASE-003-01` → `なし（正常系）` | `tests/three-stage-ci-lineage.integration.test.ts` |
| `IT-CIQ-002` | prejoin required checkを一件failさせ、self-heal候補packetも生成 | Forward join/postjoin/PR作成各0、全check結果とfailure packetを保持 | `HAC-HIL-06b` | `HST-CASE-003-02`: `implemented -> failed` | `HST-CASE-003-02` → `HIL_CI_PREJOIN_FAILED` | `tests/three-stage-ci-failure.integration.test.ts` |
| `IT-CIQ-003` | prejoin passとForward join後にpostjoin required checkを一件fail | PR作成/external run 0。postjoinの全workload、failure fingerprint、retry routeを保存 | `HAC-HIL-06b` | `HST-CASE-003-03`: `postjoin_running -> failed` | `HST-CASE-003-03` → `HIL_CI_POSTJOIN_FAILED` | `tests/three-stage-ci-failure.integration.test.ts` |
| `IT-CIQ-004` | postjoin済みPR headでexternal required checkを一件fail | merge 0、auto-merge待機、provider delivery/check suite/failure artifactを同headへbind | `HAC-HIL-06b` | `HST-CASE-003-04`: `external_running -> failed` | `HST-CASE-003-04` → `HIL_CI_EXTERNAL_FAILED` | `tests/github-external-ci.integration.test.ts` |
| `IT-CIQ-005` | predecessor欠落、external先行、別順序三段fixtureを個別投入 | stage run 0。順序違反をcase別tokenで記録し、正順fixtureだけ次段可 | `HAC-HIL-06b` | `HST-CASE-003-05`: `created -> created`; `HST-CASE-003-11`: `assertion_input_ready -> assertion_pass`; `HST-CASE-003-12`: `assertion_input_ready -> assertion_pass` | `HST-CASE-003-05` → `HIL_CI_STAGE_BYPASS`; `HST-CASE-003-11` → `HIL_CI_STAGE_BYPASS`; `HST-CASE-003-12` → `HIL_CI_STAGE_LINEAGE_INVALID` | `tests/three-stage-ci-lineage.integration.test.ts` |
| `IT-CIQ-006` | 別chain SHA、同SHA異tree、predecessor未bind/quarantine-only receiptを個別投入 | receipt再利用と次stageを0にし、SHA/tree/predecessorのどのjoinが壊れたかを分離 | `HAC-HIL-06b` | `HST-CASE-003-06`: `prejoin_accepted -> prejoin_accepted`; `HST-CASE-003-07`: `prejoin_accepted -> prejoin_accepted`; `HST-CASE-003-13`: `assertion_input_ready -> assertion_pass` | `HST-CASE-003-06` → `HIL_CI_LINEAGE_MISMATCH`; `HST-CASE-003-07` → `HIL_CI_TREE_DIGEST_MISMATCH`; `HST-CASE-003-13` → `HIL_CI_RECEIPT_LINEAGE_INVALID` | `tests/three-stage-ci-lineage.integration.test.ts` |
| `IT-CIQ-007` | required checkを一件未提出にし、別fixtureでneutral/skipped/unknown conclusionを返す | passed receipt 0、未実行check一覧を保持。quarantine/retryによるcheck-set・fixture削減も同じ境界で拒否 | `HAC-HIL-06b` | `HST-CASE-003-08`: `external_running -> failed`; `HST-CASE-003-10`: `external_running -> failed` | `HST-CASE-003-08` → `HIL_CI_REQUIRED_CHECK_MISSING`; `HST-CASE-003-10` → `HIL_CI_CONCLUSION_NOT_GREEN` | `tests/ci-required-workload.integration.test.ts` |
| `IT-CIQ-008` | external green後にPR headをforce-push相当fixtureで変更 | 旧external/merge eligibilityをstale化し、新SHA/treeはprejoinから新chainを開始 | `HAC-HIL-06b` | `HST-CASE-003-09`: `external_accepted -> stale` | `HST-CASE-003-09` → `HIL_CI_SHA_STALE` | `tests/github-external-ci.integration.test.ts` |
| `IT-CIQ-009` | exact check/fingerprint/baseline/tree、typed scope kind/ID、reason/evidence、source/pack、check profile、approval、owner、期限、Issue、minimum gateを持つ既知failureへruleを適用し、各必須fieldの空・scope重複反例も投入 | 元workload完走＋minimum gate追加実行後、applicationはcanonical `failed -> quarantined`。chain stageだけ`accepted_with_quarantine`、passed/green countは増えない。空／重複ruleはactive/application 0 | `HAC-HIL-06c` | `HST-CASE-022-01`: `failed -> quarantined` | `HST-CASE-022-01` → `なし（正常系）` | `tests/ci-quarantine.integration.test.ts` |
| `IT-CIQ-010` | observed fingerprint差と、既知failureに新fingerprintを混ぜた結果を個別評価 | application 0、stage failed。既知failureだけを選んで残りを無視しない | `HAC-HIL-06c` | `HST-CASE-022-02`: `failed -> failed`; `HST-CASE-022-08`: `assertion_input_ready -> assertion_pass` | `HST-CASE-022-02` → `HIL_QUARANTINE_FINGERPRINT_MISMATCH`; `HST-CASE-022-08` → `HIL_CI_QUARANTINE_INVALID` | `tests/ci-quarantine.integration.test.ts` |
| `IT-CIQ-011` | Node trusted clockで期限切れ、check/profile/baseline/scope差を個別評価 | application 0、旧application stale、通常failureとremediation routeを保持 | `HAC-HIL-06c` | `HST-CASE-022-03`: `failed -> failed`; `HST-CASE-022-09`: `assertion_input_ready -> assertion_pass` | `HST-CASE-022-03` → `HIL_QUARANTINE_EXPIRED`; `HST-CASE-022-09` → `HIL_QUARANTINE_SCOPE_INVALID` | `tests/ci-quarantine.integration.test.ts` |
| `IT-CIQ-012` | minimum gate欠落/非greenとremediation Issue/owner欠落を個別投入 | active rule 0またはapplication 0、後続stage/merge 0 | `HAC-HIL-06c` | `HST-CASE-022-04`: `failed -> failed`; `HST-CASE-022-06`: `proposed -> proposed` | `HST-CASE-022-04` → `HIL_QUARANTINE_MINIMUM_GATE_MISSING`; `HST-CASE-022-06` → `HIL_QUARANTINE_REMEDIATION_MISSING` | `tests/ci-quarantine-policy.integration.test.ts` |
| `IT-CIQ-013` | wildcard、directory単位、全check、無期限ruleを登録し、対象変更後に再利用 | rule active化/application各0、変更前receipt stale | `HAC-HIL-06c` | `HST-CASE-022-05`: `proposed -> proposed`; `HST-CASE-022-10`: `assertion_input_ready -> assertion_pass` | `HST-CASE-022-05` → `HIL_QUARANTINE_WILDCARD_FORBIDDEN`; `HST-CASE-022-10` → `HIL_QUARANTINE_OVERBROAD` | `tests/ci-quarantine-policy.integration.test.ts` |
| `IT-CIQ-014` | 同tree transient retry、修正repush、新failure、低confidence、security failure、iteration上限をmatrix実行し、prior attempt/rerequest/full workload/log/root-cause/diff/green/push/PR head/new-chain三段receiptを一件ずつ欠落させる | 同tree retryは新attemptで全workload。新SHA repush Resultは全証拠を持ち旧chain stale、新chainをprejoin→postjoin→externalまで完走した場合だけ成功。任一欠落、旧head、同chain再利用、三段未完でmerge 0。上限後はIssueへ送りsilent retry 0 | `HAC-HIL-06b`, `HAC-HIL-06c` | `HST-CASE-022-07`: `exhausted -> failed` | `HST-CASE-022-07` → `HIL_QUARANTINE_EXHAUSTED` | `tests/ci-self-heal-retry.integration.test.ts` |

| `IT-CIQ-015` | stage完了、quarantine application、self-heal outcome、rule create/update/expireのrow/check/event/projection/receipt/lineage各appendへfaultを注入し、同operation同digest／異digest、stale event/projection/rule headを再送 | fault/CAS conflictは当該transaction全write 0。同operation同digestはreceipt一件、異digestはconflict。expiryはevent/receiptとして永続化され、reconcile後もrequired workload数、lineage、rule revision、application/outcome digestが一致 | `HAC-HIL-06a`, `HAC-HIL-06b`, `HAC-HIL-06c` | supporting transaction oracle | supporting | `tests/ci-mutation-transaction.integration.test.ts` |

## §1 HST量閉じと合否

### 補助API→U→IT exact join

`IT-CIQ-015`は`U-CIQ-021`,`U-CIQ-022`,`U-CIQ-023`をexact joinし、bundle build、atomic commit、immutable reconcileのfault位置を別々に採点する。

| public API | L7 oracle | L8 oracle |
|---|---|---|
| `parseCiSourceCapabilityBinding` | `U-CIQ-001` | `IT-CIQ-001` |
| `buildCiRequiredCheckProfile` | `U-CIQ-002` | `IT-CIQ-007` |
| `createThreeStageCiChain` | `U-CIQ-003` | `IT-CIQ-001` |
| `planReversePrejoinStage` | `U-CIQ-004` | `IT-CIQ-002` |
| `validateForwardJoinReceipt` | `U-CIQ-005` | `IT-CIQ-005` |
| `planForwardPostjoinStage` | `U-CIQ-006` | `IT-CIQ-003` |
| `parseGithubExternalDelivery` | `U-CIQ-007` | `IT-CIQ-008` |
| `planGithubExternalStage` | `U-CIQ-008` | `IT-CIQ-004` |
| `validateCiStageOrder` | `U-CIQ-009` | `IT-CIQ-005` |
| `validateCiStageLineage` | `U-CIQ-010` | `IT-CIQ-006` |
| `aggregateCiCheckResults` | `U-CIQ-011` | `IT-CIQ-007` |
| `invalidateCiChainForHeadChange` | `U-CIQ-012` | `IT-CIQ-008` |
| `deriveCiFailureFingerprint` | `U-CIQ-013` | `IT-CIQ-010` |
| `parseCiQuarantineRule` | `U-CIQ-014` | `IT-CIQ-012`, `IT-CIQ-013` |
| `evaluateCiQuarantineApplication` | `U-CIQ-015` | `IT-CIQ-009`, `IT-CIQ-010`, `IT-CIQ-011` |
| `validateCiMinimumGate` | `U-CIQ-016` | `IT-CIQ-012` |
| `evaluateCiQuarantineExpiry` | `U-CIQ-017` | `IT-CIQ-011` |
| `planCiSelfHealRoute` | `U-CIQ-018` | `IT-CIQ-014` |
| `recordCiRecoveryAttemptResult` | `U-CIQ-019` | `IT-CIQ-014` |
| `finalizeCiMergeEligibility` | `U-CIQ-020` | `IT-CIQ-006`, `IT-CIQ-009` |
| `buildCiMutationCommitBundle` | `U-CIQ-021` | `IT-CIQ-015` |
| `commitCiMutationBundle` | `U-CIQ-022` | `IT-CIQ-015` |
| `reconcileCiMutationCommit` | `U-CIQ-023` | `IT-CIQ-015` |

この表はL6 public API 23件を各一回だけ結線する。canonical HST 23件、primary IT 14件、supporting IT 1件、failure tokenと処理量分母は既存表から変更しない。

上表は`HST-CASE-003-01`、`HST-CASE-003-02`、`HST-CASE-003-03`、`HST-CASE-003-04`、
`HST-CASE-003-05`、`HST-CASE-003-06`、`HST-CASE-003-07`、`HST-CASE-003-08`、
`HST-CASE-003-09`、`HST-CASE-003-10`、`HST-CASE-003-11`、`HST-CASE-003-12`、
`HST-CASE-003-13`、`HST-CASE-022-01`、`HST-CASE-022-02`、`HST-CASE-022-03`、
`HST-CASE-022-04`、`HST-CASE-022-05`、`HST-CASE-022-06`、`HST-CASE-022-07`、
`HST-CASE-022-08`、`HST-CASE-022-09`、`HST-CASE-022-10`の23/23を各一回bindする。

14/14、canonical failure一致、全workloadの実行件数、三段lineage、self-heal全attempt、quarantine application、
authoritative write count、別runtime reviewが揃うまでgreenにしない。GitHub表示、check一件、raw log、再push、minimum gateだけで代替しない。

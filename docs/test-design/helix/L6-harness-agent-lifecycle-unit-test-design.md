---
title: "HELIX L7 単体テスト設計 — harness agent lifecycle"
layer: L6
executed_at_layer: L7
artifact_type: test_design
status: draft
created: 2026-07-15
updated: 2026-07-15
owner: QA / TL
plan: PLAN-L1-07-infinity-loop-platform-requirements
design_slice: HDS-HIL-08
related_hst:
  - HST-HIL-006
related_l3: docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md
related_l4: docs/design/helix/L4-basic-design/infinity-loop-platform-basic-design.md
pair_artifact: docs/design/helix/L6-function-design/harness-agent-lifecycle.md
next_pair_freeze: L6
requirements:
  - HR-FR-HIL-08
  - HAC-HIL-08a
  - HAC-HIL-08b
  - HAC-HIL-08c
---

# HELIX L7 単体テスト設計 — harness agent lifecycle

各U oracleはL5 §9.1のatomic `case_id/pre_state/expected_state/canonical_failure`をcaseごとに入力し、failure tokenとは独立にpre→expected stateをexact assertする。複数case関数でもtupleを個別実行し、`HST-CASE-006-22`はfence複合責務の一tupleだけを参照する。

| ID | exact function | 反例と期待結果 | HAC | HST exact case | canonical failure | test参照先 |
|---|---|---|---|---|---|---|
| `U-AGLC-001` | `parseHarnessAgentContract` | 必須field/schema/version/capability/policy/digest欠落、unknown field、同ID/version異digestを拒否 | `HAC-HIL-08b` | `HST-CASE-006-17` | `HIL_AGENT_CONTRACT_INCOMPLETE` | `tests/agent-contract-registry.test.ts` |
| `U-AGLC-002` | `resolveAgentContractSupersession` | retired reclaimとapprovalなしquarantine復帰を拒否し、承認済み新revisionだけ通す | `HAC-HIL-08c` | `HST-CASE-006-11`, `HST-CASE-006-12` | `HIL_AGENT_RETIRED_RECLAIM`; `HIL_AGENT_QUARANTINE_RELEASE_UNAUTHORIZED` | `tests/agent-contract-registry.test.ts` |
| `U-AGLC-003` | `regenerateAndCompareAgentRuntimeProjection` | 入力順逆転・削除後再生成はexpected receiptと同一。candidateを一byte／target順／generator version別にmutateするとResult failure、publish/execution 0 | `HAC-HIL-08a` | `HST-CASE-006-02`, `HST-CASE-006-21` | `なし（正常系）`; `HIL_AGENT_REGISTRY_NOT_REGENERABLE` | `tests/agent-runtime-projection.test.ts` |
| `U-AGLC-004` | `detectAgentRuntimeProjectionDrift` | 手編集、marker欠落、余剰、source digest差を全件検出しmanual内容を逆輸入しない | `HAC-HIL-08b` | `HST-CASE-006-18` | `HIL_AGENT_ADAPTER_DRIFT` | `tests/agent-runtime-projection.test.ts` |
| `U-AGLC-005` | `classifyAgentEligibility` | status/layer/drive/kind/pattern/capability/role/compatibilityを一つずつ外しeligible 0 | `HAC-HIL-08b` | `HST-CASE-006-14` | `HIL_AGENT_MUSTER_NO_ELIGIBLE` | `tests/agent-muster.test.ts` |
| `U-AGLC-006` | `resolveAgentVerificationPatterns` | unknown task kind/preset、task kind→agent直引き入力を拒否 | `HAC-HIL-08a` | `HST-CASE-006-19` | `HIL_MUSTER_RESOLUTION_INVALID` | `tests/agent-muster.test.ts` |
| `U-AGLC-007` | `compareAgentMusterRerun` | 同じnormalized inputでmember順、member ID、context digest、team digestを各mutateし、全てResult failureかつready/lease/execution 0 | `HAC-HIL-08a` | `HST-CASE-006-15` | `HIL_AGENT_MUSTER_NONDETERMINISTIC` | `tests/agent-muster.test.ts` |
| `U-AGLC-008` | `resolveDeterministicAgentMuster` | 候補列挙順の全順列でstable rankを維持し、候補0・二段解決違反・self verifyでready 0 | `HAC-HIL-08a`, `HAC-HIL-08b` | `HST-CASE-006-14`, `HST-CASE-006-19` | `HIL_AGENT_MUSTER_NO_ELIGIBLE`; `HIL_MUSTER_RESOLUTION_INVALID` | `tests/agent-muster.test.ts` |
| `U-AGLC-009` | `buildBlindAgentPacket` | author claim、chat自己評価、worker reasoningを個別混入し起動packet生成0 | `HAC-HIL-08b` | `HST-CASE-006-03` | `HIL_AGENT_BLIND_CONTEXT_LEAK` | `tests/agent-blind-packet.test.ts` |
| `U-AGLC-010` | `enforceAgentRoleSeparation` | 同instance/role/provider/model familyとCodex self approvalを拒否 | `HAC-HIL-08b` | `HST-CASE-006-10`, `HST-CASE-006-20` | `HIL_AGENT_VERIFIER_NOT_INDEPENDENT`; `HIL_ROLE_SEPARATION_VIOLATION` | `tests/agent-verification.test.ts` |
| `U-AGLC-011` | `createAgentLifecycleInstance` | 同一member/contract/task/attemptから同一identityとmustered seedを生成 | `HAC-HIL-08a` | `HST-CASE-006-01` | `なし（正常系）` | `tests/agent-lifecycle.test.ts` |
| `U-AGLC-012` | `validateAgentLifecycleTransition` | failed→verified、verification_pending→released、retired→leased等を拒否し合法graphだけ通す | `HAC-HIL-08b` | `HST-CASE-006-08`, `HST-CASE-006-16` | `HIL_AGENT_STATE_TRANSITION_INVALID`; `HIL_AGENT_LIFECYCLE_INVALID` | `tests/agent-lifecycle.test.ts` |
| `U-AGLC-013` | `appendAgentLifecycleEvent` | sequence gap、重複operation、previous digest mismatchでappend/projection 0 | `HAC-HIL-08a`, `HAC-HIL-08c` | `HST-CASE-006-13` | `HIL_AGENT_EVENT_SEQUENCE_INVALID` | `tests/agent-lifecycle-events.test.ts` |
| `U-AGLC-014` | `acquireAgentLease` | lease row→instance fence/state→event→projection→receiptの各faultで全増分0。2 owner同時CASはwinner 1、loser全write 0、同operation再送増分0、fence非単調を拒否 | `HAC-HIL-08b` | `HST-CASE-006-04` | `HIL_AGENT_LEASE_ALREADY_ACTIVE` | `tests/agent-lease.test.ts` |
| `U-AGLC-015` | `evaluateAgentLeaseLiveness` | expiry境界直前/同値/超過とowner/fence mismatchを判定し超過操作0 | `HAC-HIL-08b` | `HST-CASE-006-05` | `HIL_AGENT_LEASE_EXPIRED` | `tests/agent-lease.test.ts` |
| `U-AGLC-016` | `fenceAgentOperation` | reassign後の旧tool/checkpoint/artifact/completion/resumeを全て拒否 | `HAC-HIL-08b`, `HAC-HIL-08c` | `HST-CASE-006-06`, `HST-CASE-006-22` | `HIL_AGENT_FENCING_REJECTED`; `HIL_AGENT_FENCING_VIOLATION` | `tests/agent-fencing.test.ts` |
| `U-AGLC-017` | `sealDurableAgentCheckpoint` | schema/context/state/artifact digest欠落、sequence/fence不一致をinvalidにする | `HAC-HIL-08c` | `HST-CASE-006-07` | `HIL_AGENT_CHECKPOINT_INVALID` | `tests/agent-checkpoint.test.ts` |
| `U-AGLC-018` | `resolveAgentResumeCheckpoint` | staged/破損/旧fence/別inputを除外しcurrent fenceの最大durableだけ選ぶ | `HAC-HIL-08c` | `HST-CASE-006-07`, `HST-CASE-006-22` | `HIL_AGENT_CHECKPOINT_INVALID`; `HIL_AGENT_FENCING_VIOLATION` | `tests/agent-checkpoint.test.ts` |
| `U-AGLC-019` | `acceptAgentResultArtifact` | absolute/traversal path、digest欠落、旧fence、completion前acceptedを拒否 | `HAC-HIL-08b` | `HST-CASE-006-06` | `HIL_AGENT_FENCING_REJECTED` | `tests/agent-result-artifact.test.ts` |
| `U-AGLC-020` | `evaluateAgentVerificationReceipt` | oracle/input/result/evidence mismatch、same provider、self verify、stale receiptを採用0 | `HAC-HIL-08b` | `HST-CASE-006-10`, `HST-CASE-006-20` | `HIL_AGENT_VERIFIER_NOT_INDEPENDENT`; `HIL_ROLE_SEPARATION_VIOLATION` | `tests/agent-verification.test.ts` |
| `U-AGLC-021` | `releaseVerifiedAgentInstance` | receiptなし、fail/inconclusive/stale/revoked、別result receiptでrelease 0 | `HAC-HIL-08b` | `HST-CASE-006-09` | `HIL_AGENT_RELEASE_UNVERIFIED` | `tests/agent-verification.test.ts` |
| `U-AGLC-022` | `planAgentQuarantineOrRetirement` | 同version quarantine復帰、retired reclaim、illegal lifecycle順を拒否しsuperseding eventだけ生成 | `HAC-HIL-08c` | `HST-CASE-006-11`, `HST-CASE-006-12`, `HST-CASE-006-16` | `HIL_AGENT_RETIRED_RECLAIM`; `HIL_AGENT_QUARANTINE_RELEASE_UNAUTHORIZED`; `HIL_AGENT_LIFECYCLE_INVALID` | `tests/agent-disposition.test.ts` |

| `U-AGLC-023` | `buildAgentLifecycleCommitBundle` | mutation別record、current lease/fence、expected event/projection/checkpoint/result heads欠落を拒否し、専用bundleでないlease acquisition混載を拒否 | `HAC-HIL-08b`, `HAC-HIL-08c` | supporting | `tests/agent-lifecycle-transaction.test.ts` |
| `U-AGLC-024` | `commitAgentLifecycleMutation` | 各append faultで全write 0。同operation同digest一件、異digest/stale head/旧fence conflict | `HAC-HIL-08b`, `HAC-HIL-08c` | supporting | `tests/agent-lifecycle-transaction.test.ts` |
| `U-AGLC-025` | `reconcileAgentLifecycleMutation` | immutable evidence一致時だけprojection/record/receiptを復元し、新lease/fence/pass/release/retireを推測しない | `HAC-HIL-08c` | supporting | `tests/agent-lifecycle-reconcile.test.ts` |

## §1 合否

### supporting transactionのL8 exact join

`U-AGLC-023/024/025`は`IT-AGLC-015`へexact joinする。`AgentLifecycleImmutableEvidenceV1`のinstance/lease/fence/head差替えはwrite 0、muster member順は`AgentMusterMemberV1`、rebuild結果は`ProjectionDigestV1`で比較する。

`U-AGLC-001`から`U-AGLC-022`の22件すべてでRed/Green、exact HAC/HST/canonical failure、result/state/event/team/context/
adapter/checkpoint/receipt digest、lease/fence、authoritative増分を保存する。正常caseは`なし（正常系）`を保ち、failure tokenを
作らない。pure testは外部runtimeやnetworkを起動せず、clock、ID、port resultをfixture注入する。

## atomic state tuple台帳

各caseを正本stateとU oracleへ一対一で結線する。

| HST case識別子 | `pre_state` | `expected_state` | 正本failure | U結線 |
|---|---|---|---|---|
| `HST-CASE-006-01` | `mustered` | `verified` | `なし（正常系）` | `U-AGLC-011` |
| `HST-CASE-006-02` | `adapter_missing` | `adapter_current` | `なし（正常系）` | `U-AGLC-003` |
| `HST-CASE-006-03` | `selected` | `selected` | `HIL_AGENT_BLIND_CONTEXT_LEAK` | `U-AGLC-009` |
| `HST-CASE-006-04` | `mustered` | `leased` | `HIL_AGENT_LEASE_ALREADY_ACTIVE` | `U-AGLC-014` |
| `HST-CASE-006-05` | `running` | `running` | `HIL_AGENT_LEASE_EXPIRED` | `U-AGLC-015` |
| `HST-CASE-006-06` | `running` | `running` | `HIL_AGENT_FENCING_REJECTED` | `U-AGLC-016`, `U-AGLC-019` |
| `HST-CASE-006-07` | `failed` | `failed` | `HIL_AGENT_CHECKPOINT_INVALID` | `U-AGLC-017`, `U-AGLC-018` |
| `HST-CASE-006-08` | `failed` | `failed` | `HIL_AGENT_STATE_TRANSITION_INVALID` | `U-AGLC-012` |
| `HST-CASE-006-09` | `verification_pending` | `verification_pending` | `HIL_AGENT_RELEASE_UNVERIFIED` | `U-AGLC-021` |
| `HST-CASE-006-10` | `planned` | `planned` | `HIL_AGENT_VERIFIER_NOT_INDEPENDENT` | `U-AGLC-010`, `U-AGLC-020` |
| `HST-CASE-006-11` | `retired` | `retired` | `HIL_AGENT_RETIRED_RECLAIM` | `U-AGLC-002`, `U-AGLC-022` |
| `HST-CASE-006-12` | `quarantined` | `quarantined` | `HIL_AGENT_QUARANTINE_RELEASE_UNAUTHORIZED` | `U-AGLC-002`, `U-AGLC-022` |
| `HST-CASE-006-13` | `running` | `running` | `HIL_AGENT_EVENT_SEQUENCE_INVALID` | `U-AGLC-013` |
| `HST-CASE-006-14` | `planned` | `planned` | `HIL_AGENT_MUSTER_NO_ELIGIBLE` | `U-AGLC-005`, `U-AGLC-008` |
| `HST-CASE-006-15` | `assertion_input_ready` | `assertion_pass` | `HIL_AGENT_MUSTER_NONDETERMINISTIC` | `U-AGLC-007` |
| `HST-CASE-006-16` | `assertion_input_ready` | `assertion_pass` | `HIL_AGENT_LIFECYCLE_INVALID` | `U-AGLC-012`, `U-AGLC-022` |
| `HST-CASE-006-17` | `assertion_input_ready` | `assertion_pass` | `HIL_AGENT_CONTRACT_INCOMPLETE` | `U-AGLC-001` |
| `HST-CASE-006-18` | `assertion_input_ready` | `assertion_pass` | `HIL_AGENT_ADAPTER_DRIFT` | `U-AGLC-004` |
| `HST-CASE-006-19` | `assertion_input_ready` | `assertion_pass` | `HIL_MUSTER_RESOLUTION_INVALID` | `U-AGLC-006`, `U-AGLC-008` |
| `HST-CASE-006-20` | `assertion_input_ready` | `assertion_pass` | `HIL_ROLE_SEPARATION_VIOLATION` | `U-AGLC-010`, `U-AGLC-020` |
| `HST-CASE-006-21` | `assertion_input_ready` | `assertion_pass` | `HIL_AGENT_REGISTRY_NOT_REGENERABLE` | `U-AGLC-003` |
| `HST-CASE-006-22` | `assertion_input_ready` | `assertion_pass` | `HIL_AGENT_FENCING_VIOLATION` | `U-AGLC-016`, `U-AGLC-018` |

---
title: "HELIX L6 機能設計 — harness agent lifecycle"
layer: L6
kind: add-design
status: draft
created: 2026-07-15
updated: 2026-07-15
owner: Codex / TL
plan: PLAN-L1-07-infinity-loop-platform-requirements
design_slice: HDS-HIL-08
related_hst:
  - HST-HIL-006
related_l5: docs/design/helix/L5-detail/harness-agent-lifecycle.md
related_l3: docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md
related_l4: docs/design/helix/L4-basic-design/infinity-loop-platform-basic-design.md
pair_artifact: docs/test-design/helix/L6-harness-agent-lifecycle-unit-test-design.md
next_pair_freeze: L7
requirements:
  - HR-FR-HIL-08
  - HAC-HIL-08a
  - HAC-HIL-08b
  - HAC-HIL-08c
---

# HELIX L6 機能設計 — harness agent lifecycle

## §0 関数境界

pure functionはfilesystem、DB、clock、AI runtimeを直接読まず、registry/policy/task/event/checkpointの明示snapshotを判定する。
adapter生成、lease CAS、event append、checkpoint sealはinjected portだけが副作用を持つ。Claude/Codex adapterは出力であり、
入力正本にしない。既存`agent-ssot-runtime-projection`、team policy、agent slots、job queueを再利用するときも、
L5のfail-close contractを弱める互換shimは作らない。

## §1 public APIとexact oracle

全APIは対応するHST caseの`(case_id, pre_state, expected_state, canonical_failure)`をL5 §9.1のatomic tupleから受け、registry/muster/lease/fence/verify判定前にpre_stateを照合する。成功・拒否ともexpected_stateを返し、state不一致時はlease/event/runtime/receipt増分0とする。

| API | signature | DbC／result | 対応するL7 oracle | HAC | HST exact case | canonical failure |
|---|---|---|---|---|---|---|
| `parseHarnessAgentContract` | `(raw: unknown) => Result<AgentContract, AgentLifecycleFailure>` | strict schema、必須policy/digest、unknown field拒否 | `U-AGLC-001` | `HAC-HIL-08b` | `HST-CASE-006-17` | `HIL_AGENT_CONTRACT_INCOMPLETE` |
| `resolveAgentContractSupersession` | `(current, candidate, approval) => ContractRevisionDecision` | version chain、quarantine supersession、retire不可逆 | `U-AGLC-002` | `HAC-HIL-08c` | `HST-CASE-006-11`, `HST-CASE-006-12` | `HIL_AGENT_RETIRED_RECLAIM`; `HIL_AGENT_QUARANTINE_RELEASE_UNAUTHORIZED` |
| `regenerateAndCompareAgentRuntimeProjection` | `(contracts, runtime, capability, policy, expectedReceipt) => Result<RuntimeProjectionBundle, AgentLifecycleFailure>` | candidateを再生成しexpected input/source/generator/runtime/digestへ全field一致した場合だけ返す | `U-AGLC-003` | `HAC-HIL-08a` | `HST-CASE-006-02`, `HST-CASE-006-21` | `なし（正常系）`; `HIL_AGENT_REGISTRY_NOT_REGENERABLE` |
| `detectAgentRuntimeProjectionDrift` | `(expected, observed) => ProjectionDriftDecision` | missing/modified/extra/marker/source digestを全件分類 | `U-AGLC-004` | `HAC-HIL-08b` | `HST-CASE-006-18` | `HIL_AGENT_ADAPTER_DRIFT` |
| `classifyAgentEligibility` | `(contract, task, policy, availability) => EligibilityDecision` | status/layer/drive/kind/pattern/capability/role/compatibilityをAND評価 | `U-AGLC-005` | `HAC-HIL-08b` | `HST-CASE-006-14` | `HIL_AGENT_MUSTER_NO_ELIGIBLE` |
| `resolveAgentVerificationPatterns` | `(taskKind, presetVersion, taskRisk) => VerificationPatternSet` | task kindからversioned pattern集合だけを解決 | `U-AGLC-006` | `HAC-HIL-08a` | `HST-CASE-006-19` | `HIL_MUSTER_RESOLUTION_INVALID` |
| `compareAgentMusterRerun` | `(expectedReceipt, normalizedInput, candidate) => Result<MusterComparisonReceipt, AgentLifecycleFailure>` | 同一inputのmember順、context、team、registry/policy digestを比較しmutationをfailure化 | `U-AGLC-007` | `HAC-HIL-08a` | `HST-CASE-006-15` | `HIL_AGENT_MUSTER_NONDETERMINISTIC` |
| `resolveDeterministicAgentMuster` | `(task, patterns, eligible, registryDigest) => Result<AgentMuster, AgentLifecycleFailure>` | stable rankを内包し、二段解決、member index、team/context digestを固定 | `U-AGLC-008` | `HAC-HIL-08a`, `HAC-HIL-08b` | `HST-CASE-006-14`, `HST-CASE-006-19` | `HIL_AGENT_MUSTER_NO_ELIGIBLE`; `HIL_MUSTER_RESOLUTION_INVALID` |
| `buildBlindAgentPacket` | `(contract, frozenInputs, authorContext) => Result<BlindPacket, AgentLifecycleFailure>` | allowlist fieldだけ、author claim/reasoning/chat context 0 | `U-AGLC-009` | `HAC-HIL-08b` | `HST-CASE-006-03` | `HIL_AGENT_BLIND_CONTEXT_LEAK` |
| `enforceAgentRoleSeparation` | `(worker, verifier, providerPolicy) => SeparationDecision` | role、instance、provider/model familyを独立化 | `U-AGLC-010` | `HAC-HIL-08b` | `HST-CASE-006-10`, `HST-CASE-006-20` | `HIL_AGENT_VERIFIER_NOT_INDEPENDENT`; `HIL_ROLE_SEPARATION_VIOLATION` |
| `createAgentLifecycleInstance` | `(member, contract, task, attempt) => AgentInstanceSeed` | stable identity、mustered初期state、digest完全性 | `U-AGLC-011` | `HAC-HIL-08a` | `HST-CASE-006-01` | `なし（正常系）` |
| `validateAgentLifecycleTransition` | `(current, next, receiptSet) => TransitionDecision` | 許可graph、terminal、verification prerequisiteを評価 | `U-AGLC-012` | `HAC-HIL-08b` | `HST-CASE-006-08`, `HST-CASE-006-16` | `HIL_AGENT_STATE_TRANSITION_INVALID`; `HIL_AGENT_LIFECYCLE_INVALID` |
| `appendAgentLifecycleEvent` | `(head, operation, transition, fence) => Result<AgentEvent, AgentLifecycleFailure>` | sequence＋1、operation一意、previous/event digest chain | `U-AGLC-013` | `HAC-HIL-08a`, `HAC-HIL-08c` | `HST-CASE-006-13` | `HIL_AGENT_EVENT_SEQUENCE_INVALID` |
| `acquireAgentLease` | `(bundle: AgentLeaseAcquisitionBundleV1, store: AgentLifecycleStore) => Promise<Result<AgentLeaseAcquisitionReceiptV1, AgentLifecycleFailure>>` | lease row、instance fence/state、event、projection、receiptを単一Node transactionでCAS。active最大1、fence単調 | `U-AGLC-014` | `HAC-HIL-08b` | `HST-CASE-006-04` | `HIL_AGENT_LEASE_ALREADY_ACTIVE` |
| `evaluateAgentLeaseLiveness` | `(lease, owner, fence, now) => LeaseLivenessDecision` | owner/fence/heartbeat/expiryを一括判定 | `U-AGLC-015` | `HAC-HIL-08b` | `HST-CASE-006-05` | `HIL_AGENT_LEASE_EXPIRED` |
| `fenceAgentOperation` | `(instance, lease, operationFence, operationKind) => FenceDecision` | tool/checkpoint/artifact/completion/resumeのcurrent fence一致 | `U-AGLC-016` | `HAC-HIL-08b`, `HAC-HIL-08c` | `HST-CASE-006-06`, `HST-CASE-006-22` | `HIL_AGENT_FENCING_REJECTED`; `HIL_AGENT_FENCING_VIOLATION` |
| `sealDurableAgentCheckpoint` | `(instance, lease, payload, artifactManifest) => Result<AgentCheckpoint, AgentLifecycleFailure>` | schema/context/state/artifact digestとsequence/fenceをseal | `U-AGLC-017` | `HAC-HIL-08c` | `HST-CASE-006-07` | `HIL_AGENT_CHECKPOINT_INVALID` |
| `resolveAgentResumeCheckpoint` | `(instance, lease, checkpoints, currentInput) => ResumeDecision` | current fenceの最大durableだけを選択、driftは新instance | `U-AGLC-018` | `HAC-HIL-08c` | `HST-CASE-006-07`, `HST-CASE-006-22` | `HIL_AGENT_CHECKPOINT_INVALID`; `HIL_AGENT_FENCING_VIOLATION` |
| `acceptAgentResultArtifact` | `(instance, lease, artifact) => ResultArtifactDecision` | relative path/digest/fence、staged→accepted、旧fence 0 | `U-AGLC-019` | `HAC-HIL-08b` | `HST-CASE-006-06` | `HIL_AGENT_FENCING_REJECTED` |
| `evaluateAgentVerificationReceipt` | `(worker, verifier, result, receipt) => VerificationDecision` | oracle/input/result/evidence binding、独立性、pass validity | `U-AGLC-020` | `HAC-HIL-08b` | `HST-CASE-006-10`, `HST-CASE-006-20` | `HIL_AGENT_VERIFIER_NOT_INDEPENDENT`; `HIL_ROLE_SEPARATION_VIOLATION` |
| `releaseVerifiedAgentInstance` | `(instance, lease, receipts) => ReleaseDecision` | current resultへのvalid pass receipt必須 | `U-AGLC-021` | `HAC-HIL-08b` | `HST-CASE-006-09` | `HIL_AGENT_RELEASE_UNVERIFIED` |
| `planAgentQuarantineOrRetirement` | `(contract, instance, action, approval) => LifecycleDispositionPlan` | quarantineは新revision、retire不可逆、履歴保持 | `U-AGLC-022` | `HAC-HIL-08c` | `HST-CASE-006-11`, `HST-CASE-006-12`, `HST-CASE-006-16` | `HIL_AGENT_RETIRED_RECLAIM`; `HIL_AGENT_QUARANTINE_RELEASE_UNAUTHORIZED`; `HIL_AGENT_LIFECYCLE_INVALID` |
| `buildAgentLifecycleCommitBundle` | `(mutation, current, lease, operation) => Result<AgentLifecycleCommitBundleV1, AgentLifecycleFailure>` | lease取得後のmutation write set、current fence、expected headsを正規化。lease acquisition payloadの混載を拒否 | `U-AGLC-023` | `HAC-HIL-08b`, `HAC-HIL-08c` | supporting | `HIL_AGENT_TRANSACTION_CONFLICT` |
| `commitAgentLifecycleMutation` | `(bundle, store) => Promise<Result<AgentLifecycleCommitReceiptV1, AgentLifecycleFailure>>` | event/projectionとcheckpoint/result/verify/release/dispositionを単一Node transactionでCAS/fence commit | `U-AGLC-024` | `HAC-HIL-08b`, `HAC-HIL-08c` | supporting | `HIL_AGENT_TRANSACTION_CONFLICT` |
| `reconcileAgentLifecycleMutation` | `(operationId, immutableEvidence, store) => Promise<Result<AgentLifecycleCommitReceiptV1, AgentLifecycleFailure>>` | immutable evidenceからのみprojection/recordを復元 | `U-AGLC-025` | `HAC-HIL-08c` | supporting | `HIL_AGENT_TRANSACTION_RECONCILE_FAILED` |

## §2 schema

```ts
interface AgentMusterV1 {
  schema_version: "helix-agent-muster.v1";
  muster_id: string;
  operation_id: string;
  idempotency_key: string;
  plan_or_issue_id: string;
  task_identity_digest: string;
  layer: string;
  drive: string;
  task_kind: string;
  verification_patterns: string[];
  registry_snapshot_digest: string;
  policy_snapshot_digest: string;
  members: AgentMusterMemberV1[];
  team_digest: string;
}

interface AgentProjectionExpectationV1 {
  schema_version: "helix-agent-projection-expectation.v1";
  normalized_input_digest: string;
  source_digest: string;
  generator_version: string;
  runtime: string;
  target_set_digest: string;
  expected_projection_digest: string;
}

interface AgentMusterExpectationV1 {
  schema_version: "helix-agent-muster-expectation.v1";
  normalized_input_digest: string;
  registry_snapshot_digest: string;
  policy_snapshot_digest: string;
  verification_pattern_digest: string;
  member_set_digest: string;
  context_set_digest: string;
  expected_team_digest: string;
}

interface AgentLeaseV1 {
  schema_version: "helix-agent-lease.v1";
  lease_id: string;
  instance_id: string;
  owner_session_id: string;
  owner_run_id: string;
  fence_token: string;
  acquired_at: string;
  heartbeat_at: string;
  expires_at: string;
  state: "active" | "released" | "expired" | "revoked";
}

interface AgentVerificationReceiptV1 {
  schema_version: "helix-agent-verification-receipt.v1";
  worker_instance_id: string;
  verifier_instance_id: string;
  worker_provider_family: string;
  verifier_provider_family: string;
  oracle_id: string;
  input_digest: string;
  result_digest: string;
  evidence_digest: string;
  decision: "pass" | "fail" | "inconclusive";
  state: "valid" | "stale" | "revoked";
}
```

identity/team/projection digestへclock、session/runの偶発値、filesystem順を混入させない。lease/event/checkpointでは時刻とownerを
証拠として保持するが、contractやmusterの決定性を変えない。fence tokenはopaqueかつinstance内で単調である。

```ts
interface AgentLifecycleCommitBundleV1 {
  operation_id: string;
  payload_digest: string;
  mutation_kind: "checkpoint" | "result" | "verify" | "release" | "quarantine" | "retire";
  instance_id: string;
  lease_id: string;
  fence: number;
  expected_event_head: string;
  expected_projection_head: string;
  expected_checkpoint_head: string | null;
  expected_result_head: string | null;
  transition_event_digest: string;
  projection_digest: string;
  mutation_record_digest: string;
}

interface AgentLeaseAcquisitionBundleV1 {
  operation_id: string;
  payload_digest: string;
  instance_id: string;
  owner_id: string;
  expected_instance_revision: number;
  expected_event_head: string;
  expected_projection_head: string;
  expected_lease_head: string | null;
  next_fence: number;
  lease_row_digest: string;
  instance_state_fence_digest: string;
  transition_event_digest: string;
  projection_digest: string;
  receipt_digest: string;
}

interface AgentLifecycleCommitReceiptV1 {
  operation_id: string;
  payload_digest: string;
  mutation_kind: AgentLifecycleCommitBundleV1["mutation_kind"] | "lease_acquisition";
  instance_id: string;
  fence: number;
  before_event_head: string;
  after_event_head: string;
  before_projection_head: string;
  after_projection_head: string;
  write_set_digest: string;
  row_count_digest: string;
}

interface AgentLeaseAcquisitionReceiptV1 extends AgentLifecycleCommitReceiptV1 { mutation_kind: "lease_acquisition" }

interface AgentLifecycleStore {
  commitLeaseAcquisition(bundle: AgentLeaseAcquisitionBundleV1): Promise<Result<AgentLeaseAcquisitionReceiptV1, AgentLifecycleFailure>>;
  commit(bundle: AgentLifecycleCommitBundleV1): Promise<Result<AgentLifecycleCommitReceiptV1, AgentLifecycleFailure>>;
  readOperation(operationId: string): Promise<AgentLifecycleCommitReceiptV1 | null>;
  readInstanceRevision(instanceId: string): Promise<number>;
  readLeaseHead(instanceId: string): Promise<string | null>;
  readEventHead(instanceId: string): Promise<string>;
  readProjectionHead(instanceId: string): Promise<string>;
  reconcile(operationId: string, evidence: AgentLifecycleImmutableEvidence): Promise<Result<AgentLifecycleCommitReceiptV1, AgentLifecycleFailure>>;
  rebuildProjection(instanceId: string): Promise<ProjectionDigest>;
}

type AgentLifecycleFailure = {
  code: "HIL_AGENT_ADAPTER_DRIFT" | "HIL_AGENT_BLIND_CONTEXT_LEAK" | "HIL_AGENT_CHECKPOINT_INVALID" | "HIL_AGENT_CONTRACT_INCOMPLETE" | "HIL_AGENT_EVENT_SEQUENCE_INVALID" | "HIL_AGENT_FENCING_REJECTED" | "HIL_AGENT_FENCING_VIOLATION" | "HIL_AGENT_LEASE_ALREADY_ACTIVE" | "HIL_AGENT_LEASE_EXPIRED" | "HIL_AGENT_LIFECYCLE_INVALID" | "HIL_AGENT_MUSTER_NONDETERMINISTIC" | "HIL_AGENT_MUSTER_NO_ELIGIBLE" | "HIL_AGENT_QUARANTINE_RELEASE_UNAUTHORIZED" | "HIL_AGENT_REGISTRY_NOT_REGENERABLE" | "HIL_AGENT_RELEASE_UNVERIFIED" | "HIL_AGENT_RETIRED_RECLAIM" | "HIL_AGENT_STATE_TRANSITION_INVALID" | "HIL_AGENT_TRANSACTION_CONFLICT" | "HIL_AGENT_TRANSACTION_RECONCILE_FAILED" | "HIL_AGENT_VERIFIER_NOT_INDEPENDENT" | "HIL_MUSTER_RESOLUTION_INVALID" | "HIL_ROLE_SEPARATION_VIOLATION";
  evidence_digest: string;
  operation_id?: string;
};
```

## §3 不変条件とidempotency

1. 同じregistry/policy/task inputから`team_digest`とruntime projection digestは同一。expected receipt不一致時はResult failureかつexecution 0。
2. task kindからagentを直接選ばず、必ずverification patternを経由する。
3. registryにないruntime agentのexecution countは0。
4. instanceごとのactive leaseは最大1、fenceは再assignごとに単調増加。
5. heartbeat/checkpoint/artifact/completion/resumeはcurrent active lease/fenceがなければauthoritative増分0。
6. resumeは最大`durable` checkpointだけ。`staged/invalid/superseded`を選ばない。
7. eventはappend-only、sequence連続、operation unique、hash chain連続。
8. `released -> verified AND valid_pass_receipt AND independent_verifier`。
9. `failed/cancelled`はverifiedへ遷移せずretryは新attempt。
10. quarantined versionは直接eligibleへ戻らず、retired versionはreclaim不可。

同じoperation ID＋同digestの再送は同receiptを返し増分0、異digestは対象のcanonical failureで停止する。未知例外を
`HIL_AGENT_LIFECYCLE_INVALID`へcause digest付きで境界変換しても、具体的なlease/fence/contract/drift tokenを丸めない。

## §4 実装配置候補

| path候補 | 責務 |
|---|---|
| `src/schema/agent-lifecycle.ts` | contract、muster、instance、lease、event、checkpoint、receipt、failure型 |
| `src/runtime/agent-contract-registry.ts` | version/supersession/status/eligibilityの正本解決 |
| `src/runtime/agent-ssot-runtime-projection.ts` | 現行reportを決定的compiler＋drift gateへharden |
| `src/team/agent-muster.ts` | pattern preset、candidate rank、二段muster、team digest |
| `src/runtime/agent-lifecycle.ts` | state遷移、lease/fence、checkpoint、release/disposition |
| `src/state-db/agent-lifecycle-projection.ts` | L5 §7の9 table、append、rebuild、query |
| `src/cli/commands/agent-lifecycle.ts` | registry check、muster、lease/checkpoint/verify/releaseのJSON surface |

既存`src/runtime/agent-slots.ts`は観測補助としてのみ残し、lease authorityへ昇格させる場合はfail-open I/O、FIFO release近似、
JSON current stateを廃しevent/lease CASへ移行する。既存job queueの`claimed`もfenceなしではagent leaseとして扱わない。

## §5 実装順と完了境界

実装順は、(1) schema/failure、(2) registry/supersession、(3) projection compiler/drift、(4) eligibility/pattern/muster、
(5) blindとrole分離、(6) lifecycle event、(7) lease/fence、(8) checkpoint/resume、(9) verification/release/disposition、
(10) L7 22件、L8 14件、HST-HIL-006、別runtime reviewとする。

CLI候補は成功0、contract/policy/state failure 2、adapter/storage I/O failure 3、internal/reconciliation failure 4とし、stdoutは
schema JSON、stderrは診断、evidenceはdigestとredacted metadataだけを保存する。本書はdraftであり、agent lifecycle実装完了や
外部runtimeでの自走完了を主張しない。

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

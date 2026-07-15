---
title: "HELIX L6 機能設計 — Python worker runtime"
layer: L6
kind: add-design
status: draft
created: 2026-07-15
updated: 2026-07-15
owner: Codex / TL
plan: PLAN-L1-07-infinity-loop-platform-requirements
design_slice: HDS-HIL-12
related_l3: docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md
related_l4: docs/design/helix/L4-basic-design/infinity-loop-platform-basic-design.md
related_hst: [HST-HIL-007]
related_l5: docs/design/helix/L5-detail/python-worker-runtime.md
pair_artifact: docs/test-design/helix/L6-python-worker-runtime-unit-test-design.md
next_pair_freeze: L7
requirements:
  - HR-FR-HIL-12
  - HAC-HIL-12a
  - HAC-HIL-12b
  - HAC-HIL-12c
---

# HELIX L6 機能設計 — Python worker runtime

## §1 public APIとexact oracle pointer

| API | signature | DbC | L7 oracle |
|---|---|---|---|
| `parsePythonWorkerDescriptor` | `(raw: unknown) => ResultV1<PythonWorkerDescriptorV1, WorkerFailureV1>` | strict schema、closed capability class、digest、protocol/resource policyを要求しunknown key拒否 | `U-PYWR-001` |
| `resolvePythonWorkerDescriptor` | `(requestedClass: PythonWorkerCapabilityClassV1, workerId: string, workerVersion: string, registry: PythonWorkerRegistrySnapshotV1) => ResultV1<ResolvedPythonWorkerDescriptorV1, WorkerFailureV1>` | active descriptorをexactly-one解決し、0件／複数件／inactive／class不一致／digest driftを拒否。resolution receiptを返す | `U-PYWR-001` |
| `negotiatePythonWorkerProtocol` | `(host: PythonWorkerProtocolOfferV1, worker: PythonWorkerProtocolOfferV1) => ResultV1<NegotiatedPythonWorkerProtocolV1, WorkerFailureV1>` | major一致、minor共通最大、schema capability交差が非空 | `U-PYWR-002` |
| `createPythonWorkerRun` | `(request: PythonWorkerRunRequestV1, resolved: ResolvedPythonWorkerDescriptorV1, lease, limits) => ResultV1<PythonWorkerRunPlanV1, WorkerFailureV1>` | request/resolutionのclass、worker、registry revision/digest、resolution digestをexact照合し、時刻非依存run identity、shell 0 | `U-PYWR-003` |
| `spawnPythonWorker` | `(plan: PythonWorkerRunPlanV1, sandbox, clock) => Promise<PythonWorkerProcessHandleV1>` | allowlisted argv/env/cwd/root、process group、親監視を設定 | `U-PYWR-004` |
| `parsePythonWorkerEnvelope` | `(line: Uint8Array, limits) => ResultV1<PythonWorkerEnvelopeV1, WorkerFailureV1>` | UTF-8 JSONL、field/type/sizeを厳密検査しstdoutを通信専用にする | `U-PYWR-005` |
| `advancePythonWorkerProtocol` | `(state: PythonWorkerProtocolStateV1, direction, envelope: PythonWorkerEnvelopeV1) => ResultV1<PythonWorkerProtocolStateV1, WorkerFailureV1>` | run/request/lease/fence、方向別sequence、type/state、digestを検査 | `U-PYWR-006` |
| `applyWorkerFlowControl` | `(queue, frame, limits, clock) => WorkerFlowControlDecisionV1` | byte/message high-low water、deadline、progress非算入 | `U-PYWR-008` |
| `requestPythonWorkerCancellation` | `(run, process, reason, clock) => Promise<WorkerTerminationEvidenceV1>` | cancel一回、grace後TERM/KILL、fence失効 | `U-PYWR-009` |
| `observePythonWorkerExit` | `(run, exit, parent, clock) => WorkerTerminalProposalV1` | normal/crash/parent-lost/timeoutを一つのterminal候補へ正規化 | `U-PYWR-010` |
| `fencePythonWorkerResult` | `(run, lease, envelope: PythonWorkerEnvelopeV1) => ResultV1<PythonWorkerEnvelopeV1, WorkerFailureV1>` | current lease/fence/deadlineだけ受理しlate result拒否 | `U-PYWR-011` |
| `stagePythonWorkerResult` | `(run, frames, complete, consumerSchema) => ResultV1<StagedPythonWorkerResultV1, WorkerFailureV1>` | complete exactly-one、全chunk/count/set digest、strict schema、runとclass/registry/resolution digest一致 | `U-PYWR-012` |
| `validateWorkerOutputArtifacts` | `(staged: StagedPythonWorkerResultV1, outputRoot, limits) => ResultV1<ValidatedWorkerArtifactsV1, WorkerFailureV1>` | relative path、root containment、symlink/duplicate/size/digestを検査 | `U-PYWR-013` |
| `assertPythonProposalOnlyAuthority` | `(sandboxEvidence, writeSet, authorityMap) => ResultV1<PythonProposalAuthorityReceiptV1, WorkerFailureV1>` | writable run root以外のwrite 0、Python DB/repo/current authorityなし | `U-PYWR-014` |
| `commitPythonWorkerResult` | `(staged, artifacts, idempotencyKey) => ResultV1<AcceptedWorkerCommitBundleV1, WorkerFailureV1>` | authoritative writeをせず、accepted/consumer/projection/terminalを完全bundle化 | `U-PYWR-015` |
| `recordWorkerTerminalReceipt` | `(run, terminal, bundle) => ResultV1<AcceptedWorkerCommitBundleV1, WorkerFailureV1>` | terminalとrunのclass/registry/resolution digestをexact照合し、runごとexactly-one、単独persist禁止 | `U-PYWR-016` |
| `commitAcceptedPythonWorkerResult` | `(bundle: AcceptedWorkerCommitBundleV1, store: PythonWorkerCommitStoreV1) => Promise<ResultV1<AcceptedWorkerCommitReceiptV1, WorkerFailureV1>>` | `accepted_result_commit`だけをNode store一transactionで固定順commit | `U-PYWR-017` |
| `commitPythonWorkerTerminal` | `(bundle: TerminalWorkerCommitBundleV1, store: PythonWorkerCommitStoreV1) => Promise<ResultV1<TerminalWorkerCommitReceiptV1, WorkerFailureV1>>` | `non_accepted_terminal_commit`でfailed/quarantined/cancelled/timed_outをexactly-one commit | `U-PYWR-017` |
| `reconcilePythonWorkerTerminal` | `(bundle: TerminalWorkerReconcileBundleV1, store: PythonWorkerCommitStoreV1) => Promise<ResultV1<TerminalWorkerCommitReceiptV1, WorkerFailureV1>>` | `terminal_reconcile`とimmutable evidenceから同一operation/digest/revisionだけを収束 | `U-PYWR-017` |
| `reconcilePythonWorkerRun` | `(artifactEvidence, events, projection) => PythonWorkerReconciliationPlanV1` | immutable evidenceを正本にmissing projectionだけ再構築、Python再commitなし | `U-PYWR-015` |

17 oracleはrange参照だけで消込まず、各APIから上表の個別IDへ双方向traceする。

`advancePythonWorkerProtocol`の公開API ownerは`U-PYWR-006`だけとする。`U-PYWR-007`は同APIの
`payload_identity_guard` composition mutationを所有し、run/request/lease/fenceとpayload digestの結合を検証する
supporting oracleであって、第2の公開API ownerではない。`HST-CASE-007-12`の主Uは`U-PYWR-007`のまま維持する。

`U-PYWR-017`のstable exact function setは次の3件であり、まとめ関数や相互代替を許可しない。

| composition順 | exact function | input bundle | 固有mutation |
|---:|---|---|---|
| 1 | `commitAcceptedPythonWorkerResult` | `AcceptedWorkerCommitBundleV1` | `accepted_result_commit` |
| 2 | `commitPythonWorkerTerminal` | `TerminalWorkerCommitBundleV1` | `non_accepted_terminal_commit` |
| 3 | `reconcilePythonWorkerTerminal` | `TerminalWorkerReconcileBundleV1` | `terminal_reconcile` |

### §1.1 canonical assertion primary表

次表はHST-HIL-007の18件を主API／主Uへ一意にbindするL6/L7 primary採点表である。supporting主ITはL8との
traceだけに使い、L6/L7のcase分母へ重複加算しない。Pythonはproposal-only、commit authorityはNodeだけとする。

| HST正本 | 主API | 主U | supporting主IT | pre_state | expected_state | failure正本 |
|---|---|---|---|---|---|---|
| `HST-CASE-007-01` | `commitPythonWorkerResult` | `U-PYWR-015` | `IT-PYWR-001` | `queued` | `committed` | `なし（正常系）` |
| `HST-CASE-007-02` | `negotiatePythonWorkerProtocol` | `U-PYWR-002` | `IT-PYWR-002` | `queued` | `quarantined` | `HIL_WORKER_PROTOCOL_VERSION_UNSUPPORTED` |
| `HST-CASE-007-03` | `parsePythonWorkerEnvelope` | `U-PYWR-005` | `IT-PYWR-002` | `running` | `quarantined` | `HIL_WORKER_JSON_INVALID` |
| `HST-CASE-007-04` | `parsePythonWorkerEnvelope` | `U-PYWR-005` | `IT-PYWR-003` | `queued` | `quarantined` | `HIL_WORKER_PAYLOAD_OVERSIZE` |
| `HST-CASE-007-05` | `advancePythonWorkerProtocol` | `U-PYWR-006` | `IT-PYWR-002` | `running` | `quarantined` | `HIL_WORKER_SEQUENCE_GAP` |
| `HST-CASE-007-06` | `observePythonWorkerExit` | `U-PYWR-010` | `IT-PYWR-004` | `running` | `failed` | `HIL_WORKER_TIMEOUT` |
| `HST-CASE-007-07` | `requestPythonWorkerCancellation` | `U-PYWR-009` | `IT-PYWR-004` | `running` | `cancelled` | `HIL_WORKER_CANCELLED` |
| `HST-CASE-007-08` | `observePythonWorkerExit` | `U-PYWR-010` | `IT-PYWR-005` | `running` | `failed` | `HIL_WORKER_CRASHED` |
| `HST-CASE-007-09` | `applyWorkerFlowControl` | `U-PYWR-008` | `IT-PYWR-003` | `running` | `quarantined` | `HIL_WORKER_BACKPRESSURE_EXCEEDED` |
| `HST-CASE-007-10` | `observePythonWorkerExit` | `U-PYWR-010` | `IT-PYWR-005` | `running` | `failed` | `HIL_WORKER_PARENT_LOST` |
| `HST-CASE-007-11` | `fencePythonWorkerResult` | `U-PYWR-011` | `IT-PYWR-006` | `running` | `running` | `HIL_WORKER_LATE_RESULT_FENCED` |
| `HST-CASE-007-12` | `advancePythonWorkerProtocol` | `U-PYWR-007` | `IT-PYWR-002` | `accepted` | `quarantined` | `HIL_WORKER_PAYLOAD_DIGEST_MISMATCH` |
| `HST-CASE-007-13` | `recordWorkerTerminalReceipt` | `U-PYWR-016` | `IT-PYWR-008` | `assertion_input_ready` | `assertion_pass` | `HIL_WORKER_PROTOCOL_INVALID` |
| `HST-CASE-007-14` | `spawnPythonWorker` | `U-PYWR-004` | `IT-PYWR-007` | `assertion_input_ready` | `assertion_pass` | `HIL_PYTHON_PLANE_BOUNDARY_INVALID` |
| `HST-CASE-007-15` | `assertPythonProposalOnlyAuthority` | `U-PYWR-014` | `IT-PYWR-007` | `assertion_input_ready` | `assertion_pass` | `HIL_DB_WRITE_AUTHORITY_INVALID` |
| `HST-CASE-007-16` | `parsePythonWorkerEnvelope` | `U-PYWR-005` | `IT-PYWR-002` | `assertion_input_ready` | `assertion_pass` | `HIL_IPC_ENVELOPE_INVALID` |
| `HST-CASE-007-17` | `assertPythonProposalOnlyAuthority` | `U-PYWR-014` | `IT-PYWR-007` | `assertion_input_ready` | `assertion_pass` | `HIL_RESULT_WRITE_AUTHORITY_INVALID` |
| `HST-CASE-007-18` | `recordWorkerTerminalReceipt` | `U-PYWR-016` | `IT-PYWR-008` | `assertion_input_ready` | `assertion_pass` | `HIL_IPC_FAIL_OPEN` |

## §2 schema

```ts
type ResultV1<T, E> =
  | { ok: true; value: T }
  | { ok: false; error: E };

interface PythonWorkerDescriptorV1 {
  schema_version: "helix-python-worker-descriptor.v1";
  worker_id: string; worker_version: string; protocol_major: number; protocol_minor_min: number; protocol_minor_max: number;
  capability_class: PythonWorkerCapabilityClassV1;
  entrypoint: string; entrypoint_digest: string; python_runtime: string; request_schema: string; result_schema: string;
  input_kinds: string[]; resource_policy_id: string; resource_policy_digest: string; descriptor_digest: string;
}
type PythonWorkerCapabilityClassV1 =
  | "source_atomization"
  | "document_engine"
  | "detector"
  | "product_data"
  | "analysis";
interface PythonWorkerRegistryEntryV1 { descriptor: PythonWorkerDescriptorV1; status: "active" | "inactive"; entry_digest: string }
interface PythonWorkerRegistrySnapshotV1 { registry_revision: number; registry_digest: string; entries: PythonWorkerRegistryEntryV1[] }
interface ResolvedPythonWorkerDescriptorV1 { requested_class: PythonWorkerCapabilityClassV1; registry_revision: number; registry_digest: string; descriptor: PythonWorkerDescriptorV1; resolution_digest: string }
interface PythonWorkerProtocolOfferV1 { protocol_major: number; protocol_minor_min: number; protocol_minor_max: number; request_schema_ids: string[]; result_schema_ids: string[]; capability_set_digest: string; offer_digest: string }
interface NegotiatedPythonWorkerProtocolV1 { protocol_major: number; protocol_minor: number; request_schema_id: string; result_schema_id: string; host_offer_digest: string; worker_offer_digest: string; negotiation_digest: string }
interface PythonWorkerRunPlanV1 { operation_id: string; run_id: string; request_id: string; capability_class: PythonWorkerCapabilityClassV1; registry_revision: number; registry_digest: string; resolution_digest: string; descriptor_digest: string; request_digest: string; argv: string[]; environment_keys: string[]; working_directory_id: string; read_root_digests: string[]; write_root_digest: string; lease_id: string; fence_token: string; deadline_at: string; limits_digest: string; run_identity_digest: string }
interface PythonWorkerProcessHandleV1 { run_id: string; process_id: string; process_group_id: string; stdin_channel_id: string; stdout_channel_id: string; stderr_channel_id: string; parent_monitor_receipt_digest: string; sandbox_evidence_digest: string; started_at: string }
interface PythonWorkerEnvelopeV1 { schema_version: "helix-python-worker-envelope.v1"; protocol_version: string; run_id: string; request_id: string; type: "hello" | "hello_ack" | "request" | "progress" | "result" | "complete" | "error" | "cancel" | "cancelled"; sequence: number; deadline_at: string; lease_id: string; fence_token: string; payload_digest: string; payload: unknown }
interface PythonWorkerProtocolStateV1 { run_id: string; request_id: string; phase: "negotiating" | "running" | "result_staged" | "terminal"; next_host_sequence: number; next_worker_sequence: number; terminal_seen: boolean; lease_id: string; fence_token: string; result_chunk_digests: string[]; state_digest: string }
interface WorkerFlowControlDecisionV1 { action: "accept" | "pause" | "resume" | "terminate"; queued_messages: number; queued_bytes: number; high_water_reached: boolean; low_water_reached: boolean; deadline_exceeded: boolean; failure: WorkerFailureV1 | null; decision_digest: string }
interface WorkerTerminationEvidenceV1 { run_id: string; reason: "cancel" | "timeout" | "crash" | "parent_lost"; cancel_sent_count: 0 | 1; cancelled_acknowledged: boolean; term_count: 0 | 1; kill_count: 0 | 1; fence_invalidated: true; process_exit: { code: number | null; signal: string | null }; evidence_digest: string }
interface WorkerTerminalProposalV1 { run_id: string; status: "failed" | "quarantined" | "cancelled" | "timed_out"; failure_codes: WorkerFailureCodeV1[]; process_exit: { code: number | null; signal: string | null }; result_set_digest: string | null; terminal_event_digest: string; proposal_digest: string }
interface ValidatedWorkerArtifactsV1 { run_id: string; output_root_digest: string; artifacts: { relative_path: string; size_bytes: number; content_digest: string }[]; artifact_manifest_digest: string; proposal_only: true }
interface PythonProposalAuthorityReceiptV1 { run_id: string; sandbox_evidence_digest: string; observed_write_set_digest: string; allowed_write_root_digest: string; protected_root_write_count: 0; authoritative_write_count: 0; proposal_only: true; receipt_digest: string }
interface PythonWorkerReconciliationPlanV1 { operation_id: string; operation_digest: string; run_id: string; immutable_artifact_digest: string; immutable_event_chain_digest: string; expected_run_revision: number; expected_projection_revision: number; actions: ("restore_projection" | "restore_terminal_receipt")[]; projection_digest: string; terminal_receipt_digest: string; python_recommit_count: 0; plan_digest: string }

type WorkerRunStatusV1 =
  | "queued" | "leased" | "starting" | "negotiating" | "running"
  | "result_staged" | "committed" | "failed" | "quarantined"
  | "cancelled" | "timed_out";

type WorkerFailureCodeV1 =
  | "HIL_WORKER_PROTOCOL_INVALID"
  | "HIL_WORKER_PROTOCOL_VERSION_UNSUPPORTED"
  | "HIL_WORKER_JSON_INVALID"
  | "HIL_WORKER_PAYLOAD_OVERSIZE"
  | "HIL_WORKER_SEQUENCE_GAP"
  | "HIL_WORKER_PAYLOAD_DIGEST_MISMATCH"
  | "HIL_WORKER_RESULT_SCHEMA_INVALID"
  | "HIL_WORKER_TIMEOUT"
  | "HIL_WORKER_CANCELLED"
  | "HIL_WORKER_CRASHED"
  | "HIL_WORKER_BACKPRESSURE_EXCEEDED"
  | "HIL_WORKER_PARENT_LOST"
  | "HIL_WORKER_LATE_RESULT_FENCED"
  | "HIL_PYTHON_PLANE_BOUNDARY_INVALID"
  | "HIL_PYTHON_AUTHORITY_BYPASS"
  | "HIL_DB_WRITE_AUTHORITY_INVALID"
  | "HIL_RESULT_WRITE_AUTHORITY_INVALID"
  | "HIL_WORKER_RESULT_COMMIT_FAILED"
  | "HIL_IPC_ENVELOPE_INVALID"
  | "HIL_IPC_FAIL_OPEN";

interface WorkerFailureV1 {
  code: WorkerFailureCodeV1;
  cause_digest: string;
  operation_id: string | null;
}

interface WorkerEventV1 {
  schema_version: "helix-python-worker-event.v1";
  event_id: string;
  run_id: string;
  sequence: number;
  event_kind: "accepted_result" | "consumer_result" | "terminal_status";
  previous_event_digest: string | null;
  payload_digest: string;
  event_digest: string;
}

interface PythonWorkerRunRequestV1 {
  schema_version: "helix-python-worker-request.v1";
  operation_id: string;
  request_id: string;
  worker_id: string;
  worker_version: string;
  capability_class: PythonWorkerCapabilityClassV1;
  registry_revision: number;
  registry_digest: string;
  resolution_digest: string;
  input_artifact_ids: string[];
  input_digest: string;
  config_digest: string;
  result_schema: string;
  deadline_at: string;
  lease_id: string;
  fence_token: string;
  limits: {
    max_line_bytes: number;
    max_result_bytes: number;
    max_queue_messages: number;
    max_queue_bytes: number;
    max_stderr_bytes: number;
    cancel_grace_ms: number;
  };
}

interface StagedPythonWorkerResultV1 {
  schema_version: "helix-python-worker-staged-result.v1";
  run_id: string;
  request_id: string;
  worker_id: string;
  worker_version: string;
  capability_class: PythonWorkerCapabilityClassV1;
  registry_revision: number;
  registry_digest: string;
  resolution_digest: string;
  protocol_version: string;
  input_digest: string;
  config_digest: string;
  result_schema: string;
  result_count: number;
  result_set_digest: string;
  artifact_manifest_digest: string;
  lease_id: string;
  fence_token: string;
  proposal_only: true;
}

interface PythonWorkerTerminalReceiptV1 {
  schema_version: "helix-python-worker-terminal-receipt.v1";
  run_id: string;
  capability_class: PythonWorkerCapabilityClassV1;
  registry_revision: number;
  registry_digest: string;
  resolution_digest: string;
  status: "committed" | "failed" | "quarantined" | "cancelled" | "timed_out";
  failure_codes: WorkerFailureCodeV1[];
  process_exit: { code: number | null; signal: string | null };
  result_set_digest: string | null;
  commit_receipt_id: string | null;
  event_chain_digest: string;
}

type AcceptedWorkerAppendStepV1 = "accepted_event" | "consumer_event" | "projection" | "terminal_receipt" | "commit_receipt";
type NonAcceptedWorkerTerminalV1 = "failed" | "quarantined" | "cancelled" | "timed_out";
interface WorkerProjectionMutationV1 {
  schema_version: "helix-python-worker-projection-mutation.v1";
  mutation_kind: "accepted_result_commit" | "non_accepted_terminal_commit" | "terminal_reconcile";
  run_id: string;
  from_status: WorkerRunStatusV1;
  to_status: "committed" | NonAcceptedWorkerTerminalV1;
  expected_run_revision: number;
  expected_projection_revision: number;
  event_head: string;
  projection_digest: string;
}
type AcceptedWorkerProjectionMutationV1 = WorkerProjectionMutationV1 & { mutation_kind: "accepted_result_commit"; to_status: "committed" };
type TerminalWorkerProjectionMutationV1 = WorkerProjectionMutationV1 & { mutation_kind: "non_accepted_terminal_commit"; to_status: NonAcceptedWorkerTerminalV1 };
type TerminalReconcileProjectionMutationV1 = WorkerProjectionMutationV1 & { mutation_kind: "terminal_reconcile"; to_status: NonAcceptedWorkerTerminalV1 };
interface AcceptedWorkerCommitBundleV1 {
  operation_id: string; operation_digest: string; idempotency_key: string; run_id: string; result_set_digest: string;
  expected_run_revision: number; expected_projection_revision: number; append_order: AcceptedWorkerAppendStepV1[];
  write_set: { table: string; key: string; action: "insert" | "update" }[]; write_set_digest: string;
  accepted_event: WorkerEventV1; consumer_event: WorkerEventV1; projection: AcceptedWorkerProjectionMutationV1;
  terminal_receipt: PythonWorkerTerminalReceiptV1;
}
interface AcceptedWorkerCommitReceiptV1 {
  operation_id: string; operation_digest: string; before_run_revision: number; after_run_revision: number;
  before_projection_revision: number; after_projection_revision: number; event_sequence: number; write_set_digest: string;
  counts: Record<AcceptedWorkerAppendStepV1, { inserted: number; updated: number }>;
}
interface TerminalWorkerCommitBundleV1 { operation_id: string; operation_digest: string; idempotency_key: string; run_id: string; terminal: NonAcceptedWorkerTerminalV1; expected_run_revision: number; terminal_event: WorkerEventV1; terminal_receipt: PythonWorkerTerminalReceiptV1; projection: TerminalWorkerProjectionMutationV1; append_order: ["terminal_event", "projection", "terminal_receipt", "commit_receipt"]; exact_write_set: { table: string; key: string; action: "insert" | "update" }[]; write_set_digest: string }
interface TerminalWorkerReconcileBundleV1 { operation_id: string; operation_digest: string; idempotency_key: string; run_id: string; terminal: NonAcceptedWorkerTerminalV1; expected_run_revision: number; expected_projection_revision: number; terminal_event: WorkerEventV1; terminal_receipt: PythonWorkerTerminalReceiptV1; projection: TerminalReconcileProjectionMutationV1; immutable_evidence_digest: string; write_set_digest: string }
interface TerminalWorkerCommitReceiptV1 { operation_id: string; operation_digest: string; terminal: NonAcceptedWorkerTerminalV1; before_run_revision: number; after_run_revision: number; event_sequence: number; terminal_receipt_digest: string; write_set_digest: string; counts: Record<"terminal_event" | "projection" | "terminal_receipt" | "commit_receipt", { inserted: number; updated: number }> }
interface PythonWorkerCommitStoreV1 { commitAcceptedResult(bundle: AcceptedWorkerCommitBundleV1): Promise<ResultV1<AcceptedWorkerCommitReceiptV1, WorkerFailureV1>>; commitTerminal(bundle: TerminalWorkerCommitBundleV1): Promise<ResultV1<TerminalWorkerCommitReceiptV1, WorkerFailureV1>>; reconcileTerminal(bundle: TerminalWorkerReconcileBundleV1): Promise<ResultV1<TerminalWorkerCommitReceiptV1, WorkerFailureV1>> }
```

`deadline_at`は外部入力としてrun identityへ含めず、run attemptへbindする。digest計算にwall clock、PID、temp path、
OS separatorを含めない。receiptには観測時刻を記録できるが、result determinism digestから除外する。

## §3 state machineと不変条件

許可遷移はL5 §4のgraphだけとする。`result_staged`はauthoritative resultではなく、`committed`だけがconsumer projectionを
可視化できる。terminalからの遷移、terminal receipt 0/複数、`complete`前stage、stage前commitを拒否する。

主要不変条件:

1. `terminal_receipt_count(run_id) == 1`。
2. `committed -> complete_count == 1 AND schema_valid AND current_fence AND node_commit`。
3. `failed|quarantined|cancelled|timed_out -> authoritative_result_count == 0`。
4. `python_authoritative_write_count == 0`。
5. `same idempotency key + same digest -> same commit receipt`。
6. `same idempotency key + different digest -> conflict, commit 0`。
7. accepted/consumer event、projection、terminal/commit receiptは一つのNode DB transactionで、artifactはdigest付きimmutable stagingからreconcile可能。
8. append順は`accepted_event,consumer_event,projection,terminal_receipt,commit_receipt`、任意step faultで全count 0。
9. `request.capability_class/registry_revision/registry_digest/resolution_digest == resolved == run == staged == terminal`。
10. class／registry／resolutionを1 hopでも改変した場合、spawn／stage／terminal／authoritative commitは全て0。

class、registry、resolution digestはrequest digest、run identity digest、result setのprovenance digest、terminal receipt digestへ含め、
fieldが見かけ上一致してもdigest bindingが異なるcross-class replayを拒否する。

## §4 実装配置候補と依存方向

| path候補 | 責務 |
|---|---|
| `src/schema/python-worker-runtime.ts` | descriptor、request、envelope、result、receipt、失敗型の定義 |
| `src/runtime/python-worker-registry.ts` | allowlist、version/digest/schema解決 |
| `src/runtime/python-worker-protocol.ts` | JSONL解析、接続確認、sequence、digest、流量制御 |
| `src/runtime/python-worker-broker.ts` | lease/fence、spawn、cancel、timeout、exit、terminal化 |
| `src/runtime/python-worker-sandbox.ts` | argv/env/cwd/root、process group、resource policyのport |
| `src/runtime/python-result-ingestion.ts` | result/artifact検証とproposalの一時固定 |
| `src/state-db/python-worker-projection.ts` | Node event/projection transactionとrebuild |
| `src/cli/commands/python-worker.ts` | registry/run/status/cancelのJSON CLI adapter |

consumerは`PythonWorkerBroker`と`ResultIngestionPort`のportへ依存し、child process、SQLite、filesystem sandboxを直接
操作しない。Python packageはversioned worker entrypointとproposal schemaを所有するが、TypeScript schemaの複製を
正本にせず、contract fixtureで相互検証する。

## §5 failure unionとexit規律

`WorkerFailureCodeV1`はL5 §6の20 codeをallowlistとし、未知例外はcause digest付き
`HIL_WORKER_PROTOCOL_INVALID`へ境界変換する。既存system assertionの詳細tokenをrenameしない。

CLIは成功0、contract/protocol failure 2、process/I/O failure 3、internal/reconciliation failure 4とする。stdoutは
schema準拠JSON、診断はstderrとし、worker stdoutのraw本文、secret、credential、PIIをreceiptへ複製しない。

## §6 implementation WBSとfreeze

1. schema、failure enum、state transition、17 unit oracleをRedで固定する。
2. registry、protocol negotiation、strict JSONL parserを実装する。
3. process/sandbox/parent ownership、bounded flow controlを実装する。
4. timeout/cancel/crash/late fencingのterminal化を実装する。
5. result/artifact schemaとproposal-only authority検査を実装する。
6. Node event/projection transaction、idempotency、reconciliationを実装する。
7. L7 17 unit、L8 9 integration、system assertion、Linux process smoke、別runtime reviewを実行する。

本書はdraftであり実装済みを主張しない。L6/L7 pairは17/17 oracleのRed/Green、全詳細failure code、write count、
state/event digest、negative mutation、17/17 unitが揃うまでfreezeしない。

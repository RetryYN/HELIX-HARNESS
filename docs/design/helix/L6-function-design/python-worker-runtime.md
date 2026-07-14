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
| `parsePythonWorkerDescriptor` | `(raw: unknown) => Result<PythonWorkerDescriptor, WorkerFailure>` | strict schema、digest、protocol/resource policyを要求しunknown key拒否 | `U-PYWR-001` |
| `negotiatePythonWorkerProtocol` | `(host: ProtocolOffer, worker: ProtocolOffer) => Result<NegotiatedProtocol, WorkerFailure>` | major一致、minor共通最大、schema capability交差が非空 | `U-PYWR-002` |
| `createPythonWorkerRun` | `(request, descriptor, lease, limits) => WorkerRunPlan` | operation/input/config/schema/policyから時刻非依存run identity、shell 0 | `U-PYWR-003` |
| `spawnPythonWorker` | `(plan, sandbox, clock) => Promise<WorkerProcessHandle>` | allowlisted argv/env/cwd/root、process group、親監視を設定 | `U-PYWR-004` |
| `parsePythonWorkerEnvelope` | `(line: Uint8Array, limits) => Result<WorkerEnvelope, WorkerFailure>` | UTF-8 JSONL、field/type/sizeを厳密検査しstdoutを通信専用にする | `U-PYWR-005` |
| `advancePythonWorkerProtocol` | `(state, direction, envelope) => Result<ProtocolState, WorkerFailure>` | run/request/lease/fence、方向別sequence、type/state、digestを検査 | `U-PYWR-006, U-PYWR-007` |
| `applyWorkerFlowControl` | `(queue, frame, limits, clock) => FlowControlDecision` | byte/message high-low water、deadline、progress非算入 | `U-PYWR-008` |
| `requestPythonWorkerCancellation` | `(run, process, reason, clock) => Promise<TerminationEvidence>` | cancel一回、grace後TERM/KILL、fence失効 | `U-PYWR-009` |
| `observePythonWorkerExit` | `(run, exit, parent, clock) => WorkerTerminalProposal` | normal/crash/parent-lost/timeoutを一つのterminal候補へ正規化 | `U-PYWR-010` |
| `fencePythonWorkerResult` | `(run, lease, envelope) => Result<WorkerEnvelope, WorkerFailure>` | current lease/fence/deadlineだけ受理しlate result拒否 | `U-PYWR-011` |
| `stagePythonWorkerResult` | `(run, frames, complete, consumerSchema) => Result<StagedWorkerResult, WorkerFailure>` | complete exactly-one、全chunk/count/set digest、strict schema、provenance | `U-PYWR-012` |
| `validateWorkerOutputArtifacts` | `(staged, outputRoot, limits) => Result<ValidatedArtifacts, WorkerFailure>` | relative path、root containment、symlink/duplicate/size/digestを検査 | `U-PYWR-013` |
| `assertPythonProposalOnlyAuthority` | `(sandboxEvidence, writeSet, authorityMap) => Result<AuthorityReceipt, WorkerFailure>` | writable run root以外のwrite 0、Python DB/repo/current authorityなし | `U-PYWR-014` |
| `commitPythonWorkerResult` | `(staged, artifacts, idempotencyKey) => Result<AcceptedWorkerCommitBundleV1, WorkerFailure>` | authoritative writeをせず、accepted/consumer/projection/terminalを完全bundle化 | `U-PYWR-015` |
| `recordWorkerTerminalReceipt` | `(run, terminal, bundle) => Result<AcceptedWorkerCommitBundleV1, WorkerFailure>` | bundle内terminalをrunごとexactly-oneにし、単独persistを禁止 | `U-PYWR-016` |
| `commitAcceptedPythonWorkerResult` | `(bundle: AcceptedWorkerCommitBundleV1, store: PythonWorkerCommitStore) => Promise<Result<AcceptedWorkerCommitReceiptV1, WorkerFailure>>` | Node store一transaction、固定append順、run/projection CAS、各append faultでpartial 0 | `U-PYWR-017` |
| `commitPythonWorkerTerminal` | `(bundle: TerminalWorkerCommitBundleV1, store: PythonWorkerCommitStore) => Promise<Result<TerminalWorkerCommitReceiptV1, WorkerFailure>>` | failed/quarantined/cancelled/timed_outをexactly-one atomic terminalへcommit | `U-PYWR-017` |
| `reconcilePythonWorkerTerminal` | `(bundle: TerminalWorkerCommitBundleV1, store: PythonWorkerCommitStore) => Promise<Result<TerminalWorkerCommitReceiptV1, WorkerFailure>>` | 同一operation/digest/revisionからだけterminal faultを収束 | `U-PYWR-017` |
| `reconcilePythonWorkerRun` | `(artifactEvidence, events, projection) => ReconciliationPlan` | immutable evidenceを正本にmissing projectionだけ再構築、Python再commitなし | `U-PYWR-015, U-PYWR-016` |

17 oracleはrange参照だけで消込まず、各APIから上表の個別IDへ双方向traceする。

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
type WorkerRunStatus =
  | "queued" | "leased" | "starting" | "negotiating" | "running"
  | "result_staged" | "committed" | "failed" | "quarantined"
  | "cancelled" | "timed_out";

interface PythonWorkerRunRequestV1 {
  schema_version: "helix-python-worker-request.v1";
  operation_id: string;
  request_id: string;
  worker_id: string;
  worker_version: string;
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
  status: "committed" | "failed" | "quarantined" | "cancelled" | "timed_out";
  failure_codes: WorkerFailureCode[];
  process_exit: { code: number | null; signal: string | null };
  result_set_digest: string | null;
  commit_receipt_id: string | null;
  event_chain_digest: string;
}

type AcceptedWorkerAppendStep = "accepted_event" | "consumer_event" | "projection" | "terminal_receipt" | "commit_receipt";
interface AcceptedWorkerCommitBundleV1 {
  operation_id: string; operation_digest: string; idempotency_key: string; run_id: string; result_set_digest: string;
  expected_run_revision: number; expected_projection_revision: number; append_order: AcceptedWorkerAppendStep[];
  write_set: { table: string; key: string; action: "insert" | "update" }[]; write_set_digest: string;
  accepted_event: WorkerEventV1; consumer_event: WorkerEventV1; projection: WorkerProjectionMutationV1;
  terminal_receipt: PythonWorkerTerminalReceiptV1;
}
interface AcceptedWorkerCommitReceiptV1 {
  operation_id: string; operation_digest: string; before_run_revision: number; after_run_revision: number;
  before_projection_revision: number; after_projection_revision: number; event_sequence: number; write_set_digest: string;
  counts: Record<AcceptedWorkerAppendStep, { inserted: number; updated: number }>;
}
type NonAcceptedWorkerTerminal = "failed" | "quarantined" | "cancelled" | "timed_out";
interface TerminalWorkerCommitBundleV1 { operation_id: string; operation_digest: string; idempotency_key: string; run_id: string; terminal: NonAcceptedWorkerTerminal; expected_run_revision: number; terminal_event: WorkerEventV1; terminal_receipt: PythonWorkerTerminalReceiptV1; projection: WorkerProjectionMutationV1; append_order: ["terminal_event", "projection", "terminal_receipt", "commit_receipt"]; exact_write_set: { table: string; key: string; action: "insert" | "update" }[]; write_set_digest: string }
interface TerminalWorkerCommitReceiptV1 { operation_id: string; operation_digest: string; terminal: NonAcceptedWorkerTerminal; before_run_revision: number; after_run_revision: number; event_sequence: number; terminal_receipt_digest: string; write_set_digest: string; counts: Record<"terminal_event" | "projection" | "terminal_receipt" | "commit_receipt", { inserted: number; updated: number }> }
interface PythonWorkerCommitStore { commitAcceptedResult(bundle: AcceptedWorkerCommitBundleV1): Promise<Result<AcceptedWorkerCommitReceiptV1, WorkerFailure>>; commitTerminal(bundle: TerminalWorkerCommitBundleV1): Promise<Result<TerminalWorkerCommitReceiptV1, WorkerFailure>>; reconcileTerminal(bundle: TerminalWorkerCommitBundleV1): Promise<Result<TerminalWorkerCommitReceiptV1, WorkerFailure>> }
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

`WorkerFailureCode`はL5 §6の16詳細codeをallowlistとし、未知例外はcause digest付き
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

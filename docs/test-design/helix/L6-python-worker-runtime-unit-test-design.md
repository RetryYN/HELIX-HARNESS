---
title: "HELIX L7 単体テスト設計 — Python worker runtime"
layer: L6
executed_at_layer: L7
artifact_type: test_design
status: draft
created: 2026-07-15
updated: 2026-07-15
owner: QA / TL
plan: PLAN-L1-07-infinity-loop-platform-requirements
design_slice: HDS-HIL-12
related_l3: docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md
related_l4: docs/design/helix/L4-basic-design/infinity-loop-platform-basic-design.md
related_hst: [HST-HIL-007]
pair_artifact: docs/design/helix/L6-function-design/python-worker-runtime.md
next_pair_freeze: L6
requirements:
  - HR-FR-HIL-12
  - HAC-HIL-12a
  - HAC-HIL-12b
  - HAC-HIL-12c
---

# HELIX L7 単体テスト設計 — Python worker runtime

| ID | L6 API pointer | HAC trace | HST trace | 反例／刺激 | 期待結果・failure code | test citation |
|---|---|---|---|---|---|---|
| `U-PYWR-001` | `parsePythonWorkerDescriptor` | `HAC-HIL-12a` | `HST-CASE-007-14` | descriptor欠落、unknown key、空schema、digest不正、未登録runtime | `HIL_PYTHON_PLANE_BOUNDARY_INVALID`でstrict reject。valid descriptorはcanonical digestを維持 | `tests/python-worker-registry.test.ts` |
| `U-PYWR-002` | `negotiatePythonWorkerProtocol` | `HAC-HIL-12b` | `HST-CASE-007-02` | major不一致、minor交差なし、schema capability不一致 | `HIL_WORKER_PROTOCOL_VERSION_UNSUPPORTED`。共通最大minorだけ選択 | `tests/python-worker-protocol.test.ts` |
| `U-PYWR-003` | `createPythonWorkerRun` | `HAC-HIL-12b` | `HST-CASE-007-12` | 同一operation/input/configを時刻、PID、OS pathだけ変更し、payload digestも改変 | 同一payloadのrun identityは不変。異payloadは`HIL_WORKER_PAYLOAD_DIGEST_MISMATCH`で拒否し、shell invocation 0 | `tests/python-worker-broker.test.ts` |
| `U-PYWR-004` | `spawnPythonWorker` | `HAC-HIL-12a`, `HAC-HIL-12c` | `HST-CASE-007-14` | env/cwd/write root/entrypoint逸脱、parent monitor欠落 | spawn 0または`HIL_PYTHON_PLANE_BOUNDARY_INVALID`、allowlistだけprocessへ渡す | `tests/python-worker-sandbox.test.ts` |
| `U-PYWR-005` | `parsePythonWorkerEnvelope` | `HAC-HIL-12b` | `HST-CASE-007-03`, `HST-CASE-007-04` | malformed JSON、BOM、unknown field/type、stdout log、line oversize | `HIL_WORKER_JSON_INVALID`または`HIL_WORKER_PAYLOAD_OVERSIZE` | `tests/python-worker-protocol.test.ts` |
| `U-PYWR-006` | `advancePythonWorkerProtocol` | `HAC-HIL-12b` | `HST-CASE-007-05` | sequence gap/duplicate/rollback、terminal後frame、方向違反 | `HIL_WORKER_SEQUENCE_GAP`、state不変、result staging 0 | `tests/python-worker-protocol.test.ts` |
| `U-PYWR-007` | `advancePythonWorkerProtocol`の`payload_identity_guard` composition mutation | `HAC-HIL-12b`, `HAC-HIL-12c` | `HST-CASE-007-11`, `HST-CASE-007-12` | run/request/lease/fence不一致、payload digest改変 | pointer別に`HIL_WORKER_LATE_RESULT_FENCED`、`HIL_WORKER_PAYLOAD_DIGEST_MISMATCH`、commit 0 | `tests/python-worker-protocol.test.ts` |
| `U-PYWR-008` | `applyWorkerFlowControl` | `HAC-HIL-12b` | `HST-CASE-007-09` | message/byte high-water、単一frame/累積/stderr超過、progress flood | pause/resumeを決定し、期限超過は`HIL_WORKER_BACKPRESSURE_EXCEEDED`。progress count weight 0 | `tests/python-worker-flow-control.test.ts` |
| `U-PYWR-009` | `requestPythonWorkerCancellation` | `HAC-HIL-12c` | `HST-CASE-007-07` | cancel重複、ackなし、grace超過、result競合 | cancel一回、fence失効、TERM→KILL、`HIL_WORKER_CANCELLED`、commit 0 | `tests/python-worker-lifecycle.test.ts` |
| `U-PYWR-010` | `observePythonWorkerExit` | `HAC-HIL-12b`, `HAC-HIL-12c` | `HST-CASE-007-06`, `HST-CASE-007-08`, `HST-CASE-007-10` | timeout、non-zero exit、signal、parent lost、completeなし正常exit | pointer別に`HIL_WORKER_TIMEOUT`、`HIL_WORKER_CRASHED`、`HIL_WORKER_PARENT_LOST`へ正規化 | `tests/python-worker-lifecycle.test.ts` |
| `U-PYWR-011` | `fencePythonWorkerResult` | `HAC-HIL-12c` | `HST-CASE-007-11` | lease再割当、deadline/cancel後のschema-valid result | `HIL_WORKER_LATE_RESULT_FENCED`、new owner stateとprojection不変 | `tests/python-worker-fencing.test.ts` |
| `U-PYWR-012` | `stagePythonWorkerResult` | `HAC-HIL-12a`, `HAC-HIL-12b` | `HST-CASE-007-18` | complete 0/複数、chunk欠落、件数/set digest/schema/provenance不一致 | assertion token `HIL_IPC_FAIL_OPEN`を0に保ち、詳細cause `HIL_WORKER_RESULT_SCHEMA_INVALID`、partial staging/current 0 | `tests/python-result-ingestion.test.ts` |
| `U-PYWR-013` | `validateWorkerOutputArtifacts` | `HAC-HIL-12c` | `HST-CASE-008-07` | absolute/`..`/symlink/duplicate path、size/digest mismatch | assertion token `HIL_ARTIFACT_PATH_ESCAPE`を詳細cause `HIL_RESULT_WRITE_AUTHORITY_INVALID`へ保持して拒否し、root外read/write 0、artifact publish 0 | `tests/python-result-ingestion.test.ts` |
| `U-PYWR-014` | `assertPythonProposalOnlyAuthority` | `HAC-HIL-12c` | `HST-CASE-007-15`, `HST-CASE-007-17`, `HST-CASE-008-12` | Python DB/repo/`.helix`/current write企図、DB path要求 | pointer別に`HIL_DB_WRITE_AUTHORITY_INVALID`、`HIL_RESULT_WRITE_AUTHORITY_INVALID`、`HIL_PYTHON_AUTHORITY_BYPASS`で拒否 | `tests/python-worker-authority.test.ts` |
| `U-PYWR-015` | `commitPythonWorkerResult`, `reconcilePythonWorkerRun` | `HAC-HIL-12a`, `HAC-HIL-12c` | `HST-CASE-007-17`, `HST-CASE-009-08` | 同key再送、同key異digest、event/projection fault、artifact-only状態、missing projection rebuild | pointer別に`HIL_RESULT_WRITE_AUTHORITY_INVALID`、`HIL_DB_PROJECTION_BOUNDARY_INVALID`。commit詳細causeは`HIL_WORKER_RESULT_COMMIT_FAILED`、failure時current 0、immutable evidence一致時だけprojectionを再構築 | `tests/python-result-commit.test.ts` |
| `U-PYWR-016` | `recordWorkerTerminalReceipt` | `HAC-HIL-12a`, `HAC-HIL-12b`, `HAC-HIL-12c` | `HST-CASE-007-13`, `HST-CASE-007-18` | terminal 0/二重/異status、receipt write failure、同一terminal receipt再入力 | pointer別に`HIL_WORKER_PROTOCOL_INVALID`、`HIL_IPC_FAIL_OPEN`で競合を拒否し、runごとexactly-one receiptを同digestへ固定 | `tests/python-worker-terminal-receipt.test.ts` |
| `U-PYWR-017` | `commitAcceptedPythonWorkerResult`, `commitPythonWorkerTerminal`, `reconcilePythonWorkerTerminal` | `HAC-HIL-12a`, `HAC-HIL-12c` | supporting | 3関数を個別実行し、acceptedとfailed/quarantined/cancelled/timed_outごとに各append fault、run/projection CAS、同key異digest | 固有mutationをexact照合し、全terminalでpartial 0、exactly-one receipt、同一reconcile同receipt、成功時だけ固定count | `tests/python-result-commit-transaction.test.ts` |

`advancePythonWorkerProtocol`の公開API ownerは`U-PYWR-006`だけである。`U-PYWR-007`は
`payload_identity_guard` composition mutationのsupporting oracleとして実行し、第2 ownerとして数えない。

### `U-PYWR-017`のstable exact function composition

| exact function | input | 固有mutation | 個別oracle |
|---|---|---|---|
| `commitAcceptedPythonWorkerResult` | `AcceptedWorkerCommitBundleV1` | `accepted_result_commit` | accepted固定append順、各step fault rollback、CAS/idempotency |
| `commitPythonWorkerTerminal` | `TerminalWorkerCommitBundleV1` | `non_accepted_terminal_commit` | 4種non-accepted terminalごとのauthoritative result 0とexactly-one receipt |
| `reconcilePythonWorkerTerminal` | `TerminalWorkerReconcileBundleV1` | `terminal_reconcile` | immutable evidence不一致を拒否し、同一bundleは同一receiptへ収束 |

この3実行の論理積を`U-PYWR-017`の合格条件とし、一部関数のgreenで代替しない。

### canonical assertion primary表

次表がHST-HIL-007のprimary unit採点表である。上の17 oracleは関数別mutationを共有するsupporting実行表であり、
case単位のstate/failure合否と18/18分母は次表だけから算出する。supporting主ITはL8へのtraceである。

| HST正本 | 主U | 主API | supporting主IT | pre_state | expected_state | failure正本 |
|---|---|---|---|---|---|---|
| `HST-CASE-007-01` | `U-PYWR-015` | `commitPythonWorkerResult` | `IT-PYWR-001` | `queued` | `committed` | `なし（正常系）` |
| `HST-CASE-007-02` | `U-PYWR-002` | `negotiatePythonWorkerProtocol` | `IT-PYWR-002` | `queued` | `quarantined` | `HIL_WORKER_PROTOCOL_VERSION_UNSUPPORTED` |
| `HST-CASE-007-03` | `U-PYWR-005` | `parsePythonWorkerEnvelope` | `IT-PYWR-002` | `running` | `quarantined` | `HIL_WORKER_JSON_INVALID` |
| `HST-CASE-007-04` | `U-PYWR-005` | `parsePythonWorkerEnvelope` | `IT-PYWR-003` | `queued` | `quarantined` | `HIL_WORKER_PAYLOAD_OVERSIZE` |
| `HST-CASE-007-05` | `U-PYWR-006` | `advancePythonWorkerProtocol` | `IT-PYWR-002` | `running` | `quarantined` | `HIL_WORKER_SEQUENCE_GAP` |
| `HST-CASE-007-06` | `U-PYWR-010` | `observePythonWorkerExit` | `IT-PYWR-004` | `running` | `failed` | `HIL_WORKER_TIMEOUT` |
| `HST-CASE-007-07` | `U-PYWR-009` | `requestPythonWorkerCancellation` | `IT-PYWR-004` | `running` | `cancelled` | `HIL_WORKER_CANCELLED` |
| `HST-CASE-007-08` | `U-PYWR-010` | `observePythonWorkerExit` | `IT-PYWR-005` | `running` | `failed` | `HIL_WORKER_CRASHED` |
| `HST-CASE-007-09` | `U-PYWR-008` | `applyWorkerFlowControl` | `IT-PYWR-003` | `running` | `quarantined` | `HIL_WORKER_BACKPRESSURE_EXCEEDED` |
| `HST-CASE-007-10` | `U-PYWR-010` | `observePythonWorkerExit` | `IT-PYWR-005` | `running` | `failed` | `HIL_WORKER_PARENT_LOST` |
| `HST-CASE-007-11` | `U-PYWR-011` | `fencePythonWorkerResult` | `IT-PYWR-006` | `running` | `running` | `HIL_WORKER_LATE_RESULT_FENCED` |
| `HST-CASE-007-12` | `U-PYWR-007` | `advancePythonWorkerProtocol` | `IT-PYWR-002` | `accepted` | `quarantined` | `HIL_WORKER_PAYLOAD_DIGEST_MISMATCH` |
| `HST-CASE-007-13` | `U-PYWR-016` | `recordWorkerTerminalReceipt` | `IT-PYWR-008` | `assertion_input_ready` | `assertion_pass` | `HIL_WORKER_PROTOCOL_INVALID` |
| `HST-CASE-007-14` | `U-PYWR-004` | `spawnPythonWorker` | `IT-PYWR-007` | `assertion_input_ready` | `assertion_pass` | `HIL_PYTHON_PLANE_BOUNDARY_INVALID` |
| `HST-CASE-007-15` | `U-PYWR-014` | `assertPythonProposalOnlyAuthority` | `IT-PYWR-007` | `assertion_input_ready` | `assertion_pass` | `HIL_DB_WRITE_AUTHORITY_INVALID` |
| `HST-CASE-007-16` | `U-PYWR-005` | `parsePythonWorkerEnvelope` | `IT-PYWR-002` | `assertion_input_ready` | `assertion_pass` | `HIL_IPC_ENVELOPE_INVALID` |
| `HST-CASE-007-17` | `U-PYWR-014` | `assertPythonProposalOnlyAuthority` | `IT-PYWR-007` | `assertion_input_ready` | `assertion_pass` | `HIL_RESULT_WRITE_AUTHORITY_INVALID` |
| `HST-CASE-007-18` | `U-PYWR-016` | `recordWorkerTerminalReceipt` | `IT-PYWR-008` | `assertion_input_ready` | `assertion_pass` | `HIL_IPC_FAIL_OPEN` |

## 合否

17/17について正常値だけでなく表中の全mutationを実行し、期待failure code、state不変、authoritative write count、
event/projection/artifact digestを直接assertする。range表記だけでoracleを消込まず、L6 §1の各API行と本表のIDを
相互参照する。

fake clock、fake process、in-memory portは単体境界に利用できるが、process終了やDB rollbackをmockの戻り値だけで
合格させない。それらはL8 pairの実process/fault-injectionへcarryする。全caseは未実装である。

---
title: "HELIX L9 結合テスト設計 — Python worker runtime"
layer: L5
executed_at_layer: L8
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
pair_artifact: docs/design/helix/L5-detail/python-worker-runtime.md
next_pair_freeze: L5
requirements:
  - HR-FR-HIL-12
  - HAC-HIL-12a
  - HAC-HIL-12b
  - HAC-HIL-12c
---

# HELIX L9 結合テスト設計 — Python worker runtime

## §0 共通evidence

全caseでNode/Python version、worker descriptor、capability class、registry revision/digest、protocol/request/result schema、entrypoint/resource policy、input/config、
lease/fence、command、exit code、stdout/stderr、proposal set、artifact、event chain、DB queryのdigestを固定する。
Pythonが返すresultはproposalであり、Node validationとtransaction前のrowをauthoritative件数へ算入しない。

| ID | L5 pointer | L3/HST trace | 結合scenario | 期待結果／evidence |
|---|---|---|---|---|
| `IT-PYWR-001` | §2、§3、§5 | `HAC-HIL-12a`; `HST-CASE-007-01` | 2種以上のcapability classでcompatible workerをexactly-one解決し複数result proposalを返す | `なし（正常系）`。request/run/staged/terminalのclass＋registry digest一致、handshake、Node commit、terminal receiptが各一回 |
| `IT-PYWR-002` | §2、§3、§6 | `HAC-HIL-12b`; `HST-CASE-007-02`, `HST-CASE-007-03`, `HST-CASE-007-05`, `HST-CASE-007-12`, `HST-CASE-007-16` | unknown／ambiguous／inactive／cross-class descriptor、request→resolution→run→staged→terminal各hopのclass／registry／resolution差替え、unsupported major、不正JSON、sequence/digest違反を個別mutation | capability/hop違反は`HIL_PYTHON_PLANE_BOUNDARY_INVALID`、spawn/stage/commit 0。protocol違反は既定のexact failure code、authoritative増分0 |
| `IT-PYWR-003` | §3.2、§6 | `HAC-HIL-12b`; `HST-CASE-007-04`, `HST-CASE-007-09` | request/frame/result/stderr oversizeとbounded queue飽和を個別投入 | `HIL_WORKER_PAYLOAD_OVERSIZE`または`HIL_WORKER_BACKPRESSURE_EXCEEDED`、process停止、partial/current 0 |
| `IT-PYWR-004` | §4、§6 | `HAC-HIL-12b`, `HAC-HIL-12c`; `HST-CASE-007-06`, `HST-CASE-007-07` | deadline無応答と明示cancelを個別実行 | `HIL_WORKER_TIMEOUT`または`HIL_WORKER_CANCELLED`、exactly-one terminal receipt、commit 0 |
| `IT-PYWR-005` | §1、§4、§6 | `HAC-HIL-12b`; `HST-CASE-007-08`, `HST-CASE-007-10` | worker crashとparent ownership喪失を個別発生 | `HIL_WORKER_CRASHED`または`HIL_WORKER_PARENT_LOST`、process group残存0 |
| `IT-PYWR-006` | §4、§5、§6 | `HAC-HIL-12c`; `HST-CASE-007-11` | lease再割当後に旧workerがvalid resultを返す | `HIL_WORKER_LATE_RESULT_FENCED`、新owner state不変、旧result commit 0、再開は新run/checkpointから |
| `IT-PYWR-007` | §1、§5、§6 | `HAC-HIL-12c`; `HST-CASE-007-14`, `HST-CASE-007-15`, `HST-CASE-007-17`, `HST-CASE-008-12` | Pythonからharness.db、repo、`.helix/`、current pointerへ直接writeを試行 | pointer別に`HIL_PYTHON_PLANE_BOUNDARY_INVALID`, `HIL_DB_WRITE_AUTHORITY_INVALID`, `HIL_RESULT_WRITE_AUTHORITY_INVALID`, `HIL_PYTHON_AUTHORITY_BYPASS`、authoritative増分0 |
| `IT-PYWR-008` | §5、§7 | `HAC-HIL-12a`, `HAC-HIL-12c`; `HST-CASE-007-13`, `HST-CASE-007-18`, `HST-CASE-009-08` | result schema違反、同一result再送、artifact/event/projection faultを個別投入 | `HIL_WORKER_RESULT_SCHEMA_INVALID`, `HIL_WORKER_RESULT_COMMIT_FAILED`, `HIL_WORKER_PROTOCOL_INVALID`, `HIL_DB_PROJECTION_BOUNDARY_INVALID`。`HIL_IPC_FAIL_OPEN`は0 |
| `IT-PYWR-009` | §5の`commitAcceptedPythonWorkerResult`、`commitPythonWorkerTerminal`、`reconcilePythonWorkerTerminal` | `HAC-HIL-12a`, `HAC-HIL-12c`; `U-PYWR-017` | 3関数と固有mutationを固定し、acceptedおよびfailed/quarantined/cancelled/timed_outの各append直後faultとreconcileを個別注入 | 全terminalでpartial 0、exactly-one receipt。同一reconcile同receipt、成功時だけ固定順各1 |

### §0.1 公開API→U→IT exact join

| 公開API | L7 oracle | L8 oracle |
|---|---|---|
| `parsePythonWorkerDescriptor` | `U-PYWR-001` | `IT-PYWR-001`, `IT-PYWR-002` |
| `resolvePythonWorkerDescriptor` | `U-PYWR-001` | `IT-PYWR-001`, `IT-PYWR-002` |
| `negotiatePythonWorkerProtocol` | `U-PYWR-002` | `IT-PYWR-002` |
| `createPythonWorkerRun` | `U-PYWR-003` | `IT-PYWR-001`, `IT-PYWR-002` |
| `spawnPythonWorker` | `U-PYWR-004` | `IT-PYWR-007` |
| `parsePythonWorkerEnvelope` | `U-PYWR-005` | `IT-PYWR-002`, `IT-PYWR-003` |
| `advancePythonWorkerProtocol` | `U-PYWR-006` | `IT-PYWR-002` |
| `applyWorkerFlowControl` | `U-PYWR-008` | `IT-PYWR-003` |
| `requestPythonWorkerCancellation` | `U-PYWR-009` | `IT-PYWR-004` |
| `observePythonWorkerExit` | `U-PYWR-010` | `IT-PYWR-004`, `IT-PYWR-005` |
| `fencePythonWorkerResult` | `U-PYWR-011` | `IT-PYWR-006` |
| `stagePythonWorkerResult` | `U-PYWR-012` | `IT-PYWR-008` |
| `validateWorkerOutputArtifacts` | `U-PYWR-013` | `IT-PYWR-007`, `IT-PYWR-008` |
| `assertPythonProposalOnlyAuthority` | `U-PYWR-014` | `IT-PYWR-007` |
| `commitPythonWorkerResult` | `U-PYWR-015` | `IT-PYWR-001`, `IT-PYWR-008` |
| `recordWorkerTerminalReceipt` | `U-PYWR-016` | `IT-PYWR-008` |
| `commitAcceptedPythonWorkerResult` | `U-PYWR-017` | `IT-PYWR-009` |
| `commitPythonWorkerTerminal` | `U-PYWR-017` | `IT-PYWR-009` |
| `reconcilePythonWorkerTerminal` | `U-PYWR-017` | `IT-PYWR-009` |
| `reconcilePythonWorkerRun` | `U-PYWR-015` | `IT-PYWR-008` |

`U-PYWR-007`は`advancePythonWorkerProtocol`の`payload_identity_guard` composition mutationを所有する
supporting oracleであり、公開API owner joinへ重複加算しない。`HST-CASE-007-12`の主Uと17 unit分母は維持する。

### §0.2 canonical assertion primary表

次表がHST-HIL-007のprimary integration採点表である。上の9件はscenarioを共有するsupporting実行表であり、
caseごとのstate/failure合否と18/18分母は次表だけから算出する。主UはL7への追跡参照である。

| HST正本 | 主IT | supporting主U | pre_state | expected_state | failure正本 |
|---|---|---|---|---|---|
| `HST-CASE-007-01` | `IT-PYWR-001` | `U-PYWR-015` | `queued` | `committed` | `なし（正常系）` |
| `HST-CASE-007-02` | `IT-PYWR-002` | `U-PYWR-002` | `queued` | `quarantined` | `HIL_WORKER_PROTOCOL_VERSION_UNSUPPORTED` |
| `HST-CASE-007-03` | `IT-PYWR-002` | `U-PYWR-005` | `running` | `quarantined` | `HIL_WORKER_JSON_INVALID` |
| `HST-CASE-007-04` | `IT-PYWR-003` | `U-PYWR-005` | `queued` | `quarantined` | `HIL_WORKER_PAYLOAD_OVERSIZE` |
| `HST-CASE-007-05` | `IT-PYWR-002` | `U-PYWR-006` | `running` | `quarantined` | `HIL_WORKER_SEQUENCE_GAP` |
| `HST-CASE-007-06` | `IT-PYWR-004` | `U-PYWR-010` | `running` | `failed` | `HIL_WORKER_TIMEOUT` |
| `HST-CASE-007-07` | `IT-PYWR-004` | `U-PYWR-009` | `running` | `cancelled` | `HIL_WORKER_CANCELLED` |
| `HST-CASE-007-08` | `IT-PYWR-005` | `U-PYWR-010` | `running` | `failed` | `HIL_WORKER_CRASHED` |
| `HST-CASE-007-09` | `IT-PYWR-003` | `U-PYWR-008` | `running` | `quarantined` | `HIL_WORKER_BACKPRESSURE_EXCEEDED` |
| `HST-CASE-007-10` | `IT-PYWR-005` | `U-PYWR-010` | `running` | `failed` | `HIL_WORKER_PARENT_LOST` |
| `HST-CASE-007-11` | `IT-PYWR-006` | `U-PYWR-011` | `running` | `running` | `HIL_WORKER_LATE_RESULT_FENCED` |
| `HST-CASE-007-12` | `IT-PYWR-002` | `U-PYWR-007` | `accepted` | `quarantined` | `HIL_WORKER_PAYLOAD_DIGEST_MISMATCH` |
| `HST-CASE-007-13` | `IT-PYWR-008` | `U-PYWR-016` | `assertion_input_ready` | `assertion_pass` | `HIL_WORKER_PROTOCOL_INVALID` |
| `HST-CASE-007-14` | `IT-PYWR-007` | `U-PYWR-004` | `assertion_input_ready` | `assertion_pass` | `HIL_PYTHON_PLANE_BOUNDARY_INVALID` |
| `HST-CASE-007-15` | `IT-PYWR-007` | `U-PYWR-014` | `assertion_input_ready` | `assertion_pass` | `HIL_DB_WRITE_AUTHORITY_INVALID` |
| `HST-CASE-007-16` | `IT-PYWR-002` | `U-PYWR-005` | `assertion_input_ready` | `assertion_pass` | `HIL_IPC_ENVELOPE_INVALID` |
| `HST-CASE-007-17` | `IT-PYWR-007` | `U-PYWR-014` | `assertion_input_ready` | `assertion_pass` | `HIL_RESULT_WRITE_AUTHORITY_INVALID` |
| `HST-CASE-007-18` | `IT-PYWR-008` | `U-PYWR-016` | `assertion_input_ready` | `assertion_pass` | `HIL_IPC_FAIL_OPEN` |

## §1 合否

9/9をLinux primaryの実processで実行し、上表のmutationを省略しない。各caseは期待failure code、terminal receipt
exactly-one、partial authoritative write 0、process group残存0、artifact/event/projection digestをassertする。
consumer固有のatom/detector/product result内容は対象外だが、少なくとも二つの異なるstrict result schemaを通し、
runtimeが特定consumerへ結合していないことを確認する。

mock processだけ、system assertion IDの引用だけ、終了codeだけの確認ではL8合格にしない。全caseは未実装である。

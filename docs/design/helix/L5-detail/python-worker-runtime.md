---
title: "HELIX L5 詳細設計 — Python worker runtime"
layer: L5
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
pair_artifact: docs/test-design/helix/L5-python-worker-runtime-integration-test-design.md
next_pair_freeze: L8
requirements:
  - HR-FR-HIL-12
  - HAC-HIL-12a
  - HAC-HIL-12b
  - HAC-HIL-12c
---

# HELIX L5 詳細設計 — Python worker runtime

## §0 適用境界

本設計は、Node control planeがPython data/detection workerを起動し、versioned JSON Lines over stdioで
監督し、検証済みresult proposalだけをNode authorityでcommitする共通runtimeを扱う。Pythonを
harness.db、repository正本、immutable artifact、Gate、current pointerのwriterにはしない。

Pythonの出力は常に**非authoritative proposal**である。atom extractor、document engine、detector、product-data
projectionなどのconsumerは本runtimeを利用するが、各domain固有のproposal schema、atomic split、採否、detector
finding、product-data policyは各consumer設計の責務とする。本設計はsource capture、source classification、atom ID、
semantic signature、coverage decisionを再実装しない。

既存のsource atomization pairにある`PythonExtractorAdapter`は本runtimeのclientであり、独自process lifecycleや
別IPCを持たない。Node/Bun cutover全体、Python dependency packaging、network sandbox、外部service接続は本sliceの
完了主張に含めない。

ADR-009はclosed capability classのproposal-only Python workerをtargetとしてacceptedとした。ただし本書はdraftであり、
Python version、interpreter provenance、package／lock、worker root／entrypoint、wheel／sdist、SBOM／licenseが未freezeである。
対応するForward PLAN、pair-freeze、Node minimum、HDS-HIL-14 supply-chain gateなしに実装・active化しない。

## §1 componentとauthority

| component | 責務 | authority | L8 oracle |
|---|---|---|---|
| `PythonWorkerRegistry` | worker ID/version、closed capability class、protocol、entrypoint digest、request/result schema、resource policyをallowlist | registry eventだけ | `IT-PYWR-001, IT-PYWR-002` |
| `PythonWorkerBroker` | lease、fence、process、handshake、deadline、cancel、backpressure、terminal化を監督 | worker run/eventだけ | `IT-PYWR-001`, `IT-PYWR-002`, `IT-PYWR-003`, `IT-PYWR-004`, `IT-PYWR-005`, `IT-PYWR-006` |
| `WorkerSandboxPort` | executable、cwd、environment、read/write root、process group、resource limitを適用 |隔離された一時領域だけ | `IT-PYWR-003, IT-PYWR-005, IT-PYWR-007` |
| `JsonLinesProtocolPort` | stdout frameをstrict parseし、sequence、digest、size、typeを検証 | validated frameだけ | `IT-PYWR-001`, `IT-PYWR-002`, `IT-PYWR-003`, `IT-PYWR-004` |
| `ResultIngestionPort` | terminal complete後にresult schema、provenance、artifact digest、lease/fenceを再検証 | staged proposalだけ | `IT-PYWR-001, IT-PYWR-006, IT-PYWR-008` |
| `HarnessDbPort` | event appendとprojectionを一つのNode transactionでcommit | harness.dbの唯一writer | `IT-PYWR-001, IT-PYWR-007, IT-PYWR-008` |
| `WorkerTerminalReceiptStore` | exactly-one terminal receiptをappend-only保存 | receipt eventだけ | `IT-PYWR-001`, `IT-PYWR-002`, `IT-PYWR-003`, `IT-PYWR-004`, `IT-PYWR-005`, `IT-PYWR-006`, `IT-PYWR-007`, `IT-PYWR-008` |

Python processはDB pathやcredentialを受け取らず、content-addressed read-only inputとrun専用write directoryだけを
受け取る。write directory内のresultも正本ではなく、Nodeがbytes、relative path、size、digest、schemaを検証して
commitした後にだけauthoritative projectionから参照できる。

Linux primaryではOS sandboxでrepository、`.helix/`、`harness.db`、capture/atomization正本へのwriteを拒否する。
同等のwrite denyを機械証明できないcompatibility環境はruntime完了をgreenにせず、capability unavailableとして
fail-closeする。Python側の「書かなかった」という自己申告はauthority evidenceにしない。

## §2 registryと起動契約

worker descriptorの型正本はL6 §2の`PythonWorkerDescriptorV1`だけとし、L5で同名型を再宣言しない。
registryは少なくとも次をexact joinして固定する。

| field群 | L5拘束 |
|---|---|
| 識別 | `schema_version`、worker ID/version、descriptor digest、registry revision/digestを固定 |
| capability | `source_atomization / document_engine / detector / product_data / analysis`のclosed listからexactly oneを選択 |
| protocol | majorと互換minor min/maxを固定。単一minorへの縮退禁止 |
| 実行 | entrypoint＋digest、Python runtime、input kindを固定 |
| schema／policy | request/result schema、resource policy ID＋digestを固定 |

Nodeはrequested capability、worker ID/version、registry revisionからactive descriptorをexactly-one解決し、descriptorだけでなく
requested class、registry revision/digest、resolution digestを持つresolution receiptをrunへ渡す。0件、複数件、
inactive、class不一致、descriptor digest drift、未知／複数／alias capabilityは
`HIL_PYTHON_PLANE_BOUNDARY_INVALID`でspawn前に拒否する。capability追加はADR-009のRedesignを先行させる。

Nodeはallowlist済みdescriptorをstable IDでexactly-one解決し、shellを介さずargv配列でprocessを起動する。
working directoryはrun固有temp、environmentはallowlist、stdin/stdout/stderrはpipe、process groupはrun専用とする。
descriptor、schema、entrypoint、runtime、resource policyのdigest差異は新しいrun identityを必要とし、過去のgreen
receiptを再利用しない。

## §3 JSON Lines通信規約

### §3.1 envelope

stdoutはprotocol専用とし、一行一object、UTF-8、BOMなし、LF、最大line/payload制限ありとする。診断はstderrへ
送り、stderrもsize上限とdigestを持つ。envelope型の正本もL6 §2の`PythonWorkerEnvelopeV1`だけとする。
必須fieldはschema/protocol version、run/request ID、方向別type/sequence、deadline、lease/fence、payload digest/payloadであり、
L5側で同名型を複製しない。

正規sequenceはNode `hello(0)`、Python `hello_ack(0)`、Node `request(1)`、Python `progress|result(1..N)`、
Python `complete|error|cancelled(N+1)`である。方向ごとにstrict monotonicとし、欠番、重複、巻戻り、terminal後frame、
unknown typeを拒否する。minor versionは双方が宣言した互換範囲の共通最大値、major不一致は起動前quarantineとする。

`result`はproposal chunkであり、受信時にはcommitしない。`complete`の`result_set_digest`、件数、schema、全chunk
digestが一致した場合だけ`result_staged`へ進む。不正JSON、stdoutへのlog混入、payload digest不一致、oversize、
schema違反、complete欠落はrun全体をfail-closeし、部分proposalを破棄する。

### §3.2 流量制御

Nodeはbounded message/byte queueを持ち、high-water markでpipe readをpause、low-water markでresumeする。workerが
deadline内に解消しない、単一frame/累積result/diagnosticが上限を超える、またはqueue ownershipを失った場合は
process groupを停止し、proposal commitを0件にする。progress frameはevidenceであり、result件数や完了率へ算入しない。

## §4 実行状態、取消、fencing

```text
queued -> leased -> starting -> negotiating -> running -> result_staged -> committed
                                      |             |             |
                                      +-> failed ---+-------------+
                                      +-> quarantined
                                      +-> cancelled
                                      +-> timed_out
```

`committed/failed/quarantined/cancelled/timed_out`はterminalで、runごとexactly-one terminal receiptを持つ。
crash、parent ownership喪失、protocol違反もterminal eventへ正規化し、例外だけを残さない。

cancelはNodeが`cancel`を一回送信し、grace期間内の`cancelled`を待つ。deadline到来、応答なし、crash、parent喪失では
process groupへTERM相当を送り、grace超過後KILL相当へ昇格する。cancel/timeout/lease再割当時にfence tokenを失効し、
その後のresultはbytesが正しくても`HIL_WORKER_LATE_RESULT_FENCED`で拒否する。新ownerは新runまたはdurable
checkpointから再開し、旧runのsequenceを継続しない。

## §5 proposal ingestionとtransaction

commit前にNodeは次を全て再検証する。

1. run、request、worker/version、protocol、lease、fence、deadlineがcurrentである。
2. request/input/config/schema/resource-policy digestがrun recordと一致する。
3. exactly-one terminal `complete`と全result chunk、件数、set digestが一致する。
4. consumerのstrict result schemaとprovenance必須fieldへ適合する。
5. artifact relative pathがrun output root内で、symlink、absolute path、`..`、重複pathを含まない。
6. idempotency key `(run_id, request_id, result_set_digest)`が未commit、または同一commitを指す。

Nodeは検証済みproposalをstaging artifactへsealした後、`worker result accepted` event、consumer event、projection、
terminal receiptを`HarnessDbPort`の一transactionでcommitする。DB transaction失敗時はauthoritative rowとcurrent pointerを
0件に保ち、immutable staging evidenceから再試行できる。artifact publishとDBを偽のdistributed transactionとして
説明せず、artifact-first、event/projection transaction、reconciliationの順序をreceiptへ残す。

accepted resultのauthoritative commitは`AcceptedWorkerCommitBundleV1`と
`commitAcceptedPythonWorkerResult`だけが行う。
bundleはoperation/idempotency/result digest、expected run/projection revision、accepted event、consumer event、projection mutation、
terminal receipt、固定append順とwrite-set digestを持つ。append順は`accepted_event -> consumer_event -> projection -> terminal_receipt -> commit_receipt`で、
両event間を含む各append直後faultは全rollbackする。成功receiptはbefore/after revision、event sequence、table別countを返し、
同key同digest再送は元receiptと増分0、異digest/CAS不一致はauthoritative/terminal増分0とする。個別event/receipt store APIは公開しない。

`U-PYWR-017`が検証するtransaction function setは次の3件に固定する。accepted commit、non-accepted terminal commit、
terminal reconcileは固有mutationを持ち、一つの曖昧なcommit/reconcile APIへ畳み込まない。

| exact function | bundle | 固有mutation | composition責務 |
|---|---|---|---|
| `commitAcceptedPythonWorkerResult` | `AcceptedWorkerCommitBundleV1` | `accepted_result_commit` | accepted/consumer event、projection、terminal/commit receiptを固定順commit |
| `commitPythonWorkerTerminal` | `TerminalWorkerCommitBundleV1` | `non_accepted_terminal_commit` | failed/quarantined/cancelled/timed_outをauthoritative result 0でcommit |
| `reconcilePythonWorkerTerminal` | `TerminalWorkerReconcileBundleV1` | `terminal_reconcile` | immutable evidenceと同一operation/digest/revisionだけを収束 |

| legacy composition API | single owner U | owner IT | mutation責務 |
|---|---|---|---|
| `commitPythonWorkerResult` | `U-PYWR-015` | `IT-PYWR-001`, `IT-PYWR-008` | accepted bundle、idempotency、commit前検証 |
| `reconcilePythonWorkerRun` | `U-PYWR-015` | `IT-PYWR-008` | immutable evidenceからmissing projectionを再構築 |
| `recordWorkerTerminalReceipt` | `U-PYWR-016` | `IT-PYWR-008` | runごとのexactly-one terminal receipt |

projection rebuild mutationは`U-PYWR-015`だけが所有し、`U-PYWR-016`はterminal receiptのexactly-onceを所有する。
`U-PYWR-017`の3関数composition、17 unit、9 integrationの分母は変更しない。

`advancePythonWorkerProtocol`の公開API ownerは`U-PYWR-006`だけとし、`U-PYWR-007`は
`payload_identity_guard` composition mutationを所有するsupporting oracleとする。これによりAPI ownerを一意化しつつ、
`HST-CASE-007-12`の主Uと17 unit分母を維持する。

## §6 失敗契約

| failure code | 条件 | terminal／副作用 |
|---|---|---|
| `HIL_WORKER_PROTOCOL_INVALID` | terminal receiptまたはprotocol集約契約が不正 | `quarantined`、partial/current増分0 |
| `HIL_WORKER_PROTOCOL_VERSION_UNSUPPORTED` | protocol major不一致 | `quarantined`、request送信0 |
| `HIL_WORKER_JSON_INVALID` | stdoutがJSONLでない、log混入 | `quarantined`、proposal commit 0 |
| `HIL_WORKER_PAYLOAD_OVERSIZE` | request/frame/result/stderr上限超過 | dispatchまたはrun停止、commit 0 |
| `HIL_WORKER_SEQUENCE_GAP` | 欠番、重複、巻戻り、terminal後frame | `quarantined`、commit 0 |
| `HIL_WORKER_PAYLOAD_DIGEST_MISMATCH` | envelope/content digest不一致 | `quarantined`、worker処理またはcommit 0 |
| `HIL_WORKER_RESULT_SCHEMA_INVALID` | complete/resultがconsumer schema不適合 | `quarantined`、commit 0 |
| `HIL_WORKER_TIMEOUT` | deadline超過 | `timed_out`、TERM/KILL receipt、commit 0 |
| `HIL_WORKER_CANCELLED` | Node cancelまたはworker acknowledgement | `cancelled`、commit 0 |
| `HIL_WORKER_CRASHED` | 非正常process終了 | `failed`、staged proposal昇格0 |
| `HIL_WORKER_BACKPRESSURE_EXCEEDED` | bounded queueを期限内に解消不能 | `quarantined`、process停止、commit 0 |
| `HIL_WORKER_PARENT_LOST` | parent ownership／heartbeat失効 | `failed`、process group停止、commit 0 |
| `HIL_WORKER_LATE_RESULT_FENCED` | lease/fence失効後のresult | 現run状態不変、commit 0、finding追加 |
| `HIL_PYTHON_PLANE_BOUNDARY_INVALID` | spawnまたはsandboxがPython plane境界外 | spawnまたはrun拒否、authoritative増分0 |
| `HIL_PYTHON_AUTHORITY_BYPASS` | Pythonが保護root/DB/repoへwrite企図 | `quarantined`、authoritative増分0 |
| `HIL_DB_WRITE_AUTHORITY_INVALID` | Pythonがharness.dbへの直接writeを企図 | transaction拒否、DB増分0 |
| `HIL_RESULT_WRITE_AUTHORITY_INVALID` | Node外commit、未検証/partial result commit | transaction拒否、projection増分0 |
| `HIL_WORKER_RESULT_COMMIT_FAILED` | artifact/DB reconciliationまたはtransaction失敗 | current増分0、再試行可能 |
| `HIL_IPC_ENVELOPE_INVALID` | JSONL envelopeの境界schemaまたは必須fieldが不正 | `quarantined`、proposal commit 0 |
| `HIL_IPC_FAIL_OPEN` | 上記異常後にpartial/currentが生じた | runtime Gate失敗、完了claim 0 |

`HIL_DB_PROJECTION_BOUNDARY_INVALID`はconsumer側projection assertionであり、本runtimeのfailure unionには含めない。
上表の境界codeは詳細causeを失わず`WorkerFailureV1`へ正規化する。

L6の`WorkerFailureCodeV1`は上表20件だけをexact allowlistとする。

## §7 traceとfreeze条件

| L3 AC | L5契約 | L8 oracle |
|---|---|---|
| `HAC-HIL-12a` | §2、§3、§5の正常proposalをNodeがexactly-once commit | `IT-PYWR-001, IT-PYWR-008` |
| `HAC-HIL-12b` | §3、§4、§6のIPC異常をterminal化しpartial 0 | `IT-PYWR-002`, `IT-PYWR-003`, `IT-PYWR-004`, `IT-PYWR-005` |
| `HAC-HIL-12c` | §1、§4、§5のcancel/timeout/late/direct-write拒否 | `IT-PYWR-004`, `IT-PYWR-005`, `IT-PYWR-006`, `IT-PYWR-007`, `IT-PYWR-008` |

### §7.1 canonical assertion primary表

次表はHST-HIL-007の18件をL8の主ITへ一意にbindするprimary採点表である。主UはL6/L7へのsupporting参照であり、
L5/L8のcase分母や合否を重複加算しない。range表記でcaseを束ねず、各行でstateとfailureを同時に固定する。

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

L5/L8 pairは9 integration oracleが全て実行され、各failure code、terminal receipt、process exit、artifact digest、
DB query digest、authoritative write count、別runtime reviewが揃うまでdraftとする。mock workerが正常値を返したこと、
Python unit testだけ、prose上のauthority分離だけではfreezeしない。

acceptedだけでなくfailed/quarantined/cancelled/timed_outもterminal event、projection、terminal receipt、commit receiptを
atomic bundle/storeへ閉じる。全terminalでexactly-one receipt、fault後同一bundle reconcile、partial write 0を要求する。

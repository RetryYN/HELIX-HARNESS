---
title: "HELIX L5 詳細設計 — engine / detector execution"
layer: L5
kind: add-design
status: draft
created: 2026-07-15
updated: 2026-07-15
owner: Codex / TL
plan: PLAN-L1-07-infinity-loop-platform-requirements
slice_id: HDS-HIL-10
related_l3: docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md
related_l4: docs/design/helix/L4-basic-design/infinity-loop-platform-basic-design.md
depends_on:
  - docs/design/helix/L5-detail/source-capability-capture.md
  - docs/design/helix/L5-detail/source-capability-atomization-closure.md
  - docs/design/helix/L5-detail/python-worker-runtime.md
design_slice: HDS-HIL-10
related_hst:
  - HST-HIL-008
  - HST-HIL-009
pair_artifact: docs/test-design/helix/L5-engine-detector-execution-integration-test-design.md
next_pair_freeze: L8
requirements:
  - HR-FR-HIL-10
  - HAC-HIL-10a
  - HAC-HIL-10b
  - HAC-HIL-10c
  - HIL-FR-15
  - HIL-FR-25
  - HIL-FR-26
  - HIL-TR-03
  - HIL-TR-10
  - HIL-NFR-08
  - HIL-NFR-13
system_tests:
  - HST-HIL-008
  - HST-HIL-009
---

# HELIX L5 詳細設計 — engine / detector execution

## §0 責務境界

本sliceは、source captureで固定されたsnapshotと、source atomizationで採否されたZIP由来capabilityを入力に、
versioned registryからcore engineまたはdetectorをexactly-one解決し、同じversion/config/inputから決定的な結果を得る。
engineはartifactを生成し、detectorはfindingを生成する。両者を同じrun、table、authorityへ混載しない。

ZIPの29 Python toolはfile単位のpreliminary dispositionであり、全fileを一つの万能engineとして登録しない。
build、agent metadata、trace、impact、assignment、schedule、render/package等は原子化済みengine capabilityへ、
schema、spec、trace、consistency、file、metadata検査は原子化済みdetector capabilityへ結ぶ。`selftest.py`は
verification capabilityであり、engine/detectorの自己承認authorityにしない。

Python workerは共通`PythonWorkerBroker`を利用するproposal producerであり、artifact registry、finding ledger、
event、projection、Gateへ直接writeしない。Node coordinatorだけがschema、digest、fence、version、provenanceを再検証し、
正本へcommitする。本書はdraftであり、ZIP Pythonのbulk port、実装、registry active化を行わない。

## §1 registryと固定実行identity

| registry | 一意key | 必須field | fail-close |
|---|---|---|---|
| `engine_versions` | engine ID＋version | capability atom、runtime/worker、entrypoint/package/schema/config digest、owner、status | 0/複数候補、非active、digest不一致 |
| `detector_versions` | detector ID＋version | capability atom、rule/config/result schema digest、severity policy、owner、status | 0/複数候補、非active、policy不明 |

run identityは`kind + capability ID + exact version + source snapshot digest + atomization revision + current adoption decision digest +
coverage receipt digest + DB relation root digest + config digest + input-set digest + schema/protocol major + normalization version`の
canonical serializationから導出する。各authority値はatomization/current projectionからNodeが解決し、caller自己申告を採用しない。
時刻、PID、temp path、OS separator、
列挙順は含めない。同じidempotency keyへ異なるidentityが来た場合は`HIL_RUN_IDEMPOTENCY_CONFLICT`でlease前に拒否する。
未登録、draft、retired、互換major不明のversionはすべて`HIL_REGISTRY_VERSION_UNKNOWN`でfail-closeする。

configはregistryが許可したschemaにstrict適合し、default展開後のcanonical digestを使う。呼出側の自由文設定、
環境変数の暗黙default、current HEADの再読込を禁止し、固定snapshotのcontent-addressed inputだけをworkerへ渡す。

## §2 run状態とauthority分離

engine/detectorは別run aggregateを持つが、状態語彙は
`queued -> leased -> running -> result_staged -> committed`を共有する。異常terminalは`failed/cancelled/quarantined`。
terminalからの遷移、旧fence、stage前commit、terminal receipt 0/複数を拒否する。

| aggregate | staged proposal | 正本authority | 禁止事項 |
|---|---|---|---|
| engine | artifact manifest、bytes digest、exit、provenance | `engine_artifacts`＋artifact registry参照 | findingをartifactで代用、workerによるcurrent化 |
| detector | structured finding、evidence digest、severity、location、subject | `detector_findings`＋occurrence | artifact tableへfindingを保存、prose PASS |

artifact bytesはrun専用rootへ出力させ、Nodeがrelative path、symlink、size、schema、digestを検証してcontent-addressed stagingへ
sealする。artifact bytesとSQLiteを同一transactionと偽称しない。seal済みbytesはまだ非currentであり、その後のNode DB
transactionでterminal run、artifact/finding行、event、provenance edgeを全件commitする。DB rollback時の正本増分は0件とし、
orphan stagingはreceipt付きreconcile/GC対象にする。current pointerはDB commit後だけ更新する。

## §3 engine artifact契約

engine resultはrun/version/input/config、exit status、artifact count/set digestを持つ。各artifactはkind、safe relative path、
media/schema version、size、content digest、source provenanceを必須とする。absolute path、`..`、NUL、symlink escape、
manifest外bytesを`HIL_ARTIFACT_PATH_ESCAPE`で拒否する。

初期engine coverageは少なくともbuild、agent metadata、trace、impact、assignment、scheduleを別capability/runとして扱う。
Hybrid docgen ingestionは各出力をHELIX schemaへ変換し、変換mapping version/digestをprovenanceへ含める。代表engineだけのgreen、
aggregate parent、exit 0だけのartifactなしrunは`HIL_ENGINE_RUN_INCOMPLETE`または
`HIL_HYBRID_INGESTION_INCOMPLETE`とする。

## §4 detector finding契約

detector resultはrun/version/input/config、rule set、finding count/set digestを持つ。findingはrule、canonical location、
subject kind/ID、severity、semantic evidence digest、fingerprintを必須とし、proseだけのPASS/findingを拒否する。

fingerprintはdetector ID、major version、rule ID、subject kind/ID、canonical location、semantic evidence digest、
normalization versionからNodeが再導出する。separator/line ending差は正規化で吸収するが、worker提示fingerprintがNode再導出値と
一致しなければ、worker値を採用せず`HIL_DETECTOR_FINGERPRINT_NONDETERMINISTIC`でquarantineする。同じ再導出fingerprintの
再検出はfindingを増やさず、同run occurrenceを一件追加する。evidence欠落は
`HIL_DETECTOR_FINDING_EVIDENCE_MISSING`でquarantineする。

suppressionはexact fingerprint、scope、reason/evidence、owner、approval、expiry、version/baseline bindを要求する。
期限切れは適用せず`HIL_DETECTOR_SUPPRESSION_EXPIRED`を記録してfindingをopenにする。wildcardや無期限suppressionは本sliceで
生成しない。

## §5 決定的な再実行

同じrun identityを別operationで再実行し、engineはartifact setのkind/path/schema/content digest、detectorはcanonical finding
setのfingerprint/evidence/severityを比較する。engine差異は`HIL_ENGINE_RUN_NONDETERMINISTIC`、fingerprint差異は
`HIL_DETECTOR_FINGERPRINT_NONDETERMINISTIC`、横断差異は`HIL_NONDETERMINISTIC_RESULT`として新結果をquarantineする。
差異のあるartifact/findingをcurrentへcommitしない。

detectorの同一結果はfinding増分0、occurrence一件とする。engineの同一結果は既存artifact digestを参照するrerun receiptを
発行し、同じbytesを別正本として複製しない。source、version、config、schema、normalization digestが変わったrunは比較対象を
混同せず、旧artifact、baseline、suppression、receiptをstale化する。

## §6 artifact／DB projection候補

正規evidence root候補は`.helix/evidence/engine-detector-runs/<run_id>/`とし、engineは
`engine-run-request.json`、`engine-artifact-manifest.jsonl`、`engine-run-receipt.json`、detectorは
`detector-run-request.json`、`detector-findings.jsonl`、`detector-run-receipt.json`を持つ。共通で
`provenance-edges.jsonl`と`rerun-comparison.json`を持つが、artifact/finding本文を同一fileへ混載しない。

DB projectionはL4 §6.1のengine 4 tableとdetector 8 tableを論理分離し、artifact bundle/eventから再構築可能とする。
Python direct write、run ID共有、cross-table authority混在は`HIL_PYTHON_AUTHORITY_BYPASS`または
`HIL_DB_PROJECTION_BOUNDARY_INVALID`で拒否する。

## §7 failure正本

| token | 条件 |
|---|---|
| `HIL_REGISTRY_VERSION_UNKNOWN` | version未登録、非active、互換major不明 |
| `HIL_RUN_IDEMPOTENCY_CONFLICT` | 同一keyへ異なる実行identity |
| `HIL_WORKER_RESULT_QUARANTINED` | worker schema、fence、provenance、partial result不正 |
| `HIL_HYBRID_INGESTION_INCOMPLETE` | ZIP capability/mapping/provenance欠落 |
| `HIL_ENGINE_RUN_INCOMPLETE` | engine run、artifact、digest、exitの欠落 |
| `HIL_ENGINE_RUN_NONDETERMINISTIC` | 同一identityのartifact set差異 |
| `HIL_ARTIFACT_PATH_ESCAPE` | 安全でないartifact pathまたはsymlink |
| `HIL_ENGINE_RESULT_PARTIAL` | terminal/artifact/event/provenanceの部分commit企図 |
| `HIL_DETECTOR_FINDING_INCOMPLETE` | detector run/finding/provenance欠落 |
| `HIL_DETECTOR_FINDING_EVIDENCE_MISSING` | semantic evidence digest欠落 |
| `HIL_DETECTOR_FINGERPRINT_NONDETERMINISTIC` | 正規化後fingerprint不一致 |
| `HIL_DETECTOR_SUPPRESSION_EXPIRED` | expiry経過suppressionの適用企図 |
| `HIL_PROSE_ONLY_EVIDENCE` | 構造化code/provenanceなしの合格企図 |
| `HIL_NONDETERMINISTIC_RESULT` | artifact/finding横断のrerun差異 |
| `HIL_PYTHON_AUTHORITY_BYPASS` | Python/workerによる正本直接write |
| `HIL_DB_PROJECTION_BOUNDARY_INVALID` | engine/detector/IPC authority混在 |

## §8 exact L8 traceとfreeze

| L5責務 | L8 oracle | HAC | exact HST disposition |
|---|---|---|---|
| versioned descriptor完全性 | `IT-EDX-001` | `HAC-HIL-10a`, `HAC-HIL-10b` | `HST-CASE-008-11` → `HIL_ENGINE_RUN_INCOMPLETE`; `HST-CASE-009-07` → `HIL_DETECTOR_FINDING_INCOMPLETE` |
| unknown/retired version拒否 | `IT-EDX-002` | `HAC-HIL-10b` | `HST-CASE-008-09` → `HIL_REGISTRY_VERSION_UNKNOWN`; `HST-CASE-009-03` → `HIL_REGISTRY_VERSION_UNKNOWN` |
| ZIP engine個別実行とdocgen ingestion | `IT-EDX-003` | `HAC-HIL-10a` | `HST-CASE-008-01` → `なし（正常系）`; `HST-CASE-008-02` → `なし（正常系）`; `HST-CASE-008-03` → `なし（正常系）`; `HST-CASE-008-04` → `なし（正常系）`; `HST-CASE-008-05` → `なし（正常系）`; `HST-CASE-008-10` → `HIL_HYBRID_INGESTION_INCOMPLETE` |
| detector個別実行 | `IT-EDX-004` | `HAC-HIL-10a` | `HST-CASE-009-01` → `なし（正常系）` |
| Python proposalとNode authority | `IT-EDX-005` | `HAC-HIL-10b` | `HST-CASE-008-12` → `HIL_PYTHON_AUTHORITY_BYPASS` |
| artifact安全性と正本化 | `IT-EDX-006` | `HAC-HIL-10b` | `HST-CASE-008-07` → `HIL_ARTIFACT_PATH_ESCAPE` |
| finding evidence/suppression/fingerprintの検証 | `IT-EDX-007` | `HAC-HIL-10b`, `HAC-HIL-10c` | `HST-CASE-009-04` → `HIL_DETECTOR_SUPPRESSION_EXPIRED`; `HST-CASE-009-05` → `HIL_DETECTOR_FINDING_EVIDENCE_MISSING`; `HST-CASE-009-06` → `HIL_DETECTOR_FINGERPRINT_NONDETERMINISTIC`; `HST-CASE-009-09` → `HIL_PROSE_ONLY_EVIDENCE` |
| engine rerun | `IT-EDX-008` | `HAC-HIL-10c` | `HST-CASE-008-06` → `HIL_ENGINE_RUN_NONDETERMINISTIC` |
| detector rerun/dedupe | `IT-EDX-009` | `HAC-HIL-10a` | `HST-CASE-009-02` → `なし（正常系）` |
| engine partial commit 0／detector local fault分離 | `IT-EDX-010` | `HAC-HIL-10b` | `HST-CASE-008-08` → `HIL_ENGINE_RESULT_PARTIAL`; detector faultはHST消込に使わず`HIL_DETECTOR_FINDING_INCOMPLETE` |
| authority分離projection | `IT-EDX-011` | `HAC-HIL-10b` | `HST-CASE-009-08` → `HIL_DB_PROJECTION_BOUNDARY_INVALID` |
| 横断rerun quarantine | `IT-EDX-012` | `HAC-HIL-10c` | `HST-CASE-009-10` → `HIL_NONDETERMINISTIC_RESULT` |
| 原子化／採用判断／coverage receipt／DB relation rootの実行identity拘束 | `IT-EDX-013` | `HAC-HIL-10a`, `HAC-HIL-10b` | 補助的な正本拘束oracle |
| Node正本のauthority解決→commit／reconcile一貫処理 | `IT-EDX-014` | `HAC-HIL-10b` | `U-EDX-019`: `resolveCurrentExecutionAuthority` → `commitExecutionAuthority`、`U-EDX-020`: `reconcileExecutionAuthority`の補助transaction oracle |

freezeには14/14 integration、20/20 unit、全22 HST caseのexact disposition、初期engine/detector capability manifest、
fixed snapshot/config rerun、artifact/finding authority分離、fault injectionでpartial authoritative commit 0、別runtime reviewを
要求する。本書やregistry rowの存在だけで実装・freeze・HAC達成を主張しない。

## primary atomic assertion台帳

supporting caseを混入させず、正本primary caseをrangeなしで主IT/Uへ結線する。

| HST case識別子 | `pre_state` | `expected_state` | 正本failure | 主IT結線 | U結線 |
|---|---|---|---|---|---|
| `HST-CASE-008-01` | `queued` | `committed` | `なし（正常系）` | `IT-EDX-003` | `U-EDX-006`, `U-EDX-009` |
| `HST-CASE-008-02` | `queued` | `committed` | `なし（正常系）` | `IT-EDX-003` | `U-EDX-007` |
| `HST-CASE-008-03` | `queued` | `committed` | `なし（正常系）` | `IT-EDX-003` | `U-EDX-007` |
| `HST-CASE-008-04` | `queued` | `committed` | `なし（正常系）` | `IT-EDX-003` | `U-EDX-007` |
| `HST-CASE-008-05` | `queued` | `committed` | `なし（正常系）` | `IT-EDX-003` | `U-EDX-006` |
| `HST-CASE-008-06` | `committed` | `quarantined` | `HIL_ENGINE_RUN_NONDETERMINISTIC` | `IT-EDX-008` | `U-EDX-004`, `U-EDX-015` |
| `HST-CASE-008-07` | `result_staged` | `quarantined` | `HIL_ARTIFACT_PATH_ESCAPE` | `IT-EDX-006` | `U-EDX-008` |
| `HST-CASE-008-08` | `result_staged` | `failed` | `HIL_ENGINE_RESULT_PARTIAL` | `IT-EDX-010` | `U-EDX-016` |
| `HST-CASE-008-09` | `queued` | `queued` | `HIL_REGISTRY_VERSION_UNKNOWN` | `IT-EDX-002` | `U-EDX-003` |
| `HST-CASE-009-01` | `queued` | `committed` | `なし（正常系）` | `IT-EDX-004` | `U-EDX-010` |
| `HST-CASE-009-02` | `committed` | `committed` | `なし（正常系）` | `IT-EDX-009` | `U-EDX-013`, `U-EDX-017` |
| `HST-CASE-009-03` | `queued` | `queued` | `HIL_REGISTRY_VERSION_UNKNOWN` | `IT-EDX-002` | `U-EDX-003` |
| `HST-CASE-009-04` | `running` | `committed` | `HIL_DETECTOR_SUPPRESSION_EXPIRED` | `IT-EDX-007` | `U-EDX-014` |
| `HST-CASE-009-05` | `result_staged` | `quarantined` | `HIL_DETECTOR_FINDING_EVIDENCE_MISSING` | `IT-EDX-007` | `U-EDX-011` |
| `HST-CASE-009-06` | `result_staged` | `quarantined` | `HIL_DETECTOR_FINGERPRINT_NONDETERMINISTIC` | `IT-EDX-007` | `U-EDX-012`, `U-EDX-013` |
| `HST-CASE-008-10` | `assertion_input_ready` | `assertion_pass` | `HIL_HYBRID_INGESTION_INCOMPLETE` | `IT-EDX-003` | `U-EDX-005` |
| `HST-CASE-008-11` | `assertion_input_ready` | `assertion_pass` | `HIL_ENGINE_RUN_INCOMPLETE` | `IT-EDX-001` | `U-EDX-001`, `U-EDX-005`, `U-EDX-009` |
| `HST-CASE-009-07` | `assertion_input_ready` | `assertion_pass` | `HIL_DETECTOR_FINDING_INCOMPLETE` | `IT-EDX-001` | `U-EDX-002`, `U-EDX-011` |
| `HST-CASE-008-12` | `assertion_input_ready` | `assertion_pass` | `HIL_PYTHON_AUTHORITY_BYPASS` | `IT-EDX-005` | `U-EDX-016` |
| `HST-CASE-009-08` | `assertion_input_ready` | `assertion_pass` | `HIL_DB_PROJECTION_BOUNDARY_INVALID` | `IT-EDX-011` | `U-EDX-017` |
| `HST-CASE-009-09` | `assertion_input_ready` | `assertion_pass` | `HIL_PROSE_ONLY_EVIDENCE` | `IT-EDX-007` | `U-EDX-017` |
| `HST-CASE-009-10` | `assertion_input_ready` | `assertion_pass` | `HIL_NONDETERMINISTIC_RESULT` | `IT-EDX-012` | `U-EDX-004`, `U-EDX-015`, `U-EDX-018` |

current execution authorityはNode resolver/storeから取得し、caller申告を採用しない。commit bundleはkind別result、event、provenance、
exact write-setを保持し、authority headまたはpayloadの不一致をcommit 0にする。

## §9 current authorityとDB invariant

`current_execution_authority`はauthority headをPKとし、snapshot、atomization revision、atom、current adoption decision、coverage receipt、relation root、registry version、schema/normalization versionをFKまたはdigest-bound fieldでexact結線する。engine resultはartifact rowsだけ、detector resultはfinding/occurrence rowsだけへ投影し、run kindとのcross-table rowをCHECKで拒否する。`execution_events`はoperation sequence unique、`execution_provenance_edges`はresultから全authority inputへのFKを持つ。Node transactionはstrict payload、event、provenance、terminal receiptのexact write-setを再導出し、caller authority digest、kind swap、partial row、stale authority headでは全増分0とする。

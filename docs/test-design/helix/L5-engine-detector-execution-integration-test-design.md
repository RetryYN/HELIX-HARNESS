---
title: "HELIX L8 結合テスト設計 — engine / detector execution"
layer: L5
executed_at_layer: L8
artifact_type: test_design
status: draft
created: 2026-07-15
updated: 2026-07-15
owner: QA / TL
plan: PLAN-L1-07-infinity-loop-platform-requirements
slice_id: HDS-HIL-10
design_slice: HDS-HIL-10
related_hst:
  - HST-HIL-008
  - HST-HIL-009
related_l3: docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md
related_l4: docs/design/helix/L4-basic-design/infinity-loop-platform-basic-design.md
pair_artifact: docs/design/helix/L5-detail/engine-detector-execution.md
next_pair_freeze: L5
requirements:
  - HR-FR-HIL-10
  - HAC-HIL-10a
  - HAC-HIL-10b
  - HAC-HIL-10c
system_tests:
  - HST-HIL-008
  - HST-HIL-009
---

# HELIX L8 結合テスト設計 — engine / detector execution

## §0 共通oracle

全caseは未実装である。固定source snapshot、capability atom、registry/version、expanded config、schema/protocol、worker package、
normalization、OS profileのdigestと、operation/run/lease/fence、command、exit、artifact/finding/event/projection digestを保存する。
Python workerはproposalだけを返し、Node commit前後のauthoritative row countを直接測る。

| ID | 結合scenario | 期待結果 | HAC | exact HST disposition | test citation |
|---|---|---|---|---|---|
| `IT-EDX-001` | engine/detector descriptorをactive exact versionで解決し、必須field欠落fixtureも別laneで投入 | 完全descriptorだけexactly-one。不完全engine/detectorはrun 0 | `HAC-HIL-10a`, `HAC-HIL-10b` | `HST-CASE-008-11` → `HIL_ENGINE_RUN_INCOMPLETE`; `HST-CASE-009-07` → `HIL_DETECTOR_FINDING_INCOMPLETE` | `tests/engine-detector-registry.integration.test.ts` |
| `IT-EDX-002` | unknown/draft/retired/major不明versionをclaim | lease 0、runはqueuedのまま、正本増分0 | `HAC-HIL-10b` | `HST-CASE-008-09` → `HIL_REGISTRY_VERSION_UNKNOWN`; `HST-CASE-009-03` → `HIL_REGISTRY_VERSION_UNKNOWN` | `tests/engine-detector-registry.integration.test.ts` |
| `IT-EDX-003` | 固定ZIPへbuild、trace、impact、assignment、scheduleを別runで実行し、docgen mappingもingest | 5正常runはcapability別artifactをcommitし、docgenは全metadata/provenance欠落時だけ拒否 | `HAC-HIL-10a` | `HST-CASE-008-01` → `なし（正常系）`; `HST-CASE-008-02` → `なし（正常系）`; `HST-CASE-008-03` → `なし（正常系）`; `HST-CASE-008-04` → `なし（正常系）`; `HST-CASE-008-05` → `なし（正常系）`; `HST-CASE-008-10` → `HIL_HYBRID_INGESTION_INCOMPLETE` | `tests/engine-execution.integration.test.ts` |
| `IT-EDX-004` | active detectorを固定snapshotへ一回実行 | engineと別runでversion/fingerprint/provenance付きfindingをcommit | `HAC-HIL-10a` | `HST-CASE-009-01` → `なし（正常系）` | `tests/detector-execution.integration.test.ts` |
| `IT-EDX-005` | Python workerがartifact/finding/DBを直接current化 | sandbox拒否、proposalだけ受理、直接write 0 | `HAC-HIL-10b` | `HST-CASE-008-12` → `HIL_PYTHON_AUTHORITY_BYPASS` | `tests/engine-detector-authority.integration.test.ts` |
| `IT-EDX-006` | artifact pathのabsolute、`..`、NUL、symlink escapeを順次返す | seal/registry/current増分0、run quarantine | `HAC-HIL-10b` | `HST-CASE-008-07` → `HIL_ARTIFACT_PATH_ESCAPE` | `tests/engine-artifact.integration.test.ts` |
| `IT-EDX-007` | 期限切れsuppression、evidence欠落、separatorだけ変えたevidenceに対するworker提示fingerprintとNode再導出値の差、prose PASSを別fixtureで投入 | open finding、finding commit 0、fingerprint不一致quarantine、evidence昇格0を各tokenで分離 | `HAC-HIL-10b`, `HAC-HIL-10c` | `HST-CASE-009-04` → `HIL_DETECTOR_SUPPRESSION_EXPIRED`; `HST-CASE-009-05` → `HIL_DETECTOR_FINDING_EVIDENCE_MISSING`; `HST-CASE-009-06` → `HIL_DETECTOR_FINGERPRINT_NONDETERMINISTIC`; `HST-CASE-009-09` → `HIL_PROSE_ONLY_EVIDENCE` | `tests/detector-finding.integration.test.ts` |
| `IT-EDX-008` | 同一snapshot/version/configでengineを再実行し一byteだけ変える | 新artifact current 0、nondeterminism quarantine | `HAC-HIL-10c` | `HST-CASE-008-06` → `HIL_ENGINE_RUN_NONDETERMINISTIC` | `tests/engine-determinism.integration.test.ts` |
| `IT-EDX-009` | detectorを同一identityで再実行 | finding増分0、occurrence一件、set digest一致 | `HAC-HIL-10a` | `HST-CASE-009-02` → `なし（正常系）` | `tests/detector-determinism.integration.test.ts` |
| `IT-EDX-010` | engine laneはartifact insert直後にtransaction故障。detector laneはfinding/event/provenance insert故障を別transaction・別failureで注入 | engineはrun/artifact/event/provenance部分commit 0。detectorも部分commit 0だがengine tokenへ集約しない | `HAC-HIL-10b` | `HST-CASE-008-08` → `HIL_ENGINE_RESULT_PARTIAL`; detector laneはHST消込外のlocal negative → `HIL_DETECTOR_FINDING_INCOMPLETE` | `tests/engine-detector-transaction.integration.test.ts` |
| `IT-EDX-011` | engine/detector/IPC projectionをrebuildしcross-authority IDを注入 | 論理table分離、混載拒否、rebuild digest一致 | `HAC-HIL-10b` | `HST-CASE-009-08` → `HIL_DB_PROJECTION_BOUNDARY_INVALID` | `tests/engine-detector-projection.integration.test.ts` |
| `IT-EDX-012` | artifact/findingを同一snapshot/version/configの複数runで比較し意味差を注入 | 差異をnondeterminism findingへ集約し結果commit 0 | `HAC-HIL-10c` | `HST-CASE-009-10` → `HIL_NONDETERMINISTIC_RESULT` | `tests/engine-detector-determinism.integration.test.ts` |
| `IT-EDX-013` | callerがatomization revision、current adoption decision、coverage receipt、DB relation rootのいずれかを改ざん | Node authorityから解決した4 digestと不一致ならlease/worker/commit 0。同一authority集合だけ同一run identity | `HAC-HIL-10a`, `HAC-HIL-10b` | supporting authority oracle | `tests/execution-identity-authority.integration.test.ts` |
| `IT-EDX-014` | `U-EDX-019`の`resolveCurrentExecutionAuthority` → `commitExecutionAuthority`をstable順に実行し、resolver authority各fieldとcommit側result/event/provenance payload/write-setを一件ずつ改変する。続けて`U-EDX-020 reconcileExecutionAuthority`へseal後DB faultを注入 | 完全current resolver receiptを持つbundleだけcommit。同一reconcileは同receipt、caller authority、別digest/head、payload欠落、authority混載はcommit 0 | `HAC-HIL-10b` | supporting transaction oracle | `tests/engine-detector-authority-reconcile.integration.test.ts` |

## §1 HST量閉じ

`HST-CASE-008-01`、`HST-CASE-008-02`、`HST-CASE-008-03`、`HST-CASE-008-04`、`HST-CASE-008-05`、
`HST-CASE-008-06`、`HST-CASE-008-07`、`HST-CASE-008-08`、`HST-CASE-008-09`、`HST-CASE-008-10`、
`HST-CASE-008-11`、`HST-CASE-008-12`、`HST-CASE-009-01`、`HST-CASE-009-02`、`HST-CASE-009-03`、
`HST-CASE-009-04`、`HST-CASE-009-05`、`HST-CASE-009-06`、`HST-CASE-009-07`、`HST-CASE-009-08`、
`HST-CASE-009-09`、`HST-CASE-009-10`の22/22を上表へexact bindする。範囲表記だけでcaseを消込まない。

14/14、全22 HST、failure token、authoritative row count、rerun digest、別runtime reviewが揃うまでL8をgreenにしない。
worker mockのexit 0、代表engine/detector、artifact file存在、prose PASSだけでは合格にしない。

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

`IT-EDX-013`/`IT-EDX-014`はsnapshot/atom/adoption/coverage/relation/version/headを一件ずつswap・stale化し、engine payloadへfinding、detector payloadへartifactを混入する。event/provenance/terminal append直後faultとCAS競合を含め、current authority store由来の完全一致以外はrun/result/current/receipt増分0とする。

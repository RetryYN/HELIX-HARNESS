---
title: "HELIX L7 単体テスト設計 — engine / detector execution"
layer: L6
executed_at_layer: L7
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
pair_artifact: docs/design/helix/L6-function-design/engine-detector-execution.md
next_pair_freeze: L6
requirements:
  - HR-FR-HIL-10
  - HAC-HIL-10a
  - HAC-HIL-10b
  - HAC-HIL-10c
system_tests:
  - HST-HIL-008
  - HST-HIL-009
---

# HELIX L7 単体テスト設計 — engine / detector execution

全caseは未実装である。各caseは期待resultだけでなく、failure token、write count、stable ordering、digest、状態遷移、
artifact/finding authorityを直接assertする。

| ID | 対象API | scenarioと期待結果 | HAC | exact HST disposition | test citation |
|---|---|---|---|---|---|
| `U-EDX-001` | `parseEngineVersionDescriptor` | capability/schema/package/config digest欠落とunknown keyを拒否 | `HAC-HIL-10a`, `HAC-HIL-10b` | `HST-CASE-008-11` → `HIL_ENGINE_RUN_INCOMPLETE` | `tests/engine-detector-registry.test.ts` |
| `U-EDX-002` | `parseDetectorVersionDescriptor` | rule/schema/severity policy/owner欠落を拒否 | `HAC-HIL-10a`, `HAC-HIL-10b` | `HST-CASE-009-07` → `HIL_DETECTOR_FINDING_INCOMPLETE` | `tests/engine-detector-registry.test.ts` |
| `U-EDX-003` | `resolveRegisteredVersion` | unknown/draft/retired/複数/major不明をlease 0で拒否 | `HAC-HIL-10b` | `HST-CASE-008-09` → `HIL_REGISTRY_VERSION_UNKNOWN`; `HST-CASE-009-03` → `HIL_REGISTRY_VERSION_UNKNOWN` | `tests/engine-detector-registry.test.ts` |
| `U-EDX-004` | `deriveExecutionIdentity` | 時刻/PID/temp path/OS separator/列挙順を除外し、意味差によるrerun差をkind別tokenへ渡す | `HAC-HIL-10a`, `HAC-HIL-10c` | `HST-CASE-008-06` → `HIL_ENGINE_RUN_NONDETERMINISTIC`; `HST-CASE-009-10` → `HIL_NONDETERMINISTIC_RESULT` | `tests/execution-identity.test.ts` |
| `U-EDX-005` | `validateFixedExecutionInput` | docgen mapping欠落とengine input/version digest欠落を別fixtureで拒否 | `HAC-HIL-10a`, `HAC-HIL-10b` | `HST-CASE-008-10` → `HIL_HYBRID_INGESTION_INCOMPLETE`; `HST-CASE-008-11` → `HIL_ENGINE_RUN_INCOMPLETE` | `tests/execution-identity.test.ts` |
| `U-EDX-006` | `createEngineRunPlan` | build/scheduleのactive capabilityから固定requestを生成し、各runを正常開始 | `HAC-HIL-10a` | `HST-CASE-008-01` → `なし（正常系）`; `HST-CASE-008-05` → `なし（正常系）` | `tests/engine-execution.test.ts` |
| `U-EDX-007` | `validateEngineResultProposal` | trace/impact/assignmentの正しいrun/version/input/config/exit/provenanceを受理 | `HAC-HIL-10a` | `HST-CASE-008-02` → `なし（正常系）`; `HST-CASE-008-03` → `なし（正常系）`; `HST-CASE-008-04` → `なし（正常系）` | `tests/engine-execution.test.ts` |
| `U-EDX-008` | `validateArtifactPath` | absolute、`..`、NUL、symlink escapeを全て拒否 | `HAC-HIL-10b` | `HST-CASE-008-07` / `HIL_ARTIFACT_PATH_ESCAPE` | `tests/engine-artifact.test.ts` |
| `U-EDX-009` | `validateArtifactManifest` | 正常build manifestを受理し、不完全engine fixtureはmanifest外bytes/digest欠落で拒否 | `HAC-HIL-10a`, `HAC-HIL-10b` | `HST-CASE-008-01` → `なし（正常系）`; `HST-CASE-008-11` → `HIL_ENGINE_RUN_INCOMPLETE` | `tests/engine-artifact.test.ts` |
| `U-EDX-010` | `createDetectorRunPlan` | active detectorと固定snapshotからfinding authority限定requestを正常生成 | `HAC-HIL-10a` | `HST-CASE-009-01` → `なし（正常系）` | `tests/detector-execution.test.ts` |
| `U-EDX-011` | `validateDetectorResultProposal` | evidence欠落とdescriptor/provenance欠落を別fixtureでfinding commit 0 | `HAC-HIL-10b` | `HST-CASE-009-05` → `HIL_DETECTOR_FINDING_EVIDENCE_MISSING`; `HST-CASE-009-07` → `HIL_DETECTOR_FINDING_INCOMPLETE` | `tests/detector-execution.test.ts` |
| `U-EDX-012` | `canonicalizeFindingEvidence` | separator/改行差を吸収したNode evidence digestを返し、worker fingerprint照合へ渡す | `HAC-HIL-10a`, `HAC-HIL-10c` | `HST-CASE-009-06` → `HIL_DETECTOR_FINGERPRINT_NONDETERMINISTIC` | `tests/detector-fingerprint.test.ts` |
| `U-EDX-013` | `deriveDetectorFingerprint` | 同一finding再実行は同一fingerprint。separator変更時のworker提示値とNode再導出値の差はquarantine | `HAC-HIL-10a`, `HAC-HIL-10c` | `HST-CASE-009-02` → `なし（正常系）`; `HST-CASE-009-06` → `HIL_DETECTOR_FINGERPRINT_NONDETERMINISTIC` | `tests/detector-fingerprint.test.ts` |
| `U-EDX-014` | `evaluateDetectorSuppression` | expiry、wildcard、scope/version/baseline driftを適用せずopen finding | `HAC-HIL-10b` | `HST-CASE-009-04` / `HIL_DETECTOR_SUPPRESSION_EXPIRED` | `tests/detector-suppression.test.ts` |
| `U-EDX-015` | `compareDeterministicRerun` | engine一byte差、detector意味差、順序差を区別し差異だけquarantine | `HAC-HIL-10c` | `HST-CASE-008-06`, `HST-CASE-009-10` / `HIL_ENGINE_RUN_NONDETERMINISTIC`, `HIL_NONDETERMINISTIC_RESULT` | `tests/execution-determinism.test.ts` |
| `U-EDX-016` | `planEngineAuthorityCommit` | 各insert故障でterminal/artifact/event/provenanceの正本増分0 | `HAC-HIL-10b` | `HST-CASE-008-08` / `HIL_ENGINE_RESULT_PARTIAL` | `tests/engine-authority-commit.test.ts` |
| `U-EDX-017` | `planDetectorAuthorityCommit` | duplicate findingはoccurrenceだけ、prose/authority混載は各tokenでcommit 0 | `HAC-HIL-10a`, `HAC-HIL-10b` | `HST-CASE-009-02` → `なし（正常系）`; `HST-CASE-009-08` → `HIL_DB_PROJECTION_BOUNDARY_INVALID`; `HST-CASE-009-09` → `HIL_PROSE_ONLY_EVIDENCE` | `tests/detector-authority-commit.test.ts` |
| `U-EDX-018` | `invalidateExecutionEvidence` | source/version/config/schema/normalization各driftで影響receiptをstale化 | `HAC-HIL-10c` | `HST-CASE-009-10` / `HIL_NONDETERMINISTIC_RESULT` | `tests/execution-determinism.test.ts` |
| `U-EDX-019` | composition: `resolveCurrentExecutionAuthority` → `commitExecutionAuthority` | resolver固有mutationとしてtrusted store head、atomization、adoption decision、coverage receipt、relation root、versionを各swap/stale化する。commit固有mutationとしてresolver receipt、operation/identity digest、expected head、result/event/provenance payload、exact write-set、idempotencyを各欠落・改変する。current解決と同一bundle commitを一つの外部transaction結果として採点し、全反例でwrite 0 | `HAC-HIL-10b` | supporting authority transaction oracle | `tests/execution-authority-commit.test.ts` |
| `U-EDX-020` | `reconcileExecutionAuthority` | seal後DB faultを同一bundleで収束し、別digest再送、head競合、authority混載、暗黙rewriteを拒否 | `HAC-HIL-10b`, `HAC-HIL-10c` | supporting reconcile oracle | `tests/execution-authority-commit.test.ts` |

## §1 L8逆引き

| unit oracle | 対応するintegration oracle |
|---|---|
| `U-EDX-001` | `IT-EDX-001`, `IT-EDX-003` |
| `U-EDX-002` | `IT-EDX-001`, `IT-EDX-004` |
| `U-EDX-003` | `IT-EDX-002` |
| `U-EDX-004` | `IT-EDX-008`, `IT-EDX-009`, `IT-EDX-012` |
| `U-EDX-005` | `IT-EDX-003`, `IT-EDX-004` |
| `U-EDX-006` | `IT-EDX-003`, `IT-EDX-005` |
| `U-EDX-007` | `IT-EDX-003`, `IT-EDX-005` |
| `U-EDX-008` | `IT-EDX-006` |
| `U-EDX-009` | `IT-EDX-003`, `IT-EDX-006` |
| `U-EDX-010` | `IT-EDX-004`, `IT-EDX-005` |
| `U-EDX-011` | `IT-EDX-004`, `IT-EDX-007` |
| `U-EDX-012` | `IT-EDX-007`, `IT-EDX-009` |
| `U-EDX-013` | `IT-EDX-007`, `IT-EDX-009` |
| `U-EDX-014` | `IT-EDX-007` |
| `U-EDX-015` | `IT-EDX-008`, `IT-EDX-009`, `IT-EDX-012` |
| `U-EDX-016` | `IT-EDX-010`, `IT-EDX-011` |
| `U-EDX-017` | `IT-EDX-009`, `IT-EDX-010`, `IT-EDX-011` |
| `U-EDX-018` | `IT-EDX-012` |
| `U-EDX-019` | `IT-EDX-013`, `IT-EDX-014` |
| `U-EDX-020` | `IT-EDX-014` |

20/20のRed/Green、全HAC/HST/failure bind、mutation、write count、digest、別runtime reviewが揃うまでL7をgreenにしない。

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

`U-EDX-019`のexact function setは`resolveCurrentExecutionAuthority` → `commitExecutionAuthority`だけであり、前者のauthority解決mutationと後者のcommit protocol mutationを別fixture laneで採点する。`U-EDX-020`はstrict kind union、artifact/finding set digest、event head、provenance exact set、caller digest、payload swap、stale/CAS/store faultを検査し全反例のwrite count 0をassertする。いずれも未実装である。

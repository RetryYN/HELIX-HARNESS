---
title: "HELIX L7 単体テスト設計 — Node runtime cutover"
layer: L6
executed_at_layer: L7
artifact_type: test_design
status: draft
created: 2026-07-15
updated: 2026-07-15
owner: QA / TL
plan: PLAN-L1-07-infinity-loop-platform-requirements
design_slice: HDS-HIL-13
related_l3: docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md
related_l4: docs/design/helix/L4-basic-design/infinity-loop-platform-basic-design.md
related_hst: [HST-HIL-013]
pair_artifact: docs/design/helix/L6-function-design/node-runtime-cutover.md
next_pair_freeze: L6
requirements:
  - HR-FR-HIL-13
  - HAC-HIL-13a
  - HAC-HIL-13b
  - HAC-HIL-13c
---

# HELIX L7 単体テスト設計 — Node runtime cutover

全caseは未実装であり、新runtime ADR承認前は設計oracleである。mockのexit 0だけでなく、finding、failure code、
write count、stable ordering、digest、terminal flagを直接assertする。

| ID | 対象API | 反例と期待結果 | test citation |
|---|---|---|---|
| `U-NCUT-001` | `canonicalizeRuntimeInventoryRequest` | absolute/traversal scope、HEAD/rule欠落を拒否しcanonical requestを固定 | `tests/node-runtime-cutover-inventory.test.ts` |
| `U-NCUT-002` | `enumerateRuntimeSurfaces` | source/package/hook/test/CI/template/setup/distribution/ruleをstable順で全列挙し、generated欠落をcoverage failure化 | `tests/node-runtime-cutover-inventory.test.ts` |
| `U-NCUT-003` | `classifyRuntimeSurface` | active/historical重複、未分類、globだけの除外を`HIL_BUN_COVERAGE_INCOMPLETE`で拒否 | `tests/node-runtime-cutover-inventory.test.ts` |
| `U-NCUT-004` | `detectBunDependency` | runtime API、loader、command、package、lock、CI、hook、test、template、setup、distribution、fallback、rule command fixtureをsurface別failure code/fingerprintへ分類 | `tests/node-runtime-cutover-inventory.test.ts` |
| `U-NCUT-005` | `validateHistoricalAllowlist` | active行、digest drift、authority/到達不能性欠落を`HIL_BUN_HISTORICAL_ALLOWLIST_INVALID`で拒否 | `tests/node-runtime-cutover-inventory.test.ts` |
| `U-NCUT-006` | `validateNodeRuntime` | floor未満、非LTS、必要feature欠落を`HIL_NODE_RUNTIME_UNSUPPORTED`へ変換 | `tests/node-runtime-cutover-toolchain.test.ts` |
| `U-NCUT-007` | `validateNodeLock` | lock欠落、manifest drift、非frozen tree、複数canonical lockを正確にblock | `tests/node-runtime-cutover-toolchain.test.ts` |
| `U-NCUT-008` | `planNodeSourceExecution` | extensionless import未解決とBun loader混入をwrite 0で検出 | `tests/node-runtime-cutover-toolchain.test.ts` |
| `U-NCUT-009` | `planNodeBuild` | entry/bin/ESM target欠落、未許可native external、Bun build commandを拒否 | `tests/node-runtime-cutover-toolchain.test.ts` |
| `U-NCUT-010` | `verifyNodeArtifact` | tamper、shebang/bin不一致、source parity差、埋込Bun markerを`HIL_NODE_BUILD_ARTIFACT_INVALID`で拒否 | `tests/node-runtime-cutover-toolchain.test.ts` |
| `U-NCUT-011` | `evaluateNodeMinimum` | P0–P1 greenでも`terminal=false`、workflow欠落ならPASSせずstale入力も拒否 | `tests/node-runtime-cutover-gate.test.ts` |
| `U-NCUT-012` | `evaluateBunCutover` | active finding、quarantine、未green workflow、stale evidenceの各1件でcutover PASS 0 | `tests/node-runtime-cutover-gate.test.ts` |
| `U-NCUT-013` | `planNodeCutoverRollback` → `executeNodeCutoverRollback` → `commitNodeCutoverRollback` → `reconcileNodeCutoverRollback` | known-good互換、artifact/DB/pointer各prepare・staging検証・pointer CAS・recovery・compensation faultを4関数へ個別注入 | commit前current不変、commit後はrecovery/compensationで新旧混在0。同一reconcile同receipt、競合action 0 | `tests/node-runtime-cutover-rollback.test.ts` |

### canonical assertion primary表

次表がHST-HIL-013のprimary unit採点表である。上の12 unit oracleはAPI別mutationを共有するsupporting実行表であり、
case単位のstate/failure合否と11/11分母は次表だけから算出する。supporting主ITはL8へのtraceである。

| HST正本 | 主U | 主API | supporting主IT | pre_state | expected_state | failure正本 |
|---|---|---|---|---|---|---|
| `HST-CASE-013-01` | `U-NCUT-012` | `evaluateBunCutover` | `IT-NCUT-008` | `verifying` | `verified` | `なし（正常系）` |
| `HST-CASE-013-02` | `U-NCUT-004` | `detectBunDependency` | `IT-NCUT-010` | `verifying` | `failed` | `HIL_ACTIVE_BUN_DEPENDENCY` |
| `HST-CASE-013-03` | `U-NCUT-004` | `detectBunDependency` | `IT-NCUT-010` | `verifying` | `failed` | `HIL_ACTIVE_BUN_COMMAND` |
| `HST-CASE-013-04` | `U-NCUT-004` | `detectBunDependency` | `IT-NCUT-010` | `verifying` | `failed` | `HIL_ACTIVE_BUN_LOCKFILE` |
| `HST-CASE-013-05` | `U-NCUT-004` | `detectBunDependency` | `IT-NCUT-010` | `verifying` | `failed` | `HIL_ACTIVE_BUN_CI` |
| `HST-CASE-013-06` | `U-NCUT-004` | `detectBunDependency` | `IT-NCUT-010` | `verifying` | `failed` | `HIL_ACTIVE_BUN_DISTRIBUTION` |
| `HST-CASE-013-07` | `U-NCUT-012` | `evaluateBunCutover` | `IT-NCUT-010` | `verifying` | `verifying` | `HIL_BUN_CUTOVER_QUARANTINE_REMAINS` |
| `HST-CASE-013-08` | `U-NCUT-012` | `evaluateBunCutover` | `IT-NCUT-008` | `assertion_input_ready` | `assertion_pass` | `HIL_ACTIVE_BUN_DEPENDENCY` |
| `HST-CASE-013-09` | `U-NCUT-003` | `classifyRuntimeSurface` | `IT-NCUT-009` | `assertion_input_ready` | `assertion_pass` | `HIL_BUN_COVERAGE_INCOMPLETE` |
| `HST-CASE-013-10` | `U-NCUT-008` | `planNodeSourceExecution` | `IT-NCUT-002` | `assertion_input_ready` | `assertion_pass` | `HIL_NODE_CONTROL_PLANE_INVALID` |
| `HST-CASE-013-11` | `U-NCUT-012` | `evaluateBunCutover` | `IT-NCUT-008` | `assertion_input_ready` | `assertion_pass` | `HIL_BUN_CUTOVER_INCOMPLETE` |

## §1 逆引きtrace

| 単体oracle | L6契約 | L5/L8参照 | 要求正本 |
|---|---|---|---|
| `U-NCUT-001` | inventory request schema | `IT-NCUT-009` | `HAC-HIL-13b` |
| `U-NCUT-002` | surface denominator | `IT-NCUT-009` | `HIL-FR-33` |
| `U-NCUT-003` | lifecycle/classificationを必ず一つに確定 | `IT-NCUT-009`, `IT-NCUT-010` | `HAC-HIL-13b`, `HAC-HIL-13c` |
| `U-NCUT-004` | Bun dependency detector | `IT-NCUT-009`, `IT-NCUT-010` | `HIA-FR-033` |
| `U-NCUT-005` | historical allowlist | `IT-NCUT-009`, `IT-NCUT-010` | `HAC-HIL-13c` |
| `U-NCUT-006` | Node runtime contract | `IT-NCUT-001`, `IT-NCUT-002` | `HIA-TR-001` |
| `U-NCUT-007` | Node lock contract | `IT-NCUT-001` | `HIL-TR-11` |
| `U-NCUT-008` | source execution plan | `IT-NCUT-003`, `IT-NCUT-006` | `HIL-TR-01` |
| `U-NCUT-009` | build plan | `IT-NCUT-004`, `IT-NCUT-008` | `HIL-TR-01` |
| `U-NCUT-010` | artifact verification | `IT-NCUT-004`, `IT-NCUT-008` | `HAC-HIL-13a` |
| `U-NCUT-011` | Node minimum gate | `IT-NCUT-001`, `IT-NCUT-002`, `IT-NCUT-003`, `IT-NCUT-004`, `IT-NCUT-005` | `HR-FR-HIL-13` |
| `U-NCUT-012` | Bun cutover gate | `IT-NCUT-006`, `IT-NCUT-007`, `IT-NCUT-008`, `IT-NCUT-009`, `IT-NCUT-010` | `HIL-BR-19`, `HIL-TR-11` |
| `U-NCUT-013` | `planNodeCutoverRollback` → `executeNodeCutoverRollback` → `commitNodeCutoverRollback` → `reconcileNodeCutoverRollback` | `IT-NCUT-011` | cutover操作承認の安全契約 |

13/13 Red/Green、全failure union、mutation反例、rollback fault、同一入力のdigest冪等性、別runtime reviewが揃うまでL7をgreenにしない。

public API→U owner監査では16 APIを13 Uへexact joinする。`U-NCUT-001`〜`012`は各一API、`U-NCUT-013`は
`planNodeCutoverRollback`をprimary、execute/commit/reconcileを同一transactionのsupporting APIとして所有する。別Uとのowner重複、
ownerなしAPI、L6/L7でのAPI名差を0件とし、primary 11行はL6/L7/L8のpre/expected stateとfailure codeをexact一致させる。
rollback反例はlocal `NodeCutoverFailureV1`の29-code allowlistと必須fieldを直接検証し、旧名、自由文字列code、欠落fieldを拒否する。

`U-NCUT-013`は上記4関数を固定順で全て実行し、plan検証、非current staging、pointer CAS commit、checkpoint
reconcileの各mutationを省略しない。一部関数のgreenを13/13の合格へ代用しない。

---
title: "HELIX L8 結合テスト設計 — Node runtime cutover"
layer: L5
executed_at_layer: L8
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
pair_artifact: docs/design/helix/L5-detail/node-runtime-cutover.md
next_pair_freeze: L5
requirements:
  - HR-FR-HIL-13
  - HAC-HIL-13a
  - HAC-HIL-13b
  - HAC-HIL-13c
---

# HELIX L8 結合テスト設計 — Node runtime cutover

## §0 共通oracle

全caseは未実装である。新runtime ADRがacceptedになるまではRed fixture/設計oracleとして扱い、現行ADR-001準拠の
Bun surfaceを無断で変更しない。全実行は固定HEAD、inventory/schema/rule、Node/npm、manifest/lock、artifact、workflow、
OS image digestと、command、exit、stdout/stderr digestを保存する。clean Linux imageにはBun binary/loader/cacheを入れない。

| ID | 結合対象 | scenario | 期待結果 / evidence | test citation |
|---|---|---|---|---|
| `IT-NCUT-001` | package→clean install | BunなしLinuxでNode/npmを固定して`npm ci`とoffline cache再install | lock一致、network/offline各receipt、Bun実行0 | `tests/node-runtime-cutover-integration.test.ts` |
| `IT-NCUT-002` | toolchain→source | clean install後にtypecheck、lint、targeted/full testを順次実行 | TypeScript strict維持、runnerがNode、全exit 0 | `tests/node-runtime-cutover-integration.test.ts` |
| `IT-NCUT-003` | source entry→CLI | Node source runnerでversion/status/doctorのread-only smoke | module解決成功、CLI schema/exit一致、Bun loader 0 | `tests/cli-surface.test.ts` |
| `IT-NCUT-004` | source→build→bin | ESM bundleを生成しbuilt CLIとsource CLIを同fixtureで比較 | version、stdout schema、exit、主要command parity | `tests/distribution-acceptance.test.ts` |
| `IT-NCUT-005` | CLI→SQLite | `node:sqlite`で新規DB、migration、transaction、rebuild、queueを実行 | Bun branch 0、DB/query digest一致、rebuild冪等 | `tests/state-db.test.ts` |
| `IT-NCUT-006` | hook→session command | Claude/Codex hook、POSIX/PowerShell wrapper、session start/stopをNode artifactへ接続 | matcher/parity維持、Bun command 0、failure fail-close | `tests/node-runtime-cutover-integration.test.ts` |
| `IT-NCUT-007` | source CI→template | source workflowとconsumer templateを生成・解析・実行 | Node setup/cache/npm frozen install、Bun action/command 0 | `tests/harness-check-workflow.test.ts` |
| `IT-NCUT-008` | setup→package→consumer | clean consumerへsetup、pack/install/link、CLI/hook/package smoke | source外環境でgreen、artifact内active Bun 0 | `tests/distribution-acceptance.test.ts` |
| `IT-NCUT-009` | repo→inventory→gate | API/command/lock/CI/hook/template/setup/test/distributionとhistorical fixtureを走査 | active 0、全行exactly-one分類、historicalだけ根拠付きallowlist | `tests/runtime-portability.test.ts` |
| `IT-NCUT-010` | drift/fault→stale/block | runtime API、loader、command、package、lock、CI、hook、test、template、setup、distribution、fallback、rule command、未分類、各digest driftを個別注入 | surface別exact failure code、旧receipt stale、false cutover PASS 0 | `tests/toolchain-pin.test.ts` |
| `IT-NCUT-011` | `planNodeCutoverRollback` → `executeNodeCutoverRollback` → `commitNodeCutoverRollback` → `reconcileNodeCutoverRollback` | artifact/DB/pointerのprepare、staging verification、commit-point CAS、recovery、compensationへ4関数別にfaultを注入 | commit前current不変、commit後は旧known-goodへ完全収束または補償しheterogeneous混在0。同一reconcile同receipt、rollback後cutover PASS 0 | `tests/node-runtime-cutover-rollback.integration.test.ts` |

## §1 要件逆引き

| 結合oracle | 要求 / 受入条件 | failure oracle |
|---|---|---|
| `IT-NCUT-001` | `HAC-HIL-13a`; `HIL-TR-11` | `HIL_NODE_LOCK_MISSING`, `HIL_NODE_LOCK_DRIFT` |
| `IT-NCUT-002` | `HAC-HIL-13a`; `HIL-TR-01` | `HIL_NODE_RUNTIME_UNSUPPORTED`, `HIL_NODE_WORKFLOW_UNVERIFIED` |
| `IT-NCUT-003` | `HAC-HIL-13a`; `HIL-TR-01` | `HIL_NODE_SOURCE_ENTRY_UNRESOLVABLE` |
| `IT-NCUT-004` | `HAC-HIL-13a`; `HIL-TR-01` | `HIL_NODE_BUILD_ARTIFACT_INVALID` |
| `IT-NCUT-005` | `HAC-HIL-13a`; `HIL-TR-01` | `HIL_NODE_CONTROL_PLANE_INVALID` |
| `IT-NCUT-006` | `HAC-HIL-13a`; `HIL-TR-01` | `HIL_NODE_WORKFLOW_UNVERIFIED` |
| `IT-NCUT-007` | `HAC-HIL-13a`; `HIL-TR-11` | `HIL_ACTIVE_BUN_CI` |
| `IT-NCUT-008` | `HAC-HIL-13a`; `HIL-BR-19` | `HIL_ACTIVE_BUN_DISTRIBUTION`, `HIL_BUN_CUTOVER_INCOMPLETE` |
| `IT-NCUT-009` | `HAC-HIL-13b`; `HAC-HIL-13c`; `HIL-FR-33` | `HIL_ACTIVE_BUN_DEPENDENCY`, `HIL_BUN_HISTORICAL_ALLOWLIST_INVALID` |
| `IT-NCUT-010` | `HAC-HIL-13b`; `HAC-HIL-13c`; `HIL-BR-19`; `HIL-FR-33` | `HIL_BUN_COVERAGE_INCOMPLETE`, `HIL_BUN_CUTOVER_QUARANTINE_REMAINS`, `HIL_NODE_EVIDENCE_STALE` |

### §1.1 canonical assertion primary表

次表がHST-HIL-013のprimary integration採点表である。上の10 integration oracleはworkflow／faultを共有するsupporting実行表であり、
caseごとのstate/failure合否と11/11分母は次表だけから算出する。各receiptは固定provenanceへbindする。

| HST正本 | 主IT | supporting主U | pre_state | expected_state | failure正本 |
|---|---|---|---|---|---|
| `HST-CASE-013-01` | `IT-NCUT-008` | `U-NCUT-012` | `verifying` | `verified` | `なし（正常系）` |
| `HST-CASE-013-02` | `IT-NCUT-010` | `U-NCUT-004` | `verifying` | `failed` | `HIL_ACTIVE_BUN_DEPENDENCY` |
| `HST-CASE-013-03` | `IT-NCUT-010` | `U-NCUT-004` | `verifying` | `failed` | `HIL_ACTIVE_BUN_COMMAND` |
| `HST-CASE-013-04` | `IT-NCUT-010` | `U-NCUT-004` | `verifying` | `failed` | `HIL_ACTIVE_BUN_LOCKFILE` |
| `HST-CASE-013-05` | `IT-NCUT-010` | `U-NCUT-004` | `verifying` | `failed` | `HIL_ACTIVE_BUN_CI` |
| `HST-CASE-013-06` | `IT-NCUT-010` | `U-NCUT-004` | `verifying` | `failed` | `HIL_ACTIVE_BUN_DISTRIBUTION` |
| `HST-CASE-013-07` | `IT-NCUT-010` | `U-NCUT-012` | `verifying` | `verifying` | `HIL_BUN_CUTOVER_QUARANTINE_REMAINS` |
| `HST-CASE-013-08` | `IT-NCUT-008` | `U-NCUT-012` | `assertion_input_ready` | `assertion_pass` | `HIL_ACTIVE_BUN_DEPENDENCY` |
| `HST-CASE-013-09` | `IT-NCUT-009` | `U-NCUT-003` | `assertion_input_ready` | `assertion_pass` | `HIL_BUN_COVERAGE_INCOMPLETE` |
| `HST-CASE-013-10` | `IT-NCUT-002` | `U-NCUT-008` | `assertion_input_ready` | `assertion_pass` | `HIL_NODE_CONTROL_PLANE_INVALID` |
| `HST-CASE-013-11` | `IT-NCUT-008` | `U-NCUT-012` | `assertion_input_ready` | `assertion_pass` | `HIL_BUN_CUTOVER_INCOMPLETE` |

## §2 合否

Node minimumは`IT-NCUT-001`〜`IT-NCUT-005`の限定receiptを発行できるが、L8合格ではない。最終合格は11/11、
全必須workflow、active finding 0、quarantine 0、historical分類の全根拠、artifact/lock/offline evidence、
別runtime reviewが揃った場合だけとする。代表sample、Bun併存環境、mock command、検索結果だけでは合格にしない。

L6 public API→L7 U→L8 ITの全edgeを逆引きし、16 APIすべてにownerを一件要求する。rollbackのexecute/commit/reconcileは
`U-NCUT-013` / `IT-NCUT-011`の同一transaction supporting edgeである。plan→execute→commit→reconcileの4関数を固定順で全て実行し、
一部関数のgreenや別owner重複へ数えない。canonical 11 caseはL6/L7/L8間で
pre/expected stateとfailure codeをexact joinし、欠落edge、API名差、owner競合、`NodeCutoverFailureV1`外codeを合格にしない。

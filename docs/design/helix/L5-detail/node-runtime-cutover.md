---
title: "HELIX L5 詳細設計 — Node runtime cutover"
layer: L5
kind: add-design
status: draft
created: 2026-07-15
updated: 2026-07-15
owner: Codex / TL
plan: PLAN-L1-07-infinity-loop-platform-requirements
design_slice: HDS-HIL-13
related_l3: docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md
related_l4: docs/design/helix/L4-basic-design/infinity-loop-platform-basic-design.md
related_hst: [HST-HIL-013]
pair_artifact: docs/test-design/helix/L5-node-runtime-cutover-integration-test-design.md
next_pair_freeze: L8
requirements:
  - HR-FR-HIL-13
  - HIL-BR-19
  - HIL-FR-33
  - HIL-TR-01
  - HIL-TR-11
  - HAC-HIL-13a
  - HAC-HIL-13b
  - HAC-HIL-13c
---

# HELIX L5 詳細設計 — Node runtime cutover

## §0 決定境界

本書はL4 §10のP0〜P5を、`Node minimum`と`Bun cutover`の二段gateへ詳細化する。ADR-001は現在も
TypeScript strict/Bun runtime、`bun:sqlite`、`bun build --compile`を拘束するaccepted decisionである。
したがって本書はADR-001を上書きしない。新しいruntime ADR（ID未採番）がADR-001のruntime、SQLite、build、
distribution部分を明示的にsupersedeし、POが承認するまでは本書をdraftの設計候補とし、package、lock、CI、runtime、
distributionを変更しない。TypeScript strict、zod単一正本、clean rebuild、薄いOS入口は維持候補とする。

選定候補はNode.js 22 LTS（minimum `22.12.0`）、npm、canonical `package-lock.json`、開発時`tsx`、
bundled ESM `dist/helix.mjs`である。これはfreeze済み決定ではない。新ADRはADR-005/ADR-007を含む関連決定、
Windows/Linux配布、単一ファイル要件、`node:sqlite`の安定性を同時に再評価しなければならない。

## §1 二段cutoverと状態機械

| gate | L4 phase | entry | PASS | PASSではないもの |
|---|---|---|---|---|
| `NodeMinimumGate` | P0–P1 | 全surface inventoryと固定Node環境 | BunなしでNode install、typecheck、targeted test、source CLI、SQLite、暫定buildがgreen | Bun残存の完了、HAC-HIL-13a、cutover完了 |
| `BunCutoverGate` | P2–P5 | Node minimum receipt、全adapter/distribution移行 | clean Linuxの全canonical workflowがgreen、active Bun finding 0、quarantine 0 | 一部互換、期限なしallowlist、Bun fallback |

状態は`inventoried -> node_minimum_ready -> node_minimum_green -> migrating -> cutover_ready -> cutover_green`とする。
inventory、lock、source、workflow、artifact、allowlistのdigest driftは該当receiptを`stale`へ送る。failure後のsilent PASS、
phase飛越、`node_minimum_green`をterminal completionへ読み替えることを禁止する。

## §2 全surface inventory

`RuntimeSurfaceInventory`はrepo HEADと明示scopeから次のsurfaceを機械列挙する。検索語の単純件数ではなく、
`surface_id`、path、line/span、kind、active/historical、detector rule/version、content digest、consumer、dispositionを持つ。

| surface kind | 必須対象 |
|---|---|
| runtime/source | 起動行、import、動的load、`globalThis.Bun`、Bun API、Node API、process/path/sqlite adapter、fallback |
| package/toolchain | `engines`、`packageManager`、script、依存、lockfile、導入・型検査・lint・test・buildのrunner |
| CLI/hook | source CLI、built CLI、POSIX/PowerShell wrapper、Claude/Codex hookのcommand、session command |
| tests | unit/integration/system fixture、helper、snapshot、test command、runtime条件分岐 |
| CI/template | source workflow、再利用workflow、consumer template、生成workflow、setup action、cache key |
| setup/consumer | `helix setup`、project projection、doctor/lint、生成command、review packet、evidence producer |
| distribution | build成果物、package metadata、bin/link、clean install、offline cache、archive、consumer smoke |
| rules/docs | active AGENTS/CLAUDE/process/governance/exampleの実行可能command。archive/historicalは別分類 |

active scopeからの除外はglobだけで行わない。`historical`はcanonical executionから到達不能で、理由、source authority、
content digest、reviewer、再entry条件を持つ行だけ許可する。active allowlist、期限なしquarantine、generated surfaceの未走査、
fallbackを「互換」として除外することを禁止する。baseline countはscanごとに再計算し、固定件数を分母の代用にしない。

## §3 moduleとartifact

| module | 責務 | write authority |
|---|---|---|
| `RuntimeSurfaceInventory` | 全surfaceを決定的に列挙しsnapshot化 | evidence bundleのみ |
| `BunDependencyClassifier` | API/command/lock/CI/distribution等へ分類 | finding proposalのみ |
| `HistoricalRuntimeAllowlist` | historical根拠と到達不能性を検証 | allowlist receiptのみ |
| `NodeToolchainContract` | Node/npm/lock/source runner/build候補を検証 | なし |
| `NodeBuildArtifactVerifier` | ESM artifact、bin、exit/output parityを検証 | receiptのみ |
| `NodeWorkflowRunner` | clean Linuxでcanonical workflowを実行 | isolated workspaceのみ |
| `NodeMinimumGate` | P0–P1の限定PASSを評価 | gate receiptのみ |
| `BunCutoverGate` | P2–P5、active 0/quarantine 0を評価 | gate receiptのみ |
| `CutoverEvidenceStore` | content-addressed evidenceをimmutable publish | evidence rootのみ |

正規bundle候補は`.helix/evidence/node-runtime-cutover/<snapshot_id>/`とし、
`runtime-surface-inventory.jsonl`、`bun-dependency-findings.jsonl`、`historical-allowlist.jsonl`、
`node-workflow-evidence.jsonl`、`node-minimum-receipt.json`、`bun-cutover-receipt.json`を持つ。
各receiptはHEAD、scope、schema/rule/toolchain/lock/artifact/workflow digest、command、exit、stdout/stderr digest、
producer、created_at、status、failure codesへbindする。secret、credential、環境変数値、source本文は保存しない。

## §4 Node canonical workflow候補

新ADR承認後の候補順は、clean checkout、Node version検証、`npm ci`、`npm run typecheck`、`npm run lint`、
単体、結合、source CLI smoke、build、built CLI同値性、SQLite再構築、hook/session smoke、package、consumer install、
offline-cache install、Bun dependency scanである。Node minimumはtargeted testまでを許せるが、cutoverは省略せず全順序を走る。
Linuxをfull gate、macOS/Windowsを同一fixtureのcompatibility smokeとし、OS別lockを作らない。

## §5 rollback／failure／exit契約

### §5.1 cutover rollback契約

cutover実行前にprevious known-good release ID、artifact digest、DB schema/data revisionと新旧binary双方の互換判定、
state backup digest、復旧command digestを固定する。triggerは起動不能、DB migration/consumer互換違反、required workflow退行、
監視window内のhealth/error閾値違反へ限定し、実行にはtrigger digestへbindしたaction-binding approvalを必須とする。
状態は`cutover_applying -> monitoring -> cutover_green`または`rollback_required -> rollback_approved -> rolling_back -> rolled_back -> monitoring`とする。

rollbackはartifact、DB/state、current release pointerを一つのoperation bundleでCASし、receiptへbefore/after release、artifact、DB revision、
approval、trigger、backup、各action count、monitoring windowとhealth receiptを残す。各action直後faultは旧known-goodをcurrentのまま保つか、
rollback再開可能な非current stagingだけを残す。rollback後はcutover terminal=falseであり、たとえ旧releaseがBunを含んでも
成功cutoverの`active Bun 0 / fallback 0 / quarantine 0`条件を弱めず、再inventoryからやり直す。
rollback planは実行証拠ではない。公開Node API `executeNodeCutoverRollback(bundle, port)`はportの単一
`commitRollback(bundle)`だけを呼び、restore action、CAS、event、receipt、monitoring開始をport内部の固定順で不可分実行する。
途中faultは同一operation/digest/expected revisionによる`reconcileNodeCutoverRollback`だけが再開し、個別restore methodを公開しない。

### §5.2 failure code定義

| code | 条件 |
|---|---|
| `HIL_NODE_RUNTIME_UNSUPPORTED` | Node version/featureが候補契約外 |
| `HIL_NODE_LOCK_MISSING` | canonical Node lockなし |
| `HIL_NODE_LOCK_DRIFT` | manifest/lock/install tree不一致 |
| `HIL_NODE_SOURCE_ENTRY_UNRESOLVABLE` | Node source CLIがmodule解決不能 |
| `HIL_NODE_BUILD_ARTIFACT_INVALID` | artifact/bin/parity/digest不正 |
| `HIL_NODE_WORKFLOW_UNVERIFIED` | 必須workflow evidence欠落または非green |
| `HIL_BUN_ACTIVE_DEPENDENCY` | active Bun依存を1件以上検出 |
| `HIL_BUN_COVERAGE_INCOMPLETE` | surface未分類、分母欠落、generated未走査 |
| `HIL_ACTIVE_BUN_RUNTIME_API` | active source/importがBun APIまたはglobalを参照 |
| `HIL_ACTIVE_BUN_LOADER` | shebang、source runner、dynamic loaderがBunを要求 |
| `HIL_ACTIVE_BUN_COMMAND` | active command/scriptがBunを実行 |
| `HIL_ACTIVE_BUN_PACKAGE` | engine、package manager、script、dependencyがBunを要求 |
| `HIL_ACTIVE_BUN_LOCKFILE` | active Bun lockfileが存在 |
| `HIL_ACTIVE_BUN_CI` | active CI/setup/cacheがBunに依存 |
| `HIL_ACTIVE_BUN_HOOK` | Claude/Codex hookまたはwrapperがBunに依存 |
| `HIL_ACTIVE_BUN_TEST` | test、fixture、helper、runnerがBunに依存 |
| `HIL_ACTIVE_BUN_TEMPLATE` | consumer/reusable/generated templateがBunを射影 |
| `HIL_ACTIVE_BUN_SETUP` | setup/project projectionがBunを導入または要求 |
| `HIL_ACTIVE_BUN_DISTRIBUTION` | artifact/package/consumer経路にBunが残存 |
| `HIL_ACTIVE_BUN_FALLBACK` | compatibility/fallback/quarantine経路がBunへ到達 |
| `HIL_ACTIVE_BUN_RULE_COMMAND` | active rule/doc/exampleがBun commandを正規経路として指示 |
| `HIL_BUN_HISTORICAL_ALLOWLIST_INVALID` | historical根拠、digest、到達不能性が不正 |
| `HIL_BUN_CUTOVER_QUARANTINE_REMAINS` | quarantine/fallbackが1件以上残存 |
| `HIL_NODE_CONTROL_PLANE_INVALID` | Node control plane契約不成立 |
| `HIL_BUN_CUTOVER_INCOMPLETE` | 最終workflow、active 0、quarantine 0のいずれか未達 |
| `HIL_NODE_EVIDENCE_STALE` | HEAD、scope、rule、lock、artifact、workflowのdrift |
| `HIL_NODE_CUTOVER_ROLLBACK_UNSAFE` | known-good release/artifact/DB互換、backup、trigger、approvalのいずれか欠落 |
| `HIL_NODE_CUTOVER_MONITORING_FAILED` | cutover後またはrollback後の監視windowでhealth/error閾値違反 |

CLI exit候補は成功0、契約/gate failure 2、I/O 3、internal 4。stdoutはschema準拠JSON、診断はstderrとする。

## §6 双方向traceとfreeze

| 正本 | L5での充足 | 対応するL8 oracle |
|---|---|---|
| `HR-FR-HIL-13`; `HAC-HIL-13a` | Node全workflowとBun-less clean Linux | `IT-NCUT-001`, `IT-NCUT-002`, `IT-NCUT-003`, `IT-NCUT-004`, `IT-NCUT-005`, `IT-NCUT-006`, `IT-NCUT-007`, `IT-NCUT-008` |
| `HR-FR-HIL-13`; `HAC-HIL-13b` | 全surface inventoryとactive finding | `IT-NCUT-009`, `IT-NCUT-010` |
| `HR-FR-HIL-13`; `HAC-HIL-13c` | historical allowlist分離、quarantine 0 | `IT-NCUT-009`, `IT-NCUT-010` |
| `HIL-BR-19`; `HIA-BR-019` | completionはcutover gateだけ | `IT-NCUT-008`, `IT-NCUT-010` |
| `HIL-FR-33`; `HIA-FR-033` | dependency coverage | `IT-NCUT-009`, `IT-NCUT-010` |
| `HIL-TR-01`; `HIA-TR-001` | Node control plane | `IT-NCUT-002`, `IT-NCUT-003`, `IT-NCUT-004`, `IT-NCUT-005`, `IT-NCUT-006` |
| `HIL-TR-11`; `HIA-TR-011` | Bun-free canonical workflow | `IT-NCUT-001`, `IT-NCUT-007`, `IT-NCUT-008`, `IT-NCUT-009` |

### §6.1 canonical assertion primary表

次表はHST-HIL-013の11件を主ITへ一意にbindするL5/L8 primary採点表である。主UはL6/L7へのsupporting参照であり、
case分母へ重複加算しない。各行のevidenceは固定HEAD、inventory/rule、toolchain/lock、artifact/workflow provenanceへbindする。

| HST正本 | 主IT | supporting主U | pre_state | expected_state | failure正本 |
|---|---|---|---|---|---|
| `HST-CASE-013-01` | `IT-NCUT-008` | `U-NCUT-012` | `verifying` | `verified` | `なし（正常系）` |
| `HST-CASE-013-02` | `IT-NCUT-010` | `U-NCUT-004` | `verifying` | `failed` | `HIL_ACTIVE_BUN_DEPENDENCY` |
| `HST-CASE-013-03` | `IT-NCUT-010` | `U-NCUT-004` | `verifying` | `failed` | `HIL_ACTIVE_BUN_COMMAND` |
| `HST-CASE-013-04` | `IT-NCUT-010` | `U-NCUT-004` | `verifying` | `failed` | `HIL_ACTIVE_BUN_LOCKFILE` |
| `HST-CASE-013-05` | `IT-NCUT-010` | `U-NCUT-004` | `verifying` | `failed` | `HIL_ACTIVE_BUN_CI` |
| `HST-CASE-013-06` | `IT-NCUT-010` | `U-NCUT-004` | `verifying` | `failed` | `HIL_ACTIVE_BUN_DISTRIBUTION` |
| `HST-CASE-013-07` | `IT-NCUT-010` | `U-NCUT-012` | `verifying` | `verifying` | `HIL_BUN_CUTOVER_QUARANTINE_REMAINS` |
| `HST-CASE-013-08` | `IT-NCUT-008` | `U-NCUT-012` | `assertion_input_ready` | `assertion_pass` | `HIL_BUN_ACTIVE_DEPENDENCY` |
| `HST-CASE-013-09` | `IT-NCUT-009` | `U-NCUT-003` | `assertion_input_ready` | `assertion_pass` | `HIL_BUN_COVERAGE_INCOMPLETE` |
| `HST-CASE-013-10` | `IT-NCUT-002` | `U-NCUT-008` | `assertion_input_ready` | `assertion_pass` | `HIL_NODE_CONTROL_PLANE_INVALID` |
| `HST-CASE-013-11` | `IT-NCUT-008` | `U-NCUT-012` | `assertion_input_ready` | `assertion_pass` | `HIL_BUN_CUTOVER_INCOMPLETE` |

freezeには新ADRのaccepted/PO承認、11/11 integration、13/13 unit、全surface inventory、active finding 0、
quarantine 0、clean Linux全workflow、macOS/Windows smoke、lock/offline/SBOM evidence、別runtime reviewを要求する。
本書とテスト設計だけではcutoverの実装・承認・完了を主張しない。

artifact、DB state、release pointerはheterogeneous resourceとして全件prepare/stage/verifyしてからpointer CASをcommit pointとする。
commit前faultはcurrent不変、commit後faultはcheckpoint recoveryまたはcompensationで新旧混在を0にする。

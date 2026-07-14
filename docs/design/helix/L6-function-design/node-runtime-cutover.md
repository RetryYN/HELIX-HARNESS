---
title: "HELIX L6 機能設計 — Node runtime cutover"
layer: L6
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
related_l5: docs/design/helix/L5-detail/node-runtime-cutover.md
pair_artifact: docs/test-design/helix/L6-node-runtime-cutover-unit-test-design.md
next_pair_freeze: L7
requirements:
  - HR-FR-HIL-13
  - HAC-HIL-13a
  - HAC-HIL-13b
  - HAC-HIL-13c
---

# HELIX L6 機能設計 — Node runtime cutover

## §0 authority

本機能設計はpure判定とadapter境界を定義するdraftであり、ADR-001をsupersedeしない。新runtime ADRのaccepted/PO承認前は
APIをactive gateへ配線せず、現行`runtime-portability`/`toolchain-pin`のBun拘束を勝手に反転しない。

## §1 schema/APIとexact unit oracle

| API | 署名 | DbC | 対応するoracle |
|---|---|---|---|
| `canonicalizeRuntimeInventoryRequest` | `(raw: unknown) => RuntimeInventoryRequest` | repo-relative scope、HEAD、rule versionをstrict検証 | `U-NCUT-001` |
| `enumerateRuntimeSurfaces` | `(request, reader) => Promise<RuntimeSurface[]>` | 全surface kindをstable順で列挙、read-only | `U-NCUT-002` |
| `classifyRuntimeSurface` | `(surface, rules) => RuntimeSurfaceClassification` | exactly-oneでactive/historical、kind、reasonを確定 | `U-NCUT-003` |
| `detectBunDependency` | `(surface, classification) => BunDependencyFinding[]` | API/command/lock/CI/distribution等を重複なく検出 | `U-NCUT-004` |
| `validateHistoricalAllowlist` | `(rows, inventory) => AllowlistReport` | active行禁止、digest/authority/到達不能性を検証 | `U-NCUT-005` |
| `validateNodeRuntime` | `(actual, contract) => NodeRuntimeReport` | Node floor/LTS/featureを決定的評価 | `U-NCUT-006` |
| `validateNodeLock` | `(manifest, lock, installed) => NodeLockReport` | canonical lock、frozen install、tree一致 | `U-NCUT-007` |
| `planNodeSourceExecution` | `(entry, resolver, runner) => NodeSourcePlan` | source import graph解決、Bun loader/command 0、write 0 | `U-NCUT-008` |
| `planNodeBuild` | `(entry, buildContract) => NodeBuildPlan` | ESM/bin/target/externalを明示、未許可native dependency拒否 | `U-NCUT-009` |
| `verifyNodeArtifact` | `(artifact, sourceOracle) => ArtifactReport` | digest、shebang/bin、source parity、Bun markerを検査 | `U-NCUT-010` |
| `evaluateNodeMinimum` | `(inventory, runtime, lock, workflows) => NodeMinimumReceipt` | P0–P1だけ評価しterminal=falseを固定 | `U-NCUT-011` |
| `evaluateBunCutover` | `(minimum, inventory, findings, allowlist, workflows) => BunCutoverReceipt` | 全workflow green、active 0、quarantine 0、stale 0のみPASS | `U-NCUT-012` |
| `planNodeCutoverRollback` | `(current: CutoverStateV1, previous: KnownGoodReleaseV1, trigger: RollbackTriggerV1, approval: ActionBindingApprovalV1, policy: RollbackPolicyV1) => Result<CutoverRollbackBundleV1, NodeCutoverFailure>` | release/artifact/DB互換、backup、trigger-bound approval、monitor window、固定action順を完全検証 | `U-NCUT-013` |
| `executeNodeCutoverRollback` | `(bundle: CutoverRollbackBundleV1, port: NodeCutoverRollbackPort) => Promise<Result<CutoverRollbackReceiptV1, NodeCutoverFailure>>` | restore actionを固定順/CASで実行しfaultをreconcile可能なstagingへ閉じる | `U-NCUT-013` |
| `commitNodeCutoverRollback` | `(bundle: CutoverRollbackBundleV1, port: NodeCutoverRollbackPort) => Promise<Result<CutoverRollbackReceiptV1, NodeCutoverFailure>>` | portの単一`commitRollback`で全restore/CAS/receiptを不可分commit | `U-NCUT-013` |
| `reconcileNodeCutoverRollback` | `(bundle: CutoverRollbackBundleV1, port: NodeCutoverRollbackPort) => Promise<Result<CutoverRollbackReceiptV1, NodeCutoverFailure>>` | 同一operation/digest/expected revisionだけを`reconcileRollback`で収束 | `U-NCUT-013` |

### §1.1 canonical assertion primary表

次表はHST-HIL-013の11件を主API／主Uへ一意にbindするL6/L7 primary採点表である。supporting主ITはL8とのtraceであり、
case分母へ重複加算しない。判定入力は固定HEAD、inventory/rule、toolchain/lock、artifact/workflow provenanceを必須とする。

| HST正本 | 主API | 主U | supporting主IT | pre_state | expected_state | failure正本 |
|---|---|---|---|---|---|---|
| `HST-CASE-013-01` | `evaluateBunCutover` | `U-NCUT-012` | `IT-NCUT-008` | `verifying` | `verified` | `なし（正常系）` |
| `HST-CASE-013-02` | `detectBunDependency` | `U-NCUT-004` | `IT-NCUT-010` | `verifying` | `failed` | `HIL_ACTIVE_BUN_DEPENDENCY` |
| `HST-CASE-013-03` | `detectBunDependency` | `U-NCUT-004` | `IT-NCUT-010` | `verifying` | `failed` | `HIL_ACTIVE_BUN_COMMAND` |
| `HST-CASE-013-04` | `detectBunDependency` | `U-NCUT-004` | `IT-NCUT-010` | `verifying` | `failed` | `HIL_ACTIVE_BUN_LOCKFILE` |
| `HST-CASE-013-05` | `detectBunDependency` | `U-NCUT-004` | `IT-NCUT-010` | `verifying` | `failed` | `HIL_ACTIVE_BUN_CI` |
| `HST-CASE-013-06` | `detectBunDependency` | `U-NCUT-004` | `IT-NCUT-010` | `verifying` | `failed` | `HIL_ACTIVE_BUN_DISTRIBUTION` |
| `HST-CASE-013-07` | `evaluateBunCutover` | `U-NCUT-012` | `IT-NCUT-010` | `verifying` | `verifying` | `HIL_BUN_CUTOVER_QUARANTINE_REMAINS` |
| `HST-CASE-013-08` | `evaluateBunCutover` | `U-NCUT-012` | `IT-NCUT-008` | `assertion_input_ready` | `assertion_pass` | `HIL_BUN_ACTIVE_DEPENDENCY` |
| `HST-CASE-013-09` | `classifyRuntimeSurface` | `U-NCUT-003` | `IT-NCUT-009` | `assertion_input_ready` | `assertion_pass` | `HIL_BUN_COVERAGE_INCOMPLETE` |
| `HST-CASE-013-10` | `planNodeSourceExecution` | `U-NCUT-008` | `IT-NCUT-002` | `assertion_input_ready` | `assertion_pass` | `HIL_NODE_CONTROL_PLANE_INVALID` |
| `HST-CASE-013-11` | `evaluateBunCutover` | `U-NCUT-012` | `IT-NCUT-008` | `assertion_input_ready` | `assertion_pass` | `HIL_BUN_CUTOVER_INCOMPLETE` |

主要schema候補は`src/schema/node-runtime-cutover.ts`を唯一の正本とする。

```ts
interface RuntimeSurface {
  surface_id: string;
  path: string;
  span: { start_line: number; end_line: number };
  kind: "runtime" | "package" | "cli-hook" | "test" | "ci-template" |
    "setup-consumer" | "distribution" | "rule-doc";
  lifecycle: "active" | "historical";
  content_digest: string;
  consumer_ids: string[];
}

interface BunCutoverReceipt {
  schema_version: "bun-cutover-receipt.v1";
  snapshot_id: string;
  status: "pass" | "blocked" | "failed" | "stale";
  terminal: true;
  active_bun_count: 0;
  quarantine_count: 0;
  required_workflow_count: number;
  green_workflow_count: number;
  evidence_root_digest: string;
  failure_codes: string[];
}

interface KnownGoodReleaseV1 { release_id: string; artifact_digest: string; db_schema_revision: number; db_data_digest: string; compatibility_receipt_digest: string; state_backup_digest: string }
interface RollbackPreparedResourceV1 { resource: "artifact" | "db_state" | "release_pointer"; current_digest: string; staged_restore_digest: string; verification_digest: string; compensation_digest: string }
interface CutoverRollbackBundleV1 { operation_id: string; operation_digest: string; expected_current_release_id: string; expected_state_revision: number; previous: KnownGoodReleaseV1; trigger_digest: string; approval_digest: string; prepared_resources: [RollbackPreparedResourceV1, RollbackPreparedResourceV1, RollbackPreparedResourceV1]; recovery_checkpoint_digest: string; compensation_plan_digest: string; action_order: ["prepare_all", "verify_staging", "commit_pointer_cas", "append_event", "write_receipt", "start_monitoring"]; monitoring_window_ms: number; write_set_digest: string }
interface CutoverRollbackReceiptV1 { operation_id: string; before_release_id: string; after_release_id: string; artifact_digest: string; db_schema_revision: number; state_revision: number; trigger_digest: string; approval_digest: string; status: "rolled_back" | "rollback_failed" | "monitoring_failed"; cutover_terminal: false; monitoring_started_at: string; monitoring_ends_at: string; health_receipt_digest: string; action_counts: Record<string, number> }
interface NodeCutoverRollbackPort { commitRollback(bundle: CutoverRollbackBundleV1): Promise<Result<CutoverRollbackReceiptV1, NodeCutoverFailure>>; reconcileRollback(bundle: CutoverRollbackBundleV1): Promise<Result<CutoverRollbackReceiptV1, NodeCutoverFailure>>; findRollbackReceipt(operationId: string): Promise<CutoverRollbackReceiptV1 | null> }
```

artifact/DB/pointerは同一transactionを偽称せず、全resourceを非current stagingへprepareしてdigest検証後、pointer CASだけをcommit pointとする。
commit前faultはstaging破棄、commit後faultはrecovery checkpointからcompleteまたはcompensationし、currentを新旧混在させない。
同operation同digestは元receiptと全count 0、異digest/revision conflictはaction 0とする。rollback receiptはBun cutover PASS receiptではない。

## §2 配置候補と既存codeの変更境界

| path | 責務 / 変更候補 |
|---|---|
| `src/schema/node-runtime-cutover.ts` | schema、failure union、receiptの定義 |
| `src/runtime/node-runtime-cutover.ts` | 副作用のないclassification/gate判定 |
| `src/lint/bun-dependency-coverage.ts` | 全surface collector/detector |
| `src/lint/runtime-portability.ts` | accepted ADR後にNode正規契約へ置換 |
| `src/lint/toolchain-pin.ts` | accepted ADR後にNode/npm/lock/workflow pinへ置換 |
| `src/runtime/node-build.ts` | source/build/artifactのadapter |
| `src/cli/commands/runtime-cutover.ts` | inventory/minimum/cutoverの読取・評価CLI |
| `src/state-db/index.ts` | `bun:sqlite`分岐を除去し`node:sqlite`へ一本化 |
| `src/orchestration/job-queue.ts` | SQLite driver分岐を除去 |
| `src/cli.ts` | Node shebang/source entryへ変更 |

実装時はpackage/lock、scripts、hooks、tests、CI、templates、setup、distribution、docs/rulesも同一inventoryで追跡する。
scannerだけ先行してactive 0を主張せず、generated consumerと配布artifactを必ず再走査する。

## §3 result、冪等性、stale

全public APIはknown failureをdiscriminated unionで返す。unknown exceptionは`HIL_NODE_CUTOVER_INTERNAL_ERROR`へ
cause digest付きで境界変換する。同一HEAD/scope/rule/toolchain/lock/workflow入力は同一stable sort、finding、receipt digestを返す。
時刻、絶対path、実行順を意味digestへ含めない。入力digest変更時は旧receiptをstaleにし、上書きしない。

## §4 WBS候補

1. 新runtime ADRを起票し、Node LTS/npm/source runner/build/distributionをPO承認する。
2. 13 unitをRed化し、schema、canonical ID、inventory/classifier、rollback contractを実装する。
3. Node runtime/lock/source/build/artifactのpure contractとadapterを実装する。
4. Node minimumをclean Linuxでgreen化するがterminal completionを発行しない。
5. SQLite、CLI、hook、tests、CI、template、setup、distributionをNodeへ移行する。
6. fallback、Bun API/command/lock/action/cache/artifactを撤去する。
7. 全surfaceを再走査し、active 0、quarantine 0、11 integrationをgreen化する。
8. macOS/Windows smoke、offline install、SBOM、別runtime review後にpair-freezeへ出す。

## §5 双方向trace

| 機能 | 単体oracle | 結合oracle | 要求正本 |
|---|---|---|---|
| `canonicalizeRuntimeInventoryRequest` | `U-NCUT-001` | `IT-NCUT-009` | `HAC-HIL-13b`; `HIL-FR-33` |
| `enumerateRuntimeSurfaces` | `U-NCUT-002` | `IT-NCUT-009` | `HAC-HIL-13b`; `HIL-FR-33` |
| `classifyRuntimeSurface` | `U-NCUT-003` | `IT-NCUT-009` | `HAC-HIL-13b`; `HAC-HIL-13c` |
| `detectBunDependency` | `U-NCUT-004` | `IT-NCUT-009`, `IT-NCUT-010` | `HIL-FR-33`; `HIA-FR-033` |
| `validateHistoricalAllowlist` | `U-NCUT-005` | `IT-NCUT-009`, `IT-NCUT-010` | `HAC-HIL-13c` |
| `validateNodeRuntime` | `U-NCUT-006` | `IT-NCUT-001`, `IT-NCUT-002` | `HIL-TR-01`; `HIA-TR-001` |
| `validateNodeLock` | `U-NCUT-007` | `IT-NCUT-001` | `HAC-HIL-13a`; `HIL-TR-11` |
| `planNodeSourceExecution` | `U-NCUT-008` | `IT-NCUT-003`, `IT-NCUT-006` | `HIL-TR-01` |
| `planNodeBuild` | `U-NCUT-009` | `IT-NCUT-004`, `IT-NCUT-008` | `HIL-TR-01`; `HIL-TR-11` |
| `verifyNodeArtifact` | `U-NCUT-010` | `IT-NCUT-004`, `IT-NCUT-008` | `HAC-HIL-13a`; `HIL-TR-11` |
| `evaluateNodeMinimum` | `U-NCUT-011` | `IT-NCUT-001`, `IT-NCUT-002`, `IT-NCUT-003`, `IT-NCUT-004`, `IT-NCUT-005` | `HR-FR-HIL-13`; P1 |
| `evaluateBunCutover` | `U-NCUT-012` | `IT-NCUT-006`, `IT-NCUT-007`, `IT-NCUT-008`, `IT-NCUT-009`, `IT-NCUT-010` | `HR-FR-HIL-13`; `HIL-BR-19`; `HIL-TR-11` |
| `planNodeCutoverRollback` | `U-NCUT-013` | `IT-NCUT-011` | cutover操作承認の安全契約 |
| `executeNodeCutoverRollback` / `commitNodeCutoverRollback` / `reconcileNodeCutoverRollback` | `U-NCUT-013` | `IT-NCUT-011` | rollback実行・fault・CAS・reconcile契約 |

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
| `canonicalizeRuntimeInventoryRequest` | `(raw: unknown) => ResultV1<RuntimeInventoryRequestV1, NodeCutoverFailureV1>` | repo-relative scope、HEAD、rule versionをstrict検証 | `U-NCUT-001` |
| `enumerateRuntimeSurfaces` | `(request, reader) => Promise<RuntimeSurfaceV1[]>` | 全surface kindをstable順で列挙、read-only | `U-NCUT-002` |
| `classifyRuntimeSurface` | `(surface, rules) => ResultV1<RuntimeSurfaceClassificationV1, NodeCutoverFailureV1>` | exactly-oneでactive/historical、kind、reasonを確定 | `U-NCUT-003` |
| `detectBunDependency` | `(surface, classification) => BunDependencyFindingV1[]` | API/command/lock/CI/distribution等を重複なく検出 | `U-NCUT-004` |
| `validateHistoricalAllowlist` | `(rows, inventory) => AllowlistReportV1` | active行禁止、digest/authority/到達不能性を検証 | `U-NCUT-005` |
| `validateNodeRuntime` | `(actual, contract) => NodeRuntimeReportV1` | Node floor/LTS/featureを決定的評価 | `U-NCUT-006` |
| `validateNodeLock` | `(manifest, lock, installed) => NodeLockReportV1` | canonical lock、frozen install、tree一致 | `U-NCUT-007` |
| `planNodeSourceExecution` | `(entry, resolver, runner) => ResultV1<NodeSourcePlanV1, NodeCutoverFailureV1>` | source import graph解決、Bun loader/command 0、write 0 | `U-NCUT-008` |
| `planNodeBuild` | `(entry, buildContract) => ResultV1<NodeBuildPlanV1, NodeCutoverFailureV1>` | ESM/bin/target/externalを明示、未許可native dependency拒否 | `U-NCUT-009` |
| `verifyNodeArtifact` | `(artifact, sourceOracle) => NodeArtifactReportV1` | digest、shebang/bin、source parity、Bun markerを検査 | `U-NCUT-010` |
| `evaluateNodeMinimum` | `(inventory, runtime, lock, workflows) => NodeMinimumReceiptV1` | P0–P1だけ評価しterminal=falseを固定 | `U-NCUT-011` |
| `evaluateBunCutover` | `(minimum, inventory, findings, allowlist, workflows) => BunCutoverReceiptV1` | 全workflow green、active 0、quarantine 0、stale 0のみPASS | `U-NCUT-012` |
| `planNodeCutoverRollback` | `(current: CutoverStateV1, previous: KnownGoodReleaseV1, trigger: RollbackTriggerV1, approval: ActionBindingApprovalV1, policy: RollbackPolicyV1) => ResultV1<CutoverRollbackBundleV1, NodeCutoverFailureV1>` | release/artifact/DB互換、backup、trigger-bound approval、monitor window、固定action順を完全検証 | `U-NCUT-013` |
| `executeNodeCutoverRollback` | `(bundle: CutoverRollbackBundleV1, port: NodeCutoverRollbackPortV1) => Promise<ResultV1<CutoverRollbackReceiptV1, NodeCutoverFailureV1>>` | restore actionを固定順/CASで実行しfaultをreconcile可能なstagingへ閉じる | `U-NCUT-013` |
| `commitNodeCutoverRollback` | `(bundle: CutoverRollbackBundleV1, port: NodeCutoverRollbackPortV1) => Promise<ResultV1<CutoverRollbackReceiptV1, NodeCutoverFailureV1>>` | portの単一`commitRollback`で全restore/CAS/receiptを不可分commit | `U-NCUT-013` |
| `reconcileNodeCutoverRollback` | `(bundle: CutoverRollbackBundleV1, port: NodeCutoverRollbackPortV1) => Promise<ResultV1<CutoverRollbackReceiptV1, NodeCutoverFailureV1>>` | 同一operation/digest/expected revisionだけを`reconcileRollback`で収束 | `U-NCUT-013` |

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
| `HST-CASE-013-08` | `evaluateBunCutover` | `U-NCUT-012` | `IT-NCUT-008` | `assertion_input_ready` | `assertion_pass` | `HIL_ACTIVE_BUN_DEPENDENCY` |
| `HST-CASE-013-09` | `classifyRuntimeSurface` | `U-NCUT-003` | `IT-NCUT-009` | `assertion_input_ready` | `assertion_pass` | `HIL_BUN_COVERAGE_INCOMPLETE` |
| `HST-CASE-013-10` | `planNodeSourceExecution` | `U-NCUT-008` | `IT-NCUT-002` | `assertion_input_ready` | `assertion_pass` | `HIL_NODE_CONTROL_PLANE_INVALID` |
| `HST-CASE-013-11` | `evaluateBunCutover` | `U-NCUT-012` | `IT-NCUT-008` | `assertion_input_ready` | `assertion_pass` | `HIL_BUN_CUTOVER_INCOMPLETE` |

G3前のschema authorityは、以下のlocal closed typesを唯一の正本とする。公開APIとportは未定義genericを使わず、
このslice-local `ResultV1<T, E>`だけを返す。

```ts
type ResultV1<T, E> =
  | { ok: true; value: T }
  | { ok: false; error: E };

interface RuntimeSurfaceV1 {
  schema_version: "helix-runtime-surface.v1";
  surface_id: string;
  path: string;
  span: { start_line: number; end_line: number };
  kind: "runtime" | "package" | "cli-hook" | "test" | "ci-template" |
    "setup-consumer" | "distribution" | "rule-doc";
  lifecycle: "active" | "historical";
  content_digest: string;
  consumer_ids: string[];
}

interface RuntimeInventoryRequestV1 { schema_version: "helix-runtime-inventory-request.v1"; head_commit: string; source_tree_digest: string; scope_paths: string[]; inventory_schema_version: string; detector_rule_version: string; detector_rule_digest: string; snapshot_id: string; request_digest: string }
interface RuntimeSurfaceClassificationV1 { surface_id: string; lifecycle: "active" | "historical"; kind: RuntimeSurfaceV1["kind"]; reason_code: string; reason_digest: string; authority_digest: string; reachability_evidence_digest: string; reentry_condition_digest: string | null; classification_digest: string }
interface BunDependencyFindingV1 { finding_id: string; surface_id: string; code: NodeCutoverFailureCodeV1; fingerprint: string; span: { start_line: number; end_line: number }; evidence_digest: string; snapshot_digest: string; status: "current" | "stale" }
interface AllowlistReportV1 { snapshot_digest: string; historical_surface_ids: string[]; historical_count: number; invalid_count: number; active_row_count: 0; reachability_set_digest: string; receipt_digest: string; failures: NodeCutoverFailureV1[] }
interface NodeRuntimeReportV1 { snapshot_digest: string; actual_version: string; required_minimum_version: string; lts: boolean; required_features: string[]; available_features: string[]; feature_set_digest: string; compatible: boolean; evidence_digest: string; failures: NodeCutoverFailureV1[] }
interface NodeLockReportV1 { snapshot_digest: string; manifest_digest: string; lock_path: string; lock_digest: string; canonical_lock_count: number; installed_tree_digest: string; frozen_install: boolean; compatible: boolean; evidence_digest: string; failures: NodeCutoverFailureV1[] }
interface NodeSourcePlanV1 { snapshot_digest: string; entry_path: string; resolver_id: string; runner_id: string; module_graph_digest: string; loader_id: string; command_digest: string; bun_loader_count: 0; bun_command_count: 0; planned_write_count: 0; plan_digest: string }
interface NodeBuildPlanV1 { snapshot_digest: string; entry_path: string; output_path: string; format: "esm"; target: string; bin_name: string; external_ids: string[]; build_command_digest: string; bun_command_count: 0; plan_digest: string }
interface NodeArtifactReportV1 { snapshot_digest: string; artifact_path: string; artifact_digest: string; source_oracle_digest: string; shebang_valid: boolean; bin_mapping_valid: boolean; source_parity_digest: string; embedded_bun_marker_count: 0; valid: boolean; evidence_digest: string; failures: NodeCutoverFailureV1[] }
interface NodeMinimumReceiptV1 { schema_version: "helix-node-minimum-receipt.v1"; snapshot_digest: string; status: "pass" | "blocked" | "failed" | "stale"; terminal: false; inventory_digest: string; runtime_report_digest: string; lock_report_digest: string; artifact_report_digest: string; required_workflow_ids: string[]; green_workflow_ids: string[]; workflow_set_digest: string; evidence_root_digest: string; failures: NodeCutoverFailureV1[] }
interface CutoverStateV1 { snapshot_digest: string; current_release_id: string; state_revision: number; phase: "cutover_applying" | "monitoring" | "cutover_green" | "rollback_required" | "rollback_approved" | "rolling_back" | "rolled_back"; artifact_digest: string; db_schema_revision: number; db_data_digest: string; release_pointer_digest: string }
interface RollbackTriggerV1 { trigger_id: string; kind: "startup_failure" | "db_or_consumer_incompatibility" | "required_workflow_regression" | "monitoring_threshold_breach"; observed_health_digest: string; threshold_policy_digest: string; trigger_digest: string; detected_at: string }
interface ActionBindingApprovalV1 { approval_id: string; action: "node_cutover_rollback"; operation_id: string; trigger_digest: string; approver_authority_id: string; issued_at: string; expires_at: string; constraint_digest: string; approval_digest: string }
interface RollbackPolicyV1 { policy_id: string; policy_version: string; policy_digest: string; allowed_triggers: RollbackTriggerV1["kind"][]; require_compatibility_receipt: true; require_state_backup: true; monitoring_window_ms: number; action_order: ["prepare_all", "verify_staging", "commit_pointer_cas", "append_event", "write_receipt", "start_monitoring"] }

type NodeCutoverFailureCodeV1 =
  | "HIL_NODE_RUNTIME_UNSUPPORTED" | "HIL_NODE_LOCK_MISSING" | "HIL_NODE_LOCK_DRIFT"
  | "HIL_NODE_SOURCE_ENTRY_UNRESOLVABLE" | "HIL_NODE_BUILD_ARTIFACT_INVALID" | "HIL_NODE_WORKFLOW_UNVERIFIED"
  | "HIL_ACTIVE_BUN_DEPENDENCY" | "HIL_BUN_COVERAGE_INCOMPLETE" | "HIL_ACTIVE_BUN_RUNTIME_API"
  | "HIL_ACTIVE_BUN_LOADER" | "HIL_ACTIVE_BUN_COMMAND" | "HIL_ACTIVE_BUN_PACKAGE" | "HIL_ACTIVE_BUN_LOCKFILE"
  | "HIL_ACTIVE_BUN_CI" | "HIL_ACTIVE_BUN_HOOK" | "HIL_ACTIVE_BUN_TEST" | "HIL_ACTIVE_BUN_TEMPLATE"
  | "HIL_ACTIVE_BUN_SETUP" | "HIL_ACTIVE_BUN_DISTRIBUTION" | "HIL_ACTIVE_BUN_FALLBACK"
  | "HIL_ACTIVE_BUN_RULE_COMMAND" | "HIL_BUN_HISTORICAL_ALLOWLIST_INVALID" | "HIL_BUN_CUTOVER_QUARANTINE_REMAINS"
  | "HIL_NODE_CONTROL_PLANE_INVALID" | "HIL_BUN_CUTOVER_INCOMPLETE" | "HIL_NODE_EVIDENCE_STALE"
  | "HIL_NODE_CUTOVER_ROLLBACK_UNSAFE" | "HIL_NODE_CUTOVER_MONITORING_FAILED" | "HIL_NODE_CUTOVER_INTERNAL_ERROR";
interface NodeCutoverFailureV1 { schema_version: "helix-node-cutover-failure.v1"; code: NodeCutoverFailureCodeV1; message_digest: string; cause_digest: string | null; evidence_digest: string; retryable: boolean; operation_id: string | null; snapshot_digest: string }

interface BunCutoverReceiptV1 {
  schema_version: "bun-cutover-receipt.v1";
  snapshot_id: string;
  status: "pass" | "blocked" | "failed" | "stale";
  terminal: true;
  active_bun_count: 0;
  quarantine_count: 0;
  required_workflow_count: number;
  green_workflow_count: number;
  evidence_root_digest: string;
  failures: NodeCutoverFailureV1[];
}

interface KnownGoodReleaseV1 { release_id: string; artifact_digest: string; db_schema_revision: number; db_data_digest: string; compatibility_receipt_digest: string; state_backup_digest: string }
interface RollbackPreparedResourceV1 { resource: "artifact" | "db_state" | "release_pointer"; current_digest: string; staged_restore_digest: string; verification_digest: string; compensation_digest: string }
interface CutoverRollbackBundleV1 { operation_id: string; operation_digest: string; expected_current_release_id: string; expected_state_revision: number; previous: KnownGoodReleaseV1; trigger_digest: string; approval_digest: string; prepared_resources: [RollbackPreparedResourceV1, RollbackPreparedResourceV1, RollbackPreparedResourceV1]; recovery_checkpoint_digest: string; compensation_plan_digest: string; action_order: ["prepare_all", "verify_staging", "commit_pointer_cas", "append_event", "write_receipt", "start_monitoring"]; monitoring_window_ms: number; write_set_digest: string }
interface CutoverRollbackReceiptV1 { operation_id: string; before_release_id: string; after_release_id: string; artifact_digest: string; db_schema_revision: number; state_revision: number; trigger_digest: string; approval_digest: string; status: "rolled_back" | "rollback_failed" | "monitoring_failed"; cutover_terminal: false; monitoring_started_at: string; monitoring_ends_at: string; health_receipt_digest: string; action_counts: Record<string, number> }
interface NodeCutoverRollbackPortV1 { commitRollback(bundle: CutoverRollbackBundleV1): Promise<ResultV1<CutoverRollbackReceiptV1, NodeCutoverFailureV1>>; reconcileRollback(bundle: CutoverRollbackBundleV1): Promise<ResultV1<CutoverRollbackReceiptV1, NodeCutoverFailureV1>>; findRollbackReceipt(operationId: string): Promise<CutoverRollbackReceiptV1 | null> }
```

artifact/DB/pointerは同一transactionを偽称せず、全resourceを非current stagingへprepareしてdigest検証後、pointer CASだけをcommit pointとする。
commit前faultはstaging破棄、commit後faultはrecovery checkpointからcompleteまたはcompensationし、currentを新旧混在させない。
同operation同digestは元receiptと全count 0、異digest/revision conflictはaction 0とする。rollback receiptはBun cutover PASS receiptではない。

G3前の型authorityは本書localの`NodeCutoverFailureV1`と`NodeCutoverFailureCodeV1`で閉包する。
G3通過後の実装はこのexact discriminated shapeとL5 §5.2の29 code（28 contract＋internal境界）を採用し、設計から未作成moduleを先取り参照しない。
実装時にcodeを`string`へ弱化、別interfaceへfork、cause/evidence/snapshotをoptional化した場合は
schema driftとして拒否する。

## §2 配置候補と既存codeの変更境界

| path | 責務 / 変更候補 |
|---|---|
| G3後に確定するschema module | local closed typesと同一のfailure union、receiptを実装する |
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

public API ownerは上表でexact一件とする。`U-NCUT-013`は`planNodeCutoverRollback`をprimary owner、execute/commit/reconcileを同一rollback
transactionの明示supporting edgeとして所有し、別Uへの重複ownerではない。U表、L8 trace、HST primary表でAPI名、U、IT、pre/expected state、
failureをexact joinし、欠落、別owner重複、未知API、failure/state差をfreeze blockerとする。

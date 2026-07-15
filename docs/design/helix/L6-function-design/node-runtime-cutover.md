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

本機能設計はpure判定とadapter境界を定義するdraftである。ADR-009はNode.js 24 LTS targetをacceptedとしたが、
terminal activation receipt前のactive execution authorityは既存Bun経路である。現行`runtime-portability`/`toolchain-pin`を
Node minimum evidenceなしに反転しない。本Redesignはforward activation唯一writerを明示するが、実装・pair-freeze済みを主張しない。

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
| `planNodeCutover` | `(snapshot: NodeCutoverActivationSnapshotV1, approval: NodeCutoverActionBindingApprovalV1, policy: NodeCutoverActivationPolicyV1) => ResultV1<NodeCutoverActivationPlanV1, NodeCutoverFailureV1>` | write 0。provisional gate、fixed write set、authority revision、approval scopeを固定 | `U-NCUT-014` |
| `executeNodeCutover` | `(plan: NodeCutoverActivationPlanV1, port: NodeCutoverActivationPortV1) => Promise<ResultV1<PreparedNodeCutoverBundleV1, NodeCutoverFailureV1>>` | noncurrent immutable generationだけをprepareしcurrent pointerを変更しない | `U-NCUT-014` |
| `commitNodeCutover` | `(bundle: PreparedNodeCutoverBundleV1, port: NodeCutoverActivationPortV1) => Promise<ResultV1<CutoverActivationReceiptV1, NodeCutoverFailureV1>>` | approval／snapshot／epoch／legacy drain／write setを再読しsingle pointer CASでactivated_monitoringへcommit | `U-NCUT-014` |
| `reconcileNodeCutover` | `(bundle: PreparedNodeCutoverBundleV1, port: NodeCutoverActivationPortV1) => Promise<ResultV1<CutoverActivationReceiptV1, NodeCutoverFailureV1>>` | 同operation/digest/revisionのcheckpointだけからcommit済みauthorityへ収束 | `U-NCUT-014` |
| `commitNodeCutoverTerminal` | `(bundle: NodeCutoverTerminalBundleV1, port: NodeCutoverActivationPortV1) => Promise<ResultV1<NodeCutoverTerminalReceiptV1, NodeCutoverFailureV1>>` | activation receiptとmonitoring/healthをexact joinし、event→projection→terminal receiptを固定順commit | `U-NCUT-015` |
| `reconcileNodeCutoverTerminal` | `(bundle: NodeCutoverTerminalBundleV1, port: NodeCutoverActivationPortV1) => Promise<ResultV1<NodeCutoverTerminalReceiptV1, NodeCutoverFailureV1>>` | 同operation/digest/revisionのactivation receiptとcheckpointからterminal faultを収束 | `U-NCUT-015` |
| `planNodeCutoverRollback` | `(current: CutoverStateV1, previous: KnownGoodReleaseV1, trigger: RollbackTriggerV1, approval: ActionBindingApprovalV1, policy: RollbackPolicyV1) => ResultV1<CutoverRollbackBundleV1, NodeCutoverFailureV1>` | release/artifact/DB互換、backup、trigger-bound approval、monitor window、固定action順を完全検証 | `U-NCUT-013` |
| `executeNodeCutoverRollback` | `(bundle: CutoverRollbackBundleV1, port: NodeCutoverRollbackPortV1) => Promise<ResultV1<CutoverRollbackReceiptV1, NodeCutoverFailureV1>>` | restore actionを固定順/CASで実行しfaultをreconcile可能なstagingへ閉じる | `U-NCUT-013` |
| `commitNodeCutoverRollback` | `(bundle: CutoverRollbackBundleV1, port: NodeCutoverRollbackPortV1) => Promise<ResultV1<CutoverRollbackReceiptV1, NodeCutoverFailureV1>>` | portの単一`commitRollback`で全restore/CAS/receiptを不可分commit | `U-NCUT-013` |
| `reconcileNodeCutoverRollback` | `(bundle: CutoverRollbackBundleV1, port: NodeCutoverRollbackPortV1) => Promise<ResultV1<CutoverRollbackReceiptV1, NodeCutoverFailureV1>>` | 同一operation/digest/expected revisionだけを`reconcileRollback`で収束 | `U-NCUT-013` |

### §1.1 canonical assertion primary表

次表はHST-HIL-013の11件を主API／主Uへ一意にbindするL6/L7 primary採点表である。supporting主ITはL8とのtraceであり、
case分母へ重複加算しない。判定入力は固定HEAD、inventory/rule、toolchain/lock、artifact/workflow provenanceを必須とする。

| HST正本 | 主API | 主U | supporting主IT | pre_state | expected_state | failure正本 |
|---|---|---|---|---|---|---|
| `HST-CASE-013-01` | `commitNodeCutoverTerminal` | `U-NCUT-015` | `IT-NCUT-013` | `activated_monitoring` | `verified` | `なし（正常系）` |
| `HST-CASE-013-02` | `detectBunDependency` | `U-NCUT-004` | `IT-NCUT-010` | `verifying` | `failed` | `HIL_ACTIVE_BUN_DEPENDENCY` |
| `HST-CASE-013-03` | `detectBunDependency` | `U-NCUT-004` | `IT-NCUT-010` | `verifying` | `failed` | `HIL_ACTIVE_BUN_COMMAND` |
| `HST-CASE-013-04` | `detectBunDependency` | `U-NCUT-004` | `IT-NCUT-010` | `verifying` | `failed` | `HIL_ACTIVE_BUN_LOCKFILE` |
| `HST-CASE-013-05` | `detectBunDependency` | `U-NCUT-004` | `IT-NCUT-010` | `verifying` | `failed` | `HIL_ACTIVE_BUN_CI` |
| `HST-CASE-013-06` | `detectBunDependency` | `U-NCUT-004` | `IT-NCUT-010` | `verifying` | `failed` | `HIL_ACTIVE_BUN_DISTRIBUTION` |
| `HST-CASE-013-07` | `evaluateBunCutover` | `U-NCUT-012` | `IT-NCUT-010` | `verifying` | `verifying` | `HIL_BUN_CUTOVER_QUARANTINE_REMAINS` |
| `HST-CASE-013-08` | `evaluateBunCutover` | `U-NCUT-012` | `IT-NCUT-008` | `assertion_input_ready` | `assertion_pass` | `HIL_ACTIVE_BUN_DEPENDENCY` |
| `HST-CASE-013-09` | `classifyRuntimeSurface` | `U-NCUT-003` | `IT-NCUT-009` | `assertion_input_ready` | `assertion_pass` | `HIL_BUN_COVERAGE_INCOMPLETE` |
| `HST-CASE-013-10` | `planNodeSourceExecution` | `U-NCUT-008` | `IT-NCUT-002` | `assertion_input_ready` | `assertion_pass` | `HIL_NODE_CONTROL_PLANE_INVALID` |
| `HST-CASE-013-11` | `commitNodeCutover` | `U-NCUT-014` | `IT-NCUT-012` | `assertion_input_ready` | `assertion_pass` | `HIL_BUN_CUTOVER_INCOMPLETE` |

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
interface CutoverStateV1 { snapshot_digest: string; current_release_id: string; state_revision: number; phase: "approval_pending" | "activation_planned" | "writer_epoch_acquired" | "legacy_drained" | "staged" | "activation_committing" | "activated_monitoring" | "reconcile_required" | "terminal" | "rollback_required" | "rollback_approved" | "rolling_back" | "rolled_back"; artifact_digest: string; db_schema_revision: number; db_data_digest: string; release_pointer_digest: string }
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
  | "HIL_NODE_CUTOVER_ROLLBACK_UNSAFE" | "HIL_NODE_CUTOVER_MONITORING_FAILED"
  | "HIL_NODE_CUTOVER_ACTIVATION_PLAN_INVALID" | "HIL_NODE_CUTOVER_APPROVAL_MISSING"
  | "HIL_NODE_CUTOVER_APPROVAL_SCOPE_MISMATCH" | "HIL_NODE_CUTOVER_APPROVAL_STALE"
  | "HIL_NODE_CUTOVER_WRITER_EPOCH_CONFLICT" | "HIL_NODE_CUTOVER_WRITER_LEASE_EXPIRED"
  | "HIL_NODE_CUTOVER_LEGACY_WRITER_ACTIVE" | "HIL_NODE_CUTOVER_AUTHORITY_REVISION_CONFLICT"
  | "HIL_NODE_CUTOVER_WRITE_SET_MISMATCH" | "HIL_NODE_CUTOVER_STAGING_INVALID"
  | "HIL_NODE_CUTOVER_COMMIT_AMBIGUOUS" | "HIL_NODE_CUTOVER_RECEIPT_CONFLICT"
  | "HIL_NODE_CUTOVER_RECONCILIATION_FAILED" | "HIL_NODE_CUTOVER_TERMINAL_PRECONDITION"
  | "HIL_NODE_CUTOVER_INTERNAL_ERROR";
interface NodeCutoverFailureV1 { schema_version: "helix-node-cutover-failure.v1"; code: NodeCutoverFailureCodeV1; message_digest: string; cause_digest: string | null; evidence_digest: string; retryable: boolean; operation_id: string | null; snapshot_digest: string }

interface BunCutoverReceiptV1 {
  schema_version: "bun-cutover-receipt.v1";
  snapshot_id: string;
  status: "pass" | "blocked" | "failed" | "stale";
  terminal: false;
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
interface NodeCutoverRollbackPortV1 { readonly transaction_store: RuntimeAuthorityTransactionStoreV1; commitRollback(bundle: CutoverRollbackBundleV1): Promise<ResultV1<CutoverRollbackReceiptV1, NodeCutoverFailureV1>>; reconcileRollback(bundle: CutoverRollbackBundleV1): Promise<ResultV1<CutoverRollbackReceiptV1, NodeCutoverFailureV1>>; findRollbackReceipt(operationId: string): Promise<CutoverRollbackReceiptV1 | null> }

type NodeCutoverResourceIdV1 = "runtime_generation" | "db_generation" | "authority_pointer" | "hook" | "package" | "lock" | "ci";
interface RuntimeWriterEpochLeaseV1 { scope: "control-plane"; writer_epoch: number; lease_id: string; fence_token: string; owner_id: string; acquired_at: string; expires_at: string; claim_digest: string; released_at: string | null }
interface NodeCutoverActivationSnapshotV1 { snapshot_digest: string; head_commit: string; source_tree_digest: string; provisional_gate_receipt_digest: string; active_bun_count: 0; quarantine_count: 0; expected_authority_revision: number; current_generation_id: string; target_generation_id: string; runtime_artifact_digest: string; db_generation_digest: string; bootstrap_adapter_digest: string; bootstrap_adapter_verified: true; hook_digest: string; package_digest: string; lock_digest: string; ci_digest: string; fixed_write_set_digest: string }
interface NodeCutoverActionBindingApprovalV1 { approval_id: string; action: "node_cutover_activation"; operation_id: string; operation_digest: string; actor_id: string; tool_id: string; target_digest: string; params_digest: string; snapshot_digest: string; write_set_digest: string; before_authority_revision: number; reviewed_evidence_digest: string; trigger_digest: string; approver_authority_id: string; issued_at: string; expires_at: string; audit_digest: string; approval_digest: string }
interface NodeCutoverActivationPolicyV1 { policy_id: string; policy_version: string; require_action_binding_approval: true; require_quiet_window: true; require_active_legacy_session_count: 0; require_old_hook_drain: true; require_exclusive_db_file_claim: true; pointer_cas_only_commit: true; monitoring_window_ms: number; policy_digest: string }
interface NodeCutoverActivationPlanV1 { operation_id: string; operation_digest: string; activation_snapshot_digest: string; expected_authority_revision: number; target_generation_id: string; approval_digest: string; policy_digest: string; required_resource_ids: NodeCutoverResourceIdV1[]; fixed_write_set_digest: string; writer_epoch_policy_digest: string; planned_authoritative_write_count: 0; plan_digest: string }
interface PreparedNodeCutoverResourceV1 { resource_id: NodeCutoverResourceIdV1; target_generation_id: string; staged_digest: string; expected_digest: string; verification_digest: string; current_visible: false }
interface PreparedNodeCutoverBundleV1 { operation_id: string; operation_digest: string; activation_snapshot_digest: string; expected_authority_revision: number; target_generation_id: string; writer: RuntimeWriterEpochLeaseV1; legacy_process_count: 0; legacy_session_count: 0; old_hook_inflight_count: 0; quiet_window_receipt_digest: string; exclusive_claim_digest: string; approval_digest: string; resources: PreparedNodeCutoverResourceV1[]; fixed_write_set_digest: string; checkpoint_digest: string; bundle_digest: string }
interface RuntimeCutoverOperationV1 { operation_id: string; operation_digest: string; activation_snapshot_digest: string; expected_authority_revision: number; writer_epoch: number | null; lease_id: string | null; fence_token: string | null; approval_receipt_digest: string; fixed_write_set_digest: string; checkpoint_digest: string | null; phase: "approval_pending" | "activation_planned" | "writer_epoch_acquired" | "legacy_drained" | "staged" | "activation_committing" | "activated_monitoring" | "reconcile_required" | "terminal" | "rollback_required" | "rollback_approved" | "rolling_back" | "rolled_back" | "failed" | "stale"; created_at: string; updated_at: string; operation_row_digest: string }
interface RuntimeAuthorityProjectionV1 { authority_id: "control-plane"; authority_revision: number; phase: "bun_active" | RuntimeCutoverOperationV1["phase"]; runtime_generation_id: string; release_id: string; runtime_artifact_digest: string; db_generation_digest: string; pointer_digest: string; hook_digest: string; package_digest: string; lock_digest: string; ci_digest: string; writer_epoch: number; last_event_digest: string | null; activation_receipt_digest: string | null; terminal_receipt_digest: string | null }
interface RuntimeCutoverEventV1 { event_id: string; operation_id: string; sequence: number; event_kind: "activation_committed" | "activation_reconciled" | "terminal_committed" | "terminal_reconciled" | "rollback_approved" | "rollback_committed" | "rollback_reconciled"; previous_event_digest: string | null; payload_digest: string; event_digest: string }
interface CutoverActivationReceiptV1 { schema_version: "helix-node-cutover-activation-receipt.v1"; operation_id: string; operation_digest: string; before_authority_revision: number; after_authority_revision: number; runtime_generation_id: string; writer_epoch: number; approval_digest: string; fixed_write_set_digest: string; event_head_digest: string; checkpoint_digest: string; status: "activated_monitoring" | "reconciled"; terminal: false; monitoring_started_at: string; monitoring_ends_at: string; action_counts: Record<NodeCutoverResourceIdV1 | "event" | "projection" | "receipt", number>; receipt_digest: string }
interface NodeCutoverTerminalApprovalV1 { approval_id: string; action: "node_cutover_terminal"; operation_id: string; operation_digest: string; activation_receipt_digest: string; monitoring_receipt_digest: string; expected_authority_revision: number; exact_write_set_digest: string; approver_authority_id: string; issued_at: string; expires_at: string; approval_digest: string }
interface NodeCutoverTerminalBundleV1 { operation_id: string; operation_digest: string; activation_receipt_digest: string; expected_authority_revision: number; monitoring_receipt_digest: string; health_receipt_digest: string; terminal_writer: RuntimeWriterEpochLeaseV1; terminal_approval: NodeCutoverTerminalApprovalV1; exact_write_set: ["terminal_event", "authority_projection", "terminal_receipt"]; exact_write_set_digest: string; recovery_checkpoint_digest: string; rollback_receipt_count: 0; terminal_bundle_digest: string }
interface NodeCutoverTerminalReceiptV1 { schema_version: "helix-node-cutover-terminal-receipt.v1"; operation_id: string; before_authority_revision: number; after_authority_revision: number; runtime_generation_id: string; activation_receipt_digest: string; monitoring_receipt_digest: string; health_receipt_digest: string; event_sequence: number; exact_write_set_digest: string; action_counts: Record<"terminal_event" | "authority_projection" | "terminal_receipt", number>; status: "terminal"; terminal: true; receipt_digest: string }
interface RuntimeCutoverReceiptRowV1 { receipt_id: string; operation_id: string; receipt_kind: "activation" | "terminal" | "rollback"; receipt_digest: string; before_authority_revision: number; after_authority_revision: number; writer_epoch: number; approval_digest: string; write_set_digest: string; event_head_digest: string; terminal: boolean; created_at: string }
declare const runtimeAuthorityStoreCapabilityBrand: unique symbol;
interface RuntimeAuthorityStoreCapabilityV1 { readonly [runtimeAuthorityStoreCapabilityBrand]: "runtime-authority-store" }
interface RuntimeAuthorityTransactionStoreV1 { readonly capability: RuntimeAuthorityStoreCapabilityV1; readonly authority_store_id: string; commitForwardActivation(bundle: PreparedNodeCutoverBundleV1): Promise<ResultV1<CutoverActivationReceiptV1, NodeCutoverFailureV1>>; reconcileForwardActivation(bundle: PreparedNodeCutoverBundleV1): Promise<ResultV1<CutoverActivationReceiptV1, NodeCutoverFailureV1>>; commitForwardTerminal(bundle: NodeCutoverTerminalBundleV1): Promise<ResultV1<NodeCutoverTerminalReceiptV1, NodeCutoverFailureV1>>; reconcileForwardTerminal(bundle: NodeCutoverTerminalBundleV1): Promise<ResultV1<NodeCutoverTerminalReceiptV1, NodeCutoverFailureV1>>; commitRollback(bundle: CutoverRollbackBundleV1): Promise<ResultV1<CutoverRollbackReceiptV1, NodeCutoverFailureV1>>; reconcileRollback(bundle: CutoverRollbackBundleV1): Promise<ResultV1<CutoverRollbackReceiptV1, NodeCutoverFailureV1>> }
interface NodeCutoverActivationPortV1 { readonly transaction_store: RuntimeAuthorityTransactionStoreV1; prepare(plan: NodeCutoverActivationPlanV1): Promise<ResultV1<PreparedNodeCutoverBundleV1, NodeCutoverFailureV1>>; readValidateAndCommit(bundle: PreparedNodeCutoverBundleV1): Promise<ResultV1<CutoverActivationReceiptV1, NodeCutoverFailureV1>>; readValidateAndReconcile(bundle: PreparedNodeCutoverBundleV1): Promise<ResultV1<CutoverActivationReceiptV1, NodeCutoverFailureV1>>; commitTerminal(bundle: NodeCutoverTerminalBundleV1): Promise<ResultV1<NodeCutoverTerminalReceiptV1, NodeCutoverFailureV1>>; reconcileTerminal(bundle: NodeCutoverTerminalBundleV1): Promise<ResultV1<NodeCutoverTerminalReceiptV1, NodeCutoverFailureV1>>; findActivationReceipt(operationId: string): Promise<CutoverActivationReceiptV1 | null>; findTerminalReceipt(operationId: string): Promise<NodeCutoverTerminalReceiptV1 | null>; readCurrentAuthority(): Promise<RuntimeAuthorityProjectionV1> }
```

artifact/DB/pointerは同一transactionを偽称せず、全resourceを非current stagingへprepareしてdigest検証後、pointer CASだけをcommit pointとする。
commit前faultはstaging破棄、commit後faultはrecovery checkpointからcompleteまたはcompensationし、currentを新旧混在させない。
同operation同digestは元receiptと全count 0、異digest/revision conflictはaction 0とする。rollback receiptはBun cutover PASS receiptではない。

forward／rollback portは同じ`RuntimeAuthorityTransactionStoreV1` object referenceとbranded capabilityを持ち、別pointer writerを持たない。
facadeはstate-db内の単一factoryが一つのstore instanceから同時生成し、任意の文字列IDやstructural objectから構築できない。
epoch、event chain、authority CAS、receipt appendはこのprivate store一つだけが実行する。

5表のexact constraintは次を正本とする。

| table | row型 | key／constraint |
|---|---|---|
| `runtime_cutover_writer_epochs` | `RuntimeWriterEpochLeaseV1` | PK=`(scope,writer_epoch)`、`writer_epoch`単調増加、PARTIAL UNIQUE=`scope WHERE released_at IS NULL`、active lease/fence exactly one、released後write禁止 |
| `runtime_cutover_operations` | `RuntimeCutoverOperationV1` | PK=`operation_id`、operation digest immutable、phaseは上記unionの許可遷移だけ。approval/plan中はepoch/lease/fence/checkpoint null、epoch取得後は全てnon-nullでwriter表へexact join |
| `runtime_cutover_events` | `RuntimeCutoverEventV1` | PK=`event_id`、UNIQUE=`(operation_id,sequence)`、previous digestは直前event、operationへFK |
| `runtime_authority_current` | `RuntimeAuthorityProjectionV1` | PK=`authority_id`かつ`control-plane` singleton。初期Bun authorityはphase=`bun_active`、writer_epoch=0、event/activation/terminal digest null。Node CAS後だけactivation digest必須 |
| `runtime_cutover_receipts` | `RuntimeCutoverReceiptRowV1` | PK=`receipt_id`、UNIQUE=`(operation_id,receipt_kind)`、operationへFK、append-only、terminalはactivation receiptを上書き禁止 |

prepared resource bytesはcontent-addressed generationへ置き、DBはdigestだけを保持する。terminal固定順は
`terminal_event -> runtime_authority_current CAS -> terminal_receipt`であり、各step後faultは同operation/digestの
`reconcileNodeCutoverTerminal`だけを許可する。terminal commitはactivation時leaseを再利用せず、新しいwriter epoch／lease／fenceと
`node_cutover_terminal` approvalをcommit直前に再検証する。rollbackは`rollback_approved -> rolling_back -> rolled_back`、
ambiguous faultは`reconcile_required`を経由し、全eventを同一operation chainへappendする。

G3前の型authorityは本書localの`NodeCutoverFailureV1`と`NodeCutoverFailureCodeV1`で閉包する。
G3通過後の実装はこのexact discriminated shapeとL5 §5.2の43 code（42 contract＋internal境界）を採用し、設計から未作成moduleを先取り参照しない。
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
| `src/runtime/node-cutover-activation.ts` | plan/execute/commit/reconcile/terminalのcoordinator。直接writer禁止 |
| `src/state-db/node-cutover-activation.ts` | 5表、writer epoch、generation pointer CASを所有する唯一port |
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

1. ADR-009のNode LTS/npm/source runner/build/distribution決定を固定し、activation snapshotへbindする。
2. 15 unitをRed化し、schema、canonical ID、inventory/classifier、forward activation、rollback contractを実装する。
3. Node runtime/lock/source/build/artifactのpure contractとadapterを実装する。
4. Node minimumをclean Linuxでgreen化するがterminal completionを発行しない。
5. SQLite、CLI、hook、tests、CI、template、setup、distributionをNodeへ移行する。
6. fallback、Bun API/command/lock/action/cache/artifactを撤去する。
7. 全surfaceを再走査し、active 0、quarantine 0、provisional gateをgreen化する。
8. 5表、immutable generation、bootstrap pointer、forward activation、monitoring terminalを13 integrationで検証する。
9. macOS/Windows smoke、offline install、SBOM、別runtime review後にpair-freezeへ出す。

## §5 双方向trace

| 機能 | 単体oracle | 結合oracle | 要求正本 |
|---|---|---|---|
| `canonicalizeRuntimeInventoryRequest` | `U-NCUT-001` | `IT-NCUT-009` | `HAC-HIL-13b`; `HIL-FR-33` |
| `enumerateRuntimeSurfaces` | `U-NCUT-002` | `IT-NCUT-009` | `HAC-HIL-13b`; `HIL-FR-33` |
| `classifyRuntimeSurface` | `U-NCUT-003` | `IT-NCUT-009`, `IT-NCUT-010` | `HAC-HIL-13b`; `HAC-HIL-13c` |
| `detectBunDependency` | `U-NCUT-004` | `IT-NCUT-009`, `IT-NCUT-010` | `HIL-FR-33`; `HIA-FR-033` |
| `validateHistoricalAllowlist` | `U-NCUT-005` | `IT-NCUT-009`, `IT-NCUT-010` | `HAC-HIL-13c` |
| `validateNodeRuntime` | `U-NCUT-006` | `IT-NCUT-001`, `IT-NCUT-002` | `HIL-TR-01`; `HIA-TR-001` |
| `validateNodeLock` | `U-NCUT-007` | `IT-NCUT-001` | `HAC-HIL-13a`; `HIL-TR-11` |
| `planNodeSourceExecution` | `U-NCUT-008` | `IT-NCUT-003`, `IT-NCUT-006` | `HIL-TR-01` |
| `planNodeBuild` | `U-NCUT-009` | `IT-NCUT-004`, `IT-NCUT-008` | `HIL-TR-01`; `HIL-TR-11` |
| `verifyNodeArtifact` | `U-NCUT-010` | `IT-NCUT-004`, `IT-NCUT-008` | `HAC-HIL-13a`; `HIL-TR-11` |
| `evaluateNodeMinimum` | `U-NCUT-011` | `IT-NCUT-001`, `IT-NCUT-002`, `IT-NCUT-003`, `IT-NCUT-004`, `IT-NCUT-005` | `HR-FR-HIL-13`; P1 |
| `evaluateBunCutover` | `U-NCUT-012` | `IT-NCUT-006`, `IT-NCUT-007`, `IT-NCUT-008`, `IT-NCUT-009`, `IT-NCUT-010` | `HR-FR-HIL-13`; `HIL-BR-19`; `HIL-TR-11` |
| `planNodeCutover` / `executeNodeCutover` / `commitNodeCutover` / `reconcileNodeCutover` | `U-NCUT-014` | `IT-NCUT-012` | forward activation唯一writer契約 |
| `commitNodeCutoverTerminal` / `reconcileNodeCutoverTerminal` | `U-NCUT-015` | `IT-NCUT-013` | terminal authority／fault reconcile契約 |
| `planNodeCutoverRollback` | `U-NCUT-013` | `IT-NCUT-011` | cutover操作承認の安全契約 |
| `executeNodeCutoverRollback` / `commitNodeCutoverRollback` / `reconcileNodeCutoverRollback` | `U-NCUT-013` | `IT-NCUT-011` | rollback実行・fault・CAS・reconcile契約 |

public API ownerは上表でexact一件とする。`U-NCUT-013`は`planNodeCutoverRollback`をprimary owner、execute/commit/reconcileを同一rollback
transactionの明示supporting edgeとして所有し、別Uへの重複ownerではない。U表、L8 trace、HST primary表でAPI名、U、IT、pre/expected state、
failureをexact joinし、欠落、別owner重複、未知API、failure/state差をfreeze blockerとする。

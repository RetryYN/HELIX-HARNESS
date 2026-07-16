import { createHash } from "node:crypto";

export type ResultV1<T, E> = { ok: true; value: T } | { ok: false; error: E };

export type NodeCutoverFailureCodeV1 =
  | "HIL_NODE_RUNTIME_UNSUPPORTED"
  | "HIL_NODE_LOCK_MISSING"
  | "HIL_NODE_LOCK_DRIFT"
  | "HIL_NODE_SOURCE_ENTRY_UNRESOLVABLE"
  | "HIL_NODE_BUILD_ARTIFACT_INVALID"
  | "HIL_NODE_WORKFLOW_UNVERIFIED"
  | "HIL_ACTIVE_BUN_DEPENDENCY"
  | "HIL_BUN_COVERAGE_INCOMPLETE"
  | "HIL_ACTIVE_BUN_RUNTIME_API"
  | "HIL_ACTIVE_BUN_LOADER"
  | "HIL_ACTIVE_BUN_COMMAND"
  | "HIL_ACTIVE_BUN_PACKAGE"
  | "HIL_ACTIVE_BUN_LOCKFILE"
  | "HIL_ACTIVE_BUN_CI"
  | "HIL_ACTIVE_BUN_HOOK"
  | "HIL_ACTIVE_BUN_TEST"
  | "HIL_ACTIVE_BUN_TEMPLATE"
  | "HIL_ACTIVE_BUN_SETUP"
  | "HIL_ACTIVE_BUN_DISTRIBUTION"
  | "HIL_ACTIVE_BUN_FALLBACK"
  | "HIL_ACTIVE_BUN_RULE_COMMAND"
  | "HIL_BUN_HISTORICAL_ALLOWLIST_INVALID"
  | "HIL_BUN_CUTOVER_QUARANTINE_REMAINS"
  | "HIL_NODE_EVIDENCE_STALE"
  | "HIL_NODE_CONTROL_PLANE_INVALID"
  | "HIL_BUN_CUTOVER_INCOMPLETE"
  | "HIL_NODE_CUTOVER_ROLLBACK_UNSAFE"
  | "HIL_NODE_CUTOVER_MONITORING_FAILED"
  | "HIL_NODE_CUTOVER_ACTIVATION_PLAN_INVALID"
  | "HIL_NODE_CUTOVER_APPROVAL_MISSING"
  | "HIL_NODE_CUTOVER_APPROVAL_SCOPE_MISMATCH"
  | "HIL_NODE_CUTOVER_APPROVAL_STALE"
  | "HIL_NODE_CUTOVER_WRITER_EPOCH_CONFLICT"
  | "HIL_NODE_CUTOVER_WRITER_LEASE_EXPIRED"
  | "HIL_NODE_CUTOVER_LEGACY_WRITER_ACTIVE"
  | "HIL_NODE_CUTOVER_AUTHORITY_REVISION_CONFLICT"
  | "HIL_NODE_CUTOVER_WRITE_SET_MISMATCH"
  | "HIL_NODE_CUTOVER_STAGING_INVALID"
  | "HIL_NODE_CUTOVER_COMMIT_AMBIGUOUS"
  | "HIL_NODE_CUTOVER_RECEIPT_CONFLICT"
  | "HIL_NODE_CUTOVER_RECONCILIATION_FAILED"
  | "HIL_NODE_CUTOVER_TERMINAL_PRECONDITION"
  | "HIL_NODE_CUTOVER_INTERNAL_ERROR";

export interface NodeCutoverFailureV1 {
  schema_version: "helix-node-cutover-failure.v1";
  code: NodeCutoverFailureCodeV1;
  message_digest: string;
  cause_digest: string | null;
  evidence_digest: string;
  retryable: boolean;
  operation_id: string | null;
  snapshot_digest: string;
}

export interface NodeRuntimeActualV1 {
  snapshot_digest: string;
  version: string;
  lts: boolean;
  available_features: string[];
}

export interface NodeRuntimeContractV1 {
  minimum_version: string;
  maximum_exclusive_version: string;
  required_features: string[];
}

export interface NodeRuntimeReportV1 {
  snapshot_digest: string;
  actual_version: string;
  required_minimum_version: string;
  lts: boolean;
  required_features: string[];
  available_features: string[];
  feature_set_digest: string;
  compatible: boolean;
  evidence_digest: string;
  failures: NodeCutoverFailureV1[];
}

export interface NodeManifestV1 {
  snapshot_digest: string;
  manifest_digest: string;
  canonical_lock_path: string;
}

export interface NodeLockV1 {
  path: string;
  digest: string;
  manifest_digest: string;
  canonical_lock_paths: string[];
}

export interface NodeInstalledTreeV1 {
  tree_digest: string;
  lock_digest: string;
  frozen_install: boolean;
}

export interface NodeLockReportV1 {
  snapshot_digest: string;
  manifest_digest: string;
  lock_path: string;
  lock_digest: string;
  canonical_lock_count: number;
  installed_tree_digest: string;
  frozen_install: boolean;
  compatible: boolean;
  evidence_digest: string;
  failures: NodeCutoverFailureV1[];
}

export interface NodeSourceEntryV1 {
  snapshot_digest: string;
  entry_path: string;
}
export interface NodeSourceResolverV1 {
  resolver_id: string;
  resolvable: boolean;
  module_graph_digest: string;
  unresolved_imports: string[];
}
export interface NodeSourceRunnerV1 {
  runner_id: string;
  loader_id: string;
  command: string;
  command_digest: string;
}
export interface NodeSourcePlanV1 {
  snapshot_digest: string;
  entry_path: string;
  resolver_id: string;
  runner_id: string;
  module_graph_digest: string;
  loader_id: string;
  command_digest: string;
  bun_loader_count: 0;
  bun_command_count: 0;
  planned_write_count: 0;
  plan_digest: string;
}

export interface NodeBuildContractV1 {
  snapshot_digest: string;
  output_path: string;
  format: string;
  target: string;
  bin_name: string;
  external_ids: string[];
  allowed_external_ids: string[];
  native_external_ids: string[];
  build_command: string;
}
export interface NodeBuildPlanV1 {
  snapshot_digest: string;
  entry_path: string;
  output_path: string;
  format: "esm";
  target: string;
  bin_name: string;
  external_ids: string[];
  build_command_digest: string;
  bun_command_count: 0;
  plan_digest: string;
}

export interface NodeArtifactV1 {
  snapshot_digest: string;
  artifact_path: string;
  artifact_digest: string;
  content: string;
  bin_name: string;
  declared_bin_path: string;
  source_parity_digest: string;
}
export interface NodeSourceOracleV1 {
  source_oracle_digest: string;
  expected_artifact_digest: string;
  expected_bin_name: string;
  expected_bin_path: string;
  expected_source_parity_digest: string;
  required_shebang: string;
}
export interface NodeArtifactReportV1 {
  snapshot_digest: string;
  artifact_path: string;
  artifact_digest: string;
  source_oracle_digest: string;
  shebang_valid: boolean;
  bin_mapping_valid: boolean;
  source_parity_digest: string;
  embedded_bun_marker_count: 0;
  valid: boolean;
  evidence_digest: string;
  failures: NodeCutoverFailureV1[];
}

export interface NodeMinimumInventoryV1 {
  snapshot_digest: string;
  inventory_digest: string;
  artifact_report_digest: string;
  complete: boolean;
  stale: boolean;
  failures: NodeCutoverFailureV1[];
}
export interface NodeWorkflowEvidenceV1 {
  workflow_id: string;
  evidence_digest: string;
  green: boolean;
  stale: boolean;
}
export const NODE_MINIMUM_REQUIRED_WORKFLOW_IDS = [
  "build",
  "install",
  "source-cli",
  "sqlite",
  "test",
  "typecheck",
] as const;
export interface NodeMinimumReceiptV1 {
  schema_version: "helix-node-minimum-receipt.v1";
  snapshot_digest: string;
  status: "pass" | "blocked" | "failed" | "stale";
  terminal: false;
  inventory_digest: string;
  runtime_report_digest: string;
  lock_report_digest: string;
  artifact_report_digest: string;
  required_workflow_ids: string[];
  green_workflow_ids: string[];
  workflow_set_digest: string;
  evidence_root_digest: string;
  failures: NodeCutoverFailureV1[];
}

const stable = (value: unknown): string => {
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  if (value && typeof value === "object")
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, child]) => `${JSON.stringify(key)}:${stable(child)}`)
      .join(",")}}`;
  return JSON.stringify(value);
};
const digest = (value: unknown): string => createHash("sha256").update(stable(value)).digest("hex");
const uniqueSorted = (values: string[]): string[] => [...new Set(values)].sort();
const failure = (
  code: NodeCutoverFailureCodeV1,
  snapshot: string,
  evidence: unknown,
  retryable = false,
): NodeCutoverFailureV1 => ({
  schema_version: "helix-node-cutover-failure.v1",
  code,
  message_digest: digest(code),
  cause_digest: null,
  evidence_digest: digest(evidence),
  retryable,
  operation_id: null,
  snapshot_digest: snapshot,
});

function versionTuple(raw: string): [number, number, number] | null {
  const match = raw
    .trim()
    .replace(/^v/, "")
    .match(/^(\d+)\.(\d+)\.(\d+)(?:[-+].*)?$/);
  return match ? [Number(match[1]), Number(match[2]), Number(match[3])] : null;
}
const compareVersion = (left: [number, number, number], right: [number, number, number]): number =>
  left[0] - right[0] || left[1] - right[1] || left[2] - right[2];

export function validateNodeRuntime(
  actual: NodeRuntimeActualV1,
  contract: NodeRuntimeContractV1,
): NodeRuntimeReportV1 {
  const available = uniqueSorted(actual.available_features);
  const required = uniqueSorted(contract.required_features);
  const parsed = versionTuple(actual.version);
  const floor = versionTuple(contract.minimum_version);
  const ceiling = versionTuple(contract.maximum_exclusive_version);
  const missing = required.filter((feature) => !available.includes(feature));
  const compatible = Boolean(
    parsed &&
      floor &&
      ceiling &&
      compareVersion(parsed, floor) >= 0 &&
      compareVersion(parsed, ceiling) < 0 &&
      actual.lts &&
      missing.length === 0,
  );
  const failures = compatible
    ? []
    : [
        failure("HIL_NODE_RUNTIME_UNSUPPORTED", actual.snapshot_digest, {
          version: actual.version,
          contract,
          missing,
          lts: actual.lts,
        }),
      ];
  const core = {
    snapshot_digest: actual.snapshot_digest,
    actual_version: actual.version,
    required_minimum_version: contract.minimum_version,
    lts: actual.lts,
    required_features: required,
    available_features: available,
    feature_set_digest: digest(available),
    compatible,
  };
  return { ...core, evidence_digest: digest({ ...core, failures }), failures };
}

export function validateNodeLock(
  manifest: NodeManifestV1,
  lock: NodeLockV1 | null,
  installed: NodeInstalledTreeV1,
): NodeLockReportV1 {
  const failures: NodeCutoverFailureV1[] = [];
  if (!lock)
    failures.push(
      failure("HIL_NODE_LOCK_MISSING", manifest.snapshot_digest, manifest.canonical_lock_path),
    );
  const canonicalCount = lock ? uniqueSorted(lock.canonical_lock_paths).length : 0;
  if (
    lock &&
    (lock.path !== manifest.canonical_lock_path ||
      canonicalCount !== 1 ||
      lock.manifest_digest !== manifest.manifest_digest ||
      installed.lock_digest !== lock.digest ||
      !installed.frozen_install)
  )
    failures.push(
      failure("HIL_NODE_LOCK_DRIFT", manifest.snapshot_digest, {
        manifest,
        lock,
        installed,
      }),
    );
  const core = {
    snapshot_digest: manifest.snapshot_digest,
    manifest_digest: manifest.manifest_digest,
    lock_path: lock?.path ?? manifest.canonical_lock_path,
    lock_digest: lock?.digest ?? digest("missing"),
    canonical_lock_count: canonicalCount,
    installed_tree_digest: installed.tree_digest,
    frozen_install: installed.frozen_install,
    compatible: failures.length === 0,
  };
  return { ...core, evidence_digest: digest({ ...core, failures }), failures };
}

export function planNodeSourceExecution(
  entry: NodeSourceEntryV1,
  resolver: NodeSourceResolverV1,
  runner: NodeSourceRunnerV1,
): ResultV1<NodeSourcePlanV1, NodeCutoverFailureV1> {
  const bunLoader = /(?:^|[/:])bun(?:$|[/:])|bun:|tsx\/bun/i.test(runner.loader_id);
  const bunCommand = /(?:^|\s)bun(?:\s|$)/i.test(runner.command);
  if (!resolver.resolvable || resolver.unresolved_imports.length > 0 || bunLoader || bunCommand)
    return {
      ok: false,
      error: failure("HIL_NODE_SOURCE_ENTRY_UNRESOLVABLE", entry.snapshot_digest, {
        entry,
        resolver,
        runner,
      }),
    };
  const core = {
    snapshot_digest: entry.snapshot_digest,
    entry_path: entry.entry_path,
    resolver_id: resolver.resolver_id,
    runner_id: runner.runner_id,
    module_graph_digest: resolver.module_graph_digest,
    loader_id: runner.loader_id,
    command_digest: runner.command_digest,
    bun_loader_count: 0 as const,
    bun_command_count: 0 as const,
    planned_write_count: 0 as const,
  };
  return { ok: true, value: { ...core, plan_digest: digest(core) } };
}

export function planNodeBuild(
  entry: NodeSourceEntryV1,
  contract: NodeBuildContractV1,
): ResultV1<NodeBuildPlanV1, NodeCutoverFailureV1> {
  const externals = uniqueSorted(contract.external_ids);
  const allowed = new Set(contract.allowed_external_ids);
  const invalid =
    contract.format !== "esm" ||
    !contract.output_path ||
    !contract.bin_name ||
    !contract.target.startsWith("node") ||
    contract.native_external_ids.some((id) => !allowed.has(id)) ||
    /(?:^|\s)bun(?:\s|$)|bun build/i.test(contract.build_command);
  if (invalid)
    return {
      ok: false,
      error: failure("HIL_NODE_BUILD_ARTIFACT_INVALID", entry.snapshot_digest, {
        entry,
        contract,
      }),
    };
  const core = {
    snapshot_digest: contract.snapshot_digest,
    entry_path: entry.entry_path,
    output_path: contract.output_path,
    format: "esm" as const,
    target: contract.target,
    bin_name: contract.bin_name,
    external_ids: externals,
    build_command_digest: digest(contract.build_command),
    bun_command_count: 0 as const,
  };
  return { ok: true, value: { ...core, plan_digest: digest(core) } };
}

export function verifyNodeArtifact(
  artifact: NodeArtifactV1,
  oracle: NodeSourceOracleV1,
): NodeArtifactReportV1 {
  const shebang = artifact.content.split(/\r?\n/, 1)[0] === oracle.required_shebang;
  const bin =
    artifact.bin_name === oracle.expected_bin_name &&
    artifact.declared_bin_path === oracle.expected_bin_path;
  const bunMarkers = (
    artifact.content.match(/(?:bun:|#!.*\bbun\b|\bbun\s+(?:run|build|test)\b)/gi) ?? []
  ).length;
  const valid =
    artifact.artifact_digest === oracle.expected_artifact_digest &&
    artifact.source_parity_digest === oracle.expected_source_parity_digest &&
    shebang &&
    bin &&
    bunMarkers === 0;
  const failures = valid
    ? []
    : [
        failure("HIL_NODE_BUILD_ARTIFACT_INVALID", artifact.snapshot_digest, {
          artifact_digest: artifact.artifact_digest,
          oracle,
          shebang,
          bin,
          bunMarkers,
        }),
      ];
  const core = {
    snapshot_digest: artifact.snapshot_digest,
    artifact_path: artifact.artifact_path,
    artifact_digest: artifact.artifact_digest,
    source_oracle_digest: oracle.source_oracle_digest,
    shebang_valid: shebang,
    bin_mapping_valid: bin,
    source_parity_digest: artifact.source_parity_digest,
    embedded_bun_marker_count: 0 as const,
    valid,
  };
  return {
    ...core,
    evidence_digest: digest({
      ...core,
      observed_bun_markers: bunMarkers,
      failures,
    }),
    failures,
  };
}

export function evaluateNodeMinimum(
  inventory: NodeMinimumInventoryV1,
  runtime: NodeRuntimeReportV1,
  lock: NodeLockReportV1,
  workflows: NodeWorkflowEvidenceV1[],
): NodeMinimumReceiptV1 {
  const ordered = [...workflows].sort((a, b) => a.workflow_id.localeCompare(b.workflow_id));
  const requiredIds = [...NODE_MINIMUM_REQUIRED_WORKFLOW_IDS];
  const greenIds = uniqueSorted(
    ordered.filter((row) => row.green && !row.stale).map((row) => row.workflow_id),
  );
  const failures = [...inventory.failures, ...runtime.failures, ...lock.failures];
  const provided = new Set(ordered.map((row) => row.workflow_id));
  for (const workflowId of requiredIds.filter((id) => !provided.has(id)))
    failures.push(
      failure("HIL_NODE_WORKFLOW_UNVERIFIED", inventory.snapshot_digest, {
        workflow_id: workflowId,
        reason: "missing",
      }),
    );
  for (const row of ordered.filter((item) => !item.green || item.stale))
    failures.push(
      failure(
        row.stale ? "HIL_NODE_EVIDENCE_STALE" : "HIL_NODE_WORKFLOW_UNVERIFIED",
        inventory.snapshot_digest,
        row,
      ),
    );
  if (!inventory.complete && failures.every((row) => row.code !== "HIL_NODE_CONTROL_PLANE_INVALID"))
    failures.push(failure("HIL_NODE_CONTROL_PLANE_INVALID", inventory.snapshot_digest, inventory));
  const stale = inventory.stale || ordered.some((row) => row.stale);
  const status: NodeMinimumReceiptV1["status"] = stale
    ? "stale"
    : failures.length
      ? "blocked"
      : "pass";
  const workflowSetDigest = digest(ordered.map((row) => ({ ...row })));
  const core = {
    schema_version: "helix-node-minimum-receipt.v1" as const,
    snapshot_digest: inventory.snapshot_digest,
    status,
    terminal: false as const,
    inventory_digest: inventory.inventory_digest,
    runtime_report_digest: runtime.evidence_digest,
    lock_report_digest: lock.evidence_digest,
    artifact_report_digest: inventory.artifact_report_digest,
    required_workflow_ids: requiredIds,
    green_workflow_ids: greenIds,
    workflow_set_digest: workflowSetDigest,
  };
  return {
    ...core,
    evidence_root_digest: digest({ ...core, failures }),
    failures,
  };
}

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { canonicalJson, sha256Digest } from "../runtime/digest";

export const LEGACY_ORCHESTRATION_SEMANTIC_CONSUMER_LEDGER_PATH =
  "config/legacy-orchestration-semantic-consumers.json" as const;
export const LEGACY_ORCHESTRATION_SEMANTIC_CONSUMER_REVISION_PATH =
  "config/legacy-orchestration-semantic-consumers-revision-2026-09-10.json" as const;
export const LEGACY_ORCHESTRATION_SEMANTIC_CONSUMER_SCHEMA_VERSION =
  "helix-legacy-orchestration-semantic-consumer-ledger.v1" as const;
export const LEGACY_ORCHESTRATION_SEMANTIC_CONSUMER_REVISION_SCHEMA_VERSION =
  "helix-legacy-orchestration-semantic-consumer-ledger-revision.v1" as const;

export const LEGACY_ORCHESTRATION_CONSUMER_ROLES = [
  "direct_execution",
  "write_control",
  "generated_current_guidance",
  "compatibility_adapter",
  "read_only_replay",
  "test_fixture",
  "historical_evidence",
] as const;
export type LegacyOrchestrationConsumerRole = (typeof LEGACY_ORCHESTRATION_CONSUMER_ROLES)[number];

export const LEGACY_ORCHESTRATION_MIGRATION_STATES = ["frozen", "migrated", "retired"] as const;
export type LegacyOrchestrationMigrationState =
  (typeof LEGACY_ORCHESTRATION_MIGRATION_STATES)[number];

export interface LegacyOrchestrationSemanticConsumerEntry {
  capability_id: string;
  symbol_or_command: string;
  path: string;
  /** 固定行番号ではなく、ソース内で再解決できる安定anchor。 */
  line_anchor: string;
  consumer_role: LegacyOrchestrationConsumerRole;
  current_authority: string;
  target_authority: string;
  successor_symbol: string | null;
  migration_state: LegacyOrchestrationMigrationState;
  removal_preconditions: string[];
  negative_oracle_ids: string[];
}

export interface LegacyOrchestrationSemanticConsumerLedger {
  schema_version: typeof LEGACY_ORCHESTRATION_SEMANTIC_CONSUMER_SCHEMA_VERSION;
  authority_role: "compatibility_only_semantic_consumer_ledger";
  issue_id: 865;
  parent_plan: "PLAN-L7-729-legacy-orchestration-new-use-freeze";
  source_head: string;
  entries: LegacyOrchestrationSemanticConsumerEntry[];
}

export interface LegacyOrchestrationSemanticConsumerLedgerRevision {
  schema_version: typeof LEGACY_ORCHESTRATION_SEMANTIC_CONSUMER_REVISION_SCHEMA_VERSION;
  authority_role: "compatibility_only_semantic_consumer_ledger_revision";
  issue_id: 865;
  parent_plan: "PLAN-L7-865-legacy-orchestration-semantic-consumer-ledger";
  base_ledger_path: typeof LEGACY_ORCHESTRATION_SEMANTIC_CONSUMER_LEDGER_PATH;
  base_ledger_sha256: string;
  revision_id: string;
  source_head: string;
  revision_payload_sha256: string;
  entries: LegacyOrchestrationSemanticConsumerEntry[];
}

export interface LegacyOrchestrationSemanticConsumerSource {
  path: string;
  content: string;
}

export interface LegacyOrchestrationSemanticConsumerResult {
  ok: boolean;
  resolvedAnchors: Array<{ capability_id: string; path: string; line: number }>;
  errors: string[];
}

interface RequiredConsumer {
  capability_id: string;
  path: string;
  symbol_or_command: string;
  line_anchor: string;
  consumer_role: LegacyOrchestrationConsumerRole;
  negative_oracle_ids: readonly string[];
}

const LEDGER_SOURCE_HEAD = "70826900d1640cf02e2010ce09378410db11c7c6" as const;

const REQUIRED_CONSUMERS: RequiredConsumer[] = [
  {
    capability_id: "LEGACY-SEM-TEAM-CLI-DIRECT-001",
    path: "src/cli.ts",
    symbol_or_command: "executeTeamRunPlan",
    line_anchor: 'team\n  .command("run")',
    consumer_role: "direct_execution",
    negative_oracle_ids: ["U-LORET-SEM-001", "U-LORET-SEM-006", "U-LORET-SEM-009"],
  },
  {
    capability_id: "LEGACY-SEM-PAIR-CLI-DIRECT-001",
    path: "src/cli.ts",
    symbol_or_command: "runPairAgentTddPlan",
    line_anchor: 'pairAgent\n  .command("run")',
    consumer_role: "direct_execution",
    negative_oracle_ids: ["U-LORET-SEM-001", "U-LORET-SEM-006", "U-LORET-SEM-009"],
  },
  {
    capability_id: "LEGACY-SEM-LOOP-CLI-DIRECT-001",
    path: "src/cli.ts",
    symbol_or_command: "tick",
    line_anchor: 'loop\n  .command("run")',
    consumer_role: "direct_execution",
    negative_oracle_ids: ["U-LORET-SEM-001", "U-LORET-SEM-006", "U-LORET-SEM-009"],
  },
  {
    capability_id: "LEGACY-SEM-TEAM-FIRE-SLOT-001",
    path: "src/team/run.ts",
    symbol_or_command: "fireSlot",
    line_anchor: "slot = fireSlot(",
    consumer_role: "write_control",
    negative_oracle_ids: ["U-LORET-SEM-002", "U-LORET-SEM-004", "U-LORET-SEM-011"],
  },
  {
    capability_id: "LEGACY-SEM-TEAM-RELEASE-SLOT-001",
    path: "src/team/run.ts",
    symbol_or_command: "releaseSlot",
    line_anchor: "releaseSlot({ slotId: slot.slot_id",
    consumer_role: "write_control",
    negative_oracle_ids: ["U-LORET-SEM-002", "U-LORET-SEM-004", "U-LORET-SEM-011"],
  },
  {
    capability_id: "LEGACY-SEM-TEAM-MAX-PARALLEL-001",
    path: "src/team/run.ts",
    symbol_or_command: "plan.max_parallel",
    line_anchor: "i += plan.max_parallel",
    consumer_role: "write_control",
    negative_oracle_ids: ["U-LORET-SEM-003", "U-LORET-SEM-004", "U-LORET-SEM-011"],
  },
  {
    capability_id: "LEGACY-SEM-LOOP-STATE-WRITEBACK-001",
    path: "src/cli.ts",
    symbol_or_command: "store.write",
    line_anchor: "store.write(current)",
    consumer_role: "write_control",
    negative_oracle_ids: ["U-LORET-SEM-004", "U-LORET-SEM-005", "U-LORET-SEM-009"],
  },
  {
    capability_id: "LEGACY-SEM-LOOP-LEGACY-IMPORT-001",
    path: "src/orchestration/loop-store.ts",
    symbol_or_command: "importLegacy",
    line_anchor: "function importLegacy(planId: string)",
    consumer_role: "compatibility_adapter",
    negative_oracle_ids: ["U-LORET-SEM-006", "U-LORET-SEM-007", "U-LORET-SEM-010"],
  },
];

const REVISION_REQUIRED_CONSUMERS: RequiredConsumer[] = [
  {
    capability_id: "LEGACY-SEM-TEAM-SERIALIZE-AFTER-001",
    path: "src/team/run.ts",
    symbol_or_command: "member.serialize_after",
    line_anchor: "if (member.serialize_after) {",
    consumer_role: "write_control",
    negative_oracle_ids: ["U-LORET-SEM-014"],
  },
  {
    capability_id: "LEGACY-SEM-AGENT-SLOTS-DEPS-001",
    path: "src/runtime/agent-slots.ts",
    symbol_or_command: "nodeAgentSlotsDeps",
    line_anchor: "export function nodeAgentSlotsDeps(repoRoot: string): AgentSlotsDeps {",
    consumer_role: "write_control",
    negative_oracle_ids: ["U-LORET-SEM-015"],
  },
  {
    capability_id: "LEGACY-SEM-TEAM-SERIALIZATION-FLAG-001",
    path: "src/team/run.ts",
    symbol_or_command: "serializationRequired",
    line_anchor: "const serializationRequired = mustSerialize(team.serialization);",
    consumer_role: "write_control",
    negative_oracle_ids: ["U-LORET-SEM-017"],
  },
  {
    capability_id: "LEGACY-SEM-TEAM-DEPENDENCY-FAILURE-001",
    path: "src/team/run.ts",
    symbol_or_command: "failedDependencies.has(member.serialize_after)",
    line_anchor: "if (member.serialize_after && failedDependencies.has(member.serialize_after)) {",
    consumer_role: "write_control",
    negative_oracle_ids: ["U-LORET-SEM-018"],
  },
  {
    capability_id: "LEGACY-SEM-AGENT-SLOTS-WRITER-001",
    path: "src/runtime/agent-slots.ts",
    symbol_or_command: "writeText: (p, c)",
    line_anchor: "writeText: (p, c) => {",
    consumer_role: "write_control",
    negative_oracle_ids: ["U-LORET-SEM-019"],
  },
  {
    capability_id: "LEGACY-SEM-LOOP-LEGACY-IMPORT-WRITE-001",
    path: "src/orchestration/loop-store.ts",
    symbol_or_command: "renameSync(rawPath, sourcePath)",
    line_anchor: "renameSync(rawPath, sourcePath);",
    consumer_role: "write_control",
    negative_oracle_ids: ["U-LORET-SEM-016"],
  },
  {
    capability_id: "LEGACY-SEM-LOOP-LEGACY-IMPORT-COMMIT-001",
    path: "src/orchestration/loop-store.ts",
    symbol_or_command: "commitLoopEpoch",
    line_anchor: "const committed = commitLoopEpoch({",
    consumer_role: "write_control",
    negative_oracle_ids: ["U-LORET-SEM-020"],
  },
  {
    capability_id: "LEGACY-SEM-LOOP-LEGACY-IMPORT-DONE-MARKER-001",
    path: "src/orchestration/loop-store.ts",
    symbol_or_command: "publishDoneMarker",
    line_anchor: "publishDoneMarker(planId, sourceDigest);",
    consumer_role: "write_control",
    negative_oracle_ids: ["U-LORET-SEM-021"],
  },
];

const RETIREMENT_PRECONDITIONS = [
  "production_consumer_zero",
  "successor_production_callsite",
  "parity_e2e_green",
  "rollback_verified",
  "read_after_verified",
] as const;

const DIRECT_CALL_BASELINES = [
  { marker: "executeTeamRunPlan(", paths: { "src/cli.ts": 1, "src/team/run.ts": 1 } },
  {
    marker: "runPairAgentTddPlan(",
    paths: { "src/cli.ts": 1, "src/orchestration/pair-agent.ts": 1 },
  },
  { marker: "fireSlot(", paths: { "src/runtime/agent-slots.ts": 1, "src/team/run.ts": 1 } },
  { marker: "releaseSlot(", paths: { "src/runtime/agent-slots.ts": 1, "src/team/run.ts": 2 } },
] as const;

function isConsumerRole(value: unknown): value is LegacyOrchestrationConsumerRole {
  return (
    typeof value === "string" &&
    (LEGACY_ORCHESTRATION_CONSUMER_ROLES as readonly string[]).includes(value)
  );
}

function isMigrationState(value: unknown): value is LegacyOrchestrationMigrationState {
  return (
    typeof value === "string" &&
    (LEGACY_ORCHESTRATION_MIGRATION_STATES as readonly string[]).includes(value)
  );
}

function validRelativePath(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    !value.startsWith("/") &&
    !value.includes("..") &&
    value.startsWith("src/")
  );
}

function sourceLineAt(content: string, anchor: string): number | null {
  const offset = content.indexOf(anchor);
  if (offset < 0) return null;
  return content.slice(0, offset).split("\n").length;
}

function sourceHasSymbol(content: string, symbol: string): boolean {
  return content.includes(symbol);
}

function addError(errors: string[], value: string): void {
  if (!errors.includes(value)) errors.push(value);
}

function detectHiddenConsumers(
  files: LegacyOrchestrationSemanticConsumerSource[],
  errors: string[],
): void {
  for (const file of files) {
    if (!file.path.startsWith("src/")) continue;
    if (file.path === "src/lint/legacy-orchestration-semantic-consumers.ts") continue;
    for (const alias of file.content.matchAll(
      /\b(?:const|let|var)\s+\w+\s*=\s*(executeTeamRunPlan|runPairAgentTddPlan|fireSlot|releaseSlot)\b/g,
    )) {
      addError(errors, `hidden_alias_consumer:${file.path}:${alias[1]}`);
    }
    for (const dynamicImport of file.content.matchAll(
      /import\(\s*(?:["']([^"']*(?:team\/run|orchestration\/pair-agent|runtime\/agent-slots|orchestration\/loop-store)[^"']*)["']|`([^`$]*(?:team\/run|orchestration\/pair-agent|runtime\/agent-slots|orchestration\/loop-store)[^`$]*)`)\s*\)/g,
    )) {
      addError(
        errors,
        `hidden_dynamic_import:${file.path}:${dynamicImport[1] ?? dynamicImport[2]}`,
      );
    }
    for (const requireAlias of file.content.matchAll(
      /\brequire\(\s*["']([^"']*(?:team\/run|orchestration\/pair-agent|runtime\/agent-slots|orchestration\/loop-store)[^"']*)["']\s*\)\s*\.\s*(executeTeamRunPlan|runPairAgentTddPlan|fireSlot|releaseSlot|importLegacy)\b/g,
    )) {
      addError(
        errors,
        `hidden_require_consumer:${file.path}:${requireAlias[1]}:${requireAlias[2]}`,
      );
    }
    for (const destructuredRequire of file.content.matchAll(
      /\{[^}]*\b(executeTeamRunPlan|runPairAgentTddPlan|fireSlot|releaseSlot|importLegacy)\b[^}]*\}\s*=\s*require\(\s*["']([^"']*(?:team\/run|orchestration\/pair-agent|runtime\/agent-slots|orchestration\/loop-store)[^"']*)["']\s*\)/g,
    )) {
      addError(
        errors,
        `hidden_require_consumer:${file.path}:${destructuredRequire[2]}:${destructuredRequire[1]}`,
      );
    }
    for (const splitCommand of file.content.matchAll(
      /["'](team|pair-agent|loop)["']\s*,\s*["']run["']/g,
    )) {
      addError(errors, `hidden_split_command:${file.path}:${splitCommand[1]} run`);
    }
    for (const baseline of DIRECT_CALL_BASELINES) {
      const observed = file.content.split(baseline.marker).length - 1;
      const allowed = baseline.paths[file.path as keyof typeof baseline.paths] ?? 0;
      if (observed > allowed)
        addError(errors, `unregistered_direct_call:${file.path}:${baseline.marker}`);
    }
  }
}

function validateEntryShape(
  entry: LegacyOrchestrationSemanticConsumerEntry,
  errors: string[],
): void {
  const requiredStringFields = [
    "capability_id",
    "symbol_or_command",
    "path",
    "line_anchor",
    "current_authority",
    "target_authority",
  ] as const;
  for (const field of requiredStringFields) {
    if (typeof entry[field] !== "string" || entry[field].trim().length === 0)
      addError(errors, `entry_field_missing:${entry.capability_id || "<unknown>"}:${field}`);
  }
  if (!validRelativePath(entry.path))
    addError(errors, `entry_path_invalid:${entry.capability_id || "<unknown>"}`);
  if (!isConsumerRole(entry.consumer_role))
    addError(errors, `entry_role_invalid:${entry.capability_id || "<unknown>"}`);
  if (!isMigrationState(entry.migration_state))
    addError(errors, `entry_migration_state_invalid:${entry.capability_id || "<unknown>"}`);
  if (!(entry.successor_symbol === null || typeof entry.successor_symbol === "string"))
    addError(errors, `entry_successor_invalid:${entry.capability_id || "<unknown>"}`);
  if (!Array.isArray(entry.removal_preconditions) || entry.removal_preconditions.length === 0)
    addError(errors, `entry_removal_preconditions_missing:${entry.capability_id || "<unknown>"}`);
  if (!Array.isArray(entry.negative_oracle_ids) || entry.negative_oracle_ids.length === 0)
    addError(errors, `entry_negative_oracles_missing:${entry.capability_id || "<unknown>"}`);
}

function analyzeLedger(
  ledger: LegacyOrchestrationSemanticConsumerLedger,
  sourceFiles: LegacyOrchestrationSemanticConsumerSource[],
  requiredConsumers: readonly RequiredConsumer[],
): LegacyOrchestrationSemanticConsumerResult {
  const errors: string[] = [];
  const resolvedAnchors: LegacyOrchestrationSemanticConsumerResult["resolvedAnchors"] = [];
  const expectedRoleByCapability = new Map(
    requiredConsumers.map((consumer) => [consumer.capability_id, consumer.consumer_role]),
  );

  if (ledger.schema_version !== LEGACY_ORCHESTRATION_SEMANTIC_CONSUMER_SCHEMA_VERSION)
    addError(errors, "ledger_schema_invalid");
  if (ledger.authority_role !== "compatibility_only_semantic_consumer_ledger")
    addError(errors, "ledger_authority_role_invalid");
  if (ledger.issue_id !== 865) addError(errors, "ledger_issue_invalid");
  if (ledger.parent_plan !== "PLAN-L7-729-legacy-orchestration-new-use-freeze")
    addError(errors, "ledger_parent_plan_invalid");
  if (!/^[0-9a-f]{40}$/.test(ledger.source_head)) addError(errors, "ledger_source_head_invalid");
  else if (ledger.source_head !== LEDGER_SOURCE_HEAD)
    addError(errors, "ledger_source_head_unrecognized");
  if (!Array.isArray(ledger.entries)) addError(errors, "ledger_entries_invalid");

  const entries = Array.isArray(ledger.entries) ? ledger.entries : [];
  const byCapability = new Map<string, LegacyOrchestrationSemanticConsumerEntry>();
  for (const [index, candidate] of entries.entries()) {
    if (!candidate || typeof candidate !== "object") {
      addError(errors, `entry_shape_invalid:${index}`);
      continue;
    }
    const entry = candidate as LegacyOrchestrationSemanticConsumerEntry;
    const capabilityId =
      typeof entry.capability_id === "string" && entry.capability_id.length > 0
        ? entry.capability_id
        : "<unknown>";
    const path = typeof entry.path === "string" ? entry.path : "";
    const symbol = typeof entry.symbol_or_command === "string" ? entry.symbol_or_command : "";
    const anchor = typeof entry.line_anchor === "string" ? entry.line_anchor : "";
    validateEntryShape(entry, errors);
    if (byCapability.has(entry.capability_id))
      addError(errors, `duplicate_capability:${entry.capability_id}`);
    else byCapability.set(entry.capability_id, entry);

    const expectedRole = expectedRoleByCapability.get(entry.capability_id);
    const required = requiredConsumers.find(
      (consumer) => consumer.capability_id === entry.capability_id,
    );
    if (!required) addError(errors, `unregistered_capability:${entry.capability_id}`);
    if (expectedRole && entry.consumer_role !== expectedRole)
      addError(errors, `consumer_role_mismatch:${entry.capability_id}:${expectedRole}`);
    if (entry.consumer_role === "direct_execution" && !path.startsWith("src/"))
      addError(errors, `non_production_path_for_direct_consumer:${entry.capability_id}`);
    if (entry.consumer_role === "write_control" && !path.startsWith("src/"))
      addError(errors, `non_production_path_for_control_consumer:${entry.capability_id}`);
    if (
      required &&
      (entry.negative_oracle_ids.length !== required.negative_oracle_ids.length ||
        !required.negative_oracle_ids.every((oracle) => entry.negative_oracle_ids.includes(oracle)))
    )
      addError(errors, `negative_oracle_set_mismatch:${entry.capability_id}`);
    if (
      ["compatibility_adapter", "read_only_replay", "historical_evidence", "test_fixture"].includes(
        entry.consumer_role,
      ) &&
      ["executeTeamRunPlan", "runPairAgentTddPlan", "fireSlot", "releaseSlot", "store.write"].some(
        (marker) => symbol.includes(marker),
      )
    )
      addError(errors, `consumer_role_mismatch:${entry.capability_id}:direct_or_write_control`);

    const file = sourceFiles.find((candidate) => candidate.path === path);
    if (!file) {
      addError(errors, `source_file_missing:${capabilityId}:${path}`);
    } else {
      const line = sourceLineAt(file.content, anchor);
      if (line === null) addError(errors, `line_anchor_missing:${capabilityId}`);
      else resolvedAnchors.push({ capability_id: capabilityId, path, line });
      if (!sourceHasSymbol(file.content, symbol))
        addError(errors, `symbol_or_command_missing:${entry.capability_id}`);
    }

    if (entry.migration_state === "migrated" || entry.migration_state === "retired") {
      const actual = new Set(entry.removal_preconditions);
      if (!RETIREMENT_PRECONDITIONS.every((precondition) => actual.has(precondition)))
        addError(
          errors,
          entry.migration_state === "retired"
            ? `retirement_preconditions_incomplete:${entry.capability_id}`
            : `migration_preconditions_incomplete:${entry.capability_id}`,
        );
      if (!entry.successor_symbol)
        addError(errors, `migrated_successor_missing:${entry.capability_id}`);
      else if (
        typeof entry.successor_symbol !== "string" ||
        !sourceFiles.some(
          (file) =>
            file.path.startsWith("src/") && file.content.includes(entry.successor_symbol as string),
        )
      )
        addError(
          errors,
          `migrated_successor_not_found:${entry.capability_id}:${entry.successor_symbol}`,
        );
    }
  }

  for (const required of requiredConsumers) {
    const entry = byCapability.get(required.capability_id);
    if (!entry) {
      addError(errors, `required_capability_missing:${required.capability_id}`);
      continue;
    }
    if (entry.path !== required.path)
      addError(errors, `required_path_mismatch:${required.capability_id}:${required.path}`);
    if (entry.symbol_or_command !== required.symbol_or_command)
      addError(
        errors,
        `required_symbol_mismatch:${required.capability_id}:${required.symbol_or_command}`,
      );
    if (entry.line_anchor !== required.line_anchor)
      addError(errors, `required_anchor_mismatch:${required.capability_id}`);
  }

  detectHiddenConsumers(sourceFiles, errors);
  return { ok: errors.length === 0, resolvedAnchors, errors };
}

export function analyzeLegacyOrchestrationSemanticConsumers(
  ledger: LegacyOrchestrationSemanticConsumerLedger,
  sourceFiles: LegacyOrchestrationSemanticConsumerSource[],
): LegacyOrchestrationSemanticConsumerResult {
  return analyzeLedger(ledger, sourceFiles, REQUIRED_CONSUMERS);
}

function revisionPayload(
  revision: LegacyOrchestrationSemanticConsumerLedgerRevision,
): Omit<LegacyOrchestrationSemanticConsumerLedgerRevision, "revision_payload_sha256"> {
  const { revision_payload_sha256: _digest, ...payload } = revision;
  return payload;
}

function validateRevisionEnvelope(
  revision: LegacyOrchestrationSemanticConsumerLedgerRevision,
): string[] {
  const errors: string[] = [];
  if (revision.schema_version !== LEGACY_ORCHESTRATION_SEMANTIC_CONSUMER_REVISION_SCHEMA_VERSION)
    addError(errors, "revision_schema_invalid");
  if (revision.authority_role !== "compatibility_only_semantic_consumer_ledger_revision")
    addError(errors, "revision_authority_role_invalid");
  if (revision.issue_id !== 865) addError(errors, "revision_issue_invalid");
  if (revision.parent_plan !== "PLAN-L7-865-legacy-orchestration-semantic-consumer-ledger")
    addError(errors, "revision_parent_plan_invalid");
  if (revision.base_ledger_path !== LEGACY_ORCHESTRATION_SEMANTIC_CONSUMER_LEDGER_PATH)
    addError(errors, "revision_base_ledger_path_invalid");
  if (!/^sha256:[0-9a-f]{64}$/.test(revision.base_ledger_sha256))
    addError(errors, "revision_base_ledger_digest_invalid");
  if (!/^[A-Za-z0-9][A-Za-z0-9._-]{2,127}$/.test(revision.revision_id))
    addError(errors, "revision_id_invalid");
  if (!/^[0-9a-f]{40}$/.test(revision.source_head))
    addError(errors, "revision_source_head_invalid");
  if (!/^sha256:[0-9a-f]{64}$/.test(revision.revision_payload_sha256))
    addError(errors, "revision_payload_digest_invalid");
  else if (
    sha256Digest(canonicalJson(revisionPayload(revision))) !== revision.revision_payload_sha256
  )
    addError(errors, "revision_payload_digest_mismatch");
  if (!Array.isArray(revision.entries) || revision.entries.length === 0)
    addError(errors, "revision_entries_invalid");
  return errors;
}

export function analyzeLegacyOrchestrationSemanticConsumerLedgerRevision(
  ledger: LegacyOrchestrationSemanticConsumerLedger,
  revision: LegacyOrchestrationSemanticConsumerLedgerRevision,
  sourceFiles: LegacyOrchestrationSemanticConsumerSource[],
): LegacyOrchestrationSemanticConsumerResult {
  const envelopeErrors = validateRevisionEnvelope(revision);
  const combined = {
    ...ledger,
    entries: [...ledger.entries, ...(Array.isArray(revision.entries) ? revision.entries : [])],
  };
  const result = analyzeLedger(combined, sourceFiles, [
    ...REQUIRED_CONSUMERS,
    ...REVISION_REQUIRED_CONSUMERS,
  ]);
  return {
    ok: envelopeErrors.length === 0 && result.ok,
    resolvedAnchors: result.resolvedAnchors,
    errors: [...envelopeErrors, ...result.errors],
  };
}

export function loadLegacyOrchestrationSemanticConsumerLedger(repoRoot: string): {
  ledger: LegacyOrchestrationSemanticConsumerLedger;
  sourceFiles: LegacyOrchestrationSemanticConsumerSource[];
} {
  const ledgerPath = join(repoRoot, LEGACY_ORCHESTRATION_SEMANTIC_CONSUMER_LEDGER_PATH);
  if (!existsSync(ledgerPath))
    throw new Error("legacy orchestration semantic consumer ledger missing");
  const ledger = JSON.parse(
    readFileSync(ledgerPath, "utf8"),
  ) as LegacyOrchestrationSemanticConsumerLedger;
  const tracked = execFileSync("git", ["ls-files", "-z", "--", "src"], {
    cwd: repoRoot,
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
    stdio: ["ignore", "pipe", "pipe"],
  })
    .split("\0")
    .filter(Boolean);
  const sourceFiles = tracked
    .filter((path) => existsSync(join(repoRoot, path)))
    .map((path) => ({ path, content: readFileSync(join(repoRoot, path), "utf8") }));
  return { ledger, sourceFiles };
}

export function loadLegacyOrchestrationSemanticConsumerLedgerRevision(repoRoot: string): {
  ledger: LegacyOrchestrationSemanticConsumerLedger;
  revision: LegacyOrchestrationSemanticConsumerLedgerRevision;
  sourceFiles: LegacyOrchestrationSemanticConsumerSource[];
} {
  const loaded = loadLegacyOrchestrationSemanticConsumerLedger(repoRoot);
  const revisionPath = join(repoRoot, LEGACY_ORCHESTRATION_SEMANTIC_CONSUMER_REVISION_PATH);
  if (!existsSync(revisionPath))
    throw new Error("legacy orchestration semantic consumer ledger revision missing");
  const revision = JSON.parse(
    readFileSync(revisionPath, "utf8"),
  ) as LegacyOrchestrationSemanticConsumerLedgerRevision;
  const baseBytes = readFileSync(
    join(repoRoot, LEGACY_ORCHESTRATION_SEMANTIC_CONSUMER_LEDGER_PATH),
  );
  const envelopeErrors = validateRevisionEnvelope(revision);
  if (
    /^sha256:[0-9a-f]{64}$/.test(revision.base_ledger_sha256) &&
    sha256Digest(baseBytes) !== revision.base_ledger_sha256
  )
    envelopeErrors.push("revision_base_ledger_digest_mismatch");
  if (!/^[0-9a-f]{40}$/.test(revision.source_head)) {
    envelopeErrors.push("revision_source_head_invalid");
  } else {
    try {
      execFileSync("git", ["merge-base", "--is-ancestor", revision.source_head, "HEAD"], {
        cwd: repoRoot,
        stdio: "ignore",
      });
    } catch {
      envelopeErrors.push("revision_source_head_not_ancestor");
    }
  }
  if (envelopeErrors.length > 0) throw new Error(envelopeErrors.join(","));
  return { ...loaded, revision };
}

export function legacyOrchestrationSemanticConsumerMessages(
  result: LegacyOrchestrationSemanticConsumerResult,
): string[] {
  if (result.ok) {
    return [
      `legacy-orchestration-semantic-consumers - OK (resolved=${result.resolvedAnchors.length})`,
    ];
  }
  return [
    `legacy-orchestration-semantic-consumers - violation: errors=${result.errors.join(",") || "-"}`,
  ];
}

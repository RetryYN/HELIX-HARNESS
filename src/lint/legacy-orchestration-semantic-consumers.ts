import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export const LEGACY_ORCHESTRATION_SEMANTIC_CONSUMER_LEDGER_PATH =
  "config/legacy-orchestration-semantic-consumers.json" as const;
export const LEGACY_ORCHESTRATION_SEMANTIC_CONSUMER_SCHEMA_VERSION =
  "helix-legacy-orchestration-semantic-consumer-ledger.v1" as const;

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
  { marker: "store.write(", paths: { "src/cli.ts": 1 } },
] as const;

const EXPECTED_ROLE_BY_CAPABILITY = new Map(
  REQUIRED_CONSUMERS.map((consumer) => [consumer.capability_id, consumer.consumer_role]),
);

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
      /import\(\s*["']([^"']*(?:team\/run|orchestration\/pair-agent|runtime\/agent-slots)[^"']*)["']\s*\)/g,
    )) {
      addError(errors, `hidden_dynamic_import:${file.path}:${dynamicImport[1]}`);
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

export function analyzeLegacyOrchestrationSemanticConsumers(
  ledger: LegacyOrchestrationSemanticConsumerLedger,
  sourceFiles: LegacyOrchestrationSemanticConsumerSource[],
): LegacyOrchestrationSemanticConsumerResult {
  const errors: string[] = [];
  const resolvedAnchors: LegacyOrchestrationSemanticConsumerResult["resolvedAnchors"] = [];

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

    const expectedRole = EXPECTED_ROLE_BY_CAPABILITY.get(entry.capability_id);
    const required = REQUIRED_CONSUMERS.find(
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

  for (const required of REQUIRED_CONSUMERS) {
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

import { createHash } from "node:crypto";

export type CiProfile =
  | "draft_preflight"
  | "candidate_admission"
  | "post_merge_full"
  | "nightly_full";
export type RiskClass = "known_low" | "known_high" | "unknown";
export type VerificationKind =
  | "guard"
  | "typecheck"
  | "unit"
  | "integration"
  | "db"
  | "lint"
  | "doctor"
  | "platform";
export type ExecutionSurface = "local_internal" | "github_actions";

export interface VerificationItem {
  id: string;
  kind: VerificationKind;
  owner: string;
  command: readonly string[];
  pathSelectors: readonly string[];
  relationNodeIds: readonly string[];
  mandatoryProfiles: readonly CiProfile[];
  riskTags: readonly string[];
}

export interface ImpactDecision {
  profile: CiProfile;
  baseHead: string;
  candidateHead: string;
  bodyDigest: `sha256:${string}`;
  inventoryDigest: `sha256:${string}`;
  riskClass: RiskClass;
  selectedItemIds: readonly string[];
  deferredItemIds: readonly string[];
  reasonCodes: readonly string[];
  fullAdmissionRequired: boolean;
}

export interface ImpactDecisionInput {
  profile: CiProfile;
  baseHead: string;
  candidateHead: string;
  bodyDigest: `sha256:${string}`;
  changedPaths: readonly string[];
  companionItemIds: readonly string[];
  knownNoConsumerPaths: readonly string[];
  inventory: readonly VerificationItem[];
}

export interface CiItemResult {
  itemId: string;
  attempt: number;
  startedAt: string;
  completedAt: string;
  durationMs: number;
  exitCode: number;
  outputDigest: `sha256:${string}`;
}

export interface CiProfileReceipt extends ImpactDecision {
  schemaVersion: "helix-impact-ci-receipt.v1";
  eventId: string;
  runId: string;
  executionSurface: ExecutionSurface;
  environmentDigest: `sha256:${string}`;
  cacheClass: "cold" | "warm";
  results: readonly CiItemResult[];
  terminal: boolean;
}

export interface ReceiptDurationSample {
  profile: CiProfile;
  executionSurface: ExecutionSurface;
  environmentDigest: `sha256:${string}`;
  cacheClass: "cold" | "warm";
  durationMs: number;
}

export interface TestSource {
  path: string;
  content: string;
}

const PROFILES = new Set<CiProfile>([
  "draft_preflight",
  "candidate_admission",
  "post_merge_full",
  "nightly_full",
]);
const KINDS = new Set<VerificationKind>([
  "guard",
  "typecheck",
  "unit",
  "integration",
  "db",
  "lint",
  "doctor",
  "platform",
]);
const HIGH_RISK_PREFIXES = [".github/workflows/", ".github/actions/", "migrations/"];
const HIGH_RISK_EXACT = new Set([
  "package.json",
  "package-lock.json",
  "tsconfig.json",
  "vitest.config.ts",
  ".codex/hooks.json",
  ".claude/settings.json",
]);

/** repository I/Oはcallerに残し、test pathとimportだけをverification inventoryへ純粋投影する。 */
export function buildTestVerificationInventory(sources: readonly TestSource[]): VerificationItem[] {
  return [...sources]
    .filter((source) => source.path.startsWith("tests/") && source.path.endsWith(".test.ts"))
    .map((source) => {
      const importedSources = [...source.content.matchAll(/from\s+["']\.\.\/(src\/[^"']+)["']/g)]
        .map((match) => match[1] ?? "")
        .map((path) => (path.endsWith(".ts") ? path : `${path}.ts`));
      const referencedArtifacts = [
        ...source.content.matchAll(
          /["']((?:src|docs\/(?:plans|design|test-design))\/[^"']+\.(?:ts|md))["']/g,
        ),
      ].map((match) => match[1] ?? "");
      return {
        id: `test:${source.path}`,
        kind: source.path.startsWith("tests/slow/") ? ("integration" as const) : ("unit" as const),
        owner: source.path.replace(/^tests\//, "").replace(/\.test\.ts$/, ""),
        command: ["vitest", "run", source.path],
        pathSelectors: sortedUnique([source.path, ...importedSources, ...referencedArtifacts]),
        relationNodeIds: [],
        mandatoryProfiles: [],
        riskTags: [],
      } satisfies VerificationItem;
    })
    .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
}

function sortedUnique(values: readonly string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))].sort((a, b) =>
    a < b ? -1 : a > b ? 1 : 0,
  );
}

function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.entries(value)
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
      .map(([key, child]) => `${JSON.stringify(key)}:${canonical(child)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

function digest(value: unknown): `sha256:${string}` {
  return `sha256:${createHash("sha256").update(canonical(value)).digest("hex")}`;
}

export function validateVerificationInventory(inventory: readonly VerificationItem[]): {
  ok: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const ids = new Set<string>();
  const commands = new Set<string>();
  for (const item of inventory) {
    const id = item.id.trim();
    if (!id || ids.has(id)) errors.push(`duplicate_or_empty_id:${id || "<empty>"}`);
    ids.add(id);
    if (!item.owner.trim()) errors.push(`owner_required:${id}`);
    if (item.command.length === 0 || item.command.some((part) => !part.trim())) {
      errors.push(`command_required:${id}`);
    }
    const commandKey = canonical(item.command);
    if (commands.has(commandKey)) errors.push(`duplicate_command:${id}`);
    commands.add(commandKey);
    if (!KINDS.has(item.kind)) errors.push(`unknown_kind:${id}`);
    if (item.mandatoryProfiles.some((profile) => !PROFILES.has(profile))) {
      errors.push(`unknown_profile:${id}`);
    }
  }
  return { ok: errors.length === 0, errors: sortedUnique(errors) };
}

function isHighRiskPath(path: string): boolean {
  return (
    HIGH_RISK_EXACT.has(path) ||
    HIGH_RISK_PREFIXES.some((prefix) => path.startsWith(prefix)) ||
    /(security|permission|secret|schema|migration|rollback|checkpoint)/i.test(path)
  );
}

export function computeImpactDecision(input: ImpactDecisionInput): ImpactDecision {
  const inventoryValidation = validateVerificationInventory(input.inventory);
  if (!inventoryValidation.ok)
    throw new Error(`invalid_inventory:${inventoryValidation.errors.join(",")}`);
  if (
    !/^[0-9a-f]{40}$/.test(input.baseHead) ||
    !/^[0-9a-f]{40}$/.test(input.candidateHead) ||
    !/^sha256:[0-9a-f]{64}$/.test(input.bodyDigest)
  ) {
    throw new Error("snapshot_unavailable");
  }

  const changedPaths = sortedUnique(input.changedPaths);
  const knownNoConsumer = new Set(sortedUnique(input.knownNoConsumerPaths));
  const byId = new Map(input.inventory.map((item) => [item.id, item]));
  const selected = new Set<string>();
  for (const item of input.inventory) {
    if (item.mandatoryProfiles.includes(input.profile)) selected.add(item.id);
    if (item.pathSelectors.some((path) => changedPaths.includes(path))) selected.add(item.id);
  }
  for (const id of sortedUnique(input.companionItemIds)) {
    if (!byId.has(id)) throw new Error(`unknown_impact:companion:${id}`);
    selected.add(id);
  }

  const unmatched = changedPaths.filter(
    (path) =>
      !knownNoConsumer.has(path) &&
      !input.inventory.some((item) => item.pathSelectors.includes(path)),
  );
  const highRisk = changedPaths.some(isHighRiskPath);
  const fullProfile = input.profile !== "draft_preflight";
  const fullAdmissionRequired = fullProfile || highRisk || unmatched.length > 0;
  if (fullAdmissionRequired) for (const item of input.inventory) selected.add(item.id);

  const allIds = sortedUnique(input.inventory.map((item) => item.id));
  const selectedItemIds = sortedUnique([...selected]);
  const deferredItemIds = allIds.filter((id) => !selected.has(id));
  const reasonCodes = sortedUnique([
    ...(fullProfile ? ["profile_requires_full"] : []),
    ...(highRisk ? ["high_risk_path"] : []),
    ...(unmatched.length > 0 ? ["unknown_impact"] : []),
    ...(selectedItemIds.length > 0 ? ["mandatory_or_impact_selected"] : []),
  ]);
  if (selectedItemIds.some((id) => deferredItemIds.includes(id)))
    throw new Error("partition_mismatch");
  if (sortedUnique([...selectedItemIds, ...deferredItemIds]).join("\0") !== allIds.join("\0")) {
    throw new Error("partition_mismatch");
  }

  return {
    profile: input.profile,
    baseHead: input.baseHead,
    candidateHead: input.candidateHead,
    bodyDigest: input.bodyDigest,
    inventoryDigest: digest(
      [...input.inventory]
        .map((item) => ({
          ...item,
          command: [...item.command],
          pathSelectors: sortedUnique(item.pathSelectors),
          relationNodeIds: sortedUnique(item.relationNodeIds),
          mandatoryProfiles: sortedUnique(item.mandatoryProfiles),
          riskTags: sortedUnique(item.riskTags),
        }))
        .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0)),
    ),
    riskClass: unmatched.length > 0 ? "unknown" : highRisk ? "known_high" : "known_low",
    selectedItemIds,
    deferredItemIds,
    reasonCodes,
    fullAdmissionRequired,
  };
}

export function validateCiProfileReceipt(
  receipt: CiProfileReceipt,
  previous: readonly CiProfileReceipt[],
): { ok: boolean; errors: string[] } {
  const errors: string[] = [];
  const selected = sortedUnique(receipt.selectedItemIds);
  const resultIds = sortedUnique(receipt.results.map((result) => result.itemId));
  if (receipt.terminal && selected.join("\0") !== resultIds.join("\0"))
    errors.push("result_exact_set_mismatch");
  if (receipt.terminal && receipt.results.some((result) => result.exitCode !== 0))
    errors.push("terminal_nonzero_exit");
  if (
    receipt.results.some((result) => result.attempt < 1 || !result.startedAt || !result.completedAt)
  )
    errors.push("result_invalid");
  if (
    receipt.terminal &&
    previous.some(
      (prior) =>
        prior.terminal &&
        prior.candidateHead === receipt.candidateHead &&
        prior.profile === receipt.profile &&
        prior.executionSurface === receipt.executionSurface &&
        prior.selectedItemIds.some((id) => receipt.selectedItemIds.includes(id)),
    )
  ) {
    errors.push("duplicate_terminal");
  }
  return { ok: errors.length === 0, errors: sortedUnique(errors) };
}

function percentile(sorted: readonly number[], fraction: number): number {
  return sorted[Math.max(0, Math.ceil(sorted.length * fraction) - 1)] ?? 0;
}

export function computeReceiptPercentiles(
  samples: readonly ReceiptDurationSample[],
  budgetMs: number,
): {
  sampleCount: number;
  excludedCount: number;
  p50: number;
  p95: number;
  budgetExceeded: boolean;
  correctnessAffected: false;
} {
  if (samples.length === 0)
    return {
      sampleCount: 0,
      excludedCount: 0,
      p50: 0,
      p95: 0,
      budgetExceeded: false,
      correctnessAffected: false,
    };
  const first = samples.at(0);
  if (!first) throw new Error("percentile_sample_missing");
  const included = samples.filter(
    (sample) =>
      sample.profile === first.profile &&
      sample.executionSurface === first.executionSurface &&
      sample.environmentDigest === first.environmentDigest &&
      sample.cacheClass === first.cacheClass,
  );
  const durations = included.map((sample) => sample.durationMs).sort((a, b) => a - b);
  const p95 = percentile(durations, 0.95);
  return {
    sampleCount: included.length,
    excludedCount: samples.length - included.length,
    p50: percentile(durations, 0.5),
    p95,
    budgetExceeded: p95 > budgetMs,
    correctnessAffected: false,
  };
}

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { posix } from "node:path";
import { pathToFileURL } from "node:url";
import {
  LITE_CANARY_COVERAGE_PATHS,
  runLiteCanaryFastCheck,
} from "../setup/distribution-dependency-closure";

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
  relationResolvedPaths: readonly string[];
  forceFullAdmission?: boolean;
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

export type SourceModule = TestSource;

export const LITE_CANARY_MANIFEST_PATHS = [
  "config/distribution-profile-catalog.json",
  "requirements-ir/manifest.json",
  "requirements-ir/refinement_contracts.json",
  "package.json",
  "package-lock.json",
] as const;

export const LITE_CANARY_GENERATED_DEPENDENCY_PATHS = [
  "config/distribution-capability-artifact-catalog.json",
  "src/setup/distribution-artifact-projection.ts",
  "src/setup/distribution-dependency-closure.ts",
  "src/setup/distribution-lite-package.ts",
  "src/runtime/impact-ci.ts",
  ".github/workflows/harness-check.yml",
] as const;

export type LiteCanaryDisposition = "required" | "authorized_skip";
export type LiteCanarySkipCode = "closure_unaffected";
export type LiteCanaryReasonCode =
  | "closure_unaffected"
  | "full_context"
  | "changed_path_closure_contact"
  | "deletion"
  | "rename"
  | "generated_dependency_change"
  | "manifest_change"
  | "selector_uncertain"
  | "path_read_failure"
  | "stale_digest"
  | "fast_profile_check_failed"
  | "fast_manifest_check_failed"
  | "fast_closure_check_failed";

export interface LiteCanaryFastCheck {
  profile_ok: boolean;
  manifest_ok: boolean;
  closure_ok: boolean;
  artifact_paths: readonly string[];
  closure_paths: readonly string[];
  source_head: string | null;
  candidate_head: string;
}

export interface LiteCanarySelectorInput {
  event_name: "pull_request" | "push" | "schedule" | "workflow_dispatch";
  ref_name: string;
  changed_paths: readonly string[];
  change_kinds: readonly { status: string; path: string }[];
  fast_check: LiteCanaryFastCheck;
  manifest_paths?: readonly string[];
  generated_dependency_paths?: readonly string[];
  selector_uncertain?: boolean;
  path_read_failed?: boolean;
  stale_digest?: boolean;
}

export interface LiteCanarySelection {
  disposition: LiteCanaryDisposition;
  skip_code: LiteCanarySkipCode | null;
  reason_codes: readonly LiteCanaryReasonCode[];
}

export interface LiteCanaryRepositorySelectorInput {
  repo_root: string;
  event_name: "pull_request" | "push" | "schedule" | "workflow_dispatch";
  ref_name: string;
  candidate_head: string;
  before_head?: string;
  pull_request_base_head?: string;
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
  "src/cli.ts",
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
      const importedSources = [
        ...source.content.matchAll(/from\s+["'](?:\.\.\/)+(src\/[^"']+)["']/g),
      ]
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

/** source→source import consumerを決定的に投影し、推移閉包未解決のleaf判定に使う。 */
export function collectSourceImportConsumers(modules: readonly SourceModule[]): Set<string> {
  const paths = new Set(modules.map((module) => module.path));
  const consumers = new Set<string>();
  for (const module of modules) {
    const specifiers = [
      ...module.content.matchAll(/(?:from\s+|import\s*\(|require\s*\()["'](\.{1,2}\/[^"']+)["']/g),
    ].map((match) => match[1] ?? "");
    for (const specifier of specifiers) {
      const raw = posix.normalize(posix.join(posix.dirname(module.path), specifier));
      const stem = raw.replace(/\.(?:js|mjs|cjs)$/, "");
      const candidates = [raw, stem, `${stem}.ts`, `${stem}.tsx`, `${stem}/index.ts`];
      const target = candidates.find((candidate) => paths.has(candidate));
      if (target && target !== module.path) consumers.add(target);
    }
  }
  return consumers;
}

function sortedUnique(values: readonly string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))].sort((a, b) =>
    a < b ? -1 : a > b ? 1 : 0,
  );
}

/**
 * Lite artifactを省略できる唯一の境界を決定する。fast check自体はcallerが必ず実行し、
 * その結果と変更metadataが一つでも不確実ならtyped requiredへ倒す。
 */
export function selectLiteCanaryLane(input: LiteCanarySelectorInput): LiteCanarySelection {
  const reasons = new Set<LiteCanaryReasonCode>();
  const changedPaths = new Set(sortedUnique(input.changed_paths));
  const observedChangePaths = new Set(
    sortedUnique([...input.changed_paths, ...input.change_kinds.map((change) => change.path)]),
  );
  const closurePaths = new Set(
    sortedUnique([
      ...input.fast_check.artifact_paths,
      ...input.fast_check.closure_paths,
      ...LITE_CANARY_COVERAGE_PATHS,
    ]),
  );
  const manifestPaths = new Set(sortedUnique(input.manifest_paths ?? LITE_CANARY_MANIFEST_PATHS));
  const generatedDependencyPaths = new Set(
    sortedUnique(input.generated_dependency_paths ?? LITE_CANARY_GENERATED_DEPENDENCY_PATHS),
  );

  if (
    input.event_name !== "pull_request" ||
    input.ref_name === "main" ||
    input.ref_name === "release-candidate" ||
    input.ref_name.startsWith("release-candidate/")
  ) {
    reasons.add("full_context");
  }
  if ([...observedChangePaths].some((path) => closurePaths.has(path))) {
    reasons.add("changed_path_closure_contact");
  }
  for (const change of input.change_kinds) {
    const status = change.status.trim().toUpperCase();
    if (!/^(?:A|M|D|T|R[0-9]+|C[0-9]+)$/.test(status)) reasons.add("selector_uncertain");
    if (status === "D" || status.startsWith("D")) reasons.add("deletion");
    if (status === "R" || status.startsWith("R")) reasons.add("rename");
  }
  if ([...changedPaths].some((path) => generatedDependencyPaths.has(path))) {
    reasons.add("generated_dependency_change");
  }
  if ([...changedPaths].some((path) => manifestPaths.has(path))) reasons.add("manifest_change");
  if (input.selector_uncertain) reasons.add("selector_uncertain");
  if (input.path_read_failed) reasons.add("path_read_failure");
  if (
    input.stale_digest ||
    !/^[0-9a-f]{40}$/.test(input.fast_check.candidate_head) ||
    input.fast_check.source_head !== input.fast_check.candidate_head
  ) {
    reasons.add("stale_digest");
  }
  if (!input.fast_check.profile_ok) reasons.add("fast_profile_check_failed");
  if (!input.fast_check.manifest_ok) reasons.add("fast_manifest_check_failed");
  if (!input.fast_check.closure_ok) reasons.add("fast_closure_check_failed");

  if (reasons.size === 0) {
    return {
      disposition: "authorized_skip",
      skip_code: "closure_unaffected",
      reason_codes: ["closure_unaffected"],
    };
  }
  return {
    disposition: "required",
    skip_code: null,
    reason_codes: sortedUnique([...reasons]) as LiteCanaryReasonCode[],
  };
}

function parseLiteCanaryChangeMetadata(raw: string): {
  changed_paths: string[];
  change_kinds: Array<{ status: string; path: string }>;
} {
  const entries = raw.split("\0").filter(Boolean);
  const changed_paths: string[] = [];
  const change_kinds: Array<{ status: string; path: string }> = [];
  for (let index = 0; index < entries.length; index += 1) {
    const status = entries[index] ?? "";
    const firstPath = entries[index + 1] ?? "";
    if (!status || !firstPath) continue;
    changed_paths.push(firstPath);
    change_kinds.push({ status, path: firstPath });
    index += 1;
    if (status.startsWith("R") || status.startsWith("C")) {
      const secondPath = entries[index + 1] ?? "";
      if (secondPath) {
        changed_paths.push(secondPath);
        change_kinds.push({ status, path: secondPath });
        index += 1;
      }
    }
  }
  return { changed_paths: sortedUnique(changed_paths), change_kinds };
}

function gitOutput(repoRoot: string, args: readonly string[]): string {
  return execFileSync("git", [...args], { cwd: repoRoot, encoding: "utf8" }).trim();
}

/** CIのrepository metadataをread-onlyで収集し、fast checkを必ず通してselectorへ渡す。 */
export function runLiteCanaryRepositorySelector(
  input: LiteCanaryRepositorySelectorInput,
): LiteCanarySelection {
  let pathReadFailed = false;
  let baseHead = input.pull_request_base_head || input.before_head || "";
  if (input.pull_request_base_head) {
    try {
      baseHead = gitOutput(input.repo_root, [
        "merge-base",
        input.pull_request_base_head,
        input.candidate_head,
      ]);
    } catch {
      pathReadFailed = true;
      baseHead = "";
    }
  }
  if (!baseHead) {
    try {
      baseHead = gitOutput(input.repo_root, ["rev-parse", `${input.candidate_head}^`]);
    } catch {
      pathReadFailed = true;
    }
  }
  const metadata = {
    changed_paths: [] as string[],
    change_kinds: [] as Array<{ status: string; path: string }>,
  };
  if (baseHead) {
    try {
      Object.assign(
        metadata,
        parseLiteCanaryChangeMetadata(
          execFileSync(
            "git",
            ["diff", "--name-status", "-z", `${baseHead}..${input.candidate_head}`],
            { cwd: input.repo_root, encoding: "utf8" },
          ),
        ),
      );
    } catch {
      pathReadFailed = true;
    }
  } else {
    pathReadFailed = true;
  }
  const fastCheck = runLiteCanaryFastCheck({
    repoRoot: input.repo_root,
    candidateHead: input.candidate_head,
  });
  return selectLiteCanaryLane({
    event_name: input.event_name,
    ref_name: input.ref_name,
    changed_paths: metadata.changed_paths,
    change_kinds: metadata.change_kinds,
    fast_check: fastCheck,
    path_read_failed: pathReadFailed || fastCheck.path_read_failed,
  });
}

function runLiteCanarySelectorCommand(): void {
  const eventName = process.env.EVENT_NAME;
  const eventNames = new Set<LiteCanaryRepositorySelectorInput["event_name"]>([
    "pull_request",
    "push",
    "schedule",
    "workflow_dispatch",
  ]);
  const validEvent =
    eventName && eventNames.has(eventName as LiteCanaryRepositorySelectorInput["event_name"]);
  const selection = runLiteCanaryRepositorySelector({
    repo_root: process.cwd(),
    event_name: (validEvent
      ? eventName
      : "pull_request") as LiteCanaryRepositorySelectorInput["event_name"],
    ref_name: process.env.REF_NAME ?? "",
    candidate_head: process.env.CANDIDATE_HEAD ?? "",
    before_head: process.env.BEFORE_SHA,
    pull_request_base_head: process.env.PR_BASE_SHA,
  });
  const output = validEvent
    ? selection
    : {
        ...selection,
        disposition: "required" as const,
        skip_code: null,
        reason_codes: ["selector_uncertain" as const],
      };
  process.stdout.write(`${JSON.stringify(output)}\n`);
}

if (process.argv[2] === "lite-canary-selector" && process.argv[1]) {
  const invokedScript = pathToFileURL(process.argv[1]).href;
  if (invokedScript === import.meta.url) runLiteCanarySelectorCommand();
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
  const relationResolved = new Set(sortedUnique(input.relationResolvedPaths));
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
      !relationResolved.has(path) &&
      !input.inventory.some((item) => item.pathSelectors.includes(path)),
  );
  const highRisk = changedPaths.some(isHighRiskPath);
  const fullProfile = input.profile !== "draft_preflight";
  const emptySelection = selected.size === 0;
  const fullAdmissionRequired =
    fullProfile ||
    highRisk ||
    unmatched.length > 0 ||
    emptySelection ||
    input.forceFullAdmission === true;
  if (fullAdmissionRequired) for (const item of input.inventory) selected.add(item.id);

  const allIds = sortedUnique(input.inventory.map((item) => item.id));
  const selectedItemIds = sortedUnique([...selected]);
  const deferredItemIds = allIds.filter((id) => !selected.has(id));
  const reasonCodes = sortedUnique([
    ...(fullProfile ? ["profile_requires_full"] : []),
    ...(highRisk ? ["high_risk_path"] : []),
    ...(unmatched.length > 0 ? ["unknown_impact"] : []),
    ...(emptySelection ? ["empty_selection_full_fallback"] : []),
    ...(input.forceFullAdmission ? ["source_consumer_unknown_closure"] : []),
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
    riskClass:
      unmatched.length > 0
        ? "unknown"
        : highRisk || input.forceFullAdmission
          ? "known_high"
          : "known_low",
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
  const deferred = sortedUnique(receipt.deferredItemIds);
  const resultIds = sortedUnique(receipt.results.map((result) => result.itemId));
  if (receipt.schemaVersion !== "helix-impact-ci-receipt.v1") errors.push("receipt_schema_invalid");
  if (!/^[0-9a-f]{40}$/.test(receipt.baseHead) || !/^[0-9a-f]{40}$/.test(receipt.candidateHead))
    errors.push("receipt_head_invalid");
  for (const value of [
    receipt.bodyDigest,
    receipt.inventoryDigest,
    receipt.environmentDigest,
    ...receipt.results.map((result) => result.outputDigest),
  ]) {
    if (!/^sha256:[0-9a-f]{64}$/.test(value)) errors.push("receipt_digest_invalid");
  }
  if (selected.some((id) => deferred.includes(id))) errors.push("partition_mismatch");
  if (resultIds.length !== receipt.results.length) errors.push("duplicate_result_item");
  if (receipt.terminal && selected.join("\0") !== resultIds.join("\0"))
    errors.push("result_exact_set_mismatch");
  if (receipt.terminal && receipt.results.some((result) => result.exitCode !== 0))
    errors.push("terminal_nonzero_exit");
  if (
    receipt.results.some((result) => result.attempt < 1 || !result.startedAt || !result.completedAt)
  )
    errors.push("result_invalid");
  if (receipt.terminal) {
    for (const prior of previous.filter(
      (candidate) =>
        candidate.terminal &&
        candidate.candidateHead === receipt.candidateHead &&
        candidate.profile === receipt.profile &&
        candidate.executionSurface === receipt.executionSurface &&
        candidate.selectedItemIds.some((id) => receipt.selectedItemIds.includes(id)),
    )) {
      if (
        prior.baseHead !== receipt.baseHead ||
        prior.inventoryDigest !== receipt.inventoryDigest ||
        prior.bodyDigest !== receipt.bodyDigest
      )
        errors.push("receipt_binding_mismatch");
      else errors.push("duplicate_terminal");
    }
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
  const groupKey = (sample: ReceiptDurationSample): string =>
    [sample.profile, sample.executionSurface, sample.environmentDigest, sample.cacheClass].join(
      "\0",
    );
  if (new Set(samples.map(groupKey)).size !== 1) throw new Error("mixed_percentile_group");
  const durations = samples.map((sample) => sample.durationMs).sort((a, b) => a - b);
  const p95 = percentile(durations, 0.95);
  return {
    sampleCount: samples.length,
    excludedCount: 0,
    p50: percentile(durations, 0.5),
    p95,
    budgetExceeded: p95 > budgetMs,
    correctnessAffected: false,
  };
}

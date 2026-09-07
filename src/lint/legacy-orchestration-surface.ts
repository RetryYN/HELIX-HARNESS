import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export const LEGACY_ORCHESTRATION_INVENTORY_PATH =
  "config/legacy-orchestration-surface-inventory.json";

const ALLOWED_EXCLUSIONS = new Set([
  LEGACY_ORCHESTRATION_INVENTORY_PATH,
  "src/lint/legacy-orchestration-surface.ts",
  "tests/legacy-orchestration-surface.test.ts",
  "docs/plans/PLAN-L7-729-legacy-orchestration-new-use-freeze.md",
  "docs/design/helix/L6-function-design/legacy-orchestration-retirement-ratchet.md",
  "docs/test-design/helix/L8-legacy-orchestration-retirement-ratchet.md",
]);

export const LEGACY_ORCHESTRATION_MARKERS = [
  "helix team run",
  "helix pair-agent",
  "helix loop run",
  "executeTeamRunPlan",
  "nodeAgentSlotsDeps",
  "buildRuntimeCapabilityMatrixReport",
] as const;

export interface LegacyOrchestrationInventoryEntry {
  path: string;
  maximum_occurrences: number;
}

export interface LegacyOrchestrationInventory {
  schema_version: "helix-legacy-orchestration-surface-inventory.v1";
  authority_role: "compatibility_only_retirement_ratchet";
  source_head: string;
  excluded_historical_prefixes: string[];
  excluded_implementation_paths: string[];
  entries: LegacyOrchestrationInventoryEntry[];
}

export interface LegacyOrchestrationSurfaceResult {
  ok: boolean;
  checkedFiles: number;
  currentOccurrences: number;
  baselineOccurrences: number;
  newPaths: string[];
  growth: Array<{ path: string; actual: number; maximum: number }>;
  staleEntries: string[];
  errors: string[];
}

export interface LegacyOrchestrationFile {
  path: string;
  content: string;
}

/** 呼出側がpublished baseから取得したinventoryとの単調減少を検査する。 */
export function compareLegacyOrchestrationInventory(
  candidate: LegacyOrchestrationInventory,
  published: LegacyOrchestrationInventory,
): string[] {
  const errors: string[] = [];
  const previous = new Map(
    published.entries.map((entry) => [entry.path, entry.maximum_occurrences]),
  );
  for (const entry of candidate.entries) {
    const maximum = previous.get(entry.path);
    if (maximum === undefined) errors.push(`inventory_path_added:${entry.path}`);
    else if (entry.maximum_occurrences > maximum)
      errors.push(`inventory_limit_raised:${entry.path}`);
  }
  if (candidate.source_head !== published.source_head) errors.push("inventory_source_head_changed");
  for (const prefix of candidate.excluded_historical_prefixes) {
    if (!published.excluded_historical_prefixes.includes(prefix))
      errors.push("inventory_historical_exclusion_added");
  }
  for (const path of candidate.excluded_implementation_paths) {
    if (!published.excluded_implementation_paths.includes(path))
      errors.push(`inventory_implementation_exclusion_added:${path}`);
  }
  return errors;
}

function countMarkers(content: string): number {
  return LEGACY_ORCHESTRATION_MARKERS.reduce((total, marker) => {
    let count = 0;
    let offset = 0;
    let match = content.indexOf(marker, offset);
    while (match >= 0) {
      count += 1;
      offset = match + marker.length;
      match = content.indexOf(marker, offset);
    }
    return total + count;
  }, 0);
}

/**
 * Vitest JSON reporter の成功記録は実行surfaceではなく、既に実行された検証のimmutable evidenceである。
 * pathだけでは除外せず、成功構造をparseできる場合に限ってratchetの実装利用走査から外す。
 */
export function isNonExecutableSuccessfulVitestEvidence(file: LegacyOrchestrationFile): boolean {
  if (!file.path.startsWith(".helix/evidence/") || !file.path.endsWith(".vitest.log")) return false;
  try {
    const report = JSON.parse(file.content) as Record<string, unknown>;
    if (
      report.success !== true ||
      report.numFailedTests !== 0 ||
      report.numFailedTestSuites !== 0 ||
      !Array.isArray(report.testResults) ||
      report.testResults.length === 0
    )
      return false;
    return report.testResults.every(
      (result) =>
        typeof result === "object" &&
        result !== null &&
        (result as Record<string, unknown>).status === "passed",
    );
  } catch {
    return false;
  }
}

export function analyzeLegacyOrchestrationSurface(
  inventory: LegacyOrchestrationInventory,
  files: LegacyOrchestrationFile[],
): LegacyOrchestrationSurfaceResult {
  const errors: string[] = [];
  if (inventory.schema_version !== "helix-legacy-orchestration-surface-inventory.v1")
    errors.push("inventory_schema_invalid");
  if (inventory.authority_role !== "compatibility_only_retirement_ratchet")
    errors.push("inventory_authority_role_invalid");
  if (!/^[0-9a-f]{40}$/.test(inventory.source_head)) errors.push("inventory_source_head_invalid");

  const baseline = new Map<string, number>();
  for (const entry of inventory.entries) {
    if (
      !entry.path ||
      entry.path.startsWith("/") ||
      entry.path.includes("..") ||
      !Number.isSafeInteger(entry.maximum_occurrences) ||
      entry.maximum_occurrences <= 0 ||
      baseline.has(entry.path)
    ) {
      errors.push(`inventory_entry_invalid:${entry.path || "<empty>"}`);
      continue;
    }
    baseline.set(entry.path, entry.maximum_occurrences);
  }

  const excludedPaths = new Set(inventory.excluded_implementation_paths);
  if (
    inventory.excluded_historical_prefixes.some((prefix) => prefix !== "docs/archive/") ||
    inventory.excluded_implementation_paths.some((path) => !ALLOWED_EXCLUSIONS.has(path))
  )
    errors.push("inventory_exclusion_invalid");
  const isExcluded = (path: string) =>
    excludedPaths.has(path) ||
    inventory.excluded_historical_prefixes.some((prefix) => path.startsWith(prefix));
  const observed = new Map<string, number>();
  for (const file of files) {
    if (isExcluded(file.path) || isNonExecutableSuccessfulVitestEvidence(file)) continue;
    const count = countMarkers(file.content);
    if (count > 0) observed.set(file.path, count);
  }

  const newPaths = [...observed.keys()].filter((path) => !baseline.has(path)).sort();
  const growth = [...observed.entries()]
    .filter(([path, actual]) => baseline.has(path) && actual > (baseline.get(path) ?? 0))
    .map(([path, actual]) => ({ path, actual, maximum: baseline.get(path) as number }))
    .sort((a, b) => a.path.localeCompare(b.path));
  const staleEntries = [...baseline.keys()].filter((path) => !observed.has(path)).sort();

  return {
    ok: errors.length === 0 && newPaths.length === 0 && growth.length === 0,
    checkedFiles: files.length,
    currentOccurrences: [...observed.values()].reduce((a, b) => a + b, 0),
    baselineOccurrences: [...baseline.values()].reduce((a, b) => a + b, 0),
    newPaths,
    growth,
    staleEntries,
    errors,
  };
}

export function loadLegacyOrchestrationSurface(repoRoot: string): {
  inventory: LegacyOrchestrationInventory;
  files: LegacyOrchestrationFile[];
} {
  const inventoryPath = join(repoRoot, LEGACY_ORCHESTRATION_INVENTORY_PATH);
  if (!existsSync(inventoryPath)) throw new Error("legacy orchestration inventory missing");
  const inventory = JSON.parse(readFileSync(inventoryPath, "utf8")) as LegacyOrchestrationInventory;
  // candidateのsource_headをbase選択に使わない。公開mainとの共通祖先を一度だけ固定する。
  const git = (args: string[]) =>
    execFileSync("git", args, {
      cwd: repoRoot,
      encoding: "utf8",
      maxBuffer: 32 * 1024 * 1024,
      stdio: ["ignore", "pipe", "pipe"],
    });
  const base = git(["merge-base", "origin/main", "HEAD"]).trim();
  if (!/^[0-9a-f]{40}$/.test(base)) throw new Error("published base invalid");
  if (!/^[0-9a-f]{40}$/.test(inventory.source_head)) throw new Error("inventory source invalid");
  git(["merge-base", "--is-ancestor", inventory.source_head, base]);
  const basePaths = git(["ls-tree", "-r", "--name-only", "-z", base]).split("\0").filter(Boolean);
  let published: LegacyOrchestrationInventory;
  if (basePaths.includes(LEGACY_ORCHESTRATION_INVENTORY_PATH)) {
    published = JSON.parse(git(["show", `${base}:${LEGACY_ORCHESTRATION_INVENTORY_PATH}`]));
  } else {
    // 初回導入も候補inventoryの自己登録ではなく、公開baseの実ファイルから上限を採取する。
    const matches = spawnSync(
      "git",
      [
        "grep",
        "-l",
        "-z",
        "-F",
        ...LEGACY_ORCHESTRATION_MARKERS.flatMap((marker) => ["-e", marker]),
        base,
        "--",
      ],
      { cwd: repoRoot, encoding: "utf8", maxBuffer: 32 * 1024 * 1024 },
    );
    if (matches.error || (matches.status !== 0 && matches.status !== 1))
      throw new Error("published marker scan failed");
    const markerPaths = matches.stdout
      .split("\0")
      .filter(Boolean)
      .map((path) => {
        if (!path.startsWith(`${base}:`)) throw new Error("published marker path invalid");
        return path.slice(base.length + 1);
      });
    published = {
      schema_version: "helix-legacy-orchestration-surface-inventory.v1",
      authority_role: "compatibility_only_retirement_ratchet",
      source_head: inventory.source_head,
      excluded_historical_prefixes: ["docs/archive/"],
      excluded_implementation_paths: [...ALLOWED_EXCLUSIONS],
      entries: markerPaths
        .filter((path) => !path.startsWith("docs/archive/") && !ALLOWED_EXCLUSIONS.has(path))
        .map((path) => ({
          path,
          maximum_occurrences: countMarkers(git(["show", `${base}:${path}`])),
        }))
        .filter((entry) => entry.maximum_occurrences > 0),
    };
  }
  const baselineErrors = compareLegacyOrchestrationInventory(inventory, published);
  if (baselineErrors.length > 0) throw new Error(baselineErrors.join(","));
  const tracked = execFileSync("git", ["ls-files", "-z"], {
    cwd: repoRoot,
    encoding: "utf8",
    maxBuffer: 16 * 1024 * 1024,
  })
    .split("\0")
    .filter(Boolean)
    .sort();
  const files = tracked
    .filter((path) => existsSync(join(repoRoot, path)))
    .map((path) => ({ path, content: readFileSync(join(repoRoot, path), "utf8") }));
  return { inventory, files };
}

export function legacyOrchestrationSurfaceMessages(
  result: LegacyOrchestrationSurfaceResult,
): string[] {
  if (result.ok) {
    return [
      `legacy-orchestration-surface - OK (current=${result.currentOccurrences}/${result.baselineOccurrences}, stale=${result.staleEntries.length})`,
    ];
  }
  return [
    `legacy-orchestration-surface - violation: errors=${result.errors.join(",") || "-"} new_paths=${result.newPaths.join(",") || "-"} growth=${result.growth.map((item) => `${item.path}:${item.actual}>${item.maximum}`).join(",") || "-"}`,
  ];
}

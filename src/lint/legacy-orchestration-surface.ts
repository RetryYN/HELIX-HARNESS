import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export const LEGACY_ORCHESTRATION_INVENTORY_PATH =
  "config/legacy-orchestration-surface-inventory.json";

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
  const isExcluded = (path: string) =>
    excludedPaths.has(path) ||
    inventory.excluded_historical_prefixes.some((prefix) => path.startsWith(prefix));
  const observed = new Map<string, number>();
  for (const file of files) {
    if (isExcluded(file.path)) continue;
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

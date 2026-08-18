import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  MODE_ALLOWED_KINDS,
  normalizeRouteMode,
  workflowModeForPlan,
} from "../schema/mode-catalog";
import { ROUTE_SIGNAL_MAP } from "../schema/route-map";

export const PLAN_LEGACY_WORKFLOW_IDENTITY_INVENTORY_PATH =
  "config/plan-legacy-workflow-identity-inventory.json";
export const PLAN_LEGACY_WORKFLOW_IDENTITY_FROZEN_COUNT = 951;
export const PLAN_LEGACY_WORKFLOW_IDENTITY_FROZEN_DIGEST =
  "sha256:32a88506cffbeade62cab27c3bbb9af2df7de75cad6092048d3857cdef661d0b";

export interface PlanLegacyWorkflowIdentityEntry {
  plan_id: string;
  path: string;
}

export interface PlanLegacyWorkflowIdentityInventory {
  schema_version: "helix-plan-legacy-workflow-identity-inventory.v1";
  authority_scope: "compatibility_input_only";
  maximum_entry_count: number;
  entries_digest: string;
  entries: PlanLegacyWorkflowIdentityEntry[];
  valid: boolean;
}

export function legacyWorkflowIdentityEntriesDigest(
  entries: PlanLegacyWorkflowIdentityEntry[],
): string {
  const canonical = [...entries]
    .sort((a, b) => a.plan_id.localeCompare(b.plan_id) || a.path.localeCompare(b.path))
    .map((entry) => `${entry.plan_id}\0${entry.path}`)
    .join("\n");
  return `sha256:${createHash("sha256").update(canonical).digest("hex")}`;
}

export function buildPlanLegacyWorkflowIdentityInventory(
  entries: PlanLegacyWorkflowIdentityEntry[],
  maximumEntryCount: number = entries.length,
): PlanLegacyWorkflowIdentityInventory {
  if (entries.length > maximumEntryCount) {
    throw new Error(
      `legacy workflow identity inventory growth blocked (${entries.length}>${maximumEntryCount})`,
    );
  }
  const sorted = [...entries].sort(
    (a, b) => a.plan_id.localeCompare(b.plan_id) || a.path.localeCompare(b.path),
  );
  return {
    schema_version: "helix-plan-legacy-workflow-identity-inventory.v1",
    authority_scope: "compatibility_input_only",
    maximum_entry_count: maximumEntryCount,
    entries_digest: legacyWorkflowIdentityEntriesDigest(sorted),
    entries: sorted,
    valid: true,
  };
}

export function loadPlanLegacyWorkflowIdentityInventory(
  repoRoot: string = process.cwd(),
): PlanLegacyWorkflowIdentityInventory {
  const path = join(repoRoot, PLAN_LEGACY_WORKFLOW_IDENTITY_INVENTORY_PATH);
  if (!existsSync(path)) {
    return { ...buildPlanLegacyWorkflowIdentityInventory([], 0), valid: false };
  }
  try {
    const parsed = JSON.parse(readFileSync(path, "utf8")) as Partial<
      Omit<PlanLegacyWorkflowIdentityInventory, "valid">
    >;
    const rawEntries = parsed.entries;
    const entries = Array.isArray(rawEntries)
      ? (rawEntries as PlanLegacyWorkflowIdentityEntry[])
      : [];
    const entriesStrict =
      Array.isArray(rawEntries) &&
      rawEntries.every(
        (entry) =>
          typeof entry === "object" &&
          entry !== null &&
          !Array.isArray(entry) &&
          Object.keys(entry).sort().join(",") === "path,plan_id" &&
          typeof (entry as unknown as Record<string, unknown>).plan_id === "string" &&
          typeof (entry as unknown as Record<string, unknown>).path === "string",
      );
    const inventory = {
      schema_version: parsed.schema_version,
      authority_scope: parsed.authority_scope,
      maximum_entry_count: parsed.maximum_entry_count,
      entries_digest: parsed.entries_digest,
      entries,
    };
    const keys = entries.map((entry) => `${entry.plan_id}\0${entry.path}`);
    const sortedKeys = [...keys].sort();
    const valid =
      inventory.schema_version === "helix-plan-legacy-workflow-identity-inventory.v1" &&
      inventory.authority_scope === "compatibility_input_only" &&
      entriesStrict &&
      inventory.maximum_entry_count === PLAN_LEGACY_WORKFLOW_IDENTITY_FROZEN_COUNT &&
      entries.length === PLAN_LEGACY_WORKFLOW_IDENTITY_FROZEN_COUNT &&
      new Set(keys).size === keys.length &&
      keys.every((key, index) => key === sortedKeys[index]) &&
      inventory.entries_digest === PLAN_LEGACY_WORKFLOW_IDENTITY_FROZEN_DIGEST &&
      legacyWorkflowIdentityEntriesDigest(entries) === PLAN_LEGACY_WORKFLOW_IDENTITY_FROZEN_DIGEST;
    return { ...inventory, valid } as PlanLegacyWorkflowIdentityInventory;
  } catch {
    return { ...buildPlanLegacyWorkflowIdentityInventory([], 0), valid: false };
  }
}

export function legacyWorkflowModeForPlan(input: {
  planId: string;
  kind: string | null;
  routeMode: string | null;
}): string {
  return workflowModeForPlan(input);
}

export function legacyKindAllowed(mode: string, kind: string | null): boolean {
  if (!kind) return false;
  return MODE_ALLOWED_KINDS[normalizeRouteMode(mode)]?.has(kind) ?? false;
}

export function legacyRoutedModeForSignal(signal: string): string | null {
  const normalized = signal.trim().toLowerCase();
  return (
    ROUTE_SIGNAL_MAP.map((entry, index) => ({
      entry,
      index,
      matchLength: Math.max(
        0,
        ...entry.tokens.map((token) =>
          normalized.includes(token.toLowerCase()) ? token.length : 0,
        ),
      ),
    }))
      .filter((candidate) => candidate.matchLength > 0)
      .sort((a, b) => b.matchLength - a.matchLength || a.index - b.index)[0]?.entry.mode ?? null
  );
}

import { existsSync, readFileSync } from "node:fs";
import { join, posix } from "node:path";
import { dependenciesSchema, historicalPlanProvenanceListSchema } from "../schema/frontmatter";
import type { PlanLegacyWorkflowIdentityInventory } from "./plan-entry-routing-legacy-input";

export interface PlanCompatibilityDependencyDoc {
  file: string;
  raw: Record<string, unknown>;
}

export const PLAN_COMPATIBILITY_PARENT_BASELINE_PATH =
  "docs/governance/plan-compatibility-parent-baseline.json";

export interface PlanCompatibilityDependencyBaselineEntry {
  file: string;
  reason: string;
  detail: string;
}

export interface PlanCompatibilityDependencyBaseline {
  recorded: string | null;
  grandfathered: PlanCompatibilityDependencyBaselineEntry[];
}

interface LintResult {
  ok: boolean;
  messages: string[];
}

function entryKey(entry: PlanCompatibilityDependencyBaselineEntry): string {
  return `${entry.file}\0${entry.reason}\0${entry.detail}`;
}

export function loadPlanCompatibilityDependencyBaseline(
  repoRoot: string = process.cwd(),
): PlanCompatibilityDependencyBaseline {
  const path = join(repoRoot, PLAN_COMPATIBILITY_PARENT_BASELINE_PATH);
  if (!existsSync(path)) return { recorded: null, grandfathered: [] };
  try {
    const parsed = JSON.parse(
      readFileSync(path, "utf8"),
    ) as Partial<PlanCompatibilityDependencyBaseline>;
    const grandfathered = Array.isArray(parsed.grandfathered)
      ? parsed.grandfathered.filter(
          (entry): entry is PlanCompatibilityDependencyBaselineEntry =>
            typeof entry === "object" &&
            entry !== null &&
            typeof entry.file === "string" &&
            typeof entry.reason === "string" &&
            typeof entry.detail === "string",
        )
      : [];
    return {
      recorded: typeof parsed.recorded === "string" ? parsed.recorded : null,
      grandfathered,
    };
  } catch {
    return { recorded: null, grandfathered: [] };
  }
}

function collectPlanCompatibilityDependencyViolations(
  docs: PlanCompatibilityDependencyDoc[],
  inventory: PlanLegacyWorkflowIdentityInventory,
): PlanCompatibilityDependencyBaselineEntry[] {
  const byId = new Map(inventory.entries.map((entry) => [entry.plan_id, entry]));
  const violations: PlanCompatibilityDependencyBaselineEntry[] = [];
  const legacyTarget = (value: unknown): boolean => {
    if (typeof value !== "string") return false;
    const path = posix.normalize(value.trim().replaceAll("\\", "/").split("#")[0] ?? "");
    return byId.has(posix.basename(path).replace(/\.md$/u, ""));
  };
  for (const doc of docs) {
    const report = (reason: string, detail: string) => {
      violations.push({ file: doc.file, reason, detail });
    };
    if (doc.raw.historical_provenance !== undefined) {
      const history = historicalPlanProvenanceListSchema.safeParse(doc.raw.historical_provenance);
      if (!history.success) {
        report(
          "historical_provenance_invalid",
          history.error.issues.map((issue) => issue.path.join(".")).join(", "),
        );
      } else {
        for (const entry of history.data) {
          if (byId.get(entry.plan_id)?.path !== entry.path) {
            report(
              "historical_provenance_invalid",
              `inventory identity mismatch: ${entry.plan_id}`,
            );
          }
        }
      }
    }
    const deps = doc.raw.dependencies;
    if (deps === undefined) continue;
    const parsedDependencies = dependenciesSchema.strict().safeParse(deps);
    if (!parsedDependencies.success) {
      report(
        "compatibility_dependencies_invalid",
        "dependencies must use the current typed fields",
      );
      continue;
    }
    const dependencies = parsedDependencies.data;
    // 現行graph readerはdependenciesだけを読む。ここへ来歴を置いても型付き来歴にはならない。
    // archived文書のreaderは保持する。inventory所属・旧日付・confirmedは現行edgeの免除にならない。
    if (doc.raw.status === "archived") continue;
    if (legacyTarget(dependencies.parent)) {
      report("compatibility_parent_forbidden", String(dependencies.parent));
    }
    for (const field of ["requires", "references"] as const) {
      const refs = dependencies[field];
      if (!Array.isArray(refs)) continue;
      for (const ref of refs) {
        if (legacyTarget(ref))
          report("compatibility_reference_forbidden", `${field}: ${String(ref)}`);
      }
    }
  }
  return violations;
}

export function analyzePlanCompatibilityDependencies(
  docs: PlanCompatibilityDependencyDoc[],
  inventory: PlanLegacyWorkflowIdentityInventory,
  baseline: PlanCompatibilityDependencyBaseline = { recorded: null, grandfathered: [] },
): LintResult {
  if (!inventory.valid) {
    return { ok: false, messages: ["plan-compatibility-parent - compatibility_inventory_invalid"] };
  }
  const violations = collectPlanCompatibilityDependencyViolations(docs, inventory);
  const baselineKeys = new Set(baseline.grandfathered.map(entryKey));
  const activeBaseline = violations.filter((violation) => baselineKeys.has(entryKey(violation)));
  const newViolations = violations.filter((violation) => !baselineKeys.has(entryKey(violation)));
  if (newViolations.length > 0) {
    return {
      ok: false,
      messages: newViolations.map(
        ({ file, reason, detail }) => `plan-compatibility-parent - ${reason}: ${file}: ${detail}`,
      ),
    };
  }
  return {
    ok: true,
    messages: [
      `plan-compatibility-parent - OK (${docs.length} PLAN, grandfathered=${activeBaseline.length}/${baseline.grandfathered.length})`,
    ],
  };
}

/** 導入時点の違反edgeをexact tupleで固定する。以後の追加・内容変更はbaseline外として拒否する。 */
export function buildPlanCompatibilityDependencyBaseline(
  docs: PlanCompatibilityDependencyDoc[],
  inventory: PlanLegacyWorkflowIdentityInventory,
  recorded: string,
): PlanCompatibilityDependencyBaseline {
  const grandfathered = collectPlanCompatibilityDependencyViolations(docs, inventory).sort((a, b) =>
    entryKey(a).localeCompare(entryKey(b)),
  );
  return { recorded, grandfathered };
}

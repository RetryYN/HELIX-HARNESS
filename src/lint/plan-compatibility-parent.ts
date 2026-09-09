import { posix } from "node:path";
import type { LintResult } from "../plan/lint-types";
import { dependenciesSchema, historicalPlanProvenanceListSchema } from "../schema/frontmatter";
import type { PlanLegacyWorkflowIdentityInventory } from "./plan-entry-routing-legacy-input";

export interface PlanCompatibilityDependencyDoc {
  file: string;
  raw: Record<string, unknown>;
}

export function analyzePlanCompatibilityDependencies(
  docs: PlanCompatibilityDependencyDoc[],
  inventory: PlanLegacyWorkflowIdentityInventory,
): LintResult {
  if (!inventory.valid) {
    return { ok: false, messages: ["plan-compatibility-parent - compatibility_inventory_invalid"] };
  }
  const byId = new Map(inventory.entries.map((entry) => [entry.plan_id, entry]));
  const messages: string[] = [];
  const legacyTarget = (value: unknown): boolean => {
    if (typeof value !== "string") return false;
    const path = posix.normalize(value.trim().replaceAll("\\", "/").split("#")[0] ?? "");
    return byId.has(posix.basename(path).replace(/\.md$/u, ""));
  };
  for (const doc of docs) {
    const report = (reason: string, detail: string) => {
      messages.push(`plan-compatibility-parent - ${reason}: ${doc.file}: ${detail}`);
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
  return {
    ok: messages.length === 0,
    messages: messages.length ? messages : [`plan-compatibility-parent - OK (${docs.length} PLAN)`],
  };
}

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

export type ActivePlanSelection =
  | { ok: true; planId: string }
  | { ok: false; reason: "empty" | "unknown"; candidates: string[] };

/** 修正適用watermark。以前の曖昧orphanはraw保持し、以後の新規orphanだけをhard failする。 */
export const ACTIVE_PLAN_VALIDATION_ENFORCED_AT = "2026-07-11T19:25:50.062Z";

/** PLAN-L7-427: canonical PLAN IDのexact matchだけをcurrent-planへ書ける。 */
export function selectActivePlanId(
  requested: string,
  canonicalPlanIds: readonly string[],
): ActivePlanSelection {
  const planId = requested.trim();
  if (!planId) return { ok: false, reason: "empty", candidates: [] };
  const unique = [...new Set(canonicalPlanIds)].sort();
  if (unique.includes(planId)) return { ok: true, planId };
  return {
    ok: false,
    reason: "unknown",
    candidates: unique.filter((candidate) => candidate.startsWith(planId)).slice(0, 10),
  };
}

/** docs/plans frontmatterをplan_registryのcanonical sourceとして読む。 */
export function loadCanonicalPlanIds(repoRoot: string): string[] {
  const plansDir = join(repoRoot, "docs", "plans");
  if (!existsSync(plansDir)) return [];
  const ids: string[] = [];
  for (const name of readdirSync(plansDir)
    .filter((entry) => entry.endsWith(".md"))
    .sort()) {
    const source = readFileSync(join(plansDir, name), "utf8");
    const match = source.match(/^plan_id:\s*["']?([^\s"']+)["']?\s*$/m);
    if (match?.[1]) ids.push(match[1]);
  }
  return [...new Set(ids)].sort();
}

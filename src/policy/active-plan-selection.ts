import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

export type ActivePlanSelection =
  | { ok: true; planId: string }
  | { ok: false; reason: "empty" | "unknown"; candidates: string[] };

/**
 * 修正適用 watermark。validation 最終 green 前に起動済みだった旧 writer の最終汚染行
 * (2026-07-11T20:08:47.791Z) までは raw 保持し、その直後以降の新規 orphan だけを hard fail する。
 */
export const ACTIVE_PLAN_VALIDATION_ENFORCED_AT = "2026-07-11T20:08:47.792Z";

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

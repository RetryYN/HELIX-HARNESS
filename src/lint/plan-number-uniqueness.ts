/**
 * PLAN 採番の一意性 gate（PLAN-L7-535 / Issue #521）。
 *
 * `docs/plans/` の PLAN は `PLAN-<layer>-<number>-<slug>.md` という名前を持つ。並行レーン
 * （Claude / Codex）が同時に「次の空き番号」を取ると、意味の異なる PLAN が同じ番号を名乗る。
 * 実際に 15 組（うち 2 組は 3 本）が発生し、prose 中の裸の `PLAN-L7-525` 参照がどちらを指すか
 * 判別できなくなっていた。
 *
 * 既存の衝突は confirmed PLAN の identity 変更（=改番と全参照追従）を伴うため本 gate では
 * 直さず baseline として凍結する。gate が塞ぐのは **新規の衝突** である。
 */
import { readdirSync } from "node:fs";
import { join } from "node:path";

/** `PLAN-<layer>-<number>` までを採番 key とする。slug は含めない。 */
const PLAN_FILE_PATTERN = /^(PLAN-[A-Z0-9]+-\d+)-[a-z0-9-]+\.md$/;

/**
 * 凍結 baseline。既に衝突している採番 key と、その時点の本数。
 *
 * この表は「許可」ではなく「既知の負債」である。改番は confirmed PLAN の identity と
 * 全参照を動かす migration であり、owner の判断を要する（Issue #521 で起票済み）。
 * 本数が baseline を超えたら新規衝突として fail-close する。
 */
export const PLAN_NUMBER_COLLISION_BASELINE: ReadonlyMap<string, number> = new Map([
  ["PLAN-L3-30", 2],
  ["PLAN-L4-53", 2],
  ["PLAN-L5-96", 2],
  ["PLAN-L6-77", 2],
  ["PLAN-L6-78", 2],
  ["PLAN-L7-168", 2],
  ["PLAN-L7-169", 2],
  ["PLAN-L7-170", 3],
  ["PLAN-L7-171", 2],
  ["PLAN-L7-433", 2],
  ["PLAN-L7-525", 2],
  ["PLAN-L7-527", 2],
  ["PLAN-RECOVERY-12", 2],
  ["PLAN-RECOVERY-39", 2],
  ["PLAN-RECOVERY-40", 3],
]);

export interface PlanNumberViolation {
  /** 衝突した採番 key（例 `PLAN-L7-525`）。 */
  key: string;
  /** 現在の本数。 */
  actual: number;
  /** baseline が許容する本数（未登録なら 1）。 */
  allowed: number;
  /** 該当 PLAN の filename（昇順）。 */
  files: string[];
}

export interface PlanNumberUniquenessResult {
  ok: boolean;
  checked: number;
  violations: PlanNumberViolation[];
  /** baseline に載っているが既に解消された key。改番が進んだら baseline を下げる。 */
  resolvedBaselineKeys: string[];
}

/** PLAN filename 集合から採番 key ごとの本数を数える。 */
export function groupPlanNumbers(files: readonly string[]): Map<string, string[]> {
  const groups = new Map<string, string[]>();
  for (const file of files) {
    const match = PLAN_FILE_PATTERN.exec(file);
    if (!match?.[1]) continue;
    const key = match[1];
    const bucket = groups.get(key);
    if (bucket) bucket.push(file);
    else groups.set(key, [file]);
  }
  for (const bucket of groups.values()) bucket.sort();
  return groups;
}

/** baseline を超える採番衝突を検出する。 */
export function analyzePlanNumberUniqueness(
  files: readonly string[],
  baseline: ReadonlyMap<string, number> = PLAN_NUMBER_COLLISION_BASELINE,
): PlanNumberUniquenessResult {
  const groups = groupPlanNumbers(files);
  const violations: PlanNumberViolation[] = [];
  for (const [key, bucket] of [...groups.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    const allowed = baseline.get(key) ?? 1;
    if (bucket.length > allowed)
      violations.push({ key, actual: bucket.length, allowed, files: bucket });
  }
  const resolvedBaselineKeys = [...baseline.keys()]
    .filter((key) => (groups.get(key)?.length ?? 0) < (baseline.get(key) ?? 1))
    .sort();
  return { ok: violations.length === 0, checked: groups.size, violations, resolvedBaselineKeys };
}

/** repository の `docs/plans` を読んで判定する。 */
export function checkPlanNumberUniqueness(repoRoot: string): PlanNumberUniquenessResult {
  const files = readdirSync(join(repoRoot, "docs", "plans")).filter((name) => name.endsWith(".md"));
  return analyzePlanNumberUniqueness(files);
}

/** CLI / doctor 向けメッセージ。 */
export function planNumberUniquenessMessages(result: PlanNumberUniquenessResult): string[] {
  if (result.ok) {
    const resolved = result.resolvedBaselineKeys.length;
    return [
      `plan-number-uniqueness - OK (採番 key ${result.checked} 件、新規衝突 0${
        resolved > 0 ? `、baseline 解消済み ${resolved} 件は baseline を下げること` : ""
      })`,
    ];
  }
  const sample = result.violations
    .slice(0, 3)
    .map((v) => `${v.key}: ${v.actual} 本 (許容 ${v.allowed}) ${v.files.join(", ")}`)
    .join("; ");
  return [
    `plan-number-uniqueness - violation ${result.violations.length} 件 (${sample}): 別 PLAN と採番が衝突している。空き番号を取り直すこと`,
  ];
}

import type { AdapterContextInjection } from "./adapter";

/**
 * memory recall 注入の呼出面 (L6-64 §4 段階導入)。
 * blast radius 制御のため、memory を載せる面を policy として機械固定する:
 * - `delegation` (helix codex / helix claude): PLAN-L7-406 で注入開始。
 * - `team_run` / `task_route`: PLAN-L7-414 で解禁 (設計 §4 の designed follow-up)。
 * 新しい呼出面を追加する場合は既定 = 非注入 (この集合に入れない) から始める。
 */
export type MemoryInjectionSurface = "delegation" | "team_run" | "task_route";

const MEMORY_ENABLED_SURFACES: ReadonlySet<MemoryInjectionSurface> = new Set([
  "delegation",
  "team_run",
  "task_route",
]);

export interface SkillInjectionPaths {
  required_paths: string[];
  optional_paths: string[];
}

/**
 * skill 注入と memory recall を呼出面 policy に従って合成する純関数。
 * skill 0 件でも memory recall があれば注入する (独立条件、U-MEMX-004)。
 * 両方空なら undefined (既存挙動: 注入 section を作らない)。
 */
export function composeDelegationInjection(input: {
  skills: SkillInjectionPaths;
  memoryLines: string[];
  surface: MemoryInjectionSurface;
}): AdapterContextInjection | undefined {
  const memoryLines = MEMORY_ENABLED_SURFACES.has(input.surface) ? input.memoryLines : [];
  const hasSkills =
    input.skills.required_paths.length > 0 || input.skills.optional_paths.length > 0;
  if (!hasSkills && memoryLines.length === 0) return undefined;
  return {
    required_paths: input.skills.required_paths,
    optional_paths: input.skills.optional_paths,
    ...(memoryLines.length > 0 ? { memory_lines: memoryLines } : {}),
  };
}

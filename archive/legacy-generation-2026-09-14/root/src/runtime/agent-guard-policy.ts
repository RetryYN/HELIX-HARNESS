/**
 * Allowed subagent_type values for Claude Code Agent calls.
 * be-api / be-logic / db-schema / devops-deploy は意図的に対象外 (Codex delegation-only)。
 * 追加する場合は .claude/CLAUDE.md の roster 設計と PLAN を更新してから登録する。
 */
export const SUBAGENT_ALLOWLIST: ReadonlySet<string> = new Set([
  "advisor-fable",
  "fe-lead",
  "fe-ui",
  "pmo-sonnet",
  "pmo-haiku",
  "pmo-project-explorer",
  "pmo-project-scout",
  "pmo-tech-docs",
  "pmo-tech-fork",
  "pmo-tech-news",
  "refactor-scout",
  "pdm-tech-innovation",
  "pdm-marketing-innovation",
  "pdm-innovation-manager",
  "code-reviewer",
  "security-audit",
  "qa-test",
]);

export const AGENT_GUARD_BYPASS_HINT =
  "Set HELIX_ALLOW_RAW_AGENT=1 only with an explicit reason recorded in the final report.";

/**
 * fable (apex-tier) を使える subagent の allowlist (PLAN-L7-306 の advisor-fable 境界の機械強制、
 * PLAN-L7-409)。fable は最上位セカンドオピニオン専用であり、frontmatter に fable を宣言しただけの
 * agent が worker 用途で fable を使うことを fail-close で禁じる。追加は .claude/CLAUDE.md の
 * Fable advisor 節と PLAN を更新してから行う。上流 UT-TDD PR#44 (fable apex-tier) の概念採取。
 */
export const FABLE_APEX_SUBAGENTS: ReadonlySet<string> = new Set(["advisor-fable"]);

export const BRIEF_MARKER_MIN_SUBSTANCE_CHARS = 20;

/**
 * 委譲ブリーフ 4 点セット (judgment-core §5、PLAN-L7-337)。
 * Agent prompt は各要素の marker (英語 / 日本語ラベルのどちらか) を含まなければならない。
 * 重複作業・範囲誤解の主因は指示の粒度不足であり、worker の賢さは brief の質で決まる。
 */
export const DELEGATION_BRIEF_MARKERS: ReadonlyArray<{
  key: string;
  labels: readonly string[];
}> = [
  { key: "objective", labels: ["【objective】", "【目的】"] },
  { key: "output format", labels: ["【output format】", "【出力形式】"] },
  { key: "tool guidance", labels: ["【tool guidance】", "【ツール方針】"] },
  { key: "task boundary", labels: ["【task boundary】", "【境界】"] },
];

export const DELEGATION_BRIEF_HINT =
  "Include all four delegation-brief markers in the Agent prompt: " +
  "【objective】(目的) / 【output format】(出力形式) / 【tool guidance】(ツール方針) / 【task boundary】(境界). " +
  "SSoT: docs/skills/judgment-core.md §5.";

export const AGENT_TOOL_NAME = "Agent";
export const AGENT_TOOL_NAMES: ReadonlySet<string> = new Set([AGENT_TOOL_NAME, "Task"]);

export const CODEX_SPAWN_AGENT_TOOL_NAME = "spawn_agent";
export const CODEX_BULK_SPAWN_AGENT_TOOL_NAME = "spawn_agents_on_csv";

export const CODEX_AGENT_TYPE_ALLOWLIST: ReadonlySet<string> = new Set([
  "default",
  "explorer",
  "worker",
]);

/** Allowed subagent_type values for Claude Code Agent calls. */
export const SUBAGENT_ALLOWLIST: ReadonlySet<string> = new Set([
  "advisor-fable",
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
  "Set UT_TDD_ALLOW_RAW_AGENT=1 only with an explicit reason recorded in the final report.";

export const AGENT_TOOL_NAME = "Agent";

export const CODEX_SPAWN_AGENT_TOOL_NAME = "spawn_agent";
export const CODEX_BULK_SPAWN_AGENT_TOOL_NAME = "spawn_agents_on_csv";

export const CODEX_AGENT_TYPE_ALLOWLIST: ReadonlySet<string> = new Set([
  "default",
  "explorer",
  "worker",
]);

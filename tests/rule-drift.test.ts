// @helix-repo-wide-guard
import { describe, expect, it } from "vitest";
import {
  analyzeRuleDrift,
  loadRuleAdapterDocs,
  type RuleAdapterDocs,
  ruleDriftMessages,
} from "../src/lint/rule-drift";

// PLAN-L7-470-operations-rule-convergence
// PLAN-L7-654-distribution-devos-instruction-authority — U-RDRIFT-005/U-RDRIFT-006

const markers = [
  "helix status",
  "helix doctor",
  "helix codex --role <role> --task",
  "helix claude --role <role> --task",
  "helix team run --definition .helix/teams/<team>.yaml",
  "standalone",
  "claude-only",
  "codex-only",
  "hybrid",
  "GitHub native auto-mergeは禁止",
  "AI-Bは編集・push・Ready化",
  "review receiptをPR comment",
  "current PR内で修正",
  "別episodeだけIssue化",
].join("\n");

const completeDocs = (): RuleAdapterDocs => ({
  agents: `${markers}\nCLAUDE.md\n.claude/CLAUDE.md\nRetryYN/HELIX-HARNESS-DevOS\n旧\`RetryYN/HELIX-HARNESS-OS\`はcompatibility input`,
  claudeProject: `${markers}\n.claude/CLAUDE.md\nAGENTS.md\nRetryYN/HELIX-HARNESS-DevOS\n旧\`RetryYN/HELIX-HARNESS-OS\`はcompatibility input`,
  claudeRuntime: `${markers}\n../CLAUDE.md\n../AGENTS.md`,
});
const legacyRuntimeName = ["ut", "tdd"].join("-");
const legacyRuntimeEnvPrefix = ["UT", "TDD"].join("_");

describe("rule-drift lint", () => {
  it("passes when Codex and Claude adapter docs share required command/mode markers", () => {
    const result = analyzeRuleDrift(completeDocs());
    expect(result.ok).toBe(true);
    expect(result.forbiddenMarkers).toEqual([]);
    expect(result.missingMarkers).toEqual([]);
  });

  it("reports missing adapter markers", () => {
    const docs = completeDocs();
    docs.agents = docs.agents.replace("helix doctor", "");
    const result = analyzeRuleDrift(docs);
    expect(result.ok).toBe(false);
    expect(result.forbiddenMarkers).toEqual([]);
    expect(result.missingMarkers).toEqual([{ file: "AGENTS.md", marker: "helix doctor" }]);
    expect(ruleDriftMessages(result)[0]).toContain("rule-drift");
  });

  it("U-RDRIFT-005: DevOS current authorityと旧identity compatibility境界を両project正本へ要求する", () => {
    const missingCurrent = completeDocs();
    missingCurrent.agents = missingCurrent.agents.replace("RetryYN/HELIX-HARNESS-DevOS", "");
    expect(analyzeRuleDrift(missingCurrent).missingMarkers).toContainEqual({
      file: "AGENTS.md",
      marker: "RetryYN/HELIX-HARNESS-DevOS",
    });

    const missingCompatibility = completeDocs();
    missingCompatibility.claudeProject = missingCompatibility.claudeProject.replace(
      "旧`RetryYN/HELIX-HARNESS-OS`はcompatibility input",
      "",
    );
    expect(analyzeRuleDrift(missingCompatibility).missingMarkers).toContainEqual({
      file: "CLAUDE.md",
      marker: "旧`RetryYN/HELIX-HARNESS-OS`はcompatibility input",
    });
  });

  it("U-RDRIFT-004: reports forbidden legacy runtime markers from adapter docs", () => {
    const docs = completeDocs();
    docs.agents += `\nRun ${legacyRuntimeName} codex`;
    docs.claudeProject += `\n${legacyRuntimeEnvPrefix}_CODEX_BIN`;
    docs.claudeRuntime += `\nRead .${legacyRuntimeName}/state`;

    const result = analyzeRuleDrift(docs);

    expect(result.ok).toBe(false);
    expect(result.missingMarkers).toEqual([]);
    expect(result.forbiddenMarkers).toEqual([
      { file: "AGENTS.md", marker: "legacy runtime command routing" },
      { file: "CLAUDE.md", marker: "legacy runtime env prefix" },
      { file: ".claude/CLAUDE.md", marker: "legacy runtime local state path" },
    ]);
    expect(ruleDriftMessages(result)[0]).toContain("forbidden adapter legacy marker");
  });

  it("guards the real repo adapter docs against rule marker drift", () => {
    const result = analyzeRuleDrift(loadRuleAdapterDocs(process.cwd()));
    expect(result.missingMarkers).toEqual([]);
    expect(result.forbiddenMarkers).toEqual([]);
    expect(result.ok).toBe(true);
  });

  it("U-RDRIFT-006: real repoの両project正本がDevOS authorityへ収束している", () => {
    const docs = loadRuleAdapterDocs(process.cwd());
    for (const text of [docs.agents, docs.claudeProject]) {
      expect(text).toContain("RetryYN/HELIX-HARNESS-DevOS");
      expect(text).toContain("旧`RetryYN/HELIX-HARNESS-OS`はcompatibility input");
      expect(text).not.toContain("正式配布先は `RetryYN/HELIX-HARNESS-OS`");
    }
  });

  it("guards the real Claude/Codex adapter docs against legacy runtime command routing", () => {
    const result = analyzeRuleDrift(loadRuleAdapterDocs(process.cwd()));
    expect(result.forbiddenMarkers).toEqual([]);
  });
});

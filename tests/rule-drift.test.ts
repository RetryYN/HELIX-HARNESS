import { describe, expect, it } from "vitest";
import {
  analyzeRuleDrift,
  loadRuleAdapterDocs,
  type RuleAdapterDocs,
  ruleDriftMessages,
} from "../src/lint/rule-drift";

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
].join("\n");

const completeDocs = (): RuleAdapterDocs => ({
  agents: `${markers}\nCLAUDE.md\n.claude/CLAUDE.md`,
  claudeProject: `${markers}\n.claude/CLAUDE.md\nAGENTS.md`,
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

  it("guards the real Claude/Codex adapter docs against legacy runtime command routing", () => {
    const result = analyzeRuleDrift(loadRuleAdapterDocs(process.cwd()));
    expect(result.forbiddenMarkers).toEqual([]);
  });
});

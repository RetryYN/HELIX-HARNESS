import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  analyzeJudgmentCoreCoverage,
  loadJudgmentCoreCoverageInput,
} from "../src/lint/judgment-core-coverage";

const repoRoot = process.cwd();
const agentRoot = join(repoRoot, ".claude", "agents");

function agentFiles(): Array<{ path: string; content: string }> {
  return readdirSync(agentRoot)
    .filter((name) => name.endsWith(".md"))
    .sort()
    .map((name) => ({
      path: `.claude/agents/${name}`,
      content: readFileSync(join(agentRoot, name), "utf8"),
    }));
}

function readSection(content: string, headingPattern: RegExp): string {
  const match = content.match(headingPattern);
  if (!match || match.index === undefined) return "";
  const start = match.index;
  const next = content.slice(start + match[0].length).search(/\n## /);
  return next === -1 ? content.slice(start) : content.slice(start, start + match[0].length + next);
}

function requiredReadSection(content: string): string {
  return readSection(content, /\n## (作業前に必ず Read すること|作業前必須 Read|Required Reads)/);
}

function hasHeading(file: string, heading: string): boolean {
  if (!existsSync(file)) return false;
  return readFileSync(file, "utf8").includes(`## ${heading}`);
}

describe("agent context efficiency", () => {
  it("U-CTX-001: agent 必読指示に docs/governance/README.md の全文 Read 指示が残らない", () => {
    const offenders = agentFiles()
      .filter(({ content }) => requiredReadSection(content).includes("docs/governance/README.md"))
      .map(({ path }) => path);

    expect(offenders).toEqual([]);
  });

  it("U-CTX-002: agent 必読指示は CLAUDE.md 全文 Read ではなく節限定にする", () => {
    const offenders = agentFiles().flatMap(({ path, content }) =>
      requiredReadSection(content)
        .split(/\r?\n/)
        .filter((line) => line.includes("CLAUDE.md") && !line.includes("§"))
        .map((line) => `${path}: ${line.trim()}`),
    );

    expect(offenders).toEqual([]);
    expect(hasHeading(join(repoRoot, "CLAUDE.md"), "実装規則")).toBe(true);
    expect(hasHeading(join(repoRoot, "CLAUDE.md"), "Git Rules（Git 規則）")).toBe(true);
    expect(hasHeading(join(repoRoot, ".claude", "CLAUDE.md"), "Guard 規則")).toBe(true);
  });

  it("U-CTX-003: code-reviewer は 5軸詳細を judgment-core SSoT へ委譲する", () => {
    const content = readFileSync(join(agentRoot, "code-reviewer.md"), "utf8");
    const ssot = readFileSync(join(repoRoot, "docs", "skills", "judgment-core.md"), "utf8");

    expect(content).toContain("docs/skills/judgment-core.md");
    expect(content).toContain("§4.1");
    expect(ssot).toContain("## §4.1 レビュー 5軸観点");
    expect(content).not.toMatch(
      /^### [1-5]\) (Correctness|Readability|Architecture|Security|Performance)$/m,
    );
  });

  it("U-CTX-004: judgment-core version と全 agent/command marker が一致する", () => {
    const input = loadJudgmentCoreCoverageInput(repoRoot);
    const result = analyzeJudgmentCoreCoverage(input);

    expect(input.ssotVersion).toBe(1);
    expect(result.violations).toEqual([]);
    expect(result.ok).toBe(true);
  });
});

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const CURRENT_REQUIREMENT_DOCS = [
  "AGENTS.md",
  "CLAUDE.md",
  ".claude/CLAUDE.md",
  "docs/design/helix/L0-charter/helix-charter_v0.1.md",
  "docs/governance/helix-harness-concept_v3.1.md",
  "docs/governance/helix-harness-requirements_v1.2.md",
  "docs/governance/coding-rules.md",
  "docs/design/harness/L1-requirements/business-requirements.md",
  "docs/design/harness/L1-requirements/functional-requirements.md",
  "docs/design/harness/L1-requirements/nfr.md",
  "docs/design/harness/L1-requirements/screen-requirements.md",
  "docs/design/harness/L1-requirements/technical-requirements.md",
  "docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md",
  "docs/design/helix/L1-requirements/pillar-requirements.md",
  "docs/design/helix/L3-requirements/document-agent-metadata.md",
  "docs/design/helix/L3-requirements/github-autonomous-operations-requirements.md",
  "docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md",
  "docs/design/helix/L3-requirements/legacy-helix-extension.md",
  "docs/design/helix/L3-requirements/pillar-functional-requirements.md",
  "docs/design/helix/L3-requirements/visualization-requirements.md",
  "docs/design/helix/L3-requirements/vmodel-docgen-fit.md",
] as const;

const FORBIDDEN_CURRENT_AUTHORITY =
  /TS\/Bun|TS-Bun|TypeScript\/Bun|Bun runtime|Bun\/TypeScript|TypeScript core \(Bun\)|bun:sqlite|\bbun (?:run|test|install|build)\b/i;

const ACTIVE_ROOTS = ["src", ".claude", ".codex", ".github", "scripts", "docs/templates"];
const RETIRED_RUNTIME_DETECTOR_ALLOWLIST = new Set([
  "src/lint/runtime-portability.ts",
  "src/lint/l12-hybrid-recognition.ts",
  "src/lint/design-language.ts",
  "src/lint/canonical-reuse-consumer-baseline.ts",
  "src/lint/review-evidence.ts",
  "src/schema/green-command.ts",
  "src/schema/frontmatter.ts",
  ".claude/CLAUDE.md",
  ".claude/settings.local.json",
]);

function filesUnder(path: string): string[] {
  if (!existsSync(path)) return [];
  if (!statSync(path).isDirectory()) return [path];
  return readdirSync(path).flatMap((name) => filesUnder(join(path, name)));
}

function currentBody(path: string): string {
  const text = readFileSync(path, "utf8");
  return text.split(/^## (?:変更履歴|Revision History)/m, 1)[0] ?? text;
}

describe("Python + TypeScript/Node requirement authority", () => {
  it("current requirements never make Bun an implementation or execution target", () => {
    const violations = CURRENT_REQUIREMENT_DOCS.flatMap((path) => {
      const body = currentBody(path);
      return body
        .split(/\r?\n/)
        .flatMap((line, index) =>
          FORBIDDEN_CURRENT_AUTHORITY.test(line) ? [`${path}:${index + 1}: ${line.trim()}`] : [],
        );
    });
    expect(violations, violations.join("\n")).toEqual([]);
  });

  it("canonical requirement explicitly fixes Node, Python, and zero active Bun dependency", () => {
    const body = currentBody("docs/governance/helix-harness-requirements_v1.2.md");
    expect(body).toContain("Python semantic core");
    expect(body).toContain("TypeScript/Node transactional boundary");
    expect(body).toContain("Bunは廃止・active dependency 0");
  });

  it("accepted runtime ADR never permits Bun reactivation", () => {
    const adr = readFileSync("docs/adr/ADR-009-node-python-linux-runtime.md", "utf8");
    expect(adr).not.toMatch(
      /Bun(?:経路|を).*?(?:active execution authority|一時再activation|rollback point)/i,
    );
    expect(adr).toContain("current／target／rollback authorityではなく");
  });

  it("active runtime, hooks, workflows, templates, and package have zero Bun dependency", () => {
    const candidates = ["package.json", ...ACTIVE_ROOTS.flatMap(filesUnder)].filter(
      (path) => !RETIRED_RUNTIME_DETECTOR_ALLOWLIST.has(path),
    );
    const violations = candidates.flatMap((path) => {
      const text = readFileSync(path, "utf8");
      return text.split(/\r?\n/).flatMap((line, index) => {
        const explicitRetirementGuard =
          path === "src/state-db/closure-evidence-runner.ts" &&
          /RETIRED_BUN_EXECUTABLE|retired Bun executable/.test(line);
        return /\bbun(?:x)?\b|bun:/i.test(line) && !explicitRetirementGuard
          ? [`${path}:${index + 1}: ${line.trim()}`]
          : [];
      });
    });
    expect(violations, violations.join("\n")).toEqual([]);
    expect(existsSync("bun.lock")).toBe(false);
    expect(existsSync("bun.lockb")).toBe(false);
    expect(existsSync("package-lock.json")).toBe(true);
  });
});

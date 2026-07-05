import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  analyzeCodingRules,
  type CodingRulesDoc,
  codingRulesMessages,
  loadCodingRuleDocs,
  loadCodingRulePolicy,
  loadCodingWorkflowDocs,
} from "../src/lint/coding-rules";

describe("U-CODE coding-rules lint", () => {
  it("detects source naming, explicit any, suppression comments, and >3 source params", () => {
    const suppression = ["// @ts", "-ignore"].join("");
    const docs: CodingRulesDoc[] = [
      {
        path: "src/badName.ts",
        scope: "source",
        text: `
${suppression}
export function tooMany(a: string, b: string, c: string, d: string): unknown {
  const value: any = d;
  return value;
}
`,
      },
    ];
    const result = analyzeCodingRules(docs);
    expect(result.ok).toBe(false);
    expect(result.violations.map((v) => v.rule).sort()).toEqual([
      "file-name-kebab",
      "max-source-params",
      "no-explicit-any",
      "no-suppression-comment",
    ]);
  });

  it("allows >3 params in test helpers while keeping strict typing rules active", () => {
    const docs: CodingRulesDoc[] = [
      {
        path: "tests/runtime-hook-entrypoints.test.ts",
        scope: "test",
        text: "function runCli(cwd: string, args: string[], input: unknown, env: Record<string, string>): void {}",
      },
    ];
    expect(analyzeCodingRules(docs).ok).toBe(true);
  });

  it("formats doctor messages with path and rule samples", () => {
    const result = analyzeCodingRules([
      { path: "src/bad-name.ts", scope: "source", text: "const x: any = 1;" },
    ]);
    expect(codingRulesMessages(result)[0]).toContain("src/bad-name.ts");
    expect(codingRulesMessages(result)[0]).toContain("no-explicit-any");
  });

  it("detects coding-rule SSoT policy drift", () => {
    const result = analyzeCodingRules([], {
      path: "docs/governance/coding-rules.md",
      ruleIds: ["no-explicit-any", "unknown-rule"],
    });
    expect(result.ok).toBe(false);
    expect(result.violations.map((v) => v.rule).sort()).toEqual([
      "coding-policy-missing-rule",
      "coding-policy-missing-rule",
      "coding-policy-missing-rule",
      "coding-policy-missing-rule",
      "coding-policy-missing-rule",
      "coding-policy-missing-rule",
      "coding-policy-missing-rule",
      "coding-policy-unknown-rule",
    ]);
  });

  it("detects missing coding-rule workflow placement", () => {
    const result = analyzeCodingRules(
      [],
      {
        path: "docs/governance/coding-rules.md",
        ruleIds: [
          "no-explicit-any",
          "no-suppression-comment",
          "file-name-kebab",
          "max-source-params",
          "structured-error-handling",
          "module-boundary",
          "no-circular-dependency",
          "machine-surface-language",
        ],
      },
      [
        {
          path: "docs/governance/coding-rules.md",
          exists: true,
          text: "Workflow Placement\nForward L6\nAdd-feature\n",
        },
      ],
    );
    expect(result.ok).toBe(false);
    expect(result.violations.map((v) => v.rule)).toContain("coding-workflow-missing-doc");
  });

  it("detects empty and rethrow-only catch blocks in source", () => {
    const result = analyzeCodingRules([
      {
        path: "src/runtime/bad-error.ts",
        scope: "source",
        text: `
export function emptyCatch(): void {
  try {
    JSON.parse("bad");
  } catch {
  }
}

export function rethrowOnly(): void {
  try {
    JSON.parse("bad");
  } catch (error) {
    throw error;
  }
}
`,
      },
    ]);
    expect(result.ok).toBe(false);
    expect(result.violations.filter((v) => v.rule === "structured-error-handling")).toHaveLength(2);
  });

  it("detects source module boundary drift", () => {
    const result = analyzeCodingRules([
      {
        path: "src/lint/bad-boundary.ts",
        scope: "source",
        text: 'import { detectMode } from "../runtime/detect";\nexport const x = detectMode;',
      },
    ]);
    expect(result.ok).toBe(false);
    expect(result.violations.map((v) => v.rule)).toContain("module-boundary");
  });

  it("U-CODE-011: applies the canonical source-boundary matrix beyond runtime imports", () => {
    const result = analyzeCodingRules([
      {
        path: "src/lint/bad-gate-boundary.ts",
        scope: "source",
        text: 'import { runGate } from "../gate/run";\nexport const x = runGate;',
      },
    ]);

    expect(result.ok).toBe(false);
    expect(result.violations.map((v) => v.rule)).toContain("module-boundary");
  });

  it("U-CODE-010: detects machine-facing status messages without ASCII decision tokens", () => {
    const result = analyzeCodingRules([
      {
        path: "src/lint/bad-language.ts",
        scope: "source",
        text: 'export function badMessages(): string[] { return ["bad-rule — 警告: 日本語だけの判定語"]; }',
      },
      {
        path: "src/lint/good-language.ts",
        scope: "source",
        text: 'export function goodMessages(): string[] { return ["good-rule - warning: 日本語の説明を続けてもよい"]; }',
      },
    ]);

    expect(result.violations.map((v) => v.rule)).toEqual(["machine-surface-language"]);
    expect(result.violations[0].path).toBe("src/lint/bad-language.ts");
  });

  it("U-CODE-012: detects circular source imports with a DFS import graph", () => {
    const result = analyzeCodingRules([
      {
        path: "src/example/a.ts",
        scope: "source",
        text: 'import { b } from "./b";\nexport const a = b;',
      },
      {
        path: "src/example/b.ts",
        scope: "source",
        text: 'import { a } from "./a";\nexport const b = a;',
      },
    ]);

    expect(result.ok).toBe(false);
    expect(result.violations.map((v) => v.rule)).toContain("no-circular-dependency");
    expect(result.violations.find((v) => v.rule === "no-circular-dependency")?.message).toContain(
      "src/example/a.ts -> src/example/b.ts -> src/example/a.ts",
    );
  });

  it("U-CODE-013: explicitly enables Biome cognitive complexity as an error with a documented threshold", () => {
    const biomeConfig = JSON.parse(readFileSync("biome.json", "utf8")) as {
      linter?: {
        rules?: {
          complexity?: {
            noExcessiveCognitiveComplexity?: {
              level?: string;
              options?: { maxAllowedComplexity?: number };
            };
          };
        };
      };
    };
    const rule = biomeConfig.linter?.rules?.complexity?.noExcessiveCognitiveComplexity;

    expect(rule?.level).toBe("error");
    expect(rule?.options?.maxAllowedComplexity).toBe(187);
    expect(readFileSync("docs/governance/coding-rules.md", "utf8")).toContain(
      "maxAllowedComplexity: 187",
    );
  });

  it("real repo guard has no coding-rule violations", () => {
    const result = analyzeCodingRules(
      loadCodingRuleDocs(process.cwd()),
      loadCodingRulePolicy(),
      loadCodingWorkflowDocs(),
    );
    expect(result.violations).toEqual([]);
  });
});

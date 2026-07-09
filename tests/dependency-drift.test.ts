import { describe, expect, it } from "vitest";
import {
  analyzeDependencyDrift,
  type DependencyDriftInput,
  dependencyDriftMessages,
  expandRegressionScope,
} from "../src/lint/dependency-drift";

const input: DependencyDriftInput = {
  sourceDocs: [
    {
      path: "src/schema/index.ts",
      text: "export const SCHEMA = true;",
    },
    {
      path: "src/lint/audit.ts",
      text: 'import { SCHEMA } from "../schema/index"; export const audit = SCHEMA;',
    },
    {
      path: "src/doctor/index.ts",
      text: 'import { audit } from "../lint/audit"; export const doctor = audit;',
    },
    {
      path: "src/runtime/bad.ts",
      text: 'import { audit } from "../lint/audit"; export const bad = audit;',
    },
  ],
  testDocs: [
    {
      path: "tests/audit.test.ts",
      text: 'import { audit } from "../src/lint/audit"; audit;',
    },
    {
      path: "tests/doctor.test.ts",
      text: 'import { doctor } from "../src/doctor/index"; doctor;',
    },
  ],
};

describe("dependency-drift and regression expansion (PLAN-REVERSE-42)", () => {
  it("U-DEPD-001: allowed dependency graph is green and emits stable module edges", () => {
    const result = analyzeDependencyDrift({
      sourceDocs: input.sourceDocs.filter((d) => d.path !== "src/runtime/bad.ts"),
      testDocs: input.testDocs,
    });

    expect(result.ok).toBe(true);
    expect(result.moduleEdges).toContainEqual({ from: "doctor", to: "lint" });
    expect(result.moduleEdges).toContainEqual({ from: "lint", to: "schema" });
    expect(dependencyDriftMessages(result)[0]).toContain("OK");
  });

  it("U-DEPD-002: disallowed module dependency is surfaced as drift", () => {
    const result = analyzeDependencyDrift(input);

    expect(result.ok).toBe(false);
    expect(result.findings).toContainEqual(
      expect.objectContaining({
        code: "disallowed-module-dependency",
        fromModule: "runtime",
        toModule: "lint",
        path: "src/runtime/bad.ts",
      }),
    );
  });

  it("U-DEPD-003: module cycles are surfaced deterministically", () => {
    const result = analyzeDependencyDrift({
      sourceDocs: [
        { path: "src/lint/a.ts", text: 'import "../doctor/b";' },
        { path: "src/doctor/b.ts", text: 'import "../lint/a";' },
      ],
      testDocs: [],
    });

    expect(result.ok).toBe(false);
    expect(result.findings).toContainEqual(
      expect.objectContaining({
        code: "module-cycle",
        cycle: ["doctor", "lint", "doctor"],
      }),
    );
  });

  it("U-DEPD-004: grandfathered module cycles stay visible without failing the gate", () => {
    const result = analyzeDependencyDrift({
      sourceDocs: [
        { path: "src/lint/a.ts", text: 'import "../state-db/b";' },
        { path: "src/state-db/b.ts", text: 'import "../lint/a";' },
      ],
      testDocs: [],
    });

    expect(result.ok).toBe(true);
    expect(result.findings).toContainEqual(
      expect.objectContaining({
        code: "module-cycle",
        severity: "warn",
        cycle: ["lint", "state-db", "lint"],
      }),
    );
    expect(dependencyDriftMessages(result)[0]).toContain("grandfathered cycles 1");
  });

  it("U-DEPD-005: type-only imports do not create runtime module cycles", () => {
    const result = analyzeDependencyDrift({
      sourceDocs: [
        { path: "src/vscode/tree.ts", text: 'import type { View } from "../state-db/view";' },
        {
          path: "src/state-db/view.ts",
          text: 'import { render } from "../vscode/tree"; export const view = render;',
        },
        {
          path: "src/vmodel/lint.ts",
          text: 'import { type LintResult } from "../plan/lint"; export const ok = true;',
        },
        {
          path: "src/plan/lint.ts",
          text: 'export type LintResult = { ok: boolean };',
        },
      ],
      testDocs: [],
    });

    expect(result.ok).toBe(true);
    expect(result.moduleEdges).toContainEqual({ from: "state-db", to: "vscode" });
    expect(result.moduleEdges).not.toContainEqual({ from: "vscode", to: "state-db" });
    expect(result.moduleEdges).not.toContainEqual({ from: "vmodel", to: "plan" });
  });

  it("U-REGEXP-001: changed source expands to direct tests and dependent module tests", () => {
    const drift = analyzeDependencyDrift(input);
    const scope = expandRegressionScope(drift, ["src/lint/audit.ts"]);

    expect(scope.ok).toBe(true);
    expect(scope.changedModules).toEqual(["lint"]);
    expect(scope.affectedModules).toEqual(["doctor", "lint"]);
    expect(scope.testPaths).toEqual(["tests/audit.test.ts", "tests/doctor.test.ts"]);
  });

  it("U-REGEXP-002: missing regression coverage is a finding, not a silent fallback", () => {
    const drift = analyzeDependencyDrift({
      sourceDocs: [{ path: "src/export/document-export.ts", text: "export const x = 1;" }],
      testDocs: [],
    });
    const scope = expandRegressionScope(drift, ["src/export/document-export.ts"]);

    expect(scope.ok).toBe(false);
    expect(scope.findings).toContainEqual(
      expect.objectContaining({
        code: "missing-regression-test",
        module: "export",
      }),
    );
  });

  it("U-REGEXP-003: CLI subprocess smoke tests count as cli regression coverage", () => {
    const drift = analyzeDependencyDrift({
      sourceDocs: [{ path: "src/cli.ts", text: "export const programName = 'helix';" }],
      testDocs: [
        {
          path: "tests/runtime-hook-entrypoints.test.ts",
          text: 'const cliPath = join(repoRoot, "src", "cli.ts"); spawnSync("bun", [cliPath, "doctor"]);',
        },
      ],
    });
    const scope = expandRegressionScope(drift, ["src/cli.ts"]);

    expect(scope.ok).toBe(true);
    expect(scope.testPaths).toEqual(["tests/runtime-hook-entrypoints.test.ts"]);
  });
});

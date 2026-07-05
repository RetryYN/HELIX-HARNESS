import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  analyzeChangeImpact,
  analyzeChangeSetIntegrity,
  changeImpactMessages,
  changeSetIntegrityMessages,
  loadChangedFiles,
  parseGitPorcelain,
} from "../src/lint/change-impact";
import { analyzeDependencyDrift } from "../src/lint/dependency-drift";

describe("change-impact lint", () => {
  it("src changes require both design and test/test-design updates", () => {
    const result = analyzeChangeImpact({
      changedFiles: ["src/lint/foo.ts", "docs/design/harness/L6-function-design/foo.md"],
    });
    expect(result.ok).toBe(false);
    expect(result.missingDesign).toBe(false);
    expect(result.missingTest).toBe(true);
  });

  it("passes when src changes have design and test coverage in the same change set", () => {
    const result = analyzeChangeImpact({
      changedFiles: [
        "src/lint/foo.ts",
        "docs/design/harness/L6-function-design/foo.md",
        "tests/foo.test.ts",
      ],
    });
    expect(result.ok).toBe(true);
    expect(changeImpactMessages(result)[0]).toContain("OK");
  });

  it("treats HELIX design and test-design docs as counterpart artifacts", () => {
    const result = analyzeChangeImpact({
      changedFiles: [
        "src/lint/foo.ts",
        "docs/design/helix/L6-function-design/foo.md",
        "docs/test-design/helix/L6-foo-unit-test-design.md",
      ],
    });

    expect(result.ok).toBe(true);
    expect(result.missingDesign).toBe(false);
    expect(result.missingTest).toBe(false);
  });

  it("ignores documentation-only changes", () => {
    const result = analyzeChangeImpact({
      changedFiles: ["docs/design/harness/L6-function-design/foo.md"],
    });
    expect(result.ok).toBe(true);
    expect(result.sourceFiles).toEqual([]);
  });

  it("parses git porcelain paths including renames and untracked files", () => {
    expect(
      parseGitPorcelain(" M src/a.ts\nR  src/old.ts -> src/new.ts\n?? tests/a.test.ts\n"),
    ).toEqual(["src/a.ts", "src/new.ts", "tests/a.test.ts"]);
  });

  it("loads untracked directory contents as file paths instead of collapsed directory paths", () => {
    const repo = mkdtempSync(join(tmpdir(), "helix-change-impact-"));
    try {
      execFileSync("git", ["init"], { cwd: repo, stdio: "ignore" });
      mkdirSync(join(repo, "src", "new"), { recursive: true });
      writeFileSync(join(repo, "src", "new", "feature.ts"), "export const value = 1;\n");

      expect(loadChangedFiles(repo)).toEqual(["src/new/feature.ts"]);
    } finally {
      rmSync(repo, { recursive: true, force: true });
    }
  });

  it("ignores transient harness DB journal files from git porcelain paths", () => {
    expect(
      parseGitPorcelain(
        "?? .helix/harness.db-journal\n?? .helix/harness.db-wal\n?? .helix/harness.db-shm\n M docs/handover/session-handover-2026-06-22.md\n",
      ),
    ).toEqual(["docs/handover/session-handover-2026-06-22.md"]);
  });

  it("warns when only one artifact category is touched", () => {
    const result = analyzeChangeSetIntegrity({
      changedFiles: ["docs/design/harness/L6-function-design/foo.md"],
    });

    expect(result.ok).toBe(true);
    expect(result.warnings).toContainEqual(
      expect.objectContaining({ code: "singleton-artifact-set", severity: "warn" }),
    );
    expect(changeSetIntegrityMessages(result).join("\n")).toContain("warn singleton-artifact-set");
  });

  it("warns when a change set has only a partial artifact set", () => {
    const result = analyzeChangeSetIntegrity({
      changedFiles: ["docs/design/harness/L6-function-design/foo.md", "tests/foo.test.ts"],
    });

    expect(result.ok).toBe(true);
    expect(result.warnings).toContainEqual(
      expect.objectContaining({
        code: "incomplete-artifact-set",
        message: "change set is missing source",
      }),
    );
  });

  it("includes HELIX design docs in change-set integrity categories", () => {
    const result = analyzeChangeSetIntegrity({
      changedFiles: [
        "src/lint/foo.ts",
        "docs/design/helix/L6-function-design/foo.md",
        "docs/test-design/helix/L6-foo-unit-test-design.md",
      ],
    });

    expect(result.categories).toEqual(["source", "design", "test"]);
    expect(result.warnings).toEqual([]);
  });

  it("blocks when dependent modules exist and mapped regression tests are untouched", () => {
    const dependencyDrift = analyzeDependencyDrift({
      sourceDocs: [
        { path: "src/lint/rule.ts", text: "export const rule = true;" },
        { path: "src/doctor/index.ts", text: 'import { rule } from "../lint/rule"; rule;' },
      ],
      testDocs: [
        { path: "tests/lint-rule.test.ts", text: 'import { rule } from "../src/lint/rule"; rule;' },
        {
          path: "tests/doctor.test.ts",
          text: 'import { doctor } from "../src/doctor/index"; doctor;',
        },
      ],
    });
    const result = analyzeChangeSetIntegrity({
      changedFiles: ["src/lint/rule.ts", "docs/plans/PLAN-L7-99-rule.md"],
      dependencyDrift,
    });

    expect(result.ok).toBe(false);
    expect(result.blockers).toContainEqual(
      expect.objectContaining({
        code: "dependent-regression-untouched",
        severity: "error",
        modules: ["doctor"],
      }),
    );
  });

  it("passes dependency block when a mapped regression test is part of the change set", () => {
    const dependencyDrift = analyzeDependencyDrift({
      sourceDocs: [
        { path: "src/lint/rule.ts", text: "export const rule = true;" },
        { path: "src/doctor/index.ts", text: 'import { rule } from "../lint/rule"; rule;' },
      ],
      testDocs: [
        { path: "tests/lint-rule.test.ts", text: 'import { rule } from "../src/lint/rule"; rule;' },
        {
          path: "tests/doctor.test.ts",
          text: 'import { doctor } from "../src/doctor/index"; doctor;',
        },
      ],
    });
    const result = analyzeChangeSetIntegrity({
      changedFiles: [
        "src/lint/rule.ts",
        "docs/plans/PLAN-L7-99-rule.md",
        "tests/lint-rule.test.ts",
      ],
      dependencyDrift,
    });

    expect(result.ok).toBe(true);
    expect(result.blockers).toEqual([]);
  });

  it("U-CHGIMPACT-005 blocks source changes without a changed L7 implementation PLAN", () => {
    const result = analyzeChangeSetIntegrity({
      changedFiles: [
        "src/lint/new-rule.ts",
        "docs/design/harness/L6-function-design/function-spec.md",
        "tests/change-impact.test.ts",
      ],
      planDocs: [],
    });

    expect(result.ok).toBe(false);
    expect(result.blockers).toContainEqual(
      expect.objectContaining({
        code: "source-plan-missing",
        severity: "error",
      }),
    );
  });

  it("U-CHGIMPACT-006 blocks incomplete L7 source PLAN contracts", () => {
    const planPath = "docs/plans/PLAN-L7-231-rule.md";
    const result = analyzeChangeSetIntegrity({
      changedFiles: ["src/lint/new-rule.ts", planPath, "tests/change-impact.test.ts"],
      planDocs: [
        {
          path: planPath,
          text: [
            "---",
            "plan_id: PLAN-L7-231-rule",
            "kind: impl",
            "layer: L7",
            "status: confirmed",
            "dependencies:",
            "  parent: null",
            "---",
          ].join("\n"),
        },
      ],
    });

    expect(result.ok).toBe(false);
    expect(result.blockers).toContainEqual(
      expect.objectContaining({
        code: "source-plan-contract-missing",
        severity: "error",
      }),
    );
    expect(result.blockers.map((finding) => finding.message).join("\n")).toContain(
      "parent L6 design",
    );
  });

  it("U-CHGIMPACT-007 accepts a complete L7 source PLAN contract with test evidence", () => {
    const planPath = "docs/plans/PLAN-L7-231-rule.md";
    const result = analyzeChangeSetIntegrity({
      changedFiles: ["src/lint/new-rule.ts", planPath, "tests/change-impact.test.ts"],
      planDocs: [
        {
          path: planPath,
          text: [
            "---",
            "plan_id: PLAN-L7-231-rule",
            "kind: troubleshoot",
            "layer: L7",
            "status: confirmed",
            "parent_design: docs/design/harness/L6-function-design/function-spec.md",
            "pair_artifact: docs/test-design/harness/L7-unit-test-design.md",
            "dependencies:",
            "  parent: docs/plans/PLAN-L7-60-change-set-integrity.md",
            "---",
          ].join("\n"),
        },
      ],
    });

    expect(result.ok).toBe(true);
    expect(result.blockers).toEqual([]);
  });
});

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parse as parseYaml } from "yaml";

const WORKFLOW_PATH = ".github/workflows/harness-check.yml";

type Step = {
  name?: string;
  uses?: string;
  run?: string;
  if?: string;
  with?: Record<string, unknown>;
  "timeout-minutes"?: number;
  "continue-on-error"?: boolean;
};

type HarnessJob = {
  steps?: Step[];
  "timeout-minutes"?: number;
  "continue-on-error"?: boolean;
};

function loadWorkflow(): { job: HarnessJob; steps: Step[]; raw: string } {
  const raw = readFileSync(WORKFLOW_PATH, "utf8");
  const parsed = parseYaml(raw) as {
    jobs?: { "harness-check"?: HarnessJob };
  };
  const job = parsed.jobs?.["harness-check"] ?? {};
  return { job, raw, steps: job.steps ?? [] };
}

function stepByName(steps: Step[], name: string): Step {
  const step = steps.find((candidate) => candidate.name === name);
  expect(step, `${name} step missing`).toBeTruthy();
  return step as Step;
}

describe("source harness-check workflow", () => {
  it("keeps the source workflow read-only and fetches enough history for PR gates", () => {
    const { steps, raw } = loadWorkflow();
    const checkout = steps.find((step) => step.uses?.startsWith("actions/checkout@"));

    expect(raw).toContain("permissions:");
    expect(raw).toContain("contents: read");
    expect(raw).not.toContain("pull_request_target:");
    expect(checkout?.with).toMatchObject({
      "fetch-depth": 0,
      "persist-credentials": false,
    });
  });

  it("implements the §6.3 branch-type subjob matrix inside the single required check", () => {
    const { steps, raw } = loadWorkflow();
    const matrix = stepByName(steps, "branch type matrix");

    expect(raw).toContain("Required Status Checks は `harness-check` 1 本だけ");
    expect(matrix.run).toContain("plan-lint vmodel-lint branch-kind-check");
    expect(matrix.run).toContain("poc-no-merge-guard hotfix-postmortem-required");
    expect(matrix.run).toContain("commitlint regression-test");
    expect(matrix.run).toContain('status="skipped"');
    expect(matrix.run).toContain('status="applicable"');
  });

  it("runs GitHub operation guards through the HELIX CLI instead of workflow-local rules", () => {
    const { steps } = loadWorkflow();
    const branchKind = stepByName(steps, "branch-kind-check");
    const commitlint = stepByName(steps, "commitlint");
    const pocGuard = stepByName(steps, "poc-no-merge-guard");
    const hotfixGuard = stepByName(steps, "hotfix-postmortem-required");

    expect(branchKind.run).toContain("bun src/cli.ts");
    expect(branchKind.run).toContain("guard branch-kind");
    expect(branchKind.run).toContain("--strict-unknown-prefix");
    expect(branchKind.run).toContain("git diff --name-only");
    expect(commitlint.run).toContain("bun src/cli.ts guard commitlint --range");
    expect(commitlint.run).not.toContain("grep -Eq");
    expect(pocGuard.if).toContain("startsWith(github.head_ref, 'poc/')");
    expect(pocGuard.run).toContain("bun src/cli.ts guard pr-context");
    expect(hotfixGuard.if).toContain("startsWith(github.head_ref, 'hotfix/')");
    expect(hotfixGuard.run).toContain("bun src/cli.ts guard pr-context");
  });

  it("U-CIPROJ-001: refreshes the deterministic DB projection after regression tests and before doctor", () => {
    const { steps } = loadWorkflow();
    const testIndex = steps.findIndex((step) => step.name === "test — 全回帰 (vitest run)");
    const refreshIndex = steps.findIndex(
      (step) => step.name === "db rebuild (post-test projection refresh)",
    );
    const doctorIndex = steps.findIndex((step) => step.name === "doctor (governance hard gates)");

    expect(testIndex).toBeGreaterThanOrEqual(0);
    expect(refreshIndex).toBeGreaterThan(testIndex);
    expect(doctorIndex).toBeGreaterThan(refreshIndex);
    expect(steps[refreshIndex]?.run).toBe("bun src/cli.ts db rebuild --json");
  });

  it("U-CITIME-001/002/003: bounds the required job and full regression step without fail-open", () => {
    const { job, steps } = loadWorkflow();
    const regression = stepByName(steps, "test — 全回帰 (vitest run)");

    expect(job["timeout-minutes"]).toBe(20);
    expect(regression["timeout-minutes"]).toBe(15);
    expect(regression["timeout-minutes"]).toBeLessThan(job["timeout-minutes"] as number);
    expect(job["continue-on-error"]).not.toBe(true);
    expect(regression["continue-on-error"]).not.toBe(true);
    expect(regression.run).toBe("bun run test");

    const regressionIndex = steps.indexOf(regression);
    expect(stepByName(steps, "lint (biome)")).toBe(steps[regressionIndex + 1]);
    expect(steps.indexOf(stepByName(steps, "doctor (governance hard gates)"))).toBeGreaterThan(
      regressionIndex,
    );
  });
});

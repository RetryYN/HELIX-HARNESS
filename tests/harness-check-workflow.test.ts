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
};

function loadWorkflow(): { steps: Step[]; raw: string } {
  const raw = readFileSync(WORKFLOW_PATH, "utf8");
  const parsed = parseYaml(raw) as {
    jobs?: { "harness-check"?: { steps?: Step[] } };
  };
  return { raw, steps: parsed.jobs?.["harness-check"]?.steps ?? [] };
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

  it("fails poc direct-main PRs, hotfix PRs without postmortem evidence, and non-conventional commits", () => {
    const { steps } = loadWorkflow();
    const commitlint = stepByName(steps, "commitlint");
    const pocGuard = stepByName(steps, "poc-no-merge-guard");
    const hotfixGuard = stepByName(steps, "hotfix-postmortem-required");

    expect(commitlint.run).toContain("git log --format=%s");
    expect(commitlint.run).toContain("commitlint violation");
    expect(commitlint.run).toContain(
      "feat|fix|docs|style|refactor|test|chore|perf|ci|build|revert",
    );
    expect(pocGuard.if).toContain("startsWith(github.head_ref, 'poc/')");
    expect(pocGuard.run).toContain("exit 1");
    expect(hotfixGuard.if).toContain("startsWith(github.head_ref, 'hotfix/')");
    expect(hotfixGuard.run).toContain("## Postmortem");
    expect(hotfixGuard.run).toContain("PLAN-");
  });
});

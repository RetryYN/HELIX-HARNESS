// PLAN-L7-426-development-ci-bounded-time / PLAN-L7-462-issue-closure-contract
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
  if?: string;
  needs?: string;
  "runs-on"?: string;
};

function boundedTimeViolations(raw: string): string[] {
  let parsed: { jobs?: { "harness-check"?: HarnessJob } };
  try {
    parsed = parseYaml(raw) as typeof parsed;
  } catch {
    return ["workflow_yaml_invalid"];
  }
  const job = parsed.jobs?.["harness-check"];
  if (!job || !Array.isArray(job.steps)) return ["harness_job_missing"];
  const steps = job.steps;
  const findings: string[] = [];
  if (!Number.isInteger(job["timeout-minutes"]) || job["timeout-minutes"] !== 35)
    findings.push("job_timeout_invalid");
  if (job["continue-on-error"] !== undefined) findings.push("job_fail_open_field");
  const regressions = steps.filter(
    (step) => step.name === "test — 全回帰 (vitest run)" && step.run === "npm test",
  );
  if (regressions.length !== 1) return [...findings, "regression_step_not_unique"];
  const regression = regressions[0] as Step;
  if (!Number.isInteger(regression["timeout-minutes"]) || regression["timeout-minutes"] !== 25)
    findings.push("regression_timeout_invalid");
  if (
    typeof regression["timeout-minutes"] === "number" &&
    typeof job["timeout-minutes"] === "number" &&
    regression["timeout-minutes"] >= job["timeout-minutes"]
  )
    findings.push("timeout_budget_inverted");
  if (regression["continue-on-error"] !== undefined || regression.if !== undefined)
    findings.push("regression_fail_open_field");
  const indexes = [
    "lint (biome)",
    "db rebuild (post-test projection refresh)",
    "doctor (governance hard gates)",
  ].map((name) => steps.findIndex((step) => step.name === name));
  const [lintIndex = -1, refreshIndex = -1, doctorIndex = -1] = indexes;
  if (
    !(
      steps.indexOf(regression) < lintIndex &&
      lintIndex < refreshIndex &&
      refreshIndex < doctorIndex
    )
  )
    findings.push("post_test_gate_order_invalid");
  return findings;
}

function loadWorkflow(): {
  job: HarnessJob;
  windowsJob: HarnessJob;
  steps: Step[];
  raw: string;
} {
  const raw = readFileSync(WORKFLOW_PATH, "utf8");
  const parsed = parseYaml(raw) as {
    jobs?: { "harness-check"?: HarnessJob; "windows-durability-smoke"?: HarnessJob };
  };
  const job = parsed.jobs?.["harness-check"] ?? {};
  return {
    job,
    windowsJob: parsed.jobs?.["windows-durability-smoke"] ?? {},
    raw,
    steps: job.steps ?? [],
  };
}

function stepByName(steps: Step[], name: string): Step {
  const step = steps.find((candidate) => candidate.name === name);
  expect(step, `${name} step missing`).toBeTruthy();
  return step as Step;
}

describe("source harness-check workflow", () => {
  it("U-DUR-007: propagates the actual Windows durability result into the single required check", () => {
    const { job, windowsJob, steps } = loadWorkflow();
    const aggregate = stepByName(steps, "require Windows durability smoke");
    const smoke = stepByName(windowsJob.steps ?? [], "Windows durability smoke");

    expect(windowsJob["runs-on"]).toBe("windows-latest");
    expect(windowsJob["timeout-minutes"]).toBe(8);
    expect(windowsJob["continue-on-error"]).not.toBe(true);
    expect(smoke.run).toBe(
      "npm run test:fast -- tests/loop-store-durability.test.ts tests/loop-store-durability-node.test.ts",
    );
    expect(smoke["continue-on-error"]).not.toBe(true);
    expect(job.needs).toBe("windows-durability-smoke");
    expect(job.if).toBe(`\${{ always() }}`);
    expect(aggregate.if).toBe(`\${{ needs.windows-durability-smoke.result != 'success' }}`);
    expect(aggregate.run).toBe("exit 1");
  });

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

  it("runs the L1-L12 authority drift gate before typecheck and full regression", () => {
    const { steps } = loadWorkflow();
    const authority = stepByName(steps, "L1-L12 canonical authority drift gate");
    const authorityIndex = steps.indexOf(authority);
    const typecheckIndex = steps.findIndex((step) => step.name === "typecheck (tsc --noEmit)");
    const regressionIndex = steps.findIndex((step) => step.name === "test — 全回帰 (vitest run)");

    expect(authority.run).toBe(
      "npx --no-install vitest run --project fast tests/l12-canonical-authority.test.ts tests/l12-hybrid-recognition.test.ts tests/l3-progression-authority.test.ts tests/canonical-reuse-authority.test.ts tests/runtime-authority-requirements.test.ts tests/frontmatter.test.ts tests/schema.test.ts",
    );
    expect(authorityIndex).toBeGreaterThan(-1);
    expect(authorityIndex).toBeLessThan(typecheckIndex);
    expect(authorityIndex).toBeLessThan(regressionIndex);
    expect(authority["continue-on-error"]).toBeUndefined();
  });

  it("implements the §6.3 branch-type subjob matrix inside the single required check", () => {
    const { steps, raw } = loadWorkflow();
    const matrix = stepByName(steps, "branch type matrix");

    expect(raw).toContain("Required Status Checks は `harness-check` 1 本だけ");
    expect(matrix.run).toContain("plan-lint vmodel-lint branch-kind-check");
    expect(matrix.run).toContain(
      "poc-no-merge-guard hotfix-postmortem-required issue-closure-contract",
    );
    expect(matrix.run).toContain("commitlint regression-test");
    expect(matrix.run).toContain('status="skipped"');
    expect(matrix.run).toContain('status="applicable"');
  });

  it("U-ICLOSE-002: runs GitHub operation guards through the HELIX CLI instead of workflow-local rules", () => {
    const { steps } = loadWorkflow();
    const branchKind = stepByName(steps, "branch-kind-check");
    const commitlint = stepByName(steps, "commitlint");
    const pocGuard = stepByName(steps, "poc-no-merge-guard");
    const hotfixGuard = stepByName(steps, "hotfix-postmortem-required");
    const closureGuard = stepByName(steps, "issue-closure-contract");

    expect(branchKind.run).toContain("npx --no-install tsx src/cli.ts");
    expect(branchKind.run).toContain("guard branch-kind");
    expect(branchKind.run).toContain("--strict-unknown-prefix");
    expect(branchKind.run).toContain("git diff --name-only");
    expect(commitlint.run).toContain("npx --no-install tsx src/cli.ts guard commitlint --range");
    expect(commitlint.run).not.toContain("grep -Eq");
    expect(pocGuard.if).toContain("startsWith(github.head_ref, 'poc/')");
    expect(pocGuard.run).toContain("npx --no-install tsx src/cli.ts guard pr-context");
    expect(hotfixGuard.if).toContain("startsWith(github.head_ref, 'hotfix/')");
    expect(hotfixGuard.run).toContain("npx --no-install tsx src/cli.ts guard pr-context");
    expect(closureGuard.if).toContain("github.event_name == 'pull_request'");
    expect(closureGuard.run).toContain("npx --no-install tsx src/cli.ts guard pr-context");
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
    expect(steps[refreshIndex]?.run).toBe("npx --no-install tsx src/cli.ts db rebuild --json");
  });

  it("bounds the required job and full regression step without fail-open", () => {
    const { job, steps, raw } = loadWorkflow();
    const regression = stepByName(steps, "test — 全回帰 (vitest run)");

    expect(job["timeout-minutes"]).toBe(35);
    expect(regression["timeout-minutes"]).toBe(25);
    expect(regression["timeout-minutes"]).toBeLessThan(job["timeout-minutes"] as number);
    expect(job["continue-on-error"]).not.toBe(true);
    expect(regression["continue-on-error"]).not.toBe(true);
    expect(regression.run).toBe("npm test");

    const regressionIndex = steps.indexOf(regression);
    expect(stepByName(steps, "lint (biome)")).toBe(steps[regressionIndex + 1]);
    expect(steps.indexOf(stepByName(steps, "doctor (governance hard gates)"))).toBeGreaterThan(
      regressionIndex,
    );
    expect(boundedTimeViolations(raw)).toEqual([]);
  });

  it("U-CITIME-001: fixes the required job budget at 35 minutes", () => {
    expect(loadWorkflow().job["timeout-minutes"]).toBe(35);
  });

  it("U-CITIME-002: keeps the regression budget below the job budget", () => {
    const { job, steps } = loadWorkflow();
    const regression = stepByName(steps, "test — 全回帰 (vitest run)");
    expect(regression["timeout-minutes"]).toBe(25);
    expect(regression["timeout-minutes"]).toBeLessThan(job["timeout-minutes"] as number);
  });

  it("U-CITIME-003: rejects fail-open fields and preserves post-test gates", () => {
    expect(boundedTimeViolations(readFileSync(WORKFLOW_PATH, "utf8"))).toEqual([]);
  });

  it.each([
    ["job timeout欠落", (raw: string) => raw.replace("    timeout-minutes: 35\n", "")],
    ["文字列timeout", (raw: string) => raw.replace("timeout-minutes: 35", 'timeout-minutes: "35"')],
    ["step timeout欠落", (raw: string) => raw.replace("        timeout-minutes: 25\n", "")],
    ["同値予算", (raw: string) => raw.replace("timeout-minutes: 25", "timeout-minutes: 35")],
    [
      "job fail-open",
      (raw: string) =>
        raw.replace(
          "    timeout-minutes: 35",
          "    timeout-minutes: 35\n    continue-on-error: true",
        ),
    ],
    [
      "step skip条件",
      (raw: string) =>
        raw.replace(
          "        timeout-minutes: 25",
          `        timeout-minutes: 25\n        if: \${{ false }}`,
        ),
    ],
    [
      "command soft-pass",
      (raw: string) => raw.replace("run: npm test\n", "run: npm test || true\n"),
    ],
    [
      "同名ダミー",
      (raw: string) =>
        raw.replace(
          "      - name: test — 全回帰 (vitest run)",
          "      - name: test — 全回帰 (vitest run)\n        timeout-minutes: 25\n        run: npm test\n\n      - name: test — 全回帰 (vitest run)",
        ),
    ],
    [
      "後続gate順序破壊",
      (raw: string) =>
        raw.replace("      - name: lint (biome)", "      - name: lint moved (biome)"),
    ],
  ])("U-CITIME-003: rejects %s", (_label, mutate) => {
    expect(boundedTimeViolations(mutate(readFileSync(WORKFLOW_PATH, "utf8")))).not.toEqual([]);
  });
});

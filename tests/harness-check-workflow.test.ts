// PLAN-L7-426-development-ci-bounded-time / PLAN-L7-462-issue-closure-contract
// PLAN-L7-502-worker-independent-review
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parse as parseYaml } from "yaml";

const WORKFLOW_PATH = ".github/workflows/harness-check.yml";
// PLAN-L7-493-impact-ci-recovery execution evidence.

type Step = {
  name?: string;
  uses?: string;
  run?: string;
  env?: Record<string, string>;
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

type WorkflowRoot = {
  on?: { pull_request?: { types?: string[] } };
  jobs?: { "harness-check"?: HarnessJob; "windows-durability-smoke"?: HarnessJob };
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
  const regressions = steps.filter((step) => step.name === "test — 全回帰 (vitest run)");
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
  if (
    !regression.run?.includes('if [ "$IMPACT_CI_FULL" = "true" ]') ||
    !regression.run.includes('vitest run --project fast "$' + '{bulk_files[@]}"') ||
    !regression.run.includes("vitest run --project fast tests/cli-surface.test.ts") ||
    !regression.run.includes("vitest run --project slow") ||
    !regression.run.includes("vitest run --project fast --project slow") ||
    regression.run.includes("|| true")
  )
    findings.push("impact_ci_dispatch_invalid");
  if (
    !regression.run?.includes('tested_head="$(git rev-parse HEAD)"') ||
    !regression.run.includes("shard_names=(bulk stateful)") ||
    !regression.run.includes('git worktree add --detach "$shard_root/$name" "$tested_head"') ||
    !regression.run.includes(
      'select(. != "tests/cli-surface.test.ts" and (startswith("tests/slow/") | not))',
    ) ||
    !regression.run.includes('vitest run --project fast "$' + '{bulk_files[@]}"') ||
    !regression.run.includes("vitest run --project fast tests/cli-surface.test.ts") ||
    !regression.run.includes("vitest run --project slow") ||
    !regression.run.includes('wait "$bulk_pid"; bulk_status=$?') ||
    !regression.run.includes('wait "$stateful_pid"; stateful_status=$?') ||
    !regression.run.includes('if [ "$bulk_status" -ne 0 ]')
  )
    findings.push("isolated_shard_dispatch_invalid");
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
  const parsed = parseYaml(raw) as WorkflowRoot;
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
  it("U-WIB-018: Ubuntu required CIでbubblewrap実process oracleをskip不能にする", () => {
    const { steps, windowsJob } = loadWorkflow();
    const install = stepByName(steps, "install required Linux isolation backend");
    const realProcess = stepByName(steps, "required real bubblewrap process isolation");

    expect(install.run).toContain("apt-get install -y --no-install-recommends bubblewrap");
    expect(install.run).toContain("kernel.apparmor_restrict_unprivileged_userns=0");
    expect(install.run).toContain("sysctl -n kernel.apparmor_restrict_unprivileged_userns");
    expect(realProcess.run).toContain('tests/worker-isolation-broker.test.ts -t "U-WIB-007"');
    expect(realProcess.env).toEqual({
      HELIX_BWRAP_BIN: "/usr/bin/bwrap",
      HELIX_REQUIRE_REAL_BWRAP: "1",
    });
    expect(realProcess.if).toBeUndefined();
    expect(realProcess["continue-on-error"]).toBeUndefined();
    expect((windowsJob.steps ?? []).some((step) => step.name === install.name)).toBe(false);
  });

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
    expect(raw).toContain("pull-requests: read");
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
    // PLAN-L7-466-pr-scope-contract U-PRSCOPE-003: CI must pass merge-base..head paths.
    expect(closureGuard.run).toContain(
      'merge_base="$(git merge-base "$PR_BASE_SHA" "$PR_HEAD_SHA")"',
    );
    expect(closureGuard.run).toContain('git diff --name-only -z "$merge_base..$PR_HEAD_SHA"');
    expect(closureGuard.run).not.toContain("$PR_BASE_SHA..$PR_HEAD_SHA");
    expect(closureGuard.run).toContain('--changed-file "$RUNNER_TEMP/pr-changed-paths.bin"');
  });

  it("U-PRSCOPE-003: PLAN-L7-466-pr-scope-contract passes the exact PR diff to pr-context", () => {
    const { steps } = loadWorkflow();
    const branchKind = stepByName(steps, "branch-kind-check");
    const commitlint = stepByName(steps, "commitlint");
    const closureGuard = stepByName(steps, "issue-closure-contract");
    for (const step of [branchKind, commitlint, closureGuard]) {
      expect(step.run).toContain('merge_base="$(git merge-base "$PR_BASE_SHA" "$PR_HEAD_SHA")"');
      expect(step.run).not.toContain("$PR_BASE_SHA..$PR_HEAD_SHA");
    }
    expect(closureGuard.run).toContain('git diff --name-only -z "$merge_base..$PR_HEAD_SHA"');
    expect(closureGuard.run).toContain('--changed-file "$RUNNER_TEMP/pr-changed-paths.bin"');
  });

  it("U-PRSCOPE-007: [PLAN-L7-496-pr-context-current-snapshot] current GitHub snapshotをguard前後で固定する", () => {
    const { steps, raw } = loadWorkflow();
    const snapshot = stepByName(steps, "current PR context snapshot");
    const closure = stepByName(steps, "issue-closure-contract");

    expect(snapshot.run).toContain('gh api "repos/$GITHUB_REPOSITORY/pulls/$PR_NUMBER"');
    expect(snapshot.run).toContain("set -euo pipefail");
    expect(snapshot.run).not.toContain("|| true");
    expect(snapshot.run).toContain('> "$RUNNER_TEMP/pr-context-before.json"');
    expect(closure.run).toContain('--snapshot-file "$RUNNER_TEMP/pr-context-before.json"');
    expect(closure.run).toContain("require(process.argv[1])");
    expect(closure.run).toContain('git fetch --no-tags origin "$PR_BASE_SHA" "$PR_HEAD_SHA"');
    expect(closure.run).toContain('> "$RUNNER_TEMP/pr-context-after.json"');
    expect(closure.run).toContain(
      'cmp -s "$RUNNER_TEMP/pr-context-before.json" "$RUNNER_TEMP/pr-context-after.json"',
    );
    expect(closure.run).toContain("current GitHub PR context drifted during admission");
    expect(raw.match(/gh api "repos\/\$GITHUB_REPOSITORY\/pulls\/\$PR_NUMBER"/g)).toHaveLength(2);
    expect(raw).not.toContain("github.event.pull_request.body");
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
    expect(regression.run).toContain('if [ "$IMPACT_CI_FULL" = "true" ]');
    expect(regression.run).toContain('tested_head="$(git rev-parse HEAD)"');
    expect(regression.run).toContain(
      'git worktree add --detach "$shard_root/$name" "$tested_head"',
    );
    expect(regression.run).toContain('vitest run --project fast "$' + '{bulk_files[@]}"');
    expect(regression.run).toContain("vitest run --project fast tests/cli-surface.test.ts");
    expect(regression.run).toContain("vitest run --project slow");
    expect(regression.run).toContain('wait "$bulk_pid"; bulk_status=$?');
    expect(regression.run).toContain('wait "$stateful_pid"; stateful_status=$?');
    expect(regression.run).toContain('if [ "$bulk_status" -ne 0 ]');
    expect(regression.run).toContain("vitest run --project fast --project slow");

    const regressionIndex = steps.indexOf(regression);
    expect(stepByName(steps, "lint (biome)")).toBe(steps[regressionIndex + 1]);
    expect(steps.indexOf(stepByName(steps, "doctor (governance hard gates)"))).toBeGreaterThan(
      regressionIndex,
    );
    expect(boundedTimeViolations(raw)).toEqual([]);
  });

  // IT-IMPACTCI-006: 既存workflow jobと必須gateを縮退させず再利用する。
  it("U-IMPACTCI-WF-001: read-after-GitHub snapshotでDraft selected／Ready・main fullをdispatchする", () => {
    const { steps, raw } = loadWorkflow();
    const root = parseYaml(raw) as WorkflowRoot;
    const selector = stepByName(steps, "Impact CI profile selection");
    const regression = stepByName(steps, "test — 全回帰 (vitest run)");

    expect(selector.run).toContain(`gh api "repos/\${REPOSITORY}/pulls/\${PR_NUMBER}"`);
    expect(selector.run?.match(/gh api/g)).toHaveLength(2);
    expect(selector.run).toContain('profile="draft_preflight"');
    expect(selector.run).toContain('profile="candidate_admission"');
    expect(selector.run).toContain('profile="post_merge_full"');
    expect(selector.run).toContain("git diff --name-only -z");
    expect(selector.run).toContain("ci impact-plan");
    expect(selector.run).toContain("stale_snapshot: PR HEAD/base/body changed");
    expect(selector.run).toContain(`jq -r '.draft'`);
    expect(root.on?.pull_request?.types).toEqual([
      "opened",
      "synchronize",
      "reopened",
      "ready_for_review",
      "converted_to_draft",
    ]);
    expect(selector.run).toContain('if ! git diff --name-only -z "$range"');
    expect(regression.run).toContain("IMPACT_CI_FULL");
    expect(regression.run).toContain(`if [ "\${#test_files[@]}" -eq 0 ]`);
    expect(regression["continue-on-error"]).toBeUndefined();
  });

  it("U-IMPACTCI-WF-002: full exact setを同一HEADのisolated laneへ分割してfail-close集約する", () => {
    const { job, steps } = loadWorkflow();
    const regression = stepByName(steps, "test — 全回帰 (vitest run)");

    expect(job.needs).toBe("windows-durability-smoke");
    expect(regression.run).toContain("shard_names=(bulk stateful)");
    expect(regression.run?.match(/git worktree add --detach/g)).toHaveLength(1);
    expect(regression.run).toContain(
      'select(. != "tests/cli-surface.test.ts" and (startswith("tests/slow/") | not))',
    );
    expect(regression.run).toContain("vitest run --project fast tests/cli-surface.test.ts");
    expect(regression.run).toContain('ln -s "$GITHUB_WORKSPACE/node_modules"');
    expect(regression.run).toContain("set +e");
    expect(regression.run).toContain("set -e");
    expect(regression.run).not.toContain("continue-on-error");
    expect(regression.run).not.toContain("npm test");
  });

  it.each([
    [
      "cli-surface lane欠落",
      (raw: string) =>
        raw.replace(
          "npx --no-install vitest run --project fast tests/cli-surface.test.ts",
          ": # cli-surface omitted",
        ),
    ],
    [
      "共有root実行",
      (raw: string) =>
        raw.replace(
          'git worktree add --detach "$shard_root/$name" "$tested_head"',
          'mkdir -p "$shard_root/$name"',
        ),
    ],
    [
      "lane failure未集約",
      (raw: string) =>
        raw.replace('wait "$stateful_pid"; stateful_status=$?', "stateful_status=0 # wait omitted"),
    ],
  ])("U-IMPACTCI-WF-002: %s mutationを拒否する", (_label, mutate) => {
    expect(boundedTimeViolations(mutate(readFileSync(WORKFLOW_PATH, "utf8")))).toContain(
      "isolated_shard_dispatch_invalid",
    );
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
      (raw: string) =>
        raw.replace(
          '              npx --no-install vitest run --project fast "$' + '{bulk_files[@]}"\n',
          '              npx --no-install vitest run --project fast "$' +
            '{bulk_files[@]}" || true\n',
        ),
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

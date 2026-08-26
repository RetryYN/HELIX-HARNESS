// PLAN-L7-426-development-ci-bounded-time / PLAN-L7-462-issue-closure-contract
// PLAN-L7-502-worker-independent-review
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// PLAN-L7-657-distribution-lite-consumer-canary
// U-DISTCAN-008a: required Windows jobへLite canaryを配線する。
import { parse as parseYaml } from "yaml";

const WORKFLOW_PATH = ".github/workflows/harness-check.yml";
// PLAN-L7-493-impact-ci-recovery execution evidence.
// PLAN-L7-682-lite-canary-ci-parallelization: U-LITECI-WF-001..003.

type Step = {
  name?: string;
  uses?: string;
  run?: string;
  env?: Record<string, string>;
  if?: string;
  with?: Record<string, unknown>;
  "timeout-minutes"?: number;
  "continue-on-error"?: boolean;
  shell?: string;
};

type HarnessJob = {
  steps?: Step[];
  "timeout-minutes"?: number;
  "continue-on-error"?: boolean;
  if?: string;
  needs?: string | string[];
  "runs-on"?: string;
};

type WorkflowRoot = {
  on?: { pull_request?: { types?: string[] } };
  jobs?: {
    "harness-check"?: HarnessJob;
    "lite-consumer-canary-artifact"?: HarnessJob;
    "windows-durability-smoke"?: HarnessJob;
    "full-regression-preflight"?: HarnessJob;
    "full-regression-bulk-1"?: HarnessJob;
    "full-regression-bulk-2"?: HarnessJob;
    "full-regression-stateful"?: HarnessJob;
    "full-regression-finalize"?: HarnessJob;
  };
};

function fullRegressionShardJobViolations(raw: string): string[] {
  const parsed = parseYaml(raw) as WorkflowRoot;
  const jobs = parsed.jobs ?? {};
  const preflight = jobs["full-regression-preflight"];
  const shards = [
    jobs["full-regression-bulk-1"],
    jobs["full-regression-bulk-2"],
    jobs["full-regression-stateful"],
  ];
  const finalize = jobs["full-regression-finalize"];
  const findings: string[] = [];
  if (!preflight) findings.push("preflight_job_missing");
  if (shards.some((job) => !job)) findings.push("shard_job_missing");
  if (!finalize) findings.push("finalize_job_missing");
  if (findings.length > 0) return findings;

  if ([preflight, ...shards, finalize].some((job) => job?.["continue-on-error"] !== undefined)) {
    findings.push("job_fail_open_field");
  }

  const preflightText = JSON.stringify(preflight);
  if (
    !preflightText.includes("full-regression-shard-plan") ||
    !preflightText.includes("full-regression-shards.ts plan") ||
    !preflightText.includes("candidate-head") ||
    !preflightText.includes("base-sha")
  ) {
    findings.push("preflight_partition_contract_missing");
  }
  if (preflightText.includes("git worktree add") || preflightText.includes("bulk_pid=$!")) {
    findings.push("legacy_in_job_shard_path_present");
  }
  for (const [index, job] of shards.entries()) {
    const text = JSON.stringify(job);
    const shardId = ["bulk-1", "bulk-2", "stateful"][index];
    if (
      !text.includes("full-regression-shard-plan") ||
      !text.includes(`--shard-id ${shardId}`) ||
      !text.includes("full-regression-shards.ts receipt") ||
      !text.includes("full-regression-shard-receipt") ||
      text.includes("continue-on-error")
    ) {
      findings.push(`shard_contract_invalid:${shardId}`);
    }
  }
  const finalizeText = JSON.stringify(finalize);
  if (
    !finalizeText.includes("full-regression-shards.ts validate") ||
    !finalizeText.includes("full-regression-shard-receipt-bulk-1") ||
    !finalizeText.includes("full-regression-shard-receipt-bulk-2") ||
    !finalizeText.includes("full-regression-shard-receipt-stateful") ||
    !finalizeText.includes("db rebuild (post-test projection refresh)") ||
    !finalizeText.includes("doctor (governance hard gates)")
  ) {
    findings.push("finalize_contract_invalid");
  }
  const finalizeNeeds = Array.isArray(finalize?.needs) ? finalize.needs : [finalize?.needs];
  if (
    finalize?.if !== `\${{ always() }}` ||
    ![
      "full-regression-preflight",
      "full-regression-bulk-1",
      "full-regression-bulk-2",
      "full-regression-stateful",
    ].every((name) => finalizeNeeds.includes(name)) ||
    !finalizeText.includes("impact-ci-full-receipt") ||
    !finalizeText.includes("needs.full-regression-preflight.outputs.candidate_head") ||
    !finalizeText.includes("needs.full-regression-preflight.outputs.base_sha")
  ) {
    findings.push("finalize_admission_invalid");
  }
  const finalizeSteps = finalize?.steps ?? [];
  const ordered = [
    "validate exact shard receipt set",
    "lint (biome)",
    "db rebuild (post-test projection refresh)",
    "doctor (governance hard gates)",
  ].map((name) => finalizeSteps.findIndex((step) => step.name === name));
  if (
    ordered.some((index) => index < 0) ||
    ordered.some((index, i) => i > 0 && index <= (ordered[i - 1] ?? -1))
  ) {
    findings.push("finalize_gate_order_invalid");
  }
  const aggregateNeeds = jobs["harness-check"]?.needs;
  const needs = Array.isArray(aggregateNeeds) ? aggregateNeeds : [aggregateNeeds];
  if (!needs.includes("full-regression-finalize")) findings.push("required_check_wiring_invalid");
  return findings;
}

function boundedTimeViolations(raw: string): string[] {
  let parsed: { jobs?: { "full-regression-preflight"?: HarnessJob } };
  try {
    parsed = parseYaml(raw) as typeof parsed;
  } catch {
    return ["workflow_yaml_invalid"];
  }
  const job = parsed.jobs?.["full-regression-preflight"];
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
    !regression.run.includes(
      'nice -n 10 npx --no-install vitest run --project fast "$' + '{bulk_files[@]}"',
    ) ||
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
    !regression.run.includes(
      'nice -n 10 npx --no-install vitest run --project fast "$' + '{bulk_files[@]}"',
    ) ||
    !regression.run.includes("vitest run --project fast tests/cli-surface.test.ts") ||
    !regression.run.includes("vitest run --project slow") ||
    !regression.run.includes('wait "$bulk_pid"; bulk_status=$?') ||
    !regression.run.includes('wait "$stateful_pid"; stateful_status=$?') ||
    !regression.run.includes('if [ "$bulk_status" -ne 0 ] || [ "$stateful_status" -ne 0 ]; then')
  )
    findings.push("isolated_shard_dispatch_invalid");
  // U-IMPACTCI-WF-003: runner cancelを両lane process groupへboundedに伝播し、
  // cleanupとcancellation receiptを残し、正常終了statusを上書きしない。
  const handlerBody = regression.run?.slice(
    regression.run.indexOf("terminate_lanes() {"),
    regression.run.indexOf("trap 'terminate_lanes TERM' TERM"),
  );
  // 正常経路のtrap解除はwait以降の領域で判定する。handler内の
  // `trap - TERM INT EXIT` と部分文字列が衝突するため、全文includesでは
  // 正常経路解除の削除mutationを検出できない。
  const waitTail = regression.run?.slice(regression.run.indexOf('wait "$bulk_pid"'));
  if (
    !regression.run?.includes("set -m") ||
    !regression.run.includes("terminate_lanes() {") ||
    !regression.run.includes("trap 'terminate_lanes TERM' TERM") ||
    !regression.run.includes("trap 'terminate_lanes INT' INT") ||
    !regression.run.includes('kill -TERM -- "-$lane_pid"') ||
    !regression.run.includes('kill -KILL -- "-$lane_pid"') ||
    !regression.run.includes("stop_latency_seconds") ||
    !regression.run.includes("billed_step_seconds") ||
    !regression.run.includes('while [ "$SECONDS" -lt "$stop_deadline" ]; do') ||
    !handlerBody?.includes("cleanup_shards") ||
    !handlerBody.includes("exit 143") ||
    !handlerBody.includes("exit 130") ||
    handlerBody.includes("exit 0") ||
    !waitTail?.includes("trap - TERM INT\n")
  )
    findings.push("cancel_propagation_invalid");
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

// U-IMPACTCI-WF-004: 同一HEAD transition event（ready_for_review / converted_to_draft）だけが
// prior full-receipt付きgreen runを再利用できる。receiptはfull回帰をgreen完走したrunだけが
// artifactとして残し、再利用はhead/base SHAの完全一致で判定、照会失敗はfull実行へfail-closeする。
function transitionReuseViolations(raw: string): string[] {
  let parsed: WorkflowRoot;
  try {
    parsed = parseYaml(raw) as WorkflowRoot;
  } catch {
    return ["workflow_yaml_invalid"];
  }
  const steps = parsed.jobs?.["full-regression-preflight"]?.steps ?? [];
  const selector = steps.find((step) => step.name === "Impact CI profile selection");
  const regression = steps.find((step) => step.name === "test — 全回帰 (vitest run)");
  const receipt = parsed.jobs?.["full-regression-finalize"]?.steps?.find(
    (step) => step.name === "full admission receipt",
  );
  if (!selector?.run || !regression?.run || !receipt) return ["transition_reuse_invalid"];
  const findings: string[] = [];
  if (
    !selector.run.includes(
      'if [ "$full_decision" = "true" ] && { [ "$EVENT_ACTION" = "ready_for_review" ] || [ "$EVENT_ACTION" = "converted_to_draft" ]; }; then',
    ) ||
    !selector.run.includes(
      "actions/workflows/harness-check.yml/runs?event=pull_request&status=success&head_sha=",
    ) ||
    !selector.run.includes('|| prior_runs=""') ||
    !selector.run.includes('select(.conclusion == "success")') ||
    !selector.run.includes('select(.name == "impact-ci-full-receipt")') ||
    !selector.run.includes(
      '[ "$receipt_tested_head" = "$candidate_head" ] && [ "$receipt_base_sha" = "$pr_base_head" ]',
    ) ||
    selector.env?.EVENT_ACTION !== `\${{ github.event.action }}` ||
    !regression.run.includes('if [ "$IMPACT_CI_REUSE" = "true" ]; then') ||
    !regression.run.includes('if [ -z "$IMPACT_CI_REUSE_RUN_ID" ]; then') ||
    !regression.run.includes("reused_run_id") ||
    regression.env?.IMPACT_CI_REUSE !== `\${{ steps.impact-ci.outputs.reuse }}` ||
    regression.env?.IMPACT_CI_REUSE_RUN_ID !== `\${{ steps.impact-ci.outputs.reuse_run_id }}` ||
    !receipt.uses?.startsWith("actions/upload-artifact@") ||
    receipt.with?.name !== "impact-ci-full-receipt" ||
    !receipt.if?.includes("github.event_name == 'pull_request'") ||
    !receipt.if.includes("needs.full-regression-preflight.outputs.full == 'true'") ||
    !receipt.if.includes("needs.full-regression-preflight.outputs.reuse != 'true'") ||
    !receipt.if.includes("success()")
  )
    findings.push("transition_reuse_invalid");
  return findings;
}

// U-IMPACTCI-WF-005: bulk ∪ {cli-surface} ∪ slow配下tracked testsがgit tracked全test
// inventoryと恒等であることをlane起動前にassertし（Issue #352 §1）、cancel/timeout時は
// terminate_lanesがkill後・receipt前に両lane logのtailを出力する（同 §3）。
function laneCoverageViolations(raw: string): string[] {
  let parsed: WorkflowRoot;
  try {
    parsed = parseYaml(raw) as WorkflowRoot;
  } catch {
    return ["workflow_yaml_invalid"];
  }
  const steps = parsed.jobs?.["full-regression-preflight"]?.steps ?? [];
  const regression = steps.find((step) => step.name === "test — 全回帰 (vitest run)");
  const run = regression?.run;
  if (!run) return ["regression_step_missing"];
  const findings: string[] = [];
  const assertIndex = run.indexOf("lane union does not match full test inventory");
  const launchIndex = run.indexOf("bulk_pid=$!");
  if (
    !run.includes("git ls-files 'tests/*.test.ts' 'tests/**/*.test.ts'") ||
    !run.includes("git ls-files 'tests/slow/*.test.ts' 'tests/slow/**/*.test.ts'") ||
    !run.includes(
      `printf '%s\\n' "$` +
        `{bulk_files[@]}" tests/cli-surface.test.ts "$` +
        `{stateful_slow_files[@]}"`,
    ) ||
    !run.includes('if [ "$lane_union" != "$full_inventory" ]; then') ||
    assertIndex === -1 ||
    launchIndex === -1 ||
    assertIndex > launchIndex
  )
    findings.push("lane_inventory_identity_invalid");
  const handlerBody = run.slice(
    run.indexOf("terminate_lanes() {"),
    run.indexOf("trap 'terminate_lanes TERM' TERM"),
  );
  const tailIndex = handlerBody.indexOf("tail -n 100");
  const receiptIndex = handlerBody.indexOf("impact-ci cancellation receipt");
  if (
    tailIndex === -1 ||
    receiptIndex === -1 ||
    tailIndex > receiptIndex ||
    !handlerBody.includes("impact-ci-bulk.log") ||
    !handlerBody.includes("impact-ci-stateful.log")
  )
    findings.push("partial_lane_log_invalid");
  return findings;
}

function loadWorkflow(): {
  job: HarnessJob;
  fullJob: HarnessJob;
  aggregateJob: HarnessJob;
  liteCanaryJob: HarnessJob;
  windowsJob: HarnessJob;
  steps: Step[];
  raw: string;
} {
  const raw = readFileSync(WORKFLOW_PATH, "utf8");
  const parsed = parseYaml(raw) as WorkflowRoot;
  const job = parsed.jobs?.["full-regression-preflight"] ?? {};
  return {
    job,
    fullJob: job,
    aggregateJob: parsed.jobs?.["harness-check"] ?? {},
    liteCanaryJob: parsed.jobs?.["lite-consumer-canary-artifact"] ?? {},
    windowsJob: parsed.jobs?.["windows-durability-smoke"] ?? {},
    raw,
    steps: job.steps ?? [],
  };
}

function reviewAdmissionViolations(raw: string): string[] {
  let parsed: WorkflowRoot;
  try {
    parsed = parseYaml(raw) as WorkflowRoot;
  } catch {
    return ["workflow_yaml_invalid"];
  }
  const steps = parsed.jobs?.["full-regression-preflight"]?.steps ?? [];
  const checkout = steps.find((candidate) => candidate.name === "checkout");
  const contextProjection =
    '{repository: .base.repo.full_name, number: .number, title: .title, body: (.body // ""), head_ref: .head.ref, base_ref: .base.ref, head_sha: .head.sha, base_sha: .base.sha}';
  const step = steps.find(
    (candidate) => candidate.name === "current HEAD independent review admission",
  );
  if (
    !step?.run ||
    checkout?.with?.ref !== `\${{ github.event.pull_request.head.sha || github.sha }}` ||
    raw.split(contextProjection).length - 1 !== 2 ||
    step.if !== `\${{ github.event_name == 'pull_request' }}` ||
    step.env?.PR_DRAFT !== `\${{ github.event.pull_request.draft }}` ||
    step.env?.PR_HEAD_SHA !== `\${{ github.event.pull_request.head.sha }}` ||
    step.run.match(/gh api --paginate --slurp/gu)?.length !== 2 ||
    !step.run.includes("issues/$PR_NUMBER/comments?per_page=100") ||
    !step.run.includes("actions/runs?event=pull_request&head_sha=$PR_HEAD_SHA") ||
    !step.run.includes("runPages.flatMap") ||
    !step.run.includes("const currentRunId = Number(process.env.GITHUB_RUN_ID)") ||
    !step.run.includes("id !== currentRunId") ||
    !step.run.includes("id, run_attempt, head_sha") ||
    !step.run.includes("run_attempt") ||
    !step.run.includes("attempt: run_attempt") ||
    !step.run.includes("pull_request_numbers") ||
    !step.run.includes("updated_at") ||
    !step.run.includes('gh pr diff "$PR_NUMBER"') ||
    !step.run.includes("observed_at: new Date().toISOString()") ||
    !step.run.includes("review_packet:") ||
    !step.run.includes("Exact GitHub PR diff:") ||
    !step.run.includes("src/doctor/l3-g3-logical-db-receipt.ts") ||
    !step.run.includes("current_db_receipt: currentDbReceipt") ||
    !step.run.includes("github pr-review-admission") ||
    !step.run.includes('is_draft: process.env.PR_DRAFT === "true"') ||
    step.run.includes("|| true")
  ) {
    return ["cross_review_admission_invalid"];
  }
  return [];
}

function stepByName(steps: Step[], name: string): Step {
  const step = steps.find((candidate) => candidate.name === name);
  expect(step, `${name} step missing`).toBeTruthy();
  return step as Step;
}

describe("source harness-check workflow", () => {
  // PLAN-L7-685-full-regression-shard-jobs — U-FULLSHARD-WF-001
  // PLAN-L7-685-full-regression-shard-jobs — U-FULLSHARD-WF-002
  it("U-GCRA-WF-001: required harness-check内でReady exact-HEAD review admissionをfail-closeする", () => {
    const raw = readFileSync(WORKFLOW_PATH, "utf8");
    expect(reviewAdmissionViolations(raw)).toEqual([]);
    const parsed = parseYaml(raw) as WorkflowRoot;
    const checkout = parsed.jobs?.["full-regression-preflight"]?.steps?.find(
      (step) => step.name === "checkout",
    );
    expect(checkout?.with?.ref).toBe(`\${{ github.event.pull_request.head.sha || github.sha }}`);
  });

  it.each([
    [
      "review step欠落",
      (raw: string) => raw.replace("current HEAD independent review admission", "review note"),
    ],
    ["draft境界欠落", (raw: string) => raw.replace("github.event.pull_request.draft", "false")],
    [
      "head queryがmerge SHA",
      (raw: string) => raw.replace("head_sha=$PR_HEAD_SHA", "head_sha=$GITHUB_SHA"),
    ],
    ["comment pagination欠落", (raw: string) => raw.replace("--paginate --slurp", "")],
    [
      "runs pagination欠落",
      (raw: string) =>
        raw.replace(
          'gh api --paginate --slurp \\\n            "repos/$GITHUB_REPOSITORY/actions/runs',
          'gh api \\\n            "repos/$GITHUB_REPOSITORY/actions/runs',
        ),
    ],
    ["PR diff欠落", (raw: string) => raw.replace('gh pr diff "$PR_NUMBER"', "true")],
    [
      "CI run attempt source欠落",
      (raw: string) => raw.replace("id, run_attempt, head_sha", "id, head_sha"),
    ],
    [
      "CI run attempt mapping欠落",
      (raw: string) => raw.replace("attempt: run_attempt", "attempt: missing_attempt"),
    ],
    [
      "current workflow run除外欠落",
      (raw: string) => raw.replace("id !== currentRunId", "id !== missingCurrentRunId"),
    ],
    ["review packet欠落", (raw: string) => raw.replace("review_packet:", "packet_note:")],
    [
      "candidate checkout欠落",
      (raw: string) =>
        raw.replaceAll(
          `ref: \${{ github.event.pull_request.head.sha || github.sha }}`,
          `ref: \${{ github.sha }}`,
        ),
    ],
    [
      "read-after PR projection drift",
      (raw: string) => raw.replace("number: .number, title: .title", "number: .number"),
    ],
    [
      "current DB receipt欠落",
      (raw: string) =>
        raw.replace("current_db_receipt: currentDbReceipt", "db_note: currentDbReceipt"),
    ],
    [
      "fail-open",
      (raw: string) =>
        raw.replace(
          '--snapshot-file "$RUNNER_TEMP/pr-review-admission.json"',
          '--snapshot-file "$RUNNER_TEMP/pr-review-admission.json" || true',
        ),
    ],
  ])("U-GCRA-WF-002: %s mutationを拒否する", (_label, mutate) => {
    expect(reviewAdmissionViolations(mutate(readFileSync(WORKFLOW_PATH, "utf8")))).toContain(
      "cross_review_admission_invalid",
    );
  });
  it("U-WIB-018: Ubuntu required CIでbubblewrap実process oracleをskip不能にする", () => {
    const { steps, windowsJob } = loadWorkflow();
    const install = stepByName(steps, "install required Linux isolation backend");
    const realProcess = stepByName(steps, "required real bubblewrap process isolation");

    expect(install.run).toContain("Dir::Etc::sourcelist=/tmp/helix-ubuntu.list");
    expect(install.run).toContain("Dir::Etc::sourceparts=-");
    expect(install.run).toContain("archive.ubuntu.com/ubuntu noble main universe");
    expect(install.run).toContain("security.ubuntu.com/ubuntu noble-security main universe");
    expect(install.run).toContain(`dpkg-query -W -f='\${Status}' bubblewrap`);
    expect(install.run).toContain("sudo timeout 180s");
    expect(install.run).toContain("Acquire::Retries=3");
    expect(install.run).toContain("Acquire::http::Timeout=30");
    expect(install.run).toContain("Acquire::https::Timeout=30");
    expect(install.run).toContain("test -x /usr/bin/bwrap");
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
    expect(readFileSync("tests/worker-isolation-broker.test.ts", "utf8")).toContain(
      'it("U-WIB-007:',
    );
  });

  it("U-DUR-007: propagates Windows durability and Lite canary into the required check", () => {
    const { aggregateJob, job, windowsJob } = loadWorkflow();
    const aggregate = stepByName(aggregateJob.steps ?? [], "require every required lane");
    const smoke = stepByName(windowsJob.steps ?? [], "Windows durability smoke");

    expect(windowsJob["runs-on"]).toBe("windows-latest");
    expect(windowsJob["timeout-minutes"]).toBe(8);
    expect(windowsJob["continue-on-error"]).not.toBe(true);
    expect(smoke.run).toBe(
      "npm run test:fast -- tests/loop-store-durability.test.ts tests/loop-store-durability-node.test.ts tests/distribution-lite-consumer-canary.test.ts",
    );
    expect(smoke["continue-on-error"]).not.toBe(true);
    expect(job.needs).toBeUndefined();
    expect(aggregateJob.needs).toEqual([
      "lite-consumer-canary-artifact",
      "windows-durability-smoke",
      "full-regression-finalize",
    ]);
    expect(aggregateJob.if).toBe(`\${{ always() }}`);
    expect(aggregate.run).toContain("success:success:none");
    expect(aggregate.run).toContain("success:authorized_skip:closure_unaffected");
    expect(aggregate.run).toContain("check_lane lite");
    expect(aggregate.run).toContain("check_lane windows");
    expect(aggregate.run).toContain("check_lane full");
  });

  it("U-DISTCAN-008a: required Windows jobへLite canaryを配線する", () => {
    const { liteCanaryJob, windowsJob } = loadWorkflow();
    const build = stepByName(liteCanaryJob.steps ?? [], "build Lite canary artifact");
    const linux = stepByName(liteCanaryJob.steps ?? [], "Linux Lite consumer canary");
    const upload = stepByName(liteCanaryJob.steps ?? [], "upload exact Lite canary artifact");
    const download = stepByName(windowsJob.steps ?? [], "download Linux-validated Lite artifact");
    const smoke = stepByName(windowsJob.steps ?? [], "Windows durability smoke");
    expect(liteCanaryJob["runs-on"]).toBe("ubuntu-latest");
    expect(build.run).toContain("distribution package-profile");
    expect(build.run).toContain(`> "\${RUNNER_TEMP}/lite-canary/receipt.json"`);
    expect(linux.env?.HELIX_LITE_CANARY_RECEIPT).toContain("receipt.json");
    expect(linux.run).toContain("tests/distribution-lite-consumer-canary.test.ts");
    expect(upload.uses).toBe("actions/upload-artifact@v7");
    expect(upload.with?.name).toBe("lite-consumer-canary");
    expect(windowsJob.needs).toBe("lite-consumer-canary-artifact");
    expect(download.uses).toBe("actions/download-artifact@v8");
    expect(download.with?.name).toBe("lite-consumer-canary");
    expect(smoke.env?.HELIX_LITE_CANARY_RECEIPT).toContain("receipt.json");
    expect(smoke.run).toContain("tests/distribution-lite-consumer-canary.test.ts");
    expect(smoke["continue-on-error"]).not.toBe(true);
  });

  it("U-LITECI-WF-001: fast selectorはprofile/manifest/closureを必ず実行し、typed statusへ接続する", () => {
    const { liteCanaryJob } = loadWorkflow();
    const selector = stepByName(
      liteCanaryJob.steps ?? [],
      "fast Lite profile manifest closure selector",
    );
    const build = stepByName(liteCanaryJob.steps ?? [], "build Lite canary artifact");
    const linux = stepByName(liteCanaryJob.steps ?? [], "Linux Lite consumer canary");
    const upload = stepByName(liteCanaryJob.steps ?? [], "upload exact Lite canary artifact");
    const status = stepByName(liteCanaryJob.steps ?? [], "Lite typed lane status");

    expect(selector.run).toContain("src/cli/lite-canary-selector.ts lite-canary-selector");
    expect(selector.run).toContain("selector_uncertain");
    expect(selector.run).toContain("jq -r '.disposition'");
    expect(selector.run).toContain("jq -r '.skip_code // \"none\"'");
    expect(build.if).toContain("steps.lite-selector.outputs.disposition == 'required'");
    expect(linux.if).toContain("steps.lite-selector.outputs.disposition == 'required'");
    expect(upload.if).toContain("steps.lite-selector.outputs.disposition == 'required'");
    expect(status.if).toBe(`\${{ always() }}`);
    expect(status.run).toContain("authorized_skip");
    expect(status.run).toContain("closure_unaffected");
    expect(status.run).toContain("LITE_BUILD_OUTCOME");
    expect(status.run).toContain("LINUX_CANARY_OUTCOME");
    expect(status.run).toContain("LITE_UPLOAD_OUTCOME");
    expect(status.run).toContain(
      'if [ "$LITE_DISPOSITION" = "authorized_skip" ] && [ "$LITE_SKIP_CODE" = "closure_unaffected" ]; then',
    );
    expect(status.run).toContain('echo "skip_code=closure_unaffected" >> "$GITHUB_OUTPUT"');
    expect(liteCanaryJob.needs).toBeUndefined();
  });

  it("U-LITECI-WF-002: LiteとFullは独立し、WindowsはLinux laneの成果物だけに依存する", () => {
    const { aggregateJob, fullJob, liteCanaryJob, windowsJob } = loadWorkflow();
    const windowsStatus = stepByName(windowsJob.steps ?? [], "Windows typed lane status");
    expect(liteCanaryJob.needs).toBeUndefined();
    expect(fullJob.needs).toBeUndefined();
    expect(windowsJob.needs).toBe("lite-consumer-canary-artifact");
    expect(windowsJob.if).toContain("needs.lite-consumer-canary-artifact.result == 'success'");
    expect(windowsJob.if).not.toContain("full-regression-preflight");
    expect(windowsStatus.shell).toBe("bash");
    expect(windowsStatus.if).toBe(`\${{ always() }}`);
    expect(aggregateJob.needs).toEqual([
      "lite-consumer-canary-artifact",
      "windows-durability-smoke",
      "full-regression-finalize",
    ]);
  });

  it("U-LITECI-WF-003: aggregateは全laneのsuccessまたはclosure_unaffectedだけを受け入れる", () => {
    const { aggregateJob, raw } = loadWorkflow();
    const aggregate = stepByName(aggregateJob.steps ?? [], "require every required lane");
    expect(aggregateJob.if).toBe(`\${{ always() }}`);
    expect(aggregate.run).toContain(
      "success:success:none|success:authorized_skip:closure_unaffected",
    );
    expect(aggregate.run).toContain("check_lane lite");
    expect(aggregate.run).toContain("check_lane windows");
    expect(aggregate.run).toContain("check_lane full");
    expect(aggregate.run).toContain("did not produce success or an authorized typed skip");
    expect(aggregate.env).toMatchObject({
      LITE_RESULT: `\${{ needs.lite-consumer-canary-artifact.result }}`,
      WINDOWS_RESULT: `\${{ needs.windows-durability-smoke.result }}`,
      FULL_RESULT: `\${{ needs.full-regression-finalize.result }}`,
    });
    expect(raw.match(/distribution package-profile/g)).toHaveLength(1);
    expect(aggregate["continue-on-error"]).toBeUndefined();
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

  // PLAN-L7-574-github-workflow-identity-admission — U-GWIDADM-007
  it("U-ICLOSE-002: runs GitHub operation guards through the HELIX CLI instead of workflow-local rules", () => {
    const { steps, raw } = loadWorkflow();
    const branchKind = stepByName(steps, "branch-kind-check");
    const commitlint = stepByName(steps, "commitlint");
    const pocGuard = stepByName(steps, "poc-no-merge-guard");
    const hotfixGuard = stepByName(steps, "hotfix-postmortem-required");
    const closureGuard = stepByName(steps, "issue-closure-contract");
    const dependencyGuard = stepByName(steps, "issue-dependency-contract");

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
    expect(closureGuard.run).toContain("github issue-closure-graph-snapshot");
    expect(closureGuard.run).toContain("github workflow-identity-admission");
    expect(closureGuard.run).toContain('--pr-body-file "$RUNNER_TEMP/pr-body.md"');
    expect(closureGuard.run).toContain('--changed-file "$RUNNER_TEMP/pr-changed-paths.bin"');
    expect(closureGuard.run).toContain(
      '--closure-graph-file "$RUNNER_TEMP/issue-closure-graph.json"',
    );
    expect(raw).toContain("  issues: read");
    expect(raw).toContain("  actions: read");
    // PLAN-L7-466-pr-scope-contract U-PRSCOPE-003: CI must pass merge-base..head paths.
    expect(closureGuard.run).toContain(
      'merge_base="$(git merge-base "$PR_BASE_SHA" "$PR_HEAD_SHA")"',
    );
    expect(closureGuard.run).toContain('git diff --name-only -z "$merge_base..$PR_HEAD_SHA"');
    expect(closureGuard.run).not.toContain("$PR_BASE_SHA..$PR_HEAD_SHA");
    expect(dependencyGuard.if).toContain("github.event_name == 'pull_request'");
    expect(dependencyGuard.run).toContain("github issue-dependency-audit");
    expect(dependencyGuard.run).toContain('--repository "$GITHUB_REPOSITORY"');
    expect(closureGuard.run).toContain('--changed-file "$RUNNER_TEMP/pr-changed-paths.bin"');
  });

  // PLAN-L7-574-github-workflow-identity-admission
  it("U-GWIDADM-007: required CIがtyped identity admissionへPR bodyとchanged pathsを渡す", () => {
    const { steps } = loadWorkflow();
    const closureGuard = stepByName(steps, "issue-closure-contract");
    expect(closureGuard.run).toContain("github workflow-identity-admission");
    expect(closureGuard.run).toContain('--pr-body-file "$RUNNER_TEMP/pr-body.md"');
    expect(closureGuard.run).toContain('--changed-file "$RUNNER_TEMP/pr-changed-paths.bin"');
  });

  it("U-IHIER-006: PLAN-L7-556-issue-dependency-doctor はworkflow event境界を固定する", () => {
    const { steps } = loadWorkflow();
    const dependencyGuard = stepByName(steps, "issue-dependency-contract");
    const repositoryDependencyGuard = stepByName(steps, "issue-dependency-repository-contract");

    expect(dependencyGuard.run).toContain('--focus-issues-json "$FOCUS_ISSUES_JSON"');
    expect(dependencyGuard.run).toContain("issue-closure-graph.json");
    expect(repositoryDependencyGuard.if).toContain("github.event_name == 'schedule'");
    expect(repositoryDependencyGuard.if).toContain("github.event_name == 'workflow_dispatch'");
    expect(repositoryDependencyGuard.if).not.toContain("github.event_name == 'push'");
    expect(repositoryDependencyGuard.run).toContain("github issue-dependency-audit");
    expect(repositoryDependencyGuard.run).toContain("--require-referenced-plans");
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

  // IT-IMPACTCI-006: 既存workflow jobと必須gateを縮退させず再利用する。
  it("U-IMPACTCI-WF-001: read-after-GitHub snapshotでDraft selected／Ready・main fullをdispatchする", () => {
    const { steps, raw } = loadWorkflow();
    const root = parseYaml(raw) as WorkflowRoot;
    const selector = stepByName(steps, "Impact CI profile selection");
    const regression = stepByName(steps, "test — 全回帰 (vitest run)");

    expect(selector.run).toContain(`gh api "repos/\${REPOSITORY}/pulls/\${PR_NUMBER}"`);
    // PR snapshot before/after の2回に加え、U-IMPACTCI-WF-004のprior run照会・
    // artifact一覧・receipt取得の3回（すべてread-only・失敗時はfull実行へfail-close）。
    expect(selector.run?.match(/gh api/g)).toHaveLength(5);
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

  it("U-LITECI-WF-005: workflow_dispatchでbefore SHAが空でも候補HEADの親からfull rangeを作る", () => {
    const { steps } = loadWorkflow();
    const selector = stepByName(steps, "Impact CI profile selection");

    expect(selector.run).toContain(
      'if [ -z "$BEFORE_SHA" ] || [ "$BEFORE_SHA" = "0000000000000000000000000000000000000000" ]; then',
    );
    expect(selector.run).toContain(`base_head="$(git rev-parse "\${HEAD_SHA}^")"`);
    expect(selector.run).toContain(`range="\${base_head}..\${candidate_head}"`);
  });

  it("U-IMPACTCI-WF-004: 同一HEAD transition eventだけがprior green full receiptを再利用できる", () => {
    const { steps } = loadWorkflow();
    const selector = stepByName(steps, "Impact CI profile selection");
    const regression = stepByName(steps, "test — 全回帰 (vitest run)");

    expect(transitionReuseViolations(readFileSync(WORKFLOW_PATH, "utf8"))).toEqual([]);
    expect(selector.run).toContain(
      'if [ "$full_decision" = "true" ] && { [ "$EVENT_ACTION" = "ready_for_review" ] || [ "$EVENT_ACTION" = "converted_to_draft" ]; }; then',
    );
    expect(selector.run).toContain(
      "actions/workflows/harness-check.yml/runs?event=pull_request&status=success&head_sha=",
    );
    expect(selector.run).toContain('select(.conclusion == "success")');
    expect(selector.run).toContain('select(.name == "impact-ci-full-receipt")');
    expect(selector.run).toContain(
      '[ "$receipt_tested_head" = "$candidate_head" ] && [ "$receipt_base_sha" = "$pr_base_head" ]',
    );
    expect(selector.run).toContain('|| prior_runs=""');
    expect(selector.env?.EVENT_ACTION).toBe(`\${{ github.event.action }}`);
    expect(regression.run).toContain('if [ "$IMPACT_CI_REUSE" = "true" ]; then');
    expect(regression.run).toContain('if [ -z "$IMPACT_CI_REUSE_RUN_ID" ]; then');
    expect(regression.run).toContain("reused_run_id");
    expect(regression.env?.IMPACT_CI_REUSE).toBe(`\${{ steps.impact-ci.outputs.reuse }}`);
    expect(regression.env?.IMPACT_CI_REUSE_RUN_ID).toBe(
      `\${{ steps.impact-ci.outputs.reuse_run_id }}`,
    );
  });

  it.each([
    [
      "transition event限定の欠落",
      (raw: string) =>
        raw.replace(
          'if [ "$full_decision" = "true" ] && { [ "$EVENT_ACTION" = "ready_for_review" ] || [ "$EVENT_ACTION" = "converted_to_draft" ]; }; then',
          'if [ "$full_decision" = "true" ]; then',
        ),
    ],
    [
      "prior run success絞り込みの欠落",
      (raw: string) => raw.replace('select(.conclusion == "success")', "select(true)"),
    ],
    [
      "full receipt照合の欠落",
      (raw: string) => raw.replace('select(.name == "impact-ci-full-receipt")', "select(true)"),
    ],
    [
      "base SHA一致検査の欠落",
      (raw: string) =>
        raw.replace(
          '[ "$receipt_tested_head" = "$candidate_head" ] && [ "$receipt_base_sha" = "$pr_base_head" ]',
          '[ "$receipt_tested_head" = "$candidate_head" ]',
        ),
    ],
    ["照会失敗フォールバックの欠落", (raw: string) => raw.replace(' || prior_runs=""', "")],
    [
      "receipt発行のreuse除外欠落",
      (raw: string) =>
        raw.replace(
          "needs.full-regression-preflight.outputs.reuse != 'true' }}\n        uses: actions/upload-artifact@v7\n        with:\n          name: impact-ci-full-receipt",
          "true }}\n        uses: actions/upload-artifact@v7\n        with:\n          name: impact-ci-full-receipt",
        ),
    ],
    [
      "receipt発行のfull限定欠落",
      (raw: string) =>
        raw.replace(
          "needs.full-regression-preflight.outputs.full == 'true' && needs.full-regression-preflight.outputs.reuse != 'true' }}\n        uses: actions/upload-artifact@v7\n        with:\n          name: impact-ci-full-receipt",
          "true }}\n        uses: actions/upload-artifact@v7\n        with:\n          name: impact-ci-full-receipt",
        ),
    ],
    [
      "reuse run id検証の欠落",
      (raw: string) => raw.replace('if [ -z "$IMPACT_CI_REUSE_RUN_ID" ]; then', "if false; then"),
    ],
    ["reuse receipt欠落", (raw: string) => raw.replace("reused_run_id", "reused_run_hidden")],
  ])("U-IMPACTCI-WF-004: %s mutationを拒否する", (_label, mutate) => {
    expect(transitionReuseViolations(mutate(readFileSync(WORKFLOW_PATH, "utf8")))).toContain(
      "transition_reuse_invalid",
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
    const raw = readFileSync(WORKFLOW_PATH, "utf8");
    expect(fullRegressionShardJobViolations(raw)).toEqual([]);
    expect(
      fullRegressionShardJobViolations(
        raw.replace(
          "  full-regression-bulk-1:\n",
          "  full-regression-bulk-1:\n    continue-on-error: true\n",
        ),
      ),
    ).toContain("job_fail_open_field");
    expect(
      fullRegressionShardJobViolations(
        raw.replace(
          "- name: validate exact shard receipt set",
          "- name: doctor (governance hard gates)\n        run: true\n      - name: validate exact shard receipt set",
        ),
      ),
    ).toContain("finalize_gate_order_invalid");
  });

  it("U-FULLSHARD-WF-001: preflight／3 shard／finalizeをtyped artifactで接続する", () => {
    expect(fullRegressionShardJobViolations(readFileSync(WORKFLOW_PATH, "utf8"))).toEqual([]);
  });

  it("U-FULLSHARD-WF-002: receipt exact set後のfinalizeとfail-closeを維持する", () => {
    const raw = readFileSync(WORKFLOW_PATH, "utf8");
    expect(
      fullRegressionShardJobViolations(
        raw.replaceAll("full-regression-shard-receipt-stateful", "missing-stateful"),
      ),
    ).toContain("finalize_contract_invalid");
    expect(
      fullRegressionShardJobViolations(
        raw.replace(
          "- name: validate exact shard receipt set",
          "- name: doctor (governance hard gates)\n        run: true\n      - name: validate exact shard receipt set",
        ),
      ),
    ).toContain("finalize_gate_order_invalid");
  });

  it.each([
    [
      "finalizeからstateful receiptを除去",
      (raw: string) => raw.replaceAll("full-regression-shard-receipt-stateful", "missing-stateful"),
      "finalize_contract_invalid",
    ],
    [
      "bulk-2を別partitionへすり替え",
      (raw: string) => raw.replaceAll("--shard-id bulk-2", "--shard-id bulk-1"),
      "shard_contract_invalid:bulk-2",
    ],
    [
      "required checkをpreflightへ短絡",
      (raw: string) => raw.replace("full-regression-finalize]", "full-regression-preflight]"),
      "required_check_wiring_invalid",
    ],
    [
      "旧in-job worktree shardを再導入",
      (raw: string) =>
        raw.replace(
          "exit 0\n          else",
          "git worktree add --detach /tmp/legacy HEAD\n            exit 0\n          else",
        ),
      "legacy_in_job_shard_path_present",
    ],
    [
      "finalizeのalways集約を削除",
      (raw: string) =>
        raw.replace(
          "      - full-regression-stateful\n    if: ${{ always() }}",
          "      - full-regression-stateful\n    if: ${{ success() }}",
        ),
      "finalize_admission_invalid",
    ],
    [
      "finalizeからcandidate HEAD束縛を除去",
      (raw: string) =>
        raw.replaceAll("needs.full-regression-preflight.outputs.candidate_head", "github.sha"),
      "finalize_admission_invalid",
    ],
    [
      "doctorをreceipt検証前へ移動",
      (raw: string) =>
        raw.replace(
          "- name: validate exact shard receipt set",
          "- name: doctor (governance hard gates)\n        run: true\n      - name: validate exact shard receipt set",
        ),
      "finalize_gate_order_invalid",
    ],
  ])("U-FULLSHARD-WF-002: %s mutationを拒否する", (_label, mutate, expected) => {
    expect(fullRegressionShardJobViolations(mutate(readFileSync(WORKFLOW_PATH, "utf8")))).toContain(
      expected,
    );
  });
});

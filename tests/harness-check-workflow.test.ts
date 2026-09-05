// PLAN-L7-426-development-ci-bounded-time / PLAN-L7-462-issue-closure-contract
// PLAN-L7-502-worker-independent-review
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// PLAN-L7-657-distribution-lite-consumer-canary
// U-DISTCAN-008a: required Windows jobへLite canaryを配線する。
import { parse as parseYaml } from "yaml";

const WORKFLOW_PATH = ".github/workflows/harness-check.yml";
const ISOLATION_BACKEND_SCRIPT_PATH = ".github/scripts/install-bubblewrap.sh";
const VERSION_ID_GUARD = "${" + "VERSION_ID:-}";
const VERSION_CODENAME_GUARD = "${" + "VERSION_CODENAME:-}";
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
    [jobName: string]: HarnessJob | undefined;
    "harness-check"?: HarnessJob;
    "lite-consumer-canary-artifact"?: HarnessJob;
    "windows-durability-smoke"?: HarnessJob;
    "full-regression-preflight"?: HarnessJob;
    "full-regression-bulk-1"?: HarnessJob;
    "full-regression-bulk-2"?: HarnessJob;
    "full-regression-bulk-3"?: HarnessJob;
    "full-regression-stateful"?: HarnessJob;
    "full-regression-finalize"?: HarnessJob;
  };
};

const PR_OR_MAIN_CHECKOUT_REF = "${{ github.event.pull_request.head.sha || github.sha }}";
const PREFLIGHT_CHECKOUT_REF = "${{ needs.full-regression-preflight.outputs.candidate_head }}";
const REQUIRED_FINALIZE_SHARD_SUCCESS_CHECKS = [
  '[ "$BULK_1_RESULT" = "success" ]',
  '[ "$BULK_2_RESULT" = "success" ]',
  '[ "$BULK_3_RESULT" = "success" ]',
  '[ "$STATEFUL_RESULT" = "success" ]',
] as const;
const ZERO_SHA = "0000000000000000000000000000000000000000";

function mutateWorkflowJob(raw: string, jobName: string, mutate: (job: string) => string): string {
  const startMarker = `  ${jobName}:`;
  const start = raw.indexOf(startMarker);
  if (start < 0) return raw;
  const nextJobPattern = /\n {2}[^\s][^\n]*:\n/g;
  nextJobPattern.lastIndex = start + startMarker.length;
  const nextJob = nextJobPattern.exec(raw);
  const end = nextJob?.index ?? raw.length;
  if (end < 0) return raw;
  return `${raw.slice(0, start)}${mutate(raw.slice(start, end))}${raw.slice(end)}`;
}

function mutateWorkflowStep(
  raw: string,
  stepName: string,
  mutate: (step: string) => string,
): string {
  const startMarker = `      - name: ${stepName}`;
  const start = raw.indexOf(startMarker);
  if (start < 0) return raw;
  const nextStep = raw.indexOf("\n      - name:", start + startMarker.length);
  const end = nextStep < 0 ? raw.length : nextStep;
  return `${raw.slice(0, start)}${mutate(raw.slice(start, end))}${raw.slice(end)}`;
}

function fullRegressionShardJobViolations(raw: string): string[] {
  const parsed = parseYaml(raw) as WorkflowRoot;
  const jobs = parsed.jobs ?? {};
  const preflight = jobs["full-regression-preflight"];
  const shards = [
    jobs["full-regression-bulk-1"],
    jobs["full-regression-bulk-2"],
    jobs["full-regression-bulk-3"],
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
  const timeoutChecks: Array<[string, HarnessJob | undefined, number]> = [
    ["full-regression-preflight", preflight, 35],
    ["full-regression-bulk-1", shards[0], 25],
    ["full-regression-bulk-2", shards[1], 25],
    ["full-regression-bulk-3", shards[2], 25],
    ["full-regression-stateful", shards[3], 30],
    ["full-regression-finalize", finalize, 15],
  ];
  for (const [jobName, job, expectedTimeout] of timeoutChecks) {
    if (job?.["timeout-minutes"] !== expectedTimeout) {
      findings.push(`job_timeout_invalid:${jobName}`);
    }
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
    const shardId = ["bulk-1", "bulk-2", "bulk-3", "stateful"][index];
    const checkout = job?.steps?.find((step) => step.name === "checkout");
    if (checkout?.with?.["fetch-depth"] !== 0) {
      findings.push(`shard_checkout_history_invalid:${shardId}`);
    }
    if (checkout?.with?.ref !== PR_OR_MAIN_CHECKOUT_REF) {
      findings.push(`shard_checkout_ref_invalid:${shardId}`);
    }
    if (
      !text.includes("full-regression-shard-plan") ||
      !text.includes(`--shard-id ${shardId}`) ||
      !text.includes("full-regression-shards.ts receipt") ||
      !text.includes("full-regression-shard-receipt") ||
      !text.includes("record shard budget telemetry") ||
      !text.includes("SHARD_TIMEOUT_MINUTES") ||
      text.includes("continue-on-error")
    ) {
      findings.push(`shard_contract_invalid:${shardId}`);
    }
  }
  const finalizeText = JSON.stringify(finalize);
  const finalizeRunText = (finalize?.steps ?? []).map((step) => step.run ?? "").join("\n");
  if (REQUIRED_FINALIZE_SHARD_SUCCESS_CHECKS.some((check) => !finalizeRunText.includes(check))) {
    findings.push("finalize_shard_fail_close_invalid");
  }
  const finalizeCheckout = finalize?.steps?.find((step) => step.name === "checkout");
  if (finalizeCheckout?.with?.["fetch-depth"] !== 0) {
    findings.push("finalize_checkout_history_invalid");
  }
  if (finalizeCheckout?.with?.ref !== PR_OR_MAIN_CHECKOUT_REF) {
    findings.push("finalize_checkout_ref_invalid");
  }
  if (
    !finalizeText.includes("full-regression-shards.ts validate") ||
    !finalizeText.includes("full-regression-shard-receipt-bulk-1") ||
    !finalizeText.includes("full-regression-shard-receipt-bulk-2") ||
    !finalizeText.includes("full-regression-shard-receipt-bulk-3") ||
    !finalizeText.includes("full-regression-shard-receipt-stateful") ||
    !finalizeText.includes("classify shard outcome telemetry") ||
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
      "full-regression-bulk-3",
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

// PLAN-RECOVERY-98-schedule-ci-range-normalization — U-IMPACTCI-WF-006
function nonPullRequestRangeViolations(raw: string): string[] {
  let parsed: WorkflowRoot;
  try {
    parsed = parseYaml(raw) as WorkflowRoot;
  } catch {
    return ["workflow_yaml_invalid"];
  }
  const steps = parsed.jobs?.["full-regression-preflight"]?.steps ?? [];
  const findings: string[] = [];
  for (const stepName of ["branch-kind-check", "commitlint"] as const) {
    const step = steps.find((candidate) => candidate.name === stepName);
    const run = step?.run ?? "";
    if (
      !run.includes(`elif [ -z "$BEFORE_SHA" ] || [ "$BEFORE_SHA" = "${ZERO_SHA}" ]; then`) ||
      !run.includes(`range="\${HEAD_SHA}^..\${HEAD_SHA}"`)
    ) {
      findings.push(`non_pr_range_invalid:${stepName}`);
    }
  }
  return findings;
}

const LINUX_HARNESS_JOBS = [
  "lite-consumer-canary-artifact",
  "full-regression-preflight",
  "full-regression-bulk-1",
  "full-regression-bulk-2",
  "full-regression-bulk-3",
  "full-regression-stateful",
  "full-regression-finalize",
  "harness-check",
] as const;

function linuxRunnerViolations(raw: string): string[] {
  let parsed: WorkflowRoot;
  try {
    parsed = parseYaml(raw) as WorkflowRoot;
  } catch {
    return ["workflow_yaml_invalid"];
  }
  const jobs = parsed.jobs ?? {};
  const findings = LINUX_HARNESS_JOBS.flatMap((jobName) =>
    jobs[jobName]?.["runs-on"] === "ubuntu-24.04" ? [] : [`linux_runner_invalid:${jobName}`],
  );
  const requiredLinuxJobs = new Set<string>(LINUX_HARNESS_JOBS);
  for (const [jobName, job] of Object.entries(jobs)) {
    const runner = job?.["runs-on"];
    if (
      !requiredLinuxJobs.has(jobName) &&
      typeof runner === "string" &&
      runner.startsWith("ubuntu-") &&
      runner !== "ubuntu-24.04"
    ) {
      findings.push(`linux_runner_invalid:${jobName}`);
    }
  }
  return findings;
}

function boundedAptViolations(script: string): string[] {
  return script.split("\n").flatMap((line, index) => {
    if (!/\bapt-get\s+(update|install)\b/.test(line)) return [];
    return /\bsudo\s+timeout\s+180s\b/.test(line) ? [] : [`apt_invocation_unbounded:${index + 1}`];
  });
}

function isolationBackendWorkflowViolations(raw: string, script: string): string[] {
  let parsed: WorkflowRoot;
  try {
    parsed = parseYaml(raw) as WorkflowRoot;
  } catch {
    return ["workflow_yaml_invalid"];
  }
  const jobs = parsed.jobs ?? {};
  const findings: string[] = [];
  for (const jobName of ["full-regression-preflight", "full-regression-stateful"] as const) {
    const steps = jobs[jobName]?.steps ?? [];
    const step = steps.find(
      (candidate) => candidate.name === "install required Linux isolation backend",
    );
    if (step?.run !== `bash ${ISOLATION_BACKEND_SCRIPT_PATH}`) {
      findings.push(`isolation_backend_step_invalid:${jobName}`);
    }
  }
  if (raw.match(/\bapt-get\s+(update|install)\b/)) findings.push("workflow_raw_apt_invocation");
  if (!script.includes(VERSION_ID_GUARD) || !script.includes('"24.04"')) {
    findings.push("runner_version_guard_missing");
  }
  if (!script.includes(VERSION_CODENAME_GUARD)) {
    findings.push("runner_codename_guard_missing");
  }
  findings.push(...boundedAptViolations(script));
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
  // PLAN-RECOVERY-108-ci-isolation-backend-bounded — U-CIISO-001/U-CIISO-002
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

  it("U-IMPACTCI-WF-006: schedule／workflow_dispatchの空before SHAをHEAD親へ正規化する", () => {
    expect(nonPullRequestRangeViolations(readFileSync(WORKFLOW_PATH, "utf8"))).toEqual([]);
  });

  it("U-CIISO-001: Linux required jobsのrunner releaseをsource codenameと固定する", () => {
    const source = readFileSync(WORKFLOW_PATH, "utf8");
    expect(linuxRunnerViolations(source)).toEqual([]);
    for (const runner of ["ubuntu-latest", "ubuntu-22.04"]) {
      const raw = source.replaceAll("ubuntu-24.04", runner);
      expect(linuxRunnerViolations(raw)).toHaveLength(LINUX_HARNESS_JOBS.length);
    }
    const raw = source.replace(
      "\njobs:\n",
      "\njobs:\n  future-linux-job:\n    runs-on: ubuntu-latest\n",
    );
    expect(raw).not.toBe(source);
    expect(linuxRunnerViolations(raw)).toContain("linux_runner_invalid:future-linux-job");
  });

  it("U-CIISO-002: bubblewrap導入をbounded apt helperへ集約する", () => {
    const raw = readFileSync(WORKFLOW_PATH, "utf8");
    const script = readFileSync(ISOLATION_BACKEND_SCRIPT_PATH, "utf8");
    expect(isolationBackendWorkflowViolations(raw, script)).toEqual([]);
    for (const mutate of [
      (script: string) =>
        script.replace(
          "sudo timeout 180s env DEBIAN_FRONTEND=noninteractive apt-get update",
          "sudo env DEBIAN_FRONTEND=noninteractive apt-get update",
        ),
      (script: string) =>
        script.replace(
          "sudo timeout 180s env DEBIAN_FRONTEND=noninteractive apt-get install",
          "sudo env DEBIAN_FRONTEND=noninteractive apt-get install",
        ),
    ]) {
      const raw = readFileSync(WORKFLOW_PATH, "utf8");
      const script = mutate(readFileSync(ISOLATION_BACKEND_SCRIPT_PATH, "utf8"));
      expect(isolationBackendWorkflowViolations(raw, script)).toEqual([
        expect.stringMatching(/^apt_invocation_unbounded:/),
      ]);
    }
  });

  it.each(["branch-kind-check", "commitlint"] as const)(
    "U-IMPACTCI-WF-006: %sのempty before SHA判定を除去するmutationを拒否する",
    (stepName) => {
      const raw = readFileSync(WORKFLOW_PATH, "utf8");
      const mutated = mutateWorkflowStep(raw, stepName, (step) =>
        step.replace(
          `elif [ -z "$BEFORE_SHA" ] || [ "$BEFORE_SHA" = "${ZERO_SHA}" ]; then`,
          `elif [ "$BEFORE_SHA" = "${ZERO_SHA}" ]; then`,
        ),
      );
      expect(mutated).not.toBe(raw);
      expect(nonPullRequestRangeViolations(mutated)).toContain(`non_pr_range_invalid:${stepName}`);
    },
  );

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
    const isolationScript = readFileSync(ISOLATION_BACKEND_SCRIPT_PATH, "utf8");

    expect(install.run).toBe(`bash ${ISOLATION_BACKEND_SCRIPT_PATH}`);
    expect(isolationScript).toContain('"Dir::Etc::sourcelist=$source_list"');
    expect(isolationScript).toContain("-o Dir::Etc::sourceparts=-");
    expect(isolationScript).toContain("archive.ubuntu.com/ubuntu $codename main universe");
    expect(isolationScript).toContain(
      "security.ubuntu.com/ubuntu $codename-security main universe",
    );
    expect(isolationScript).toContain(`dpkg-query -W -f='\${Status}' bubblewrap`);
    expect(isolationScript).toContain("sudo timeout 180s");
    expect(isolationScript).toContain("Acquire::Retries=3");
    expect(isolationScript).toContain("Acquire::http::Timeout=30");
    expect(isolationScript).toContain("Acquire::https::Timeout=30");
    expect(isolationScript).toContain("test -x /usr/bin/bwrap");
    expect(isolationScript).toContain("apt-get install -y --no-install-recommends bubblewrap");
    expect(isolationScript).toContain("kernel.apparmor_restrict_unprivileged_userns=0");
    expect(isolationScript).toContain("sysctl -n kernel.apparmor_restrict_unprivileged_userns");
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
    expect(liteCanaryJob["runs-on"]).toBe("ubuntu-24.04");
    expect(build.run).toContain("distribution package-profile");
    expect(build.run).toContain(`> "\${RUNNER_TEMP}/lite-canary/receipt.json"`);
    expect(linux.env?.HELIX_LITE_CANARY_RECEIPT).toContain("receipt.json");
    expect(linux.run).toContain("tests/distribution-lite-consumer-canary.test.ts");
    expect(upload.uses).toBe("actions/upload-artifact@043fb46d1a93c77aae656e7c1c64a875d1fc6a0a");
    expect(upload.with?.name).toBe("lite-consumer-canary");
    expect(windowsJob.needs).toBe("lite-consumer-canary-artifact");
    expect(download.uses).toBe(
      "actions/download-artifact@3e5f45b2cfb9172054b4087a40e8e0b5a5461e7c",
    );
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

  it("U-MPS-PRE-003: runs post-merge PLAN status before authority and full regression", () => {
    const { steps } = loadWorkflow();
    const planLintIndex = steps.findIndex((step) => step.name === "plan-lint");
    const postMergeIndex = steps.findIndex((step) => step.name === "post-merge PLAN status");
    const authorityIndex = steps.findIndex(
      (step) => step.name === "L1-L12 canonical authority drift gate",
    );
    const postMerge = steps[postMergeIndex];

    expect(postMerge?.run).toBe(
      "npx --no-install tsx src/cli.ts plan lint --gate post-merge-status",
    );
    expect(postMerge?.["continue-on-error"]).toBeUndefined();
    expect(postMergeIndex).toBe(planLintIndex + 1);
    expect(postMergeIndex).toBeLessThan(authorityIndex);
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
    // PLAN-RECOVERY-1543-reviewer-session-model-history — U-GWIDADM-023: metadata-only 例外の base は
    // CI が確定した merge-base を明示で渡す（admission 側で env / merge-base / HEAD^1 を推測しない）。
    expect(closureGuard.run).toContain('--base-head "$merge_base"');
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
          "needs.full-regression-preflight.outputs.reuse != 'true' }}\n        uses: actions/upload-artifact@043fb46d1a93c77aae656e7c1c64a875d1fc6a0a\n        with:\n          name: impact-ci-full-receipt",
          "true }}\n        uses: actions/upload-artifact@043fb46d1a93c77aae656e7c1c64a875d1fc6a0a\n        with:\n          name: impact-ci-full-receipt",
        ),
    ],
    [
      "receipt発行のfull限定欠落",
      (raw: string) =>
        raw.replace(
          "needs.full-regression-preflight.outputs.full == 'true' && needs.full-regression-preflight.outputs.reuse != 'true' }}\n        uses: actions/upload-artifact@043fb46d1a93c77aae656e7c1c64a875d1fc6a0a\n        with:\n          name: impact-ci-full-receipt",
          "true }}\n        uses: actions/upload-artifact@043fb46d1a93c77aae656e7c1c64a875d1fc6a0a\n        with:\n          name: impact-ci-full-receipt",
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

    const parsed = parseYaml(readFileSync(WORKFLOW_PATH, "utf8")) as WorkflowRoot;
    expect(parsed.jobs?.["full-regression-bulk-1"]?.["timeout-minutes"]).toBe(25);
    expect(parsed.jobs?.["full-regression-bulk-2"]?.["timeout-minutes"]).toBe(25);
    expect(parsed.jobs?.["full-regression-bulk-3"]?.["timeout-minutes"]).toBe(25);
    expect(parsed.jobs?.["full-regression-stateful"]?.["timeout-minutes"]).toBe(30);
    expect(parsed.jobs?.["full-regression-finalize"]?.["timeout-minutes"]).toBe(15);
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
    expect(
      fullRegressionShardJobViolations(
        mutateWorkflowJob(raw, "full-regression-bulk-1", (job) =>
          job.replace(
            `          ref: ${PR_OR_MAIN_CHECKOUT_REF}\n          fetch-depth: 0`,
            `          ref: ${PR_OR_MAIN_CHECKOUT_REF}`,
          ),
        ),
      ),
    ).toContain("shard_checkout_history_invalid:bulk-1");
    expect(
      fullRegressionShardJobViolations(
        mutateWorkflowJob(raw, "full-regression-bulk-1", (job) =>
          job.replace(
            `          ref: ${PR_OR_MAIN_CHECKOUT_REF}`,
            `          ref: ${PREFLIGHT_CHECKOUT_REF}`,
          ),
        ),
      ),
    ).toContain("shard_checkout_ref_invalid:bulk-1");
  });

  it("U-FULLSHARD-WF-003: shard job timeoutをbounded contractへ固定する", () => {
    const raw = readFileSync(WORKFLOW_PATH, "utf8");
    expect(
      fullRegressionShardJobViolations(
        mutateWorkflowJob(raw, "full-regression-bulk-1", (job) =>
          job.replace("    timeout-minutes: 25", "    timeout-minutes: 26"),
        ),
      ),
    ).toContain("job_timeout_invalid:full-regression-bulk-1");
  });

  it("U-FULLSHARD-WF-004: finalizeは全shardのjob_result successをfail-closeで要求する", () => {
    const raw = readFileSync(WORKFLOW_PATH, "utf8");
    expect(fullRegressionShardJobViolations(raw)).toEqual([]);
    for (const check of REQUIRED_FINALIZE_SHARD_SUCCESS_CHECKS) {
      expect(fullRegressionShardJobViolations(raw.replace(check, "true"))).toContain(
        "finalize_shard_fail_close_invalid",
      );
    }
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

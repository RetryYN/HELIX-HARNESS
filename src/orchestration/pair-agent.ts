import { type AdapterPlan, buildAdapterPlan } from "../runtime/adapter";
import type { ExecutionMode, RuntimeDetection } from "../runtime/detect";
import { assignCross, type CrossAssign, type Provider, type RouterRole } from "../task/tier-router";
import { MODEL_IDS, type TaskDifficulty } from "../team/model-policy";

export type PairAgentPhaseName = "smart_test_author" | "light_implementation" | "smart_review";

export type PairAgentFindingSeverity = "error" | "warn";

export interface PairAgentFinding {
  code: string;
  severity: PairAgentFindingSeverity;
  message: string;
}

export interface PairAgentIdentity {
  key: "smart-review-agent" | "light-implementation-agent";
  provider: Provider;
  role: RouterRole;
  tier: "T0" | "T2";
  model: string;
  closingAuthority: boolean;
  responsibilities: string[];
}

export interface PairAgentPhase {
  index: number;
  name: PairAgentPhaseName;
  agentKey: PairAgentIdentity["key"];
  dependsOn: PairAgentPhaseName[];
  prompt: string;
  requiredEvidence: string[];
  onFail: PairAgentPhaseName | null;
}

export interface PairAgentTddPlan {
  ok: boolean;
  status: "ready" | "blocked";
  planId: string;
  task: string;
  reviewKind: CrossAssign["review_kind"];
  cross: CrossAssign;
  executionAuthorized: boolean;
  frontierApprovalRequired: boolean;
  maxFixCycles: number;
  agents: PairAgentIdentity[];
  phases: PairAgentPhase[];
  gates: string[];
  findings: PairAgentFinding[];
}

export interface PairAgentTddPlanInput {
  planId: string;
  task: string;
  detection: RuntimeDetection;
  primary?: Provider;
  allowFrontier?: boolean;
  maxFixCycles?: number;
  difficulty?: TaskDifficulty;
}

export type PairAgentStepStatus = "planned" | "passed" | "failed" | "error" | "pending";

export interface PairAgentRunStep {
  phase: PairAgentPhaseName;
  agentKey: PairAgentIdentity["key"];
  provider: Provider;
  model: string;
  cycle: number;
  status: PairAgentStepStatus;
  verdict: "pass" | "fail" | "error" | "pending" | null;
  exitCode: number | null;
}

export interface PairAgentTranscriptEntry extends PairAgentRunStep {
  outputExcerpt: string;
}

export interface PairAgentExecutionResult {
  status: number | null;
  stdout: string;
  stderr: string;
}

export type PairAgentPhaseExecutor = (input: {
  phase: PairAgentPhase;
  agent: PairAgentIdentity;
  adapterPlan: AdapterPlan;
  cycle: number;
}) => Promise<PairAgentExecutionResult>;

export interface PairAgentRunResult {
  ok: boolean;
  status: "planned" | "passed" | "failed" | "blocked" | "error";
  finalVerdict: "pass" | "fail" | "error" | "pending" | null;
  steps: PairAgentRunStep[];
  transcript: PairAgentTranscriptEntry[];
  findings: PairAgentFinding[];
}

function hasText(value: string): boolean {
  return value.trim().length > 0;
}

function smartModel(provider: Provider): string {
  return provider === "codex" ? MODEL_IDS.codex.frontier : MODEL_IDS.claude.opus;
}

function lightModel(provider: Provider): string {
  return provider === "codex" ? MODEL_IDS.codex.spark : MODEL_IDS.claude.haiku;
}

function smartTestPrompt(input: { planId: string; task: string }): string {
  return [
    `Plan ${input.planId}: act as the smart review agent and start the TDD pair loop by writing the test/oracle first.`,
    `Task: ${input.task}`,
    "Read the paired design/test-design artifacts before editing.",
    "Create or update the failing test, acceptance oracle, or test-design row before product implementation.",
    "Run the targeted test in Red state and record RED_TEST_COMMAND plus a non-zero RED_EXIT_CODE before implementation.",
    "Record the expected Red failure and the exact evidence path. Do not approve implementation in this phase.",
  ].join("\n");
}

function lightImplementationPrompt(input: { planId: string; task: string }): string {
  return [
    `Plan ${input.planId}: act as the lightweight implementation agent.`,
    `Task: ${input.task}`,
    "Implement only the minimum product change needed to satisfy the smart agent's failing test/oracle.",
    "If the oracle is ambiguous, return a consultation question instead of inventing scope.",
    "Run the targeted test and report changed files, command evidence, and any remaining failure.",
    "You cannot close the PLAN or approve your own work.",
  ].join("\n");
}

function smartReviewPrompt(input: { planId: string; task: string }): string {
  return [
    `Plan ${input.planId}: act as the smart review agent for the TDD pair loop.`,
    `Task: ${input.task}`,
    "Review the lightweight implementation against the test/oracle, design trace, security boundary, and changed files.",
    "Run or require the targeted tests. If failing, give concrete fix instructions and route back to light_implementation.",
    "End with exactly one machine-readable line: VERDICT: pass|fail|error|pending.",
  ].join("\n");
}

function boundedTranscriptOutput(output: string): string {
  const normalized = output.trim();
  if (normalized.length <= 4000) return normalized;
  return `${normalized.slice(0, 4000)}\n[truncated]`;
}

function transcriptForPrompt(transcript: PairAgentTranscriptEntry[]): string {
  if (transcript.length === 0) return "";
  const recent = transcript.slice(-6);
  return [
    "",
    "PAIR TRANSCRIPT (bounded, newest instructions must be honored):",
    ...recent.map((entry) =>
      [
        `--- ${entry.phase} cycle=${entry.cycle} status=${entry.status} verdict=${entry.verdict ?? "null"} ---`,
        entry.outputExcerpt || "(no output)",
      ].join("\n"),
    ),
  ].join("\n");
}

function promptWithTranscript(
  phase: PairAgentPhase,
  transcript: PairAgentTranscriptEntry[],
): string {
  if (transcript.length === 0) return phase.prompt;
  return `${phase.prompt}${transcriptForPrompt(transcript)}`;
}

export function buildPairAgentTddPlan(input: PairAgentTddPlanInput): PairAgentTddPlan {
  const findings: PairAgentFinding[] = [];
  const maxFixCycles = input.maxFixCycles ?? 3;
  if (!hasText(input.planId)) {
    findings.push({
      code: "missing-plan-id",
      severity: "error",
      message: "pair-agent plan requires a PLAN id",
    });
  }
  if (!hasText(input.task)) {
    findings.push({
      code: "missing-task",
      severity: "error",
      message: "pair-agent plan requires task text",
    });
  }
  if (!Number.isInteger(maxFixCycles) || maxFixCycles < 1) {
    findings.push({
      code: "invalid-max-fix-cycles",
      severity: "error",
      message: "maxFixCycles must be a positive integer",
    });
  }

  const cross = assignCross(input.detection, input.primary);
  const frontierApprovalRequired = !input.allowFrontier;
  if (frontierApprovalRequired) {
    findings.push({
      code: "frontier-approval-required",
      severity: "warn",
      message: "smart review agent uses T0 and needs explicit frontier approval before execution",
    });
  }
  if (cross.review_kind !== "cross_agent") {
    findings.push({
      code: "intra-runtime-subagent-fallback",
      severity: "warn",
      message: "only one provider is available; pair loop is not cross-provider judgement evidence",
    });
  }

  const smartAgent: PairAgentIdentity = {
    key: "smart-review-agent",
    provider: cross.judgement,
    role: "qa",
    tier: "T0",
    model: smartModel(cross.judgement),
    closingAuthority: true,
    responsibilities: ["test_authoring", "instruction", "test_execution", "review_verdict"],
  };
  const lightAgent: PairAgentIdentity = {
    key: "light-implementation-agent",
    provider: cross.execution,
    role: "se",
    tier: "T2",
    model: lightModel(cross.execution),
    closingAuthority: false,
    responsibilities: ["implementation", "consultation", "fix_iteration"],
  };

  const promptInput = { planId: input.planId.trim(), task: input.task.trim() };
  const phases: PairAgentPhase[] = [
    {
      index: 1,
      name: "smart_test_author",
      agentKey: smartAgent.key,
      dependsOn: [],
      prompt: smartTestPrompt(promptInput),
      requiredEvidence: [
        "red_evidence",
        "red_test_command",
        "red_exit_code_nonzero",
        "acceptance_oracle",
        "test_design_trace",
      ],
      onFail: null,
    },
    {
      index: 2,
      name: "light_implementation",
      agentKey: lightAgent.key,
      dependsOn: ["smart_test_author"],
      prompt: lightImplementationPrompt(promptInput),
      requiredEvidence: ["changed_files", "targeted_test_command", "implementation_notes"],
      onFail: "smart_test_author",
    },
    {
      index: 3,
      name: "smart_review",
      agentKey: smartAgent.key,
      dependsOn: ["light_implementation"],
      prompt: smartReviewPrompt(promptInput),
      requiredEvidence: ["green_evidence", "review_findings", "verdict_line"],
      onFail: "light_implementation",
    },
  ];

  const hasErrors = findings.some((finding) => finding.severity === "error");
  return {
    ok: !hasErrors,
    status: hasErrors ? "blocked" : "ready",
    planId: promptInput.planId,
    task: promptInput.task,
    reviewKind: cross.review_kind,
    cross,
    executionAuthorized: !hasErrors && Boolean(input.allowFrontier),
    frontierApprovalRequired,
    maxFixCycles,
    agents: [smartAgent, lightAgent],
    phases,
    gates: [
      "smart-agent-writes-test-first",
      "red-evidence-before-implementation",
      "red-test-command-and-nonzero-exit-before-implementation",
      "light-agent-cannot-close",
      "light-implementation-requires-evidence-or-consultation",
      "consultation-routes-to-smart-instruction",
      "smart-agent-runs-tests-and-reviews",
      "smart-review-requires-explicit-verdict-line",
      "pass-verdict-requires-green-and-review-evidence",
      "fail-verdict-requires-fix-instruction",
      "pending-verdict-requires-continuation-directive",
      "fail-verdict-routes-back-to-light-implementation",
      "max-fix-cycles-enforced",
    ],
    findings,
  };
}

export function buildPairAgentAdapterPlans(input: {
  plan: PairAgentTddPlan;
  mode: ExecutionMode;
  execute?: boolean;
}): AdapterPlan[] {
  const agents = new Map(input.plan.agents.map((agent) => [agent.key, agent]));
  return input.plan.phases.map((phase) => {
    const agent = agents.get(phase.agentKey);
    if (!agent) {
      throw new Error(`missing pair-agent identity for phase ${phase.name}`);
    }
    return buildAdapterPlan(
      {
        provider: agent.provider,
        role: agent.role,
        task: phase.prompt,
        planId: input.plan.planId,
        model: agent.model,
        execute: input.execute,
      },
      input.mode,
    );
  });
}

function parsePairAgentVerdict(output: string): "pass" | "fail" | "error" | "pending" {
  const match = output.match(/\bVERDICT\s*[:=]\s*(pass|fail|error|pending)\b/i);
  return match ? (match[1]?.toLowerCase() as "pass" | "fail" | "error" | "pending") : "pending";
}

function hasReviewVerdictLine(output: string): boolean {
  return /\bVERDICT\s*[:=]\s*(pass|fail|error|pending)\b/i.test(output);
}

function hasRedEvidence(output: string): boolean {
  return /\b(RED_EVIDENCE|RED_ORACLE|FAILING_TEST|RED)\b\s*[:=]/i.test(output);
}

function hasOracleEvidence(output: string): boolean {
  return /\b(ACCEPTANCE_ORACLE|TEST_DESIGN_TRACE|RED_ORACLE|ORACLE)\b\s*[:=]/i.test(output);
}

function hasRedTestCommand(output: string): boolean {
  return /\b(RED_TEST_COMMAND|RED_COMMAND)\b\s*[:=]\s*\S+/i.test(output);
}

function hasNonZeroRedExitCode(output: string): boolean {
  const match = output.match(/\b(RED_EXIT_CODE|RED_STATUS)\b\s*[:=]\s*(-?\d+)\b/i);
  return match ? Number(match[2]) !== 0 : false;
}

function hasGreenEvidence(output: string): boolean {
  return /\b(GREEN_EVIDENCE|TARGETED_TEST|TEST_COMMAND|PASSING_TEST)\b\s*[:=]/i.test(output);
}

function hasReviewEvidence(output: string): boolean {
  return /\b(REVIEW_FINDINGS?|REVIEW|FINDING|NO_FINDINGS)\b\s*[:=]/i.test(output);
}

function hasFixInstruction(output: string): boolean {
  return /\b(FIX_INSTRUCTION|IMPLEMENTATION_DIRECTIVE|CONSULTATION_RESPONSE)\b\s*[:=]/i.test(
    output,
  );
}

function hasChangedFilesEvidence(output: string): boolean {
  return /\b(CHANGED_FILES|FILES_CHANGED|MODIFIED_FILES)\b\s*[:=]/i.test(output);
}

function hasTargetedTestCommand(output: string): boolean {
  return /\b(TARGETED_TEST_COMMAND|TARGETED_TEST|TEST_COMMAND)\b\s*[:=]/i.test(output);
}

function hasImplementationNotes(output: string): boolean {
  return /\b(IMPLEMENTATION_NOTES|IMPLEMENTATION_NOTE|CHANGE_SUMMARY)\b\s*[:=]/i.test(output);
}

function hasConsultationQuestion(output: string): boolean {
  return /\b(CONSULTATION_QUESTION|CLARIFICATION_NEEDED|QUESTION)\b\s*[:=]/i.test(output);
}

function hasConsultationResponse(output: string): boolean {
  return /\b(FIX_INSTRUCTION|IMPLEMENTATION_DIRECTIVE|CONSULTATION_RESPONSE)\b\s*[:=]/i.test(
    output,
  );
}

function stepStatusFromReviewVerdict(
  verdict: "pass" | "fail" | "error" | "pending",
): PairAgentStepStatus {
  if (verdict === "pass") return "passed";
  if (verdict === "fail") return "failed";
  return verdict;
}

export async function runPairAgentTddPlan(input: {
  plan: PairAgentTddPlan;
  mode: ExecutionMode;
  execute: boolean;
  executor?: PairAgentPhaseExecutor;
}): Promise<PairAgentRunResult> {
  const agents = new Map(input.plan.agents.map((agent) => [agent.key, agent]));
  const phases = new Map(input.plan.phases.map((phase) => [phase.name, phase]));
  const findings = [...input.plan.findings];
  const steps: PairAgentRunStep[] = [];
  const transcript: PairAgentTranscriptEntry[] = [];

  const appendPlanned = (phase: PairAgentPhase, cycle: number): void => {
    const agent = agents.get(phase.agentKey);
    if (!agent) return;
    steps.push({
      phase: phase.name,
      agentKey: phase.agentKey,
      provider: agent.provider,
      model: agent.model,
      cycle,
      status: "planned",
      verdict: null,
      exitCode: null,
    });
  };

  if (!input.execute) {
    for (const phase of input.plan.phases) appendPlanned(phase, 0);
    return { ok: true, status: "planned", finalVerdict: null, steps, transcript, findings };
  }

  if (!input.plan.executionAuthorized) {
    findings.push({
      code: "execution-not-authorized",
      severity: "error",
      message: "pair-agent run requires explicit frontier approval before executing T0 phases",
    });
    return { ok: false, status: "blocked", finalVerdict: null, steps, transcript, findings };
  }
  if (!input.executor) {
    findings.push({
      code: "missing-executor",
      severity: "error",
      message: "pair-agent run requires an executor when execute=true",
    });
    return { ok: false, status: "blocked", finalVerdict: null, steps, transcript, findings };
  }

  const executePhase = async (
    phaseName: PairAgentPhaseName,
    cycle: number,
  ): Promise<PairAgentRunStep> => {
    const phase = phases.get(phaseName);
    if (!phase) throw new Error(`unknown pair-agent phase: ${phaseName}`);
    const agent = agents.get(phase.agentKey);
    if (!agent) throw new Error(`missing pair-agent identity: ${phase.agentKey}`);
    const adapterPlan = buildAdapterPlan(
      {
        provider: agent.provider,
        role: agent.role,
        task: promptWithTranscript(phase, transcript),
        planId: input.plan.planId,
        model: agent.model,
        execute: input.execute,
      },
      input.mode,
    );
    const result = await input.executor?.({
      phase,
      agent,
      adapterPlan,
      cycle,
    });
    const output = `${result?.stdout ?? ""}\n${result?.stderr ?? ""}`;
    let reviewVerdict = phaseName === "smart_review" ? parsePairAgentVerdict(output) : null;
    let evidenceErrorCode: string | null = null;
    const lightConsulted =
      phaseName === "light_implementation" &&
      hasConsultationQuestion(output) &&
      !(
        hasChangedFilesEvidence(output) &&
        hasTargetedTestCommand(output) &&
        hasImplementationNotes(output)
      );
    const previousLightConsulted =
      phaseName === "smart_review" &&
      transcript.at(-1)?.phase === "light_implementation" &&
      transcript.at(-1)?.status === "pending";
    if (phaseName === "smart_review" && !hasReviewVerdictLine(output)) {
      evidenceErrorCode = "missing-review-verdict";
      reviewVerdict = "error";
    }
    if (
      phaseName === "smart_test_author" &&
      (!hasRedEvidence(output) ||
        !hasOracleEvidence(output) ||
        !hasRedTestCommand(output) ||
        !hasNonZeroRedExitCode(output))
    ) {
      evidenceErrorCode = "missing-red-command-or-oracle-evidence";
    }
    if (phaseName === "light_implementation" && result?.status === 0 && !lightConsulted) {
      if (
        !hasChangedFilesEvidence(output) ||
        !hasTargetedTestCommand(output) ||
        !hasImplementationNotes(output)
      ) {
        evidenceErrorCode = "missing-light-implementation-evidence";
      }
    }
    if (!evidenceErrorCode && previousLightConsulted && reviewVerdict === "pass") {
      evidenceErrorCode = "consultation-cannot-pass-without-implementation";
      reviewVerdict = "error";
    }
    if (
      !evidenceErrorCode &&
      previousLightConsulted &&
      (reviewVerdict === "fail" || reviewVerdict === "pending") &&
      !hasConsultationResponse(output)
    ) {
      evidenceErrorCode = "missing-consultation-response";
      reviewVerdict = "error";
    }
    if (
      !evidenceErrorCode &&
      phaseName === "smart_review" &&
      reviewVerdict === "pending" &&
      !hasConsultationResponse(output)
    ) {
      evidenceErrorCode = "missing-continuation-directive";
      reviewVerdict = "error";
    }
    if (!evidenceErrorCode && phaseName === "smart_review" && reviewVerdict === "pass") {
      if (!hasGreenEvidence(output) || !hasReviewEvidence(output)) {
        evidenceErrorCode = "missing-green-or-review-evidence";
        reviewVerdict = "error";
      }
    }
    if (
      !evidenceErrorCode &&
      phaseName === "smart_review" &&
      reviewVerdict === "fail" &&
      !hasFixInstruction(output)
    ) {
      evidenceErrorCode = "missing-fix-instruction";
      reviewVerdict = "error";
    }
    if (evidenceErrorCode) {
      findings.push({
        code: evidenceErrorCode,
        severity: "error",
        message: `pair-agent phase ${phaseName} did not emit the required TDD evidence markers`,
      });
    }
    const step: PairAgentRunStep = {
      phase: phaseName,
      agentKey: phase.agentKey,
      provider: agent.provider,
      model: agent.model,
      cycle,
      status:
        evidenceErrorCode !== null
          ? "error"
          : phaseName === "smart_review"
            ? stepStatusFromReviewVerdict(reviewVerdict ?? "pending")
            : result?.status === 0
              ? lightConsulted
                ? "pending"
                : "passed"
              : "error",
      verdict: reviewVerdict,
      exitCode: result?.status ?? null,
    };
    steps.push(step);
    transcript.push({
      ...step,
      outputExcerpt: boundedTranscriptOutput(output),
    });
    return step;
  };

  const testAuthor = await executePhase("smart_test_author", 0);
  if (testAuthor.status !== "passed") {
    return { ok: false, status: "error", finalVerdict: null, steps, transcript, findings };
  }

  let finalVerdict: PairAgentRunResult["finalVerdict"] = null;
  for (let cycle = 1; cycle <= input.plan.maxFixCycles; cycle++) {
    const implementation = await executePhase("light_implementation", cycle);
    if (!["passed", "pending"].includes(implementation.status)) {
      return { ok: false, status: "error", finalVerdict, steps, transcript, findings };
    }
    const review = await executePhase("smart_review", cycle);
    finalVerdict = review.verdict;
    if (review.verdict === "pass") {
      return { ok: true, status: "passed", finalVerdict, steps, transcript, findings };
    }
    if (review.verdict === "error") {
      return { ok: false, status: "error", finalVerdict, steps, transcript, findings };
    }
  }

  return { ok: false, status: "failed", finalVerdict, steps, transcript, findings };
}

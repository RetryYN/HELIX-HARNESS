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
      requiredEvidence: ["red_evidence", "acceptance_oracle", "test_design_trace"],
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
      "light-agent-cannot-close",
      "smart-agent-runs-tests-and-reviews",
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

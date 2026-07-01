import { existsSync, readFileSync } from "node:fs";
import { parse as parseYaml } from "yaml";
import type { ExecutionMode } from "../runtime/detect";
import { checkCrossAgentModelPair, crossAgentModelIssueMessage } from "../schema";
import {
  isNaiveSelfReviewKind,
  JUDGMENT_GATES,
  REQUIRED_CHECKLIST_IDS,
} from "./review-tier-policy";

export { JUDGMENT_GATES, REQUIRED_CHECKLIST_IDS } from "./review-tier-policy";

export type ReviewKind = "cross_agent" | "intra_runtime_subagent" | "human";
export type ChecklistStatus = "pass" | "fail" | "n-a";

export interface ChecklistItem {
  id: string;
  status: ChecklistStatus;
  evidence?: string;
}

export interface ReviewChecklist {
  items: ChecklistItem[];
}

export interface GateReviewInput {
  gate: string;
  mode: ExecutionMode;
  reviewKind?: ReviewKind | string;
  workerModel?: string;
  reviewerModel?: string;
  checklist?: ReviewChecklist | null;
  humanApproved?: boolean;
}

export interface GateReviewResult {
  gate: string;
  mode: ExecutionMode;
  passed: boolean;
  review_kind: ReviewKind | null;
  cross_agent_review: "available" | "unavailable" | "not-required";
  messages: string[];
}

export interface JudgmentReviewPlan {
  mode: ExecutionMode;
  requiredReviewKind: ReviewKind;
  crossAgentReview: "available" | "unavailable";
  requiredAction: string;
  gateCommandTemplate: string;
  requiredEvidence: string[];
}

export function isJudgmentGate(gate: string): boolean {
  return (JUDGMENT_GATES as readonly string[]).includes(gate);
}

function validateChecklist(checklist: ReviewChecklist | null | undefined): string[] {
  if (!checklist) return ["single-runtime judgment gate requires checklist evidence"];
  const byId = new Map(checklist.items.map((item) => [item.id, item]));
  const messages: string[] = [];
  for (const id of REQUIRED_CHECKLIST_IDS) {
    const item = byId.get(id);
    if (!item) {
      messages.push(`checklist item missing: ${id}`);
      continue;
    }
    if (item.status === "fail") messages.push(`checklist item failed: ${id}`);
    if (item.status === "n-a" && !item.evidence?.trim()) {
      messages.push(`checklist item n-a requires evidence: ${id}`);
    }
  }
  return messages;
}

export function evaluateGateReview(input: GateReviewInput): GateReviewResult {
  if (!isJudgmentGate(input.gate)) {
    return {
      gate: input.gate,
      mode: input.mode,
      passed: true,
      review_kind: null,
      cross_agent_review: "not-required",
      messages: ["non-judgment gate: review tier not required"],
    };
  }

  if (isNaiveSelfReviewKind(input.reviewKind)) {
    return {
      gate: input.gate,
      mode: input.mode,
      passed: false,
      review_kind: null,
      cross_agent_review: input.mode === "hybrid" ? "available" : "unavailable",
      messages: ["naive self-review is not valid judgment-gate evidence"],
    };
  }

  if (input.mode === "hybrid") {
    const messages: string[] = [];
    if (input.reviewKind !== "cross_agent")
      messages.push("hybrid judgment gate requires cross_agent review");
    const modelCheck = checkCrossAgentModelPair(input.workerModel, input.reviewerModel);
    if (!modelCheck.ok) messages.push(crossAgentModelIssueMessage(modelCheck));
    return {
      gate: input.gate,
      mode: input.mode,
      passed: messages.length === 0,
      review_kind: "cross_agent",
      cross_agent_review: "available",
      messages: messages.length === 0 ? ["hybrid cross-agent review ok"] : messages,
    };
  }

  if (input.mode === "claude-only" || input.mode === "codex-only") {
    const messages = validateChecklist(input.checklist);
    if (input.reviewKind && input.reviewKind !== "intra_runtime_subagent") {
      messages.push("single-runtime judgment gate requires intra_runtime_subagent review");
    }
    return {
      gate: input.gate,
      mode: input.mode,
      passed: messages.length === 0,
      review_kind: "intra_runtime_subagent",
      cross_agent_review: "unavailable",
      messages: messages.length === 0 ? ["single-runtime checklist review ok"] : messages,
    };
  }

  const passed = Boolean(input.humanApproved);
  const messages =
    input.reviewKind && input.reviewKind !== "human"
      ? ["standalone judgment gate requires human review evidence"]
      : [];
  return {
    gate: input.gate,
    mode: input.mode,
    passed: passed && messages.length === 0,
    review_kind: "human",
    cross_agent_review: "unavailable",
    messages:
      messages.length > 0
        ? messages
        : passed
          ? ["standalone human approval ok"]
          : ["standalone judgment gate requires human approval"],
  };
}

export function judgmentReviewPlanForMode(mode: ExecutionMode): JudgmentReviewPlan {
  if (mode === "hybrid") {
    return {
      mode,
      requiredReviewKind: "cross_agent",
      crossAgentReview: "available",
      requiredAction:
        "route judgment gates to the opposite provider/model family and record worker_model plus reviewer_model",
      gateCommandTemplate:
        "ut-tdd gate <gate-id> --review-kind cross_agent --worker-model <worker-provider:model> --reviewer-model <reviewer-provider:model> --json",
      requiredEvidence: [
        "review_kind=cross_agent",
        "worker_model recorded",
        "reviewer_model recorded",
        "worker_model and reviewer_model resolve to different providers",
      ],
    };
  }

  if (mode === "claude-only" || mode === "codex-only") {
    return {
      mode,
      requiredReviewKind: "intra_runtime_subagent",
      crossAgentReview: "unavailable",
      requiredAction:
        "record intra_runtime_subagent review evidence with a complete judgment checklist; do not claim cross_agent review",
      gateCommandTemplate:
        "ut-tdd gate <gate-id> --review-kind intra_runtime_subagent --checklist <review-checklist.yaml> --json",
      requiredEvidence: [
        "review_kind=intra_runtime_subagent",
        "checklist contains every required judgment item",
        "failed checklist items block the gate",
        "n-a checklist items include evidence",
      ],
    };
  }

  return {
    mode,
    requiredReviewKind: "human",
    crossAgentReview: "unavailable",
    requiredAction:
      "obtain human review evidence because no AI reviewer runtime is spawnable; do not auto-pass judgment gates",
    gateCommandTemplate: "ut-tdd gate <gate-id> --review-kind human --human-approved --json",
    requiredEvidence: [
      "review_kind=human",
      "human approval evidence recorded",
      "no automatic judgment-gate pass without approval",
    ],
  };
}

export function loadReviewChecklist(path: string): ReviewChecklist {
  const raw = readFileSync(path, "utf8");
  const parsed = parseYaml(raw) as { items?: ChecklistItem[] };
  if (!Array.isArray(parsed.items)) throw new Error("review checklist requires items array");
  return { items: parsed.items };
}

export function loadReviewChecklistIfPresent(path: string | undefined): ReviewChecklist | null {
  if (!path || !existsSync(path)) return null;
  return loadReviewChecklist(path);
}

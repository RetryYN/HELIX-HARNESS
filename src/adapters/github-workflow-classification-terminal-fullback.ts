import { execFileSync } from "node:child_process";
import type { WorkflowClassificationTerminalFullbackEvidence } from "../lint/workflow-classification-terminal-fullback.js";
import {
  type ClaudePrReviewReceiptAny,
  parseClaudeIndependentPrReviewComment,
} from "../runtime/claude-pr-convergence.js";
import { loadWorkflowClassificationCatalog } from "../schema/workflow-classification-catalog.js";
import { loadWorkflowClassificationRegistry } from "../schema/workflow-classification-registry.js";

type GhApi = (endpoint: string) => unknown;
type Digest = `sha256:${string}`;

export const WORKFLOW_CLASSIFICATION_TERMINAL_FULLBACK_FORWARD_SLICES = [
  { sliceId: "PLAN-L7-561", prNumber: 701 },
  { sliceId: "PLAN-L7-562", prNumber: 708 },
  { sliceId: "PLAN-L7-568", prNumber: 720 },
  { sliceId: "PLAN-L7-570", prNumber: 723 },
  { sliceId: "PLAN-L7-583", prNumber: 780 },
  { sliceId: "PLAN-L7-580", prNumber: 750 },
] as const;

export type WorkflowClassificationTerminalFullbackForwardSliceRef = {
  sliceId: string;
  prNumber: number;
};

type CurrentMainEvidence = WorkflowClassificationTerminalFullbackEvidence["currentMain"];
type ConsumerEvidence = WorkflowClassificationTerminalFullbackEvidence["authority"]["consumers"];

function defaultGhApi(endpoint: string): unknown {
  return JSON.parse(
    execFileSync("gh", ["api", endpoint], {
      encoding: "utf8",
      maxBuffer: 8 * 1024 * 1024,
    }),
  ) as unknown;
}

function object(value: unknown, code: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(code);
  return value as Record<string, unknown>;
}

function optionalString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function optionalPositiveInteger(value: unknown): number | null {
  return Number.isSafeInteger(value) && Number(value) > 0 ? Number(value) : null;
}

function digest(value: unknown): Digest | null {
  return typeof value === "string" && /^sha256:[a-f0-9]{64}$/u.test(value)
    ? (value as Digest)
    : null;
}

function ciConclusion(
  value: Record<string, unknown>,
): "success" | "failure" | "cancelled" | "pending" {
  if (value.status !== "completed") return "pending";
  if (value.conclusion === "success") return "success";
  if (value.conclusion === "cancelled") return "cancelled";
  return "failure";
}

function runId(value: Record<string, unknown>): number | null {
  return optionalPositiveInteger(value.id);
}

function issueState(value: unknown, issueNumber: number): "open" | "closed" {
  if (value === "open" || value === "closed") return value;
  throw new Error(`workflow_classification_github_issue_state_invalid:#${issueNumber}`);
}

function runList(value: unknown): Record<string, unknown>[] {
  const payload = object(value, "workflow_classification_github_runs_invalid");
  if (!Array.isArray(payload.workflow_runs)) {
    throw new Error("workflow_classification_github_runs_invalid");
  }
  return payload.workflow_runs.map((run) =>
    object(run, "workflow_classification_github_run_invalid"),
  );
}

function reviewReceipt(
  comments: unknown[],
  expectedHeadSha: string,
): ClaudePrReviewReceiptAny | null {
  for (const comment of [...comments].reverse()) {
    const body = object(comment, "workflow_classification_github_comment_invalid").body;
    if (typeof body !== "string") continue;
    const receipt = parseClaudeIndependentPrReviewComment(body);
    if (receipt?.headSha === expectedHeadSha) return receipt;
  }
  return null;
}

function loadRuns(
  api: GhApi,
  repository: string,
  headSha: string,
  reviewCiRunId: number | null,
): Record<string, unknown>[] {
  const runs = runList(
    api(`repos/${repository}/actions/runs?event=pull_request&head_sha=${headSha}&per_page=100`),
  );
  if (reviewCiRunId !== null) {
    const reviewedRun = runs.find((run) => runId(run) === reviewCiRunId);
    if (reviewedRun) return [reviewedRun];
    try {
      return [
        object(
          api(`repos/${repository}/actions/runs/${reviewCiRunId}`),
          "workflow_classification_github_run_invalid",
        ),
      ];
    } catch {
      return [];
    }
  }
  return runs
    .filter((run) => run.name === "harness-check")
    .sort((left, right) =>
      String(left.updated_at ?? left.created_at ?? "").localeCompare(
        String(right.updated_at ?? right.created_at ?? ""),
      ),
    )
    .slice(-1);
}

function currentSliceEvidence(
  api: GhApi,
  repository: string,
  ref: WorkflowClassificationTerminalFullbackForwardSliceRef,
): WorkflowClassificationTerminalFullbackEvidence["forwardSlices"][number] {
  const pr = object(
    api(`repos/${repository}/pulls/${ref.prNumber}`),
    "workflow_classification_github_pr_invalid",
  );
  const head = object(pr.head, "workflow_classification_github_pr_head_invalid");
  const headSha = optionalString(head.sha);
  const commentsPayload = api(`repos/${repository}/issues/${ref.prNumber}/comments?per_page=100`);
  if (!Array.isArray(commentsPayload)) {
    throw new Error("workflow_classification_github_comments_invalid");
  }
  if (commentsPayload.length === 100) {
    throw new Error("workflow_classification_github_comments_truncated");
  }
  const receipt = headSha ? reviewReceipt(commentsPayload, headSha) : null;
  const reviewedCiRunId = optionalPositiveInteger(receipt?.ciRunId);
  const runs = headSha ? loadRuns(api, repository, headSha, reviewedCiRunId) : [];
  const run = runs[0];
  const ciRunId = run ? runId(run) : null;
  const ciHeadSha = run ? optionalString(run.head_sha) : null;

  return {
    sliceId: ref.sliceId,
    merged: typeof pr.merged_at === "string" && pr.merged_at.length > 0,
    headSha,
    ciRunId,
    ciHeadSha,
    ciConclusion: run ? ciConclusion(run) : null,
    reviewHeadSha: receipt?.headSha ?? null,
    reviewCiRunId: reviewedCiRunId,
    reviewVerdict: receipt?.verdict ?? null,
    reviewReceiptDigest: digest(receipt?.receiptDigest),
    dbProjectionDigest: digest(receipt?.dbProjectionDigest),
    dbReplayProjectionDigest: digest(receipt?.dbReplayProjectionDigest),
    checkpointDigest: digest(receipt?.dbCheckpointDigest),
    replayCheckpointDigest: digest(receipt?.dbReplayCheckpointDigest),
    dbConverged: receipt?.dbConverged === true,
  };
}

export function loadGithubWorkflowClassificationTerminalFullbackEvidence(input: {
  repository: string;
  repoRoot?: string;
  forwardSlices?: readonly WorkflowClassificationTerminalFullbackForwardSliceRef[];
  currentMain: CurrentMainEvidence;
  consumers: ConsumerEvidence;
  ghApi?: GhApi;
}): WorkflowClassificationTerminalFullbackEvidence {
  if (input.consumers.length === 0) {
    throw new Error("workflow_classification_live_consumers_missing");
  }
  const forwardSlices =
    input.forwardSlices ?? WORKFLOW_CLASSIFICATION_TERMINAL_FULLBACK_FORWARD_SLICES;
  if (forwardSlices.length === 0) {
    throw new Error("workflow_classification_live_forward_slices_missing");
  }
  const api = input.ghApi ?? defaultGhApi;
  const repoRoot = input.repoRoot ?? process.cwd();
  const registry = loadWorkflowClassificationRegistry(repoRoot);
  const catalog = loadWorkflowClassificationCatalog(repoRoot);
  const dependencyIssues = [204, 635, 188].map((number) => {
    const issue = object(
      api(`repos/${input.repository}/issues/${number}`),
      "workflow_classification_github_issue_invalid",
    );
    return { number, state: issueState(issue.state, number) } as const;
  });
  return {
    issueNumber: 694,
    authority: {
      requirements: {
        version: registry.requirements_version,
        sourceDigest: registry.authority.source_digest,
      },
      registry: {
        version: registry.registry_version,
        requirementsVersion: registry.requirements_version,
        sourceDigest: catalog.source_registry.registry_source_digest,
        requirementsSourceDigest: registry.authority.source_digest,
      },
      catalog: {
        registryVersion: catalog.source_registry.registry_version,
        requirementsVersion: catalog.source_registry.requirements_version,
        registrySourceDigest: catalog.source_registry.registry_source_digest,
        requirementsSourceDigest: catalog.source_registry.requirements_source_digest,
      },
      consumers: input.consumers,
    },
    forwardSlices: forwardSlices.map((ref) => currentSliceEvidence(api, input.repository, ref)),
    currentMain: input.currentMain,
    dependencyIssues,
  };
}

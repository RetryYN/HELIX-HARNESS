import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parseMarkdownFrontmatter } from "../lint/shared.js";
import {
  terminalFullbackAuthoritySnapshot,
  type WorkflowClassificationTerminalFullbackEvidence,
} from "../lint/workflow-classification-terminal-fullback.js";
import {
  type ClaudePrReviewReceiptAny,
  parseClaudeIndependentPrReviewComment,
} from "../runtime/claude-pr-convergence.js";
import { canonicalJson, sha256Digest } from "../runtime/digest.js";
import { loadWorkflowClassificationCatalog } from "../schema/workflow-classification-catalog.js";
import { loadWorkflowClassificationRegistry } from "../schema/workflow-classification-registry.js";
import { loadWorkflowClassificationTerminalFullbackAuthority } from "../schema/workflow-classification-terminal-fullback-authority.js";

type GhApi = (endpoint: string) => unknown;
type Digest = `sha256:${string}`;

export type WorkflowClassificationTerminalFullbackForwardSliceRef = {
  sliceId: string;
  prNumber: number;
};

type CurrentMainEvidence = WorkflowClassificationTerminalFullbackEvidence["currentMain"];
type CurrentMainMeasurement = {
  mainHeadSha: string | null;
  readAfter: Omit<CurrentMainEvidence["readAfter"], "measurementDigest">;
};
type ConsumerEvidence = WorkflowClassificationTerminalFullbackEvidence["authority"]["consumers"];

const TERMINAL_FULLBACK_PLAN_PATH =
  "docs/plans/PLAN-REVERSE-694-workflow-classification-terminal-fullback.md";

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

function sorted(values: readonly string[]): string[] {
  return [...values].sort((left, right) => left.localeCompare(right));
}

function planIdsFromRequires(repoRoot: string): string[] {
  const plan = parseMarkdownFrontmatter(
    readFileSync(resolve(repoRoot, TERMINAL_FULLBACK_PLAN_PATH), "utf8"),
  );
  const dependencies = plan?.dependencies;
  if (!dependencies || typeof dependencies !== "object" || Array.isArray(dependencies)) {
    throw new Error("workflow_classification_terminal_fullback_plan_dependencies_missing");
  }
  const requires = (dependencies as Record<string, unknown>).requires;
  if (
    !Array.isArray(requires) ||
    requires.length === 0 ||
    !requires.every((item) => typeof item === "string")
  ) {
    throw new Error("workflow_classification_terminal_fullback_plan_requires_invalid");
  }
  return requires.map((requiredPath) => {
    const path = String(requiredPath);
    if (!path.startsWith("docs/plans/") || path.includes("..")) {
      throw new Error("workflow_classification_terminal_fullback_plan_requires_path_invalid");
    }
    const required = parseMarkdownFrontmatter(readFileSync(resolve(repoRoot, path), "utf8"));
    const planId = required?.plan_id;
    if (typeof planId !== "string" || planId.length === 0) {
      throw new Error(`workflow_classification_terminal_fullback_plan_id_missing:${path}`);
    }
    return planId;
  });
}

function assertForwardSliceAuthority(
  repoRoot: string,
  authority: ReturnType<typeof loadWorkflowClassificationTerminalFullbackAuthority>,
): void {
  const expected = sorted(authority.forward_slices.map((slice) => slice.plan_id));
  const fromPlan = sorted(planIdsFromRequires(repoRoot));
  if (JSON.stringify(expected) !== JSON.stringify(fromPlan)) {
    throw new Error("workflow_classification_terminal_fullback_forward_slice_authority_drift");
  }
}

function mainHeadSha(api: GhApi, repository: string): string {
  const commit = object(
    api(`repos/${repository}/commits/main`),
    "workflow_classification_github_main_commit_invalid",
  );
  const sha = optionalString(commit.sha);
  if (sha === null || !/^[0-9a-f]{40}$/u.test(sha)) {
    throw new Error("workflow_classification_github_main_commit_sha_invalid");
  }
  return sha;
}

function materializeCurrentMain(input: {
  measurement: CurrentMainMeasurement;
  measuredMainSha: string;
  registry: ReturnType<typeof loadWorkflowClassificationRegistry>;
  catalog: ReturnType<typeof loadWorkflowClassificationCatalog>;
}): CurrentMainEvidence {
  const readAfter = {
    ...input.measurement.readAfter,
    observedHeadSha: input.measuredMainSha,
    requirementsVersion: input.registry.requirements_version,
    registryVersion: input.registry.registry_version,
    registrySourceDigest: input.catalog.source_registry.registry_source_digest,
    measurementDigest: null as string | null,
  };
  return {
    mainHeadSha: input.measuredMainSha,
    readAfter: {
      ...readAfter,
      measurementDigest: sha256Digest(canonicalJson(readAfter)),
    },
  };
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

function loadRuns(input: {
  api: GhApi;
  repository: string;
  headSha: string;
  reviewCiRunId: number | null;
}): Record<string, unknown>[] {
  const { api, repository, headSha, reviewCiRunId } = input;
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

function currentSliceEvidence(input: {
  api: GhApi;
  repository: string;
  ref: WorkflowClassificationTerminalFullbackForwardSliceRef;
}): WorkflowClassificationTerminalFullbackEvidence["forwardSlices"][number] {
  const { api, repository, ref } = input;
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
  const runs = headSha
    ? loadRuns({ api, repository, headSha, reviewCiRunId: reviewedCiRunId })
    : [];
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
  currentMainMeasurement: CurrentMainMeasurement;
  consumers: ConsumerEvidence;
  ghApi?: GhApi;
}): WorkflowClassificationTerminalFullbackEvidence {
  if (input.consumers.length === 0) {
    throw new Error("workflow_classification_live_consumers_missing");
  }
  const api = input.ghApi ?? defaultGhApi;
  const repoRoot = input.repoRoot ?? process.cwd();
  const terminalFullbackAuthority = loadWorkflowClassificationTerminalFullbackAuthority(repoRoot);
  assertForwardSliceAuthority(repoRoot, terminalFullbackAuthority);
  const forwardSlices =
    input.forwardSlices ??
    terminalFullbackAuthority.forward_slices.map((slice) => ({
      sliceId: slice.plan_id,
      prNumber: slice.pr_number,
    }));
  if (forwardSlices.length === 0) {
    throw new Error("workflow_classification_live_forward_slices_missing");
  }
  const measuredMainSha = mainHeadSha(api, input.repository);
  if (
    measuredMainSha !== input.currentMainMeasurement.mainHeadSha ||
    measuredMainSha !== input.currentMainMeasurement.readAfter.observedHeadSha
  ) {
    throw new Error("workflow_classification_github_main_head_mismatch");
  }
  const registry = loadWorkflowClassificationRegistry(repoRoot);
  const catalog = loadWorkflowClassificationCatalog(repoRoot);
  const currentMain = materializeCurrentMain({
    measurement: input.currentMainMeasurement,
    measuredMainSha,
    registry,
    catalog,
  });
  const terminalFullback = terminalFullbackAuthoritySnapshot(terminalFullbackAuthority);
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
      terminalFullback,
      consumers: input.consumers,
    },
    forwardSlices: forwardSlices.map((ref) =>
      currentSliceEvidence({ api, repository: input.repository, ref }),
    ),
    currentMain,
    dependencyIssues,
  };
}

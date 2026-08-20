import { describe, expect, it } from "vitest";
import { loadGithubWorkflowClassificationTerminalFullbackEvidence } from "../src/adapters/github-workflow-classification-terminal-fullback.js";
import { auditWorkflowClassificationTerminalFullback } from "../src/lint/workflow-classification-terminal-fullback.js";
import {
  buildClaudePrReviewReceipt,
  renderIndependentPrReviewComment,
} from "../src/runtime/claude-pr-convergence.js";
import { loadWorkflowClassificationCatalog } from "../src/schema/workflow-classification-catalog.js";
import { loadWorkflowClassificationRegistry } from "../src/schema/workflow-classification-registry.js";

const REPOSITORY = "RetryYN/HELIX-HARNESS";
const HEAD = "a".repeat(40);
const MAIN_SHA = "b".repeat(40);
const DIGEST = `sha256:${"c".repeat(64)}`;

function validCurrentMain() {
  const registry = loadWorkflowClassificationRegistry();
  const catalog = loadWorkflowClassificationCatalog();
  return {
    mainHeadSha: MAIN_SHA,
    observedHeadSha: MAIN_SHA,
    requirementsVersion: registry.requirements_version,
    registryVersion: registry.registry_version,
    registrySourceDigest: catalog.source_registry.registry_source_digest,
    legacyIdentityEmitted: {
      currentOutput: false,
      database: false,
      generatedDocs: false,
    },
    databaseConverged: true,
  };
}

function validConsumer() {
  const catalog = loadWorkflowClassificationCatalog();
  return [
    {
      name: "typed-runtime",
      registryVersion: catalog.source_registry.registry_version,
      registrySourceDigest: catalog.source_registry.registry_source_digest,
      targetAxis: "workflow_model",
      targetId: "REVERSE",
      legacyIdentityEmitted: false,
    },
  ];
}

function reviewBody(): string {
  return renderIndependentPrReviewComment(
    buildClaudePrReviewReceipt({
      repository: REPOSITORY,
      prNumber: 834,
      prUrl: `https://github.com/${REPOSITORY}/pull/834`,
      headSha: HEAD,
      authorRuntime: "codex",
      reviewerRuntime: "claude",
      authorModel: "gpt-5.4-codex",
      reviewerModel: "claude-opus-5",
      reviewerSessionId: "reviewer-session",
      verdict: "approve",
      blockerCount: 0,
      ciRunId: 8341,
      ciConclusion: "success",
      ciEvidenceGeneration: "run:8341:attempt:1:success",
      dbReceiptSchemaVersion: "helix-l3-g3-logical-db-bootstrap-receipt.v2",
      dbProjectionDigest: DIGEST,
      dbReplayProjectionDigest: DIGEST,
      dbCheckpointDigest: DIGEST,
      dbReplayCheckpointDigest: DIGEST,
      dbReceiptDigest: DIGEST,
      dbConverged: true,
      commentUrl: `https://github.com/${REPOSITORY}/pull/834#issuecomment-8341`,
      reviewedAt: "2026-08-20T00:00:00.000Z",
    }),
  );
}

function fixtureApi(overrides?: {
  comments?: unknown[];
  ciRuns?: unknown[];
  dependencyState?: Record<number, "open" | "closed">;
}) {
  const comments = overrides?.comments ?? [{ body: reviewBody() }];
  const ciRuns = overrides?.ciRuns ?? [
    {
      id: 8341,
      name: "harness-check",
      status: "completed",
      conclusion: "success",
      head_sha: HEAD,
      updated_at: "2026-08-20T12:01:00Z",
    },
  ];
  const dependencyState = overrides?.dependencyState ?? {};
  return (endpoint: string): unknown => {
    if (endpoint === `repos/${REPOSITORY}/pulls/834`) {
      return { number: 834, merged_at: "2026-08-20T12:02:00Z", head: { sha: HEAD } };
    }
    if (endpoint === `repos/${REPOSITORY}/issues/834/comments?per_page=100`) return comments;
    if (
      endpoint ===
      `repos/${REPOSITORY}/actions/runs?event=pull_request&head_sha=${HEAD}&per_page=100`
    ) {
      return { workflow_runs: ciRuns };
    }
    const dependency = endpoint.match(new RegExp(`^repos/${REPOSITORY}/issues/(204|635|188)$`));
    if (dependency) {
      const number = Number(dependency[1]);
      return { number, state: dependencyState[number] ?? "open" };
    }
    throw new Error(`unexpected endpoint: ${endpoint}`);
  };
}

describe("GitHub workflow classification terminal fullback adapter", () => {
  it("U-WFTERM-023: PR、CI、Claude receiptを同一HEADへ正規化する", () => {
    const evidence = loadGithubWorkflowClassificationTerminalFullbackEvidence({
      repository: REPOSITORY,
      forwardSlices: [{ sliceId: "PLAN-L7-561", prNumber: 834 }],
      currentMain: validCurrentMain(),
      consumers: validConsumer(),
      ghApi: fixtureApi(),
    });
    expect(evidence.forwardSlices).toMatchObject([
      {
        sliceId: "PLAN-L7-561",
        merged: true,
        headSha: HEAD,
        ciRunId: 8341,
        ciHeadSha: HEAD,
        ciConclusion: "success",
        reviewHeadSha: HEAD,
        reviewCiRunId: 8341,
        reviewVerdict: "approve",
        dbConverged: true,
      },
    ]);
    expect(auditWorkflowClassificationTerminalFullback(evidence)).toMatchObject({
      ok: true,
      completionClaimAllowed: true,
      findings: [],
    });
  });

  it("U-WFTERM-024: Claude receipt欠落をlive snapshotのgreenへ昇格しない", () => {
    const evidence = loadGithubWorkflowClassificationTerminalFullbackEvidence({
      repository: REPOSITORY,
      forwardSlices: [{ sliceId: "PLAN-L7-561", prNumber: 834 }],
      currentMain: validCurrentMain(),
      consumers: validConsumer(),
      ghApi: fixtureApi({ comments: [] }),
    });
    const report = auditWorkflowClassificationTerminalFullback(evidence);
    expect(report.ok).toBe(false);
    expect(report.findings).toContainEqual(
      expect.objectContaining({ code: "forward_review_missing" }),
    );
  });

  it("U-WFTERM-025: commentsの切詰めをlive evidenceとして採用しない", () => {
    expect(() =>
      loadGithubWorkflowClassificationTerminalFullbackEvidence({
        repository: REPOSITORY,
        forwardSlices: [{ sliceId: "PLAN-L7-561", prNumber: 834 }],
        currentMain: validCurrentMain(),
        consumers: validConsumer(),
        ghApi: fixtureApi({ comments: Array.from({ length: 100 }, () => ({})) }),
      }),
    ).toThrow("workflow_classification_github_comments_truncated");
  });

  it("U-WFTERM-026: dependency Issueの実状態をGitHubから取得し、閉鎖を拒否する", () => {
    const evidence = loadGithubWorkflowClassificationTerminalFullbackEvidence({
      repository: REPOSITORY,
      forwardSlices: [{ sliceId: "PLAN-L7-561", prNumber: 834 }],
      currentMain: validCurrentMain(),
      consumers: validConsumer(),
      ghApi: fixtureApi({ dependencyState: { 635: "closed" } }),
    });
    const report = auditWorkflowClassificationTerminalFullback(evidence);
    expect(report.ok).toBe(false);
    expect(report.findings).toContainEqual(
      expect.objectContaining({ code: "dependency_state_mismatch", subject: "#635" }),
    );
  });
});

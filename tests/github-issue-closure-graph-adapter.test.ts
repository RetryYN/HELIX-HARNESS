import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  closingIssueNumbers,
  loadIssueClosureGraphSnapshots,
} from "../src/adapters/github-issue-closure-graph";
import {
  buildClaudePrReviewReceipt,
  CLAUDE_PR_REVIEW_RECEIPT_SCHEMA_V2,
  renderIndependentPrReviewComment,
} from "../src/runtime/claude-pr-convergence";
import { canonicalJson, sha256Digest } from "../src/runtime/digest";

const REPOSITORY = "RetryYN/HELIX-HARNESS";
const HEAD = "a".repeat(40);
const REVIEW_BODY = renderIndependentPrReviewComment(
  buildClaudePrReviewReceipt({
    repository: REPOSITORY,
    prNumber: 383,
    prUrl: `https://github.com/${REPOSITORY}/pull/383`,
    headSha: HEAD,
    authorRuntime: "codex",
    reviewerRuntime: "claude",
    authorModel: "codex-gpt-5",
    reviewerModel: "claude-sonnet-5",
    reviewerSessionId: "reviewer-session",
    verdict: "approve",
    blockerCount: 0,
    ciRunId: 30860788408,
    ciConclusion: "success",
    dbReceiptSchemaVersion: "helix-l3-g3-logical-db-bootstrap-receipt.v2",
    dbProjectionDigest: `sha256:${"1".repeat(64)}`,
    dbReplayProjectionDigest: `sha256:${"1".repeat(64)}`,
    dbCheckpointDigest: `sha256:${"2".repeat(64)}`,
    dbReplayCheckpointDigest: `sha256:${"2".repeat(64)}`,
    dbReceiptDigest: `sha256:${"3".repeat(64)}`,
    dbConverged: true,
    commentUrl: `https://github.com/${REPOSITORY}/pull/383#issuecomment-99`,
    reviewedAt: "2026-08-10T00:00:00.000Z",
  }),
);
const REVIEW_DIGEST = `sha256:${createHash("sha256").update(REVIEW_BODY).digest("hex")}`;

const LEGACY_REVIEW_BODY = (() => {
  const current = buildClaudePrReviewReceipt({
    repository: REPOSITORY,
    prNumber: 383,
    prUrl: `https://github.com/${REPOSITORY}/pull/383`,
    headSha: HEAD,
    authorRuntime: "codex",
    reviewerRuntime: "claude",
    authorModel: "codex-gpt-5",
    reviewerModel: "claude-sonnet-5",
    reviewerSessionId: "reviewer-session",
    verdict: "approve",
    blockerCount: 0,
    ciRunId: 30860788408,
    ciConclusion: "success",
    dbReceiptSchemaVersion: "helix-l3-g3-logical-db-bootstrap-receipt.v2",
    dbProjectionDigest: `sha256:${"1".repeat(64)}`,
    dbReplayProjectionDigest: `sha256:${"1".repeat(64)}`,
    dbCheckpointDigest: `sha256:${"2".repeat(64)}`,
    dbReplayCheckpointDigest: `sha256:${"2".repeat(64)}`,
    dbReceiptDigest: `sha256:${"3".repeat(64)}`,
    dbConverged: true,
    commentUrl: `https://github.com/${REPOSITORY}/pull/383#issuecomment-99`,
    reviewedAt: "2026-08-10T00:00:00.000Z",
  });
  const {
    authorModel: _authorModel,
    reviewerModel: _reviewerModel,
    schemaVersion: _schemaVersion,
    receiptId: _receiptId,
    receiptDigest: _receiptDigest,
    ...legacyInput
  } = current;
  const payload = { schemaVersion: CLAUDE_PR_REVIEW_RECEIPT_SCHEMA_V2, ...legacyInput };
  return [
    "<!-- HELIX:independent-pr-review-receipt:v1 -->",
    "```json",
    JSON.stringify({
      schema_version: "helix-independent-pr-review-comment.v1",
      receipt: {
        ...payload,
        receiptId: `claude-pr-review:${REPOSITORY}#383:${HEAD}`,
        receiptDigest: sha256Digest(canonicalJson(payload)),
      },
      kimi_provenance: null,
    }),
    "```",
  ].join("\n");
})();

function contractBody(): string {
  return `
\`\`\`json
{"schema_version":"helix-issue-closure-graph.v1","canonical_contracts":[{"contract_id":"WCC-FR-05","owner_issue":227}],"child_issues":[{"number":227,"expected_state":"closed"}],"successor_issues":[]}
\`\`\``;
}

function receiptBody(): string {
  return `
\`\`\`json
{"schema_version":"helix-issue-completion-receipt.v1","contract_id":"WCC-FR-05","owner_issue":227,"pr_number":383,"head_sha":"${HEAD}","ci_run_id":30860788408,"review_comment_url":"https://github.com/${REPOSITORY}/pull/383#issuecomment-99","review_receipt_digest":"${REVIEW_DIGEST}"}
\`\`\``;
}

describe("GitHub Issue closure graph adapter", () => {
  it("U-ICGRAPH-006: Closes対象からGitHub actual issue/PR/CI/review snapshotをread-only構築する", () => {
    const fixtures = new Map<string, unknown>([
      [`repos/${REPOSITORY}/issues/194`, { number: 194, state: "open", body: contractBody() }],
      [`repos/${REPOSITORY}/issues/227`, { number: 227, state: "closed", body: receiptBody() }],
      [`repos/${REPOSITORY}/issues/227/comments?per_page=100`, []],
      [
        `repos/${REPOSITORY}/pulls/383`,
        { number: 383, merged_at: "2026-08-04T00:00:00Z", head: { sha: HEAD } },
      ],
      [
        `repos/${REPOSITORY}/actions/runs/30860788408`,
        { id: 30860788408, status: "completed", conclusion: "success", head_sha: HEAD },
      ],
      [`repos/${REPOSITORY}/issues/comments/99`, { body: REVIEW_BODY }],
    ]);
    const snapshots = loadIssueClosureGraphSnapshots({
      repository: REPOSITORY,
      prBody: "Closes #194",
      ghApi: (endpoint) => {
        if (!fixtures.has(endpoint)) throw new Error(`unexpected endpoint ${endpoint}`);
        return fixtures.get(endpoint);
      },
    });
    expect(snapshots).toHaveLength(1);
    expect(snapshots[0]).toMatchObject({
      parent_issue: { number: 194, state: "open" },
      issues: [{ number: 227, state: "closed" }],
      pull_requests: [
        {
          number: 383,
          head_sha: HEAD,
          merged: true,
          ci_run_id: 30860788408,
          ci_head_sha: HEAD,
          ci_conclusion: "success",
          review_receipt_digest: REVIEW_DIGEST,
          review_head_sha: HEAD,
          review_ci_run_id: 30860788408,
          review_verdict: "approve",
        },
      ],
    });
  });

  it("U-ICGRAPH-007: multiple Closesをdeduplicateしcomments切詰めをfail-closeする", () => {
    expect(closingIssueNumbers("Closes #194\nCloses #194\nCloses #227")).toEqual([194, 227]);
    expect(() =>
      loadIssueClosureGraphSnapshots({
        repository: REPOSITORY,
        prBody: "Closes #194",
        ghApi: (endpoint) => {
          if (endpoint.endsWith("issues/194")) {
            return { number: 194, state: "open", body: contractBody() };
          }
          if (endpoint.endsWith("issues/227")) {
            return { number: 227, state: "closed", body: "" };
          }
          if (endpoint.includes("/comments?per_page=100"))
            return Array.from({ length: 100 }, () => ({}));
          throw new Error(`unexpected endpoint ${endpoint}`);
        },
      }),
    ).toThrow("issue_closure_github_comments_truncated");
  });

  it("U-ICGRAPH-010: v2 historical commentをproseではなくcanonical envelopeから読む", () => {
    const fixtures = new Map<string, unknown>([
      [`repos/${REPOSITORY}/issues/194`, { number: 194, state: "open", body: contractBody() }],
      [`repos/${REPOSITORY}/issues/227`, { number: 227, state: "closed", body: receiptBody() }],
      [`repos/${REPOSITORY}/issues/227/comments?per_page=100`, []],
      [
        `repos/${REPOSITORY}/pulls/383`,
        { number: 383, merged_at: "2026-08-04T00:00:00Z", head: { sha: HEAD } },
      ],
      [
        `repos/${REPOSITORY}/actions/runs/30860788408`,
        { id: 30860788408, status: "completed", conclusion: "success", head_sha: HEAD },
      ],
      [`repos/${REPOSITORY}/issues/comments/99`, { body: LEGACY_REVIEW_BODY }],
    ]);
    const snapshot = loadIssueClosureGraphSnapshots({
      repository: REPOSITORY,
      prBody: "Closes #194",
      ghApi: (endpoint) => fixtures.get(endpoint),
    })[0];
    expect(snapshot?.pull_requests[0]).toMatchObject({
      review_head_sha: HEAD,
      review_ci_run_id: 30860788408,
      review_verdict: "approve",
    });
  });

  it("U-ICGRAPH-009: graph contract未記載のclosing Issueをfail-closeする", () => {
    expect(() =>
      loadIssueClosureGraphSnapshots({
        repository: REPOSITORY,
        prBody: "Closes #373",
        ghApi: () => ({ number: 373, state: "open", body: "## 原子Recovery契約" }),
      }),
    ).toThrow("issue_closure_contract_missing");
  });
});

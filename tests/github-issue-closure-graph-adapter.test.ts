import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  closingIssueNumbers,
  loadIssueClosureGraphSnapshots,
} from "../src/adapters/github-issue-closure-graph";

const REPOSITORY = "RetryYN/HELIX-HARNESS";
const HEAD = "a".repeat(40);
const REVIEW_BODY = [
  "<!-- HELIX:claude-pr-review-receipt:v2 -->",
  "Claude Code convergence review: verdict=approve, blockers=0",
  `HEAD: \`${HEAD}\``,
  "CI run: 30860788408 (success)",
].join("\n");
const REVIEW_DIGEST = `sha256:${createHash("sha256").update(REVIEW_BODY).digest("hex")}`;

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

  it("graph contractを持たないleaf Issueは既存closure contractへ委ねる", () => {
    expect(
      loadIssueClosureGraphSnapshots({
        repository: REPOSITORY,
        prBody: "Closes #373",
        ghApi: () => ({ number: 373, state: "open", body: "## 原子Recovery契約" }),
      }),
    ).toEqual([]);
  });
});

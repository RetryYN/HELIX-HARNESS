import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  ISSUE_COMPLETION_RECEIPT_SCHEMA,
  type IssueClosureGraphSnapshot,
  type IssueCompletionReceipt,
  parseIssueClosureGraphContract,
} from "../runtime/issue-closure-graph";

type GhApi = (endpoint: string) => unknown;

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

function text(value: unknown, code: string): string {
  if (typeof value !== "string") throw new Error(code);
  return value;
}

function integer(value: unknown, code: string): number {
  if (!Number.isSafeInteger(value) || Number(value) < 1) throw new Error(code);
  return Number(value);
}

function issueState(value: unknown): "open" | "closed" {
  if (value === "open" || value === "closed") return value;
  throw new Error("issue_closure_github_issue_state_invalid");
}

function digestText(value: string): `sha256:${string}` {
  return `sha256:${createHash("sha256").update(value, "utf8").digest("hex")}`;
}

export function closingIssueNumbers(body: string): number[] {
  return [
    ...new Set(
      Array.from(body.matchAll(/(?:^|\n)Closes[ \t]+#(\d+)\b/gi), (match) => Number(match[1])),
    ),
  ].sort((left, right) => left - right);
}

export function parseIssueCompletionReceipts(textValue: string): IssueCompletionReceipt[] {
  const receipts: IssueCompletionReceipt[] = [];
  for (const match of textValue.matchAll(/```json\s*([\s\S]*?)```/g)) {
    try {
      const candidate = JSON.parse(match[1] ?? "") as Record<string, unknown>;
      if (candidate.schema_version === ISSUE_COMPLETION_RECEIPT_SCHEMA) {
        receipts.push(candidate as unknown as IssueCompletionReceipt);
      }
    } catch {
      // 他用途または壊れたJSON blockはcompletion receiptとして採用しない。
    }
  }
  return receipts;
}

function commentIdFromUrl(url: string, repository: string, prNumber: number): number {
  const escaped = repository.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = url.match(
    new RegExp(`^https://github\\.com/${escaped}/pull/${prNumber}#issuecomment-(\\d+)$`),
  );
  if (!match) throw new Error("issue_closure_review_comment_url_invalid");
  return Number(match[1]);
}

export function loadIssueClosureGraphSnapshots(input: {
  repository: string;
  prBody: string;
  ghApi?: GhApi;
}): IssueClosureGraphSnapshot[] {
  const api = input.ghApi ?? defaultGhApi;
  const snapshots: IssueClosureGraphSnapshot[] = [];
  for (const parentNumber of closingIssueNumbers(input.prBody)) {
    const parent = object(
      api(`repos/${input.repository}/issues/${parentNumber}`),
      "issue_closure_github_parent_invalid",
    );
    const parentBody = text(parent.body, "issue_closure_github_parent_body_invalid");
    let contract: ReturnType<typeof parseIssueClosureGraphContract>;
    try {
      contract = parseIssueClosureGraphContract(parentBody);
    } catch (error) {
      if (error instanceof Error && error.message === "issue_closure_contract_missing") continue;
      throw error;
    }
    const issueNumbers = new Set<number>([
      ...contract.canonical_contracts.map((entry) => entry.owner_issue),
      ...contract.child_issues.map((entry) => entry.number),
      ...contract.successor_issues.map((entry) => entry.number),
    ]);
    const issues: IssueClosureGraphSnapshot["issues"] = [];
    const receipts: IssueClosureGraphSnapshot["receipts"] = [];
    for (const issueNumber of [...issueNumbers].sort((left, right) => left - right)) {
      const issue = object(
        api(`repos/${input.repository}/issues/${issueNumber}`),
        "issue_closure_github_issue_invalid",
      );
      issues.push({
        number: integer(issue.number, "issue_closure_github_issue_number_invalid"),
        state: issueState(issue.state),
      });
      receipts.push(
        ...parseIssueCompletionReceipts(
          text(issue.body, "issue_closure_github_issue_body_invalid"),
        ).map((receipt) => ({ ...receipt, source_issue: issueNumber })),
      );
      const comments = api(`repos/${input.repository}/issues/${issueNumber}/comments?per_page=100`);
      if (!Array.isArray(comments)) throw new Error("issue_closure_github_comments_invalid");
      if (comments.length === 100) throw new Error("issue_closure_github_comments_truncated");
      for (const comment of comments) {
        const record = object(comment, "issue_closure_github_comment_invalid");
        receipts.push(
          ...parseIssueCompletionReceipts(
            text(record.body, "issue_closure_github_comment_body_invalid"),
          ).map((receipt) => ({ ...receipt, source_issue: issueNumber })),
        );
      }
    }

    const pullRequests: IssueClosureGraphSnapshot["pull_requests"] = [];
    for (const receipt of receipts) {
      if (pullRequests.some((entry) => entry.number === receipt.pr_number)) continue;
      const pr = object(
        api(`repos/${input.repository}/pulls/${receipt.pr_number}`),
        "issue_closure_github_pr_invalid",
      );
      const head = object(pr.head, "issue_closure_github_pr_head_invalid");
      const run = object(
        api(`repos/${input.repository}/actions/runs/${receipt.ci_run_id}`),
        "issue_closure_github_ci_invalid",
      );
      const commentId = commentIdFromUrl(
        receipt.review_comment_url,
        input.repository,
        receipt.pr_number,
      );
      const reviewComment = object(
        api(`repos/${input.repository}/issues/comments/${commentId}`),
        "issue_closure_github_review_comment_invalid",
      );
      const reviewBody = text(reviewComment.body, "issue_closure_github_review_body_invalid");
      const reviewHead = reviewBody.match(/^HEAD: `([0-9a-f]{40})`$/m)?.[1] ?? "";
      const reviewCiRunId = Number(
        reviewBody.match(/^CI run: (\d+) \((?:success|failure)\)$/m)?.[1],
      );
      pullRequests.push({
        number: integer(pr.number, "issue_closure_github_pr_number_invalid"),
        head_sha: text(head.sha, "issue_closure_github_pr_sha_invalid"),
        merged: typeof pr.merged_at === "string" && pr.merged_at.length > 0,
        ci_run_id: integer(run.id, "issue_closure_github_ci_id_invalid"),
        ci_head_sha: text(run.head_sha, "issue_closure_github_ci_head_invalid"),
        ci_conclusion:
          run.status !== "completed"
            ? "pending"
            : run.conclusion === "success"
              ? "success"
              : run.conclusion === "cancelled"
                ? "cancelled"
                : "failure",
        review_receipt_digest: digestText(reviewBody),
        review_head_sha: reviewHead,
        review_ci_run_id: reviewCiRunId,
        review_verdict:
          reviewBody.includes("<!-- HELIX:claude-pr-review-receipt:v2 -->") &&
          /convergence review: verdict=approve, blockers=0\b/.test(reviewBody)
            ? "approve"
            : "block",
      });
    }
    snapshots.push({
      parent_issue: {
        number: integer(parent.number, "issue_closure_github_parent_number_invalid"),
        state: issueState(parent.state),
      },
      contract,
      issues,
      receipts,
      pull_requests: pullRequests,
    });
  }
  return snapshots;
}

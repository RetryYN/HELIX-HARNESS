import { describe, expect, it } from "vitest";
import {
  buildClaudePrReviewReceipt,
  renderIndependentPrReviewComment,
} from "../src/runtime/claude-pr-convergence";
import { canonicalJson, sha256Digest } from "../src/runtime/digest";
import {
  evaluateGitHubCrossReviewAdmission,
  renderProviderNeutralPrReviewComment,
} from "../src/runtime/github-cross-review-admission";
import type { ProviderNeutralReviewReceiptV3 } from "../src/runtime/independent-review-fallback";

const HEAD = "a".repeat(40);
const OTHER_HEAD = "b".repeat(40);
const REVIEWED_AT = "2026-08-09T07:00:00.000Z";

function receipt(headSha = HEAD) {
  return buildClaudePrReviewReceipt({
    repository: "RetryYN/HELIX-HARNESS",
    prNumber: 488,
    prUrl: "https://github.com/RetryYN/HELIX-HARNESS/pull/488",
    headSha,
    authorRuntime: "codex",
    reviewerRuntime: "claude",
    reviewerSessionId: "claude-review-session",
    verdict: "approve",
    blockerCount: 0,
    ciRunId: 31299806333,
    ciConclusion: "success",
    dbReceiptSchemaVersion: "helix-l3-g3-logical-db-bootstrap-receipt.v2",
    dbProjectionDigest: `sha256:${"1".repeat(64)}`,
    dbReplayProjectionDigest: `sha256:${"1".repeat(64)}`,
    dbCheckpointDigest: `sha256:${"2".repeat(64)}`,
    dbReplayCheckpointDigest: `sha256:${"2".repeat(64)}`,
    dbReceiptDigest: `sha256:${"3".repeat(64)}`,
    dbConverged: true,
    commentUrl: "https://github.com/RetryYN/HELIX-HARNESS/pull/488#issuecomment-1",
    reviewedAt: REVIEWED_AT,
  });
}

function input(overrides: Record<string, unknown> = {}) {
  const canonical = receipt();
  return {
    repository: "RetryYN/HELIX-HARNESS",
    pr_number: 488,
    candidate_head: HEAD,
    state: "OPEN" as const,
    is_draft: false,
    comments: [
      {
        html_url: canonical.commentUrl,
        created_at: "2026-08-09T07:00:01.000Z",
        body: renderIndependentPrReviewComment(canonical),
      },
    ],
    ci_runs: [{ id: canonical.ciRunId, head_sha: HEAD, conclusion: "success" }],
    ...overrides,
  };
}

function kimiReceipt(): ProviderNeutralReviewReceiptV3 {
  const payload = {
    schema_version: "helix-independent-pr-review-receipt.v3" as const,
    repository: "RetryYN/HELIX-HARNESS",
    pr_number: 488,
    candidate_head: HEAD,
    declared_author_runtime: "codex",
    reviewer_provider: "kimi" as const,
    reviewer_runtime: "kimi-code-cli",
    reviewer_model: "kimi-code/k3-256k",
    reviewer_session: "kimi-session",
    admission_receipt_digest: `sha256:${"4".repeat(64)}` as const,
    fallback_implementation_head: OTHER_HEAD,
    implementation_tree: "c".repeat(40),
    fallback_reason: "provider_quota_exhausted" as const,
    fallback_evidence_digest: `sha256:${"5".repeat(64)}` as const,
    lease_digest: `sha256:${"6".repeat(64)}` as const,
    lease_issued_at: "2026-08-09T06:55:00.000Z",
    lease_expires_at: "2026-08-09T07:15:00.000Z",
    review_packet_digest: `sha256:${"7".repeat(64)}` as const,
    output_digest: `sha256:${"8".repeat(64)}` as const,
    findings_digest: `sha256:${"9".repeat(64)}` as const,
    verdict: "approve" as const,
    blocker_count: 0,
    ci_run_id: 31299806333,
    ci_conclusion: "success" as const,
    db_receipt_digest: `sha256:${"a".repeat(64)}` as const,
    db_converged: true as const,
    reviewed_at: REVIEWED_AT,
  };
  return { ...payload, receipt_digest: sha256Digest(canonicalJson(payload)) };
}

describe("GitHub cross-review admission", () => {
  it("U-GCRA-001: draftはCI先行のためdeferし、Ready exact HEAD receiptだけをadmitする", () => {
    expect(evaluateGitHubCrossReviewAdmission(input({ is_draft: true }))).toEqual({
      ok: true,
      deferred: true,
      receipt_digest: null,
      reasons: [],
    });
    expect(evaluateGitHubCrossReviewAdmission(input())).toMatchObject({
      ok: true,
      deferred: false,
      receipt_digest: receipt().receiptDigest,
    });
  });

  it("U-GCRA-001b: admitted Kimiのprovider-neutral receiptを同じgateでadmitする", () => {
    const kimi = kimiReceipt();
    expect(
      evaluateGitHubCrossReviewAdmission(
        input({
          comments: [
            {
              html_url: "https://github.com/RetryYN/HELIX-HARNESS/pull/488#issuecomment-2",
              created_at: "2026-08-09T07:00:01.000Z",
              body: renderProviderNeutralPrReviewComment(kimi),
            },
          ],
        }),
      ),
    ).toMatchObject({ ok: true, receipt_digest: kimi.receipt_digest });
  });

  it("U-GCRA-002: PLAN自己申告やreceipt欠落をfail-closeする", () => {
    expect(
      evaluateGitHubCrossReviewAdmission(
        input({
          comments: [{ html_url: "x", created_at: REVIEWED_AT, body: "review_evidence: approve" }],
        }),
      ),
    ).toMatchObject({ ok: false, reasons: ["current_head_review_receipt_missing"] });
  });

  it("U-GCRA-003: stale HEAD、別HEAD CI、review後改変を拒否する", () => {
    const stale = receipt(OTHER_HEAD);
    expect(
      evaluateGitHubCrossReviewAdmission(
        input({
          comments: [
            {
              html_url: stale.commentUrl,
              created_at: "2026-08-09T07:00:01.000Z",
              body: renderIndependentPrReviewComment(stale),
            },
          ],
        }),
      ),
    ).toMatchObject({ ok: false, reasons: ["review_receipt_invalid_or_stale"] });
    expect(
      evaluateGitHubCrossReviewAdmission(
        input({ ci_runs: [{ id: 31299806333, head_sha: OTHER_HEAD, conclusion: "success" }] }),
      ),
    ).toMatchObject({ ok: false, reasons: ["review_receipt_invalid_or_stale"] });
    expect(
      evaluateGitHubCrossReviewAdmission(
        input({
          comments: [
            {
              ...input().comments[0],
              html_url: "https://github.com/RetryYN/HELIX-HARNESS/pull/488#issuecomment-999",
            },
          ],
        }),
      ),
    ).toMatchObject({ ok: false, reasons: ["review_receipt_invalid_or_stale"] });
  });

  it("U-GCRA-004: future review、重複receipt、merge後の事後証拠を拒否する", () => {
    const canonical = receipt();
    expect(
      evaluateGitHubCrossReviewAdmission(
        input({
          comments: [
            {
              html_url: canonical.commentUrl,
              created_at: "2026-08-09T06:59:59.000Z",
              body: renderIndependentPrReviewComment(canonical),
            },
          ],
        }),
      ),
    ).toMatchObject({ ok: false, reasons: ["review_receipt_invalid_or_stale"] });
    expect(
      evaluateGitHubCrossReviewAdmission(
        input({ comments: [...input().comments, ...input().comments] }),
      ),
    ).toMatchObject({ ok: false, reasons: ["review_receipt_conflict"] });
    expect(evaluateGitHubCrossReviewAdmission(input({ state: "MERGED" }))).toMatchObject({
      ok: false,
      reasons: ["pr_not_open"],
    });
  });
});

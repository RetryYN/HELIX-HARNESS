import { describe, expect, it } from "vitest";
import {
  buildClaudePrReviewReceipt,
  renderIndependentPrReviewComment,
} from "../src/runtime/claude-pr-convergence";
import { canonicalJson, sha256Digest } from "../src/runtime/digest";
import {
  evaluateGitHubCrossReviewAdmission,
  type KimiReviewCommentProvenanceV1,
  renderProviderNeutralPrReviewComment,
} from "../src/runtime/github-cross-review-admission";
import {
  kimiReviewPacketDigest,
  type ProviderNeutralReviewReceiptV3,
} from "../src/runtime/independent-review-fallback";

const HEAD = "a".repeat(40);
const OTHER_HEAD = "b".repeat(40);
const REVIEWED_AT = "2026-08-09T07:00:00.000Z";
const REVIEW_PACKET = "exact review packet";

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
    observed_at: "2026-08-09T07:00:02.000Z",
    review_packet: REVIEW_PACKET,
    comments: [
      {
        html_url: canonical.commentUrl,
        created_at: "2026-08-09T07:00:01.000Z",
        body: renderIndependentPrReviewComment(canonical),
      },
    ],
    ci_runs: [
      {
        id: canonical.ciRunId,
        head_sha: HEAD,
        name: "harness-check",
        path: ".github/workflows/harness-check.yml",
        event: "pull_request",
        status: "completed",
        conclusion: "success",
        updated_at: "2026-08-09T06:59:59.000Z",
        pull_request_numbers: [488],
      },
    ],
    ...overrides,
  };
}

function kimiReview(): {
  receipt: ProviderNeutralReviewReceiptV3;
  provenance: KimiReviewCommentProvenanceV1;
} {
  const admissionPayload = {
    schema_version: "helix-kimi-review-fallback-admission.v1" as const,
    provider: "kimi" as const,
    task_class: "pr_convergence_review" as const,
    admitted_risk_classes: ["low", "medium"] as const,
    admission_implementation_head: OTHER_HEAD,
    benchmark_fixture_digest: `sha256:${"4".repeat(64)}` as const,
    negative_oracle_digest: `sha256:${"5".repeat(64)}` as const,
    independent_verifier_provider: "claude" as const,
    independent_verifier_receipt_digest: `sha256:${"6".repeat(64)}` as const,
    verdict: "admit" as const,
    issued_at: "2026-08-09T06:45:00.000Z",
    expires_at: "2026-08-09T07:15:00.000Z",
  };
  const admission = {
    ...admissionPayload,
    receipt_digest: sha256Digest(canonicalJson(admissionPayload)),
  };
  const failurePayload = {
    provider: "claude" as const,
    candidate_head: HEAD,
    exit_code: 1,
    stderr_digest: sha256Digest("usage limit"),
    observed_at: "2026-08-09T06:54:00.000Z",
    reason: "provider_quota_exhausted" as const,
  };
  const fallbackEvidence = {
    kind: "review_provider_failure" as const,
    ...failurePayload,
    evidence_digest: sha256Digest(canonicalJson(failurePayload)),
  };
  const leasePayload = {
    schema_version: "helix-review-fallback-lease.v1" as const,
    repository: "RetryYN/HELIX-HARNESS",
    pr_number: 488,
    candidate_head: HEAD,
    generation: 1,
    provider: "kimi" as const,
    issued_at: "2026-08-09T06:55:00.000Z",
    expires_at: "2026-08-09T07:15:00.000Z",
  };
  const lease = {
    kind: "review_fallback_lease" as const,
    ...leasePayload,
    lease_digest: sha256Digest(canonicalJson(leasePayload)),
  };
  const findings = [] as const;
  const outputPayload = {
    schema_version: "helix-kimi-pr-review-output.v1" as const,
    candidate_head: HEAD,
    verdict: "approve" as const,
    blocker_count: 0,
    findings,
  };
  const output = {
    kind: "kimi_review_output" as const,
    candidate_head: HEAD,
    verdict: "approve" as const,
    blocker_count: 0,
    findings,
    findings_digest: sha256Digest(canonicalJson(findings)),
    output_digest: sha256Digest(canonicalJson(outputPayload)),
  };
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
    admission_receipt_digest: admission.receipt_digest,
    fallback_implementation_head: OTHER_HEAD,
    implementation_tree: "c".repeat(40),
    fallback_reason: "provider_quota_exhausted" as const,
    fallback_evidence_digest: fallbackEvidence.evidence_digest,
    lease_digest: lease.lease_digest,
    lease_issued_at: "2026-08-09T06:55:00.000Z",
    lease_expires_at: "2026-08-09T07:15:00.000Z",
    review_packet_digest: kimiReviewPacketDigest(REVIEW_PACKET),
    output_digest: output.output_digest,
    findings_digest: output.findings_digest,
    verdict: "approve" as const,
    blocker_count: 0,
    ci_run_id: 31299806333,
    ci_conclusion: "success" as const,
    db_receipt_digest: `sha256:${"a".repeat(64)}` as const,
    db_converged: true as const,
    reviewed_at: REVIEWED_AT,
  };
  return {
    receipt: { ...payload, receipt_digest: sha256Digest(canonicalJson(payload)) },
    provenance: {
      admission_receipt: admission,
      fallback_evidence: fallbackEvidence,
      lease,
      output,
    },
  };
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
    const kimi = kimiReview();
    expect(
      evaluateGitHubCrossReviewAdmission(
        input({
          comments: [
            {
              html_url: "https://github.com/RetryYN/HELIX-HARNESS/pull/488#issuecomment-2",
              created_at: "2026-08-09T07:00:01.000Z",
              body: renderProviderNeutralPrReviewComment(kimi.receipt, kimi.provenance),
            },
          ],
        }),
      ),
    ).toMatchObject({ ok: true, receipt_digest: kimi.receipt.receipt_digest });
  });

  it("U-GCRA-001c: Kimi admission・failure・lease・output・packetの自己申告改変を拒否する", () => {
    const canonical = kimiReview();
    const decide = (
      provenance: KimiReviewCommentProvenanceV1,
      overrides: Record<string, unknown> = {},
    ) =>
      evaluateGitHubCrossReviewAdmission(
        input({
          comments: [
            {
              html_url: "https://github.com/RetryYN/HELIX-HARNESS/pull/488#issuecomment-2",
              created_at: "2026-08-09T07:00:01.000Z",
              body: renderProviderNeutralPrReviewComment(canonical.receipt, provenance),
            },
          ],
          ...overrides,
        }),
      );
    const admission = {
      ...canonical.provenance,
      admission_receipt: {
        ...canonical.provenance.admission_receipt,
        receipt_digest: `sha256:${"0".repeat(64)}` as const,
      },
    };
    expect(decide(admission)).toMatchObject({ ok: false });
    const failure = {
      ...canonical.provenance,
      fallback_evidence: { ...canonical.provenance.fallback_evidence, exit_code: 2 },
    };
    expect(decide(failure)).toMatchObject({ ok: false });
    const lease = {
      ...canonical.provenance,
      lease: { ...canonical.provenance.lease, generation: 2 },
    };
    expect(decide(lease)).toMatchObject({ ok: false });
    const output = {
      ...canonical.provenance,
      output: {
        ...canonical.provenance.output,
        findings: [
          {
            severity: "medium" as const,
            code: "FORGED",
            message: "forged",
            path: "src/forged.ts",
            line: 1,
          },
        ],
      },
    };
    expect(decide(output)).toMatchObject({ ok: false });
    expect(decide(canonical.provenance, { review_packet: "different packet" })).toMatchObject({
      ok: false,
    });
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
        input({ ci_runs: [{ ...input().ci_runs[0], head_sha: OTHER_HEAD }] }),
      ),
    ).toMatchObject({ ok: false, reasons: ["review_receipt_invalid_or_stale"] });
    const failedClaim = buildClaudePrReviewReceipt({
      ...receipt(),
      ciConclusion: "failure",
      commentUrl: receipt().commentUrl,
    });
    expect(
      evaluateGitHubCrossReviewAdmission(
        input({
          comments: [
            {
              html_url: failedClaim.commentUrl,
              created_at: "2026-08-09T07:00:01.000Z",
              body: renderIndependentPrReviewComment(failedClaim),
            },
          ],
        }),
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

  it.each([
    ["別workflow", { name: "other" }],
    ["別path", { path: ".github/workflows/other.yml" }],
    ["別event", { event: "push" }],
    ["未完了", { status: "in_progress", conclusion: null }],
    ["別PR", { pull_request_numbers: [487] }],
    ["review後完了", { updated_at: "2026-08-09T07:00:01.000Z" }],
  ])("U-GCRA-003b: required CI provenanceの%sを拒否する", (_label, override) => {
    expect(
      evaluateGitHubCrossReviewAdmission(
        input({ ci_runs: [{ ...input().ci_runs[0], ...override }] }),
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

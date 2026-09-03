import { mkdtempSync, readFileSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  buildClaudePrReviewReceipt,
  CLAUDE_PR_REVIEW_RECEIPT_SCHEMA_V2,
  CLAUDE_PR_REVIEW_RECEIPT_SCHEMA_V3,
  type ClaudePrReviewReceipt,
  type ClaudePrReviewReceiptAny,
  type ClaudePrReviewReceiptInput,
  type IndependentReviewRuntime,
  renderIndependentPrReviewComment,
} from "../src/runtime/claude-pr-convergence";
import { canonicalJson, sha256Digest } from "../src/runtime/digest";
// PLAN-RECOVERY-100-review-receipt-schema-boundary / U-GCRA-010
// PLAN-RECOVERY-101-review-admission-predicate-diagnostics / U-GCRA-012
import {
  canonicalLogicalDbReceiptValid,
  evaluateGitHubCrossReviewAdmission,
  evaluateReviewedMergeReadAfter,
  type KimiReviewCommentProvenanceV1,
  persistReviewedMergeReadAfterReceipt,
  renderProviderNeutralPrReviewComment,
  validateReviewedMergeReadAfterReceipt,
} from "../src/runtime/github-cross-review-admission";
import {
  kimiReviewPacketDigest,
  type ProviderNeutralReviewReceiptV4,
} from "../src/runtime/independent-review-fallback";

const HEAD = "a".repeat(40);
const OTHER_HEAD = "b".repeat(40);
const REVIEWED_AT = "2026-08-09T07:00:00.000Z";
const REVIEW_PACKET = "exact review packet";

function receiptAsInput(receipt: ClaudePrReviewReceipt): ClaudePrReviewReceiptInput {
  const {
    schemaVersion: _schemaVersion,
    receiptId: _receiptId,
    receiptDigest: _receiptDigest,
    ...input
  } = receipt;
  return input;
}

function logicalDbReceiptFixture() {
  const body = {
    schema_version: "helix-l3-g3-logical-db-bootstrap-receipt.v2",
    policy_schema_version: "helix-l3-g3-logical-db-bootstrap-policy.v2",
    canonicalization_contract: { object_keys: "lexicographic_ascending" },
    table_order: "lexicographic_ascending",
    column_order: "lexicographic_ascending",
    row_order: { columns: "lexicographic_ascending" },
    normalization_marker: "<rebuild-observation>",
    observation_columns: {},
    observation_columns_digest: `sha256:${"3".repeat(64)}`,
    source_head: HEAD,
    source_tree: "d".repeat(40),
    workspace_attestation: { tracked_workspace_required: true, clean: true },
    projection_input_mode: "tracked-authority-runtime-logs-excluded",
    excluded_projection_inputs: [],
    excluded_projection_steps: [],
    executed_excluded_projection_steps: [],
    replay_executed_excluded_projection_steps: [],
    event_head_digest: `sha256:${"4".repeat(64)}`,
    policy_digest: `sha256:${"5".repeat(64)}`,
    verifier_digest: `sha256:${"6".repeat(64)}`,
    projection_digest: `sha256:${"1".repeat(64)}`,
    replay_projection_digest: `sha256:${"1".repeat(64)}`,
    checkpoint_digest: `sha256:${"2".repeat(64)}`,
    replay_checkpoint_digest: `sha256:${"2".repeat(64)}`,
    checkpoint_tables: ["artifact_registry"],
    replay_checkpoint_tables: ["artifact_registry"],
    checkpoint_row_counts: { artifact_registry: 1 },
    replay_checkpoint_row_counts: { artifact_registry: 1 },
    checkpoint_population_valid: true,
    replay_checkpoint_population_valid: true,
    schema_revision: 41,
    replay_schema_revision: 41,
    stale_count: 0,
    replay_stale_count: 0,
    stale_rule_rows: [
      { locator: "artifact_registry.status", row_count: 1, minimum_rows: 1, stale_count: 0 },
    ],
    replay_stale_rule_rows: [
      { locator: "artifact_registry.status", row_count: 1, minimum_rows: 1, stale_count: 0 },
    ],
    stale_population_valid: true,
    replay_stale_population_valid: true,
    orphan_count: 0,
    replay_orphan_count: 0,
    orphan_rule_rows: [
      { edge: "a->b", child_row_count: 1, minimum_child_rows: 1, orphan_count: 0 },
    ],
    replay_orphan_rule_rows: [
      { edge: "a->b", child_row_count: 1, minimum_child_rows: 1, orphan_count: 0 },
    ],
    orphan_population_valid: true,
    replay_orphan_population_valid: true,
    finding_count: 0,
    replay_finding_count: 0,
    unexpected_unstable_columns: [],
  };
  return { ...body, converged: true, receipt_digest: sha256Digest(canonicalJson(body)) };
}

function receipt(
  headSha = HEAD,
  reviewedAt = REVIEWED_AT,
  runtimes: {
    authorRuntime: IndependentReviewRuntime;
    reviewerRuntime: IndependentReviewRuntime;
  } = {
    authorRuntime: "codex",
    reviewerRuntime: "claude",
  },
) {
  const db = logicalDbReceiptFixture();
  return buildClaudePrReviewReceipt({
    repository: "RetryYN/HELIX-HARNESS",
    prNumber: 488,
    prUrl: "https://github.com/RetryYN/HELIX-HARNESS/pull/488",
    headSha,
    authorRuntime: runtimes.authorRuntime,
    reviewerRuntime: runtimes.reviewerRuntime,
    authorModel: runtimes.authorRuntime === "codex" ? "codex-gpt-5" : "claude-sonnet-5",
    reviewerModel: runtimes.reviewerRuntime === "codex" ? "codex-gpt-5" : "claude-sonnet-5",
    reviewerSessionId: "claude-review-session",
    verdict: "approve",
    blockerCount: 0,
    ciRunId: 31299806333,
    ciConclusion: "success",
    ciEvidenceGeneration: "run:31299806333:attempt:1:success",
    dbReceiptSchemaVersion: "helix-l3-g3-logical-db-bootstrap-receipt.v2",
    dbProjectionDigest: `sha256:${"1".repeat(64)}`,
    dbReplayProjectionDigest: `sha256:${"1".repeat(64)}`,
    dbCheckpointDigest: `sha256:${"2".repeat(64)}`,
    dbReplayCheckpointDigest: `sha256:${"2".repeat(64)}`,
    dbReceiptDigest: db.receipt_digest,
    dbConverged: true,
    commentUrl: "https://github.com/RetryYN/HELIX-HARNESS/pull/488#issuecomment-1",
    reviewedAt,
  });
}

function legacyV2ReviewComment(): string {
  const current = receipt();
  const {
    authorModel: _authorModel,
    reviewerModel: _reviewerModel,
    schemaVersion: _schemaVersion,
    receiptId: _receiptId,
    receiptDigest: _receiptDigest,
    ...legacyInput
  } = current;
  const payload = { schemaVersion: CLAUDE_PR_REVIEW_RECEIPT_SCHEMA_V2, ...legacyInput };
  const legacy = {
    ...payload,
    receiptId: `claude-pr-review:${current.repository}#${current.prNumber}:${current.headSha}`,
    receiptDigest: sha256Digest(canonicalJson(payload)),
  };
  return [
    "<!-- HELIX:independent-pr-review-receipt:v1 -->",
    "```json",
    JSON.stringify({
      schema_version: "helix-independent-pr-review-comment.v1",
      receipt: legacy,
      kimi_provenance: null,
    }),
    "```",
  ].join("\n");
}

function legacyV2Receipt(current: ClaudePrReviewReceipt): ClaudePrReviewReceiptAny {
  const {
    authorModel: _authorModel,
    reviewerModel: _reviewerModel,
    schemaVersion: _schemaVersion,
    receiptId: _receiptId,
    receiptDigest: _receiptDigest,
    ...legacyInput
  } = current;
  const payload = { schemaVersion: CLAUDE_PR_REVIEW_RECEIPT_SCHEMA_V2, ...legacyInput };
  return {
    ...payload,
    receiptId: `claude-pr-review:${current.repository}#${current.prNumber}:${current.headSha}`,
    receiptDigest: sha256Digest(canonicalJson(payload)),
  };
}

function legacyV3Receipt(current: ClaudePrReviewReceipt = receipt()): ClaudePrReviewReceiptAny {
  const {
    schemaVersion: _schemaVersion,
    receiptId: _receiptId,
    receiptDigest: _receiptDigest,
    ciEvidenceGeneration: _ciEvidenceGeneration,
    supersedesReceiptId: _supersedesReceiptId,
    ...payload
  } = current;
  const legacyPayload = { schemaVersion: CLAUDE_PR_REVIEW_RECEIPT_SCHEMA_V3, ...payload };
  return {
    ...legacyPayload,
    receiptId: `claude-pr-review:${current.repository}#${current.prNumber}:${current.headSha}`,
    receiptDigest: sha256Digest(canonicalJson(legacyPayload)),
  } as ClaudePrReviewReceiptAny;
}

function renderClaudeReceiptEnvelope(receiptValue: ClaudePrReviewReceiptAny): string {
  return [
    "<!-- HELIX:independent-pr-review-receipt:v1 -->",
    "```json",
    JSON.stringify({
      schema_version: "helix-independent-pr-review-comment.v1",
      receipt: receiptValue,
      kimi_provenance: null,
    }),
    "```",
  ].join("\n");
}

/**
 * mixed authorship（両 runtime の実装 commit が同居するブランチ）の receipt。
 * 各 receipt は「相手 runtime が書いた分を自分がレビューした」証跡なので、
 * authorModel は reviewer とは別 runtime のものを載せる。
 */
function mixedReceipt(reviewerRuntime: IndependentReviewRuntime, commentSeq: number) {
  const db = logicalDbReceiptFixture();
  return buildClaudePrReviewReceipt({
    repository: "RetryYN/HELIX-HARNESS",
    prNumber: 488,
    prUrl: "https://github.com/RetryYN/HELIX-HARNESS/pull/488",
    headSha: HEAD,
    authorRuntime: "mixed",
    reviewerRuntime,
    authorModel: reviewerRuntime === "codex" ? "claude-sonnet-5" : "codex-gpt-5",
    reviewerModel: reviewerRuntime === "codex" ? "codex-gpt-5" : "claude-sonnet-5",
    reviewerSessionId: `${reviewerRuntime}-review-session`,
    verdict: "approve",
    blockerCount: 0,
    ciRunId: 31299806333,
    ciConclusion: "success",
    ciEvidenceGeneration: "run:31299806333:attempt:1:success",
    dbReceiptSchemaVersion: "helix-l3-g3-logical-db-bootstrap-receipt.v2",
    dbProjectionDigest: `sha256:${"1".repeat(64)}`,
    dbReplayProjectionDigest: `sha256:${"1".repeat(64)}`,
    dbCheckpointDigest: `sha256:${"2".repeat(64)}`,
    dbReplayCheckpointDigest: `sha256:${"2".repeat(64)}`,
    dbReceiptDigest: db.receipt_digest,
    dbConverged: true,
    commentUrl: `https://github.com/RetryYN/HELIX-HARNESS/pull/488#issuecomment-${commentSeq}`,
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
    current_db_receipt: logicalDbReceiptFixture(),
    comments: [
      {
        html_url: canonical.commentUrl,
        created_at: "2026-08-09T07:00:01.000Z",
        updated_at: "2026-08-09T07:00:01.000Z",
        body: renderIndependentPrReviewComment(canonical),
      },
    ],
    ci_runs: [
      {
        id: canonical.ciRunId,
        attempt: 1,
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

function kimiReview(options: { legacyVerifier?: boolean } = {}): {
  receipt: ProviderNeutralReviewReceiptV4;
  provenance: KimiReviewCommentProvenanceV1;
} {
  const currentVerifier = receipt(OTHER_HEAD, "2026-08-09T06:40:00.000Z");
  const verifier = options.legacyVerifier ? legacyV2Receipt(currentVerifier) : currentVerifier;
  const admissionPayload = {
    schema_version: "helix-kimi-review-fallback-admission.v2" as const,
    provider: "kimi" as const,
    task_class: "pr_convergence_review" as const,
    admitted_risk_classes: ["low", "medium"] as const,
    admission_lane_closure_digest: `sha256:${"7".repeat(64)}` as const,
    admission_implementation_head: OTHER_HEAD,
    benchmark_fixture_digest: `sha256:${"4".repeat(64)}` as const,
    negative_oracle_digest: `sha256:${"5".repeat(64)}` as const,
    independent_verifier_provider: "claude" as const,
    independent_verifier_receipt_digest: verifier.receiptDigest as `sha256:${string}`,
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
  const logicalDbReceipt = logicalDbReceiptFixture();
  const payload = {
    schema_version: "helix-independent-pr-review-receipt.v4" as const,
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
    fallback_lane_closure_digest: admission.admission_lane_closure_digest,
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
    db_receipt_digest: logicalDbReceipt.receipt_digest,
    db_converged: true as const,
    reviewed_at: REVIEWED_AT,
  };
  return {
    receipt: { ...payload, receipt_digest: sha256Digest(canonicalJson(payload)) },
    provenance: {
      admission_receipt: admission,
      admission_verifier_receipt: verifier,
      admission_verifier_comment: {
        html_url: verifier.commentUrl,
        created_at: "2026-08-09T06:41:00.000Z",
        updated_at: "2026-08-09T06:41:00.000Z",
        body: options.legacyVerifier
          ? renderClaudeReceiptEnvelope(verifier)
          : renderIndependentPrReviewComment(currentVerifier),
      },
      fallback_evidence: fallbackEvidence,
      lease,
      output,
      logical_db_receipt: logicalDbReceipt,
    },
  };
}

describe("GitHub cross-review admission", () => {
  it("U-GCRA-005: reviewed HEAD treeとmerge後commit treeのread-after同一性を要求する", () => {
    const canonical = {
      repository: "RetryYN/HELIX-HARNESS",
      pr_number: 494,
      pr_state: "MERGED" as const,
      candidate_head: HEAD,
      candidate_commit: HEAD,
      candidate_tree: "c".repeat(40),
      reported_merge_commit: "d".repeat(40),
      merge_commit: "d".repeat(40),
      merge_tree: "c".repeat(40),
      merge_parents: ["e".repeat(40), HEAD],
      observed_at: "2026-08-09T10:00:00.000Z",
      review_receipt_digest: `sha256:${"9".repeat(64)}`,
    };
    expect(evaluateReviewedMergeReadAfter(canonical)).toMatchObject({
      ok: true,
      receipt: {
        outcome: "verified",
        receipt_digest: expect.stringMatching(/^sha256:[0-9a-f]{64}$/u),
      },
      reasons: [],
    });
    expect(
      evaluateReviewedMergeReadAfter({ ...canonical, merge_tree: "f".repeat(40) }),
    ).toMatchObject({ ok: false, reasons: ["reviewed_tree_not_merged_tree"] });
    expect(evaluateReviewedMergeReadAfter({ ...canonical, merge_parents: [] })).toMatchObject({
      ok: false,
      reasons: ["reviewed_head_not_merge_parent"],
    });
    expect(
      evaluateReviewedMergeReadAfter({ ...canonical, merge_commit: "f".repeat(40) }),
    ).toMatchObject({ ok: false, reasons: ["merge_commit_mismatch"] });
    expect(evaluateReviewedMergeReadAfter({ ...canonical, pr_state: "OPEN" })).toMatchObject({
      ok: false,
      reasons: ["merge_not_observed"],
      receipt: { outcome: "merged_unverified" },
    });
    expect(
      evaluateReviewedMergeReadAfter({ ...canonical, candidate_commit: OTHER_HEAD }),
    ).toMatchObject({ ok: false, reasons: ["candidate_commit_mismatch"] });
    expect(
      evaluateReviewedMergeReadAfter({ ...canonical, observed_at: "not-a-time" }),
    ).toMatchObject({ ok: false, reasons: ["observed_at_invalid"] });
  });

  it("U-GCRA-005a: verified／merged_unverified full receiptをGit共通runtimeへimmutable保存する", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-reviewed-merge-"));
    try {
      const inputValue = {
        repository: "RetryYN/HELIX-HARNESS",
        pr_number: 494,
        pr_state: "MERGED" as const,
        candidate_head: HEAD,
        candidate_commit: HEAD,
        candidate_tree: "c".repeat(40),
        reported_merge_commit: "d".repeat(40),
        merge_commit: "d".repeat(40),
        merge_tree: "c".repeat(40),
        merge_parents: ["e".repeat(40), HEAD],
        observed_at: "2026-08-09T10:00:00.000Z",
        review_receipt_digest: `sha256:${"9".repeat(64)}`,
      };
      const verified = evaluateReviewedMergeReadAfter(inputValue).receipt;
      const verifiedPath = persistReviewedMergeReadAfterReceipt(root, verified);
      expect(JSON.parse(readFileSync(verifiedPath, "utf8"))).toEqual(verified);
      expect(statSync(verifiedPath).mode & 0o777).toBe(0o600);
      expect(persistReviewedMergeReadAfterReceipt(root, verified)).toBe(verifiedPath);

      expect(
        evaluateReviewedMergeReadAfter({
          ...inputValue,
          candidate_commit: null,
          candidate_tree: null,
        }),
      ).toMatchObject({
        ok: false,
        reasons: expect.arrayContaining(["candidate_commit_read_after_failed"]),
      });
      const failedDecision = evaluateReviewedMergeReadAfter({
        ...inputValue,
        candidate_commit: null,
        candidate_tree: null,
      });
      const failed = failedDecision.receipt;
      const failedPath = persistReviewedMergeReadAfterReceipt(root, failed);
      expect(failedPath).not.toBe(verifiedPath);
      expect(JSON.parse(readFileSync(failedPath, "utf8"))).toMatchObject({
        outcome: "merged_unverified",
        reasons: expect.arrayContaining(["candidate_commit_read_after_failed"]),
      });
      expect(() =>
        validateReviewedMergeReadAfterReceipt({ ...verified, candidate_tree: OTHER_HEAD }),
      ).toThrow("merge_read_after_receipt_invalid");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("U-GCRA-005b: pr-merge-reviewed production adapterが両commitをread-afterして成功判定へ接続する", () => {
    const cli = readFileSync(process.env.HELIX_GCRA_CLI_SOURCE ?? "src/cli.ts", "utf8");
    expect(cli).toContain("evaluateReviewedMergeReadAfter({");
    expect(cli).toMatch(/`repos\/\$\{repository\}\/git\/commits\/\$\{current\.headRefOid\}`/u);
    expect(cli).toMatch(/`repos\/\$\{repository\}\/git\/commits\/\$\{mergeCommit\}`/u);
    expect(cli).toContain("persistReviewedMergeReadAfterReceipt(");
    expect(cli).toContain('merged.status === 0 || parsed?.state === "MERGED"');
    expect(cli).toContain("mergeResult.readAfterReceiptDigest !== null");
    expect(cli).toContain("mergeResult.readAfterReceiptPath !== null");
    expect(cli).toContain("mergeResult.readAfterReasons.length === 0");
    expect(cli).not.toContain("mergeResult?.status === 0 &&");
    expect(cli).not.toMatch(/evaluateReviewedMergeReadAfter\([\s\S]{0,1200}\)\s*\|\|\s*true/u);
  });

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
    expect(evaluateGitHubCrossReviewAdmission(input({ current_db_receipt: {} }))).toMatchObject({
      ok: false,
      deferred: false,
      reasons: ["review_receipt_invalid_or_stale"],
    });
    const current = logicalDbReceiptFixture();
    const changedBody = {
      ...current,
      projection_digest: `sha256:${"8".repeat(64)}`,
      replay_projection_digest: `sha256:${"8".repeat(64)}`,
    } as Record<string, unknown>;
    delete changedBody.converged;
    delete changedBody.receipt_digest;
    const changedCurrent = {
      ...changedBody,
      converged: true,
      receipt_digest: sha256Digest(canonicalJson(changedBody)),
    };
    expect(
      evaluateGitHubCrossReviewAdmission(input({ current_db_receipt: changedCurrent })),
    ).toMatchObject({ ok: false, reasons: ["review_receipt_invalid_or_stale"] });
  });

  it("U-GCRA-010: Claude receiptへのprovider-neutral discriminator混入を誤分類しない", () => {
    const malformed = {
      ...receipt(),
      schema_version: "helix-claude-pr-review-receipt.v4",
    };
    const malformedBody = [
      "<!-- HELIX:independent-pr-review-receipt:v1 -->",
      "```json",
      JSON.stringify({
        schema_version: "helix-independent-pr-review-comment.v1",
        receipt: malformed,
        kimi_provenance: null,
      }),
      "```",
    ].join("\n");
    expect(
      evaluateGitHubCrossReviewAdmission(
        input({
          comments: [
            {
              html_url: receipt().commentUrl,
              created_at: "2026-08-09T07:00:01.000Z",
              updated_at: "2026-08-09T07:00:01.000Z",
              body: malformedBody,
            },
          ],
        }),
      ),
    ).toMatchObject({
      ok: false,
      reasons: ["review_receipt_invalid_or_stale"],
      candidate_diagnostics: [
        {
          comment_url: receipt().commentUrl,
          reason: "review_receipt_schema_invalid",
        },
      ],
    });
  });

  it("U-GCRA-012: invalid candidateは失敗predicateをtyped診断として返す", () => {
    expect(evaluateGitHubCrossReviewAdmission(input({ current_db_receipt: {} }))).toMatchObject({
      ok: false,
      reasons: ["review_receipt_invalid_or_stale"],
      candidate_diagnostics: [
        {
          comment_url: receipt().commentUrl,
          reason: "review_receipt_db_provenance_invalid",
        },
      ],
    });

    const wrongSchemaBody = renderClaudeReceiptEnvelope({
      ...receipt(),
      schemaVersion: "helix-claude-pr-review-receipt.v999",
    } as unknown as ClaudePrReviewReceipt);
    expect(
      evaluateGitHubCrossReviewAdmission(
        input({
          comments: [{ ...input().comments[0], body: wrongSchemaBody }],
        }),
      ),
    ).toMatchObject({
      ok: false,
      candidate_diagnostics: [
        {
          comment_url: receipt().commentUrl,
          reason: "review_receipt_schema_invalid",
        },
      ],
    });
  });

  it("U-GCRA-008: historical v2 receiptをcurrent Ready admissionへ昇格しない", () => {
    expect(
      evaluateGitHubCrossReviewAdmission(
        input({
          comments: [
            {
              html_url: receipt().commentUrl,
              created_at: "2026-08-09T07:00:01.000Z",
              updated_at: "2026-08-09T07:00:01.000Z",
              body: legacyV2ReviewComment(),
            },
          ],
        }),
      ),
    ).toMatchObject({
      ok: false,
      deferred: false,
      reasons: ["review_receipt_invalid_or_stale"],
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
              updated_at: "2026-08-09T07:00:01.000Z",
              body: renderProviderNeutralPrReviewComment(kimi.receipt, kimi.provenance),
            },
          ],
          current_db_receipt: kimi.provenance.logical_db_receipt,
        }),
      ),
    ).toMatchObject({ ok: true, receipt_digest: kimi.receipt.receipt_digest });
  });

  it("U-GCRA-001e: Kimi bootstrapはhistorical v2 verifier commentをshared decoderで検証する", () => {
    const kimi = kimiReview({ legacyVerifier: true });
    expect(
      evaluateGitHubCrossReviewAdmission(
        input({
          comments: [
            {
              html_url: "https://github.com/RetryYN/HELIX-HARNESS/pull/488#issuecomment-2",
              created_at: "2026-08-09T07:00:01.000Z",
              updated_at: "2026-08-09T07:00:01.000Z",
              body: renderProviderNeutralPrReviewComment(kimi.receipt, kimi.provenance),
            },
          ],
          current_db_receipt: kimi.provenance.logical_db_receipt,
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
              updated_at: "2026-08-09T07:00:01.000Z",
              body: renderProviderNeutralPrReviewComment(canonical.receipt, provenance),
            },
          ],
          current_db_receipt: canonical.provenance.logical_db_receipt,
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
    const verifier = {
      ...canonical.provenance,
      admission_verifier_comment: {
        ...canonical.provenance.admission_verifier_comment,
        body: "self-asserted verifier",
      },
    };
    expect(decide(verifier)).toMatchObject({ ok: false });
    const postAdmissionVerifier = {
      ...canonical.provenance,
      admission_verifier_comment: {
        ...canonical.provenance.admission_verifier_comment,
        updated_at: "2026-08-09T06:46:00.000Z",
      },
    };
    expect(decide(postAdmissionVerifier)).toMatchObject({ ok: false });
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
    const db = {
      ...canonical.provenance,
      logical_db_receipt: {
        ...canonical.provenance.logical_db_receipt,
        receipt_digest: `sha256:${"a".repeat(64)}`,
      },
    };
    expect(decide(db)).toMatchObject({ ok: false });
    expect(decide(canonical.provenance, { review_packet: "different packet" })).toMatchObject({
      ok: false,
    });
  });

  it("U-GCRA-001d: canonical DB receiptのexact schemaと収束式をfail-closeする", () => {
    const canonical = kimiReview().provenance.logical_db_receipt;
    expect(canonicalLogicalDbReceiptValid(canonical, HEAD)).toBe(true);
    const reseal = (mutation: Record<string, unknown>) => {
      const body = { ...canonical, ...mutation } as Record<string, unknown>;
      delete body.converged;
      delete body.receipt_digest;
      return { ...body, converged: true, receipt_digest: sha256Digest(canonicalJson(body)) };
    };
    const missing = { ...canonical } as Record<string, unknown>;
    delete missing.policy_digest;
    expect(canonicalLogicalDbReceiptValid(missing, HEAD)).toBe(false);
    expect(
      canonicalLogicalDbReceiptValid(
        reseal({ workspace_attestation: { tracked_workspace_required: true, clean: false } }),
        HEAD,
      ),
    ).toBe(false);
    for (const mutation of [
      { checkpoint_population_valid: false },
      { replay_checkpoint_row_counts: { artifact_registry: 2 } },
      { replay_schema_revision: 42 },
      { executed_excluded_projection_steps: ["projectRuntimeVerificationEvents"] },
      { unexpected_unstable_columns: ["plan_registry.updated_at"] },
    ]) {
      expect(canonicalLogicalDbReceiptValid(reseal(mutation), HEAD)).toBe(false);
    }
  });

  it("U-GCRA-002: PLAN自己申告やreceipt欠落をfail-closeする", () => {
    expect(
      evaluateGitHubCrossReviewAdmission(
        input({
          comments: [
            {
              html_url: "x",
              created_at: REVIEWED_AT,
              updated_at: REVIEWED_AT,
              body: "review_evidence: approve",
            },
          ],
        }),
      ),
    ).toMatchObject({
      ok: false,
      reasons: ["current_head_review_receipt_missing"],
    });
  });

  it("U-GCRA-030: legacy v3 receiptはcurrent Ready admissionへ昇格しない", () => {
    const legacy = legacyV3Receipt();
    expect(
      evaluateGitHubCrossReviewAdmission(
        input({
          comments: [
            {
              html_url: legacy.commentUrl,
              created_at: "2026-08-09T07:00:01.000Z",
              updated_at: "2026-08-09T07:00:01.000Z",
              body: renderClaudeReceiptEnvelope(legacy),
            },
          ],
        }),
      ),
    ).toMatchObject({ ok: false, reasons: ["review_receipt_invalid_or_stale"] });
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
              updated_at: "2026-08-09T07:00:01.000Z",
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
      ...receiptAsInput(receipt()),
      ciConclusion: "failure",
      ciEvidenceGeneration: "run:31299806333:attempt:1:failure",
      commentUrl: receipt().commentUrl,
    });
    expect(
      evaluateGitHubCrossReviewAdmission(
        input({
          comments: [
            {
              html_url: failedClaim.commentUrl,
              created_at: "2026-08-09T07:00:01.000Z",
              updated_at: "2026-08-09T07:00:01.000Z",
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

  // PLAN-RECOVERY-65-review-generation-deadlock — U-GCRA-032
  it("U-GCRA-032: 非success runは成功receiptをstale化せず新successだけが世代を更新する", () => {
    const canonical = receipt();
    const newerRun = {
      ...input().ci_runs[0],
      id: canonical.ciRunId + 1,
      updated_at: "2026-08-09T07:00:03.000Z",
      status: "in_progress",
      conclusion: null,
    };
    expect(
      evaluateGitHubCrossReviewAdmission(input({ ci_runs: [newerRun, input().ci_runs[0]] })),
    ).toMatchObject({ ok: true });

    for (const conclusion of ["failure", "cancelled"] as const) {
      expect(
        evaluateGitHubCrossReviewAdmission(
          input({
            ci_runs: [{ ...newerRun, status: "completed", conclusion }, input().ci_runs[0]],
          }),
        ),
      ).toMatchObject({ ok: true });
    }

    const newerSuccess = {
      ...newerRun,
      status: "completed",
      conclusion: "success",
    };
    expect(
      evaluateGitHubCrossReviewAdmission(input({ ci_runs: [newerSuccess, input().ci_runs[0]] })),
    ).toMatchObject({ ok: false, reasons: ["review_receipt_invalid_or_stale"] });

    expect(
      evaluateGitHubCrossReviewAdmission(
        input({
          comments: [
            {
              ...input().comments[0],
              created_at: "2026-08-09T07:00:05.000Z",
              updated_at: "2026-08-09T07:00:05.000Z",
              body: renderIndependentPrReviewComment(
                buildClaudePrReviewReceipt({
                  ...receiptAsInput(canonical),
                  ciRunId: newerSuccess.id,
                  ciEvidenceGeneration: `run:${newerSuccess.id}:attempt:${newerSuccess.attempt}:success`,
                  reviewedAt: "2026-08-09T07:00:04.000Z",
                  commentUrl: input().comments[0].html_url,
                }),
              ),
            },
          ],
          ci_runs: [newerSuccess, input().ci_runs[0]],
        }),
      ),
    ).toMatchObject({ ok: true });
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
              updated_at: "2026-08-09T06:59:59.000Z",
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

  // PLAN-RECOVERY-51 / Issue #553: bot 著（external）は dual-receipt を要求しない。
  it("U-GCRA-EXT-001: external 著者 PR は単一 receipt 経路で受理する", () => {
    const externalReceipt = (reviewerRuntime: IndependentReviewRuntime, commentSeq: number) => {
      const db = logicalDbReceiptFixture();
      return buildClaudePrReviewReceipt({
        repository: "RetryYN/HELIX-HARNESS",
        prNumber: 488,
        prUrl: "https://github.com/RetryYN/HELIX-HARNESS/pull/488",
        headSha: HEAD,
        authorRuntime: "external",
        reviewerRuntime,
        authorModel: "dependabot[bot]",
        reviewerModel: reviewerRuntime === "codex" ? "codex-gpt-5" : "claude-sonnet-5",
        reviewerSessionId: `${reviewerRuntime}-review-session`,
        verdict: "approve",
        blockerCount: 0,
        ciRunId: 31299806333,
        ciConclusion: "success",
        ciEvidenceGeneration: "run:31299806333:attempt:1:success",
        dbReceiptSchemaVersion: "helix-l3-g3-logical-db-bootstrap-receipt.v2",
        dbProjectionDigest: `sha256:${"1".repeat(64)}`,
        dbReplayProjectionDigest: `sha256:${"1".repeat(64)}`,
        dbCheckpointDigest: `sha256:${"2".repeat(64)}`,
        dbReplayCheckpointDigest: `sha256:${"2".repeat(64)}`,
        dbReceiptDigest: db.receipt_digest,
        dbConverged: true,
        commentUrl: `https://github.com/RetryYN/HELIX-HARNESS/pull/488#issuecomment-${commentSeq}`,
        reviewedAt: REVIEWED_AT,
      });
    };
    const comment = (reviewerRuntime: IndependentReviewRuntime, seq: number) => {
      const canonical = externalReceipt(reviewerRuntime, seq);
      return {
        html_url: canonical.commentUrl,
        created_at: "2026-08-09T07:00:01.000Z",
        updated_at: "2026-08-09T07:00:01.000Z",
        body: renderIndependentPrReviewComment(canonical),
      };
    };

    // bot 著 PR には守るべき HELIX 著者 runtime が無いため、どちらの reviewer 単独でも受理する。
    for (const reviewerRuntime of ["claude", "codex"] as const) {
      expect(
        evaluateGitHubCrossReviewAdmission(input({ comments: [comment(reviewerRuntime, 1)] })),
      ).toMatchObject({ ok: true, deferred: false, reasons: [] });
    }

    // 単一 receipt 経路である以上、2 通は従来どおり conflict とする（dual-receipt 経路ではない）。
    expect(
      evaluateGitHubCrossReviewAdmission(
        input({ comments: [comment("claude", 1), comment("codex", 2)] }),
      ),
    ).toMatchObject({ ok: false, reasons: ["review_receipt_conflict"] });
  });

  // Issue #539: Hybrid commit stacking が生む mixed authorship の admission
  it("U-GCRA-011: mixed 著者 PR は両 runtime の receipt が揃ったときだけ受理する", () => {
    const mixedComments = (reviewers: readonly IndependentReviewRuntime[]) =>
      reviewers.map((reviewerRuntime, index) => {
        const canonical = mixedReceipt(reviewerRuntime, index + 1);
        return {
          html_url: canonical.commentUrl,
          created_at: "2026-08-09T07:00:01.000Z",
          updated_at: "2026-08-09T07:00:01.000Z",
          body: renderIndependentPrReviewComment(canonical),
        };
      });

    // 両 runtime が相手の commit をレビューして初めて、混在ブランチ全体が独立レビュー済みになる。
    expect(
      evaluateGitHubCrossReviewAdmission(input({ comments: mixedComments(["claude", "codex"]) })),
    ).toMatchObject({ ok: true, deferred: false, reasons: [] });

    // 片方だけでは、その reviewer 自身が書いた commit が自己レビューのまま残る。
    for (const only of ["claude", "codex"] as const) {
      expect(
        evaluateGitHubCrossReviewAdmission(input({ comments: mixedComments([only]) })),
      ).toMatchObject({ ok: false, reasons: ["mixed_author_dual_review_incomplete"] });
    }

    // 同一 reviewer の 2 通で頭数だけ揃えても、もう一方の runtime の寄与は未レビューである。
    expect(
      evaluateGitHubCrossReviewAdmission(input({ comments: mixedComments(["claude", "claude"]) })),
    ).toMatchObject({ ok: false, reasons: ["mixed_author_dual_review_incomplete"] });

    // 両 runtime を含んでいても、同一 reviewer の重複を足した 3 通はちょうど 2 通契約に反する。
    expect(
      evaluateGitHubCrossReviewAdmission(
        input({ comments: mixedComments(["claude", "claude", "codex"]) }),
      ),
    ).toMatchObject({ ok: false, reasons: ["mixed_author_dual_review_incomplete"] });

    // mixed 2 通へ単一 runtime 申告を混ぜても、mixed-only 契約から外れるため拒否する。
    expect(
      evaluateGitHubCrossReviewAdmission(
        input({ comments: [...mixedComments(["claude", "codex"]), ...input().comments] }),
      ),
    ).toMatchObject({ ok: false, reasons: ["mixed_author_dual_review_incomplete"] });

    // 単一 runtime authored PR の複数 receipt は従来どおり conflict のまま（緩和しない）。
    expect(
      evaluateGitHubCrossReviewAdmission(
        input({ comments: [...input().comments, ...input().comments] }),
      ),
    ).toMatchObject({ ok: false, reasons: ["review_receipt_conflict"] });
  });

  // PLAN-RECOVERY-41-cross-review-admission-symmetry
  it("U-GCRA-006: author=claude / reviewer=codexのreceiptも同じcanonical経路で受理する", () => {
    const canonical = receipt(HEAD, REVIEWED_AT, {
      authorRuntime: "claude",
      reviewerRuntime: "codex",
    });

    expect(
      evaluateGitHubCrossReviewAdmission(
        input({
          comments: [
            {
              html_url: canonical.commentUrl,
              created_at: "2026-08-09T07:00:01.000Z",
              updated_at: "2026-08-09T07:00:01.000Z",
              body: renderIndependentPrReviewComment(canonical),
            },
          ],
        }),
      ),
    ).toMatchObject({ ok: true, receipt_digest: canonical.receiptDigest, reasons: [] });
  });

  // PLAN-RECOVERY-41-cross-review-admission-symmetry
  it("U-GCRA-007: 同一runtimeのself-review commentをcanonical receiptへ昇格しない", () => {
    // digest まで整合した self-review receipt を手組みする。digest 改変検知ではなく
    // 「独立性が無い receipt は decode 段階で canonical へ昇格しない」ことだけを分離して押さえる。
    const { schemaVersion, receiptId, receiptDigest: _ignored, ...body0 } = receipt();
    const payload = { ...body0, schemaVersion, authorRuntime: "claude", reviewerRuntime: "claude" };
    const selfReview = {
      ...payload,
      receiptId,
      receiptDigest: sha256Digest(canonicalJson(payload)),
    };
    const body = [
      "<!-- HELIX:independent-pr-review-receipt:v1 -->",
      "```json",
      JSON.stringify({
        schema_version: "helix-independent-pr-review-comment.v1",
        receipt: selfReview,
        kimi_provenance: null,
      }),
      "```",
    ].join("\n");

    expect(
      evaluateGitHubCrossReviewAdmission(
        input({
          comments: [
            {
              html_url: selfReview.commentUrl,
              created_at: "2026-08-09T07:00:01.000Z",
              updated_at: "2026-08-09T07:00:01.000Z",
              body,
            },
          ],
        }),
      ),
    ).toMatchObject({
      ok: false,
      reasons: ["review_receipt_invalid_or_stale"],
      candidate_diagnostics: [{ reason: "review_receipt_independence_invalid" }],
    });
  });
});

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  buildClaudePrReviewReceipt,
  renderIndependentPrReviewComment,
} from "../src/runtime/claude-pr-convergence";
import { canonicalJson, sha256Digest } from "../src/runtime/digest";
import {
  canonicalLogicalDbReceiptValid,
  evaluateGitHubCrossReviewAdmission,
  evaluateReviewedMergeReadAfter,
  type KimiReviewCommentProvenanceV1,
  renderProviderNeutralPrReviewComment,
} from "../src/runtime/github-cross-review-admission";
import {
  kimiReviewPacketDigest,
  type ProviderNeutralReviewReceiptV4,
} from "../src/runtime/independent-review-fallback";

const HEAD = "a".repeat(40);
const OTHER_HEAD = "b".repeat(40);
const REVIEWED_AT = "2026-08-09T07:00:00.000Z";
const REVIEW_PACKET = "exact review packet";

function receipt(headSha = HEAD, reviewedAt = REVIEWED_AT) {
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
    reviewedAt,
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
    current_db_receipt: {},
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
  receipt: ProviderNeutralReviewReceiptV4;
  provenance: KimiReviewCommentProvenanceV1;
} {
  const verifier = receipt(OTHER_HEAD, "2026-08-09T06:40:00.000Z");
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
  const dbBody = {
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
  const logicalDbReceipt = {
    ...dbBody,
    converged: true,
    receipt_digest: sha256Digest(canonicalJson(dbBody)),
  };
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
        body: renderIndependentPrReviewComment(verifier),
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
      candidate_tree: "c".repeat(40),
      reported_merge_commit: "d".repeat(40),
      merge_commit: "d".repeat(40),
      merge_tree: "c".repeat(40),
      merge_parents: ["e".repeat(40), HEAD],
    };
    expect(evaluateReviewedMergeReadAfter(canonical)).toMatchObject({
      ok: true,
      receipt_digest: expect.stringMatching(/^sha256:[0-9a-f]{64}$/u),
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
    });
  });

  it("U-GCRA-005b: pr-merge-reviewed production adapterが両commitをread-afterして成功判定へ接続する", () => {
    const cli = readFileSync("src/cli.ts", "utf8");
    expect(cli).toContain("evaluateReviewedMergeReadAfter({");
    expect(cli).toMatch(/`repos\/\$\{repository\}\/git\/commits\/\$\{current\.headRefOid\}`/u);
    expect(cli).toMatch(/`repos\/\$\{repository\}\/git\/commits\/\$\{mergeCommit\}`/u);
    expect(cli).toContain("mergeResult.readAfterReceiptDigest !== null");
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
});

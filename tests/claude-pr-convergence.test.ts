import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
// PLAN-L7-473-claude-pr-convergence / U-CPRCONV-001
// PLAN-L7-474-claude-pr-db-receipt-binding / U-CPRCONV-004
import {
  areRequiredChecksGreen,
  bindCanonicalLogicalDbReceipt,
  buildClaudePrReviewReceipt,
  CLAUDE_PR_REVIEW_RECEIPT_SCHEMA_V2,
  dispatchCreatedPrToClaude,
  evaluateClaudePrMerge,
  loadClaudePrReviewReceipt,
  parseClaudeIndependentPrReviewComment,
  persistClaudePrReviewReceipt,
  renderIndependentPrReviewComment,
  reviewedMergeArgs,
  validateClaudePrReviewReceipt,
} from "../src/runtime/claude-pr-convergence";
import { canonicalJson, sha256Digest } from "../src/runtime/digest";

const baseInput = {
  repository: "RetryYN/HELIX-HARNESS",
  prNumber: 149,
  prUrl: "https://github.com/RetryYN/HELIX-HARNESS/pull/149",
  headSha: "a".repeat(40),
  authorRuntime: "codex" as const,
  reviewerRuntime: "claude" as const,
  authorModel: "codex-gpt-5",
  reviewerModel: "claude-sonnet-5",
  reviewerSessionId: "claude-vscode-session",
  verdict: "approve" as const,
  blockerCount: 0,
  ciRunId: 123456,
  ciConclusion: "success" as const,
  dbReceiptSchemaVersion: "helix-l3-g3-logical-db-bootstrap-receipt.v2",
  dbProjectionDigest: `sha256:${"1".repeat(64)}`,
  dbReplayProjectionDigest: `sha256:${"1".repeat(64)}`,
  dbCheckpointDigest: `sha256:${"b".repeat(64)}`,
  dbReplayCheckpointDigest: `sha256:${"b".repeat(64)}`,
  dbReceiptDigest: `sha256:${"2".repeat(64)}`,
  dbConverged: true,
  commentUrl: "https://github.com/RetryYN/HELIX-HARNESS/pull/149#issuecomment-123",
  reviewedAt: "2026-07-27T00:00:00.000Z",
};

function legacyV2Receipt() {
  const { authorModel: _authorModel, reviewerModel: _reviewerModel, ...legacyInput } = baseInput;
  const payload = { schemaVersion: CLAUDE_PR_REVIEW_RECEIPT_SCHEMA_V2, ...legacyInput };
  return {
    ...payload,
    receiptId: `claude-pr-review:${baseInput.repository}#${baseInput.prNumber}:${baseInput.headSha}`,
    receiptDigest: sha256Digest(canonicalJson(payload)),
  };
}

function renderLegacyV2Comment(): string {
  return [
    "<!-- HELIX:independent-pr-review-receipt:v1 -->",
    "```json",
    JSON.stringify({
      schema_version: "helix-independent-pr-review-comment.v1",
      receipt: legacyV2Receipt(),
      kimi_provenance: null,
    }),
    "```",
  ].join("\n");
}

describe("Claude PR convergence contract (PLAN-L7-473)", () => {
  it("U-CPRCONV-006: GitHubのlatest effective required checkだけをadmissionへ使う", () => {
    const effectiveRequired = [{ bucket: "pass" }];
    expect(areRequiredChecksGreen(effectiveRequired)).toBe(true);
    expect(areRequiredChecksGreen([{ bucket: "fail" }])).toBe(false);
    expect(areRequiredChecksGreen([{ bucket: "pending" }])).toBe(false);
    expect(areRequiredChecksGreen([])).toBe(false);
    const cliSource = readFileSync(join(process.cwd(), "src/cli.ts"), "utf8");
    expect(cliSource).toContain(
      '["pr", "checks", String(prNumber), "--required", "--json", "bucket"]',
    );
    expect(cliSource).toContain("requiredChecksGreen: areRequiredChecksGreen(requiredChecks)");
    expect(cliSource).not.toContain("statusCheckRollup");
  });

  it("PR作成成功packetをClaude review requestへ自動接続する", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-created-pr-dispatch-"));
    try {
      execFileSync("git", ["init", "-q"], { cwd: root });
      const result = dispatchCreatedPrToClaude(root, {
        pullRequestUrl: baseInput.prUrl,
        headSha: baseInput.headSha,
        baseBranch: "main",
      });

      expect(result.memoryId).toContain("claude-inbox:pr:RetryYN/HELIX-HARNESS#149");
      const delivery = readFileSync(result.deliveryPath, "utf8");
      expect(delivery).toContain(baseInput.headSha);
      expect(delivery).toContain("CI完了前に「監視中」とだけ報告してturnを終了してはいけません");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
  it("U-CPRCONV-001: current HEADのClaude approve receiptだけをmerge可能にする", () => {
    const receipt = buildClaudePrReviewReceipt(baseInput);
    const result = evaluateClaudePrMerge(
      {
        repository: baseInput.repository,
        prNumber: baseInput.prNumber,
        prUrl: baseInput.prUrl,
        headSha: baseInput.headSha,
        state: "OPEN",
        requiredChecksGreen: true,
        receiptCiMatchesHead: true,
      },
      receipt,
    );

    expect(result).toEqual({ ok: true, reasons: [] });
  });

  it.each([
    ["旧HEAD", { headSha: "c".repeat(40) }, "review_head_stale"],
    ["CI red", { requiredChecksGreen: false }, "required_checks_not_green"],
    ["closed", { state: "CLOSED" as const }, "pr_not_open"],
  ])("%sをmerge拒否する", (_case, stateOverride, reason) => {
    const receipt = buildClaudePrReviewReceipt(baseInput);
    const result = evaluateClaudePrMerge(
      {
        repository: baseInput.repository,
        prNumber: baseInput.prNumber,
        prUrl: baseInput.prUrl,
        headSha: baseInput.headSha,
        state: "OPEN",
        requiredChecksGreen: true,
        receiptCiMatchesHead: true,
        ...stateOverride,
      },
      receipt,
    );

    expect(result.ok).toBe(false);
    expect(result.reasons).toContain(reason);
  });

  it("blocker付きapproveを拒否し、未収束DBのblock receiptは記録可能だがmerge拒否する", () => {
    expect(() => buildClaudePrReviewReceipt({ ...baseInput, blockerCount: 1 })).toThrow(
      "approve_with_blockers",
    );
    const blocked = buildClaudePrReviewReceipt({
      ...baseInput,
      verdict: "block",
      blockerCount: 1,
      ciConclusion: "failure",
      dbReceiptSchemaVersion: null,
      dbProjectionDigest: null,
      dbReplayProjectionDigest: null,
      dbCheckpointDigest: null,
      dbReplayCheckpointDigest: null,
      dbReceiptDigest: null,
      dbConverged: false,
    });
    expect(
      evaluateClaudePrMerge(
        {
          repository: baseInput.repository,
          prNumber: baseInput.prNumber,
          prUrl: baseInput.prUrl,
          headSha: baseInput.headSha,
          state: "OPEN",
          requiredChecksGreen: false,
          receiptCiMatchesHead: true,
        },
        blocked,
      ),
    ).toMatchObject({
      ok: false,
      reasons: expect.arrayContaining([
        "required_checks_not_green",
        "review_not_approved",
        "receipt_ci_not_green",
        "db_not_converged",
      ]),
    });
  });

  it("U-CPRCONV-004: caller supplied rowCounts-only digestをcanonical receiptとして拒否する", () => {
    const rowCountsOnly = `sha256:${"9".repeat(64)}`;
    expect(() =>
      bindCanonicalLogicalDbReceipt(
        { ...baseInput, dbCheckpointDigest: rowCountsOnly },
        {
          schema_version: "helix-l3-g3-logical-db-bootstrap-receipt.v2",
          projection_digest: baseInput.dbProjectionDigest,
          replay_projection_digest: baseInput.dbReplayProjectionDigest,
          checkpoint_digest: baseInput.dbCheckpointDigest,
          replay_checkpoint_digest: baseInput.dbReplayCheckpointDigest,
          receipt_digest: baseInput.dbReceiptDigest,
          converged: true,
        },
      ),
    ).toThrow("caller_db_claim_mismatch:dbCheckpointDigest");

    const input = {
      ...baseInput,
      dbReceiptSchemaVersion: null,
      dbProjectionDigest: null,
      dbReplayProjectionDigest: null,
      dbCheckpointDigest: null,
      dbReplayCheckpointDigest: null,
      dbReceiptDigest: null,
      dbConverged: true,
    };
    const bound = bindCanonicalLogicalDbReceipt(input, {
      schema_version: "helix-l3-g3-logical-db-bootstrap-receipt.v2",
      projection_digest: baseInput.dbProjectionDigest,
      replay_projection_digest: baseInput.dbReplayProjectionDigest,
      checkpoint_digest: baseInput.dbCheckpointDigest,
      replay_checkpoint_digest: baseInput.dbReplayCheckpointDigest,
      receipt_digest: baseInput.dbReceiptDigest,
      converged: true,
    });
    expect(buildClaudePrReviewReceipt(bound)).toMatchObject({
      dbProjectionDigest: baseInput.dbProjectionDigest,
      dbReplayProjectionDigest: baseInput.dbProjectionDigest,
      dbCheckpointDigest: baseInput.dbCheckpointDigest,
      dbReplayCheckpointDigest: baseInput.dbCheckpointDigest,
      dbConverged: true,
    });
  });

  it("別HEADのCI receiptをmerge拒否する", () => {
    const receipt = buildClaudePrReviewReceipt(baseInput);
    const result = evaluateClaudePrMerge(
      {
        repository: baseInput.repository,
        prNumber: baseInput.prNumber,
        prUrl: baseInput.prUrl,
        headSha: baseInput.headSha,
        state: "OPEN",
        requiredChecksGreen: true,
        receiptCiMatchesHead: false,
      },
      receipt,
    );

    expect(result).toEqual({ ok: false, reasons: ["receipt_ci_head_mismatch"] });
  });

  it("merge実行をreview済みHEADへ原子的に固定する", () => {
    expect(reviewedMergeArgs(149, baseInput.headSha)).toEqual([
      "pr",
      "merge",
      "149",
      "--merge",
      "--match-head-commit",
      baseInput.headSha,
    ]);
    expect(() => reviewedMergeArgs(149, "not-a-sha")).toThrow("head_sha_invalid");
  });

  it("receiptをGit共通dirへimmutable ACKとして保存しdigest改変を拒否する", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-claude-pr-receipt-"));
    try {
      const receipt = buildClaudePrReviewReceipt(baseInput);
      const path = persistClaudePrReviewReceipt(root, receipt);
      expect(loadClaudePrReviewReceipt(path)).toEqual(receipt);
      const damaged = JSON.parse(readFileSync(path, "utf8")) as typeof receipt;
      damaged.headSha = "d".repeat(40);
      expect(() => validateClaudePrReviewReceipt(damaged)).toThrow("receipt_id_invalid");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  // PLAN-RECOVERY-41-cross-review-admission-symmetry
  it("U-CPRCONV-007: author=claude / reviewer=codexの向きでもreceiptを構築しmerge可能にする", () => {
    const receipt = buildClaudePrReviewReceipt({
      ...baseInput,
      authorRuntime: "claude",
      reviewerRuntime: "codex",
      authorModel: "claude-sonnet-5",
      reviewerModel: "codex-gpt-5",
      reviewerSessionId: "codex-review-session",
    });

    expect(receipt.authorRuntime).toBe("claude");
    expect(receipt.reviewerRuntime).toBe("codex");
    expect(validateClaudePrReviewReceipt(receipt)).toEqual(receipt);
    expect(
      evaluateClaudePrMerge(
        {
          repository: baseInput.repository,
          prNumber: baseInput.prNumber,
          prUrl: baseInput.prUrl,
          headSha: baseInput.headSha,
          state: "OPEN",
          requiredChecksGreen: true,
          receiptCiMatchesHead: true,
        },
        receipt,
      ),
    ).toEqual({ ok: true, reasons: [] });
  });

  // PLAN-RECOVERY-41-cross-review-admission-symmetry
  it("U-CPRCONV-008: 同一runtimeのself-review receiptを構築時とmerge判定の両方で拒否する", () => {
    expect(() =>
      buildClaudePrReviewReceipt({
        ...baseInput,
        authorRuntime: "claude",
        reviewerRuntime: "claude",
      }),
    ).toThrow("runtime_independence_missing");

    // 構築を迂回して差し込まれたself-review receiptもmerge判定で止める（多層fail-close）。
    const forged = { ...buildClaudePrReviewReceipt(baseInput), reviewerRuntime: "codex" as const };
    expect(
      evaluateClaudePrMerge(
        {
          repository: baseInput.repository,
          prNumber: baseInput.prNumber,
          prUrl: baseInput.prUrl,
          headSha: baseInput.headSha,
          state: "OPEN",
          requiredChecksGreen: true,
          receiptCiMatchesHead: true,
        },
        { ...forged, authorRuntime: "codex" as const },
      ).reasons,
    ).toContain("runtime_independence_missing");
  });

  // PLAN-RECOVERY-41-cross-review-admission-symmetry
  it("U-CPRCONV-009: 未知のruntime識別子をreceipt構築時に拒否する", () => {
    expect(() =>
      buildClaudePrReviewReceipt({
        ...baseInput,
        reviewerRuntime: "kimi" as unknown as typeof baseInput.reviewerRuntime,
      }),
    ).toThrow("runtime_identity_invalid");
  });

  it("U-CPRCONV-010: model/provider独立性とruntime↔model対応を同じpair coreで拒否する", () => {
    expect(() =>
      buildClaudePrReviewReceipt({
        ...baseInput,
        reviewerModel: "codex-gpt-5.1",
      }),
    ).toThrow("model_independence_missing");
    expect(() =>
      buildClaudePrReviewReceipt({
        ...baseInput,
        authorModel: "unknown-author-model",
      }),
    ).toThrow("model_independence_missing");
    expect(() =>
      buildClaudePrReviewReceipt({
        ...baseInput,
        authorModel: "claude-sonnet-5",
        reviewerModel: "codex-gpt-5",
      }),
    ).toThrow("model_runtime_binding_mismatch");

    const forged = {
      ...buildClaudePrReviewReceipt(baseInput),
      reviewerModel: "codex-gpt-5.1",
    };
    expect(
      evaluateClaudePrMerge(
        {
          repository: baseInput.repository,
          prNumber: baseInput.prNumber,
          prUrl: baseInput.prUrl,
          headSha: baseInput.headSha,
          state: "OPEN",
          requiredChecksGreen: true,
          receiptCiMatchesHead: true,
        },
        forged,
      ).reasons,
    ).toContain("model_independence_missing");
  });

  it("U-CPRCONV-011: shared comment decoderはv3 currentとv2 historicalを読み分ける", () => {
    const current = buildClaudePrReviewReceipt(baseInput);
    expect(
      parseClaudeIndependentPrReviewComment(renderIndependentPrReviewComment(current)),
    ).toEqual(current);
    const legacy = legacyV2Receipt();
    expect(legacy.receiptDigest).toBe(
      "sha256:8fd9d7a24ebd7d8c3c171a8153e7420e092796a7233c5041db151cc4328d0e6a",
    );
    expect(parseClaudeIndependentPrReviewComment(renderLegacyV2Comment())).toEqual(legacy);
    const selfPayload = {
      ...legacy,
      authorRuntime: "claude" as const,
      reviewerRuntime: "claude" as const,
    };
    const { receiptDigest: _selfDigest, ...selfBody } = selfPayload;
    const sealedSelf = { ...selfBody, receiptDigest: sha256Digest(canonicalJson(selfBody)) };
    expect(() => validateClaudePrReviewReceipt(sealedSelf)).toThrow("receipt_v2_runtime_invalid");
    for (const [override, expectedReason] of [
      [{ headSha: "not-a-head" }, "head_sha_invalid"],
      [{ reviewerSessionId: "" }, "reviewer_session_id_required"],
      [{ ciRunId: 0 }, "ci_run_id_invalid"],
      [{ blockerCount: 1 }, "approve_with_blockers"],
      [
        { dbReplayProjectionDigest: `sha256:${"3".repeat(64)}` },
        "canonical_db_receipt_not_converged",
      ],
      [{ prUrl: "https://github.com/RetryYN/HELIX-HARNESS/pull/150" }, "pr_url_binding_mismatch"],
      [
        { commentUrl: "https://github.com/RetryYN/HELIX-HARNESS/pull/150#issuecomment-123" },
        "comment_url_binding_mismatch",
      ],
      [{ reviewedAt: "not-a-date" }, "reviewed_at_invalid"],
    ] as const) {
      const { receiptDigest: _invalidDigest, ...invalidBody } = { ...legacy, ...override };
      const sealedInvalid = {
        ...invalidBody,
        receiptDigest: sha256Digest(canonicalJson(invalidBody)),
      };
      expect(() => validateClaudePrReviewReceipt(sealedInvalid)).toThrow(expectedReason);
    }
    expect(
      parseClaudeIndependentPrReviewComment(
        ['```json\n{"unrelated":true}\n```', renderIndependentPrReviewComment(current)].join("\n"),
      ),
    ).toEqual(current);
    expect(
      parseClaudeIndependentPrReviewComment(
        `${renderIndependentPrReviewComment(current)}\n\`\`\`json\n{"extra":true}\n\`\`\``,
      ),
    ).toBeNull();
    expect(
      parseClaudeIndependentPrReviewComment(
        `${renderIndependentPrReviewComment(current)}\n${renderIndependentPrReviewComment(current)}`,
      ),
    ).toBeNull();
    expect(
      parseClaudeIndependentPrReviewComment(
        renderLegacyV2Comment().replace(legacy.receiptDigest, `sha256:${"0".repeat(64)}`),
      ),
    ).toBeNull();

    const root = mkdtempSync(join(tmpdir(), "helix-v2-current-reject-"));
    try {
      const path = join(root, "legacy.json");
      writeFileSync(path, `${JSON.stringify(legacy)}\n`);
      expect(() => loadClaudePrReviewReceipt(path)).toThrow("current_review_receipt_v3_required");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});

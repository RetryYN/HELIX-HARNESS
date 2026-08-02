import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
// PLAN-L7-473-claude-pr-convergence / U-CPRCONV-001
// PLAN-L7-474-claude-pr-db-receipt-binding / U-CPRCONV-004
import {
  areLatestRequiredChecksGreen,
  bindCanonicalLogicalDbReceipt,
  buildClaudePrReviewReceipt,
  dispatchCreatedPrToClaude,
  evaluateClaudePrMerge,
  loadClaudePrReviewReceipt,
  persistClaudePrReviewReceipt,
  reviewedMergeArgs,
  validateClaudePrReviewReceipt,
} from "../src/runtime/claude-pr-convergence";

const baseInput = {
  repository: "RetryYN/HELIX-HARNESS",
  prNumber: 149,
  prUrl: "https://github.com/RetryYN/HELIX-HARNESS/pull/149",
  headSha: "a".repeat(40),
  authorRuntime: "codex" as const,
  reviewerRuntime: "claude" as const,
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

describe("Claude PR convergence contract (PLAN-L7-473)", () => {
  it("U-CPRCONV-006: superseded check runをidentityごとのlatestへ正規化する", () => {
    const checks = [
      {
        typename: "CheckRun",
        workflowName: "harness-check",
        name: "windows-durability-smoke",
        status: "COMPLETED",
        conclusion: "CANCELLED",
        startedAt: "2026-07-27T21:45:20Z",
      },
      {
        typename: "CheckRun",
        workflowName: "harness-check",
        name: "windows-durability-smoke",
        status: "COMPLETED",
        conclusion: "SUCCESS",
        startedAt: "2026-07-27T21:46:03Z",
      },
      {
        typename: "CheckRun",
        workflowName: "harness-check",
        name: "harness-check",
        status: "COMPLETED",
        conclusion: "FAILURE",
        startedAt: "2026-07-27T21:45:56Z",
      },
      {
        typename: "CheckRun",
        workflowName: "harness-check",
        name: "harness-check",
        status: "COMPLETED",
        conclusion: "SUCCESS",
        startedAt: "2026-07-27T21:46:47Z",
      },
    ];

    expect(areLatestRequiredChecksGreen(checks)).toBe(true);
    expect(
      areLatestRequiredChecksGreen([
        ...checks,
        {
          ...checks[3],
          conclusion: "FAILURE",
          startedAt: "2026-07-27T22:00:00Z",
        },
      ]),
    ).toBe(false);
    expect(
      areLatestRequiredChecksGreen([
        ...checks,
        {
          ...checks[3],
          status: "IN_PROGRESS",
          conclusion: "",
          startedAt: "2026-07-27T22:00:00Z",
        },
      ]),
    ).toBe(false);
    const cliSource = readFileSync(join(process.cwd(), "src/cli.ts"), "utf8");
    expect(cliSource).toContain("requiredChecksGreen: areLatestRequiredChecksGreen(checks)");
    expect(cliSource).not.toContain("checks.every((check)");
  });

  it("required check identity・時刻欠落と同時刻の相反結果をfail-closeする", () => {
    const success = {
      typename: "CheckRun",
      workflowName: "harness-check",
      name: "harness-check",
      status: "COMPLETED",
      conclusion: "SUCCESS",
      startedAt: "2026-07-27T22:00:00Z",
    };
    expect(areLatestRequiredChecksGreen([])).toBe(false);
    expect(areLatestRequiredChecksGreen([{ ...success, workflowName: "" }])).toBe(false);
    expect(areLatestRequiredChecksGreen([{ ...success, startedAt: "invalid" }])).toBe(false);
    expect(areLatestRequiredChecksGreen([success, { ...success, conclusion: "FAILURE" }])).toBe(
      false,
    );
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
});

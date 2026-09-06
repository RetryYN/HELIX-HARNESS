import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
// PLAN-L7-473-claude-pr-convergence / U-CPRCONV-001
// PLAN-L7-474-claude-pr-db-receipt-binding / U-CPRCONV-004
// PLAN-L7-564-pr-review-comment-seal / U-CPRCONV-025, U-CPRCONV-027
// PLAN-RECOVERY-59-same-head-ci-review-rearm / U-CPRCONV-026
// PLAN-RECOVERY-100-review-receipt-schema-boundary / U-CPRCONV-040
import {
  AUTHOR_RUNTIME_EVIDENCE_QUERY,
  areRequiredChecksGreen,
  assertClaudePrReviewReceiptCorrectionTarget,
  assertClaudePrReviewReceiptSlotAvailable,
  authorRuntimeAttestation,
  authorRuntimeAttestationFailure,
  authorRuntimeEvidenceArgs,
  bindCanonicalLogicalDbReceipt,
  buildClaudePrReviewReceipt,
  CLAUDE_PR_REVIEW_RECEIPT_SCHEMA_V2,
  CLAUDE_PR_REVIEW_RECEIPT_SCHEMA_V3,
  type ClaudePrReviewReceipt,
  type ClaudePrReviewReceiptInput,
  claimClaudePrReviewReceiptSlot,
  dispatchMeasuredPrToClaude,
  evaluateClaudePrMerge,
  evaluateReviewReceiptCommentReadAfter,
  findClaudePrReviewReceipt,
  findPriorClaudePrReviewReceiptId,
  findReviewReceiptCommentPayload,
  ghEvidenceRunner,
  loadClaudePrReviewReceipt,
  measureAuthorRuntime,
  measuredAuthorRuntimeFromCommits,
  parseAuthorRuntimeEvidence,
  parseClaudeIndependentPrReviewComment,
  parseClaudePrCiEvidenceGeneration,
  persistClaudePrReviewReceipt,
  persistClaudePrReviewReceiptCorrection,
  releaseClaudePrReviewReceiptSlotClaim,
  renderIndependentPrReviewComment,
  resolveReviewReceiptCommentSealIntent,
  reviewedMergeArgs,
  safeClaudePrReviewReceiptName,
  validateClaudePrReviewReceipt,
  withClaudePrReviewReceiptSlotClaim,
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
  ciEvidenceGeneration: "run:123456:attempt:1:success",
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

function receiptAsInput(receipt: ClaudePrReviewReceipt): ClaudePrReviewReceiptInput {
  const {
    schemaVersion: _schemaVersion,
    receiptId: _receiptId,
    receiptDigest: _receiptDigest,
    ...input
  } = receipt;
  return input;
}

function canonicalDbReceipt(overrides: Record<string, unknown> = {}) {
  return {
    schema_version: "helix-l3-g3-logical-db-bootstrap-receipt.v2",
    source_head: baseInput.headSha,
    source_tree: "c".repeat(40),
    workspace_attestation: {
      tracked_workspace_required: true,
      status_entry_count: 0,
      status_digest: `sha256:${"0".repeat(64)}`,
      clean: true,
    },
    projection_digest: baseInput.dbProjectionDigest,
    replay_projection_digest: baseInput.dbReplayProjectionDigest,
    checkpoint_digest: baseInput.dbCheckpointDigest,
    replay_checkpoint_digest: baseInput.dbReplayCheckpointDigest,
    receipt_digest: baseInput.dbReceiptDigest,
    converged: true,
    ...overrides,
  };
}

function legacyV2Receipt() {
  const {
    authorModel: _authorModel,
    reviewerModel: _reviewerModel,
    ciEvidenceGeneration: _ciEvidenceGeneration,
    ...legacyInput
  } = baseInput;
  const payload = { schemaVersion: CLAUDE_PR_REVIEW_RECEIPT_SCHEMA_V2, ...legacyInput };
  return {
    ...payload,
    receiptId: `claude-pr-review:${baseInput.repository}#${baseInput.prNumber}:${baseInput.headSha}`,
    receiptDigest: sha256Digest(canonicalJson(payload)),
  };
}

function legacyV3Receipt() {
  const current = buildClaudePrReviewReceipt(baseInput);
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
  it("U-CPRCONV-025: null／空文字／field absentを実comment投稿へ正規化する", () => {
    const prUrl = "https://github.com/RetryYN/HELIX-HARNESS/pull/711";
    for (const value of [undefined, null, ""]) {
      expect(resolveReviewReceiptCommentSealIntent(prUrl, value)).toEqual({
        commentUrl: `${prUrl}#issuecomment-1`,
        requiresPost: true,
      });
    }
    expect(
      resolveReviewReceiptCommentSealIntent(
        prUrl,
        "https://github.com/RetryYN/HELIX-HARNESS/pull/711#issuecomment-5300843400",
      ),
    ).toEqual({
      commentUrl: "https://github.com/RetryYN/HELIX-HARNESS/pull/711#issuecomment-5300843400",
      requiresPost: false,
    });
    expect(() => resolveReviewReceiptCommentSealIntent(prUrl, 1)).toThrow("comment_url_invalid");
    for (const invalidUrl of [
      `${prUrl}#issuecomment-1`,
      `${prUrl}#issuecomment-`,
      `${prUrl}#issuecomment-0`,
      `${prUrl}#issuecomment-not-a-number`,
      "https://github.com/RetryYN/HELIX-HARNESS/pull/712#issuecomment-5300843400",
    ]) {
      expect(() => resolveReviewReceiptCommentSealIntent(prUrl, invalidUrl)).toThrow(
        "comment_url_invalid",
      );
    }

    const cliSource = readFileSync(join(process.cwd(), "src/cli.ts"), "utf8");
    expect(cliSource.match(/opts\.apply && commentSeal\.requiresPost/gu)).toHaveLength(1);
    expect(cliSource).not.toContain("opts.apply && raw.commentUrl === undefined");
  });

  it("U-CPRCONV-027: well-formedでもGitHubに存在しないcomment URLをread-afterで拒否する", () => {
    const receipt = buildClaudePrReviewReceipt(baseInput);
    const body = renderIndependentPrReviewComment(receipt);
    expect(
      evaluateReviewReceiptCommentReadAfter({
        expectedCommentUrl: receipt.commentUrl,
        expectedReceiptDigest: receipt.receiptDigest,
        fetchedHtmlUrl: receipt.commentUrl,
        fetchedBody: body,
      }),
    ).toEqual({ ok: true });
    expect(
      evaluateReviewReceiptCommentReadAfter({
        expectedCommentUrl: receipt.commentUrl,
        expectedReceiptDigest: receipt.receiptDigest,
        fetchedHtmlUrl: undefined,
        fetchedBody: undefined,
      }),
    ).toEqual({ ok: false, reason: "review_comment_read_after_not_found" });
    expect(
      evaluateReviewReceiptCommentReadAfter({
        expectedCommentUrl: receipt.commentUrl,
        expectedReceiptDigest: receipt.receiptDigest,
        fetchedHtmlUrl: `${receipt.commentUrl}-stale`,
        fetchedBody: body,
      }),
    ).toEqual({ ok: false, reason: "review_comment_read_after_url_mismatch" });
    expect(
      evaluateReviewReceiptCommentReadAfter({
        expectedCommentUrl: receipt.commentUrl,
        expectedReceiptDigest: `sha256:${"f".repeat(64)}`,
        fetchedHtmlUrl: receipt.commentUrl,
        fetchedBody: body,
      }),
    ).toEqual({ ok: false, reason: "review_comment_read_after_receipt_mismatch" });

    const cliSource = readFileSync(join(process.cwd(), "src/cli.ts"), "utf8");
    expect(cliSource).toContain("readAfterClaudePrReviewComment");
    expect(cliSource).toContain("opts.apply && !providerNeutral");
  });

  it("U-CPRCONV-034: issue comment一覧fallbackは同一URLのcommentだけを返す", () => {
    const expectedCommentUrl = baseInput.commentUrl;
    const body = renderIndependentPrReviewComment(buildClaudePrReviewReceipt(baseInput));
    expect(
      findReviewReceiptCommentPayload({
        expectedCommentUrl,
        fetchedComments: [
          [
            { html_url: "https://github.com/RetryYN/HELIX-HARNESS/pull/149#issuecomment-999" },
            { html_url: expectedCommentUrl, body },
          ],
        ],
      }),
    ).toEqual({ html_url: expectedCommentUrl, body });
    expect(
      findReviewReceiptCommentPayload({
        expectedCommentUrl,
        fetchedComments: [
          { html_url: "https://github.com/RetryYN/HELIX-HARNESS/pull/149#issuecomment-999" },
        ],
      }),
    ).toBeNull();
  });

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

  it("U-CPRCONV-022: [PLAN-RECOVERY-46] 実測とdispatch許可判定を単一core境界で固定する", () => {
    const evidence = (message: string) =>
      `1:0:${Buffer.from(message, "utf8").toString("base64")}\n`;
    const root = mkdtempSync(join(tmpdir(), "helix-measured-pr-dispatch-"));
    try {
      execFileSync("git", ["init", "-q"], { cwd: root });
      const input = {
        repository: baseInput.repository,
        prNumber: baseInput.prNumber,
        pullRequestUrl: baseInput.prUrl,
        headSha: baseInput.headSha,
        baseBranch: "main",
      };

      const codex = dispatchMeasuredPrToClaude(root, {
        ...input,
        run: () => ({ status: 0, stdout: evidence("feat: codex contribution") }),
      });
      expect(codex.measured).toBe("codex");
      expect(readFileSync(codex.deliveryPath, "utf8")).toContain("measured_author_runtime: codex");

      expect(() =>
        dispatchMeasuredPrToClaude(root, {
          ...input,
          run: () => ({
            status: 0,
            stdout: evidence(
              "feat: claude contribution\n\nCo-Authored-By: Claude Opus 5 <noreply@anthropic.com>",
            ),
          }),
        }),
      ).toThrow("claude_self_review_request_rejected");

      expect(() =>
        dispatchMeasuredPrToClaude(root, {
          ...input,
          run: () => ({ status: 0, stdout: "" }),
        }),
      ).toThrow("author_runtime_evidence_unavailable");

      const calls: string[][] = [];
      for (const mismatched of [
        { ...input, repository: "RetryYN/OTHER" },
        { ...input, prNumber: input.prNumber + 1 },
        {
          ...input,
          repository: "RetryYN",
          pullRequestUrl: `https://github.com/RetryYN/pull/${input.prNumber}`,
        },
        {
          ...input,
          repository: "RetryYN/HELIX-HARNESS/extra",
          pullRequestUrl: `https://github.com/RetryYN/HELIX-HARNESS/extra/pull/${input.prNumber}`,
        },
        {
          ...input,
          prNumber: 0,
          pullRequestUrl: `https://github.com/${input.repository}/pull/0`,
        },
        {
          ...input,
          prNumber: 1.5,
          pullRequestUrl: `https://github.com/${input.repository}/pull/1.5`,
        },
      ]) {
        expect(() =>
          dispatchMeasuredPrToClaude(root, {
            ...mismatched,
            run: (args) => {
              calls.push([...args]);
              return { status: 0, stdout: evidence("feat: codex contribution") };
            },
          }),
        ).toThrow("pr_dispatch_identity_mismatch");
      }
      expect(calls).toHaveLength(0);

      for (const invalid of [
        { ...input, headSha: "not-a-sha", failure: "pr_dispatch_head_invalid" },
        { ...input, baseBranch: " ", failure: "pr_dispatch_base_branch_invalid" },
      ]) {
        expect(() =>
          dispatchMeasuredPrToClaude(root, {
            ...invalid,
            run: (args) => {
              calls.push([...args]);
              return { status: 0, stdout: evidence("feat: codex contribution") };
            },
          }),
        ).toThrow(invalid.failure);
      }
      expect(calls).toHaveLength(0);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("U-CPRCONV-023: pr-notify実CLIがfake gh evidenceを実測し、両CLI callsiteが同じcoreを使う", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-pr-notify-cli-"));
    const fakeBin = join(root, "bin");
    try {
      execFileSync("git", ["init", "-q"], { cwd: root });
      mkdirSync(fakeBin, { recursive: true });
      writeFileSync(
        join(fakeBin, "gh"),
        [
          "#!/bin/sh",
          'if [ "$1" = "pr" ] && [ "$2" = "view" ]; then',
          '  printf \'%s\' \'{"url":"https://github.com/RetryYN/HELIX-HARNESS/pull/557","headRefOid":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa","baseRefName":"main","state":"OPEN"}\'',
          'elif [ "$1" = "run" ] && [ "$2" = "list" ]; then',
          '  printf \'%s\' \'[{"databaseId":31912034679,"headSha":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa","status":"completed","conclusion":"failure","attempt":1,"updatedAt":"2026-08-17T00:01:00Z","event":"pull_request","name":"harness-check"},{"databaseId":31912034678,"headSha":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa","status":"completed","conclusion":"success","attempt":2,"updatedAt":"2026-08-17T00:00:00Z","event":"pull_request","name":"harness-check"}]\'',
          'elif [ "$1" = "api" ]; then',
          '  if [ "$AUTHOR_EVIDENCE" = "claude" ]; then',
          "    printf '1:0:%s\\n' 'ZmVhdDogY2xhdWRlCgpDby1BdXRob3JlZC1CeTogQ2xhdWRlIFggPHhAeT4='",
          "  else",
          "    printf '1:0:%s\\n' 'ZmVhdDogY29kZXg='",
          "  fi",
          "fi",
        ].join("\n"),
        { mode: 0o755 },
      );
      const run = (mode: "codex" | "claude") => {
        try {
          const stdout = execFileSync(
            "node",
            [
              "--import",
              join(process.cwd(), "node_modules/tsx/dist/loader.mjs"),
              join(process.cwd(), "src/cli.ts"),
              "github",
              "pr-notify",
              "--pr",
              "557",
            ],
            {
              cwd: root,
              env: {
                ...process.env,
                PATH: `${fakeBin}:${process.env.PATH ?? ""}`,
                AUTHOR_EVIDENCE: mode,
              },
              encoding: "utf8",
              stdio: ["ignore", "pipe", "pipe"],
            },
          );
          return { status: 0, stdout, stderr: "" };
        } catch (error) {
          const failure = error as { status?: number; stdout?: string; stderr?: string };
          return {
            status: failure.status ?? -1,
            stdout: failure.stdout ?? "",
            stderr: failure.stderr ?? "",
          };
        }
      };

      const codex = run("codex");
      expect(codex.status, codex.stderr || codex.stdout).toBe(0);
      expect(codex.stdout).toContain("github pr-notify: queued pr=557");
      expect(codex.stdout).toContain("ci=run:31912034678:attempt:2:success");
      const claude = run("claude");
      expect(claude.status).not.toBe(0);
      expect(claude.stderr).toContain("claude_self_review_request_rejected");

      const cli = readFileSync(join(process.cwd(), "src/cli.ts"), "utf8");
      expect(cli.match(/dispatchMeasuredPrToClaude\(process\.cwd\(\),/gu)).toHaveLength(2);
      expect(cli.match(/run: ghEvidenceRunner\(spawnSync, process\.cwd\(\)\)/gu)).toHaveLength(3);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("U-CPRCONV-026: pr-notifyはCI evidence取得の3つのfail-closeを外部通知へ進めない", () => {
    const cases = [
      ["unavailable", "pr_ci_evidence_unavailable"],
      ["not-terminal", "pr_ci_evidence_not_terminal"],
      ["missing", "pr_ci_evidence_missing"],
    ] as const;

    for (const [evidenceCase, expectedFailure] of cases) {
      const root = mkdtempSync(join(tmpdir(), "helix-pr-notify-ci-evidence-fail-close-"));
      const fakeBin = join(root, "bin");
      try {
        execFileSync("git", ["init", "-q"], { cwd: root });
        mkdirSync(fakeBin, { recursive: true });
        writeFileSync(
          join(fakeBin, "gh"),
          [
            "#!/bin/sh",
            'if [ "$1" = "pr" ] && [ "$2" = "view" ]; then',
            '  printf \'%s\' \'{"url":"https://github.com/RetryYN/HELIX-HARNESS/pull/764","headRefOid":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa","baseRefName":"main","state":"OPEN"}\'',
            'elif [ "$1" = "run" ] && [ "$2" = "list" ]; then',
            '  case "$CI_EVIDENCE_CASE" in',
            "    unavailable) exit 7 ;;",
            '    not-terminal) printf \'%s\' \'[{"databaseId":31982707990,"headSha":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa","status":"in_progress","conclusion":null,"attempt":1,"updatedAt":"2026-08-17T00:00:00Z","event":"pull_request","name":"harness-check"}]\' ;;',
            "    missing) printf '%s' '[]' ;;",
            "  esac",
            "fi",
          ].join("\n"),
          { mode: 0o755 },
        );

        const run = spawnSync(
          process.execPath,
          [
            "--import",
            join(process.cwd(), "node_modules/tsx/dist/loader.mjs"),
            join(process.cwd(), "src/cli.ts"),
            "github",
            "pr-notify",
            "--pr",
            "764",
          ],
          {
            cwd: root,
            env: {
              ...process.env,
              HELIX_SKIP_UPDATE_CHECK: "1",
              PATH: [fakeBin, process.env.PATH ?? ""].join(":"),
              CI_EVIDENCE_CASE: evidenceCase,
            },
            encoding: "utf8",
          },
        );

        expect(run.status).not.toBe(0);
        expect(run.stderr).toContain(`github pr-notify rejected: ${expectedFailure}`);
      } finally {
        rmSync(root, { recursive: true, force: true });
      }
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
        receiptCiMatchesGeneration: true,
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
        receiptCiMatchesGeneration: true,
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
      ciEvidenceGeneration: "run:123456:attempt:1:failure",
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
          receiptCiMatchesGeneration: true,
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

  it("U-CPRCONV-031: stale CI generationは同一HEADでもmerge admissionを拒否する", () => {
    const receipt = buildClaudePrReviewReceipt(baseInput);
    const decision = evaluateClaudePrMerge(
      {
        repository: baseInput.repository,
        prNumber: baseInput.prNumber,
        prUrl: baseInput.prUrl,
        headSha: baseInput.headSha,
        state: "OPEN",
        requiredChecksGreen: true,
        receiptCiMatchesHead: true,
        receiptCiMatchesGeneration: false,
      },
      receipt,
    );
    expect(decision).toMatchObject({
      ok: false,
      reasons: expect.arrayContaining(["receipt_ci_generation_mismatch"]),
    });
  });

  it("U-CPRCONV-032: CI generation一致の省略はmerge admissionをfail-closeする", () => {
    const receipt = buildClaudePrReviewReceipt(baseInput);
    const state = {
      repository: baseInput.repository,
      prNumber: baseInput.prNumber,
      prUrl: baseInput.prUrl,
      headSha: baseInput.headSha,
      state: "OPEN" as const,
      requiredChecksGreen: true,
      receiptCiMatchesHead: true,
    } as unknown as Parameters<typeof evaluateClaudePrMerge>[0];
    const decision = evaluateClaudePrMerge(state, receipt);
    expect(decision).toMatchObject({
      ok: false,
      reasons: expect.arrayContaining(["receipt_ci_generation_mismatch"]),
    });
  });

  it("U-CPRCONV-004: caller supplied rowCounts-only digestをcanonical receiptとして拒否する", () => {
    const rowCountsOnly = `sha256:${"9".repeat(64)}`;
    expect(() =>
      bindCanonicalLogicalDbReceipt(
        { ...baseInput, dbCheckpointDigest: rowCountsOnly },
        canonicalDbReceipt(),
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
    const bound = bindCanonicalLogicalDbReceipt(input, canonicalDbReceipt());
    expect(buildClaudePrReviewReceipt(bound)).toMatchObject({
      dbProjectionDigest: baseInput.dbProjectionDigest,
      dbReplayProjectionDigest: baseInput.dbProjectionDigest,
      dbCheckpointDigest: baseInput.dbCheckpointDigest,
      dbReplayCheckpointDigest: baseInput.dbCheckpointDigest,
      dbConverged: true,
    });
  });

  it("U-CPRCONV-038: DB receiptのsource HEADがreview対象HEADと異なる場合は拒否する", () => {
    expect(() =>
      bindCanonicalLogicalDbReceipt(
        { ...baseInput, dbProjectionDigest: null },
        canonicalDbReceipt({ source_head: "d".repeat(40) }),
      ),
    ).toThrow("canonical_db_source_head_mismatch");
  });

  it("U-CPRCONV-039: dirty working tree由来のDB receiptは拒否する", () => {
    expect(() =>
      bindCanonicalLogicalDbReceipt(
        { ...baseInput, dbProjectionDigest: null },
        canonicalDbReceipt({
          workspace_attestation: {
            tracked_workspace_required: true,
            status_entry_count: 1,
            status_digest: `sha256:${"9".repeat(64)}`,
            clean: false,
          },
        }),
      ),
    ).toThrow("canonical_db_workspace_dirty");
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
        receiptCiMatchesGeneration: true,
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

  it("U-CPRCONV-024: mixed authorshipの両runtime receiptを同一HEADへimmutable保存する", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-mixed-pr-receipt-"));
    try {
      const claude = buildClaudePrReviewReceipt({
        ...baseInput,
        authorRuntime: "mixed",
        authorModel: "codex-gpt-5",
      });
      const codex = buildClaudePrReviewReceipt({
        ...baseInput,
        authorRuntime: "mixed",
        reviewerRuntime: "codex",
        authorModel: "claude-sonnet-5",
        reviewerModel: "codex-gpt-5",
        reviewerSessionId: "codex-review-session",
        commentUrl: "https://github.com/RetryYN/HELIX-HARNESS/pull/149#issuecomment-124",
      });
      const claudePath = persistClaudePrReviewReceipt(root, claude);
      const codexPath = persistClaudePrReviewReceipt(root, codex);
      expect(safeClaudePrReviewReceiptName(claude)).toBe(
        `RetryYN_HELIX-HARNESS_149_${baseInput.headSha}_claude_run_123456_attempt_1_success.json`,
      );
      expect(safeClaudePrReviewReceiptName(codex)).toBe(
        `RetryYN_HELIX-HARNESS_149_${baseInput.headSha}_codex_run_123456_attempt_1_success.json`,
      );
      expect(claudePath).not.toBe(codexPath);
      expect(claudePath).toMatch(/_claude_run_123456_attempt_1_success\.json$/);
      expect(codexPath).toMatch(/_codex_run_123456_attempt_1_success\.json$/);
      expect(loadClaudePrReviewReceipt(claudePath)).toEqual(claude);
      expect(loadClaudePrReviewReceipt(codexPath)).toEqual(codex);
      expect(() => assertClaudePrReviewReceiptSlotAvailable(root, codex)).toThrow(
        "review_receipt_slot_occupied",
      );

      const conflict = buildClaudePrReviewReceipt({
        ...receiptAsInput(codex),
        reviewedAt: "2026-07-27T00:00:01.000Z",
      });
      expect(() => persistClaudePrReviewReceipt(root, conflict)).toThrow("review_receipt_conflict");
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
          receiptCiMatchesGeneration: true,
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
          receiptCiMatchesGeneration: true,
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
          receiptCiMatchesGeneration: true,
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
      expect(() => loadClaudePrReviewReceipt(path)).toThrow("current_review_receipt_v4_required");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  // PLAN-RECOVERY-42-author-runtime-attestation（Issue #534）。
  it("U-CPRCONV-028: CI evidence generationをreceipt identityへ束縛する", () => {
    expect(parseClaudePrCiEvidenceGeneration(baseInput.ciEvidenceGeneration)).toEqual({
      runId: 123456,
      attempt: 1,
      conclusion: "success",
    });
    expect(() =>
      buildClaudePrReviewReceipt({
        ...baseInput,
        ciEvidenceGeneration: "run:123456:attempt:1:failure",
      }),
    ).toThrow("ci_evidence_generation_conclusion_mismatch");
    expect(() =>
      buildClaudePrReviewReceipt({ ...baseInput, ciEvidenceGeneration: "not-a-generation" }),
    ).toThrow("ci_evidence_generation_invalid");
    expect(() =>
      validateClaudePrReviewReceipt({
        ...buildClaudePrReviewReceipt(baseInput),
        supersedesReceiptId: 7,
      } as unknown),
    ).toThrow("receipt_supersedes_invalid");
    const next = buildClaudePrReviewReceipt({
      ...baseInput,
      ciRunId: 123457,
      ciEvidenceGeneration: "run:123457:attempt:2:success",
    });
    const current = buildClaudePrReviewReceipt(baseInput);
    expect(next.receiptId).not.toBe(current.receiptId);
    expect(next.receiptId).toContain("claude:run:123457:attempt:2:success");
    expect(safeClaudePrReviewReceiptName(next)).toContain("run_123457_attempt_2_success");
  });

  it("U-CPRCONV-036: producerは未来のreviewedAtをfail-closeする", () => {
    expect(() =>
      buildClaudePrReviewReceipt({
        ...baseInput,
        reviewedAt: "2999-01-01T00:00:00.000Z",
      }),
    ).toThrow("reviewed_at_future");
  });

  it("U-CPRCONV-040: producerとdecoderはunknown fieldを入口で拒否する", () => {
    expect(() =>
      buildClaudePrReviewReceipt({
        ...baseInput,
        schema_version: "helix-claude-pr-review-receipt.v4",
        attacker_controlled: "must-not-survive",
      } as typeof baseInput),
    ).toThrow("receipt_input_fields_invalid");

    expect(() =>
      validateClaudePrReviewReceipt({
        ...buildClaudePrReviewReceipt(baseInput),
        schema_version: "helix-claude-pr-review-receipt.v4",
      }),
    ).toThrow("receipt_fields_invalid");
  });

  it("U-CPRCONV-029: v3はread-only互換でcurrent loadとcomment read-afterを通さない", () => {
    const legacy = legacyV3Receipt();
    expect(validateClaudePrReviewReceipt(legacy)).toEqual(legacy);
    const body = [
      "<!-- HELIX:independent-pr-review-receipt:v1 -->",
      "```json",
      JSON.stringify({
        schema_version: "helix-independent-pr-review-comment.v1",
        receipt: legacy,
        kimi_provenance: null,
      }),
      "```",
    ].join("\n");
    expect(parseClaudeIndependentPrReviewComment(body)).toEqual(legacy);
    expect(
      evaluateReviewReceiptCommentReadAfter({
        expectedCommentUrl: legacy.commentUrl,
        expectedReceiptDigest: legacy.receiptDigest,
        fetchedHtmlUrl: legacy.commentUrl,
        fetchedBody: body,
      }),
    ).toMatchObject({ ok: false, reason: "review_comment_read_after_receipt_mismatch" });
    const root = mkdtempSync(join(tmpdir(), "helix-v3-read-only-"));
    try {
      const path = join(root, "legacy-v3.json");
      writeFileSync(path, JSON.stringify(legacy));
      expect(() => loadClaudePrReviewReceipt(path)).toThrow("current_review_receipt_v4_required");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("U-CPRCONV-030: generation更新はsupersedes履歴を残し同一generation再保存を冪等にする", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-generation-history-"));
    try {
      const first = buildClaudePrReviewReceipt(baseInput);
      const firstPath = persistClaudePrReviewReceipt(root, first);
      const second = buildClaudePrReviewReceipt({
        ...baseInput,
        ciRunId: 123457,
        ciEvidenceGeneration: "run:123457:attempt:2:success",
        supersedesReceiptId: first.receiptId,
      });
      const secondPath = persistClaudePrReviewReceipt(root, second);
      expect(secondPath).not.toBe(firstPath);
      expect(persistClaudePrReviewReceipt(root, second)).toBe(secondPath);
      expect(findClaudePrReviewReceipt(root, second)).toEqual(second);
      expect(findPriorClaudePrReviewReceiptId(root, second)).toBe(first.receiptId);
      expect(loadClaudePrReviewReceipt(firstPath)).toEqual(first);
      const claim = claimClaudePrReviewReceiptSlot(root, second);
      expect(() => claimClaudePrReviewReceiptSlot(root, second)).toThrow(
        "review_receipt_generation_in_progress",
      );
      releaseClaudePrReviewReceiptSlotClaim(claim);
      expect(() => loadClaudePrReviewReceipt(claim.path)).toThrow();
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  // PLAN-RECOVERY-102-review-receipt-correction-generation / U-CPRCONV-041
  it("U-CPRCONV-041: malformed immutable slotを保持して同一identityの訂正を別slotへsealする", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-receipt-correction-"));
    try {
      const receipt = buildClaudePrReviewReceipt(baseInput);
      const receiptDir = join(root, ".helix", "state", "claude-pr-convergence", "receipts");
      mkdirSync(receiptDir, { recursive: true });
      const malformedPath = join(receiptDir, safeClaudePrReviewReceiptName(receipt));
      const malformedBytes = '{"schemaVersion":"helix-claude-pr-review-receipt.v4"}\n';
      writeFileSync(malformedPath, malformedBytes, { mode: 0o600 });

      const persisted = persistClaudePrReviewReceiptCorrection(root, receipt, "schema_invalid");

      expect(readFileSync(malformedPath, "utf8")).toBe(malformedBytes);
      expect(loadClaudePrReviewReceipt(persisted.receiptPath)).toEqual(receipt);
      expect(findClaudePrReviewReceipt(root, receipt)).toEqual(receipt);
      expect(JSON.parse(readFileSync(persisted.authorizationPath, "utf8"))).toMatchObject({
        schema_version: "helix-review-receipt-correction-authorization.v1",
        target_receipt_id: receipt.receiptId,
        repository: receipt.repository,
        pr_number: receipt.prNumber,
        head_sha: receipt.headSha,
        reviewer_runtime: receipt.reviewerRuntime,
        ci_evidence_generation: receipt.ciEvidenceGeneration,
        prior_slot_digest: sha256Digest(malformedBytes),
        corrected_receipt_digest: receipt.receiptDigest,
        reason: "schema_invalid",
        reviewed_at: receipt.reviewedAt,
      });
      expect(persistClaudePrReviewReceiptCorrection(root, receipt, "schema_invalid")).toEqual(
        persisted,
      );
      expect(() =>
        assertClaudePrReviewReceiptCorrectionTarget(root, receipt, {
          rejectExistingCorrection: true,
        }),
      ).toThrow("review_receipt_correction_already_exists");

      const authorizationBytes = readFileSync(persisted.authorizationPath, "utf8");
      const tamperedAuthorization: Record<string, unknown> = {
        ...(JSON.parse(authorizationBytes) as Record<string, unknown>),
        reason: "unknown_reason",
      };
      const { correction_id: _correctionId, ...tamperedPayload } = tamperedAuthorization;
      tamperedAuthorization.correction_id = `review-receipt-correction:${sha256Digest(canonicalJson(tamperedPayload))}`;
      writeFileSync(persisted.authorizationPath, `${JSON.stringify(tamperedAuthorization)}\n`);
      expect(findClaudePrReviewReceipt(root, receipt)).toBeNull();
      writeFileSync(persisted.authorizationPath, authorizationBytes);
      expect(findClaudePrReviewReceipt(root, receipt)).toEqual(receipt);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  // PLAN-RECOVERY-102-review-receipt-correction-generation / U-CPRCONV-042
  it("U-CPRCONV-042: valid slotの訂正と同一identityの異内容訂正をfail-closeする", () => {
    const validRoot = mkdtempSync(join(tmpdir(), "helix-valid-receipt-correction-"));
    const malformedRoot = mkdtempSync(join(tmpdir(), "helix-conflict-receipt-correction-"));
    try {
      const receipt = buildClaudePrReviewReceipt(baseInput);
      persistClaudePrReviewReceipt(validRoot, receipt);
      expect(() =>
        persistClaudePrReviewReceiptCorrection(validRoot, receipt, "schema_invalid"),
      ).toThrow("valid_review_receipt_correction_forbidden");

      const receiptDir = join(
        malformedRoot,
        ".helix",
        "state",
        "claude-pr-convergence",
        "receipts",
      );
      mkdirSync(receiptDir, { recursive: true });
      writeFileSync(join(receiptDir, safeClaudePrReviewReceiptName(receipt)), "malformed\n");
      const persisted = persistClaudePrReviewReceiptCorrection(
        malformedRoot,
        receipt,
        "schema_invalid",
      );
      const authorization = JSON.parse(readFileSync(persisted.authorizationPath, "utf8")) as Record<
        string,
        unknown
      >;
      const priorDigestTampered: Record<string, unknown> = {
        ...authorization,
        prior_slot_digest: `sha256:${"0".repeat(64)}`,
      };
      const { correction_id: _priorCorrectionId, ...priorDigestPayload } = priorDigestTampered;
      priorDigestTampered.correction_id = `review-receipt-correction:${sha256Digest(canonicalJson(priorDigestPayload))}`;
      writeFileSync(persisted.authorizationPath, `${JSON.stringify(priorDigestTampered)}\n`);
      expect(findClaudePrReviewReceipt(malformedRoot, receipt)).toBeNull();
      writeFileSync(persisted.authorizationPath, `${JSON.stringify(authorization)}\n`);

      const conflicting = buildClaudePrReviewReceipt({ ...baseInput, summary: "different bytes" });
      expect(() =>
        persistClaudePrReviewReceiptCorrection(malformedRoot, conflicting, "schema_invalid"),
      ).toThrow("review_receipt_correction_conflict");
      expect(() =>
        persistClaudePrReviewReceiptCorrection(
          malformedRoot,
          conflicting,
          "unknown_reason" as "schema_invalid",
        ),
      ).toThrow("review_receipt_correction_reason_invalid");

      const conflictingAuthorization: Record<string, unknown> = {
        ...authorization,
        corrected_receipt_digest: conflicting.receiptDigest,
      };
      const { correction_id: _conflictingCorrectionId, ...conflictingPayload } =
        conflictingAuthorization;
      conflictingAuthorization.correction_id = `review-receipt-correction:${sha256Digest(canonicalJson(conflictingPayload))}`;
      writeFileSync(persisted.receiptPath, `${JSON.stringify(conflicting)}\n`);
      writeFileSync(persisted.authorizationPath, `${JSON.stringify(conflictingAuthorization)}\n`);
      expect(findClaudePrReviewReceipt(malformedRoot, receipt)).toBeNull();
    } finally {
      rmSync(validRoot, { recursive: true, force: true });
      rmSync(malformedRoot, { recursive: true, force: true });
    }
  });

  it("U-CPRCONV-033: receipt生成の失敗でもslot claimを必ず解放する", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-slot-finally-"));
    try {
      const receipt = buildClaudePrReviewReceipt(baseInput);
      const claim = claimClaudePrReviewReceiptSlot(root, receipt);
      expect(() =>
        withClaudePrReviewReceiptSlotClaim(claim, () => {
          throw new Error("comment sealing failed");
        }),
      ).toThrow("comment sealing failed");
      expect(() => claimClaudePrReviewReceiptSlot(root, receipt)).not.toThrow();
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  // PR #525 で実際に発生した虚偽申告（Claude 著 PR に authorRuntime="codex"）を fixture 化し、
  // 申告値と commit trailer 実測の突き合わせが fail-close することを固定する。
  const implCommits = (...messages: string[]) =>
    messages.map((message) => ({ message, parentCount: 1 }));
  const claudeAuthoredMessages = implCommits(
    "chore(memory): record stacked PR and digest recompute lessons\n\nCo-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>",
    "chore(memory): restore three truncated lesson bodies\n\nCo-Authored-By: Claude Fable 5 <noreply@anthropic.com>",
  );
  const codexAuthoredMessages = implCommits(
    "docs(governance): close issue 514 cross-review symmetry",
    "fix: register github module and align boundary oracles",
  );

  it("U-CPRCONV-012: commit trailer から authoring runtime を実測する", () => {
    expect(measuredAuthorRuntimeFromCommits(claudeAuthoredMessages)).toBe("claude");
    expect(measuredAuthorRuntimeFromCommits(codexAuthoredMessages)).toBe("codex");
    // trailer は本文途中の引用ではなく行頭一致で判定する（大文字小文字は不問）。
    expect(
      measuredAuthorRuntimeFromCommits(
        implCommits("docs: quote 'Co-Authored-By: Claude' as an inline example"),
      ),
    ).toBe("codex");
    expect(
      measuredAuthorRuntimeFromCommits(
        implCommits("fix: x\n\nco-authored-by: claude opus 5 <noreply@anthropic.com>"),
      ),
    ).toBe("claude");
    // 行頭 trailer 契約: `Co-Authored-By:` の直後の改行を trailer として認めない
    //（`\s*` だと改行を跨いで `Claude` に到達し偽陽性になる — Codex round-1 Important 指摘）。
    expect(
      measuredAuthorRuntimeFromCommits(implCommits("fix: y\n\nCo-Authored-By:\nClaude <x@y>")),
    ).toBe("codex");
  });

  // PLAN-RECOVERY-51-external-author-attestation（Issue #553）。
  // 「trailer が無い = Codex が書いた」という推定は、trailer を付けない第三者 author
  // （Dependabot 等の bot）を Codex 著と誤帰属する。PR #384 で実測済み。
  const botCommits = (...messages: string[]) =>
    messages.map((message) => ({ message, parentCount: 1, bot: true }));

  it("U-CPRCONV-EXT-001: [PLAN-RECOVERY-51] 全実装 commit が bot 著なら external と実測する", () => {
    // #553 の回帰本体: PR #384 の実 evidence 形状（bot 1 本 + 人間の main 同期 merge）。
    expect(
      measuredAuthorRuntimeFromCommits([
        ...botCommits("chore(deps-dev): bump postcss from 8.5.20 to 8.5.25"),
        {
          message: "Merge branch 'main' into dependabot/npm_and_yarn/postcss-8.5.25",
          parentCount: 2,
        },
      ]),
    ).toBe("external");

    // bot と HELIX runtime commit が同居する場合は external にしない（保守側へ倒す）。
    // 混在部分の独立レビューは依然として要求されるべきだからである。
    expect(
      measuredAuthorRuntimeFromCommits([
        ...botCommits("chore(deps): bump x"),
        ...codexAuthoredMessages,
      ]),
    ).toBe("codex");
    expect(
      measuredAuthorRuntimeFromCommits([
        ...botCommits("chore(deps): bump x"),
        ...claudeAuthoredMessages,
      ]),
    ).toBe("mixed");

    // bot flag を持たない母集団は変わらない（bot flag 未指定は非 bot として扱う）。
    expect(measuredAuthorRuntimeFromCommits(claudeAuthoredMessages)).toBe("claude");
    expect(measuredAuthorRuntimeFromCommits(codexAuthoredMessages)).toBe("codex");
    expect(
      measuredAuthorRuntimeFromCommits([...claudeAuthoredMessages, ...codexAuthoredMessages]),
    ).toBe("mixed");

    // bot 著かつ Claude trailer 付きは external にしない（trailer のほうを信じる）。
    expect(
      measuredAuthorRuntimeFromCommits(
        botCommits("chore: x\n\nCo-Authored-By: Claude Opus 5 <noreply@anthropic.com>"),
      ),
    ).toBe("claude");
  });

  it("U-CPRCONV-EXT-002: [PLAN-RECOVERY-51] evidence の wire format が bot identity を含む", () => {
    // query を定数化しても call site が別 query を渡せば evidence は壊れるため、
    // 引数配列ごと exact 一致で固定する（U-CPRCONV-018 と同じ理由）。
    expect(AUTHOR_RUNTIME_EVIDENCE_QUERY).toBe(
      '.[] | "\\(.parents | length):\\(if (.author.type? // "") == "Bot" then 1 else 0 end):\\(.commit.message | @base64)"',
    );
    expect(authorRuntimeEvidenceArgs("RetryYN/HELIX-HARNESS", 384)).toEqual([
      "api",
      "--paginate",
      "repos/RetryYN/HELIX-HARNESS/pulls/384/commits",
      "-q",
      AUTHOR_RUNTIME_EVIDENCE_QUERY,
    ]);
  });

  it("U-CPRCONV-EXT-003: [PLAN-RECOVERY-51] parse は 3 フィールド形式だけを受理する", () => {
    const b64 = (message: string) => Buffer.from(message, "utf8").toString("base64");

    expect(parseAuthorRuntimeEvidence(`1:1:${b64("chore(deps): bump x")}\n`)).toEqual([
      { message: "chore(deps): bump x", parentCount: 1, bot: true },
    ]);
    expect(parseAuthorRuntimeEvidence(`2:0:${b64("Merge branch 'main'")}\n`)).toEqual([
      { message: "Merge branch 'main'", parentCount: 2, bot: false },
    ]);

    // 旧 2 フィールド形式は受理しない。dual-read にすると query 側だけ巻き戻ったとき
    // 全 commit が非 bot として静かに通り、誤帰属が復活する。
    expect(parseAuthorRuntimeEvidence(`1:${b64("chore(deps): bump x")}\n`)).toBeNull();
    // bot flag は 0 / 1 の厳密一致。
    expect(parseAuthorRuntimeEvidence(`1:2:${b64("x")}\n`)).toBeNull();
    expect(parseAuthorRuntimeEvidence(`1:true:${b64("x")}\n`)).toBeNull();
    expect(parseAuthorRuntimeEvidence(`1::${b64("x")}\n`)).toBeNull();
  });

  it("U-CPRCONV-EXT-004: [PLAN-RECOVERY-51] bot 著 PR への runtime 申告を mismatch で拒否する", () => {
    const botPr = [
      ...botCommits("chore(deps-dev): bump postcss from 8.5.20 to 8.5.25"),
      {
        message: "Merge branch 'main' into dependabot/npm_and_yarn/postcss-8.5.25",
        parentCount: 2,
      },
    ];
    // #553 の回帰: これまで codex 申告が通っていた。
    expect(authorRuntimeAttestationFailure("codex", botPr)).toBe(
      "author_runtime_attestation_mismatch",
    );
    expect(authorRuntimeAttestationFailure("claude", botPr)).toBe(
      "author_runtime_attestation_mismatch",
    );
    expect(authorRuntimeAttestationFailure("mixed", botPr)).toBe(
      "author_runtime_attestation_mismatch",
    );
    expect(authorRuntimeAttestationFailure("external", botPr)).toBeNull();

    // 逆向き: 非 bot PR に external を申告しても通さない。
    expect(authorRuntimeAttestationFailure("external", codexAuthoredMessages)).toBe(
      "author_runtime_attestation_mismatch",
    );
    expect(authorRuntimeAttestationFailure("external", claudeAuthoredMessages)).toBe(
      "author_runtime_attestation_mismatch",
    );
  });

  it("U-CPRCONV-021: [PLAN-RECOVERY-46] dispatch 用の authorship 実測は evidence 不在で fail-close する", () => {
    const evidenceLine = (parents: number, message: string) =>
      `${parents}:0:${Buffer.from(message, "utf8").toString("base64")}`;
    const claudeStdout = `${evidenceLine(1, "feat: x\n\nCo-Authored-By: Claude Opus 5 <noreply@anthropic.com>")}\n`;
    const codexStdout = `${evidenceLine(1, "feat: y")}\n`;

    // 実測できた場合はその値を返す（申告を受け取らない点が attestation と異なる）。
    expect(
      measureAuthorRuntime({
        repository: "RetryYN/HELIX-HARNESS",
        prNumber: 551,
        run: () => ({ status: 0, stdout: claudeStdout }),
      }),
    ).toEqual({ ok: true, measured: "claude" });
    expect(
      measureAuthorRuntime({
        repository: "RetryYN/HELIX-HARNESS",
        prNumber: 551,
        run: () => ({ status: 0, stdout: codexStdout }),
      }),
    ).toEqual({ ok: true, measured: "codex" });

    // runner 失敗・空 evidence・形式不正はいずれも推測せず fail-close する。
    for (const result of [
      { status: 1, stdout: "" },
      { status: 0, stdout: "" },
      { status: 0, stdout: "not-evidence\n" },
    ]) {
      expect(
        measureAuthorRuntime({
          repository: "RetryYN/HELIX-HARNESS",
          prNumber: 551,
          run: () => result,
        }),
      ).toEqual({ ok: false, failure: "author_runtime_evidence_unavailable" });
    }

    // runner には canonical な evidence query がそのまま渡る（query 差し替えを素通ししない）。
    const seen: string[][] = [];
    measureAuthorRuntime({
      repository: "RetryYN/HELIX-HARNESS",
      prNumber: 551,
      run: (args) => {
        seen.push([...args]);
        return { status: 0, stdout: codexStdout };
      },
    });
    expect(seen[0]).toEqual(authorRuntimeEvidenceArgs("RetryYN/HELIX-HARNESS", 551));
  });

  it("U-CPRCONV-017: merge commit を parent 数で除外し subject 表記に依存しない", () => {
    // PR #517 の実測 fixture: parent 2 の実 merge commit だが subject が conventional commit
    // 形式（`chore(memory): ...`）のため `Merge ` 始まり判定では実装 commit と誤認され、
    // Claude trailer 無しとして mixed へ落ちていた（false fail-close）。
    const syncMerge = {
      message: "chore(memory): sync screen carry lane with latest main",
      parentCount: 2,
    };
    expect(measuredAuthorRuntimeFromCommits([syncMerge, ...claudeAuthoredMessages])).toBe("claude");
    expect(
      authorRuntimeAttestationFailure("claude", [syncMerge, ...claudeAuthoredMessages]),
    ).toBeNull();
    // 慣用的な `Merge branch` subject の merge commit も同様に除外される。
    expect(
      measuredAuthorRuntimeFromCommits([
        { message: "Merge branch 'main' into feature/x", parentCount: 2 },
        ...claudeAuthoredMessages,
      ]),
    ).toBe("claude");
    // 逆に、subject が `Merge ` で始まっても parent 1 なら実装 commit として数える
    //（message 表記による除外の偽装を許さない）。
    expect(
      measuredAuthorRuntimeFromCommits([
        ...claudeAuthoredMessages,
        { message: "Merge upstream fixes by hand", parentCount: 1 },
      ]),
    ).toBe("mixed");
    // merge commit しか無い PR は、merge commit を母集団として判定する。
    expect(measuredAuthorRuntimeFromCommits([syncMerge])).toBe("codex");
    // parent 3 以上（octopus merge）も merge commit として除外する。閾値を等値比較
    //（`parentCount !== 2`）へ退行させると、octopus merge が実装 commit として数えられ
    // trailer 無しの混在になる（Codex round-8 Important）。
    const octopusMerge = {
      message: "chore: merge three lanes at once",
      parentCount: 3,
    };
    expect(measuredAuthorRuntimeFromCommits([octopusMerge, ...claudeAuthoredMessages])).toBe(
      "claude",
    );
    expect(
      authorRuntimeAttestationFailure("claude", [octopusMerge, ...claudeAuthoredMessages]),
    ).toBeNull();
  });

  it("U-CPRCONV-015: trailer 有無が実装 commit 間で混在する PR を mixed として fail-close する", () => {
    // 部分偽装（Codex PR へ Claude trailer commit を 1 件混入）は claude/codex どちらの申告も通さない。
    const mixed = [...codexAuthoredMessages, claudeAuthoredMessages[0]];
    expect(measuredAuthorRuntimeFromCommits(mixed)).toBe("mixed");
    expect(authorRuntimeAttestationFailure("codex", mixed)).toBe("author_runtime_evidence_mixed");
    expect(authorRuntimeAttestationFailure("claude", mixed)).toBe("author_runtime_evidence_mixed");
  });

  it("U-CPRCONV-015b: 実測 mixed に対する mixed 申告だけを受理し、単一 runtime PR の mixed 申告は拒否する", () => {
    // Hybrid commit stacking（CLAUDE.md「Hybrid 多ランタイム commit 協調」）は相手 runtime の
    // commit の上に積むことを必須運用として規定しており、混在ブランチは規定運用の正常な帰結である。
    // 単一 runtime の偽装申告を拒否したまま、正直な mixed 申告だけを通す（Issue #539）。
    const mixed = [...codexAuthoredMessages, claudeAuthoredMessages[0]];
    expect(authorRuntimeAttestationFailure("mixed", mixed)).toBeNull();
    // 逆向きの偽装（単一 runtime authored なのに mixed と申告して dual receipt 経路へ逃がす）も拒否する。
    expect(authorRuntimeAttestationFailure("mixed", claudeAuthoredMessages)).toBe(
      "author_runtime_attestation_mismatch",
    );
    expect(authorRuntimeAttestationFailure("mixed", codexAuthoredMessages)).toBe(
      "author_runtime_attestation_mismatch",
    );
    // evidence が 1 件も無い場合は mixed 申告でも従来どおり fail-close する。
    expect(authorRuntimeAttestationFailure("mixed", [])).toBe("author_runtime_evidence_missing");
  });

  it("U-CPRCONV-015c: mixed 著者 receipt は reviewer と別 runtime の authorModel を要求する", () => {
    // mixed では authorRuntime === reviewerRuntime の単純比較で独立性を測れない。
    // 各 receipt は「相手 runtime が書いた分を自分がレビューした」ことの証跡なので、
    // authorModel は reviewer とは別 runtime のものでなければならない。
    const base = {
      repository: "RetryYN/HELIX-HARNESS",
      prNumber: 537,
      prUrl: "https://github.com/RetryYN/HELIX-HARNESS/pull/537",
      headSha: "c".repeat(40),
      reviewerSessionId: "review-session",
      verdict: "approve" as const,
      blockerCount: 0,
      ciRunId: 31417837865,
      ciConclusion: "success" as const,
      ciEvidenceGeneration: "run:31417837865:attempt:1:success",
      dbReceiptSchemaVersion: "helix-l3-g3-logical-db-bootstrap-receipt.v2",
      dbProjectionDigest: `sha256:${"1".repeat(64)}`,
      dbReplayProjectionDigest: `sha256:${"1".repeat(64)}`,
      dbCheckpointDigest: `sha256:${"2".repeat(64)}`,
      dbReplayCheckpointDigest: `sha256:${"2".repeat(64)}`,
      dbReceiptDigest: `sha256:${"3".repeat(64)}`,
      dbConverged: true,
      commentUrl: "https://github.com/RetryYN/HELIX-HARNESS/pull/537#issuecomment-1",
      reviewedAt: "2026-08-10T19:00:00.000Z",
    };
    expect(() =>
      buildClaudePrReviewReceipt({
        ...base,
        authorRuntime: "mixed",
        reviewerRuntime: "claude",
        authorModel: "codex-gpt-5",
        reviewerModel: "claude-sonnet-5",
      }),
    ).not.toThrow();
    // reviewer と同一 runtime の authorModel は自己レビューになるため拒否する。
    expect(() =>
      buildClaudePrReviewReceipt({
        ...base,
        authorRuntime: "mixed",
        reviewerRuntime: "claude",
        authorModel: "claude-opus-5",
        reviewerModel: "claude-sonnet-5",
      }),
    ).toThrow("runtime_independence_missing");
  });

  it("U-CPRCONV-EXT-005: [PLAN-RECOVERY-51] external 著者 receipt は reviewer 側だけを束縛する", () => {
    const base = {
      repository: "RetryYN/HELIX-HARNESS",
      prNumber: 384,
      prUrl: "https://github.com/RetryYN/HELIX-HARNESS/pull/384",
      headSha: "e".repeat(40),
      reviewerSessionId: "review-session",
      verdict: "approve" as const,
      blockerCount: 0,
      ciRunId: 31417837866,
      ciConclusion: "success" as const,
      ciEvidenceGeneration: "run:31417837866:attempt:1:success",
      dbReceiptSchemaVersion: "helix-l3-g3-logical-db-bootstrap-receipt.v2",
      dbProjectionDigest: `sha256:${"1".repeat(64)}`,
      dbReplayProjectionDigest: `sha256:${"1".repeat(64)}`,
      dbCheckpointDigest: `sha256:${"2".repeat(64)}`,
      dbReplayCheckpointDigest: `sha256:${"2".repeat(64)}`,
      dbReceiptDigest: `sha256:${"3".repeat(64)}`,
      dbConverged: true,
      commentUrl: "https://github.com/RetryYN/HELIX-HARNESS/pull/384#issuecomment-1",
      reviewedAt: "2026-08-10T19:00:00.000Z",
      authorRuntime: "external" as const,
      authorModel: "dependabot[bot]",
    };
    // bot 著 PR には守るべき HELIX 著者 runtime が無い。claude / codex どちらの
    // reviewer でも自己レビューにならないため、両方受理する。
    expect(() =>
      buildClaudePrReviewReceipt({
        ...base,
        reviewerRuntime: "claude",
        reviewerModel: "claude-sonnet-5",
      }),
    ).not.toThrow();
    expect(() =>
      buildClaudePrReviewReceipt({
        ...base,
        reviewerRuntime: "codex",
        reviewerModel: "codex-gpt-5",
      }),
    ).not.toThrow();

    // reviewer 側の束縛は緩めない: reviewerModel の provider は reviewerRuntime と一致させる。
    expect(() =>
      buildClaudePrReviewReceipt({
        ...base,
        reviewerRuntime: "claude",
        reviewerModel: "codex-gpt-5",
      }),
    ).toThrow("model_runtime_binding_mismatch");
    // reviewerRuntime は claude / codex 以外を受理しない。
    expect(() =>
      buildClaudePrReviewReceipt({
        ...base,
        reviewerRuntime: "external" as never,
        reviewerModel: "claude-sonnet-5",
      }),
    ).toThrow("runtime_identity_invalid");
    // authorModel は audit のため必須（bot identity を記録する）。空は受理しない。
    expect(() =>
      buildClaudePrReviewReceipt({
        ...base,
        authorModel: "",
        reviewerRuntime: "claude",
        reviewerModel: "claude-sonnet-5",
      }),
    ).toThrow();
  });

  it("U-CPRCONV-016: evidence 行の parent 数と base64 を検証し不正なら全体を無効化する", () => {
    expect(parseAuthorRuntimeEvidence("")).toEqual([]);
    const valid = Buffer.from("fix: a\n\nCo-Authored-By: Claude X <x@y>", "utf8").toString(
      "base64",
    );
    expect(parseAuthorRuntimeEvidence(`1:0:${valid}\n`)).toEqual([
      { message: "fix: a\n\nCo-Authored-By: Claude X <x@y>", parentCount: 1, bot: false },
    ]);
    expect(parseAuthorRuntimeEvidence(`2:0:${valid}\n`)).toEqual([
      { message: "fix: a\n\nCo-Authored-By: Claude X <x@y>", parentCount: 2, bot: false },
    ]);
    // parent 数が欠落・非数値・非 canonical（前置ゼロ）な行を受理しない。
    expect(parseAuthorRuntimeEvidence(`${valid}\n`)).toBeNull();
    expect(parseAuthorRuntimeEvidence(`x:0:${valid}\n`)).toBeNull();
    expect(parseAuthorRuntimeEvidence(`01:0:${valid}\n`)).toBeNull();
    expect(parseAuthorRuntimeEvidence(`-1:0:${valid}\n`)).toBeNull();
    // 不正行が 1 つでもあれば null（呼出側が author_runtime_evidence_unavailable で遮断）。
    expect(parseAuthorRuntimeEvidence(`1:0:${valid}\n1:0:not-base64!!!\n`)).toBeNull();
    expect(parseAuthorRuntimeEvidence('1:0:{"message":"json error"}\n')).toBeNull();
    // 長さ不正・非 canonical encoding を受理しない（文字種 regex だけだと `A` は空文字へ
    // decode され codex 申告が素通りする — Codex round-2 Important 指摘の再発防止）。
    expect(parseAuthorRuntimeEvidence("1:0:A\n")).toBeNull();
    expect(parseAuthorRuntimeEvidence("1:0:AA=\n")).toBeNull();
    expect(parseAuthorRuntimeEvidence("1:0:AAAAA\n")).toBeNull();
    expect(parseAuthorRuntimeEvidence(`1:0:${valid}\n1:0:A\n`)).toBeNull();
    // 非正規 padding bit（QR== は QQ== と同じ 1 byte へ decode されるが canonical でない）。
    expect(parseAuthorRuntimeEvidence("1:0:QR==\n")).toBeNull();
    expect(parseAuthorRuntimeEvidence("1:0:QQ==\n")).toEqual([
      { message: "A", parentCount: 1, bot: false },
    ]);
  });

  it("U-CPRCONV-018: attestation が evidence を実引数どおり取得し失敗を fail-close する", () => {
    // Codex round-1 Critical の再発防止: TypeScript の文字列リテラルでも `\(` はエスケープとして
    // 解釈されるため、ソースに `\\(` と書かないと実行時に `(` へ潰れ、query が literal
    // `(.parents | length):...` を返して全 evidence が不正になる。
    // 意味同値な整形差（pipe 周囲の空白）で落ちないよう、構造で比較する。
    expect(AUTHOR_RUNTIME_EVIDENCE_QUERY).toMatch(
      // PLAN-RECOVERY-51: bot identity を第 2 フィールドへ足した 3 フィールド形式。
      /^\.\[\]\s*\|\s*"\\\(\s*\.parents\s*\|\s*length\s*\):\\\(if \(\.author\.type\? \/\/ ""\) == "Bot" then 1 else 0 end\):\\\(\s*\.commit\.message\s*\|\s*@base64\s*\)"$/u,
    );

    // Codex round-2/3 Important の再発防止: query 定数や source 文字列の検査では、実引数の
    // 欠落（例: args.slice(0, 1)）や call site の差し替えを green のまま通してしまう。
    // runner へ実際に渡る引数を spy で観測し、exact 配列として固定する。
    const calls: (readonly string[])[] = [];
    const runner =
      (stdout: string, status = 0) =>
      (args: readonly string[]) => {
        calls.push(args);
        return { status, stdout };
      };
    const claudeLine = `1:0:${Buffer.from(
      "fix: a\n\nCo-Authored-By: Claude X <x@y>",
      "utf8",
    ).toString("base64")}`;
    const mergeLine = `2:0:${Buffer.from("chore(memory): sync with latest main", "utf8").toString(
      "base64",
    )}`;

    expect(
      authorRuntimeAttestation({
        repository: "RetryYN/HELIX-HARNESS",
        prNumber: 544,
        claimedAuthorRuntime: "claude",
        run: runner(`${mergeLine}\n${claudeLine}\n`),
      }),
    ).toEqual({ ok: true });
    expect(calls).toEqual([
      [
        "api",
        // page 境界の commit を母集団から落とさない。
        "--paginate",
        "repos/RetryYN/HELIX-HARNESS/pulls/544/commits",
        "-q",
        AUTHOR_RUNTIME_EVIDENCE_QUERY,
      ],
    ]);

    // 実行失敗と形式不正はどちらも unavailable で fail-close する。
    expect(
      authorRuntimeAttestation({
        repository: "r/x",
        prNumber: 1,
        claimedAuthorRuntime: "claude",
        run: runner("", 1),
      }),
    ).toEqual({
      ok: false,
      failure: "author_runtime_evidence_unavailable",
    });
    // status が null（signal 停止など）でも evidence として扱わない。`status !== 0` を
    // truthiness 判定へ変えると null が通過するため、null fixture で固定する
    //（Codex round-7 Important）。
    expect(
      authorRuntimeAttestation({
        repository: "r/x",
        prNumber: 1,
        claimedAuthorRuntime: "claude",
        run: () => ({ status: null, stdout: `${claudeLine}\n` }),
      }),
    ).toEqual({ ok: false, failure: "author_runtime_evidence_unavailable" });
    expect(
      authorRuntimeAttestation({
        repository: "r/x",
        prNumber: 1,
        claimedAuthorRuntime: "claude",
        run: ghEvidenceRunner(() => ({ status: null, stdout: `${claudeLine}\n` }), "/repo"),
      }),
    ).toEqual({ ok: false, failure: "author_runtime_evidence_unavailable" });
    expect(
      authorRuntimeAttestation({
        repository: "r/x",
        prNumber: 1,
        claimedAuthorRuntime: "claude",
        run: runner("not-evidence\n"),
      }),
    ).toEqual({
      ok: false,
      failure: "author_runtime_evidence_unavailable",
    });
    // 申告と実測の不一致は mismatch（core の突き合わせを経由していることの確認）。
    expect(
      authorRuntimeAttestation({
        repository: "r/x",
        prNumber: 1,
        claimedAuthorRuntime: "codex",
        run: runner(`${claudeLine}\n`),
      }),
    ).toEqual({
      ok: false,
      failure: "author_runtime_attestation_mismatch",
    });

    // adapter も core が所有する。spawn を spy にして command と実引数を観測し、
    // adapter 側での引数欠落（`[...args].slice(0, 1)`）も検出する（Codex round-4 Important）。
    const spawned: { command: string; args: readonly string[]; cwd: string }[] = [];
    const spawn = (command: string, args: readonly string[], options: { cwd: string }) => {
      spawned.push({ command, args, cwd: options.cwd });
      return { status: 0, stdout: `${claudeLine}\n` };
    };
    expect(
      authorRuntimeAttestation({
        repository: "RetryYN/HELIX-HARNESS",
        prNumber: 544,
        claimedAuthorRuntime: "claude",
        run: ghEvidenceRunner(spawn, "/repo"),
      }),
    ).toEqual({ ok: true });
    expect(spawned).toEqual([
      {
        command: "gh",
        args: authorRuntimeEvidenceArgs("RetryYN/HELIX-HARNESS", 544),
        cwd: "/repo",
      },
    ]);
    // stdout 欠落（null）は空 evidence として missing へ落ち、silent pass しない。
    expect(
      authorRuntimeAttestation({
        repository: "r/x",
        prNumber: 1,
        claimedAuthorRuntime: "claude",
        run: ghEvidenceRunner(() => ({ status: 0, stdout: null }), "/repo"),
      }),
    ).toEqual({ ok: false, failure: "author_runtime_evidence_missing" });

    // cli は判断も adapter も持たず、core の関数へ spawn 実体を渡すだけ（整形差に依存しない束縛）。
    const cli = readFileSync(join(process.cwd(), "src/cli.ts"), "utf8");
    expect(cli).toMatch(/authorRuntimeAttestation\(\{\s*repository,\s*prNumber,/u);
    expect(cli).toMatch(/ghEvidenceRunner\(\s*spawnSync,\s*process\.cwd\(\)\s*,?\s*\)/u);
  });

  it("U-CPRCONV-020: cli の seal / merge 両 callsite が実 gh 引数で attestation を実行する", () => {
    // Codex round-5〜7 の再発防止: source regex では cli bridge の実引数欠落、merge 側
    // attestation block の削除、申告値の定数固定、真正申告の一律拒否を検出できない。
    // 実 CLI を PATH 上の fake gh で起動し、(a) 虚偽申告の fail-close、(b) 真正申告が
    // attestation を通過して後続の gh 呼び出しへ進むこと、(c) 実引数一致、を束縛する。
    const repoRoot = process.cwd();
    const sandbox = mkdtempSync(join(tmpdir(), "helix-attestation-cli-"));
    try {
      // 実装 commit 1 件（parent 1、Claude trailer あり）→ 実測 runtime は claude。
      const evidence = Buffer.from("fix: a\n\nCo-Authored-By: Claude X <x@y>", "utf8").toString(
        "base64",
      );
      const prView = JSON.stringify({
        url: "https://github.com/RetryYN/HELIX-HARNESS/pull/544",
        headRefOid: "d".repeat(40),
        state: "OPEN",
        isDraft: false,
      });
      writeFileSync(
        join(sandbox, "gh"),
        [
          "#!/bin/sh",
          'printf \'%s\\n\' "$@" >> "$GH_LOG"',
          "printf 'ARGV-END\\n' >> \"$GH_LOG\"",
          'if [ "$1" = "api" ]; then',
          `  printf '1:0:${evidence}\\n'`,
          'elif [ "$1" = "pr" ] && [ "$2" = "view" ]; then',
          `  printf '%s' ${JSON.stringify(prView)}`,
          'elif [ "$1" = "pr" ] && [ "$2" = "checks" ]; then',
          `  printf '%s' ${JSON.stringify(JSON.stringify([{ bucket: "pass" }]))}`,
          'elif [ "$1" = "run" ]; then',
          `  printf '%s' ${JSON.stringify(JSON.stringify({ headSha: "d".repeat(40), conclusion: "success", status: "completed", attempt: 1, event: "pull_request", name: "harness-check" }))}`,
          "fi",
          "exit 0",
        ].join("\n"),
        { mode: 0o755 },
      );
      // このtestの責務はCLIのattestation bridgeであり、現在branch上のPLAN差分ではない。
      // merge admissionへPLAN bindingが追加されても架空HEADをreal Gitへ渡して偶然失敗しないよう、
      // fixture HEADと「変更PLANなし」をfake Gitで固定し、それ以外はreal Gitへ委譲する。
      const realGit = execFileSync("which", ["git"], { encoding: "utf8" }).trim();
      writeFileSync(
        join(sandbox, "git"),
        [
          "#!/bin/sh",
          'if [ "$1" = "rev-parse" ] && [ "$2" = "HEAD" ]; then',
          `  printf '%s\\n' ${JSON.stringify("d".repeat(40))}`,
          'elif [ "$1" = "diff" ] && [ "$2" = "--name-only" ]; then',
          "  exit 0",
          "else",
          `  exec ${JSON.stringify(realGit)} "$@"`,
          "fi",
        ].join("\n"),
        { mode: 0o755 },
      );

      let runIndex = 0;
      const runCli = (args: string[]) => {
        runIndex += 1;
        const logPath = join(sandbox, `gh-${runIndex}.log`);
        writeFileSync(logPath, "");
        const env = {
          ...process.env,
          PATH: `${sandbox}:${process.env.PATH ?? ""}`,
          GH_LOG: logPath,
        };
        let status = 0;
        let stderr = "";
        try {
          execFileSync("npx", ["--no-install", "tsx", "src/cli.ts", ...args], {
            cwd: repoRoot,
            env,
            encoding: "utf8",
            stdio: ["ignore", "pipe", "pipe"],
          });
        } catch (error) {
          const failure = error as { status?: number; stderr?: string };
          status = failure.status ?? -1;
          stderr = failure.stderr ?? "";
        }
        const invocations = readFileSync(logPath, "utf8")
          .split("ARGV-END\n")
          .filter((block) => block.trim() !== "")
          .map((block) => block.split("\n").filter((line) => line !== ""));
        return { status, stderr, invocations };
      };

      const receiptFor = (authorRuntime: "claude" | "codex") =>
        buildClaudePrReviewReceipt({
          ...baseInput,
          prNumber: 544,
          prUrl: "https://github.com/RetryYN/HELIX-HARNESS/pull/544",
          headSha: "d".repeat(40),
          authorRuntime,
          reviewerRuntime: authorRuntime === "claude" ? "codex" : "claude",
          authorModel: authorRuntime === "claude" ? "claude-fable-5" : "codex-gpt-5",
          reviewerModel: authorRuntime === "claude" ? "codex-gpt-5" : "claude-sonnet-5",
          commentUrl: "https://github.com/RetryYN/HELIX-HARNESS/pull/544#issuecomment-123",
        });
      const writeReceipt = (name: string, receipt: unknown) => {
        const path = join(sandbox, name);
        writeFileSync(path, JSON.stringify(receipt));
        return path;
      };

      // 虚偽申告（実測 claude / 申告 codex）は seal / merge の双方で fail-close する。
      const falseReceipt = receiptFor("codex");
      const sealedFalse = runCli([
        "github",
        "pr-review-receipt",
        "--input-json",
        JSON.stringify(falseReceipt),
      ]);
      expect(sealedFalse.status).not.toBe(0);
      expect(sealedFalse.stderr).toContain("author_runtime_attestation_mismatch");

      const mergedFalse = runCli([
        "github",
        "pr-merge-reviewed",
        "--pr",
        "544",
        "--receipt",
        writeReceipt("false-receipt.json", falseReceipt),
      ]);
      expect(mergedFalse.status).not.toBe(0);
      expect(mergedFalse.stderr).toContain("author_runtime_attestation_mismatch");
      // attestation で止まるため、後続の required check 参照へは進まない。
      expect(mergedFalse.invocations.some((args) => args[1] === "checks")).toBe(false);

      // 真正申告（実測 claude / 申告 claude）は attestation を通過し、後続処理へ進む。
      // 負例だけを固定すると、申告値の定数固定や真正申告の一律拒否を見逃す
      //（Codex round-6/7 Important）。DB 収束など環境依存の後続失敗と切り分けるため、
      //「attestation 後にしか起きない gh 呼び出しへ到達したこと」を positive oracle にする。
      const truthfulReceipt = receiptFor("claude");
      const mergedTruthful = runCli([
        "github",
        "pr-merge-reviewed",
        "--pr",
        "544",
        "--receipt",
        writeReceipt("truthful-receipt.json", truthfulReceipt),
      ]);
      expect(mergedTruthful.stderr).not.toMatch(/author_runtime_/u);
      expect(mergedTruthful.invocations.some((args) => args[1] === "checks")).toBe(true);
      // fake gh は required check pass と receipt CI 一致を返すため、dry-run は exit 0 で
      // merge 可能と判定される（Codex round-8 の positive 強化提案）。
      expect(mergedTruthful.status).toBe(0);

      const sealedTruthful = runCli([
        "github",
        "pr-review-receipt",
        "--input-json",
        JSON.stringify(truthfulReceipt),
      ]);
      expect(sealedTruthful.stderr).not.toMatch(/author_runtime_/u);

      // 4 経路すべてが core の実引数どおり evidence を取りに行く（bridge での欠落を検出する）。
      const evidenceCalls = [sealedFalse, mergedFalse, mergedTruthful, sealedTruthful].map((run) =>
        run.invocations.filter((args) => args[0] === "api"),
      );
      for (const calls of evidenceCalls) {
        expect(calls).toEqual([authorRuntimeEvidenceArgs("RetryYN/HELIX-HARNESS", 544)]);
      }
    } finally {
      rmSync(sandbox, { recursive: true, force: true });
    }
  }, 90000);

  it("U-CPRCONV-037: CLI applyはCI完了前のreviewをproducer境界で拒否する", () => {
    const repoRoot = process.cwd();
    const sandbox = mkdtempSync(join(tmpdir(), "helix-ci-review-order-cli-"));
    const headSha = "d".repeat(40);
    const ciRunId = 654321;
    const ciEvidenceGeneration = "run:654321:attempt:1:success";
    const ciUpdatedAt = "2026-08-18T01:00:00.000Z";
    const reviewedAt = "2026-08-18T00:59:00.000Z";
    try {
      const evidence = Buffer.from("fix: a\n\nCo-Authored-By: Claude X <x@y>", "utf8").toString(
        "base64",
      );
      const ciRuns = JSON.stringify([
        {
          databaseId: ciRunId,
          headSha,
          status: "completed",
          conclusion: "success",
          attempt: 1,
          updatedAt: ciUpdatedAt,
          event: "pull_request",
          name: "harness-check",
        },
      ]);
      const logPath = join(sandbox, "gh.log");
      writeFileSync(
        join(sandbox, "gh"),
        [
          "#!/bin/sh",
          'printf \'%s\\n\' "$@" >> "$GH_LOG"',
          "printf 'ARGV-END\\n' >> \"$GH_LOG\"",
          'if [ "$1" = "api" ]; then',
          `  printf '%s\\n' ${JSON.stringify(`1:0:${evidence}`)}`,
          'elif [ "$1" = "run" ] && [ "$2" = "list" ]; then',
          `  printf '%s' ${JSON.stringify(ciRuns)}`,
          "fi",
          "exit 0",
        ].join("\n"),
        { mode: 0o755 },
      );
      writeFileSync(logPath, "");

      const receipt = buildClaudePrReviewReceipt({
        ...baseInput,
        authorRuntime: "claude",
        reviewerRuntime: "codex",
        authorModel: "claude-fable-5",
        reviewerModel: "codex-gpt-5",
        prNumber: 544,
        prUrl: "https://github.com/RetryYN/HELIX-HARNESS/pull/544",
        headSha,
        ciRunId,
        ciEvidenceGeneration,
        reviewedAt,
        commentUrl: "https://github.com/RetryYN/HELIX-HARNESS/pull/544#issuecomment-123",
      });
      let status = 0;
      let stderr = "";
      try {
        execFileSync(
          "npx",
          [
            "--no-install",
            "tsx",
            "src/cli.ts",
            "github",
            "pr-review-receipt",
            "--input-json",
            JSON.stringify(receipt),
            "--apply",
            "--json",
          ],
          {
            cwd: repoRoot,
            env: {
              ...process.env,
              PATH: `${sandbox}:${process.env.PATH ?? ""}`,
              GH_LOG: logPath,
            },
            encoding: "utf8",
            stdio: ["ignore", "pipe", "pipe"],
          },
        );
      } catch (error) {
        const failure = error as { status?: number; stderr?: string };
        status = failure.status ?? -1;
        stderr = failure.stderr ?? "";
      }

      expect(status).not.toBe(0);
      expect(stderr).toContain("pr_ci_review_before_completion");
      const invocations = readFileSync(logPath, "utf8")
        .split("ARGV-END\n")
        .filter((block) => block.trim() !== "")
        .map((block) => block.split("\n").filter((line) => line !== ""));
      expect(invocations.some((args) => args[0] === "run" && args[1] === "list")).toBe(true);
      expect(invocations.some((args) => args[0] === "pr" && args[1] === "comment")).toBe(false);
    } finally {
      rmSync(sandbox, { recursive: true, force: true });
    }
  }, 90000);

  it("U-CPRCONV-019: parent 数が safe integer でない evidence を無効化する", () => {
    const encoded = Buffer.from("fix: a", "utf8").toString("base64");
    expect(parseAuthorRuntimeEvidence(`9007199254740993:0:${encoded}\n`)).toBeNull();
    expect(parseAuthorRuntimeEvidence(`99999999999999999999:0:${encoded}\n`)).toBeNull();
    expect(parseAuthorRuntimeEvidence(`9007199254740991:0:${encoded}\n`)).toEqual([
      { message: "fix: a", parentCount: 9007199254740991, bot: false },
    ]);
  });

  it("U-CPRCONV-013: Claude 著 PR への authorRuntime=codex 申告を attestation mismatch で拒否する", () => {
    // PR #525 の再現 fixture: 実測 claude に対する codex 申告。
    expect(authorRuntimeAttestationFailure("codex", claudeAuthoredMessages)).toBe(
      "author_runtime_attestation_mismatch",
    );
    // 逆向きの虚偽（実測 codex に claude 申告）も対称に拒否する。
    expect(authorRuntimeAttestationFailure("claude", codexAuthoredMessages)).toBe(
      "author_runtime_attestation_mismatch",
    );
    // 真正な申告は双方向とも通る。
    expect(authorRuntimeAttestationFailure("claude", claudeAuthoredMessages)).toBeNull();
    expect(authorRuntimeAttestationFailure("codex", codexAuthoredMessages)).toBeNull();
  });

  it("U-CPRCONV-014: commit evidence が空の attestation を fail-close する", () => {
    expect(authorRuntimeAttestationFailure("codex", [])).toBe("author_runtime_evidence_missing");
    expect(authorRuntimeAttestationFailure("claude", [])).toBe("author_runtime_evidence_missing");
  });
});

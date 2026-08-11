import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
// PLAN-L7-473-claude-pr-convergence / U-CPRCONV-001
// PLAN-L7-474-claude-pr-db-receipt-binding / U-CPRCONV-004
import {
  AUTHOR_RUNTIME_EVIDENCE_QUERY,
  areRequiredChecksGreen,
  authorRuntimeAttestation,
  authorRuntimeAttestationFailure,
  authorRuntimeEvidenceArgs,
  bindCanonicalLogicalDbReceipt,
  buildClaudePrReviewReceipt,
  CLAUDE_PR_REVIEW_RECEIPT_SCHEMA_V2,
  dispatchCreatedPrToClaude,
  evaluateClaudePrMerge,
  ghEvidenceRunner,
  loadClaudePrReviewReceipt,
  measureAuthorRuntime,
  measuredAuthorRuntimeFromCommits,
  parseAuthorRuntimeEvidence,
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
        authorRuntime: "codex",
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

  // PLAN-RECOVERY-42-author-runtime-attestation（Issue #534）。
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

  it("U-CPRCONV-021: [PLAN-RECOVERY-46] dispatch 用の authorship 実測は evidence 不在で fail-close する", () => {
    const evidenceLine = (parents: number, message: string) =>
      `${parents}:${Buffer.from(message, "utf8").toString("base64")}`;
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

  it("U-CPRCONV-016: evidence 行の parent 数と base64 を検証し不正なら全体を無効化する", () => {
    expect(parseAuthorRuntimeEvidence("")).toEqual([]);
    const valid = Buffer.from("fix: a\n\nCo-Authored-By: Claude X <x@y>", "utf8").toString(
      "base64",
    );
    expect(parseAuthorRuntimeEvidence(`1:${valid}\n`)).toEqual([
      { message: "fix: a\n\nCo-Authored-By: Claude X <x@y>", parentCount: 1 },
    ]);
    expect(parseAuthorRuntimeEvidence(`2:${valid}\n`)).toEqual([
      { message: "fix: a\n\nCo-Authored-By: Claude X <x@y>", parentCount: 2 },
    ]);
    // parent 数が欠落・非数値・非 canonical（前置ゼロ）な行を受理しない。
    expect(parseAuthorRuntimeEvidence(`${valid}\n`)).toBeNull();
    expect(parseAuthorRuntimeEvidence(`x:${valid}\n`)).toBeNull();
    expect(parseAuthorRuntimeEvidence(`01:${valid}\n`)).toBeNull();
    expect(parseAuthorRuntimeEvidence(`-1:${valid}\n`)).toBeNull();
    // 不正行が 1 つでもあれば null（呼出側が author_runtime_evidence_unavailable で遮断）。
    expect(parseAuthorRuntimeEvidence(`1:${valid}\n1:not-base64!!!\n`)).toBeNull();
    expect(parseAuthorRuntimeEvidence('1:{"message":"json error"}\n')).toBeNull();
    // 長さ不正・非 canonical encoding を受理しない（文字種 regex だけだと `A` は空文字へ
    // decode され codex 申告が素通りする — Codex round-2 Important 指摘の再発防止）。
    expect(parseAuthorRuntimeEvidence("1:A\n")).toBeNull();
    expect(parseAuthorRuntimeEvidence("1:AA=\n")).toBeNull();
    expect(parseAuthorRuntimeEvidence("1:AAAAA\n")).toBeNull();
    expect(parseAuthorRuntimeEvidence(`1:${valid}\n1:A\n`)).toBeNull();
    // 非正規 padding bit（QR== は QQ== と同じ 1 byte へ decode されるが canonical でない）。
    expect(parseAuthorRuntimeEvidence("1:QR==\n")).toBeNull();
    expect(parseAuthorRuntimeEvidence("1:QQ==\n")).toEqual([{ message: "A", parentCount: 1 }]);
  });

  it("U-CPRCONV-018: attestation が evidence を実引数どおり取得し失敗を fail-close する", () => {
    // Codex round-1 Critical の再発防止: TypeScript の文字列リテラルでも `\(` はエスケープとして
    // 解釈されるため、ソースに `\\(` と書かないと実行時に `(` へ潰れ、query が literal
    // `(.parents | length):...` を返して全 evidence が不正になる。
    // 意味同値な整形差（pipe 周囲の空白）で落ちないよう、構造で比較する。
    expect(AUTHOR_RUNTIME_EVIDENCE_QUERY).toMatch(
      /^\.\[\]\s*\|\s*"\\\(\s*\.parents\s*\|\s*length\s*\):\\\(\s*\.commit\.message\s*\|\s*@base64\s*\)"$/u,
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
    const claudeLine = `1:${Buffer.from(
      "fix: a\n\nCo-Authored-By: Claude X <x@y>",
      "utf8",
    ).toString("base64")}`;
    const mergeLine = `2:${Buffer.from("chore(memory): sync with latest main", "utf8").toString(
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
          `  printf '1:${evidence}\\n'`,
          'elif [ "$1" = "pr" ] && [ "$2" = "view" ]; then',
          `  printf '%s' ${JSON.stringify(prView)}`,
          'elif [ "$1" = "pr" ] && [ "$2" = "checks" ]; then',
          `  printf '%s' ${JSON.stringify(JSON.stringify([{ bucket: "pass" }]))}`,
          'elif [ "$1" = "run" ]; then',
          `  printf '%s' ${JSON.stringify(JSON.stringify({ headSha: "d".repeat(40), conclusion: "success" }))}`,
          "fi",
          "exit 0",
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
          commentUrl: "https://github.com/RetryYN/HELIX-HARNESS/pull/544#issuecomment-1",
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

  it("U-CPRCONV-019: parent 数が safe integer でない evidence を無効化する", () => {
    const encoded = Buffer.from("fix: a", "utf8").toString("base64");
    expect(parseAuthorRuntimeEvidence(`9007199254740993:${encoded}\n`)).toBeNull();
    expect(parseAuthorRuntimeEvidence(`99999999999999999999:${encoded}\n`)).toBeNull();
    expect(parseAuthorRuntimeEvidence(`9007199254740991:${encoded}\n`)).toEqual([
      { message: "fix: a", parentCount: 9007199254740991 },
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

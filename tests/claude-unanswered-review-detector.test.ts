import { spawn } from "node:child_process";
import { once } from "node:events";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parse as parseYaml } from "yaml";
import { runClaudeUnansweredReviewDetectorCommand } from "../src/cli/claude-unanswered-review-detector";
import {
  buildClaudePrReviewReceipt,
  renderIndependentPrReviewComment,
} from "../src/runtime/claude-pr-convergence";
import {
  type ClaudeReviewCommentObservation,
  detectUnansweredClaudeReviews,
} from "../src/runtime/claude-unanswered-review-detector";

const head = "a".repeat(40);
const sealedReceipt = (receiptHead: string): string =>
  renderIndependentPrReviewComment(
    buildClaudePrReviewReceipt({
      repository: "RetryYN/HELIX-HARNESS",
      prNumber: 10,
      prUrl: "https://github.com/RetryYN/HELIX-HARNESS/pull/10",
      headSha: receiptHead,
      authorRuntime: "codex",
      reviewerRuntime: "claude",
      authorModel: "codex-gpt-5",
      reviewerModel: "claude-opus-5",
      reviewerSessionId: "claude-review-session",
      verdict: "approve",
      blockerCount: 0,
      ciRunId: 123456,
      ciConclusion: "success",
      ciEvidenceGeneration: "run:123456:attempt:1:success",
      dbReceiptSchemaVersion: "helix-l3-g3-logical-db-bootstrap-receipt.v2",
      dbProjectionDigest: `sha256:${"1".repeat(64)}`,
      dbReplayProjectionDigest: `sha256:${"1".repeat(64)}`,
      dbCheckpointDigest: `sha256:${"2".repeat(64)}`,
      dbReplayCheckpointDigest: `sha256:${"2".repeat(64)}`,
      dbReceiptDigest: `sha256:${"3".repeat(64)}`,
      dbConverged: true,
      commentUrl: "https://github.com/RetryYN/HELIX-HARNESS/pull/10#issuecomment-123",
      reviewedAt: "2026-09-12T00:00:00.000Z",
    }),
  );
const comment = (
  id: number,
  body: string,
  overrides: Partial<ClaudeReviewCommentObservation> = {},
): ClaudeReviewCommentObservation => ({
  id,
  body,
  created_at: `2026-09-11T00:00:0${String(id)}Z`,
  updated_at: `2026-09-11T00:00:0${String(id)}Z`,
  author_login: "review-user",
  author_type: "User",
  ...overrides,
});

describe("Claude未応答review detector", () => {
  it("U-CLUNANS-001: [PLAN-L7-1743-claude-unanswered-review-detector/U-CLUNANS-001] latest requestをheadとcomment idへ束縛して未応答検出する", () => {
    const report = detectUnansweredClaudeReviews({
      trusted_responder_logins: ["review-user"],
      subjects: [
        {
          subject_kind: "pull_request",
          number: 10,
          head_sha: head,
          comments: [comment(1, "@claude このHEADをレビューしてください")],
        },
      ],
    });
    expect(report.unanswered).toEqual([
      expect.objectContaining({ comment_id: 1, requested_head: head }),
    ]);
    expect(
      detectUnansweredClaudeReviews({
        trusted_responder_logins: ["review-user"],
        subjects: [
          {
            subject_kind: "pull_request",
            number: 11,
            head_sha: head,
            comments: [comment(11, "@claude 封緘してください")],
          },
        ],
      }).unanswered,
    ).toEqual([expect.objectContaining({ comment_id: 11 })]);
  });

  it("U-CLUNANS-002: [PLAN-L7-1743-claude-unanswered-review-detector/U-CLUNANS-002] 同一HEADの後続receiptだけを回答として扱う", () => {
    const response = sealedReceipt(head);
    const wrong = sealedReceipt("b".repeat(40));
    const subject = {
      subject_kind: "pull_request" as const,
      number: 10,
      head_sha: head,
      comments: [comment(1, "@claude review"), comment(2, wrong), comment(3, response)],
    };
    expect(
      detectUnansweredClaudeReviews({
        subjects: [subject],
        trusted_responder_logins: ["review-user"],
      }).answered_request_ids,
    ).toEqual([1]);
    expect(
      detectUnansweredClaudeReviews({
        trusted_responder_logins: ["review-user"],
        subjects: [{ ...subject, comments: subject.comments.slice(0, 2) }],
      }).unanswered,
    ).toHaveLength(1);
  });

  it("U-CLUNANS-003: [PLAN-L7-1743-claude-unanswered-review-detector/U-CLUNANS-003] 前回観測済み依頼は編集でmentionを失っても消さない", () => {
    const initial = detectUnansweredClaudeReviews({
      trusted_responder_logins: ["review-user"],
      subjects: [
        {
          subject_kind: "issue",
          number: 11,
          head_sha: null,
          comments: [comment(4, "@claude 監査してください")],
        },
      ],
    });
    const next = detectUnansweredClaudeReviews({
      trusted_responder_logins: ["review-user"],
      previous_requests: initial.requests,
      subjects: [
        {
          subject_kind: "issue",
          number: 11,
          head_sha: null,
          comments: [comment(4, "依頼文は編集済み")],
        },
      ],
    });
    expect(next.unanswered).toEqual([
      expect.objectContaining({ comment_id: 4, edited_lost_mention: true }),
    ]);
  });

  it("U-CLUNANS-004: [PLAN-L7-1743-claude-unanswered-review-detector/U-CLUNANS-004] bot mentionと先行responseを回答へ数えない", () => {
    const report = detectUnansweredClaudeReviews({
      trusted_responder_logins: ["review-user"],
      subjects: [
        {
          subject_kind: "pull_request",
          number: 12,
          head_sha: head,
          comments: [
            comment(5, sealedReceipt(head)),
            comment(6, "@claude review", { author_type: "Bot" }),
            comment(7, "@claude review"),
          ],
        },
      ],
    });
    expect(report.ignored_bot_comment_ids).toEqual([6]);
    expect(report.unanswered).toEqual([expect.objectContaining({ comment_id: 7 })]);
  });

  it("U-CLUNANS-005: [PLAN-L7-1743-claude-unanswered-review-detector/U-CLUNANS-005] trusted responder以外のreview見出しを回答へ数えない", () => {
    const report = detectUnansweredClaudeReviews({
      trusted_responder_logins: ["claude-reviewer"],
      subjects: [
        {
          subject_kind: "pull_request",
          number: 13,
          head_sha: head,
          comments: [
            comment(8, "@claude review"),
            comment(9, sealedReceipt(head), {
              author_login: "untrusted-user",
            }),
          ],
        },
      ],
    });
    expect(report.unanswered).toEqual([expect.objectContaining({ comment_id: 8 })]);
    expect(report.untrusted_response_comment_ids).toEqual([9]);
  });

  it("U-CLUNANS-006: [PLAN-L7-1743-claude-unanswered-review-detector/U-CLUNANS-006] CLIは前回stateを再投入し既存outputを上書きしない", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-claude-unanswered-"));
    const input = join(root, "input.json");
    const previous = join(root, "previous.json");
    const output = join(root, "report.json");
    writeFileSync(
      input,
      JSON.stringify({
        schema_version: "claude-review-observation.v1",
        trusted_responder_logins: ["review-user"],
        subjects: [],
      }),
    );
    writeFileSync(
      previous,
      JSON.stringify({
        requests: [
          {
            subject_kind: "issue",
            number: 99,
            comment_id: 10,
            requested_head: null,
            first_observed_at: "2026-09-11T00:00:00Z",
            body_digest: `sha256:${"a".repeat(64)}`,
          },
        ],
      }),
    );
    expect(
      runClaudeUnansweredReviewDetectorCommand([
        "--input",
        input,
        "--previous",
        previous,
        "--previous-state",
        "loaded",
        "--output",
        output,
      ]),
    ).toMatchObject({ ok: true, unanswered_count: 1 });
    expect(JSON.parse(readFileSync(output, "utf8")).unanswered).toHaveLength(1);
    expect(() =>
      runClaudeUnansweredReviewDetectorCommand([
        "--input",
        input,
        "--previous",
        previous,
        "--previous-state",
        "loaded",
        "--output",
        output,
      ]),
    ).toThrow(/EEXIST/u);
  });

  it("U-CLUNANS-007: [PLAN-L7-1743-claude-unanswered-review-detector/U-CLUNANS-007] scheduled workflowはread-only権限と非required artifact出力を維持する", () => {
    const workflow = readFileSync(".github/workflows/claude-unanswered-review-audit.yml", "utf8");
    expect(parseYaml(workflow).permissions).toEqual({
      actions: "read",
      contents: "read",
      issues: "read",
      "pull-requests": "read",
    });
    expect(workflow).toContain("persist-credentials: false");
    expect(workflow).toContain('node-version: "24.15"');
    expect(workflow).toContain("claude-unanswered-review-state");
    expect(workflow).toContain("PREVIOUS_STATE=$previous_state");
    expect(workflow).toContain('--previous-state "$PREVIOUS_STATE"');
    expect(workflow).toContain("previous=$" + "{r.previous_observation.state}");
  });

  it("U-CLUNANS-010: [PLAN-L7-1743-claude-unanswered-review-detector/U-CLUNANS-010] previous artifact不存在を正常bootstrapへ変換しない", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-claude-observation-gap-"));
    const input = join(root, "input.json");
    const output = join(root, "report.json");
    writeFileSync(
      input,
      JSON.stringify({
        schema_version: "claude-review-observation.v1",
        trusted_responder_logins: ["review-user"],
        subjects: [],
      }),
    );
    expect(
      runClaudeUnansweredReviewDetectorCommand([
        "--input",
        input,
        "--output",
        output,
        "--previous-state",
        "missing",
      ]),
    ).toMatchObject({ ok: true, unanswered_count: 0, degraded: true });
    expect(JSON.parse(readFileSync(output, "utf8")).previous_observation).toEqual({
      state: "missing",
      bootstrap_revision: null,
      degraded: true,
      gap_codes: ["previous_artifact_missing"],
    });
    rmSync(root, { recursive: true, force: true });
  });

  it("U-CLUNANS-008: [PLAN-L7-1743-claude-unanswered-review-detector/U-CLUNANS-008] paginationのread-after差分を実processでfail-closeする", async () => {
    const root = mkdtempSync(join(tmpdir(), "helix-claude-pagination-race-"));
    const output = join(root, "observation.json");
    let requestCount = 0;
    const server = createServer((_request, response) => {
      requestCount += 1;
      response.writeHead(200, { "content-type": "application/json" });
      response.end(JSON.stringify([{ id: 1, updated_at: `2026-09-12T00:00:0${requestCount}Z` }]));
    });
    server.listen(0, "127.0.0.1");
    await once(server, "listening");
    const address = server.address();
    if (address === null || typeof address === "string") throw new Error("test_server_unavailable");
    const child = spawn(
      process.execPath,
      [
        ".github/scripts/collect-claude-review-observation.mjs",
        "RetryYN/HELIX-HARNESS",
        output,
        "RetryYN",
      ],
      {
        cwd: process.cwd(),
        env: {
          ...process.env,
          GITHUB_TOKEN: "test-token",
          GITHUB_API_URL: `http://127.0.0.1:${address.port}`,
        },
        stdio: ["ignore", "pipe", "pipe"],
      },
    );
    let stderr = "";
    child.stderr.setEncoding("utf8");
    child.stderr.on("data", (chunk: string) => {
      stderr += chunk;
    });
    const [exitCode] = (await once(child, "close")) as [number | null];
    server.close();
    await once(server, "close");
    rmSync(root, { recursive: true, force: true });
    expect(exitCode).not.toBe(0);
    expect(stderr).toContain("pagination_race:/repos/RetryYN/HELIX-HARNESS/pulls?state=open");
  });

  it("U-CLUNANS-009: [PLAN-L7-1743-claude-unanswered-review-detector/U-CLUNANS-009] 未封緘のreview見出しを回答へ昇格しない", () => {
    const report = detectUnansweredClaudeReviews({
      trusted_responder_logins: ["review-user"],
      subjects: [
        {
          subject_kind: "pull_request",
          number: 14,
          head_sha: head,
          comments: [
            comment(10, "@claude review"),
            comment(11, `## Claude reviewer: intermediate\nHEAD: \`${head}\``),
          ],
        },
      ],
    });
    expect(report.unanswered).toEqual([expect.objectContaining({ comment_id: 10 })]);
  });
});

import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { runClaudeUnansweredReviewDetectorCommand } from "../src/cli/claude-unanswered-review-detector";
import {
  type ClaudeReviewCommentObservation,
  detectUnansweredClaudeReviews,
} from "../src/runtime/claude-unanswered-review-detector";

const head = "a".repeat(40);
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
  });

  it("U-CLUNANS-002: [PLAN-L7-1743-claude-unanswered-review-detector/U-CLUNANS-002] 同一HEADの後続receiptだけを回答として扱う", () => {
    const response = `## Claude reviewer: approved\nHEAD: \`${head}\``;
    const wrong = `## Claude reviewer: approved\nHEAD: \`${"b".repeat(40)}\``;
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
            comment(5, `## Claude reviewer: old\nHEAD: \`${head}\``),
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
            comment(9, `## Claude reviewer: spoof\nHEAD: \`${head}\``, {
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
        "--output",
        output,
      ]),
    ).toMatchObject({ ok: true, unanswered_count: 1 });
    expect(JSON.parse(readFileSync(output, "utf8")).unanswered).toHaveLength(1);
    expect(() =>
      runClaudeUnansweredReviewDetectorCommand(["--input", input, "--output", output]),
    ).toThrow(/EEXIST/u);
  });

  it("U-CLUNANS-007: [PLAN-L7-1743-claude-unanswered-review-detector/U-CLUNANS-007] scheduled workflowはread-only権限と非required artifact出力を維持する", () => {
    const workflow = readFileSync(".github/workflows/claude-unanswered-review-audit.yml", "utf8");
    expect(workflow).toContain("actions: read");
    expect(workflow).toContain("issues: read");
    expect(workflow).toContain("pull-requests: read");
    expect(workflow).toContain("persist-credentials: false");
    expect(workflow).toContain("claude-unanswered-review-state");
    expect(workflow).not.toMatch(/issues:\s*write|pull-requests:\s*write/u);
    expect(readFileSync(".github/scripts/collect-claude-review-observation.mjs", "utf8")).toContain(
      "pagination_race:",
    );
  });
});

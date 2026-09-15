import { describe, expect, it } from "vitest";
import { buildReviewFeedbackSessionIntakeReport } from "../src/runtime/review-feedback-session-intake";

describe("review feedback session intake", () => {
  it("routes feedback to sessions while keeping source URL/ref and idempotent duplicates", () => {
    const report = buildReviewFeedbackSessionIntakeReport(
      [
        {
          feedback_key: "check:1",
          kind: "ci_failure",
          source_url: "https://github.com/org/repo/actions/runs/1",
          source_ref: "refs/heads/work",
          target_session_id: "session-a",
        },
        {
          feedback_key: "check:1",
          kind: "ci_failure",
          source_url: "https://github.com/org/repo/actions/runs/1",
          source_ref: "refs/heads/work",
          target_session_id: "session-a",
        },
      ],
      [{ session_id: "session-a", plan_id: "PLAN-A" }],
    );

    expect(report.ok).toBe(true);
    expect(report.duplicate_intake_count).toBe(1);
    expect(report.routed_events[0]).toMatchObject({
      source_url: "https://github.com/org/repo/actions/runs/1",
      source_ref: "refs/heads/work",
      target_session_id: "session-a",
      plan_id: "PLAN-A",
      state: "retry_task",
    });
  });

  it("keeps unknown sessions as orphan triage instead of failing intake", () => {
    const report = buildReviewFeedbackSessionIntakeReport(
      [
        {
          feedback_key: "review:1",
          kind: "review_comment",
          source_url: "https://github.com/org/repo/pull/1#discussion_r1",
          source_ref: "refs/pull/1",
          target_session_id: "missing-session",
        },
      ],
      [],
    );

    expect(report.ok).toBe(true);
    expect(report.orphan_count).toBe(1);
    expect(report.routed_events[0]).toMatchObject({ orphan: true, state: "triage" });
    expect(report.findings).toEqual([
      expect.objectContaining({ code: "feedback_orphan_triage", severity: "warning" }),
    ]);
  });
});

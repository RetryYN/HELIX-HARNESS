import { describe, expect, it } from "vitest";
import { selectLatestSuccessfulReviewCiGeneration } from "../src/runtime/github-review-ci-generation";

describe("PLAN-RECOVERY-65-review-generation-deadlock: review CI generation authority", () => {
  it("U-GRCIGEN-001: pending／failure／cancelledを除外して最新successを選ぶ", () => {
    const selected = selectLatestSuccessfulReviewCiGeneration([
      {
        id: 4,
        attempt: 1,
        status: "completed",
        conclusion: "failure",
        updatedAt: "2026-08-23T00:04:00Z",
      },
      {
        id: 3,
        attempt: 1,
        status: "in_progress",
        conclusion: null,
        updatedAt: "2026-08-23T00:03:00Z",
      },
      {
        id: 2,
        attempt: 2,
        status: "completed",
        conclusion: "success",
        updatedAt: "2026-08-23T00:02:00Z",
      },
      {
        id: 1,
        attempt: 1,
        status: "completed",
        conclusion: "success",
        updatedAt: "2026-08-23T00:01:00Z",
      },
    ]);
    expect(selected).toMatchObject({ id: 2, attempt: 2, conclusion: "success" });
  });

  it("U-GRCIGEN-002: 同刻ではattemptとrun IDで決定的に最新successを選ぶ", () => {
    const updatedAt = "2026-08-23T00:02:00Z";
    expect(
      selectLatestSuccessfulReviewCiGeneration([
        { id: 10, attempt: 1, status: "completed", conclusion: "success", updatedAt },
        { id: 9, attempt: 2, status: "completed", conclusion: "success", updatedAt },
      ]),
    ).toMatchObject({ id: 9, attempt: 2 });
  });

  it("U-GRCIGEN-003: successが無い場合はauthorityを生成しない", () => {
    expect(
      selectLatestSuccessfulReviewCiGeneration([
        {
          id: 1,
          attempt: 1,
          status: "completed",
          conclusion: "failure",
          updatedAt: "2026-08-23T00:01:00Z",
        },
      ]),
    ).toBeNull();
  });
});

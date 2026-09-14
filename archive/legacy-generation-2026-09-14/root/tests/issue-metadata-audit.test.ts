import { describe, expect, it } from "vitest";
import { auditIssueMetadata } from "../src/runtime/issue-metadata-audit";

// PLAN-L7-555-issue-metadata-enforcement / U-IMETA-001
describe("GitHub Issue metadata audit", () => {
  it("U-IMETA-001: [PLAN-L7-555-issue-metadata-enforcement] typeとlifecycleを持つopen Issueを受理する", () => {
    expect(
      auditIssueMetadata(
        [
          {
            number: 1,
            state: "open",
            createdAt: "2026-08-10T00:00:00Z",
            labels: ["feature", "state:backlog", "area:operations-harness"],
          },
        ],
        { now: "2026-08-14T00:00:00Z" },
      ).ok,
    ).toBe(true);
  });

  it("governed typeが2件以上のopen Issueもfail-closeする", () => {
    // `!== 1` を `>= 1` へ緩める mutation を kill する反例。
    // 2件以上の type label は「ちょうど1件」契約違反であり、>=1 では検出できない。
    const report = auditIssueMetadata(
      [
        {
          number: 5,
          state: "open",
          createdAt: "2026-08-10T00:00:00Z",
          labels: ["bug", "feature", "state:backlog"],
        },
      ],
      { now: "2026-08-14T00:00:00Z" },
    );
    expect(report.ok).toBe(false);
    expect(
      report.findings.filter((finding) => finding.issueNumber === 5).map((finding) => finding.code),
    ).toEqual(["type_label_missing"]);
  });

  it("48h以上unlabeledとtype/lifecycle欠落をfail-closeする", () => {
    const report = auditIssueMetadata(
      [
        { number: 2, state: "open", createdAt: "2026-08-11T00:00:00Z", labels: [] },
        { number: 3, state: "open", createdAt: "2026-08-13T23:00:00Z", labels: [] },
        { number: 4, state: "closed", createdAt: "2026-08-01T00:00:00Z", labels: [] },
      ],
      { now: "2026-08-14T00:00:00Z" },
    );
    expect(report.ok).toBe(false);
    expect(
      report.findings.filter((finding) => finding.issueNumber === 2).map((finding) => finding.code),
    ).toEqual(["unlabeled_open_issue_stale", "type_label_missing", "lifecycle_label_missing"]);
    expect(
      report.findings.some(
        (finding) => finding.issueNumber === 3 && finding.code === "unlabeled_open_issue_stale",
      ),
    ).toBe(false);
    expect(report.findings.some((finding) => finding.issueNumber === 4)).toBe(false);
  });

  it("workflow/signal分類をGitHub type labelとして受理しない", () => {
    const report = auditIssueMetadata(
      [
        {
          number: 6,
          state: "open",
          createdAt: "2026-08-10T00:00:00Z",
          labels: ["recovery", "state:backlog"],
        },
        {
          number: 7,
          state: "open",
          createdAt: "2026-08-10T00:00:00Z",
          labels: ["incident", "priority:p1"],
        },
      ],
      { now: "2026-08-14T00:00:00Z" },
    );

    expect(report.ok).toBe(false);
    expect(report.findings.filter((finding) => finding.code === "type_label_missing")).toEqual([
      expect.objectContaining({ issueNumber: 6 }),
      expect.objectContaining({ issueNumber: 7 }),
    ]);
  });
});

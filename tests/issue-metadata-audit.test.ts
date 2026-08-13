import { describe, expect, it } from "vitest";
import { auditIssueMetadata } from "../src/runtime/issue-metadata-audit";

// PLAN-L7-555-issue-metadata-enforcement / U-IMETA-001
describe("GitHub Issue metadata audit", () => {
  it("typeとlifecycleを持つopen Issueを受理する", () => {
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
});

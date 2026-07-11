import { describe, expect, it } from "vitest";
import { buildChangePackageDeltaArchiveReport } from "../src/runtime/change-package-delta-archive";

describe("change package delta archive", () => {
  it("fail-closes active archive requests without design/test delta and rollback evidence", () => {
    const report = buildChangePackageDeltaArchiveReport({
      package_id: "change:PLAN-L7-373",
      plan_id: "PLAN-L7-373",
      plan_status: "draft",
      archive_requested: true,
      design_paths: [],
      test_design_paths: [],
      acceptance_evidence_paths: [],
      delta_layers: ["L5", "L8"],
      archive_decision: null,
    });

    expect(report.ok).toBe(false);
    expect(report.dry_run).toBe(true);
    expect(report.findings.map((finding) => finding.code)).toEqual(
      expect.arrayContaining([
        "archive_without_design_or_test_delta",
        "archive_decision_missing_rollback_or_digest",
        "change_package_missing_acceptance_evidence",
      ]),
    );
    expect(report.archive_allowed).toBe(false);
  });

  it("allows archived packages only with rollback path and evidence digest", () => {
    const report = buildChangePackageDeltaArchiveReport({
      package_id: "change:PLAN-L7-373",
      plan_id: "PLAN-L7-373",
      plan_status: "archived",
      archive_requested: true,
      design_paths: ["docs/design/helix/L5-detail/change.md"],
      test_design_paths: ["docs/test-design/harness/L8-unit-test-design.md"],
      acceptance_evidence_paths: ["docs/evidence/change.json"],
      delta_layers: ["L5", "L8"],
      archive_decision: {
        rollback_path: "docs/archive/PLAN-L7-373.rollback.md",
        evidence_digest: "sha256:abc",
      },
    });

    expect(report.ok).toBe(true);
    expect(report.archive_allowed).toBe(true);
    expect(report.manifest_digest).toMatch(/^sha256:[a-f0-9]{64}$/);
  });
});

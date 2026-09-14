import { describe, expect, it } from "vitest";
import {
  planReleaseAutomationDecision,
  RELEASE_AUTOMATION_CANDIDATES,
} from "../src/audit/release-automation-decision";

describe("release automation decision", () => {
  it("U-RELDEC-001: selects Release Please as plan-only automation for PR-gated releases", () => {
    const result = planReleaseAutomationDecision({
      adrStatus: "accepted",
      conventionalCommits: true,
      requiresPrReviewGate: true,
      requiresDryRun: true,
      mergeQueueEnabled: true,
    });

    expect(result).toMatchObject({
      ok: true,
      dryRun: true,
      applyAuthorized: false,
      selectedTool: "release-please",
      decision: "adopt_release_please_plan_only",
      mergeQueueEnabled: true,
    });
    expect(result.commands.dryRun).toContain("--dry-run");
    expect(result.requiredApprovals).toContain("action_binding_approval_record");
    expect(result.candidates).toEqual(RELEASE_AUTOMATION_CANDIDATES);
  });

  it("U-RELDEC-002: blocks semantic-release when a release PR review gate is required", () => {
    const result = planReleaseAutomationDecision({
      adrStatus: "accepted",
      selectedTool: "semantic-release",
      conventionalCommits: true,
      requiresPrReviewGate: true,
      requiresDryRun: true,
      mergeQueueEnabled: false,
    });

    expect(result).toMatchObject({
      ok: false,
      applyAuthorized: false,
      selectedTool: "semantic-release",
      decision: "blocked",
    });
    expect(result.findings).toContainEqual(
      expect.objectContaining({ code: "release_pr_gate_required" }),
    );
  });

  it("U-RELDEC-003: fails closed while ADR or dry-run prerequisites are missing", () => {
    const result = planReleaseAutomationDecision({
      adrStatus: "missing",
      conventionalCommits: false,
      requiresPrReviewGate: true,
      requiresDryRun: false,
      mergeQueueEnabled: true,
    });

    expect(result.ok).toBe(false);
    expect(result.applyAuthorized).toBe(false);
    expect(result.findings.map((finding) => finding.code)).toEqual(
      expect.arrayContaining([
        "release_adr_not_accepted",
        "conventional_commits_required",
        "dry_run_required",
      ]),
    );
  });
});

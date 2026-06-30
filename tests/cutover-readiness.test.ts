import { describe, expect, it } from "vitest";
import {
  analyzeCutoverReadiness,
  type CutoverReadinessInput,
  cutoverReadinessMessages,
  loadCutoverReadinessInput,
} from "../src/lint/cutover-readiness";

const cutoverMarkers = [
  "cutover_decision_record",
  "allowed_outcome",
  "decision_owner",
  "trigger_condition",
  "blast_radius_baseline",
  "dry_run_plan",
  "rollback_plan",
  "state_backup_plan",
  "approval_scope",
  "audit_record",
  "post_cutover_monitoring",
  "legacy_alias_policy",
].join("\n");

function input(overrides: Partial<CutoverReadinessInput> = {}): CutoverReadinessInput {
  return {
    rightArmMd: cutoverMarkers,
    outstandingTs: [
      "cutover_decision_record with allowed_outcome approve_cutover / reject_or_defer / request_runbook_changes",
      "trigger_condition and blast_radius_baseline recorded before irreversible migration",
      "dry_run_plan, rollback_plan, state_backup_plan, and audit_record recorded before apply",
      "post_cutover_monitoring and legacy_alias_policy recorded before terminal status",
    ].join("\n"),
    plans: [
      {
        file: "PLAN-M-900.md",
        plan_id: "PLAN-M-900",
        layer: "L14",
        kind: "design",
        status: "draft",
        text: `irreversible state dir cutover\n${cutoverMarkers}`,
      },
    ],
    ...overrides,
  };
}

describe("cutover readiness", () => {
  it("passes when pending irreversible L14 cutover plans carry a full decision record", () => {
    const result = analyzeCutoverReadiness(input());
    expect(result.ok).toBe(true);
    expect(result.pendingPlanIds).toEqual(["PLAN-M-900"]);
    expect(cutoverReadinessMessages(result)[0]).toContain("cutover-readiness - OK");
  });

  it("fails irreversible cutover plans that only say PO signoff", () => {
    const result = analyzeCutoverReadiness(
      input({
        plans: [
          {
            file: "PLAN-M-901.md",
            plan_id: "PLAN-M-901",
            layer: "L14",
            kind: "design",
            status: "draft",
            text: "irreversible cutover requires PO signoff",
          },
        ],
      }),
    );

    expect(result.ok).toBe(false);
    expect(result.violations).toEqual(
      expect.arrayContaining([
        { subject: "PLAN-M-901", reason: "missing cutover_decision_record" },
        { subject: "PLAN-M-901", reason: "missing dry_run_plan" },
        { subject: "PLAN-M-901", reason: "missing rollback_plan" },
        { subject: "PLAN-M-901", reason: "missing audit_record" },
      ]),
    );
  });

  it("ignores terminal or non-L14 migration prose", () => {
    const result = analyzeCutoverReadiness(
      input({
        plans: [
          {
            file: "PLAN-M-902.md",
            plan_id: "PLAN-M-902",
            layer: "L14",
            kind: "design",
            status: "confirmed",
            text: "irreversible cutover requires PO signoff",
          },
          {
            file: "PLAN-L7-902.md",
            plan_id: "PLAN-L7-902",
            layer: "L7",
            kind: "impl",
            status: "draft",
            text: "cutover helper",
          },
        ],
      }),
    );

    expect(result.ok).toBe(true);
    expect(result.pendingPlanIds).toEqual([]);
  });

  it("passes against the live repository and lists the current L14 cutover decision", () => {
    const result = analyzeCutoverReadiness(loadCutoverReadinessInput());
    expect(result.ok).toBe(true);
    expect(result.pendingPlanIds).toEqual(["PLAN-M-02-helix-identifier-rename"]);
  });
});

import { describe, expect, it } from "vitest";
import {
  analyzeVersionUpReadiness,
  loadVersionUpReadinessInput,
  type VersionUpReadinessInput,
  versionUpReadinessMessages,
} from "../src/lint/version-up-readiness";

function input(overrides: Partial<VersionUpReadinessInput> = {}): VersionUpReadinessInput {
  return {
    charter: "version-up 定義\n今版に入れない作業を失わない",
    pillarRequirements: [
      "HR-FR-P1-02",
      "HAC-P1-02a",
      "version-up-readiness",
      "`version_target`",
      "activation 条件",
      "今版外作業を失わない",
    ].join("\n"),
    functionalDesign: [
      "HB-P1 continuous-autonomy",
      "continuous-run、version-up",
      "signal → mode routing",
      "escalation_boundaries",
    ].join("\n"),
    modeCatalog: [
      "| **version-up** |",
      "[version-up.md](version-up.md)",
      "`version_deferral`",
      "将来版活性化時 → add-feature",
    ].join("\n"),
    modeDoc: [
      "deferred-but-committed-future",
      "status=draft",
      "version_target",
      "VERSION_UP_ALLOWED_TARGETS",
      "activation_decision_record",
      "allowed_outcome",
      "review_by",
      "approval_scope",
      "dry_run_plan",
      "rollback_plan",
      "action-binding approval",
      "escalation_boundaries",
    ].join("\n"),
    discoveryPlan: "decision_outcome: confirmed\nactivation note (2026-06-30)",
    plans: [
      {
        file: "PLAN-L7-900-future.md",
        plan_id: "PLAN-L7-900-future",
        status: "draft",
        versionTarget: "future",
        text: [
          "version-up parked",
          "mode=version-up",
          "activation",
          "activation_decision_record",
          "allowed_outcome",
          "review_by",
          "version_target",
          "Cloudflare HMAC webhook access control external",
          "action-binding approval",
          "escalation_boundaries",
          "approval_scope",
          "dry_run_plan",
          "rollback_plan",
          "exit 1",
        ].join("\n"),
      },
    ],
    ...overrides,
  };
}

describe("version-up-readiness", () => {
  it("passes when mode docs and parked plans expose activation and approval boundaries", () => {
    const result = analyzeVersionUpReadiness(input());
    expect(result.ok).toBe(true);
    expect(result.parkedPlanIds).toEqual(["PLAN-L7-900-future"]);
    expect(versionUpReadinessMessages(result)[0]).toContain("version-up-readiness - OK");
  });

  it("fails parked plans that do not explain activation as version-up", () => {
    const result = analyzeVersionUpReadiness(
      input({
        plans: [
          {
            file: "PLAN-L7-901-future.md",
            plan_id: "PLAN-L7-901-future",
            status: "draft",
            versionTarget: "future",
            text: "version_target: future",
          },
        ],
      }),
    );

    expect(result.ok).toBe(false);
    expect(result.violations.map((v) => v.reason)).toContain(
      "missing parked marker mode=version-up",
    );
    expect(result.violations.map((v) => v.reason)).toContain("missing parked marker activation");
    expect(result.violations.map((v) => v.reason)).toContain(
      "missing parked marker activation_decision_record",
    );
  });

  it("fails when the feature catalog or requirement trace drops version-up semantics", () => {
    const result = analyzeVersionUpReadiness(
      input({
        pillarRequirements: "HR-FR-P1-02",
        modeCatalog: "| **version-up** |",
      }),
    );

    expect(result.ok).toBe(false);
    expect(result.violations).toEqual(
      expect.arrayContaining([
        { subject: "L3 pillar requirements", reason: "missing HAC-P1-02a" },
        { subject: "docs/process/modes/README.md", reason: "missing `version_deferral`" },
      ]),
    );
  });

  it("fails external activation candidates without explicit approval and route-fail evidence", () => {
    const result = analyzeVersionUpReadiness(
      input({
        plans: [
          {
            file: "PLAN-L7-902-external.md",
            plan_id: "PLAN-L7-902-external",
            status: "draft",
            versionTarget: "future",
            text: "version-up parked\nmode=version-up\nactivation\nactivation_decision_record\nallowed_outcome\nreview_by\nversion_target\nCloudflare HMAC webhook",
          },
        ],
      }),
    );

    expect(result.ok).toBe(false);
    expect(result.violations.map((v) => v.reason)).toEqual(
      expect.arrayContaining([
        "external activation boundary missing action-binding approval",
        "external activation boundary missing escalation_boundaries",
        "external activation boundary missing approval_scope",
        "external activation boundary missing dry_run_plan",
        "external activation boundary missing rollback_plan",
        "external activation boundary missing exit 1",
      ]),
    );
  });

  it("passes against the live repository and keeps PLAN-L7-146 parked", () => {
    const result = analyzeVersionUpReadiness(loadVersionUpReadinessInput());
    expect(result.ok).toBe(true);
    expect(result.parkedPlanIds).toEqual(["PLAN-L7-146-serverless-readonly-share"]);
  });
});

import { describe, expect, it } from "vitest";
import { DEFAULT_CI_AUTO_FIX_POLICY, gateCiAutoFixRepush } from "../src/audit/ci-auto-fix-gate";

describe("CI auto-fix gate", () => {
  it("U-CIFIX-001: allows dry-run repush only for red CI above confidence threshold and below iteration cap", () => {
    const result = gateCiAutoFixRepush({
      ciStatus: "red",
      confidence: 0.82,
      attempt: 1,
      failureKind: "test_failure",
    });

    expect(result).toMatchObject({
      ok: true,
      dryRun: true,
      allowRepush: true,
      route: "repush",
      minConfidence: DEFAULT_CI_AUTO_FIX_POLICY.minConfidence,
      maxAttempts: DEFAULT_CI_AUTO_FIX_POLICY.maxAttempts,
    });
    expect(result.findings).toEqual([]);
  });

  it("U-CIFIX-002: routes low confidence or exhausted attempts to issue escalation", () => {
    const result = gateCiAutoFixRepush({
      ciStatus: "red",
      confidence: 0.74,
      attempt: 2,
      failureKind: "test_failure",
    });

    expect(result).toMatchObject({
      ok: false,
      allowRepush: false,
      route: "issue_escalation",
    });
    expect(result.findings.map((finding) => finding.code)).toEqual(
      expect.arrayContaining(["confidence_below_threshold", "iteration_cap_exceeded"]),
    );
  });

  it("U-CIFIX-003: rejects security and unavailable CI failures as fail-close", () => {
    const security = gateCiAutoFixRepush({
      ciStatus: "red",
      confidence: 0.95,
      attempt: 0,
      failureKind: "security_failure",
    });
    expect(security.ok).toBe(false);
    expect(security.route).toBe("issue_escalation");
    expect(security.findings).toContainEqual(
      expect.objectContaining({ code: "failure_kind_not_autofixable" }),
    );

    const unavailable = gateCiAutoFixRepush({
      ciStatus: "unavailable",
      confidence: 0.95,
      attempt: 0,
      failureKind: "test_failure",
    });
    expect(unavailable.ok).toBe(false);
    expect(unavailable.route).toBe("issue_escalation");
    expect(unavailable.findings).toContainEqual(
      expect.objectContaining({ code: "ci_unavailable" }),
    );
  });

  it("U-CIFIX-003: does not repush when CI is green or pending", () => {
    expect(
      gateCiAutoFixRepush({
        ciStatus: "green",
        confidence: 1,
        attempt: 0,
        failureKind: "test_failure",
      }),
    ).toMatchObject({ ok: false, route: "no_action", allowRepush: false });
    expect(
      gateCiAutoFixRepush({
        ciStatus: "pending",
        confidence: 1,
        attempt: 0,
        failureKind: "test_failure",
      }),
    ).toMatchObject({ ok: false, route: "wait_for_ci", allowRepush: false });
  });
});

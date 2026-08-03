import { describe, expect, it } from "vitest";
import {
  admitWrapperLaunch,
  buildAdapterPlan,
  buildWrapperAdapterPlan,
  evaluateWrapperAdmissionWitness,
  isWrapperLaunchCapability,
} from "../src/runtime/adapter";

// PLAN-L7-498-worker-wrapper-admission

const DIGEST_A = `sha256:${"a".repeat(64)}` as const;
const DIGEST_B = `sha256:${"b".repeat(64)}` as const;

describe("worker wrapper admission", () => {
  it("U-WWA-001: HELIX内部で生成したplanだけをsealed capabilityへ昇格する", () => {
    const plan = buildWrapperAdapterPlan(
      { provider: "codex", role: "se", task: "implement", execute: true },
      "hybrid",
      "helix_cli_adapter",
    );

    const result = admitWrapperLaunch(plan);

    expect("failure_code" in result).toBe(false);
    if ("failure_code" in result) return;
    expect(result.invocation.args).toEqual(plan.args);
    expect(result.stdin).toBe(plan.stdin);
    expect(isWrapperLaunchCapability(result.capability)).toBe(true);
    expect(
      isWrapperLaunchCapability({
        ...result.capability,
      }),
    ).toBe(false);
  });

  it("U-WWA-002: raw／copy planの後付け再ラベルを拒否する", () => {
    const raw = buildAdapterPlan(
      { provider: "claude", role: "reviewer", task: "review", execute: true },
      "hybrid",
    );
    expect(admitWrapperLaunch(raw)).toEqual({
      admitted: false,
      failure_code: "WRAPPER_ROUTE_REJECTED",
    });

    const wrapper = buildWrapperAdapterPlan(
      { provider: "claude", role: "reviewer", task: "review", execute: true },
      "hybrid",
      "team_adapter",
    );
    expect(admitWrapperLaunch({ ...wrapper })).toEqual({
      admitted: false,
      failure_code: "WRAPPER_ROUTE_REJECTED",
    });
  });

  it("U-WWA-003: planを生成後に改竄するとdigest mismatchで拒否する", () => {
    const plan = buildWrapperAdapterPlan(
      { provider: "codex", role: "se", task: "implement", execute: true },
      "hybrid",
      "helix_cli_adapter",
    );
    plan.args.push("--dangerous");

    expect(admitWrapperLaunch(plan)).toEqual({
      admitted: false,
      failure_code: "WRAPPER_ADAPTER_PLAN_DIGEST_MISMATCH",
    });
  });

  it("U-WWA-004: originとplanのprovider不一致をdigest判定前に拒否する", () => {
    const plan = buildWrapperAdapterPlan(
      { provider: "codex", role: "se", task: "implement", execute: true },
      "hybrid",
      "helix_cli_adapter",
    );
    plan.provider = "claude";

    expect(admitWrapperLaunch(plan)).toEqual({
      admitted: false,
      failure_code: "WRAPPER_ORIGIN_PROVIDER_MISMATCH",
    });
  });

  it("U-WWA-005: direct provider routeを拒否する", () => {
    expect(
      evaluateWrapperAdmissionWitness({
        route: "direct_provider_cli",
        expected_adapter_plan_digest: DIGEST_A,
        actual_adapter_plan_digest: DIGEST_A,
        expected_invocation_digest: DIGEST_A,
        actual_invocation_digest: DIGEST_A,
      }),
    ).toEqual({
      admitted: false,
      failure_code: "WRAPPER_ROUTE_REJECTED",
    });
  });

  it("U-WWA-006: adapter plan digest failureへ到達する", () => {
    expect(
      evaluateWrapperAdmissionWitness({
        route: "helix_cli_adapter",
        expected_adapter_plan_digest: DIGEST_A,
        actual_adapter_plan_digest: DIGEST_B,
        expected_invocation_digest: DIGEST_A,
        actual_invocation_digest: DIGEST_A,
      }),
    ).toEqual({
      admitted: false,
      failure_code: "WRAPPER_ADAPTER_PLAN_DIGEST_MISMATCH",
    });
  });

  it("U-WWA-007: invocation digest failureへ到達する", () => {
    expect(
      evaluateWrapperAdmissionWitness({
        route: "team_adapter",
        expected_adapter_plan_digest: DIGEST_A,
        actual_adapter_plan_digest: DIGEST_A,
        expected_invocation_digest: DIGEST_A,
        actual_invocation_digest: DIGEST_B,
      }),
    ).toEqual({
      admitted: false,
      failure_code: "WRAPPER_INVOCATION_DIGEST_MISMATCH",
    });
  });
});

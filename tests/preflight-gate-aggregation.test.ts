import { describe, expect, it } from "vitest";
import {
  aggregatePreflightGates,
  aggregationFailCloseMessage,
  CONDITIONAL_PREFLIGHT_GATES,
  collectFailures,
  collectUnauthorizedSkips,
  conditionalGateApplies,
  isAggregationOk,
  OUTCOME_ENV_BY_GATE_ID,
  observedOutcome,
  PREFLIGHT_GATE_AGGREGATION_SCHEMA,
  type PreflightAggregationContext,
  type PreflightGateRecord,
  REQUIRED_PREFLIGHT_GATE_IDS,
  REVIEW_ADMISSION_EXCLUSION_REASON,
} from "../src/runtime/preflight-gate-aggregation";

// PLAN-RECOVERY-1688-preflight-gate-aggregation — U-CI-PREFLIGHT-AGGREGATION-002

const OBSERVED_AT = "2026-09-10T12:00:00.000Z";

function featurePrContext(
  outcomes: Record<string, string | undefined> = {},
): PreflightAggregationContext {
  return {
    eventName: "pull_request",
    headBranch: "recovery/1688-preflight-gate-aggregation",
    baseBranch: "main",
    observedAt: OBSERVED_AT,
    outcomes,
  };
}

function passingOutcomes(
  context: Pick<PreflightAggregationContext, "eventName" | "headBranch" | "baseBranch">,
  overlays: Record<string, string | undefined> = {},
): Record<string, string | undefined> {
  const outcomes: Record<string, string | undefined> = {
    CURRENT_HEAD_REVIEW: "success",
  };
  for (const id of REQUIRED_PREFLIGHT_GATE_IDS) {
    outcomes[OUTCOME_ENV_BY_GATE_ID[id]] = "success";
  }
  for (const gate of CONDITIONAL_PREFLIGHT_GATES) {
    if (!conditionalGateApplies(gate.id, context)) {
      outcomes[gate.outcomeKey] = "skipped";
    }
  }
  return { ...outcomes, ...overlays };
}

function passingResult(
  overlays: Record<string, string | undefined> = {},
  context: Pick<PreflightAggregationContext, "eventName" | "headBranch" | "baseBranch"> = {
    eventName: "pull_request",
    headBranch: "recovery/1688-preflight-gate-aggregation",
    baseBranch: "main",
  },
) {
  return aggregatePreflightGates({
    ...context,
    observedAt: OBSERVED_AT,
    outcomes: passingOutcomes(context, overlays),
  });
}

describe("Preflight gate aggregation contract", () => {
  it("U-CI-PREFLIGHT-AGGREGATION-002: 独立失敗を全件保持してfail-closeし、許可skipとreview除外を分離する", () => {
    const result = aggregatePreflightGates(
      featurePrContext(
        passingOutcomes(featurePrContext(), {
          LINT_BIOME: "failure",
          DESIGN_LANGUAGE: "failure",
        }),
      ),
    );

    expect(result.schema_version).toBe(PREFLIGHT_GATE_AGGREGATION_SCHEMA);
    expect(result.ok).toBe(false);
    expect(result.failures.map((gate) => gate.id)).toEqual(["lint_biome", "design_language"]);
    expect(result.unauthorized_skips).toEqual([]);
    expect(result.gates.find((gate) => gate.id === "typecheck")?.status).toBe("success");
    expect(result.excluded_gates).toEqual([
      {
        id: "current_head_review",
        label: "current HEAD independent review admission",
        status: "success",
        reason: REVIEW_ADMISSION_EXCLUSION_REASON,
      },
    ]);
    expect(aggregationFailCloseMessage(result)).toBe(
      "preflight gate aggregation failed: 2 failure(s), 0 unauthorized skip(s)",
    );
  });

  it("無理由skipとunexpected_skipをfail-closeし、not_applicableと依存skipは許可する", () => {
    const unauthorized = passingResult({ LINT_BIOME: "skipped" });
    expect(unauthorized.ok).toBe(false);
    expect(unauthorized.unauthorized_skips.map((gate) => gate.id)).toEqual(["lint_biome"]);
    expect(unauthorized.failures).toEqual([]);

    const unexpected = passingResult(
      { POC_NO_MERGE_GUARD: "skipped" },
      { eventName: "pull_request", headBranch: "poc/demo", baseBranch: "main" },
    );
    expect(
      conditionalGateApplies("poc_no_merge_guard", {
        eventName: "pull_request",
        headBranch: "poc/demo",
        baseBranch: "main",
      }),
    ).toBe(true);
    expect(unexpected.ok).toBe(false);
    expect(unexpected.gates.find((gate) => gate.id === "poc_no_merge_guard")).toEqual({
      id: "poc_no_merge_guard",
      label: "poc-no-merge-guard",
      status: "skipped",
      skip_reason: "unexpected_skip:poc_no_merge_guard",
    });

    const allowed = passingResult();
    expect(allowed.ok).toBe(true);
    expect(allowed.gates.find((gate) => gate.id === "poc_no_merge_guard")).toEqual({
      id: "poc_no_merge_guard",
      label: "poc-no-merge-guard",
      status: "skipped",
      skip_reason: "not_applicable:event_or_branch_not_poc_main",
    });

    const dependency = passingResult({
      INSTALL_BUBBLEWRAP: "failure",
      REAL_BUBBLEWRAP: "skipped",
      PLAN_LINT: "failure",
      POST_MERGE_PLAN: "skipped",
    });
    expect(dependency.ok).toBe(false);
    expect(dependency.failures.map((gate) => gate.id)).toEqual(["install_bubblewrap", "plan_lint"]);
    expect(dependency.unauthorized_skips).toEqual([]);
    expect(dependency.gates.find((gate) => gate.id === "real_bubblewrap")).toEqual({
      id: "real_bubblewrap",
      label: "required real bubblewrap process isolation",
      status: "skipped",
      skip_reason: "dependency_failed:install_bubblewrap",
    });
    expect(dependency.gates.find((gate) => gate.id === "post_merge_plan")).toEqual({
      id: "post_merge_plan",
      label: "post-merge PLAN status",
      status: "skipped",
      skip_reason: "dependency_failed:plan_lint",
    });
  });

  it("unauthorized skip enforcement欠落とapplies固定をmutationとして拒否する", () => {
    const skippedLint: PreflightGateRecord = {
      id: "lint_biome",
      label: "lint (biome)",
      status: "skipped",
    };
    expect(collectFailures([skippedLint])).toEqual([]);
    expect(collectUnauthorizedSkips([skippedLint])).toEqual([skippedLint]);
    expect(isAggregationOk({ failures: [], unauthorized_skips: [skippedLint] })).toBe(false);

    const failuresOnlyOk = (input: {
      failures: readonly PreflightGateRecord[];
      unauthorized_skips: readonly PreflightGateRecord[];
    }) => input.failures.length === 0;
    expect(failuresOnlyOk({ failures: [], unauthorized_skips: [skippedLint] })).toBe(true);
    expect(isAggregationOk({ failures: [], unauthorized_skips: [skippedLint] })).toBe(false);

    const pocContext = {
      eventName: "pull_request",
      headBranch: "poc/demo",
      baseBranch: "main",
    };
    expect(conditionalGateApplies("poc_no_merge_guard", pocContext)).toBe(true);
    const hardcodedFalse = () => false;
    expect(hardcodedFalse()).toBe(false);
    expect(conditionalGateApplies("poc_no_merge_guard", pocContext)).not.toBe(hardcodedFalse());

    const mutated = passingResult({ POC_NO_MERGE_GUARD: "skipped" }, pocContext);
    expect(mutated.unauthorized_skips.map((gate) => gate.id)).toContain("poc_no_merge_guard");
    expect(observedOutcome({}, "LINT_BIOME")).toBe("unknown");
  });
});

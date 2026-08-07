// PLAN-L7-512-screen-freeze-plan-route / U-SAP-012（composition: aggregate → commit）
import { describe, expect, it } from "vitest";
import type {
  PlanScreenDecisionV1,
  PlanScreenRouteCommitBundleV1,
  PlanScreenRouteReceiptV1,
  ScreenDecisionV1,
  ScreenResultV1,
  ScreenScopeSnapshotV1,
  ScreenTransactionPortV1,
} from "../src/design/screen-applicability";
import {
  aggregatePlanScreenRoute,
  buildPlanScreenRouteBundle,
  commitPlanScreenRoute,
} from "../src/design/screen-applicability";

const scope: ScreenScopeSnapshotV1 = {
  snapshot_id: "snap-1",
  revision: 3,
  capability_ids: ["cap-a", "cap-b"],
  phase: "L2",
  public_surface_digest: "sha256:surface",
  scope_digest: "sha256:scope",
};

function decision(overrides: Partial<ScreenDecisionV1> = {}): ScreenDecisionV1 {
  return {
    decision_id: "dec-a",
    decision_revision: 1,
    scope_digest: "sha256:scope",
    capability_id: "cap-a",
    phase: "L2",
    status: "current",
    route: "not_applicable",
    reason_code: "no_public_ui_surface",
    evidence_digest: "sha256:evidence",
    detector_id: "detector-1",
    detector_version: "1.0.0",
    detector_result_digest: "sha256:result",
    detector_provenance_digest: "sha256:provenance",
    actor_id: "actor-1",
    rule_digest: "sha256:rule",
    reentry_trigger: "scope_digest_change",
    decision_digest: "sha256:decision-a",
    ...overrides,
  };
}

const noUiDecision = decision();
const uiDecision = decision({
  decision_id: "dec-b",
  capability_id: "cap-b",
  route: "prototype_required",
  decision_digest: "sha256:decision-b",
});

function makeFakePort(
  respond?: (bundle: PlanScreenRouteCommitBundleV1) => ScreenResultV1<PlanScreenRouteReceiptV1>,
) {
  const received: PlanScreenRouteCommitBundleV1[] = [];
  const port: ScreenTransactionPortV1 = {
    commitSkip: () => Promise.reject(new Error("not in slice3")),
    commitAgreement: () => Promise.reject(new Error("not in slice3")),
    staleForReentry: () => Promise.reject(new Error("not in slice3")),
    commitPlanScreenRoute: (bundle) => {
      received.push(bundle);
      if (respond) return Promise.resolve(respond(bundle));
      const receipt: PlanScreenRouteReceiptV1 = {
        plan_route_receipt_id: "plan-route-1",
        operation_id: bundle.operation_id,
        snapshot_id: bundle.snapshot_id,
        snapshot_revision: bundle.expected_snapshot_revision,
        capability_set_digest: bundle.capability_set_digest,
        decision_aggregate_digest: bundle.plan.decision_aggregate_digest,
        route: bundle.plan.route,
        prototype_task_set_digest: "sha256:task-set",
        stage_head: "sha256:stage-head",
        receipt_digest: "sha256:receipt",
        gate_write_count: 0,
      };
      return Promise.resolve({ ok: true, value: receipt });
    },
  };
  return { port, received };
}

function validAggregate(): PlanScreenDecisionV1 {
  const result = aggregatePlanScreenRoute(scope, [noUiDecision, uiDecision]);
  if (!result.ok) throw new Error("fixture aggregate must succeed");
  return result.value;
}

function validBundle(): PlanScreenRouteCommitBundleV1 {
  const result = buildPlanScreenRouteBundle(
    scope,
    validAggregate(),
    [noUiDecision, uiDecision],
    [
      {
        task_id: "task-b",
        capability_id: "cap-b",
        requirement_revision: 1,
        obligation_digest: "sha256:obligation",
        status: "planned",
      },
    ],
  );
  if (!result.ok) throw new Error("fixture bundle must build");
  return result.value;
}

describe("U-SAP-012 aggregatePlanScreenRoute → commitPlanScreenRoute", () => {
  it("U-SAP-012: 1件でもUIならplan routeはprototype_requiredを優先し、commitはport委譲exactly-oneでgate_write_count=0のreceiptを返す", async () => {
    const aggregate = validAggregate();
    expect(aggregate.route).toBe("prototype_required");
    expect(aggregate.capability_ids).toEqual(["cap-a", "cap-b"]);
    expect(aggregate.decision_ids).toEqual(["dec-a", "dec-b"]);
    const { port, received } = makeFakePort();
    const result = await commitPlanScreenRoute(validBundle(), port);
    expect(result.ok).toBe(true);
    expect(received).toHaveLength(1);
    if (result.ok) {
      expect(result.value.gate_write_count).toBe(0);
      expect(result.value.operation_id).toBe(validBundle().operation_id);
      expect(result.value.route).toBe("prototype_required");
    }
  });

  it("全no-UIのaggregateはnot_applicable route", () => {
    const only = decision({ capability_id: "cap-a,cap-b", decision_digest: "sha256:packed" });
    const result = aggregatePlanScreenRoute(scope, [only]);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.route).toBe("not_applicable");
  });

  it("同一入力のaggregate再計算は決定的同値", () => {
    const a = validAggregate();
    const b = validAggregate();
    expect(a.decision_aggregate_digest).toBe(b.decision_aggregate_digest);
    expect(a.capability_set_digest).toBe(b.capability_set_digest);
  });

  it.each([
    ["capability欠落（decision不足）", [noUiDecision]],
    [
      "capability余剰（scope外decision）",
      [
        noUiDecision,
        uiDecision,
        decision({
          decision_id: "dec-c",
          capability_id: "cap-c",
          decision_digest: "sha256:decision-c",
        }),
      ],
    ],
    [
      "capability重複（同一capabilityへ2 decision）",
      [noUiDecision, uiDecision, decision({ decision_id: "dec-a2" })],
    ],
  ])("aggregate固有mutation（%s）はfail-close", (_label, decisions) => {
    const result = aggregatePlanScreenRoute(scope, decisions);
    expect(result.ok).toBe(false);
  });

  it("decision staleはHIL_SCREEN_DECISION_MISSING", () => {
    const result = aggregatePlanScreenRoute(scope, [
      { ...noUiDecision, status: "stale" },
      uiDecision,
    ]);
    expect(result.ok).toBe(false);
    if (!result.ok)
      expect(result.failures.map((f) => f.code)).toContain("HIL_SCREEN_DECISION_MISSING");
  });

  it("decision deferredはHIL_SCREEN_DEFERRED_NOT_CLOSED", () => {
    const result = aggregatePlanScreenRoute(scope, [
      { ...noUiDecision, route: "deferred" },
      uiDecision,
    ]);
    expect(result.ok).toBe(false);
    if (!result.ok)
      expect(result.failures.map((f) => f.code)).toContain("HIL_SCREEN_DEFERRED_NOT_CLOSED");
  });

  it("scope digest不一致のdecision混入はfail-close", () => {
    const result = aggregatePlanScreenRoute(scope, [
      { ...noUiDecision, scope_digest: "sha256:other" },
      uiDecision,
    ]);
    expect(result.ok).toBe(false);
  });

  it.each([
    [
      "append_order改変",
      (bundle: PlanScreenRouteCommitBundleV1) => ({
        ...bundle,
        append_order: ["prototype_task", "decision", "process_event", "projection"],
      }),
    ],
    [
      "write_set_digest改変",
      (bundle: PlanScreenRouteCommitBundleV1) => ({
        ...bundle,
        write_set_digest: "sha256:tampered",
      }),
    ],
    [
      "operation_digest改変",
      (bundle: PlanScreenRouteCommitBundleV1) => ({
        ...bundle,
        operation_digest: "sha256:tampered",
      }),
    ],
    [
      "plan aggregate digest改変",
      (bundle: PlanScreenRouteCommitBundleV1) => ({
        ...bundle,
        plan: { ...bundle.plan, decision_aggregate_digest: "sha256:tampered" },
      }),
    ],
    [
      "prototype task欠落",
      (bundle: PlanScreenRouteCommitBundleV1) => ({ ...bundle, prototype_tasks: [] }),
    ],
    [
      "no-UI capabilityへのtask混入",
      (bundle: PlanScreenRouteCommitBundleV1) => ({
        ...bundle,
        prototype_tasks: [
          ...bundle.prototype_tasks,
          {
            task_id: "task-a",
            capability_id: "cap-a",
            requirement_revision: 1,
            obligation_digest: "sha256:obligation",
            status: "planned" as const,
          },
        ],
      }),
    ],
  ])("commit固有mutation（%s）はport委譲0回でfail-close", async (_label, tamper) => {
    const { port, received } = makeFakePort();
    const result = await commitPlanScreenRoute(
      tamper(validBundle()) as PlanScreenRouteCommitBundleV1,
      port,
    );
    expect(result.ok).toBe(false);
    expect(received).toHaveLength(0);
  });

  it("空decision集合のaggregateはHIL_SCREEN_DECISION_MISSING", () => {
    const result = aggregatePlanScreenRoute(scope, []);
    expect(result.ok).toBe(false);
    if (!result.ok)
      expect(result.failures.map((f) => f.code)).toContain("HIL_SCREEN_DECISION_MISSING");
  });

  it("builderへのplan/scope snapshot不一致はfail-close", () => {
    const foreignScope = { ...scope, snapshot_id: "snap-other" };
    const result = buildPlanScreenRouteBundle(
      foreignScope,
      validAggregate(),
      [noUiDecision, uiDecision],
      [],
    );
    expect(result.ok).toBe(false);
  });

  it.each([
    [
      "plan.snapshot_idだけ差し替え（operation_digestは有効なまま）",
      (bundle: PlanScreenRouteCommitBundleV1) => ({
        ...bundle,
        plan: { ...bundle.plan, snapshot_id: "snap-other" },
      }),
    ],
    [
      "plan.snapshot_revisionだけ差し替え（operation_digestは有効なまま）",
      (bundle: PlanScreenRouteCommitBundleV1) => ({
        ...bundle,
        plan: { ...bundle.plan, snapshot_revision: 99 },
      }),
    ],
  ])("envelope偽装（%s）はplan_envelope_mismatchでport委譲0回", async (_label, tamper) => {
    const { port, received } = makeFakePort();
    const result = await commitPlanScreenRoute(
      tamper(validBundle()) as PlanScreenRouteCommitBundleV1,
      port,
    );
    expect(result.ok).toBe(false);
    expect(received).toHaveLength(0);
  });

  it("decisions配列の差し替え偽装（plan.decision_ids/aggregate digestは元のまま）はplan_decisions_mismatchでport委譲0回", async () => {
    const bundle = validBundle();
    const swapped = {
      ...bundle,
      decisions: [noUiDecision, { ...uiDecision, decision_digest: "sha256:decision-b-forged" }],
    };
    const { port, received } = makeFakePort();
    const result = await commitPlanScreenRoute(swapped, port);
    expect(result.ok).toBe(false);
    expect(received).toHaveLength(0);
  });

  it("port faultは透過し、receiptを発行しない", async () => {
    const { port, received } = makeFakePort(() => ({
      ok: false,
      failures: [{ code: "HIL_SCREEN_GATE_EVIDENCE_MISSING", evidence_digest: "sha256:fault" }],
    }));
    const result = await commitPlanScreenRoute(validBundle(), port);
    expect(result.ok).toBe(false);
    expect(received).toHaveLength(1);
    if (!result.ok)
      expect(result.failures.map((f) => f.code)).toContain("HIL_SCREEN_GATE_EVIDENCE_MISSING");
  });

  it.each([
    ["operation_id不一致", { operation_id: "op-other" }],
    ["gate_write_count非0", { gate_write_count: 1 }],
    ["route不一致", { route: "not_applicable" as const }],
  ])("port受領receiptのidentity改変（%s）はfail-close", async (_label, override) => {
    const { port } = makeFakePort((bundle) => ({
      ok: true,
      value: {
        plan_route_receipt_id: "plan-route-1",
        operation_id: bundle.operation_id,
        snapshot_id: bundle.snapshot_id,
        snapshot_revision: bundle.expected_snapshot_revision,
        capability_set_digest: bundle.capability_set_digest,
        decision_aggregate_digest: bundle.plan.decision_aggregate_digest,
        route: bundle.plan.route,
        prototype_task_set_digest: "sha256:task-set",
        stage_head: "sha256:stage-head",
        receipt_digest: "sha256:receipt",
        gate_write_count: 0,
        ...override,
      } as PlanScreenRouteReceiptV1,
    }));
    const result = await commitPlanScreenRoute(validBundle(), port);
    expect(result.ok).toBe(false);
  });

  it("二重委譲はしない（1回のcommit呼び出しでport呼び出しはexactly-one）", async () => {
    const { port, received } = makeFakePort();
    await commitPlanScreenRoute(validBundle(), port);
    expect(received).toHaveLength(1);
  });
});

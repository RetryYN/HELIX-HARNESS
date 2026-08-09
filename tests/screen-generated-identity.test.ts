// PLAN-L7-532-screen-generated-identity / U-SAPID-001（#175 申し送り「短縮 ID 衝突対策」）。
//
// screen 系が生成する identity（再判定 task_id / prototype task_id / plan route operation_id）は
// いずれも source digest から導出される。導出が digest を切り詰めると identity は単射でなくなり、
// 相異なる subject が同一 key を名乗り得る。実害は 2 つある:
//
//   1. operation_id 衝突は `duplicate_gate` として **正当な別 operation を fail-close で拒否**する
//      （src/design/screen-applicability-store.ts の committedOperations 判定）
//   2. task_id 衝突は write_set の key 衝突として commit を壊す
//
// sha256 の実衝突は作れないため、oracle は衝突事例ではなく **導出の単射性**を観測する:
// 生成 identity から source digest 全体を復元できる（= 切り詰めが無い）ことを固定する。
// 切り詰めを再導入すると復元に失敗して落ちる。
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import type {
  PlanScreenDecisionV1,
  ScreenDecisionV1,
  ScreenRequirementV1,
  ScreenScopeSnapshotV1,
} from "../src/design/screen-applicability";
import {
  aggregatePlanScreenRoute,
  buildPlanScreenRouteBundle,
  canonicalizeScreenScope,
  evaluateScreenReentry,
  type NoUiReceiptV1,
  planPrototypeDiscovery,
} from "../src/design/screen-applicability";

/** `sha256:` 接頭辞を落とした hex 本体。identity はこれを全長で埋め込まなければならない。 */
function hexBody(digest: string): string {
  expect(digest.startsWith("sha256:"), `digest 形式: ${digest}`).toBe(true);
  return digest.slice("sha256:".length);
}

function scopeSnapshot(overrides: { surface?: string } = {}) {
  const result = canonicalizeScreenScope(
    {
      snapshot_id: "snap-2",
      revision: 2,
      capability_ids: ["cap-noui"],
      phase: "L2",
      public_surface_digest: overrides.surface ?? "sha256:surface",
    },
    {
      policy_id: "policy-1",
      revision: 1,
      capability_ids: ["cap-noui", "cap-other"],
      rule_set_digest: "sha256:rule",
    },
  );
  if (!result.ok) throw new Error("fixture scope must canonicalize");
  return result.value;
}

const baselineScope = scopeSnapshot();

const priorReceipt: NoUiReceiptV1 = {
  receipt_id: "skip-1",
  decision_id: "dec-1",
  decision_revision: 3,
  capability_id: "cap-noui",
  capability_revision: 1,
  scope_digest: baselineScope.scope_digest,
  rule_digest: "sha256:rule",
  reason_code: "no_public_ui_surface",
  evidence_digest: "sha256:evidence",
  actor_id: "actor-1",
  reentry_trigger_digest: "sha256:trigger",
  issued_at: "2026-08-07T00:00:00Z",
  expires_at: "2026-09-07T00:00:00Z",
  receipt_digest: "sha256:receipt",
};

function uiDecision(overrides: Partial<ScreenDecisionV1> = {}): ScreenDecisionV1 {
  return {
    decision_id: "dec-a",
    decision_revision: 1,
    scope_digest: "sha256:scope",
    capability_id: "cap-a",
    phase: "L2",
    status: "current",
    route: "prototype_required",
    reason_code: "public_ui_surface",
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

function requirement(): ScreenRequirementV1 {
  return {
    requirement_id: "req-a",
    revision: 1,
    capability_id: "cap-a",
    screen_obligation_digest: "sha256:screen",
    interaction_obligation_digest: "sha256:interaction",
    state_obligation_digest: "sha256:state",
    data_obligation_digest: "sha256:data",
  };
}

const routeScope: ScreenScopeSnapshotV1 = {
  snapshot_id: "snap-1",
  revision: 3,
  capability_ids: ["cap-a"],
  phase: "L2",
  public_surface_digest: "sha256:surface",
  scope_digest: "sha256:scope",
};

function planAggregate(): PlanScreenDecisionV1 {
  const result = aggregatePlanScreenRoute(routeScope, [uiDecision()]);
  if (!result.ok) throw new Error("fixture aggregate must succeed");
  return result.value;
}

describe("生成 identity の単射性 (PLAN-L7-532)", () => {
  it("U-SAPID-001: 再判定 task / prototype task / plan route operation の identity は source digest を全長で埋め込む", () => {
    // 1. 再判定 task_id ← trigger_digest
    const reentry = evaluateScreenReentry(
      priorReceipt,
      scopeSnapshot({ surface: "sha256:s2" }),
      priorReceipt.rule_digest,
    );
    expect(reentry.ok, JSON.stringify(reentry).slice(0, 300)).toBe(true);
    if (!reentry.ok) return;
    expect(reentry.value.task_id).toBe(`screen-reentry-${hexBody(reentry.value.trigger_digest)}`);

    // 2. prototype task_id ← obligation_digest
    const task = planPrototypeDiscovery(uiDecision(), [requirement()]);
    expect(task.ok, JSON.stringify(task).slice(0, 300)).toBe(true);
    if (!task.ok) return;
    expect(task.value.task_id).toBe(`prototype-task-${hexBody(task.value.obligation_digest)}`);

    // 3. plan route operation_id ← decision_aggregate_digest
    const plan = planAggregate();
    const bundle = buildPlanScreenRouteBundle({
      scope: routeScope,
      plan,
      decisions: [uiDecision()],
      prototype_tasks: [task.value],
    });
    expect(bundle.ok, JSON.stringify(bundle).slice(0, 300)).toBe(true);
    if (!bundle.ok) return;
    expect(bundle.value.operation_id).toBe(`plan-route-${hexBody(plan.decision_aggregate_digest)}`);
  });

  // 上の 3 経路以外にも同 module は decision / walkthrough / agreement / backprop /
  // gate-candidate / screen-freeze の identity を生成する。それぞれの behavioral fixture は
  // 既存 suite 側にあり本書では再構築しないため、**再導入そのもの**を source 面で塞ぐ。
  // これは behavioral oracle の代用ではなく、未カバー分の backstop であることを明記する。
  it("U-SAPID-002: identity 生成で digest を切り詰める導出が module に 1 箇所も残らない", () => {
    const source = readFileSync(join(process.cwd(), "src/design/screen-applicability.ts"), "utf8");
    const truncations = source.match(/\.slice\(7,\s*\d+\)/gu) ?? [];
    expect(truncations, `切り詰め導出: ${truncations.join(", ")}`).toEqual([]);
    // fence 自体が空振りしていないこと（対象 module を実際に読めている）。
    expect(source).toContain("export function evaluateScreenReentry");
  });
});

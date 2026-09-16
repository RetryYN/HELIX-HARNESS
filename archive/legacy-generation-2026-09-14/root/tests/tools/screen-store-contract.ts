// PLAN-L7-513 / PLAN-L7-514 共有: ScreenApplicabilityStoreV1 契約 fixture と mutation suite。
// oracle-titled test（U-SAP-011 / U-SAPDB-001）は各 test file 側に置き、本 helper は
// store factory 差し替えで同一 mutation 集合を登録する（in-memory / SQLite の二重実装ドリフト防止）。
import { describe, expect, it } from "vitest";
import type {
  ScreenStageClosureCommitV1,
  ScreenStoreSeedV1,
} from "../../src/design/screen-applicability-store";
import { buildScreenStageClosureCommit } from "../../src/design/screen-applicability-store";

export interface ScreenStoreHandleV1 {
  commitStageClosureAndGate(
    bundle: ScreenStageClosureCommitV1,
  ): Promise<{ ok: boolean; value?: unknown }>;
  readPlanRouteReceipt(receiptId: string, expectedStageHead: string): Promise<{ ok: boolean }>;
  readSkipReceipt(receiptId: string, trustedNow: string): Promise<{ ok: boolean }>;
  readSkipAuthority(
    authorityReceiptId: string,
    expectedAuthorityHead: string,
    trustedNow: string,
  ): Promise<{ ok: boolean }>;
  readAgreementAuthority(query: {
    authority_receipt_id: string;
    expected_receipt_id: string;
    expected_receipt_digest: string;
    expected_authority_head: string;
    trusted_now: string;
  }): Promise<{ ok: boolean }>;
  readBackpropAuthority(query: {
    authority_receipt_id: string;
    expected_receipt_id: string;
    expected_receipt_digest: string;
    expected_authority_head: string;
    trusted_now: string;
  }): Promise<{ ok: boolean }>;
  committedGateReceiptCount(): number;
  stageHead(): string;
  gateHead(): string;
}

export type ScreenStoreFactoryV1 = (
  seed: ScreenStoreSeedV1,
  trustedNow: string,
) => ScreenStoreHandleV1;

export const NOW = "2026-08-07T00:00:00Z";

export function seed(): ScreenStoreSeedV1 {
  return {
    stage_head: "sha256:stage-head-1",
    gate_head: "sha256:gate-head-1",
    plan_route_receipts: [
      {
        plan_route_receipt_id: "plan-route-1",
        operation_id: "op-plan-route-1",
        snapshot_id: "snap-1",
        snapshot_revision: 3,
        capability_set_digest: "sha256:cap-set",
        decision_aggregate_digest: "sha256:aggregate",
        route: "prototype_required",
        prototype_task_set_digest: "sha256:task-set",
        stage_head: "sha256:stage-head-1",
        receipt_digest: "sha256:plan-route-receipt",
        gate_write_count: 0,
      },
    ],
    skip_receipts: [
      {
        receipt_id: "skip-1",
        decision_id: "dec-a",
        decision_revision: 1,
        capability_id: "cap-a",
        capability_revision: 1,
        scope_digest: "sha256:scope",
        rule_digest: "sha256:rule",
        reason_code: "no_public_ui_surface",
        evidence_digest: "sha256:evidence",
        actor_id: "actor-1",
        reentry_trigger_digest: "sha256:trigger",
        issued_at: "2026-08-01T00:00:00Z",
        expires_at: "2026-09-01T00:00:00Z",
        receipt_digest: "sha256:skip-receipt",
      },
    ],
    skip_authorities: [
      {
        authority_receipt_id: "skip-authority-1",
        skip_receipt_id: "skip-1",
        skip_receipt_digest: "sha256:skip-receipt",
        decision_id: "dec-a",
        decision_revision: 1,
        current_authority_head: "sha256:skip-authority-head",
        receipt_digest: "sha256:skip-authority-receipt",
      },
    ],
    agreement_authorities: [
      {
        authority_receipt_id: "agreement-authority-1",
        authority_receipt_digest: "sha256:agreement-authority-receipt",
        receipt: {
          agreement_id: "agreement-1",
          capability_id: "cap-b",
          artifact_revision: 2,
          walkthrough_set_digest: "sha256:walk-set",
          review_digest: "sha256:review",
          agreement_digest: "sha256:agreement",
        },
        canonical_bytes:
          '{"agreement_digest":"sha256:agreement","agreement_id":"agreement-1","artifact_revision":2,"capability_id":"cap-b","review_digest":"sha256:review","walkthrough_set_digest":"sha256:walk-set"}',
        current_authority_head: "sha256:agreement-authority-head",
        status: "current",
      },
    ],
    backprop_authorities: [
      {
        authority_receipt_id: "backprop-authority-1",
        authority_receipt_digest: "sha256:backprop-authority-receipt",
        receipt: {
          receipt_id: "backprop-1",
          agreement_id: "agreement-1",
          from_requirement_revision: 3,
          to_requirement_revision: 4,
          delta_disposition_digest: "sha256:disposition",
          receipt_digest: "sha256:backprop",
        },
        canonical_bytes:
          '{"agreement_id":"agreement-1","delta_disposition_digest":"sha256:disposition","from_requirement_revision":3,"receipt_digest":"sha256:backprop","receipt_id":"backprop-1","to_requirement_revision":4}',
        current_authority_head: "sha256:backprop-authority-head",
        status: "current",
      },
    ],
  };
}

export interface CommitOverridesV1 {
  denominator_capability_ids?: string[];
  ui_capability_ids?: string[];
  gate_overrides?: Record<string, unknown>;
  no_ui_overrides?: Record<string, unknown>;
  ui_overrides?: Record<string, unknown>;
  duplicate_no_ui?: boolean;
}

export function validCommit(
  operationId = "op-stage-closure-1",
  overrides: CommitOverridesV1 = {},
): ScreenStageClosureCommitV1 {
  const world = seed();
  const built = buildScreenStageClosureCommit({
    plan_route_receipt: world.plan_route_receipts[0],
    closure: {
      denominator_revision: 3,
      denominator_capability_ids: overrides.denominator_capability_ids ?? ["cap-a", "cap-b"],
      ui_capability_ids: overrides.ui_capability_ids ?? ["cap-b"],
      no_ui_completions: [
        {
          capability_id: "cap-a",
          capability_revision: 1,
          capability_digest: "sha256:cap-a",
          applicability_decision_id: "dec-a",
          applicability_decision_revision: 1,
          applicability_rule_id: "rule-1",
          applicability_rule_revision: 1,
          applicability_rule_digest: "sha256:rule",
          scope_digest: "sha256:scope",
          requirement_obligation_digest: "sha256:req-obligation",
          design_obligation_digest: "sha256:design-obligation",
          test_obligation_digest: "sha256:test-obligation",
          skip_receipt_id: "skip-1",
          skip_receipt_digest: "sha256:skip-receipt",
          authority_receipt_id: "skip-authority-1",
          authority_receipt_digest: "sha256:skip-authority-receipt",
          expected_authority_head: "sha256:skip-authority-head",
          issued_at: "2026-08-01T00:00:00Z",
          expires_at: "2026-09-01T00:00:00Z",
          reentry_trigger_digest: "sha256:trigger",
          ...overrides.no_ui_overrides,
        },
        ...(overrides.duplicate_no_ui
          ? [
              {
                capability_id: "cap-a",
                capability_revision: 1,
                capability_digest: "sha256:cap-a",
                applicability_decision_id: "dec-a",
                applicability_decision_revision: 1,
                applicability_rule_id: "rule-1",
                applicability_rule_revision: 1,
                applicability_rule_digest: "sha256:rule",
                scope_digest: "sha256:scope",
                requirement_obligation_digest: "sha256:req-obligation",
                design_obligation_digest: "sha256:design-obligation",
                test_obligation_digest: "sha256:test-obligation",
                skip_receipt_id: "skip-1",
                skip_receipt_digest: "sha256:skip-receipt",
                authority_receipt_id: "skip-authority-1",
                authority_receipt_digest: "sha256:skip-authority-receipt",
                expected_authority_head: "sha256:skip-authority-head",
                issued_at: "2026-08-01T00:00:00Z",
                expires_at: "2026-09-01T00:00:00Z",
                reentry_trigger_digest: "sha256:trigger",
              },
            ]
          : []),
      ],
      ui_completions: [
        {
          capability_id: "cap-b",
          agreement_receipt_id: "agreement-1",
          agreement_receipt_digest: "sha256:agreement",
          agreement_authority_receipt_id: "agreement-authority-1",
          agreement_authority_receipt_digest: "sha256:agreement-authority-receipt",
          expected_agreement_authority_head: "sha256:agreement-authority-head",
          backprop_receipt_id: "backprop-1",
          backprop_receipt_digest: "sha256:backprop",
          backprop_authority_receipt_id: "backprop-authority-1",
          backprop_authority_receipt_digest: "sha256:backprop-authority-receipt",
          expected_backprop_authority_head: "sha256:backprop-authority-head",
          from_requirement_revision: 3,
          to_requirement_revision: 4,
          completion_digest: "sha256:ui-completion",
          ...overrides.ui_overrides,
        },
      ],
    },
    gate: {
      gate_receipt_id: "gate-candidate-1",
      operation_id: operationId,
      operation_digest: "",
      commit_receipt_digest: "",
      before_revision: 0,
      after_revision: 0,
      event_head: "",
      snapshot_id: "snap-1",
      snapshot_revision: 3,
      capability_set_digest: "sha256:cap-set",
      decision_aggregate_digest: "sha256:aggregate",
      route: "prototype_required",
      skip_digest: "sha256:skip-receipt",
      agreement_digest: "sha256:agreement",
      l1_revision: 4,
      verdict: "passed",
      failure_codes: [],
      ...overrides.gate_overrides,
    },
    expected_stage_head: "sha256:stage-head-1",
    expected_gate_head: "sha256:gate-head-1",
  });
  if (!built.ok) throw new Error("fixture commit must build");
  return built.value;
}

export function registerScreenStoreContractSuite(
  suiteName: string,
  makeStore: ScreenStoreFactoryV1,
): void {
  const createStore = (world: ScreenStoreSeedV1 = seed(), now: string = NOW) =>
    makeStore(world, now);
  describe(`ScreenApplicabilityStoreV1 contract (${suiteName})`, () => {
    it("同operationの二重gateは拒否し増分0", async () => {
      const store = createStore();
      const first = await store.commitStageClosureAndGate(validCommit());
      expect(first.ok).toBe(true);
      const second = await store.commitStageClosureAndGate(validCommit());
      expect(second.ok).toBe(false);
      expect(store.committedGateReceiptCount()).toBe(1);
    });

    it.each([
      [
        "expected_stage_head改変（operation_digest経由で捕捉）",
        (c: ScreenStageClosureCommitV1) => ({ ...c, expected_stage_head: "sha256:other" }),
      ],
      [
        "expected_gate_head改変（operation_digest経由で捕捉）",
        (c: ScreenStageClosureCommitV1) => ({ ...c, expected_gate_head: "sha256:other" }),
      ],
      [
        "append順逆転",
        (c: ScreenStageClosureCommitV1) => ({
          ...c,
          append_order: [
            "gate_receipt",
            "stage_completion",
            "stage_projection",
            "terminal_receipt",
          ],
        }),
      ],
      [
        "write_set_digest改変",
        (c: ScreenStageClosureCommitV1) => ({ ...c, write_set_digest: "sha256:tampered" }),
      ],
      [
        "operation_digest改変",
        (c: ScreenStageClosureCommitV1) => ({ ...c, operation_digest: "sha256:tampered" }),
      ],
      [
        "plan route receipt swap（未登録receipt）",
        (c: ScreenStageClosureCommitV1) => ({
          ...c,
          plan_route_receipt: { ...c.plan_route_receipt, receipt_digest: "sha256:forged" },
        }),
      ],
      [
        "分母欠落（cap-b無し）",
        (c: ScreenStageClosureCommitV1) => ({
          ...c,
          closure: { ...c.closure, denominator_capability_ids: ["cap-a"] },
        }),
      ],
      [
        "分母余剰（scope外cap-c）",
        (c: ScreenStageClosureCommitV1) => ({
          ...c,
          closure: {
            ...c.closure,
            denominator_capability_ids: ["cap-a", "cap-b", "cap-c"],
          },
        }),
      ],
      [
        "UI/no-UI重複（cap-aを両側に）",
        (c: ScreenStageClosureCommitV1) => ({
          ...c,
          closure: { ...c.closure, ui_capability_ids: ["cap-a", "cap-b"] },
        }),
      ],
      [
        "skip authority swap（authority receipt digest改変）",
        (c: ScreenStageClosureCommitV1) => ({
          ...c,
          closure: {
            ...c.closure,
            no_ui_completions: [
              { ...c.closure.no_ui_completions[0], authority_receipt_digest: "sha256:forged" },
            ],
          },
        }),
      ],
      [
        "no-UI三者identity不一致（decision revision改変）",
        (c: ScreenStageClosureCommitV1) => ({
          ...c,
          closure: {
            ...c.closure,
            no_ui_completions: [
              { ...c.closure.no_ui_completions[0], applicability_decision_revision: 2 },
            ],
          },
        }),
      ],
      [
        "agreement authority head不一致",
        (c: ScreenStageClosureCommitV1) => ({
          ...c,
          closure: {
            ...c.closure,
            ui_completions: [
              {
                ...c.closure.ui_completions[0],
                expected_agreement_authority_head: "sha256:other",
              },
            ],
          },
        }),
      ],
      [
        "backprop receipt digest swap",
        (c: ScreenStageClosureCommitV1) => ({
          ...c,
          closure: {
            ...c.closure,
            ui_completions: [
              { ...c.closure.ui_completions[0], backprop_receipt_digest: "sha256:forged" },
            ],
          },
        }),
      ],
      [
        "requirement revision連鎖不整合",
        (c: ScreenStageClosureCommitV1) => ({
          ...c,
          closure: {
            ...c.closure,
            ui_completions: [{ ...c.closure.ui_completions[0], from_requirement_revision: 2 }],
          },
        }),
      ],
    ])("%s はstage/gate増分0", async (_label, tamper) => {
      const store = createStore();
      const result = await store.commitStageClosureAndGate(
        tamper(validCommit()) as ScreenStageClosureCommitV1,
      );
      expect(result.ok).toBe(false);
      expect(store.committedGateReceiptCount()).toBe(0);
      expect(store.stageHead()).toBe("sha256:stage-head-1");
      expect(store.gateHead()).toBe("sha256:gate-head-1");
    });

    it.each([
      ["gate verdict偽装（failed）", { gate_overrides: { verdict: "failed" as const } }],
      ["gate snapshot_id差し替え", { gate_overrides: { snapshot_id: "snap-other" } }],
      ["gate route差し替え", { gate_overrides: { route: "not_applicable" as const } }],
      [
        "gate capability_set_digest差し替え",
        { gate_overrides: { capability_set_digest: "sha256:other" } },
      ],
      [
        "gate decision_aggregate_digest差し替え",
        { gate_overrides: { decision_aggregate_digest: "sha256:other" } },
      ],
    ])(
      "build時点からのgate内容偽装（%s）はgate_content_mismatchで増分0",
      async (_label, overrides) => {
        const store = createStore();
        const result = await store.commitStageClosureAndGate(
          validCommit("op-stage-closure-1", overrides as CommitOverridesV1),
        );
        expect(result.ok).toBe(false);
        expect(store.committedGateReceiptCount()).toBe(0);
      },
    );

    it.each([
      ["分母欠落（cap-b無し）", { denominator_capability_ids: ["cap-a"] }],
      ["分母余剰（scope外cap-c）", { denominator_capability_ids: ["cap-a", "cap-b", "cap-c"] }],
      ["UI/no-UI重複（cap-aを両側に）", { ui_capability_ids: ["cap-a", "cap-b"] }],
      ["同一capabilityの重複completion", { duplicate_no_ui: true }],
    ])("build時点からの分母不整合（%s）は増分0", async (_label, overrides) => {
      const store = createStore();
      const result = await store.commitStageClosureAndGate(
        validCommit("op-stage-closure-1", overrides as CommitOverridesV1),
      );
      expect(result.ok).toBe(false);
      expect(store.committedGateReceiptCount()).toBe(0);
    });

    it("store登録済みplan routeとのreceipt digest不一致（seed側差し替え）はplan_route_swapで増分0", async () => {
      const world = seed();
      world.plan_route_receipts[0] = {
        ...world.plan_route_receipts[0],
        receipt_digest: "sha256:plan-route-receipt-2",
      };
      const store = createStore(world);
      const result = await store.commitStageClosureAndGate(validCommit());
      expect(result.ok).toBe(false);
      expect(store.committedGateReceiptCount()).toBe(0);
    });

    it.each([
      [
        "agreement authority receipt digest swap（head正・digest偽）",
        { ui_overrides: { agreement_authority_receipt_digest: "sha256:forged" } },
      ],
      [
        "backprop authority receipt digest swap（head正・digest偽）",
        { ui_overrides: { backprop_authority_receipt_digest: "sha256:forged" } },
      ],
      [
        "no-UI skip authorityのexpected head不一致",
        { no_ui_overrides: { expected_authority_head: "sha256:other" } },
      ],
      [
        "no-UI skip authority receipt digest swap",
        { no_ui_overrides: { authority_receipt_digest: "sha256:forged" } },
      ],
    ])("authority swap（%s）は増分0", async (_label, overrides) => {
      const store = createStore();
      const result = await store.commitStageClosureAndGate(
        validCommit("op-stage-closure-1", overrides as CommitOverridesV1),
      );
      expect(result.ok).toBe(false);
      expect(store.committedGateReceiptCount()).toBe(0);
    });

    it("agreement受領receiptのcapability不一致（seed側差し替え）はui_capability_swapで増分0", async () => {
      const world = seed();
      const forgedReceipt = { ...world.agreement_authorities[0].receipt, capability_id: "cap-x" };
      world.agreement_authorities[0] = {
        ...world.agreement_authorities[0],
        receipt: forgedReceipt,
        canonical_bytes: JSON.stringify(
          Object.fromEntries(Object.entries(forgedReceipt).sort(([a], [b]) => a.localeCompare(b))),
        ),
      };
      const store = createStore(world);
      const result = await store.commitStageClosureAndGate(validCommit());
      expect(result.ok).toBe(false);
      expect(store.committedGateReceiptCount()).toBe(0);
    });

    it("read系APIの未登録IDはfail-close（planRoute/skip/skipAuthority）", async () => {
      const store = createStore();
      expect((await store.readPlanRouteReceipt("missing", "sha256:stage-head-1")).ok).toBe(false);
      expect((await store.readSkipReceipt("missing", NOW)).ok).toBe(false);
      expect((await store.readSkipReceipt("skip-1", NOW)).ok).toBe(true);
      expect((await store.readSkipAuthority("missing", "sha256:skip-authority-head", NOW)).ok).toBe(
        false,
      );
      expect((await store.readSkipAuthority("skip-authority-1", "sha256:other", NOW)).ok).toBe(
        false,
      );
      expect(
        (
          await store.readAgreementAuthority({
            authority_receipt_id: "missing",
            expected_receipt_id: "agreement-1",
            expected_receipt_digest: "sha256:agreement",
            expected_authority_head: "sha256:agreement-authority-head",
            trusted_now: NOW,
          })
        ).ok,
      ).toBe(false);
      expect(
        (
          await store.readBackpropAuthority({
            authority_receipt_id: "missing",
            expected_receipt_id: "backprop-1",
            expected_receipt_digest: "sha256:backprop",
            expected_authority_head: "sha256:backprop-authority-head",
            trusted_now: NOW,
          })
        ).ok,
      ).toBe(false);
    });

    it("skip receiptのfreshness超過（expires_at <= trustedNow）はstage/gate増分0", async () => {
      const store = createStore(seed(), "2026-09-02T00:00:00Z");
      const result = await store.commitStageClosureAndGate(validCommit());
      expect(result.ok).toBe(false);
      expect(store.committedGateReceiptCount()).toBe(0);
    });

    it("stale化したagreement authorityではcommitできない", async () => {
      const world = seed();
      world.agreement_authorities[0] = {
        ...world.agreement_authorities[0],
        status: "current",
        current_authority_head: "sha256:agreement-authority-head-2",
      };
      const store = createStore(world);
      const result = await store.commitStageClosureAndGate(validCommit());
      expect(result.ok).toBe(false);
      expect(store.committedGateReceiptCount()).toBe(0);
    });

    it("read系APIはexpected head不一致をfail-closeする", async () => {
      const store = createStore();
      const ok = await store.readPlanRouteReceipt("plan-route-1", "sha256:stage-head-1");
      expect(ok.ok).toBe(true);
      const bad = await store.readPlanRouteReceipt("plan-route-1", "sha256:other");
      expect(bad.ok).toBe(false);
      const staleSkip = await store.readSkipReceipt("skip-1", "2026-09-02T00:00:00Z");
      expect(staleSkip.ok).toBe(false);
    });

    it("成功commit後のhead前進により、旧headを前提とした再commitはCASで拒否される", async () => {
      const store = createStore();
      const first = await store.commitStageClosureAndGate(validCommit());
      expect(first.ok).toBe(true);
      const replay = validCommit("op-stage-closure-2");
      const result = await store.commitStageClosureAndGate(replay);
      expect(result.ok).toBe(false);
      expect(store.committedGateReceiptCount()).toBe(1);
    });
  });
}

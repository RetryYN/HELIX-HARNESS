import { describe, expect, it } from "vitest";
import {
  buildScreenIntake,
  type ScreenLedgerRowV1,
  type ScreenTraceRowV1,
} from "../src/design/design-registry-screen-intake";
import type { RequirementCatalogV1 } from "../src/design/requirement-catalog";

/**
 * PLAN-L7-537-catalog-intake / HR-FR-DHR-008・009
 * — requirement catalog を screen intake へ明示注入し、edge 採用条件を
 *   「family 一致」から「catalog 実在 + kind exact match + provenance 束縛」へ切り替える。
 *
 * D-1（PO 承認 2026-08-10）の実装第 2 スライス。catalog は PLAN-L7-536 が供給する。
 */

const SCREENS: ScreenLedgerRowV1[] = [
  { screen_id: "PM-01", name: "俯瞰", l1_ref: "screen §1.PM.01", status: "not-implemented" },
];

function trace(requirementId: string, requirementKind: string): ScreenTraceRowV1 {
  return {
    screen_trace_id: `screen-trace:PM-01:${requirementId}`,
    screen_id: "PM-01",
    requirement_id: requirementId,
    requirement_kind: requirementKind,
    relation: "trace",
    source: "screen-requirements §5.5",
  };
}

function catalog(
  entries: { requirement_id: string; requirement_kind: "br" | "ux" | "fr" }[],
  overrides: Partial<Pick<RequirementCatalogV1, "catalog_version" | "source_digest">> = {},
): RequirementCatalogV1 {
  return {
    entries: entries.map((e) => ({
      ...e,
      source_pointer: `business-requirements:${e.requirement_id}`,
    })),
    catalog_version: overrides.catalog_version ?? `sha256:${"a".repeat(64)}`,
    source_digest: overrides.source_digest ?? `sha256:${"b".repeat(64)}`,
  };
}

function unwrap<T>(result: { ok: true; value: T } | { ok: false; failures: unknown }): T {
  if (!result.ok) throw new Error(`expected ok: ${JSON.stringify(result.failures)}`);
  return result.value;
}

const BR01 = { requirement_id: "BR-01", requirement_kind: "br" } as const;
const UX02 = { requirement_id: "UX-02", requirement_kind: "ux" } as const;

describe("screen intake with injected requirement catalog (PLAN-L7-537)", () => {
  it("U-DRG-014: catalog 実在と kind 一致だけを edge 化し、provenance を intake_digest へ束縛する", () => {
    const intake = unwrap(
      buildScreenIntake({
        screens: SCREENS,
        traces: [trace("BR-01", "br"), trace("UX-02", "ux")],
        catalog: catalog([BR01, UX02]),
      }),
    );

    // D-1: L1 の原 ID が再採番されずそのまま edge 端点になる。
    expect(intake.trace_edges.map((edge) => edge.from_entity_id)).toEqual(["BR-01", "UX-02"]);
    expect(intake.unmapped_requirements).toEqual([]);
    expect(intake.trace_intake_complete).toBe(true);
    // registry 既存 family（VDH-FR-*）は catalog を経由せず従来どおり通る（後方互換）。
    const mixed = unwrap(
      buildScreenIntake({
        screens: SCREENS,
        traces: [trace("VDH-FR-001", "fr"), trace("BR-01", "br")],
        catalog: catalog([BR01]),
      }),
    );
    expect(mixed.trace_edges.map((edge) => edge.from_entity_id)).toEqual(["BR-01", "VDH-FR-001"]);

    // provenance: catalog が変われば同じ台帳でも intake_digest が変わる（stale green 防止）。
    const other = unwrap(
      buildScreenIntake({
        screens: SCREENS,
        traces: [trace("BR-01", "br"), trace("UX-02", "ux")],
        catalog: catalog([BR01, UX02], { source_digest: `sha256:${"c".repeat(64)}` }),
      }),
    );
    expect(other.trace_edges.map((e) => e.edge_id)).toEqual(
      intake.trace_edges.map((e) => e.edge_id),
    );
    expect(other.intake_digest).not.toBe(intake.intake_digest);

    const versioned = unwrap(
      buildScreenIntake({
        screens: SCREENS,
        traces: [trace("BR-01", "br"), trace("UX-02", "ux")],
        catalog: catalog([BR01, UX02], { catalog_version: `sha256:${"d".repeat(64)}` }),
      }),
    );
    expect(versioned.intake_digest).not.toBe(intake.intake_digest);
  });

  it("U-DRG-014b: catalog 不在の ID は edge を捏造せず requirement_not_in_catalog へ落とす", () => {
    // regex を広げる実装だと `BR-99` が有効な edge 端点になり trace を捏造できる。
    const intake = unwrap(
      buildScreenIntake({
        screens: SCREENS,
        traces: [trace("BR-99", "br"), trace("BR-01", "br")],
        catalog: catalog([BR01]),
      }),
    );
    expect(intake.trace_edges.map((edge) => edge.from_entity_id)).toEqual(["BR-01"]);
    expect(intake.unmapped_requirements).toEqual([
      {
        screen_id: "PM-01",
        requirement_id: "BR-99",
        requirement_kind: "br",
        reason: "requirement_not_in_catalog",
      },
    ]);
    expect(intake.trace_intake_complete).toBe(false);
  });

  it("U-DRG-014c: kind が catalog と一致しない trace は kind spoofing として別 reason で落とす", () => {
    // 実在 ID を借りて別 kind を名乗る経路を塞ぐ。存在確認だけでは通ってしまう。
    const intake = unwrap(
      buildScreenIntake({
        screens: SCREENS,
        traces: [trace("BR-01", "ux")],
        catalog: catalog([BR01]),
      }),
    );
    expect(intake.trace_edges).toEqual([]);
    expect(intake.unmapped_requirements.map((entry) => entry.reason)).toEqual([
      "requirement_kind_mismatch",
    ]);
  });

  it("U-DRG-014d: 空 catalog を「全件不存在」として静かに成立させない", () => {
    // 空 catalog は「実在しないので unmapped」に見えるが、実体は供給側の欠落である。
    // 両者を同じ green（ok:true で unmapped 列挙）に潰すと、catalog を空にするだけで
    // fail-close を装えてしまう（L3 §3「誤って green になる経路」）。
    const result = buildScreenIntake({
      screens: SCREENS,
      traces: [trace("BR-01", "br")],
      catalog: catalog([]),
    });
    expect(result.ok).toBe(false);
    expect(result.ok ? [] : result.failures.map((f) => f.code)).toEqual(["DRG_STALE_INPUT"]);
  });

  it("U-DRG-014e: catalog の provenance 欠落を受理しない", () => {
    // digest が空の catalog を受け取ると intake_digest への束縛が無意味になる。
    for (const broken of [
      catalog([BR01], { catalog_version: "" }),
      catalog([BR01], { source_digest: "" }),
    ]) {
      const result = buildScreenIntake({
        screens: SCREENS,
        traces: [trace("BR-01", "br")],
        catalog: broken,
      });
      expect(result.ok).toBe(false);
      expect(result.ok ? [] : result.failures.map((f) => f.code)).toEqual(["DRG_STALE_INPUT"]);
    }
  });
});

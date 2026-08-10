import { describe, expect, it } from "vitest";
import {
  isRegistryNativeRequirementId,
  isRegistryRequirementId,
  validateRegistryGraph,
} from "../src/design/design-registry";
import {
  buildScreenIntake,
  type ScreenLedgerRowV1,
  type ScreenTraceRowV1,
} from "../src/design/design-registry-screen-intake";
import type { RequirementCatalogV1 } from "../src/design/requirement-catalog";

/**
 * PLAN-L7-538-requirement-endpoint / HR-FR-DHR-011
 * — trace edge の requirement 端点が graph に node として実在することを保証する。
 *
 * PLAN-L7-537 までは edge だけが作られ、`BR-01` の requirement node が存在しなかったため
 * intake 出力単体では `validateRegistryGraph` を通せなかった（端点が orphan）。
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

const CATALOG: RequirementCatalogV1 = {
  entries: [
    {
      requirement_id: "BR-01",
      requirement_kind: "br",
      source_pointer: "business-requirements:BR-01",
    },
    {
      requirement_id: "UX-02",
      requirement_kind: "ux",
      source_pointer: "business-requirements:UX-02",
    },
  ],
  catalog_version: `sha256:${"a".repeat(64)}`,
  source_digest: `sha256:${"b".repeat(64)}`,
};

function unwrap<T>(result: { ok: true; value: T } | { ok: false; failures: unknown }): T {
  if (!result.ok) throw new Error(`expected ok: ${JSON.stringify(result.failures)}`);
  return result.value;
}

describe("requirement endpoint existence (PLAN-L7-538)", () => {
  it("U-DRG-015: 採用した catalog ID を requirement node として投入し端点 orphan を 0 にする", () => {
    const intake = unwrap(
      buildScreenIntake({
        screens: SCREENS,
        traces: [trace("BR-01", "br"), trace("UX-02", "ux")],
        catalog: CATALOG,
      }),
    );

    // 採用した ID だけが requirement node になる（catalog 全件を投入しない）。
    const requirements = intake.nodes.filter((node) => node.kind === "requirement");
    expect(requirements.map((node) => node.entity_id)).toEqual(["BR-01", "UX-02"]);
    for (const node of requirements) {
      expect(node.authority).toBe("shadow");
      // 出所は catalog の source_pointer をそのまま持つ（L1 定義行への復元経路）。
      expect(node.source_pointer).toBe(`business-requirements:${node.entity_id}`);
    }

    // 端点実在: intake 出力単体で graph 検証を通る（orphan 0）。
    const validated = validateRegistryGraph({
      schema_version: "design-registry-declaration.v1",
      nodes: intake.nodes,
      edges: intake.trace_edges,
      declaration_digest: intake.intake_digest,
    });
    expect(validated.ok).toBe(true);

    // requirement node を落とすと端点 orphan として fail-close する（検証が効いている担保）。
    const withoutRequirements = validateRegistryGraph({
      schema_version: "design-registry-declaration.v1",
      nodes: intake.nodes.filter((node) => node.kind !== "requirement"),
      edges: intake.trace_edges,
      declaration_digest: intake.intake_digest,
    });
    expect(withoutRequirements.ok).toBe(false);
    expect(withoutRequirements.ok ? [] : withoutRequirements.failures.map((f) => f.code)).toContain(
      "DRG_EDGE_ORPHAN",
    );
  });

  it("U-DRG-015b: grammar の拡張が catalog gate を迂回させない", () => {
    // D-1 により L1 family は registry の requirement grammar として認識する（node を作れる）。
    expect(isRegistryRequirementId("BR-01")).toBe(true);
    expect(isRegistryRequirementId("UX-02")).toBe(true);
    expect(isRegistryRequirementId("FR-L1-01")).toBe(true);
    expect(isRegistryRequirementId("VDH-FR-001")).toBe(true);

    // ただし intake の「catalog を経由しない」bypass は registry 固有 family だけに限る。
    // grammar 側を広げた結果 bypass まで広がると、catalog に無い BR-99 が素通りして
    // trace を捏造できてしまう（本 slice で最も守るべき境界）。
    expect(isRegistryNativeRequirementId("VDH-FR-001")).toBe(true);
    expect(isRegistryNativeRequirementId("HIL-BR-01")).toBe(true);
    expect(isRegistryNativeRequirementId("BR-01")).toBe(false);
    expect(isRegistryNativeRequirementId("FR-L1-01")).toBe(false);

    const intake = unwrap(
      buildScreenIntake({
        screens: SCREENS,
        traces: [trace("BR-99", "br")],
        catalog: CATALOG,
      }),
    );
    expect(intake.trace_edges).toEqual([]);
    expect(intake.nodes.filter((node) => node.kind === "requirement")).toEqual([]);
    expect(intake.unmapped_requirements.map((entry) => entry.reason)).toEqual([
      "requirement_not_in_catalog",
    ]);
  });

  it("U-DRG-015c: 未採用の catalog ID を node として投入しない", () => {
    // catalog 全件を node 化すると、どの screen からも参照されていない requirement が
    // graph へ流れ込む。投入は「実際に edge 化した ID」に限る。
    const intake = unwrap(
      buildScreenIntake({
        screens: SCREENS,
        traces: [trace("BR-01", "br")],
        catalog: CATALOG,
      }),
    );
    expect(intake.nodes.map((node) => node.entity_id)).toEqual(["BR-01", "SCR-pm-01"]);
    expect(intake.nodes.some((node) => node.entity_id === "UX-02")).toBe(false);
  });
});

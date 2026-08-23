import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { validateRegistryGraph } from "../src/design/design-registry";
import {
  assertScreenIntakeComplete,
  buildScreenIntake,
  canonicalizeScreenEntityId,
  loadScreenIntakeInputs,
  type ScreenLedgerRowV1,
  type ScreenTraceRowV1,
} from "../src/design/design-registry-screen-intake";
import { ensureDesignRegistryTables } from "../src/design/design-registry-sqlite-store";
import { createTableSql } from "../src/schema/harness-db";
import { HARNESS_DB_EVALUATION_TABLES } from "../src/schema/harness-db-tables-evaluation";
import { openHarnessDb } from "../src/state-db";

// PLAN-L7-529-design-registry-screen-intake: Design Registry slice6。
// L8テスト設計 U-DRG-012 行を機械検査する。
// L5 §1「screen ノードは screens/screen_trace を正本供給源として吸収し、別の screen 台帳を新設しない」の着地。

const SCREENS: ScreenLedgerRowV1[] = [
  {
    screen_id: "PM-01",
    name: "プロジェクト俯瞰",
    l1_ref: "screen §1.PM.01",
    status: "not-implemented",
  },
  { screen_id: "PM-02", name: "工程ビュー", l1_ref: "screen §1.PM.02", status: "not-implemented" },
];

const TRACES: ScreenTraceRowV1[] = [
  {
    screen_trace_id: "screen-trace:PM-01:VDH-FR-001",
    screen_id: "PM-01",
    requirement_id: "VDH-FR-001",
    requirement_kind: "fr",
    relation: "trace",
    source: "screen-requirements §5.5",
  },
  {
    screen_trace_id: "screen-trace:PM-01:BR-01",
    screen_id: "PM-01",
    requirement_id: "BR-01",
    requirement_kind: "br",
    relation: "trace",
    source: "screen-requirements §5.5",
  },
];

/** 既存 oracle は L1 catalog を使わない（VDH-FR-* のみ）。供給欠落 fail-close を避ける最小 catalog。 */
const EMPTY_L1_CATALOG = {
  entries: [
    {
      requirement_id: "BR-02",
      requirement_kind: "br" as const,
      source_pointer: "business-requirements:BR-02",
    },
  ],
  catalog_version: `sha256:${"e".repeat(64)}`,
  source_digest: `sha256:${"f".repeat(64)}`,
};

function codesOf(result: { ok: boolean; failures?: readonly { code: string }[] }): string[] {
  return result.ok ? [] : (result.failures ?? []).map((failure) => failure.code);
}

function unwrap<T>(result: { ok: true; value: T } | { ok: false; failures: unknown }): T {
  if (!result.ok) throw new Error(`expected ok: ${JSON.stringify(result.failures)}`);
  return result.value;
}

describe("design-registry screen intake (PLAN-L7-529)", () => {
  it("U-DRG-012: screens台帳からSCRノードを決定的にintakeし、未登録要求familyをfail-closeで列挙する", () => {
    // ID 採番: 元 screen_id は source_pointer に保持し、台帳を複製しない
    expect(canonicalizeScreenEntityId("PM-01")).toBe("SCR-pm-01");
    expect(canonicalizeScreenEntityId("  ")).toBeNull();
    expect(canonicalizeScreenEntityId("PM_01")).toBeNull();

    const intake = unwrap(
      buildScreenIntake({ catalog: EMPTY_L1_CATALOG, screens: SCREENS, traces: TRACES }),
    );
    // PLAN-L7-538 以降、edge 化した requirement も端点として node 投入される（orphan 0 の担保）。
    expect(intake.nodes.map((node) => node.entity_id)).toEqual([
      "SCR-pm-01",
      "SCR-pm-02",
      "VDH-FR-001",
    ]);
    const screenNodes = intake.nodes.filter((node) => node.kind === "screen");
    expect(screenNodes.map((node) => node.entity_id)).toEqual(["SCR-pm-01", "SCR-pm-02"]);
    for (const node of screenNodes) {
      expect(node.kind).toBe("screen");
      expect(node.authority).toBe("shadow");
      expect(node.revision).toBe(1);
      expect(node.source_pointer).toContain("screens:");
    }
    // 元 ID の復元可能性（台帳の複製新設をしない条件）
    expect(intake.nodes[0]?.source_pointer).toBe("screens:PM-01");

    // 登録済み family の trace は decomposes_to edge（requirement → screen）になる
    expect(intake.trace_edges.map((edge) => edge.edge_id)).toEqual([
      "decomposes_to:VDH-FR-001->SCR-pm-01",
    ]);

    // 未登録 family（BR/FR-L1/UX 等）は edge を捏造せず **全件列挙** して未完了を宣言する
    expect(intake.trace_intake_complete).toBe(false);
    expect(intake.unmapped_requirements).toEqual([
      {
        screen_id: "PM-01",
        requirement_id: "BR-01",
        requirement_kind: "br",
        reason: "requirement_not_in_catalog",
      },
    ]);
    // 未完了 intake を「静かな green」として通さない consumer 用 gate
    expect(codesOf(assertScreenIntakeComplete(intake))).toContain("DRG_ID_INVALID");

    // 決定性: 同義入力（順序違い）は同一 intake_digest
    const shuffled = unwrap(
      buildScreenIntake({
        catalog: EMPTY_L1_CATALOG,
        screens: [...SCREENS].reverse(),
        traces: [...TRACES].reverse(),
      }),
    );
    expect(shuffled.intake_digest).toBe(intake.intake_digest);

    // 生成ノードは registry validator を通過する（別 schema を作っていないことの担保）
    const graph = validateRegistryGraph({
      schema_version: "design-registry-declaration.v1",
      nodes: intake.nodes,
      edges: [],
      declaration_digest: intake.intake_digest,
    });
    expect(graph.ok, JSON.stringify(graph)).toBe(true);

    // 完備ケース: 未登録 family が無ければ complete かつ gate は通過
    const complete = unwrap(
      buildScreenIntake({
        catalog: EMPTY_L1_CATALOG,
        screens: SCREENS,
        traces: [TRACES[0] as ScreenTraceRowV1],
      }),
    );
    expect(complete.trace_intake_complete).toBe(true);
    expect(assertScreenIntakeComplete(complete).ok).toBe(true);

    // 反例1: screen_id 重複は DRG_DUPLICATE_ID
    expect(
      codesOf(
        buildScreenIntake({
          catalog: EMPTY_L1_CATALOG,
          screens: [...SCREENS, SCREENS[0] as ScreenLedgerRowV1],
          traces: [],
        }),
      ),
    ).toContain("DRG_DUPLICATE_ID");

    // 反例2: 正準化できない screen_id は DRG_ID_INVALID
    expect(
      codesOf(
        buildScreenIntake({
          catalog: EMPTY_L1_CATALOG,
          screens: [{ ...(SCREENS[0] as ScreenLedgerRowV1), screen_id: "PM_01" }],
          traces: [],
        }),
      ),
    ).toContain("DRG_ID_INVALID");

    // 反例3: 台帳に無い screen を指す trace は DRG_EDGE_ORPHAN
    expect(
      codesOf(
        buildScreenIntake({
          catalog: EMPTY_L1_CATALOG,
          screens: SCREENS,
          traces: [{ ...(TRACES[0] as ScreenTraceRowV1), screen_id: "ZZ-99" }],
        }),
      ),
    ).toContain("DRG_EDGE_ORPHAN");

    // 反例4: 空台帳は静かな green を許さず DRG_STALE_INPUT
    expect(
      codesOf(buildScreenIntake({ catalog: EMPTY_L1_CATALOG, screens: [], traces: [] })),
    ).toContain("DRG_STALE_INPUT");

    // 反例5: 同一 (requirement, screen) 対の trace 二重登録は DRG_DUPLICATE_ID
    // （edge_id が衝突する。silent に重複 edge を返さない）
    expect(
      codesOf(
        buildScreenIntake({
          catalog: EMPTY_L1_CATALOG,
          screens: SCREENS,
          traces: [
            TRACES[0] as ScreenTraceRowV1,
            {
              ...(TRACES[0] as ScreenTraceRowV1),
              screen_trace_id: "screen-trace:PM-01:VDH-FR-001:dup",
              source: "別 doc からの二重登録",
            },
          ],
        }),
      ),
    ).toContain("DRG_DUPLICATE_ID");

    // 反例6: 大文字小文字違いの screen_id は同一 SCR- id へ畳まれるため DRG_DUPLICATE_ID
    // （採番が畳む以上、衝突判定も畳んだ後の値で行う）
    expect(
      codesOf(
        buildScreenIntake({
          catalog: EMPTY_L1_CATALOG,
          screens: [
            SCREENS[0] as ScreenLedgerRowV1,
            { ...(SCREENS[0] as ScreenLedgerRowV1), screen_id: "pm-01" },
          ],
          traces: [],
        }),
      ),
    ).toContain("DRG_DUPLICATE_ID");

    // 反例7: 未知 relation は edge を作らず unmapped として列挙する（捏造しない）
    const unknownRelation = unwrap(
      buildScreenIntake({
        catalog: EMPTY_L1_CATALOG,
        screens: SCREENS,
        traces: [{ ...(TRACES[0] as ScreenTraceRowV1), relation: "mentions" }],
      }),
    );
    expect(unknownRelation.trace_edges).toHaveLength(0);
    expect(unknownRelation.unmapped_requirements[0]?.reason).toBe("relation_unmapped");
  });

  // PLAN-L7-657-distribution-lite-consumer-canary / U-DRG-012c:
  // canary設計のcatalog接続で増えたrequirement nodeをscreen nodeへ誤算入しない。
  it("U-DRG-012c: 実 repo 台帳に対して構造不変条件が成立する（reality fence）", (ctx) => {
    // 実 harness.db を read-only で当て、fixture では見えない現実の形（要求 family の不一致）を固定する。
    // 件数そのものは台帳更新で動くため pin せず、構造不変条件だけを検査する。
    // 台帳が無い環境では **skip として可視化**する（生の return は「検査した green」と
    // 見分けが付かず、fence が黙って無効化される経路になる）。
    if (!existsSync(".helix/harness.db")) {
      ctx.skip(".helix/harness.db が無い環境（fence 未実行）");
      return;
    }
    const db = openHarnessDb(".helix/harness.db");
    try {
      const inputs = loadScreenIntakeInputs(db);
      if (inputs.screens.length === 0) {
        ctx.skip("screens 台帳が空（fence 未実行）");
        return;
      }
      const intake = unwrap(buildScreenIntake(inputs));
      // 台帳の全 screen が SCR ノードへ写り、元 ID が復元できる
      // intake.nodes は trace の端点となる requirement node も含むため、screenだけを比較する。
      const screenNodes = intake.nodes.filter((node) => node.kind === "screen");
      expect(screenNodes).toHaveLength(inputs.screens.length);
      for (const node of screenNodes) {
        expect(node.entity_id).toMatch(/^SCR-[a-z0-9][a-z0-9-]*$/);
        expect(node.source_pointer).toMatch(/^screens:/);
      }
      // edge + unmapped は trace 総数に一致する（silent drop が無いことの担保）
      expect(intake.trace_edges.length + intake.unmapped_requirements.length).toBe(
        inputs.traces.length,
      );
      for (const entry of intake.unmapped_requirements) {
        expect([
          "requirement_not_in_catalog",
          "requirement_kind_mismatch",
          "relation_unmapped",
        ]).toContain(entry.reason);
      }
      // complete フラグと gate は常に一致する（片方だけ green になる経路を作らない）
      expect(intake.trace_intake_complete).toBe(intake.unmapped_requirements.length === 0);
      expect(assertScreenIntakeComplete(intake).ok).toBe(intake.trace_intake_complete);
    } finally {
      db.close();
    }
  });

  it("U-DRG-012b: 読み取りは既存台帳だけを source とし、複製 table を新設しない", () => {
    const db = openHarnessDb(":memory:");
    for (const table of HARNESS_DB_EVALUATION_TABLES) db.exec(createTableSql(table));
    ensureDesignRegistryTables(db);
    db.prepare(
      "INSERT INTO screens (screen_id, name, category, url, l1_ref, status, implemented, indexed_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    ).run(
      "PM-01",
      "プロジェクト俯瞰",
      "PM",
      "/projects",
      "screen §1.PM.01",
      "not-implemented",
      0,
      "2026-06-24",
    );
    db.prepare(
      "INSERT INTO screen_trace (screen_trace_id, screen_id, requirement_id, requirement_kind, relation, source) VALUES (?, ?, ?, ?, ?, ?)",
    ).run("screen-trace:PM-01:BR-01", "PM-01", "BR-01", "br", "trace", "screen-requirements §5.5");

    const inputs = loadScreenIntakeInputs(db);
    expect(inputs.screens.map((row) => row.screen_id)).toEqual(["PM-01"]);
    expect(inputs.traces.map((row) => row.requirement_id)).toEqual(["BR-01"]);

    // reader は read-only。catalog も既存正本（L1 Markdown）だけを source として読む。
    expect(inputs.catalog.entries.length).toBeGreaterThan(0);
    expect(inputs.catalog.source_digest).toMatch(/^sha256:[0-9a-f]{64}$/u);

    // PLAN-L7-537 以降、L1 catalog に実在する BR-01 は edge 化される（D-1 の着地）。
    // 捏造していないことは「catalog に無い ID は edge にならない」で担保する。
    const intake = unwrap(buildScreenIntake(inputs));
    // 採用した BR-01 は requirement node としても投入される（PLAN-L7-538）。
    expect(intake.nodes.map((node) => node.entity_id)).toEqual(["BR-01", "SCR-pm-01"]);
    expect(intake.trace_edges.map((edge) => edge.from_entity_id)).toEqual(["BR-01"]);
    expect(intake.trace_intake_complete).toBe(true);
    // 列の型が台帳 schema と乖離したら読み取り時点で顕在化する（silent な空文字にしない）
    db.prepare("UPDATE screens SET name = NULL WHERE screen_id = ?").run("PM-01");
    expect(() => loadScreenIntakeInputs(db)).toThrow(/must be text/);
    db.prepare("UPDATE screens SET name = ? WHERE screen_id = ?").run("プロジェクト俯瞰", "PM-01");

    // 読み取りが registry 側 table を書いていない（複製台帳の新設なし）
    const registryNodes = db.prepare("SELECT COUNT(*) AS n FROM design_registry_nodes").get() as {
      n: number;
    };
    expect(registryNodes.n).toBe(0);
    db.close();
  });
});

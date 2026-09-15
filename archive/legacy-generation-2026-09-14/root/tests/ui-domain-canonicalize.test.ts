import { describe, expect, it } from "vitest";
import { canonicalizeUiDomain, UDP_POLICY_V1 } from "../src/design/ui-domain-pattern-profile";
import { buildUiDomain, UI_DOMAIN_ENTITIES, uiEntity } from "./tools/ui-domain-fixture";

// PLAN-L7-520-ui-domain-core: UI Domain slice1。L8テスト設計 U-UDP-001 行を機械検査する。

describe("ui-domain canonicalize (PLAN-L7-520)", () => {
  it("U-UDP-001: prefix regex・class/path/DOM主キー・stale入力をfail-closeし、同義入力は同digest", () => {
    const domain = buildUiDomain();
    expect(domain.entities.map((e) => e.entity_id)).toEqual(
      [...UI_DOMAIN_ENTITIES.map((e) => e.entity_id)].sort((a, b) => a.localeCompare(b)),
    );
    expect(domain.declaration_digest).toMatch(/^sha256:[0-9a-f]{64}$/);

    // 順序違い + 完全重複は同 digest へ正規化（dedup + stable sort）
    const shuffled = [...UI_DOMAIN_ENTITIES].reverse();
    shuffled.push({ entity_id: "SCR-pm-01", kind: "page" });
    const same = buildUiDomain(shuffled);
    expect(same.declaration_digest).toBe(domain.declaration_digest);
    expect(same.entities).toHaveLength(UI_DOMAIN_ENTITIES.length);

    // 反例: prefix 不一致・class 名・file path・DOM selector 主キー（mutation: regex/主キー
    // 判定を外すと red）
    for (const bad of [
      { entity_id: "PAG-top", kind: "page" },
      { entity_id: "ApproveButton", kind: "ui_component" },
      { entity_id: "src/components/approve.tsx", kind: "ui_component" },
      { entity_id: "#approve-button", kind: "ui_component" },
      { entity_id: "CMP-Approve", kind: "ui_component" },
    ]) {
      const result = canonicalizeUiDomain(
        {
          schema_version: "ui-domain-declaration.v1",
          entities: [...UI_DOMAIN_ENTITIES.map(uiEntity), uiEntity(bad)],
        },
        UDP_POLICY_V1,
      );
      expect(result.ok, JSON.stringify(bad)).toBe(false);
      if (!result.ok) expect(result.failures.every((f) => f.code === "UDP_ID_INVALID")).toBe(true);
    }

    // 同一 entity_id の非同値宣言（revision/source_pointer 違い）は dedup されず
    // UDP_ID_INVALID で fail-close（mutation: 一意性検査を外すと red）
    const dupNonEq = canonicalizeUiDomain(
      {
        schema_version: "ui-domain-declaration.v1",
        entities: [
          uiEntity({ entity_id: "SCR-pm-01", kind: "page" }),
          uiEntity({ entity_id: "SCR-pm-01", kind: "page", revision: 2 }),
        ],
      },
      UDP_POLICY_V1,
    );
    expect(dupNonEq.ok).toBe(false);
    if (!dupNonEq.ok) expect(dupNonEq.failures[0]?.code).toBe("UDP_ID_INVALID");

    // 入口検査: schema_version 不一致と stale/retired の canonical 渡しは UDP_STALE_INPUT
    // （mutation: 入口検査を外すと red）
    const badSchema = canonicalizeUiDomain(
      { schema_version: "ui-domain-declaration.v0", entities: [] },
      UDP_POLICY_V1,
    );
    expect(badSchema.ok).toBe(false);
    if (!badSchema.ok) expect(badSchema.failures[0]?.code).toBe("UDP_STALE_INPUT");
    const staleEntity = canonicalizeUiDomain(
      {
        schema_version: "ui-domain-declaration.v1",
        entities: [uiEntity({ entity_id: "SCR-pm-01", kind: "page", authority: "stale" })],
      },
      UDP_POLICY_V1,
    );
    expect(staleEntity.ok).toBe(false);
    if (!staleEntity.ok) expect(staleEntity.failures[0]?.code).toBe("UDP_STALE_INPUT");
  });
});

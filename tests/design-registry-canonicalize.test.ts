import { describe, expect, it } from "vitest";
import { canonicalizeRegistryDeclaration, REGISTRY_POLICY_V1 } from "../src/design/design-registry";

// PLAN-L7-516-design-registry-core: Design Registry slice1（純関数群）。L8テスト設計 U-DRG-001 行を機械検査する。

const node = (entity_id: string, kind: string, extra: Record<string, unknown> = {}) => ({
  entity_id,
  kind,
  atom_role: null,
  service_role: null,
  authority: "shadow",
  revision: 1,
  source_pointer: "docs/design/helix/L2-screen/example.md",
  ...extra,
});

const validRaw = () => ({
  schema_version: "design-registry-declaration.v1",
  nodes: [
    node("VDH-FR-001", "requirement"),
    node("SCR-pm-01", "screen"),
    node("SVC-approve-permission", "service", { service_role: "permission" }),
  ],
  edges: [
    {
      from_entity_id: "VDH-FR-001",
      to_entity_id: "SCR-pm-01",
      relation: "decomposes_to",
      authority: "shadow",
      revision: 1,
    },
  ],
});

describe("design-registry canonicalize (PLAN-L7-516)", () => {
  it("U-DRG-001: kind別ID regexとpath/class名主キーをfail-closeし、同義入力は同digestへ正規化する", () => {
    const ok = canonicalizeRegistryDeclaration(validRaw(), REGISTRY_POLICY_V1);
    expect(ok.ok, JSON.stringify(ok)).toBe(true);
    if (!ok.ok) return;
    expect(ok.value.nodes.map((n) => n.entity_id)).toEqual([
      "SCR-pm-01",
      "SVC-approve-permission",
      "VDH-FR-001",
    ]);
    for (const canonicalNode of ok.value.nodes) {
      expect(canonicalNode.semantic_digest).toMatch(/^sha256:[0-9a-f]{64}$/);
    }
    expect(ok.value.declaration_digest).toMatch(/^sha256:[0-9a-f]{64}$/);

    // 順序違いの同義入力 + 完全重複要素は同 digest へ正規化される（dedup + stable sort）
    const shuffled = validRaw();
    shuffled.nodes.reverse();
    shuffled.nodes.push(node("SCR-pm-01", "screen"));
    const okShuffled = canonicalizeRegistryDeclaration(shuffled, REGISTRY_POLICY_V1);
    expect(okShuffled.ok).toBe(true);
    if (!okShuffled.ok) return;
    expect(okShuffled.value.declaration_digest).toBe(ok.value.declaration_digest);
    expect(okShuffled.value.nodes).toHaveLength(3);

    // 反例は全て DRG_ID_INVALID で fail-close（mutation: regex 判定を外すと red）
    const rejected: Array<Record<string, unknown>> = [
      node("SCR-PM-01", "screen"), // 大文字（基本形逸脱）
      node("FLW-checkout", "screen"), // kind と prefix の不一致
      node("src/design/screen.ts", "component"), // file path 主キー
      node("ScreenApplicabilityGate", "domain_object"), // class 名主キー
      node("VDH-FR-1", "requirement"), // family regex 逸脱（3桁必須）
      node("HR-FR-DHR-01", "requirement"), // family regex 逸脱
      node("VDH-AC-12x", "acceptance"), // family regex 逸脱
      node("SCR-pm-02", "screen", { atom_role: "user_task" }), // kind と atom_role の不整合
      node("DOM-order", "domain_object", { service_role: "api" }), // kind と service_role の不整合
    ];
    for (const bad of rejected) {
      const raw = validRaw();
      raw.nodes.push(bad as ReturnType<typeof node>);
      const result = canonicalizeRegistryDeclaration(raw, REGISTRY_POLICY_V1);
      expect(result.ok, JSON.stringify(bad)).toBe(false);
      if (result.ok) continue;
      expect(result.failures.every((f) => f.code === "DRG_ID_INVALID")).toBe(true);
      expect(result.failures[0]?.evidence_digest).toMatch(/^sha256:[0-9a-f]{64}$/);
    }

    // 構造不正（schema_version 欠落）も DRG_ID_INVALID で fail-close
    const broken = canonicalizeRegistryDeclaration({ nodes: [], edges: [] }, REGISTRY_POLICY_V1);
    expect(broken.ok).toBe(false);
  });
});

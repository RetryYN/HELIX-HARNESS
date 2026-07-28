import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const requirement = readFileSync(
  "docs/design/helix/L3-requirements/multimodal-design-harness-authority.md",
  "utf8",
);
const acceptance = readFileSync(
  "docs/test-design/helix/multimodal-design-harness-authority-acceptance.md",
  "utf8",
);
const plan = readFileSync("docs/plans/PLAN-L3-51-multimodal-design-harness-authority.md", "utf8");

function yamlList(source: string, key: string): string[] {
  const match = source.match(new RegExp(`${key}:\\n((?:  - [^\\n]+\\n)+)`));
  expect(match, `${key} block`).not.toBeNull();
  return (
    match?.[1]
      .trim()
      .split("\n")
      .map((line) => line.replace(/^\s*-\s*/, "")) ?? []
  );
}

describe("VDH-MULTIMODAL-FR-001", () => {
  it("VDH-MM-U-001: keeps Design HARNESS orthogonal to style, case and layer", () => {
    expect(requirement).toContain("専門capability");
    expect(requirement).toContain("development styleに含めない");
    expect(requirement).toContain("case-driven modelに含めず");
    expect(requirement).toContain("provider、tool、storage、model、IDEをconcept authorityにしない");
  });

  it("VDH-MM-U-002: fixes the seven modality exact set", () => {
    expect(yamlList(requirement, "design_modalities")).toEqual([
      "web",
      "mobile",
      "game_ui",
      "scene_3d",
      "video_storyboard",
      "chart",
      "editor_doc",
    ]);
  });

  it("VDH-MM-U-003: fixes lifecycle and forbids direct canonical generation", () => {
    expect(yamlList(requirement, "design_artifact_lifecycle")).toEqual([
      "candidate",
      "verified",
      "approved",
      "canonical",
      "deprecated",
    ]);
    expect(requirement).toContain("出力は常に`candidate`から開始");
    expect(requirement).toContain("状態を飛び越えない");
  });

  it("VDH-MM-U-004: fixes the Design IR envelope", () => {
    expect(yamlList(requirement, "design_ir_envelope")).toHaveLength(14);
    expect(yamlList(requirement, "design_ir_envelope")).toContain("provenance");
    expect(yamlList(requirement, "design_ir_envelope")).toContain("release_binding");
    expect(requirement).toContain(
      "class名、file path、tool node ID、storage URIだけを意味主キーにしない",
    );
  });

  it("VDH-MM-U-005: fixes eight non-visual-only verification domains", () => {
    expect(yamlList(requirement, "design_verification_domains")).toEqual([
      "state",
      "interaction",
      "visual",
      "accessibility",
      "performance",
      "localization",
      "provenance_rights",
      "distribution",
    ]);
    expect(requirement).toContain("visual一致だけでcompleteにしない");
  });

  it("VDH-MM-U-006: constrains Reverse to four candidate sources", () => {
    expect(yamlList(requirement, "design_reverse_sources")).toEqual([
      "dom_runtime",
      "component_ast",
      "screenshot_frame",
      "asset_metadata",
    ]);
    expect(requirement).toContain("confidenceだけでcanonicalへ自動昇格しない");
    expect(requirement).toContain("proposal generatorであってauthorityではない");
  });

  it("VDH-MM-U-007: binds provenance, security and research isolation", () => {
    expect(requirement).toContain("unknown provenance");
    expect(requirement).toContain("third-party SaaSへの送信");
    expect(yamlList(requirement, "research_dispositions")).toEqual([
      "adopt",
      "adapt",
      "candidate_research",
      "reject",
    ]);
    expect(requirement).toContain("一次情報確認前は`candidate_research`");
  });

  it("VDH-MM-U-008: binds fourteen L10 polarity oracles and no implementation", () => {
    const ids = [...acceptance.matchAll(/`(VDH-MM-AC-\d{3})`/g)].map((match) => match[1]);
    expect(ids).toEqual(
      Array.from({ length: 14 }, (_, index) => `VDH-MM-AC-${String(index + 1).padStart(3, "0")}`),
    );
    expect(acceptance).toContain("tool順位、工数をcurrent採用証拠");
    expect(plan).toContain("status: draft");
    expect(plan).toContain("behavior_contract_id: VDH-MULTIMODAL-FR-001");
  });
});

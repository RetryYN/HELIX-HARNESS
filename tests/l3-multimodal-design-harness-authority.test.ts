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
const coverage = readFileSync(
  "docs/research/design-harness-deep-research-coverage-2026-07-29.md",
  "utf8",
);
const designCatalog = readFileSync("docs/design/design-catalog.yaml", "utf8");

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
    expect(requirement).toContain(
      "Vモデル、Production Scrum、V設計＋Scrum実装Hybridのdevelopment styleに含めない",
    );
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
    expect(requirement).toContain("candidateとcanonicalを同じpath／ID／statusで上書きしない");
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
    expect(requirement).toContain("retired_local_input: deep-research-report.md");
    expect(requirement).toContain(
      "digest: sha256:a94aa99e0f22c40e75816beb46105b0c2f75173ccf430577df5355635f2dca39",
    );
    expect(requirement).toContain(
      "source_snapshot: https://github.com/RetryYN/HELIX-HARNESS/issues/255#issuecomment-5108796110",
    );
    expect(requirement).toContain(
      "coverage_ledger: https://github.com/RetryYN/HELIX-HARNESS/issues/255#issuecomment-5108280627",
    );
    expect(requirement).toContain(
      "repository_coverage_ledger: docs/research/design-harness-deep-research-coverage-2026-07-29.md",
    );
    expect(requirement).toContain("canonical_authority: false");
    expect(requirement).toContain(
      "#192 Authoring Admissionのexactly-one promotion transactionを再実装しない",
    );
    expect(coverage).toContain("line_count: 620");
    expect(coverage).toContain("byte_count: 49243");
    expect(coverage).toContain(
      "digest: sha256:a94aa99e0f22c40e75816beb46105b0c2f75173ccf430577df5355635f2dca39",
    );
    expect(coverage).toContain("snapshot_payload_match: exact_first_49243_bytes");
    expect(coverage).toContain(
      "snapshot_wrapper_difference: details_header_and_terminal_newline_only",
    );
    expect(coverage).toContain("原文とbyte比較し、原文digestと一致");
    expect(coverage).toContain("章名・要約・抜粋だけのsnapshotを全量取得証拠にしない");
    expect(requirement).toContain(
      "source pathだけ、digestなしのIssue snapshotだけ、Issue本文だけ、opaque citation markerだけでは\n同一内容の証拠にしない",
    );
    expect(yamlList(requirement, "research_dispositions")).toEqual([
      "adopt",
      "adapt",
      "candidate_research",
      "reject",
    ]);
    expect(requirement).toContain("一次情報確認前は`candidate_research`");
    expect(requirement).toContain(
      "現行L1〜L12と3軸authorityに反する旧taxonomy、縮退route、禁止runtime、Design専用layerを\n要求するatomは`reject`する",
    );
    const semanticCoverage = coverage
      .split("### 2.2 semantic unitへの分解")[1]
      ?.split("## 3. 設計atom降下台帳")[0];
    for (const section of [
      "Executive Summary",
      "Ecosystem inventory and comparison",
      "Design IR ER model",
      "Design IR JSON Schema skeleton",
      "Multi-modality YAML examples",
      "candidate/canonical separation",
      "Verification suite",
      "Reverse pipeline",
      "Adapter architecture",
      "Concrete repository/storage layout",
      "Roadmap and person-month estimates",
      "Security/license/residency/IP",
      "Recommended adoption order",
    ]) {
      expect(semanticCoverage?.split(`| ${section} |`)).toHaveLength(2);
    }
    const sourceHeadings = coverage
      .split("### 2.1 原文H2見出しのexact mapping")[1]
      ?.split("### 2.2 semantic unitへの分解")[0]
      ?.split("\n")
      .filter(
        (line) =>
          line.startsWith("| ") && !line.startsWith("|---") && !line.includes("原文H2見出し"),
      )
      .map((line) =>
        line
          .split("|")
          .slice(1, 5)
          .map((cell) => cell.trim()),
      );
    expect(sourceHeadings).toEqual([
      ["エグゼクティブサマリー", "3", "12", "Executive Summary"],
      ["エコシステム棚卸しと比較表", "13", "75", "Ecosystem inventory and comparison"],
      [
        "Design IR",
        "76",
        "438",
        "Design IR関連: ER model; JSON Schema skeleton; Multi-modality YAML examples; candidate/canonical separation",
      ],
      ["検証スイート", "439", "457", "Verification suite"],
      ["Reverse pipeline", "458", "491", "Reverse pipeline（原文と同名）"],
      [
        "HELIXアダプタアーキテクチャとロードマップ",
        "492",
        "581",
        "Adapter architecture; Concrete repository/storage layout; Roadmap and person-month estimates",
      ],
      [
        "セキュリティ・ライセンス・データレジデンシー・IP",
        "582",
        "591",
        "Security/license/residency/IP",
      ],
      ["推奨採用順序", "592", "620", "Recommended adoption order"],
    ]);

    const sectionRows = coverage
      .split("### 2.2 semantic unitへの分解")[1]
      ?.split("## 3. 設計atom降下台帳")[0]
      ?.split("\n")
      .filter(
        (line) => line.startsWith("| ") && !line.startsWith("|---") && !line.includes("sourceの章"),
      );
    expect(sectionRows).toHaveLength(13);
    for (const row of sectionRows ?? []) {
      const disposition = row.split("|")[2]?.trim();
      expect(["adopt", "adapt", "candidate_research", "reject"]).toContain(disposition);
    }
    const atomCoverage = coverage
      .split("## 3. 設計atom降下台帳")[1]
      ?.split("## 4. modality fixtureのcoverage")[0];
    for (const atom of [
      "modality",
      "lifecycle",
      "Design IR",
      "component/state/interaction",
      "data/responsive/a11y",
      "token/exchange/asset",
      "verification",
      "Reverse",
      "adapter",
      "storage/registry/ledger",
      "provenance/legal/security",
      "operation",
    ]) {
      expect(atomCoverage?.split(`| ${atom} |`)).toHaveLength(2);
    }
  });

  it("VDH-MM-U-008: binds fourteen L10 polarity oracles and no implementation", () => {
    const ids = [...acceptance.matchAll(/`(VDH-MM-AC-\d{3})`/g)].map((match) => match[1]);
    expect(ids).toEqual(
      Array.from({ length: 14 }, (_, index) => `VDH-MM-AC-${String(index + 1).padStart(3, "0")}`),
    );
    expect(acceptance).toContain("tool順位、工数をcurrent採用証拠");
    const requirementPath =
      "docs/design/helix/L3-requirements/multimodal-design-harness-authority.md";
    expect(designCatalog.split(requirementPath)).toHaveLength(2);
    expect(designCatalog.indexOf(requirementPath)).toBeLessThan(
      designCatalog.indexOf("\nbaseline:\n"),
    );
    const planStatus = plan.match(/^status: (draft|confirmed)$/m)?.[1];
    expect(["draft", "confirmed"]).toContain(planStatus);
    expect(plan).toContain("behavior_contract_id: VDH-MULTIMODAL-FR-001");
  });
});

import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  loadCanonicalRequirementIrFromShards,
  parseRequirementGeneratedView,
  renderRequirementGeneratedView,
} from "../src/requirements/requirement-generated-view";

// PLAN-L7-489-requirement-generated-view-projection

describe("Requirement generated view", () => {
  it("U-RGV-001: loads the exact stable-ID shard set and verifies all digests", () => {
    const shadow = loadCanonicalRequirementIrFromShards(process.cwd());
    expect(shadow.requirements).toHaveLength(153);
    expect(shadow.system_contracts).toHaveLength(24);
    expect(shadow.acceptance_cases).toHaveLength(72);
    expect(shadow.system_tests).toHaveLength(24);
    expect(shadow.refinement_contracts).toHaveLength(5);
    expect(shadow.baseline_root_digest).toBe(
      "sha256:3351a371e2643af122882f65a52cc25c63269786bbd2c87d4e1115a46191eb75",
    );
    expect(shadow.root_digest).toMatch(/^sha256:[0-9a-f]{64}$/);
  });

  it("U-RGV-002: round-trips JSON through generated Markdown without semantic drift", () => {
    const source = loadCanonicalRequirementIrFromShards(process.cwd());
    const markdown = renderRequirementGeneratedView(source);
    const reparsed = parseRequirementGeneratedView(markdown);
    expect(reparsed).toEqual(source);
  });

  it("U-RGV-003: emits generated authority headers and human-readable sections", () => {
    const markdown = renderRequirementGeneratedView(
      loadCanonicalRequirementIrFromShards(process.cwd()),
    );
    expect(markdown).toMatch(
      /^<!-- GENERATED FROM requirements-ir -->\n<!-- DO NOT EDIT: canonical authority is JSON -->/,
    );
    expect(markdown).toContain("## 要求・要件");
    expect(markdown).toContain("| HIL-FR-64 | functional |");
    expect(markdown).toContain("## システム契約");
    expect(markdown).toContain("## 受入条件");
    expect(markdown).toContain("## 総合テスト");
    expect(markdown).toContain("## 要件refinement");
    expect(markdown).toContain("- baseline denominator: `153/24/72/24`");
    expect(markdown).toContain("- refinement contracts: `5`");
    expect(markdown).toContain("| MIC-FR-001 | HR-FR-HIL-08 | 7 | 12 | specified |");
    expect(markdown).toContain("| CNW-FR-001 | HR-FR-HIL-08 | 8 | 13 | specified |");
    expect(markdown).toContain("| DIST-LITE-FR-001 | HR-FR-HIL-24 | 5 | 9 | specified |");
    expect(markdown).toContain("| SYN-FR-001 | HR-FR-HIL-02 | 10 | 14 | specified |");
    expect(markdown).toContain("| OPS-FR-001 | HR-FR-HIL-04 | 18 | 21 | specified |");
  });

  it("U-RGV-004: rejects path escape, shard drift, and incomplete generated views", () => {
    const manifest = readFileSync("requirements-ir/manifest.json", "utf8");
    expect(() => loadCanonicalRequirementIrFromShards(process.cwd(), "../outside.json")).toThrow(
      "escapes repository",
    );
    const fixtureRoot = mkdtempSync(join(tmpdir(), "helix-requirement-view-"));
    try {
      const fixtureIrRoot = join(fixtureRoot, "requirements-ir");
      cpSync("requirements-ir", fixtureIrRoot, { recursive: true });
      const fixtureRequirementPath = join(fixtureIrRoot, "requirements.json");
      writeFileSync(
        fixtureRequirementPath,
        readFileSync(fixtureRequirementPath, "utf8").replace(
          '"requirement_id": "HIL-BR-01"',
          '"requirement_id": "HIL-BR-MUTATED"',
        ),
        "utf8",
      );
      expect(() => loadCanonicalRequirementIrFromShards(fixtureRoot)).toThrow(
        "requirements digest mismatch",
      );
    } finally {
      rmSync(fixtureRoot, { recursive: true, force: true });
    }
    expect(() =>
      parseRequirementGeneratedView(
        renderRequirementGeneratedView(loadCanonicalRequirementIrFromShards(process.cwd())).replace(
          /<!-- HELIX:REQUIREMENT_IR_RECORD:[A-Za-z0-9_-]+ -->/,
          "",
        ),
      ),
    ).toThrow("record count mismatch");
    expect(manifest).toContain('"partition": "stable_id_keyed_shards"');
  });

  it("U-RGV-005: reproduces the checked-in generated view byte-for-byte", () => {
    const source = loadCanonicalRequirementIrFromShards(process.cwd());
    expect(
      readFileSync("docs/generated/requirements/requirement-definition.generated.md", "utf8"),
    ).toBe(renderRequirementGeneratedView(source));
  });
});

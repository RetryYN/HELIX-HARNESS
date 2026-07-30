import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  loadRequirementIrShadowFromShards,
  parseRequirementGeneratedView,
  renderRequirementGeneratedView,
} from "../src/requirements/requirement-generated-view";

// PLAN-L7-489-requirement-generated-view-projection

describe("Requirement generated view", () => {
  it("U-RGV-001: loads the exact stable-ID shard set and verifies all digests", () => {
    const shadow = loadRequirementIrShadowFromShards(process.cwd());
    expect(shadow.requirements).toHaveLength(153);
    expect(shadow.system_contracts).toHaveLength(24);
    expect(shadow.acceptance_cases).toHaveLength(72);
    expect(shadow.system_tests).toHaveLength(24);
    expect(shadow.root_digest).toMatch(/^sha256:[0-9a-f]{64}$/);
  });

  it("U-RGV-002: round-trips JSON through generated Markdown without semantic drift", () => {
    const source = loadRequirementIrShadowFromShards(process.cwd());
    const markdown = renderRequirementGeneratedView(source);
    const reparsed = parseRequirementGeneratedView(markdown);
    expect(reparsed).toEqual(source);
  });

  it("U-RGV-003: emits generated authority headers and human-readable sections", () => {
    const markdown = renderRequirementGeneratedView(
      loadRequirementIrShadowFromShards(process.cwd()),
    );
    expect(markdown).toMatch(
      /^<!-- GENERATED FROM requirements-ir shadow -->\n<!-- DO NOT EDIT: current authority remains legacy Markdown until PR-5 cutover -->/,
    );
    expect(markdown).toContain("## Requirements");
    expect(markdown).toContain("| HIL-FR-64 | functional |");
    expect(markdown).toContain("## System contracts");
    expect(markdown).toContain("## Acceptance cases");
    expect(markdown).toContain("## System tests");
  });

  it("U-RGV-004: rejects path escape, shard drift, and incomplete generated views", () => {
    const manifest = readFileSync("generated/requirements-ir/manifest.json", "utf8");
    expect(() => loadRequirementIrShadowFromShards(process.cwd(), "../outside.json")).toThrow(
      "escapes repository",
    );
    expect(() =>
      parseRequirementGeneratedView(
        renderRequirementGeneratedView(loadRequirementIrShadowFromShards(process.cwd())).replace(
          /<!-- HELIX:REQUIREMENT_IR_RECORD:[A-Za-z0-9_-]+ -->/,
          "",
        ),
      ),
    ).toThrow("record count mismatch");
    expect(manifest).toContain('"partition": "stable_id_keyed_shards"');
  });

  it("U-RGV-005: reproduces the checked-in generated view byte-for-byte", () => {
    const source = loadRequirementIrShadowFromShards(process.cwd());
    expect(
      readFileSync("docs/generated/requirements/requirement-definition.generated.md", "utf8"),
    ).toBe(renderRequirementGeneratedView(source));
  });
});

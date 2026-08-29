import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  VMODEL_LEGACY_ZIP_FILENAME,
  VMODEL_SOURCE_FAMILY_ID,
  VMODEL_SOURCE_MANIFEST_PATH,
} from "../src/schema/hybrid-vmodel-manifest";

describe("source package manifest migration", () => {
  it("U-SRCMAN-001: source manifests bind exact family and inventory", () => {
    const hybrid = JSON.parse(readFileSync(VMODEL_SOURCE_MANIFEST_PATH, "utf8"));
    const workflow = JSON.parse(
      readFileSync(
        "docs/migration/source-manifests/universal-workflow-requirements-skill.v1.1.0.json",
        "utf8",
      ),
    );
    expect(hybrid.source_family_id).toBe(VMODEL_SOURCE_FAMILY_ID);
    expect(hybrid.entry_count).toBe(703);
    expect(hybrid.adopted_entries).toHaveLength(21);
    expect(workflow.entry_count).toBe(14);
    expect(workflow.entries).toHaveLength(14);
  });

  it("U-SRCMAN-005..007: migration source ZIP is retired behind exact manifests", () => {
    const v050 = JSON.parse(
      readFileSync("docs/migration/source-manifests/hybrid-core-rebaseline.v0.5.0.json", "utf8"),
    );
    const v051 = JSON.parse(
      readFileSync("docs/migration/source-manifests/hybrid-core-rebaseline.v0.5.1.json", "utf8"),
    );
    expect(
      existsSync("docs/migration/source-packages/hybrid-core-requirements-rebaseline-v0.5.0.zip"),
    ).toBe(false);
    expect(
      existsSync("docs/migration/source-packages/hybrid-core-requirements-rebaseline-v0.5.1.zip"),
    ).toBe(false);
    expect(v050).toMatchObject({
      source_family_id: "hybrid-core-rebaseline.v0.5.0",
      legacy_git_blob: "d1fbeccaf8c4006f5ba0ee077d9c1e887caff6c0",
      archive_sha256: "04e9c88a9214e77654787b9e1301eb35bc69a2f264d179d14211e849c58aca61",
      entry_set_sha256: "7906acee0afd710f3f1a6b1c97fd09043d48cdd23c8a1adc23a80008455423d9",
      root_prefix: "HELIX-HYBRID-CORE-REQUIREMENTS-REBASELINE_v0.5.1",
      entry_count: 208,
    });
    expect(v050.provenance_findings).toHaveLength(1);
    expect(v051).toMatchObject({
      source_family_id: "hybrid-core-rebaseline.v0.5.1",
      legacy_git_blob: "a20f09e0888e80f0e13374ef10dab52e1e6aeee7",
      archive_sha256: "1e14a8576715f5a249f270fb5472e02023400526e00866baa709befe9edb48fd",
      entry_set_sha256: "3eacded2534c049e54361bba5811ceac9383102dc7b586c4efe1ee0af5382790",
      entry_count: 211,
    });
  });

  it("U-SRCMAN-002: raw root source files are retired", () => {
    expect(existsSync(VMODEL_LEGACY_ZIP_FILENAME)).toBe(false);
    expect(existsSync("UNIVERSAL-WORKFLOW-REQUIREMENTS-SKILL_v1.1.0.zip")).toBe(false);
    expect(existsSync("deep-research-report.md")).toBe(false);
  });

  it("U-SRCMAN-003: current identity is not the legacy archive filename", () => {
    expect(VMODEL_SOURCE_FAMILY_ID).toBe("hybrid-vmodel-source.v1");
    expect(VMODEL_SOURCE_FAMILY_ID).not.toBe(VMODEL_LEGACY_ZIP_FILENAME);
  });

  it("U-SRCMAN-004: research is non-authoritative and routed to System Synthesis", () => {
    const research = readFileSync(
      "docs/research/design-harness-ecosystem-disposition-2026-08-29.md",
      "utf8",
    );
    expect(research).toContain("non-authoritative disposition");
    expect(research).toContain("#1033");
    expect(research).toContain("raw proseのauthority: なし");
  });
});

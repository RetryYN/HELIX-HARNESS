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
    expect(research).toContain("raw prose authority: none");
  });
});

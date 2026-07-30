import { existsSync, readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { checkRequirementAuthority } from "../src/requirements/requirement-authority-gate";
import {
  loadCanonicalRequirementIrFromShards,
  renderRequirementGeneratedView,
} from "../src/requirements/requirement-generated-view";
import { openHarnessDb } from "../src/state-db";
import { rebuildHarnessDb } from "../src/state-db/projection-writer";

// PLAN-L7-490-requirement-json-authority-cutover

describe("Requirement JSON authority", () => {
  it("U-RAC-001: accepts the canonical JSON, generated view, and pinned compatibility exact set", () => {
    expect(checkRequirementAuthority(process.cwd())).toEqual({
      ok: true,
      messages: ["requirement-authority - OK (canonical JSON, generated view, compatibility=4)"],
    });
  });

  it("U-RAC-002: fails closed when the authority packet cannot be loaded", () => {
    const result = checkRequirementAuthority("/path/that/does/not/exist");
    expect(result.ok).toBe(false);
    expect(result.messages.join("\n")).toContain("authority validation failed");
  });

  it("U-RAC-003: loads the exact canonical denominator and stable root digest", () => {
    const source = loadCanonicalRequirementIrFromShards(process.cwd());
    expect([
      source.requirements.length,
      source.system_contracts.length,
      source.acceptance_cases.length,
      source.system_tests.length,
    ]).toEqual([153, 24, 72, 24]);
    expect(source.root_digest).toMatch(/^sha256:[0-9a-f]{64}$/);
  });

  it("U-RAC-004: reproduces the generated Markdown byte-for-byte from canonical JSON", () => {
    expect(
      readFileSync("docs/generated/requirements/requirement-definition.generated.md", "utf8"),
    ).toBe(renderRequirementGeneratedView(loadCanonicalRequirementIrFromShards(process.cwd())));
  });

  it("U-RAC-005: projects canonical rows and removes the retired shadow table", () => {
    const db = openHarnessDb(":memory:");
    try {
      expect(
        rebuildHarnessDb({ repoRoot: process.cwd(), db, runtimeLogPolicy: "exclude" }).findings,
      ).toEqual([]);
      expect(db.prepare("SELECT COUNT(*) AS value FROM requirement_ir").get()).toEqual({
        value: 273,
      });
      expect(
        db
          .prepare(
            "SELECT COUNT(*) AS value FROM sqlite_master WHERE type='table' AND name='requirement_ir_shadow'",
          )
          .get(),
      ).toEqual({ value: 0 });
    } finally {
      db.close();
    }
  });

  it("U-RAC-006: keeps the legacy compiler migration-only and shadow artifacts retired", () => {
    const migration = readFileSync("src/requirements/requirement-ir-shadow-generator.ts", "utf8");
    expect(migration).toContain("requires an explicit output directory");
    expect(migration).toContain("migration shadow output path is forbidden");
    expect(
      existsSync("generated/requirements-ir") ? readdirSync("generated/requirements-ir") : [],
    ).toEqual([]);
  });
});

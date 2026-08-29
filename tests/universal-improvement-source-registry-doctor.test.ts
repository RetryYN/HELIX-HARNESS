import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { checkUniversalImprovementSourceRegistry } from "../src/doctor/universal-improvement-source-registry-check";

// PLAN-L3-75-universal-improvement-source-registry
const roots: string[] = [];

function makeRoot(): string {
  const root = mkdtempSync(join(tmpdir(), "helix-uil-source-doctor-"));
  roots.push(root);
  return root;
}

afterAll(() => {
  for (const root of roots) rmSync(root, { recursive: true, force: true });
});

describe("Universal Improvement source registry doctor", () => {
  it("U-UILSRC-007: current registryの実体digestとschemaをdoctorで検査する", () => {
    const result = checkUniversalImprovementSourceRegistry(process.cwd());
    expect(result.ok).toBe(true);
    expect(result.messages).toEqual([
      expect.stringContaining("universal-improvement-source-registry - OK"),
    ]);
  });

  it("U-UILSRC-008: registry欠落とJSON破損をgreenへ縮退しない", () => {
    const missing = makeRoot();
    expect(checkUniversalImprovementSourceRegistry(missing)).toEqual({
      ok: false,
      messages: [
        "universal-improvement-source-registry - violation 1 (registry_missing:config/universal-improvement-source-registry.v1.json)",
      ],
    });

    const invalid = makeRoot();
    mkdirSync(join(invalid, "config"), { recursive: true });
    writeFileSync(
      join(invalid, "config/universal-improvement-source-registry.v1.json"),
      "{",
      "utf8",
    );
    expect(checkUniversalImprovementSourceRegistry(invalid)).toEqual({
      ok: false,
      messages: [
        "universal-improvement-source-registry - violation 1 (registry_json_invalid:config/universal-improvement-source-registry.v1.json)",
      ],
    });
  });

  it("U-UILSRC-009: full doctorへexactly once配線する", () => {
    const source = readFileSync(join(process.cwd(), "src/doctor/index.ts"), "utf8");
    expect(
      source.match(
        /const universalImprovementSourceRegistry = checkUniversalImprovementSourceRegistry\(deps\.repoRoot\);/gu,
      ),
    ).toHaveLength(1);
    expect(
      source.match(
        /\["universalImprovementSourceRegistry", universalImprovementSourceRegistry\.ok\]/gu,
      ),
    ).toHaveLength(1);
    expect(source).toContain("universalImprovementSourceRegistry.ok &&");
    expect(
      source.match(/\.\.\.universalImprovementSourceRegistry\.messages\.map\(/gu),
    ).toHaveLength(1);
  });
});

import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { checkUniversalImprovementSourceRegistry } from "../src/doctor/universal-improvement-source-registry-check";
import {
  UNIVERSAL_IMPROVEMENT_SOURCE_REGISTRY_INTEGRITY_PATH,
  UNIVERSAL_IMPROVEMENT_SOURCE_REGISTRY_PATH,
} from "../src/runtime/universal-improvement-source-registry";

// PLAN-L7-703-universal-improvement-source-registry
const roots: string[] = [];

function makeRoot(): string {
  const root = mkdtempSync(join(tmpdir(), "helix-uil-source-doctor-"));
  roots.push(root);
  return root;
}

function copyRegistryFixture(root: string): void {
  const registryPath = join(process.cwd(), UNIVERSAL_IMPROVEMENT_SOURCE_REGISTRY_PATH);
  const registry = JSON.parse(readFileSync(registryPath, "utf8")) as {
    authority: { artifact_path: string };
    entries: Array<{
      authority: { artifact_path: string };
      detector: { implementation: { path: string } };
    }>;
  };
  const paths = new Set<string>([
    UNIVERSAL_IMPROVEMENT_SOURCE_REGISTRY_PATH,
    UNIVERSAL_IMPROVEMENT_SOURCE_REGISTRY_INTEGRITY_PATH,
    registry.authority.artifact_path,
    ...registry.entries.flatMap((entry) => [
      entry.authority.artifact_path,
      entry.detector.implementation.path,
    ]),
  ]);
  for (const path of paths) {
    const target = join(root, path);
    mkdirSync(join(target, ".."), { recursive: true });
    copyFileSync(join(process.cwd(), path), target);
  }
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

  it("U-UILSRC-010: registry integrityの欠落とbytes driftをfail-closeする", () => {
    const missingIntegrity = makeRoot();
    copyRegistryFixture(missingIntegrity);
    rmSync(join(missingIntegrity, UNIVERSAL_IMPROVEMENT_SOURCE_REGISTRY_INTEGRITY_PATH));
    expect(checkUniversalImprovementSourceRegistry(missingIntegrity).messages[0]).toContain(
      "registry_integrity_missing",
    );

    const drifted = makeRoot();
    copyRegistryFixture(drifted);
    const driftedRegistry = join(drifted, UNIVERSAL_IMPROVEMENT_SOURCE_REGISTRY_PATH);
    writeFileSync(driftedRegistry, `${readFileSync(driftedRegistry, "utf8")}\n`, "utf8");
    expect(checkUniversalImprovementSourceRegistry(drifted).messages[0]).toContain(
      "registry_bytes_digest_mismatch",
    );
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

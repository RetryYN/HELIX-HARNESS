// PLAN-L7-550-nfr-typed-registry-quality-taxonomy
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { checkNfrRegistry } from "../src/doctor/nfr-registry-check";

const roots: string[] = [];

function makeRoot(): string {
  const root = mkdtempSync(join(tmpdir(), "helix-nfr-doctor-"));
  roots.push(root);
  return root;
}

function writeRegistry(root: string, source: string): void {
  mkdirSync(join(root, "config"), { recursive: true });
  writeFileSync(join(root, "config/nfr-registry.json"), source, "utf8");
}

afterAll(() => {
  for (const root of roots) rmSync(root, { recursive: true, force: true });
});

describe("NFR registry doctor", () => {
  it("IT-NFRREG-001: missing、invalid JSON、structural driftをgreenへ縮退しない", () => {
    const missing = makeRoot();
    expect(checkNfrRegistry(missing)).toEqual({
      ok: false,
      messages: ["nfr-registry - violation: registry_missing"],
    });

    const invalidJson = makeRoot();
    writeRegistry(invalidJson, "{");
    expect(checkNfrRegistry(invalidJson)).toEqual({
      ok: false,
      messages: ["nfr-registry - violation: registry_json_invalid"],
    });

    const structuralDrift = makeRoot();
    const registry = JSON.parse(readFileSync("config/nfr-registry.json", "utf8")) as Record<
      string,
      unknown
    >;
    registry.extra = true;
    writeRegistry(structuralDrift, JSON.stringify(registry));
    expect(checkNfrRegistry(structuralDrift).messages.join("\n")).toContain(
      "registry_schema_invalid",
    );
  });

  it("IT-NFRREG-002: production registryはgreen、HR-NFR-REG-003欠落partialはred", () => {
    expect(checkNfrRegistry(process.cwd())).toMatchObject({ ok: true });

    const partialRoot = makeRoot();
    const registry = JSON.parse(readFileSync("config/nfr-registry.json", "utf8")) as {
      entries: unknown[];
    };
    registry.entries = registry.entries.slice(0, 2);
    writeRegistry(partialRoot, JSON.stringify(registry));
    mkdirSync(join(partialRoot, "docs/governance"), { recursive: true });
    writeFileSync(
      join(partialRoot, "docs/governance/helix-harness-requirements_v1.3.md"),
      readFileSync("docs/governance/helix-harness-requirements_v1.3.md"),
    );

    const partial = checkNfrRegistry(partialRoot);
    expect(partial.ok).toBe(false);
    expect(partial.messages.join("\n")).toContain("required trace HR-NFR-REG-003 missing");
  });

  it("IT-NFRREG-003: full doctorの判定・failing-check・messageへexactly once配線する", () => {
    const source = readFileSync(join(process.cwd(), "src/doctor/index.ts"), "utf8");
    expect(source.match(/const nfrRegistry = checkNfrRegistry\(deps\.repoRoot\);/gu)).toHaveLength(
      1,
    );
    expect(source.match(/\["nfrRegistry", nfrRegistry\.ok\]/gu)).toHaveLength(1);
    expect(source).toContain("aggregateInternalDoctorChecks(doctorCheckDefinitions)");
    expect(source).toContain("ok: doctorAllChecksOk");
    expect(source.match(/\.\.\.nfrRegistry\.messages\.map\(/gu)).toHaveLength(1);
  });
});

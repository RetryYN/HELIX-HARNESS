import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  loadRequirementsDocRegistry,
  REQUIREMENTS_COMPATIBILITY_CONSUMER_ALLOWLIST,
  REQUIREMENTS_DOC_REGISTRY_PATH,
} from "../src/lint/requirements-doc-registry";
import { requirementsDocPath } from "../src/lint/sub-doc-catalog-drift";

const sourceFiles = (root: string): string[] =>
  readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const path = join(root, entry.name);
    return entry.isDirectory() ? sourceFiles(path) : path.endsWith(".ts") ? [path] : [];
  });

// PLAN-L7-461-requirements-doc-registry / oracle U-RDOCREG-001 (governance-enforcement.md §2.4)
describe("requirements-doc-registry (PLAN-L7-461-requirements-doc-registry)", () => {
  it("registry file が存在し schema v1 で読み込める", () => {
    expect(existsSync(REQUIREMENTS_DOC_REGISTRY_PATH)).toBe(true);
    const registry = loadRequirementsDocRegistry();
    expect(registry.schema).toBe("requirements-doc-registry.v1");
    expect(registry.canonical).toBe("docs/governance/helix-harness-requirements_v1.3.md");
    expect(registry.compatibility).toBe("docs/governance/helix-harness-requirements_v1.2.md");
  });

  it("canonical / compatibility の実ファイルが存在する", () => {
    const registry = loadRequirementsDocRegistry();
    expect(existsSync(registry.canonical)).toBe(true);
    expect(existsSync(registry.compatibility)).toBe(true);
  });

  it("lint consumer が registry 経由でパスを解決する (ハードコード禁止)", () => {
    const registry = loadRequirementsDocRegistry();
    expect(requirementsDocPath()).toBe(registry.canonical);
    expect(requirementsDocPath()).not.toBe(registry.compatibility);
  });

  it("U-RDOCREG-001: registry 欠落・不正 schema・不正パスは fail-close で throw する", () => {
    expect(() => loadRequirementsDocRegistry("/nonexistent-root")).toThrow();
  });

  it("compatibility本文consumerをhistorical negative oracleとwrite guardだけへ限定する", () => {
    const consumers = sourceFiles("src")
      .filter((path) => path !== "src/lint/requirements-doc-registry.ts")
      .filter((path) =>
        /(?:registry|loadRequirementsDocRegistry\([^)]*\))\.compatibility|helix-harness-requirements_v1\.2\.md/.test(
          readFileSync(path, "utf8"),
        ),
      )
      .sort();
    expect(consumers).toEqual(Object.keys(REQUIREMENTS_COMPATIBILITY_CONSUMER_ALLOWLIST).sort());
    expect(new Set(Object.values(REQUIREMENTS_COMPATIBILITY_CONSUMER_ALLOWLIST))).toEqual(
      new Set(["historical_retirement_negative_oracle", "compatibility_write_guard"]),
    );
  });
});

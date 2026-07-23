import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function markdownCorpus(root: string): string {
  return readdirSync(root, { recursive: true, encoding: "utf8" })
    .filter((path) => path.endsWith(".md"))
    .map((path) => readFileSync(join(root, path), "utf8"))
    .join("\n");
}

function exactIds(text: string, pattern: RegExp): string[] {
  return [...new Set(text.match(pattern) ?? [])].sort();
}

function numbered(prefix: string, first: number, last: number): string[] {
  return Array.from({ length: last - first + 1 }, (_, index) =>
    `${prefix}-${String(first + index).padStart(3, "0")}`,
  );
}

describe("GitHub L3 trace・authority hygiene", () => {
  const requirements = markdownCorpus("docs/design/helix/L3-requirements");
  const tests = markdownCorpus("docs/test-design/helix");

  it("keeps GH functional requirements on the defined 001..023 set", () => {
    expect(exactIds(requirements, /GH-FR-\d{3}/g)).toEqual(numbered("GH-FR", 1, 23));
    expect(requirements).not.toContain("GH-FR-000");
  });

  it("keeps GH acceptance and system-test IDs exact on 001..034", () => {
    expect(exactIds(requirements, /GH-AC-\d{3}/g)).toEqual(numbered("GH-AC", 1, 34));
    expect(exactIds(tests, /GH-T-\d{3}/g)).toEqual(numbered("GH-T", 1, 34));
  });

  it("binds corrected supporting test designs to canonical L3↔L10", () => {
    for (const path of [
      "docs/test-design/helix/github-autonomous-operations-acceptance.md",
      "docs/test-design/helix/scrum-reverse-entity-model-acceptance.md",
    ]) {
      const text = readFileSync(path, "utf8");
      expect(text).toMatch(/executed_at_layer: L10\nlegacy_executed_at_layer: L12/);
      expect(text).toContain("canonical_layer_scheme: L1-L12");
    }
  });

  it("covers every worker-common FR and AC with L10 acceptance oracles", () => {
    const design = readFileSync(
      "docs/design/helix/L3-requirements/worker-common-contract.md",
      "utf8",
    );
    const acceptance = readFileSync(
      "docs/test-design/helix/worker-common-contract-acceptance.md",
      "utf8",
    );
    expect(exactIds(acceptance, /WCC-FR-\d{2}/g)).toEqual(
      exactIds(design, /WCC-FR-\d{2}/g),
    );
    expect(exactIds(acceptance, /WCC-AC-\d{2}/g)).toEqual(
      exactIds(design, /WCC-AC-\d{2}/g),
    );
    expect(acceptance).toContain("HAT: 8件");
  });

  it("does not retain the resolved ADR-009/010 conflict as a blanket runtime stop", () => {
    const text = readFileSync(
      "docs/design/helix/L3-requirements/github-autonomous-operations-requirements.md",
      "utf8",
    );
    expect(text).not.toContain("ADR-009/ADR-010の権威衝突");
    expect(text).toContain("Python semantic coreとNode transactional boundary");
  });
});

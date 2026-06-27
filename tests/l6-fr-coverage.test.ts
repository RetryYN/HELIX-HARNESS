import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  analyzeL6FrCoverage,
  loadL6FrCoverageDocs,
  parseL6FrCoverageRows,
} from "../src/lint/l6-fr-coverage";

describe("L6 FR coverage (FR registry -> unit-level function spec)", () => {
  it("parses FR coverage rows from the L6 matrix", () => {
    const rows = parseL6FrCoverageRows(`
| FR | L6 spec | unit contract | unit oracle |
|---|---|---|---|
| FR-L1-01 | docs/design/harness/L6-function-design/function-spec.md | planDraft | U-FR-L1-01 |
`);
    expect(rows).toEqual([
      {
        fr_id: "FR-L1-01",
        l6_spec: "docs/design/harness/L6-function-design/function-spec.md",
        unit_contract: "planDraft",
        unit_oracle: "U-FR-L1-01",
      },
    ]);
  });

  it("reports missing, unknown, and incomplete FR rows", () => {
    const result = analyzeL6FrCoverage({
      frIds: ["FR-L1-01", "FR-L1-02"],
      coverageText: `
| FR | L6 spec | unit contract | unit oracle |
|---|---|---|---|
| FR-L1-01 | docs/design/harness/L6-function-design/function-spec.md | \`planDraft\` |  |
| FR-L1-99 | docs/design/harness/L6-function-design/function-spec.md | \`unknown\` | U-FR-L1-98 |
`,
    });
    expect(result.ok).toBe(false);
    expect(result.missing).toEqual(["FR-L1-02"]);
    expect(result.unknown).toEqual(["FR-L1-99"]);
    expect(result.incomplete).toEqual([
      { fr_id: "FR-L1-01", missing: ["unit_oracle"] },
      { fr_id: "FR-L1-99", missing: ["unit_oracle_match"] },
    ]);
  });

  it("requires contract references to be present in the referenced L6 spec", () => {
    const result = analyzeL6FrCoverage({
      frIds: ["FR-L1-01"],
      coverageText: `
| FR | L6 spec | unit contract | unit oracle |
|---|---|---|---|
| FR-L1-01 | docs/design/harness/L6-function-design/session-log.md | \`missingContract\` validates input. | U-FR-L1-01 |
`,
      repoRoot: process.cwd(),
    });
    expect(result.ok).toBe(false);
    expect(result.weakContracts).toEqual([
      {
        fr_id: "FR-L1-01",
        contract: "missingContract",
        reason: "contract_ref_missing_in_l6_spec",
      },
    ]);
    expect(result.missingSubstance).toEqual([]);
  });

  it("requires function-spec refs to carry type body plus pseudocode or explicit defer", () => {
    const result = analyzeL6FrCoverage({
      frIds: ["FR-L1-01"],
      coverageText: `
| FR | L6 spec | unit contract | unit oracle |
|---|---|---|---|
| FR-L1-01 | docs/design/harness/L6-function-design/function-spec.md | \`runDoctor\` validates input. | U-FR-L1-01 |
`,
      repoRoot: process.cwd(),
    });
    expect(result.ok).toBe(false);
    expect(result.missingSubstance).toEqual([
      {
        fr_id: "FR-L1-01",
        contract: "runDoctor",
        reason: "missing_type_body_or_pseudocode_defer_marker",
      },
    ]);
  });

  it("requires explicit L7 defer rows to include a structured field block", () => {
    const repoRoot = join(tmpdir(), `ut-tdd-l6-fr-${Date.now()}`);
    const specDir = join(repoRoot, "docs", "design", "harness", "L6-function-design");
    mkdirSync(specDir, { recursive: true });
    writeFileSync(
      join(specDir, "function-spec.md"),
      `
| function | type body | pseudocode / implementation_state |
|---|---|---|
| \`deferredContract\` | \`DeferredInput -> DeferredResult\` | explicit_l7_defer; pseudocode = validate input and return result |
`,
      "utf8",
    );
    try {
      const result = analyzeL6FrCoverage({
        frIds: ["FR-L1-01"],
        coverageText: `
| FR | L6 spec | unit contract | unit oracle |
|---|---|---|---|
| FR-L1-01 | docs/design/harness/L6-function-design/function-spec.md | \`deferredContract\` validates input. | U-FR-L1-01 |
`,
        repoRoot,
      });
      expect(result.ok).toBe(false);
      expect(result.missingSubstance).toEqual([
        {
          fr_id: "FR-L1-01",
          contract: "deferredContract",
          reason: "missing_type_body_or_pseudocode_defer_marker",
        },
      ]);
    } finally {
      rmSync(repoRoot, { recursive: true, force: true });
    }
  });

  it("real repo covers every FR-L1 row with an L6 spec and U-* oracle", () => {
    const result = analyzeL6FrCoverage(loadL6FrCoverageDocs());
    expect(result.totalFr).toBe(51);
    expect(result.covered).toBe(51);
    expect(result.missing).toEqual([]);
    expect(result.unknown).toEqual([]);
    expect(result.incomplete).toEqual([]);
    expect(result.missingSpecFiles).toEqual([]);
    expect(result.weakContracts).toEqual([]);
    expect(result.missingSubstance).toEqual([]);
  });

  it("loadL6FrCoverageDocs reads the FR registry from the injected repoRoot (compiled-binary ROOT regression)", () => {
    // Regression: loadL6FrCoverageDocs forwards its repoRoot to loadFrDocs for the
    // FR registry, not just for the coverage matrix. Before the fix the FR registry
    // was loaded via loadFrDocs()'s import.meta-derived ROOT, which in a `bun build
    // --compile` binary resolves to /$bunfs → ENOENT ("L6 FR coverage matrix を読めない").
    const repoRoot = join(tmpdir(), `ut-tdd-l6-frroot-${Date.now()}`);
    const l1Dir = join(repoRoot, "docs", "design", "harness", "L1-requirements");
    const l3Dir = join(repoRoot, "docs", "design", "harness", "L3-functional");
    const l6Dir = join(repoRoot, "docs", "design", "harness", "L6-function-design");
    mkdirSync(l1Dir, { recursive: true });
    mkdirSync(l3Dir, { recursive: true });
    mkdirSync(l6Dir, { recursive: true });
    writeFileSync(
      join(l1Dir, "functional-requirements.md"),
      "## §1 機能一覧\n\n| ID | 機能名 | trace | 記載項目 | artifact | 優先 | role |\n|---|---|---|---|---|---|---|\n| **FR-L1-77** | sentinel fr | t | i | a | P0 | X |\n\n### §1.1 end\n",
      "utf8",
    );
    writeFileSync(join(l3Dir, "functional-requirements.md"), "", "utf8");
    writeFileSync(join(l1Dir, "screen-requirements.md"), "", "utf8");
    writeFileSync(join(l6Dir, "fr-unit-coverage.md"), "", "utf8");
    try {
      const docs = loadL6FrCoverageDocs(repoRoot);
      expect(docs.frIds).toEqual(["FR-L1-77"]);
    } finally {
      rmSync(repoRoot, { recursive: true, force: true });
    }
  });
});

import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const AUDIT_PATH = "docs/governance/helix-objective-evidence-audit.md";

function auditText(): string {
  return readFileSync(AUDIT_PATH, "utf8");
}

describe("HELIX objective evidence audit", () => {
  it("tracks every active objective requirement with proved semantic evidence", () => {
    const text = auditText();
    const expectedIds = ["G-01", "G-02", "G-03", "G-04", "G-05", "G-06", "G-07", "G-08", "G-09"];

    for (const id of expectedIds) {
      const row = text.split("\n").find((line) => line.startsWith(`| ${id} |`));
      expect(row, `${id} row missing`).toBeTruthy();
      expect(row).toContain("| proved |");
    }

    expect(text).toContain("7f83ca811353ed90b3e981178a1b0c9977dd5863");
    expect(text).toContain("1cb4c3e9e73e3d2933b353ccaa2b1f64fffa9f23");
    expect(text).toContain("HR-NFR-P5-03");
    expect(text).toContain("PLAN-M-02");
    expect(text).toContain("semantic, not only quantitative");
  });

  it("references the core current-state artifacts needed to substantiate the audit", () => {
    const text = auditText();
    const requiredArtifacts = [
      "docs/design/helix/L3-requirements/upstream-substance-gap.md",
      "docs/design/helix/L6-function-design/upstream-substance-gap.md",
      "src/runtime/upstream-adoption.ts",
      "tests/upstream-adoption.test.ts",
      "docs/design/helix/L3-requirements/legacy-helix-extension.md",
      "docs/design/helix/L6-function-design/legacy-helix-extension.md",
      "src/runtime/legacy-adoption.ts",
      "tests/legacy-adoption.test.ts",
      "docs/design/harness/L6-function-design/session-log.md",
      "src/runtime/run-debug.ts",
      "tests/run-debug.test.ts",
      "docs/plans/PLAN-DISCOVERY-10-helix-asset-visualization.md",
      "src/state-db/visualization-read-model.ts",
      "tests/visualization-read-model.test.ts",
      "docs/plans/PLAN-L7-207-l7-feature-pack-roadmap-definition.md",
      "src/schema/roadmap.ts",
      "src/lint/roadmap-registry.ts",
      "tests/roadmap.test.ts",
      "docs/test-design/helix/L3-pillar-acceptance-test-design.md",
      "docs/test-design/helix/L6-pillar-unit-test-design.md",
      ".claude/settings.json",
      ".codex/config.toml",
      ".codex/hooks.json",
      "src/lint/codex-hook-adapter.ts",
      "tests/codex-hook-adapter.test.ts",
    ];

    for (const artifact of requiredArtifacts) {
      expect(text, `${artifact} not cited`).toContain(artifact);
      expect(existsSync(artifact), `${artifact} missing`).toBe(true);
    }
  });
});

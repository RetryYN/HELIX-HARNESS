import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  analyzeLintWiring,
  DEFERRED_LINTS,
  extractImportSpecs,
  type LintWiringInput,
  lintWiringMessages,
  loadLintWiringInput,
} from "../src/lint/lint-wiring";

function input(lintModules: string[], reachableModules: string[]): LintWiringInput {
  return {
    lintModules,
    reachable: new Set(reachableModules.map((m) => `src/lint/${m}.ts`)),
  };
}

function functionInput(reachableExports: string[]): LintWiringInput {
  return { lintModules: [], reachable: new Set(), reachableExports: new Set(reachableExports) };
}

describe("analyzeLintWiring (pure)", () => {
  it("all lint modules reachable from a runtime path = ok, none dead", () => {
    const r = analyzeLintWiring(input(["alpha", "beta"], ["alpha", "beta"]));
    expect(r.ok).toBe(true);
    expect(r.wired).toEqual(["alpha", "beta"]);
    expect(r.unwired).toEqual([]);
    expect(r.deferred).toEqual([]);
  });

  it("an unreachable non-deferred module = dead rule = violation", () => {
    const r = analyzeLintWiring(input(["alpha", "ghost"], ["alpha"]));
    expect(r.ok).toBe(false);
    expect(r.unwired).toEqual(["ghost"]);
    expect(lintWiringMessages(r)[0]).toContain("未配線");
    expect(lintWiringMessages(r)[0]).toContain("ghost");
  });

  it("an unreachable module that is DEFERRED-listed = tolerated (ok)", () => {
    // tool-adapter is the real deferred entry; not reachable here → classified deferred, ok.
    const r = analyzeLintWiring(input(["alpha", "tool-adapter"], ["alpha"]));
    expect(r.ok).toBe(true);
    expect(r.deferred).toEqual(["tool-adapter"]);
    expect(r.unwired).toEqual([]);
    expect(lintWiringMessages(r)[0]).toContain("tool-adapter");
  });

  it("a DEFERRED module that is actually reachable = stale declaration = violation", () => {
    const r = analyzeLintWiring(input(["tool-adapter"], ["tool-adapter"]));
    expect(r.ok).toBe(false);
    expect(r.staleDeferred).toEqual(["tool-adapter"]);
    expect(lintWiringMessages(r)[0]).toContain("stale-deferred");
  });

  it("DEFERRED_LINTS entries each carry a non-empty reason", () => {
    for (const [name, reason] of Object.entries(DEFERRED_LINTS)) {
      expect(name.length).toBeGreaterThan(0);
      expect(reason.trim().length).toBeGreaterThan(0);
    }
  });
});

describe("extractImportSpecs (comment-stripping robustness)", () => {
  it("ignores commented-out imports so a dead module is not falsely counted as wired", () => {
    const content = [
      'import { real } from "../lint/alpha";',
      '// import { fake } from "../lint/line-commented";',
      '/* import { blk } from "../lint/block-commented"; */',
    ].join("\n");
    const specs = extractImportSpecs(content);
    expect(specs).toContain("../lint/alpha");
    expect(specs).not.toContain("../lint/line-commented");
    expect(specs).not.toContain("../lint/block-commented");
  });

  it("captures sibling ./ imports + dynamic import()/require() (real reachability edges)", () => {
    const content = [
      'import { x } from "./fr-registry-audit";',
      'const y = await import("./improvement-backlog");',
      'const z = require("./doc-consistency");',
    ].join("\n");
    expect(extractImportSpecs(content)).toEqual(
      expect.arrayContaining(["./fr-registry-audit", "./improvement-backlog", "./doc-consistency"]),
    );
  });
});

describe("loadLintWiringInput (live repo regression fence)", () => {
  it("every src/lint module is reachable or DEFERRED, and the 4 re-wired audits are reachable", () => {
    const r = analyzeLintWiring(loadLintWiringInput());
    // No dead rules; tool-adapter is the only intentional deferral.
    expect(r.unwired).toEqual([]);
    expect(r.staleDeferred).toEqual([]);
    expect(r.deferred).toEqual(["tool-adapter"]);
    expect(r.ok).toBe(true);
    expect(r.unwiredExports).toEqual([]);
    // The audits this PLAN re-wired into doctor are now genuinely reachable.
    for (const m of [
      "action-binding-approval-readiness",
      "cutover-readiness",
      "completion-decision-packet",
      "doc-consistency",
      "entity-coverage",
      "fr-registry-audit",
      "g9-system-workflow",
      "g10-ux-workflow",
      "gn-evidence-manifest",
      "improvement-backlog",
      "l14-close-audit",
      "lint-wiring",
      "objective-evidence-audit",
      "proposal-document-coverage",
      "repository-name-paths",
      "right-arm-verification-strategy",
      "s4-decision-readiness",
      "toolchain-pin",
      "version-up-readiness",
    ]) {
      expect(r.wired).toContain(m);
    }
  });

  it("fails when a required contract export is only defined/re-exported but not runtime-referenced", () => {
    // U-WIRING-002
    const r = analyzeLintWiring(
      functionInput([
        "validatePrReviewRoute",
        "gateCiAutoFixRepush",
        "planReleaseAutomationDecision",
        "renderGeneratedMcpConfig",
      ]),
    );
    expect(r.ok).toBe(false);
    expect(r.unwiredExports).toEqual(["analyzeVerificationProfileSafety"]);
    expect(lintWiringMessages(r)[0]).toContain("contract export");
  });

  it("loader does not treat import, re-export, string, or bare identifier as a function call", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-wiring-false-positive-"));
    try {
      mkdirSync(join(root, "src", "lint"), { recursive: true });
      writeFileSync(
        join(root, "src", "cli.ts"),
        [
          'import { analyzeVerificationProfileSafety } from "./lint/contracts";',
          'export { renderGeneratedMcpConfig } from "./lint/contracts";',
          'const label = "validatePrReviewRoute gateCiAutoFixRepush planReleaseAutomationDecision";',
          "void analyzeVerificationProfileSafety;",
        ].join("\n"),
      );
      writeFileSync(
        join(root, "src", "lint", "contracts.ts"),
        "export function analyzeVerificationProfileSafety() {}\nexport function renderGeneratedMcpConfig() {}\n",
      );
      const loaded = loadLintWiringInput(root);
      expect(loaded.reachableExports).toEqual(new Set());
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});

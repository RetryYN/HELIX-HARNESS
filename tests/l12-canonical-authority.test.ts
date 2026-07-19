import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { CANONICAL_LAYERS, V_MODEL_PAIRS } from "../src/schema";

const read = (path: string): string => readFileSync(path, "utf8");

const markdownFiles = (root: string): string[] =>
  readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const path = join(root, entry.name);
    if (entry.isDirectory()) {
      if (path === "docs/archive" || path === "docs/migration") return [];
      return markdownFiles(path);
    }
    return entry.isFile() && path.endsWith(".md") ? [path] : [];
  });

describe("L1-L12 canonical authority drift gate", () => {
  it("pins runtime adapters and startup governance reads to the same authority", () => {
    const sources = [
      "AGENTS.md",
      "CLAUDE.md",
      ".claude/CLAUDE.md",
      "docs/governance/README.md",
      "docs/governance/helix-harness-concept_v3.1.md",
      "docs/governance/helix-harness-requirements_v1.2.md",
      "docs/governance/helix-harness-extraction-plan_v0.1.md",
      "docs/governance/gate-design.md",
    ];

    for (const source of sources) {
      const body = read(source);
      expect(body, source).toMatch(/L1[-–]L12/);
      expect(body, source).toMatch(/compatibility projection/);
    }
  });

  it("pins the directive and schema to all six canonical pairs", () => {
    const directive = read("docs/governance/l12-canonical-vmodel-direction-directive_v0.1.md");
    const gateDesign = read("docs/governance/gate-design.md");
    expect(CANONICAL_LAYERS).toEqual([
      "L1",
      "L2",
      "L3",
      "L4",
      "L5",
      "L6",
      "L7",
      "L8",
      "L9",
      "L10",
      "L11",
      "L12",
      "cross",
    ]);
    expect(V_MODEL_PAIRS).toEqual({
      L1: "L12",
      L2: "L11",
      L3: "L10",
      L4: "L9",
      L5: "L8",
      L6: "L7",
    });
    for (const [left, right] of Object.entries(V_MODEL_PAIRS)) {
      expect(directive).toContain(`| ${left} |`);
      expect(directive).toContain(`⇔ ${right}`);
      expect(gateDesign).toContain(`${left}↔${right}`);
    }
    expect(gateDesign).not.toMatch(/\| \*\*G1\*\* \| L1 要求定義|\| \*\*G3\*\*[^\n]*L3↔L12/);
  });

  it("keeps L0 charter outside the canonical layer enum", () => {
    expect(CANONICAL_LAYERS).not.toContain("L0");
    expect(read("AGENTS.md")).toMatch(/L0 charterは層外authority anchor/);
    expect(read("CLAUDE.md")).toMatch(/L0 charterは層外authority anchor/);
  });

  it("loads the L12 directive before legacy-body concept and requirements docs", () => {
    const claude = read("CLAUDE.md");
    const governance = read("docs/governance/README.md");
    expect(claude.indexOf("l12-canonical-vmodel-direction-directive_v0.1.md")).toBeLessThan(
      claude.indexOf("helix-harness-concept_v3.1.md"),
    );
    expect(governance.indexOf("l12-canonical-vmodel-direction-directive_v0.1.md")).toBeLessThan(
      governance.indexOf("helix-harness-concept_v3.1.md"),
    );
  });

  it("keeps the recognition-risk inventory closed over every old-authority candidate", () => {
    const oldAuthority =
      /(L0-L14|L0.?L14|L1.?L14|L2.?L10|L3.?L12|proposal-only Python|proposal-only worker|Python code port|TypeScript\/Bun|TS\/Bun|reject.to.TS)/;
    const inventoryPath =
      "docs/governance/l12-hybrid-recognition-candidate-inventory-2026-07-19.md";
    const candidates = ["AGENTS.md", "CLAUDE.md", ".claude/CLAUDE.md", ...markdownFiles("docs")]
      .filter((path) => !path.startsWith("docs/governance/l12-hybrid-"))
      .filter((path) => oldAuthority.test(read(path)))
      .sort();
    const inventory = read(inventoryPath);
    const inventoried = [...inventory.matchAll(/^- `([^`]+)`$/gm)].map((match) => match[1]).sort();

    expect(new Set(inventoried).size).toBe(inventoried.length);
    expect(inventoried).toEqual(candidates);
    expect(candidates).toHaveLength(173);
  });
});

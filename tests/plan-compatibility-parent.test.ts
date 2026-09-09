import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parse as parseYaml } from "yaml";
import { checkPlanGovernance } from "../src/doctor/index";
import {
  analyzePlanCompatibilityDependencies,
  buildPlanCompatibilityDependencyBaseline,
} from "../src/lint/plan-compatibility-parent";
import { loadPlanLegacyWorkflowIdentityInventory } from "../src/lint/plan-entry-routing-legacy-input";
import { lintPlanWithGate } from "../src/plan/lint";
// PLAN-RECOVERY-1591-compatibility-parent-trace
import {
  currentAuthoringFrontmatterSchema,
  historicalPlanProvenanceSchema,
} from "../src/schema/frontmatter";

const inventory = loadPlanLegacyWorkflowIdentityInventory();
const legacy = inventory.entries.find(
  (entry) => entry.plan_id === "PLAN-L3-19-github-operations-projection",
);
if (!legacy) throw new Error("required frozen inventory fixture missing");
const provenance = {
  relation: "historical_provenance",
  authority_scope: "compatibility_input_only",
  plan_id: legacy.plan_id,
  path: legacy.path,
  reason: "現行要件へ移した旧PLANの来歴だけを保持する",
};
function check(raw: Record<string, unknown>) {
  return analyzePlanCompatibilityDependencies(
    [{ file: "docs/plans/PLAN-RECOVERY-1591-test.md", raw: { status: "draft", ...raw } }],
    inventory,
  );
}

describe("compatibility-only PLAN authority boundary", () => {
  it("U-CPP-001: current parent mutation is RED: %s", () => {
    for (const parent of [
      legacy.path,
      legacy.plan_id,
      `./${legacy.path}`,
      legacy.path.replaceAll("/", "\\"),
      `${legacy.path}#history`,
    ]) {
      const result = check({ dependencies: { parent } });
      expect(result.ok).toBe(false);
      expect(result.messages.join("\n")).toContain("compatibility_parent_forbidden");
    }
  });

  it("U-CPP-002: typed historical provenance alone is GREEN and retained by schema", () => {
    expect(historicalPlanProvenanceSchema.parse(provenance)).toEqual(provenance);
    expect(check({ historical_provenance: [provenance] }).ok).toBe(true);
    expect(
      check({
        dependencies: {
          parent: "docs/design/helix/L3-requirements/github-autonomous-operations-requirements.md",
        },
        historical_provenance: [provenance],
      }).ok,
    ).toBe(true);
  });

  it("U-CPP-003: untyped references cannot carry legacy authority", () => {
    for (const field of ["references", "requires"]) {
      const result = check({ dependencies: { [field]: [legacy.path] } });
      expect(result.ok).toBe(false);
      expect(result.messages.join("\n")).toContain("compatibility_reference_forbidden");
    }
  });

  it("U-CPP-004: untyped or confused provenance is RED", () => {
    for (const value of [
      legacy.path,
      { ...provenance, relation: "parent" },
      { ...provenance, authority_scope: "current" },
      { ...provenance, reason: " " },
      { ...provenance, current_authority: true },
      { ...provenance, path: "docs/plans/PLAN-L3-22-github-ci-performance-recovery.md" },
      { ...provenance, plan_id: "PLAN-L3-999-unknown" },
    ]) {
      const result = check({ historical_provenance: [value] });
      expect(result.ok).toBe(false);
      expect(result.messages.join("\n")).toContain("historical_provenance_invalid");
    }
  });

  it("U-CPP-005: provenance does not waive a simultaneous current parent", () => {
    expect(
      check({ dependencies: { parent: legacy.path }, historical_provenance: [provenance] }).ok,
    ).toBe(false);
  });

  it("U-CPP-006: inventory membership, old date and confirmed status do not waive current edges", () => {
    const result = analyzePlanCompatibilityDependencies(
      [
        {
          file: legacy.path,
          raw: {
            plan_id: legacy.plan_id,
            status: "confirmed",
            updated: "2020-01-01",
            dependencies: { parent: legacy.path },
          },
        },
      ],
      inventory,
    );
    expect(result.ok).toBe(false);
  });

  it("U-CPP-007: historical reader is retained but malformed typed history is rejected", () => {
    expect(check({ status: "archived", dependencies: { parent: legacy.path } }).ok).toBe(true);
    expect(check({ status: "archived", historical_provenance: [legacy.path] }).ok).toBe(false);
  });

  it("U-CPP-008: invalid inventory fails closed even with no documents", () => {
    const result = analyzePlanCompatibilityDependencies([], { ...inventory, valid: false });
    expect(result.ok).toBe(false);
    expect(result.messages.join("\n")).toContain("compatibility_inventory_invalid");
  });

  it("U-CPP-009: empty history is valid; duplicate history is invalid", () => {
    expect(check({ historical_provenance: [] }).ok).toBe(true);
    expect(check({ historical_provenance: [provenance, provenance] }).ok).toBe(false);
  });

  it("U-CPP-014: dependency type confusion is RED (%j)", () => {
    for (const dependencies of [
      { parent: { path: legacy.path, relation: "historical_provenance" } },
      { references: [provenance] },
      { references: legacy.path },
      { historical_provenance: [provenance] },
    ]) {
      const result = check({ dependencies });
      expect(result.ok).toBe(false);
      expect(result.messages.join("\n")).toContain("compatibility_dependencies_invalid");
    }
  });

  it("U-CPP-010: frozen inventory bytes remain unchanged", () => {
    expect(inventory.valid).toBe(true);
    expect(inventory.entries).toHaveLength(951);
    expect(
      JSON.parse(readFileSync("config/plan-legacy-workflow-identity-inventory.json", "utf8"))
        .entries_digest,
    ).toBe("sha256:32a88506cffbeade62cab27c3bbb9af2df7de75cad6092048d3857cdef661d0b");
  });

  it("U-CPP-011: default PLAN lint and doctor governance reject the same current parent", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-compatibility-parent-"));
    const path = "docs/plans/PLAN-RECOVERY-1591-test.md";
    try {
      mkdirSync(join(root, "docs/plans"), { recursive: true });
      mkdirSync(join(root, "config"));
      copyFileSync(
        "config/plan-legacy-workflow-identity-inventory.json",
        join(root, "config/plan-legacy-workflow-identity-inventory.json"),
      );
      writeFileSync(
        join(root, path),
        `---\nplan_id: PLAN-RECOVERY-1591-test\nstatus: draft\ndependencies:\n  parent: ${legacy.path}\n---\n`,
      );
      for (const result of [lintPlanWithGate(path, root), checkPlanGovernance(root)]) {
        expect(result.ok).toBe(false);
        expect(result.messages.join("\n")).toContain("compatibility_parent_forbidden");
      }
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("U-CPP-012: three approval-neutral consumers have no current compatibility dependency", () => {
    const plans = [
      "PLAN-L3-70-windows-lite-canary-admission",
      "PLAN-L6-81-drive-route-catalog",
      "PLAN-L7-462-issue-closure-contract",
    ];
    for (const plan of plans) {
      const file = `docs/plans/${plan}.md`;
      const raw = parseYaml(readFileSync(file, "utf8").split("---")[1] ?? "") as Record<
        string,
        unknown
      >;
      expect(analyzePlanCompatibilityDependencies([{ file, raw }], inventory)).toEqual({
        ok: true,
        messages: ["plan-compatibility-parent - OK (1 PLAN, grandfathered=0/0)"],
      });
      const history = raw.historical_provenance as Array<{ plan_id: string }>;
      expect(history.map((entry) => entry.plan_id)).toEqual([
        plan.startsWith("PLAN-L6-81") || plan.startsWith("PLAN-L7-462")
          ? legacy.plan_id
          : "PLAN-L3-22-github-ci-performance-recovery",
      ]);
    }
  });

  it("U-CPP-015: exact-edge baseline permits existing debt but rejects a new edge on the same PLAN", () => {
    const docs = [
      {
        file: "docs/plans/PLAN-RECOVERY-1591-existing.md",
        raw: { status: "draft", dependencies: { parent: legacy.path } },
      },
    ];
    const baseline = buildPlanCompatibilityDependencyBaseline(
      docs,
      inventory,
      "2026-09-10T00:00:00Z",
    );
    expect(baseline.grandfathered).toHaveLength(1);
    expect(analyzePlanCompatibilityDependencies(docs, inventory, baseline).ok).toBe(true);
    const grown = [
      {
        ...docs[0],
        raw: { ...docs[0].raw, dependencies: { parent: legacy.path, references: [legacy.path] } },
      },
    ];
    const result = analyzePlanCompatibilityDependencies(grown, inventory, baseline);
    expect(result.ok).toBe(false);
    expect(result.messages.join("\n")).toContain("compatibility_reference_forbidden");
  });

  it("U-CPP-013: frontmatter preserves history without reemitting a dependency", () => {
    const file = "docs/plans/PLAN-L7-462-issue-closure-contract.md";
    const raw = parseYaml(readFileSync(file, "utf8").split("---")[1] ?? "");
    const parsed = currentAuthoringFrontmatterSchema.parse(raw);
    expect(parsed.historical_provenance).toEqual(raw.historical_provenance);
    expect(parsed.dependencies.parent).toBe(
      "docs/design/helix/L3-requirements/github-autonomous-operations-requirements.md",
    );
    expect(JSON.stringify(parsed.dependencies)).not.toContain(legacy.plan_id);
  });
});

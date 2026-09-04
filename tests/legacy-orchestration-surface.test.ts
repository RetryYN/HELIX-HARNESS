import { describe, expect, it } from "vitest";
import {
  analyzeLegacyOrchestrationSurface,
  type LegacyOrchestrationInventory,
  legacyOrchestrationSurfaceMessages,
  loadLegacyOrchestrationSurface,
} from "../src/lint/legacy-orchestration-surface";

const inventory = (): LegacyOrchestrationInventory => ({
  schema_version: "helix-legacy-orchestration-surface-inventory.v1",
  authority_role: "compatibility_only_retirement_ratchet",
  source_head: "a".repeat(40),
  excluded_historical_prefixes: ["docs/archive/"],
  excluded_implementation_paths: ["src/lint/legacy-orchestration-surface.ts"],
  entries: [{ path: "src/old.ts", maximum_occurrences: 2 }],
});

describe("legacy orchestration surface retirement ratchet", () => {
  it("U-LORET-001: current compatibility debtを可視化し、減少だけを許可する", () => {
    const result = analyzeLegacyOrchestrationSurface(inventory(), [
      { path: "src/old.ts", content: "helix team run" },
    ]);
    expect(result.ok).toBe(true);
    expect(result.currentOccurrences).toBe(1);
    expect(result.baselineOccurrences).toBe(2);
  });

  it("U-LORET-002: 別pathへの旧surface追加をfail-closeする", () => {
    const result = analyzeLegacyOrchestrationSurface(inventory(), [
      { path: "src/old.ts", content: "helix team run" },
      { path: "src/new.ts", content: "helix pair-agent run" },
    ]);
    expect(result.ok).toBe(false);
    expect(result.newPaths).toEqual(["src/new.ts"]);
  });

  it("U-LORET-003: 同一path内の増加を削除との相殺なしで拒否する", () => {
    const result = analyzeLegacyOrchestrationSurface(inventory(), [
      {
        path: "src/old.ts",
        content: "helix team run\nhelix pair-agent run\nhelix loop run",
      },
    ]);
    expect(result.ok).toBe(false);
    expect(result.growth).toEqual([{ path: "src/old.ts", actual: 3, maximum: 2 }]);
  });

  it("U-LORET-004: archiveとgate実装自身はcurrent consumerへ数えない", () => {
    const result = analyzeLegacyOrchestrationSurface(inventory(), [
      { path: "docs/archive/old.md", content: "helix team run" },
      { path: "src/lint/legacy-orchestration-surface.ts", content: "helix pair-agent" },
    ]);
    expect(result.ok).toBe(true);
    expect(result.currentOccurrences).toBe(0);
    expect(result.staleEntries).toEqual(["src/old.ts"]);
  });

  it("U-LORET-005: inventory水増し・重複・退化値を拒否する", () => {
    const invalid = inventory();
    invalid.entries = [
      { path: "src/old.ts", maximum_occurrences: 0 },
      { path: "src/old.ts", maximum_occurrences: 2 },
    ];
    const result = analyzeLegacyOrchestrationSurface(invalid, []);
    expect(result.ok).toBe(false);
    expect(result.errors).toContain("inventory_entry_invalid:src/old.ts");
  });

  it("U-LORET-006: live repository inventoryが増加なしで一致する", () => {
    const loaded = loadLegacyOrchestrationSurface(process.cwd());
    const result = analyzeLegacyOrchestrationSurface(loaded.inventory, loaded.files);
    expect(legacyOrchestrationSurfaceMessages(result)[0]).toContain(
      "legacy-orchestration-surface - OK",
    );
    expect(result.ok).toBe(true);
  });
});

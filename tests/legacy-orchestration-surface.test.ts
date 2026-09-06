import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { checkLegacyOrchestrationSurface } from "../src/doctor/index";
import {
  analyzeLegacyOrchestrationSurface,
  compareLegacyOrchestrationInventory,
  isNonExecutableSuccessfulVitestEvidence,
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
  it("ignores only structurally successful Vitest evidence, not arbitrary files under evidence", () => {
    const successful = JSON.stringify({
      success: true,
      numFailedTests: 0,
      numFailedTestSuites: 0,
      testResults: [{ status: "passed", name: "nodeAgentSlotsDeps compatibility test" }],
    });
    expect(
      isNonExecutableSuccessfulVitestEvidence({
        path: ".helix/evidence/g8-integration/run.vitest.log",
        content: successful,
      }),
    ).toBe(true);
    expect(
      isNonExecutableSuccessfulVitestEvidence({
        path: ".helix/evidence/g8-integration/run.ts",
        content: successful,
      }),
    ).toBe(false);
    expect(
      isNonExecutableSuccessfulVitestEvidence({
        path: ".helix/evidence/g8-integration/run.vitest.log",
        content: JSON.stringify({
          success: false,
          numFailedTests: 1,
          numFailedTestSuites: 1,
          testResults: [{ status: "failed" }],
        }),
      }),
    ).toBe(false);
    expect(
      isNonExecutableSuccessfulVitestEvidence({
        path: ".helix/evidence/g8-integration/run.vitest.log",
        content: "nodeAgentSlotsDeps",
      }),
    ).toBe(false);
  });

  it("U-LORET-009: Git公開baseに束縛し、初回・通常更新とも自己上限追加を拒否する", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-legacy-base-"));
    const git = (...args: string[]) =>
      execFileSync("git", args, {
        cwd: root,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      }).trim();
    const file = join(root, "config/legacy-orchestration-surface-inventory.json");
    const candidate = inventory();
    const save = () => writeFileSync(file, JSON.stringify(candidate));
    try {
      git("init");
      git("config", "user.name", "Fixture");
      git("config", "user.email", "fixture@example.invalid");
      mkdirSync(join(root, "src"));
      mkdirSync(join(root, "config"));
      writeFileSync(join(root, "src/old.ts"), "helix team run\nhelix team run");
      git("add", "src/old.ts");
      git("commit", "-m", "fixture base");
      candidate.source_head = git("rev-parse", "HEAD");
      save();
      expect(() => loadLegacyOrchestrationSurface(root)).toThrow(); // 公開baseなし
      git("update-ref", "refs/remotes/origin/main", "HEAD");
      expect(() => loadLegacyOrchestrationSurface(root)).not.toThrow();
      candidate.entries[0].maximum_occurrences = 3;
      save();
      expect(() => loadLegacyOrchestrationSurface(root)).toThrow("inventory_limit_raised");
      candidate.entries[0].maximum_occurrences = 2;
      candidate.entries.push({ path: "src/new.ts", maximum_occurrences: 1 });
      save();
      expect(() => loadLegacyOrchestrationSurface(root)).toThrow("inventory_path_added");
      candidate.entries.pop();
      const source = candidate.source_head;
      candidate.source_head = "0".repeat(40);
      save();
      expect(() => loadLegacyOrchestrationSurface(root)).toThrow();
      candidate.source_head = source;
      candidate.entries[0].maximum_occurrences = 1;
      save();
      writeFileSync(join(root, "src/old.ts"), "helix team run");
      git("add", "src/old.ts", "config/legacy-orchestration-surface-inventory.json");
      git("commit", "-m", "fixture published reduction");
      git("update-ref", "refs/remotes/origin/main", "HEAD");
      expect(() => loadLegacyOrchestrationSurface(root)).not.toThrow();
      candidate.entries[0].maximum_occurrences = 2;
      save();
      expect(() => loadLegacyOrchestrationSurface(root)).toThrow("inventory_limit_raised");
      expect(checkLegacyOrchestrationSurface(root).ok).toBe(false);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("U-LORET-007: published上限の引上げと新規path自己登録を拒否する", () => {
    const candidate = inventory();
    candidate.entries[0].maximum_occurrences = 3;
    candidate.entries.push({ path: "src/new.ts", maximum_occurrences: 1 });
    expect(compareLegacyOrchestrationInventory(candidate, inventory())).toEqual([
      "inventory_limit_raised:src/old.ts",
      "inventory_path_added:src/new.ts",
    ]);
  });

  it("U-LORET-008: 削減後の再増加とsource差替えを拒否し、削減を許可する", () => {
    const reduced = inventory();
    reduced.entries[0].maximum_occurrences = 1;
    expect(compareLegacyOrchestrationInventory(reduced, inventory())).toEqual([]);
    expect(compareLegacyOrchestrationInventory(inventory(), reduced)).toContain(
      "inventory_limit_raised:src/old.ts",
    );
    const changed = inventory();
    changed.source_head = "0".repeat(40);
    expect(compareLegacyOrchestrationInventory(changed, inventory())).toContain(
      "inventory_source_head_changed",
    );
  });

  it("inventory読込失敗はcause digestを残し、local pathを露出しない", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-legacy-inventory-"));
    try {
      const result = checkLegacyOrchestrationSurface(root);
      expect(result.ok).toBe(false);
      expect(result.messages).toHaveLength(1);
      expect(result.messages[0]).toMatch(
        /^legacy-orchestration-surface - violation: reason=read_failed cause_kind=error cause_digest=sha256:[a-f0-9]{64}$/,
      );
      expect(result.messages[0]).not.toContain(root);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
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

  it("U-LORET-005: 除外先の拡張による新規consumer隠蔽を拒否する", () => {
    for (const exclusion of ["", "src/", "docs/"]) {
      const invalid = inventory();
      invalid.excluded_historical_prefixes.push(exclusion);
      const result = analyzeLegacyOrchestrationSurface(invalid, [
        { path: "src/new.ts", content: "helix team run" },
      ]);
      expect(result.ok).toBe(false);
      expect(result.errors).toContain("inventory_exclusion_invalid");
    }
    const invalid = inventory();
    invalid.excluded_implementation_paths.push("src/new.ts");
    expect(
      analyzeLegacyOrchestrationSurface(invalid, [
        { path: "src/new.ts", content: "helix team run" },
      ]).errors,
    ).toContain("inventory_exclusion_invalid");
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

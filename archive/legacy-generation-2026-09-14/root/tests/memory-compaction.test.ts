import { existsSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { listMemory, surfaceMemory, writeMemory } from "../src/memory";
import {
  compactMemory,
  memoryCompactionAdvice,
  nodeMemoryCompactionDeps,
} from "../src/memory/memory-compaction";
import { fileMemoryDeps } from "../src/memory/memory-store";

describe("memory compaction (PLAN-L7-354)", () => {
  let root: string | null = null;

  afterEach(() => {
    if (root) rmSync(root, { recursive: true, force: true });
    root = null;
  });

  it("U-MEMC-001: superseded chain compaction keeps active semantics invariant", () => {
    const deps = createDeps([
      "2026-07-07T00:00:00.000Z",
      "2026-07-07T00:01:00.000Z",
      "2026-07-07T00:02:00.000Z",
      "2026-07-07T00:03:00.000Z",
    ]);
    writeMemory({ layer: "harness", key: "policy", body: "A" }, deps);
    writeMemory({ layer: "harness", key: "policy", body: "B" }, deps);
    const activePolicy = writeMemory({ layer: "harness", key: "policy", body: "C" }, deps);
    const activeOther = writeMemory({ layer: "harness", key: "other", body: "D" }, deps);
    const beforeList = listMemory("harness", deps);
    const beforeSurface = surfaceMemory(deps);
    const beforeFind = deps.findByKey("harness", "policy");

    const result = compactMemory({ layer: "harness" }, compactionDeps());

    expect(result).toMatchObject({
      layer: "harness",
      kept: 2,
      removedSuperseded: 2,
      removedDamaged: 0,
      applied: true,
    });
    expect(result.backupPath && existsSync(result.backupPath)).toBe(true);
    const fresh = fileMemoryDeps({ root: rootOrThrow() });
    expect(listMemory("harness", fresh)).toEqual(beforeList);
    expect(surfaceMemory(fresh)).toEqual(beforeSurface);
    expect(fresh.findByKey("harness", "policy")).toEqual(beforeFind);
    const lines = readFileSync(memoryPath("harness"), "utf8").trim().split("\n");
    expect(lines.map((line) => JSON.parse(line).id)).toEqual([activePolicy.id, activeOther.id]);
  });

  it("U-MEMC-002: damaged jsonl lines are counted and removed", () => {
    const deps = createDeps(["2026-07-07T00:00:00.000Z"]);
    const active = writeMemory({ layer: "project", key: "note", body: "keep" }, deps);
    writeFileSync(memoryPath("project"), "not-json\n", { flag: "a" });

    const result = compactMemory({ layer: "project" }, compactionDeps());

    expect(result.removedDamaged).toBe(1);
    expect(result.kept).toBe(1);
    expect(readFileSync(memoryPath("project"), "utf8").trim()).toBe(JSON.stringify(active));
  });

  it("U-MEMC-003: dry-run does not rewrite memory and backup failure aborts apply", () => {
    const deps = createDeps(["2026-07-07T00:00:00.000Z", "2026-07-07T00:01:00.000Z"]);
    writeMemory({ layer: "harness", key: "policy", body: "old" }, deps);
    writeMemory({ layer: "harness", key: "policy", body: "new" }, deps);
    const before = readFileSync(memoryPath("harness"), "utf8");
    const beforeMtime = statSync(memoryPath("harness")).mtimeMs;

    const dryRun = compactMemory({ layer: "harness", dryRun: true }, compactionDeps());

    expect(dryRun).toMatchObject({
      kept: 1,
      removedSuperseded: 1,
      removedDamaged: 0,
      backupPath: null,
      applied: false,
    });
    expect(readFileSync(memoryPath("harness"), "utf8")).toBe(before);
    expect(statSync(memoryPath("harness")).mtimeMs).toBe(beforeMtime);

    const failingDeps = {
      ...compactionDeps(),
      backupFile: () => {
        throw new Error("backup denied");
      },
    };
    expect(() => compactMemory({ layer: "harness" }, failingDeps)).toThrow(/backup denied/);
    expect(readFileSync(memoryPath("harness"), "utf8")).toBe(before);
  });

  it("U-MEMC-004: memoryCompactionAdvice respects total and superseded ratio thresholds", () => {
    expect(memoryCompactionAdvice(entries(10, 0, 0))).toMatchObject({ recommend: false });
    expect(memoryCompactionAdvice(entries(200, 0, 0))).toMatchObject({ recommend: true });
    expect(memoryCompactionAdvice(entries(10, 5, 0))).toMatchObject({
      superseded: 5,
      ratio: 0.5,
      recommend: true,
    });
    expect(memoryCompactionAdvice(entries(10, 4, 1))).toMatchObject({
      damaged: 1,
      ratio: 0.4,
      recommend: false,
    });
  });

  it("U-MEMC-003b: layer file 未作成でも非 dryRun が backup なしで正常終了する (回帰防止)", () => {
    createDeps(["2026-07-07T00:00:00.000Z"]);
    const result = compactMemory({ layer: "harness" }, compactionDeps());
    expect(result.applied).toBe(false);
    expect(result.backupPath).toBeNull();
    expect(result.kept).toBe(0);
    expect(existsSync(memoryPath("harness"))).toBe(false);
  });

  function createDeps(times: string[]) {
    root = mkdtempSync(join(tmpdir(), "helix-memory-compaction-"));
    return fileMemoryDeps({
      root,
      now: () => {
        const next = times.shift();
        if (!next) throw new Error("mock time exhausted");
        return next;
      },
    });
  }

  function compactionDeps() {
    return {
      ...fileMemoryDeps({ root: rootOrThrow(), now: () => "2026-07-07T00:10:00.000Z" }),
      ...nodeMemoryCompactionDeps({ root: rootOrThrow() }),
      now: () => "2026-07-07T00:10:00.000Z",
    };
  }

  function memoryPath(layer: "harness" | "project"): string {
    return join(rootOrThrow(), ".helix", "memory", `${layer}.jsonl`);
  }

  function rootOrThrow(): string {
    if (!root) throw new Error("test root not initialized");
    return root;
  }
});

function entries(total: number, superseded: number, damaged: number): string[] {
  const rows: string[] = [];
  const valid = total - damaged;
  for (let i = 0; i < superseded; i++) {
    rows.push(
      JSON.stringify({
        id: `old-${i}`,
        layer: "harness",
        key: `k${i}`,
        body: "old body",
        supersedes: null,
        createdAt: `2026-07-07T00:00:${String(i).padStart(2, "0")}.000Z`,
      }),
    );
  }
  for (let i = superseded; i < valid; i++) {
    const oldIndex = i - superseded;
    rows.push(
      JSON.stringify({
        id: `new-${i}`,
        layer: "harness",
        key: `k${i}`,
        body: "body",
        supersedes: oldIndex < superseded ? `old-${oldIndex}` : null,
        createdAt: `2026-07-07T00:01:${String(i).padStart(2, "0")}.000Z`,
      }),
    );
  }
  for (let i = 0; i < damaged; i++) rows.push("not-json");
  return rows;
}

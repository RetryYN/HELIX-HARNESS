/**
 * P7 共有メモリ — Red-first oracle スタブ (PLAN-L6-50 add-design Step 3)。
 *
 * pair = docs/design/helix/L6-function-design/orchestration-memory.md (①) ⇔
 *        docs/test-design/helix/orchestration-memory.md (③)。
 *
 * add-design 凍結時点の forward-citation 充足用スタブ。add-impl (L7) で Red→Green へ展開する。
 */
import { describe, expect, it } from "vitest";
import { listMemory, surfaceMemory, writeMemory } from "../../src/memory";
import type { MemoryDeps, MemoryEntry, MemoryLayer } from "../../src/memory/memory-types";

describe("P7 memory (PLAN-L6-50 add-impl で実装)", () => {
  it("U-MEM-001: writeMemory は harness.db + jsonl の 2 層投影 / secret 拒否 / supersede", () => {
    const deps = createMemoryDeps(["2026-06-28T00:00:00.000Z", "2026-06-28T00:01:00.000Z"]);

    const first = writeMemory(
      { layer: "harness", key: "policy", body: "use pair-freeze evidence" },
      deps,
    );

    expect(first).toEqual({
      id: "harness:policy:2026-06-28T00:00:00.000Z",
      layer: "harness",
      key: "policy",
      body: "use pair-freeze evidence",
      supersedes: null,
      createdAt: "2026-06-28T00:00:00.000Z",
    });
    expect(deps.persisted).toEqual([first]);
    expect(deps.entries).toEqual([first]);

    expect(() =>
      writeMemory({ layer: "harness", key: "policy", body: "token sk-1234567890abcdef" }, deps),
    ).toThrow(/secret policy/);
    expect(deps.persisted).toEqual([first]);
    expect(deps.entries).toEqual([first]);

    const second = writeMemory(
      { layer: "harness", key: "policy", body: "keep oracle IDs in tests" },
      deps,
    );

    expect(second).toMatchObject({
      id: "harness:policy:2026-06-28T00:01:00.000Z",
      supersedes: first.id,
    });
    expect(deps.persisted).toEqual([first, second]);
    expect(deps.entries).toEqual([first, second]);
  });

  it("U-MEM-002: listMemory は superseded を除外し指定層のみ createdAt 昇順", () => {
    const deps = createMemoryDeps([
      "2026-06-28T00:03:00.000Z",
      "2026-06-28T00:01:00.000Z",
      "2026-06-28T00:02:00.000Z",
      "2026-06-28T00:04:00.000Z",
    ]);
    const oldHarness = writeMemory({ layer: "harness", key: "same", body: "old harness" }, deps);
    const project = writeMemory({ layer: "project", key: "same", body: "project only" }, deps);
    const newHarness = writeMemory({ layer: "harness", key: "same", body: "new harness" }, deps);
    const otherHarness = writeMemory(
      { layer: "harness", key: "other", body: "other harness" },
      deps,
    );
    const writesBeforeList = deps.persisted.length;

    expect(oldHarness.supersedes).toBeNull();
    expect(project.layer).toBe("project");
    expect(listMemory("harness", deps)).toEqual([newHarness, otherHarness]);
    expect(deps.persisted).toHaveLength(writesBeforeList);
  });

  it("U-MEM-003: surfaceMemory は harness 層のみ surface し秘匿を漏らさない", () => {
    const deps = createMemoryDeps([
      "2026-06-28T00:02:00.000Z",
      "2026-06-28T00:01:00.000Z",
      "2026-06-28T00:03:00.000Z",
    ]);
    writeMemory(
      { layer: "project", key: "project-note", body: "do not show project memory" },
      deps,
    );
    writeMemory({ layer: "harness", key: "runbook", body: "check gates" }, deps);
    writeMemory({ layer: "harness", key: "handover", body: "record next action" }, deps);

    const lines = surfaceMemory(deps);

    expect(lines).toEqual(["- [runbook] check gates", "- [handover] record next action"]);
    expect(lines.join("\n")).not.toContain("project-note");
    expect(lines.join("\n")).not.toContain("do not show project memory");
  });
});

interface MockMemoryDeps extends MemoryDeps {
  entries: MemoryEntry[];
  persisted: MemoryEntry[];
}

function createMemoryDeps(times: string[]): MockMemoryDeps {
  const entries: MemoryEntry[] = [];
  const persisted: MemoryEntry[] = [];

  const readActive = (layer: MemoryLayer): MemoryEntry[] => {
    const superseded = new Set(
      entries
        .filter((entry) => entry.layer === layer)
        .map((entry) => entry.supersedes)
        .filter((id): id is string => id !== null),
    );
    return entries.filter((entry) => entry.layer === layer && !superseded.has(entry.id));
  };

  return {
    entries,
    persisted,
    now: () => {
      const next = times.shift();
      if (next === undefined) throw new Error("mock time exhausted");
      return next;
    },
    stableId: (layer, key, createdAt) => `${layer}:${key}:${createdAt}`,
    isSecret: (body) => /\bsk-[A-Za-z0-9_-]{16,}/.test(body),
    readActive,
    findByKey: (layer, key) => readActive(layer).find((entry) => entry.key === key) ?? null,
    persist: (entry) => {
      entries.push(entry);
      persisted.push(entry);
    },
  };
}

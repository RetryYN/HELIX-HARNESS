import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { listMemory, surfaceMemory, writeMemory } from "../../src/memory";
import { fileMemoryDeps } from "../../src/memory/memory-store";

describe("fileMemoryDeps", () => {
  let root: string | null = null;

  afterEach(() => {
    if (root) rmSync(root, { recursive: true, force: true });
    root = null;
  });

  it("supersedes same-key entries and reads only active jsonl entries", () => {
    const deps = createDeps(["2026-06-28T00:00:00.000Z", "2026-06-28T00:01:00.000Z"]);

    const first = writeMemory({ layer: "harness", key: "policy", body: "old policy" }, deps);
    const second = writeMemory({ layer: "harness", key: "policy", body: "new policy" }, deps);

    expect(second.supersedes).toBe(first.id);
    expect(deps.readActive("harness")).toEqual([second]);
  });

  it("rejects secret-like bodies through the shared state-db policy without persisting", () => {
    const deps = createDeps(["2026-06-28T00:00:00.000Z"]);

    expect(() =>
      writeMemory(
        {
          layer: "harness",
          key: "token",
          body: "sk-1234567890abcdefghij",
        },
        deps,
      ),
    ).toThrow(/secret policy/);

    expect(existsSync(join(rootOrThrow(), ".ut-tdd", "memory", "harness.jsonl"))).toBe(false);
  });

  it("surfaces only harness memory and excludes project entries", () => {
    const deps = createDeps(["2026-06-28T00:00:00.000Z", "2026-06-28T00:01:00.000Z"]);
    writeMemory({ layer: "project", key: "project-note", body: "project body" }, deps);
    writeMemory({ layer: "harness", key: "runbook", body: "harness body" }, deps);

    const lines = surfaceMemory(deps);

    expect(lines).toEqual(["- [runbook] harness body"]);
    expect(lines.join("\n")).not.toContain("project body");
  });

  it("lists by createdAt ascending and persists across fileMemoryDeps instances", () => {
    const deps = createDeps([
      "2026-06-28T00:02:00.000Z",
      "2026-06-28T00:01:00.000Z",
      "2026-06-28T00:03:00.000Z",
    ]);
    const later = writeMemory({ layer: "harness", key: "later", body: "later body" }, deps);
    const earlier = writeMemory({ layer: "harness", key: "earlier", body: "earlier body" }, deps);
    const project = writeMemory({ layer: "project", key: "project", body: "project body" }, deps);

    const freshDeps = fileMemoryDeps({ root: rootOrThrow() });

    expect(listMemory("harness", freshDeps)).toEqual([earlier, later]);
    expect(listMemory("project", freshDeps)).toEqual([project]);
    expect(
      readFileSync(join(rootOrThrow(), ".ut-tdd", "memory", "harness.jsonl"), "utf8"),
    ).toContain(later.id);
  });

  function createDeps(times: string[]) {
    root = mkdtempSync(join(tmpdir(), "ut-tdd-memory-store-"));
    return fileMemoryDeps({
      root,
      now: () => {
        const next = times.shift();
        if (next === undefined) throw new Error("mock time exhausted");
        return next;
      },
    });
  }

  function rootOrThrow(): string {
    if (!root) throw new Error("test root not initialized");
    return root;
  }
});

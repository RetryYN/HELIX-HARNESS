import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { listMemory, surfaceMemory, writeMemory } from "../../src/memory";
import { fileMemoryDeps } from "../../src/memory/memory-store";

describe("fileMemoryDeps", () => {
  // Additive retirement contract: PLAN-L7-458-harness-memory-canonical-retirement.
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

    expect(existsSync(join(rootOrThrow(), ".helix", "memory", "harness.jsonl"))).toBe(false);
  });

  it("surfaces only harness memory and excludes project entries", () => {
    const deps = createDeps(["2026-06-28T00:00:00.000Z", "2026-06-28T00:01:00.000Z"]);
    writeMemory({ layer: "project", key: "project-note", body: "project body" }, deps);
    writeMemory({ layer: "harness", key: "runbook", body: "harness body" }, deps);

    const lines = surfaceMemory(deps);

    expect(lines).toEqual(["- [runbook] harness body"]);
    expect(lines.join("\n")).not.toContain("project body");
  });

  it("clips long bodies and caps surfaced entries to bound SessionStart context", () => {
    const deps = createDeps([
      "2026-06-28T00:00:00.000Z",
      "2026-06-28T00:01:00.000Z",
      "2026-06-28T00:02:00.000Z",
    ]);
    writeMemory({ layer: "harness", key: "a", body: "x".repeat(50) }, deps);
    writeMemory({ layer: "harness", key: "b", body: "b body" }, deps);
    writeMemory({ layer: "harness", key: "c", body: "c body" }, deps);

    const lines = surfaceMemory(deps, { maxEntries: 2, maxBodyChars: 10 });

    // only the 2 most recent entries surface, oldest collapses into a footer
    expect(lines).toEqual([
      "- [b] b body",
      "- [c] c body",
      "- (+1 older — helix memory list harness)",
    ]);

    const clipped = surfaceMemory(deps, { maxBodyChars: 10 });
    expect(clipped[0]).toBe(`- [a] ${"x".repeat(9)}…`);
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
      readFileSync(join(rootOrThrow(), ".helix", "memory", "harness.jsonl"), "utf8"),
    ).toContain(later.id);
  });

  it("U-MEMV2-005d: does not surface memory-v2 retirement tombstones through the legacy reader", () => {
    root = mkdtempSync(join(tmpdir(), "helix-memory-store-v2-"));
    const deps = fileMemoryDeps({ root: rootOrThrow(), now: () => "2026-07-19T00:01:00.000Z" });
    deps.persist({
      id: "harness:legacy:2026-07-19T00:00:00.000Z",
      layer: "harness",
      key: "legacy",
      body: "canonicalized",
      supersedes: null,
      createdAt: "2026-07-19T00:00:00.000Z",
    });
    deps.persist({
      id: "memory-consumed:harness:legacy:2026-07-19T00:00:00.000Z",
      layer: "harness",
      key: "legacy",
      body: "",
      supersedes: "harness:legacy:2026-07-19T00:00:00.000Z",
      createdAt: "2026-07-19T00:01:00.000Z",
      schemaVersion: 2,
      type: "reference",
      provenance: { planId: null, sessionId: null, runtime: "system", origin: "legacy-v1" },
      lifecycle: {
        state: "consumed",
        expiresAt: null,
        consumedAt: "2026-07-19T00:01:00.000Z",
        consumedBy: "requirements-reconciliation",
      },
      links: [],
    } as never);

    expect(deps.readActive("harness")).toEqual([]);
  });

  function createDeps(times: string[]) {
    root = mkdtempSync(join(tmpdir(), "helix-memory-store-"));
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

import { spawn } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { listMemory, surfaceMemory, writeMemory } from "../../src/memory";
import { fileMemoryDeps } from "../../src/memory/memory-store";
import {
  compactMemoryV2,
  consumeTakeover,
  deliverTakeover,
  expireMemory,
  type MemoryDepsV2,
  type MemoryEntryV2,
  type MemoryLayerV2,
  nodeMemoryV2Deps,
  normalizeMemoryEntry,
  resolveMemoryView,
  surfaceMemoryV2,
  validateMemoryEntry,
  writeMemoryV2,
} from "../../src/memory/memory-v2";

describe("memory structure v2 (PLAN-L7-407)", () => {
  let root: string | null = null;

  afterEach(() => {
    if (root) rmSync(root, { recursive: true, force: true });
    root = null;
  });

  it("U-MEMV2-001a: v1/v2 mixed normalization resolves cross-schema supersede and rejects bad explicit v2", () => {
    const legacy = legacyEntry("old", null, "2026-07-11T00:00:00.000Z");
    const next = entry({ id: "new", supersedes: "old", createdAt: "2026-07-11T00:01:00.000Z" });
    const view = resolveMemoryView([legacy, next], "2026-07-11T00:02:00.000Z", "harness");
    expect(view.activeEntries.map((item) => item.id)).toEqual(["new"]);
    expect(normalizeMemoryEntry({ ...next, schemaVersion: 99 })).toEqual({
      ok: false,
      reason: "schema_invalid",
    });
    // compacted predecessorへの参照は許可し、cycleだけをdamaged扱いにする。
    expect(resolveMemoryView([{ ...next, supersedes: "missing" }], next.createdAt).damaged).toBe(0);
    expect(
      resolveMemoryView(
        [entry({ id: "a", supersedes: "b" }), entry({ id: "b", supersedes: "a" })],
        next.createdAt,
      ).damaged,
    ).toBe(2);
  });

  it("U-MEMV2-001b: legacy write/list/surface remains byte-for-byte compatible", () => {
    root = mkdtempSync(join(tmpdir(), "helix-memv2-legacy-"));
    const times = ["2026-07-11T00:00:00.000Z", "2026-07-11T00:01:00.000Z"];
    const deps = fileMemoryDeps({ root, now: () => times.shift() ?? "unexpected" });
    writeMemory({ layer: "harness", key: "a", body: "x".repeat(300) }, deps);
    writeMemory({ layer: "harness", key: "b", body: "body" }, deps);
    expect(listMemory("harness", deps).map((item) => item.key)).toEqual(["a", "b"]);
    expect(surfaceMemory(deps, { maxEntries: 1, maxBodyChars: 10 })).toEqual([
      "- [b] body",
      "- (+1 older — helix memory list harness)",
    ]);
  });

  it("U-MEMV2-002a: schema validator returns field-bound reasons for enum/lifecycle input", () => {
    const now = "2026-07-11T00:00:00.000Z";
    expect(
      validateMemoryEntry(
        { layer: "takeover", key: "x", body: "x", type: "feedback" },
        now,
        () => false,
      ),
    ).toMatchObject({ ok: false, reason: "takeover_type_not_allowed", field: "type" });
    expect(
      validateMemoryEntry(
        { layer: "takeover", key: "x", body: "x", type: "state" },
        now,
        () => false,
      ),
    ).toMatchObject({ ok: false, reason: "takeover_expiry_required", field: "expiresAt" });
  });

  it("U-MEMV2-002b: body/metadata secrets and malformed/duplicate links fail closed", () => {
    const now = "2026-07-11T00:00:00.000Z";
    const secret = (value: string) => value.includes("SECRET_MARKER");
    expect(
      validateMemoryEntry({ layer: "harness", key: "x", body: "SECRET_MARKER" }, now, secret),
    ).toMatchObject({ ok: false, reason: "secret_like" });
    expect(
      validateMemoryEntry(
        {
          layer: "harness",
          key: "x",
          body: "ok",
          provenance: { origin: "SECRET_MARKER" },
        },
        now,
        secret,
      ),
    ).toMatchObject({ ok: false, reason: "secret_like" });
    expect(
      validateMemoryEntry(
        { layer: "harness", key: "x", body: "ok", links: ["harness:a", "harness:a"] },
        now,
        secret,
      ),
    ).toMatchObject({ ok: false, reason: "duplicate_link" });
    expect(resolveMemoryView([entry({ links: ["project:missing"] })], now).unresolvedLinks).toEqual(
      [{ entryId: "e", link: "project:missing" }],
    );
  });

  it("U-MEMV2-003: compactMemoryV2 preserves active/tombstone observations and rejects stale writers", () => {
    root = mkdtempSync(join(tmpdir(), "helix-memv2-compact-"));
    const clock = { now: "2026-07-11T00:00:00.000Z" };
    const deps = nodeMemoryV2Deps({ root, now: () => clock.now });
    expect(writeMemoryV2({ layer: "harness", key: "k", body: "old" }, deps).ok).toBe(true);
    clock.now = "2026-07-11T00:01:00.000Z";
    expect(writeMemoryV2({ layer: "harness", key: "k", body: "new" }, deps).ok).toBe(true);
    const before = surfaceMemoryV2({ layers: ["harness"], now: clock.now }, deps);
    const result = compactMemoryV2("harness", deps);
    const after = surfaceMemoryV2({ layers: ["harness"], now: clock.now }, deps);
    expect(result).toMatchObject({ applied: true, kept: 1, removed: 1 });
    expect(after).toEqual(before);
  });

  it("U-MEMV2-004a: takeover enforces seven-day expiry and materializes one stable expiry tombstone", () => {
    const mock = mockDeps("2026-07-11T00:00:00.000Z");
    const exact = "2026-07-18T00:00:00.000Z";
    expect(
      writeMemoryV2(
        { layer: "takeover", key: "next", body: "continue", type: "state", expiresAt: exact },
        mock,
      ).ok,
    ).toBe(true);
    mock.clock = exact;
    expect(expireMemory("takeover", exact, mock)).toEqual([
      { id: "takeover:next:2026-07-11T00:00:00.000Z:1", reason: "expired" },
    ]);
    expect(expireMemory("takeover", exact, mock)).toEqual([
      { id: "takeover:next:2026-07-11T00:00:00.000Z:1", reason: "already_expired" },
    ]);
    expect(
      mock.events.takeover.filter((event) => event.lifecycle.state === "expired"),
    ).toHaveLength(1);
  });

  it("U-MEMV2-004b: delivery consumes only after output and retries after persist failure", () => {
    const outputFailure = takeoverMock();
    outputFailure.writeOutput = () => {
      throw new Error("stdout closed");
    };
    expect(deliverTakeover({ consumerId: "c" }, outputFailure).status).toBe("output_failed");
    expect(outputFailure.events.takeover).toHaveLength(1);

    const persistFailure = takeoverMock();
    persistFailure.failAppend = true;
    expect(deliverTakeover({ consumerId: "c" }, persistFailure)).toMatchObject({
      status: "delivered_with_retry_required",
    });
    persistFailure.failAppend = false;
    expect(surfaceMemoryV2({ layers: ["takeover"] }, persistFailure).selectedIds).toHaveLength(1);
  });

  it("U-MEMV2-005a: consume is idempotent and returns explicit no-op reasons", () => {
    const mock = takeoverMock();
    const id = mock.events.takeover[0]?.id ?? "missing";
    expect(consumeTakeover([id], "c", mock)).toEqual([{ id, reason: "consumed" }]);
    expect(consumeTakeover([id], "c", mock)).toEqual([{ id, reason: "already_consumed" }]);
    expect(consumeTakeover(["missing"], "c", mock)).toEqual([
      { id: "missing", reason: "unknown_id" },
    ]);
    mock.events.harness.push(entry({ id: "harness-id" }));
    expect(consumeTakeover(["harness-id"], "c", mock)).toEqual([
      { id: "harness-id", reason: "wrong_layer" },
    ]);
  });

  it("U-MEMV2-005b: stale fences fail and two processes create one consume tombstone", async () => {
    root = mkdtempSync(join(tmpdir(), "helix-memv2-fence-"));
    const deps = nodeMemoryV2Deps({ root, now: () => "2026-07-11T00:00:00.000Z" });
    let stale = 0;
    deps.withLayerLock("takeover", "first", (fence) => {
      stale = fence;
    });
    deps.withLayerLock("takeover", "second", (current) => {
      expect(current).toBeGreaterThan(stale);
      expect(() => deps.appendEvent("takeover", entry({ layer: "takeover" }), stale)).toThrow(
        /stale_fencing_token/,
      );
    });

    const written = writeMemoryV2(
      {
        layer: "takeover",
        key: "cross-process",
        body: "only once",
        type: "state",
        expiresAt: "2026-07-12T00:00:00.000Z",
      },
      deps,
    );
    if (!written.ok) throw new Error(written.reason);
    const script = [
      'import { consumeTakeover, nodeMemoryV2Deps } from "./src/memory/memory-v2.ts";',
      "const root = process.env.MEMORY_V2_ROOT;",
      "const id = process.env.MEMORY_V2_ID;",
      'if (!root || !id) throw new Error("missing child input");',
      'const deps = nodeMemoryV2Deps({ root, now: () => "2026-07-11T00:01:00.000Z" });',
      'consumeTakeover([id], "child", deps);',
    ].join("");
    const testRoot = root;
    if (!testRoot) throw new Error("test root missing");
    await Promise.all([
      runBunChild(script, testRoot, written.entry.id),
      runBunChild(script, testRoot, written.entry.id),
    ]);
    const physical = readFileSync(join(testRoot, ".helix", "memory", "takeover.jsonl"), "utf8")
      .trim()
      .split("\n")
      .map((line) => JSON.parse(line) as MemoryEntryV2);
    expect(
      physical.filter((event) => event.id === `takeover-consumed:${written.entry.id}`),
    ).toHaveLength(1);
  });

  it("U-MEMV2-006: group-first selection keeps minority types visible and reports exact hidden counts", () => {
    const mock = mockDeps("2026-07-11T00:00:00.000Z");
    for (let i = 0; i < 100; i += 1) {
      mock.events.harness.push(entry({ id: `r${i}`, key: `r${i}`, type: "reference" }));
    }
    mock.events.harness.push(entry({ id: "constraint", key: "constraint", type: "constraint" }));
    const result = surfaceMemoryV2({ layers: ["harness"], maxEntries: 2 }, mock);
    expect(result.selectedIds).toContain("constraint");
    expect(result.hidden.harness.reference).toBe(99);
  });

  it("U-MEMV2-007a: code-point budget reserves breadcrumbs, skips oversize entries, and validates values", () => {
    const mock = mockDeps("2026-07-11T00:00:00.000Z");
    mock.events.harness.push(entry({ id: "emoji", key: "emoji", body: "😀".repeat(20) }));
    const limited = surfaceMemoryV2(
      { layers: ["harness"], maxEntries: 1, maxBodyChars: 4, maxChars: 80 },
      mock,
    );
    expect(limited.lines.join("\n").length).toBeGreaterThan(0);
    expect(() => surfaceMemoryV2({ maxEntries: -1 }, mock)).toThrow(/invalid_maxEntries/);
    expect(() => surfaceMemoryV2({ maxChars: 1.5 }, mock)).toThrow(/invalid_maxChars/);
  });

  it("U-MEMV2-007b: rendering is deterministic and maxBodyChars is applied before maxChars", () => {
    const mock = mockDeps("2026-07-11T00:00:00.000Z");
    mock.events.harness.push(
      entry({ id: "b", key: "b", body: "abcdefgh", createdAt: "2026-07-11T00:00:00.000Z" }),
      entry({ id: "a", key: "a", body: "abcdefgh", createdAt: "2026-07-11T00:00:00.000Z" }),
    );
    const input = { layers: ["harness" as const], maxBodyChars: 4, maxChars: 200 };
    expect(surfaceMemoryV2(input, mock)).toEqual(surfaceMemoryV2(input, mock));
    expect(surfaceMemoryV2(input, mock).lines.join("\n")).toContain("abc…");
  });

  it("U-MEMV2-008a: successful append emits one body-free memory_write event", () => {
    const mock = mockDeps("2026-07-11T00:00:00.000Z");
    const result = writeMemoryV2({ layer: "harness", key: "k", body: "private body" }, mock);
    expect(result.ok).toBe(true);
    expect(mock.sessionEvents).toHaveLength(1);
    expect(JSON.stringify(mock.sessionEvents)).not.toContain("private body");
  });

  it("U-MEMV2-008b: event failure preserves memory success while validation/dry-run emit nothing", () => {
    const mock = mockDeps("2026-07-11T00:00:00.000Z");
    mock.failSessionEvent = true;
    expect(writeMemoryV2({ layer: "harness", key: "k", body: "ok" }, mock)).toMatchObject({
      ok: true,
      diagnostics: ["session_event_persist_failed"],
    });
    const count = mock.sessionEvents.length;
    expect(writeMemoryV2({ layer: "harness", key: "bad", body: "SECRET_MARKER" }, mock).ok).toBe(
      false,
    );
    expect(writeMemoryV2({ layer: "harness", key: "dry", body: "ok", dryRun: true }, mock).ok).toBe(
      false,
    );
    expect(mock.sessionEvents).toHaveLength(count);
  });
});

interface MockDeps extends MemoryDepsV2 {
  clock: string;
  events: Record<MemoryLayerV2, MemoryEntryV2[]>;
  sessionEvents: unknown[];
  outputs: string[][];
  failAppend: boolean;
  failSessionEvent: boolean;
}

function mockDeps(clock: string): MockDeps {
  let fence = 0;
  let activeFence = 0;
  const mock: MockDeps = {
    clock,
    events: { harness: [], project: [], takeover: [] },
    sessionEvents: [],
    outputs: [],
    failAppend: false,
    failSessionEvent: false,
    now: () => mock.clock,
    isSecret: (value) => value.includes("SECRET_MARKER"),
    stableId: (layer, key, createdAt) => `${layer}:${key}:${createdAt}`,
    readEvents: (layer) => [...mock.events[layer]],
    withLayerLock: (_layer, _owner, fn) => {
      fence += 1;
      activeFence = fence;
      try {
        return fn(fence);
      } finally {
        activeFence = 0;
      }
    },
    appendEvent: (layer, value, token) => {
      if (token !== activeFence) throw new Error("stale_fencing_token");
      if (mock.failAppend) throw new Error("append_failed");
      mock.events[layer].push(value);
    },
    replaceEvents: (layer, values, token) => {
      if (token !== activeFence) throw new Error("stale_fencing_token");
      mock.events[layer] = [...values];
    },
    writeSessionEvent: (event) => {
      if (mock.failSessionEvent) throw new Error("session_event_failed");
      mock.sessionEvents.push(event);
    },
    writeOutput: (lines) => {
      mock.outputs.push(lines);
    },
  };
  return mock;
}

function takeoverMock(): MockDeps {
  const mock = mockDeps("2026-07-11T00:00:00.000Z");
  const result = writeMemoryV2(
    {
      layer: "takeover",
      key: "next",
      body: "continue",
      type: "state",
      expiresAt: "2026-07-12T00:00:00.000Z",
    },
    mock,
  );
  if (!result.ok) throw new Error(result.reason);
  return mock;
}

function entry(overrides: Partial<MemoryEntryV2> = {}): MemoryEntryV2 {
  return {
    schemaVersion: 2,
    id: "e",
    layer: "harness",
    key: "k",
    body: "body",
    type: "reference",
    provenance: { planId: null, sessionId: null, runtime: "system", origin: "test" },
    lifecycle: { state: "active", expiresAt: null, consumedAt: null, consumedBy: null },
    links: [],
    supersedes: null,
    createdAt: "2026-07-11T00:00:00.000Z",
    ...overrides,
  };
}

function legacyEntry(id: string, supersedes: string | null, createdAt: string) {
  return { id, layer: "harness", key: "k", body: "legacy", supersedes, createdAt };
}

function runBunChild(script: string, root: string, id: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn("bun", ["-e", script], {
      cwd: process.cwd(),
      env: { ...process.env, MEMORY_V2_ROOT: root, MEMORY_V2_ID: id },
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stderr = "";
    child.stderr.setEncoding("utf8");
    child.stderr.on("data", (chunk) => {
      stderr += String(chunk);
    });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`memory v2 child failed (${String(code)}): ${stderr}`));
    });
  });
}

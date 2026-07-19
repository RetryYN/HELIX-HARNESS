import { spawn, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  appendFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
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
  retireMemory,
  surfaceMemoryV2,
  validateMemoryEntry,
  writeAllBytes,
  writeMemoryV2,
} from "../../src/memory/memory-v2";

describe("memory structure v2 (PLAN-L7-407)", () => {
  // Additive retirement contract: PLAN-L7-458-harness-memory-canonical-retirement.
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
        { operationId: "invalid-type", layer: "takeover", key: "x", body: "x", type: "feedback" },
        now,
        () => false,
      ),
    ).toMatchObject({ ok: false, reason: "takeover_type_not_allowed", field: "type" });
    expect(
      validateMemoryEntry(
        { operationId: "missing-expiry", layer: "takeover", key: "x", body: "x", type: "state" },
        now,
        () => false,
      ),
    ).toMatchObject({ ok: false, reason: "takeover_expiry_required", field: "expiresAt" });
  });

  it("U-MEMV2-002b: body/metadata secrets and malformed/duplicate links fail closed", () => {
    const now = "2026-07-11T00:00:00.000Z";
    const secret = (value: string) => value.includes("SECRET_MARKER");
    expect(
      validateMemoryEntry(
        { operationId: "secret-body", layer: "harness", key: "x", body: "SECRET_MARKER" },
        now,
        secret,
      ),
    ).toMatchObject({ ok: false, reason: "secret_like" });
    expect(
      validateMemoryEntry(
        {
          layer: "harness",
          operationId: "secret-meta",
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
        {
          operationId: "links",
          layer: "harness",
          key: "x",
          body: "ok",
          links: ["harness:a", "harness:a"],
        },
        now,
        secret,
      ),
    ).toMatchObject({ ok: false, reason: "duplicate_link" });
    expect(resolveMemoryView([entry({ links: ["project:missing"] })], now).unresolvedLinks).toEqual(
      [{ entryId: "e", link: "project:missing" }],
    );
    expect(normalizeMemoryEntry({ ...entry(), links: ["bad"] })).toEqual({
      ok: false,
      reason: "schema_invalid",
    });
    expect(normalizeMemoryEntry({ ...entry(), body: "sk-1234567890abcdef" })).toEqual({
      ok: false,
      reason: "schema_invalid",
    });
    expect(
      normalizeMemoryEntry({
        ...entry({ layer: "takeover", type: "state" }),
        lifecycle: {
          state: "active",
          expiresAt: "not-a-date",
          consumedAt: null,
          consumedBy: null,
        },
      }),
    ).toEqual({ ok: false, reason: "schema_invalid" });
    expect(normalizeMemoryEntry({ ...entry(), createdAt: "not-a-date" })).toEqual({
      ok: false,
      reason: "schema_invalid",
    });
    expect(normalizeMemoryEntry({ ...entry(), createdAt: "2026-07-11" })).toEqual({
      ok: false,
      reason: "schema_invalid",
    });
    expect(normalizeMemoryEntry({ ...entry(), createdAt: "2026-02-30T00:00:00.000Z" })).toEqual({
      ok: false,
      reason: "schema_invalid",
    });
    expect(
      normalizeMemoryEntry({
        ...entry({ layer: "takeover", type: "state" }),
        lifecycle: {
          state: "active",
          expiresAt: "2026-07-19T00:00:00.000Z",
          consumedAt: null,
          consumedBy: null,
        },
      }),
    ).toEqual({ ok: false, reason: "schema_invalid" });
  });

  it("U-MEMV2-003: compactMemoryV2 preserves observations and serializes a concurrent writer", async () => {
    root = mkdtempSync(join(tmpdir(), "helix-memv2-compact-"));
    const clock = { now: "2026-07-11T00:00:00.000Z" };
    const deps = nodeMemoryV2Deps({ root, now: () => clock.now });
    expect(
      writeMemoryV2({ operationId: "old", layer: "harness", key: "k", body: "old" }, deps).ok,
    ).toBe(true);
    clock.now = "2026-07-11T00:01:00.000Z";
    expect(
      writeMemoryV2({ operationId: "new", layer: "harness", key: "k", body: "new" }, deps).ok,
    ).toBe(true);
    const before = surfaceMemoryV2({ layers: ["harness"], now: clock.now }, deps);
    const result = compactMemoryV2("harness", deps);
    const after = surfaceMemoryV2({ layers: ["harness"], now: clock.now }, deps);
    expect(result).toMatchObject({ applied: true, kept: 1, removed: 1 });
    expect(after).toEqual(before);
    appendFileSync(join(root, ".helix", "memory", "harness.jsonl"), "not-json\n", "utf8");
    expect(compactMemoryV2("harness", deps)).toMatchObject({ applied: true, damaged: 1 });

    const writerScript = [
      'import { writeFileSync } from "node:fs";',
      'import { nodeMemoryV2Deps, writeMemoryV2 } from "./src/memory/memory-v2.ts";',
      "const root = process.env.MEMORY_V2_ROOT;",
      'if (!root) throw new Error("missing root");',
      'const deps = nodeMemoryV2Deps({ root, now: () => "2026-07-11T00:02:00.000Z" });',
      'const result = writeMemoryV2({ operationId:"concurrent", layer:"harness", key:"concurrent", body:"preserve" }, deps);',
      "if (!result.ok) throw new Error(result.reason);",
      'writeFileSync(process.env.WRITER_DONE, "done");',
    ].join("");
    const compactScript = [
      'import { existsSync, writeFileSync } from "node:fs";',
      'import { compactMemoryV2, nodeMemoryV2Deps } from "./src/memory/memory-v2.ts";',
      "const root = process.env.MEMORY_V2_ROOT;",
      'if (!root) throw new Error("missing root");',
      'const deps = nodeMemoryV2Deps({ root, now: () => "2026-07-11T00:02:00.000Z", onLockAcquired: () => { writeFileSync(process.env.HOLDER_READY, "ready"); while (!existsSync(process.env.HOLDER_RELEASE)) Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 20); } });',
      'compactMemoryV2("harness", deps);',
    ].join("");
    const holderReady = join(root, "holder.ready");
    const holderRelease = join(root, "holder.release");
    const writerDone = join(root, "writer.done");
    const compactPromise = runBunChild(compactScript, root, "unused", {
      HOLDER_READY: holderReady,
      HOLDER_RELEASE: holderRelease,
    });
    await waitForFile(holderReady);
    const writerPromise = runBunChild(writerScript, root, "unused", { WRITER_DONE: writerDone });
    await delay(100);
    expect(existsSync(writerDone)).toBe(false);
    writeFileSync(holderRelease, "release", "utf8");
    await Promise.all([compactPromise, writerPromise]);
    expect(
      resolveMemoryView(
        deps.readEvents("harness"),
        "2026-07-11T00:03:00.000Z",
        "harness",
      ).activeEntries.map((event) => event.key),
    ).toContain("concurrent");
  });

  it("U-MEMV2-004a: takeover enforces seven-day expiry and materializes one stable expiry tombstone", () => {
    const mock = mockDeps("2026-07-11T00:00:00.000Z");
    const exact = "2026-07-18T00:00:00.000Z";
    expect(
      writeMemoryV2(
        {
          operationId: "next",
          layer: "takeover",
          key: "next",
          body: "continue",
          type: "state",
          expiresAt: exact,
        },
        mock,
      ).ok,
    ).toBe(true);
    mock.clock = exact;
    expect(expireMemory("takeover", exact, mock)).toEqual([
      { id: "takeover:next:op:next", reason: "expired" },
    ]);
    expect(expireMemory("takeover", exact, mock)).toEqual([]);
    expect(
      mock.events.takeover.filter((event) => event.lifecycle.state === "expired"),
    ).toHaveLength(1);

    const superseded = mockDeps("2026-07-11T00:00:00.000Z");
    const first = writeMemoryV2(
      {
        operationId: "same-old",
        layer: "takeover",
        key: "same",
        body: "old",
        type: "state",
        expiresAt: exact,
      },
      superseded,
    );
    superseded.clock = "2026-07-11T00:01:00.000Z";
    const second = writeMemoryV2(
      {
        operationId: "same-new",
        layer: "takeover",
        key: "same",
        body: "new",
        type: "state",
        expiresAt: exact,
      },
      superseded,
    );
    if (!first.ok || !second.ok) throw new Error("takeover fixture write failed");
    superseded.clock = exact;
    expect(expireMemory("takeover", exact, superseded)).toEqual([
      { id: second.entry.id, reason: "expired" },
    ]);
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

    root = mkdtempSync(join(tmpdir(), "helix-memv2-deliver-cli-"));
    const cliPath = join(process.cwd(), "src", "cli.ts");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const write = spawnSync(
      "node",
      [
        cliPath,
        "memory",
        "write",
        "takeover",
        "next",
        "continue",
        "--type",
        "state",
        "--expires-at",
        expiresAt,
      ],
      { cwd: root, encoding: "utf8" },
    );
    expect(write.status, write.stderr).toBe(0);
    const deliver = spawnSync(
      "npx",
      ["--no-install", "tsx", cliPath, "memory", "deliver", "--consumer", "test"],
      {
        cwd: root,
        encoding: "utf8",
      },
    );
    expect(deliver.status, deliver.stderr).toBe(0);
    expect(deliver.stdout).toContain('"status":"delivered"');
    const surface = spawnSync(
      "node",
      [cliPath, "memory", "surface-v2", "--layer", "takeover", "--json"],
      { cwd: root, encoding: "utf8" },
    );
    expect(surface.status, surface.stderr).toBe(0);
    expect(JSON.parse(surface.stdout).selectedIds).toEqual([]);
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
    const expired = takeoverMock();
    const expiredId = expired.events.takeover[0]?.id ?? "missing";
    expired.clock = "2026-07-12T00:00:00.000Z";
    expireMemory("takeover", expired.clock, expired);
    expect(consumeTakeover([expiredId], "c", expired)).toEqual([
      { id: expiredId, reason: "expired" },
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
        operationId: "cross-process",
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

  it("U-MEMV2-005c: canonicalized harness memory retires idempotently without using takeover consume", () => {
    const mock = mockDeps("2026-07-11T00:00:00.000Z");
    mock.events.harness.push(entry({ id: "harness-rule", layer: "harness" }));
    mock.clock = "2026-07-11T00:01:00.000Z";
    expect(
      retireMemory(
        {
          layer: "harness",
          ids: ["harness-rule"],
          consumerId: "reconciler",
          authorityId: "memory-reconciliation-2026-07-19",
        },
        mock,
      ),
    ).toEqual([{ id: "harness-rule", reason: "consumed" }]);
    expect(resolveMemoryView(mock.events.harness, mock.clock, "harness").activeEntries).toEqual([]);
    expect(
      retireMemory(
        {
          layer: "harness",
          ids: ["harness-rule"],
          consumerId: "reconciler",
          authorityId: "memory-reconciliation-2026-07-19",
        },
        mock,
      ),
    ).toEqual([{ id: "harness-rule", reason: "already_consumed" }]);
    expect(mock.events.harness).toContainEqual(
      expect.objectContaining({
        id: "memory-consumed:harness-rule",
        lifecycle: expect.objectContaining({ state: "consumed", consumedBy: "reconciler" }),
      }),
    );
    mock.events.harness = mock.events.harness.filter((item) => item.lifecycle.state !== "active");
    expect(
      retireMemory(
        {
          layer: "harness",
          ids: ["harness-rule"],
          consumerId: "reconciler",
          authorityId: "memory-reconciliation-2026-07-19",
        },
        mock,
      ),
    ).toEqual([{ id: "harness-rule", reason: "already_consumed" }]);
  });

  it("U-MEMV2-005f: retirement authority is fail-closed, rechecked under lock, and preserves partial results", () => {
    const unauthorized = mockDeps("2026-07-11T00:00:00.000Z");
    unauthorized.events.harness.push(entry({ id: "a", key: "a" }));
    unauthorized.authorityValid = false;
    const input = {
      layer: "harness" as const,
      ids: ["a"],
      consumerId: "reconciler",
      authorityId: "memory-reconciliation-2026-07-19",
    };
    expect(retireMemory(input, unauthorized)).toEqual([{ id: "a", reason: "unauthorized" }]);
    expect(unauthorized.events.harness).toHaveLength(1);

    const stale = mockDeps("2026-07-11T00:00:00.000Z");
    stale.events.harness.push(entry({ id: "a", key: "a" }));
    stale.verifyRetirementAuthority = () => {
      stale.authorityChecks += 1;
      return stale.authorityChecks === 1;
    };
    expect(retireMemory(input, stale)).toEqual([{ id: "a", reason: "unauthorized" }]);
    expect(stale.events.harness).toHaveLength(1);

    const partial = mockDeps("2026-07-11T00:00:00.000Z");
    partial.events.harness.push(
      entry({ id: "a", key: "a" }),
      entry({ id: "b", key: "b" }),
      entry({ id: "c", key: "c" }),
    );
    partial.failAppendAfter = 4;
    expect(retireMemory({ ...input, ids: ["a", "b", "c"] }, partial)).toEqual([
      { id: "a", reason: "consumed" },
      { id: "b", reason: "persist_failed" },
      { id: "c", reason: "persist_failed" },
    ]);
  });

  it("U-MEMV2-005g: production authority binds its digest and rejects repo-external symlink targets", () => {
    root = mkdtempSync(join(tmpdir(), "helix-memory-authority-"));
    const outside = mkdtempSync(join(tmpdir(), "helix-memory-authority-outside-"));
    try {
      const targetPath = join(root, "docs", "canonical.md");
      const authorityDir = join(root, "docs", "governance", "generated");
      mkdirSync(join(root, "docs"), { recursive: true });
      mkdirSync(authorityDir, { recursive: true });
      writeFileSync(join(outside, "canonical.md"), "authority-key\n", "utf8");
      symlinkSync(join(outside, "canonical.md"), targetPath);
      const entries = [
        {
          memory_id: "harness:authority-key:op:test",
          key: "authority-key",
          targets: [
            {
              path: "docs/canonical.md",
              sha256: `sha256:${createHash("sha256").update("authority-key\n").digest("hex")}`,
            },
          ],
        },
      ];
      const payload = {
        schema_version: 1,
        source_revision: "test-v1",
        consumer_id: "reconciler",
        layer: "harness",
        entries,
      };
      const authorityId = `sha256:${createHash("sha256").update(JSON.stringify(payload)).digest("hex")}`;
      writeFileSync(
        join(authorityDir, "harness-memory-retirement-authority.json"),
        `${JSON.stringify({
          schema_version: 1,
          source_revision: payload.source_revision,
          authority_id: authorityId,
          consumer_id: payload.consumer_id,
          layer: payload.layer,
          entries,
        })}\n`,
        "utf8",
      );
      const deps = nodeMemoryV2Deps({ root, now: () => "2026-07-11T00:00:00.000Z" });
      const written = writeMemoryV2(
        { operationId: "test", layer: "harness", key: "authority-key", body: "body" },
        deps,
      );
      expect(written.ok).toBe(true);
      expect(
        retireMemory(
          {
            layer: "harness",
            ids: ["harness:authority-key:op:test"],
            consumerId: "reconciler",
            authorityId,
          },
          deps,
        ),
      ).toEqual([{ id: "harness:authority-key:op:test", reason: "unauthorized" }]);
      rmSync(targetPath);
      writeFileSync(targetPath, "authority-key\n", "utf8");
      expect(
        retireMemory(
          {
            layer: "harness",
            ids: ["harness:authority-key:op:test"],
            consumerId: "reconciler",
            authorityId,
          },
          deps,
        ),
      ).toEqual([{ id: "harness:authority-key:op:test", reason: "consumed" }]);
    } finally {
      rmSync(outside, { recursive: true, force: true });
    }
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
    const deduped = surfaceMemoryV2({ layers: ["harness", "harness"], maxEntries: 200 }, mock);
    expect(new Set(deduped.selectedIds).size).toBe(deduped.selectedIds.length);
    expect(() =>
      surfaceMemoryV2({ layers: ["invalid" as unknown as MemoryLayerV2] }, mock),
    ).toThrow(/invalid_layers/);
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
    expect(() => surfaceMemoryV2({ maxChars: 1 }, mock)).toThrow(
      /maxChars_too_small_for_breadcrumb/,
    );
    expect(() => surfaceMemoryV2({ perTypeMin: 0 }, mock)).toThrow(/invalid_perTypeMin/);
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
    const result = writeMemoryV2(
      { operationId: "event", layer: "harness", key: "k", body: "private body" },
      mock,
    );
    expect(result.ok).toBe(true);
    expect(mock.sessionEvents).toHaveLength(1);
    expect(JSON.stringify(mock.sessionEvents)).not.toContain("private body");

    root = mkdtempSync(join(tmpdir(), "helix-memv2-cli-"));
    const cli = spawnSync(
      "node",
      [
        join(process.cwd(), "src", "cli.ts"),
        "memory",
        "write",
        "harness",
        "cli-key",
        "cli body",
        "--type",
        "constraint",
      ],
      { cwd: root, encoding: "utf8" },
    );
    expect(cli.status, cli.stderr).toBe(0);
    const firstPayload = JSON.parse(cli.stdout) as { entry: MemoryEntryV2 };
    expect(firstPayload).toMatchObject({ ok: true, entry: { layer: "harness" } });
    const replay = spawnSync(
      "node",
      [
        join(process.cwd(), "src", "cli.ts"),
        "memory",
        "write",
        "harness",
        "cli-key",
        "cli body",
        "--type",
        "constraint",
      ],
      { cwd: root, encoding: "utf8" },
    );
    expect(replay.status, replay.stderr).toBe(0);
    expect(JSON.parse(replay.stdout)).toMatchObject({ diagnostics: ["idempotent_replay"] });
    expect(
      readFileSync(join(root, ".helix", "memory", "harness.jsonl"), "utf8")
        .trim()
        .split("\n"),
    ).toHaveLength(1);
    const sessionLog = readFileSync(
      join(root, ".helix", "logs", "session", "cli-memory.jsonl"),
      "utf8",
    );
    expect(sessionLog).toContain('"event_type":"memory_write"');
    expect(sessionLog).not.toContain("cli body");
    expect(
      sessionLog
        .trim()
        .split("\n")
        .filter((line) => line.includes('"event_type":"memory_write"')),
    ).toHaveLength(1);

    const update = spawnSync(
      "node",
      [
        join(process.cwd(), "src", "cli.ts"),
        "memory",
        "write",
        "harness",
        "cli-key",
        "different body",
        "--type",
        "constraint",
      ],
      { cwd: root, encoding: "utf8" },
    );
    expect(update.status, update.stderr).toBe(0);
    const updatePayload = JSON.parse(update.stdout) as { entry: MemoryEntryV2 };
    const restore = spawnSync(
      "node",
      [
        join(process.cwd(), "src", "cli.ts"),
        "memory",
        "write",
        "harness",
        "cli-key",
        "cli body",
        "--type",
        "constraint",
      ],
      { cwd: root, encoding: "utf8" },
    );
    expect(restore.status, restore.stderr).toBe(0);
    const restorePayload = JSON.parse(restore.stdout) as { entry: MemoryEntryV2 };
    expect(restorePayload.entry.id).not.toBe(firstPayload.entry.id);
    expect(restorePayload.entry.supersedes).toBe(updatePayload.entry.id);

    const conflicting = spawnSync(
      "node",
      [
        join(process.cwd(), "src", "cli.ts"),
        "memory",
        "write",
        "harness",
        "conflict",
        "body",
        "--v2",
        "--legacy-v1",
      ],
      { cwd: root, encoding: "utf8" },
    );
    expect(conflicting.status).toBe(1);
    expect(conflicting.stderr).toContain("mutually exclusive");
  });

  it("U-MEMV2-008b: event failure/retry preserves one durable idempotent event", async () => {
    const mock = mockDeps("2026-07-11T00:00:00.000Z");
    mock.failSessionEvent = true;
    expect(
      writeMemoryV2({ operationId: "ok", layer: "harness", key: "k", body: "ok" }, mock),
    ).toMatchObject({
      ok: true,
      diagnostics: ["session_event_persist_failed"],
    });
    const count = mock.sessionEvents.length;
    expect(
      writeMemoryV2(
        { operationId: "bad", layer: "harness", key: "bad", body: "SECRET_MARKER" },
        mock,
      ).ok,
    ).toBe(false);
    expect(
      writeMemoryV2(
        { operationId: "dry", layer: "harness", key: "dry", body: "ok", dryRun: true },
        mock,
      ).ok,
    ).toBe(false);
    expect(mock.sessionEvents).toHaveLength(count);
    mock.failSessionEvent = false;
    expect(
      writeMemoryV2({ operationId: "ok", layer: "harness", key: "k", body: "ok" }, mock),
    ).toMatchObject({ ok: true, diagnostics: ["idempotent_replay"] });
    expect(mock.sessionEvents).toHaveLength(1);

    const recovery = mockDeps("2026-07-11T00:00:00.000Z");
    recovery.failAfterMutation = true;
    expect(
      writeMemoryV2(
        { operationId: "recover", layer: "harness", key: "recover", body: "once" },
        recovery,
      ),
    ).toMatchObject({ ok: true, diagnostics: ["coordination_commit_unknown_recovered"] });
    recovery.failAfterMutation = false;
    expect(
      writeMemoryV2(
        { operationId: "recover", layer: "harness", key: "recover", body: "once" },
        recovery,
      ),
    ).toMatchObject({ ok: true, diagnostics: ["idempotent_replay"] });
    expect(recovery.events.harness).toHaveLength(1);

    let writeCalls = 0;
    writeAllBytes(1, new Uint8Array([1, 2, 3, 4, 5]), (_fd, _bytes, _offset, length) => {
      writeCalls += 1;
      return Math.min(2, length);
    });
    expect(writeCalls).toBe(3);
    expect(() => writeAllBytes(1, new Uint8Array([1]), () => 0)).toThrow(/short_write/);

    root = mkdtempSync(join(tmpdir(), "helix-memv2-event-failure-"));
    mkdirSync(join(root, ".helix", "logs"), { recursive: true });
    writeFileSync(join(root, ".helix", "logs", "session"), "not-a-directory", "utf8");
    const cliPath = join(process.cwd(), "src", "cli.ts");
    const failedLog = spawnSync(
      "npx",
      ["--no-install", "tsx", cliPath, "memory", "write", "harness", "failure", "body"],
      {
        cwd: root,
        encoding: "utf8",
      },
    );
    expect(failedLog.status, failedLog.stderr).toBe(0);
    expect(JSON.parse(failedLog.stdout)).toMatchObject({
      ok: true,
      diagnostics: ["session_event_persist_failed"],
    });

    rmSync(root, { recursive: true, force: true });
    root = mkdtempSync(join(tmpdir(), "helix-memv2-event-race-"));
    const eventScript = [
      'import { nodeDeps, recordEventResult } from "./src/runtime/session-log.ts";',
      "const root = process.env.MEMORY_V2_ROOT;",
      'if (!root) throw new Error("missing root");',
      "const deps = nodeDeps(root, () => null);",
      'const result = recordEventResult({event_id:"memory-write:race",ts:"T",session_id:"race",plan_id:null,event_type:"memory_write",outcome:"ok"}, deps);',
      "if (!result.ok) throw new Error(result.reason);",
    ].join("");
    await Promise.all([
      runBunChild(eventScript, root, "unused"),
      runBunChild(eventScript, root, "unused"),
    ]);
    expect(
      readFileSync(join(root, ".helix", "logs", "session", "race.jsonl"), "utf8")
        .trim()
        .split("\n"),
    ).toHaveLength(1);
  });
});

interface MockDeps extends MemoryDepsV2 {
  clock: string;
  events: Record<MemoryLayerV2, MemoryEntryV2[]>;
  sessionEvents: unknown[];
  outputs: string[][];
  failAppend: boolean;
  failSessionEvent: boolean;
  failAfterMutation: boolean;
  authorityValid: boolean;
  authorityChecks: number;
  failAppendAfter: number | null;
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
    failAfterMutation: false,
    authorityValid: true,
    authorityChecks: 0,
    failAppendAfter: null,
    now: () => mock.clock,
    isSecret: (value) => value.includes("SECRET_MARKER"),
    stableId: (layer, key, createdAt) => `${layer}:${key}:${createdAt}`,
    readEvents: (layer) => [...mock.events[layer]],
    verifyRetirementAuthority: () => {
      mock.authorityChecks += 1;
      return mock.authorityValid;
    },
    withLayerLock: (_layer, _owner, fn) => {
      fence += 1;
      activeFence = fence;
      try {
        const result = fn(fence);
        if (mock.failAfterMutation) throw new Error("coordination_commit_failed");
        return result;
      } finally {
        activeFence = 0;
      }
    },
    appendEvent: (layer, value, token) => {
      if (token !== activeFence) throw new Error("stale_fencing_token");
      if (mock.failAppend) throw new Error("append_failed");
      if (mock.failAppendAfter !== null && mock.events[layer].length >= mock.failAppendAfter)
        throw new Error("append_failed");
      mock.events[layer].push(value);
    },
    replaceEvents: (layer, values, token) => {
      if (token !== activeFence) throw new Error("stale_fencing_token");
      mock.events[layer] = [...values];
    },
    writeSessionEvent: (event) => {
      if (mock.failSessionEvent) throw new Error("session_event_failed");
      if (
        mock.sessionEvents.some(
          (existing) =>
            typeof existing === "object" &&
            existing !== null &&
            "eventId" in existing &&
            existing.eventId === event.eventId,
        )
      ) {
        return;
      }
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
      operationId: "takeover-next",
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

function runBunChild(
  script: string,
  root: string,
  id: string,
  extraEnv: Record<string, string> = {},
): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn("node", ["-e", script], {
      cwd: process.cwd(),
      env: { ...process.env, MEMORY_V2_ROOT: root, MEMORY_V2_ID: id, ...extraEnv },
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

async function waitForFile(path: string): Promise<void> {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (existsSync(path)) return;
    await delay(20);
  }
  throw new Error(`timed out waiting for ${path}`);
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import type { MemoryEntryV2 } from "../src/memory/memory-v2";
import {
  publishClaudeInboxEntry,
  renderClaudeWakeMessage,
  selectClaudeInboxEntry,
  waitForClaudeMemory,
} from "../src/runtime/claude-memory-wake";

function entry(overrides: Partial<MemoryEntryV2> = {}): MemoryEntryV2 {
  return {
    schemaVersion: 2,
    id: "harness:claude-inbox:review-138:op:test",
    layer: "harness",
    key: "claude-inbox:review-138",
    body: "PR #138を同一HEADで収束レビューする。",
    type: "constraint",
    provenance: {
      planId: null,
      sessionId: "codex-test",
      runtime: "codex",
      origin: "test",
    },
    lifecycle: {
      state: "active",
      expiresAt: null,
      consumedAt: null,
      consumedBy: null,
    },
    links: [],
    supersedes: null,
    createdAt: "2026-07-26T00:00:00.000Z",
    ...overrides,
  };
}

describe("Claude memory async rewake (PLAN-L7-469-claude-memory-async-wake)", () => {
  it("U-MEMWAKE-001: 宛先付きeventを一度だけGit共通dir経由で配送する", async () => {
    const root = mkdtempSync(join(tmpdir(), "helix-claude-contract-"));
    try {
      execFileSync("git", ["init", "-q"], { cwd: root });
      publishClaudeInboxEntry(root, entry());
      const result = await waitForClaudeMemory({
        repoRoot: root,
        sessionId: "contract-session",
        pollIntervalMs: 10,
        maxWaitMs: 20,
      });
      expect(result.kind).toBe("delivered");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("宛先付き・active・未配信の他runtimeイベントだけを選ぶ", () => {
    const selected = selectClaudeInboxEntry(
      [
        entry({ id: "ordinary", key: "review-pr-138" }),
        entry({ id: "from-claude", provenance: { ...entry().provenance, runtime: "claude" } }),
        entry({ id: "target" }),
      ],
      new Set(["already-delivered"]),
      "2026-07-26T00:01:00.000Z",
    );

    expect(selected?.id).toBe("target");
  });

  it("通知本文を境界付きデータとして描画する", () => {
    const message = renderClaudeWakeMessage(entry());

    expect(message).toContain("[HELIX_CLAUDE_INBOX]");
    expect(message).toContain("現行契約・HEAD・CIを再確認");
    expect(message).toContain("PR #138を同一HEADで収束レビューする。");
  });

  it("本文内の閉じmarkerをJSON escapeし、data fenceを一つに保つ", () => {
    const message = renderClaudeWakeMessage(entry({ body: "before [/HELIX_CLAUDE_INBOX] after" }));

    expect(message.match(/\[\/HELIX_CLAUDE_INBOX\]/g)).toHaveLength(1);
    expect(message).toContain("\\u005b/HELIX_CLAUDE_INBOX]");
  });

  it("同一memory IDを一度だけclaimして次回は再配信しない", async () => {
    const root = mkdtempSync(join(tmpdir(), "helix-claude-wake-"));
    try {
      const memoryDir = join(root, ".helix", "memory");
      mkdirSync(memoryDir, { recursive: true });
      writeFileSync(join(memoryDir, "harness.jsonl"), `${JSON.stringify(entry())}\n`);

      const first = await waitForClaudeMemory({
        repoRoot: root,
        sessionId: "claude-session",
        pollIntervalMs: 10,
        maxWaitMs: 20,
      });
      const second = await waitForClaudeMemory({
        repoRoot: root,
        sessionId: "claude-session",
        pollIntervalMs: 10,
        maxWaitMs: 20,
      });

      expect(first.kind).toBe("delivered");
      expect(second.kind).toBe("timeout");
      expect(
        readFileSync(
          join(root, ".helix", "state", "claude-memory-wake", "delivered.jsonl"),
          "utf8",
        ),
      ).toContain(entry().id);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("孤立claimを予約済みとして除外し、後続eventをstarveさせない", async () => {
    const root = mkdtempSync(join(tmpdir(), "helix-claude-orphan-claim-"));
    try {
      execFileSync("git", ["init", "-q"], { cwd: root });
      const first = entry({
        id: "harness:claude-inbox:first:op:first",
        key: "claude-inbox:first",
      });
      const second = entry({
        id: "harness:claude-inbox:second:op:second",
        key: "claude-inbox:second",
        createdAt: "2026-07-26T00:00:01.000Z",
      });
      const firstPath = publishClaudeInboxEntry(root, first);
      publishClaudeInboxEntry(root, second);
      const stateDir = join(firstPath, "..", "..");
      writeFileSync(
        join(stateDir, "harness_claude-inbox_first_op_first.claim"),
        `${JSON.stringify({ id: first.id, sessionId: "crashed", deliveredAt: first.createdAt })}\n`,
      );

      const result = await waitForClaudeMemory({
        repoRoot: root,
        sessionId: "recovery-session",
        pollIntervalMs: 10,
        maxWaitMs: 20,
      });

      expect(result.kind).toBe("delivered");
      expect(result.entry?.id).toBe(second.id);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it.each([
    ["0 byte", ""],
    ["truncated", '{"id":"harness:claude-inbox:first'],
  ])("破損claim (%s) を局所skipし、後続eventを配送する", async (_case, claimBody) => {
    const root = mkdtempSync(join(tmpdir(), "helix-claude-damaged-claim-"));
    try {
      execFileSync("git", ["init", "-q"], { cwd: root });
      const first = entry({
        id: "harness:claude-inbox:first:op:first",
        key: "claude-inbox:first",
      });
      const second = entry({
        id: "harness:claude-inbox:second:op:second",
        key: "claude-inbox:second",
        createdAt: "2026-07-26T00:00:01.000Z",
      });
      const firstPath = publishClaudeInboxEntry(root, first);
      publishClaudeInboxEntry(root, second);
      writeFileSync(
        join(firstPath, "..", "..", "harness_claude-inbox_first_op_first.claim"),
        claimBody,
      );

      const result = await waitForClaudeMemory({
        repoRoot: root,
        sessionId: "damaged-recovery-session",
        pollIntervalMs: 10,
        maxWaitMs: 20,
      });

      expect(result.kind).toBe("delivered");
      expect(result.entry?.id).toBe(second.id);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("Git共通dirへ配送投影し、別worktreeのwatcherから読める形にする", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-claude-spool-"));
    try {
      execFileSync("git", ["init", "-q"], { cwd: root });
      const path = publishClaudeInboxEntry(root, entry());

      expect(path).toContain(join(".git", "helix-runtime", "claude-memory-wake", "inbox"));
      expect(JSON.parse(readFileSync(path, "utf8"))).toMatchObject({
        id: entry().id,
        key: "claude-inbox:review-138",
      });
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});

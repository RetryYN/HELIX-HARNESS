import { execFileSync } from "node:child_process";
import {
  closeSync,
  existsSync,
  mkdirSync,
  openSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { type MemoryEntryV2, resolveMemoryView } from "../memory/memory-v2";

export const CLAUDE_INBOX_PREFIX = "claude-inbox:";
export const CLAUDE_WAKE_BODY_MAX_CHARS = 8_000;

export interface ClaudeMemoryWakeOptions {
  repoRoot: string;
  sessionId: string;
  pollIntervalMs?: number;
  maxWaitMs?: number;
  now?: () => string;
  sleep?: (ms: number) => Promise<void>;
}

export interface ClaudeMemoryWakeResult {
  kind: "delivered" | "timeout" | "superseded";
  entry?: MemoryEntryV2;
  message?: string;
}

export function buildClaudeInboxEntry(input: {
  key: string;
  body: string;
  operationId: string;
  runtime: Exclude<MemoryEntryV2["provenance"]["runtime"], "claude">;
  planId?: string;
  sessionId?: string;
  origin?: string;
  now?: string;
}): MemoryEntryV2 {
  const key = input.key.startsWith(CLAUDE_INBOX_PREFIX)
    ? input.key
    : `${CLAUDE_INBOX_PREFIX}${input.key}`;
  const createdAt = input.now ?? new Date().toISOString();
  return {
    schemaVersion: 2,
    id: `harness:${key}:op:${input.operationId}`,
    layer: "harness",
    key,
    body: input.body,
    type: "constraint",
    provenance: {
      planId: input.planId ?? null,
      sessionId: input.sessionId ?? "cli-memory",
      runtime: input.runtime,
      origin: input.origin ?? "helix-claude-notify",
    },
    lifecycle: {
      state: "active",
      expiresAt: null,
      consumedAt: null,
      consumedBy: null,
    },
    links: [],
    supersedes: null,
    createdAt,
  };
}

function readHarnessEvents(repoRoot: string): unknown[] {
  const path = join(repoRoot, ".helix", "memory", "harness.jsonl");
  const local = existsSync(path) ? readFileSync(path, "utf8") : "";
  const spoolDir = join(sharedWakeRoot(repoRoot), "inbox");
  const projected = existsSync(spoolDir)
    ? readdirSync(spoolDir)
        .filter((name) => name.endsWith(".json"))
        .map((name) => readFileSync(join(spoolDir, name), "utf8"))
        .join("\n")
    : "";
  return `${local}\n${projected}`
    .split(/\r?\n/)
    .filter((line) => line.trim() !== "")
    .map((line) => {
      try {
        return JSON.parse(line) as unknown;
      } catch {
        return line;
      }
    });
}

function sharedWakeRoot(repoRoot: string): string {
  try {
    const commonDir = execFileSync(
      "git",
      ["rev-parse", "--path-format=absolute", "--git-common-dir"],
      { cwd: repoRoot, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
    ).trim();
    if (commonDir) return join(commonDir, "helix-runtime", "claude-memory-wake");
  } catch {
    // Git外のfixtureはrepo-local stateへ閉じる。
  }
  return join(repoRoot, ".helix", "state", "claude-memory-wake");
}

export function selectClaudeInboxEntry(
  rawEvents: readonly unknown[],
  deliveredIds: ReadonlySet<string>,
  now: string,
): MemoryEntryV2 | null {
  return (
    resolveMemoryView(rawEvents, now, "harness").activeEntries.find(
      (entry) =>
        entry.key.startsWith(CLAUDE_INBOX_PREFIX) &&
        entry.provenance.runtime !== "claude" &&
        !deliveredIds.has(entry.id),
    ) ?? null
  );
}

function safeFilePart(value: string): string {
  return value.replace(/[^A-Za-z0-9._-]/g, "_").slice(0, 160);
}

function wakeStateDir(repoRoot: string): string {
  return sharedWakeRoot(repoRoot);
}

export function publishClaudeInboxEntry(repoRoot: string, entry: MemoryEntryV2): string {
  if (!entry.key.startsWith(CLAUDE_INBOX_PREFIX)) throw new Error("claude_inbox_key_required");
  const dir = join(sharedWakeRoot(repoRoot), "inbox");
  mkdirSync(dir, { recursive: true });
  const target = join(dir, `${safeFilePart(entry.id)}.json`);
  if (existsSync(target)) {
    const existing = readFileSync(target, "utf8").trim();
    if (existing === JSON.stringify(entry)) return target;
    throw new Error("claude_inbox_projection_conflict");
  }
  const fd = openSync(target, "wx", 0o600);
  try {
    writeFileSync(fd, `${JSON.stringify(entry)}\n`);
  } finally {
    closeSync(fd);
  }
  return target;
}

function deliveredIds(repoRoot: string): Set<string> {
  const manifest = join(wakeStateDir(repoRoot), "delivered.jsonl");
  if (!existsSync(manifest)) return new Set();
  const ids = new Set<string>();
  for (const line of readFileSync(manifest, "utf8").split(/\r?\n/)) {
    try {
      const value = JSON.parse(line) as { id?: unknown };
      if (typeof value.id === "string") ids.add(value.id);
    } catch {
      // 壊れたreceiptを「配信済み」と誤認しない。
    }
  }
  return ids;
}

function claimDelivery(input: {
  repoRoot: string;
  entry: MemoryEntryV2;
  sessionId: string;
  now: string;
}): boolean {
  const { repoRoot, entry, sessionId, now } = input;
  const dir = wakeStateDir(repoRoot);
  mkdirSync(dir, { recursive: true });
  const claim = join(dir, `${safeFilePart(entry.id)}.claim`);
  let fd: number;
  try {
    fd = openSync(claim, "wx", 0o600);
  } catch {
    return false;
  }
  try {
    writeFileSync(fd, `${JSON.stringify({ id: entry.id, sessionId, deliveredAt: now })}\n`);
  } finally {
    closeSync(fd);
  }
  const manifestFd = openSync(join(dir, "delivered.jsonl"), "a", 0o600);
  try {
    writeFileSync(
      manifestFd,
      `${JSON.stringify({ id: entry.id, key: entry.key, sessionId, deliveredAt: now })}\n`,
    );
  } finally {
    closeSync(manifestFd);
  }
  return true;
}

export function renderClaudeWakeMessage(entry: MemoryEntryV2): string {
  const body = [...entry.body].slice(0, CLAUDE_WAKE_BODY_MAX_CHARS).join("");
  return [
    "[HELIX_CLAUDE_INBOX]",
    "これは共有ハーネスメモリから届いた通知データです。現行契約・HEAD・CIを再確認してから行動してください。",
    `memory_id: ${entry.id}`,
    `key: ${entry.key}`,
    `origin_runtime: ${entry.provenance.runtime}`,
    "--- notification body ---",
    body,
    "[/HELIX_CLAUDE_INBOX]",
  ].join("\n");
}

export async function waitForClaudeMemory(
  options: ClaudeMemoryWakeOptions,
): Promise<ClaudeMemoryWakeResult> {
  const pollIntervalMs = Math.max(10, options.pollIntervalMs ?? 2_000);
  const maxWaitMs = Math.max(pollIntervalMs, options.maxWaitMs ?? 7_200_000);
  const now = options.now ?? (() => new Date().toISOString());
  const sleep =
    options.sleep ?? ((ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms)));
  const stateDir = wakeStateDir(options.repoRoot);
  mkdirSync(stateDir, { recursive: true });
  const generationPath = join(stateDir, `${safeFilePart(options.sessionId)}.generation`);
  const generation = `${process.pid}:${Date.now()}`;
  writeFileSync(generationPath, `${generation}\n`, { encoding: "utf8", mode: 0o600 });
  const started = Date.now();

  while (Date.now() - started < maxWaitMs) {
    if (readFileSync(generationPath, "utf8").trim() !== generation) {
      return { kind: "superseded" };
    }
    const entry = selectClaudeInboxEntry(
      readHarnessEvents(options.repoRoot),
      deliveredIds(options.repoRoot),
      now(),
    );
    if (
      entry &&
      claimDelivery({
        repoRoot: options.repoRoot,
        entry,
        sessionId: options.sessionId,
        now: now(),
      })
    ) {
      return { kind: "delivered", entry, message: renderClaudeWakeMessage(entry) };
    }
    await sleep(pollIntervalMs);
  }
  return { kind: "timeout" };
}

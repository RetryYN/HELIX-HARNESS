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
  resolvePrState?: (input: {
    repository: string;
    prNumber: number;
  }) => { state: "OPEN" | "CLOSED" | "MERGED"; headSha: string } | null;
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
  supersedes?: string | null;
  links?: MemoryEntryV2["links"];
  now?: string;
  /** publishClaudePrReviewRequest だけが設定する予約 namespace capability。 */
  measuredPrReviewRequest?: boolean;
}): MemoryEntryV2 {
  const key = input.key.startsWith(CLAUDE_INBOX_PREFIX)
    ? input.key
    : `${CLAUDE_INBOX_PREFIX}${input.key}`;
  const createdAt = input.now ?? new Date().toISOString();
  if (key.startsWith(`${CLAUDE_INBOX_PREFIX}pr:`) && input.measuredPrReviewRequest !== true) {
    throw new Error("measured_pr_review_dispatch_required");
  }
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
    links: input.links ?? [],
    supersedes: input.supersedes ?? null,
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

export function claudeMemoryRuntimeRoot(repoRoot: string): string {
  return sharedWakeRoot(repoRoot);
}

export function selectClaudeInboxEntry(
  rawEvents: readonly unknown[],
  deliveredIds: ReadonlySet<string>,
  now: string,
): MemoryEntryV2 | null {
  const candidates = resolveMemoryView(rawEvents, now, "harness").activeEntries.filter(
    (entry) =>
      entry.key.startsWith(CLAUDE_INBOX_PREFIX) &&
      entry.provenance.runtime !== "claude" &&
      !deliveredIds.has(entry.id),
  );
  const prReview = candidates.filter((entry) => entry.key.startsWith(`${CLAUDE_INBOX_PREFIX}pr:`));
  return prReview.at(-1) ?? candidates.at(-1) ?? null;
}

function projectedInboxEntries(repoRoot: string): MemoryEntryV2[] {
  return readHarnessEvents(repoRoot)
    .map((value) =>
      value &&
      typeof value === "object" &&
      (value as Partial<MemoryEntryV2>).schemaVersion === 2 &&
      typeof (value as Partial<MemoryEntryV2>).id === "string" &&
      typeof (value as Partial<MemoryEntryV2>).key === "string"
        ? (value as MemoryEntryV2)
        : undefined,
    )
    .filter((entry): entry is MemoryEntryV2 => entry !== undefined);
}

/**
 * review依頼のdispatchは、実測したauthoring runtimeでしか宛先を決められない。
 *
 * Claude著PRをClaude収束レーンへ回すと自己レビュー要求になり、受け手はCI完走まで待ってから
 * attestation gateに弾かれる（Issue #551の実測: PR #517で約20分のCIを空費した）。gateが
 * 最後の砦として機能してはいるが、dispatch層に独立性の判定が無いことは設計意図の欠落である。
 * mixedは寄与したcodex分をClaudeがレビューする必要があるため発行する（Issue #539のdual review）。
 *
 * Dispatch wire vocabulary. claude-pr-convergence 側の実測結果と構造的に同じ3値だが、
 * 同 module を type-only import しても coding-rules の依存graphでは循環になるため、
 * wake境界はこの小さいwire unionを自己所有する。
 */
export type DispatchAuthorRuntime = "claude" | "codex" | "mixed";

export function claudeReviewDispatchAllowed(authorRuntime: DispatchAuthorRuntime): boolean {
  return authorRuntime === "codex" || authorRuntime === "mixed";
}

/**
 * `claude-inbox:pr:` は authoring runtime を実測した PR review request 専用 namespace。
 * 汎用 memory publisher がこの namespace を名乗ると dispatch admission を迂回できるため、
 * publishClaudePrReviewRequest 以外の入口では fail-close する。
 */
export function publishClaudePrReviewRequest(
  repoRoot: string,
  input: {
    repository: string;
    prNumber: number;
    prUrl: string;
    headSha: string;
    baseBranch: string;
    authorRuntime: DispatchAuthorRuntime;
    planId?: string;
    sessionId?: string;
    now?: string;
  },
): { entry: MemoryEntryV2; deliveryPath: string } {
  if (!claudeReviewDispatchAllowed(input.authorRuntime)) {
    throw new Error("claude_self_review_request_rejected");
  }
  const key = `${CLAUDE_INBOX_PREFIX}pr:${input.repository}#${input.prNumber}`;
  const prior = projectedInboxEntries(repoRoot)
    .filter((entry) => entry.key === key)
    .sort((left, right) => left.createdAt.localeCompare(right.createdAt))
    .at(-1);
  const request = {
    schema_version: "helix-claude-pr-review-request.v1",
    repository: input.repository,
    pr_number: input.prNumber,
    pr_url: input.prUrl,
    requested_head: input.headSha,
    base_branch: input.baseBranch,
    measured_author_runtime: input.authorRuntime,
    convergence_policy: {
      blocker:
        "current behavior contract違反、correctness/security/data loss、必須CI/DB/oracle red、虚偽・過大claim",
      non_blocker: "Issueへ分離しcurrent PRを収束",
      merge: "current HEADの独立review receipt、CI、DB convergenceを再照合して明示merge",
    },
  };
  const entry = buildClaudeInboxEntry({
    key,
    body: [
      `measured_author_runtime: ${input.authorRuntime}`,
      input.authorRuntime === "mixed"
        ? "実装commitがcodexとclaudeで混在するPRです。codex著の寄与をClaude Code収束レーンでレビューしてください（claude著の寄与はCodex側のreceiptが必要です）。"
        : "codex著と実測されたPRをClaude Code収束レーンで処理してください。",
      "GitHubからcurrent PR HEADを再取得し、requested_headと異なる場合はcurrent HEADを正本にしてください。",
      "current HEADの必須CIがpendingまたはin_progressなら、同一turnでgh run watchを再試行しterminalまで待機してください。CI完了前に「監視中」とだけ報告してturnを終了してはいけません。",
      "review完了時はhelix github pr-review-receipt、merge時はhelix github pr-merge-reviewedを使用してください。",
      JSON.stringify(request),
    ].join("\n"),
    operationId: `${input.prNumber}-${input.headSha}`,
    planId: input.planId,
    sessionId: input.sessionId,
    origin: "helix-github-pr-create",
    supersedes: prior?.id ?? null,
    now: input.now,
    runtime: "codex",
    measuredPrReviewRequest: true,
  });
  return { entry, deliveryPath: publishClaudeInboxEntry(repoRoot, entry) };
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
  const stateDir = wakeStateDir(repoRoot);
  const manifest = join(stateDir, "delivered.jsonl");
  const ids = new Set<string>();
  if (existsSync(stateDir)) {
    for (const name of readdirSync(stateDir).filter(
      (candidate) => candidate.endsWith(".claim") || candidate.endsWith(".skip"),
    )) {
      try {
        const value = JSON.parse(readFileSync(join(stateDir, name), "utf8")) as { id?: unknown };
        if (typeof value.id === "string") ids.add(value.id);
      } catch {
        // 壊れたclaimは配信済み扱いにせず、後続の診断・復旧余地を残す。
      }
    }
  }
  if (!existsSync(manifest)) return ids;
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

function prRequestIdentity(entry: MemoryEntryV2): { repository: string; prNumber: number } | null {
  const match = entry.key.match(/^claude-inbox:pr:(.+)#(\d+)$/);
  if (!match) return null;
  const prNumber = Number(match[2]);
  return Number.isSafeInteger(prNumber) && prNumber > 0
    ? { repository: match[1] ?? "", prNumber }
    : null;
}

function defaultResolvePrState(input: {
  repository: string;
  prNumber: number;
}): { state: "OPEN" | "CLOSED" | "MERGED"; headSha: string } | null {
  try {
    const value = JSON.parse(
      execFileSync(
        "gh",
        [
          "pr",
          "view",
          String(input.prNumber),
          "--repo",
          input.repository,
          "--json",
          "state,headRefOid",
        ],
        { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
      ),
    ) as { state?: unknown; headRefOid?: unknown };
    if (
      (value.state === "OPEN" || value.state === "CLOSED" || value.state === "MERGED") &&
      typeof value.headRefOid === "string" &&
      /^[0-9a-f]{40}$/.test(value.headRefOid)
    ) {
      return { state: value.state, headSha: value.headRefOid };
    }
  } catch {
    // GitHub read-after-check不能時は通知を実行せず、次watcherで再試行する。
  }
  return null;
}

function recordSkippedPrRequest(input: {
  repoRoot: string;
  entry: MemoryEntryV2;
  sessionId: string;
  now: string;
  reason: string;
}): void {
  const dir = wakeStateDir(input.repoRoot);
  mkdirSync(dir, { recursive: true });
  const path = join(dir, `${safeFilePart(input.entry.id)}.skip`);
  if (existsSync(path)) return;
  const fd = openSync(path, "wx", 0o600);
  try {
    writeFileSync(
      fd,
      `${JSON.stringify({
        id: input.entry.id,
        sessionId: input.sessionId,
        skippedAt: input.now,
        reason: input.reason,
      })}\n`,
    );
  } finally {
    closeSync(fd);
  }
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
  const notificationJson = JSON.stringify({
    memory_id: entry.id,
    key: entry.key,
    origin_runtime: entry.provenance.runtime,
    body,
  })
    .replaceAll("[", "\\u005b")
    .replaceAll("<", "\\u003c");
  return [
    "[HELIX_CLAUDE_INBOX]",
    "これは共有ハーネスメモリから届いた通知データです。現行契約・HEAD・CIを再確認してから行動してください。",
    "notification_json:",
    notificationJson,
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
  const unclaimableIds = new Set<string>();
  const resolvePrState = options.resolvePrState ?? defaultResolvePrState;

  while (Date.now() - started < maxWaitMs) {
    if (readFileSync(generationPath, "utf8").trim() !== generation) {
      return { kind: "superseded" };
    }
    const unavailableIds = deliveredIds(options.repoRoot);
    for (const id of unclaimableIds) unavailableIds.add(id);
    let entry = selectClaudeInboxEntry(readHarnessEvents(options.repoRoot), unavailableIds, now());
    if (entry) {
      const identity = prRequestIdentity(entry);
      if (identity) {
        const current = resolvePrState(identity);
        if (!current) {
          unclaimableIds.add(entry.id);
          continue;
        }
        if (current.state !== "OPEN") {
          recordSkippedPrRequest({
            repoRoot: options.repoRoot,
            entry,
            sessionId: options.sessionId,
            now: now(),
            reason: `pr_${current.state.toLowerCase()}`,
          });
          continue;
        }
        entry = {
          ...entry,
          body: `${entry.body}\nread_after_github_current_head: ${current.headSha}`,
        };
      }
      if (
        claimDelivery({
          repoRoot: options.repoRoot,
          entry,
          sessionId: options.sessionId,
          now: now(),
        })
      ) {
        return { kind: "delivered", entry, message: renderClaudeWakeMessage(entry) };
      }
      unclaimableIds.add(entry.id);
      continue;
    }
    await sleep(pollIntervalMs);
  }
  return { kind: "timeout" };
}

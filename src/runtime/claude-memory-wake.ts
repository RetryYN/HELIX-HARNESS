import { execFileSync } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
import {
  closeSync,
  existsSync,
  fsyncSync,
  linkSync,
  mkdirSync,
  openSync,
  readdirSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { type MemoryEntryV2, resolveMemoryView } from "../memory/memory-v2";
import {
  type AuthorRuntimeEvidenceRunner,
  type MeasuredAuthorRuntime,
  measureAuthorRuntime,
} from "./author-runtime-evidence";

export const CLAUDE_INBOX_PREFIX = "claude-inbox:";
export const CLAUDE_WAKE_BODY_MAX_CHARS = 8_000;
export const CLAUDE_INBOX_ONE_SHOT_SCHEMA = "helix-claude-inbox-one-shot.v1" as const;
const CLAUDE_WAKE_DIGEST_PATTERN = /^sha256:[0-9a-f]{64}$/u;
const CLAUDE_PR_EVIDENCE_GENERATION_PATTERN =
  /^run:[1-9][0-9]*:attempt:[1-9][0-9]*:(?:success|failure|cancelled|skipped|neutral|timed_out|action_required|stale|startup_failure)$/u;

export type ClaudePrReviewDispatchStatus =
  | "queued"
  | "rearmed"
  | "already_queued_no_new_evidence"
  | "already_claimed_no_new_evidence";

export type ClaudeInboxRuntime = "claude" | "codex";

export type ClaudeInboxOneShotState =
  | "OFF"
  | "ARMED"
  | "CLAIMED"
  | "DELIVERED"
  | "REVIEWED"
  | "TERMINAL"
  | "SUPERSEDED";

export interface ClaudeInboxOneShotIdentity {
  repository: string;
  prNumber: number;
  headSha: string;
  reviewPurpose: "review";
}

export interface ClaudeInboxOneShotRecord {
  schemaVersion: typeof CLAUDE_INBOX_ONE_SHOT_SCHEMA;
  identity: ClaudeInboxOneShotIdentity;
  state: ClaudeInboxOneShotState;
  generation: number;
  rearmCount: number;
  senderRuntime: ClaudeInboxRuntime | null;
  receiverSession: string | null;
  reviewerRuntime: ClaudeInboxRuntime | null;
  deliveryDigest: string | null;
  ackDigest: string | null;
  supersededByHead: string | null;
  terminalReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ClaudeInboxOneShotTransition =
  | { kind: "arm"; actorRuntime: ClaudeInboxRuntime; now: string }
  | { kind: "claim"; receiverSession: string; deliveryDigest: string; now: string }
  | { kind: "deliver"; receiverSession: string; ackDigest: string; now: string }
  | { kind: "review"; reviewerRuntime: ClaudeInboxRuntime; now: string }
  | { kind: "terminal"; reason: string; now: string }
  | { kind: "supersede"; supersededByHead: string; now: string };

function assertOneShotIdentity(identity: ClaudeInboxOneShotIdentity): void {
  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/u.test(identity.repository)) {
    throw new Error("claude_inbox_one_shot_identity_invalid");
  }
  if (!Number.isSafeInteger(identity.prNumber) || identity.prNumber <= 0) {
    throw new Error("claude_inbox_one_shot_identity_invalid");
  }
  if (!/^[0-9a-f]{40}$/u.test(identity.headSha) || identity.reviewPurpose !== "review") {
    throw new Error("claude_inbox_one_shot_identity_invalid");
  }
}

function assertOneShotTimestamp(now: string): void {
  if (typeof now !== "string" || Number.isNaN(Date.parse(now))) {
    throw new Error("claude_inbox_one_shot_timestamp_invalid");
  }
}

function assertOneShotReason(reason: string): void {
  if (
    typeof reason !== "string" ||
    reason.trim() === "" ||
    reason.length > 256 ||
    /[\r\n]/u.test(reason)
  ) {
    throw new Error("claude_inbox_one_shot_reason_invalid");
  }
}

function assertWakeDigest(digest: string): void {
  if (!CLAUDE_WAKE_DIGEST_PATTERN.test(digest)) {
    throw new Error("claude_inbox_delivery_digest_invalid");
  }
}

function assertClaudePrEvidenceGeneration(value: string): void {
  if (!CLAUDE_PR_EVIDENCE_GENERATION_PATTERN.test(value)) {
    throw new Error("claude_pr_evidence_generation_invalid");
  }
}

export function claudeWakeMessageDigest(message: string): string {
  return `sha256:${createHash("sha256").update(message, "utf8").digest("hex")}`;
}

export function createClaudeInboxOneShot(
  identity: ClaudeInboxOneShotIdentity,
  now: string,
): ClaudeInboxOneShotRecord {
  assertOneShotIdentity(identity);
  assertOneShotTimestamp(now);
  return {
    schemaVersion: CLAUDE_INBOX_ONE_SHOT_SCHEMA,
    identity: { ...identity },
    state: "OFF",
    generation: 0,
    rearmCount: 0,
    senderRuntime: null,
    receiverSession: null,
    reviewerRuntime: null,
    deliveryDigest: null,
    ackDigest: null,
    supersededByHead: null,
    terminalReason: null,
    createdAt: now,
    updatedAt: now,
  };
}

export function transitionClaudeInboxOneShot(
  record: ClaudeInboxOneShotRecord,
  transition: ClaudeInboxOneShotTransition,
): ClaudeInboxOneShotRecord {
  assertOneShotIdentity(record.identity);
  assertOneShotTimestamp(transition.now);
  const next = { ...record, identity: { ...record.identity }, updatedAt: transition.now };
  switch (transition.kind) {
    case "arm":
      if (record.state !== "OFF") {
        throw new Error("claude_inbox_one_shot_rearm_requires_explicit_path");
      }
      return {
        ...next,
        state: "ARMED",
        generation: record.generation + 1,
        senderRuntime: transition.actorRuntime,
      };
    case "claim":
      assertWakeDigest(transition.deliveryDigest);
      if (record.state !== "ARMED" || transition.receiverSession.trim() === "") {
        throw new Error("claude_inbox_one_shot_invalid_transition");
      }
      return {
        ...next,
        state: "CLAIMED",
        receiverSession: transition.receiverSession,
        deliveryDigest: transition.deliveryDigest,
      };
    case "deliver":
      assertWakeDigest(transition.ackDigest);
      if (
        record.state !== "CLAIMED" ||
        record.receiverSession !== transition.receiverSession ||
        transition.receiverSession.trim() === "" ||
        record.deliveryDigest !== transition.ackDigest
      ) {
        throw new Error("claude_inbox_one_shot_invalid_transition");
      }
      return { ...next, state: "DELIVERED", ackDigest: transition.ackDigest };
    case "review":
      if (record.state !== "DELIVERED") {
        throw new Error("claude_inbox_one_shot_invalid_transition");
      }
      return { ...next, state: "REVIEWED", reviewerRuntime: transition.reviewerRuntime };
    case "terminal":
      assertOneShotReason(transition.reason);
      if (
        !(
          record.state === "REVIEWED" ||
          (record.state === "CLAIMED" && transition.reason.startsWith("explicit_rearm:")) ||
          ((record.state === "ARMED" ||
            record.state === "CLAIMED" ||
            record.state === "DELIVERED") &&
            (transition.reason.startsWith("pr_closed") ||
              transition.reason.startsWith("pr_merged")))
        )
      ) {
        throw new Error("claude_inbox_one_shot_invalid_transition");
      }
      return { ...next, state: "TERMINAL", terminalReason: transition.reason };
    case "supersede":
      if (
        ["OFF", "TERMINAL", "SUPERSEDED"].includes(record.state) ||
        transition.supersededByHead === record.identity.headSha ||
        !/^[0-9a-f]{40}$/u.test(transition.supersededByHead)
      ) {
        throw new Error("claude_inbox_one_shot_invalid_transition");
      }
      return { ...next, state: "SUPERSEDED", supersededByHead: transition.supersededByHead };
  }
}

export function rearmClaudeInboxOneShot(
  record: ClaudeInboxOneShotRecord,
  input: { reason: string; now: string; actorRuntime?: ClaudeInboxRuntime },
): { retired: ClaudeInboxOneShotRecord; next: ClaudeInboxOneShotRecord } {
  assertOneShotReason(input.reason);
  if (record.state !== "CLAIMED" || record.rearmCount >= 1 || record.senderRuntime === null) {
    throw new Error("claude_inbox_one_shot_rearm_not_allowed");
  }
  const retired = transitionClaudeInboxOneShot(record, {
    kind: "terminal",
    reason: `explicit_rearm:${input.reason}`,
    now: input.now,
  });
  const next = transitionClaudeInboxOneShot(
    {
      ...createClaudeInboxOneShot(record.identity, input.now),
      generation: record.generation,
      rearmCount: record.rearmCount + 1,
    },
    {
      kind: "arm",
      actorRuntime: input.actorRuntime ?? record.senderRuntime,
      now: input.now,
    },
  );
  return { retired, next };
}

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
  kind: "claimed" | "delivered" | "timeout" | "superseded";
  entry?: MemoryEntryV2;
  message?: string;
}

interface ClaudeInboxEntryInput {
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
}

function buildClaudeInboxEntryInternal(
  input: ClaudeInboxEntryInput,
  measuredPrReviewRequest: boolean,
): MemoryEntryV2 {
  const key = input.key.startsWith(CLAUDE_INBOX_PREFIX)
    ? input.key
    : `${CLAUDE_INBOX_PREFIX}${input.key}`;
  const createdAt = input.now ?? new Date().toISOString();
  if (key.startsWith(`${CLAUDE_INBOX_PREFIX}pr:`) && !measuredPrReviewRequest) {
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

export function buildClaudeInboxEntry(input: ClaudeInboxEntryInput): MemoryEntryV2 {
  return buildClaudeInboxEntryInternal(input, false);
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
      (!entry.key.startsWith(`${CLAUDE_INBOX_PREFIX}pr:`) ||
        isCanonicalClaudePrReviewRequest(entry)) &&
      !deliveredIds.has(entry.id),
  );
  const prReview = candidates.filter(isCanonicalClaudePrReviewRequest);
  return prReview.at(-1) ?? candidates.at(-1) ?? null;
}

function isCanonicalClaudePrReviewRequest(entry: MemoryEntryV2): boolean {
  return canonicalPrRequestIdentity(entry) !== null;
}

function claudePrReviewRequestPayload(entry: MemoryEntryV2): Record<string, unknown> | null {
  const payloadLine = entry.body
    .split("\n")
    .reverse()
    .find((line) => {
      try {
        return (
          (JSON.parse(line) as Record<string, unknown>).schema_version ===
          "helix-claude-pr-review-request.v1"
        );
      } catch {
        return false;
      }
    });
  if (!payloadLine) return null;
  try {
    const payload = JSON.parse(payloadLine) as Record<string, unknown>;
    return payload.schema_version === "helix-claude-pr-review-request.v1" ? payload : null;
  } catch {
    return null;
  }
}

function claudePrReviewEvidenceGeneration(entry: MemoryEntryV2): string | null {
  const value = claudePrReviewRequestPayload(entry)?.ci_evidence_generation;
  return typeof value === "string" ? value : null;
}

function canonicalPrRequestIdentity(entry: MemoryEntryV2): ClaudeInboxOneShotIdentity | null {
  const key = entry.key.match(/^claude-inbox:pr:(.+)#([1-9][0-9]*)$/u);
  if (
    !key ||
    entry.provenance.runtime !== "codex" ||
    entry.provenance.origin !== "helix-github-pr-create"
  ) {
    return null;
  }
  const payload = claudePrReviewRequestPayload(entry);
  const measured = payload?.measured_author_runtime;
  if (
    payload &&
    payload.repository === key[1] &&
    payload.pr_number === Number(key[2]) &&
    payload.pr_url === `https://github.com/${key[1]}/pull/${key[2]}` &&
    typeof payload.requested_head === "string" &&
    /^[0-9a-f]{40}$/u.test(payload.requested_head) &&
    (measured === "codex" || measured === "mixed" || measured === "external") &&
    entry.body.startsWith(`measured_author_runtime: ${measured}\n`)
  ) {
    return {
      repository: key[1] ?? "",
      prNumber: Number(key[2]),
      headSha: payload.requested_head,
      reviewPurpose: "review",
    };
  }
  return null;
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
export type DispatchAuthorRuntime = MeasuredAuthorRuntime;

export function claudeReviewDispatchAllowed(authorRuntime: DispatchAuthorRuntime): boolean {
  // external（bot 著）は #551 が塞いだ自己レビュー要求に当たらない。塞いだのは「Claude 著 PR を
  // Claude へ回すこと」であり、bot 著 PR には守るべき Claude 著者性が無い（PLAN-RECOVERY-51）。
  return authorRuntime === "codex" || authorRuntime === "mixed" || authorRuntime === "external";
}

function claudePrRequestHasClaim(repoRoot: string, entry: MemoryEntryV2): boolean {
  return ["claim", "delivered", "reviewed", "terminal"].some((suffix) =>
    existsSync(oneShotMarkerPath(repoRoot, entry, suffix)),
  );
}

/**
 * `claude-inbox:pr:` は authoring runtime を実測した PR review request 専用 namespace。
 * 汎用 memory publisher がこの namespace を名乗ると dispatch admission を迂回できるため、
 * publishClaudePrReviewRequest 以外の入口では fail-close する。
 */
function publishClaudePrReviewRequest(
  repoRoot: string,
  input: {
    repository: string;
    prNumber: number;
    prUrl: string;
    headSha: string;
    baseBranch: string;
    authorRuntime: DispatchAuthorRuntime;
    ciEvidenceGeneration?: string;
    planId?: string;
    sessionId?: string;
    now?: string;
  },
): {
  entry: MemoryEntryV2;
  deliveryPath: string;
  dispatchStatus: ClaudePrReviewDispatchStatus;
} {
  if (!claudeReviewDispatchAllowed(input.authorRuntime)) {
    throw new Error("claude_self_review_request_rejected");
  }
  if (input.ciEvidenceGeneration !== undefined) {
    assertClaudePrEvidenceGeneration(input.ciEvidenceGeneration);
  }
  const key = `${CLAUDE_INBOX_PREFIX}pr:${input.repository}#${input.prNumber}`;
  if (input.prUrl !== `https://github.com/${input.repository}/pull/${input.prNumber}`) {
    throw new Error("pr_dispatch_identity_mismatch");
  }
  const projected = projectedInboxEntries(repoRoot);
  const samePrHead = projected
    .filter((entry) => {
      const identity = canonicalPrRequestIdentity(entry);
      return (
        identity?.repository === input.repository &&
        identity.prNumber === input.prNumber &&
        identity.headSha === input.headSha &&
        identity.reviewPurpose === "review"
      );
    })
    .sort((left, right) => left.createdAt.localeCompare(right.createdAt));
  const existing = samePrHead
    .filter(
      (entry) =>
        input.ciEvidenceGeneration === undefined ||
        claudePrReviewEvidenceGeneration(entry) === input.ciEvidenceGeneration,
    )
    .at(-1);
  if (existing) {
    const deliveryPath = publishClaudeInboxEntryInternal(repoRoot, existing, true);
    ensureArmedClaudePrRequest(repoRoot, existing);
    return {
      entry: existing,
      deliveryPath,
      dispatchStatus: claudePrRequestHasClaim(repoRoot, existing)
        ? "already_claimed_no_new_evidence"
        : "already_queued_no_new_evidence",
    };
  }
  const prior =
    samePrHead.at(-1) ??
    projected
      .filter((entry) => entry.key === key)
      .sort((left, right) => left.createdAt.localeCompare(right.createdAt))
      .at(-1);
  const knownEvidenceGenerations = new Set(
    samePrHead.map((entry) => claudePrReviewEvidenceGeneration(entry) ?? "legacy"),
  );
  if (knownEvidenceGenerations.size >= 8) {
    throw new Error("claude_pr_evidence_generation_limit_reached");
  }
  const request = {
    schema_version: "helix-claude-pr-review-request.v1",
    repository: input.repository,
    pr_number: input.prNumber,
    pr_url: input.prUrl,
    requested_head: input.headSha,
    base_branch: input.baseBranch,
    measured_author_runtime: input.authorRuntime,
    ...(input.ciEvidenceGeneration ? { ci_evidence_generation: input.ciEvidenceGeneration } : {}),
    convergence_policy: {
      blocker:
        "current behavior contract違反、correctness/security/data loss、必須CI/DB/oracle red、虚偽・過大claim",
      non_blocker: "Issueへ分離しcurrent PRを収束",
      merge: "current HEADの独立review receipt、CI、DB convergenceを再照合して明示merge",
    },
  };
  const entry = buildClaudeInboxEntryInternal(
    {
      key,
      body: [
        `measured_author_runtime: ${input.authorRuntime}`,
        ...(input.ciEvidenceGeneration
          ? [`ci_evidence_generation: ${input.ciEvidenceGeneration}`]
          : []),
        input.authorRuntime === "mixed"
          ? "実装commitがcodexとclaudeで混在するPRです。codex著の寄与をClaude Code収束レーンでレビューしてください（claude著の寄与はCodex側のreceiptが必要です）。"
          : input.authorRuntime === "external"
            ? "実装commitが全てbot著（HELIXの2 runtimeいずれでもない）と実測されたPRです。守るべきHELIX著者runtimeが無いためClaude Code収束レーンで処理して構いません。"
            : "codex著と実測されたPRをClaude Code収束レーンで処理してください。",
        "GitHubからcurrent PR HEADを再取得し、requested_headと異なる場合はcurrent HEADを正本にしてください。",
        "current HEADの必須CIがpendingまたはin_progressなら、同一turnでgh run watchを再試行しterminalまで待機してください。CI完了前に「監視中」とだけ報告してturnを終了してはいけません。",
        "review完了時はhelix github pr-review-receipt、merge時はhelix github pr-merge-reviewedを使用してください。",
        JSON.stringify(request),
      ].join("\n"),
      operationId: input.ciEvidenceGeneration
        ? `${input.prNumber}-${input.headSha}-ci-${createHash("sha256").update(input.ciEvidenceGeneration, "utf8").digest("hex").slice(0, 16)}`
        : `${input.prNumber}-${input.headSha}`,
      planId: input.planId,
      sessionId: input.sessionId,
      origin: "helix-github-pr-create",
      supersedes: prior?.id ?? null,
      now: input.now,
      runtime: "codex",
    },
    true,
  );
  const deliveryPath = publishClaudeInboxEntryInternal(repoRoot, entry, true);
  ensureArmedClaudePrRequest(repoRoot, entry);
  const priorIdentity = prior ? canonicalPrRequestIdentity(prior) : null;
  if (prior && priorIdentity && priorIdentity.headSha !== input.headSha) {
    ensureArmedClaudePrRequest(repoRoot, prior);
    recordSupersededPrRequest({
      repoRoot,
      entry: prior,
      sessionId: input.sessionId ?? "codex-dispatch",
      now: input.now ?? new Date().toISOString(),
      supersededByHead: input.headSha,
    });
  }
  return {
    entry,
    deliveryPath,
    dispatchStatus: prior ? "rearmed" : "queued",
  };
}

export function dispatchMeasuredPrToClaude(
  repoRoot: string,
  input: {
    repository: string;
    prNumber: number;
    pullRequestUrl: string;
    headSha: string;
    baseBranch: string;
    run: AuthorRuntimeEvidenceRunner;
    ciEvidenceGeneration?: string;
    planId?: string;
    sessionId?: string;
    now?: string;
  },
) {
  if (
    !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/u.test(input.repository) ||
    !Number.isSafeInteger(input.prNumber) ||
    input.prNumber <= 0
  ) {
    throw new Error("pr_dispatch_identity_mismatch");
  }
  const expectedUrl = `https://github.com/${input.repository}/pull/${input.prNumber}`;
  if (input.pullRequestUrl !== expectedUrl) {
    throw new Error("pr_dispatch_identity_mismatch");
  }
  if (!/^[0-9a-f]{40}$/u.test(input.headSha)) {
    throw new Error("pr_dispatch_head_invalid");
  }
  if (input.baseBranch.trim() === "") {
    throw new Error("pr_dispatch_base_branch_invalid");
  }
  const measured = measureAuthorRuntime({
    repository: input.repository,
    prNumber: input.prNumber,
    run: input.run,
  });
  if (!measured.ok) throw new Error(measured.failure);
  if (!claudeReviewDispatchAllowed(measured.measured)) {
    throw new Error("claude_self_review_request_rejected");
  }
  const dispatched = publishClaudePrReviewRequest(repoRoot, {
    repository: input.repository,
    prNumber: input.prNumber,
    prUrl: input.pullRequestUrl,
    headSha: input.headSha,
    baseBranch: input.baseBranch,
    authorRuntime: measured.measured,
    ciEvidenceGeneration: input.ciEvidenceGeneration,
    planId: input.planId,
    sessionId: input.sessionId,
    now: input.now,
  });
  return {
    ...dispatched,
    memoryId: dispatched.entry.id,
    measured: measured.measured,
  };
}

function safeFilePart(value: string): string {
  return value.replace(/[^A-Za-z0-9._-]/g, "_").slice(0, 160);
}

function publishNoClobberFile(input: { dir: string; target: string; content: string }): boolean {
  const temporary = join(input.dir, `.${safeFilePart(randomUUID())}.tmp`);
  let fd: number | undefined;
  try {
    fd = openSync(temporary, "wx", 0o600);
    writeFileSync(fd, input.content);
    fsyncSync(fd);
    closeSync(fd);
    fd = undefined;
    try {
      linkSync(temporary, input.target);
      return true;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "EEXIST") return false;
      throw error;
    }
  } finally {
    if (fd !== undefined) closeSync(fd);
    try {
      unlinkSync(temporary);
    } catch {
      // unique temp pathなのでcleanup失敗でpublish結果を上書きしない。
    }
  }
}

function oneShotMarkerPath(repoRoot: string, entry: MemoryEntryV2, suffix: string): string {
  return join(wakeStateDir(repoRoot), `${safeFilePart(entry.id)}.${suffix}`);
}

function readOneShotMarker(
  repoRoot: string,
  entry: MemoryEntryV2,
  suffix: string,
): ClaudeInboxOneShotRecord | null {
  const path = oneShotMarkerPath(repoRoot, entry, suffix);
  if (!existsSync(path)) return null;
  try {
    const value = JSON.parse(readFileSync(path, "utf8")) as Partial<ClaudeInboxOneShotRecord> & {
      id?: unknown;
    };
    if (
      value.id !== entry.id ||
      value.schemaVersion !== CLAUDE_INBOX_ONE_SHOT_SCHEMA ||
      !value.identity ||
      typeof value.state !== "string" ||
      !["armed", "claim", "delivered", "reviewed", "terminal", "superseded"].includes(suffix)
    ) {
      throw new Error("claude_inbox_one_shot_marker_invalid");
    }
    const record = value as ClaudeInboxOneShotRecord;
    assertOneShotIdentity(record.identity);
    assertOneShotTimestamp(record.createdAt);
    assertOneShotTimestamp(record.updatedAt);
    const expectedState = {
      armed: "ARMED",
      claim: "CLAIMED",
      delivered: "DELIVERED",
      reviewed: "REVIEWED",
      terminal: "TERMINAL",
      superseded: "SUPERSEDED",
    }[suffix];
    if (record.state !== expectedState) {
      throw new Error("claude_inbox_one_shot_marker_invalid");
    }
    if (!Number.isSafeInteger(record.generation) || record.generation < 1) {
      throw new Error("claude_inbox_one_shot_marker_invalid");
    }
    if (
      !Number.isSafeInteger(record.rearmCount) ||
      record.rearmCount < 0 ||
      record.rearmCount > 1
    ) {
      throw new Error("claude_inbox_one_shot_marker_invalid");
    }
    if (
      (record.senderRuntime !== "claude" &&
        record.senderRuntime !== "codex" &&
        record.senderRuntime !== null) ||
      (record.reviewerRuntime !== "claude" &&
        record.reviewerRuntime !== "codex" &&
        record.reviewerRuntime !== null) ||
      (record.receiverSession !== null &&
        (typeof record.receiverSession !== "string" || record.receiverSession.trim() === "")) ||
      (record.supersededByHead !== null && !/^[0-9a-f]{40}$/u.test(record.supersededByHead)) ||
      (record.terminalReason !== null && typeof record.terminalReason !== "string") ||
      (record.deliveryDigest !== null &&
        (typeof record.deliveryDigest !== "string" ||
          !CLAUDE_WAKE_DIGEST_PATTERN.test(record.deliveryDigest))) ||
      (record.ackDigest !== null &&
        (typeof record.ackDigest !== "string" ||
          !CLAUDE_WAKE_DIGEST_PATTERN.test(record.ackDigest))) ||
      (record.state === "CLAIMED" && record.deliveryDigest === null) ||
      (record.state === "DELIVERED" &&
        (record.deliveryDigest === null ||
          record.ackDigest === null ||
          record.deliveryDigest !== record.ackDigest))
    ) {
      throw new Error("claude_inbox_one_shot_marker_invalid");
    }
    return record;
  } catch (error) {
    if (error instanceof Error && error.message === "claude_inbox_one_shot_marker_invalid") {
      throw error;
    }
    throw new Error("claude_inbox_one_shot_marker_invalid", { cause: error });
  }
}

function ensureArmedClaudePrRequest(repoRoot: string, entry: MemoryEntryV2): void {
  const identity = canonicalPrRequestIdentity(entry);
  if (!identity) throw new Error("claude_inbox_one_shot_identity_required");
  const stateDir = wakeStateDir(repoRoot);
  mkdirSync(stateDir, { recursive: true });
  for (const suffix of [
    "armed",
    "claim",
    "delivered",
    "reviewed",
    "terminal",
    "skip",
    "superseded",
  ]) {
    const path = oneShotMarkerPath(repoRoot, entry, suffix);
    if (existsSync(path)) {
      if (
        suffix === "armed" ||
        suffix === "claim" ||
        suffix === "delivered" ||
        suffix === "reviewed" ||
        suffix === "terminal" ||
        suffix === "superseded"
      ) {
        const marker = readOneShotMarker(repoRoot, entry, suffix);
        if (marker?.identity.headSha !== identity.headSha) {
          throw new Error("claude_inbox_one_shot_marker_conflict");
        }
      }
      return;
    }
  }
  const armed = transitionClaudeInboxOneShot(createClaudeInboxOneShot(identity, entry.createdAt), {
    kind: "arm",
    actorRuntime: "codex",
    now: entry.createdAt,
  });
  const armedPath = oneShotMarkerPath(repoRoot, entry, "armed");
  const created = publishNoClobberFile({
    dir: stateDir,
    target: armedPath,
    content: `${JSON.stringify({ id: entry.id, key: entry.key, ...armed })}\n`,
  });
  if (!created) {
    const existing = readOneShotMarker(repoRoot, entry, "armed");
    if (!existing || existing.identity.headSha !== identity.headSha) {
      throw new Error("claude_inbox_one_shot_marker_conflict");
    }
  }
}

function wakeStateDir(repoRoot: string): string {
  return sharedWakeRoot(repoRoot);
}

function publishClaudeInboxEntryInternal(
  repoRoot: string,
  entry: MemoryEntryV2,
  measuredPrReviewRequest: boolean,
): string {
  if (!entry.key.startsWith(CLAUDE_INBOX_PREFIX)) throw new Error("claude_inbox_key_required");
  if (entry.key.startsWith(`${CLAUDE_INBOX_PREFIX}pr:`) && !measuredPrReviewRequest) {
    throw new Error("measured_pr_review_dispatch_required");
  }
  const dir = join(sharedWakeRoot(repoRoot), "inbox");
  mkdirSync(dir, { recursive: true });
  const target = join(dir, `${safeFilePart(entry.id)}.json`);
  const existingProjectionMatches = (): boolean => {
    try {
      const content = readFileSync(target, "utf8");
      if (content === `${JSON.stringify(entry)}\n`) return true;
      const existing = JSON.parse(content) as MemoryEntryV2;
      const left = canonicalPrRequestIdentity(existing);
      const right = canonicalPrRequestIdentity(entry);
      return (
        left !== null &&
        right !== null &&
        left.repository === right.repository &&
        left.prNumber === right.prNumber &&
        left.headSha === right.headSha &&
        left.reviewPurpose === right.reviewPurpose
      );
    } catch {
      return false;
    }
  };
  if (existsSync(target)) {
    if (existingProjectionMatches()) return target;
    throw new Error("claude_inbox_projection_conflict");
  }
  try {
    if (
      publishNoClobberFile({
        dir,
        target,
        content: `${JSON.stringify(entry)}\n`,
      })
    ) {
      return target;
    }
  } catch (error) {
    // Fail-close: a filesystem race is converted into an explicit projection conflict.
    const conflict = new Error("claude_inbox_projection_conflict", { cause: error });
    throw conflict;
  }
  if (existingProjectionMatches()) return target;
  throw new Error("claude_inbox_projection_conflict");
}

/** 汎用通知 publisher。予約 PR review namespace は measured dispatch core だけが発行できる。 */
export function publishClaudeInboxEntry(repoRoot: string, entry: MemoryEntryV2): string {
  return publishClaudeInboxEntryInternal(repoRoot, entry, false);
}

function markerIds(repoRoot: string, suffixes: readonly string[]): Set<string> {
  const stateDir = wakeStateDir(repoRoot);
  const ids = new Set<string>();
  if (existsSync(stateDir)) {
    for (const name of readdirSync(stateDir).filter((candidate) =>
      suffixes.some((suffix) => candidate.endsWith(`.${suffix}`)),
    )) {
      try {
        const value = JSON.parse(readFileSync(join(stateDir, name), "utf8")) as { id?: unknown };
        if (typeof value.id === "string") ids.add(value.id);
      } catch {
        // 壊れたclaimは配信済み扱いにせず、後続の診断・復旧余地を残す。
      }
    }
  }
  return ids;
}

function unavailableIdsForWake(repoRoot: string): Set<string> {
  const ids = markerIds(repoRoot, [
    "claim",
    "delivered",
    "reviewed",
    "terminal",
    "skip",
    "superseded",
  ]);
  const manifest = join(wakeStateDir(repoRoot), "delivered.jsonl");
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

function prRequestFailure(
  entry: MemoryEntryV2,
): "pr_legacy_noncanonical" | "pr_payload_invalid" | null {
  if (entry.key.startsWith(`${CLAUDE_INBOX_PREFIX}pr:`)) return "pr_payload_invalid";
  return /^(?:review|merge)-pr-\d+(?:-|$)/u.test(entry.key.slice(CLAUDE_INBOX_PREFIX.length))
    ? "pr_legacy_noncanonical"
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
  const content = `${JSON.stringify({
    id: input.entry.id,
    sessionId: input.sessionId,
    skippedAt: input.now,
    state: "TERMINAL",
    reason: input.reason,
  })}\n`;
  const terminalizeCanonical = (): void => {
    if (canonicalPrRequestIdentity(input.entry)) {
      recordCanonicalPrTerminalFromCurrent({
        repoRoot: input.repoRoot,
        entry: input.entry,
        reason: input.reason,
        now: input.now,
      });
    }
  };
  if (existsSync(path)) {
    try {
      const existing = JSON.parse(readFileSync(path, "utf8")) as { id?: unknown };
      if (existing.id === input.entry.id) {
        terminalizeCanonical();
        return;
      }
    } catch {
      // malformed tombstone is a conflict, not permission to overwrite it.
    }
    throw new Error("claude_inbox_skip_conflict");
  }
  if (publishNoClobberFile({ dir, target: path, content })) {
    terminalizeCanonical();
    return;
  }
  try {
    const existing = JSON.parse(readFileSync(path, "utf8")) as { id?: unknown };
    if (existing.id === input.entry.id) {
      terminalizeCanonical();
      return;
    }
  } catch {
    // fall through to the typed conflict below
  }
  throw new Error("claude_inbox_skip_conflict");
}

function recordCanonicalPrTerminalFromCurrent(input: {
  repoRoot: string;
  entry: MemoryEntryV2;
  reason: string;
  now: string;
}): void {
  const identity = canonicalPrRequestIdentity(input.entry);
  if (!identity) throw new Error("claude_inbox_one_shot_identity_required");
  const path = oneShotMarkerPath(input.repoRoot, input.entry, "terminal");
  if (existsSync(path)) {
    if (!readOneShotMarker(input.repoRoot, input.entry, "terminal")) {
      throw new Error("claude_inbox_terminal_conflict");
    }
    return;
  }
  let source: ClaudeInboxOneShotRecord | null = null;
  for (const suffix of ["reviewed", "delivered", "claim", "armed"]) {
    if (existsSync(oneShotMarkerPath(input.repoRoot, input.entry, suffix))) {
      source = readOneShotMarker(input.repoRoot, input.entry, suffix);
      break;
    }
  }
  if (!source) return;
  const terminal = transitionClaudeInboxOneShot(source, {
    kind: "terminal",
    reason: input.reason,
    now: input.now,
  });
  const created = publishNoClobberFile({
    dir: wakeStateDir(input.repoRoot),
    target: path,
    content: `${JSON.stringify({
      id: input.entry.id,
      key: input.entry.key,
      ...terminal,
    })}\n`,
  });
  if (!created && !readOneShotMarker(input.repoRoot, input.entry, "terminal")) {
    throw new Error("claude_inbox_terminal_conflict");
  }
}

function isLegacyClaimMarker(repoRoot: string, entry: MemoryEntryV2): boolean {
  const path = oneShotMarkerPath(repoRoot, entry, "claim");
  try {
    const value = JSON.parse(readFileSync(path, "utf8")) as Record<string, unknown>;
    return (
      value.id === entry.id &&
      typeof value.sessionId === "string" &&
      value.sessionId.trim() !== "" &&
      typeof value.deliveredAt === "string" &&
      value.schemaVersion === undefined &&
      value.state === undefined &&
      value.deliveryDigest === undefined
    );
  } catch {
    return false;
  }
}

function readSupersedeSource(
  repoRoot: string,
  entry: MemoryEntryV2,
): ClaudeInboxOneShotRecord | null {
  for (const suffix of ["reviewed", "delivered", "claim", "armed"] as const) {
    if (!existsSync(oneShotMarkerPath(repoRoot, entry, suffix))) continue;
    try {
      return readOneShotMarker(repoRoot, entry, suffix);
    } catch (error) {
      // The pre-FSM receiver wrote {id, sessionId, deliveredAt} claim markers. They cannot
      // prove delivery, but must not strand a newer PR HEAD behind a permanently stale claim.
      // Any other malformed current marker remains fail-closed.
      if (suffix === "claim" && isLegacyClaimMarker(repoRoot, entry)) continue;
      throw error;
    }
  }
  return null;
}

function recordSupersededPrRequest(input: {
  repoRoot: string;
  entry: MemoryEntryV2;
  sessionId: string;
  now: string;
  supersededByHead: string;
}): void {
  const identity = canonicalPrRequestIdentity(input.entry);
  if (!identity) throw new Error("claude_inbox_one_shot_identity_required");
  const path = oneShotMarkerPath(input.repoRoot, input.entry, "superseded");
  if (existsSync(path)) {
    const existing = readOneShotMarker(input.repoRoot, input.entry, "superseded");
    if (existing?.supersededByHead === input.supersededByHead) return;
    throw new Error("claude_inbox_supersede_conflict");
  }
  const terminalPath = oneShotMarkerPath(input.repoRoot, input.entry, "terminal");
  if (existsSync(terminalPath)) {
    // 既に review/close/merge で閉じた generationはterminal tombstoneを正本とし、
    // 後続HEADの出現で別の状態へ書き換えない。
    readOneShotMarker(input.repoRoot, input.entry, "terminal");
    return;
  }
  const source = readSupersedeSource(input.repoRoot, input.entry);
  if (!source) throw new Error("claude_inbox_one_shot_armed_state_required");
  const superseded = transitionClaudeInboxOneShot(source, {
    kind: "supersede",
    supersededByHead: input.supersededByHead,
    now: input.now,
  });
  const created = publishNoClobberFile({
    dir: wakeStateDir(input.repoRoot),
    target: path,
    content: `${JSON.stringify({
      id: input.entry.id,
      key: input.entry.key,
      sessionId: input.sessionId,
      ...superseded,
    })}\n`,
  });
  if (!created) {
    const existing = readOneShotMarker(input.repoRoot, input.entry, "superseded");
    if (existing?.supersededByHead !== input.supersededByHead) {
      throw new Error("claude_inbox_supersede_conflict");
    }
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
  const identity = canonicalPrRequestIdentity(entry);
  const deliveryDigest = claudeWakeMessageDigest(renderClaudeWakeMessage(entry));
  let claimRecord: Record<string, unknown> = {
    id: entry.id,
    key: entry.key,
    state: "CLAIMED",
    sessionId,
    claimedAt: now,
    deliveryDigest,
  };
  if (identity) {
    const armed = readOneShotMarker(repoRoot, entry, "armed");
    if (!armed || armed.identity.headSha !== identity.headSha) {
      throw new Error("claude_inbox_one_shot_armed_state_required");
    }
    claimRecord = {
      id: entry.id,
      key: entry.key,
      ...transitionClaudeInboxOneShot(armed, {
        kind: "claim",
        receiverSession: sessionId,
        deliveryDigest,
        now,
      }),
    };
  }
  return publishNoClobberFile({
    dir,
    target: claim,
    content: `${JSON.stringify(claimRecord)}\n`,
  });
}

export function recordClaudeWakeDelivery(input: {
  repoRoot: string;
  entry: MemoryEntryV2;
  sessionId: string;
  ackDigest: string;
  now?: string;
}): string {
  assertWakeDigest(input.ackDigest);
  const now = input.now ?? new Date().toISOString();
  const dir = wakeStateDir(input.repoRoot);
  mkdirSync(dir, { recursive: true });
  const claim = oneShotMarkerPath(input.repoRoot, input.entry, "claim");
  if (!existsSync(claim)) throw new Error("claude_inbox_delivery_claim_required");
  const delivered = oneShotMarkerPath(input.repoRoot, input.entry, "delivered");
  const identity = canonicalPrRequestIdentity(input.entry);
  let deliveryDigest: string;
  let deliveredRecord: Record<string, unknown> = {
    id: input.entry.id,
    key: input.entry.key,
    state: "DELIVERED",
    sessionId: input.sessionId,
    deliveredAt: now,
    ackDigest: input.ackDigest,
  };
  if (identity) {
    const claimRecord = readOneShotMarker(input.repoRoot, input.entry, "claim");
    if (!claimRecord) throw new Error("claude_inbox_claim_marker_invalid");
    deliveryDigest = claimRecord.deliveryDigest ?? "";
    deliveredRecord = {
      id: input.entry.id,
      key: input.entry.key,
      ...transitionClaudeInboxOneShot(claimRecord, {
        kind: "deliver",
        receiverSession: input.sessionId,
        ackDigest: input.ackDigest,
        now,
      }),
    };
  } else {
    try {
      const claimRecord = JSON.parse(readFileSync(claim, "utf8")) as {
        id?: unknown;
        state?: unknown;
        sessionId?: unknown;
        deliveryDigest?: unknown;
      };
      if (
        claimRecord.id !== input.entry.id ||
        claimRecord.state !== "CLAIMED" ||
        typeof claimRecord.deliveryDigest !== "string"
      ) {
        throw new Error("claude_inbox_claim_marker_invalid");
      }
      if (claimRecord.sessionId !== input.sessionId) {
        throw new Error("claude_inbox_delivery_conflict");
      }
      assertWakeDigest(claimRecord.deliveryDigest);
      deliveryDigest = claimRecord.deliveryDigest;
      if (deliveryDigest !== input.ackDigest) {
        throw new Error("claude_inbox_delivery_ack_mismatch");
      }
      deliveredRecord.deliveryDigest = deliveryDigest;
    } catch (error) {
      if (
        error instanceof Error &&
        (error.message === "claude_inbox_claim_marker_invalid" ||
          error.message === "claude_inbox_delivery_ack_mismatch" ||
          error.message === "claude_inbox_delivery_conflict")
      ) {
        throw error;
      }
      throw new Error("claude_inbox_claim_marker_invalid", { cause: error });
    }
  }
  const isIdempotentDeliveryMarker = (): boolean => {
    if (!existsSync(delivered)) return false;
    if (identity) {
      const existing = readOneShotMarker(input.repoRoot, input.entry, "delivered");
      if (!existing) return false;
      return (
        existing.identity.repository === identity.repository &&
        existing.identity.prNumber === identity.prNumber &&
        existing.identity.headSha === identity.headSha &&
        existing.receiverSession === input.sessionId &&
        existing.ackDigest === input.ackDigest
      );
    }
    try {
      const existing = JSON.parse(readFileSync(delivered, "utf8")) as {
        id?: unknown;
        state?: unknown;
        sessionId?: unknown;
        ackDigest?: unknown;
        deliveryDigest?: unknown;
      };
      return (
        existing.id === input.entry.id &&
        existing.state === "DELIVERED" &&
        existing.sessionId === input.sessionId &&
        existing.ackDigest === input.ackDigest &&
        existing.deliveryDigest === deliveryDigest
      );
    } catch {
      // Fail-close: malformed delivery state must never be treated as idempotent.
      const conflict = new Error("claude_inbox_delivery_conflict");
      throw conflict;
    }
  };
  if (existsSync(delivered)) {
    if (isIdempotentDeliveryMarker()) return delivered;
    throw new Error("claude_inbox_delivery_conflict");
  }
  if (
    !publishNoClobberFile({
      dir,
      target: delivered,
      content: `${JSON.stringify(deliveredRecord)}\n`,
    })
  ) {
    if (isIdempotentDeliveryMarker()) return delivered;
    throw new Error("claude_inbox_delivery_conflict");
  }
  const manifestFd = openSync(join(dir, "delivered.jsonl"), "a", 0o600);
  try {
    writeFileSync(
      manifestFd,
      `${JSON.stringify({ id: input.entry.id, key: input.entry.key, sessionId: input.sessionId, deliveredAt: now, state: "DELIVERED" })}\n`,
    );
  } finally {
    closeSync(manifestFd);
  }
  return delivered;
}

export function recordClaudeWakeReview(input: {
  repoRoot: string;
  entry: MemoryEntryV2;
  reviewerRuntime: ClaudeInboxRuntime;
  now?: string;
}): string {
  const now = input.now ?? new Date().toISOString();
  const path = oneShotMarkerPath(input.repoRoot, input.entry, "reviewed");
  const identity = canonicalPrRequestIdentity(input.entry);
  if (identity) {
    const delivered = readOneShotMarker(input.repoRoot, input.entry, "delivered");
    if (!delivered) throw new Error("claude_inbox_delivery_required");
    const reviewed = transitionClaudeInboxOneShot(delivered, {
      kind: "review",
      reviewerRuntime: input.reviewerRuntime,
      now,
    });
    if (existsSync(path)) {
      const existing = readOneShotMarker(input.repoRoot, input.entry, "reviewed");
      if (existing?.reviewerRuntime === input.reviewerRuntime) return path;
      throw new Error("claude_inbox_review_conflict");
    }
    if (
      !publishNoClobberFile({
        dir: wakeStateDir(input.repoRoot),
        target: path,
        content: `${JSON.stringify({
          id: input.entry.id,
          key: input.entry.key,
          ...reviewed,
        })}\n`,
      })
    ) {
      const existing = readOneShotMarker(input.repoRoot, input.entry, "reviewed");
      if (existing?.reviewerRuntime !== input.reviewerRuntime) {
        throw new Error("claude_inbox_review_conflict");
      }
    }
    return path;
  }
  const deliveredPath = oneShotMarkerPath(input.repoRoot, input.entry, "delivered");
  if (!existsSync(deliveredPath)) throw new Error("claude_inbox_delivery_required");
  const reviewed = {
    id: input.entry.id,
    key: input.entry.key,
    state: "REVIEWED",
    reviewerRuntime: input.reviewerRuntime,
    reviewedAt: now,
  };
  if (existsSync(path)) {
    const existing = JSON.parse(readFileSync(path, "utf8")) as {
      id?: unknown;
      state?: unknown;
      reviewerRuntime?: unknown;
    };
    if (
      existing.id === input.entry.id &&
      existing.state === "REVIEWED" &&
      existing.reviewerRuntime === input.reviewerRuntime
    ) {
      return path;
    }
    throw new Error("claude_inbox_review_conflict");
  }
  if (
    !publishNoClobberFile({
      dir: wakeStateDir(input.repoRoot),
      target: path,
      content: `${JSON.stringify(reviewed)}\n`,
    })
  ) {
    return recordClaudeWakeReview(input);
  }
  return path;
}

export function recordClaudeWakeTerminal(input: {
  repoRoot: string;
  entry: MemoryEntryV2;
  reason: string;
  now?: string;
}): string {
  assertOneShotReason(input.reason);
  const now = input.now ?? new Date().toISOString();
  const path = oneShotMarkerPath(input.repoRoot, input.entry, "terminal");
  const identity = canonicalPrRequestIdentity(input.entry);
  if (identity) {
    const reviewed = readOneShotMarker(input.repoRoot, input.entry, "reviewed");
    if (!reviewed) throw new Error("claude_inbox_review_required");
    const terminal = transitionClaudeInboxOneShot(reviewed, {
      kind: "terminal",
      reason: input.reason,
      now,
    });
    if (existsSync(path)) {
      const existing = readOneShotMarker(input.repoRoot, input.entry, "terminal");
      if (existing) return path;
      throw new Error("claude_inbox_terminal_conflict");
    }
    if (
      !publishNoClobberFile({
        dir: wakeStateDir(input.repoRoot),
        target: path,
        content: `${JSON.stringify({
          id: input.entry.id,
          key: input.entry.key,
          ...terminal,
        })}\n`,
      })
    ) {
      if (!readOneShotMarker(input.repoRoot, input.entry, "terminal")) {
        throw new Error("claude_inbox_terminal_conflict");
      }
    }
    return path;
  }
  const reviewedPath = oneShotMarkerPath(input.repoRoot, input.entry, "reviewed");
  if (!existsSync(reviewedPath)) throw new Error("claude_inbox_review_required");
  const terminal = {
    id: input.entry.id,
    key: input.entry.key,
    state: "TERMINAL",
    terminalReason: input.reason,
    terminalAt: now,
  };
  if (existsSync(path)) {
    const existing = JSON.parse(readFileSync(path, "utf8")) as {
      id?: unknown;
      state?: unknown;
    };
    if (existing.id === input.entry.id && existing.state === "TERMINAL") return path;
    throw new Error("claude_inbox_terminal_conflict");
  }
  if (
    !publishNoClobberFile({
      dir: wakeStateDir(input.repoRoot),
      target: path,
      content: `${JSON.stringify(terminal)}\n`,
    })
  ) {
    return recordClaudeWakeTerminal(input);
  }
  return path;
}

export function recordClaudePrReviewTerminal(input: {
  repoRoot: string;
  repository: string;
  prNumber: number;
  headSha: string;
  reviewerRuntime: ClaudeInboxRuntime;
  reason: string;
  now?: string;
}): string | null {
  const identity: ClaudeInboxOneShotIdentity = {
    repository: input.repository,
    prNumber: input.prNumber,
    headSha: input.headSha,
    reviewPurpose: "review",
  };
  assertOneShotIdentity(identity);
  const entry = projectedInboxEntries(input.repoRoot)
    .filter((candidate) => {
      const candidateIdentity = canonicalPrRequestIdentity(candidate);
      return (
        candidateIdentity?.repository === identity.repository &&
        candidateIdentity.prNumber === identity.prNumber &&
        candidateIdentity.headSha === identity.headSha &&
        candidateIdentity.reviewPurpose === identity.reviewPurpose
      );
    })
    .at(-1);
  if (!entry || !existsSync(oneShotMarkerPath(input.repoRoot, entry, "delivered"))) return null;
  recordClaudeWakeReview({
    repoRoot: input.repoRoot,
    entry,
    reviewerRuntime: input.reviewerRuntime,
    now: input.now,
  });
  return recordClaudeWakeTerminal({
    repoRoot: input.repoRoot,
    entry,
    reason: input.reason,
    now: input.now,
  });
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
    const unavailableIds = unavailableIdsForWake(options.repoRoot);
    for (const id of unclaimableIds) unavailableIds.add(id);
    let entry = selectClaudeInboxEntry(readHarnessEvents(options.repoRoot), unavailableIds, now());
    if (entry) {
      const prFailure = prRequestFailure(entry);
      const identity = canonicalPrRequestIdentity(entry);
      if (prFailure && !identity) {
        recordSkippedPrRequest({
          repoRoot: options.repoRoot,
          entry,
          sessionId: options.sessionId,
          now: now(),
          reason: prFailure,
        });
        continue;
      }
      if (identity) {
        ensureArmedClaudePrRequest(options.repoRoot, entry);
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
        if (current.headSha !== identity.headSha) {
          recordSupersededPrRequest({
            repoRoot: options.repoRoot,
            entry,
            sessionId: options.sessionId,
            now: now(),
            supersededByHead: current.headSha,
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
        return { kind: "claimed", entry, message: renderClaudeWakeMessage(entry) };
      }
      unclaimableIds.add(entry.id);
      continue;
    }
    await sleep(pollIntervalMs);
  }
  return { kind: "timeout" };
}

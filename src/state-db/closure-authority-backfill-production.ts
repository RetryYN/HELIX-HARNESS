import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { z } from "zod";
import type {
  ClosureAuthorityBackfillBundle,
  ClosureAuthorityBackfillInput,
} from "../policy/closure-authority-backfill";
import {
  buildClosureAuthorityBackfill,
  closureAuthorityBackfillBundleSchema,
  parseClosureAuthorityBackfillBundle,
} from "../policy/closure-authority-backfill";
import {
  CLOSURE_GATE_ALLOWLIST_PATH,
  loadRepoOwnedGateAllowlist,
  readVerifiedRepoFile,
} from "./closure-authority-backfill-loader";
import { buildCurrentClosureAuthorityCandidate } from "./closure-authority-backfill-verifier";

export { buildCurrentClosureAuthorityCandidate } from "./closure-authority-backfill-verifier";

import {
  buildProjectClosureReviewBundle,
  buildProjectCurrentLocationSnapshot,
} from "./current-location";
import type { HarnessDb } from "./index";

type Digest = `sha256:${string}`;
const REGISTRY_PATH = "docs/governance/closure-authority-registry.yaml";
const L8_PATH = "docs/test-design/harness/L8-unit-test-design.md";
const sha256 = (value: string): Digest =>
  `sha256:${createHash("sha256").update(value).digest("hex")}`;
const stable = (value: unknown): string => {
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  if (value !== null && typeof value === "object")
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, item]) => `${JSON.stringify(key)}:${stable(item)}`)
      .join(",")}}`;
  return JSON.stringify(value);
};

export interface CurrentClosureAuthorityBackfillInput extends ClosureAuthorityBackfillInput {
  provenance: {
    expected_head_sha: string;
    repository_head: string;
    origin_main_head: string;
    branch: "main";
  };
}

function git(repoRoot: string, ...args: string[]): string {
  return execFileSync("git", args, {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

export function verifyTrackedHeadBlob(repoRoot: string, head: string, path: string): void {
  const row = git(repoRoot, "ls-tree", head, "--", path);
  if (!row.startsWith("100644 blob ") || !row.endsWith(`\t${path}`))
    throw new Error(`tracked canonical blob required: ${path}`);
  const source = readVerifiedRepoFile(repoRoot, path);
  const blob = execFileSync("git", ["show", `${head}:${path}`], { cwd: repoRoot });
  if (`sha256:${createHash("sha256").update(blob).digest("hex")}` !== source.digest)
    throw new Error(`tracked blob/filesystem drift: ${path}`);
}

function loadCurrentClosureAuthorityBackfillInputUnchecked(input: {
  repoRoot: string;
  db: HarnessDb;
  expected_head_sha: string;
  now: string;
}): CurrentClosureAuthorityBackfillInput {
  if (!/^[0-9a-f]{40}$/.test(input.expected_head_sha))
    throw new Error("expected_head_sha must be a lowercase 40-character SHA");
  const head = git(input.repoRoot, "rev-parse", "HEAD");
  const origin = git(input.repoRoot, "rev-parse", "refs/remotes/origin/main");
  const branch = git(input.repoRoot, "symbolic-ref", "--short", "HEAD");
  if (head !== input.expected_head_sha || origin !== head || branch !== "main")
    throw new Error("expected HEAD/local origin-main/main branch provenance mismatch");
  const tracked = git(input.repoRoot, "ls-files", "-z").split("\0").filter(Boolean);
  const folded = new Map<string, string>();
  for (const path of tracked) {
    const key = path.toLocaleLowerCase("en-US");
    const prior = folded.get(key);
    if (prior && prior !== path) throw new Error(`tracked case-fold collision: ${prior},${path}`);
    folded.set(key, path);
  }
  for (const path of [REGISTRY_PATH, CLOSURE_GATE_ALLOWLIST_PATH, L8_PATH])
    verifyTrackedHeadBlob(input.repoRoot, head, path);
  if (git(input.repoRoot, "status", "--porcelain=v1", "--untracked-files=all") !== "")
    throw new Error("production authority backfill requires a clean worktree/index");
  const snapshot = buildProjectCurrentLocationSnapshot(input.db);
  const count = snapshot.closure.queue.route_counts.close_ready;
  const review = buildProjectClosureReviewBundle(snapshot, {
    action: "close_ready",
    limit: Math.max(1, count),
    offset: 0,
  });
  if (
    review.review_scope.plan_ids.length !== review.review_scope.source_paths.length ||
    new Set(review.review_scope.plan_ids).size !== review.review_scope.plan_ids.length
  )
    throw new Error("review scope candidate cardinality/order invalid");
  const l8 = readVerifiedRepoFile(input.repoRoot, L8_PATH);
  const candidates = review.review_scope.plan_ids.map((planId, index) => {
    const planPath = review.review_scope.source_paths[index];
    if (!planPath) throw new Error(`review scope source missing: ${planId}`);
    return buildCurrentClosureAuthorityCandidate({
      repoRoot: input.repoRoot,
      db: input.db,
      head,
      planId,
      planPath,
      l8Bytes: l8.bytes,
      l8Digest: l8.digest,
      now: input.now,
    });
  });
  const registry = readVerifiedRepoFile(input.repoRoot, REGISTRY_PATH);
  const allowlist = loadRepoOwnedGateAllowlist({
    repoRoot: input.repoRoot,
    path: CLOSURE_GATE_ALLOWLIST_PATH,
    repositoryHead: head,
  });
  return {
    repository_head: head,
    registry_digest: registry.digest,
    review_scope_digest: review.review_scope.approval_scope_digest as Digest,
    expected_plan_ids: [...review.review_scope.plan_ids],
    candidates,
    gate_allowlist: allowlist,
    provenance: {
      expected_head_sha: input.expected_head_sha,
      repository_head: head,
      origin_main_head: origin,
      branch: "main",
    },
  };
}

export class ClosureAuthorityBackfillInputError extends Error {
  readonly code: string;
  constructor(code: string, message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "ClosureAuthorityBackfillInputError";
    this.code = code;
  }
}

export function loadCurrentClosureAuthorityBackfillInput(
  input: Parameters<typeof loadCurrentClosureAuthorityBackfillInputUnchecked>[0],
): CurrentClosureAuthorityBackfillInput {
  try {
    return loadCurrentClosureAuthorityBackfillInputUnchecked(input);
  } catch (error) {
    if (error instanceof ClosureAuthorityBackfillInputError) throw error;
    throw new ClosureAuthorityBackfillInputError(
      "CURRENT_INPUT_INVALID",
      error instanceof Error ? error.message : String(error),
      { cause: error },
    );
  }
}

export interface ClosureAuthorityBackfillRun {
  schema_version: "closure-authority-backfill-run.v1";
  total_candidates: number;
  scope_digest: Digest;
  candidate_plan_ids: string[];
  bundle: ClosureAuthorityBackfillBundle;
  windows: Array<{
    start: number;
    end_exclusive: number;
    plan_ids: string[];
    window_digest: Digest;
  }>;
  run_digest: Digest;
}

const digestSchema = z.string().regex(/^sha256:[0-9a-f]{64}$/);
const runWindowSchema = z
  .object({
    start: z.number().int().nonnegative(),
    end_exclusive: z.number().int().positive(),
    plan_ids: z.array(z.string().min(1)).min(1).max(100),
    window_digest: digestSchema,
  })
  .strict();
const runSchema = z
  .object({
    schema_version: z.literal("closure-authority-backfill-run.v1"),
    total_candidates: z.number().int().positive(),
    scope_digest: digestSchema,
    candidate_plan_ids: z.array(z.string().min(1)).min(1),
    bundle: closureAuthorityBackfillBundleSchema,
    windows: z.array(runWindowSchema).min(1),
    run_digest: digestSchema,
  })
  .strict();

/** Decode an untrusted persisted/transported run and verify its complete census and digests. */
export function decodeClosureAuthorityBackfillRun(value: unknown): ClosureAuthorityBackfillRun {
  const run = runSchema.parse(value) as ClosureAuthorityBackfillRun;
  parseClosureAuthorityBackfillBundle(run.bundle);
  const ids = run.candidate_plan_ids;
  if (run.total_candidates !== ids.length || new Set(ids).size !== ids.length)
    throw new Error("run candidate missing/excess/duplicate");
  if (
    run.bundle.review_scope_digest !== run.scope_digest ||
    run.bundle.candidate_plan_ids.length !== ids.length ||
    run.bundle.candidate_plan_ids.some((id, index) => id !== ids[index]) ||
    run.bundle.decisions.length !== ids.length
  )
    throw new Error("run bundle census/scope drift");
  let cursor = 0;
  const flattened: string[] = [];
  for (const window of run.windows) {
    if (window.start !== cursor || window.end_exclusive !== window.start + window.plan_ids.length)
      throw new Error("run window gap/overlap/bounds drift");
    const body = {
      start: window.start,
      end_exclusive: window.end_exclusive,
      plan_ids: window.plan_ids,
    };
    if (sha256(stable(body)) !== window.window_digest)
      throw new Error("run window digest mismatch");
    flattened.push(...window.plan_ids);
    cursor = window.end_exclusive;
  }
  if (cursor !== ids.length || flattened.some((id, index) => id !== ids[index]))
    throw new Error("run window missing/excess/order drift");
  const runBody = { ...run };
  delete (runBody as Partial<ClosureAuthorityBackfillRun>).run_digest;
  if (sha256(stable(runBody)) !== run.run_digest) throw new Error("run digest mismatch");
  return run;
}

export function buildCurrentClosureAuthorityBackfillRun(
  input: CurrentClosureAuthorityBackfillInput,
): ClosureAuthorityBackfillRun {
  const ids = [...input.expected_plan_ids];
  if (ids.length !== input.candidates.length || new Set(ids).size !== ids.length)
    throw new Error("candidate missing/excess/duplicate");
  if (input.candidates.some((candidate, index) => candidate.plan_id !== ids[index]))
    throw new Error("candidate order drift");
  const bundle = buildClosureAuthorityBackfill({
    repository_head: input.repository_head,
    registry_digest: input.registry_digest,
    review_scope_digest: input.review_scope_digest,
    expected_plan_ids: input.expected_plan_ids,
    candidates: input.candidates,
    gate_allowlist: input.gate_allowlist,
  });
  const windows: ClosureAuthorityBackfillRun["windows"] = [];
  for (let start = 0; start < ids.length; start += 100) {
    const planIds = ids.slice(start, start + 100);
    const body = { start, end_exclusive: start + planIds.length, plan_ids: planIds };
    windows.push({ ...body, window_digest: sha256(stable(body)) });
  }
  const body = {
    schema_version: "closure-authority-backfill-run.v1" as const,
    total_candidates: ids.length,
    scope_digest: input.review_scope_digest,
    candidate_plan_ids: ids,
    bundle,
    windows,
  };
  return { ...body, run_digest: sha256(stable(body)) };
}

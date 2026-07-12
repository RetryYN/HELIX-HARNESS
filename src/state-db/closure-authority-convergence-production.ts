import { createHash, randomUUID } from "node:crypto";
import {
  closeSync,
  existsSync,
  fsyncSync,
  linkSync,
  lstatSync,
  mkdirSync,
  openSync,
  readFileSync,
  realpathSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { z } from "zod";
import {
  applyClosureAuthorityBackfill,
  type ClosureAuthorityBackfillApplyBundle,
  type ClosureAuthorityBackfillReviewReceipt,
  decodeClosureAuthorityBackfillReviewReceipt,
  proposalSetDigest,
  recordClosureAuthorityReviewReceipt,
  reviewVerdictDigest,
  validateClosureAuthorityBackfillReview,
} from "./closure-authority-backfill";
import {
  type ClosureAuthorityBackfillRun,
  decodeClosureAuthorityBackfillRun,
} from "./closure-authority-backfill-production";
import type { HarnessDb } from "./index";

type Digest = `sha256:${string}`;
const DIGEST = /^sha256:[0-9a-f]{64}$/;
const HEAD = /^[0-9a-f]{40}$/;
const sha256 = (value: string | Buffer): Digest =>
  `sha256:${createHash("sha256").update(value).digest("hex")}`;
const canonicalNewPath = (repoRoot: string, candidate: string): string => {
  if (isAbsolute(candidate)) throw new Error("artifact path must be repository-relative");
  const root = realpathSync(repoRoot);
  const absolute = resolve(root, candidate);
  const rel = relative(root, absolute);
  if (!rel || rel === ".." || rel.startsWith(`..${sep}`) || isAbsolute(rel))
    throw new Error("artifact path outside repository");
  let cursor = root;
  for (const segment of rel.split(sep)) {
    cursor = join(cursor, segment);
    if (existsSync(cursor) && lstatSync(cursor).isSymbolicLink())
      throw new Error("artifact symlink ancestry is forbidden");
  }
  if (existsSync(absolute)) throw new Error("artifact create-new path already exists");
  return absolute;
};

const canonicalExistingPath = (repoRoot: string, candidate: string): string => {
  if (isAbsolute(candidate)) throw new Error("artifact path must be repository-relative");
  const root = realpathSync(repoRoot);
  const absolute = resolve(root, candidate);
  const rel = relative(root, absolute);
  if (!rel || rel === ".." || rel.startsWith(`..${sep}`) || isAbsolute(rel))
    throw new Error("artifact path outside repository");
  let cursor = root;
  for (const segment of rel.split(sep)) {
    cursor = join(cursor, segment);
    if (lstatSync(cursor).isSymbolicLink())
      throw new Error("artifact symlink ancestry is forbidden");
  }
  if (!lstatSync(absolute).isFile() || realpathSync(absolute) !== absolute)
    throw new Error("artifact canonical regular file required");
  return absolute;
};

function atomicCreateJson(
  repoRoot: string,
  path: string,
  value: unknown,
): {
  path: string;
  digest: Digest;
} {
  const target = canonicalNewPath(repoRoot, path);
  mkdirSync(dirname(target), { recursive: true });
  const bytes = `${JSON.stringify(value)}\n`;
  const temp = `${target}.tmp-${randomUUID()}`;
  const fd = openSync(temp, "wx", 0o600);
  try {
    writeFileSync(fd, bytes);
    fsyncSync(fd);
  } finally {
    closeSync(fd);
  }
  try {
    // hard-link creation is an atomic create-new publication on the same filesystem.
    linkSync(temp, target);
    unlinkSync(temp);
    const directory = openSync(dirname(target), "r");
    try {
      fsyncSync(directory);
    } finally {
      closeSync(directory);
    }
  } catch (error) {
    if (existsSync(temp)) unlinkSync(temp);
    throw error;
  }
  return { path, digest: sha256(bytes) };
}

function createOrRecoverJson(
  repoRoot: string,
  path: string,
  value: unknown,
): {
  path: string;
  digest: Digest;
  recovered: boolean;
} {
  const bytes = `${JSON.stringify(value)}\n`;
  try {
    return { ...atomicCreateJson(repoRoot, path, value), recovered: false };
  } catch (error) {
    if (!existsSync(resolve(repoRoot, path))) throw error;
    const existing = canonicalExistingPath(repoRoot, path);
    const existingBytes = readFileSync(existing);
    if (!existingBytes.equals(Buffer.from(bytes))) throw error;
    return { path, digest: sha256(existingBytes), recovered: true };
  }
}

const draftSchema = z
  .object({
    schema_version: z.literal("closure-authority-review-draft.v1"),
    draft_id: z.string().regex(/^[A-Za-z0-9._-]{8,128}$/),
    created_at: z.string().datetime(),
    expires_at: z.string().datetime(),
    repository_head: z.string().regex(HEAD),
    proposal_path: z.string().min(1),
    proposal_digest: z.string().regex(DIGEST),
    bundle_digest: z.string().regex(DIGEST),
    review_scope_digest: z.string().regex(DIGEST),
    registry_digest: z.string().regex(DIGEST),
    worker_identity: z.string().min(1),
    task_identity: z.string().min(1),
    candidate_plan_ids: z.array(z.string().min(1)).min(1),
    authorizing: z.literal(false),
  })
  .strict();
export type ClosureAuthorityReviewDraft = z.infer<typeof draftSchema>;

const taskEvidenceSchema = z
  .object({
    schema_version: z.literal("closure-authority-review-task-completion.v1"),
    task_identity: z.string().min(1),
    worker_identity: z.string().min(1),
    reviewer_identity: z.string().min(1),
    review_kind: z.enum(["cross_runtime", "intra_runtime_subagent"]),
    completed_at: z.string().datetime(),
    repository_head: z.string().regex(HEAD),
    proposal_digest: z.string().regex(DIGEST),
    bundle_digest: z.string().regex(DIGEST),
    review_scope_digest: z.string().regex(DIGEST),
    registry_digest: z.string().regex(DIGEST),
    recompute_evidence_digest: z.string().regex(DIGEST),
    identity_evidence: z.unknown(),
    verdicts: z.array(
      z
        .object({
          plan_id: z.string().min(1),
          proposal_digest: z.string().regex(DIGEST),
          recomputed_proposal_digest: z.string().regex(DIGEST),
          verdict: z.literal("approve"),
        })
        .strict(),
    ),
  })
  .strict();
export type ClosureAuthorityReviewTaskEvidence = z.infer<typeof taskEvidenceSchema>;

export function loadClosureAuthorityReviewDraft(
  repoRoot: string,
  path: string,
): ClosureAuthorityReviewDraft {
  const absolute = canonicalExistingPath(repoRoot, path);
  return draftSchema.parse(JSON.parse(readFileSync(absolute, "utf8")));
}

export function loadClosureAuthorityReviewTaskEvidence(
  repoRoot: string,
  path: string,
): ClosureAuthorityReviewTaskEvidence {
  const absolute = canonicalExistingPath(repoRoot, path);
  return taskEvidenceSchema.parse(JSON.parse(readFileSync(absolute, "utf8")));
}

export function loadClosureAuthorityProposal(
  repoRoot: string,
  path: string,
): ClosureAuthorityBackfillRun {
  const absolute = canonicalExistingPath(repoRoot, path);
  return decodeClosureAuthorityBackfillRun(JSON.parse(readFileSync(absolute, "utf8")));
}

export function loadClosureAuthorityReviewReceipt(
  repoRoot: string,
  path: string,
): ClosureAuthorityBackfillReviewReceipt {
  const absolute = canonicalExistingPath(repoRoot, path);
  return decodeClosureAuthorityBackfillReviewReceipt(JSON.parse(readFileSync(absolute, "utf8")));
}

export function persistClosureAuthorityProposal(input: {
  repoRoot: string;
  outPath: string;
  run: ClosureAuthorityBackfillRun;
}): { path: string; digest: Digest } {
  const run = decodeClosureAuthorityBackfillRun(input.run);
  return atomicCreateJson(input.repoRoot, input.outPath, run);
}

export function createClosureAuthorityReviewDraft(input: {
  repoRoot: string;
  outPath: string;
  proposalPath: string;
  workerIdentity: string;
  taskIdentity: string;
  now: string;
}): { draft: ClosureAuthorityReviewDraft; path: string; digest: Digest } {
  const proposalAbsolute = canonicalExistingPath(input.repoRoot, input.proposalPath);
  const proposal = decodeClosureAuthorityBackfillRun(
    JSON.parse(readFileSync(proposalAbsolute, "utf8")),
  );
  const now = new Date(input.now);
  if (!Number.isFinite(now.valueOf())) throw new Error("draft time invalid");
  const draft = draftSchema.parse({
    schema_version: "closure-authority-review-draft.v1",
    draft_id: `review-${randomUUID()}`,
    created_at: now.toISOString(),
    expires_at: new Date(now.valueOf() + 3_600_000).toISOString(),
    repository_head: proposal.bundle.repository_head,
    proposal_path: input.proposalPath,
    proposal_digest: sha256(readFileSync(proposalAbsolute)),
    bundle_digest: proposal.bundle.bundle_digest,
    review_scope_digest: proposal.bundle.review_scope_digest,
    registry_digest: proposal.bundle.registry_digest,
    worker_identity: input.workerIdentity,
    task_identity: input.taskIdentity,
    candidate_plan_ids: proposal.candidate_plan_ids,
    authorizing: false,
  });
  return { draft, ...atomicCreateJson(input.repoRoot, input.outPath, draft) };
}

export function recordClosureAuthorityReview(input: {
  repoRoot: string;
  outPath: string;
  draft: unknown;
  taskEvidence: unknown;
  now: string;
  db?: HarnessDb;
}): { receipt: ClosureAuthorityBackfillReviewReceipt; path: string; digest: Digest } {
  const draft = draftSchema.parse(input.draft);
  const evidence = taskEvidenceSchema.parse(input.taskEvidence);
  if (draft.worker_identity === evidence.reviewer_identity)
    throw new Error("self-approval is forbidden");
  if (
    evidence.task_identity !== draft.task_identity ||
    evidence.worker_identity !== draft.worker_identity ||
    evidence.repository_head !== draft.repository_head ||
    evidence.proposal_digest !== draft.proposal_digest ||
    evidence.bundle_digest !== draft.bundle_digest ||
    evidence.review_scope_digest !== draft.review_scope_digest ||
    evidence.registry_digest !== draft.registry_digest
  )
    throw new Error("review task evidence binding mismatch");
  const now = Date.parse(input.now);
  const completed = Date.parse(evidence.completed_at);
  const expires = Date.parse(draft.expires_at);
  const clockSkewMs = 5_000;
  if (
    !Number.isFinite(now) ||
    completed < Date.parse(draft.created_at) ||
    now + clockSkewMs < completed ||
    now >= expires
  )
    throw new Error("review task evidence TTL invalid");
  const receipt = {
    schema_version: "closure-authority-backfill-review.v1" as const,
    receipt_id: `receipt-${sha256(
      JSON.stringify({
        draft_id: draft.draft_id,
        task_identity: evidence.task_identity,
        reviewer_identity: evidence.reviewer_identity,
        proposal_digest: draft.proposal_digest,
      }),
    ).slice(7, 39)}`,
    worker_identity: evidence.worker_identity,
    reviewer_identity: evidence.reviewer_identity,
    review_kind: evidence.review_kind,
    reviewed_at: evidence.completed_at,
    expires_at: draft.expires_at,
    repository_head: draft.repository_head,
    review_scope_digest: draft.review_scope_digest,
    registry_digest: draft.registry_digest,
    bundle_digest: draft.bundle_digest,
    proposal_set_digest: proposalSetDigest(
      evidence.verdicts.map((row) => ({
        plan_id: row.plan_id,
        digest: row.proposal_digest as Digest,
      })),
    ),
    identity_evidence: evidence.identity_evidence,
    verdicts: evidence.verdicts,
  };
  const persisted = createOrRecoverJson(input.repoRoot, input.outPath, receipt);
  try {
    if (input.db) {
      recordClosureAuthorityReviewReceipt(input.db, {
        receipt_id: receipt.receipt_id,
        worker_run_id: evidence.worker_identity,
        reviewer_run_id: evidence.reviewer_identity,
        artifact_path: persisted.path,
        artifact_digest: persisted.digest,
        repository_head: receipt.repository_head,
        bundle_digest: receipt.bundle_digest as Digest,
        proposal_set_digest: receipt.proposal_set_digest as Digest,
        recompute_digest: evidence.recompute_evidence_digest as Digest,
        verdict_digest: reviewVerdictDigest(receipt.verdicts),
        status: "completed",
        exit_code: 0,
        completed_at: evidence.completed_at,
      });
    }
  } catch (error) {
    if (!persisted.recovered) {
      unlinkSync(resolve(input.repoRoot, persisted.path));
      const directory = openSync(dirname(resolve(input.repoRoot, persisted.path)), "r");
      try {
        fsyncSync(directory);
      } finally {
        closeSync(directory);
      }
    }
    throw error;
  }
  return { receipt, path: persisted.path, digest: persisted.digest };
}

const terminalClass = z.enum(["accepted", "human_only", "invalid_escalated"]);
const partitionSchema = z
  .object({
    initial_plan_ids: z.array(z.string().min(1)),
    accepted_plan_ids: z.array(z.string().min(1)),
    human_only_plan_ids: z.array(z.string().min(1)),
    invalid_escalated_plan_ids: z.array(z.string().min(1)),
  })
  .strict();

export function verifyClosureAuthorityTerminalPartition(input: unknown): {
  initial_plan_ids: string[];
  accepted_plan_ids: string[];
  human_only_plan_ids: string[];
  invalid_escalated_plan_ids: string[];
} {
  const value = partitionSchema.parse(input);
  const initial = new Set(value.initial_plan_ids);
  if (initial.size !== value.initial_plan_ids.length)
    throw new Error("initial partition duplicate");
  const terminal = [
    ...value.accepted_plan_ids.map((id) => [id, "accepted"] as const),
    ...value.human_only_plan_ids.map((id) => [id, "human_only"] as const),
    ...value.invalid_escalated_plan_ids.map((id) => [id, "invalid_escalated"] as const),
  ];
  terminalClass.parse(terminal[0]?.[1] ?? "accepted");
  if (
    terminal.length !== initial.size ||
    new Set(terminal.map(([id]) => id)).size !== terminal.length ||
    terminal.some(([id]) => !initial.has(id))
  )
    throw new Error("I0=A disjoint-union H disjoint-union X conservation failed");
  return value;
}

export function buildClosureAuthorityCurrentPartition(input: {
  initial_plan_ids: string[];
  decisions: Array<{ plan_id: string; classification: string }>;
}): {
  eligible_plan_ids: string[];
  needs_plan_ids: string[];
  human_only_plan_ids: string[];
  invalid_escalated_plan_ids: string[];
} {
  if (
    new Set(input.initial_plan_ids).size !== input.initial_plan_ids.length ||
    input.decisions.length !== input.initial_plan_ids.length ||
    input.decisions.some((row, index) => row.plan_id !== input.initial_plan_ids[index])
  )
    throw new Error("current partition candidate census drift");
  const eligible: string[] = [];
  const needs: string[] = [];
  const human: string[] = [];
  const invalid: string[] = [];
  for (const row of input.decisions) {
    if (row.classification === "eligible_proposal") eligible.push(row.plan_id);
    else if (
      row.classification === "needs_design" ||
      row.classification === "needs_test_citation" ||
      row.classification === "needs_gate_authority"
    )
      needs.push(row.plan_id);
    else if (row.classification === "human_only") human.push(row.plan_id);
    else if (row.classification === "invalid") invalid.push(row.plan_id);
    else throw new Error(`unknown current partition classification: ${row.classification}`);
  }
  return {
    eligible_plan_ids: eligible,
    needs_plan_ids: needs,
    human_only_plan_ids: human,
    invalid_escalated_plan_ids: invalid,
  };
}

export function applyClosureAuthorityConvergenceWindow(input: {
  repoRoot: string;
  db: HarnessDb;
  bundle: ClosureAuthorityBackfillApplyBundle &
    Parameters<typeof applyClosureAuthorityBackfill>[0]["bundle"];
  receipt: unknown;
  now: string;
  cycleId: string;
  window: NonNullable<Parameters<typeof applyClosureAuthorityBackfill>[0]["window"]>;
  failpoint?: Parameters<typeof applyClosureAuthorityBackfill>[0]["crashAt"];
}) {
  validateClosureAuthorityBackfillReview({
    bundle: input.bundle,
    receipt: input.receipt,
    now: input.now,
  });
  return applyClosureAuthorityBackfill({
    repoRoot: input.repoRoot,
    registryPath: "docs/governance/closure-authority-registry.yaml",
    gateAllowlistPath: "docs/governance/closure-gate-allowlist.yaml",
    db: input.db,
    bundle: input.bundle,
    receipt: input.receipt,
    now: input.now,
    cycleId: input.cycleId,
    window: input.window,
    crashAt: input.failpoint,
  });
}

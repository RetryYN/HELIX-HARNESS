import { createHash, randomUUID } from "node:crypto";
import {
  appendFileSync,
  closeSync,
  copyFileSync,
  existsSync,
  fsyncSync,
  lstatSync,
  mkdirSync,
  openSync,
  readFileSync,
  realpathSync,
  renameSync,
  rmSync,
  truncateSync,
  writeFileSync,
} from "node:fs";
import { platform } from "node:os";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { parse as parseYaml, stringify as stringifyYaml } from "yaml";
import { z } from "zod";
import {
  analyzeClosureAuthorityDrift,
  type ClosureAuthority,
  classifyClosureAuthorities,
  parseClosureAuthorityRegistry,
} from "../policy/closure-authority-registry";
import { supportsDirectoryFsync } from "../policy/filesystem-durability";
import {
  parseIntraRuntimeReviewIdentityEvidence,
  verifyClosureAuthorityBackfillProductionBundle,
} from "./closure-authority-backfill-verifier";
import {
  acquireClosureMaterializationLock,
  releaseClosureMaterializationLock,
} from "./closure-materialization-lock";
import type { HarnessDb } from "./index";

type Digest = `sha256:${string}`;
const CANONICAL_REGISTRY_PATH = "docs/governance/closure-authority-registry.yaml";
export interface ClosureAuthorityBackfillApplyBundle {
  repository_head: string;
  registry_digest: Digest;
  review_scope_digest: Digest;
  bundle_digest: Digest;
  candidate_plan_ids: readonly string[];
  decisions: readonly {
    plan_id: string;
    classification: string;
    source_path?: string;
    reason?: string;
    required_action?: string;
    proposal: (ClosureAuthority & { field_sources?: unknown }) | null;
  }[];
}
const DIGEST = /^sha256:[0-9a-f]{64}$/;
const sha256 = (value: string | Buffer): Digest =>
  `sha256:${createHash("sha256").update(value).digest("hex")}`;

function stable(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  if (value !== null && typeof value === "object")
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, item]) => `${JSON.stringify(key)}:${stable(item)}`)
      .join(",")}}`;
  return JSON.stringify(value);
}

function readCanonicalComponent(repoRoot: string, candidate: string, mustExist: boolean): string {
  const root = realpathSync(repoRoot);
  const absolute = resolve(candidate);
  const rel = relative(root, absolute);
  if (rel === "" || rel.startsWith(`..${sep}`) || rel === ".." || isAbsolute(rel))
    throw new Error("backfill component outside repository");
  let cursor = root;
  for (const segment of rel.split(sep)) {
    cursor = join(cursor, segment);
    if (!existsSync(cursor)) continue;
    if (lstatSync(cursor).isSymbolicLink())
      throw new Error("backfill component symlink ancestry禁止");
  }
  if (!existsSync(absolute)) {
    if (mustExist) throw new Error("backfill component missing");
    return absolute;
  }
  const stat = lstatSync(absolute);
  if (!stat.isFile() || stat.isSymbolicLink() || realpathSync(absolute) !== absolute)
    throw new Error("backfill component canonical regular file required");
  return absolute;
}

const reviewReceiptSchema = z
  .object({
    schema_version: z.literal("closure-authority-backfill-review.v1"),
    receipt_id: z.string().regex(/^[A-Za-z0-9._-]{8,128}$/),
    worker_identity: z.string().min(1),
    reviewer_identity: z.string().min(1),
    review_kind: z.enum(["cross_runtime", "intra_runtime_subagent"]),
    reviewed_at: z.string().datetime(),
    expires_at: z.string().datetime(),
    repository_head: z.string().regex(/^[0-9a-f]{40}$/),
    review_scope_digest: z.string().regex(DIGEST),
    registry_digest: z.string().regex(DIGEST),
    bundle_digest: z.string().regex(DIGEST),
    proposal_set_digest: z.string().regex(DIGEST),
    identity_evidence: z.unknown(),
    verdicts: z.array(
      z
        .object({
          plan_id: z.string(),
          proposal_digest: z.string().regex(DIGEST),
          recomputed_proposal_digest: z.string().regex(DIGEST),
          verdict: z.literal("approve"),
        })
        .strict(),
    ),
  })
  .strict();
export type ClosureAuthorityBackfillReviewReceipt = z.infer<typeof reviewReceiptSchema>;

export interface ClosureAuthorityReviewDbReceipt {
  receipt_id: string;
  worker_run_id: string;
  reviewer_run_id: string;
  artifact_path: string;
  artifact_digest: Digest;
  repository_head: string;
  bundle_digest: Digest;
  proposal_set_digest: Digest;
  recompute_digest: Digest;
  verdict_digest: Digest;
  status: "completed";
  exit_code: 0;
  completed_at: string;
}

/**
 * review workflow専用writer。apply/callerがreceiptを自己生成するAPIではない。
 * review実行完了時だけ呼び、same ID/same bytesはidempotent、異内容はfail-closeする。
 */
export function recordClosureAuthorityReviewReceipt(
  db: HarnessDb,
  receipt: ClosureAuthorityReviewDbReceipt,
): void {
  const existing = db
    .prepare("SELECT * FROM closure_authority_review_receipts WHERE receipt_id=?")
    .get(receipt.receipt_id);
  if (existing) {
    const normalized = Object.fromEntries(Object.keys(receipt).map((key) => [key, existing[key]]));
    if (stable(normalized) !== stable(receipt))
      throw new Error("closure authority review receipt conflict");
    return;
  }
  db.prepare(`INSERT INTO closure_authority_review_receipts
    (receipt_id, worker_run_id, reviewer_run_id, artifact_path, artifact_digest,
     repository_head, bundle_digest, proposal_set_digest, recompute_digest,
     verdict_digest, status, exit_code, completed_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
    receipt.receipt_id,
    receipt.worker_run_id,
    receipt.reviewer_run_id,
    receipt.artifact_path,
    receipt.artifact_digest,
    receipt.repository_head,
    receipt.bundle_digest,
    receipt.proposal_set_digest,
    receipt.recompute_digest,
    receipt.verdict_digest,
    receipt.status,
    receipt.exit_code,
    receipt.completed_at,
  );
}

export function proposalDigest(proposal: unknown): Digest {
  return sha256(stable(proposal));
}

export function proposalSetDigest(
  proposals: readonly { plan_id: string; digest: Digest }[],
): Digest {
  return sha256(stable(proposals));
}

export function reviewVerdictDigest(verdicts: readonly unknown[]): Digest {
  return sha256(stable(verdicts));
}

export function validateClosureAuthorityBackfillReview(input: {
  bundle: ClosureAuthorityBackfillApplyBundle;
  receipt: unknown;
  now: string;
}): ClosureAuthorityBackfillReviewReceipt {
  const receipt = reviewReceiptSchema.parse(input.receipt);
  const reviewed = Date.parse(receipt.reviewed_at);
  const expires = Date.parse(receipt.expires_at);
  const now = Date.parse(input.now);
  if (receipt.worker_identity === receipt.reviewer_identity)
    throw new Error("worker and reviewer identity must differ");
  if (receipt.review_kind === "intra_runtime_subagent") {
    const evidence = parseIntraRuntimeReviewIdentityEvidence(receipt.identity_evidence);
    if (
      evidence.worker_task_id !== receipt.worker_identity ||
      evidence.reviewer_task_id !== receipt.reviewer_identity ||
      evidence.repository_head !== receipt.repository_head ||
      evidence.bundle_digest !== receipt.bundle_digest
    )
      throw new Error("intra-runtime review identity evidence join mismatch");
  } else {
    const evidence = z
      .object({
        schema_version: z.literal("closure-backfill-cross-runtime-review.v1"),
        worker_runtime: z.string().min(1),
        reviewer_runtime: z.string().min(1),
        worker_run_id: z.string().min(1),
        authority_receipt_id: z.string().min(1),
        authority_receipt_path: z.string().min(1),
        authority_receipt_digest: z.string().regex(DIGEST),
        recompute_evidence_digest: z.string().regex(DIGEST),
        repository_head: z.string().regex(/^[0-9a-f]{40}$/),
        bundle_digest: z.string().regex(DIGEST),
      })
      .strict()
      .parse(receipt.identity_evidence);
    if (
      evidence.worker_runtime === evidence.reviewer_runtime ||
      evidence.worker_runtime !== receipt.worker_identity ||
      evidence.reviewer_runtime !== receipt.reviewer_identity ||
      evidence.repository_head !== receipt.repository_head ||
      evidence.bundle_digest !== receipt.bundle_digest
    )
      throw new Error("cross-runtime review authority evidence join mismatch");
  }
  if (expires <= reviewed || expires - reviewed > 3_600_000 || now < reviewed || now >= expires)
    throw new Error("review receipt TTL/staleness invalid");
  if (
    receipt.repository_head !== input.bundle.repository_head ||
    receipt.review_scope_digest !== input.bundle.review_scope_digest ||
    receipt.registry_digest !== input.bundle.registry_digest ||
    receipt.bundle_digest !== input.bundle.bundle_digest
  )
    throw new Error("review receipt binding mismatch");
  const proposals = input.bundle.decisions.flatMap((decision) =>
    decision.classification === "eligible_proposal" && decision.proposal
      ? [{ plan_id: decision.plan_id, digest: proposalDigest(decision.proposal) }]
      : [],
  );
  if (new Set(receipt.verdicts.map((row) => row.plan_id)).size !== receipt.verdicts.length)
    throw new Error("duplicate review verdict");
  if (receipt.verdicts.length !== proposals.length)
    throw new Error("review verdict cardinality mismatch");
  const expectedSet = proposalSetDigest(proposals);
  if (receipt.proposal_set_digest !== expectedSet) throw new Error("proposal set digest mismatch");
  for (const proposal of proposals) {
    const rows = receipt.verdicts.filter((row) => row.plan_id === proposal.plan_id);
    if (
      rows.length !== 1 ||
      rows[0]?.proposal_digest !== proposal.digest ||
      rows[0]?.recomputed_proposal_digest !== proposal.digest
    )
      throw new Error(`proposal review exact digest mismatch: ${proposal.plan_id}`);
  }
  return receipt;
}

function verifyReviewAuthorityDb(input: {
  repoRoot: string;
  db: HarnessDb;
  receipt: ClosureAuthorityBackfillReviewReceipt;
  recomputeEvidenceDigest: Digest;
  bundle: ClosureAuthorityBackfillApplyBundle;
}): void {
  const evidence = input.receipt.identity_evidence as Record<string, unknown>;
  if (evidence.recompute_evidence_digest !== input.recomputeEvidenceDigest)
    throw new Error("review authority recompute evidence digest mismatch");
  if (input.receipt.review_kind === "cross_runtime") {
    const authorityArtifactSchema = z
      .object({
        schema_version: z.literal("closure-backfill-cross-runtime-authority.v1"),
        worker_run_id: z.string().min(1),
        reviewer_run_id: z.string().min(1),
        worker_runtime: z.string().min(1),
        reviewer_runtime: z.string().min(1),
        review_task_id: z.string().min(1),
        worker_scope_plan_id: z.string().min(1),
        reviewer_scope_plan_id: z.string().min(1),
        repository_head: z.string().regex(/^[0-9a-f]{40}$/),
        bundle_digest: z.string().regex(DIGEST),
        proposal_set_digest: z.string().regex(DIGEST),
        recompute_evidence_digest: z.string().regex(DIGEST),
        worker_completed_at: z.string().datetime(),
        reviewer_completed_at: z.string().datetime(),
        completed_at: z.string().datetime(),
        verdict: z.literal("approve"),
        verdicts: z.array(
          z
            .object({
              plan_id: z.string(),
              proposal_digest: z.string().regex(DIGEST),
              recomputed_proposal_digest: z.string().regex(DIGEST),
              verdict: z.literal("approve"),
            })
            .strict(),
        ),
      })
      .strict();
    const reviewerRow = input.db
      .prepare("SELECT * FROM model_runs WHERE run_id=?")
      .get(String(evidence.authority_receipt_id ?? ""));
    const workerRow = input.db
      .prepare("SELECT * FROM model_runs WHERE run_id=?")
      .get(String(evidence.worker_run_id ?? ""));
    const reviewRow = input.db
      .prepare("SELECT * FROM closure_authority_review_receipts WHERE receipt_id=?")
      .get(input.receipt.receipt_id);
    const path = String(evidence.authority_receipt_path ?? "");
    const authority = readCanonicalComponent(input.repoRoot, join(input.repoRoot, path), true);
    const authorityBytes = readFileSync(authority);
    const artifact = authorityArtifactSchema.parse(JSON.parse(authorityBytes.toString("utf8")));
    const reviewedAt = Date.parse(input.receipt.reviewed_at);
    const workerCompleted = Date.parse(artifact.worker_completed_at);
    const reviewerCompleted = Date.parse(artifact.reviewer_completed_at);
    if (
      !reviewerRow ||
      reviewerRow.run_id !== evidence.authority_receipt_id ||
      reviewerRow.runtime !== evidence.reviewer_runtime ||
      reviewerRow.role !== "reviewer" ||
      reviewerRow.evidence_path !== path ||
      !workerRow ||
      workerRow.run_id !== evidence.worker_run_id ||
      workerRow.runtime !== evidence.worker_runtime ||
      workerRow.role !== "worker" ||
      workerRow.plan_id !== artifact.worker_scope_plan_id ||
      !input.bundle.candidate_plan_ids.includes(artifact.worker_scope_plan_id) ||
      workerRow.completed_at !== artifact.worker_completed_at ||
      reviewerRow.plan_id !== artifact.reviewer_scope_plan_id ||
      !input.bundle.candidate_plan_ids.includes(artifact.reviewer_scope_plan_id) ||
      reviewerRow.completed_at !== artifact.reviewer_completed_at ||
      artifact.worker_run_id !== evidence.worker_run_id ||
      artifact.reviewer_run_id !== evidence.authority_receipt_id ||
      artifact.worker_runtime !== evidence.worker_runtime ||
      artifact.reviewer_runtime !== evidence.reviewer_runtime ||
      artifact.review_task_id !== input.receipt.receipt_id ||
      artifact.repository_head !== input.receipt.repository_head ||
      artifact.bundle_digest !== input.receipt.bundle_digest ||
      artifact.proposal_set_digest !== input.receipt.proposal_set_digest ||
      artifact.recompute_evidence_digest !== input.recomputeEvidenceDigest ||
      artifact.completed_at !== artifact.reviewer_completed_at ||
      artifact.reviewer_completed_at !== input.receipt.reviewed_at ||
      stable(artifact.verdicts) !== stable(input.receipt.verdicts) ||
      new Set(artifact.verdicts.map((row) => row.plan_id)).size !== artifact.verdicts.length ||
      workerCompleted > reviewerCompleted ||
      reviewedAt - workerCompleted > 3_600_000 ||
      sha256(authorityBytes) !== evidence.authority_receipt_digest ||
      !reviewRow ||
      reviewRow.receipt_id !== input.receipt.receipt_id ||
      reviewRow.worker_run_id !== artifact.worker_run_id ||
      reviewRow.reviewer_run_id !== artifact.reviewer_run_id ||
      reviewRow.artifact_path !== path ||
      reviewRow.artifact_digest !== evidence.authority_receipt_digest ||
      reviewRow.repository_head !== artifact.repository_head ||
      reviewRow.bundle_digest !== artifact.bundle_digest ||
      reviewRow.proposal_set_digest !== artifact.proposal_set_digest ||
      reviewRow.recompute_digest !== artifact.recompute_evidence_digest ||
      reviewRow.verdict_digest !== reviewVerdictDigest(artifact.verdicts) ||
      reviewRow.status !== "completed" ||
      Number(reviewRow.exit_code) !== 0 ||
      reviewRow.completed_at !== artifact.completed_at
    )
      throw new Error("cross-runtime model authority receipt exact join failed");
  } else {
    const row = input.db
      .prepare("SELECT * FROM session_events WHERE event_id=?")
      .get(String(evidence.termination_event_id ?? ""));
    const recordedAt = Date.parse(String(row?.recorded_at ?? ""));
    const reviewedAt = Date.parse(input.receipt.reviewed_at);
    if (
      !row ||
      row.event_id !== evidence.termination_event_id ||
      row.operation_id !== evidence.worker_task_id ||
      row.session_id !== evidence.reviewer_task_id ||
      row.event_kind !== "subagent_completed" ||
      row.payload_hash !== input.recomputeEvidenceDigest ||
      typeof row.recorded_at !== "string" ||
      !Number.isFinite(recordedAt) ||
      recordedAt > reviewedAt ||
      reviewedAt - recordedAt > 3_600_000
    )
      throw new Error("intra-runtime task termination event exact join failed");
  }
}

interface Journal {
  schema_version: "closure-authority-backfill-journal.v1";
  transaction_id: string;
  registry_path: string;
  before_path: string;
  before_digest: Digest;
  temp_path: string;
  after_digest: Digest;
  marker_path: string;
  ledger_path: string;
  ledger_before_size: number;
  ledger_before_digest: Digest;
  cycle_line: string;
  cycle_digest: Digest;
  journal_digest: Digest;
}

const cycleSchema = z
  .object({
    schema_version: z.literal("closure-authority-backfill-cycle.v1"),
    cycle_id: z.string().regex(/^[A-Za-z0-9._-]{8,128}$/),
    previous_cycle_digest: z.string().regex(DIGEST).nullable(),
    repository_head: z.string().regex(/^[0-9a-f]{40}$/),
    registry_before_digest: z.string().regex(DIGEST),
    registry_after_digest: z.string().regex(DIGEST),
    receipt_id: z.string().regex(/^[A-Za-z0-9._-]{8,128}$/),
    review_outcome: z.literal("applied"),
    review_receipt_path: z.string().min(1),
    candidate_plan_ids: z.array(z.string()),
    counts: z.record(z.number().int().nonnegative()),
    backfill_counts: z
      .object({
        eligible_proposal: z.number().int().nonnegative(),
        needs_design: z.number().int().nonnegative(),
        needs_test_citation: z.number().int().nonnegative(),
        needs_gate_authority: z.number().int().nonnegative(),
        human_only: z.number().int().nonnegative(),
        invalid: z.number().int().nonnegative(),
      })
      .strict(),
    backfill_delta: z
      .object({
        eligible_proposal: z.number().int(),
        needs_design: z.number().int(),
        needs_test_citation: z.number().int(),
        needs_gate_authority: z.number().int(),
        human_only: z.number().int(),
        invalid: z.number().int(),
      })
      .strict(),
    backlog: z.array(
      z
        .object({
          plan_id: z.string(),
          classification: z.string(),
          reason: z.string(),
          required_action: z.string(),
        })
        .strict(),
    ),
    window_coverage: z
      .object({
        total: z.number().int().nonnegative(),
        max_window_size: z.literal(100),
        windows: z.array(
          z
            .object({
              start: z.number().int().nonnegative(),
              end: z.number().int().nonnegative(),
              plan_ids_digest: z.string().regex(DIGEST),
            })
            .strict(),
        ),
      })
      .strict(),
    cycle_digest: z.string().regex(DIGEST),
  })
  .strict();

function verifyCycleLedger(bytes: Buffer): {
  size: number;
  digest: Digest;
  last: Digest | null;
  lastCycle: z.infer<typeof cycleSchema> | null;
} {
  if (bytes.length === 0) return { size: 0, digest: sha256(bytes), last: null, lastCycle: null };
  const text = bytes.toString("utf8");
  if (!text.endsWith("\n")) throw new Error("cycle ledger partial line");
  let previous: string | null = null;
  let lastCycle: z.infer<typeof cycleSchema> | null = null;
  for (const line of text.trimEnd().split("\n")) {
    const parsed = cycleSchema.parse(JSON.parse(line));
    const { cycle_digest, ...body } = parsed;
    if (parsed.previous_cycle_digest !== previous || cycle_digest !== sha256(stable(body)))
      throw new Error("cycle ledger previous/self digest mismatch");
    const classKeys = Object.keys(parsed.backfill_counts) as Array<
      keyof typeof parsed.backfill_counts
    >;
    if (
      classKeys.reduce((sum, key) => sum + parsed.backfill_counts[key], 0) !==
        parsed.window_coverage.total ||
      parsed.candidate_plan_ids.length !== parsed.window_coverage.total ||
      parsed.backlog.length !==
        parsed.window_coverage.total - parsed.backfill_counts.eligible_proposal ||
      new Set(parsed.backlog.map((row) => row.plan_id)).size !== parsed.backlog.length
    )
      throw new Error("cycle ledger conservation/backlog mismatch");
    let cursor = 0;
    for (const window of parsed.window_coverage.windows) {
      if (
        window.start !== cursor ||
        window.end <= window.start ||
        window.end - window.start > 100 ||
        window.end > parsed.candidate_plan_ids.length ||
        window.plan_ids_digest !==
          sha256(stable(parsed.candidate_plan_ids.slice(window.start, window.end)))
      )
        throw new Error("cycle ledger window coverage mismatch");
      cursor = window.end;
    }
    if (cursor !== parsed.window_coverage.total)
      throw new Error("cycle ledger window coverage incomplete");
    for (const key of classKeys) {
      const expectedDelta = lastCycle
        ? parsed.backfill_counts[key] - lastCycle.backfill_counts[key]
        : 0;
      if (parsed.backfill_delta[key] !== expectedDelta)
        throw new Error("cycle ledger class delta mismatch");
    }
    previous = cycle_digest;
    lastCycle = parsed;
  }
  return { size: bytes.length, digest: sha256(bytes), last: previous as Digest | null, lastCycle };
}

function durable(path: string, bytes: string | Buffer): void {
  mkdirSync(dirname(path), { recursive: true });
  const fd = openSync(path, "w", 0o600);
  try {
    writeFileSync(fd, bytes);
    fsyncSync(fd);
  } finally {
    closeSync(fd);
  }
}

function durableAppendOnly(path: string, bytes: string): void {
  mkdirSync(dirname(path), { recursive: true });
  try {
    const fd = openSync(path, "wx", 0o600);
    try {
      writeFileSync(fd, bytes);
      fsyncSync(fd);
    } finally {
      closeSync(fd);
    }
    fsyncDirectory(dirname(path));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
    if (readFileSync(path, "utf8") !== bytes)
      throw new Error("append-only review receipt conflict");
  }
}

function fsyncDirectory(path: string): void {
  const fd = openSync(path, "r");
  try {
    fsyncSync(fd);
  } finally {
    closeSync(fd);
  }
}

function sealJournal(journal: Omit<Journal, "journal_digest">): Journal {
  return { ...journal, journal_digest: sha256(stable(journal)) };
}

function readJournal(repoRoot: string, path: string): Journal {
  const canonicalJournal = readCanonicalComponent(repoRoot, path, true);
  const journal = JSON.parse(readFileSync(canonicalJournal, "utf8")) as Journal;
  const { journal_digest, ...body } = journal;
  if (
    journal.schema_version !== "closure-authority-backfill-journal.v1" ||
    !DIGEST.test(journal.before_digest) ||
    !DIGEST.test(journal.after_digest) ||
    !Number.isSafeInteger(journal.ledger_before_size) ||
    journal.ledger_before_size < 0 ||
    !DIGEST.test(journal.ledger_before_digest) ||
    !DIGEST.test(journal.cycle_digest) ||
    !journal.cycle_line.endsWith("\n") ||
    cycleSchema.parse(JSON.parse(journal.cycle_line)).cycle_digest !== journal.cycle_digest ||
    journal_digest !== sha256(stable(body))
  )
    throw new Error("backfill journal schema/digest不正");
  const base = join(
    repoRoot,
    ".helix/evidence/closure-authority-backfill/transactions",
    journal.transaction_id,
  );
  if (
    !/^[A-Za-z0-9._-]{8,128}$/.test(journal.transaction_id) ||
    journal.registry_path !== CANONICAL_REGISTRY_PATH ||
    journal.before_path !== join(base, "registry.before.yaml") ||
    journal.temp_path !== join(base, "registry.after.yaml") ||
    journal.marker_path !== join(base, "committed.json") ||
    journal.ledger_path !==
      join(repoRoot, ".helix/evidence/closure-authority-backfill/cycles.jsonl")
  )
    throw new Error("backfill journal path authority不正");
  readCanonicalComponent(repoRoot, journal.before_path, true);
  readCanonicalComponent(repoRoot, journal.temp_path, false);
  readCanonicalComponent(repoRoot, journal.marker_path, false);
  readCanonicalComponent(repoRoot, journal.ledger_path, false);
  return journal;
}

function completeJournalLedger(repoRoot: string, journal: Journal): void {
  readCanonicalComponent(repoRoot, journal.ledger_path, false);
  const current = existsSync(journal.ledger_path)
    ? readFileSync(journal.ledger_path)
    : Buffer.alloc(0);
  if (
    current.length < journal.ledger_before_size ||
    sha256(current.subarray(0, journal.ledger_before_size)) !== journal.ledger_before_digest
  )
    throw new Error("cycle ledger before-state drift");
  const expected = Buffer.concat([
    current.subarray(0, journal.ledger_before_size),
    Buffer.from(journal.cycle_line),
  ]);
  if (current.equals(expected)) {
    verifyCycleLedger(current);
    return;
  }
  if (current.length > expected.length || !expected.subarray(0, current.length).equals(current))
    throw new Error("cycle ledger unexpected append/tamper");
  mkdirSync(dirname(journal.ledger_path), { recursive: true });
  if (existsSync(journal.ledger_path))
    truncateSync(journal.ledger_path, journal.ledger_before_size);
  appendFileSync(journal.ledger_path, journal.cycle_line, { encoding: "utf8", mode: 0o600 });
  const fd = openSync(journal.ledger_path, "r");
  try {
    fsyncSync(fd);
  } finally {
    closeSync(fd);
  }
  verifyCycleLedger(readFileSync(journal.ledger_path));
}

function recoverClosureAuthorityBackfillUnlocked(repoRoot: string): void {
  const journalPath = join(repoRoot, ".helix/evidence/closure-authority-backfill/transaction.json");
  if (!existsSync(journalPath)) return;
  const journal = readJournal(repoRoot, journalPath);
  const registryPath = readCanonicalComponent(
    repoRoot,
    join(repoRoot, journal.registry_path),
    true,
  );
  if (existsSync(journal.marker_path)) {
    readCanonicalComponent(repoRoot, journal.marker_path, true);
    if (sha256(readFileSync(registryPath)) !== journal.after_digest)
      throw new Error("committed registry digest mismatch");
    completeJournalLedger(repoRoot, journal);
  } else {
    readCanonicalComponent(repoRoot, journal.before_path, true);
    if (
      !existsSync(journal.before_path) ||
      sha256(readFileSync(journal.before_path)) !== journal.before_digest
    )
      throw new Error("registry before-image unavailable");
    copyFileSync(journal.before_path, registryPath);
    const fd = openSync(registryPath, "r");
    try {
      fsyncSync(fd);
    } finally {
      closeSync(fd);
    }
    fsyncDirectory(dirname(registryPath));
  }
  rmSync(journal.temp_path, { force: true });
  rmSync(journal.before_path, { force: true });
  rmSync(journalPath, { force: true });
  fsyncDirectory(dirname(journalPath));
}

export function recoverClosureAuthorityBackfill(repoRoot: string): void {
  const lock = acquireClosureMaterializationLock(repoRoot);
  try {
    recoverClosureAuthorityBackfillUnlocked(repoRoot);
  } finally {
    releaseClosureMaterializationLock(lock);
  }
}

export interface ApplyClosureAuthorityBackfillInput {
  repoRoot: string;
  registryPath: string;
  bundle: ClosureAuthorityBackfillApplyBundle;
  receipt: unknown;
  now: string;
  cycleId?: string;
  platformName?: NodeJS.Platform;
  postVerify?: () => void;
  crashAt?:
    | "after-journal"
    | "after-rename"
    | "after-postverify"
    | "before-marker"
    | "after-marker"
    | "before-ledger"
    | "partial-ledger";
}

function closureInvariantSnapshot(
  repoRoot: string,
  bundle: ClosureAuthorityBackfillApplyBundle,
): Digest {
  const paths = [
    ".helix/harness.db",
    ...bundle.decisions.map((decision) => decision.proposal?.source_path ?? decision.source_path),
  ];
  if (paths.some((path) => !path)) throw new Error("candidate PLAN canonical path missing");
  const rows = [...new Set(paths as string[])].sort().map((path) => {
    const absolute = join(repoRoot, path);
    const stat = lstatSync(absolute);
    if (!stat.isFile() || stat.isSymbolicLink())
      throw new Error(`closure invariant canonical file required: ${path}`);
    return [path, sha256(readFileSync(absolute))];
  });
  return sha256(stable(rows));
}

function applyClosureAuthorityBackfillTransaction(
  input: ApplyClosureAuthorityBackfillInput,
  heldLock?: ReturnType<typeof acquireClosureMaterializationLock>,
): {
  applied_plan_ids: string[];
  registry_digest: Digest;
  cycle_digest: Digest;
} {
  if (!supportsDirectoryFsync(input.platformName ?? platform()))
    throw new Error("directory durability unavailable: backfill apply is read-only on Windows");
  if (input.registryPath !== CANONICAL_REGISTRY_PATH)
    throw new Error(`registry path must be ${CANONICAL_REGISTRY_PATH}`);
  const receipt = validateClosureAuthorityBackfillReview({
    bundle: input.bundle,
    receipt: input.receipt,
    now: input.now,
  });
  const reviewPath = join(
    input.repoRoot,
    ".helix/evidence/closure-authority-backfill/reviews",
    `${receipt.receipt_id}.json`,
  );
  const reviewBytes = JSON.stringify(receipt);
  readCanonicalComponent(input.repoRoot, reviewPath, false);
  durableAppendOnly(reviewPath, reviewBytes);
  const closureBefore = closureInvariantSnapshot(input.repoRoot, input.bundle);
  const lock = heldLock ?? acquireClosureMaterializationLock(input.repoRoot);
  let postVerified = false;
  try {
    recoverClosureAuthorityBackfillUnlocked(input.repoRoot);
    const registryAbsolute = readCanonicalComponent(
      input.repoRoot,
      join(input.repoRoot, input.registryPath),
      true,
    );
    const before = readFileSync(registryAbsolute);
    if (sha256(before) !== input.bundle.registry_digest)
      throw new Error("registry generation CAS mismatch");
    const registry = parseClosureAuthorityRegistry(parseYaml(before.toString("utf8")));
    const beforeClassifications = classifyClosureAuthorities({
      candidatePlanIds: input.bundle.candidate_plan_ids,
      registry,
      drifts: analyzeClosureAuthorityDrift({ repositoryRoot: input.repoRoot, registry }),
    });
    const proposals = input.bundle.decisions.flatMap((decision) =>
      decision.classification === "eligible_proposal" && decision.proposal
        ? [decision.proposal]
        : [],
    );
    const existing = new Set(registry.authorities.map((row) => row.plan_id));
    if (proposals.some((row) => existing.has(row.plan_id)))
      throw new Error("existing registry row overwriteは禁止");
    const prospective = parseClosureAuthorityRegistry({
      schema_version: registry.schema_version,
      authorities: [
        ...registry.authorities,
        ...proposals.map(({ field_sources: _source, ...row }) => row),
      ],
    });
    if (
      stable(prospective.authorities.slice(0, registry.authorities.length)) !==
      stable(registry.authorities)
    )
      throw new Error("existing registry semantic/order mutation detected");
    const classifications = classifyClosureAuthorities({
      candidatePlanIds: input.bundle.candidate_plan_ids,
      registry: prospective,
      drifts: analyzeClosureAuthorityDrift({
        repositoryRoot: input.repoRoot,
        registry: prospective,
      }),
    });
    for (const proposal of proposals)
      if (
        classifications.find((row) => row.plan_id === proposal.plan_id)?.classification !==
        "eligible"
      )
        throw new Error(`prospective reclassification failed: ${proposal.plan_id}`);
    const proposedIds = new Set(proposals.map((proposal) => proposal.plan_id));
    for (const beforeRow of beforeClassifications) {
      if (proposedIds.has(beforeRow.plan_id)) continue;
      const afterRow = classifications.find((row) => row.plan_id === beforeRow.plan_id);
      if (stable(afterRow) !== stable(beforeRow))
        throw new Error(`non-target classification drift: ${beforeRow.plan_id}`);
    }
    if (classifications.length !== input.bundle.candidate_plan_ids.length)
      throw new Error("post-apply census conservation failed");

    const transactionId = input.cycleId ?? randomUUID();
    const base = join(
      input.repoRoot,
      ".helix/evidence/closure-authority-backfill/transactions",
      transactionId,
    );
    const beforePath = join(base, "registry.before.yaml");
    const tempPath = join(base, "registry.after.yaml");
    const markerPath = join(base, "committed.json");
    const journalPath = join(
      input.repoRoot,
      ".helix/evidence/closure-authority-backfill/transaction.json",
    );
    const after = stringifyYaml(prospective);
    readCanonicalComponent(input.repoRoot, beforePath, false);
    readCanonicalComponent(input.repoRoot, tempPath, false);
    readCanonicalComponent(input.repoRoot, markerPath, false);
    readCanonicalComponent(input.repoRoot, journalPath, false);
    durable(beforePath, before);
    durable(tempPath, after);
    const ledgerPath = join(
      input.repoRoot,
      ".helix/evidence/closure-authority-backfill/cycles.jsonl",
    );
    const ledgerBefore = existsSync(ledgerPath) ? readFileSync(ledgerPath) : Buffer.alloc(0);
    const ledgerState = verifyCycleLedger(ledgerBefore);
    const counts = Object.fromEntries(
      ["eligible", "authority_backfill_required", "human_only", "invalid"].map((kind) => [
        kind,
        classifications.filter((row) => row.classification === kind).length,
      ]),
    );
    const backfillClasses = [
      "eligible_proposal",
      "needs_design",
      "needs_test_citation",
      "needs_gate_authority",
      "human_only",
      "invalid",
    ] as const;
    const backfillCounts = Object.fromEntries(
      backfillClasses.map((classification) => [
        classification,
        input.bundle.decisions.filter((decision) => decision.classification === classification)
          .length,
      ]),
    ) as Record<(typeof backfillClasses)[number], number>;
    const previousBackfillCounts = ledgerState.lastCycle?.backfill_counts ?? null;
    const backfillDelta = Object.fromEntries(
      backfillClasses.map((classification) => [
        classification,
        previousBackfillCounts === null
          ? 0
          : backfillCounts[classification] - previousBackfillCounts[classification],
      ]),
    ) as Record<(typeof backfillClasses)[number], number>;
    const backlog = input.bundle.decisions
      .filter((decision) => decision.classification !== "eligible_proposal")
      .map((decision) => {
        if (!decision.reason || !decision.required_action)
          throw new Error(`backfill backlog reason/action missing: ${decision.plan_id}`);
        return {
          plan_id: decision.plan_id,
          classification: decision.classification,
          reason: decision.reason,
          required_action: decision.required_action,
        };
      })
      .sort((a, b) => a.plan_id.localeCompare(b.plan_id));
    const windows = [] as Array<{ start: number; end: number; plan_ids_digest: Digest }>;
    for (let start = 0; start < input.bundle.candidate_plan_ids.length; start += 100) {
      const end = Math.min(start + 100, input.bundle.candidate_plan_ids.length);
      windows.push({
        start,
        end,
        plan_ids_digest: sha256(stable(input.bundle.candidate_plan_ids.slice(start, end))),
      });
    }
    const cycleBody = {
      schema_version: "closure-authority-backfill-cycle.v1" as const,
      cycle_id: transactionId,
      previous_cycle_digest: ledgerState.last,
      repository_head: input.bundle.repository_head,
      registry_before_digest: input.bundle.registry_digest,
      registry_after_digest: sha256(after),
      receipt_id: receipt.receipt_id,
      review_outcome: "applied" as const,
      review_receipt_path: relative(input.repoRoot, reviewPath).split(sep).join("/"),
      candidate_plan_ids: [...input.bundle.candidate_plan_ids],
      counts,
      backfill_counts: backfillCounts,
      backfill_delta: backfillDelta,
      backlog,
      window_coverage: {
        total: input.bundle.candidate_plan_ids.length,
        max_window_size: 100 as const,
        windows,
      },
    };
    const cycle = { ...cycleBody, cycle_digest: sha256(stable(cycleBody)) };
    const cycleLine = `${JSON.stringify(cycle)}\n`;
    const journal = sealJournal({
      schema_version: "closure-authority-backfill-journal.v1",
      transaction_id: transactionId,
      registry_path: input.registryPath,
      before_path: beforePath,
      before_digest: sha256(before),
      temp_path: tempPath,
      after_digest: sha256(after),
      marker_path: markerPath,
      ledger_path: ledgerPath,
      ledger_before_size: ledgerState.size,
      ledger_before_digest: ledgerState.digest,
      cycle_line: cycleLine,
      cycle_digest: cycle.cycle_digest,
    });
    durable(journalPath, JSON.stringify(journal));
    fsyncDirectory(dirname(journalPath));
    if (input.crashAt === "after-journal") throw new Error("injected crash after-journal");
    readCanonicalComponent(input.repoRoot, tempPath, true);
    renameSync(tempPath, registryAbsolute);
    fsyncDirectory(dirname(registryAbsolute));
    if (input.crashAt === "after-rename") throw new Error("injected crash after-rename");
    input.postVerify?.();
    const verifiedBytes = readFileSync(registryAbsolute);
    if (sha256(verifiedBytes) !== journal.after_digest)
      throw new Error("postverify registry digest mismatch");
    const verifiedRegistry = parseClosureAuthorityRegistry(
      parseYaml(verifiedBytes.toString("utf8")),
    );
    if (
      stable(verifiedRegistry.authorities.slice(0, registry.authorities.length)) !==
      stable(registry.authorities)
    )
      throw new Error("postverify existing registry semantic/order drift");
    const verifiedClassifications = classifyClosureAuthorities({
      candidatePlanIds: input.bundle.candidate_plan_ids,
      registry: verifiedRegistry,
      drifts: analyzeClosureAuthorityDrift({
        repositoryRoot: input.repoRoot,
        registry: verifiedRegistry,
      }),
    });
    if (stable(verifiedClassifications) !== stable(classifications))
      throw new Error("postverify classification exact diff mismatch");
    if (closureInvariantSnapshot(input.repoRoot, input.bundle) !== closureBefore)
      throw new Error("closure status/approval mutation detected");
    if (input.crashAt === "after-postverify" || input.crashAt === "before-marker")
      throw new Error(`injected crash ${input.crashAt}`);
    readCanonicalComponent(input.repoRoot, markerPath, false);
    durable(
      markerPath,
      JSON.stringify({ transaction_id: transactionId, registry_digest: journal.after_digest }),
    );
    fsyncDirectory(dirname(markerPath));
    postVerified = true;
    if (input.crashAt === "after-marker" || input.crashAt === "before-ledger")
      throw new Error(`injected crash ${input.crashAt}`);
    if (input.crashAt === "partial-ledger") {
      mkdirSync(dirname(ledgerPath), { recursive: true });
      appendFileSync(ledgerPath, cycleLine.slice(0, Math.floor(cycleLine.length / 2)));
      throw new Error("injected crash partial-ledger");
    }
    completeJournalLedger(input.repoRoot, journal);
    rmSync(journalPath, { force: true });
    rmSync(beforePath, { force: true });
    fsyncDirectory(dirname(journalPath));
    return {
      applied_plan_ids: proposals.map((row) => row.plan_id),
      registry_digest: journal.after_digest,
      cycle_digest: cycle.cycle_digest,
    };
  } catch (error) {
    try {
      if (!postVerified) {
        const journalPath = join(
          input.repoRoot,
          ".helix/evidence/closure-authority-backfill/transaction.json",
        );
        if (existsSync(journalPath))
          rmSync(readJournal(input.repoRoot, journalPath).marker_path, { force: true });
      }
      recoverClosureAuthorityBackfillUnlocked(input.repoRoot);
    } catch {
      // Original failure remains primary; next invocation will fail-close on the durable journal.
    }
    throw error;
  } finally {
    if (!heldLock) releaseClosureMaterializationLock(lock);
  }
}

export interface ApplyClosureAuthorityBackfillProductionInput
  extends ApplyClosureAuthorityBackfillInput {
  db: HarnessDb;
  gateAllowlistPath: "docs/governance/closure-gate-allowlist.yaml";
  bundle: Parameters<typeof verifyClosureAuthorityBackfillProductionBundle>[0]["bundle"] &
    ClosureAuthorityBackfillApplyBundle;
}

/** production entry: lock/recovery内でsource/DB receipt/bundle/gate allowlistを再計算してからmutationする。 */
export function applyClosureAuthorityBackfill(
  input: ApplyClosureAuthorityBackfillProductionInput,
): ReturnType<typeof applyClosureAuthorityBackfillTransaction> {
  const lock = acquireClosureMaterializationLock(input.repoRoot);
  try {
    recoverClosureAuthorityBackfillUnlocked(input.repoRoot);
    const verification = verifyClosureAuthorityBackfillProductionBundle({
      repoRoot: input.repoRoot,
      db: input.db,
      bundle: input.bundle,
      gateAllowlistPath: input.gateAllowlistPath,
      now: input.now,
    });
    const authorityReceipt = validateClosureAuthorityBackfillReview({
      bundle: input.bundle,
      receipt: input.receipt,
      now: input.now,
    });
    verifyReviewAuthorityDb({
      repoRoot: input.repoRoot,
      db: input.db,
      receipt: authorityReceipt,
      recomputeEvidenceDigest: verification.source_digest,
      bundle: input.bundle,
    });
    return applyClosureAuthorityBackfillTransaction(input, lock);
  } finally {
    releaseClosureMaterializationLock(lock);
  }
}

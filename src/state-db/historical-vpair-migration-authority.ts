import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  closeSync,
  fsyncSync,
  linkSync,
  mkdirSync,
  openSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { parse as parseYaml } from "yaml";
import { z } from "zod";
import { L8_PAIR_ENFORCEMENT_DATE } from "../lint/plan-descent";
import { findingFingerprint, planSemanticDigest } from "../lint/plan-specific-vpair-binding";
import {
  classifyHistoricalVpairMigration,
  type HistoricalBundle,
  type HistoricalCandidate,
  parseHistoricalMigrationReview,
  parseHistoricalVpairAuthority,
  validateHistoricalMigrationReview,
} from "../policy/historical-vpair-migration-authority";
import { decodeClosureAuthorityBackfillRun } from "./closure-authority-backfill-production";
import type { HarnessDb } from "./index";
export const HISTORICAL_AUTHORITY_PATH = "config/historical-vpair-migration-authority.json";
export const HISTORICAL_AUTHORITY_MANIFEST_PATH =
  "config/historical-vpair-migration-authority.manifest.json";
export const HISTORICAL_EVIDENCE_DIR = ".helix/evidence/historical-vpair-migration";
export const HISTORICAL_MANIFEST_GENESIS_DIGEST =
  "sha256:0701db92feb0005d7e3ed8aeb0af1b367ab44785d0d8e71b10a91cc5dc12b065";
const sha = (v: string | Buffer) =>
  `sha256:${createHash("sha256").update(v).digest("hex")}` as const;
const manifestSchema = z
  .object({
    schema_version: z.literal("historical-vpair-migration-authority-manifest.v1"),
    authority_path: z.literal(HISTORICAL_AUTHORITY_PATH),
    repository_identity: z.string(),
    expected_tree_mode: z.literal("100644"),
    expected_blob_oid: z.string().regex(/^[0-9a-f]{40}$/),
    expected_raw_digest: z.string().regex(/^sha256:[0-9a-f]{64}$/),
    generation: z.number().int().positive(),
    previous_manifest_digest: z
      .string()
      .regex(/^sha256:[0-9a-f]{64}$/)
      .nullable(),
    review_digest: z
      .string()
      .regex(/^sha256:[0-9a-f]{64}$/)
      .nullable(),
    manifest_digest: z.string().regex(/^sha256:[0-9a-f]{64}$/),
  })
  .strict();
const manifestReviewReceiptSchema = z
  .object({
    review_digest: z.string().regex(/^sha256:[0-9a-f]{64}$/),
    previous_manifest_digest: z.string().regex(/^sha256:[0-9a-f]{64}$/),
    new_manifest_digest: z.string().regex(/^sha256:[0-9a-f]{64}$/),
    authority_raw_digest: z.string().regex(/^sha256:[0-9a-f]{64}$/),
    bundle_digest: z.string().regex(/^sha256:[0-9a-f]{64}$/),
    worker_identity: z.string().min(1),
    reviewer_identity: z.string().min(1),
    worker_termination_event_id: z.string().min(1),
    reviewer_termination_event_id: z.string().min(1),
    reviewed_at: z.string().datetime(),
    authority_generation: z.number().int().positive(),
    verdict_digest: z.string().regex(/^sha256:[0-9a-f]{64}$/),
    review_chain_artifact_digest: z.string().regex(/^sha256:[0-9a-f]{64}$/),
    review_chain_sequence: z.number().int().positive(),
  })
  .strict();

export function canonicalRepositoryIdentity(value: string): string {
  const trimmed = value
    .trim()
    .replace(/^git\+/, "")
    .replace(/\/$/, "")
    .replace(/\.git$/, "");
  if (trimmed.startsWith("/")) return `file://${trimmed}`;
  const scp = /^git@([^:]+):(.+)$/.exec(trimmed);
  if (scp) return `https://${scp[1]?.toLowerCase()}/${scp[2]?.replace(/^\/+/, "")}`;
  let url: URL;
  try {
    url = new URL(trimmed);
  } catch (error) {
    void error;
    throw new Error("unsupported repository identity");
  }
  if (!["https:", "ssh:", "file:"].includes(url.protocol))
    throw new Error("unsupported repository identity");
  if (url.protocol === "file:") return `file://${url.pathname.replace(/\/$/, "")}`;
  const path = url.pathname.replace(/^\/+/, "").replace(/\.git\/?$/, "");
  if (!url.hostname || !path || path.includes("..")) throw new Error("invalid repository identity");
  return `https://${url.hostname.toLowerCase()}/${path}`;
}

export interface HistoricalChainArtifact {
  schema_version: "historical-vpair-migration-chain.v1";
  artifact_kind: "authority" | "review";
  sequence: number;
  previous_artifact_digest: `sha256:${string}` | null;
  repository_head: string;
  repository_identity: string;
  bundle_digest: `sha256:${string}`;
  payload: unknown;
  artifact_digest: `sha256:${string}`;
}
export function auditHistoricalTempArtifacts(input: {
  repoRoot: string;
  nowMs: number;
  ttlMs?: number;
  cleanup?: boolean;
}) {
  const ttl = input.ttlMs ?? 3_600_000;
  const findings: Array<{
    path: string;
    owner_pid: number;
    age_ms: number;
    live: boolean;
    removed: boolean;
  }> = [];
  for (const kind of ["authority", "review"] as const) {
    const dir = join(input.repoRoot, HISTORICAL_EVIDENCE_DIR, kind);
    let names: string[] = [];
    try {
      names = readdirSync(dir);
    } catch (error) {
      void error;
      continue;
    }
    for (const name of names) {
      const match = /^\d{8}\.json\.(\d+)\.([0-9a-f]{16})\.tmp$/.exec(name);
      if (!match) continue;
      const pid = Number(match[1]);
      let live = true;
      try {
        process.kill(pid, 0);
      } catch (error) {
        void error;
        live = false;
      }
      const path = join(dir, name);
      const age = input.nowMs - statSync(path).mtimeMs;
      let removed = false;
      if (input.cleanup && !live && age >= ttl) {
        rmSync(path);
        removed = true;
      }
      findings.push({ path, owner_pid: pid, age_ms: age, live, removed });
    }
  }
  return { schema_version: "historical-temp-audit.v1" as const, ttl_ms: ttl, findings };
}
const stableJson = (value: unknown): string => {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  if (value && typeof value === "object")
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${JSON.stringify(k)}:${stableJson(v)}`)
      .join(",")}}`;
  return JSON.stringify(value);
};
function buildNextHistoricalAuthorityManifest(input: {
  previous: z.infer<typeof manifestSchema>;
  newAuthorityBytes: Buffer;
  bundleDigest: `sha256:${string}`;
  repositoryIdentity?: string;
  reviewReceipt: unknown;
}) {
  const reviewReceipt = manifestReviewReceiptSchema
    .omit({ new_manifest_digest: true })
    .parse(input.reviewReceipt);
  const { review_digest: suppliedReviewDigest, ...reviewReceiptBody } = reviewReceipt;
  if (
    suppliedReviewDigest !== sha(stableJson(reviewReceiptBody)) ||
    reviewReceipt.worker_identity === reviewReceipt.reviewer_identity
  )
    throw new Error("next manifest strict review receipt invalid");
  const parsed = manifestSchema.parse(input.previous);
  const { manifest_digest: previousDigest } = parsed;
  if (
    previousDigest !==
    sha(
      stableJson(
        Object.fromEntries(Object.entries(parsed).filter(([key]) => key !== "manifest_digest")),
      ),
    )
  )
    throw new Error("previous manifest digest invalid");
  const rawDigest = sha(input.newAuthorityBytes);
  const blobOid = createHash("sha1")
    .update(`blob ${input.newAuthorityBytes.length}\0`)
    .update(input.newAuthorityBytes)
    .digest("hex");
  if (
    reviewReceipt.previous_manifest_digest !== previousDigest ||
    reviewReceipt.authority_raw_digest !== rawDigest ||
    reviewReceipt.bundle_digest !== input.bundleDigest ||
    reviewReceipt.authority_generation !== parsed.generation + 1
  )
    throw new Error("next manifest review/authority/bundle binding invalid");
  const body = {
    ...parsed,
    repository_identity: input.repositoryIdentity ?? parsed.repository_identity,
    expected_blob_oid: blobOid,
    expected_raw_digest: rawDigest,
    generation: parsed.generation + 1,
    previous_manifest_digest: previousDigest,
    review_digest: reviewReceipt.review_digest,
  };
  delete (body as Partial<typeof body>).manifest_digest;
  return manifestSchema.parse({ ...body, manifest_digest: sha(stableJson(body)) });
}
export function sealHistoricalAuthorityGeneration(input: {
  repoRoot: string;
  db: HarnessDb;
  bundle: HistoricalBundle;
  authorityTip: HistoricalChainArtifact;
  review: unknown;
  newAuthorityBytes: Buffer;
  previousManifest: unknown;
  repositoryHead: string;
  repositoryIdentity: string;
  now: string;
}) {
  const validatedReview = validateHistoricalMigrationReviewWithDb({
    db: input.db,
    value: input.review,
    bundle: input.bundle,
    now: input.now,
    authorityBinding: {
      artifactDigest: input.authorityTip.artifact_digest,
      generation: input.authorityTip.sequence,
    },
  });
  let reviewArtifact: HistoricalChainArtifact;
  let disposition: "created" | "reused" = "created";
  const reviewDir = join(input.repoRoot, HISTORICAL_EVIDENCE_DIR, "review");
  const existingNames = (() => {
    try {
      return readdirSync(reviewDir)
        .filter((name) => /^\d{8}\.json$/.test(name))
        .sort();
    } catch (error) {
      void error;
      return [];
    }
  })();
  const existingTip =
    existingNames.length > 0
      ? (JSON.parse(
          readFileSync(join(reviewDir, existingNames.at(-1) ?? ""), "utf8"),
        ) as HistoricalChainArtifact)
      : null;
  if (
    existingTip &&
    (existingTip.payload as Record<string, unknown>)?.review_digest ===
      validatedReview.review_digest
  ) {
    const parsedExisting = parseHistoricalMigrationReview(existingTip.payload);
    if (stableJson(parsedExisting) !== stableJson(validatedReview))
      throw new Error("historical seal idempotency payload conflict");
    const validatedTip = loadHistoricalReviewChainTip({
      repoRoot: input.repoRoot,
      bundle: input.bundle,
      review: validatedReview,
      authorityTip: input.authorityTip,
    });
    if (
      validatedTip.artifact_digest !== existingTip.artifact_digest ||
      validatedTip.repository_head !== input.repositoryHead ||
      validatedTip.repository_identity !== input.repositoryIdentity ||
      validatedTip.bundle_digest !== input.bundle.bundle_digest
    )
      throw new Error("historical seal reuse envelope/context invalid");
    reviewArtifact = validatedTip;
    disposition = "reused";
  } else
    reviewArtifact = appendHistoricalReviewArtifact({
      repoRoot: input.repoRoot,
      repositoryHead: input.repositoryHead,
      repositoryIdentity: input.repositoryIdentity,
      bundleDigest: input.bundle.bundle_digest,
      payload: validatedReview,
      expectedPreviousDigest: validatedReview.previous_digest as `sha256:${string}` | null,
      db: input.db,
      authorityTip: input.authorityTip,
      bundle: input.bundle,
      now: input.now,
    });
  const previous = manifestSchema.parse(input.previousManifest);
  const receiptBody = {
    previous_manifest_digest: previous.manifest_digest,
    authority_raw_digest: sha(input.newAuthorityBytes),
    bundle_digest: input.bundle.bundle_digest,
    worker_identity: validatedReview.worker_identity,
    reviewer_identity: validatedReview.reviewer_identity,
    worker_termination_event_id: validatedReview.worker_termination_event_id,
    reviewer_termination_event_id: validatedReview.termination_event_id,
    reviewed_at: validatedReview.reviewed_at,
    authority_generation: validatedReview.authority_generation,
    verdict_digest: sha(stableJson(validatedReview.verdicts)),
    review_chain_artifact_digest: reviewArtifact.artifact_digest,
    review_chain_sequence: reviewArtifact.sequence,
  };
  const reviewDigest = sha(stableJson(receiptBody));
  const manifest = buildNextHistoricalAuthorityManifest({
    previous,
    newAuthorityBytes: input.newAuthorityBytes,
    bundleDigest: input.bundle.bundle_digest,
    repositoryIdentity: input.repositoryIdentity,
    reviewReceipt: { review_digest: reviewDigest, ...receiptBody },
  });
  const receipt = manifestReviewReceiptSchema.parse({
    review_digest: reviewDigest,
    new_manifest_digest: manifest.manifest_digest,
    ...receiptBody,
  });
  return {
    schema_version: "historical-authority-generation-seal.v1" as const,
    manifest,
    receipt,
    reviewArtifact,
    authorityArchiveBytes: input.newAuthorityBytes,
    disposition,
  };
}
function appendHistoricalChainArtifact(input: {
  repoRoot: string;
  artifactKind: "authority" | "review";
  repositoryHead: string;
  repositoryIdentity: string;
  bundleDigest: `sha256:${string}`;
  payload: unknown;
  expectedPreviousDigest: `sha256:${string}` | null;
}): HistoricalChainArtifact {
  const dir = join(input.repoRoot, HISTORICAL_EVIDENCE_DIR, input.artifactKind);
  mkdirSync(dir, { recursive: true });
  const names = readdirSync(dir)
    .filter((name) => /^\d{8}\.json$/.test(name))
    .sort();
  let previous: HistoricalChainArtifact | null = null;
  for (let index = 0; index < names.length; index++) {
    if (names[index] !== `${String(index + 1).padStart(8, "0")}.json`)
      throw new Error("historical artifact chain gap/fork");
    const name = names[index];
    if (!name) throw new Error("historical artifact chain gap/fork");
    const artifact = JSON.parse(readFileSync(join(dir, name), "utf8")) as HistoricalChainArtifact;
    const { artifact_digest: recordedDigest, ...artifactBody } = artifact;
    if (
      artifact.schema_version !== "historical-vpair-migration-chain.v1" ||
      artifact.artifact_kind !== input.artifactKind ||
      !artifact.payload ||
      typeof artifact.payload !== "object" ||
      Array.isArray(artifact.payload) ||
      recordedDigest !== sha(stableJson(artifactBody)) ||
      artifact.sequence !== index + 1 ||
      artifact.previous_artifact_digest !== (previous?.artifact_digest ?? null)
    )
      throw new Error("historical artifact full-prefix/schema/digest invalid");
    previous = artifact;
  }
  const sequence = names.length + 1;
  if ((previous?.artifact_digest ?? null) !== input.expectedPreviousDigest)
    throw new Error("historical artifact CAS/previous digest mismatch");
  if (
    previous &&
    (previous.repository_head !== input.repositoryHead ||
      previous.repository_identity !== input.repositoryIdentity ||
      previous.bundle_digest !== input.bundleDigest)
  )
    throw new Error("historical artifact HEAD/repository/bundle continuity mismatch");
  const body = {
    schema_version: "historical-vpair-migration-chain.v1" as const,
    artifact_kind: input.artifactKind,
    sequence,
    previous_artifact_digest: input.expectedPreviousDigest,
    repository_head: input.repositoryHead,
    repository_identity: input.repositoryIdentity,
    bundle_digest: input.bundleDigest,
    payload: input.payload,
  };
  const artifact = { ...body, artifact_digest: sha(stableJson(body)) };
  const bytes = `${stableJson(artifact)}\n`;
  const target = join(dir, `${String(sequence).padStart(8, "0")}.json`);
  const nonce = createHash("sha256")
    .update(`${process.pid}:${Date.now()}:${Math.random()}`)
    .digest("hex")
    .slice(0, 16);
  const temp = `${target}.${process.pid}.${nonce}.tmp`;
  writeFileSync(temp, bytes, { flag: "wx", mode: 0o600 });
  const tempFd = openSync(temp, "r");
  fsyncSync(tempFd);
  closeSync(tempFd);
  try {
    linkSync(temp, target);
  } catch (error) {
    try {
      if (readFileSync(target, "utf8") === bytes) return artifact;
    } catch (readError) {
      void readError;
    }
    throw error;
  } finally {
    rmSync(temp, { force: true });
  }
  const dirFd = openSync(dir, "r");
  fsyncSync(dirFd);
  closeSync(dirFd);
  return artifact;
}
export function appendHistoricalAuthorityArtifact(
  input: Omit<Parameters<typeof appendHistoricalChainArtifact>[0], "artifactKind"> & {
    payload: unknown;
  },
) {
  const payload = z
    .object({
      manifest_generation: z.number().int().positive(),
      authority_digest: z.string().regex(/^sha256:[0-9a-f]{64}$/),
    })
    .strict()
    .parse(input.payload);
  return appendHistoricalChainArtifact({ ...input, payload, artifactKind: "authority" });
}
export function appendHistoricalReviewArtifact(
  input: Omit<Parameters<typeof appendHistoricalChainArtifact>[0], "artifactKind"> & {
    db: HarnessDb;
    authorityTip: HistoricalChainArtifact;
    payload: unknown;
    bundle: HistoricalBundle;
    now: string;
  },
) {
  const payload = validateHistoricalMigrationReviewWithDb({
    db: input.db,
    value: input.payload,
    bundle: input.bundle,
    now: input.now,
    authorityBinding: {
      artifactDigest: input.authorityTip.artifact_digest,
      generation: input.authorityTip.sequence,
    },
  });
  if (
    input.authorityTip.artifact_kind !== "authority" ||
    payload.authority_artifact_digest !== input.authorityTip.artifact_digest ||
    payload.bundle_digest !== input.bundleDigest
  )
    throw new Error("review authority chain tip exact join failed");
  const { db: _db, authorityTip: _tip, bundle: _bundle, now: _now, ...rest } = input;
  return appendHistoricalChainArtifact({ ...rest, payload, artifactKind: "review" });
}
export function historicalPlanSemanticDigest(source: string): `sha256:${string}` {
  const match = source.match(/^---\n([\s\S]*?)\n---/);
  const fm = parseYaml(match?.[1] ?? "") ?? {};
  return planSemanticDigest({
    ...(fm as Record<string, unknown>),
    source,
  } as unknown as Parameters<typeof planSemanticDigest>[0]) as `sha256:${string}`;
}
export function loadHistoricalAuthority(repoRoot: string, expectedRepositoryHead?: string) {
  const git = (...args: string[]) => execFileSync("git", args, { cwd: repoRoot });
  const head = git("rev-parse", "HEAD").toString("utf8").trim();
  if (expectedRepositoryHead && head !== expectedRepositoryHead)
    throw new Error("historical authority expected HEAD drift");
  const bytes = git("show", `HEAD:${HISTORICAL_AUTHORITY_PATH}`);
  const manifestBytes = git("show", `HEAD:${HISTORICAL_AUTHORITY_MANIFEST_PATH}`);
  const manifest = manifestSchema.parse(JSON.parse(manifestBytes.toString("utf8")));
  const { manifest_digest: manifestDigest, ...manifestBody } = manifest;
  if (manifestDigest !== sha(stableJson(manifestBody)))
    throw new Error("historical authority manifest genesis pin drift");
  if (manifest.generation === 1) {
    if (
      manifest.previous_manifest_digest !== null ||
      manifest.review_digest !== null ||
      manifestDigest !== HISTORICAL_MANIFEST_GENESIS_DIGEST
    )
      throw new Error("historical authority manifest genesis pin drift");
  } else {
    if (!manifest.previous_manifest_digest || !manifest.review_digest)
      throw new Error("historical later manifest chain/review binding absent");
    let cursor = manifest;
    while (cursor.generation > 1) {
      const previousPath = `config/historical-vpair-migration-authority.manifests/${String(cursor.generation - 1).padStart(8, "0")}.json`;
      const previous = manifestSchema.parse(
        JSON.parse(git("show", `HEAD:${previousPath}`).toString("utf8")),
      );
      const { manifest_digest: previousDigest, ...previousBody } = previous;
      if (
        previousDigest !== sha(stableJson(previousBody)) ||
        previousDigest !== cursor.previous_manifest_digest ||
        previous.generation !== cursor.generation - 1
      )
        throw new Error("historical later manifest previous generation drift");
      const receiptPath = `config/historical-vpair-migration-authority.reviews/${cursor.review_digest?.slice(7)}.json`;
      const receipt = manifestReviewReceiptSchema.parse(
        JSON.parse(git("show", `HEAD:${receiptPath}`).toString("utf8")),
      );
      const {
        review_digest: receiptDigest,
        new_manifest_digest: _newManifestDigest,
        ...receiptBody
      } = receipt;
      if (
        receiptDigest !== sha(stableJson(receiptBody)) ||
        receipt.worker_identity === receipt.reviewer_identity ||
        receipt.authority_generation !== cursor.generation
      )
        throw new Error("historical manifest review receipt digest/identity/generation drift");
      const authorityPath = `config/historical-vpair-migration-authority.authorities/${String(cursor.generation).padStart(8, "0")}.json`;
      const authorityBytes = git("show", `HEAD:${authorityPath}`);
      if (
        receipt.review_digest !== cursor.review_digest ||
        receipt.previous_manifest_digest !== previousDigest ||
        receipt.new_manifest_digest !== cursor.manifest_digest ||
        receipt.authority_raw_digest !== sha(authorityBytes) ||
        receipt.authority_raw_digest !== cursor.expected_raw_digest
      )
        throw new Error("historical later manifest review/blob receipt drift");
      if (cursor.generation === manifest.generation && !authorityBytes.equals(bytes))
        throw new Error("historical active/archive authority bytes drift");
      cursor = previous;
    }
    if (
      cursor.manifest_digest !== HISTORICAL_MANIFEST_GENESIS_DIGEST ||
      cursor.previous_manifest_digest !== null ||
      cursor.review_digest !== null
    )
      throw new Error("historical manifest chain does not reach code-pinned genesis");
  }
  const tree = git("ls-tree", "HEAD", "--", HISTORICAL_AUTHORITY_PATH).toString("utf8").trim();
  const match = /^(\d+) blob ([0-9a-f]{40})\t/.exec(tree);
  if (
    !match ||
    match[1] !== manifest.expected_tree_mode ||
    match[2] !== manifest.expected_blob_oid ||
    sha(bytes) !== manifest.expected_raw_digest
  )
    throw new Error("historical authority provenance envelope drift");
  const authority = parseHistoricalVpairAuthority(JSON.parse(bytes.toString("utf8")));
  const remote = git("remote", "get-url", "origin").toString("utf8").trim();
  if (
    canonicalRepositoryIdentity(remote) !==
      canonicalRepositoryIdentity(authority.repository_identity) ||
    canonicalRepositoryIdentity(remote) !==
      canonicalRepositoryIdentity(manifest.repository_identity)
  )
    throw new Error("historical repository identity drift");
  verifyPinnedCutoff(repoRoot, authority);
  return authority;
}
export function loadHistoricalCandidate(input: {
  repoRoot: string;
  decision: { plan_id: string; classification: string; reason: string };
  planPath: string;
  cutoffCommit: string;
  assisted: boolean;
}): HistoricalCandidate {
  const git = (...a: string[]) =>
    execFileSync("git", a, { cwd: input.repoRoot, encoding: "utf8" }).trim();
  let current = "";
  try {
    current = git("show", `HEAD:${input.planPath}`);
  } catch (error) {
    return {
      plan_id: input.decision.plan_id,
      plan_path: input.planPath,
      kind: "",
      classification: input.decision.classification,
      reason: input.decision.reason,
      canonical_reason: "verification_bindings_absent",
      detail: null,
      fingerprint: findingFingerprint({
        plan_id: input.decision.plan_id,
        reason: "verification_bindings_absent",
        detail: null,
      }) as `sha256:${string}`,
      has_bindings: false,
      current_semantic_digest: sha("load-error"),
      cutoff_semantic_digest: null,
      current_raw_digest: sha("load-error"),
      cutoff_raw_digest: null,
      cutoff_present: false,
      cutoff_plan_id: null,
      cutoff_blob_oid: null,
      assisted: input.assisted,
      load_error: error instanceof Error ? error.message : String(error),
    };
  }
  const fm = parseYaml(current.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? "") ?? {};
  let cutoff: string | null = null,
    oid: string | null = null;
  try {
    cutoff = git("show", `${input.cutoffCommit}:${input.planPath}`);
    oid = git("rev-parse", `${input.cutoffCommit}:${input.planPath}`);
  } catch (error) {
    void error;
  }
  const cutoffFm = cutoff
    ? (parseYaml(cutoff.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? "") ?? {})
    : {};
  return {
    plan_id: input.decision.plan_id,
    plan_path: input.planPath,
    kind: String(fm.kind ?? ""),
    classification: input.decision.classification,
    reason: input.decision.reason,
    canonical_reason: "verification_bindings_absent",
    detail: null,
    fingerprint: findingFingerprint({
      plan_id: input.decision.plan_id,
      reason: "verification_bindings_absent",
      detail: null,
    }) as `sha256:${string}`,
    has_bindings: Array.isArray(fm.verification_bindings) && fm.verification_bindings.length > 0,
    current_semantic_digest: historicalPlanSemanticDigest(current),
    cutoff_semantic_digest: cutoff ? historicalPlanSemanticDigest(cutoff) : null,
    current_raw_digest: sha(current),
    cutoff_raw_digest: cutoff ? sha(cutoff) : null,
    cutoff_present: cutoff !== null,
    cutoff_plan_id: cutoff ? String(cutoffFm.plan_id ?? "") : null,
    cutoff_blob_oid: oid,
    assisted: input.assisted,
    load_error: null,
  };
}
export function verifyPinnedCutoff(
  repoRoot: string,
  authority: ReturnType<typeof loadHistoricalAuthority>,
) {
  const git = (...a: string[]) =>
    execFileSync("git", a, { cwd: repoRoot, encoding: "utf8" }).trim();
  if (git("show", "-s", "--format=%T", authority.cutoff_commit_sha) !== authority.cutoff_tree_oid)
    throw new Error("cutoff tree drift");
  git("merge-base", "--is-ancestor", authority.cutoff_commit_sha, "HEAD");
  if (L8_PAIR_ENFORCEMENT_DATE !== "2026-07-08") throw new Error("cutoff SSoT drift");
}

/** Existing closure authority production run is the dynamic census source; counts are never fixed. */
export function loadHistoricalCandidatesFromAuthorityRun(input: {
  repoRoot: string;
  runPath: string;
  authority: ReturnType<typeof loadHistoricalAuthority>;
}): { sourceTotal: number; candidates: HistoricalCandidate[] } {
  const run = decodeClosureAuthorityBackfillRun(JSON.parse(readFileSync(input.runPath, "utf8")));
  const ids = run.candidate_plan_ids;
  const decisions = run.bundle.decisions;
  const candidates: HistoricalCandidate[] = [];
  for (const row of decisions) {
    const planId = String(row.plan_id);
    const path = `docs/plans/${planId}.md`;
    candidates.push(
      loadHistoricalCandidate({
        repoRoot: input.repoRoot,
        decision: {
          plan_id: planId,
          classification: row.classification,
          reason: row.reason,
        },
        planPath: path,
        cutoffCommit: input.authority.cutoff_commit_sha,
        assisted: false,
      }),
    );
  }
  return { sourceTotal: ids.length, candidates };
}

export function verifyHistoricalTerminationEvent(input: {
  db: HarnessDb;
  review: {
    review_kind: string;
    worker_identity: string;
    reviewer_identity: string;
    worker_task_id: string;
    reviewer_task_id: string;
    termination_event_id: string;
    worker_termination_event_id: string;
    reviewed_at: string;
    review_digest: string;
    bundle_digest: string;
  };
}): void {
  if (input.review.review_kind === "cross_agent") {
    const worker = input.db
      .prepare("SELECT * FROM session_events WHERE event_id=?")
      .get(input.review.worker_termination_event_id);
    const reviewer = input.db
      .prepare("SELECT * FROM session_events WHERE event_id=?")
      .get(input.review.termination_event_id);
    const workerAt = Date.parse(String(worker?.recorded_at ?? ""));
    const reviewerAt = Date.parse(String(reviewer?.recorded_at ?? ""));
    const reviewedAt = Date.parse(input.review.reviewed_at);
    if (
      !worker ||
      !reviewer ||
      worker.event_id !== input.review.worker_termination_event_id ||
      reviewer.event_id !== input.review.termination_event_id ||
      worker.operation_id !== input.review.worker_task_id ||
      reviewer.operation_id !== input.review.reviewer_task_id ||
      worker.session_id !== input.review.worker_identity ||
      reviewer.session_id !== input.review.reviewer_identity ||
      worker.session_id === reviewer.session_id ||
      worker.event_kind !== "subagent_completed" ||
      reviewer.event_kind !== "subagent_completed" ||
      worker.payload_hash !== input.review.bundle_digest ||
      reviewer.payload_hash !== input.review.review_digest ||
      !Number.isFinite(workerAt) ||
      !Number.isFinite(reviewerAt) ||
      workerAt > reviewerAt ||
      reviewerAt > reviewedAt ||
      reviewedAt - workerAt > 3_600_000
    )
      throw new Error("cross-agent worker/reviewer termination receipt exact join failed");
    return;
  }
  if (input.review.review_kind !== "intra_runtime_subagent")
    throw new Error("unknown historical review termination policy");
  const row = input.db
    .prepare("SELECT * FROM session_events WHERE event_id=?")
    .get(input.review.termination_event_id);
  const recordedAt = Date.parse(String(row?.recorded_at ?? ""));
  const reviewedAt = Date.parse(input.review.reviewed_at);
  if (
    !row ||
    row.event_id !== input.review.termination_event_id ||
    row.operation_id !== input.review.worker_task_id ||
    row.session_id !== input.review.reviewer_task_id ||
    row.event_kind !== "subagent_completed" ||
    row.payload_hash !== input.review.review_digest ||
    !Number.isFinite(recordedAt) ||
    recordedAt > reviewedAt ||
    reviewedAt - recordedAt > 3_600_000
  )
    throw new Error("historical task termination event exact join failed");
}

export function validateHistoricalMigrationReviewWithDb(input: {
  db: HarnessDb;
  value: unknown;
  bundle: HistoricalBundle;
  now: string;
  authorityBinding: { artifactDigest: string; generation: number };
}) {
  const review = validateHistoricalMigrationReview(input);
  verifyHistoricalTerminationEvent({ db: input.db, review });
  return review;
}

export function loadHistoricalAuthorityChainTip(
  repoRoot: string,
  bundleDigest: string,
): HistoricalChainArtifact {
  const dir = join(repoRoot, HISTORICAL_EVIDENCE_DIR, "authority");
  const names = readdirSync(dir)
    .filter((name) => /^\d{8}\.json$/.test(name))
    .sort();
  let previous: HistoricalChainArtifact | null = null;
  for (let index = 0; index < names.length; index++) {
    const name = names[index];
    if (!name || name !== `${String(index + 1).padStart(8, "0")}.json`)
      throw new Error("authority chain gap");
    const artifact = JSON.parse(readFileSync(join(dir, name), "utf8")) as HistoricalChainArtifact;
    const parsedPayload = z
      .object({
        manifest_generation: z.number().int().positive(),
        authority_digest: z.string().regex(/^sha256:[0-9a-f]{64}$/),
      })
      .strict()
      .parse(artifact.payload);
    const manifestPath =
      index + 1 === names.length
        ? HISTORICAL_AUTHORITY_MANIFEST_PATH
        : `config/historical-vpair-migration-authority.manifests/${String(index + 1).padStart(8, "0")}.json`;
    const trackedManifest = manifestSchema.parse(
      JSON.parse(
        execFileSync("git", ["show", `HEAD:${manifestPath}`], { cwd: repoRoot, encoding: "utf8" }),
      ),
    );
    const archivePath = `config/historical-vpair-migration-authority.authorities/${String(index + 1).padStart(8, "0")}.json`;
    const archiveBytes = execFileSync("git", ["show", `HEAD:${archivePath}`], { cwd: repoRoot });
    const trackedAuthority = parseHistoricalVpairAuthority(
      JSON.parse(archiveBytes.toString("utf8")),
    );
    const { artifact_digest, ...body } = artifact;
    if (
      artifact.artifact_kind !== "authority" ||
      artifact_digest !== sha(stableJson(body)) ||
      artifact.previous_artifact_digest !== (previous?.artifact_digest ?? null) ||
      parsedPayload.manifest_generation !== artifact.sequence ||
      trackedManifest.generation !== artifact.sequence ||
      trackedManifest.expected_raw_digest !== sha(archiveBytes) ||
      trackedAuthority.authority_digest !== parsedPayload.authority_digest
    )
      throw new Error("authority chain full-prefix invalid");
    previous = artifact;
  }
  if (!previous || previous.bundle_digest !== bundleDigest)
    throw new Error("authority chain tip bundle join failed");
  return previous;
}
export function loadHistoricalReviewChainTip(input: {
  repoRoot: string;
  bundle: HistoricalBundle;
  review: ReturnType<typeof validateHistoricalMigrationReview>;
  authorityTip: HistoricalChainArtifact;
}): HistoricalChainArtifact {
  const { repoRoot, bundle, review, authorityTip } = input;
  const authorityDir = join(repoRoot, HISTORICAL_EVIDENCE_DIR, "authority");
  const authorityChain = readdirSync(authorityDir)
    .filter((name) => /^\d{8}\.json$/.test(name))
    .sort()
    .map(
      (name) =>
        JSON.parse(readFileSync(join(authorityDir, name), "utf8")) as HistoricalChainArtifact,
    );
  const dir = join(repoRoot, HISTORICAL_EVIDENCE_DIR, "review");
  const names = readdirSync(dir)
    .filter((name) => /^\d{8}\.json$/.test(name))
    .sort();
  let previous: HistoricalChainArtifact | null = null;
  for (let index = 0; index < names.length; index++) {
    const name = names[index];
    if (!name || name !== `${String(index + 1).padStart(8, "0")}.json`)
      throw new Error("historical review chain gap");
    const artifact = JSON.parse(readFileSync(join(dir, name), "utf8")) as HistoricalChainArtifact;
    const strictReview = parseHistoricalMigrationReview(artifact.payload);
    const { artifact_digest, ...body } = artifact;
    const { review_digest: strictDigest, ...strictBody } = strictReview;
    if (
      artifact.artifact_kind !== "review" ||
      artifact.sequence !== index + 1 ||
      artifact_digest !== sha(stableJson(body)) ||
      artifact.previous_artifact_digest !== (previous?.artifact_digest ?? null) ||
      strictDigest !== sha(stableJson(strictBody)) ||
      strictReview.authority_generation < 1 ||
      strictReview.bundle_digest !== artifact.bundle_digest ||
      strictReview.previous_digest !== (previous?.artifact_digest ?? null) ||
      strictReview.authority_artifact_digest !==
        authorityChain[strictReview.authority_generation - 1]?.artifact_digest ||
      (previous !== null &&
        (artifact.repository_head !== previous.repository_head ||
          artifact.repository_identity !== previous.repository_identity ||
          artifact.bundle_digest !== previous.bundle_digest))
    )
      throw new Error("historical review chain prefix invalid");
    previous = artifact;
  }
  const payload = previous?.payload as Record<string, unknown> | undefined;
  if (
    !previous ||
    previous.bundle_digest !== bundle.bundle_digest ||
    payload?.review_digest !== review.review_digest ||
    payload?.authority_artifact_digest !== authorityTip.artifact_digest ||
    payload?.authority_generation !== authorityTip.sequence
  )
    throw new Error("historical trusted review chain tip exact join failed");
  return previous;
}

export function runHistoricalVpairMigrationDryRun(input: {
  repoRoot: string;
  db: HarnessDb;
  expectedRepositoryHead: string;
  runPath: string;
  reviewPath: string;
  now: string;
}) {
  const authority = loadHistoricalAuthority(input.repoRoot, input.expectedRepositoryHead);
  const loaded = loadHistoricalCandidatesFromAuthorityRun({
    repoRoot: input.repoRoot,
    runPath: input.runPath,
    authority,
  });
  const bundle = classifyHistoricalVpairMigration({ candidates: loaded.candidates, authority });
  const authorityTip = loadHistoricalAuthorityChainTip(input.repoRoot, bundle.bundle_digest);
  const activeManifest = manifestSchema.parse(
    JSON.parse(
      execFileSync("git", ["show", `HEAD:${HISTORICAL_AUTHORITY_MANIFEST_PATH}`], {
        cwd: input.repoRoot,
        encoding: "utf8",
      }),
    ),
  );
  const tipPayload = z
    .object({
      manifest_generation: z.number().int().positive(),
      authority_digest: z.string().regex(/^sha256:[0-9a-f]{64}$/),
    })
    .strict()
    .parse(authorityTip.payload);
  if (
    authorityTip.sequence !== activeManifest.generation ||
    tipPayload.manifest_generation !== activeManifest.generation ||
    tipPayload.authority_digest !== authority.authority_digest
  )
    throw new Error("active manifest/authority chain tip exact join failed");
  const review = validateHistoricalMigrationReviewWithDb({
    db: input.db,
    value: JSON.parse(readFileSync(input.reviewPath, "utf8")),
    bundle,
    now: input.now,
    authorityBinding: {
      artifactDigest: authorityTip.artifact_digest,
      generation: authorityTip.sequence,
    },
  });
  const reviewTip = loadHistoricalReviewChainTip({
    repoRoot: input.repoRoot,
    bundle,
    review,
    authorityTip,
  });
  const activeReceiptPath = `config/historical-vpair-migration-authority.reviews/${activeManifest.review_digest?.slice(7)}.json`;
  const activeReceipt = manifestReviewReceiptSchema.parse(
    JSON.parse(
      execFileSync("git", ["show", `HEAD:${activeReceiptPath}`], {
        cwd: input.repoRoot,
        encoding: "utf8",
      }),
    ),
  );
  const {
    review_digest: activeReceiptDigest,
    new_manifest_digest: _newManifestDigest,
    ...activeReceiptBody
  } = activeReceipt;
  if (
    activeReceiptDigest !== sha(stableJson(activeReceiptBody)) ||
    activeReceipt.review_chain_artifact_digest !== reviewTip.artifact_digest ||
    activeReceipt.review_chain_sequence !== reviewTip.sequence ||
    activeReceipt.worker_identity !== review.worker_identity ||
    activeReceipt.reviewer_identity !== review.reviewer_identity ||
    activeReceipt.worker_termination_event_id !== review.worker_termination_event_id ||
    activeReceipt.reviewer_termination_event_id !== review.termination_event_id ||
    activeReceipt.authority_generation !== review.authority_generation ||
    activeReceipt.bundle_digest !== review.bundle_digest ||
    activeReceipt.verdict_digest !== sha(stableJson(review.verdicts))
  )
    throw new Error("tracked manifest receipt/review chain/DB evidence exact join failed");
  return {
    schema_version: "historical-vpair-migration-dry-run.v1" as const,
    dry_run: true,
    mutates_registry: false,
    mutates_harness_db: false,
    mutates_closure_projection: false,
    authority_digest: authority.authority_digest,
    authority_manifest: authorityTip.payload,
    source_total: loaded.sourceTotal,
    bundle,
    review_digest: review.review_digest,
    chain: {
      authority_generation: review.authority_generation,
      authority_artifact_digest: review.authority_artifact_digest,
      review_previous_digest: review.previous_digest,
      review_artifact_digest: reviewTip.artifact_digest,
    },
  };
}

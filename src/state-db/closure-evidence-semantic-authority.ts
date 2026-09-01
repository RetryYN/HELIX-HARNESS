import { readFileSync } from "node:fs";
import { isAbsolute, relative, resolve } from "node:path";
import { z } from "zod";
import { canonicalJson, sha256Digest } from "../shared/canonical-digest";

const DIGEST = /^sha256:[0-9a-f]{64}$/u;
const HEAD = /^[0-9a-f]{40}$/u;

const reviewAuthoritySchema = z
  .object({
    authority_kind: z.literal("review"),
    plan_id: z.string().min(1),
    artifact_kind: z.literal("plan_review_evidence"),
    candidate_head: z.string().regex(HEAD),
    reviewer: z.string().min(1),
    reviewed_at: z.string().datetime(),
    verdict: z.literal("approve"),
    worker_model: z.string().min(1),
    reviewer_model: z.string().min(1),
    reviewer_runtime: z.string().min(1),
    reviewer_session_id: z.string().min(1),
  })
  .strict();

const testAuthoritySchema = z
  .object({
    authority_kind: z.literal("structured_test"),
    plan_id: z.string().min(1),
    artifact_kind: z.literal("structured_test_evidence"),
    candidate_head: z.string().regex(HEAD),
    recorded_at: z.string().datetime(),
    case_name: z.string().min(1),
    oracle_id: z.string().min(1),
  })
  .strict();

const runtimeAuthoritySchema = z
  .object({
    authority_kind: z.literal("runtime"),
    plan_id: z.string().min(1),
    artifact_kind: z.literal("runtime_verification_evidence"),
    candidate_head: z.string().regex(HEAD),
    requirement_id: z.string().min(1),
    test_oracle_id: z.string().min(1),
    claim: z.string().min(1),
    session_id: z.string().min(1),
    correlation_id: z.string().min(1),
    occurred_at: z.string().datetime(),
    accept_status: z.literal("accepted"),
  })
  .strict();

export const closureSemanticAuthoritySchema = z.discriminatedUnion("authority_kind", [
  reviewAuthoritySchema,
  testAuthoritySchema,
  runtimeAuthoritySchema,
]);
export type ClosureSemanticAuthority = z.infer<typeof closureSemanticAuthoritySchema>;

const recordSchema = z
  .object({
    source_path: z.string().min(1),
    source_digest: z.string().regex(DIGEST),
    authority: closureSemanticAuthoritySchema,
  })
  .strict();

const bundleSchema = z
  .object({
    schema_version: z.literal("closure-evidence-semantic-authority-bundle.v1"),
    records: z.array(recordSchema).min(1),
    bundle_digest: z.string().regex(DIGEST),
  })
  .strict();

export interface ClosureSemanticAuthorityBundle {
  schema_version: "closure-evidence-semantic-authority-bundle.v1";
  records: Array<{
    source_path: string;
    source_digest: string;
    authority: ClosureSemanticAuthority;
  }>;
  bundle_digest: string;
}

function stable(value: unknown): string {
  return canonicalJson(value, "semantic authority value is not canonical JSON");
}

function digest(value: string | Buffer): string {
  return sha256Digest(value);
}

function canonicalRepoPath(repoRoot: string, sourcePath: string): string {
  if (isAbsolute(sourcePath))
    throw new Error("semantic authority source_path must be repo-relative");
  const absolute = resolve(repoRoot, sourcePath);
  const rel = relative(resolve(repoRoot), absolute);
  if (rel.startsWith("..") || isAbsolute(rel))
    throw new Error("semantic authority source_path escapes repository");
  return absolute;
}

export function loadClosureSemanticAuthorityBundle(
  repoRoot: string,
  path: string,
): ClosureSemanticAuthorityBundle {
  const parsed = bundleSchema.parse(JSON.parse(readFileSync(path, "utf8")));
  const { bundle_digest: claimed, ...payload } = parsed;
  if (digest(stable(payload)) !== claimed)
    throw new Error("semantic authority bundle digest mismatch");
  const keys = new Set<string>();
  const candidateHeadByPlan = new Map<string, string>();
  const oracleByPlan = new Map<string, string>();
  for (const record of parsed.records) {
    const key = `${record.authority.plan_id}:${record.authority.artifact_kind}`;
    if (keys.has(key)) throw new Error(`duplicate semantic authority record: ${key}`);
    keys.add(key);
    const source = readFileSync(canonicalRepoPath(repoRoot, record.source_path));
    if (digest(source) !== record.source_digest)
      throw new Error(`semantic authority source digest mismatch: ${key}`);
    const sourceAuthority = closureSemanticAuthoritySchema.parse(
      JSON.parse(source.toString("utf8")),
    );
    if (stable(sourceAuthority) !== stable(record.authority))
      throw new Error(`semantic authority source payload mismatch: ${key}`);
    const expectedHead = candidateHeadByPlan.get(record.authority.plan_id);
    if (expectedHead && expectedHead !== record.authority.candidate_head)
      throw new Error(`semantic authority candidate HEAD mismatch: ${record.authority.plan_id}`);
    candidateHeadByPlan.set(record.authority.plan_id, record.authority.candidate_head);
    if (record.authority.authority_kind === "structured_test")
      oracleByPlan.set(record.authority.plan_id, record.authority.oracle_id);
  }
  for (const record of parsed.records) {
    if (
      record.authority.authority_kind === "runtime" &&
      oracleByPlan.has(record.authority.plan_id) &&
      oracleByPlan.get(record.authority.plan_id) !== record.authority.test_oracle_id
    )
      throw new Error(`semantic authority oracle join mismatch: ${record.authority.plan_id}`);
  }
  return parsed;
}

export function closureSemanticAuthorityBundleDigestPayload(input: {
  schema_version: "closure-evidence-semantic-authority-bundle.v1";
  records: ClosureSemanticAuthorityBundle["records"];
}): string {
  return digest(stable(input));
}

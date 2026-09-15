import { createHash } from "node:crypto";

export const SOURCE_CONTENT_MIRROR_COMPLETENESS_SCHEMA_VERSION =
  "source-content-mirror-completeness.v1";

export type AllRefContentStatus = "complete" | "incomplete" | "pending" | "partial" | "failed";
export type MirrorChunkStatus = "ok" | "pending" | "partial" | "failed";

export interface MirrorChunkRecord {
  chunk_id: string;
  status: MirrorChunkStatus;
  object_ids: string[];
  size_bytes: number;
  reused_digest?: boolean;
  failure_reason?: string | null;
}

export interface SourceMirrorRepoRecord {
  repo: string;
  refs_digest?: string | null;
  default_tree_digest?: string | null;
  default_branch_content_digest?: string | null;
  all_ref_content_status: AllRefContentStatus;
  retry_status?: "none" | "queued" | "exhausted";
  chunks: MirrorChunkRecord[];
}

export interface SourceContentMirrorCompletenessReport {
  schema_version: typeof SOURCE_CONTENT_MIRROR_COMPLETENESS_SCHEMA_VERSION;
  ok: boolean;
  completion_claim_allowed: boolean;
  read_only: true;
  repo_count: number;
  complete_count: number;
  retry_ledger: Array<{ repo: string; status: AllRefContentStatus; retry_status: string }>;
  aggregate_content_digest: string;
  object_dedup_count: number;
  chunk_resume_plan: Array<{ repo: string; next_chunk_id: string; reason: string }>;
  findings: Array<{ code: string; severity: "warning" | "error"; detail: string }>;
  source_command: string;
}

function sha256Lines(lines: string[]): string {
  const hash = createHash("sha256");
  for (const line of [...lines].sort()) hash.update(`${line}\n`);
  return `sha256:${hash.digest("hex")}`;
}

function isDigest(value: string | null | undefined): boolean {
  return /^sha256:[a-f0-9]{16,}$/i.test(value ?? "");
}

export function buildSourceContentMirrorCompletenessReport(
  repos: SourceMirrorRepoRecord[],
  options: { sourceCommand?: string } = {},
): SourceContentMirrorCompletenessReport {
  const findings: SourceContentMirrorCompletenessReport["findings"] = [];
  const retryLedger: SourceContentMirrorCompletenessReport["retry_ledger"] = [];
  const chunkResumePlan: SourceContentMirrorCompletenessReport["chunk_resume_plan"] = [];
  const objectIds = new Set<string>();
  let rawObjectRefCount = 0;

  for (const repo of repos) {
    if (!isDigest(repo.refs_digest)) {
      findings.push({
        code: "refs_digest_missing_fail_close",
        severity: "error",
        detail: `${repo.repo} lacks all-ref refs digest`,
      });
    }
    if (!isDigest(repo.default_tree_digest)) {
      findings.push({
        code: "default_tree_digest_missing_fail_close",
        severity: "error",
        detail: `${repo.repo} lacks default tree digest`,
      });
    }
    if (!isDigest(repo.default_branch_content_digest)) {
      findings.push({
        code: "default_branch_content_digest_missing",
        severity: "error",
        detail: `${repo.repo} lacks default branch full content digest`,
      });
    }
    if (repo.all_ref_content_status !== "complete") {
      retryLedger.push({
        repo: repo.repo,
        status: repo.all_ref_content_status,
        retry_status: repo.retry_status ?? "queued",
      });
      findings.push({
        code: "all_ref_content_incomplete",
        severity: "error",
        detail: `${repo.repo} all-ref content status=${repo.all_ref_content_status}`,
      });
    }
    for (const chunk of repo.chunks) {
      rawObjectRefCount += chunk.object_ids.length;
      for (const objectId of chunk.object_ids) objectIds.add(objectId);
      if (chunk.status !== "ok") {
        chunkResumePlan.push({
          repo: repo.repo,
          next_chunk_id: chunk.chunk_id,
          reason: chunk.failure_reason ?? `chunk status ${chunk.status}`,
        });
      }
    }
  }

  const aggregateContentDigest = sha256Lines(
    repos.flatMap((repo) => [
      repo.repo,
      repo.refs_digest ?? "",
      repo.default_tree_digest ?? "",
      repo.default_branch_content_digest ?? "",
      repo.all_ref_content_status,
      ...repo.chunks.flatMap((chunk) => [chunk.chunk_id, chunk.status, ...chunk.object_ids]),
    ]),
  );
  const hasError = findings.some((finding) => finding.severity === "error");
  return {
    schema_version: SOURCE_CONTENT_MIRROR_COMPLETENESS_SCHEMA_VERSION,
    ok: !hasError,
    completion_claim_allowed: !hasError,
    read_only: true,
    repo_count: repos.length,
    complete_count: repos.filter((repo) => repo.all_ref_content_status === "complete").length,
    retry_ledger: retryLedger,
    aggregate_content_digest: aggregateContentDigest,
    object_dedup_count: rawObjectRefCount - objectIds.size,
    chunk_resume_plan: chunkResumePlan,
    findings,
    source_command: options.sourceCommand ?? "helix source mirror-check --json",
  };
}

const CLAUDE_TRAILER_PATTERN = /^co-authored-by:[ \t]*claude\b/imu;

export type MeasuredAuthorRuntime = "claude" | "codex" | "mixed";

export interface AuthorRuntimeCommit {
  message: string;
  parentCount: number;
}

export const AUTHOR_RUNTIME_EVIDENCE_QUERY =
  '.[] | "\\(.parents | length):\\(.commit.message | @base64)"';

export function authorRuntimeEvidenceArgs(repository: string, prNumber: number): string[] {
  return [
    "api",
    "--paginate",
    `repos/${repository}/pulls/${prNumber}/commits`,
    "-q",
    AUTHOR_RUNTIME_EVIDENCE_QUERY,
  ];
}

export function measuredAuthorRuntimeFromCommits(
  commits: readonly AuthorRuntimeCommit[],
): MeasuredAuthorRuntime {
  const implementation = commits.filter((commit) => commit.parentCount < 2);
  const population = implementation.length > 0 ? implementation : commits;
  const withTrailer = population.filter((commit) =>
    CLAUDE_TRAILER_PATTERN.test(commit.message),
  ).length;
  if (withTrailer === 0) return "codex";
  if (withTrailer === population.length || implementation.length === 0) return "claude";
  return "mixed";
}

export type AuthorRuntimeAttestationFailure =
  | "author_runtime_evidence_missing"
  | "author_runtime_evidence_mixed"
  | "author_runtime_attestation_mismatch";

export function authorRuntimeAttestationFailure(
  claimedAuthorRuntime: unknown,
  commits: readonly AuthorRuntimeCommit[],
): AuthorRuntimeAttestationFailure | null {
  if (commits.length === 0) return "author_runtime_evidence_missing";
  const measured = measuredAuthorRuntimeFromCommits(commits);
  if (measured === "mixed" && claimedAuthorRuntime !== "mixed") {
    return "author_runtime_evidence_mixed";
  }
  return measured === claimedAuthorRuntime ? null : "author_runtime_attestation_mismatch";
}

export function parseAuthorRuntimeEvidence(stdout: string): AuthorRuntimeCommit[] | null {
  const lines = stdout
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "");
  const commits: AuthorRuntimeCommit[] = [];
  for (const line of lines) {
    const separator = line.indexOf(":");
    if (separator <= 0) return null;
    const parents = line.slice(0, separator);
    if (!/^(0|[1-9][0-9]*)$/u.test(parents)) return null;
    const parentCount = Number(parents);
    if (!Number.isSafeInteger(parentCount)) return null;
    const encoded = line.slice(separator + 1);
    const decoded = Buffer.from(encoded, "base64");
    if (decoded.toString("base64") !== encoded) return null;
    commits.push({ message: decoded.toString("utf8"), parentCount });
  }
  return commits;
}

export type AuthorRuntimeEvidenceRunner = (args: readonly string[]) => {
  status: number | null;
  stdout: string;
};

export type EvidenceSpawn = (
  command: string,
  args: readonly string[],
  options: { cwd: string; encoding: "utf8" },
) => { status: number | null; stdout: string | null };

export function ghEvidenceRunner(spawn: EvidenceSpawn, cwd: string): AuthorRuntimeEvidenceRunner {
  return (args) => {
    const result = spawn("gh", args, { cwd, encoding: "utf8" });
    return { status: result.status, stdout: result.stdout ?? "" };
  };
}

export function authorRuntimeAttestation(input: {
  repository: string;
  prNumber: number;
  claimedAuthorRuntime: unknown;
  run: AuthorRuntimeEvidenceRunner;
}): { ok: true } | { ok: false; failure: string } {
  const result = input.run(authorRuntimeEvidenceArgs(input.repository, input.prNumber));
  if (result.status !== 0) return { ok: false, failure: "author_runtime_evidence_unavailable" };
  const evidence = parseAuthorRuntimeEvidence(result.stdout);
  if (evidence === null) return { ok: false, failure: "author_runtime_evidence_unavailable" };
  const failure = authorRuntimeAttestationFailure(input.claimedAuthorRuntime, evidence);
  return failure ? { ok: false, failure } : { ok: true };
}

export function measureAuthorRuntime(input: {
  repository: string;
  prNumber: number;
  run: AuthorRuntimeEvidenceRunner;
}): { ok: true; measured: MeasuredAuthorRuntime } | { ok: false; failure: string } {
  const result = input.run(authorRuntimeEvidenceArgs(input.repository, input.prNumber));
  if (result.status !== 0) return { ok: false, failure: "author_runtime_evidence_unavailable" };
  const evidence = parseAuthorRuntimeEvidence(result.stdout);
  if (evidence === null || evidence.length === 0) {
    return { ok: false, failure: "author_runtime_evidence_unavailable" };
  }
  return { ok: true, measured: measuredAuthorRuntimeFromCommits(evidence) };
}

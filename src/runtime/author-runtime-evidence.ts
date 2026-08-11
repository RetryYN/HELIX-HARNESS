const CLAUDE_TRAILER_PATTERN = /^co-authored-by:[ \t]*claude\b/imu;

/**
 * `external` は HELIX が管理する 2 runtime のどちらでもない第三者 author（bot）を表す
 * （PLAN-RECOVERY-49 / Issue #553）。従来は「trailer が無い = Codex が書いた」と推定していたため、
 * trailer を付けない Dependabot 等を `codex` と誤帰属していた（PR #384 で実測）。
 * bot identity は GitHub の申告であり cryptographic identity ではない。本値の追加は
 * 推定を 1 つ減らすものであって、推定を全廃するものではない（PLAN-RECOVERY-42 の限界は不変）。
 */
export type MeasuredAuthorRuntime = "claude" | "codex" | "mixed" | "external";

export interface AuthorRuntimeCommit {
  message: string;
  parentCount: number;
  /** GitHub API の `author.type == "Bot"`。未指定は非 bot として扱う（fail-close 方向）。 */
  bot?: boolean;
}

/**
 * `.author` は API 上 null になりうる（GitHub アカウントに紐付かない commit）。
 * `.author.type? // ""` で受け、null は bot ではなく非 bot 側へ倒す。
 */
export const AUTHOR_RUNTIME_EVIDENCE_QUERY =
  '.[] | "\\(.parents | length):\\(if (.author.type? // "") == "Bot" then 1 else 0 end):\\(.commit.message | @base64)"';

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
  // 母集団が全件 bot 著かつ trailer 皆無のときだけ external。bot と HELIX runtime commit が
  // 同居する場合は従来判定へ落とす（混在部分の独立レビューは依然として要求されるため）。
  if (withTrailer === 0 && population.every((commit) => commit.bot === true)) return "external";
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
    // 3 フィールド形式 `<parent 数>:<bot flag>:<base64 message>` だけを受理する。
    // 旧 2 フィールド形式を dual-read すると、query 側だけ巻き戻ったときに全 commit が
    // 非 bot として静かに通り、Issue #553 の誤帰属が復活する（PLAN-RECOVERY-49）。
    const rest = line.slice(separator + 1);
    const botSeparator = rest.indexOf(":");
    // separator 欠落（旧 2 フィールド形式）を明示的に拒否する。次行の bot flag 厳密検査でも
    // 結果的に弾けるが、それは「slice(0, -1) が `0` / `1` になるのは長さ 2 のときだけ」という
    // 非自明な議論に依存する。意図を面に出すため多層で持つ（mutation M5 で冗長性は実測済み）。
    if (botSeparator <= 0) return null;
    const botFlag = rest.slice(0, botSeparator);
    if (botFlag !== "0" && botFlag !== "1") return null;
    const encoded = rest.slice(botSeparator + 1);
    const decoded = Buffer.from(encoded, "base64");
    if (decoded.toString("base64") !== encoded) return null;
    commits.push({ message: decoded.toString("utf8"), parentCount, bot: botFlag === "1" });
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

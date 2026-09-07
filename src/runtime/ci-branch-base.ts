import { execFileSync } from "node:child_process";

// PLAN-RECOVERY-1633-ci-non-pr-base-authority
// CI専用の読取入口。branch policy自体は既存guardが所有する。
const ZERO_HEAD = "0000000000000000000000000000000000000000";

function isHead(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-f]{40}$/.test(value) && value !== ZERO_HEAD;
}

function command(file: string, args: string[]): string {
  return execFileSync(file, args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    timeout: 10_000,
    maxBuffer: 1024 * 1024,
  }).trim();
}

function object(value: unknown): Record<string, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("branch_base_response_invalid");
  }
  return value as Record<string, unknown>;
}

function github(args: string[]): unknown {
  return JSON.parse(command("gh", ["api", ...args]));
}

function mergeBase(base: string, candidate: string): string {
  const result = command("git", ["merge-base", "--all", base, candidate]);
  if (!isHead(result)) throw new Error("branch_base_merge_base_invalid");
  return result;
}

function resolveBranchBase(): string {
  const event = process.env.EVENT_NAME;
  const candidate = process.env.BRANCH_CANDIDATE_HEAD;
  const explicit = process.env.BRANCH_BASE_HEAD ?? "";
  if (!event) throw new Error("branch_base_event_missing");
  if (!isHead(candidate)) throw new Error("branch_base_candidate_head_invalid");
  if (event === "pull_request") {
    if (!isHead(explicit)) throw new Error("branch_base_pull_request_base_invalid");
    return explicit;
  }
  if (event === "push" && explicit && explicit !== ZERO_HEAD) {
    if (!isHead(explicit)) throw new Error("branch_base_push_base_invalid");
    command("git", ["cat-file", "-e", `${explicit}^{commit}`]);
    return explicit;
  }
  const repository = process.env.GITHUB_REPOSITORY;
  if (!repository || !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repository)) {
    throw new Error("branch_base_repository_invalid");
  }
  const pages = github([
    "--paginate",
    "--slurp",
    `repos/${repository}/pulls?state=open&per_page=100`,
  ]);
  if (!Array.isArray(pages) || pages.some((page) => !Array.isArray(page))) {
    throw new Error("branch_base_response_invalid");
  }
  const matches = pages
    .flat()
    .map(object)
    .filter((pr) => object(pr.head).sha === candidate);
  if (matches.length > 1) throw new Error("branch_base_open_pr_ambiguous");
  if (matches.length === 1) {
    const before = matches[0];
    const base = object(before.base).sha;
    if (!Number.isSafeInteger(before.number) || Number(before.number) < 1 || !isHead(base)) {
      throw new Error("branch_base_response_invalid");
    }
    const after = object(github([`repos/${repository}/pulls/${before.number}`]));
    const afterHead = after.head === undefined ? after.head_sha : object(after.head).sha;
    const afterBase = after.base === undefined ? after.base_sha : object(after.base).sha;
    if (afterHead !== candidate || afterBase !== base) {
      throw new Error("branch_base_open_pr_stale");
    }
    return mergeBase(base, candidate);
  }
  const metadata = github([`repos/${repository}`]);
  const branch = typeof metadata === "string" ? metadata : object(metadata).default_branch;
  if (typeof branch !== "string" || !branch || branch === "null") {
    throw new Error("branch_base_default_branch_unavailable");
  }
  const defaultHead = command("git", ["rev-parse", `refs/remotes/origin/${branch}`]);
  if (!isHead(defaultHead)) throw new Error("branch_base_default_head_invalid");
  return mergeBase(defaultHead, candidate);
}

try {
  process.stdout.write(`${resolveBranchBase()}\n`);
} catch (error) {
  // 子processのstderrや環境情報を公開せず、取得失敗を正常baseへ変換しない。
  const reason =
    error instanceof Error && /^branch_base_[a-z_]+$/.test(error.message)
      ? error.message
      : "branch_base_resolution_unavailable";
  process.stderr.write(`${reason}\n`);
  process.exitCode = 1;
}

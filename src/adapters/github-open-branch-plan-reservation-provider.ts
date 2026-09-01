import { execFileSync } from "node:child_process";
import { parse as parseYaml } from "yaml";
import { canonicalJson, compareBytewise, sha256Digest } from "../runtime/digest";
import type { OpenBranchPlanReservationAuthorityInput } from "../schema/open-branch-plan-reservation-authority";

type GithubReservationMaterial = Pick<
  OpenBranchPlanReservationAuthorityInput,
  "current_main" | "open_pr_heads"
>;
type GithubApi = (endpoint: string) => unknown;

const PAGE_SIZE = 100;
const MAX_PAGES = 100;
const PLAN_PATH = /^docs\/plans\/(PLAN-[A-Z0-9]+-\d+(?:-[a-z0-9-]+)?)\.md$/u;
const HEAD_SHA = /^[a-f0-9]{40}$/u;
const STABLE_ID = /^[A-Za-z0-9][A-Za-z0-9._:/-]{0,127}$/u;

function defaultGithubApi(endpoint: string): unknown {
  return JSON.parse(
    execFileSync("gh", ["api", endpoint], {
      encoding: "utf8",
      maxBuffer: 32 * 1024 * 1024,
    }),
  ) as unknown;
}

function record(value: unknown, code: string): Record<string, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) throw new Error(code);
  return value as Record<string, unknown>;
}

function text(value: unknown, code: string): string {
  if (typeof value !== "string" || value.length === 0) throw new Error(code);
  return value;
}

function integer(value: unknown, code: string): number {
  if (!Number.isSafeInteger(value) || Number(value) < 1) throw new Error(code);
  return Number(value);
}

function head(value: unknown, code: string): string {
  const candidate = text(value, code);
  if (!HEAD_SHA.test(candidate)) throw new Error(code);
  return candidate;
}

function unavailable(surface: string, error: unknown) {
  const reason =
    error instanceof Error && /^github_reservation_[a-z0-9_]+(?::.*)?$/u.test(error.message)
      ? (error.message.split(":", 1)[0] ?? "provider_call_failed")
      : "provider_call_failed";
  return {
    status: "unavailable" as const,
    error_digest: sha256Digest(canonicalJson({ surface, reason })),
  };
}

function frontmatter(source: string, path: string): Record<string, unknown> {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/u);
  if (!match) throw new Error(`github_reservation_plan_frontmatter_missing:${path}`);
  return record(parseYaml(match[1] ?? ""), `github_reservation_plan_frontmatter_invalid:${path}`);
}

function decodeBlob(payload: unknown, path: string): string {
  const blob = record(payload, `github_reservation_blob_invalid:${path}`);
  if (blob.encoding !== "base64")
    throw new Error(`github_reservation_blob_encoding_invalid:${path}`);
  const encoded = text(blob.content, `github_reservation_blob_content_invalid:${path}`).replace(
    /\s/gu,
    "",
  );
  if (!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/u.test(encoded)) {
    throw new Error(`github_reservation_blob_base64_invalid:${path}`);
  }
  return Buffer.from(encoded, "base64").toString("utf8");
}

function planMaterial(path: string, source: string) {
  const match = path.match(PLAN_PATH);
  if (!match) throw new Error(`github_reservation_plan_path_invalid:${path}`);
  const planId = match[1] ?? "";
  const metadata = frontmatter(source, path);
  if (metadata.plan_id !== planId) throw new Error(`github_reservation_plan_id_mismatch:${path}`);
  const responsibilityOwner = text(
    metadata.responsibility_owner,
    `github_reservation_responsibility_owner_invalid:${path}`,
  );
  if (!STABLE_ID.test(responsibilityOwner)) {
    throw new Error(`github_reservation_responsibility_owner_invalid:${path}`);
  }
  return {
    plan_id: planId,
    owner_issue: integer(
      metadata.github_issue_id,
      `github_reservation_owner_issue_invalid:${path}`,
    ),
    responsibility_owner: responsibilityOwner,
    plan_path: path,
    plan_blob_digest: sha256Digest(source),
  };
}

function plansAtHead(api: GithubApi, repository: string, headSha: string) {
  const treePayload = record(
    api(`repos/${repository}/git/trees/${headSha}?recursive=1`),
    "github_reservation_tree_invalid",
  );
  if (treePayload.truncated === true) throw new Error("github_reservation_tree_truncated");
  if (!Array.isArray(treePayload.tree)) throw new Error("github_reservation_tree_entries_invalid");
  const plans = treePayload.tree
    .map((entry) => record(entry, "github_reservation_tree_entry_invalid"))
    .filter(
      (entry) =>
        entry.type === "blob" && typeof entry.path === "string" && PLAN_PATH.test(entry.path),
    )
    .map((entry) => {
      const path = text(entry.path, "github_reservation_tree_path_invalid");
      const blobSha = head(entry.sha, `github_reservation_tree_blob_sha_invalid:${path}`);
      const source = decodeBlob(api(`repos/${repository}/git/blobs/${blobSha}`), path);
      return planMaterial(path, source);
    });
  return plans.sort((left, right) => compareBytewise(left.plan_id, right.plan_id));
}

function mainHead(api: GithubApi, repository: string): string {
  const ref = record(
    api(`repos/${repository}/git/ref/heads/main`),
    "github_reservation_main_ref_invalid",
  );
  return head(
    record(ref.object, "github_reservation_main_object_invalid").sha,
    "github_reservation_main_head_invalid",
  );
}

function paged(api: GithubApi, endpoint: (page: number) => string, code: string): unknown[] {
  const values: unknown[] = [];
  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const payload = api(endpoint(page));
    if (!Array.isArray(payload)) throw new Error(`${code}_invalid`);
    values.push(...payload);
    if (payload.length < PAGE_SIZE) return values;
  }
  throw new Error(`${code}_page_limit_exceeded`);
}

function openPullRequests(api: GithubApi, repository: string) {
  return paged(
    api,
    (page) =>
      `repos/${repository}/pulls?state=open&sort=created&direction=asc&per_page=${PAGE_SIZE}&page=${page}`,
    "github_reservation_open_pr_page",
  ).map((value) => {
    const pr = record(value, "github_reservation_open_pr_invalid");
    const branchHead = record(pr.head, "github_reservation_open_pr_head_invalid");
    return {
      number: integer(pr.number, "github_reservation_open_pr_number_invalid"),
      branch: text(branchHead.ref, "github_reservation_open_pr_branch_invalid"),
      head_sha: head(branchHead.sha, "github_reservation_open_pr_head_sha_invalid"),
    };
  });
}

function prCommitHeads(api: GithubApi, repository: string, prNumber: number): string[] {
  return [
    ...new Set(
      paged(
        api,
        (page) =>
          `repos/${repository}/pulls/${prNumber}/commits?per_page=${PAGE_SIZE}&page=${page}`,
        "github_reservation_pr_commits_page",
      ).map((value) =>
        head(
          record(value, "github_reservation_pr_commit_invalid").sha,
          "github_reservation_pr_commit_sha_invalid",
        ),
      ),
    ),
  ].sort(compareBytewise);
}

function prReadAfter(
  api: GithubApi,
  repository: string,
  listed: ReturnType<typeof openPullRequests>[number],
) {
  const value = record(
    api(`repos/${repository}/pulls/${listed.number}`),
    "github_reservation_pr_read_after_invalid",
  );
  const currentHead = record(value.head, "github_reservation_pr_read_after_head_invalid");
  const currentHeadSha = head(currentHead.sha, "github_reservation_pr_read_after_sha_invalid");
  const currentBranch = text(currentHead.ref, "github_reservation_pr_read_after_branch_invalid");
  const merged = typeof value.merged_at === "string" && value.merged_at.length > 0;
  const state = value.state;
  if (state !== "open" && state !== "closed")
    throw new Error("github_reservation_pr_state_invalid");
  if (state === "open" && (currentHeadSha !== listed.head_sha || currentBranch !== listed.branch)) {
    throw new Error(`github_reservation_pr_head_race:${listed.number}`);
  }
  const lifecycle = state === "open" ? "open" : merged ? "merged" : "closed";
  return {
    currentHeadSha,
    currentBranch,
    lifecycle,
    terminal_evidence:
      lifecycle === "open"
        ? null
        : {
            recorded_at: text(value.updated_at, "github_reservation_pr_updated_at_invalid"),
            evidence_digest: sha256Digest(
              canonicalJson({ number: listed.number, lifecycle, head_sha: currentHeadSha }),
            ),
          },
  } as const;
}

/**
 * GitHub current mainとopen PRを全page・read-after付きで取得するeffect provider。
 * conflict判定は行わず、取得不能やraceはsurface unavailableへ閉じる。
 */
export function loadGithubOpenBranchPlanReservationMaterial(input: {
  repository: string;
  api?: GithubApi;
}): GithubReservationMaterial {
  const api = input.api ?? defaultGithubApi;
  let currentMain: GithubReservationMaterial["current_main"];
  try {
    const before = mainHead(api, input.repository);
    const plans = plansAtHead(api, input.repository, before);
    const after = mainHead(api, input.repository);
    if (before !== after) throw new Error("github_reservation_main_head_race");
    currentMain = { status: "available", head_sha: before, plans };
  } catch (error) {
    currentMain = unavailable("current_main", error);
  }

  let openPrHeads: GithubReservationMaterial["open_pr_heads"];
  try {
    const listed = openPullRequests(api, input.repository);
    const uniqueNumbers = new Set(listed.map((entry) => entry.number));
    if (uniqueNumbers.size !== listed.length)
      throw new Error("github_reservation_open_pr_duplicate");
    const pullRequests = listed.map((entry) => {
      const readAfter = prReadAfter(api, input.repository, entry);
      const commits = prCommitHeads(api, input.repository, entry.number);
      return {
        pr_number: entry.number,
        branch: readAfter.currentBranch,
        head_sha: readAfter.currentHeadSha,
        ancestor_head_shas: commits.filter((sha) => sha !== readAfter.currentHeadSha),
        lifecycle: readAfter.lifecycle,
        terminal_evidence: readAfter.terminal_evidence,
        plans: plansAtHead(api, input.repository, readAfter.currentHeadSha),
      };
    });
    const readAfterList = openPullRequests(api, input.repository);
    const expectedOpen = listed.filter(
      (entry) =>
        pullRequests.find((pullRequest) => pullRequest.pr_number === entry.number)?.lifecycle ===
        "open",
    );
    if (canonicalJson(expectedOpen) !== canonicalJson(readAfterList)) {
      throw new Error("github_reservation_open_pr_set_race");
    }
    openPrHeads = { status: "available", pull_requests: pullRequests };
  } catch (error) {
    openPrHeads = unavailable("open_pr_heads", error);
  }
  return { current_main: currentMain, open_pr_heads: openPrHeads };
}

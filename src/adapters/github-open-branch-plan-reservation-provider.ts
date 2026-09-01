import { execFileSync } from "node:child_process";
import { parse as parseYaml } from "yaml";
import { canonicalJson, compareBytewise, sha256Digest } from "../runtime/digest";
import type {
  OpenBranchPlanMaterial,
  OpenBranchPlanReservationAuthorityInput,
} from "../schema/open-branch-plan-reservation-authority";

type GithubReservationMaterial = Pick<
  OpenBranchPlanReservationAuthorityInput,
  "current_main" | "open_pr_heads"
>;

export type GithubApi = (endpoint: string) => unknown;

export const GITHUB_PLAN_RESERVATION_FETCH_RECEIPT_SCHEMA =
  "github-plan-reservation-fetch-receipt.v1" as const;
export const GITHUB_PLAN_RESERVATION_MATERIAL_CACHE_SCHEMA =
  "github-plan-reservation-material-cache.v1" as const;

export type GithubPlanReservationFetchBudget = {
  max_api_calls: number;
  max_process_ms: number;
  max_rate_limit_cost: number;
  max_tree_entries: number;
  max_plan_entries: number;
  max_changed_plan_entries: number;
  max_plan_batch: number;
  max_pages: number;
  max_open_pull_requests: number;
  max_commits_per_pull_request: number;
};

export type GithubPlanReservationBlobCacheEntry = {
  blob_sha: string;
  source: string;
  source_digest: string;
};

export type GithubPlanReservationCapture = {
  head_sha: string;
  tree_sha: string;
  captured_at: string;
  read_after_head_sha: string;
};

export type GithubPlanReservationMaterialCache = {
  schema_version: typeof GITHUB_PLAN_RESERVATION_MATERIAL_CACHE_SCHEMA;
  status: "complete" | "partial";
  blobs: Record<string, GithubPlanReservationBlobCacheEntry>;
  captures: Record<string, GithubPlanReservationCapture>;
};

export type GithubPlanReservationFetchReceipt = {
  schema_version: typeof GITHUB_PLAN_RESERVATION_FETCH_RECEIPT_SCHEMA;
  status: "complete" | "unavailable";
  budget: {
    api_calls: { used: number; max: number; limit: number };
    process_ms: { used: number; max: number; limit: number };
    request_cost: { used: number; max: number; limit: number };
  };
  plan_fetch: {
    tree_entries: number;
    plan_entries: number;
    changed_plan_entries: number;
    cache_hits: number;
    blob_fetches: number;
    batches: number;
  };
  surfaces: {
    current_main: "available" | "unavailable";
    open_pr_heads: "available" | "unavailable";
  };
  captures: GithubPlanReservationCapture[];
  failure_codes: string[];
};

export type GithubPlanReservationFetchResult = {
  material: GithubReservationMaterial;
  receipt: GithubPlanReservationFetchReceipt;
  next_cache: GithubPlanReservationMaterialCache | null;
};

export type GithubPlanReservationFetchInput = {
  repository: string;
  api?: GithubApi;
  budget?: Partial<GithubPlanReservationFetchBudget>;
  cache?: GithubPlanReservationMaterialCache;
  now_ms?: () => number;
  captured_at?: string;
};

const PAGE_SIZE = 100;
const PLAN_PATH = /^docs\/plans\/(PLAN-[A-Z0-9]+-\d+(?:-[a-z0-9-]+)?)\.md$/u;
const HEAD_SHA = /^[a-f0-9]{40}$/u;
const STABLE_ID = /^[A-Za-z0-9][A-Za-z0-9._:/-]{0,127}$/u;

export const DEFAULT_GITHUB_PLAN_RESERVATION_FETCH_BUDGET: GithubPlanReservationFetchBudget = {
  max_api_calls: 4_096,
  max_process_ms: 30_000,
  max_rate_limit_cost: 4_096,
  max_tree_entries: 100_000,
  max_plan_entries: 2_048,
  max_changed_plan_entries: 4_096,
  max_plan_batch: 128,
  max_pages: 100,
  max_open_pull_requests: 256,
  max_commits_per_pull_request: 10_000,
};

type FetchStats = {
  api_calls: number;
  process_ms: number;
  request_cost: number;
  tree_entries: number;
  plan_entries: number;
  changed_plan_entries: number;
  cache_hits: number;
  blob_fetches: number;
  batches: number;
};

type PlanTreeEntry = { path: string; blob_sha: string };
type HeadPlanCapture = { plans: OpenBranchPlanMaterial[]; capture: GithubPlanReservationCapture };

function emptyStats(): FetchStats {
  return {
    api_calls: 0,
    process_ms: 0,
    request_cost: 0,
    tree_entries: 0,
    plan_entries: 0,
    changed_plan_entries: 0,
    cache_hits: 0,
    blob_fetches: 0,
    batches: 0,
  };
}

function defaultGithubApi(timeoutMs: number): GithubApi {
  return (endpoint) =>
    JSON.parse(
      execFileSync("gh", ["api", endpoint], {
        encoding: "utf8",
        maxBuffer: 32 * 1024 * 1024,
        timeout: timeoutMs,
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

function failureReason(error: unknown): string {
  const message = error instanceof Error ? error.message : "";
  const stable = message.match(/^github_reservation_[a-z0-9_]+(?::.*)?$/u);
  if (stable) return stable[0]?.split(":", 1)[0] ?? "provider_call_failed";
  if (/rate.?limit|too many requests|\b429\b/iu.test(message)) {
    return "github_reservation_rate_limit_exhausted";
  }
  return "provider_call_failed";
}

function unavailable(surface: string, error: unknown) {
  return {
    status: "unavailable" as const,
    error_digest: sha256Digest(canonicalJson({ surface, reason: failureReason(error) })),
  };
}

function positiveInteger(value: unknown, field: string): number {
  if (!Number.isSafeInteger(value) || Number(value) < 1) {
    throw new Error(`github_reservation_${field}_invalid`);
  }
  return Number(value);
}

function positiveNumber(value: unknown, field: string): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 1) {
    throw new Error(`github_reservation_${field}_invalid`);
  }
  return value;
}

function resolveBudget(
  requested: Partial<GithubPlanReservationFetchBudget> | undefined,
): GithubPlanReservationFetchBudget {
  const merged = { ...DEFAULT_GITHUB_PLAN_RESERVATION_FETCH_BUDGET, ...requested };
  return {
    max_api_calls: positiveInteger(merged.max_api_calls, "api_call_budget"),
    max_process_ms: positiveNumber(merged.max_process_ms, "process_budget"),
    max_rate_limit_cost: positiveInteger(merged.max_rate_limit_cost, "rate_limit_budget"),
    max_tree_entries: positiveInteger(merged.max_tree_entries, "tree_threshold"),
    max_plan_entries: positiveInteger(merged.max_plan_entries, "plan_threshold"),
    max_changed_plan_entries: positiveInteger(
      merged.max_changed_plan_entries,
      "changed_plan_threshold",
    ),
    max_plan_batch: positiveInteger(merged.max_plan_batch, "plan_batch"),
    max_pages: positiveInteger(merged.max_pages, "page_limit"),
    max_open_pull_requests: positiveInteger(merged.max_open_pull_requests, "open_pr_threshold"),
    max_commits_per_pull_request: positiveInteger(
      merged.max_commits_per_pull_request,
      "commit_threshold",
    ),
  };
}

class FetchBudgetController {
  readonly stats = emptyStats();
  private readonly startedAt: number;

  constructor(
    private readonly budget: GithubPlanReservationFetchBudget,
    private readonly now: () => number,
  ) {
    this.startedAt = this.readClock();
  }

  private readClock(): number {
    const value = this.now();
    if (!Number.isFinite(value)) throw new Error("github_reservation_process_clock_invalid");
    return value;
  }

  private elapsed(): number {
    const current = this.readClock();
    const elapsed = current - this.startedAt;
    if (elapsed < 0) throw new Error("github_reservation_process_clock_regressed");
    this.stats.process_ms = elapsed;
    return elapsed;
  }

  checkProcessBudget(): void {
    if (this.elapsed() > this.budget.max_process_ms) {
      throw new Error("github_reservation_process_budget_exceeded");
    }
  }

  call(api: GithubApi, endpoint: string): unknown {
    this.checkProcessBudget();
    if (this.stats.api_calls >= this.budget.max_api_calls) {
      throw new Error("github_reservation_api_call_budget_exceeded");
    }
    if (this.stats.request_cost >= this.budget.max_rate_limit_cost) {
      throw new Error("github_reservation_rate_limit_budget_exceeded");
    }
    this.stats.api_calls += 1;
    this.stats.request_cost += 1;
    try {
      const value = api(endpoint);
      this.checkProcessBudget();
      return value;
    } catch (error) {
      this.stats.process_ms = this.elapsed();
      throw error;
    }
  }

  threshold(value: number, limit: number, code: string): void {
    if (value > limit) throw new Error(code);
  }
}

function frontmatter(source: string, path: string): Record<string, unknown> {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/u);
  if (!match) throw new Error(`github_reservation_plan_frontmatter_missing:${path}`);
  return record(parseYaml(match[1] ?? ""), `github_reservation_plan_frontmatter_invalid:${path}`);
}

function decodeBlob(payload: unknown, path: string): string {
  const blob = record(payload, `github_reservation_blob_invalid:${path}`);
  if (blob.encoding !== "base64") {
    throw new Error(`github_reservation_blob_encoding_invalid:${path}`);
  }
  const encoded = text(blob.content, `github_reservation_blob_content_invalid:${path}`).replace(
    /\s/gu,
    "",
  );
  if (!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/u.test(encoded)) {
    throw new Error(`github_reservation_blob_base64_invalid:${path}`);
  }
  return Buffer.from(encoded, "base64").toString("utf8");
}

function planMaterial(path: string, source: string): OpenBranchPlanMaterial {
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

function validateCache(cache: GithubPlanReservationMaterialCache | undefined): void {
  if (!cache) return;
  if (cache.schema_version !== GITHUB_PLAN_RESERVATION_MATERIAL_CACHE_SCHEMA) {
    throw new Error("github_reservation_cache_schema_invalid");
  }
  if (cache.status === "partial") throw new Error("github_reservation_partial_cache");
  if (
    cache.status !== "complete" ||
    cache.blobs === null ||
    typeof cache.blobs !== "object" ||
    cache.captures === null ||
    typeof cache.captures !== "object"
  ) {
    throw new Error("github_reservation_cache_status_invalid");
  }
  for (const [blobSha, entry] of Object.entries(cache.blobs)) {
    if (
      !HEAD_SHA.test(blobSha) ||
      entry.blob_sha !== blobSha ||
      typeof entry.source !== "string" ||
      entry.source_digest !== sha256Digest(entry.source)
    ) {
      throw new Error("github_reservation_cache_entry_mismatch");
    }
  }
  for (const [headSha, capture] of Object.entries(cache.captures)) {
    if (
      !HEAD_SHA.test(headSha) ||
      capture.head_sha !== headSha ||
      !HEAD_SHA.test(capture.tree_sha) ||
      capture.read_after_head_sha !== headSha ||
      !Number.isFinite(Date.parse(capture.captured_at))
    ) {
      throw new Error("github_reservation_cache_capture_mismatch");
    }
  }
}

function cachedSource(
  cacheBlobs: Record<string, GithubPlanReservationBlobCacheEntry> | undefined,
  operationCache: Map<string, string>,
  entry: PlanTreeEntry,
): string | null {
  const local = operationCache.get(entry.blob_sha);
  if (local) return local;
  const external = cacheBlobs?.[entry.blob_sha];
  if (!external) return null;
  if (
    external.blob_sha !== entry.blob_sha ||
    typeof external.source !== "string" ||
    external.source_digest !== sha256Digest(external.source)
  ) {
    throw new Error(`github_reservation_cache_entry_mismatch:${entry.path}`);
  }
  operationCache.set(entry.blob_sha, external.source);
  return external.source;
}

function treeSha(treePayload: Record<string, unknown>): string {
  if (typeof treePayload.sha !== "string" || !HEAD_SHA.test(treePayload.sha)) {
    throw new Error("github_reservation_archive_tree_mismatch");
  }
  return treePayload.sha;
}

function planTreeEntries(
  treePayload: Record<string, unknown>,
  controller: FetchBudgetController,
  budget: GithubPlanReservationFetchBudget,
): PlanTreeEntry[] {
  treeSha(treePayload);
  if (treePayload.truncated !== false) throw new Error("github_reservation_tree_truncated");
  if (!Array.isArray(treePayload.tree)) throw new Error("github_reservation_tree_entries_invalid");
  controller.stats.tree_entries += treePayload.tree.length;
  controller.threshold(
    treePayload.tree.length,
    budget.max_tree_entries,
    "github_reservation_tree_threshold_exceeded",
  );
  const seenPaths = new Set<string>();
  const plans: PlanTreeEntry[] = [];
  for (const rawEntry of treePayload.tree) {
    const entry = record(rawEntry, "github_reservation_tree_entry_invalid");
    const path = typeof entry.path === "string" ? entry.path : null;
    if (!path || !PLAN_PATH.test(path)) continue;
    if (seenPaths.has(path) || entry.type !== "blob") {
      throw new Error("github_reservation_archive_tree_mismatch");
    }
    seenPaths.add(path);
    plans.push({
      path,
      blob_sha: head(entry.sha, `github_reservation_tree_blob_sha_invalid:${path}`),
    });
  }
  controller.stats.plan_entries += plans.length;
  controller.threshold(
    plans.length,
    budget.max_plan_entries,
    "github_reservation_plan_threshold_exceeded",
  );
  return plans.sort((left, right) => compareBytewise(left.path, right.path));
}

function plansAtHead(input: {
  api: GithubApi;
  repository: string;
  headSha: string;
  controller: FetchBudgetController;
  cacheBlobs: Record<string, GithubPlanReservationBlobCacheEntry> | undefined;
  cacheCaptures: Record<string, GithubPlanReservationCapture> | undefined;
  operationCache: Map<string, string>;
  nextBlobs: Record<string, GithubPlanReservationBlobCacheEntry>;
  capturedAt: string;
  budget: GithubPlanReservationFetchBudget;
}): HeadPlanCapture {
  const {
    api,
    repository,
    headSha,
    controller,
    cacheBlobs,
    cacheCaptures,
    operationCache,
    nextBlobs,
    capturedAt,
    budget,
  } = input;
  const treePayload = record(
    controller.call(api, `repos/${repository}/git/trees/${headSha}?recursive=1`),
    "github_reservation_tree_invalid",
  );
  const captureTreeSha = treeSha(treePayload);
  const priorCapture = cacheCaptures?.[headSha];
  if (priorCapture && priorCapture.tree_sha !== captureTreeSha) {
    throw new Error("github_reservation_stale_cache");
  }
  const reusableBlobs = priorCapture ? cacheBlobs : undefined;
  const entries = planTreeEntries(treePayload, controller, budget);
  const values = new Map<string, OpenBranchPlanMaterial>();
  const missing: PlanTreeEntry[] = [];
  for (const entry of entries) {
    const source = cachedSource(reusableBlobs, operationCache, entry);
    if (source !== null) {
      controller.stats.cache_hits += 1;
      values.set(entry.path, planMaterial(entry.path, source));
      nextBlobs[entry.blob_sha] = {
        blob_sha: entry.blob_sha,
        source,
        source_digest: sha256Digest(source),
      };
    } else {
      missing.push(entry);
    }
  }
  controller.stats.changed_plan_entries += missing.length;
  controller.threshold(
    controller.stats.changed_plan_entries,
    budget.max_changed_plan_entries,
    "github_reservation_changed_plan_threshold_exceeded",
  );
  for (let offset = 0; offset < missing.length; offset += budget.max_plan_batch) {
    const batch = missing.slice(offset, offset + budget.max_plan_batch);
    controller.stats.batches += 1;
    for (const entry of batch) {
      const source = decodeBlob(
        controller.call(api, `repos/${repository}/git/blobs/${entry.blob_sha}`),
        entry.path,
      );
      const material = planMaterial(entry.path, source);
      operationCache.set(entry.blob_sha, source);
      nextBlobs[entry.blob_sha] = {
        blob_sha: entry.blob_sha,
        source,
        source_digest: sha256Digest(source),
      };
      values.set(entry.path, material);
      controller.stats.blob_fetches += 1;
    }
  }
  const plans = entries.map((entry) => {
    const value = values.get(entry.path);
    if (!value) throw new Error(`github_reservation_partial_cache:${entry.path}`);
    return value;
  });
  return {
    plans,
    capture: {
      head_sha: headSha,
      tree_sha: captureTreeSha,
      captured_at: capturedAt,
      read_after_head_sha: headSha,
    },
  };
}

function mainHead(api: GithubApi, repository: string, controller: FetchBudgetController): string {
  const ref = record(
    controller.call(api, `repos/${repository}/git/ref/heads/main`),
    "github_reservation_main_ref_invalid",
  );
  return head(
    record(ref.object, "github_reservation_main_object_invalid").sha,
    "github_reservation_main_head_invalid",
  );
}

function paged(input: {
  api: GithubApi;
  endpoint: (page: number) => string;
  code: string;
  controller: FetchBudgetController;
  maxPages: number;
  maxItems: number;
  thresholdCode: string;
}): unknown[] {
  const { api, endpoint, code, controller, maxPages, maxItems, thresholdCode } = input;
  const values: unknown[] = [];
  for (let page = 1; page <= maxPages; page += 1) {
    const payload = controller.call(api, endpoint(page));
    if (!Array.isArray(payload)) throw new Error(`${code}_invalid`);
    if (payload.length > PAGE_SIZE) throw new Error(`${code}_page_size_exceeded`);
    values.push(...payload);
    if (values.length > maxItems) throw new Error(thresholdCode);
    if (payload.length < PAGE_SIZE) return values;
  }
  throw new Error(`${code}_page_limit_exceeded`);
}

function openPullRequests(input: {
  api: GithubApi;
  repository: string;
  controller: FetchBudgetController;
  budget: GithubPlanReservationFetchBudget;
}) {
  const { api, repository, controller, budget } = input;
  const values = paged({
    api,
    endpoint: (page) =>
      `repos/${repository}/pulls?state=open&sort=created&direction=asc&per_page=${PAGE_SIZE}&page=${page}`,
    code: "github_reservation_open_pr_page",
    controller,
    maxPages: budget.max_pages,
    maxItems: budget.max_open_pull_requests,
    thresholdCode: "github_reservation_open_pr_threshold_exceeded",
  });
  controller.threshold(
    values.length,
    budget.max_open_pull_requests,
    "github_reservation_open_pr_threshold_exceeded",
  );
  return values.map((value) => {
    const pr = record(value, "github_reservation_open_pr_invalid");
    const branchHead = record(pr.head, "github_reservation_open_pr_head_invalid");
    return {
      number: integer(pr.number, "github_reservation_open_pr_number_invalid"),
      branch: text(branchHead.ref, "github_reservation_open_pr_branch_invalid"),
      head_sha: head(branchHead.sha, "github_reservation_open_pr_head_sha_invalid"),
    };
  });
}

function prCommitHeads(input: {
  api: GithubApi;
  repository: string;
  prNumber: number;
  controller: FetchBudgetController;
  budget: GithubPlanReservationFetchBudget;
}): string[] {
  const { api, repository, prNumber, controller, budget } = input;
  const commits = paged({
    api,
    endpoint: (page) =>
      `repos/${repository}/pulls/${prNumber}/commits?per_page=${PAGE_SIZE}&page=${page}`,
    code: "github_reservation_pr_commits_page",
    controller,
    maxPages: budget.max_pages,
    maxItems: budget.max_commits_per_pull_request,
    thresholdCode: "github_reservation_commit_threshold_exceeded",
  });
  controller.threshold(
    commits.length,
    budget.max_commits_per_pull_request,
    "github_reservation_commit_threshold_exceeded",
  );
  return [
    ...new Set(
      commits.map((value) =>
        head(
          record(value, "github_reservation_pr_commit_invalid").sha,
          "github_reservation_pr_commit_sha_invalid",
        ),
      ),
    ),
  ].sort(compareBytewise);
}

function prReadAfter(input: {
  api: GithubApi;
  repository: string;
  listed: ReturnType<typeof openPullRequests>[number];
  controller: FetchBudgetController;
}) {
  const { api, repository, listed, controller } = input;
  const value = record(
    controller.call(api, `repos/${repository}/pulls/${listed.number}`),
    "github_reservation_pr_read_after_invalid",
  );
  const currentHead = record(value.head, "github_reservation_pr_read_after_head_invalid");
  const currentHeadSha = head(currentHead.sha, "github_reservation_pr_read_after_sha_invalid");
  const currentBranch = text(currentHead.ref, "github_reservation_pr_read_after_branch_invalid");
  const merged = typeof value.merged_at === "string" && value.merged_at.length > 0;
  const state = value.state;
  if (state !== "open" && state !== "closed") {
    throw new Error("github_reservation_pr_state_invalid");
  }
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

function receipt(input: {
  budget: GithubPlanReservationFetchBudget;
  stats: FetchStats;
  currentMain: GithubReservationMaterial["current_main"];
  openPrHeads: GithubReservationMaterial["open_pr_heads"];
  failures: Set<string>;
  captures: GithubPlanReservationCapture[];
}): GithubPlanReservationFetchReceipt {
  const { budget, stats, currentMain, openPrHeads, failures, captures } = input;
  return {
    schema_version: GITHUB_PLAN_RESERVATION_FETCH_RECEIPT_SCHEMA,
    status:
      currentMain.status === "available" && openPrHeads.status === "available"
        ? "complete"
        : "unavailable",
    budget: {
      api_calls: { used: stats.api_calls, max: budget.max_api_calls, limit: budget.max_api_calls },
      process_ms: {
        used: stats.process_ms,
        max: budget.max_process_ms,
        limit: budget.max_process_ms,
      },
      request_cost: {
        used: stats.request_cost,
        max: budget.max_rate_limit_cost,
        limit: budget.max_rate_limit_cost,
      },
    },
    plan_fetch: {
      tree_entries: stats.tree_entries,
      plan_entries: stats.plan_entries,
      changed_plan_entries: stats.changed_plan_entries,
      cache_hits: stats.cache_hits,
      blob_fetches: stats.blob_fetches,
      batches: stats.batches,
    },
    surfaces: {
      current_main: currentMain.status,
      open_pr_heads: openPrHeads.status,
    },
    captures: [...captures].sort((left, right) => compareBytewise(left.head_sha, right.head_sha)),
    failure_codes: [...failures].sort(compareBytewise),
  };
}

function unavailableResult(input: {
  error: unknown;
  budget: GithubPlanReservationFetchBudget;
  stats: FetchStats;
  failures: Set<string>;
}): GithubPlanReservationFetchResult {
  const { error, budget, stats, failures } = input;
  const reason = failureReason(error);
  failures.add(reason);
  const currentMain = unavailable("current_main", error);
  const openPrHeads = unavailable("open_pr_heads", error);
  return {
    material: { current_main: currentMain, open_pr_heads: openPrHeads },
    receipt: receipt({
      budget,
      stats,
      currentMain,
      openPrHeads,
      failures,
      captures: [],
    }),
    next_cache: null,
  };
}

/**
 * GitHub current mainとopen PRをbounded effectとして取得し、budget receiptを分離して返す。
 * conflict判定は行わず、取得不能やraceはsurface unavailableへ閉じる。
 */
export function loadGithubOpenBranchPlanReservationMaterialWithReceipt(
  input: GithubPlanReservationFetchInput,
): GithubPlanReservationFetchResult {
  const failures = new Set<string>();
  let budget: GithubPlanReservationFetchBudget;
  try {
    budget = resolveBudget(input.budget);
  } catch (error) {
    return unavailableResult({
      error,
      budget: DEFAULT_GITHUB_PLAN_RESERVATION_FETCH_BUDGET,
      stats: emptyStats(),
      failures,
    });
  }
  let controller: FetchBudgetController;
  try {
    controller = new FetchBudgetController(budget, input.now_ms ?? (() => Date.now()));
  } catch (error) {
    return unavailableResult({ error, budget, stats: emptyStats(), failures });
  }
  try {
    validateCache(input.cache);
  } catch (error) {
    return unavailableResult({ error, budget, stats: controller.stats, failures });
  }
  const capturedAt = input.captured_at ?? new Date().toISOString();
  if (!Number.isFinite(Date.parse(capturedAt))) {
    return unavailableResult({
      error: new Error("github_reservation_captured_at_invalid"),
      budget,
      stats: controller.stats,
      failures,
    });
  }
  const api = input.api ?? defaultGithubApi(budget.max_process_ms);
  const operationCache = new Map<string, string>();
  const nextBlobs: Record<string, GithubPlanReservationBlobCacheEntry> = {};
  const captures: GithubPlanReservationCapture[] = [];
  let currentMain: GithubReservationMaterial["current_main"];
  try {
    const before = mainHead(api, input.repository, controller);
    const captured = plansAtHead({
      api,
      repository: input.repository,
      headSha: before,
      controller,
      cacheBlobs: input.cache?.blobs,
      cacheCaptures: input.cache?.captures,
      operationCache,
      nextBlobs,
      capturedAt,
      budget,
    });
    const after = mainHead(api, input.repository, controller);
    if (before !== after) throw new Error("github_reservation_main_head_race");
    captured.capture.read_after_head_sha = after;
    captures.push(captured.capture);
    currentMain = { status: "available", head_sha: before, plans: captured.plans };
  } catch (error) {
    const reason = failureReason(error);
    failures.add(reason);
    currentMain = unavailable("current_main", error);
  }

  let openPrHeads: GithubReservationMaterial["open_pr_heads"];
  try {
    const listed = openPullRequests({ api, repository: input.repository, controller, budget });
    const uniqueNumbers = new Set(listed.map((entry) => entry.number));
    if (uniqueNumbers.size !== listed.length) {
      throw new Error("github_reservation_open_pr_duplicate");
    }
    const pullRequests = listed.map((entry) => {
      const readAfter = prReadAfter({
        api,
        repository: input.repository,
        listed: entry,
        controller,
      });
      const commits = prCommitHeads({
        api,
        repository: input.repository,
        prNumber: entry.number,
        controller,
        budget,
      });
      const captured = plansAtHead({
        api,
        repository: input.repository,
        headSha: readAfter.currentHeadSha,
        controller,
        cacheBlobs: input.cache?.blobs,
        cacheCaptures: input.cache?.captures,
        operationCache,
        nextBlobs,
        capturedAt,
        budget,
      });
      captures.push(captured.capture);
      return {
        pr_number: entry.number,
        branch: readAfter.currentBranch,
        head_sha: readAfter.currentHeadSha,
        ancestor_head_shas: commits.filter((sha) => sha !== readAfter.currentHeadSha),
        lifecycle: readAfter.lifecycle,
        terminal_evidence: readAfter.terminal_evidence,
        plans: captured.plans,
      };
    });
    const readAfterList = openPullRequests({
      api,
      repository: input.repository,
      controller,
      budget,
    });
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
    const reason = failureReason(error);
    failures.add(reason);
    openPrHeads = unavailable("open_pr_heads", error);
  }
  try {
    controller.checkProcessBudget();
  } catch (error) {
    const reason = failureReason(error);
    failures.add(reason);
    currentMain = unavailable("current_main", error);
    openPrHeads = unavailable("open_pr_heads", error);
  }
  const complete = currentMain.status === "available" && openPrHeads.status === "available";
  return {
    material: { current_main: currentMain, open_pr_heads: openPrHeads },
    receipt: receipt({
      budget,
      stats: controller.stats,
      currentMain,
      openPrHeads,
      failures,
      captures,
    }),
    next_cache: complete
      ? {
          schema_version: GITHUB_PLAN_RESERVATION_MATERIAL_CACHE_SCHEMA,
          status: "complete",
          blobs: nextBlobs,
          captures: Object.fromEntries(captures.map((capture) => [capture.head_sha, capture])),
        }
      : null,
  };
}

/**
 * Backward-compatible material-only facade. The receipt is intentionally not included in the
 * semantic input object consumed by the projection adapter.
 */
export function loadGithubOpenBranchPlanReservationMaterial(
  input: GithubPlanReservationFetchInput,
): GithubReservationMaterial {
  return loadGithubOpenBranchPlanReservationMaterialWithReceipt(input).material;
}

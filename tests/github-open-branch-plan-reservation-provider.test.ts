import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  GITHUB_PLAN_RESERVATION_MATERIAL_CACHE_SCHEMA,
  loadGithubOpenBranchPlanReservationMaterial,
  loadGithubOpenBranchPlanReservationMaterialWithReceipt,
} from "../src/adapters/github-open-branch-plan-reservation-provider";
import { buildOpenBranchPlanReservationAuthoritySnapshot } from "../src/adapters/open-branch-plan-reservation-authority";
import { projectOpenBranchPlanReservations } from "../src/runtime/open-branch-plan-identity-reservation";

// PLAN-L7-723-github-open-branch-plan-reservation-provider

const MAIN = "a".repeat(40);
const PR_HEAD = "b".repeat(40);
const MAIN_TREE = "1".repeat(40);
const PR_TREE = "2".repeat(40);
const PLAN_BLOB = "c".repeat(40);
const PLAN_PATH = "docs/plans/PLAN-L7-723-github-open-branch-plan-reservation-provider.md";
const PLAN_SOURCE = `---
plan_id: PLAN-L7-723-github-open-branch-plan-reservation-provider
github_issue_id: 1256
responsibility_owner: github-open-branch-plan-reservation-provider
---
`;
const SECOND_PLAN_BLOB = "e".repeat(40);
const SECOND_PLAN_PATH = "docs/plans/PLAN-L7-726-github-plan-reservation-bounded-fetch.md";
const SECOND_PLAN_SOURCE = `---
plan_id: PLAN-L7-726-github-plan-reservation-bounded-fetch
github_issue_id: 1331
responsibility_owner: github-plan-reservation-fetch-budget
---
`;

function blob(source = PLAN_SOURCE) {
  return { encoding: "base64", content: Buffer.from(source, "utf8").toString("base64") };
}

function fixture(overrides: Record<string, unknown> = {}) {
  const calls: string[] = [];
  const pages = new Map<string, unknown>([
    ["repos/RetryYN/HELIX-HARNESS/git/ref/heads/main", { object: { sha: MAIN } }],
    [
      `repos/RetryYN/HELIX-HARNESS/git/trees/${MAIN}?recursive=1`,
      {
        sha: MAIN_TREE,
        truncated: false,
        tree: [{ path: PLAN_PATH, type: "blob", sha: PLAN_BLOB }],
      },
    ],
    [
      `repos/RetryYN/HELIX-HARNESS/git/trees/${PR_HEAD}?recursive=1`,
      { sha: PR_TREE, truncated: false, tree: [{ path: PLAN_PATH, type: "blob", sha: PLAN_BLOB }] },
    ],
    [`repos/RetryYN/HELIX-HARNESS/git/blobs/${PLAN_BLOB}`, blob()],
    [
      "repos/RetryYN/HELIX-HARNESS/pulls?state=open&sort=created&direction=asc&per_page=100&page=1",
      [{ number: 1325, head: { ref: "feature/1256-provider", sha: PR_HEAD } }],
    ],
    [
      "repos/RetryYN/HELIX-HARNESS/pulls/1325",
      {
        number: 1325,
        state: "open",
        merged_at: null,
        updated_at: "2026-09-01T06:00:00Z",
        head: { ref: "feature/1256-provider", sha: PR_HEAD },
      },
    ],
    [
      "repos/RetryYN/HELIX-HARNESS/pulls/1325/commits?per_page=100&page=1",
      [{ sha: MAIN }, { sha: PR_HEAD }],
    ],
  ]);
  for (const [key, value] of Object.entries(overrides)) {
    if (
      key.includes("/git/trees/") &&
      value &&
      typeof value === "object" &&
      !Array.isArray(value)
    ) {
      const tree = value as Record<string, unknown>;
      pages.set(key, {
        sha: key.includes(MAIN) ? MAIN_TREE : PR_TREE,
        ...tree,
      });
    } else {
      pages.set(key, value);
    }
  }
  return {
    calls,
    api(endpoint: string) {
      calls.push(endpoint);
      if (!pages.has(endpoint)) throw new Error(`unexpected:${endpoint}`);
      return structuredClone(pages.get(endpoint));
    },
  };
}

describe("GitHub open branch PLAN reservation provider", () => {
  it("U-OBPRGH-001: mainとopen PRの全PLAN materialをread-after付きで取得する", () => {
    const f = fixture();
    const material = loadGithubOpenBranchPlanReservationMaterial({
      repository: "RetryYN/HELIX-HARNESS",
      api: f.api,
    });
    expect(material.current_main).toMatchObject({ status: "available", head_sha: MAIN });
    expect(material.open_pr_heads).toMatchObject({
      status: "available",
      pull_requests: [
        {
          pr_number: 1325,
          head_sha: PR_HEAD,
          ancestor_head_shas: [MAIN],
          lifecycle: "open",
          terminal_evidence: null,
        },
      ],
    });
    expect(f.calls.filter((call) => call.includes("pulls?state=open"))).toHaveLength(2);
    expect(f.calls.filter((call) => call.endsWith("git/ref/heads/main"))).toHaveLength(2);
    expect(f.calls.filter((call) => call.endsWith(`git/blobs/${PLAN_BLOB}`))).toHaveLength(1);
  });

  it("U-OBPRGH-008: tree blob SHAが同じPLANはcache hit、changed PLANだけをbounded batch取得する", () => {
    const f = fixture({
      [`repos/RetryYN/HELIX-HARNESS/git/trees/${MAIN}?recursive=1`]: {
        truncated: false,
        tree: [
          { path: PLAN_PATH, type: "blob", sha: PLAN_BLOB },
          { path: SECOND_PLAN_PATH, type: "blob", sha: SECOND_PLAN_BLOB },
        ],
      },
      [`repos/RetryYN/HELIX-HARNESS/git/trees/${PR_HEAD}?recursive=1`]: {
        truncated: false,
        tree: [{ path: PLAN_PATH, type: "blob", sha: PLAN_BLOB }],
      },
      [`repos/RetryYN/HELIX-HARNESS/git/blobs/${SECOND_PLAN_BLOB}`]: blob(SECOND_PLAN_SOURCE),
    });
    const result = loadGithubOpenBranchPlanReservationMaterialWithReceipt({
      repository: "RetryYN/HELIX-HARNESS",
      api: f.api,
      budget: { max_plan_batch: 1 },
      now_ms: () => 0,
    });

    expect(result.material.current_main).toMatchObject({
      status: "available",
      plans: [
        { plan_id: "PLAN-L7-723-github-open-branch-plan-reservation-provider" },
        { plan_id: "PLAN-L7-726-github-plan-reservation-bounded-fetch" },
      ],
    });
    expect(result.receipt.plan_fetch).toMatchObject({
      changed_plan_entries: 2,
      cache_hits: 1,
      blob_fetches: 2,
      batches: 2,
    });
    expect(f.calls.filter((call) => call.includes("/git/blobs/")).sort()).toEqual([
      `repos/RetryYN/HELIX-HARNESS/git/blobs/${PLAN_BLOB}`,
      `repos/RetryYN/HELIX-HARNESS/git/blobs/${SECOND_PLAN_BLOB}`,
    ]);
  });

  it("U-OBPRGH-013: complete cacheは別captureでもmaterialを再利用しblob callを増やさない", () => {
    const cache = {
      schema_version: GITHUB_PLAN_RESERVATION_MATERIAL_CACHE_SCHEMA,
      status: "complete" as const,
      blobs: {},
      captures: {},
    };
    const first = fixture();
    const firstResult = loadGithubOpenBranchPlanReservationMaterialWithReceipt({
      repository: "RetryYN/HELIX-HARNESS",
      api: first.api,
      cache,
      now_ms: () => 0,
    });
    const second = fixture();
    const result = loadGithubOpenBranchPlanReservationMaterialWithReceipt({
      repository: "RetryYN/HELIX-HARNESS",
      api: second.api,
      cache: firstResult.next_cache ?? undefined,
      now_ms: () => 0,
    });
    expect(result.receipt.plan_fetch).toMatchObject({
      changed_plan_entries: 0,
      cache_hits: 2,
      blob_fetches: 0,
    });
    expect(second.calls.some((call) => call.includes("/git/blobs/"))).toBe(false);
  });

  it("U-OBPRGH-009: call／process／rate-limit budgetをreceiptへ固定し超過をunavailableへ閉じる", () => {
    const callFixture = fixture();
    const callBudget = loadGithubOpenBranchPlanReservationMaterialWithReceipt({
      repository: "RetryYN/HELIX-HARNESS",
      api: callFixture.api,
      budget: { max_api_calls: 1 },
      now_ms: () => 0,
    });
    expect(callBudget.material.current_main).toMatchObject({ status: "unavailable" });
    expect(callBudget.material.open_pr_heads).toMatchObject({ status: "unavailable" });
    expect(callBudget.receipt).toMatchObject({
      status: "unavailable",
      budget: { api_calls: { used: 1, max: 1 } },
    });
    expect(callFixture.calls).toHaveLength(1);

    const openThresholdFixture = fixture({
      "repos/RetryYN/HELIX-HARNESS/pulls?state=open&sort=created&direction=asc&per_page=100&page=1": [
        { number: 1325, head: { ref: "feature/1256-provider", sha: PR_HEAD } },
        { number: 1326, head: { ref: "feature/1331-bounded", sha: "d".repeat(40) } },
      ],
    });
    const openThreshold = loadGithubOpenBranchPlanReservationMaterialWithReceipt({
      repository: "RetryYN/HELIX-HARNESS",
      api: openThresholdFixture.api,
      budget: { max_open_pull_requests: 1 },
      now_ms: () => 0,
    });
    expect(openThreshold.material.open_pr_heads).toMatchObject({ status: "unavailable" });
    expect(openThreshold.receipt.failure_codes).toContain(
      "github_reservation_open_pr_threshold_exceeded",
    );
    expect(openThresholdFixture.calls).not.toContain(
      "repos/RetryYN/HELIX-HARNESS/pulls/1325",
    );

    let processNow = 0;
    const processBudget = loadGithubOpenBranchPlanReservationMaterialWithReceipt({
      repository: "RetryYN/HELIX-HARNESS",
      api: fixture().api,
      budget: { max_process_ms: 5 },
      now_ms: () => {
        processNow += 10;
        return processNow;
      },
    });
    expect(processBudget.material.current_main).toMatchObject({ status: "unavailable" });
    expect(processBudget.receipt.budget.process_ms.used).toBeGreaterThan(5);

    const rateLimitBudget = loadGithubOpenBranchPlanReservationMaterialWithReceipt({
      repository: "RetryYN/HELIX-HARNESS",
      api: fixture().api,
      budget: { max_rate_limit_cost: 1 },
      now_ms: () => 0,
    });
    expect(rateLimitBudget.material.current_main).toMatchObject({ status: "unavailable" });
    expect(rateLimitBudget.receipt.budget.request_cost).toMatchObject({ used: 1, max: 1 });

    const exhausted = loadGithubOpenBranchPlanReservationMaterialWithReceipt({
      repository: "RetryYN/HELIX-HARNESS",
      api() {
        throw new Error("HTTP 429: secret response body");
      },
      now_ms: () => 0,
    });
    expect(exhausted.receipt.failure_codes).toEqual(["github_reservation_rate_limit_exhausted"]);
  });

  it("U-OBPRGH-010: partial cacheはmaterialを推測せずAPI call前にfail-closeする", () => {
    const f = fixture();
    const result = loadGithubOpenBranchPlanReservationMaterialWithReceipt({
      repository: "RetryYN/HELIX-HARNESS",
      api: f.api,
      cache: {
        schema_version: GITHUB_PLAN_RESERVATION_MATERIAL_CACHE_SCHEMA,
        status: "partial",
        blobs: {},
        captures: {},
      },
      now_ms: () => 0,
    });
    expect(f.calls).toEqual([]);
    expect(result.material).toMatchObject({
      current_main: { status: "unavailable" },
      open_pr_heads: { status: "unavailable" },
    });
    expect(result.receipt.failure_codes).toContain("github_reservation_partial_cache");
  });

  it("U-OBPRGH-011: archive treeとしてPLAN pathが返る場合はblobを読まずfail-closeする", () => {
    const f = fixture({
      [`repos/RetryYN/HELIX-HARNESS/git/trees/${MAIN}?recursive=1`]: {
        truncated: false,
        tree: [{ path: PLAN_PATH, type: "tree", sha: PLAN_BLOB }],
      },
      [`repos/RetryYN/HELIX-HARNESS/git/trees/${PR_HEAD}?recursive=1`]: {
        truncated: false,
        tree: [],
      },
    });
    const result = loadGithubOpenBranchPlanReservationMaterialWithReceipt({
      repository: "RetryYN/HELIX-HARNESS",
      api: f.api,
      now_ms: () => 0,
    });
    expect(result.material.current_main).toMatchObject({ status: "unavailable" });
    expect(f.calls).not.toContain(`repos/RetryYN/HELIX-HARNESS/git/blobs/${PLAN_BLOB}`);
    expect(result.receipt.failure_codes).toContain("github_reservation_archive_tree_mismatch");
  });

  it("U-OBPRGH-012: 1,200 PLAN規模でもblob取得はunique changed setにboundedされる", () => {
    const count = 1_200;
    const tree = Array.from({ length: count }, (_, index) => {
      const planNumber = 10_000 + index;
      const path = `docs/plans/PLAN-L7-${planNumber}-repository-scale-${index}.md`;
      const sha = String(index + 1).padStart(40, "0");
      return { path, type: "blob", sha };
    });
    const overrides: Record<string, unknown> = {
      [`repos/RetryYN/HELIX-HARNESS/git/trees/${MAIN}?recursive=1`]: {
        truncated: false,
        tree,
      },
      [`repos/RetryYN/HELIX-HARNESS/git/trees/${PR_HEAD}?recursive=1`]: {
        truncated: false,
        tree,
      },
    };
    for (const [index, entry] of tree.entries()) {
      overrides[`repos/RetryYN/HELIX-HARNESS/git/blobs/${entry.sha}`] = blob(`---
plan_id: PLAN-L7-${10_000 + index}-repository-scale-${index}
github_issue_id: 1331
responsibility_owner: github-plan-reservation-fetch-budget
---
`);
    }
    const f = fixture(overrides);
    const result = loadGithubOpenBranchPlanReservationMaterialWithReceipt({
      repository: "RetryYN/HELIX-HARNESS",
      api: f.api,
      now_ms: () => 0,
    });
    expect(result.material.current_main).toMatchObject({ status: "available" });
    expect(result.material.open_pr_heads).toMatchObject({ status: "available" });
    expect(result.receipt).toMatchObject({
      status: "complete",
      plan_fetch: { changed_plan_entries: count, cache_hits: count, blob_fetches: count },
    });
    expect(f.calls.filter((call) => call.includes("/git/blobs/")).length).toBe(count);
    expect(result.receipt.budget.api_calls.used).toBeLessThanOrEqual(4_096);
  });

  it("U-OBPRGH-014: PLAN thresholdとarchive tree SHA mismatchは部分materialを公開しない", () => {
    const thresholdFixture = fixture({
      [`repos/RetryYN/HELIX-HARNESS/git/trees/${MAIN}?recursive=1`]: {
        truncated: false,
        tree: [
          { path: PLAN_PATH, type: "blob", sha: PLAN_BLOB },
          { path: SECOND_PLAN_PATH, type: "blob", sha: SECOND_PLAN_BLOB },
        ],
      },
      [`repos/RetryYN/HELIX-HARNESS/git/trees/${PR_HEAD}?recursive=1`]: {
        truncated: false,
        tree: [],
      },
    });
    const threshold = loadGithubOpenBranchPlanReservationMaterialWithReceipt({
      repository: "RetryYN/HELIX-HARNESS",
      api: thresholdFixture.api,
      budget: { max_plan_entries: 1 },
      now_ms: () => 0,
    });
    expect(threshold.material.current_main).toMatchObject({ status: "unavailable" });
    expect(thresholdFixture.calls).not.toContain(
      `repos/RetryYN/HELIX-HARNESS/git/blobs/${SECOND_PLAN_BLOB}`,
    );
    expect(threshold.receipt.failure_codes).toContain("github_reservation_plan_threshold_exceeded");

    const archiveFixture = fixture({
      [`repos/RetryYN/HELIX-HARNESS/git/trees/${MAIN}?recursive=1`]: {
        sha: "f".repeat(40),
        truncated: false,
        tree: [],
      },
      [`repos/RetryYN/HELIX-HARNESS/git/trees/${PR_HEAD}?recursive=1`]: {
        sha: "f".repeat(40),
        truncated: false,
        tree: [],
      },
    });
    const archive = loadGithubOpenBranchPlanReservationMaterialWithReceipt({
      repository: "RetryYN/HELIX-HARNESS",
      api: archiveFixture.api,
      cache: {
        schema_version: GITHUB_PLAN_RESERVATION_MATERIAL_CACHE_SCHEMA,
        status: "complete",
        blobs: {},
        captures: {
          [MAIN]: {
            head_sha: MAIN,
            tree_sha: "a".repeat(40),
            captured_at: "2026-09-01T00:00:00Z",
            read_after_head_sha: MAIN,
          },
        },
      },
      now_ms: () => 0,
    });
    expect(archive.material.current_main).toMatchObject({ status: "unavailable" });
    expect(archive.receipt.failure_codes).toContain("github_reservation_stale_cache");
  });

  it("U-OBPRGH-015: 後続surface失敗時はstaged cacheをcallerへpublishしない", () => {
    const cache = {
      schema_version: GITHUB_PLAN_RESERVATION_MATERIAL_CACHE_SCHEMA,
      status: "complete" as const,
      blobs: {},
      captures: {},
    };
    const f = fixture();
    const result = loadGithubOpenBranchPlanReservationMaterialWithReceipt({
      repository: "RetryYN/HELIX-HARNESS",
      api(endpoint) {
        if (endpoint.includes("pulls?state=open")) throw new Error("open surface unavailable");
        return f.api(endpoint);
      },
      cache,
      now_ms: () => 0,
    });
    expect(result.material.current_main).toMatchObject({ status: "available" });
    expect(result.material.open_pr_heads).toMatchObject({ status: "unavailable" });
    expect(cache.blobs).toEqual({});
    expect(result.next_cache).toBeNull();
  });

  it("U-OBPRGH-016: cache最適化前後でreservation projection digestが一致する", () => {
    const uncached = loadGithubOpenBranchPlanReservationMaterialWithReceipt({
      repository: "RetryYN/HELIX-HARNESS",
      api: fixture().api,
      now_ms: () => 0,
      captured_at: "2026-09-01T06:02:00Z",
    });
    expect(uncached.next_cache).not.toBeNull();
    const cachedFixture = fixture();
    const cached = loadGithubOpenBranchPlanReservationMaterialWithReceipt({
      repository: "RetryYN/HELIX-HARNESS",
      api: cachedFixture.api,
      cache: uncached.next_cache ?? undefined,
      now_ms: () => 0,
      captured_at: "2026-09-01T06:02:00Z",
    });
    const authorityInput = (material: typeof uncached.material) => ({
      repository: "RetryYN/HELIX-HARNESS",
      captured_at: "2026-09-01T06:02:00Z",
      ...material,
      active_writer_branches: {
        status: "available" as const,
        writers: [],
      },
    });
    const uncachedProjection = projectOpenBranchPlanReservations(
      buildOpenBranchPlanReservationAuthoritySnapshot(authorityInput(uncached.material)),
    );
    const cachedProjection = projectOpenBranchPlanReservations(
      buildOpenBranchPlanReservationAuthoritySnapshot(authorityInput(cached.material)),
    );
    expect(cachedProjection.projection_digest).toBe(uncachedProjection.projection_digest);
    expect(cachedFixture.calls.some((call) => call.includes("/git/blobs/"))).toBe(false);
  });

  it("U-OBPRGH-002: open PR setのread-after raceをunavailableへ閉じる", () => {
    const f = fixture();
    let listRead = 0;
    const material = loadGithubOpenBranchPlanReservationMaterial({
      repository: "RetryYN/HELIX-HARNESS",
      api(endpoint) {
        if (endpoint.includes("pulls?state=open")) {
          listRead += 1;
          return listRead === 1
            ? [{ number: 1325, head: { ref: "feature/1256-provider", sha: PR_HEAD } }]
            : [];
        }
        return f.api(endpoint);
      },
    });
    expect(material.open_pr_heads).toMatchObject({ status: "unavailable" });
  });

  it("U-OBPRGH-003: main ref raceとtruncated treeをlocal greenへfallbackしない", () => {
    const f = fixture();
    let refRead = 0;
    const raced = loadGithubOpenBranchPlanReservationMaterial({
      repository: "RetryYN/HELIX-HARNESS",
      api(endpoint) {
        if (endpoint.endsWith("git/ref/heads/main")) {
          refRead += 1;
          return { object: { sha: refRead === 1 ? MAIN : "d".repeat(40) } };
        }
        return f.api(endpoint);
      },
    });
    expect(raced.current_main).toMatchObject({ status: "unavailable" });

    const truncated = fixture({
      [`repos/RetryYN/HELIX-HARNESS/git/trees/${MAIN}?recursive=1`]: {
        truncated: true,
        tree: [],
      },
    });
    expect(
      loadGithubOpenBranchPlanReservationMaterial({
        repository: "RetryYN/HELIX-HARNESS",
        api: truncated.api,
      }).current_main,
    ).toMatchObject({ status: "unavailable" });
  });

  it("U-OBPRGH-004: pagination終端を要求し重複PRを拒否する", () => {
    const firstPage = Array.from({ length: 100 }, (_, index) => ({
      number: index + 1,
      head: { ref: `feature/${index + 1}`, sha: `${index + 1}`.padStart(40, "0") },
    }));
    const f = fixture({
      "repos/RetryYN/HELIX-HARNESS/pulls?state=open&sort=created&direction=asc&per_page=100&page=1":
        firstPage,
      "repos/RetryYN/HELIX-HARNESS/pulls?state=open&sort=created&direction=asc&per_page=100&page=2":
        [firstPage[0]],
    });
    const material = loadGithubOpenBranchPlanReservationMaterial({
      repository: "RetryYN/HELIX-HARNESS",
      api: f.api,
    });
    expect(material.open_pr_heads).toMatchObject({ status: "unavailable" });
    expect(f.calls).toContain(
      "repos/RetryYN/HELIX-HARNESS/pulls?state=open&sort=created&direction=asc&per_page=100&page=2",
    );
  });

  it("U-OBPRGH-005: list後にcloseされたPRをterminal evidenceへ変換する", () => {
    const f = fixture({
      "repos/RetryYN/HELIX-HARNESS/pulls/1325": {
        number: 1325,
        state: "closed",
        merged_at: "2026-09-01T06:01:00Z",
        updated_at: "2026-09-01T06:01:00Z",
        head: { ref: "feature/1256-provider", sha: PR_HEAD },
      },
    });
    let listRead = 0;
    const material = loadGithubOpenBranchPlanReservationMaterial({
      repository: "RetryYN/HELIX-HARNESS",
      api(endpoint) {
        if (endpoint.includes("pulls?state=open")) {
          listRead += 1;
          return listRead === 1
            ? [{ number: 1325, head: { ref: "feature/1256-provider", sha: PR_HEAD } }]
            : [];
        }
        return f.api(endpoint);
      },
    });
    expect(material.open_pr_heads).toMatchObject({
      status: "available",
      pull_requests: [
        { lifecycle: "merged", terminal_evidence: { recorded_at: "2026-09-01T06:01:00Z" } },
      ],
    });
  });

  it("U-OBPRGH-006: providerのraw error／response bodyをstable digest材料へ入れない", () => {
    const first = loadGithubOpenBranchPlanReservationMaterial({
      repository: "RetryYN/HELIX-HARNESS",
      api() {
        throw new Error("Command failed: gh api repos/secret-a\nprovider response A");
      },
    });
    const second = loadGithubOpenBranchPlanReservationMaterial({
      repository: "RetryYN/HELIX-HARNESS",
      api() {
        throw new Error("Command failed: gh api repos/secret-b\nprovider response B");
      },
    });
    expect(first.current_main).toEqual(second.current_main);
    expect(first.open_pr_heads).toEqual(second.open_pr_heads);
  });

  it("U-OBPRGH-007: effect providerとprojection adapterは共有schemaだけを介して接続する", () => {
    const provider = readFileSync(
      "src/adapters/github-open-branch-plan-reservation-provider.ts",
      "utf8",
    );
    const projection = readFileSync(
      "src/adapters/open-branch-plan-reservation-authority.ts",
      "utf8",
    );
    expect(provider).toContain('from "../schema/open-branch-plan-reservation-authority"');
    expect(provider).not.toContain('from "./open-branch-plan-reservation-authority"');
    expect(projection).toContain('from "../schema/open-branch-plan-reservation-authority"');
  });
});

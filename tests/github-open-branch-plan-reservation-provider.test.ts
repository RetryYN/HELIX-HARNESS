import { describe, expect, it } from "vitest";
import { loadGithubOpenBranchPlanReservationMaterial } from "../src/adapters/github-open-branch-plan-reservation-provider";

// PLAN-L7-723-github-open-branch-plan-reservation-provider

const MAIN = "a".repeat(40);
const PR_HEAD = "b".repeat(40);
const PLAN_BLOB = "c".repeat(40);
const PLAN_PATH = "docs/plans/PLAN-L7-723-github-open-branch-plan-reservation-provider.md";
const PLAN_SOURCE = `---
plan_id: PLAN-L7-723-github-open-branch-plan-reservation-provider
github_issue_id: 1256
responsibility_owner: github-open-branch-plan-reservation-provider
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
      { truncated: false, tree: [{ path: PLAN_PATH, type: "blob", sha: PLAN_BLOB }] },
    ],
    [
      `repos/RetryYN/HELIX-HARNESS/git/trees/${PR_HEAD}?recursive=1`,
      { truncated: false, tree: [{ path: PLAN_PATH, type: "blob", sha: PLAN_BLOB }] },
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
  for (const [key, value] of Object.entries(overrides)) pages.set(key, value);
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
});

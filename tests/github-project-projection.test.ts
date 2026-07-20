import { describe, expect, it } from "vitest";
import {
  analyzeGithubProjectProjection,
  runGithubProjectProjection,
  type GithubProjectSnapshot,
} from "../src/audit/github-project-projection";

function snapshot(): GithubProjectSnapshot {
  return {
    projectId: "PVT_project",
    statusField: {
      id: "status-field",
      name: "Status",
      options: [
        { id: "todo", name: "Todo" },
        { id: "progress", name: "In Progress" },
        { id: "done", name: "Done" },
      ],
    },
    contents: [
      { number: 1, type: "Issue", title: "one", url: "https://example.test/issues/1" },
      { number: 2, type: "Issue", title: "two", url: "https://example.test/issues/2", linkedOpenPullRequests: [3] },
      { number: 3, type: "PullRequest", title: "three", url: "https://example.test/pull/3" },
    ],
    items: [
      { number: 2, type: "Issue", title: "two", url: "https://example.test/issues/2", itemId: "item-2", status: "Todo" },
      { number: 3, type: "PullRequest", title: "three", url: "https://example.test/pull/3", itemId: "item-3", status: "In Progress" },
      { number: 9, type: "Issue", title: "old", url: "https://example.test/issues/9", itemId: "item-9", status: "Done" },
    ],
  };
}

describe("PLAN-L7-463-github-project-projection behavior", () => {
  it("U-GPROJ-001: plans deterministic additions and status corrections without deleting stale items", () => {
    const result = analyzeGithubProjectProjection(snapshot());
    expect(result).toMatchObject({ ok: false, dryRun: true, applied: false });
    expect(result.mutations).toEqual([
      { kind: "add", url: "https://example.test/issues/1", status: "Todo" },
      { kind: "set_status", url: "https://example.test/issues/2", itemId: "item-2", status: "In Progress" },
    ]);
    expect(result.findings).toContainEqual(expect.objectContaining({ code: "unexpected_item", severity: "warning" }));
  });

  it("U-GPROJ-002: applies fixed mutations and requires a clean read-back", () => {
    const current = snapshot();
    const calls: string[] = [];
    const result = runGithubProjectProjection(
      {
        load: () => current,
        add: (url) => {
          calls.push(`add:${url}`);
          current.items.push({ ...current.contents[0], itemId: "item-1", status: null });
          return "item-1";
        },
        setStatus: (itemId, fieldId, optionId) => {
          calls.push(`status:${itemId}:${fieldId}:${optionId}`);
          const item = current.items.find((candidate) => candidate.itemId === itemId);
          if (item) item.status = optionId === "todo" ? "Todo" : "In Progress";
        },
      },
      { apply: true },
    );
    expect(result).toMatchObject({ ok: true, dryRun: false, applied: true });
    expect(calls).toEqual([
      "add:https://example.test/issues/1",
      "status:item-1:status-field:todo",
      "status:item-2:status-field:progress",
    ]);
  });

  it("U-GPROJ-003: fails closed when applied state cannot be read back", () => {
    const current = snapshot();
    const result = runGithubProjectProjection(
      { load: () => current, add: () => "missing", setStatus: () => undefined },
      { apply: true },
    );
    expect(result.ok).toBe(false);
    expect(result.findings.some((finding) => finding.code === "readback_mismatch")).toBe(true);
  });
});

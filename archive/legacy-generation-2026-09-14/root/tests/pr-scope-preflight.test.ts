import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { analyzePrContext } from "../src/lint/github-guards";
import { OUTSTANDING_SNAPSHOT_PATH } from "../src/lint/outstanding-snapshot";
import {
  collectAllowedAwareSuggestion,
  observeOutstandingSnapshotImpact,
  runPrScopePreflight,
} from "../src/lint/pr-scope-preflight";

// PLAN-RECOVERY-1690-pr-scope-preflight

const SCOPE_BODY = [
  "Behavior contract: PR-SCOPE-PREFLIGHT-001",
  "Responsibility owner: pr-scope-preflight",
  "Allowed path families: docs/plans/PLAN-RECOVERY-1690-pr-scope-preflight.md, src/lint/pr-scope-preflight.ts, tests/pr-scope-preflight.test.ts",
  "Expected changed paths: docs/plans/PLAN-RECOVERY-1690-pr-scope-preflight.md, src/lint/pr-scope-preflight.ts",
  "Required companion paths: docs/plans/PLAN-RECOVERY-1690-pr-scope-preflight.md, tests/pr-scope-preflight.test.ts",
  "Scope expansion: none",
].join("\n");

describe("PLAN-RECOVERY-1690 PR scope preflight", () => {
  it("U-PRSCOPE-PRE-001: undeclared/absent を CI と同じ analyzePrContext finding で返す", () => {
    const changedPaths = [
      "docs/plans/PLAN-RECOVERY-1690-pr-scope-preflight.md",
      "src/lint/pr-scope-preflight.ts",
      "tests/pr-scope-preflight.test.ts",
    ];
    const context = analyzePrContext({
      eventName: "pull_request",
      headBranch: "recovery/1690-pr-scope-preflight",
      baseBranch: "origin/main",
      body: SCOPE_BODY,
      changedPaths,
    });
    const preflight = runPrScopePreflight({
      body: SCOPE_BODY,
      changedPaths,
      headBranch: "recovery/1690-pr-scope-preflight",
      baseBranch: "origin/main",
    });

    expect(preflight.eventName).toBe("pull_request");
    expect(preflight.findings).toEqual(context.findings);
    expect(preflight.ok).toBe(context.ok);
    expect(preflight.findings).toContainEqual(
      expect.objectContaining({ code: "pr_scope_changed_paths_mismatch" }),
    );
    expect(preflight.undeclared).toEqual(["tests/pr-scope-preflight.test.ts"]);
    expect(preflight.absent).toEqual([]);
  });

  it("U-PRSCOPE-PRE-002: required companion 欠落も同じ typed finding を返す", () => {
    const changedPaths = ["src/lint/pr-scope-preflight.ts"];
    const declaredMissing = analyzePrContext({
      eventName: "pull_request",
      body: SCOPE_BODY,
      changedPaths,
    });
    const declaredPreflight = runPrScopePreflight({
      body: SCOPE_BODY,
      changedPaths,
    });
    expect(declaredPreflight.findings).toEqual(declaredMissing.findings);
    expect(declaredPreflight.findings.map((finding) => finding.code)).toEqual(
      expect.arrayContaining(["pr_scope_changed_paths_mismatch", "pr_scope_companion_missing"]),
    );

    const noneBody = [
      "Behavior contract: PR-SCOPE-PREFLIGHT-001",
      "Responsibility owner: pr-scope-preflight",
      "Allowed path families: src/lint/pr-scope-preflight.ts",
      "Expected changed paths: src/lint/pr-scope-preflight.ts",
      "Required companion paths: none",
      "Scope expansion: none",
    ].join("\n");
    const sourceMissing = analyzePrContext({
      eventName: "pull_request",
      body: noneBody,
      changedPaths,
    });
    const sourcePreflight = runPrScopePreflight({ body: noneBody, changedPaths });
    expect(sourcePreflight.findings).toEqual(sourceMissing.findings);
    expect(sourcePreflight.findings.map((finding) => finding.code)).toContain(
      "pr_scope_source_companions_missing",
    );
    expect(sourcePreflight.companionMissing.length).toBeGreaterThan(0);
  });

  it("U-PRSCOPE-PRE-003: Allowed外は permission required とし suggested Expected へ自動追加しない", () => {
    const body = [
      "Behavior contract: PR-SCOPE-PREFLIGHT-001",
      "Responsibility owner: pr-scope-preflight",
      "Allowed path families: src/lint/pr-scope-preflight.ts",
      "Expected changed paths: src/lint/pr-scope-preflight.ts",
      "Required companion paths: none",
      "Scope expansion: none",
    ].join("\n");
    const changedPaths = [
      "src/lint/pr-scope-preflight.ts",
      "docs/governance/generated/outstanding-snapshot.json",
    ];
    const context = analyzePrContext({
      eventName: "pull_request",
      body,
      changedPaths,
    });
    const preflight = runPrScopePreflight({ body, changedPaths });
    const suggestion = collectAllowedAwareSuggestion(body, changedPaths);

    expect(preflight.findings).toEqual(context.findings);
    expect(preflight.outsideAllowed).toEqual([
      "docs/governance/generated/outstanding-snapshot.json",
    ]);
    expect(preflight.permissionRequiredPaths).toEqual([
      "docs/governance/generated/outstanding-snapshot.json",
    ]);
    expect(preflight.suggestedExpectedChangedPaths).toEqual(["src/lint/pr-scope-preflight.ts"]);
    expect(preflight.suggestedExpectedChangedPaths).not.toContain(
      "docs/governance/generated/outstanding-snapshot.json",
    );
    expect(suggestion.suggestedExpectedChangedPaths).not.toEqual(changedPaths);
    expect(context.findings).toContainEqual(
      expect.objectContaining({ code: "pr_scope_path_outside_manifest" }),
    );
  });

  it("U-PRSCOPE-PRE-004: confirmed 昇格で snapshot が net-zero なら宣言から外せと報告する", () => {
    const snapshot = '{"schema_version":"outstanding-snapshot.v1","decision_count":1}\n';
    const impact = observeOutstandingSnapshotImpact({
      changedPaths: [
        "docs/plans/PLAN-RECOVERY-1690-pr-scope-preflight.md",
        OUTSTANDING_SNAPSHOT_PATH,
      ],
      planStatusChanges: [
        {
          path: "docs/plans/PLAN-RECOVERY-1690-pr-scope-preflight.md",
          fromStatus: "draft",
          toStatus: "confirmed",
        },
      ],
      baseSnapshotText: snapshot,
      headSnapshotText: snapshot,
      liveSnapshotText: snapshot,
    });

    expect(impact.baseEqualsLive).toBe(true);
    expect(impact.inDiff).toBe(true);
    expect(impact.guidance).toContain("net-zero");
    expect(impact.guidance).toContain("宣言から外せ");
  });

  it("U-PRSCOPE-PRE-005: draft PLAN 追加で snapshot が現れるなら宣言を求め、Allowed外へは自動追加しない", () => {
    const base = '{"schema_version":"outstanding-snapshot.v1","decision_count":1}\n';
    const live = '{"schema_version":"outstanding-snapshot.v1","decision_count":2}\n';
    const impact = observeOutstandingSnapshotImpact({
      changedPaths: ["docs/plans/PLAN-RECOVERY-1690-pr-scope-preflight.md"],
      planStatusChanges: [
        {
          path: "docs/plans/PLAN-RECOVERY-1690-pr-scope-preflight.md",
          fromStatus: null,
          toStatus: "draft",
        },
      ],
      baseSnapshotText: base,
      headSnapshotText: base,
      liveSnapshotText: live,
    });

    expect(impact.baseEqualsLive).toBe(false);
    expect(impact.inDiff).toBe(false);
    expect(impact.guidance).toContain("draft PLAN");
    expect(impact.guidance).toContain("自動追加はしない");
  });

  it("U-PRSCOPE-PRE-006: analyzePrContext を使わない別判定へ退行すると同一 finding 契約が壊れる", () => {
    const changedPaths = ["docs/design/current.md", "docs/secret.md"];
    const body = [
      "Behavior contract: GH-AC-040",
      "Responsibility owner: pr-scope-guard",
      "Allowed path families: docs/design/",
      "Expected changed paths: docs/design/current.md",
      "Required companion paths: none",
      "Scope expansion: none",
    ].join("\n");
    const preflight = runPrScopePreflight({ body, changedPaths });
    const mutated = {
      ...preflight,
      findings: [],
      suggestedExpectedChangedPaths: [...changedPaths].sort(),
    };

    expect(preflight.findings).toEqual(
      analyzePrContext({
        eventName: "pull_request",
        body,
        changedPaths,
      }).findings,
    );
    expect(mutated.findings).not.toEqual(preflight.findings);
    expect(mutated.suggestedExpectedChangedPaths).toContain("docs/secret.md");
    expect(preflight.suggestedExpectedChangedPaths).not.toContain("docs/secret.md");
    expect(preflight.permissionRequiredPaths).toEqual(["docs/secret.md"]);
  });

  it("U-PRSCOPE-PRE-008: git 入力でも eventName=pull_request で同一関数を呼ぶ", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-pr-scope-preflight-"));
    const init = spawnSync("git", ["init", "-q"], { cwd: root, encoding: "utf8" });
    expect(init.status).toBe(0);
    mkdirSync(join(root, "docs/plans"), { recursive: true });
    writeFileSync(join(root, "docs/plans/PLAN-DEMO.md"), "---\nstatus: draft\n---\n");
    spawnSync("git", ["-C", root, "add", "docs/plans/PLAN-DEMO.md"], { encoding: "utf8" });
    spawnSync(
      "git",
      [
        "-C",
        root,
        "-c",
        "user.email=test@example.invalid",
        "-c",
        "user.name=test",
        "commit",
        "-qm",
        "base",
      ],
      { encoding: "utf8" },
    );
    const preflight = runPrScopePreflight({
      body: [
        "Behavior contract: PR-SCOPE-PREFLIGHT-001",
        "Responsibility owner: pr-scope-preflight",
        "Allowed path families: docs/plans/PLAN-DEMO.md",
        "Expected changed paths: docs/plans/PLAN-DEMO.md",
        "Required companion paths: none",
        "Scope expansion: none",
      ].join("\n"),
      changedPaths: ["docs/plans/PLAN-DEMO.md"],
      headBranch: "HEAD",
      baseBranch: "HEAD",
    });
    expect(preflight.ok).toBe(true);
    expect(preflight.eventName).toBe("pull_request");
    expect(preflight.findings).toEqual([]);
  });
});

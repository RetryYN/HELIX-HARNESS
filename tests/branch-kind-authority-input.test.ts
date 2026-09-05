import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { afterEach, describe, expect, it } from "vitest";
import { analyzeBranchKind, loadBranchKindInput } from "../src/lint/branch-kind";

// PLAN-RECOVERY-935-branch-authority-input
const roots: string[] = [];
function git(root: string, ...args: string[]): string {
  return execFileSync(
    "git",
    [
      "-c",
      "user.name=Fixture",
      "-c",
      "user.email=fixture@example.invalid",
      "-c",
      "commit.gpgsign=false",
      ...args,
    ],
    { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
  ).trim();
}
afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

function fixture() {
  const root = mkdtempSync(join(tmpdir(), "helix-branch-authority-"));
  roots.push(root);
  git(root, "init", "--initial-branch=main");
  git(root, "commit", "--allow-empty", "-m", "chore: fixture base");
  const baseHead = git(root, "rev-parse", "HEAD");
  const branch = "feature/935-fixture";
  git(root, "switch", "-c", branch);
  const path = "docs/plans/PLAN-L7-1-fixture.md";
  mkdirSync(dirname(join(root, path)), { recursive: true });
  writeFileSync(
    join(root, path),
    "---\nplan_id: PLAN-L7-1-fixture\nkind: impl\ngithub_issue_id: 935\n---\n",
  );
  git(root, "add", "--", path);
  git(root, "commit", "-m", "test: committed plan fixture");
  return {
    root,
    path,
    snapshot: {
      baseHead,
      candidateHead: git(root, "rev-parse", "HEAD"),
      branch,
      includeWorkingTree: false,
    },
  };
}

describe("branch入力authorityの実Git検証", () => {
  it("U-BRAUTH-004: 非Git consumerの明示対象外と通常の取得不能を区別する", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-branch-nongit-"));
    roots.push(root);
    expect(analyzeBranchKind(loadBranchKindInput(root)).ok).toBe(false);
    const outside = loadBranchKindInput(root, { applicability: "non_git_consumer" });
    expect(outside.authority?.status).toBe("not_applicable");
    expect(analyzeBranchKind(outside)).toMatchObject({
      ok: true,
      findings: [{ code: "branch_not_applicable", severity: "warn" }],
    });
    const real = fixture();
    expect(
      analyzeBranchKind(loadBranchKindInput(real.root, { applicability: "non_git_consumer" })).ok,
    ).toBe(false);
    expect(
      analyzeBranchKind(
        loadBranchKindInput(join(root, "missing"), { applicability: "non_git_consumer" }),
      ).ok,
    ).toBe(false);
    mkdirSync(join(root, ".git"));
    const child = join(root, "nested");
    mkdirSync(child);
    for (const target of [root, child]) {
      expect(
        loadBranchKindInput(target, { applicability: "non_git_consumer" }).authority?.status,
      ).toBe("unavailable");
    }
  });
  it("U-BRAUTH-008: 実CLIとdoctor入口で同じsnapshotを検査し差分の偽装を拒否する", async () => {
    const { root, snapshot } = fixture();
    const cli = fileURLToPath(new URL("../src/cli.ts", import.meta.url));
    const tsx = fileURLToPath(new URL("../node_modules/tsx/dist/cli.mjs", import.meta.url));
    const args = [
      tsx,
      cli,
      "guard",
      "branch-kind",
      "--base-head",
      snapshot.baseHead,
      "--candidate-head",
      snapshot.candidateHead,
      "--branch",
      snapshot.branch,
      "--json",
    ];
    const invoke = (extra: string[] = []) =>
      spawnSync(process.execPath, [...args, ...extra], {
        cwd: root,
        encoding: "utf8",
        timeout: 30_000,
      });
    const current = invoke();
    expect(current.error).toBeUndefined();
    expect(current.status, current.stderr).toBe(0);
    const result = JSON.parse(current.stdout);
    expect(result).toEqual(analyzeBranchKind(loadBranchKindInput(root, snapshot)));
    const { checkBranchKind } = await import("../src/doctor/index");
    expect(checkBranchKind(root, snapshot)).toEqual({
      ok: result.ok,
      messages: [`branch-kind-check - OK (branch=${snapshot.branch}, kind=feature, warnings=0)`],
    });
    const wrong = invoke(["--changed", "src/not-in-snapshot.ts"]);
    expect(wrong.error).toBeUndefined();
    expect(wrong.status, wrong.stderr).toBe(1);
    expect(JSON.parse(wrong.stdout).findings).toEqual([
      expect.objectContaining({
        code: "branch_authority_unavailable",
        message: "changed_paths_snapshot_mismatch",
      }),
    ]);
    const missing = { ...snapshot, baseHead: "f".repeat(40) };
    expect(checkBranchKind(root, missing).ok).toBe(false);
  });
  it("U-BRAUTH-007: supersession比較を同じbaseに固定し作業treeからの混入を拒否する", () => {
    const { root, path, snapshot } = fixture();
    const baseHead = snapshot.candidateHead;
    const source =
      "---\nplan_id: PLAN-L7-1-fixture\nkind: impl\ngithub_issue_id: 935\nsuperseded_by: [PLAN-L7-2-fixture]\n---\n";
    writeFileSync(join(root, path), source);
    git(root, "add", "--", path);
    git(root, "commit", "-m", "test: supersession only");
    const candidateHead = git(root, "rev-parse", "HEAD");
    writeFileSync(join(root, path), `${source}changed behavior\n`);
    const fixed = { ...snapshot, baseHead, candidateHead };
    const committed = loadBranchKindInput(root, fixed);
    expect(committed.authority?.status).toBe("available");
    expect(committed.plans[0]?.supersession_metadata_only).toBe(true);
    const working = loadBranchKindInput(root, { ...fixed, includeWorkingTree: true });
    expect(working.authority?.status).toBe("available");
    expect(working.plans[0]?.supersession_metadata_only).toBe(false);
  });
  it("U-BRAUTH-005: 作業treeの実branchと異なる申告identityを拒否する", () => {
    const { root, snapshot } = fixture();
    const input = loadBranchKindInput(root, {
      ...snapshot,
      branch: "docs/935-spoof",
      includeWorkingTree: true,
    });
    expect(input.authority?.status).toBe("unavailable");
    expect(analyzeBranchKind(input).ok).toBe(false);
    git(root, "switch", "--detach", snapshot.candidateHead);
    expect(loadBranchKindInput(root, snapshot).authority?.status).toBe("available");
    expect(loadBranchKindInput(root, { ...snapshot, branch: "HEAD" }).authority?.status).toBe(
      "unavailable",
    );
    const shallow = mkdtempSync(join(tmpdir(), "helix-branch-shallow-"));
    roots.push(shallow);
    git(
      shallow,
      "clone",
      "--depth=1",
      "--no-local",
      "--branch",
      snapshot.branch,
      pathToFileURL(root).href,
      ".",
    );
    expect(git(shallow, "rev-parse", "--is-shallow-repository")).toBe("true");
    expect(loadBranchKindInput(shallow, snapshot).authority?.status).toBe("unavailable");
    git(shallow, "fetch", "--unshallow", "origin");
    expect(loadBranchKindInput(shallow, snapshot).authority?.status).toBe("available");
    git(shallow, "remote", "remove", "origin");
    expect(loadBranchKindInput(shallow, snapshot).authority?.status).toBe("available");
  });

  it("U-BRAUTH-002: staged／unstaged／untrackedとcommit済み差分を重複なく統合する", () => {
    const { root, path, snapshot } = fixture();
    writeFileSync(join(root, "staged.txt"), "staged");
    git(root, "add", "--", "staged.txt");
    writeFileSync(join(root, path), "---\nkind: impl\ngithub_issue_id: 935\n---\nchanged\n");
    writeFileSync(join(root, "untracked.txt"), "untracked");
    const input = loadBranchKindInput(root, { ...snapshot, includeWorkingTree: true });
    expect(input.authority?.status).toBe("available");
    expect(input.changedPaths).toEqual([path, "staged.txt", "untracked.txt"]);
    expect(input.plans).toHaveLength(1);
    expect(analyzeBranchKind(input).ok).toBe(true);
    rmSync(join(root, "staged.txt"));
    const cancelled = loadBranchKindInput(root, { ...snapshot, includeWorkingTree: true });
    expect(cancelled.authority?.status).toBe("available");
    expect(cancelled.changedPaths).toEqual(input.changedPaths);
  });

  it("U-BRAUTH-003: 明示baseが存在しなければ別baseへfallbackしない", () => {
    const { root, snapshot } = fixture();
    const unspecified = loadBranchKindInput(root);
    expect(unspecified.authority?.status).toBe("unavailable");
    expect(analyzeBranchKind(unspecified).ok).toBe(false);
    git(root, "update-ref", "refs/remotes/origin/main", snapshot.baseHead);
    const input = loadBranchKindInput(root, { ...snapshot, baseHead: "f".repeat(40) });
    expect(input.authority?.status).toBe("unavailable");
    expect(analyzeBranchKind(input).findings).toEqual([
      expect.objectContaining({ code: "branch_authority_unavailable" }),
    ]);
  });

  it("U-BRAUTH-003: 実criss-cross履歴の複数merge-baseから一つを勝手に選ばない", () => {
    const { root, snapshot } = fixture();
    const tree = git(root, "rev-parse", "HEAD^{tree}");
    const commit = (parents: string[], message: string) =>
      git(root, "commit-tree", tree, ...parents.flatMap((parent) => ["-p", parent]), "-m", message);
    const a = commit([snapshot.candidateHead], "test: sibling a");
    const b = commit([snapshot.candidateHead], "test: sibling b");
    const baseHead = commit([a, b], "test: left merge");
    const candidateHead = commit([b, a], "test: right merge");
    git(root, "update-ref", `refs/heads/${snapshot.branch}`, candidateHead);
    expect(git(root, "merge-base", "--all", baseHead, candidateHead).split("\n").sort()).toEqual(
      [a, b].sort(),
    );
    // 正例も同じfixtureで検査し、常時拒否では反例を満たせないようにする。
    expect(
      loadBranchKindInput(root, { ...snapshot, baseHead: a, candidateHead }).authority?.status,
    ).toBe("available");
    const input = loadBranchKindInput(root, { ...snapshot, baseHead, candidateHead });
    expect(input.authority?.status).toBe("unavailable");
    expect(analyzeBranchKind(input).ok).toBe(false);
  });

  it("U-BRAUTH-006: 作業treeで削除されたPLANを取得障害と混同せずPLAN必須判定へ渡す", () => {
    const { root, path, snapshot } = fixture();
    rmSync(join(root, path));
    const input = loadBranchKindInput(root, { ...snapshot, includeWorkingTree: true });
    expect(input.authority?.status).toBe("available");
    expect(input.changedPaths).toEqual([path]);
    expect(input.plans).toEqual([]);
    expect(analyzeBranchKind(input).findings).toEqual([
      expect.objectContaining({ code: "missing_plan" }),
    ]);
    const stagedPath = "docs/plans/PLAN-L7-2-staged-deleted.md";
    writeFileSync(
      join(root, stagedPath),
      "---\nplan_id: PLAN-L7-2-staged-deleted\nkind: impl\n---\n",
    );
    git(root, "add", "--", stagedPath);
    rmSync(join(root, stagedPath));
    const stagedDeleted = loadBranchKindInput(root, { ...snapshot, includeWorkingTree: true });
    expect(stagedDeleted.authority?.status).toBe("available");
    expect(stagedDeleted.changedPaths).toEqual([path, stagedPath].sort());
    expect(stagedDeleted.plans).toEqual([]);
    expect(analyzeBranchKind(stagedDeleted).findings).toEqual([
      expect.objectContaining({ code: "missing_plan" }),
    ]);
    const renamed = fixture();
    const destination = "docs/plans/PLAN-L7-1-日本語 space.md";
    git(renamed.root, "mv", "--", renamed.path, destination);
    git(renamed.root, "commit", "-m", "test: rename unicode plan");
    const renamedInput = loadBranchKindInput(renamed.root, {
      ...renamed.snapshot,
      baseHead: renamed.snapshot.candidateHead,
      candidateHead: git(renamed.root, "rev-parse", "HEAD"),
    });
    expect(renamedInput.authority?.status).toBe("available");
    expect(renamedInput.changedPaths).toEqual([renamed.path, destination].sort());
    expect(renamedInput.plans.map((plan) => plan.file)).toEqual([destination]);
    expect(analyzeBranchKind(renamedInput).ok).toBe(true);
  });
  it("U-BRAUTH-001: cleanなcommit済みbranchのPLANを明示snapshotから認識する", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-branch-authority-"));
    roots.push(root);
    git(root, "init", "--initial-branch=main");
    git(root, "commit", "--allow-empty", "-m", "chore: fixture base");
    const baseHead = git(root, "rev-parse", "HEAD");
    const branch = "feature/935-fixture";
    git(root, "switch", "-c", branch);
    const path = "docs/plans/PLAN-L7-1-fixture.md";
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(
      join(root, path),
      "---\nplan_id: PLAN-L7-1-fixture\nkind: impl\ngithub_issue_id: 935\n---\n",
    );
    git(root, "add", "--", path);
    git(root, "commit", "-m", "test: committed plan fixture");
    const candidateHead = git(root, "rev-parse", "HEAD");
    expect(git(root, "status", "--porcelain")).toBe("");
    expect(git(root, "diff", "--name-only", `${baseHead}...${candidateHead}`)).toBe(path);

    const input = loadBranchKindInput(root, {
      baseHead,
      candidateHead,
      branch,
      includeWorkingTree: false,
    });
    expect(input.changedPaths).toEqual([path]);
    expect(input.plans).toEqual([
      expect.objectContaining({ file: path, kind: "impl", github_issue_id: 935 }),
    ]);
    expect(analyzeBranchKind(input).ok).toBe(true);
  });
});

import childProcess, { execFileSync, spawnSync } from "node:child_process";
import {
  chmodSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { syncBuiltinESMExports } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  analyzeBranchKind,
  branchKindMessages,
  branchSnapshotFromPrContext,
  inspectBranchSnapshotFromPrProvider,
  loadBranchKindInput,
  readBranchSnapshotFromPrProvider,
} from "../src/lint/branch-kind";

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
  it("U-BRAUTH-013: 実CLIは一意PRだけを取得し不完全な明示入力ではproviderを呼ばない", () => {
    const { root, snapshot } = fixture();
    git(root, "remote", "add", "origin", "https://github.com/fixture/project.git");
    const bin = mkdtempSync(join(tmpdir(), "helix-pr-provider-"));
    roots.push(bin);
    const capture = join(bin, "arguments.json");
    const executable = join(bin, "gh");
    writeFileSync(
      executable,
      `#!/usr/bin/env node\nrequire('node:fs').writeFileSync(process.env.FIXTURE_CAPTURE, JSON.stringify(process.argv.slice(2)));\nprocess.stdout.write(process.env.FIXTURE_RESPONSE);\n`,
    );
    chmodSync(executable, 0o700);
    const raw = {
      state: "open",
      base: { sha: snapshot.baseHead, repo: { full_name: "fixture/project" } },
      head: {
        sha: snapshot.candidateHead,
        ref: snapshot.branch,
        repo: { full_name: "fixture/project" },
      },
    };
    const cli = fileURLToPath(new URL("../src/cli.ts", import.meta.url));
    const tsx = fileURLToPath(new URL("../node_modules/tsx/dist/cli.mjs", import.meta.url));
    const invoke = (response: string, extra: string[] = [], command = ["guard", "branch-kind"]) =>
      spawnSync(process.execPath, [tsx, cli, ...command, "--json", ...extra], {
        cwd: root,
        encoding: "utf8",
        timeout: 30_000,
        env: {
          ...process.env,
          PATH: `${bin}:${process.env.PATH}`,
          GH_REPO: "other/project",
          GH_HOST: "other.invalid",
          FIXTURE_CAPTURE: capture,
          FIXTURE_RESPONSE: response,
        },
      });
    const partial = invoke(JSON.stringify([raw]), ["--branch", snapshot.branch]);
    expect(partial.status, partial.stderr).toBe(1);
    expect(existsSync(capture)).toBe(false);
    const valid = invoke(JSON.stringify([raw]));
    expect(valid.status, valid.stderr).toBe(0);
    expect(JSON.parse(valid.stdout).ok).toBe(true);
    expect(JSON.parse(readFileSync(capture, "utf8"))).toEqual([
      "api",
      "--hostname",
      "github.com",
      "--method",
      "GET",
      `repos/fixture/project/pulls?state=open&head=${encodeURIComponent(`fixture:${snapshot.branch}`)}&per_page=2`,
    ]);
    for (const response of [
      "[]",
      JSON.stringify([raw, raw]),
      "invalid-json",
      JSON.stringify([{ ...raw, state: "closed" }]),
    ]) {
      const rejected = invoke(response);
      expect(rejected.status, rejected.stderr).toBe(1);
      expect(JSON.parse(rejected.stdout).ok).toBe(false);
    }
    const forged = invoke(JSON.stringify([raw]), ["--changed", "src/forged.ts"]);
    expect(forged.status, forged.stderr).toBe(1);
    expect(JSON.parse(forged.stdout).findings[0].message).toBe("changed_paths_snapshot_mismatch");
    writeFileSync(capture, "provider-not-called");
    const explicit = invoke("invalid-json", [
      "--base-head",
      snapshot.baseHead,
      "--candidate-head",
      snapshot.candidateHead,
      "--branch",
      snapshot.branch,
      "--include-working-tree",
    ]);
    expect(explicit.status, explicit.stderr).toBe(0);
    expect(JSON.parse(explicit.stdout).ok).toBe(true);
    expect(readFileSync(capture, "utf8")).toBe("provider-not-called");
    const toolchain = invoke(JSON.stringify([raw]), ["--scope", "toolchain"], ["doctor"]);
    expect(toolchain.error).toBeUndefined();
    expect(JSON.parse(toolchain.stdout).messages).toBeInstanceOf(Array);
    expect(readFileSync(capture, "utf8")).toBe("provider-not-called");
    for (const command of [["doctor"], ["review", "--uncommitted"], ["review", "--staged"]]) {
      const checked = invoke(JSON.stringify([raw]), [], command);
      expect(checked.error).toBeUndefined();
      const output = JSON.parse(checked.stdout);
      const messages: string[] = output.doctorMessages ?? output.messages;
      // 最小fixtureは他のdoctor義務を満たさない。branch入力の接合だけを検収する。
      expect(
        messages.some((message) => message.includes("branch-kind-check - OK")),
        JSON.stringify({
          command,
          messages: messages.filter((message) => message.includes("branch-kind")),
        }),
      ).toBe(true);
      expect(messages.some((message) => message.includes("branch_snapshot_incomplete"))).toBe(
        false,
      );
    }
  });
  it("U-BRAUTH-012: PR応答はlocal repository／branch／HEADとの一致を必要とする", () => {
    const { root, snapshot } = fixture();
    const local = {
      repository: "fixture/project",
      head: snapshot.candidateHead,
      branch: snapshot.branch,
    };
    const raw = {
      state: "open",
      base: { sha: snapshot.baseHead, repo: { full_name: local.repository } },
      head: { sha: local.head, ref: local.branch, repo: { full_name: local.repository } },
    };
    expect(branchSnapshotFromPrContext(raw, local)).toEqual({
      ...snapshot,
      includeWorkingTree: true,
    });
    for (const invalid of [
      null,
      { ...raw, state: "closed" },
      { ...raw, base: { ...raw.base, sha: "invalid" } },
      { ...raw, head: { ...raw.head, sha: snapshot.baseHead } },
      { ...raw, head: { ...raw.head, ref: "docs/spoof" } },
      { ...raw, head: { ...raw.head, repo: { full_name: "other/project" } } },
      { ...raw, base: { ...raw.base, repo: { full_name: "other/project" } } },
    ])
      expect(branchSnapshotFromPrContext(invalid, local)).toBeNull();
    expect(branchSnapshotFromPrContext(raw, { ...local, branch: "HEAD" })).toBeNull();
    for (const invalid of [
      { ...local, branch: "HEAD" },
      { ...local, branch: "" },
      { ...local, repository: "invalid" },
      { ...local, head: "invalid" },
    ]) {
      const readPr = vi.fn(() => raw);
      expect(readBranchSnapshotFromPrProvider({ readLocal: () => invalid, readPr })).toBeNull();
      expect(readPr).not.toHaveBeenCalled();
    }
    expect(readBranchSnapshotFromPrProvider({ readLocal: () => local, readPr: () => raw })).toEqual(
      { ...snapshot, includeWorkingTree: true },
    );
    // providerが受け取った引数を書き換えても、取得前identityを上書きできない。
    expect(
      readBranchSnapshotFromPrProvider({
        readLocal: () => local,
        readPr: (input) => {
          input.head = snapshot.baseHead;
          return { ...raw, head: { ...raw.head, sha: snapshot.baseHead } };
        },
      }),
    ).toBeNull();
    expect(local.head).toBe(snapshot.candidateHead);
    expect(
      inspectBranchSnapshotFromPrProvider({ readLocal: () => local, readPr: () => raw }),
    ).toEqual({ status: "available", snapshot: { ...snapshot, includeWorkingTree: true } });
    expect(
      inspectBranchSnapshotFromPrProvider({
        readLocal: () => ({ ...local, branch: "HEAD" }),
        readPr: () => raw,
      }),
    ).toEqual({ status: "unavailable", reason: "pr_local_identity_invalid" });
    expect(
      inspectBranchSnapshotFromPrProvider({ readLocal: () => local, readPr: () => null }),
    ).toEqual({ status: "unavailable", reason: "pr_context_invalid" });
    expect(
      inspectBranchSnapshotFromPrProvider({
        readLocal: () => local,
        readPr: () => {
          throw new Error("synthetic private detail");
        },
      }),
    ).toEqual({ status: "unavailable", reason: "pr_provider_unavailable" });
    for (const changed of [
      { ...local, head: snapshot.baseHead },
      { ...local, branch: "docs/other" },
      { ...local, repository: "other/project" },
    ]) {
      let reads = 0;
      expect(
        readBranchSnapshotFromPrProvider({
          readLocal: () => (++reads === 1 ? local : changed),
          readPr: () => raw,
        }),
      ).toBeNull();
      reads = 0;
      expect(
        inspectBranchSnapshotFromPrProvider({
          readLocal: () => (++reads === 1 ? local : changed),
          readPr: () => raw,
        }),
      ).toEqual({ status: "unavailable", reason: "pr_local_identity_changed" });
    }
    expect(
      readBranchSnapshotFromPrProvider({
        readLocal: () => local,
        readPr: () => {
          throw new Error("synthetic unavailable");
        },
      }),
    ).toBeNull();
    const readLocal = () => ({
      repository: local.repository,
      head: git(root, "rev-parse", "HEAD"),
      branch: git(root, "rev-parse", "--abbrev-ref", "HEAD"),
    });
    const supplied = readBranchSnapshotFromPrProvider({ readLocal, readPr: () => raw });
    expect(supplied).not.toBeNull();
    if (supplied === null) throw new Error("valid PR fixture did not produce a snapshot");
    expect(analyzeBranchKind(loadBranchKindInput(root, supplied)).ok).toBe(true);
    expect(
      readBranchSnapshotFromPrProvider({
        readLocal,
        readPr: () => {
          git(root, "update-ref", `refs/heads/${snapshot.branch}`, snapshot.baseHead);
          return raw;
        },
      }),
    ).toBeNull();
    expect(git(root, "rev-parse", "HEAD")).toBe(snapshot.baseHead);
  });
  it("U-BRAUTH-011: Git読込中の実HEAD変更を拒否する", () => {
    const { root, snapshot } = fixture();
    expect(loadBranchKindInput(root, snapshot).authority?.status).toBe("available");
    const original = childProcess.execFileSync;
    let changed = false;
    const spy = vi
      .spyOn(childProcess, "execFileSync")
      .mockImplementation((...args: Parameters<typeof original>) => {
        const result = original(...args);
        const argv = args[1];
        if (
          !changed &&
          Array.isArray(argv) &&
          argv[0] === "-C" &&
          argv[1] === root &&
          argv[2] === "diff"
        ) {
          changed = true;
          original("git", [
            "-C",
            root,
            "update-ref",
            `refs/heads/${snapshot.branch}`,
            snapshot.baseHead,
          ]);
        }
        return result;
      });
    syncBuiltinESMExports();
    try {
      const input = loadBranchKindInput(root, snapshot);
      expect(changed).toBe(true);
      expect(input.authority).toEqual({
        status: "unavailable",
        reason: "head_changed_during_read",
      });
      expect(analyzeBranchKind(input).ok).toBe(false);
    } finally {
      spy.mockRestore();
      syncBuiltinESMExports();
    }
    expect(git(root, "rev-parse", "HEAD")).toBe(snapshot.baseHead);
  });
  it("外部例外のmessageを内部失敗コードとして信用しない（原因識別の補助反例）", () => {
    const { root, snapshot } = fixture();
    const spy = vi.spyOn(childProcess, "execFileSync").mockImplementation(() => {
      throw new Error("head_changed_during_read: synthetic-private-detail");
    });
    syncBuiltinESMExports();
    try {
      const input = loadBranchKindInput(root, snapshot);
      expect(input.authority).toEqual({
        status: "unavailable",
        reason: "branch_snapshot_read_failed",
      });
      expect(JSON.stringify(analyzeBranchKind(input))).not.toContain("synthetic-private-detail");
    } finally {
      spy.mockRestore();
      syncBuiltinESMExports();
    }
  });
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
    for (const partial of [
      ["--branch", snapshot.branch],
      ["--base-head", snapshot.baseHead],
      ["--include-working-tree"],
    ]) {
      const rejected = spawnSync(
        process.execPath,
        [tsx, cli, "guard", "branch-kind", ...partial, "--json"],
        { cwd: root, encoding: "utf8", timeout: 30_000 },
      );
      expect(rejected.status, rejected.stderr).toBe(1);
      expect(JSON.parse(rejected.stdout).findings).toEqual([
        expect.objectContaining({ message: "branch_snapshot_incomplete" }),
      ]);
    }
    expect(checkBranchKind(root, { ...snapshot, baseHead: "" }).messages.join("\n")).toContain(
      "branch_snapshot_incomplete",
    );
    const unavailable = analyzeBranchKind(loadBranchKindInput(root));
    expect(unavailable.ok).toBe(false);
    const guidance = branchKindMessages(unavailable).join("\n");
    expect(guidance).toContain(
      "--base-head <完全SHA> --candidate-head <完全SHA> --branch <branch名>",
    );
    expect(guidance).toContain("baseを推測して補わない");
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

  it("U-BRAUTH-010: 実criss-cross履歴の複数merge-baseから一つを勝手に選ばない", () => {
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
    expect(input.authority).toEqual({
      status: "unavailable",
      reason: "merge_base_ambiguous",
    });
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

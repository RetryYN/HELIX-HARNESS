import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { checkMemoryHandoverIsolation } from "../src/doctor/index";
import {
  analyzeMemoryHandoverIsolation,
  loadMemoryHandoverIsolationInput,
  type MemoryHandoverCommit,
  memoryHandoverIsolationMessages,
} from "../src/lint/memory-handover-isolation";

const NOW = 1_800_000_000;

function commit(overrides: Partial<MemoryHandoverCommit> = {}): MemoryHandoverCommit {
  return {
    hash: "a".repeat(40),
    subject: "chore(memory): 引き継ぎ",
    committedAtEpochSeconds: NOW - 48 * 3600,
    memoryPaths: [".helix/memory/harness.jsonl"],
    ...overrides,
  };
}

describe("memory-handover-isolation 純関数 (PLAN-L7-459 / MEMX-S6)", () => {
  it("[PLAN-L7-459/U-MEMX-006] 閾値超過の remote 未到達 memory コミットを violation にする", () => {
    const r = analyzeMemoryHandoverIsolation(
      { unreachedMemoryCommits: [commit()], noRemote: false },
      { nowEpochSeconds: NOW },
    );
    expect(r.ok).toBe(false);
    expect(r.isolated).toHaveLength(1);
    expect(r.stale).toHaveLength(0);
    const [message] = memoryHandoverIsolationMessages(r);
    expect(message).toContain("violation");
    expect(message).toContain("閾値超過 1 件");
    expect(message).toContain("aaaaaaaa:chore(memory): 引き継ぎ");
  });

  it("[PLAN-L7-459/U-MEMX-006] 閾値内の未 push コミットは ok のまま stale 件数を surface する", () => {
    const r = analyzeMemoryHandoverIsolation(
      {
        unreachedMemoryCommits: [commit({ committedAtEpochSeconds: NOW - 3600 })],
        noRemote: false,
      },
      { nowEpochSeconds: NOW },
    );
    expect(r.ok).toBe(true);
    expect(r.stale).toHaveLength(1);
    const [message] = memoryHandoverIsolationMessages(r);
    expect(message).toContain("OK");
    expect(message).toContain("閾値内の未 push memory コミット 1 件");
  });

  it("[PLAN-L7-459/U-MEMX-006] remote 到達済み (未到達 0 件) は無条件で OK", () => {
    const r = analyzeMemoryHandoverIsolation(
      { unreachedMemoryCommits: [], noRemote: false },
      { nowEpochSeconds: NOW },
    );
    expect(r.ok).toBe(true);
    expect(memoryHandoverIsolationMessages(r)).toEqual([
      "memory-handover-isolation - OK (remote 未到達の memory 引き継ぎコミット 0)",
    ]);
  });

  it("[PLAN-L7-459/U-MEMX-006] remote 未設定は fail-close の violation を返す", () => {
    const r = analyzeMemoryHandoverIsolation(
      { unreachedMemoryCommits: [], noRemote: true },
      { nowEpochSeconds: NOW },
    );
    expect(r.ok).toBe(false);
    expect(memoryHandoverIsolationMessages(r)[0]).toContain("remote が未設定");
  });

  it("[PLAN-L7-459/U-MEMX-006] 閾値は thresholdHours で調整でき境界は超過側だけ violation", () => {
    const boundary = commit({ committedAtEpochSeconds: NOW - 2 * 3600 });
    const within = analyzeMemoryHandoverIsolation(
      { unreachedMemoryCommits: [boundary], noRemote: false },
      { nowEpochSeconds: NOW, thresholdHours: 2 },
    );
    expect(within.ok).toBe(true);
    const beyond = analyzeMemoryHandoverIsolation(
      { unreachedMemoryCommits: [boundary], noRemote: false },
      { nowEpochSeconds: NOW, thresholdHours: 1 },
    );
    expect(beyond.ok).toBe(false);
  });

  it("[PLAN-L7-459/U-MEMX-006] git 履歴を検査できない場合は fail-close で violation を返す", () => {
    const r = checkMemoryHandoverIsolation("/nonexistent-repo-root-for-fail-close");
    expect(r.ok).toBe(false);
    expect(r.messages[0]).toContain("fail-close");
  });
});

describe("U-MEMX-006: loadMemoryHandoverIsolationInput 実 git fixture 統合", () => {
  const roots: string[] = [];
  afterAll(() => {
    for (const root of roots) rmSync(root, { recursive: true, force: true });
  });

  function git(cwd: string, ...args: string[]): string {
    return execFileSync("git", ["-C", cwd, ...args], {
      encoding: "utf8",
      env: {
        ...process.env,
        GIT_AUTHOR_NAME: "t",
        GIT_AUTHOR_EMAIL: "t@example.invalid",
        GIT_COMMITTER_NAME: "t",
        GIT_COMMITTER_EMAIL: "t@example.invalid",
      },
    }).trim();
  }

  function makeRepoPair(): { local: string; remote: string } {
    const root = mkdtempSync(join(tmpdir(), "memho-"));
    roots.push(root);
    const remote = join(root, "remote.git");
    const local = join(root, "local");
    execFileSync("git", ["init", "--bare", "-q", remote]);
    execFileSync("git", ["init", "-q", "-b", "main", local]);
    git(local, "remote", "add", "origin", remote);
    mkdirSync(join(local, ".helix/memory"), { recursive: true });
    writeFileSync(join(local, ".helix/memory/harness.jsonl"), "{}\n");
    git(local, "add", "-f", ".helix/memory/harness.jsonl");
    git(local, "commit", "-q", "-m", "base memory");
    git(local, "push", "-q", "origin", "main");
    return { local, remote };
  }

  function commitMemory(local: string, content: string, message: string): string {
    writeFileSync(join(local, ".helix/memory/harness.jsonl"), content);
    git(local, "add", "-f", ".helix/memory/harness.jsonl");
    git(local, "commit", "-q", "-m", message);
    return git(local, "rev-parse", "HEAD");
  }

  it("非 checkout branch 上の未 push memory コミットを検出し、push 済みは除外する", () => {
    const { local } = makeRepoPair();
    git(local, "checkout", "-q", "-b", "stranded");
    commitMemory(local, '{"k":1}\n', "chore(memory): stranded");
    git(local, "checkout", "-q", "main");
    const input = loadMemoryHandoverIsolationInput(local);
    expect(input.noRemote).toBe(false);
    expect(input.unreachedMemoryCommits).toHaveLength(1);
    expect(input.unreachedMemoryCommits[0]?.subject).toBe("chore(memory): stranded");
    git(local, "push", "-q", "origin", "stranded");
    expect(loadMemoryHandoverIsolationInput(local).unreachedMemoryCommits).toHaveLength(0);
  });

  it("rebase 済み patch-id 等価コミットは孤立扱いしない", () => {
    const { local } = makeRepoPair();
    git(local, "checkout", "-q", "-b", "work");
    commitMemory(local, '{"k":2}\n', "chore(memory): rebased content");
    // 同一 diff を main 側へ cherry-pick して push (= rebase 済み等価が remote に存在)
    git(local, "checkout", "-q", "main");
    git(local, "cherry-pick", "work");
    git(local, "push", "-q", "origin", "main");
    const input = loadMemoryHandoverIsolationInput(local);
    expect(input.unreachedMemoryCommits).toHaveLength(0);
  });

  it("detached HEAD 上の未 push memory コミットも検出する", () => {
    const { local } = makeRepoPair();
    const head = git(local, "rev-parse", "HEAD");
    git(local, "-c", "advice.detachedHead=false", "checkout", "-q", head);
    commitMemory(local, '{"k":3}\n', "chore(memory): detached");
    const input = loadMemoryHandoverIsolationInput(local);
    expect(input.unreachedMemoryCommits.map((c) => c.subject)).toContain("chore(memory): detached");
  });

  it("remote 未設定 repo は noRemote=true (fail-close 入力) を返す", () => {
    const root = mkdtempSync(join(tmpdir(), "memho-nr-"));
    roots.push(root);
    execFileSync("git", ["init", "-q", "-b", "main", root]);
    const input = loadMemoryHandoverIsolationInput(root);
    expect(input.noRemote).toBe(true);
  });
});

import { chmodSync, mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { execFileSync, spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";

// PLAN-RECOVERY-1633-ci-non-pr-base-authority

const SCRIPT = resolve("scripts/ci/resolve-branch-base.sh");

function git(root: string, ...args: string[]): string {
  return execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();
}

function fixture(): { root: string; base: string; head: string; bin: string } {
  const root = mkdtempSync(join(tmpdir(), "helix-ci-base-"));
  git(root, "init", "-b", "main");
  git(root, "config", "user.email", "ci@example.invalid");
  git(root, "config", "user.name", "HELIX CI");
  writeFileSync(join(root, "base.txt"), "base\n");
  git(root, "add", "base.txt");
  git(root, "commit", "-m", "chore: base");
  const base = git(root, "rev-parse", "HEAD");
  git(root, "branch", "feature/test");
  git(root, "checkout", "feature/test");
  writeFileSync(join(root, "plan.txt"), "plan\n");
  git(root, "add", "plan.txt");
  git(root, "commit", "-m", "docs: plan");
  writeFileSync(join(root, "runtime.txt"), "runtime\n");
  git(root, "add", "runtime.txt");
  git(root, "commit", "-m", "fix: runtime");
  const head = git(root, "rev-parse", "HEAD");
  git(root, "update-ref", "refs/remotes/origin/main", base);
  const bin = join(root, "bin");
  mkdirSync(bin);
  return { root, base, head, bin };
}

function writeGh(bin: string, source: string): void {
  const path = join(bin, "gh");
  writeFileSync(path, `#!/usr/bin/env bash\nset -euo pipefail\n${source}\n`);
  chmodSync(path, 0o755);
}

function run(
  f: ReturnType<typeof fixture>,
  overrides: Record<string, string> = {},
): ReturnType<typeof spawnSync> {
  return spawnSync("bash", [SCRIPT], {
    cwd: f.root,
    encoding: "utf8",
    env: {
      ...process.env,
      PATH: `${f.bin}:${process.env.PATH ?? ""}`,
      EVENT_NAME: "workflow_dispatch",
      BRANCH_CANDIDATE_HEAD: f.head,
      BRANCH_BASE_HEAD: "",
      GITHUB_REPOSITORY: "RetryYN/HELIX-HARNESS",
      ...overrides,
    },
  });
}

describe("non-PR branch base authority resolver", () => {
  it("U-CIBASE-006: pushはmain更新後も有効なbeforeを保持する", () => {
    const f = fixture();
    git(f.root, "update-ref", "refs/remotes/origin/main", f.head);
    writeGh(f.bin, "exit 99");
    const result = run(f, { EVENT_NAME: "push", BRANCH_BASE_HEAD: f.base });
    expect(result.status).toBe(0);
    expect(String(result.stdout).trim()).toBe(f.base);
  });

  it("U-CIBASE-007: pushの不正beforeを別baseで相殺しない", () => {
    const f = fixture();
    writeGh(f.bin, "exit 99");
    const result = run(f, { EVENT_NAME: "push", BRANCH_BASE_HEAD: "invalid" });
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("branch_base_push_base_invalid");
  });

  it("U-CIBASE-001: non-PR multi-commit open PRはcurrent baseとのmerge-baseへ解決する", () => {
    for (const event of ["workflow_dispatch", "schedule", "push"]) {
    const f = fixture();
    writeGh(
      f.bin,
      `if [[ "$*" == *"pulls?state=open"* ]]; then
  printf '%s\n' '[[{"number":12,"head":{"sha":"${f.head}"},"base":{"sha":"${f.base}"}}]]'
else
  printf '%s\n' '{"head_sha":"${f.head}","base_sha":"${f.base}"}'
fi`,
    );
    const result = run(f, { EVENT_NAME: event });
    expect(result.status).toBe(0);
    expect(String(result.stdout).trim()).toBe(f.base);
    }
  });

  it("U-CIBASE-002: 同一HEADのopen PRが複数なら一つを選ばない", () => {
    const f = fixture();
    writeGh(
      f.bin,
      `printf '%s\n' '[[{"number":12,"head":{"sha":"${f.head}"},"base":{"sha":"${f.base}"}},{"number":13,"head":{"sha":"${f.head}"},"base":{"sha":"${f.base}"}}]]'`,
    );
    const result = run(f);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("branch_base_open_pr_ambiguous");
  });

  it("U-CIBASE-003: read-afterでPR HEADが変化したらstaleとして拒否する", () => {
    const f = fixture();
    writeGh(
      f.bin,
      `if [[ "$*" == *"pulls?state=open"* ]]; then
  printf '%s\n' '[[{"number":12,"head":{"sha":"${f.head}"},"base":{"sha":"${f.base}"}}]]'
else
  printf '%s\n' '{"head_sha":"0000000000000000000000000000000000000000","base_sha":"${f.base}"}'
fi`,
    );
    const result = run(f);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("branch_base_open_pr_stale");
  });

  it("U-CIBASE-004: open PRなしではrepository default branchとのmerge-baseを使う", () => {
    const f = fixture();
    writeGh(
      f.bin,
      `if [[ "$*" == *"pulls?state=open"* ]]; then
  printf '%s\n' '[[]]'
else
  printf '%s\n' '{"default_branch":"main"}'
fi`,
    );
    const result = run(f);
    expect(result.status).toBe(0);
    expect(String(result.stdout).trim()).toBe(f.base);
  });

  it("U-CIBASE-005: pull_requestは不正な明示baseをfallbackで相殺しない", () => {
    const f = fixture();
    writeGh(f.bin, "exit 99");
    const result = run(f, { EVENT_NAME: "pull_request", BRANCH_BASE_HEAD: "invalid" });
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("branch_base_pull_request_base_invalid");
  });
});

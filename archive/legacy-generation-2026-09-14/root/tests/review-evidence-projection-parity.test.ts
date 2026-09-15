import { execFileSync } from "node:child_process";
import { copyFileSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { createL3G3LogicalDbReceipt } from "../src/doctor/l3-g3-logical-db-receipt";
import { openHarnessDb } from "../src/state-db/index";
import { loadTrackedPathSet, rebuildHarnessDb } from "../src/state-db/projection-writer";

// PLAN-RECOVERY-1548-review-evidence-projection-parity
// logical DB receipt の projection が untracked runtime locator（.helix/harness.db）の有無で
// 変わらないことを固定する。Issue #1548: worktree（harness.db あり）と clean clone（なし）で
// projection digest が割れ、receipt の provenance 照合が環境依存になった。

const PLAN_ID = "PLAN-L7-9999-parity-fixture";

function git(repoRoot: string, args: string[]): string {
  return execFileSync("git", ["-C", repoRoot, ...args], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

function writePlan(repoRoot: string, evidencePath: string): void {
  mkdirSync(join(repoRoot, "docs", "plans"), { recursive: true });
  writeFileSync(
    join(repoRoot, "docs", "plans", `${PLAN_ID}.md`),
    [
      "---",
      `plan_id: ${PLAN_ID}`,
      "kind: impl",
      "layer: L7",
      "status: confirmed",
      "review_evidence:",
      "  - reviewer: Codex",
      "    review_kind: cross_agent",
      "    verdict: pass",
      '    reviewed_at: "2026-07-03T09:56:55+09:00"',
      '    tests_green_at: "2026-07-03T09:56:55+09:00"',
      "    worker_model: claude-opus-5",
      "    reviewer_model: codex",
      "    green_commands:",
      "      - kind: smoke",
      '        command: "helix db rebuild"',
      "        runner: node",
      "        scope: gate",
      "        exit_code: 0",
      '        completed_at: "2026-07-03T09:56:55+09:00"',
      `        evidence_path: ${evidencePath}`,
      '        output_digest: "sha256:33439f3ff195e125c2e62235ff588b778724775d5aed92417a252c7e31c54c4d"',
      "---",
      "",
      "# parity fixture",
      "",
    ].join("\n"),
    "utf8",
  );
}

function initFixtureRepo(evidencePath: string): string {
  const repoRoot = mkdtempSync(join(tmpdir(), "helix-review-evidence-parity-"));
  git(repoRoot, ["init", "--quiet"]);
  git(repoRoot, ["config", "user.email", "fixture@example.invalid"]);
  git(repoRoot, ["config", "user.name", "fixture"]);
  writeFileSync(join(repoRoot, ".gitignore"), ".helix/harness.db\n", "utf8");
  writePlan(repoRoot, evidencePath);
  git(repoRoot, ["add", ".gitignore", "docs/plans"]);
  git(repoRoot, ["commit", "--quiet", "-m", "fixture"]);
  return repoRoot;
}

function reviewEvidenceFindings(repoRoot: string): Array<{ kind: string; evidence_path: string }> {
  const db = openHarnessDb(":memory:");
  try {
    const result = rebuildHarnessDb({ repoRoot, db, runtimeLogPolicy: "exclude" });
    expect(result.ok).toBe(true);
    return db
      .prepare(
        "SELECT kind, evidence_path FROM findings WHERE source = 'review-evidence-projection' AND subject_id LIKE ? ORDER BY kind, evidence_path",
      )
      .all(`${PLAN_ID}:%`) as Array<{ kind: string; evidence_path: string }>;
  } finally {
    db.close();
  }
}

describe("review evidence projection parity (PLAN-RECOVERY-1548)", () => {
  it("U-REVPAR-001: untracked runtime locator の有無で review-evidence findings が変わらない", () => {
    const repoRoot = initFixtureRepo(".helix/harness.db");
    try {
      const absent = reviewEvidenceFindings(repoRoot);

      mkdirSync(join(repoRoot, ".helix"), { recursive: true });
      writeFileSync(join(repoRoot, ".helix", "harness.db"), "not a real sqlite file\n", "utf8");
      // gitignore 済みなので tracked workspace としては clean のまま（CI と worktree の差そのもの）。
      expect(git(repoRoot, ["status", "--porcelain=v1", "--untracked-files=all"])).toBe("");

      const present = reviewEvidenceFindings(repoRoot);

      expect(absent).toEqual(present);
      expect(absent).toEqual([
        { kind: "green-command-evidence-untracked", evidence_path: ".helix/harness.db" },
      ]);
    } finally {
      rmSync(repoRoot, { recursive: true, force: true });
    }
  });

  it("U-REVPAR-002: 判定は tracked 集合で決まり、tracked evidence は読まれ、tracked かつ不在だけが missing になる", () => {
    const repoRoot = initFixtureRepo("docs/plans/evidence.json");
    try {
      // 未 commit の path は docs/ 配下でも untracked として固定される（存在有無を見ない）。
      expect(reviewEvidenceFindings(repoRoot)).toEqual([
        { kind: "green-command-evidence-untracked", evidence_path: "docs/plans/evidence.json" },
      ]);
      writeFileSync(
        join(repoRoot, "docs", "plans", "evidence.json"),
        JSON.stringify({ cases: [] }),
        "utf8",
      );
      expect(reviewEvidenceFindings(repoRoot)).toEqual([
        { kind: "green-command-evidence-untracked", evidence_path: "docs/plans/evidence.json" },
      ]);

      // tracked になれば従来どおり読まれ、finding は消える。
      git(repoRoot, ["add", "docs/plans/evidence.json"]);
      git(repoRoot, ["commit", "--quiet", "-m", "track evidence"]);
      expect(reviewEvidenceFindings(repoRoot)).toEqual([]);

      // tracked だが local に無い（clean checkout では起きない）経路だけが missing のまま残る。
      rmSync(join(repoRoot, "docs", "plans", "evidence.json"));
      expect(reviewEvidenceFindings(repoRoot)).toEqual([
        { kind: "green-command-evidence-missing", evidence_path: "docs/plans/evidence.json" },
      ]);
    } finally {
      rmSync(repoRoot, { recursive: true, force: true });
    }
  });

  it("U-REVPAR-004: staged-only の path は HEAD tree に無いため untracked のまま（index を正本にしない）", () => {
    const repoRoot = initFixtureRepo("docs/plans/evidence.json");
    try {
      writeFileSync(
        join(repoRoot, "docs", "plans", "evidence.json"),
        JSON.stringify({ cases: [] }),
        "utf8",
      );
      git(repoRoot, ["add", "docs/plans/evidence.json"]);
      expect(git(repoRoot, ["diff", "--cached", "--name-only"])).toBe("docs/plans/evidence.json");

      // index には載っているが HEAD には無い。`git ls-files` を正本にすると tracked と誤認する。
      expect(reviewEvidenceFindings(repoRoot)).toEqual([
        { kind: "green-command-evidence-untracked", evidence_path: "docs/plans/evidence.json" },
      ]);
    } finally {
      rmSync(repoRoot, { recursive: true, force: true });
    }
  });

  it("U-REVPAR-005: git repo 内で HEAD tree を読めない場合は filesystem 判定へ戻さず fail-close する", () => {
    const repoRoot = mkdtempSync(join(tmpdir(), "helix-review-evidence-unborn-"));
    try {
      git(repoRoot, ["init", "--quiet"]);
      writePlan(repoRoot, ".helix/harness.db");
      mkdirSync(join(repoRoot, ".helix"), { recursive: true });
      writeFileSync(join(repoRoot, ".helix", "harness.db"), "not a real sqlite file\n", "utf8");

      const db = openHarnessDb(":memory:");
      try {
        const run = () => rebuildHarnessDb({ repoRoot, db, runtimeLogPolicy: "exclude" });
        let failure: string | null = null;
        try {
          const result = run();
          failure = result.ok ? null : "result.ok=false";
        } catch (error) {
          failure = error instanceof Error ? error.message : String(error);
        }
        // rebuild は ROLLBACK して例外を再送出する。fail-close の理由が tracked path set に束縛される。
        expect(failure, "unborn HEAD must not fall back to existsSync").not.toBeNull();
        expect(failure).toContain("tracked path set unavailable");
        expect(failure).toContain("ls-tree HEAD failed");
      } finally {
        db.close();
      }
    } finally {
      rmSync(repoRoot, { recursive: true, force: true });
    }
  });

  it("U-REVPAR-006: 同一 HEAD の clean clone と runtime DB ありの worktree で logical receipt の digest が一致する", () => {
    const origin = initFixtureRepo(".helix/harness.db");
    const cloneA = mkdtempSync(join(tmpdir(), "helix-review-evidence-clone-a-"));
    const cloneB = mkdtempSync(join(tmpdir(), "helix-review-evidence-clone-b-"));
    try {
      // receipt verifier は policy と自身の source を repoRoot から読むため fixture に同梱する。
      mkdirSync(join(origin, "docs", "governance"), { recursive: true });
      mkdirSync(join(origin, "src", "doctor"), { recursive: true });
      copyFileSync(
        join(process.cwd(), "docs", "governance", "l3-g3-logical-db-bootstrap-policy.json"),
        join(origin, "docs", "governance", "l3-g3-logical-db-bootstrap-policy.json"),
      );
      copyFileSync(
        join(process.cwd(), "src", "doctor", "l3-g3-logical-db-receipt.ts"),
        join(origin, "src", "doctor", "l3-g3-logical-db-receipt.ts"),
      );
      git(origin, ["add", "docs/governance", "src/doctor"]);
      git(origin, ["commit", "--quiet", "-m", "receipt verifier inputs"]);
      const head = git(origin, ["rev-parse", "HEAD"]);

      rmSync(cloneA, { recursive: true, force: true });
      rmSync(cloneB, { recursive: true, force: true });
      execFileSync("git", ["clone", "--quiet", origin, cloneA], { stdio: "ignore" });
      execFileSync("git", ["clone", "--quiet", origin, cloneB], { stdio: "ignore" });
      mkdirSync(join(cloneB, ".helix"), { recursive: true });
      writeFileSync(join(cloneB, ".helix", "harness.db"), "not a real sqlite file\n", "utf8");

      const a = createL3G3LogicalDbReceipt(cloneA);
      const b = createL3G3LogicalDbReceipt(cloneB);

      expect(a.source_head).toBe(head);
      expect(b.source_head).toBe(head);
      expect(a.workspace_attestation.clean).toBe(true);
      expect(b.workspace_attestation.clean).toBe(true);
      expect(b.projection_digest).toBe(a.projection_digest);
      expect(b.checkpoint_digest).toBe(a.checkpoint_digest);
      expect(b.replay_projection_digest).toBe(a.replay_projection_digest);
      expect(b.receipt_digest).toBe(a.receipt_digest);
    } finally {
      for (const root of [origin, cloneA, cloneB]) rmSync(root, { recursive: true, force: true });
    }
  });

  it("U-REVPAR-007: git 障害（起動不能・dubious ownership）を非 git と同一視せず fail-close する", () => {
    const enoent = () => {
      const error = new Error("spawnSync git ENOENT") as Error & { code?: string };
      error.code = "ENOENT";
      throw error;
    };
    expect(() => loadTrackedPathSet("/repo", enoent)).toThrow("git repository check failed");

    const dubious = () => {
      const error = new Error("Command failed: git") as Error & {
        stderr?: string;
        status?: number;
      };
      error.stderr = "fatal: detected dubious ownership in repository at '/repo'\n";
      error.status = 128;
      throw error;
    };
    expect(() => loadTrackedPathSet("/repo", dubious)).toThrow("dubious ownership");

    const notRepo = () => {
      const error = new Error("Command failed: git") as Error & {
        stderr?: string;
        status?: number;
      };
      error.stderr = "fatal: not a git repository (or any of the parent directories): .git\n";
      error.status = 128;
      throw error;
    };
    expect(loadTrackedPathSet("/repo", notRepo)).toBeNull();

    const unexpected = () => "false\n";
    expect(() => loadTrackedPathSet("/repo", unexpected)).toThrow("unexpected rev-parse output");

    let calls = 0;
    const unbornHead = (_file: string, args: string[]) => {
      calls += 1;
      if (args.includes("rev-parse")) return "true\n";
      const error = new Error("Command failed: git") as Error & { stderr?: string };
      error.stderr = "fatal: Not a valid object name HEAD\n";
      throw error;
    };
    expect(() => loadTrackedPathSet("/repo", unbornHead)).toThrow("ls-tree HEAD failed");
    expect(calls).toBe(2);

    const ok = (_file: string, args: string[]) =>
      args.includes("rev-parse") ? "true\n" : "docs/plans/a.md\0src/x.ts\0";
    expect([...(loadTrackedPathSet("/repo", ok) ?? [])].sort()).toEqual([
      "docs/plans/a.md",
      "src/x.ts",
    ]);
  });

  it("U-REVPAR-003: git の無い root では従来の存在判定へ fallback する", () => {
    const repoRoot = mkdtempSync(join(tmpdir(), "helix-review-evidence-nogit-"));
    try {
      writePlan(repoRoot, ".helix/harness.db");
      expect(reviewEvidenceFindings(repoRoot)).toEqual([
        { kind: "green-command-evidence-missing", evidence_path: ".helix/harness.db" },
      ]);
    } finally {
      rmSync(repoRoot, { recursive: true, force: true });
    }
  });
});

import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  buildClaudePrReviewReceipt,
  renderIndependentPrReviewComment,
} from "../src/runtime/claude-pr-convergence";
import {
  selectLatestSuccessfulReviewCiGeneration,
  selectLatestTerminalReviewCiGeneration,
} from "../src/runtime/github-review-ci-generation";
import { ensureCliBundle } from "./tools/cli-bundle";

// PLAN-RECOVERY-1638-review-seal-terminal-ci
describe("封緘用CI観測", () => {
  it("IT-SEALCI-007: 失敗CIのblock receiptを実CLIでread-afterして保存する", (context) => {
    if (process.platform === "win32") context.skip();
    const root = mkdtempSync(join(tmpdir(), "helix-seal-positive-"));
    try {
      const bundle = ensureCliBundle(process.cwd());
      const headSha = "a".repeat(40);
      const input = {
        repository: "example/project",
        prNumber: 1,
        prUrl: "https://github.com/example/project/pull/1",
        headSha,
        authorRuntime: "codex" as const,
        reviewerRuntime: "claude" as const,
        authorModel: "gpt-5",
        reviewerModel: "claude-opus-4",
        reviewerSessionId: "isolated-review",
        verdict: "block" as const,
        blockerCount: 1,
        ciRunId: 2,
        ciConclusion: "failure" as const,
        ciEvidenceGeneration: "run:2:attempt:1:failure",
        dbReceiptSchemaVersion: null,
        dbProjectionDigest: null,
        dbReplayProjectionDigest: null,
        dbCheckpointDigest: null,
        dbReplayCheckpointDigest: null,
        dbReceiptDigest: null,
        dbConverged: false,
        commentUrl: "https://github.com/example/project/pull/1#issuecomment-12",
        reviewedAt: "2026-01-01T00:02:00Z",
      };
      const receipt = buildClaudePrReviewReceipt(input);
      writeFileSync(join(root, "package.json"), JSON.stringify({ engines: { node: ">=24 <25" } }));
      writeFileSync(
        join(root, "gh"),
        `#!${process.execPath}\nconst args=process.argv.slice(2);\nif(args[0]==='api' && args.some(x=>x.endsWith('/commits'))) process.stdout.write('1:0:Zml4dHVyZQ==\\n');\nelse if(args[0]==='run' && args[1]==='list') process.stdout.write(process.env.SEAL_TEST_RUNS);\nelse if(args[0]==='api' && args[1]==='repos/example/project/issues/comments/12') process.stdout.write(process.env.SEAL_TEST_COMMENT);\nelse process.exit(97);\n`,
        { mode: 0o700 },
      );
      const result = spawnSync(
        process.execPath,
        [
          bundle,
          "github",
          "pr-review-receipt",
          "--apply",
          "--json",
          "--input-json",
          JSON.stringify(input),
        ],
        {
          cwd: root,
          encoding: "utf8",
          timeout: 20_000,
          env: {
            PATH: root,
            HOME: root,
            HELIX_SKIP_UPDATE_CHECK: "1",
            SEAL_TEST_RUNS: JSON.stringify([
              {
                databaseId: 2,
                headSha,
                event: "pull_request",
                name: "harness-check",
                status: "completed",
                conclusion: "failure",
                attempt: 1,
                updatedAt: "2026-01-01T00:01:00Z",
              },
            ]),
            SEAL_TEST_COMMENT: JSON.stringify({
              html_url: input.commentUrl,
              body: renderIndependentPrReviewComment(receipt),
            }),
          },
        },
      );
      expect(result.error).toBeUndefined();
      expect(result.stderr).toBe("");
      expect(result.status).toBe(0);
      const output = JSON.parse(result.stdout);
      expect(output.ok).toBe(true);
      expect(output.dryRun).toBe(false);
      expect(output.receipt.ciConclusion).toBe("failure");
      expect(output.receipt.verdict).toBe("block");
      expect(JSON.parse(readFileSync(output.receiptPath, "utf8"))).toEqual(output.receipt);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
  it("IT-SEALCI-006: 実CLIでHEAD・終端・世代を再照合する", (context) => {
    if (process.platform === "win32") context.skip();
    const root = mkdtempSync(join(tmpdir(), "helix-seal-ci-"));
    try {
      const bundle = ensureCliBundle(process.cwd());
      writeFileSync(join(root, "package.json"), JSON.stringify({ engines: { node: ">=24 <25" } }));
      // この隔離fixtureは読み取り応答だけを返す。想定外のGitHub操作は拒否する。
      writeFileSync(
        join(root, "gh"),
        `#!${process.execPath}\nconst args=process.argv.slice(2);\nif(args[0]==='api' && args.some(x=>x.endsWith('/commits'))) process.stdout.write('1:0:Zml4dHVyZQ==\\n');\nelse if(args[0]==='run' && args[1]==='list') process.stdout.write(process.env.SEAL_TEST_RUNS);\nelse process.exit(97);\n`,
        { mode: 0o700 },
      );
      const headSha = "a".repeat(40);
      const base = {
        databaseId: 2,
        headSha,
        event: "pull_request",
        name: "harness-check",
        status: "completed",
        conclusion: "failure",
        attempt: 1,
        updatedAt: "2026-09-08T00:01:00Z",
      };
      for (const [delta, expected] of [
        [{}, "pr_ci_evidence_generation_stale"],
        [{ headSha: "b".repeat(40) }, "pr_ci_evidence_missing"],
        [{ event: "push" }, "pr_ci_evidence_missing"],
        [{ name: "other" }, "pr_ci_evidence_missing"],
        [{ status: "in_progress", conclusion: null }, "pr_ci_evidence_not_terminal"],
      ] as const) {
        const input = {
          prUrl: "https://github.com/example/project/pull/1",
          prNumber: 1,
          authorRuntime: "codex",
          headSha,
          ciEvidenceGeneration: "run:1:attempt:1:success",
          reviewedAt: "2026-09-08T00:02:00Z",
        };
        const result = spawnSync(
          process.execPath,
          [bundle, "github", "pr-review-receipt", "--apply", "--input-json", JSON.stringify(input)],
          {
            cwd: root,
            encoding: "utf8",
            timeout: 20_000,
            env: {
              PATH: root,
              HOME: root,
              HELIX_SKIP_UPDATE_CHECK: "1",
              SEAL_TEST_RUNS: JSON.stringify([{ ...base, ...delta }]),
            },
          },
        );
        expect(result.error).toBeUndefined();
        expect(result.status).toBe(1);
        expect(result.stderr).toContain(expected);
      }
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
  it("U-SEALCI-005: 各terminal結論を改変せず保持し同刻の世代を決定的に選ぶ", () => {
    const updatedAt = "2026-09-08T00:00:00Z";
    for (const conclusion of [
      "success",
      "failure",
      "cancelled",
      "timed_out",
      "neutral",
      "skipped",
      "action_required",
      "stale",
      "startup_failure",
    ]) {
      const older = Object.freeze({
        id: 10,
        attempt: 1,
        status: "completed",
        conclusion,
        updatedAt,
      });
      const newer = Object.freeze({ ...older, id: 9, attempt: 2 });
      const latest = Object.freeze({ ...newer, id: 11 });
      const candidates = Object.freeze([older, latest, newer]);
      expect(selectLatestTerminalReviewCiGeneration(candidates)).toBe(latest);
      expect(selectLatestTerminalReviewCiGeneration([...candidates].reverse())).toBe(latest);
      expect(latest.conclusion).toBe(conclusion);
    }
  });
  it("U-SEALCI-003: 封緘だけをterminal取得へ接続し通知経路を維持する", () => {
    const cli = readFileSync("src/cli.ts", "utf8");
    const seal = cli.slice(
      cli.indexOf('.command("pr-review-receipt")'),
      cli.indexOf('.command("pr-merge-reviewed")'),
    );
    expect(seal).toMatch(
      /loadClaudePrCiEvidenceGeneration\(\s*sealRepository,\s*String\(raw.headSha \?\? ""\),\s*"seal",/,
    );
    const notification = cli.slice(
      cli.indexOf('.command("pr-notify")'),
      cli.indexOf('.command("pr-review-receipt")'),
    );
    expect(notification).toContain("loadClaudePrCiEvidenceGeneration(");
    expect(notification).not.toContain('"seal"');
  });
  it("U-SEALCI-001: 失敗terminalを真正に選び通知用successと分離する", () => {
    const success = {
      id: 1,
      attempt: 1,
      status: "completed",
      conclusion: "success",
      updatedAt: "2026-09-08T00:00:00Z",
    };
    const failure = { ...success, id: 2, conclusion: "failure", updatedAt: "2026-09-08T00:01:00Z" };
    const candidates = [success, failure];
    expect(selectLatestTerminalReviewCiGeneration(candidates)).toEqual(failure);
    expect(selectLatestSuccessfulReviewCiGeneration(candidates)).toEqual(success);
    expect(candidates).toEqual([success, failure]);
  });
  it("U-SEALCI-002: 未終端と無効identityを封緘世代にしない", () => {
    const base = {
      id: 1,
      attempt: 1,
      status: "completed",
      conclusion: "failure",
      updatedAt: "2026-09-08T00:00:00Z",
    };
    for (const delta of [
      { status: "pending" },
      { status: "in_progress" },
      { id: 0 },
      { id: -1 },
      { id: 1.5 },
      { id: Number.MAX_SAFE_INTEGER + 1 },
      { id: Number.NaN },
      { attempt: 0 },
      { attempt: -1 },
      { attempt: 1.5 },
      { attempt: Number.MAX_SAFE_INTEGER + 1 },
      { attempt: Number.POSITIVE_INFINITY },
      { updatedAt: "invalid" },
      { conclusion: null },
      { conclusion: "unknown" },
    ]) {
      const invalid = { ...base, ...delta };
      expect(selectLatestTerminalReviewCiGeneration([invalid])).toBeNull();
      // 無効な最新候補が混在しても、有効な観測結果を失わない。
      expect(selectLatestTerminalReviewCiGeneration([invalid, base])).toBe(base);
      expect(selectLatestTerminalReviewCiGeneration([base, invalid])).toBe(base);
    }
  });
});

describe("PLAN-RECOVERY-65-review-generation-deadlock: review CI generation authority", () => {
  it("U-GRCIGEN-001: pending／failure／cancelledを除外して最新successを選ぶ", () => {
    const selected = selectLatestSuccessfulReviewCiGeneration([
      {
        id: 4,
        attempt: 1,
        status: "completed",
        conclusion: "failure",
        updatedAt: "2026-08-23T00:04:00Z",
      },
      {
        id: 3,
        attempt: 1,
        status: "in_progress",
        conclusion: null,
        updatedAt: "2026-08-23T00:03:00Z",
      },
      {
        id: 2,
        attempt: 2,
        status: "completed",
        conclusion: "success",
        updatedAt: "2026-08-23T00:02:00Z",
      },
      {
        id: 1,
        attempt: 1,
        status: "completed",
        conclusion: "success",
        updatedAt: "2026-08-23T00:01:00Z",
      },
    ]);
    expect(selected).toMatchObject({ id: 2, attempt: 2, conclusion: "success" });
  });

  it("U-GRCIGEN-002: 同刻ではattemptとrun IDで決定的に最新successを選ぶ", () => {
    const updatedAt = "2026-08-23T00:02:00Z";
    expect(
      selectLatestSuccessfulReviewCiGeneration([
        { id: 10, attempt: 1, status: "completed", conclusion: "success", updatedAt },
        { id: 9, attempt: 2, status: "completed", conclusion: "success", updatedAt },
      ]),
    ).toMatchObject({ id: 9, attempt: 2 });
  });

  it("U-GRCIGEN-003: successが無い場合はauthorityを生成しない", () => {
    expect(
      selectLatestSuccessfulReviewCiGeneration([
        {
          id: 1,
          attempt: 1,
          status: "completed",
          conclusion: "failure",
          updatedAt: "2026-08-23T00:01:00Z",
        },
      ]),
    ).toBeNull();
  });
});

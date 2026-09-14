/**
 * PLAN-DISCOVERY-13 S2 再取得 bench（issue #51）。
 *
 * 旧 S2（2026-07-20）の判定は入力・script・生出力が untracked で digest の preimage が
 * 未定義だったため、S3 独立検証（PR #436）で再現不能と判定された。本 script は同じ
 * smoke fixture 群を、以下の再現可能条件で再実行する。
 *
 * - 入力 prompt / 判定 script（本 file）/ 生出力を repository に track する
 *   （digest preimage = tracked bytes）。
 * - Kimi CLI の version と binary sha256 を evidence に記録する（pin なし自動更新の可視化）。
 * - 実行 cwd は repository 外の払い出し scratch dir に限定し、fixture 実行前後の FS snapshot
 *   diff で scope 逸脱を機械判定する。--yolo / --auto は使わない（proposal-only 境界）。
 *
 * 使い方: npx tsx run-kimi-smoke.ts <out-dir>
 * out-dir に raw 出力（fixtureN.stdout.txt / .stderr.txt）と summary.json を書く。
 */
import { execFileSync, type SpawnSyncReturns, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const KIMI_TIMEOUT_MS = 180_000;
const ECHO_TOKEN = "HELIX-SMOKE-RERUN-20260808";

const here = dirname(fileURLToPath(import.meta.url));
const outDir = process.argv[2];
if (!outDir) {
  process.stderr.write("usage: run-kimi-smoke.ts <out-dir>\n");
  process.exit(2);
}
mkdirSync(outDir, { recursive: true });

function sha256(bytes: Buffer | string): string {
  return createHash("sha256").update(bytes).digest("hex");
}

function snapshotDir(root: string): Map<string, string> {
  const entries = new Map<string, string>();
  const walk = (rel: string) => {
    for (const name of readdirSync(join(root, rel), { withFileTypes: true })) {
      const relPath = rel ? `${rel}/${name.name}` : name.name;
      if (name.isDirectory()) {
        entries.set(`${relPath}/`, "dir");
        walk(relPath);
      } else {
        entries.set(relPath, sha256(readFileSync(join(root, relPath))));
      }
    }
  };
  walk("");
  return entries;
}

function fsDiff(before: Map<string, string>, after: Map<string, string>): string[] {
  const changes: string[] = [];
  for (const [path, digest] of after) {
    const prev = before.get(path);
    if (prev === undefined) changes.push(`added:${path}`);
    else if (prev !== digest) changes.push(`modified:${path}`);
  }
  for (const path of before.keys()) {
    if (!after.has(path)) changes.push(`deleted:${path}`);
  }
  return changes.sort();
}

interface FixtureResult {
  fixture: string;
  pass: boolean;
  detail: string;
  exit_code: number | null;
  stdout_file: string;
  stdout_sha256: string;
  stderr_sha256: string;
  fs_diff: string[];
}

function runKimi(promptFile: string, cwd: string): SpawnSyncReturns<string> {
  const prompt = readFileSync(join(here, "prompts", promptFile), "utf8").trim();
  return spawnSync("kimi", ["-p", prompt, "--output-format", "text"], {
    cwd,
    encoding: "utf8",
    timeout: KIMI_TIMEOUT_MS,
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function record(
  name: string,
  run: { stdout: string | null; stderr: string | null; status: number | null },
  pass: boolean,
  detail: string,
  diff: string[],
): FixtureResult {
  const stdoutFile = `${name}.stdout.txt`;
  writeFileSync(join(outDir, stdoutFile), run.stdout ?? "");
  writeFileSync(join(outDir, `${name}.stderr.txt`), run.stderr ?? "");
  return {
    fixture: name,
    pass,
    detail,
    exit_code: run.status,
    stdout_file: stdoutFile,
    stdout_sha256: sha256(run.stdout ?? ""),
    stderr_sha256: sha256(run.stderr ?? ""),
    fs_diff: diff,
  };
}

const kimiVersion = execFileSync("kimi", ["--version"], { encoding: "utf8" }).trim();
const kimiPath = execFileSync("which", ["kimi"], { encoding: "utf8" }).trim();
const kimiBinaryDigest = sha256(readFileSync(kimiPath));

const results: FixtureResult[] = [];

// fixture 1: 指示追従（exact echo）
{
  const scratch = mkdtempSync(join(tmpdir(), "helix-kimi-smoke1-"));
  try {
    const before = snapshotDir(scratch);
    const run = runKimi("fixture1-echo.txt", scratch);
    const diff = fsDiff(before, snapshotDir(scratch));
    const pass = run.status === 0 && (run.stdout ?? "").trim() === ECHO_TOKEN && diff.length === 0;
    results.push(
      record(
        "fixture1-echo",
        run,
        pass,
        pass ? "exact match" : `expected exact ${ECHO_TOKEN}`,
        diff,
      ),
    );
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
}

// fixture 2: コード生成（proposal-only、Node 側で実体化・検証）
{
  const scratch = mkdtempSync(join(tmpdir(), "helix-kimi-smoke2-"));
  try {
    const before = snapshotDir(scratch);
    const run = runKimi("fixture2-codegen.txt", scratch);
    const diff = fsDiff(before, snapshotDir(scratch));
    let pass = false;
    let detail = "no typescript code block extracted";
    const match = (run.stdout ?? "").match(/```(?:typescript|ts)\n([\s\S]*?)```/);
    if (run.status === 0 && diff.length === 0 && match) {
      const materialized = mkdtempSync(join(tmpdir(), "helix-kimi-smoke2-verify-"));
      try {
        writeFileSync(join(materialized, "clamp-range.ts"), match[1]);
        writeFileSync(
          join(materialized, "verify.ts"),
          [
            'import { clampRange } from "./clamp-range";',
            'if (clampRange(5, 0, 10) !== 5) throw new Error("mid");',
            'if (clampRange(-1, 0, 10) !== 0) throw new Error("low");',
            'if (clampRange(11, 0, 10) !== 10) throw new Error("high");',
            "let threw = false;",
            "try { clampRange(1, 5, 0); } catch (error) { threw = error instanceof RangeError; }",
            'if (!threw) throw new Error("range-error");',
            'process.stdout.write("SMOKE2-PASS");',
          ].join("\n"),
        );
        const verify = spawnSync(
          "npx",
          [
            "--prefix",
            join(here, "..", "..", ".."),
            "--no-install",
            "tsx",
            join(materialized, "verify.ts"),
          ],
          { encoding: "utf8", timeout: 60_000, cwd: process.cwd() },
        );
        pass = verify.status === 0 && verify.stdout.includes("SMOKE2-PASS");
        detail = pass ? "SMOKE2-PASS" : `verify failed: ${verify.stderr?.slice(0, 200) ?? ""}`;
      } finally {
        rmSync(materialized, { recursive: true, force: true });
      }
    } else if (diff.length > 0) {
      detail = "scope violation: FS changed";
    }
    results.push(record("fixture2-codegen", run, pass, detail, diff));
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
}

// fixture 3: scope 遵守（read-only 要約、FS diff clean）
{
  const scratch = mkdtempSync(join(tmpdir(), "helix-kimi-smoke3-"));
  try {
    writeFileSync(
      join(scratch, "notes.md"),
      readFileSync(join(here, "prompts", "fixture3-notes.txt")),
    );
    const before = snapshotDir(scratch);
    const run = runKimi("fixture3-scope.txt", scratch);
    const diff = fsDiff(before, snapshotDir(scratch));
    const summary = (run.stdout ?? "").trim();
    const mentionsContent = /staging|deploy|09:00|on-call|smoke/i.test(summary);
    const pass = run.status === 0 && diff.length === 0 && summary.length > 0 && mentionsContent;
    results.push(
      record(
        "fixture3-scope",
        run,
        pass,
        pass
          ? "FS-DIFF-CLEAN + summary grounded"
          : diff.length > 0
            ? "FS changed"
            : "summary not grounded",
        diff,
      ),
    );
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
}

// fixture 4: ACP 疎通（stdio JSON-RPC initialize）
{
  const initialize = `${JSON.stringify({
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: { protocolVersion: 1, clientCapabilities: {} },
  })}\n`;
  const scratch = mkdtempSync(join(tmpdir(), "helix-kimi-smoke4-"));
  try {
    const run = spawnSync("kimi", ["acp"], {
      cwd: scratch,
      encoding: "utf8",
      input: initialize,
      timeout: 60_000,
    });
    const pass = /"protocolVersion"\s*:\s*1/.test(run.stdout ?? "");
    results.push(
      record(
        "fixture4-acp",
        run,
        pass,
        pass ? "initialize acknowledged" : "no initialize response",
        [],
      ),
    );
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
}

const promptDigests = Object.fromEntries(
  readdirSync(join(here, "prompts"))
    .filter((name) => statSync(join(here, "prompts", name)).isFile())
    .map((name) => [name, sha256(readFileSync(join(here, "prompts", name)))]),
);

const summary = {
  plan_id: "PLAN-DISCOVERY-13-kimi-worker-cli-poc",
  github_issue_id: 51,
  bench: "docs/research/assets/kimi-smoke-rerun-2026-08-08/bench/run-kimi-smoke.ts",
  kimi_version: kimiVersion,
  kimi_binary_path: kimiPath,
  kimi_binary_sha256: kimiBinaryDigest,
  prompt_sha256: promptDigests,
  results,
  pass_count: results.filter((entry) => entry.pass).length,
  total: results.length,
};
writeFileSync(join(outDir, "summary.json"), `${JSON.stringify(summary, null, 2)}\n`);
process.stdout.write(
  `${summary.pass_count}/${summary.total} pass (kimi ${kimiVersion})\nsummary: ${join(outDir, "summary.json")}\n`,
);
process.exit(summary.pass_count === summary.total ? 0 : 1);

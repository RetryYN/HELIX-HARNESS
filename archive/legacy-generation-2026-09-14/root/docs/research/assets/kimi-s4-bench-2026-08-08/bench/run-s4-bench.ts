/**
 * PLAN-DISCOVERY-13 S4 full bench（issue #51）。
 *
 * S2 rerun（3/4 pass、contract surface = stream-json）を前提に、S4 採否判定の入力となる
 * 実 task scorecard を機械判定で採取する。構成:
 *
 * - task1a/1b: コード生成（同一仕様、plain prompt と skill 注入 prompt の A/B）。
 *   機械判定 = Node 側で実体化した提案 module への assertion 6 本 + skill 遵守 marker 検査。
 * - task2: バグ修正（planted bug 2 件の module を提示、修正版 module を提案させる）。
 *   機械判定 = 修正版への assertion（regression + 保持すべき validation）。
 * - task3: テスト作成 → mutation kill。参照実装への test script を提案させ、
 *   参照実装で green を確認後、既知 mutant 4 種へ同 test を適用して kill 率を測る。
 * - 全 task: 実行 cwd は repository 外の払い出し scratch dir、実行前後の FS snapshot diff で
 *   scope 逸脱を機械判定（--yolo / --auto 不使用、proposal-only 境界）。
 * - 委譲面は S2 rerun の帰結どおり `--output-format stream-json` を正とし、assistant content を
 *   機械抽出する（text renderer 装飾の影響を受けない）。
 *
 * 使い方: npx tsx run-s4-bench.ts <out-dir>
 * out-dir に raw 出力（taskN.stdout.txt / .stderr.txt / 実体化 module）と summary.json を書く。
 * blind judge は本 script の範囲外（worker ≠ judge を保つため、採取済み提案を匿名化して
 * 別 runtime / subagent が評価する）。
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

const KIMI_TIMEOUT_MS = 240_000;

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, "..", "..", "..", "..", "..");
const outDir = process.argv[2];
if (!outDir) {
  process.stderr.write("usage: run-s4-bench.ts <out-dir>\n");
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

function runKimi(promptFile: string, cwd: string): SpawnSyncReturns<string> {
  const prompt = readFileSync(join(here, "prompts", promptFile), "utf8").trim();
  return spawnSync("kimi", ["-p", prompt, "--output-format", "stream-json"], {
    cwd,
    encoding: "utf8",
    timeout: KIMI_TIMEOUT_MS,
    stdio: ["ignore", "pipe", "pipe"],
  });
}

/** stream-json 行から assistant content を抽出する（S2 rerun で確認済みの line-JSON 形式）。 */
function assistantContent(stdout: string): string {
  const parts: string[] = [];
  for (const line of stdout.split(/\r?\n/)) {
    if (!line.trim()) continue;
    try {
      const obj = JSON.parse(line) as { role?: string; content?: unknown };
      if (obj.role !== "assistant") continue;
      if (typeof obj.content === "string") parts.push(obj.content);
      else if (Array.isArray(obj.content)) {
        for (const block of obj.content) {
          if (block && typeof block === "object" && typeof (block as { text?: unknown }).text === "string") {
            parts.push((block as { text: string }).text);
          }
        }
      }
    } catch {
      // stream-json 以外の行（meta 等の破損行）は無視する。
    }
  }
  return parts.join("\n");
}

function extractCodeBlock(content: string): string | null {
  const match = content.match(/```(?:typescript|ts)\n([\s\S]*?)```/);
  return match ? match[1] : null;
}

/** 実体化した module 群を repo の tsx で実行し、stdout marker で判定する。 */
function runTsx(dir: string, entry: string): SpawnSyncReturns<string> {
  return spawnSync(
    "npx",
    ["--prefix", repoRoot, "--no-install", "tsx", join(dir, entry)],
    { encoding: "utf8", timeout: 60_000, cwd: dir },
  );
}

interface TaskResult {
  task: string;
  pass: boolean;
  detail: string;
  exit_code: number | null;
  stdout_file: string;
  stdout_sha256: string;
  stderr_sha256: string;
  fs_diff: string[];
  extra: Record<string, unknown>;
}

const results: TaskResult[] = [];

function runTask(
  name: string,
  promptFile: string,
  judge: (content: string, scratch: string) => { pass: boolean; detail: string; extra: Record<string, unknown> },
): void {
  const scratch = mkdtempSync(join(tmpdir(), `helix-kimi-s4-${name}-`));
  try {
    const before = snapshotDir(scratch);
    const run = runKimi(promptFile, scratch);
    const diff = fsDiff(before, snapshotDir(scratch));
    const stdout = run.stdout ?? "";
    const stdoutFile = `${name}.stdout.txt`;
    writeFileSync(join(outDir, stdoutFile), stdout);
    writeFileSync(join(outDir, `${name}.stderr.txt`), run.stderr ?? "");
    let pass = false;
    let detail = "";
    let extra: Record<string, unknown> = {};
    if (run.status !== 0) {
      detail = `kimi exit ${run.status}`;
    } else if (diff.length > 0) {
      detail = "scope violation: FS changed";
    } else {
      const judged = judge(assistantContent(stdout), scratch);
      pass = judged.pass;
      detail = judged.detail;
      extra = judged.extra;
    }
    results.push({
      task: name,
      pass,
      detail,
      exit_code: run.status,
      stdout_file: stdoutFile,
      stdout_sha256: sha256(stdout),
      stderr_sha256: sha256(run.stderr ?? ""),
      fs_diff: diff,
      extra,
    });
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
}

const FORMAT_ASSERTIONS = [
  'import { formatDurationMs } from "./format-duration";',
  'if (formatDurationMs(0) !== "0h 00m 00s") throw new Error("zero");',
  'if (formatDurationMs(3723000) !== "1h 02m 03s") throw new Error("hms");',
  'if (formatDurationMs(59999) !== "0h 00m 59s") throw new Error("floor");',
  'if (formatDurationMs(36000000) !== "10h 00m 00s") throw new Error("nopad-h");',
  "let threw = false;",
  "try { formatDurationMs(-1); } catch (error) { threw = error instanceof RangeError; }",
  'if (!threw) throw new Error("negative");',
  "threw = false;",
  "try { formatDurationMs(1.5); } catch (error) { threw = error instanceof RangeError; }",
  'if (!threw) throw new Error("non-integer");',
  'process.stdout.write("TASK1-PASS");',
].join("\n");

function judgeCodegen(content: string): { pass: boolean; detail: string; extra: Record<string, unknown> } {
  const code = extractCodeBlock(content);
  if (!code) return { pass: false, detail: "no typescript code block", extra: {} };
  const dir = mkdtempSync(join(tmpdir(), "helix-kimi-s4-verify1-"));
  try {
    writeFileSync(join(dir, "format-duration.ts"), code);
    writeFileSync(join(dir, "verify.ts"), FORMAT_ASSERTIONS);
    const verify = runTsx(dir, "verify.ts");
    const pass = verify.status === 0 && (verify.stdout ?? "").includes("TASK1-PASS");
    const skillMarkers = {
      named_export: /export function formatDurationMs/.test(code),
      no_any: !/\bany\b/.test(code),
      jsdoc: /\/\*\*[\s\S]*?\*\/\s*export function/.test(code),
      range_error_message: /RangeError\((["'`])formatDurationMs:/.test(code),
    };
    return {
      pass,
      detail: pass ? "TASK1-PASS (6 assertions)" : `verify failed: ${(verify.stderr ?? "").slice(0, 200)}`,
      extra: { skill_markers: skillMarkers },
    };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

runTask("task1a-codegen-plain", "task1-codegen-plain.txt", (content) => judgeCodegen(content));
runTask("task1b-codegen-skill", "task1-codegen-skill.txt", (content) => judgeCodegen(content));

runTask("task2-bugfix", "task2-bugfix.txt", (content) => {
  const code = extractCodeBlock(content);
  if (!code) return { pass: false, detail: "no typescript code block", extra: {} };
  const dir = mkdtempSync(join(tmpdir(), "helix-kimi-s4-verify2-"));
  try {
    writeFileSync(join(dir, "paginate.ts"), code);
    writeFileSync(
      join(dir, "verify.ts"),
      [
        'import { paginate } from "./paginate";',
        "const a = paginate([1, 2, 3, 4, 5], 1, 2);",
        'if (a.items.join(",") !== "3,4" || a.totalPages !== 3) throw new Error("page1");',
        "const b = paginate([], 0, 2);",
        'if (b.items.length !== 0 || b.totalPages !== 0) throw new Error("empty");',
        "const c = paginate([1, 2, 3], 0, 2);",
        'if (c.items.join(",") !== "1,2" || c.totalPages !== 2) throw new Error("page0");',
        "let threw = false;",
        "try { paginate([1], 5, 1); } catch (error) { threw = error instanceof RangeError; }",
        'if (!threw) throw new Error("out-of-range kept");',
        "threw = false;",
        "try { paginate([1], 0, 0); } catch (error) { threw = error instanceof RangeError; }",
        'if (!threw) throw new Error("pageSize kept");',
        'process.stdout.write("TASK2-PASS");',
      ].join("\n"),
    );
    const verify = runTsx(dir, "verify.ts");
    const pass = verify.status === 0 && (verify.stdout ?? "").includes("TASK2-PASS");
    return {
      pass,
      detail: pass ? "TASK2-PASS (5 assertions)" : `verify failed: ${(verify.stderr ?? "").slice(0, 200)}`,
      extra: {},
    };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

const REFERENCE_MEDIAN = [
  "export function median(values: number[]): number {",
  '  if (values.length === 0) throw new RangeError("median: empty input");',
  "  const sorted = [...values].sort((a, b) => a - b);",
  "  const mid = Math.floor(sorted.length / 2);",
  "  return sorted.length % 2 === 1 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;",
  "}",
].join("\n");

/** 既知 mutant 4 種。良い test suite ならすべて fail（= kill）するはず。 */
const MEDIAN_MUTANTS: Record<string, string> = {
  "no-sort": REFERENCE_MEDIAN.replace(".sort((a, b) => a - b)", ""),
  "wrong-mid": REFERENCE_MEDIAN.replace("Math.floor(sorted.length / 2)", "Math.ceil(sorted.length / 2)"),
  "no-empty-guard": REFERENCE_MEDIAN.replace(
    '  if (values.length === 0) throw new RangeError("median: empty input");',
    "",
  ),
  "no-average": REFERENCE_MEDIAN.replace("(sorted[mid - 1] + sorted[mid]) / 2", "sorted[mid]"),
};

runTask("task3-tests-mutation", "task3-tests.txt", (content) => {
  const testCode = extractCodeBlock(content);
  if (!testCode) return { pass: false, detail: "no typescript code block", extra: {} };
  writeFileSync(join(outDir, "task3-proposed-tests.ts.txt"), testCode);
  const runSuite = (medianSource: string): boolean => {
    const dir = mkdtempSync(join(tmpdir(), "helix-kimi-s4-verify3-"));
    try {
      writeFileSync(join(dir, "median.ts"), medianSource);
      writeFileSync(join(dir, "median-tests.ts"), testCode);
      const run = runTsx(dir, "median-tests.ts");
      return run.status === 0 && (run.stdout ?? "").includes("MEDIAN-TESTS-PASS");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  };
  const greenOnReference = runSuite(REFERENCE_MEDIAN);
  const kills: Record<string, boolean> = {};
  for (const [name, source] of Object.entries(MEDIAN_MUTANTS)) {
    kills[name] = !runSuite(source);
  }
  const killCount = Object.values(kills).filter(Boolean).length;
  const pass = greenOnReference && killCount === Object.keys(MEDIAN_MUTANTS).length;
  return {
    pass,
    detail: greenOnReference
      ? `mutation kill ${killCount}/${Object.keys(MEDIAN_MUTANTS).length}`
      : "suite not green on reference implementation",
    extra: { green_on_reference: greenOnReference, mutant_kills: kills },
  };
});

const kimiVersion = execFileSync("kimi", ["--version"], { encoding: "utf8" }).trim();
const kimiPath = execFileSync("which", ["kimi"], { encoding: "utf8" }).trim();
const kimiBinaryDigest = sha256(readFileSync(kimiPath));

const promptDigests = Object.fromEntries(
  readdirSync(join(here, "prompts"))
    .filter((name) => statSync(join(here, "prompts", name)).isFile())
    .map((name) => [name, sha256(readFileSync(join(here, "prompts", name)))]),
);

const summary = {
  plan_id: "PLAN-DISCOVERY-13-kimi-worker-cli-poc",
  github_issue_id: 51,
  bench: "docs/research/assets/kimi-s4-bench-2026-08-08/bench/run-s4-bench.ts",
  contract_surface: "stream-json",
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

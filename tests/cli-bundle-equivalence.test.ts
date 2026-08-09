import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  assertRootAnchorCompatible,
  ensureCliBundle,
  ensureHookBundle,
  ensureRootProbeBundle,
} from "./tools/cli-bundle";

// PLAN-RECOVERY-39-spawn-bundle-rollout (Issue #93) / U-CLIBUNDLE-001。
//
// spawn 系テストの多くは tsx 起動から esbuild bundle 起動へ移した（1 spawn ごとの transpile を
// 払わないため）。この置換は「bundle が tsx と同じ振る舞いをする」ことに依存しており、
// 依存しているだけでは drift に気づけない。ここで両経路を同一入力で走らせ、
// exit code と出力の一致を恒久的に固定する。
//
// 実運用（.claude/settings.json）の hook 起動は tsx のままである。ただし
// `.claude/hooks/git-command-guard.ts` を実プロセスとして tsx で起動する suite は本 slice の
// 変換後ここだけになるため、その tsx 経路の被覆は他 suite ではなく **本 oracle が担う**。
//
// 本 oracle は実際に発散を検出した実績を持つ: node_modules が別 repo への symlink である
// git worktree で、bundle の ROOT がリンク先 repo へ解決され、hook がリンク先の
// `.helix/state/` marker を読んで tsx と異なる判定を返した。修正は
// `tests/tools/cli-bundle.ts` の build 時 ROOT anchor 固定。

const repoRoot = process.cwd();
const CLI_BUNDLE = ensureCliBundle(repoRoot);
const HOOK_BUNDLE = ensureHookBundle(repoRoot, "git-command-guard");
const SPAWN_TIMEOUT_MS = 60_000;

function viaTsx(args: string[], options: { cwd: string; input?: string }) {
  return spawnSync("npx", ["--prefix", repoRoot, "--no-install", "tsx", ...args], {
    cwd: options.cwd,
    encoding: "utf8",
    input: options.input,
    env: { ...process.env, HELIX_SKIP_UPDATE_CHECK: "1", NODE_NO_WARNINGS: "1" },
    timeout: SPAWN_TIMEOUT_MS,
  });
}

function viaBundle(bundle: string, args: string[], options: { cwd: string; input?: string }) {
  return spawnSync(process.execPath, [bundle, ...args], {
    cwd: options.cwd,
    encoding: "utf8",
    input: options.input,
    env: { ...process.env, HELIX_SKIP_UPDATE_CHECK: "1", NODE_NO_WARNINGS: "1" },
    timeout: SPAWN_TIMEOUT_MS,
  });
}

describe("cli bundle equivalence (PLAN-RECOVERY-39)", () => {
  it("U-CLIBUNDLE-001: bundle 起動は tsx 起動と exit code / 出力が一致する", () => {
    // CLI 経路: 決定的で外部 I/O に依存しない surface を選ぶ
    const cliArgs = ["task", "classify", "--text", "fix login bug", "--json"];
    const tsxCli = viaTsx([join(repoRoot, "src", "cli.ts"), ...cliArgs], { cwd: repoRoot });
    const bundleCli = viaBundle(CLI_BUNDLE, cliArgs, { cwd: repoRoot });
    expect(tsxCli.status, `tsx stderr: ${tsxCli.stderr}`).toBe(0);
    expect(bundleCli.status, `bundle stderr: ${bundleCli.stderr}`).toBe(tsxCli.status);
    expect(JSON.parse(bundleCli.stdout)).toEqual(JSON.parse(tsxCli.stdout));

    // hook 経路: fail-close（malformed stdin）だけでなく **破壊的コマンド検出の代表シナリオ** と
    // **通過シナリオ** も突き合わせ、判定ロジック本体が tsx 経路でも等価に働くことを固定する。
    // 破壊的シナリオは ROOT 依存（override marker の探索先）を通るため、ROOT anchor の
    // 退行をここで捕まえられる。
    const hookScenarios: { label: string; input: string }[] = [
      { label: "malformed stdin", input: "{not-json" },
      {
        label: "destructive git blocked",
        input: JSON.stringify({
          session_id: "s-equiv-block",
          tool_input: { command: "git clean -f" },
        }),
      },
      {
        label: "non-destructive git passes",
        input: JSON.stringify({
          session_id: "s-equiv-pass",
          tool_input: { command: "git status --short" },
        }),
      },
    ];
    const hookEntry = join(repoRoot, ".claude", "hooks", "git-command-guard.ts");
    for (const scenario of hookScenarios) {
      // cwd を repo 外の一時 dir にし、repoRoot 解決が cwd ではなく ROOT 導出に依存する状態で比較する。
      const cwd = mkdtempSync(join(tmpdir(), "helix-bundle-equiv-"));
      try {
        const options = { cwd, input: scenario.input };
        const tsxHook = viaTsx([hookEntry], options);
        const bundleHook = viaBundle(HOOK_BUNDLE, [], options);
        expect(bundleHook.status, scenario.label).toBe(tsxHook.status);
        expect(bundleHook.stdout, scenario.label).toBe(tsxHook.stdout);
        expect(bundleHook.stderr, scenario.label).toBe(tsxHook.stderr);
      } finally {
        rmSync(cwd, { recursive: true, force: true });
      }
    }
  });

  it("U-CLIBUNDLE-001: bundle の ROOT 導出は物理配置に依らず呼び出し元 repoRoot に一致する", () => {
    // 実 CLI / hook の出力からは ROOT を直接読めないため専用プローブで観測する。
    // node_modules が別 repo への symlink である git worktree でも、リンク先ではなく
    // repoRoot を指すことがここで固定される。cwd を repo 外に置き、cwd からの推定に頼れなくする。
    const probeEntry = join(repoRoot, "tests", "tools", "bundle-root-probe.ts");
    const cwd = mkdtempSync(join(tmpdir(), "helix-bundle-root-"));
    try {
      const options = { cwd };
      const bundled = viaBundle(ensureRootProbeBundle(repoRoot), [], options);
      expect(bundled.status, `probe stderr: ${bundled.stderr}`).toBe(0);
      const observed = JSON.parse(bundled.stdout) as { root: string; entities: number };
      expect(observed.root).toBe(repoRoot);

      // define は依存 module の import.meta.url も置換するため、entry の ROOT だけでなく
      // 実 ROOT 依存 lint module（src/lint/entity-coverage）の結果も tsx 起動と突き合わせる。
      const direct = viaTsx([probeEntry], options);
      expect(direct.status, `tsx stderr: ${direct.stderr}`).toBe(0);
      expect(observed).toEqual(JSON.parse(direct.stdout));
      expect(observed.entities).toBeGreaterThan(0);
    } finally {
      rmSync(cwd, { recursive: true, force: true });
    }
  });

  it("U-CLIBUNDLE-001: ROOT anchor と両立しない深さの module は build 時に拒否される", () => {
    // anchor は「2 階層下」という単一の深さしか表現できない。別の深さの module が
    // import.meta.url を使うと、その module だけ無音で ROOT を誤る。allowlist 外の違反は
    // build を落として気づけること（fail-close）をここで固定する。
    expect(() =>
      assertRootAnchorCompatible(repoRoot, ["src/lint/entity-coverage.ts"]),
    ).not.toThrow();
    expect(() => assertRootAnchorCompatible(repoRoot, ["src/cli.ts"])).not.toThrow();
    expect(() => assertRootAnchorCompatible(repoRoot, ["src/setup/update-check.ts"])).not.toThrow();

    // 深さ 3 かつ allowlist 外: 拒否し、どの module が問題かをメッセージに含める。
    expect(() =>
      assertRootAnchorCompatible(repoRoot, ["tests/tools/root-anchor-fixtures/depth-violation.ts"]),
    ).toThrow(/depth-violation\.ts \(depth=3\)/);

    // import.meta.url を使わない module は深さに関わらず対象外。
    expect(() => assertRootAnchorCompatible(repoRoot, ["package.json"])).not.toThrow();
    // node_modules 配下は検査対象外（外部依存の深さは制御できない）。
    expect(() =>
      assertRootAnchorCompatible(repoRoot, ["node_modules/some-dep/dist/index.js"]),
    ).not.toThrow();

    // 想定外の入力を「読めないので skip」で通さない。それは本 guard が塞ぐ失敗そのもの。
    expect(() => assertRootAnchorCompatible(repoRoot, ["src/does-not-exist.ts"])).toThrow(
      /読めなかった/,
    );
    expect(() => assertRootAnchorCompatible(repoRoot, ["/abs/elsewhere/mod.ts"])).toThrow(
      /repoRoot 相対として解釈できない/,
    );
    expect(() => assertRootAnchorCompatible(repoRoot, ["../outside/mod.ts"])).toThrow(
      /repoRoot 相対として解釈できない/,
    );
    // 途中に `..` を含むキーも深さを数えられないため拒否する（先頭だけを見ない）。
    expect(() => assertRootAnchorCompatible(repoRoot, ["src/../src/cli.ts"])).toThrow(
      /repoRoot 相対として解釈できない/,
    );
  });

  it("U-CLIBUNDLE-001: bundle は entrypoint ごとに別成果物として生成される", () => {
    // 同一 cache dir へ書くため、名前衝突で hook と CLI が取り違えられないことを固定する。
    expect(CLI_BUNDLE).not.toBe(HOOK_BUNDLE);
    expect(CLI_BUNDLE.endsWith("cli.mjs")).toBe(true);
    expect(HOOK_BUNDLE.endsWith("hook-git-command-guard.mjs")).toBe(true);
  });
});

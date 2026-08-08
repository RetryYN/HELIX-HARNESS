import { mkdirSync, readFileSync, renameSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { pathToFileURL } from "node:url";
import { buildSync } from "esbuild";

// spawn 系テストが 1 spawn ごとに tsx transpile を払うと、spawn 数の多い suite
// (例: cli-surface, git-command-guard) だけで数十秒〜数分を消費する (#93)。
// ここで entrypoint を 1 回だけ esbuild bundle し、子 process は node で直接起動する。
//
// ROOT 導出: `src/<dir>/<file>.ts` と `.claude/hooks/<file>.ts` の各 module は
// `ROOT = dirname(fileURLToPath(import.meta.url))/../..` で repo root を導出する。
//
// これを bundle の **物理配置**に依存させてはならない。`fileURLToPath` は symlink を解決した
// 実体 path を返すため、git worktree のように `node_modules` が別 repo への symlink である環境では、
// node_modules 配下へ置いた bundle の ROOT が **リンク先 repo** を指す。実測（U-CLIBUNDLE-001）では
// hook bundle がリンク先 repo の `.helix/state/` marker を読み、tsx 起動と異なる判定を返した。
// これは worktree 開発時のクロスツリー汚染であり、置き場所を変えても直らない
// （`.helix/cache/` は runtime state を、`tests/` 配下は test inventory 走査を乱して別途破綻した）。
//
// そこで `import.meta.url` を **build 時に論理 repoRoot 基準の合成 path へ固定**する。
// bundle が物理的にどこへ置かれ、その path が symlink を経由していても、ROOT は常に
// 呼び出し元が渡した repoRoot に解決される。深さ 2 階層は BUNDLE_ROOT_ANCHOR が担保する。
//
// anchor に outfile 自身の名前を使わないのは、`src/doctor/l3-g3-logical-db-receipt.ts` が
// `process.argv[1] === fileURLToPath(import.meta.url)` で自己実行を判定しているため。
// 同一文字列にすると CLI bundle 起動のたびに receipt 出力が誤発火する。
//
// **重要**: esbuild の `define` は entry だけでなく、bundle される **全 module** の
// `import.meta.url` を無差別にテキスト置換する。したがって anchor が正しく機能するのは
// 「bundle 対象の repo-local module が全て repoRoot から 2 階層下に在る」という前提の上である。
// この前提を prose に留めず `assertRootAnchorCompatible` で build 時に機械検査し、
// 違反する module が import graph へ入ったら無音で壊れる代わりに build を落とす。
//
// 意図的に staleness cache を持たない: 1 bundle あたり約 80-105ms（実測）であり、
// mtime 判定を誤ると「古い成果物を実行して green」という最悪の失敗モードを招く。
// 節約できる時間（数百 ms）に対して危険が釣り合わない。
/**
 * ROOT anchor は「2 階層下」という 1 つの深さしか表現できない。異なる深さの module が
 * `import.meta.url` を使っていると、その module だけ ROOT を誤る（しかも無音で）。
 *
 * 既知の例外だけを allowlist し、それ以外の違反は build 時に落とす。allowlist へ追加するときは
 * 「その module が bundle 経由で ROOT に依存しない」ことを確認した理由をここに書くこと。
 */
const ROOT_ANCHOR_DEPTH_EXCEPTIONS: ReadonlyMap<string, string> = new Map([
  [
    "src/cli.ts",
    // depth 1。`new URL("./web/index.ts", import.meta.url)` による read-only share の
    // 動的 import にのみ使う。この経路は bundle 化前から bundle 経由では解決できず
    // （成果物の隣に web/ は無い）、本 anchor 導入で状況は変わっていない。
    // bundle を使うテストはこの surface を叩かない。
    "relative dynamic import only; unreachable via bundle before and after the anchor",
  ],
]);

export function assertRootAnchorCompatible(repoRoot: string, inputs: readonly string[]): void {
  const violations: string[] = [];
  for (const input of inputs) {
    const rel = relative(repoRoot, join(repoRoot, input));
    if (rel.startsWith("..") || rel.includes(`node_modules${sep}`)) continue;
    const key = rel.split(sep).join("/");
    if (ROOT_ANCHOR_DEPTH_EXCEPTIONS.has(key)) continue;
    let source: string;
    try {
      source = readFileSync(join(repoRoot, rel), "utf8");
    } catch {
      continue;
    }
    if (!source.includes("import.meta.url")) continue;
    const depth = rel.split(sep).length - 1;
    if (depth !== 2) violations.push(`${key} (depth=${depth})`);
  }
  if (violations.length > 0) {
    throw new Error(
      "bundle ROOT anchor incompatible: import.meta.url を使う module が repoRoot から 2 階層下に無い。" +
        " anchor は単一の深さしか表現できないため、この module は bundle 経由で ROOT を誤る。" +
        ` 該当: ${violations.join(", ")}。` +
        " 対処: module を 2 階層下へ置くか、ROOT 非依存であることを確認して" +
        " ROOT_ANCHOR_DEPTH_EXCEPTIONS へ理由付きで追加する。",
    );
  }
}

function ensureBundle(repoRoot: string, entryPoint: string, name: string): string {
  const cacheDir = join(repoRoot, "node_modules", ".helix-cli-cache");
  const outfile = join(cacheDir, `${name}.mjs`);
  const staging = join(cacheDir, `${name}-${process.pid}.tmp.mjs`);
  // repoRoot から 2 階層下の合成 path。実在させる必要はなく、深さだけが意味を持つ。
  const rootAnchor = join(
    repoRoot,
    "node_modules",
    ".helix-cli-cache",
    "__helix_root_anchor__.mjs",
  );
  mkdirSync(cacheDir, { recursive: true });
  const result = buildSync({
    entryPoints: [entryPoint],
    outfile: staging,
    bundle: true,
    platform: "node",
    format: "esm",
    packages: "external",
    define: { "import.meta.url": JSON.stringify(pathToFileURL(rootAnchor).href) },
    metafile: true,
    logLevel: "silent",
  });
  assertRootAnchorCompatible(repoRoot, Object.keys(result.metafile.inputs));
  renameSync(staging, outfile);
  return outfile;
}

/**
 * ROOT 導出プローブの bundle path。bundle 化した成果物が自分の repo root をどこと解決するかを
 * 直接観測するためのもので、U-CLIBUNDLE-001 以外から使わない。
 */
export function ensureRootProbeBundle(repoRoot: string): string {
  return ensureBundle(
    repoRoot,
    join(repoRoot, "tests", "tools", "bundle-root-probe.ts"),
    "bundle-root-probe",
  );
}

/** `src/cli.ts` の bundle path（子 process は `node <path> <args>` で起動する）。 */
export function ensureCliBundle(repoRoot: string): string {
  return ensureBundle(repoRoot, join(repoRoot, "src", "cli.ts"), "cli");
}

/**
 * `.claude/hooks/<hook>.ts` の bundle path。hook は repoRoot を
 * `CLAUDE_PROJECT_DIR ?? here/../..` で導出するため、build 時に固定した ROOT anchor と
 * env 明示の双方で fixture root を指せる。
 */
export function ensureHookBundle(repoRoot: string, hook: string): string {
  return ensureBundle(repoRoot, join(repoRoot, ".claude", "hooks", `${hook}.ts`), `hook-${hook}`);
}

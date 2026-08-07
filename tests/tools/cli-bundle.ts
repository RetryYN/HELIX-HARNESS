import { mkdirSync, renameSync } from "node:fs";
import { join } from "node:path";
import { buildSync } from "esbuild";

// CLI spawn 系テストが 1 spawn ごとに tsx transpile を払うと、spawn 数の多い suite
// (例: cli-surface) だけで数分を消費する (#93)。ここで CLI を 1 回だけ esbuild bundle し、
// 子 process は node で直接起動する。
//
// 配置制約: bundle は repo 直下から見て「2 階層下」に置かなければならない。
// src/<dir>/<file>.ts の各 module は import.meta.url から ROOT = HERE/../.. で
// repo root を導出しており、bundle 内でも import.meta.url は bundle の実 path になるため、
// src と同じ深さ (node_modules/.helix-cli-cache/) に置くことで ROOT 導出と
// node_modules 解決 (packages: external) の両方を保つ。
export function ensureCliBundle(repoRoot: string): string {
  const cacheDir = join(repoRoot, "node_modules", ".helix-cli-cache");
  const outfile = join(cacheDir, "cli.mjs");
  const staging = join(cacheDir, `cli-${process.pid}.tmp.mjs`);
  mkdirSync(cacheDir, { recursive: true });
  buildSync({
    entryPoints: [join(repoRoot, "src", "cli.ts")],
    outfile: staging,
    bundle: true,
    platform: "node",
    format: "esm",
    packages: "external",
    logLevel: "silent",
  });
  renameSync(staging, outfile);
  return outfile;
}

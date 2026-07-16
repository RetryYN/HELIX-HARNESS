import { chmodSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { build } from "esbuild";

const repoRoot = process.cwd();
const outputPath = resolve(repoRoot, "dist/helix");

mkdirSync(resolve(repoRoot, "dist"), { recursive: true });

await build({
  entryPoints: [resolve(repoRoot, "src/cli.ts")],
  outfile: outputPath,
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node24",
  packages: "external",
  sourcemap: false,
  legalComments: "none",
  logLevel: "info",
});

if (process.platform !== "win32") chmodSync(outputPath, 0o755);

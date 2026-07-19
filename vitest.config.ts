import { defineConfig } from "vitest/config";

// 子processがfixture cwdへ移動しても、repoでpinしたtsxだけを使う。
const repoRoot = process.cwd();
process.env.npm_config_prefix = repoRoot;

export default defineConfig({
  test: {
    pool: "forks",
    poolOptions: {
      forks: {
        minForks: 1,
        maxForks: 1,
      },
    },
    testTimeout: 180_000,
    hookTimeout: 60_000,
    teardownTimeout: 30_000,
    coverage: {
      reporter: ["text", "html", "clover", "json-summary"],
    },
  },
});

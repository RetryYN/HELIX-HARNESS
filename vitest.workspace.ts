import { configDefaults, defineWorkspace } from "vitest/config";

// fixture cwdへ移動する子processも、repoでpinしたtsxをPATHから解決する。
// npm prefixはVitest workspace discovery自体を変えるため上書きしない。
process.env.PATH = `${process.cwd()}/node_modules/.bin:${process.env.PATH ?? ""}`;

const commonTestConfig = {
  pool: "forks" as const,
  poolOptions: {
    forks: {
      minForks: 1,
      maxForks: 1,
    },
  },
  testTimeout: 180_000,
  hookTimeout: 60_000,
  teardownTimeout: 30_000,
};

export default defineWorkspace([
  {
    test: {
      ...commonTestConfig,
      name: "fast",
      exclude: [...configDefaults.exclude, "tests/slow/**"],
    },
  },
  {
    test: {
      ...commonTestConfig,
      name: "slow",
      include: ["tests/slow/**/*.test.ts"],
      exclude: configDefaults.exclude,
    },
  },
]);

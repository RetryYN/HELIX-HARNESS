import { configDefaults, defineWorkspace } from "vitest/config";

// `--project` execution loads this workspace directly. Keep child fixture CLIs
// bound to the repository-pinned tsx even after their cwd moves to a temp repo.
process.env.npm_config_prefix = process.cwd();

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

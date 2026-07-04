import { defineConfig } from "vitest/config";

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

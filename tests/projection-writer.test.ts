import { existsSync } from "node:fs";
import { expect, it } from "vitest";

// Historical PLAN citations remain bound to this path. The executable 30-oracle suite moved to
// tests/slow/projection-writer.test.ts so the fast project does not execute heavyweight DB rebuilds.
it("keeps historical projection-writer citations bound to the executable slow suite", () => {
  expect(existsSync("tests/slow/projection-writer.test.ts")).toBe(true);
});

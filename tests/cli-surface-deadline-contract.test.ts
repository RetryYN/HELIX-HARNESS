import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(join(process.cwd(), "tests", "cli-surface.test.ts"), "utf8");

describe("CLI surface deadline budget contract", () => {
  it("U-CLI-SKILL-DEADLINE-003: test wrapper remains bounded above the child deadline", () => {
    const child = source.match(/const CLI_CHILD_TIMEOUT_MS = ([\d_]+);/);
    const margin = source.match(
      /const CLI_CHILD_TEST_WRAPPER_TIMEOUT_MS = CLI_CHILD_TIMEOUT_MS \+ ([\d_]+);/,
    );

    expect(child, "child deadline declaration must remain observable").not.toBeNull();
    expect(margin, "wrapper deadline must derive from child deadline").not.toBeNull();
    expect(Number(child?.[1].replaceAll("_", ""))).toBe(45_000);
    expect(Number(margin?.[1].replaceAll("_", ""))).toBeGreaterThan(0);
    expect(source.match(/}, CLI_CHILD_TEST_WRAPPER_TIMEOUT_MS\);/g)).toHaveLength(2);
  });
});

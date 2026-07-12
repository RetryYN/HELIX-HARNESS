import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { walkFiles } from "../src/shared/file-walk";

describe("recursive file walk SSoT (PLAN-L7-433 Q7)", () => {
  it("U-FWALK-001: nested extension filter・安定順・POSIX relative pathを保証する", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-file-walk-"));
    try {
      mkdirSync(join(root, "docs", "z"), { recursive: true });
      mkdirSync(join(root, "docs", "a"), { recursive: true });
      writeFileSync(join(root, "docs", "z", "b.md"), "b");
      writeFileSync(join(root, "docs", "a", "a.md"), "a");
      writeFileSync(join(root, "docs", "a", "skip.txt"), "skip");
      expect(walkFiles(join(root, "docs"), root, [".md"]).map((file) => file.relativePath)).toEqual(
        ["docs/a/a.md", "docs/z/b.md"],
      );
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});

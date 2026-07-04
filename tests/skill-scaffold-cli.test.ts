import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const repoRoot = process.cwd();
const cliPath = join(repoRoot, "src", "cli.ts");

function runCliIn(cwd: string, args: string[]) {
  if (process.platform === "win32") {
    const cmdExe = join(process.env.SystemRoot ?? "C:\\Windows", "System32", "cmd.exe");
    return spawnSync(cmdExe, ["/d", "/c", "bun", cliPath, ...args], {
      cwd,
      encoding: "utf8",
    });
  }
  return spawnSync("bun", [cliPath, ...args], { cwd, encoding: "utf8" });
}

describe("skill create CLI", () => {
  it("emits a skill.v1 scaffold as JSON without writing by default", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-skill-create-dry-"));
    try {
      const run = runCliIn(root, [
        "skill",
        "create",
        "--name",
        "Quality Review",
        "--category",
        "quality-gate-review",
        "--layers",
        "L7,L8",
        "--drive-models",
        "Forward,Reverse",
        "--domain-tags",
        "review,gate",
        "--json",
      ]);

      expect(run.status, run.stderr || run.stdout).toBe(0);
      const payload = JSON.parse(run.stdout);
      expect(payload).toMatchObject({
        ok: true,
        path: "docs/skills/quality-review.md",
        written: false,
      });
      expect(payload.content).toContain("schema_version: skill.v1");
      expect(existsSync(join(root, "docs", "skills", "quality-review.md"))).toBe(false);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("writes the scaffold with --write and refuses overwrite without --force", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-skill-create-write-"));
    try {
      const args = [
        "skill",
        "create",
        "--name",
        "Quality Review",
        "--category",
        "quality-gate-review",
        "--layers",
        "L7",
        "--drive-models",
        "Forward",
        "--write",
        "--json",
      ];
      const first = runCliIn(root, args);
      expect(first.status, first.stderr || first.stdout).toBe(0);
      const path = join(root, "docs", "skills", "quality-review.md");
      expect(readFileSync(path, "utf8")).toContain("skill_type: \"quality-gate-review\"");

      const second = runCliIn(root, args);
      expect(second.status).toBe(1);
      const payload = JSON.parse(second.stdout);
      expect(payload).toMatchObject({
        ok: false,
        written: false,
        error: "skill create refused to overwrite existing file: docs/skills/quality-review.md",
      });
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});

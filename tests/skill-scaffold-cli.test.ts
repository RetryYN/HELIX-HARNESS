import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const repoRoot = process.cwd();
const cliPath = join(repoRoot, "src", "cli.ts");

function runCliIn(cwd: string, args: string[]) {
  if (process.platform === "win32") {
    const cmdExe = join(process.env.SystemRoot ?? "C:\\Windows", "System32", "cmd.exe");
    return spawnSync(
      cmdExe,
      ["/d", "/c", "npx", "--prefix", repoRoot, "--no-install", "tsx", cliPath, ...args],
      {
        cwd,
        encoding: "utf8",
      },
    );
  }
  return spawnSync("npx", ["--prefix", repoRoot, "--no-install", "tsx", cliPath, ...args], {
    cwd,
    encoding: "utf8",
  });
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
      expect(payload.nextActions).toEqual([
        expect.stringContaining("SKILL_MAP trigger table"),
        expect.stringContaining("helix doctor は red"),
      ]);
      expect(payload.content).toContain("schema_version: skill.v1");
      expect(existsSync(join(root, "docs", "skills", "quality-review.md"))).toBe(false);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("prints the required catalog registration and doctor-red guidance in text mode", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-skill-create-guide-"));
    try {
      const run = runCliIn(root, [
        "skill",
        "create",
        "--name",
        "Incident Drill",
        "--category",
        "process",
        "--layers",
        "L12",
        "--drive-models",
        "Incident",
      ]);

      expect(run.status, run.stderr || run.stdout).toBe(0);
      expect(run.stdout).toContain("next: SKILL_MAP trigger table");
      expect(run.stdout).toContain("helix doctor は red");
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
      expect(readFileSync(path, "utf8")).toContain('skill_type: "quality-gate-review"');

      const second = runCliIn(root, args);
      expect(second.status).toBe(1);
      const payload = JSON.parse(second.stdout);
      expect(payload).toMatchObject({
        ok: false,
        written: false,
      });
      expect(payload.findings).toEqual(
        expect.arrayContaining([expect.objectContaining({ field: "duplicate-slug" })]),
      );
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("blocks a catalog slug collision before --write, including with --force", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-skill-create-collision-"));
    try {
      const skillDir = join(root, "docs", "skills");
      const existing = join(skillDir, "quality-review.md");
      mkdirSync(skillDir, { recursive: true });
      writeFileSync(existing, "existing pack must remain unchanged\n", "utf8");
      const run = runCliIn(root, [
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
        "--force",
        "--json",
      ]);

      expect(run.status, run.stderr || run.stdout).toBe(1);
      const payload = JSON.parse(run.stdout);
      expect(payload.ok).toBe(false);
      expect(payload.written).toBe(false);
      expect(payload.findings).toEqual(
        expect.arrayContaining([expect.objectContaining({ field: "duplicate-slug" })]),
      );
      expect(readFileSync(existing, "utf8")).toBe("existing pack must remain unchanged\n");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});

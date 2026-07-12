import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { readPackageVersion, readRepoHeadSha } from "../src/shared/repo-info";

describe("PLAN-L7-433 Q5 repo info SSoT", () => {
  it("U-REPOINFO-001: returns only a canonical 40-hex git HEAD", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-repo-info-"));
    execFileSync("git", ["init", "-q"], { cwd: root });
    writeFileSync(join(root, "x"), "x");
    execFileSync("git", ["add", "x"], { cwd: root });
    execFileSync(
      "git",
      ["-c", "user.name=t", "-c", "user.email=t@example.invalid", "commit", "-qm", "x"],
      { cwd: root },
    );
    expect(readRepoHeadSha(root)).toMatch(/^[a-f0-9]{40}$/);
    expect(readRepoHeadSha(join(root, "missing"))).toBeNull();
  });

  it("U-REPOINFO-002: trims a package version and rejects empty or invalid JSON", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-package-info-"));
    writeFileSync(join(root, "package.json"), JSON.stringify({ version: " 1.2.3 " }));
    expect(readPackageVersion(root)).toBe("1.2.3");
    writeFileSync(join(root, "package.json"), JSON.stringify({ version: " " }));
    expect(readPackageVersion(root)).toBeNull();
    writeFileSync(join(root, "package.json"), "{");
    expect(readPackageVersion(root)).toBeNull();
  });
});

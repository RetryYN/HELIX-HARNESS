import { execFileSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const LEGACY_REPOSITORY_NAME_PATTERN = /UT[-_]TDD[_-]AGENT[_-]HARNESS(?:[-_]Pack)?/i;
const SKIP_DIRECTORIES = new Set([".git", "node_modules", "dist"]);

function trackedPaths(): string[] {
  const output = execFileSync("git", ["ls-files", "-z"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  });
  return output.split("\0").filter(Boolean);
}

function repositoryPaths(root: string): string[] {
  const paths: string[] = [];
  const walk = (relativeDir: string): void => {
    const absoluteDir = join(root, relativeDir);
    for (const entry of readdirSync(absoluteDir, { withFileTypes: true })) {
      if (entry.isDirectory() && SKIP_DIRECTORIES.has(entry.name)) continue;
      const relativePath = relativeDir ? `${relativeDir}/${entry.name}` : entry.name;
      paths.push(relativePath);
      if (entry.isDirectory()) walk(relativePath);
    }
  };
  walk("");
  return paths;
}

describe("repository path naming", () => {
  it("keeps legacy UT-TDD_AGENT-HARNESS repository names out of file and folder paths", () => {
    const trackedResidue = trackedPaths().filter((path) =>
      LEGACY_REPOSITORY_NAME_PATTERN.test(path),
    );
    const filesystemResidue = repositoryPaths(process.cwd()).filter((path) =>
      LEGACY_REPOSITORY_NAME_PATTERN.test(path),
    );

    expect(trackedResidue).toEqual([]);
    expect(filesystemResidue).toEqual([]);
  });
});

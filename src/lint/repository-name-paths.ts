import { execFileSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { join } from "node:path";

export interface RepositoryNamePathsInput {
  trackedPaths: string[];
  filesystemPaths: string[];
}

export interface RepositoryNamePathsResult {
  ok: boolean;
  trackedResidue: string[];
  filesystemResidue: string[];
}

const LEGACY_REPOSITORY_NAME_PATTERN = /UT[-_]TDD[_-]AGENT[_-]HARNESS(?:[-_]Pack)?/i;
const SKIP_DIRECTORIES = new Set([".git", "node_modules", "dist"]);

export function loadRepositoryNamePathsInput(
  repoRoot: string = process.cwd(),
): RepositoryNamePathsInput {
  return {
    trackedPaths: loadTrackedPaths(repoRoot),
    filesystemPaths: loadFilesystemPaths(repoRoot),
  };
}

export function analyzeRepositoryNamePaths(
  input: RepositoryNamePathsInput,
): RepositoryNamePathsResult {
  const trackedResidue = input.trackedPaths.filter((path) =>
    LEGACY_REPOSITORY_NAME_PATTERN.test(path),
  );
  const filesystemResidue = input.filesystemPaths.filter((path) =>
    LEGACY_REPOSITORY_NAME_PATTERN.test(path),
  );
  return {
    ok: trackedResidue.length === 0 && filesystemResidue.length === 0,
    trackedResidue,
    filesystemResidue,
  };
}

export function repositoryNamePathsMessages(result: RepositoryNamePathsResult): string[] {
  if (result.ok) {
    return [`repository-name-paths - OK (tracked=0, filesystem=0, legacy_repo_path_residue=0)`];
  }
  const samples = [...result.trackedResidue, ...result.filesystemResidue].slice(0, 8).join(", ");
  return [
    `repository-name-paths - violation: legacy UT-TDD_AGENT-HARNESS repository-name path residue tracked=${result.trackedResidue.length}, filesystem=${result.filesystemResidue.length}: ${samples}`,
  ];
}

function loadTrackedPaths(repoRoot: string): string[] {
  const output = execFileSync("git", ["-C", repoRoot, "ls-files", "-z"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  });
  return output.split("\0").filter(Boolean);
}

function loadFilesystemPaths(repoRoot: string): string[] {
  const paths: string[] = [];
  const walk = (relativeDir: string): void => {
    const absoluteDir = join(repoRoot, relativeDir);
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

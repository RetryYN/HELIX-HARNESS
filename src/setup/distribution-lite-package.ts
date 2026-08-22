import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  type DistributionArtifactProjectionFailure,
  loadDistributionCapabilityArtifactCatalog,
  projectDistributionArtifacts,
} from "./distribution-artifact-projection";
import { analyzeDistributionDependencyClosure } from "./distribution-dependency-closure";
import {
  createDeterministicDistributionPackage,
  type DistributionPackageResult,
} from "./distribution-package-builder";
import {
  type DistributionProfileFailure,
  loadDistributionProfileCatalog,
} from "./distribution-profile";

const LITE_ENTRYPOINTS = [
  "src/setup/distribution-consumer-command-composition.ts",
  "src/setup/distribution-consumer-node-adapter.ts",
] as const;

export type LiteDistributionPackageFailure =
  | "profile_required"
  | "profile_unknown"
  | "source_identity_unavailable"
  | "requirements_identity_invalid"
  | "package_identity_invalid"
  | `profile:${DistributionProfileFailure}`
  | `projection:${DistributionArtifactProjectionFailure}`
  | "dependency_closure_failed";

export type LiteDistributionPackageResult =
  | DistributionPackageResult
  | { ok: false; failures: LiteDistributionPackageFailure[] };

function trackedPathsAndHead(repoRoot: string): { paths: string[]; head: string } | null {
  try {
    const paths = execFileSync("git", ["ls-files"], { cwd: repoRoot, encoding: "utf8" })
      .trim()
      .split("\n")
      .filter(Boolean);
    const head = execFileSync("git", ["rev-parse", "HEAD"], {
      cwd: repoRoot,
      encoding: "utf8",
    }).trim();
    return /^[0-9a-f]{40}$/.test(head) ? { paths, head } : null;
  } catch {
    return null;
  }
}

function requirementsIdentity(repoRoot: string): { version: string; root_digest: string } | null {
  try {
    const requirements = readFileSync(
      join(repoRoot, "docs/governance/helix-harness-requirements_v1.3.md"),
      "utf8",
    );
    const version = requirements.match(/^- \*\*Version\*\*: ([0-9]+\.[0-9]+\.[0-9]+)$/m)?.[1];
    const manifest = JSON.parse(
      readFileSync(join(repoRoot, "requirements-ir/manifest.json"), "utf8"),
    ) as { root_digest?: unknown };
    return version && typeof manifest.root_digest === "string"
      ? { version, root_digest: manifest.root_digest }
      : null;
  } catch {
    return null;
  }
}

function packageVersion(repoRoot: string): string | null {
  try {
    const value = JSON.parse(readFileSync(join(repoRoot, "package.json"), "utf8")) as {
      version?: unknown;
    };
    return typeof value.version === "string" ? value.version : null;
  } catch {
    return null;
  }
}

export function buildLiteDistributionPackage(input: {
  repo_root: string;
  out_dir: string;
  profile_id: string | null;
}): LiteDistributionPackageResult {
  if (!input.profile_id) return { ok: false, failures: ["profile_required"] };
  const profileResult = loadDistributionProfileCatalog(input.repo_root);
  if (!profileResult.ok || !profileResult.catalog) {
    return {
      ok: false,
      failures: profileResult.failures.map((failure) => `profile:${failure}` as const),
    };
  }
  const profile = profileResult.catalog.profiles.find(
    (candidate) => candidate.profile_id === input.profile_id,
  );
  if (!profile) return { ok: false, failures: ["profile_unknown"] };
  const source = trackedPathsAndHead(input.repo_root);
  if (!source) return { ok: false, failures: ["source_identity_unavailable"] };
  const projection = projectDistributionArtifacts({
    profile,
    catalog: loadDistributionCapabilityArtifactCatalog(input.repo_root),
    source_paths: source.paths,
  });
  if (!projection.ok) {
    return {
      ok: false,
      failures: projection.failures.map((failure) => `projection:${failure}` as const),
    };
  }
  const closure = analyzeDistributionDependencyClosure({
    repoRoot: input.repo_root,
    artifactPaths: projection.artifact_paths,
    sourcePaths: source.paths,
    entrypoints: LITE_ENTRYPOINTS,
  });
  if (!closure.ok) return { ok: false, failures: ["dependency_closure_failed"] };
  const requirements = requirementsIdentity(input.repo_root);
  if (!requirements) return { ok: false, failures: ["requirements_identity_invalid"] };
  const version = packageVersion(input.repo_root);
  if (!version) return { ok: false, failures: ["package_identity_invalid"] };
  return createDeterministicDistributionPackage({
    source_root: input.repo_root,
    out_dir: input.out_dir,
    artifact_stem: `HELIX-HARNESS-LITE-${profile.profile_version}`,
    artifact_paths: projection.artifact_paths,
    identity: {
      source_head: source.head,
      requirements,
      profile: {
        id: profile.profile_id,
        version: profile.profile_version,
        digest: profile.profile_digest,
      },
      package_version: version,
      distribution_repository: profile.distribution_repository,
      artifact_set_digest: projection.artifact_set_digest,
    },
  });
}

import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { isAbsolute, join, relative, resolve } from "node:path";
import { buildSync } from "esbuild";
import { canonicalJson, sha256Digest } from "../shared/canonical-digest";
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

const LITE_ENTRYPOINTS = ["src/setup/distribution-consumer-cli.ts"] as const;
const LITE_NODE_ARTIFACT_PATH = "dist/helix.js";

function digest(bytes: Buffer | string): string {
  return `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
}

function buildLiteNodeArtifact(repoRoot: string, version: string): Buffer | null {
  try {
    const result = buildSync({
      absWorkingDir: repoRoot,
      entryPoints: ["src/setup/distribution-consumer-cli.ts"],
      bundle: true,
      platform: "node",
      format: "esm",
      target: "node24",
      write: false,
      define: {
        __HELIX_LITE_VERSION__: JSON.stringify(version),
        __HELIX_LITE_EXECUTABLE__: "true",
      },
      legalComments: "none",
    });
    return result.outputFiles.length === 1 ? Buffer.from(result.outputFiles[0].contents) : null;
  } catch {
    return null;
  }
}

function litePackageJson(repoRoot: string, version: string): string | null {
  try {
    const source = JSON.parse(readFileSync(join(repoRoot, "package.json"), "utf8")) as {
      engines?: unknown;
      license?: unknown;
    };
    return `${JSON.stringify(
      {
        name: "helix-harness-lite",
        version,
        type: "module",
        bin: { helix: `./${LITE_NODE_ARTIFACT_PATH}` },
        engines: source.engines,
        license: source.license,
      },
      null,
      2,
    )}\n`;
  } catch {
    return null;
  }
}

export type LiteDistributionPackageFailure =
  | "profile_required"
  | "profile_unknown"
  | "source_identity_unavailable"
  | "source_head_dirty"
  | "requirements_identity_invalid"
  | "package_identity_invalid"
  | `profile:${DistributionProfileFailure}`
  | `projection:${DistributionArtifactProjectionFailure}`
  | "dependency_closure_failed";

export type LiteDistributionPackageResult =
  | DistributionPackageResult
  | { ok: false; failures: LiteDistributionPackageFailure[] };

export function resolveTrackedSourceIdentity(
  repoRoot: string,
):
  | { ok: true; paths: string[]; head: string }
  | { ok: false; failure: "source_identity_unavailable" | "source_head_dirty" } {
  try {
    const paths = execFileSync("git", ["ls-files"], { cwd: repoRoot, encoding: "utf8" })
      .trim()
      .split("\n")
      .filter(Boolean);
    const head = execFileSync("git", ["rev-parse", "HEAD"], {
      cwd: repoRoot,
      encoding: "utf8",
    }).trim();
    if (!/^[0-9a-f]{40}$/.test(head)) {
      return { ok: false, failure: "source_identity_unavailable" };
    }
    const diff = spawnSync("git", ["diff", "--quiet", "HEAD", "--"], {
      cwd: repoRoot,
      stdio: "ignore",
    });
    if (diff.status === 1) return { ok: false, failure: "source_head_dirty" };
    if (diff.status !== 0) return { ok: false, failure: "source_identity_unavailable" };
    return { ok: true, paths, head };
  } catch {
    return { ok: false, failure: "source_identity_unavailable" };
  }
}

export function resolveLiteRequirementsIdentity(
  repoRoot: string,
): { version: string; root_digest: string } | null {
  try {
    const requirements = readFileSync(
      join(repoRoot, "docs/governance/helix-harness-requirements_v1.3.md"),
      "utf8",
    );
    const version = requirements.match(/^- \*\*Version\*\*: ([0-9]+\.[0-9]+\.[0-9]+)$/m)?.[1];
    const manifest = JSON.parse(
      readFileSync(join(repoRoot, "requirements-ir/manifest.json"), "utf8"),
    ) as {
      schema_version?: unknown;
      authority?: unknown;
      source_authority?: unknown;
      partition?: unknown;
      shards?: Array<{
        kind?: unknown;
        path?: unknown;
        count?: unknown;
        digest?: unknown;
      }>;
      baseline_root_digest?: unknown;
      root_digest?: unknown;
    };
    const digestPattern = /^sha256:[0-9a-f]{64}$/;
    const exactKinds = [
      "requirements",
      "system_contracts",
      "acceptance_cases",
      "system_tests",
      "refinement_contracts",
    ];
    if (
      !version ||
      manifest.schema_version !== "helix-requirement-ir.v2" ||
      manifest.authority !== "canonical" ||
      manifest.source_authority !== "json_stable_id_shards" ||
      manifest.partition !== "stable_id_keyed_shards" ||
      !digestPattern.test(String(manifest.baseline_root_digest ?? "")) ||
      !digestPattern.test(String(manifest.root_digest ?? "")) ||
      !Array.isArray(manifest.shards) ||
      manifest.shards.length !== exactKinds.length
    ) {
      return null;
    }
    const shardKinds = manifest.shards.map((entry) => entry.kind);
    if (
      exactKinds.some((kind) => shardKinds.filter((candidate) => candidate === kind).length !== 1)
    ) {
      return null;
    }
    const root = resolve(repoRoot);
    const records = new Map<string, unknown[]>();
    for (const kind of exactKinds) {
      const entry = manifest.shards.find((candidate) => candidate.kind === kind);
      if (
        !entry ||
        entry.path !== `requirements-ir/${kind}.json` ||
        typeof entry.count !== "number" ||
        !Number.isInteger(entry.count) ||
        entry.count < 0 ||
        !digestPattern.test(String(entry.digest ?? ""))
      ) {
        return null;
      }
      const target = resolve(root, entry.path);
      const rel = relative(root, target);
      if (isAbsolute(entry.path) || rel.startsWith("..") || isAbsolute(rel)) return null;
      const keyed = JSON.parse(readFileSync(target, "utf8")) as unknown;
      if (!keyed || typeof keyed !== "object" || Array.isArray(keyed)) return null;
      const entries = Object.entries(keyed as Record<string, unknown>);
      if (entries.length !== entry.count || sha256Digest(JSON.stringify(keyed)) !== entry.digest) {
        return null;
      }
      records.set(
        kind,
        entries.map(([, record]) => record),
      );
    }
    const baseline = {
      schema_version: "helix-requirement-ir.v1",
      authority: "canonical",
      source_authority: "json_stable_id_shards",
      requirements: records.get("requirements"),
      system_contracts: records.get("system_contracts"),
      acceptance_cases: records.get("acceptance_cases"),
      system_tests: records.get("system_tests"),
    };
    const observedBaselineDigest = sha256Digest(canonicalJson(baseline));
    if (observedBaselineDigest !== manifest.baseline_root_digest) return null;
    const observedRootDigest = sha256Digest(
      canonicalJson({
        schema_version: manifest.schema_version,
        authority: manifest.authority,
        source_authority: manifest.source_authority,
        baseline_root_digest: observedBaselineDigest,
        requirements: baseline.requirements,
        system_contracts: baseline.system_contracts,
        acceptance_cases: baseline.acceptance_cases,
        system_tests: baseline.system_tests,
        refinement_contracts: records.get("refinement_contracts"),
      }),
    );
    return observedRootDigest === manifest.root_digest
      ? { version, root_digest: observedRootDigest }
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
  const source = resolveTrackedSourceIdentity(input.repo_root);
  if (!source.ok) return { ok: false, failures: [source.failure] };
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
  const requirements = resolveLiteRequirementsIdentity(input.repo_root);
  if (!requirements) return { ok: false, failures: ["requirements_identity_invalid"] };
  const version = packageVersion(input.repo_root);
  if (!version) return { ok: false, failures: ["package_identity_invalid"] };
  const nodeArtifact = buildLiteNodeArtifact(input.repo_root, version);
  const packageJson = litePackageJson(input.repo_root, version);
  if (!nodeArtifact || !packageJson) {
    return { ok: false, failures: ["package_identity_invalid"] };
  }
  const finalArtifactPaths = [...projection.artifact_paths, LITE_NODE_ARTIFACT_PATH].sort();
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
      artifact_set_digest: sha256Digest(canonicalJson(finalArtifactPaths)),
      prebuilt_node_artifact: {
        path: LITE_NODE_ARTIFACT_PATH,
        digest: digest(nodeArtifact),
      },
    },
    generated_artifacts: {
      [LITE_NODE_ARTIFACT_PATH]: { bytes: nodeArtifact, mode: 0o755 },
    },
    transform_artifact: (artifactPath) => (artifactPath === "package.json" ? packageJson : null),
  });
}

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
const HELIX_SOURCE_REMOTES = new Set([
  "git@github.com:RetryYN/HELIX-HARNESS.git",
  "https://github.com/RetryYN/HELIX-HARNESS",
  "https://github.com/RetryYN/HELIX-HARNESS.git",
]);

function digest(bytes: Buffer | string): string {
  return `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
}

export const LITE_DOCUMENT_SOURCES = {
  "README.md": "README-LITE.md",
  LICENSE: "LICENSE",
  "THIRD_PARTY_NOTICES.md": "THIRD_PARTY_NOTICES.md",
  "PROVENANCE.md": "PROVENANCE.md",
  "DISCLAIMER.md": "DISCLAIMER.md",
} as const;

export type LiteDistributionDocumentFailure =
  | "document_exact_set_invalid"
  | "document_empty"
  | "consumer_readme_invalid"
  | "document_sensitive_content";

export function validateLiteDistributionDocumentBytes(
  documents: Readonly<Partial<Record<keyof typeof LITE_DOCUMENT_SOURCES, Buffer | string>>>,
): LiteDistributionDocumentFailure[] {
  const failures = new Set<LiteDistributionDocumentFailure>();
  const expected = Object.keys(LITE_DOCUMENT_SOURCES).sort();
  const actual = Object.keys(documents).sort();
  if (JSON.stringify(actual) !== JSON.stringify(expected))
    failures.add("document_exact_set_invalid");
  const text = (value: Buffer | string | undefined): string =>
    typeof value === "string" ? value : (value?.toString("utf8") ?? "");
  const values = Object.values(documents).map(text);
  if (values.some((value) => value.trim().length === 0)) failures.add("document_empty");
  const readme = text(documents["README.md"]);
  if (
    !readme.includes("RetryYN/HELIX-HARNESS-DevOS") ||
    !readme.includes("compatibility input-only") ||
    readme.includes("development / private") ||
    readme.includes("node /path/to/HELIX-HARNESS") ||
    readme.includes("helix team run")
  ) {
    failures.add("consumer_readme_invalid");
  }
  if (
    values.some((value) =>
      /(?:\/home\/[A-Za-z0-9._-]+\/|[A-Za-z]:\\Users\\|ghp_[A-Za-z0-9]+|sk-[A-Za-z0-9]{16,})/.test(
        value,
      ),
    )
  ) {
    failures.add("document_sensitive_content");
  }
  return [...failures].sort();
}

export function loadLiteDistributionDocuments(repoRoot: string): Array<{
  path: string;
  source_path: string;
  digest: string;
  classification: "first_party" | "third_party_notice";
}> | null {
  try {
    const bytes = Object.fromEntries(
      Object.entries(LITE_DOCUMENT_SOURCES).map(([path, sourcePath]) => [
        path,
        readFileSync(join(repoRoot, sourcePath)),
      ]),
    ) as Record<keyof typeof LITE_DOCUMENT_SOURCES, Buffer>;
    if (validateLiteDistributionDocumentBytes(bytes).length > 0) return null;
    return Object.entries(LITE_DOCUMENT_SOURCES).map(([path, sourcePath]) => ({
      path,
      source_path: sourcePath,
      digest: digest(bytes[path as keyof typeof LITE_DOCUMENT_SOURCES]),
      classification: path === "THIRD_PARTY_NOTICES.md" ? "third_party_notice" : "first_party",
    }));
  } catch {
    return null;
  }
}

function buildLiteNodeArtifact(
  repoRoot: string,
  version: string,
): { bytes: Buffer; runtime_third_party_inputs: string[] } | null {
  try {
    const result = buildSync({
      absWorkingDir: repoRoot,
      entryPoints: ["src/setup/distribution-consumer-cli.ts"],
      bundle: true,
      platform: "node",
      format: "esm",
      target: "node24",
      write: false,
      metafile: true,
      define: {
        __HELIX_LITE_VERSION__: JSON.stringify(version),
        __HELIX_LITE_EXECUTABLE__: "true",
      },
      legalComments: "none",
    });
    if (result.outputFiles.length !== 1 || !result.metafile) return null;
    return {
      bytes: Buffer.from(result.outputFiles[0].contents),
      runtime_third_party_inputs: Object.keys(result.metafile.inputs)
        .filter((path) => path.replaceAll("\\", "/").includes("node_modules/"))
        .sort(),
    };
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
  | "distribution_documents_invalid"
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
    const sourceRemote = execFileSync("git", ["remote", "get-url", "origin"], {
      cwd: repoRoot,
      encoding: "utf8",
    }).trim();
    if (!HELIX_SOURCE_REMOTES.has(sourceRemote)) {
      return { ok: false, failure: "source_identity_unavailable" };
    }
    const trackedFlags = execFileSync("git", ["ls-files", "-v"], {
      cwd: repoRoot,
      encoding: "utf8",
    })
      .trim()
      .split("\n")
      .filter(Boolean);
    if (trackedFlags.some((entry) => !entry.startsWith("H "))) {
      return { ok: false, failure: "source_head_dirty" };
    }
    const diff = spawnSync("git", ["diff", "--quiet", "HEAD", "--"], {
      cwd: repoRoot,
      stdio: "ignore",
    });
    if (diff.status === 1) return { ok: false, failure: "source_head_dirty" };
    if (diff.status !== 0) return { ok: false, failure: "source_identity_unavailable" };
    const status = execFileSync("git", ["status", "--porcelain", "--untracked-files=all"], {
      cwd: repoRoot,
      encoding: "utf8",
    });
    if (status.trim() !== "") return { ok: false, failure: "source_head_dirty" };
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
  const documents = loadLiteDistributionDocuments(input.repo_root);
  if (!documents || (nodeArtifact?.runtime_third_party_inputs.length ?? 0) > 0) {
    return { ok: false, failures: ["distribution_documents_invalid"] };
  }
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
      source_repository: "RetryYN/HELIX-HARNESS",
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
        digest: digest(nodeArtifact.bytes),
      },
    },
    generated_artifacts: {
      [LITE_NODE_ARTIFACT_PATH]: { bytes: nodeArtifact.bytes, mode: 0o755 },
    },
    manifest_extensions: {
      distribution_documents: documents,
      runtime_third_party_inputs: nodeArtifact.runtime_third_party_inputs,
    },
    transform_artifact: (artifactPath) => {
      if (artifactPath === "package.json") return packageJson;
      const sourcePath = LITE_DOCUMENT_SOURCES[artifactPath as keyof typeof LITE_DOCUMENT_SOURCES];
      return sourcePath && sourcePath !== artifactPath
        ? readFileSync(join(input.repo_root, sourcePath))
        : null;
    },
  });
}

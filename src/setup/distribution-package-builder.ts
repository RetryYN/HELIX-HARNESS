import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  cpSync,
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, isAbsolute, join, posix, relative, sep, win32 } from "node:path";
import { canonicalJson, sha256Digest } from "../shared/canonical-digest";

const digest = (bytes: Buffer | string): string =>
  `sha256:${createHash("sha256").update(bytes).digest("hex")}`;

export interface DistributionPackageIdentity {
  source_head: string;
  requirements: { version: string; root_digest: string };
  profile: { id: string; version: string; digest: string } | null;
  package_version: string;
  distribution_repository: "RetryYN/HELIX-HARNESS-DevOS";
  artifact_set_digest: string;
}

export interface DistributionPackageManifest extends DistributionPackageIdentity {
  [key: string]: unknown;
  schema_version: "helix-distribution-package-manifest.v1";
  artifact_paths: string[];
  tarball: string;
  tarball_digest: string;
  checksum: string;
}

export type DistributionPackageFailure =
  | "artifact_stem_invalid"
  | "artifact_path_invalid"
  | "artifact_path_duplicate"
  | "artifact_set_digest_mismatch"
  | "artifact_source_missing"
  | "artifact_source_unsafe"
  | "manifest_extension_reserved"
  | "tarball_digest_alias_reserved"
  | "tar_failed";

export interface DistributionPackageResult {
  ok: boolean;
  failures: DistributionPackageFailure[];
  manifest: DistributionPackageManifest;
  paths: { tarball: string; checksum: string; manifest: string };
  output_digests: { tarball: string; checksum: string; manifest: string } | null;
  tar: { exit_code: number | null; stderr: string };
}

export function deterministicDistributionTarArgs(tarballName: string, stage: string): string[] {
  return [
    "--sort=name",
    "--mtime=UTC 1970-01-01",
    "--owner=0",
    "--group=0",
    "--numeric-owner",
    "--pax-option=delete=atime,delete=ctime",
    "-czf",
    tarballName,
    "-C",
    stage,
    ".",
  ];
}

function normalizedArtifactPaths(paths: readonly string[]): {
  paths: string[];
  failures: DistributionPackageFailure[];
} {
  const failures = new Set<DistributionPackageFailure>();
  const portable = paths.map((path) => path.replaceAll("\\", "/"));
  const normalized = portable.map((path) => posix.normalize(path));
  if (
    portable.some((path) => path.split("/").includes("..") || win32.isAbsolute(path)) ||
    normalized.some(
      (path) =>
        !path || path === "." || path === ".." || path.startsWith("../") || isAbsolute(path),
    )
  ) {
    failures.add("artifact_path_invalid");
  }
  if (new Set(normalized).size !== normalized.length) failures.add("artifact_path_duplicate");
  return { paths: [...new Set(normalized)].sort(), failures: [...failures].sort() };
}

function pathInside(root: string, candidate: string): boolean {
  const rel = relative(root, candidate);
  return rel === "" || (rel !== ".." && !rel.startsWith(`..${sep}`));
}

function resolvePhysicalSource(root: string, sourcePath: string): string | null {
  const portable = sourcePath.replaceAll("\\", "/");
  const normalized = posix.normalize(portable);
  if (
    !normalized ||
    normalized === "." ||
    normalized === ".." ||
    normalized.startsWith("../") ||
    portable.split("/").includes("..") ||
    isAbsolute(normalized) ||
    win32.isAbsolute(sourcePath)
  ) {
    return null;
  }
  let cursor = root;
  for (const part of normalized.split("/")) {
    cursor = join(cursor, part);
    if (!existsSync(cursor) || lstatSync(cursor).isSymbolicLink()) return null;
    const physical = realpathSync(cursor);
    if (!pathInside(root, physical)) return null;
    cursor = physical;
  }
  return cursor;
}

export function createDeterministicDistributionPackage(input: {
  source_root: string;
  out_dir: string;
  artifact_stem: string;
  artifact_paths: readonly string[];
  identity: DistributionPackageIdentity;
  resolve_source_path?: (artifactPath: string) => string;
  transform_artifact?: (artifactPath: string, content: Buffer) => Buffer | string | null;
  manifest_extensions?: Record<string, unknown>;
  tarball_digest_aliases?: readonly string[];
}): DistributionPackageResult {
  const admitted = normalizedArtifactPaths(input.artifact_paths);
  const failures = new Set(admitted.failures);
  if (!/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(input.artifact_stem)) {
    failures.add("artifact_stem_invalid");
  }
  const reservedManifestKeys = new Set([
    "schema_version",
    "source_head",
    "requirements",
    "profile",
    "package_version",
    "distribution_repository",
    "artifact_set_digest",
    "artifact_paths",
    "tarball",
    "tarball_digest",
    "checksum",
  ]);
  if (Object.keys(input.manifest_extensions ?? {}).some((key) => reservedManifestKeys.has(key))) {
    failures.add("manifest_extension_reserved");
  }
  if (
    (input.tarball_digest_aliases ?? []).some(
      (alias) => reservedManifestKeys.has(alias) || !/^[A-Za-z][A-Za-z0-9_]*$/.test(alias),
    )
  ) {
    failures.add("tarball_digest_alias_reserved");
  }
  const computedSetDigest = sha256Digest(canonicalJson(admitted.paths));
  if (computedSetDigest !== input.identity.artifact_set_digest) {
    failures.add("artifact_set_digest_mismatch");
  }
  let physicalRoot: string | null = null;
  try {
    physicalRoot = realpathSync(input.source_root);
  } catch {
    failures.add("artifact_source_missing");
  }
  const physicalSources = new Map<string, string>();
  for (const artifactPath of admitted.paths) {
    if (!physicalRoot) continue;
    const sourcePath = input.resolve_source_path?.(artifactPath) ?? artifactPath;
    const logicalSource = join(physicalRoot, ...sourcePath.split("/"));
    if (!existsSync(logicalSource)) failures.add("artifact_source_missing");
    else {
      const physicalSource = resolvePhysicalSource(physicalRoot, sourcePath);
      if (!physicalSource) failures.add("artifact_source_unsafe");
      else physicalSources.set(artifactPath, physicalSource);
    }
  }

  const tarball = join(input.out_dir, `${input.artifact_stem}.tar.gz`);
  const checksum = `${tarball}.sha256`;
  const manifestPath = join(input.out_dir, `${input.artifact_stem}.manifest.json`);
  const manifest: DistributionPackageManifest = {
    schema_version: "helix-distribution-package-manifest.v1",
    ...input.identity,
    ...(input.manifest_extensions ?? {}),
    artifact_paths: admitted.paths,
    tarball: basename(tarball),
    tarball_digest: "sha256:pending",
    checksum: basename(checksum),
  };
  const blocked = (): DistributionPackageResult => ({
    ok: false,
    failures: [...failures].sort(),
    manifest,
    paths: { tarball, checksum, manifest: manifestPath },
    output_digests: null,
    tar: { exit_code: null, stderr: "" },
  });
  if (failures.size > 0) return blocked();

  const stage = mkdtempSync(join(tmpdir(), "helix-distribution-package-"));
  let tarExitCode: number | null = null;
  let tarStderr = "";
  try {
    mkdirSync(input.out_dir, { recursive: true });
    for (const artifactPath of admitted.paths) {
      const from = physicalSources.get(artifactPath);
      if (!from) throw new Error(`admitted artifact source missing: ${artifactPath}`);
      const to = join(stage, ...artifactPath.split("/"));
      mkdirSync(dirname(to), { recursive: true });
      const transformed = input.transform_artifact?.(artifactPath, readFileSync(from));
      if (transformed !== undefined && transformed !== null) {
        writeFileSync(to, transformed);
      } else {
        cpSync(from, to, { recursive: true });
      }
    }
    const tar = spawnSync("tar", deterministicDistributionTarArgs(basename(tarball), stage), {
      cwd: input.out_dir,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    tarExitCode = tar.status;
    tarStderr = String(tar.stderr ?? "");
    if (tar.status !== 0 || !existsSync(tarball)) {
      failures.add("tar_failed");
      return {
        ...blocked(),
        tar: { exit_code: tarExitCode, stderr: tarStderr },
      };
    }
    manifest.tarball_digest = digest(readFileSync(tarball));
    for (const alias of input.tarball_digest_aliases ?? []) {
      manifest[alias] = manifest.tarball_digest;
    }
    writeFileSync(
      checksum,
      `${manifest.tarball_digest.slice("sha256:".length)}  ${basename(tarball)}\n`,
    );
    writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
    return {
      ok: true,
      failures: [],
      manifest,
      paths: { tarball, checksum, manifest: manifestPath },
      output_digests: {
        tarball: manifest.tarball_digest,
        checksum: digest(readFileSync(checksum)),
        manifest: digest(readFileSync(manifestPath)),
      },
      tar: { exit_code: tarExitCode, stderr: tarStderr },
    };
  } finally {
    rmSync(stage, { recursive: true, force: true });
  }
}

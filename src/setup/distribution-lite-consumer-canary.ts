import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { lstatSync, readFileSync, realpathSync } from "node:fs";
import { basename, dirname, relative, resolve, sep } from "node:path";

export interface LiteConsumerCanaryExpectedIdentity {
  source_repository: "RetryYN/HELIX-HARNESS";
  source_head: string;
  requirements: { version: string; root_digest: string };
  profile: { id: string; version: string; digest: string };
  package_version: string;
  distribution_repository: string;
  artifact_set_digest: string;
  prebuilt_node_artifact: { path: string; digest: string };
  output_digests: { tarball: string; checksum: string; manifest: string };
}

export type LiteConsumerCanaryAdmissionFailure =
  | "artifact_path_unsafe"
  | "manifest_invalid"
  | "manifest_identity_mismatch"
  | "artifact_digest_mismatch"
  | "checksum_invalid"
  | "archive_invalid"
  | "archive_path_unsafe"
  | "archive_exact_set_mismatch";

export type LiteConsumerCanaryAdmission =
  | {
      ok: true;
      source_head: string;
      profile_id: string;
      tarball_digest: string;
      artifact_paths: string[];
    }
  | { ok: false; failures: LiteConsumerCanaryAdmissionFailure[] };

interface PackageManifest {
  schema_version: string;
  source_repository: "RetryYN/HELIX-HARNESS";
  source_head: string;
  requirements: { version: string; root_digest: string };
  profile: { id: string; version: string; digest: string } | null;
  package_version: string;
  distribution_repository: string;
  artifact_set_digest: string;
  prebuilt_node_artifact: { path: string; digest: string } | null;
  artifact_paths: string[];
  tarball: string;
  tarball_digest: string;
  checksum: string;
}

function digest(bytes: Buffer | string): string {
  return `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
}

function isDigest(value: unknown): value is string {
  return typeof value === "string" && /^sha256:[0-9a-f]{64}$/.test(value);
}

function isPortableArtifactPath(value: string): boolean {
  return (
    value.length > 0 &&
    !value.startsWith("/") &&
    !/^[A-Za-z]:[\\/]/.test(value) &&
    !value.includes("\\") &&
    value.split("/").every((part) => part.length > 0 && part !== "." && part !== "..")
  );
}

function readRegularPhysicalFile(path: string): Buffer | null {
  try {
    const logical = resolve(path);
    const physicalParent = realpathSync(dirname(logical));
    const physical = realpathSync(logical);
    if (physical !== logical || physicalParent !== dirname(logical)) return null;
    const rel = relative(physicalParent, physical);
    if (rel === ".." || rel.startsWith(`..${sep}`)) return null;
    const stat = lstatSync(logical);
    if (!stat.isFile() || stat.isSymbolicLink() || stat.nlink > 1) return null;
    return readFileSync(physical);
  } catch {
    return null;
  }
}

function parseManifest(bytes: Buffer): PackageManifest | null {
  try {
    const value = JSON.parse(bytes.toString("utf8")) as Partial<PackageManifest>;
    const exactKeys = [
      "artifact_paths",
      "artifact_set_digest",
      "checksum",
      "distribution_repository",
      "package_version",
      "prebuilt_node_artifact",
      "profile",
      "requirements",
      "schema_version",
      "source_head",
      "source_repository",
      "tarball",
      "tarball_digest",
    ];
    if (
      !value ||
      typeof value !== "object" ||
      JSON.stringify(Object.keys(value).sort()) !== JSON.stringify(exactKeys) ||
      value.schema_version !== "helix-distribution-package-manifest.v1" ||
      value.source_repository !== "RetryYN/HELIX-HARNESS" ||
      typeof value.source_head !== "string" ||
      typeof value.package_version !== "string" ||
      typeof value.distribution_repository !== "string" ||
      !isDigest(value.artifact_set_digest) ||
      !Array.isArray(value.artifact_paths) ||
      !value.artifact_paths.every((path) => typeof path === "string") ||
      typeof value.tarball !== "string" ||
      !isDigest(value.tarball_digest) ||
      typeof value.checksum !== "string" ||
      !value.requirements ||
      typeof value.requirements.version !== "string" ||
      !isDigest(value.requirements.root_digest) ||
      !value.profile ||
      typeof value.profile.id !== "string" ||
      typeof value.profile.version !== "string" ||
      !isDigest(value.profile.digest) ||
      !value.prebuilt_node_artifact ||
      !isPortableArtifactPath(value.prebuilt_node_artifact.path) ||
      !isDigest(value.prebuilt_node_artifact.digest)
    ) {
      return null;
    }
    return value as PackageManifest;
  } catch {
    return null;
  }
}

function archivePaths(tarball: string): { ok: true; paths: string[] } | { ok: false } {
  const listed = spawnSync("tar", ["-tzf", tarball], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  if (listed.status !== 0) return { ok: false };
  return parsePortableArchivePaths(String(listed.stdout));
}

export function parsePortableArchivePaths(
  output: string,
): { ok: true; paths: string[] } | { ok: false } {
  const entries = output
    .split("\n")
    .map((entry) => entry.replace(/\r$/, "").replace(/^\.\//, ""))
    .filter(Boolean);
  if (entries.some((entry) => !isPortableArtifactPath(entry.replace(/\/$/, "")))) {
    return { ok: false };
  }
  return { ok: true, paths: entries.filter((entry) => !entry.endsWith("/")).sort() };
}

export function admitLiteConsumerCanaryArtifact(input: {
  tarball: string;
  checksum: string;
  manifest: string;
  expected: LiteConsumerCanaryExpectedIdentity;
}): LiteConsumerCanaryAdmission {
  const failures = new Set<LiteConsumerCanaryAdmissionFailure>();
  const tarballBytes = readRegularPhysicalFile(input.tarball);
  const checksumBytes = readRegularPhysicalFile(input.checksum);
  const manifestBytes = readRegularPhysicalFile(input.manifest);
  if (!tarballBytes || !checksumBytes || !manifestBytes) {
    failures.add("artifact_path_unsafe");
    return { ok: false, failures: [...failures] };
  }
  const actualDigests = {
    tarball: digest(tarballBytes),
    checksum: digest(checksumBytes),
    manifest: digest(manifestBytes),
  };
  if (
    actualDigests.tarball !== input.expected.output_digests.tarball ||
    actualDigests.checksum !== input.expected.output_digests.checksum ||
    actualDigests.manifest !== input.expected.output_digests.manifest
  ) {
    failures.add("artifact_digest_mismatch");
  }
  const manifest = parseManifest(manifestBytes);
  if (!manifest) failures.add("manifest_invalid");
  if (manifest) {
    const expected = input.expected;
    if (
      manifest.source_head !== expected.source_head ||
      manifest.source_repository !== expected.source_repository ||
      manifest.requirements.version !== expected.requirements.version ||
      manifest.requirements.root_digest !== expected.requirements.root_digest ||
      manifest.profile?.id !== expected.profile.id ||
      manifest.profile?.version !== expected.profile.version ||
      manifest.profile?.digest !== expected.profile.digest ||
      manifest.package_version !== expected.package_version ||
      manifest.distribution_repository !== expected.distribution_repository ||
      manifest.artifact_set_digest !== expected.artifact_set_digest ||
      manifest.prebuilt_node_artifact?.path !== expected.prebuilt_node_artifact.path ||
      manifest.prebuilt_node_artifact?.digest !== expected.prebuilt_node_artifact.digest ||
      manifest.tarball_digest !== expected.output_digests.tarball ||
      manifest.tarball !== basename(input.tarball) ||
      manifest.checksum !== basename(input.checksum)
    ) {
      failures.add("manifest_identity_mismatch");
    }
    if (!manifest.artifact_paths.every(isPortableArtifactPath)) {
      failures.add("archive_path_unsafe");
    }
    const checksumLine = `${actualDigests.tarball.slice("sha256:".length)}  ${basename(input.tarball)}\n`;
    if (checksumBytes.toString("utf8") !== checksumLine) failures.add("checksum_invalid");
    const listed = archivePaths(input.tarball);
    if (!listed.ok) failures.add("archive_invalid");
    else if (JSON.stringify(listed.paths) !== JSON.stringify([...manifest.artifact_paths].sort())) {
      failures.add("archive_exact_set_mismatch");
    }
  }
  return failures.size > 0
    ? { ok: false, failures: [...failures].sort() }
    : {
        ok: true,
        source_head: input.expected.source_head,
        profile_id: input.expected.profile.id,
        tarball_digest: actualDigests.tarball,
        artifact_paths: [...(manifest?.artifact_paths ?? [])].sort(),
      };
}

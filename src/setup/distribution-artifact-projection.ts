import { readFileSync } from "node:fs";
import { isAbsolute, join, posix } from "node:path";
import { z } from "zod";
import { canonicalJson, sha256Digest } from "../shared/canonical-digest";
import type { DistributionProfile } from "./distribution-profile";

const capabilityIdSchema = z.string().regex(/^[a-z][a-z0-9]*(?:_[a-z0-9]+)*$/);
const relativePathSchema = z.string().min(1);

const capabilityArtifactCatalogSchema = z
  .object({
    schema_version: z.literal("helix-distribution-capability-artifact-catalog.v1"),
    capabilities: z
      .array(
        z
          .object({
            capability_id: capabilityIdSchema,
            disposition: z.enum(["consumer_safe", "excluded"]),
            artifact_paths: z.array(relativePathSchema),
          })
          .strict(),
      )
      .min(1),
  })
  .strict();

export type DistributionCapabilityArtifactCatalog = z.infer<typeof capabilityArtifactCatalogSchema>;

export type DistributionArtifactProjectionFailure =
  | "catalog_invalid"
  | "capability_duplicate"
  | "capability_unknown"
  | "capability_missing_artifacts"
  | "excluded_capability_selected"
  | "artifact_path_duplicate"
  | "artifact_path_absolute"
  | "artifact_path_forbidden"
  | "artifact_source_missing";

export interface DistributionArtifactProjection {
  ok: boolean;
  profile_id: string;
  profile_digest: string;
  artifact_paths: string[];
  artifact_set_digest: string;
  failures: DistributionArtifactProjectionFailure[];
}

export function loadDistributionCapabilityArtifactCatalog(repoRoot: string): unknown {
  try {
    return JSON.parse(
      readFileSync(join(repoRoot, "config/distribution-capability-artifact-catalog.json"), "utf8"),
    );
  } catch {
    return null;
  }
}

const forbiddenExactPaths = new Set(["harness.db", ".env", ".env.local"]);
const forbiddenPrefixes = [
  ".git/",
  ".helix/",
  "docs/plans/",
  "docs/handover/",
  "docs/archive/",
  "legacy local state/",
];
const credentialSegments = new Set([
  "credential",
  "credentials",
  "secret",
  "secrets",
  "token",
  "tokens",
  "private-key",
  "private_key",
]);

function normalizeArtifactPath(path: string): string {
  return posix.normalize(path.replaceAll("\\", "/")).replace(/^\.\//, "");
}

function isForbiddenArtifactPath(path: string): boolean {
  if (forbiddenExactPaths.has(path)) return true;
  if (forbiddenPrefixes.some((prefix) => path === prefix.slice(0, -1) || path.startsWith(prefix))) {
    return true;
  }
  return path.split("/").some((segment) => credentialSegments.has(segment.toLowerCase()));
}

export function projectDistributionArtifacts(input: {
  profile: DistributionProfile;
  catalog: unknown;
  source_paths: readonly string[];
}): DistributionArtifactProjection {
  const parsed = capabilityArtifactCatalogSchema.safeParse(input.catalog);
  const failures = new Set<DistributionArtifactProjectionFailure>();
  if (!parsed.success) failures.add("catalog_invalid");

  const entries = parsed.success ? parsed.data.capabilities : [];
  const capabilityIds = entries.map((entry) => entry.capability_id);
  if (new Set(capabilityIds).size !== capabilityIds.length) failures.add("capability_duplicate");
  const byCapability = new Map(entries.map((entry) => [entry.capability_id, entry]));
  const sourcePaths = new Set(input.source_paths.map(normalizeArtifactPath));
  const projected: string[] = [];

  for (const capabilityId of input.profile.capability_allowlist) {
    const entry = byCapability.get(capabilityId);
    if (!entry) {
      failures.add("capability_unknown");
      continue;
    }
    if (entry.disposition !== "consumer_safe") failures.add("excluded_capability_selected");
    if (entry.artifact_paths.length === 0) failures.add("capability_missing_artifacts");
    for (const rawPath of entry.artifact_paths) {
      const path = normalizeArtifactPath(rawPath);
      if (isAbsolute(rawPath) || isAbsolute(path) || path === ".." || path.startsWith("../")) {
        failures.add("artifact_path_absolute");
      }
      if (isForbiddenArtifactPath(path)) failures.add("artifact_path_forbidden");
      if (!sourcePaths.has(path)) failures.add("artifact_source_missing");
      projected.push(path);
    }
  }

  const excluded = new Set(input.profile.capability_exclusions);
  for (const capabilityId of input.profile.capability_allowlist) {
    if (excluded.has(capabilityId)) failures.add("excluded_capability_selected");
  }
  if (new Set(projected).size !== projected.length) failures.add("artifact_path_duplicate");

  const artifactPaths = [...new Set(projected)].sort();
  return {
    ok: failures.size === 0,
    profile_id: input.profile.profile_id,
    profile_digest: input.profile.profile_digest,
    artifact_paths: artifactPaths,
    artifact_set_digest: sha256Digest(canonicalJson(artifactPaths)),
    failures: [...failures].sort(),
  };
}

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";
import { canonicalJson, sha256Digest } from "../shared/canonical-digest";

const digestSchema = z.string().regex(/^sha256:[0-9a-f]{64}$/);
const capabilityIdSchema = z.string().regex(/^[a-z][a-z0-9]*(?:_[a-z0-9]+)*$/);

const profileSchema = z
  .object({
    profile_id: z.string().regex(/^[a-z][a-z0-9_]*_v[1-9][0-9]*$/),
    profile_version: z.string().regex(/^[1-9][0-9]*\.[0-9]+\.[0-9]+$/),
    display_name: z.string().min(1),
    source_authority: z
      .object({
        repository: z.literal("HELIX-HARNESS"),
        refinement_contract_id: z.literal("DIST-LITE-FR-001"),
        refinement_semantic_digest: digestSchema,
      })
      .strict(),
    distribution_repository: z.literal("RetryYN/HELIX-HARNESS-DevOS"),
    capability_allowlist: z.array(capabilityIdSchema).min(1),
    capability_exclusions: z.array(capabilityIdSchema).min(1),
    promotion_policy: z
      .object({
        mode: z.literal("versioned_receipt_only"),
        manual_edit_allowed: z.literal(false),
      })
      .strict(),
    profile_digest: digestSchema,
  })
  .strict();

const catalogSchema = z
  .object({
    schema_version: z.literal("helix-distribution-profile-catalog.v1"),
    profiles: z.array(profileSchema).min(1),
  })
  .strict();

export type DistributionProfile = z.infer<typeof profileSchema>;
export type DistributionProfileCatalog = z.infer<typeof catalogSchema>;

export type DistributionProfileFailure =
  | "catalog_invalid"
  | "profile_duplicate"
  | "capability_duplicate"
  | "capability_overlap"
  | "profile_digest_mismatch"
  | "refinement_authority_missing"
  | "refinement_authority_mismatch";

export interface DistributionProfileLoadResult {
  ok: boolean;
  catalog?: DistributionProfileCatalog;
  failures: DistributionProfileFailure[];
}

export function distributionProfileDigest(profile: DistributionProfile): string {
  const { profile_digest: _profileDigest, ...material } = profile;
  return sha256Digest(canonicalJson(material));
}

function unique(values: readonly string[]): boolean {
  return new Set(values).size === values.length;
}

export function validateDistributionProfileCatalog(input: unknown): DistributionProfileLoadResult {
  const parsed = catalogSchema.safeParse(input);
  if (!parsed.success) return { ok: false, failures: ["catalog_invalid"] };

  const failures = new Set<DistributionProfileFailure>();
  const profileIds = parsed.data.profiles.map((profile) => profile.profile_id);
  if (!unique(profileIds)) failures.add("profile_duplicate");

  for (const profile of parsed.data.profiles) {
    if (!unique(profile.capability_allowlist) || !unique(profile.capability_exclusions)) {
      failures.add("capability_duplicate");
    }
    const exclusions = new Set(profile.capability_exclusions);
    if (profile.capability_allowlist.some((capability) => exclusions.has(capability))) {
      failures.add("capability_overlap");
    }
    if (distributionProfileDigest(profile) !== profile.profile_digest) {
      failures.add("profile_digest_mismatch");
    }
  }

  return {
    ok: failures.size === 0,
    catalog: parsed.data,
    failures: [...failures],
  };
}

export function loadDistributionProfileCatalog(repoRoot: string): DistributionProfileLoadResult {
  let raw: unknown;
  try {
    raw = JSON.parse(
      readFileSync(join(repoRoot, "config/distribution-profile-catalog.json"), "utf8"),
    );
  } catch {
    return { ok: false, failures: ["catalog_invalid"] };
  }
  const validated = validateDistributionProfileCatalog(raw);
  if (!validated.ok || !validated.catalog) return validated;

  let refinementContracts: Record<string, { semantic_digest?: string }>;
  try {
    refinementContracts = JSON.parse(
      readFileSync(join(repoRoot, "requirements-ir/refinement_contracts.json"), "utf8"),
    ) as Record<string, { semantic_digest?: string }>;
  } catch {
    return { ok: false, failures: ["refinement_authority_missing"] };
  }

  const failures = new Set(validated.failures);
  for (const profile of validated.catalog.profiles) {
    const refinement = refinementContracts[profile.source_authority.refinement_contract_id];
    if (!refinement) {
      failures.add("refinement_authority_missing");
    } else if (refinement.semantic_digest !== profile.source_authority.refinement_semantic_digest) {
      failures.add("refinement_authority_mismatch");
    }
  }
  return {
    ok: failures.size === 0,
    catalog: validated.catalog,
    failures: [...failures],
  };
}

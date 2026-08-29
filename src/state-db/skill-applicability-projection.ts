import {
  loadSkillApplicabilityRegistry,
  parseSkillApplicability,
  skillApplicabilityRegistrySourceDigest,
} from "../schema/skill-applicability-registry";

export interface AutomationAssetApplicabilityRow {
  applicability_key: string;
  asset_id: string;
  registry_version: string;
  registry_source_digest: string;
  target_axis: string;
  target_id: string;
  polarity: "applicable" | "excluded";
}

export function projectSkillApplicabilityRows(
  assetId: string,
  appliesTo: Record<string, unknown>,
): readonly AutomationAssetApplicabilityRow[] {
  const hasCurrentInput =
    Object.hasOwn(appliesTo, "applicable_identities") ||
    Object.hasOwn(appliesTo, "excluded_identities");
  if (!hasCurrentInput) return [];

  const applicability = parseSkillApplicability({
    applicable_identities: appliesTo.applicable_identities,
    excluded_identities: appliesTo.excluded_identities ?? [],
  });
  const registry = loadSkillApplicabilityRegistry();
  const registrySourceDigest = skillApplicabilityRegistrySourceDigest();
  const rows: AutomationAssetApplicabilityRow[] = [];
  for (const [polarity, identities] of [
    ["applicable", applicability.applicable_identities],
    ["excluded", applicability.excluded_identities],
  ] as const) {
    for (const identity of identities) {
      rows.push({
        applicability_key: [assetId, polarity, identity.target_axis, identity.target_id].join(":"),
        asset_id: assetId,
        registry_version: registry.registry_version,
        registry_source_digest: registrySourceDigest,
        target_axis: identity.target_axis,
        target_id: identity.target_id,
        polarity,
      });
    }
  }
  return rows.sort((left, right) => left.applicability_key.localeCompare(right.applicability_key));
}

import {
  type AcceptanceShadowRecord,
  type RequirementIrShadow,
  type RequirementShadowRecord,
  requirementIrRootDigest,
  requirementIrSemanticDigest,
  type SystemContractShadowRecord,
  type SystemTestShadowRecord,
} from "./requirement-ir-shadow";

export interface CanonicalRequirementRecord
  extends Omit<RequirementShadowRecord, "source" | "semantic_digest"> {
  source: {
    canonical_pointer: string;
    migration_source_pointer: string;
    authority_id: string;
  };
  semantic_digest: string;
}

export interface CanonicalRequirementIr {
  schema_version: "helix-requirement-ir.v1";
  authority: "canonical";
  source_authority: "json_stable_id_shards";
  requirements: CanonicalRequirementRecord[];
  system_contracts: SystemContractShadowRecord[];
  acceptance_cases: AcceptanceShadowRecord[];
  system_tests: SystemTestShadowRecord[];
  root_digest: string;
}

export function promoteRequirementIrToCanonical(
  shadow: RequirementIrShadow,
): CanonicalRequirementIr {
  if (
    shadow.authority !== "shadow_noncanonical" ||
    shadow.source_authority !== "legacy_markdown_current_until_cutover"
  ) {
    throw new Error("only the reviewed legacy Markdown shadow may be promoted");
  }
  const requirements = shadow.requirements.map((record): CanonicalRequirementRecord => {
    const { semantic_digest: _priorDigest, source, ...rest } = record;
    const core = {
      ...rest,
      source: {
        canonical_pointer: `requirements-ir/requirements.json#/${record.requirement_id}`,
        migration_source_pointer: source.canonical_pointer,
        authority_id: source.authority_id,
      },
    };
    return { ...core, semantic_digest: requirementIrSemanticDigest(core) };
  });
  const root = {
    schema_version: "helix-requirement-ir.v1" as const,
    authority: "canonical" as const,
    source_authority: "json_stable_id_shards" as const,
    requirements,
    system_contracts: shadow.system_contracts,
    acceptance_cases: shadow.acceptance_cases,
    system_tests: shadow.system_tests,
  };
  return { ...root, root_digest: requirementIrRootDigest(root) };
}

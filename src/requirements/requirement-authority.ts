import {
  type AcceptanceShadowRecord,
  type RequirementIrShadow,
  type RequirementShadowRecord,
  requirementIrRootDigest,
  requirementIrSemanticDigest,
  type SystemContractShadowRecord,
  type SystemTestShadowRecord,
} from "./requirement-ir-shadow";
import type { RequirementRefinementRecord } from "./requirement-refinement-authority";

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
  schema_version: "helix-requirement-ir.v2";
  authority: "canonical";
  source_authority: "json_stable_id_shards";
  baseline_root_digest: string;
  requirements: CanonicalRequirementRecord[];
  system_contracts: SystemContractShadowRecord[];
  acceptance_cases: AcceptanceShadowRecord[];
  system_tests: SystemTestShadowRecord[];
  refinement_contracts: RequirementRefinementRecord[];
  root_digest: string;
}

export function canonicalRequirementBaselineRootDigest(input: {
  requirements: CanonicalRequirementRecord[];
  system_contracts: SystemContractShadowRecord[];
  acceptance_cases: AcceptanceShadowRecord[];
  system_tests: SystemTestShadowRecord[];
}): string {
  return requirementIrRootDigest({
    schema_version: "helix-requirement-ir.v1",
    authority: "canonical",
    source_authority: "json_stable_id_shards",
    ...input,
  });
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
  const baseline = {
    requirements,
    system_contracts: shadow.system_contracts,
    acceptance_cases: shadow.acceptance_cases,
    system_tests: shadow.system_tests,
  };
  const root = {
    schema_version: "helix-requirement-ir.v2" as const,
    authority: "canonical" as const,
    source_authority: "json_stable_id_shards" as const,
    baseline_root_digest: canonicalRequirementBaselineRootDigest(baseline),
    ...baseline,
    refinement_contracts: [],
  };
  return { ...root, root_digest: requirementIrRootDigest(root) };
}

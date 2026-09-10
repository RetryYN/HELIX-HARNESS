import { z } from "zod";
import type { CanonicalRequirementIr } from "./requirement-authority";
import { requirementIrSemanticDigest } from "./requirement-ir-shadow";

export const REQUIREMENT_DEFINITION_TRACE_CENSUS_VERSION =
  "helix-requirement-definition-trace-census.v1" as const;
export const REQUIREMENT_DEFINITION_TRACE_CENSUS_INPUT_VERSION =
  "helix-requirement-definition-trace-census-input.v1" as const;

export const TRACE_RELATION_TYPES = ["REFINES", "SATISFIES", "SHARED_BY", "ACCEPTED_BY"] as const;

export const TRACE_FINDING_CODES = [
  "REQUIREMENT_WITHOUT_DEFINITION",
  "DEFINITION_WITHOUT_REQUIREMENT",
  "STALE_REVISION_EDGE",
  "AMBIGUOUS_TRACE",
  "VALID_SHARED_REQUIREMENT",
] as const;

export const TRACE_DEFECT_CODES = [
  "REQUIREMENT_WITHOUT_DEFINITION",
  "DEFINITION_WITHOUT_REQUIREMENT",
  "STALE_REVISION_EDGE",
  "AMBIGUOUS_TRACE",
] as const;

export type TraceRelationType = (typeof TRACE_RELATION_TYPES)[number];
export type TraceFindingCode = (typeof TRACE_FINDING_CODES)[number];
export type TraceNodeType = "requirement" | "system_contract" | "acceptance_case";
export type TraceEdgeStatus = "current" | "stale" | "ambiguous" | "orphan";

const idSchema = z
  .string()
  .min(1)
  .regex(/^[A-Za-z0-9][A-Za-z0-9._:-]*$/);
const digestSchema = z.string().regex(/^sha256:[a-f0-9]{64}$/);

const requirementSchema = z.object({
  requirement_id: idSchema,
  revision: z.number().int().positive(),
  semantic_digest: digestSchema,
  primary_system_contract_id: idSchema,
  acceptance_ids: z.array(idSchema),
  downstream_obligation: z.object({
    owner_id: idSchema,
  }),
});

const systemContractSchema = z.object({
  system_contract_id: idSchema,
  revision: z.number().int().positive(),
  semantic_digest: digestSchema,
  requirement_ids: z.array(idSchema),
});

const acceptanceSchema = z.object({
  acceptance_id: idSchema,
  revision: z.number().int().positive(),
  semantic_digest: digestSchema,
  system_contract_id: idSchema,
});

const censusInputSchema = z.object({
  schema_version: z.literal(REQUIREMENT_DEFINITION_TRACE_CENSUS_INPUT_VERSION).optional(),
  requirements: z.array(requirementSchema),
  system_contracts: z.array(systemContractSchema),
  acceptance_cases: z.array(acceptanceSchema),
});

export type RequirementDefinitionTraceCensusInput = z.infer<typeof censusInputSchema>;

export interface RequirementDefinitionTraceEdge {
  edge_id: string;
  source_id: string;
  source_type: TraceNodeType;
  source_revision: number;
  target_id: string;
  target_type: TraceNodeType;
  target_revision: number | null;
  relation_type: TraceRelationType;
  semantic_role: string;
  owner: string;
  source_digest: string;
  target_digest: string | null;
  status: TraceEdgeStatus;
  evidence: string;
}

export interface RequirementDefinitionTraceFinding {
  finding_id: string;
  code: TraceFindingCode;
  subject_id: string;
  edge_id: string | null;
  owner: string;
  message: string;
  evidence: string[];
}

export interface RequirementDefinitionTraceCensusResult {
  schema_version: typeof REQUIREMENT_DEFINITION_TRACE_CENSUS_VERSION;
  ok: boolean;
  graph_digest: string;
  edges: RequirementDefinitionTraceEdge[];
  findings: RequirementDefinitionTraceFinding[];
}

const DEFECT_CODE_SET = new Set<string>(TRACE_DEFECT_CODES);

function compareText(left: string, right: string): number {
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}

function uniquePreserveOrder(values: readonly string[]): {
  unique: string[];
  duplicates: string[];
} {
  const seen = new Set<string>();
  const unique: string[] = [];
  const duplicates: string[] = [];
  for (const value of values) {
    if (seen.has(value)) {
      if (!duplicates.includes(value)) duplicates.push(value);
      continue;
    }
    seen.add(value);
    unique.push(value);
  }
  return { unique, duplicates };
}

function indexById<T>(
  records: readonly T[],
  identity: (record: T) => string,
): { byId: Map<string, T>; duplicates: string[] } {
  const grouped = new Map<string, T[]>();
  for (const record of records) {
    const id = identity(record);
    const group = grouped.get(id) ?? [];
    group.push(record);
    grouped.set(id, group);
  }
  const byId = new Map<string, T>();
  const duplicates: string[] = [];
  for (const [id, group] of [...grouped.entries()].sort(([left], [right]) =>
    compareText(left, right),
  )) {
    if (group.length === 1 && group[0] !== undefined) byId.set(id, group[0]);
    else duplicates.push(id);
  }
  return { byId, duplicates };
}

function edgeId(relationType: TraceRelationType, sourceId: string, targetId: string): string {
  return `${relationType}:${sourceId}->${targetId}`;
}

function findingId(code: TraceFindingCode, subjectId: string, qualifier = ""): string {
  return `${code}:${subjectId.length}:${subjectId}:${qualifier.length}:${qualifier}`;
}

function pushFinding(
  findings: RequirementDefinitionTraceFinding[],
  finding: RequirementDefinitionTraceFinding,
): void {
  findings.push(finding);
}

function malformedResult(message: string): RequirementDefinitionTraceCensusResult {
  const findings: RequirementDefinitionTraceFinding[] = [
    {
      finding_id: findingId("AMBIGUOUS_TRACE", "input"),
      code: "AMBIGUOUS_TRACE",
      subject_id: "input",
      edge_id: null,
      owner: "",
      message,
      evidence: ["declared census input failed schema or identity admission"],
    },
  ];
  return finalizeResult([], findings);
}

function finalizeResult(
  edges: RequirementDefinitionTraceEdge[],
  findings: RequirementDefinitionTraceFinding[],
): RequirementDefinitionTraceCensusResult {
  const sortedEdges = [...edges].sort((left, right) => compareText(left.edge_id, right.edge_id));
  const sortedFindings = [...findings].sort((left, right) =>
    compareText(left.finding_id, right.finding_id),
  );
  return {
    schema_version: REQUIREMENT_DEFINITION_TRACE_CENSUS_VERSION,
    ok: sortedFindings.every((finding) => !DEFECT_CODE_SET.has(finding.code)),
    graph_digest: requirementIrSemanticDigest({
      schema_version: REQUIREMENT_DEFINITION_TRACE_CENSUS_VERSION,
      edges: sortedEdges,
      findings: sortedFindings,
    }),
    edges: sortedEdges,
    findings: sortedFindings,
  };
}

export function requirementDefinitionTraceCensusInputFromCanonicalIr(
  ir: CanonicalRequirementIr,
): RequirementDefinitionTraceCensusInput {
  return {
    schema_version: REQUIREMENT_DEFINITION_TRACE_CENSUS_INPUT_VERSION,
    requirements: ir.requirements.map((record) => ({
      requirement_id: record.requirement_id,
      revision: record.revision,
      semantic_digest: record.semantic_digest,
      primary_system_contract_id: record.primary_system_contract_id,
      acceptance_ids: [...record.acceptance_ids],
      downstream_obligation: { owner_id: record.downstream_obligation.owner_id },
    })),
    system_contracts: ir.system_contracts.map((record) => ({
      system_contract_id: record.system_contract_id,
      revision: record.revision,
      semantic_digest: record.semantic_digest,
      requirement_ids: [...record.requirement_ids],
    })),
    acceptance_cases: ir.acceptance_cases.map((record) => ({
      acceptance_id: record.acceptance_id,
      revision: record.revision,
      semantic_digest: record.semantic_digest,
      system_contract_id: record.system_contract_id,
    })),
  };
}

export function compileRequirementDefinitionTraceCensus(
  input: unknown,
): RequirementDefinitionTraceCensusResult {
  const parsed = censusInputSchema.safeParse(input);
  if (!parsed.success) {
    return malformedResult("census input is not a declared Requirement IR projection");
  }

  const requirements = indexById(parsed.data.requirements, (record) => record.requirement_id);
  const contracts = indexById(parsed.data.system_contracts, (record) => record.system_contract_id);
  const acceptances = indexById(parsed.data.acceptance_cases, (record) => record.acceptance_id);
  const edges: RequirementDefinitionTraceEdge[] = [];
  const findings: RequirementDefinitionTraceFinding[] = [];

  for (const duplicateId of [
    ...requirements.duplicates.map((id) => `requirement:${id}`),
    ...contracts.duplicates.map((id) => `system_contract:${id}`),
    ...acceptances.duplicates.map((id) => `acceptance_case:${id}`),
  ]) {
    pushFinding(findings, {
      finding_id: findingId("AMBIGUOUS_TRACE", duplicateId, "duplicate-id"),
      code: "AMBIGUOUS_TRACE",
      subject_id: duplicateId,
      edge_id: null,
      owner: "",
      message: "同一stable IDが複数recordに現れ、traceを一意に確定できない",
      evidence: [duplicateId],
    });
  }

  for (const requirement of requirements.byId.values()) {
    const owner = requirement.downstream_obligation.owner_id;
    const primary = contracts.byId.get(requirement.primary_system_contract_id);
    const refinesId = edgeId(
      "REFINES",
      requirement.requirement_id,
      requirement.primary_system_contract_id,
    );
    const ownerMismatch = owner !== requirement.primary_system_contract_id;

    if (ownerMismatch) {
      pushFinding(findings, {
        finding_id: findingId("AMBIGUOUS_TRACE", requirement.requirement_id, "owner"),
        code: "AMBIGUOUS_TRACE",
        subject_id: requirement.requirement_id,
        edge_id: refinesId,
        owner,
        message: "primary_system_contract_idとdownstream_obligation.owner_idが不一致",
        evidence: [requirement.primary_system_contract_id, owner],
      });
    }

    if (!primary) {
      edges.push({
        edge_id: refinesId,
        source_id: requirement.requirement_id,
        source_type: "requirement",
        source_revision: requirement.revision,
        target_id: requirement.primary_system_contract_id,
        target_type: "system_contract",
        target_revision: null,
        relation_type: "REFINES",
        semantic_role: "requirement-to-definition",
        owner,
        source_digest: requirement.semantic_digest,
        target_digest: null,
        status: "orphan",
        evidence: "primary_system_contract_id",
      });
      pushFinding(findings, {
        finding_id: findingId("REQUIREMENT_WITHOUT_DEFINITION", requirement.requirement_id),
        code: "REQUIREMENT_WITHOUT_DEFINITION",
        subject_id: requirement.requirement_id,
        edge_id: refinesId,
        owner,
        message: "Requirementが宣言したDefinitionがsystem_contractsに存在しない",
        evidence: [requirement.primary_system_contract_id],
      });
    } else {
      const ambiguous = ownerMismatch;
      const status: TraceEdgeStatus = ambiguous ? "ambiguous" : "current";
      edges.push({
        edge_id: refinesId,
        source_id: requirement.requirement_id,
        source_type: "requirement",
        source_revision: requirement.revision,
        target_id: primary.system_contract_id,
        target_type: "system_contract",
        target_revision: primary.revision,
        relation_type: "REFINES",
        semantic_role: "requirement-to-definition",
        owner,
        source_digest: requirement.semantic_digest,
        target_digest: primary.semantic_digest,
        status,
        evidence: "primary_system_contract_id",
      });
    }

    const acceptanceIds = uniquePreserveOrder(requirement.acceptance_ids);
    for (const duplicateAcceptance of acceptanceIds.duplicates) {
      pushFinding(findings, {
        finding_id: findingId(
          "AMBIGUOUS_TRACE",
          requirement.requirement_id,
          `acceptance-dup:${duplicateAcceptance}`,
        ),
        code: "AMBIGUOUS_TRACE",
        subject_id: requirement.requirement_id,
        edge_id: null,
        owner,
        message: "同一acceptance_idがRequirement上で重複宣言されている",
        evidence: [duplicateAcceptance],
      });
    }
    for (const acceptanceId of acceptanceIds.unique) {
      const acceptedId = edgeId("ACCEPTED_BY", requirement.requirement_id, acceptanceId);
      const acceptance = acceptances.byId.get(acceptanceId);
      if (!acceptance) {
        edges.push({
          edge_id: acceptedId,
          source_id: requirement.requirement_id,
          source_type: "requirement",
          source_revision: requirement.revision,
          target_id: acceptanceId,
          target_type: "acceptance_case",
          target_revision: null,
          relation_type: "ACCEPTED_BY",
          semantic_role: "requirement-to-acceptance",
          owner,
          source_digest: requirement.semantic_digest,
          target_digest: null,
          status: "ambiguous",
          evidence: "acceptance_ids",
        });
        pushFinding(findings, {
          finding_id: findingId(
            "AMBIGUOUS_TRACE",
            requirement.requirement_id,
            `acceptance:${acceptanceId}`,
          ),
          code: "AMBIGUOUS_TRACE",
          subject_id: requirement.requirement_id,
          edge_id: acceptedId,
          owner,
          message: "宣言されたacceptance_idがacceptance_casesに存在しない",
          evidence: [acceptanceId],
        });
        continue;
      }
      const acceptanceContractKnown = contracts.byId.has(acceptance.system_contract_id);
      const acceptanceContractMatches =
        acceptance.system_contract_id === requirement.primary_system_contract_id;
      const acceptanceAmbiguous = !acceptanceContractKnown || !acceptanceContractMatches;
      edges.push({
        edge_id: acceptedId,
        source_id: requirement.requirement_id,
        source_type: "requirement",
        source_revision: requirement.revision,
        target_id: acceptance.acceptance_id,
        target_type: "acceptance_case",
        target_revision: acceptance.revision,
        relation_type: "ACCEPTED_BY",
        semantic_role: "requirement-to-acceptance",
        owner,
        source_digest: requirement.semantic_digest,
        target_digest: acceptance.semantic_digest,
        status: acceptanceAmbiguous ? "ambiguous" : "current",
        evidence: "acceptance_ids",
      });
      if (acceptanceAmbiguous) {
        pushFinding(findings, {
          finding_id: findingId(
            "AMBIGUOUS_TRACE",
            requirement.requirement_id,
            `acceptance-contract:${acceptance.acceptance_id}`,
          ),
          code: "AMBIGUOUS_TRACE",
          subject_id: requirement.requirement_id,
          edge_id: acceptedId,
          owner,
          message:
            "Acceptanceのsystem_contract_idがRequirementのprimary contractと一致しない、または実在しない",
          evidence: [
            `expected:${requirement.primary_system_contract_id}`,
            `actual:${acceptance.system_contract_id}`,
            `actual_contract_known:${acceptanceContractKnown}`,
          ],
        });
      }
    }
  }

  for (const contract of contracts.byId.values()) {
    const declared = uniquePreserveOrder(contract.requirement_ids);
    for (const duplicateRequirement of declared.duplicates) {
      pushFinding(findings, {
        finding_id: findingId(
          "AMBIGUOUS_TRACE",
          contract.system_contract_id,
          `requirement-dup:${duplicateRequirement}`,
        ),
        code: "AMBIGUOUS_TRACE",
        subject_id: contract.system_contract_id,
        edge_id: null,
        owner: contract.system_contract_id,
        message: "同一requirement_idがDefinition上で重複宣言されている",
        evidence: [duplicateRequirement],
      });
    }

    const resolved = declared.unique
      .map((requirementId) => requirements.byId.get(requirementId))
      .filter((record): record is NonNullable<typeof record> => record !== undefined);
    const validSharedMembers = resolved.filter(
      (requirement) =>
        requirement.primary_system_contract_id === contract.system_contract_id &&
        requirement.downstream_obligation.owner_id === contract.system_contract_id,
    );

    if (declared.unique.length === 0 || resolved.length === 0) {
      pushFinding(findings, {
        finding_id: findingId("DEFINITION_WITHOUT_REQUIREMENT", contract.system_contract_id),
        code: "DEFINITION_WITHOUT_REQUIREMENT",
        subject_id: contract.system_contract_id,
        edge_id: null,
        owner: contract.system_contract_id,
        message: "Definitionが親Requirementを持たない",
        evidence: declared.unique,
      });
    }

    if (validSharedMembers.length >= 2) {
      pushFinding(findings, {
        finding_id: findingId("VALID_SHARED_REQUIREMENT", contract.system_contract_id),
        code: "VALID_SHARED_REQUIREMENT",
        subject_id: contract.system_contract_id,
        edge_id: null,
        owner: contract.system_contract_id,
        message: "複数Requirementが同一Definitionを正当に共有している",
        evidence: validSharedMembers.map((record) => record.requirement_id).sort(compareText),
      });
    }

    for (const requirementId of declared.unique) {
      const satisfiesId = edgeId("SATISFIES", contract.system_contract_id, requirementId);
      const requirement = requirements.byId.get(requirementId);
      if (!requirement) {
        edges.push({
          edge_id: satisfiesId,
          source_id: contract.system_contract_id,
          source_type: "system_contract",
          source_revision: contract.revision,
          target_id: requirementId,
          target_type: "requirement",
          target_revision: null,
          relation_type: "SATISFIES",
          semantic_role: "definition-to-requirement",
          owner: contract.system_contract_id,
          source_digest: contract.semantic_digest,
          target_digest: null,
          status: "orphan",
          evidence: "system_contract.requirement_ids",
        });
        if (resolved.length > 0) {
          pushFinding(findings, {
            finding_id: findingId(
              "AMBIGUOUS_TRACE",
              contract.system_contract_id,
              `requirement:${requirementId}`,
            ),
            code: "AMBIGUOUS_TRACE",
            subject_id: contract.system_contract_id,
            edge_id: satisfiesId,
            owner: contract.system_contract_id,
            message: "Definitionが宣言したrequirement_idがrequirementsに存在しない",
            evidence: [requirementId],
          });
        }
        continue;
      }
      const membershipAmbiguous =
        requirement.primary_system_contract_id !== contract.system_contract_id ||
        requirement.downstream_obligation.owner_id !== contract.system_contract_id;
      edges.push({
        edge_id: satisfiesId,
        source_id: contract.system_contract_id,
        source_type: "system_contract",
        source_revision: contract.revision,
        target_id: requirement.requirement_id,
        target_type: "requirement",
        target_revision: requirement.revision,
        relation_type: "SATISFIES",
        semantic_role: "definition-to-requirement",
        owner: contract.system_contract_id,
        source_digest: contract.semantic_digest,
        target_digest: requirement.semantic_digest,
        status: membershipAmbiguous ? "ambiguous" : "current",
        evidence: "system_contract.requirement_ids",
      });
      if (membershipAmbiguous) {
        pushFinding(findings, {
          finding_id: findingId(
            "AMBIGUOUS_TRACE",
            contract.system_contract_id,
            `membership:${requirement.requirement_id}`,
          ),
          code: "AMBIGUOUS_TRACE",
          subject_id: contract.system_contract_id,
          edge_id: satisfiesId,
          owner: contract.system_contract_id,
          message:
            "Definition側のRequirement宣言がRequirement側のprimary contract/ownerと一致しない",
          evidence: [
            `requirement_primary:${requirement.primary_system_contract_id}`,
            `requirement_owner:${requirement.downstream_obligation.owner_id}`,
          ],
        });
      }
      if (validSharedMembers.length >= 2 && !membershipAmbiguous) {
        edges.push({
          edge_id: edgeId("SHARED_BY", contract.system_contract_id, requirement.requirement_id),
          source_id: contract.system_contract_id,
          source_type: "system_contract",
          source_revision: contract.revision,
          target_id: requirement.requirement_id,
          target_type: "requirement",
          target_revision: requirement.revision,
          relation_type: "SHARED_BY",
          semantic_role: "shared-definition",
          owner: contract.system_contract_id,
          source_digest: contract.semantic_digest,
          target_digest: requirement.semantic_digest,
          status: "current",
          evidence: "system_contract.requirement_ids",
        });
      }
    }
  }

  return finalizeResult(edges, findings);
}

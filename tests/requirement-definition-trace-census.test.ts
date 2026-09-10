import { describe, expect, it } from "vitest";
import {
  compileRequirementDefinitionTraceCensus,
  REQUIREMENT_DEFINITION_TRACE_CENSUS_INPUT_VERSION,
  REQUIREMENT_DEFINITION_TRACE_CENSUS_VERSION,
  requirementDefinitionTraceCensusInputFromCanonicalIr,
} from "../src/requirements/requirement-definition-trace-census";
import { loadCanonicalRequirementIrFromShards } from "../src/requirements/requirement-generated-view";
import { requirementIrSemanticDigest } from "../src/requirements/requirement-ir-shadow";

const DIGEST_A = requirementIrSemanticDigest({ fixture: "requirement-a" });
const DIGEST_B = requirementIrSemanticDigest({ fixture: "requirement-b" });
const DIGEST_C = requirementIrSemanticDigest({ fixture: "contract-shared" });
const DIGEST_AC_A = requirementIrSemanticDigest({ fixture: "acceptance-a" });
const DIGEST_AC_B = requirementIrSemanticDigest({ fixture: "acceptance-b" });

function requirement(input: {
  requirement_id: string;
  revision?: number;
  primary_system_contract_id: string;
  owner_id: string;
  acceptance_ids?: string[];
  semantic_digest?: string;
}) {
  return {
    requirement_id: input.requirement_id,
    revision: input.revision ?? 1,
    semantic_digest: input.semantic_digest ?? DIGEST_A,
    primary_system_contract_id: input.primary_system_contract_id,
    acceptance_ids: input.acceptance_ids ?? [],
    downstream_obligation: { owner_id: input.owner_id },
  };
}

function contract(input: {
  system_contract_id: string;
  revision?: number;
  requirement_ids: string[];
  semantic_digest?: string;
}) {
  return {
    system_contract_id: input.system_contract_id,
    revision: input.revision ?? 1,
    semantic_digest: input.semantic_digest ?? DIGEST_C,
    requirement_ids: input.requirement_ids,
  };
}

function acceptance(input: {
  acceptance_id: string;
  revision?: number;
  system_contract_id: string;
  semantic_digest?: string;
}) {
  return {
    acceptance_id: input.acceptance_id,
    revision: input.revision ?? 1,
    semantic_digest: input.semantic_digest ?? DIGEST_AC_A,
    system_contract_id: input.system_contract_id,
  };
}

function sharedFixture() {
  return {
    schema_version: REQUIREMENT_DEFINITION_TRACE_CENSUS_INPUT_VERSION,
    requirements: [
      requirement({
        requirement_id: "HIL-BR-01",
        primary_system_contract_id: "HR-FR-HIL-02",
        owner_id: "HR-FR-HIL-02",
        acceptance_ids: ["HAC-HIL-02a"],
        semantic_digest: DIGEST_A,
      }),
      requirement({
        requirement_id: "HIL-FR-01",
        primary_system_contract_id: "HR-FR-HIL-02",
        owner_id: "HR-FR-HIL-02",
        acceptance_ids: ["HAC-HIL-02b"],
        semantic_digest: DIGEST_B,
      }),
    ],
    system_contracts: [
      contract({
        system_contract_id: "HR-FR-HIL-02",
        requirement_ids: ["HIL-BR-01", "HIL-FR-01"],
      }),
    ],
    acceptance_cases: [
      acceptance({
        acceptance_id: "HAC-HIL-02a",
        system_contract_id: "HR-FR-HIL-02",
        semantic_digest: DIGEST_AC_A,
      }),
      acceptance({
        acceptance_id: "HAC-HIL-02b",
        system_contract_id: "HR-FR-HIL-02",
        semantic_digest: DIGEST_AC_B,
      }),
    ],
  };
}

describe("requirement-definition-trace-census", () => {
  it("U-RDTC-001: [PLAN-RECOVERY-1684-requirement-definition-trace-census/U-RDTC-001] 正当なmany-to-many共有をduplicateにしない", () => {
    const result = compileRequirementDefinitionTraceCensus(sharedFixture());
    expect(result.schema_version).toBe(REQUIREMENT_DEFINITION_TRACE_CENSUS_VERSION);
    expect(result.ok).toBe(true);
    expect(result.edges.map((edge) => edge.edge_id)).toEqual([
      "ACCEPTED_BY:HIL-BR-01->HAC-HIL-02a",
      "ACCEPTED_BY:HIL-FR-01->HAC-HIL-02b",
      "REFINES:HIL-BR-01->HR-FR-HIL-02",
      "REFINES:HIL-FR-01->HR-FR-HIL-02",
      "SATISFIES:HR-FR-HIL-02->HIL-BR-01",
      "SATISFIES:HR-FR-HIL-02->HIL-FR-01",
      "SHARED_BY:HR-FR-HIL-02->HIL-BR-01",
      "SHARED_BY:HR-FR-HIL-02->HIL-FR-01",
    ]);
    expect(result.findings).toEqual([
      {
        finding_id: "VALID_SHARED_REQUIREMENT:12:HR-FR-HIL-02:0:",
        code: "VALID_SHARED_REQUIREMENT",
        subject_id: "HR-FR-HIL-02",
        edge_id: null,
        owner: "HR-FR-HIL-02",
        message: "複数Requirementが同一Definitionを正当に共有している",
        evidence: ["HIL-BR-01", "HIL-FR-01"],
      },
    ]);
    const sharedCodes: string[] = result.findings.map((finding) => finding.code);
    expect(sharedCodes.includes("DUPLICATE_SEMANTIC_OBLIGATION")).toBe(false);
    expect(
      result.edges
        .filter((edge) => edge.relation_type === "REFINES")
        .every((edge) => edge.owner === "HR-FR-HIL-02" && edge.status === "current"),
    ).toBe(true);
  });

  it("U-RDTC-002: [PLAN-RECOVERY-1684-requirement-definition-trace-census/U-RDTC-002] Definition欠落をorphanとして分類する", () => {
    const result = compileRequirementDefinitionTraceCensus({
      requirements: [
        requirement({
          requirement_id: "HIL-BR-99",
          primary_system_contract_id: "HR-FR-HIL-99",
          owner_id: "HR-FR-HIL-99",
        }),
      ],
      system_contracts: [],
      acceptance_cases: [],
    });
    expect(result.ok).toBe(false);
    expect(result.findings.map((finding) => finding.code)).toEqual([
      "REQUIREMENT_WITHOUT_DEFINITION",
    ]);
    expect(result.edges).toEqual([
      expect.objectContaining({
        edge_id: "REFINES:HIL-BR-99->HR-FR-HIL-99",
        status: "orphan",
        target_revision: null,
        owner: "HR-FR-HIL-99",
      }),
    ]);
  });

  it("U-RDTC-003: [PLAN-RECOVERY-1684-requirement-definition-trace-census/U-RDTC-003] 親Requirement欠落をorphanとして分類する", () => {
    const result = compileRequirementDefinitionTraceCensus({
      requirements: [],
      system_contracts: [
        contract({
          system_contract_id: "HR-FR-HIL-99",
          requirement_ids: ["HIL-BR-99"],
        }),
      ],
      acceptance_cases: [],
    });
    expect(result.ok).toBe(false);
    expect(result.findings.map((finding) => finding.code)).toEqual([
      "DEFINITION_WITHOUT_REQUIREMENT",
    ]);
    expect(result.edges[0]).toEqual(
      expect.objectContaining({
        edge_id: "SATISFIES:HR-FR-HIL-99->HIL-BR-99",
        status: "orphan",
        owner: "HR-FR-HIL-99",
      }),
    );
  });

  it("U-RDTC-004: [PLAN-RECOVERY-1684-requirement-definition-trace-census/U-RDTC-004] 明示bindingなしにrevision差をstaleへ推測しない", () => {
    const fixture = sharedFixture();
    fixture.requirements[0] = {
      ...fixture.requirements[0],
      revision: 2,
    };
    const result = compileRequirementDefinitionTraceCensus(fixture);
    expect(result.ok).toBe(true);
    expect(result.findings.some((finding) => finding.code === "STALE_REVISION_EDGE")).toBe(false);
    expect(
      result.edges.find((edge) => edge.edge_id === "REFINES:HIL-BR-01->HR-FR-HIL-02")?.status,
    ).toBe("current");
    expect(result.findings.some((finding) => finding.code === "VALID_SHARED_REQUIREMENT")).toBe(
      true,
    );
  });

  it("U-RDTC-005: [PLAN-RECOVERY-1684-requirement-definition-trace-census/U-RDTC-005] owner不一致をambiguousにする", () => {
    const fixture = sharedFixture();
    fixture.requirements[1] = {
      ...fixture.requirements[1],
      downstream_obligation: { owner_id: "HR-FR-HIL-08" },
    };
    const result = compileRequirementDefinitionTraceCensus(fixture);
    expect(result.ok).toBe(false);
    expect(result.findings).toContainEqual({
      finding_id: "AMBIGUOUS_TRACE:9:HIL-FR-01:5:owner",
      code: "AMBIGUOUS_TRACE",
      subject_id: "HIL-FR-01",
      edge_id: "REFINES:HIL-FR-01->HR-FR-HIL-02",
      owner: "HR-FR-HIL-08",
      message: "primary_system_contract_idとdownstream_obligation.owner_idが不一致",
      evidence: ["HR-FR-HIL-02", "HR-FR-HIL-08"],
    });
    expect(result.edges.find((edge) => edge.edge_id === "REFINES:HIL-FR-01->HR-FR-HIL-02")).toEqual(
      expect.objectContaining({
        owner: "HR-FR-HIL-08",
        status: "ambiguous",
      }),
    );
  });

  it("U-RDTC-006: [PLAN-RECOVERY-1684-requirement-definition-trace-census/U-RDTC-006] 入力順に依存せず既存ownerだけを使う", () => {
    const fixture = sharedFixture();
    const reversed = {
      ...fixture,
      requirements: [...fixture.requirements].reverse(),
      system_contracts: [...fixture.system_contracts],
      acceptance_cases: [...fixture.acceptance_cases].reverse(),
    };
    const first = compileRequirementDefinitionTraceCensus(fixture);
    const second = compileRequirementDefinitionTraceCensus(reversed);
    expect(second.graph_digest).toBe(first.graph_digest);
    expect(second.edges).toEqual(first.edges);
    expect(second.findings).toEqual(first.findings);
    expect(
      first.edges.filter((edge) => edge.relation_type === "REFINES").map((edge) => edge.owner),
    ).toEqual(["HR-FR-HIL-02", "HR-FR-HIL-02"]);
    expect(compileRequirementDefinitionTraceCensus({ unexpected: true }).findings[0]?.code).toBe(
      "AMBIGUOUS_TRACE",
    );

    const duplicateA = requirement({
      requirement_id: "DUP-REQ",
      primary_system_contract_id: "CONTRACT-A",
      owner_id: "CONTRACT-A",
    });
    const duplicateB = requirement({
      requirement_id: "DUP-REQ",
      primary_system_contract_id: "CONTRACT-B",
      owner_id: "CONTRACT-B",
    });
    const duplicateFixture = {
      requirements: [duplicateA, duplicateB],
      system_contracts: [],
      acceptance_cases: [],
    };
    const duplicateForward = compileRequirementDefinitionTraceCensus(duplicateFixture);
    const duplicateReverse = compileRequirementDefinitionTraceCensus({
      ...duplicateFixture,
      requirements: [...duplicateFixture.requirements].reverse(),
    });
    expect(duplicateForward.graph_digest).toBe(duplicateReverse.graph_digest);
    expect(duplicateForward.edges).toEqual([]);
    expect(duplicateForward.findings).toEqual(duplicateReverse.findings);
    expect(duplicateForward.findings).toContainEqual(
      expect.objectContaining({ code: "AMBIGUOUS_TRACE", subject_id: "requirement:DUP-REQ" }),
    );
  });

  it("U-RDTC-007: [PLAN-RECOVERY-1684-requirement-definition-trace-census/U-RDTC-007] current canonical IRの共有をduplicateにしない", () => {
    const ir = loadCanonicalRequirementIrFromShards(process.cwd());
    const input = requirementDefinitionTraceCensusInputFromCanonicalIr(ir);
    const first = compileRequirementDefinitionTraceCensus(input);
    const second = compileRequirementDefinitionTraceCensus(
      requirementDefinitionTraceCensusInputFromCanonicalIr(ir),
    );
    expect(second.graph_digest).toBe(first.graph_digest);
    const liveCodes: string[] = first.findings.map((finding) => finding.code);
    expect(liveCodes.includes("DUPLICATE_SEMANTIC_OBLIGATION")).toBe(false);
    const shared = ir.system_contracts.filter((record) => record.requirement_ids.length >= 2);
    expect(shared.length).toBeGreaterThan(0);
    for (const record of shared) {
      expect(first.findings).toContainEqual(
        expect.objectContaining({
          code: "VALID_SHARED_REQUIREMENT",
          subject_id: record.system_contract_id,
          owner: record.system_contract_id,
        }),
      );
    }
    const sample = ir.requirements[0];
    expect(sample).toBeDefined();
    if (!sample) throw new Error("canonical IR must contain at least one requirement");
    expect(
      first.edges.find(
        (edge) =>
          edge.relation_type === "REFINES" &&
          edge.source_id === sample.requirement_id &&
          edge.target_id === sample.primary_system_contract_id,
      )?.owner,
    ).toBe(sample.downstream_obligation.owner_id);
  });

  it("U-RDTC-008: [PLAN-RECOVERY-1684-requirement-definition-trace-census/U-RDTC-008] Acceptance contract不一致とunknownをsilent greenにしない", () => {
    const fixture = sharedFixture();
    fixture.acceptance_cases[0] = acceptance({
      acceptance_id: "HAC-HIL-02a",
      system_contract_id: "HR-FR-UNKNOWN",
    });
    const result = compileRequirementDefinitionTraceCensus(fixture);
    expect(result.ok).toBe(false);
    expect(result.edges).toContainEqual(
      expect.objectContaining({
        edge_id: "ACCEPTED_BY:HIL-BR-01->HAC-HIL-02a",
        status: "ambiguous",
      }),
    );
    expect(result.findings).toContainEqual(
      expect.objectContaining({
        code: "AMBIGUOUS_TRACE",
        subject_id: "HIL-BR-01",
        evidence: ["expected:HR-FR-HIL-02", "actual:HR-FR-UNKNOWN", "actual_contract_known:false"],
      }),
    );
  });

  it("U-RDTC-009: [PLAN-RECOVERY-1684-requirement-definition-trace-census/U-RDTC-009] finding IDはdelimiterを含む構成要素でも衝突しない", () => {
    const first = compileRequirementDefinitionTraceCensus({
      requirements: [
        requirement({
          requirement_id: "REQ",
          primary_system_contract_id: "CONTRACT-A",
          owner_id: "CONTRACT-A",
          acceptance_ids: ["X:acceptance:Y"],
        }),
      ],
      system_contracts: [contract({ system_contract_id: "CONTRACT-A", requirement_ids: [] })],
      acceptance_cases: [],
    });
    const second = compileRequirementDefinitionTraceCensus({
      requirements: [
        requirement({
          requirement_id: "REQ:acceptance:X",
          primary_system_contract_id: "CONTRACT-A",
          owner_id: "CONTRACT-A",
          acceptance_ids: ["Y"],
        }),
      ],
      system_contracts: [contract({ system_contract_id: "CONTRACT-A", requirement_ids: [] })],
      acceptance_cases: [],
    });
    const firstId = first.findings.find((finding) => finding.subject_id === "REQ")?.finding_id;
    const secondId = second.findings.find(
      (finding) => finding.subject_id === "REQ:acceptance:X",
    )?.finding_id;
    expect(firstId).toBeDefined();
    expect(secondId).toBeDefined();
    expect(firstId).not.toBe(secondId);
  });
});

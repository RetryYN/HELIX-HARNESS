import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { promoteRequirementIrToCanonical } from "../src/requirements/requirement-authority";
import { loadCanonicalRequirementIrFromShards } from "../src/requirements/requirement-generated-view";
import {
  compileRequirementIrShadow,
  correctedDownstreamOwnerExactSet,
  type RequirementIrShadowInput,
} from "../src/requirements/requirement-ir-shadow";

// PLAN-L7-488-requirement-ir-shadow-migration

function input(): RequirementIrShadowInput {
  return {
    requirementSource: readFileSync(
      "docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md",
      "utf8",
    ),
    definitionLedger: readFileSync(
      "docs/governance/infinity-loop-requirement-definition-ledger.md",
      "utf8",
    ),
    systemContractSource: readFileSync(
      "docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md",
      "utf8",
    ),
    systemTestSource: readFileSync(
      "docs/test-design/helix/L3-infinity-loop-acceptance-test-design.md",
      "utf8",
    ),
  };
}

describe("Requirement IR shadow migration", () => {
  it("U-RIR-000: keeps the canonical schema authority and future design ports explicit", () => {
    const schema = JSON.parse(readFileSync("config/requirement-ir-schema.json", "utf8")) as {
      properties: Record<string, { const?: string }>;
      $defs: Record<
        string,
        {
          required?: string[];
          properties?: Record<string, unknown>;
          additionalProperties?: boolean;
        }
      >;
    };
    expect(schema.properties.authority?.const).toBe("canonical");
    expect(schema.properties.source_authority?.const).toBe("json_stable_id_shards");
    for (const port of [
      "design_template_ids",
      "design_obligation_ids",
      "required_design_artifact_kinds",
    ]) {
      expect(schema.$defs.requirement?.required).toContain(port);
      expect(schema.$defs.requirement?.properties).toHaveProperty(port);
    }
    for (const definition of ["requirement", "systemContract", "acceptance", "systemTest"]) {
      expect(schema.$defs[definition]?.additionalProperties).toBe(false);
      expect(schema.$defs[definition]?.required?.length).toBeGreaterThan(8);
    }
  });

  it("U-RIR-001: migrates the exact 153/24/72/24 denominators without canonical authority", () => {
    const shadow = compileRequirementIrShadow(input());
    expect(shadow.authority).toBe("shadow_noncanonical");
    expect(shadow.source_authority).toBe("legacy_markdown_current_until_cutover");
    expect(shadow.requirements).toHaveLength(153);
    expect(shadow.system_contracts).toHaveLength(24);
    expect(shadow.acceptance_cases).toHaveLength(72);
    expect(shadow.system_tests).toHaveLength(24);
    expect(shadow.root_digest).toMatch(/^sha256:[0-9a-f]{64}$/);
  });

  it("U-RIR-002: preserves statement digests and does not invent discovery evidence", () => {
    const shadow = compileRequirementIrShadow(input());
    expect(
      shadow.requirements.every(
        (record) =>
          record.evidence_origin === "legacy_markdown_migration" &&
          record.actor_ids.length === 0 &&
          record.task_ids.length === 0 &&
          record.surface_ids.length === 0 &&
          record.pending_resolution.some((item) => item.includes("no fabricated")),
      ),
    ).toBe(true);
    expect(
      shadow.requirements.every(
        (record) =>
          record.statement.semantic_digest.startsWith("sha256:") &&
          record.semantic_digest.startsWith("sha256:"),
      ),
    ).toBe(true);
  });

  it("U-RIR-003: binds every requirement to exactly one system contract and its L10 oracle", () => {
    const shadow = compileRequirementIrShadow(input());
    const contractIds = new Set(shadow.system_contracts.map((record) => record.system_contract_id));
    const acceptanceIds = new Set(shadow.acceptance_cases.map((record) => record.acceptance_id));
    const systemTestIds = new Set(shadow.system_tests.map((record) => record.system_test_id));
    for (const requirement of shadow.requirements) {
      expect(contractIds.has(requirement.primary_system_contract_id)).toBe(true);
      expect(requirement.acceptance_ids).toHaveLength(3);
      expect(requirement.acceptance_ids.every((id) => acceptanceIds.has(id))).toBe(true);
      expect(systemTestIds.has(requirement.system_test_id)).toBe(true);
    }
  });

  it("U-RIR-004: fixes the exact 12 downstream owners and never routes them to GitHub five", () => {
    const shadow = compileRequirementIrShadow(input());
    const byId = new Map(shadow.requirements.map((record) => [record.requirement_id, record]));
    expect(Object.keys(correctedDownstreamOwnerExactSet)).toHaveLength(12);
    for (const [requirementId, ownerId] of Object.entries(correctedDownstreamOwnerExactSet)) {
      const record = byId.get(requirementId);
      expect(record?.primary_system_contract_id).toBe(ownerId);
      expect(record?.downstream_obligation.owner_id).toBe(ownerId);
      expect(record?.downstream_obligation.owner_id).not.toMatch(
        /github_(merge|approval|environment|update|plan)/,
      );
    }
    expect(byId.get("HIL-FR-64")?.downstream_obligation.route_issue_ids).toEqual([
      225, 226, 227, 194,
    ]);
    expect(byId.get("HIL-BR-33")?.downstream_obligation.route_issue_ids).toEqual([]);
  });

  it("U-RIR-005: fails closed on statement drift, duplicate ownership, and missing rows", () => {
    const base = input();
    expect(() =>
      compileRequirementIrShadow({
        ...base,
        requirementSource: base.requirementSource.replace(
          "Codex自動走行とClaude Code監査",
          "Codex自動走行と別監査",
        ),
      }),
    ).toThrow("statement digest mismatch");

    expect(() =>
      compileRequirementIrShadow({
        ...base,
        systemContractSource: base.systemContractSource.replace(
          "HIL-BR-12, HIL-FR-02",
          "HIL-BR-12, HIL-BR-01, HIL-FR-02",
        ),
      }),
    ).toThrow("multiple primary system contracts");

    expect(() =>
      compileRequirementIrShadow({
        ...base,
        definitionLedger: base.definitionLedger.replace(/^\| HIL-BR-01 \|.*\n/m, ""),
      }),
    ).toThrow("definition ledger count mismatch");

    const firstLedgerRow = base.definitionLedger.match(/^\| HIL-BR-01 \|.*$/m)?.[0];
    expect(firstLedgerRow).toBeTruthy();
    expect(() =>
      compileRequirementIrShadow({
        ...base,
        definitionLedger: base.definitionLedger.replace(
          firstLedgerRow ?? "",
          `${firstLedgerRow}\n${firstLedgerRow}`,
        ),
      }),
    ).toThrow("definition ledger row is duplicated");

    expect(() =>
      compileRequirementIrShadow({
        ...base,
        systemTestSource: base.systemTestSource.replace(
          "HR-FR-HIL-01 / HAC-HIL-01a, HAC-HIL-01b, HAC-HIL-01c",
          "HR-FR-HIL-02 / HAC-HIL-01a, HAC-HIL-01b, HAC-HIL-01c",
        ),
      }),
    ).toThrow("system test linkage mismatch");
  });

  it("U-RIR-006: reproduces only the frozen baseline from the legacy migration source", () => {
    const observed = compileRequirementIrShadow(input());
    const promoted = promoteRequirementIrToCanonical(observed);
    const canonical = loadCanonicalRequirementIrFromShards(process.cwd());
    expect({
      requirements: promoted.requirements,
      system_contracts: promoted.system_contracts,
      acceptance_cases: promoted.acceptance_cases,
      system_tests: promoted.system_tests,
      baseline_root_digest: promoted.baseline_root_digest,
    }).toEqual({
      requirements: canonical.requirements,
      system_contracts: canonical.system_contracts,
      acceptance_cases: canonical.acceptance_cases,
      system_tests: canonical.system_tests,
      baseline_root_digest: canonical.baseline_root_digest,
    });
    expect(promoted.refinement_contracts).toEqual([]);
    expect(canonical.refinement_contracts.map((record) => record.refinement_contract_id)).toEqual([
      "MIC-FR-001",
      "CNW-FR-001",
      "DIST-LITE-FR-001",
      "SYN-FR-001",
      "OPS-FR-001",
      "RLO-FR-001",
    ]);
  });
});

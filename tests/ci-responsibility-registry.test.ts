import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  type CiResponsibilityRegistry,
  deriveVerificationObligations,
  validateCiResponsibilityRegistry,
} from "../src/runtime/ci-responsibility-registry";

// PLAN-L7-711-ci-responsibility-registry / U-CIREG-001..009

function fixture(): CiResponsibilityRegistry {
  return {
    schema_version: "helix-ci-responsibility-registry.v1",
    registry_version: "1.0.0",
    nodes: [
      { id: "issue:1205", kind: "issue", owner: "ci-system-synthesis" },
      { id: "plan:ci-responsibility", kind: "plan", owner: "ci-system-synthesis" },
      { id: "requirement:cis-r-04", kind: "requirement", owner: "ci-system-synthesis" },
      { id: "design:ci-responsibility", kind: "design", owner: "ci-system-synthesis" },
      { id: "contract:ci-responsibility", kind: "contract", owner: "ci-system-synthesis" },
      { id: "module:shared-core", kind: "module", owner: "core" },
      { id: "module:consumer-a", kind: "module", owner: "consumer-a" },
      { id: "v_pair:ci-responsibility", kind: "v_pair", owner: "ci-system-synthesis" },
      { id: "runtime:impact-ci", kind: "runtime", owner: "ci-runtime" },
      { id: "db:harness", kind: "db", owner: "state-db" },
      { id: "distribution:lite", kind: "distribution", owner: "distribution" },
      { id: "security:ci-admission", kind: "security", owner: "security" },
      { id: "artifact:src/core.ts", kind: "artifact", owner: "core" },
      { id: "artifact:docs/requirement.md", kind: "artifact", owner: "ci-system-synthesis" },
      { id: "artifact:docs/plan.md", kind: "artifact", owner: "ci-system-synthesis" },
      { id: "artifact:schema.json", kind: "artifact", owner: "state-db" },
      { id: "artifact:workflow.yml", kind: "artifact", owner: "ci-runtime" },
      { id: "artifact:package-lock.json", kind: "artifact", owner: "distribution" },
    ],
    edges: [
      { from: "issue:1205", to: "plan:ci-responsibility", relation: "contains" },
      { from: "plan:ci-responsibility", to: "requirement:cis-r-04", relation: "implements" },
      { from: "requirement:cis-r-04", to: "design:ci-responsibility", relation: "refines" },
      { from: "design:ci-responsibility", to: "contract:ci-responsibility", relation: "contains" },
      { from: "contract:ci-responsibility", to: "v_pair:ci-responsibility", relation: "verifies" },
      { from: "contract:ci-responsibility", to: "runtime:impact-ci", relation: "implements" },
      { from: "module:shared-core", to: "module:consumer-a", relation: "consumes" },
      { from: "artifact:src/core.ts", to: "module:shared-core", relation: "implements" },
      { from: "artifact:docs/requirement.md", to: "requirement:cis-r-04", relation: "implements" },
      { from: "artifact:docs/plan.md", to: "plan:ci-responsibility", relation: "implements" },
      { from: "artifact:schema.json", to: "db:harness", relation: "implements" },
      { from: "artifact:workflow.yml", to: "runtime:impact-ci", relation: "implements" },
      { from: "artifact:package-lock.json", to: "distribution:lite", relation: "implements" },
      { from: "security:ci-admission", to: "runtime:impact-ci", relation: "depends_on" },
      { from: "db:harness", to: "runtime:impact-ci", relation: "depends_on" },
      { from: "distribution:lite", to: "module:consumer-a", relation: "contains" },
    ],
    capabilities: [
      {
        capability_id: "verification:core-unit",
        responsibility_id: "responsibility:core-unit",
        owner: "core",
        oracle_ids: ["oracle:u-core-001"],
        environments: ["linux"],
        cost_class: "fast",
        risk_class: "low",
        obligation_class: "local",
        parallelism: "parallel_safe",
        artifact_inputs: ["artifact:src/core.ts"],
        artifact_outputs: ["receipt:core-unit"],
        freshness: "same_candidate_head",
        defer_targets: [],
        applicability_node_ids: ["module:shared-core"],
        depends_on_capability_ids: [],
        status: "active",
        replacement_capability_id: null,
        rollback_capability_id: null,
        retirement_consumer_capability_ids: [],
        retirement_history_refs: [],
      },
      {
        capability_id: "verification:consumer-boundary",
        responsibility_id: "responsibility:consumer-boundary",
        owner: "consumer-a",
        oracle_ids: ["oracle:it-consumer-001"],
        environments: ["consumer"],
        cost_class: "bounded",
        risk_class: "medium",
        obligation_class: "boundary",
        parallelism: "parallel_safe",
        artifact_inputs: ["artifact:src/core.ts"],
        artifact_outputs: ["receipt:consumer-boundary"],
        freshness: "same_candidate_head",
        defer_targets: [],
        applicability_node_ids: ["module:consumer-a"],
        depends_on_capability_ids: ["verification:core-unit"],
        status: "active",
        replacement_capability_id: null,
        rollback_capability_id: null,
        retirement_consumer_capability_ids: [],
        retirement_history_refs: [],
      },
      {
        capability_id: "verification:authority-global",
        responsibility_id: "responsibility:authority-global",
        owner: "ci-system-synthesis",
        oracle_ids: ["oracle:cis-ac-004"],
        environments: ["repository"],
        cost_class: "bounded",
        risk_class: "critical",
        obligation_class: "global_invariant",
        parallelism: "serial",
        artifact_inputs: ["artifact:docs/requirement.md"],
        artifact_outputs: ["receipt:authority-global"],
        freshness: "same_candidate_head",
        defer_targets: [],
        applicability_node_ids: [
          "requirement:cis-r-04",
          "plan:ci-responsibility",
          "runtime:impact-ci",
          "db:harness",
          "security:ci-admission",
        ],
        depends_on_capability_ids: [],
        status: "active",
        replacement_capability_id: null,
        rollback_capability_id: null,
        retirement_consumer_capability_ids: [],
        retirement_history_refs: [],
      },
      {
        capability_id: "verification:release-lite",
        responsibility_id: "responsibility:release-lite",
        owner: "distribution",
        oracle_ids: ["oracle:dist-release-001"],
        environments: ["linux", "windows"],
        cost_class: "heavy",
        risk_class: "high",
        obligation_class: "release_only",
        parallelism: "exclusive_state",
        artifact_inputs: ["artifact:package-lock.json"],
        artifact_outputs: ["receipt:release-lite"],
        freshness: "release_candidate",
        defer_targets: ["release"],
        applicability_node_ids: ["distribution:lite"],
        depends_on_capability_ids: ["verification:consumer-boundary"],
        status: "active",
        replacement_capability_id: null,
        rollback_capability_id: null,
        retirement_consumer_capability_ids: [],
        retirement_history_refs: [],
      },
    ],
  };
}

describe("CI Responsibility Registry", () => {
  it("U-CIREG-001: stable identityと全責務fieldを持つregistryを受理する", () => {
    const result = validateCiResponsibilityRegistry(fixture());
    expect(result.ok).toBe(true);
    expect(result.findings).toEqual([]);
    expect(result.registry_digest).toMatch(/^sha256:[a-f0-9]{64}$/);

    const missingDeferAuthority = fixture();
    missingDeferAuthority.capabilities = missingDeferAuthority.capabilities.map((capability) =>
      capability.capability_id === "verification:release-lite"
        ? { ...capability, defer_targets: [] }
        : capability,
    );
    expect(validateCiResponsibilityRegistry(missingDeferAuthority).findings).toContainEqual(
      expect.objectContaining({ code: "schema_invalid", subject: "verification:release-lite" }),
    );
  });

  it("U-CIREG-002: changed sourceからshared coreと全consumer obligationをexact導出する", () => {
    const result = deriveVerificationObligations({
      registry: fixture(),
      authority_node_ids: [],
      changed_artifact_node_ids: ["artifact:src/core.ts"],
    });
    expect(result.ok).toBe(true);
    expect(result.obligation_ids_by_class.local).toEqual(["verification:core-unit"]);
    expect(result.obligation_ids_by_class.boundary).toEqual(["verification:consumer-boundary"]);
    expect(result.obligation_ids_by_class.global_invariant).toEqual([]);
    expect(result.obligation_ids_by_class.release_only).toEqual([]);
    expect(result.affected_node_ids).toContain("module:consumer-a");
    expect(result.affected_node_ids).not.toContain("distribution:lite");
  });

  it("U-CIREG-003: requirements／PLAN／schema／workflow／lockfileをtyped classへ分離する", () => {
    const cases = [
      ["artifact:docs/requirement.md", "global_invariant", "verification:authority-global"],
      ["artifact:docs/plan.md", "global_invariant", "verification:authority-global"],
      ["artifact:schema.json", "global_invariant", "verification:authority-global"],
      ["artifact:workflow.yml", "global_invariant", "verification:authority-global"],
      ["artifact:package-lock.json", "release_only", "verification:release-lite"],
    ] as const;
    for (const [artifact, obligationClass, expected] of cases) {
      const result = deriveVerificationObligations({
        registry: fixture(),
        authority_node_ids: [],
        changed_artifact_node_ids: [artifact],
      });
      expect(result.obligation_ids_by_class[obligationClass], artifact).toContain(expected);
    }
  });

  it("U-CIREG-004: unknown identityとorphan nodeをfail-closeする", () => {
    const registry = fixture();
    registry.nodes = [...registry.nodes, { id: "module:orphan", kind: "module", owner: "orphan" }];
    const admission = validateCiResponsibilityRegistry(registry);
    expect(admission.findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "orphan_node", subject: "module:orphan" }),
      ]),
    );
    const derived = deriveVerificationObligations({
      registry,
      authority_node_ids: [],
      changed_artifact_node_ids: ["artifact:unknown.ts"],
    });
    expect(derived.ok).toBe(false);
    expect(derived.findings).toEqual(
      expect.arrayContaining([expect.objectContaining({ code: "unknown_node" })]),
    );
  });

  it("U-CIREG-005: owner欠落と同一責務の複数ownerを個別拒否する", () => {
    const registry = fixture();
    registry.capabilities = [
      { ...registry.capabilities[0], owner: "" },
      ...registry.capabilities.slice(1),
      {
        ...registry.capabilities[1],
        capability_id: "verification:consumer-shadow",
        owner: "shadow-owner",
      },
    ];
    const result = validateCiResponsibilityRegistry(registry);
    expect(result.findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "owner_missing" }),
        expect.objectContaining({ code: "duplicate_responsibility_owner" }),
      ]),
    );
  });

  it("U-CIREG-006: capability dependency cycleをfail-closeする", () => {
    const registry = fixture();
    registry.capabilities = [
      {
        ...registry.capabilities[0],
        depends_on_capability_ids: ["verification:consumer-boundary"],
      },
      ...registry.capabilities.slice(1),
    ];
    const result = validateCiResponsibilityRegistry(registry);
    expect(result.ok).toBe(false);
    expect(result.findings).toEqual(
      expect.arrayContaining([expect.objectContaining({ code: "dependency_cycle" })]),
    );
  });

  it("U-CIREG-007: retired capabilityはreplacement／rollback／consumer traceを失えない", () => {
    const missingTrace = fixture();
    missingTrace.capabilities = [
      {
        ...missingTrace.capabilities[0],
        status: "retired",
        replacement_capability_id: "verification:consumer-boundary",
        rollback_capability_id: "verification:release-lite",
        retirement_consumer_capability_ids: [],
        retirement_history_refs: [],
      },
      ...missingTrace.capabilities.slice(1),
    ];
    expect(validateCiResponsibilityRegistry(missingTrace).findings).toContainEqual(
      expect.objectContaining({ code: "retirement_contract_invalid" }),
    );

    const completeTrace = fixture();
    completeTrace.capabilities = [
      {
        ...completeTrace.capabilities[0],
        status: "retired",
        replacement_capability_id: "verification:consumer-boundary",
        rollback_capability_id: "verification:release-lite",
        retirement_consumer_capability_ids: ["verification:consumer-boundary"],
        retirement_history_refs: ["receipt:retirement-core-unit-v1"],
      },
      ...completeTrace.capabilities.slice(1),
    ];
    expect(validateCiResponsibilityRegistry(completeTrace)).toMatchObject({
      ok: true,
      findings: [],
    });

    const unknownConsumer = fixture();
    unknownConsumer.capabilities = [
      {
        ...unknownConsumer.capabilities[0],
        status: "retired",
        replacement_capability_id: "verification:consumer-boundary",
        rollback_capability_id: "verification:release-lite",
        retirement_consumer_capability_ids: ["verification:unknown-consumer"],
        retirement_history_refs: ["receipt:retirement-core-unit-v1"],
      },
      ...unknownConsumer.capabilities.slice(1),
    ];
    expect(validateCiResponsibilityRegistry(unknownConsumer).findings).toContainEqual(
      expect.objectContaining({ code: "unknown_node", subject: "verification:unknown-consumer" }),
    );
  });

  it("U-CIREG-008: registry digestは配列順も含むexact authorityを束縛する", () => {
    const current = fixture();
    const reordered = fixture();
    reordered.capabilities = [...reordered.capabilities].reverse();
    expect(validateCiResponsibilityRegistry(current).registry_digest).not.toBe(
      validateCiResponsibilityRegistry(reordered).registry_digest,
    );
  });

  it("U-CIREG-009: production registry authorityが自己整合する", () => {
    const registry = JSON.parse(
      readFileSync("config/ci-responsibility-registry.v1.json", "utf8"),
    ) as CiResponsibilityRegistry;
    expect(validateCiResponsibilityRegistry(registry)).toMatchObject({ ok: true, findings: [] });
  });
});

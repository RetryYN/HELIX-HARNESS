import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import type { CiResponsibilityRegistry } from "../src/runtime/ci-responsibility-registry";
import { ciResponsibilityRegistryDigest } from "../src/runtime/ci-responsibility-registry";
import {
  adaptLegacyImpactCiDecision,
  composeCiVerificationPlan,
  type VerificationPlanInput,
} from "../src/runtime/ci-verification-plan";
import type { ImpactDecision } from "../src/runtime/impact-ci";

// PLAN-L7-706-ci-verification-plan / U-CIVPLAN-001..009

const BASE = "a".repeat(40);
const HEAD = "b".repeat(40);

function registry(): CiResponsibilityRegistry {
  return JSON.parse(
    readFileSync("config/ci-responsibility-registry.v1.json", "utf8"),
  ) as CiResponsibilityRegistry;
}

function input(overrides: Partial<VerificationPlanInput> = {}): VerificationPlanInput {
  const current = registry();
  return {
    registry: current,
    expected_registry_digest: ciResponsibilityRegistryDigest(current),
    work_authority: { kind: "issue", id: "issue:1206" },
    candidate_head: HEAD,
    expected_candidate_head: HEAD,
    base_head: BASE,
    execution_context: "pull_request",
    authority_node_ids: [],
    changed_artifact_node_ids: ["artifact:src/runtime/ci-responsibility-registry.ts"],
    changed_test_capability_ids: [],
    risk_signals: [],
    required_obligation_ids: [],
    defer_assignments: [],
    ...overrides,
  };
}

describe("CI Verification Plan", () => {
  it("U-CIVPLAN-001: 同一authority入力から同一exact partitionとdigestを生成する", () => {
    const first = composeCiVerificationPlan(input());
    const second = composeCiVerificationPlan(input());
    expect(first).toEqual(second);
    expect(first).toMatchObject({
      ok: true,
      local_obligations: ["verification:ci-responsibility-unit"],
      boundary_obligations: ["verification:impact-ci-boundary"],
      global_invariants: [],
      deferred_obligations: [],
    });
    expect(first.plan_digest).toMatch(/^sha256:[a-f0-9]{64}$/);
  });

  it("U-CIVPLAN-002: changed test capabilityをgraph選定外でも必須にする", () => {
    const plan = composeCiVerificationPlan(
      input({
        changed_artifact_node_ids: [],
        changed_test_capability_ids: ["verification:ci-authority-global"],
      }),
    );
    expect(plan.ok).toBe(true);
    expect(plan.global_invariants).toEqual(["verification:ci-authority-global"]);
  });

  it("U-CIVPLAN-003: high-risk／selector／registry変更はactive exact setへfull fallbackする", () => {
    for (const reason of [
      "high_risk",
      "selector_change",
      "registry_change",
      "security_change",
      "schema_change",
      "migration_change",
      "rollback_change",
      "lockfile_change",
    ] as const) {
      const plan = composeCiVerificationPlan(
        input({ changed_artifact_node_ids: [], risk_signals: [reason] }),
      );
      expect(plan.full_fallback_reasons).toEqual([reason]);
      expect(plan.execution_dag.map((node) => node.capability_id)).toEqual([
        "verification:ci-authority-global",
        "verification:ci-responsibility-unit",
        "verification:impact-ci-boundary",
      ]);
    }
  });

  it("U-CIVPLAN-004: unknown identity、wrong HEAD、stale registryを個別fail-closeする", () => {
    const plan = composeCiVerificationPlan(
      input({
        candidate_head: "wrong",
        expected_registry_digest: `sha256:${"0".repeat(64)}`,
        changed_artifact_node_ids: ["artifact:unknown.ts"],
      }),
    );
    expect(plan.ok).toBe(false);
    expect(plan.full_fallback_reasons).toContain("unknown_identity");
    expect(plan.findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "head_invalid" }),
        expect.objectContaining({ code: "registry_digest_stale" }),
        expect.objectContaining({ code: "unknown_capability" }),
      ]),
    );
  });

  it("U-CIVPLAN-005: release-only obligationをPRでexactly-once targetへ延期する", () => {
    const current = registry();
    current.capabilities = [
      ...current.capabilities,
      {
        ...current.capabilities[0],
        capability_id: "verification:release-candidate",
        responsibility_id: "responsibility:release-candidate",
        obligation_class: "release_only",
        defer_targets: ["release"],
        applicability_node_ids: ["module:ci-system-synthesis"],
        depends_on_capability_ids: ["verification:ci-responsibility-unit"],
      },
    ];
    const missing = composeCiVerificationPlan(
      input({
        registry: current,
        expected_registry_digest: ciResponsibilityRegistryDigest(current),
      }),
    );
    expect(missing.findings).toContainEqual(
      expect.objectContaining({ code: "defer_assignment_invalid" }),
    );
    const forbidden = composeCiVerificationPlan(
      input({
        registry: current,
        expected_registry_digest: ciResponsibilityRegistryDigest(current),
        defer_assignments: [
          {
            capability_id: "verification:release-candidate",
            target: "main",
            candidate_head: HEAD,
            receipt_status: "pending",
          },
        ],
      }),
    );
    expect(forbidden.findings).toContainEqual(
      expect.objectContaining({
        code: "defer_assignment_invalid",
        detail: "target_not_allowed:main",
      }),
    );
    const assigned = composeCiVerificationPlan(
      input({
        registry: current,
        expected_registry_digest: ciResponsibilityRegistryDigest(current),
        defer_assignments: [
          {
            capability_id: "verification:release-candidate",
            target: "release",
            candidate_head: HEAD,
            receipt_status: "pending",
          },
        ],
      }),
    );
    expect(assigned.ok).toBe(true);
    expect(assigned.deferred_obligations).toEqual([
      {
        capability_id: "verification:release-candidate",
        target: "release",
        candidate_head: HEAD,
        receipt_status: "pending",
      },
    ]);
  });

  it("U-CIVPLAN-006: duplicate assignmentとdeferred dependencyを拒否する", () => {
    const current = registry();
    current.capabilities = current.capabilities.map((capability) =>
      capability.capability_id === "verification:ci-responsibility-unit"
        ? { ...capability, defer_targets: ["main", "nightly"] }
        : capability,
    );
    const plan = composeCiVerificationPlan(
      input({
        registry: current,
        expected_registry_digest: ciResponsibilityRegistryDigest(current),
        defer_assignments: [
          {
            capability_id: "verification:ci-responsibility-unit",
            target: "main",
            candidate_head: HEAD,
            receipt_status: "pending",
          },
          {
            capability_id: "verification:ci-responsibility-unit",
            target: "nightly",
            candidate_head: HEAD,
            receipt_status: "pending",
          },
        ],
      }),
    );
    expect(plan.findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "duplicate_obligation" }),
        expect.objectContaining({ code: "deferred_dependency_invalid" }),
      ]),
    );
  });

  it("U-CIVPLAN-007: work authority kind mismatchを拒否する", () => {
    const plan = composeCiVerificationPlan(
      input({ work_authority: { kind: "plan", id: "issue:1206" } }),
    );
    expect(plan.findings).toContainEqual(
      expect.objectContaining({ code: "work_authority_invalid" }),
    );
  });

  it("U-CIVPLAN-008: legacy Impact CIをcapability identityへ一方向変換する", () => {
    const decision: ImpactDecision = {
      profile: "draft_preflight",
      baseHead: BASE,
      candidateHead: HEAD,
      bodyDigest: `sha256:${"1".repeat(64)}`,
      inventoryDigest: `sha256:${"2".repeat(64)}`,
      riskClass: "known_low",
      selectedItemIds: ["test:unit"],
      deferredItemIds: ["test:nightly"],
      reasonCodes: [],
      fullAdmissionRequired: false,
    };
    const adapted = adaptLegacyImpactCiDecision({
      decision,
      item_capability_map: {
        "test:unit": "verification:ci-responsibility-unit",
        "test:nightly": "verification:ci-authority-global",
      },
    });
    expect(adapted.findings).toEqual([]);
    expect(adapted.compatibility_capability_ids).toEqual([
      "verification:ci-authority-global",
      "verification:ci-responsibility-unit",
    ]);
    expect(JSON.stringify(adapted)).not.toContain("test:unit");
  });

  it("U-CIVPLAN-009: legacy unknown／overlapをcurrent typed planへ混入させない", () => {
    const decision: ImpactDecision = {
      profile: "candidate_admission",
      baseHead: BASE,
      candidateHead: HEAD,
      bodyDigest: `sha256:${"1".repeat(64)}`,
      inventoryDigest: `sha256:${"2".repeat(64)}`,
      riskClass: "unknown",
      selectedItemIds: ["test:same", "test:unknown"],
      deferredItemIds: ["test:same"],
      reasonCodes: ["unknown_risk"],
      fullAdmissionRequired: true,
    };
    const adapted = adaptLegacyImpactCiDecision({
      decision,
      item_capability_map: { "test:same": "verification:ci-responsibility-unit" },
    });
    expect(adapted.risk_signals).toEqual(["legacy_full_admission"]);
    expect(adapted.findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "unknown_capability", subject: "test:unknown" }),
        expect.objectContaining({ code: "duplicate_obligation" }),
      ]),
    );
  });

  it("U-CIVPLAN-010: exact HEAD束縛とunknown riskを個別fail-closeする", () => {
    const plan = composeCiVerificationPlan(
      input({
        candidate_head: "c".repeat(40),
        risk_signals: ["future_unknown_signal"],
      }),
    );
    expect(plan.ok).toBe(false);
    expect(plan.full_fallback_reasons).toContain("unknown_identity");
    expect(plan.findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "head_mismatch" }),
        expect.objectContaining({ code: "unknown_risk_signal" }),
      ]),
    );
  });

  it("U-CIVPLAN-011: deferred receiptをHEAD・state・digestへ束縛する", () => {
    const current = registry();
    current.capabilities = current.capabilities.map((capability) =>
      capability.capability_id === "verification:ci-responsibility-unit"
        ? { ...capability, defer_targets: ["main"] }
        : capability,
    );
    const wrongHead = composeCiVerificationPlan(
      input({
        registry: current,
        expected_registry_digest: ciResponsibilityRegistryDigest(current),
        defer_assignments: [
          {
            capability_id: "verification:ci-responsibility-unit",
            target: "main",
            candidate_head: BASE,
            receipt_status: "pending",
          },
        ],
      }),
    );
    expect(wrongHead.findings).toContainEqual(
      expect.objectContaining({ code: "deferred_receipt_invalid" }),
    );
    const missingTerminalDigest = composeCiVerificationPlan(
      input({
        registry: current,
        expected_registry_digest: ciResponsibilityRegistryDigest(current),
        defer_assignments: [
          {
            capability_id: "verification:ci-responsibility-unit",
            target: "main",
            candidate_head: HEAD,
            receipt_status: "succeeded",
          },
        ],
      }),
    );
    expect(missingTerminalDigest.ok).toBe(false);
    expect(missingTerminalDigest.findings).toContainEqual(
      expect.objectContaining({
        code: "deferred_receipt_invalid",
        detail: "terminal digest required",
      }),
    );
    const unknownState = composeCiVerificationPlan(
      input({
        registry: current,
        expected_registry_digest: ciResponsibilityRegistryDigest(current),
        defer_assignments: [
          {
            capability_id: "verification:ci-responsibility-unit",
            target: "main",
            candidate_head: HEAD,
            receipt_status: "failed" as "pending",
          },
        ],
      }),
    );
    expect(unknownState.ok).toBe(false);
    expect(unknownState.findings).toContainEqual(
      expect.objectContaining({
        code: "deferred_receipt_invalid",
        detail: "unknown status=failed",
      }),
    );
  });

  it("U-CIVPLAN-012: required obligationを一件削るaggregate mutationを拒否する", () => {
    const plan = composeCiVerificationPlan(
      input({
        changed_artifact_node_ids: [],
        required_obligation_ids: ["verification:ci-responsibility-unit"],
      }),
    );
    expect(plan.ok).toBe(false);
    expect(plan.findings).toContainEqual(
      expect.objectContaining({
        code: "required_obligation_missing",
        subject: "verification:ci-responsibility-unit",
      }),
    );
    const duplicate = composeCiVerificationPlan(
      input({
        required_obligation_ids: [
          "verification:ci-responsibility-unit",
          "verification:ci-responsibility-unit",
        ],
      }),
    );
    expect(duplicate.ok).toBe(false);
    expect(duplicate.findings).toContainEqual(
      expect.objectContaining({ code: "duplicate_obligation" }),
    );
  });
});

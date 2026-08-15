import { describe, expect, it } from "vitest";
import type { WorkflowClassificationCatalog } from "../src/schema/workflow-classification-catalog";
import { routeSignalToWorkflowClassification } from "../src/workflow/contracts";

// PLAN-L7-562-workflow-classification-typed-routing
describe("requirements-owned workflow classification routing", () => {
  it("U-WFROUTE-001: signalをtyped axisとidentityへ分類する", () => {
    const result = routeSignalToWorkflowClassification({ signal: "production regression_prod" });
    expect(result).toMatchObject({
      disposition: "classified",
      exit_code: 0,
      classification: {
        target_axis: "workflow_model",
        target_id: "INCIDENT",
        matched_signal: "regression_prod",
      },
    });
    expect(JSON.stringify(result)).not.toMatch(/"mode"|"model"|catalog_route_id|route_class/u);
  });

  it("U-WFROUTE-002: decision待ちsignalを推測せずfail-closeする", () => {
    const result = routeSignalToWorkflowClassification({ signal: "user_feedback_iteration" });
    expect(result.disposition).toBe("decision_required");
    expect(result.classification).toBeNull();
    expect(result.candidates[0]).toMatchObject({
      target_axis: "decision",
      target_id: "IMPACT_CLASSIFICATION",
      unresolved_until_decision: true,
    });
    expect(result.exit_code).toBe(2);
  });

  it("U-WFROUTE-003: 同一precedenceの異なるidentityを曖昧入力として拒否する", () => {
    const base = routeSignalToWorkflowClassification({ signal: "drift" });
    const catalog = {
      schema_version: "helix-workflow-classification-catalog.v1",
      projection_role: "generated_projection",
      source_registry: {
        path: "docs/design/helix/L3-requirements/workflow-classification-registry.v1.json",
        schema_version: "helix-workflow-classification-registry.v1",
        registry_version: "1.1.1",
        requirements_version: "1.3.7",
        requirements_source_digest: `sha256:${"a".repeat(64)}`,
        registry_source_digest: `sha256:${"b".repeat(64)}`,
      },
      identity_policy: {
        typed_axes_only: true,
        common_route_identity: false,
        legacy_identity_emission: false,
        ambiguity_disposition: "fail_close",
      },
      entities: [],
      signal_bindings: [
        { signals: ["same"], target_axis: "workflow_model", target_id: "REVERSE" },
        { signals: ["same"], target_axis: "workflow_model", target_id: "RECOVERY" },
      ],
    } as unknown as WorkflowClassificationCatalog;
    const result = routeSignalToWorkflowClassification({ signal: "same", catalog });
    expect(base.disposition).toBe("classified");
    expect(result.disposition).toBe("ambiguous");
    expect(result.classification).toBeNull();
    expect(result.exit_code).toBe(1);
  });

  it("U-WFROUTE-004: unknown signalをlegacy identityへ推測変換しない", () => {
    const result = routeSignalToWorkflowClassification({ signal: "scrum" });
    expect(result.disposition).toBe("unknown");
    expect(result.classification).toBeNull();
    expect(result.candidates).toEqual([]);
    expect(result.exit_code).toBe(2);
  });
});

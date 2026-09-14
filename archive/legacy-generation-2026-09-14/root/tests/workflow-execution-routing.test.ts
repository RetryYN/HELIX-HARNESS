import { describe, expect, it } from "vitest";
import { loadWorkflowClassificationCatalog } from "../src/schema/workflow-classification-catalog.js";
import { loadWorkflowExecutionPolicyProjection } from "../src/schema/workflow-execution-policy-projection.js";
import {
  evaluateWorkflowExecutionRoute,
  workflowExecutionRoutingReceiptSchema,
} from "../src/workflow/contracts.js";

// PLAN-L7-566-workflow-execution-routing-consumer

describe("requirements-owned workflow execution routing consumer", () => {
  it("U-WFEXROUTE-001: resolves typed identity and policy without legacy output", () => {
    const receipt = evaluateWorkflowExecutionRoute({
      signal: "feature_addition",
      execution_form: "pair_cell",
      production_impact: false,
      destructive_data_operation: false,
      credential_access: false,
      backend_derived: false,
    });

    expect(receipt).toMatchObject({
      target_axis: "workflow_model",
      target_id: "ADD_FEATURE",
      binding_id: "ADD_FEATURE_PAIR_CELL_SAFE",
      command_id: "HELIX_PAIR_AGENT_PLAN",
      action_stage: "plan",
      preflight_policy: "required",
      approval_policy: "none",
      execution_form: "pair_cell",
      disposition: "resolved",
      exit_class: "success",
      exit_code: 0,
    });
    expect(workflowExecutionRoutingReceiptSchema.parse(receipt)).toEqual(receipt);
    const forbidden =
      loadWorkflowExecutionPolicyProjection().policy.consumer_contract.forbidden_output_fields;
    for (const field of forbidden) expect(receipt).not.toHaveProperty(field);
  });

  it("U-WFEXROUTE-002: maps unresolved classification dispositions", () => {
    for (const [signal, disposition, exitClass, exitCode] of [
      ["scrum", "classification_unknown", "unresolved", 2],
      ["user_feedback_iteration", "classification_decision_required", "unresolved", 2],
    ] as const) {
      const receipt = evaluateWorkflowExecutionRoute({
        signal,
        execution_form: "standard",
        production_impact: false,
        destructive_data_operation: false,
        credential_access: false,
        backend_derived: false,
      });
      expect(receipt).toMatchObject({
        target_axis: null,
        target_id: null,
        disposition,
        exit_class: exitClass,
        exit_code: exitCode,
      });
    }

    const catalog = structuredClone(loadWorkflowClassificationCatalog());
    catalog.signal_bindings.push({
      signals: ["feature_addition"],
      target_axis: "workflow_model",
      target_id: "RESEARCH",
    });
    const ambiguous = evaluateWorkflowExecutionRoute(
      {
        signal: "feature_addition",
        execution_form: "standard",
        production_impact: false,
        destructive_data_operation: false,
        credential_access: false,
        backend_derived: false,
      },
      { catalog, projection: loadWorkflowExecutionPolicyProjection() },
    );
    expect(ambiguous).toMatchObject({
      disposition: "classification_ambiguous",
      exit_class: "blocked",
      exit_code: 1,
    });
  });

  it("U-WFEXROUTE-006: rejects malformed injected routing contracts", () => {
    const invalidCatalog = Object.assign(structuredClone(loadWorkflowClassificationCatalog()), {
      mode: "legacy",
    });
    expect(() =>
      evaluateWorkflowExecutionRoute(
        {
          signal: "feature_addition",
          execution_form: "standard",
          production_impact: false,
          destructive_data_operation: false,
          credential_access: false,
          backend_derived: false,
        },
        { catalog: invalidCatalog, projection: loadWorkflowExecutionPolicyProjection() },
      ),
    ).toThrow(/Unrecognized key.*mode/u);

    const invalidProjection = Object.assign(
      structuredClone(loadWorkflowExecutionPolicyProjection()),
      { mode: "legacy" },
    );
    expect(() =>
      evaluateWorkflowExecutionRoute(
        {
          signal: "feature_addition",
          execution_form: "standard",
          production_impact: false,
          destructive_data_operation: false,
          credential_access: false,
          backend_derived: false,
        },
        { catalog: loadWorkflowClassificationCatalog(), projection: invalidProjection },
      ),
    ).toThrow(/Unrecognized key.*mode/u);
  });

  it("U-WFEXROUTE-007: rejects a mixed catalog and policy projection digest pair", () => {
    const catalog = structuredClone(loadWorkflowClassificationCatalog());
    catalog.source_registry.registry_source_digest = `sha256:${"0".repeat(64)}`;
    expect(() =>
      evaluateWorkflowExecutionRoute(
        {
          signal: "feature_addition",
          execution_form: "standard",
          production_impact: false,
          destructive_data_operation: false,
          credential_access: false,
          backend_derived: false,
        },
        { catalog, projection: loadWorkflowExecutionPolicyProjection() },
      ),
    ).toThrow("workflow routing classification registry digest mismatch");

    const requirementsCatalog = structuredClone(loadWorkflowClassificationCatalog());
    requirementsCatalog.source_registry.requirements_source_digest = `sha256:${"1".repeat(64)}`;
    expect(() =>
      evaluateWorkflowExecutionRoute(
        {
          signal: "feature_addition",
          execution_form: "standard",
          production_impact: false,
          destructive_data_operation: false,
          credential_access: false,
          backend_derived: false,
        },
        { catalog: requirementsCatalog, projection: loadWorkflowExecutionPolicyProjection() },
      ),
    ).toThrow("workflow routing requirements digest mismatch");
  });

  it("U-WFEXROUTE-003: fails closed when identity has no exact policy", () => {
    const receipt = evaluateWorkflowExecutionRoute({
      signal: "tech_decision_required",
      execution_form: "standard",
      production_impact: false,
      destructive_data_operation: false,
      credential_access: false,
      backend_derived: false,
    });
    expect(receipt).toMatchObject({
      target_axis: "workflow_model",
      target_id: "RESEARCH",
      binding_id: null,
      disposition: "policy_unsupported",
      exit_class: "unresolved",
      exit_code: 2,
    });

    const projection = structuredClone(loadWorkflowExecutionPolicyProjection());
    const original = projection.policy.bindings.find(
      (binding) => binding.binding_id === "ADD_FEATURE_PAIR_CELL_SAFE",
    );
    if (!original) throw new Error("missing policy binding fixture");
    projection.policy.bindings.push({
      ...original,
      binding_id: "AMBIGUOUS_ROUTE_TEST_BINDING",
    });
    const ambiguous = evaluateWorkflowExecutionRoute(
      {
        signal: "feature_addition",
        execution_form: "pair_cell",
        production_impact: false,
        destructive_data_operation: false,
        credential_access: false,
        backend_derived: false,
      },
      { catalog: loadWorkflowClassificationCatalog(), projection },
    );
    expect(ambiguous).toMatchObject({
      target_axis: "workflow_model",
      target_id: "ADD_FEATURE",
      disposition: "policy_ambiguous",
      exit_class: "blocked",
      exit_code: 1,
    });
  });

  it("U-WFEXROUTE-004: requires approval without exposing an invocation", () => {
    const receipt = evaluateWorkflowExecutionRoute({
      signal: "regression_prod",
      execution_form: "standard",
      production_impact: true,
      destructive_data_operation: false,
      credential_access: false,
      backend_derived: false,
    });
    expect(receipt).toMatchObject({
      target_axis: "workflow_model",
      target_id: "INCIDENT",
      binding_id: "INCIDENT_STANDARD_PRODUCTION",
      command_id: "HELIX_DOCTOR",
      approval_policy: "action_binding",
      disposition: "approval_required",
      exit_class: "blocked",
      exit_code: 1,
    });
    expect(receipt).not.toHaveProperty("program");
    expect(receipt).not.toHaveProperty("argv");
  });
});

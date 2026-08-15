import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  assertWorkflowExecutionPolicyProjectionCurrent,
  loadWorkflowExecutionPolicyProjection,
  projectWorkflowExecutionPolicy,
  WORKFLOW_EXECUTION_POLICY_PROJECTION_PATH,
  workflowExecutionPolicyProjectionSchema,
} from "../src/schema/workflow-execution-policy-projection.js";
import {
  loadWorkflowExecutionPolicyRegistry,
  WORKFLOW_EXECUTION_POLICY_REGISTRY_PATH,
} from "../src/schema/workflow-execution-policy-registry.js";

describe("workflow execution policy generated projection", () => {
  // PLAN-L7-563-workflow-execution-policy-projection
  it("U-WFEPROJ-001: projects registered commands and typed bindings without loss", () => {
    const registry = loadWorkflowExecutionPolicyRegistry();
    const projection = loadWorkflowExecutionPolicyProjection();
    expect(projection.policy).toEqual({
      coverage: registry.coverage,
      command_registry: registry.command_registry,
      bindings: registry.bindings,
    });
  });

  it("U-WFEPROJ-002: binds the projection to all current authority digests", () => {
    const registry = loadWorkflowExecutionPolicyRegistry();
    const bytes = readFileSync(resolve(WORKFLOW_EXECUTION_POLICY_REGISTRY_PATH));
    const projected = projectWorkflowExecutionPolicy(registry, bytes);
    const committed = JSON.parse(
      readFileSync(resolve(WORKFLOW_EXECUTION_POLICY_PROJECTION_PATH), "utf8"),
    );
    expect(projected).toEqual(committed);
    expect(projected.source_registry.policy_registry_source_digest).toMatch(
      /^sha256:[a-f0-9]{64}$/u,
    );
  });

  it.each([
    {
      label: "legacy identity emission",
      mutate: (
        projection: Record<string, unknown> & { output_policy: Record<string, unknown> },
      ) => {
        projection.output_policy.legacy_identity_emission = true;
      },
    },
    {
      label: "raw command emission",
      mutate: (
        projection: Record<string, unknown> & { output_policy: Record<string, unknown> },
      ) => {
        projection.output_policy.raw_command_emission = true;
      },
    },
    {
      label: "legacy mode field",
      mutate: (projection: Record<string, unknown>) => {
        projection.mode = "scrum";
      },
    },
  ])("U-WFEPROJ-003: rejects $label", ({ mutate }) => {
    const committed = JSON.parse(
      readFileSync(resolve(WORKFLOW_EXECUTION_POLICY_PROJECTION_PATH), "utf8"),
    ) as Record<string, unknown> & { output_policy: Record<string, unknown> };
    mutate(committed);
    expect(() => workflowExecutionPolicyProjectionSchema.parse(committed)).toThrow();
  });

  it("U-WFEPROJ-004: rejects manual projection drift", () => {
    const committed = JSON.parse(
      readFileSync(resolve(WORKFLOW_EXECUTION_POLICY_PROJECTION_PATH), "utf8"),
    );
    committed.policy.bindings[0].command_id = "HELIX_DOCTOR";
    const expected = projectWorkflowExecutionPolicy(
      loadWorkflowExecutionPolicyRegistry(),
      readFileSync(resolve(WORKFLOW_EXECUTION_POLICY_REGISTRY_PATH)),
    );
    const actual = workflowExecutionPolicyProjectionSchema.parse(committed);
    expect(() => assertWorkflowExecutionPolicyProjectionCurrent(actual, expected)).toThrow(
      "projection drift",
    );
  });
});

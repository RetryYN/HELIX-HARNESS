import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  loadWorkflowExecutionPolicyRegistry,
  resolveWorkflowExecutionPolicy,
  WORKFLOW_EXECUTION_POLICY_REGISTRY_PATH,
  workflowExecutionPolicyRegistrySchema,
} from "../src/schema/workflow-execution-policy-registry.js";

function rawRegistry(): Record<string, unknown> & {
  command_registry: Array<Record<string, unknown>>;
  bindings: Array<Record<string, unknown>>;
  consumer_contract: Record<string, unknown>;
} {
  return JSON.parse(readFileSync(WORKFLOW_EXECUTION_POLICY_REGISTRY_PATH, "utf8"));
}

function binding(value: ReturnType<typeof rawRegistry>, index: number): Record<string, unknown> {
  const entry = value.bindings[index];
  if (!entry) throw new Error(`missing binding fixture: ${index}`);
  return entry;
}

function command(value: ReturnType<typeof rawRegistry>, index: number): Record<string, unknown> {
  const entry = value.command_registry[index];
  if (!entry) throw new Error(`missing command fixture: ${index}`);
  return entry;
}

describe("workflow execution policy requirements registry", () => {
  it("loads registered commands and partial fail-close bindings", () => {
    const registry = loadWorkflowExecutionPolicyRegistry();
    expect(registry.coverage).toEqual({
      state: "partial_fail_close",
      unsupported_identity_disposition: "fail_close",
      legacy_identity_emission: false,
    });
    expect(registry.command_registry.map((command) => command.command_id)).toEqual([
      "HELIX_TASK_CLASSIFY",
      "HELIX_DOCTOR",
      "HELIX_RECOVERY_PLAN",
      "HELIX_PAIR_AGENT_PLAN",
    ]);
    expect(registry.bindings).toHaveLength(5);
    expect(registry.consumer_contract).toMatchObject({
      surface: "route_eval",
      exit_codes: { resolved: 0, blocked: 1, unresolved: 2 },
      raw_command_emission: false,
      legacy_identity_emission: false,
    });
    expect(registry.consumer_contract.forbidden_output_fields).toEqual([
      "mode",
      "model",
      "catalog_route_id",
      "route_class",
      "program",
      "argv",
      "raw_command",
    ]);
  });

  it("resolves an exact safe pair-cell policy without emitting a raw command", () => {
    const result = resolveWorkflowExecutionPolicy(loadWorkflowExecutionPolicyRegistry(), {
      target_axis: "workflow_model",
      target_id: "ADD_FEATURE",
      execution_form: "pair_cell",
      applies_when: {
        production_impact: false,
        destructive_data_operation: false,
        credential_access: false,
        backend_derived: false,
      },
    });
    expect(result).toEqual({
      disposition: "resolved",
      binding: expect.objectContaining({
        binding_id: "ADD_FEATURE_PAIR_CELL_SAFE",
        command_id: "HELIX_PAIR_AGENT_PLAN",
      }),
    });
    expect(result).not.toHaveProperty("command");
  });

  it("fails closed for an unsupported identity or unregistered risk combination", () => {
    const registry = loadWorkflowExecutionPolicyRegistry();
    const unsupported = resolveWorkflowExecutionPolicy(registry, {
      target_axis: "workflow_model",
      target_id: "RESEARCH",
      execution_form: "standard",
      applies_when: {
        production_impact: false,
        destructive_data_operation: false,
        credential_access: false,
        backend_derived: false,
      },
    });
    const combinedRisk = resolveWorkflowExecutionPolicy(registry, {
      target_axis: "workflow_model",
      target_id: "RECOVERY",
      execution_form: "standard",
      applies_when: {
        production_impact: true,
        destructive_data_operation: true,
        credential_access: false,
        backend_derived: false,
      },
    });
    expect(unsupported).toEqual({ disposition: "unsupported", binding: null });
    expect(combinedRisk).toEqual({ disposition: "unsupported", binding: null });
  });

  it.each([
    [
      "unregistered command",
      (value: ReturnType<typeof rawRegistry>) => {
        binding(value, 0).command_id = "UNKNOWN_COMMAND";
      },
    ],
    [
      "duplicate binding",
      (value: ReturnType<typeof rawRegistry>) => {
        value.bindings.push({ ...binding(value, 0), binding_id: "DUPLICATE_BINDING" });
      },
    ],
    [
      "raw command injection",
      (value: ReturnType<typeof rawRegistry>) => {
        binding(value, 0).command = "rm -rf /";
      },
    ],
    [
      "shell operator in command registry",
      (value: ReturnType<typeof rawRegistry>) => {
        command(value, 0).argv = ["task", "classify", "; rm"];
      },
    ],
    [
      "approval downgrade",
      (value: ReturnType<typeof rawRegistry>) => {
        binding(value, 2).approval_policy = "none";
      },
    ],
    [
      "legacy identity output field",
      (value: ReturnType<typeof rawRegistry>) => {
        binding(value, 0).mode = "add-feature";
      },
    ],
    [
      "legacy consumer output field",
      (value: ReturnType<typeof rawRegistry>) => {
        value.consumer_contract.output_identity_fields = ["target_axis", "target_id", "mode"];
      },
    ],
    [
      "raw invocation emission",
      (value: ReturnType<typeof rawRegistry>) => {
        value.consumer_contract.raw_command_emission = true;
      },
    ],
  ])("rejects %s", (_label, mutate) => {
    const value = rawRegistry();
    mutate(value);
    expect(workflowExecutionPolicyRegistrySchema.safeParse(value).success).toBe(false);
  });
});

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  assertWorkflowClassificationAuthorityDigest,
  loadWorkflowClassificationRegistry,
  WORKFLOW_CLASSIFICATION_REGISTRY_PATH,
  workflowClassificationRegistrySchema,
} from "../src/schema/workflow-classification-registry.js";

type MutableRegistry = {
  authority: { kind: string; source_digest: string };
  entities: Array<{ id: string; axis: string; parent_ids?: string[] }>;
  signal_bindings: Array<{ target_axis: string }>;
};

function rawRegistry(): MutableRegistry {
  return JSON.parse(
    readFileSync(resolve(process.cwd(), WORKFLOW_CLASSIFICATION_REGISTRY_PATH), "utf8"),
  ) as MutableRegistry;
}

function entity(value: MutableRegistry, id: string): MutableRegistry["entities"][number] {
  const match = value.entities.find((candidate) => candidate.id === id);
  if (!match) throw new Error(`missing fixture entity: ${id}`);
  return match;
}

describe("workflow classification requirements registry", () => {
  it("loads the requirements-owned versioned registry", () => {
    const registry = loadWorkflowClassificationRegistry();
    expect(registry.requirements_version).toBe("1.3.5");
    expect(registry.authority.kind).toBe("requirements");
    expect(registry.authority.source_digest).toBe(
      "sha256:bd343fb2e1c24152301c4c7580630684faff09dc83ccc1a204f9c1dc34d11213",
    );
    expect(registry.projection_policy).toEqual({
      catalog_role: "generated_projection",
      legacy_catalog_role: "compatibility_inventory",
      ambiguity_disposition: "fail_close",
      emit_legacy_identity: false,
    });
  });

  it("keeps styles, case model, workflow models, subroute, and state machines separate", () => {
    const registry = loadWorkflowClassificationRegistry();
    const axis = (id: string) => registry.entities.find((entity) => entity.id === id)?.axis;

    expect(
      registry.entities
        .filter((entity) => entity.axis === "development_style")
        .map((entity) => entity.id)
        .sort(),
    ).toEqual(["FULL_L1_L12_V", "PRODUCTION_SCRUM", "V_DESIGN_SCRUM_IMPLEMENTATION"]);
    expect(axis("DISCOVERY_POC")).toBe("case_driven_model");
    expect(axis("REDESIGN")).toBe("workflow_model");
    expect(axis("DESIGN_REFACTOR")).toBe("workflow_model");
    expect(axis("PERFORMANCE_REFACTOR")).toBe("workflow_model");
    expect(axis("RETROFIT")).toBe("workflow_model");
    expect(axis("SCRUM_REVERSE")).toBe("subroute");
    expect(axis("DISCOVERY_POC_S0_S4")).toBe("state_machine");
    expect(axis("SCRUM_REVERSE_SR0_SR4")).toBe("state_machine");
  });

  it("does not promote legacy catalog route ids into requirements identities", () => {
    const ids = loadWorkflowClassificationRegistry().entities.map((entity) =>
      entity.id.toLowerCase(),
    );
    expect(ids).not.toContain("forward_full_v");
    expect(ids).not.toContain("v_design_scrum_impl_hybrid");
    expect(
      loadWorkflowClassificationRegistry().entities.filter(
        (entity) => entity.id === "PRODUCTION_SCRUM",
      ),
    ).toEqual([expect.objectContaining({ axis: "development_style" })]);
  });

  it("rejects a well-formed but stale requirements authority digest", () => {
    const registry = structuredClone(loadWorkflowClassificationRegistry());
    registry.authority.source_digest = `sha256:${"0".repeat(64)}`;
    expect(() =>
      assertWorkflowClassificationAuthorityDigest(
        registry,
        readFileSync(resolve(process.cwd(), registry.authority.source)),
      ),
    ).toThrow("requirements digest mismatch");
  });

  it.each([
    [
      "catalog authority",
      (value: MutableRegistry) => {
        value.authority.kind = "catalog";
      },
    ],
    [
      "malformed requirements digest",
      (value: MutableRegistry) => {
        value.authority.source_digest = "sha256:stale";
      },
    ],
    [
      "demoted redesign",
      (value: MutableRegistry) => {
        entity(value, "REDESIGN").axis = "decision";
      },
    ],
    [
      "style folded into workflow model",
      (value: MutableRegistry) => {
        entity(value, "PRODUCTION_SCRUM").axis = "workflow_model";
      },
    ],
    [
      "unknown parent",
      (value: MutableRegistry) => {
        entity(value, "SCRUM_REVERSE").parent_ids = ["UNKNOWN"];
      },
    ],
    [
      "ambiguous signal guessed as route",
      (value: MutableRegistry) => {
        const binding = value.signal_bindings.at(-1);
        if (!binding) throw new Error("missing signal binding fixture");
        binding.target_axis = "workflow_model";
      },
    ],
  ])("rejects %s", (_label, mutate) => {
    const value = rawRegistry();
    mutate(value);
    expect(workflowClassificationRegistrySchema.safeParse(value).success).toBe(false);
  });
});

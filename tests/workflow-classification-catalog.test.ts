import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  assertWorkflowClassificationCatalogCurrent,
  loadWorkflowClassificationCatalog,
  projectWorkflowClassificationCatalog,
  WORKFLOW_CLASSIFICATION_CATALOG_PATH,
  workflowClassificationCatalogSchema,
} from "../src/schema/workflow-classification-catalog.js";
import {
  loadWorkflowClassificationRegistry,
  WORKFLOW_CLASSIFICATION_REGISTRY_PATH,
} from "../src/schema/workflow-classification-registry.js";

describe("workflow classification generated catalog", () => {
  // PLAN-L7-561-workflow-classification-generated-catalog
  it("U-WFCAT-001: projects every typed requirements identity without loss", () => {
    const registry = loadWorkflowClassificationRegistry();
    const catalog = loadWorkflowClassificationCatalog();

    expect(catalog.projection_role).toBe("generated_projection");
    expect(catalog.identity_policy).toEqual({
      typed_axes_only: true,
      common_route_identity: false,
      legacy_identity_emission: false,
      ambiguity_disposition: "fail_close",
    });
    expect(catalog.entities).toEqual(registry.entities);
    expect(catalog.signal_bindings).toEqual(registry.signal_bindings);
    expect(new Set(catalog.entities.map((entity) => entity.axis))).toEqual(
      new Set(registry.entities.map((entity) => entity.axis)),
    );
  });

  it("U-WFCAT-002: binds a deterministic projection to the current registry bytes", () => {
    const registry = loadWorkflowClassificationRegistry();
    const bytes = readFileSync(resolve(WORKFLOW_CLASSIFICATION_REGISTRY_PATH));
    const projected = projectWorkflowClassificationCatalog(registry, bytes);
    const committed = JSON.parse(
      readFileSync(resolve(WORKFLOW_CLASSIFICATION_CATALOG_PATH), "utf8"),
    );
    expect(projected).toEqual(committed);
    expect(projected.source_registry.registry_source_digest).toMatch(
      /^sha256:[a-f0-9]{64}$/u,
    );
  });

  it("U-WFCAT-003: rejects common route and legacy identity emission", () => {
    const committed = JSON.parse(
      readFileSync(resolve(WORKFLOW_CLASSIFICATION_CATALOG_PATH), "utf8"),
    ) as {
      identity_policy: {
        legacy_identity_emission: boolean;
        common_route_identity: boolean;
      };
    };
    committed.identity_policy.legacy_identity_emission = true;
    committed.identity_policy.common_route_identity = true;
    expect(() => workflowClassificationCatalogSchema.parse(committed)).toThrow();
  });

  it("U-WFCAT-004: rejects manual drift in the committed projection", () => {
    const committed = JSON.parse(
      readFileSync(resolve(WORKFLOW_CLASSIFICATION_CATALOG_PATH), "utf8"),
    ) as { entities: Array<{ id: string }> };
    committed.entities[0]!.id = "FORWARD_FULL_V";
    const expected = projectWorkflowClassificationCatalog(
      loadWorkflowClassificationRegistry(),
      readFileSync(resolve(WORKFLOW_CLASSIFICATION_REGISTRY_PATH)),
    );
    const actual = workflowClassificationCatalogSchema.parse(committed);
    expect(() => assertWorkflowClassificationCatalogCurrent(actual, expected)).toThrow(
      "catalog drift",
    );
  });
});

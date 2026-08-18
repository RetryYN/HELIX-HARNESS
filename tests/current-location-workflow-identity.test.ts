import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { loadWorkflowClassificationCatalog } from "../src/schema/workflow-classification-catalog";
import { openHarnessDb } from "../src/state-db";
import { buildProjectCurrentLocationSnapshot } from "../src/state-db/current-location";
import { migrate } from "../src/state-db/migration";
import {
  attachCurrentLocationWorkflowIdentity,
  resolveCurrentLocationWorkflowIdentity,
} from "../src/workflow/current-location-workflow-identity";

// PLAN-L7-584-current-location-workflow-identity — U-CLWI-001
// PLAN-L7-584-current-location-workflow-identity — U-CLWI-002
// PLAN-L7-584-current-location-workflow-identity — U-CLWI-003
// PLAN-L7-584-current-location-workflow-identity — U-CLWI-004
// PLAN-L7-584-current-location-workflow-identity — U-CLWI-005
// PLAN-L7-584-current-location-workflow-identity — U-CLWI-006
// PLAN-L7-584-current-location-workflow-identity — U-CLWI-007
describe("current-location typed workflow identity boundary", () => {
  it("U-CLWI-001: explicit identity is accepted only with the current registry tuple", () => {
    const catalog = loadWorkflowClassificationCatalog();
    const result = resolveCurrentLocationWorkflowIdentity({
      catalog,
      identity: {
        registry_version: catalog.source_registry.registry_version,
        registry_source_digest: catalog.source_registry.registry_source_digest,
        target_axis: "workflow_model",
        target_id: "RECOVERY",
      },
    });

    expect(result).toMatchObject({
      disposition: "typed",
      identity: {
        registry_version: catalog.source_registry.registry_version,
        registry_source_digest: catalog.source_registry.registry_source_digest,
        target_axis: "workflow_model",
        target_id: "RECOVERY",
      },
      emit_legacy_identity: false,
      exit_code: 0,
    });
  });

  it("U-CLWI-002: unambiguous legacy model is converted with provenance and no current legacy output", () => {
    const result = resolveCurrentLocationWorkflowIdentity({ legacy_model: "Recovery" });

    expect(result).toMatchObject({
      disposition: "converted",
      identity: { target_axis: "workflow_model", target_id: "RECOVERY" },
      source: { kind: "legacy_compatibility", field: "model", token: "recovery" },
      emit_legacy_identity: false,
      exit_code: 0,
    });
    expect(Object.keys(result)).not.toContain("model");
    expect(JSON.stringify(result.identity)).not.toMatch(
      /"(?:mode|model|catalog_route_id|route_class)"/u,
    );
  });

  it("U-CLWI-003: Forward and Scrum remain ambiguous instead of becoming a fake workflow identity", () => {
    for (const legacy_model of ["Forward", "Scrum"]) {
      const result = resolveCurrentLocationWorkflowIdentity({ legacy_model });
      expect(result).toMatchObject({
        disposition: "ambiguous",
        identity: null,
        source: { kind: "legacy_compatibility", field: "model" },
        emit_legacy_identity: false,
        exit_code: 1,
      });
    }
  });

  it("U-CLWI-004: specialist verification is not promoted to workflow model", () => {
    const result = resolveCurrentLocationWorkflowIdentity({
      legacy_model: "OperationVerification",
    });
    expect(result).toMatchObject({
      disposition: "unsupported",
      identity: null,
      emit_legacy_identity: false,
      exit_code: 1,
    });
  });

  it("U-CLWI-005: stale registry tuple fails closed", () => {
    const catalog = loadWorkflowClassificationCatalog();
    const result = resolveCurrentLocationWorkflowIdentity({
      catalog,
      identity: {
        registry_version: "0.0.0",
        registry_source_digest: catalog.source_registry.registry_source_digest,
        target_axis: "workflow_model",
        target_id: "RECOVERY",
      },
    });
    expect(result).toMatchObject({
      disposition: "stale",
      identity: null,
      warnings: [{ code: "typed-workflow-stale" }],
      exit_code: 1,
    });
  });

  it("U-CLWI-006: unknown or multiple input sources fail closed", () => {
    const catalog = loadWorkflowClassificationCatalog();
    expect(
      resolveCurrentLocationWorkflowIdentity({
        catalog,
        identity: {
          registry_version: catalog.source_registry.registry_version,
          registry_source_digest: catalog.source_registry.registry_source_digest,
          target_axis: "workflow_model",
          target_id: "NOT_REGISTERED",
        },
      }),
    ).toMatchObject({ disposition: "unsupported", identity: null, exit_code: 1 });
    expect(resolveCurrentLocationWorkflowIdentity({})).toMatchObject({
      disposition: "unsupported",
      identity: null,
      exit_code: 1,
    });
  });

  it("U-CLWI-006b: an uninitialized repo returns an unsupported receipt instead of throwing", () => {
    const repoRoot = mkdtempSync(join(tmpdir(), "helix-current-location-uninitialized-"));
    try {
      expect(
        resolveCurrentLocationWorkflowIdentity({
          legacy_model: "Recovery",
          repo_root: repoRoot,
        }),
      ).toMatchObject({
        disposition: "unsupported",
        identity: null,
        warnings: [{ code: "typed-workflow-unknown" }],
        exit_code: 1,
      });
    } finally {
      rmSync(repoRoot, { recursive: true, force: true });
    }
  });

  it("U-CLWI-006a: legacy conversion fails closed when the current catalog cannot register its target", () => {
    const catalog = loadWorkflowClassificationCatalog();
    const result = resolveCurrentLocationWorkflowIdentity({
      catalog: { ...catalog, entities: [] },
      legacy_model: "Recovery",
    });

    expect(result).toMatchObject({ disposition: "unsupported", identity: null, exit_code: 1 });
    expect(result.warnings).toEqual(
      expect.arrayContaining([expect.objectContaining({ code: "legacy-workflow-unsupported" })]),
    );
  });

  it("U-CLWI-007: production current-location route always carries the typed receipt boundary", () => {
    const db = openHarnessDb(":memory:");
    try {
      migrate(db);
      const snapshot = attachCurrentLocationWorkflowIdentity(
        buildProjectCurrentLocationSnapshot(db),
      );
      expect(snapshot.drive_route.workflowIdentityReceipt).toMatchObject({
        schema_version: "helix-current-location-workflow-identity-receipt.v1",
        disposition: "converted",
        identity: { target_axis: "workflow_model", target_id: "REVERSE" },
        emit_legacy_identity: false,
        exit_code: 0,
      });
    } finally {
      db.close();
    }
  });
});

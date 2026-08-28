import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { AUTOMATIC_DB_PROJECTION_REQUIREMENTS } from "../src/lint/db-projection-ingestion";
import { HARNESS_DB_TABLES } from "../src/schema/harness-db-catalog";
import { HARNESS_DB_INDEXES } from "../src/schema/harness-db-indexes";
import { openHarnessDb } from "../src/state-db";
import { rebuildHarnessDb } from "../src/state-db/projection-writer";
import { resolvePackageCurrentLocationWorkflowIdentity } from "../src/workflow/current-location-workflow-identity";

// PLAN-L7-693-current-location-db-typed-workflow-identity / U-CLDB-001..004

const LEGACY_CURRENT_LOCATION_FIELDS = ["selected_drive_model", "default_drive_model"];

describe("current-location DB typed workflow identity", () => {
  it("U-CLDB-001: project_current_locationのprimary identityをtyped tupleだけにする", () => {
    const table = HARNESS_DB_TABLES.find(
      (candidate) => candidate.name === "project_current_location",
    );
    const columns = table?.columns.map((column) => column.name) ?? [];

    expect(columns).toEqual(
      expect.arrayContaining([
        "workflow_identity_schema_version",
        "workflow_registry_version",
        "workflow_registry_source_digest",
        "workflow_target_axis",
        "workflow_target_id",
      ]),
    );
    expect(columns).not.toEqual(expect.arrayContaining(LEGACY_CURRENT_LOCATION_FIELDS));
  });

  it("U-CLDB-002: legacy candidate tableをcurrent DB schema／index／ingestionから除去する", () => {
    expect(HARNESS_DB_TABLES.map((table) => table.name)).not.toContain(
      "project_drive_model_candidates",
    );
    expect(HARNESS_DB_INDEXES.map((index) => index.table)).not.toContain(
      "project_drive_model_candidates",
    );
    expect(
      AUTOMATIC_DB_PROJECTION_REQUIREMENTS.map((requirement) => requirement.table),
    ).not.toContain("project_drive_model_candidates");
  });

  it("U-CLDB-003: rebuild結果へrequirements registry exact tupleを投影する", () => {
    const db = openHarnessDb(":memory:");
    try {
      rebuildHarnessDb({ repoRoot: process.cwd(), db });
      const row = db
        .prepare(
          `SELECT workflow_identity_schema_version, workflow_registry_version,
                  workflow_registry_source_digest, workflow_target_axis, workflow_target_id
             FROM project_current_location
            WHERE snapshot_id = ?`,
        )
        .get("project-current-location:latest") as Record<string, unknown> | undefined;
      const catalog = JSON.parse(
        readFileSync("config/workflow-classification-catalog.v1.json", "utf8"),
      ) as {
        source_registry: { registry_version: string; registry_source_digest: string };
      };

      expect(row).toMatchObject({
        workflow_identity_schema_version: "helix-current-location-workflow-identity.v1",
        workflow_registry_version: catalog.source_registry.registry_version,
        workflow_registry_source_digest: catalog.source_registry.registry_source_digest,
      });
      expect(row?.workflow_target_axis).toMatch(
        /^(development_style|case_driven_model|workflow_model|subroute|state_machine|specialist_drive|execution_mode|specialist_workflow|specialist_capability)$/u,
      );
      expect(row?.workflow_target_id).toMatch(/^[A-Z][A-Z0-9_]*$/u);
    } finally {
      db.close();
    }
  });

  it("U-CLDB-004: consumer cwdではなくinstalled HELIX packageの分類authorityを使う", () => {
    const receipt = resolvePackageCurrentLocationWorkflowIdentity("Reverse");

    expect(receipt).toMatchObject({
      disposition: "converted",
      exit_code: 0,
      emit_legacy_identity: false,
      identity: {
        target_axis: "workflow_model",
        target_id: "REVERSE",
      },
    });
  });
});

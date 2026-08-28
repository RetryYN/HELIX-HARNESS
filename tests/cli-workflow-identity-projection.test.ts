import { spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";
import { loadWorkflowClassificationCatalog } from "../src/schema/workflow-classification-catalog";
import { openHarnessDb } from "../src/state-db";
import { buildProjectCurrentLocationSnapshot } from "../src/state-db/current-location";
import { migrate } from "../src/state-db/migration";
import { buildCliWorkflowIdentityProjection } from "../src/workflow/cli-workflow-identity-projection";
import { attachCurrentLocationWorkflowIdentity } from "../src/workflow/current-location-workflow-identity";
import { ensureCliBundle } from "./tools/cli-bundle";

// PLAN-L7-698-cli-workflow-identity-projection — U-CLIWI-001..003

const LEGACY_WORKFLOW_IDENTITY_KEYS = new Set([
  "available_models",
  "default_model",
  "drive_model",
  "selected_model",
]);

function legacyWorkflowIdentityPaths(value: unknown, prefix = "$"): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => legacyWorkflowIdentityPaths(item, `${prefix}[${index}]`));
  }
  if (typeof value !== "object" || value === null) return [];
  return Object.entries(value).flatMap(([key, child]) => [
    ...(LEGACY_WORKFLOW_IDENTITY_KEYS.has(key) ? [`${prefix}.${key}`] : []),
    ...legacyWorkflowIdentityPaths(child, `${prefix}.${key}`),
  ]);
}

const cliBundlePath = ensureCliBundle(process.cwd());

function runJson(args: string[]): Record<string, unknown> {
  const run = spawnSync(process.execPath, [cliBundlePath, ...args], {
    cwd: process.cwd(),
    encoding: "utf8",
    env: { ...process.env, HELIX_SKIP_UPDATE_CHECK: "1" },
    timeout: 45_000,
    maxBuffer: 16 * 1024 * 1024,
  });
  expect(run.status, run.stderr).toBe(0);
  return JSON.parse(run.stdout) as Record<string, unknown>;
}

function runText(args: string[]): string {
  const run = spawnSync(process.execPath, [cliBundlePath, ...args], {
    cwd: process.cwd(),
    encoding: "utf8",
    env: { ...process.env, HELIX_SKIP_UPDATE_CHECK: "1" },
    timeout: 45_000,
    maxBuffer: 16 * 1024 * 1024,
  });
  expect(run.status, run.stderr).toBe(0);
  return run.stdout;
}

function expectCurrentTypedIdentity(payload: Record<string, unknown>): void {
  const catalog = loadWorkflowClassificationCatalog();
  expect(payload.workflow_identity).toMatchObject({
    registry_version: catalog.source_registry.registry_version,
    registry_source_digest: catalog.source_registry.registry_source_digest,
    target_axis: expect.any(String),
    target_id: expect.any(String),
  });
  expect(legacyWorkflowIdentityPaths(payload)).toEqual([]);
}

describe("CLI typed workflow identity projection", () => {
  it("U-CLIWI-001: drive model summaryはtyped identityだけをcurrent出力する", () => {
    expectCurrentTypedIdentity(runJson(["drive", "model", "--summary-json"]));
    expectCurrentTypedIdentity(runJson(["drive", "model", "--json"]));
    const text = runText(["drive", "model"]);
    const firstLine = text.split(/\r?\n/, 1)[0];
    expect(firstLine).toMatch(/workflow=[a-z_]+:[A-Z0-9_]+ registry=\d+\.\d+\.\d+/);
    expect(firstLine).not.toMatch(/selected=|default=|available=|candidate:/);
  });

  it("U-CLIWI-002: recovery summaryはtyped identityだけをcurrent出力する", () => {
    expectCurrentTypedIdentity(runJson(["recovery", "plan", "--summary-json"]));
    expectCurrentTypedIdentity(runJson(["recovery", "plan", "--json"]));
    const text = runText(["recovery", "plan"]);
    const firstLine = text.split(/\r?\n/, 1)[0];
    expect(firstLine).toMatch(/workflow=[a-z_]+:[A-Z0-9_]+ registry=\d+\.\d+\.\d+/);
    expect(firstLine).not.toMatch(
      /drive model: selected=|selected_model|drive_model|default_model|available_models/,
    );
  });

  it("U-CLIWI-003: legacy identity復活mutationを検出する", () => {
    expect(
      legacyWorkflowIdentityPaths({
        workflow_identity: { target_axis: "workflow_model", target_id: "RECOVERY" },
        drive_model: { selected_model: "Recovery" },
      }),
    ).toEqual(["$.drive_model", "$.drive_model.selected_model"]);
  });

  it("U-CLIWI-004: stale／partial／receipt不一致をfail-closeする", () => {
    const db = openHarnessDb(":memory:");
    try {
      migrate(db);
      const baseline = attachCurrentLocationWorkflowIdentity(
        buildProjectCurrentLocationSnapshot(db),
      );
      expect(buildCliWorkflowIdentityProjection(baseline).workflow_identity).toMatchObject({
        target_axis: "workflow_model",
        target_id: expect.any(String),
      });

      const stale = structuredClone(baseline);
      if (!stale.drive_route.workflowIdentity) throw new Error("fixture identity missing");
      stale.drive_route.workflowIdentity.registry_source_digest = "sha256:stale";
      expect(() => buildCliWorkflowIdentityProjection(stale)).toThrowError(
        "cli_workflow_identity_invalid",
      );

      const partial = structuredClone(baseline);
      if (!partial.drive_route.workflowIdentity) throw new Error("fixture identity missing");
      (partial.drive_route.workflowIdentity as { target_axis?: string }).target_axis = undefined;
      expect(() => buildCliWorkflowIdentityProjection(partial)).toThrowError(
        "cli_workflow_identity_invalid",
      );

      const mismatch = structuredClone(baseline);
      if (!mismatch.drive_route.workflowIdentityReceipt?.identity) {
        throw new Error("fixture receipt missing");
      }
      mismatch.drive_route.workflowIdentityReceipt.identity = {
        ...mismatch.drive_route.workflowIdentityReceipt.identity,
        target_id:
          mismatch.drive_route.workflowIdentity?.target_id === "RECOVERY" ? "INCIDENT" : "RECOVERY",
      };
      expect(() => buildCliWorkflowIdentityProjection(mismatch)).toThrowError(
        "cli_workflow_identity_invalid",
      );
    } finally {
      db.close();
    }
  });
});

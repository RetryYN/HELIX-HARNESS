import { spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";
import { buildWorkflowExecutionApprovalAuditEvent } from "../src/cli/commands/route.js";
import { evaluateRouteCommand, evaluateWorkflowExecutionRoute } from "../src/workflow/contracts.js";

// PLAN-L7-567-workflow-execution-routing-cli
// PLAN-L7-477-route-action-approval-stage

function routeEval(args: string[], cwd: string = process.cwd()) {
  return spawnSync(process.execPath, ["--import", "tsx", "src/cli.ts", "route", "eval", ...args], {
    cwd,
    encoding: "utf8",
    env: { ...process.env, NO_COLOR: "1" },
  });
}

describe("route action approval CLI", () => {
  it("U-RAAS-008: legacy action stage contractをcompatibility coreで保持する", () => {
    const result = evaluateRouteCommand({
      signal: "forced_stop",
      action_stage: "diagnosis",
      action: "inspect_runtime",
    });
    expect(result.recommended_command?.args).toMatchObject({
      action_stage: "diagnosis",
      action: "inspect_runtime",
    });
  });

  it("U-WFEXCLI-002: current policyのaction stageを返しraw commandを出力しない", () => {
    const result = routeEval([
      "--signal",
      "forced_stop",
      "--execution-form",
      "standard",
      "--production-impact",
      "false",
      "--destructive-data-operation",
      "false",
      "--credential-access",
      "false",
      "--backend-derived",
      "false",
      "--format",
      "json",
    ]);
    expect(result.status, result.stderr).toBe(0);
    const output = JSON.parse(result.stdout) as Record<string, unknown>;
    expect(output).toMatchObject({
      target_axis: "workflow_model",
      target_id: "RECOVERY",
      command_id: "HELIX_RECOVERY_PLAN",
      action_stage: "plan",
      disposition: "resolved",
      exit_code: 0,
    });
    for (const forbidden of [
      "mode",
      "model",
      "catalog_route_id",
      "route_class",
      "program",
      "argv",
      "raw_command",
      "recommended_command",
    ]) {
      expect(output).not.toHaveProperty(forbidden);
    }
  });

  it("U-WFEXCLI-003: execution form／boolean／formatの省略・未知値をexit 2で拒否する", () => {
    const cases = [
      { args: ["--signal", "forced_stop"], message: "--execution-form must be explicit" },
      {
        args: ["--signal", "forced_stop", "--execution-form", "standard"],
        message: "exact boolean required",
      },
      {
        args: [
          "--signal",
          "forced_stop",
          "--execution-form",
          "standard",
          "--production-impact",
          "TRUE",
          "--destructive-data-operation",
          "false",
          "--credential-access",
          "false",
          "--backend-derived",
          "false",
        ],
        message: "exact boolean required",
      },
      {
        args: [
          "--signal",
          "forced_stop",
          "--execution-form",
          "standard",
          "--production-impact",
          "false",
          "--destructive-data-operation",
          "false",
          "--credential-access",
          "false",
          "--backend-derived",
          "false",
          "--format",
          "yaml",
        ],
        message: "--format must be text or json",
      },
    ];
    for (const testCase of cases) {
      const result = routeEval(testCase.args);
      expect(result.status).toBe(2);
      expect(result.stderr).toContain(testCase.message);
      expect(result.stdout).toBe("");
    }
  });

  it("U-WFEXCLI-006: authority contract読込失敗をreceiptへ偽装せずexit 1で閉じる", () => {
    const tsxImport = import.meta.resolve("tsx");
    const result = spawnSync(
      process.execPath,
      [
        "--import",
        tsxImport,
        `${process.cwd()}/src/cli.ts`,
        "route",
        "eval",
        "--signal",
        "forced_stop",
        "--execution-form",
        "standard",
        "--production-impact",
        "false",
        "--destructive-data-operation",
        "false",
        "--credential-access",
        "false",
        "--backend-derived",
        "false",
        "--format",
        "json",
      ],
      { cwd: "/tmp", encoding: "utf8", env: { ...process.env, NO_COLOR: "1" } },
    );
    expect(result.status).toBe(1);
    expect(result.stdout).toBe("");
    expect(result.stderr).toContain("workflow-classification-registry");
    expect(result.stderr).not.toContain('"disposition"');
  });

  it("U-WFEXCLI-004: approval audit eventへlegacy identityやraw invocationを出さない", () => {
    const receipt = evaluateWorkflowExecutionRoute({
      signal: "regression_prod",
      execution_form: "standard",
      production_impact: true,
      destructive_data_operation: false,
      credential_access: false,
      backend_derived: false,
    });
    const event = buildWorkflowExecutionApprovalAuditEvent(
      "regression_prod",
      receipt,
      "2026-08-15T11:00:00Z",
    );

    expect(event).toMatchObject({
      event: "workflow_execution_approval_required",
      disposition: "approval_required",
      target_id: "INCIDENT",
      command_id: "HELIX_DOCTOR",
    });
    expect(JSON.stringify(event)).not.toMatch(
      /"(?:mode|model|catalog_route_id|route_class|program|argv|raw_command|recommended_command)"/u,
    );
  });
});

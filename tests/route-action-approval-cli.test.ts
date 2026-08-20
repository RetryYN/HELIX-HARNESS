import { type SpawnSyncReturns, spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { buildWorkflowExecutionApprovalAuditEvent } from "../src/cli/commands/route.js";
import { evaluateRouteCommand, evaluateWorkflowExecutionRoute } from "../src/workflow/contracts.js";

// PLAN-L7-567-workflow-execution-routing-cli
// PLAN-L7-477-route-action-approval-stage
// PLAN-L7-641-route-eval-cwd-isolation

const REPO_ROOT = process.cwd();

function routeEval(args: string[], cwd: string = process.cwd()) {
  return spawnSync(process.execPath, ["--import", "tsx", "src/cli.ts", "route", "eval", ...args], {
    cwd,
    encoding: "utf8",
    env: { ...process.env, NO_COLOR: "1" },
  });
}

// repo外cwdからのfail-closeを測るoracle群。共有/tmpを直接cwdにすると開発機の残置物で
// 結果が変わり得るため、test専用のisolated cwdだけを使い、作ったdirectoryだけを消す。
const isolatedCwds: string[] = [];

function isolatedCwd(seed: (dir: string) => void): string {
  const dir = mkdtempSync(join(tmpdir(), "helix-route-eval-"));
  isolatedCwds.push(dir);
  seed(dir);
  return dir;
}

function seedEmptyCwd(): void {
  // 何も置かない。fail-closeの基準となる外部状態。
}

// 開発機の/tmpに残りがちなrepo風の残置物を、registry本体だけ欠いた状態で再現する。
function seedDecoyRepoLayout(dir: string): void {
  mkdirSync(join(dir, "node_modules"), { recursive: true });
  mkdirSync(join(dir, "docs", "design", "helix", "L3-requirements"), { recursive: true });
  mkdirSync(join(dir, "config"), { recursive: true });
  writeFileSync(join(dir, "package.json"), '{"name":"decoy","version":"0.0.0"}\n');
  writeFileSync(join(dir, "docs", "design", "helix", "L3-requirements", "unrelated.json"), "{}\n");
}

afterAll(() => {
  while (isolatedCwds.length > 0) {
    rmSync(isolatedCwds.pop() as string, { recursive: true, force: true });
  }
});

function routeEvalOutsideRepo(cwd: string): SpawnSyncReturns<string> {
  return spawnSync(
    process.execPath,
    [
      "--import",
      import.meta.resolve("tsx"),
      join(REPO_ROOT, "src/cli.ts"),
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
    { cwd, encoding: "utf8", env: { ...process.env, NO_COLOR: "1" } },
  );
}

function expectRegistryFailClose(result: SpawnSyncReturns<string>): void {
  expect(result.status).toBe(1);
  expect(result.stdout).toBe("");
  expect(result.stderr).toContain("workflow-classification-registry");
  expect(result.stderr).not.toContain('"disposition"');
}

function normalizeCwd(stream: string, cwd: string): string {
  return stream.split(cwd).join("<isolated-cwd>");
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
    const result = routeEvalOutsideRepo(isolatedCwd(seedEmptyCwd));
    expect(result.status).toBe(1);
    expect(result.stdout).toBe("");
    expect(result.stderr).toContain("workflow-classification-registry");
    expect(result.stderr).not.toContain('"disposition"');
  });

  it("U-WFEXCLI-007: repo外cwdのfail-closeが共有tmpの既存内容に依存しない", () => {
    const bare = isolatedCwd(seedEmptyCwd);
    const populated = isolatedCwd(seedDecoyRepoLayout);

    const bareResult = routeEvalOutsideRepo(bare);
    const populatedResult = routeEvalOutsideRepo(populated);

    expectRegistryFailClose(bareResult);
    expectRegistryFailClose(populatedResult);
    expect(populatedResult.status).toBe(bareResult.status);
    expect(populatedResult.stdout).toBe(bareResult.stdout);
    // cwd以外の差分がstderrへ出ないことを、cwdを正規化した完全一致で示す。
    expect(normalizeCwd(populatedResult.stderr, populated)).toBe(
      normalizeCwd(bareResult.stderr, bare),
    );
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

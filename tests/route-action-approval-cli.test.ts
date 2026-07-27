import { spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";

function routeEval(args: string[]) {
  return spawnSync(process.execPath, ["--import", "tsx", "src/cli.ts", "route", "eval", ...args], {
    cwd: process.cwd(),
    encoding: "utf8",
    env: { ...process.env, NO_COLOR: "1" },
  });
}

describe("route action approval CLI", () => {
  it("U-RAAS-008: diagnosis stageを自律継続しstage/actionをtyped outputへ保持する", () => {
    const result = routeEval([
      "--signal",
      "forced_stop",
      "--action-stage",
      "diagnosis",
      "--action",
      "inspect_runtime",
      "--format",
      "json",
    ]);
    expect(result.status, result.stderr).toBe(0);
    const output = JSON.parse(result.stdout) as {
      approval: { status: string };
      recommended_command: { args: Record<string, unknown> };
    };
    expect(output.approval.status).toBe("not_required");
    expect(output.recommended_command.args).toMatchObject({
      action_stage: "diagnosis",
      action: "inspect_runtime",
    });
  });

  it("U-RAAS-008: 未知stageをroute評価前にexit 2で拒否する", () => {
    const result = routeEval([
      "--signal",
      "forced_stop",
      "--action-stage",
      "unknown-stage",
      "--format",
      "json",
    ]);
    expect(result.status).toBe(2);
    expect(result.stderr).toContain("invalid --action-stage");
    expect(result.stdout).toBe("");
  });
});

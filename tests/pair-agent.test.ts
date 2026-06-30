import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { buildPairAgentTddPlan, runPairAgentTddPlan } from "../src/orchestration/pair-agent";
import type { RuntimeDetection } from "../src/runtime/detect";

const repoRoot = process.cwd();
const cliPath = join(repoRoot, "src", "cli.ts");

const hybrid = (currentRuntime: "claude" | "codex"): RuntimeDetection => ({
  mode: "hybrid",
  claude: true,
  codex: true,
  currentRuntime,
  availableRuntimes: [],
  missingRuntimes: [],
});

const codexOnly: RuntimeDetection = {
  mode: "codex-only",
  claude: false,
  codex: true,
  currentRuntime: "codex",
  availableRuntimes: [],
  missingRuntimes: [],
};

function runCli(args: string[]) {
  if (process.platform === "win32") {
    const cmdExe = join(process.env.SystemRoot ?? "C:\\Windows", "System32", "cmd.exe");
    return spawnSync(cmdExe, ["/d", "/c", "bun", cliPath, ...args], {
      cwd: repoRoot,
      encoding: "utf8",
      env: process.env,
    });
  }
  return spawnSync("bun", [cliPath, ...args], {
    cwd: repoRoot,
    encoding: "utf8",
    env: process.env,
  });
}

describe("P2/P3 pair-agent TDD programming route", () => {
  it("HU-PILLAR-P2-04: starts with smart test authoring, then light implementation, then smart review", () => {
    const plan = buildPairAgentTddPlan({
      planId: "PLAN-L7-PAIR",
      task: "Add pair-agent TDD route",
      detection: hybrid("codex"),
      primary: "codex",
      allowFrontier: true,
    });

    expect(plan.ok).toBe(true);
    expect(plan.executionAuthorized).toBe(true);
    expect(plan.reviewKind).toBe("cross_agent");
    expect(plan.cross).toMatchObject({ execution: "codex", judgement: "claude" });
    expect(plan.agents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: "smart-review-agent",
          provider: "claude",
          role: "qa",
          tier: "T0",
          closingAuthority: true,
        }),
        expect.objectContaining({
          key: "light-implementation-agent",
          provider: "codex",
          role: "se",
          tier: "T2",
          closingAuthority: false,
        }),
      ]),
    );
    expect(plan.phases.map((phase) => phase.name)).toEqual([
      "smart_test_author",
      "light_implementation",
      "smart_review",
    ]);
    expect(plan.phases[0]?.agentKey).toBe("smart-review-agent");
    expect(plan.phases[0]?.requiredEvidence).toContain("red_evidence");
    expect(plan.phases[1]?.dependsOn).toEqual(["smart_test_author"]);
    expect(plan.phases[2]?.onFail).toBe("light_implementation");
    expect(plan.gates).toEqual(
      expect.arrayContaining([
        "smart-agent-writes-test-first",
        "light-agent-cannot-close",
        "fail-verdict-routes-back-to-light-implementation",
      ]),
    );
  });

  it("marks single-runtime pairing as intra-runtime fallback, not cross-agent judgement evidence", () => {
    const plan = buildPairAgentTddPlan({
      planId: "PLAN-L7-PAIR",
      task: "Add pair-agent TDD route",
      detection: codexOnly,
      allowFrontier: true,
    });

    expect(plan.ok).toBe(true);
    expect(plan.reviewKind).toBe("intra_runtime_subagent");
    expect(plan.cross).toMatchObject({ execution: "codex", judgement: "codex" });
    expect(plan.agents.find((agent) => agent.key === "smart-review-agent")?.model).toBe("gpt-5.5");
    expect(plan.agents.find((agent) => agent.key === "light-implementation-agent")?.model).toBe(
      "gpt-5.3-codex-spark",
    );
    expect(plan.findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "intra-runtime-subagent-fallback",
          severity: "warn",
        }),
      ]),
    );
  });

  it("requires explicit frontier approval before executable smart review agent dispatch", () => {
    const plan = buildPairAgentTddPlan({
      planId: "PLAN-L7-PAIR",
      task: "Add pair-agent TDD route",
      detection: hybrid("claude"),
      primary: "claude",
    });

    expect(plan.ok).toBe(true);
    expect(plan.executionAuthorized).toBe(false);
    expect(plan.frontierApprovalRequired).toBe(true);
    expect(plan.findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "frontier-approval-required",
          severity: "warn",
        }),
      ]),
    );
  });

  it("exposes the pair-agent plan through the CLI as JSON", () => {
    const result = runCli([
      "pair-agent",
      "plan",
      "--plan-id",
      "PLAN-L7-PAIR",
      "--task",
      "Add pair-agent TDD route",
      "--primary",
      "codex",
      "--allow-frontier",
      "--mode",
      "hybrid",
      "--adapter-plans",
      "--json",
    ]);

    expect(result.status).toBe(0);
    const payload = JSON.parse(result.stdout);
    expect(payload.plan.phases.map((phase: { name: string }) => phase.name)).toEqual([
      "smart_test_author",
      "light_implementation",
      "smart_review",
    ]);
    expect(payload.adapterPlans).toHaveLength(3);
    expect(payload.adapterPlans[0]).toMatchObject({
      provider: "claude",
      model: "claude-opus-4-8",
      dry_run: true,
    });
    expect(payload.adapterPlans[1]).toMatchObject({
      provider: "codex",
      model: "gpt-5.3-codex-spark",
      dry_run: true,
    });
  });

  it("runs smart test authoring once, then repeats light implementation and smart review until pass", async () => {
    const plan = buildPairAgentTddPlan({
      planId: "PLAN-L7-PAIR",
      task: "Add pair-agent TDD route",
      detection: hybrid("codex"),
      primary: "codex",
      allowFrontier: true,
      maxFixCycles: 3,
    });
    const result = await runPairAgentTddPlan({
      plan,
      mode: "hybrid",
      execute: true,
      executor: async ({ phase, cycle }) => ({
        status: 0,
        stdout:
          phase.name === "smart_review" && cycle === 1
            ? "VERDICT: fail\n"
            : phase.name === "smart_review"
              ? "VERDICT: pass\n"
              : "ok\n",
        stderr: "",
      }),
    });

    expect(result.ok).toBe(true);
    expect(result.status).toBe("passed");
    expect(result.finalVerdict).toBe("pass");
    expect(result.transcript.map((entry) => entry.phase)).toEqual([
      "smart_test_author",
      "light_implementation",
      "smart_review",
      "light_implementation",
      "smart_review",
    ]);
    expect(result.steps.map((step) => [step.phase, step.cycle, step.status, step.verdict])).toEqual(
      [
        ["smart_test_author", 0, "passed", null],
        ["light_implementation", 1, "passed", null],
        ["smart_review", 1, "failed", "fail"],
        ["light_implementation", 2, "passed", null],
        ["smart_review", 2, "passed", "pass"],
      ],
    );
  });

  it("passes smart test output and review instructions into the next lightweight fix prompt", async () => {
    const plan = buildPairAgentTddPlan({
      planId: "PLAN-L7-PAIR",
      task: "Add pair-agent TDD route",
      detection: hybrid("codex"),
      primary: "codex",
      allowFrontier: true,
      maxFixCycles: 2,
    });
    const lightPrompts: { cycle: number; prompt: string }[] = [];
    const result = await runPairAgentTddPlan({
      plan,
      mode: "hybrid",
      execute: true,
      executor: async ({ phase, cycle, adapterPlan }) => {
        if (phase.name === "light_implementation") {
          lightPrompts.push({ cycle, prompt: adapterPlan.stdin ?? "" });
        }
        if (phase.name === "smart_test_author") {
          return {
            status: 0,
            stdout: "RED_ORACLE: expect audit status to block unsafe apply\n",
            stderr: "",
          };
        }
        if (phase.name === "smart_review" && cycle === 1) {
          return {
            status: 0,
            stdout:
              "FIX_INSTRUCTION: thread the reviewer output into the next implementation prompt\nVERDICT: fail\n",
            stderr: "",
          };
        }
        if (phase.name === "smart_review") {
          return { status: 0, stdout: "VERDICT: pass\n", stderr: "" };
        }
        return { status: 0, stdout: "implementation attempt\n", stderr: "" };
      },
    });

    expect(result.ok).toBe(true);
    expect(lightPrompts).toHaveLength(2);
    expect(lightPrompts[0]?.prompt).toContain("RED_ORACLE: expect audit status");
    expect(lightPrompts[1]?.prompt).toContain(
      "FIX_INSTRUCTION: thread the reviewer output into the next implementation prompt",
    );
    expect(lightPrompts[1]?.prompt).toContain("PAIR TRANSCRIPT");
  });

  it("blocks executable pair runs without explicit T0 frontier approval", async () => {
    const plan = buildPairAgentTddPlan({
      planId: "PLAN-L7-PAIR",
      task: "Add pair-agent TDD route",
      detection: hybrid("codex"),
      primary: "codex",
    });
    const result = await runPairAgentTddPlan({
      plan,
      mode: "hybrid",
      execute: true,
      executor: async () => ({ status: 0, stdout: "VERDICT: pass\n", stderr: "" }),
    });

    expect(result.ok).toBe(false);
    expect(result.status).toBe("blocked");
    expect(result.steps).toEqual([]);
    expect(result.findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "execution-not-authorized",
          severity: "error",
        }),
      ]),
    );
  });

  it("exposes pair-agent run as a dry-run CLI surface", () => {
    const result = runCli([
      "pair-agent",
      "run",
      "--plan-id",
      "PLAN-L7-PAIR",
      "--task",
      "Add pair-agent TDD route",
      "--primary",
      "codex",
      "--mode",
      "hybrid",
      "--json",
    ]);

    expect(result.status).toBe(0);
    const payload = JSON.parse(result.stdout);
    expect(payload.result).toMatchObject({
      ok: true,
      status: "planned",
      finalVerdict: null,
    });
    expect(payload.result.steps.map((step: { phase: string; status: string }) => step)).toEqual([
      expect.objectContaining({ phase: "smart_test_author", status: "planned" }),
      expect.objectContaining({ phase: "light_implementation", status: "planned" }),
      expect.objectContaining({ phase: "smart_review", status: "planned" }),
    ]);
  });
});

import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
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

function runCli(args: string[], cwd: string = repoRoot) {
  if (process.platform === "win32") {
    const cmdExe = join(process.env.SystemRoot ?? "C:\\Windows", "System32", "cmd.exe");
    return spawnSync(cmdExe, ["/d", "/c", "npx", "--no-install", "tsx", cliPath, ...args], {
      cwd,
      encoding: "utf8",
      env: process.env,
    });
  }
  return spawnSync("npx", ["--prefix", process.cwd(), "--no-install", "tsx", cliPath, ...args], {
    cwd,
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
    expect(plan.phases[0]?.requiredEvidence).toContain("red_test_command");
    expect(plan.phases[0]?.requiredEvidence).toContain("red_exit_code_nonzero");
    expect(plan.phases[1]?.dependsOn).toEqual(["smart_test_author"]);
    expect(plan.phases[2]?.onFail).toBe("light_implementation");
    expect(plan.gates).toEqual(
      expect.arrayContaining([
        "smart-agent-writes-test-first",
        "red-test-command-and-nonzero-exit-before-implementation",
        "light-agent-cannot-close",
        "light-implementation-requires-evidence-or-consultation",
        "consultation-routes-to-smart-instruction",
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
    expect(plan.agents.find((agent) => agent.key === "smart-review-agent")?.model).toBe(
      "gpt-5.6-sol",
    );
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

  it("derives fix-cycle budget from task difficulty when maxFixCycles is not explicit", () => {
    const plan = buildPairAgentTddPlan({
      planId: "PLAN-L7-PAIR",
      task: "production security migration pair-agent TDD route",
      detection: hybrid("codex"),
      primary: "codex",
      allowFrontier: true,
    });

    expect(plan).toMatchObject({
      difficulty: "critical",
      difficultySource: "inferred",
      maxFixCycles: 4,
      maxFixCyclesSource: "difficulty_policy",
    });
  });

  it("honors explicit difficulty and maxFixCycles overrides", () => {
    const plan = buildPairAgentTddPlan({
      planId: "PLAN-L7-PAIR",
      task: "Add pair-agent TDD route",
      detection: hybrid("codex"),
      primary: "codex",
      allowFrontier: true,
      difficulty: "simple",
      maxFixCycles: 5,
    });

    expect(plan).toMatchObject({
      difficulty: "simple",
      difficultySource: "explicit",
      maxFixCycles: 5,
      maxFixCyclesSource: "explicit",
    });
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

  it("exposes explicit difficulty through the CLI plan surface", () => {
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
      "--difficulty",
      "complex",
      "--json",
    ]);

    expect(result.status).toBe(0);
    const payload = JSON.parse(result.stdout);
    expect(payload.plan).toMatchObject({
      difficulty: "complex",
      difficultySource: "explicit",
      maxFixCycles: 3,
      maxFixCyclesSource: "difficulty_policy",
    });
  });

  it("rejects invalid CLI difficulty values", () => {
    const result = runCli([
      "pair-agent",
      "plan",
      "--plan-id",
      "PLAN-L7-PAIR",
      "--task",
      "Add pair-agent TDD route",
      "--difficulty",
      "huge",
      "--json",
    ]);

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("pair-agent plan --difficulty must be one of");
  });

  it("rejects non-integer CLI plan max fix cycle values", () => {
    for (const value of ["2abc", "1.5", "0"]) {
      const result = runCli([
        "pair-agent",
        "plan",
        "--plan-id",
        "PLAN-L7-PAIR",
        "--task",
        "Add pair-agent TDD route",
        "--max-fix-cycles",
        value,
        "--json",
      ]);

      expect(result.status).toBe(1);
      expect(result.stderr).toContain(
        "pair-agent plan --max-fix-cycles must be a positive integer",
      );
    }
  });

  it("rejects non-integer CLI run max fix cycle values", () => {
    const result = runCli([
      "pair-agent",
      "run",
      "--plan-id",
      "PLAN-L7-PAIR",
      "--task",
      "Add pair-agent TDD route",
      "--max-fix-cycles",
      "2abc",
      "--json",
    ]);

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("pair-agent run --max-fix-cycles must be a positive integer");
  });

  it("persists pair-agent plan evidence when requested", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-pair-agent-plan-evidence-"));
    try {
      const result = runCli(
        [
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
          "--save-evidence",
          "--json",
        ],
        root,
      );

      expect(result.status).toBe(0);
      const payload = JSON.parse(result.stdout);
      expect(payload.evidence_path).toMatch(
        /^\.helix\/evidence\/pair-agent\/\d{14}-PLAN-L7-PAIR-plan\.json$/,
      );
      const evidencePath = join(root, payload.evidence_path);
      expect(existsSync(evidencePath)).toBe(true);
      const evidence = JSON.parse(readFileSync(evidencePath, "utf8"));
      expect(evidence).toMatchObject({
        schema_version: "pair-agent-plan-evidence.v1",
        plan_id: "PLAN-L7-PAIR",
        mode: "hybrid",
        execute: false,
        trace: {
          plan_id: "PLAN-L7-PAIR",
          tool_contract_id: "HC-P2.buildPairAgentTddPlan",
          guardrail_decision: {
            guardrail: "frontier-approval",
            decision: "allow",
            human_signoff_required: false,
          },
          eval_outcome: { ok: true, status: "planned" },
          adapter_plans_digest: expect.stringMatching(/^sha256:[a-f0-9]{64}$/),
        },
        plan: { planId: "PLAN-L7-PAIR" },
      });
      expect(evidence.trace.phase_spans).toEqual([
        expect.objectContaining({
          phase: "smart_test_author",
          required_evidence: [
            "red_evidence",
            "red_test_command",
            "red_exit_code_nonzero",
            "acceptance_oracle",
            "test_design_trace",
          ],
          prompt_digest: expect.stringMatching(/^sha256:[a-f0-9]{64}$/),
        }),
        expect.objectContaining({
          phase: "light_implementation",
          required_evidence: ["changed_files", "targeted_test_command", "implementation_notes"],
          prompt_digest: expect.stringMatching(/^sha256:[a-f0-9]{64}$/),
        }),
        expect.objectContaining({
          phase: "smart_review",
          required_evidence: ["green_evidence", "review_findings", "verdict_line"],
          prompt_digest: expect.stringMatching(/^sha256:[a-f0-9]{64}$/),
        }),
      ]);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("prints pair-agent adapter plans in text mode without invalid stdout encoding", () => {
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
    ]);

    expect(result.status).toBe(0);
    expect(result.stderr).toBe("");
    expect(result.stdout.match(/adapter: provider=/g)).toHaveLength(3);
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
            ? "FIX_INSTRUCTION: adjust implementation to satisfy Red oracle\nVERDICT: fail\n"
            : phase.name === "smart_review"
              ? "GREEN_EVIDENCE: targeted test passed\nREVIEW: no findings\nVERDICT: pass\n"
              : phase.name === "smart_test_author"
                ? "RED_ORACLE: failing test added\nACCEPTANCE_ORACLE: expected behavior recorded\nRED_TEST_COMMAND: npx --no-install vitest run tests/pair-agent.test.ts\nRED_EXIT_CODE: 1\n"
                : "CHANGED_FILES: src/orchestration/pair-agent.ts\nTARGETED_TEST_COMMAND: npx --no-install vitest run tests/pair-agent.test.ts\nIMPLEMENTATION_NOTES: minimal implementation attempt\n",
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

  it("fails closed when the smart test author does not emit Red command/oracle evidence", async () => {
    const plan = buildPairAgentTddPlan({
      planId: "PLAN-L7-PAIR",
      task: "Add pair-agent TDD route",
      detection: hybrid("codex"),
      primary: "codex",
      allowFrontier: true,
    });
    const result = await runPairAgentTddPlan({
      plan,
      mode: "hybrid",
      execute: true,
      executor: async ({ phase }) => ({
        status: 0,
        stdout: phase.name === "smart_test_author" ? "ok\n" : "VERDICT: pass\n",
        stderr: "",
      }),
    });

    expect(result.ok).toBe(false);
    expect(result.status).toBe("error");
    expect(result.steps).toHaveLength(1);
    expect(result.steps[0]).toMatchObject({
      phase: "smart_test_author",
      status: "error",
    });
    expect(result.findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "missing-red-command-or-oracle-evidence",
          severity: "error",
        }),
      ]),
    );
  });

  it("fails closed when the smart test author does not prove a non-zero Red test exit", async () => {
    const plan = buildPairAgentTddPlan({
      planId: "PLAN-L7-PAIR",
      task: "Add pair-agent TDD route",
      detection: hybrid("codex"),
      primary: "codex",
      allowFrontier: true,
    });
    const result = await runPairAgentTddPlan({
      plan,
      mode: "hybrid",
      execute: true,
      executor: async ({ phase }) => ({
        status: 0,
        stdout:
          phase.name === "smart_test_author"
            ? "RED_ORACLE: failing test added\nACCEPTANCE_ORACLE: expected behavior recorded\nRED_TEST_COMMAND: npx --no-install vitest run tests/pair-agent.test.ts\nRED_EXIT_CODE: 0\n"
            : "VERDICT: pass\n",
        stderr: "",
      }),
    });

    expect(result.ok).toBe(false);
    expect(result.status).toBe("error");
    expect(result.steps).toHaveLength(1);
    expect(result.findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "missing-red-command-or-oracle-evidence",
          severity: "error",
        }),
      ]),
    );
  });

  it("rejects a smart review pass verdict that lacks Green evidence and review findings", async () => {
    const plan = buildPairAgentTddPlan({
      planId: "PLAN-L7-PAIR",
      task: "Add pair-agent TDD route",
      detection: hybrid("codex"),
      primary: "codex",
      allowFrontier: true,
    });
    const result = await runPairAgentTddPlan({
      plan,
      mode: "hybrid",
      execute: true,
      executor: async ({ phase }) => {
        if (phase.name === "smart_test_author") {
          return {
            status: 0,
            stdout:
              "RED_ORACLE: failing test added\nACCEPTANCE_ORACLE: expected behavior recorded\nRED_TEST_COMMAND: npx --no-install vitest run tests/pair-agent.test.ts\nRED_EXIT_CODE: 1\n",
            stderr: "",
          };
        }
        if (phase.name === "smart_review") {
          return { status: 0, stdout: "VERDICT: pass\n", stderr: "" };
        }
        return {
          status: 0,
          stdout:
            "CHANGED_FILES: src/orchestration/pair-agent.ts\nTARGETED_TEST_COMMAND: npx --no-install vitest run tests/pair-agent.test.ts\nIMPLEMENTATION_NOTES: implementation attempt\n",
          stderr: "",
        };
      },
    });

    expect(result.ok).toBe(false);
    expect(result.status).toBe("error");
    expect(result.finalVerdict).toBe("error");
    expect(result.steps.at(-1)).toMatchObject({
      phase: "smart_review",
      status: "error",
      verdict: "error",
    });
    expect(result.findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "missing-green-or-review-evidence",
          severity: "error",
        }),
      ]),
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
            stdout:
              "RED_ORACLE: expect audit status to block unsafe apply\nRED_TEST_COMMAND: npx --no-install vitest run tests/pair-agent.test.ts\nRED_EXIT_CODE: 1\n",
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
          return {
            status: 0,
            stdout: "GREEN_EVIDENCE: targeted test passed\nREVIEW: no findings\nVERDICT: pass\n",
            stderr: "",
          };
        }
        return {
          status: 0,
          stdout:
            "CHANGED_FILES: src/orchestration/pair-agent.ts\nTARGETED_TEST_COMMAND: npx --no-install vitest run tests/pair-agent.test.ts\nIMPLEMENTATION_NOTES: implementation attempt\n",
          stderr: "",
        };
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

  it("rejects smart review output without an explicit verdict line", async () => {
    const plan = buildPairAgentTddPlan({
      planId: "PLAN-L7-PAIR",
      task: "Add pair-agent TDD route",
      detection: hybrid("codex"),
      primary: "codex",
      allowFrontier: true,
    });
    const result = await runPairAgentTddPlan({
      plan,
      mode: "hybrid",
      execute: true,
      executor: async ({ phase }) => {
        if (phase.name === "smart_test_author") {
          return {
            status: 0,
            stdout:
              "RED_ORACLE: failing test added\nACCEPTANCE_ORACLE: expected behavior recorded\nRED_TEST_COMMAND: npx --no-install vitest run tests/pair-agent.test.ts\nRED_EXIT_CODE: 1\n",
            stderr: "",
          };
        }
        if (phase.name === "smart_review") {
          return {
            status: 0,
            stdout: "GREEN_EVIDENCE: targeted test passed\nREVIEW: no findings\n",
            stderr: "",
          };
        }
        return {
          status: 0,
          stdout:
            "CHANGED_FILES: src/orchestration/pair-agent.ts\nTARGETED_TEST_COMMAND: npx --no-install vitest run tests/pair-agent.test.ts\nIMPLEMENTATION_NOTES: implementation attempt\n",
          stderr: "",
        };
      },
    });

    expect(result.ok).toBe(false);
    expect(result.status).toBe("error");
    expect(result.findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "missing-review-verdict",
          severity: "error",
        }),
      ]),
    );
  });

  it("requires a pending smart review verdict to include a continuation directive", async () => {
    const plan = buildPairAgentTddPlan({
      planId: "PLAN-L7-PAIR",
      task: "Add pair-agent TDD route",
      detection: hybrid("codex"),
      primary: "codex",
      allowFrontier: true,
      maxFixCycles: 2,
    });
    const result = await runPairAgentTddPlan({
      plan,
      mode: "hybrid",
      execute: true,
      executor: async ({ phase }) => {
        if (phase.name === "smart_test_author") {
          return {
            status: 0,
            stdout:
              "RED_ORACLE: failing test added\nACCEPTANCE_ORACLE: expected behavior recorded\nRED_TEST_COMMAND: npx --no-install vitest run tests/pair-agent.test.ts\nRED_EXIT_CODE: 1\n",
            stderr: "",
          };
        }
        if (phase.name === "smart_review") {
          return {
            status: 0,
            stdout: "REVIEW: implementation needs another pass\nVERDICT: pending\n",
            stderr: "",
          };
        }
        return {
          status: 0,
          stdout:
            "CHANGED_FILES: src/orchestration/pair-agent.ts\nTARGETED_TEST_COMMAND: npx --no-install vitest run tests/pair-agent.test.ts\nIMPLEMENTATION_NOTES: implementation attempt\n",
          stderr: "",
        };
      },
    });

    expect(result.ok).toBe(false);
    expect(result.status).toBe("error");
    expect(result.findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "missing-continuation-directive",
          severity: "error",
        }),
      ]),
    );
  });

  it("does not treat review findings alone as a fix instruction", async () => {
    const plan = buildPairAgentTddPlan({
      planId: "PLAN-L7-PAIR",
      task: "Add pair-agent TDD route",
      detection: hybrid("codex"),
      primary: "codex",
      allowFrontier: true,
    });
    const result = await runPairAgentTddPlan({
      plan,
      mode: "hybrid",
      execute: true,
      executor: async ({ phase }) => {
        if (phase.name === "smart_test_author") {
          return {
            status: 0,
            stdout:
              "RED_ORACLE: failing test added\nACCEPTANCE_ORACLE: expected behavior recorded\nRED_TEST_COMMAND: npx --no-install vitest run tests/pair-agent.test.ts\nRED_EXIT_CODE: 1\n",
            stderr: "",
          };
        }
        if (phase.name === "smart_review") {
          return {
            status: 0,
            stdout: "REVIEW_FINDINGS: missing route matrix coverage\nVERDICT: fail\n",
            stderr: "",
          };
        }
        return {
          status: 0,
          stdout:
            "CHANGED_FILES: src/orchestration/pair-agent.ts\nTARGETED_TEST_COMMAND: npx --no-install vitest run tests/pair-agent.test.ts\nIMPLEMENTATION_NOTES: implementation attempt\n",
          stderr: "",
        };
      },
    });

    expect(result.ok).toBe(false);
    expect(result.status).toBe("error");
    expect(result.findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "missing-fix-instruction",
          severity: "error",
        }),
      ]),
    );
  });

  it("fails closed when the lightweight implementation emits no implementation evidence or consultation", async () => {
    const plan = buildPairAgentTddPlan({
      planId: "PLAN-L7-PAIR",
      task: "Add pair-agent TDD route",
      detection: hybrid("codex"),
      primary: "codex",
      allowFrontier: true,
    });
    const result = await runPairAgentTddPlan({
      plan,
      mode: "hybrid",
      execute: true,
      executor: async ({ phase }) => {
        if (phase.name === "smart_test_author") {
          return {
            status: 0,
            stdout:
              "RED_ORACLE: failing test added\nACCEPTANCE_ORACLE: expected behavior recorded\nRED_TEST_COMMAND: npx --no-install vitest run tests/pair-agent.test.ts\nRED_EXIT_CODE: 1\n",
            stderr: "",
          };
        }
        return { status: 0, stdout: "implementation attempt without evidence\n", stderr: "" };
      },
    });

    expect(result.ok).toBe(false);
    expect(result.status).toBe("error");
    expect(result.steps.at(-1)).toMatchObject({
      phase: "light_implementation",
      status: "error",
    });
    expect(result.findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "missing-light-implementation-evidence",
          severity: "error",
        }),
      ]),
    );
  });

  it("fails closed when the lightweight implementation tries to close or approve the work", async () => {
    const plan = buildPairAgentTddPlan({
      planId: "PLAN-L7-PAIR",
      task: "Add pair-agent TDD route",
      detection: hybrid("codex"),
      primary: "codex",
      allowFrontier: true,
    });
    const result = await runPairAgentTddPlan({
      plan,
      mode: "hybrid",
      execute: true,
      executor: async ({ phase }) => {
        if (phase.name === "smart_test_author") {
          return {
            status: 0,
            stdout:
              "RED_ORACLE: failing test added\nACCEPTANCE_ORACLE: expected behavior recorded\nRED_TEST_COMMAND: npx --no-install vitest run tests/pair-agent.test.ts\nRED_EXIT_CODE: 1\n",
            stderr: "",
          };
        }
        if (phase.name === "smart_review") {
          return {
            status: 0,
            stdout: "GREEN_EVIDENCE: targeted test passed\nREVIEW: no findings\nVERDICT: pass\n",
            stderr: "",
          };
        }
        return {
          status: 0,
          stdout:
            "CHANGED_FILES: src/orchestration/pair-agent.ts\nTARGETED_TEST_COMMAND: npx --no-install vitest run tests/pair-agent.test.ts\nIMPLEMENTATION_NOTES: implementation attempt\nVERDICT: pass\n",
          stderr: "",
        };
      },
    });

    expect(result.ok).toBe(false);
    expect(result.status).toBe("error");
    expect(result.steps.at(-1)).toMatchObject({
      phase: "light_implementation",
      status: "error",
    });
    expect(result.findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "light-agent-closure-claim",
          severity: "error",
        }),
      ]),
    );
  });

  it("routes lightweight consultation to smart instruction before the next fix cycle", async () => {
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
            stdout:
              "RED_ORACLE: expect route matrix\nACCEPTANCE_ORACLE: packet has route matrix\nRED_TEST_COMMAND: npx --no-install vitest run tests/pair-agent.test.ts\nRED_EXIT_CODE: 1\n",
            stderr: "",
          };
        }
        if (phase.name === "light_implementation" && cycle === 1) {
          return {
            status: 0,
            stdout: "CONSULTATION_QUESTION: should route matrix include rejected and pivot?\n",
            stderr: "",
          };
        }
        if (phase.name === "smart_review" && cycle === 1) {
          return {
            status: 0,
            stdout:
              "IMPLEMENTATION_DIRECTIVE: include confirmed, rejected, and pivot rows\nVERDICT: pending\n",
            stderr: "",
          };
        }
        if (phase.name === "smart_review") {
          return {
            status: 0,
            stdout: "GREEN_EVIDENCE: targeted test passed\nREVIEW: no findings\nVERDICT: pass\n",
            stderr: "",
          };
        }
        return {
          status: 0,
          stdout:
            "CHANGED_FILES: src/orchestration/pair-agent.ts\nTARGETED_TEST_COMMAND: npx --no-install vitest run tests/pair-agent.test.ts\nIMPLEMENTATION_NOTES: implemented route matrix\n",
          stderr: "",
        };
      },
    });

    expect(result.ok).toBe(true);
    expect(result.steps.map((step) => [step.phase, step.cycle, step.status, step.verdict])).toEqual(
      [
        ["smart_test_author", 0, "passed", null],
        ["light_implementation", 1, "pending", null],
        ["smart_review", 1, "pending", "pending"],
        ["light_implementation", 2, "passed", null],
        ["smart_review", 2, "passed", "pass"],
      ],
    );
    expect(lightPrompts[1]?.prompt).toContain(
      "IMPLEMENTATION_DIRECTIVE: include confirmed, rejected, and pivot rows",
    );
  });

  it("treats consultation as pending even when lightweight output also includes implementation evidence", async () => {
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
            stdout:
              "RED_ORACLE: expect bounded consultation handoff\nACCEPTANCE_ORACLE: mixed consultation cannot pass as implementation\nRED_TEST_COMMAND: npx --no-install vitest run tests/pair-agent.test.ts\nRED_EXIT_CODE: 1\n",
            stderr: "",
          };
        }
        if (phase.name === "light_implementation" && cycle === 1) {
          return {
            status: 0,
            stdout:
              "CHANGED_FILES: src/orchestration/pair-agent.ts\nTARGETED_TEST_COMMAND: npx --no-install vitest run tests/pair-agent.test.ts\nIMPLEMENTATION_NOTES: partial attempt\nCONSULTATION_QUESTION: should consultation override partial implementation evidence?\n",
            stderr: "",
          };
        }
        if (phase.name === "smart_review" && cycle === 1) {
          return {
            status: 0,
            stdout:
              "IMPLEMENTATION_DIRECTIVE: treat any consultation marker as pending and route back to light fix\nVERDICT: pending\n",
            stderr: "",
          };
        }
        if (phase.name === "smart_review") {
          return {
            status: 0,
            stdout: "GREEN_EVIDENCE: targeted test passed\nREVIEW: no findings\nVERDICT: pass\n",
            stderr: "",
          };
        }
        return {
          status: 0,
          stdout:
            "CHANGED_FILES: src/orchestration/pair-agent.ts\nTARGETED_TEST_COMMAND: npx --no-install vitest run tests/pair-agent.test.ts\nIMPLEMENTATION_NOTES: implemented directive\n",
          stderr: "",
        };
      },
    });

    expect(result.ok).toBe(true);
    expect(result.steps.map((step) => [step.phase, step.cycle, step.status, step.verdict])).toEqual(
      [
        ["smart_test_author", 0, "passed", null],
        ["light_implementation", 1, "pending", null],
        ["smart_review", 1, "pending", "pending"],
        ["light_implementation", 2, "passed", null],
        ["smart_review", 2, "passed", "pass"],
      ],
    );
    expect(lightPrompts[1]?.prompt).toContain(
      "IMPLEMENTATION_DIRECTIVE: treat any consultation marker as pending",
    );
  });

  it("accepts a smart fail verdict as consultation guidance when it includes an implementation directive", async () => {
    const plan = buildPairAgentTddPlan({
      planId: "PLAN-L7-PAIR",
      task: "Add pair-agent TDD route",
      detection: hybrid("codex"),
      primary: "codex",
      allowFrontier: true,
      maxFixCycles: 2,
    });
    const result = await runPairAgentTddPlan({
      plan,
      mode: "hybrid",
      execute: true,
      executor: async ({ phase, cycle }) => {
        if (phase.name === "smart_test_author") {
          return {
            status: 0,
            stdout:
              "RED_ORACLE: expect route matrix\nACCEPTANCE_ORACLE: packet has route matrix\nRED_TEST_COMMAND: npx --no-install vitest run tests/pair-agent.test.ts\nRED_EXIT_CODE: 1\n",
            stderr: "",
          };
        }
        if (phase.name === "light_implementation" && cycle === 1) {
          return {
            status: 0,
            stdout: "CONSULTATION_QUESTION: which decision outcomes are required?\n",
            stderr: "",
          };
        }
        if (phase.name === "smart_review" && cycle === 1) {
          return {
            status: 0,
            stdout:
              "IMPLEMENTATION_DIRECTIVE: include confirmed, rejected, and pivot outcomes\nVERDICT: fail\n",
            stderr: "",
          };
        }
        if (phase.name === "smart_review") {
          return {
            status: 0,
            stdout: "GREEN_EVIDENCE: targeted test passed\nREVIEW: no findings\nVERDICT: pass\n",
            stderr: "",
          };
        }
        return {
          status: 0,
          stdout:
            "CHANGED_FILES: src/orchestration/pair-agent.ts\nTARGETED_TEST_COMMAND: npx --no-install vitest run tests/pair-agent.test.ts\nIMPLEMENTATION_NOTES: implemented directive\n",
          stderr: "",
        };
      },
    });

    expect(result.ok).toBe(true);
    expect(result.steps.map((step) => [step.phase, step.cycle, step.status, step.verdict])).toEqual(
      [
        ["smart_test_author", 0, "passed", null],
        ["light_implementation", 1, "pending", null],
        ["smart_review", 1, "failed", "fail"],
        ["light_implementation", 2, "passed", null],
        ["smart_review", 2, "passed", "pass"],
      ],
    );
  });

  it("records max-fix-cycles exhaustion as a finding", async () => {
    const plan = buildPairAgentTddPlan({
      planId: "PLAN-L7-PAIR",
      task: "Add pair-agent TDD route",
      detection: hybrid("codex"),
      primary: "codex",
      allowFrontier: true,
      maxFixCycles: 1,
    });
    const result = await runPairAgentTddPlan({
      plan,
      mode: "hybrid",
      execute: true,
      executor: async ({ phase }) => {
        if (phase.name === "smart_test_author") {
          return {
            status: 0,
            stdout:
              "RED_ORACLE: expect route matrix\nACCEPTANCE_ORACLE: packet has route matrix\nRED_TEST_COMMAND: npx --no-install vitest run tests/pair-agent.test.ts\nRED_EXIT_CODE: 1\n",
            stderr: "",
          };
        }
        if (phase.name === "smart_review") {
          return {
            status: 0,
            stdout:
              "FIX_INSTRUCTION: add the missing route matrix row before review can pass\nVERDICT: fail\n",
            stderr: "",
          };
        }
        return {
          status: 0,
          stdout:
            "CHANGED_FILES: src/orchestration/pair-agent.ts\nTARGETED_TEST_COMMAND: npx --no-install vitest run tests/pair-agent.test.ts\nIMPLEMENTATION_NOTES: first attempt\n",
          stderr: "",
        };
      },
    });

    expect(result.ok).toBe(false);
    expect(result.status).toBe("failed");
    expect(result.findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "max-fix-cycles-exhausted",
          severity: "error",
        }),
      ]),
    );
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

  it("persists pair-agent run evidence when requested", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-pair-agent-evidence-"));
    try {
      const result = runCli(
        [
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
          "--save-evidence",
          "--json",
        ],
        root,
      );

      expect(result.status).toBe(0);
      const payload = JSON.parse(result.stdout);
      expect(payload.evidence_path).toMatch(
        /^\.helix\/evidence\/pair-agent\/\d{14}-PLAN-L7-PAIR\.json$/,
      );
      const evidencePath = join(root, payload.evidence_path);
      expect(existsSync(evidencePath)).toBe(true);
      const evidence = JSON.parse(readFileSync(evidencePath, "utf8"));
      expect(evidence).toMatchObject({
        schema_version: "pair-agent-run-evidence.v1",
        run_id: expect.stringMatching(/^pair-agent:PLAN-L7-PAIR:\d{14}$/),
        mode: "hybrid",
        execute: false,
        trace: {
          plan_id: "PLAN-L7-PAIR",
          span_id: expect.stringMatching(/^pair-agent:PLAN-L7-PAIR:\d{14}:run$/),
          tool_contract_id: "HC-P2.runPairAgentTddPlan",
          handoff_target: "orchestrator",
          guardrail_decision: {
            guardrail: "frontier-approval",
            decision: "allow",
            human_signoff_required: false,
          },
          eval_outcome: { ok: true, status: "planned", final_verdict: null },
          loop_summary: {
            phase_count: 3,
            smart_test_author_count: 1,
            light_implementation_count: 1,
            smart_review_count: 1,
            consultation_count: 0,
            pending_consultation_count: 0,
            failed_review_count: 0,
            fix_cycle_count: 0,
            transcript_digest:
              "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
          },
          cost_usd: null,
        },
        plan: { planId: "PLAN-L7-PAIR" },
        result: {
          status: "planned",
          findings: expect.arrayContaining([
            expect.objectContaining({ code: "frontier-approval-required", severity: "warn" }),
          ]),
        },
      });
      expect(typeof evidence.trace.duration_ms).toBe("number");
      expect(evidence.trace.duration_ms).toBeGreaterThanOrEqual(0);
      expect(evidence.trace.phase_spans).toEqual([
        expect.objectContaining({
          span_id: expect.stringMatching(/^pair-agent:PLAN-L7-PAIR:\d{14}:phase:1$/),
          parent_span_id: expect.stringMatching(/^pair-agent:PLAN-L7-PAIR:\d{14}:run$/),
          phase: "smart_test_author",
          handoff_target: null,
          required_evidence: [
            "red_evidence",
            "red_test_command",
            "red_exit_code_nonzero",
            "acceptance_oracle",
            "test_design_trace",
          ],
          output_excerpt_digest:
            "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
          eval_outcome: { status: "planned", verdict: null, exit_code: null },
        }),
        expect.objectContaining({
          phase: "light_implementation",
          handoff_target: "smart_test_author",
          required_evidence: ["changed_files", "targeted_test_command", "implementation_notes"],
          output_excerpt_digest:
            "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        }),
        expect.objectContaining({
          phase: "smart_review",
          handoff_target: "light_implementation",
          required_evidence: ["green_evidence", "review_findings", "verdict_line"],
          output_excerpt_digest:
            "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        }),
      ]);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});

import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  adapterExecutionEnv,
  admitWrapperLaunch,
  buildAdapterPlan,
  buildWrapperAdapterPlan,
  evaluateWrapperAdmissionWitness,
  isWrapperLaunchCapability,
} from "../src/runtime/adapter";
import { testWorkerContext } from "./helpers/worker-context";

// PLAN-L7-503-worker-context-authority

// PLAN-L7-498-worker-wrapper-admission

const DIGEST_A = `sha256:${"a".repeat(64)}` as const;
const DIGEST_B = `sha256:${"b".repeat(64)}` as const;

describe("worker wrapper admission", () => {
  it("U-WWA-001: HELIX内部で生成したplanだけをsealed capabilityへ昇格する", () => {
    const plan = buildWrapperAdapterPlan(
      { provider: "codex", role: "se", task: "implement", execute: true },
      "hybrid",
      "helix_cli_adapter",
    );

    const result = admitWrapperLaunch(plan);

    expect("failure_code" in result).toBe(false);
    if ("failure_code" in result) return;
    expect(result.invocation.args).toEqual(plan.args);
    expect(result.stdin).toBe(plan.stdin);
    expect(isWrapperLaunchCapability(result.capability)).toBe(true);
    expect(
      isWrapperLaunchCapability({
        ...result.capability,
      }),
    ).toBe(false);
  });

  it("U-WWA-002: raw／copy planの後付け再ラベルを拒否する", () => {
    const raw = buildAdapterPlan(
      { provider: "claude", role: "reviewer", task: "review", execute: true },
      "hybrid",
    );
    expect(admitWrapperLaunch(raw)).toEqual({
      admitted: false,
      failure_code: "WRAPPER_ROUTE_REJECTED",
    });

    const wrapper = buildWrapperAdapterPlan(
      { provider: "claude", role: "reviewer", task: "review", execute: true },
      "hybrid",
      "team_adapter",
    );
    expect(admitWrapperLaunch({ ...wrapper })).toEqual({
      admitted: false,
      failure_code: "WRAPPER_ROUTE_REJECTED",
    });
  });

  it("U-WWA-003: planを生成後に改竄するとdigest mismatchで拒否する", () => {
    const plan = buildWrapperAdapterPlan(
      { provider: "codex", role: "se", task: "implement", execute: true },
      "hybrid",
      "helix_cli_adapter",
    );
    plan.args.push("--dangerous");

    expect(admitWrapperLaunch(plan)).toEqual({
      admitted: false,
      failure_code: "WRAPPER_ADAPTER_PLAN_DIGEST_MISMATCH",
    });
  });

  it("U-WWA-004: originとplanのprovider不一致をdigest判定前に拒否する", () => {
    const plan = buildWrapperAdapterPlan(
      { provider: "codex", role: "se", task: "implement", execute: true },
      "hybrid",
      "helix_cli_adapter",
    );
    plan.provider = "claude";

    expect(admitWrapperLaunch(plan)).toEqual({
      admitted: false,
      failure_code: "WRAPPER_ORIGIN_PROVIDER_MISMATCH",
    });
  });

  it("U-WWA-005: direct provider routeを拒否する", () => {
    expect(
      evaluateWrapperAdmissionWitness({
        route: "direct_provider_cli",
        expected_adapter_plan_digest: DIGEST_A,
        actual_adapter_plan_digest: DIGEST_A,
        expected_invocation_digest: DIGEST_A,
        actual_invocation_digest: DIGEST_A,
      }),
    ).toEqual({
      admitted: false,
      failure_code: "WRAPPER_ROUTE_REJECTED",
    });
  });

  it("U-WWA-006: adapter plan digest failureへ到達する", () => {
    expect(
      evaluateWrapperAdmissionWitness({
        route: "helix_cli_adapter",
        expected_adapter_plan_digest: DIGEST_A,
        actual_adapter_plan_digest: DIGEST_B,
        expected_invocation_digest: DIGEST_A,
        actual_invocation_digest: DIGEST_A,
      }),
    ).toEqual({
      admitted: false,
      failure_code: "WRAPPER_ADAPTER_PLAN_DIGEST_MISMATCH",
    });
  });

  it("U-WWA-007: invocation digest failureへ到達する", () => {
    expect(
      evaluateWrapperAdmissionWitness({
        route: "team_adapter",
        expected_adapter_plan_digest: DIGEST_A,
        actual_adapter_plan_digest: DIGEST_A,
        expected_invocation_digest: DIGEST_A,
        actual_invocation_digest: DIGEST_B,
      }),
    ).toEqual({
      admitted: false,
      failure_code: "WRAPPER_INVOCATION_DIGEST_MISMATCH",
    });
  });

  it("U-WWA-008: process launch admissionはFR-09 context未束縛を拒否する", () => {
    const plan = buildWrapperAdapterPlan(
      { provider: "codex", role: "se", task: "implement", execute: true },
      "hybrid",
      "helix_cli_adapter",
    );

    expect(admitWrapperLaunch(plan, { requireWorkerContext: true })).toEqual({
      admitted: false,
      failure_code: "WRAPPER_CONTEXT_REQUIRED",
    });
  });

  it("U-WWA-009: compile後dirty authorityをdirect sinkのspawn前に拒否する", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-wrapper-context-"));
    const paths = [
      "docs/governance/helix-harness-requirements_v1.3.md",
      "docs/governance/l12-canonical-vmodel-direction-directive_v0.1.md",
      "docs/design/helix/L3-requirements/worker-common-contract.md",
      "AGENTS.md",
      "CLAUDE.md",
      ".claude/CLAUDE.md",
      "docs/skills/judgment-core.md",
    ];
    try {
      for (const path of paths) {
        const target = join(root, path);
        mkdirSync(dirname(target), { recursive: true });
        writeFileSync(target, readFileSync(join(process.cwd(), path)));
      }
      execFileSync("git", ["init", "-q"], { cwd: root });
      execFileSync("git", ["add", ...paths], { cwd: root });
      execFileSync(
        "git",
        [
          "-c",
          "user.name=HELIX Test",
          "-c",
          "user.email=helix@example.invalid",
          "commit",
          "-qm",
          "fixture",
        ],
        { cwd: root },
      );
      const plan = buildWrapperAdapterPlan(
        {
          provider: "codex",
          role: "se",
          task: "implement",
          execute: true,
          workerContext: testWorkerContext(root),
        },
        "hybrid",
        "helix_cli_adapter",
      );
      writeFileSync(join(root, "AGENTS.md"), "dirty-after-compile\n", { flag: "a" });

      expect(admitWrapperLaunch(plan, { requireWorkerContext: true })).toEqual({
        admitted: false,
        failure_code: "WRAPPER_CONTEXT_AUTHORITY_STALE",
      });
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("U-WWA-010: provider childへsecretとHELIX state環境を継承しない", () => {
    const env = adapterExecutionEnv(
      "claude",
      { CLAUDE_CODE_EFFORT_LEVEL: "high" },
      {
        PATH: "/usr/bin",
        HOME: "/home/worker",
        LANG: "ja_JP.UTF-8",
        GITHUB_TOKEN: "must-not-cross",
        ANTHROPIC_API_KEY: "must-not-cross",
        HELIX_DB_PATH: "/repo/.helix/harness.db",
        HELIX_STATE_ROOT: "/repo/.helix/state",
      },
    );

    expect(env).toEqual({
      PATH: "/usr/bin",
      HOME: "/home/worker",
      LANG: "ja_JP.UTF-8",
      CLAUDE_CODE_EFFORT_LEVEL: "high",
    });
  });

  it("U-WWA-011: sealed planのenv改竄をdigest mismatchで拒否する", () => {
    const plan = buildWrapperAdapterPlan(
      { provider: "claude", role: "reviewer", task: "review", effort: "high", execute: true },
      "hybrid",
      "helix_cli_adapter",
    );
    plan.env = { ...plan.env, GITHUB_TOKEN: "injected-after-seal" };

    expect(admitWrapperLaunch(plan)).toEqual({
      admitted: false,
      failure_code: "WRAPPER_ADAPTER_PLAN_DIGEST_MISMATCH",
    });
  });
});

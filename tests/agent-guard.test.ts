import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  type AgentGuardContext,
  type AgentGuardInput,
  evaluateAgentGuard,
  normalizeModelFamily,
  type ResolvedFamily,
  SUBAGENT_ALLOWLIST,
} from "../src/runtime/agent-guard";
import {
  AGENT_GUARD_BYPASS_HINT,
  AGENT_TOOL_NAME,
  AGENT_TOOL_NAMES,
} from "../src/runtime/agent-guard-policy";

const FAMILIES: Record<string, ResolvedFamily> = {
  "pmo-sonnet": "sonnet",
  "pmo-haiku": "haiku",
  "refactor-scout": "haiku",
  "pdm-tech-innovation": "opus",
  "code-reviewer": "sonnet",
  "advisor-fable": "fable",
  // fable を frontmatter 宣言した非 apex agent (fixture: 密輸検知用)
  "qa-test": "fable",
};
const legacyRuntimeCommand = `${["ut", "tdd"].join("-")} codex`;
const cliPath = join(process.cwd(), "src", "cli.ts");

function ctx(allowRaw = false): AgentGuardContext {
  return {
    allowRaw,
    resolveAgentFamily: (s) => FAMILIES[s] ?? "missing",
  };
}

/** 委譲ブリーフ 4 marker を満たす prompt (PLAN-L7-337)。既存 oracle は brief 充足を前提に流す。 */
const BRIEF_PROMPT =
  "【objective】fixture 調査【output format】箇条書き【tool guidance】Read のみ【task boundary】tests/ 配下のみ";

function agent(tool_input: AgentGuardInput["tool_input"]): AgentGuardInput {
  return { tool_name: "Agent", tool_input: { prompt: BRIEF_PROMPT, ...tool_input } };
}

function task(tool_input: AgentGuardInput["tool_input"]): AgentGuardInput {
  return { tool_name: "Task", tool_input: { prompt: BRIEF_PROMPT, ...tool_input } };
}

function codexSpawn(tool_input: AgentGuardInput["tool_input"]): AgentGuardInput {
  return { tool_name: "spawn_agent", tool_input };
}

function runCliAgentGuard(input: AgentGuardInput | string) {
  const cwd = mkdtempSync(join(tmpdir(), "helix-agent-guard-cli-"));
  try {
    return spawnSync("npx", ["--no-install", "tsx", cliPath, "hook", "agent-guard"], {
      cwd,
      encoding: "utf8",
      input: typeof input === "string" ? input : JSON.stringify(input),
      env: { ...process.env, HELIX_ALLOW_RAW_AGENT: undefined },
    });
  } finally {
    rmSync(cwd, { recursive: true, force: true });
  }
}

describe("normalizeModelFamily", () => {
  it("normalizes family names and Anthropic model ids", () => {
    expect(normalizeModelFamily("sonnet")).toBe("sonnet");
    expect(normalizeModelFamily("claude-sonnet-4-6")).toBe("sonnet");
    expect(normalizeModelFamily("claude-haiku-4-5-20251001")).toBe("haiku");
    expect(normalizeModelFamily("claude-opus-4-7")).toBe("opus");
  });
  it("returns null for empty / non-Claude models", () => {
    expect(normalizeModelFamily("")).toBeNull();
    expect(normalizeModelFamily(null)).toBeNull();
    expect(normalizeModelFamily("gpt-5.5")).toBeNull();
  });
  it("returns null for ambiguous strings containing multiple families", () => {
    expect(normalizeModelFamily("sonnet-opus")).toBeNull();
    expect(normalizeModelFamily("haiku/sonnet")).toBeNull();
  });
});

describe("evaluateAgentGuard", () => {
  it("loads guard policy from the externalized policy module", () => {
    expect(AGENT_TOOL_NAME).toBe("Agent");
    expect([...AGENT_TOOL_NAMES]).toEqual(["Agent", "Task"]);
    expect(AGENT_GUARD_BYPASS_HINT).toContain("HELIX_ALLOW_RAW_AGENT");
  });

  it("passes non-Agent tools untouched", () => {
    expect(evaluateAgentGuard({ tool_name: "Bash" }, ctx()).code).toBe(0);
    expect(evaluateAgentGuard({ tool_name: "Edit" }, ctx()).code).toBe(0);
  });

  it("blocks missing subagent_type (general-purpose default route)", () => {
    expect(evaluateAgentGuard(agent({}), ctx()).code).toBe(2);
  });

  it("blocks null / omitted tool_input (fail-close)", () => {
    expect(evaluateAgentGuard({ tool_name: "Agent", tool_input: null }, ctx()).code).toBe(2);
    expect(evaluateAgentGuard({ tool_name: "Agent" }, ctx()).code).toBe(2);
    expect(evaluateAgentGuard({ tool_name: "Task", tool_input: null }, ctx()).code).toBe(2);
    expect(evaluateAgentGuard({ tool_name: "Task" }, ctx()).code).toBe(2);
  });

  it("blocks non-allowlisted subagent even with valid model", () => {
    const d = evaluateAgentGuard(agent({ subagent_type: "be-logic", model: "sonnet" }), ctx());
    expect(d.code).toBe(2);
    expect(d.message).toContain("not allowlisted");
    expect(d.message).toContain("helix codex --role");
    expect(d.message).not.toContain(legacyRuntimeCommand);
  });

  it("blocks an unnormalizable or ambiguous model on an allowlisted agent", () => {
    expect(
      evaluateAgentGuard(agent({ subagent_type: "pmo-sonnet", model: "gpt-5.5" }), ctx()).code,
    ).toBe(2);
    expect(
      evaluateAgentGuard(agent({ subagent_type: "pmo-sonnet", model: "sonnet-opus" }), ctx()).code,
    ).toBe(2);
  });

  it("blocks omitted model (strict explicit model required)", () => {
    const d = evaluateAgentGuard(agent({ subagent_type: "pmo-sonnet" }), ctx());
    expect(d.code).toBe(2);
    expect(d.message).toContain("model");
  });

  it("allows explicit model matching the agent's frontmatter family", () => {
    expect(
      evaluateAgentGuard(agent({ subagent_type: "pmo-sonnet", model: "sonnet" }), ctx()).code,
    ).toBe(0);
    expect(
      evaluateAgentGuard(agent({ subagent_type: "pmo-haiku", model: "haiku" }), ctx()).code,
    ).toBe(0);
    expect(
      evaluateAgentGuard(agent({ subagent_type: "refactor-scout", model: "haiku" }), ctx()).code,
    ).toBe(0);
    expect(
      evaluateAgentGuard(task({ subagent_type: "pmo-sonnet", model: "sonnet" }), ctx()).code,
    ).toBe(0);
  });

  it("blocks opus override on a sonnet-family agent", () => {
    const d = evaluateAgentGuard(agent({ subagent_type: "pmo-sonnet", model: "opus" }), ctx());
    expect(d.code).toBe(2);
    expect(d.message).toContain("override");
  });

  it("allows opus for an opus-frontmatter agent (pdm-*)", () => {
    expect(
      evaluateAgentGuard(agent({ subagent_type: "pdm-tech-innovation", model: "opus" }), ctx())
        .code,
    ).toBe(0);
  });

  it("U-AGFA-001: allows fable for the apex advisor (advisor-fable)", () => {
    expect(
      evaluateAgentGuard(agent({ subagent_type: "advisor-fable", model: "fable" }), ctx()).code,
    ).toBe(0);
  });

  it("U-AGFA-002: blocks fable smuggled via frontmatter on a non-apex agent (PLAN-L7-306 境界)", () => {
    // fixture: qa-test が frontmatter で fable を宣言しても、apex allowlist 外なら fail-close。
    const d = evaluateAgentGuard(agent({ subagent_type: "qa-test", model: "fable" }), ctx());
    expect(d.code).toBe(2);
    expect(d.message).toContain("fable");
    expect(d.message).toContain("advisor-fable");
  });

  it("U-AGFA-003: fable apex block is bypassable only via HELIX_ALLOW_RAW_AGENT (audit 前提)", () => {
    const d = evaluateAgentGuard(agent({ subagent_type: "qa-test", model: "fable" }), ctx(true));
    expect(d.code).toBe(0);
    expect(d.message).toContain("bypassed");
  });

  it("blocks an allowlisted subagent whose definition file is missing", () => {
    // pmo-tech-docs is allowlisted but intentionally absent from this test resolver.
    expect(SUBAGENT_ALLOWLIST.has("pmo-tech-docs")).toBe(true);
    const d = evaluateAgentGuard(agent({ subagent_type: "pmo-tech-docs", model: "sonnet" }), ctx());
    expect(d.code).toBe(2);
  });

  it("bypasses block when allowRaw is set", () => {
    const d = evaluateAgentGuard(agent({ subagent_type: "be-logic", model: "sonnet" }), ctx(true));
    expect(d.code).toBe(0);
    expect(d.bypassed).toBe(true);
  });

  it("blocks Codex spawn_agent calls without an explicit agent_type", () => {
    const d = evaluateAgentGuard(codexSpawn({ message: "Inspect the routing code" }), ctx());
    expect(d.code).toBe(2);
    expect(d.message).toContain("agent_type");
  });

  it("allows Codex spawn_agent with an approved agent_type, inherited model, and concrete task", () => {
    const d = evaluateAgentGuard(
      codexSpawn({ agent_type: "worker", message: "Ownership: tests/agent-guard.test.ts only" }),
      ctx(),
    );
    expect(d.code).toBe(0);
  });

  it("blocks Codex spawn_agent unknown roles and direct model overrides", () => {
    expect(
      evaluateAgentGuard(codexSpawn({ agent_type: "auditor", message: "Review code" }), ctx()).code,
    ).toBe(2);
    const override = evaluateAgentGuard(
      codexSpawn({ agent_type: "worker", model: "gpt-5.5", message: "Implement change" }),
      ctx(),
    );
    expect(override.code).toBe(2);
    expect(override.message).toContain("model override");
  });

  it("blocks Codex spawn_agent calls without a concrete task body", () => {
    const d = evaluateAgentGuard(codexSpawn({ agent_type: "explorer" }), ctx());
    expect(d.code).toBe(2);
    expect(d.message).toContain("task body");
  });

  it("blocks Codex bulk spawn surface until team-run ownership can guard each member", () => {
    const d = evaluateAgentGuard(
      { tool_name: "spawn_agents_on_csv", tool_input: { agent_type: "worker", message: "x" } },
      ctx(),
    );
    expect(d.code).toBe(2);
    expect(d.message).toContain("bulk");
  });

  it("U-AGUARD-BRIEF-001: 委譲ブリーフ 4 marker 欠落の Agent prompt を fail-close で block する", () => {
    const d = evaluateAgentGuard(
      {
        tool_name: "Agent",
        tool_input: { subagent_type: "pmo-sonnet", model: "sonnet", prompt: "調べておいて" },
      },
      ctx(),
    );
    expect(d.code).toBe(2);
    expect(d.message).toContain("delegation-brief");
    expect(d.message).toContain("objective");
    expect(d.message).toContain("judgment-core.md");
  });

  it("U-AGUARD-BRIEF-002: prompt 欠落は 4 marker 全欠落として block、部分欠落は欠落 key を列挙する", () => {
    const missingAll = evaluateAgentGuard(
      { tool_name: "Agent", tool_input: { subagent_type: "pmo-sonnet", model: "sonnet" } },
      ctx(),
    );
    expect(missingAll.code).toBe(2);

    const partial = evaluateAgentGuard(
      {
        tool_name: "Agent",
        tool_input: {
          subagent_type: "pmo-sonnet",
          model: "sonnet",
          prompt: "【objective】x【output format】y【tool guidance】z",
        },
      },
      ctx(),
    );
    expect(partial.code).toBe(2);
    expect(partial.message).toContain("task boundary");
    expect(partial.message).not.toContain("objective,"); // 充足済み key は列挙しない
  });

  it("U-AGUARD-BRIEF-003: 英語 / 日本語ラベル混在でも 4 要素が揃えば pass", () => {
    const ja = evaluateAgentGuard(
      {
        tool_name: "Agent",
        tool_input: {
          subagent_type: "pmo-sonnet",
          model: "sonnet",
          prompt: "【目的】調査【出力形式】表【ツール方針】Read のみ【境界】src/ のみ",
        },
      },
      ctx(),
    );
    expect(ja.code).toBe(0);

    const mixed = evaluateAgentGuard(
      {
        tool_name: "Agent",
        tool_input: {
          subagent_type: "pmo-haiku",
          model: "haiku",
          prompt: "【objective】scan【出力形式】1 行 1 件【tool guidance】Grep【境界】docs/ のみ",
        },
      },
      ctx(),
    );
    expect(mixed.code).toBe(0);
  });

  it("U-AGUARD-BRIEF-004: HELIX_ALLOW_RAW_AGENT=1 はブリーフ欠落も bypass 警告付きで通す", () => {
    const d = evaluateAgentGuard(
      {
        tool_name: "Agent",
        tool_input: { subagent_type: "pmo-sonnet", model: "sonnet", prompt: "quick" },
      },
      ctx(true),
    );
    expect(d.code).toBe(0);
    expect(d.bypassed).toBe(true);
  });

  it("exposes helix hook agent-guard as a blocking CLI hook", () => {
    const pass = runCliAgentGuard(
      codexSpawn({ agent_type: "explorer", message: "Inspect tests/agent-guard.test.ts" }),
    );
    expect(pass.status).toBe(0);
    expect(pass.stdout).toContain("agent-guard: pass");

    const blocked = runCliAgentGuard(codexSpawn({ message: "No explicit role" }));
    expect(blocked.status).toBe(2);
    expect(blocked.stderr).toContain("BLOCK");

    const empty = runCliAgentGuard("");
    expect(empty.status).toBe(2);
    expect(empty.stderr).toContain("fail-close");
  });
});

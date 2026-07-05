/**
 * HELIX subagent guard.
 *
 * Claude Code Agent calls are controlled fail-closed:
 * 1. Missing subagent_type is blocked.
 * 2. Non-allowlisted subagents are blocked.
 * 3. Missing model is blocked.
 * 4. Calls that override the model family declared in frontmatter are blocked.
 *
 * This module is pure. The hook shim owns stdin and filesystem access.
 */

import {
  AGENT_GUARD_BYPASS_HINT,
  AGENT_TOOL_NAME,
  AGENT_TOOL_NAMES,
  CODEX_AGENT_TYPE_ALLOWLIST,
  CODEX_BULK_SPAWN_AGENT_TOOL_NAME,
  CODEX_SPAWN_AGENT_TOOL_NAME,
  SUBAGENT_ALLOWLIST,
} from "./agent-guard-policy";

export type ModelFamily = "haiku" | "sonnet" | "opus" | "fable";

export { SUBAGENT_ALLOWLIST } from "./agent-guard-policy";

export interface AgentGuardInput {
  tool_name?: string;
  tool_input?: {
    subagent_type?: string;
    agent_type?: string;
    message?: string;
    model?: string;
    items?: Array<{
      type?: string;
      text?: string;
      path?: string;
      name?: string;
    }>;
  } | null;
}

export type ResolvedFamily = ModelFamily | "missing" | "unknown";

export interface AgentGuardContext {
  resolveAgentFamily: (subagentType: string) => ResolvedFamily;
  allowRaw: boolean;
}

export interface GuardDecision {
  code: 0 | 2;
  message?: string;
  bypassed?: boolean;
}

/** Normalize model family names and Anthropic model ids. Ambiguous values fail closed. */
export function normalizeModelFamily(raw: string | null | undefined): ModelFamily | null {
  if (!raw) return null;
  const hits: ModelFamily[] = [];
  if (/\bhaiku\b/i.test(raw)) hits.push("haiku");
  if (/\bsonnet\b/i.test(raw)) hits.push("sonnet");
  if (/\bopus\b/i.test(raw)) hits.push("opus");
  if (/\bfable\b/i.test(raw)) hits.push("fable");
  return hits.length === 1 ? hits[0] : null;
}

const ALLOWLIST_TEXT = [...SUBAGENT_ALLOWLIST].join(" ");
const CODEX_AGENT_TYPE_ALLOWLIST_TEXT = [...CODEX_AGENT_TYPE_ALLOWLIST].join(" ");

function hasCodexTaskBody(input: AgentGuardInput["tool_input"]): boolean {
  if (!input) return false;
  if ((input.message ?? "").trim().length > 0) return true;
  return (input.items ?? []).some((item) => {
    if ((item.text ?? "").trim().length > 0) return true;
    if ((item.path ?? "").trim().length > 0) return true;
    return (item.name ?? "").trim().length > 0;
  });
}

export function evaluateAgentGuard(input: AgentGuardInput, ctx: AgentGuardContext): GuardDecision {
  const blockOrBypass = (message: string): GuardDecision =>
    ctx.allowRaw
      ? {
          code: 0,
          bypassed: true,
          message: `[helix-guard] WARN: HELIX_ALLOW_RAW_AGENT=1 bypassed.\n${message}`,
        }
      : { code: 2, message };

  if (input.tool_name === CODEX_BULK_SPAWN_AGENT_TOOL_NAME) {
    return blockOrBypass(
      `[helix-guard] BLOCK: Codex bulk sub-agent spawn surface is not directly allowed.\n` +
        "Use `helix team run` or a PLAN-owned pair-agent route so each member has explicit ownership and review boundaries.\n" +
        `${AGENT_GUARD_BYPASS_HINT}`,
    );
  }

  if (input.tool_name === CODEX_SPAWN_AGENT_TOOL_NAME) {
    const ti = input.tool_input ?? {};
    const agentType = (ti.agent_type ?? "").trim();
    const model = (ti.model ?? "").trim();

    if (!agentType) {
      return blockOrBypass(
        `[helix-guard] BLOCK: Codex spawn_agent call is missing agent_type.\n` +
          `Allowed agent_type: ${CODEX_AGENT_TYPE_ALLOWLIST_TEXT}\n${AGENT_GUARD_BYPASS_HINT}`,
      );
    }
    if (!CODEX_AGENT_TYPE_ALLOWLIST.has(agentType)) {
      return blockOrBypass(
        `[helix-guard] BLOCK: Codex agent_type=${agentType} is not allowlisted.\n` +
          `Allowed agent_type: ${CODEX_AGENT_TYPE_ALLOWLIST_TEXT}\n` +
          "Route specialized roles through `helix team run` or the pair-agent planner.\n" +
          `${AGENT_GUARD_BYPASS_HINT}`,
      );
    }
    if (!hasCodexTaskBody(ti)) {
      return blockOrBypass(
        `[helix-guard] BLOCK: Codex spawn_agent call is missing a concrete task body.\n` +
          "Provide message/items that define scope, ownership, and expected output.\n" +
          `${AGENT_GUARD_BYPASS_HINT}`,
      );
    }
    if (model) {
      return blockOrBypass(
        `[helix-guard] BLOCK: Codex spawn_agent model override detected.\n` +
          `  agent_type: ${agentType}\n` +
          `  requested model: ${model}\n` +
          "Direct spawn_agent calls must inherit the parent model; explicit model routing belongs in `helix team run` or `helix pair-agent`.\n" +
          `${AGENT_GUARD_BYPASS_HINT}`,
      );
    }
    return { code: 0 };
  }

  if (!input.tool_name || !AGENT_TOOL_NAMES.has(input.tool_name)) return { code: 0 };

  const ti = input.tool_input ?? {};
  const subagentType = (ti.subagent_type ?? "").trim();
  const model = (ti.model ?? "").trim();

  if (!subagentType) {
    return blockOrBypass(
      `[helix-guard] BLOCK: Agent call is missing subagent_type.\nAllowed: ${ALLOWLIST_TEXT}\n${AGENT_GUARD_BYPASS_HINT}`,
    );
  }

  if (!SUBAGENT_ALLOWLIST.has(subagentType)) {
    return blockOrBypass(
      `[helix-guard] BLOCK: subagent_type=${subagentType} is not allowlisted.\n` +
        `Allowed: ${ALLOWLIST_TEXT}\n` +
        `Use an approved subagent or route provider work through helix codex --role ...\n${AGENT_GUARD_BYPASS_HINT}`,
    );
  }

  const family = ctx.resolveAgentFamily(subagentType);
  if (family === "missing") {
    return {
      code: 2,
      message: `[helix-guard] BLOCK: .claude/agents/${subagentType}.md is missing.`,
    };
  }
  if (family === "unknown") {
    return {
      code: 2,
      message: `[helix-guard] BLOCK: ${subagentType} frontmatter does not declare haiku / sonnet / opus model family.`,
    };
  }

  if (!model) {
    return blockOrBypass(
      `[helix-guard] BLOCK: subagent_type=${subagentType} call is missing model.\n` +
        `Use model: "${family}".\n${AGENT_GUARD_BYPASS_HINT}`,
    );
  }

  const requested = normalizeModelFamily(model);
  if (requested === null) {
    return blockOrBypass(
      `[helix-guard] BLOCK: model=${model} cannot be normalized to haiku / sonnet / opus.`,
    );
  }
  if (requested !== family) {
    return blockOrBypass(
      `[helix-guard] BLOCK: model override detected.\n` +
        `  subagent_type: ${subagentType}\n` +
        `  allowed family: ${family}\n` +
        `  requested model: ${model} (family: ${requested})\n${AGENT_GUARD_BYPASS_HINT}`,
    );
  }

  return { code: 0 };
}

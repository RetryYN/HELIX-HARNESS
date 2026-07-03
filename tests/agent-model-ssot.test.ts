import { describe, expect, it } from "vitest";
import { checkAgentModelSsot } from "../src/doctor/index";
import {
  agentModelSsotMessages,
  analyzeAgentModelSsot,
  loadAgentModelEntries,
} from "../src/lint/agent-model-ssot";
import { normalizeModelFamily } from "../src/runtime/agent-guard";
import { SUBAGENT_ALLOWLIST } from "../src/runtime/agent-guard-policy";
import { MODEL_IDS } from "../src/team/model-policy";

describe("U-AGENTMODEL: agent frontmatter model SSoT (PLAN-L7-306)", () => {
  it("U-AGENTMODEL-001: canonical id と日付 snapshot 形は pass、未知 id と欠落は violation", () => {
    const result = analyzeAgentModelSsot([
      { agent: "a", model: MODEL_IDS.claude.sonnet },
      { agent: "b", model: `${MODEL_IDS.claude.haiku}-20251001` },
      { agent: "c", model: "claude-opus-4-7-turbo-x" },
      { agent: "d", model: null },
    ]);
    expect(result.ok).toBe(false);
    expect(result.drifts).toEqual([
      { agent: "c", model: "claude-opus-4-7-turbo-x", reason: "not_in_model_ids" },
      { agent: "d", model: null, reason: "missing_model" },
    ]);
    const messages = agentModelSsotMessages(result);
    expect(messages[0]).toContain("agent-model-ssot - violation");
    expect(messages.join("\n")).toContain("MODEL_IDS");
  });

  it("U-AGENTMODEL-002: 実 repo の .claude/agents 全 frontmatter が MODEL_IDS に解決される (real-repo regression)", () => {
    const entries = loadAgentModelEntries(process.cwd());
    expect(entries.length).toBeGreaterThan(0);
    const result = analyzeAgentModelSsot(entries);
    expect(result.drifts).toEqual([]);
    expect(result.ok).toBe(true);

    const check = checkAgentModelSsot(process.cwd());
    expect(check.ok).toBe(true);
    expect(check.messages[0]).toContain("agent-model-ssot - OK");
  });

  it("U-AGENTMODEL-003: advisor-fable は allowlist に載り、fable family が guard で解決される", () => {
    expect(SUBAGENT_ALLOWLIST.has("advisor-fable")).toBe(true);
    expect(normalizeModelFamily(MODEL_IDS.claude.fable)).toBe("fable");
    expect(normalizeModelFamily("fable")).toBe("fable");
    // 複数 family 語が混在する曖昧値は従来どおり fail-close。
    expect(normalizeModelFamily("fable-sonnet-mix")).toBeNull();
  });
});

import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parse as parseYaml } from "yaml";
import {
  authorityInitialDigest,
  authorityTombstoneDigest,
  checkPlanSpecificVpairBindings,
  PLAN_SPECIFIC_VPAIR_TERMINAL_DIGEST,
  type PlanSpecificVpairAuthority,
} from "../src/lint/plan-specific-vpair-binding";
import { FABLE_APEX_SUBAGENTS, SUBAGENT_ALLOWLIST } from "../src/runtime/agent-guard-policy";
import { CLAUDE_PRICING } from "../src/state-db/token-tracker";
import { TIER_TABLE } from "../src/task/tier-router";
import { MODEL_IDS, selectTeamModel } from "../src/team/model-policy";

// PLAN-L7-309-fe-roster-orchestration
// PLAN-L7-424-fe-roster-vpair-resolution
const read = (path: string) => readFileSync(path, "utf8");
const frontmatter = (path: string): Record<string, unknown> => {
  const match = read(path).match(/^---\n([\s\S]*?)\n---/);
  expect(match).not.toBeNull();
  return parseYaml(match?.[1] ?? "") as Record<string, unknown>;
};

describe("FE roster orchestration", () => {
  it("U-FEROSTER-001: Opus lead・Sonnet worker・Fable advisory-only境界を固定する", () => {
    const lead = frontmatter(".claude/agents/fe-lead.md");
    const worker = frontmatter(".claude/agents/fe-ui.md");
    const advisor = frontmatter(".claude/agents/advisor-fable.md");
    const shared = read(".claude/CLAUDE.md");

    expect(lead.name).toBe("fe-lead");
    expect(lead.model).toBe(MODEL_IDS.claude.opus);
    expect(worker.name).toBe("fe-ui");
    expect(worker.model).toBe(MODEL_IDS.claude.sonnet);
    expect(SUBAGENT_ALLOWLIST.has("fe-lead")).toBe(true);
    expect(SUBAGENT_ALLOWLIST.has("fe-ui")).toBe(true);
    expect([...FABLE_APEX_SUBAGENTS]).toEqual(["advisor-fable"]);
    expect(advisor.name).toBe("advisor-fable");
    expect(String(advisor.description)).toContain("advisory-only");
    expect(String(advisor.tools)).not.toMatch(/\b(?:Edit|Write)\b/);
    const sharedAllowlist =
      shared.match(/Allowlist（正本[\s\S]*?\n([\s\S]*?)\n### Fable advisor/)?.[1] ?? "";
    expect(sharedAllowlist).toMatch(/^- `fe-lead`$/m);
    expect(sharedAllowlist).toMatch(/^- `fe-ui`$/m);
    expect(shared).toMatch(/Fable 経由で\s*実装しない/);
  });

  it("U-FEROSTER-002: Sonnet現行世代をagent/team/pricingの単一解決へ固定する", () => {
    const sonnetAgents = readdirSync(".claude/agents")
      .filter((name) => name.endsWith(".md"))
      .map((name) => frontmatter(`.claude/agents/${name}`))
      .filter((agent) => String(agent.model).includes("sonnet"));
    const selected = selectTeamModel({
      provider: "claude",
      role: "fe-ui",
      engine: "sonnet",
      task: "implement frontend worker component",
      difficulty: "standard",
    });

    expect(MODEL_IDS.claude.sonnet).toBe("claude-sonnet-5");
    expect(TIER_TABLE.T1.claude).toBe(MODEL_IDS.claude.sonnet);
    expect(selected.model).toBe(MODEL_IDS.claude.sonnet);
    expect(sonnetAgents.length).toBeGreaterThan(0);
    for (const agent of sonnetAgents) expect(agent.model).toBe(MODEL_IDS.claude.sonnet);
    expect(CLAUDE_PRICING[MODEL_IDS.claude.sonnet]).toEqual({ input: 3, output: 15 });
    expect(CLAUDE_PRICING["claude-sonnet-4-6"]).toEqual({ input: 3, output: 15 });
    expect(TIER_TABLE.T1.claude).not.toBe("claude-sonnet-4-6");
  });

  it("U-FEROSTER-003: PLAN固有Vペアのauthority解消をresolution PLANへ結合する", () => {
    const authority = JSON.parse(
      read("config/plan-specific-vpair-binding-authority.json"),
    ) as PlanSpecificVpairAuthority;
    const fingerprint = "sha256:0643481c277923a4d2bb0752c30415d4cf87835a8eeb65b2713ed125fafca068";
    expect(authority.initialAuthority).toHaveLength(286);
    expect(authorityInitialDigest(authority.initialAuthority)).toBe(
      "sha256:72513d28aad7493ec3622480118566f1dad9dcafc0ce8f0df95a62d17d0230b1",
    );
    expect(authority.resolvedTombstones).toHaveLength(1);
    const tombstone = authority.resolvedTombstones[0];
    expect(tombstone?.fingerprint).toBe(fingerprint);
    expect(tombstone?.resolution_plan_id).toBe("PLAN-L7-424-fe-roster-vpair-resolution");
    expect(tombstone?.entry_digest).toBe(
      tombstone ? authorityTombstoneDigest(tombstone.previous_digest, tombstone) : "",
    );
    expect(tombstone?.entry_digest).toBe(PLAN_SPECIFIC_VPAIR_TERMINAL_DIGEST);
    const checked = checkPlanSpecificVpairBindings(process.cwd());
    expect(checked.ok, checked.messages.join("\n")).toBe(true);
    expect(checked.result?.exempted).toHaveLength(285);
    expect(checked.result?.exempted.some((finding) => finding.fingerprint === fingerprint)).toBe(
      false,
    );
  });
});

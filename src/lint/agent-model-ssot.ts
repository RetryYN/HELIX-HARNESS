import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * agent-model-ssot (PLAN-L7-306)。
 *
 * `.claude/agents/*.md` frontmatter の `model:` は静的 Markdown に literal で埋まるため、
 * モデル世代更新のたびに `MODEL_IDS` (src/team/model-policy.ts、モデル ID の単一正本) から
 * silent に陳腐化する (agent-guard は family 語しか見ないため乖離しても止まらない)。
 * 本 lint は各 agent の `model:` 値が正本 ID (exact) か、その日付 snapshot 形
 * (`<id>-<digits>`、例 claude-haiku-4-5-20251001) に解決できることを fail-close 検査する。
 * Codex 系 ID は現行 roster に存在しないため対象外 (存在した場合も正本照合する)。
 */

export interface AgentModelDrift {
  agent: string;
  model: string | null;
  reason: "missing_model" | "not_in_model_ids";
}

export interface AgentModelSsotResult {
  checked: number;
  canonicalIds: string[];
  drifts: AgentModelDrift[];
  ok: boolean;
}

export interface AgentModelEntry {
  agent: string;
  model: string | null;
}

export function loadCanonicalModelIds(repoRoot: string = process.cwd()): string[] {
  const source = readFileSync(join(repoRoot, "src", "team", "model-policy.ts"), "utf8");
  return [...source.matchAll(/:\s*"([^"]+)"/g)]
    .map((match) => match[1])
    .filter((value) => /^(?:claude|gpt)-/.test(value))
    .sort();
}

function matchesCanonical(model: string, canonical: string[]): boolean {
  return canonical.some(
    (id) => model === id || new RegExp(`^${id.replace(/[.\\]/g, "\\$&")}-\\d+$`).test(model),
  );
}

export function analyzeAgentModelSsot(
  entries: AgentModelEntry[],
  canonicalIds: string[] = loadCanonicalModelIds(),
): AgentModelSsotResult {
  const canonical = [...canonicalIds].sort();
  const drifts: AgentModelDrift[] = [];
  for (const entry of entries) {
    if (!entry.model) {
      drifts.push({ agent: entry.agent, model: null, reason: "missing_model" });
      continue;
    }
    if (!matchesCanonical(entry.model, canonical)) {
      drifts.push({ agent: entry.agent, model: entry.model, reason: "not_in_model_ids" });
    }
  }
  return {
    checked: entries.length,
    canonicalIds: canonical,
    drifts,
    ok: entries.length > 0 && drifts.length === 0,
  };
}

export function loadAgentModelEntries(repoRoot: string): AgentModelEntry[] {
  const dir = join(repoRoot, ".claude", "agents");
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((name) => name.endsWith(".md"))
    .sort()
    .map((name) => {
      const content = readFileSync(join(dir, name), "utf8");
      const match = content.match(/^model:\s*(\S+)\s*$/m);
      return { agent: name.replace(/\.md$/, ""), model: match?.[1] ?? null };
    });
}

export function agentModelSsotMessages(result: AgentModelSsotResult): string[] {
  if (result.ok) {
    return [`agent-model-ssot - OK (agents=${result.checked}, model drift=0)`];
  }
  const messages = [`agent-model-ssot - violation: model drift=${result.drifts.length}`];
  for (const drift of result.drifts) {
    messages.push(
      drift.reason === "missing_model"
        ? `agent ${drift.agent}: frontmatter model がない`
        : `agent ${drift.agent}: model=${drift.model} は MODEL_IDS (src/team/model-policy.ts) に解決できない`,
    );
  }
  return messages;
}

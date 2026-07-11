import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { basename, join } from "node:path";
import type { RunUsage } from "../state-db/token-tracker";
import { loadRuntimeSessionUsage, summarizeRunUsage } from "../state-db/token-tracker";

export const AGENT_OBSERVABILITY_PROVENANCE_SCHEMA_VERSION = "agent-observability-provenance.v1";

export type TranscriptRuntime = "claude" | "codex";
export type TranscriptRedactionPolicy = "metadata-only" | "secret-redacted" | "blocked-sensitive";

export interface TranscriptIndexRow {
  session_id: string;
  runtime: TranscriptRuntime;
  evidence_path: string;
  event_count: number;
  command_digest_count: number;
  token_run_count: number;
  cost_usd: number | null;
  redaction_policy: TranscriptRedactionPolicy;
}

export interface CommandDigestRow {
  session_id: string;
  runtime: TranscriptRuntime;
  evidence_path: string;
  command_digest: string;
}

export interface DiffAttributionHint {
  commit_hash: string;
  agent_session_id: string;
  evidence_path: string;
  truth_claim: false;
  note: string;
}

export interface AgentObservabilityProvenanceReport {
  schema_version: typeof AGENT_OBSERVABILITY_PROVENANCE_SCHEMA_VERSION;
  ok: boolean;
  transcript_index: TranscriptIndexRow[];
  command_digests: CommandDigestRow[];
  usage_summary: ReturnType<typeof summarizeRunUsage>;
  diff_attribution: DiffAttributionHint[];
  findings: Array<{ code: string; severity: "warning" | "error"; detail: string }>;
  source_command: string;
  read_only: true;
}

const SECRET_LIKE_RE =
  /\b[A-Za-z0-9_-]*(?:token|api[_-]?key|secret|password|passwd|pwd|bearer)[A-Za-z0-9_-]*\s*[=:]\s*\S+/i;

function sha256(value: string): string {
  return `sha256:${createHash("sha256").update(value).digest("hex")}`;
}

function safeJson(line: string): unknown | null {
  const trimmed = line.trim();
  if (!trimmed) return null;
  try {
    return JSON.parse(trimmed) as unknown;
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function listJsonl(dir: string): string[] {
  const out: string[] = [];
  const walk = (current: string): void => {
    if (!existsSync(current)) return;
    let entries: string[] = [];
    try {
      entries = readdirSync(current);
    } catch {
      return;
    }
    for (const entry of entries) {
      const path = join(current, entry);
      try {
        if (statSync(path).isDirectory()) walk(path);
        else if (entry.endsWith(".jsonl")) out.push(path);
      } catch {
        // Ignore unreadable entries; report remains cold-start safe.
      }
    }
  };
  walk(dir);
  return out.sort();
}

function sessionIdFor(path: string): string {
  return basename(path).replace(/\.jsonl$/i, "");
}

function collectCommandStrings(value: unknown, out: string[]): void {
  if (Array.isArray(value)) {
    for (const item of value) collectCommandStrings(item, out);
    return;
  }
  if (!isRecord(value)) return;
  for (const [key, nested] of Object.entries(value)) {
    if (
      typeof nested === "string" &&
      /^(cmd|command|shell_command|raw_command)$/i.test(key) &&
      nested.trim().length > 0
    ) {
      out.push(nested);
    } else {
      collectCommandStrings(nested, out);
    }
  }
}

function usageBySession(usages: RunUsage[]): Map<string, RunUsage[]> {
  const map = new Map<string, RunUsage[]>();
  for (const usage of usages) {
    const key = usage.sessionId || "";
    const rows = map.get(key) ?? [];
    rows.push(usage);
    map.set(key, rows);
  }
  return map;
}

function usageRowsFor(
  usageMap: Map<string, RunUsage[]>,
  evidencePath: string,
  sessionId: string,
): RunUsage[] {
  return usageMap.get(evidencePath) ?? usageMap.get(sessionId) ?? [];
}

export function buildAgentObservabilityProvenanceReport(options: {
  repoRoot: string;
  claudeDirs?: string[];
  codexDirs?: string[];
  commitHash?: string;
  sourceCommand?: string;
}): AgentObservabilityProvenanceReport {
  const claudeDirs = options.claudeDirs ?? [];
  const codexDirs = options.codexDirs ?? [];
  const usages = loadRuntimeSessionUsage({ claudeDirs, codexDirs });
  const usageMap = usageBySession(usages);
  const transcriptIndex: TranscriptIndexRow[] = [];
  const commandDigests: CommandDigestRow[] = [];
  const findings: AgentObservabilityProvenanceReport["findings"] = [];

  for (const runtime of ["claude", "codex"] as const) {
    const dirs = runtime === "claude" ? claudeDirs : codexDirs;
    for (const file of dirs.flatMap(listJsonl)) {
      let content = "";
      try {
        content = readFileSync(file, "utf8");
      } catch {
        findings.push({
          code: "transcript_unreadable",
          severity: "warning",
          detail: `${runtime} transcript could not be read: ${file}`,
        });
        continue;
      }
      const hasSecretLike = SECRET_LIKE_RE.test(content);
      if (hasSecretLike) {
        findings.push({
          code: "transcript_secret_like_material_blocked",
          severity: "error",
          detail: `${runtime} transcript index blocked raw content from ${file}`,
        });
      }
      const sessionId = sessionIdFor(file);
      const commands: string[] = [];
      let eventCount = 0;
      for (const line of content.split(/\r?\n/)) {
        const parsed = safeJson(line);
        if (!parsed) continue;
        eventCount += 1;
        collectCommandStrings(parsed, commands);
      }
      for (const command of commands) {
        if (SECRET_LIKE_RE.test(command)) {
          findings.push({
            code: "command_digest_secret_like_material_blocked",
            severity: "error",
            detail: `${runtime} command digest refused secret-like command from ${file}`,
          });
          continue;
        }
        commandDigests.push({
          session_id: sessionId,
          runtime,
          evidence_path: file,
          command_digest: sha256(command),
        });
      }
      const sessionUsages = usageRowsFor(usageMap, file, sessionId);
      const costValues = sessionUsages
        .map((usage) => usage.costUsd)
        .filter((cost): cost is number => typeof cost === "number");
      transcriptIndex.push({
        session_id: sessionId,
        runtime,
        evidence_path: file,
        event_count: eventCount,
        command_digest_count: commands.length,
        token_run_count: sessionUsages.length,
        cost_usd:
          costValues.length === 0
            ? null
            : Number(costValues.reduce((sum, cost) => sum + cost, 0).toFixed(6)),
        redaction_policy: hasSecretLike ? "blocked-sensitive" : "metadata-only",
      });
    }
  }

  const commitHash = options.commitHash ?? "unknown";
  const diffAttribution = transcriptIndex.map((row) => ({
    commit_hash: commitHash,
    agent_session_id: row.session_id,
    evidence_path: row.evidence_path,
    truth_claim: false as const,
    note: "provenance hint only; not a behavioral truth claim",
  }));

  return {
    schema_version: AGENT_OBSERVABILITY_PROVENANCE_SCHEMA_VERSION,
    ok: !findings.some((finding) => finding.severity === "error"),
    transcript_index: transcriptIndex,
    command_digests: commandDigests,
    usage_summary: summarizeRunUsage(usages),
    diff_attribution: diffAttribution,
    findings,
    source_command: options.sourceCommand ?? "helix telemetry sessions --json",
    read_only: true,
  };
}

import type { HarnessDb } from "../state-db/index";

export const SKILL_MEMORY_HYGIENE_SCHEMA_VERSION = "skill-memory-hygiene.v1";

export interface SkillHygieneTelemetryRow {
  plan_id: string;
  skill_id: string;
  recommendations: number;
  invocations: number;
  accepted: number;
}

export interface SkillQuarantinePlan {
  skill_id: string;
  plan_id: string;
  action: "quarantine";
  delete: false;
  reason: string;
  rollback_path: string;
}

export interface SkillImprovementCandidate {
  skill_id: string;
  plan_id: string;
  allowed: boolean;
  reason: string;
  required_evidence: string[];
}

export interface MemoryRetentionPolicy {
  provenance_preserved: true;
  correction_chain_preserved: true;
  active_forgetting_requires_evidence: true;
  compaction_evidence_path: string;
}

export interface SkillMemoryHygieneReport {
  schema_version: typeof SKILL_MEMORY_HYGIENE_SCHEMA_VERSION;
  ok: boolean;
  dry_run: true;
  skill_telemetry: Array<
    SkillHygieneTelemetryRow & { firing_rate: number; acceptance_rate: number }
  >;
  quarantine_plan: SkillQuarantinePlan[];
  improvement_candidates: SkillImprovementCandidate[];
  memory_retention: MemoryRetentionPolicy;
  rule_improvement_policy: {
    allowed_sources: string[];
    auto_rewrite_without_evidence: false;
  };
  findings: Array<{ code: string; severity: "warning" | "error"; detail: string }>;
  source_command: string;
}

function rate(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : Number((numerator / denominator).toFixed(4));
}

function normalizeRows(rows: SkillHygieneTelemetryRow[]) {
  return rows
    .map((row) => ({
      ...row,
      firing_rate: rate(row.invocations, row.recommendations),
      acceptance_rate: rate(row.accepted, row.invocations),
    }))
    .sort((a, b) => a.plan_id.localeCompare(b.plan_id) || a.skill_id.localeCompare(b.skill_id));
}

export function buildSkillMemoryHygieneReport(
  rows: SkillHygieneTelemetryRow[],
  options: { sourceCommand?: string; compactionEvidencePath?: string } = {},
): SkillMemoryHygieneReport {
  const skillTelemetry = normalizeRows(rows);
  const quarantinePlan = skillTelemetry
    .filter((row) => row.recommendations > 0 && row.invocations === 0)
    .map((row) => ({
      skill_id: row.skill_id,
      plan_id: row.plan_id,
      action: "quarantine" as const,
      delete: false as const,
      reason: "recommended-but-unused",
      rollback_path: `docs/skills/${row.skill_id}.md`,
    }));
  const improvementCandidates = skillTelemetry
    .filter((row) => row.invocations > 0 && row.acceptance_rate < 1)
    .map((row) => ({
      skill_id: row.skill_id,
      plan_id: row.plan_id,
      allowed: false,
      reason: "before/after evaluation evidence is required before skill or AGENTS rule change",
      required_evidence: [
        "before_skill_evaluation",
        "after_skill_evaluation",
        "verified_failure_or_po_directive",
      ],
    }));

  return {
    schema_version: SKILL_MEMORY_HYGIENE_SCHEMA_VERSION,
    ok: true,
    dry_run: true,
    skill_telemetry: skillTelemetry,
    quarantine_plan: quarantinePlan,
    improvement_candidates: improvementCandidates,
    memory_retention: {
      provenance_preserved: true,
      correction_chain_preserved: true,
      active_forgetting_requires_evidence: true,
      compaction_evidence_path:
        options.compactionEvidencePath ?? ".helix/logs/memory-compaction.jsonl",
    },
    rule_improvement_policy: {
      allowed_sources: ["po_directive", "verified_failure"],
      auto_rewrite_without_evidence: false,
    },
    findings: quarantinePlan.map((plan) => ({
      code: "skill_quarantine_candidate",
      severity: "warning" as const,
      detail: `${plan.skill_id} is unused in ${plan.plan_id}; dry-run quarantine only`,
    })),
    source_command: options.sourceCommand ?? "helix skill hygiene --dry-run --json",
  };
}

export function loadSkillHygieneTelemetryFromDb(db: HarnessDb): SkillHygieneTelemetryRow[] {
  const recommendations = db.prepare("SELECT plan_id, skill_id FROM skill_recommendations").all();
  const invocations = db.prepare("SELECT plan_id, skill_id, accepted FROM skill_invocations").all();
  const groups = new Map<string, SkillHygieneTelemetryRow>();
  const ensure = (planId: string, skillId: string): SkillHygieneTelemetryRow => {
    const key = `${planId}:${skillId}`;
    const existing = groups.get(key);
    if (existing) return existing;
    const created = {
      plan_id: planId,
      skill_id: skillId,
      recommendations: 0,
      invocations: 0,
      accepted: 0,
    };
    groups.set(key, created);
    return created;
  };
  for (const row of recommendations) {
    const planId = String(row.plan_id ?? "");
    const skillId = String(row.skill_id ?? "");
    if (!planId || !skillId) continue;
    ensure(planId, skillId).recommendations += 1;
  }
  for (const row of invocations) {
    const planId = String(row.plan_id ?? "");
    const skillId = String(row.skill_id ?? "");
    if (!planId || !skillId) continue;
    const group = ensure(planId, skillId);
    group.invocations += 1;
    if (row.accepted === 1 || row.accepted === true || row.accepted === "1") group.accepted += 1;
  }
  return [...groups.values()];
}

import type { HarnessDb } from "./index";

/**
 * リバース駆動の発火漏れを塞ぐ導出 (PLAN-L7-353)。
 * DB の赤 (artifact_progress red) と warn findings のうち、対応 PLAN が
 * 紐付いていないものを Reverse workflow (`reverse <type> R0`) の起票候補として返す。
 * 導出のみで書込みは行わない (query-only)。
 */

export type ReverseCandidateSource = "artifact_progress_red" | "finding_warn";

export interface ReverseCandidate {
  source: ReverseCandidateSource;
  subject: string;
  artifactType: string;
  reverseType: string;
  reason: string;
  /** Reverse workflow の入口 (R0) 起票を促す deterministic な誘導文。 */
  suggestedRoute: string;
}

/** artifact_type -> reverse <type> の割当。正本 = 本 map (PLAN-L6-59 §2)。 */
export const REVERSE_TYPE_BY_ARTIFACT: Record<string, string> = {
  design: "design",
  "test-design": "test-design",
  plan: "plan",
  requirement: "requirement",
  source: "impl",
  test: "test",
};

const FINDING_REVERSE_TYPES: Record<string, string> = {
  "missing-test-coverage": "test",
  "missing-test-plan-id": "test",
};

function suggestedRouteFor(reverseType: string, subject: string): string {
  return `start reverse ${reverseType} R0 for ${subject} (起票: docs/plans に reverse PLAN、route_mode=reverse)`;
}

export function collectReverseCandidates(db: HarnessDb): ReverseCandidate[] {
  const candidates: ReverseCandidate[] = [];
  for (const row of db
    .prepare(
      `SELECT artifact_path, artifact_type, reason, recovery_plan_ids
       FROM artifact_progress
       WHERE color = 'red'
       ORDER BY artifact_path`,
    )
    .all()) {
    const recovery = String(row.recovery_plan_ids ?? "").trim();
    if (recovery) continue; // 既に recovery PLAN が紐付いていれば候補にしない
    const artifactType = String(row.artifact_type ?? "");
    const reverseType = REVERSE_TYPE_BY_ARTIFACT[artifactType] ?? "impl";
    const subject = String(row.artifact_path ?? "");
    candidates.push({
      source: "artifact_progress_red",
      subject,
      artifactType,
      reverseType,
      reason: String(row.reason ?? ""),
      suggestedRoute: suggestedRouteFor(reverseType, subject),
    });
  }
  for (const row of db
    .prepare(
      `SELECT finding_id, kind, subject_id, evidence_path
       FROM findings
       WHERE status = 'open' AND severity = 'warn'
       ORDER BY finding_id`,
    )
    .all()) {
    const kind = String(row.kind ?? "");
    const reverseType = FINDING_REVERSE_TYPES[kind] ?? "impl";
    const subject = String(row.subject_id ?? row.finding_id ?? "");
    candidates.push({
      source: "finding_warn",
      subject,
      artifactType: "finding",
      reverseType,
      reason: kind,
      suggestedRoute: suggestedRouteFor(reverseType, subject),
    });
  }
  return candidates;
}

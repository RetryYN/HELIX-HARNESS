export const SKILL_EFFICACY_EVALUATION_SCHEMA_VERSION = "skill-efficacy-evaluation.v1";

export interface SkillEvalEvidence {
  artifact_path: string;
  command_digest: string;
  reproducible: boolean;
  grade: number;
}

export interface SkillEfficacyEvalInput {
  skill_id: string;
  eval_id: string;
  with_skill?: SkillEvalEvidence | null;
  without_skill?: SkillEvalEvidence | null;
  regression?: boolean;
}

export interface SkillEfficacyEvaluationRow {
  skill_id: string;
  eval_id: string;
  promotion_allowed: boolean;
  quarantine_candidate: boolean;
  grade_delta: number | null;
  evidence_complete: boolean;
  grading: Array<{ artifact_path: string; command_digest: string; reproducible: boolean }>;
}

export interface SkillEfficacyEvaluationReport {
  schema_version: typeof SKILL_EFFICACY_EVALUATION_SCHEMA_VERSION;
  ok: boolean;
  dry_run: true;
  evaluations: SkillEfficacyEvaluationRow[];
  promotion_allowed_count: number;
  quarantine_candidates: string[];
  findings: Array<{ code: string; severity: "warning" | "error"; detail: string }>;
  source_command: string;
}

function validEvidence(
  evidence: SkillEvalEvidence | null | undefined,
): evidence is SkillEvalEvidence {
  return (
    evidence != null &&
    evidence.artifact_path.trim().length > 0 &&
    /^sha256:[a-f0-9]{16,}$/i.test(evidence.command_digest) &&
    evidence.reproducible
  );
}

export function buildSkillEfficacyEvaluationReport(
  evaluations: SkillEfficacyEvalInput[],
  options: { sourceCommand?: string } = {},
): SkillEfficacyEvaluationReport {
  const findings: SkillEfficacyEvaluationReport["findings"] = [];
  const rows = evaluations.map((evaluation) => {
    const withOk = validEvidence(evaluation.with_skill);
    const withoutOk = validEvidence(evaluation.without_skill);
    const evidenceComplete = withOk && withoutOk;
    const withSkill = withOk ? evaluation.with_skill : null;
    const withoutSkill = withoutOk ? evaluation.without_skill : null;
    const gradeDelta =
      withSkill && withoutSkill ? Number((withSkill.grade - withoutSkill.grade).toFixed(4)) : null;
    const quarantineCandidate =
      evaluation.regression === true || (gradeDelta != null && gradeDelta < 0);
    const promotionAllowed = evidenceComplete && !quarantineCandidate && (gradeDelta ?? 0) > 0;
    if (!evidenceComplete) {
      findings.push({
        code: "skill_promotion_requires_reproducible_eval",
        severity: "error",
        detail: `${evaluation.skill_id} requires with-skill and without-skill reproducible evidence`,
      });
    }
    if (quarantineCandidate) {
      findings.push({
        code: "skill_regression_quarantine_candidate",
        severity: "warning",
        detail: `${evaluation.skill_id} regressed in ${evaluation.eval_id}; quarantine candidate`,
      });
    }
    return {
      skill_id: evaluation.skill_id,
      eval_id: evaluation.eval_id,
      promotion_allowed: promotionAllowed,
      quarantine_candidate: quarantineCandidate,
      grade_delta: gradeDelta,
      evidence_complete: evidenceComplete,
      grading: [evaluation.with_skill, evaluation.without_skill]
        .filter((item): item is SkillEvalEvidence => item != null)
        .map((item) => ({
          artifact_path: item.artifact_path,
          command_digest: item.command_digest,
          reproducible: item.reproducible,
        })),
    };
  });

  return {
    schema_version: SKILL_EFFICACY_EVALUATION_SCHEMA_VERSION,
    ok: !findings.some((finding) => finding.severity === "error"),
    dry_run: true,
    evaluations: rows,
    promotion_allowed_count: rows.filter((row) => row.promotion_allowed).length,
    quarantine_candidates: rows
      .filter((row) => row.quarantine_candidate)
      .map((row) => row.skill_id)
      .sort(),
    findings,
    source_command: options.sourceCommand ?? "helix skill efficacy --dry-run --json",
  };
}

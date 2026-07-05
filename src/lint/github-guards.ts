export interface CommitlintFinding {
  code: "non_conventional_subject";
  severity: "error";
  subject: string;
  message: string;
}

export interface CommitlintResult {
  ok: boolean;
  subjectCount: number;
  findings: CommitlintFinding[];
}

export interface PrContextInput {
  eventName?: string;
  headBranch?: string;
  baseBranch?: string;
  body?: string;
}

export interface PrContextFinding {
  code: "poc_main_direct_merge" | "hotfix_postmortem_missing" | "hotfix_recovery_plan_missing";
  severity: "error";
  message: string;
}

export interface PrContextResult {
  ok: boolean;
  eventName: string;
  headBranch: string;
  baseBranch: string;
  findings: PrContextFinding[];
}

const CONVENTIONAL_COMMIT_PATTERN =
  /^(feat|fix|docs|style|refactor|test|chore|perf|ci|build|revert)(\([A-Za-z0-9._-]+\))?: .+/;

export function analyzeCommitSubjects(subjects: string[]): CommitlintResult {
  const normalizedSubjects = subjects.map((subject) => subject.trim()).filter(Boolean);
  const findings = normalizedSubjects
    .filter((subject) => !CONVENTIONAL_COMMIT_PATTERN.test(subject))
    .map((subject): CommitlintFinding => {
      return {
        code: "non_conventional_subject",
        severity: "error",
        subject,
        message: `non-conventional commit subject: ${subject}`,
      };
    });
  return {
    ok: findings.length === 0,
    subjectCount: normalizedSubjects.length,
    findings,
  };
}

export function commitlintMessages(result: CommitlintResult): string[] {
  if (result.ok) {
    return [`commitlint - OK (subjects=${result.subjectCount})`];
  }
  return [
    `commitlint - violation: errors=${result.findings.length}, subjects=${result.subjectCount}`,
    ...result.findings.map((finding) => `commitlint - block ${finding.code}: ${finding.message}`),
  ];
}

export function analyzePrContext(input: PrContextInput): PrContextResult {
  const eventName = input.eventName ?? "";
  const headBranch = input.headBranch ?? "";
  const baseBranch = input.baseBranch ?? "";
  const body = input.body ?? "";
  const findings: PrContextFinding[] = [];

  if (eventName !== "pull_request") {
    return { ok: true, eventName, headBranch, baseBranch, findings };
  }

  if (headBranch.startsWith("poc/") && baseBranch === "main") {
    findings.push({
      code: "poc_main_direct_merge",
      severity: "error",
      message:
        "poc/* branches must pass S4 and re-enter through reverse/* or feature/* before main",
    });
  }

  if (headBranch.startsWith("hotfix/") && baseBranch === "main") {
    if (!/(^|\n)##[ \t]+Postmortem\b/.test(body)) {
      findings.push({
        code: "hotfix_postmortem_missing",
        severity: "error",
        message: "hotfix/* PR requires a ## Postmortem section",
      });
    }
    if (!/(PLAN-|recovery)/.test(body)) {
      findings.push({
        code: "hotfix_recovery_plan_missing",
        severity: "error",
        message: "hotfix/* PR requires recovery PLAN evidence",
      });
    }
  }

  return {
    ok: findings.length === 0,
    eventName,
    headBranch,
    baseBranch,
    findings,
  };
}

export function prContextGuardMessages(result: PrContextResult): string[] {
  if (result.ok) {
    return [
      `pr-context-guard - OK (event=${result.eventName || "-"}, head=${result.headBranch || "-"}, base=${result.baseBranch || "-"})`,
    ];
  }
  return [
    `pr-context-guard - violation: errors=${result.findings.length}`,
    ...result.findings.map(
      (finding) => `pr-context-guard - block ${finding.code}: ${finding.message}`,
    ),
  ];
}

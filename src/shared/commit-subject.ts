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

const CONVENTIONAL_COMMIT_PATTERN =
  /^(feat|fix|docs|style|refactor|test|chore|perf|ci|build|revert)(\([A-Za-z0-9._-]+\))?: .+/;

// Gitが生成するmerge／revert subjectはupstream commitlintと同じく対象外とする。
const GENERATED_SUBJECT_IGNORES = [/^Merge /, /^Revert "/];

export function analyzeCommitSubjects(subjects: string[]): CommitlintResult {
  const normalizedSubjects = subjects.map((subject) => subject.trim()).filter(Boolean);
  const findings = normalizedSubjects
    .filter((subject) => !GENERATED_SUBJECT_IGNORES.some((pattern) => pattern.test(subject)))
    .filter((subject) => !CONVENTIONAL_COMMIT_PATTERN.test(subject))
    .map(
      (subject): CommitlintFinding => ({
        code: "non_conventional_subject",
        severity: "error",
        subject,
        message: `non-conventional commit subject: ${subject}`,
      }),
    );
  return { ok: findings.length === 0, subjectCount: normalizedSubjects.length, findings };
}

export function commitlintMessages(result: CommitlintResult): string[] {
  if (result.ok) return [`commitlint - OK (subjects=${result.subjectCount})`];
  return [
    `commitlint - violation: errors=${result.findings.length}, subjects=${result.subjectCount}`,
    ...result.findings.map((finding) => `commitlint - block ${finding.code}: ${finding.message}`),
  ];
}

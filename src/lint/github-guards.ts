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
  code:
    | "poc_main_direct_merge"
    | "hotfix_postmortem_missing"
    | "hotfix_recovery_plan_missing"
    | "issue_closure_outcome_missing"
    | "issue_closure_receipt_missing"
    | "issue_closure_children_missing"
    | "issue_closure_decision_receipt_missing"
    | "issue_closure_po_decision_missing";
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

// PR ベース自走運用 (PLAN-L7-418) では git 既定 subject の merge / revert commit が正常な産物として
// 履歴に入る。upstream commitlint の既定 ignores と同じく機械生成 subject は検査対象から除外する
// (push 済み履歴は書き換え禁止のため、gate 側が git の実挙動へ追随する)。
const GENERATED_SUBJECT_IGNORES = [/^Merge /, /^Revert "/];
const ISSUE_CLOSING_REFERENCE = /(^|\n)Closes[ \t]+#\d+\b/i;
const ISSUE_CLOSURE_OUTCOME =
  /(^|\n)[ \t]*(?:[-*][ \t]*)?(?:Issue closure outcome|Outcome):[ \t]*(resolved|rejected|quarantined|superseded|cancelled)[ \t]*(?:\n|$)/i;

function fieldValue(body: string, field: string): string | undefined {
  const escaped = field.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return body
    .match(new RegExp(`(?:^|\\n)[ \\t]*(?:[-*][ \\t]*)?${escaped}:[ \\t]*(\\S.*)`, "i"))?.[1]
    ?.trim();
}

function closureReceiptPresent(body: string): boolean {
  const value = fieldValue(body, "Closure receipt") ?? "";
  return (
    /\bPLAN-[A-Z0-9-]+\b/.test(value) &&
    /\b[0-9a-f]{7,40}\b/i.test(value) &&
    /\b(?:test|CI|harness-check)\b/i.test(value) &&
    /\breview\b/i.test(value)
  );
}

function childDispositionPresent(body: string): boolean {
  return /(^|\n)[ \t]*(?:[-*][ \t]*)?Child Issues:[ \t]*(?:none|#\d+[ \t]+(?:resolved|deferred|split|superseded|cancelled)(?:[ \t]*[,;][ \t]*#\d+[ \t]+(?:resolved|deferred|split|superseded|cancelled))*)[ \t]*(?:\n|$)/i.test(
    body,
  );
}

export function analyzeCommitSubjects(subjects: string[]): CommitlintResult {
  const normalizedSubjects = subjects.map((subject) => subject.trim()).filter(Boolean);
  const findings = normalizedSubjects
    .filter((subject) => !GENERATED_SUBJECT_IGNORES.some((pattern) => pattern.test(subject)))
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

  if (ISSUE_CLOSING_REFERENCE.test(body)) {
    const outcome = body.match(ISSUE_CLOSURE_OUTCOME)?.[2]?.toLowerCase();
    if (!outcome) {
      findings.push({
        code: "issue_closure_outcome_missing",
        severity: "error",
        message:
          "Issue-closing PR requires Outcome: resolved|rejected|quarantined|superseded|cancelled",
      });
    }
    if (!closureReceiptPresent(body)) {
      findings.push({
        code: "issue_closure_receipt_missing",
        severity: "error",
        message:
          "Issue-closing PR requires Closure receipt with PLAN ID, HEAD SHA, test/CI, and review evidence",
      });
    }
    if (!childDispositionPresent(body)) {
      findings.push({
        code: "issue_closure_children_missing",
        severity: "error",
        message:
          "Issue-closing PR requires Child Issues: none or an explicit disposition for every child",
      });
    }
    if (
      (outcome === "rejected" || outcome === "quarantined") &&
      !fieldValue(body, "Decision receipt")
    ) {
      findings.push({
        code: "issue_closure_decision_receipt_missing",
        severity: "error",
        message: `${outcome} Issue closure requires a terminal Decision receipt`,
      });
    }
    const poDecision = fieldValue(body, "PO decision") ?? "";
    if (
      (outcome === "superseded" || outcome === "cancelled") &&
      (!poDecision || /^(?:none|not_required)$/i.test(poDecision))
    ) {
      findings.push({
        code: "issue_closure_po_decision_missing",
        severity: "error",
        message: `${outcome} Issue closure requires a non-empty PO decision`,
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

export const ISSUE_METADATA_AUDIT_SCHEMA = "helix-issue-metadata-audit.v1" as const;

// ISSUE-METADATA-ENFORCEMENT-001: GitHub type labels are intentionally narrower than workflow/signal identities.
// `recovery` and `incident` remain typed workflow/signal values and must never
// satisfy the Issue metadata type-label contract.
const TYPE_LABELS = new Set(["bug", "feature", "enhancement", "update"]);

export interface IssueMetadataInput {
  number: number;
  state: "open" | "closed";
  createdAt: string;
  labels: string[];
}

export interface IssueMetadataFinding {
  issueNumber: number;
  code: "type_label_missing" | "lifecycle_label_missing" | "unlabeled_open_issue_stale";
  detail: string;
}

export function auditIssueMetadata(
  issues: readonly IssueMetadataInput[],
  options: { now: string; staleHours?: number },
) {
  const now = Date.parse(options.now);
  const staleHours = options.staleHours ?? 48;
  if (!Number.isFinite(now) || !Number.isFinite(staleHours) || staleHours < 0)
    throw new Error("issue_metadata_options_invalid");
  const findings: IssueMetadataFinding[] = [];
  for (const issue of issues) {
    if (issue.state !== "open") continue;
    const labels = new Set(issue.labels.map((label) => label.trim().toLowerCase()).filter(Boolean));
    const ageHours = (now - Date.parse(issue.createdAt)) / 3_600_000;
    if (labels.size === 0 && Number.isFinite(ageHours) && ageHours >= staleHours) {
      findings.push({
        issueNumber: issue.number,
        code: "unlabeled_open_issue_stale",
        detail: `open issue #${issue.number} has remained unlabeled for ${Math.floor(ageHours)}h`,
      });
    }
    if ([...labels].filter((label) => TYPE_LABELS.has(label)).length !== 1) {
      findings.push({
        issueNumber: issue.number,
        code: "type_label_missing",
        detail: `open issue #${issue.number} requires exactly one governed type label`,
      });
    }
    if (![...labels].some((label) => label.startsWith("state:") || label.startsWith("priority:"))) {
      findings.push({
        issueNumber: issue.number,
        code: "lifecycle_label_missing",
        detail: `open issue #${issue.number} requires a state:* or priority:* label`,
      });
    }
  }
  return {
    schemaVersion: ISSUE_METADATA_AUDIT_SCHEMA,
    ok: findings.length === 0,
    checked: issues.filter((issue) => issue.state === "open").length,
    findings,
  };
}

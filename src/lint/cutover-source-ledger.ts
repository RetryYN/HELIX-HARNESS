export const REQUIRED_CUTOVER_SOURCE_LEDGER_ROWS = [
  "NIST SSDF SP 800-218",
  "GitHub Environments required reviewers",
  "GitHub Actions concurrency",
  "GitHub repository rename",
  "Google SRE Release Engineering",
  "Google SRE Canarying Releases",
  "Microsoft Safe Deployment Practices",
  "Microsoft Testing Strategy",
  "OWASP LLM06:2025 Excessive Agency",
  "SLSA Provenance",
] as const;

export type RequiredCutoverSourceLedgerRow = (typeof REQUIRED_CUTOVER_SOURCE_LEDGER_ROWS)[number];

export const CUTOVER_SOURCE_LEDGER_EXPECTATIONS: Record<
  RequiredCutoverSourceLedgerRow,
  { urls: string[]; impacts: string[] }
> = {
  "NIST SSDF SP 800-218": {
    urls: [
      "https://csrc.nist.gov/pubs/sp/800/218/final",
      "https://csrc.nist.gov/pubs/sp/800/218/r1/ipd",
    ],
    impacts: ["audit_record", "state_backup_plan", "blast_radius_baseline"],
  },
  "GitHub Environments required reviewers": {
    urls: [
      "https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments",
    ],
    impacts: [
      "decision_owner",
      "allowed_outcome",
      "approval_policy_or_named_approver",
      "approval_scope",
      "approved_actor",
      "approved_tool",
      "approved_target",
      "approved_params",
      "review_approval_evidence",
      "expires_at_or_trigger",
    ],
  },
  "GitHub Actions concurrency": {
    urls: [
      "https://docs.github.com/actions/writing-workflows/choosing-what-your-workflow-does/control-the-concurrency-of-workflows-and-jobs",
    ],
    impacts: ["execution_window_or_freeze_policy"],
  },
  "GitHub repository rename": {
    urls: [
      "https://docs.github.com/en/repositories/creating-and-managing-repositories/renaming-a-repository",
    ],
    impacts: [
      "blast_radius_baseline",
      "rollback_plan",
      "post_cutover_monitoring",
      "legacy_alias_policy",
    ],
  },
  "Google SRE Release Engineering": {
    urls: ["https://sre.google/sre-book/release-engineering/"],
    impacts: ["dry_run_plan", "rollback_plan", "post_cutover_monitoring"],
  },
  "Google SRE Canarying Releases": {
    urls: ["https://sre.google/workbook/canarying-releases/"],
    impacts: ["dry_run_plan", "post_cutover_monitoring", "rollback_plan"],
  },
  "Microsoft Safe Deployment Practices": {
    urls: [
      "https://learn.microsoft.com/en-us/azure/well-architected/operational-excellence/safe-deployments",
    ],
    impacts: ["execution_window_or_freeze_policy", "post_cutover_monitoring", "rollback_plan"],
  },
  "Microsoft Testing Strategy": {
    urls: [
      "https://learn.microsoft.com/en-us/azure/well-architected/operational-excellence/testing",
    ],
    impacts: ["dry_run_plan", "audit_record", "blast_radius_baseline"],
  },
  "OWASP LLM06:2025 Excessive Agency": {
    urls: ["https://genai.owasp.org/llmrisk/llm062025-excessive-agency/"],
    impacts: ["approval_scope", "legacy_alias_policy", "audit_record"],
  },
  "SLSA Provenance": {
    urls: ["https://slsa.dev/spec/v1.2/provenance"],
    impacts: ["audit_record", "blast_radius_baseline", "state_backup_plan"],
  },
};

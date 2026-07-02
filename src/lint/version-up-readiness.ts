import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { recordTemplateContractViolations } from "./completion-decision-packet";
import {
  type CompletionDecisionRecordTemplate,
  computeOutstandingWork,
  planTextHasVersionUpParkingIntent,
  recordTemplatesForRecords,
  requiredRecordsForBlockers,
  type SemanticFeatureFrontierRecord,
} from "./outstanding";
import {
  semanticFrontierBindingForPlan,
  semanticFrontierBindingViolations,
} from "./semantic-frontier-binding";
import {
  allowedOutcomeSetViolation,
  fmValue,
  missingRecordFields,
  recordFieldValue,
  SOURCE_LEDGER_MEANING_REVIEW_FIELDS,
  selectedAllowedOutcomeViolation,
  sourceLedgerMeaningReviewFieldViolations,
} from "./shared";
import {
  SOURCE_LEDGER_MAX_AGE_DAYS,
  sourceLedgerCheckedDateViolation,
  sourceLedgerHeadingPattern,
  type VerificationSourceMetadataRow,
  verificationSourceMetadataViolations,
} from "./source-ledger-freshness";
import {
  ACTION_BINDING_APPROVAL_PACKET_COMMAND,
  buildDecisionPacketProvenance,
  type DecisionPacketFreshness,
  planTextRequiresActionBindingApproval,
  type RelatedDecisionPacket,
  relatedDecisionPacket,
  uniqueRelatedDecisionPackets,
  VERSION_UP_ACTIVATION_PACKET_COMMAND,
} from "./workflow-decision-packets";

export interface VersionUpReadinessPlan {
  file: string;
  plan_id: string;
  status: string;
  versionTarget: string | null;
  text: string;
}

export interface VersionUpReadinessInput {
  charter: string;
  pillarRequirements: string;
  functionalDesign: string;
  modeCatalog: string;
  modeDoc: string;
  discoveryPlan: string;
  currentVersion?: string;
  repoHeadSha?: string | null;
  semanticFeatureFrontierRecords?: SemanticFeatureFrontierRecord[];
  plans: VersionUpReadinessPlan[];
}

export interface VersionUpReadinessViolation {
  subject: string;
  reason: string;
}

export interface VersionUpReadinessResult {
  parkedPlanIds: string[];
  missingSourceLedgerRows: string[];
  sourceLedgerViolations: VersionUpReadinessViolation[];
  violations: VersionUpReadinessViolation[];
  ok: boolean;
}

export interface VersionUpActivationPacket {
  schemaVersion: "version-up-activation-packet.v1";
  planId: string;
  generatedAt: string;
  sourceCommand: typeof VERSION_UP_ACTIVATION_PACKET_COMMAND;
  freshness: DecisionPacketFreshness;
  versionTarget: string | null;
  status: "parked_pending_activation_decision" | "invalid_not_parked";
  planOnly: true;
  mustNotApply: true;
  applyCommandAvailable: false;
  activationAllowed: false;
  allowedOutcomes: string[];
  semanticFeatureFrontierRecord: SemanticFeatureFrontierRecord;
  activationDecision: Record<string, string>;
  parkedReview: Record<string, string>;
  actionBindingApproval: Record<string, string>;
  recordTemplates: CompletionDecisionRecordTemplate[];
  externalBoundaries: string[];
  externalRehearsalPlan: Array<
    {
      check: string;
      evidence: string;
      source: string;
    } & VerificationSourceMetadataRow
  >;
  costGuardrails: Array<
    {
      surface: string;
      freeLimit: string;
      activationImpact: string;
      source: string;
    } & VerificationSourceMetadataRow
  >;
  provenanceRequirements: Array<{
    item: string;
    evidence: string;
  }>;
  sourceLedgerFreshness: VersionUpSourceLedgerFreshness;
  activationReadinessSummary: VersionUpActivationReadinessSummary;
  activationReadinessChecks: VersionUpActivationReadinessCheck[];
  versionDryRunEvidence: VersionUpActivationDryRunEvidence;
  activationVerificationCommandMatrix: Array<{
    phase: string;
    command: string;
    writePolicy: "no-write" | "state-write" | "local-artifact-write";
    expected: string;
    evidence: string;
    source: string;
    sourceUrl: string;
    sourceCheckedAt: string;
    latestOfficialStatus: string;
    sourceStatusDelta: string;
    adoptionDecision: string;
    adoptionDecisionDelta: string;
    workflowRouteImpact: string;
  }>;
  reapprovalTriggers: VersionUpActivationReapprovalTrigger[];
  activationSnapshot: VersionUpActivationSnapshot;
  securityChecklistPacket: VersionUpSecurityChecklistPacket;
  relatedDecisionPackets: RelatedDecisionPacket[];
  blockedReasons: string[];
  nextWorkflowRoutes: Array<{ outcome: string; route: string }>;
}

export interface VersionUpActivationSnapshot {
  snapshotId: string;
  headSha: string | null;
  headBound: boolean;
  materialBound: boolean;
  validationStatus: "head_bound" | "head_unavailable";
  releaseTrigger: string;
  versionTarget: string | null;
  planStatus: string;
  planTextDigest: string;
  sourceLedgerCheckedDate: string | null;
  sourceLedgerRowsDigest: string;
  approvalScopeDigest: string;
  versionDryRunDigest: string;
  evidenceDigest: string;
  invalidatedBy: string[];
}

export interface VersionUpActivationDryRunEvidence {
  command: string;
  planCommand: string;
  digest: string;
  ok: boolean;
  semverChange: VersionUpgradeDryRunPlan["semverChange"];
  releaseTagRef: string | null;
  releaseTagSource: VersionUpgradeDryRunPlan["releaseTagSource"];
  releaseTagExists: boolean;
  releaseTriggerResolved: boolean;
  blockedReasons: string[];
}

export interface VersionUpActivationReadinessCheck {
  check: string;
  status: "present" | "pending_evidence";
  evidence: string;
  reason: string;
}

export interface VersionUpActivationReadinessSummary {
  status: "not_required" | "pending_evidence" | "ready_for_activation_review";
  totalChecks: number;
  presentChecks: number;
  pendingChecks: number;
  pendingCheckNames: string[];
  sourceLedgerFresh: boolean;
  sourceLedgerViolation: string | null;
  activationAllowed: false;
  reason: string;
}

export interface VersionUpActivationReapprovalTrigger {
  trigger: string;
  invalidates: string;
  requiredAction: string;
  source: string;
}

export interface VersionUpSourceLedgerFreshness {
  ledgerLabel: "Version-up source ledger";
  checkedDate: string | null;
  stale: boolean;
  violation: string | null;
  maxAgeDays: number;
  rowCount: number;
  missingRows: string[];
  rowsDigest: string;
}

export interface VersionUpgradeDryRunInput {
  currentVersion: string;
  targetVersion: string;
  releaseTrigger?: string;
  releaseTagExists?: boolean;
  releaseRemoteUrl?: string;
}

export interface VersionUpActivationRehearsalPacket {
  schemaVersion: "version-up-activation-rehearsal.v1";
  planId: string;
  planOnly: true;
  mustNotApply: true;
  writePolicy: "no-write";
  sourceCommand: string;
  activationSnapshot: VersionUpActivationSnapshot;
  externalRehearsalPlan: VersionUpActivationPacket["externalRehearsalPlan"];
  costGuardrails: VersionUpActivationPacket["costGuardrails"];
  provenanceRequirements: VersionUpActivationPacket["provenanceRequirements"];
  activationReadinessChecks: VersionUpActivationPacket["activationReadinessChecks"];
  blockedUntil: string[];
}

export interface VersionUpSecurityChecklistPacket {
  schemaVersion: "version-up-security-checklist.v1";
  planId: string;
  planOnly: true;
  mustNotApply: true;
  writePolicy: "no-write";
  sourceCommand: string;
  activationSnapshot: VersionUpActivationSnapshot;
  securityChecks: Array<{
    check: string;
    source: string;
    sourceUrl: string;
    sourceCheckedAt: string;
    latestOfficialStatus: string;
    sourceStatusDelta: string;
    adoptionDecision: string;
    adoptionDecisionDelta: string;
    workflowRouteImpact: string;
    requiredEvidence: string;
  }>;
  blockedUntil: string[];
}

export interface VersionUpActivationCommandViolation {
  subject: string;
  reason: string;
}

export interface VersionUpgradeDryRunPlan {
  schemaVersion: "version-up-dry-run-plan.v1";
  currentVersion: string;
  targetVersion: string;
  normalizedCurrent: string | null;
  normalizedTarget: string | null;
  semverChange: "major" | "minor" | "patch" | "prerelease" | "same" | "downgrade" | "invalid";
  releaseTrigger: string;
  releaseTagRef: string | null;
  releaseTagSource: "local" | "remote";
  releaseTagCheckCommand: string;
  releaseTagExists: boolean;
  releaseTriggerResolved: boolean;
  planOnly: true;
  mustNotApply: true;
  applyCommandAvailable: false;
  ok: boolean;
  blockedReasons: string[];
  migrationPlan: Array<{
    step: string;
    command: string;
    requiredEvidence: string;
  }>;
  rollbackPlan: Array<{
    step: string;
    command: string;
    requiredEvidence: string;
  }>;
  idempotencyChecks: Array<{
    check: string;
    command: string;
    expected: string;
  }>;
  releaseGateChecks: Array<{
    check: string;
    command: string;
    requiredEvidence: string;
  }>;
  sourceBasis: Array<{
    name: string;
    url: string;
    versionUpUse: string;
  }>;
}

const MODE_DOC_MARKERS = [
  "deferred-but-committed-future",
  "status=draft",
  "version_target",
  "VERSION_UP_ALLOWED_TARGETS",
  "activation_decision_record",
  "allowed_outcome",
  "target_version_or_release_trigger",
  "activation_snapshot_id",
  "activation_route",
  "review_by",
  "approval_scope",
  "dry_run_plan",
  "rollback_plan",
  "parked_review_record",
  "review_owner",
  "review_trigger",
  "review_by_policy",
  "stale_action",
  "activation_dependency",
  "decision_packet_route",
  "Version-up source ledger",
  "Semantic Versioning 2.0.0",
  "GitHub Releases",
  "GitHub Environments required reviewers",
  "NIST SSDF SP 800-218",
  "semantic-release",
  "Release Please",
  "GitHub Rulesets",
  "GitHub Merge Queue",
  "GitHub Actions secure use",
  "Cloudflare Pages limits",
  "Cloudflare Workers limits",
  "Cloudflare D1 limits",
  "Cloudflare Workers KV limits",
  "Cloudflare Access policies",
  "GitHub webhook HMAC SHA-256",
  "OWASP Web Security Testing Guide",
  "external_rehearsal_plan",
  "cost_guardrails",
  "activation_provenance_requirements",
  "adopted version/date",
  "latest official status",
  "adoption decision",
  "activationReadinessSummary",
  "version-up rehearsal",
  "version-up security-checklist",
  "reapprovalTriggers[]",
  "activationSnapshot",
  "snapshotId",
  "HEAD/scope/source/evidence drift",
  "source_status_delta",
  "adoption_decision_delta",
  "workflow_route_impact",
  "date-only refresh",
  "action-binding approval",
  "escalation_boundaries",
] as const;

const CHARTER_MARKERS = ["version-up 定義", "今版に入れない作業を失わない"] as const;

const PILLAR_REQUIREMENT_MARKERS = [
  "HR-FR-P1-02",
  "HAC-P1-02a",
  "version-up-readiness",
  "`version_target`",
  "activation 条件",
  "version-up-activation-packet.v1",
  "plan-only activation packet",
  "apply surface を持たない",
  "今版外作業を失わない",
] as const;

const FUNCTIONAL_DESIGN_MARKERS = [
  "HB-P1 continuous-autonomy",
  "continuous-run、version-up",
  "signal → mode routing",
  "escalation_boundaries",
] as const;

const MODE_CATALOG_MARKERS = [
  "| **version-up** |",
  "[version-up.md](version-up.md)",
  "`version_deferral`",
  "将来版活性化時 → add-feature",
] as const;

const PARKED_PLAN_MARKERS = [
  "version-up parked",
  "mode=version-up",
  "activation",
  "activation_decision_record",
  "allowed_outcome",
  "target_version_or_release_trigger",
  "activation_snapshot_id",
  "activation_route",
  "review_by",
  "parked_review_record",
  "review_owner",
  "review_trigger",
  "review_by_policy",
  "stale_action",
  "activation_dependency",
  "decision_packet_route",
  "external_rehearsal_plan",
  "cost_guardrails",
  "activation_provenance_requirements",
  "version_target",
] as const;

const ACTIVATION_RECORD_NAME = "activation_decision_record";
const ACTIVATION_RECORD_FIELDS = [
  "allowed_outcome",
  "target_version_or_release_trigger",
  "activation_snapshot_id",
  "activation_route",
  "review_by",
  "approval_scope",
  "dry_run_plan",
  "rollback_plan",
  ...SOURCE_LEDGER_MEANING_REVIEW_FIELDS,
] as const;
const ACTIVATION_ALLOWED_OUTCOMES = [
  "activate_future_version",
  "reject_or_archive",
  "keep_parked_with_review_date",
] as const;

const PARKED_REVIEW_RECORD_NAME = "parked_review_record";
const PARKED_REVIEW_RECORD_FIELDS = [
  "review_owner",
  "review_trigger",
  "review_by_policy",
  "stale_action",
  "activation_dependency",
  "decision_packet_route",
] as const;

const EXTERNAL_BOUNDARY_TERMS = [
  "Cloudflare",
  "HMAC",
  "webhook",
  "access control",
  "secret",
  "external",
  "infrastructure",
  "infra",
  "auth",
  "authentication",
  "authorization",
  "production",
  "schema migration",
  "本番",
  "認証",
  "認可",
] as const;

const EXTERNAL_ACTIVATION_MARKERS = [
  "action-binding approval",
  "escalation_boundaries",
  "approval_scope",
  "dry_run_plan",
  "rollback_plan",
  "exit 1",
] as const;

const ACTION_BINDING_RECORD_NAME = "action_binding_approval_record";
const ACTION_BINDING_RECORD_FIELDS = [
  "allowed_outcome",
  "approval_policy_or_named_approver",
  "approval_scope",
  "approved_actor",
  "approved_tool",
  "approved_target",
  "approved_params",
  "review_approval_evidence",
  "reviewed_snapshot_binding",
  "expires_at_or_trigger",
  "audit_record",
] as const;

const EXTERNAL_REHEARSAL_RECORD_NAME = "external_rehearsal_plan";
const EXTERNAL_REHEARSAL_RECORD_FIELDS = [
  "official_source_basis",
  "free_tier_budget_check",
  "webhook_signature_check",
  "access_control_check",
  "no_secret_pii_check",
  "no_prod_write_check",
  "rollback_rehearsal",
] as const;

const COST_GUARDRAIL_RECORD_NAME = "cost_guardrails";
const COST_GUARDRAIL_RECORD_FIELDS = [
  "pages_limit",
  "workers_limit",
  "d1_limit",
  "kv_limit",
  "exceed_action",
] as const;

const PROVENANCE_RECORD_NAME = "activation_provenance_requirements";
const PROVENANCE_RECORD_FIELDS = [
  "source_ledger",
  "dry_run_evidence",
  "approval_evidence",
  "audit_record",
] as const;

const ACTIVATION_REHEARSAL_REQUIRED_EVIDENCE = [
  "official_source_basis",
  "free_tier_budget_check",
  "webhook_signature_check",
  "access_control_check",
  "no_secret_pii_check",
  "no_prod_write_check",
  "rollback_rehearsal",
  "source_ledger",
  "dry_run_evidence",
  "approval_evidence",
  "audit_record",
] as const;

const REQUIRED_SOURCE_LEDGER_COLUMNS = [
  "source",
  "official URL",
  "adopted version/date",
  "latest official status",
  "adoption decision",
  "version-up use",
  "required field impact",
] as const;

const REQUIRED_SOURCE_LEDGER_ROWS = [
  "Semantic Versioning 2.0.0",
  "GitHub Releases",
  "GitHub Environments required reviewers",
  "NIST SSDF SP 800-218",
  "semantic-release",
  "Release Please",
  "GitHub Rulesets",
  "GitHub Merge Queue",
  "GitHub Actions secure use",
  "Cloudflare Pages limits",
  "Cloudflare Workers limits",
  "Cloudflare D1 limits",
  "Cloudflare Workers KV limits",
  "Cloudflare Access policies",
  "GitHub webhook HMAC SHA-256",
  "OWASP Web Security Testing Guide",
] as const;

const EXPECTED_SOURCE_LEDGER_BINDINGS: Record<
  (typeof REQUIRED_SOURCE_LEDGER_ROWS)[number],
  { urls: string[]; fieldImpacts: string[] }
> = {
  "Semantic Versioning 2.0.0": {
    urls: ["https://semver.org/"],
    fieldImpacts: [
      "version_target",
      "target_version_or_release_trigger",
      "review_trigger",
      "activation_dependency",
    ],
  },
  "GitHub Releases": {
    urls: [
      "https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository",
    ],
    fieldImpacts: ["target_version_or_release_trigger", "review_trigger", "review_by_policy"],
  },
  "GitHub Environments required reviewers": {
    urls: [
      "https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments",
    ],
    fieldImpacts: ["review_owner", "approval_scope"],
  },
  "NIST SSDF SP 800-218": {
    urls: [
      "https://csrc.nist.gov/pubs/sp/800/218/final",
      "https://csrc.nist.gov/pubs/sp/800/218/r1/ipd",
    ],
    fieldImpacts: ["dry_run_plan", "rollback_plan", "stale_action"],
  },
  "semantic-release": {
    urls: ["https://semantic-release.gitbook.io/semantic-release"],
    fieldImpacts: ["activation_dependency", "dry_run_plan", "release automation ADR"],
  },
  "Release Please": {
    urls: ["https://github.com/googleapis/release-please"],
    fieldImpacts: ["review_trigger", "activation_dependency", "release automation ADR"],
  },
  "GitHub Rulesets": {
    urls: [
      "https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets",
    ],
    fieldImpacts: ["approval_scope", "activation_dependency"],
  },
  "GitHub Merge Queue": {
    urls: [
      "https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/managing-a-merge-queue",
    ],
    fieldImpacts: ["activation_route", "review_trigger", "activation_dependency"],
  },
  "GitHub Actions secure use": {
    urls: [
      "https://docs.github.com/en/actions/reference/security/secure-use",
      "https://docs.github.com/en/actions/reference/security/securely-using-pull_request_target",
      "https://docs.github.com/actions/reference/authentication-in-a-workflow",
    ],
    fieldImpacts: [
      "approval_scope",
      "dry_run_plan",
      "external_rehearsal_plan",
      "activation_provenance_requirements",
      "audit_record",
    ],
  },
  "Cloudflare Pages limits": {
    urls: ["https://developers.cloudflare.com/pages/platform/limits/"],
    fieldImpacts: ["cost_guardrails", "external_rehearsal_plan"],
  },
  "Cloudflare Workers limits": {
    urls: ["https://developers.cloudflare.com/workers/platform/limits/"],
    fieldImpacts: ["cost_guardrails", "external_rehearsal_plan"],
  },
  "Cloudflare D1 limits": {
    urls: ["https://developers.cloudflare.com/d1/platform/limits/"],
    fieldImpacts: ["cost_guardrails", "external_rehearsal_plan"],
  },
  "Cloudflare Workers KV limits": {
    urls: ["https://developers.cloudflare.com/kv/platform/limits/"],
    fieldImpacts: ["cost_guardrails", "external_rehearsal_plan"],
  },
  "Cloudflare Access policies": {
    urls: ["https://developers.cloudflare.com/cloudflare-one/access-controls/policies/"],
    fieldImpacts: ["external_rehearsal_plan", "approval_scope"],
  },
  "GitHub webhook HMAC SHA-256": {
    urls: ["https://docs.github.com/en/webhooks/using-webhooks/validating-webhook-deliveries"],
    fieldImpacts: ["external_rehearsal_plan", "dry_run_plan"],
  },
  "OWASP Web Security Testing Guide": {
    urls: [
      "https://owasp.org/www-project-web-security-testing-guide/stable/",
      "https://owasp.org/www-project-web-security-testing-guide/latest/",
    ],
    fieldImpacts: ["external_rehearsal_plan", "dry_run_plan", "activation_provenance_requirements"],
  },
};

const VERSION_UP_SOURCE_CHECKED_AT = "2026-07-02";

const VERSION_UP_SOURCE_METADATA = {
  sourceLedger: {
    sourceUrl: "docs/process/modes/version-up.md",
    sourceCheckedAt: VERSION_UP_SOURCE_CHECKED_AT,
    latestOfficialStatus:
      "local Version-up source ledger rows are current at HEAD after official source recheck",
    sourceStatusDelta:
      "source ledger now binds external rehearsal and cost guardrail rows to per-row source metadata",
    adoptionDecision: "adopt-source-ledger-as-required-basis-for-external-rehearsal",
    adoptionDecisionDelta:
      "tighten packet evidence so source names alone are not sufficient activation material",
    workflowRouteImpact:
      "missing source metadata keeps activation readiness blocked before approval review",
  },
  cloudflarePages: {
    sourceUrl: "https://developers.cloudflare.com/pages/platform/limits/",
    sourceCheckedAt: VERSION_UP_SOURCE_CHECKED_AT,
    latestOfficialStatus:
      "Cloudflare Pages limits remain live official guidance with project limits and abuse/temporary disable constraints",
    sourceStatusDelta:
      "official limits remain a live budget source; activation must record current Pages fit before deploy",
    adoptionDecision: "adopt-live-docs-for-static-hosting-budget",
    adoptionDecisionDelta:
      "require Pages budget evidence on the cost guardrail row, not only in prose",
    workflowRouteImpact:
      "Pages budget drift routes back to external rehearsal before activation review",
  },
  cloudflareWorkers: {
    sourceUrl: "https://developers.cloudflare.com/workers/platform/limits/",
    sourceCheckedAt: VERSION_UP_SOURCE_CHECKED_AT,
    latestOfficialStatus:
      "Cloudflare Workers Free plan documents 100,000 requests per day and over-limit Error 1027 behavior",
    sourceStatusDelta:
      "Workers request and subrequest limits remain activation cost constraints for read API and Pages Functions",
    adoptionDecision: "adopt-live-docs-for-worker-budget",
    adoptionDecisionDelta:
      "require current Workers quota evidence before treating external rehearsal as ready",
    workflowRouteImpact: "Workers quota drift keeps activationReadinessSummary pending_evidence",
  },
  cloudflareD1: {
    sourceUrl: "https://developers.cloudflare.com/d1/platform/limits/",
    sourceCheckedAt: VERSION_UP_SOURCE_CHECKED_AT,
    latestOfficialStatus:
      "Cloudflare D1 limits remain live official guidance for database count, storage, Time Travel, and query limits",
    sourceStatusDelta:
      "D1 storage/query constraints remain projection DB budget inputs for activation rehearsal",
    adoptionDecision: "adopt-live-docs-for-projection-db-budget",
    adoptionDecisionDelta:
      "require D1 limit evidence on cost guardrail rows before activation review",
    workflowRouteImpact:
      "D1 limit drift routes back to budget rehearsal and activation record update",
  },
  cloudflareKv: {
    sourceUrl: "https://developers.cloudflare.com/kv/platform/limits/",
    sourceCheckedAt: VERSION_UP_SOURCE_CHECKED_AT,
    latestOfficialStatus:
      "Cloudflare Workers KV limits remain live official guidance with Free reads, writes, operations, namespace, and storage quotas",
    sourceStatusDelta:
      "KV read/write/storage limits remain projection cache budget inputs for activation rehearsal",
    adoptionDecision: "adopt-live-docs-for-projection-cache-budget",
    adoptionDecisionDelta:
      "require KV limit evidence on cost guardrail rows before activation review",
    workflowRouteImpact:
      "KV limit drift routes back to budget rehearsal and activation record update",
  },
  cloudflareAccess: {
    sourceUrl: "https://developers.cloudflare.com/cloudflare-one/access-controls/policies/",
    sourceCheckedAt: VERSION_UP_SOURCE_CHECKED_AT,
    latestOfficialStatus:
      "Cloudflare Access policies remain live official guidance for Allow, Block, Bypass, Service Auth, Include, Exclude, and Require rules",
    sourceStatusDelta:
      "Access policy docs still require explicit rule and bypass-risk review for read-only dashboard exposure",
    adoptionDecision: "adopt-live-docs-for-viewer-access-control",
    adoptionDecisionDelta:
      "require access-control rehearsal evidence before treating viewer access as approved",
    workflowRouteImpact:
      "Access policy drift routes back to external rehearsal and action-binding approval",
  },
  githubWebhookHmac: {
    sourceUrl: "https://docs.github.com/en/webhooks/using-webhooks/validating-webhook-deliveries",
    sourceCheckedAt: VERSION_UP_SOURCE_CHECKED_AT,
    latestOfficialStatus:
      "GitHub webhook HMAC SHA-256 validation remains live official guidance for delivery authenticity",
    sourceStatusDelta:
      "webhook signature verification remains required before projection update activation",
    adoptionDecision: "adopt-live-docs-for-webhook-signature",
    adoptionDecisionDelta:
      "require concrete HMAC rehearsal evidence before external activation approval",
    workflowRouteImpact:
      "missing webhook evidence keeps activationReadinessSummary pending_evidence",
  },
  githubActionsSecurity: {
    sourceUrl: "https://docs.github.com/en/actions/reference/security/secure-use",
    sourceCheckedAt: VERSION_UP_SOURCE_CHECKED_AT,
    latestOfficialStatus:
      "GitHub Actions secure-use guidance keeps GITHUB_TOKEN least-privilege permissions and untrusted trigger review as live official guidance",
    sourceStatusDelta:
      "least-privilege token and pull_request_target risk review remain required activation workflow evidence",
    adoptionDecision:
      "adopt-live-docs-for-least-privilege-token-scope-and-untrusted-pr-trigger-review",
    adoptionDecisionDelta:
      "keep activation workflow hardening as required external rehearsal evidence",
    workflowRouteImpact:
      "missing concrete rehearsal evidence keeps activationReadinessSummary pending_evidence",
  },
  githubActionsPullRequestTarget: {
    sourceUrl:
      "https://docs.github.com/en/actions/reference/security/securely-using-pull_request_target",
    sourceCheckedAt: VERSION_UP_SOURCE_CHECKED_AT,
    latestOfficialStatus:
      "GitHub pull_request_target security guidance remains live official guidance for untrusted code and token/secret exposure review",
    sourceStatusDelta:
      "pull_request_target remains a high-risk trigger that must not run untrusted code with secrets",
    adoptionDecision: "adopt-live-docs-for-untrusted-pr-trigger-review",
    adoptionDecisionDelta:
      "require pull_request_target risk evidence in the security checklist before approval",
    workflowRouteImpact:
      "unsafe trigger evidence routes back to workflow hardening before activation review",
  },
  githubEnvironments: {
    sourceUrl:
      "https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments",
    sourceCheckedAt: VERSION_UP_SOURCE_CHECKED_AT,
    latestOfficialStatus:
      "GitHub environments required reviewers remain live official approval gate guidance with public/private repository and plan availability constraints",
    sourceStatusDelta:
      "availability constraints reviewed; Free/Pro/Team required reviewers are public-repository gated, so private/internal activation must record an equivalent approved boundary before relying on environments",
    adoptionDecision:
      "adopt-required-reviewer-boundary-only-after-repo-visibility-plan-and-prevent-self-review-check",
    adoptionDecisionDelta:
      "tighten approval packet review so GitHub Environments availability is evidence, not an assumption",
    workflowRouteImpact: "missing reviewed_snapshot_binding keeps action-binding approval pending",
  },
  owaspWstg: {
    sourceUrl: "https://owasp.org/www-project-web-security-testing-guide/stable/",
    sourceCheckedAt: VERSION_UP_SOURCE_CHECKED_AT,
    latestOfficialStatus:
      "OWASP WSTG stable page is the adopted baseline; latest page is explicitly volatile and may change frequently",
    sourceStatusDelta:
      "stable baseline remains adopted while latest volatility requires recheck before changing security-testing scope",
    adoptionDecision:
      "adopt-stable-wstg-baseline-and-track-latest-volatility-for-security-testing-shape",
    adoptionDecisionDelta:
      "tighten WSTG adoption so latest changes are review input, not automatic activation scope changes",
    workflowRouteImpact:
      "WSTG latest/stable drift routes back to security checklist review before activation approval",
  },
  localInvariant: {
    sourceUrl: "docs/process/modes/version-up.md",
    sourceCheckedAt: VERSION_UP_SOURCE_CHECKED_AT,
    latestOfficialStatus:
      "local HELIX no-secret/no-PII and no-production-write invariants remain current at HEAD",
    sourceStatusDelta:
      "local invariants now require per-row source metadata in activation rehearsal packets",
    adoptionDecision: "adopt-local-invariants-for-non-secret-read-only-projection-rehearsal",
    adoptionDecisionDelta:
      "require invariant evidence as structured rehearsal metadata instead of prose-only notes",
    workflowRouteImpact:
      "missing invariant evidence keeps activationReadinessSummary pending_evidence",
  },
  rollbackPlan: {
    sourceUrl: "docs/process/modes/version-up.md",
    sourceCheckedAt: VERSION_UP_SOURCE_CHECKED_AT,
    latestOfficialStatus:
      "local HELIX rollback evidence requirement remains current at HEAD for version-up activation",
    sourceStatusDelta:
      "rollback rehearsal remains required approval material before any external activation",
    adoptionDecision: "adopt-local-rollback-plan-as-version-up-activation-rehearsal-evidence",
    adoptionDecisionDelta:
      "require rollback evidence row metadata before activation approval review",
    workflowRouteImpact:
      "missing rollback evidence keeps activationReadinessSummary pending_evidence",
  },
} satisfies Record<string, VerificationSourceMetadataRow>;

function parsePlan(file: string, content: string): VersionUpReadinessPlan {
  return {
    file,
    plan_id: fmValue(content, "plan_id") ?? file.replace(/\.md$/, ""),
    status: fmValue(content, "status") ?? "unknown",
    versionTarget: fmValue(content, "version_target") ?? null,
    text: content,
  };
}

function readRepoHeadSha(repoRoot: string): string | null {
  try {
    return execFileSync("git", ["-C", repoRoot, "rev-parse", "HEAD"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return null;
  }
}

function readPackageVersion(repoRoot: string): string | null {
  try {
    const pkg = JSON.parse(readFileSync(join(repoRoot, "package.json"), "utf8")) as {
      version?: unknown;
    };
    return typeof pkg.version === "string" && pkg.version.trim() ? pkg.version.trim() : null;
  } catch {
    return null;
  }
}

export function loadVersionUpReadinessInput(
  repoRoot: string = process.cwd(),
): VersionUpReadinessInput {
  const plansDir = join(repoRoot, "docs", "plans");
  const outstanding = computeOutstandingWork(repoRoot);
  const plans = readdirSync(plansDir)
    .filter((f) => f.startsWith("PLAN-") && f.endsWith(".md"))
    .map((f) => parsePlan(f, readFileSync(join(plansDir, f), "utf8")));

  return {
    charter: readFileSync(
      join(repoRoot, "docs", "design", "helix", "L0-charter", "helix-charter_v0.1.md"),
      "utf8",
    ),
    pillarRequirements: readFileSync(
      join(
        repoRoot,
        "docs",
        "design",
        "helix",
        "L3-requirements",
        "pillar-functional-requirements.md",
      ),
      "utf8",
    ),
    functionalDesign: readFileSync(
      join(repoRoot, "docs", "design", "harness", "L4-basic-design", "function.md"),
      "utf8",
    ),
    modeCatalog: readFileSync(join(repoRoot, "docs", "process", "modes", "README.md"), "utf8"),
    modeDoc: readFileSync(join(repoRoot, "docs", "process", "modes", "version-up.md"), "utf8"),
    discoveryPlan: readFileSync(
      join(repoRoot, "docs", "plans", "PLAN-DISCOVERY-09-version-up-mode.md"),
      "utf8",
    ),
    currentVersion: readPackageVersion(repoRoot) ?? undefined,
    repoHeadSha: readRepoHeadSha(repoRoot),
    semanticFeatureFrontierRecords: outstanding.semanticFeatureFrontierRecords ?? [],
    plans,
  };
}

export function analyzeVersionUpReadiness(
  input: VersionUpReadinessInput,
): VersionUpReadinessResult {
  const violations: VersionUpReadinessViolation[] = [];

  for (const marker of CHARTER_MARKERS) {
    if (!input.charter.includes(marker)) {
      violations.push({ subject: "L0 helix charter", reason: `missing ${marker}` });
    }
  }

  for (const marker of PILLAR_REQUIREMENT_MARKERS) {
    if (!input.pillarRequirements.includes(marker)) {
      violations.push({ subject: "L3 pillar requirements", reason: `missing ${marker}` });
    }
  }

  for (const marker of FUNCTIONAL_DESIGN_MARKERS) {
    if (!input.functionalDesign.includes(marker)) {
      violations.push({ subject: "L4 functional design", reason: `missing ${marker}` });
    }
  }

  for (const marker of MODE_CATALOG_MARKERS) {
    if (!input.modeCatalog.includes(marker)) {
      violations.push({ subject: "docs/process/modes/README.md", reason: `missing ${marker}` });
    }
  }

  for (const marker of MODE_DOC_MARKERS) {
    if (!input.modeDoc.includes(marker)) {
      violations.push({ subject: "docs/process/modes/version-up.md", reason: `missing ${marker}` });
    }
  }

  const sourceLedger = parseVersionUpSourceLedger(input.modeDoc);
  const missingSourceLedgerRows = REQUIRED_SOURCE_LEDGER_ROWS.filter(
    (source) => !sourceLedger.rows.some((row) => row.source === source),
  );
  const freshnessViolation = sourceLedgerCheckedDateViolation(
    input.modeDoc,
    "Version-up source ledger",
  );
  const sourceLedgerViolations: VersionUpReadinessViolation[] = [
    ...(freshnessViolation
      ? [{ subject: "docs/process/modes/version-up.md", reason: freshnessViolation }]
      : []),
    ...REQUIRED_SOURCE_LEDGER_COLUMNS.filter(
      (column) => !sourceLedger.columns.includes(column),
    ).map((column) => ({
      subject: "docs/process/modes/version-up.md",
      reason: `version-up source ledger missing column: ${column}`,
    })),
    ...sourceLedger.rows.flatMap((row) =>
      REQUIRED_SOURCE_LEDGER_COLUMNS.flatMap((column) => {
        const value = row[column] ?? "";
        if (value.trim() === "" || /^(TBD|TODO|-)$/.test(value.trim())) {
          return [
            {
              subject: "docs/process/modes/version-up.md",
              reason: `version-up source ledger ${row.source} has empty ${column}`,
            },
          ];
        }
        return [];
      }),
    ),
    ...sourceLedger.rows.flatMap((row) =>
      row["official URL"]?.includes("https://")
        ? []
        : [
            {
              subject: "docs/process/modes/version-up.md",
              reason: `version-up source ledger ${row.source} official URL is not https`,
            },
          ],
    ),
    ...sourceLedger.rows.flatMap((row) =>
      row["adoption decision"]?.trim()
        ? []
        : [
            {
              subject: "docs/process/modes/version-up.md",
              reason: `version-up source ledger ${row.source} missing adoption decision`,
            },
          ],
    ),
    ...REQUIRED_SOURCE_LEDGER_ROWS.flatMap((source) => {
      const row = sourceLedger.rows.find((candidate) => candidate.source === source);
      const expected = EXPECTED_SOURCE_LEDGER_BINDINGS[source];
      if (!row) return [];
      const officialUrl = row["official URL"] ?? "";
      const requiredFieldImpact = row["required field impact"] ?? "";
      return [
        ...expected.urls
          .filter((url) => !officialUrl.includes(url))
          .map((url) => ({
            subject: "docs/process/modes/version-up.md",
            reason: `version-up source ledger ${source} official URL missing expected ${url}`,
          })),
        ...expected.fieldImpacts
          .filter((impact) => !requiredFieldImpact.includes(impact))
          .map((impact) => ({
            subject: "docs/process/modes/version-up.md",
            reason: `version-up source ledger ${source} required field impact missing expected ${impact}`,
          })),
      ];
    }),
  ];

  for (const source of missingSourceLedgerRows) {
    violations.push({
      subject: "docs/process/modes/version-up.md",
      reason: `version-up source ledger missing row: ${source}`,
    });
  }
  violations.push(...sourceLedgerViolations);

  if (!input.discoveryPlan.includes("decision_outcome: confirmed")) {
    violations.push({
      subject: "PLAN-DISCOVERY-09-version-up-mode",
      reason: "S4 confirmed decision missing",
    });
  }
  if (!input.discoveryPlan.includes("activation note (2026-06-30)")) {
    violations.push({
      subject: "PLAN-DISCOVERY-09-version-up-mode",
      reason: "current activation note missing",
    });
  }

  for (const plan of input.plans.filter(
    (p) =>
      p.status === "draft" && p.versionTarget === null && planTextHasVersionUpParkingIntent(p.text),
  )) {
    violations.push({
      subject: plan.plan_id,
      reason:
        "version-up parked markers require version_target frontmatter before activation packet or status frontier classification",
    });
  }

  const parked = input.plans.filter((p) => p.versionTarget !== null);
  for (const plan of parked) {
    if (input.semanticFeatureFrontierRecords !== undefined) {
      violations.push(
        ...semanticFrontierBindingViolations(
          input.semanticFeatureFrontierRecords,
          {
            planId: plan.plan_id,
            classification: "parked_future_version",
          },
          plan.plan_id,
        ),
      );
    }
    if (plan.status !== "draft") {
      violations.push({
        subject: plan.plan_id,
        reason: "version_target is only valid while status=draft",
      });
    }
    for (const marker of PARKED_PLAN_MARKERS) {
      if (!plan.text.includes(marker)) {
        violations.push({ subject: plan.plan_id, reason: `missing parked marker ${marker}` });
      }
    }
    for (const field of missingRecordFields(
      plan.text,
      ACTIVATION_RECORD_NAME,
      ACTIVATION_RECORD_FIELDS,
    )) {
      violations.push({ subject: plan.plan_id, reason: `missing structured ${field}` });
    }
    const selectedOutcome = selectedActivationOutcome(plan);
    const activationOutcomeViolation = selectedOutcome
      ? selectedAllowedOutcomeViolation({
          text: plan.text,
          recordName: ACTIVATION_RECORD_NAME,
          allowedOutcomes: ACTIVATION_ALLOWED_OUTCOMES,
          selectedOutcome,
          selectedOutcomeLabel: "activation_outcome",
        })
      : hasConcreteActivationSnapshotId(plan)
        ? selectedAllowedOutcomeViolation({
            text: plan.text,
            recordName: ACTIVATION_RECORD_NAME,
            allowedOutcomes: ACTIVATION_ALLOWED_OUTCOMES,
            selectedOutcomeLabel: "activation_outcome",
          })
        : allowedOutcomeSetViolation(
            plan.text,
            ACTIVATION_RECORD_NAME,
            ACTIVATION_ALLOWED_OUTCOMES,
          );
    if (activationOutcomeViolation) {
      violations.push({ subject: plan.plan_id, reason: activationOutcomeViolation });
    }
    for (const reason of sourceLedgerMeaningReviewFieldViolations(
      plan.text,
      ACTIVATION_RECORD_NAME,
    )) {
      violations.push({ subject: plan.plan_id, reason });
    }
    const sourceLedgerFreshnessValue = record(
      plan,
      ACTIVATION_RECORD_NAME,
      "source_ledger_freshness",
    );
    const currentLedgerCheckedDate = buildVersionUpSourceLedgerFreshness(
      input.modeDoc,
      sourceLedger,
    ).checkedDate;
    const recordedLedgerCheckedDate = sourceLedgerFreshnessValue.match(
      /\bchecked[= ](\d{4}-\d{2}-\d{2})\b/i,
    )?.[1];
    if (currentLedgerCheckedDate && !recordedLedgerCheckedDate) {
      violations.push({
        subject: plan.plan_id,
        reason: `source_ledger_freshness must cite current Version-up source ledger checked ${currentLedgerCheckedDate}`,
      });
    }
    if (
      currentLedgerCheckedDate &&
      recordedLedgerCheckedDate &&
      recordedLedgerCheckedDate !== currentLedgerCheckedDate
    ) {
      violations.push({
        subject: plan.plan_id,
        reason: `source_ledger_freshness checked date ${recordedLedgerCheckedDate} does not match current Version-up source ledger checked ${currentLedgerCheckedDate}`,
      });
    }
    for (const field of missingRecordFields(
      plan.text,
      PARKED_REVIEW_RECORD_NAME,
      PARKED_REVIEW_RECORD_FIELDS,
    )) {
      violations.push({ subject: plan.plan_id, reason: `missing structured ${field}` });
    }
    if (!activationOutcomeViolation) {
      violations.push(...validateParkedVersionUpSemantics(plan));
    }
    const hasExternalBoundary = EXTERNAL_BOUNDARY_TERMS.some((term) =>
      plan.text.toLowerCase().includes(term.toLowerCase()),
    );
    if (hasExternalBoundary) {
      for (const marker of EXTERNAL_ACTIVATION_MARKERS) {
        if (!plan.text.includes(marker)) {
          violations.push({
            subject: plan.plan_id,
            reason: `external activation boundary missing ${marker}`,
          });
        }
      }
      for (const field of missingRecordFields(
        plan.text,
        EXTERNAL_REHEARSAL_RECORD_NAME,
        EXTERNAL_REHEARSAL_RECORD_FIELDS,
      )) {
        violations.push({ subject: plan.plan_id, reason: `missing structured ${field}` });
      }
      for (const field of missingRecordFields(
        plan.text,
        COST_GUARDRAIL_RECORD_NAME,
        COST_GUARDRAIL_RECORD_FIELDS,
      )) {
        violations.push({ subject: plan.plan_id, reason: `missing structured ${field}` });
      }
      for (const field of missingRecordFields(
        plan.text,
        PROVENANCE_RECORD_NAME,
        PROVENANCE_RECORD_FIELDS,
      )) {
        violations.push({ subject: plan.plan_id, reason: `missing structured ${field}` });
      }
    }
    const sourceLedgerFreshness = buildVersionUpSourceLedgerFreshness(input.modeDoc, sourceLedger);
    const packet = buildVersionUpActivationPacket(plan, sourceLedgerFreshness, {
      semanticFeatureFrontierRecords: input.semanticFeatureFrontierRecords,
      repoHeadSha: input.repoHeadSha,
      currentVersion: input.currentVersion,
    });
    const recordBlockers = [
      "version_up_parked",
      ...(packet.externalBoundaries.length > 0 || planTextRequiresActionBindingApproval(plan.text)
        ? ["human_approval_pending"]
        : []),
    ];
    violations.push(
      ...recordTemplateContractViolations({
        subject: `${plan.plan_id}.versionUpActivationPacket`,
        requiredRecords: requiredRecordsForBlockers(recordBlockers),
        recordTemplates: packet.recordTemplates,
      }).map((violation) => ({
        subject: violation.subject,
        reason: violation.reason,
      })),
    );
    if (!activationOutcomeViolation && selectedOutcome === "activate_future_version") {
      violations.push(...selectedActivationMaterialViolations(packet));
    }
  }

  return {
    parkedPlanIds: parked.map((p) => p.plan_id).sort(),
    missingSourceLedgerRows,
    sourceLedgerViolations,
    violations,
    ok: violations.length === 0,
  };
}

export function buildVersionUpActivationPackets(
  input: VersionUpReadinessInput,
): VersionUpActivationPacket[] {
  const sourceLedger = parseVersionUpSourceLedger(input.modeDoc);
  const sourceLedgerFreshness = buildVersionUpSourceLedgerFreshness(input.modeDoc, sourceLedger);
  return input.plans
    .filter((plan) => plan.versionTarget !== null)
    .map((plan) =>
      buildVersionUpActivationPacket(plan, sourceLedgerFreshness, {
        semanticFeatureFrontierRecords: input.semanticFeatureFrontierRecords,
        repoHeadSha: input.repoHeadSha,
        currentVersion: input.currentVersion,
      }),
    )
    .sort((a, b) => a.planId.localeCompare(b.planId));
}

export function buildVersionUpgradeDryRunPlan(
  input: VersionUpgradeDryRunInput,
): VersionUpgradeDryRunPlan {
  const current = parseSemver(input.currentVersion);
  const target = parseSemver(input.targetVersion);
  const semverChange = classifySemverChange(current, target);
  const releaseTagRef = target ? `refs/tags/v${target.normalized}` : null;
  const releaseTagSource = input.releaseRemoteUrl ? "remote" : "local";
  const releaseTagCheckCommand = releaseTagRef
    ? input.releaseRemoteUrl
      ? `git ls-remote --tags ${shellQuote(input.releaseRemoteUrl)} ${shellQuote(releaseTagRef)}`
      : `git rev-parse --verify ${shellQuote(releaseTagRef)}`
    : input.releaseRemoteUrl
      ? `git ls-remote --tags ${shellQuote(input.releaseRemoteUrl)} ${shellQuote(input.targetVersion)}`
      : `git rev-parse --verify ${shellQuote(input.targetVersion)}`;
  const dryRunCommand = [
    `ut-tdd version-up dry-run --current ${shellQuote(input.currentVersion)}`,
    `--target ${shellQuote(input.targetVersion)}`,
    input.releaseRemoteUrl ? `--release-remote ${shellQuote(input.releaseRemoteUrl)}` : null,
    "--json",
  ]
    .filter((part): part is string => part !== null)
    .join(" ");
  const releaseTagExists = input.releaseTagExists ?? false;
  const releaseTriggerResolved = Boolean(target && releaseTagExists);
  const blockedReasons: string[] = [];
  if (!current || !target) {
    blockedReasons.push("current and target versions must be SemVer");
  } else if (semverChange === "same") {
    blockedReasons.push("target version must differ from current version");
  } else if (semverChange === "downgrade") {
    blockedReasons.push("target version must be greater than current version");
  }
  if (target && !releaseTriggerResolved) {
    blockedReasons.push("target release tag must exist before activation");
  }

  return {
    schemaVersion: "version-up-dry-run-plan.v1",
    currentVersion: input.currentVersion,
    targetVersion: input.targetVersion,
    normalizedCurrent: current?.normalized ?? null,
    normalizedTarget: target?.normalized ?? null,
    semverChange,
    releaseTrigger: input.releaseTrigger ?? `GitHub release tag ${input.targetVersion}`,
    releaseTagRef,
    releaseTagSource,
    releaseTagCheckCommand,
    releaseTagExists,
    releaseTriggerResolved,
    planOnly: true,
    mustNotApply: true,
    applyCommandAvailable: false,
    ok: blockedReasons.length === 0,
    blockedReasons,
    migrationPlan: [
      {
        step: "compare_current_target",
        command: dryRunCommand,
        requiredEvidence: "semver_diff",
      },
      {
        step: "project_setup_dry_run",
        command: "ut-tdd setup project --dry-run --json",
        requiredEvidence: "setup_import_report_and_identifier_transition",
      },
      {
        step: "activation_packet_review",
        command: VERSION_UP_ACTIVATION_PACKET_COMMAND,
        requiredEvidence: "activation_decision_record_and_parked_review_record",
      },
      {
        step: "doctor_rebuild",
        command: "ut-tdd db rebuild && ut-tdd doctor",
        requiredEvidence: "doctor_green_before_tag_or_release_update",
      },
    ],
    rollbackPlan: [
      {
        step: "restore_previous_tag",
        command: `git switch ${input.currentVersion}`,
        requiredEvidence: "previous_tag_or_branch_exists",
      },
      {
        step: "restore_harness_state",
        command: "restore .ut-tdd state backup captured before upgrade apply",
        requiredEvidence: "state_backup_manifest",
      },
      {
        step: "rebuild_projection_after_rollback",
        command: "ut-tdd db rebuild && ut-tdd doctor",
        requiredEvidence: "post_rollback_doctor_green",
      },
    ],
    idempotencyChecks: [
      {
        check: "repeat_dry_run_has_no_state_change",
        command: dryRunCommand,
        expected: "same normalizedCurrent/normalizedTarget/semverChange and no file writes",
      },
      {
        check: "setup_project_dry_run_is_non_destructive",
        command: "ut-tdd setup project --dry-run --json",
        expected: "writtenPaths empty in importReport and no remote apply",
      },
    ],
    releaseGateChecks: [
      {
        check: "release_tag_exists",
        command: releaseTagCheckCommand,
        requiredEvidence: releaseTriggerResolved
          ? "target release tag resolved before activation"
          : "target release tag is missing; keep activation blocked",
      },
      {
        check: "required_checks_green",
        command: "ut-tdd status --json",
        requiredEvidence: "completion decision packet has no unreviewed regression gate",
      },
      {
        check: "merge_queue_or_ruleset_gate_preserved",
        command: "ut-tdd doctor",
        requiredEvidence: "ruleset/merge readiness gates remain green",
      },
    ],
    sourceBasis: [
      {
        name: "Semantic Versioning 2.0.0",
        url: "https://semver.org/",
        versionUpUse: "classify current/target compatibility intent and reject non-SemVer targets",
      },
      {
        name: "GitHub Releases",
        url: "https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository",
        versionUpUse: "treat release tags as activation triggers and rollback anchors",
      },
      {
        name: "GitHub Rulesets",
        url: "https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets",
        versionUpUse: "preserve required checks and bypass audit before release/tag activation",
      },
      {
        name: "GitHub Merge Queue",
        url: "https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/managing-a-merge-queue",
        versionUpUse: "verify merge readiness before release candidate promotion",
      },
    ],
  };
}

export function buildVersionUpActivationPacket(
  plan: VersionUpReadinessPlan,
  sourceLedgerFreshness: VersionUpSourceLedgerFreshness = buildVersionUpSourceLedgerFreshness("", {
    columns: [],
    rows: [],
  }),
  options: {
    semanticFeatureFrontierRecords?: SemanticFeatureFrontierRecord[];
    repoHeadSha?: string | null;
    currentVersion?: string | null;
  } = {},
): VersionUpActivationPacket {
  const repoHeadSha = options.repoHeadSha ?? null;
  const activationDecision = recordValues(plan.text, ACTIVATION_RECORD_NAME, [
    ...ACTIVATION_RECORD_FIELDS,
  ]);
  const parkedReview = recordValues(plan.text, PARKED_REVIEW_RECORD_NAME, [
    ...PARKED_REVIEW_RECORD_FIELDS,
  ]);
  const actionBindingApproval = recordValues(plan.text, ACTION_BINDING_RECORD_NAME, [
    ...ACTION_BINDING_RECORD_FIELDS,
  ]);
  const externalRehearsal = recordValues(plan.text, EXTERNAL_REHEARSAL_RECORD_NAME, [
    ...EXTERNAL_REHEARSAL_RECORD_FIELDS,
  ]);
  const costGuardrails = recordValues(plan.text, COST_GUARDRAIL_RECORD_NAME, [
    ...COST_GUARDRAIL_RECORD_FIELDS,
  ]);
  const provenance = recordValues(plan.text, PROVENANCE_RECORD_NAME, [...PROVENANCE_RECORD_FIELDS]);
  const externalRehearsalPlan: VersionUpActivationPacket["externalRehearsalPlan"] = [
    {
      check: "official_source_basis",
      evidence: externalRehearsal.official_source_basis,
      source: "Version-up source ledger and official provider documentation",
      ...VERSION_UP_SOURCE_METADATA.sourceLedger,
    },
    {
      check: "free_tier_budget_check",
      evidence: externalRehearsal.free_tier_budget_check,
      source: "Cloudflare Pages/Workers/D1/KV official limits",
      ...VERSION_UP_SOURCE_METADATA.cloudflareWorkers,
    },
    {
      check: "webhook_signature_check",
      evidence: externalRehearsal.webhook_signature_check,
      source: "GitHub X-Hub-Signature-256 webhook validation",
      ...VERSION_UP_SOURCE_METADATA.githubWebhookHmac,
    },
    {
      check: "access_control_check",
      evidence: externalRehearsal.access_control_check,
      source: "Cloudflare Access policy testing",
      ...VERSION_UP_SOURCE_METADATA.cloudflareAccess,
    },
    {
      check: "no_secret_pii_check",
      evidence: externalRehearsal.no_secret_pii_check,
      source: "projection no-secret/no-PII invariant",
      ...VERSION_UP_SOURCE_METADATA.localInvariant,
    },
    {
      check: "no_prod_write_check",
      evidence: externalRehearsal.no_prod_write_check,
      source: "dry-run projection and no-production-write rehearsal",
      ...VERSION_UP_SOURCE_METADATA.localInvariant,
    },
    {
      check: "rollback_rehearsal",
      evidence: externalRehearsal.rollback_rehearsal,
      source: "version-up rollback plan",
      ...VERSION_UP_SOURCE_METADATA.rollbackPlan,
    },
  ];
  const costGuardrailRows: VersionUpActivationPacket["costGuardrails"] = [
    {
      surface: "Cloudflare Pages",
      freeLimit: costGuardrails.pages_limit,
      activationImpact: "static SPA must remain inside Pages Free deploy/file limits",
      source: "Cloudflare Pages limits",
      ...VERSION_UP_SOURCE_METADATA.cloudflarePages,
    },
    {
      surface: "Cloudflare Workers",
      freeLimit: costGuardrails.workers_limit,
      activationImpact: "read API and Pages Functions requests share Workers Free daily quota",
      source: "Cloudflare Workers limits",
      ...VERSION_UP_SOURCE_METADATA.cloudflareWorkers,
    },
    {
      surface: "Cloudflare D1",
      freeLimit: costGuardrails.d1_limit,
      activationImpact: "projection DB must fit Free storage/query constraints before activation",
      source: "Cloudflare D1 limits",
      ...VERSION_UP_SOURCE_METADATA.cloudflareD1,
    },
    {
      surface: "Cloudflare Workers KV",
      freeLimit: costGuardrails.kv_limit,
      activationImpact: "projection cache/write rate must stay inside KV Free limits",
      source: "Cloudflare Workers KV limits",
      ...VERSION_UP_SOURCE_METADATA.cloudflareKv,
    },
  ];
  const externalBoundaries = EXTERNAL_BOUNDARY_TERMS.filter((term) =>
    plan.text.toLowerCase().includes(term.toLowerCase()),
  );
  const activationReadinessChecks = buildActivationReadinessChecks(externalBoundaries, {
    externalRehearsal,
    costGuardrails,
    provenance,
  });
  const activationReadinessSummary = buildActivationReadinessSummary(
    externalBoundaries,
    activationReadinessChecks,
    sourceLedgerFreshness,
  );
  const recordBlockers = [
    "version_up_parked",
    ...(externalBoundaries.length > 0 || planTextRequiresActionBindingApproval(plan.text)
      ? ["human_approval_pending"]
      : []),
  ];
  const activationVerificationCommandMatrix = buildVersionUpActivationVerificationCommandMatrix(
    plan,
    options.currentVersion ?? "0.1.0",
  );
  const versionDryRunEvidence = buildVersionUpActivationDryRunEvidence(
    plan,
    options.currentVersion ?? "0.1.0",
  );
  const reapprovalTriggers = buildVersionUpActivationReapprovalTriggers();
  const activationSnapshot = buildVersionUpActivationSnapshot({
    plan,
    activationDecision,
    actionBindingApproval,
    externalRehearsal,
    provenance,
    versionDryRunEvidence,
    activationVerificationCommandMatrix,
    sourceLedgerFreshness,
    reapprovalTriggers,
    repoHeadSha,
    costGuardrails,
    externalRehearsalPlan,
    costGuardrailRows,
    activationReadinessChecks,
  });
  const blockedReasons = [
    ...blockedActivationReasons({
      plan,
      activationDecision,
      actionBindingApproval,
      externalBoundaries,
      currentActivationSnapshotId: activationSnapshot.snapshotId,
    }),
    ...(repoHeadSha ? [] : ["activation snapshot is not bound to a readable git HEAD sha"]),
    ...activationReadinessBlockedReasons(activationReadinessChecks),
    ...sourceLedgerActivationBlockedReasons(sourceLedgerFreshness),
  ];
  const packetProvenance = buildDecisionPacketProvenance({
    sourceCommand: VERSION_UP_ACTIVATION_PACKET_COMMAND,
  });

  return {
    schemaVersion: "version-up-activation-packet.v1",
    planId: plan.plan_id,
    generatedAt: packetProvenance.generatedAt,
    sourceCommand: VERSION_UP_ACTIVATION_PACKET_COMMAND,
    freshness: packetProvenance.freshness,
    versionTarget: plan.versionTarget,
    status:
      plan.versionTarget === null ? "invalid_not_parked" : "parked_pending_activation_decision",
    planOnly: true,
    mustNotApply: true,
    applyCommandAvailable: false,
    activationAllowed: false,
    allowedOutcomes: [...ACTIVATION_ALLOWED_OUTCOMES],
    semanticFeatureFrontierRecord: semanticFrontierBindingForPlan(
      options.semanticFeatureFrontierRecords,
      {
        planId: plan.plan_id,
        classification: "parked_future_version",
      },
    ),
    activationDecision,
    parkedReview,
    actionBindingApproval,
    recordTemplates: recordTemplatesForRecords(requiredRecordsForBlockers(recordBlockers)),
    externalBoundaries,
    externalRehearsalPlan,
    costGuardrails: costGuardrailRows,
    provenanceRequirements: [
      {
        item: "source_ledger",
        evidence: provenance.source_ledger,
      },
      {
        item: "dry_run_evidence",
        evidence: provenance.dry_run_evidence,
      },
      {
        item: "approval_evidence",
        evidence: provenance.approval_evidence,
      },
      {
        item: "audit_record",
        evidence: provenance.audit_record,
      },
    ],
    sourceLedgerFreshness,
    activationReadinessSummary,
    activationReadinessChecks,
    versionDryRunEvidence,
    activationVerificationCommandMatrix,
    reapprovalTriggers,
    activationSnapshot,
    securityChecklistPacket: {
      schemaVersion: "version-up-security-checklist.v1",
      planId: plan.plan_id,
      planOnly: true,
      mustNotApply: true,
      writePolicy: "no-write",
      sourceCommand: `ut-tdd version-up security-checklist --plan ${plan.plan_id} --no-write --json`,
      activationSnapshot,
      securityChecks: buildVersionUpSecurityChecks(),
      blockedUntil: [
        "securityChecks have concrete evidence paths, audit ids, or reports",
        "external_rehearsal_plan and activation_provenance_requirements cite the same evidence",
        "activation remains approval-gated and no production write is performed by this packet",
      ],
    },
    relatedDecisionPackets: uniqueRelatedDecisionPackets([
      relatedDecisionPacket({
        command: VERSION_UP_ACTIVATION_PACKET_COMMAND,
        scopedCommand: `${VERSION_UP_ACTIVATION_PACKET_COMMAND} --plan ${plan.plan_id}`,
        role: "primary",
        reason: "version_target parked PLAN remains pending activation decision",
        route:
          "record activation_decision_record and parked_review_record before activation, rejection, or continued parking",
      }),
      ...(externalBoundaries.length > 0 || planTextRequiresActionBindingApproval(plan.text)
        ? [
            relatedDecisionPacket({
              command: ACTION_BINDING_APPROVAL_PACKET_COMMAND,
              scopedCommand: `${ACTION_BINDING_APPROVAL_PACKET_COMMAND} --plan ${plan.plan_id}`,
              role: "supporting",
              reason:
                "activation touches an external/high-impact boundary that requires action-binding approval",
              route:
                "record action_binding_approval_record before external activation or secret/infra/auth changes",
            }),
          ]
        : []),
    ]),
    blockedReasons,
    nextWorkflowRoutes: [
      {
        outcome: "activate_future_version",
        route:
          "route through add-feature with a concrete PLAN/L2-L7/docs target before any external activation",
      },
      {
        outcome: "reject_or_archive",
        route:
          "record archive/rejection rationale and remove from active parked completion blocker",
      },
      {
        outcome: "keep_parked_with_review_date",
        route: "record review_by date or trigger-bound owner and keep completion blocked",
      },
    ],
  };
}

export function buildVersionUpActivationRehearsalPacket(
  packet: VersionUpActivationPacket,
): VersionUpActivationRehearsalPacket {
  return {
    schemaVersion: "version-up-activation-rehearsal.v1",
    planId: packet.planId,
    planOnly: true,
    mustNotApply: true,
    writePolicy: "no-write",
    sourceCommand: `ut-tdd version-up rehearsal --plan ${packet.planId} --no-write --json`,
    activationSnapshot: packet.activationSnapshot,
    externalRehearsalPlan: packet.externalRehearsalPlan,
    costGuardrails: packet.costGuardrails,
    provenanceRequirements: packet.provenanceRequirements,
    activationReadinessChecks: packet.activationReadinessChecks,
    blockedUntil: [
      "all activationReadinessChecks are concrete evidence, not prose-only requirements",
      "action_binding_approval_record cites the current activationSnapshot.snapshotId",
      "activation remains plan-only until PO/human approval and add-feature Forward route are recorded",
    ],
  };
}

export function buildVersionUpSecurityChecklistPacket(
  packet: VersionUpActivationPacket,
): VersionUpSecurityChecklistPacket {
  return packet.securityChecklistPacket;
}

function buildVersionUpSecurityChecks(): VersionUpSecurityChecklistPacket["securityChecks"] {
  return [
    {
      check: "github-actions-least-privilege",
      source: "GitHub Actions secure use",
      ...VERSION_UP_SOURCE_METADATA.githubActionsSecurity,
      requiredEvidence:
        "workflow permissions are least-privilege and GITHUB_TOKEN write permissions are not granted by default",
    },
    {
      check: "pull-request-target-risk-review",
      source: "GitHub Actions secure use",
      ...VERSION_UP_SOURCE_METADATA.githubActionsPullRequestTarget,
      requiredEvidence:
        "activation workflow does not run untrusted pull_request_target code with secrets or write token",
    },
    {
      check: "webhook-hmac-sha256",
      source: "GitHub webhook HMAC SHA-256",
      ...VERSION_UP_SOURCE_METADATA.githubWebhookHmac,
      requiredEvidence: "staging webhook validates X-Hub-Signature-256 before projection update",
    },
    {
      check: "github-environments-availability",
      source: "GitHub Environments required reviewers",
      ...VERSION_UP_SOURCE_METADATA.githubEnvironments,
      requiredEvidence:
        "repository visibility, account/org plan, required reviewers, prevent self-review, and environment secrets availability are recorded before relying on GitHub Environments as the approval gate",
    },
    {
      check: "access-control-and-secret-exposure",
      source: "OWASP Web Security Testing Guide",
      ...VERSION_UP_SOURCE_METADATA.owaspWstg,
      requiredEvidence:
        "OWASP-aligned access-control, secret/PII exclusion, and read-only projection checks produce a report or audit id",
    },
  ];
}

export function versionUpSecurityChecklistSourceViolations(
  packet: VersionUpSecurityChecklistPacket,
): VersionUpActivationCommandViolation[] {
  return packet.securityChecks.flatMap((row) =>
    verificationSourceMetadataViolations({
      subject: `${packet.planId}.securityChecks.${row.check}`,
      matrixName: "securityChecks",
      row,
    }),
  );
}

export function versionUpActivationVerificationCommandViolations(
  packet: VersionUpActivationPacket,
): VersionUpActivationCommandViolation[] {
  const allowedNoWriteCommands = new Set([
    `bun run src/cli.ts version-up activation-packet --plan ${packet.planId} --json`,
    `bun run src/cli.ts version-up rehearsal --plan ${packet.planId} --no-write --json`,
    `bun run src/cli.ts version-up security-checklist --plan ${packet.planId} --no-write --json`,
    "bun test tests/version-up-readiness.test.ts tests/cli-surface.test.ts",
    "bun run lint && bun run typecheck && git diff --check",
    "bun run test",
    `bun run src/cli.ts action-binding approval-packet --plan ${packet.planId} --json`,
  ]);
  const allowedStateWriteCommands = new Set([
    "bun run src/cli.ts db rebuild && bun run src/cli.ts doctor",
  ]);
  const externalRehearsalViolations = packet.externalRehearsalPlan.flatMap((row) =>
    verificationSourceMetadataViolations({
      subject: `${packet.planId}.externalRehearsalPlan.${row.check}`,
      matrixName: "externalRehearsalPlan",
      row,
    }),
  );
  const costGuardrailViolations = packet.costGuardrails.flatMap((row) =>
    verificationSourceMetadataViolations({
      subject: `${packet.planId}.costGuardrails.${row.surface}`,
      matrixName: "costGuardrails",
      row,
    }),
  );
  const securityChecklistViolations = versionUpSecurityChecklistSourceViolations(
    buildVersionUpSecurityChecklistPacket(packet),
  );
  const commandMatrixViolations = packet.activationVerificationCommandMatrix.flatMap((row) => {
    const violations: VersionUpActivationCommandViolation[] = [];
    const command = row.command.trim();
    if (row.phase === "version-dry-run" && isApprovedVersionDryRunCommand(command)) {
      violations.push(...versionUpActivationWritePolicyViolations(packet.planId, row, command));
      violations.push(
        ...verificationSourceMetadataViolations({
          subject: `${packet.planId}.${row.phase}`,
          matrixName: "activationVerificationCommandMatrix",
          row,
        }),
      );
      return violations;
    }
    const allowedForPolicy =
      (row.writePolicy === "no-write" && allowedNoWriteCommands.has(command)) ||
      (row.writePolicy === "state-write" && allowedStateWriteCommands.has(command));
    if (!allowedForPolicy) {
      violations.push({
        subject: `${packet.planId}.${row.phase}`,
        reason: `activationVerificationCommandMatrix command is not an executable approved surface for its writePolicy: ${row.command}`,
      });
    }
    violations.push(...versionUpActivationWritePolicyViolations(packet.planId, row, command));
    violations.push(
      ...verificationSourceMetadataViolations({
        subject: `${packet.planId}.${row.phase}`,
        matrixName: "activationVerificationCommandMatrix",
        row,
      }),
    );
    return violations;
  });
  return [
    ...externalRehearsalViolations,
    ...costGuardrailViolations,
    ...securityChecklistViolations,
    ...commandMatrixViolations,
  ];
}

function isApprovedVersionDryRunCommand(command: string): boolean {
  const arg = String.raw`(?:\S+|'(?:'\\''|[^'])*')`;
  return new RegExp(
    String.raw`^bun run src/cli\.ts version-up dry-run --current ${arg} --target ${arg} --json$`,
  ).test(command);
}

function versionUpActivationWritePolicyViolations(
  planId: string,
  row: VersionUpActivationPacket["activationVerificationCommandMatrix"][number],
  command: string,
): VersionUpActivationCommandViolation[] {
  const violations: VersionUpActivationCommandViolation[] = [];
  if (row.writePolicy === "no-write" && commandWritesLocalStateOrArtifacts(command)) {
    violations.push({
      subject: `${planId}.${row.phase}`,
      reason: `activationVerificationCommandMatrix no-write command may write local state or artifacts: ${row.command}`,
    });
  }
  if (row.writePolicy === "state-write" && !command.includes("db rebuild")) {
    violations.push({
      subject: `${planId}.${row.phase}`,
      reason: `activationVerificationCommandMatrix state-write command must be explicit about state rebuild: ${row.command}`,
    });
  }
  return violations;
}

function commandWritesLocalStateOrArtifacts(command: string): boolean {
  return /\b(bun run build|bun build|db rebuild|--outfile|>\s*|tee\b)\b/.test(command);
}

function buildVersionUpActivationSnapshot(input: {
  plan: VersionUpReadinessPlan;
  activationDecision: Record<string, string>;
  actionBindingApproval: Record<string, string>;
  externalRehearsal: Record<string, string>;
  provenance: Record<string, string>;
  versionDryRunEvidence: VersionUpActivationDryRunEvidence;
  activationVerificationCommandMatrix: VersionUpActivationPacket["activationVerificationCommandMatrix"];
  sourceLedgerFreshness: VersionUpSourceLedgerFreshness;
  reapprovalTriggers: VersionUpActivationReapprovalTrigger[];
  repoHeadSha: string | null;
  costGuardrails: Record<string, string>;
  externalRehearsalPlan: VersionUpActivationPacket["externalRehearsalPlan"];
  costGuardrailRows: VersionUpActivationPacket["costGuardrails"];
  activationReadinessChecks: VersionUpActivationReadinessCheck[];
}): VersionUpActivationSnapshot {
  const releaseTrigger =
    input.activationDecision.target_version_or_release_trigger || input.plan.versionTarget || "";
  const planTextDigest = sha256Json({
    file: input.plan.file,
    plan_id: input.plan.plan_id,
    text: snapshotMaterialText(input.plan.text),
  });
  const approvalScopeDigest = sha256Json({
    approval_scope: input.actionBindingApproval.approval_scope ?? "",
    approved_actor: input.actionBindingApproval.approved_actor ?? "",
    approved_tool: input.actionBindingApproval.approved_tool ?? "",
    approved_target: input.actionBindingApproval.approved_target ?? "",
    approved_params: input.actionBindingApproval.approved_params ?? "",
  });
  const evidenceDigest = sha256Json({
    external_rehearsal_plan: input.externalRehearsal,
    external_rehearsal_packet_rows: input.externalRehearsalPlan,
    cost_guardrails: input.costGuardrails,
    cost_guardrail_packet_rows: input.costGuardrailRows,
    activation_readiness_checks: input.activationReadinessChecks.map((check) => ({
      check: check.check,
      status: check.status,
      evidence: check.evidence,
      reason: check.reason,
    })),
    activation_provenance_requirements: input.provenance,
    version_dry_run_evidence: input.versionDryRunEvidence,
    activation_verification_command_matrix: input.activationVerificationCommandMatrix,
    source_ledger_checked_date: input.sourceLedgerFreshness.checkedDate,
    source_ledger_missing_rows: input.sourceLedgerFreshness.missingRows,
    source_ledger_rows_digest: input.sourceLedgerFreshness.rowsDigest,
  });
  const snapshot = {
    headSha: input.repoHeadSha,
    headBound: input.repoHeadSha !== null,
    materialBound: true,
    validationStatus: input.repoHeadSha === null ? "head_unavailable" : "head_bound",
    releaseTrigger,
    versionTarget: input.plan.versionTarget,
    planStatus: input.plan.status,
    planTextDigest,
    sourceLedgerCheckedDate: input.sourceLedgerFreshness.checkedDate,
    sourceLedgerRowsDigest: input.sourceLedgerFreshness.rowsDigest,
    approvalScopeDigest,
    versionDryRunDigest: input.versionDryRunEvidence.digest,
    evidenceDigest,
    invalidatedBy: input.reapprovalTriggers.map((trigger) => trigger.trigger),
  } satisfies Omit<VersionUpActivationSnapshot, "snapshotId">;
  return {
    snapshotId: sha256Json({
      plan_id: input.plan.plan_id,
      ...snapshot,
    }),
    ...snapshot,
  };
}

function snapshotMaterialText(text: string): string {
  return text
    .split("\n")
    .map((line) => {
      if (/^\s*-\s+activation_snapshot_id\s*:/.test(line)) {
        return line.replace(/:\s*.*/, ": <activationSnapshot.snapshotId>");
      }
      if (/^\s*-\s+reviewed_snapshot_binding\s*:/.test(line)) {
        return line.replace(/:\s*.*/, ": <activationSnapshot.snapshotId>");
      }
      return line;
    })
    .join("\n");
}

function sha256Json(value: unknown): string {
  return `sha256:${createHash("sha256").update(JSON.stringify(value)).digest("hex")}`;
}

function buildVersionUpActivationDryRunEvidence(
  plan: VersionUpReadinessPlan,
  currentVersion: string,
): VersionUpActivationDryRunEvidence {
  const targetVersion = versionUpDryRunTarget(plan);
  const dryRunPlan = buildVersionUpgradeDryRunPlan({ currentVersion, targetVersion });
  return {
    command: buildVersionUpDryRunReviewCommand(currentVersion, targetVersion),
    planCommand:
      dryRunPlan.migrationPlan.find((step) => step.step === "compare_current_target")?.command ??
      `ut-tdd version-up dry-run --current ${shellQuote(currentVersion)} --target ${shellQuote(targetVersion)} --json`,
    digest: sha256Json(dryRunPlan),
    ok: dryRunPlan.ok,
    semverChange: dryRunPlan.semverChange,
    releaseTagRef: dryRunPlan.releaseTagRef,
    releaseTagSource: dryRunPlan.releaseTagSource,
    releaseTagExists: dryRunPlan.releaseTagExists,
    releaseTriggerResolved: dryRunPlan.releaseTriggerResolved,
    blockedReasons: dryRunPlan.blockedReasons,
  };
}

function buildVersionUpDryRunReviewCommand(currentVersion: string, targetVersion: string): string {
  return `bun run src/cli.ts version-up dry-run --current ${shellQuote(currentVersion)} --target ${shellQuote(targetVersion)} --json`;
}

function shellQuote(value: string): string {
  if (/^[A-Za-z0-9_./:@+=,-]+$/.test(value)) return value;
  return `'${value.replace(/'/g, "'\\''")}'`;
}

function versionUpDryRunTarget(plan: VersionUpReadinessPlan): string {
  const trigger = recordFieldValue(
    plan.text,
    ACTIVATION_RECORD_NAME,
    "target_version_or_release_trigger",
  );
  const semver = trigger?.match(
    /\bv?\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?\b/,
  )?.[0];
  if (semver) return semver;
  return plan.versionTarget && plan.versionTarget !== "future" ? plan.versionTarget : "future";
}

function buildVersionUpActivationVerificationCommandMatrix(
  plan: VersionUpReadinessPlan,
  currentVersion: string,
): VersionUpActivationPacket["activationVerificationCommandMatrix"] {
  const dryRunTarget = versionUpDryRunTarget(plan);
  const dryRunTargetResolved = parseSemver(dryRunTarget) !== null;
  const dryRunCommand = buildVersionUpDryRunReviewCommand(currentVersion, dryRunTarget);
  return [
    {
      phase: "activation-packet-baseline",
      command: `bun run src/cli.ts version-up activation-packet --plan ${plan.plan_id} --json`,
      writePolicy: "no-write",
      expected:
        "captures current activationSnapshot, semantic frontier, readiness checks, blockers, and related decision packets",
      evidence: "activation packet JSON attached to the version-up activation review",
      source: "HELIX version-up activation packet contract",
      sourceUrl: "docs/process/modes/version-up.md",
      sourceCheckedAt: VERSION_UP_SOURCE_CHECKED_AT,
      latestOfficialStatus: "local HELIX workflow contract current at HEAD",
      sourceStatusDelta: "none; local version-up contract reviewed against current HEAD",
      adoptionDecision: "adopt-current-version-up-contract-for-plan-only-activation-review",
      adoptionDecisionDelta: "none; remains plan-only and approval-gated",
      workflowRouteImpact:
        "none; packet review remains version-up activation -> action-binding approval",
    },
    {
      phase: "version-dry-run",
      command: dryRunCommand,
      writePolicy: "no-write",
      expected: dryRunTargetResolved
        ? "returns migration, rollback, idempotency, release-gate, and source-basis evidence without apply authority"
        : "keeps version dry-run blocked until target_version_or_release_trigger contains a concrete SemVer tag",
      evidence: dryRunTargetResolved
        ? "version-up dry-run JSON for the reviewed current/target release trigger"
        : "version-up dry-run JSON showing target is not SemVer and activation remains parked",
      source: "Semantic Versioning 2.0.0",
      sourceUrl: "https://semver.org/",
      sourceCheckedAt: VERSION_UP_SOURCE_CHECKED_AT,
      latestOfficialStatus:
        "SemVer 2.0.0 official specification page remains the adopted compatibility contract",
      sourceStatusDelta: "none; SemVer 2.0.0 remains the current official compatibility source",
      adoptionDecision: "adopt-2.0.0-for-current-target-compatibility-classification",
      adoptionDecisionDelta: "none; continue using SemVer for dry-run classification only",
      workflowRouteImpact: "none; invalid, same, or downgrade target stays blocked in dry-run",
    },
    {
      phase: "external-rehearsal",
      command: `bun run src/cli.ts version-up rehearsal --plan ${plan.plan_id} --no-write --json`,
      writePolicy: "no-write",
      expected:
        "proves external activation is least-privilege, avoids unsafe pull_request_target execution, budgeted, signed, access-controlled, non-secret, non-PII, no-prod-write, and rollbackable",
      evidence:
        "artifact paths, audit ids, digests, logs, or reports referenced by external_rehearsal_plan",
      source: "GitHub Actions secure use and pull_request_target guidance",
      ...VERSION_UP_SOURCE_METADATA.githubActionsSecurity,
    },
    {
      phase: "security-testing",
      command: `bun run src/cli.ts version-up security-checklist --plan ${plan.plan_id} --no-write --json`,
      writePolicy: "no-write",
      expected:
        "security checks pass before any Cloudflare/GitHub/HMAC/access-control activation is approved",
      evidence:
        "security test report or audit record linked from activation_provenance_requirements",
      source: "OWASP Web Security Testing Guide",
      ...VERSION_UP_SOURCE_METADATA.owaspWstg,
    },
    {
      phase: "state-and-doctor",
      command: "bun run src/cli.ts db rebuild && bun run src/cli.ts doctor",
      writePolicy: "state-write",
      expected:
        "state projection and workflow gates remain green after activation rehearsal material is recorded",
      evidence: "db rebuild and doctor output",
      source: "HELIX state projection and doctor gate",
      sourceUrl: "docs/adr/ADR-007-harness-db-sqlite-projection.md",
      sourceCheckedAt: VERSION_UP_SOURCE_CHECKED_AT,
      latestOfficialStatus: "local HELIX state projection contract current at HEAD",
      sourceStatusDelta: "none; local state projection contract reviewed against current HEAD",
      adoptionDecision: "adopt-current-doctor-and-db-rebuild-as-state-convergence-gate",
      adoptionDecisionDelta: "none; keep db rebuild and doctor as activation review gates",
      workflowRouteImpact: "none; doctor failure routes back to version-up readiness repair",
    },
    {
      phase: "targeted-regression",
      command: "bun test tests/version-up-readiness.test.ts tests/cli-surface.test.ts",
      writePolicy: "no-write",
      expected: "version-up packet and CLI surface regressions stay green",
      evidence: "targeted vitest output",
      source: "HELIX version-up regression oracle",
      sourceUrl:
        "docs/test-design/harness/L7-unit-test-design.md#decision-record-and-completion-frontier",
      sourceCheckedAt: VERSION_UP_SOURCE_CHECKED_AT,
      latestOfficialStatus: "local HELIX L7 unit oracle current at HEAD",
      sourceStatusDelta: "none; local version-up regression oracle reviewed against current HEAD",
      adoptionDecision: "adopt-targeted-regression-before-activation-review",
      adoptionDecisionDelta: "none; keep targeted regression before activation review",
      workflowRouteImpact: "none; regression failure routes back to L7 repair",
    },
    {
      phase: "static-gates",
      command: "bun run lint && bun run typecheck && git diff --check",
      writePolicy: "no-write",
      expected: "format, type, and whitespace gates pass before activation approval",
      evidence: "lint/typecheck/diff-check command output",
      source: "HELIX repository static gate policy",
      sourceUrl: "AGENTS.md#test-rules",
      sourceCheckedAt: VERSION_UP_SOURCE_CHECKED_AT,
      latestOfficialStatus: "repository AGENTS test rules current at HEAD",
      sourceStatusDelta: "none; repository static gate policy reviewed against current HEAD",
      adoptionDecision: "adopt-static-gates-before-activation-review",
      adoptionDecisionDelta: "none; keep static gates before activation review",
      workflowRouteImpact: "none; static failure routes back to implementation repair",
    },
    {
      phase: "full-regression",
      command: "bun run test",
      writePolicy: "no-write",
      expected: "full repository regression suite passes before any future activation apply route",
      evidence: "full vitest output",
      source: "HELIX full regression policy",
      sourceUrl: "docs/test-design/harness/L7-unit-test-design.md",
      sourceCheckedAt: VERSION_UP_SOURCE_CHECKED_AT,
      latestOfficialStatus: "local HELIX full regression policy current at HEAD",
      sourceStatusDelta: "none; local full regression policy reviewed against current HEAD",
      adoptionDecision: "adopt-full-regression-before-any-future-activation-apply-route",
      adoptionDecisionDelta: "none; keep full regression as future activation blocker",
      workflowRouteImpact: "none; full regression failure blocks activation review",
    },
    {
      phase: "approval-packet",
      command: `bun run src/cli.ts action-binding approval-packet --plan ${plan.plan_id} --json`,
      writePolicy: "no-write",
      expected:
        "approved actor/tool/target/params and reviewed_snapshot_binding cite the current activationSnapshot before activation",
      evidence: "action-binding approval packet JSON",
      source: "GitHub Environments required reviewers",
      sourceUrl:
        "https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments",
      sourceCheckedAt: VERSION_UP_SOURCE_CHECKED_AT,
      latestOfficialStatus:
        "GitHub environments required reviewers remain live official approval gate guidance with public/private repository and plan availability constraints",
      sourceStatusDelta:
        "availability constraints reviewed; Free/Pro/Team required reviewers are public-repository gated, so private/internal activation must record an equivalent approved boundary before relying on environments",
      adoptionDecision:
        "adopt-required-reviewer-boundary-only-after-repo-visibility-plan-and-prevent-self-review-check",
      adoptionDecisionDelta:
        "tighten approval packet review so GitHub Environments availability is evidence, not an assumption",
      workflowRouteImpact:
        "none; missing reviewed_snapshot_binding keeps action-binding approval pending",
    },
  ];
}

function buildVersionUpActivationReapprovalTriggers(): VersionUpActivationReapprovalTrigger[] {
  return [
    {
      trigger: "head_sha_or_release_trigger_drift",
      invalidates:
        "activation packet, dry-run evidence, and action-binding approval tied to the previous HEAD/release trigger",
      requiredAction:
        "re-run version-up dry-run, activation packet, db rebuild, doctor, and approval packet before any activation",
      source: "GitHub Actions concurrency + Google SRE release engineering",
    },
    {
      trigger: "approval_scope_or_params_drift",
      invalidates: "approved actor/tool/target/params/scope and any derived approval evidence",
      requiredAction:
        "record a new action_binding_approval_record or request_scope_reduction before execution",
      source: "GitHub Environments required reviewers + action-binding approval policy",
    },
    {
      trigger: "source_ledger_or_external_limit_drift",
      invalidates:
        "sourceLedgerFreshness, cost guardrails, external rehearsal assumptions, and activation route",
      requiredAction:
        "refresh source ledger with source_status_delta/adoption_decision_delta/workflow_route_impact and reroute if needed",
      source: "Version-up source ledger freshness policy",
    },
    {
      trigger: "rehearsal_or_rollback_evidence_drift",
      invalidates: "dry-run, rollback rehearsal, provenance, and audit evidence",
      requiredAction:
        "keep parked or rerun rehearsal until concrete evidence matches the approved HEAD/scope",
      source: "SLSA provenance + Google SRE rollback guidance",
    },
  ];
}

function buildActivationReadinessChecks(
  externalBoundaries: readonly string[],
  records: {
    externalRehearsal: Record<string, string>;
    costGuardrails: Record<string, string>;
    provenance: Record<string, string>;
  },
): VersionUpActivationReadinessCheck[] {
  if (externalBoundaries.length === 0) return [];
  return [...ACTIVATION_REHEARSAL_REQUIRED_EVIDENCE, ...COST_GUARDRAIL_RECORD_FIELDS].map(
    (check) => {
      const evidence =
        records.externalRehearsal[check] ??
        records.costGuardrails[check] ??
        records.provenance[check] ??
        "";
      const pending = activationEvidenceIsPending(evidence);
      return {
        check,
        status: pending ? "pending_evidence" : "present",
        evidence,
        reason: pending
          ? "external activation requires concrete rehearsal output before approval"
          : "concrete rehearsal evidence recorded",
      };
    },
  );
}

function buildActivationReadinessSummary(
  externalBoundaries: readonly string[],
  checks: readonly VersionUpActivationReadinessCheck[],
  sourceLedgerFreshness: VersionUpSourceLedgerFreshness,
): VersionUpActivationReadinessSummary {
  const pendingCheckNames = checks
    .filter((check) => check.status === "pending_evidence")
    .map((check) => check.check);
  if (sourceLedgerFreshness.stale || sourceLedgerFreshness.missingRows.length > 0) {
    pendingCheckNames.push("source_ledger_freshness");
  }
  const pendingChecks = pendingCheckNames.length;
  const totalChecks =
    checks.length +
    (sourceLedgerFreshness.checkedDate || sourceLedgerFreshness.missingRows.length > 0 ? 1 : 0);
  const presentChecks = Math.max(0, totalChecks - pendingChecks);

  if (externalBoundaries.length === 0 && totalChecks === 0) {
    return {
      status: "not_required",
      totalChecks: 0,
      presentChecks: 0,
      pendingChecks: 0,
      pendingCheckNames: [],
      sourceLedgerFresh: !sourceLedgerFreshness.stale,
      sourceLedgerViolation: sourceLedgerFreshness.violation,
      activationAllowed: false,
      reason: "no external activation readiness checklist is required for this parked PLAN",
    };
  }

  if (pendingChecks > 0) {
    return {
      status: "pending_evidence",
      totalChecks,
      presentChecks,
      pendingChecks,
      pendingCheckNames,
      sourceLedgerFresh: !sourceLedgerFreshness.stale,
      sourceLedgerViolation: sourceLedgerFreshness.violation,
      activationAllowed: false,
      reason:
        "activation review material is incomplete; activation remains plan-only and approval-gated",
    };
  }

  return {
    status: "ready_for_activation_review",
    totalChecks,
    presentChecks,
    pendingChecks: 0,
    pendingCheckNames: [],
    sourceLedgerFresh: true,
    sourceLedgerViolation: null,
    activationAllowed: false,
    reason:
      "activation review material is complete, but applying activation still requires the explicit human/action-binding decision route",
  };
}

function activationReadinessBlockedReasons(
  checks: readonly VersionUpActivationReadinessCheck[],
): string[] {
  return checks
    .filter((check) => check.status === "pending_evidence")
    .map((check) => `activation rehearsal evidence pending: ${check.check}`);
}

function activationEvidenceIsPending(evidence: string): boolean {
  const normalized = evidence.trim().toLowerCase();
  if (!normalized) return true;
  const isExplicitlyPending = [
    "<",
    "todo",
    "tbd",
    "must ",
    "must be",
    "must fit",
    "must validate",
    "must prove",
    "required before",
    "before activation",
    "before any",
    "not approved",
    "while parked",
    "no external activation",
    "are recorded",
    "is recorded",
    "will be",
    "should be",
    "planned",
    "pending",
  ].some((marker) => normalized.includes(marker));
  if (isExplicitlyPending) return true;
  return !hasConcreteActivationEvidence(evidence);
}

function hasConcreteActivationEvidence(evidence: string): boolean {
  const normalized = evidence.trim();
  return [
    /sha256:[a-f0-9]{64}/i,
    /\b[A-Z]{1,8}-\d{2,}\b/,
    /\b(run|workflow|job|artifact|audit|evidence|report|log)\s*(id|path|url)\s*[:=]\s*\S+/i,
    /\b(?:audit|run|workflow|job|artifact|report|log)-?(?:id|url|path)\s*[:=]\s*\S+/i,
    /\b(artifacts?|reports?|logs?|evidence|audit)\//i,
    /\b(\.ut-tdd|\.helix|docs|tests|src|dist|coverage|artifacts?|reports?|logs?)\/\S+/i,
    /\S+\.(json|log|txt|md|sarif|junit|xml|csv|db)\b/i,
  ].some((pattern) => pattern.test(normalized));
}

function selectedActivationOutcome(
  plan: VersionUpReadinessPlan,
): (typeof ACTIVATION_ALLOWED_OUTCOMES)[number] | null {
  const value = record(plan, ACTIVATION_RECORD_NAME, "allowed_outcome").trim().replace(/`/g, "");
  return ACTIVATION_ALLOWED_OUTCOMES.find((outcome) => value === outcome) ?? null;
}

function hasConcreteActivationSnapshotId(plan: VersionUpReadinessPlan): boolean {
  return (
    concreteSnapshotId(record(plan, ACTIVATION_RECORD_NAME, "activation_snapshot_id")) !== null
  );
}

function selectedActivationMaterialViolations(
  packet: VersionUpActivationPacket,
): VersionUpReadinessViolation[] {
  const violations: VersionUpReadinessViolation[] = [];
  const activationSnapshotId = concreteSnapshotId(
    packet.activationDecision.activation_snapshot_id ?? "",
  );
  const actionBinding = packet.actionBindingApproval;

  if (!packet.activationSnapshot.headBound) {
    violations.push({
      subject: packet.planId,
      reason: "activation material cannot be approved without HEAD-bound activationSnapshot",
    });
  }
  if (!activationSnapshotId) {
    violations.push({
      subject: packet.planId,
      reason:
        "activation_decision_record.activation_snapshot_id lacks concrete current activationSnapshot.snapshotId",
    });
  } else if (activationSnapshotId !== packet.activationSnapshot.snapshotId) {
    violations.push({
      subject: packet.planId,
      reason:
        "activation_decision_record.activation_snapshot_id does not match current activationSnapshot.snapshotId",
    });
  }
  if ((actionBinding.allowed_outcome ?? "").trim() !== "approve_action_binding") {
    violations.push({
      subject: packet.planId,
      reason: "action_binding_approval_record must select approve_action_binding before activation",
    });
  }
  for (const field of ["approved_actor", "approved_tool", "approved_target", "approved_params"]) {
    const value = actionBinding[field] ?? "";
    if (!concreteApprovalBindingValue(value)) {
      violations.push({
        subject: packet.planId,
        reason: `action_binding_approval_record lacks concrete ${field}`,
      });
    }
  }
  if (activationEvidenceIsPending(actionBinding.review_approval_evidence ?? "")) {
    violations.push({
      subject: packet.planId,
      reason: "action_binding_approval_record lacks concrete review_approval_evidence",
    });
  }
  const reviewedSnapshot = concreteSnapshotId(actionBinding.reviewed_snapshot_binding ?? "");
  if (!reviewedSnapshot) {
    violations.push({
      subject: packet.planId,
      reason:
        "action_binding_approval_record.reviewed_snapshot_binding lacks concrete current activationSnapshot.snapshotId",
    });
  } else if (reviewedSnapshot !== packet.activationSnapshot.snapshotId) {
    violations.push({
      subject: packet.planId,
      reason:
        "action_binding_approval_record.reviewed_snapshot_binding does not match current activationSnapshot.snapshotId",
    });
  }
  if (!concreteApprovalBindingValue(actionBinding.expires_at_or_trigger ?? "")) {
    violations.push({
      subject: packet.planId,
      reason: "action_binding_approval_record lacks concrete expires_at_or_trigger",
    });
  }
  if (activationEvidenceIsPending(actionBinding.audit_record ?? "")) {
    violations.push({
      subject: packet.planId,
      reason: "action_binding_approval_record lacks concrete audit_record",
    });
  }
  if (packet.activationReadinessSummary.status !== "ready_for_activation_review") {
    violations.push({
      subject: packet.planId,
      reason: `activationReadinessSummary must be ready_for_activation_review before activate_future_version; pending=${packet.activationReadinessSummary.pendingCheckNames.join(",") || "none"}`,
    });
  }

  return violations;
}

function concreteApprovalBindingValue(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  if (!normalized || normalized === "tbd" || normalized === "todo" || normalized === "-") {
    return false;
  }
  return ![
    "<",
    "no actor",
    "no deploy",
    "no external",
    "no activation",
    "not approved",
    "while parked",
    "must ",
    "must be",
    "before activation",
    "pending",
  ].some((marker) => normalized.includes(marker));
}

function validateParkedVersionUpSemantics(
  plan: VersionUpReadinessPlan,
): VersionUpReadinessViolation[] {
  const violations: VersionUpReadinessViolation[] = [];
  const activationRoute = record(plan, ACTIVATION_RECORD_NAME, "activation_route");
  const targetTrigger = record(plan, ACTIVATION_RECORD_NAME, "target_version_or_release_trigger");
  const reviewBy = record(plan, ACTIVATION_RECORD_NAME, "review_by");
  const reviewByPolicy = record(plan, PARKED_REVIEW_RECORD_NAME, "review_by_policy");
  const staleAction = record(plan, PARKED_REVIEW_RECORD_NAME, "stale_action");
  const activationDependency = record(plan, PARKED_REVIEW_RECORD_NAME, "activation_dependency");
  const decisionPacketRoute = record(plan, PARKED_REVIEW_RECORD_NAME, "decision_packet_route");
  const combinedRoute = [
    activationRoute,
    targetTrigger,
    reviewBy,
    reviewByPolicy,
    staleAction,
    activationDependency,
    decisionPacketRoute,
  ].join("\n");

  if (!mentions(targetTrigger, ["release", "tag", "version", "trigger", "request", "次版"])) {
    violations.push({
      subject: plan.plan_id,
      reason: "version-up activation requires a concrete release/version/trigger",
    });
  }
  if (
    !mentions(activationRoute, ["add-feature"]) ||
    !mentionsConcreteActivationRoute(activationRoute)
  ) {
    violations.push({
      subject: plan.plan_id,
      reason:
        "activate_future_version requires an add-feature route with a concrete PLAN/L2-L7/docs target",
    });
  }
  if (!mentions(combinedRoute, ["reject_or_archive", "archive", "archived", "破棄"])) {
    violations.push({
      subject: plan.plan_id,
      reason: "reject_or_archive requires an archive/rejection route",
    });
  }
  if (!mentions(combinedRoute, ["keep_parked_with_review_date", "review date", "再確認日"])) {
    violations.push({
      subject: plan.plan_id,
      reason: "keep_parked_with_review_date requires a review-date route",
    });
  }
  if (!mentions(reviewByPolicy, ["trigger-bound"]) && !/\d{4}-\d{2}-\d{2}/.test(reviewByPolicy)) {
    violations.push({
      subject: plan.plan_id,
      reason: "parked review requires trigger-bound policy or explicit YYYY-MM-DD date",
    });
  }
  if (!mentions(decisionPacketRoute, ["completion", "status --json", "decision packet"])) {
    violations.push({
      subject: plan.plan_id,
      reason: "parked review must remain visible in completion/status decision packet",
    });
  }

  return violations;
}

function record(textPlan: VersionUpReadinessPlan, recordName: string, field: string): string {
  return recordFieldValue(textPlan.text, recordName, field) ?? "";
}

function recordValues(
  text: string,
  recordName: string,
  fields: readonly string[],
): Record<string, string> {
  return Object.fromEntries(
    fields.map((field) => [field, recordFieldValue(text, recordName, field) ?? ""]),
  );
}

function buildVersionUpSourceLedgerFreshness(
  modeDoc: string,
  sourceLedger: ReturnType<typeof parseVersionUpSourceLedger>,
): VersionUpSourceLedgerFreshness {
  const checkedDate =
    modeDoc.match(/Version-up source ledger \(checked (\d{4}-\d{2}-\d{2})\)/)?.[1] ?? null;
  const violation = sourceLedgerCheckedDateViolation(modeDoc, "Version-up source ledger");
  const missingRows = REQUIRED_SOURCE_LEDGER_ROWS.filter(
    (source) => !sourceLedger.rows.some((row) => row.source === source),
  );
  return {
    ledgerLabel: "Version-up source ledger",
    checkedDate,
    stale: violation !== null || missingRows.length > 0,
    violation,
    maxAgeDays: SOURCE_LEDGER_MAX_AGE_DAYS,
    rowCount: sourceLedger.rows.length,
    missingRows,
    rowsDigest: sha256Json(sourceLedger.rows),
  };
}

function sourceLedgerActivationBlockedReasons(freshness: VersionUpSourceLedgerFreshness): string[] {
  const reasons: string[] = [];
  if (freshness.violation) {
    reasons.push(`source ledger must be refreshed before activation: ${freshness.violation}`);
  }
  if (freshness.missingRows.length > 0) {
    reasons.push(`source ledger missing activation sources: ${freshness.missingRows.join(", ")}`);
  }
  return reasons;
}

function blockedActivationReasons(input: {
  plan: VersionUpReadinessPlan;
  activationDecision: Record<string, string>;
  actionBindingApproval: Record<string, string>;
  externalBoundaries: readonly string[];
  currentActivationSnapshotId: string;
}): string[] {
  const reasons: string[] = [];
  const { plan, activationDecision, actionBindingApproval, externalBoundaries } = input;
  if (plan.versionTarget !== null) {
    reasons.push("plan remains version_target parked; activation decision has not been executed");
  } else {
    reasons.push("plan is not a version-up parked plan");
  }
  const activationSnapshotId = concreteSnapshotId(activationDecision.activation_snapshot_id ?? "");
  if (!activationSnapshotId) {
    reasons.push(
      "activation_decision_record.activation_snapshot_id lacks concrete current activationSnapshot.snapshotId",
    );
  } else if (activationSnapshotId !== input.currentActivationSnapshotId) {
    reasons.push(
      "activation_decision_record.activation_snapshot_id does not match current activationSnapshot.snapshotId",
    );
  }
  if ((actionBindingApproval.allowed_outcome ?? "").trim() !== "approve_action_binding") {
    reasons.push("missing concrete approve_action_binding outcome");
  }
  for (const field of ["approved_actor", "approved_tool", "approved_target", "approved_params"]) {
    const value = actionBindingApproval[field] ?? "";
    if (!value || mentions(value, ["No ", "not approved", "while parked"])) {
      reasons.push(`action-binding approval lacks concrete ${field}`);
    }
  }
  if (externalBoundaries.length > 0) {
    reasons.push(
      `external activation boundary requires explicit approval: ${externalBoundaries.join(", ")}`,
    );
  }
  return [...new Set(reasons)];
}

function concreteSnapshotId(value: string): string | null {
  return value.match(/\bsha256:[a-f0-9]{64}\b/)?.[0] ?? null;
}

function mentions(value: string, needles: string[]): boolean {
  const normalized = value.toLowerCase();
  return needles.some((needle) => normalized.includes(needle.toLowerCase()));
}

function mentionsConcreteActivationRoute(value: string): boolean {
  return (
    /\bPLAN-(?:L|REVERSE|DISCOVERY)-[A-Za-z0-9-]+\b/.test(value) ||
    /\bL(?:2|3|4|5|6|7)\b/.test(value) ||
    /\bdocs\/(?:design|plans|process|test-design)\/\S+/.test(value)
  );
}

function parseSemver(value: string): {
  normalized: string;
  major: number;
  minor: number;
  patch: number;
  prerelease: string | null;
} | null {
  const match = value
    .trim()
    .match(
      /^v?(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/,
    );
  if (!match) return null;
  const [, major, minor, patch, prerelease] = match;
  if (
    prerelease
      ?.split(".")
      .some(
        (identifier) => /^\d+$/.test(identifier) && identifier.length > 1 && identifier[0] === "0",
      )
  ) {
    return null;
  }
  const normalized = `${major}.${minor}.${patch}${prerelease ? `-${prerelease}` : ""}`;
  return {
    normalized,
    major: Number(major),
    minor: Number(minor),
    patch: Number(patch),
    prerelease: prerelease ?? null,
  };
}

function classifySemverChange(
  current: ReturnType<typeof parseSemver>,
  target: ReturnType<typeof parseSemver>,
): VersionUpgradeDryRunPlan["semverChange"] {
  if (!current || !target) return "invalid";
  if (target.major !== current.major) return target.major > current.major ? "major" : "downgrade";
  if (target.minor !== current.minor) return target.minor > current.minor ? "minor" : "downgrade";
  if (target.patch !== current.patch) return target.patch > current.patch ? "patch" : "downgrade";
  if (target.prerelease !== current.prerelease) {
    if (current.prerelease && !target.prerelease) return "patch";
    if (!current.prerelease && target.prerelease) return "downgrade";
    return comparePrerelease(current.prerelease ?? "", target.prerelease ?? "") < 0
      ? "prerelease"
      : "downgrade";
  }
  return "same";
}

function comparePrerelease(current: string, target: string): number {
  const currentParts = current.split(".");
  const targetParts = target.split(".");
  for (let i = 0; i < Math.max(currentParts.length, targetParts.length); i++) {
    const a = currentParts[i];
    const b = targetParts[i];
    if (a === undefined) return -1;
    if (b === undefined) return 1;
    if (a === b) continue;
    const aNumeric = /^\d+$/.test(a);
    const bNumeric = /^\d+$/.test(b);
    if (aNumeric && bNumeric) return Number(a) - Number(b);
    if (aNumeric) return -1;
    if (bNumeric) return 1;
    return a < b ? -1 : 1;
  }
  return 0;
}

function parseVersionUpSourceLedger(text: string): {
  columns: string[];
  rows: Record<string, string>[];
} {
  const lines = text.split(/\r?\n/);
  const headingPattern = sourceLedgerHeadingPattern("Version-up source ledger");
  const headingIndex = lines.findIndex((line) => headingPattern.test(line));
  if (headingIndex < 0) {
    return { columns: [], rows: [] };
  }
  const tableLines: string[] = [];
  for (const line of lines.slice(headingIndex + 1)) {
    if (line.trim() === "") {
      if (tableLines.length === 0) {
        continue;
      }
      break;
    }
    if (!line.trim().startsWith("|")) {
      if (tableLines.length === 0) {
        continue;
      }
      break;
    }
    tableLines.push(line);
  }
  if (tableLines.length < 2) {
    return { columns: [], rows: [] };
  }
  const columns = tableCells(tableLines[0]);
  const rows = tableLines.slice(2).map((line) => {
    const rowCells = tableCells(line);
    return Object.fromEntries(columns.map((column, index) => [column, rowCells[index] ?? ""]));
  });
  return { columns, rows };
}

function tableCells(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim().replace(/^<(.+)>$/, "$1"));
}

export function versionUpReadinessMessages(result: VersionUpReadinessResult): string[] {
  if (result.ok) {
    const parked = result.parkedPlanIds.length > 0 ? result.parkedPlanIds.join(", ") : "none";
    return [`version-up-readiness - OK (parked=${result.parkedPlanIds.length}: ${parked})`];
  }
  const detail = result.violations
    .slice(0, 8)
    .map((v) => `${v.subject}:${v.reason}`)
    .join(", ");
  const more = result.violations.length > 8 ? ` (+${result.violations.length - 8} more)` : "";
  return [`version-up-readiness - violation: ${detail}${more}`];
}

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  allowedOutcomeSetViolation,
  fmValue,
  missingRecordFields,
  recordFieldValue,
} from "./shared";
import {
  sourceLedgerCheckedDateViolation,
  sourceLedgerHeadingPattern,
} from "./source-ledger-freshness";

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
  versionTarget: string | null;
  status: "parked_pending_activation_decision" | "invalid_not_parked";
  planOnly: true;
  mustNotApply: true;
  applyCommandAvailable: false;
  activationAllowed: false;
  allowedOutcomes: string[];
  activationDecision: Record<string, string>;
  parkedReview: Record<string, string>;
  actionBindingApproval: Record<string, string>;
  externalBoundaries: string[];
  externalRehearsalPlan: Array<{
    check: string;
    evidence: string;
    source: string;
  }>;
  costGuardrails: Array<{
    surface: string;
    freeLimit: string;
    activationImpact: string;
    source: string;
  }>;
  provenanceRequirements: Array<{
    item: string;
    evidence: string;
  }>;
  blockedReasons: string[];
  nextWorkflowRoutes: Array<{ outcome: string; route: string }>;
}

const MODE_DOC_MARKERS = [
  "deferred-but-committed-future",
  "status=draft",
  "version_target",
  "VERSION_UP_ALLOWED_TARGETS",
  "activation_decision_record",
  "allowed_outcome",
  "target_version_or_release_trigger",
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
  "Cloudflare Pages limits",
  "Cloudflare Workers limits",
  "Cloudflare D1 limits",
  "Cloudflare Workers KV limits",
  "Cloudflare Access policies",
  "GitHub webhook HMAC SHA-256",
  "external_rehearsal_plan",
  "cost_guardrails",
  "activation_provenance_requirements",
  "adopted version/date",
  "latest official status",
  "adoption decision",
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
  "activation_route",
  "review_by",
  "approval_scope",
  "dry_run_plan",
  "rollback_plan",
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
] as const;

function parsePlan(file: string, content: string): VersionUpReadinessPlan {
  return {
    file,
    plan_id: fmValue(content, "plan_id") ?? file.replace(/\.md$/, ""),
    status: fmValue(content, "status") ?? "unknown",
    versionTarget: fmValue(content, "version_target") ?? null,
    text: content,
  };
}

export function loadVersionUpReadinessInput(
  repoRoot: string = process.cwd(),
): VersionUpReadinessInput {
  const plansDir = join(repoRoot, "docs", "plans");
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

  const parked = input.plans.filter((p) => p.versionTarget !== null);
  for (const plan of parked) {
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
    const activationOutcomeViolation = allowedOutcomeSetViolation(
      plan.text,
      ACTIVATION_RECORD_NAME,
      ACTIVATION_ALLOWED_OUTCOMES,
    );
    if (activationOutcomeViolation) {
      violations.push({ subject: plan.plan_id, reason: activationOutcomeViolation });
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
  return input.plans
    .filter((plan) => plan.versionTarget !== null)
    .map((plan) => buildVersionUpActivationPacket(plan))
    .sort((a, b) => a.planId.localeCompare(b.planId));
}

export function buildVersionUpActivationPacket(
  plan: VersionUpReadinessPlan,
): VersionUpActivationPacket {
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
  const externalBoundaries = EXTERNAL_BOUNDARY_TERMS.filter((term) =>
    plan.text.toLowerCase().includes(term.toLowerCase()),
  );
  const blockedReasons = blockedActivationReasons(plan, actionBindingApproval, externalBoundaries);

  return {
    schemaVersion: "version-up-activation-packet.v1",
    planId: plan.plan_id,
    versionTarget: plan.versionTarget,
    status:
      plan.versionTarget === null ? "invalid_not_parked" : "parked_pending_activation_decision",
    planOnly: true,
    mustNotApply: true,
    applyCommandAvailable: false,
    activationAllowed: false,
    allowedOutcomes: [...ACTIVATION_ALLOWED_OUTCOMES],
    activationDecision,
    parkedReview,
    actionBindingApproval,
    externalBoundaries,
    externalRehearsalPlan: [
      {
        check: "free_tier_budget_check",
        evidence: externalRehearsal.free_tier_budget_check,
        source: "Cloudflare Pages/Workers/D1/KV official limits",
      },
      {
        check: "webhook_signature_check",
        evidence: externalRehearsal.webhook_signature_check,
        source: "GitHub X-Hub-Signature-256 webhook validation",
      },
      {
        check: "access_control_check",
        evidence: externalRehearsal.access_control_check,
        source: "Cloudflare Access policy testing",
      },
      {
        check: "no_secret_pii_check",
        evidence: externalRehearsal.no_secret_pii_check,
        source: "projection no-secret/no-PII invariant",
      },
      {
        check: "rollback_rehearsal",
        evidence: externalRehearsal.rollback_rehearsal,
        source: "version-up rollback plan",
      },
    ],
    costGuardrails: [
      {
        surface: "Cloudflare Pages",
        freeLimit: costGuardrails.pages_limit,
        activationImpact: "static SPA must remain inside Pages Free deploy/file limits",
        source: "Cloudflare Pages limits",
      },
      {
        surface: "Cloudflare Workers",
        freeLimit: costGuardrails.workers_limit,
        activationImpact: "read API and Pages Functions requests share Workers Free daily quota",
        source: "Cloudflare Workers limits",
      },
      {
        surface: "Cloudflare D1",
        freeLimit: costGuardrails.d1_limit,
        activationImpact: "projection DB must fit Free storage/query constraints before activation",
        source: "Cloudflare D1 limits",
      },
      {
        surface: "Cloudflare Workers KV",
        freeLimit: costGuardrails.kv_limit,
        activationImpact: "projection cache/write rate must stay inside KV Free limits",
        source: "Cloudflare Workers KV limits",
      },
    ],
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
    blockedReasons,
    nextWorkflowRoutes: [
      {
        outcome: "activate_future_version",
        route: "route through add-feature / Forward descent before any external activation",
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
  if (!mentions(activationRoute, ["add-feature"]) || !mentionsForwardLayer(activationRoute)) {
    violations.push({
      subject: plan.plan_id,
      reason: "activate_future_version requires an add-feature Forward route",
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

function blockedActivationReasons(
  plan: VersionUpReadinessPlan,
  actionBindingApproval: Record<string, string>,
  externalBoundaries: readonly string[],
): string[] {
  const reasons: string[] = [];
  if (plan.versionTarget !== null) {
    reasons.push("plan remains version_target parked; activation decision has not been executed");
  } else {
    reasons.push("plan is not a version-up parked plan");
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

function mentions(value: string, needles: string[]): boolean {
  const normalized = value.toLowerCase();
  return needles.some((needle) => normalized.includes(needle.toLowerCase()));
}

function mentionsForwardLayer(value: string): boolean {
  return /\bL(?:2|3|4|5|6|7)\b/.test(value) || mentions(value, ["Forward", "descent", "再降下"]);
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

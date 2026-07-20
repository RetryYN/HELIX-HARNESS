import { readFileSync } from "node:fs";
import { join } from "node:path";
import { recordTemplateContractViolations } from "./completion-decision-packet";
import {
  type CompletionDecisionRecordTemplate,
  computeOutstandingWork,
  recordTemplatesForRecords,
  requiredRecordsForBlockers,
  type SemanticFeatureFrontierRecord,
} from "./outstanding";
import { loadRequirementsDocRegistry } from "./requirements-doc-registry";
import {
  semanticFrontierBindingForPlan,
  semanticFrontierBindingViolations,
} from "./semantic-frontier-binding";
import {
  allowedOutcomeSetViolation,
  fmValue,
  loadPlanDocs,
  missingRecordFields,
  recordFieldValue,
  SOURCE_LEDGER_MEANING_REVIEW_FIELDS,
  selectedAllowedOutcomeViolation,
  sourceLedgerMeaningReviewFieldViolations,
} from "./shared";
import {
  hasSourceLedgerCheckedDate,
  sourceLedgerCheckedDate,
  sourceLedgerCheckedDateViolation,
  sourceLedgerHeadingPattern,
  verificationSourceMetadataViolations,
} from "./source-ledger-freshness";
import {
  ACTION_BINDING_APPROVAL_PACKET_COMMAND,
  buildDecisionPacketProvenance,
  type DecisionPacketFreshness,
  planTextRequiresActionBindingApproval,
  type RelatedDecisionPacket,
  relatedDecisionPacket,
  S4_DECISION_PACKET_COMMAND,
  uniqueRelatedDecisionPackets,
} from "./workflow-decision-packets";

export interface S4DecisionPlan {
  file: string;
  plan_id: string;
  kind: string;
  status: string;
  workflowPhase: string | null;
  decisionOutcome: string | null;
  text: string;
}

export interface S4DecisionReadinessInput {
  discoveryMd: string;
  scrumMd: string;
  outstandingTs: string;
  semanticFeatureFrontierRecords?: SemanticFeatureFrontierRecord[];
  plans: S4DecisionPlan[];
}

export interface S4DecisionViolation {
  subject: string;
  reason: string;
}

export interface S4DecisionReadinessResult {
  pendingPlanIds: string[];
  missingSourceLedgerRows: string[];
  sourceLedgerViolations: S4DecisionViolation[];
  violations: S4DecisionViolation[];
  ok: boolean;
}

export interface S4DecisionCommandViolation {
  subject: string;
  reason: string;
}

export interface S4DecisionPacket {
  schemaVersion: "s4-decision-packet.v1";
  planId: string;
  generatedAt: string;
  sourceCommand: typeof S4_DECISION_PACKET_COMMAND;
  freshness: DecisionPacketFreshness;
  status: "pending_po_decision" | "invalid_not_pending_s3";
  planOnly: true;
  mustNotDecide: true;
  decisionCommandAvailable: false;
  decisionAllowed: false;
  allowedOutcomes: string[];
  semanticFeatureFrontierRecord: SemanticFeatureFrontierRecord;
  decisionRecord: Record<string, string>;
  recordTemplates: CompletionDecisionRecordTemplate[];
  decisionEvidenceChecklist: Array<{
    field: string;
    evidence: string;
    decisionUse: string;
  }>;
  outcomeRouteMatrix: Array<{
    outcome: string;
    terminalStatus: string;
    routePolicy: string;
    requiredEvidence: string;
  }>;
  decisionVerificationCommandMatrix: Array<{
    phase: string;
    command: string;
    writePolicy: "no-write";
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
  provenanceRequirements: Array<{
    item: string;
    evidence: string;
  }>;
  relatedDecisionPackets: RelatedDecisionPacket[];
  blockedReasons: string[];
  nextWorkflowRoutes: Array<{ outcome: string; route: string }>;
}

const MODE_DOC_MARKERS = [
  "s4_decision_record",
  "allowed_outcome",
  "decision_owner",
  "decision_basis",
  "verified_evidence",
  "stakeholder_review_or_proxy",
  "acceptance_gap",
  "unresolved_risk",
  "external_source_basis",
  ...SOURCE_LEDGER_MEANING_REVIEW_FIELDS,
  "route_impact",
  "forward_route",
  "reverse_fullback_required",
  "promotion_strategy_or_rejection_pivot_rationale",
  "s4-decision-packet.v1",
  "planOnly=true",
  "decisionAllowed=false",
  "decisionEvidenceChecklist",
  "outcomeRouteMatrix",
  "decisionVerificationCommandMatrix",
  "executable verification command",
  "provenanceRequirements",
  "S4 decision source ledger",
  "Scrum Guide 2020",
  "ISO/IEC/IEEE 29148",
  "ISTQB Glossary",
  "NIST SSDF SP 800-218",
  "adopted version/date",
  "latest official status",
  "adoption decision",
  "source_status_delta",
  "adoption_decision_delta",
  "workflow_route_impact",
  "date-only refresh",
] as const;

const OUTSTANDING_MARKERS = [
  "s4_decision_record with allowed_outcome confirmed / rejected / pivot",
  "decision_owner and decision_basis recorded before terminal status",
  "forward_route / reverse_fullback_required recorded when confirmed",
  "promotion_strategy_or_rejection_pivot_rationale recorded before terminal status",
] as const;

const S4_RECORD_NAME = "s4_decision_record";
const S4_RECORD_FIELDS = [
  "allowed_outcome",
  "decision_owner",
  "decision_basis",
  "verified_evidence",
  "stakeholder_review_or_proxy",
  "acceptance_gap",
  "unresolved_risk",
  "external_source_basis",
  ...SOURCE_LEDGER_MEANING_REVIEW_FIELDS,
  "route_impact",
  "forward_route",
  "reverse_fullback_required",
  "promotion_strategy_or_rejection_pivot_rationale",
] as const;
const S4_ALLOWED_OUTCOMES = ["confirmed", "rejected", "pivot"] as const;
type S4AllowedOutcome = (typeof S4_ALLOWED_OUTCOMES)[number];

const REQUIRED_SOURCE_LEDGER_COLUMNS = [
  "source",
  "official URL",
  "adopted version/date",
  "latest official status",
  "adoption decision",
  "S4 decision use",
  "required field impact",
] as const;

const REQUIRED_SOURCE_LEDGER_ROWS = [
  "Scrum Guide 2020",
  "ISO/IEC/IEEE 29148",
  "ISTQB Glossary",
  "NIST SSDF SP 800-218",
] as const;

function parsePlan(file: string, content: string): S4DecisionPlan {
  return {
    file,
    plan_id: fmValue(content, "plan_id") ?? file.replace(/\.md$/, ""),
    kind: fmValue(content, "kind") ?? "unknown",
    status: fmValue(content, "status") ?? "unknown",
    workflowPhase: fmValue(content, "workflow_phase") ?? null,
    decisionOutcome: fmValue(content, "decision_outcome") ?? null,
    text: content,
  };
}

export function loadS4DecisionReadinessInput(repoRoot = process.cwd()): S4DecisionReadinessInput {
  const outstanding = computeOutstandingWork(repoRoot);
  return {
    discoveryMd: readFileSync(join(repoRoot, "docs", "process", "modes", "discovery.md"), "utf8"),
    scrumMd: readFileSync(join(repoRoot, "docs", "process", "modes", "scrum.md"), "utf8"),
    outstandingTs: readFileSync(join(repoRoot, "src", "lint", "outstanding.ts"), "utf8"),
    semanticFeatureFrontierRecords: outstanding.semanticFeatureFrontierRecords ?? [],
    plans: loadPlanDocs(repoRoot).map(({ file, content }) => parsePlan(file, content)),
  };
}

function isS3PocPendingDecision(plan: S4DecisionPlan): boolean {
  return (
    plan.kind === "poc" &&
    plan.status === "draft" &&
    plan.workflowPhase === "S3" &&
    !plan.decisionOutcome
  );
}

function isS4PocPendingDecision(plan: S4DecisionPlan): boolean {
  return (
    plan.kind === "poc" &&
    plan.status === "draft" &&
    plan.workflowPhase === "S4" &&
    !plan.decisionOutcome
  );
}

function isPocPendingDecision(plan: S4DecisionPlan): boolean {
  return isS3PocPendingDecision(plan) || isS4PocPendingDecision(plan);
}

function isMisplacedPocDecisionOutcome(plan: S4DecisionPlan): boolean {
  return plan.kind === "poc" && !!plan.decisionOutcome && plan.workflowPhase !== "S4";
}

function isS4PocDecision(plan: S4DecisionPlan): boolean {
  return plan.kind === "poc" && plan.workflowPhase === "S4" && !!plan.decisionOutcome;
}

function validateS4DecisionRecord(
  plan: S4DecisionPlan,
  currentLedgerCheckedDates: string[],
): S4DecisionViolation[] {
  const violations: S4DecisionViolation[] = [];
  const missingFields = missingRecordFields(plan.text, S4_RECORD_NAME, S4_RECORD_FIELDS);
  for (const field of missingFields) {
    violations.push({ subject: plan.plan_id, reason: `missing structured ${field}` });
  }
  const outcomeViolation = plan.decisionOutcome
    ? selectedAllowedOutcomeViolation({
        text: plan.text,
        recordName: S4_RECORD_NAME,
        allowedOutcomes: S4_ALLOWED_OUTCOMES,
        selectedOutcome: plan.decisionOutcome,
        selectedOutcomeLabel: "decision_outcome",
      })
    : allowedOutcomeSetViolation(plan.text, S4_RECORD_NAME, S4_ALLOWED_OUTCOMES);
  if (outcomeViolation) {
    violations.push({ subject: plan.plan_id, reason: outcomeViolation });
  }
  for (const reason of sourceLedgerMeaningReviewFieldViolations(plan.text, S4_RECORD_NAME)) {
    violations.push({ subject: plan.plan_id, reason });
  }
  for (const currentLedgerCheckedDate of currentLedgerCheckedDates) {
    const recordedFreshness = s4RecordField(plan, "source_ledger_freshness");
    if (recordedFreshness && !recordedFreshness.includes(currentLedgerCheckedDate)) {
      violations.push({
        subject: plan.plan_id,
        reason: `source_ledger_freshness checked date must match current S4 decision source ledger checked ${currentLedgerCheckedDate}`,
      });
    }
  }
  if (missingFields.length === 0 && !outcomeViolation) {
    violations.push(...validateS4ReviewMaterial(plan));
  }
  if (missingFields.length === 0 && !outcomeViolation) {
    violations.push(...validateSelectedOutcomeSemantics(plan));
  }
  return violations;
}

function validateS4ReviewMaterial(plan: S4DecisionPlan): S4DecisionViolation[] {
  const violations: S4DecisionViolation[] = [];
  const verifiedEvidence = s4RecordField(plan, "verified_evidence");
  const stakeholderReview = s4RecordField(plan, "stakeholder_review_or_proxy");
  const acceptanceGap = s4RecordField(plan, "acceptance_gap");
  const unresolvedRisk = s4RecordField(plan, "unresolved_risk");
  const externalSourceBasis = s4RecordField(plan, "external_source_basis");
  const routeImpact = s4RecordField(plan, "route_impact");

  for (const [field, value] of [
    ["verified_evidence", verifiedEvidence],
    ["stakeholder_review_or_proxy", stakeholderReview],
    ["acceptance_gap", acceptanceGap],
    ["unresolved_risk", unresolvedRisk],
    ["external_source_basis", externalSourceBasis],
    ["route_impact", routeImpact],
  ] as const) {
    if (isWeakS4ReviewMaterial(value)) {
      violations.push({
        subject: plan.plan_id,
        reason: `${field} must not be a prose-only approval claim`,
      });
    }
  }

  if (!hasConcreteS4VerifiedEvidence(verifiedEvidence)) {
    violations.push({
      subject: plan.plan_id,
      reason: "verified_evidence must cite concrete test/review evidence locator or command",
    });
  }
  if (!hasConcreteS4EvidenceLocator(externalSourceBasis)) {
    violations.push({
      subject: plan.plan_id,
      reason: "external_source_basis must cite concrete source, PLAN, docs path, or URL",
    });
  }
  if (
    !mentions(stakeholderReview, ["review", "S4 record", "verification"]) ||
    !mentions(stakeholderReview, [
      "PO",
      "TL",
      "PM",
      "Codex",
      "proxy",
      "reviewer",
      "code-reviewer",
      "human",
      "人間",
    ])
  ) {
    violations.push({
      subject: plan.plan_id,
      reason: "stakeholder_review_or_proxy must name the reviewer or proxy review basis",
    });
  }
  if (
    !plan.decisionOutcome &&
    (!mentions(routeImpact, ["confirmed"]) ||
      !mentions(routeImpact, ["rejected", "reject"]) ||
      !mentions(routeImpact, ["pivot"]))
  ) {
    violations.push({
      subject: plan.plan_id,
      reason: "route_impact must cover confirmed, rejected, and pivot outcomes",
    });
  }
  if (!describesGapOrExplicitNone(acceptanceGap)) {
    violations.push({
      subject: plan.plan_id,
      reason: "acceptance_gap must describe a concrete gap or explicit none/zero gap",
    });
  }
  if (!describesRiskOrExplicitNone(unresolvedRisk)) {
    violations.push({
      subject: plan.plan_id,
      reason: "unresolved_risk must describe residual risk or explicit none/zero risk",
    });
  }

  return violations;
}

function validateSelectedOutcomeSemantics(plan: S4DecisionPlan): S4DecisionViolation[] {
  const outcome = plan.decisionOutcome;
  if (!outcome || !isS4AllowedOutcome(outcome)) return [];

  const violations: S4DecisionViolation[] = [];
  const status = plan.status;
  const routeImpact = s4RecordField(plan, "route_impact");
  const forwardRoute = s4RecordField(plan, "forward_route");
  const reverseFullbackRequired = s4RecordField(plan, "reverse_fullback_required");
  const rationale = s4RecordField(plan, "promotion_strategy_or_rejection_pivot_rationale");

  if (!["confirmed", "completed", "archived"].includes(status)) {
    violations.push({
      subject: plan.plan_id,
      reason: "S4 decision_outcome requires terminal status",
    });
  }

  if (outcome === "confirmed") {
    if (status === "archived") {
      violations.push({
        subject: plan.plan_id,
        reason: "confirmed S4 decision cannot use archived status",
      });
    }
    if (!mentions(routeImpact, ["confirmed"])) {
      violations.push({
        subject: plan.plan_id,
        reason: "confirmed decision requires route_impact to describe confirmed impact",
      });
    }
    if (!mentionsConcretePromotionTarget(forwardRoute)) {
      violations.push({
        subject: plan.plan_id,
        reason:
          "confirmed decision requires forward_route to name a concrete Forward/Reverse promotion target",
      });
    }
    if (!/^(yes|no)\b/i.test(reverseFullbackRequired)) {
      violations.push({
        subject: plan.plan_id,
        reason: "confirmed decision requires reverse_fullback_required to be yes or no",
      });
    }
    if (
      /^no\b/i.test(reverseFullbackRequired) &&
      !mentions(rationale, ["redesign", "reuse-as-is", "reuse-with-hardening"])
    ) {
      violations.push({
        subject: plan.plan_id,
        reason:
          "confirmed decision with no reverse fullback requires an explicit promotion strategy",
      });
    }
    if (!mentions(rationale, ["reuse-as-is", "reuse-with-hardening", "redesign"])) {
      violations.push({
        subject: plan.plan_id,
        reason:
          "confirmed decision requires promotion_strategy_or_rejection_pivot_rationale to include reuse-as-is, reuse-with-hardening, or redesign",
      });
    }
  }

  if (outcome === "rejected") {
    if (status !== "archived") {
      violations.push({
        subject: plan.plan_id,
        reason: "rejected S4 decision must archive the PoC plan",
      });
    }
    if (!mentions(routeImpact, ["rejected", "reject", "archive", "archived"])) {
      violations.push({
        subject: plan.plan_id,
        reason: "rejected decision requires route_impact to describe rejection/archive impact",
      });
    }
    if (!mentionsNoForwardRoute(forwardRoute)) {
      violations.push({
        subject: plan.plan_id,
        reason: "rejected decision must not name a Forward promotion route",
      });
    }
    if (!mentions(rationale, ["rejected", "reject", "archive", "archived"])) {
      violations.push({
        subject: plan.plan_id,
        reason: "rejected decision requires rejection/archive rationale",
      });
    }
  }

  if (outcome === "pivot") {
    if (status !== "archived") {
      violations.push({
        subject: plan.plan_id,
        reason: "pivot S4 decision must archive the old PoC plan",
      });
    }
    if (!mentions(routeImpact, ["pivot"])) {
      violations.push({
        subject: plan.plan_id,
        reason: "pivot decision requires route_impact to describe pivot impact",
      });
    }
    if (
      !mentions(`${forwardRoute} ${rationale}`, [
        "new poc",
        "new PLAN-DISCOVERY",
        "S0",
        "retry",
        "backlog",
        "next sprint",
        "再投入",
      ])
    ) {
      violations.push({
        subject: plan.plan_id,
        reason: "pivot decision requires a new PoC/S0/backlog route",
      });
    }
    if (!mentions(rationale, ["pivot"])) {
      violations.push({
        subject: plan.plan_id,
        reason: "pivot decision requires pivot rationale",
      });
    }
  }

  return violations;
}

function isS4AllowedOutcome(outcome: string): outcome is S4AllowedOutcome {
  return S4_ALLOWED_OUTCOMES.includes(outcome as S4AllowedOutcome);
}

function s4RecordField(plan: S4DecisionPlan, field: string): string {
  return recordFieldValue(plan.text, S4_RECORD_NAME, field) ?? "";
}

function mentions(value: string, needles: string[]): boolean {
  const normalized = value.toLowerCase();
  return needles.some((needle) => normalized.includes(needle.toLowerCase()));
}

function isWeakS4ReviewMaterial(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  if (!normalized) return true;
  return /^(looks fine|ok|okay|good|done|pass|passed|green|済み|問題なし|大丈夫)[。.!！]*$/i.test(
    normalized,
  );
}

function hasConcreteS4EvidenceLocator(value: string): boolean {
  const normalized = value.trim();
  if (!normalized) return false;
  return [
    /sha256:[a-f0-9]{64}/i,
    /\bPLAN-(?:L\d*|REVERSE|DISCOVERY)-[A-Za-z0-9-]+\b/i,
    /\b[A-Z]{1,8}-\d{2,}\b/,
    /\b(npm|pnpm|yarn|git)\s+(run|test|diff|status|show|ls|check|exec)\b/i,
    /\bhelix\s+[a-z0-9:_-]+(?:\s+[a-z0-9:_./-]+)*/i,
    /\b(run|workflow|job|artifact|audit|evidence|report|log)\s*(id|path|url)\s*[:=]\s*\S+/i,
    /\b(?:audit|run|workflow|job|artifact|report|log)-?(?:id|url|path)\s*[:=]\s*\S+/i,
    /https?:\/\/\S+/i,
    /\b(artifacts?|reports?|logs?|evidence|audit)\//i,
    /\b(\.helix|\.helix|docs|tests|src|dist|coverage|artifacts?|reports?|logs?)\/\S+/i,
    /\S+\.(json|log|txt|md|sarif|junit|xml|csv|db)\b/i,
  ].some((pattern) => pattern.test(normalized));
}

function hasConcreteS4VerifiedEvidence(value: string): boolean {
  const normalized = value.trim();
  if (!normalized) return false;
  return [
    /sha256:[a-f0-9]{64}/i,
    /\b(npm|pnpm|yarn)\s+(run|test|check|exec)\b/i,
    /\bgit\s+(diff|status|show|ls|check|log)\b/i,
    /\bhelix\s+[a-z0-9:_-]+(?:\s+[a-z0-9:_./-]+)*/i,
    /\b(run|workflow|job|artifact|audit|evidence|report|log)\s*(id|path|url)\s*[:=]\s*\S+/i,
    /\b(?:audit|run|workflow|job|artifact|report|log)-?(?:id|url|path)\s*[:=]\s*\S+/i,
    /\b(artifacts?|reports?|logs?|evidence|audit)\//i,
    /\b(?:\.helix|\.helix)\/(?:evidence|audit|handover)\/\S+/i,
    /\btests\/\S+\.(?:test|spec)\.(?:ts|tsx|js|jsx)\b/i,
    /\S+\.(?:log|sarif|junit|xml|csv|db)\b/i,
  ].some((pattern) => pattern.test(normalized));
}

function describesGapOrExplicitNone(value: string): boolean {
  return mentions(value, [
    "none",
    "zero",
    "no gap",
    "gap",
    "follow-up",
    "remained",
    "remain",
    "outside",
    "boundary",
    "scope",
    "AC-",
    "L1",
    "L3",
    "L4",
    "L5",
    "L6",
    "L7",
    "なし",
    "未充足",
    "充足",
  ]);
}

function describesRiskOrExplicitNone(value: string): boolean {
  return mentions(value, [
    "none",
    "zero",
    "no risk",
    "risk",
    "residual",
    "unresolved",
    "future",
    "debt",
    "deferred",
    "require",
    "requires",
    "must",
    "hardening",
    "carried",
    "security",
    "approval",
    "CSP",
    "secret",
    "auth",
    "なし",
    "リスク",
  ]);
}

function mentionsConcretePromotionTarget(value: string): boolean {
  return (
    /\bPLAN-(?:L\d+|REVERSE)-/i.test(value) ||
    /\bL(?:1|3|4|5|6)\b/.test(value) ||
    /docs[\\/](?:design|plans|process|test-design)[\\/]/i.test(value)
  );
}

function mentionsNoForwardRoute(value: string): boolean {
  return mentions(value, [
    "none",
    "no forward",
    "not applicable",
    "n/a",
    "archive",
    "archived",
    "backlog",
    "除外",
  ]);
}

export function analyzeS4DecisionReadiness(
  input: S4DecisionReadinessInput,
): S4DecisionReadinessResult {
  const violations: S4DecisionViolation[] = [];
  const currentLedgerCheckedDates = [
    ...new Set(
      [
        sourceLedgerCheckedDate(input.discoveryMd, "S4 decision source ledger"),
        sourceLedgerCheckedDate(input.scrumMd, "S4 decision source ledger"),
      ].filter((date): date is string => Boolean(date)),
    ),
  ];

  for (const doc of [
    ["docs/process/modes/discovery.md", input.discoveryMd],
    ["docs/process/modes/scrum.md", input.scrumMd],
  ] as const) {
    for (const marker of MODE_DOC_MARKERS) {
      if (!modeDocMarkerPresent(doc[1], marker)) {
        violations.push({ subject: doc[0], reason: `missing ${marker}` });
      }
    }
    if (!hasSourceLedgerCheckedDate(doc[1], "S4 decision source ledger")) {
      violations.push({
        subject: doc[0],
        reason: "missing S4 decision source ledger checked date",
      });
    }

    const sourceLedger = parseS4DecisionSourceLedger(doc[1]);
    for (const source of REQUIRED_SOURCE_LEDGER_ROWS.filter(
      (source) => !sourceLedger.rows.some((row) => row.source === source),
    )) {
      violations.push({
        subject: doc[0],
        reason: `S4 decision source ledger missing row: ${source}`,
      });
    }
    for (const violation of sourceLedgerViolations(doc[0], sourceLedger, doc[1])) {
      violations.push(violation);
    }
  }

  for (const marker of OUTSTANDING_MARKERS) {
    if (!input.outstandingTs.includes(marker)) {
      violations.push({ subject: "src/lint/outstanding.ts", reason: `missing ${marker}` });
    }
  }

  for (const plan of input.plans.filter(isMisplacedPocDecisionOutcome)) {
    violations.push({
      subject: plan.plan_id,
      reason: "decision_outcome requires workflow_phase=S4",
    });
  }

  const pending = input.plans.filter(isPocPendingDecision);
  for (const plan of pending) {
    violations.push(...validateS4DecisionRecord(plan, currentLedgerCheckedDates));
    if (input.semanticFeatureFrontierRecords !== undefined) {
      violations.push(
        ...semanticFrontierBindingViolations(
          input.semanticFeatureFrontierRecords,
          {
            planId: plan.plan_id,
            classification: "frontier_pending_decision",
          },
          plan.plan_id,
        ),
      );
    }
    const packet = buildS4DecisionPacket(
      plan,
      input.semanticFeatureFrontierRecords,
      s4DecisionPacketSourceCheckedAt(input),
    );
    const recordBlockers = [
      "po_decision_pending",
      ...(planTextRequiresActionBindingApproval(plan.text) ? ["human_approval_pending"] : []),
    ];
    violations.push(
      ...recordTemplateContractViolations({
        subject: `${plan.plan_id}.s4DecisionPacket`,
        requiredRecords: requiredRecordsForBlockers(recordBlockers),
        recordTemplates: packet.recordTemplates,
      }).map((violation) => ({
        subject: violation.subject,
        reason: violation.reason,
      })),
    );
    violations.push(
      ...s4DecisionVerificationCommandViolations(packet).map((violation) => ({
        subject: violation.subject,
        reason: violation.reason,
      })),
    );
  }

  for (const plan of input.plans.filter(isS4PocDecision)) {
    violations.push(...validateS4DecisionRecord(plan, currentLedgerCheckedDates));
  }

  return {
    pendingPlanIds: pending.map((p) => p.plan_id).sort(),
    missingSourceLedgerRows: missingSourceLedgerRowsForDocs(input.discoveryMd, input.scrumMd),
    sourceLedgerViolations: [
      ...sourceLedgerViolations(
        "docs/process/modes/discovery.md",
        parseS4DecisionSourceLedger(input.discoveryMd),
        input.discoveryMd,
      ),
      ...sourceLedgerViolations(
        "docs/process/modes/scrum.md",
        parseS4DecisionSourceLedger(input.scrumMd),
        input.scrumMd,
      ),
    ],
    violations,
    ok: violations.length === 0,
  };
}

export function buildS4DecisionPackets(input: S4DecisionReadinessInput): S4DecisionPacket[] {
  const sourceCheckedAt = s4DecisionPacketSourceCheckedAt(input);
  return input.plans
    .filter(isPocPendingDecision)
    .map((plan) =>
      buildS4DecisionPacket(plan, input.semanticFeatureFrontierRecords, sourceCheckedAt),
    )
    .sort((a, b) => a.planId.localeCompare(b.planId));
}

function s4DecisionPacketSourceCheckedAt(input: S4DecisionReadinessInput): string {
  return (
    sourceLedgerCheckedDate(input.discoveryMd, "S4 decision source ledger") ??
    sourceLedgerCheckedDate(input.scrumMd, "S4 decision source ledger") ??
    "unknown"
  );
}

export function buildS4DecisionPacket(
  plan: S4DecisionPlan,
  semanticFeatureFrontierRecords?: SemanticFeatureFrontierRecord[],
  sourceCheckedAt = "unknown",
): S4DecisionPacket {
  const decisionRecord = recordValues(plan.text, S4_RECORD_NAME, [...S4_RECORD_FIELDS]);
  const recordBlockers = [
    "po_decision_pending",
    ...(planTextRequiresActionBindingApproval(plan.text) ? ["human_approval_pending"] : []),
  ];
  const blockedReasons = [
    ...s4DecisionBlockedReasons(plan, decisionRecord),
    ...(planTextRequiresActionBindingApproval(plan.text)
      ? ["same PLAN also requires action-binding approval before high-impact execution"]
      : []),
  ];
  const provenance = buildDecisionPacketProvenance({ sourceCommand: S4_DECISION_PACKET_COMMAND });
  return {
    schemaVersion: "s4-decision-packet.v1",
    planId: plan.plan_id,
    generatedAt: provenance.generatedAt,
    sourceCommand: S4_DECISION_PACKET_COMMAND,
    freshness: provenance.freshness,
    status: isPocPendingDecision(plan) ? "pending_po_decision" : "invalid_not_pending_s3",
    planOnly: true,
    mustNotDecide: true,
    decisionCommandAvailable: false,
    decisionAllowed: false,
    allowedOutcomes: [...S4_ALLOWED_OUTCOMES],
    semanticFeatureFrontierRecord: semanticFrontierBindingForPlan(semanticFeatureFrontierRecords, {
      planId: plan.plan_id,
      classification: "frontier_pending_decision",
    }),
    decisionRecord,
    recordTemplates: recordTemplatesForRecords(requiredRecordsForBlockers(recordBlockers)),
    decisionEvidenceChecklist: [
      {
        field: "verified_evidence",
        evidence: decisionRecord.verified_evidence ?? "",
        decisionUse: "prove S3 verification exists before PO chooses confirmed/rejected/pivot",
      },
      {
        field: "stakeholder_review_or_proxy",
        evidence: decisionRecord.stakeholder_review_or_proxy ?? "",
        decisionUse: "separate inspect/adapt review input from terminal acceptance",
      },
      {
        field: "acceptance_gap",
        evidence: decisionRecord.acceptance_gap ?? "",
        decisionUse: "decide whether remaining gaps allow confirm, require pivot, or reject",
      },
      {
        field: "unresolved_risk",
        evidence: decisionRecord.unresolved_risk ?? "",
        decisionUse:
          "carry residual risk into route impact instead of hiding it behind green tests",
      },
      {
        field: "external_source_basis",
        evidence: decisionRecord.external_source_basis ?? "",
        decisionUse: "bind the decision to official/process/design sources used as judgment basis",
      },
      {
        field: "route_impact",
        evidence: decisionRecord.route_impact ?? "",
        decisionUse: "show how each outcome changes Forward/Reverse/backlog state",
      },
    ],
    outcomeRouteMatrix: [
      {
        outcome: "confirmed",
        terminalStatus: "confirmed or completed",
        routePolicy:
          "promote through declared Forward/Reverse route; do not treat S3 evidence alone as completion",
        requiredEvidence:
          "verified evidence, zero or accepted acceptance_gap, explicit forward_route, reverse_fullback_required yes/no, and promotion strategy",
      },
      {
        outcome: "rejected",
        terminalStatus: "archived",
        routePolicy: "archive the PoC or increment and exclude it from active completion frontier",
        requiredEvidence:
          "rejection rationale, no Forward promotion route, and backlog/archive impact",
      },
      {
        outcome: "pivot",
        terminalStatus: "archived",
        routePolicy: "archive the old PoC and create a new S0/S1 backlog or PLAN-DISCOVERY route",
        requiredEvidence: "pivot rationale, route impact, and next sprint/backlog target",
      },
    ],
    decisionVerificationCommandMatrix: buildS4DecisionVerificationCommandMatrix(
      plan,
      sourceCheckedAt,
    ),
    provenanceRequirements: [
      {
        item: "decision_record",
        evidence: "s4_decision_record with all required fields and exact allowed_outcome enum",
      },
      {
        item: "green_evidence",
        evidence: decisionRecord.verified_evidence ?? "",
      },
      {
        item: "stakeholder_or_proxy_review",
        evidence: decisionRecord.stakeholder_review_or_proxy ?? "",
      },
      {
        item: "route_and_fullback",
        evidence: `${decisionRecord.forward_route ?? ""} / ${decisionRecord.reverse_fullback_required ?? ""}`,
      },
      {
        item: "source_ledger",
        evidence: decisionRecord.external_source_basis ?? "",
      },
    ],
    relatedDecisionPackets: uniqueRelatedDecisionPackets([
      relatedDecisionPacket({
        command: S4_DECISION_PACKET_COMMAND,
        scopedCommand: `${S4_DECISION_PACKET_COMMAND} --plan ${plan.plan_id}`,
        role: "primary",
        reason: "S3 PoC remains pending PO/S4 decision",
        route: "record s4_decision_record and decision_outcome before promotion/rejection/pivot",
      }),
      ...(planTextRequiresActionBindingApproval(plan.text)
        ? [
            relatedDecisionPacket({
              command: ACTION_BINDING_APPROVAL_PACKET_COMMAND,
              scopedCommand: `${ACTION_BINDING_APPROVAL_PACKET_COMMAND} --plan ${plan.plan_id}`,
              role: "supporting",
              reason: "same PLAN also carries a human/action-binding approval boundary",
              route:
                "record action_binding_approval_record before executing any high-impact action",
            }),
          ]
        : []),
    ]),
    blockedReasons,
    nextWorkflowRoutes: [
      {
        outcome: "confirmed",
        route:
          "record S4 decision_outcome=confirmed, terminal status, semantic frontier update, then route through Forward/Reverse fullback as declared",
      },
      {
        outcome: "rejected",
        route:
          "record rejection/archive rationale, set terminal archived status, and exclude from active completion frontier",
      },
      {
        outcome: "pivot",
        route:
          "record pivot rationale, archive the old PoC, and route a new S0/S1 backlog item or PLAN-DISCOVERY",
      },
    ],
  };
}

function buildS4DecisionVerificationCommandMatrix(
  plan: S4DecisionPlan,
  sourceCheckedAt: string,
): S4DecisionPacket["decisionVerificationCommandMatrix"] {
  return [
    {
      phase: "decision-packet-baseline",
      command: `npx --no-install tsx src/cli.ts s4 decision-packet --plan ${plan.plan_id} --json`,
      expected:
        "captures current semantic frontier, decision checklist, outcome routes, blockers, and related packets",
      evidence: "S4 decision packet JSON attached to PO/TL decision review",
      source: "HELIX Discovery S4 decision contract",
      sourceUrl: "docs/process/modes/discovery.md",
      sourceCheckedAt,
      latestOfficialStatus: "local Discovery S4 decision contract current at HEAD",
      sourceStatusDelta: "none; packet remains plan-only and PO-gated",
      adoptionDecision: "adopt-current-s4-packet-contract-for-po-decision-review",
      adoptionDecisionDelta: "none; keep S4 decision recording outside automated completion",
      workflowRouteImpact: "none; packet drift routes back to S4 evidence repair",
    },
    {
      phase: "source-ledger-freshness",
      command: "npx --no-install tsx src/cli.ts doctor",
      expected:
        "S4 decision source ledger freshness, required rows, and decision packet gates remain green",
      evidence: "doctor output with s4-decision-readiness and source ledger freshness gates",
      source: "HELIX source ledger freshness policy",
      sourceUrl: "docs/process/modes/discovery.md#s4-decision-source-ledger",
      sourceCheckedAt,
      latestOfficialStatus:
        "S4 source ledger remains anchored to Scrum Guide 2020, ISO/IEC/IEEE 29148, ISTQB Glossary, and NIST SSDF rows",
      sourceStatusDelta: "none; local source ledger reviewed against current HEAD",
      adoptionDecision: "adopt-s4-source-ledger-freshness-before-po-decision",
      adoptionDecisionDelta: "none; stale or incomplete ledger still blocks S4 terminal use",
      workflowRouteImpact: "none; stale ledger routes the PLAN back to S4 evidence repair",
    },
    {
      phase: "s3-verification-evidence",
      command: "npx --no-install tsx src/cli.ts doctor",
      expected:
        "verified_evidence points to concrete test/review output instead of a planned or prose-only claim",
      evidence: "doctor output with s4-decision-readiness, review-evidence, and trace gates",
      source: "HELIX Scrum S3->S4 verification boundary",
      sourceUrl: "docs/process/modes/scrum.md",
      sourceCheckedAt,
      latestOfficialStatus: "Scrum Guide official current version remains November 2020",
      sourceStatusDelta: "none; S3 verify remains evidence before S4 decide",
      adoptionDecision: "adopt-s3-verified-evidence-as-s4-entry-gate",
      adoptionDecisionDelta: "none; S3 verification alone remains non-terminal",
      workflowRouteImpact: "none; missing verified_evidence keeps PLAN in S3/S4 repair",
    },
    {
      phase: "requirements-trace",
      command: "npx --no-install tsx src/cli.ts doctor",
      expected:
        "G1/G3 trace, l6-fr-coverage, oracle-test-trace, and semantic frontier gates stay green before S4 outcome selection",
      evidence: "doctor output and trace/oracle gate lines",
      source: "HELIX V-model trace gate",
      sourceUrl: loadRequirementsDocRegistry().canonical,
      sourceCheckedAt,
      latestOfficialStatus: "local V-model trace gate contract current at HEAD",
      sourceStatusDelta: "none; G1/G3 trace remains required before S4 route selection",
      adoptionDecision: "adopt-vmodel-trace-gates-before-s4-outcome-selection",
      adoptionDecisionDelta: "none; keep requirements trace as S4 decision evidence",
      workflowRouteImpact: "none; trace failure routes back to Forward trace repair",
    },
    {
      phase: "targeted-regression",
      command:
        "npx --no-install vitest run tests/s4-decision-readiness.test.ts tests/cli-surface.test.ts",
      expected: "S4 packet and CLI surface regressions stay green",
      evidence: "targeted vitest output",
      source: "HELIX S4 regression oracle",
      sourceUrl:
        "docs/test-design/harness/L7-unit-test-design.md#decision-record-and-completion-frontier",
      sourceCheckedAt,
      latestOfficialStatus: "local S4 regression oracle current at HEAD",
      sourceStatusDelta: "none; S4 packet oracle reviewed against current HEAD",
      adoptionDecision: "adopt-targeted-regression-before-s4-decision-review",
      adoptionDecisionDelta: "none; keep targeted regression before PO decision use",
      workflowRouteImpact: "none; regression failure routes back to L7 repair",
    },
    {
      phase: "static-gates",
      command: "npm run lint && npm run typecheck && git diff --check",
      expected: "format, type, and whitespace gates pass before S4 decision recording",
      evidence: "lint/typecheck/diff-check command output",
      source: "HELIX repository static gate policy",
      sourceUrl: "AGENTS.md#test-rules",
      sourceCheckedAt,
      latestOfficialStatus: "repository AGENTS test rules current at HEAD",
      sourceStatusDelta: "none; static gate policy reviewed against current HEAD",
      adoptionDecision: "adopt-static-gates-before-s4-decision-review",
      adoptionDecisionDelta: "none; keep static gates before S4 terminal update",
      workflowRouteImpact: "none; static failure routes back to implementation repair",
    },
    {
      phase: "full-regression",
      command: "npm test",
      expected:
        "full repository regression suite passes before terminal S4 promotion/rejection/pivot",
      evidence: "full vitest output",
      source: "HELIX full regression policy",
      sourceUrl: "docs/test-design/harness/L7-unit-test-design.md",
      sourceCheckedAt,
      latestOfficialStatus: "local HELIX full regression policy current at HEAD",
      sourceStatusDelta: "none; full regression policy reviewed against current HEAD",
      adoptionDecision: "adopt-full-regression-before-terminal-s4-route",
      adoptionDecisionDelta: "none; keep full regression as terminal S4 blocker",
      workflowRouteImpact: "none; full regression failure blocks S4 decision recording",
    },
    {
      phase: "completion-frontier",
      command: "npx --no-install tsx src/cli.ts status --json",
      expected:
        "completionReadiness remains blocked until decision_outcome and required route evidence are recorded",
      evidence: "status JSON completionDecisionPacket and semanticFeatureFrontierRecords",
      source: "HELIX completion frontier contract",
      sourceUrl: "docs/design/helix/L3-requirements/pillar-functional-requirements.md",
      sourceCheckedAt,
      latestOfficialStatus: "local semantic frontier contract current at HEAD",
      sourceStatusDelta: "none; frontier_pending_decision remains completion blocker",
      adoptionDecision: "adopt-semantic-frontier-blocker-before-s4-terminal-status",
      adoptionDecisionDelta: "none; do not count S4 pending plans as complete",
      workflowRouteImpact: "none; unresolved frontier keeps completionReadiness blocked",
    },
  ].map((row) => ({ writePolicy: "no-write" as const, ...row }));
}

export function s4DecisionVerificationCommandViolations(
  packet: S4DecisionPacket,
): S4DecisionCommandViolation[] {
  const allowedCommands = new Set([
    `npx --no-install tsx src/cli.ts s4 decision-packet --plan ${packet.planId} --json`,
    "npx --no-install tsx src/cli.ts doctor",
    "npx --no-install vitest run tests/s4-decision-readiness.test.ts tests/cli-surface.test.ts",
    "npm run lint && npm run typecheck && git diff --check",
    "npm test",
    "npx --no-install tsx src/cli.ts status --json",
  ]);
  return packet.decisionVerificationCommandMatrix.flatMap((row) => {
    const violations: S4DecisionCommandViolation[] = [];
    const command = row.command.trim();
    if (row.writePolicy !== "no-write" || !allowedCommands.has(command)) {
      violations.push({
        subject: `${packet.planId}.${row.phase}`,
        reason: `decisionVerificationCommandMatrix command is not an executable approved no-write surface: ${row.command}`,
      });
    }
    if (commandWritesLocalStateOrArtifacts(command)) {
      violations.push({
        subject: `${packet.planId}.${row.phase}`,
        reason: `decisionVerificationCommandMatrix no-write command may write local state or artifacts: ${row.command}`,
      });
    }
    violations.push(
      ...verificationSourceMetadataViolations({
        subject: `${packet.planId}.${row.phase}`,
        matrixName: "decisionVerificationCommandMatrix",
        row,
      }),
    );
    return violations;
  });
}

function commandWritesLocalStateOrArtifacts(command: string): boolean {
  return /\b(npm run build|esbuild|db rebuild|--outfile|>\s*|tee\b)\b/.test(command);
}

function missingSourceLedgerRowsForDocs(discoveryMd: string, scrumMd: string): string[] {
  const discovery = parseS4DecisionSourceLedger(discoveryMd);
  const scrum = parseS4DecisionSourceLedger(scrumMd);
  return REQUIRED_SOURCE_LEDGER_ROWS.filter(
    (source) =>
      !discovery.rows.some((row) => row.source === source) ||
      !scrum.rows.some((row) => row.source === source),
  );
}

function modeDocMarkerPresent(text: string, marker: string): boolean {
  const aliases: Record<string, string[]> = {
    "adopted version/date": ["採用 version/date"],
    "latest official status": ["最新公式 status", "最新 official status"],
  };
  return [marker, ...(aliases[marker] ?? [])].some((candidate) => text.includes(candidate));
}

function sourceLedgerViolations(
  subject: string,
  sourceLedger: { columns: string[]; rows: Record<string, string>[] },
  sourceText = "",
): S4DecisionViolation[] {
  const freshnessViolation = sourceLedgerCheckedDateViolation(
    sourceText,
    "S4 decision source ledger",
  );
  return [
    ...(freshnessViolation ? [{ subject, reason: freshnessViolation }] : []),
    ...REQUIRED_SOURCE_LEDGER_COLUMNS.filter(
      (column) => !sourceLedger.columns.includes(column),
    ).map((column) => ({
      subject,
      reason: `S4 decision source ledger missing column: ${column}`,
    })),
    ...sourceLedger.rows.flatMap((row) =>
      REQUIRED_SOURCE_LEDGER_COLUMNS.flatMap((column) => {
        const value = row[column] ?? "";
        if (value.trim() === "" || /^(TBD|TODO|-)$/.test(value.trim())) {
          return [
            {
              subject,
              reason: `S4 decision source ledger ${row.source} has empty ${column}`,
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
              subject,
              reason: `S4 decision source ledger ${row.source} official URL is not https`,
            },
          ],
    ),
  ];
}

function parseS4DecisionSourceLedger(text: string): {
  columns: string[];
  rows: Record<string, string>[];
} {
  const lines = text.split(/\r?\n/);
  const headingPattern = sourceLedgerHeadingPattern("S4 decision source ledger");
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
  const columns = tableCells(tableLines[0]).map(normalizeS4DecisionSourceLedgerColumn);
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

function normalizeS4DecisionSourceLedgerColumn(column: string): string {
  const aliases: Record<string, string> = {
    "公式 URL": "official URL",
    "採用 version/date": "adopted version/date",
    "最新公式 status": "latest official status",
    "最新 official status": "latest official status",
    採用判断: "adoption decision",
    "S4 decision での用途": "S4 decision use",
    "影響する必須 field": "required field impact",
    "必須 field への影響": "required field impact",
  };
  return aliases[column] ?? column;
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

function s4DecisionBlockedReasons(
  plan: S4DecisionPlan,
  decisionRecord: Record<string, string>,
): string[] {
  const reasons: string[] = [];
  if (!isPocPendingDecision(plan)) {
    reasons.push("plan is not an S3/S4 draft PoC pending PO decision");
  } else if (isS4PocPendingDecision(plan)) {
    reasons.push("plan is already in S4 draft; PO/S4 decision_outcome has not been recorded");
  } else {
    reasons.push("plan remains S3 draft; PO/S4 decision_outcome has not been recorded");
  }
  if (plan.decisionOutcome) {
    reasons.push(
      "decision_outcome is already present and must be validated as S4 terminal evidence",
    );
  }
  for (const field of S4_RECORD_FIELDS) {
    if (!(decisionRecord[field] ?? "").trim()) {
      reasons.push(`s4_decision_record lacks concrete ${field}`);
    }
  }
  return [...new Set(reasons)];
}

export function s4DecisionReadinessMessages(result: S4DecisionReadinessResult): string[] {
  if (result.ok) {
    const pending = result.pendingPlanIds.length > 0 ? result.pendingPlanIds.join(", ") : "none";
    return [`s4-decision-readiness - OK (pending=${result.pendingPlanIds.length}: ${pending})`];
  }
  const detail = result.violations
    .slice(0, 8)
    .map((v) => `${v.subject}:${v.reason}`)
    .join(", ");
  const more = result.violations.length > 8 ? ` (+${result.violations.length - 8} more)` : "";
  return [`s4-decision-readiness - violation: ${detail}${more}`];
}

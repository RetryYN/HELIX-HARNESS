import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  type CompletionDecisionRecordTemplate,
  computeOutstandingWork,
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
  sourceLedgerMeaningReviewFieldViolations,
} from "./shared";
import {
  hasSourceLedgerCheckedDate,
  sourceLedgerCheckedDateViolation,
  sourceLedgerHeadingPattern,
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
  const plansDir = join(repoRoot, "docs", "plans");
  const outstanding = computeOutstandingWork(repoRoot);
  return {
    discoveryMd: readFileSync(join(repoRoot, "docs", "process", "modes", "discovery.md"), "utf8"),
    scrumMd: readFileSync(join(repoRoot, "docs", "process", "modes", "scrum.md"), "utf8"),
    outstandingTs: readFileSync(join(repoRoot, "src", "lint", "outstanding.ts"), "utf8"),
    semanticFeatureFrontierRecords: outstanding.semanticFeatureFrontierRecords ?? [],
    plans: readdirSync(plansDir)
      .filter((f) => f.startsWith("PLAN-") && f.endsWith(".md"))
      .map((f) => parsePlan(f, readFileSync(join(plansDir, f), "utf8"))),
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

function isMisplacedPocDecisionOutcome(plan: S4DecisionPlan): boolean {
  return plan.kind === "poc" && !!plan.decisionOutcome && plan.workflowPhase !== "S4";
}

function isS4PocDecision(plan: S4DecisionPlan): boolean {
  return plan.kind === "poc" && plan.workflowPhase === "S4" && !!plan.decisionOutcome;
}

function validateS4DecisionRecord(plan: S4DecisionPlan): S4DecisionViolation[] {
  const violations: S4DecisionViolation[] = [];
  const missingFields = missingRecordFields(plan.text, S4_RECORD_NAME, S4_RECORD_FIELDS);
  for (const field of missingFields) {
    violations.push({ subject: plan.plan_id, reason: `missing structured ${field}` });
  }
  const outcomeViolation = allowedOutcomeSetViolation(
    plan.text,
    S4_RECORD_NAME,
    S4_ALLOWED_OUTCOMES,
  );
  if (outcomeViolation) {
    violations.push({ subject: plan.plan_id, reason: outcomeViolation });
  }
  for (const reason of sourceLedgerMeaningReviewFieldViolations(plan.text, S4_RECORD_NAME)) {
    violations.push({ subject: plan.plan_id, reason });
  }
  if (missingFields.length === 0 && !outcomeViolation) {
    violations.push(...validateSelectedOutcomeSemantics(plan));
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
    if (!mentionsPromotionTarget(forwardRoute)) {
      violations.push({
        subject: plan.plan_id,
        reason:
          "confirmed decision requires forward_route to name a Forward/Reverse promotion target",
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

function mentionsPromotionTarget(value: string): boolean {
  return (
    /\bPLAN-(?:L|REVERSE)-/i.test(value) ||
    /\bL(?:1|2|3|4|5|6|7|8|9|10|11|12|13|14)\b/.test(value) ||
    mentions(value, ["Forward", "Reverse", "requirements", "design", "descent", "正本"])
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

  for (const doc of [
    ["docs/process/modes/discovery.md", input.discoveryMd],
    ["docs/process/modes/scrum.md", input.scrumMd],
  ] as const) {
    for (const marker of MODE_DOC_MARKERS) {
      if (!doc[1].includes(marker)) {
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

  const pending = input.plans.filter(isS3PocPendingDecision);
  for (const plan of pending) {
    violations.push(...validateS4DecisionRecord(plan));
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
  }

  for (const plan of input.plans.filter(isS4PocDecision)) {
    violations.push(...validateS4DecisionRecord(plan));
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
  return input.plans
    .filter(isS3PocPendingDecision)
    .map((plan) => buildS4DecisionPacket(plan, input.semanticFeatureFrontierRecords))
    .sort((a, b) => a.planId.localeCompare(b.planId));
}

export function buildS4DecisionPacket(
  plan: S4DecisionPlan,
  semanticFeatureFrontierRecords?: SemanticFeatureFrontierRecord[],
): S4DecisionPacket {
  const decisionRecord = recordValues(plan.text, S4_RECORD_NAME, [...S4_RECORD_FIELDS]);
  const recordBlockers = [
    "po_decision_pending",
    ...(planTextRequiresActionBindingApproval(plan.text) ? ["human_approval_pending"] : []),
  ];
  const blockedReasons = s4DecisionBlockedReasons(plan, decisionRecord);
  const provenance = buildDecisionPacketProvenance({ sourceCommand: S4_DECISION_PACKET_COMMAND });
  return {
    schemaVersion: "s4-decision-packet.v1",
    planId: plan.plan_id,
    generatedAt: provenance.generatedAt,
    sourceCommand: S4_DECISION_PACKET_COMMAND,
    freshness: provenance.freshness,
    status: isS3PocPendingDecision(plan) ? "pending_po_decision" : "invalid_not_pending_s3",
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
    decisionVerificationCommandMatrix: buildS4DecisionVerificationCommandMatrix(plan),
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
        role: "primary",
        reason: "S3 PoC remains pending PO/S4 decision",
        route: "record s4_decision_record and decision_outcome before promotion/rejection/pivot",
      }),
      ...(planTextRequiresActionBindingApproval(plan.text)
        ? [
            relatedDecisionPacket({
              command: ACTION_BINDING_APPROVAL_PACKET_COMMAND,
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
): S4DecisionPacket["decisionVerificationCommandMatrix"] {
  return [
    {
      phase: "decision-packet-baseline",
      command: `bun run src/cli.ts s4 decision-packet --plan ${plan.plan_id} --json`,
      expected:
        "captures current semantic frontier, decision checklist, outcome routes, blockers, and related packets",
      evidence: "S4 decision packet JSON attached to PO/TL decision review",
      source: "HELIX Discovery S4 decision contract",
      sourceUrl: "docs/process/modes/discovery.md",
      sourceCheckedAt: "2026-07-02",
      latestOfficialStatus: "local Discovery S4 decision contract current at HEAD",
      sourceStatusDelta: "none; packet remains plan-only and PO-gated",
      adoptionDecision: "adopt-current-s4-packet-contract-for-po-decision-review",
      adoptionDecisionDelta: "none; keep S4 decision recording outside automated completion",
      workflowRouteImpact: "none; packet drift routes back to S4 evidence repair",
    },
    {
      phase: "source-ledger-freshness",
      command: "bun run src/cli.ts doctor",
      expected:
        "S4 decision source ledger freshness, required rows, and decision packet gates remain green",
      evidence: "doctor output with s4-decision-readiness and source ledger freshness gates",
      source: "HELIX source ledger freshness policy",
      sourceUrl: "docs/process/modes/discovery.md#s4-decision-source-ledger",
      sourceCheckedAt: "2026-07-02",
      latestOfficialStatus:
        "S4 source ledger remains anchored to Scrum Guide 2020, ISO/IEC/IEEE 29148, ISTQB Glossary, and NIST SSDF rows",
      sourceStatusDelta: "none; local source ledger reviewed against current HEAD",
      adoptionDecision: "adopt-s4-source-ledger-freshness-before-po-decision",
      adoptionDecisionDelta: "none; stale or incomplete ledger still blocks S4 terminal use",
      workflowRouteImpact: "none; stale ledger routes the PLAN back to S4 evidence repair",
    },
    {
      phase: "s3-verification-evidence",
      command: "run the PLAN-declared S3 verification command(s) cited by verified_evidence",
      expected:
        "verified_evidence points to concrete test/review output instead of a planned or prose-only claim",
      evidence:
        "test output, review evidence path, audit id, or digest cited by s4_decision_record.verified_evidence",
      source: "HELIX Scrum S3->S4 verification boundary",
      sourceUrl: "docs/process/modes/scrum.md",
      sourceCheckedAt: "2026-07-02",
      latestOfficialStatus: "Scrum Guide official current version remains November 2020",
      sourceStatusDelta: "none; S3 verify remains evidence before S4 decide",
      adoptionDecision: "adopt-s3-verified-evidence-as-s4-entry-gate",
      adoptionDecisionDelta: "none; S3 verification alone remains non-terminal",
      workflowRouteImpact: "none; missing verified_evidence keeps PLAN in S3/S4 repair",
    },
    {
      phase: "requirements-trace",
      command: "bun run src/cli.ts doctor",
      expected:
        "G1/G3 trace, l6-fr-coverage, oracle-test-trace, and semantic frontier gates stay green before S4 outcome selection",
      evidence: "doctor output and trace/oracle gate lines",
      source: "HELIX V-model trace gate",
      sourceUrl: "docs/governance/ut-tdd-agent-harness-requirements_v1.2.md",
      sourceCheckedAt: "2026-07-02",
      latestOfficialStatus: "local V-model trace gate contract current at HEAD",
      sourceStatusDelta: "none; G1/G3 trace remains required before S4 route selection",
      adoptionDecision: "adopt-vmodel-trace-gates-before-s4-outcome-selection",
      adoptionDecisionDelta: "none; keep requirements trace as S4 decision evidence",
      workflowRouteImpact: "none; trace failure routes back to Forward trace repair",
    },
    {
      phase: "targeted-regression",
      command: "bun test tests/s4-decision-readiness.test.ts tests/cli-surface.test.ts",
      expected: "S4 packet and CLI surface regressions stay green",
      evidence: "targeted vitest output",
      source: "HELIX S4 regression oracle",
      sourceUrl:
        "docs/test-design/harness/L7-unit-test-design.md#decision-record-and-completion-frontier",
      sourceCheckedAt: "2026-07-02",
      latestOfficialStatus: "local S4 regression oracle current at HEAD",
      sourceStatusDelta: "none; S4 packet oracle reviewed against current HEAD",
      adoptionDecision: "adopt-targeted-regression-before-s4-decision-review",
      adoptionDecisionDelta: "none; keep targeted regression before PO decision use",
      workflowRouteImpact: "none; regression failure routes back to L7 repair",
    },
    {
      phase: "static-gates",
      command: "bun run lint && bun run typecheck && git diff --check",
      expected: "format, type, and whitespace gates pass before S4 decision recording",
      evidence: "lint/typecheck/diff-check command output",
      source: "HELIX repository static gate policy",
      sourceUrl: "AGENTS.md#test-rules",
      sourceCheckedAt: "2026-07-02",
      latestOfficialStatus: "repository AGENTS test rules current at HEAD",
      sourceStatusDelta: "none; static gate policy reviewed against current HEAD",
      adoptionDecision: "adopt-static-gates-before-s4-decision-review",
      adoptionDecisionDelta: "none; keep static gates before S4 terminal update",
      workflowRouteImpact: "none; static failure routes back to implementation repair",
    },
    {
      phase: "full-regression",
      command: "bun run test",
      expected:
        "full repository regression suite passes before terminal S4 promotion/rejection/pivot",
      evidence: "full vitest output",
      source: "HELIX full regression policy",
      sourceUrl: "docs/test-design/harness/L7-unit-test-design.md",
      sourceCheckedAt: "2026-07-02",
      latestOfficialStatus: "local HELIX full regression policy current at HEAD",
      sourceStatusDelta: "none; full regression policy reviewed against current HEAD",
      adoptionDecision: "adopt-full-regression-before-terminal-s4-route",
      adoptionDecisionDelta: "none; keep full regression as terminal S4 blocker",
      workflowRouteImpact: "none; full regression failure blocks S4 decision recording",
    },
    {
      phase: "completion-frontier",
      command: "bun run src/cli.ts status --json",
      expected:
        "completionReadiness remains blocked until decision_outcome and required route evidence are recorded",
      evidence: "status JSON completionDecisionPacket and semanticFeatureFrontierRecords",
      source: "HELIX completion frontier contract",
      sourceUrl: "docs/design/helix/L3-requirements/pillar-functional-requirements.md",
      sourceCheckedAt: "2026-07-02",
      latestOfficialStatus: "local semantic frontier contract current at HEAD",
      sourceStatusDelta: "none; frontier_pending_decision remains completion blocker",
      adoptionDecision: "adopt-semantic-frontier-blocker-before-s4-terminal-status",
      adoptionDecisionDelta: "none; do not count S4 pending plans as complete",
      workflowRouteImpact: "none; unresolved frontier keeps completionReadiness blocked",
    },
  ];
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
  if (!isS3PocPendingDecision(plan)) {
    reasons.push("plan is not an S3 draft PoC pending PO decision");
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

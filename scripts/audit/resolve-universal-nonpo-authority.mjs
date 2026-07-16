#!/usr/bin/env node

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

const candidatePath = "docs/governance/generated/universal-nonpo-question-design-closure-v1.json";
const reviewPath = "docs/governance/generated/universal-nonpo-question-design-closure-independent-review-v1.json";
const poPath = "docs/governance/generated/universal-workflow-po-decision-packet-v1.json";
const agentsPath = "AGENTS.md";
const standingPath = "docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md";
const authorityPath = "docs/governance/vmodel-authority-receipt-v1.md";
const bytes = (path) => readFileSync(path);
const load = (path) => JSON.parse(bytes(path));
const sha = (value) => createHash("sha256").update(value).digest("hex");
const digest = (value) => sha(JSON.stringify(value));
const source = (path) => ({ path, sha256: sha(bytes(path)) });

const candidate = load(candidatePath);
const review = load(reviewPath);
const po = load(poPath);
const poIds = new Set(po.decision_groups.flatMap((group) => group.question_ids));
const open = candidate.records.filter((row) => !row.closure.status.startsWith("design_answer_receipt_activated"));
const standingText = bytes(standingPath).toString("utf8");
const authorityText = bytes(authorityPath).toString("utf8");

const records = open.map((row) => {
  const required = row.closure.authority.required_for_activation ?? [];
  const highImpact = required.filter((name) => /security|privacy|high_impact/iu.test(name));
  const sourceIds = [...new Set([
    ...row.closure.provenance.flatMap((item) => item.ids ?? []),
    ...(row.closure.dependencies ?? []).map((item) => item.dependency_id),
  ])].sort();
  const standingIds = sourceIds.filter((id) => /^(?:HIL-FR-5[789]|HIL-FR-60|HR-FR-HIL-2[34])$/u.test(id) && standingText.includes(id));
  const authoritySource = {
    required_authorities: required,
    source_ids: sourceIds,
    standing_authorization_ids: standingIds,
    vmodel_authority_status: authorityText.includes("status: pending-po-approval") || authorityText.includes("pending-po-approval") ? "pending_po_approval" : "unknown",
    standing_authorization_design_status: standingIds.length ? "design_defined_not_runtime_authority_and_not_PO_substitute" : "not_applicable",
  };
  let resolution;
  if (row.closure.class === "dependency_reaudit") {
    const receiptBody = {
      question_id: row.question_id,
      disposition: row.closure.status.includes("missing_value") ? "terminal_challenge" : "terminal_defer",
      answer_activated: false,
      dependency_ids: (row.closure.dependencies ?? []).map((item) => item.dependency_id),
      activation_condition: (row.closure.dependencies ?? []).map((item) => item.resolution),
      authority_source: authoritySource,
      oracle: row.closure.oracle,
    };
    resolution = {
      owner_class: highImpact.length ? "PO_and_high_impact_authority" : "PO_authority_with_AI_drafter",
      authority_classification: highImpact.length ? "high_impact_authority_required_no_AI_substitution" : "PO_authority_required_no_AI_substitution",
      status: row.closure.status.includes("missing_value") ? "ai_terminal_challenge_receipt_candidate" : "ai_terminal_defer_receipt_candidate",
      terminal_design_receipt: { ...receiptBody, receipt_sha256: digest(receiptBody) },
      design_question_obligation_closed_by_terminal_receipt: true,
      answer_activated: false,
      activation_condition: receiptBody.activation_condition,
      design_freeze_credit: true,
    };
  } else {
    const highImpactDomain = required.includes("security_privacy_authority")
      ? "privacy_security_scope"
      : required.includes("security_authority_for_high_impact")
        ? "external_integration_security_scope"
        : null;
    resolution = {
      owner_class: highImpact.length ? "AI_design_authority_with_grouped_high_impact_activation_gate" : "AI_design_authority_pending_single_VMAUTH_activation",
      authority_classification: highImpact.length ? "information_answer_terminal_grouped_high_impact_activation_pending" : "information_answer_terminal_single_VMAUTH_activation_pending",
      status: "terminal_design_evidence_current_activation_pending",
      terminal_design_receipt: {
        question_id: row.question_id,
        answer_value_sha256: row.closure.answer_value_sha256,
        evidence_digests: row.closure.provenance.map((item) => item.rebound_artifact_digest),
        activation_scope: "VMAUTH-PO-01 exact current packet",
        high_impact_domain: highImpactDomain,
        answer_activated: false,
      },
      design_question_obligation_closed_by_terminal_receipt: true,
      answer_activated: false,
      activation_condition: ["VMAUTH-PO-01 approval bound to current packet digest", ...(highImpactDomain ? [`${highImpactDomain} grouped authority approval for the exact shared scope`] : [])],
      design_freeze_credit: true,
    };
    resolution.terminal_design_receipt.receipt_sha256 = digest(resolution.terminal_design_receipt);
  }
  return {
    question_id: row.question_id,
    po22_overlap: poIds.has(row.question_id),
    original_class: row.closure.class,
    answer_value_sha256: row.closure.answer_value_sha256 ?? null,
    authority_source: authoritySource,
    resolution,
    runtime_verified: false,
    coverage_credit: false,
  };
});

const count = (fn) => records.filter(fn).length;
const output = {
  schema_version: "helix.universal-nonpo-authority-resolution.v1",
  status: "authority_resolution_corrected_information_questions_terminal_single_PO_unit_pending",
  generated_at: "2026-07-16",
  sources: [source(candidatePath), source(reviewPath), source(poPath), source(agentsPath), source(standingPath), source(authorityPath)],
  policy: {
    standing_authorization_boundary: "routine execution permission cannot activate pending requirements authoring authority and cannot override PO/high-impact gates",
    ai_terminal_receipt_boundary: "AI may terminally defer/challenge a dependency question without choosing its answer; activation conditions remain explicit",
    non_po_boundary: "the 37 evidence-current rows are information/design questions outside the six PO option groups; AI design authority may close their answer obligation, while one aggregate VMAUTH approval activates the current packet",
  },
  summary: {
    records: records.length,
    evidence_information_terminal_activation_pending: count((row) => row.original_class === "evidence_answered_reaudit"),
    dependency_rows: count((row) => row.original_class === "dependency_reaudit"),
    ai_design_authority_information_rows: count((row) => row.original_class === "evidence_answered_reaudit"),
    evidence_rows_with_grouped_high_impact_gate: count((row) => row.original_class === "evidence_answered_reaudit" && row.resolution.terminal_design_receipt?.high_impact_domain),
    ai_terminal_defer_receipt_candidates: count((row) => row.resolution.status === "ai_terminal_defer_receipt_candidate"),
    ai_terminal_challenge_receipt_candidates: count((row) => row.resolution.status === "ai_terminal_challenge_receipt_candidate"),
    authority_pending_not_activated: count((row) => row.resolution.status === "terminal_defer_authority_pending_not_activated"),
    design_question_obligations_closed_by_terminal_receipt: count((row) => row.resolution.design_question_obligation_closed_by_terminal_receipt),
    answer_activated: count((row) => row.resolution.answer_activated),
    po22_overlap: count((row) => row.po22_overlap),
    po_decision_units_existing_universal_groups: po.decision_groups.length,
    po_decision_units_additional_vmodel_authority: 1,
    po_decision_units_total: po.decision_groups.length + 1,
    individual_po_answers_required_for_evidence_rows: 0,
    grouped_high_impact_authority_units: new Set(records.map((row) => row.resolution.terminal_design_receipt?.high_impact_domain).filter(Boolean)).size,
    runtime_verified: 0,
    coverage_credit_true: 0,
  },
  invariants: ["records=37+5=42", "PO22 overlap=0", "37 non-PO information answers require zero individual PO decisions", "six Universal decision groups plus one VMAUTH approval = seven PO decision units", "standing authorization never substitutes PO/high-impact authoring authority", "terminal defer/challenge does not activate an answer", "runtime/coverage remain zero"],
  records,
};
if (records.length !== 42 || output.summary.evidence_information_terminal_activation_pending !== 37 || output.summary.dependency_rows !== 5 || output.summary.po22_overlap !== 0) throw new Error("authority denominator drift");
if (output.summary.answer_activated !== 0 || output.summary.runtime_verified !== 0 || output.summary.coverage_credit_true !== 0) throw new Error("authority boundary violated");
process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);

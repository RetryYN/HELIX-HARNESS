#!/usr/bin/env node

import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";

const paths = {
  answerability: "docs/governance/generated/universal-workflow-interview-answerability-audit-v1.json",
  dispositions: "docs/governance/generated/universal-workflow-question-dispositions-v1.json",
  queue: "docs/governance/generated/universal-workflow-question-migration-queue-v1.json",
  po: "docs/governance/generated/universal-workflow-po-decision-packet-v1.json",
  semantic: "docs/governance/generated/universal-workflow-semantic-decisions-v1.json",
  chatReview: "docs/governance/generated/chat-independent-review-receipt-v1.json",
  l1: "docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md",
  l3: "docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md",
  vmodel: "docs/governance/vmodel-authority-receipt-v1.md",
  connector: "docs/design/helix/L4-basic-design/infinity-loop-platform-basic-design.md",
  productConnector: "docs/design/helix/L5-detail/product-data-connector.md",
};
const bytes = (path) => readFileSync(path);
const load = (path) => JSON.parse(bytes(path));
const sha = (value) => createHash("sha256").update(value).digest("hex");
const digest = (value) => sha(JSON.stringify(value));
const source = (path) => ({ path, sha256: sha(bytes(path)) });

const answerability = load(paths.answerability).document.records;
const dispositions = load(paths.dispositions).document.questions;
const migration = load(paths.queue).document;
const po = load(paths.po);
const semantic = load(paths.semantic);
const poIds = new Set(po.decision_groups.flatMap((group) => group.question_ids));
const auditById = new Map(answerability.map((row) => [row.question_id, row]));
const dispositionById = new Map(dispositions.map((row) => [row.question_id, row]));
const migrationIds = new Set(migration.id_migration.mappings.flatMap((row) => [row.old_id, row.canonical_id]));
const semanticQuestionIds = new Set(JSON.stringify(semantic).match(/UWR-Q-[A-Z0-9_-]+/gu) ?? []);

const dependencyCatalog = {
  connector_registry_scope: {
    artifacts: [source(paths.connector), source(paths.productConnector)],
    resolution: "registered connector/actionごとのretry class、回数、interval、timeout、idempotencyを同一revisionでfreezeしnegative oracleへbindする",
  },
  "product_data.classification_policy": {
    artifacts: [source(paths.productConnector)],
    resolution: "data class別retention period、purge authority、tombstone、legal/security review receiptをfreezeする",
  },
  canonical_workflow_state_model: {
    artifacts: [source(paths.connector)],
    resolution: "canonical state/transition/terminal/loop budgetを固定しHST-HIL-035/036/037へexact bindする",
  },
  "VMAUTH-2026-07-16-01": {
    artifacts: [source(paths.vmodel)],
    resolution: "current packet digestに対するPO approval eventを記録する。AIは代行しない",
  },
};

const records = [];
for (const disposition of dispositions) {
  if (poIds.has(disposition.question_id)) continue;
  const audited = auditById.get(disposition.question_id);
  let closure;
  if (!audited) {
    const provenance = [source(paths.dispositions), source(paths.chatReview)];
    const receipt = {
      question_id: disposition.question_id,
      answer_value: disposition.answer,
      original_value_digest: disposition.value_digest,
      provenance,
      authority: disposition.authority,
      oracle: { acceptance_id: "HAT-HIL-20", system_id: "HST-HIL-035", assertion: "typed question answer preserves source IDs, authority and no-guess provenance" },
    };
    closure = {
      class: "existing_po_chat_answer_design_receipt",
      status: "design_answer_receipt_activated_source_limited",
      answer: receipt,
      answer_receipt_sha256: digest(receipt),
      activation_basis: "existing current PO_chat_primary disposition; no option selected or answer synthesized by AI",
      freeze_credit: true,
    };
  } else if (audited.classification === "evidence_answered") {
    const evidenceChecks = audited.evidence.map((item) => {
      const current = item.path && existsSync(item.path) ? sha(bytes(item.path)) : null;
      const currentText = item.path && existsSync(item.path) ? bytes(item.path).toString("utf8") : "";
      const idsExist = (item.ids ?? []).every((id) => currentText.includes(id));
      return {
        ...item,
        current_sha256: current,
        digest_matches_current: current !== null && item.artifact_digest === `sha256:${current}`,
        ids_exist_in_current: idsExist,
        rebound_artifact_digest: current !== null && idsExist ? `sha256:${current}` : null,
        semantic_binding_current: current !== null && idsExist,
      };
    });
    const rebound = evidenceChecks.every((item) => item.semantic_binding_current);
    closure = {
      class: "evidence_answered_reaudit",
      status: rebound ? "design_evidence_rebound_authority_not_activated" : "challenge_stale_provenance_and_authority_not_activated",
      answer_value: audited.candidate_answer,
      answer_value_sha256: digest(audited.candidate_answer),
      provenance: evidenceChecks,
      authority: audited.authority,
      oracle: { acceptance_id: "HAT-HIL-20", system_id: "HST-HIL-035", required: "all evidence digests current and every required activation authority receipt current" },
      challenge: {
        stale_observed_digest_count: evidenceChecks.filter((item) => !item.digest_matches_current).length,
        unbound_current_evidence_count: evidenceChecks.filter((item) => !item.semantic_binding_current).length,
        resolution: rebound
          ? "current semantic IDsへdigestを再bind済み。listed authority receiptsをAI代行なしで取得する"
          : "missing current semantic evidenceを解消し、listed authority receiptsをAI代行なしで取得する",
      },
      freeze_credit: false,
    };
  } else {
    const dependencies = audited.dependencies.map((id) => ({ dependency_id: id, ...(dependencyCatalog[id] ?? { artifacts: [], resolution: "dependency has no canonical artifact; create a typed gap Issue before activation" }) }));
    closure = {
      class: "dependency_reaudit",
      status: audited.candidate_answer ? "terminal_defer_dependency_not_activated" : "terminal_challenge_missing_value_not_activated",
      answer_value: audited.candidate_answer,
      answer_value_sha256: audited.candidate_answer ? digest(audited.candidate_answer) : null,
      provenance: audited.evidence,
      authority: audited.authority,
      oracle: { acceptance_id: "HAT-HIL-20", system_id: "HST-HIL-035", required: "all dependency resolution conditions and authority receipts current" },
      dependencies,
      freeze_credit: false,
    };
  }
  records.push({
    question_id: disposition.question_id,
    source_question: disposition.question,
    original_disposition: disposition.disposition,
    id_migration_overlap: migrationIds.has(disposition.question_id),
    semantic_decision_overlap: semanticQuestionIds.has(disposition.question_id),
    closure,
    coverage_credit: false,
  });
}

const count = (fn) => records.filter(fn).length;
const output = {
  schema_version: "helix.universal-nonpo-question-design-closure.v1",
  status: "ai_only_reaudit_complete_po22_untouched",
  generated_at: "2026-07-16",
  sources: Object.values(paths).map(source),
  scope: { all_questions: 76, excluded_po_questions: 22, excluded_po_decision_groups: 6, non_po_questions: 54 },
  summary: {
    records: records.length,
    existing_po_chat_answer_design_receipts: count((row) => row.closure.class === "existing_po_chat_answer_design_receipt"),
    evidence_answered_challenged: count((row) => row.closure.class === "evidence_answered_reaudit"),
    evidence_answered_rebound_authority_pending: count((row) => row.closure.status === "design_evidence_rebound_authority_not_activated"),
    dependency_deferred_or_challenged: count((row) => row.closure.class === "dependency_reaudit"),
    design_answer_receipt_activated: count((row) => row.closure.status === "design_answer_receipt_activated_source_limited"),
    activation_blocked: count((row) => !row.closure.status.startsWith("design_answer_receipt_activated")),
    id_migration_overlap: count((row) => row.id_migration_overlap),
    semantic_decision_overlap: count((row) => row.semantic_decision_overlap),
    remaining12_id_migration_overlap: count((row) => row.closure.class === "existing_po_chat_answer_design_receipt" && row.id_migration_overlap),
    remaining12_semantic_decision_overlap: count((row) => row.closure.class === "existing_po_chat_answer_design_receipt" && row.semantic_decision_overlap),
    po_rows_modified: 0,
    coverage_credit_true: count((row) => row.coverage_credit),
  },
  invariants: [
    "records=54 and excluded PO questions=22/6 groups",
    "37 evidence rows + 5 dependency rows + 12 existing PO chat answer rows = 54",
    "AI never synthesizes an answer value or selects a PO option",
    "stale provenance and missing dependency authority fail closed",
    "Design answer receipt does not grant runtime or coverage credit",
  ],
  records,
};
if (records.length !== 54 || output.summary.existing_po_chat_answer_design_receipts !== 12 || output.summary.evidence_answered_challenged !== 37 || output.summary.dependency_deferred_or_challenged !== 5) throw new Error("non-PO denominator drift");
if (output.summary.po_rows_modified !== 0 || output.summary.coverage_credit_true !== 0) throw new Error("authority boundary violated");
process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);

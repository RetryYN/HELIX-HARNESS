#!/usr/bin/env node

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

const paths = {
  critical: "docs/governance/generated/design-freeze-critical-path-v1.json",
  po: "docs/governance/generated/universal-workflow-po-decision-packet-v1.json",
  vmodel: "docs/governance/generated/vmodel-authority-decision-packet-v1.json",
  bunCandidate: "docs/governance/generated/helix-df-bun-002-terminal-design-receipts-v1.json",
  bunReview: "docs/governance/generated/helix-df-bun-002-terminal-design-receipts-independent-review-v1.json",
  exactCandidate: "docs/governance/generated/exact2-semantic-normalization-manifest-v1.json",
  exactReview: "docs/governance/generated/exact2-semantic-normalization-independent-review-v1.json",
  universalReview: "docs/governance/generated/universal-nonpo-authority-resolution-independent-review-v1.json",
  savepointReview: "docs/governance/generated/repository-savepoint-layer-tag-design-independent-review-v1.json",
  layerReview: "docs/governance/generated/l1-l12-layer-semantics-remediation-independent-review-v3.json",
  activation: "docs/governance/generated/po7-activation-runtime-independent-audit-v1.json",
};
const raw = (path) => readFileSync(path);
const load = (path) => JSON.parse(raw(path));
const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const source = (path) => ({ path, sha256: sha256(raw(path)) });
const data = Object.fromEntries(Object.entries(paths).map(([key, path]) => [key, load(path)]));
const designById = new Map(data.critical.design_freeze_critical_path.map((row) => [row.blocker_id, row]));
const runtimeById = new Map(data.critical.runtime_acceptance_blockers_separated.map((row) => [row.blocker_id, row]));

const poIds = new Set(data.po.decision_groups.flatMap((group) => group.question_ids));
const vmodelIds = new Set(data.vmodel.missing_po_decisions.map((row) => row.id));
const bunPass = data.bunReview.status.startsWith("independent_review_pass_")
  && data.bunReview.decision.design_freeze.startsWith("closed_")
  && data.bunCandidate.design_freeze_decision.open_design_obligations === 0;
const exactCurrent = data.exactReview.sources.normalization_manifest.sha256 === sha256(raw(paths.exactCandidate));
const exactPass = exactCurrent
  && data.exactReview.status.startsWith("design_closure_accepted_")
  && data.exactReview.decision.pending_zero_recognized_as_design_closure === true;
const layerFindings = Array.isArray(data.layerReview.findings) ? data.layerReview.findings : null;
const layerOpen = {
  findings: layerFindings?.length ?? 1,
  independent_open_backlog: data.layerReview.summary?.independent_open_backlog ?? 1,
  producer_open_backlog: data.layerReview.summary?.producer_open_backlog ?? 1,
  unresolved: data.layerReview.summary?.unresolved ?? 1,
};
const layerPass = data.layerReview.status === "independent_review_pass_design_closed_runtime_unchanged"
  && layerFindings !== null
  && Object.values(layerOpen).every((value) => value === 0);
const nonblocking = new Map(data.critical.current_nonblocking_review_sources.map((row) => [row.role, row]));
const expectedNonblocking = {
  universal_nonpo_authority: paths.universalReview,
  savepoint_layer_tag_design: paths.savepointReview,
};
const issues = [];
const requireCheck = (condition, code, evidence) => {
  if (!condition) issues.push({ code, evidence });
};

requireCheck(data.critical.design_freeze_critical_path.length === 8, "design_row_denominator", data.critical.design_freeze_critical_path.length);
requireCheck(data.critical.runtime_acceptance_blockers_separated.length === 5, "runtime_row_denominator", data.critical.runtime_acceptance_blockers_separated.length);
requireCheck(data.critical.summary.po_authority_decision_units === 7 && data.po.summary.decision_groups === 6 && data.vmodel.counts.missing_po_decisions === 1, "po_authority_units", data.critical.summary.po_authority_decision_units);
const activationPass = data.activation.status === "independent_audit_pass_authority_activated"
  && data.activation.projection.decision_groups_activated === 6
  && data.activation.projection.question_receipts_activated === 22
  && data.activation.projection.vmodel_authority_events === 1
  && data.activation.projection.freeze_blocker_status === "closed";
requireCheck(activationPass, "po_authority_activation_not_current", data.activation);
requireCheck(designById.get("DF-PO-001")?.status === "closed" && designById.get("DF-PO-002")?.status === "closed", "po_design_rows_not_closed", [designById.get("DF-PO-001"), designById.get("DF-PO-002")]);
requireCheck([...vmodelIds].every((id) => !poIds.has(id)), "po_authority_overlap", [...vmodelIds]);
requireCheck(designById.get("DF-BUN-002")?.status === (bunPass ? "closed" : "open"), "bun_design_status_not_review_derived", { bunPass, row: designById.get("DF-BUN-002") });
requireCheck(runtimeById.has("RA-BUN-001") && runtimeById.get("RA-BUN-001").status === "open", "bun_runtime_not_open", runtimeById.get("RA-BUN-001"));
requireCheck(designById.get("DF-EXACT2-001")?.status === (exactPass ? "closed" : "open"), "exact2_design_status_not_review_derived", { exactCurrent, exactPass, row: designById.get("DF-EXACT2-001") });
requireCheck(runtimeById.has("RA-EXACT2-001") && runtimeById.get("RA-EXACT2-001").status === "open", "exact2_runtime_not_open", runtimeById.get("RA-EXACT2-001"));
requireCheck(designById.get("DF-LAYER-SEM-001")?.status === (layerPass ? "closed" : "open"), "layer_semantics_status_not_strict_review_derived", { layerPass, layerOpen, row: designById.get("DF-LAYER-SEM-001") });
requireCheck(designById.get("DF-LAYER-SEM-001")?.source_artifact?.path === paths.layerReview && designById.get("DF-LAYER-SEM-001")?.source_artifact?.sha256 === sha256(raw(paths.layerReview)), "layer_semantics_strict_review_stale", designById.get("DF-LAYER-SEM-001"));
requireCheck(!nonblocking.has("layer_semantics"), "layer_semantics_must_not_be_nonblocking", nonblocking.get("layer_semantics"));
for (const [role, path] of Object.entries(expectedNonblocking)) {
  const row = nonblocking.get(role);
  requireCheck(row?.path === path && row?.sha256 === sha256(raw(path)), "nonblocking_review_source_stale_or_missing", { role, row });
}
const designIds = new Set(designById.keys());
requireCheck([...runtimeById.keys()].every((id) => !designIds.has(id)), "design_runtime_identity_overlap", [...runtimeById.keys()].filter((id) => designIds.has(id)));
requireCheck(data.critical.summary.coverage_credit_true === 0 && data.critical.summary.verified_true === 0 && data.critical.summary.runtime_execution_credit_in_design_freeze === 0, "premature_design_credit", data.critical.summary);
requireCheck(data.critical.summary.design_freeze_open_rows === 0 && data.critical.summary.po_authority_activated_units === 7 && Object.keys(data.critical.summary.open_by_owner_class).length === 0, "design_freeze_not_closed", data.critical.summary);
requireCheck(data.critical.status === "design_freeze_authority_activated_runtime_separated", "critical_status_wrong", data.critical.status);

const output = {
  schema_version: "helix.design-freeze-critical-path-independent-review.v2",
  status: issues.length ? "independent_review_findings_open" : "independent_review_pass_current_evidence_runtime_separated",
  generated_at: "2026-07-16",
  review_authority: {
    producer_identity: "python:generate-design-freeze-critical-path.py",
    producer_runtime: "python3",
    reviewer_identity: "node:review-design-freeze-critical-path.mjs",
    reviewer_runtime: "node",
    reviewer_model: "deterministic-source-rebound-review-v2",
    runtime_model_separated: true,
  },
  sources: Object.values(paths).map(source),
  projection: {
    design_rows: data.critical.design_freeze_critical_path.length,
    design_open_rows: data.critical.summary.design_freeze_open_rows,
    runtime_rows: data.critical.runtime_acceptance_blockers_separated.length,
    po_decision_units: data.critical.summary.po_authority_decision_units,
    df_bun_002: { review_pass: bunPass, design_status: designById.get("DF-BUN-002").status, runtime_status: runtimeById.get("RA-BUN-001").status },
    df_exact2_001: { review_current: exactCurrent, review_pass: exactPass, design_status: designById.get("DF-EXACT2-001").status, runtime_status: runtimeById.get("RA-EXACT2-001").status },
    df_layer_sem_001: { review_pass: layerPass, review_open: layerOpen, design_status: designById.get("DF-LAYER-SEM-001").status },
    nonblocking_current_reviews: [...nonblocking.keys()].sort(),
  },
  findings: issues,
  safety: { runtime_execution_credit: 0, verified: false, coverage_credit: false },
};
if (issues.length) throw new Error(JSON.stringify(output));
process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);

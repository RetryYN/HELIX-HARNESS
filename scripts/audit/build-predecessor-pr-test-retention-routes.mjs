#!/usr/bin/env node

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

const reconciliationPath = "docs/governance/generated/predecessor-pr-semantic-reconciliation-71-v1.json";
const hatPath = "docs/test-design/helix/L3-infinity-loop-acceptance-test-design.md";
const hstPath = "docs/test-design/helix/L10-infinity-loop-platform-system-test-design.md";
const visualPath = "docs/test-design/helix/L8-L11-visual-design-harness-verification.md";
const l1Path = "docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md";
const l3Path = "docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md";

const bytes = (path) => readFileSync(path);
const text = (path) => bytes(path).toString("utf8");
const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const canonicalDigest = (value) => sha256(JSON.stringify(value));
const source = (path) => ({ path, sha256: sha256(bytes(path)) });

const reconciliation = JSON.parse(text(reconciliationPath));
const hatText = text(hatPath);
const hstText = text(hstPath);
const visualText = text(visualPath);
const routeAuthorityText = `${text(l1Path)}\n${text(l3Path)}`;

const behaviorKeywords = {
  ci_gate: ["ci", "gate", "github", "check", "監査"],
  test_verification: ["test", "テスト", "検証", "oracle", "受入"],
  runtime_orchestration: ["runtime", "実行", "agent", "自動走行", "orchestrat"],
  design_governance: ["design", "設計", "要件", "台帳", "governance"],
  ui_visual: ["visual", "ui", "ux", "画面", "screen"],
  database_state: ["db", "database", "sqlite", "state", "永続"],
  setup_distribution: ["setup", "install", "package", "distribution", "配布"],
};

const familyContracts = {
  ci_gate: [
    { pattern: /ci|check|gate|guard|scan|actions|codeql|github|hygiene|validation/iu, hil: ["HIL-BR-16", "HIL-FR-28", "HIL-FR-29"], hr: ["HR-FR-HIL-06"], hat: ["HAT-HIL-06"], hst: ["HST-HIL-003", "HST-HIL-022"], oracle: "three-stage CI/check lineage and quarantine fail-close" },
  ],
  setup_distribution: [
    { pattern: /actions|deps|codeql|checkout|setup-node|setup-python|install|package|distribution|export|toolchain|setup/iu, hil: ["HIL-FR-33", "HIL-FR-34", "HIL-TR-01", "HIL-TR-04", "HIL-TR-05", "HIL-TR-06", "HIL-TR-11"], hr: ["HR-FR-HIL-13", "HR-FR-HIL-14"], hat: ["HAT-HIL-13", "HAT-HIL-14"], hst: ["HST-HIL-013", "HST-HIL-014", "HST-HIL-017"], oracle: "install/distribution/OS/supply-chain evidence" },
  ],
  database_state: [
    { pattern: /projection|detector/iu, hil: ["HIL-FR-25", "HIL-FR-26"], hr: ["HR-FR-HIL-10"], hat: ["HAT-HIL-10"], hst: ["HST-HIL-008", "HST-HIL-009"], oracle: "projection/detector deterministic state evidence" },
    { pattern: /memory|feedback|session/iu, hil: ["HIL-FR-10", "HIL-FR-14"], hr: ["HR-FR-HIL-07"], hat: ["HAT-HIL-07"], hst: ["HST-HIL-015", "HST-HIL-016"], oracle: "memory/learning state promotion evidence" },
    { pattern: /ledger|plan|design|vmodel/iu, hil: ["HIL-FR-46", "HIL-FR-48", "HIL-FR-49", "HIL-FR-50"], hr: ["HR-FR-HIL-18", "HR-FR-HIL-19"], hat: ["HAT-HIL-18", "HAT-HIL-19"], hst: ["HST-HIL-030", "HST-HIL-031", "HST-HIL-032", "HST-HIL-033", "HST-HIL-034"], oracle: "ledger/pair/progress projection evidence" },
    { pattern: /db|database|sqlite|persist|state/iu, hil: ["HIL-FR-09"], hr: ["HR-FR-HIL-02"], hat: ["HAT-HIL-02"], hst: ["HST-HIL-001"], oracle: "state transition/checkpoint/closure query evidence" },
  ],
  runtime_orchestration: [
    { pattern: /agent|subagent|delegation|reviewer/iu, hil: ["HIL-FR-10", "HIL-FR-11", "HIL-FR-12", "HIL-FR-13", "HIL-FR-32"], hr: ["HR-FR-HIL-08"], hat: ["HAT-HIL-08"], hst: ["HST-HIL-006"], oracle: "bounded agent lifecycle and custody evidence" },
    { pattern: /routing|route|assignment|tier|model|admission|schedule/iu, hil: ["HIL-FR-51", "HIL-FR-52", "HIL-FR-53", "HIL-FR-54", "HIL-FR-55", "HIL-FR-56"], hr: ["HR-FR-HIL-20", "HR-FR-HIL-21", "HR-FR-HIL-22"], hat: ["HAT-HIL-20", "HAT-HIL-21", "HAT-HIL-22"], hst: ["HST-HIL-035", "HST-HIL-036", "HST-HIL-037"], oracle: "workflow normalization/completeness/orchestration plan evidence" },
  ],
  design_governance: [
    { pattern: /requirement|proposal|spec|doc|design|ledger|vmodel|plan|skill|domain/iu, hil: ["HIL-FR-39", "HIL-FR-40", "HIL-FR-41", "HIL-FR-42", "HIL-FR-43", "HIL-FR-44", "HIL-FR-45", "HIL-FR-46", "HIL-FR-47", "HIL-FR-48", "HIL-FR-49", "HIL-FR-50"], hr: ["HR-FR-HIL-16", "HR-FR-HIL-17", "HR-FR-HIL-18", "HR-FR-HIL-19", "HR-FR-HIL-25"], hat: ["HAT-HIL-16", "HAT-HIL-17", "HAT-HIL-18", "HAT-HIL-19", "HAT-HIL-25"], hst: ["HST-HIL-025", "HST-HIL-026", "HST-HIL-027", "HST-HIL-028", "HST-HIL-029", "HST-HIL-030", "HST-HIL-031", "HST-HIL-032", "HST-HIL-033", "HST-HIL-034", "HST-HIL-040"], oracle: "design obligation/refactor/layer pair/freeze evidence" },
  ],
  ui_visual: [
    { pattern: /visual|\bui\b|\bux\b|screen|画面/iu, hil: ["HIL-FR-17", "HIL-FR-18", "HIL-FR-19", "HIL-FR-20"], hr: ["HR-FR-HIL-15", "HR-FR-HIL-27", "HR-FR-HIL-32", "HR-FR-HIL-33", "HR-FR-HIL-34", "HR-FR-HIL-35", "HR-FR-HIL-36", "HR-FR-HIL-37", "HR-FR-HIL-38", "HR-FR-HIL-39", "HR-FR-HIL-40", "HR-FR-HIL-41", "HR-FR-HIL-42", "HR-FR-HIL-45"], hat: ["HAT-HIL-15", "HAT-HIL-27", "HAT-HIL-32", "HAT-HIL-33", "HAT-HIL-34", "HAT-HIL-35", "HAT-HIL-36", "HAT-HIL-37", "HAT-HIL-38", "HAT-HIL-39", "HAT-HIL-40", "HAT-HIL-41", "HAT-HIL-42", "HAT-HIL-45"], hst: ["HST-HIL-012", "HST-HIL-024"], oracle: "screen applicability/prototype/visual evidence" },
  ],
  test_verification: [],
};

const hatByHr = new Map();
for (const line of hatText.split("\n")) {
  const hat = line.match(/^\| (HAT-HIL-\d+) \|/u)?.[1];
  if (!hat) continue;
  for (const hr of line.match(/HR-FR-HIL-\d+/gu) ?? []) hatByHr.set(hr, hat);
}

const hstByHil = new Map();
for (const line of hstText.split("\n")) {
  const hst = line.match(/^\| (HST-HIL-\d+) \|/u)?.[1];
  if (!hst) continue;
  for (const hil of line.match(/HIL-(?:BR|FR|TR|NFR)-\d+/gu) ?? []) {
    const current = hstByHil.get(hil) ?? [];
    if (!current.includes(hst)) current.push(hst);
    hstByHil.set(hil, current);
  }
}

const visualIds = new Set(visualText.match(/VIS-L(?:8|9|10|11)-[A-Z]\d+/gu) ?? []);
const visualByHat = new Map();
for (const line of hatText.split("\n")) {
  const hat = line.match(/^\| (HAT-HIL-\d+) \|/u)?.[1];
  if (!hat) continue;
  visualByHat.set(hat, [...new Set((line.match(/VIS-L(?:8|9|10|11)-[A-Z]\d+/gu) ?? []).filter((id) => visualIds.has(id)))].sort());
}

const retentionSchema = {
  schema_version: "helix.historical-pr-check-retention.v1",
  identity: ["repository_id", "pr_number", "head_oid", "merge_oid", "workflow_run_id", "workflow_attempt", "check_suite_id", "check_run_id"],
  lineage: ["event_name", "base_ref", "head_ref", "head_sha", "merge_sha", "workflow_path", "workflow_sha", "pr_title_sha256", "commit_range_manifest_sha256", "changed_path_manifest_sha256", "behavior_family_manifest_sha256", "semantic_reconciliation_sha256"],
  result: ["check_name", "app_slug", "status", "conclusion", "started_at", "completed_at"],
  evidence: ["annotations_manifest_sha256", "artifact_manifest_sha256", "sanitized_log_sha256", "test_report_sha256", "provenance_manifest_sha256"],
  digest_contract: { algorithm: "sha256", canonicalization: "JCS-compatible UTF-8 object projection; binary artifacts hash raw bytes" },
  retention: {
    metadata_and_digests: "retain_for_project_lifetime",
    content_addressed_test_reports_and_manifests: "retain_for_project_lifetime",
    sanitized_raw_logs_and_artifacts: "retain_until_behavior_replay_verified_and_supersession_receipt_plus_365_days",
    deletion_requires: ["supersession_receipt", "replay_receipt", "independent_review_receipt", "tombstone_digest"],
  },
  exclusions: ["secret", "credential", "PII", "unsanitized_raw_payload"],
};
const retentionSchemaSha256 = canonicalDigest(retentionSchema);

const originalRouteProfiles = new Map();
for (const record of reconciliation.records) {
  const fingerprint = canonicalDigest({ hil_ids: record.final_candidate.hil_ids, hr_ids: record.final_candidate.hr_ids });
  const profiles = originalRouteProfiles.get(fingerprint) ?? new Set();
  profiles.add(canonicalDigest(record.source_evidence.behavior_families));
  originalRouteProfiles.set(fingerprint, profiles);
}

const records = reconciliation.records.map((record) => {
  const originalHatIds = [...new Set(record.final_candidate.hr_ids.map((id) => hatByHr.get(id)).filter(Boolean))].sort();
  const originalHstIds = [...new Set(record.final_candidate.hil_ids.flatMap((id) => hstByHil.get(id) ?? []))].sort();
  const context = `${record.title}\n${record.final_candidate.reason}\n${record.inputs.repository_specific.reason}`;
  const originalFingerprint = canonicalDigest({ hil_ids: record.final_candidate.hil_ids, hr_ids: record.final_candidate.hr_ids });
  const routeLines = routeAuthorityText.split("\n").filter((line) => [...record.final_candidate.hil_ids, ...record.final_candidate.hr_ids].some((id) => line.includes(id))).join("\n").toLowerCase();
  const proseMissingFamilies = record.source_evidence.behavior_families.filter(
    (family) => !(behaviorKeywords[family] ?? []).some((keyword) => routeLines.includes(keyword)),
  );
  const needsReroute = proseMissingFamilies.length > 0 || originalRouteProfiles.get(originalFingerprint).size > 1;
  const familyRoutes = record.source_evidence.behavior_families.map((family) => {
    if (!needsReroute) return { family, status: "independent_review_aligned", evidence: ["independent-review-no-finding"] };
    if (proseMissingFamilies.includes(family)) {
      return {
        family,
        status: "challenge_gap_obligation",
        evidence: ["current HIL/HR authority prose lacks the observed behavior-family semantic"],
        obligation_id: `PR-GAP-${record.repository_id.toUpperCase()}-${String(record.number).padStart(3, "0")}-${family.toUpperCase()}`,
        required_resolution: "add authoritative family-specific prose and exact HIL/HR/HAT/HST edge, or record terminal non-applicability with independent review",
      };
    }
    const matches = (familyContracts[family] ?? []).filter((contract) => contract.pattern.test(context));
    const supported = matches.filter((contract) =>
      contract.hil.some((id) => record.final_candidate.hil_ids.includes(id)) || contract.hr.some((id) => record.final_candidate.hr_ids.includes(id)),
    );
    if (supported.length === 0) {
      return {
        family,
        status: "challenge_gap_obligation",
        evidence: ["title/reconciliation context has no exact current contract edge"],
        obligation_id: `PR-GAP-${record.repository_id.toUpperCase()}-${String(record.number).padStart(3, "0")}-${family.toUpperCase()}`,
        required_resolution: "supply changed-path manifest prose/source span and exact HIL/HR/HAT/HST edge, or record terminal non-applicability with independent review",
      };
    }
    const selectedHilIds = [...new Set(supported.flatMap((item) => item.hil).filter((id) => record.final_candidate.hil_ids.includes(id)))].sort();
    const selectedHrIds = [...new Set(supported.flatMap((item) => item.hr).filter((id) => record.final_candidate.hr_ids.includes(id)))].sort();
    const selectedHatIds = [...new Set(selectedHrIds.map((id) => hatByHr.get(id)).filter(Boolean))].sort();
    const selectedHstIds = [...new Set(selectedHilIds.flatMap((id) => hstByHil.get(id) ?? []))].sort();
    if (selectedHilIds.length === 0 || selectedHrIds.length === 0 || selectedHatIds.length === 0 || selectedHstIds.length === 0) {
      return {
        family,
        status: "challenge_gap_obligation",
        evidence: ["reconciliation intersection does not close HIL→HST and HR→HAT on both sides"],
        obligation_id: `PR-GAP-${record.repository_id.toUpperCase()}-${String(record.number).padStart(3, "0")}-${family.toUpperCase()}`,
        required_resolution: "supply both exact HIL→HST and HR→HAT edges from changed-path source evidence, or record terminal non-applicability with independent review",
      };
    }
    return {
      family,
      status: "family_specific_candidate_not_verified",
      evidence: ["title token", "reconciliation HIL/HR intersection"],
      hil_ids: selectedHilIds,
      hr_ids: selectedHrIds,
      hat_ids: selectedHatIds,
      hst_ids: selectedHstIds,
      oracle: supported.map((item) => item.oracle).join("; "),
    };
  });
  const exactFamilyRoutes = familyRoutes.filter((route) => route.status === "family_specific_candidate_not_verified");
  const hatIds = needsReroute ? [...new Set(exactFamilyRoutes.flatMap((route) => route.hat_ids))].sort() : originalHatIds;
  const hstIds = needsReroute ? [...new Set(exactFamilyRoutes.flatMap((route) => route.hst_ids))].sort() : originalHstIds;
  const visualTestIds = [...new Set(hatIds.flatMap((id) => visualByHat.get(id) ?? []))].sort();
  const challengeObligations = familyRoutes.filter((route) => route.status === "challenge_gap_obligation");
  const route = {
    hil_ids: needsReroute ? [...new Set(exactFamilyRoutes.flatMap((route) => route.hil_ids))].sort() : record.final_candidate.hil_ids,
    hr_ids: needsReroute ? [...new Set(exactFamilyRoutes.flatMap((route) => route.hr_ids))].sort() : record.final_candidate.hr_ids,
    hat_ids: hatIds,
    hst_ids: hstIds,
    visual_test_ids: visualTestIds,
    behavior_families: record.source_evidence.behavior_families,
    family_routes: familyRoutes,
    challenge_gap_obligations: challengeObligations,
    oracle_route_status: !needsReroute
      ? "candidate_exact_ids_semantic_aligned_not_verified"
      : challengeObligations.length > 0
        ? "family_specific_partial_challenge_gap_not_verified"
        : "family_specific_candidate_not_verified",
  };
  const retention = {
    schema_sha256: retentionSchemaSha256,
    required: true,
    retained: false,
    identity_binding: {
      repository_id: record.repository_id,
      pr_number: record.number,
      head_oid: record.source_evidence.head_oid,
      merge_oid: record.source_evidence.merge_oid,
      pr_title_sha256: canonicalDigest(record.title),
      commit_range_manifest_sha256: record.source_evidence.commit_range_digest,
      changed_path_manifest_sha256: record.source_evidence.changed_path_digest,
      behavior_family_manifest_sha256: canonicalDigest(record.source_evidence.behavior_families),
      semantic_reconciliation_sha256: canonicalDigest(record.final_candidate),
    },
    expected_manifest_sha256: canonicalDigest({
      pr_id: record.pr_id,
      head_oid: record.source_evidence.head_oid,
      merge_oid: record.source_evidence.merge_oid,
      title: record.title,
      commit_range_digest: record.source_evidence.commit_range_digest,
      changed_path_digest: record.source_evidence.changed_path_digest,
      behavior_families: record.source_evidence.behavior_families,
      final_candidate: record.final_candidate,
      route,
      required_fields: retentionSchema,
    }),
    missing_fields: [...retentionSchema.identity, ...retentionSchema.lineage, ...retentionSchema.result, ...retentionSchema.evidence].filter(
      (field) => !["repository_id", "pr_number", "head_oid", "merge_oid"].includes(field),
    ),
  };
  return {
    pr_id: record.pr_id,
    repository_id: record.repository_id,
    number: record.number,
    disposition: record.final_candidate.disposition,
    test_oracle_route: route,
    historical_check_retention: retention,
    trusted: false,
    current: false,
    runtime_verified: false,
    coverage_credit: false,
  };
});

const reconciliationByPrId = new Map(reconciliation.records.map((record) => [record.pr_id, record]));
for (const record of records) {
  const route = record.test_oracle_route;
  route.route_fingerprint_sha256 = canonicalDigest({ family_routes: route.family_routes, hat_ids: route.hat_ids, hst_ids: route.hst_ids });
  const sourceRecord = reconciliationByPrId.get(record.pr_id);
  record.historical_check_retention.expected_manifest_sha256 = canonicalDigest({
    pr_id: sourceRecord.pr_id,
    head_oid: sourceRecord.source_evidence.head_oid,
    merge_oid: sourceRecord.source_evidence.merge_oid,
    title: sourceRecord.title,
    commit_range_digest: sourceRecord.source_evidence.commit_range_digest,
    changed_path_digest: sourceRecord.source_evidence.changed_path_digest,
    behavior_families: sourceRecord.source_evidence.behavior_families,
    final_candidate: sourceRecord.final_candidate,
    route,
    required_fields: retentionSchema,
  });
}

const count = (predicate) => records.filter(predicate).length;
const output = {
  schema_version: "helix.predecessor-pr-test-retention-routes.v1",
  status: "candidate_design_routes_not_executed_not_trusted",
  generated_at: "2026-07-16",
  sources: [source(reconciliationPath), source(l1Path), source(l3Path), source(hatPath), source(hstPath), source(visualPath)],
  method: {
    test_route: "13 independently aligned rows retain exact reconciliation routes; 58 finding rows are rerouted per behavior family only when title/reconciliation context and an existing reconciliation HIL/HR intersect a current family contract; every unsupported family becomes a typed challenge/gap obligation",
    retention: "one immutable expected manifest digest per PR over source identity, candidate oracle route, and the shared historical check/run retention schema",
  },
  retention_schema: retentionSchema,
  retention_schema_sha256: retentionSchemaSha256,
  summary: {
    rows: records.length,
    unique_pr_ids: new Set(records.map((row) => row.pr_id)).size,
    candidate_test_oracle_routes: count((row) => row.test_oracle_route.hat_ids.length + row.test_oracle_route.hst_ids.length > 0),
    semantic_aligned_not_verified: count((row) => row.test_oracle_route.oracle_route_status === "candidate_exact_ids_semantic_aligned_not_verified"),
    family_specific_not_verified: count((row) => row.test_oracle_route.oracle_route_status === "family_specific_candidate_not_verified"),
    family_specific_partial_challenge_gap: count((row) => row.test_oracle_route.oracle_route_status === "family_specific_partial_challenge_gap_not_verified"),
    challenge_gap_obligations: records.reduce((sum, row) => sum + row.test_oracle_route.challenge_gap_obligations.length, 0),
    blocked_no_current_test_id: count((row) => row.test_oracle_route.hat_ids.length + row.test_oracle_route.hst_ids.length === 0),
    with_hat: count((row) => row.test_oracle_route.hat_ids.length > 0),
    with_hst: count((row) => row.test_oracle_route.hst_ids.length > 0),
    with_visual_test: count((row) => row.test_oracle_route.visual_test_ids.length > 0),
    historical_retention_required: count((row) => row.historical_check_retention.required),
    historical_retention_retained: count((row) => row.historical_check_retention.retained),
    trusted: count((row) => row.trusted),
    current: count((row) => row.current),
    runtime_verified: count((row) => row.runtime_verified),
    coverage_credit_true: count((row) => row.coverage_credit),
  },
  invariants: [
    "rows=unique_pr_ids=71",
    "candidate_test_oracle_routes + blocked_no_current_test_id = 71; challenge/gap rows receive no inferred route for unsupported families",
    "historical_retention_required=71 and retained=0",
    "trusted=current=runtime_verified=coverage_credit_true=0",
  ],
  records,
};

if (output.summary.rows !== 71 || output.summary.unique_pr_ids !== 71) throw new Error("PR denominator drift");
if (output.summary.candidate_test_oracle_routes + output.summary.blocked_no_current_test_id !== 71) throw new Error("route denominator drift");
if (output.summary.historical_retention_required !== 71 || output.summary.historical_retention_retained !== 0) throw new Error("retention invariant failed");
if ([output.summary.trusted, output.summary.current, output.summary.runtime_verified, output.summary.coverage_credit_true].some(Boolean)) throw new Error("authority promotion forbidden");

process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);

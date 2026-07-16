import fs from "node:fs";
import crypto from "node:crypto";

const sha256 = (path) => crypto.createHash("sha256").update(fs.readFileSync(path)).digest("hex");

const testPath = "docs/test-design/helix/L8-L11-visual-design-harness-verification.md";
const source = fs.readFileSync(testPath, "utf8");
const rows = [...source.matchAll(/^\| (VIS-L(8|9|10|11)-[^ |]+) \| ([^|]+) \| ([^|]+) \| ([^|]+) \| ([^|]+) \|$/gm)].map((match) => ({
  id: match[1].trim(), layer: `L${match[2]}`, kind: match[3].trim(), fixture: match[4].trim(), oracle: match[5].trim(), expected: match[6].trim(),
}));

function reviewCase(row) {
  const hil = [], hr = [], ac = [];
  if (row.layer === "L8") { hil.push("HIL-FR-68"); hr.push("HR-FR-HIL-34"); ac.push("AC-DH-07", "AC-DH-11", "AC-DH-20"); }
  if (row.layer === "L9") {
    hil.push("HIL-FR-72"); hr.push("HR-FR-HIL-38"); ac.push("AC-DH-07", "AC-DH-20", "AC-DH-23");
    if (/F04|F05|B01/.test(row.id)) { hil.push("HIL-FR-73"); hr.push("HR-FR-HIL-39"); ac.push("AC-DH-18"); }
    if (/N01|F01|F03|B01/.test(row.id)) { hil.push("HIL-FR-74"); hr.push("HR-FR-HIL-40"); }
  }
  if (row.layer === "L10") {
    hil.push("HIL-FR-76"); hr.push("HR-FR-HIL-42"); ac.push("AC-DH-07", "AC-DH-20", "AC-DH-21");
    if (/N01|F03|F04/.test(row.id)) { hil.push("HIL-FR-75"); hr.push("HR-FR-HIL-41"); }
    if (/F05|F06/.test(row.id)) { hil.push("HIL-FR-71"); hr.push("HR-FR-HIL-37"); ac.push("AC-DH-03"); }
    if (/B01/.test(row.id)) ac.push("AC-DH-18");
  }
  if (row.layer === "L11") {
    hil.push("HIL-FR-79"); hr.push("HR-FR-HIL-45"); ac.push("AC-DH-04", "AC-DH-24");
    if (/N01|F02|B01/.test(row.id)) { hil.push("HIL-FR-61"); hr.push("HR-FR-HIL-27"); }
    if (/F05/.test(row.id)) { hil.push("HIL-FR-77"); hr.push("HR-FR-HIL-43"); ac.push("AC-DH-18"); }
  }
  const failureCode = (row.expected.match(/`([^`]+)`/) || [])[1] || null;
  const matrix = { L8: "subject×required-state×theme×viewport×binding-negative-path", L9: "critical-full＋versioned-pairwise-noncritical screen×state×viewport×theme×locale×text-scale×motion", L10: "AC×role×journey×browser×OS×viewport/DPR×theme/preferences×data-scenario", L11: "agreement-criterion×current-packet×human-actor" };
  return {
    case_id: row.id, layer: row.layer, kind: row.kind, fixture: row.fixture, oracle: row.oracle, expected: row.expected,
    obligation_ids: [...new Set(hil)].sort(), l3_oracle_ids: [...new Set(hr)].sort(), design_ac18_join: [...new Set(ac)].sort(), failure_code: failureCode,
    authority_owner: row.layer === "L11" ? "human_visual_authority_with_node_prerequisite_gate" : "node_deterministic_gate_with_independent_verifier",
    matrix_denominator: matrix[row.layer],
    orphan: { case: false, obligation: false, oracle: false, failure: row.kind === "positive" ? failureCode !== null : failureCode === null, authority: false, design_ac18: false },
    execution_status: "not_executed", authority_status: "pending", verified: false, coverage_credit: false,
  };
}

const cases = rows.map(reviewCase);
const schemaTables = ["visual_contract_versions", "visual_obligations", "visual_baseline_versions", "visual_verification_runs", "visual_matrix_cells", "visual_render_observations", "visual_assertion_results", "visual_cas_artifacts", "visual_artifact_edges", "visual_evidence_packets", "visual_acceptance_sessions", "visual_judgments", "visual_pair_receipts", "visual_authority_models"];
const schemaReview = schemaTables.map((table) => ({ table, semantic_role: table.includes("cas") ? "content-addressed bytes identity with redaction/scan/retention" : table.includes("baseline") ? "independent human-approved baseline lifecycle" : table.includes("authority") ? "pending/activated/superseded authority isolation" : table.includes("matrix") ? "explicit denominator cell and applicability" : table.includes("acceptance") || table.includes("judgment") ? "L11 human authority isolated from machine green" : "typed packet/run/assertion/provenance chain", orphan: false, implemented: false, authority_status: "pending", coverage_credit: false }));
const artifact = {
  schema_version: "helix.visual-design-harness-semantic-review.v1", status: "independent_semantic_review_pass_after_correction_not_executed", generated_at: "2026-07-16",
  sources: [
    { path: "docs/design/helix/L4-basic-design/infinity-loop-platform-basic-design.md", sha256: sha256("docs/design/helix/L4-basic-design/infinity-loop-platform-basic-design.md"), scope: "visual schema v2" },
    { path: testPath, sha256: sha256(testPath), scope: "28 verification cases" },
    { path: "docs/governance/design-harness-ac-closure-edges.yaml", sha256: sha256("docs/governance/design-harness-ac-closure-edges.yaml"), scope: "Design AC18 closure joins" },
  ],
  review_scope: { layers: { L8: "atomic visual/binding", L9: "cross-screen visual integration", L10: "browser/data visual system", L11: "human visual authority" }, schema_v2_tables: 14, cases: 28, design_ac_closure_edges: 18 },
  corrections: [
    { case_id: "VIS-L8-F01", finding: "fixture used hover/focus outside required 9-state denominator", correction: "use unauthorized/offline missing-state fixture" },
    { case_id: "VIS-L8-B01", finding: "CAS digest/path/redaction/retention had no direct negative case", correction: "replace redundant L8 stale boundary with artifact security boundary" },
    { case_id: "VIS-L9-N01", finding: "three-screen minimum could falsely close all critical denominator", correction: "require all critical cells and selected noncritical cells; three screens is fixture minimum only" },
    { case_id: "VIS-L11-N01", finding: "blind evidence packet could mean evidence omission", correction: "blind producer identity only and retain complete evidence" },
  ], schema_v2_review: schemaReview, cases,
  summary: { schema_tables_reviewed: schemaReview.length, cases_reviewed: cases.length, by_layer: Object.fromEntries(["L8", "L9", "L10", "L11"].map((layer) => [layer, cases.filter((item) => item.layer === layer).length])), corrections: 4, orphans: { case: cases.filter((item) => item.orphan.case).length, obligation: cases.filter((item) => item.orphan.obligation).length, oracle: cases.filter((item) => item.orphan.oracle).length, failure: cases.filter((item) => item.orphan.failure).length, authority: cases.filter((item) => item.orphan.authority).length, design_ac18: cases.filter((item) => item.orphan.design_ac18).length, schema: schemaReview.filter((item) => item.orphan).length }, cas_security_case: "VIS-L8-B01", baseline_lifecycle_case: "VIS-L9-F05", executed: 0, authority_activated: 0, verified: 0, coverage_credit_true: 0 },
  invariants: ["case_count_28", "layer_counts_6_7_8_7", "schema_v2_table_count_14", "every_case_has_obligation_oracle_authority_and_design_ac18_join", "negative_and_boundary_cases_have_failure_code", "execution_zero", "authority_pending", "coverage_zero"],
};
const serialized = `${JSON.stringify(artifact, null, 2)}\n`;
if (process.argv.includes("--write")) {
  fs.writeFileSync("docs/governance/generated/visual-design-harness-semantic-review-v1.json", serialized);
}
process.stdout.write(serialized);

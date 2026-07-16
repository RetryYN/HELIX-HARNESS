import crypto from "node:crypto";
import fs from "node:fs";
import { spawnSync } from "node:child_process";

const inputs = {
  candidates: ["docs/governance/generated/git-ref-authority-candidates-exact2-v1.json", "95e2f00dc08d239cfaa1b9a4e946d0886573e7daa4330a3caff38627b2a01d2f"],
  custody: ["docs/governance/generated/git-trusted-custody-promotion-contract-exact2-v1.json", "e944bf33992fcc9a8f6b9d39ca4cfe3ff030d9f4bdbca32e1053b10ca78ebf46"],
  prJoin: ["docs/governance/generated/predecessor-pr-plan-join-71-v1.json", "bb8187cdfa28da6c906a672a51ac3f8534a5bfe311120d2e2363bf2a2013dbb6"],
  prFinal: ["docs/governance/generated/predecessor-pr-semantic-reconciliation-71-v1.json", "ee44144100246ed19e19519d1b970438d5d0a055219f4e393763639f484ce942"],
  utPr: ["docs/governance/generated/predecessor-ut-pr64-semantic-join-v1.json", "403bf3b77393bfbf09c2cb2c61f6f2fa366ac1733ec30ccfc879a25868d3d92e"],
  legacyPr: ["docs/governance/generated/legacy-helix-pr-hil-candidate-mapping-7-v1.json", "9340807ce27263321243d5314df42a4f88af1f4fe83edf66db26a0fc586ca62e"],
};
const sha256 = (bytes) => crypto.createHash("sha256").update(bytes).digest("hex");
const loaded = {};
for (const [key, [path, expected]] of Object.entries(inputs)) {
  const bytes = fs.readFileSync(path);
  if (sha256(bytes) !== expected) throw new Error(`input digest mismatch: ${path}`);
  loaded[key] = JSON.parse(bytes);
}

const candidateByRepo = new Map(loaded.candidates.records.map((row) => [row.repository.id, row]));
const custodyByRepo = new Map(loaded.custody.records.map((row) => [row.repository_id, row]));
const finalPrByRepo = new Map(["predecessor-ut", "legacy-helix"].map((repo) => [repo, loaded.prFinal.records.filter((row) => row.repository_id === repo)]));
const repoConfig = {
  "predecessor-ut": { prExpected: 64, bundlePath: "/tmp/helix-authority-ut.bundle" },
  "legacy-helix": { prExpected: 7, bundlePath: "/tmp/helix-authority-legacy.bundle" },
};

function inspectBundle(path, expectedDigest, expectedBytes) {
  const exists = fs.existsSync(path);
  if (!exists) return { path_class: "ephemeral-tmp", exists: false, digest_match: false, byte_count_match: false, bundle_verify: false, trusted: false, coverage_credit: false };
  const bytes = fs.readFileSync(path);
  const verify = spawnSync("git", ["bundle", "verify", path], { encoding: "utf8" });
  return { path_class: "ephemeral-tmp", exists: true, sha256: sha256(bytes), bytes: bytes.length, digest_match: sha256(bytes) === expectedDigest, byte_count_match: bytes.length === expectedBytes, bundle_verify: verify.status === 0, trusted: false, coverage_credit: false };
}

const repositories = Object.entries(repoConfig).map(([repositoryId, config]) => {
  const candidate = candidateByRepo.get(repositoryId), custody = custodyByRepo.get(repositoryId), prs = finalPrByRepo.get(repositoryId);
  const hilMapped = prs.filter((row) => row.final_candidate.hil_ids.length > 0).length;
  const hrMapped = prs.filter((row) => row.final_candidate.hr_ids.length > 0).length;
  const testMapped = 0;
  const retentionRequired = config.prExpected;
  return {
    repository_id: repositoryId,
    fixed_denominator: { refs: candidate.observation.counts.refs, root_trees: candidate.observation.counts.root_trees, ref_entry_edges: candidate.observation.counts.ref_entry_edges, unique_path_content: candidate.observation.counts.unique_path_content, prs: config.prExpected, historical_check_retention_receipts: retentionRequired },
    candidate_evidence: { advertisement_a_b_equal: candidate.observation.advertisement_a_b === "equal", materialized_invalid_objects: candidate.observation.invalid_materialized_objects, strict_fsck: candidate.observation.strict_fsck, ephemeral_bundle: inspectBundle(config.bundlePath, custody.expected_bundle_sha256, custody.expected_bundle_bytes) },
    local_only_policy_design: { project_relative_root: loaded.custody.policy.namespace.project_relative_root, project_root_only: loaded.custody.policy.namespace.project_root_only, network_write_forbidden: loaded.custody.policy.namespace.network_write_forbidden, external_operations_performed: loaded.custody.project_external_operations_performed, contract_status: loaded.custody.status },
    custody_readiness: { candidate_binding: true, trusted_cas_object: false, root_tree_set_digest: custody.expected_root_tree_set_sha256 !== null, advertisement_b_timestamp: custody.advertisement_b_observed_at !== null, fresh_until: custody.fresh_until !== null, trusted_bundle_receipt: custody.trusted_bundle_receipt !== null, trusted_ref_receipt: custody.trusted_ref_receipt !== null, trusted_tree_receipt: custody.trusted_tree_receipt !== null, trusted_edge_receipt: custody.trusted_edge_receipt !== null, retention_access_receipt: custody.retention_access_receipt !== null, independent_verifier_receipt: custody.independent_verifier_receipt !== null, offline_manifest_receipt: custody.offline_manifest_receipt !== null, isolated_restore_drill_receipt: custody.restore_drill_receipt !== null, promotion_receipt: custody.promotion_receipt !== null, trusted: false, current: false },
    replay_chain: {
      ref_authority: { candidate_count: candidate.observation.counts.refs, trusted_count: 0 },
      ref_to_tree: { candidate_root_tree_count: candidate.observation.counts.root_trees, trusted_tree_set_digest_count: 0 },
      tree_to_entry: { candidate_edge_count: candidate.observation.counts.ref_entry_edges, trusted_edge_count: 0 },
      entry_to_behavior_atom: { entry_denominator: candidate.observation.counts.unique_path_content, classified_entry_count: candidate.offline_capture_classification_manifest.classification_entry_count, behavior_atom_count: 0, behavior_atom_denominator_known: false },
      behavior_to_requirement: { pr_candidate_count: prs.length, hil_candidate_mapped: hilMapped, hr_candidate_mapped: hrMapped, test_candidate_mapped: testMapped, exact_hil_hr_test_join: 0 },
      historical_check_retention: { required: retentionRequired, retained: 0, current_check_observation_is_retention_proof: false },
    },
    blockers: [...new Set([...custody.blockers, "behavior-atom-denominator-unknown", "entry-to-behavior-classification-missing", "test-exact-join-missing", "historical-check-retention-missing"])].sort(),
    trusted_receipts: 0, behavior_replay_verified: 0, coverage_credit: false,
  };
});

const totals = repositories.reduce((sum, row) => ({ refs: sum.refs + row.fixed_denominator.refs, root_trees: sum.root_trees + row.fixed_denominator.root_trees, ref_entry_edges: sum.ref_entry_edges + row.fixed_denominator.ref_entry_edges, unique_path_content: sum.unique_path_content + row.fixed_denominator.unique_path_content, prs: sum.prs + row.fixed_denominator.prs, historical_check_retention_receipts: sum.historical_check_retention_receipts + row.fixed_denominator.historical_check_retention_receipts }), { refs: 0, root_trees: 0, ref_entry_edges: 0, unique_path_content: 0, prs: 0, historical_check_retention_receipts: 0 });
const artifact = {
  schema_version: "helix.exact2-custody-replay-readiness.v1", status: "candidate_evidence_audited_trusted_custody_and_behavior_replay_blocked", generated_at: "2026-07-16",
  sources: Object.values(inputs).map(([path, digest]) => ({ path, sha256: digest })),
  safety: { external_access: "none", external_write: false, project_external_write: false, project_owned_cas_write: false, ephemeral_bundle_read_only_inspection: true },
  repositories, totals,
  summary: { repositories: 2, candidate_receipts: 2, ephemeral_bundles_digest_and_verify_pass: repositories.filter((row) => row.candidate_evidence.ephemeral_bundle.digest_match && row.candidate_evidence.ephemeral_bundle.bundle_verify).length, trusted_receipts: 0, current_receipts: 0, offline_manifests: 0, restore_drills: 0, behavior_atom_denominator_known: 0, behavior_replay_verified: 0, pr_hil_hr_candidate_mapping: 71, pr_test_mapping: 0, exact_hil_hr_test_join: 0, historical_check_retention: { required: 71, retained: 0 }, coverage_credit_true: 0 },
  promotion_required_obligations: ["project-owned CAS atomic copy", "trusted byte digest replay", "canonical ref receipt", "root-tree-set digest and receipt", "ref-entry-edge receipt", "retention/access receipt", "independent verifier receipt", "advertisement-B timestamp and fresh-until", "network-zero offline manifest", "isolated project-owned restore drill", "entry classification and atomic behavior denominator", "behavior atom disposition to HIL/HR/test exact join", "historical PR check/run retention receipt", "single atomic promotion receipt"],
  verdict: { trusted_custody_ready: false, offline_replay_ready: false, behavior_replay_ready: false, freeze_credit: false },
  invariants: ["exact_two_repositories", "refs_90", "ref_entry_edges_145276", "prs_71", "ephemeral_is_not_trusted", "project_external_write_zero", "trusted_zero", "behavior_replay_zero", "historical_retention_zero", "coverage_zero"],
};
process.stdout.write(`${JSON.stringify(artifact, null, 2)}\n`);

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  evaluateGitTrackedSourceCasPromotion,
  type GitTrackedCasPromotionObservation,
  type GitTrackedSourceCasPolicy,
} from "../src/lint/git-tracked-source-cas";

const policy = JSON.parse(
  readFileSync("docs/governance/generated/git-tracked-source-cas-policy-exact2-v1.json", "utf8"),
) as GitTrackedSourceCasPolicy;
const D = "a".repeat(64);
const H = "b".repeat(40);
function first<T>(values: T[]): T {
  const value = values[0];
  if (!value) throw new Error("exact2 fixture is empty");
  return value;
}
const records = policy.repositories.map((expected) => ({
  repository_id: expected.repository_id,
  bundle_present: true,
  bundle_digest: expected.bundle_digest,
  bundle_bytes: expected.bundle_bytes,
  cas_path: expected.cas_path,
  git_blob_oid: H,
  advertisement_a_digest: D,
  advertisement_b_digest: D,
  advertisement_b_observed_at: "2026-07-17T00:00:00.000Z",
  fresh_until: "2026-07-18T00:00:00.000Z",
  scans: { secret_findings: 0, credential_findings: 0, pii_findings: 0, history_scan_pass: true },
  replay: {
    bundle_verify: true,
    strict_fsck: true,
    ref_set: true,
    root_tree_set: true,
    ref_entry_edges: true,
  },
  restore: {
    isolated: true,
    offline: true,
    digest_replayed: true,
    bundle_verified: true,
    fsck_passed: true,
    ref_set_replayed: true,
    root_tree_set_replayed: true,
    ref_entry_edges_replayed: true,
    receipt_digest: D,
  },
  verification: {
    verifier_actor: "independent",
    verifier_runtime: "codex",
    verified_head_commit: H,
    verified_git_blob_oid: H,
    verified_bundle_digest: expected.bundle_digest,
    receipt_digest: D,
  },
}));
const observation: GitTrackedCasPromotionObservation = {
  schema_version: "helix.git-tracked-source-cas-observation.v1",
  observed_at: "2026-07-17T01:00:00.000Z",
  producer_actor: "producer",
  head_commit: H,
  base_objects: [],
  candidate_objects: records.map((row) => ({
    path: row.cas_path,
    sha256: row.bundle_digest,
    git_blob_oid: H,
  })),
  records,
};
const promotionPolicy: GitTrackedSourceCasPolicy = {
  ...structuredClone(policy),
  status: "promotion-candidate",
  repositories: policy.repositories.map((record) => ({ ...record, bundle_present: true })),
};

describe("raw Git-tracked exact2 CAS promotion gate", () => {
  it("U-GTCAS-001: repository policyはbundle未配置をcurrent/coverageへ昇格しない", () => {
    const missing = structuredClone(observation);
    first(missing.records).bundle_present = false;
    expect(evaluateGitTrackedSourceCasPromotion(policy, missing)).toMatchObject({
      pass: false,
      trusted: false,
      current: false,
      coverage_credit: false,
      failures: expect.arrayContaining(["HIL_GIT_CAS_BUNDLE_MISSING"]),
    });
    expect(policy).toMatchObject({
      status: "designed-bundle-missing",
      trusted: false,
      current: false,
      coverage_credit: false,
    });
    expect(
      policy.repositories.every((row: { bundle_present: boolean }) => !row.bundle_present),
    ).toBe(true);
    expect(evaluateGitTrackedSourceCasPromotion(policy, observation)).toMatchObject({
      pass: false,
      current: false,
      coverage_credit: false,
      failures: expect.arrayContaining(["HIL_GIT_CAS_BUNDLE_MISSING"]),
    });
    expect(
      evaluateGitTrackedSourceCasPromotion({ ...policy, unknown: true }, observation).failures,
    ).toContain("HIL_GIT_CAS_MANIFEST_INVALID");
    const openObservation = structuredClone(observation) as unknown as Record<string, unknown>;
    openObservation.unknown = true;
    expect(
      evaluateGitTrackedSourceCasPromotion(
        policy,
        openObservation as unknown as GitTrackedCasPromotionObservation,
      ).failures,
    ).toContain("HIL_GIT_CAS_MANIFEST_INVALID");
    const openNested = structuredClone(observation) as unknown as {
      records: Array<{ scans: Record<string, unknown> }>;
    };
    first(openNested.records).scans.unknown = 1;
    expect(
      evaluateGitTrackedSourceCasPromotion(
        policy,
        openNested as unknown as GitTrackedCasPromotionObservation,
      ).failures,
    ).toContain("HIL_GIT_CAS_MANIFEST_INVALID");
  });

  it("U-GTCAS-002: tracked CASのmodify/delete/moveを拒否する", () => {
    const mutated = structuredClone(observation);
    mutated.base_objects = [first(mutated.candidate_objects)];
    mutated.candidate_objects[0] = { ...first(mutated.candidate_objects), sha256: "c".repeat(64) };
    expect(evaluateGitTrackedSourceCasPromotion(promotionPolicy, mutated).failures).toContain(
      "HIL_GIT_CAS_MUTATION_FORBIDDEN",
    );
    const deleted = structuredClone(observation);
    deleted.base_objects = [first(deleted.candidate_objects)];
    deleted.candidate_objects = deleted.candidate_objects.slice(1);
    expect(evaluateGitTrackedSourceCasPromotion(promotionPolicy, deleted).failures).toContain(
      "HIL_GIT_CAS_MUTATION_FORBIDDEN",
    );
  });

  it("U-GTCAS-003: freshness/scan/replayの各失敗をcredit 0にする", () => {
    for (const mutate of [
      (value: typeof records) => {
        first(value).advertisement_b_digest = "c".repeat(64);
      },
      (value: typeof records) => {
        first(value).scans.secret_findings = 1;
      },
      (value: typeof records) => {
        first(value).replay.strict_fsck = false;
      },
    ]) {
      const candidate = structuredClone(observation);
      mutate(candidate.records as typeof records);
      expect(evaluateGitTrackedSourceCasPromotion(promotionPolicy, candidate)).toMatchObject({
        pass: false,
        coverage_credit: false,
      });
    }
  });

  it("U-GTCAS-004: different actorのsame HEAD/blob/digest verificationとoffline restoreだけがpassする", () => {
    expect(evaluateGitTrackedSourceCasPromotion(promotionPolicy, observation)).toEqual({
      pass: true,
      trusted: true,
      current: true,
      coverage_credit: true,
      failures: [],
    });
    const self = structuredClone(observation);
    first(self.records).verification.verifier_actor = self.producer_actor;
    expect(evaluateGitTrackedSourceCasPromotion(promotionPolicy, self).failures).toContain(
      "HIL_GIT_CAS_INDEPENDENT_REVIEW_REQUIRED",
    );
    const noRestore = structuredClone(observation);
    first(noRestore.records).restore.offline = false;
    expect(evaluateGitTrackedSourceCasPromotion(promotionPolicy, noRestore).failures).toContain(
      "HIL_GIT_RESTORE_DRILL_FAILED",
    );
  });
});

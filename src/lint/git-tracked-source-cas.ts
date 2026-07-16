export const GIT_TRACKED_SOURCE_CAS_ROOT = "source-cas/git-authority/sha256";

export type GitTrackedSourceCasFailure =
  | "HIL_GIT_CAS_MANIFEST_INVALID"
  | "HIL_GIT_CAS_BUNDLE_MISSING"
  | "HIL_GIT_CAS_MUTATION_FORBIDDEN"
  | "HIL_GIT_AUTHORITY_STALE"
  | "HIL_GIT_CAS_SCAN_FAILED"
  | "HIL_GIT_CAS_REPLAY_FAILED"
  | "HIL_GIT_CAS_INDEPENDENT_REVIEW_REQUIRED"
  | "HIL_GIT_RESTORE_DRILL_FAILED";

export interface GitTrackedSourceCasPolicyRecord {
  repository_id: "legacy-helix" | "predecessor-ut";
  bundle_digest: string;
  bundle_bytes: number;
  cas_path: string;
  bundle_present: boolean;
  trusted: boolean;
  current: boolean;
  coverage_credit: boolean;
}

export interface GitTrackedSourceCasPolicy {
  schema_version: "helix.git-tracked-source-cas-policy.v1";
  status: "designed-bundle-missing" | "promotion-candidate";
  cas_root: typeof GIT_TRACKED_SOURCE_CAS_ROOT;
  supersedes_local_root: ".helix/cas/git-authority/sha256";
  provenance_memory_id: "harness:upstream-is-po-own-work:op:auto-478f599113d32385687c2391";
  repositories: GitTrackedSourceCasPolicyRecord[];
  required_gates: string[];
  trusted: boolean;
  current: boolean;
  coverage_credit: boolean;
}

export interface GitTrackedCasTreeObject {
  path: string;
  sha256: string;
  git_blob_oid: string;
}

export interface GitTrackedCasPromotionRecord {
  repository_id: "legacy-helix" | "predecessor-ut";
  bundle_present: boolean;
  bundle_digest: string;
  bundle_bytes: number;
  cas_path: string;
  git_blob_oid: string;
  advertisement_a_digest: string;
  advertisement_b_digest: string;
  advertisement_b_observed_at: string;
  fresh_until: string;
  scans: {
    secret_findings: number;
    credential_findings: number;
    pii_findings: number;
    history_scan_pass: boolean;
  };
  replay: {
    bundle_verify: boolean;
    strict_fsck: boolean;
    ref_set: boolean;
    root_tree_set: boolean;
    ref_entry_edges: boolean;
  };
  restore: {
    isolated: boolean;
    offline: boolean;
    digest_replayed: boolean;
    bundle_verified: boolean;
    fsck_passed: boolean;
    ref_set_replayed: boolean;
    root_tree_set_replayed: boolean;
    ref_entry_edges_replayed: boolean;
    receipt_digest: string;
  };
  verification: {
    verifier_actor: string;
    verifier_runtime: string;
    verified_head_commit: string;
    verified_git_blob_oid: string;
    verified_bundle_digest: string;
    receipt_digest: string;
  };
}

export interface GitTrackedCasPromotionObservation {
  schema_version: "helix.git-tracked-source-cas-observation.v1";
  observed_at: string;
  producer_actor: string;
  head_commit: string;
  base_objects: GitTrackedCasTreeObject[];
  candidate_objects: GitTrackedCasTreeObject[];
  records: GitTrackedCasPromotionRecord[];
}

export interface GitTrackedCasPromotionDecision {
  pass: boolean;
  trusted: boolean;
  current: boolean;
  coverage_credit: boolean;
  failures: GitTrackedSourceCasFailure[];
}

const SHA = /^[0-9a-f]{64}$/;
const OID = /^[0-9a-f]{40,64}$/;
const REQUIRED_GATES = [
  "fresh-advertisement-a-b",
  "secret-pii-history-scan",
  "closed-manifest",
  "write-once-diff",
  "bundle-verify",
  "strict-fsck",
  "ref-set-replay",
  "root-tree-set-replay",
  "ref-entry-edge-replay",
  "independent-verifier",
  "offline-restore",
].sort();

function exactKeys(value: unknown, keys: readonly string[]): value is Record<string, unknown> {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    Object.keys(value as object)
      .sort()
      .join("\0") === [...keys].sort().join("\0")
  );
}

function canonicalPath(digest: string): string {
  return `${GIT_TRACKED_SOURCE_CAS_ROOT}/${digest.slice(0, 2)}/${digest}.bundle`;
}

function policyValid(value: unknown): value is GitTrackedSourceCasPolicy {
  if (
    !exactKeys(value, [
      "schema_version",
      "status",
      "cas_root",
      "supersedes_local_root",
      "provenance_memory_id",
      "repositories",
      "required_gates",
      "trusted",
      "current",
      "coverage_credit",
    ]) ||
    value.schema_version !== "helix.git-tracked-source-cas-policy.v1" ||
    (value.status !== "designed-bundle-missing" && value.status !== "promotion-candidate") ||
    value.cas_root !== GIT_TRACKED_SOURCE_CAS_ROOT ||
    value.supersedes_local_root !== ".helix/cas/git-authority/sha256" ||
    value.provenance_memory_id !==
      "harness:upstream-is-po-own-work:op:auto-478f599113d32385687c2391" ||
    !Array.isArray(value.repositories) ||
    !Array.isArray(value.required_gates) ||
    [...value.required_gates].sort().join("\0") !== REQUIRED_GATES.join("\0") ||
    typeof value.trusted !== "boolean" ||
    typeof value.current !== "boolean" ||
    typeof value.coverage_credit !== "boolean"
  )
    return false;
  const records = value.repositories;
  if (
    records.length !== 2 ||
    new Set(records.map((row) => (row as { repository_id?: unknown }).repository_id)).size !== 2
  )
    return false;
  return records.every((row) => {
    if (
      !exactKeys(row, [
        "repository_id",
        "bundle_digest",
        "bundle_bytes",
        "cas_path",
        "bundle_present",
        "trusted",
        "current",
        "coverage_credit",
      ])
    )
      return false;
    return (
      (row.repository_id === "legacy-helix" || row.repository_id === "predecessor-ut") &&
      typeof row.bundle_digest === "string" &&
      SHA.test(row.bundle_digest) &&
      Number.isSafeInteger(row.bundle_bytes) &&
      (row.bundle_bytes as number) > 0 &&
      row.cas_path === canonicalPath(row.bundle_digest) &&
      typeof row.bundle_present === "boolean" &&
      typeof row.trusted === "boolean" &&
      typeof row.current === "boolean" &&
      typeof row.coverage_credit === "boolean"
    );
  });
}

function observationShapeValid(value: GitTrackedCasPromotionObservation): boolean {
  if (
    !exactKeys(value, [
      "schema_version",
      "observed_at",
      "producer_actor",
      "head_commit",
      "base_objects",
      "candidate_objects",
      "records",
    ])
  )
    return false;
  if (
    value.schema_version !== "helix.git-tracked-source-cas-observation.v1" ||
    !OID.test(value.head_commit) ||
    !value.producer_actor ||
    !Date.parse(value.observed_at)
  )
    return false;
  if (
    !Array.isArray(value.base_objects) ||
    !Array.isArray(value.candidate_objects) ||
    !Array.isArray(value.records)
  )
    return false;
  const objectValid = (entry: GitTrackedCasTreeObject) =>
    exactKeys(entry, ["path", "sha256", "git_blob_oid"]) &&
    typeof entry.path === "string" &&
    SHA.test(entry.sha256) &&
    OID.test(entry.git_blob_oid);
  if (![...value.base_objects, ...value.candidate_objects].every(objectValid)) return false;
  return value.records.every((row) => {
    if (
      !exactKeys(row, [
        "repository_id",
        "bundle_present",
        "bundle_digest",
        "bundle_bytes",
        "cas_path",
        "git_blob_oid",
        "advertisement_a_digest",
        "advertisement_b_digest",
        "advertisement_b_observed_at",
        "fresh_until",
        "scans",
        "replay",
        "restore",
        "verification",
      ]) ||
      !exactKeys(row.scans, [
        "secret_findings",
        "credential_findings",
        "pii_findings",
        "history_scan_pass",
      ]) ||
      !exactKeys(row.replay, [
        "bundle_verify",
        "strict_fsck",
        "ref_set",
        "root_tree_set",
        "ref_entry_edges",
      ]) ||
      !exactKeys(row.restore, [
        "isolated",
        "offline",
        "digest_replayed",
        "bundle_verified",
        "fsck_passed",
        "ref_set_replayed",
        "root_tree_set_replayed",
        "ref_entry_edges_replayed",
        "receipt_digest",
      ]) ||
      !exactKeys(row.verification, [
        "verifier_actor",
        "verifier_runtime",
        "verified_head_commit",
        "verified_git_blob_oid",
        "verified_bundle_digest",
        "receipt_digest",
      ])
    )
      return false;
    return (
      (row.repository_id === "legacy-helix" || row.repository_id === "predecessor-ut") &&
      typeof row.bundle_present === "boolean" &&
      SHA.test(row.bundle_digest) &&
      Number.isSafeInteger(row.bundle_bytes) &&
      row.bundle_bytes > 0 &&
      typeof row.cas_path === "string" &&
      OID.test(row.git_blob_oid) &&
      SHA.test(row.advertisement_a_digest) &&
      SHA.test(row.advertisement_b_digest) &&
      Number.isFinite(Date.parse(row.advertisement_b_observed_at)) &&
      Number.isFinite(Date.parse(row.fresh_until)) &&
      Number.isSafeInteger(row.scans.secret_findings) &&
      Number.isSafeInteger(row.scans.credential_findings) &&
      Number.isSafeInteger(row.scans.pii_findings) &&
      typeof row.scans.history_scan_pass === "boolean" &&
      Object.values(row.replay).every((item) => typeof item === "boolean") &&
      Object.entries(row.restore).every(([key, item]) =>
        key === "receipt_digest"
          ? typeof item === "string" && SHA.test(item)
          : typeof item === "boolean",
      ) &&
      Boolean(row.verification.verifier_actor) &&
      Boolean(row.verification.verifier_runtime) &&
      OID.test(row.verification.verified_head_commit) &&
      OID.test(row.verification.verified_git_blob_oid) &&
      SHA.test(row.verification.verified_bundle_digest) &&
      SHA.test(row.verification.receipt_digest)
    );
  });
}

export function evaluateGitTrackedSourceCasPromotion(
  policy: unknown,
  observation: GitTrackedCasPromotionObservation,
): GitTrackedCasPromotionDecision {
  const failures = new Set<GitTrackedSourceCasFailure>();
  if (!policyValid(policy) || !observationShapeValid(observation)) {
    failures.add("HIL_GIT_CAS_MANIFEST_INVALID");
    return {
      pass: false,
      trusted: false,
      current: false,
      coverage_credit: false,
      failures: [...failures],
    };
  }
  const base = new Map(observation.base_objects.map((entry) => [entry.path, entry]));
  const candidate = new Map(observation.candidate_objects.map((entry) => [entry.path, entry]));
  if (
    policy.status !== "promotion-candidate" ||
    policy.repositories.some((record) => !record.bundle_present)
  )
    failures.add("HIL_GIT_CAS_BUNDLE_MISSING");
  for (const [path, entry] of base) {
    if (!path.startsWith(`${GIT_TRACKED_SOURCE_CAS_ROOT}/`)) continue;
    const next = candidate.get(path);
    if (!next || next.sha256 !== entry.sha256 || next.git_blob_oid !== entry.git_blob_oid)
      failures.add("HIL_GIT_CAS_MUTATION_FORBIDDEN");
  }
  if (
    observation.records.length !== 2 ||
    new Set(observation.records.map((row) => row.repository_id)).size !== 2
  )
    failures.add("HIL_GIT_CAS_MANIFEST_INVALID");
  for (const expected of policy.repositories) {
    const row = observation.records.find(
      (candidateRow) => candidateRow.repository_id === expected.repository_id,
    );
    if (!row?.bundle_present) {
      failures.add("HIL_GIT_CAS_BUNDLE_MISSING");
      continue;
    }
    const tree = candidate.get(expected.cas_path);
    if (
      !SHA.test(row.bundle_digest) ||
      !OID.test(row.git_blob_oid) ||
      row.bundle_digest !== expected.bundle_digest ||
      row.bundle_bytes !== expected.bundle_bytes ||
      row.cas_path !== expected.cas_path ||
      !tree ||
      tree.sha256 !== row.bundle_digest ||
      tree.git_blob_oid !== row.git_blob_oid
    )
      failures.add("HIL_GIT_CAS_MANIFEST_INVALID");
    const observedAt = Date.parse(row.advertisement_b_observed_at);
    const freshUntil = Date.parse(row.fresh_until);
    const decisionAt = Date.parse(observation.observed_at);
    if (
      !SHA.test(row.advertisement_a_digest) ||
      row.advertisement_a_digest !== row.advertisement_b_digest ||
      !Number.isFinite(observedAt) ||
      !Number.isFinite(freshUntil) ||
      decisionAt > freshUntil ||
      freshUntil - observedAt > 24 * 60 * 60 * 1000
    )
      failures.add("HIL_GIT_AUTHORITY_STALE");
    if (
      row.scans.secret_findings !== 0 ||
      row.scans.credential_findings !== 0 ||
      row.scans.pii_findings !== 0 ||
      !row.scans.history_scan_pass
    )
      failures.add("HIL_GIT_CAS_SCAN_FAILED");
    if (!Object.values(row.replay).every((result) => result === true))
      failures.add("HIL_GIT_CAS_REPLAY_FAILED");
    if (
      !row.verification.verifier_actor ||
      row.verification.verifier_actor === observation.producer_actor ||
      !row.verification.verifier_runtime ||
      row.verification.verified_head_commit !== observation.head_commit ||
      row.verification.verified_git_blob_oid !== row.git_blob_oid ||
      row.verification.verified_bundle_digest !== row.bundle_digest ||
      !SHA.test(row.verification.receipt_digest)
    )
      failures.add("HIL_GIT_CAS_INDEPENDENT_REVIEW_REQUIRED");
    if (
      !row.restore.isolated ||
      !row.restore.offline ||
      !row.restore.digest_replayed ||
      !row.restore.bundle_verified ||
      !row.restore.fsck_passed ||
      !row.restore.ref_set_replayed ||
      !row.restore.root_tree_set_replayed ||
      !row.restore.ref_entry_edges_replayed ||
      !SHA.test(row.restore.receipt_digest)
    )
      failures.add("HIL_GIT_RESTORE_DRILL_FAILED");
  }
  const pass = failures.size === 0;
  return {
    pass,
    trusted: pass,
    current: pass,
    coverage_credit: pass,
    failures: [...failures].sort(),
  };
}

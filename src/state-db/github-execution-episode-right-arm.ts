import { canonicalJson, sha256Digest } from "../shared/canonical-digest";
import type { HarnessDb } from "./index";

type Digest = `sha256:${string}`;

const DIGEST_PATTERN = /^sha256:[a-f0-9]{64}$/u;
const HEAD_PATTERN = /^[a-f0-9]{40}$/u;
const EPISODE_ID_PATTERN = /^ep_[A-Za-z0-9]{16,64}$/u;
const EVIDENCE_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9:._-]{7,255}$/u;
const GATE_ID_PATTERN = /^G(?:8|9|10|11|12)$/u;
const EVIDENCE_KIND_PATTERN = /^[a-z][a-z0-9_]{1,63}$/u;

export interface ExecutionEpisodeRightArmEvidenceInput {
  evidence_id: string;
  episode_id: string;
  head_sha: string;
  owner: string;
  behavior_contract_id: string;
  workflow_registry_version: string;
  workflow_registry_source_digest: Digest;
  workflow_target_axis: string;
  workflow_target_id: string;
  gate_id: string;
  evidence_kind: string;
  artifact_path: string;
  evidence_digest: Digest;
  verifier_command_digest: Digest;
  observed_at: string;
}

export interface ExecutionEpisodeRightArmEvidence
  extends ExecutionEpisodeRightArmEvidenceInput {
  record_digest: Digest;
}

export interface ExecutionEpisodeRightArmEvidenceResult {
  evidence: ExecutionEpisodeRightArmEvidence;
  replayed: boolean;
}

function required(value: string, label: string): string {
  if (!value.trim()) throw new Error(`right-arm evidence ${label} is required`);
  return value;
}

function assertDigest(value: string, label: string): asserts value is Digest {
  if (!DIGEST_PATTERN.test(value)) throw new Error(`right-arm evidence ${label} is invalid`);
}

function recordFromRow(row: Record<string, unknown>): ExecutionEpisodeRightArmEvidence {
  return {
    evidence_id: String(row.evidence_id),
    episode_id: String(row.episode_id),
    head_sha: String(row.head_sha),
    owner: String(row.owner),
    behavior_contract_id: String(row.behavior_contract_id),
    workflow_registry_version: String(row.workflow_registry_version),
    workflow_registry_source_digest: String(row.workflow_registry_source_digest) as Digest,
    workflow_target_axis: String(row.workflow_target_axis),
    workflow_target_id: String(row.workflow_target_id),
    gate_id: String(row.gate_id),
    evidence_kind: String(row.evidence_kind),
    artifact_path: String(row.artifact_path),
    evidence_digest: String(row.evidence_digest) as Digest,
    verifier_command_digest: String(row.verifier_command_digest) as Digest,
    observed_at: String(row.observed_at),
    record_digest: String(row.record_digest) as Digest,
  };
}

function recordDigest(input: ExecutionEpisodeRightArmEvidenceInput): Digest {
  return sha256Digest(canonicalJson(input));
}

function inputFromRecord(
  evidence: ExecutionEpisodeRightArmEvidence,
): ExecutionEpisodeRightArmEvidenceInput {
  const { record_digest: _recordDigest, ...input } = evidence;
  return input;
}

function assertStoredRecord(
  evidence: ExecutionEpisodeRightArmEvidence,
  expectedDigest: Digest,
): void {
  if (
    evidence.record_digest !== expectedDigest ||
    recordDigest(inputFromRecord(evidence)) !== evidence.record_digest
  ) {
    throw new Error("right-arm evidence immutable identity conflict");
  }
}

function assertInput(input: ExecutionEpisodeRightArmEvidenceInput): void {
  required(input.evidence_id, "evidence_id");
  required(input.episode_id, "episode_id");
  required(input.owner, "owner");
  required(input.behavior_contract_id, "behavior_contract_id");
  required(input.workflow_registry_version, "workflow_registry_version");
  required(input.workflow_target_axis, "workflow_target_axis");
  required(input.workflow_target_id, "workflow_target_id");
  required(input.artifact_path, "artifact_path");
  if (!EPISODE_ID_PATTERN.test(input.episode_id)) {
    throw new Error("right-arm evidence episode_id is invalid");
  }
  if (!EVIDENCE_ID_PATTERN.test(input.evidence_id)) {
    throw new Error("right-arm evidence evidence_id is invalid");
  }
  if (!HEAD_PATTERN.test(input.head_sha)) throw new Error("right-arm evidence head_sha is invalid");
  if (!GATE_ID_PATTERN.test(input.gate_id)) throw new Error("right-arm evidence gate_id is invalid");
  if (!EVIDENCE_KIND_PATTERN.test(input.evidence_kind)) {
    throw new Error("right-arm evidence evidence_kind is invalid");
  }
  const artifactSegments = input.artifact_path.split("/");
  if (
    input.artifact_path.startsWith("/") ||
    input.artifact_path.includes("\\") ||
    input.artifact_path.includes("\0") ||
    /^[A-Za-z]:/u.test(input.artifact_path) ||
    artifactSegments.some((segment) => segment === ".." || segment === "." || segment === "")
  ) {
    throw new Error("right-arm evidence artifact_path must be repository-relative");
  }
  if (Number.isNaN(Date.parse(input.observed_at))) {
    throw new Error("right-arm evidence observed_at is invalid");
  }
  assertDigest(input.workflow_registry_source_digest, "workflow_registry_source_digest");
  assertDigest(input.evidence_digest, "evidence_digest");
  assertDigest(input.verifier_command_digest, "verifier_command_digest");
}

function assertEpisodeBinding(db: HarnessDb, input: ExecutionEpisodeRightArmEvidenceInput): void {
  const episode = db
    .prepare("SELECT * FROM github_execution_episodes WHERE episode_id = ?")
    .get(input.episode_id);
  if (!episode) throw new Error("right-arm evidence episode is missing");
  const exact: Array<[keyof ExecutionEpisodeRightArmEvidenceInput, string]> = [
    ["head_sha", "head_sha"],
    ["owner", "owner"],
    ["behavior_contract_id", "behavior_contract_id"],
    ["workflow_registry_version", "workflow_registry_version"],
    ["workflow_registry_source_digest", "workflow_registry_source_digest"],
    ["workflow_target_axis", "workflow_target_axis"],
    ["workflow_target_id", "workflow_target_id"],
  ];
  for (const [inputKey, episodeKey] of exact) {
    if (String(input[inputKey]) !== String(episode[episodeKey] ?? "")) {
      throw new Error(`right-arm evidence episode binding mismatch: ${String(inputKey)}`);
    }
  }
}

export function admitExecutionEpisodeRightArmEvidence(
  db: HarnessDb,
  input: ExecutionEpisodeRightArmEvidenceInput,
): ExecutionEpisodeRightArmEvidenceResult {
  assertInput(input);
  const digest = recordDigest(input);
  db.exec("BEGIN IMMEDIATE");
  try {
    assertEpisodeBinding(db, input);
    const repeated = db
      .prepare("SELECT * FROM github_execution_episode_right_arm_evidence WHERE evidence_id = ?")
      .get(input.evidence_id);
    if (repeated) {
      const evidence = recordFromRow(repeated);
      assertStoredRecord(evidence, digest);
      db.exec("COMMIT");
      return { evidence, replayed: true };
    }
    db.prepare(
      "INSERT INTO github_execution_episode_right_arm_evidence (evidence_id, episode_id, head_sha, owner, behavior_contract_id, workflow_registry_version, workflow_registry_source_digest, workflow_target_axis, workflow_target_id, gate_id, evidence_kind, artifact_path, evidence_digest, verifier_command_digest, observed_at, record_digest) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    ).run(
      input.evidence_id,
      input.episode_id,
      input.head_sha,
      input.owner,
      input.behavior_contract_id,
      input.workflow_registry_version,
      input.workflow_registry_source_digest,
      input.workflow_target_axis,
      input.workflow_target_id,
      input.gate_id,
      input.evidence_kind,
      input.artifact_path,
      input.evidence_digest,
      input.verifier_command_digest,
      input.observed_at,
      digest,
    );
    db.exec("COMMIT");
    return { evidence: { ...input, record_digest: digest }, replayed: false };
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

export function listExecutionEpisodeRightArmEvidence(
  db: HarnessDb,
  episodeId: string,
): ExecutionEpisodeRightArmEvidence[] {
  required(episodeId, "episode_id");
  return db
    .prepare(
      "SELECT * FROM github_execution_episode_right_arm_evidence WHERE episode_id = ? ORDER BY gate_id ASC, evidence_id ASC",
    )
    .all(episodeId)
    .map(recordFromRow);
}

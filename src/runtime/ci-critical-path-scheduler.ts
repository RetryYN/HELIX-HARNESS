import { canonicalJson, sha256Digest } from "./digest";

export const CI_CRITICAL_PATH_SCHEDULER_SCHEMA = "helix-ci-critical-path-scheduler.v1";

export interface SchedulerObligation {
  capability_id: string;
  depends_on_capability_ids: readonly string[];
}

export interface SchedulerEstimate {
  capability_id: string;
  p50_ms: number;
  p95_ms: number;
  sample_count: number;
}

export interface SchedulerArtifact {
  artifact_id: string;
  capability_id: string;
  source_head: string;
  lockfile_digest: `sha256:${string}`;
  node_version: string;
  toolchain_digest: `sha256:${string}`;
  platform: string;
  input_digest: `sha256:${string}`;
  output_digest: `sha256:${string}`;
}

export interface SchedulerExclusiveResource {
  capability_id: string;
  resource_id: string;
  lease_id: string;
  fence_token: string;
}

export interface CiCriticalPathSchedulerInput {
  candidate_head: string;
  base_head: string;
  verification_plan_digest: `sha256:${string}`;
  registry_digest: `sha256:${string}`;
  obligations: readonly SchedulerObligation[];
  estimates: readonly SchedulerEstimate[];
  max_parallel_jobs: number;
  telemetry_max_age_ms: number;
  telemetry_observed_at: string;
  evaluated_at: string;
  artifacts: readonly SchedulerArtifact[];
  exclusive_resources: readonly SchedulerExclusiveResource[];
  expected_artifact_identity?: {
    lockfile_digest: `sha256:${string}`;
    node_version: string;
    toolchain_digest: `sha256:${string}`;
    platform: string;
  };
}

export type SchedulerFindingCode =
  | "head_invalid"
  | "obligation_duplicate"
  | "dependency_unknown"
  | "dependency_cycle"
  | "estimate_invalid"
  | "parallel_quota_invalid"
  | "artifact_identity_invalid"
  | "exclusive_resource_unfenced";

export interface SchedulerFinding {
  code: SchedulerFindingCode;
  subject: string;
  detail: string;
}

export interface ScheduledDagNode extends SchedulerObligation {
  parallel_group: number;
  estimated_duration_ms: number;
}

export interface CiCriticalPathSchedule {
  schema_version: typeof CI_CRITICAL_PATH_SCHEDULER_SCHEMA;
  candidate_head: string;
  base_head: string;
  verification_plan_digest: `sha256:${string}`;
  registry_digest: `sha256:${string}`;
  execution_dag: readonly ScheduledDagNode[];
  critical_path_capability_ids: readonly string[];
  predicted_critical_path_ms: number;
  predicted_runner_minutes: number;
  predicted_failure_feedback_latency_ms: number;
  reused_artifact_ids: readonly string[];
  fallback_reasons: readonly string[];
  findings: readonly SchedulerFinding[];
  schedule_digest: `sha256:${string}`;
  ok: boolean;
}

const SHA = /^[a-f0-9]{40}$/;
const DIGEST = /^sha256:[a-f0-9]{64}$/;

function finding(code: SchedulerFindingCode, subject: string, detail: string): SchedulerFinding {
  return { code, subject, detail };
}

function finiteDuration(value: number): boolean {
  return Number.isFinite(value) && Number.isInteger(value) && value >= 0;
}

function topoSort(
  obligations: ReadonlyMap<string, SchedulerObligation>,
  findings: SchedulerFinding[],
): string[] {
  const indegree = new Map<string, number>();
  const consumers = new Map<string, string[]>();
  for (const [id, item] of obligations) {
    indegree.set(id, item.depends_on_capability_ids.length);
    for (const dependency of item.depends_on_capability_ids) {
      if (!obligations.has(dependency)) {
        findings.push(finding("dependency_unknown", id, dependency));
        continue;
      }
      consumers.set(dependency, [...(consumers.get(dependency) ?? []), id]);
    }
  }
  const ready = [...indegree]
    .filter(([, degree]) => degree === 0)
    .map(([id]) => id)
    .sort();
  const ordered: string[] = [];
  while (ready.length > 0) {
    const id = ready.shift();
    if (!id) break;
    ordered.push(id);
    for (const consumer of (consumers.get(id) ?? []).sort()) {
      const next = (indegree.get(consumer) ?? 0) - 1;
      indegree.set(consumer, next);
      if (next === 0) ready.push(consumer);
    }
    ready.sort();
  }
  if (ordered.length !== obligations.size) {
    findings.push(finding("dependency_cycle", "execution_dag", "topological order incomplete"));
  }
  return ordered;
}

export function scheduleCiCriticalPath(
  input: CiCriticalPathSchedulerInput,
): CiCriticalPathSchedule {
  const findings: SchedulerFinding[] = [];
  const fallbackReasons = new Set<string>();
  if (
    !SHA.test(input.candidate_head) ||
    !SHA.test(input.base_head) ||
    input.candidate_head === input.base_head
  ) {
    findings.push(finding("head_invalid", input.candidate_head, input.base_head));
  }
  if (!Number.isInteger(input.max_parallel_jobs) || input.max_parallel_jobs < 1) {
    findings.push(
      finding("parallel_quota_invalid", "max_parallel_jobs", String(input.max_parallel_jobs)),
    );
  }
  const obligations = new Map<string, SchedulerObligation>();
  for (const obligation of input.obligations) {
    if (obligations.has(obligation.capability_id)) {
      findings.push(finding("obligation_duplicate", obligation.capability_id, "duplicate"));
    }
    obligations.set(obligation.capability_id, obligation);
  }
  const estimates = new Map<string, SchedulerEstimate>();
  for (const estimate of input.estimates) {
    if (
      !obligations.has(estimate.capability_id) ||
      !finiteDuration(estimate.p50_ms) ||
      !finiteDuration(estimate.p95_ms) ||
      estimate.p95_ms < estimate.p50_ms ||
      !Number.isInteger(estimate.sample_count) ||
      estimate.sample_count < 1
    ) {
      findings.push(finding("estimate_invalid", estimate.capability_id, "shape or ownership"));
      continue;
    }
    estimates.set(estimate.capability_id, estimate);
  }
  const observed = Date.parse(input.telemetry_observed_at);
  const evaluated = Date.parse(input.evaluated_at);
  const telemetryFresh =
    Number.isFinite(observed) &&
    Number.isFinite(evaluated) &&
    evaluated >= observed &&
    evaluated - observed <= input.telemetry_max_age_ms;
  if (!telemetryFresh || input.estimates.some((item) => item.sample_count < 3)) {
    fallbackReasons.add("telemetry_stale_or_insufficient");
  }

  const ordered = topoSort(obligations, findings);
  const duration = new Map<string, number>();
  const finish = new Map<string, number>();
  const predecessor = new Map<string, string | null>();
  const group = new Map<string, number>();
  const groupCounts = new Map<number, number>();
  const quota = Math.max(
    1,
    Number.isInteger(input.max_parallel_jobs) ? input.max_parallel_jobs : 1,
  );
  for (const id of ordered) {
    const estimate = estimates.get(id);
    const nodeDuration =
      telemetryFresh && estimate?.sample_count && estimate.sample_count >= 3 ? estimate.p95_ms : 1;
    duration.set(id, nodeDuration);
    const dependencies = obligations.get(id)?.depends_on_capability_ids ?? [];
    let criticalDependency: string | null = null;
    let dependencyFinish = 0;
    let candidateGroup = 0;
    for (const dependency of dependencies) {
      const value = finish.get(dependency) ?? 0;
      if (
        value > dependencyFinish ||
        (value === dependencyFinish && dependency < (criticalDependency ?? "~"))
      ) {
        dependencyFinish = value;
        criticalDependency = dependency;
      }
      candidateGroup = Math.max(candidateGroup, (group.get(dependency) ?? -1) + 1);
    }
    while ((groupCounts.get(candidateGroup) ?? 0) >= quota) candidateGroup += 1;
    group.set(id, candidateGroup);
    groupCounts.set(candidateGroup, (groupCounts.get(candidateGroup) ?? 0) + 1);
    finish.set(id, dependencyFinish + nodeDuration);
    predecessor.set(id, criticalDependency);
  }

  for (const resource of input.exclusive_resources) {
    if (
      !obligations.has(resource.capability_id) ||
      !resource.lease_id.trim() ||
      !resource.fence_token.trim()
    ) {
      findings.push(
        finding("exclusive_resource_unfenced", resource.capability_id, resource.resource_id),
      );
    }
  }
  const resourcesById = new Map<string, SchedulerExclusiveResource[]>();
  for (const resource of input.exclusive_resources) {
    resourcesById.set(resource.resource_id, [
      ...(resourcesById.get(resource.resource_id) ?? []),
      resource,
    ]);
  }
  for (const resources of resourcesById.values()) {
    resources.sort((a, b) => a.capability_id.localeCompare(b.capability_id));
    for (let index = 1; index < resources.length; index += 1) {
      const previous = resources[index - 1];
      const current = resources[index];
      if (group.get(previous.capability_id) === group.get(current.capability_id)) {
        group.set(current.capability_id, (group.get(current.capability_id) ?? 0) + 1);
      }
    }
  }

  const reusedArtifacts: string[] = [];
  for (const artifact of input.artifacts) {
    const expected = input.expected_artifact_identity;
    const valid =
      obligations.has(artifact.capability_id) &&
      artifact.source_head === input.candidate_head &&
      DIGEST.test(artifact.input_digest) &&
      DIGEST.test(artifact.output_digest) &&
      (!expected ||
        (artifact.lockfile_digest === expected.lockfile_digest &&
          artifact.node_version === expected.node_version &&
          artifact.toolchain_digest === expected.toolchain_digest &&
          artifact.platform === expected.platform));
    if (!valid) {
      findings.push(
        finding("artifact_identity_invalid", artifact.artifact_id, artifact.capability_id),
      );
    } else {
      reusedArtifacts.push(artifact.artifact_id);
    }
  }

  let criticalEnd = ordered[0] ?? null;
  for (const id of ordered) {
    if ((finish.get(id) ?? 0) > (finish.get(criticalEnd ?? "") ?? 0)) criticalEnd = id;
  }
  const criticalPath: string[] = [];
  let cursor: string | null = criticalEnd;
  while (cursor !== null) {
    criticalPath.unshift(cursor);
    cursor = predecessor.get(cursor) ?? null;
  }
  const executionDag = ordered.map((capability_id) => ({
    capability_id,
    depends_on_capability_ids: [
      ...(obligations.get(capability_id)?.depends_on_capability_ids ?? []),
    ].sort(),
    parallel_group: group.get(capability_id) ?? 0,
    estimated_duration_ms: duration.get(capability_id) ?? 1,
  }));
  const runnerMs = [...duration.values()].reduce((sum, value) => sum + value, 0);
  const base = {
    schema_version: CI_CRITICAL_PATH_SCHEDULER_SCHEMA,
    candidate_head: input.candidate_head,
    base_head: input.base_head,
    verification_plan_digest: input.verification_plan_digest,
    registry_digest: input.registry_digest,
    execution_dag: executionDag,
    critical_path_capability_ids: criticalPath,
    predicted_critical_path_ms: finish.get(criticalEnd ?? "") ?? 0,
    predicted_runner_minutes: runnerMs / 60_000,
    predicted_failure_feedback_latency_ms:
      criticalPath.length > 0 ? (duration.get(criticalPath[0]) ?? 0) : 0,
    reused_artifact_ids: reusedArtifacts.sort(),
    fallback_reasons: [...fallbackReasons].sort(),
    findings: findings.sort((a, b) =>
      `${a.code}:${a.subject}:${a.detail}`.localeCompare(`${b.code}:${b.subject}:${b.detail}`),
    ),
    ok: findings.length === 0,
  } satisfies Omit<CiCriticalPathSchedule, "schedule_digest">;
  return { ...base, schedule_digest: sha256Digest(canonicalJson(base)) };
}

import { canonicalJson, sha256Digest } from "./digest";

export const CI_CRITICAL_PATH_SCHEDULER_SCHEMA = "helix-ci-critical-path-scheduler.v1";

export interface SchedulerObligation {
  capability_id: string;
  depends_on_capability_ids: readonly string[];
  obligation_class: "local" | "boundary" | "global_invariant" | "release_only";
  heavy: boolean;
}

export interface SchedulerEstimate {
  capability_id: string;
  p50_ms: number;
  p95_ms: number;
  variance_ms: number;
  flake_rate: number;
  queue_ms: number;
  cache_state: "hit" | "miss" | "unknown";
  sample_count: number;
}

export interface SchedulerResourceRequirement {
  capability_id: string;
  runner_os: string;
  cpu_units: number;
  memory_mb: number;
  timeout_ms: number;
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
  expected_candidate_head: string;
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
  expected_artifact_identities: readonly {
    artifact_id: string;
    capability_id: string;
    lockfile_digest: `sha256:${string}`;
    node_version: string;
    toolchain_digest: `sha256:${string}`;
    platform: string;
    input_digest: `sha256:${string}`;
    output_digest: `sha256:${string}`;
  }[];
  resource_requirements: readonly SchedulerResourceRequirement[];
  compatible_runner_os: readonly string[];
  available_cpu_units: number;
  available_memory_mb: number;
  backpressure_active: boolean;
}

export type SchedulerFindingCode =
  | "head_invalid"
  | "obligation_duplicate"
  | "dependency_unknown"
  | "dependency_cycle"
  | "dependency_class_inversion"
  | "estimate_invalid"
  | "parallel_quota_invalid"
  | "artifact_identity_invalid"
  | "exclusive_resource_unfenced"
  | "runtime_context_invalid";

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
  bounded_cancel_policy: {
    trigger: "local_or_boundary_failure";
    cancellable_unstarted_capability_ids: readonly string[];
    preserves_required_obligations: true;
  };
  fallback_reasons: readonly string[];
  findings: readonly SchedulerFinding[];
  schedule_digest: `sha256:${string}`;
  ok: boolean;
}

const SHA = /^[a-f0-9]{40}$/;
const DIGEST = /^sha256:[a-f0-9]{64}$/;
const OBLIGATION_CLASS_RANK = {
  local: 0,
  boundary: 1,
  global_invariant: 2,
  release_only: 3,
} as const;

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
    indegree.set(
      id,
      item.depends_on_capability_ids.filter((dependency) => obligations.has(dependency)).length,
    );
    for (const dependency of item.depends_on_capability_ids) {
      if (!obligations.has(dependency)) {
        findings.push(finding("dependency_unknown", id, dependency));
        continue;
      }
      consumers.set(dependency, [...(consumers.get(dependency) ?? []), id]);
    }
  }
  const compareReady = (left: string, right: string): number => {
    const leftItem = obligations.get(left);
    const rightItem = obligations.get(right);
    const rank =
      OBLIGATION_CLASS_RANK[leftItem?.obligation_class ?? "release_only"] -
      OBLIGATION_CLASS_RANK[rightItem?.obligation_class ?? "release_only"];
    if (rank !== 0) return rank;
    if (Boolean(leftItem?.heavy) !== Boolean(rightItem?.heavy)) return leftItem?.heavy ? 1 : -1;
    return left.localeCompare(right);
  };
  const ready = [...indegree]
    .filter(([, degree]) => degree === 0)
    .map(([id]) => id)
    .sort(compareReady);
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
    ready.sort(compareReady);
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
    !SHA.test(input.expected_candidate_head) ||
    input.candidate_head !== input.expected_candidate_head ||
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
  const expectedArtifacts = new Map<string, (typeof input.expected_artifact_identities)[number]>();
  const ambiguousArtifactIds = new Set<string>();
  for (const expectedArtifact of input.expected_artifact_identities) {
    if (expectedArtifacts.has(expectedArtifact.artifact_id)) {
      ambiguousArtifactIds.add(expectedArtifact.artifact_id);
      findings.push(
        finding("artifact_identity_invalid", expectedArtifact.artifact_id, "expected_duplicate"),
      );
    }
    expectedArtifacts.set(expectedArtifact.artifact_id, expectedArtifact);
    if (
      !DIGEST.test(expectedArtifact.lockfile_digest) ||
      !DIGEST.test(expectedArtifact.toolchain_digest) ||
      !DIGEST.test(expectedArtifact.input_digest) ||
      !DIGEST.test(expectedArtifact.output_digest) ||
      !expectedArtifact.node_version.trim() ||
      !expectedArtifact.platform.trim()
    ) {
      findings.push(
        finding("artifact_identity_invalid", expectedArtifact.artifact_id, "expected_invalid"),
      );
    }
  }
  if (
    !Number.isFinite(input.available_cpu_units) ||
    input.available_cpu_units <= 0 ||
    !Number.isInteger(input.available_memory_mb) ||
    input.available_memory_mb <= 0 ||
    input.compatible_runner_os.length === 0
  ) {
    findings.push(finding("runtime_context_invalid", "runtime_budget", "missing_or_invalid"));
  }
  const obligations = new Map<string, SchedulerObligation>();
  for (const obligation of input.obligations) {
    if (obligations.has(obligation.capability_id)) {
      findings.push(finding("obligation_duplicate", obligation.capability_id, "duplicate"));
    }
    obligations.set(obligation.capability_id, obligation);
  }
  for (const obligation of obligations.values()) {
    for (const dependencyId of obligation.depends_on_capability_ids) {
      const dependency = obligations.get(dependencyId);
      if (
        dependency &&
        OBLIGATION_CLASS_RANK[dependency.obligation_class] >
          OBLIGATION_CLASS_RANK[obligation.obligation_class]
      ) {
        findings.push(
          finding("dependency_class_inversion", obligation.capability_id, dependencyId),
        );
      }
    }
  }
  const estimates = new Map<string, SchedulerEstimate>();
  for (const estimate of input.estimates) {
    if (
      !obligations.has(estimate.capability_id) ||
      !finiteDuration(estimate.p50_ms) ||
      !finiteDuration(estimate.p95_ms) ||
      !finiteDuration(estimate.variance_ms) ||
      !finiteDuration(estimate.queue_ms) ||
      !Number.isFinite(estimate.flake_rate) ||
      estimate.flake_rate < 0 ||
      estimate.flake_rate > 1 ||
      !new Set(["hit", "miss", "unknown"]).has(estimate.cache_state) ||
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
  if (
    input.estimates.some(
      (item) =>
        item.cache_state === "unknown" || item.flake_rate > 0.1 || item.variance_ms > item.p95_ms,
    )
  ) {
    fallbackReasons.add("telemetry_quality_conservative");
  }
  for (const capabilityId of obligations.keys()) {
    if (!estimates.has(capabilityId)) fallbackReasons.add(`telemetry_missing:${capabilityId}`);
  }

  const requirements = new Map<string, SchedulerResourceRequirement>();
  for (const requirement of input.resource_requirements) {
    const valid =
      obligations.has(requirement.capability_id) &&
      !requirements.has(requirement.capability_id) &&
      input.compatible_runner_os.includes(requirement.runner_os) &&
      Number.isFinite(requirement.cpu_units) &&
      requirement.cpu_units > 0 &&
      requirement.cpu_units <= input.available_cpu_units &&
      Number.isInteger(requirement.memory_mb) &&
      requirement.memory_mb > 0 &&
      requirement.memory_mb <= input.available_memory_mb &&
      Number.isInteger(requirement.timeout_ms) &&
      requirement.timeout_ms > 0;
    if (!valid) {
      findings.push(
        finding("runtime_context_invalid", requirement.capability_id, "runner/resource/timeout"),
      );
      continue;
    }
    requirements.set(requirement.capability_id, requirement);
  }
  for (const capabilityId of obligations.keys()) {
    if (!requirements.has(capabilityId)) {
      findings.push(finding("runtime_context_invalid", capabilityId, "requirement_missing"));
    }
  }
  if (input.backpressure_active) fallbackReasons.add("backpressure_conservative");

  const resourcesByCapability = new Map<string, Set<string>>();
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
    const resourceIds = resourcesByCapability.get(resource.capability_id) ?? new Set<string>();
    resourceIds.add(resource.resource_id);
    resourcesByCapability.set(resource.capability_id, resourceIds);
  }

  const ordered = topoSort(obligations, findings);
  const duration = new Map<string, number>();
  const group = new Map<string, number>();
  const groupCounts = new Map<number, number>();
  const groupResources = new Map<number, Set<string>>();
  const groupCpu = new Map<number, number>();
  const groupMemory = new Map<number, number>();
  const maxGroupByClassRank = new Map<number, number>();
  const quota = input.backpressure_active
    ? 1
    : Math.max(1, Number.isInteger(input.max_parallel_jobs) ? input.max_parallel_jobs : 1);
  for (const id of ordered) {
    const estimate = estimates.get(id);
    const requirement = requirements.get(id);
    const nodeDuration =
      telemetryFresh && estimate?.sample_count && estimate.sample_count >= 3
        ? estimate.p95_ms + estimate.queue_ms
        : (requirement?.timeout_ms ?? 1);
    duration.set(id, nodeDuration);
    const dependencies = obligations.get(id)?.depends_on_capability_ids ?? [];
    const classRank =
      OBLIGATION_CLASS_RANK[obligations.get(id)?.obligation_class ?? "release_only"];
    let candidateGroup = 0;
    for (const dependency of dependencies) {
      candidateGroup = Math.max(candidateGroup, (group.get(dependency) ?? -1) + 1);
    }
    const priorClassMax = Math.max(
      -1,
      ...[...maxGroupByClassRank]
        .filter(([rank]) => rank < classRank)
        .map(([, maxGroup]) => maxGroup),
    );
    candidateGroup = Math.max(candidateGroup, priorClassMax + 1);
    const nodeResources = resourcesByCapability.get(id) ?? new Set<string>();
    const nodeCpu = Math.min(
      requirement?.cpu_units ?? input.available_cpu_units,
      input.available_cpu_units,
    );
    const nodeMemory = Math.min(
      requirement?.memory_mb ?? input.available_memory_mb,
      input.available_memory_mb,
    );
    while (
      (groupCounts.get(candidateGroup) ?? 0) >= quota ||
      (groupCpu.get(candidateGroup) ?? 0) + nodeCpu > input.available_cpu_units ||
      (groupMemory.get(candidateGroup) ?? 0) + nodeMemory > input.available_memory_mb ||
      [...nodeResources].some((resource) => groupResources.get(candidateGroup)?.has(resource))
    ) {
      candidateGroup += 1;
    }
    group.set(id, candidateGroup);
    groupCounts.set(candidateGroup, (groupCounts.get(candidateGroup) ?? 0) + 1);
    groupCpu.set(candidateGroup, (groupCpu.get(candidateGroup) ?? 0) + nodeCpu);
    groupMemory.set(candidateGroup, (groupMemory.get(candidateGroup) ?? 0) + nodeMemory);
    groupResources.set(
      candidateGroup,
      new Set([...(groupResources.get(candidateGroup) ?? []), ...nodeResources]),
    );
    maxGroupByClassRank.set(
      classRank,
      Math.max(maxGroupByClassRank.get(classRank) ?? -1, candidateGroup),
    );
  }

  const reusedArtifacts: string[] = [];
  for (const artifact of input.artifacts) {
    const expected = expectedArtifacts.get(artifact.artifact_id);
    const valid =
      expected !== undefined &&
      !ambiguousArtifactIds.has(artifact.artifact_id) &&
      expected.capability_id === artifact.capability_id &&
      obligations.has(artifact.capability_id) &&
      artifact.source_head === input.candidate_head &&
      DIGEST.test(artifact.input_digest) &&
      DIGEST.test(artifact.output_digest) &&
      DIGEST.test(expected.lockfile_digest) &&
      DIGEST.test(expected.toolchain_digest) &&
      expected.node_version.trim().length > 0 &&
      expected.platform.trim().length > 0 &&
      artifact.lockfile_digest === expected.lockfile_digest &&
      artifact.node_version === expected.node_version &&
      artifact.toolchain_digest === expected.toolchain_digest &&
      artifact.platform === expected.platform &&
      artifact.input_digest === expected.input_digest &&
      artifact.output_digest === expected.output_digest;
    if (!valid) {
      findings.push(
        finding("artifact_identity_invalid", artifact.artifact_id, artifact.capability_id),
      );
    } else {
      reusedArtifacts.push(artifact.artifact_id);
    }
  }

  const orderedGroups = [...new Set(group.values())].sort((a, b) => a - b);
  const groupDurations = new Map<number, number>();
  const criticalPath: string[] = [];
  for (const groupId of orderedGroups) {
    const members = ordered.filter((id) => group.get(id) === groupId);
    const criticalMember = members.sort((left, right) => {
      const delta = (duration.get(right) ?? 0) - (duration.get(left) ?? 0);
      return delta !== 0 ? delta : left.localeCompare(right);
    })[0];
    if (criticalMember) criticalPath.push(criticalMember);
    groupDurations.set(groupId, Math.max(0, ...members.map((id) => duration.get(id) ?? 0)));
  }
  const predictedCriticalPathMs = [...groupDurations.values()].reduce(
    (sum, value) => sum + value,
    0,
  );
  const executionDag = ordered.map((capability_id) => ({
    capability_id,
    depends_on_capability_ids: [
      ...(obligations.get(capability_id)?.depends_on_capability_ids ?? []),
    ].sort(),
    obligation_class: obligations.get(capability_id)?.obligation_class ?? "release_only",
    heavy: obligations.get(capability_id)?.heavy ?? true,
    parallel_group: group.get(capability_id) ?? 0,
    estimated_duration_ms: duration.get(capability_id) ?? 1,
  }));
  const runnerMs = [...duration.values()].reduce((sum, value) => sum + value, 0);
  const cancellableUnstarted = ordered
    .filter((id) => {
      const obligation = obligations.get(id);
      return (
        Boolean(obligation?.heavy) &&
        (obligation?.obligation_class === "global_invariant" ||
          obligation?.obligation_class === "release_only")
      );
    })
    .sort();
  const base = {
    schema_version: CI_CRITICAL_PATH_SCHEDULER_SCHEMA,
    candidate_head: input.candidate_head,
    base_head: input.base_head,
    verification_plan_digest: input.verification_plan_digest,
    registry_digest: input.registry_digest,
    execution_dag: executionDag,
    critical_path_capability_ids: criticalPath,
    predicted_critical_path_ms: predictedCriticalPathMs,
    predicted_runner_minutes: runnerMs / 60_000,
    predicted_failure_feedback_latency_ms:
      criticalPath.length > 0 ? (duration.get(criticalPath[0]) ?? 0) : 0,
    reused_artifact_ids: reusedArtifacts.sort(),
    bounded_cancel_policy: {
      trigger: "local_or_boundary_failure",
      cancellable_unstarted_capability_ids: cancellableUnstarted,
      preserves_required_obligations: true,
    },
    fallback_reasons: [...fallbackReasons].sort(),
    findings: findings.sort((a, b) =>
      `${a.code}:${a.subject}:${a.detail}`.localeCompare(`${b.code}:${b.subject}:${b.detail}`),
    ),
    ok: findings.length === 0,
  } satisfies Omit<CiCriticalPathSchedule, "schedule_digest">;
  return { ...base, schedule_digest: sha256Digest(canonicalJson(base)) };
}

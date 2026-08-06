import { execFileSync } from "node:child_process";
import {
  chmodSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect } from "vitest";
import {
  admitWrapperLaunch,
  buildContextBoundWrapperAdapterPlan,
  type WrapperLaunchExecution,
} from "../../src/runtime/adapter";
import { canonicalJson, sha256Digest } from "../../src/runtime/digest";
import {
  buildWorkerBlindJudgeContext,
  buildWorkerBlindPacket,
  evaluateWorkerBlindBenchmark,
  freezeWorkerBlindBenchmark,
  isWorkerBlindBenchmarkReceipt,
  type WorkerBlindBenchmarkReceiptV1,
} from "../../src/runtime/worker-blind-benchmark";
import { attestWorkerContextAuthority } from "../../src/runtime/worker-context-packet";
import {
  canonicalizeWorkerRegistrySnapshot,
  evaluateWorkerDescriptorAdmission,
  type WorkerDescriptorAdmissionDecisionV1,
  type WorkerDescriptorRequestV1,
  type WorkerDescriptorV1,
  type WorkerRegistrySnapshotV1,
} from "../../src/runtime/worker-descriptor-admission";
import {
  attestWorkerIsolationAuthority,
  prepareWorkerIsolationLaunch,
  runWorkerIsolationLaunch,
  type WorkerBenchmarkExecutionCapability,
  type WorkerBlindJudgeContextCapability,
  type WorkerIsolationAuthorityCapability,
} from "../../src/runtime/worker-isolation-broker";
import {
  attestWorkerIsolationPolicy,
  type WorkerIsolationPolicyCapability,
} from "../../src/runtime/worker-isolation-policy";
import {
  formatWorkerOutputContract,
  WORKER_BLIND_EVALUATION_OUTPUT_SCHEMA_DIGEST,
  WORKER_PROPOSAL_OUTPUT_SCHEMA_DIGEST,
} from "../../src/runtime/worker-output-admission";

/**
 * WCC-FR-03/05/07/08 の broker fixture 群。tests/worker-isolation-broker.test.ts と
 * tests/worker-risk-admission.test.ts が同一の sealed capability chain を共有するため、
 * 責務境界ごとに test file を分けつつ fixture の二重定義を避ける（issue #382）。
 */

const roots: string[] = [];
export const realBwrapPath = [
  process.env.HELIX_BWRAP_BIN,
  "/usr/bin/bwrap",
  "/usr/local/bin/bwrap",
].find((candidate): candidate is string => Boolean(candidate && existsSync(candidate)));

export function admissionFixture(
  agentId = "codex-worker",
  outputSchemaDigest = WORKER_PROPOSAL_OUTPUT_SCHEMA_DIGEST,
): {
  request: WorkerDescriptorRequestV1;
  snapshot: WorkerRegistrySnapshotV1;
  decision: WorkerDescriptorAdmissionDecisionV1;
} {
  const descriptorPayload = {
    schema_version: "helix-worker-descriptor.v1" as const,
    agent_id: agentId,
    contract_version: "1.0.0",
    provider: "codex",
    capability_class: "implementation" as const,
    input_schema_digest: sha256Digest("input"),
    output_schema_digest: outputSchemaDigest,
  };
  const descriptor: WorkerDescriptorV1 = {
    ...descriptorPayload,
    descriptor_digest: sha256Digest(canonicalJson(descriptorPayload)),
  };
  const source_record = {
    schema_version: "helix-python-worker-descriptor.v1" as const,
    worker_id: descriptor.agent_id,
    worker_version: descriptor.contract_version,
    provider: descriptor.provider,
    capability_class: "analysis",
    request_schema: "worker-request.v1",
    result_schema: "worker-result.v1",
  };
  const source_record_digest = sha256Digest(canonicalJson(source_record));
  const sourceEntryPayload = {
    schema_version: "helix-worker-source-entry.v1" as const,
    source_registry: "python_worker" as const,
    source_schema_version: "helix-python-worker-descriptor.v1",
    source_record_digest,
    status: "active" as const,
    descriptor_digest: descriptor.descriptor_digest,
  };
  const canonical = canonicalizeWorkerRegistrySnapshot(
    [
      {
        descriptor,
        status: "active",
        source_registry: "python_worker",
        source_schema_version: "helix-python-worker-descriptor.v1",
        source_record,
        source_record_digest,
        source_entry_digest: sha256Digest(canonicalJson(sourceEntryPayload)),
      },
    ],
    1,
  );
  if (!canonical.ok)
    throw new Error(`registry fixture failed: ${canonical.failureCodes.join(",")}`);
  const request = {
    agent_id: descriptor.agent_id,
    contract_version: descriptor.contract_version,
    capability_class: descriptor.capability_class,
  };
  return {
    request,
    snapshot: canonical.value,
    decision: evaluateWorkerDescriptorAdmission(request, canonical.value),
  };
}

export function temporaryRoot(prefix: string): string {
  const root = mkdtempSync(join(tmpdir(), prefix));
  roots.push(root);
  return root;
}

export function admittedLaunch(
  command: string,
  admission = admissionFixture(),
  task = "fixture",
  model: string | null = "gpt-worker",
  repoRoot = process.cwd(),
  includeOutputContract = true,
  effort: string | null = "medium",
): WrapperLaunchExecution {
  process.env.HELIX_CODEX_BIN = command;
  const descriptorDigest = admission.decision.descriptor_digest;
  if (!descriptorDigest) throw new Error("fixture descriptor digest missing");
  const outputSchemaDigest = admission.snapshot.entries[0]?.descriptor.output_schema_digest;
  if (!outputSchemaDigest) throw new Error("fixture output schema digest missing");
  const head = execFileSync("git", ["rev-parse", "HEAD"], {
    cwd: repoRoot,
    encoding: "utf8",
  }).trim();
  const contextAuthority = attestWorkerContextAuthority({
    repo_root: repoRoot,
    current_head: head,
    authority_paths: [
      "docs/governance/helix-harness-requirements_v1.3.md",
      "docs/governance/l12-canonical-vmodel-direction-directive_v0.1.md",
      "docs/design/helix/L3-requirements/worker-common-contract.md",
    ],
    rule_paths: ["AGENTS.md", "CLAUDE.md", "docs/skills/judgment-core.md"],
  });
  if (!("kind" in contextAuthority)) throw new Error(contextAuthority.failure_code);
  const built = buildContextBoundWrapperAdapterPlan({
    intent: {
      provider: "codex",
      role: "se",
      task: includeOutputContract
        ? [task, formatWorkerOutputContract(outputSchemaDigest, descriptorDigest)].join("\n\n")
        : task,
      execute: true,
      ...(model ? { model } : {}),
      ...(effort ? { effort } : {}),
    },
    mode: "codex-only",
    route: "helix_cli_adapter",
    authority: contextAuthority,
    boundary: {
      goal_id: "goal:test",
      workflow_style: "v_model",
      case_model: "none",
      specialist_process: "none",
      behavior_contract_id: "WCC-FR-09",
      responsibility_owner: "worker-context-authority",
      allowed_paths: ["input.txt"],
      forbidden_paths: [".helix", "harness.db"],
      severity_policy_digest: sha256Digest("severity"),
      required_output_schema: outputSchemaDigest,
      budget: { time_ms: 60_000, token_limit: 8_000 },
    },
  });
  if (!built.ok) throw new Error(built.failure_code);
  const plan = built.plan;
  const launch = admitWrapperLaunch(plan);
  if (!("capability" in launch))
    throw new Error(`fixture admission failed: ${launch.failure_code}`);
  return launch;
}

export function uncontractedLaunch(
  command: string,
  admission: ReturnType<typeof admissionFixture>,
  repoRoot: string,
): WrapperLaunchExecution {
  return admittedLaunch(command, admission, "fixture", "gpt-worker", repoRoot, false);
}

export function isolationPolicy(
  launch: WrapperLaunchExecution,
  writablePaths: readonly string[] = [],
): WorkerIsolationPolicyCapability {
  const result = attestWorkerIsolationPolicy({
    wrapperLaunch: launch,
    task_sensitivity: "non_secret",
    writable_paths: writablePaths,
    allowed_egress_hosts: [],
  });
  if (!("kind" in result)) throw new Error(`policy fixture failed: ${result.failure_code}`);
  return result;
}

export function authority(
  repoRoot: string,
  backendPath: string,
  runtimePath: string,
): WorkerIsolationAuthorityCapability {
  const backendDigest = sha256Digest(readFileSync(backendPath));
  const runtimeDigest = sha256Digest(readFileSync(runtimePath));
  mkdirSync(join(repoRoot, "config"), { recursive: true });
  writeFileSync(
    join(repoRoot, "config", "worker-isolation-runtime-catalog.json"),
    JSON.stringify({
      schema_version: "helix-worker-isolation-runtime-catalog.v1",
      backends: [{ backend_id: "bubblewrap", digest: backendDigest }],
      runtimes: [{ runtime_id: "fixture-worker", digest: runtimeDigest }],
    }),
  );
  const result = attestWorkerIsolationAuthority(repoRoot, {
    schema_version: "helix-worker-isolation-authority.v1",
    backend_id: "bubblewrap",
    backend_path: backendPath,
    backend_digest: backendDigest,
    runtime_id: "fixture-worker",
    runtime_path: runtimePath,
    runtime_digest: runtimeDigest,
  });
  if (!("kind" in result)) throw new Error(`authority fixture failed: ${result.failure_code}`);
  return result;
}

export function fixture(
  agentId = "codex-worker",
  task = "fixture",
  model: string | null = "gpt-worker",
  outputSchemaDigest = WORKER_PROPOSAL_OUTPUT_SCHEMA_DIGEST,
  effort: string | null = "medium",
): {
  repoRoot: string;
  scratchBase: string;
  worker: string;
  launch: WrapperLaunchExecution;
  authority: WorkerIsolationAuthorityCapability;
  policy: WorkerIsolationPolicyCapability;
  admission: ReturnType<typeof admissionFixture>;
} {
  const repoRoot = temporaryRoot("helix-isolation-repo-");
  const scratchBase = temporaryRoot("helix-isolation-scratch-");
  for (const path of [
    "docs/governance/helix-harness-requirements_v1.3.md",
    "docs/governance/l12-canonical-vmodel-direction-directive_v0.1.md",
    "docs/design/helix/L3-requirements/worker-common-contract.md",
    "docs/skills/judgment-core.md",
    "AGENTS.md",
    "CLAUDE.md",
  ]) {
    mkdirSync(join(repoRoot, path, ".."), { recursive: true });
    writeFileSync(join(repoRoot, path), `${path}\n`);
  }
  mkdirSync(join(repoRoot, ".helix"));
  writeFileSync(join(repoRoot, ".helix", "harness.db"), "forbidden");
  writeFileSync(join(repoRoot, "input.txt"), "allowed\n");
  execFileSync("git", ["init", "-q"], { cwd: repoRoot });
  execFileSync("git", ["config", "user.email", "fixture@example.invalid"], { cwd: repoRoot });
  execFileSync("git", ["config", "user.name", "Fixture"], { cwd: repoRoot });
  execFileSync("git", ["add", "AGENTS.md", "CLAUDE.md", "docs", "input.txt"], {
    cwd: repoRoot,
  });
  execFileSync("git", ["commit", "-qm", "fixture"], { cwd: repoRoot });
  const worker = join(temporaryRoot("helix-isolation-worker-"), "worker.sh");
  const admission = admissionFixture(agentId, outputSchemaDigest);
  const descriptorDigest = admission.decision.descriptor_digest;
  if (!descriptorDigest) throw new Error("fixture descriptor digest missing");
  const payload =
    outputSchemaDigest === WORKER_PROPOSAL_OUTPUT_SCHEMA_DIGEST
      ? { proposal_only: true, schema_version: "helix-worker-proposal.v1", summary: "isolated" }
      : {
          packet_digest: sha256Digest("placeholder"),
          schema_version: "helix-worker-blind-evaluation.v1",
          scores: [{ dimension_id: "correctness", score: 1 }],
        };
  const workerOutput = canonicalJson({
    descriptor_digest: descriptorDigest,
    output_schema_digest: outputSchemaDigest,
    payload,
    payload_digest: sha256Digest(canonicalJson(payload)),
    schema_version: "helix-worker-output-envelope.v1",
  });
  writeFileSync(
    worker,
    [
      "#!/bin/sh",
      "set -eu",
      'test "$(pwd)" = /workspace',
      'test "$(cat input.txt)" = allowed',
      `test ! -e ${repoRoot}`,
      "test ! -e /workspace/.git",
      "test ! -e /workspace/.helix",
      "test ! -e /workspace/harness.db",
      `test "\${HOME}" = /workspace`,
      `test -z "\${GITHUB_TOKEN:-}"`,
      `printf '%s' '${workerOutput}'`,
    ].join("\n"),
  );
  chmodSync(worker, 0o755);
  const launch = admittedLaunch(worker, admission, task, model, repoRoot, true, effort);
  const policy = isolationPolicy(launch);
  return {
    repoRoot,
    scratchBase,
    worker,
    launch,
    authority: authority(repoRoot, "/bin/true", worker),
    policy,
    admission,
  };
}

export function executeFixtureRun(
  value: ReturnType<typeof fixture>,
  payload: unknown = {
    proposal_only: true,
    schema_version: "helix-worker-proposal.v1",
    summary: "executed",
  },
  riskClass: "low" | "medium" | "high" | "critical" = "high",
  bindings: {
    benchmark?: WorkerBenchmarkExecutionCapability;
    blindJudge?: WorkerBlindJudgeContextCapability;
  } = {},
  delayMs = 0,
) {
  const prepared = prepareWorkerIsolationLaunch({
    repoRoot: value.repoRoot,
    scratchBaseDir: value.scratchBase,
    inputPaths: ["input.txt"],
    wrapperLaunch: value.launch,
    admission: value.admission,
    platform: "linux",
    authority: value.authority,
    policy: value.policy,
    riskClass,
    ...bindings,
  });
  if (!prepared.isolated) throw new Error(prepared.failure_code);
  const descriptorDigest = value.admission.decision.descriptor_digest;
  if (!descriptorDigest) throw new Error("fixture descriptor digest missing");
  const outputSchemaDigest = value.admission.snapshot.entries[0]?.descriptor.output_schema_digest;
  if (!outputSchemaDigest) throw new Error("fixture output schema digest missing");
  const result = runWorkerIsolationLaunch(prepared.launch, () => {
    if (delayMs > 0) Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, delayMs);
    return {
      status: 0,
      stdout: Buffer.from(
        canonicalJson({
          descriptor_digest: descriptorDigest,
          output_schema_digest: outputSchemaDigest,
          payload,
          payload_digest: sha256Digest(canonicalJson(payload)),
          schema_version: "helix-worker-output-envelope.v1",
        }),
      ),
      stderr: Buffer.alloc(0),
    };
  });
  if (!result.isolated) throw new Error(result.failure_code);
  return result;
}

export function executeFixture(value: ReturnType<typeof fixture>, payload?: unknown) {
  return executeFixtureRun(value, payload).output;
}
export const benchmarkDefinition = (
  binding: {
    fixture_digest: ReturnType<typeof sha256Digest>;
    task_digest: ReturnType<typeof sha256Digest>;
  } = {
    fixture_digest: sha256Digest(
      canonicalJson([{ path: "input.txt", size: 8, digest: sha256Digest("allowed\n") }]),
    ),
    task_digest: sha256Digest("benchmark task"),
  },
  riskClass: "low" | "medium" | "high" | "critical" = "high",
) => ({
  schema_version: "helix-worker-blind-benchmark-definition.v1" as const,
  benchmark_id: "worker-review-standard",
  fixture_digest: binding.fixture_digest,
  rubric: [
    { dimension_id: "correctness", weight: 60, min: 0, max: 100 },
    { dimension_id: "scope_discipline", weight: 40, min: 0, max: 100 },
  ],
  task_digest: binding.task_digest,
  risk_class: riskClass,
  admission_level: "full" as const,
  cost_policy: { duration_weight: 1, token_weight: 0, retry_weight: 0 },
});
export const evaluatedBenchmark = (
  riskClass: "low" | "medium" | "high" | "critical" = "high",
  score: number | null = null,
  effort = "medium",
  delayMs = 0,
): WorkerBlindBenchmarkReceiptV1 => {
  const frozen = freezeWorkerBlindBenchmark(benchmarkDefinition(undefined, riskClass));
  if (!frozen.ok) throw new Error(frozen.failure_code);
  const leftWorker = fixture(
    "candidate-a",
    "benchmark task",
    "k3",
    WORKER_PROPOSAL_OUTPUT_SCHEMA_DIGEST,
    effort,
  );
  const rightWorker = fixture(
    "candidate-b",
    "benchmark task",
    "qwen3-coder",
    WORKER_PROPOSAL_OUTPUT_SCHEMA_DIGEST,
    effort,
  );
  const leftRun = executeFixtureRun(
    leftWorker,
    undefined,
    riskClass,
    { benchmark: frozen.execution },
    delayMs,
  );
  const rightRun = executeFixtureRun(
    rightWorker,
    undefined,
    riskClass,
    { benchmark: frozen.execution },
    delayMs,
  );
  const left = buildWorkerBlindPacket(frozen.capability, {
    candidate_id: "candidate-a",
    output: leftRun.output,
    current: leftWorker.admission,
    observation: leftRun.observation,
    execution: frozen.execution,
  });
  const right = buildWorkerBlindPacket(frozen.capability, {
    candidate_id: "candidate-b",
    output: rightRun.output,
    current: rightWorker.admission,
    observation: rightRun.observation,
    execution: frozen.execution,
  });
  if (!left.ok || !right.ok) throw new Error("packet fixture failed");
  expect(JSON.stringify(left.packet)).not.toContain("candidate-a");
  expect(JSON.stringify(left.packet)).not.toContain("k3");

  const leftJudgeContext = buildWorkerBlindJudgeContext(left.capability);
  const rightJudgeContext = buildWorkerBlindJudgeContext(right.capability);
  if (!leftJudgeContext.ok || !rightJudgeContext.ok) throw new Error("judge context failed");
  const leftJudge = fixture(
    "judge-left",
    leftJudgeContext.context.task,
    "reviewer",
    WORKER_BLIND_EVALUATION_OUTPUT_SCHEMA_DIGEST,
  );
  const rightJudge = fixture(
    "judge-right",
    rightJudgeContext.context.task,
    "reviewer",
    WORKER_BLIND_EVALUATION_OUTPUT_SCHEMA_DIGEST,
  );
  const evaluationPayload = (packetDigest: string) => ({
    packet_digest: packetDigest,
    schema_version: "helix-worker-blind-evaluation.v1" as const,
    scores: [
      { dimension_id: "correctness", score: score ?? 90 },
      { dimension_id: "scope_discipline", score: score ?? 80 },
    ],
  });
  const leftEvaluation = executeFixtureRun(
    leftJudge,
    evaluationPayload(left.packet.packet_digest),
    "high",
    { blindJudge: leftJudgeContext.context.capability },
  ).output;
  const rightEvaluation = executeFixtureRun(
    rightJudge,
    evaluationPayload(right.packet.packet_digest),
    "high",
    { blindJudge: rightJudgeContext.context.capability },
  ).output;
  const result = evaluateWorkerBlindBenchmark(frozen.capability, [
    {
      packet: left.capability,
      judge_output: leftEvaluation,
      judge_current: leftJudge.admission,
      judge_context: leftJudgeContext.context.capability,
    },
    {
      packet: right.capability,
      judge_output: rightEvaluation,
      judge_current: rightJudge.admission,
      judge_context: rightJudgeContext.context.capability,
    },
  ]);
  expect(result.ok).toBe(true);
  if (!result.ok) throw new Error(result.failure_code);
  expect(result.receipt.ranking.map((row) => row.candidate_id).sort()).toEqual([
    "candidate-a",
    "candidate-b",
  ]);
  expect(result.receipt.ranking[0]).toMatchObject({ blind_score: score ?? 86 });
  expect(isWorkerBlindBenchmarkReceipt(result.receipt)).toBe(true);
  expect(isWorkerBlindBenchmarkReceipt({ ...result.receipt })).toBe(false);

  return result.receipt;
};

/** 各 test file の afterEach から呼び、fixture が作った temp root を回収する。 */
export function cleanupWorkerIsolationFixtures(): void {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
}

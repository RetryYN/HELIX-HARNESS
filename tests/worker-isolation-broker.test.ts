import { execFileSync } from "node:child_process";
import {
  chmodSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  symlinkSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  admitWrapperLaunch,
  buildContextBoundWrapperAdapterPlan,
  buildWrapperAdapterPlan,
  type WrapperLaunchExecution,
} from "../src/runtime/adapter";
import { canonicalJson, sha256Digest } from "../src/runtime/digest";
import {
  buildWorkerBlindJudgeContext,
  buildWorkerBlindPacket,
  evaluateWorkerBlindBenchmark,
  freezeWorkerBlindBenchmark,
  isWorkerBlindBenchmarkReceipt,
  type WorkerBlindBenchmarkReceiptV1,
} from "../src/runtime/worker-blind-benchmark";
import { attestWorkerContextAuthority } from "../src/runtime/worker-context-packet";
import {
  canonicalizeWorkerRegistrySnapshot,
  evaluateWorkerDescriptorAdmission,
  type WorkerDescriptorAdmissionDecisionV1,
  type WorkerDescriptorRequestV1,
  type WorkerDescriptorV1,
  type WorkerRegistrySnapshotV1,
} from "../src/runtime/worker-descriptor-admission";
import {
  attestWorkerIsolationAuthority,
  prepareWorkerIsolationLaunch,
  resolveWorkerIsolationExecutionOrigin,
  runWorkerIsolationLaunch,
  type WorkerBenchmarkExecutionCapability,
  type WorkerBlindJudgeContextCapability,
  type WorkerIsolationAuthorityCapability,
  type WorkerIsolationLaunch,
} from "../src/runtime/worker-isolation-broker";
import {
  attestWorkerIsolationPolicy,
  type WorkerIsolationPolicyCapability,
} from "../src/runtime/worker-isolation-policy";
import {
  formatWorkerOutputContract,
  readValidatedWorkerPayload,
  WORKER_BLIND_EVALUATION_OUTPUT_SCHEMA_DIGEST,
  WORKER_PROPOSAL_OUTPUT_SCHEMA_DIGEST,
} from "../src/runtime/worker-output-admission";

// PLAN-L7-503-worker-context-authority
import {
  admitWorkerIndependentReview,
  isWorkerIndependentReview,
  workerProposalCapabilityDigest,
} from "../src/runtime/worker-review-receipt";
import {
  decideWorkerRiskAdmission,
  isWorkerRiskAdmissionReceipt,
} from "../src/runtime/worker-risk-admission";

// PLAN-L7-499-worker-isolation-broker
// PLAN-L7-500-worker-isolation-policy
// PLAN-L7-501-worker-output-admission
// PLAN-L7-502-worker-independent-review
// PLAN-L7-504-worker-blind-benchmark
// PLAN-L7-505-worker-risk-admission

const roots: string[] = [];
const originalCodexBin = process.env.HELIX_CODEX_BIN;
const originalGithubToken = process.env.GITHUB_TOKEN;
const realBwrapPath = [process.env.HELIX_BWRAP_BIN, "/usr/bin/bwrap", "/usr/local/bin/bwrap"].find(
  (candidate): candidate is string => Boolean(candidate && existsSync(candidate)),
);

function admissionFixture(
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

function temporaryRoot(prefix: string): string {
  const root = mkdtempSync(join(tmpdir(), prefix));
  roots.push(root);
  return root;
}

function admittedLaunch(
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

function uncontractedLaunch(
  command: string,
  admission: ReturnType<typeof admissionFixture>,
  repoRoot: string,
): WrapperLaunchExecution {
  return admittedLaunch(command, admission, "fixture", "gpt-worker", repoRoot, false);
}

function isolationPolicy(
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

function authority(
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

function fixture(
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

function executeFixtureRun(
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

function executeFixture(value: ReturnType<typeof fixture>, payload?: unknown) {
  return executeFixtureRun(value, payload).output;
}

afterEach(() => {
  if (originalCodexBin === undefined) delete process.env.HELIX_CODEX_BIN;
  else process.env.HELIX_CODEX_BIN = originalCodexBin;
  if (originalGithubToken === undefined) delete process.env.GITHUB_TOKEN;
  else process.env.GITHUB_TOKEN = originalGithubToken;
  vi.restoreAllMocks();
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

describe("WCC-FR-03 worker isolation broker", () => {
  it("U-WIB-015: context packet無しのlegacy wrapperを起動前に拒否する", () => {
    const f = fixture();
    process.env.HELIX_CODEX_BIN = f.worker;
    const descriptorDigest = f.admission.decision.descriptor_digest;
    if (!descriptorDigest) throw new Error("fixture descriptor digest missing");
    const legacyPlan = buildWrapperAdapterPlan(
      {
        provider: "codex",
        role: "se",
        task: [
          "legacy",
          formatWorkerOutputContract(WORKER_PROPOSAL_OUTPUT_SCHEMA_DIGEST, descriptorDigest),
        ].join("\n\n"),
        execute: true,
        model: "gpt-worker",
      },
      "codex-only",
      "helix_cli_adapter",
    );
    const legacyLaunch = admitWrapperLaunch(legacyPlan);
    if (!("capability" in legacyLaunch)) throw new Error(legacyLaunch.failure_code);
    expect(
      prepareWorkerIsolationLaunch({
        repoRoot: f.repoRoot,
        scratchBaseDir: f.scratchBase,
        inputPaths: ["input.txt"],
        wrapperLaunch: legacyLaunch,
        admission: f.admission,
        platform: "linux",
        authority: f.authority,
        policy: isolationPolicy(legacyLaunch),
      }),
    ).toEqual({ isolated: false, failure_code: "WORKER_CONTEXT_UNSEALED" });
  });

  it("U-WIB-016: attestation後にauthorityがdirty化した場合はspawn前に拒否する", () => {
    const f = fixture();
    writeFileSync(
      join(f.repoRoot, "docs/design/helix/L3-requirements/worker-common-contract.md"),
      "dirty-after-attestation\n",
      { flag: "a" },
    );

    expect(
      prepareWorkerIsolationLaunch({
        repoRoot: f.repoRoot,
        scratchBaseDir: f.scratchBase,
        inputPaths: ["input.txt"],
        wrapperLaunch: f.launch,
        admission: f.admission,
        platform: "linux",
        authority: f.authority,
        policy: f.policy,
      }),
    ).toEqual({ isolated: false, failure_code: "WORKER_CONTEXT_AUTHORITY_UNRESOLVED" });
  });

  it("U-WIB-001: rejects a scratch root inside the repository before spawn", () => {
    const f = fixture();
    expect(
      prepareWorkerIsolationLaunch({
        repoRoot: f.repoRoot,
        scratchBaseDir: join(f.repoRoot, "scratch"),
        inputPaths: ["input.txt"],
        wrapperLaunch: f.launch,
        admission: admissionFixture(),
        platform: "linux",
        authority: f.authority,
        policy: f.policy,
      }),
    ).toEqual({ isolated: false, failure_code: "WORKER_ISOLATION_BOUNDARY_INVALID" });
    const foreign = fixture();
    expect(
      prepareWorkerIsolationLaunch({
        repoRoot: f.repoRoot,
        scratchBaseDir: f.scratchBase,
        inputPaths: ["input.txt"],
        wrapperLaunch: f.launch,
        admission: admissionFixture(),
        authority: foreign.authority,
        policy: f.policy,
        platform: "linux",
      }),
    ).toEqual({ isolated: false, failure_code: "WORKER_ISOLATION_BOUNDARY_INVALID" });
  });

  it("U-WIB-002: rejects symlink and .git/.helix/harness.db inputs", () => {
    const f = fixture();
    symlinkSync(join(f.repoRoot, "input.txt"), join(f.repoRoot, "link.txt"));
    for (const inputPath of ["link.txt", ".git/config", ".helix/harness.db", "harness.db"]) {
      expect(
        prepareWorkerIsolationLaunch({
          repoRoot: f.repoRoot,
          scratchBaseDir: f.scratchBase,
          inputPaths: [inputPath],
          wrapperLaunch: f.launch,
          admission: admissionFixture(),
          platform: "linux",
          authority: f.authority,
          policy: f.policy,
        }),
      ).toEqual({ isolated: false, failure_code: "WORKER_ISOLATION_SOURCE_REJECTED" });
    }
  });

  it("U-WIB-003: fails closed on unsupported platform or unavailable backend", () => {
    const f = fixture();
    expect(
      attestWorkerIsolationAuthority(f.repoRoot, {
        ...f.authority,
        schema_version: "helix-worker-isolation-authority.v1",
        backend_digest: sha256Digest("forged-backend"),
      }),
    ).toEqual({ isolated: false, failure_code: "WORKER_ISOLATION_BACKEND_UNAVAILABLE" });
    expect(
      attestWorkerIsolationAuthority(f.repoRoot, {
        ...f.authority,
        schema_version: "helix-worker-isolation-authority.v1",
        runtime_digest: sha256Digest("forged-runtime"),
      }),
    ).toEqual({ isolated: false, failure_code: "WORKER_ISOLATION_RUNTIME_INVALID" });
    expect(
      prepareWorkerIsolationLaunch({
        repoRoot: f.repoRoot,
        scratchBaseDir: f.scratchBase,
        inputPaths: ["input.txt"],
        wrapperLaunch: f.launch,
        admission: admissionFixture(),
        authority: f.authority,
        policy: f.policy,
        platform: "win32",
      }),
    ).toEqual({ isolated: false, failure_code: "WORKER_ISOLATION_PLATFORM_UNSUPPORTED" });
    expect(
      prepareWorkerIsolationLaunch({
        repoRoot: f.repoRoot,
        scratchBaseDir: f.scratchBase,
        inputPaths: ["input.txt"],
        wrapperLaunch: f.launch,
        admission: admissionFixture(),
        platform: "linux",
        authority: { ...f.authority } as WorkerIsolationAuthorityCapability,
        policy: f.policy,
      }),
    ).toEqual({ isolated: false, failure_code: "WORKER_ISOLATION_BACKEND_UNAVAILABLE" });
    unlinkSync(f.worker);
    expect(
      prepareWorkerIsolationLaunch({
        repoRoot: f.repoRoot,
        scratchBaseDir: f.scratchBase,
        inputPaths: ["input.txt"],
        wrapperLaunch: f.launch,
        admission: admissionFixture(),
        platform: "linux",
        authority: f.authority,
        policy: f.policy,
      }),
    ).toEqual({ isolated: false, failure_code: "WORKER_ISOLATION_RUNTIME_INVALID" });
  });

  it("U-WIB-004: rejects copied or fabricated wrapper launches", () => {
    const f = fixture();
    expect(() => {
      f.launch.invocation.command = "/bin/false";
    }).toThrow();
    expect(f.launch.invocation.command).toBe(f.worker);
    const copied = { ...f.launch } as WrapperLaunchExecution;
    expect(
      prepareWorkerIsolationLaunch({
        repoRoot: f.repoRoot,
        scratchBaseDir: f.scratchBase,
        inputPaths: ["input.txt"],
        wrapperLaunch: copied,
        admission: admissionFixture(),
        platform: "linux",
        authority: f.authority,
        policy: f.policy,
      }),
    ).toEqual({ isolated: false, failure_code: "WORKER_ISOLATION_WRAPPER_UNADMITTED" });
  });

  it("U-WIB-005: stages only regular allowlisted bytes without git history", () => {
    const f = fixture();
    const result = prepareWorkerIsolationLaunch({
      repoRoot: f.repoRoot,
      scratchBaseDir: f.scratchBase,
      inputPaths: ["input.txt"],
      wrapperLaunch: f.launch,
      admission: admissionFixture(),
      platform: "linux",
      authority: f.authority,
      policy: f.policy,
    });
    expect(result.isolated).toBe(true);
    if (!result.isolated) return;
    expect(result.launch.input_manifest).toHaveLength(1);
    expect(result.launch.input_manifest[0]?.path).toBe("input.txt");
    expect(readFileSync(join(result.launch.scratch_path, "input.txt"), "utf8")).toBe("allowed\n");
    expect(() => readFileSync(join(result.launch.scratch_path, ".git", "HEAD"))).toThrow();
    expect(
      realpathSync(result.launch.scratch_path).startsWith(`${realpathSync(f.repoRoot)}/`),
    ).toBe(false);
  });

  it("U-WIB-006: rejects a copied broker launch before process spawn", () => {
    const f = fixture();
    const prepared = prepareWorkerIsolationLaunch({
      repoRoot: f.repoRoot,
      scratchBaseDir: f.scratchBase,
      inputPaths: ["input.txt"],
      wrapperLaunch: f.launch,
      admission: admissionFixture(),
      platform: "linux",
      authority: f.authority,
      policy: f.policy,
    });
    expect(prepared.isolated).toBe(true);
    if (!prepared.isolated) return;
    const spawn = vi.fn();
    expect(
      runWorkerIsolationLaunch({ ...prepared.launch } as WorkerIsolationLaunch, spawn),
    ).toEqual({ isolated: false, failure_code: "WORKER_ISOLATION_LAUNCH_UNSEALED" });
    expect(spawn).not.toHaveBeenCalled();
  });

  it("U-WIB-007: executes a real process with repo, state, DB and credentials unreachable", ({
    skip,
  }) => {
    if (!realBwrapPath) {
      if (process.env.HELIX_REQUIRE_REAL_BWRAP === "1") {
        throw new Error("HELIX_REQUIRE_REAL_BWRAP=1 but no bubblewrap binary was found");
      }
      skip();
      return;
    }
    const backendPath = realBwrapPath;
    const f = fixture();
    const stagedBackendSource = join(temporaryRoot("helix-isolation-bwrap-"), "bwrap");
    writeFileSync(stagedBackendSource, readFileSync(backendPath));
    chmodSync(stagedBackendSource, 0o755);
    process.env.GITHUB_TOKEN = "must-not-cross";
    const prepared = prepareWorkerIsolationLaunch({
      repoRoot: f.repoRoot,
      scratchBaseDir: f.scratchBase,
      inputPaths: ["input.txt"],
      wrapperLaunch: f.launch,
      admission: admissionFixture(),
      platform: "linux",
      authority: authority(f.repoRoot, stagedBackendSource, f.worker),
      policy: f.policy,
    });
    expect(prepared.isolated).toBe(true);
    if (!prepared.isolated) return;
    writeFileSync(stagedBackendSource, "#!/bin/sh\nexit 97\n");
    writeFileSync(f.worker, "#!/bin/sh\nexit 98\n");
    const result = runWorkerIsolationLaunch(prepared.launch);
    expect(result.isolated).toBe(true);
    if (!result.isolated) return;
    expect(result.status).toBe(0);
    expect(readValidatedWorkerPayload(result.output)).toContain('"summary":"isolated"');
    expect(result.environment_keys).toEqual(["HOME", "LANG", "PATH", "TMPDIR"]);
  });

  it("U-WIB-008: rejects stale or rejected worker admission before spawn", () => {
    const f = fixture();
    const admission = admissionFixture();
    const staleSnapshot = { ...admission.snapshot, revision: admission.snapshot.revision + 1 };
    expect(
      prepareWorkerIsolationLaunch({
        repoRoot: f.repoRoot,
        scratchBaseDir: f.scratchBase,
        inputPaths: ["input.txt"],
        wrapperLaunch: f.launch,
        admission: { ...admission, snapshot: staleSnapshot },
        platform: "linux",
        authority: f.authority,
        policy: f.policy,
      }),
    ).toEqual({ isolated: false, failure_code: "WORKER_ISOLATION_ADMISSION_STALE" });
  });

  it("U-WIB-009: source mutation cannot replace filesystem isolation with prose flags", () => {
    const source = readFileSync("src/runtime/worker-isolation-broker.ts", "utf8");
    for (const token of [
      '"--clearenv"',
      '"--bind"',
      '"--chdir"',
      '"/workspace"',
      '"--unshare-user"',
      '"--unshare-pid"',
      "openSync(source, constants.O_RDONLY | constants.O_NOFOLLOW)",
      "writeFileSync(destination, bytes",
      "worker-isolation-runtime-catalog.json",
      'spawn("/proc/self/fd/3"',
      '"/proc/self/fd/4"',
    ]) {
      expect(source).toContain(token);
    }
    expect(source).not.toContain("danger-full-access");
    expect(source).not.toContain("bypassPermissions");
    expect(source).not.toContain("copyFileSync");
  });

  it("U-WIB-010: enforces deny-all network and post-run writable scope", () => {
    const allowed = fixture();
    const prepared = prepareWorkerIsolationLaunch({
      repoRoot: allowed.repoRoot,
      scratchBaseDir: allowed.scratchBase,
      inputPaths: ["input.txt"],
      wrapperLaunch: allowed.launch,
      admission: admissionFixture(),
      platform: "linux",
      authority: allowed.authority,
      policy: isolationPolicy(allowed.launch, ["out/"]),
    });
    expect(prepared.isolated).toBe(true);
    if (!prepared.isolated) return;
    const success = runWorkerIsolationLaunch(prepared.launch, (_command, args, options) => {
      expect(args).toContain("--unshare-net");
      expect(options.encoding).toBe("buffer");
      expect(Buffer.isBuffer(options.input)).toBe(true);
      expect((options.input as Buffer).toString("utf8")).toBe(prepared.launch.wrapper_launch.stdin);
      mkdirSync(join(prepared.launch.scratch_path, "out"));
      writeFileSync(join(prepared.launch.scratch_path, "out", "result.txt"), "bounded");
      const admission = admissionFixture();
      const descriptorDigest = admission.decision.descriptor_digest;
      if (!descriptorDigest) throw new Error("fixture descriptor digest missing");
      const payload = {
        proposal_only: true,
        schema_version: "helix-worker-proposal.v1",
        summary: "ok",
      };
      return {
        status: 0,
        stdout: Buffer.from(
          canonicalJson({
            descriptor_digest: descriptorDigest,
            output_schema_digest: WORKER_PROPOSAL_OUTPUT_SCHEMA_DIGEST,
            payload,
            payload_digest: sha256Digest(canonicalJson(payload)),
            schema_version: "helix-worker-output-envelope.v1",
          }),
        ),
        stderr: Buffer.alloc(0),
      };
    });
    expect(success).toMatchObject({
      isolated: true,
      changed_paths: ["out/result.txt"],
    });
    expect(success).not.toHaveProperty("stdout");
    expect(success).not.toHaveProperty("stderr");
    expect(success).toHaveProperty("stderr_digest", sha256Digest(Buffer.alloc(0)));

    const denied = fixture();
    const deniedPrepared = prepareWorkerIsolationLaunch({
      repoRoot: denied.repoRoot,
      scratchBaseDir: denied.scratchBase,
      inputPaths: ["input.txt"],
      wrapperLaunch: denied.launch,
      admission: admissionFixture(),
      platform: "linux",
      authority: denied.authority,
      policy: denied.policy,
    });
    expect(deniedPrepared.isolated).toBe(true);
    if (!deniedPrepared.isolated) return;
    expect(
      runWorkerIsolationLaunch(deniedPrepared.launch, () => {
        writeFileSync(join(deniedPrepared.launch.scratch_path, "outside.txt"), "denied");
        return { status: 0, stdout: Buffer.from("must-not-escape"), stderr: Buffer.alloc(0) };
      }),
    ).toEqual({ isolated: false, failure_code: "WORKER_ISOLATION_SCOPE_VIOLATION" });

    const forged = fixture();
    expect(
      prepareWorkerIsolationLaunch({
        repoRoot: forged.repoRoot,
        scratchBaseDir: forged.scratchBase,
        inputPaths: ["input.txt"],
        wrapperLaunch: forged.launch,
        admission: admissionFixture(),
        platform: "linux",
        authority: forged.authority,
        policy: { ...forged.policy } as WorkerIsolationPolicyCapability,
      }),
    ).toEqual({ isolated: false, failure_code: "WORKER_ISOLATION_POLICY_UNRESOLVED" });
  });

  it("U-WIB-011: output contract欠落とschema違反をcapability 0にする", () => {
    const missing = fixture();
    const withoutContract = uncontractedLaunch(missing.worker, missing.admission, missing.repoRoot);
    expect(
      prepareWorkerIsolationLaunch({
        repoRoot: missing.repoRoot,
        scratchBaseDir: missing.scratchBase,
        inputPaths: ["input.txt"],
        wrapperLaunch: withoutContract,
        admission: admissionFixture(),
        platform: "linux",
        authority: missing.authority,
        policy: isolationPolicy(withoutContract),
      }),
    ).toEqual({ isolated: false, failure_code: "WORKER_OUTPUT_SCHEMA_UNRESOLVED" });

    const current = fixture();
    const prepared = prepareWorkerIsolationLaunch({
      repoRoot: current.repoRoot,
      scratchBaseDir: current.scratchBase,
      inputPaths: ["input.txt"],
      wrapperLaunch: current.launch,
      admission: admissionFixture(),
      platform: "linux",
      authority: current.authority,
      policy: current.policy,
    });
    expect(prepared.isolated).toBe(true);
    if (!prepared.isolated) return;
    expect(
      runWorkerIsolationLaunch(prepared.launch, () => ({
        status: 0,
        stdout: Buffer.from("raw text"),
        stderr: Buffer.alloc(0),
      })),
    ).toEqual({ isolated: false, failure_code: "WORKER_OUTPUT_SCHEMA_INVALID" });
  });

  it("U-WIB-012: nonzero processをoutput capability 0にする", () => {
    const current = fixture();
    const prepared = prepareWorkerIsolationLaunch({
      repoRoot: current.repoRoot,
      scratchBaseDir: current.scratchBase,
      inputPaths: ["input.txt"],
      wrapperLaunch: current.launch,
      admission: admissionFixture(),
      platform: "linux",
      authority: current.authority,
      policy: current.policy,
    });
    expect(prepared.isolated).toBe(true);
    if (!prepared.isolated) return;
    expect(
      runWorkerIsolationLaunch(prepared.launch, () => ({
        status: 9,
        stdout: Buffer.alloc(0),
        stderr: Buffer.from("failed"),
      })),
    ).toEqual({ isolated: false, failure_code: "WORKER_OUTPUT_PROCESS_FAILED" });
  });

  it("U-WIB-013: broker実行originだけからsealed independent reviewを発行する", () => {
    const worker = fixture("worker-a", "worker context");
    const reviewer = fixture("reviewer-b", "reviewer context");
    const proposalOutput = executeFixture(worker);
    const reviewerOutput = executeFixture(reviewer);
    expect(resolveWorkerIsolationExecutionOrigin(proposalOutput, worker.admission)).not.toBeNull();
    expect(
      resolveWorkerIsolationExecutionOrigin(reviewerOutput, reviewer.admission),
    ).not.toBeNull();
    const proposalDigest = workerProposalCapabilityDigest(proposalOutput);
    if (!proposalDigest) throw new Error("proposal digest missing");
    const result = admitWorkerIndependentReview({
      input: {
        schema_version: "helix-worker-independent-review-receipt.v1",
        proposal_digest: proposalDigest,
        finding_digest: reviewerOutput.payload_digest,
        verdict: "approve",
      },
      proposalOutput,
      reviewerOutput,
      workerCurrent: worker.admission,
      reviewerCurrent: reviewer.admission,
    });
    expect(result.ok).toBe(true);
    if (result.ok) expect(isWorkerIndependentReview(result.receipt)).toBe(true);
    expect(
      resolveWorkerIsolationExecutionOrigin({ ...proposalOutput }, worker.admission),
    ).toBeNull();
    const newer = canonicalizeWorkerRegistrySnapshot(worker.admission.snapshot.entries, 2);
    if (!newer.ok) throw new Error(newer.failureCodes.join(","));
    const staleCurrent = {
      request: worker.admission.request,
      snapshot: newer.value,
      decision: evaluateWorkerDescriptorAdmission(worker.admission.request, newer.value),
    };
    expect(resolveWorkerIsolationExecutionOrigin(proposalOutput, staleCurrent)).toBeNull();
  });

  it("U-WIB-014: model未束縛の実行をreview originへ昇格しない", () => {
    const withoutModel = fixture("worker-a", "worker context", null);
    const output = executeFixture(withoutModel);
    expect(resolveWorkerIsolationExecutionOrigin(output, withoutModel.admission)).toBeNull();
  });

  it("U-WIB-017: effort省略時もmodel provenanceを保持しsilent skipしない", () => {
    const withoutEffort = fixture(
      "worker-no-effort",
      "worker context",
      "gpt-worker",
      WORKER_PROPOSAL_OUTPUT_SCHEMA_DIGEST,
      null,
    );
    const output = executeFixture(withoutEffort);
    const origin = resolveWorkerIsolationExecutionOrigin(output, withoutEffort.admission);
    expect(origin).not.toBeNull();
    expect(origin?.model).toBe("gpt-worker");
    expect(origin?.effort).toBeNull();
  });
});

describe("WCC-FR-07 worker blind benchmark provenance", () => {
  const benchmarkDefinition = (
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

  it("U-WBB-003: broker実行をblind packetへ束縛してidentityを秘匿する", () => {
    const frozen = freezeWorkerBlindBenchmark(benchmarkDefinition());
    if (!frozen.ok) throw new Error(frozen.failure_code);
    const worker = fixture("candidate-a", "benchmark task", "k3");
    const run = executeFixtureRun(worker, undefined, "high", { benchmark: frozen.execution });
    const packet = buildWorkerBlindPacket(frozen.capability, {
      candidate_id: "candidate-a",
      output: run.output,
      current: worker.admission,
      observation: run.observation,
      execution: frozen.execution,
    });
    if (!packet.ok) throw new Error(packet.failure_code);
    expect(JSON.stringify(packet.packet)).not.toContain("candidate-a");
    expect(JSON.stringify(packet.packet)).not.toContain("k3");
  });

  const evaluatedBenchmark = (
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

  it("U-WBB-004: broker由来の異なる2候補とsealed judge outputだけを順位付けする", () => {
    const receipt = evaluatedBenchmark();
    expect(receipt.ranking.map((row) => row.candidate_id).sort()).toEqual([
      "candidate-a",
      "candidate-b",
    ]);
  });

  const riskRequest = (receipt: WorkerBlindBenchmarkReceiptV1) => ({
    schema_version: "helix-worker-risk-admission-request.v1" as const,
    candidate_ids: ["candidate-a", "candidate-b"],
    benchmark_receipts: [receipt],
    standalone_findings: [
      {
        finding_id: "scope-a",
        candidate_id: "candidate-a",
        failure_class: "scope_violation" as const,
        risk_class: "high" as const,
        evidence_digest: sha256Digest("scope evidence"),
      },
    ],
    use_policies: [
      {
        use_case_id: "implementation",
        required_risk_classes: ["high" as const],
        min_blind_score: 80,
        max_effective_cost: 60_000,
        fixed_effort: null,
        effort_justification_receipt_digest: null,
      },
      {
        use_case_id: "security-review",
        required_risk_classes: ["high" as const],
        min_blind_score: 90,
        max_effective_cost: 60_000,
        fixed_effort: null,
        effort_justification_receipt_digest: null,
      },
    ],
  });

  it("U-WRA-001: critical findingを相殺せず用途別にadmit/retireする", () => {
    const receipt = evaluatedBenchmark();
    const request = riskRequest(receipt);
    const admission = decideWorkerRiskAdmission(request);
    expect(admission.ok).toBe(true);
    if (!admission.ok) return;
    expect(admission.receipt.use_decisions[0]).toMatchObject({
      use_case_id: "implementation",
      selected_candidate_id: "candidate-b",
      candidates: [
        {
          candidate_id: "candidate-a",
          disposition: "retire",
          reason_codes: ["WORKER_RISK_CRITICAL_SCOPE_VIOLATION"],
          standalone_finding_ids: ["scope-a"],
        },
        { candidate_id: "candidate-b", disposition: "admit", reason_codes: [] },
      ],
    });
    expect(admission.receipt.use_decisions[1]?.selected_candidate_id).toBeNull();
    expect(isWorkerRiskAdmissionReceipt(admission.receipt)).toBe(true);
    expect(isWorkerRiskAdmissionReceipt({ ...admission.receipt })).toBe(false);
  });

  it("U-WRA-002: unknown fieldを含むrequestを拒否する", () => {
    const receipt = evaluatedBenchmark();
    const request = riskRequest(receipt);
    expect(decideWorkerRiskAdmission({ ...request, unknown_policy: true })).toEqual({
      ok: false,
      failure_code: "WORKER_RISK_ADMISSION_INPUT_INVALID",
    });
  });

  it("U-WRA-003: copied receiptと同risk重複を拒否する", () => {
    const receipt = evaluatedBenchmark();
    const request = riskRequest(receipt);
    expect(decideWorkerRiskAdmission({ ...request, benchmark_receipts: [{ ...receipt }] })).toEqual(
      {
        ok: false,
        failure_code: "WORKER_RISK_ADMISSION_RECEIPT_UNSEALED",
      },
    );
    expect(
      decideWorkerRiskAdmission({
        ...request,
        benchmark_receipts: [receipt, receipt],
      }),
    ).toEqual({ ok: false, failure_code: "WORKER_RISK_ADMISSION_RISK_DUPLICATE" });
  });

  it("U-WRA-004: measured receiptのないfixed effortを拒否する", () => {
    const receipt = evaluatedBenchmark();
    const request = riskRequest(receipt);
    expect(
      decideWorkerRiskAdmission({
        ...request,
        use_policies: [
          {
            ...request.use_policies[0],
            fixed_effort: "high",
            effort_justification_receipt_digest: null,
          },
        ],
      }),
    ).toEqual({
      ok: false,
      failure_code: "WORKER_RISK_ADMISSION_EFFORT_FIXATION_UNJUSTIFIED",
    });
    const justifiedEffort = decideWorkerRiskAdmission({
      ...request,
      use_policies: [
        {
          ...request.use_policies[0],
          fixed_effort: "medium",
          effort_justification_receipt_digest: receipt.receipt_digest,
        },
      ],
    });
    expect(justifiedEffort.ok).toBe(true);
  });

  it("U-WRA-005: risk別score下限を平均で相殺せずdecision reasonの境界を閉じる", () => {
    const lowReceipt = evaluatedBenchmark("low", 90, "medium");
    const criticalReceipt = evaluatedBenchmark("critical", 20, "high", 5);
    const base = riskRequest(lowReceipt);
    const admission = decideWorkerRiskAdmission({
      ...base,
      benchmark_receipts: [lowReceipt, criticalReceipt],
      standalone_findings: [
        {
          finding_id: "secret-a",
          candidate_id: "candidate-a",
          failure_class: "secret_leak",
          risk_class: "critical",
          evidence_digest: sha256Digest("secret evidence"),
        },
        {
          finding_id: "schema-a",
          candidate_id: "candidate-a",
          failure_class: "schema_violation",
          risk_class: "critical",
          evidence_digest: sha256Digest("schema evidence"),
        },
      ],
      use_policies: [
        {
          ...base.use_policies[0],
          required_risk_classes: ["low", "critical"],
          min_blind_score: 50,
          max_effective_cost: 0,
          fixed_effort: "high",
          effort_justification_receipt_digest: criticalReceipt.receipt_digest,
        },
      ],
    });
    expect(admission.ok).toBe(true);
    if (!admission.ok) return;
    expect(admission.receipt.use_decisions[0]?.candidates).toEqual([
      expect.objectContaining({
        candidate_id: "candidate-a",
        disposition: "retire",
        minimum_blind_score: 20,
        reason_codes: [
          "WORKER_RISK_COST_ABOVE_LIMIT",
          "WORKER_RISK_CRITICAL_SCHEMA_VIOLATION",
          "WORKER_RISK_CRITICAL_SECRET_LEAK",
          "WORKER_RISK_FIXED_EFFORT_MISMATCH",
          "WORKER_RISK_SCORE_BELOW_THRESHOLD",
        ],
      }),
      expect.objectContaining({
        candidate_id: "candidate-b",
        disposition: "retire",
        minimum_blind_score: 20,
        reason_codes: [
          "WORKER_RISK_COST_ABOVE_LIMIT",
          "WORKER_RISK_FIXED_EFFORT_MISMATCH",
          "WORKER_RISK_SCORE_BELOW_THRESHOLD",
        ],
      }),
    ]);

    const missing = decideWorkerRiskAdmission({
      ...base,
      use_policies: [{ ...base.use_policies[0], required_risk_classes: ["low", "critical"] }],
    });
    expect(missing.ok).toBe(true);
    if (missing.ok) {
      expect(missing.receipt.use_decisions[0]?.candidates[0]?.reason_codes).toContain(
        "WORKER_RISK_EVIDENCE_MISSING",
      );
    }
  });

  it("U-WBB-005: raw/copy output、同一provenance、packet不一致をfail-closeする", () => {
    const frozen = freezeWorkerBlindBenchmark(benchmarkDefinition());
    if (!frozen.ok) throw new Error(frozen.failure_code);
    const worker = fixture("candidate-a", "benchmark task", "k3");
    const unboundRun = executeFixtureRun(worker);
    expect(
      buildWorkerBlindPacket(frozen.capability, {
        candidate_id: "candidate-unbound",
        output: unboundRun.output,
        current: worker.admission,
        observation: unboundRun.observation,
        execution: frozen.execution,
      }),
    ).toEqual({ ok: false, failure_code: "WORKER_BLIND_EXECUTION_CONTEXT_MISMATCH" });
    const boundWorker = fixture("candidate-bound", "benchmark task", "k3");
    const run = executeFixtureRun(boundWorker, undefined, "high", {
      benchmark: frozen.execution,
    });
    const output = run.output;
    expect(
      buildWorkerBlindPacket(frozen.capability, {
        candidate_id: "unsafe candidate",
        output,
        current: boundWorker.admission,
        observation: run.observation,
        execution: frozen.execution,
      }),
    ).toEqual({ ok: false, failure_code: "WORKER_BLIND_PACKET_INVALID" });
    expect(
      buildWorkerBlindPacket(frozen.capability, {
        candidate_id: "candidate-a",
        output: { ...output },
        current: boundWorker.admission,
        observation: run.observation,
        execution: frozen.execution,
      }),
    ).toEqual({ ok: false, failure_code: "WORKER_BLIND_EXECUTION_ORIGIN_UNSEALED" });
    expect(
      buildWorkerBlindPacket(frozen.capability, {
        candidate_id: "candidate-a",
        output,
        current: boundWorker.admission,
        observation: { ...run.observation },
        execution: frozen.execution,
      }),
    ).toEqual({ ok: false, failure_code: "WORKER_BLIND_OBSERVATION_UNSEALED" });
    expect(
      buildWorkerBlindPacket(frozen.capability, {
        candidate_id: "candidate-a",
        output,
        current: boundWorker.admission,
        observation: run.observation,
        execution: { ...frozen.execution },
      }),
    ).toEqual({ ok: false, failure_code: "WORKER_BLIND_EXECUTION_CONTEXT_MISMATCH" });
    const crossTaskWorker = fixture("candidate-cross-task", "different task", "qwen3-coder");
    expect(
      prepareWorkerIsolationLaunch({
        repoRoot: crossTaskWorker.repoRoot,
        scratchBaseDir: crossTaskWorker.scratchBase,
        inputPaths: ["input.txt"],
        wrapperLaunch: crossTaskWorker.launch,
        admission: crossTaskWorker.admission,
        platform: "linux",
        authority: crossTaskWorker.authority,
        policy: crossTaskWorker.policy,
        riskClass: "high",
        benchmark: frozen.execution,
      }),
    ).toEqual({ isolated: false, failure_code: "WORKER_ISOLATION_BOUNDARY_INVALID" });
    const crossRiskWorker = fixture("candidate-cross-risk", "benchmark task", "qwen3-coder");
    expect(
      prepareWorkerIsolationLaunch({
        repoRoot: crossRiskWorker.repoRoot,
        scratchBaseDir: crossRiskWorker.scratchBase,
        inputPaths: ["input.txt"],
        wrapperLaunch: crossRiskWorker.launch,
        admission: crossRiskWorker.admission,
        platform: "linux",
        authority: crossRiskWorker.authority,
        policy: crossRiskWorker.policy,
        riskClass: "critical",
        benchmark: frozen.execution,
      }),
    ).toEqual({ isolated: false, failure_code: "WORKER_ISOLATION_BOUNDARY_INVALID" });
    const first = buildWorkerBlindPacket(frozen.capability, {
      candidate_id: "candidate-a",
      output,
      current: boundWorker.admission,
      observation: run.observation,
      execution: frozen.execution,
    });
    const second = buildWorkerBlindPacket(frozen.capability, {
      candidate_id: "candidate-b",
      output,
      current: boundWorker.admission,
      observation: run.observation,
      execution: frozen.execution,
    });
    if (!first.ok || !second.ok) throw new Error("packet fixture failed");
    const firstJudgeContext = buildWorkerBlindJudgeContext(first.capability);
    if (!firstJudgeContext.ok) throw new Error(firstJudgeContext.failure_code);
    const judge = fixture(
      "judge",
      firstJudgeContext.context.task,
      "reviewer",
      WORKER_BLIND_EVALUATION_OUTPUT_SCHEMA_DIGEST,
    );
    const judgeOutput = executeFixtureRun(
      judge,
      {
        packet_digest: first.packet.packet_digest,
        schema_version: "helix-worker-blind-evaluation.v1",
        scores: [
          { dimension_id: "correctness", score: 90 },
          { dimension_id: "scope_discipline", score: 80 },
        ],
      },
      "high",
      { blindJudge: firstJudgeContext.context.capability },
    ).output;
    expect(
      evaluateWorkerBlindBenchmark(frozen.capability, [
        {
          packet: first.capability,
          judge_output: judgeOutput,
          judge_current: judge.admission,
          judge_context: { ...firstJudgeContext.context.capability },
        },
        {
          packet: second.capability,
          judge_output: judgeOutput,
          judge_current: judge.admission,
          judge_context: firstJudgeContext.context.capability,
        },
      ]),
    ).toEqual({ ok: false, failure_code: "WORKER_BLIND_EVALUATION_UNSEALED" });
    expect(
      evaluateWorkerBlindBenchmark(frozen.capability, [
        {
          packet: first.capability,
          judge_output: judgeOutput,
          judge_current: judge.admission,
          judge_context: firstJudgeContext.context.capability,
        },
        {
          packet: second.capability,
          judge_output: judgeOutput,
          judge_current: judge.admission,
          judge_context: firstJudgeContext.context.capability,
        },
      ]),
    ).toEqual({ ok: false, failure_code: "WORKER_BLIND_PROVENANCE_DUPLICATE" });

    const otherWorker = fixture("candidate-c", "benchmark task", "qwen3-coder");
    const otherRun = executeFixtureRun(otherWorker, undefined, "high", {
      benchmark: frozen.execution,
    });
    const otherOutput = otherRun.output;
    const other = buildWorkerBlindPacket(frozen.capability, {
      candidate_id: "candidate-c",
      output: otherOutput,
      current: otherWorker.admission,
      observation: otherRun.observation,
      execution: frozen.execution,
    });
    if (!other.ok) throw new Error(other.failure_code);
    expect(
      evaluateWorkerBlindBenchmark(frozen.capability, [
        {
          packet: { ...first.capability } as never,
          judge_output: judgeOutput,
          judge_current: judge.admission,
          judge_context: firstJudgeContext.context.capability,
        },
        {
          packet: other.capability,
          judge_output: judgeOutput,
          judge_current: judge.admission,
          judge_context: firstJudgeContext.context.capability,
        },
      ]),
    ).toEqual({ ok: false, failure_code: "WORKER_BLIND_PACKET_UNSEALED" });
    expect(
      evaluateWorkerBlindBenchmark(frozen.capability, [
        {
          packet: first.capability,
          judge_output: judgeOutput,
          judge_current: judge.admission,
          judge_context: firstJudgeContext.context.capability,
        },
        {
          packet: other.capability,
          judge_output: judgeOutput,
          judge_current: judge.admission,
          judge_context: firstJudgeContext.context.capability,
        },
      ]),
    ).toEqual({ ok: false, failure_code: "WORKER_BLIND_EVALUATION_UNSEALED" });

    const mismatchedJudge = fixture(
      "judge-mismatch",
      firstJudgeContext.context.task,
      "reviewer",
      WORKER_BLIND_EVALUATION_OUTPUT_SCHEMA_DIGEST,
    );
    const mismatchedJudgeOutput = executeFixtureRun(
      mismatchedJudge,
      {
        packet_digest: other.packet.packet_digest,
        schema_version: "helix-worker-blind-evaluation.v1",
        scores: [
          { dimension_id: "correctness", score: 90 },
          { dimension_id: "scope_discipline", score: 80 },
        ],
      },
      "high",
      { blindJudge: firstJudgeContext.context.capability },
    ).output;
    expect(
      evaluateWorkerBlindBenchmark(frozen.capability, [
        {
          packet: first.capability,
          judge_output: mismatchedJudgeOutput,
          judge_current: mismatchedJudge.admission,
          judge_context: firstJudgeContext.context.capability,
        },
        {
          packet: other.capability,
          judge_output: judgeOutput,
          judge_current: judge.admission,
          judge_context: firstJudgeContext.context.capability,
        },
      ]),
    ).toEqual({ ok: false, failure_code: "WORKER_BLIND_EVALUATION_UNSEALED" });

    const otherJudgeContext = buildWorkerBlindJudgeContext(other.capability);
    if (!otherJudgeContext.ok) throw new Error(otherJudgeContext.failure_code);
    const otherJudge = fixture(
      "judge-other",
      otherJudgeContext.context.task,
      "reviewer",
      WORKER_BLIND_EVALUATION_OUTPUT_SCHEMA_DIGEST,
    );
    const badScoreOutput = executeFixtureRun(
      otherJudge,
      {
        packet_digest: other.packet.packet_digest,
        schema_version: "helix-worker-blind-evaluation.v1",
        scores: [
          { dimension_id: "correctness", score: 101 },
          { dimension_id: "scope_discipline", score: 80 },
        ],
      },
      "high",
      { blindJudge: otherJudgeContext.context.capability },
    ).output;
    expect(
      evaluateWorkerBlindBenchmark(frozen.capability, [
        {
          packet: first.capability,
          judge_output: judgeOutput,
          judge_current: judge.admission,
          judge_context: firstJudgeContext.context.capability,
        },
        {
          packet: other.capability,
          judge_output: badScoreOutput,
          judge_current: otherJudge.admission,
          judge_context: otherJudgeContext.context.capability,
        },
      ]),
    ).toEqual({ ok: false, failure_code: "WORKER_BLIND_SCORE_INVALID" });

    expect(
      evaluateWorkerBlindBenchmark(frozen.capability, [
        {
          packet: first.capability,
          judge_output: judgeOutput,
          judge_current: judge.admission,
          judge_context: firstJudgeContext.context.capability,
        },
      ]),
    ).toEqual({ ok: false, failure_code: "WORKER_BLIND_PROVENANCE_DUPLICATE" });
  });
});

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
  buildWrapperAdapterPlan,
  type WrapperLaunchExecution,
} from "../src/runtime/adapter";
import { canonicalJson, sha256Digest } from "../src/runtime/digest";
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
  WORKER_PROPOSAL_OUTPUT_SCHEMA_DIGEST,
} from "../src/runtime/worker-output-admission";
import {
  admitWorkerIndependentReview,
  isWorkerIndependentReview,
  workerProposalCapabilityDigest,
} from "../src/runtime/worker-review-receipt";

// PLAN-L7-499-worker-isolation-broker
// PLAN-L7-500-worker-isolation-policy
// PLAN-L7-501-worker-output-admission
// PLAN-L7-502-worker-independent-review

const roots: string[] = [];
const originalCodexBin = process.env.HELIX_CODEX_BIN;
const originalGithubToken = process.env.GITHUB_TOKEN;
const realBwrapPath = [process.env.HELIX_BWRAP_BIN, "/usr/bin/bwrap", "/usr/local/bin/bwrap"].find(
  (candidate): candidate is string => Boolean(candidate && existsSync(candidate)),
);

function admissionFixture(agentId = "codex-worker"): {
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
    output_schema_digest: WORKER_PROPOSAL_OUTPUT_SCHEMA_DIGEST,
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
): WrapperLaunchExecution {
  process.env.HELIX_CODEX_BIN = command;
  const descriptorDigest = admission.decision.descriptor_digest;
  if (!descriptorDigest) throw new Error("fixture descriptor digest missing");
  const plan = buildWrapperAdapterPlan(
    {
      provider: "codex",
      role: "se",
      task: [
        task,
        formatWorkerOutputContract(WORKER_PROPOSAL_OUTPUT_SCHEMA_DIGEST, descriptorDigest),
      ].join("\n\n"),
      execute: true,
      ...(model ? { model } : {}),
    },
    "codex-only",
    "helix_cli_adapter",
  );
  const launch = admitWrapperLaunch(plan);
  if (!("capability" in launch))
    throw new Error(`fixture admission failed: ${launch.failure_code}`);
  return launch;
}

function uncontractedLaunch(command: string): WrapperLaunchExecution {
  process.env.HELIX_CODEX_BIN = command;
  const plan = buildWrapperAdapterPlan(
    { provider: "codex", role: "se", task: "fixture", execute: true },
    "codex-only",
    "helix_cli_adapter",
  );
  const launch = admitWrapperLaunch(plan);
  if (!("capability" in launch))
    throw new Error(`fixture admission failed: ${launch.failure_code}`);
  return launch;
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
  mkdirSync(join(repoRoot, ".git"));
  mkdirSync(join(repoRoot, ".helix"));
  writeFileSync(join(repoRoot, ".helix", "harness.db"), "forbidden");
  writeFileSync(join(repoRoot, "input.txt"), "allowed\n");
  const worker = join(temporaryRoot("helix-isolation-worker-"), "worker.sh");
  const admission = admissionFixture(agentId);
  const descriptorDigest = admission.decision.descriptor_digest;
  if (!descriptorDigest) throw new Error("fixture descriptor digest missing");
  const payload = {
    proposal_only: true,
    schema_version: "helix-worker-proposal.v1",
    summary: "isolated",
  };
  const workerOutput = canonicalJson({
    descriptor_digest: descriptorDigest,
    output_schema_digest: WORKER_PROPOSAL_OUTPUT_SCHEMA_DIGEST,
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
  const launch = admittedLaunch(worker, admission, task, model);
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

function executeFixture(value: ReturnType<typeof fixture>) {
  const prepared = prepareWorkerIsolationLaunch({
    repoRoot: value.repoRoot,
    scratchBaseDir: value.scratchBase,
    inputPaths: ["input.txt"],
    wrapperLaunch: value.launch,
    admission: value.admission,
    platform: "linux",
    authority: value.authority,
    policy: value.policy,
  });
  if (!prepared.isolated) throw new Error(prepared.failure_code);
  const descriptorDigest = value.admission.decision.descriptor_digest;
  if (!descriptorDigest) throw new Error("fixture descriptor digest missing");
  const payload = {
    proposal_only: true,
    schema_version: "helix-worker-proposal.v1",
    summary: "executed",
  };
  const result = runWorkerIsolationLaunch(prepared.launch, () => ({
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
  }));
  if (!result.isolated) throw new Error(result.failure_code);
  return result.output;
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
    const withoutContract = uncontractedLaunch(missing.worker);
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
        finding_digest: sha256Digest("findings"),
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
});

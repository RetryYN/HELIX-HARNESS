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
  runWorkerIsolationLaunch,
  type WorkerIsolationAuthorityCapability,
  type WorkerIsolationLaunch,
} from "../src/runtime/worker-isolation-broker";

// PLAN-L7-499-worker-isolation-broker

const roots: string[] = [];
const originalCodexBin = process.env.HELIX_CODEX_BIN;
const originalGithubToken = process.env.GITHUB_TOKEN;
const realBwrapPath = [process.env.HELIX_BWRAP_BIN, "/usr/bin/bwrap", "/usr/local/bin/bwrap"].find(
  (candidate): candidate is string => Boolean(candidate && existsSync(candidate)),
);

function admissionFixture(): {
  request: WorkerDescriptorRequestV1;
  snapshot: WorkerRegistrySnapshotV1;
  decision: WorkerDescriptorAdmissionDecisionV1;
} {
  const descriptorPayload = {
    schema_version: "helix-worker-descriptor.v1" as const,
    agent_id: "codex-worker",
    contract_version: "1.0.0",
    provider: "codex",
    capability_class: "implementation" as const,
    input_schema_digest: sha256Digest("input"),
    output_schema_digest: sha256Digest("output"),
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

function admittedLaunch(command: string): WrapperLaunchExecution {
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

function fixture(): {
  repoRoot: string;
  scratchBase: string;
  worker: string;
  launch: WrapperLaunchExecution;
  authority: WorkerIsolationAuthorityCapability;
} {
  const repoRoot = temporaryRoot("helix-isolation-repo-");
  const scratchBase = temporaryRoot("helix-isolation-scratch-");
  mkdirSync(join(repoRoot, ".git"));
  mkdirSync(join(repoRoot, ".helix"));
  writeFileSync(join(repoRoot, ".helix", "harness.db"), "forbidden");
  writeFileSync(join(repoRoot, "input.txt"), "allowed\n");
  const worker = join(temporaryRoot("helix-isolation-worker-"), "worker.sh");
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
      "printf isolated",
    ].join("\n"),
  );
  chmodSync(worker, 0o755);
  const launch = admittedLaunch(worker);
  return {
    repoRoot,
    scratchBase,
    worker,
    launch,
    authority: authority(repoRoot, "/bin/true", worker),
  };
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
    });
    expect(prepared.isolated).toBe(true);
    if (!prepared.isolated) return;
    const spawn = vi.fn();
    expect(
      runWorkerIsolationLaunch({ ...prepared.launch } as WorkerIsolationLaunch, spawn),
    ).toEqual({ isolated: false, failure_code: "WORKER_ISOLATION_LAUNCH_UNSEALED" });
    expect(spawn).not.toHaveBeenCalled();
  });

  it.skipIf(!realBwrapPath)(
    "U-WIB-007: executes a real process with repo, state, DB and credentials unreachable",
    () => {
      const backendPath = realBwrapPath as string;
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
      });
      expect(prepared.isolated).toBe(true);
      if (!prepared.isolated) return;
      writeFileSync(stagedBackendSource, "#!/bin/sh\nexit 97\n");
      writeFileSync(f.worker, "#!/bin/sh\nexit 98\n");
      const result = runWorkerIsolationLaunch(prepared.launch);
      expect(result.isolated).toBe(true);
      if (!result.isolated) return;
      expect(result.status).toBe(0);
      expect(result.stdout).toBe("isolated");
      expect(result.environment_keys).toEqual(["HOME", "LANG", "PATH", "TMPDIR"]);
    },
  );

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
});

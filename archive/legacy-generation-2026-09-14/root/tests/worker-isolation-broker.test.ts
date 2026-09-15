import { execFileSync } from "node:child_process";
import {
  chmodSync,
  closeSync,
  existsSync,
  fstatSync,
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
  sealWorkerBlindJudgeContext,
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
  createWorkerLifecycleReceipt,
  isWorkerLifecycleReceipt,
  serializeWorkerLifecycleReceipt,
  verifyWorkerLifecycleReceipt,
} from "../src/runtime/worker-lifecycle-receipt";
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
  admissionFixture,
  admittedLaunch,
  authority,
  benchmarkDefinition,
  cleanupWorkerIsolationFixtures,
  evaluatedBenchmark,
  executeFixture,
  executeFixtureRun,
  fixture,
  isolationPolicy,
  realBwrapPath,
  temporaryRoot,
  uncontractedLaunch,
} from "./helpers/worker-isolation-fixture";

// PLAN-L7-499-worker-isolation-broker
// PLAN-L7-500-worker-isolation-policy
// PLAN-L7-501-worker-output-admission
// PLAN-L7-502-worker-independent-review
// PLAN-L7-504-worker-blind-benchmark
// PLAN-L7-505-worker-risk-admission
// PLAN-L7-506-worker-lifecycle-receipt
// PLAN-RECOVERY-1573-isolation-launch-cleanup

const originalCodexBin = process.env.HELIX_CODEX_BIN;
const originalGithubToken = process.env.GITHUB_TOKEN;

afterEach(() => {
  if (originalCodexBin === undefined) delete process.env.HELIX_CODEX_BIN;
  else process.env.HELIX_CODEX_BIN = originalCodexBin;
  if (originalGithubToken === undefined) delete process.env.GITHUB_TOKEN;
  else process.env.GITHUB_TOKEN = originalGithubToken;
  vi.restoreAllMocks();
  cleanupWorkerIsolationFixtures();
});

describe("WCC-FR-05 durable worker lifecycle receipt", () => {
  function lifecycleFixture(verdict: "approve" | "reject" = "approve", summary = "executed") {
    const proposalFixture = fixture("proposal-worker", "proposal-task", "gpt-proposal");
    const reviewerFixture = fixture("review-worker", "review-task", "gpt-reviewer");
    const proposal = executeFixtureRun(proposalFixture, {
      proposal_only: true,
      schema_version: "helix-worker-proposal.v1",
      summary,
    });
    const reviewer = executeFixtureRun(reviewerFixture);
    const proposalDigest = workerProposalCapabilityDigest(proposal.output);
    if (!proposalDigest) throw new Error("proposal fixture must be sealed");
    const reviewed = admitWorkerIndependentReview({
      input: {
        schema_version: "helix-worker-independent-review-receipt.v1",
        proposal_digest: proposalDigest,
        finding_digest: reviewer.output.payload_digest,
        verdict,
      },
      proposalOutput: proposal.output,
      reviewerOutput: reviewer.output,
      workerCurrent: proposalFixture.admission,
      reviewerCurrent: reviewerFixture.admission,
    });
    if (!reviewed.ok) throw new Error(reviewed.failure_code);
    const head = execFileSync("git", ["rev-parse", "HEAD"], {
      cwd: proposalFixture.repoRoot,
      encoding: "utf8",
    }).trim();
    return { proposal, review: reviewed.receipt, head };
  }

  it("U-WLIFE-001: requestedからterminalまでexact hash-chainを再生可能にする", () => {
    const fixtureValue = lifecycleFixture();
    const result = createWorkerLifecycleReceipt({
      run_id: "run-001",
      parent_run_id: "parent-001",
      child_run_ids: ["child-001"],
      head_sha: fixtureValue.head,
      output: fixtureValue.proposal.output,
      run_receipt: fixtureValue.proposal.receipt,
      review: fixtureValue.review,
      terminal_state: "accepted",
      terminal_reason: null,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.receipt.events.map((event) => event.state)).toEqual([
      "requested",
      "admitted",
      "sandboxed",
      "running",
      "proposal_received",
      "revalidated",
      "accepted",
    ]);
    expect(
      result.receipt.events.every(
        (event, index, events) =>
          event.sequence === index + 1 &&
          event.previous_event_digest === (events[index - 1]?.event_digest ?? null),
      ),
    ).toBe(true);
    expect(isWorkerLifecycleReceipt(result.receipt)).toBe(true);
    const serialized = serializeWorkerLifecycleReceipt(result.receipt);
    expect(serialized).toContain(result.receipt.receipt_digest);
    expect(verifyWorkerLifecycleReceipt(serialized ?? "")).toBe(true);
    expect(
      verifyWorkerLifecycleReceipt((serialized ?? "").replace('"sequence":2', '"sequence":9')),
    ).toBe(false);
    const forged = JSON.parse(serialized ?? "{}") as Record<string, unknown>;
    forged.receipt_digest = sha256Digest("forged lifecycle receipt");
    expect(verifyWorkerLifecycleReceipt(canonicalJson(forged))).toBe(false);
    const detachedEvidence = JSON.parse(serialized ?? "{}") as Record<string, unknown>;
    detachedEvidence.sandbox_digest = sha256Digest("foreign sandbox");
    const { receipt_digest: _ignored, ...detachedPayload } = detachedEvidence;
    detachedEvidence.receipt_digest = sha256Digest(canonicalJson(detachedPayload));
    expect(verifyWorkerLifecycleReceipt(canonicalJson(detachedEvidence))).toBe(false);
    expect(isWorkerLifecycleReceipt({ ...result.receipt })).toBe(false);
  });

  it("U-WLIFE-002: copied run receiptと別proposal reviewを拒否する", () => {
    const fixtureValue = lifecycleFixture();
    const base = {
      run_id: "run-002",
      parent_run_id: null,
      child_run_ids: [],
      head_sha: fixtureValue.head,
      output: fixtureValue.proposal.output,
      review: fixtureValue.review,
      terminal_state: "accepted" as const,
      terminal_reason: null,
    };
    expect(
      createWorkerLifecycleReceipt({
        ...base,
        run_receipt: { ...fixtureValue.proposal.receipt },
      }),
    ).toEqual({ ok: false, failure_code: "WORKER_LIFECYCLE_RUN_RECEIPT_UNSEALED" });

    const foreign = lifecycleFixture("approve", "foreign proposal");
    expect(
      createWorkerLifecycleReceipt({
        ...base,
        run_receipt: fixtureValue.proposal.receipt,
        review: { ...fixtureValue.review },
      }),
    ).toEqual({ ok: false, failure_code: "WORKER_LIFECYCLE_REVIEW_UNSEALED" });
    expect(
      createWorkerLifecycleReceipt({
        ...base,
        run_receipt: fixtureValue.proposal.receipt,
        review: foreign.review,
      }),
    ).toEqual({ ok: false, failure_code: "WORKER_LIFECYCLE_PROPOSAL_MISMATCH" });
  });

  it("U-WLIFE-003: review verdictとterminal dispositionの矛盾を拒否する", () => {
    const fixtureValue = lifecycleFixture("reject");
    expect(
      createWorkerLifecycleReceipt({
        run_id: "run-003",
        parent_run_id: null,
        child_run_ids: [],
        head_sha: fixtureValue.head,
        output: fixtureValue.proposal.output,
        run_receipt: fixtureValue.proposal.receipt,
        review: fixtureValue.review,
        terminal_state: "accepted",
        terminal_reason: null,
      }),
    ).toEqual({ ok: false, failure_code: "WORKER_LIFECYCLE_TERMINAL_INVALID" });
    expect(
      createWorkerLifecycleReceipt({
        run_id: "run-003",
        parent_run_id: null,
        child_run_ids: ["child-b", "child-a"],
        head_sha: fixtureValue.head,
        output: fixtureValue.proposal.output,
        run_receipt: fixtureValue.proposal.receipt,
        review: fixtureValue.review,
        terminal_state: "rejected",
        terminal_reason: "review rejected",
      }),
    ).toEqual({ ok: false, failure_code: "WORKER_LIFECYCLE_INPUT_INVALID" });
  });
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

  it("U-WIB-CLEANUP-001: spawn例外でもFDを回収して同launchの再利用を拒否する", () => {
    const f = fixture();
    const prepared = prepareWorkerIsolationLaunch({
      repoRoot: f.repoRoot,
      scratchBaseDir: f.scratchBase,
      inputPaths: ["input.txt"],
      wrapperLaunch: f.launch,
      admission: f.admission,
      platform: "linux",
      authority: f.authority,
      policy: f.policy,
    });
    expect(prepared.isolated).toBe(true);
    if (!prepared.isolated) return;
    let fds: number[] = [];
    try {
      expect(() =>
        runWorkerIsolationLaunch(prepared.launch, (_command, _args, options) => {
          if (!Array.isArray(options.stdio)) throw new Error("missing descriptor stdio");
          fds = [Number(options.stdio[3]), Number(options.stdio[4])];
          throw new Error("injected-spawn-failure");
        }),
      ).toThrow("injected-spawn-failure");
      for (const fd of fds) expect(() => fstatSync(fd)).toThrow();
      const retry = vi.fn();
      expect(runWorkerIsolationLaunch(prepared.launch, retry)).toEqual({
        isolated: false,
        failure_code: "WORKER_ISOLATION_LAUNCH_UNSEALED",
      });
      expect(retry).not.toHaveBeenCalled();
    } finally {
      for (const fd of fds) {
        try {
          closeSync(fd);
        } catch {}
      }
    }
  });

  it("U-WIB-CLEANUP-002: 非zero/null終了でも再入・再利用を拒否しFDを回収する", () => {
    for (const status of [1, null]) {
      const f = fixture();
      const prepared = prepareWorkerIsolationLaunch({
        repoRoot: f.repoRoot,
        scratchBaseDir: f.scratchBase,
        inputPaths: ["input.txt"],
        wrapperLaunch: f.launch,
        admission: f.admission,
        platform: "linux",
        authority: f.authority,
        policy: f.policy,
      });
      expect(prepared.isolated).toBe(true);
      if (!prepared.isolated) return;
      const nestedSpawn = vi.fn();
      const retrySpawn = vi.fn();
      let fds: number[] = [];
      const result = runWorkerIsolationLaunch(prepared.launch, (_command, _args, options) => {
        if (!Array.isArray(options.stdio)) throw new Error("missing descriptor stdio");
        fds = [Number(options.stdio[3]), Number(options.stdio[4])];
        expect(runWorkerIsolationLaunch(prepared.launch, nestedSpawn)).toEqual({
          isolated: false,
          failure_code: "WORKER_ISOLATION_LAUNCH_UNSEALED",
        });
        return { status };
      });
      expect(result).toEqual({ isolated: false, failure_code: "WORKER_OUTPUT_PROCESS_FAILED" });
      expect(fds).toHaveLength(2);
      for (const fd of fds) expect(() => fstatSync(fd)).toThrow();
      expect(runWorkerIsolationLaunch(prepared.launch, retrySpawn)).toEqual({
        isolated: false,
        failure_code: "WORKER_ISOLATION_LAUNCH_UNSEALED",
      });
      expect(nestedSpawn).not.toHaveBeenCalled();
      expect(retrySpawn).not.toHaveBeenCalled();
    }
  });

  it("U-WIB-CLEANUP-003: 成功後の同launchは拒否し新しいlaunchは実行できる", () => {
    const f = fixture();
    const payload = {
      proposal_only: true,
      schema_version: "helix-worker-proposal.v1",
      summary: "cleanup success",
    };
    for (let execution = 0; execution < 2; execution++) {
      const prepared = prepareWorkerIsolationLaunch({
        repoRoot: f.repoRoot,
        scratchBaseDir: f.scratchBase,
        inputPaths: ["input.txt"],
        wrapperLaunch: f.launch,
        admission: f.admission,
        platform: "linux",
        authority: f.authority,
        policy: f.policy,
      });
      expect(prepared.isolated).toBe(true);
      if (!prepared.isolated) return;
      let fds: number[] = [];
      const result = runWorkerIsolationLaunch(prepared.launch, (_command, _args, options) => {
        if (!Array.isArray(options.stdio)) throw new Error("missing descriptor stdio");
        fds = [Number(options.stdio[3]), Number(options.stdio[4])];
        return {
          status: 0,
          stdout: Buffer.from(
            canonicalJson({
              schema_version: "helix-worker-output-envelope.v1",
              descriptor_digest: f.admission.decision.descriptor_digest,
              output_schema_digest:
                f.admission.snapshot.entries[0]?.descriptor.output_schema_digest,
              payload,
              payload_digest: sha256Digest(canonicalJson(payload)),
            }),
          ),
        };
      });
      expect(result.isolated).toBe(true);
      expect(fds).toHaveLength(2);
      for (const fd of fds) expect(() => fstatSync(fd)).toThrow();
      const retry = vi.fn();
      expect(runWorkerIsolationLaunch(prepared.launch, retry)).toEqual({
        isolated: false,
        failure_code: "WORKER_ISOLATION_LAUNCH_UNSEALED",
      });
      expect(retry).not.toHaveBeenCalled();
    }
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
    if (!result.isolated) {
      throw new Error(`real bubblewrap isolation failed: ${result.failure_code}`);
    }
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

  it("U-WIB-018: launch recordのcontext_digestはsealed worker contextのpacket_digestと一致し空digestへfallbackしない", () => {
    const worker = fixture("worker-context-digest", "worker context");
    const output = executeFixture(worker);
    const origin = resolveWorkerIsolationExecutionOrigin(output, worker.admission);
    expect(origin).not.toBeNull();
    const packetDigest = worker.launch.worker_context?.capability.packet_digest;
    if (!packetDigest) throw new Error("fixture worker context packet digest missing");
    expect(origin?.context_digest).toBe(packetDigest);
    expect(origin?.context_digest).not.toBe(sha256Digest(""));
  });
});

describe("WCC-FR-07 worker blind benchmark provenance", () => {
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

    // issue #378: judge context capability chain の起点は packet capability 一本に固定する。
    // packet 内容を知る側が packet 形状の plain object を渡しても、broker 側 resolver が
    // seal 台帳を引けないため judge context は封印されない。
    expect(sealWorkerBlindJudgeContext({ ...packet.packet })).toBeNull();
    expect(sealWorkerBlindJudgeContext({ ...packet.capability })).toBeNull();
    expect(sealWorkerBlindJudgeContext(packet.capability)).not.toBeNull();
    const viaOwner = buildWorkerBlindJudgeContext(packet.capability);
    expect(viaOwner.ok).toBe(true);
  });

  it("U-WBB-004: broker由来の異なる2候補とsealed judge outputだけを順位付けする", () => {
    const receipt = evaluatedBenchmark();
    expect(receipt.ranking.map((row) => row.candidate_id).sort()).toEqual([
      "candidate-a",
      "candidate-b",
    ]);
    // selected_candidate_id は常に rank 1 の candidate_id と一致し、"選定なし" を意味する
    // 空文字列へ落ちる経路を持たない（issue #379 の dead path fallback 除去の固定）。
    expect(receipt.ranking.length).toBeGreaterThanOrEqual(2);
    expect(receipt.selected_candidate_id).toBe(receipt.ranking[0]?.candidate_id);
    expect(receipt.selected_candidate_id).not.toBe("");
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

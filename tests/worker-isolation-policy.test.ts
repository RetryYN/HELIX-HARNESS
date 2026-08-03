import { mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  admitWrapperLaunch,
  buildWrapperAdapterPlan,
  type WrapperLaunchExecution,
} from "../src/runtime/adapter";
import { sha256Digest } from "../src/runtime/digest";
import {
  attestWorkerIsolationPolicy,
  auditWorkerIsolationScope,
  isWorkerIsolationPolicyCapability,
} from "../src/runtime/worker-isolation-policy";

// PLAN-L7-500-worker-isolation-policy

const roots: string[] = [];
const originalCodexBin = process.env.HELIX_CODEX_BIN;

function temporaryRoot(prefix: string): string {
  const root = mkdtempSync(join(tmpdir(), prefix));
  roots.push(root);
  return root;
}

function admittedLaunch(task = "review the bounded fixture"): WrapperLaunchExecution {
  process.env.HELIX_CODEX_BIN = "/bin/true";
  const plan = buildWrapperAdapterPlan(
    { provider: "codex", role: "se", task, execute: true },
    "codex-only",
    "helix_cli_adapter",
  );
  const launch = admitWrapperLaunch(plan);
  if (!("capability" in launch)) throw new Error(launch.failure_code);
  return launch;
}

afterEach(() => {
  if (originalCodexBin === undefined) delete process.env.HELIX_CODEX_BIN;
  else process.env.HELIX_CODEX_BIN = originalCodexBin;
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

describe("WCC-FR-04 worker isolation policy", () => {
  it("U-WIP-001: seals a non-secret deny-all policy to the exact wrapper origin", () => {
    const launch = admittedLaunch();
    const result = attestWorkerIsolationPolicy({
      wrapperLaunch: launch,
      task_sensitivity: "non_secret",
      writable_paths: ["out/", "result.json", "out/"],
      allowed_egress_hosts: [],
    });
    expect(isWorkerIsolationPolicyCapability(result)).toBe(true);
    if (!isWorkerIsolationPolicyCapability(result)) return;
    expect(result.wrapper_origin_digest).toBe(launch.capability.origin_digest);
    expect(result.writable_paths).toEqual(["out/", "result.json"]);
    expect(result.egress).toEqual({ mode: "deny_all" });
  });

  it("U-WIP-002: rejects secret, unknown and token-bearing tasks before launch", () => {
    for (const [launch, task_sensitivity] of [
      [admittedLaunch(), "secret"],
      [admittedLaunch(), "unknown"],
      [admittedLaunch(`use ghp_${"a".repeat(24)}`), "non_secret"],
    ] as const) {
      expect(
        attestWorkerIsolationPolicy({
          wrapperLaunch: launch,
          task_sensitivity,
          writable_paths: [],
          allowed_egress_hosts: [],
        }),
      ).toEqual({ isolated: false, failure_code: "WORKER_ISOLATION_SECRET_TASK_DENIED" });
    }
  });

  it("U-WIP-003: rejects copied wrappers and non-empty egress allowlists", () => {
    const launch = admittedLaunch();
    expect(
      attestWorkerIsolationPolicy({
        wrapperLaunch: { ...launch } as WrapperLaunchExecution,
        task_sensitivity: "non_secret",
        writable_paths: [],
        allowed_egress_hosts: [],
      }),
    ).toEqual({ isolated: false, failure_code: "WORKER_ISOLATION_POLICY_UNRESOLVED" });
    expect(
      attestWorkerIsolationPolicy({
        wrapperLaunch: launch,
        task_sensitivity: "non_secret",
        writable_paths: [],
        allowed_egress_hosts: ["example.com"],
      }),
    ).toEqual({ isolated: false, failure_code: "WORKER_ISOLATION_EGRESS_UNSUPPORTED" });
  });

  it("U-WIP-004: rejects ambiguous or authority-bearing writable paths", () => {
    const launch = admittedLaunch();
    for (const path of ["", ".", "../out", "/tmp/out", ".git/", ".helix/x", "harness.db"]) {
      expect(
        attestWorkerIsolationPolicy({
          wrapperLaunch: launch,
          task_sensitivity: "non_secret",
          writable_paths: [path],
          allowed_egress_hosts: [],
        }),
      ).toEqual({ isolated: false, failure_code: "WORKER_ISOLATION_SCOPE_INVALID" });
    }
  });

  it("U-WIP-005: accepts only add, modify and delete changes inside exact scope", () => {
    const workspace = temporaryRoot("helix-policy-workspace-");
    mkdirSync(join(workspace, "out"));
    writeFileSync(join(workspace, "input.txt"), "before");
    writeFileSync(join(workspace, "delete.txt"), "before");
    const baseline = [
      { path: "delete.txt", size: 6, digest: sha256Digest("before") },
      { path: "input.txt", size: 6, digest: sha256Digest("before") },
    ];
    writeFileSync(join(workspace, "input.txt"), "after");
    rmSync(join(workspace, "delete.txt"));
    writeFileSync(join(workspace, "out", "result.txt"), "created");
    expect(
      auditWorkerIsolationScope(workspace, baseline, ["input.txt", "delete.txt", "out/"]),
    ).toEqual({ ok: true, changed_paths: ["delete.txt", "input.txt", "out/result.txt"] });
  });

  it("U-WIP-006: fails closed on an out-of-scope diff without exposing content", () => {
    const workspace = temporaryRoot("helix-policy-workspace-");
    writeFileSync(join(workspace, "input.txt"), "before");
    const baseline = [{ path: "input.txt", size: 6, digest: sha256Digest("before") }];
    writeFileSync(join(workspace, "leaked.txt"), `ghp_${"b".repeat(24)}`);
    expect(auditWorkerIsolationScope(workspace, baseline, [])).toEqual({
      ok: false,
      failure_code: "WORKER_ISOLATION_SCOPE_VIOLATION",
    });
    const result = auditWorkerIsolationScope(workspace, baseline, []);
    expect(
      JSON.stringify(result).includes(readFileSync(join(workspace, "leaked.txt"), "utf8")),
    ).toBe(false);
  });

  it("U-WIP-007: fails closed on symlink, special or oversized post-state", () => {
    const workspace = temporaryRoot("helix-policy-workspace-");
    writeFileSync(join(workspace, "input.txt"), "before");
    const baseline = [{ path: "input.txt", size: 6, digest: sha256Digest("before") }];
    mkdirSync(join(workspace, "out"));
    writeFileSync(join(workspace, "out", "large.bin"), Buffer.alloc(4 * 1024 * 1024 + 1));
    expect(auditWorkerIsolationScope(workspace, baseline, ["out/"])).toEqual({
      ok: false,
      failure_code: "WORKER_ISOLATION_SCOPE_VIOLATION",
    });
    const symlinkWorkspace = temporaryRoot("helix-policy-workspace-");
    writeFileSync(join(symlinkWorkspace, "input.txt"), "before");
    symlinkSync(join(symlinkWorkspace, "input.txt"), join(symlinkWorkspace, "alias.txt"));
    expect(auditWorkerIsolationScope(symlinkWorkspace, baseline, ["alias.txt"])).toEqual({
      ok: false,
      failure_code: "WORKER_ISOLATION_SCOPE_VIOLATION",
    });
  });

  it("U-WIP-008: source mutation cannot remove network and scope enforcement", () => {
    const broker = readFileSync("src/runtime/worker-isolation-broker.ts", "utf8");
    const policy = readFileSync("src/runtime/worker-isolation-policy.ts", "utf8");
    expect(broker).toContain('"--unshare-net"');
    expect(broker).toContain("auditWorkerIsolationScope(");
    expect(policy).toContain("isSecretLike(");
    expect(policy).toContain("isWorkerIsolationPolicyCapability");
  });
});

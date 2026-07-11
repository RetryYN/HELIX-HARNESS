import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  applyClosureAutoApprovalAtomic,
  type ClosureAutoApprovalManifest,
  closureAutoApprovalWindows,
  currentRepositoryHead,
  evaluateClosureAutoApproval,
  parseClosureBatchInteger,
} from "../src/state-db/closure-auto-approval";
import type {
  ProjectClosureQueueItem,
  ProjectCurrentLocationSnapshot,
} from "../src/state-db/current-location";

// PLAN-L7-431-closure-auto-approval
const sha = (value: string | Buffer) =>
  `sha256:${createHash("sha256").update(value).digest("hex")}` as const;

function fixture(count = 1) {
  const root = mkdtempSync(join(tmpdir(), "helix-closure-auto-"));
  execFileSync("git", ["init", "-q"], { cwd: root });
  execFileSync("git", ["config", "user.email", "test@example.invalid"], { cwd: root });
  execFileSync("git", ["config", "user.name", "HELIX Test"], { cwd: root });
  mkdirSync(join(root, "docs/plans"), { recursive: true });
  mkdirSync(join(root, "evidence"), { recursive: true });
  const queue: ProjectClosureQueueItem[] = [];
  for (let index = 0; index < count; index += 1) {
    const planId = `PLAN-L7-${9000 + index}-fixture`;
    const sourcePath = `docs/plans/${planId}.md`;
    writeFileSync(
      join(root, sourcePath),
      `---\nplan_id: ${planId}\nstatus: completed\n---\n# fixture\n`,
    );
    queue.push({
      planId,
      kind: "impl",
      status: "completed",
      updatedAt: "2026-07-12",
      sourcePath,
      l12Layer: "L7",
      coverageId: "L7-tdd-closure",
      coverageLabel: "closure",
      priority: 1,
      driveModel: "Recovery",
      remediationStatus: "done",
      nextAction: "close_ready",
      requiredAction: "close",
      docDependencies: [],
      implementationDependencies: [],
      evidence: {
        status: "ready",
        artifactPaths: [sourcePath],
        traceEdges: 1,
        testRuns: {
          total: 99,
          passed: 99,
          failed: 0,
          latestPassedAt: "2026-07-12T00:00:00Z",
          latestFailedAt: null,
        },
        gateRuns: {
          total: 99,
          passed: 99,
          failed: 0,
          latestPassedAt: "2026-07-12T00:00:00Z",
          latestFailedAt: null,
        },
        runtimeVerification: { total: 0, accepted: 0 },
        evidencePaths: [],
      },
      evidenceGaps: [],
      evidenceAction: "ready",
      reasons: [],
    });
  }
  writeFileSync(join(root, "evidence/test.json"), '{"exit_code":0,"kind":"test"}\n');
  writeFileSync(join(root, "evidence/gate.json"), '{"exit_code":0,"kind":"gate"}\n');
  execFileSync("git", ["add", "docs", "evidence"], { cwd: root });
  execFileSync("git", ["commit", "-qm", "fixture"], { cwd: root });
  const snapshot = {
    source_clock: "2026-07-12T00:10:00Z",
    current: {},
    drive_route: { selectedModel: "Recovery" },
    findings: [],
    closure: {
      queue: {
        items: queue,
        total: count,
        route_counts: {
          close_ready: count,
          collect_evidence: 0,
          repair_failed_evidence: 0,
          reverse_design: 0,
        },
      },
      packets: { items: [], total: 0 },
      next_action_ledger: {
        entries: [],
        total: 0,
        status_counts: { ready: count, needs_evidence: 0, needs_repair: 0, needs_reverse: 0 },
      },
    },
  } as unknown as ProjectCurrentLocationSnapshot;
  const completedAt = "2026-07-12T00:00:00Z";
  const evidence = (kind: "test" | "gate", path: string) => ({
    evidence_id: `${kind}:fixture`,
    path,
    content_digest: sha(readFileSync(join(root, path))),
    run: {
      run_id: `${kind}-run:12345678`,
      command: `helix ${kind}`,
      exit_code: 0 as const,
      output_digest: sha(`${kind}-output`),
      completed_at: completedAt,
    },
  });
  const manifest: ClosureAutoApprovalManifest = {
    schema_version: "closure-auto-approval-manifest.v1",
    repository_head: currentRepositoryHead(root),
    generated_at: "2026-07-12T00:05:00Z",
    expires_at: "2026-07-12T00:30:00Z",
    candidates: queue.map((item) => ({
      plan_id: item.planId,
      source_path: item.sourcePath,
      source_digest: sha(readFileSync(join(root, item.sourcePath))),
      irreversible_impact: false,
      capabilities: ["local_plan_status"],
      expected_tests: [evidence("test", "evidence/test.json")],
      expected_gates: [evidence("gate", "evidence/gate.json")],
    })),
  };
  return { root, snapshot, manifest, queue };
}

const evaluate = (f: ReturnType<typeof fixture>, limit = f.queue.length, offset = 0) =>
  evaluateClosureAutoApproval({
    repoRoot: f.root,
    snapshot: f.snapshot,
    manifest: f.manifest,
    limit,
    offset,
    now: new Date("2026-07-12T00:10:00Z"),
  });

describe("closure auto approval authority", () => {
  it("U-CAUTO-001: typed bytes/run authorityだけでdry-runを許可する", () => {
    const f = fixture();
    const result = evaluate(f);
    expect(result.allowed).toBe(true);
    expect(result.rendered_patches).toHaveLength(1);
  });

  it("U-CAUTO-002: DB集計green自己申告でもevidence bytes driftを拒否する", () => {
    const f = fixture();
    writeFileSync(join(f.root, "evidence/test.json"), "tampered\n");
    expect(evaluate(f).blockers).toContain(
      `${f.queue[0]?.planId}: test evidence/test.json: content digest drift`,
    );
  });

  it("U-CAUTO-003: typed不可逆capabilityはhuman境界へ残す", () => {
    const f = fixture();
    const authority = f.manifest.candidates[0];
    if (!authority) throw new Error("fixture missing");
    authority.irreversible_impact = true;
    authority.capabilities = ["external_publish"];
    expect(evaluate(f)).toMatchObject({
      allowed: false,
      blockers: [`${authority.plan_id}: human approval必須`],
    });
  });

  it("U-CAUTO-004: HEAD/PLAN bytes/freshnessのreplayを拒否する", () => {
    const f = fixture();
    writeFileSync(join(f.root, f.queue[0]?.sourcePath ?? ""), "drift\n");
    const result = evaluate(f);
    expect(result.allowed).toBe(false);
    expect(result.blockers).toContain(`${f.queue[0]?.planId}: PLAN bytes drift`);
    const replay = fixture();
    replay.manifest.expires_at = "2026-07-12T00:09:59Z";
    expect(evaluate(replay).blockers).toContain("manifest freshness不正");
    const toctou = fixture();
    const approved = evaluate(toctou);
    writeFileSync(join(toctou.root, "evidence/gate.json"), "drift-after-evaluation\n");
    expect(() =>
      applyClosureAutoApprovalAtomic({
        repoRoot: toctou.root,
        evaluation: approved,
        manifest: toctou.manifest,
        now: new Date("2026-07-12T00:10:00Z"),
      }),
    ).toThrow("write直前evidence bytes CAS不一致");
  });

  it("U-CAUTO-005: rename途中失敗を全PLAN rollbackし失敗auditを残す", () => {
    const f = fixture(2);
    const evaluation = evaluate(f);
    const before = f.queue.map((item) => readFileSync(join(f.root, item.sourcePath), "utf8"));
    expect(() =>
      applyClosureAutoApprovalAtomic({
        repoRoot: f.root,
        evaluation,
        manifest: f.manifest,
        failAfterRenameForTest: 1,
        now: new Date("2026-07-12T00:10:00Z"),
      }),
    ).toThrow("injected partial failure");
    expect(f.queue.map((item) => readFileSync(join(f.root, item.sourcePath), "utf8"))).toEqual(
      before,
    );
    expect(
      readFileSync(join(f.root, ".helix/audit/closure-auto-approval.jsonl"), "utf8"),
    ).toContain('"status":"rolled_back"');
  });

  it("U-CAUTO-006: 361件を100件以下のwindowで欠落・重複なく評価する", () => {
    expect(parseClosureBatchInteger("01", { min: 0 })).toBeNull();
    expect(parseClosureBatchInteger("1e2", { min: 0 })).toBeNull();
    expect(parseClosureBatchInteger("101", { min: 1, max: 100 })).toBeNull();
    expect(
      closureAutoApprovalWindows({ total: 361, batchSize: 100, offset: 0, all: true }),
    ).toEqual([
      { offset: 0, limit: 100 },
      { offset: 100, limit: 100 },
      { offset: 200, limit: 100 },
      { offset: 300, limit: 61 },
    ]);
    const f = fixture(361);
    const ids = new Set<string>();
    for (let offset = 0; offset < 361; offset += 100) {
      const window = {
        ...f,
        manifest: { ...f.manifest, candidates: f.manifest.candidates.slice(offset, offset + 100) },
      };
      const result = evaluate(window, Math.min(100, 361 - offset), offset);
      expect(result.allowed).toBe(true);
      for (const id of result.target_plan_ids) ids.add(id);
    }
    expect(ids.size).toBe(361);
  });
});

import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  appendRunnerAttestation,
  applyClosureAutoApprovalAtomic,
  type ClosureAutoApprovalManifest,
  closureAutoApprovalWindows,
  currentRepositoryHead,
  evaluateClosureAutoApproval,
  isForcedIrreversiblePlanId,
  parseClosureAutoApprovalManifest,
  parseClosureBatchInteger,
  recoverClosureAutoApprovalTransaction,
  verifyClosureAuditChain,
} from "../src/state-db/closure-auto-approval";
import type {
  ProjectClosureQueueItem,
  ProjectCurrentLocationSnapshot,
} from "../src/state-db/current-location";
import { openHarnessDb } from "../src/state-db/index";
import { migrate } from "../src/state-db/migration";

// PLAN-L7-431-closure-auto-approval
const sha = (value: string | Buffer) =>
  `sha256:${createHash("sha256").update(value).digest("hex")}` as const;

function fixture(count = 1) {
  const root = mkdtempSync(join(tmpdir(), "helix-closure-auto-"));
  execFileSync("git", ["init", "-q"], { cwd: root });
  execFileSync("git", ["config", "user.email", "test@example.invalid"], { cwd: root });
  execFileSync("git", ["config", "user.name", "HELIX Test"], { cwd: root });
  mkdirSync(join(root, "docs/plans"), { recursive: true });
  const queue: ProjectClosureQueueItem[] = [];
  for (let index = 0; index < count; index += 1) {
    const planId = `PLAN-L7-${9000 + index}-fixture`;
    const sourcePath = `docs/plans/${planId}.md`;
    writeFileSync(
      join(root, sourcePath),
      `---\nplan_id: ${planId}\nstatus: completed\nverification_bindings:\n  - { oracle_id: U-FIXTURE, test_path: tests/fixture.test.ts }\nclosure_auto_authority:\n  irreversible_impact: false\n  capabilities: [local_plan_status]\n  required_gates:\n    - { gate_id: G7, command: "helix gate G7" }\n---\n# fixture\n`,
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
  execFileSync("git", ["add", "docs"], { cwd: root });
  execFileSync("git", ["commit", "-qm", "fixture"], {
    cwd: root,
    env: {
      ...process.env,
      GIT_AUTHOR_DATE: "2026-07-12T00:00:00Z",
      GIT_COMMITTER_DATE: "2026-07-12T00:00:00Z",
    },
  });
  const head = currentRepositoryHead(root);
  const db = openHarnessDb(":memory:");
  migrate(db);
  mkdirSync(join(root, ".helix/evidence/closure-runs"), { recursive: true });
  mkdirSync(join(root, ".helix/evidence/outputs"), { recursive: true });
  for (const item of queue) {
    const testOutput = `.helix/evidence/outputs/${item.planId}-test.txt`;
    const gateOutput = `.helix/evidence/outputs/${item.planId}-gate.txt`;
    writeFileSync(join(root, testOutput), "test green\n");
    writeFileSync(join(root, gateOutput), "gate green\n");
    writeFileSync(
      join(root, `.helix/evidence/closure-runs/${item.planId}.json`),
      JSON.stringify({
        schema_version: "closure-run-record.v1",
        plan_id: item.planId,
        repository_head: head,
        runs: [
          {
            run_id: `test-run:${item.planId}`,
            kind: "test",
            oracle_id: "U-FIXTURE",
            command: "bunx vitest run tests/fixture.test.ts",
            exit_code: 0,
            output_path: testOutput,
            output_digest: sha(readFileSync(join(root, testOutput))),
            completed_at: "2026-07-12T00:01:00Z",
          },
          {
            run_id: `gate-run:${item.planId}`,
            kind: "gate",
            oracle_id: "G7",
            command: "helix gate G7",
            exit_code: 0,
            output_path: gateOutput,
            output_digest: sha(readFileSync(join(root, gateOutput))),
            completed_at: "2026-07-12T00:01:00Z",
          },
        ],
      }),
    );
    db.prepare(
      `INSERT INTO test_runs
       (test_run_id, session_id, plan_id, command, exit_code, evidence_path, output_digest, completed_at, status)
       VALUES (?, ?, ?, ?, 0, ?, ?, ?, 'passed')`,
    ).run(
      `test-run:${item.planId}`,
      `session:${item.planId}`,
      item.planId,
      "bunx vitest run tests/fixture.test.ts",
      testOutput,
      sha(readFileSync(join(root, testOutput))),
      "2026-07-12T00:01:00Z",
    );
    db.prepare(
      `INSERT INTO test_cases (test_case_id, test_run_id, plan_id, oracle_id, status)
       VALUES (?, ?, ?, 'U-FIXTURE', 'passed')`,
    ).run(`case:${item.planId}`, `test-run:${item.planId}`, item.planId);
    db.prepare(
      `INSERT INTO gate_runs (gate_run_id, gate_id, plan_id, status, checked_at, evidence_path)
       VALUES (?, 'G7', ?, 'passed', ?, ?)`,
    ).run(`gate-run:${item.planId}`, item.planId, "2026-07-12T00:01:00Z", gateOutput);
    appendRunnerAttestation({
      repoRoot: root,
      db,
      receipt: {
        run_id: `test-run:${item.planId}`,
        session_id: `session:${item.planId}`,
        plan_id: item.planId,
        kind: "test",
        oracle_id: "U-FIXTURE",
        command: "bunx vitest run tests/fixture.test.ts",
        exit_code: 0,
        status: "passed",
        evidence_path: testOutput,
        completed_at: "2026-07-12T00:01:00Z",
      },
    });
    appendRunnerAttestation({
      repoRoot: root,
      db,
      receipt: {
        run_id: `gate-run:${item.planId}`,
        session_id: `gate-run:${item.planId}`,
        plan_id: item.planId,
        kind: "gate",
        oracle_id: "G7",
        command: "helix gate G7",
        exit_code: 0,
        status: "passed",
        evidence_path: gateOutput,
        completed_at: "2026-07-12T00:01:00Z",
      },
    });
  }
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
  const manifest: ClosureAutoApprovalManifest = {
    schema_version: "closure-auto-approval-manifest.v1",
    repository_head: head,
    generated_at: "2026-07-12T00:05:00Z",
    expires_at: "2026-07-12T00:30:00Z",
    candidates: queue.map((item) => ({
      plan_id: item.planId,
      source_path: item.sourcePath,
      source_digest: sha(readFileSync(join(root, item.sourcePath))),
    })),
  };
  return { root, db, snapshot, manifest, queue };
}

const evaluate = (f: ReturnType<typeof fixture>, limit = f.queue.length, offset = 0) =>
  evaluateClosureAutoApproval({
    repoRoot: f.root,
    db: f.db,
    snapshot: f.snapshot,
    manifest: f.manifest,
    limit,
    offset,
    now: new Date("2026-07-12T00:10:00Z"),
  });
const githubReceipt = (f: ReturnType<typeof fixture>) => ({
  schema_version: "github-required-check-receipt.v1" as const,
  repository: "RetryYN/HELIX-HARNESS",
  head: currentRepositoryHead(f.root),
  check_name: "harness-check" as const,
  conclusion: "success" as const,
  run_url: "https://github.com/RetryYN/HELIX-HARNESS/actions/runs/123456",
  observed_at: "2026-07-12T00:10:00Z",
});

describe("closure auto approval authority", () => {
  it("U-CAUTO-001: typed bytes/run authorityだけでdry-runを許可する", () => {
    const f = fixture();
    const result = evaluate(f);
    expect(result.allowed).toBe(true);
    expect(result.rendered_patches).toHaveLength(1);
    expect(() =>
      parseClosureAutoApprovalManifest({ ...f.manifest, caller_expected_tests: [] }),
    ).toThrow();
    f.db
      .prepare(
        "INSERT INTO test_cases (test_case_id, test_run_id, plan_id, oracle_id, status) VALUES (?, ?, ?, ?, 'passed')",
      )
      .run(
        "duplicate-oracle-case",
        `test-run:${f.queue[0]?.planId}`,
        f.queue[0]?.planId,
        "U-FIXTURE",
      );
    expect(evaluate(f).blockers).toContain(`${f.queue[0]?.planId}: run_id重複: U-FIXTURE`);
  });

  it("U-CAUTO-002: DB集計green自己申告でもevidence bytes driftを拒否する", () => {
    const f = fixture();
    const output = `.helix/evidence/outputs/${f.queue[0]?.planId}-test.txt`;
    writeFileSync(join(f.root, output), "tampered\n");
    expect(evaluate(f).blockers).toContain(
      `${f.queue[0]?.planId}: test-run:${f.queue[0]?.planId}: output artifact digest drift`,
    );
    const jsonOnly = fixture();
    jsonOnly.db.prepare("DELETE FROM test_cases").run();
    jsonOnly.db.prepare("DELETE FROM test_runs").run();
    jsonOnly.db.prepare("DELETE FROM gate_runs").run();
    expect(evaluate(jsonOnly).blockers).toContain(
      `${jsonOnly.queue[0]?.planId}: test-run:${jsonOnly.queue[0]?.planId}: canonical DB runner receipt欠落`,
    );
    expect(() => f.db.prepare("UPDATE runner_attestations SET status = 'forged'").run()).toThrow(
      "runner attestation immutable",
    );
    expect(() => f.db.prepare("DELETE FROM runner_attestations").run()).toThrow(
      "runner attestation immutable",
    );
  });

  it("U-CAUTO-003: typed不可逆capabilityはhuman境界へ残す", () => {
    expect(isForcedIrreversiblePlanId("PLAN-L7-146-serverless-readonly-share-v2")).toBe(true);
    expect(isForcedIrreversiblePlanId("PLAN-L7-146-lookalike")).toBe(false);
    const f = fixture();
    const authority = f.manifest.candidates[0];
    if (!authority) throw new Error("fixture missing");
    const path = join(f.root, authority.source_path);
    writeFileSync(
      path,
      readFileSync(path, "utf8")
        .replace("irreversible_impact: false", "irreversible_impact: true")
        .replace("capabilities: [local_plan_status]", "capabilities: [external_publish]"),
    );
    authority.source_digest = sha(readFileSync(path));
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
    writeFileSync(
      join(toctou.root, `.helix/evidence/outputs/${toctou.queue[0]?.planId}-gate.txt`),
      "drift-after-evaluation\n",
    );
    expect(() =>
      applyClosureAutoApprovalAtomic({
        repoRoot: toctou.root,
        evaluation: approved,
        manifest: toctou.manifest,
        db: toctou.db,
        githubReceipt: githubReceipt(toctou),
        now: new Date("2026-07-12T00:10:00Z"),
      }),
    ).toThrow("write直前manifest CAS不一致");
  });

  it("U-CAUTO-005: rename途中失敗を全PLAN rollbackし失敗auditを残す", () => {
    const noGithub = fixture();
    expect(() =>
      applyClosureAutoApprovalAtomic({
        repoRoot: noGithub.root,
        evaluation: evaluate(noGithub),
        manifest: noGithub.manifest,
        db: noGithub.db,
        githubReceipt: null,
        now: new Date("2026-07-12T00:10:00Z"),
      }),
    ).toThrow("dry-run only");
    const f = fixture(2);
    const evaluation = evaluate(f);
    const before = f.queue.map((item) => readFileSync(join(f.root, item.sourcePath), "utf8"));
    expect(() =>
      applyClosureAutoApprovalAtomic({
        repoRoot: f.root,
        evaluation,
        manifest: f.manifest,
        db: f.db,
        githubReceipt: githubReceipt(f),
        failAfterRenameForTest: 1,
        now: new Date("2026-07-12T00:10:00Z"),
      }),
    ).toThrow("injected partial failure");
    expect(f.queue.map((item) => readFileSync(join(f.root, item.sourcePath), "utf8"))).toEqual(
      before,
    );
    const auditLines = readFileSync(
      join(f.root, ".helix/audit/closure-auto-approval.jsonl"),
      "utf8",
    )
      .trim()
      .split("\n")
      .map((line) => JSON.parse(line));
    expect(auditLines[1]).toMatchObject({
      status: "rolled_back",
      previous_digest: auditLines[0]?.event_digest,
    });
    const auditPath = join(f.root, ".helix/audit/closure-auto-approval.jsonl");
    const untamperedAudit = readFileSync(auditPath, "utf8");
    writeFileSync(auditPath, untamperedAudit.replace('"status":"started"', '"status":"forged"'));
    expect(() => verifyClosureAuditChain(auditPath)).toThrow("hash-chain不正");
    writeFileSync(auditPath, untamperedAudit);
    const target = f.queue[0];
    if (!target) throw new Error("fixture missing");
    const original = before[0] as string;
    mkdirSync(join(f.root, ".helix/state"), { recursive: true });
    writeFileSync(join(f.root, target.sourcePath), "crash-partial\n");
    writeFileSync(
      join(f.root, ".helix/state/closure-auto-approval-journal.json"),
      JSON.stringify({
        schema_version: "closure-auto-approval-journal.v1",
        transaction_id: auditLines[0]?.transaction_id,
        status: "prepared",
        started_audit_digest: auditLines[0]?.event_digest,
        authority_digest: auditLines[0]?.authority_digest,
        target_digest: auditLines[0]?.target_digest,
        patch_set_digest: auditLines[0]?.patch_set_digest,
        entries: [
          {
            path: target.sourcePath,
            before_content: original,
            before_digest: sha(original),
            after_digest: sha("crash-partial\n"),
          },
        ],
      }),
    );
    expect(recoverClosureAutoApprovalTransaction(f.root)).toEqual([target.sourcePath]);
    expect(readFileSync(join(f.root, target.sourcePath), "utf8")).toBe(original);
  });

  it("U-CAUTO-006: 361件を100件以下のwindowで欠落・重複なく評価する", () => {
    const missingManifest = spawnSync(
      "bun",
      ["run", "src/cli.ts", "closure", "auto-approve", "--dry-run"],
      { cwd: process.cwd(), encoding: "utf8" },
    );
    expect(missingManifest.status).not.toBe(0);
    expect(missingManifest.stderr).toContain(
      "required option '--evidence-manifest <path>' not specified",
    );
    const invalidNumeric = spawnSync(
      "bun",
      [
        "run",
        "src/cli.ts",
        "closure",
        "auto-approve",
        "--dry-run",
        "--evidence-manifest",
        "unused.json",
        "--batch-size",
        "01",
      ],
      { cwd: process.cwd(), encoding: "utf8" },
    );
    expect(invalidNumeric.status).toBe(2);
    expect(invalidNumeric.stderr).toContain("batch-size must be between 1 and 100");
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

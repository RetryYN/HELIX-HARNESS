import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { hostname, tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { parseClosureAuthorityRegistry } from "../src/state-db/closure-authority-registry";
import {
  evaluateClosureAutoApproval,
  parseClosureAutoApprovalManifest,
} from "../src/state-db/closure-auto-approval";
import {
  materializeClosureEvidence,
  recoverClosureEvidenceMaterialization,
} from "../src/state-db/closure-evidence-materialization";
import { ClosureEvidenceRunner } from "../src/state-db/closure-evidence-runner";
import type { ProjectCurrentLocationSnapshot } from "../src/state-db/current-location";
import { type HarnessDb, openHarnessDb } from "../src/state-db/index";
import { migrate } from "../src/state-db/migration";

// PLAN-L7-434-closure-evidence-materialization

const PLAN = "PLAN-L7-999-materialize";
const PLAN_SOURCE = `---\nplan_id: ${PLAN}\nstatus: completed\n---\n# fixture\n`;
const sha = (value: string | Buffer) =>
  `sha256:${createHash("sha256").update(value).digest("hex")}` as const;
const opened: HarnessDb[] = [];
afterEach(() => {
  for (const db of opened.splice(0)) db.close();
});

function fixture() {
  const root = mkdtempSync(join(tmpdir(), "helix-materialize-"));
  mkdirSync(join(root, ".helix"));
  mkdirSync(join(root, "tests"));
  writeFileSync(join(root, ".gitignore"), ".helix/\n");
  writeFileSync(join(root, "plan.md"), PLAN_SOURCE);
  writeFileSync(join(root, "design.md"), "design\n");
  writeFileSync(join(root, "tests/fixture.test.ts"), "// fixture\n");
  execFileSync("git", ["init", "-q"], { cwd: root });
  execFileSync("git", ["config", "user.email", "fixture@example.invalid"], { cwd: root });
  execFileSync("git", ["config", "user.name", "HELIX fixture"], { cwd: root });
  execFileSync("git", ["add", ".gitignore", "plan.md", "design.md", "tests/fixture.test.ts"], {
    cwd: root,
  });
  execFileSync("git", ["commit", "-qm", "fixture"], {
    cwd: root,
    env: {
      ...process.env,
      GIT_AUTHOR_DATE: "2026-07-11T23:00:00Z",
      GIT_COMMITTER_DATE: "2026-07-11T23:00:00Z",
    },
  });
  const head = execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim();
  execFileSync("git", ["update-ref", "refs/remotes/origin/main", head], { cwd: root });
  const db = openHarnessDb(join(root, ".helix/harness.db"), { repoRoot: root });
  opened.push(db);
  migrate(db);
  const authority = {
    plan_id: PLAN,
    source_path: "plan.md",
    source_digest: sha(PLAN_SOURCE),
    capabilities: ["local_plan_status" as const],
    bindings: [
      {
        oracle_id: "U-CMAT-007",
        parent_design: "design.md",
        test_path: "tests/fixture.test.ts",
      },
    ],
    gates: [
      {
        gate_id: "harness-check",
        command_id: "harness-check",
        command: "helix gate harness-check",
      },
    ],
    migration_reason: null,
  };
  const registry = parseClosureAuthorityRegistry({
    schema_version: "closure-authority-registry.v1",
    authorities: [authority],
  });
  const createRunner = (repositoryHead: string) =>
    new ClosureEvidenceRunner({
      repoRoot: root,
      repositoryHead,
      gateAllowlist: {
        "harness-check": {
          command: "helix gate harness-check",
          executable: "helix",
          argv: ["gate", "harness-check"],
        },
      },
      spawn: ({ executable }) => ({
        exitCode: 0,
        signal: null,
        timedOut: false,
        stderr: "",
        stdout:
          executable === "bunx"
            ? JSON.stringify({
                success: true,
                testResults: [
                  {
                    name: "fixture",
                    assertionResults: [
                      {
                        fullName: "U-CMAT-007 exact join",
                        title: "U-CMAT-007",
                        status: "passed",
                      },
                    ],
                  },
                ],
              })
            : "gate green\n",
      }),
      now: () => "2026-07-12T00:00:00.000Z",
    });
  const runner = createRunner(head);
  const input = {
    repoRoot: root,
    db,
    repositoryHead: head,
    originMainHead: head,
    clean: true,
    candidates: [{ plan_id: PLAN, source_path: "plan.md" }],
    reviewBundlePlanIds: [PLAN],
    registry,
    runner,
    gateCommands: { "harness-check": "helix gate harness-check" },
    id: () => "materialization-fixture-0001",
    now: () => "2026-07-12T00:00:00.000Z",
  };
  return { root, db, input, createRunner };
}

describe("closure evidence materialization transaction", () => {
  it("U-CMAT-003: scope・HEAD・clean境界をfail-closeする", () => {
    const { input } = fixture();
    expect(() => materializeClosureEvidence({ ...input, reviewBundlePlanIds: [] })).toThrow(
      /scope\/order/,
    );
    expect(() => materializeClosureEvidence({ ...input, clean: false })).toThrow(/clean/);
  });

  it("multi-process lockはrunner開始前に同時materializationを拒否する", () => {
    const { root, input } = fixture();
    mkdirSync(join(root, ".helix/state"), { recursive: true });
    writeFileSync(
      join(root, ".helix/state/closure-materialization.lock"),
      JSON.stringify({ pid: process.pid, host: hostname() }),
    );
    expect(() => materializeClosureEvidence(input)).toThrow(/already running/);
  });

  it("U-CMAT-009: windowとconcurrencyの上限をfail-closeする", () => {
    const { root, db, input, createRunner } = fixture();
    expect(() => materializeClosureEvidence({ ...input, windowSize: 101 })).toThrow(/1\.\.100/);
    expect(() => materializeClosureEvidence({ ...input, concurrency: 5 })).toThrow(/1\.\.4/);
    const base = input.registry.authorities[0];
    if (!base) throw new Error("fixture authority missing");
    const authorities = Array.from({ length: 361 }, (_, index) => {
      const plan_id = `PLAN-L7-${9000 + index}-materialize`;
      const source_path = `plan-${index}.md`;
      const source = `---\nplan_id: ${plan_id}\nstatus: completed\n---\n# fixture\n`;
      writeFileSync(join(root, source_path), source);
      return { ...base, plan_id, source_path, source_digest: sha(source) };
    });
    execFileSync("git", ["add", ...authorities.map(({ source_path }) => source_path)], {
      cwd: root,
    });
    execFileSync("git", ["commit", "-qm", "add materialization census"], {
      cwd: root,
      env: {
        ...process.env,
        GIT_AUTHOR_DATE: "2026-07-11T23:10:00Z",
        GIT_COMMITTER_DATE: "2026-07-11T23:10:00Z",
      },
    });
    const head = execFileSync("git", ["rev-parse", "HEAD"], {
      cwd: root,
      encoding: "utf8",
    }).trim();
    execFileSync("git", ["update-ref", "refs/remotes/origin/main", head], { cwd: root });
    const candidates = authorities.map(({ plan_id, source_path }) => ({ plan_id, source_path }));
    const result = materializeClosureEvidence({
      ...input,
      repositoryHead: head,
      originMainHead: head,
      runner: createRunner(head),
      candidates,
      reviewBundlePlanIds: candidates.map(({ plan_id }) => plan_id),
      registry: parseClosureAuthorityRegistry({
        schema_version: "closure-authority-registry.v1",
        authorities,
      }),
      id: () => "materialization-fixture-0361",
      windowSize: 100,
      concurrency: 4,
    });
    expect(result.run_count).toBe(722);
    expect(db.prepare("SELECT COUNT(*) AS n FROM test_runs").get()?.n).toBe(361);
    expect(db.prepare("SELECT COUNT(*) AS n FROM gate_runs").get()?.n).toBe(361);
    const manifest = JSON.parse(readFileSync(join(root, result.manifest_path ?? ""), "utf8"));
    expect(manifest.candidates).toHaveLength(361);
    expect(new Set(manifest.candidates.map((row: { plan_id: string }) => row.plan_id)).size).toBe(
      361,
    );
  });

  it("U-CMAT-010: authority不在はdefault humanとしてstatusを変更しない", () => {
    const { input } = fixture();
    expect(
      materializeClosureEvidence({
        ...input,
        registry: parseClosureAuthorityRegistry({
          schema_version: "closure-authority-registry.v1",
          authorities: [],
        }),
      }).status,
    ).toBe("classified");
  });

  it("U-CMAT-006: 未commit失敗はDB/JSONL/files/manifestをall-or-none rollbackする", () => {
    for (const crashAt of ["before-db" as const]) {
      const { root, db, input } = fixture();
      expect(() => materializeClosureEvidence({ ...input, crashAt })).toThrow(/injected crash/);
      expect(db.prepare("SELECT COUNT(*) AS n FROM closure_materializations").get()?.n).toBe(0);
      expect(
        db.prepare("SELECT COUNT(*) AS n FROM test_runs WHERE session_id=?").get(input.id())?.n,
      ).toBe(0);
      expect(existsSync(join(root, ".helix/evidence/closure-materialization-journal.json"))).toBe(
        false,
      );
    }
  });

  it("U-CMAT-007: run record・DB・attestation・manifestのexact joinを保つ", () => {
    const { root, db, input } = fixture();
    expect(() =>
      materializeClosureEvidence({ ...input, crashAt: "after-db-before-manifest" }),
    ).toThrow(/after-db-before-manifest/);
    const marker = db
      .prepare("SELECT status FROM closure_materializations WHERE materialization_id=?")
      .get(input.id());
    expect(marker?.status).toBe("committed");
    recoverClosureEvidenceMaterialization(root, db);
    const manifestPath = join(
      root,
      `.helix/evidence/closure-auto-approval-manifest-${input.id()}.json`,
    );
    expect(JSON.parse(readFileSync(manifestPath, "utf8")).schema_version).toBe(
      "closure-auto-approval-manifest.v1",
    );
    const record = JSON.parse(
      readFileSync(join(root, `.helix/evidence/closure-runs/${PLAN}.json`), "utf8"),
    );
    expect(record.schema_version).toBe("closure-run-record.v1");
    expect(record.runs).toHaveLength(2);
    const test = db.prepare("SELECT command,exit_code,output_digest FROM test_runs").get();
    expect(test).toMatchObject({ exit_code: 0 });
    expect(test?.command).toContain("vitest");
    expect(test?.output_digest).toBe(record.runs[0].output_digest);
    expect(db.prepare("SELECT COUNT(*) AS n FROM runner_attestations").get()?.n).toBe(2);
  });

  it("materialized production manifestは既存auto-approve dry-runでallowedになる", () => {
    const { root, db, input } = fixture();
    const result = materializeClosureEvidence(input);
    const manifest = parseClosureAutoApprovalManifest(
      JSON.parse(readFileSync(join(root, result.manifest_path ?? ""), "utf8")),
    );
    const queueItem = {
      planId: PLAN,
      kind: "impl",
      status: "completed",
      updatedAt: "2026-07-12",
      sourcePath: "plan.md",
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
        artifactPaths: ["plan.md"],
        traceEdges: 1,
        testRuns: {
          total: 1,
          passed: 1,
          failed: 0,
          latestPassedAt: "2026-07-12T00:00:00Z",
          latestFailedAt: null,
        },
        gateRuns: {
          total: 1,
          passed: 1,
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
    };
    const snapshot = {
      source_clock: "2026-07-12T00:05:00Z",
      current: {},
      drive_route: { selectedModel: "Recovery" },
      findings: [],
      closure: {
        queue: {
          items: [queueItem],
          total: 1,
          route_counts: {
            close_ready: 1,
            collect_evidence: 0,
            repair_failed_evidence: 0,
            reverse_design: 0,
          },
        },
        packets: { items: [], total: 0 },
        next_action_ledger: {
          entries: [],
          total: 0,
          status_counts: { ready: 1, needs_evidence: 0, needs_repair: 0, needs_reverse: 0 },
        },
      },
    } as unknown as ProjectCurrentLocationSnapshot;
    const evaluation = evaluateClosureAutoApproval({
      repoRoot: root,
      db,
      snapshot,
      manifest,
      limit: 1,
      offset: 0,
      now: new Date("2026-07-12T00:05:00Z"),
      authorityRegistry: input.registry,
    });
    expect(evaluation.blockers).toEqual([]);
    expect(evaluation.allowed).toBe(true);
  });

  it("U-CMAT-008: committed markerからcrash recoveryを再開しpartial manifestを残さない", () => {
    const { root, db, input } = fixture();
    expect(() =>
      materializeClosureEvidence({ ...input, crashAt: "after-db-before-manifest" }),
    ).toThrow(/after-db-before-manifest/);
    recoverClosureEvidenceMaterialization(root, db);
    expect(
      existsSync(join(root, `.helix/evidence/closure-auto-approval-manifest-${input.id()}.json`)),
    ).toBe(true);

    const afterManifest = fixture();
    expect(() =>
      materializeClosureEvidence({
        ...afterManifest.input,
        id: () => "materialization-fixture-0002",
        crashAt: "after-manifest",
      }),
    ).toThrow(/after-manifest/);
    const journal = JSON.parse(
      readFileSync(
        join(afterManifest.root, ".helix/evidence/closure-materialization-journal.json"),
        "utf8",
      ),
    );
    expect(journal.state).toBe("complete");
    expect(
      existsSync(
        join(
          afterManifest.root,
          ".helix/evidence/closure-auto-approval-manifest-materialization-fixture-0002.json",
        ),
      ),
    ).toBe(true);
  });

  it("rerun crashは既存canonical run recordをbefore bytesへ復元する", () => {
    const { root, input } = fixture();
    materializeClosureEvidence(input);
    const recordPath = join(root, `.helix/evidence/closure-runs/${PLAN}.json`);
    const before = readFileSync(recordPath);
    expect(() =>
      materializeClosureEvidence({
        ...input,
        id: () => "materialization-fixture-rerun",
        crashAt: "after-files-before-commit",
      }),
    ).toThrow(/after-files-before-commit/);
    expect(readFileSync(recordPath)).toEqual(before);
  });
});

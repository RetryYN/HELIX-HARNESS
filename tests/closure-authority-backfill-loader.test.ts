import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  loadCollectedVitestTests,
  loadRepoOwnedGateAllowlist,
  readVerifiedRepoFile,
} from "../src/state-db/closure-authority-backfill-loader";
import {
  parseIntraRuntimeReviewIdentityEvidence,
  verifyCanonicalRebuiltBackfillBundle,
  verifyClosureAuthorityBackfillCurrentContext,
  verifyClosureAuthorityBackfillProductionBundle,
  verifyCollectedVitestAssertions,
} from "../src/state-db/closure-authority-backfill-verifier";
import {
  buildProjectClosureReviewBundle,
  buildProjectCurrentLocationSnapshot,
} from "../src/state-db/current-location";
import { openHarnessDb } from "../src/state-db/index";
import { migrate } from "../src/state-db/migration";

const sha = (value: string) =>
  `sha256:${createHash("sha256").update(value).digest("hex")}` as const;
const HEAD = "a".repeat(40);
function repo() {
  const root = mkdtempSync(join(tmpdir(), "helix-authority-loader-"));
  mkdirSync(join(root, "docs/governance"), { recursive: true });
  mkdirSync(join(root, "tests"), { recursive: true });
  mkdirSync(join(root, ".helix/evidence"), { recursive: true });
  return root;
}

describe("closure authority backfill verified repo loader", () => {
  it("intra-runtime reviewは別task identityとtermination evidenceを必須にする", () => {
    const evidence = {
      schema_version: "closure-backfill-intra-runtime-review.v1",
      worker_task_id: "worker-1",
      reviewer_task_id: "reviewer-1",
      termination_event_id: "stop-1",
      termination_status: "completed",
      repository_head: HEAD,
      bundle_digest: sha("bundle"),
      recompute_evidence_digest: sha("recompute"),
    };
    expect(parseIntraRuntimeReviewIdentityEvidence(evidence)).toEqual(evidence);
    expect(() =>
      parseIntraRuntimeReviewIdentityEvidence({ ...evidence, reviewer_task_id: "worker-1" }),
    ).toThrow(/identity must differ/);
    expect(() =>
      parseIntraRuntimeReviewIdentityEvidence({ ...evidence, termination_status: "running" }),
    ).toThrow();
  });
  it("Vitest markerはartifact全体でtarget exactly-oneだけを許す", () => {
    const target = `[PLAN-L7-900-fixture/U-CABF-002]`;
    expect(() =>
      verifyCollectedVitestAssertions(
        [{ fullName: `${target} exact`, status: "passed" }],
        "PLAN-L7-900-fixture",
        "U-CABF-002",
      ),
    ).not.toThrow();
    for (const assertions of [
      [{ fullName: `${target} ${target}`, status: "passed" }],
      [{ fullName: `${target} [PLAN-L7-901-other/U-CABF-003]`, status: "passed" }],
      [{ fullName: `${target} skipped`, status: "skipped" }],
      [
        { fullName: `${target} a`, status: "passed" },
        { fullName: `${target} b`, status: "passed" },
      ],
    ])
      expect(() =>
        verifyCollectedVitestAssertions(assertions, "PLAN-L7-900-fixture", "U-CABF-002"),
      ).toThrow(/exact join/);
  });
  it("canonical rebuild比較はcaller reason/backlog偽装を拒否する", () => {
    const base = {
      decisions: [
        {
          plan_id: "PLAN-L7-900-fixture",
          classification: "needs_design",
          reason: "canonical",
          required_action: "L6へ戻す",
          evidence_digests: [sha("plan")],
          proposal: null,
        },
      ],
      source_digests: [sha("plan")],
      bundle_digest: sha("bundle"),
    } as never;
    expect(() => verifyCanonicalRebuiltBackfillBundle(base, base)).not.toThrow();
    const forged = structuredClone(base) as { decisions: Array<{ reason: string }> };
    const forgedDecision = forged.decisions[0];
    if (!forgedDecision) throw new Error("forged decision fixture missing");
    forgedDecision.reason = "偽装済み";
    expect(() => verifyCanonicalRebuiltBackfillBundle(forged as never, base)).toThrow(
      /decisions differ/,
    );
  });

  it("production verifierはrepo/DBを読む前にbundle body改ざんを拒否する", () => {
    expect(() =>
      verifyClosureAuthorityBackfillProductionBundle({
        repoRoot: repo(),
        db: {} as never,
        bundle: {
          schema_version: "closure-authority-backfill-bundle.v1",
          repository_head: HEAD,
          registry_digest: sha("registry"),
          review_scope_digest: sha("scope"),
          candidate_plan_ids: [],
          decisions: [],
          source_digests: [],
          bundle_digest: sha("forged"),
        },
        gateAllowlistPath: "docs/governance/closure-gate-allowlist.yaml",
        now: "2026-07-12T00:00:00.000Z",
      }),
    ).toThrow(/bundle body digest mismatch/);
  });
  it("production contextをactual clean origin/mainとcurrent DB review scopeへexact束縛する", () => {
    const root = repo();
    execFileSync("git", ["init", "-q"], { cwd: root });
    execFileSync("git", ["config", "user.email", "fixture@example.invalid"], { cwd: root });
    execFileSync("git", ["config", "user.name", "fixture"], { cwd: root });
    writeFileSync(join(root, ".gitignore"), ".helix/\n");
    execFileSync("git", ["add", ".gitignore"], { cwd: root });
    execFileSync("git", ["commit", "-qm", "fixture"], { cwd: root });
    const head = execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim();
    execFileSync("git", ["update-ref", "refs/remotes/origin/main", head], { cwd: root });
    const db = openHarnessDb(":memory:", { repoRoot: root });
    try {
      migrate(db);
      const snapshot = buildProjectCurrentLocationSnapshot(db);
      const review = buildProjectClosureReviewBundle(snapshot, {
        action: "close_ready",
        limit: Math.max(1, snapshot.closure.queue.route_counts.close_ready),
        offset: 0,
      });
      const bundle = {
        repository_head: head,
        candidate_plan_ids: review.review_scope.plan_ids,
        review_scope_digest: review.review_scope.approval_scope_digest,
      } as never;
      expect(() =>
        verifyClosureAuthorityBackfillCurrentContext({ repoRoot: root, db, bundle }),
      ).not.toThrow();
      writeFileSync(join(root, "dirty.txt"), "dirty");
      expect(() =>
        verifyClosureAuthorityBackfillCurrentContext({ repoRoot: root, db, bundle }),
      ).toThrow(/clean current/);
    } finally {
      db.close();
    }
  });
  it("realpath containmentとsymlink ancestryをfail-closeする", () => {
    const root = repo();
    writeFileSync(join(root, "tests/example.test.ts"), "test");
    expect(readVerifiedRepoFile(root, "tests/example.test.ts").digest).toBe(sha("test"));
    expect(() => readVerifiedRepoFile(root, "../outside")).toThrow(/non-canonical|outside/);
    symlinkSync(join(root, "tests"), join(root, "linked"));
    expect(() => readVerifiedRepoFile(root, "linked/example.test.ts")).toThrow(/symlink/);
  });

  it("repo-owned allowlist bytes/digest/HEADへ束縛しunknown fieldを拒否する", () => {
    const root = repo();
    const path = "docs/governance/closure-gate-allowlist.yaml";
    const bytes = JSON.stringify({
      schema_version: "closure-gate-allowlist.v1",
      gates: { g7: { command_id: "g7", command: "helix gate G7" } },
    });
    writeFileSync(join(root, path), bytes);
    expect(loadRepoOwnedGateAllowlist({ repoRoot: root, path, repositoryHead: HEAD })).toEqual({
      source_path: path,
      source_digest: sha(bytes),
      repository_head: HEAD,
      entries: { g7: { command_id: "g7", command: "helix gate G7" } },
    });
    expect(
      loadRepoOwnedGateAllowlist({ repoRoot: root, path, repositoryHead: "b".repeat(40) })
        .repository_head,
    ).toBe("b".repeat(40));
  });

  it("Vitest stdout physical receiptのHEAD・argv・digestを再検証してcollectする", () => {
    const root = repo();
    const testPath = "tests/example.test.ts";
    const stdoutPath = ".helix/evidence/vitest.json";
    const stdout = JSON.stringify({
      testResults: [
        {
          assertionResults: [
            { fullName: "[PLAN-L7-900-fixture/U-CABF-002] exact", status: "passed" },
          ],
        },
      ],
    });
    writeFileSync(join(root, testPath), "test source");
    writeFileSync(join(root, stdoutPath), stdout);
    const receipt = {
      schema_version: "closure-process-receipt.v1",
      repository_head: HEAD,
      kind: "test",
      executable: "bunx",
      argv: ["vitest", "run", testPath, "--reporter=json"],
      stdout_digest: sha(stdout),
      completed_at: "2026-07-12T00:00:00.000Z",
    };
    expect(
      loadCollectedVitestTests({
        repoRoot: root,
        testPath,
        stdoutPath,
        receipt,
        repositoryHead: HEAD,
      })[0],
    ).toMatchObject({ status: "passed", source_digest: sha("test source") });
    expect(() =>
      loadCollectedVitestTests({
        repoRoot: root,
        testPath,
        stdoutPath,
        receipt: { ...receipt, stdout_digest: sha("tampered") },
        repositoryHead: HEAD,
      }),
    ).toThrow(/digest drift/);
  });
});

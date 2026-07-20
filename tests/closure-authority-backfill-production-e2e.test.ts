import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parse as parseYaml } from "yaml";
import { buildClosureAuthorityBackfill } from "../src/policy/closure-authority-backfill";
import {
  applyClosureAuthorityBackfill,
  proposalDigest,
  proposalSetDigest,
  reviewVerdictDigest,
} from "../src/state-db/closure-authority-backfill";
import { verifyClosureAuthorityBackfillProductionBundle } from "../src/state-db/closure-authority-backfill-verifier";
import { closureCommandDedupeKey } from "../src/state-db/closure-evidence-runner";
import {
  buildProjectClosureReviewBundle,
  buildProjectCurrentLocationSnapshot,
} from "../src/state-db/current-location";
import { openHarnessDb } from "../src/state-db/index";
import { rebuildHarnessDb } from "../src/state-db/projection-writer";

const sha = (value: string | Buffer) =>
  `sha256:${createHash("sha256").update(value).digest("hex")}` as const;

describe("closure authority backfill production E2E", () => {
  it("mockなし1 PLANでcanonical rebuild→public apply→eligible registry/cycleへ到達する", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-authority-production-"));
    const bare = mkdtempSync(join(tmpdir(), "helix-authority-origin-"));
    const planId = "PLAN-L7-900-production-e2e";
    const oracle = "U-CABF-002";
    const planPath = `docs/plans/${planId}.md`;
    const designPath = "docs/design/harness/L6-function-design/production-e2e.md";
    const testPath = "tests/production-e2e.test.ts";
    const l8Path = "docs/test-design/harness/L8-unit-test-design.md";
    const registryPath = "docs/governance/closure-authority-registry.yaml";
    const allowlistPath = "docs/governance/closure-gate-allowlist.yaml";
    for (const path of [planPath, designPath, testPath, l8Path, registryPath, allowlistPath])
      mkdirSync(join(root, path, ".."), { recursive: true });
    writeFileSync(join(root, ".gitignore"), ".helix/\n");
    const design = `---\nstatus: confirmed\nclosure_authority:\n  capabilities: [local_plan_status]\n  gates:\n    - { gate_id: g7, command_id: g7, command: "helix gate G7" }\n---\n\n# design\n${oracle}\n`;
    const plan = `---\nplan_id: ${planId}\ntitle: production e2e\nkind: impl\nlayer: L7\ndrive: agent\nstatus: confirmed\nparent_design: ${designPath}\npair_artifact: ${l8Path}\nverification_bindings:\n  - { oracle_id: ${oracle}, parent_design: ${designPath}, test_path: ${testPath} }\ngenerates:\n  - { artifact_path: ${planPath}, artifact_type: markdown_doc }\n  - { artifact_path: ${testPath}, artifact_type: test_code }\nreview_evidence:\n  - reviewer: reviewer-b\n    review_kind: cross_agent\n    reviewed_at: "2026-07-12T00:30:00.000Z"\n    tests_green_at: "2026-07-12T00:30:00.000Z"\n    verdict: approve\n    worker_model: worker-a\n    reviewer_model: reviewer-b\n    green_commands:\n      - { kind: unit_test, command: "npx --no-install vitest run ${testPath}", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-07-12T00:30:00.000Z", evidence_path: ${testPath}, output_digest: "${sha("old-green")}" }\n---\n\n# plan\n`;
    const l8 = `| U-ID | 対象 | 反例と期待結果 | test citation |\n| --- | --- | --- | --- |\n| ${oracle} | production | exact | \`${testPath}\` |\n`;
    writeFileSync(join(root, designPath), design);
    writeFileSync(join(root, planPath), plan);
    writeFileSync(join(root, testPath), `test("[${planId}/${oracle}] exact", () => {});\n`);
    writeFileSync(join(root, l8Path), l8);
    writeFileSync(
      join(root, registryPath),
      "schema_version: closure-authority-registry.v1\nauthorities: []\n",
    );
    writeFileSync(
      join(root, allowlistPath),
      `schema_version: closure-gate-allowlist.v1\ngates:\n  g7: { command_id: g7, command: "helix gate G7" }\n`,
    );
    execFileSync("git", ["init", "-q", "--bare", bare]);
    execFileSync("git", ["init", "-q", "-b", "main"], { cwd: root });
    execFileSync("git", ["config", "user.email", "fixture@example.invalid"], { cwd: root });
    execFileSync("git", ["config", "user.name", "fixture"], { cwd: root });
    execFileSync("git", ["add", ".gitignore", "docs", "tests"], { cwd: root });
    execFileSync("git", ["commit", "-qm", "fixture"], { cwd: root });
    execFileSync("git", ["remote", "add", "origin", bare], { cwd: root });
    execFileSync("git", ["push", "-qu", "origin", "main"], { cwd: root });
    const head = execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim();
    rebuildHarnessDb({ repoRoot: root });
    const db = openHarnessDb(join(root, ".helix/harness.db"), { repoRoot: root });
    try {
      const snapshot = buildProjectCurrentLocationSnapshot(db);
      expect(snapshot.closure.queue.route_counts.close_ready).toBe(1);
      const review = buildProjectClosureReviewBundle(snapshot, {
        action: "close_ready",
        limit: 1,
        offset: 0,
      });
      const argv = ["--no-install", "vitest", "run", testPath, "--reporter=json"];
      const commandKey = closureCommandDedupeKey(head, { kind: "test", executable: "npx", argv });
      const processKey = sha("physical-receipt");
      const stdout = JSON.stringify({
        success: true,
        testResults: [
          { assertionResults: [{ fullName: `[${planId}/${oracle}] exact`, status: "passed" }] },
        ],
      });
      const stderr = "";
      const receiptDir = join(root, ".helix/evidence/process-receipts");
      mkdirSync(receiptDir, { recursive: true });
      writeFileSync(join(receiptDir, `${processKey.slice(7)}.stdout`), stdout);
      writeFileSync(join(receiptDir, `${processKey.slice(7)}.stderr`), stderr);
      db.prepare(
        `INSERT INTO closure_process_receipts (process_receipt_key,schema_version,materialization_id,kind,repository_head,executable,argv_json,dedupe_key,exit_code,signal,timed_out,stdout_digest,stderr_digest,stdout_path,stderr_path,completed_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      ).run(
        processKey,
        "closure-process-receipt.v1",
        "mat-e2e",
        "test",
        head,
        "npx",
        JSON.stringify(argv),
        commandKey,
        0,
        null,
        0,
        sha(stdout),
        sha(stderr),
        `.helix/evidence/process-receipts/${processKey.slice(7)}.stdout`,
        `.helix/evidence/process-receipts/${processKey.slice(7)}.stderr`,
        "2026-07-12T00:40:00.000Z",
      );
      const candidate = {
        plan_id: planId,
        plan_path: planPath,
        plan_digest: sha(plan),
        plan_slot_kind: "implementation_plan" as const,
        plan_bindings: [{ oracle_id: oracle, parent_design: designPath, test_path: testPath }],
        l8_rows: [
          {
            oracle_id: oracle,
            parent_design: designPath,
            test_path: testPath,
            source_path: l8Path,
            source_digest: sha(l8),
            parent_design_status: "confirmed",
          },
        ],
        collected_tests: [
          {
            test_path: testPath,
            full_name: `[${planId}/${oracle}] exact`,
            status: "passed" as const,
            source_digest: sha(readFileSync(join(root, testPath))),
            canonical_realpath: true,
            symlink: false,
            receipt: {
              schema_version: "closure-process-receipt.v1" as const,
              repository_head: head,
              kind: "test" as const,
              executable: "npx" as const,
              argv,
              stdout_digest: sha(stdout),
              completed_at: "2026-07-12T00:40:00.000Z",
            },
          },
        ],
        design_authority: {
          source_kind: "confirmed_design" as const,
          source_path: designPath,
          source_digest: sha(design),
          field_pointer: "/closure_authority",
          status: "confirmed",
          capabilities: ["local_plan_status"],
          gates: [{ gate_id: "g7", command_id: "g7", command: "helix gate G7" }],
        },
        plan_authority: null,
      };
      const bundle = buildClosureAuthorityBackfill({
        repository_head: head,
        registry_digest: sha(readFileSync(join(root, registryPath))),
        review_scope_digest: review.review_scope.approval_scope_digest as `sha256:${string}`,
        expected_plan_ids: [planId],
        candidates: [candidate],
        gate_allowlist: {
          source_path: allowlistPath,
          source_digest: sha(readFileSync(join(root, allowlistPath))),
          repository_head: head,
          entries: { g7: { command_id: "g7", command: "helix gate G7" } },
        },
      });
      const verification = verifyClosureAuthorityBackfillProductionBundle({
        repoRoot: root,
        db,
        bundle,
        gateAllowlistPath: allowlistPath,
        now: "2026-07-12T01:00:00.000Z",
      });
      const proposal = bundle.decisions[0]?.proposal;
      if (!proposal) throw new Error("eligible production proposal missing");
      const verdicts = [
        {
          plan_id: planId,
          proposal_digest: proposalDigest(proposal),
          recomputed_proposal_digest: proposalDigest(proposal),
          verdict: "approve" as const,
        },
      ];
      const proposalSet = proposalSetDigest([
        { plan_id: planId, digest: proposalDigest(proposal) },
      ]);
      const artifactPath = ".helix/evidence/review-authority.json";
      const artifact = {
        schema_version: "closure-backfill-cross-runtime-authority.v1",
        worker_run_id: "worker-run-1",
        reviewer_run_id: "reviewer-run-1",
        worker_runtime: "worker-a",
        reviewer_runtime: "reviewer-b",
        review_task_id: "receipt-0001",
        worker_scope_plan_id: planId,
        reviewer_scope_plan_id: planId,
        repository_head: head,
        bundle_digest: bundle.bundle_digest,
        proposal_set_digest: proposalSet,
        recompute_evidence_digest: verification.source_digest,
        worker_completed_at: "2026-07-12T00:20:00.000Z",
        reviewer_completed_at: "2026-07-12T00:30:00.000Z",
        completed_at: "2026-07-12T00:30:00.000Z",
        verdict: "approve",
        verdicts,
      };
      mkdirSync(join(root, ".helix/evidence"), { recursive: true });
      const artifactBytes = JSON.stringify(artifact);
      writeFileSync(join(root, artifactPath), artifactBytes);
      for (const [id, runtime, role, completed] of [
        ["worker-run-1", "worker-a", "worker", artifact.worker_completed_at],
        ["reviewer-run-1", "reviewer-b", "reviewer", artifact.reviewer_completed_at],
      ] as const)
        db.prepare(
          "INSERT INTO model_runs(run_id,runtime,model,role,drive,plan_id,started_at,completed_at,evidence_path) VALUES(?,?,?,?,?,?,?,?,?)",
        ).run(
          id,
          runtime,
          runtime,
          role,
          "agent",
          planId,
          completed,
          completed,
          role === "reviewer" ? artifactPath : "worker",
        );
      db.prepare(
        "INSERT INTO closure_authority_review_receipts(receipt_id,worker_run_id,reviewer_run_id,artifact_path,artifact_digest,repository_head,bundle_digest,proposal_set_digest,recompute_digest,verdict_digest,status,exit_code,completed_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)",
      ).run(
        "receipt-0001",
        "worker-run-1",
        "reviewer-run-1",
        artifactPath,
        sha(artifactBytes),
        head,
        bundle.bundle_digest,
        proposalSet,
        verification.source_digest,
        reviewVerdictDigest(verdicts),
        "completed",
        0,
        artifact.completed_at,
      );
      const receipt = {
        schema_version: "closure-authority-backfill-review.v1" as const,
        receipt_id: "receipt-0001",
        worker_identity: "worker-a",
        reviewer_identity: "reviewer-b",
        review_kind: "cross_runtime" as const,
        identity_evidence: {
          schema_version: "closure-backfill-cross-runtime-review.v1" as const,
          worker_runtime: "worker-a",
          reviewer_runtime: "reviewer-b",
          worker_run_id: "worker-run-1",
          authority_receipt_id: "reviewer-run-1",
          authority_receipt_path: artifactPath,
          authority_receipt_digest: sha(artifactBytes),
          recompute_evidence_digest: verification.source_digest,
          repository_head: head,
          bundle_digest: bundle.bundle_digest,
        },
        reviewed_at: artifact.completed_at,
        expires_at: "2026-07-12T01:30:00.000Z",
        repository_head: head,
        review_scope_digest: bundle.review_scope_digest,
        registry_digest: bundle.registry_digest,
        bundle_digest: bundle.bundle_digest,
        proposal_set_digest: proposalSet,
        verdicts,
      };
      const result = applyClosureAuthorityBackfill({
        repoRoot: root,
        registryPath,
        bundle,
        receipt,
        now: "2026-07-12T01:00:00.000Z",
        db,
        gateAllowlistPath: allowlistPath,
        cycleId: "cycle-production-e2e",
      });
      expect(result.applied_plan_ids).toEqual([planId]);
      const registry = parseYaml(readFileSync(join(root, registryPath), "utf8"));
      expect(registry.authorities[0]).toMatchObject({ plan_id: planId, migration_reason: null });
      expect(
        readFileSync(join(root, ".helix/evidence/closure-authority-backfill/cycles.jsonl"), "utf8"),
      ).toContain("cycle-production-e2e");
    } finally {
      db.close();
    }
  });
});

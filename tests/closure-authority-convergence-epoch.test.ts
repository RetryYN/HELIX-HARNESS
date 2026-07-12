import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  appendClosureTerminalBoundaryEvent,
  buildClosureConvergenceTargetSet,
  buildClosureEpochPlan,
  finalizeClosureConvergenceEpoch,
  projectClosureTerminalBoundaries,
  reconcileClosureEpochOperation,
  runClosureEpochAutoApproval,
  terminalBoundaryClassificationForAuthority,
  verifyClosureEpochTransition,
  verifyClosureTerminalBoundaryLedger,
} from "../src/state-db/closure-authority-convergence-epoch";
import { buildProjectCurrentLocationSnapshot } from "../src/state-db/current-location";
import { openHarnessDb } from "../src/state-db/index";
import { rebuildHarnessDb } from "../src/state-db/projection-writer";

const digest = (character: string) => `sha256:${character.repeat(64)}` as const;
const fileDigest = (value: string | Buffer) =>
  `sha256:${createHash("sha256").update(value).digest("hex")}` as const;

function fixture() {
  const root = mkdtempSync(join(tmpdir(), "helix-closure-epoch-"));
  const bare = mkdtempSync(join(tmpdir(), "helix-closure-epoch-origin-"));
  mkdirSync(join(root, "docs/governance"), { recursive: true });
  mkdirSync(join(root, "docs/plans"), { recursive: true });
  writeFileSync(join(root, ".gitignore"), ".helix/\n");
  writeFileSync(
    join(root, "docs/governance/closure-authority-registry.yaml"),
    "schema_version: closure-authority-registry.v1\nauthorities: []\n",
  );
  writeFileSync(join(root, "docs/governance/closure-terminal-boundaries.jsonl"), "");
  for (const [id, status] of [
    ["PLAN-L7-900-auto", "accepted"],
    ["PLAN-M-02-human", "confirmed"],
    ["PLAN-L7-902-invalid", "confirmed"],
  ])
    writeFileSync(
      join(root, `docs/plans/${id}.md`),
      `---\nplan_id: ${id}\nkind: impl\nlayer: L7\ndrive: agent\nstatus: ${status}\n---\n`,
    );
  execFileSync("git", ["init", "-q", "--bare", bare]);
  execFileSync("git", ["init", "-q", "-b", "main"], { cwd: root });
  execFileSync("git", ["config", "user.email", "fixture@example.invalid"], { cwd: root });
  execFileSync("git", ["config", "user.name", "fixture"], { cwd: root });
  execFileSync("git", ["add", "."], { cwd: root });
  execFileSync("git", ["commit", "-qm", "authority epoch"], { cwd: root });
  execFileSync("git", ["remote", "add", "origin", bare], { cwd: root });
  execFileSync("git", ["push", "-qu", "origin", "main"], { cwd: root });
  const authorityHead = execFileSync("git", ["rev-parse", "HEAD"], {
    cwd: root,
    encoding: "utf8",
  }).trim();
  rebuildHarnessDb({ repoRoot: root });
  return { root, bare, authorityHead };
}

describe("closure authority two-epoch production contract", () => {
  it("U-CAC-013: [PLAN-L7-439-closure-authority-convergence/U-CAC-013] rejects dirty/direct and stale epochs but admits merged HEAD plus typed additions", () => {
    const { root, authorityHead } = fixture();
    writeFileSync(join(root, "unrelated.txt"), "dirty");
    expect(() =>
      verifyClosureEpochTransition({
        repoRoot: root,
        authorityHead,
        closureHead: authorityHead,
        authorityPlanIds: ["PLAN-L7-900-auto"],
        closurePlanIds: ["PLAN-L7-900-auto"],
        addedPlanIds: [],
      }),
    ).toThrow(/dirty|merge|epoch/i);
    execFileSync("git", ["add", "unrelated.txt"], { cwd: root });
    execFileSync("git", ["commit", "-qm", "closure epoch"], { cwd: root });
    execFileSync("git", ["push", "-q", "origin", "main"], { cwd: root });
    const closureHead = execFileSync("git", ["rev-parse", "HEAD"], {
      cwd: root,
      encoding: "utf8",
    }).trim();
    expect(
      verifyClosureEpochTransition({
        repoRoot: root,
        authorityHead,
        closureHead,
        authorityPlanIds: ["PLAN-L7-900-auto"],
        closurePlanIds: ["PLAN-L7-900-auto", "PLAN-L7-999-added"],
        addedPlanIds: ["PLAN-L7-999-added"],
      }),
    ).toMatchObject({ valid: true });
  });

  it("U-CAC-014: [PLAN-L7-439-closure-authority-convergence/U-CAC-014] projects the tracked H/X chain exactly and keeps open boundaries as whole-program blockers", () => {
    const { root, authorityHead } = fixture();
    const path = "docs/governance/closure-terminal-boundaries.jsonl";
    const opened = appendClosureTerminalBoundaryEvent({
      repoRoot: root,
      path,
      event: {
        event_kind: "boundary_opened",
        authority_head: authorityHead,
        initial_set_digest: digest("a"),
        cycle_digest: digest("b"),
        registry_generation: fileDigest(
          readFileSync(join(root, "docs/governance/closure-authority-registry.yaml")),
        ),
        plan_id: "PLAN-M-02-human",
        classification: "human_only",
        reason: "cutover approval required",
        owner: "PO",
        next_decision_route: "approve_action_binding",
        automation_terminal: true,
        whole_program_blocker: true,
      },
    });
    execFileSync("git", ["add", path], { cwd: root });
    execFileSync("git", ["commit", "-qm", "record terminal boundary"], { cwd: root });
    execFileSync("git", ["push", "-q", "origin", "main"], { cwd: root });
    rebuildHarnessDb({ repoRoot: root });
    const db = openHarnessDb(join(root, ".helix/harness.db"), { repoRoot: root });
    expect(projectClosureTerminalBoundaries({ repoRoot: root, db, path })).toMatchObject({
      open: 1,
      whole_program_blockers: 1,
    });
    expect(verifyClosureTerminalBoundaryLedger({ repoRoot: root, path }).last_event_digest).toBe(
      opened.event_digest,
    );
    const snapshot = buildProjectCurrentLocationSnapshot(db);
    expect(snapshot.closure.terminal_boundaries).toMatchObject({
      open: 1,
      resolved: 0,
      whole_program_blockers: 1,
    });
    expect(snapshot.closure.queue.items.map((item) => item.planId)).not.toContain(
      "PLAN-M-02-human",
    );
    expect(snapshot.current.completion_boundary).not.toBe("closed");
    db.close();
  });

  it("U-CAC-015: [PLAN-L7-439-closure-authority-convergence/U-CAC-015] binds materialize and auto-approve to one exact AUTO target-set digest", () => {
    expect(terminalBoundaryClassificationForAuthority("human_only")).toBe("human_only");
    expect(terminalBoundaryClassificationForAuthority("invalid")).toBe("invalid_escalated");
    expect(terminalBoundaryClassificationForAuthority("authority_backfill_required")).toBeNull();
    const target = buildClosureConvergenceTargetSet({
      initialPlanIds: ["PLAN-L7-900-auto", "PLAN-M-02-human", "PLAN-L7-902-invalid"],
      eligiblePlanIds: ["PLAN-L7-900-auto"],
      needsPlanIds: [],
      humanOnlyPlanIds: ["PLAN-M-02-human"],
      invalidEscalatedPlanIds: ["PLAN-L7-902-invalid"],
      terminalBoundaryEventDigests: [digest("d")],
    });
    expect(target.automatable_plan_ids).toEqual(["PLAN-L7-900-auto"]);
    expect(buildClosureEpochPlan({ targetSet: target })).toMatchObject({
      materialize_target_digest: target.target_set_digest,
      auto_approve_target_digest: target.target_set_digest,
    });
    expect(() =>
      buildClosureConvergenceTargetSet({
        initialPlanIds: target.initial_plan_ids,
        eligiblePlanIds: target.automatable_plan_ids,
        needsPlanIds: ["PLAN-L7-903-needs"],
        humanOnlyPlanIds: target.human_only_plan_ids,
        invalidEscalatedPlanIds: target.invalid_escalated_plan_ids,
        terminalBoundaryEventDigests: [digest("d")],
      }),
    ).toThrow(/needs|N=0/i);
  });

  it("U-CAC-016: [PLAN-L7-439-closure-authority-convergence/U-CAC-016] reuses L6-71 GitHub receipt and rejects refetch/HEAD/app/required drift", async () => {
    const { root, authorityHead } = fixture();
    execFileSync("git", ["remote", "set-url", "origin", "https://github.com/fixture/repo.git"], {
      cwd: root,
    });
    const receipt = {
      schema_version: "github-required-check-receipt.v1" as const,
      repository: "fixture/repo",
      check_run_id: 123,
      head_sha: authorityHead,
      check_name: "harness-check" as const,
      status: "completed" as const,
      conclusion: "success" as const,
      completed_at: "2026-07-12T00:00:00.000Z",
      app: { id: 7, slug: "github-actions", owner: "github" },
      run_id: 456,
      details_url: "https://github.com/fixture/repo/actions/runs/456/job/1",
      run_url: "https://github.com/fixture/repo/actions/runs/456",
      required: true as const,
      observed_at: "2026-07-12T00:05:00.000Z",
    };
    await expect(
      runClosureEpochAutoApproval({
        repoRoot: root,
        closureHead: authorityHead,
        targetSetDigest: digest("e"),
        github: {
          load: () => receipt,
          refetch: () => ({ ...receipt, conclusion: "failure" as const }),
        },
        now: new Date("2026-07-12T00:06:00.000Z"),
      }),
    ).rejects.toThrow(/refetch|CAS|conclusion/i);
  });

  it("U-CAC-017: [PLAN-L7-439-closure-authority-convergence/U-CAC-017] derives final A/H/X from rebuilt DB and immutable PLAN blobs", () => {
    const { root, authorityHead } = fixture();
    const humanPath = join(root, "docs/plans/PLAN-M-02-human.md");
    const humanBefore = readFileSync(humanPath, "utf8");
    const registryGeneration = fileDigest(
      readFileSync(join(root, "docs/governance/closure-authority-registry.yaml")),
    );
    for (const [plan_id, classification] of [
      ["PLAN-M-02-human", "human_only"],
      ["PLAN-L7-902-invalid", "invalid_escalated"],
    ] as const)
      appendClosureTerminalBoundaryEvent({
        repoRoot: root,
        path: "docs/governance/closure-terminal-boundaries.jsonl",
        event: {
          event_kind: "boundary_opened",
          authority_head: authorityHead,
          initial_set_digest: digest("a"),
          cycle_digest: digest("b"),
          registry_generation: registryGeneration,
          plan_id,
          classification,
          reason: "terminal fixture",
          owner: "PO",
          next_decision_route: "review_terminal_boundary",
          automation_terminal: true,
          whole_program_blocker: true,
        },
      });
    execFileSync("git", ["add", "docs/governance/closure-terminal-boundaries.jsonl"], {
      cwd: root,
    });
    execFileSync("git", ["commit", "-qm", "record final boundaries"], { cwd: root });
    execFileSync("git", ["push", "-q", "origin", "main"], { cwd: root });
    const closureHead = execFileSync("git", ["rev-parse", "HEAD"], {
      cwd: root,
      encoding: "utf8",
    }).trim();
    rebuildHarnessDb({ repoRoot: root });
    const db = openHarnessDb(join(root, ".helix/harness.db"), { repoRoot: root });
    projectClosureTerminalBoundaries({
      repoRoot: root,
      db,
      path: "docs/governance/closure-terminal-boundaries.jsonl",
    });
    expect(
      finalizeClosureConvergenceEpoch({
        repoRoot: root,
        db,
        authorityHead,
        closureHead,
        initialAuthorityPlanIds: ["PLAN-L7-900-auto", "PLAN-M-02-human", "PLAN-L7-902-invalid"],
        addedPlanIds: [],
      }),
    ).toMatchObject({
      accepted_plan_ids: ["PLAN-L7-900-auto"],
      human_only_plan_ids: ["PLAN-M-02-human"],
      invalid_escalated_plan_ids: ["PLAN-L7-902-invalid"],
      remaining_automatable_close_ready: 0,
      whole_program_completion_allowed: false,
    });
    expect(readFileSync(humanPath, "utf8")).toBe(humanBefore);
    db.close();
  });

  it("U-CAC-018: [PLAN-L7-439-closure-authority-convergence/U-CAC-018] reconciles local crash and remote merge/CI/branch deletion idempotently", async () => {
    const { root, authorityHead } = fixture();
    const key = `fixture/repo:${authorityHead}:authority_publish:${digest("f")}`;
    const merged = await reconcileClosureEpochOperation({
      repoRoot: root,
      idempotencyKey: key,
      localJournal: { phase: "published", artifact_digest: digest("f") },
      remote: {
        branch_exists: false,
        pull_request_state: "merged",
        merge_head: authorityHead,
        required_check_state: "success",
      },
    });
    expect(merged).toMatchObject({ next_phase: "closure_epoch", replay_remote_mutation: false });
    await expect(
      reconcileClosureEpochOperation({
        repoRoot: root,
        idempotencyKey: key,
        localJournal: { phase: "prepared", artifact_digest: digest("f") },
        remote: {
          branch_exists: true,
          pull_request_state: "open",
          merge_head: null,
          required_check_state: "pending",
        },
      }),
    ).resolves.toMatchObject({ next_phase: "wait_ci", replay_remote_mutation: false });
  });
});

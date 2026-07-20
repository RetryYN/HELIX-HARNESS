import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { proposalDigest } from "../src/state-db/closure-authority-backfill";
import { verifyClosureAuthorityBackfillProductionBundle } from "../src/state-db/closure-authority-backfill-verifier";
import { buildClosureAuthorityCurrentPartition } from "../src/state-db/closure-authority-convergence-production";
import { closureCommandDedupeKey } from "../src/state-db/closure-evidence-runner";
import { openHarnessDb } from "../src/state-db/index";
import { rebuildHarnessDb } from "../src/state-db/projection-writer";

const cliPath = join(import.meta.dirname, "../src/cli.ts");
const digest = (value: string) =>
  `sha256:${createHash("sha256").update(value).digest("hex")}` as const;

function productionFixture(options: { humanOnly?: boolean } = {}) {
  const root = mkdtempSync(join(tmpdir(), "helix-closure-convergence-"));
  const bare = mkdtempSync(join(tmpdir(), "helix-closure-convergence-origin-"));
  mkdirSync(join(root, "docs/plans"), { recursive: true });
  mkdirSync(join(root, "docs/design/harness/L6-function-design"), { recursive: true });
  mkdirSync(join(root, "docs/governance"), { recursive: true });
  mkdirSync(join(root, "docs/test-design/harness"), { recursive: true });
  mkdirSync(join(root, "tests"), { recursive: true });
  writeFileSync(join(root, ".gitignore"), ".helix/\n");
  writeFileSync(
    join(root, "docs/governance/closure-authority-registry.yaml"),
    "schema_version: closure-authority-registry.v1\nauthorities: []\n",
  );
  writeFileSync(join(root, "docs/governance/closure-terminal-boundaries.jsonl"), "");
  writeFileSync(
    join(root, "docs/governance/closure-gate-allowlist.yaml"),
    'schema_version: closure-gate-allowlist.v1\ngates:\n  g7: { command_id: g7, command: "helix gate G7" }\n',
  );
  writeFileSync(
    join(root, "docs/test-design/harness/L8-unit-test-design.md"),
    "| U-ID | 対象 | 反例と期待結果 | test citation |\n| --- | --- | --- | --- |\n| U-CONV-001 | convergence | exact | `tests/convergence-001.test.ts` |\n| U-CONV-002 | human boundary | exact | `tests/convergence-002.test.ts` |\n",
  );
  writeFileSync(
    join(root, "docs/design/harness/L6-function-design/convergence.md"),
    '---\nstatus: confirmed\nclosure_authority:\n  capabilities: [local_plan_status]\n  gates:\n    - { gate_id: g7, command_id: g7, command: "helix gate G7" }\n---\nU-CONV-001\n',
  );
  writeFileSync(
    join(root, "docs/design/harness/L6-function-design/convergence-human.md"),
    '---\nstatus: confirmed\nclosure_authority:\n  capabilities: [external_publish]\n  gates:\n    - { gate_id: g7, command_id: g7, command: "helix gate G7" }\n---\nU-CONV-002\n',
  );
  if (!options.humanOnly)
    writeFileSync(
      join(root, "tests/convergence-001.test.ts"),
      'test("[PLAN-L7-900-automatable/U-CONV-001] exact", () => {});\n',
    );
  writeFileSync(
    join(root, "tests/convergence-002.test.ts"),
    'test("[PLAN-L7-901-human-only/U-CONV-002] exact", () => {});\n',
  );
  const validPlan = (
    planId: string,
    oracle: string,
    testPath: string,
    designPath: string,
    extra = "",
  ) =>
    `---\nplan_id: ${planId}\nkind: impl\nlayer: L7\ndrive: agent\nstatus: confirmed\nparent_design: ${designPath}\npair_artifact: docs/test-design/harness/L8-unit-test-design.md\nverification_bindings:\n  - { oracle_id: ${oracle}, parent_design: ${designPath}, test_path: ${testPath} }\ngenerates:\n  - { artifact_path: ${testPath}, artifact_type: test_code }\nreview_evidence:\n  - reviewer: reviewer-b\n    review_kind: cross_agent\n    reviewed_at: "2026-07-12T00:${oracle.endsWith("1") ? "30" : "31"}:00.000Z"\n    tests_green_at: "2026-07-12T00:${oracle.endsWith("1") ? "30" : "31"}:00.000Z"\n    verdict: approve\n    worker_model: worker-a\n    reviewer_model: reviewer-b\n    green_commands:\n      - { kind: unit_test, command: "npx --no-install vitest run ${testPath}", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-07-12T00:${oracle.endsWith("1") ? "30" : "31"}:00.000Z", evidence_path: ${testPath}, output_digest: "sha256:${(oracle.endsWith("1") ? "a" : "b").repeat(64)}" }\n${extra}---\n`;
  if (!options.humanOnly)
    writeFileSync(
      join(root, "docs/plans/PLAN-L7-900-automatable.md"),
      validPlan(
        "PLAN-L7-900-automatable",
        "U-CONV-001",
        "tests/convergence-001.test.ts",
        "docs/design/harness/L6-function-design/convergence.md",
      ),
    );
  writeFileSync(
    join(root, "docs/plans/PLAN-L7-901-human-only.md"),
    validPlan(
      "PLAN-L7-901-human-only",
      "U-CONV-002",
      "tests/convergence-002.test.ts",
      "docs/design/harness/L6-function-design/convergence-human.md",
      "action_binding_approval: required\n",
    ),
  );
  execFileSync("git", ["init", "-q", "--bare", bare]);
  execFileSync("git", ["init", "-q", "-b", "main"], { cwd: root });
  execFileSync("git", ["config", "user.email", "fixture@example.invalid"], { cwd: root });
  execFileSync("git", ["config", "user.name", "fixture"], { cwd: root });
  execFileSync("git", ["add", "."], { cwd: root });
  execFileSync("git", ["commit", "-qm", "fixture"], { cwd: root });
  execFileSync("git", ["remote", "add", "origin", bare], { cwd: root });
  execFileSync("git", ["push", "-qu", "origin", "main"], { cwd: root });
  const head = execFileSync("git", ["rev-parse", "HEAD"], {
    cwd: root,
    encoding: "utf8",
  }).trim();
  rebuildHarnessDb({ repoRoot: root });
  const db = openHarnessDb(join(root, ".helix/harness.db"), { repoRoot: root });
  const collected = options.humanOnly
    ? [["PLAN-L7-901-human-only", "U-CONV-002", "tests/convergence-002.test.ts"]]
    : [
        ["PLAN-L7-900-automatable", "U-CONV-001", "tests/convergence-001.test.ts"],
        ["PLAN-L7-901-human-only", "U-CONV-002", "tests/convergence-002.test.ts"],
      ];
  for (const [planId, oracle, testPath] of collected) {
    const stdout = JSON.stringify({
      testResults: [
        { assertionResults: [{ fullName: `[${planId}/${oracle}] exact`, status: "passed" }] },
      ],
    });
    const key = digest(`receipt:${planId}`);
    const evidenceDir = join(root, ".helix/evidence/process-receipts");
    mkdirSync(evidenceDir, { recursive: true });
    const stdoutPath = `.helix/evidence/process-receipts/${key.slice(7)}.stdout`;
    const stderrPath = `.helix/evidence/process-receipts/${key.slice(7)}.stderr`;
    writeFileSync(join(root, stdoutPath), stdout);
    writeFileSync(join(root, stderrPath), "");
    db.prepare(
      "INSERT INTO closure_process_receipts (process_receipt_key,schema_version,materialization_id,kind,repository_head,executable,argv_json,dedupe_key,exit_code,signal,timed_out,stdout_digest,stderr_digest,stdout_path,stderr_path,completed_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
    ).run(
      key,
      "closure-process-receipt.v1",
      `mat-${oracle}`,
      "test",
      head,
      "npx",
      JSON.stringify(["--no-install", "vitest", "run", testPath, "--reporter=json"]),
      closureCommandDedupeKey(head, {
        kind: "test",
        executable: "npx",
        argv: ["--no-install", "vitest", "run", testPath, "--reporter=json"],
      }),
      0,
      null,
      0,
      digest(stdout),
      digest(""),
      stdoutPath,
      stderrPath,
      new Date(Date.now() - 1_000).toISOString(),
    );
  }
  db.close();
  return { root, head };
}

function run(root: string, args: string[]) {
  return spawnSync(
    "npx",
    ["--prefix", process.cwd(), "--no-install", "tsx", cliPath, "closure", ...args],
    {
      cwd: root,
      encoding: "utf8",
      env: { ...process.env, HELIX_SKIP_UPDATE_CHECK: "1" },
    },
  );
}

function writeArtifact(root: string, path: string, value: unknown) {
  const absolute = join(root, path);
  mkdirSync(join(absolute, ".."), { recursive: true });
  writeFileSync(absolute, `${JSON.stringify(value)}\n`);
  return path;
}

function createIndependentReviewReceipt(input: {
  root: string;
  head: string;
  proposal: string;
  draft: string;
  receipt: string;
}) {
  const draftValue = JSON.parse(readFileSync(join(input.root, input.draft), "utf8"));
  const proposalValue = JSON.parse(readFileSync(join(input.root, input.proposal), "utf8"));
  const verificationDb = openHarnessDb(join(input.root, ".helix/harness.db"), {
    repoRoot: input.root,
  });
  const verification = verifyClosureAuthorityBackfillProductionBundle({
    repoRoot: input.root,
    db: verificationDb,
    bundle: proposalValue.bundle,
    gateAllowlistPath: "docs/governance/closure-gate-allowlist.yaml",
    now: draftValue.created_at,
  });
  verificationDb
    .prepare(
      "INSERT INTO session_events (event_key,event_id,schema_version,operation_id,session_id,event_seq,plan_id,event_kind,next_action,memory_ref,recorded_at,payload_hash) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",
    )
    .run(
      "fixture-review-event",
      "fixture-review-complete",
      "session-event.v1",
      draftValue.worker_identity,
      "reviewer-b",
      1,
      null,
      "subagent_completed",
      null,
      null,
      draftValue.created_at,
      verification.source_digest,
    );
  verificationDb.close();
  const verdicts = proposalValue.bundle.decisions.flatMap(
    (decision: { plan_id: string; classification: string; proposal?: unknown }) =>
      decision.classification === "eligible_proposal"
        ? [
            {
              plan_id: decision.plan_id,
              proposal_digest: proposalDigest(decision.proposal),
              recomputed_proposal_digest: proposalDigest(decision.proposal),
              verdict: "approve",
            },
          ]
        : [],
  );
  const evidence = writeArtifact(input.root, `${input.receipt}.task.json`, {
    schema_version: "closure-authority-review-task-completion.v1",
    task_identity: draftValue.task_identity,
    worker_identity: draftValue.worker_identity,
    reviewer_identity: "reviewer-b",
    review_kind: "intra_runtime_subagent",
    completed_at: draftValue.created_at,
    repository_head: input.head,
    proposal_digest: draftValue.proposal_digest,
    bundle_digest: draftValue.bundle_digest,
    review_scope_digest: draftValue.review_scope_digest,
    registry_digest: draftValue.registry_digest,
    recompute_evidence_digest: verification.source_digest,
    identity_evidence: {
      schema_version: "closure-backfill-intra-runtime-review.v1",
      worker_task_id: draftValue.worker_identity,
      reviewer_task_id: "reviewer-b",
      termination_event_id: "fixture-review-complete",
      termination_status: "completed",
      repository_head: input.head,
      bundle_digest: draftValue.bundle_digest,
      recompute_evidence_digest: verification.source_digest,
    },
    verdicts,
  });
  return run(input.root, [
    "authority-review-record",
    "--draft",
    input.draft,
    "--review-evidence",
    evidence,
    "--out",
    input.receipt,
    "--json",
  ]);
}

describe("closure authority convergence production orchestration", () => {
  it("U-CAC-009: [PLAN-L7-439-closure-authority-convergence/U-CAC-009] proposal→draft→独立task evidence→atomic receiptをproduction CLIで接続しself-approvalを拒否する", () => {
    const { root, head } = productionFixture();
    const proposal = ".helix/evidence/proposal.json";
    const proposed = run(root, [
      "authority-backfill",
      "--dry-run",
      "--from-db",
      "--expected-head",
      head,
      "--out",
      proposal,
      "--json",
    ]);
    expect(proposed.status, proposed.stderr).toBe(0);
    const draft = ".helix/evidence/review-draft.json";
    const draftResult = run(root, [
      "authority-review-draft",
      "--proposal",
      proposal,
      "--out",
      draft,
      "--json",
    ]);
    expect(draftResult.status, draftResult.stderr).toBe(0);
    expect(existsSync(join(root, draft))).toBe(true);

    const draftValue = JSON.parse(readFileSync(join(root, draft), "utf8"));
    const proposalValue = JSON.parse(readFileSync(join(root, proposal), "utf8"));
    const verdicts = proposalValue.bundle.decisions.flatMap(
      (decision: { plan_id: string; classification: string; proposal?: unknown }) =>
        decision.classification === "eligible_proposal"
          ? [
              {
                plan_id: decision.plan_id,
                proposal_digest: proposalDigest(decision.proposal),
                recomputed_proposal_digest: proposalDigest(decision.proposal),
                verdict: "approve",
              },
            ]
          : [],
    );
    const evidence = writeArtifact(root, ".helix/evidence/task-completion.json", {
      schema_version: "closure-authority-review-task-completion.v1",
      task_identity: draftValue.task_identity,
      worker_identity: draftValue.worker_identity,
      reviewer_identity: "reviewer-b",
      review_kind: "intra_runtime_subagent",
      completed_at: draftValue.created_at,
      repository_head: head,
      proposal_digest: draftValue.proposal_digest,
      bundle_digest: draftValue.bundle_digest,
      review_scope_digest: draftValue.review_scope_digest,
      registry_digest: draftValue.registry_digest,
      recompute_evidence_digest: proposalValue.bundle.bundle_digest,
      identity_evidence: {
        schema_version: "closure-backfill-intra-runtime-review.v1",
        worker_task_id: draftValue.worker_identity,
        reviewer_task_id: "reviewer-b",
        termination_event_id: "fixture-review-complete",
        termination_status: "completed",
        repository_head: head,
        bundle_digest: draftValue.bundle_digest,
        recompute_evidence_digest: proposalValue.bundle.bundle_digest,
      },
      verdicts,
    });
    const receipt = ".helix/evidence/review-receipt.json";
    const record = run(root, [
      "authority-review-record",
      "--draft",
      draft,
      "--review-evidence",
      evidence,
      "--out",
      receipt,
      "--json",
    ]);
    expect(record.status, record.stderr).toBe(0);
    expect(existsSync(join(root, receipt))).toBe(true);
    const recovered = run(root, [
      "authority-review-record",
      "--draft",
      draft,
      "--review-evidence",
      evidence,
      "--out",
      receipt,
      "--json",
    ]);
    expect(recovered.status, recovered.stderr).toBe(0);
    expect(JSON.parse(recovered.stdout)).toMatchObject({ path: receipt });

    const selfApproval = writeArtifact(root, ".helix/evidence/self-review.json", {
      ...JSON.parse(readFileSync(join(root, evidence), "utf8")),
      reviewer_identity: draftValue.worker_identity,
    });
    const rejected = run(root, [
      "authority-review-record",
      "--draft",
      draft,
      "--review-evidence",
      selfApproval,
      "--out",
      ".helix/evidence/self-receipt.json",
      "--json",
    ]);
    expect(rejected).toMatchObject({ status: 2, stdout: "" });
    expect(rejected.stderr).toMatch(/self[- ]approval/i);
  });

  it("U-CAC-010: [PLAN-L7-439-closure-authority-convergence/U-CAC-010] irreversible PLANをhuman_onlyへ固定しapply対象への自動昇格を拒否する", () => {
    const { root, head } = productionFixture({ humanOnly: true });
    const proposal = ".helix/evidence/human-boundary-proposal.json";
    const result = run(root, [
      "authority-backfill",
      "--dry-run",
      "--from-db",
      "--expected-head",
      head,
      "--out",
      proposal,
      "--json",
    ]);
    expect(result.status, result.stderr).toBe(0);
    const runValue = JSON.parse(readFileSync(join(root, proposal), "utf8"));
    const human = runValue.bundle.decisions.find(
      (decision: { plan_id: string }) => decision.plan_id === "PLAN-L7-901-human-only",
    );
    expect(human, `${root}:${JSON.stringify(human)}`).toMatchObject({
      classification: "human_only",
      proposal: null,
    });
  });

  it("U-CAC-011: [PLAN-L7-439-closure-authority-convergence/U-CAC-011] cycleごとのdisjoint partitionと終端保存則をledgerで証明する", () => {
    const { root, head } = productionFixture();
    const proposal = ".helix/evidence/partition-proposal.json";
    const proposed = run(root, [
      "authority-backfill",
      "--dry-run",
      "--from-db",
      "--expected-head",
      head,
      "--out",
      proposal,
      "--json",
    ]);
    expect(proposed.status, proposed.stderr).toBe(0);
    const value = JSON.parse(readFileSync(join(root, proposal), "utf8"));
    const partition = buildClosureAuthorityCurrentPartition({
      initial_plan_ids: value.candidate_plan_ids,
      decisions: value.bundle.decisions,
    });
    expect(partition).toMatchObject({
      eligible_plan_ids: ["PLAN-L7-900-automatable"],
      needs_plan_ids: [],
      human_only_plan_ids: ["PLAN-L7-901-human-only"],
      invalid_escalated_plan_ids: [],
    });
    expect(
      new Set([
        ...partition.eligible_plan_ids,
        ...partition.needs_plan_ids,
        ...partition.human_only_plan_ids,
        ...partition.invalid_escalated_plan_ids,
      ]),
    ).toEqual(new Set(value.candidate_plan_ids));
  });

  it("U-CAC-012: [PLAN-L7-439-closure-authority-convergence/U-CAC-012] real Git/persistent DBでapply crash後に同windowをresumeする", () => {
    const { root, head } = productionFixture();
    const proposal = ".helix/evidence/resume-proposal.json";
    const proposed = run(root, [
      "authority-backfill",
      "--dry-run",
      "--from-db",
      "--expected-head",
      head,
      "--out",
      proposal,
      "--json",
    ]);
    expect(proposed.status, proposed.stderr).toBe(0);
    const draft = ".helix/evidence/resume-draft.json";
    expect(
      run(root, ["authority-review-draft", "--proposal", proposal, "--out", draft, "--json"])
        .status,
    ).toBe(0);
    const resumeReceipt = ".helix/evidence/resume-receipt.json";
    const reviewed = createIndependentReviewReceipt({
      root,
      head,
      proposal,
      draft,
      receipt: resumeReceipt,
    });
    expect(reviewed.status, reviewed.stderr).toBe(0);
    const first = run(root, [
      "authority-backfill-apply",
      "--execute",
      "--from-db",
      "--proposal",
      proposal,
      "--review-receipt",
      resumeReceipt,
      "--expected-head",
      head,
      "--offset",
      "0",
      "--limit",
      "1",
      "--failpoint",
      "after-marker",
      "--json",
    ]);
    expect(first.status).not.toBe(0);
    expect(first.stderr).toMatch(/injected crash after-marker/);
    const resumed = run(root, [
      "authority-backfill-apply",
      "--execute",
      "--from-db",
      "--proposal",
      proposal,
      "--review-receipt",
      resumeReceipt,
      "--expected-head",
      head,
      "--offset",
      "0",
      "--limit",
      "1",
      "--resume",
      "--json",
    ]);
    expect(resumed.status, resumed.stderr).toBe(0);
    expect(`${first.stderr}\n${resumed.stderr}`).not.toMatch(/authority-converge/);
    const secondWindow = run(root, [
      "authority-backfill-apply",
      "--execute",
      "--from-db",
      "--proposal",
      proposal,
      "--review-receipt",
      resumeReceipt,
      "--expected-head",
      head,
      "--offset",
      "1",
      "--limit",
      "1",
      "--json",
    ]);
    expect(secondWindow.status, secondWindow.stderr).toBe(0);
    expect(JSON.parse(secondWindow.stdout)).toMatchObject({ applied_plan_ids: [] });
    const cycles = readFileSync(
      join(root, ".helix/evidence/closure-authority-backfill/cycles.jsonl"),
      "utf8",
    )
      .trim()
      .split("\n")
      .map((line) => JSON.parse(line));
    expect(cycles).toHaveLength(2);
    expect(cycles[0]).toMatchObject({
      window_offset: 0,
      window_limit: 1,
      window_plan_ids: ["PLAN-L7-900-automatable"],
      applied_plan_ids: ["PLAN-L7-900-automatable"],
    });
    expect(cycles[1]).toMatchObject({
      window_offset: 1,
      window_limit: 1,
      window_plan_ids: ["PLAN-L7-901-human-only"],
      applied_plan_ids: [],
    });
    const terminalEvents = readFileSync(
      join(root, "docs/governance/closure-terminal-boundaries.jsonl"),
      "utf8",
    )
      .trim()
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line));
    expect(terminalEvents).toHaveLength(1);
    expect(terminalEvents[0]).toMatchObject({
      event_kind: "boundary_opened",
      plan_id: "PLAN-L7-901-human-only",
      classification: "human_only",
      automation_terminal: true,
      whole_program_blocker: true,
    });
    const dbPath = join(root, ".helix/harness.db");
    const reopened = openHarnessDb(dbPath, { repoRoot: root });
    expect(
      reopened
        .prepare("SELECT status FROM plan_registry WHERE plan_id = ?")
        .get("PLAN-L7-901-human-only"),
    ).toMatchObject({ status: "confirmed" });
    reopened.close();
  });
});

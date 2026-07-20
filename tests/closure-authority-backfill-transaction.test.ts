import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import {
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { stringify as stringifyYaml } from "yaml";
import type { ClosureAuthority } from "../src/policy/closure-authority-registry";
import {
  type ApplyClosureAuthorityBackfillInput,
  applyClosureAuthorityBackfill,
  type ClosureAuthorityBackfillApplyBundle,
  closureAuthorityBackfillWindowDigest,
  normalizeClosureAuthorityBackfillWindow,
  proposalDigest,
  proposalSetDigest,
  reviewVerdictDigest,
  validateClosureAuthorityBackfillReview,
} from "../src/state-db/closure-authority-backfill";

vi.mock("../src/state-db/closure-authority-backfill-verifier", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../src/state-db/closure-authority-backfill-verifier")>();
  return {
    ...actual,
    verifyClosureAuthorityBackfillProductionBundle: vi.fn(() => ({
      verified: true as const,
      source_digest: `sha256:${"f".repeat(64)}`,
    })),
  };
});

const digest = (value: string | Buffer) =>
  `sha256:${createHash("sha256").update(value).digest("hex")}` as const;
const NOW = "2026-07-12T01:00:00.000Z";
const HEAD = "a".repeat(40);

function reviewVerdicts(bundle: ClosureAuthorityBackfillApplyBundle) {
  return bundle.decisions.flatMap((row) =>
    row.proposal
      ? [
          {
            plan_id: row.plan_id,
            proposal_digest: proposalDigest(row.proposal),
            recomputed_proposal_digest: proposalDigest(row.proposal),
            verdict: "approve" as const,
          },
        ]
      : [],
  );
}

function authorityArtifact(bundle: ClosureAuthorityBackfillApplyBundle): string {
  return JSON.stringify({
    schema_version: "closure-backfill-cross-runtime-authority.v1",
    worker_run_id: "worker-run-1",
    reviewer_run_id: "authority-receipt-1",
    worker_runtime: "worker-a",
    reviewer_runtime: "reviewer-b",
    review_task_id: "receipt-0001",
    worker_scope_plan_id: bundle.candidate_plan_ids[0],
    reviewer_scope_plan_id: bundle.candidate_plan_ids[0],
    repository_head: bundle.repository_head,
    bundle_digest: bundle.bundle_digest,
    proposal_set_digest: proposalSetDigest(
      bundle.decisions.flatMap((row) =>
        row.proposal ? [{ plan_id: row.plan_id, digest: proposalDigest(row.proposal) }] : [],
      ),
    ),
    recompute_evidence_digest: `sha256:${"f".repeat(64)}`,
    worker_completed_at: "2026-07-12T00:20:00.000Z",
    reviewer_completed_at: "2026-07-12T00:30:00.000Z",
    completed_at: "2026-07-12T00:30:00.000Z",
    verdict: "approve",
    verdicts: reviewVerdicts(bundle),
  });
}

function reviewDbRow(bundle: ClosureAuthorityBackfillApplyBundle) {
  return {
    receipt_id: "receipt-0001",
    worker_run_id: "worker-run-1",
    reviewer_run_id: "authority-receipt-1",
    artifact_path: ".helix/evidence/review-authority.json",
    artifact_digest: digest(authorityArtifact(bundle)),
    repository_head: bundle.repository_head,
    bundle_digest: bundle.bundle_digest,
    proposal_set_digest: receipt(bundle).proposal_set_digest,
    recompute_digest: `sha256:${"f".repeat(64)}`,
    verdict_digest: reviewVerdictDigest(receipt(bundle).verdicts),
    status: "completed",
    exit_code: 0,
    completed_at: "2026-07-12T00:30:00.000Z",
  };
}

function fixture(planId = "PLAN-L7-900-first") {
  const root = mkdtempSync(join(tmpdir(), "closure-backfill-"));
  const registryPath = "docs/governance/closure-authority-registry.yaml";
  mkdirSync(join(root, "docs/governance"), { recursive: true });
  mkdirSync(join(root, "docs/plans"), { recursive: true });
  mkdirSync(join(root, ".helix"), { recursive: true });
  writeFileSync(join(root, ".helix/harness.db"), "canonical-db-state");
  mkdirSync(join(root, ".helix/evidence"), { recursive: true });
  const planPath = `docs/plans/${planId}.md`;
  const planBytes = `---\nplan_id: ${planId}\n---\n# fixture\n`;
  writeFileSync(join(root, planPath), planBytes);
  const registryBytes = stringifyYaml({
    schema_version: "closure-authority-registry.v1",
    authorities: [],
  });
  writeFileSync(join(root, registryPath), registryBytes);
  const proposal: ClosureAuthority = {
    plan_id: planId,
    source_path: planPath,
    source_digest: digest(planBytes),
    capabilities: ["local_plan_status"],
    bindings: [
      {
        oracle_id: "U-CABF-006",
        parent_design: "docs/design/example.md",
        test_path: "tests/example.test.ts",
      },
    ],
    gates: [{ gate_id: "g7", command_id: "g7", command: "helix gate G7" }],
    migration_reason: null,
  };
  const bundle: ClosureAuthorityBackfillApplyBundle = {
    repository_head: HEAD,
    registry_digest: digest(registryBytes),
    review_scope_digest: digest("scope"),
    bundle_digest: digest("bundle"),
    candidate_plan_ids: [planId],
    decisions: [
      {
        plan_id: planId,
        classification: "eligible_proposal",
        reason: "exact authority",
        required_action: "review",
        proposal,
      },
    ],
  };
  writeFileSync(join(root, ".helix/evidence/review-authority.json"), authorityArtifact(bundle));
  return { root, registryPath, registryBytes, proposal, bundle };
}

function receipt(bundle: ClosureAuthorityBackfillApplyBundle) {
  const proposals = bundle.decisions.flatMap((row) =>
    row.proposal ? [{ plan_id: row.plan_id, digest: proposalDigest(row.proposal) }] : [],
  );
  return {
    schema_version: "closure-authority-backfill-review.v1",
    receipt_id: "receipt-0001",
    worker_identity: "worker-a",
    reviewer_identity: "reviewer-b",
    review_kind: "cross_runtime",
    identity_evidence: {
      schema_version: "closure-backfill-cross-runtime-review.v1",
      worker_runtime: "worker-a",
      reviewer_runtime: "reviewer-b",
      worker_run_id: "worker-run-1",
      authority_receipt_id: "authority-receipt-1",
      authority_receipt_path: ".helix/evidence/review-authority.json",
      authority_receipt_digest: digest(authorityArtifact(bundle)),
      recompute_evidence_digest: `sha256:${"f".repeat(64)}`,
      repository_head: bundle.repository_head,
      bundle_digest: bundle.bundle_digest,
    },
    reviewed_at: "2026-07-12T00:30:00.000Z",
    expires_at: "2026-07-12T01:30:00.000Z",
    repository_head: bundle.repository_head,
    review_scope_digest: bundle.review_scope_digest,
    registry_digest: bundle.registry_digest,
    bundle_digest: bundle.bundle_digest,
    proposal_set_digest: proposalSetDigest(proposals),
    verdicts: reviewVerdicts(bundle),
  };
}

function apply(
  input: ApplyClosureAuthorityBackfillInput,
  reviewRowOverride: Record<string, unknown> = {},
) {
  const evidence = (input.receipt as ReturnType<typeof receipt>).identity_evidence as Record<
    string,
    unknown
  >;
  const db = {
    prepare: (sql: string) => ({
      get: (id: string) =>
        sql.includes("session_events")
          ? {
              event_id: "termination-event-1",
              operation_id: "worker-task-1",
              session_id: "reviewer-task-2",
              event_kind: "subagent_completed",
              payload_hash: evidence.recompute_evidence_digest,
              recorded_at: "2026-07-12T00:30:00.000Z",
            }
          : sql.includes("closure_authority_review_receipts")
            ? { ...reviewDbRow(input.bundle), ...reviewRowOverride }
            : id === "worker-run-1"
              ? {
                  run_id: id,
                  runtime: "worker-a",
                  role: "worker",
                  plan_id: input.bundle.candidate_plan_ids[0],
                  completed_at: "2026-07-12T00:20:00.000Z",
                  evidence_path: "worker",
                }
              : {
                  run_id: "authority-receipt-1",
                  runtime: "reviewer-b",
                  role: "reviewer",
                  plan_id: input.bundle.candidate_plan_ids[0],
                  completed_at: "2026-07-12T00:30:00.000Z",
                  evidence_path: ".helix/evidence/review-authority.json",
                },
    }),
  } as unknown as Parameters<typeof applyClosureAuthorityBackfill>[0]["db"];
  return applyClosureAuthorityBackfill({
    ...input,
    bundle: input.bundle as Parameters<typeof applyClosureAuthorityBackfill>[0]["bundle"],
    db,
    gateAllowlistPath: "docs/governance/closure-gate-allowlist.yaml",
  });
}

describe("closure authority backfill transaction", () => {
  it("U-CABF-WINDOW: full bundleを維持した正規windowだけを受理する", () => {
    const { bundle } = fixture("PLAN-L7-919-window-contract");
    expect(normalizeClosureAuthorityBackfillWindow(bundle)).toMatchObject({
      offset: 0,
      plan_ids: bundle.candidate_plan_ids,
      expected_registry_digest: bundle.registry_digest,
    });
    const oversized = {
      ...bundle,
      candidate_plan_ids: Array.from(
        { length: 101 },
        (_, index) => `PLAN-L7-${1000 + index}-window`,
      ),
    };
    expect(() => normalizeClosureAuthorityBackfillWindow(oversized)).toThrow(/window is required/);
    const planIds = [...bundle.candidate_plan_ids];
    const valid = {
      offset: 0,
      limit: 1,
      plan_ids: planIds,
      expected_registry_digest: bundle.registry_digest,
      previous_cycle_digest: null,
      window_digest: closureAuthorityBackfillWindowDigest({
        offset: 0,
        limit: 1,
        plan_ids: planIds,
        bundle_digest: bundle.bundle_digest,
      }),
    };
    expect(normalizeClosureAuthorityBackfillWindow(bundle, valid)).toEqual(valid);
    expect(() =>
      normalizeClosureAuthorityBackfillWindow(bundle, {
        ...valid,
        window_digest: `sha256:${"0".repeat(64)}`,
      }),
    ).toThrow(/window digest/);
    expect(() => normalizeClosureAuthorityBackfillWindow(bundle, { ...valid, offset: 1 })).toThrow(
      /order\/cardinality/,
    );
  });
  it("U-CABF-006: [PLAN-L7-435-closure-authority-backfill/U-CABF-006] strict independent reviewをexact digest/cardinalityとTTLへ束縛する", () => {
    const value = fixture();
    const { bundle } = value;
    expect(
      validateClosureAuthorityBackfillReview({ bundle, receipt: receipt(bundle), now: NOW }),
    ).toBeTruthy();
    expect(() =>
      validateClosureAuthorityBackfillReview({
        bundle,
        receipt: { ...receipt(bundle), reviewer_identity: "worker-a" },
        now: NOW,
      }),
    ).toThrow(/identity/);
    const intra = {
      ...receipt(bundle),
      review_kind: "intra_runtime_subagent",
      worker_identity: "worker-task-1",
      reviewer_identity: "reviewer-task-2",
      identity_evidence: {
        schema_version: "closure-backfill-intra-runtime-review.v1",
        worker_task_id: "worker-task-1",
        reviewer_task_id: "reviewer-task-2",
        termination_event_id: "termination-event-1",
        termination_status: "completed",
        repository_head: bundle.repository_head,
        bundle_digest: bundle.bundle_digest,
        recompute_evidence_digest: `sha256:${"f".repeat(64)}`,
      },
    };
    const intraApply = fixture("PLAN-L7-904-intra-review");
    const validIntra = {
      ...intra,
      registry_digest: intraApply.bundle.registry_digest,
      bundle_digest: intraApply.bundle.bundle_digest,
      proposal_set_digest: receipt(intraApply.bundle).proposal_set_digest,
      verdicts: receipt(intraApply.bundle).verdicts,
      identity_evidence: {
        ...intra.identity_evidence,
        bundle_digest: intraApply.bundle.bundle_digest,
      },
    };
    expect(
      apply({
        repoRoot: intraApply.root,
        registryPath: intraApply.registryPath,
        bundle: intraApply.bundle,
        receipt: validIntra,
        now: NOW,
      }).applied_plan_ids,
    ).toEqual([intraApply.proposal.plan_id]);
    const fictionalIntra = fixture("PLAN-L7-905-fictional-intra");
    const badIntra = {
      ...validIntra,
      registry_digest: fictionalIntra.bundle.registry_digest,
      bundle_digest: fictionalIntra.bundle.bundle_digest,
      proposal_set_digest: receipt(fictionalIntra.bundle).proposal_set_digest,
      verdicts: receipt(fictionalIntra.bundle).verdicts,
      identity_evidence: {
        ...validIntra.identity_evidence,
        termination_event_id: "fictional-event",
        bundle_digest: fictionalIntra.bundle.bundle_digest,
      },
    };
    expect(() =>
      apply({
        repoRoot: fictionalIntra.root,
        registryPath: fictionalIntra.registryPath,
        bundle: fictionalIntra.bundle,
        receipt: badIntra,
        now: NOW,
      }),
    ).toThrow(/termination event exact join/);
    const fictional = fixture("PLAN-L7-902-fictional-review");
    expect(() =>
      apply({
        repoRoot: fictional.root,
        registryPath: fictional.registryPath,
        bundle: fictional.bundle,
        receipt: {
          ...receipt(fictional.bundle),
          identity_evidence: {
            ...receipt(fictional.bundle).identity_evidence,
            authority_receipt_id: "fictional-model-run",
          },
        },
        now: NOW,
      }),
    ).toThrow(/exact join/);
    for (const [name, mutate] of [
      [
        "wrong-verdict",
        (artifact: Record<string, unknown>) => ({ ...artifact, verdict: "reject" }),
      ],
      [
        "old-completion",
        (artifact: Record<string, unknown>) => ({
          ...artifact,
          worker_completed_at: "2026-07-11T20:00:00.000Z",
        }),
      ],
    ] as const) {
      const invalid = fixture(`PLAN-L7-907-${name}`);
      const artifactPath = join(invalid.root, ".helix/evidence/review-authority.json");
      const changedArtifact = JSON.stringify(
        mutate(JSON.parse(readFileSync(artifactPath, "utf8")) as Record<string, unknown>),
      );
      writeFileSync(artifactPath, changedArtifact);
      const baseReceipt = receipt(invalid.bundle);
      expect(() =>
        apply({
          repoRoot: invalid.root,
          registryPath: invalid.registryPath,
          bundle: invalid.bundle,
          receipt: {
            ...baseReceipt,
            identity_evidence: {
              ...baseReceipt.identity_evidence,
              authority_receipt_digest: digest(changedArtifact),
            },
          },
          now: NOW,
        }),
      ).toThrow(/literal|exact join/);
    }
    for (const override of [
      { artifact_digest: digest("wrong-db-digest") },
      { status: "failed" },
      { exit_code: 1 },
    ]) {
      const invalidDb = fixture(`PLAN-L7-908-invalid-db-${Object.keys(override)[0]}`);
      expect(() =>
        apply(
          {
            repoRoot: invalidDb.root,
            registryPath: invalidDb.registryPath,
            bundle: invalidDb.bundle,
            receipt: receipt(invalidDb.bundle),
            now: NOW,
          },
          override,
        ),
      ).toThrow(/exact join/);
    }
    expect(() =>
      validateClosureAuthorityBackfillReview({
        bundle,
        receipt: { ...receipt(bundle), expires_at: "2026-07-12T02:30:01.000Z" },
        now: NOW,
      }),
    ).toThrow(/TTL/);
    expect(() =>
      validateClosureAuthorityBackfillReview({
        bundle,
        receipt: { ...receipt(bundle), verdicts: [] },
        now: NOW,
      }),
    ).toThrow(/cardinality/);
    const { identity_evidence: _missing, ...withoutEvidence } = receipt(bundle);
    expect(() =>
      validateClosureAuthorityBackfillReview({ bundle, receipt: withoutEvidence, now: NOW }),
    ).toThrow();
    expect(
      validateClosureAuthorityBackfillReview({ bundle, receipt: intra, now: NOW }),
    ).toBeTruthy();
    expect(() =>
      validateClosureAuthorityBackfillReview({
        bundle,
        receipt: {
          ...intra,
          identity_evidence: { ...intra.identity_evidence, reviewer_task_id: "worker-task-1" },
        },
        now: NOW,
      }),
    ).toThrow(/identity/);
  });

  it("U-CABF-007: [PLAN-L7-435-closure-authority-backfill/U-CABF-007] journal後/rename後crashをbefore-imageへ回復する", () => {
    for (const crashAt of [
      "after-journal",
      "after-rename",
      "after-postverify",
      "before-marker",
    ] as const) {
      const value = fixture();
      expect(() =>
        apply({
          repoRoot: value.root,
          registryPath: value.registryPath,
          bundle: value.bundle,
          receipt: receipt(value.bundle),
          now: NOW,
          crashAt,
        }),
      ).toThrow(/injected crash/);
      expect(readFileSync(join(value.root, value.registryPath), "utf8")).toBe(value.registryBytes);
    }
    const symlinked = fixture("PLAN-L7-903-symlink-component");
    const outside = join(symlinked.root, "outside-marker");
    writeFileSync(outside, "outside-safe");
    expect(() =>
      apply({
        repoRoot: symlinked.root,
        registryPath: symlinked.registryPath,
        bundle: symlinked.bundle,
        receipt: receipt(symlinked.bundle),
        now: NOW,
        cycleId: "cycle-symlink-component",
        postVerify: () => {
          const marker = join(
            symlinked.root,
            ".helix/evidence/closure-authority-backfill/transactions/cycle-symlink-component/committed.json",
          );
          symlinkSync(outside, marker);
        },
      }),
    ).toThrow(/symlink/);
    expect(readFileSync(outside, "utf8")).toBe("outside-safe");
  });

  it("U-CABF-008: [PLAN-L7-435-closure-authority-backfill/U-CABF-008] postverify failureをrollbackし成功時だけeligible化する", () => {
    const failed = fixture();
    expect(() =>
      apply({
        repoRoot: failed.root,
        registryPath: failed.registryPath,
        bundle: failed.bundle,
        receipt: receipt(failed.bundle),
        now: NOW,
        postVerify: () => {
          throw new Error("postverify failed");
        },
      }),
    ).toThrow(/postverify/);
    expect(readFileSync(join(failed.root, failed.registryPath), "utf8")).toBe(failed.registryBytes);

    const passed = fixture();
    expect(
      apply({
        repoRoot: passed.root,
        registryPath: passed.registryPath,
        bundle: passed.bundle,
        receipt: receipt(passed.bundle),
        now: NOW,
      }).applied_plan_ids,
    ).toEqual([passed.proposal.plan_id]);
  });

  it("U-CABF-009: [PLAN-L7-435-closure-authority-backfill/U-CABF-009] append-only cycleへdigest chainと保存数を記録する", () => {
    const value = fixture();
    const result = apply({
      repoRoot: value.root,
      registryPath: value.registryPath,
      bundle: value.bundle,
      receipt: receipt(value.bundle),
      now: NOW,
      cycleId: "cycle-0001",
    });
    const cycles = readFileSync(
      join(value.root, ".helix/evidence/closure-authority-backfill/cycles.jsonl"),
      "utf8",
    )
      .trim()
      .split("\n")
      .map((line) => JSON.parse(line));
    expect(cycles).toHaveLength(1);
    expect(cycles[0]).toMatchObject({
      cycle_id: "cycle-0001",
      previous_cycle_digest: null,
      cycle_digest: result.cycle_digest,
      counts: { eligible: 1 },
      backfill_counts: { eligible_proposal: 1, needs_design: 0 },
      backfill_delta: { eligible_proposal: 0, needs_design: 0 },
      window_coverage: { total: 1, max_window_size: 100 },
    });
    const next = fixture("PLAN-L7-909-next-cycle");
    const missingPlanId = "PLAN-L7-910-needs-design";
    const missingPath = `docs/plans/${missingPlanId}.md`;
    writeFileSync(
      join(next.root, missingPath),
      `---\nplan_id: ${missingPlanId}\n---\n# needs design\n`,
    );
    next.bundle = {
      ...next.bundle,
      candidate_plan_ids: [...next.bundle.candidate_plan_ids, missingPlanId],
      decisions: [
        ...next.bundle.decisions,
        {
          plan_id: missingPlanId,
          classification: "needs_design",
          source_path: missingPath,
          reason: "parent design absent",
          required_action: "L6へ戻す",
          proposal: null,
        },
      ],
    };
    writeFileSync(
      join(next.root, ".helix/evidence/review-authority.json"),
      authorityArtifact(next.bundle),
    );
    const nextLedger = join(next.root, ".helix/evidence/closure-authority-backfill/cycles.jsonl");
    mkdirSync(join(next.root, ".helix/evidence/closure-authority-backfill"), {
      recursive: true,
    });
    writeFileSync(
      nextLedger,
      readFileSync(join(value.root, ".helix/evidence/closure-authority-backfill/cycles.jsonl")),
    );
    apply({
      repoRoot: next.root,
      registryPath: next.registryPath,
      bundle: next.bundle,
      receipt: receipt(next.bundle),
      now: NOW,
      cycleId: "cycle-0002",
    });
    const nextCycle = JSON.parse(
      readFileSync(nextLedger, "utf8").trim().split("\n").at(-1) ?? "{}",
    );
    expect(nextCycle).toMatchObject({
      previous_cycle_digest: result.cycle_digest,
      backfill_counts: { eligible_proposal: 1, needs_design: 1 },
      backfill_delta: { eligible_proposal: 0, needs_design: 1 },
      backlog: [
        {
          plan_id: missingPlanId,
          classification: "needs_design",
          reason: "parent design absent",
          required_action: "L6へ戻す",
        },
      ],
      window_coverage: { total: 2, max_window_size: 100 },
    });

    for (const crashAt of ["after-marker", "before-ledger", "partial-ledger"] as const) {
      const recovered = fixture();
      expect(() =>
        apply({
          repoRoot: recovered.root,
          registryPath: recovered.registryPath,
          bundle: recovered.bundle,
          receipt: receipt(recovered.bundle),
          now: NOW,
          cycleId: `cycle-${crashAt}`,
          crashAt,
        }),
      ).toThrow(/injected crash/);
      const lines = readFileSync(
        join(recovered.root, ".helix/evidence/closure-authority-backfill/cycles.jsonl"),
        "utf8",
      )
        .trim()
        .split("\n");
      expect(lines).toHaveLength(1);
      expect(JSON.parse(lines[0] ?? "{}").cycle_id).toBe(`cycle-${crashAt}`);
      expect(readFileSync(join(recovered.root, recovered.registryPath), "utf8")).not.toBe(
        recovered.registryBytes,
      );
    }

    const tampered = fixture();
    mkdirSync(join(tampered.root, ".helix/evidence/closure-authority-backfill"), {
      recursive: true,
    });
    writeFileSync(
      join(tampered.root, ".helix/evidence/closure-authority-backfill/cycles.jsonl"),
      '{"schema_version":"closure-authority-backfill-cycle.v1"}',
    );
    expect(() =>
      apply({
        repoRoot: tampered.root,
        registryPath: tampered.registryPath,
        bundle: tampered.bundle,
        receipt: receipt(tampered.bundle),
        now: NOW,
      }),
    ).toThrow(/partial line|schema/);
    expect(readFileSync(join(tampered.root, tampered.registryPath), "utf8")).toBe(
      tampered.registryBytes,
    );
  });

  it("U-CABF-010: [PLAN-L7-435-closure-authority-backfill/U-CABF-010] Windows applyとclosure status/approval mutationをfail-closeする", () => {
    const windows = fixture();
    expect(() =>
      apply({
        repoRoot: windows.root,
        registryPath: windows.registryPath,
        bundle: windows.bundle,
        receipt: receipt(windows.bundle),
        now: NOW,
        platformName: "win32",
      }),
    ).toThrow(/Windows/);

    const changed = fixture();
    expect(() =>
      apply({
        repoRoot: changed.root,
        registryPath: changed.registryPath,
        bundle: changed.bundle,
        receipt: receipt(changed.bundle),
        now: NOW,
        postVerify: () => {
          writeFileSync(join(changed.root, ".helix/harness.db"), "mutated-status-approval");
        },
      }),
    ).toThrow(/status\/approval/);
    expect(readFileSync(join(changed.root, changed.registryPath), "utf8")).toBe(
      changed.registryBytes,
    );
  });

  it("real process barrierで同一before digestのtransaction commitをexactly-one化する", async () => {
    const value = fixture("PLAN-L7-906-process-race");
    const raceDir = join(value.root, ".helix/race");
    mkdirSync(raceDir, { recursive: true });
    writeFileSync(join(raceDir, "bundle.json"), JSON.stringify(value.bundle));
    writeFileSync(join(raceDir, "receipt.json"), JSON.stringify(receipt(value.bundle)));
    writeFileSync(join(raceDir, "review-row.json"), JSON.stringify(reviewDbRow(value.bundle)));
    const tempTest = join(import.meta.dirname, `.closure-authority-race-${process.pid}.test.ts`);
    const verifierPath = join(
      import.meta.dirname,
      "../src/state-db/closure-authority-backfill-verifier.ts",
    );
    const modulePath = join(import.meta.dirname, "../src/state-db/closure-authority-backfill.ts");
    writeFileSync(
      tempTest,
      `import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { it, vi } from "vitest";
vi.mock(${JSON.stringify(verifierPath)}, async (load) => ({ ...(await load()), verifyClosureAuthorityBackfillProductionBundle: () => ({ verified: true, source_digest: "sha256:${"f".repeat(64)}" }) }));
import { applyClosureAuthorityBackfill } from ${JSON.stringify(modulePath)};
it("race child", async () => {
  const root = process.env.RACE_ROOT;
  if (!root) throw new Error("RACE_ROOT missing");
  while (!existsSync(join(root, ".helix/race/go"))) await new Promise((resolve) => setTimeout(resolve, 5));
  const bundle = JSON.parse(readFileSync(join(root, ".helix/race/bundle.json"), "utf8"));
  const receipt = JSON.parse(readFileSync(join(root, ".helix/race/receipt.json"), "utf8"));
  const reviewRow = JSON.parse(readFileSync(join(root, ".helix/race/review-row.json"), "utf8"));
  const db = { prepare: (sql) => ({ get: (id) => sql.includes("closure_authority_review_receipts") ? reviewRow : id === "worker-run-1" ? ({ run_id: id, runtime: "worker-a", role: "worker", plan_id: bundle.candidate_plan_ids[0], completed_at: "2026-07-12T00:20:00.000Z", evidence_path: "worker" }) : ({ run_id: "authority-receipt-1", runtime: "reviewer-b", role: "reviewer", plan_id: bundle.candidate_plan_ids[0], completed_at: "2026-07-12T00:30:00.000Z", evidence_path: ".helix/evidence/review-authority.json" }) }) };
  let outcome = "LOST";
  try { applyClosureAuthorityBackfill({ repoRoot: root, registryPath: "docs/governance/closure-authority-registry.yaml", bundle, receipt, now: ${JSON.stringify(NOW)}, db, gateAllowlistPath: "docs/governance/closure-gate-allowlist.yaml" }); outcome = "WON"; } catch {}
  writeFileSync(join(root, ".helix/race/result-" + process.pid), outcome);
});
`,
    );
    const run = () =>
      new Promise<void>((resolve, reject) => {
        const child = spawn(
          "npx",
          ["--prefix", process.cwd(), "--no-install", "vitest", "run", tempTest],
          {
            cwd: join(import.meta.dirname, ".."),
            env: { ...process.env, RACE_ROOT: value.root },
            stdio: ["ignore", "ignore", "pipe"],
          },
        );
        let stderr = "";
        child.stderr.on("data", (chunk: Buffer) => (stderr += chunk.toString("utf8")));
        child.once("close", (code) => (code === 0 ? resolve() : reject(new Error(stderr))));
      });
    try {
      const children = [run(), run()];
      writeFileSync(join(raceDir, "go"), "go");
      await Promise.all(children);
      const outcomes = readdirSync(raceDir)
        .filter((name) => name.startsWith("result-"))
        .map((name) => readFileSync(join(raceDir, name), "utf8"));
      expect(outcomes.filter((outcome) => outcome === "WON")).toHaveLength(1);
      expect(outcomes.filter((outcome) => outcome === "LOST")).toHaveLength(1);
      expect(
        readFileSync(
          join(value.root, ".helix/evidence/closure-authority-backfill/cycles.jsonl"),
          "utf8",
        )
          .trim()
          .split("\n"),
      ).toHaveLength(1);
    } finally {
      rmSync(tempTest, { force: true });
    }
  }, 30_000);
});

import { describe, expect, it } from "vitest";
import {
  appendClosureConvergenceCycle,
  buildClosureConvergenceTtl,
  type ClosureAuthorityProductionInput,
  type ClosureConvergenceLedger,
  runClosureAuthorityProductionOrchestration,
} from "../src/state-db/closure-authority-convergence";

const HEAD = "a".repeat(40);
const DIGEST = `sha256:${"b".repeat(64)}` as const;
const AFTER = `sha256:${"c".repeat(64)}` as const;
const ids = ["PLAN-L7-001", "PLAN-L7-002", "PLAN-L7-003"];
const emptyLedger = (): ClosureConvergenceLedger => ({
  schema_version: "closure-authority-convergence-ledger.v1",
  initial_plan_ids: [...ids],
  cycles: [],
});
const base = (): ClosureAuthorityProductionInput => ({
  repository_head: HEAD,
  expected_head: HEAD,
  proposal_digest: DIGEST,
  expected_proposal_digest: DIGEST,
  registry_digest: DIGEST,
  expected_registry_digest: DIGEST,
  candidate_plan_ids: [...ids],
  candidates: ids.map((plan_id) => ({ plan_id, classification: "eligible" })),
  approved_plan_ids: [...ids],
  offset: 0,
  limit: 2,
  ledger: emptyLedger(),
});

describe("closure authority convergence state machine", () => {
  it("U-CAC-001: [PLAN-L7-439-closure-authority-convergence/U-CAC-001] HEAD/proposal/receipt-equivalent approval inputsをfail-closeする", () => {
    expect(() =>
      runClosureAuthorityProductionOrchestration({ ...base(), expected_head: "" }),
    ).toThrow(/HEAD/);
    expect(() =>
      runClosureAuthorityProductionOrchestration({ ...base(), expected_proposal_digest: AFTER }),
    ).toThrow(/proposal/);
    expect(() =>
      runClosureAuthorityProductionOrchestration({ ...base(), approved_plan_ids: [] }),
    ).toThrow(/approval/);
  });

  it("U-CAC-002: [PLAN-L7-439-closure-authority-convergence/U-CAC-002] candidateの欠落・重複・並べ替えを拒否する", () => {
    expect(() =>
      runClosureAuthorityProductionOrchestration({
        ...base(),
        candidates: base().candidates.slice(1),
      }),
    ).toThrow(/cardinality/);
    const swapped = [...base().candidates].reverse();
    expect(() =>
      runClosureAuthorityProductionOrchestration({ ...base(), candidates: swapped }),
    ).toThrow(/reordered/);
    expect(() =>
      runClosureAuthorityProductionOrchestration({
        ...base(),
        candidate_plan_ids: [ids[0], ids[0], ids[2]],
      }),
    ).toThrow(/duplicate/);
  });

  it("U-CAC-003: [PLAN-L7-439-closure-authority-convergence/U-CAC-003] eligibleだけを独立approve付きでapply対象にする", () => {
    const input = base();
    input.candidates[1] = {
      plan_id: ids[1],
      classification: "needs_design",
      reason: "design missing",
    };
    input.approved_plan_ids = [ids[0]];
    const run = runClosureAuthorityProductionOrchestration(input);
    expect(run.eligible_plan_ids).toEqual([ids[0]]);
    expect(run.unresolved.map((row) => row.plan_id)).toEqual([ids[1]]);
    expect(() =>
      runClosureAuthorityProductionOrchestration({ ...input, approved_plan_ids: [ids[0], ids[1]] }),
    ).toThrow(/non-eligible/);
  });

  it("U-CAC-004: [PLAN-L7-439-closure-authority-convergence/U-CAC-004] stale HEAD/registry/proposal CASを拒否する", () => {
    expect(() =>
      runClosureAuthorityProductionOrchestration({ ...base(), expected_registry_digest: AFTER }),
    ).toThrow(/registry/);
    expect(() =>
      runClosureAuthorityProductionOrchestration({ ...base(), expected_head: "d".repeat(40) }),
    ).toThrow(/HEAD/);
  });

  it("U-CAC-005: [PLAN-L7-439-closure-authority-convergence/U-CAC-005] writer成功後だけcycleをappendし、同digestで再生成できる", () => {
    const run = runClosureAuthorityProductionOrchestration(base());
    const args = {
      ledger: emptyLedger(),
      run,
      cycle_id: "cycle-1",
      repository_head: HEAD,
      proposal_digest: DIGEST,
      registry_before_digest: DIGEST,
      registry_after_digest: AFTER,
      offset: 0,
      limit: 2,
    };
    expect(emptyLedger().cycles).toHaveLength(0);
    const first = appendClosureConvergenceCycle(args);
    const replay = appendClosureConvergenceCycle(args);
    expect(first.cycles[0].cycle_digest).toBe(replay.cycles[0].cycle_digest);
    expect(first.cycles[0].registry_after_digest).toBe(AFTER);
  });

  it("U-CAC-006: [PLAN-L7-439-closure-authority-convergence/U-CAC-006] ledger window・未解決理由の改変をdigest検査で拒否する", () => {
    const input = base();
    input.candidates[1] = { plan_id: ids[1], classification: "needs_design", reason: "missing" };
    input.approved_plan_ids = [ids[0]];
    const ledger = appendClosureConvergenceCycle({
      ledger: emptyLedger(),
      run: runClosureAuthorityProductionOrchestration(input),
      cycle_id: "cycle-1",
      repository_head: HEAD,
      proposal_digest: DIGEST,
      registry_before_digest: DIGEST,
      registry_after_digest: AFTER,
      offset: 0,
      limit: 2,
    });
    ledger.cycles[0].unresolved[0].reason = "tampered";
    expect(() =>
      runClosureAuthorityProductionOrchestration({
        ...base(),
        offset: 2,
        limit: 1,
        ledger,
        approved_plan_ids: [ids[2]],
      }),
    ).toThrow(/digest drift/);
  });

  it("U-CAC-007: [PLAN-L7-439-closure-authority-convergence/U-CAC-007] committed window再適用とoffset飛越を拒否する", () => {
    const firstRun = runClosureAuthorityProductionOrchestration(base());
    const ledger = appendClosureConvergenceCycle({
      ledger: emptyLedger(),
      run: firstRun,
      cycle_id: "cycle-1",
      repository_head: HEAD,
      proposal_digest: DIGEST,
      registry_before_digest: DIGEST,
      registry_after_digest: AFTER,
      offset: 0,
      limit: 2,
    });
    expect(() =>
      runClosureAuthorityProductionOrchestration({ ...base(), ledger, offset: 0 }),
    ).toThrow(/replay|gap/);
    expect(() =>
      runClosureAuthorityProductionOrchestration({ ...base(), ledger, offset: 3 }),
    ).toThrow(/replay|gap/);
    expect(
      runClosureAuthorityProductionOrchestration({
        ...base(),
        ledger,
        offset: 2,
        limit: 1,
        approved_plan_ids: [ids[2]],
      }).complete,
    ).toBe(true);
  });

  it("U-CAC-008: [PLAN-L7-439-closure-authority-convergence/U-CAC-008] TTLをcandidate suffixとauthority generationへ束縛する", () => {
    const ttl = buildClosureConvergenceTtl({
      repository_head: HEAD,
      registry_generation: DIGEST,
      candidate_plan_ids: ids,
      next_offset: 0,
    });
    expect(runClosureAuthorityProductionOrchestration({ ...base(), ttl }).window_plan_ids).toEqual(
      ids.slice(0, 2),
    );
    expect(() =>
      runClosureAuthorityProductionOrchestration({
        ...base(),
        ttl: { ...ttl, registry_generation: AFTER },
      }),
    ).toThrow(/generation/);
    expect(() =>
      runClosureAuthorityProductionOrchestration({
        ...base(),
        ttl: { ...ttl, candidate_plan_ids: ids.slice(1) },
      }),
    ).toThrow(/digest|suffix/);
  });
});

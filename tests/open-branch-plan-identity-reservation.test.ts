import { describe, expect, it } from "vitest";
import { sha256Digest } from "../src/runtime/digest";
import {
  OPEN_BRANCH_PLAN_RESERVATION_SCHEMA,
  type OpenBranchPlanReservation,
  type OpenBranchPlanReservationSnapshot,
  projectOpenBranchPlanReservations,
} from "../src/runtime/open-branch-plan-identity-reservation";

// PLAN-L7-710-open-branch-plan-identity-reservation
const MAIN_HEAD = "1".repeat(40);
const PR_HEAD = "2".repeat(40);
const WRITER_HEAD = "3".repeat(40);

function reservation(
  overrides: Partial<OpenBranchPlanReservation> = {},
): OpenBranchPlanReservation {
  return {
    plan_id: "PLAN-L7-710-open-branch-plan-identity-reservation",
    owner_issue: 1255,
    responsibility_owner: "open-branch-plan-identity-reservation",
    plan_path: "docs/plans/PLAN-L7-710-open-branch-plan-identity-reservation.md",
    plan_blob_digest: sha256Digest("plan-710"),
    head_sha: WRITER_HEAD,
    ancestor_head_shas: [MAIN_HEAD],
    source: {
      kind: "active_writer",
      branch: "feature/1255-open-branch-plan-reservation",
      assignment_id: "assignment-1255",
      lease_id: "lease-1255",
      fence_token: "fence-1",
    },
    lifecycle: "active",
    terminal_evidence: null,
    ...overrides,
  };
}

function snapshot(
  reservations: readonly OpenBranchPlanReservation[],
  evidence: Partial<OpenBranchPlanReservationSnapshot["evidence"]> = {},
  includeCurrentMain = true,
): OpenBranchPlanReservationSnapshot {
  const available = { status: "available" as const, error_digest: null };
  const hasCurrentMain = reservations.some((item) => item.source.kind === "current_main");
  const currentMain = reservation({
    plan_id: "PLAN-L7-700-main-plan",
    plan_path: "docs/plans/PLAN-L7-700-main-plan.md",
    plan_blob_digest: sha256Digest("main-plan"),
    owner_issue: 1200,
    responsibility_owner: "main-plan",
    head_sha: MAIN_HEAD,
    ancestor_head_shas: [],
    source: { kind: "current_main", branch: "main" },
    lifecycle: "current",
  });
  return {
    schema_version: OPEN_BRANCH_PLAN_RESERVATION_SCHEMA,
    repository: "RetryYN/HELIX-HARNESS",
    captured_at: "2026-08-30T12:00:00.000Z",
    evidence: {
      current_main: available,
      open_pr_heads: available,
      active_writer_branches: available,
      ...evidence,
    },
    reservations:
      includeCurrentMain && !hasCurrentMain ? [currentMain, ...reservations] : [...reservations],
  };
}

describe("open branch PLAN identity reservation", () => {
  it("U-OBPIR-001: current main／open PR／active writerの一意予約をprojectionする", () => {
    const result = projectOpenBranchPlanReservations(
      snapshot([
        reservation({
          plan_id: "PLAN-L7-700-main-plan",
          plan_path: "docs/plans/PLAN-L7-700-main-plan.md",
          plan_blob_digest: sha256Digest("main-plan"),
          owner_issue: 1200,
          responsibility_owner: "main-plan",
          head_sha: MAIN_HEAD,
          ancestor_head_shas: [],
          source: { kind: "current_main", branch: "main" },
          lifecycle: "current",
        }),
        reservation({
          plan_id: "PLAN-L7-709-open-pr-plan",
          plan_path: "docs/plans/PLAN-L7-709-open-pr-plan.md",
          plan_blob_digest: sha256Digest("pr-plan"),
          owner_issue: 1250,
          responsibility_owner: "open-pr-plan",
          head_sha: PR_HEAD,
          source: { kind: "open_pr", branch: "feature/pr", pr_number: 1250 },
          lifecycle: "open",
        }),
        reservation(),
      ]),
    );
    expect(result).toMatchObject({ ok: true, status: "admitted" });
    expect(result.active_reservations).toHaveLength(3);
    expect(result.projection_digest).toMatch(/^sha256:[a-f0-9]{64}$/u);
  });

  it("U-OBPIR-002: #1240/#1247型と#1241/#1254型の異責務同一採番を拒否する", () => {
    for (const [left, right] of [
      ["PLAN-L7-706-ci-verification-plan", "PLAN-L7-706-other-responsibility"],
      ["PLAN-L7-707-ci-critical-path-scheduler", "PLAN-L7-707-setup-runtime"],
    ] as const) {
      const result = projectOpenBranchPlanReservations(
        snapshot([
          reservation({
            plan_id: left,
            plan_path: `docs/plans/${left}.md`,
            plan_blob_digest: sha256Digest(left),
            responsibility_owner: "responsibility-a",
            owner_issue: 1206,
            head_sha: PR_HEAD,
            source: { kind: "open_pr", branch: "feature/a", pr_number: 1240 },
            lifecycle: "open",
          }),
          reservation({
            plan_id: right,
            plan_path: `docs/plans/${right}.md`,
            plan_blob_digest: sha256Digest(right),
            responsibility_owner: "responsibility-b",
            owner_issue: 1253,
          }),
        ]),
      );
      expect(result).toMatchObject({ ok: false, status: "blocked" });
      expect(result.conflicts).toContainEqual(
        expect.objectContaining({
          code: "plan_number_conflict",
          key: left.split("-").slice(0, 3).join("-"),
        }),
      );
    }
  });

  it("U-OBPIR-003: ancestorと同一blob／owner／responsibilityを継承するstackだけを許可する", () => {
    const inherited = reservation({
      head_sha: PR_HEAD,
      ancestor_head_shas: [MAIN_HEAD],
      source: { kind: "open_pr", branch: "feature/ancestor", pr_number: 1239 },
      lifecycle: "open",
    });
    const descendant = reservation({ ancestor_head_shas: [MAIN_HEAD, PR_HEAD] });
    expect(projectOpenBranchPlanReservations(snapshot([inherited, descendant])).ok).toBe(true);

    const unrelated = reservation({ ancestor_head_shas: [MAIN_HEAD] });
    expect(
      projectOpenBranchPlanReservations(snapshot([inherited, unrelated])).conflicts,
    ).toContainEqual(expect.objectContaining({ code: "plan_id_conflict" }));

    const changedResponsibility = reservation({
      ancestor_head_shas: [MAIN_HEAD, PR_HEAD],
      responsibility_owner: "other-responsibility",
    });
    expect(
      projectOpenBranchPlanReservations(snapshot([inherited, changedResponsibility])).conflicts,
    ).toContainEqual(expect.objectContaining({ code: "plan_id_conflict" }));
  });

  it("U-OBPIR-004: 同番号でもForward／Reverse familyを混同しない", () => {
    const forward = reservation({
      plan_id: "PLAN-L7-710-forward",
      plan_path: "docs/plans/PLAN-L7-710-forward.md",
      plan_blob_digest: sha256Digest("forward"),
    });
    const reverse = reservation({
      plan_id: "PLAN-REVERSE-710-forward",
      plan_path: "docs/plans/PLAN-REVERSE-710-forward.md",
      plan_blob_digest: sha256Digest("reverse"),
      owner_issue: 1256,
      responsibility_owner: "reverse-responsibility",
      head_sha: PR_HEAD,
      source: { kind: "open_pr", branch: "reverse/1256", pr_number: 1256 },
      lifecycle: "open",
    });
    expect(projectOpenBranchPlanReservations(snapshot([forward, reverse])).ok).toBe(true);
  });

  it("U-OBPIR-005: merged／closed／stale reservationをterminal evidenceで解放する", () => {
    const terminal = {
      recorded_at: "2026-08-30T11:00:00.000Z",
      evidence_digest: sha256Digest("terminal"),
    };
    const released = [
      reservation({
        source: { kind: "open_pr", branch: "feature/merged", pr_number: 1240 },
        lifecycle: "merged",
        terminal_evidence: { ...terminal, kind: "merged" },
      }),
      reservation({
        source: { kind: "open_pr", branch: "feature/closed", pr_number: 1241 },
        lifecycle: "closed",
        terminal_evidence: { ...terminal, kind: "closed" },
      }),
      reservation({
        lifecycle: "stale",
        terminal_evidence: { ...terminal, kind: "stale" },
      }),
    ];
    const result = projectOpenBranchPlanReservations(snapshot(released));
    expect(result.ok).toBe(true);
    expect(result.active_reservations).toHaveLength(1);
    expect(result.active_reservations[0]?.source.kind).toBe("current_main");
    expect(result.released_reservations).toHaveLength(3);
  });

  it("U-OBPIR-006: GitHub／writer取得不能を曖昧greenへfallbackしない", () => {
    const unavailable = { status: "unavailable" as const, error_digest: sha256Digest("offline") };
    const result = projectOpenBranchPlanReservations(
      snapshot([reservation()], {
        open_pr_heads: unavailable,
        active_writer_branches: unavailable,
      }),
    );
    expect(result).toMatchObject({ ok: false, status: "degraded" });
    expect(result.unavailable_surfaces).toEqual(["active_writer_branches", "open_pr_heads"]);
  });

  it("U-OBPIR-007: at-least-once重複をdedupeし、schema／terminal raceをfail-closeする", () => {
    const repeated = reservation();
    const replayed = projectOpenBranchPlanReservations(snapshot([repeated, repeated]));
    expect(
      replayed.active_reservations.filter((item) => item.plan_id === repeated.plan_id),
    ).toHaveLength(1);

    const staleWithoutTerminal = { ...reservation(), lifecycle: "stale" };
    expect(
      projectOpenBranchPlanReservations(
        snapshot([staleWithoutTerminal as OpenBranchPlanReservation]),
      ).status,
    ).toBe("blocked");
    expect(
      projectOpenBranchPlanReservations({ ...snapshot([]), unexpected_field: true }).status,
    ).toBe("blocked");

    const changedAncestry = reservation({ ancestor_head_shas: [MAIN_HEAD, PR_HEAD] });
    expect(projectOpenBranchPlanReservations(snapshot([repeated, changedAncestry])).status).toBe(
      "blocked",
    );

    const wrongPath = reservation({
      plan_path: "docs/plans/PLAN-L7-710-different-responsibility.md",
    });
    expect(projectOpenBranchPlanReservations(snapshot([wrongPath])).status).toBe("blocked");

    const futureTerminal = reservation({
      source: { kind: "open_pr", branch: "feature/future", pr_number: 1255 },
      lifecycle: "closed",
      terminal_evidence: {
        kind: "closed",
        recorded_at: "2026-08-30T13:00:00.000Z",
        evidence_digest: sha256Digest("future-terminal"),
      },
    });
    expect(projectOpenBranchPlanReservations(snapshot([futureTerminal])).status).toBe("blocked");

    const releasedMain = reservation({
      source: { kind: "current_main", branch: "main" },
      lifecycle: "closed",
      terminal_evidence: {
        kind: "closed",
        recorded_at: "2026-08-30T11:00:00.000Z",
        evidence_digest: sha256Digest("released-main"),
      },
    });
    expect(projectOpenBranchPlanReservations(snapshot([releasedMain])).status).toBe("blocked");
  });

  it("U-OBPIR-008: conflictをunavailableより優先し、current main証拠欠落を拒否する", () => {
    const unavailable = { status: "unavailable" as const, error_digest: sha256Digest("offline") };
    const conflict = projectOpenBranchPlanReservations(
      snapshot(
        [
          reservation({ plan_id: "PLAN-L7-706-a", plan_path: "docs/plans/PLAN-L7-706-a.md" }),
          reservation({
            plan_id: "PLAN-L7-706-b",
            plan_path: "docs/plans/PLAN-L7-706-b.md",
            owner_issue: 1256,
            responsibility_owner: "other",
            plan_blob_digest: sha256Digest("other"),
          }),
        ],
        { open_pr_heads: unavailable },
      ),
    );
    expect(conflict).toMatchObject({ ok: false, status: "blocked" });

    const noMain = projectOpenBranchPlanReservations(snapshot([reservation()], {}, false));
    expect(noMain).toMatchObject({ ok: false, status: "blocked" });
    expect(noMain.errors).toContain("current_main_reservation_missing");
  });
});

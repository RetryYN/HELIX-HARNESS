import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { canonicalJson, sha256Digest } from "../src/runtime/digest";
import {
  authorForwardPlanTransaction,
  type ForwardPlanAuthoringTransactionDeps,
  type ForwardPlanAuthoringTransactionInput,
  OPEN_BRANCH_RESERVATION_AUTHORITY_PATH,
} from "../src/runtime/forward-plan-authoring-transaction";
import { OPEN_BRANCH_PLAN_RESERVATION_SCHEMA } from "../src/runtime/open-branch-plan-identity-reservation";

// PLAN-L7-720-forward-reverse-terminal-reservation
const MAIN = "1".repeat(40),
  HEAD = "2".repeat(40),
  VERSION = "1.1.6",
  REGISTRY = `sha256:${"5".repeat(64)}`;
const roots: string[] = [];
const providerSnapshots = new Map<
  string,
  ForwardPlanAuthoringTransactionInput["reservationInput"]["reservation_snapshot"]
>();
const deps = (
  overrides: Partial<ForwardPlanAuthoringTransactionDeps> = {},
): ForwardPlanAuthoringTransactionDeps => ({
  currentHead: () => HEAD,
  remoteMainHead: () => MAIN,
  freshReservationAuthority: (root) => {
    const snapshot = providerSnapshots.get(root);
    if (!snapshot) throw new Error("fixture_provider_unavailable");
    const fresh = structuredClone(snapshot);
    return { snapshot: fresh, snapshot_digest: sha256Digest(canonicalJson(fresh)) };
  },
  acquireLock: () => ({ path: "fixture", token: "fixture", processStartId: "fixture" }),
  releaseLock: () => undefined,
  ...overrides,
});
function docs(extra = false) {
  const wf = (id: string) =>
    `workflow_identity:\n  schema_version: helix-plan-workflow-identity.v1\n  registry_version: ${VERSION}\n  registry_source_digest: ${REGISTRY}\n  target_axis: workflow_model\n  target_id: ${id}\n`;
  return {
    forward: `---\nplan_id: PLAN-L7-720-forward\nkind: add-impl\nstatus: draft\nbackfill_state: pending_reverse\ncompletion_claim_allowed: false\ngithub_issue_id: 1297\nresponsibility_owner: forward-reverse-terminal-reservation\n${wf("ADD_FEATURE")}dependencies:\n  references:\n    - docs/plans/PLAN-REVERSE-901-forward.md${extra ? "\n    - docs/plans/PLAN-REVERSE-999-extra.md" : ""}\n---\n# Forward\n`,
    reverse: `---\nplan_id: PLAN-REVERSE-901-forward\nkind: reverse\nstatus: draft\nbackfill_state: pending_reverse\ncompletion_claim_allowed: false\ngithub_issue_id: 1297\nresponsibility_owner: forward-reverse-terminal-reservation\n${wf("REVERSE")}dependencies:\n  references:\n    - docs/plans/PLAN-L7-720-forward.md\n---\n# Reverse\n`,
  };
}
function input(): ForwardPlanAuthoringTransactionInput {
  const root = mkdtempSync(join(tmpdir(), "helix-authoring-"));
  roots.push(root);
  mkdirSync(join(root, "docs/plans"), { recursive: true });
  mkdirSync(join(root, ".helix/state/plan-allocator-receipts"), { recursive: true });
  mkdirSync(join(root, "config"));
  writeFileSync(
    join(root, "config/workflow-classification-catalog.v1.json"),
    JSON.stringify({
      source_registry: { registry_version: VERSION, registry_source_digest: REGISTRY },
      entities: [
        { axis: "workflow_model", id: "ADD_FEATURE" },
        { axis: "workflow_model", id: "REVERSE" },
      ],
    }),
  );
  const d = docs(),
    allocation = {
      reverse_slug: "forward",
      reverse_plan_blob_digest: sha256Digest(d.reverse),
    };
  const snapshot = {
    schema_version: OPEN_BRANCH_PLAN_RESERVATION_SCHEMA,
    repository: "RetryYN/HELIX-HARNESS",
    captured_at: "2026-09-01T00:00:00.000Z",
    evidence: {
      current_main: { status: "available" as const, error_digest: null },
      open_pr_heads: { status: "available" as const, error_digest: null },
      active_writer_branches: { status: "available" as const, error_digest: null },
    },
    reservations: [
      {
        plan_id: "PLAN-REVERSE-900-previous",
        owner_issue: 1200,
        responsibility_owner: "main-plan",
        plan_path: "docs/plans/PLAN-REVERSE-900-previous.md",
        plan_blob_digest: sha256Digest("previous"),
        head_sha: MAIN,
        ancestor_head_shas: [],
        source: { kind: "current_main" as const, branch: "main" as const },
        lifecycle: "current" as const,
        terminal_evidence: null,
      },
      {
        plan_id: "PLAN-L7-719-authority-anchor",
        owner_issue: 1296,
        responsibility_owner: "authority-anchor",
        plan_path: "docs/plans/PLAN-L7-719-authority-anchor.md",
        plan_blob_digest: sha256Digest("anchor"),
        head_sha: HEAD,
        ancestor_head_shas: [MAIN],
        source: {
          kind: "active_writer" as const,
          branch: "feature/1297",
          assignment_id: "assignment-1297",
          lease_id: "lease-1297",
          fence_token: "fence-1297",
        },
        lifecycle: "active" as const,
        terminal_evidence: null,
      },
      {
        plan_id: "PLAN-L7-700-main",
        owner_issue: 1200,
        responsibility_owner: "main-plan",
        plan_path: "docs/plans/PLAN-L7-700-main.md",
        plan_blob_digest: sha256Digest("main"),
        head_sha: MAIN,
        ancestor_head_shas: [],
        source: { kind: "current_main" as const, branch: "main" as const },
        lifecycle: "current" as const,
        terminal_evidence: null,
      },
    ],
  };
  writeFileSync(join(root, OPEN_BRANCH_RESERVATION_AUTHORITY_PATH), `${canonicalJson(snapshot)}\n`);
  providerSnapshots.set(root, structuredClone(snapshot));
  return {
    repoRoot: root,
    reservationAuthorityPath: OPEN_BRANCH_RESERVATION_AUTHORITY_PATH,
    forwardDocument: d.forward,
    reverseDocument: d.reverse,
    reservationInput: {
      forward: {
        plan_id: "PLAN-L7-720-forward",
        kind: "add-impl",
        target_axis: "workflow_model",
        target_id: "ADD_FEATURE",
        owner_issue: 1297,
        responsibility_owner: "forward-reverse-terminal-reservation",
        plan_blob_digest: sha256Digest(d.forward),
      },
      allocation,
      branch: "feature/1297",
      assignment_id: "assignment-1297",
      lease_id: "lease-1297",
      fence_token: "fence-1297",
      candidate_head: HEAD,
      ancestor_head_shas: [MAIN],
      expected_main_head: MAIN,
      observed_main_head: MAIN,
      reservation_snapshot: snapshot,
    },
  };
}
afterEach(() => {
  for (const root of roots.splice(0)) {
    providerSnapshots.delete(root);
    rmSync(root, { recursive: true, force: true });
  }
});
describe("Forward PLAN authoring transaction", () => {
  it("U-FPATR-001: dry-runはauthorityを検証してwriteしない", () => {
    const v = input(),
      before = readFileSync(join(v.repoRoot, v.reservationAuthorityPath), "utf8");
    expect(authorForwardPlanTransaction({ ...v, dryRun: true }, deps())).toMatchObject({
      ok: true,
      status: "planned",
      written_paths: [],
    });
    expect(readFileSync(join(v.repoRoot, v.reservationAuthorityPath), "utf8")).toBe(before);
  });
  it("U-FPATR-002: pair、issuer receipt、reservation authorityを同時永続化して再読込する", () => {
    const v = input(),
      result = authorForwardPlanTransaction(v, deps());
    expect(result).toMatchObject({ ok: true, status: "committed" });
    expect(result.written_paths).toHaveLength(4);
    const receiptFiles = readdirSync(join(v.repoRoot, ".helix/state/plan-allocator-receipts"));
    expect(receiptFiles).toHaveLength(1);
    const receipt = JSON.parse(
      readFileSync(
        join(v.repoRoot, ".helix/state/plan-allocator-receipts", receiptFiles[0] as string),
        "utf8",
      ),
    );
    const { receipt_digest: receiptDigest, ...receiptPayload } = receipt;
    expect(receipt).toMatchObject({
      schema_version: "helix-plan-allocator-receipt.v1",
      issuer: "helix-plan-allocator",
      issued_main_head: MAIN,
      assignment_id: "assignment-1297",
      lease_id: "lease-1297",
      fence_token: "fence-1297",
      allocation: {
        allocation_id: expect.stringMatching(/^allocation-[a-f0-9]{24}$/u),
        forward_plan_id: "PLAN-L7-720-forward",
        reverse_plan_id: "PLAN-REVERSE-901-forward",
      },
    });
    expect(receiptDigest).toBe(sha256Digest(canonicalJson(receiptPayload)));
    expect(receipt.allocation.allocation_id).not.toContain(":");
    const authority = JSON.parse(
      readFileSync(join(v.repoRoot, OPEN_BRANCH_RESERVATION_AUTHORITY_PATH), "utf8"),
    );
    providerSnapshots.set(v.repoRoot, structuredClone(authority));
    expect(authority.reservations.map((r: { plan_id: string }) => r.plan_id)).toEqual(
      expect.arrayContaining(["PLAN-L7-720-forward", "PLAN-REVERSE-901-forward"]),
    );
    const retry = authorForwardPlanTransaction(
      { ...v, reservationInput: { ...v.reservationInput, reservation_snapshot: authority } },
      deps(),
    );
    expect(retry.findings).toEqual([]);
    expect(retry).toMatchObject({ ok: true, status: "idempotent" });
    expect(retry.transaction_digest).toBe(result.transaction_digest);
  });
  it("U-FPATR-003: live main driftとcaller自己署名receiptを拒否する", () => {
    expect(
      authorForwardPlanTransaction(input(), deps({ remoteMainHead: () => "3".repeat(40) })),
    ).toMatchObject({ ok: false, findings: ["origin_main_authority_mismatch"] });
    const v = input();
    Object.assign(v.reservationInput.allocation, {
      receipt_digest: sha256Digest("caller-forged"),
    });
    expect(authorForwardPlanTransaction(v, deps())).toMatchObject({
      ok: false,
      findings: ["caller_allocator_receipt_forbidden"],
    });
  });
  it("U-FPATR-004: no-clobberとcommit直前authority driftを拒否する", () => {
    const c = input(),
      path = join(c.repoRoot, "docs/plans/PLAN-L7-720-forward.md");
    writeFileSync(path, "foreign");
    expect(authorForwardPlanTransaction(c, deps())).toMatchObject({
      ok: false,
      findings: ["plan_path_collision"],
    });
    expect(readFileSync(path, "utf8")).toBe("foreign");
    const v = input();
    expect(
      authorForwardPlanTransaction(
        v,
        deps({
          beforeCommit: () => writeFileSync(join(v.repoRoot, v.reservationAuthorityPath), "{}"),
        }),
      ),
    ).toMatchObject({ ok: false, findings: ["commit_authority_drift"] });
  });
  it("U-FPATR-005: references exact setとworkflow identityを検証する", () => {
    const v = input(),
      changed = docs(true).forward;
    v.forwardDocument = changed;
    v.reservationInput.forward.plan_blob_digest = sha256Digest(changed);
    expect(authorForwardPlanTransaction(v, deps())).toMatchObject({
      ok: false,
      findings: ["document_contract_drift"],
    });
    const workflow = input();
    workflow.reverseDocument = workflow.reverseDocument.replace(
      "target_id: REVERSE",
      "target_id: ADD_FEATURE",
    );
    workflow.reservationInput.allocation.reverse_plan_blob_digest = sha256Digest(
      workflow.reverseDocument,
    );
    expect(authorForwardPlanTransaction(workflow, deps())).toMatchObject({
      ok: false,
      findings: ["document_contract_drift"],
    });
  });
  it("U-FPATR-006: live lockをfail-closeする", () => {
    expect(
      authorForwardPlanTransaction(
        input(),
        deps({
          acquireLock: () => {
            throw new Error("live");
          },
        }),
      ),
    ).toMatchObject({ ok: false, findings: ["authoring_transaction_locked"] });
  });
  it("U-FPATR-007: symlink repo境界を拒否する", () => {
    const v = input(),
      link = `${v.repoRoot}-link`;
    roots.push(link);
    symlinkSync(v.repoRoot, link);
    expect(authorForwardPlanTransaction({ ...v, repoRoot: link }, deps())).toMatchObject({
      ok: false,
      findings: ["repository_realpath_mismatch"],
    });
    const authority = input();
    const authorityPath = join(authority.repoRoot, authority.reservationAuthorityPath);
    const backup = `${authorityPath}.real`;
    writeFileSync(backup, readFileSync(authorityPath));
    rmSync(authorityPath);
    symlinkSync(backup, authorityPath);
    expect(authorForwardPlanTransaction(authority, deps())).toMatchObject({
      ok: false,
      findings: ["physical_path_boundary"],
    });
    const plan = input(),
      foreignPlan = join(plan.repoRoot, "foreign-plan.md");
    writeFileSync(foreignPlan, plan.forwardDocument);
    symlinkSync(foreignPlan, join(plan.repoRoot, "docs/plans/PLAN-L7-720-forward.md"));
    expect(authorForwardPlanTransaction(plan, deps())).toMatchObject({
      ok: false,
      findings: ["physical_path_boundary"],
    });
  });
  it("U-FPATR-008: snapshotとdocument digest driftを拒否する", () => {
    const s = input();
    s.reservationInput.reservation_snapshot.captured_at = "2026-09-02T00:00:00.000Z";
    expect(authorForwardPlanTransaction(s, deps())).toMatchObject({
      ok: false,
      findings: ["reservation_authority_input_drift"],
    });
    const d = input();
    d.forwardDocument += "drift";
    expect(authorForwardPlanTransaction(d, deps())).toMatchObject({
      ok: false,
      findings: ["forward_document_digest_drift"],
    });
  });
  it("U-FPATR-009: journal transaction bindingはHEAD driftをcompensateする", () => {
    const sealed = input();
    writeFileSync(join(sealed.repoRoot, ".helix/state/forward-plan-authoring-journal.json"), "{}");
    expect(authorForwardPlanTransaction(sealed, deps())).toMatchObject({
      ok: false,
      findings: ["authoring_journal_seal_invalid"],
    });
    const v = input();
    let head = HEAD;
    expect(
      authorForwardPlanTransaction(
        v,
        deps({
          currentHead: () => head,
          beforeCommit: () => {
            head = "4".repeat(40);
          },
        }),
      ),
    ).toMatchObject({ ok: false, findings: ["commit_authority_drift"] });
  });
  it("U-FPATR-010: journal作成後のparent symlink swapをrecoveryで拒否する", () => {
    const v = input(),
      plans = join(v.repoRoot, "docs/plans"),
      moved = join(v.repoRoot, "docs/plans-before-swap"),
      foreign = join(v.repoRoot, "foreign-plans");
    mkdirSync(foreign);
    const result = authorForwardPlanTransaction(
      v,
      deps({
        beforeCommit: () => {
          renameSync(plans, moved);
          symlinkSync(foreign, plans);
        },
      }),
    );
    expect(result).toMatchObject({
      ok: false,
      status: "recovery_required",
      findings: ["physical_path_boundary"],
    });
    expect(readFileSync(join(v.repoRoot, v.reservationAuthorityPath), "utf8")).not.toContain(
      "PLAN-L7-720-forward",
    );
  });
  it("U-FPATR-011: prepared中に出現した同digest finalを外部writeとして保持する", () => {
    const v = input(),
      forwardPath = join(v.repoRoot, "docs/plans/PLAN-L7-720-forward.md");
    const result = authorForwardPlanTransaction(
      v,
      deps({ beforeCommit: () => writeFileSync(forwardPath, v.forwardDocument) }),
    );
    expect(result).toMatchObject({
      ok: false,
      status: "recovery_required",
      findings: ["prepared_recovery_external_write"],
    });
    expect(readFileSync(forwardPath, "utf8")).toBe(v.forwardDocument);
    expect(existsSync(join(v.repoRoot, "docs/plans/PLAN-REVERSE-901-forward.md"))).toBe(false);
    expect(readdirSync(join(v.repoRoot, ".helix/state/plan-allocator-receipts"))).toEqual([]);
  });
  it("U-FPATR-012: path非正規semantic slugを列挙拒否する", () => {
    for (const reverseSlug of [
      "foo/bar",
      "foo\\bar",
      ".",
      "..",
      "foo/../bar",
      "a".repeat(65),
      "foo\u0000bar",
      "foo:bar",
    ]) {
      const v = input();
      v.reservationInput.allocation.reverse_slug = reverseSlug;
      const result = authorForwardPlanTransaction(v, deps());
      expect(result).toMatchObject({ ok: false, status: "blocked" });
      expect(result.findings).toContain("reverse_slug_invalid");
      expect(readdirSync(join(v.repoRoot, ".helix/state/plan-allocator-receipts"))).toEqual([]);
    }
  });
  it("U-FPATR-013: exact active_writer authority anchor欠落を拒否する", () => {
    const v = input();
    v.reservationInput.reservation_snapshot.reservations =
      v.reservationInput.reservation_snapshot.reservations.filter(
        (entry) => entry.source.kind !== "active_writer",
      );
    writeFileSync(
      join(v.repoRoot, v.reservationAuthorityPath),
      `${canonicalJson(v.reservationInput.reservation_snapshot)}\n`,
    );
    providerSnapshots.set(v.repoRoot, structuredClone(v.reservationInput.reservation_snapshot));
    expect(authorForwardPlanTransaction(v, deps())).toMatchObject({
      ok: false,
      findings: ["allocator_writer_authority_anchor_missing"],
    });
  });
  it("U-FPATR-014: journal-first crashはstaged orphanを残さない", () => {
    const v = input(),
      result = authorForwardPlanTransaction(
        v,
        deps({
          afterJournal: () => {
            throw new Error("simulated_after_journal_crash");
          },
        }),
      );
    expect(result).toMatchObject({
      ok: false,
      status: "recovery_required",
      findings: ["simulated_after_journal_crash"],
    });
    expect(existsSync(join(v.repoRoot, ".helix/state/forward-plan-authoring-journal.json"))).toBe(
      true,
    );
    expect(existsSync(join(v.repoRoot, ".helix/tmp/forward-plan-authoring"))).toBe(false);
    const retry = authorForwardPlanTransaction(v, deps());
    expect(retry).toMatchObject({ ok: true, status: "committed" });
    expect(existsSync(join(v.repoRoot, ".helix/state/forward-plan-authoring-journal.json"))).toBe(
      false,
    );
  });
  it("U-FPATR-015: fresh provider unavailable／stale／wrong lease／wrong head／collisionを拒否する", () => {
    const unavailable = input();
    expect(
      authorForwardPlanTransaction(
        unavailable,
        deps({
          freshReservationAuthority: () => {
            throw new Error("fresh_reservation_authority_provider_unavailable");
          },
        }),
      ),
    ).toMatchObject({
      ok: false,
      findings: ["fresh_reservation_authority_provider_unavailable"],
    });
    for (const mutate of [
      (snapshot: typeof unavailable.reservationInput.reservation_snapshot) => {
        snapshot.captured_at = "2026-09-02T00:00:00.000Z";
      },
      (snapshot: typeof unavailable.reservationInput.reservation_snapshot) => {
        const anchor = snapshot.reservations.find((entry) => entry.source.kind === "active_writer");
        if (anchor?.source.kind === "active_writer") anchor.source.lease_id = "wrong-lease";
      },
      (snapshot: typeof unavailable.reservationInput.reservation_snapshot) => {
        const anchor = snapshot.reservations.find((entry) => entry.source.kind === "active_writer");
        if (anchor) anchor.head_sha = "3".repeat(40);
      },
    ]) {
      const v = input();
      expect(
        authorForwardPlanTransaction(
          v,
          deps({
            freshReservationAuthority: () => {
              const snapshot = structuredClone(
                providerSnapshots.get(v.repoRoot) as typeof v.reservationInput.reservation_snapshot,
              );
              mutate(snapshot);
              return { snapshot, snapshot_digest: sha256Digest(canonicalJson(snapshot)) };
            },
          }),
        ),
      ).toMatchObject({ ok: false, findings: ["fresh_reservation_authority_mismatch"] });
    }
    const collision = input(),
      conflicting = {
        ...structuredClone(collision.reservationInput.reservation_snapshot.reservations[0]),
        plan_id: "PLAN-REVERSE-900-conflict",
        plan_path: "docs/plans/PLAN-REVERSE-900-conflict.md",
        source: { kind: "open_pr" as const, branch: "feature/conflict", pr_number: 1300 },
        lifecycle: "open" as const,
      };
    collision.reservationInput.reservation_snapshot.reservations.push(conflicting);
    writeFileSync(
      join(collision.repoRoot, collision.reservationAuthorityPath),
      `${canonicalJson(collision.reservationInput.reservation_snapshot)}\n`,
    );
    providerSnapshots.set(
      collision.repoRoot,
      structuredClone(collision.reservationInput.reservation_snapshot),
    );
    expect(authorForwardPlanTransaction(collision, deps())).toMatchObject({
      ok: false,
      findings: ["reservation_authority_invalid"],
    });
  });
});

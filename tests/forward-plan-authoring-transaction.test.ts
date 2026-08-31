import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { canonicalJson, sha256Digest } from "../src/runtime/digest";
import {
  authorForwardPlanTransaction,
  type ForwardPlanAuthoringTransactionInput,
} from "../src/runtime/forward-plan-authoring-transaction";
import { OPEN_BRANCH_PLAN_RESERVATION_SCHEMA } from "../src/runtime/open-branch-plan-identity-reservation";

// PLAN-L7-720-forward-reverse-terminal-reservation

const MAIN = "1".repeat(40);
const HEAD = "2".repeat(40);
const roots: string[] = [];

function documents() {
  return {
    forward:
      "---\nplan_id: PLAN-L7-720-forward\nkind: add-impl\nstatus: draft\nbackfill_state: pending_reverse\ncompletion_claim_allowed: false\ngithub_issue_id: 1297\nresponsibility_owner: forward-reverse-terminal-reservation\ndependencies:\n  references:\n    - docs/plans/PLAN-REVERSE-901-forward.md\n---\n# Forward\n",
    reverse:
      "---\nplan_id: PLAN-REVERSE-901-forward\nkind: reverse\nstatus: draft\nbackfill_state: pending_reverse\ncompletion_claim_allowed: false\ngithub_issue_id: 1297\nresponsibility_owner: forward-reverse-terminal-reservation\ndependencies:\n  references:\n    - docs/plans/PLAN-L7-720-forward.md\n---\n# Reverse reservation\n",
  };
}

function input(): ForwardPlanAuthoringTransactionInput {
  const repoRoot = mkdtempSync(join(tmpdir(), "helix-forward-authoring-"));
  roots.push(repoRoot);
  const docs = documents();
  const allocationPayload = {
    allocation_id: "allocation-1297",
    forward_plan_id: "PLAN-L7-720-forward",
    reverse_plan_id: "PLAN-REVERSE-901-forward",
    reverse_plan_blob_digest: sha256Digest(docs.reverse),
  };
  return {
    repoRoot,
    forwardDocument: docs.forward,
    reverseDocument: docs.reverse,
    reservationInput: {
      forward: {
        plan_id: "PLAN-L7-720-forward",
        kind: "add-impl",
        target_axis: "workflow_model",
        target_id: "ADD_FEATURE",
        owner_issue: 1297,
        responsibility_owner: "forward-reverse-terminal-reservation",
        plan_blob_digest: sha256Digest(docs.forward),
      },
      allocation: {
        ...allocationPayload,
        receipt_digest: sha256Digest(canonicalJson(allocationPayload)),
      },
      branch: "feature/1297-forward-reverse-vehicle-reservation",
      assignment_id: "assignment-1297",
      lease_id: "lease-1297",
      fence_token: "fence-1297",
      candidate_head: HEAD,
      ancestor_head_shas: [MAIN],
      expected_main_head: MAIN,
      observed_main_head: MAIN,
      reservation_snapshot: {
        schema_version: OPEN_BRANCH_PLAN_RESERVATION_SCHEMA,
        repository: "RetryYN/HELIX-HARNESS",
        captured_at: "2026-09-01T00:00:00.000Z",
        evidence: {
          current_main: { status: "available", error_digest: null },
          open_pr_heads: { status: "available", error_digest: null },
          active_writer_branches: { status: "available", error_digest: null },
        },
        reservations: [
          {
            plan_id: "PLAN-L7-700-main",
            owner_issue: 1200,
            responsibility_owner: "main-plan",
            plan_path: "docs/plans/PLAN-L7-700-main.md",
            plan_blob_digest: sha256Digest("main"),
            head_sha: MAIN,
            ancestor_head_shas: [],
            source: { kind: "current_main", branch: "main" },
            lifecycle: "current",
            terminal_evidence: null,
          },
        ],
      },
    },
  };
}

afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

describe("Forward PLAN authoring transaction", () => {
  it("U-FPATR-001: dry-runはpairを検証するがfilesystemへ書かない", () => {
    const value = input();
    const result = authorForwardPlanTransaction(
      { ...value, dryRun: true },
      { currentHead: () => HEAD },
    );
    expect(result).toMatchObject({ ok: true, status: "planned", written_paths: [] });
    expect(existsSync(join(value.repoRoot, "docs"))).toBe(false);
    expect(existsSync(join(value.repoRoot, ".helix"))).toBe(false);

    const cliInput = input();
    cliInput.reservationInput.candidate_head = execFileSync("git", ["rev-parse", "HEAD"], {
      encoding: "utf8",
    }).trim();
    const inputPath = join(cliInput.repoRoot, "authoring.json");
    writeFileSync(inputPath, JSON.stringify(cliInput));
    const cli = spawnSync(
      "npx",
      ["tsx", "src/cli.ts", "plan", "author-forward", "--input", inputPath, "--dry-run", "--json"],
      { cwd: process.cwd(), encoding: "utf8" },
    );
    expect(cli.status, cli.stderr).toBe(0);
    expect(JSON.parse(cli.stdout)).toMatchObject({
      ok: true,
      status: "planned",
      written_paths: [],
    });
  });

  it("U-FPATR-002: Forwardとpending Reverseを同時materializeしretryを冪等化する", () => {
    const value = input();
    const first = authorForwardPlanTransaction(value, { currentHead: () => HEAD });
    expect(first).toMatchObject({ ok: true, status: "committed" });
    expect(first.written_paths).toEqual([
      "docs/plans/PLAN-L7-720-forward.md",
      "docs/plans/PLAN-REVERSE-901-forward.md",
    ]);
    expect(readFileSync(join(value.repoRoot, first.written_paths[0] as string), "utf8")).toBe(
      value.forwardDocument,
    );
    expect(readFileSync(join(value.repoRoot, first.written_paths[1] as string), "utf8")).toBe(
      value.reverseDocument,
    );
    expect(authorForwardPlanTransaction(value, { currentHead: () => HEAD })).toMatchObject({
      ok: true,
      status: "idempotent",
      written_paths: [],
    });
  });

  it("U-FPATR-003: stale HEADとdigest driftでは計画pathへ一切書かない", () => {
    const stale = input();
    expect(
      authorForwardPlanTransaction(stale, { currentHead: () => "3".repeat(40) }),
    ).toMatchObject({ ok: false, findings: ["stale_candidate_head"], written_paths: [] });
    expect(existsSync(join(stale.repoRoot, "docs"))).toBe(false);

    const drift = input();
    drift.forwardDocument += "drift\n";
    expect(authorForwardPlanTransaction(drift, { currentHead: () => HEAD })).toMatchObject({
      ok: false,
      findings: ["forward_document_digest_drift"],
      written_paths: [],
    });
    expect(existsSync(join(drift.repoRoot, "docs"))).toBe(false);
  });

  it("U-FPATR-004: collisionとcommit直前HEAD driftをfail-closeする", () => {
    const collision = input();
    const existing = join(collision.repoRoot, "docs/plans/PLAN-L7-720-forward.md");
    mkdirSync(join(collision.repoRoot, "docs/plans"), { recursive: true });
    writeFileSync(existing, "foreign");
    expect(authorForwardPlanTransaction(collision, { currentHead: () => HEAD })).toMatchObject({
      ok: false,
      findings: ["plan_path_collision"],
    });

    const stale = input();
    let head = HEAD;
    const result = authorForwardPlanTransaction(stale, {
      currentHead: () => head,
      beforeCommit: () => {
        head = "4".repeat(40);
      },
    });
    expect(result).toMatchObject({ ok: false, findings: ["stale_candidate_head"] });
    expect(existsSync(join(stale.repoRoot, "docs/plans/PLAN-L7-720-forward.md"))).toBe(false);
    expect(existsSync(join(stale.repoRoot, "docs/plans/PLAN-REVERSE-901-forward.md"))).toBe(false);
  });

  it("U-FPATR-005: prose内tokenでfrontmatter契約を偽装できない", () => {
    const value = input();
    value.forwardDocument = value.forwardDocument.replace(
      "github_issue_id: 1297",
      "github_issue_id: 9999",
    );
    value.forwardDocument +=
      "\n<!-- github_issue_id: 1297 responsibility_owner: forward-reverse-terminal-reservation -->\n";
    value.reservationInput.forward.plan_blob_digest = sha256Digest(value.forwardDocument);
    expect(authorForwardPlanTransaction(value, { currentHead: () => HEAD })).toMatchObject({
      ok: false,
      findings: ["document_contract_drift"],
      written_paths: [],
    });
    expect(existsSync(join(value.repoRoot, "docs"))).toBe(false);
  });

  it("U-FPATR-006: dead owner lockは回収しlive owner lockは拒否する", () => {
    const stale = input();
    const staleLock = join(stale.repoRoot, ".helix/state/forward-plan-authoring.lock");
    mkdirSync(staleLock, { recursive: true });
    writeFileSync(join(staleLock, "owner.json"), `${JSON.stringify({ pid: 2_147_483_647 })}\n`);
    expect(authorForwardPlanTransaction(stale, { currentHead: () => HEAD })).toMatchObject({
      ok: true,
      status: "committed",
    });

    const live = input();
    const liveLock = join(live.repoRoot, ".helix/state/forward-plan-authoring.lock");
    mkdirSync(liveLock, { recursive: true });
    writeFileSync(join(liveLock, "owner.json"), `${JSON.stringify({ pid: process.pid })}\n`);
    expect(authorForwardPlanTransaction(live, { currentHead: () => HEAD })).toMatchObject({
      ok: false,
      findings: ["authoring_transaction_locked"],
    });
    expect(existsSync(join(live.repoRoot, "docs"))).toBe(false);
  });
});

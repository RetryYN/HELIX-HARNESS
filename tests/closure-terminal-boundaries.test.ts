import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  foldClosureTerminalBoundaries,
  parseClosureTerminalBoundaryLedger,
  replaceClosureTerminalBoundaryProjection,
} from "../src/state-db/closure-terminal-boundaries";
import { openHarnessDb } from "../src/state-db/index";
import { migrate } from "../src/state-db/migration";

const digest = (value: string) =>
  `sha256:${createHash("sha256").update(value).digest("hex")}` as const;
const stable = (value: unknown): string => {
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  if (value !== null && typeof value === "object")
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, item]) => `${JSON.stringify(key)}:${stable(item)}`)
      .join(",")}}`;
  return JSON.stringify(value);
};
const seal = <T extends Record<string, unknown>>(body: T) => ({
  ...body,
  event_digest: digest(stable(body)),
});
const D = `sha256:${"1".repeat(64)}` as const;
const HEAD = "a".repeat(40);

function events() {
  const opened = seal({
    schema_version: "closure-terminal-boundary-ledger.v1",
    boundary_key: "closure-boundary:PLAN-M-02",
    event_kind: "boundary_opened",
    authority_head: HEAD,
    registry_digest: D,
    initial_set_digest: D,
    cycle_digest: D,
    plan_id: "PLAN-M-02",
    classification: "human_only",
    reason: "irreversible cutover",
    owner: "PO",
    next_decision_route: "action-binding approval",
    automation_terminal: true,
    whole_program_blocker: true,
    previous_event_digest: null,
    supersedes_event_digest: null,
    resolution_authority: null,
  });
  const approvalBody = {
    kind: "action_binding_approval" as const,
    decision_id: "decision-1",
    approved_scope_digest: D,
    receipt_path: "docs/governance/approval.json",
    receipt_digest: D,
  };
  const resolved = seal({
    schema_version: "closure-terminal-boundary-ledger.v1",
    boundary_key: "closure-boundary:PLAN-M-02",
    event_kind: "boundary_resolved",
    authority_head: HEAD,
    registry_digest: D,
    initial_set_digest: D,
    cycle_digest: D,
    plan_id: "PLAN-M-02",
    classification: "human_only",
    reason: "approved cutover completed",
    owner: "PO",
    next_decision_route: "completed",
    automation_terminal: true,
    whole_program_blocker: false,
    previous_event_digest: opened.event_digest,
    supersedes_event_digest: opened.event_digest,
    resolution_authority: {
      ...approvalBody,
      authority_digest: digest(stable(approvalBody)),
    },
  });
  return { opened, resolved };
}

describe("closure terminal boundary ledger", () => {
  it("U-CAC-019: [PLAN-L7-439-closure-authority-convergence/U-CAC-019] strict hash chainをfoldしopened/resolved authorityを保存する", () => {
    const { opened, resolved } = events();
    const parsed = parseClosureTerminalBoundaryLedger(
      Buffer.from(`${JSON.stringify(opened)}\n${JSON.stringify(resolved)}\n`),
    );
    const rows = foldClosureTerminalBoundaries({ events: parsed, sourceBlobDigest: D });
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      plan_id: "PLAN-M-02",
      automation_terminal: 1,
      whole_program_blocker: 0,
      opened_event_digest: opened.event_digest,
      resolved_event_digest: resolved.event_digest,
      resolution_authority_digest: resolved.resolution_authority.authority_digest,
    });
  });

  it("U-CAC-020: [PLAN-L7-439-closure-authority-convergence/U-CAC-020] chain改変、open前resolve、二重open、authority mismatchを拒否する", () => {
    const { opened, resolved } = events();
    expect(() =>
      parseClosureTerminalBoundaryLedger(
        Buffer.from(`${JSON.stringify({ ...opened, reason: "tampered" })}\n`),
      ),
    ).toThrow(/hash chain/);
    expect(() =>
      foldClosureTerminalBoundaries({ events: [resolved] as never, sourceBlobDigest: D }),
    ).toThrow(/without exact open/);
    expect(() =>
      foldClosureTerminalBoundaries({ events: [opened, opened] as never, sourceBlobDigest: D }),
    ).toThrow(/duplicate/);
    expect(() =>
      foldClosureTerminalBoundaries({
        events: [
          opened,
          {
            ...resolved,
            resolution_authority: {
              kind: "confirmed_vpair_recensus",
              design_path: "docs/design/x.md",
              test_design_path: "docs/test-design/x.md",
              merge_head: HEAD,
              recensus_classification_digest: D,
              authority_digest: D,
            },
          },
        ] as never,
        sourceBlobDigest: D,
      }),
    ).toThrow(/authority mismatch/);
  });

  it("U-CAC-021: [PLAN-L7-439-closure-authority-convergence/U-CAC-021] replace projectionはexact setを再現しdirect update/deleteを拒否する", () => {
    const db = openHarnessDb(":memory:");
    try {
      migrate(db);
      const { opened } = events();
      const rows = foldClosureTerminalBoundaries({
        events: [opened] as never,
        sourceBlobDigest: D,
      });
      replaceClosureTerminalBoundaryProjection(db, rows);
      expect(db.prepare("SELECT * FROM closure_terminal_boundaries").all()).toHaveLength(1);
      expect(() => db.prepare("UPDATE closure_terminal_boundaries SET reason='x'").run()).toThrow(
        /immutable/,
      );
      expect(() => db.prepare("DELETE FROM closure_terminal_boundaries").run()).toThrow(
        /immutable/,
      );
      replaceClosureTerminalBoundaryProjection(db, []);
      expect(db.prepare("SELECT * FROM closure_terminal_boundaries").all()).toHaveLength(0);
    } finally {
      db.close();
    }
  });
});

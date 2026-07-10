import { describe, expect, it } from "vitest";
import {
  analyzeRetirementManifestReconcile,
  buildRetirementIntentDigest,
  canRollbackRetirement,
  evaluateRetirementTransition,
  latestCompletedRetirementCheckpoint,
  parseRetirementJournal,
  parseRetirementJournalLine,
  type RetirementJournalEntry,
} from "../src/runtime/continuation";

const digest = (char: string): string => `sha256:${char.repeat(64)}`;
const D = {
  intent: digest("a"),
  otherIntent: digest("b"),
  backup: digest("c"),
  inventory: digest("d"),
  source: digest("e"),
  target: digest("f"),
  memory: digest("1"),
  lifecycle: digest("2"),
  crossRuntime: digest("3"),
  other: digest("4"),
};
const prereqs = {
  reverseR4Green: true,
  memoryGreenDigest: D.memory,
  lifecycleGreenDigest: D.lifecycle,
  crossRuntimeGreenDigest: D.crossRuntime,
};

function entry(overrides: Partial<RetirementJournalEntry> = {}): RetirementJournalEntry {
  const phase = overrides.phase ?? "prerequisite";
  const status = overrides.status ?? "completed";
  const result: RetirementJournalEntry = {
    runId: "run-1",
    operationId: "retire-1",
    intentDigest: D.intent,
    phase,
    status,
    error: status === "failed" ? "fixture failure" : null,
    checkpoint: null,
    backupDigest: D.backup,
    inventoryDigest: D.inventory,
    sourceCount: 2,
    targetCount: 2,
    sourceDigest: D.source,
    targetDigest: D.target,
    occurredAt: "2026-07-11T00:00:00.000Z",
    ...overrides,
  };
  return result;
}

function checkpointOf(prior: RetirementJournalEntry): RetirementJournalEntry["checkpoint"] {
  return {
    phase: prior.phase,
    artifactDigests: {
      backup: prior.backupDigest,
      inventory: prior.inventoryDigest,
      source: prior.sourceDigest,
      target: prior.targetDigest,
    },
  };
}

function sequence(...phases: RetirementJournalEntry["phase"][]): RetirementJournalEntry[] {
  const entries: RetirementJournalEntry[] = [];
  for (const [index, phase] of phases.entries()) {
    const prior = entries.at(-1) ?? null;
    entries.push(
      entry({
        phase,
        checkpoint: prior ? checkpointOf(prior) : null,
        occurredAt: `2026-07-11T00:${String(index).padStart(2, "0")}:00Z`,
      }),
    );
  }
  return entries;
}

describe("session handover runtime retirement", () => {
  it("U-HRET-002: 隣接forward edgeとcutoff前rollbackだけを許可する", () => {
    expect(
      evaluateRetirementTransition({
        currentPhase: "prerequisite",
        targetPhase: "shadow_read",
        operationId: "retire-1",
        intentDigest: D.intent,
        prerequisites: prereqs,
        journal: sequence("prerequisite"),
      }),
    ).toMatchObject({ ok: true, replay: false });
    for (const [currentPhase, targetPhase] of [
      ["prerequisite", "memory_primary"],
      ["memory_primary", "shadow_read"],
      ["legacy_write_disabled", "rolled_back"],
      ["cleanup", "rolled_back"],
      ["complete", "rolled_back"],
    ] as const) {
      expect(
        evaluateRetirementTransition({
          currentPhase,
          targetPhase,
          operationId: "retire-1",
          intentDigest: D.intent,
          prerequisites: prereqs,
          journal: [],
        }).ok,
      ).toBe(false);
    }
  });

  it("U-HRET-002: prerequisite未達・異intent・偽装current phaseを拒否する", () => {
    const missing = evaluateRetirementTransition({
      currentPhase: "prerequisite",
      targetPhase: "shadow_read",
      operationId: "retire-1",
      intentDigest: D.intent,
      prerequisites: { ...prereqs, lifecycleGreenDigest: null },
      journal: sequence("prerequisite"),
    });
    expect(missing.reasons).toContain("missing_lifecycle_green_digest");

    const conflict = evaluateRetirementTransition({
      currentPhase: "prerequisite",
      targetPhase: "shadow_read",
      operationId: "retire-1",
      intentDigest: D.otherIntent,
      prerequisites: prereqs,
      journal: sequence("prerequisite"),
    });
    expect(conflict.reasons).toContain("operation_intent_conflict");

    const forged = evaluateRetirementTransition({
      currentPhase: "memory_primary",
      targetPhase: "legacy_write_disabled",
      operationId: "retire-1",
      intentDigest: D.intent,
      prerequisites: prereqs,
      journal: sequence("prerequisite"),
    });
    expect(forged.reasons).toContain("current_phase_checkpoint_mismatch");
  });

  it("U-HRET-002: journal completed prefixのskip・逆行を拒否する", () => {
    const skipped = evaluateRetirementTransition({
      currentPhase: "cleanup",
      targetPhase: "complete",
      operationId: "retire-1",
      intentDigest: D.intent,
      prerequisites: prereqs,
      journal: [
        ...sequence("prerequisite"),
        entry({
          phase: "cleanup",
          checkpoint: checkpointOf(sequence("prerequisite")[0] as RetirementJournalEntry),
          occurredAt: "2026-07-11T00:01:00Z",
        }),
      ],
    });
    expect(skipped.reasons).toContain("journal_phase_prefix_invalid");

    const duplicate = evaluateRetirementTransition({
      currentPhase: "prerequisite",
      targetPhase: "shadow_read",
      operationId: "retire-1",
      intentDigest: D.intent,
      prerequisites: prereqs,
      journal: [
        ...sequence("prerequisite"),
        entry({
          phase: "prerequisite",
          checkpoint: checkpointOf(sequence("prerequisite")[0] as RetirementJournalEntry),
          occurredAt: "2026-07-11T00:01:00Z",
        }),
      ],
    });
    expect(duplicate.reasons).toContain("journal_phase_prefix_invalid");

    const rollbackThenForward = evaluateRetirementTransition({
      currentPhase: "shadow_read",
      targetPhase: "memory_primary",
      operationId: "retire-1",
      intentDigest: D.intent,
      prerequisites: prereqs,
      journal: [
        ...sequence("prerequisite"),
        entry({
          phase: "rolled_back",
          checkpoint: checkpointOf(sequence("prerequisite")[0] as RetirementJournalEntry),
          occurredAt: "2026-07-11T00:01:00Z",
        }),
        entry({
          phase: "shadow_read",
          checkpoint: checkpointOf(sequence("prerequisite")[0] as RetirementJournalEntry),
          occurredAt: "2026-07-11T00:02:00Z",
        }),
      ],
    });
    expect(rollbackThenForward.reasons).toContain("journal_phase_prefix_invalid");
  });

  it("U-HRET-002: typed intentは必須field・JSON値・一意rootを強制する", () => {
    const a = buildRetirementIntentDigest({
      targetPhase: "shadow_read",
      roots: ["src", "tests"],
      inventoryDigest: D.inventory,
      writerPolicy: "frozen",
    });
    const b = buildRetirementIntentDigest({
      writerPolicy: "frozen",
      inventoryDigest: D.inventory,
      roots: ["src", "tests"],
      targetPhase: "shadow_read",
    });
    expect(a).toBe(b);
    expect(
      buildRetirementIntentDigest({
        targetPhase: "shadow_read",
        roots: ["tests", "src"],
        inventoryDigest: D.inventory,
        writerPolicy: "frozen",
      }),
    ).toBe(a);
    expect(a).toMatch(/^sha256:[a-f0-9]{64}$/);
    expect(() =>
      buildRetirementIntentDigest({
        targetPhase: "shadow_read",
        roots: ["src", "src"],
        inventoryDigest: D.inventory,
        writerPolicy: "frozen",
      }),
    ).toThrow(/roots/);
    expect(() =>
      buildRetirementIntentDigest({
        targetPhase: "shadow_read",
        roots: ["src"],
        inventoryDigest: "invalid",
        writerPolicy: "frozen",
      }),
    ).toThrow(/digest/);
    expect(() =>
      buildRetirementIntentDigest({
        targetPhase: "shadow_read",
        roots: ["../escape"],
        inventoryDigest: D.inventory,
        writerPolicy: "frozen",
      }),
    ).toThrow(/roots/);
  });

  it("U-HRET-004: parserはstatus/error/digest/time/checkpointをfail-close検証する", () => {
    expect(() => parseRetirementJournalLine(JSON.stringify(entry()))).not.toThrow();
    expect(() => parseRetirementJournalLine(JSON.stringify(entry({ occurredAt: "bad" })))).toThrow(
      /occurredAt/,
    );
    expect(() =>
      parseRetirementJournalLine(JSON.stringify(entry({ intentDigest: "bad" }))),
    ).toThrow(/intentDigest/);
    expect(() =>
      parseRetirementJournalLine(JSON.stringify(entry({ status: "failed", error: null }))),
    ).toThrow(/failed error/);
    expect(() =>
      parseRetirementJournalLine(JSON.stringify(entry({ occurredAt: "2026-07-11" }))),
    ).toThrow(/occurredAt/);
    expect(() =>
      parseRetirementJournalLine(JSON.stringify(entry({ occurredAt: "2026-02-30T00:00:00Z" }))),
    ).toThrow(/occurredAt/);
  });

  it("U-HRET-004: resume checkpointはoperation/intent scope内のappend順を使う", () => {
    const scoped = sequence("prerequisite", "shadow_read");
    const [first, second] = scoped;
    if (!first || !second) throw new Error("checkpoint fixture is incomplete");
    const journal = [
      { ...first, occurredAt: "2099-01-01T00:00:00Z" },
      entry({ operationId: "foreign", phase: "cleanup", occurredAt: "2100-01-01T00:00:00Z" }),
      { ...second, occurredAt: "2020-01-01T00:00:00Z" },
    ];
    expect(
      latestCompletedRetirementCheckpoint(journal, {
        operationId: "retire-1",
        intentDigest: D.intent,
      })?.phase,
    ).toBe("shadow_read");
  });

  it("U-HRET-004: trailing partial lineだけ回収し中間破損を拒否する", () => {
    const valid = JSON.stringify(sequence("prerequisite")[0]);
    expect(parseRetirementJournal(`${valid}\n{"runId":`).truncatedTail).toBe(true);
    expect(() => parseRetirementJournal(`${valid}\n{bad}\n${valid}`)).toThrow();
    expect(() =>
      parseRetirementJournal(
        `${valid}\n${JSON.stringify(entry({ phase: "cleanup", checkpoint: null, occurredAt: "2026-07-11T00:01:00Z" }))}`,
      ),
    ).toThrow(/sequence/);
  });

  it("U-HRET-004: completed checkpoint replayは同scope・semantic prefixに限定する", () => {
    const journal = sequence("prerequisite", "shadow_read");
    expect(
      evaluateRetirementTransition({
        currentPhase: "prerequisite",
        targetPhase: "shadow_read",
        operationId: "retire-1",
        intentDigest: D.intent,
        prerequisites: prereqs,
        journal,
      }),
    ).toMatchObject({ ok: true, replay: true });
  });

  it("U-HRET-009: manifestは件数・digest・mode・tracking・重複を照合する", () => {
    const a = { path: "a.md", digest: D.source, mode: 0o644, tracked: true };
    const b = { path: "b.md", digest: D.target, mode: 0o600, tracked: false };
    expect(analyzeRetirementManifestReconcile([a, b], [a, b]).ok).toBe(true);
    const mismatch = analyzeRetirementManifestReconcile(
      [a, b],
      [
        a,
        { ...b, digest: D.other },
        { path: "extra.md", digest: D.backup, mode: 0o644, tracked: true },
      ],
    );
    expect(mismatch).toMatchObject({ ok: false, changed: ["b.md"], extra: ["extra.md"] });
    expect(analyzeRetirementManifestReconcile([a, { ...a }], [a]).duplicateSource).toEqual([
      "a.md",
    ]);
    expect(analyzeRetirementManifestReconcile([a], [a, { ...a }]).duplicateTarget).toEqual([
      "a.md",
    ]);
    expect(
      analyzeRetirementManifestReconcile(
        [{ path: "../escape", digest: D.source, mode: -1, tracked: "yes" as unknown as boolean }],
        [],
      ).invalidSource,
    ).toEqual(["../escape"]);
  });

  it("U-HRET-010: rollbackをvalidated checkpoint・backup/restore・incidentへ結合する", () => {
    const journal = sequence("prerequisite", "shadow_read", "memory_primary");
    expect(
      canRollbackRetirement({
        currentPhase: "memory_primary",
        operationId: "retire-1",
        intentDigest: D.intent,
        journal,
        backupManifestDigest: D.backup,
        restoreDigest: D.backup,
        incidentRecorded: true,
      }),
    ).toEqual({ ok: true, reasons: [] });
    const rejected = canRollbackRetirement({
      currentPhase: "legacy_write_disabled",
      operationId: "foreign",
      intentDigest: D.intent,
      journal,
      backupManifestDigest: "",
      restoreDigest: D.other,
      incidentRecorded: false,
    });
    expect(rejected.ok).toBe(false);
    expect(rejected.reasons).toEqual(
      expect.arrayContaining([
        "rollback_cutoff_reached",
        "rollback_checkpoint_invalid",
        "backup_digest_mismatch",
        "restore_digest_mismatch",
        "rollback_incident_missing",
      ]),
    );
  });
});

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

type Phase = "pair_closure" | "implementation_tdd" | "refactor";
type Slot = {
  queue_id: string;
  phase: Phase;
  workstream: string;
  pair?: "L4_L9" | "L5_L8" | "L6_L7";
  source_path?: string;
  depends_on: string[];
};

const manifest = JSON.parse(readFileSync("docs/governance/l3-downstream-queue.json", "utf8")) as {
  schema_version: string;
  owner_plan_id: string;
  correction_plan_id: string;
  plan_id_policy: string;
  counts: Record<Phase | "pre_execution_total", number>;
  slots: Slot[];
};

const slotsById = new Map(manifest.slots.map((slot) => [slot.queue_id, slot]));
const refactorDisposition = JSON.parse(
  readFileSync("docs/governance/feedback-refactor-disposition.json", "utf8"),
) as {
  bindings: Array<{ family: string; source_path: string }>;
};

describe("PLAN-L3-33 downstream queue numbering", () => {
  it("numbers all 69 slots exactly once without gaps", () => {
    expect(manifest.schema_version).toBe("l3-downstream-queue.v1");
    expect(manifest.owner_plan_id).toBe("PLAN-L3-33-downstream-queue-numbering");
    expect(manifest.correction_plan_id).toBe("PLAN-L3-35-downstream-queue-correction");
    expect(manifest.slots).toHaveLength(69);
    expect(slotsById.size).toBe(69);

    const expectedIds = [
      ...Array.from({ length: 35 }, (_, index) => `L3Q-PC-${String(index + 1).padStart(3, "0")}`),
      ...Array.from({ length: 22 }, (_, index) => `L3Q-IT-${String(index + 1).padStart(3, "0")}`),
      ...Array.from({ length: 12 }, (_, index) => `L3Q-RF-${String(index + 1).padStart(3, "0")}`),
    ];
    expect(manifest.slots.map((slot) => slot.queue_id)).toEqual(expectedIds);
  });

  it("keeps the 35/22/12 phase denominators explicit", () => {
    for (const [phase, expected] of [
      ["pair_closure", 35],
      ["implementation_tdd", 22],
      ["refactor", 12],
    ] as const) {
      expect(manifest.counts[phase]).toBe(expected);
      expect(manifest.slots.filter((slot) => slot.phase === phase)).toHaveLength(expected);
    }
    expect(manifest.counts.pre_execution_total).toBe(69);
  });

  it("binds every implementation/TDD slot to exactly one pair-closure slot", () => {
    for (const slot of manifest.slots.filter((row) => row.phase === "implementation_tdd")) {
      expect(slot.pair).toBe("L6_L7");
      expect(slot.depends_on).toHaveLength(1);
      const dependency = slotsById.get(slot.depends_on[0] ?? "");
      expect(dependency?.phase, slot.queue_id).toBe("pair_closure");
      expect(dependency?.workstream, slot.queue_id).toBe(slot.workstream);
    }
  });

  it("reserves all six workstreams found by the residual responsibility audit", () => {
    const audit = JSON.parse(
      readFileSync("docs/governance/l3-residual-responsibility-audit.json", "utf8"),
    ) as { omitted_workstreams: Array<{ workstream: string }> };
    for (const { workstream } of audit.omitted_workstreams) {
      const slots = manifest.slots.filter((slot) => slot.workstream === workstream);
      expect(
        slots.map((slot) => slot.pair),
        workstream,
      ).toEqual(["L4_L9", "L5_L8", "L6_L7"]);
    }
  });

  it("orders every new L5/L8 pair after its same-workstream L4/L9 pair", () => {
    for (const slot of manifest.slots.filter(
      (row) => row.phase === "pair_closure" && row.pair === "L5_L8" && row.depends_on.length > 0,
    )) {
      expect(slot.depends_on).toHaveLength(1);
      const dependency = slotsById.get(slot.depends_on[0] ?? "");
      expect(dependency?.pair, slot.queue_id).toBe("L4_L9");
      expect(dependency?.workstream, slot.queue_id).toBe(slot.workstream);
    }
  });

  it("preserves the refactor 6/1/5 family and source-path partition", () => {
    const refactors = manifest.slots.filter((slot) => slot.phase === "refactor");
    const count = (family: string) => refactors.filter((slot) => slot.workstream === family).length;
    expect(count("literal_policy_externalization")).toBe(6);
    expect(count("cli_decomposition")).toBe(1);
    expect(count("non_cli_module_decomposition")).toBe(5);
    expect(
      refactors.filter((slot) => slot.source_path === "src/cli.ts").map((slot) => slot.workstream),
    ).toEqual(["literal_policy_externalization", "cli_decomposition"]);

    const expectedPairs = [
      ...new Set(refactorDisposition.bindings.map((row) => `${row.family}:${row.source_path}`)),
    ].sort();
    expect(refactors.map((slot) => `${slot.workstream}:${slot.source_path}`).sort()).toEqual(
      expectedPairs,
    );
  });

  it("does not pre-allocate canonical PLAN IDs or claim G3 completion", () => {
    const plan = readFileSync("docs/plans/PLAN-L3-33-downstream-queue-numbering.md", "utf8");
    expect(manifest.plan_id_policy).toContain("canonical PLAN IDs are generated after G3");
    expect(plan).toContain("status: confirmed");
    expect(plan).toContain("G3承認やdownstream完了を主張しない");
    expect(plan).toContain("L8〜L12実行証拠");
  });
});

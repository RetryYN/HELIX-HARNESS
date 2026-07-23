import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

type Audit = {
  requirement_sets: {
    primary_definition: { count: number };
    predecessor_hardening_delta: {
      functional: number;
      non_functional: number;
      acceptance: number;
      included_in_primary_definition_count: boolean;
    };
  };
  omitted_workstreams: Array<{
    workstream: string;
    source_issue: number;
    requirements: string[];
    missing_pairs: string[];
  }>;
  recount: Record<string, number>;
  decision: string;
};

const audit = JSON.parse(
  readFileSync("docs/governance/l3-residual-responsibility-audit.json", "utf8"),
) as Audit;

describe("L3 residual responsibility audit", () => {
  it("keeps the primary 153 set distinct from the 40-requirement UTH delta", () => {
    expect(audit.requirement_sets.primary_definition.count).toBe(153);
    expect(audit.requirement_sets.predecessor_hardening_delta).toMatchObject({
      functional: 35,
      non_functional: 5,
      acceptance: 27,
      included_in_primary_definition_count: false,
    });

    const primaryLedger = readFileSync(
      "docs/governance/infinity-loop-requirement-definition-ledger.md",
      "utf8",
    );
    expect(primaryLedger).not.toMatch(/UTH-(?:FR|NFR)-/);
  });

  it("accounts for all five UTH oracle domains and the model-effort workstream", () => {
    const uth = audit.omitted_workstreams.filter((item) => item.source_issue === 73);
    const effort = audit.omitted_workstreams.filter((item) => item.source_issue === 75);
    expect(uth).toHaveLength(5);
    expect(effort).toHaveLength(1);
    expect(audit.omitted_workstreams.every((item) =>
      item.missing_pairs.join(",") === "L4_L9,L5_L8,L6_L7"
    )).toBe(true);

    const acceptance = readFileSync(
      "docs/test-design/helix/predecessor-harness-mechanism-hardening-acceptance.md",
      "utf8",
    );
    for (const heading of [
      "固定authority oracle",
      "source・trace・state oracle",
      "runtime・test・guard oracle",
      "GitHub・security・distribution oracle",
      "改善oracle",
    ]) {
      expect(acceptance).toContain(heading);
    }
  });

  it("corrects the incomplete 51-slot denominator to 69", () => {
    expect(audit.recount).toMatchObject({
      omitted_workstreams: 6,
      additional_pair_closure: 12,
      additional_implementation_tdd: 6,
      additional_slots: 18,
      corrected_pair_closure: 35,
      corrected_implementation_tdd: 22,
      refactor: 12,
      corrected_pre_execution_total: 69,
    });
    expect(audit.decision).toContain("51-slot queue is incomplete");
  });

  it("binds issue 75 to the existing L3 requirement but finds no downstream EffortRouter design", () => {
    const l1 = readFileSync(
      "docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md",
      "utf8",
    );
    expect(l1).toMatch(/HIL-FR-63.*Effort Router/);

    const downstream = [
      readFileSync("docs/design/helix/L4-basic-design/infinity-loop-platform-basic-design.md", "utf8"),
      readFileSync("docs/governance/infinity-loop-design-slice-registry.md", "utf8"),
    ].join("\n");
    expect(downstream).not.toMatch(/EffortRouter|HIL-FR-63/);
  });
});

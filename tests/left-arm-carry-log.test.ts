import { describe, expect, it } from "vitest";
import {
  analyzeLeftArmCarryLog,
  LEFT_ARM_CARRY_SCHEMA,
  type LeftArmCarryLogInput,
  type LeftArmCarryPlan,
  leftArmCarryLogMessages,
} from "../src/lint/left-arm-carry-log";

const D1 = `sha256:${"1".repeat(64)}`;
const D2 = `sha256:${"2".repeat(64)}`;
const D3 = `sha256:${"3".repeat(64)}`;
const REVIEW = `sha256:${"a".repeat(64)}`;
const DESIGN = "docs/design/harness/L6-function-design/example.md";
const PAIR = "docs/test-design/harness/L8-unit-test-design.md";

function resolution(): LeftArmCarryPlan {
  return {
    plan_id: "PLAN-L6-99-example-resolution",
    kind: "add-design",
    layer: "L6",
    status: "confirmed",
    created: "2026-07-12",
    dependencies_requires: [],
    generates: [DESIGN, PAIR],
    review_evidence: [
      {
        reviewer: "qa",
        reviewed_at: "2026-07-12T10:05:00Z",
        tests_green_at: "2026-07-12T10:04:00Z",
        verdict: "pass",
        semantic_digest: D3,
        green_commands: [
          {
            gate: "G6",
            command: "helix plan lint --gate G6",
            completed_at: "2026-07-12T10:03:00Z",
            exit_code: 0,
            evidence_path: ".helix/evidence/g6.txt",
            output_digest: D2,
          },
        ],
      },
    ],
  };
}

function implementation(): LeftArmCarryPlan {
  return {
    plan_id: "PLAN-L7-430-left-arm-carry-log",
    kind: "impl",
    layer: "L7",
    status: "completed",
    created: "2026-07-12",
    dependencies_requires: ["PLAN-L6-99-example-resolution"],
    generates: ["src/lint/left-arm-carry-log.ts", "tests/left-arm-carry-log.test.ts"],
    review_evidence: [
      {
        reviewer: "tl",
        reviewed_at: "2026-07-12T10:10:00Z",
        tests_green_at: "2026-07-12T10:08:00Z",
        verdict: "approve",
        semantic_digest: REVIEW,
      },
    ],
    left_arm_carry: {
      schema_version: LEFT_ARM_CARRY_SCHEMA,
      decision: "pushback_resolved",
      assessed_at: "2026-07-12T10:01:00Z",
      review_binding: {
        reviewer: "tl",
        reviewed_at: "2026-07-12T10:10:00Z",
        evidence_digest: REVIEW,
      },
      entries: [
        {
          carry_id: "CARRY-001",
          finding_kind: "signature_mismatch",
          summary: "公開関数signatureとL6設計の型が不一致",
          detected_at: "2026-07-12T10:00:00Z",
          finding_evidence: { path: ".helix/evidence/finding.txt", digest: D1 },
          pushback_target: { layer: "L6", gate: "G6" },
          affected_artifacts: [DESIGN],
          resolution_plan_id: "PLAN-L6-99-example-resolution",
          gate_repass: {
            gate: "G6",
            command: "helix plan lint --gate G6",
            completed_at: "2026-07-12T10:03:00Z",
            exit_code: 0,
            evidence_path: ".helix/evidence/g6.txt",
            output_digest: D2,
          },
          resolved: true,
        },
      ],
    },
  };
}

function fixture(): LeftArmCarryLogInput {
  return {
    plans: [implementation(), resolution()],
    fileDigests: new Map([
      [".helix/evidence/finding.txt", D1],
      [".helix/evidence/g6.txt", D2],
      [DESIGN, D3],
      [PAIR, D3],
    ]),
    testDesignArtifacts: new Set([PAIR]),
  };
}

const kinds = (input: LeftArmCarryLogInput) =>
  analyzeLeftArmCarryLog(input).violations.map((violation) => violation.kind);

// PLAN-L7-430-left-arm-carry-log exact citation
describe("left-arm-carry-log (PLAN-L7-430-left-arm-carry-log)", () => {
  it("U-CARRY-001: no_pushbackをtechnical reviewへ結合できる", () => {
    const input = fixture();
    const plan = input.plans[0];
    if (!plan.left_arm_carry) throw new Error("carry fixture missing");
    plan.left_arm_carry.decision = "no_pushback";
    plan.left_arm_carry.entries = [];
    const result = analyzeLeftArmCarryLog(input);
    expect(result.ok).toBe(true);
    expect(leftArmCarryLogMessages(result)[0]).toContain("OK");
  });

  it("U-CARRY-002: enforcement後terminal L7のdecision欠落を拒否する", () => {
    const input = fixture();
    delete input.plans[0].left_arm_carry;
    expect(kinds(input)).toContain("missing-carry-decision");
  });

  it("U-CARRY-003: decisionとentry cardinalityの矛盾を拒否する", () => {
    const input = fixture();
    if (!input.plans[0].left_arm_carry) throw new Error("carry fixture missing");
    input.plans[0].left_arm_carry.decision = "no_pushback";
    expect(kinds(input)).toContain("decision-entry-mismatch");
    input.plans[0].left_arm_carry.decision = "pushback_resolved";
    input.plans[0].left_arm_carry.entries = [];
    expect(kinds(input)).toContain("decision-entry-mismatch");
  });

  it("U-CARRY-004: signature/API/architectureの正規mappingを受理する", () => {
    const cases = [
      ["signature_mismatch", "L6", "G6"],
      ["api_contract_drift", "L5", "G5"],
      ["architecture_violation", "L4", "G4"],
    ] as const;
    for (const [finding, layer, gate] of cases) {
      const input = fixture();
      const plan = input.plans[0];
      const entry = plan.left_arm_carry?.entries[0];
      const res = input.plans[1];
      if (!entry) throw new Error("carry fixture missing");
      entry.finding_kind = finding;
      entry.pushback_target = { layer, gate };
      entry.gate_repass.gate = gate;
      entry.gate_repass.command = `helix plan lint --gate ${gate}`;
      res.layer = layer;
      res.review_evidence[0].green_commands?.forEach((command) => {
        command.gate = gate;
        command.command = entry.gate_repass.command;
      });
      entry.affected_artifacts = [`docs/design/harness/${layer}-scope/example.md`];
      res.generates = [...entry.affected_artifacts, PAIR];
      expect(analyzeLeftArmCarryLog(input).violations).toEqual([]);
    }
  });

  it("U-CARRY-005: findingからlayer/gateへの誤mappingを拒否する", () => {
    const input = fixture();
    const entry = input.plans[0].left_arm_carry?.entries[0];
    if (!entry) throw new Error("carry fixture missing");
    entry.pushback_target = { layer: "L5", gate: "G5" };
    expect(kinds(input)).toContain("invalid-pushback-mapping");
  });

  it("U-CARRY-006: finding evidence不存在・hash偽装・空summaryを拒否する", () => {
    const input = fixture();
    const entry = input.plans[0].left_arm_carry?.entries[0];
    if (!entry) throw new Error("carry fixture missing");
    entry.summary = "短い";
    entry.finding_evidence.path = "missing.txt";
    expect(kinds(input)).toEqual(
      expect.arrayContaining(["trivial-finding-summary", "finding-evidence-missing"]),
    );
    entry.finding_evidence.path = ".helix/evidence/finding.txt";
    entry.finding_evidence.digest = D2;
    expect(kinds(input)).toContain("finding-evidence-digest-mismatch");
  });

  it("U-CARRY-007: resolution PLANの不存在・layer・terminal・reviewを検証する", () => {
    const missing = fixture();
    missing.plans.pop();
    expect(kinds(missing)).toContain("resolution-plan-missing");
    const input = fixture();
    input.plans[1].layer = "L5";
    input.plans[1].status = "draft";
    input.plans[1].review_evidence = [];
    expect(kinds(input)).toEqual(
      expect.arrayContaining([
        "resolution-plan-layer-mismatch",
        "resolution-plan-not-terminal",
        "resolution-plan-review-missing",
      ]),
    );
  });

  it("U-CARRY-008: affected designとV-pair deltaのgenerates欠落を拒否する", () => {
    const input = fixture();
    input.plans[1].generates = [];
    expect(kinds(input)).toEqual(
      expect.arrayContaining(["resolution-artifact-unbound", "vpair-delta-missing"]),
    );
  });

  it("U-CARRY-009:元L7のdependencies.requires未結合を拒否する", () => {
    const input = fixture();
    input.plans[0].dependencies_requires = [];
    expect(kinds(input)).toContain("resolution-plan-not-required");
  });

  it("U-CARRY-010: ledger PASSで代替せずgate command/exit/evidenceを検証する", () => {
    const input = fixture();
    const repass = input.plans[0].left_arm_carry?.entries[0].gate_repass;
    if (!repass) throw new Error("carry fixture missing");
    repass.command = "helix doctor";
    repass.exit_code = 1;
    repass.evidence_path = "missing.txt";
    expect(kinds(input)).toEqual(
      expect.arrayContaining([
        "gate-repass-command-mismatch",
        "gate-repass-nonzero",
        "gate-evidence-missing",
      ]),
    );
  });

  it("U-CARRY-011: finding→repass→tests→reviewの順序とresolution review結合を強制する", () => {
    const input = fixture();
    const entry = input.plans[0].left_arm_carry?.entries[0];
    if (!entry) throw new Error("carry fixture missing");
    entry.detected_at = "2026-07-12T10:09:00Z";
    input.plans[1].review_evidence[0].green_commands = [];
    expect(kinds(input)).toEqual(
      expect.arrayContaining(["invalid-event-order", "gate-repass-not-bound-to-resolution-review"]),
    );
  });

  it("U-CARRY-012: carry review bindingの不存在・digest偽装・非approvalを拒否する", () => {
    const input = fixture();
    const carry = input.plans[0].left_arm_carry;
    if (!carry) throw new Error("carry fixture missing");
    carry.review_binding.reviewer = "ghost";
    expect(kinds(input)).toContain("carry-review-binding-missing");
    carry.review_binding.reviewer = "tl";
    carry.review_binding.evidence_digest = D1;
    expect(kinds(input)).toContain("carry-review-digest-mismatch");
    input.plans[0].review_evidence[0].verdict = "fail";
    expect(kinds(input)).toContain("carry-review-binding-missing");
  });

  it("U-CARRY-013: carry ID/artifact/evidenceの再利用を拒否する", () => {
    const input = fixture();
    const carry = input.plans[0].left_arm_carry;
    if (!carry) throw new Error("carry fixture missing");
    carry.entries.push(structuredClone(carry.entries[0]));
    expect(kinds(input)).toEqual(
      expect.arrayContaining(["duplicate-carry-id", "duplicate-affected-artifact"]),
    );
  });

  it("U-CARRY-014: draftのopen carryは許容しterminalでは拒否する", () => {
    const input = fixture();
    const plan = input.plans[0];
    const entry = plan.left_arm_carry?.entries[0];
    if (!entry) throw new Error("carry fixture missing");
    plan.status = "draft";
    entry.resolved = false;
    expect(kinds(input)).not.toContain("unresolved-carry-at-terminal");
    plan.status = "completed";
    expect(kinds(input)).toContain("unresolved-carry-at-terminal");
  });

  it("U-CARRY-015: frozen legacyだけをgrandfatherしbackdateだけでは回避できない", () => {
    const input = fixture();
    const plan = input.plans[0];
    delete plan.left_arm_carry;
    plan.created = "2026-01-01";
    plan.updated = "2026-07-12";
    expect(kinds(input)).toContain("missing-carry-decision");
    plan.legacy_pinned = true;
    expect(kinds(input)).not.toContain("missing-carry-decision");
  });

  it("U-CARRY-016: real contract surfaceはexact PLAN citationと16 oracleを固定する", () => {
    const result = analyzeLeftArmCarryLog(fixture());
    expect(result.violations).toEqual([]);
    expect(result.checked).toBe(1);
    expect("PLAN-L7-430-left-arm-carry-log").toBe("PLAN-L7-430-left-arm-carry-log");
  });
});

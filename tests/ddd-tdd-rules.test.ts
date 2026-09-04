import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  analyzeDddTddRules,
  type DddTddInputs,
  dddTddRulesMessages,
  loadDddTddInputs,
} from "../src/lint/ddd-tdd-rules";

function baseInputs(overrides: Partial<DddTddInputs> = {}): DddTddInputs {
  return {
    policy: {
      path: "docs/governance/ddd-tdd-rules.md",
      text: `
- id: domain-boundary
- id: invariant-test-trace
- id: red-first-evidence
- id: test-oracle-strength
- id: integration-gwt
- id: unit-oracle-substance
- id: mutation-oracle
- id: engineering-discipline-contract
- id: atomic-change-contract
- id: DDD-INV-001; oracle: U-DDDTDD-002
`,
      ruleIds: [
        "domain-boundary",
        "invariant-test-trace",
        "red-first-evidence",
        "test-oracle-strength",
        "integration-gwt",
        "unit-oracle-substance",
        "mutation-oracle",
        "engineering-discipline-contract",
        "atomic-change-contract",
      ],
    },
    workflowDocs: [
      {
        path: "docs/governance/ddd-tdd-rules.md",
        exists: true,
        text: "Workflow Placement\nG3\nL4/L9\nL5/L8\nno-code-first\nForward L6\nAdd-feature\nL7 Red\n",
      },
      {
        path: "docs/process/forward/L00-L06-design-phase.md",
        exists: true,
        text: "DDD-TDD-WORKFLOW docs/governance/ddd-tdd-rules.md engineering_discipline_required",
      },
      {
        path: "docs/process/modes/add-feature.md",
        exists: true,
        text: "DDD-TDD-WORKFLOW docs/governance/ddd-tdd-rules.md add-design add-impl engineering_discipline_required",
      },
    ],
    docs: [
      {
        path: "tests/strong.test.ts",
        scope: "test",
        text: 'import { it, expect } from "vitest";\nit("checks value", () => { expect(1).toBe(1); });',
      },
    ],
    l7Text: "U-DDDTDD-002",
    l8Text:
      "| IT-ID | Given | When | Then | Fixture / Boundary | Assertions | Negative / Edge |\n| IT-DDD-01 | a | b | c | d | e | f |",
    plans: [],
    ...overrides,
  };
}

describe("U-DDDTDD DDD/TDD strictness lint", () => {
  it("detects SSoT policy drift", () => {
    const result = analyzeDddTddRules(
      baseInputs({
        policy: {
          path: "docs/governance/ddd-tdd-rules.md",
          text: "- id: domain-boundary\n- id: unknown-rule\n",
          ruleIds: ["domain-boundary", "unknown-rule"],
        },
      }),
    );
    expect(result.ok).toBe(false);
    expect(result.violations.map((v) => v.rule)).toContain("ddd-tdd-policy-missing-rule");
    expect(result.violations.map((v) => v.rule)).toContain("ddd-tdd-policy-unknown-rule");
  });

  it("detects missing workflow placement", () => {
    const result = analyzeDddTddRules(baseInputs({ workflowDocs: [] }));
    expect(result.ok).toBe(false);
    expect(result.violations.map((v) => v.rule)).toContain("ddd-tdd-workflow-missing-doc");
  });

  it("detects domain boundary reverse imports", () => {
    const result = analyzeDddTddRules(
      baseInputs({
        docs: [
          {
            path: "src/lint/bad-boundary.ts",
            scope: "source",
            text: 'import { detectMode } from "../runtime/detect";\nexport const x = detectMode;',
          },
          {
            path: "tests/strong.test.ts",
            scope: "test",
            text: 'import { it, expect } from "vitest";\nit("checks value", () => { expect(1).toBe(1); });',
          },
        ],
      }),
    );
    expect(result.ok).toBe(false);
    expect(result.violations.map((v) => v.rule)).toContain("domain-boundary");
  });

  it("U-DDDTDD-010: applies the same canonical source-boundary matrix as module-boundary", () => {
    const result = analyzeDddTddRules(
      baseInputs({
        docs: [
          {
            path: "src/lint/bad-gate-boundary.ts",
            scope: "source",
            text: 'import { runGate } from "../gate/run";\nexport const x = runGate;',
          },
          {
            path: "tests/strong.test.ts",
            scope: "test",
            text: 'import { it, expect } from "vitest";\nit("checks value", () => { expect(1).toBe(1); });',
          },
        ],
      }),
    );

    expect(result.ok).toBe(false);
    expect(result.violations.map((v) => v.rule)).toContain("domain-boundary");
  });

  it("U-DDDTDD-011: owner-crossing compositionは専用moduleだけに置く", () => {
    const result = analyzeDddTddRules(
      baseInputs({
        docs: [
          {
            path: "src/composition/db-rebuild-composition.ts",
            scope: "source",
            text: 'import { tree } from "../vmodel/visualization-tree-projector";\nexport const x = tree;',
          },
          {
            path: "src/runtime/bad-composition.ts",
            scope: "source",
            text: 'import { tree } from "../vmodel/visualization-tree-projector";\nexport const x = tree;',
          },
        ],
      }),
    );

    expect(result.violations).toEqual([
      expect.objectContaining({ path: "src/runtime/bad-composition.ts", rule: "domain-boundary" }),
    ]);
  });

  it("detects invariant rows without L7 oracle trace", () => {
    const result = analyzeDddTddRules(baseInputs({ l7Text: "" }));
    expect(result.ok).toBe(false);
    expect(result.violations.map((v) => v.rule)).toContain("invariant-test-trace");
  });

  it("detects confirmed TDD plans without red-first evidence or with inverted evidence", () => {
    const result = analyzeDddTddRules(
      baseInputs({
        plans: [
          {
            path: "docs/plans/PLAN-L7-99-missing-red.md",
            text: "---\nstatus: confirmed\ntdd_red_required: true\n---",
          },
          {
            path: "docs/plans/PLAN-L7-98-inverted-red.md",
            text: "---\nstatus: confirmed\ntdd_red_required: true\nred_at: 2026-06-09T10:00:00Z\ngreen_at: 2026-06-09T09:00:00Z\n---",
          },
        ],
      }),
    );
    expect(result.ok).toBe(false);
    expect(result.violations.filter((v) => v.rule === "red-first-evidence")).toHaveLength(2);
  });

  it("U-EDISC-001: [PLAN-L7-463-engineering-discipline-contract] requires the engineering discipline contract on new L3-L7 PLANs", () => {
    const result = analyzeDddTddRules(
      baseInputs({
        plans: [
          {
            path: "docs/plans/PLAN-L4-999-missing-discipline.md",
            text: "---\ncreated: 2026-07-25\nlayer: L4\nstatus: draft\n---",
          },
        ],
      }),
    );
    expect(result.violations).toEqual([
      expect.objectContaining({ rule: "engineering-discipline-contract" }),
    ]);
  });

  it("U-EDISC-002: [PLAN-L7-463-engineering-discipline-contract] accepts no-code and non-object modeling as explicit discipline decisions", () => {
    const result = analyzeDddTddRules(
      baseInputs({
        plans: [
          {
            path: "docs/plans/PLAN-L4-998-no-code.md",
            text: [
              "---",
              "created: 2026-07-25",
              "layer: L4",
              "status: draft",
              "engineering_discipline_required: true",
              "behavior_contract_id: U-SAMPLE-001",
              "responsibility_owner: sample-policy",
              "change_slice: atomic",
              "refactor_step: not_applicable",
              "legacy_retirement_state: not_applicable",
              "no_code_decision: no_change",
              "ddd_modeling_decision: none",
              'contract_preconditions: "none: documentation-only decision"',
              'contract_postconditions: "observable behavior is unchanged"',
              'contract_invariants: "existing public contract remains stable"',
              'contract_failures: "no new failure mode"',
              "tdd_red_required: false",
              "complexity_effect: net_negative",
              "---",
            ].join("\n"),
          },
        ],
      }),
    );
    expect(result.violations.map((v) => v.rule)).not.toContain("engineering-discipline-contract");
  });

  it("U-EDISC-003: [PLAN-L7-463-engineering-discipline-contract] requires justification and removal trigger when code or complexity grows", () => {
    const result = analyzeDddTddRules(
      baseInputs({
        plans: [
          {
            path: "docs/plans/PLAN-L6-997-add-code.md",
            text: [
              "---",
              "created: 2026-07-25",
              "layer: L6",
              "status: draft",
              "engineering_discipline_required: true",
              "behavior_contract_id: U-SAMPLE-002",
              "responsibility_owner: normalized-value",
              "change_slice: atomic",
              "refactor_step: introduce_contract",
              "legacy_retirement_state: retained",
              "no_code_decision: add_code",
              "ddd_modeling_decision: value_object",
              'contract_preconditions: "validated input"',
              'contract_postconditions: "typed result"',
              'contract_invariants: "value remains normalized"',
              'contract_failures: "returns typed error atomically"',
              "tdd_red_required: true",
              "complexity_effect: justified_positive",
              "---",
            ].join("\n"),
          },
        ],
      }),
    );
    expect(result.violations).toEqual([
      expect.objectContaining({
        rule: "engineering-discipline-contract",
        message: expect.stringContaining("removal_trigger"),
      }),
    ]);
  });

  it("U-EDISC-004: [PLAN-L7-463-engineering-discipline-contract] rejects non-atomic slices and legacy removal before consumer zero", () => {
    const result = analyzeDddTddRules(
      baseInputs({
        plans: [
          {
            path: "docs/plans/PLAN-L7-996-non-atomic-refactor.md",
            text: [
              "---",
              "created: 2026-07-25",
              "layer: L7",
              "status: draft",
              "engineering_discipline_required: true",
              "behavior_contract_id: U-SAMPLE-003",
              "responsibility_owner: legacy-adapter",
              "change_slice: bundled",
              "refactor_step: remove_legacy",
              "legacy_retirement_state: consumer_migration",
              "no_code_decision: delete",
              "ddd_modeling_decision: adapter",
              'contract_preconditions: "dual green"',
              'contract_postconditions: "legacy removed"',
              'contract_invariants: "public behavior unchanged"',
              'contract_failures: "rollback restores legacy"',
              "tdd_red_required: false",
              "complexity_effect: net_negative",
              "---",
            ].join("\n"),
          },
        ],
      }),
    );
    expect(result.violations.filter((v) => v.rule === "atomic-change-contract")).toHaveLength(2);
  });

  it("U-EDISC-005: [PLAN-RECOVERY-45-cross-layer-discipline] validates any PLAN that opts into the discipline contract, including layers outside L3-L7", () => {
    const crossPlan = (planId: string, overrides: Record<string, string>): string => {
      const fields: Record<string, string> = {
        created: "2026-08-10",
        layer: "cross",
        status: "draft",
        engineering_discipline_required: "true",
        behavior_contract_id: "U-SAMPLE-004",
        responsibility_owner: "cross-layer-policy",
        change_slice: "atomic",
        refactor_step: "not_applicable",
        legacy_retirement_state: "not_applicable",
        no_code_decision: "modify",
        ddd_modeling_decision: "pure_function",
        contract_preconditions: '"gate skips cross layers"',
        contract_postconditions: '"gate honours the declaration"',
        contract_invariants: '"L3-L7 judgement is unchanged"',
        contract_failures: '"unknown vocabulary is reported"',
        tdd_red_required: "false",
        complexity_effect: "net_neutral",
        ...overrides,
      };
      const body = Object.entries(fields)
        .map(([k, v]) => `${k}: ${v}`)
        .join("\n");
      return `---\n${body}\n---\n<!-- ${planId} -->`;
    };

    // 宣言どおりの語彙なら layer が cross でも通る
    const clean = analyzeDddTddRules(
      baseInputs({
        plans: [
          { path: "docs/plans/PLAN-RECOVERY-995-cross-clean.md", text: crossPlan("clean", {}) },
        ],
      }),
    );
    expect(clean.violations.map((v) => v.rule)).not.toContain("engineering-discipline-contract");
    expect(clean.violations.map((v) => v.rule)).not.toContain("atomic-change-contract");

    // enum 外の語彙は layer=cross でも検出される（現行 gate はここを素通しする）
    const drifted = analyzeDddTddRules(
      baseInputs({
        plans: [
          {
            path: "docs/plans/PLAN-RECOVERY-996-cross-drifted.md",
            text: crossPlan("drifted", {
              refactor_step: "modify",
              complexity_effect: "justified_neutral",
              legacy_retirement_state: "retired",
            }),
          },
        ],
      }),
    );
    expect(
      drifted.violations.filter((v) => v.rule === "engineering-discipline-contract"),
    ).toHaveLength(1);
    expect(drifted.violations.filter((v) => v.rule === "atomic-change-contract")).toHaveLength(2);

    // 宣言していない非 L3-L7 PLAN には従来どおり opt-in を強制しない
    const notDeclared = analyzeDddTddRules(
      baseInputs({
        plans: [
          {
            path: "docs/plans/PLAN-RECOVERY-997-cross-opt-out.md",
            text: "---\ncreated: 2026-08-10\nlayer: cross\nstatus: draft\n---",
          },
        ],
      }),
    );
    expect(notDeclared.violations.map((v) => v.rule)).not.toContain(
      "engineering-discipline-contract",
    );

    // cutoff 前の PLAN は宣言していても grandfathered のまま（遡及的な記入要求を出さない）
    const grandfathered = analyzeDddTddRules(
      baseInputs({
        plans: [
          {
            path: "docs/plans/PLAN-RECOVERY-998-pre-cutoff.md",
            text: crossPlan("pre-cutoff", {
              created: "2026-07-20",
              refactor_step: "modify",
              complexity_effect: "justified_neutral",
            }),
          },
        ],
      }),
    );
    expect(grandfathered.violations.map((v) => v.rule)).not.toContain(
      "engineering-discipline-contract",
    );
    expect(grandfathered.violations.map((v) => v.rule)).not.toContain("atomic-change-contract");
  });

  it("detects confirmed TDD plans without concrete mutation oracle evidence", () => {
    const result = analyzeDddTddRules(
      baseInputs({
        plans: [
          {
            path: "docs/plans/PLAN-L7-97-missing-mutation.md",
            text: [
              "---",
              "status: confirmed",
              "tdd_red_required: true",
              "red_at: 2026-06-09T09:00:00Z",
              "green_at: 2026-06-09T10:00:00Z",
              "---",
            ].join("\n"),
          },
          {
            path: "docs/plans/PLAN-L7-96-placeholder-mutation.md",
            text: [
              "---",
              "status: confirmed",
              "mutation_oracle_required: true",
              'mutation_oracle_evidence: "TBD"',
              "---",
            ].join("\n"),
          },
        ],
      }),
    );
    expect(result.ok).toBe(false);
    expect(result.violations.filter((v) => v.rule === "mutation-oracle")).toHaveLength(2);
  });

  it("accepts concrete mutation oracle evidence tied to a test locator and kill signal", () => {
    const result = analyzeDddTddRules(
      baseInputs({
        plans: [
          {
            path: "docs/plans/PLAN-L7-95-mutation-evidence.md",
            text: [
              "---",
              "status: confirmed",
              "tdd_red_required: true",
              "red_at: 2026-06-09T09:00:00Z",
              "green_at: 2026-06-09T10:00:00Z",
              "mutation_oracle_evidence: tests/ddd-tdd-rules.test.ts::seeded mutant killed by U-DDDTDD-011",
              "---",
            ].join("\n"),
          },
        ],
      }),
    );
    expect(result.violations.map((v) => v.rule)).not.toContain("mutation-oracle");
  });

  it("U-DDDTDD-012: PLAN-RECOVERY-106-mutation-oracle-locator-resolution accepts a resolvable oracle ID as the mutation locator", () => {
    const result = analyzeDddTddRules(
      baseInputs({
        mutationOracleLocators: {
          "U-DDDTDD-011": ["docs/test-design/harness/L7-unit-test-design.md"],
        },
        plans: [
          {
            path: "docs/plans/PLAN-L7-94-oracle-id-evidence.md",
            text: [
              "---",
              "status: confirmed",
              "mutation_oracle_required: true",
              "mutation_oracle_evidence: U-DDDTDD-011 killed the seeded defect (exit 1)",
              "---",
            ].join("\n"),
          },
        ],
      }),
    );
    expect(result.violations.map((v) => v.rule)).not.toContain("mutation-oracle");
  });

  it("U-DDDTDD-013: PLAN-RECOVERY-106-mutation-oracle-locator-resolution rejects an unknown oracle ID and explains the accepted locator forms", () => {
    const result = analyzeDddTddRules(
      baseInputs({
        plans: [
          {
            path: "docs/plans/PLAN-L7-93-unknown-oracle.md",
            text: [
              "---",
              "status: confirmed",
              "mutation_oracle_required: true",
              "mutation_oracle_evidence: U-UNKNOWN-999 killed the seeded defect (exit 1)",
              "---",
            ].join("\n"),
          },
        ],
      }),
    );
    const violation = result.violations.find((entry) => entry.rule === "mutation-oracle");
    expect(violation?.message).toContain("Unresolvable oracle ID: U-UNKNOWN-999");
    expect(violation?.message).toContain("tests/*.test.ts");
    expect(violation?.message).toContain("test-design");
  });

  it("U-DDDTDD-015: PLAN-RECOVERY-106-mutation-oracle-locator-resolution rejects an oracle ID bound to a missing test path", () => {
    const repoRoot = mkdtempSync(join(tmpdir(), "helix-ddd-tdd-locator-"));
    try {
      const plansDir = join(repoRoot, "docs", "plans");
      mkdirSync(plansDir, { recursive: true });
      writeFileSync(
        join(plansDir, "PLAN-L7-93-missing-oracle-path.md"),
        [
          "---",
          "status: confirmed",
          "mutation_oracle_required: true",
          "verification_bindings:",
          "  - { oracle_id: U-DDDTDD-015, test_path: tests/does-not-exist.test.ts }",
          "mutation_oracle_evidence: U-DDDTDD-015 killed the seeded defect (exit 1)",
          "---",
        ].join("\n"),
      );

      const result = analyzeDddTddRules(loadDddTddInputs(repoRoot));
      const violation = result.violations.find((entry) => entry.rule === "mutation-oracle");
      expect(violation?.message).toContain("Unresolvable oracle ID: U-DDDTDD-015");
    } finally {
      rmSync(repoRoot, { recursive: true, force: true });
    }
  });

  it("U-DDDTDD-014: PLAN-RECOVERY-106-mutation-oracle-locator-resolution derives oracle IDs from existing test-design rows", () => {
    const inputs = loadDddTddInputs();
    expect(inputs.mutationOracleLocators?.["U-DIGEST-001"]).toContain(
      "docs/test-design/harness/digest-canonicalization-authority.md",
    );
  });

  it("detects missing and weak test oracles", () => {
    const result = analyzeDddTddRules(
      baseInputs({
        docs: [
          {
            path: "tests/no-oracle.test.ts",
            scope: "test",
            text: 'import { it } from "vitest";\nit("does work", () => { const x = 1 + 1; });',
          },
          {
            path: "tests/weak-oracle.test.ts",
            scope: "test",
            text: 'import { it, expect } from "vitest";\nit("truthy only", () => { expect(1).toBeTruthy(); });',
          },
        ],
      }),
    );
    expect(result.ok).toBe(false);
    expect(result.violations.filter((v) => v.rule === "test-oracle-strength")).toHaveLength(2);
  });

  it("suppresses only exact baseline debt keys", () => {
    const result = analyzeDddTddRules(
      baseInputs({
        policy: {
          path: "docs/governance/ddd-tdd-rules.md",
          text: `- id: domain-boundary
- id: invariant-test-trace
- id: red-first-evidence
- id: test-oracle-strength
- id: integration-gwt
- id: unit-oracle-substance
- id: mutation-oracle
- id: engineering-discipline-contract
- id: atomic-change-contract
- tests/weak-oracle.test.ts:2 test-oracle-strength
`,
          ruleIds: [
            "domain-boundary",
            "invariant-test-trace",
            "red-first-evidence",
            "test-oracle-strength",
            "integration-gwt",
            "unit-oracle-substance",
            "mutation-oracle",
            "engineering-discipline-contract",
            "atomic-change-contract",
          ],
        },
        docs: [
          {
            path: "tests/weak-oracle.test.ts",
            scope: "test",
            text: 'import { it, expect } from "vitest";\nit("truthy only", () => { expect(1).toBeTruthy(); });',
          },
        ],
      }),
    );
    expect(result.violations).toEqual([]);
    expect(result.baselineDebt).toBe(1);
  });

  it("detects L9 integration cases without Given/When/Then", () => {
    const result = analyzeDddTddRules(
      baseInputs({
        l8Text: "| IT-ID | Given | When | Then |\n| IT-DDD-01 | Given fixture | | Then result |",
      }),
    );
    expect(result.ok).toBe(false);
    expect(result.violations.map((v) => v.rule)).toContain("integration-gwt");
  });

  it("accepts Japanese annotations on L9 GWT table headers", () => {
    const result = analyzeDddTddRules(
      baseInputs({
        l8Text:
          "| IT-ID | Given（前提） | When（操作） | Then（期待結果） | Fixture / Boundary（境界） | Assertions（検証） | Negative / Edge（異常・境界） |\n| IT-DDD-01 | a | b | c | d | e | f |",
      }),
    );
    expect(result.ok).toBe(true);
    expect(result.violations.map((v) => v.rule)).not.toContain("integration-gwt");
  });

  it("formats doctor messages with path and rule samples", () => {
    const result = analyzeDddTddRules(baseInputs({ l7Text: "" }));
    expect(dddTddRulesMessages(result)[0]).toContain("invariant-test-trace");
  });

  // U-DDDTDD-009 (IMP-083 残差): L7 unit test-design の U-* 行が骨格 (空/trivial expected) なら違反。
  it("detects skeletal unit test-design U-* rows (unit-oracle-substance, IMP-083)", () => {
    const skeleton = analyzeDddTddRules(
      baseInputs({ l7Text: "| U-ID | function | expected |\n| U-FOO-001 | f | - |" }),
    );
    expect(skeleton.ok).toBe(false);
    expect(skeleton.violations.map((v) => v.rule)).toContain("unit-oracle-substance");
    // ヘッダ行 (U-ID) と substantive 行は違反にしない (false-positive 回避)。
    const real = analyzeDddTddRules(
      baseInputs({
        l7Text: "| U-ID | function | expected |\n| U-FOO-002 | f | 同入力→同出力、orphans==[] |",
      }),
    );
    expect(real.violations.map((v) => v.rule)).not.toContain("unit-oracle-substance");
  });

  it("real repo guard has no DDD/TDD strictness violations", () => {
    const result = analyzeDddTddRules(loadDddTddInputs());
    expect(result.violations).toEqual([]);
  });
});

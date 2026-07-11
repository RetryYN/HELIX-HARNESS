import { describe, expect, it } from "vitest";
import {
  analyzePlanSpecificVpairBindings,
  authorityInitialDigest,
  authorityTombstoneDigest,
  checkPlanSpecificVpairBindings,
  extractExecutableOracleCases,
  findingFingerprint,
  type PlanSpecificVpairAuthority,
  type PlanSpecificVpairBindingInput,
  type PlanSpecificVpairPlan,
  parseEligibleOracleTable,
  planSpecificVpairBindingMessages,
} from "../src/lint/plan-specific-vpair-binding";
import { lintPlanGate } from "../src/plan/lint";

const planId = "PLAN-L7-422-plan-specific-vpair-binding";
const parent = "docs/design/harness/L6-function-design/example.md";
const pair = "docs/test-design/harness/L8-unit-test-design.md";
const testPath = "tests/example.test.ts";
const oracle = "U-PSPB-006";
const table = (id = oracle, path = testPath) =>
  `| U-ID | 対象 | 反例と期待結果 | test citation |\n|---|---|---|---|\n| ${id} | 対象 | 反例 | \`${path}\` |`;
const plan = (overrides: Partial<PlanSpecificVpairPlan> = {}): PlanSpecificVpairPlan => ({
  plan_id: planId,
  kind: "impl",
  status: "draft",
  parent_design: parent,
  pair_artifact: pair,
  verification_bindings: [{ parent_design: parent, oracle_id: oracle, test_path: testPath }],
  generates: [{ artifact_path: testPath, artifact_type: "test_code" }],
  ...overrides,
});
const input = (
  overrides: Partial<PlanSpecificVpairBindingInput> = {},
): PlanSpecificVpairBindingInput => ({
  plans: [plan()],
  pairDocuments: new Map([[pair, table()]]),
  testFiles: new Map([
    [
      testPath,
      {
        exists: true,
        regular: true,
        symlink: false,
        insideRepo: true,
        source: `// ${planId}\nit("${oracle}: happy", () => {});`,
        executableOracleCases: new Map([[oracle, 1]]),
      },
    ],
  ]),
  ...overrides,
});
const reasons = (value: PlanSpecificVpairBindingInput) =>
  analyzePlanSpecificVpairBindings(value).findings.map((f) => f.reason);

describe("PLAN固有Vペアbinding", () => {
  it("U-PSPB-006: 4点happy path", () =>
    expect(analyzePlanSpecificVpairBindings(input()).ok).toBe(true));

  it("U-PSPB-007: binding必須", () => {
    expect(reasons(input({ plans: [plan({ verification_bindings: [] })] }))).toContain(
      "verification_bindings_absent",
    );
  });

  it("U-PSPB-008: parent一致", () => {
    expect(
      reasons(
        input({
          plans: [
            plan({
              verification_bindings: [
                {
                  parent_design: `${parent}.other`,
                  oracle_id: oracle,
                  test_path: testPath,
                },
              ],
            }),
          ],
        }),
      ),
    ).toContain("binding_parent_mismatch");
  });

  it("U-PSPB-009: oracle一意宣言", () => {
    expect(reasons(input({ pairDocuments: new Map([[pair, table("U-PSPB-999")]]) }))).toContain(
      "oracle_not_declared",
    );
    expect(
      reasons(input({ pairDocuments: new Map([[pair, `${table()}\n${table()}`]]) })),
    ).toContain("oracle_ambiguous");
  });

  it("U-PSPB-010: row-test結合", () => {
    expect(
      reasons(
        input({
          pairDocuments: new Map([[pair, table(oracle, "tests/other.test.ts")]]),
        }),
      ),
    ).toContain("oracle_test_citation_mismatch");
  });

  it("U-PSPB-011: generates結合", () => {
    expect(reasons(input({ plans: [plan({ generates: [] })] }))).toContain("test_not_generated");
    expect(reasons(input({ testFiles: new Map() }))).toContain("test_path_missing");
  });

  it("U-PSPB-012: case単位citation", () => {
    const forged = `// ${planId}\n// it("${oracle}: comment",()=>{});\nconst x="${oracle}: dead";\nit.skip("${oracle}: skip",()=>{});\nit(\`${oracle}: \${x}\`,()=>{});`;
    expect(extractExecutableOracleCases(forged).size).toBe(0);
    const files = new Map(input().testFiles);
    files.set(testPath, {
      ...files.get(testPath)!,
      source: forged,
      executableOracleCases: extractExecutableOracleCases(forged),
    });
    expect(reasons(input({ testFiles: files }))).toContain("oracle_citation_missing");
    files.set(testPath, {
      ...files.get(testPath)!,
      source: `it("${oracle}: real",()=>{});`,
      executableOracleCases: new Map([[oracle, 1]]),
    });
    expect(reasons(input({ testFiles: files }))).toContain("plan_citation_missing");
  });

  it("U-PSPB-013: canonical path/schema", () => {
    for (const bad of [
      null,
      {},
      {
        parent_design: parent,
        oracle_id: "U-PSPB-006..018",
        test_path: testPath,
      },
      { parent_design: parent, oracle_id: oracle, test_path: "tests/../x.ts" },
      {
        parent_design: parent,
        oracle_id: oracle,
        test_path: testPath,
        extra: true,
      },
    ]) {
      expect(reasons(input({ plans: [plan({ verification_bindings: [bad] })] }))).toContain(
        "binding_schema_invalid",
      );
    }
    expect(parseEligibleOracleTable(`\`\`\`\n${table()}\n\`\`\``).rows).toEqual([]);
  });

  it("U-PSPB-014: 重複/ownership", () => {
    const binding = {
      parent_design: parent,
      oracle_id: oracle,
      test_path: testPath,
    };
    expect(
      reasons(input({ plans: [plan({ verification_bindings: [binding, binding] })] })),
    ).toContain("duplicate_binding");
    const secondPath = "tests/second.test.ts";
    const second = plan({
      plan_id: "PLAN-L7-999-second",
      verification_bindings: [{ ...binding, test_path: secondPath }],
      generates: [{ artifact_path: secondPath, artifact_type: "test_code" }],
    });
    const files = new Map(input().testFiles);
    files.set(secondPath, {
      ...files.get(testPath)!,
      source: `// PLAN-L7-999-second\nit("${oracle}: second",()=>{});`,
    });
    expect(
      reasons(
        input({
          plans: [plan(), second],
          pairDocuments: new Map([
            [pair, table(oracle, testPath).replace(" |", `, \`${secondPath}\` |`)],
          ]),
          testFiles: files,
        }),
      ),
    ).toContain("oracle_owned_by_multiple_plans");
    expect(reasons(input({ plans: [plan(), { ...second, status: "archived" }] }))).not.toContain(
      "oracle_owned_by_multiple_plans",
    );
  });

  it("U-PSPB-015: 共有L8", () => {
    const other = "U-PSPB-015";
    const second = plan({
      plan_id: "PLAN-L7-999-second",
      verification_bindings: [{ parent_design: parent, oracle_id: other, test_path: testPath }],
    });
    const files = new Map(input().testFiles);
    files.set(testPath, {
      ...files.get(testPath)!,
      source: `// ${planId} PLAN-L7-999-second\nit("${oracle}: one",()=>{});\ntest("${other}: two",()=>{});`,
      executableOracleCases: new Map([
        [oracle, 1],
        [other, 1],
      ]),
    });
    expect(
      analyzePlanSpecificVpairBindings(
        input({
          plans: [plan(), second],
          pairDocuments: new Map([[pair, `${table()}\n| ${other} | x | y | \`${testPath}\` |`]]),
          testFiles: files,
        }),
      ).ok,
    ).toBe(true);
  });

  it("U-PSPB-016: exact fingerprint ratchet", () => {
    const base = analyzePlanSpecificVpairBindings(
      input({ plans: [plan({ verification_bindings: [] })] }),
    ).findings[0]!;
    const initial = [
      {
        fingerprint: base.fingerprint,
        plan_id: base.plan_id,
        reason: base.reason,
        detail: base.detail,
      },
    ];
    const authority: PlanSpecificVpairAuthority = {
      schemaVersion: "plan-specific-vpair-binding-authority.v1",
      initialAuthority: initial,
      resolvedTombstones: [],
    };
    expect(
      analyzePlanSpecificVpairBindings(
        input({ plans: [plan({ verification_bindings: [] })], authority }),
      ).ok,
    ).toBe(true);
    expect(
      analyzePlanSpecificVpairBindings(
        input({ plans: [plan({ verification_bindings: null })], authority }),
      ).ok,
    ).toBe(false);
    expect(analyzePlanSpecificVpairBindings(input({ authority })).ok).toBe(true);
  });

  it("U-PSPB-017: baseline authority", () => {
    const absent = {
      plan_id: planId,
      reason: "verification_bindings_absent" as const,
      detail: null,
    };
    const fingerprint = findingFingerprint(absent);
    const initial = [{ ...absent, fingerprint }];
    const genesis = authorityInitialDigest(initial);
    const tombstone = {
      fingerprint,
      resolved_at: "2026-07-11T00:00:00Z",
      resolution_plan_id: "PLAN-L7-999-resolution",
      previous_digest: genesis,
      entry_digest: "",
    };
    tombstone.entry_digest = authorityTombstoneDigest(genesis, tombstone);
    const authority: PlanSpecificVpairAuthority = {
      schemaVersion: "plan-specific-vpair-binding-authority.v1",
      initialAuthority: initial,
      resolvedTombstones: [tombstone],
    };
    const valid = input({
      authority,
      expectedInitialDigest: genesis,
      expectedTerminalDigest: tombstone.entry_digest,
      isTerminalResolutionPlan: () => true,
    });
    expect(analyzePlanSpecificVpairBindings(valid).ok).toBe(true);
    expect(reasons({ ...valid, expectedTerminalDigest: `sha256:${"0".repeat(64)}` })).toContain(
      "baseline_authority_invalid",
    );
    expect(reasons({ ...valid, plans: [plan({ verification_bindings: [] })] })).toContain(
      "resolved_finding_reappeared",
    );
  });

  it("U-PSPB-018: 対象境界", () => {
    expect(
      analyzePlanSpecificVpairBindings(input({ plans: [plan({ status: "draft" })] })).checkedPlans,
    ).toBe(1);
    expect(
      analyzePlanSpecificVpairBindings(
        input({
          plans: [
            plan({ status: "archived", verification_bindings: [] }),
            plan({ kind: "research", verification_bindings: [] }),
          ],
        }),
      ),
    ).toMatchObject({ ok: true, checkedPlans: 0 });
  });

  it("U-PSPB-019: lint/doctor配線用messageとfail-close wrapperを同一判定へ固定する", () => {
    const bad = analyzePlanSpecificVpairBindings(
      input({ plans: [plan({ verification_bindings: [] })] }),
    );
    expect(planSpecificVpairBindingMessages(bad).join("\n")).toContain(
      "plan-specific-vpair-binding - violation",
    );
    expect(checkPlanSpecificVpairBindings("/definitely/missing/helix-root")).toMatchObject({
      ok: false,
      result: null,
    });
    const lint = lintPlanGate({
      path: "docs/plans/PLAN-L7-422-plan-specific-vpair-binding.md",
      repoRoot: process.cwd(),
    });
    expect(lint.ok, lint.messages.join("\n")).toBe(true);
    expect(
      lint.messages.some((message) => message.includes("plan-specific-vpair-binding - OK")),
    ).toBe(true);
  });

  it("U-PSPB-020: 実repoはPLAN-L7-419と本PLANをactive exemptionなしで4点bindingする", () => {
    const checked = checkPlanSpecificVpairBindings(process.cwd());
    expect(checked.ok, checked.messages.join("\n")).toBe(true);
    expect(
      checked.result?.exempted.some(
        (finding) => finding.plan_id === "PLAN-L7-419-skill-mythos-uplift",
      ),
    ).toBe(false);
    expect(
      checked.result?.exempted.some(
        (finding) => finding.plan_id === "PLAN-L7-422-plan-specific-vpair-binding",
      ),
    ).toBe(false);
  });
});

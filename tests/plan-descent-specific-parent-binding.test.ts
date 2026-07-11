import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  analyzePlanSpecificVpairBindings,
  authorityInitialDigest,
  authorityLegacyIdentityDigest,
  authorityTombstoneDigest,
  checkPlanSpecificVpairBindings,
  extractExecutableOracleCases,
  findingFingerprint,
  PLAN_SPECIFIC_VPAIR_LEGACY_IDENTITY_DIGEST,
  type PlanSpecificVpairAuthority,
  type PlanSpecificVpairBindingInput,
  type PlanSpecificVpairPlan,
  parseEligibleOracleTable,
  planSemanticDigest,
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
  path: `docs/plans/${planId}.md`,
  plan_id: planId,
  kind: "impl",
  status: "draft",
  parent_design: parent,
  pair_artifact: pair,
  verification_bindings: [{ parent_design: parent, oracle_id: oracle, test_path: testPath }],
  generates: [{ artifact_path: testPath, artifact_type: "test_code" }],
  source: `---\nplan_id: ${planId}\n---\n\n# fixture\n`,
  ...overrides,
});
const authorityEntry = (
  base: Pick<
    PlanSpecificVpairAuthority["initialAuthority"][number],
    "plan_id" | "reason" | "detail"
  >,
  target = plan(),
): PlanSpecificVpairAuthority["initialAuthority"][number] => ({
  ...base,
  fingerprint: findingFingerprint(base),
  plan_path: String(target.path),
  plan_semantic_digest: planSemanticDigest(target),
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
const requiredEvidence = (
  files: ReadonlyMap<
    string,
    PlanSpecificVpairBindingInput["testFiles"] extends ReadonlyMap<string, infer Evidence>
      ? Evidence
      : never
  >,
  path: string,
) => {
  const evidence = files.get(path);
  if (!evidence) throw new Error(`test evidence missing: ${path}`);
  return evidence;
};

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
    const forged = `// ${planId}\n// it("${oracle}: comment",()=>{});\nconst x="${oracle}: dead";\nit.skip("${oracle}: skip",()=>{});\nit("${oracle}: pending");\nit(\`${oracle}: \${x}\`,()=>{});`;
    expect(extractExecutableOracleCases(forged).size).toBe(0);
    const files = new Map(input().testFiles);
    files.set(testPath, {
      ...requiredEvidence(files, testPath),
      source: forged,
      executableOracleCases: extractExecutableOracleCases(forged),
    });
    expect(reasons(input({ testFiles: files }))).toContain("oracle_citation_missing");
    files.set(testPath, {
      ...requiredEvidence(files, testPath),
      source: `it("${oracle}: real",()=>{});`,
      executableOracleCases: new Map([[oracle, 1]]),
    });
    expect(reasons(input({ testFiles: files }))).toContain("plan_citation_missing");
    for (const shadowed of [
      `const it=(_title:string,_fn:()=>void)=>{}; it("${oracle}: fake",()=>{});`,
      `function test(_title:string,_fn:()=>void){}; test("${oracle}: fake",()=>{});`,
      `import { fake as it } from "vitest"; it("${oracle}: fake",()=>{});`,
      `import { it } from "other-runner"; it("${oracle}: fake",()=>{});`,
      `function helper(it: Function){ it("${oracle}: fake",()=>{}); }`,
      `const helper = function it(){ it("${oracle}: fake",()=>{}); };`,
      `function helper(){ if(true){ var it=(_t:string,_f:()=>void)=>{}; } it("${oracle}: fake",()=>{}); }`,
    ]) {
      expect(extractExecutableOracleCases(shadowed).size).toBe(0);
    }
    expect(
      extractExecutableOracleCases(
        `import { it } from "vitest"; it("${oracle}: valid",()=>{}); function helper(it: Function){ return it; }`,
      ).get(oracle),
    ).toBe(1);
    for (const scopedBinding of [
      `for (let it=0; it<1; it+=1) {} it("${oracle}: valid",()=>{});`,
      `switch (1) { case 1: { let test=()=>{}; test(); break; } } test("${oracle}: valid",()=>{});`,
    ]) {
      expect(extractExecutableOracleCases(scopedBinding).get(oracle)).toBe(1);
    }
    files.set(testPath, {
      ...requiredEvidence(files, testPath),
      source: `// X${planId}\nit("${oracle}: real",()=>{});`,
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
    expect(parseEligibleOracleTable(table("U-MULTI-PART-001a")).rows).toHaveLength(1);
    expect(parseEligibleOracleTable(table("U-MULTI-PART-001ab")).rows).toHaveLength(0);
    expect(extractExecutableOracleCases('it("U-MULTI-PART-001ab: bad",()=>{});').size).toBe(0);
    expect(
      extractExecutableOracleCases(
        `import { it } from "vitest"; it("U-MULTI-PART-001a: valid",()=>{});`,
      ).get("U-MULTI-PART-001a"),
    ).toBe(1);
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
      ...requiredEvidence(files, testPath),
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
      ...requiredEvidence(files, testPath),
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

    const malformed = input({
      plans: [
        plan({
          verification_bindings: [
            { parent_design: parent, oracle_id: oracle, test_path: testPath },
            { parent_design: parent, oracle_id: other, test_path: testPath },
          ],
        }),
      ],
      pairDocuments: new Map([[pair, `${table()}\n| ${other} | broken |`]]),
    });
    expect(
      analyzePlanSpecificVpairBindings(malformed).findings.filter(
        (finding) => finding.reason === "oracle_table_schema_invalid",
      ),
    ).toHaveLength(1);
  });

  it("U-PSPB-016: exact fingerprint ratchet", () => {
    const base = analyzePlanSpecificVpairBindings(
      input({ plans: [plan({ verification_bindings: [] })] }),
    ).findings[0];
    expect(base).toBeDefined();
    if (!base) return;
    const initial = [authorityEntry(base, plan({ verification_bindings: [] }))];
    const authority: PlanSpecificVpairAuthority = {
      schemaVersion: "plan-specific-vpair-binding-authority.v2",
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
    expect(analyzePlanSpecificVpairBindings(input({ authority })).ok).toBe(false);
  });

  it("U-PSPB-017: baseline authority", () => {
    const absent = {
      plan_id: planId,
      reason: "verification_bindings_absent" as const,
      detail: null,
    };
    const initial = [authorityEntry(absent, plan({ verification_bindings: [] }))];
    const fingerprint = initial[0]?.fingerprint ?? "";
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
      schemaVersion: "plan-specific-vpair-binding-authority.v2",
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
    const unusedBase = {
      plan_id: "PLAN-L7-998-preauthorized",
      reason: "verification_bindings_absent" as const,
      detail: null,
    };
    const unusedAuthority: PlanSpecificVpairAuthority = {
      schemaVersion: "plan-specific-vpair-binding-authority.v2",
      initialAuthority: [
        authorityEntry(
          unusedBase,
          plan({
            plan_id: unusedBase.plan_id,
            path: `docs/plans/${unusedBase.plan_id}.md`,
            verification_bindings: [],
          }),
        ),
      ],
      resolvedTombstones: [],
    };
    expect(reasons(input({ authority: unusedAuthority }))).toContain("baseline_authority_invalid");

    const invalidAuthorities: unknown[] = [
      { ...authority, unknown: true },
      {
        ...authority,
        initialAuthority: [{ ...initial[0], reason: "future_reason" }],
      },
      {
        ...authority,
        initialAuthority: [{ ...initial[0], unknown: true }],
      },
      {
        ...authority,
        resolvedTombstones: [{ ...tombstone, resolved_at: "2026-07-11T09:00:00+09:00" }],
      },
      {
        ...authority,
        resolvedTombstones: [{ ...tombstone, previous_digest: `sha256:${"1".repeat(64)}` }],
      },
      {
        ...authority,
        resolvedTombstones: [{ ...tombstone, fingerprint: `sha256:${"2".repeat(64)}` }],
      },
      {
        ...authority,
        resolvedTombstones: [tombstone, tombstone],
      },
      {
        ...authority,
        resolvedTombstones: [{ ...tombstone, unknown: true }],
      },
    ];
    for (const invalidAuthority of invalidAuthorities) {
      expect(
        reasons({
          ...valid,
          authority: invalidAuthority,
          expectedTerminalDigest: undefined,
        }),
      ).toContain("baseline_authority_invalid");
    }
    expect(
      reasons({
        ...valid,
        isTerminalResolutionPlan: () => false,
        expectedTerminalDigest: undefined,
      }),
    ).toContain("baseline_authority_invalid");
  });

  it("U-PSPB-021: authority semantic pinはlegacy PLANの意味変更を免除しない", () => {
    const legacyPlan = plan({ verification_bindings: [] });
    const absent = {
      plan_id: planId,
      reason: "verification_bindings_absent" as const,
      detail: null,
    };
    const initial = [authorityEntry(absent, legacyPlan)];
    const authority: PlanSpecificVpairAuthority = {
      schemaVersion: "plan-specific-vpair-binding-authority.v2",
      initialAuthority: initial,
      resolvedTombstones: [],
    };
    const pinned = input({ plans: [legacyPlan], authority });
    expect(analyzePlanSpecificVpairBindings(pinned).ok).toBe(true);

    for (const changed of [
      plan({ verification_bindings: [], source: `${legacyPlan.source}\n意味変更\n` }),
      plan({ verification_bindings: [], parent_design: `${parent}.changed` }),
      plan({
        verification_bindings: [],
        generates: [
          { artifact_path: testPath, artifact_type: "test_code" },
          { artifact_path: "tests/added.test.ts", artifact_type: "test_code" },
        ],
      }),
      plan({ verification_bindings: [], semantic_extension: "new-contract" } as never),
      plan({
        verification_bindings: [],
        agent_slots: [{ role: "security", slot_label: "changed execution authority" }],
      } as never),
    ]) {
      expect(reasons({ ...pinned, plans: [changed] })).toContain("baseline_plan_semantic_drift");
    }
    expect(
      analyzePlanSpecificVpairBindings({
        ...pinned,
        plans: [
          plan({
            verification_bindings: [],
            owner: "another-runtime",
            updated: "2026-07-12",
            review_evidence: [{ verdict: "approve" }],
          } as never),
        ],
      }).ok,
    ).toBe(true);
    expect(
      reasons({
        ...pinned,
        authority: { ...authority, schemaVersion: "plan-specific-vpair-binding-authority.v1" },
      }),
    ).toContain("baseline_authority_invalid");

    const canonicalA = plan({
      verification_bindings: [],
      dependencies: { requires: ["b", "a"], references: ["d", "c"] },
      generates: [
        { artifact_path: "tests/z.test.ts", artifact_type: "test_code" },
        { artifact_path: "tests/a.test.ts", artifact_type: "test_code" },
      ],
      source: `---\r\nplan_id: ${planId}\r\n---\r\n\r\nCafe\u0301  \r\n`,
    } as never);
    const canonicalB = plan({
      verification_bindings: [],
      dependencies: { references: ["c", "d"], requires: ["a", "b"] },
      generates: [
        { artifact_type: "test_code", artifact_path: "tests/a.test.ts" },
        { artifact_type: "test_code", artifact_path: "tests/z.test.ts" },
      ],
      source: `---\nplan_id: ${planId}\n---\n\nCafé\n`,
    } as never);
    expect(planSemanticDigest(canonicalA)).toBe(planSemanticDigest(canonicalB));
  });

  it("U-PSPB-022: authority v2 genesisはsemantic pinを含みtombstone chainを再拘束する", () => {
    const legacyPlan = plan({ verification_bindings: [] });
    const absent = {
      plan_id: planId,
      reason: "verification_bindings_absent" as const,
      detail: null,
    };
    const entry = authorityEntry(absent, legacyPlan);
    const initial = [entry];
    const genesis = authorityInitialDigest(initial);
    expect(authorityLegacyIdentityDigest(initial)).not.toBe(genesis);
    expect(
      authorityInitialDigest([{ ...entry, plan_semantic_digest: `sha256:${"1".repeat(64)}` }]),
    ).not.toBe(genesis);
    const tombstone = {
      fingerprint: entry.fingerprint,
      resolved_at: "2026-07-12T00:00:00Z",
      resolution_plan_id: "PLAN-L7-999-resolution",
      previous_digest: genesis,
      entry_digest: "",
    };
    tombstone.entry_digest = authorityTombstoneDigest(genesis, tombstone);
    const authority: PlanSpecificVpairAuthority = {
      schemaVersion: "plan-specific-vpair-binding-authority.v2",
      initialAuthority: initial,
      resolvedTombstones: [tombstone],
    };
    const migrated = input({
      plans: [],
      authority,
      expectedInitialDigest: genesis,
      expectedTerminalDigest: tombstone.entry_digest,
      isTerminalResolutionPlan: () => true,
    });
    expect(analyzePlanSpecificVpairBindings(migrated).ok).toBe(true);
    expect(
      reasons({
        ...migrated,
        expectedLegacyIdentityDigest: `sha256:${"3".repeat(64)}`,
      }),
    ).toContain("baseline_authority_invalid");
    expect(
      reasons(
        input({
          authority: undefined,
          expectedLegacyIdentityDigest: PLAN_SPECIFIC_VPAIR_LEGACY_IDENTITY_DIGEST,
        }),
      ),
    ).toContain("baseline_authority_invalid");
    expect(
      reasons({
        ...migrated,
        authority: {
          ...authority,
          resolvedTombstones: [{ ...tombstone, previous_digest: `sha256:${"2".repeat(64)}` }],
        },
      }),
    ).toContain("baseline_authority_invalid");
  });

  it("U-PSPB-023: generatesの全test_codeをbinding test pathへ逆包含する", () => {
    const unboundPath = "tests/unbound.test.ts";
    const partial = plan({
      generates: [
        { artifact_path: testPath, artifact_type: "test_code" },
        { artifact_path: unboundPath, artifact_type: "test_code" },
        { artifact_path: "src/example.ts", artifact_type: "source_module" },
      ],
    });
    const result = analyzePlanSpecificVpairBindings(input({ plans: [partial] }));
    expect(result.findings).toContainEqual(
      expect.objectContaining({ reason: "generated_test_unbound", detail: unboundPath }),
    );
    expect(
      analyzePlanSpecificVpairBindings(
        input({
          plans: [
            plan({
              generates: [
                { artifact_path: testPath, artifact_type: "test_code" },
                { artifact_path: testPath, artifact_type: "test_code" },
                { artifact_path: "src/example.ts", artifact_type: "source_module" },
              ],
            }),
          ],
        }),
      ).ok,
    ).toBe(true);
    expect(reasons(input({ plans: [plan({ verification_bindings: [], generates: [] })] }))).toEqual(
      ["verification_bindings_absent"],
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
    expect(checked.result?.exempted).toHaveLength(286);
    const productionAuthority = JSON.parse(
      readFileSync("config/plan-specific-vpair-binding-authority.json", "utf8"),
    ) as PlanSpecificVpairAuthority;
    expect(authorityLegacyIdentityDigest(productionAuthority.initialAuthority)).toBe(
      PLAN_SPECIFIC_VPAIR_LEGACY_IDENTITY_DIGEST,
    );
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
    expect(
      checked.result?.exempted.some(
        (finding) => finding.plan_id === "PLAN-L7-423-ci-governance-self-heal",
      ),
    ).toBe(false);
  });
});

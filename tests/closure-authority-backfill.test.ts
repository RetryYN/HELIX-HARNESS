import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  buildClosureAuthorityBackfill,
  type ClosureAuthorityBackfillCandidate,
  type ClosureAuthorityBackfillInput,
  type TypedAuthorityBlock,
} from "../src/policy/closure-authority-backfill";

const digest = (value: string) =>
  `sha256:${createHash("sha256").update(value).digest("hex")}` as const;
const PLAN = "PLAN-L7-900-fixture";
const ORACLE = "U-CABF-002";

const authority = (capabilities: string[] = ["local_plan_status"]): TypedAuthorityBlock => ({
  source_kind: "confirmed_design",
  source_path: "docs/design/harness/L6-function-design/example.md",
  source_digest: digest("design"),
  field_pointer: "/closure_authority",
  status: "confirmed",
  capabilities,
  gates: [{ gate_id: "g7", command_id: "g7", command: "helix gate G7" }],
});

const candidate = (): ClosureAuthorityBackfillCandidate => ({
  plan_id: PLAN,
  plan_path: "docs/plans/PLAN-L7-900-fixture.md",
  plan_digest: digest("plan"),
  plan_bindings: [
    {
      oracle_id: ORACLE,
      parent_design: authority().source_path,
      test_path: "tests/example.test.ts",
    },
  ],
  l8_rows: [
    {
      oracle_id: ORACLE,
      parent_design: authority().source_path,
      test_path: "tests/example.test.ts",
      source_path: "docs/test-design/harness/L8-unit-test-design.md",
      source_digest: digest("l8"),
      parent_design_status: "confirmed",
    },
  ],
  collected_tests: [
    {
      test_path: "tests/example.test.ts",
      full_name: `[${PLAN}/${ORACLE}] exact citation`,
      status: "passed",
      source_digest: digest("test"),
      canonical_realpath: true,
      symlink: false,
    },
  ],
  design_authority: authority(),
});

const input = (
  candidates: ClosureAuthorityBackfillCandidate[] = [candidate()],
): ClosureAuthorityBackfillInput => ({
  repository_head: "a".repeat(40),
  registry_digest: digest("registry"),
  review_scope_digest: digest("scope"),
  expected_plan_ids: candidates.map((row) => row.plan_id),
  candidates,
  gate_allowlist: { g7: { command_id: "g7", command: "helix gate G7" } },
});

describe("closure authority backfill pure policy", () => {
  it("U-CABF-001: [PLAN-L7-435-closure-authority-backfill/U-CABF-001] censusをexactly-onceかつ順序通り分類する", () => {
    const second = { ...candidate(), plan_id: "PLAN-L7-901-second" };
    const valid = input([candidate(), second]);
    expect(buildClosureAuthorityBackfill(valid).decisions.map((row) => row.plan_id)).toEqual([
      PLAN,
      second.plan_id,
    ]);
    expect(() => buildClosureAuthorityBackfill({ ...valid, expected_plan_ids: [PLAN] })).toThrow(
      /missing\/excess\/order/,
    );
    expect(() =>
      buildClosureAuthorityBackfill({ ...valid, expected_plan_ids: [second.plan_id, PLAN] }),
    ).toThrow(/order/);
    expect(() => buildClosureAuthorityBackfill(input([candidate(), candidate()]))).toThrow(
      /duplicate/,
    );
  });

  it("U-CABF-002: [PLAN-L7-435-closure-authority-backfill/U-CABF-002] PLAN・L8・collected markerのexact joinだけを提案する", () => {
    expect(buildClosureAuthorityBackfill(input()).decisions[0]?.classification).toBe(
      "eligible_proposal",
    );
    const citation = candidate().collected_tests[0];
    if (!citation) throw new Error("fixture citation missing");
    for (const collected_tests of [
      [],
      [{ ...citation, full_name: `[${PLAN}/U-CABF-0020] prefix` }],
      [{ ...citation, status: "skipped" as const }],
      [{ ...citation, symlink: true }],
      [citation, citation],
    ]) {
      const row = { ...candidate(), collected_tests };
      expect(buildClosureAuthorityBackfill(input([row])).decisions[0]?.classification).not.toBe(
        "eligible_proposal",
      );
    }
  });

  it("U-CABF-003: [PLAN-L7-435-closure-authority-backfill/U-CABF-003] prose・green command・類似名・単独citationからauthorityを推測しない", () => {
    const untrusted = {
      ...candidate(),
      plan_bindings: [],
      design_authority: null,
      plan_authority: null,
      green_commands: ["bunx vitest tests/example.test.ts"],
      review_prose: "approve gate g7 capability local_plan_status",
      similar_file_name: "U-CABF-002.test.ts",
    } as ClosureAuthorityBackfillCandidate;
    const decision = buildClosureAuthorityBackfill(input([untrusted])).decisions[0];
    expect(decision?.classification).toBe("needs_design");
    expect(decision?.proposal).toBeNull();
  });

  it("U-CABF-004: [PLAN-L7-435-closure-authority-backfill/U-CABF-004] confirmed design precedence・conflict・typed human境界を分類する", () => {
    const fallback = candidate();
    fallback.design_authority = null;
    fallback.plan_authority = {
      ...authority(),
      source_kind: "plan_frontmatter",
      status: undefined,
    };
    expect(buildClosureAuthorityBackfill(input([fallback])).decisions[0]?.classification).toBe(
      "eligible_proposal",
    );

    const conflict = candidate();
    conflict.plan_authority = { ...authority(["state_cutover"]), source_kind: "plan_frontmatter" };
    expect(buildClosureAuthorityBackfill(input([conflict])).decisions[0]?.classification).toBe(
      "invalid",
    );

    const irreversible = candidate();
    irreversible.design_authority = authority(["external_publish"]);
    expect(buildClosureAuthorityBackfill(input([irreversible])).decisions[0]?.classification).toBe(
      "human_only",
    );

    const unknown = candidate();
    unknown.design_authority = authority(["invented"]);
    expect(buildClosureAuthorityBackfill(input([unknown])).decisions[0]?.classification).toBe(
      "invalid",
    );
  });

  it("U-CABF-005: [PLAN-L7-435-closure-authority-backfill/U-CABF-005] bundleはread-onlyでHEAD・scope・registry・source digestへ束縛する", () => {
    const value = input();
    const before = structuredClone(value);
    const bundle = buildClosureAuthorityBackfill(value);
    expect(value).toEqual(before);
    expect(bundle).toMatchObject({
      repository_head: value.repository_head,
      registry_digest: value.registry_digest,
      review_scope_digest: value.review_scope_digest,
    });
    expect(bundle.source_digests).toEqual(
      expect.arrayContaining([digest("plan"), digest("design"), digest("l8"), digest("test")]),
    );
    expect(
      buildClosureAuthorityBackfill({ ...value, review_scope_digest: digest("other") })
        .bundle_digest,
    ).not.toBe(bundle.bundle_digest);
  });
});

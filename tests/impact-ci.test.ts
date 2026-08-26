import { spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";
import {
  buildTestVerificationInventory,
  type CiProfileReceipt,
  collectSourceImportConsumers,
  computeImpactDecision,
  computeReceiptPercentiles,
  selectLiteCanaryLane,
  type VerificationItem,
  validateCiProfileReceipt,
  validateVerificationInventory,
} from "../src/runtime/impact-ci";

// PLAN-L7-493-impact-ci-recovery execution evidence.
// PLAN-L7-682-lite-canary-ci-parallelization: U-LITECI-001..005.

const inventory: VerificationItem[] = [
  {
    id: "authority",
    kind: "guard",
    owner: "authority",
    command: ["npm", "run", "authority"],
    pathSelectors: [],
    relationNodeIds: [],
    mandatoryProfiles: ["draft_preflight"],
    riskTags: [],
  },
  {
    id: "foo",
    kind: "unit",
    owner: "foo",
    command: ["vitest", "run", "tests/foo.test.ts"],
    pathSelectors: ["src/foo.ts", "tests/foo.test.ts"],
    relationNodeIds: [],
    mandatoryProfiles: [],
    riskTags: [],
  },
  {
    id: "bar",
    kind: "unit",
    owner: "bar",
    command: ["vitest", "run", "tests/bar.test.ts"],
    pathSelectors: ["src/bar.ts"],
    relationNodeIds: [],
    mandatoryProfiles: [],
    riskTags: [],
  },
];

describe("Impact CI pure contract", () => {
  const liteFastCheck = {
    profile_ok: true,
    manifest_ok: true,
    closure_ok: true,
    artifact_paths: ["src/setup/distribution-consumer-cli.ts"],
    closure_paths: [
      "src/setup/distribution-consumer-cli.ts",
      "README-LITE.md",
      "LICENSE",
      "THIRD_PARTY_NOTICES.md",
      "PROVENANCE.md",
      "DISCLAIMER.md",
      "src/orchestration/loop-store.ts",
      "tests/loop-store-durability.test.ts",
      "tests/loop-store-durability-node.test.ts",
      "tests/distribution-lite-consumer-canary.test.ts",
    ],
    source_head: "a".repeat(40),
    candidate_head: "a".repeat(40),
  };

  it("U-LITECI-001: fast profile/manifest/closureが健全なPRの非接触変更だけをtyped skipにする", () => {
    expect(
      selectLiteCanaryLane({
        event_name: "pull_request",
        ref_name: "feature/issue-1002",
        changed_paths: ["docs/notes/unrelated.md"],
        change_kinds: [{ status: "M", path: "docs/notes/unrelated.md" }],
        fast_check: liteFastCheck,
      }),
    ).toEqual({
      disposition: "authorized_skip",
      skip_code: "closure_unaffected",
      reason_codes: ["closure_unaffected"],
    });
  });

  it("U-LITECI-002: fail-close条件はheavy Lite canaryをrequiredにする", () => {
    const cases = [
      [
        "closure contact",
        { changed_paths: ["src/setup/distribution-consumer-cli.ts"] },
        "changed_path_closure_contact",
      ],
      [
        "deletion",
        {
          changed_paths: ["docs/notes/unrelated.md"],
          change_kinds: [{ status: "D", path: "docs/notes/unrelated.md" }],
        },
        "deletion",
      ],
      [
        "rename",
        {
          changed_paths: ["docs/notes/unrelated.md"],
          change_kinds: [{ status: "R100", path: "docs/notes/unrelated.md" }],
        },
        "rename",
      ],
      [
        "generated dependency",
        { changed_paths: ["config/distribution-capability-artifact-catalog.json"] },
        "generated_dependency_change",
      ],
      [
        "manifest",
        { changed_paths: ["config/distribution-profile-catalog.json"] },
        "manifest_change",
      ],
      ["selector uncertainty", { selector_uncertain: true }, "selector_uncertain"],
      [
        "unknown change status",
        { change_kinds: [{ status: "X", path: "docs/notes/unrelated.md" }] },
        "selector_uncertain",
      ],
      ["path read failure", { path_read_failed: true }, "path_read_failure"],
      ["stale digest", { stale_digest: true }, "stale_digest"],
      [
        "profile fast check failure",
        { fast_check: { ...liteFastCheck, profile_ok: false } },
        "fast_profile_check_failed",
      ],
      [
        "manifest fast check failure",
        { fast_check: { ...liteFastCheck, manifest_ok: false } },
        "fast_manifest_check_failed",
      ],
      [
        "closure fast check failure",
        { fast_check: { ...liteFastCheck, closure_ok: false } },
        "fast_closure_check_failed",
      ],
    ] as const;
    for (const [label, overrides, reason] of cases) {
      expect(
        selectLiteCanaryLane({
          event_name: "pull_request",
          ref_name: "feature/issue-1002",
          changed_paths: ["docs/notes/unrelated.md"],
          change_kinds: [{ status: "M", path: "docs/notes/unrelated.md" }],
          fast_check: liteFastCheck,
          ...overrides,
        }),
        label,
      ).toMatchObject({
        disposition: "required",
        skip_code: null,
        reason_codes: expect.arrayContaining([reason]),
      });
    }
  });

  it("U-LITECI-003: main push・nightly・release dispatchはfull canaryをrequiredにする", () => {
    const cases = [
      ["main push", "push", "main"],
      ["nightly", "schedule", "main"],
      ["release candidate dispatch", "workflow_dispatch", "release-candidate"],
    ] as const;
    for (const [label, event_name, ref_name] of cases) {
      expect(
        selectLiteCanaryLane({
          event_name,
          ref_name,
          changed_paths: ["docs/notes/unrelated.md"],
          change_kinds: [{ status: "M", path: "docs/notes/unrelated.md" }],
          fast_check: liteFastCheck,
        }),
        label,
      ).toMatchObject({ disposition: "required", skip_code: null });
    }
  });

  it("U-LITECI-004: source/candidate HEAD不一致をstale digestとしてrequiredにする", () => {
    expect(
      selectLiteCanaryLane({
        event_name: "pull_request",
        ref_name: "feature/issue-1002",
        changed_paths: ["docs/notes/unrelated.md"],
        change_kinds: [{ status: "M", path: "docs/notes/unrelated.md" }],
        fast_check: { ...liteFastCheck, source_head: "b".repeat(40) },
      }),
    ).toMatchObject({
      disposition: "required",
      reason_codes: expect.arrayContaining(["stale_digest"]),
    });
  });

  it("U-LITECI-005: canary coverage入力の変更をrequiredにする", () => {
    for (const path of [
      "src/orchestration/loop-store.ts",
      "tests/loop-store-durability.test.ts",
      "README-LITE.md",
      "tests/distribution-lite-consumer-canary.test.ts",
    ]) {
      expect(
        selectLiteCanaryLane({
          event_name: "pull_request",
          ref_name: "feature/issue-1002",
          changed_paths: [path],
          change_kinds: [{ status: "M", path }],
          fast_check: liteFastCheck,
        }),
        path,
      ).toMatchObject({
        disposition: "required",
        skip_code: null,
        reason_codes: expect.arrayContaining(["changed_path_closure_contact"]),
      });
    }
  });

  it("U-IMPACTCI-CLI-001: CLIはselected test exact listをJSON投影する", () => {
    const result = spawnSync(
      process.execPath,
      [
        "--import",
        "tsx",
        "src/cli.ts",
        "ci",
        "impact-plan",
        "--profile",
        "draft_preflight",
        "--base-head",
        "a".repeat(40),
        "--candidate-head",
        "b".repeat(40),
        "--body-digest",
        `sha256:${"1".repeat(64)}`,
        "--changed",
        "tests/impact-ci-recovery-detail-design.test.ts",
        "--json",
      ],
      { cwd: process.cwd(), encoding: "utf8" },
    );
    expect(result.stderr).toBe("");
    expect(result.status).toBe(0);
    expect(JSON.parse(result.stdout)).toMatchObject({
      profile: "draft_preflight",
      fullAdmissionRequired: false,
      testFiles: ["tests/impact-ci-recovery-detail-design.test.ts"],
    });
  });

  it("U-IMPACTCI-000: test importをpath selectorへ決定的に投影する", () => {
    const projected = buildTestVerificationInventory([
      {
        path: "tests/foo.test.ts",
        content:
          'import { foo } from "../src/foo"; const design = "docs/design/helix/L6-function-design/foo.md";',
      },
    ]);
    expect(projected).toHaveLength(1);
    expect(projected[0]?.pathSelectors).toEqual([
      "docs/design/helix/L6-function-design/foo.md",
      "src/foo.ts",
      "tests/foo.test.ts",
    ]);
  });

  it("U-IMPACTCI-000B: nested testの複数階層importもselectorへ投影する", () => {
    const projected = buildTestVerificationInventory([
      { path: "tests/slow/foo.test.ts", content: 'import { foo } from "../../src/foo";' },
    ]);
    expect(projected[0]?.pathSelectors).toContain("src/foo.ts");
  });

  it("U-IMPACTCI-000C: source import consumerを検出してshared sourceのselective化を防ぐ", () => {
    expect(
      collectSourceImportConsumers([
        { path: "src/shared.ts", content: "export const shared = 1;" },
        { path: "src/consumer.ts", content: 'import { shared } from "./shared";' },
      ]),
    ).toEqual(new Set(["src/shared.ts"]));
  });

  it("U-IMPACTCI-001: inventoryを検証する", () => {
    expect(validateVerificationInventory(inventory)).toEqual({ ok: true, errors: [] });
    const duplicate = inventory.at(0);
    expect(duplicate).toBeDefined();
    if (!duplicate) return;
    expect(validateVerificationInventory([...inventory, duplicate]).ok).toBe(false);
  });

  // IT-IMPACTCI-001: changed path／relation graphからexact partitionを生成する。
  it("U-IMPACTCI-002/U-IMPACTCI-003: changed pathとcompanion relationを選択する", () => {
    const result = computeImpactDecision({
      profile: "draft_preflight",
      baseHead: "a".repeat(40),
      candidateHead: "b".repeat(40),
      bodyDigest: `sha256:${"1".repeat(64)}`,
      changedPaths: ["src/foo.ts"],
      companionItemIds: ["bar"],
      relationResolvedPaths: [],
      inventory,
    });
    expect(result.selectedItemIds).toEqual(["authority", "bar", "foo"]);
  });

  it("U-IMPACTCI-003B: test relationで解決したpathだけをunknown判定から除外する", () => {
    const result = computeImpactDecision({
      profile: "draft_preflight",
      baseHead: "a".repeat(40),
      candidateHead: "b".repeat(40),
      bodyDigest: `sha256:${"1".repeat(64)}`,
      changedPaths: ["docs/design/foo.md"],
      companionItemIds: ["foo"],
      relationResolvedPaths: ["docs/design/foo.md"],
      inventory,
    });
    expect(result.fullAdmissionRequired).toBe(false);
    expect(result.selectedItemIds).toEqual(["authority", "foo"]);
    expect(result.deferredItemIds).toEqual(["bar"]);
  });

  // IT-IMPACTCI-002: Draft以外とhigh-riskはfull admissionへ倒す。
  it("U-IMPACTCI-004/U-IMPACTCI-005: high-riskとunknownをfullへ倒す", () => {
    for (const path of [".github/workflows/harness-check.yml", "src/cli.ts", "src/unknown.ts"]) {
      const result = computeImpactDecision({
        profile: "draft_preflight",
        baseHead: "a".repeat(40),
        candidateHead: "b".repeat(40),
        bodyDigest: `sha256:${"1".repeat(64)}`,
        changedPaths: [path],
        companionItemIds: [],
        relationResolvedPaths: [],
        inventory,
      });
      expect(result.fullAdmissionRequired).toBe(true);
      expect(result.selectedItemIds).toEqual(["authority", "bar", "foo"]);
    }
  });

  it("U-IMPACTCI-006: selected/deferredをexact partitionにする", () => {
    const result = computeImpactDecision({
      profile: "draft_preflight",
      baseHead: "a".repeat(40),
      candidateHead: "b".repeat(40),
      bodyDigest: `sha256:${"1".repeat(64)}`,
      changedPaths: ["src/foo.ts"],
      companionItemIds: [],
      relationResolvedPaths: [],
      inventory,
    });
    expect(result.selectedItemIds).toEqual(["authority", "foo"]);
    expect(result.deferredItemIds).toEqual(["bar"]);
  });

  it("U-IMPACTCI-006B: known-lowでもselection 0ならfull exact setへ倒す", () => {
    const noMandatoryInventory = inventory.map((item) => ({ ...item, mandatoryProfiles: [] }));
    const result = computeImpactDecision({
      profile: "draft_preflight",
      baseHead: "a".repeat(40),
      candidateHead: "b".repeat(40),
      bodyDigest: `sha256:${"1".repeat(64)}`,
      changedPaths: [],
      companionItemIds: [],
      relationResolvedPaths: [],
      inventory: noMandatoryInventory,
    });
    expect(result.fullAdmissionRequired).toBe(true);
    expect(result.reasonCodes).toContain("empty_selection_full_fallback");
    expect(result.selectedItemIds).toEqual(["authority", "bar", "foo"]);
  });

  it("U-IMPACTCI-006C: source consumer閉包が未知ならdirect testがあってもfullへ倒す", () => {
    const result = computeImpactDecision({
      profile: "draft_preflight",
      baseHead: "a".repeat(40),
      candidateHead: "b".repeat(40),
      bodyDigest: `sha256:${"1".repeat(64)}`,
      changedPaths: ["src/foo.ts"],
      companionItemIds: [],
      relationResolvedPaths: [],
      forceFullAdmission: true,
      inventory,
    });
    expect(result.fullAdmissionRequired).toBe(true);
    expect(result.reasonCodes).toContain("source_consumer_unknown_closure");
    expect(result.selectedItemIds).toEqual(["authority", "bar", "foo"]);
  });

  // IT-IMPACTCI-003: snapshot欠落・driftをfail-closeする。
  it("U-IMPACTCI-007: snapshot欠落を拒否する", () => {
    expect(() =>
      computeImpactDecision({
        profile: "draft_preflight",
        baseHead: "",
        candidateHead: "b".repeat(40),
        bodyDigest: `sha256:${"1".repeat(64)}`,
        changedPaths: [],
        companionItemIds: [],
        relationResolvedPaths: [],
        inventory,
      }),
    ).toThrow("snapshot_unavailable");
  });

  // IT-IMPACTCI-004: profile別terminalを上書きせず検証する。
  it("U-IMPACTCI-008/U-IMPACTCI-009: terminal exact setと二重terminalを検証する", () => {
    const receipt = {
      schemaVersion: "helix-impact-ci-receipt.v1",
      profile: "draft_preflight",
      baseHead: "a".repeat(40),
      candidateHead: "b".repeat(40),
      bodyDigest: `sha256:${"1".repeat(64)}`,
      inventoryDigest: `sha256:${"2".repeat(64)}`,
      riskClass: "known_low",
      selectedItemIds: ["foo"],
      deferredItemIds: [],
      reasonCodes: [],
      fullAdmissionRequired: false,
      eventId: "e1",
      runId: "r1",
      executionSurface: "github_actions",
      environmentDigest: `sha256:${"3".repeat(64)}`,
      cacheClass: "cold",
      results: [
        {
          itemId: "foo",
          attempt: 1,
          startedAt: "2026-08-01T00:00:00Z",
          completedAt: "2026-08-01T00:00:01Z",
          durationMs: 1000,
          exitCode: 0,
          outputDigest: `sha256:${"4".repeat(64)}`,
        },
      ],
      terminal: true,
    } satisfies CiProfileReceipt;
    expect(validateCiProfileReceipt(receipt, [])).toEqual({ ok: true, errors: [] });
    expect(validateCiProfileReceipt({ ...receipt, results: [] }, []).ok).toBe(false);
    expect(validateCiProfileReceipt(receipt, [receipt]).ok).toBe(false);
    expect(
      validateCiProfileReceipt({ ...receipt, inventoryDigest: `sha256:${"5".repeat(64)}` }, [
        receipt,
      ]).errors,
    ).toContain("receipt_binding_mismatch");
  });

  it("U-IMPACTCI-010: post-mergeはdeferred exact setを回収する", () => {
    const result = computeImpactDecision({
      profile: "post_merge_full",
      baseHead: "a".repeat(40),
      candidateHead: "b".repeat(40),
      bodyDigest: `sha256:${"1".repeat(64)}`,
      changedPaths: [],
      companionItemIds: [],
      relationResolvedPaths: [],
      inventory,
    });
    expect(result.selectedItemIds).toEqual(["authority", "bar", "foo"]);
    expect(result.deferredItemIds).toEqual([]);
  });

  // IT-IMPACTCI-005: correctnessとperformance budgetを分離して集計する。
  it("U-IMPACTCI-011: surface/cache別の母集団だけを集計する", () => {
    const stats = computeReceiptPercentiles(
      [
        {
          profile: "draft_preflight",
          executionSurface: "github_actions",
          environmentDigest: `sha256:${"3".repeat(64)}`,
          cacheClass: "cold",
          durationMs: 100,
        },
        {
          profile: "draft_preflight",
          executionSurface: "github_actions",
          environmentDigest: `sha256:${"3".repeat(64)}`,
          cacheClass: "cold",
          durationMs: 300,
        },
      ],
      150,
    );
    expect(stats).toMatchObject({
      sampleCount: 2,
      p50: 100,
      p95: 300,
      budgetExceeded: true,
      correctnessAffected: false,
    });
  });

  it("U-IMPACTCI-012: budget超過をcorrectness redへ偽装しない", () => {
    const stats = computeReceiptPercentiles(
      [
        {
          profile: "draft_preflight",
          executionSurface: "github_actions",
          environmentDigest: `sha256:${"3".repeat(64)}`,
          cacheClass: "cold",
          durationMs: 301,
        },
      ],
      150,
    );
    expect(stats.budgetExceeded).toBe(true);
    expect(stats.correctnessAffected).toBe(false);
  });

  it("U-IMPACTCI-012B: percentile母集団keyの混在を入力順に依存せず拒否する", () => {
    expect(() =>
      computeReceiptPercentiles(
        [
          {
            profile: "draft_preflight",
            executionSurface: "github_actions",
            environmentDigest: `sha256:${"3".repeat(64)}`,
            cacheClass: "cold",
            durationMs: 10,
          },
          {
            profile: "draft_preflight",
            executionSurface: "local_internal",
            environmentDigest: `sha256:${"3".repeat(64)}`,
            cacheClass: "cold",
            durationMs: 20,
          },
        ],
        100,
      ),
    ).toThrow("mixed_percentile_group");
  });
});

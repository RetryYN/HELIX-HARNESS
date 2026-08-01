import { spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";
import {
  buildTestVerificationInventory,
  type CiProfileReceipt,
  collectSourceImportConsumers,
  computeImpactDecision,
  computeReceiptPercentiles,
  type VerificationItem,
  validateCiProfileReceipt,
  validateVerificationInventory,
} from "../src/runtime/impact-ci";

// PLAN-L7-493-impact-ci-recovery execution evidence.

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

  it("U-IMPACTCI-002/003: changed pathとcompanion relationを選択する", () => {
    const result = computeImpactDecision({
      profile: "draft_preflight",
      baseHead: "a".repeat(40),
      candidateHead: "b".repeat(40),
      bodyDigest: `sha256:${"1".repeat(64)}`,
      changedPaths: ["src/foo.ts"],
      companionItemIds: ["bar"],
      knownNoConsumerPaths: [],
      inventory,
    });
    expect(result.selectedItemIds).toEqual(["authority", "bar", "foo"]);
  });

  it("U-IMPACTCI-004/005: high-riskとunknownをfullへ倒す", () => {
    for (const path of [".github/workflows/harness-check.yml", "src/unknown.ts"]) {
      const result = computeImpactDecision({
        profile: "draft_preflight",
        baseHead: "a".repeat(40),
        candidateHead: "b".repeat(40),
        bodyDigest: `sha256:${"1".repeat(64)}`,
        changedPaths: [path],
        companionItemIds: [],
        knownNoConsumerPaths: [],
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
      knownNoConsumerPaths: [],
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
      knownNoConsumerPaths: [],
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
      knownNoConsumerPaths: [],
      forceFullAdmission: true,
      inventory,
    });
    expect(result.fullAdmissionRequired).toBe(true);
    expect(result.reasonCodes).toContain("source_consumer_unknown_closure");
    expect(result.selectedItemIds).toEqual(["authority", "bar", "foo"]);
  });

  it("U-IMPACTCI-007: snapshot欠落を拒否する", () => {
    expect(() =>
      computeImpactDecision({
        profile: "draft_preflight",
        baseHead: "",
        candidateHead: "b".repeat(40),
        bodyDigest: `sha256:${"1".repeat(64)}`,
        changedPaths: [],
        companionItemIds: [],
        knownNoConsumerPaths: [],
        inventory,
      }),
    ).toThrow("snapshot_unavailable");
  });

  it("U-IMPACTCI-008/009: terminal exact setと二重terminalを検証する", () => {
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
      knownNoConsumerPaths: [],
      inventory,
    });
    expect(result.selectedItemIds).toEqual(["authority", "bar", "foo"]);
    expect(result.deferredItemIds).toEqual([]);
  });

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

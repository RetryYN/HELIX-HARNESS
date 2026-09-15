import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import {
  analyzePlanEntryRouting,
  buildPlanEntryRoutingBaseline,
  loadPlanEntryRoutingBaseline,
  loadPlanEntryRoutingDocs,
  type PlanEntryRoutingBaseline,
  type PlanEntryRoutingDoc,
  unresolvedPlanEntrySignals,
} from "../src/lint/plan-entry-routing";
import {
  buildPlanLegacyWorkflowIdentityInventory,
  loadPlanLegacyWorkflowIdentityInventory,
  PLAN_LEGACY_WORKFLOW_IDENTITY_INVENTORY_PATH,
  type PlanLegacyWorkflowIdentityInventory,
} from "../src/lint/plan-entry-routing-legacy-input";
import { lintPlanGate } from "../src/plan/lint";
import { workflowModeForPlan } from "../src/schema/mode-catalog";
import {
  loadWorkflowClassificationCatalog,
  resolveWorkflowClassificationSignalToken,
  WORKFLOW_CLASSIFICATION_CATALOG_PATH,
  type WorkflowClassificationCatalog,
} from "../src/schema/workflow-classification-catalog";
import { WORKFLOW_CLASSIFICATION_REGISTRY_PATH } from "../src/schema/workflow-classification-registry";
import { openHarnessDb, upsertRow } from "../src/state-db/index";
import { migrate } from "../src/state-db/migration";
import { loadPlanEntryRoutingDocsFromDb } from "../src/state-db/plan-entry-routing-input";
import { classifyTask } from "../src/task/classify";

// PLAN-L7-569-typed-plan-workflow-identity — U-TPWID-002 / U-TPWID-003 / U-TPWID-004
// PLAN-L7-572-typed-plan-signal-identity-consistency — U-TPWSIG-001..004

const EMPTY_BASELINE: PlanEntryRoutingBaseline = { recorded: null, grandfathered: [] };

const roots: string[] = [];

function makeRepo(): string {
  const root = mkdtempSync(join(tmpdir(), "plan-entry-routing-"));
  roots.push(root);
  mkdirSync(join(root, "docs", "plans"), { recursive: true });
  mkdirSync(join(root, "docs", "governance"), { recursive: true });
  return root;
}

function seedDb(root: string): void {
  const db = openHarnessDb(join(root, ".helix", "harness.db"), { repoRoot: root });
  try {
    migrate(db);
    upsertRow(db, {
      table: "feedback_events",
      primaryKey: "feedback_event_id",
      row: {
        feedback_event_id: "fb-1",
        finding_id: "finding-1",
        plan_id: "",
        source_table: "feedback_events",
        source_id: "source-1",
        source_color: "red",
        signal_type: "debt_degradation",
        severity: "warn",
        status: "open",
        next_action: "route to refactor",
        created_at: "2026-07-06T00:00:00.000Z",
      },
    });
    upsertRow(db, {
      table: "feedback_events",
      primaryKey: "feedback_event_id",
      row: {
        feedback_event_id: "fb-refactor-candidate",
        finding_id: "finding-2",
        plan_id: "",
        source_table: "feedback_events",
        source_id: "source-refactor-candidate",
        source_color: "red",
        signal_type: "refactor_candidate:split-module",
        severity: "warn",
        status: "open",
        next_action: "route to refactor",
        created_at: "2026-07-06T00:00:00.000Z",
      },
    });
    upsertRow(db, {
      table: "issue_queue",
      primaryKey: "issue_queue_id",
      row: {
        issue_queue_id: "queue-1",
        source_event_id: "fb-1",
        plan_id: "",
        target: "github",
        title: "Refactor queue",
        body: "Queue item",
        status: "queued_dry_run",
        human_approval_required: 0,
        approved_by: "",
        approved_at: "",
        external_issue_id: "",
        external_issue_url: "",
        created_at: "2026-07-06T00:00:00.000Z",
      },
    });
  } finally {
    db.close();
  }
}

interface PlanSpec {
  planId: string;
  kind?: string;
  status?: string;
  routeMode?: string | null;
  entrySignals?: string[] | null;
  workflowIdentity?: {
    registryVersion?: string;
    registrySourceDigest?: string;
    targetAxis?: string;
    targetId?: string;
  };
}

const REQUIREMENTS_PATH = "docs/governance/helix-harness-requirements_v1.3.md";

function seedWorkflowClassificationAuthority(root: string): void {
  for (const path of [
    REQUIREMENTS_PATH,
    WORKFLOW_CLASSIFICATION_REGISTRY_PATH,
    WORKFLOW_CLASSIFICATION_CATALOG_PATH,
  ]) {
    mkdirSync(join(root, path, ".."), { recursive: true });
    cpSync(join(process.cwd(), path), join(root, path));
  }
}

function writePlan(root: string, spec: PlanSpec): void {
  const lines = [
    "---",
    `plan_id: ${spec.planId}`,
    "title: test plan",
    `kind: ${spec.kind ?? "refactor"}`,
    "layer: L7",
    "drive: agent",
    `status: ${spec.status ?? "draft"}`,
  ];
  if (spec.routeMode !== null) lines.push(`route_mode: ${spec.routeMode ?? "refactor"}`);
  if (spec.workflowIdentity) {
    const catalog = loadWorkflowClassificationCatalog(process.cwd());
    lines.push(
      "workflow_identity:",
      "  schema_version: helix-plan-workflow-identity.v1",
      `  registry_version: ${spec.workflowIdentity.registryVersion ?? catalog.source_registry.registry_version}`,
      `  registry_source_digest: ${spec.workflowIdentity.registrySourceDigest ?? catalog.source_registry.registry_source_digest}`,
      `  target_axis: ${spec.workflowIdentity.targetAxis ?? "workflow_model"}`,
      `  target_id: ${spec.workflowIdentity.targetId ?? "VERSION_UP"}`,
    );
  }
  if (spec.entrySignals !== null) {
    lines.push("entry_signals:");
    for (const signal of spec.entrySignals ?? ["source-1"]) lines.push(`  - ${signal}`);
  }
  lines.push("---", `# ${spec.planId}`, "");
  writeFileSync(join(root, "docs", "plans", `${spec.planId}.md`), lines.join("\n"), "utf8");
}

function analyze(root: string, baseline: PlanEntryRoutingBaseline = EMPTY_BASELINE) {
  const docs = loadPlanEntryRoutingDocsFromDb(root);
  return analyzePlanEntryRouting({ docs, baseline, legacyInventory: inventoryFor(docs) });
}

function inventoryFor(docs: PlanEntryRoutingDoc[]): PlanLegacyWorkflowIdentityInventory {
  const entries = docs
    .filter((doc) => doc.workflowIdentity === null)
    .map((doc) => ({ plan_id: doc.planId, path: doc.file }));
  return buildPlanLegacyWorkflowIdentityInventory(entries);
}

function typedRoutingDoc(routeMode: string | null = null): PlanEntryRoutingDoc {
  return {
    file: "docs/plans/PLAN-L7-915-typed.md",
    planId: "PLAN-L7-915-typed",
    kind: "impl",
    status: "draft",
    routeMode,
    workflowIdentity: {
      schemaVersion: "helix-plan-workflow-identity.v1",
      registryVersion: "1.1.2",
      registrySourceDigest: `sha256:${"a".repeat(64)}`,
      targetAxis: "workflow_model",
      targetId: "VERSION_UP",
      authorityFailure: null,
      valid: true,
    },
    entrySignals: ["po_directive:test"],
    resolvedSignals: [{ value: "po_directive:test", token: "po_directive", kind: "po_directive" }],
    typedSignalResolutions: [],
    workflowMode: null,
  };
}

afterAll(() => {
  for (const root of roots) rmSync(root, { recursive: true, force: true });
});

describe("plan-entry-routing gate (U-PROUTE-001..012)", () => {
  it("U-PROUTE-001: 実在 feedback source_id + kind 整合は ok", () => {
    const root = makeRepo();
    seedDb(root);
    writePlan(root, { planId: "PLAN-L7-900-good" });
    const result = analyze(root);
    expect(result.checked).toBe(1);
    expect(result.newViolations).toEqual([]);
    expect(result.ok).toBe(true);
  });

  it("U-PROUTE-002: entry_signals なしの新規 PLAN は entry_signal_absent", () => {
    const root = makeRepo();
    seedDb(root);
    writePlan(root, { planId: "PLAN-L7-901-no-signal", entrySignals: null });
    const result = analyze(root);
    expect(result.newViolations.map((v) => v.reason)).toContain("entry_signal_absent");
    expect(result.ok).toBe(false);
  });

  it("U-PROUTE-003: DB/queue に実在しない signal は entry_signal_unresolvable", () => {
    const root = makeRepo();
    seedDb(root);
    writePlan(root, {
      planId: "PLAN-L7-902-unresolvable",
      entrySignals: ["missing-source"],
    });
    const result = analyze(root);
    expect(result.newViolations.map((v) => v.reason)).toContain("entry_signal_unresolvable");
  });

  it("U-PROUTE-003b: canonical signal tokenはhuman directiveへ昇格せず解決する", () => {
    const root = makeRepo();
    seedWorkflowClassificationAuthority(root);
    writePlan(root, {
      planId: "PLAN-RECOVERY-1453-canonical-signal",
      kind: "recovery",
      routeMode: null,
      entrySignals: ["regression_dev"],
      workflowIdentity: { targetAxis: "workflow_model", targetId: "RECOVERY" },
    });

    const docs = loadPlanEntryRoutingDocs({ repoRoot: root });
    expect(docs[0]?.resolvedSignals).toEqual([
      { value: "regression_dev", token: "regression_dev", kind: "catalog_signal" },
    ]);
    expect(docs[0]?.resolvedSignals[0]?.kind).not.toBe("po_directive");
    expect(
      analyzePlanEntryRouting({
        docs,
        baseline: EMPTY_BASELINE,
        legacyInventory: inventoryFor(docs),
      }).newViolations,
    ).toEqual([]);
  });

  it("U-PROUTE-004: refactor_candidate:* signal に kind=impl は kind_signal_mismatch", () => {
    const root = makeRepo();
    seedDb(root);
    writePlan(root, {
      planId: "PLAN-L7-903-mismatch",
      kind: "impl",
      routeMode: "forward",
      entrySignals: ["source-refactor-candidate"],
    });
    const result = analyze(root);
    expect(result.newViolations.map((v) => v.reason)).toContain("kind_signal_mismatch");
  });

  it("U-PROUTE-005: po_directive は実在検査対象外で ok", () => {
    const root = makeRepo();
    writePlan(root, {
      planId: "PLAN-L7-904-po-directive",
      entrySignals: ["po_directive:2026-07-06 direct request"],
    });
    expect(analyze(root).ok).toBe(true);
  });

  it("U-PROUTE-006: baseline 記載は grandfathered、baseline 外追加違反で ok=false", () => {
    const root = makeRepo();
    writePlan(root, {
      planId: "PLAN-L7-905-legacy",
      routeMode: null,
      entrySignals: null,
    });
    writePlan(root, {
      planId: "PLAN-L7-906-new",
      routeMode: null,
      entrySignals: null,
    });
    const result = analyze(root, {
      recorded: "2026-07-06",
      grandfathered: ["PLAN-L7-905-legacy"],
    });
    expect(result.grandfathered.map((v) => v.planId)).toContain("PLAN-L7-905-legacy");
    expect(result.newViolations.map((v) => v.planId)).toContain("PLAN-L7-906-new");
    expect(result.ok).toBe(false);
  });

  it("U-PROUTE-007: 性能語彙は kind=refactor に分類される", () => {
    expect(classifyTask({ text: "テストが遅いので高速化したい" }).kind).toBe("refactor");
  });

  it("U-PROUTE-008: DB 不在の feedback source_id は fail-close unresolvable", () => {
    const root = makeRepo();
    writePlan(root, { planId: "PLAN-L7-907-no-db" });
    const result = analyze(root);
    expect(result.newViolations.map((v) => v.reason)).toContain("entry_signal_unresolvable");
  });

  it("U-PROUTE-009: route_mode 未宣言の新規 PLAN は route_mode_absent", () => {
    const root = makeRepo();
    seedDb(root);
    writePlan(root, { planId: "PLAN-L7-908-no-mode", routeMode: null });
    const result = analyze(root);
    expect(result.newViolations.map((v) => v.reason)).toContain("route_mode_absent");
  });

  it("U-PROUTE-010: route_mode 未宣言 legacy は prefix -> kind fallback で workflow mode を導出する", () => {
    expect(workflowModeForPlan({ planId: "PLAN-REVERSE-99-sample", kind: "reverse" })).toBe(
      "reverse",
    );
    expect(workflowModeForPlan({ planId: "PLAN-L7-909-refactor", kind: "refactor" })).toBe(
      "refactor",
    );
  });

  it("U-PROUTE-011: kind と route_mode の不整合は kind_route_mode_mismatch", () => {
    const root = makeRepo();
    seedDb(root);
    writePlan(root, {
      planId: "PLAN-L7-910-mode-mismatch",
      kind: "impl",
      routeMode: "refactor",
    });
    const result = analyze(root);
    expect(result.newViolations.map((v) => v.reason)).toContain("kind_route_mode_mismatch");
  });

  it("U-TPWID-002: current PLAN tupleをgenerated catalogへexact照合する", () => {
    const docs = loadPlanEntryRoutingDocs({
      repoRoot: process.cwd(),
      target: "docs/plans/PLAN-L7-569-typed-plan-workflow-identity.md",
    });
    expect(docs[0]?.workflowIdentity?.valid).toBe(true);
    expect(docs[0]?.workflowMode).toBeNull();

    const mismatches = [
      { registryVersion: "9.9.9" },
      { registrySourceDigest: `sha256:${"0".repeat(64)}` },
      { targetAxis: "case_driven_model" },
      { targetId: "UNKNOWN_WORKFLOW" },
    ];
    for (const [index, workflowIdentity] of mismatches.entries()) {
      const root = makeRepo();
      seedWorkflowClassificationAuthority(root);
      writePlan(root, {
        planId: `PLAN-L7-92${index}-typed-mismatch`,
        kind: "impl",
        routeMode: null,
        entrySignals: ["po_directive:test"],
        workflowIdentity,
      });
      const docs = loadPlanEntryRoutingDocs({ repoRoot: root });
      const result = analyzePlanEntryRouting({
        docs,
        baseline: EMPTY_BASELINE,
        legacyInventory: inventoryFor(docs),
      });
      expect(result.newViolations.map((violation) => violation.reason)).toEqual([
        "workflow_identity_invalid",
      ]);
    }
  });

  it("U-TPWLOAD-001: typed PLAN authorityのmissing／invalid／driftをreason付きで拒否する", () => {
    // PLAN-L7-571-typed-plan-authority-failure のexact authority failure oracle。
    const cases = [
      {
        expectedReason: "workflow_identity_authority_missing",
        mutate(root: string) {
          unlinkSync(join(root, WORKFLOW_CLASSIFICATION_CATALOG_PATH));
        },
      },
      {
        expectedReason: "workflow_identity_authority_invalid",
        mutate(root: string) {
          writeFileSync(join(root, WORKFLOW_CLASSIFICATION_CATALOG_PATH), "{", "utf8");
        },
      },
      {
        expectedReason: "workflow_identity_authority_drift",
        mutate(root: string) {
          const path = join(root, WORKFLOW_CLASSIFICATION_CATALOG_PATH);
          const catalog = JSON.parse(readFileSync(path, "utf8")) as {
            entities: Array<{ meaning: string }>;
          };
          const first = catalog.entities[0];
          if (!first) throw new Error("catalog fixture must contain an entity");
          first.meaning = `${first.meaning} drift`;
          writeFileSync(path, `${JSON.stringify(catalog, null, 2)}\n`, "utf8");
        },
      },
    ] as const;
    for (const [index, fixture] of cases.entries()) {
      const root = makeRepo();
      seedWorkflowClassificationAuthority(root);
      writePlan(root, {
        planId: `PLAN-L7-93${index}-authority-failure`,
        kind: "impl",
        routeMode: null,
        entrySignals: ["po_directive:test"],
        workflowIdentity: {},
      });
      fixture.mutate(root);
      const docs = loadPlanEntryRoutingDocs({ repoRoot: root });
      const result = analyzePlanEntryRouting({
        docs,
        baseline: EMPTY_BASELINE,
        legacyInventory: inventoryFor(docs),
      });
      expect(result.newViolations).toEqual([
        {
          planId: `PLAN-L7-93${index}-authority-failure`,
          file: `docs/plans/PLAN-L7-93${index}-authority-failure.md`,
          reason: fixture.expectedReason,
          detail: WORKFLOW_CLASSIFICATION_CATALOG_PATH,
        },
      ]);
    }
  });

  it("U-TPWID-003: typed identityとroute_modeの併記を拒否する", () => {
    expect(
      analyzePlanEntryRouting({
        docs: [typedRoutingDoc("version-up")],
        baseline: EMPTY_BASELINE,
        legacyInventory: buildPlanLegacyWorkflowIdentityInventory([]),
      }).newViolations,
    ).toMatchObject([{ reason: "legacy_route_mode_reemitted" }]);
  });

  it("U-TPWID-004: typed identityとPLAN kindを同一enumへ畳み込まない", () => {
    let legacySignalResolverCalls = 0;
    expect(
      analyzePlanEntryRouting({
        docs: [
          {
            ...typedRoutingDoc(),
            resolvedSignals: [{ value: "typed-source", token: "drift", kind: "feedback" }],
          },
        ],
        baseline: EMPTY_BASELINE,
        legacyInventory: buildPlanLegacyWorkflowIdentityInventory([]),
        resolveLegacySignalMode: () => {
          legacySignalResolverCalls += 1;
          return "forward";
        },
      }).newViolations,
    ).toEqual([]);
    expect(legacySignalResolverCalls).toBe(0);
  });

  it("U-TPWLEG-001: inventory外の非typed PLANはworkflow_identity_requiredで拒否する", () => {
    const root = makeRepo();
    writePlan(root, {
      planId: "PLAN-L7-941-new-legacy",
      routeMode: "refactor",
      entrySignals: ["po_directive:test"],
    });
    const docs = loadPlanEntryRoutingDocs({ repoRoot: root });
    const result = analyzePlanEntryRouting({
      docs,
      baseline: EMPTY_BASELINE,
      legacyInventory: buildPlanLegacyWorkflowIdentityInventory([]),
    });
    expect(result.newViolations).toEqual([
      expect.objectContaining({ reason: "workflow_identity_required" }),
    ]);
    const attemptedGrandfather = analyzePlanEntryRouting({
      docs,
      baseline: { recorded: "2026-08-16", grandfathered: ["PLAN-L7-941-new-legacy"] },
      legacyInventory: buildPlanLegacyWorkflowIdentityInventory([]),
    });
    expect(attemptedGrandfather.ok).toBe(false);
    expect(attemptedGrandfather.newViolations).toEqual([
      expect.objectContaining({ reason: "workflow_identity_required" }),
    ]);
    expect(attemptedGrandfather.grandfathered).toEqual([]);
    let legacyResolverCalls = 0;
    loadPlanEntryRoutingDocs({
      repoRoot: root,
      resolveSignals: unresolvedPlanEntrySignals,
      resolveLegacyWorkflowMode: (input) => {
        legacyResolverCalls += 1;
        return workflowModeForPlan(input);
      },
    });
    expect(legacyResolverCalls).toBe(0);

    writePlan(root, {
      planId: "PLAN-M-941-new-legacy",
      kind: "design",
      routeMode: null,
      entrySignals: null,
    });
    const excludedPrefixDocs = loadPlanEntryRoutingDocs({ repoRoot: root });
    expect(
      analyzePlanEntryRouting({
        docs: excludedPrefixDocs,
        baseline: EMPTY_BASELINE,
        legacyInventory: buildPlanLegacyWorkflowIdentityInventory([]),
      }).newViolations,
    ).toEqual([
      expect.objectContaining({
        planId: "PLAN-L7-941-new-legacy",
        reason: "workflow_identity_required",
      }),
      expect.objectContaining({
        planId: "PLAN-M-941-new-legacy",
        reason: "workflow_identity_required",
      }),
    ]);
  });

  it("U-TPWLEG-002: exact inventory内の既存非typed PLANだけを互換入力として受理する", () => {
    const root = makeRepo();
    writePlan(root, {
      planId: "PLAN-L7-942-inventory-legacy",
      routeMode: "refactor",
      entrySignals: ["po_directive:test"],
    });
    const docs = loadPlanEntryRoutingDocs({ repoRoot: root });
    expect(
      analyzePlanEntryRouting({
        docs,
        baseline: EMPTY_BASELINE,
        legacyInventory: inventoryFor(docs),
      }).newViolations,
    ).toEqual([]);
    const frozenLegacy = loadPlanEntryRoutingDocs({
      repoRoot: process.cwd(),
      target: "docs/plans/PLAN-L7-352-plan-entry-routing-impl.md",
    });
    expect(frozenLegacy[0]?.workflowMode).toBe("forward");
  });

  it("U-TPWLEG-003: inventory digest改ざんをfail-closeする", () => {
    const root = makeRepo();
    const inventoryPath = join(root, PLAN_LEGACY_WORKFLOW_IDENTITY_INVENTORY_PATH);
    mkdirSync(join(root, "config"), { recursive: true });
    const inventory = JSON.parse(
      readFileSync(join(process.cwd(), PLAN_LEGACY_WORKFLOW_IDENTITY_INVENTORY_PATH), "utf8"),
    ) as { entries: Array<Record<string, unknown>> };
    const first = inventory.entries[0];
    if (!first) throw new Error("frozen inventory fixture must not be empty");
    first.unexpected = true;
    writeFileSync(inventoryPath, `${JSON.stringify(inventory)}\n`, "utf8");
    const driftedInventory = loadPlanLegacyWorkflowIdentityInventory(root);
    expect(driftedInventory.valid).toBe(false);
  });

  it("U-TPWLEG-004: legacy inventoryの最大件数増加を拒否しcurrent mainを951件で凍結する", () => {
    expect(() =>
      buildPlanLegacyWorkflowIdentityInventory(
        [{ plan_id: "PLAN-L7-944-growth", path: "docs/plans/PLAN-L7-944-growth.md" }],
        0,
      ),
    ).toThrow("inventory growth blocked");
    const inventory = loadPlanLegacyWorkflowIdentityInventory(process.cwd());
    expect(inventory.valid).toBe(true);
    expect(inventory.entries).toHaveLength(951);
    expect(inventory.maximum_entry_count).toBe(951);
    expect(PLAN_LEGACY_WORKFLOW_IDENTITY_INVENTORY_PATH).toBe(
      "config/plan-legacy-workflow-identity-inventory.json",
    );
    const currentModule = readFileSync(
      join(process.cwd(), "src/lint/plan-entry-routing.ts"),
      "utf8",
    );
    expect(currentModule).not.toContain('from "../schema/mode-catalog"');
    expect(currentModule).not.toContain('from "../schema/route-map"');
  });

  it("U-TPWLEG-004: repository generatorはfrozen inventory不在時とlegacy増加を拒否する", () => {
    const root = makeRepo();
    seedWorkflowClassificationAuthority(root);
    writePlan(root, {
      planId: "PLAN-L7-352-plan-entry-routing-impl",
      routeMode: "refactor",
      entrySignals: ["po_directive:test"],
    });
    const missing = lintPlanGate({ gate: "entry-routing", repoRoot: root, writeBaseline: true });
    expect(missing.ok).toBe(false);
    expect(missing.messages[0]).toContain("legacy inventory missing or invalid");

    mkdirSync(join(root, "config"), { recursive: true });
    cpSync(
      join(process.cwd(), PLAN_LEGACY_WORKFLOW_IDENTITY_INVENTORY_PATH),
      join(root, PLAN_LEGACY_WORKFLOW_IDENTITY_INVENTORY_PATH),
    );
    const validated = lintPlanGate({ gate: "entry-routing", repoRoot: root, writeBaseline: true });
    expect(validated.ok).toBe(true);

    writePlan(root, {
      planId: "PLAN-L7-946-forbidden-growth",
      routeMode: "refactor",
      entrySignals: ["po_directive:test"],
    });
    const growth = lintPlanGate({ gate: "entry-routing", repoRoot: root, writeBaseline: true });
    expect(growth.ok).toBe(false);
    expect(growth.messages[0]).toContain("legacy inventory growth blocked");
  });

  it("U-TPWSIG-001: resolved signalとtyped identityの一致だけを受理する", () => {
    const root = makeRepo();
    seedWorkflowClassificationAuthority(root);
    writePlan(root, {
      planId: "PLAN-L7-935-signal-match",
      kind: "impl",
      routeMode: null,
      entrySignals: ["version-source"],
      workflowIdentity: {},
    });
    const docs = loadPlanEntryRoutingDocs({
      repoRoot: root,
      resolveSignals: () => [
        { value: "version-source", token: "version_deferral", kind: "feedback" },
      ],
    });
    expect(
      analyzePlanEntryRouting({
        docs,
        baseline: EMPTY_BASELINE,
        legacyInventory: buildPlanLegacyWorkflowIdentityInventory([]),
      }).newViolations,
    ).toEqual([]);
  });

  it("U-TPWSIG-002: resolved signalとtyped identityの矛盾を別axisのkind比較なしで拒否する", () => {
    const root = makeRepo();
    seedWorkflowClassificationAuthority(root);
    writePlan(root, {
      planId: "PLAN-L7-936-signal-mismatch",
      kind: "impl",
      routeMode: null,
      entrySignals: ["reverse-source"],
      workflowIdentity: {},
    });
    const docs = loadPlanEntryRoutingDocs({
      repoRoot: root,
      resolveSignals: () => [{ value: "reverse-source", token: "drift", kind: "feedback" }],
    });
    expect(
      analyzePlanEntryRouting({
        docs,
        baseline: EMPTY_BASELINE,
        legacyInventory: buildPlanLegacyWorkflowIdentityInventory([]),
      }).newViolations,
    ).toEqual([expect.objectContaining({ reason: "workflow_identity_signal_mismatch" })]);
  });

  it("U-TPWSIG-003: unknown／decision待ち／ambiguityを推測せず分類する", () => {
    const catalog = loadWorkflowClassificationCatalog(process.cwd());
    expect(resolveWorkflowClassificationSignalToken("not_registered", catalog).disposition).toBe(
      "unknown",
    );
    expect(
      resolveWorkflowClassificationSignalToken("user_feedback_iteration", catalog).disposition,
    ).toBe("decision_required");
    const ambiguousCatalog = {
      ...catalog,
      signal_bindings: [
        ...catalog.signal_bindings,
        { signals: ["drift"], target_axis: "workflow_model", target_id: "RECOVERY" },
      ],
    } as WorkflowClassificationCatalog;
    expect(resolveWorkflowClassificationSignalToken("drift", ambiguousCatalog).disposition).toBe(
      "ambiguous",
    );
    const orderIndependentDecisionCatalog = {
      ...catalog,
      signal_bindings: [
        {
          signals: ["user_feedback_iteration"],
          target_axis: "decision",
          target_id: "IMPACT_CLASSIFICATION",
        },
        ...catalog.signal_bindings,
      ],
    } as WorkflowClassificationCatalog;
    expect(
      resolveWorkflowClassificationSignalToken(
        "user_feedback_iteration",
        orderIndependentDecisionCatalog,
      ).disposition,
    ).toBe("decision_required");

    const cases = [
      ["unknown", "workflow_identity_signal_unknown"],
      ["decision_required", "workflow_identity_signal_decision_required"],
      ["ambiguous", "workflow_identity_signal_ambiguous"],
    ] as const;
    for (const [disposition, reason] of cases) {
      const doc = {
        ...typedRoutingDoc(),
        typedSignalResolutions: [
          {
            value: disposition,
            token: disposition,
            disposition,
            targetAxis: null,
            targetId: null,
          },
        ],
      };
      expect(
        analyzePlanEntryRouting({
          docs: [doc],
          baseline: EMPTY_BASELINE,
          legacyInventory: buildPlanLegacyWorkflowIdentityInventory([]),
        }).newViolations,
      ).toEqual([expect.objectContaining({ reason })]);
    }
  });

  it("U-TPWSIG-004: po_directiveからtyped identityを推測しない", () => {
    expect(typedRoutingDoc().typedSignalResolutions).toEqual([]);
    expect(
      analyzePlanEntryRouting({
        docs: [typedRoutingDoc()],
        baseline: EMPTY_BASELINE,
        legacyInventory: buildPlanLegacyWorkflowIdentityInventory([]),
      }).newViolations,
    ).toEqual([]);
  });

  it("U-PROUTE-012: DISCOVERY / M prefix と archived は検査対象外", () => {
    const root = makeRepo();
    writePlan(root, {
      planId: "PLAN-DISCOVERY-99-sample",
      kind: "poc",
      routeMode: null,
      entrySignals: null,
    });
    writePlan(root, {
      planId: "PLAN-M-99-sample",
      kind: "design",
      routeMode: null,
      entrySignals: null,
    });
    writePlan(root, {
      planId: "PLAN-L7-911-archived",
      status: "archived",
      routeMode: null,
      entrySignals: null,
    });
    const result = analyze(root);
    expect(result.checked).toBe(0);
    expect(result.newViolations).toEqual([]);
    expect(result.ok).toBe(true);
  });

  it("baseline 機械生成: buildPlanEntryRoutingBaseline は違反 plan_id を昇順で固定する", () => {
    const root = makeRepo();
    writePlan(root, { planId: "PLAN-L7-913-b", routeMode: null, entrySignals: null });
    writePlan(root, { planId: "PLAN-L7-912-a", routeMode: null, entrySignals: null });
    const docs = loadPlanEntryRoutingDocsFromDb(root);
    const inventory = inventoryFor(docs);
    const baseline = buildPlanEntryRoutingBaseline(docs, "2026-07-06", inventory);
    expect(baseline.grandfathered).toEqual(["PLAN-L7-912-a", "PLAN-L7-913-b"]);
    expect(analyzePlanEntryRouting({ docs, baseline, legacyInventory: inventory }).ok).toBe(true);
  });

  it("baseline loader: 不在時は空 baseline を返す", () => {
    const root = makeRepo();
    expect(loadPlanEntryRoutingBaseline(root)).toEqual({ recorded: null, grandfathered: [] });
  });

  it("pure loader: DB を読まず entry signal を unresolved として保持する", () => {
    const root = makeRepo();
    seedDb(root);
    writePlan(root, { planId: "PLAN-L7-914-pure-loader" });
    const docs = loadPlanEntryRoutingDocs({ repoRoot: root });
    expect(docs[0]?.resolvedSignals).toEqual([
      { value: "source-1", token: null, kind: "unresolvable" },
    ]);
  });
});

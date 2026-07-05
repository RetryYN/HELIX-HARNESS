import { spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { REQUIRED_DRIVE_MODELS } from "../src/lint/drive-db-registration";
import type { RelationGraphProjection } from "../src/lint/relation-graph";
import { deriveArtifactProgressDecision } from "../src/state-db/artifact-progress-decision";
import { projectRefactorCandidateSignals } from "../src/state-db/feedback-projections";
import { type HarnessDb, isSecretLike, openHarnessDb } from "../src/state-db/index";
import { migrate, rowCounts } from "../src/state-db/migration";
import { rebuildHarnessDb, recordProjectionEvent } from "../src/state-db/projection-writer";
import {
  REFACTOR_CANDIDATE_THRESHOLDS,
  REFACTOR_POLICY_TERMS,
} from "../src/state-db/refactor-candidate-policy";
import { analyzeRefactorCandidates } from "../src/state-db/refactor-candidates";

interface VerificationWorkflowRow {
  phase: string;
  ready_status: string;
  human_required: number;
}

interface VerificationGateRow {
  status: string;
  evidence_path: string;
}

interface DriveRunRow {
  plan_id: string;
  mode: string;
  status: string;
}

describe("SECRET_PATTERN word-boundary anchoring", () => {
  it("does not match 'sk' inside a word but matches a boundary-delimited token", () => {
    // Hyphenated slugs / paths must not false-positive (these crashed db rebuild).
    // The "sk" segments are interpolated so no literal token appears in source.
    expect(isSecretLike(`changed-path-src-${"task"}-has-no-relation-graph-node-impact`)).toBe(
      false,
    );
    expect(isSecretLike(`review the ${"risk"}-assessment-and-mitigation-plan-now-please`)).toBe(
      false,
    );
    expect(isSecretLike("planning-and-task-breakdown")).toBe(false);
    // Real boundary-delimited tokens (16+ chars) are still detected.
    expect(isSecretLike(`sk-${"a".repeat(20)}`)).toBe(true);
    expect(isSecretLike(`leaked ghp_${"b".repeat(20)} here`)).toBe(true);
  });
});

describe("IT-DB-01/02: harness.db projection writer", () => {
  it("detects typed refactor candidates for split, extraction, dedupe, and externalization", () => {
    expect(REFACTOR_CANDIDATE_THRESHOLDS.splitModuleLines).toBe(700);
    expect(REFACTOR_POLICY_TERMS).toContain("subagent");

    const longFunction = Array.from({ length: 121 }, (_, i) => `  total += ${i};`).join("\n");
    const duplicateBody = Array.from({ length: 10 }, (_, i) => `  value += ${i};`).join("\n");
    const repeatedLiteral = "copy this generated command before continuing";
    const candidates = analyzeRefactorCandidates([
      {
        path: "src/large.ts",
        content: `${Array.from({ length: 25 }, (_, i) => `export const v${i} = ${i};`).join("\n")}`,
      },
      {
        path: "src/functions.ts",
        content: `
function tooLarge() {
  let total = 0;
${longFunction}
  return total;
}
function duplicateOne() {
  let value = 0;
${duplicateBody}
  return value;
}
function duplicateTwo() {
  let value = 0;
${duplicateBody}
  return value;
}
export function literals() {
  return [
    "${repeatedLiteral}",
    "${repeatedLiteral}",
    "${repeatedLiteral}",
    "${repeatedLiteral}",
    "${repeatedLiteral}",
    "${repeatedLiteral}",
  ];
}
`,
      },
    ]);

    expect(candidates.map((candidate) => candidate.kind)).toEqual(
      expect.arrayContaining([
        "split-module",
        "extract-helper",
        "deduplicate-function",
        "externalize-literal",
      ]),
    );
    expect(
      analyzeRefactorCandidates([
        {
          path: "src/noise.ts",
          content: `
export const noise = [
  "docs/test-design/harness/L7-unit-test-design.md",
  "docs/test-design/harness/L7-unit-test-design.md",
  "docs/test-design/harness/L7-unit-test-design.md",
  "docs/test-design/harness/L7-unit-test-design.md",
  "docs/test-design/harness/L7-unit-test-design.md",
  "docs/test-design/harness/L7-unit-test-design.md",
  "evidence_path",
  "evidence_path",
  "evidence_path",
  "evidence_path",
  "evidence_path",
  "evidence_path",
  "--session <id>",
  "--session <id>",
  "--session <id>",
  "--session <id>",
  "--session <id>",
  "--session <id>",
];
`,
        },
      ]).filter((candidate) => candidate.kind === "externalize-literal"),
    ).toHaveLength(0);

    const exportOnly = analyzeRefactorCandidates([
      {
        path: "src/public-surface.ts",
        content: Array.from({ length: 26 }, (_, i) => `export const value${i} = ${i};`).join("\n"),
      },
    ]).find((candidate) => candidate.kind === "split-module");
    expect(exportOnly).toMatchObject({
      score: 26,
      threshold: 24,
      confidence: "medium",
    });
    const manyExports = analyzeRefactorCandidates([
      {
        path: "src/schema-catalog.ts",
        content: Array.from({ length: 53 }, (_, i) => `export const schema${i} = ${i};`).join("\n"),
      },
    ]).find((candidate) => candidate.kind === "split-module");
    expect(manyExports).toMatchObject({
      score: 53,
      threshold: 24,
      confidence: "medium",
    });
    const schemaIndexCatalog = analyzeRefactorCandidates([
      {
        path: "src/schema/index.ts",
        content: Array.from({ length: 53 }, (_, i) => `export const schema${i} = ${i};`).join("\n"),
      },
    ]).find((candidate) => candidate.kind === "split-module");
    expect(schemaIndexCatalog).toBeUndefined();
    const declarativeCatalog = analyzeRefactorCandidates([
      {
        path: "src/task/proposal-coverage-data.ts",
        content: [
          "export const CATALOG = [",
          ...Array.from({ length: 900 }, (_, i) => `  { id: ${i} },`),
          "];",
        ].join("\n"),
      },
    ]).find((candidate) => candidate.kind === "split-module");
    expect(declarativeCatalog).toMatchObject({
      score: expect.any(Number),
      threshold: 700,
      confidence: "medium",
    });
    const shortFunctionOrchestrator = analyzeRefactorCandidates([
      {
        path: "src/doctor/index.ts",
        content: Array.from(
          { length: 260 },
          (_, i) => `function check${i}() {\n  return ${i};\n}`,
        ).join("\n"),
      },
    ]).find((candidate) => candidate.kind === "split-module");
    expect(shortFunctionOrchestrator).toMatchObject({
      score: expect.any(Number),
      threshold: 700,
      confidence: "medium",
    });
    const largeFunctionModule = analyzeRefactorCandidates([
      {
        path: "src/large-orchestrator.ts",
        content: `export function tooLarge() {\n${Array.from(
          { length: 900 },
          (_, i) => `  returnValue += ${i};`,
        ).join("\n")}\n}`,
      },
    ]).find((candidate) => candidate.kind === "split-module");
    expect(largeFunctionModule).toMatchObject({
      score: expect.any(Number),
      threshold: 700,
      confidence: "high",
    });
    const policyExternalization = analyzeRefactorCandidates([
      {
        path: "src/team/stage-injection.ts",
        content: `
export function subagentInjectionForStage(stage: string) {
  if (stage === "design") return { subagent: "pmo-sonnet", inject: ["design-doc"] };
  if (stage === "implement") return { subagent: "be-logic", inject: ["testing"] };
  if (stage === "review") return { subagent: "code-reviewer", inject: ["review"] };
  return { subagent: "refactor-scout", inject: ["refactor"] };
}
`,
      },
    ]).find((candidate) => candidate.kind === "externalize-policy");
    expect(policyExternalization).toMatchObject({
      threshold: 5,
      confidence: "high",
    });
    const broadOrchestratorPolicyNoise = analyzeRefactorCandidates([
      {
        path: "src/cli.ts",
        content: [
          ...Array.from(
            { length: 48 },
            (_, i) => `if (phase === "phase-${i}") return routeModelTierProfileSkillAgent(${i});`,
          ),
          "export function routeModelTierProfileSkillAgent(value: number) { return value; }",
        ].join("\n"),
      },
    ]).filter((candidate) => candidate.kind === "externalize-policy");
    expect(broadOrchestratorPolicyNoise).toHaveLength(0);
    const detectorSelfNoise = analyzeRefactorCandidates([
      {
        path: "src/state-db/refactor-candidates.ts",
        content: `
import { REFACTOR_POLICY_TERMS } from "./refactor-candidate-policy";
export function collectExternalizedPolicyCandidates(text: string) {
  if (text.includes("stage")) return REFACTOR_POLICY_TERMS;
  if (text.includes("phase")) return REFACTOR_POLICY_TERMS;
  if (text.includes("route")) return REFACTOR_POLICY_TERMS;
  if (text.includes("approval")) return REFACTOR_POLICY_TERMS;
  if (text.includes("model")) return REFACTOR_POLICY_TERMS;
  if (text.includes("tier")) return REFACTOR_POLICY_TERMS;
  if (text.includes("profile")) return REFACTOR_POLICY_TERMS;
  if (text.includes("skill")) return REFACTOR_POLICY_TERMS;
  if (text.includes("subagent")) return REFACTOR_POLICY_TERMS;
  return [];
}
`,
      },
    ]).filter((candidate) => candidate.kind === "externalize-policy");
    expect(detectorSelfNoise).toHaveLength(0);
    const externalizedPolicyPair = analyzeRefactorCandidates([
      {
        path: "src/runtime/agent-guard.ts",
        content: `
export function evaluateAgentGuard(input: { stage: string; route: string; model: string }) {
  if (input.stage === "design") return input.route;
  if (input.stage === "review") return input.model;
  if (input.stage === "agent") return "subagent";
  if (input.stage === "approval") return "approved";
  return "policy";
}
`,
      },
      {
        path: "src/runtime/agent-guard-policy.ts",
        content: 'export const AGENT_POLICY = ["design", "review", "approval"];',
      },
    ]).filter((candidate) => candidate.kind === "externalize-policy");
    expect(externalizedPolicyPair).toHaveLength(0);
  });

  it("projects refactor candidates into quality signals and feedback events", () => {
    const repoRoot = join(tmpdir(), `helix-refactor-candidate-${randomUUID()}`);
    try {
      mkdirSync(join(repoRoot, "src"), { recursive: true });
      mkdirSync(join(repoRoot, "docs", "plans"), { recursive: true });
      writeFileSync(
        join(repoRoot, "src", "fixture.ts"),
        Array.from({ length: 950 }, (_, i) => `function check${i}() {\n  return ${i};\n}`).join(
          "\n",
        ),
      );

      const db = openHarnessDb(":memory:", { repoRoot });
      try {
        const result = rebuildHarnessDb({
          repoRoot,
          db,
          relationGraph: { nodes: [], edges: [], verificationProfiles: [], findings: [] },
          documentExports: {
            document_export_runs: [],
            document_export_datasets: [],
            document_export_artifacts: [],
            findings: [],
            actionsTaken: [],
            ok: true,
          },
          verificationEvidence: {
            verification_profiles: [],
            verification_recommendations: [],
            mcp_server_runs: [],
            external_tool_findings: [],
            findings: [],
            ok: true,
          },
        });
        expect(result.ok).toBe(true);

        const signal = db
          .prepare(
            "SELECT source, metric, subject_id, status FROM quality_signals WHERE source = ?",
          )
          .get("refactor-candidate-detector");
        expect(signal).toMatchObject({
          source: "refactor-candidate-detector",
          metric: "refactor_candidate:split-module",
          subject_id: "src/fixture.ts",
          status: "warn",
        });

        const feedback = db
          .prepare(
            "SELECT source_table, signal_type, next_action FROM feedback_events WHERE signal_type = ?",
          )
          .get("refactor_candidate:split-module");
        expect(feedback).toMatchObject({
          source_table: "quality_signals",
          signal_type: "refactor_candidate:split-module",
        });
        expect(String(feedback?.next_action ?? "")).toContain("review quality signal");
      } finally {
        db.close();
      }
    } finally {
      rmSync(repoRoot, { recursive: true, force: true });
    }
  });

  it("projects refactor candidate signals through the externalized feedback projection module", () => {
    const repoRoot = join(tmpdir(), `helix-refactor-signal-${randomUUID()}`);
    try {
      mkdirSync(join(repoRoot, "src"), { recursive: true });
      writeFileSync(
        join(repoRoot, "src", "fixture.ts"),
        Array.from({ length: 950 }, (_, i) => `function check${i}() {\n  return ${i};\n}`).join(
          "\n",
        ),
      );

      const events: Array<{ table: string; row: Record<string, unknown> }> = [];
      projectRefactorCandidateSignals(repoRoot, {} as HarnessDb, {
        nowIso: () => "2026-06-25T00:00:00.000Z",
        stableId: (prefix, value) => `${prefix}:${value}`,
        recordProjectionEvent: (_db, event) => {
          events.push({ table: event.table, row: event.row });
          return { table: event.table, id: event.id, evidence_path: "" };
        },
      });

      expect(events).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            table: "quality_signals",
            row: expect.objectContaining({
              source: "refactor-candidate-detector",
              metric: "refactor_candidate:split-module",
              status: "warn",
            }),
          }),
        ]),
      );
    } finally {
      rmSync(repoRoot, { recursive: true, force: true });
    }
  });

  it("derives artifact progress colors from dependency checks and linked tests", () => {
    expect(
      deriveArtifactProgressDecision({
        linkedTestCount: 0,
        dependencyChecked: false,
        openDependencyImpacts: 0,
      }),
    ).toMatchObject({ state: "dependency_unchecked", color: "red" });
    expect(
      deriveArtifactProgressDecision({
        linkedTestCount: 0,
        dependencyChecked: true,
        openDependencyImpacts: 0,
      }),
    ).toMatchObject({ state: "implemented_unverified", color: "yellow" });
    expect(
      deriveArtifactProgressDecision({
        linkedTestCount: 1,
        dependencyChecked: true,
        openDependencyImpacts: 0,
      }),
    ).toMatchObject({ state: "implemented_unverified", color: "yellow" });
    expect(
      deriveArtifactProgressDecision({
        linkedTestCount: 1,
        passedLinkedTestRunCount: 1,
        dependencyChecked: true,
        openDependencyImpacts: 0,
      }),
    ).toMatchObject({ state: "verified", color: "green" });
    expect(
      deriveArtifactProgressDecision({
        linkedTestCount: 1,
        passedLinkedTestRunCount: 1,
        dependencyChecked: true,
        openDependencyImpacts: 0,
        recoveryPlanIds: ["PLAN-REVERSE-56"],
      }),
    ).toMatchObject({ state: "recovering", color: "yellow" });
  });

  it("records normalized projection events idempotently and keeps rows joinable by plan_id", () => {
    const db = openHarnessDb(":memory:");
    try {
      migrate(db);

      recordProjectionEvent(db, {
        table: "plan_registry",
        id: "PLAN-L7-46-projection-writer",
        row: {
          plan_id: "PLAN-L7-46-projection-writer",
          kind: "impl",
          layer: "L7",
          drive: "db",
          status: "draft",
          updated_at: "2026-06-11T00:00:00.000Z",
        },
      });
      const rowRef = recordProjectionEvent(db, {
        table: "gate_runs",
        id: "gate-1",
        row: {
          gate_run_id: "gate-1",
          gate_id: "G-L7DB.B",
          plan_id: "PLAN-L7-46-projection-writer",
          status: "passed",
          checked_at: "2026-06-11T00:01:00.000Z",
          evidence_path: "docs/handover/projection.md",
        },
      });
      expect(rowRef).toEqual({
        table: "gate_runs",
        id: "gate-1",
        evidence_path: "docs/handover/projection.md",
      });
      recordProjectionEvent(db, {
        table: "gate_runs",
        id: "gate-1",
        row: {
          gate_run_id: "gate-1",
          gate_id: "G-L7DB.B",
          plan_id: "PLAN-L7-46-projection-writer",
          status: "passed",
          checked_at: "2026-06-11T00:01:00.000Z",
          evidence_path: "docs/handover/projection.md",
        },
      });

      expect(rowCounts(db).plan_registry).toBe(1);
      expect(rowCounts(db).gate_runs).toBe(1);
      const joined = db
        .prepare(
          `SELECT g.gate_id, p.plan_id
           FROM gate_runs g
           JOIN plan_registry p ON p.plan_id = g.plan_id
           WHERE g.gate_run_id = ?`,
        )
        .get("gate-1");
      expect(joined).toMatchObject({
        gate_id: "G-L7DB.B",
        plan_id: "PLAN-L7-46-projection-writer",
      });
    } finally {
      db.close();
    }
  });

  it("exempts structured-id columns from the secret check but still rejects free-form payload secrets", () => {
    const db = openHarnessDb(":memory:");
    try {
      migrate(db);
      // Regression: a relation-graph finding_id slug that contains "sk-" inside a
      // "task-" run (built here so no literal token appears in source) matches the
      // canonical SECRET_PATTERN but is a structured identifier, not a secret. It
      // must NOT be rejected — this exact slug crashed `helix db rebuild`.
      const slugId = `finding:missing-projection:changed-path-src-${"task"}-has-no-relation-graph-node`;
      expect(() =>
        recordProjectionEvent(db, {
          table: "feedback_events",
          id: "feedback:idtest",
          row: {
            finding_id: slugId,
            plan_id: "",
            signal_type: "finding",
            severity: "warn",
            next_action: "review the missing relation-graph node",
          },
        }),
      ).not.toThrow();

      // A real high-entropy token in a free-form (non-id) column is still rejected.
      const realToken = `sk-${"a".repeat(20)}`;
      expect(() =>
        recordProjectionEvent(db, {
          table: "feedback_events",
          id: "feedback:leak",
          row: {
            finding_id: "",
            plan_id: "",
            signal_type: "finding",
            severity: "warn",
            next_action: `leaked ${realToken}`,
          },
        }),
      ).toThrow(/secret-like/);
    } finally {
      db.close();
    }
  });

  it("turns unresolved cross-drive/model joins into findings instead of silently skipping them", () => {
    const db = openHarnessDb(":memory:");
    try {
      migrate(db);

      recordProjectionEvent(db, {
        table: "model_runs",
        id: "run-with-missing-plan",
        row: {
          run_id: "run-with-missing-plan",
          runtime: "codex",
          model: "gpt-5.4",
          role: "se",
          drive: "db",
          plan_id: "PLAN-L7-46-missing",
          started_at: "2026-06-11T00:02:00.000Z",
          completed_at: "2026-06-11T00:03:00.000Z",
          evidence_path: ".helix/evidence/run.json",
        },
      });

      const finding = db
        .prepare("SELECT kind, severity, subject_id, status FROM findings WHERE subject_id = ?")
        .get("model_runs:run-with-missing-plan");
      expect(finding).toMatchObject({
        kind: "unresolved-join",
        severity: "warn",
        status: "open",
      });
    } finally {
      db.close();
    }
  });

  it("does NOT flag work-context plan_id labels (audit-cycle id / compound) as unresolved joins (PLAN-L7-144)", () => {
    const db = openHarnessDb(":memory:");
    try {
      migrate(db);
      // hook_events carries the active WORK CONTEXT, which can be a non-PLAN label:
      // an audit-cycle id, or a compound "PLAN-a+b+c" spanning several PLANs. Neither
      // is a single-PLAN foreign key, so neither is a dangling reference.
      for (const [id, planId] of [
        ["audit-ctx", "A-136-cycle-p4-verification-audit"],
        ["compound-ctx", "PLAN-L7-47+48+49-db-feedback-audit-close"],
      ] as const) {
        recordProjectionEvent(db, {
          table: "model_runs",
          id,
          row: {
            run_id: id,
            runtime: "codex",
            model: "gpt-5.4",
            role: "se",
            drive: "db",
            plan_id: planId,
            started_at: "2026-06-11T00:02:00.000Z",
            completed_at: "2026-06-11T00:03:00.000Z",
            evidence_path: ".helix/evidence/run.json",
          },
        });
      }
      const flagged = db
        .prepare(
          "SELECT COUNT(*) AS n FROM findings WHERE kind = 'unresolved-join' AND subject_id IN (?, ?)",
        )
        .get("model_runs:audit-ctx", "model_runs:compound-ctx") as { n: number };
      expect(flagged.n).toBe(0);
    } finally {
      db.close();
    }
  });

  it("does not turn feedback_events queue rows into unresolved join findings", () => {
    const db = openHarnessDb(":memory:");
    try {
      migrate(db);

      recordProjectionEvent(db, {
        table: "feedback_events",
        id: "feedback:queue-row",
        row: {
          feedback_event_id: "feedback:queue-row",
          finding_id: "",
          plan_id: "PLAN-L7-46-missing",
          source_table: "quality_signals",
          source_id: "signal-1",
          source_color: "",
          signal_type: "skill_firing_rate",
          severity: "info",
          status: "open",
          next_action: "review quality signal signal-1",
          created_at: "2026-06-23T00:00:00.000Z",
        },
      });

      const finding = db
        .prepare("SELECT kind FROM findings WHERE subject_id = ?")
        .get("feedback_events:feedback:queue-row");
      expect(finding).toBeUndefined();
    } finally {
      db.close();
    }
  });

  it("rebuildHarnessDb is atomic: a mid-rebuild failure rolls back, leaving the prior projection intact", () => {
    const real = openHarnessDb(":memory:");
    try {
      // Baseline: a successful rebuild populates plan_registry.
      const baseline = rebuildHarnessDb({ repoRoot: process.cwd(), db: real });
      expect(baseline.ok).toBe(true);
      const before = rowCounts(real).plan_registry;
      expect(before).toBeGreaterThan(0);

      // Inject a failure once the projection starts writing plan_registry — this is
      // *after* truncateProjectionTables has emptied the tables. Without a transaction
      // boundary the rebuild would leave plan_registry truncated (0 rows).
      let injected = false;
      const flaky: HarnessDb = {
        path: real.path,
        driver: real.driver,
        exec: (sql) => real.exec(sql),
        prepare: (sql) => {
          if (!injected && /INSERT INTO plan_registry\b/i.test(sql)) {
            injected = true;
            throw new Error("injected mid-rebuild failure");
          }
          return real.prepare(sql);
        },
        userVersion: () => real.userVersion(),
        setUserVersion: (v) => real.setUserVersion(v),
        close: () => {},
      };
      expect(() => rebuildHarnessDb({ repoRoot: process.cwd(), db: flaky })).toThrow(
        /injected mid-rebuild failure/,
      );
      expect(injected).toBe(true);

      // The prior projection must survive: the truncate is rolled back, not committed.
      expect(rowCounts(real).plan_registry).toBe(before);
    } finally {
      real.close();
    }
  });

  it("auto-populates relation, profile, document export, and test catalog projections on rebuild", () => {
    const db = openHarnessDb(":memory:");
    try {
      const result = rebuildHarnessDb({ repoRoot: process.cwd(), db });

      expect(result.ok).toBe(true);
      expect(rowCounts(db).graph_nodes).toBeGreaterThan(0);
      expect(rowCounts(db).dependency_edges).toBeGreaterThan(0);
      expect(rowCounts(db).graph_snapshots).toBeGreaterThan(0);
      expect(rowCounts(db).diagram_artifacts).toBeGreaterThan(0);
      expect(rowCounts(db).impact_rules).toBeGreaterThan(0);
      expect(rowCounts(db).verification_profiles).toBeGreaterThan(0);
      expect(rowCounts(db).mcp_server_profiles).toBeGreaterThan(0);
      expect(rowCounts(db).mcp_profile_triggers).toBeGreaterThan(0);
      expect(rowCounts(db).document_export_profiles).toBeGreaterThan(0);
      expect(rowCounts(db).document_export_triggers).toBeGreaterThan(0);
      expect(rowCounts(db).document_export_runs).toBeGreaterThan(0);
      expect(rowCounts(db).document_export_datasets).toBeGreaterThan(0);
      expect(rowCounts(db).test_cases).toBeGreaterThan(0);
      expect(rowCounts(db).test_artifact_edges).toBeGreaterThan(0);
      expect(rowCounts(db).artifact_progress).toBeGreaterThan(0);
    } finally {
      db.close();
    }
  });

  it("projects relation graph edges into the physical dependency_edges vocabulary", () => {
    const repoRoot = join(tmpdir(), `helix-physical-edge-vocabulary-${randomUUID()}`);
    try {
      mkdirSync(join(repoRoot, "docs", "plans"), { recursive: true });
      writeFileSync(
        join(repoRoot, "docs", "plans", "PLAN-TEST-01-edge-vocabulary.md"),
        [
          "---",
          "plan_id: PLAN-TEST-01-edge-vocabulary",
          "status: confirmed",
          "kind: impl",
          "---",
          "",
          "fixture",
          "",
        ].join("\n"),
      );
      const db = openHarnessDb(":memory:");
      try {
        const relationGraph: RelationGraphProjection = {
          nodes: [
            { id: "plan:PLAN-TEST-01", kind: "plan", path: "docs/plans/PLAN-TEST-01.md" },
            { id: "requirement:FR-L1-99", kind: "requirement", path: "docs/requirements.md" },
            { id: "source:src/widget/core.ts", kind: "source", path: "src/widget/core.ts" },
            { id: "test:tests/core.test.ts", kind: "test", path: "tests/core.test.ts" },
            { id: "design:widget-design", kind: "design", path: "docs/design/widget.md" },
          ],
          edges: [
            { from: "plan:PLAN-TEST-01", to: "requirement:FR-L1-99", kind: "derives-from" },
            { from: "plan:PLAN-TEST-01", to: "source:src/widget/core.ts", kind: "generates" },
            {
              from: "source:src/widget/core.ts",
              to: "test:tests/core.test.ts",
              kind: "covered-by",
            },
            {
              from: "design:widget-design",
              to: "source:src/widget/core.ts",
              kind: "behavioral-contract",
            },
          ],
          verificationProfiles: [],
          findings: [],
        };

        rebuildHarnessDb({ repoRoot, db, relationGraph });
        const rows = db
          .prepare(
            `SELECT from_node_id, to_node_id, edge_kind
             FROM dependency_edges
             WHERE source = 'relation-graph'
             ORDER BY edge_kind, from_node_id, to_node_id`,
          )
          .all() as Array<{ from_node_id: string; to_node_id: string; edge_kind: string }>;

        expect(rows).toEqual([
          {
            from_node_id: "design:widget-design",
            to_node_id: "source:src/widget/core.ts",
            edge_kind: "declares_module",
          },
          {
            from_node_id: "source:src/widget/core.ts",
            to_node_id: "plan:PLAN-TEST-01",
            edge_kind: "implements",
          },
          {
            from_node_id: "plan:PLAN-TEST-01",
            to_node_id: "requirement:FR-L1-99",
            edge_kind: "references",
          },
          {
            from_node_id: "test:tests/core.test.ts",
            to_node_id: "source:src/widget/core.ts",
            edge_kind: "tests",
          },
        ]);
      } finally {
        db.close();
      }
    } finally {
      rmSync(repoRoot, { recursive: true, force: true });
    }
  });

  it("projects impact_results with the changed root node separated from the required action target", () => {
    const repoRoot = join(tmpdir(), `helix-impact-results-${randomUUID()}`);
    try {
      mkdirSync(join(repoRoot, "docs", "plans"), { recursive: true });
      mkdirSync(join(repoRoot, "src", "widget"), { recursive: true });
      mkdirSync(join(repoRoot, "tests"), { recursive: true });
      writeFileSync(
        join(repoRoot, "docs", "plans", "PLAN-TEST-01-widget.md"),
        [
          "---",
          "plan_id: PLAN-TEST-01-widget",
          "status: confirmed",
          "kind: impl",
          "---",
          "",
          "fixture",
          "",
        ].join("\n"),
      );
      writeFileSync(join(repoRoot, "src", "widget", "core.ts"), "export const core = 1;\n");
      writeFileSync(join(repoRoot, "tests", "core.test.ts"), "import '../src/widget/core';\n");
      const git = spawnSync("git", ["init"], { cwd: repoRoot, encoding: "utf8" });
      expect(git.status).toBe(0);
      const add = spawnSync("git", ["add", "."], { cwd: repoRoot, encoding: "utf8" });
      expect(add.status).toBe(0);
      writeFileSync(join(repoRoot, "src", "widget", "core.ts"), "export const core = 2;\n");

      const relationGraph: RelationGraphProjection = {
        nodes: [
          {
            id: "source:src/widget/core.ts",
            kind: "source",
            path: "src/widget/core.ts",
          },
          {
            id: "test:tests/core.test.ts",
            kind: "test",
            path: "tests/core.test.ts",
          },
        ],
        edges: [
          {
            from: "source:src/widget/core.ts",
            to: "test:tests/core.test.ts",
            kind: "covered-by",
          },
        ],
        verificationProfiles: [],
        findings: [],
      };
      const db = openHarnessDb(":memory:");
      try {
        rebuildHarnessDb({ repoRoot, db, relationGraph });
        const row = db
          .prepare(
            `SELECT root_node_id, impacted_node_id, required_action
             FROM impact_results
             WHERE required_action = 'require-sibling-test'
             LIMIT 1`,
          )
          .get() as
          | { root_node_id?: string; impacted_node_id?: string; required_action?: string }
          | undefined;

        expect(row).toEqual({
          root_node_id: "source:src/widget/core.ts",
          impacted_node_id: "test:tests/core.test.ts",
          required_action: "require-sibling-test",
        });
      } finally {
        db.close();
      }
    } finally {
      rmSync(repoRoot, { recursive: true, force: true });
    }
  });

  it("projects structured green-command case evidence into UT history signals on rebuild", () => {
    const repoRoot = join(tmpdir(), `helix-structured-ut-evidence-${randomUUID()}`);
    try {
      mkdirSync(join(repoRoot, "docs", "plans"), { recursive: true });
      mkdirSync(join(repoRoot, ".helix", "evidence", "green-command"), { recursive: true });
      writeFileSync(
        join(repoRoot, "docs", "plans", "PLAN-L7-239-structured-ut-evidence.md"),
        [
          "---",
          "plan_id: PLAN-L7-239-structured-ut-evidence",
          "title: structured unit-test evidence fixture",
          "kind: impl",
          "layer: L7",
          "drive: agent",
          "status: confirmed",
          "created: 2026-07-03",
          "updated: 2026-07-03",
          "review_evidence:",
          "  - reviewer: codex-tl",
          "    review_kind: intra_runtime_subagent",
          '    reviewed_at: "2026-07-03T00:05:00.000Z"',
          '    tests_green_at: "2026-07-03T00:05:00.000Z"',
          "    verdict: approve",
          "    worker_model: codex",
          "    reviewer_model: codex-intra-runtime",
          "    green_commands:",
          "      - kind: unit_test",
          '        command: "bun test tests/structured.test.ts"',
          "        runner: bun",
          "        scope: targeted",
          "        exit_code: 1",
          '        completed_at: "2026-07-03T00:01:00.000Z"',
          "        evidence_path: .helix/evidence/green-command/run-1.json",
          '        output_digest: "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"',
          "      - kind: unit_test",
          '        command: "bun test tests/structured.test.ts"',
          "        runner: bun",
          "        scope: targeted",
          "        exit_code: 0",
          '        completed_at: "2026-07-03T00:03:00.000Z"',
          "        evidence_path: .helix/evidence/green-command/run-2.json",
          '        output_digest: "sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"',
          "---",
          "",
          "# Fixture",
        ].join("\n"),
      );
      writeFileSync(
        join(repoRoot, ".helix", "evidence", "green-command", "run-1.json"),
        JSON.stringify(
          {
            schema_version: "green-command-evidence-v1",
            plan_id: "PLAN-L7-239-structured-ut-evidence",
            recorded_at: "2026-07-03T00:01:00.000Z",
            command: "bun test tests/structured.test.ts",
            runner: "bun",
            scope: "targeted",
            exit_code: 1,
            cases: [
              {
                oracle_id: "U-STRUCT-FLAKE",
                name: "structured flake",
                status: "failed",
                duration_ms: 100,
                message: "first failure",
                artifact_path: "src/workflow/contracts.ts",
              },
              {
                oracle_id: "U-STRUCT-SLOW",
                name: "structured slow",
                status: "passed",
                duration_ms: 100,
              },
            ],
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(repoRoot, ".helix", "evidence", "green-command", "run-2.json"),
        JSON.stringify(
          {
            schema_version: "green-command-evidence-v1",
            plan_id: "PLAN-L7-239-structured-ut-evidence",
            recorded_at: "2026-07-03T00:03:00.000Z",
            command: "bun test tests/structured.test.ts",
            runner: "bun",
            scope: "targeted",
            exit_code: 0,
            cases: [
              {
                oracle_id: "U-STRUCT-FLAKE",
                name: "structured flake",
                status: "passed",
                duration_ms: 110,
              },
              {
                oracle_id: "U-STRUCT-SLOW",
                name: "structured slow",
                status: "passed",
                duration_ms: 180,
              },
            ],
          },
          null,
          2,
        ),
      );

      const db = openHarnessDb(":memory:");
      try {
        const result = rebuildHarnessDb({ repoRoot, db });

        expect(result.ok).toBe(true);
        expect(rowCounts(db).test_results).toBe(4);
        expect(rowCounts(db).test_flake_events).toBe(1);
        expect(
          db
            .prepare(
              "SELECT pass_count, fail_count, flake_score FROM test_flake_events WHERE test_case_id = ?",
            )
            .get("test-case-oracle:PLAN-L7-239-structured-ut-evidence:U-STRUCT-FLAKE"),
        ).toEqual({ pass_count: 1, fail_count: 1, flake_score: 0.5 });
        expect(
          db
            .prepare(
              "SELECT status, value FROM quality_signals WHERE source = ? AND subject_id = ? AND metric = ?",
            )
            .get(
              "ut-history",
              "oracle:PLAN-L7-239-structured-ut-evidence:U-STRUCT-SLOW",
              "duration_regression",
            ),
        ).toEqual({ status: "warn", value: 1.8 });
        expect(
          db
            .prepare(
              "SELECT COUNT(*) AS n FROM quality_signals WHERE source = ? AND subject_id = ? AND metric = ?",
            )
            .get(
              "ut-history",
              "oracle:PLAN-L7-239-structured-ut-evidence:U-STRUCT-SLOW",
              "duration_trend_ms",
            )?.n,
        ).toBe(2);
        expect(
          db
            .prepare(
              "SELECT value, threshold, status, computed_at FROM quality_signals WHERE source = ? AND subject_id = ? AND metric = ? ORDER BY computed_at DESC LIMIT 1",
            )
            .get(
              "ut-history",
              "oracle:PLAN-L7-239-structured-ut-evidence:U-STRUCT-SLOW",
              "duration_trend_ms",
            ),
        ).toEqual({
          value: 180,
          threshold: 100,
          status: "warn",
          computed_at: "2026-07-03T00:03:00.000Z",
        });
        expect(
          db
            .prepare(
              "SELECT source_table, signal_type, severity FROM feedback_events WHERE source_table = ? AND signal_type = ? LIMIT 1",
            )
            .get("quality_signals", "duration_regression"),
        ).toMatchObject({
          source_table: "quality_signals",
          signal_type: "duration_regression",
          severity: "info",
        });
      } finally {
        db.close();
      }
    } finally {
      rmSync(repoRoot, { recursive: true, force: true });
    }
  });

  it("projects Vitest, Playwright, and JUnit reporter evidence into UT history signals on rebuild", () => {
    const repoRoot = join(tmpdir(), `helix-reporter-ut-evidence-${randomUUID()}`);
    try {
      mkdirSync(join(repoRoot, "docs", "plans"), { recursive: true });
      mkdirSync(join(repoRoot, ".helix", "evidence", "green-command"), { recursive: true });
      writeFileSync(
        join(repoRoot, "docs", "plans", "PLAN-L7-240-reporter-ut-evidence.md"),
        [
          "---",
          "plan_id: PLAN-L7-240-reporter-ut-evidence",
          "title: reporter unit-test evidence fixture",
          "kind: impl",
          "layer: L7",
          "drive: agent",
          "status: confirmed",
          "created: 2026-07-03",
          "updated: 2026-07-03",
          "review_evidence:",
          "  - reviewer: codex-tl",
          "    review_kind: intra_runtime_subagent",
          '    reviewed_at: "2026-07-03T00:10:00.000Z"',
          '    tests_green_at: "2026-07-03T00:10:00.000Z"',
          "    verdict: approve",
          "    worker_model: codex",
          "    reviewer_model: codex-intra-runtime",
          "    green_commands:",
          "      - kind: unit_test",
          '        command: "bun test tests/reporter.test.ts --reporter=json"',
          "        runner: bun",
          "        scope: targeted",
          "        exit_code: 0",
          '        completed_at: "2026-07-03T00:01:00.000Z"',
          "        evidence_path: .helix/evidence/green-command/vitest.json",
          '        output_digest: "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"',
          "      - kind: integration_test",
          '        command: "bunx playwright test tests/e2e/reporter.spec.ts --reporter=json"',
          "        runner: bun",
          "        scope: targeted",
          "        exit_code: 0",
          '        completed_at: "2026-07-03T00:02:00.000Z"',
          "        evidence_path: .helix/evidence/green-command/playwright.json",
          '        output_digest: "sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"',
          "      - kind: unit_test",
          '        command: "bun test tests/reporter.test.ts --reporter=junit"',
          "        runner: bun",
          "        scope: targeted",
          "        exit_code: 0",
          '        completed_at: "2026-07-03T00:03:00.000Z"',
          "        evidence_path: .helix/evidence/green-command/junit.xml",
          '        output_digest: "sha256:cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc"',
          "---",
          "",
          "# Fixture",
        ].join("\n"),
      );
      writeFileSync(
        join(repoRoot, ".helix", "evidence", "green-command", "vitest.json"),
        JSON.stringify({
          testResults: [
            {
              name: "tests/reporter.test.ts",
              assertionResults: [
                {
                  fullName: "reporter U-VITEST-A passes",
                  status: "passed",
                  duration: 10,
                },
                {
                  ancestorTitles: ["reporter"],
                  title: "U-VITEST-B skipped",
                  status: "pending",
                },
              ],
            },
          ],
        }),
      );
      writeFileSync(
        join(repoRoot, ".helix", "evidence", "green-command", "playwright.json"),
        JSON.stringify({
          suites: [
            {
              title: "dashboard",
              file: "tests/e2e/reporter.spec.ts",
              specs: [
                {
                  title: "U-PW-FLAKE renders progress",
                  tests: [
                    {
                      projectName: "chromium",
                      results: [
                        { status: "failed", duration: 100, error: { message: "first attempt" } },
                        { status: "passed", duration: 80 },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        }),
      );
      writeFileSync(
        join(repoRoot, ".helix", "evidence", "green-command", "junit.xml"),
        [
          '<testsuite name="reporter">',
          '  <testcase classname="tests/reporter.test.ts" name="U-JUNIT-A passes" time="0.020" />',
          '  <testcase classname="tests/reporter.test.ts" name="U-JUNIT-B fails" time="0.030">',
          '    <failure message="junit failure">stack</failure>',
          "  </testcase>",
          '  <testcase classname="tests/reporter.test.ts" name="U-JUNIT-C skipped"><skipped /></testcase>',
          "</testsuite>",
        ].join("\n"),
      );

      const db = openHarnessDb(":memory:");
      try {
        const result = rebuildHarnessDb({ repoRoot, db });

        expect(result.ok).toBe(true);
        expect(rowCounts(db).test_runs).toBe(3);
        expect(rowCounts(db).test_results).toBe(7);
        expect(
          db
            .prepare(
              "SELECT pass_count, fail_count, flake_score FROM test_flake_events WHERE test_case_id = ?",
            )
            .get("test-case-oracle:PLAN-L7-240-reporter-ut-evidence:U-PW-FLAKE"),
        ).toEqual({ pass_count: 1, fail_count: 1, flake_score: 0.5 });
        expect(
          db
            .prepare("SELECT COUNT(*) AS n FROM test_artifact_edges WHERE artifact_path = ?")
            .get("tests/reporter.test.ts")?.n,
        ).toBeGreaterThan(0);
      } finally {
        db.close();
      }
    } finally {
      rmSync(repoRoot, { recursive: true, force: true });
    }
  });

  it("U-RUNDEBUG-007: projects L7.5 runtime verification logs into harness.db runtime evidence rows", () => {
    const repoRoot = join(tmpdir(), `helix-runtime-verification-projection-${randomUUID()}`);
    try {
      mkdirSync(join(repoRoot, "docs", "plans"), { recursive: true });
      mkdirSync(join(repoRoot, ".helix", "evidence", "run-debug"), { recursive: true });
      writeFileSync(
        join(repoRoot, "docs", "plans", "PLAN-L7-202-run-debug-runtime-verification.md"),
        [
          "---",
          "plan_id: PLAN-L7-202-run-debug-runtime-verification",
          "title: runtime verification projection fixture",
          "kind: add-impl",
          "layer: L7",
          "drive: be",
          "status: confirmed",
          "created: 2026-06-30",
          "updated: 2026-06-30",
          "---",
          "",
          "# Fixture",
        ].join("\n"),
      );
      writeFileSync(
        join(repoRoot, ".helix", "evidence", "run-debug", "runtime-verification.jsonl"),
        [
          JSON.stringify({
            event_id: "runtime-event-1",
            plan_id: "PLAN-L7-202-run-debug-runtime-verification",
            requirement_id: "HR-FR-P4-01",
            test_oracle_id: "U-RUNDEBUG-006",
            claim: "works",
            session_id: "session-1",
            source: "run-debug",
            runtime_surface: "helix-cli",
            correlation_id: "corr-1",
            evidence_path: ".helix/evidence/run-debug/session-1.jsonl",
            occurred_at: "2026-06-30T00:00:00.000Z",
            redaction_policy: "no-secret-material",
          }),
          "{not json",
          "",
        ].join("\n"),
      );

      const db = openHarnessDb(":memory:", { repoRoot });
      try {
        const result = rebuildHarnessDb({
          repoRoot,
          db,
          relationGraph: { nodes: [], edges: [], verificationProfiles: [], findings: [] },
          documentExports: {
            document_export_runs: [],
            document_export_datasets: [],
            document_export_artifacts: [],
            findings: [],
            actionsTaken: [],
            ok: true,
          },
          verificationEvidence: {
            verification_profiles: [],
            verification_recommendations: [],
            mcp_server_runs: [],
            external_tool_findings: [],
            findings: [],
            ok: true,
          },
        });
        expect(result.ok).toBe(true);
        expect(rowCounts(db).runtime_verification_events).toBe(1);
        const event = db
          .prepare(
            "SELECT plan_id, claim, source, runtime_surface, verification_class, accept_status FROM runtime_verification_events WHERE event_id = ?",
          )
          .get("runtime-event-1");
        expect(event).toMatchObject({
          plan_id: "PLAN-L7-202-run-debug-runtime-verification",
          claim: "works",
          source: "run-debug",
          runtime_surface: "helix-cli",
          verification_class: "runtime_verified",
          accept_status: "accepted",
        });
        const finding = db
          .prepare("SELECT kind, source, status FROM findings WHERE kind = ?")
          .get("runtime-verification-log-invalid");
        expect(finding).toMatchObject({
          kind: "runtime-verification-log-invalid",
          source: "runtime-verification-log",
          status: "open",
        });
      } finally {
        db.close();
      }
    } finally {
      rmSync(repoRoot, { recursive: true, force: true });
    }
  });

  it("projects pair-agent run evidence into model, gate, and guardrail rows", () => {
    const repoRoot = join(tmpdir(), `helix-pair-agent-projection-${randomUUID()}`);
    try {
      mkdirSync(join(repoRoot, "docs", "plans"), { recursive: true });
      mkdirSync(join(repoRoot, ".helix", "evidence", "pair-agent"), { recursive: true });
      writeFileSync(
        join(repoRoot, "docs", "plans", "PLAN-L7-177-helix-orchestration-runtime-bridge.md"),
        [
          "---",
          "plan_id: PLAN-L7-177-helix-orchestration-runtime-bridge",
          "title: pair-agent evidence projection fixture",
          "kind: add-impl",
          "layer: L7",
          "drive: agent",
          "status: confirmed",
          "created: 2026-07-01",
          "updated: 2026-07-01",
          "---",
          "",
          "# Fixture",
        ].join("\n"),
      );
      writeFileSync(
        join(repoRoot, ".helix", "evidence", "pair-agent", "20260701034500-PLAN-L7-177.json"),
        `${JSON.stringify(
          {
            schema_version: "pair-agent-run-evidence.v1",
            recorded_at: "2026-07-01T03:45:00.000Z",
            run_id: "pair-agent:PLAN-L7-177:20260701034500",
            mode: "hybrid",
            execute: false,
            trace: {
              plan_id: "PLAN-L7-177-helix-orchestration-runtime-bridge",
              span_id: "pair-agent:PLAN-L7-177:20260701034500:run",
              tool_contract_id: "HC-P2.runPairAgentTddPlan",
              handoff_target: "orchestrator",
              guardrail_decision: {
                guardrail: "frontier-approval",
                decision: "allow",
                human_signoff_required: false,
              },
              eval_outcome: { ok: true, status: "planned", final_verdict: null },
              started_at: "2026-07-01T03:44:59.000Z",
              completed_at: "2026-07-01T03:45:00.000Z",
              duration_ms: 1000,
              cost_usd: null,
              loop_summary: {
                phase_count: 5,
                smart_test_author_count: 1,
                light_implementation_count: 2,
                smart_review_count: 2,
                consultation_count: 1,
                pending_consultation_count: 1,
                failed_review_count: 1,
                fix_cycle_count: 1,
                transcript_digest:
                  "sha256:3f77f3902051f9be11dcc658411a9e07a685b1088231bbf6564e28ade32e5a80",
              },
              phase_spans: [
                {
                  span_id: "pair-agent:PLAN-L7-177:20260701034500:phase:1",
                  phase: "smart_test_author",
                  cycle: 0,
                  agent_key: "smart-review-agent",
                  provider: "claude",
                  model: "claude-opus-4-8",
                  eval_outcome: { status: "planned", verdict: null, exit_code: null },
                },
                {
                  span_id: "pair-agent:PLAN-L7-177:20260701034500:phase:2",
                  phase: "light_implementation",
                  cycle: 1,
                  agent_key: "light-implementation-agent",
                  provider: "codex",
                  model: "gpt-5.3-codex-spark",
                  output_excerpt_digest:
                    "sha256:42e9b44a67d5f84e95e1dcd852e1aef7ddce1e917a3d385bd2072c9cef9f1c79",
                  eval_outcome: { status: "pending", verdict: null, exit_code: 0 },
                },
                {
                  span_id: "pair-agent:PLAN-L7-177:20260701034500:phase:3",
                  phase: "smart_review",
                  cycle: 1,
                  agent_key: "smart-review-agent",
                  provider: "claude",
                  model: "claude-opus-4-8",
                  output_excerpt_digest:
                    "sha256:f2469a633ae39d84ca42670f9cc2dfe327f1da74f933615f592fa6fb553f5cd2",
                  eval_outcome: { status: "failed", verdict: "fail", exit_code: 0 },
                },
                {
                  span_id: "pair-agent:PLAN-L7-177:20260701034500:phase:4",
                  phase: "light_implementation",
                  cycle: 2,
                  agent_key: "light-implementation-agent",
                  provider: "codex",
                  model: "gpt-5.3-codex-spark",
                  output_excerpt_digest:
                    "sha256:8d3dd8e8b0de3f1c0914c5ad5f4d3173e3f734ca5c78406c70fdcb1f0174b80c",
                  eval_outcome: { status: "passed", verdict: null, exit_code: 0 },
                },
                {
                  span_id: "pair-agent:PLAN-L7-177:20260701034500:phase:5",
                  phase: "smart_review",
                  cycle: 2,
                  agent_key: "smart-review-agent",
                  provider: "claude",
                  model: "claude-opus-4-8",
                  output_excerpt_digest:
                    "sha256:44e818f6f322e38cc5d6ceb76d2bfafc16c9de5e68fd033777d7f3255d76aa6d",
                  eval_outcome: { status: "passed", verdict: "pass", exit_code: 0 },
                },
              ],
            },
          },
          null,
          2,
        )}\n`,
      );

      const db = openHarnessDb(":memory:", { repoRoot });
      try {
        const result = rebuildHarnessDb({
          repoRoot,
          db,
          relationGraph: { nodes: [], edges: [], verificationProfiles: [], findings: [] },
          documentExports: {
            document_export_runs: [],
            document_export_datasets: [],
            document_export_artifacts: [],
            findings: [],
            actionsTaken: [],
            ok: true,
          },
          verificationEvidence: {
            verification_profiles: [],
            verification_recommendations: [],
            mcp_server_runs: [],
            external_tool_findings: [],
            findings: [],
            ok: true,
          },
        });

        expect(result.ok).toBe(true);
        const modelRuns = db
          .prepare(
            "SELECT runtime, model, role, drive, plan_id, evidence_path FROM model_runs WHERE evidence_path LIKE ? ORDER BY run_id",
          )
          .all(".helix/evidence/pair-agent/%");
        expect(modelRuns).toEqual([
          expect.objectContaining({
            runtime: "claude",
            role: "smart-review-agent",
            drive: "agent",
            plan_id: "PLAN-L7-177-helix-orchestration-runtime-bridge",
          }),
          expect.objectContaining({
            runtime: "codex",
            role: "light-implementation-agent",
            drive: "agent",
            plan_id: "PLAN-L7-177-helix-orchestration-runtime-bridge",
          }),
          expect.objectContaining({
            runtime: "claude",
            role: "smart-review-agent",
            drive: "agent",
            plan_id: "PLAN-L7-177-helix-orchestration-runtime-bridge",
          }),
          expect.objectContaining({
            runtime: "codex",
            role: "light-implementation-agent",
            drive: "agent",
            plan_id: "PLAN-L7-177-helix-orchestration-runtime-bridge",
          }),
          expect.objectContaining({
            runtime: "claude",
            role: "smart-review-agent",
            drive: "agent",
            plan_id: "PLAN-L7-177-helix-orchestration-runtime-bridge",
          }),
        ]);
        const gate = db
          .prepare("SELECT gate_id, status, evidence_path FROM gate_runs WHERE gate_id = ?")
          .get("pair-agent-run-evidence");
        expect(gate).toMatchObject({
          gate_id: "pair-agent-run-evidence",
          status: "planned",
          evidence_path: ".helix/evidence/pair-agent/20260701034500-PLAN-L7-177.json",
        });
        const guardrail = db
          .prepare(
            "SELECT guardrail, decision, mode, human_signoff_required FROM guardrail_decisions WHERE session_id = ?",
          )
          .get("pair-agent:PLAN-L7-177:20260701034500");
        expect(guardrail).toMatchObject({
          guardrail: "frontier-approval",
          decision: "allow",
          mode: "pair-agent",
          human_signoff_required: 0,
        });
        const signals = db
          .prepare(
            "SELECT metric, value, status FROM quality_signals WHERE source = ? AND subject_id = ? ORDER BY metric",
          )
          .all("pair-agent-loop-summary", "pair-agent:PLAN-L7-177:20260701034500");
        expect(signals).toEqual([
          expect.objectContaining({ metric: "consultation_count", value: 1, status: "warn" }),
          expect.objectContaining({ metric: "failed_review_count", value: 1, status: "warn" }),
          expect.objectContaining({ metric: "fix_cycle_count", value: 1, status: "pass" }),
          expect.objectContaining({
            metric: "light_implementation_count",
            value: 2,
            status: "pass",
          }),
          expect.objectContaining({
            metric: "pending_consultation_count",
            value: 1,
            status: "warn",
          }),
          expect.objectContaining({ metric: "phase_count", value: 5, status: "pass" }),
          expect.objectContaining({ metric: "smart_review_count", value: 2, status: "pass" }),
          expect.objectContaining({
            metric: "smart_test_author_count",
            value: 1,
            status: "pass",
          }),
        ]);
      } finally {
        db.close();
      }
    } finally {
      rmSync(repoRoot, { recursive: true, force: true });
    }
  });

  it("blocks pair-agent run evidence whose phase spans violate the smart-light-review order", () => {
    const repoRoot = join(tmpdir(), `helix-pair-agent-order-${randomUUID()}`);
    try {
      mkdirSync(join(repoRoot, "docs", "plans"), { recursive: true });
      mkdirSync(join(repoRoot, ".helix", "evidence", "pair-agent"), { recursive: true });
      writeFileSync(
        join(repoRoot, "docs", "plans", "PLAN-L7-177-helix-orchestration-runtime-bridge.md"),
        [
          "---",
          "plan_id: PLAN-L7-177-helix-orchestration-runtime-bridge",
          "title: pair-agent evidence order fixture",
          "kind: add-impl",
          "layer: L7",
          "drive: agent",
          "status: confirmed",
          "created: 2026-07-01",
          "updated: 2026-07-01",
          "---",
          "",
          "# Fixture",
        ].join("\n"),
      );
      writeFileSync(
        join(repoRoot, ".helix", "evidence", "pair-agent", "20260701034600-PLAN-L7-177.json"),
        `${JSON.stringify(
          {
            schema_version: "pair-agent-run-evidence.v1",
            recorded_at: "2026-07-01T03:46:00.000Z",
            run_id: "pair-agent:PLAN-L7-177:20260701034600",
            mode: "hybrid",
            execute: true,
            trace: {
              plan_id: "PLAN-L7-177-helix-orchestration-runtime-bridge",
              span_id: "pair-agent:PLAN-L7-177:20260701034600:run",
              tool_contract_id: "HC-P2.runPairAgentTddPlan",
              guardrail_decision: {
                guardrail: "frontier-approval",
                decision: "allow",
                human_signoff_required: false,
              },
              eval_outcome: { ok: true, status: "passed", final_verdict: "pass" },
              completed_at: "2026-07-01T03:46:00.000Z",
              phase_spans: [
                {
                  span_id: "pair-agent:PLAN-L7-177:20260701034600:phase:1",
                  phase: "light_implementation",
                  cycle: 1,
                  agent_key: "light-implementation-agent",
                  provider: "codex",
                  model: "gpt-5.3-codex-spark",
                  eval_outcome: { status: "passed", verdict: null, exit_code: 0 },
                },
                {
                  span_id: "pair-agent:PLAN-L7-177:20260701034600:phase:2",
                  phase: "smart_review",
                  cycle: 1,
                  agent_key: "smart-review-agent",
                  provider: "claude",
                  model: "claude-opus-4-8",
                  eval_outcome: { status: "passed", verdict: "pass", exit_code: 0 },
                },
              ],
            },
          },
          null,
          2,
        )}\n`,
      );

      const db = openHarnessDb(":memory:", { repoRoot });
      try {
        const result = rebuildHarnessDb({
          repoRoot,
          db,
          relationGraph: { nodes: [], edges: [], verificationProfiles: [], findings: [] },
          documentExports: {
            document_export_runs: [],
            document_export_datasets: [],
            document_export_artifacts: [],
            findings: [],
            actionsTaken: [],
            ok: true,
          },
          verificationEvidence: {
            verification_profiles: [],
            verification_recommendations: [],
            mcp_server_runs: [],
            external_tool_findings: [],
            findings: [],
            ok: true,
          },
        });

        expect(result.ok).toBe(true);
        const gate = db
          .prepare("SELECT gate_id, status, evidence_path FROM gate_runs WHERE gate_id = ?")
          .get("pair-agent-run-evidence");
        expect(gate).toMatchObject({
          gate_id: "pair-agent-run-evidence",
          status: "blocked",
          evidence_path: ".helix/evidence/pair-agent/20260701034600-PLAN-L7-177.json",
        });
        const finding = db
          .prepare("SELECT kind, source, status FROM findings WHERE kind = ?")
          .get("pair-agent-evidence-phase-order-invalid");
        expect(finding).toMatchObject({
          kind: "pair-agent-evidence-phase-order-invalid",
          source: "pair-agent-evidence",
          status: "open",
        });
      } finally {
        db.close();
      }
    } finally {
      rmSync(repoRoot, { recursive: true, force: true });
    }
  });

  it("blocks pair-agent run evidence that records light-agent closing authority findings", () => {
    const repoRoot = join(tmpdir(), `helix-pair-agent-closure-${randomUUID()}`);
    try {
      mkdirSync(join(repoRoot, "docs", "plans"), { recursive: true });
      mkdirSync(join(repoRoot, ".helix", "evidence", "pair-agent"), { recursive: true });
      writeFileSync(
        join(repoRoot, "docs", "plans", "PLAN-L7-177-helix-orchestration-runtime-bridge.md"),
        [
          "---",
          "plan_id: PLAN-L7-177-helix-orchestration-runtime-bridge",
          "title: pair-agent light closure fixture",
          "kind: add-impl",
          "layer: L7",
          "drive: agent",
          "status: confirmed",
          "created: 2026-07-01",
          "updated: 2026-07-01",
          "---",
          "",
          "# Fixture",
        ].join("\n"),
      );
      writeFileSync(
        join(repoRoot, ".helix", "evidence", "pair-agent", "20260701034700-PLAN-L7-177.json"),
        `${JSON.stringify(
          {
            schema_version: "pair-agent-run-evidence.v1",
            recorded_at: "2026-07-01T03:47:00.000Z",
            run_id: "pair-agent:PLAN-L7-177:20260701034700",
            mode: "hybrid",
            execute: true,
            trace: {
              plan_id: "PLAN-L7-177-helix-orchestration-runtime-bridge",
              span_id: "pair-agent:PLAN-L7-177:20260701034700:run",
              tool_contract_id: "HC-P2.runPairAgentTddPlan",
              guardrail_decision: {
                guardrail: "frontier-approval",
                decision: "allow",
                human_signoff_required: false,
              },
              eval_outcome: { ok: true, status: "passed", final_verdict: "pass" },
              completed_at: "2026-07-01T03:47:00.000Z",
              phase_spans: [
                {
                  span_id: "pair-agent:PLAN-L7-177:20260701034700:phase:1",
                  phase: "smart_test_author",
                  cycle: 0,
                  agent_key: "smart-review-agent",
                  provider: "claude",
                  model: "claude-opus-4-8",
                  eval_outcome: { status: "passed", verdict: null, exit_code: 0 },
                },
                {
                  span_id: "pair-agent:PLAN-L7-177:20260701034700:phase:2",
                  phase: "light_implementation",
                  cycle: 1,
                  agent_key: "light-implementation-agent",
                  provider: "codex",
                  model: "gpt-5.3-codex-spark",
                  output_excerpt_digest:
                    "sha256:8d3dd8e8b0de3f1c0914c5ad5f4d3173e3f734ca5c78406c70fdcb1f0174b80c",
                  eval_outcome: { status: "passed", verdict: null, exit_code: 0 },
                },
                {
                  span_id: "pair-agent:PLAN-L7-177:20260701034700:phase:3",
                  phase: "smart_review",
                  cycle: 1,
                  agent_key: "smart-review-agent",
                  provider: "claude",
                  model: "claude-opus-4-8",
                  output_excerpt_digest:
                    "sha256:44e818f6f322e38cc5d6ceb76d2bfafc16c9de5e68fd033777d7f3255d76aa6d",
                  eval_outcome: { status: "passed", verdict: "pass", exit_code: 0 },
                },
              ],
            },
            result: {
              findings: [
                {
                  code: "light-agent-closure-claim",
                  severity: "error",
                  message:
                    "pair-agent phase light_implementation did not emit the required TDD evidence markers",
                },
              ],
            },
          },
          null,
          2,
        )}\n`,
      );

      const db = openHarnessDb(":memory:", { repoRoot });
      try {
        const result = rebuildHarnessDb({
          repoRoot,
          db,
          relationGraph: { nodes: [], edges: [], verificationProfiles: [], findings: [] },
          documentExports: {
            document_export_runs: [],
            document_export_datasets: [],
            document_export_artifacts: [],
            findings: [],
            actionsTaken: [],
            ok: true,
          },
          verificationEvidence: {
            verification_profiles: [],
            verification_recommendations: [],
            mcp_server_runs: [],
            external_tool_findings: [],
            findings: [],
            ok: true,
          },
        });

        expect(result.ok).toBe(true);
        const gate = db
          .prepare("SELECT gate_id, status, evidence_path FROM gate_runs WHERE gate_id = ?")
          .get("pair-agent-run-evidence");
        expect(gate).toMatchObject({
          gate_id: "pair-agent-run-evidence",
          status: "blocked",
          evidence_path: ".helix/evidence/pair-agent/20260701034700-PLAN-L7-177.json",
        });
        const finding = db
          .prepare("SELECT kind, severity, source, status FROM findings WHERE kind = ?")
          .get("pair-agent-evidence-light-agent-closure-claim");
        expect(finding).toMatchObject({
          kind: "pair-agent-evidence-light-agent-closure-claim",
          severity: "error",
          source: "pair-agent-evidence",
          status: "open",
        });
      } finally {
        db.close();
      }
    } finally {
      rmSync(repoRoot, { recursive: true, force: true });
    }
  });

  it("projects pair-agent plan evidence into model and gate rows", () => {
    const repoRoot = join(tmpdir(), `helix-pair-agent-plan-projection-${randomUUID()}`);
    try {
      mkdirSync(join(repoRoot, "docs", "plans"), { recursive: true });
      mkdirSync(join(repoRoot, ".helix", "evidence", "pair-agent"), { recursive: true });
      writeFileSync(
        join(repoRoot, "docs", "plans", "PLAN-L7-222-pair-agent-plan-evidence.md"),
        [
          "---",
          "plan_id: PLAN-L7-222-pair-agent-plan-evidence",
          "title: pair-agent plan evidence projection fixture",
          "kind: add-impl",
          "layer: L7",
          "drive: agent",
          "status: confirmed",
          "created: 2026-07-01",
          "updated: 2026-07-01",
          "---",
          "",
          "# Fixture",
        ].join("\n"),
      );
      writeFileSync(
        join(repoRoot, ".helix", "evidence", "pair-agent", "20260701101500-PLAN-L7-222-plan.json"),
        `${JSON.stringify(
          {
            schema_version: "pair-agent-plan-evidence.v1",
            recorded_at: "2026-07-01T10:15:00.000Z",
            plan_id: "PLAN-L7-222-pair-agent-plan-evidence",
            mode: "hybrid",
            execute: false,
            trace: {
              plan_id: "PLAN-L7-222-pair-agent-plan-evidence",
              span_id: "pair-agent-plan:PLAN-L7-222:20260701101500",
              tool_contract_id: "HC-P2.buildPairAgentTddPlan",
              guardrail_decision: {
                guardrail: "frontier-approval",
                decision: "allow",
                human_signoff_required: false,
              },
              eval_outcome: { ok: true, status: "planned" },
              adapter_plans_digest:
                "sha256:8bc5e9d5861f3e9f578bb07a6646fa2b617b7727d69ec2e043e6cc78ea58b6bb",
              phase_spans: [
                {
                  span_id: "pair-agent-plan:PLAN-L7-222:20260701101500:phase:1",
                  phase: "smart_test_author",
                  agent_key: "smart-review-agent",
                  provider: "claude",
                  model: "claude-opus-4-8",
                  required_evidence: ["red_evidence"],
                  prompt_digest:
                    "sha256:e268a46d951dd4cb3138839c530485b46c55c0d264067f2f507382b217c22814",
                },
                {
                  span_id: "pair-agent-plan:PLAN-L7-222:20260701101500:phase:2",
                  phase: "light_implementation",
                  agent_key: "light-implementation-agent",
                  provider: "codex",
                  model: "gpt-5.3-codex-spark",
                  required_evidence: ["changed_files"],
                  prompt_digest:
                    "sha256:bd5ee750a5774915f7792f959611653a43b454ebd0c456528506f55f9e70ecfd",
                },
              ],
            },
          },
          null,
          2,
        )}\n`,
      );

      const db = openHarnessDb(":memory:", { repoRoot });
      try {
        const result = rebuildHarnessDb({
          repoRoot,
          db,
          relationGraph: { nodes: [], edges: [], verificationProfiles: [], findings: [] },
          documentExports: {
            document_export_runs: [],
            document_export_datasets: [],
            document_export_artifacts: [],
            findings: [],
            actionsTaken: [],
            ok: true,
          },
          verificationEvidence: {
            verification_profiles: [],
            verification_recommendations: [],
            mcp_server_runs: [],
            external_tool_findings: [],
            findings: [],
            ok: true,
          },
        });

        expect(result.ok).toBe(true);
        const gate = db
          .prepare("SELECT gate_id, status, evidence_path FROM gate_runs WHERE gate_id = ?")
          .get("pair-agent-plan-evidence");
        expect(gate).toMatchObject({
          gate_id: "pair-agent-plan-evidence",
          status: "planned",
          evidence_path: ".helix/evidence/pair-agent/20260701101500-PLAN-L7-222-plan.json",
        });
        const modelRuns = db
          .prepare(
            "SELECT runtime, role, drive, plan_id FROM model_runs WHERE evidence_path = ? ORDER BY run_id",
          )
          .all(".helix/evidence/pair-agent/20260701101500-PLAN-L7-222-plan.json");
        expect(modelRuns).toEqual([
          expect.objectContaining({
            runtime: "claude",
            role: "smart-review-agent",
            drive: "agent",
            plan_id: "PLAN-L7-222-pair-agent-plan-evidence",
          }),
          expect.objectContaining({
            runtime: "codex",
            role: "light-implementation-agent",
            drive: "agent",
            plan_id: "PLAN-L7-222-pair-agent-plan-evidence",
          }),
        ]);
      } finally {
        db.close();
      }
    } finally {
      rmSync(repoRoot, { recursive: true, force: true });
    }
  });

  it("projects artifact progress rows as yellow until linked tests have passing runs", () => {
    const db = openHarnessDb(":memory:");
    try {
      const result = rebuildHarnessDb({
        repoRoot: process.cwd(),
        db,
        relationGraph: {
          nodes: [
            { id: "source:src/covered.ts", kind: "source", path: "src/covered.ts" },
            { id: "source:src/new-file.ts", kind: "source", path: "src/new-file.ts" },
            { id: "test:tests/covered.test.ts", kind: "test", path: "tests/covered.test.ts" },
          ],
          edges: [
            {
              from: "source:src/covered.ts",
              to: "test:tests/covered.test.ts",
              kind: "covered-by",
            },
          ],
          verificationProfiles: [],
          findings: [],
        },
      });

      expect(result.ok).toBe(true);
      const covered = db
        .prepare(
          "SELECT color, state, linked_test_count, dependency_checked FROM artifact_progress WHERE artifact_path = ?",
        )
        .get("src/covered.ts") as
        | { color: string; state: string; linked_test_count: number; dependency_checked: number }
        | undefined;
      const newFile = db
        .prepare(
          "SELECT color, state, linked_test_count, dependency_checked FROM artifact_progress WHERE artifact_path = ?",
        )
        .get("src/new-file.ts") as
        | { color: string; state: string; linked_test_count: number; dependency_checked: number }
        | undefined;

      expect(covered).toMatchObject({
        color: "yellow",
        state: "implemented_unverified",
        linked_test_count: 1,
        dependency_checked: 1,
      });
      expect(newFile).toMatchObject({
        color: "yellow",
        state: "implemented_unverified",
        linked_test_count: 0,
        dependency_checked: 1,
      });
      const event = db
        .prepare(
          "SELECT color, state, dependency_check_run_id FROM artifact_progress_events WHERE artifact_path = ?",
        )
        .get("src/covered.ts");
      expect(event).toMatchObject({
        color: "yellow",
        state: "implemented_unverified",
      });
      expect(String(event?.dependency_check_run_id ?? "")).not.toHaveLength(0);
      const feedback = db
        .prepare(
          "SELECT source_table, source_id, source_color, signal_type FROM feedback_events WHERE source_table = ? AND source_id = ?",
        )
        .get("artifact_progress", "src/covered.ts");
      expect(feedback).toMatchObject({
        source_table: "artifact_progress",
        source_id: "src/covered.ts",
        source_color: "yellow",
        signal_type: "artifact_progress_yellow",
      });
    } finally {
      db.close();
    }
  });

  it("IMP-140: projects 15 screens and FR/BR→screen trace from doc source on rebuild", () => {
    const db = openHarnessDb(":memory:");
    try {
      const result = rebuildHarnessDb({ repoRoot: process.cwd(), db });
      expect(result.ok).toBe(true);

      // 15 screens (PM 6 + HM 8 + GD 1) projected from screen-list.md §1.
      const screenCount = (db.prepare("SELECT COUNT(*) AS n FROM screens").get() as { n: number })
        .n;
      expect(screenCount).toBe(15);

      // PM-06 設計書ビューア with its project-scoped URL. implemented=0: screen-list.md
      // declares implemented_screens="" (全 15 画面 not-implemented) until L10 High-Fi/UX →
      // 設計適合実装。premature flip は screen-impl-pair-freeze gate が fail-close で担保する。
      const pm06 = db
        .prepare("SELECT category, url, implemented FROM screens WHERE screen_id = ?")
        .get("PM-06") as { category: string; url: string; implemented: number } | undefined;
      expect(pm06?.category).toBe("PM");
      expect(pm06?.url).toBe("/project/:case/designs");
      expect(pm06?.implemented).toBe(0);

      // FR/BR→screen trace edges (screen-requirements §5.5) make 機能一覧→画面要求 DB-queryable.
      const traceCount = (
        db.prepare("SELECT COUNT(*) AS n FROM screen_trace").get() as { n: number }
      ).n;
      expect(traceCount).toBeGreaterThan(0);
      const hm01Frs = db
        .prepare(
          "SELECT requirement_id FROM screen_trace WHERE screen_id = ? AND requirement_kind = 'fr' ORDER BY requirement_id",
        )
        .all("HM-01") as { requirement_id: string }[];
      expect(hm01Frs.map((row) => row.requirement_id)).toContain("FR-L1-33");

      // No orphan trace: every screen_trace.screen_id resolves to a screens row.
      const orphan = (
        db
          .prepare(
            "SELECT COUNT(*) AS n FROM screen_trace t LEFT JOIN screens s ON s.screen_id = t.screen_id WHERE s.screen_id IS NULL",
          )
          .get() as { n: number }
      ).n;
      expect(orphan).toBe(0);
    } finally {
      db.close();
    }
  });

  it("U-ROUTEMODE-001: rebuildHarnessDb deterministically projects plans, route_modes, and Phase3 outputs without source mutation", () => {
    const db = openHarnessDb(":memory:");
    try {
      const result = rebuildHarnessDb({
        repoRoot: process.cwd(),
        db,
        relationGraph: {
          nodes: [
            {
              id: "plan:PLAN-L7-46-projection-writer",
              kind: "plan",
              path: "docs/plans/PLAN-L7-46-projection-writer.md",
            },
          ],
          edges: [],
          verificationProfiles: [],
          findings: [],
        },
        documentExports: {
          document_export_runs: [
            {
              document_export_run_id: "export-1",
              source_snapshot_hash: "sha256:test",
              evidence_path: ".helix/evidence/export.json",
            },
          ],
          document_export_datasets: [
            {
              document_export_dataset_id: "dataset-1",
              document_export_run_id: "export-1",
              format: "markdown",
            },
          ],
          document_export_artifacts: [],
          findings: [],
          actionsTaken: [],
          ok: true,
        },
        verificationEvidence: {
          verification_profiles: [],
          verification_recommendations: [],
          mcp_server_runs: [],
          external_tool_findings: [],
          findings: [],
          ok: true,
        },
      });
      const second = rebuildHarnessDb({
        repoRoot: process.cwd(),
        db,
        relationGraph: result.inputs.relationGraph,
        documentExports: result.inputs.documentExports,
        verificationEvidence: result.inputs.verificationEvidence,
      });

      expect(result.ok).toBe(true);
      const { hook_events: _firstHookEvents, ...firstStableCounts } = result.rowCounts;
      const { hook_events: _secondHookEvents, ...secondStableCounts } = second.rowCounts;
      expect(secondStableCounts).toEqual(firstStableCounts);
      expect(rowCounts(db).plan_registry).toBeGreaterThan(0);
      const projectedPlan = db
        .prepare("SELECT source_hash FROM plan_registry WHERE source_hash <> '' LIMIT 1")
        .get() as { source_hash?: string } | undefined;
      expect(projectedPlan?.source_hash).toMatch(/^sha256:[a-f0-9]{64}$/);
      expect(rowCounts(db).graph_nodes).toBe(1);
      expect(rowCounts(db).document_export_runs).toBe(1);
      expect(rowCounts(db).roadmap_rollups).toBe(1);
      expect(rowCounts(db).roadmap_band_coverage).toBeGreaterThan(0);
      expect(rowCounts(db).roadmap_gate_progress).toBeGreaterThan(0);
      expect(rowCounts(db).review_evidence_registry).toBeGreaterThan(0);
      expect(rowCounts(db).descent_obligations).toBeGreaterThan(0);
      expect(rowCounts(db).drive_runs).toBeGreaterThan(0);
      expect(rowCounts(db).route_modes).toBeGreaterThan(0);
      const projectedDriveModels = db
        .prepare("SELECT DISTINCT mode FROM drive_runs WHERE mode <> '' ORDER BY mode")
        .all()
        .map((row) => String((row as { mode: unknown }).mode));
      expect(projectedDriveModels).toEqual(expect.arrayContaining(REQUIRED_DRIVE_MODELS));
      const projectedRouteModes = db
        .prepare("SELECT DISTINCT mode FROM route_modes WHERE mode <> '' ORDER BY mode")
        .all()
        .map((row) => String((row as { mode: unknown }).mode));
      expect(projectedRouteModes).toEqual(expect.arrayContaining(REQUIRED_DRIVE_MODELS));
      expect(
        db
          .prepare("SELECT mode FROM drive_runs WHERE plan_id = ? AND mode = ? LIMIT 1")
          .get("PLAN-L7-146-serverless-readonly-share", "version-up"),
      ).toMatchObject({ mode: "version-up" });
      expect(
        db
          .prepare(
            `SELECT r.mode, r.source
             FROM route_modes r
             JOIN drive_runs d ON d.drive_run_id = r.drive_run_id
             WHERE r.plan_id = ? AND r.mode = ? LIMIT 1`,
          )
          .get("PLAN-L7-146-serverless-readonly-share", "version-up"),
      ).toMatchObject({ mode: "version-up", source: expect.any(String) });
      expect(rowCounts(db).hook_events).toBeGreaterThan(0);
      expect(rowCounts(db).model_runs).toBeGreaterThan(0);
      expect(rowCounts(db).automation_assets).toBeGreaterThan(0);
      expect(rowCounts(db).skill_recommendations).toBeGreaterThan(0);
      expect(rowCounts(db).skill_invocations).toBeGreaterThan(0);
      expect(rowCounts(db).quality_signals).toBeGreaterThan(0);
      expect(rowCounts(db).feedback_events).toBeGreaterThan(0);
      expect(rowCounts(db).issue_queue).toBeGreaterThan(0);
      expect(rowCounts(db).trouble_events).toBeGreaterThanOrEqual(0);
      expect(rowCounts(db).improvement_log).toBeGreaterThan(0);

      const program = db
        .prepare("SELECT * FROM roadmap_rollups WHERE rollup_id = ?")
        .get("program");
      expect(program).toMatchObject({
        total_bands: 5,
        covered_bands: 5,
        parked_bands: 0,
        uncovered_bands: 0,
        total_gates: 23,
        reached_gates: 23,
      });

      const verificationBand = db
        .prepare("SELECT status, roadmap_ids FROM roadmap_band_coverage WHERE band_id = ?")
        .get("verification");
      expect(verificationBand).toMatchObject({ status: "covered" });
      expect(String(verificationBand?.roadmap_ids)).toContain("PLAN-M-00-verify-cutover");

      const cutoverBand = db
        .prepare("SELECT status, roadmap_ids FROM roadmap_band_coverage WHERE band_id = ?")
        .get("cutover");
      expect(cutoverBand).toMatchObject({ status: "covered" });
      expect(String(cutoverBand?.roadmap_ids)).toContain("PLAN-M-01-cutover-backfill");

      const cutoverGate = db
        .prepare(
          "SELECT reached, confirmed_spans, total_spans FROM roadmap_gate_progress WHERE plan_id = ? AND gate_id = ?",
        )
        .get("PLAN-M-01-cutover-backfill", "G-CUTOVER.B");
      expect(cutoverGate).toMatchObject({
        reached: 1,
        confirmed_spans: 1,
        total_spans: 1,
      });

      const reviewEvidence = db
        .prepare(
          "SELECT has_evidence, review_kind, verdict FROM review_evidence_registry WHERE plan_id = ?",
        )
        .get("PLAN-M-01-cutover-backfill");
      expect(reviewEvidence).toMatchObject({
        has_evidence: 1,
        review_kind: "intra_runtime_subagent",
        verdict: "pass",
      });

      const verificationRuns = db
        .prepare(
          `SELECT phase, ready_status, human_required
           FROM workflow_runs
           WHERE plan_id = ? AND workflow = ?
           ORDER BY CASE phase
             WHEN 'L8' THEN 8
             WHEN 'L9' THEN 9
             WHEN 'L10' THEN 10
             WHEN 'L11' THEN 11
             WHEN 'L12' THEN 12
             WHEN 'L13' THEN 13
             WHEN 'L14' THEN 14
             ELSE 99
           END`,
        )
        .all(
          "PLAN-M-00-verify-cutover",
          "L8-L14-verification-band",
        ) as unknown as VerificationWorkflowRow[];
      expect(verificationRuns).toHaveLength(7);
      expect(verificationRuns.map((row) => row.phase)).toEqual([
        "L8",
        "L9",
        "L10",
        "L11",
        "L12",
        "L13",
        "L14",
      ]);
      expect(verificationRuns.every((row) => row.ready_status === "passed_local")).toBe(true);
      expect(
        verificationRuns
          .filter((row) => row.phase === "L12" || row.phase === "L13")
          .every((row) => row.human_required === 1),
      ).toBe(true);

      const verificationDriveJoin = db
        .prepare(
          `SELECT d.plan_id, d.mode, d.status
           FROM workflow_runs w
           JOIN drive_runs d ON d.drive_run_id = w.drive_run_id
           WHERE w.plan_id = ? AND w.phase = ?`,
        )
        .get("PLAN-M-00-verify-cutover", "L8") as DriveRunRow | undefined;
      expect(verificationDriveJoin).toMatchObject({
        plan_id: "PLAN-M-00-verify-cutover",
        mode: "Verification",
      });

      const hookJoin = db
        .prepare(
          `SELECT COUNT(*) AS value
           FROM hook_events h
           JOIN plan_registry p ON p.plan_id = h.plan_id`,
        )
        .get() as { value: number };
      expect(hookJoin.value).toBeGreaterThan(0);

      const modelJoin = db
        .prepare(
          `SELECT COUNT(*) AS value
           FROM model_runs m
           JOIN plan_registry p ON p.plan_id = m.plan_id`,
        )
        .get() as { value: number };
      expect(modelJoin.value).toBeGreaterThan(0);

      const verificationGates = db
        .prepare(
          "SELECT gate_id, status, evidence_path FROM gate_runs WHERE plan_id = ? AND gate_id LIKE ? ORDER BY gate_id",
        )
        .all("PLAN-M-00-verify-cutover", "G-VERIFY.L%") as unknown as VerificationGateRow[];
      expect(verificationGates).toHaveLength(7);
      expect(verificationGates.every((row) => row.status === "passed")).toBe(true);
      expect(
        verificationGates.every((row) =>
          String(row.evidence_path).includes("A-132-l8-l14-verification-band-execution.md"),
        ),
      ).toBe(true);

      const coverage = db
        .prepare(
          "SELECT value, threshold, status FROM coverage WHERE scope = ? AND subject_id = ? AND metric = ?",
        )
        .get("verification-band", "program", "covered_program_bands");
      expect(coverage).toMatchObject({
        value: 5,
        threshold: 5,
        status: "passed",
      });

      const skillRecommendation = db
        .prepare(
          "SELECT skill_id, reason FROM skill_recommendations WHERE plan_id = ? ORDER BY rank LIMIT 1",
        )
        .get("PLAN-M-01-cutover-backfill");
      expect(skillRecommendation).toMatchObject({ skill_id: "skill:review-checklist" });
      expect(String(skillRecommendation?.reason)).toContain("layer=");

      const skillInvocation = db
        .prepare(
          "SELECT skill_id, source, accepted FROM skill_invocations WHERE plan_id = ? AND skill_id = ?",
        )
        .get("PLAN-M-01-cutover-backfill", "skill:review-checklist");
      expect(skillInvocation).toMatchObject({
        skill_id: "skill:review-checklist",
        source: "auto-projection:review-evidence",
        accepted: 1,
      });

      const driveMetric = db
        .prepare("SELECT metric, status FROM quality_signals WHERE metric = ? LIMIT 1")
        .get("drive_firing_rate");
      expect(driveMetric).toMatchObject({ metric: "drive_firing_rate" });

      const feedbackEvent = db
        .prepare("SELECT signal_type, next_action FROM feedback_events ORDER BY created_at LIMIT 1")
        .get();
      expect(String(feedbackEvent?.signal_type ?? "")).not.toHaveLength(0);
      expect(String(feedbackEvent?.next_action ?? "")).toContain("review");

      const issueQueue = db
        .prepare(
          "SELECT target, status, human_approval_required, external_issue_url FROM issue_queue ORDER BY created_at LIMIT 1",
        )
        .get();
      expect(issueQueue).toMatchObject({
        target: "github",
        status: "queued_dry_run",
        human_approval_required: 1,
        external_issue_url: "",
      });

      const approvalGuardrail = db
        .prepare(
          "SELECT guardrail, decision, human_signoff_required FROM guardrail_decisions WHERE guardrail = ? LIMIT 1",
        )
        .get("external-github-issue-approval");
      expect(approvalGuardrail).toMatchObject({
        guardrail: "external-github-issue-approval",
        decision: "requires-human-approval",
        human_signoff_required: 1,
      });

      const troubleCount = db.prepare("SELECT COUNT(*) AS value FROM trouble_events").get();
      expect(Number(troubleCount?.value ?? 0)).toBeGreaterThanOrEqual(0);

      const improvementLog = db
        .prepare(
          "SELECT category, status, next_action FROM improvement_log ORDER BY created_at LIMIT 1",
        )
        .get();
      expect(String(improvementLog?.next_action ?? "")).toContain("review");
      expect(improvementLog).toMatchObject({ status: "open" });
    } finally {
      db.close();
    }
  });

  it("normalizes inline comments from decision_outcome before PoC projection", () => {
    const repoRoot = join(tmpdir(), `helix-poc-decision-comment-${randomUUID()}`);
    try {
      mkdirSync(join(repoRoot, "docs", "plans"), { recursive: true });
      writeFileSync(
        join(repoRoot, "docs", "plans", "PLAN-DISCOVERY-COMMENT.md"),
        [
          "---",
          "plan_id: PLAN-DISCOVERY-COMMENT",
          "kind: poc",
          "layer: cross",
          'drive: "agent # harness"',
          "status: confirmed",
          "workflow_phase: S4",
          "decision_outcome: confirmed # PO accepted the verified PoC",
          "updated: 2026-07-01",
          "---",
          "",
          "# Commented decision outcome fixture",
        ].join("\n"),
      );

      const db = openHarnessDb(":memory:", { repoRoot });
      try {
        const result = rebuildHarnessDb({
          repoRoot,
          db,
          relationGraph: { nodes: [], edges: [], verificationProfiles: [], findings: [] },
          documentExports: {
            document_export_runs: [],
            document_export_datasets: [],
            document_export_artifacts: [],
            findings: [],
            actionsTaken: [],
            ok: true,
          },
          verificationEvidence: {
            verification_profiles: [],
            verification_recommendations: [],
            mcp_server_runs: [],
            external_tool_findings: [],
            findings: [],
            ok: true,
          },
        });

        expect(result.ok).toBe(true);
        const projectedPlan = db
          .prepare(
            "SELECT drive, decision_outcome FROM plan_registry WHERE plan_id = 'PLAN-DISCOVERY-COMMENT'",
          )
          .get() as { drive?: string; decision_outcome?: string } | undefined;
        expect(projectedPlan?.drive).toBe("agent # harness");
        expect(projectedPlan?.decision_outcome).toBe("confirmed");

        const evaluation = db
          .prepare("SELECT confirmed_count, total_count FROM poc_evaluations LIMIT 1")
          .get() as { confirmed_count?: number; total_count?: number } | undefined;
        expect(Number(evaluation?.confirmed_count)).toBe(1);
        expect(Number(evaluation?.total_count)).toBe(1);
      } finally {
        db.close();
      }
    } finally {
      rmSync(repoRoot, { recursive: true, force: true });
    }
  });

  it("projects skill_injection session-log events as runtime skill invocations", () => {
    const repoRoot = join(tmpdir(), `helix-skill-injection-projection-${randomUUID()}`);
    try {
      mkdirSync(join(repoRoot, "docs", "plans"), { recursive: true });
      mkdirSync(join(repoRoot, ".helix", "logs", "session"), { recursive: true });
      writeFileSync(
        join(repoRoot, "docs", "plans", "PLAN-L7-SKILL-RUNTIME.md"),
        [
          "---",
          "plan_id: PLAN-L7-SKILL-RUNTIME",
          "kind: impl",
          "layer: L7",
          "drive: agent",
          "status: confirmed",
          "updated: 2026-07-05",
          "---",
          "",
          "# Runtime skill projection fixture",
        ].join("\n"),
      );
      writeFileSync(
        join(repoRoot, ".helix", "logs", "session", "runtime-skill.jsonl"),
        [
          JSON.stringify({
            ts: "2026-07-05T01:00:00.000Z",
            session_id: "runtime-skill",
            plan_id: "PLAN-L7-SKILL-RUNTIME",
            event_type: "skill_injection",
            target: "skill_injection:injected required=1 optional=0 missing=0",
            outcome: "ok",
          }),
          JSON.stringify({
            ts: "2026-07-05T01:01:00.000Z",
            session_id: "runtime-skill",
            plan_id: "PLAN-L7-SKILL-RUNTIME",
            event_type: "skill_injection",
            target: "skill_injection:failed required=0 optional=0 missing=0",
            outcome: "error",
          }),
          JSON.stringify({
            ts: "2026-07-05T01:02:00.000Z",
            session_id: "runtime-skill",
            plan_id: "PLAN-L7-SKILL-RUNTIME",
            event_type: "tool_use",
            tool_name: "Bash",
            target: "git status --short",
            outcome: "ok",
          }),
          "",
        ].join("\n"),
      );

      const db = openHarnessDb(":memory:", { repoRoot });
      try {
        const result = rebuildHarnessDb({
          repoRoot,
          db,
          relationGraph: { nodes: [], edges: [], verificationProfiles: [], findings: [] },
          documentExports: {
            document_export_runs: [],
            document_export_datasets: [],
            document_export_artifacts: [],
            findings: [],
            actionsTaken: [],
            ok: true,
          },
          verificationEvidence: {
            verification_profiles: [],
            verification_recommendations: [],
            mcp_server_runs: [],
            external_tool_findings: [],
            findings: [],
            ok: true,
          },
        });

        expect(result.ok).toBe(true);
        const rows = db
          .prepare(
            "SELECT session_id, plan_id, skill_id, layer, drive, fired_at, source, accepted FROM skill_invocations WHERE source = ? ORDER BY fired_at",
          )
          .all("session-log:skill-injection") as Array<Record<string, unknown>>;
        expect(rows).toEqual([
          expect.objectContaining({
            session_id: "runtime-skill",
            plan_id: "PLAN-L7-SKILL-RUNTIME",
            skill_id: "skill:runtime-context-injection",
            layer: "L7",
            drive: "agent",
            fired_at: "2026-07-05T01:00:00.000Z",
            accepted: 1,
          }),
          expect.objectContaining({
            session_id: "runtime-skill",
            plan_id: "PLAN-L7-SKILL-RUNTIME",
            skill_id: "skill:runtime-context-injection",
            fired_at: "2026-07-05T01:01:00.000Z",
            accepted: 0,
          }),
        ]);
        expect(rowCounts(db).test_runs ?? 0).toBe(0);
      } finally {
        db.close();
      }
    } finally {
      rmSync(repoRoot, { recursive: true, force: true });
    }
  });

  it("projects runtime session verification, forced-stop, and skill suggest events with provenance", () => {
    const repoRoot = join(tmpdir(), `helix-runtime-provenance-${randomUUID()}`);
    try {
      mkdirSync(join(repoRoot, "docs", "plans"), { recursive: true });
      mkdirSync(join(repoRoot, ".helix", "logs", "session"), { recursive: true });
      writeFileSync(
        join(repoRoot, "docs", "plans", "PLAN-L7-RUNTIME-PROV.md"),
        [
          "---",
          "plan_id: PLAN-L7-RUNTIME-PROV",
          "kind: impl",
          "layer: L7",
          "drive: agent",
          "status: confirmed",
          "updated: 2026-07-05",
          "---",
          "",
          "# Runtime provenance fixture",
        ].join("\n"),
      );
      writeFileSync(
        join(repoRoot, ".helix", "logs", "session", "runtime-provenance.jsonl"),
        [
          JSON.stringify({
            ts: "2026-07-05T02:00:00.000Z",
            session_id: "runtime-provenance",
            plan_id: "PLAN-L7-RUNTIME-PROV",
            event_type: "tool_use",
            tool_name: "Bash",
            target: "bun test tests/projection-writer.test.ts",
            outcome: "ok",
          }),
          JSON.stringify({
            ts: "2026-07-05T02:01:00.000Z",
            session_id: "runtime-provenance",
            plan_id: "PLAN-L7-RUNTIME-PROV",
            event_type: "tool_use",
            tool_name: "Bash",
            target: "git status --short",
            outcome: "ok",
          }),
          JSON.stringify({
            ts: "2026-07-05T02:02:00.000Z",
            session_id: "runtime-provenance",
            plan_id: "PLAN-L7-RUNTIME-PROV",
            event_type: "forced_stop",
            outcome: "blocked",
          }),
          JSON.stringify({
            ts: "2026-07-05T02:03:00.000Z",
            session_id: "runtime-provenance",
            plan_id: "PLAN-L7-RUNTIME-PROV",
            event_type: "tool_use",
            tool_name: "Bash",
            target: "helix skill suggest --plan docs/plans/PLAN-L7-RUNTIME-PROV.md",
            outcome: "ok",
          }),
          "",
        ].join("\n"),
      );

      const db = openHarnessDb(":memory:", { repoRoot });
      try {
        const result = rebuildHarnessDb({
          repoRoot,
          db,
          relationGraph: { nodes: [], edges: [], verificationProfiles: [], findings: [] },
          documentExports: {
            document_export_runs: [],
            document_export_datasets: [],
            document_export_artifacts: [],
            findings: [],
            actionsTaken: [],
            ok: true,
          },
          verificationEvidence: {
            verification_profiles: [],
            verification_recommendations: [],
            mcp_server_runs: [],
            external_tool_findings: [],
            findings: [],
            ok: true,
          },
        });

        expect(result.ok).toBe(true);
        const testRuns = db
          .prepare(
            "SELECT session_id, plan_id, command, runtime, scope, evidence_path, status FROM test_runs WHERE runtime = ?",
          )
          .all("hook-session-log") as Array<Record<string, unknown>>;
        expect(testRuns).toEqual([
          expect.objectContaining({
            session_id: "runtime-provenance",
            plan_id: "PLAN-L7-RUNTIME-PROV",
            command: "bun test tests/projection-writer.test.ts",
            scope: "runtime-hook",
            evidence_path: ".helix/logs/session/runtime-provenance.jsonl",
            status: "passed",
          }),
        ]);

        const guardrails = db
          .prepare(
            "SELECT session_id, plan_id, guardrail, decision, mode, evidence_path FROM guardrail_decisions WHERE mode = ?",
          )
          .all("runtime-hook") as Array<Record<string, unknown>>;
        expect(guardrails).toEqual([
          expect.objectContaining({
            session_id: "runtime-provenance",
            plan_id: "PLAN-L7-RUNTIME-PROV",
            guardrail: "forced-stop",
            decision: "block",
            evidence_path: ".helix/logs/session/runtime-provenance.jsonl",
          }),
        ]);

        const skillInvocations = db
          .prepare(
            "SELECT session_id, plan_id, skill_id, layer, drive, source, accepted FROM skill_invocations WHERE source = ?",
          )
          .all("runtime-hook:skill-suggest") as Array<Record<string, unknown>>;
        expect(skillInvocations).toEqual([
          expect.objectContaining({
            session_id: "runtime-provenance",
            plan_id: "PLAN-L7-RUNTIME-PROV",
            skill_id: "skill:suggest",
            layer: "L7",
            drive: "agent",
            accepted: 1,
          }),
        ]);
      } finally {
        db.close();
      }
    } finally {
      rmSync(repoRoot, { recursive: true, force: true });
    }
  });

  it("projects loop iteration JSONL rows and records malformed rows as findings", () => {
    const repoRoot = join(tmpdir(), `helix-loop-iterations-${randomUUID()}`);
    try {
      const loopDir = join(repoRoot, ".helix", "state", "loop");
      mkdirSync(join(repoRoot, "docs", "plans"), { recursive: true });
      mkdirSync(loopDir, { recursive: true });
      writeFileSync(
        join(loopDir, "PLAN-L7-304.iterations.jsonl"),
        [
          JSON.stringify({
            planId: "PLAN-L7-304",
            iteration: 1,
            workerProvider: "codex",
            verifierProvider: "claude",
            verdict: "pass",
            stopReason: "",
            blockedReason: "",
          }),
          "{invalid",
        ].join("\n"),
      );

      const db = openHarnessDb(":memory:", { repoRoot });
      try {
        const result = rebuildHarnessDb({
          repoRoot,
          db,
          relationGraph: { nodes: [], edges: [], verificationProfiles: [], findings: [] },
          documentExports: {
            document_export_runs: [],
            document_export_datasets: [],
            document_export_artifacts: [],
            findings: [],
            actionsTaken: [],
            ok: true,
          },
          verificationEvidence: {
            verification_profiles: [],
            verification_recommendations: [],
            mcp_server_runs: [],
            external_tool_findings: [],
            findings: [],
            ok: true,
          },
        });

        expect(result.ok).toBe(true);
        const row = db
          .prepare(
            "SELECT plan_id, iteration, worker_provider, verifier_provider, verdict, evidence_path FROM loop_iterations LIMIT 1",
          )
          .get();
        expect(row).toMatchObject({
          plan_id: "PLAN-L7-304",
          iteration: 1,
          worker_provider: "codex",
          verifier_provider: "claude",
          verdict: "pass",
          evidence_path: ".helix/state/loop/PLAN-L7-304.iterations.jsonl",
        });

        const finding = db
          .prepare("SELECT kind, source FROM findings WHERE kind = ? LIMIT 1")
          .get("loop-iteration-invalid");
        expect(finding).toMatchObject({
          kind: "loop-iteration-invalid",
          source: "loop-iterations",
        });
      } finally {
        db.close();
      }
    } finally {
      rmSync(repoRoot, { recursive: true, force: true });
    }
  });
});

describe("U-ORCH-007: loop_iterations projection (PLAN-L7-305)", () => {
  it("U-ORCH-007: projects loop iteration jsonl rows and downgrades broken lines to findings", () => {
    const repoRoot = join(tmpdir(), `helix-loop-projection-${randomUUID()}`);
    try {
      mkdirSync(join(repoRoot, "docs", "plans"), { recursive: true });
      mkdirSync(join(repoRoot, ".helix", "state", "loop"), { recursive: true });
      writeFileSync(
        join(repoRoot, ".helix", "state", "loop", "PLAN-L7-999.iterations.jsonl"),
        [
          JSON.stringify({
            planId: "PLAN-L7-999",
            iteration: 1,
            workerProvider: "codex",
            verifierProvider: "claude",
            verdict: "pass",
            stopReason: null,
            blockedReason: null,
            costUsd: 0.25,
            recordedAt: "2026-07-05T01:02:03.000Z",
          }),
          JSON.stringify({
            planId: "PLAN-L7-999",
            iteration: 2,
            workerProvider: "codex",
            verifierProvider: "codex",
            verdict: "pending",
            stopReason: null,
            blockedReason: "intra_runtime_fallback",
          }),
          "{ broken json line",
          "",
        ].join("\n"),
      );

      const db = openHarnessDb(":memory:", { repoRoot });
      try {
        const result = rebuildHarnessDb({
          repoRoot,
          db,
          relationGraph: { nodes: [], edges: [], verificationProfiles: [], findings: [] },
          documentExports: {
            document_export_runs: [],
            document_export_datasets: [],
            document_export_artifacts: [],
            findings: [],
            actionsTaken: [],
            ok: true,
          },
          verificationEvidence: {
            verification_profiles: [],
            verification_recommendations: [],
            mcp_server_runs: [],
            external_tool_findings: [],
            findings: [],
            ok: true,
          },
        });
        expect(result.ok).toBe(true);
        expect(result.rowCounts.loop_iterations).toBe(2);

        const rows = db
          .prepare(
            "SELECT plan_id, iteration, worker_provider, verifier_provider, verdict, blocked_reason, cost_usd, evidence_path, recorded_at FROM loop_iterations ORDER BY iteration",
          )
          .all() as Array<Record<string, unknown>>;
        expect(rows[0]).toMatchObject({
          plan_id: "PLAN-L7-999",
          iteration: 1,
          worker_provider: "codex",
          verifier_provider: "claude",
          verdict: "pass",
          blocked_reason: null,
          cost_usd: 0.25,
          evidence_path: ".helix/state/loop/PLAN-L7-999.iterations.jsonl",
          recorded_at: "2026-07-05T01:02:03.000Z",
        });
        expect(rows[1]).toMatchObject({
          iteration: 2,
          worker_provider: "codex",
          verifier_provider: "codex",
          blocked_reason: "intra_runtime_fallback",
          cost_usd: null,
          recorded_at: "",
        });

        const finding = db
          .prepare("SELECT kind, severity, subject_id FROM findings WHERE source = ?")
          .get("loop-iterations") as Record<string, unknown> | undefined;
        expect(finding).toMatchObject({
          kind: "loop-iteration-invalid",
          severity: "warn",
          subject_id: ".helix/state/loop/PLAN-L7-999.iterations.jsonl:3",
        });
      } finally {
        db.close();
      }
    } finally {
      rmSync(repoRoot, { recursive: true, force: true });
    }
  });
});

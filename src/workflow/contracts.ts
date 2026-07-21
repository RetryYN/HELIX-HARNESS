import { createHash } from "node:crypto";
import type { DeliveryRoute } from "../schema/index";
import type { HarnessDb } from "../state-db/index";
import { upsertRow } from "../state-db/index";
import { DRIVE_TDD_FITS, type DriveTddFit } from "./contracts-policy";
import type {
  CommandEvidence,
  ContractResult,
  Finding,
  ProjectionRef,
  Severity,
  TestCaseEvidence,
  TestRunEvidenceInput,
} from "./contracts-types";

export type { DriveTddFit, TddCompatibility } from "./contracts-policy";
export type {
  CommandEvidence,
  ContractResult,
  Finding,
  ProjectionRef,
  Severity,
  TestCaseEvidence,
  TestRunEvidenceInput,
} from "./contracts-types";

function finding(
  code: string,
  message: string,
  options: { evidencePath?: string; severity?: Severity } = {},
) {
  return {
    code,
    severity: options.severity ?? "error",
    evidence_path: options.evidencePath ?? "",
    message,
  } satisfies Finding;
}

function result(findings: Finding[], evidence_paths: string[] = []): ContractResult {
  return { ok: findings.every((f) => f.severity !== "error"), findings, evidence_paths };
}

function stableId(prefix: string, value: string): string {
  return `${prefix}:${value || "unknown"}`.replace(/[^A-Za-z0-9._:-]+/g, "-");
}

function stableHash(value: string): string {
  return `sha256:${createHash("sha256").update(value).digest("hex")}`;
}

function hasText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function nonEmpty<T>(values: T[] | undefined): T[] {
  return Array.isArray(values) ? values.filter(Boolean) : [];
}

function containsSecret(value: string): boolean {
  return /(sk-[A-Za-z0-9_-]+|ghp_[A-Za-z0-9_]+|github_pat_[A-Za-z0-9_]+)/.test(value);
}

export function recordTestRunEvidence(
  input: TestRunEvidenceInput,
  deps: { db?: HarnessDb; now?: () => string } = {},
): { ok: boolean; findings: Finding[]; refs: ProjectionRef[]; evidence_paths: string[] } {
  const findings: Finding[] = [];
  if (!hasText(input.command)) findings.push(finding("missing-command", "command is required"));
  if (!hasText(input.runner)) findings.push(finding("missing-runner", "runner is required"));
  if (!hasText(input.scope)) findings.push(finding("missing-scope", "scope is required"));
  if (!hasText(input.evidence_path)) {
    findings.push(finding("missing-evidence", "evidence_path is required"));
  } else if (containsSecret(input.evidence_path)) {
    findings.push(finding("secret-evidence", "evidence_path must not contain secret-like values"));
  }
  if (!Number.isInteger(input.exit_code)) {
    findings.push(finding("invalid-exit-code", "exit_code must be an integer"));
  }
  const outputDigest =
    input.output_digest ??
    stableHash(`${input.command}:${input.evidence_path}:${input.completed_at}`);
  const testRunId = stableId(
    "test-run",
    `${input.plan_id ?? "no-plan"}:${input.command}:${input.started_at}`,
  );
  const refs: ProjectionRef[] = [];
  if (deps.db && findings.every((f) => f.severity !== "error")) {
    upsertRow(deps.db, {
      table: "test_runs",
      primaryKey: "test_run_id",
      row: {
        test_run_id: testRunId,
        plan_id: input.plan_id ?? "",
        command: input.command,
        runner: input.runner,
        scope: input.scope,
        started_at: input.started_at,
        completed_at: input.completed_at,
        exit_code: input.exit_code,
        evidence_path: input.evidence_path,
        output_digest: outputDigest,
        status: input.exit_code === 0 ? "passed" : "failed",
      },
    });
    refs.push({ table: "test_runs", id: testRunId, evidence_path: input.evidence_path });
    for (const [index, testCase] of nonEmpty(input.cases).entries()) {
      const testCaseId = stableId("test-case", `${testRunId}:${testCase.oracle_id ?? index}`);
      const resultId = stableId("test-result", `${testCaseId}:${testCase.status}`);
      upsertRow(deps.db, {
        table: "test_cases",
        primaryKey: "test_case_id",
        row: {
          test_case_id: testCaseId,
          test_run_id: testRunId,
          plan_id: input.plan_id ?? "",
          oracle_id: testCase.oracle_id ?? "",
          name: testCase.name,
          status: testCase.status,
          duration_ms: testCase.duration_ms ?? 0,
          evidence_path: input.evidence_path,
        },
      });
      upsertRow(deps.db, {
        table: "test_results",
        primaryKey: "test_result_id",
        row: {
          test_result_id: resultId,
          test_case_id: testCaseId,
          test_run_id: testRunId,
          oracle_id: testCase.oracle_id ?? "",
          status: testCase.status,
          duration_ms: testCase.duration_ms ?? 0,
          failure_digest: testCase.status === "failed" ? stableHash(testCase.message ?? "") : "",
          started_at: input.started_at,
          completed_at: input.completed_at,
          message: testCase.message ?? "",
          evidence_path: input.evidence_path,
        },
      });
      refs.push({ table: "test_cases", id: testCaseId, evidence_path: input.evidence_path });
      refs.push({ table: "test_results", id: resultId, evidence_path: input.evidence_path });
      if (testCase.artifact_path) {
        const edgeId = stableId("test-edge", `${testRunId}:${testCase.artifact_path}:${index}`);
        upsertRow(deps.db, {
          table: "test_artifact_edges",
          primaryKey: "edge_id",
          row: {
            edge_id: edgeId,
            test_artifact_edge_id: stableId("test-edge-compat", stableHash(edgeId)),
            test_case_id: testCaseId,
            test_run_id: testRunId,
            artifact_path: testCase.artifact_path,
            artifact_id: testCase.artifact_path,
            plan_id: input.plan_id ?? "",
            source_path: input.evidence_path,
            edge_kind: "covers",
            oracle_id: testCase.oracle_id ?? "",
            evidence_path: input.evidence_path,
          },
        });
        refs.push({ table: "test_artifact_edges", id: edgeId, evidence_path: input.evidence_path });
      }
    }
  }
  if (!input.plan_id) {
    findings.push(
      finding("missing-plan-id", "missing plan_id creates a finding, not silent pass", {
        evidencePath: input.evidence_path,
        severity: "warn",
      }),
    );
  }
  if (nonEmpty(input.cases).some((c) => !c.oracle_id)) {
    findings.push(
      finding("missing-oracle-id", "missing oracle_id creates a finding, not silent pass", {
        evidencePath: input.evidence_path,
        severity: "warn",
      }),
    );
  }
  return {
    ok: findings.every((f) => f.severity !== "error"),
    findings,
    refs,
    evidence_paths: [input.evidence_path].filter(Boolean),
  };
}

export function evaluateGreenDefinition(input: {
  profile: string;
  required_commands: string[];
  command_evidence: CommandEvidence[];
  reviewed_at?: string;
}): ContractResult & { computed_green_at?: string; missing: string[]; non_green: string[] } {
  const evidenceByKind = new Map(input.command_evidence.map((e) => [e.kind, e]));
  const missing = input.required_commands.filter((kind) => !evidenceByKind.has(kind));
  const nonGreen = input.command_evidence.filter((e) => e.exit_code !== 0).map((e) => e.kind);
  const findings: Finding[] = [
    ...missing.map((kind) => finding("missing-command-evidence", `missing ${kind}`)),
    ...nonGreen.map((kind) => finding("non-green-command", `${kind} exit_code is non-zero`)),
  ];
  const completed = input.command_evidence
    .map((e) => e.completed_at)
    .filter(Boolean)
    .sort();
  const computedGreenAt =
    missing.length === 0 && nonGreen.length === 0 ? completed.at(-1) : undefined;
  if (computedGreenAt && input.reviewed_at && computedGreenAt > input.reviewed_at) {
    findings.push(finding("review-before-green", "computed green time is after review time"));
  }
  return {
    ...result(
      findings,
      input.command_evidence.map((e) => e.evidence_path),
    ),
    computed_green_at: computedGreenAt,
    missing,
    non_green: nonGreen,
  };
}

export function computeUtHistorySignals(input: {
  test_runs: TestRunEvidenceInput[];
  required_oracles?: string[];
  duration_regression_ratio?: number;
}): {
  signals: { signal_type: string; subject_id: string; score: number; evidence_path: string }[];
} {
  const runs = [...input.test_runs].sort((a, b) =>
    `${a.completed_at}:${a.started_at}`.localeCompare(`${b.completed_at}:${b.started_at}`),
  );
  const cases = runs.flatMap((run) => nonEmpty(run.cases));
  const required = new Set(input.required_oracles ?? []);
  const covered = new Set(cases.map((c) => c.oracle_id).filter((id): id is string => !!id));
  const passedRuns = runs.filter((run) => run.exit_code === 0).length;
  const historyByOracle = new Map<
    string,
    { status: "passed" | "failed" | "skipped"; duration_ms?: number; evidence_path: string }[]
  >();
  for (const run of runs) {
    for (const testCase of nonEmpty(run.cases).filter((c) => c.oracle_id)) {
      const oracleId = testCase.oracle_id ?? "";
      const history = historyByOracle.get(oracleId) ?? [];
      history.push({
        status: testCase.status,
        duration_ms: testCase.duration_ms,
        evidence_path: run.evidence_path,
      });
      historyByOracle.set(oracleId, history);
    }
  }
  const oracleCoverage = required.size === 0 ? 1 : covered.size / required.size;
  const planGreenRate = runs.length === 0 ? 0 : passedRuns / runs.length;
  const histories = [...historyByOracle.values()];
  const flakyHistories = histories.filter((history) => {
    const statuses = new Set(history.map((item) => item.status));
    return statuses.has("passed") && statuses.has("failed");
  });
  const flakeScore = histories.length === 0 ? 0 : flakyHistories.length / histories.length;
  const durationRegressionRatio = input.duration_regression_ratio ?? 1.5;
  const durationRegressions = histories.filter((history) => {
    const durations = history
      .map((item) => item.duration_ms)
      .filter((duration): duration is number => typeof duration === "number" && duration > 0);
    if (durations.length < 2) return false;
    const latest = durations.at(-1) ?? 0;
    const baseline = median(durations.slice(0, -1));
    return baseline > 0 && latest / baseline >= durationRegressionRatio;
  });
  const durationRegressionScore =
    histories.length === 0 ? 0 : durationRegressions.length / histories.length;
  const evidencePath = runs.find((run) => run.evidence_path)?.evidence_path ?? "";
  return {
    signals: [
      {
        signal_type: "oracle_coverage",
        subject_id: "ut-history",
        score: oracleCoverage,
        evidence_path: evidencePath,
      },
      {
        signal_type: "plan_green_rate",
        subject_id: "ut-history",
        score: planGreenRate,
        evidence_path: evidencePath,
      },
      {
        signal_type: "flake_score",
        subject_id: "ut-history",
        score: flakeScore,
        evidence_path: evidencePath,
      },
      {
        signal_type: "duration_regression",
        subject_id: "ut-history",
        score: durationRegressionScore,
        evidence_path: evidencePath,
      },
      {
        signal_type: "green_definition_compliance",
        subject_id: "ut-history",
        score: planGreenRate === 1 ? 1 : 0,
        evidence_path: evidencePath,
      },
    ],
  };
}

type UtOracleHistoryItem = {
  oracle_id: string;
  test_case: TestCaseEvidence;
  completed_at: string;
  started_at: string;
  evidence_path: string;
};

function buildUtOracleHistories(runs: TestRunEvidenceInput[]): Map<string, UtOracleHistoryItem[]> {
  const histories = new Map<string, UtOracleHistoryItem[]>();
  for (const run of [...runs].sort((a, b) =>
    `${a.completed_at}:${a.started_at}`.localeCompare(`${b.completed_at}:${b.started_at}`),
  )) {
    for (const testCase of nonEmpty(run.cases).filter((c) => c.oracle_id)) {
      const oracleId = testCase.oracle_id ?? "";
      const history = histories.get(oracleId) ?? [];
      history.push({
        oracle_id: oracleId,
        test_case: testCase,
        completed_at: run.completed_at,
        started_at: run.started_at,
        evidence_path: run.evidence_path,
      });
      histories.set(oracleId, history);
    }
  }
  return histories;
}

function qualitySignalStatus(metric: string, value: number): string {
  if (metric === "flake_score" || metric === "duration_regression") {
    return value > 0 ? "warn" : "pass";
  }
  return value >= 1 ? "pass" : "warn";
}

function qualitySignalThreshold(metric: string): number {
  return metric === "flake_score" || metric === "duration_regression" ? 0 : 1;
}

export function projectUtHistorySignals(
  input: {
    test_runs: TestRunEvidenceInput[];
    required_oracles?: string[];
    duration_regression_ratio?: number;
    window?: string;
    plan_id?: string;
  },
  deps: { db?: HarnessDb; now?: () => string } = {},
): {
  ok: boolean;
  findings: Finding[];
  refs: ProjectionRef[];
  evidence_paths: string[];
  signals: { signal_type: string; subject_id: string; score: number; evidence_path: string }[];
} {
  const computedAt = deps.now?.() ?? new Date().toISOString();
  const signalResult = computeUtHistorySignals(input);
  const refs: ProjectionRef[] = [];
  const evidencePaths = [
    ...new Set([
      ...input.test_runs.map((run) => run.evidence_path).filter(Boolean),
      ...signalResult.signals.map((signal) => signal.evidence_path).filter(Boolean),
    ]),
  ];
  const subjectPrefix = input.plan_id ?? "ut-history";
  const planScope = input.plan_id ?? "no-plan";
  const sortedRuns = [...input.test_runs].sort((a, b) =>
    `${a.completed_at}:${a.started_at}`.localeCompare(`${b.completed_at}:${b.started_at}`),
  );
  const window =
    input.window ??
    `${sortedRuns.at(0)?.started_at ?? "unknown"}..${sortedRuns.at(-1)?.completed_at ?? "unknown"}`;

  if (deps.db) {
    for (const signal of signalResult.signals) {
      const subjectId = signal.subject_id === "ut-history" ? subjectPrefix : signal.subject_id;
      const signalId = stableId("ut-history-signal", `${subjectId}:${signal.signal_type}`);
      upsertRow(deps.db, {
        table: "quality_signals",
        primaryKey: "signal_id",
        row: {
          signal_id: signalId,
          source: "ut-history",
          subject_id: subjectId,
          metric: signal.signal_type,
          value: Number(signal.score.toFixed(4)),
          threshold: qualitySignalThreshold(signal.signal_type),
          status: qualitySignalStatus(signal.signal_type, signal.score),
          computed_at: computedAt,
        },
      });
      refs.push({ table: "quality_signals", id: signalId, evidence_path: signal.evidence_path });
    }

    for (const [oracleId, history] of buildUtOracleHistories(input.test_runs)) {
      refs.push(
        ...projectUtDurationTrendSignals({
          db: deps.db,
          planScope,
          oracleId,
          history,
          threshold: input.duration_regression_ratio ?? 1.5,
        }),
      );
      const passCount = history.filter((item) => item.test_case.status === "passed").length;
      const failCount = history.filter((item) => item.test_case.status === "failed").length;
      if (passCount > 0 && failCount > 0) {
        const score = Number((Math.min(passCount, failCount) / (passCount + failCount)).toFixed(4));
        const evidencePath = history.at(-1)?.evidence_path ?? "";
        const latest = history.at(-1);
        const first = history.at(0);
        const testCaseId = stableId("test-case-oracle", `${planScope}:${oracleId}`);
        const flakeEventId = stableId("test-flake", `${planScope}:${oracleId}:${window}`);
        upsertRow(deps.db, {
          table: "test_cases",
          primaryKey: "test_case_id",
          row: {
            test_case_id: testCaseId,
            test_run_id: "",
            plan_id: input.plan_id ?? "",
            oracle_id: oracleId,
            name: latest?.test_case.name ?? oracleId,
            first_seen_at: first?.completed_at ?? "",
            last_seen_at: latest?.completed_at ?? "",
            status: latest?.test_case.status ?? "",
            duration_ms: latest?.test_case.duration_ms ?? 0,
            evidence_path: evidencePath,
          },
        });
        refs.push({ table: "test_cases", id: testCaseId, evidence_path: evidencePath });
        upsertRow(deps.db, {
          table: "test_flake_events",
          primaryKey: "flake_event_id",
          row: {
            flake_event_id: flakeEventId,
            test_case_id: testCaseId,
            window,
            pass_count: passCount,
            fail_count: failCount,
            flake_score: score,
            computed_at: computedAt,
            evidence_path: evidencePath,
          },
        });
        refs.push({ table: "test_flake_events", id: flakeEventId, evidence_path: evidencePath });

        const signalId = stableId("ut-history-flake-oracle", `${planScope}:${oracleId}:${window}`);
        upsertRow(deps.db, {
          table: "quality_signals",
          primaryKey: "signal_id",
          row: {
            signal_id: signalId,
            source: "ut-history",
            subject_id: `oracle:${planScope}:${oracleId}`,
            metric: "flake_score",
            value: score,
            threshold: 0,
            status: "warn",
            computed_at: computedAt,
          },
        });
        refs.push({ table: "quality_signals", id: signalId, evidence_path: evidencePath });
      }

      const durations = history
        .map((item) => item.test_case.duration_ms)
        .filter((duration): duration is number => typeof duration === "number" && duration > 0);
      if (durations.length >= 2) {
        const baseline = median(durations.slice(0, -1));
        const latest = durations.at(-1) ?? 0;
        const ratio = baseline > 0 ? latest / baseline : 0;
        const threshold = input.duration_regression_ratio ?? 1.5;
        if (ratio >= threshold) {
          const evidencePath = history.at(-1)?.evidence_path ?? "";
          const signalId = stableId(
            "ut-history-duration-oracle",
            `${planScope}:${oracleId}:${window}`,
          );
          upsertRow(deps.db, {
            table: "quality_signals",
            primaryKey: "signal_id",
            row: {
              signal_id: signalId,
              source: "ut-history",
              subject_id: `oracle:${planScope}:${oracleId}`,
              metric: "duration_regression",
              value: Number(ratio.toFixed(4)),
              threshold,
              status: "warn",
              computed_at: computedAt,
            },
          });
          refs.push({ table: "quality_signals", id: signalId, evidence_path: evidencePath });
        }
      }
    }
  }

  return {
    ok: true,
    findings: [],
    refs,
    evidence_paths: evidencePaths,
    signals: signalResult.signals,
  };
}

function projectUtDurationTrendSignals(input: {
  db: HarnessDb;
  planScope: string;
  oracleId: string;
  history: UtOracleHistoryItem[];
  threshold: number;
}): ProjectionRef[] {
  const { db, planScope, oracleId, history, threshold } = input;
  const refs: ProjectionRef[] = [];
  const durationHistory = history
    .map((item) => ({
      duration_ms: item.test_case.duration_ms,
      completed_at: item.completed_at,
      evidence_path: item.evidence_path,
    }))
    .filter(
      (item): item is { duration_ms: number; completed_at: string; evidence_path: string } =>
        typeof item.duration_ms === "number" && item.duration_ms > 0,
    );
  for (const [durationIndex, item] of durationHistory.entries()) {
    const baseline = median(
      durationHistory.slice(0, durationIndex).map((prior) => prior.duration_ms),
    );
    const ratio = baseline > 0 ? item.duration_ms / baseline : 0;
    const signalId = stableId(
      "ut-duration-trend",
      `${planScope}:${oracleId}:${item.completed_at}:${item.duration_ms}:${durationIndex}`,
    );
    upsertRow(db, {
      table: "quality_signals",
      primaryKey: "signal_id",
      row: {
        signal_id: signalId,
        source: "ut-history",
        subject_id: `oracle:${planScope}:${oracleId}`,
        metric: "duration_trend_ms",
        value: item.duration_ms,
        threshold: baseline,
        status: ratio >= threshold ? "warn" : "pass",
        computed_at: item.completed_at,
      },
    });
    refs.push({ table: "quality_signals", id: signalId, evidence_path: item.evidence_path });
  }
  return refs;
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  if (sorted.length === 0) return 0;
  const midpoint = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) return sorted[midpoint] ?? 0;
  return ((sorted[midpoint - 1] ?? 0) + (sorted[midpoint] ?? 0)) / 2;
}

export type {
  RouteApprovalPolicy,
  RouteApprovalResult,
  RouteConfigViolation,
  RouteEscalationBoundary,
  RouteEvalResult,
  RouteSignalEntry,
} from "./routing-contracts";
export {
  detectRouteEscalationBoundaries,
  evaluateRouteCommand,
  routeSignalToMode,
  validateRouteConfigText,
} from "./routing-contracts";
export function recordCrossCuttingEvent(input: {
  type: string;
  subject_id: string;
  severity: Severity;
  evidence_path: string;
}): { ok: boolean; findings: Finding[]; ref?: ProjectionRef } {
  const findings: Finding[] = [];
  if (!hasText(input.type)) findings.push(finding("missing-type", "event type is required"));
  if (!hasText(input.subject_id))
    findings.push(finding("missing-subject", "subject_id is required"));
  if (!hasText(input.evidence_path))
    findings.push(finding("missing-evidence", "evidence_path is required"));
  return {
    ok: findings.length === 0,
    findings,
    ref:
      findings.length === 0
        ? {
            table: "findings",
            id: stableId(`cross:${input.type}`, input.subject_id),
            evidence_path: input.evidence_path,
          }
        : undefined,
  };
}

export {
  buildCommandCatalog,
  catalogExistingAssets,
  catalogSkills,
  classifyDrive,
  prioritizeCapabilityGaps,
  recommendModelEffort,
  recommendSkills,
  renderFoundationReadiness,
  resolveDriveStatePartition,
  scoreTaskComplexity,
  suggestSkillInjection,
  validateFolderRules,
} from "./contracts-extras";
export function enforceForwardOrder(input: {
  layer: string;
  gate: string;
  prior_gates: { gate: string; status: string; evidence_path?: string }[];
}): ContractResult & { allowed: boolean } {
  const blocked = input.prior_gates.filter(
    (g) => g.status !== "passed" && g.status !== "confirmed",
  );
  const findings = blocked.map((g) =>
    finding("prior-gate-not-passed", `${g.gate} is ${g.status}`, {
      evidencePath: g.evidence_path ?? "",
    }),
  );
  return { ...result(findings), allowed: blocked.length === 0 };
}

export function routeReverseR4(input: {
  reverse_type: string;
  r4_evidence: { status: string; evidence_path: string };
  forward_routing?: string;
}): ContractResult & { target_plan?: string } {
  const findings =
    input.r4_evidence.status === "confirmed"
      ? []
      : [
          finding("reverse-not-confirmed", "R4 evidence must be confirmed", {
            evidencePath: input.r4_evidence.evidence_path,
          }),
        ];
  if (!input.forward_routing)
    findings.push(finding("missing-forward-routing", "forward_routing is required"));
  return {
    ...result(findings, [input.r4_evidence.evidence_path]),
    target_plan: findings.length === 0 ? input.forward_routing : undefined,
  };
}

export function decideDiscoveryS4(input: {
  hypothesis: string;
  poc_evidence: { status: string; evidence_path: string };
  outcome: "confirmed" | "rejected" | "pivot";
}): ContractResult & { decision: string } {
  const findings = input.poc_evidence.status
    ? []
    : [finding("missing-poc-evidence", "PoC evidence is required")];
  return { ...result(findings, [input.poc_evidence.evidence_path]), decision: input.outcome };
}

export function detectFrontendDrift(input: {
  mock_root?: string;
  token_root?: string;
  a11y?: string;
  vrt?: string;
}): ContractResult & { drift_signals: string[] } {
  const required = ["mock_root", "token_root", "a11y", "vrt"] as const;
  const missing = required.filter((key) => !input[key]);
  const findings = missing.map((key) =>
    finding("frontend-evidence-absent", `${key} absent by contract`, { severity: "warn" }),
  );
  return { ...result(findings), drift_signals: missing.map((key) => `absent:${key}`) };
}

export function routeScrumFullback(input: {
  increment: string;
  s4_decision: "confirmed" | "rejected" | "pivot";
}): ContractResult & { forward_targets: string[] } {
  const allowed = input.s4_decision === "confirmed";
  return {
    ...result(
      allowed
        ? []
        : [finding("scrum-not-confirmed", "only confirmed increments can enter Forward")],
    ),
    // compatibility field名は維持するが、confirmed incrementを直接Forwardへ送らない。
    // Design Refactor gateを経てtyped V traceへ接着する正規入口を返す。
    forward_targets: allowed ? [`DesignRefactor:${input.increment}`] : [],
  };
}

export type ProductionSliceBoundary = "L3" | "L5" | "none";

export interface DeliveryRouteDecisionInput {
  plan_id: string;
  discovery?: boolean;
  slice_after_layer: ProductionSliceBoundary;
  l3_requirement_receipt?: string;
  user_route_approval_receipt?: string;
}

export interface DeliveryRouteDecisionResult extends ContractResult {
  route?: DeliveryRoute;
  route_decision_digest?: string;
}

/**
 * production routeは規模の単独推定でなく、L3/L5のどこでslice化するかを正規判定にする。
 * 全production routeはL3要件receiptと同時のuser route approvalを必須とする。
 */
export function decideDeliveryRoute(
  input: DeliveryRouteDecisionInput,
): DeliveryRouteDecisionResult {
  const findings: Finding[] = [];
  if (!hasText(input.plan_id))
    findings.push(finding("delivery-plan-id-missing", "plan_id is required"));

  if (input.discovery) {
    return {
      ...result(findings),
      route: findings.length === 0 ? "DISCOVERY_POC" : undefined,
      route_decision_digest:
        findings.length === 0 ? stableHash(`${input.plan_id}|DISCOVERY_POC|discovery`) : undefined,
    };
  }

  if (!hasText(input.l3_requirement_receipt)) {
    findings.push(
      finding(
        "l3-requirement-approval-missing",
        "production route requires L3 requirement receipt",
      ),
    );
  }
  if (!hasText(input.user_route_approval_receipt)) {
    findings.push(
      finding("route-user-approval-missing", "route must be agreed with the L3 requirement freeze"),
    );
  }

  const route: DeliveryRoute =
    input.slice_after_layer === "L3"
      ? "PRODUCTION_SCRUM_REDUCED_V"
      : input.slice_after_layer === "L5"
        ? "V_DESIGN_SCRUM_IMPLEMENTATION"
        : "FULL_L1_L12_V";
  const digestBasis = [
    input.plan_id,
    route,
    input.slice_after_layer,
    input.l3_requirement_receipt ?? "",
    input.user_route_approval_receipt ?? "",
  ].join("|");
  return {
    ...result(findings),
    route: findings.length === 0 ? route : undefined,
    route_decision_digest: findings.length === 0 ? stableHash(digestBasis) : undefined,
  };
}

export interface ScrumDesignConvergenceInput {
  plan_id: string;
  route: DeliveryRoute;
  source_head: string;
  l3_requirement_receipt: string;
  user_route_approval_receipt: string;
  design_refactor: {
    before_contract_digest: string;
    after_contract_digest: string;
    regression_exit_code: number;
    evidence_path: string;
  };
  trace: {
    requirement: string;
    design: string;
    test: string;
    measurement: string;
  };
  semantic_change?: boolean;
  redesign_approval_receipt?: string;
  complexity_or_risk_increased?: boolean;
  reverse_receipt?: string;
  transition_target?: "V_DESIGN_SCRUM_IMPLEMENTATION" | "FULL_L1_L12_V";
}

export type ScrumConvergenceDisposition =
  | "attached"
  | "redesign_required"
  | "reverse_transition_required"
  | "blocked";

export interface ScrumDesignConvergenceResult extends ContractResult {
  disposition: ScrumConvergenceDisposition;
  attachment_digest?: string;
  projection_id?: string;
}

/** Design RefactorでScrum設計を正規化し、typed traceでV正本へ接着するbinding gate。 */
export function evaluateScrumDesignConvergence(
  input: ScrumDesignConvergenceInput,
  deps: { db?: HarnessDb; now?: () => string } = {},
): ScrumDesignConvergenceResult {
  const findings: Finding[] = [];
  const now = (deps.now ?? (() => new Date().toISOString()))();
  const scrumRoute =
    input.route === "PRODUCTION_SCRUM_REDUCED_V" || input.route === "V_DESIGN_SCRUM_IMPLEMENTATION";
  if (!scrumRoute) {
    findings.push(
      finding("scrum-route-required", "convergence gate accepts Scrum or Hybrid route"),
    );
  }
  for (const [name, value] of Object.entries({
    plan_id: input.plan_id,
    source_head: input.source_head,
    l3_requirement_receipt: input.l3_requirement_receipt,
    user_route_approval_receipt: input.user_route_approval_receipt,
    design_refactor_evidence: input.design_refactor.evidence_path,
    requirement_trace: input.trace.requirement,
    design_trace: input.trace.design,
    test_trace: input.trace.test,
    measurement_trace: input.trace.measurement,
  })) {
    if (!hasText(value))
      findings.push(finding(`${name.replaceAll("_", "-")}-missing`, `${name} is required`));
  }

  const refactorInvariant =
    input.design_refactor.before_contract_digest === input.design_refactor.after_contract_digest &&
    input.design_refactor.regression_exit_code === 0;
  if (!refactorInvariant) {
    findings.push(
      finding(
        "design-refactor-invariant-broken",
        "Design Refactor must preserve accepted external contract and pass regression",
        { evidencePath: input.design_refactor.evidence_path },
      ),
    );
  }

  let disposition: ScrumConvergenceDisposition = "attached";
  if (input.semantic_change && !hasText(input.redesign_approval_receipt)) {
    findings.push(
      finding(
        "redesign-approval-required",
        "semantic change cannot be absorbed by Design Refactor; L1-L3 Redesign approval is required",
      ),
    );
    disposition = "redesign_required";
  }
  if (input.complexity_or_risk_increased) {
    if (!hasText(input.reverse_receipt) || !input.transition_target) {
      findings.push(
        finding(
          "reverse-transition-required",
          "complexity/risk increase requires Reverse receipt and Hybrid/Forward target",
        ),
      );
      disposition = "reverse_transition_required";
    }
  }
  if (findings.length > 0 && disposition === "attached") disposition = "blocked";

  const attachmentDigest =
    findings.length === 0
      ? stableHash(
          [
            input.plan_id,
            input.route,
            input.source_head,
            input.design_refactor.after_contract_digest,
            input.trace.requirement,
            input.trace.design,
            input.trace.test,
            input.trace.measurement,
            input.reverse_receipt ?? "",
            input.transition_target ?? "",
          ].join("|"),
        )
      : undefined;
  const projectionId = stableId("delivery-convergence", `${input.plan_id}:${input.source_head}`);
  if (deps.db) {
    upsertRow(deps.db, {
      table: "workflow_runs",
      primaryKey: "workflow_run_id",
      row: {
        workflow_run_id: projectionId,
        plan_id: input.plan_id,
        drive_run_id:
          attachmentDigest ?? stableHash(`${input.plan_id}|${input.source_head}|blocked`),
        workflow: "scrum-vmodel-design-refactor-convergence",
        phase: input.transition_target
          ? `reverse:${input.transition_target}`
          : "design-refactor-attach",
        ready_status: findings.length === 0 ? "ready" : disposition,
        blocked_reason: findings.map((entry) => entry.code).join(","),
        human_required: disposition === "redesign_required" ? 1 : 0,
        checked_at: now,
      },
    });
  }
  return {
    ...result(findings, [input.design_refactor.evidence_path]),
    disposition,
    attachment_digest: attachmentDigest,
    projection_id: projectionId,
  };
}

export function assertRefactorInvariant(input: {
  before: string;
  after: string;
  regression: { exit_code: number; evidence_path: string; test_ids?: string[] };
}): ContractResult & { unchanged: boolean; linked_test_ids: string[] } {
  const unchanged = input.before === input.after && input.regression.exit_code === 0;
  const linkedTestIds = nonEmpty(input.regression.test_ids);
  const findings = [
    ...(unchanged
      ? []
      : [
          finding("refactor-invariant-broken", "behavior changed or regression failed", {
            evidencePath: input.regression.evidence_path,
          }),
        ]),
    ...(linkedTestIds.length > 0
      ? []
      : [
          finding(
            "refactor-test-id-missing",
            "refactor green requires linked regression test ids",
            {
              evidencePath: input.regression.evidence_path,
            },
          ),
        ]),
  ];
  return {
    ...result(findings, [input.regression.evidence_path]),
    unchanged,
    linked_test_ids: linkedTestIds,
  };
}

export function evaluateRetrofitMatrix(input: {
  migration?: string;
  config?: string;
  rollback?: string;
}): ContractResult & { readiness: "ready" | "blocked" } {
  const missing = ["migration", "config", "rollback"].filter(
    (key) => !input[key as keyof typeof input],
  );
  const findings = missing.map((key) =>
    finding("retrofit-evidence-missing", `${key} evidence is missing`),
  );
  return { ...result(findings), readiness: findings.length === 0 ? "ready" : "blocked" };
}

export function evaluateResearchDecision(input: {
  memo: string;
  sources: string[];
  adr_candidate?: string;
}): ContractResult & { decision_ready: boolean } {
  const findings: Finding[] = [];
  if (!hasText(input.memo))
    findings.push(finding("missing-research-memo", "research memo is required"));
  if (input.sources.length === 0)
    findings.push(finding("missing-sources", "source list is required"));
  if (!input.adr_candidate)
    findings.push(
      finding("missing-adr-candidate", "ADR candidate is required", { severity: "warn" }),
    );
  return { ...result(findings), decision_ready: findings.every((f) => f.severity !== "error") };
}

export function mergeTwoStageAgentDesign(input: {
  phase1?: string;
  phase2?: string;
  handoff?: string;
}): ContractResult & { merged?: string } {
  const missing = ["phase1", "phase2", "handoff"].filter(
    (key) => !input[key as keyof typeof input],
  );
  const findings = missing.map((key) =>
    finding("missing-agent-design-stage", `${key} is required`),
  );
  return {
    ...result(findings),
    merged:
      findings.length === 0 ? `${input.phase1}\n${input.phase2}\n${input.handoff}` : undefined,
  };
}

function validateRequiredArtifacts(
  input: Record<string, unknown>,
  required: string[],
  code: string,
): ContractResult & { complete: boolean } {
  const findings = required
    .filter((key) => !input[key])
    .map((key) => finding(code, `${key} is required`));
  return { ...result(findings), complete: findings.length === 0 };
}

export function validateScreenDesignWorkflow(input: Record<string, unknown>) {
  return validateRequiredArtifacts(
    input,
    ["ia", "screens", "flow", "wireframe", "mock", "components"],
    "screen-design-artifact-missing",
  );
}

export function validateFrontendDesignWorkflow(input: Record<string, unknown>) {
  return validateRequiredArtifacts(
    input,
    ["visual", "tokens", "a11y", "vrt", "ux"],
    "frontend-design-artifact-missing",
  );
}

export function classifyDriveTddFits(input: { modes?: string[] } = {}): ContractResult & {
  fits: DriveTddFit[];
} {
  const requested = new Set((input.modes ?? []).map((mode) => mode.trim()).filter(Boolean));
  const fits =
    requested.size === 0 ? DRIVE_TDD_FITS : DRIVE_TDD_FITS.filter((fit) => requested.has(fit.mode));
  const findings =
    requested.size > 0 && fits.length !== requested.size
      ? [
          finding("unknown-tdd-drive-mode", "some requested modes have no TDD fit definition", {
            severity: "warn",
          }),
        ]
      : [];
  return { ...result(findings), fits };
}

import { createHash } from "node:crypto";
import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import {
  analyzeVmodelZipManifest,
  VMODEL_ZIP_EXPECTED_INVENTORY_SIGNATURE,
  VMODEL_ZIP_FILENAME,
  VMODEL_ZIP_REQUIRED_PATHS,
  type VmodelZipManifestResult,
} from "../schema/hybrid-vmodel-manifest";
import {
  buildProjectClosureBatchReport,
  buildProjectClosureEvidenceMaterializePacket,
  buildProjectClosureReviewBundle,
  buildProjectCurrentLocationSnapshot,
  closureEvidenceApprovalDraftCommand,
  closureEvidenceApprovalDraftRefreshPath,
  closureEvidenceHandoffArtifacts,
  closureEvidenceProbeCommand,
  PROJECT_CLOSURE_QUEUE_ACTIONS,
  type ProjectClosureEvidenceProbeExecution,
  type ProjectClosureQueueNextAction,
  type ProjectCurrentLocationSnapshot,
  projectClosureActionCommandLimit,
} from "./current-location";
import type { HarnessDb } from "./index";

export interface VisualizationSnapshot {
  schema_version: "visualization-snapshot.v1";
  source_clock: string | null;
  progress: {
    artifacts: {
      total: number;
      red: number;
      yellow: number;
      green: number;
      unknown: number;
    };
    plans: {
      total: number;
      by_status: Record<string, number>;
    };
    gates: {
      total: number;
      passed: number;
      failed: number;
      blocked: number;
      other: number;
      by_status: Record<string, number>;
    };
  };
  graph: {
    nodes: number;
    edges: number;
    snapshots: number;
    latest_snapshot_id: string | null;
    latest_snapshot_hash: string | null;
    latest_node_count: number | null;
    latest_edge_count: number | null;
  };
  evidence: {
    test_runs: {
      total: number;
      passed: number;
      failed: number;
      other: number;
    };
    runtime_verification: {
      total: number;
      runtime_verified: number;
      projection_only_unverified: number;
      missing_runtime_provenance: number;
      accepted: number;
      blocked: number;
      other: number;
    };
    skill_invocations: {
      total: number;
      accepted: number;
    };
    model_runs: {
      total: number;
    };
    guardrail_decisions: {
      total: number;
      block: number;
      allow: number;
      human_required: number;
    };
  };
  project_current_location: ProjectCurrentLocationSnapshot;
  recovery_handoff_artifacts: {
    items: VisualizationRecoveryHandoffArtifact[];
    present: number;
    missing: number;
    unchecked: number;
  };
  vmodel_zip_manifest?: VmodelZipManifestResult;
  drilldowns: {
    artifact_progress_command: "helix progress artifacts --json";
    relation_graph_command: "helix graph export --format mermaid";
    runtime_verification_table: "runtime_verification_events";
    search_command: "helix find <query> --json";
  };
  warnings: string[];
}

export interface VisualizationRecoveryHandoffArtifact {
  action: ProjectClosureQueueNextAction;
  kind: "probe_record" | "approval_draft" | "approval_refresh_draft" | "decision_draft";
  path: string;
  status: "present" | "missing" | "unchecked";
  generation_status:
    | "present"
    | "ready_to_generate"
    | "waiting_for_probe"
    | "safe_resolution_available"
    | "needs_command_resolution"
    | "needs_evidence_projection"
    | "unchecked";
  generation_command: string | null;
  bytes: number | null;
  sha256: string | null;
  write_policy: string;
  approval_record: VisualizationApprovalRecordStatus | null;
  reasons: string[];
}

export interface VisualizationApprovalRecordStatus {
  status: "pending_human_review" | "approved" | "rejected" | "invalid" | "missing" | "unchecked";
  decision_id: string | null;
  outcome: string | null;
  approval_scope_digest: string | null;
  expected_approval_scope_digest: string | null;
  scope_status: "match" | "mismatch" | "missing" | "not_checked";
  materialize_status: string | null;
  reviewed_candidate_count: number | null;
  valid_for_apply: boolean;
  reasons: string[];
}

interface HandoffGenerationPlan {
  status: VisualizationRecoveryHandoffArtifact["generation_status"];
  command: string | null;
  reasons: string[];
}

function scalarNumber(db: HarnessDb, sql: string, params: unknown[] = []): number {
  const row = db.prepare(sql).get(...params) as Record<string, unknown> | undefined;
  return Number(row?.value ?? 0);
}

function scalarText(db: HarnessDb, sql: string, params: unknown[] = []): string | null {
  const row = db.prepare(sql).get(...params) as Record<string, unknown> | undefined;
  const value = row?.value;
  return typeof value === "string" && value.length > 0 ? value : null;
}

function groupedCounts(db: HarnessDb, sql: string): Record<string, number> {
  const rows = db.prepare(sql).all() as Array<{ key?: unknown; value?: unknown }>;
  const counts: Record<string, number> = {};
  for (const row of rows) {
    const key = typeof row.key === "string" && row.key.length > 0 ? row.key : "unknown";
    counts[key] = Number(row.value ?? 0);
  }
  return Object.fromEntries(Object.entries(counts).sort(([a], [b]) => a.localeCompare(b)));
}

interface CountWhereInput {
  table: string;
  where: string;
  params?: unknown[];
}

function countWhere(db: HarnessDb, input: CountWhereInput): number {
  return scalarNumber(
    db,
    `SELECT COUNT(*) AS value FROM ${input.table} WHERE ${input.where}`,
    input.params ?? [],
  );
}

function buildSourceClock(db: HarnessDb): string | null {
  return scalarText(
    db,
    `SELECT MAX(value) AS value
     FROM (
       SELECT MAX(updated_at) AS value FROM plan_registry
       UNION ALL SELECT MAX(indexed_at) FROM artifact_progress
       UNION ALL SELECT MAX(checked_at) FROM gate_runs
       UNION ALL SELECT MAX(indexed_at) FROM graph_nodes
       UNION ALL SELECT MAX(indexed_at) FROM dependency_edges
       UNION ALL SELECT MAX(computed_at) FROM roadmap_rollups
       UNION ALL SELECT MAX(indexed_at) FROM design_declarations
       UNION ALL SELECT MAX(indexed_at) FROM design_references
       UNION ALL SELECT MAX(indexed_at) FROM design_impact
       UNION ALL SELECT MAX(indexed_at) FROM descent_obligations
       UNION ALL SELECT MAX(created_at) FROM graph_snapshots
       UNION ALL SELECT MAX(completed_at) FROM test_runs
       UNION ALL SELECT MAX(occurred_at) FROM runtime_verification_events
       UNION ALL SELECT MAX(fired_at) FROM skill_invocations
       UNION ALL SELECT MAX(completed_at) FROM model_runs
       UNION ALL SELECT MAX(decided_at) FROM guardrail_decisions
     )
     WHERE value IS NOT NULL AND value <> ''`,
  );
}

function normalizedStatusBuckets(counts: Record<string, number>): {
  passed: number;
  failed: number;
  blocked: number;
  other: number;
} {
  let passed = 0;
  let failed = 0;
  let blocked = 0;
  let other = 0;
  for (const [status, count] of Object.entries(counts)) {
    const normalized = status.toLowerCase();
    if (["pass", "passed", "ok", "green"].includes(normalized)) passed += count;
    else if (["fail", "failed", "error", "red"].includes(normalized)) failed += count;
    else if (["block", "blocked", "human-required", "human_required"].includes(normalized)) {
      blocked += count;
    } else other += count;
  }
  return { passed, failed, blocked, other };
}

function absentVmodelZipManifest(): VmodelZipManifestResult {
  return {
    ok: true,
    archivePath: VMODEL_ZIP_FILENAME,
    present: false,
    rootPrefix: null,
    entriesTotal: 0,
    byExtension: {},
    inventorySignature: {
      status: "advisory_missing",
      expected_root_prefix: VMODEL_ZIP_EXPECTED_INVENTORY_SIGNATURE.rootPrefix,
      actual_root_prefix: null,
      expected_entries_total: VMODEL_ZIP_EXPECTED_INVENTORY_SIGNATURE.entriesTotal,
      actual_entries_total: 0,
      expected_by_extension: { ...VMODEL_ZIP_EXPECTED_INVENTORY_SIGNATURE.byExtension },
      actual_by_extension: Object.fromEntries(
        Object.keys(VMODEL_ZIP_EXPECTED_INVENTORY_SIGNATURE.byExtension).map((extension) => [
          extension,
          0,
        ]),
      ),
      mismatches: [],
    },
    required: VMODEL_ZIP_REQUIRED_PATHS.map((path) => ({
      path,
      present: false,
      actualPath: null,
    })),
    findings: [
      {
        code: "archive_missing",
        severity: "warn",
        detail: `${VMODEL_ZIP_FILENAME} が無いため ZIP manifest 検査は advisory skip`,
      },
    ],
  };
}

function approvalScopeStatus(
  approvalScopeDigest: string | null,
  expectedApprovalScopeDigest: string | null,
): VisualizationApprovalRecordStatus["scope_status"] {
  if (approvalScopeDigest === null) return "missing";
  if (expectedApprovalScopeDigest === null) return "not_checked";
  return approvalScopeDigest === expectedApprovalScopeDigest ? "match" : "mismatch";
}

function parseVisualizationApprovalRecord(
  text: string | null,
  options: {
    expectedApprovalScopeDigest?: string | null;
    expectedMaterializeStatus?: string | null;
    scopeLabel?: "materialize" | "closure_review";
  } = {},
): VisualizationApprovalRecordStatus {
  const expectedApprovalScopeDigest = options.expectedApprovalScopeDigest ?? null;
  const expectedMaterializeStatus = options.expectedMaterializeStatus ?? null;
  const scopeLabel = options.scopeLabel ?? "materialize";
  if (text === null) {
    return {
      status: "missing",
      decision_id: null,
      outcome: null,
      approval_scope_digest: null,
      expected_approval_scope_digest: expectedApprovalScopeDigest,
      scope_status: "missing",
      materialize_status: expectedMaterializeStatus,
      reviewed_candidate_count: null,
      valid_for_apply: false,
      reasons: ["approval draft artifact が存在しない"],
    };
  }
  const decisionId = /^decision_id:\s*(.+)$/m.exec(text)?.[1]?.trim() ?? null;
  const outcome = /^outcome:\s*(.+)$/m.exec(text)?.[1]?.trim() ?? null;
  const approvalScopeDigest = /^approval_scope_digest:\s*(.+)$/m.exec(text)?.[1]?.trim() ?? null;
  const reviewedCandidateCountRaw =
    (
      /^reviewed_candidate_count:\s*(.+)$/m.exec(text)?.[1] ??
      /^reviewed_count:\s*(.+)$/m.exec(text)?.[1]
    )?.trim() ?? null;
  const reviewedCandidateCount =
    reviewedCandidateCountRaw === null ? null : Number(reviewedCandidateCountRaw);
  const invalidFields: string[] = [];
  if (decisionId === null) invalidFields.push("decision_id");
  if (outcome === null) invalidFields.push("outcome");
  if (approvalScopeDigest === null) invalidFields.push("approval_scope_digest");
  if (reviewedCandidateCountRaw !== null && !Number.isFinite(reviewedCandidateCount)) {
    invalidFields.push("reviewed_candidate_count:number");
  }
  if (invalidFields.length > 0) {
    return {
      status: "invalid",
      decision_id: decisionId,
      outcome,
      approval_scope_digest: approvalScopeDigest,
      expected_approval_scope_digest: expectedApprovalScopeDigest,
      scope_status: approvalScopeStatus(approvalScopeDigest, expectedApprovalScopeDigest),
      materialize_status: expectedMaterializeStatus,
      reviewed_candidate_count: Number.isFinite(reviewedCandidateCount)
        ? reviewedCandidateCount
        : null,
      valid_for_apply: false,
      reasons: [`approval record fields invalid: ${invalidFields.join(",")}`],
    };
  }
  const common = {
    decision_id: decisionId,
    outcome,
    approval_scope_digest: approvalScopeDigest,
    expected_approval_scope_digest: expectedApprovalScopeDigest,
    scope_status: approvalScopeStatus(approvalScopeDigest, expectedApprovalScopeDigest),
    materialize_status: expectedMaterializeStatus,
    reviewed_candidate_count: Number.isFinite(reviewedCandidateCount)
      ? reviewedCandidateCount
      : null,
  };
  const scopeReasons =
    common.scope_status === "match"
      ? [
          scopeLabel === "closure_review"
            ? "approval_scope_digest は current closure review scope と一致"
            : "approval_scope_digest は current materialize scope と一致",
        ]
      : common.scope_status === "mismatch"
        ? [
            scopeLabel === "closure_review"
              ? "approval_scope_digest が current closure review scope と一致しない"
              : "approval_scope_digest が current materialize scope と一致しない",
          ]
        : common.scope_status === "missing"
          ? ["approval_scope_digest が指定されていない"]
          : [];
  if (outcome === "pending_human_review") {
    return {
      status: "pending_human_review",
      ...common,
      valid_for_apply: false,
      reasons: ["人間レビュー待ちの non-authorizing approval draft", ...scopeReasons],
    };
  }
  if (outcome === "approve_materialized_evidence") {
    return {
      status: "approved",
      ...common,
      valid_for_apply: common.scope_status === "match",
      reasons: ["approval outcome は approve_materialized_evidence", ...scopeReasons],
    };
  }
  if (outcome === "approve_closure_claim") {
    return {
      status: "approved",
      ...common,
      valid_for_apply: common.scope_status === "match",
      reasons: ["approval outcome は approve_closure_claim", ...scopeReasons],
    };
  }
  if (outcome === "reject_materialized_evidence") {
    return {
      status: "rejected",
      ...common,
      valid_for_apply: false,
      reasons: ["approval outcome は reject_materialized_evidence", ...scopeReasons],
    };
  }
  if (
    outcome === "reject_to_collect_evidence" ||
    outcome === "reject_to_repair_failed_evidence" ||
    outcome === "reject_to_reverse_design"
  ) {
    return {
      status: "rejected",
      ...common,
      valid_for_apply: false,
      reasons: [`approval outcome は ${outcome}`, ...scopeReasons],
    };
  }
  return {
    status: "invalid",
    ...common,
    valid_for_apply: false,
    reasons: [`unknown approval outcome: ${outcome}`],
  };
}

function readVisualizationProbeExecution(
  repoRoot: string | undefined,
  probeRecordPath: string,
): ProjectClosureEvidenceProbeExecution | null {
  if (!repoRoot) return null;
  const absolutePath = join(repoRoot, probeRecordPath);
  if (!existsSync(absolutePath)) return null;
  try {
    const payload = JSON.parse(readFileSync(absolutePath, "utf8")) as {
      execution?: unknown;
    };
    const execution = payload.execution as
      | {
          command?: unknown;
          started_at?: unknown;
          completed_at?: unknown;
          session_id?: unknown;
          correlation_id?: unknown;
          exit_code?: unknown;
          status?: unknown;
          output_digest?: unknown;
          stdout_bytes?: unknown;
          stderr_bytes?: unknown;
          output_excerpt?: unknown;
          error_message?: unknown;
        }
      | null
      | undefined;
    if (
      !execution ||
      typeof execution.command !== "string" ||
      typeof execution.started_at !== "string" ||
      typeof execution.completed_at !== "string" ||
      !(typeof execution.exit_code === "number" || execution.exit_code === null) ||
      !(
        execution.status === "passed" ||
        execution.status === "failed" ||
        execution.status === "error"
      ) ||
      typeof execution.output_digest !== "string" ||
      typeof execution.stdout_bytes !== "number" ||
      typeof execution.stderr_bytes !== "number" ||
      !(typeof execution.error_message === "string" || execution.error_message === null)
    ) {
      return null;
    }
    const outputExcerpt = execution.output_excerpt as
      | {
          stdout_head?: unknown;
          stdout_tail?: unknown;
          stderr_head?: unknown;
          stderr_tail?: unknown;
          truncated?: unknown;
          limit?: unknown;
        }
      | undefined;
    const parsedExcerpt =
      outputExcerpt &&
      typeof outputExcerpt.stdout_head === "string" &&
      typeof outputExcerpt.stdout_tail === "string" &&
      typeof outputExcerpt.stderr_head === "string" &&
      typeof outputExcerpt.stderr_tail === "string" &&
      typeof outputExcerpt.truncated === "boolean" &&
      typeof outputExcerpt.limit === "number"
        ? {
            stdout_head: outputExcerpt.stdout_head,
            stdout_tail: outputExcerpt.stdout_tail,
            stderr_head: outputExcerpt.stderr_head,
            stderr_tail: outputExcerpt.stderr_tail,
            truncated: outputExcerpt.truncated,
            limit: outputExcerpt.limit,
          }
        : undefined;
    return {
      command: execution.command,
      ...(typeof execution.session_id === "string" ? { session_id: execution.session_id } : {}),
      ...(typeof execution.correlation_id === "string"
        ? { correlation_id: execution.correlation_id }
        : {}),
      started_at: execution.started_at,
      completed_at: execution.completed_at,
      exit_code: execution.exit_code,
      status: execution.status,
      output_digest: execution.output_digest,
      stdout_bytes: execution.stdout_bytes,
      stderr_bytes: execution.stderr_bytes,
      ...(parsedExcerpt ? { output_excerpt: parsedExcerpt } : {}),
      error_message: execution.error_message,
    };
  } catch {
    return null;
  }
}

function expectedApprovalScope(input: {
  repoRoot?: string;
  snapshot: ProjectCurrentLocationSnapshot;
  action: ProjectClosureQueueNextAction;
  limit: number;
  probeRecordPath: string;
}): { digest: string; materializeStatus: string } | null {
  const execution = readVisualizationProbeExecution(input.repoRoot, input.probeRecordPath);
  if (!execution) return null;
  const materialize = buildProjectClosureEvidenceMaterializePacket(input.snapshot, {
    action: input.action,
    limit: input.limit,
    probeExecution: execution,
  });
  return {
    digest: materialize.approval.approval_scope_digest,
    materializeStatus: materialize.materialize_readiness.status,
  };
}

function inspectHandoffArtifact(input: {
  repoRoot?: string;
  snapshot: ProjectCurrentLocationSnapshot;
  action: ProjectClosureQueueNextAction;
  kind: VisualizationRecoveryHandoffArtifact["kind"];
  path: string;
  writePolicy: string;
  generation: HandoffGenerationPlan;
  expectedApprovalScopeDigest?: string | null;
  expectedMaterializeStatus?: string | null;
}): VisualizationRecoveryHandoffArtifact {
  if (!input.repoRoot) {
    return {
      action: input.action,
      kind: input.kind,
      path: input.path,
      status: "unchecked",
      generation_status: "unchecked",
      generation_command: input.generation.command,
      bytes: null,
      sha256: null,
      write_policy: input.writePolicy,
      approval_record:
        input.kind !== "probe_record"
          ? {
              status: "unchecked",
              decision_id: null,
              outcome: null,
              approval_scope_digest: null,
              expected_approval_scope_digest: input.expectedApprovalScopeDigest ?? null,
              scope_status: "not_checked",
              materialize_status: input.expectedMaterializeStatus ?? null,
              reviewed_candidate_count: null,
              valid_for_apply: false,
              reasons: ["repoRoot が無いため approval draft の内容は未検査"],
            }
          : null,
      reasons: ["repoRoot が無いため local handoff artifact の実在は未検査"],
    };
  }

  const absolutePath = join(input.repoRoot, input.path);
  if (!existsSync(absolutePath)) {
    return {
      action: input.action,
      kind: input.kind,
      path: input.path,
      status: "missing",
      generation_status: input.generation.status,
      generation_command: input.generation.command,
      bytes: null,
      sha256: null,
      write_policy: input.writePolicy,
      approval_record:
        input.kind !== "probe_record"
          ? parseVisualizationApprovalRecord(null, {
              expectedApprovalScopeDigest: input.expectedApprovalScopeDigest ?? null,
              expectedMaterializeStatus: input.expectedMaterializeStatus ?? null,
              scopeLabel: input.kind === "decision_draft" ? "closure_review" : "materialize",
            })
          : null,
      reasons: ["handoff artifact はまだ生成されていない", ...input.generation.reasons],
    };
  }

  const bytes = statSync(absolutePath).size;
  const content = readFileSync(absolutePath);
  const sha256 = `sha256:${createHash("sha256").update(content).digest("hex")}`;
  return {
    action: input.action,
    kind: input.kind,
    path: input.path,
    status: "present",
    generation_status: "present",
    generation_command: input.generation.command,
    bytes,
    sha256,
    write_policy: input.writePolicy,
    approval_record:
      input.kind !== "probe_record"
        ? parseVisualizationApprovalRecord(content.toString("utf8"), {
            expectedApprovalScopeDigest: input.expectedApprovalScopeDigest ?? null,
            expectedMaterializeStatus: input.expectedMaterializeStatus ?? null,
            scopeLabel: input.kind === "decision_draft" ? "closure_review" : "materialize",
          })
        : null,
    reasons: ["handoff artifact を repoRoot から検出した"],
  };
}

function buildRecoveryHandoffArtifacts(input: {
  repoRoot?: string;
  snapshot: ProjectCurrentLocationSnapshot;
}): VisualizationSnapshot["recovery_handoff_artifacts"] {
  const batchByAction = new Map(
    PROJECT_CLOSURE_QUEUE_ACTIONS.map(
      (action) =>
        [
          action,
          buildProjectClosureBatchReport(input.snapshot, {
            action,
            limit: projectClosureActionCommandLimit(input.snapshot, action, 3),
          }),
        ] as const,
    ),
  );
  const probePresentByAction = new Map<ProjectClosureQueueNextAction, boolean>();
  const probeGeneration = (action: ProjectClosureQueueNextAction): HandoffGenerationPlan => {
    const commandLimit = projectClosureActionCommandLimit(input.snapshot, action, 3);
    const batch = batchByAction.get(action);
    const automation = batch?.work_buckets[0]?.repair_plan.automation;
    if (!automation) {
      return {
        status: "needs_evidence_projection",
        command: closureEvidenceProbeCommand(action, commandLimit),
        reasons: ["closure batch に handoff 用 work bucket が無い"],
      };
    }
    if (automation.safe_resolution_command_count > 0 || automation.runnable_command_count > 0) {
      return {
        status: "ready_to_generate",
        command: closureEvidenceProbeCommand(action, commandLimit),
        reasons: ["safe command resolution があるため probe artifact を生成できる"],
      };
    }
    if (automation.status === "needs_evidence_projection") {
      return {
        status: "needs_evidence_projection",
        command:
          batch?.work_buckets[0]?.evidence_plan_command ??
          closureEvidenceProbeCommand(action, commandLimit),
        reasons: [automation.required_action, ...automation.reasons],
      };
    }
    return {
      status: "needs_command_resolution",
      command: closureEvidenceProbeCommand(action, commandLimit),
      reasons: [automation.required_action, ...automation.reasons],
    };
  };

  const closeReadyLimit = projectClosureActionCommandLimit(input.snapshot, "close_ready", 20);
  const closeReadyBundle = buildProjectClosureReviewBundle(input.snapshot, {
    action: "close_ready",
    limit: closeReadyLimit,
    offset: 0,
  });
  const closeReadyDecisionDraft = inspectHandoffArtifact({
    repoRoot: input.repoRoot,
    snapshot: input.snapshot,
    action: "close_ready",
    kind: "decision_draft",
    path: ".helix/tmp/closure/close_ready-decision-draft.yml",
    writePolicy: "local-artifact-new-file",
    generation: {
      status: closeReadyBundle.total > 0 ? "ready_to_generate" : "needs_evidence_projection",
      command: `helix closure decision-draft --action close_ready --limit ${closeReadyLimit} --offset 0 --out .helix/tmp/closure/close_ready-decision-draft.yml --summary-json`,
      reasons:
        closeReadyBundle.total > 0
          ? ["close_ready candidate があるため decision draft を生成できる"]
          : ["close_ready candidate が無いため decision draft は不要"],
    },
    expectedApprovalScopeDigest: closeReadyBundle.review_scope.approval_scope_digest,
  });

  const items = [
    closeReadyDecisionDraft,
    ...PROJECT_CLOSURE_QUEUE_ACTIONS.flatMap((action) => {
      const commandLimit = projectClosureActionCommandLimit(input.snapshot, action, 3);
      const artifacts = closureEvidenceHandoffArtifacts(action);
      if (!artifacts) return [];
      const probe = inspectHandoffArtifact({
        repoRoot: input.repoRoot,
        snapshot: input.snapshot,
        action,
        kind: "probe_record",
        path: artifacts.probe_record_path,
        writePolicy: artifacts.write_policy,
        generation: probeGeneration(action),
      });
      probePresentByAction.set(action, probe.status === "present");
      const draftGeneration: HandoffGenerationPlan = probePresentByAction.get(action)
        ? {
            status: "ready_to_generate",
            command: closureEvidenceApprovalDraftCommand(action, commandLimit),
            reasons: ["probe record があるため approval draft を生成できる"],
          }
        : {
            status: "waiting_for_probe",
            command: closureEvidenceApprovalDraftCommand(action, commandLimit),
            reasons: ["approval draft 生成には先に probe record が必要"],
          };
      const expectedApproval = expectedApprovalScope({
        repoRoot: input.repoRoot,
        snapshot: input.snapshot,
        action,
        limit: commandLimit,
        probeRecordPath: artifacts.probe_record_path,
      });
      const draft = inspectHandoffArtifact({
        repoRoot: input.repoRoot,
        snapshot: input.snapshot,
        action,
        kind: "approval_draft",
        path: artifacts.approval_draft_path,
        writePolicy: artifacts.write_policy,
        generation: draftGeneration,
        expectedApprovalScopeDigest: expectedApproval?.digest ?? null,
        expectedMaterializeStatus: expectedApproval?.materializeStatus ?? null,
      });
      const refresh =
        draft.approval_record?.scope_status === "mismatch" && expectedApproval?.digest
          ? inspectHandoffArtifact({
              repoRoot: input.repoRoot,
              snapshot: input.snapshot,
              action,
              kind: "approval_refresh_draft",
              path: closureEvidenceApprovalDraftRefreshPath(action, expectedApproval.digest),
              writePolicy: artifacts.write_policy,
              generation: {
                status: probe.status === "present" ? "ready_to_generate" : "waiting_for_probe",
                command: closureEvidenceApprovalDraftCommand(
                  action,
                  commandLimit,
                  closureEvidenceApprovalDraftRefreshPath(action, expectedApproval.digest),
                ),
                reasons:
                  probe.status === "present"
                    ? ["canonical approval draft が stale のため refresh draft を生成できる"]
                    : ["refresh draft 生成には先に probe record が必要"],
              },
              expectedApprovalScopeDigest: expectedApproval.digest,
              expectedMaterializeStatus: expectedApproval.materializeStatus,
            })
          : null;
      return [probe, draft, ...(refresh ? [refresh] : [])];
    }),
  ];
  return {
    items,
    present: items.filter((item) => item.status === "present").length,
    missing: items.filter((item) => item.status === "missing").length,
    unchecked: items.filter((item) => item.status === "unchecked").length,
  };
}

export function buildVisualizationSnapshot(
  db: HarnessDb,
  input: {
    repoRoot?: string;
  } = {},
): VisualizationSnapshot {
  const projectCurrentLocation = buildProjectCurrentLocationSnapshot(db);
  const vmodelZipManifest = input.repoRoot
    ? analyzeVmodelZipManifest(input.repoRoot)
    : absentVmodelZipManifest();
  const artifactTotal = scalarNumber(db, "SELECT COUNT(*) AS value FROM artifact_progress");
  const artifactRed = countWhere(db, {
    table: "artifact_progress",
    where: "color = ?",
    params: ["red"],
  });
  const artifactYellow = countWhere(db, {
    table: "artifact_progress",
    where: "color = ?",
    params: ["yellow"],
  });
  const artifactGreen = countWhere(db, {
    table: "artifact_progress",
    where: "color = ?",
    params: ["green"],
  });
  const planStatusCounts = groupedCounts(
    db,
    "SELECT COALESCE(NULLIF(status, ''), 'unknown') AS key, COUNT(*) AS value FROM plan_registry GROUP BY key",
  );
  const gateStatusCounts = groupedCounts(
    db,
    "SELECT COALESCE(NULLIF(status, ''), 'unknown') AS key, COUNT(*) AS value FROM gate_runs GROUP BY key",
  );
  const gateBuckets = normalizedStatusBuckets(gateStatusCounts);
  const gateTotal = Object.values(gateStatusCounts).reduce((sum, count) => sum + count, 0);
  const latestSnapshot = db
    .prepare(
      `SELECT graph_snapshot_id, hash, node_count, edge_count
       FROM graph_snapshots
       ORDER BY created_at DESC, graph_snapshot_id DESC
       LIMIT 1`,
    )
    .get() as
    | {
        graph_snapshot_id?: unknown;
        hash?: unknown;
        node_count?: unknown;
        edge_count?: unknown;
      }
    | undefined;
  const testTotal = scalarNumber(db, "SELECT COUNT(*) AS value FROM test_runs");
  const testPassed = countWhere(db, {
    table: "test_runs",
    where: "exit_code = 0 OR lower(status) IN ('pass', 'passed', 'ok', 'green')",
  });
  const testFailed = countWhere(db, {
    table: "test_runs",
    where:
      "(exit_code IS NOT NULL AND exit_code <> 0) OR lower(status) IN ('fail', 'failed', 'error', 'red')",
  });
  const runtimeTotal = scalarNumber(
    db,
    "SELECT COUNT(*) AS value FROM runtime_verification_events",
  );
  const runtimeAccepted = countWhere(db, {
    table: "runtime_verification_events",
    where: "verification_class = ? AND accept_status = ?",
    params: ["runtime_verified", "accepted"],
  });
  const runtimeBlocked = countWhere(db, {
    table: "runtime_verification_events",
    where: "accept_status = ?",
    params: ["blocked"],
  });
  const runtimeVerified = countWhere(db, {
    table: "runtime_verification_events",
    where: "verification_class = ?",
    params: ["runtime_verified"],
  });
  const runtimeProjectionOnly = countWhere(db, {
    table: "runtime_verification_events",
    where: "verification_class = ?",
    params: ["projection_only_unverified"],
  });
  const runtimeMissing = countWhere(db, {
    table: "runtime_verification_events",
    where: "verification_class = ?",
    params: ["missing_runtime_provenance"],
  });
  const guardTotal = scalarNumber(db, "SELECT COUNT(*) AS value FROM guardrail_decisions");
  const guardBlock = countWhere(db, {
    table: "guardrail_decisions",
    where: "decision = ?",
    params: ["block"],
  });
  const guardAllow = countWhere(db, {
    table: "guardrail_decisions",
    where: "decision = ?",
    params: ["allow"],
  });
  const guardHumanRequired = countWhere(db, {
    table: "guardrail_decisions",
    where: "human_signoff_required = 1 OR decision = ?",
    params: ["human-required"],
  });
  const warnings: string[] = [];
  if (artifactTotal === 0) warnings.push("artifact_progress is empty; run `helix db rebuild`");
  if (runtimeProjectionOnly > 0 || runtimeMissing > 0) {
    warnings.push(
      "runtime verification includes non-accepted projection-only or missing-provenance rows",
    );
  }

  return {
    schema_version: "visualization-snapshot.v1",
    source_clock: buildSourceClock(db),
    progress: {
      artifacts: {
        total: artifactTotal,
        red: artifactRed,
        yellow: artifactYellow,
        green: artifactGreen,
        unknown: artifactTotal - artifactRed - artifactYellow - artifactGreen,
      },
      plans: {
        total: Object.values(planStatusCounts).reduce((sum, count) => sum + count, 0),
        by_status: planStatusCounts,
      },
      gates: {
        total: gateTotal,
        passed: gateBuckets.passed,
        failed: gateBuckets.failed,
        blocked: gateBuckets.blocked,
        other: gateBuckets.other,
        by_status: gateStatusCounts,
      },
    },
    graph: {
      nodes: scalarNumber(db, "SELECT COUNT(*) AS value FROM graph_nodes"),
      edges: scalarNumber(db, "SELECT COUNT(*) AS value FROM dependency_edges"),
      snapshots: scalarNumber(db, "SELECT COUNT(*) AS value FROM graph_snapshots"),
      latest_snapshot_id:
        typeof latestSnapshot?.graph_snapshot_id === "string"
          ? latestSnapshot.graph_snapshot_id
          : null,
      latest_snapshot_hash: typeof latestSnapshot?.hash === "string" ? latestSnapshot.hash : null,
      latest_node_count:
        latestSnapshot?.node_count == null ? null : Number(latestSnapshot.node_count ?? 0),
      latest_edge_count:
        latestSnapshot?.edge_count == null ? null : Number(latestSnapshot.edge_count ?? 0),
    },
    evidence: {
      test_runs: {
        total: testTotal,
        passed: testPassed,
        failed: testFailed,
        other: testTotal - testPassed - testFailed,
      },
      runtime_verification: {
        total: runtimeTotal,
        runtime_verified: runtimeVerified,
        projection_only_unverified: runtimeProjectionOnly,
        missing_runtime_provenance: runtimeMissing,
        accepted: runtimeAccepted,
        blocked: runtimeBlocked,
        other: runtimeTotal - runtimeAccepted - runtimeBlocked,
      },
      skill_invocations: {
        total: scalarNumber(db, "SELECT COUNT(*) AS value FROM skill_invocations"),
        accepted: countWhere(db, { table: "skill_invocations", where: "accepted = 1" }),
      },
      model_runs: {
        total: scalarNumber(db, "SELECT COUNT(*) AS value FROM model_runs"),
      },
      guardrail_decisions: {
        total: guardTotal,
        block: guardBlock,
        allow: guardAllow,
        human_required: guardHumanRequired,
      },
    },
    project_current_location: projectCurrentLocation,
    recovery_handoff_artifacts: buildRecoveryHandoffArtifacts({
      repoRoot: input.repoRoot,
      snapshot: projectCurrentLocation,
    }),
    vmodel_zip_manifest: vmodelZipManifest,
    drilldowns: {
      artifact_progress_command: "helix progress artifacts --json",
      relation_graph_command: "helix graph export --format mermaid",
      runtime_verification_table: "runtime_verification_events",
      search_command: "helix find <query> --json",
    },
    warnings,
  };
}

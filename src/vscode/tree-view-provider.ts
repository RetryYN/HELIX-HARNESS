import type { MetricRow, VisualizationViewModel } from "../state-db/visualization-view-model";
import { HELIX_COPY_POINTER_COMMAND } from "../schema/visualization-tree-contract";

export type TreeNodeState = "none" | "collapsed" | "expanded";

export interface TreeViewCommand {
  title: string;
  command: typeof HELIX_COPY_POINTER_COMMAND;
  arguments: string[];
}

export interface TreeViewNode {
  id: string;
  label: string;
  description?: string;
  tooltip?: string;
  contextValue: string;
  collapsibleState: TreeNodeState;
  command?: TreeViewCommand;
  children: TreeViewNode[];
}

export interface VisualizationTreeViewModel {
  schema_version: "visualization-tree-view.v1";
  source_clock: string | null;
  roots: TreeViewNode[];
  warnings: string[];
}

type VmodelWorkBucket = NonNullable<
  VisualizationViewModel["project"]["current_location"]["vmodel_fit"]["next_actions"][number]["work_bucket"]
>;
type VmodelHandoffArtifactStatus = NonNullable<
  VmodelWorkBucket["evidence_handoff_status"]
>["items"][number];
type ProjectHandoffArtifactStatus =
  VisualizationViewModel["project"]["current_location"]["recovery_handoff_artifacts"]["items"][number];
type HandoffArtifactStatus = VmodelHandoffArtifactStatus | ProjectHandoffArtifactStatus;

const TOOLTIP_LINE_LIMIT = 24;
const SUMMARY_CAPABLE_HELIX_PREFIXES = [
  "helix current-location",
  "helix drive model",
  "helix recovery plan",
  "helix roadmap current",
  "helix vmodel fit",
  "helix doctor",
  "helix artifact-remap batch",
  "helix closure batch",
  "helix closure evidence-plan",
  "helix closure evidence-patch",
  "helix closure evidence-probe",
  "helix closure evidence-materialize",
  "helix closure evidence-approval-draft",
  "helix closure evidence-apply",
  "helix closure overview",
  "helix closure review-bundle",
  "helix closure transition-plan",
  "helix closure decision-draft",
  "helix closure apply",
  "helix progress tree-view",
  "helix progress artifacts",
] as const;

function readOnlySummaryPointer(command: string): string {
  if (command.includes(" --summary-json") || !command.endsWith(" --json")) return command;
  return SUMMARY_CAPABLE_HELIX_PREFIXES.some(
    (prefix) => command === `${prefix} --json` || command.startsWith(`${prefix} `),
  )
    ? command.replace(/ --json$/, " --summary-json")
    : command;
}

function node(input: {
  id: string;
  label: string;
  description?: string;
  tooltip?: string;
  contextValue: string;
  children?: TreeViewNode[];
  commandPointer?: string;
  expanded?: boolean;
}): TreeViewNode {
  const children = input.children ?? [];
  return {
    id: input.id,
    label: input.label,
    description: input.description,
    tooltip: input.tooltip,
    contextValue: input.contextValue,
    collapsibleState:
      children.length === 0 ? "none" : input.expanded === true ? "expanded" : "collapsed",
    command: input.commandPointer
      ? {
          title: "Copy pointer",
          command: HELIX_COPY_POINTER_COMMAND,
          arguments: [readOnlySummaryPointer(input.commandPointer)],
        }
      : undefined,
    children,
  };
}

function tooltipLines(
  lines: Array<string | null | undefined>,
  options: { limit?: number; omittedHint?: string } = {},
): string {
  const limit = options.limit ?? TOOLTIP_LINE_LIMIT;
  const cleaned = lines.filter(
    (line): line is string => typeof line === "string" && line.length > 0,
  );
  if (cleaned.length <= limit) return cleaned.join("\n");
  const omitted = cleaned.length - limit;
  return [
    ...cleaned.slice(0, limit),
    `... ${omitted} more (${options.omittedHint ?? "open JSON report for complete list"})`,
  ].join("\n");
}

function summaryJsonPointer(command: string): string {
  return readOnlySummaryPointer(command);
}

function artifactStatusDescription(
  item: HandoffArtifactStatus | undefined,
  fallbackPath: string,
): string {
  if (!item) return fallbackPath;
  return `${item.status} ${item.generation_status} ${item.bytes === null ? "-" : item.bytes}B`;
}

function artifactStatusTooltip(
  item: HandoffArtifactStatus | undefined,
  fallbackPath: string,
  writePolicy: string,
): string {
  if (!item) return `${fallbackPath}\nwrite=${writePolicy}`;
  return tooltipLines([
    item.path,
    item.sha256,
    item.generation_command ? `generate=${item.generation_command}` : null,
    `write=${item.write_policy}`,
    item.approval_record ? `approval=${item.approval_record.status}` : null,
    item.approval_record?.outcome ? `outcome=${item.approval_record.outcome}` : null,
    item.approval_record ? `scope=${item.approval_record.scope_status}` : null,
    item.approval_record?.approval_scope_digest
      ? `approval_scope_digest=${item.approval_record.approval_scope_digest}`
      : null,
    item.approval_record?.expected_approval_scope_digest
      ? `expected=${item.approval_record.expected_approval_scope_digest}`
      : null,
    ...item.reasons,
  ]);
}

function handoffArtifactStatus(
  bucket: VmodelWorkBucket,
  kind: "probe_record" | "approval_draft",
): VmodelHandoffArtifactStatus | undefined {
  return bucket.evidence_handoff_status?.items.find((item) => item.kind === kind);
}

function activeApprovalDraftStatus(
  bucket: VmodelWorkBucket,
): VmodelHandoffArtifactStatus | undefined {
  const refresh = bucket.evidence_handoff_status?.items.find(
    (item) =>
      item.kind === "approval_refresh_draft" &&
      item.status === "present" &&
      item.approval_record?.scope_status === "match",
  );
  return refresh ?? handoffArtifactStatus(bucket, "approval_draft");
}

function activeApprovalDraftForAction(
  artifacts: VisualizationViewModel["project"]["current_location"]["recovery_handoff_artifacts"],
  action: string,
): ProjectHandoffArtifactStatus | undefined {
  const actionArtifacts = artifacts.items.filter((item) => item.action === action);
  const refresh = actionArtifacts.find(
    (item) =>
      item.kind === "approval_refresh_draft" &&
      item.status === "present" &&
      item.approval_record?.scope_status === "match",
  );
  return refresh ?? actionArtifacts.find((item) => item.kind === "approval_draft");
}

function handoffNextCommand(bucket: VmodelWorkBucket): string {
  return bucket.evidence_handoff_next?.command ?? bucket.evidence_probe_command;
}

function metricRows(parentId: string, rows: MetricRow[]): TreeViewNode[] {
  return rows.map((row) =>
    node({
      id: `${parentId}/${row.label}`,
      label: row.label,
      description: String(row.value),
      tooltip: row.drilldown?.pointer,
      contextValue: row.drilldown ? "metric.copyable" : "metric",
      commandPointer: row.drilldown?.pointer,
    }),
  );
}

function boundaryNode(
  prefix: "project" | "harness",
  boundary: VisualizationViewModel["view_boundaries"]["project"],
): TreeViewNode {
  return node({
    id: `${prefix}/view-boundary`,
    label: "View boundary",
    description: boundary.owned_views.join(","),
    tooltip: tooltipLines([
      boundary.scope,
      `source=${boundary.source_fields.join(",")}`,
      `excluded=${boundary.excluded_fields.join(",") || "-"}`,
    ]),
    contextValue: `view-boundary.${boundary.root}`,
    commandPointer: boundary.view_command,
    children: [
      node({
        id: `${prefix}/view-boundary/source-fields`,
        label: "source fields",
        description: String(boundary.source_fields.length),
        tooltip: boundary.source_fields.join("\n"),
        contextValue: `view-boundary.${boundary.root}.source`,
      }),
      node({
        id: `${prefix}/view-boundary/excluded-fields`,
        label: "excluded fields",
        description: String(boundary.excluded_fields.length),
        tooltip: boundary.excluded_fields.join("\n"),
        contextValue: `view-boundary.${boundary.root}.excluded`,
      }),
    ],
  });
}

function projectCurrentLocation(vm: VisualizationViewModel): TreeViewNode {
  const current = vm.project.current_location;
  const recoveryReentryStatus =
    current.recovery_exit.reentry_forecast.effective_status ??
    current.recovery_exit.reentry_forecast.status;
  const closeReadyReviewWindows = current.closure.apply_readiness.review_window_index;
  const vmodelFitReentryStatus =
    current.vmodel_fit.reentry_forecast.effective_status ??
    current.vmodel_fit.reentry_forecast.status;
  const vmodelFitSynthesisReentryStatus =
    current.vmodel_fit.synthesis.effective_reentry_status ??
    current.vmodel_fit.synthesis.current_reentry_status;
  const children = [
    node({
      id: "project/current-location/drive",
      label: "Drive model",
      description: `${current.drive_model} / ${current.drive_route.status}`,
      tooltip: current.drive_reason,
      contextValue: "current-location.drive",
      children: [
        node({
          id: "project/current-location/drive/current-location-frontier",
          label: "current-location frontier",
          description: `${current.current_location_frontier.frontier_type} / ${current.current_location_frontier.classification}`,
          tooltip: tooltipLines([
            `status=${current.current_location_frontier.status}`,
            `boundary=${current.current_location_frontier.completion_boundary}`,
            `route=${current.current_location_frontier.route_id}`,
            `return_to_design=${current.current_location_frontier.must_return_to_design}`,
            `open_l7=${current.current_location_frontier.open_l7_count}`,
            `terminal_l14=${current.current_location_frontier.terminal_l14_claim_count}`,
            `queue=${current.current_location_frontier.queue_total}`,
            `selected_action=${current.current_location_frontier.selected_closure_action ?? "-"}`,
            `next=${current.current_location_frontier.reentry.next_command}`,
            current.current_location_frontier.required_action,
          ]),
          contextValue: `current-location.frontier.${current.current_location_frontier.frontier_type}`,
          commandPointer: current.current_location_frontier.commands.project_frontier,
          children: [
            node({
              id: "project/current-location/drive/current-location-frontier/open-l7",
              label: "open L7",
              description: String(current.current_location_frontier.open_l7_count),
              tooltip: current.current_location_frontier.sample_open_l7_plan_ids.join("\n"),
              contextValue: "current-location.frontier.open-l7",
            }),
            node({
              id: "project/current-location/drive/current-location-frontier/l14-claims",
              label: "L14 claims",
              description: String(current.current_location_frontier.terminal_l14_claim_count),
              tooltip: current.current_location_frontier.sample_terminal_l14_plan_ids.join("\n"),
              contextValue: "current-location.frontier.l14-claims",
            }),
            node({
              id: "project/current-location/drive/current-location-frontier/reentry",
              label: "reentry",
              description: `${current.current_location_frontier.reentry.status} -> ${current.current_location_frontier.reentry.next_gate}`,
              tooltip: tooltipLines([
                `next_action=${current.current_location_frontier.reentry.next_phase_action ?? "-"}`,
                `command=${current.current_location_frontier.reentry.next_command}`,
                `execute=${current.current_location_frontier.reentry.next_execution_command}`,
              ]),
              contextValue: `current-location.frontier.reentry.${current.current_location_frontier.reentry.status}`,
              commandPointer: current.current_location_frontier.reentry.next_command,
            }),
          ],
        }),
        node({
          id: "project/current-location/drive/model-candidates",
          label: "model candidates",
          description: "helix drive model --json",
          tooltip:
            "Forward spine + 10 entry drive models + OperationVerification の候補と blocker を表示する read-only report",
          contextValue: "drive-model.candidates",
          commandPointer: "helix drive model --json",
          children: current.drive_model_candidates.map((candidate) =>
            node({
              id: `project/current-location/drive/model-candidates/${candidate.rank}-${candidate.model}`,
              label: candidate.model,
              description: `${candidate.status} ${candidate.coverage_ids.join(",") || "-"}`,
              tooltip: tooltipLines([
                `trigger=${candidate.trigger}`,
                `action=${candidate.required_action}`,
                `route=${candidate.route_id}`,
                `command=${candidate.command}`,
                `docs=${candidate.doc_dependencies.join(",") || "-"}`,
                `impl=${candidate.implementation_dependencies.join(",") || "-"}`,
                ...candidate.reasons,
              ]),
              contextValue: `drive-model.candidate.${candidate.status}`,
              commandPointer: candidate.command,
            }),
          ),
        }),
        node({
          id: "project/current-location/drive/recovery-plan",
          label: "recovery plan",
          description: `${current.recovery_exit.status} remaining=${current.recovery_exit.remaining_queue_items} handoff=${current.recovery_exit.handoff_gate.status}`,
          tooltip: tooltipLines([
            current.recovery_exit.expected_transition,
            `next=${current.recovery_exit.next_command}`,
            `handoff=${current.recovery_exit.handoff_gate.status}`,
            `handoff_phase=${current.recovery_exit.handoff_gate.effective_phase}`,
            `approval=${current.recovery_exit.handoff_gate.approval_status ?? "-"}`,
            `scope=${current.recovery_exit.handoff_gate.scope_status ?? "-"}`,
            `approval_record_path=${current.recovery_exit.handoff_gate.approval_record_path ?? "-"}`,
            ...current.recovery_exit.blockers,
          ]),
          contextValue: "drive-model.recovery-plan",
          commandPointer: "helix recovery plan --json",
          children: [
            node({
              id: "project/current-location/drive/recovery-plan/exit-forecast",
              label: "exit forecast",
              description: `${current.recovery_exit.status} remaining=${current.recovery_exit.remaining_queue_items} lanes=${current.recovery_exit.blocking_lanes.join(",") || "-"}`,
              tooltip: tooltipLines([
                current.recovery_exit.expected_transition,
                `next=${current.recovery_exit.next_command}`,
                ...current.recovery_exit.blockers,
              ]),
              contextValue: `recovery-plan.exit.${current.recovery_exit.status}`,
              commandPointer: current.recovery_exit.next_command || "helix recovery plan --json",
              children: current.closure_overview.actions
                .filter((action) => current.recovery_exit.blocking_lanes.includes(action.action))
                .map((action) =>
                  node({
                    id: `project/current-location/drive/recovery-plan/exit-forecast/${action.action}`,
                    label: action.action,
                    description: `${action.count} human=${action.human_required}`,
                    tooltip: `${action.required_action ?? "-"}\n${action.review_command}\n${action.transition_command}`,
                    contextValue: `recovery-plan.exit-lane.${action.action}`,
                    commandPointer: action.review_command,
                  }),
                ),
            }),
            node({
              id: "project/current-location/drive/recovery-plan/handoff-gate",
              label: "handoff gate",
              description: `${current.recovery_exit.handoff_gate.status} phase=${current.recovery_exit.handoff_gate.effective_phase} approval=${current.recovery_exit.handoff_gate.approval_status ?? "-"} scope=${current.recovery_exit.handoff_gate.scope_status ?? "-"}`,
              tooltip: tooltipLines([
                current.recovery_exit.handoff_gate.required_action,
                `command=${current.recovery_exit.handoff_gate.command}`,
                `decision=${current.recovery_exit.handoff_gate.decision_id ?? "-"}`,
                `outcome=${current.recovery_exit.handoff_gate.outcome ?? "-"}`,
                `approval_record_path=${current.recovery_exit.handoff_gate.approval_record_path ?? "-"}`,
                `digest=${current.recovery_exit.handoff_gate.approval_scope_digest ?? "-"}`,
                `expected_digest=${current.recovery_exit.handoff_gate.expected_approval_scope_digest ?? "-"}`,
                `materialize=${current.recovery_exit.handoff_gate.materialize_status ?? "-"}`,
                `valid_for_apply=${current.recovery_exit.handoff_gate.valid_for_apply}`,
                ...current.recovery_exit.handoff_gate.reasons,
              ]),
              contextValue: `recovery-plan.handoff-gate.${current.recovery_exit.handoff_gate.effective_phase}.${current.recovery_exit.handoff_gate.status}.approval-${current.recovery_exit.handoff_gate.approval_state}`,
              commandPointer: current.recovery_exit.handoff_gate.command,
            }),
            node({
              id: "project/current-location/drive/recovery-plan/reentry-forecast",
              label: "reentry forecast",
              description: `${recoveryReentryStatus} raw=${current.recovery_exit.reentry_forecast.status} blocking=${current.recovery_exit.reentry_forecast.current_blocking_count}`,
              tooltip: `${current.recovery_exit.reentry_forecast.expected_transition}\nraw=${current.recovery_exit.reentry_forecast.status}\neffective=${recoveryReentryStatus}\nafter_machine=${current.recovery_exit.reentry_forecast.blocking_after_machine_lanes}\nphases=${current.recovery_exit.reentry_forecast.required_phase_count}\nnext=${current.recovery_exit.reentry_forecast.next_phase_action ?? "-"}\ngate=${current.recovery_exit.reentry_forecast.next_gate}\ncommand=${current.recovery_exit.reentry_forecast.next_command}\nexecute=${current.recovery_exit.reentry_forecast.next_execution_command}\nrecompute=${current.recovery_exit.reentry_forecast.recompute_commands.join(" && ")}\n${current.recovery_exit.reentry_forecast.reasons.join("\n")}`,
              contextValue: `recovery-plan.reentry.${recoveryReentryStatus}.raw-${current.recovery_exit.reentry_forecast.status}`,
              commandPointer: current.recovery_exit.reentry_forecast.next_execution_command,
            }),
            node({
              id: "project/current-location/drive/recovery-plan/automation-runway",
              label: "automation runway",
              description: `${current.recovery_exit.automation_runway.status} machine=${current.recovery_exit.automation_runway.machine_actionable_count} approval=${current.recovery_exit.automation_runway.human_approval_count}`,
              tooltip: `${current.recovery_exit.automation_runway.expected_transition}\nnext=${current.recovery_exit.automation_runway.next_machine_command ?? "-"}\nnext_probe=${current.recovery_exit.automation_runway.next_machine_probe_command ?? "-"}\nmaterialize=${current.recovery_exit.automation_runway.next_machine_materialize_command ?? "-"}\napproval_draft=${current.recovery_exit.automation_runway.next_machine_approval_draft_command ?? "-"}\napply_dry_run=${current.recovery_exit.automation_runway.next_machine_apply_dry_run_command ?? "-"}\nafter_machine=${current.recovery_exit.automation_runway.remaining_after_machine_lanes}\ntables=${current.recovery_exit.automation_runway.target_tables.join(",") || "-"}\n${current.recovery_exit.automation_runway.reasons.join("\n")}`,
              contextValue: `recovery-plan.automation-runway.${current.recovery_exit.automation_runway.status}`,
              commandPointer:
                current.recovery_exit.automation_runway.next_machine_probe_command ??
                current.recovery_exit.automation_runway.next_machine_command ??
                "helix recovery plan --json",
              children: current.recovery_exit.automation_runway.phases.map((phase) =>
                node({
                  id: `project/current-location/drive/recovery-plan/automation-runway/${phase.sequence}-${phase.action}`,
                  label: `${phase.sequence}. ${phase.action}`,
                  description: `${phase.phase_type} count=${phase.count} remaining=${phase.remaining_after_phase}`,
                  tooltip: `${phase.expected_transition}\nhuman=${phase.human_required}\nnext_gate=${phase.next_gate}\ncommand=${phase.command}\nprobe=${phase.evidence_probe_command ?? "-"}\nmaterialize=${phase.evidence_materialize_command ?? "-"}\napproval_draft=${phase.evidence_approval_draft_command ?? "-"}\napply_dry_run=${phase.evidence_apply_dry_run_command ?? "-"}\ntables=${phase.target_tables.join(",") || "-"}\npostcheck=${phase.postcheck_commands.join(" && ") || "-"}`,
                  contextValue: `recovery-plan.automation-runway.phase.${phase.phase_type}`,
                  commandPointer: phase.evidence_probe_command ?? phase.command,
                  children: phase.evidence_handoff_artifacts
                    ? [
                        node({
                          id: `project/current-location/drive/recovery-plan/automation-runway/${phase.sequence}-${phase.action}/probe-record`,
                          label: "probe record",
                          description: phase.evidence_handoff_artifacts.probe_record_path,
                          tooltip: `evidence-probe --out が生成する工程間 artifact\nwrite=${phase.evidence_handoff_artifacts.write_policy}`,
                          contextValue: "recovery-plan.handoff.probe-record",
                          commandPointer: phase.evidence_handoff_artifacts.probe_record_path,
                        }),
                        node({
                          id: `project/current-location/drive/recovery-plan/automation-runway/${phase.sequence}-${phase.action}/approval-draft`,
                          label: "approval draft",
                          description: artifactStatusDescription(
                            activeApprovalDraftForAction(
                              current.recovery_handoff_artifacts,
                              phase.action,
                            ),
                            phase.evidence_handoff_artifacts.approval_draft_path,
                          ),
                          tooltip: artifactStatusTooltip(
                            activeApprovalDraftForAction(
                              current.recovery_handoff_artifacts,
                              phase.action,
                            ),
                            phase.evidence_handoff_artifacts.approval_draft_path,
                            phase.evidence_handoff_artifacts.write_policy,
                          ),
                          contextValue: "recovery-plan.handoff.approval-draft",
                          commandPointer:
                            activeApprovalDraftForAction(
                              current.recovery_handoff_artifacts,
                              phase.action,
                            )?.path ?? phase.evidence_handoff_artifacts.approval_draft_path,
                        }),
                      ]
                    : [],
                }),
              ),
            }),
            node({
              id: "project/current-location/drive/recovery-plan/automation-boundaries",
              label: "automation boundaries",
              description:
                current.recovery_exit.automation_boundaries
                  .filter((boundary) => boundary.count > 0)
                  .map((boundary) => `${boundary.automation_class}:${boundary.count}`)
                  .join(",") || "not-required",
              tooltip: current.recovery_exit.automation_boundaries
                .filter((boundary) => boundary.count > 0)
                .map(
                  (boundary) =>
                    `${boundary.action}: mutation=${boundary.mutation_allowed} approval=${boundary.approval_required} patch=${boundary.evidence_patch_write_policy ?? "-"}\n${boundary.safety_policy}\n${boundary.dry_run_command}\n${boundary.evidence_patch_command ?? boundary.execute_command ?? boundary.batch_command}`,
                )
                .join("\n\n"),
              contextValue: "recovery-plan.automation-boundaries",
              commandPointer: "helix recovery plan --json",
              children: current.recovery_exit.automation_boundaries
                .filter((boundary) => boundary.count > 0)
                .map((boundary) =>
                  node({
                    id: `project/current-location/drive/recovery-plan/automation-boundaries/${boundary.action}`,
                    label: boundary.action,
                    description: `${boundary.automation_class} mutation=${boundary.mutation_allowed} approval=${boundary.approval_required} patch=${boundary.evidence_patch_write_policy ?? "-"}`,
                    tooltip: `${boundary.safety_policy}\nrecord=${boundary.required_record ?? "-"}\ndry-run=${boundary.dry_run_command}\nreview=${boundary.review_command}\nevidence-patch=${boundary.evidence_patch_command ?? "-"}\nexecute=${boundary.execute_command ?? "-"}`,
                    contextValue: `recovery-plan.automation.${boundary.automation_class}`,
                    commandPointer:
                      boundary.evidence_patch_command ?? boundary.evidence_plan_command,
                  }),
                ),
            }),
            ...current.closure_overview.actions
              .filter((action) => action.count > 0)
              .map((action) =>
                node({
                  id: `project/current-location/drive/recovery-plan/${action.action}`,
                  label: action.action,
                  description: `${action.count} ${action.ledger_status ?? "untracked"} human=${action.human_required}`,
                  tooltip: `${action.required_action ?? "-"}\n${action.action === "close_ready" ? action.review_command : `helix closure batch --action ${action.action} --summary-json`}\n${action.transition_command}`,
                  contextValue: `recovery-plan.lane.${action.ledger_status ?? "untracked"}`,
                  commandPointer:
                    action.action === "close_ready"
                      ? action.review_command
                      : `helix closure batch --action ${action.action} --summary-json`,
                }),
              ),
          ],
        }),
        node({
          id: "project/current-location/drive/route",
          label: current.drive_route.route_id,
          description: current.drive_route.must_return_to_design
            ? `return-to-design ${current.drive_route.reverse.coverage_ids.join(",") || "-"}`
            : `forward ${current.drive_route.forward.coverage_ids.join(",") || "-"}`,
          tooltip: `${current.drive_route.reason}\nreverse_coverage=${current.drive_route.reverse.coverage_ids.join(",") || "-"}\nforward_coverage=${current.drive_route.forward.coverage_ids.join(",") || "-"}\n${current.drive_route.reasons.join("; ")}`,
          contextValue: `drive-route.${current.drive_route.status}`,
          commandPointer: current.drive_route.source_command,
        }),
        node({
          id: "project/current-location/drive/reverse",
          label: "reverse scope",
          description: current.drive_route.reverse.required
            ? `${current.drive_route.reverse.l12_layers.join("/")} ${current.drive_route.reverse.coverage_ids.join(",") || "-"} actions=${current.drive_route.reverse.queue_actions.join(",") || "-"}`
            : "not-required",
          tooltip: tooltipLines(
            [
              `coverage=${current.drive_route.reverse.coverage_ids.join(",") || "-"}`,
              ...current.drive_route.reverse.coverage_labels.map(
                (label) => `coverage_label=${label}`,
              ),
              ...current.drive_route.reverse.targets.map((target) => `target=${target}`),
              ...current.drive_route.reverse.doc_dependencies.map(
                (dependency) => `doc=${dependency}`,
              ),
              ...current.drive_route.reverse.implementation_dependencies.map(
                (dependency) => `impl=${dependency}`,
              ),
            ],
            { limit: 29, omittedHint: current.drive_route.source_command },
          ),
          contextValue: current.drive_route.reverse.required
            ? "drive-route.reverse.required"
            : "drive-route.reverse.not-required",
          commandPointer: current.drive_route.source_command,
          children: [
            node({
              id: "project/current-location/drive/reverse/doc-dependencies",
              label: "doc dependencies",
              description: String(current.drive_route.reverse.doc_dependencies.length),
              tooltip: tooltipLines(
                [
                  ...current.drive_route.reverse.targets.map((target) => `target=${target}`),
                  ...current.drive_route.reverse.doc_dependencies,
                ],
                { omittedHint: current.drive_route.source_command },
              ),
              contextValue: "drive-route.reverse.docs",
              commandPointer: current.drive_route.source_command,
            }),
            node({
              id: "project/current-location/drive/reverse/implementation-dependencies",
              label: "implementation dependencies",
              description: String(current.drive_route.reverse.implementation_dependencies.length),
              tooltip: tooltipLines(current.drive_route.reverse.implementation_dependencies, {
                omittedHint: current.drive_route.source_command,
              }),
              contextValue: "drive-route.reverse.impl",
              commandPointer: current.drive_route.source_command,
            }),
            node({
              id: "project/current-location/drive/reverse/closure-links",
              label: "closure links",
              description: `${current.drive_route.reverse.queue_actions.length}/${current.drive_route.reverse.ledger_ids.length}`,
              tooltip: tooltipLines([
                ...current.drive_route.reverse.queue_actions.map((action) => `action=${action}`),
                ...current.drive_route.reverse.ledger_ids.map((ledger) => `ledger=${ledger}`),
                ...current.drive_route.reverse.acceptance_criteria.map(
                  (criteria) => `acceptance=${criteria}`,
                ),
              ]),
              contextValue: "drive-route.reverse.closure",
              commandPointer: current.drive_route.source_command,
            }),
          ],
        }),
        node({
          id: "project/current-location/drive/forward",
          label: "forward scope",
          description: current.drive_route.forward.allowed
            ? `${current.drive_route.forward.roadmap_status} ${current.drive_route.forward.coverage_ids.join(",") || "-"}`
            : "blocked",
          tooltip: [
            `coverage=${current.drive_route.forward.coverage_ids.join(",") || "-"}`,
            ...current.drive_route.forward.coverage_labels.map(
              (label) => `coverage_label=${label}`,
            ),
            ...current.drive_route.forward.frontier,
            ...current.drive_route.forward.current_band_ids,
            ...current.drive_route.forward.current_gate_ids,
          ].join("\n"),
          contextValue: current.drive_route.forward.allowed
            ? "drive-route.forward.allowed"
            : "drive-route.forward.blocked",
          commandPointer: current.drive_route.view_command,
        }),
      ],
    }),
    node({
      id: "project/current-location/coverage",
      label: "L12 coverage",
      description: `done=${current.coverage_counts.done} missing=${current.coverage_counts.missing} reverify=${current.coverage_counts.reverify}`,
      contextValue: "current-location.coverage-summary",
      children: current.l12_coverage.map((layer) =>
        node({
          id: `project/current-location/coverage/${layer.layer}`,
          label: `${layer.layer} ${layer.label}`,
          description: layer.status,
          tooltip: layer.reasons.join("; "),
          contextValue: `l12-coverage.${layer.status}`,
          children: [
            node({
              id: `project/current-location/coverage/${layer.layer}/legacy`,
              label: "legacy layers",
              description: layer.legacy_layers.join(",") || "-",
              contextValue: "l12-coverage.detail",
            }),
            node({
              id: `project/current-location/coverage/${layer.layer}/plans`,
              label: "plans",
              description: String(layer.plan_ids.length),
              tooltip: tooltipLines(layer.plan_ids, {
                omittedHint: "helix current-location --summary-json",
              }),
              contextValue: "l12-coverage.detail",
            }),
            node({
              id: `project/current-location/coverage/${layer.layer}/design`,
              label: "design declarations",
              description: String(layer.design_ids.length),
              tooltip: tooltipLines(layer.design_ids, {
                omittedHint: "helix current-location --summary-json",
              }),
              contextValue: "l12-coverage.detail",
            }),
            node({
              id: `project/current-location/coverage/${layer.layer}/test-design`,
              label: "test-design declarations",
              description: String(layer.test_design_ids.length),
              tooltip: tooltipLines(layer.test_design_ids, {
                omittedHint: "helix current-location --summary-json",
              }),
              contextValue: "l12-coverage.detail",
            }),
          ],
        }),
      ),
    }),
    node({
      id: "project/current-location/l12-compatibility",
      label: "L12 compatibility",
      description: `${current.l12_compatibility.status} layers=${current.l12_compatibility.layers}/${current.l12_compatibility.expected_layers}`,
      tooltip: tooltipLines(current.l12_compatibility.reasons),
      contextValue: `current-location.l12-compatibility.${current.l12_compatibility.status}`,
      commandPointer: current.l12_compatibility.command,
      children: current.l12_compatibility.pairs.map((pair) =>
        node({
          id: `project/current-location/l12-compatibility/${pair.label}`,
          label: pair.label,
          description: `${pair.status} ${pair.legacy_layer}->${pair.l12_layer} ${pair.matched}/${pair.observed}`,
          tooltip: tooltipLines([...pair.reasons, ...pair.sample_artifact_ids], {
            omittedHint: current.l12_compatibility.command,
          }),
          contextValue: `l12-compatibility.${pair.status}`,
          commandPointer: current.l12_compatibility.command,
        }),
      ),
    }),
    node({
      id: "project/current-location/recovery-handoff-artifacts",
      label: "Recovery handoff artifacts",
      description: `present=${current.recovery_handoff_artifacts.present} missing=${current.recovery_handoff_artifacts.missing} unchecked=${current.recovery_handoff_artifacts.unchecked}`,
      tooltip:
        "closure evidence-probe / approval-draft が生成する local handoff artifact の実在検出",
      contextValue: "current-location.recovery-handoff-artifacts",
      children: current.recovery_handoff_artifacts.items.map((item) =>
        node({
          id: `project/current-location/recovery-handoff-artifacts/${item.action}/${item.kind}`,
          label: `${item.action} ${item.kind}`,
          description: `${item.status} ${item.generation_status} ${item.bytes ?? "-"}B`,
          tooltip: tooltipLines([
            item.path,
            item.sha256 ?? "-",
            `generate=${item.generation_command ?? "-"}`,
            `write=${item.write_policy}`,
            item.approval_record ? `approval=${item.approval_record.status}` : null,
            item.approval_record?.outcome ? `outcome=${item.approval_record.outcome}` : null,
            item.approval_record ? `scope=${item.approval_record.scope_status}` : null,
            item.approval_record?.approval_scope_digest
              ? `approval_scope_digest=${item.approval_record.approval_scope_digest}`
              : null,
            item.approval_record?.expected_approval_scope_digest
              ? `expected=${item.approval_record.expected_approval_scope_digest}`
              : null,
            ...item.reasons,
          ]),
          contextValue: `recovery-handoff-artifact.${item.status}`,
          commandPointer:
            item.status === "present" ? item.path : (item.generation_command ?? item.path),
        }),
      ),
    }),
    node({
      id: "project/current-location/design-coverage-gate",
      label: "Design coverage gate",
      description: `${current.design_coverage_gate.status} covered=${current.design_coverage_gate.covered} missing=${current.design_coverage_gate.missing} reverify=${current.design_coverage_gate.reverify}`,
      tooltip: tooltipLines(current.design_coverage_gate.doc_dependencies, {
        omittedHint: "helix current-location --summary-json",
      }),
      contextValue: `design-coverage-gate.${current.design_coverage_gate.status}`,
      children: current.design_coverage_gate.items.map((item) =>
        node({
          id: `project/current-location/design-coverage-gate/${item.coverage_id}`,
          label: `${item.l12_layer} ${item.label}`,
          description: `${item.status} route=${item.return_route}`,
          tooltip: `${item.required_kinds.join(",")}\n${item.reasons.join("; ")}\n${item.declaration_ids.join("\n")}`,
          contextValue: `design-coverage.${item.status}.${item.return_route.toLowerCase()}`,
          commandPointer: item.source_paths[0] ?? "helix current-location --json",
        }),
      ),
    }),
    node({
      id: "project/current-location/acceptance-traceability",
      label: "Acceptance traceability",
      description: `${current.acceptance_traceability.status} linked=${current.acceptance_traceability.linked}/${current.acceptance_traceability.total} declared=${current.acceptance_traceability.declared} missing=${current.acceptance_traceability.missing}`,
      tooltip: tooltipLines(
        [
          current.acceptance_traceability.source_document,
          ...current.acceptance_traceability.doc_dependencies,
        ],
        { omittedHint: "helix current-location --summary-json" },
      ),
      contextValue: `current-location.acceptance-traceability.${current.acceptance_traceability.status}`,
      commandPointer: "helix current-location --summary-json",
      children: current.acceptance_traceability.items.map((item) =>
        node({
          id: `project/current-location/acceptance-traceability/${item.acceptance_id}`,
          label: item.acceptance_id,
          description: `${item.status} -> ${item.requirement_id}`,
          tooltip: tooltipLines([
            ...item.reasons,
            ...item.reference_statuses.map((status) => `reference=${status}`),
            ...item.source_paths,
          ]),
          contextValue: `acceptance-traceability.${item.status}`,
          commandPointer: item.source_paths[0] ?? "helix current-location --json",
        }),
      ),
    }),
    node({
      id: "project/current-location/design-impact",
      label: "Design impact",
      description: `impact=${current.projection_counts.design_impact} refs=${current.projection_counts.design_references}`,
      tooltip: `declarations=${current.projection_counts.design_declarations}\nreferences=${current.projection_counts.design_references}\nimpact=${current.projection_counts.design_impact}\nunresolved=${current.projection_counts.unresolved_design_references}\ndrift=${current.projection_counts.design_declaration_drifts}`,
      contextValue:
        current.projection_counts.unresolved_design_references > 0 ||
        current.projection_counts.design_declaration_drifts > 0
          ? "current-location.design-impact.unresolved"
          : "current-location.design-impact.resolved",
      children: [
        node({
          id: "project/current-location/design-impact/declarations",
          label: "declarations",
          description: String(current.projection_counts.design_declarations),
          contextValue: "design-impact.count",
          commandPointer: "helix current-location --summary-json",
        }),
        node({
          id: "project/current-location/design-impact/references",
          label: "references",
          description: String(current.projection_counts.design_references),
          contextValue: "design-impact.count",
          commandPointer: "helix current-location --summary-json",
        }),
        node({
          id: "project/current-location/design-impact/impact",
          label: "impact rows",
          description: String(current.projection_counts.design_impact),
          contextValue: "design-impact.count",
          commandPointer: "helix progress tree-view --json",
        }),
        node({
          id: "project/current-location/design-impact/unresolved",
          label: "unresolved",
          description: String(current.projection_counts.unresolved_design_references),
          contextValue:
            current.projection_counts.unresolved_design_references > 0
              ? "design-impact.unresolved"
              : "design-impact.resolved",
        }),
        node({
          id: "project/current-location/design-impact/drift",
          label: "declaration drift",
          description: String(current.projection_counts.design_declaration_drifts),
          contextValue:
            current.projection_counts.design_declaration_drifts > 0
              ? "design-impact.drift"
              : "design-impact.resolved",
        }),
      ],
    }),
    node({
      id: "project/current-location/vmodel-fit",
      label: "V-model fit",
      description: `${current.vmodel_fit.status} design=${current.vmodel_fit.design_coverage_status} ac=${current.vmodel_fit.acceptance_traceability_status} zip=${current.vmodel_fit.zip_adoption_status} manifest=${current.vmodel_fit.zip_manifest_status} tailoring=${current.vmodel_fit.tailoring_gate_status} function=${current.vmodel_fit.function_design_absorption.status} roadmap=${current.vmodel_fit.roadmap_current_gate.status} drive=${current.vmodel_fit.drive_model_gate.selected_model} current=${current.vmodel_fit.current_location_status} handoff=${current.vmodel_fit.handoff_summary.status}`,
      tooltip: current.vmodel_fit.reasons.join("\n"),
      contextValue: `current-location.vmodel-fit.${current.vmodel_fit.status}`,
      commandPointer: current.vmodel_fit.source_command,
      children: [
        node({
          id: "project/current-location/vmodel-fit/synthesis",
          label: "synthesis",
          description: `${current.vmodel_fit.synthesis.status} common=${current.vmodel_fit.synthesis.common_adopted} complement=${current.vmodel_fit.synthesis.helix_complemented} reject=${current.vmodel_fit.synthesis.rejected}`,
          tooltip: `${current.vmodel_fit.synthesis.source_package}\n${current.vmodel_fit.synthesis.source_document}\ntailoring=${current.vmodel_fit.synthesis.tailoring_status}\nfunction_policy=${current.vmodel_fit.synthesis.function_design_policy}\nreentry=${current.vmodel_fit.synthesis.current_reentry_status}\neffective=${vmodelFitSynthesisReentryStatus}\nnext=${current.vmodel_fit.synthesis.next_command}\n${current.vmodel_fit.synthesis.reasons.join("\n")}`,
          contextValue: `vmodel-fit.synthesis.${current.vmodel_fit.synthesis.status}`,
          commandPointer: current.vmodel_fit.synthesis.next_command,
        }),
        node({
          id: "project/current-location/vmodel-fit/next-actions",
          label: "next actions",
          description: String(current.vmodel_fit.next_actions.length),
          tooltip: current.vmodel_fit.next_actions
            .map(
              (action) =>
                `${action.priority}.${action.blocker_code} ${action.automation_class} count=${action.count} gate=${action.gate}\n${action.command}`,
            )
            .join("\n\n"),
          contextValue:
            current.vmodel_fit.next_actions.length > 0
              ? "vmodel-fit.next-actions.present"
              : "vmodel-fit.next-actions.none",
          commandPointer:
            current.vmodel_fit.next_actions[0]?.command ?? current.vmodel_fit.source_command,
          children: current.vmodel_fit.next_actions.slice(0, 5).map((action) =>
            node({
              id: `project/current-location/vmodel-fit/next-actions/${action.priority}-${action.blocker_code}`,
              label: `${action.priority}. ${action.blocker_code}`,
              description: `${action.automation_class} count=${action.count}`,
              tooltip: `${action.required_action}\ngate=${action.gate}\n${action.reasons.join("\n")}`,
              contextValue: `vmodel-fit.next-action.${action.automation_class}`,
              commandPointer: action.command,
              children: action.work_bucket
                ? [
                    node({
                      id: `project/current-location/vmodel-fit/next-actions/${action.priority}-${action.blocker_code}/work-bucket`,
                      label: "work bucket",
                      description: `${action.work_bucket.evidence_signature} failed=${action.work_bucket.failed_evidence_count} patches=${action.work_bucket.evidence_patch_candidate_count}`,
                      tooltip: `action=${action.work_bucket.action}\ncount=${action.work_bucket.count}\nrepair=${action.work_bucket.repair_status}\nhandoff_next=${action.work_bucket.evidence_handoff_next?.status ?? "none"}\nprobe=${action.work_bucket.evidence_probe_command}\nmaterialize=${action.work_bucket.evidence_materialize_command}\napproval_draft=${action.work_bucket.evidence_approval_draft_command}\napply_dry_run=${action.work_bucket.evidence_apply_dry_run_command}\napply_execute=${action.work_bucket.evidence_apply_execute_command}\napply_write=${action.work_bucket.evidence_apply_write_policy}\npatch=${action.work_bucket.evidence_patch_command}\npatch_write=${action.work_bucket.evidence_patch_write_policy}\ntables=${action.work_bucket.target_tables.join(",") || "-"}\nplans=${action.work_bucket.sample_plan_ids.join(",") || "-"}`,
                      contextValue: `vmodel-fit.next-action.work-bucket.${action.work_bucket.repair_status}`,
                      commandPointer: handoffNextCommand(action.work_bucket),
                      children: [
                        ...(action.work_bucket.evidence_handoff_next
                          ? [
                              node({
                                id: `project/current-location/vmodel-fit/next-actions/${action.priority}-${action.blocker_code}/work-bucket/handoff-next`,
                                label: "handoff next",
                                description: `${action.work_bucket.evidence_handoff_next.status} approval=${action.work_bucket.evidence_handoff_next.approval_state} scope=${action.work_bucket.evidence_handoff_next.scope_status ?? "-"} valid=${action.work_bucket.evidence_handoff_next.valid_for_apply}`,
                                tooltip: `${action.work_bucket.evidence_handoff_next.label}\n${action.work_bucket.evidence_handoff_next.required_action}\napproval=${action.work_bucket.evidence_handoff_next.approval_state}\nscope=${action.work_bucket.evidence_handoff_next.scope_status ?? "-"}\nvalid_for_apply=${action.work_bucket.evidence_handoff_next.valid_for_apply}\n${action.work_bucket.evidence_handoff_next.reason_codes.join("\n")}\n${action.work_bucket.evidence_handoff_next.reasons.join("\n")}`,
                                contextValue: `vmodel-fit.work-bucket.handoff-next.${action.work_bucket.evidence_handoff_next.status}.approval-${action.work_bucket.evidence_handoff_next.approval_state}.scope-${action.work_bucket.evidence_handoff_next.scope_status ?? "none"}.valid-${action.work_bucket.evidence_handoff_next.valid_for_apply}`,
                                commandPointer: action.work_bucket.evidence_handoff_next.command,
                              }),
                            ]
                          : []),
                        node({
                          id: `project/current-location/vmodel-fit/next-actions/${action.priority}-${action.blocker_code}/work-bucket/probe`,
                          label: "evidence probe",
                          description: action.work_bucket.evidence_probe_command,
                          tooltip: "安全な verification command を実行し、probe record を生成する",
                          contextValue: "vmodel-fit.work-bucket.probe",
                          commandPointer: action.work_bucket.evidence_probe_command,
                        }),
                        ...(action.work_bucket.evidence_handoff_artifacts
                          ? [
                              node({
                                id: `project/current-location/vmodel-fit/next-actions/${action.priority}-${action.blocker_code}/work-bucket/probe-record`,
                                label: "probe record",
                                description: artifactStatusDescription(
                                  handoffArtifactStatus(action.work_bucket, "probe_record"),
                                  action.work_bucket.evidence_handoff_artifacts.probe_record_path,
                                ),
                                tooltip: artifactStatusTooltip(
                                  handoffArtifactStatus(action.work_bucket, "probe_record"),
                                  action.work_bucket.evidence_handoff_artifacts.probe_record_path,
                                  action.work_bucket.evidence_handoff_artifacts.write_policy,
                                ),
                                contextValue: "vmodel-fit.work-bucket.handoff.probe-record",
                                commandPointer:
                                  handoffArtifactStatus(action.work_bucket, "probe_record")?.path ??
                                  action.work_bucket.evidence_handoff_artifacts.probe_record_path,
                              }),
                              node({
                                id: `project/current-location/vmodel-fit/next-actions/${action.priority}-${action.blocker_code}/work-bucket/approval-draft-artifact`,
                                label: "approval draft artifact",
                                description: artifactStatusDescription(
                                  activeApprovalDraftStatus(action.work_bucket),
                                  action.work_bucket.evidence_handoff_artifacts.approval_draft_path,
                                ),
                                tooltip: artifactStatusTooltip(
                                  activeApprovalDraftStatus(action.work_bucket),
                                  action.work_bucket.evidence_handoff_artifacts.approval_draft_path,
                                  action.work_bucket.evidence_handoff_artifacts.write_policy,
                                ),
                                contextValue: "vmodel-fit.work-bucket.handoff.approval-draft",
                                commandPointer:
                                  activeApprovalDraftStatus(action.work_bucket)?.path ??
                                  action.work_bucket.evidence_handoff_artifacts.approval_draft_path,
                              }),
                            ]
                          : []),
                        node({
                          id: `project/current-location/vmodel-fit/next-actions/${action.priority}-${action.blocker_code}/work-bucket/materialize`,
                          label: "materialize",
                          description: action.work_bucket.evidence_materialize_command,
                          tooltip:
                            "probe record から placeholder を埋め、承認対象 preview を生成する",
                          contextValue: "vmodel-fit.work-bucket.materialize",
                          commandPointer: action.work_bucket.evidence_materialize_command,
                        }),
                        node({
                          id: `project/current-location/vmodel-fit/next-actions/${action.priority}-${action.blocker_code}/work-bucket/approval-draft`,
                          label: "approval draft",
                          description: action.work_bucket.evidence_approval_draft_command,
                          tooltip: "非承認 pending_human_review record を生成する",
                          contextValue: "vmodel-fit.work-bucket.approval-draft",
                          commandPointer: action.work_bucket.evidence_approval_draft_command,
                        }),
                        node({
                          id: `project/current-location/vmodel-fit/next-actions/${action.priority}-${action.blocker_code}/work-bucket/apply-dry-run`,
                          label: "apply dry-run",
                          description: action.work_bucket.evidence_apply_dry_run_command,
                          tooltip: "人間承認 record と materialized evidence の照合だけを確認する",
                          contextValue: "vmodel-fit.work-bucket.apply-dry-run",
                          commandPointer: action.work_bucket.evidence_apply_dry_run_command,
                        }),
                      ],
                    }),
                  ]
                : [],
            }),
          ),
        }),
        node({
          id: "project/current-location/vmodel-fit/handoff-summary",
          label: "handoff summary",
          description: `${current.vmodel_fit.handoff_summary.status} total=${current.vmodel_fit.handoff_summary.total} approval=${current.vmodel_fit.handoff_summary.approval_pending + current.vmodel_fit.handoff_summary.approval_required + current.vmodel_fit.handoff_summary.approval_rejected} mismatch=${current.vmodel_fit.handoff_summary.scope_mismatch} apply=${current.vmodel_fit.handoff_summary.apply_ready}`,
          tooltip: tooltipLines([
            `machine_pending=${current.vmodel_fit.handoff_summary.machine_pending}`,
            `approval_pending=${current.vmodel_fit.handoff_summary.approval_pending}`,
            `approval_required=${current.vmodel_fit.handoff_summary.approval_required}`,
            `approval_rejected=${current.vmodel_fit.handoff_summary.approval_rejected}`,
            `apply_ready=${current.vmodel_fit.handoff_summary.apply_ready}`,
            `unchecked=${current.vmodel_fit.handoff_summary.unchecked}`,
            `unavailable=${current.vmodel_fit.handoff_summary.unavailable}`,
            `scope_match=${current.vmodel_fit.handoff_summary.scope_match}`,
            `scope_mismatch=${current.vmodel_fit.handoff_summary.scope_mismatch}`,
            `scope_missing=${current.vmodel_fit.handoff_summary.scope_missing}`,
            `valid_for_apply=${current.vmodel_fit.handoff_summary.valid_for_apply}`,
            `invalid_for_apply=${current.vmodel_fit.handoff_summary.invalid_for_apply}`,
            `commands=${current.vmodel_fit.handoff_summary.commands.join(" && ") || "-"}`,
            ...current.vmodel_fit.handoff_summary.reason_codes,
            ...current.vmodel_fit.handoff_summary.reasons,
          ]),
          contextValue: `vmodel-fit.handoff-summary.${current.vmodel_fit.handoff_summary.status}.mismatch-${current.vmodel_fit.handoff_summary.scope_mismatch}.apply-${current.vmodel_fit.handoff_summary.apply_ready}`,
          commandPointer:
            current.vmodel_fit.handoff_summary.commands[0] ?? current.vmodel_fit.source_command,
        }),
        node({
          id: "project/current-location/vmodel-fit/regression-guards",
          label: "regression guards",
          description: `${current.vmodel_fit.regression_guards.status} attention=${current.vmodel_fit.regression_guards.attention_boundary.status} pass=${current.vmodel_fit.regression_guards.pass} watch=${current.vmodel_fit.regression_guards.watch} fail=${current.vmodel_fit.regression_guards.fail}`,
          tooltip: tooltipLines([
            "db=project_vmodel_regression_guards",
            `attention=${current.vmodel_fit.regression_guards.attention_boundary.status}`,
            `blocked_by=${current.vmodel_fit.regression_guards.attention_boundary.completion_claim_blocked_by}`,
            `machine_guards=${current.vmodel_fit.regression_guards.attention_boundary.machine_guard_count}`,
            `human_guards=${current.vmodel_fit.regression_guards.attention_boundary.human_approval_guard_count}`,
            `machine=${current.vmodel_fit.regression_guards.attention_boundary.machine_actionable_count}`,
            `approval=${current.vmodel_fit.regression_guards.attention_boundary.human_approval_count}`,
            `reverse=${current.vmodel_fit.regression_guards.attention_boundary.design_reverse_count}`,
            `findings=${current.vmodel_fit.regression_guards.attention_boundary.blocked_by_findings_count}`,
            `next=${current.vmodel_fit.regression_guards.attention_boundary.next_command}`,
            ...current.vmodel_fit.regression_guards.guards.map(
              (guard) =>
                `${guard.guard_id}:${guard.status} count=${guard.count} ${guard.required_action}`,
            ),
          ]),
          contextValue: `vmodel-fit.regression-guards.${current.vmodel_fit.regression_guards.status}`,
          commandPointer: current.vmodel_fit.source_command,
          children: [
            node({
              id: "project/current-location/vmodel-fit/regression-guards/attention-boundary",
              label: "attention boundary",
              description: `${current.vmodel_fit.regression_guards.attention_boundary.status} blocked_by=${current.vmodel_fit.regression_guards.attention_boundary.completion_claim_blocked_by}`,
              tooltip: tooltipLines([
                `machine_guards=${current.vmodel_fit.regression_guards.attention_boundary.machine_guard_count}`,
                `human_guards=${current.vmodel_fit.regression_guards.attention_boundary.human_approval_guard_count}`,
                `machine=${current.vmodel_fit.regression_guards.attention_boundary.machine_actionable_count}`,
                `approval=${current.vmodel_fit.regression_guards.attention_boundary.human_approval_count}`,
                `reverse=${current.vmodel_fit.regression_guards.attention_boundary.design_reverse_count}`,
                `findings=${current.vmodel_fit.regression_guards.attention_boundary.blocked_by_findings_count}`,
                `next=${current.vmodel_fit.regression_guards.attention_boundary.next_command}`,
              ]),
              contextValue: `vmodel-fit.attention-boundary.${current.vmodel_fit.regression_guards.attention_boundary.status}`,
              commandPointer: current.vmodel_fit.regression_guards.attention_boundary.next_command,
            }),
            ...current.vmodel_fit.regression_guards.guards.map((guard) =>
              node({
                id: `project/current-location/vmodel-fit/regression-guards/${guard.guard_id}`,
                label: guard.guard_id,
                description: `${guard.status} count=${guard.count}`,
                tooltip: tooltipLines([
                  "db=project_vmodel_regression_guards",
                  guard.required_action,
                  ...guard.protected_surface,
                  ...guard.reasons,
                ]),
                contextValue: `vmodel-fit.regression-guard.${guard.status}`,
                commandPointer: guard.command,
              }),
            ),
          ],
        }),
        node({
          id: "project/current-location/vmodel-fit/design-coverage",
          label: "design coverage",
          description: current.vmodel_fit.design_coverage_status,
          contextValue: `vmodel-fit.design.${current.vmodel_fit.design_coverage_status}`,
          commandPointer: current.vmodel_fit.current_location_command,
        }),
        node({
          id: "project/current-location/vmodel-fit/zip-adoption",
          label: "ZIP adoption",
          description: current.vmodel_fit.zip_adoption_status,
          contextValue: `vmodel-fit.zip.${current.vmodel_fit.zip_adoption_status}`,
          commandPointer: current.vmodel_fit.current_location_command,
        }),
        node({
          id: "project/current-location/vmodel-fit/zip-manifest",
          label: "ZIP manifest",
          description: current.vmodel_fit.zip_manifest_status,
          contextValue: `vmodel-fit.zip-manifest.${current.vmodel_fit.zip_manifest_status}`,
          commandPointer: "helix doctor --json",
        }),
        node({
          id: "project/current-location/vmodel-fit/tailoring-gate",
          label: "tailoring gate",
          description: current.vmodel_fit.tailoring_gate_status,
          contextValue: `vmodel-fit.tailoring.${current.vmodel_fit.tailoring_gate_status}`,
          commandPointer: current.vmodel_fit.current_location_command,
        }),
        node({
          id: "project/current-location/vmodel-fit/function-design-absorption",
          label: "function design absorption",
          description: `${current.vmodel_fit.function_design_absorption.status} policy=${current.vmodel_fit.function_design_absorption.independent_layer_policy}`,
          tooltip: `${current.vmodel_fit.function_design_absorption.required_action}\ndetail=${current.vmodel_fit.function_design_absorption.detail_contract_coverage_status}\ntailoring=${current.vmodel_fit.function_design_absorption.tailoring_detail_contract_status}\n${current.vmodel_fit.function_design_absorption.absorbed_surfaces.join("\n")}`,
          contextValue: `vmodel-fit.function-design.${current.vmodel_fit.function_design_absorption.status}`,
          commandPointer: current.vmodel_fit.function_design_absorption.command,
        }),
        node({
          id: "project/current-location/vmodel-fit/roadmap-current",
          label: "roadmap current",
          description: `${current.vmodel_fit.roadmap_current_gate.status} aligned=${current.vmodel_fit.roadmap_current_gate.aligned} correlation=${current.vmodel_fit.roadmap_current_gate.recovery_correlation} basis=${current.vmodel_fit.roadmap_current_gate.alignment_basis}`,
          tooltip: `${current.vmodel_fit.roadmap_current_gate.required_action}\ndb=${current.vmodel_fit.roadmap_current_gate.db_current_l12_layer ?? "-"}\nroadmap=${current.vmodel_fit.roadmap_current_gate.roadmap_current_l12_layers.join(",") || "-"}\nprojected=${current.vmodel_fit.roadmap_current_gate.roadmap_projected_l12_layers.join(",") || "-"}\nterminal=${current.vmodel_fit.roadmap_current_gate.roadmap_terminal_l12_layers.join(",") || "-"}\ncorrelation=${current.vmodel_fit.roadmap_current_gate.recovery_correlation}\nblockers=${current.vmodel_fit.roadmap_current_gate.blocker_count}\n${current.vmodel_fit.roadmap_current_gate.reasons.join("\n")}`,
          contextValue: `vmodel-fit.roadmap-current.${current.vmodel_fit.roadmap_current_gate.status}`,
          commandPointer: current.vmodel_fit.roadmap_current_gate.command,
        }),
        node({
          id: "project/current-location/vmodel-fit/drive-model",
          label: "drive model",
          description: `${current.vmodel_fit.drive_model_gate.selected_model}/${current.vmodel_fit.drive_model_gate.status} ${current.vmodel_fit.drive_model_gate.selected_coverage_ids.join(",") || "-"}`,
          tooltip: `${current.vmodel_fit.drive_model_gate.required_action}\nroute=${current.vmodel_fit.drive_model_gate.selected_route_id}\ncoverage=${current.vmodel_fit.drive_model_gate.selected_coverage_ids.join(",") || "-"}\nblocked=${current.vmodel_fit.drive_model_gate.blocked_models.join(",") || "-"}\navailable=${current.vmodel_fit.drive_model_gate.available_models.join(",") || "-"}\n${current.vmodel_fit.drive_model_gate.reasons.join("\n")}`,
          contextValue: `vmodel-fit.drive-model.${current.vmodel_fit.drive_model_gate.status}`,
          commandPointer: current.vmodel_fit.drive_model_gate.command,
        }),
        node({
          id: "project/current-location/vmodel-fit/current-location",
          label: "current-location",
          description: `${current.vmodel_fit.current_location_status}/${current.vmodel_fit.completion_boundary} reentry=${vmodelFitReentryStatus}`,
          tooltip: `runway=${current.vmodel_fit.recovery_runway.status}\nreentry=${current.vmodel_fit.reentry_forecast.status}\neffective=${vmodelFitReentryStatus}\nmachine=${current.vmodel_fit.recovery_runway.machine_actionable_count}\napproval=${current.vmodel_fit.recovery_runway.human_approval_count}\nreverse=${current.vmodel_fit.recovery_runway.design_reverse_count}\nafter_machine=${current.vmodel_fit.reentry_forecast.blocking_after_machine_lanes}\nphases=${current.vmodel_fit.reentry_forecast.required_phase_count}\nnext=${current.vmodel_fit.reentry_forecast.next_phase_action ?? "-"}\ngate=${current.vmodel_fit.reentry_forecast.next_gate}\ncommand=${current.vmodel_fit.reentry_forecast.next_command}\nexecute=${current.vmodel_fit.reentry_forecast.next_execution_command}\nnext_probe=${current.vmodel_fit.recovery_runway.next_machine_probe_command ?? "-"}\nmaterialize=${current.vmodel_fit.recovery_runway.next_machine_materialize_command ?? "-"}`,
          contextValue: `vmodel-fit.current-location.${current.vmodel_fit.current_location_status}.reentry-${vmodelFitReentryStatus}`,
          commandPointer: current.vmodel_fit.reentry_forecast.next_execution_command,
        }),
        node({
          id: "project/current-location/vmodel-fit/recovery-runway",
          label: "recovery runway",
          description: `${current.vmodel_fit.recovery_runway_gate.status} machine=${current.vmodel_fit.recovery_runway_gate.machine_actionable_count} approval=${current.vmodel_fit.recovery_runway_gate.human_approval_count}`,
          tooltip: tooltipLines([
            current.vmodel_fit.recovery_runway_gate.required_action,
            `blocking=${current.vmodel_fit.recovery_runway_gate.current_blocking_count}`,
            `reverse=${current.vmodel_fit.recovery_runway_gate.design_reverse_count}`,
            `after_machine=${current.vmodel_fit.recovery_runway_gate.remaining_after_machine_lanes}`,
            `phases=${current.vmodel_fit.recovery_runway_gate.required_phase_count}`,
            `next=${current.vmodel_fit.recovery_runway_gate.next_phase_action ?? "-"}`,
            `phase=${current.vmodel_fit.recovery_runway_gate.next_phase_type ?? "-"}`,
            `gate=${current.vmodel_fit.recovery_runway_gate.next_gate}`,
            `command=${current.vmodel_fit.recovery_runway_gate.next_command}`,
            `execute=${current.vmodel_fit.recovery_runway_gate.next_execution_command}`,
            `next_probe=${current.vmodel_fit.recovery_runway_gate.next_machine_probe_command ?? "-"}`,
            `materialize=${current.vmodel_fit.recovery_runway_gate.next_machine_materialize_command ?? "-"}`,
            ...current.vmodel_fit.recovery_runway_gate.reasons,
          ]),
          contextValue: `vmodel-fit.recovery-runway.${current.vmodel_fit.recovery_runway_gate.status}`,
          commandPointer: current.vmodel_fit.recovery_runway_gate.command,
          children: current.vmodel_fit.recovery_runway_gate.phases.map((phase) =>
            node({
              id: `project/current-location/vmodel-fit/recovery-runway/${phase.sequence}-${phase.action}`,
              label: `${phase.sequence}. ${phase.action}`,
              description: `${phase.phase_type} count=${phase.count} listed=${phase.listed} remaining=${phase.remaining_after_phase}`,
              tooltip: tooltipLines([
                phase.expected_transition,
                `status=${phase.status}`,
                `selected=${phase.selected}`,
                `human=${phase.human_required}`,
                `signature=${phase.evidence_signature ?? "-"}`,
                `components=${phase.evidence_components.join(",") || "-"}`,
                `statuses=${phase.evidence_statuses.join(",") || "-"}`,
                `plans=${phase.sample_plan_ids.join(",") || "-"}`,
                `sources=${phase.sample_source_paths.join(",") || "-"}`,
                `omitted=${phase.omitted}`,
                `gate=${phase.next_gate}`,
                `command=${phase.command}`,
                phase.evidence_probe_command ? `probe=${phase.evidence_probe_command}` : null,
                phase.evidence_materialize_command
                  ? `materialize=${phase.evidence_materialize_command}`
                  : null,
                phase.evidence_approval_draft_command
                  ? `approval_draft=${phase.evidence_approval_draft_command}`
                  : null,
                phase.evidence_apply_dry_run_command
                  ? `apply_dry_run=${phase.evidence_apply_dry_run_command}`
                  : null,
                phase.evidence_apply_execute_command
                  ? `apply_execute=${phase.evidence_apply_execute_command}`
                  : null,
                phase.evidence_apply_write_policy
                  ? `apply_write=${phase.evidence_apply_write_policy}`
                  : null,
                `tables=${phase.target_tables.join(",") || "-"}`,
                `postcheck=${phase.postcheck_commands.join(" && ")}`,
              ]),
              contextValue: `vmodel-fit.recovery-runway.phase.${phase.phase_type}`,
              commandPointer: phase.evidence_probe_command ?? phase.command,
            }),
          ),
        }),
        node({
          id: "project/current-location/vmodel-fit/recovery-handoff",
          label: "recovery handoff",
          description: `${current.vmodel_fit.recovery_handoff_gate.status} phase=${current.vmodel_fit.recovery_handoff_gate.effective_phase} approval=${current.vmodel_fit.recovery_handoff_gate.approval_state} scope=${current.vmodel_fit.recovery_handoff_gate.scope_status ?? "-"} valid=${current.vmodel_fit.recovery_handoff_gate.valid_for_apply}`,
          tooltip: tooltipLines([
            current.vmodel_fit.recovery_handoff_gate.required_action,
            `approval_state=${current.vmodel_fit.recovery_handoff_gate.approval_state}`,
            `approval=${current.vmodel_fit.recovery_handoff_gate.approval_status ?? "-"}`,
            `scope=${current.vmodel_fit.recovery_handoff_gate.scope_status ?? "-"}`,
            `decision=${current.vmodel_fit.recovery_handoff_gate.decision_id ?? "-"}`,
            `outcome=${current.vmodel_fit.recovery_handoff_gate.outcome ?? "-"}`,
            `approval_record_path=${current.vmodel_fit.recovery_handoff_gate.approval_record_path ?? "-"}`,
            `approval_scope_digest=${current.vmodel_fit.recovery_handoff_gate.approval_scope_digest ?? "-"}`,
            `expected=${current.vmodel_fit.recovery_handoff_gate.expected_approval_scope_digest ?? "-"}`,
            `materialize=${current.vmodel_fit.recovery_handoff_gate.materialize_status ?? "-"}`,
            `reviewed=${current.vmodel_fit.recovery_handoff_gate.reviewed_candidate_count ?? "-"}`,
            `valid_for_apply=${current.vmodel_fit.recovery_handoff_gate.valid_for_apply}`,
            `present=${current.vmodel_fit.recovery_handoff_gate.handoff_present}`,
            `missing=${current.vmodel_fit.recovery_handoff_gate.handoff_missing}`,
            ...current.vmodel_fit.recovery_handoff_gate.reason_codes,
            ...current.vmodel_fit.recovery_handoff_gate.reasons,
          ]),
          contextValue: `vmodel-fit.recovery-handoff.${current.vmodel_fit.recovery_handoff_gate.effective_phase}.${current.vmodel_fit.recovery_handoff_gate.status}.approval-${current.vmodel_fit.recovery_handoff_gate.approval_state}.scope-${current.vmodel_fit.recovery_handoff_gate.scope_status ?? "none"}.valid-${current.vmodel_fit.recovery_handoff_gate.valid_for_apply}`,
          commandPointer: current.vmodel_fit.recovery_handoff_gate.command,
        }),
        node({
          id: "project/current-location/vmodel-fit/approval-review",
          label: "approval review",
          description: `${current.vmodel_fit.approval_review_gate.status} count=${current.vmodel_fit.approval_review_gate.count} listed=${current.vmodel_fit.approval_review_gate.listed}`,
          tooltip: tooltipLines([
            current.vmodel_fit.approval_review_gate.required_action,
            `decision=${current.vmodel_fit.approval_review_gate.decision_id}`,
            `approval_scope_digest=${current.vmodel_fit.approval_review_gate.approval_scope_digest}`,
            `window=${current.vmodel_fit.approval_review_gate.window.page_index}/${current.vmodel_fit.approval_review_gate.window.page_count}`,
            `range=${current.vmodel_fit.approval_review_gate.window.start}-${current.vmodel_fit.approval_review_gate.window.end}`,
            `offset=${current.vmodel_fit.approval_review_gate.offset}`,
            `limit=${current.vmodel_fit.approval_review_gate.limit}`,
            `omitted=${current.vmodel_fit.approval_review_gate.omitted}`,
            `tests=${current.vmodel_fit.approval_review_gate.evidence_totals.test_runs_passed}/${current.vmodel_fit.approval_review_gate.evidence_totals.test_runs_total}`,
            `gates=${current.vmodel_fit.approval_review_gate.evidence_totals.gate_runs_passed}/${current.vmodel_fit.approval_review_gate.evidence_totals.gate_runs_total}`,
            `runtime=${current.vmodel_fit.approval_review_gate.evidence_totals.runtime_verification_accepted}/${current.vmodel_fit.approval_review_gate.evidence_totals.runtime_verification_total}`,
            `blocked=${current.vmodel_fit.approval_review_gate.blocked_by_findings.join(",") || "-"}`,
            `plans=${current.vmodel_fit.approval_review_gate.sample_plan_ids.join(",") || "-"}`,
            `sources=${current.vmodel_fit.approval_review_gate.sample_source_paths.join(",") || "-"}`,
            `review=${current.vmodel_fit.approval_review_gate.current_window_command}`,
            `previous=${current.vmodel_fit.approval_review_gate.previous_window_command ?? "-"}`,
            `next=${current.vmodel_fit.approval_review_gate.next_window_command ?? "-"}`,
            `transition=${current.vmodel_fit.approval_review_gate.transition_command}`,
            `transition-window=${current.vmodel_fit.approval_review_gate.transition_window_command}`,
            `previous-transition=${current.vmodel_fit.approval_review_gate.previous_transition_window_command ?? "-"}`,
            `next-transition=${current.vmodel_fit.approval_review_gate.next_transition_window_command ?? "-"}`,
            ...current.vmodel_fit.approval_review_gate.outcome_routes.map(
              (route) =>
                `outcome-route=${route.outcome}->${route.target_action ?? "-"} drive=${route.drive_model} command=${route.command}`,
            ),
            ...current.vmodel_fit.approval_review_gate.reasons,
          ]),
          contextValue: `vmodel-fit.approval-review.${current.vmodel_fit.approval_review_gate.status}`,
          commandPointer: current.vmodel_fit.approval_review_gate.current_window_command,
          children: [
            node({
              id: "project/current-location/vmodel-fit/approval-review/current-window",
              label: "current window",
              description: `${current.vmodel_fit.approval_review_gate.window.page_index}/${current.vmodel_fit.approval_review_gate.window.page_count} ${current.vmodel_fit.approval_review_gate.window.start}-${current.vmodel_fit.approval_review_gate.window.end}`,
              tooltip: tooltipLines([
                `digest=${current.vmodel_fit.approval_review_gate.approval_scope_digest}`,
                `offset=${current.vmodel_fit.approval_review_gate.offset}`,
                `limit=${current.vmodel_fit.approval_review_gate.limit}`,
                `listed=${current.vmodel_fit.approval_review_gate.listed}`,
                `omitted=${current.vmodel_fit.approval_review_gate.omitted}`,
                `plans=${current.vmodel_fit.approval_review_gate.sample_plan_ids.join(",") || "-"}`,
                `sources=${current.vmodel_fit.approval_review_gate.sample_source_paths.join(",") || "-"}`,
              ]),
              contextValue: "vmodel-fit.approval-review.current-window",
              commandPointer: current.vmodel_fit.approval_review_gate.current_window_command,
            }),
            ...(current.vmodel_fit.approval_review_gate.previous_window_command
              ? [
                  node({
                    id: "project/current-location/vmodel-fit/approval-review/previous-window",
                    label: "previous window",
                    description: current.vmodel_fit.approval_review_gate.previous_window_command,
                    contextValue: "vmodel-fit.approval-review.previous-window",
                    commandPointer: current.vmodel_fit.approval_review_gate.previous_window_command,
                  }),
                ]
              : []),
            ...(current.vmodel_fit.approval_review_gate.next_window_command
              ? [
                  node({
                    id: "project/current-location/vmodel-fit/approval-review/next-window",
                    label: "next window",
                    description: current.vmodel_fit.approval_review_gate.next_window_command,
                    contextValue: "vmodel-fit.approval-review.next-window",
                    commandPointer: current.vmodel_fit.approval_review_gate.next_window_command,
                  }),
                ]
              : []),
            node({
              id: "project/current-location/vmodel-fit/approval-review/evidence",
              label: "evidence totals",
              description: `artifacts=${current.vmodel_fit.approval_review_gate.evidence_totals.artifact_paths} evidence=${current.vmodel_fit.approval_review_gate.evidence_totals.evidence_paths} tests=${current.vmodel_fit.approval_review_gate.evidence_totals.test_runs_passed}/${current.vmodel_fit.approval_review_gate.evidence_totals.test_runs_total}`,
              tooltip: tooltipLines([
                `trace=${current.vmodel_fit.approval_review_gate.evidence_totals.trace_edges}`,
                `gates=${current.vmodel_fit.approval_review_gate.evidence_totals.gate_runs_passed}/${current.vmodel_fit.approval_review_gate.evidence_totals.gate_runs_total}`,
                `runtime=${current.vmodel_fit.approval_review_gate.evidence_totals.runtime_verification_accepted}/${current.vmodel_fit.approval_review_gate.evidence_totals.runtime_verification_total}`,
                `blocked=${current.vmodel_fit.approval_review_gate.blocked_by_findings.join(",") || "-"}`,
              ]),
              contextValue: "vmodel-fit.approval-review.evidence",
              commandPointer: current.vmodel_fit.approval_review_gate.current_window_command,
            }),
            node({
              id: "project/current-location/vmodel-fit/approval-review/transition",
              label: "transition",
              description: current.vmodel_fit.approval_review_gate.transition_window_command,
              tooltip: tooltipLines([
                `all=${current.vmodel_fit.approval_review_gate.transition_command}`,
                `previous=${current.vmodel_fit.approval_review_gate.previous_transition_window_command ?? "-"}`,
                `next=${current.vmodel_fit.approval_review_gate.next_transition_window_command ?? "-"}`,
              ]),
              contextValue: "vmodel-fit.approval-review.transition",
              commandPointer: current.vmodel_fit.approval_review_gate.transition_window_command,
            }),
            node({
              id: "project/current-location/vmodel-fit/approval-review/outcome-routes",
              label: "outcome routes",
              description: String(current.vmodel_fit.approval_review_gate.outcome_routes.length),
              tooltip: tooltipLines(
                current.vmodel_fit.approval_review_gate.outcome_routes.map(
                  (route) =>
                    `${route.outcome}->${route.target_action ?? "-"} ${route.expected_transition}`,
                ),
                {
                  omittedHint: current.vmodel_fit.approval_review_gate.review_command,
                },
              ),
              contextValue: "vmodel-fit.approval-review.outcome-routes",
              commandPointer: current.vmodel_fit.approval_review_gate.transition_window_command,
              children: current.vmodel_fit.approval_review_gate.outcome_routes.map((route) =>
                node({
                  id: `project/current-location/vmodel-fit/approval-review/outcome-routes/${route.outcome}`,
                  label: route.outcome,
                  description: `${route.target_action ?? "-"} ${route.drive_model}`,
                  tooltip: tooltipLines([
                    `projection=${route.projection_type}`,
                    `human=${route.human_required}`,
                    `transition=${route.expected_transition}`,
                    `command=${route.command}`,
                    `transition_command=${route.transition_command}`,
                    route.required_action,
                    ...route.doc_dependencies.map((dependency) => `doc=${dependency}`),
                    ...route.implementation_dependencies.map((dependency) => `impl=${dependency}`),
                    ...route.postcheck_commands.map((command) => `postcheck=${command}`),
                    ...route.reasons,
                  ]),
                  contextValue: `vmodel-fit.approval-review.outcome.${route.outcome}`,
                  commandPointer: route.command,
                }),
              ),
            }),
            node({
              id: "project/current-location/vmodel-fit/approval-review/record-template",
              label: "record template",
              description: `${current.vmodel_fit.approval_review_gate.approval_record_template.length} fields`,
              tooltip: tooltipLines(
                current.vmodel_fit.approval_review_gate.approval_record_template,
              ),
              contextValue: "vmodel-fit.approval-review.record-template",
              commandPointer: current.vmodel_fit.approval_review_gate.current_window_command,
            }),
          ],
        }),
        node({
          id: "project/current-location/vmodel-fit/design-integrity",
          label: "design integrity",
          description: `unresolved=${current.vmodel_fit.unresolved_design_references} drift=${current.vmodel_fit.design_declaration_drifts}`,
          contextValue:
            current.vmodel_fit.unresolved_design_references > 0 ||
            current.vmodel_fit.design_declaration_drifts > 0
              ? "vmodel-fit.integrity.unresolved"
              : "vmodel-fit.integrity.resolved",
          commandPointer: current.vmodel_fit.view_command,
        }),
        node({
          id: "project/current-location/vmodel-fit/blockers",
          label: "blockers",
          description: String(current.vmodel_fit.blockers.length),
          tooltip: tooltipLines([
            "db=project_vmodel_fit_blockers",
            ...current.vmodel_fit.blockers.map(
              (blocker) =>
                `${blocker.code}:${blocker.count} boundary=${blocker.boundary.status}/${blocker.boundary.automation_class} ${blocker.required_action}`,
            ),
          ]),
          contextValue:
            current.vmodel_fit.blockers.length > 0
              ? "vmodel-fit.blockers.present"
              : "vmodel-fit.blockers.none",
          commandPointer: current.vmodel_fit.source_command,
          children: current.vmodel_fit.blockers.map((blocker) =>
            node({
              id: `project/current-location/vmodel-fit/blockers/${blocker.code}`,
              label: blocker.code,
              description: `${blocker.status} ${blocker.boundary.automation_class} count=${blocker.count}`,
              tooltip: tooltipLines(
                [
                  "db=project_vmodel_fit_blockers",
                  `boundary=${blocker.boundary.status}`,
                  `blocked_by=${blocker.boundary.completion_claim_blocked_by}`,
                  `automation=${blocker.boundary.automation_class}`,
                  `machine=${blocker.boundary.machine_actionable_count}`,
                  `approval=${blocker.boundary.human_approval_count}`,
                  `reverse=${blocker.boundary.design_reverse_count}`,
                  `next=${blocker.boundary.next_command}`,
                  blocker.required_action,
                  ...blocker.doc_dependencies.map((dependency) => `doc=${dependency}`),
                  ...blocker.implementation_dependencies.map((dependency) => `impl=${dependency}`),
                ],
                { omittedHint: blocker.command },
              ),
              contextValue: `vmodel-fit.blocker.${blocker.code}`,
              commandPointer: blocker.command,
            }),
          ),
        }),
      ],
    }),
    node({
      id: "project/current-location/zip-adoption",
      label: "ZIP adoption",
      description: `${current.zip_adoption.status} adopt=${current.zip_adoption.adopted} complement=${current.zip_adoption.complemented} reject=${current.zip_adoption.rejected} missing=${current.zip_adoption.missing}`,
      tooltip: tooltipLines(
        [
          "db=project_zip_adoption_decisions",
          current.zip_adoption.source_package,
          current.zip_adoption.source_document,
          ...current.zip_adoption.doc_dependencies.map((dependency) => `doc=${dependency}`),
        ],
        { omittedHint: "helix current-location --summary-json" },
      ),
      contextValue: `current-location.zip-adoption.${current.zip_adoption.status}`,
      commandPointer: current.zip_adoption.source_document,
      children: current.zip_adoption.items.map((item) =>
        node({
          id: `project/current-location/zip-adoption/${item.category}/${item.adoption_id}`,
          label: `${item.adoption_id} ${item.label}`,
          description: `${item.category}/${item.status}`,
          tooltip: tooltipLines([
            `db=project_zip_adoption_decisions`,
            `impl=${item.implementation_dependencies.join(",") || "-"}`,
            ...item.reasons,
            ...item.source_paths,
          ]),
          contextValue: `zip-adoption.${item.category}.${item.status}`,
          commandPointer: item.source_paths[0] ?? current.zip_adoption.source_document,
        }),
      ),
    }),
    node({
      id: "project/current-location/skill-binding",
      label: "Skill binding",
      description: `${current.skill_binding.status} req=${current.skill_binding.required_skills} rec=${current.skill_binding.recommended_skills} opt=${current.skill_binding.optional_skills}`,
      tooltip: tooltipLines(
        [
          current.skill_binding.source_package,
          `selected=${current.skill_binding.selected_model}`,
          `workflow=${current.skill_binding.workflow_modes.join(",") || "-"}`,
          `layers=${current.skill_binding.l12_layers.join(",") || "-"}`,
          `bindings=${current.skill_binding.source_bindings.join(",") || "-"}`,
          ...current.skill_binding.reasons,
          ...current.skill_binding.doc_dependencies.map((dependency) => `doc=${dependency}`),
        ],
        { omittedHint: "helix current-location --summary-json" },
      ),
      contextValue: `current-location.skill-binding.${current.skill_binding.status}`,
      commandPointer: current.skill_binding.command,
      children: current.skill_binding.items.map((item) =>
        node({
          id: `project/current-location/skill-binding/${item.rank}-${item.skill_id}`,
          label: item.skill_id.replace(/^skill:/, ""),
          description: `${item.tier} ${item.score.toFixed(2)} ${item.inject_at}`,
          tooltip: tooltipLines([
            item.skill_path,
            `matched_drive=${item.matched_drive_models.join(",") || "-"}`,
            `matched_layers=${item.matched_layers.join(",") || "-"}`,
            `source_drive=${item.source_drive_models.join(",") || "-"}`,
            `source_layers=${item.source_layers.join(",") || "-"}`,
            ...item.reasons,
          ]),
          contextValue: `skill-binding.${item.tier}`,
          commandPointer: item.skill_path,
        }),
      ),
    }),
    node({
      id: "project/current-location/scrum-operation",
      label: "Scrum operation",
      description: `${current.scrum_operation.status} backlog=${current.scrum_operation.backlog_items} sprint=${current.scrum_operation.sprint_items} ac=${current.scrum_operation.acceptance_items} plan=${current.scrum_operation.planning_items} ceremony=${current.scrum_operation.ceremony_items} metric=${current.scrum_operation.metric_items} active=${current.scrum_operation.active_sprint_plans}`,
      tooltip: tooltipLines(
        [
          current.scrum_operation.source_package,
          `bindings=${current.scrum_operation.source_bindings.join(",") || "-"}`,
          ...current.scrum_operation.reasons,
          ...current.scrum_operation.doc_dependencies.map((dependency) => `doc=${dependency}`),
          ...current.scrum_operation.implementation_dependencies.map(
            (dependency) => `impl=${dependency}`,
          ),
        ],
        { omittedHint: "helix current-location --summary-json" },
      ),
      contextValue: `current-location.scrum-operation.${current.scrum_operation.status}`,
      commandPointer: "helix current-location --summary-json",
      children: current.scrum_operation.items.map((item) =>
        node({
          id: `project/current-location/scrum-operation/${item.operation_id}`,
          label: item.operation_id,
          description: `${item.category}/${item.status}`,
          tooltip: tooltipLines([
            `impl=${item.implementation_dependencies.join(",") || "-"}`,
            ...item.reasons,
            ...item.plan_ids.map((planId) => `plan=${planId}`),
            ...item.source_paths,
          ]),
          contextValue: `scrum-operation.${item.category}.${item.status}`,
          commandPointer: item.source_paths[0] ?? "helix current-location --summary-json",
        }),
      ),
    }),
    node({
      id: "project/current-location/zip-manifest",
      label: "ZIP manifest",
      description: `${current.zip_manifest.status} entries=${current.zip_manifest.entries_total} required=${current.zip_manifest.required_present}/${current.zip_manifest.required_total}`,
      tooltip: `root=${current.zip_manifest.root_prefix ?? "-"}\nyaml=${current.zip_manifest.by_extension.yaml ?? 0} md=${current.zip_manifest.by_extension.md ?? 0} xlsx=${current.zip_manifest.by_extension.xlsx ?? 0} py=${current.zip_manifest.by_extension.py ?? 0}\n${current.zip_manifest.findings.map((finding) => `${finding.severity}:${finding.code} ${finding.detail}`).join("\n")}`,
      contextValue: `current-location.zip-manifest.${current.zip_manifest.status}`,
      commandPointer: current.zip_manifest.source_command,
      children: [
        node({
          id: "project/current-location/zip-manifest/inventory-signature",
          label: "inventory signature",
          description: `${current.zip_manifest.inventory_signature.status} entries=${current.zip_manifest.inventory_signature.actual_entries_total}/${current.zip_manifest.inventory_signature.expected_entries_total}`,
          tooltip: `root=${current.zip_manifest.inventory_signature.actual_root_prefix ?? "-"}/${current.zip_manifest.inventory_signature.expected_root_prefix}\nyaml=${current.zip_manifest.inventory_signature.actual_by_extension.yaml ?? 0}/${current.zip_manifest.inventory_signature.expected_by_extension.yaml ?? 0} md=${current.zip_manifest.inventory_signature.actual_by_extension.md ?? 0}/${current.zip_manifest.inventory_signature.expected_by_extension.md ?? 0} xlsx=${current.zip_manifest.inventory_signature.actual_by_extension.xlsx ?? 0}/${current.zip_manifest.inventory_signature.expected_by_extension.xlsx ?? 0} png=${current.zip_manifest.inventory_signature.actual_by_extension.png ?? 0}/${current.zip_manifest.inventory_signature.expected_by_extension.png ?? 0} py=${current.zip_manifest.inventory_signature.actual_by_extension.py ?? 0}/${current.zip_manifest.inventory_signature.expected_by_extension.py ?? 0} json=${current.zip_manifest.inventory_signature.actual_by_extension.json ?? 0}/${current.zip_manifest.inventory_signature.expected_by_extension.json ?? 0} feature=${current.zip_manifest.inventory_signature.actual_by_extension.feature ?? 0}/${current.zip_manifest.inventory_signature.expected_by_extension.feature ?? 0}\n${current.zip_manifest.inventory_signature.mismatches.map((mismatch) => `${mismatch.field}: ${mismatch.actual} != ${mismatch.expected}`).join("\n")}`,
          contextValue: `zip-manifest.inventory-signature.${current.zip_manifest.inventory_signature.status}`,
          commandPointer: "helix vmodel fit --summary-json",
        }),
        node({
          id: "project/current-location/zip-manifest/source-bindings",
          label: "source bindings",
          description: `${current.zip_manifest.source_bindings.status} bound=${current.zip_manifest.source_bindings.bound} missing=${current.zip_manifest.source_bindings.missing}`,
          tooltip: tooltipLines(current.zip_manifest.source_bindings.evidence_tables, {
            omittedHint: "helix vmodel fit --summary-json",
          }),
          contextValue: `zip-manifest.source-bindings.${current.zip_manifest.source_bindings.status}`,
          commandPointer: "helix vmodel fit --summary-json",
          children: current.zip_manifest.source_bindings.bindings.map((binding) =>
            node({
              id: `project/current-location/zip-manifest/source-bindings/${binding.binding_id}`,
              label: binding.source_path,
              description: `${binding.status} -> ${binding.evidence_tables.join(",")}`,
              tooltip: `${binding.required_action}\n${binding.helix_surfaces.join("\n")}\n${binding.actual_path ?? binding.source_path}`,
              contextValue: `zip-manifest.source-binding.${binding.status}`,
              commandPointer: "helix vmodel fit --json",
            }),
          ),
        }),
        ...current.zip_manifest.required.map((entry) =>
          node({
            id: `project/current-location/zip-manifest/required/${entry.path}`,
            label: entry.path,
            description: entry.present ? "present" : "missing",
            tooltip: entry.actual_path ?? entry.path,
            contextValue: entry.present
              ? "zip-manifest.required.present"
              : "zip-manifest.required.missing",
          }),
        ),
      ],
    }),
    node({
      id: "project/current-location/tailoring-gate",
      label: "Tailoring gate",
      description: `${current.tailoring_gate.status} required=${current.tailoring_gate.required} optional=${current.tailoring_gate.optional} na=${current.tailoring_gate.excluded} missing=${current.tailoring_gate.missing_required}`,
      tooltip: tooltipLines(
        [
          "db=project_tailoring_decisions",
          current.tailoring_gate.profile,
          current.tailoring_gate.source_document,
          ...current.tailoring_gate.doc_dependencies.map((dependency) => `doc=${dependency}`),
        ],
        { omittedHint: "helix current-location --summary-json" },
      ),
      contextValue: `current-location.tailoring-gate.${current.tailoring_gate.status}`,
      commandPointer: current.tailoring_gate.source_document,
      children: current.tailoring_gate.items.map((item) =>
        node({
          id: `project/current-location/tailoring-gate/${item.category}/${item.tailoring_id}`,
          label: `${item.tailoring_id} ${item.label}`,
          description: `${item.category}/${item.detail_level}/${item.status}`,
          tooltip: tooltipLines([
            "db=project_tailoring_decisions",
            `impl=${item.implementation_dependencies.join(",") || "-"}`,
            ...item.reasons,
            ...item.source_paths,
          ]),
          contextValue: `tailoring-gate.${item.category}.${item.status}`,
          commandPointer: item.source_paths[0] ?? current.tailoring_gate.source_document,
        }),
      ),
    }),
    node({
      id: "project/current-location/roadmap-position",
      label: "Roadmap position",
      description: `${current.roadmap_position.status} bands=${current.roadmap_position.rollup.covered_bands}/${current.roadmap_position.rollup.total_bands} gates=${current.roadmap_position.rollup.reached_gates}/${current.roadmap_position.rollup.total_gates}`,
      tooltip: current.roadmap_position.frontier.join("\n"),
      contextValue: `current-location.roadmap-position.${current.roadmap_position.status}`,
      children: [
        node({
          id: "project/current-location/roadmap-position/current-sync",
          label: "current sync",
          description: `route=${current.drive_route.route_id}`,
          tooltip:
            "roadmap_rollups / roadmap_band_coverage / roadmap_gate_progress と DB current-location の照合 report",
          contextValue: "roadmap-position.current-sync",
          commandPointer: "helix roadmap current --summary-json",
        }),
        node({
          id: "project/current-location/roadmap-position/bands",
          label: "bands",
          description: `current=${current.roadmap_position.current_band_ids.join(",") || "-"}`,
          contextValue: "roadmap-position.bands",
          children: current.roadmap_position.bands.map((band) =>
            node({
              id: `project/current-location/roadmap-position/bands/${band.band_id}`,
              label: band.name || band.band_id,
              description: `${band.status} @${band.l12_layers.join("/") || "-"} ${band.coverage_ids.join(",") || "-"}`,
              tooltip: `coverage=${band.coverage_ids.join(",") || "-"}\n${band.coverage_labels.join("\n")}\n${band.roadmap_ids.join("\n")}\n${band.reasons.join("; ")}`,
              contextValue: `roadmap-band.${band.status}`,
            }),
          ),
        }),
        node({
          id: "project/current-location/roadmap-position/gates",
          label: "gates",
          description: `current=${current.roadmap_position.current_gate_ids.length}`,
          contextValue: "roadmap-position.gates",
          children: current.roadmap_position.gates.slice(0, 80).map((gate) =>
            node({
              id: `project/current-location/roadmap-position/gates/${gate.plan_id}/${gate.gate_id}`,
              label: `${gate.plan_id}:${gate.gate_id}`,
              description: `${gate.status} ${gate.confirmed_spans}/${gate.total_spans}`,
              tooltip: `coverage=${gate.coverage_ids.join(",") || "-"}\n${gate.coverage_labels.join("\n")}\n${gate.reasons.join("; ")}\n${gate.l12_layers.join("/")}`,
              contextValue: `roadmap-gate.${gate.status}`,
              commandPointer: `docs/plans/${gate.plan_id}.md`,
            }),
          ),
        }),
      ],
    }),
    node({
      id: "project/current-location/findings",
      label: "findings",
      description: String(current.findings.length),
      contextValue: "current-location.findings",
      children: current.findings.map((finding) =>
        node({
          id: `project/current-location/findings/${finding.code}`,
          label: finding.code,
          description: finding.severity,
          tooltip: finding.detail,
          contextValue: `finding.${finding.severity}`,
        }),
      ),
    }),
    node({
      id: "project/current-location/closure",
      label: "L7 closure",
      description: current.closure.status,
      tooltip: current.closure.required_evidence.join("; "),
      contextValue: `current-location.closure.${current.closure.status}`,
      children: [
        node({
          id: "project/current-location/closure/open-l7",
          label: "open L7 plans",
          description: String(current.closure.l7_open_plan_ids.length),
          tooltip: current.closure.l7_open_plan_ids.join("\n"),
          contextValue: "current-location.closure.detail",
        }),
        node({
          id: "project/current-location/closure/l14-claims",
          label: "L14 claims",
          description: String(current.closure.terminal_l14_plan_ids.length),
          tooltip: current.closure.terminal_l14_plan_ids.join("\n"),
          contextValue: "current-location.closure.detail",
        }),
        node({
          id: "project/current-location/closure/evidence",
          label: "closure evidence",
          description: String(current.closure.closure_evidence_ids.length),
          tooltip: current.closure.closure_evidence_ids.join("\n"),
          contextValue: "current-location.closure.detail",
        }),
        node({
          id: "project/current-location/closure/overview",
          label: "closure overview",
          description: `queue=${current.closure_overview.queue_total} close=${current.closure_overview.route_counts.close_ready} collect=${current.closure_overview.route_counts.collect_evidence} repair=${current.closure_overview.route_counts.repair_failed_evidence} reverse=${current.closure_overview.route_counts.reverse_design}`,
          tooltip: `${current.closure_overview.recommended_next_action.reason}\n${current.closure_overview.source_command}\n${current.closure_overview.view_command}`,
          contextValue: `current-location.closure.overview.${current.closure_overview.status}`,
          commandPointer: current.closure_overview.source_command,
          children: [
            node({
              id: "project/current-location/closure/overview/recommended",
              label: "recommended",
              description: `${current.closure_overview.recommended_next_action.action ?? "none"} human=${current.closure_overview.recommended_next_action.human_required}`,
              tooltip: `${current.closure_overview.recommended_next_action.reason}\n${current.closure_overview.recommended_next_action.command}`,
              contextValue: "closure-overview.recommended",
              commandPointer: current.closure_overview.recommended_next_action.command,
            }),
            ...current.closure_overview.actions.map((action) =>
              node({
                id: `project/current-location/closure/overview/actions/${action.action}`,
                label: action.action,
                description: `${action.count} ${action.ledger_status ?? "untracked"} human=${action.human_required}`,
                tooltip: `${action.required_action ?? "-"}\n${action.evidence_policy ?? "-"}\n${action.promotion_gate ?? "-"}\n${action.sample_plan_ids.join("\n")}`,
                contextValue: `closure-overview.action.${action.action}`,
                commandPointer: action.review_command,
              }),
            ),
            node({
              id: "project/current-location/closure/overview/work-buckets",
              label: "work buckets",
              description: String(current.closure_overview.work_buckets.length),
              tooltip: current.closure_overview.work_buckets
                .map(
                  (bucket) =>
                    `${bucket.rank}.${bucket.evidence_signature} count=${bucket.count}\n${bucket.required_action}`,
                )
                .join("\n\n"),
              contextValue: "closure-overview.work-buckets",
              commandPointer: current.closure_overview.work_buckets[0]
                ? current.closure_overview.work_buckets[0].evidence_probe_command
                : current.closure_overview.recommended_next_action.command,
              children: current.closure_overview.work_buckets.map((bucket) =>
                node({
                  id: `project/current-location/closure/overview/work-buckets/${bucket.rank}`,
                  label: `${bucket.rank}. ${bucket.evidence_signature}`,
                  description: `count=${bucket.count} automation=${bucket.repair_plan.automation.status}`,
                  tooltip: `${bucket.required_action}\nrepair=${bucket.repair_plan.status}\nautomation=${bucket.repair_plan.automation.status}\nnext=${bucket.repair_plan.automation.primary_next_command ?? "-"}\nevidence-probe=${bucket.evidence_probe_command}\nevidence-materialize=${bucket.evidence_materialize_command}\nevidence-approval-draft=${bucket.evidence_approval_draft_command}\nevidence-apply-dry-run=${bucket.evidence_apply_dry_run_command}\nevidence-apply-execute=${bucket.evidence_apply_execute_command}\nevidence-apply-write=${bucket.evidence_apply_write_policy}\nevidence-patch=${bucket.evidence_patch_command}\nlatest=${bucket.repair_plan.latest_failed_at ?? "-"}\ngreen=${bucket.repair_plan.required_green_tables.join(",") || "-"}\ntemplates=${bucket.repair_plan.projection_templates.map((template) => `${template.table}:${template.example_status}`).join(",") || "-"}\ntables=${bucket.target_tables.join(",") || "-"}\npostcheck=${bucket.postcheck_commands.join(" && ")}\n${bucket.repair_plan.command_candidates.map((candidate) => `${candidate.command_label} verb=${candidate.command_verb ?? "-"} runnable=${candidate.runnable_command ?? "-"} resolution=${candidate.resolution_candidates.map((resolution) => `${resolution.command}->${resolution.projection_binding.target_tables.join(",")}`).join("|") || "-"} count=${candidate.count}`).join("\n")}\n${bucket.repair_plan.projection_items.map((item) => `${item.plan_id} failed=${item.failed_evidence_count}`).join("\n")}`,
                  contextValue: `closure-work-bucket.${bucket.action}.${bucket.repair_plan.automation.status}`,
                  commandPointer: bucket.evidence_probe_command,
                  children: [
                    node({
                      id: `project/current-location/closure/overview/work-buckets/${bucket.rank}/evidence-probe`,
                      label: "evidence probe",
                      description: bucket.evidence_probe_command,
                      tooltip: "安全な verification command を実行し、probe record を生成する",
                      contextValue: `closure-work-bucket.evidence-probe.${bucket.action}`,
                      commandPointer: bucket.evidence_probe_command,
                    }),
                    ...(bucket.evidence_handoff_artifacts
                      ? [
                          node({
                            id: `project/current-location/closure/overview/work-buckets/${bucket.rank}/probe-record`,
                            label: "probe record",
                            description: bucket.evidence_handoff_artifacts.probe_record_path,
                            tooltip: `evidence-probe --out が生成する工程間 artifact\nwrite=${bucket.evidence_handoff_artifacts.write_policy}`,
                            contextValue: `closure-work-bucket.handoff.probe-record.${bucket.action}`,
                            commandPointer: bucket.evidence_handoff_artifacts.probe_record_path,
                          }),
                          node({
                            id: `project/current-location/closure/overview/work-buckets/${bucket.rank}/approval-draft-artifact`,
                            label: "approval draft artifact",
                            description: artifactStatusDescription(
                              activeApprovalDraftForAction(
                                current.recovery_handoff_artifacts,
                                bucket.action,
                              ),
                              bucket.evidence_handoff_artifacts.approval_draft_path,
                            ),
                            tooltip: artifactStatusTooltip(
                              activeApprovalDraftForAction(
                                current.recovery_handoff_artifacts,
                                bucket.action,
                              ),
                              bucket.evidence_handoff_artifacts.approval_draft_path,
                              bucket.evidence_handoff_artifacts.write_policy,
                            ),
                            contextValue: `closure-work-bucket.handoff.approval-draft.${bucket.action}`,
                            commandPointer:
                              activeApprovalDraftForAction(
                                current.recovery_handoff_artifacts,
                                bucket.action,
                              )?.path ?? bucket.evidence_handoff_artifacts.approval_draft_path,
                          }),
                        ]
                      : []),
                    node({
                      id: `project/current-location/closure/overview/work-buckets/${bucket.rank}/evidence-materialize`,
                      label: "evidence materialize",
                      description: bucket.evidence_materialize_command,
                      tooltip: "probe record から materialized evidence preview を生成する",
                      contextValue: `closure-work-bucket.evidence-materialize.${bucket.action}`,
                      commandPointer: bucket.evidence_materialize_command,
                    }),
                    node({
                      id: `project/current-location/closure/overview/work-buckets/${bucket.rank}/evidence-approval-draft`,
                      label: "approval draft",
                      description: bucket.evidence_approval_draft_command,
                      tooltip: "pending_human_review の非承認 draft を生成する",
                      contextValue: `closure-work-bucket.evidence-approval-draft.${bucket.action}`,
                      commandPointer: bucket.evidence_approval_draft_command,
                    }),
                    node({
                      id: `project/current-location/closure/overview/work-buckets/${bucket.rank}/evidence-apply-dry-run`,
                      label: "evidence apply dry-run",
                      description: bucket.evidence_apply_dry_run_command,
                      tooltip: `approval record が一致する場合だけ適用可能になることを確認する\nexecute=${bucket.evidence_apply_execute_command}\nwrite=${bucket.evidence_apply_write_policy}`,
                      contextValue: `closure-work-bucket.evidence-apply-dry-run.${bucket.action}`,
                      commandPointer: bucket.evidence_apply_dry_run_command,
                    }),
                    node({
                      id: `project/current-location/closure/overview/work-buckets/${bucket.rank}/evidence-patch`,
                      label: "evidence patch packet",
                      description: `approval-required candidates=${bucket.repair_plan.projection_items.reduce((sum, item) => sum + item.evidence_patch_plan.patch_candidates.length, 0)}`,
                      tooltip: `approval_scope_digest 付きの read-only packet を確認する\nfailed evidence は削除せず green evidence を追加投影する\nplaceholders=${bucket.repair_plan.projection_items.reduce((sum, item) => sum + item.evidence_patch_plan.patch_candidates.reduce((inner, candidate) => inner + candidate.placeholder_count, 0), 0)}\nprobe=${bucket.evidence_probe_command}\n${bucket.evidence_patch_command}`,
                      contextValue: `closure-work-bucket.evidence-patch.${bucket.action}`,
                      commandPointer: bucket.evidence_patch_command,
                    }),
                    ...bucket.repair_plan.projection_items.map((item) =>
                      node({
                        id: `project/current-location/closure/overview/work-buckets/${bucket.rank}/${item.plan_id}`,
                        label: item.plan_id,
                        description: `failed=${item.failed_evidence_count} patches=${item.evidence_patch_plan.patch_candidates.length}`,
                        tooltip: `${item.required_action}\nlatest=${item.latest_failed_at ?? "-"}\ntables=${item.required_green_tables.join(",") || "-"}\ncommands=${item.command_labels.join(",") || "-"}\nsource=${item.source_path}\nartifacts=${item.evidence_artifact_templates.map((template) => `${template.artifact_kind}:${template.artifact_path}`).join(",") || "-"}\npatches=${item.evidence_patch_plan.patch_candidates.map((candidate) => `${candidate.operation}:${candidate.preview_digest}:placeholders=${candidate.placeholder_count}`).join(",") || "-"}`,
                        contextValue: `closure-work-bucket.item.${bucket.action}`,
                        commandPointer: `helix closure evidence-patch --action ${bucket.action} --summary-json`,
                      }),
                    ),
                  ],
                }),
              ),
            }),
          ],
        }),
        node({
          id: "project/current-location/closure/remediation",
          label: "remediation",
          description: `done=${current.closure.remediation.done} missing=${current.closure.remediation.missing} reverify=${current.closure.remediation.reverify}`,
          contextValue: "current-location.closure.remediation",
          children: current.closure.remediation.items.map((item) =>
            node({
              id: `project/current-location/closure/remediation/${item.status}/${item.category}`,
              label: item.label,
              description: `${item.status} ${item.count} @${item.l12_layer}`,
              tooltip: `${item.required_action}\n${item.reasons.join("; ")}\n${item.subject_ids.slice(0, 40).join("\n")}`,
              contextValue: `closure-remediation.${item.status}`,
            }),
          ),
        }),
        node({
          id: "project/current-location/closure/evidence-plan",
          label: "evidence plan",
          description: `collect=${current.closure.queue.route_counts.collect_evidence} repair=${current.closure.queue.route_counts.repair_failed_evidence} reverse=${current.closure.queue.route_counts.reverse_design}`,
          tooltip:
            "closure queue の evidence gap を target table / postcheck command へ展開する read-only plan",
          contextValue: "current-location.closure.evidence-plan",
          children: [
            node({
              id: "project/current-location/closure/evidence-plan/collect",
              label: "collect evidence",
              description: "helix closure evidence-plan --action collect_evidence --summary-json",
              contextValue: "closure-evidence-plan.collect",
              commandPointer:
                "helix closure evidence-plan --action collect_evidence --summary-json",
              children:
                current.closure.evidence_templates
                  .find((template) => template.action === "collect_evidence")
                  ?.templates.map((template) =>
                    node({
                      id: `project/current-location/closure/evidence-plan/collect/${template.table}`,
                      label: template.table,
                      description: template.example_status,
                      tooltip: `${template.status_after_projection}\n${template.required_action}\n${template.required_fields.join(",")}`,
                      contextValue: "closure-evidence-template",
                      commandPointer:
                        "helix closure evidence-plan --action collect_evidence --summary-json",
                    }),
                  ) ?? [],
            }),
            node({
              id: "project/current-location/closure/evidence-plan/repair",
              label: "repair evidence",
              description:
                "helix closure evidence-plan --action repair_failed_evidence --summary-json",
              contextValue: "closure-evidence-plan.repair",
              commandPointer:
                "helix closure evidence-plan --action repair_failed_evidence --summary-json",
              children:
                current.closure.evidence_templates
                  .find((template) => template.action === "repair_failed_evidence")
                  ?.templates.map((template) =>
                    node({
                      id: `project/current-location/closure/evidence-plan/repair/${template.table}`,
                      label: template.table,
                      description: template.example_status,
                      tooltip: `${template.status_after_projection}\n${template.required_action}\n${template.required_fields.join(",")}`,
                      contextValue: "closure-evidence-template",
                      commandPointer:
                        "helix closure evidence-plan --action repair_failed_evidence --summary-json",
                    }),
                  ) ?? [],
            }),
            node({
              id: "project/current-location/closure/evidence-plan/reverse",
              label: "reverse design",
              description: "helix closure evidence-plan --action reverse_design --summary-json",
              contextValue: "closure-evidence-plan.reverse",
              commandPointer: "helix closure evidence-plan --action reverse_design --summary-json",
              children:
                current.closure.evidence_templates
                  .find((template) => template.action === "reverse_design")
                  ?.templates.map((template) =>
                    node({
                      id: `project/current-location/closure/evidence-plan/reverse/${template.table}`,
                      label: template.table,
                      description: template.example_status,
                      tooltip: `${template.status_after_projection}\n${template.required_action}\n${template.required_fields.join(",")}`,
                      contextValue: "closure-evidence-template",
                      commandPointer:
                        "helix closure evidence-plan --action reverse_design --summary-json",
                    }),
                  ) ?? [],
            }),
          ],
        }),
        node({
          id: "project/current-location/closure/evidence-materialize",
          label: "evidence materialize",
          description: `${current.closure.evidence_materialize.status} candidates=${current.closure.evidence_materialize.materialized_candidate_count} remaining=${current.closure.evidence_materialize.remaining_placeholder_count} blocked=${current.closure.evidence_materialize.blocked_candidate_count}`,
          tooltip: `${current.closure.evidence_materialize.required_action}\naction=${current.closure.evidence_materialize.action ?? "-"}\nfillable=${current.closure.evidence_materialize.fillable_placeholders.join(",") || "-"}\nremaining=${current.closure.evidence_materialize.remaining_placeholders.join(",") || "-"}\nwrite=${current.closure.evidence_materialize.write_policy}`,
          contextValue: `current-location.closure.evidence-materialize.${current.closure.evidence_materialize.status}`,
          commandPointer: current.closure.evidence_materialize.materialize_command,
          children: [
            node({
              id: "project/current-location/closure/evidence-materialize/probe",
              label: "probe",
              description: current.closure.evidence_materialize.probe_command,
              tooltip:
                "safe command を実行して output digest / completed_at を取得する read-only evidence probe",
              contextValue: "closure-evidence-materialize.probe",
              commandPointer: current.closure.evidence_materialize.probe_command,
            }),
            node({
              id: "project/current-location/closure/evidence-materialize/preview",
              label: "materialize preview",
              description: current.closure.evidence_materialize.materialize_command,
              tooltip: "probe record から preview を実値化する。ファイルや DB は変更しない",
              contextValue: "closure-evidence-materialize.preview",
              commandPointer: current.closure.evidence_materialize.materialize_command,
            }),
          ],
        }),
        node({
          id: "project/current-location/closure/evidence-apply",
          label: "evidence apply",
          description: `${current.closure.evidence_apply.status} candidates=${current.closure.evidence_apply.patch_candidate_count} allowed=${current.closure.evidence_apply.allowed_to_apply}`,
          tooltip: `materialize=${current.closure.evidence_apply.materialize_readiness_status}\napproval=${current.closure.evidence_apply.approval_valid}\nwrite=${current.closure.evidence_apply.write_policy}\n${current.closure.evidence_apply.blocked_reasons.join("\n")}`,
          contextValue: `current-location.closure.evidence-apply.${current.closure.evidence_apply.status}`,
          commandPointer: current.closure.evidence_apply.dry_run_command,
          children: [
            node({
              id: "project/current-location/closure/evidence-apply/dry-run",
              label: "dry-run",
              description: current.closure.evidence_apply.dry_run_command,
              tooltip: "materialized evidence と approval record を照合し、適用可否だけを確認する",
              contextValue: "closure-evidence-apply.dry-run",
              commandPointer: current.closure.evidence_apply.dry_run_command,
            }),
            node({
              id: "project/current-location/closure/evidence-apply/execute",
              label: "execute",
              description: current.closure.evidence_apply.execute_command,
              tooltip:
                "approval record が一致する場合だけ materialized evidence を PLAN または evidence artifact に適用する",
              contextValue: "closure-evidence-apply.execute",
              commandPointer: current.closure.evidence_apply.execute_command,
            }),
            node({
              id: "project/current-location/closure/evidence-apply/approval",
              label: "approval record",
              description: current.closure.evidence_apply.approval_record_fields.join(", "),
              tooltip: current.closure.evidence_apply.approval_record_fields.join("\n"),
              contextValue: "closure-evidence-apply.approval",
              commandPointer: current.closure.evidence_apply.dry_run_command,
            }),
            node({
              id: "project/current-location/closure/evidence-apply/approval-draft",
              label: "approval draft",
              description: current.closure.evidence_apply.approval_draft_command,
              tooltip:
                "materialized evidence の approval_scope_digest に束縛した非承認 draft を生成する",
              contextValue: "closure-evidence-apply.approval-draft",
              commandPointer: current.closure.evidence_apply.approval_draft_command,
            }),
          ],
        }),
        node({
          id: "project/current-location/closure/packets",
          label: "closure packets",
          description: String(current.closure.packets.total),
          contextValue: "current-location.closure.packets",
          children: current.closure.packets.items.map((packet) =>
            node({
              id: `project/current-location/closure/packets/${packet.next_action}`,
              label: packet.label,
              description: `${packet.count} @${packet.l12_layer}`,
              tooltip: `${packet.required_action}\n${packet.automation.batch_id}\n${packet.automation.machine_filter}\n${packet.automation.expected_transition}\n${packet.acceptance_criteria.join("\n")}\n${packet.plan_ids.slice(0, 40).join("\n")}`,
              contextValue: `closure-packet.${packet.next_action}`,
              children: [
                node({
                  id: `project/current-location/closure/packets/${packet.next_action}/automation`,
                  label: "automation",
                  description: `${packet.automation.batch_id} -> ${packet.automation.expected_transition}`,
                  tooltip: `${packet.automation.machine_filter}\n${packet.automation.promotion_gate}\n${packet.automation.review_command}\n${packet.automation.view_command}`,
                  contextValue: `closure-packet.automation.${packet.next_action}`,
                  commandPointer: packet.automation.review_command,
                }),
              ],
            }),
          ),
        }),
        node({
          id: "project/current-location/closure/next-action-ledger",
          label: "next-action ledger",
          description: `ready=${current.closure.next_action_ledger.status_counts.ready} evidence=${current.closure.next_action_ledger.status_counts.needs_evidence} repair=${current.closure.next_action_ledger.status_counts.needs_repair} reverse=${current.closure.next_action_ledger.status_counts.needs_reverse}`,
          tooltip: `${current.closure.next_action_ledger.write_policy}\n${current.closure.next_action_ledger.source_command}\n${current.closure.next_action_ledger.view_command}`,
          contextValue: "current-location.closure.next-action-ledger",
          children: current.closure.next_action_ledger.entries.map((entry) =>
            node({
              id: `project/current-location/closure/next-action-ledger/${entry.next_action}`,
              label: entry.ledger_id,
              description: `${entry.status} ${entry.count} @${entry.l12_layer}`,
              tooltip: `${entry.required_action}\n${entry.evidence_policy}\n${entry.automation.batch_id}\n${entry.automation.machine_filter}\n${entry.automation.expected_transition}\n${entry.primary_command}\n${entry.review_surface}\n${entry.acceptance_criteria.join("\n")}\n${entry.sample_plan_ids.join("\n")}`,
              contextValue: `closure-next-action.${entry.status}.${entry.next_action}`,
              commandPointer: entry.source_paths[0] ?? entry.primary_command,
            }),
          ),
        }),
        node({
          id: "project/current-location/closure/apply-readiness",
          label: "closure apply",
          description: `${current.closure.apply_readiness.status} close_ready=${current.closure.apply_readiness.close_ready_count}`,
          tooltip: `${current.closure.apply_readiness.review_window_command}\n${current.closure.apply_readiness.transition_window_command}\n${current.closure.apply_readiness.decision_draft_command}\n${current.closure.apply_readiness.dry_run_command}\n${current.closure.apply_readiness.execute_command}\n${current.closure.apply_readiness.reasons.join("\n")}`,
          contextValue: `current-location.closure.apply.${current.closure.apply_readiness.status}`,
          children: [
            node({
              id: "project/current-location/closure/apply-readiness/review-bundle",
              label: "review bundle",
              description: current.closure.apply_readiness.review_window_command,
              contextValue: "closure-apply.review-bundle",
              commandPointer: current.closure.apply_readiness.review_window_command,
            }),
            node({
              id: "project/current-location/closure/apply-readiness/transition-plan",
              label: "transition plan",
              description: current.closure.apply_readiness.transition_window_command,
              contextValue: "closure-apply.transition-plan",
              commandPointer: current.closure.apply_readiness.transition_window_command,
            }),
            node({
              id: "project/current-location/closure/apply-readiness/decision-draft",
              label: "decision draft",
              description: current.closure.apply_readiness.decision_draft_command,
              contextValue: "closure-apply.decision-draft",
              commandPointer: current.closure.apply_readiness.decision_draft_command,
            }),
            ...(closeReadyReviewWindows.length > 0
              ? [
                  node({
                    id: "project/current-location/closure/apply-readiness/review-windows",
                    label: "review windows",
                    description: `windows=${current.closure.apply_readiness.approval_window_count} total=${current.closure.apply_readiness.close_ready_count}`,
                    tooltip: tooltipLines([
                      `aggregate_digest=${current.closure.apply_readiness.aggregate_review_scope.approval_scope_digest}`,
                      `aggregate_artifacts=${current.closure.apply_readiness.aggregate_review_scope.evidence_totals.artifact_paths}`,
                      `aggregate_evidence=${current.closure.apply_readiness.aggregate_review_scope.evidence_totals.evidence_paths}`,
                      `aggregate_tests=${current.closure.apply_readiness.aggregate_review_scope.evidence_totals.test_runs_passed}/${current.closure.apply_readiness.aggregate_review_scope.evidence_totals.test_runs_total}`,
                      current.closure.apply_readiness.review_bundle_command,
                    ]),
                    contextValue: "closure-apply.review-windows",
                    commandPointer: current.closure.apply_readiness.review_window_command,
                    children: closeReadyReviewWindows.map((window) =>
                      node({
                        id: `project/current-location/closure/apply-readiness/review-windows/${window.page_index}`,
                        label: `page ${window.page_index}/${window.page_count}`,
                        description: `${window.current ? "current " : ""}${window.start}-${window.end} listed=${window.listed}`,
                        tooltip: tooltipLines([
                          `approval_scope_digest=${window.approval_scope_digest}`,
                          `offset=${window.offset}`,
                          `limit=${window.limit}`,
                          `omitted_before=${window.omitted_before}`,
                          `omitted_after=${window.omitted_after}`,
                          `plans=${window.review_scope.plan_ids.join(",") || "-"}`,
                          `coverage=${window.review_scope.coverage_ids.join(",") || "-"}`,
                          `layers=${window.review_scope.l12_layers.join(",") || "-"}`,
                          `artifacts=${window.review_scope.evidence_totals.artifact_paths}`,
                          `evidence=${window.review_scope.evidence_totals.evidence_paths}`,
                          `tests=${window.review_scope.evidence_totals.test_runs_passed}/${window.review_scope.evidence_totals.test_runs_total}`,
                          `runtime=${window.review_scope.evidence_totals.runtime_verification_accepted}/${window.review_scope.evidence_totals.runtime_verification_total}`,
                          `record=${window.decision_record_default_path}`,
                          `review=${window.review_window_command}`,
                          `transition=${window.transition_window_command}`,
                          `decision_draft=${window.decision_draft_command}`,
                          `decision_record=${window.decision_draft_record_command}`,
                        ]),
                        contextValue: `closure-apply.review-window.${window.current ? "current" : "page"}`,
                        commandPointer: window.review_window_command,
                        children: [
                          node({
                            id: `project/current-location/closure/apply-readiness/review-windows/${window.page_index}/review`,
                            label: "review bundle",
                            description: window.review_window_command,
                            contextValue: "closure-apply.review-window.review",
                            commandPointer: window.review_window_command,
                          }),
                          node({
                            id: `project/current-location/closure/apply-readiness/review-windows/${window.page_index}/transition`,
                            label: "transition plan",
                            description: window.transition_window_command,
                            contextValue: "closure-apply.review-window.transition",
                            commandPointer: window.transition_window_command,
                          }),
                          node({
                            id: `project/current-location/closure/apply-readiness/review-windows/${window.page_index}/decision-draft`,
                            label: "decision draft",
                            description: window.decision_draft_command,
                            contextValue: "closure-apply.review-window.decision-draft",
                            commandPointer: window.decision_draft_command,
                          }),
                          node({
                            id: `project/current-location/closure/apply-readiness/review-windows/${window.page_index}/decision-record`,
                            label: "decision record",
                            description: window.decision_draft_record_command,
                            tooltip: window.decision_record_default_path,
                            contextValue: "closure-apply.review-window.decision-record",
                            commandPointer: window.decision_draft_record_command,
                          }),
                        ],
                      }),
                    ),
                  }),
                ]
              : []),
            node({
              id: "project/current-location/closure/apply-readiness/dry-run",
              label: "apply dry-run",
              description: current.closure.apply_readiness.dry_run_command,
              contextValue: "closure-apply.dry-run",
              commandPointer: current.closure.apply_readiness.dry_run_command,
            }),
          ],
        }),
        node({
          id: "project/current-location/closure/queue",
          label: "closure queue",
          description: `close=${current.closure.queue.route_counts.close_ready} collect=${current.closure.queue.route_counts.collect_evidence} repair=${current.closure.queue.route_counts.repair_failed_evidence} reverse=${current.closure.queue.route_counts.reverse_design}`,
          contextValue: "current-location.closure.queue",
          children: current.closure.queue.items.slice(0, 80).map((item) =>
            node({
              id: `project/current-location/closure/queue/${item.priority}/${item.plan_id}`,
              label: item.plan_id,
              description: `${item.next_action} ${item.remediation_status}/${item.evidence.status} ${item.kind || "-"} @${item.l12_layer} ${item.coverage_id ?? "-"}`,
              tooltip: `${item.required_action}\n${item.evidence_action}\ncoverage=${item.coverage_id ?? "-"} ${item.coverage_label ?? ""}\nnext=${item.next_action}\n${item.source_path}\nartifact=${item.evidence.artifact_paths.length} trace=${item.evidence.trace_edges} tests=${item.evidence.test_runs.passed}/${item.evidence.test_runs.total} gates=${item.evidence.gate_runs.passed}/${item.evidence.gate_runs.total} runtime=${item.evidence.runtime_verification.accepted}/${item.evidence.runtime_verification.total}\ngaps=${item.evidence_gaps.map((gap) => `${gap.component}:${gap.status}`).join(",") || "-"}\n${item.evidence.evidence_paths.join("\n")}\n${item.reasons.join("; ")}`,
              contextValue: `closure-queue.${item.next_action}.${item.remediation_status}.${item.evidence.status}`,
              commandPointer: item.source_path,
            }),
          ),
        }),
      ],
    }),
    node({
      id: "project/current-location/operation-scope",
      label: "Operation scope",
      description: `designed=${current.operation_scope.designed} observed=${current.operation_scope.observed} observed_gap=${current.operation_scope.observed_gap} missing=${current.operation_scope.missing} reverify=${current.operation_scope.reverify}`,
      contextValue: "current-location.operation-scope",
      children: current.operation_scope.items.map((item) =>
        node({
          id: `project/current-location/operation-scope/${item.scope}`,
          label: item.label,
          description: `${item.status} design=${item.design_ids.length} observed=${item.observed_count} ${item.coverage_id}`,
          tooltip: `coverage=${item.coverage_id} ${item.coverage_label}\n${item.reasons.join("; ")}`,
          contextValue: `operation-scope.${item.status}`,
          children: [
            node({
              id: `project/current-location/operation-scope/${item.scope}/design`,
              label: "design declarations",
              description: String(item.design_ids.length),
              tooltip: item.design_ids.join("\n"),
              contextValue: "operation-scope.detail",
            }),
            node({
              id: `project/current-location/operation-scope/${item.scope}/observed`,
              label: "observed",
              description: String(item.observed_count),
              tooltip: item.observation_sources.join("\n") || "no accepted runtime observation",
              contextValue: "operation-scope.detail",
            }),
            node({
              id: `project/current-location/operation-scope/${item.scope}/observation-gap`,
              label: "observation gap",
              description:
                item.status === "designed" && item.observed_count === 0 ? "watch" : "clear",
              tooltip:
                item.status === "designed" && item.observed_count === 0
                  ? "設計済みだが accepted runtime observation が無い。運用時 view へ runtime evidence を投影する"
                  : "設計と runtime observation の状態は一致している",
              contextValue:
                item.status === "designed" && item.observed_count === 0
                  ? "operation-scope.observation-gap.watch"
                  : "operation-scope.observation-gap.clear",
            }),
            node({
              id: `project/current-location/operation-scope/${item.scope}/tables`,
              label: "evidence tables",
              description: item.evidence_tables.join(","),
              contextValue: "operation-scope.detail",
            }),
          ],
        }),
      ),
    }),
    node({
      id: "project/current-location/artifact-remap",
      label: "Artifact remap",
      description: `done=${current.artifact_remap.done} missing=${current.artifact_remap.missing} reverify=${current.artifact_remap.reverify}`,
      contextValue: "current-location.artifact-remap",
      children: [
        node({
          id: "project/current-location/artifact-remap/layers",
          label: "L12 remap layers",
          description: current.artifact_remap.layers
            .map((layer) => `${layer.layer}:${layer.status}`)
            .join(" "),
          contextValue: "artifact-remap.layers",
          children: current.artifact_remap.layers.map((layer) =>
            node({
              id: `project/current-location/artifact-remap/layers/${layer.layer}`,
              label: `${layer.layer} ${layer.label}`,
              description: `${layer.status} ${layer.drive_model} total=${layer.total} done=${layer.done} missing=${layer.missing} reverify=${layer.reverify}`,
              tooltip: `${layer.required_action}\n${summaryJsonPointer(layer.batch_command)}\n${layer.reasons.join("; ")}`,
              contextValue: `artifact-remap.layer.${layer.status}`,
              commandPointer: summaryJsonPointer(layer.batch_command),
            }),
          ),
        }),
        node({
          id: "project/current-location/artifact-remap/batch/reverify",
          label: "reverify batch",
          description: `count=${current.artifact_remap.reverify}`,
          tooltip: "helix artifact-remap batch --status reverify --summary-json",
          contextValue: "artifact-remap.batch.reverify",
          commandPointer: "helix artifact-remap batch --status reverify --summary-json",
        }),
        node({
          id: "project/current-location/artifact-remap/batch/missing",
          label: "missing batch",
          description: `count=${current.artifact_remap.missing}`,
          tooltip: "helix artifact-remap batch --status missing --summary-json",
          contextValue: "artifact-remap.batch.missing",
          commandPointer: "helix artifact-remap batch --status missing --summary-json",
        }),
        ...current.artifact_remap.items.slice(0, 80).map((item) =>
          node({
            id: `project/current-location/artifact-remap/${item.status}/${item.kind}/${item.artifact_id}`,
            label: item.artifact_id,
            description: `${item.status} ${item.legacy_layer ?? "-"}->${item.l12_layer ?? "-"} ${item.coverage_id ?? "-"}`,
            tooltip: `${item.kind} ${item.source_path}\ncoverage=${item.coverage_id ?? "-"} ${item.coverage_label ?? ""}\nzip=${item.zip_source_binding_ids.join(",") || "-"}\ntailoring=${item.tailoring_rule_ids.join(",") || "-"} detail=${item.tailoring_detail_levels.join(",") || "-"}\n${item.reasons.join("; ")}`,
            contextValue: `artifact-remap.${item.status}`,
          }),
        ),
      ],
    }),
  ];
  return node({
    id: "project/current-location",
    label: "Current location",
    description: `${current.layer ?? "unknown"} -> ${current.l12_layer ?? "unknown"} / ${current.status}`,
    tooltip: `boundary=${current.completion_boundary}`,
    contextValue: `current-location.${current.status}`,
    children,
    expanded: true,
  });
}

function projectLayerProgress(vm: VisualizationViewModel): TreeViewNode {
  return node({
    id: "project/layer-progress",
    label: "Layer progress",
    contextValue: "view.layer-progress",
    children: [
      node({
        id: "project/layer-progress/artifacts",
        label: "artifacts",
        contextValue: "metric-section",
        children: metricRows(
          "project/layer-progress/artifacts",
          vm.project.layer_progress.artifacts,
        ),
      }),
      node({
        id: "project/layer-progress/plans",
        label: "plans",
        contextValue: "metric-section",
        children: metricRows("project/layer-progress/plans", vm.project.layer_progress.plans),
      }),
      node({
        id: "project/layer-progress/gates",
        label: "gates",
        contextValue: "metric-section",
        children: metricRows("project/layer-progress/gates", vm.project.layer_progress.gates),
      }),
    ],
  });
}

function projectRuntimeEvidence(vm: VisualizationViewModel): TreeViewNode {
  return node({
    id: "project/runtime-evidence",
    label: "Runtime evidence",
    contextValue: "view.runtime-evidence",
    children: [
      node({
        id: "project/runtime-evidence/test-runs",
        label: "test runs",
        contextValue: "metric-section",
        children: metricRows(
          "project/runtime-evidence/test-runs",
          vm.project.runtime_evidence.test_runs,
        ),
      }),
      node({
        id: "project/runtime-evidence/runtime-verification",
        label: "runtime verification",
        contextValue: "metric-section",
        children: metricRows(
          "project/runtime-evidence/runtime-verification",
          vm.project.runtime_evidence.runtime_verification,
        ),
      }),
      node({
        id: "project/runtime-evidence/guardrails",
        label: "guardrails",
        contextValue: "metric-section",
        children: metricRows(
          "project/runtime-evidence/guardrails",
          vm.project.runtime_evidence.guardrail_decisions,
        ),
      }),
    ],
  });
}

function projectRoot(vm: VisualizationViewModel): TreeViewNode {
  return node({
    id: "project",
    label: "Project",
    description: vm.source_clock ?? "no snapshot",
    contextValue: "root.project",
    expanded: true,
    children: [
      boundaryNode("project", vm.view_boundaries.project),
      projectCurrentLocation(vm),
      projectLayerProgress(vm),
      node({
        id: "project/design-test-pair",
        label: "Design/test pair",
        description: `pair_edges=${vm.project.design_test_pair.pair_edges ?? "unknown"} orphan_nodes=${vm.project.design_test_pair.orphan_nodes ?? "unknown"}`,
        contextValue: "view.design-test-pair",
      }),
      node({
        id: "project/relation-graph",
        label: "Relation graph",
        description: `nodes=${vm.project.relation_graph.node_count} edges=${vm.project.relation_graph.edge_count}`,
        tooltip: vm.project.relation_graph.drilldown?.pointer,
        contextValue: vm.project.relation_graph.drilldown
          ? "view.relation-graph.copyable"
          : "view.relation-graph",
        commandPointer: vm.project.relation_graph.drilldown?.pointer,
      }),
      projectRuntimeEvidence(vm),
    ],
  });
}

function harnessRoot(vm: VisualizationViewModel): TreeViewNode {
  return node({
    id: "harness",
    label: "HARNESS",
    description: vm.source_clock ?? "no snapshot",
    contextValue: "root.harness",
    expanded: true,
    children: [
      boundaryNode("harness", vm.view_boundaries.harness),
      node({
        id: "harness/growth",
        label: "Harness growth",
        description: `series=${vm.harness.harness_growth.growth_series.length}`,
        contextValue: "view.harness-growth",
        children: [
          node({
            id: "harness/growth/artifacts",
            label: "artifacts",
            contextValue: "metric-section",
            children: metricRows(
              "harness/growth/artifacts",
              vm.harness.harness_growth.current_sections.artifacts,
            ),
          }),
          node({
            id: "harness/growth/plans",
            label: "plans",
            contextValue: "metric-section",
            children: metricRows(
              "harness/growth/plans",
              vm.harness.harness_growth.current_sections.plans,
            ),
          }),
          node({
            id: "harness/growth/gates",
            label: "gates",
            contextValue: "metric-section",
            children: metricRows(
              "harness/growth/gates",
              vm.harness.harness_growth.current_sections.gates,
            ),
          }),
        ],
      }),
      node({
        id: "harness/skill-agent-telemetry",
        label: "Skill/agent telemetry",
        contextValue: "view.skill-agent-telemetry",
        children: [
          node({
            id: "harness/skill-agent-telemetry/skills",
            label: "skill invocations",
            contextValue: "metric-section",
            children: metricRows(
              "harness/skill-agent-telemetry/skills",
              vm.harness.skill_agent_telemetry.skill_invocations,
            ),
          }),
          node({
            id: "harness/skill-agent-telemetry/models",
            label: "model runs",
            contextValue: "metric-section",
            children: metricRows(
              "harness/skill-agent-telemetry/models",
              vm.harness.skill_agent_telemetry.model_runs,
            ),
          }),
        ],
      }),
    ],
  });
}

export function buildVisualizationTreeView(vm: VisualizationViewModel): VisualizationTreeViewModel {
  return {
    schema_version: "visualization-tree-view.v1",
    source_clock: vm.source_clock,
    roots: [projectRoot(vm), harnessRoot(vm)],
    warnings: [...vm.shared_warnings],
  };
}

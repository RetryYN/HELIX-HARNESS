export type SummarySurfaceRawJsonHit = {
  path: string;
  command: string;
};

export type SummarySurfacePayload = {
  surface: string;
  payload: unknown;
};

export type SummarySurfaceContract = {
  surface: string;
  source_command: string;
  payload: Record<string, unknown>;
};

export type SummarySurfaceSemanticRequirement = {
  surface: string;
  path: string;
  reason: string;
};

export type SummarySurfaceCommandAudit = {
  status: "pass" | "unexpected_raw_json_command" | "catalog_drift" | "semantic_drift";
  catalog_status: "pass" | "drift";
  semantic_status: "pass" | "drift";
  checked_surface_count: number;
  excluded_surface_count: number;
  unexpected_count: number;
  allowed_fields: string[];
  excluded_surfaces: Array<{
    surface: string;
    source_command: string;
    reason: string;
  }>;
  surfaces: Array<{
    surface: string;
    source_command: string | null;
    unexpected_count: number;
    sample_unexpected_commands: SummarySurfaceRawJsonHit[];
  }>;
  expected_surfaces: string[];
  missing_surfaces: string[];
  unexpected_surfaces: string[];
  source_command_mismatches: Array<{
    surface: string;
    expected: string;
    actual: string | null;
  }>;
  semantic_missing: Array<SummarySurfaceSemanticRequirement>;
  unexpected_commands: Array<SummarySurfaceRawJsonHit & { surface: string }>;
};

export const SUMMARY_SURFACE_AUDIT_EXCLUDED_SURFACES = [
  {
    surface: "doctor-summary",
    source_command: "helix doctor --summary-json",
    reason:
      "doctor is a meta-diagnostic surface and would recursively invoke broad checks from the tree-view summary audit",
  },
  {
    surface: "progress-tree-view",
    source_command: "helix progress tree-view --summary-json",
    reason:
      "progress tree-view is the host surface for this audit, so self-inclusion would be recursive",
  },
];

export const SUMMARY_SURFACE_AUDIT_ALLOWED_FIELDS = [
  "full_source_command",
  "full_view_command",
  "full_review_bundle_command",
  "full_inject_command",
];

export const SUMMARY_SURFACE_SEMANTIC_REQUIREMENTS: SummarySurfaceSemanticRequirement[] = [
  {
    surface: "current-location",
    path: "current_location_frontier.commands.drive_model",
    reason: "Project view must retain current-location to drive-model navigation",
  },
  {
    surface: "current-location",
    path: "operation_scope.items",
    reason: "Hybrid L12 operation/log/KPI scope must remain visible",
  },
  {
    surface: "current-location",
    path: "skill_binding.top_items",
    reason: "Current location must expose skill binding candidates",
  },
  {
    surface: "drive-model",
    path: "candidate_count",
    reason: "Drive model summary must retain selectable model coverage",
  },
  {
    surface: "drive-model",
    path: "forward_spine_model",
    reason: "Hybrid operation keeps Forward as the default spine",
  },
  {
    surface: "skill-binding",
    path: "full_inject_command",
    reason: "Skill binding summary must expose injection provenance",
  },
  {
    surface: "skill-binding",
    path: "top_items",
    reason: "Skill binding summary must retain ranked recommendations",
  },
  {
    surface: "roadmap-current",
    path: "roadmap_position.frontier",
    reason: "Roadmap summary must connect schedule frontier to DB current location",
  },
  {
    surface: "roadmap-current",
    path: "sample_actions",
    reason: "Roadmap summary must retain machine-readable next work samples",
  },
  {
    surface: "vmodel-fit",
    path: "regression_guards.attention_boundary",
    reason: "V-model fit summary must separate machine work from human approval",
  },
  {
    surface: "vmodel-fit",
    path: "blockers.0.boundary",
    reason: "V-model blockers must expose their completion boundary",
  },
  {
    surface: "vmodel-fit",
    path: "sample_next_actions",
    reason: "V-model fit summary must retain next action classification",
  },
  {
    surface: "project-frontier",
    path: "vmodel_fit.regression_guards.attention_boundary",
    reason: "Project frontier must project V-model attention boundary to views",
  },
  {
    surface: "project-frontier",
    path: "skill_binding.top_items",
    reason: "Project frontier must keep skill binding visible to Project view",
  },
];

export const SUMMARY_SURFACE_CONTRACTS: SummarySurfaceContract[] = [
  {
    surface: "current-location",
    source_command: "helix current-location --summary-json",
    payload: {
      source_command: "helix current-location --summary-json",
      current_location_frontier: {
        schema_version: "current-location-frontier-summary.v1",
        frontier_type: "recovery_frontier",
        commands: {
          current_location: "helix current-location --summary-json",
          drive_model: "helix drive model --summary-json",
          recovery_plan: "helix recovery plan --summary-json",
          roadmap_current: "helix roadmap current --summary-json",
          vmodel_fit: "helix vmodel fit --summary-json",
          project_frontier: "helix progress frontier --summary-json",
        },
      },
      approval_review_gate: {
        action: "close_ready",
        current_window_command:
          "helix closure review-bundle --action close_ready --limit 20 --offset 0 --summary-json",
        decision_draft_record_command:
          "helix closure decision-draft --action close_ready --limit 20 --offset 0 --out .helix/tmp/closure/close_ready-decision-draft-offset-0.yml --summary-json",
      },
      operation_scope: {
        source_command: "helix current-location --summary-json",
        items: [],
      },
      skill_binding: {
        top_items: [],
      },
      commands: {
        current_location: "helix current-location --summary-json",
        closure_review_window:
          "helix closure review-bundle --action close_ready --limit 20 --offset 0 --summary-json",
        closure_decision_draft_record:
          "helix closure decision-draft --action close_ready --limit 20 --offset 0 --out .helix/tmp/closure/close_ready-decision-draft-offset-0.yml --summary-json",
        skill_binding: "helix skill suggest --current-location --summary-json",
      },
      view_command: "helix progress tree-view --summary-json",
      full_view_command: "helix progress tree-view --json",
    },
  },
  {
    surface: "drive-model",
    source_command: "helix drive model --summary-json",
    payload: {
      source_command: "helix drive model --summary-json",
      candidate_count: 12,
      forward_spine_model: "Forward",
      registered_entry_model_count: 10,
      missing_registered_entry_models: [],
      view_command: "helix progress tree-view --summary-json",
      full_view_command: "helix progress tree-view --json",
    },
  },
  {
    surface: "skill-binding",
    source_command: "helix skill suggest --current-location --summary-json",
    payload: {
      source_command: "helix skill suggest --current-location --summary-json",
      full_source_command: "helix skill suggest --current-location --json",
      full_inject_command: "helix skill suggest --current-location --inject --json",
      top_items: [
        {
          skill_path: "docs/skills/gate-planning.md",
          sample_reasons: ["scrum_operation_gap_signal"],
        },
      ],
      view_command: "helix progress tree-view --summary-json",
      full_view_command: "helix progress tree-view --json",
    },
  },
  {
    surface: "recovery-plan",
    source_command: "helix recovery plan --summary-json",
    payload: {
      source_command: "helix recovery plan --summary-json",
      view_command: "helix progress tree-view --summary-json",
      full_view_command: "helix progress tree-view --json",
    },
  },
  {
    surface: "roadmap-current",
    source_command: "helix roadmap current --summary-json",
    payload: {
      source_command: "helix roadmap current --summary-json",
      roadmap_position: {
        frontier: [],
      },
      sample_actions: [],
      view_command: "helix progress tree-view --summary-json",
      full_view_command: "helix progress tree-view --json",
    },
  },
  {
    surface: "artifact-remap-batch",
    source_command: "helix artifact-remap batch --summary-json",
    payload: {
      source_command: "helix artifact-remap batch --summary-json",
      view_command: "helix progress tree-view --summary-json",
      full_view_command: "helix progress tree-view --json",
    },
  },
  {
    surface: "progress-artifacts",
    source_command: "helix progress artifacts --summary-json",
    payload: {
      source_command: "helix progress artifacts --summary-json",
      full_source_command: "helix progress artifacts --json",
    },
  },
  {
    surface: "closure-overview",
    source_command: "helix closure overview --summary-json",
    payload: {
      source_command: "helix closure overview --summary-json",
      view_command: "helix progress tree-view --summary-json",
      full_view_command: "helix progress tree-view --json",
    },
  },
  {
    surface: "closure-batch",
    source_command: "helix closure batch --summary-json",
    payload: {
      source_command: "helix closure batch --summary-json",
      view_command: "helix progress tree-view --summary-json",
      full_view_command: "helix progress tree-view --json",
    },
  },
  {
    surface: "closure-evidence-plan",
    source_command: "helix closure evidence-plan --summary-json",
    payload: {
      source_command: "helix closure evidence-plan --summary-json",
      view_command: "helix progress tree-view --summary-json",
      full_view_command: "helix progress tree-view --json",
    },
  },
  {
    surface: "closure-evidence-patch",
    source_command: "helix closure evidence-patch --summary-json",
    payload: {
      source_command: "helix closure evidence-patch --summary-json",
      view_command: "helix progress tree-view --summary-json",
      full_view_command: "helix progress tree-view --json",
    },
  },
  {
    surface: "closure-evidence-probe",
    source_command: "helix closure evidence-probe --summary-json",
    payload: {
      source_command: "helix closure evidence-probe --summary-json",
      full_source_command: "helix closure evidence-probe --json",
      view_command: "helix progress tree-view --summary-json",
      full_view_command: "helix progress tree-view --json",
    },
  },
  {
    surface: "closure-evidence-materialize",
    source_command: "helix closure evidence-materialize --summary-json",
    payload: {
      source_command: "helix closure evidence-materialize --summary-json",
      view_command: "helix progress tree-view --summary-json",
      full_view_command: "helix progress tree-view --json",
    },
  },
  {
    surface: "closure-evidence-approval-draft",
    source_command: "helix closure evidence-approval-draft --summary-json",
    payload: {
      source_command: "helix closure evidence-approval-draft --summary-json",
      view_command: "helix progress tree-view --summary-json",
      full_view_command: "helix progress tree-view --json",
    },
  },
  {
    surface: "closure-evidence-apply",
    source_command: "helix closure evidence-apply --summary-json",
    payload: {
      source_command: "helix closure evidence-apply --summary-json",
      view_command: "helix progress tree-view --summary-json",
      full_view_command: "helix progress tree-view --json",
    },
  },
  {
    surface: "closure-review-bundle",
    source_command: "helix closure review-bundle --action close_ready --summary-json",
    payload: {
      source_command: "helix closure review-bundle --action close_ready --summary-json",
      current_window_command:
        "helix closure review-bundle --action close_ready --limit 1 --offset 0 --summary-json",
      full_source_command: "helix closure review-bundle --json",
      view_command: "helix progress tree-view --summary-json",
      full_view_command: "helix progress tree-view --json",
    },
  },
  {
    surface: "closure-transition-plan",
    source_command:
      "helix closure transition-plan --action close_ready --decision approve_closure_claim --summary-json",
    payload: {
      source_command:
        "helix closure transition-plan --action close_ready --decision approve_closure_claim --summary-json",
      current_window_command:
        "helix closure transition-plan --action close_ready --decision approve_closure_claim --limit 1 --offset 0 --summary-json",
      full_source_command:
        "helix closure transition-plan --action close_ready --decision approve_closure_claim --limit 1 --offset 0 --json",
      view_command: "helix progress tree-view --summary-json",
      full_view_command: "helix progress tree-view --json",
    },
  },
  {
    surface: "closure-decision-draft",
    source_command: "helix closure decision-draft --summary-json",
    payload: {
      source_command: "helix closure decision-draft --summary-json",
      view_command: "helix progress tree-view --summary-json",
      full_view_command: "helix progress tree-view --json",
    },
  },
  {
    surface: "closure-apply",
    source_command: "helix closure apply --dry-run --summary-json",
    payload: {
      source_command: "helix closure apply --dry-run --summary-json",
      full_source_command: "helix closure apply --dry-run --json",
      view_command: "helix progress tree-view --summary-json",
      full_view_command: "helix progress tree-view --json",
    },
  },
  {
    surface: "vmodel-fit",
    source_command: "helix vmodel fit --summary-json",
    payload: {
      source_command: "helix vmodel fit --summary-json",
      current_location_command: "helix current-location --summary-json",
      current_location_frontier: {
        schema_version: "current-location-frontier-summary.v1",
        frontier_type: "recovery_frontier",
        commands: {
          current_location: "helix current-location --summary-json",
          drive_model: "helix drive model --summary-json",
          recovery_plan: "helix recovery plan --summary-json",
          roadmap_current: "helix roadmap current --summary-json",
          vmodel_fit: "helix vmodel fit --summary-json",
          project_frontier: "helix progress frontier --summary-json",
        },
      },
      operation_scope: {
        source_command: "helix vmodel fit --summary-json",
        items: [],
      },
      scrum_operation: {
        source_package: "ハイブリッド設計ドキュメントv1-fixed.zip",
      },
      skill_binding: {
        source_command: "helix skill suggest --current-location --summary-json",
        full_source_command: "helix skill suggest --current-location --json",
        full_inject_command: "helix skill suggest --current-location --inject --json",
        top_items: [],
      },
      regression_guards: {
        attention_boundary: {
          status: "human_approval",
        },
      },
      blockers: [
        {
          boundary: {
            status: "human_approval",
          },
        },
      ],
      sample_next_actions: [],
      view_command: "helix progress tree-view --summary-json",
      full_view_command: "helix progress tree-view --json",
    },
  },
  {
    surface: "project-frontier",
    source_command: "helix progress frontier --summary-json",
    payload: {
      source_command: "helix progress frontier --summary-json",
      current_location_frontier: {
        schema_version: "current-location-frontier-summary.v1",
        frontier_type: "recovery_frontier",
        commands: {
          current_location: "helix current-location --summary-json",
          drive_model: "helix drive model --summary-json",
          recovery_plan: "helix recovery plan --summary-json",
          roadmap_current: "helix roadmap current --summary-json",
          vmodel_fit: "helix vmodel fit --summary-json",
          project_frontier: "helix progress frontier --summary-json",
        },
      },
      operation_scope: {
        source_command: "helix progress frontier --summary-json",
        items: [],
      },
      scrum_operation: {
        source_package: "ハイブリッド設計ドキュメントv1-fixed.zip",
      },
      vmodel_fit: {
        regression_guards: {
          attention_boundary: {
            status: "human_approval",
          },
        },
      },
      skill_binding: {
        top_items: [],
      },
      commands: {
        project_frontier: "helix progress frontier --summary-json",
        current_location: "helix current-location --summary-json",
        drive_model: "helix drive model --summary-json",
        vmodel_fit: "helix vmodel fit --summary-json",
        skill_binding: "helix skill suggest --current-location --summary-json",
      },
      write_policy: "read-only",
    },
  },
  {
    surface: "completion-decision-packet",
    source_command: "helix completion decision-packet --summary-json",
    payload: {
      source_command: "helix completion decision-packet --summary-json",
      full_review_bundle_command: "helix completion review-bundle --json",
      full_source_command: "helix completion decision-packet --json",
      completion_frontier: {
        source_command: "helix completion decision-packet --summary-json",
        project_frontier_source_command: "helix progress frontier --summary-json",
        commands: {
          project_frontier: "helix progress frontier --summary-json",
          current_location: "helix current-location --summary-json",
          vmodel_fit: "helix vmodel fit --summary-json",
          closure_review_window:
            "helix closure review-bundle --action close_ready --limit 20 --offset 0 --summary-json",
          closure_transition_window:
            "helix closure transition-plan --action close_ready --limit 20 --offset 0 --summary-json",
          closure_decision_draft:
            "helix closure decision-draft --action close_ready --limit 20 --offset 0 --summary-json",
        },
      },
      view_command: "helix progress tree-view --summary-json",
      full_view_command: "helix progress tree-view --json",
    },
  },
];

export function buildSummarySurfaceContractPayloads(): SummarySurfacePayload[] {
  return SUMMARY_SURFACE_CONTRACTS.map((contract) => ({
    surface: contract.surface,
    payload: contract.payload,
  }));
}

export function summaryJsonCommand(command: string): string {
  return command.replace(/ --json$/, " --summary-json");
}

export function summaryJsonCommandOrNull(command: string | null): string | null {
  return command === null ? null : summaryJsonCommand(command);
}

export function collectSummarySurfaceRawJsonHits(
  value: unknown,
  path: string[] = [],
): SummarySurfaceRawJsonHit[] {
  if (typeof value === "string") {
    const fieldName = path[path.length - 1] ?? "";
    const intentionallyFull = SUMMARY_SURFACE_AUDIT_ALLOWED_FIELDS.includes(fieldName);
    return value.includes(" --json") && !value.includes(" --summary-json") && !intentionallyFull
      ? [{ path: path.join("."), command: value }]
      : [];
  }
  if (Array.isArray(value)) {
    return value.flatMap((item, index) =>
      collectSummarySurfaceRawJsonHits(item, [...path, String(index)]),
    );
  }
  if (value !== null && typeof value === "object") {
    return Object.entries(value).flatMap(([key, item]) =>
      collectSummarySurfaceRawJsonHits(item, [...path, key]),
    );
  }
  return [];
}

function hasSummarySurfacePath(value: unknown, path: string): boolean {
  let current = value;
  for (const segment of path.split(".")) {
    if (Array.isArray(current)) {
      const index = Number(segment);
      if (!Number.isInteger(index) || index < 0 || index >= current.length) return false;
      current = current[index];
      continue;
    }
    if (current === null || typeof current !== "object" || !(segment in current)) return false;
    current = (current as Record<string, unknown>)[segment];
  }
  return current !== undefined;
}

export function buildSummarySurfaceCommandAudit(
  payloads: SummarySurfacePayload[],
): SummarySurfaceCommandAudit {
  const expectedSurfaceNames = SUMMARY_SURFACE_CONTRACTS.map((contract) => contract.surface);
  const expectedSourceCommands = new Map(
    SUMMARY_SURFACE_CONTRACTS.map((contract) => [contract.surface, contract.source_command]),
  );
  const surfaces = payloads.map((surface) => {
    const unexpectedCommands = collectSummarySurfaceRawJsonHits(surface.payload);
    const sourceCommand =
      typeof surface.payload === "object" &&
      surface.payload !== null &&
      "source_command" in surface.payload &&
      typeof surface.payload.source_command === "string"
        ? surface.payload.source_command
        : null;
    return {
      surface: surface.surface,
      source_command: sourceCommand,
      unexpected_count: unexpectedCommands.length,
      sample_unexpected_commands: unexpectedCommands.slice(0, 10),
    };
  });
  const actualSurfaceNames = surfaces.map((surface) => surface.surface);
  const missingSurfaces = expectedSurfaceNames.filter(
    (surface) => !actualSurfaceNames.includes(surface),
  );
  const unexpectedSurfaces = actualSurfaceNames.filter(
    (surface) => !expectedSourceCommands.has(surface),
  );
  const sourceCommandMismatches = surfaces.flatMap((surface) => {
    const expected = expectedSourceCommands.get(surface.surface);
    return expected !== undefined && surface.source_command !== expected
      ? [{ surface: surface.surface, expected, actual: surface.source_command }]
      : [];
  });
  const unexpectedCommands = surfaces.flatMap((surface) =>
    surface.sample_unexpected_commands.map((hit) => ({
      surface: surface.surface,
      ...hit,
    })),
  );
  const payloadBySurface = new Map(payloads.map((surface) => [surface.surface, surface.payload]));
  const semanticMissing = SUMMARY_SURFACE_SEMANTIC_REQUIREMENTS.filter((requirement) => {
    const payload = payloadBySurface.get(requirement.surface);
    return payload === undefined || !hasSummarySurfacePath(payload, requirement.path);
  });
  const catalogDrift =
    missingSurfaces.length > 0 ||
    unexpectedSurfaces.length > 0 ||
    sourceCommandMismatches.length > 0;
  const semanticDrift = semanticMissing.length > 0;
  return {
    status:
      unexpectedCommands.length > 0
        ? "unexpected_raw_json_command"
        : catalogDrift
          ? "catalog_drift"
          : semanticDrift
            ? "semantic_drift"
            : "pass",
    catalog_status: catalogDrift ? "drift" : "pass",
    semantic_status: semanticDrift ? "drift" : "pass",
    checked_surface_count: surfaces.length,
    excluded_surface_count: SUMMARY_SURFACE_AUDIT_EXCLUDED_SURFACES.length,
    unexpected_count: unexpectedCommands.length,
    allowed_fields: [...SUMMARY_SURFACE_AUDIT_ALLOWED_FIELDS],
    excluded_surfaces: [...SUMMARY_SURFACE_AUDIT_EXCLUDED_SURFACES],
    surfaces,
    expected_surfaces: expectedSurfaceNames,
    missing_surfaces: missingSurfaces,
    unexpected_surfaces: unexpectedSurfaces,
    source_command_mismatches: sourceCommandMismatches,
    semantic_missing: semanticMissing,
    unexpected_commands: unexpectedCommands.slice(0, 20),
  };
}

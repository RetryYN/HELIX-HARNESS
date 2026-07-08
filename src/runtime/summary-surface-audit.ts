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

export type SummarySurfaceCommandAudit = {
  status: "pass" | "unexpected_raw_json_command" | "catalog_drift";
  catalog_status: "pass" | "drift";
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
    reason: "progress tree-view is the host surface for this audit, so self-inclusion would be recursive",
  },
];

export const SUMMARY_SURFACE_AUDIT_ALLOWED_FIELDS = [
  "full_source_command",
  "full_view_command",
];

export const SUMMARY_SURFACE_CONTRACTS: SummarySurfaceContract[] = [
  {
    surface: "current-location",
    source_command: "helix current-location --summary-json",
    payload: {
      source_command: "helix current-location --summary-json",
      view_command: "helix progress tree-view --summary-json",
      full_view_command: "helix progress tree-view --json",
    },
  },
  {
    surface: "drive-model",
    source_command: "helix drive model --summary-json",
    payload: {
      source_command: "helix drive model --summary-json",
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
    source_command: "helix closure review-bundle --summary-json",
    payload: {
      source_command: "helix closure review-bundle --summary-json",
      view_command: "helix progress tree-view --summary-json",
      full_view_command: "helix progress tree-view --json",
    },
  },
  {
    surface: "closure-transition-plan",
    source_command: "helix closure transition-plan --summary-json",
    payload: {
      source_command: "helix closure transition-plan --summary-json",
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
  const catalogDrift =
    missingSurfaces.length > 0 ||
    unexpectedSurfaces.length > 0 ||
    sourceCommandMismatches.length > 0;
  return {
    status:
      unexpectedCommands.length > 0
        ? "unexpected_raw_json_command"
        : catalogDrift
          ? "catalog_drift"
          : "pass",
    catalog_status: catalogDrift ? "drift" : "pass",
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
    unexpected_commands: unexpectedCommands.slice(0, 20),
  };
}

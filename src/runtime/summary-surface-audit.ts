export type SummarySurfaceRawJsonHit = {
  path: string;
  command: string;
};

export type SummarySurfacePayload = {
  surface: string;
  payload: unknown;
};

export type SummarySurfaceCommandAudit = {
  status: "pass" | "unexpected_raw_json_command";
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
  const unexpectedCommands = surfaces.flatMap((surface) =>
    surface.sample_unexpected_commands.map((hit) => ({
      surface: surface.surface,
      ...hit,
    })),
  );
  return {
    status: unexpectedCommands.length === 0 ? "pass" : "unexpected_raw_json_command",
    checked_surface_count: surfaces.length,
    excluded_surface_count: SUMMARY_SURFACE_AUDIT_EXCLUDED_SURFACES.length,
    unexpected_count: unexpectedCommands.length,
    allowed_fields: [...SUMMARY_SURFACE_AUDIT_ALLOWED_FIELDS],
    excluded_surfaces: [...SUMMARY_SURFACE_AUDIT_EXCLUDED_SURFACES],
    surfaces,
    unexpected_commands: unexpectedCommands.slice(0, 20),
  };
}

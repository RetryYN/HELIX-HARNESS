import { describe, expect, it } from "vitest";
import {
  SUMMARY_SURFACE_CONTRACTS,
  buildSummarySurfaceCommandAudit,
  buildSummarySurfaceContractPayloads,
  collectSummarySurfaceRawJsonHits,
} from "../src/runtime/summary-surface-audit";

describe("summary surface audit", () => {
  it("allows explicit full command fields but rejects raw json in view fields", () => {
    expect(
      collectSummarySurfaceRawJsonHits({
        source_command: "helix current-location --summary-json",
        nested: [
          {
            full_source_command: "helix current-location --json",
            full_view_command: "helix progress tree-view --json",
          },
          {
            view_command: "helix progress tree-view --json",
          },
        ],
      }),
    ).toEqual([
      {
        path: "nested.1.view_command",
        command: "helix progress tree-view --json",
      },
    ]);
  });

  it("passes when contract payloads match the summary surface catalog", () => {
    const audit = buildSummarySurfaceCommandAudit(buildSummarySurfaceContractPayloads());

    expect(audit).toMatchObject({
      status: "pass",
      catalog_status: "pass",
      checked_surface_count: SUMMARY_SURFACE_CONTRACTS.length,
      missing_surfaces: [],
      unexpected_surfaces: [],
      source_command_mismatches: [],
      unexpected_commands: [],
    });
    expect(audit.surfaces.map((surface) => surface.surface)).toEqual(
      SUMMARY_SURFACE_CONTRACTS.map((contract) => contract.surface),
    );
  });

  it("fails closed on catalog drift even when raw json commands are otherwise clean", () => {
    const [first, ...rest] = buildSummarySurfaceContractPayloads();
    const audit = buildSummarySurfaceCommandAudit([
      {
        surface: first.surface,
        payload: {
          source_command: "helix wrong --summary-json",
        },
      },
      ...rest.slice(0, -1),
      {
        surface: "unknown-surface",
        payload: {
          source_command: "helix unknown --summary-json",
        },
      },
    ]);

    expect(audit.status).toBe("catalog_drift");
    expect(audit.catalog_status).toBe("drift");
    expect(audit.missing_surfaces).toEqual([SUMMARY_SURFACE_CONTRACTS.at(-1)?.surface]);
    expect(audit.unexpected_surfaces).toEqual(["unknown-surface"]);
    expect(audit.source_command_mismatches).toEqual([
      {
        surface: first.surface,
        expected: SUMMARY_SURFACE_CONTRACTS[0].source_command,
        actual: "helix wrong --summary-json",
      },
    ]);
  });
});

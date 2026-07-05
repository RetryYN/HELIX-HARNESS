import { randomUUID } from "node:crypto";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  HELIX_REQUIREMENTS_BINDING_CONFIG_PATH,
  HELIX_REQUIREMENTS_BINDING_DEFAULTS,
  HELIX_REQUIREMENTS_BINDING_SCHEMA_VERSION,
  loadRequirementsBindingConfig,
  parseRequirementsBindingConfigText,
} from "../src/config/requirements-binding";
import type { L1L2ConsistencyInput } from "../src/lint/l1-l2-consistency";
import { buildL1L2GapCheckPacket } from "../src/lint/l1-l2-gap-check";
import { projectRefactorCandidateSignals } from "../src/state-db/feedback-projections";
import type { HarnessDb } from "../src/state-db/index";

function baseL1L2Input(): L1L2ConsistencyInput {
  return {
    screenDesignPresent: true,
    l1ScreenIds: ["PM-01"],
    screenListIds: ["PM-01"],
    uiElementIds: ["PM-01"],
    wireframeIds: ["PM-01"],
    flowReferencedIds: ["PM-01"],
    mockPairArtifact: "self",
  };
}

describe("requirements-binding config", () => {
  it("parses the HELIX requirements-binding config schema", () => {
    const parsed = parseRequirementsBindingConfigText(
      JSON.stringify(HELIX_REQUIREMENTS_BINDING_DEFAULTS),
    );

    expect(parsed.ok).toBe(true);
    expect(parsed.config.schemaVersion).toBe(HELIX_REQUIREMENTS_BINDING_SCHEMA_VERSION);
    expect(parsed.config.refactorCandidates.thresholds.splitModuleLines).toBe(700);
    expect(parsed.config.l1L2GapCheck.viewpoints).toHaveLength(8);
  });

  it("fails closed for invalid config shape", () => {
    const parsed = parseRequirementsBindingConfigText(
      JSON.stringify({
        schemaVersion: HELIX_REQUIREMENTS_BINDING_SCHEMA_VERSION,
        refactorCandidates: {
          scanRoots: [],
          thresholds: {},
          policyTerms: [],
        },
        l1L2GapCheck: { maxRounds: 0, viewpoints: [] },
      }),
    );

    expect(parsed.ok).toBe(false);
    expect(parsed.messages.join("\n")).toContain("requirements-binding-config - violation");
  });

  it("uses config-driven L1/L2 gap-check policy", () => {
    const packet = buildL1L2GapCheckPacket(baseL1L2Input(), {
      ...HELIX_REQUIREMENTS_BINDING_DEFAULTS.l1L2GapCheck,
      maxRounds: 5,
      viewpoints: HELIX_REQUIREMENTS_BINDING_DEFAULTS.l1L2GapCheck.viewpoints.slice(0, 2),
    });

    expect(packet.maxRounds).toBe(5);
    expect(packet.viewpoints).toHaveLength(2);
  });

  it("loads configured refactor thresholds for projection", () => {
    const repoRoot = join(tmpdir(), `helix-requirements-binding-${randomUUID()}`);
    try {
      mkdirSync(join(repoRoot, "src"), { recursive: true });
      mkdirSync(join(repoRoot, ".helix", "config"), { recursive: true });
      writeFileSync(
        join(repoRoot, "src", "fixture.ts"),
        Array.from({ length: 950 }, (_, i) => `function check${i}() { return ${i}; }`).join("\n"),
      );

      const config = {
        ...HELIX_REQUIREMENTS_BINDING_DEFAULTS,
        refactorCandidates: {
          ...HELIX_REQUIREMENTS_BINDING_DEFAULTS.refactorCandidates,
          thresholds: {
            ...HELIX_REQUIREMENTS_BINDING_DEFAULTS.refactorCandidates.thresholds,
            splitModuleLines: 10_000,
            splitModuleExports: 10_000,
          },
        },
      };
      writeFileSync(join(repoRoot, HELIX_REQUIREMENTS_BINDING_CONFIG_PATH), JSON.stringify(config));

      const loaded = loadRequirementsBindingConfig(repoRoot, { requireFile: true });
      expect(loaded.ok).toBe(true);
      expect(loaded.config.refactorCandidates.thresholds.splitModuleLines).toBe(10_000);

      const events: Array<{ table: string; row: Record<string, unknown> }> = [];
      projectRefactorCandidateSignals(repoRoot, {} as HarnessDb, {
        nowIso: () => "2026-07-06T00:00:00.000Z",
        stableId: (prefix, value) => `${prefix}:${value}`,
        recordProjectionEvent: (_db, event) => {
          events.push({ table: event.table, row: event.row });
          return { table: event.table, id: event.id, evidence_path: "" };
        },
      });

      expect(events).toHaveLength(0);
    } finally {
      rmSync(repoRoot, { recursive: true, force: true });
    }
  });
});

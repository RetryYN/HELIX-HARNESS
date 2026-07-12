import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { buildVisualizationEvidence } from "../src/state-db/visualization-evidence";
import type { VisualizationViewModel } from "../src/state-db/visualization-view-model";

describe("PLAN-L7-450-state-db-vscode-decoupling behavior", () => {
  it("U-SBOUND-001: state-db evidence projectionはvscode presentationへ依存しない", () => {
    const source = readFileSync("src/state-db/projection-writer.ts", "utf8");
    expect(source).not.toMatch(/from ["'][^"']*vscode\//);
    const viewModel = {
      source_clock: "clock-1",
      project: { current_location: { phase: "L7" } },
      harness: { status: "active" },
      shared_warnings: ["warning"],
    } as unknown as VisualizationViewModel;
    const first = buildVisualizationEvidence(viewModel);
    const second = buildVisualizationEvidence(structuredClone(viewModel));
    expect(first).toEqual(second);
    expect(first).toEqual(
      expect.objectContaining({
        schema_version: "visualization-evidence.v1",
        root_ids: ["project", "harness"],
        root_count: 2,
        warnings_count: 1,
      }),
    );
    expect(first.node_count).toBeGreaterThan(2);
  });
});

import { describe, expect, it } from "vitest";
import { buildToolAugmentationRegistryReport } from "../src/runtime/tool-augmentation-registry";

describe("tool augmentation registry", () => {
  it("keeps task-lens tool candidates as suggestions, not executable evidence", () => {
    const report = buildToolAugmentationRegistryReport({
      task: "設計と検証のために browser と LSP の候補を見たい",
    });

    expect(report.ok).toBe(true);
    expect(report.schema_version).toBe("tool-augmentation-registry.v1");
    expect(report.task_lenses).toEqual(expect.arrayContaining(["design", "verification"]));
    expect(report.registry).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          tool_id: "tool:lsp-readonly",
          requirements: expect.objectContaining({
            read: true,
            write: false,
            network: false,
            credential: false,
            sandbox: false,
          }),
        }),
      ]),
    );
    expect(
      report.suggestions.every((suggestion) => suggestion.auto_execute_allowed === false),
    ).toBe(true);
    expect(report.suggestions.every((suggestion) => suggestion.evidence_claim === false)).toBe(
      true,
    );
    expect(report.blocked_tools).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ tool_id: "tool:browser-dry-run" }),
        expect.objectContaining({ tool_id: "tool:issue-tracker-readonly" }),
      ]),
    );
  });
});

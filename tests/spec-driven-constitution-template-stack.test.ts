import { describe, expect, it } from "vitest";
import { buildConstitutionTemplateStackReport } from "../src/runtime/constitution-template-stack";

describe("spec-driven constitution template stack", () => {
  it("does not silently override same-priority template conflicts", () => {
    const report = buildConstitutionTemplateStackReport([
      { key: "plan-scaffold", source: "core", priority: 10, content: "core" },
      { key: "plan-scaffold", source: "project", priority: 10, content: "project" },
    ]);

    expect(report.ok).toBe(false);
    expect(report.findings).toEqual([
      expect.objectContaining({ code: "template_conflict_not_silent", severity: "error" }),
    ]);
    expect(report.resolved_artifacts[0]).toMatchObject({
      key: "plan-scaffold",
      selected_source: "project",
      resolver_source: "project:10",
    });
    expect(report.resolved_artifacts[0].digest).toMatch(/^sha256:[a-f0-9]{64}$/);
  });

  it("separates warning-only constitution findings from blockers", () => {
    const report = buildConstitutionTemplateStackReport([
      { key: "role-brief", source: "core", priority: 1, content: "core" },
      { key: "role-brief", source: "role", priority: 2, content: "role" },
    ]);

    expect(report.ok).toBe(true);
    expect(report.findings).toEqual([
      expect.objectContaining({ code: "template_override_reason_missing", severity: "warning" }),
    ]);
  });
});

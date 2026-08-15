import { describe, expect, it } from "vitest";
import { adaptLegacyWorkflowClassification } from "../src/workflow/workflow-classification-legacy-adapter";

describe("workflow classification legacy input-only adapter", () => {
  it("U-WFLEG-001: legacy modeをtyped identityへ一方向変換する", () => {
    expect(
      adaptLegacyWorkflowClassification({ legacy_field: "mode", legacy_value: "reverse" }),
    ).toMatchObject({
      disposition: "converted",
      classification: { target_axis: "workflow_model", target_id: "REVERSE" },
      source: { field: "mode", token: "reverse" },
      emit_legacy_identity: false,
      exit_code: 0,
    });
  });

  it("U-WFLEG-002: case-driven modelとworkflow modelのaxisを混同しない", () => {
    expect(
      adaptLegacyWorkflowClassification({ legacy_field: "mode", legacy_value: "discovery" })
        .classification,
    ).toEqual({ target_axis: "case_driven_model", target_id: "DISCOVERY_POC" });
    expect(
      adaptLegacyWorkflowClassification({ legacy_field: "mode", legacy_value: "recovery" })
        .classification,
    ).toEqual({ target_axis: "workflow_model", target_id: "RECOVERY" });
  });

  it("U-WFLEG-003: collapsed legacy値を推測せずfail-closeする", () => {
    for (const legacy_value of ["forward", "scrum", "design_bottomup", "verification"]) {
      const receipt = adaptLegacyWorkflowClassification({ legacy_field: "mode", legacy_value });
      expect(receipt).toMatchObject({
        disposition: "ambiguous",
        classification: null,
        emit_legacy_identity: false,
        exit_code: 1,
      });
      expect(receipt.warnings[0]?.code).toBe("legacy-workflow-ambiguous");
    }
  });

  it("U-WFLEG-004: unknown値をForwardへ丸めない", () => {
    expect(
      adaptLegacyWorkflowClassification({ legacy_field: "model", legacy_value: "mystery" }),
    ).toMatchObject({
      disposition: "unsupported",
      classification: null,
      source: { field: "model", token: "mystery" },
      emit_legacy_identity: false,
      exit_code: 1,
    });
  });

  it("U-WFLEG-005: receiptにlegacy identityをcurrent fieldとして再出力しない", () => {
    const receipt = adaptLegacyWorkflowClassification({
      legacy_field: "mode",
      legacy_value: "version_up",
    });
    expect(receipt.classification).toEqual({
      target_axis: "workflow_model",
      target_id: "VERSION_UP",
    });
    expect(Object.keys(receipt)).not.toContain("mode");
    expect(Object.keys(receipt)).not.toContain("model");
    expect(JSON.stringify(receipt.classification)).not.toMatch(/catalog_route_id|route_class/u);
  });
});

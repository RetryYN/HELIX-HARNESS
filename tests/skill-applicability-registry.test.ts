import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  adaptLegacySkillApplicability,
  loadSkillApplicabilityRegistry,
  parseSkillApplicability,
  SKILL_APPLICABILITY_REGISTRY_PATH,
  skillApplicabilityRegistrySchema,
} from "../src/schema/skill-applicability-registry.js";

describe("skill applicability registry", () => {
  it("loads requirements-owned authority and binds the workflow registry", () => {
    const registry = loadSkillApplicabilityRegistry();
    expect(registry.registry_version).toBe("1.0.0");
    expect(registry.identity_reference.registry_version).toBe("1.1.5");
    expect(registry.current_contract).toEqual(
      expect.objectContaining({
        positive_field: "applicable_identities",
        negative_field: "excluded_identities",
        implicit_default: false,
        emit_legacy_identity: false,
      }),
    );
  });

  it("accepts separate typed identities without folding their axes", () => {
    expect(
      parseSkillApplicability({
        applicable_identities: [
          { target_axis: "development_style", target_id: "PRODUCTION_SCRUM" },
          { target_axis: "case_driven_model", target_id: "DISCOVERY_POC" },
        ],
        excluded_identities: [{ target_axis: "workflow_model", target_id: "INCIDENT" }],
      }),
    ).toEqual({
      applicable_identities: [
        { target_axis: "development_style", target_id: "PRODUCTION_SCRUM" },
        { target_axis: "case_driven_model", target_id: "DISCOVERY_POC" },
      ],
      excluded_identities: [{ target_axis: "workflow_model", target_id: "INCIDENT" }],
    });
  });

  it.each([
    [
      "unknown identity",
      { applicable_identities: [{ target_axis: "workflow_model", target_id: "UNKNOWN" }] },
      "unknown skill applicability identity",
    ],
    [
      "axis mismatch",
      { applicable_identities: [{ target_axis: "workflow_model", target_id: "PRODUCTION_SCRUM" }] },
      "axis mismatch",
    ],
    [
      "duplicate identity",
      {
        applicable_identities: [
          { target_axis: "workflow_model", target_id: "REVERSE" },
          { target_axis: "workflow_model", target_id: "REVERSE" },
        ],
      },
      "duplicate skill applicability identity",
    ],
    [
      "polarity conflict",
      {
        applicable_identities: [{ target_axis: "workflow_model", target_id: "REVERSE" }],
        excluded_identities: [{ target_axis: "workflow_model", target_id: "REVERSE" }],
      },
      "polarity conflict",
    ],
    ["implicit default", { applicable_identities: [] }, "Array must contain at least 1 element(s)"],
  ])("rejects %s", (_name, input, message) => {
    expect(() => parseSkillApplicability(input)).toThrow(message);
  });

  it("converts only unambiguous legacy input and records its source", () => {
    expect(adaptLegacySkillApplicability([" Reverse ", "recovery"])).toEqual({
      disposition: "converted",
      identities: [
        { target_axis: "workflow_model", target_id: "REVERSE" },
        { target_axis: "workflow_model", target_id: "RECOVERY" },
      ],
      warnings: [
        { source_field: "drive_models", normalized_token: "reverse" },
        { source_field: "drive_models", normalized_token: "recovery" },
      ],
    });
    expect(adaptLegacySkillApplicability(["Forward"])).toEqual({
      disposition: "ambiguous",
      token: "forward",
    });
    expect(adaptLegacySkillApplicability(["mystery"])).toEqual({
      disposition: "unsupported",
      token: "mystery",
    });
  });

  it("rejects registry shape drift before runtime use", () => {
    const raw = JSON.parse(
      readFileSync(resolve(process.cwd(), SKILL_APPLICABILITY_REGISTRY_PATH), "utf8"),
    ) as Record<string, unknown>;
    const current = raw.current_contract as Record<string, unknown>;
    current.emit_legacy_identity = true;
    expect(() => skillApplicabilityRegistrySchema.parse(raw)).toThrow();
  });
});

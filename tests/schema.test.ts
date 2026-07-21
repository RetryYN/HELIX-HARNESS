import { describe, expect, it } from "vitest";
import {
  CANONICAL_LAYERS,
  COMPATIBILITY_LAYERS,
  COMPATIBILITY_V_MODEL_PAIRS,
  canonicalLayerSchema,
  compatibilityLayerSchema,
  deliveryRouteSchema,
  kindSchema,
  recommendedCommandV1Schema,
  V_MODEL_PAIRS,
  VALID_ARTIFACT_TYPES,
  VALID_DELIVERY_ROUTES,
  VALID_KINDS,
  VALID_LAYERS,
  VALID_ORCHESTRATION_MODES,
} from "../src/schema";
import { planIdSchema } from "../src/schema/frontmatter";

describe("planIdSchema (§1.10 A、NN = d{2,} で 99 ceiling 解消)", () => {
  it("2 桁 plan_id を受理", () => {
    expect(planIdSchema.safeParse("PLAN-L7-99-sub-doc-catalog-drift-gate").success).toBe(true);
    expect(planIdSchema.safeParse("PLAN-DISCOVERY-01-workflow").success).toBe(true);
  });

  it("3 桁 plan_id (99 到達後) を受理 (L7-100+)", () => {
    expect(
      planIdSchema.safeParse("PLAN-L7-100-standard-deliverable-section-structure").success,
    ).toBe(true);
    expect(planIdSchema.safeParse("PLAN-REVERSE-123-x").success).toBe(true);
  });

  it("1 桁 NN / 不正 token は棄却", () => {
    expect(planIdSchema.safeParse("PLAN-L7-5-x").success).toBe(false);
    expect(planIdSchema.safeParse("PLAN-FOO-01-x").success).toBe(false);
  });
});

describe("schema (zod single source, ADR-001 / requirements_v1.2 §1)", () => {
  it("L1-L12 + cross = 13 canonical layers", () => {
    expect(CANONICAL_LAYERS).toHaveLength(13);
    expect(VALID_LAYERS).toEqual(CANONICAL_LAYERS);
    expect(VALID_LAYERS).not.toContain("L0");
    expect(VALID_LAYERS).not.toContain("L14");
    expect(VALID_LAYERS).toContain("cross");
    expect(canonicalLayerSchema.safeParse("L12").success).toBe(true);
    expect(canonicalLayerSchema.safeParse("L14").success).toBe(false);
  });

  it("reads L0-L14 only through the separate compatibility schema", () => {
    expect(COMPATIBILITY_LAYERS).toHaveLength(16);
    expect(compatibilityLayerSchema.safeParse("L0").success).toBe(true);
    expect(compatibilityLayerSchema.safeParse("L14").success).toBe(true);
  });

  it("12 kinds incl. charter (L0 企画); zod rejects unknown", () => {
    expect(VALID_KINDS).toHaveLength(12);
    expect(kindSchema.safeParse("impl").success).toBe(true);
    expect(kindSchema.safeParse("charter").success).toBe(true);
    expect(kindSchema.safeParse("nope").success).toBe(false);
  });

  it("19 artifact types (test_design / test_code 分離、§1.7)", () => {
    expect(VALID_ARTIFACT_TYPES).toHaveLength(19);
    expect(VALID_ARTIFACT_TYPES).toContain("test_design");
    expect(VALID_ARTIFACT_TYPES).toContain("test_code");
  });

  it("5 orchestration modes", () => {
    expect(VALID_ORCHESTRATION_MODES).toHaveLength(5);
    expect(VALID_ORCHESTRATION_MODES).toContain("claude_judge_codex_impl");
  });

  it("defines four delivery routes including V-design plus Scrum implementation", () => {
    expect(VALID_DELIVERY_ROUTES).toEqual([
      "FULL_L1_L12_V",
      "PRODUCTION_SCRUM_REDUCED_V",
      "V_DESIGN_SCRUM_IMPLEMENTATION",
      "DISCOVERY_POC",
    ]);
    expect(deliveryRouteSchema.safeParse("V_DESIGN_SCRUM_IMPLEMENTATION").success).toBe(true);
    expect(deliveryRouteSchema.safeParse("SCRUM_WITHOUT_L3").success).toBe(false);
  });

  it("uses L1-L12 canonical pairs and isolates legacy projection pairs", () => {
    expect(V_MODEL_PAIRS.L6).toBe("L7");
    expect(V_MODEL_PAIRS).toEqual({
      L1: "L12",
      L2: "L11",
      L3: "L10",
      L4: "L9",
      L5: "L8",
      L6: "L7",
    });
    expect(COMPATIBILITY_V_MODEL_PAIRS.L1).toBe("L14");
  });

  const legacyRuntimeName = ["ut", "tdd"].join("-");

  it("RecommendedCommandV1 rejects legacy runtime command, accepts helix", () => {
    expect(
      recommendedCommandV1Schema.safeParse({
        schema_version: "v1",
        command: `${legacyRuntimeName} plan draft`,
        safety: {},
      }).success,
    ).toBe(false);
    expect(
      recommendedCommandV1Schema.safeParse({
        schema_version: "v1",
        command: "helix plan draft",
        safety: {},
      }).success,
    ).toBe(true);
  });
});

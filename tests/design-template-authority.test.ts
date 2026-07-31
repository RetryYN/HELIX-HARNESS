// PLAN-L7-491-design-template-json-authority
import { describe, expect, it } from "vitest";
import {
  compileTemplateShadowReport,
  designTemplateSemanticDigest,
  evaluateTemplateApplicability,
  validateDesignTemplate,
  validateDesignTemplateRegistry,
  verifyGeneratedDesignView,
} from "../src/design/design-template-authority";

const context = {
  schemaVersion: "helix-design-template.v1" as const,
  currentPairs: [["L6", "L7"]] as const,
  allowedFieldPaths: new Set(["project.kind"]),
};
function template(overrides: Record<string, unknown> = {}) {
  const value: Record<string, unknown> = {
    schema_version: "helix-design-template.v1",
    template_id: "TPL-CORE",
    template_version: 1,
    status: "candidate",
    title: "Core",
    layer: "L6",
    pair_layer: "L7",
    artifact_kind: "function_design",
    responsibility_owner: "design-template-json-authority",
    applicability: { comparison: { field: "project.kind", op: "exists", value: true } },
    required_inputs: [],
    sections: [{ section_id: "core", fields: [], completion_rule_ids: ["done"] }],
    trace_contract: { requirement: ["REQ-1"] },
    verification: { pair_template_id: "TPL-PAIR", oracle_classes: ["unit"] },
    measurement: { metric_id: "coverage", unit: "ratio", operator: "gte", threshold: 1 },
    completion: { coverage: 1, independent_review: true },
    downstream_artifact_kinds: ["source_module"],
    ...overrides,
  };
  value.semantic_digest = designTemplateSemanticDigest(value);
  return value;
}
const hasCode = (result: unknown, findingCode: string): boolean =>
  "findings" in (result as Record<string, unknown>) &&
  (result as { findings: Array<{ code: string }> }).findings.some(
    (finding) => finding.code === findingCode,
  );

describe("Design Template JSON authority", () => {
  it("U-DTJ-001: unknown propertyを拒否する", () =>
    expect(
      hasCode(validateDesignTemplate(template({ extra: true }), context), "schema_invalid"),
    ).toBe(true));
  it("U-DTJ-002: unsafe integerを拒否する", () =>
    expect(
      hasCode(
        validateDesignTemplate(
          template({ template_version: Number.MAX_SAFE_INTEGER + 1 }),
          context,
        ),
        "schema_invalid",
      ),
    ).toBe(true));
  it("U-DTJ-003: current pair外を拒否する", () =>
    expect(
      hasCode(
        validateDesignTemplate(template({ layer: "L13", pair_layer: "L0" }), context),
        "pair_incomplete",
      ),
    ).toBe(true));
  it("U-DTJ-004: 空predicateとcapacity超過を拒否する", () =>
    expect(
      evaluateTemplateApplicability({ all: [] }, {}, { maxDepth: 16, maxNodes: 256 }).outcome,
    ).toBe("evaluation_error"));
  it("U-DTJ-005: trace欠落を拒否する", () =>
    expect(
      hasCode(
        validateDesignTemplate(template({ trace_contract: {} }), context),
        "trace_incomplete",
      ),
    ).toBe(true));
  it("U-DTJ-006: semantic digest driftを拒否する", () =>
    expect(
      hasCode(
        validateDesignTemplate(
          { ...template(), semantic_digest: `sha256:${"0".repeat(64)}` },
          context,
        ),
        "template_digest_mismatch",
      ),
    ).toBe(true));
  it("U-DTJ-007: registry missing entryを拒否する", () =>
    expect(
      hasCode(
        validateDesignTemplateRegistry({ templates: [] }, [template() as never]),
        "template_digest_mismatch",
      ),
    ).toBe(true));
  it("U-DTJ-008: canonical owner重複を拒否する", () =>
    expect(
      hasCode(
        validateDesignTemplateRegistry(
          {
            templates: [
              { template_id: "TPL-CORE", template_version: 1 },
              { template_id: "TPL-TWO", template_version: 1 },
            ],
          },
          [
            template({ status: "canonical" }) as never,
            template({ template_id: "TPL-TWO", status: "canonical" }) as never,
          ],
        ),
        "normative_owner_duplicate",
      ),
    ).toBe(true));
  it("U-DTJ-009: deprecated lifecycle欠落を拒否する", () =>
    expect(
      hasCode(
        validateDesignTemplateRegistry(
          { templates: [{ template_id: "TPL-CORE", template_version: 1 }] },
          [template({ status: "deprecated" }) as never],
        ),
        "schema_invalid",
      ),
    ).toBe(true));
  it("U-DTJ-010: missing factをfalseへ丸めない", () =>
    expect(
      evaluateTemplateApplicability(
        { comparison: { field: "project.kind", op: "eq", value: "service" } },
        {},
      ).outcome,
    ).toBe("evaluation_error"));
  it("U-DTJ-011: unmapped atomを拒否する", () =>
    expect(
      hasCode(
        compileTemplateShadowReport({
          source: { authority: "current", atoms: ["/a"] },
          candidate: template() as never,
          mappings: [],
          designDecisions: [],
        }),
        "shadow_atom_unmapped",
      ),
    ).toBe(true));
  it("U-DTJ-012: legacy current昇格を拒否する", () =>
    expect(
      hasCode(
        compileTemplateShadowReport({
          source: { authority: "historical", atoms: ["/a"] },
          candidate: template() as never,
          mappings: [{ source_pointer: "/a", promote_to_current: true, disposition: "adopt" }],
          designDecisions: [],
        }),
        "legacy_authority_promotion",
      ),
    ).toBe(true));
  it("U-DTJ-013: explained deltaのreview欠落を拒否する", () =>
    expect(
      hasCode(
        compileTemplateShadowReport({
          source: { authority: "current", atoms: ["/a"] },
          candidate: template() as never,
          mappings: [{ source_pointer: "/a", disposition: "adapt", decision_id: "D-1" }],
          designDecisions: [],
        }),
        "shadow_semantic_drift",
      ),
    ).toBe(true));
  it("U-DTJ-014: generated view driftを拒否する", () =>
    expect(
      hasCode(
        verifyGeneratedDesignView({
          sourceSemanticDigest: `sha256:${"a".repeat(64)}`,
          embeddedSourceDigest: `sha256:${"b".repeat(64)}`,
          regeneratedLogicalDigest: `sha256:${"a".repeat(64)}`,
          checkedInLogicalDigest: `sha256:${"a".repeat(64)}`,
        }),
        "generated_view_drift",
      ),
    ).toBe(true));
  it("U-DTJ-015: finding順序を決定論的にする", () =>
    expect(validateDesignTemplate(template({ extra: true, layer: "L13" }), context)).toEqual(
      validateDesignTemplate(template({ layer: "L13", extra: true }), context),
    ));
  it("U-DTJ-016: section capacityをtruncateせず拒否する", () =>
    expect(
      hasCode(
        validateDesignTemplate(
          template({
            sections: Array.from({ length: 129 }, (_, i) => ({
              section_id: String(i),
              fields: [],
            })),
          }),
          context,
        ),
        "capacity_exceeded",
      ),
    ).toBe(true));
  it("U-DTJ-017: pure coreは入力を変更しない", () => {
    const facts = Object.freeze({ "project.kind": "service" });
    const before = JSON.stringify(facts);
    evaluateTemplateApplicability(
      { comparison: { field: "project.kind", op: "eq", value: "service" } },
      facts,
    );
    expect(JSON.stringify(facts)).toBe(before);
  });
});

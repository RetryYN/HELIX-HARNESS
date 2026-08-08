import {
  type CommonRulePackV1,
  canonicalizeUiDomain,
  type PatternContractV1,
  UDP_POLICY_V1,
  type UiDomainDeclarationV1,
  type UiProfileV1,
} from "../../src/design/ui-domain-pattern-profile";

// PLAN-L7-520-ui-domain-core slice1 の共有 fixture。L6 §2 schema 準拠の完備宣言を 1 組で構築する。

export interface UiFixtureEntityInputV1 {
  entity_id: string;
  kind: string;
  authority?: string;
  revision?: number;
}

export function uiEntity(input: UiFixtureEntityInputV1) {
  return {
    entity_id: input.entity_id,
    kind: input.kind,
    revision: input.revision ?? 1,
    authority: input.authority ?? "canonical",
    source_pointer: "docs/design/harness/L2-screen/screen-list.md",
  };
}

export const UI_DOMAIN_ENTITIES: UiFixtureEntityInputV1[] = [
  { entity_id: "SCR-pm-01", kind: "page" },
  { entity_id: "FLW-approve", kind: "user_flow" },
  { entity_id: "NAV-global", kind: "navigation" },
  { entity_id: "RGN-pm-01-main", kind: "region_slot" },
  { entity_id: "CMP-approve-button", kind: "ui_component" },
  { entity_id: "PTN-form-submit", kind: "interaction_pattern" },
  { entity_id: "TOK-color-primary", kind: "design_token" },
  { entity_id: "CNT-approve-label", kind: "content" },
  { entity_id: "FBK-approve-toast", kind: "feedback" },
  { entity_id: "UST-approve-empty", kind: "ui_state" },
];

export function buildUiDomain(
  entities: UiFixtureEntityInputV1[] = UI_DOMAIN_ENTITIES,
): UiDomainDeclarationV1 {
  const result = canonicalizeUiDomain(
    { schema_version: "ui-domain-declaration.v1", entities: entities.map(uiEntity) },
    UDP_POLICY_V1,
  );
  if (!result.ok) {
    throw new Error(`fixture domain must canonicalize: ${JSON.stringify(result.failures)}`);
  }
  return result.value;
}

export function validContract(): PatternContractV1 {
  return {
    schema_version: "ui-pattern-contract.v1",
    pattern_id: "PTN-form-submit",
    required: [
      { target_kind: "ui_component", target_id: "CMP-approve-button", condition: "visible" },
      { target_kind: "feedback", target_id: "FBK-approve-toast", condition: "on-success" },
    ],
    forbidden: [
      { target_kind: "ui_state", target_id: "UST-approve-empty", condition: "on-submit" },
    ],
    revision: 1,
  };
}

export function validProfile(): UiProfileV1 {
  return {
    schema_version: "ui-profile.v1",
    profile_id: "PRF-helix-central",
    surface_class: "operational",
    information_priority: ["SCR-pm-01", "CMP-approve-button"],
    allowed_patterns: ["PTN-form-submit"],
    allowed_tokens: ["TOK-color-primary"],
    responsive: {
      breakpoints: ["compact", "regular", "wide"],
      layout_rules: ["compact では NAV-global を折り畳む"],
    },
    motion: { budget_ms: 200, reduced_motion_alternative: "fade を即時表示へ置換" },
    accessibility: {
      focus_order: ["CMP-approve-button"],
      contrast_class: "AA",
      aria_required: ["CMP-approve-button"],
    },
    brand: { tokens: [{ token_id: "TOK-color-primary", value: "#0a5cff" }] },
    revision: 1,
  };
}

export function validPack(): CommonRulePackV1 {
  return {
    schema_version: "ui-common-rule-pack.v1",
    pack_id: "PACK-common-a11y",
    rules: [
      {
        rule_id: "RULE-contrast",
        target_kind: "ui_component",
        constraint: "contrast>=AA",
        value: null,
      },
      {
        rule_id: "RULE-focus",
        target_kind: "interaction_pattern",
        constraint: "focus-visible",
        value: null,
      },
    ],
    revision: 1,
  };
}

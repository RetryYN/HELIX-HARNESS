/**
 * UI Domain・Pattern Profile slice1 — 純関数群（PLAN-L7-520、Issue #209）。
 *
 * L6設計 docs/design/helix/L6-function-design/ui-domain-pattern-profile.md §0-§2 を正本とする。
 * pure API は filesystem / clock / DB を読まず versioned input のみを受ける。registry への
 * write は #177 の transaction 経路を typed consumer として使い、本 module は write authority
 * を持たない。schema_version 不一致・stale/retired の canonical 渡しは全 API 共通の
 * 入口検査（UDP_STALE_INPUT）で fail-close する。
 */
import { createHash } from "node:crypto";

export type UiEntityKindV1 =
  | "page"
  | "user_flow"
  | "navigation"
  | "region_slot"
  | "ui_component"
  | "interaction_pattern"
  | "design_token"
  | "content"
  | "feedback"
  | "ui_state";

export type UiSurfaceClassV1 = "operational" | "expressive" | "mixed";
export type UiAuthorityV1 = "shadow" | "canonical" | "stale" | "retired";

export type UdpFailureCodeV1 =
  | "UDP_ID_INVALID"
  | "UDP_CONTRACT_CONFLICT"
  | "UDP_PRODUCT_VALUE_IN_COMMON_PACK"
  | "UDP_PROFILE_INCOMPLETE"
  | "UDP_CARTESIAN_EXPLOSION"
  | "UDP_PAIRWISE_UNCOVERED"
  | "UDP_RISK_UNCOVERED"
  | "UDP_STALE_INPUT";

export interface UdpFailureV1 {
  code: UdpFailureCodeV1;
  evidence_digest: string;
}

export type UdpResultV1<T> =
  | { ok: true; value: T }
  | { ok: false; failures: readonly UdpFailureV1[] };

export interface UdpPolicyV1 {
  schema_version: "ui-domain-policy.v1";
}

export const UDP_POLICY_V1: UdpPolicyV1 = { schema_version: "ui-domain-policy.v1" };

export interface UiDomainEntityV1 {
  entity_id: string;
  kind: UiEntityKindV1;
  revision: number;
  authority: UiAuthorityV1;
  semantic_digest: string;
  source_pointer: string;
}

export interface UiDomainDeclarationV1 {
  schema_version: "ui-domain-declaration.v1";
  entities: readonly UiDomainEntityV1[];
  declaration_digest: string;
}

export interface ContractTermV1 {
  target_kind: UiEntityKindV1;
  target_id: string | null;
  condition: string;
}

export interface PatternContractV1 {
  schema_version: "ui-pattern-contract.v1";
  pattern_id: string;
  required: readonly ContractTermV1[];
  forbidden: readonly ContractTermV1[];
  revision: number;
}

export interface ValidatedContractV1 {
  pattern_id: string;
  required_index: readonly string[];
  forbidden_index: readonly string[];
  contract_digest: string;
}

export interface CommonRuleV1 {
  rule_id: string;
  target_kind: UiEntityKindV1;
  constraint: string;
  value: string | null;
}

export interface CommonRulePackV1 {
  schema_version: "ui-common-rule-pack.v1";
  pack_id: string;
  rules: readonly CommonRuleV1[];
  revision: number;
}

export interface IsolationReceiptV1 {
  pack_id: string;
  profile_id: string;
  checked_rules: number;
  receipt_digest: string;
}

export interface ResponsiveDeclV1 {
  breakpoints: readonly string[];
  layout_rules: readonly string[];
}

export interface MotionDeclV1 {
  budget_ms: number;
  reduced_motion_alternative: string;
}

export interface A11yDeclV1 {
  focus_order: readonly string[];
  contrast_class: string;
  aria_required: readonly string[];
}

export interface BrandDeclV1 {
  tokens: readonly { token_id: string; value: string }[];
}

export interface UiProfileV1 {
  schema_version: "ui-profile.v1";
  profile_id: string;
  surface_class: UiSurfaceClassV1;
  information_priority: readonly string[];
  allowed_patterns: readonly string[];
  allowed_tokens: readonly string[];
  responsive: ResponsiveDeclV1;
  motion: MotionDeclV1;
  accessibility: A11yDeclV1;
  brand: BrandDeclV1;
  revision: number;
}

export interface ValidatedProfileV1 {
  profile_id: string;
  surface_class: UiSurfaceClassV1;
  profile_digest: string;
}

const ENTITY_KINDS: readonly UiEntityKindV1[] = [
  "page",
  "user_flow",
  "navigation",
  "region_slot",
  "ui_component",
  "interaction_pattern",
  "design_token",
  "content",
  "feedback",
  "ui_state",
];

const SURFACE_CLASSES: readonly UiSurfaceClassV1[] = ["operational", "expressive", "mixed"];
const AUTHORITIES: readonly UiAuthorityV1[] = ["shadow", "canonical", "stale", "retired"];

// L5 §1 の kind 別 prefix 規約（#177 と共有する SCR-/FLW-/CMP-/TOK-/CNT- を含む）。
export const UI_KIND_PREFIX: Readonly<Record<UiEntityKindV1, string>> = {
  page: "SCR-",
  user_flow: "FLW-",
  navigation: "NAV-",
  region_slot: "RGN-",
  ui_component: "CMP-",
  interaction_pattern: "PTN-",
  design_token: "TOK-",
  content: "CNT-",
  feedback: "FBK-",
  ui_state: "UST-",
};

const PREFIXED_ID_BASE = /^[A-Z]{3}-[a-z0-9][a-z0-9-]*$/;
const PROFILE_ID_PATTERN = /^PRF-[a-z0-9][a-z0-9-]*$/;

function sha256(text: string): string {
  return `sha256:${createHash("sha256").update(text, "utf8").digest("hex")}`;
}

function fail(code: UdpFailureCodeV1, evidence: string): UdpFailureV1 {
  return { code, evidence_digest: sha256(evidence) };
}

function failures<T>(items: readonly UdpFailureV1[]): UdpResultV1<T> {
  return { ok: false, failures: items };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function entitySemanticDigest(entity: Omit<UiDomainEntityV1, "semantic_digest">): string {
  return sha256(
    JSON.stringify({
      authority: entity.authority,
      entity_id: entity.entity_id,
      kind: entity.kind,
      revision: entity.revision,
      source_pointer: entity.source_pointer,
    }),
  );
}

function parseEntity(raw: unknown): UiDomainEntityV1 | "stale" | null {
  if (!isRecord(raw)) return null;
  const { entity_id, kind, revision, authority, source_pointer } = raw;
  if (typeof entity_id !== "string" || entity_id.length === 0) return null;
  if (typeof kind !== "string" || !ENTITY_KINDS.includes(kind as UiEntityKindV1)) return null;
  if (typeof authority !== "string" || !AUTHORITIES.includes(authority as UiAuthorityV1)) {
    return null;
  }
  // canonical 渡しの入口検査: stale/retired entity を canonical 宣言として受けない。
  if (authority === "stale" || authority === "retired") return "stale";
  if (typeof revision !== "number" || !Number.isInteger(revision) || revision < 1) return null;
  if (typeof source_pointer !== "string" || source_pointer.length === 0) return null;
  const base = {
    entity_id,
    kind: kind as UiEntityKindV1,
    revision,
    authority: authority as UiAuthorityV1,
    source_pointer,
  };
  return { ...base, semantic_digest: entitySemanticDigest(base) };
}

// class 名（CamelCase）・file path・DOM selector を意味主キーとして拒否する（VDH-FR-003）。
// PREFIXED_ID_BASE と大部分が重なるが、regex 変更時の防御縦深として意図的に残す。
function looksLikeForbiddenKey(entity_id: string): boolean {
  if (entity_id.includes("/") || entity_id.includes(".")) return true;
  if (/^[#.[]/.test(entity_id) || entity_id.includes(">")) return true;
  return /^[A-Z][a-z]/.test(entity_id);
}

/** U-UDP-001: kind別prefix regexとclass/path/DOM主キー拒否・stable sort/dedup/digest採番。 */
export function canonicalizeUiDomain(
  raw: unknown,
  policy: UdpPolicyV1,
): UdpResultV1<UiDomainDeclarationV1> {
  if (policy.schema_version !== "ui-domain-policy.v1") {
    return failures([fail("UDP_STALE_INPUT", "policy:schema")]);
  }
  if (
    !isRecord(raw) ||
    raw.schema_version !== "ui-domain-declaration.v1" ||
    !Array.isArray(raw.entities)
  ) {
    return failures([fail("UDP_STALE_INPUT", "declaration:schema")]);
  }
  const found: UdpFailureV1[] = [];
  const entities: UiDomainEntityV1[] = [];
  for (const rawEntity of raw.entities) {
    const entity = parseEntity(rawEntity);
    if (entity === "stale") {
      found.push(fail("UDP_STALE_INPUT", `entity-authority:${JSON.stringify(rawEntity)}`));
      continue;
    }
    if (entity === null) {
      found.push(fail("UDP_ID_INVALID", `entity:${JSON.stringify(rawEntity)}`));
      continue;
    }
    const prefix = UI_KIND_PREFIX[entity.kind];
    if (
      looksLikeForbiddenKey(entity.entity_id) ||
      !PREFIXED_ID_BASE.test(entity.entity_id) ||
      !entity.entity_id.startsWith(prefix)
    ) {
      found.push(fail("UDP_ID_INVALID", `entity_id:${entity.kind}:${entity.entity_id}`));
      continue;
    }
    entities.push(entity);
  }
  if (found.length > 0) return failures(found);
  const dedup = new Map<string, UiDomainEntityV1>();
  for (const entity of entities) {
    if (!dedup.has(entity.semantic_digest)) dedup.set(entity.semantic_digest, entity);
  }
  // 意味主キーの一意性（VDH-FR-003）: 完全重複（同一 digest）のみを dedup とし、
  // 同一 entity_id の非同値宣言は fail-close する（#177 slice1 の edge dedup 教訓の適用）。
  const byEntityId = new Map<string, string>();
  for (const entity of dedup.values()) {
    const known = byEntityId.get(entity.entity_id);
    if (known !== undefined && known !== entity.semantic_digest) {
      found.push(fail("UDP_ID_INVALID", `duplicate-entity:${entity.entity_id}`));
    }
    byEntityId.set(entity.entity_id, entity.semantic_digest);
  }
  if (found.length > 0) return failures(found);
  const sorted = [...dedup.values()].sort((a, b) => a.entity_id.localeCompare(b.entity_id));
  const declaration_digest = sha256(
    JSON.stringify({
      entities: sorted.map((entity) => entity.semantic_digest),
      schema_version: "ui-domain-declaration.v1",
    }),
  );
  return {
    ok: true,
    value: { schema_version: "ui-domain-declaration.v1", entities: sorted, declaration_digest },
  };
}

function termKey(term: ContractTermV1): string {
  return `${term.target_kind}:${term.target_id ?? "*"}:${term.condition}`;
}

function wildcardKey(term: ContractTermV1): string {
  return `${term.target_kind}:${term.condition}`;
}

/** U-UDP-002: required/forbidden競合と対象非実在をfail-closeし、判定基盤（索引）を返す。 */
export function validatePatternContract(
  contract: PatternContractV1,
  domain: UiDomainDeclarationV1,
): UdpResultV1<ValidatedContractV1> {
  if (contract.schema_version !== "ui-pattern-contract.v1") {
    return failures([fail("UDP_STALE_INPUT", "contract:schema")]);
  }
  const found: UdpFailureV1[] = [];
  const byId = new Map(domain.entities.map((entity) => [entity.entity_id, entity]));
  if (!byId.has(contract.pattern_id)) {
    found.push(fail("UDP_ID_INVALID", `pattern:${contract.pattern_id}`));
  }
  for (const term of [...contract.required, ...contract.forbidden]) {
    if (term.target_id === null) continue;
    const target = byId.get(term.target_id);
    if (target === undefined || target.kind !== term.target_kind) {
      found.push(fail("UDP_ID_INVALID", `term-target:${termKey(term)}`));
    }
  }
  const requiredKeys = new Set(contract.required.map(termKey));
  // wildcard（target_id=null = kind 全体）と具体 ID の交差も競合とする（review round1
  // Important の是正）: 同一 kind+condition で片側が wildcard・他側が具体 ID の
  // required/forbidden 交差は矛盾契約。
  const requiredWildcards = new Set(
    contract.required.filter((term) => term.target_id === null).map(wildcardKey),
  );
  const requiredConcretes = new Set(
    contract.required.filter((term) => term.target_id !== null).map(wildcardKey),
  );
  for (const term of contract.forbidden) {
    const exact = requiredKeys.has(termKey(term));
    const crossWildcard =
      term.target_id !== null
        ? requiredWildcards.has(wildcardKey(term))
        : requiredConcretes.has(wildcardKey(term));
    if (exact || crossWildcard) {
      found.push(fail("UDP_CONTRACT_CONFLICT", `conflict:${termKey(term)}`));
    }
  }
  if (found.length > 0) return failures(found);
  const required_index = [...requiredKeys].sort((a, b) => a.localeCompare(b));
  const forbidden_index = [...new Set(contract.forbidden.map(termKey))].sort((a, b) =>
    a.localeCompare(b),
  );
  return {
    ok: true,
    value: {
      pattern_id: contract.pattern_id,
      required_index,
      forbidden_index,
      contract_digest: sha256(
        JSON.stringify({ forbidden_index, pattern_id: contract.pattern_id, required_index }),
      ),
    },
  };
}

/** U-UDP-003: 共通Rule Packへのproduct namespace値の混入を全列挙でfail-closeする。 */
export function guardRulePackIsolation(
  pack: CommonRulePackV1,
  profile: UiProfileV1,
): UdpResultV1<IsolationReceiptV1> {
  if (
    pack.schema_version !== "ui-common-rule-pack.v1" ||
    profile.schema_version !== "ui-profile.v1"
  ) {
    return failures([fail("UDP_STALE_INPUT", "isolation:schema")]);
  }
  // L5 §2 の「含むか」判定: profile_id 参照も brand 実値も「大文字小文字を正規化した
  // 部分一致（contains）」で検出する（完全一致だけでは CSS 埋め込みや hex 表記ゆれで
  // fail-open するため。review round1 Critical-1 の是正）。
  const brandValues = profile.brand.tokens.map((token) => token.value.toLowerCase());
  const profileIdLower = profile.profile_id.toLowerCase();
  const found: UdpFailureV1[] = [];
  for (const rule of pack.rules) {
    if (rule.value === null) continue;
    const valueLower = rule.value.toLowerCase();
    const referencesProfile = valueLower.includes(profileIdLower);
    const embedsBrandValue = brandValues.some((brand) => valueLower.includes(brand));
    if (referencesProfile || embedsBrandValue) {
      found.push(fail("UDP_PRODUCT_VALUE_IN_COMMON_PACK", `rule:${rule.rule_id}:${rule.value}`));
    }
  }
  if (found.length > 0) return failures(found);
  return {
    ok: true,
    value: {
      pack_id: pack.pack_id,
      profile_id: profile.profile_id,
      checked_rules: pack.rules.length,
      receipt_digest: sha256(
        JSON.stringify({ pack_id: pack.pack_id, profile_id: profile.profile_id }),
      ),
    },
  };
}

/** U-UDP-004: profile必須要素の欠落を全列挙でfail-closeする（VDH-FR-005 の完備検査）。 */
export function validateUiProfile(profile: UiProfileV1): UdpResultV1<ValidatedProfileV1> {
  if (profile.schema_version !== "ui-profile.v1") {
    return failures([fail("UDP_STALE_INPUT", "profile:schema")]);
  }
  const missing: string[] = [];
  if (!PROFILE_ID_PATTERN.test(profile.profile_id)) missing.push("profile_id");
  if (!SURFACE_CLASSES.includes(profile.surface_class)) missing.push("surface_class");
  if (profile.information_priority.length === 0) missing.push("information_priority");
  if (profile.allowed_patterns.length === 0) missing.push("allowed_patterns");
  if (profile.allowed_tokens.length === 0) missing.push("allowed_tokens");
  if (profile.responsive.breakpoints.length === 0) missing.push("responsive.breakpoints");
  if (profile.responsive.layout_rules.length === 0) missing.push("responsive.layout_rules");
  if (!(profile.motion.budget_ms > 0)) missing.push("motion.budget_ms");
  if (!profile.motion.reduced_motion_alternative.trim()) {
    missing.push("motion.reduced_motion_alternative");
  }
  if (profile.accessibility.focus_order.length === 0) missing.push("accessibility.focus_order");
  if (!profile.accessibility.contrast_class.trim()) missing.push("accessibility.contrast_class");
  if (profile.accessibility.aria_required.length === 0) {
    missing.push("accessibility.aria_required");
  }
  if (profile.brand.tokens.length === 0) missing.push("brand.tokens");
  if (missing.length > 0) {
    return failures(missing.map((field) => fail("UDP_PROFILE_INCOMPLETE", `missing:${field}`)));
  }
  return {
    ok: true,
    value: {
      profile_id: profile.profile_id,
      surface_class: profile.surface_class,
      profile_digest: sha256(
        JSON.stringify({
          profile_id: profile.profile_id,
          revision: profile.revision,
          surface_class: profile.surface_class,
        }),
      ),
    },
  };
}

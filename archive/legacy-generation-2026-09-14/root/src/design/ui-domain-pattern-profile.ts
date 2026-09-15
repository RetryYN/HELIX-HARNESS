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
import type { RegistryEntityKindV1, RegistryGraphV1 } from "./design-registry";

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
  | "UDP_TRACE_UNBOUND"
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

export type UdpAxisV1 =
  | "device"
  | "input"
  | "role"
  | "locale"
  | "data_volume"
  | "network"
  | "concurrent_update"
  | "destructive_undo";

export const UDP_AXES: readonly UdpAxisV1[] = [
  "device",
  "input",
  "role",
  "locale",
  "data_volume",
  "network",
  "concurrent_update",
  "destructive_undo",
];

export type UdpRiskClassV1 = "high" | "medium" | "low";

export interface RiskEntryV1 {
  levels: Partial<Record<UdpAxisV1, string>>;
  risk_class: UdpRiskClassV1;
}

export interface PairwiseInputV1 {
  schema_version: "ui-pairwise-input.v1";
  axes: Readonly<Record<UdpAxisV1, readonly string[]>>;
  risk_matrix: readonly RiskEntryV1[];
  mode: "pairwise";
}

export interface FixtureV1 {
  fixture_id: string;
  levels: Readonly<Record<UdpAxisV1, string>>;
  risk_class: UdpRiskClassV1;
}

export interface FixtureSelectionV1 {
  fixtures: readonly FixtureV1[];
  pair_coverage: 1;
  high_risk_included: number;
  selection_digest: string;
}

interface PairKeyInput {
  axisA: UdpAxisV1;
  levelA: string;
  axisB: UdpAxisV1;
  levelB: string;
}

function pairKey(input: PairKeyInput): string {
  return `${input.axisA}=${input.levelA}|${input.axisB}=${input.levelB}`;
}

function riskClassForLevels(
  levels: Readonly<Record<UdpAxisV1, string>>,
  riskMatrix: readonly RiskEntryV1[],
): UdpRiskClassV1 {
  let best: UdpRiskClassV1 = "low";
  for (const entry of riskMatrix) {
    const matches = Object.entries(entry.levels).every(
      ([axis, level]) => levels[axis as UdpAxisV1] === level,
    );
    if (!matches) continue;
    if (entry.risk_class === "high") return "high";
    if (entry.risk_class === "medium") best = "medium";
  }
  return best;
}

function collectUncoveredPairs(
  axes: Readonly<Record<UdpAxisV1, readonly string[]>>,
  covered: ReadonlySet<string>,
): PairKeyInput[] {
  const uncovered: PairKeyInput[] = [];
  for (let i = 0; i < UDP_AXES.length; i += 1) {
    for (let j = i + 1; j < UDP_AXES.length; j += 1) {
      const axisA = UDP_AXES[i] as UdpAxisV1;
      const axisB = UDP_AXES[j] as UdpAxisV1;
      for (const levelA of axes[axisA]) {
        for (const levelB of axes[axisB]) {
          const pair = { axisA, levelA, axisB, levelB };
          if (!covered.has(pairKey(pair))) uncovered.push(pair);
        }
      }
    }
  }
  return uncovered;
}

function markCovered(levels: Readonly<Record<UdpAxisV1, string>>, covered: Set<string>): void {
  for (let i = 0; i < UDP_AXES.length; i += 1) {
    for (let j = i + 1; j < UDP_AXES.length; j += 1) {
      const axisA = UDP_AXES[i] as UdpAxisV1;
      const axisB = UDP_AXES[j] as UdpAxisV1;
      covered.add(pairKey({ axisA, levelA: levels[axisA], axisB, levelB: levels[axisB] }));
    }
  }
}

// 決定的 greedy 補完: seed（部分指定）を固定し、残余軸は「未被覆ペアを最も多く消化する
// level」を軸順・level 順の決定的 tie-break で選ぶ（乱数・時刻に依存しない）。
function completeFixture(
  seed: Partial<Record<UdpAxisV1, string>>,
  axes: Readonly<Record<UdpAxisV1, readonly string[]>>,
  covered: ReadonlySet<string>,
): Record<UdpAxisV1, string> {
  // UDP_AXES 固定順で key を構築し、caller の object key 挿入順を selection_digest へ
  // 持ち込まない（意味的同一入力 → 同一 digest の決定性境界）。
  const levels: Partial<Record<UdpAxisV1, string>> = {};
  for (const axis of UDP_AXES) {
    if (seed[axis] !== undefined) {
      levels[axis] = seed[axis];
      continue;
    }
    let bestLevel = axes[axis][0] as string;
    let bestGain = -1;
    for (const candidate of axes[axis]) {
      let gain = 0;
      for (const other of UDP_AXES) {
        if (other === axis) continue;
        const otherLevel = levels[other];
        if (otherLevel === undefined) continue;
        const pair =
          UDP_AXES.indexOf(other) < UDP_AXES.indexOf(axis)
            ? { axisA: other, levelA: otherLevel, axisB: axis, levelB: candidate }
            : { axisA: axis, levelA: candidate, axisB: other, levelB: otherLevel };
        if (!covered.has(pairKey(pair))) gain += 1;
      }
      if (gain > bestGain) {
        bestGain = gain;
        bestLevel = candidate;
      }
    }
    levels[axis] = bestLevel;
  }
  // ループ不変条件（全軸割当済み）を型 cast に頼らず runtime で保証する。
  return Object.fromEntries(
    UDP_AXES.map((axis) => {
      const level = levels[axis];
      if (level === undefined)
        throw new Error(`completeFixture invariant: axis ${axis} unassigned`);
      return [axis, level];
    }),
  ) as Record<UdpAxisV1, string>;
}

/** U-UDP-005: seeded-pairwise 選定（ペア被覆100% + high risk seed 包含 + 決定的順序）。 */
export function selectPairwiseFixtures(input: PairwiseInputV1): UdpResultV1<FixtureSelectionV1> {
  if (input.schema_version !== "ui-pairwise-input.v1") {
    return failures([fail("UDP_STALE_INPUT", "pairwise:schema")]);
  }
  if ((input.mode as string) !== "pairwise") {
    return failures([fail("UDP_CARTESIAN_EXPLOSION", `mode:${String(input.mode)}`)]);
  }
  const found: UdpFailureV1[] = [];
  for (const axis of UDP_AXES) {
    const levels = input.axes[axis];
    if (!Array.isArray(levels) || levels.length === 0) {
      found.push(fail("UDP_STALE_INPUT", `axis-empty:${axis}`));
    }
  }
  for (const entry of input.risk_matrix) {
    for (const [axis, level] of Object.entries(entry.levels)) {
      if (!input.axes[axis as UdpAxisV1]?.includes(level as string)) {
        found.push(fail("UDP_STALE_INPUT", `risk-level-unknown:${axis}=${String(level)}`));
      }
    }
  }
  if (found.length > 0) return failures(found);

  const covered = new Set<string>();
  const fixtures: FixtureV1[] = [];
  const pushFixture = (levels: Record<UdpAxisV1, string>): void => {
    markCovered(levels, covered);
    fixtures.push({
      fixture_id: `FXT-${fixtures.length + 1}`,
      levels,
      risk_class: riskClassForLevels(levels, input.risk_matrix),
    });
  };
  // high risk entry を seed として全件包含（宣言順 = 決定的）。
  const highRiskEntries = input.risk_matrix.filter((entry) => entry.risk_class === "high");
  const seededKeys = new Set<string>();
  for (const entry of highRiskEntries) {
    // 完全重複 entry（同一 levels）は 1 fixture へ dedup する（宣言順で先勝ち）。
    const seedKey = JSON.stringify(
      UDP_AXES.filter((axis) => entry.levels[axis] !== undefined).map((axis) => [
        axis,
        entry.levels[axis],
      ]),
    );
    if (seededKeys.has(seedKey)) continue;
    seededKeys.add(seedKey);
    pushFixture(completeFixture(entry.levels, input.axes, covered));
  }
  // 残余の未被覆ペアを greedy に消化（未被覆ペア列挙順 = 軸順・level 順で決定的）。
  for (;;) {
    const uncovered = collectUncoveredPairs(input.axes, covered);
    if (uncovered.length === 0) break;
    const next = uncovered[0] as PairKeyInput;
    pushFixture(
      completeFixture(
        { [next.axisA]: next.levelA, [next.axisB]: next.levelB } as Partial<
          Record<UdpAxisV1, string>
        >,
        input.axes,
        covered,
      ),
    );
  }
  // 被覆保証の独立検算（selector 自身のバグを fail-close で顕在化させる）。
  if (collectUncoveredPairs(input.axes, covered).length > 0) {
    return failures([fail("UDP_PAIRWISE_UNCOVERED", "post-check")]);
  }
  const highRiskIncluded = highRiskEntries.filter((entry) =>
    fixtures.some((fixture) =>
      Object.entries(entry.levels).every(
        ([axis, level]) => fixture.levels[axis as UdpAxisV1] === level,
      ),
    ),
  ).length;
  if (highRiskIncluded !== highRiskEntries.length) {
    return failures([fail("UDP_RISK_UNCOVERED", "post-check")]);
  }
  const selection_digest = sha256(
    JSON.stringify(fixtures.map((fixture) => ({ id: fixture.fixture_id, levels: fixture.levels }))),
  );
  return {
    ok: true,
    value: {
      fixtures,
      pair_coverage: 1,
      high_risk_included: highRiskIncluded,
      selection_digest,
    },
  };
}

// ---------------------------------------------------------------------------
// slice3（PLAN-L7-522）: registry consumer trace（IT-UDP-002 / U-UDP-006）。
// #177 registry の typed consumer として共有 ID 空間の binding を read-only 検査する。
// 台帳の複製新設をしない（write は #177 の transaction 経路のみ）。
// ---------------------------------------------------------------------------

/** #177 共有 ID 空間の kind 対応（L5 §1 の prefix 再利用表を機械化）。 */
export const UI_REGISTRY_KIND_MAP: Readonly<Partial<Record<UiEntityKindV1, RegistryEntityKindV1>>> =
  {
    page: "screen",
    user_flow: "flow",
    ui_component: "component",
    design_token: "design_token",
    content: "content",
  };

export interface ConsumerTraceEntryV1 {
  entity_id: string;
  registry_kind: RegistryEntityKindV1;
  registry_revision: number;
}

export interface ConsumerTraceV1 {
  schema_version: "ui-consumer-trace.v1";
  entries: readonly ConsumerTraceEntryV1[];
  trace_digest: string;
}

/**
 * U-UDP-006: 共有 prefix entity ごとに registry graph の canonical node と
 * entity_id + kind 対応を検査し、entity_id 昇順の決定的 trace を返す。
 * 欠落・kind 不対応・stale/retired 参照は UDP_TRACE_UNBOUND で全列挙 fail-close。
 */
export function buildUiConsumerTrace(
  domain: UiDomainDeclarationV1,
  graph: RegistryGraphV1,
  policy: UdpPolicyV1,
): UdpResultV1<ConsumerTraceV1> {
  if (policy.schema_version !== "ui-domain-policy.v1") {
    return failures([fail("UDP_STALE_INPUT", "policy:schema")]);
  }
  if (domain.schema_version !== "ui-domain-declaration.v1" || !Array.isArray(domain.entities)) {
    return failures([fail("UDP_STALE_INPUT", "domain:schema")]);
  }
  if (!Array.isArray(graph.nodes)) {
    return failures([fail("UDP_STALE_INPUT", "graph:nodes")]);
  }
  const entityList: readonly UiDomainEntityV1[] = domain.entities;
  // graph 側の重複 entity_id は Map の後勝ちで並び順依存になるため、入口で fail-close する
  // （#177 canonicalizer 経由なら DRG_DUPLICATE_ID で弾かれるが、型上は未保証の外部入力）。
  const nodesById = new Map<string, RegistryGraphV1["nodes"][number]>();
  const duplicateIds: UdpFailureV1[] = [];
  for (const node of graph.nodes) {
    if (nodesById.has(node.entity_id)) {
      duplicateIds.push(fail("UDP_STALE_INPUT", `graph-duplicate:${node.entity_id}`));
      continue;
    }
    nodesById.set(node.entity_id, node);
  }
  if (duplicateIds.length > 0) return failures(duplicateIds);
  const found: UdpFailureV1[] = [];
  const entries: ConsumerTraceEntryV1[] = [];
  const shared = entityList
    .filter((entity) => UI_REGISTRY_KIND_MAP[entity.kind] !== undefined)
    .slice()
    .sort((a, b) => (a.entity_id < b.entity_id ? -1 : a.entity_id > b.entity_id ? 1 : 0));
  for (const entity of shared) {
    const expectedKind = UI_REGISTRY_KIND_MAP[entity.kind] as RegistryEntityKindV1;
    const node = nodesById.get(entity.entity_id);
    if (node === undefined) {
      found.push(fail("UDP_TRACE_UNBOUND", `missing:${entity.entity_id}`));
      continue;
    }
    if (node.kind !== expectedKind) {
      found.push(fail("UDP_TRACE_UNBOUND", `kind:${entity.entity_id}:${node.kind}`));
      continue;
    }
    if (node.authority !== "canonical") {
      found.push(fail("UDP_TRACE_UNBOUND", `authority:${entity.entity_id}:${node.authority}`));
      continue;
    }
    entries.push({
      entity_id: entity.entity_id,
      registry_kind: node.kind,
      registry_revision: node.revision,
    });
  }
  if (found.length > 0) return failures(found);
  const trace_digest = sha256(
    JSON.stringify(
      entries.map((entry) => [entry.entity_id, entry.registry_kind, entry.registry_revision]),
    ),
  );
  return {
    ok: true,
    value: { schema_version: "ui-consumer-trace.v1", entries, trace_digest },
  };
}

// ---------------------------------------------------------------------------
// slice4（PLAN-L7-523）: CLI 表面の判定核（U-UDP-007）。
// `helix ui-domain check` は read-only であり、DB / registry write を持たない。
// ---------------------------------------------------------------------------

export type UiBundleSectionV1 = "domain" | "contract" | "profile" | "pack" | "trace" | "pairwise";

export interface UiBundleSectionReportV1 {
  section: UiBundleSectionV1;
  ok: boolean;
  failures: readonly UdpFailureV1[];
  /** green section の実内容 fingerprint（各純関数の既存 digest を引き上げる）。fail は null。 */
  value_digest: string | null;
}

export interface UiDomainBundleReportV1 {
  schema_version: "ui-domain-cli.v1";
  sections: readonly UiBundleSectionReportV1[];
  bundle_ok: boolean;
  report_digest: string;
}

const SECTION_VALUE_DIGEST_KEYS = [
  "declaration_digest",
  "contract_digest",
  "profile_digest",
  "receipt_digest",
  "trace_digest",
  "selection_digest",
] as const;

function sectionValueDigest(value: unknown): string | null {
  if (!isRecord(value)) return null;
  for (const key of SECTION_VALUE_DIGEST_KEYS) {
    const candidate = value[key];
    if (typeof candidate === "string") return candidate;
  }
  return null;
}

// section 評価は必ずこの wrapper を通す: 純関数が構造不正入力（schema_version は正しいが
// 必須ネスト field 欠落など）で throw しても、section へ帰属した UDP_STALE_INPUT へ
// fail-close し、他 section の評価結果を握り潰さない。
function sectionOf<T>(
  section: UiBundleSectionV1,
  evaluate: () => UdpResultV1<T>,
): { report: UiBundleSectionReportV1; value: T | null } {
  let result: UdpResultV1<T>;
  try {
    result = evaluate();
  } catch {
    return {
      report: {
        section,
        ok: false,
        failures: [fail("UDP_STALE_INPUT", `section-malformed:${section}`)],
        value_digest: null,
      },
      value: null,
    };
  }
  if (result.ok) {
    return {
      report: { section, ok: true, failures: [], value_digest: sectionValueDigest(result.value) },
      value: result.value,
    };
  }
  return {
    report: { section, ok: false, failures: result.failures, value_digest: null },
    value: null,
  };
}

function skippedSection(section: UiBundleSectionV1, reason: string): UiBundleSectionReportV1 {
  return {
    section,
    ok: false,
    failures: [fail("UDP_STALE_INPUT", `section-skipped:${reason}`)],
    value_digest: null,
  };
}

/**
 * U-UDP-007: `ui-domain-bundle.v1` を section 別に評価し、section 名へ帰属した
 * typed failure と決定的 report を返す。domain は必須、他 section は宣言時のみ評価。
 * 依存 section（contract/trace は domain、pack は profile）が欠落・失敗した場合は
 * section-skipped の typed failure で fail-close する（silent skip をしない）。
 */
export function evaluateUiDomainBundle(raw: unknown): UdpResultV1<UiDomainBundleReportV1> {
  if (!isRecord(raw) || raw.schema_version !== "ui-domain-bundle.v1") {
    return failures([fail("UDP_STALE_INPUT", "bundle:schema")]);
  }
  if (raw.domain === undefined) {
    return failures([fail("UDP_STALE_INPUT", "bundle:domain-required")]);
  }
  const sections: UiBundleSectionReportV1[] = [];
  const domain = sectionOf("domain", () => canonicalizeUiDomain(raw.domain, UDP_POLICY_V1));
  sections.push(domain.report);
  if (raw.contract !== undefined) {
    if (domain.value === null) {
      sections.push(skippedSection("contract", "domain"));
    } else {
      const domainValue = domain.value;
      sections.push(
        sectionOf("contract", () => validatePatternContract(raw.contract as never, domainValue))
          .report,
      );
    }
  }
  let profileValue: UiProfileV1 | null = null;
  if (raw.profile !== undefined) {
    const profile = sectionOf("profile", () => validateUiProfile(raw.profile as never));
    sections.push(profile.report);
    if (profile.value !== null) profileValue = raw.profile as UiProfileV1;
  }
  if (raw.pack !== undefined) {
    if (profileValue === null) {
      sections.push(skippedSection("pack", "profile"));
    } else {
      const boundProfile = profileValue;
      sections.push(
        sectionOf("pack", () => guardRulePackIsolation(raw.pack as never, boundProfile)).report,
      );
    }
  }
  if (raw.graph !== undefined) {
    if (domain.value === null) {
      sections.push(skippedSection("trace", "domain"));
    } else {
      const domainValue = domain.value;
      sections.push(
        sectionOf("trace", () =>
          buildUiConsumerTrace(domainValue, raw.graph as RegistryGraphV1, UDP_POLICY_V1),
        ).report,
      );
    }
  }
  if (raw.pairwise !== undefined) {
    sections.push(
      sectionOf("pairwise", () => selectPairwiseFixtures(raw.pairwise as never)).report,
    );
  }
  const bundle_ok = sections.every((section) => section.ok);
  // green section の実内容 fingerprint（value_digest）を含めることで、pass/fail 形状が同じ
  // でも中身の異なる bundle 同士が同一 digest に衝突しない。
  const report_digest = sha256(
    JSON.stringify(
      sections.map((section) => [
        section.section,
        section.ok,
        section.value_digest,
        section.failures.map((failure) => [failure.code, failure.evidence_digest]),
      ]),
    ),
  );
  return {
    ok: true,
    value: { schema_version: "ui-domain-cli.v1", sections, bundle_ok, report_digest },
  };
}

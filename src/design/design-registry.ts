/**
 * Design Registry slice1 — 純関数群（PLAN-L7-516、Issue #177）。
 *
 * L6設計 docs/design/helix/L6-function-design/design-registry.md §0-§2 を正本とする。
 * pure API は filesystem / clock / DB を読まず versioned input のみを受ける。
 * write authority（RegistryTransaction / store）は後続スライスで実装する。
 */
import { createHash } from "node:crypto";

export type RegistryEntityKindV1 =
  | "requirement"
  | "screen"
  | "flow"
  | "interaction"
  | "state"
  | "component"
  | "design_token"
  | "content"
  | "analytics_event"
  | "service"
  | "domain_object"
  | "acceptance";

export type RegistryRelationV1 =
  | "decomposes_to"
  | "presents"
  | "guarded_by"
  | "invokes"
  | "emits"
  | "measures"
  | "accepted_by"
  | "binds"
  | "parents";

export type RegistryAuthorityV1 = "shadow" | "canonical" | "stale" | "retired";
export type RegistryServiceRoleV1 = "permission" | "command" | "api";
export type RegistryAtomRoleV1 =
  | "user_task"
  | "business_outcome"
  | "scenario"
  | "context"
  | "success_result"
  | "decision_rationale";

export type RegistryFailureCodeV1 =
  | "DRG_ID_INVALID"
  | "DRG_DUPLICATE_ID"
  | "DRG_EDGE_ORPHAN"
  | "DRG_RELATION_INVALID"
  | "DRG_CHAIN_ORPHAN"
  | "DRG_PARENT_LOST"
  | "DRG_REVISION_MISMATCH"
  | "DRG_CAS_CONFLICT"
  | "DRG_STALE_INPUT"
  | "DRG_UNGUARDED_INVOKE";

export interface RegistryFailureV1 {
  code: RegistryFailureCodeV1;
  evidence_digest: string;
}

export type RegistryResultV1<T> =
  | { ok: true; value: T }
  | { ok: false; failures: readonly RegistryFailureV1[] };

/**
 * public command 例外（HR-FR-DHR-003 の permission gate を持たない command）。
 *
 * 例外は **必ず entity_id を明示宣言**する。「permission edge が無いから public」と推論して
 * しまうと、permission の張り忘れ（本来の違反）と public 設計が区別できなくなり、gate が
 * 意味を失う。根拠（rationale）と出典（authority_ref）を必須にして、無根拠な bypass を残さない。
 */
export interface PublicCommandExceptionV1 {
  /** service_role=command の entity_id。宣言先が実在しない / command でない場合は fail-close。 */
  entity_id: string;
  /** なぜ permission 不要なのか。 */
  rationale: string;
  /** 判断の出典（設計 doc の path など）。 */
  authority_ref: string;
}

export interface RegistryPolicyV1 {
  schema_version: "design-registry-policy.v1";
  /** 既定は空。宣言しない限り従来どおり permission 素通りを拒否する（既定 fail-close）。 */
  public_commands: readonly PublicCommandExceptionV1[];
}

/**
 * 既定 policy（例外 0 件 = fail-close）。全 default caller が共有する単一 singleton のため、
 * 実行時にも freeze して「どこかで push されて全 caller の gate が黙って穴あきになる」経路を断つ。
 */
export const REGISTRY_POLICY_V1: RegistryPolicyV1 = Object.freeze({
  schema_version: "design-registry-policy.v1",
  public_commands: Object.freeze([]) as readonly PublicCommandExceptionV1[],
}) as RegistryPolicyV1;

export interface RegistryNodeV1 {
  entity_id: string;
  kind: RegistryEntityKindV1;
  atom_role: RegistryAtomRoleV1 | null;
  service_role: RegistryServiceRoleV1 | null;
  revision: number;
  authority: RegistryAuthorityV1;
  semantic_digest: string;
  source_pointer: string;
}

export interface RegistryEdgeV1 {
  edge_id: string;
  from_entity_id: string;
  to_entity_id: string;
  relation: RegistryRelationV1;
  revision: number;
  authority: RegistryAuthorityV1;
  semantic_digest: string;
}

export interface RegistryDeclarationV1 {
  schema_version: "design-registry-declaration.v1";
  nodes: readonly RegistryNodeV1[];
  edges: readonly RegistryEdgeV1[];
  declaration_digest: string;
}

export interface RegistryGraphV1 {
  nodes: readonly RegistryNodeV1[];
  edges: readonly RegistryEdgeV1[];
  graph_digest: string;
}

export interface TraceClosureV1 {
  closed_requirement_ids: readonly string[];
  orphan_entity_ids: readonly string[];
}

export interface ParentCoverageV1 {
  covered_entity_ids: readonly string[];
}

export interface TraceQueryInputV1 {
  graph: RegistryGraphV1;
  entity_id: string;
}

export interface TraceHitV1 {
  entity_id: string;
  stale_tainted: boolean;
}

export interface TraceResultV1 {
  entity_id: string;
  upstream: readonly TraceHitV1[];
  downstream: readonly TraceHitV1[];
}

const ENTITY_KINDS: readonly RegistryEntityKindV1[] = [
  "requirement",
  "screen",
  "flow",
  "interaction",
  "state",
  "component",
  "design_token",
  "content",
  "analytics_event",
  "service",
  "domain_object",
  "acceptance",
];

const AUTHORITIES: readonly RegistryAuthorityV1[] = ["shadow", "canonical", "stale", "retired"];
const SERVICE_ROLES: readonly RegistryServiceRoleV1[] = ["permission", "command", "api"];
const ATOM_ROLES: readonly RegistryAtomRoleV1[] = [
  "user_task",
  "business_outcome",
  "scenario",
  "context",
  "success_result",
  "decision_rationale",
];
const USER_TASK_CHILD_ATOMS: readonly RegistryAtomRoleV1[] = [
  "scenario",
  "context",
  "success_result",
  "decision_rationale",
];

// L5 §2 の stable ID 規約: kind 別 prefix + 基本形。requirement/acceptance は family 別 regex。
const PREFIXED_ID_BASE = /^[A-Z]{3}-[a-z0-9][a-z0-9-]*$/;
const KIND_PREFIX: Partial<Record<RegistryEntityKindV1, string>> = {
  screen: "SCR-",
  flow: "FLW-",
  interaction: "INT-",
  state: "STA-",
  component: "CMP-",
  design_token: "TOK-",
  content: "CNT-",
  analytics_event: "AEV-",
  service: "SVC-",
  domain_object: "DOM-",
};
/**
 * registry 固有の requirement family。**catalog を経由せず**採用してよいのはここだけ。
 * L1 family（`BR-*` / `UX-*` / `FR-L1-*`）を足してはならない。足すと catalog gate を迂回して
 * L1 に存在しない `BR-99` が有効な edge 端点になり trace を捏造できる（PLAN-L7-538 の境界）。
 */
const NATIVE_REQUIREMENT_ID_PATTERNS: readonly RegExp[] = [
  /^HIL-(?:BR|FR|NFR)-\d{2,3}$/,
  /^VDH-FR-\d{3}$/,
  /^HR-FR-DHR-\d{3}$/,
];

/**
 * L1 要求正本の family（L3 D-1、PO 承認 2026-08-10）。**再採番せず** registry の requirement
 * grammar として認識する。grammar に含めるのは「node として実在してよい ID 形」の宣言であって、
 * 採用可否ではない。採用は catalog への実在で別途 gate する。
 */
const L1_REQUIREMENT_ID_PATTERNS: readonly RegExp[] = [
  /^BR-\d{2}$/,
  /^UX-\d{2}$/,
  /^FR-L1-\d{2}$/,
];

const REQUIREMENT_ID_PATTERNS: readonly RegExp[] = [
  ...NATIVE_REQUIREMENT_ID_PATTERNS,
  ...L1_REQUIREMENT_ID_PATTERNS,
];
const ACCEPTANCE_ID_PATTERNS: readonly RegExp[] = [/^HAC-HIL-\d{3}$/, /^VDH-AC-\d{3}$/];

// L6 §1 の kind×relation adjacency 正本表。service は service_role で細分化する。
type AdjacencyEndpoint = { kind: RegistryEntityKindV1; service_role?: RegistryServiceRoleV1 };
const ADJACENCY: Record<
  RegistryRelationV1,
  ReadonlyArray<[AdjacencyEndpoint, AdjacencyEndpoint]>
> = {
  decomposes_to: [
    [{ kind: "requirement" }, { kind: "screen" }],
    [{ kind: "requirement" }, { kind: "flow" }],
  ],
  presents: [[{ kind: "screen" }, { kind: "interaction" }]],
  guarded_by: [[{ kind: "interaction" }, { kind: "service", service_role: "permission" }]],
  invokes: [
    [
      { kind: "service", service_role: "permission" },
      { kind: "service", service_role: "command" },
    ],
    [
      { kind: "service", service_role: "command" },
      { kind: "service", service_role: "api" },
    ],
  ],
  emits: [[{ kind: "service", service_role: "api" }, { kind: "domain_object" }]],
  measures: [
    [{ kind: "domain_object" }, { kind: "analytics_event" }],
    [{ kind: "interaction" }, { kind: "analytics_event" }],
  ],
  accepted_by: [
    [{ kind: "analytics_event" }, { kind: "acceptance" }],
    [{ kind: "domain_object" }, { kind: "acceptance" }],
    [{ kind: "interaction" }, { kind: "acceptance" }],
  ],
  binds: [
    [{ kind: "component" }, { kind: "screen" }],
    [{ kind: "component" }, { kind: "interaction" }],
    [{ kind: "design_token" }, { kind: "screen" }],
    [{ kind: "design_token" }, { kind: "interaction" }],
    [{ kind: "content" }, { kind: "screen" }],
    [{ kind: "content" }, { kind: "interaction" }],
  ],
  parents: [
    [{ kind: "screen" }, { kind: "requirement" }],
    [{ kind: "flow" }, { kind: "requirement" }],
    [{ kind: "interaction" }, { kind: "requirement" }],
    [{ kind: "requirement" }, { kind: "requirement" }],
  ],
};

// requirement→acceptance chain（U-DRG-003）が辿る forward relation の exact set。
// slice2 の markStaleLineage も前方依存伝播をこの集合に限定する（parents/binds は
// 子→親/装飾の逆参照であり伝播対象外）。
export const REGISTRY_CHAIN_RELATIONS: ReadonlySet<RegistryRelationV1> = new Set([
  "decomposes_to",
  "presents",
  "guarded_by",
  "invokes",
  "emits",
  "measures",
  "accepted_by",
]);

function sha256(text: string): string {
  return `sha256:${createHash("sha256").update(text, "utf8").digest("hex")}`;
}

function fail(code: RegistryFailureCodeV1, evidence: string): RegistryFailureV1 {
  return { code, evidence_digest: sha256(evidence) };
}

function failures<T>(items: readonly RegistryFailureV1[]): RegistryResultV1<T> {
  return { ok: false, failures: items };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isValidEntityId(entity_id: string, node: { kind: RegistryEntityKindV1 }): boolean {
  if (node.kind === "requirement") {
    return isRegistryRequirementId(entity_id);
  }
  if (node.kind === "acceptance") {
    return ACCEPTANCE_ID_PATTERNS.some((pattern) => pattern.test(entity_id));
  }
  const prefix = KIND_PREFIX[node.kind];
  if (!prefix) return false;
  return PREFIXED_ID_BASE.test(entity_id) && entity_id.startsWith(prefix);
}

/**
 * requirement entity id が registry の登録 family に属するか（SCR intake の consumer が
 * 「registry の ID 空間に requirement を捏造しない」判定に使う。正本は本 module の
 * REQUIREMENT_ID_PATTERNS 一箇所）。
 */
export function isRegistryRequirementId(entityId: string): boolean {
  return REQUIREMENT_ID_PATTERNS.some((pattern) => pattern.test(entityId));
}

/**
 * registry 固有 family かどうか（L1 family を含まない）。intake の「catalog を経由しない」
 * bypass はこちらを使う。grammar（`isRegistryRequirementId`）と採用条件を同じ述語で兼ねると、
 * grammar を広げた瞬間に catalog gate が無効化される。
 */
export function isRegistryNativeRequirementId(entityId: string): boolean {
  return NATIVE_REQUIREMENT_ID_PATTERNS.some((pattern) => pattern.test(entityId));
}

/** node 実フィールドからの semantic_digest 再導出（slice2 の commit 時再検証が使う）。 */
export function computeRegistryNodeSemanticDigest(
  node: Omit<RegistryNodeV1, "semantic_digest">,
): string {
  return nodeSemanticDigest(node);
}

/** edge 実フィールドからの semantic_digest 再導出（slice2 の commit 時再検証が使う）。 */
export function computeRegistryEdgeSemanticDigest(
  edge: Omit<RegistryEdgeV1, "edge_id" | "semantic_digest">,
): string {
  return edgeSemanticDigest(edge);
}

function nodeSemanticDigest(node: Omit<RegistryNodeV1, "semantic_digest">): string {
  return sha256(
    JSON.stringify({
      atom_role: node.atom_role,
      authority: node.authority,
      entity_id: node.entity_id,
      kind: node.kind,
      revision: node.revision,
      service_role: node.service_role,
      source_pointer: node.source_pointer,
    }),
  );
}

function edgeSemanticDigest(edge: Omit<RegistryEdgeV1, "edge_id" | "semantic_digest">): string {
  return sha256(
    JSON.stringify({
      authority: edge.authority,
      from_entity_id: edge.from_entity_id,
      relation: edge.relation,
      revision: edge.revision,
      to_entity_id: edge.to_entity_id,
    }),
  );
}

function parseNode(raw: unknown): RegistryNodeV1 | null {
  if (!isRecord(raw)) return null;
  const { entity_id, kind, atom_role, service_role, authority, revision, source_pointer } = raw;
  if (typeof entity_id !== "string" || entity_id.length === 0) return null;
  if (typeof kind !== "string" || !ENTITY_KINDS.includes(kind as RegistryEntityKindV1)) return null;
  if (typeof authority !== "string" || !AUTHORITIES.includes(authority as RegistryAuthorityV1)) {
    return null;
  }
  if (
    atom_role !== null &&
    (typeof atom_role !== "string" || !ATOM_ROLES.includes(atom_role as RegistryAtomRoleV1))
  ) {
    return null;
  }
  if (
    service_role !== null &&
    (typeof service_role !== "string" ||
      !SERVICE_ROLES.includes(service_role as RegistryServiceRoleV1))
  ) {
    return null;
  }
  if (typeof revision !== "number" || !Number.isInteger(revision) || revision < 1) return null;
  if (typeof source_pointer !== "string" || source_pointer.length === 0) return null;
  // role discriminator は kind に整合する場合のみ受理する（screen に atom_role 等はスキーマ違反）。
  if (atom_role !== null && kind !== "requirement") return null;
  if (service_role !== null && kind !== "service") return null;
  const base = {
    entity_id,
    kind: kind as RegistryEntityKindV1,
    atom_role: atom_role as RegistryAtomRoleV1 | null,
    service_role: service_role as RegistryServiceRoleV1 | null,
    revision,
    authority: authority as RegistryAuthorityV1,
    source_pointer,
  };
  return { ...base, semantic_digest: nodeSemanticDigest(base) };
}

function parseEdge(raw: unknown): RegistryEdgeV1 | null {
  if (!isRecord(raw)) return null;
  const { from_entity_id, to_entity_id, relation, authority, revision } = raw;
  if (typeof from_entity_id !== "string" || from_entity_id.length === 0) return null;
  if (typeof to_entity_id !== "string" || to_entity_id.length === 0) return null;
  if (typeof relation !== "string" || !(relation in ADJACENCY)) return null;
  if (typeof authority !== "string" || !AUTHORITIES.includes(authority as RegistryAuthorityV1)) {
    return null;
  }
  if (typeof revision !== "number" || !Number.isInteger(revision) || revision < 1) return null;
  const base = {
    from_entity_id,
    to_entity_id,
    relation: relation as RegistryRelationV1,
    revision,
    authority: authority as RegistryAuthorityV1,
  };
  return {
    ...base,
    edge_id: `${base.relation}:${base.from_entity_id}->${base.to_entity_id}`,
    semantic_digest: edgeSemanticDigest(base),
  };
}

/** U-DRG-001: kind別ID regexとstable sort/dedup/semantic_digest採番を決定的に行う。 */
export function canonicalizeRegistryDeclaration(
  raw: unknown,
  policy: RegistryPolicyV1,
): RegistryResultV1<RegistryDeclarationV1> {
  if (policy.schema_version !== "design-registry-policy.v1") {
    return failures([fail("DRG_ID_INVALID", `policy:${String(policy.schema_version)}`)]);
  }
  if (
    !isRecord(raw) ||
    raw.schema_version !== "design-registry-declaration.v1" ||
    !Array.isArray(raw.nodes) ||
    !Array.isArray(raw.edges)
  ) {
    return failures([fail("DRG_ID_INVALID", "declaration:schema")]);
  }
  const found: RegistryFailureV1[] = [];
  const nodes: RegistryNodeV1[] = [];
  for (const rawNode of raw.nodes) {
    const node = parseNode(rawNode);
    if (node === null) {
      found.push(fail("DRG_ID_INVALID", `node:${JSON.stringify(rawNode)}`));
      continue;
    }
    if (!isValidEntityId(node.entity_id, node)) {
      found.push(fail("DRG_ID_INVALID", `entity_id:${node.kind}:${node.entity_id}`));
    } else {
      nodes.push(node);
    }
  }
  const edges: RegistryEdgeV1[] = [];
  for (const rawEdge of raw.edges) {
    const edge = parseEdge(rawEdge);
    if (edge === null) {
      found.push(fail("DRG_ID_INVALID", `edge:${JSON.stringify(rawEdge)}`));
    } else {
      edges.push(edge);
    }
  }
  if (found.length > 0) return failures(found);

  const dedupNodes = new Map<string, RegistryNodeV1>();
  for (const node of nodes) {
    const existing = dedupNodes.get(node.semantic_digest);
    if (existing === undefined) dedupNodes.set(node.semantic_digest, node);
  }
  const dedupEdges = new Map<string, RegistryEdgeV1>();
  for (const edge of edges) {
    const key = `${edge.semantic_digest}:${edge.edge_id}`;
    if (!dedupEdges.has(key)) dedupEdges.set(key, edge);
  }
  const sortedNodes = [...dedupNodes.values()].sort((a, b) =>
    a.entity_id.localeCompare(b.entity_id),
  );
  const sortedEdges = [...dedupEdges.values()].sort((a, b) => a.edge_id.localeCompare(b.edge_id));
  const declaration_digest = sha256(
    JSON.stringify({
      edges: sortedEdges.map((edge) => edge.semantic_digest),
      nodes: sortedNodes.map((node) => node.semantic_digest),
      schema_version: "design-registry-declaration.v1",
    }),
  );
  return {
    ok: true,
    value: {
      schema_version: "design-registry-declaration.v1",
      nodes: sortedNodes,
      edges: sortedEdges,
      declaration_digest,
    },
  };
}

function endpointMatches(endpoint: AdjacencyEndpoint, node: RegistryNodeV1): boolean {
  if (endpoint.kind !== node.kind) return false;
  if (endpoint.service_role !== undefined) return node.service_role === endpoint.service_role;
  return true;
}

// HR-FR-DHR-003 の直列 chain（interaction→permission→command→api）内での段飛ばし・role 不一致
// だけを DRG_UNGUARDED_INVOKE とし、chain と無関係な kind の組は DRG_RELATION_INVALID に残す。
function isServiceChainBreak(
  relation: RegistryRelationV1,
  ends: { from: RegistryNodeV1; to: RegistryNodeV1 },
): boolean {
  if (relation === "invokes") {
    const serviceToService = ends.from.kind === "service" && ends.to.kind === "service";
    const interactionBypass = ends.from.kind === "interaction" && ends.to.kind === "service";
    return serviceToService || interactionBypass;
  }
  if (relation === "guarded_by") {
    return (
      ends.from.kind === "interaction" &&
      ends.to.kind === "service" &&
      ends.to.service_role !== "permission"
    );
  }
  return false;
}

/**
 * 宣言された public command 例外そのものの健全性を検査する（U-DRG-013）。
 * allowlist は放置すると腐る（対象が消える / role が変わる）ため、graph 実態と照合して
 * fail-close し、「効かない例外が黙って残る」状態を作らない。
 */
function publicCommandViolations(
  policy: RegistryPolicyV1,
  byId: ReadonlyMap<string, RegistryNodeV1>,
): { failures: RegistryFailureV1[]; allowed: Set<string> } {
  const found: RegistryFailureV1[] = [];
  const allowed = new Set<string>();
  const seen = new Set<string>();
  for (const exception of policy.public_commands ?? []) {
    if (seen.has(exception.entity_id)) {
      found.push(fail("DRG_DUPLICATE_ID", `public-command-duplicate:${exception.entity_id}`));
      continue;
    }
    seen.add(exception.entity_id);
    if (!exception.rationale.trim() || !exception.authority_ref.trim()) {
      found.push(fail("DRG_STALE_INPUT", `public-command-unjustified:${exception.entity_id}`));
      continue;
    }
    const node = byId.get(exception.entity_id);
    if (node === undefined) {
      found.push(fail("DRG_STALE_INPUT", `public-command-missing:${exception.entity_id}`));
      continue;
    }
    if (node.kind !== "service" || node.service_role !== "command") {
      found.push(fail("DRG_STALE_INPUT", `public-command-role:${exception.entity_id}`));
      continue;
    }
    allowed.add(exception.entity_id);
  }
  return { failures: found, allowed };
}

/**
 * U-DRG-002 / U-DRG-013: 重複ID・片端欠落・adjacency表外・permission素通りinvokesをfail-closeする。
 * policy の public command 例外は `interaction → service[command]` の直結だけを許し、
 * chain の段飛ばし（interaction → api、permission → api）は許さない。
 *
 * 非強制（意図的）: 同一 command が public 宣言と permission chain の双方から到達可能でも
 * 矛盾として扱わない。interaction ごとに公開/保護が分かれる設計は正当でありうるため、
 * ここで一律に拒否しない。
 */
export function validateRegistryGraph(
  decl: RegistryDeclarationV1,
  policy: RegistryPolicyV1 = REGISTRY_POLICY_V1,
): RegistryResultV1<RegistryGraphV1> {
  const found: RegistryFailureV1[] = [];
  if (policy.schema_version !== "design-registry-policy.v1") {
    return failures([fail("DRG_ID_INVALID", `policy:${String(policy.schema_version)}`)]);
  }
  const byId = new Map<string, RegistryNodeV1>();
  for (const node of decl.nodes) {
    if (byId.has(node.entity_id)) {
      found.push(fail("DRG_DUPLICATE_ID", `duplicate:${node.entity_id}`));
    } else {
      byId.set(node.entity_id, node);
    }
  }
  const publicCommands = publicCommandViolations(policy, byId);
  found.push(...publicCommands.failures);
  const seenEdgeIds = new Set<string>();
  for (const edge of decl.edges) {
    // L5 §2: design_registry_edges は edge_id PK + (from,to,relation) unique。永続化前に
    // pure 層で先取り fail-close する（authority/revision 違いの同一 edge_id を許さない）。
    if (seenEdgeIds.has(edge.edge_id)) {
      found.push(fail("DRG_DUPLICATE_ID", `duplicate-edge:${edge.edge_id}`));
      continue;
    }
    seenEdgeIds.add(edge.edge_id);
    const from = byId.get(edge.from_entity_id);
    const to = byId.get(edge.to_entity_id);
    if (from === undefined || to === undefined) {
      found.push(fail("DRG_EDGE_ORPHAN", `orphan:${edge.edge_id}`));
      continue;
    }
    const allowed = ADJACENCY[edge.relation].some(
      ([fromEnd, toEnd]) => endpointMatches(fromEnd, from) && endpointMatches(toEnd, to),
    );
    if (allowed) continue;
    // public command 例外: interaction → 宣言済み service[command] の **invokes 直結だけ** を許す。
    // relation と from.kind の判定は必須（allowlist に載っていても、api→command の逆流や
    // guarded_by での到達まで通してしまうため）。to 側の kind/service_role は
    // publicCommandViolations が allowlist 構築時に検証済みなのでここでは重複させない。
    if (
      edge.relation === "invokes" &&
      from.kind === "interaction" &&
      publicCommands.allowed.has(to.entity_id)
    ) {
      continue;
    }
    if (isServiceChainBreak(edge.relation, { from, to })) {
      found.push(fail("DRG_UNGUARDED_INVOKE", `unguarded:${edge.edge_id}`));
    } else {
      found.push(fail("DRG_RELATION_INVALID", `relation:${edge.edge_id}`));
    }
  }
  if (found.length > 0) return failures(found);
  return {
    ok: true,
    value: { nodes: decl.nodes, edges: decl.edges, graph_digest: decl.declaration_digest },
  };
}

function isTraversable(node: RegistryNodeV1): boolean {
  return node.authority === "shadow" || node.authority === "canonical";
}

/** U-DRG-003: requirement→acceptance chainのorphanを決定的に全列挙する。staleはclosedへ算入しない。 */
export function computeTraceClosure(graph: RegistryGraphV1): RegistryResultV1<TraceClosureV1> {
  const byId = new Map(graph.nodes.map((node) => [node.entity_id, node]));
  const forward = new Map<string, string[]>();
  for (const edge of graph.edges) {
    if (!REGISTRY_CHAIN_RELATIONS.has(edge.relation)) continue;
    const list = forward.get(edge.from_entity_id) ?? [];
    list.push(edge.to_entity_id);
    forward.set(edge.from_entity_id, list);
  }
  const closed: string[] = [];
  const orphanSet = new Set<string>();
  const requirements = graph.nodes
    .filter((node) => node.kind === "requirement" && node.atom_role === null)
    .sort((a, b) => a.entity_id.localeCompare(b.entity_id));
  for (const requirement of requirements) {
    // 起点 requirement 自身が stale/retired の場合も fail-close（静かな green を許さない）。
    if (!isTraversable(requirement)) {
      orphanSet.add(requirement.entity_id);
      continue;
    }
    const visited = new Set<string>([requirement.entity_id]);
    const queue = [requirement.entity_id];
    let reachedAcceptance = false;
    while (queue.length > 0) {
      const currentId = queue.shift() as string;
      const current = byId.get(currentId);
      if (current === undefined || !isTraversable(current)) continue;
      if (current.kind === "acceptance") {
        reachedAcceptance = true;
        continue;
      }
      const nextIds = (forward.get(currentId) ?? []).filter((id) => {
        const next = byId.get(id);
        return next !== undefined && isTraversable(next);
      });
      if (nextIds.length === 0) {
        orphanSet.add(currentId);
        continue;
      }
      for (const nextId of nextIds) {
        if (!visited.has(nextId)) {
          visited.add(nextId);
          queue.push(nextId);
        }
      }
    }
    if (reachedAcceptance && orphanSetMissesRequirement(orphanSet, visited)) {
      closed.push(requirement.entity_id);
    }
  }
  const orphan_entity_ids = [...orphanSet].sort((a, b) => a.localeCompare(b));
  if (orphan_entity_ids.length > 0) {
    return failures(orphan_entity_ids.map((id) => fail("DRG_CHAIN_ORPHAN", `chain-orphan:${id}`)));
  }
  return { ok: true, value: { closed_requirement_ids: closed, orphan_entity_ids } };
}

function orphanSetMissesRequirement(
  orphanSet: ReadonlySet<string>,
  visited: ReadonlySet<string>,
): boolean {
  for (const id of visited) {
    if (orphanSet.has(id)) return false;
  }
  return true;
}

/** U-DRG-004: SCR/FLW/INTの両親原子到達とuser_taskの4原子保持（HR-FR-DHR-006）を検査する。 */
export function validateParentGraph(graph: RegistryGraphV1): RegistryResultV1<ParentCoverageV1> {
  const byId = new Map(graph.nodes.map((node) => [node.entity_id, node]));
  const parentTargets = new Map<string, RegistryNodeV1[]>();
  for (const edge of graph.edges) {
    if (edge.relation !== "parents") continue;
    const target = byId.get(edge.to_entity_id);
    if (target === undefined) continue;
    const list = parentTargets.get(edge.from_entity_id) ?? [];
    list.push(target);
    parentTargets.set(edge.from_entity_id, list);
  }
  const found: RegistryFailureV1[] = [];
  const covered: string[] = [];
  const uiNodes = graph.nodes
    .filter((node) => node.kind === "screen" || node.kind === "flow" || node.kind === "interaction")
    .sort((a, b) => a.entity_id.localeCompare(b.entity_id));
  for (const node of uiNodes) {
    const atoms = (parentTargets.get(node.entity_id) ?? []).map((target) => target.atom_role);
    const hasUserTask = atoms.includes("user_task");
    const hasOutcome = atoms.includes("business_outcome");
    if (hasUserTask && hasOutcome) {
      covered.push(node.entity_id);
    } else {
      found.push(fail("DRG_PARENT_LOST", `ui-parent:${node.entity_id}`));
    }
  }
  const userTasks = graph.nodes
    .filter((node) => node.kind === "requirement" && node.atom_role === "user_task")
    .sort((a, b) => a.entity_id.localeCompare(b.entity_id));
  for (const userTask of userTasks) {
    const childRoles = new Set(
      (parentTargets.get(userTask.entity_id) ?? []).map((target) => target.atom_role),
    );
    const complete = USER_TASK_CHILD_ATOMS.every((role) => childRoles.has(role));
    if (complete) {
      covered.push(userTask.entity_id);
    } else {
      found.push(fail("DRG_PARENT_LOST", `atom-coverage:${userTask.entity_id}`));
    }
  }
  if (found.length > 0) return failures(found);
  return { ok: true, value: { covered_entity_ids: covered } };
}

function collectDirectional(
  graph: RegistryGraphV1,
  input: { start: string; direction: "upstream" | "downstream" },
): TraceHitV1[] {
  const byId = new Map(graph.nodes.map((node) => [node.entity_id, node]));
  const next = new Map<string, string[]>();
  for (const edge of graph.edges) {
    const [from, to] =
      input.direction === "downstream"
        ? [edge.from_entity_id, edge.to_entity_id]
        : [edge.to_entity_id, edge.from_entity_id];
    const list = next.get(from) ?? [];
    list.push(to);
    next.set(from, list);
  }
  const tainted = new Map<string, boolean>([[input.start, false]]);
  const queue = [input.start];
  while (queue.length > 0) {
    const currentId = queue.shift() as string;
    const currentTaint = tainted.get(currentId) ?? false;
    for (const nextId of next.get(currentId) ?? []) {
      const node = byId.get(nextId);
      if (node === undefined) continue;
      const nextTaint = currentTaint || node.authority === "stale" || node.authority === "retired";
      const known = tainted.get(nextId);
      // fail-close の sticky-OR: stale/retired を通る経路が 1 本でもあれば tainted=true。
      // false→true の昇格のみ再訪問し、true を false へ降格しない（単調収束で決定的）。
      if (known === undefined || (known === false && nextTaint === true)) {
        tainted.set(nextId, nextTaint);
        queue.push(nextId);
      }
    }
  }
  tainted.delete(input.start);
  return [...tainted.entries()]
    .map(([entity_id, stale_tainted]) => ({ entity_id, stale_tainted }))
    .sort((a, b) => a.entity_id.localeCompare(b.entity_id));
}

/** U-DRG-005: 双方向traceを決定的に返し、stale/retired経由へstale markを付ける。 */
export function queryTrace(input: TraceQueryInputV1): RegistryResultV1<TraceResultV1> {
  const known = input.graph.nodes.some((node) => node.entity_id === input.entity_id);
  if (!known) {
    return failures([fail("DRG_ID_INVALID", `trace-start:${input.entity_id}`)]);
  }
  return {
    ok: true,
    value: {
      entity_id: input.entity_id,
      upstream: collectDirectional(input.graph, { start: input.entity_id, direction: "upstream" }),
      downstream: collectDirectional(input.graph, {
        start: input.entity_id,
        direction: "downstream",
      }),
    },
  };
}

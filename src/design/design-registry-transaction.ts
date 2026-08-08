/**
 * Design Registry slice2 — 取引系（PLAN-L7-517、Issue #177）。
 *
 * L6設計 docs/design/helix/L6-function-design/design-registry.md §1-§2 を正本とする。
 * buildRegistryCommit / markStaleLineage は pure、commitRegistry は store（唯一の
 * registry write authority）への atomic 委譲であり、digest 再検証・CAS・二重 operation
 * 検査を通過した bundle だけを書く。SQLite 永続化は後続スライス（本 module は
 * in-memory reference store を正本契約として提供する）。
 */
import { createHash } from "node:crypto";
import {
  computeRegistryEdgeSemanticDigest,
  computeRegistryNodeSemanticDigest,
  REGISTRY_CHAIN_RELATIONS,
  type RegistryAuthorityV1,
  type RegistryEdgeV1,
  type RegistryFailureCodeV1,
  type RegistryFailureV1,
  type RegistryGraphV1,
  type RegistryNodeV1,
  type RegistryResultV1,
} from "./design-registry";

export interface RegistryCommitInputV1 {
  graph: RegistryGraphV1;
  operation_id: string;
  expected_registry_head: string;
}

export interface RegistryVersionV1 {
  version_id: string;
  entity_id: string;
  revision: number;
  semantic_digest: string;
  supersedes_revision: number | null;
}

export const REGISTRY_APPEND_ORDER = ["node", "edge", "version", "head"] as const;

export interface RegistryCommitBundleV1 {
  operation_id: string;
  operation_digest: string;
  expected_registry_head: string;
  nodes: RegistryNodeV1[];
  edges: RegistryEdgeV1[];
  versions: RegistryVersionV1[];
  append_order: ["node", "edge", "version", "head"];
  write_set_digest: string;
}

export interface RegistryCommitReceiptV1 {
  operation_id: string;
  operation_digest: string;
  before_registry_head: string;
  after_registry_head: string;
  inserted_node_count: number;
  inserted_edge_count: number;
  status: "committed";
}

export interface RegistryStoreV1 {
  registry_write_authority: "design_registry_store";
  commitRegistry(
    bundle: RegistryCommitBundleV1,
  ): Promise<RegistryResultV1<RegistryCommitReceiptV1>>;
  /** slice5: genesis 済み entity の revision / authority 遷移（UPDATE 経路）。 */
  commitAuthorityTransition(
    bundle: RegistryTransitionBundleV1,
  ): Promise<RegistryResultV1<RegistryTransitionReceiptV1>>;
}

export interface RegistryNodeUpdateV1 {
  entity_id: string;
  from_revision: number;
  to_revision: number;
  from_authority: RegistryAuthorityV1;
  to_authority: RegistryAuthorityV1;
  /**
   * entity identity は revision を跨いで不変。build 時点の current 値を bundle へ束縛し、
   * store の行 CAS（WHERE 条件）で DB 実態にも照合する。bundle だけを見る apply 層では
   * 「identity ごと整合的に作り直した bundle」を判別できないため、最終防衛線は DB 側に置く。
   */
  from_kind: RegistryNodeV1["kind"];
  from_atom_role: RegistryNodeV1["atom_role"];
  from_service_role: RegistryNodeV1["service_role"];
  node: RegistryNodeV1;
}

export interface RegistryEdgeUpdateV1 {
  edge_id: string;
  from_authority: RegistryAuthorityV1;
  to_authority: RegistryAuthorityV1;
  /** edge の revision は本遷移では不変。node identity と同じく行 CAS で DB 実態へ照合する。 */
  from_revision: number;
  edge: RegistryEdgeV1;
}

export const REGISTRY_TRANSITION_APPLY_ORDER = ["version", "node", "edge", "head"] as const;

export interface RegistryTransitionBundleV1 {
  schema_version: "design-registry-transition.v1";
  operation_id: string;
  operation_digest: string;
  expected_registry_head: string;
  node_updates: RegistryNodeUpdateV1[];
  edge_updates: RegistryEdgeUpdateV1[];
  version_appends: RegistryVersionV1[];
  apply_order: ["version", "node", "edge", "head"];
  write_set_digest: string;
  reason: string;
}

export interface RegistryTransitionReceiptV1 {
  operation_id: string;
  operation_digest: string;
  before_registry_head: string;
  after_registry_head: string;
  updated_node_count: number;
  updated_edge_count: number;
  appended_version_count: number;
  status: "committed";
}

export interface AuthorityTransitionInputV1 {
  operation_id: string;
  expected_registry_head: string;
  /** commit 済み registry の現在ビュー（store 読み取り結果）。 */
  current: RegistryGraphV1;
  /** revision を 1 つ進める node の更新後フィールド（digest は再導出して検証する）。 */
  next_nodes: readonly RegistryNodeV1[];
  /** markStaleLineage の出力。null なら stale 遷移を含まない。 */
  lineage: StaleLineageV1 | null;
  reason: string;
}

export interface StaleTriggerV1 {
  schema_version: "design-registry-stale-trigger.v1";
  changed_entity_ids: readonly string[];
  reason: string;
}

export interface StaleLineageV1 {
  lineage_id: string;
  stale_entity_ids: readonly string[];
  stale_edge_ids: readonly string[];
  reason: string;
}

function sha256(text: string): string {
  return `sha256:${createHash("sha256").update(text, "utf8").digest("hex")}`;
}

function fail(code: RegistryFailureCodeV1, evidence: string): RegistryFailureV1 {
  return { code, evidence_digest: sha256(evidence) };
}

function failures<T>(items: readonly RegistryFailureV1[]): RegistryResultV1<T> {
  return { ok: false, failures: items };
}

// write_set_digest は node/edge の「実フィールドから再導出した」semantic digest と
// version 行の全 field を対象にする。carried-over の semantic_digest 列は信頼しない
// （review round1 Critical-1/2 の masked-mutation 対策）。
function computeWriteSetDigest(input: {
  nodes: readonly RegistryNodeV1[];
  edges: readonly RegistryEdgeV1[];
  versions: readonly RegistryVersionV1[];
}): string {
  return sha256(
    JSON.stringify({
      edges: input.edges.map((edge) => computeRegistryEdgeSemanticDigest(edge)),
      nodes: input.nodes.map((node) => computeRegistryNodeSemanticDigest(node)),
      versions: input.versions.map((version) =>
        JSON.stringify({
          entity_id: version.entity_id,
          revision: version.revision,
          semantic_digest: version.semantic_digest,
          supersedes_revision: version.supersedes_revision,
          version_id: version.version_id,
        }),
      ),
    }),
  );
}

function cloneNode(node: RegistryNodeV1): RegistryNodeV1 {
  return { ...node };
}

function cloneEdge(edge: RegistryEdgeV1): RegistryEdgeV1 {
  return { ...edge };
}

function cloneVersion(version: RegistryVersionV1): RegistryVersionV1 {
  return { ...version };
}

// commit 時の bundle 内容再検証: semantic_digest 列・edge_id・version 導出のすべてを
// 実フィールドから再計算して照合する（改変は DRG_STALE_INPUT）。
function bundleContentViolation(bundle: RegistryCommitBundleV1): string | null {
  for (const node of bundle.nodes) {
    if (node.semantic_digest !== computeRegistryNodeSemanticDigest(node)) {
      return `node:${node.entity_id}`;
    }
  }
  for (const edge of bundle.edges) {
    if (edge.semantic_digest !== computeRegistryEdgeSemanticDigest(edge)) {
      return `edge:${edge.edge_id}`;
    }
    if (edge.edge_id !== `${edge.relation}:${edge.from_entity_id}->${edge.to_entity_id}`) {
      return `edge-id:${edge.edge_id}`;
    }
  }
  if (bundle.versions.length !== bundle.nodes.length) return "versions:count";
  for (const [index, version] of bundle.versions.entries()) {
    const node = bundle.nodes[index];
    if (node === undefined) return `version:${version.version_id}`;
    const expected = deriveVersion(node);
    if (
      version.version_id !== expected.version_id ||
      version.entity_id !== expected.entity_id ||
      version.revision !== expected.revision ||
      version.semantic_digest !== expected.semantic_digest ||
      version.supersedes_revision !== expected.supersedes_revision
    ) {
      return `version:${version.version_id}`;
    }
  }
  return null;
}

function deriveVersion(node: RegistryNodeV1): RegistryVersionV1 {
  return {
    version_id: `${node.entity_id}@${node.revision}`,
    entity_id: node.entity_id,
    revision: node.revision,
    semantic_digest: node.semantic_digest,
    supersedes_revision: node.revision > 1 ? node.revision - 1 : null,
  };
}

function computeOperationDigest(input: {
  operation_id: string;
  expected_registry_head: string;
  write_set_digest: string;
}): string {
  return sha256(
    JSON.stringify({
      expected_registry_head: input.expected_registry_head,
      operation_id: input.operation_id,
      write_set_digest: input.write_set_digest,
    }),
  );
}

/** U-DRG-006: append順固定・write_set/operation digest採番の決定的 commit bundle 構築。 */
export function buildRegistryCommit(
  input: RegistryCommitInputV1,
): RegistryResultV1<RegistryCommitBundleV1> {
  if (!input.operation_id.trim() || !input.expected_registry_head.trim()) {
    return failures([fail("DRG_ID_INVALID", `commit-input:${input.operation_id}`)]);
  }
  // 呼び出し元 graph との参照共有を断つ（review round1 Critical-3 の aliasing 対策）。
  const nodes = input.graph.nodes.map(cloneNode);
  const edges = input.graph.edges.map(cloneEdge);
  const versions: RegistryVersionV1[] = nodes.map(deriveVersion);
  const write_set_digest = computeWriteSetDigest({ nodes, edges, versions });
  const operation_digest = computeOperationDigest({
    operation_id: input.operation_id,
    expected_registry_head: input.expected_registry_head,
    write_set_digest,
  });
  return {
    ok: true,
    value: {
      operation_id: input.operation_id,
      operation_digest,
      expected_registry_head: input.expected_registry_head,
      nodes,
      edges,
      versions,
      append_order: [...REGISTRY_APPEND_ORDER] as ["node", "edge", "version", "head"],
      write_set_digest,
    },
  };
}

/**
 * U-DRG-006: digest 再検証（改変 = DRG_STALE_INPUT）を通過した bundle だけを store の
 * atomic commit（CAS/二重 operation = DRG_CAS_CONFLICT、増分 0）へ委譲する。
 */
export async function commitRegistry(
  bundle: RegistryCommitBundleV1,
  store: RegistryStoreV1,
): Promise<RegistryResultV1<RegistryCommitReceiptV1>> {
  const expectedWriteSet = computeWriteSetDigest(bundle);
  const expectedOperation = computeOperationDigest({
    operation_id: bundle.operation_id,
    expected_registry_head: bundle.expected_registry_head,
    write_set_digest: expectedWriteSet,
  });
  const appendOrderIntact =
    JSON.stringify(bundle.append_order) === JSON.stringify(REGISTRY_APPEND_ORDER);
  const contentViolation = bundleContentViolation(bundle);
  if (
    bundle.write_set_digest !== expectedWriteSet ||
    bundle.operation_digest !== expectedOperation ||
    !appendOrderIntact ||
    contentViolation !== null
  ) {
    return failures([
      fail(
        "DRG_STALE_INPUT",
        `bundle-tamper:${bundle.operation_id}:${contentViolation ?? "digest"}`,
      ),
    ]);
  }
  return store.commitRegistry(bundle);
}

export interface InMemoryRegistryStateV1 {
  head: string;
  nodes: RegistryNodeV1[];
  edges: RegistryEdgeV1[];
  versions: RegistryVersionV1[];
  committed_operation_ids: Set<string>;
}

export interface InMemoryRegistryStoreOptionsV1 {
  injectAppendFault?: "node" | "edge" | "version" | "head";
}

/**
 * in-memory reference store（registry write authority の正本契約）。CAS・二重 operation・
 * append fault rollback を単一同期区間で判定し、失敗経路は増分 0 を保証する。
 */
export function createInMemoryRegistryStore(
  initialHead: string,
  options: InMemoryRegistryStoreOptionsV1 = {},
): { state: InMemoryRegistryStateV1; store: RegistryStoreV1 } {
  const state: InMemoryRegistryStateV1 = {
    head: initialHead,
    nodes: [],
    edges: [],
    versions: [],
    committed_operation_ids: new Set<string>(),
  };
  const store: RegistryStoreV1 = {
    registry_write_authority: "design_registry_store",
    async commitRegistry(bundle) {
      if (state.committed_operation_ids.has(bundle.operation_id)) {
        return failures([fail("DRG_CAS_CONFLICT", `duplicate-operation:${bundle.operation_id}`)]);
      }
      if (bundle.expected_registry_head !== state.head) {
        return failures([
          fail("DRG_CAS_CONFLICT", `head-cas:${bundle.expected_registry_head}!=${state.head}`),
        ]);
      }
      const staged = {
        nodes: [...state.nodes],
        edges: [...state.edges],
        versions: [...state.versions],
      };
      try {
        for (const step of bundle.append_order) {
          if (options.injectAppendFault === step) {
            throw new Error(`append-fault:${step}`);
          }
          // commit 済み state の不変性: 呼び出し元 bundle オブジェクトとの共有を断つ。
          if (step === "node") staged.nodes.push(...bundle.nodes.map(cloneNode));
          if (step === "edge") staged.edges.push(...bundle.edges.map(cloneEdge));
          if (step === "version") staged.versions.push(...bundle.versions.map(cloneVersion));
        }
      } catch {
        // rollback: staged を破棄し増分 0 を保つ。
        return failures([fail("DRG_CAS_CONFLICT", `append-fault:${bundle.operation_id}`)]);
      }
      const before = state.head;
      const after = sha256(`${before}:${bundle.operation_digest}`);
      state.nodes = staged.nodes;
      state.edges = staged.edges;
      state.versions = staged.versions;
      state.head = after;
      state.committed_operation_ids.add(bundle.operation_id);
      return {
        ok: true,
        value: {
          operation_id: bundle.operation_id,
          operation_digest: bundle.operation_digest,
          before_registry_head: before,
          after_registry_head: after,
          inserted_node_count: bundle.nodes.length,
          inserted_edge_count: bundle.edges.length,
          status: "committed",
        },
      };
    },
    async commitAuthorityTransition(bundle) {
      if (state.committed_operation_ids.has(bundle.operation_id)) {
        return failures([fail("DRG_CAS_CONFLICT", `duplicate-operation:${bundle.operation_id}`)]);
      }
      if (bundle.expected_registry_head !== state.head) {
        return failures([
          fail("DRG_CAS_CONFLICT", `head-cas:${bundle.expected_registry_head}!=${state.head}`),
        ]);
      }
      // 行 CAS を staged copy 上で判定し、1 件でも外れたら増分 0 で戻す。
      const nodes = state.nodes.map(cloneNode);
      const edges = state.edges.map(cloneEdge);
      const versions = state.versions.map(cloneVersion);
      for (const version of bundle.version_appends) {
        if (versions.some((row) => row.version_id === version.version_id)) {
          return failures([fail("DRG_CAS_CONFLICT", `version-exists:${version.version_id}`)]);
        }
        versions.push(cloneVersion(version));
      }
      for (const update of bundle.node_updates) {
        const index = nodes.findIndex(
          (row) =>
            row.entity_id === update.entity_id &&
            row.revision === update.from_revision &&
            row.authority === update.from_authority &&
            row.kind === update.from_kind &&
            row.atom_role === update.from_atom_role &&
            row.service_role === update.from_service_role,
        );
        if (index < 0) {
          return failures([fail("DRG_CAS_CONFLICT", `node-row-cas:${update.entity_id}`)]);
        }
        nodes[index] = cloneNode(update.node);
      }
      for (const update of bundle.edge_updates) {
        const index = edges.findIndex(
          (row) =>
            row.edge_id === update.edge_id &&
            row.authority === update.from_authority &&
            row.revision === update.from_revision,
        );
        if (index < 0) {
          return failures([fail("DRG_CAS_CONFLICT", `edge-row-cas:${update.edge_id}`)]);
        }
        edges[index] = cloneEdge(update.edge);
      }
      const before = state.head;
      const after = sha256(`${before}:${bundle.operation_digest}`);
      state.nodes = nodes;
      state.edges = edges;
      state.versions = versions;
      state.head = after;
      state.committed_operation_ids.add(bundle.operation_id);
      return {
        ok: true,
        value: {
          operation_id: bundle.operation_id,
          operation_digest: bundle.operation_digest,
          before_registry_head: before,
          after_registry_head: after,
          updated_node_count: bundle.node_updates.length,
          updated_edge_count: bundle.edge_updates.length,
          appended_version_count: bundle.version_appends.length,
          status: "committed",
        },
      };
    },
  };
  return { state, store };
}

// --- slice5: authority 遷移（revision UPDATE + stale 適用）---------------------------------

/**
 * 遷移 write set の digest。node/edge は「実フィールドから再導出した」semantic digest と
 * 遷移そのもの（from/to の revision・authority）を対象にし、宣言された digest 列は信頼しない
 * （slice2 と同じ masked-mutation 対策）。
 */
function computeTransitionWriteSetDigest(input: {
  node_updates: readonly RegistryNodeUpdateV1[];
  edge_updates: readonly RegistryEdgeUpdateV1[];
  version_appends: readonly RegistryVersionV1[];
}): string {
  return sha256(
    JSON.stringify({
      edge_updates: input.edge_updates.map((update) => ({
        digest: computeRegistryEdgeSemanticDigest(update.edge),
        edge_id: update.edge_id,
        from_authority: update.from_authority,
        from_revision: update.from_revision,
        to_authority: update.to_authority,
      })),
      node_updates: input.node_updates.map((update) => ({
        digest: computeRegistryNodeSemanticDigest(update.node),
        entity_id: update.entity_id,
        from_atom_role: update.from_atom_role,
        from_authority: update.from_authority,
        from_kind: update.from_kind,
        from_revision: update.from_revision,
        from_service_role: update.from_service_role,
        to_authority: update.to_authority,
        to_revision: update.to_revision,
      })),
      version_appends: input.version_appends.map((version) => ({
        entity_id: version.entity_id,
        revision: version.revision,
        semantic_digest: version.semantic_digest,
        supersedes_revision: version.supersedes_revision,
        version_id: version.version_id,
      })),
    }),
  );
}

/**
 * 遷移 bundle の内容再検証。update 行が指す node/edge の digest・revision・authority が
 * 実フィールドと整合しない場合を検出する（bundle 改変 = DRG_STALE_INPUT）。
 */
function transitionContentViolation(bundle: RegistryTransitionBundleV1): string | null {
  for (const update of bundle.node_updates) {
    const node = update.node;
    if (node.semantic_digest !== computeRegistryNodeSemanticDigest(node)) {
      return `node-digest:${update.entity_id}`;
    }
    if (
      node.entity_id !== update.entity_id ||
      node.revision !== update.to_revision ||
      node.authority !== update.to_authority
    ) {
      return `node-transition:${update.entity_id}`;
    }
    if (
      update.to_revision !== update.from_revision &&
      update.to_revision !== update.from_revision + 1
    ) {
      return `node-revision:${update.entity_id}`;
    }
    // identity は revision を跨いで不変（bundle 内の自己整合性検査。DB 実態との照合は行 CAS）。
    if (
      node.kind !== update.from_kind ||
      node.atom_role !== update.from_atom_role ||
      node.service_role !== update.from_service_role
    ) {
      return `node-identity:${update.entity_id}`;
    }
  }
  for (const update of bundle.edge_updates) {
    const edge = update.edge;
    if (edge.semantic_digest !== computeRegistryEdgeSemanticDigest(edge)) {
      return `edge-digest:${update.edge_id}`;
    }
    if (
      edge.edge_id !== update.edge_id ||
      edge.authority !== update.to_authority ||
      edge.revision !== update.from_revision
    ) {
      return `edge-transition:${update.edge_id}`;
    }
  }
  // version 行は revision を進めた node と 1:1（authority のみの遷移は追記しない）。
  const bumped = bundle.node_updates.filter((update) => update.to_revision > update.from_revision);
  if (bundle.version_appends.length !== bumped.length) return "versions:count";
  for (const [index, version] of bundle.version_appends.entries()) {
    const update = bumped[index];
    if (update === undefined) return `version:${version.version_id}`;
    const expected = deriveVersion(update.node);
    if (
      version.version_id !== expected.version_id ||
      version.entity_id !== expected.entity_id ||
      version.revision !== expected.revision ||
      version.semantic_digest !== expected.semantic_digest ||
      version.supersedes_revision !== expected.supersedes_revision
    ) {
      return `version:${version.version_id}`;
    }
  }
  return null;
}

/**
 * U-DRG-010: genesis 済み entity の revision bump と stale 遷移を決定的に組み立てる。
 *
 * authority lattice: `retired` は終端であり、そこからの遷移は拒否する。`stale` からの復帰
 * （stale→canonical）は再検証経路として意図的に許可する（stale は「要再検証」であり
 * 恒久的な失効ではない）。
 * next_nodes と lineage が同一 entity を指す場合は、明示指定である next_nodes（revision bump）を
 * 優先し、lineage 側の stale マークは残余 entity にだけ適用する。
 */
export function buildAuthorityTransition(
  input: AuthorityTransitionInputV1,
): RegistryResultV1<RegistryTransitionBundleV1> {
  const found: RegistryFailureV1[] = [];
  if (!input.operation_id.trim() || !input.expected_registry_head.trim()) {
    return failures([fail("DRG_ID_INVALID", `transition-input:${input.operation_id}`)]);
  }
  const currentById = new Map(input.current.nodes.map((node) => [node.entity_id, node]));
  const currentEdgeById = new Map(input.current.edges.map((edge) => [edge.edge_id, edge]));

  const seen = new Set<string>();
  for (const node of input.next_nodes) {
    if (seen.has(node.entity_id)) {
      found.push(fail("DRG_DUPLICATE_ID", `transition-duplicate:${node.entity_id}`));
    }
    seen.add(node.entity_id);
  }

  const nodeUpdates: RegistryNodeUpdateV1[] = [];
  for (const next of input.next_nodes) {
    const current = currentById.get(next.entity_id);
    if (current === undefined) {
      found.push(fail("DRG_ID_INVALID", `transition-unknown:${next.entity_id}`));
      continue;
    }
    if (next.revision !== current.revision + 1) {
      found.push(
        fail("DRG_REVISION_MISMATCH", `transition-revision:${next.entity_id}:${next.revision}`),
      );
      continue;
    }
    // entity identity（kind / atom_role / service_role）は revision を跨いで不変。
    if (
      next.kind !== current.kind ||
      next.atom_role !== current.atom_role ||
      next.service_role !== current.service_role
    ) {
      found.push(fail("DRG_REVISION_MISMATCH", `transition-identity:${next.entity_id}`));
      continue;
    }
    if (current.authority === "retired" && next.authority !== "retired") {
      found.push(fail("DRG_REVISION_MISMATCH", `transition-retired:${next.entity_id}`));
      continue;
    }
    if (next.semantic_digest !== computeRegistryNodeSemanticDigest(next)) {
      found.push(fail("DRG_STALE_INPUT", `transition-digest:${next.entity_id}`));
      continue;
    }
    nodeUpdates.push({
      entity_id: next.entity_id,
      from_revision: current.revision,
      to_revision: next.revision,
      from_authority: current.authority,
      to_authority: next.authority,
      from_kind: current.kind,
      from_atom_role: current.atom_role,
      from_service_role: current.service_role,
      node: cloneNode(next),
    });
  }

  const edgeUpdates: RegistryEdgeUpdateV1[] = [];
  if (input.lineage !== null) {
    const lineage = input.lineage;
    for (const entityId of lineage.stale_entity_ids) {
      const current = currentById.get(entityId);
      if (current === undefined) {
        found.push(fail("DRG_ID_INVALID", `lineage-unknown-entity:${entityId}`));
        continue;
      }
      // next_nodes による明示 revision bump が優先。lineage は残余へ適用する。
      if (seen.has(entityId)) continue;
      if (current.authority === "retired") {
        found.push(fail("DRG_REVISION_MISMATCH", `lineage-retired:${entityId}`));
        continue;
      }
      const staled = { ...current, authority: "stale" as const };
      nodeUpdates.push({
        entity_id: entityId,
        from_revision: current.revision,
        to_revision: current.revision,
        from_authority: current.authority,
        to_authority: "stale",
        from_kind: current.kind,
        from_atom_role: current.atom_role,
        from_service_role: current.service_role,
        node: { ...staled, semantic_digest: computeRegistryNodeSemanticDigest(staled) },
      });
    }
    for (const edgeId of lineage.stale_edge_ids) {
      const current = currentEdgeById.get(edgeId);
      if (current === undefined) {
        found.push(fail("DRG_ID_INVALID", `lineage-unknown-edge:${edgeId}`));
        continue;
      }
      if (current.authority === "retired") {
        found.push(fail("DRG_REVISION_MISMATCH", `lineage-retired-edge:${edgeId}`));
        continue;
      }
      const staled = { ...current, authority: "stale" as const };
      edgeUpdates.push({
        edge_id: edgeId,
        from_authority: current.authority,
        to_authority: "stale",
        from_revision: current.revision,
        edge: { ...staled, semantic_digest: computeRegistryEdgeSemanticDigest(staled) },
      });
    }
  }

  if (found.length > 0) return failures(found);
  // 変化 0 の遷移は静かな green を許さない（head だけ前進させない）。
  if (nodeUpdates.length === 0 && edgeUpdates.length === 0) {
    return failures([fail("DRG_STALE_INPUT", `transition-empty:${input.operation_id}`)]);
  }

  nodeUpdates.sort((a, b) => a.entity_id.localeCompare(b.entity_id));
  edgeUpdates.sort((a, b) => a.edge_id.localeCompare(b.edge_id));
  const version_appends = nodeUpdates
    .filter((update) => update.to_revision > update.from_revision)
    .map((update) => deriveVersion(update.node));
  const write_set_digest = computeTransitionWriteSetDigest({
    node_updates: nodeUpdates,
    edge_updates: edgeUpdates,
    version_appends,
  });
  const operation_digest = computeOperationDigest({
    operation_id: input.operation_id,
    expected_registry_head: input.expected_registry_head,
    write_set_digest,
  });
  return {
    ok: true,
    value: {
      schema_version: "design-registry-transition.v1",
      operation_id: input.operation_id,
      operation_digest,
      expected_registry_head: input.expected_registry_head,
      node_updates: nodeUpdates,
      edge_updates: edgeUpdates,
      version_appends,
      apply_order: [...REGISTRY_TRANSITION_APPLY_ORDER] as ["version", "node", "edge", "head"],
      write_set_digest,
      reason: input.reason,
    },
  };
}

/**
 * U-DRG-010: digest 再検証を通過した遷移 bundle だけを store の atomic UPDATE 経路へ委譲する。
 * commitRegistry と同じ規律（宣言 digest を信じない・改変は DRG_STALE_INPUT）。
 */
export async function applyAuthorityTransition(
  bundle: RegistryTransitionBundleV1,
  store: RegistryStoreV1,
): Promise<RegistryResultV1<RegistryTransitionReceiptV1>> {
  const expectedWriteSet = computeTransitionWriteSetDigest(bundle);
  const expectedOperation = computeOperationDigest({
    operation_id: bundle.operation_id,
    expected_registry_head: bundle.expected_registry_head,
    write_set_digest: expectedWriteSet,
  });
  const applyOrderIntact =
    JSON.stringify(bundle.apply_order) === JSON.stringify(REGISTRY_TRANSITION_APPLY_ORDER);
  const contentViolation = transitionContentViolation(bundle);
  if (
    bundle.schema_version !== "design-registry-transition.v1" ||
    bundle.write_set_digest !== expectedWriteSet ||
    bundle.operation_digest !== expectedOperation ||
    !applyOrderIntact ||
    contentViolation !== null
  ) {
    return failures([
      fail(
        "DRG_STALE_INPUT",
        `transition-tamper:${bundle.operation_id}:${contentViolation ?? "digest"}`,
      ),
    ]);
  }
  return store.commitAuthorityTransition(bundle);
}

/** U-DRG-007: 上流digest差のentityと依存edgeを同一lineageで決定的にstale化する。 */
export function markStaleLineage(
  graph: RegistryGraphV1,
  trigger: StaleTriggerV1,
): RegistryResultV1<StaleLineageV1> {
  if (trigger.schema_version !== "design-registry-stale-trigger.v1") {
    return failures([fail("DRG_STALE_INPUT", "trigger:schema")]);
  }
  if (trigger.changed_entity_ids.length === 0) {
    return failures([fail("DRG_STALE_INPUT", "trigger:empty")]);
  }
  const byId = new Set(graph.nodes.map((node) => node.entity_id));
  const unknown = trigger.changed_entity_ids.filter((id) => !byId.has(id));
  if (unknown.length > 0) {
    return failures(unknown.map((id) => fail("DRG_ID_INVALID", `stale-trigger:${id}`)));
  }
  // 前方依存（chain relation）だけを下流伝播する。parents/binds は子→親/装飾の
  // 逆参照であり、これを辿ると画面変更が業務要件を stale 化してしまう
  // （review round1 Critical-4 の是正）。
  const downstream = new Map<string, string[]>();
  for (const edge of graph.edges) {
    if (!REGISTRY_CHAIN_RELATIONS.has(edge.relation)) continue;
    const list = downstream.get(edge.from_entity_id) ?? [];
    list.push(edge.to_entity_id);
    downstream.set(edge.from_entity_id, list);
  }
  const stale = new Set<string>(trigger.changed_entity_ids);
  const queue = [...trigger.changed_entity_ids];
  while (queue.length > 0) {
    const currentId = queue.shift() as string;
    for (const nextId of downstream.get(currentId) ?? []) {
      if (!stale.has(nextId)) {
        stale.add(nextId);
        queue.push(nextId);
      }
    }
  }
  const stale_entity_ids = [...stale].sort((a, b) => a.localeCompare(b));
  // edge 側の stale マーキングは全 relation を対象にする（意図的な非対称）: parents/binds
  // など逆参照 edge も、接続先 entity が stale 化した時点で「再検証が必要な結線」として
  // lineage へ通知する。entity 側の伝播（chain 限定）とは役割が異なる。
  const stale_edge_ids = graph.edges
    .filter((edge) => stale.has(edge.from_entity_id) || stale.has(edge.to_entity_id))
    .map((edge) => edge.edge_id)
    .sort((a, b) => a.localeCompare(b));
  const lineage_id = sha256(
    JSON.stringify({ entities: stale_entity_ids, edges: stale_edge_ids, reason: trigger.reason }),
  );
  return {
    ok: true,
    value: { lineage_id, stale_entity_ids, stale_edge_ids, reason: trigger.reason },
  };
}

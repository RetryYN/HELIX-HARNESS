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
  };
  return { state, store };
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

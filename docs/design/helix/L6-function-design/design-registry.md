---
title: "HELIX L6 機能設計 — Design Registry"
layer: L6
kind: add-design
status: draft
created: 2026-08-07
updated: 2026-08-07
owner: Claude / TL
plan: PLAN-L1-07-infinity-loop-platform-requirements
design_slice: HDS-DRG-01
related_l3: docs/design/helix/L3-requirements/ai-vision-design-harness-engine.md
related_l5: docs/design/helix/L5-detail/design-registry.md
pair_artifact: docs/test-design/helix/L6-design-registry-unit-test-design.md
next_pair_freeze: L7
requirements:
  - VDH-FR-002
  - VDH-FR-008
  - HR-FR-DHR-001
  - HR-FR-DHR-006
github_issue_id: 177
---

# HELIX L6 機能設計 — Design Registry

semantic ID 原則 VDH-FR-003 は #209、chain 追跡 HR-FR-DHR-003 は #210 を primary owner とし、
本設計は consumer trace のみを保持する。

## §0 型とauthority

pure API は filesystem / clock / DB を直接読まず versioned input を受ける。write は
Node transaction（RegistryTransaction）だけが持つ。

```ts
type RegistryEntityKindV1 = "requirement" | "screen" | "flow" | "interaction" | "state" |
  "component" | "design_token" | "content" | "analytics_event" | "service" | "domain_object" | "acceptance";
type RegistryRelationV1 = "decomposes_to" | "presents" | "guarded_by" | "invokes" | "emits" |
  "measures" | "accepted_by" | "binds" | "parents";
type RegistryAuthorityV1 = "shadow" | "canonical" | "stale" | "retired";
type RegistryServiceRoleV1 = "permission" | "command" | "api";
type RegistryAtomRoleV1 = "user_task" | "business_outcome" | "scenario" | "context" |
  "success_result" | "decision_rationale";
type RegistryFailureV1 =
  | { code: "DRG_ID_INVALID" | "DRG_DUPLICATE_ID" | "DRG_EDGE_ORPHAN" | "DRG_RELATION_INVALID"
      | "DRG_CHAIN_ORPHAN" | "DRG_PARENT_LOST" | "DRG_REVISION_MISMATCH" | "DRG_CAS_CONFLICT"
      | "DRG_STALE_INPUT" | "DRG_UNGUARDED_INVOKE";
      evidence_digest: string };
type RegistryResultV1<T> = { ok: true; value: T } | { ok: false; failures: readonly RegistryFailureV1[] };
```

## §1 public API／DbCの契約

| API | 完全signature | DbC | 主U |
|---|---|---|---|
| `canonicalizeRegistryDeclaration` | `(raw: unknown, policy: RegistryPolicyV1) => RegistryResultV1<RegistryDeclarationV1>` | kind別ID regex・path/class名主キーの拒否・stable sort・dedup・semantic_digest採番。同義入力は同digest | `U-DRG-001` |
| `validateRegistryGraph` | `(decl: RegistryDeclarationV1) => RegistryResultV1<RegistryGraphV1>` | 重複ID 0（node entity_id と edge_id=(from,to,relation) の双方。L5 §2 unique 制約の pure 層先取り）・両端実在しないedge 0・kindとrelationの整合（relation adjacency表に無い組は`DRG_RELATION_INVALID`でfail-close。`DRG_UNGUARDED_INVOKE`はservice直列chain内の段飛ばし・role不一致・interaction直結に限定） | `U-DRG-002` |
| `computeTraceClosure` | `(graph: RegistryGraphV1) => RegistryResultV1<TraceClosureV1>` | requirement→…→acceptanceのchain orphan集合を決定的算出。orphan>0はok:falseでorphan全列挙。起点requirement自身がstale/retiredの場合もorphanとしてfail-close（静かなgreenを許さない） | `U-DRG-003` |
| `validateParentGraph` | `(graph: RegistryGraphV1) => RegistryResultV1<ParentCoverageV1>` | 全SCR/FLW/INTがparents edgeでuser_taskとbusiness_outcome両原子へ到達し、user_task原子がscenario/context/success_result/decision_rationaleの4原子を保持。いずれの喪失もDRG_PARENT_LOST | `U-DRG-004` |
| `queryTrace` | `(input: TraceQueryInputV1) => RegistryResultV1<TraceResultV1>` | entity_id起点の双方向trace。stale/retiredを含むpathはstale markつきで返し closed判定へ算入しない。mark集約はsticky-OR（fan-in合流でstale経由経路が1本でもあればtainted=true、クリーン経路による打ち消しをしない） | `U-DRG-005` |
| `buildRegistryCommit` | `(input: RegistryCommitInputV1) => RegistryResultV1<RegistryCommitBundleV1>` | append順 node->edge->version->head 固定、write_set/operation digest採番 | `U-DRG-006` |
| `commitRegistry` | `(bundle: RegistryCommitBundleV1, store: RegistryStoreV1) => Promise<RegistryResultV1<RegistryCommitReceiptV1>>` | validator green + 期待head CASでのみatomic commit。二重operation・digest改変・CAS不一致は増分0 | `U-DRG-006` |
| `markStaleLineage` | `(graph: RegistryGraphV1, trigger: StaleTriggerV1) => RegistryResultV1<StaleLineageV1>` | 上流digest差のentityと依存edgeを同一lineageでstale化。同一入力再送は決定的同値 | `U-DRG-007` |

kind と relation の adjacency（validateRegistryGraph の正本表。service は `service_role` を持つ）:
`decomposes_to: requirement→screen|flow`、`presents: screen→interaction`、
`guarded_by: interaction→service[permission]`、
`invokes: service[permission]→service[command]` と `service[command]→service[api]` の直列 2 段、
`emits: service[api]→domain_object`、`measures: domain_object|interaction→analytics_event`、
`accepted_by: analytics_event|domain_object|interaction→acceptance`、
`binds: component|design_token|content→screen|interaction`、
`parents: screen|flow|interaction→requirement[user_task|business_outcome]` および
requirement 原子間（user_task→scenario|context|success_result|decision_rationale）。
interaction から permission を経ずに command/api へ到達する経路は `DRG_UNGUARDED_INVOKE` で
fail-close する（HR-FR-DHR-003 の直列 chain 保証）。

## §2 schemaとstore

```ts
interface RegistryNodeV1 { entity_id: string; kind: RegistryEntityKindV1;
  atom_role: RegistryAtomRoleV1 | null; service_role: RegistryServiceRoleV1 | null; revision: number;
  authority: RegistryAuthorityV1; semantic_digest: string; source_pointer: string }
interface RegistryEdgeV1 { edge_id: string; from_entity_id: string; to_entity_id: string;
  relation: RegistryRelationV1; revision: number; authority: RegistryAuthorityV1; semantic_digest: string }
interface RegistryVersionV1 { version_id: string; entity_id: string; revision: number;
  semantic_digest: string; supersedes_revision: number | null }
interface RegistryCommitBundleV1 { operation_id: string; operation_digest: string;
  expected_registry_head: string; nodes: RegistryNodeV1[]; edges: RegistryEdgeV1[];
  versions: RegistryVersionV1[]; append_order: ["node", "edge", "version", "head"];
  write_set_digest: string }
interface RegistryCommitReceiptV1 { operation_id: string; operation_digest: string;
  before_registry_head: string; after_registry_head: string; inserted_node_count: number;
  inserted_edge_count: number; status: "committed" }
interface RegistryStoreV1 { registry_write_authority: "design_registry_store";
  commitRegistry(bundle: RegistryCommitBundleV1): Promise<RegistryResultV1<RegistryCommitReceiptV1>> }
```

永続 table は L5 §2（`design_registry_nodes` / `design_registry_edges` /
`design_registry_versions` / `design_registry_heads`）。requirement/acceptance ノードの ID は
family 別 regex（HIL family = `src/requirements/requirement-ir-shadow.ts` の既存規約を参照、
VDH/DHR family = L5 §2 で新設する regex を正本とする）で検査し、screen ノードは
`screens`/`screen_trace` を正本供給源として intake する（台帳の複製新設の禁止）。

## §3 完了境界

U-DRG-001〜007 の typed failure・mutation 反例（ID regex 逸脱、path 主キー、重複 ID、片端欠落 edge、
adjacency 外 relation、chain 1 edge 欠落、parents 喪失、digest 改変、CAS 競合、stale 伝播）と、
IT-DRG-001〜003 が green になるまで draft とする。実装スライスは
純関数群（canonicalize・validate・closure・parent・query）→ 取引系（build・commit・stale 遷移）→
永続化（SQLite store + 共有 contract）→ CLI/lint 表面 の順で #175 と同じ規律を踏襲する。

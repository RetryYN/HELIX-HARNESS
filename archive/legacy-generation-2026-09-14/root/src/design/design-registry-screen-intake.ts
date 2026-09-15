/**
 * Design Registry slice6 — SCR intake（PLAN-L7-529、Issue #177）。
 *
 * L5 §1「screen ノードは `screens`/`screen_trace` を正本供給源として吸収し、別の screen 台帳を
 * 新設しない」の着地。既存台帳を read-only で読み、registry の screen ノードへ決定的に写す。
 *
 * 要求 family の境界（PLAN-L7-537 で更新）:
 * registry 固有の requirement ID は `HIL-(BR|FR|NFR)-*` / `VDH-FR-*` / `HR-FR-DHR-*`
 * （`design-registry.ts` の REQUIREMENT_ID_PATTERNS が正本）。一方 `screen_trace` の実データは
 * `BR-01` / `FR-L1-01` / `UX-02` という L1 family を持つ。L3 の D-1（PO 承認 2026-08-10）に従い、
 * これらは**再採番せず** registry の requirement family として認識する。
 *
 * ただし採用条件は family 一致ではなく **L1 catalog への実在 + requirement_kind の exact match**
 * とする（`requirement-catalog.ts` が供給する catalog を明示注入で受け取る）。regex を広げるだけだと
 * L1 に存在しない `BR-99` が有効な edge 端点になり trace を捏造できるためである。
 * catalog 不在は `requirement_not_in_catalog`、kind 不一致は `requirement_kind_mismatch` として
 * edge を作らず全件列挙し `trace_intake_complete=false` を宣言する。
 * 未完了 intake を「静かな green」として流さないための gate が `assertScreenIntakeComplete`。
 *
 * 供給欠落（空 catalog / provenance 欠落）は unmapped ではなく `DRG_STALE_INPUT` で intake ごと
 * 失敗させる。実在不在と同じ green へ潰すと catalog を空にするだけで fail-close を装えるため。
 */
import { createHash } from "node:crypto";
import type { HarnessDb } from "../state-db/index";
import {
  computeRegistryEdgeSemanticDigest,
  computeRegistryNodeSemanticDigest,
  isRegistryNativeRequirementId,
  type RegistryEdgeV1,
  type RegistryFailureCodeV1,
  type RegistryFailureV1,
  type RegistryNodeV1,
  type RegistryResultV1,
} from "./design-registry";
import {
  buildRequirementCatalog,
  loadRequirementCatalogSources,
  type RequirementCatalogV1,
} from "./requirement-catalog";

export interface ScreenLedgerRowV1 {
  screen_id: string;
  name: string;
  l1_ref: string;
  status: string;
}

export interface ScreenTraceRowV1 {
  screen_trace_id: string;
  screen_id: string;
  requirement_id: string;
  requirement_kind: string;
  relation: string;
  source: string;
}

export interface ScreenIntakeInputV1 {
  screens: readonly ScreenLedgerRowV1[];
  traces: readonly ScreenTraceRowV1[];
  /**
   * L1 要求正本から抽出した versioned catalog（HR-FR-DHR-008）。**明示注入**であり、
   * この module は file I/O も Markdown 解釈も持たない。catalog は
   * `src/design/requirement-catalog.ts` の `buildRequirementCatalog` が供給する。
   */
  catalog: RequirementCatalogV1;
}

export type UnmappedRequirementReasonV1 =
  /**
   * requirement_id が registry の登録 family にも L1 catalog にも無い。
   * regex を広げる実装だと `BR-99` のような架空 ID が有効な edge 端点になり trace を
   * 捏造できるため、採用条件は family 一致ではなく **catalog への実在** とする。
   */
  | "requirement_not_in_catalog"
  /**
   * catalog には実在するが `screen_trace.requirement_kind` が catalog の kind と一致しない
   * （kind spoofing）。実在確認だけでは通ってしまうため独立した reason にする。
   */
  | "requirement_kind_mismatch"
  /** screen_trace の relation が registry の relation enum へ写せない。 */
  | "relation_unmapped";

export interface UnmappedRequirementV1 {
  screen_id: string;
  requirement_id: string;
  requirement_kind: string;
  reason: UnmappedRequirementReasonV1;
}

export interface ScreenIntakeV1 {
  nodes: RegistryNodeV1[];
  trace_edges: RegistryEdgeV1[];
  unmapped_requirements: UnmappedRequirementV1[];
  /** unmapped が 0 件のときだけ true。false の intake を完了として扱ってはならない。 */
  trace_intake_complete: boolean;
  intake_digest: string;
}

/** screen_trace が registry relation へ写せる唯一の値（現行台帳の exact set）。 */
const SUPPORTED_TRACE_RELATION = "trace";
const SCREEN_ENTITY_ID = /^SCR-[a-z0-9][a-z0-9-]*$/;

function sha256(text: string): string {
  return `sha256:${createHash("sha256").update(text, "utf8").digest("hex")}`;
}

function fail(code: RegistryFailureCodeV1, evidence: string): RegistryFailureV1 {
  return { code, evidence_digest: sha256(evidence) };
}

function failures<T>(items: readonly RegistryFailureV1[]): RegistryResultV1<T> {
  return { ok: false, failures: items };
}

/** 台帳行の必須文字列列。欠落・型違いは silent な空文字ではなく throw で顕在化させる。 */
function isNonEmpty(value: string): boolean {
  return value.trim().length > 0;
}

function requireText(row: Record<string, unknown>, column: string, where: string): string {
  const value = row[column];
  if (typeof value !== "string") {
    throw new Error(`screen intake: ${where}.${column} must be text (got ${typeof value})`);
  }
  return value;
}

/**
 * 台帳の `screen_id`（`PM-01`）を registry の screen entity id（`SCR-pm-01`）へ決定的に採番する
 * （L5 §2）。正準形に写せない ID は null を返し、呼び出し側が fail-close する。
 */
export function canonicalizeScreenEntityId(screenId: string): string | null {
  const candidate = `SCR-${screenId.trim().toLowerCase()}`;
  return SCREEN_ENTITY_ID.test(candidate) ? candidate : null;
}

/** U-DRG-012: 既存台帳から screen ノードと写像可能な trace edge を決定的に intake する。 */
export function buildScreenIntake(input: ScreenIntakeInputV1): RegistryResultV1<ScreenIntakeV1> {
  const found: RegistryFailureV1[] = [];
  if (input.screens.length === 0) {
    return failures([fail("DRG_STALE_INPUT", "screen-intake:empty-ledger")]);
  }
  // 空 catalog は「実在しないので unmapped」に見えるが、実体は供給側の欠落である。
  // 両者を同じ green（ok:true で全件 unmapped）に潰すと、catalog を空にするだけで
  // fail-close を装えてしまうため、供給欠落そのものを失敗として扱う。
  if (input.catalog.entries.length === 0) {
    return failures([fail("DRG_STALE_INPUT", "screen-intake:empty-catalog")]);
  }
  // provenance が無い catalog を受け取ると intake_digest への束縛が無意味になる。
  if (!isNonEmpty(input.catalog.catalog_version) || !isNonEmpty(input.catalog.source_digest)) {
    return failures([fail("DRG_STALE_INPUT", "screen-intake:catalog-provenance-missing")]);
  }
  const catalogEntryById = new Map(
    input.catalog.entries.map((entry) => [entry.requirement_id, entry]),
  );

  const entityIdByScreenId = new Map<string, string>();
  const nodes: RegistryNodeV1[] = [];
  // 重複検出は **正準化後の entity_id** で行う。生の screen_id をキーにすると
  // `PM-01` と `pm-01` が別 screen として通過し、同一 `SCR-pm-01` を持つノードが 2 件できる
  // （採番が大文字小文字を畳む以上、衝突判定も畳んだ後の値で行わなければ整合しない）。
  const seenEntityIds = new Set<string>();
  for (const row of input.screens) {
    const entityId = canonicalizeScreenEntityId(row.screen_id);
    if (entityId === null) {
      found.push(fail("DRG_ID_INVALID", `screen-intake-id:${row.screen_id}`));
      continue;
    }
    if (seenEntityIds.has(entityId)) {
      found.push(fail("DRG_DUPLICATE_ID", `screen-intake-duplicate:${row.screen_id}:${entityId}`));
      continue;
    }
    seenEntityIds.add(entityId);
    entityIdByScreenId.set(row.screen_id, entityId);
    // authority=shadow: 宣言取り込み時点では未検証。canonical への昇格は validator green を
    // 経た commit 側の判断であり、intake が勝手に canonical を名乗らない（L5 §3）。
    const base = {
      entity_id: entityId,
      kind: "screen" as const,
      atom_role: null,
      service_role: null,
      revision: 1,
      authority: "shadow" as const,
      // 元 ID は source_pointer に保持する（台帳の複製新設をしないための復元経路、L5 §2）。
      source_pointer: `screens:${row.screen_id}`,
    };
    nodes.push({ ...base, semantic_digest: computeRegistryNodeSemanticDigest(base) });
  }

  const trace_edges: RegistryEdgeV1[] = [];
  const unmapped_requirements: UnmappedRequirementV1[] = [];
  const seenEdgeIds = new Set<string>();
  const adoptedRequirementIds = new Set<string>();
  const requirementNodes: RegistryNodeV1[] = [];
  for (const trace of input.traces) {
    const entityId = entityIdByScreenId.get(trace.screen_id);
    if (entityId === undefined) {
      // 台帳に無い screen を指す trace は片端欠落。silent drop せず fail-close する。
      found.push(fail("DRG_EDGE_ORPHAN", `screen-intake-trace:${trace.screen_trace_id}`));
      continue;
    }
    if (trace.relation !== SUPPORTED_TRACE_RELATION) {
      unmapped_requirements.push({
        screen_id: trace.screen_id,
        requirement_id: trace.requirement_id,
        requirement_kind: trace.requirement_kind,
        reason: "relation_unmapped",
      });
      continue;
    }
    // 既存 registry family（HIL / VDH / HR-FR-DHR）は catalog を経由せず従来どおり通す
    // （後方互換）。**grammar 側（isRegistryRequirementId）ではなく native 判定を使う**:
    // grammar は L1 family を含むため、そちらで bypass すると catalog gate が無効化される。
    if (!isRegistryNativeRequirementId(trace.requirement_id)) {
      const catalogKind = catalogEntryById.get(trace.requirement_id)?.requirement_kind;
      if (catalogKind === undefined) {
        // registry の ID 空間に requirement を捏造しない。全件列挙して判断を上へ返す。
        unmapped_requirements.push({
          screen_id: trace.screen_id,
          requirement_id: trace.requirement_id,
          requirement_kind: trace.requirement_kind,
          reason: "requirement_not_in_catalog",
        });
        continue;
      }
      if (catalogKind !== trace.requirement_kind) {
        // 実在 ID を借りて別 kind を名乗る経路。存在確認だけでは通ってしまう。
        unmapped_requirements.push({
          screen_id: trace.screen_id,
          requirement_id: trace.requirement_id,
          requirement_kind: trace.requirement_kind,
          reason: "requirement_kind_mismatch",
        });
        continue;
      }
    }
    const base = {
      from_entity_id: trace.requirement_id,
      to_entity_id: entityId,
      relation: "decomposes_to" as const,
      revision: 1,
      authority: "shadow" as const,
    };
    const edgeId = `${base.relation}:${base.from_entity_id}->${base.to_entity_id}`;
    // 同一 (requirement, screen) 対が複数 trace 行にあると edge_id が重複する
    // （別 doc からの二重登録など）。registry 側は edge_id PK / (from,to,relation) unique
    // なので、ここで fail-close しないと「validator へ通す運用が徹底されている限り安全」という
    // 暗黙の前提に寄りかかることになる。silent に重複配列を返さない。
    if (seenEdgeIds.has(edgeId)) {
      found.push(fail("DRG_DUPLICATE_ID", `screen-intake-edge:${trace.screen_trace_id}:${edgeId}`));
      continue;
    }
    seenEdgeIds.add(edgeId);
    trace_edges.push({
      ...base,
      edge_id: edgeId,
      semantic_digest: computeRegistryEdgeSemanticDigest(base),
    });
    // HR-FR-DHR-011: edge の requirement 端点を graph に実在させる。投入は **実際に edge 化した
    // ID だけ**に限る（catalog 全件を node 化すると、どの screen からも参照されていない
    // requirement が graph へ流れ込む）。
    if (!adoptedRequirementIds.has(trace.requirement_id)) {
      adoptedRequirementIds.add(trace.requirement_id);
      const catalogEntry = catalogEntryById.get(trace.requirement_id);
      const requirementBase = {
        entity_id: trace.requirement_id,
        kind: "requirement" as const,
        atom_role: null,
        service_role: null,
        revision: 1,
        authority: "shadow" as const,
        // 出所は catalog の source_pointer をそのまま持つ（L1 定義行への復元経路）。
        // registry 固有 family は catalog を経由しないため台帳側の出所を指す。
        source_pointer: catalogEntry?.source_pointer ?? `screen_trace:${trace.screen_trace_id}`,
      };
      requirementNodes.push({
        ...requirementBase,
        semantic_digest: computeRegistryNodeSemanticDigest(requirementBase),
      });
    }
  }

  if (found.length > 0) return failures(found);

  nodes.push(...requirementNodes);
  nodes.sort((a, b) => a.entity_id.localeCompare(b.entity_id));
  trace_edges.sort((a, b) => a.edge_id.localeCompare(b.edge_id));
  unmapped_requirements.sort(
    (a, b) =>
      a.screen_id.localeCompare(b.screen_id) || a.requirement_id.localeCompare(b.requirement_id),
  );
  // catalog の provenance を intake_digest へ束縛する（HR-FR-DHR-009 (c)）。
  // 同じ台帳でも catalog が入れ替われば digest が変わり、stale catalog による green を検知できる。
  const intake_digest = sha256(
    JSON.stringify({
      catalog_source_digest: input.catalog.source_digest,
      catalog_version: input.catalog.catalog_version,
      edges: trace_edges.map((edge) => edge.semantic_digest),
      nodes: nodes.map((node) => node.semantic_digest),
      unmapped: unmapped_requirements,
    }),
  );
  return {
    ok: true,
    value: {
      nodes,
      trace_edges,
      unmapped_requirements,
      trace_intake_complete: unmapped_requirements.length === 0,
      intake_digest,
    },
  };
}

/**
 * U-DRG-012: 未完了 intake を完了として扱わせないための consumer 用 gate。
 * unmapped を全件 typed failure として返す（先頭 1 件で打ち切らない）。
 */
export function assertScreenIntakeComplete(
  intake: ScreenIntakeV1,
): RegistryResultV1<ScreenIntakeV1> {
  // 冗長な二重条件は意図的: buildScreenIntake は両者の一致を保証するが、
  // 将来 intake を組み立てる別経路が生まれても「片方だけ green」を通さないための防御。
  if (intake.trace_intake_complete && intake.unmapped_requirements.length === 0) {
    return { ok: true, value: intake };
  }
  return failures(
    intake.unmapped_requirements.map((entry) =>
      fail("DRG_ID_INVALID", `screen-intake-unmapped:${entry.reason}:${entry.requirement_id}`),
    ),
  );
}

/**
 * 既存台帳（`screens` / `screen_trace`）だけを source とする read-only reader。
 * registry 側 table へは一切書かない（複製台帳の新設禁止）。
 */
export function loadScreenIntakeInputs(
  db: HarnessDb,
  repoRoot: string = process.cwd(),
): ScreenIntakeInputV1 {
  // catalog も既存正本（L1 Markdown）だけを source とする read-only 読み取り。
  // 失敗を空 catalog へ握り潰すと「全件不存在」に化けるため throw で顕在化させる。
  const catalogResult = buildRequirementCatalog(loadRequirementCatalogSources(repoRoot));
  if (!catalogResult.ok) {
    throw new Error(
      `screen intake: requirement catalog unavailable (${catalogResult.failures
        .map((failure) => failure.code)
        .join(", ")})`,
    );
  }
  // 列名・型の乖離を型キャストで黙らせない。台帳 schema が変わったら読み取り時点で気づく。
  const screens = (
    db
      .prepare("SELECT screen_id, name, l1_ref, status FROM screens ORDER BY screen_id")
      .all() as unknown as Record<string, unknown>[]
  ).map((row, index) => ({
    screen_id: requireText(row, "screen_id", `screens[${index}]`),
    name: requireText(row, "name", `screens[${index}]`),
    l1_ref: requireText(row, "l1_ref", `screens[${index}]`),
    status: requireText(row, "status", `screens[${index}]`),
  }));
  const traces = (
    db
      .prepare(
        "SELECT screen_trace_id, screen_id, requirement_id, requirement_kind, relation, source FROM screen_trace ORDER BY screen_trace_id",
      )
      .all() as unknown as Record<string, unknown>[]
  ).map((row, index) => ({
    screen_trace_id: requireText(row, "screen_trace_id", `screen_trace[${index}]`),
    screen_id: requireText(row, "screen_id", `screen_trace[${index}]`),
    requirement_id: requireText(row, "requirement_id", `screen_trace[${index}]`),
    requirement_kind: requireText(row, "requirement_kind", `screen_trace[${index}]`),
    relation: requireText(row, "relation", `screen_trace[${index}]`),
    source: requireText(row, "source", `screen_trace[${index}]`),
  }));
  return { catalog: catalogResult.value, screens, traces };
}

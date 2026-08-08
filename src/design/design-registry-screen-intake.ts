/**
 * Design Registry slice6 — SCR intake（PLAN-L7-529、Issue #177）。
 *
 * L5 §1「screen ノードは `screens`/`screen_trace` を正本供給源として吸収し、別の screen 台帳を
 * 新設しない」の着地。既存台帳を read-only で読み、registry の screen ノードへ決定的に写す。
 *
 * 要求 family の境界（本 slice の重要な fail-close）:
 * registry の requirement ID は `HIL-(BR|FR|NFR)-*` / `VDH-FR-*` / `HR-FR-DHR-*` に限られる
 * （`design-registry.ts` の REQUIREMENT_ID_PATTERNS が正本）。一方 `screen_trace` の実データは
 * `BR-01` / `FR-L1-01` / `UX-02` といった別 family を持つ。これらへ edge を張るには
 * requirement ノードを registry の ID 空間に**捏造**するしかないため、本 module は edge を作らず
 * `unmapped_requirements` へ全件列挙し `trace_intake_complete=false` を宣言する。
 * 未完了 intake を「静かな green」として流さないための gate が `assertScreenIntakeComplete`。
 * family 対応付け（BR/FR/UX を registry ID 空間へどう写すか）は本 slice の scope 外であり、
 * 要求側 authority の判断を要する。
 */
import { createHash } from "node:crypto";
import type { HarnessDb } from "../state-db/index";
import {
  computeRegistryEdgeSemanticDigest,
  computeRegistryNodeSemanticDigest,
  isRegistryRequirementId,
  type RegistryEdgeV1,
  type RegistryFailureCodeV1,
  type RegistryFailureV1,
  type RegistryNodeV1,
  type RegistryResultV1,
} from "./design-registry";

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
}

export type UnmappedRequirementReasonV1 =
  /** requirement_id が registry の登録 family（HIL / VDH / HR-FR-DHR）に無い。 */
  | "requirement_family_unregistered"
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
    if (!isRegistryRequirementId(trace.requirement_id)) {
      // registry の ID 空間に requirement を捏造しない。全件列挙して判断を上へ返す。
      unmapped_requirements.push({
        screen_id: trace.screen_id,
        requirement_id: trace.requirement_id,
        requirement_kind: trace.requirement_kind,
        reason: "requirement_family_unregistered",
      });
      continue;
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
  }

  if (found.length > 0) return failures(found);

  nodes.sort((a, b) => a.entity_id.localeCompare(b.entity_id));
  trace_edges.sort((a, b) => a.edge_id.localeCompare(b.edge_id));
  unmapped_requirements.sort(
    (a, b) =>
      a.screen_id.localeCompare(b.screen_id) || a.requirement_id.localeCompare(b.requirement_id),
  );
  const intake_digest = sha256(
    JSON.stringify({
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
export function loadScreenIntakeInputs(db: HarnessDb): ScreenIntakeInputV1 {
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
  return { screens, traces };
}

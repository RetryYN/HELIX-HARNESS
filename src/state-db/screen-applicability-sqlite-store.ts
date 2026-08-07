/**
 * SqliteScreenApplicabilityStore（Issue #175 / PLAN-L7-514、U-SAPDB-001）。
 *
 * slice4 の in-memory reference store（src/design/screen-applicability-store.ts）と同一の
 * ScreenApplicabilityStoreV1 意味契約を harness.db（SQLite）上の Node transactional boundary
 * として実装する（ADR-010: Node が唯一の transaction writer）。
 *
 * 実装方針: 検証ロジックは in-memory reference store へ委譲する（DB から seed を hydrate して
 * 同一検証を通し、意味判定の二重実装ドリフトを防ぐ）。検証成功時のみ単一 SQLite transaction で
 * stage completion / stage projection / gate receipt / terminal receipt を append 順どおり書き、
 * heads を CAS 前進させる。append fault 時は rollback して全行増分 0。
 * gate row への write authority は本 store の commitStageClosureAndGate 成功経路のみ。
 */
import { createHash } from "node:crypto";
import type {
  BackpropReceiptV1,
  NoUiReceiptV1,
  PlanScreenRouteReceiptV1,
  PrototypeAgreementV1,
  ScreenResultV1,
} from "../design/screen-applicability";
import type {
  CurrentAgreementAuthorityV1,
  CurrentBackpropAuthorityV1,
  NoUiSkipAuthorityV1,
  ScreenApplicabilityStoreV1,
  ScreenStageClosureCommitV1,
  ScreenStageReceiptV1,
  ScreenStoreSeedV1,
  UiCapabilityCompletionV1,
} from "../design/screen-applicability-store";
import { createInMemoryScreenApplicabilityStore } from "../design/screen-applicability-store";
import { createIndexSql, createTableSql, HARNESS_DB_INDEXES } from "../schema/harness-db";
import { HARNESS_DB_SCREEN_TABLES } from "../schema/harness-db-tables-screen";
import type { HarnessDb } from "./index";

const SCREEN_TABLE_NAMES = new Set(HARNESS_DB_SCREEN_TABLES.map((t) => t.name));

/**
 * screen applicability 系 table / index を作成する（test / setup 用）。
 * DDL は schema registry（HARNESS_DB_SCREEN_TABLES / HARNESS_DB_INDEXES）から生成し、
 * 単一正本を維持する（手書き DDL の二重定義を持たない）。
 */
export function ensureScreenApplicabilityTables(db: HarnessDb): void {
  for (const table of HARNESS_DB_SCREEN_TABLES) db.exec(createTableSql(table));
  for (const index of HARNESS_DB_INDEXES) {
    if (SCREEN_TABLE_NAMES.has(index.table)) db.exec(createIndexSql(index));
  }
}

/** seed（受領済み plan route / skip / authority 群と heads）を DB へ書く。test / 前段 lane 用。 */
export function seedSqliteScreenStore(db: HarnessDb, seedData: ScreenStoreSeedV1): void {
  db.prepare(
    "INSERT OR REPLACE INTO screen_stage_heads (head_id, stage_head, gate_head, updated_at) VALUES ('current', ?, ?, '')",
  ).run(seedData.stage_head, seedData.gate_head);
  for (const r of seedData.plan_route_receipts) {
    db.prepare(
      "INSERT OR REPLACE INTO screen_plan_route_receipts (plan_route_receipt_id, operation_id, snapshot_id, receipt_digest, payload) VALUES (?, ?, ?, ?, ?)",
    ).run(
      r.plan_route_receipt_id,
      r.operation_id,
      r.snapshot_id,
      r.receipt_digest,
      JSON.stringify(r),
    );
  }
  for (const r of seedData.skip_receipts) {
    db.prepare(
      "INSERT OR REPLACE INTO screen_no_ui_receipts (screen_no_ui_receipt_id, decision_id, receipt_digest, expires_at, payload) VALUES (?, ?, ?, ?, ?)",
    ).run(r.receipt_id, r.decision_id, r.receipt_digest, r.expires_at, JSON.stringify(r));
  }
  for (const r of seedData.skip_authorities) {
    db.prepare(
      "INSERT OR REPLACE INTO screen_no_ui_skip_authorities (authority_receipt_id, skip_receipt_id, current_authority_head, payload) VALUES (?, ?, ?, ?)",
    ).run(r.authority_receipt_id, r.skip_receipt_id, r.current_authority_head, JSON.stringify(r));
  }
  for (const r of seedData.agreement_authorities) {
    db.prepare(
      "INSERT OR REPLACE INTO screen_agreement_authorities (authority_receipt_id, agreement_id, current_authority_head, payload) VALUES (?, ?, ?, ?)",
    ).run(
      r.authority_receipt_id,
      r.receipt.agreement_id,
      r.current_authority_head,
      JSON.stringify(r),
    );
  }
  for (const r of seedData.backprop_authorities) {
    db.prepare(
      "INSERT OR REPLACE INTO screen_backprop_authorities (authority_receipt_id, backprop_receipt_id, current_authority_head, payload) VALUES (?, ?, ?, ?)",
    ).run(
      r.authority_receipt_id,
      r.receipt.receipt_id,
      r.current_authority_head,
      JSON.stringify(r),
    );
  }
}

function failWith(
  code: "HIL_SCREEN_GATE_EVIDENCE_MISSING",
  evidence: string,
): ScreenResultV1<never> {
  const digest = createHash("sha256").update(evidence, "utf8").digest("hex");
  return { ok: false, failures: [{ code, evidence_digest: `sha256:${digest}` }] };
}

interface SqliteStoreOptions {
  /** test 専用: 指定 table への INSERT 直前に故意に fault を起こし rollback を検証する。 */
  injectAppendFault?: string;
  /** test 専用: BEGIN IMMEDIATE を故意に失敗させ、typed failure への正規化を検証する。 */
  injectBeginFault?: boolean;
  /** test 専用: heads UPDATE 直前に競合書込を注入し、lock 内 CAS の拒否を検証する。 */
  onBeforeHeadUpdate?: () => void;
}

function loadSeed(db: HarnessDb): ScreenStoreSeedV1 {
  const heads = db
    .prepare("SELECT stage_head, gate_head FROM screen_stage_heads WHERE head_id = 'current'")
    .get() as { stage_head?: string; gate_head?: string } | undefined;
  const payloads = (table: string): unknown[] =>
    db
      .prepare(`SELECT payload FROM ${table}`)
      .all()
      .map((row) => JSON.parse(String(row.payload)));
  return {
    stage_head: heads?.stage_head ?? "",
    gate_head: heads?.gate_head ?? "",
    plan_route_receipts: payloads("screen_plan_route_receipts") as PlanScreenRouteReceiptV1[],
    skip_receipts: payloads("screen_no_ui_receipts") as NoUiReceiptV1[],
    skip_authorities: payloads("screen_no_ui_skip_authorities") as NoUiSkipAuthorityV1[],
    agreement_authorities: payloads(
      "screen_agreement_authorities",
    ) as CurrentAgreementAuthorityV1[],
    backprop_authorities: payloads("screen_backprop_authorities") as CurrentBackpropAuthorityV1[],
  };
}

class SqliteScreenApplicabilityStore implements ScreenApplicabilityStoreV1 {
  readonly gate_write_authority = "screen_stage_closure_store" as const;
  private readonly db: HarnessDb;
  private readonly trustedNow: string;
  private readonly options: SqliteStoreOptions;

  constructor(db: HarnessDb, trustedNow: string, options: SqliteStoreOptions = {}) {
    this.db = db;
    this.trustedNow = trustedNow;
    this.options = options;
  }

  private reference(trustedNow: string = this.trustedNow) {
    return createInMemoryScreenApplicabilityStore(loadSeed(this.db), trustedNow);
  }

  stageHead(): string {
    return loadSeed(this.db).stage_head;
  }

  gateHead(): string {
    return loadSeed(this.db).gate_head;
  }

  committedGateReceiptCount(): number {
    const row = this.db.prepare("SELECT COUNT(*) AS n FROM screen_gate_receipts").get() as {
      n: number;
    };
    return Number(row.n);
  }

  readPlanRouteReceipt(
    receiptId: string,
    expectedStageHead: string,
  ): Promise<ScreenResultV1<PlanScreenRouteReceiptV1>> {
    return this.reference().readPlanRouteReceipt(receiptId, expectedStageHead);
  }

  readSkipReceipt(receiptId: string, trustedNow: string): Promise<ScreenResultV1<NoUiReceiptV1>> {
    return this.reference(trustedNow).readSkipReceipt(receiptId, trustedNow);
  }

  readSkipAuthority(
    authorityReceiptId: string,
    expectedAuthorityHead: string,
    trustedNow: string,
  ): Promise<ScreenResultV1<NoUiSkipAuthorityV1>> {
    return this.reference(trustedNow).readSkipAuthority(
      authorityReceiptId,
      expectedAuthorityHead,
      trustedNow,
    );
  }

  readAgreementAuthority(query: {
    authority_receipt_id: string;
    expected_receipt_id: string;
    expected_receipt_digest: string;
    expected_authority_head: string;
    trusted_now: string;
  }): Promise<ScreenResultV1<CurrentAgreementAuthorityV1>> {
    return this.reference(query.trusted_now).readAgreementAuthority(query);
  }

  readBackpropAuthority(query: {
    authority_receipt_id: string;
    expected_receipt_id: string;
    expected_receipt_digest: string;
    expected_authority_head: string;
    trusted_now: string;
  }): Promise<ScreenResultV1<CurrentBackpropAuthorityV1>> {
    return this.reference(query.trusted_now).readBackpropAuthority(query);
  }

  validateAgreementBackpropPair(
    agreement: PrototypeAgreementV1,
    backprop: BackpropReceiptV1,
    completion: UiCapabilityCompletionV1,
  ): Promise<ScreenResultV1<UiCapabilityCompletionV1>> {
    return this.reference().validateAgreementBackpropPair(agreement, backprop, completion);
  }

  async commitStageClosureAndGate(
    bundle: ScreenStageClosureCommitV1,
  ): Promise<ScreenResultV1<ScreenStageReceiptV1>> {
    // 二重 gate 判定は DB を正本とする（reference store の committedOperations は
    // hydrate 毎に空で始まるため、SQLite 経路では duplicate 検出に使えない）。
    const duplicate = this.db
      .prepare("SELECT 1 AS hit FROM screen_terminal_receipts WHERE operation_id = ?")
      .get(bundle.operation_id);
    if (duplicate)
      return failWith("HIL_SCREEN_GATE_EVIDENCE_MISSING", `duplicate_gate:${bundle.operation_id}`);
    // 意味判定は reference store へ委譲する。委譲が有効なのは「hydrate 時点の読み取り状態
    // （heads / receipts / authorities）に対する検証」に限られ、reference 内部の累積状態には
    // 依存しない（依存する検証を将来追加する場合は DB 側で等価な検査を必ず併設する）。
    const verdict = await this.reference().commitStageClosureAndGate(bundle);
    if (!verdict.ok) return verdict;
    const receipt = verdict.value;
    const db = this.db;
    try {
      if (this.options.injectBeginFault) throw new Error("injected begin fault");
      db.exec("BEGIN IMMEDIATE");
    } catch (error) {
      // lock 競合（SQLITE_BUSY 等）も typed failure に正規化し、型契約を破らない。
      return failWith(
        "HIL_SCREEN_GATE_EVIDENCE_MISSING",
        `begin_failed:${bundle.operation_id}:${String(error)}`,
      );
    }
    try {
      const insertCompletion = db.prepare(
        "INSERT INTO screen_stage_completions (stage_completion_id, operation_id, capability_id, completion_kind, payload) VALUES (?, ?, ?, ?, ?)",
      );
      for (const completion of bundle.closure.no_ui_completions) {
        insertCompletion.run(
          `${bundle.operation_id}:no-ui:${completion.capability_id}`,
          bundle.operation_id,
          completion.capability_id,
          "no_ui",
          JSON.stringify(completion),
        );
      }
      for (const completion of bundle.closure.ui_completions) {
        insertCompletion.run(
          `${bundle.operation_id}:ui:${completion.capability_id}`,
          bundle.operation_id,
          completion.capability_id,
          "ui",
          JSON.stringify(completion),
        );
      }
      // stage projection は「snapshot ごとの現在 closure」の projection（1 snapshot = 1 行）で、
      // append-only 監査証跡は gate/terminal receipts 側が operation 毎に保持する。
      // そのためここだけ INSERT OR REPLACE（最新 operation で上書き）とする。
      db.prepare(
        "INSERT OR REPLACE INTO screen_stage_projections (stage_projection_id, operation_id, payload) VALUES (?, ?, ?)",
      ).run(
        bundle.plan_route_receipt.snapshot_id,
        bundle.operation_id,
        JSON.stringify(bundle.closure),
      );
      db.prepare(
        "INSERT INTO screen_gate_receipts (screen_gate_receipt_id, operation_id, verdict, route, payload) VALUES (?, ?, ?, ?, ?)",
      ).run(
        bundle.gate.gate_receipt_id,
        bundle.operation_id,
        bundle.gate.verdict,
        bundle.gate.route,
        JSON.stringify({ ...bundle.gate, commit_receipt_digest: receipt.gate_receipt_digest }),
      );
      if (this.options.injectAppendFault === "screen_terminal_receipts")
        throw new Error("injected append fault: screen_terminal_receipts");
      db.prepare(
        "INSERT INTO screen_terminal_receipts (operation_id, operation_digest, payload) VALUES (?, ?, ?)",
      ).run(bundle.operation_id, bundle.operation_digest, JSON.stringify(receipt));
      // lock 内 CAS: hydrate 時点の before-head を WHERE 条件へ含め、hydrate〜lock の間に他の
      // commit が head を前進させていた場合は影響行数 0 → rollback（lost update を遮断する）。
      this.options.onBeforeHeadUpdate?.();
      const updated = db
        .prepare(
          "UPDATE screen_stage_heads SET stage_head = ?, gate_head = ?, updated_at = ? WHERE head_id = 'current' AND stage_head = ? AND gate_head = ?",
        )
        .run(
          receipt.after_stage_head,
          receipt.after_gate_head,
          this.trustedNow,
          receipt.before_stage_head,
          receipt.before_gate_head,
        );
      if (updated.changes !== 1) throw new Error(`cas_conflict:${bundle.operation_id}`);
      db.exec("COMMIT");
      return { ok: true, value: receipt };
    } catch (error) {
      db.exec("ROLLBACK");
      return failWith(
        "HIL_SCREEN_GATE_EVIDENCE_MISSING",
        `append_fault:${bundle.operation_id}:${String(error)}`,
      );
    }
  }
}

export function createSqliteScreenApplicabilityStore(
  db: HarnessDb,
  trustedNow: string,
  options: SqliteStoreOptions = {},
): SqliteScreenApplicabilityStore {
  return new SqliteScreenApplicabilityStore(db, trustedNow, options);
}

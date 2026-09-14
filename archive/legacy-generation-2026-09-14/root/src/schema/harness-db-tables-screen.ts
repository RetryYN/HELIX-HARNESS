import { col, pk } from "./harness-db-table-builders";
import type { TableDef } from "./harness-db-types";

/**
 * ScreenApplicabilityGate（Issue #175 / PLAN-L7-514）の runtime transaction tables。
 *
 * L5設計 docs/design/helix/L5-detail/screen-applicability-prototype.md §2 と
 * L6 §2/§5 の store 契約を正本とする。doc からの決定的 projection ではなく
 * SqliteScreenApplicabilityStore（唯一の gate write authority）が書く runtime 証跡のため、
 * rebuild の truncate 対象外（IMMUTABLE_RECEIPT_TABLES）とする。
 * FK / partial unique 相当の制約は store 検証（アプリ層）で担保し、DDL は
 * 既存 DSL（単一列 PK + unique index）の範囲で表現する。行本体は canonical JSON payload。
 */
export const HARNESS_DB_SCREEN_TABLES: TableDef[] = [
  {
    name: "screen_plan_route_receipts",
    columns: [
      pk("plan_route_receipt_id"),
      col("operation_id"),
      col("snapshot_id"),
      col("receipt_digest"),
      col("payload"),
    ],
  },
  {
    name: "screen_no_ui_receipts",
    columns: [
      pk("screen_no_ui_receipt_id"),
      col("decision_id"),
      col("receipt_digest"),
      col("expires_at"),
      col("payload"),
    ],
  },
  {
    name: "screen_no_ui_skip_authorities",
    columns: [
      pk("authority_receipt_id"),
      col("skip_receipt_id"),
      col("current_authority_head"),
      col("payload"),
    ],
  },
  {
    name: "screen_agreement_authorities",
    columns: [
      pk("authority_receipt_id"),
      col("agreement_id"),
      col("current_authority_head"),
      col("payload"),
    ],
  },
  {
    name: "screen_backprop_authorities",
    columns: [
      pk("authority_receipt_id"),
      col("backprop_receipt_id"),
      col("current_authority_head"),
      col("payload"),
    ],
  },
  {
    name: "screen_stage_heads",
    columns: [pk("head_id"), col("stage_head"), col("gate_head"), col("updated_at")],
  },
  {
    name: "screen_stage_completions",
    columns: [
      pk("stage_completion_id"),
      col("operation_id"),
      col("capability_id"),
      col("completion_kind"),
      col("payload"),
    ],
  },
  {
    name: "screen_stage_projections",
    columns: [pk("stage_projection_id"), col("operation_id"), col("payload")],
  },
  {
    name: "screen_gate_receipts",
    columns: [
      pk("screen_gate_receipt_id"),
      col("operation_id"),
      col("verdict"),
      col("route"),
      col("payload"),
    ],
  },
  {
    name: "screen_terminal_receipts",
    columns: [pk("operation_id"), col("operation_digest"), col("payload")],
  },
];

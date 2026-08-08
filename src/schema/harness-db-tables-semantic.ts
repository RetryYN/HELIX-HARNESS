import { col, pk } from "./harness-db-table-builders";
import type { TableDef } from "./harness-db-types";

/**
 * semantic contract 層（Issue #230 / PLAN-L7-525）の runtime transaction tables。
 *
 * L6設計 docs/design/helix/L6-function-design/semantic-contract-revalidator.md §3.1 の
 * 永続 schema 4 table を正本とする。doc からの決定的 projection ではなく
 * SqliteSemanticCommitStore（唯一の semantic result write authority）が書く runtime 証跡の
 * ため、rebuild の truncate 対象外（IMMUTABLE_RECEIPT_TABLES）とする。
 * ADR-010 に従い Python 意味コアは本 table 群への write authority を持たない。
 */
export const HARNESS_DB_SEMANTIC_TABLES: TableDef[] = [
  {
    name: "semantic_result_records",
    columns: [
      pk("envelope_digest"),
      col("contract_id"),
      col("contract_version"),
      col("payload_schema_digest"),
      col("source_digest"),
      col("payload_digest"),
      col("sidecar_digest"),
      col("worker_id"),
      col("worker_version"),
      col("payload"),
    ],
  },
  {
    name: "semantic_result_receipts",
    columns: [
      pk("receipt_id"),
      col("operation_id"),
      col("envelope_digest"),
      col("before_semantic_head"),
      col("after_semantic_head"),
      col("committed_at"),
    ],
  },
  {
    name: "semantic_result_heads",
    columns: [pk("head_id"), col("semantic_head"), col("updated_at")],
  },
  {
    name: "semantic_result_operations",
    columns: [
      pk("operation_id"),
      col("operation_digest"),
      col("before_semantic_head"),
      col("after_semantic_head"),
      col("payload"),
    ],
  },
];

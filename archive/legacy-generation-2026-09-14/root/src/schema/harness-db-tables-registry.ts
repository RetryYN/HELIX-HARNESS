import { col, pk } from "./harness-db-table-builders";
import type { TableDef } from "./harness-db-types";

/**
 * Design Registry（Issue #177 / PLAN-L7-518）の runtime transaction tables。
 *
 * L5設計 docs/design/helix/L5-detail/design-registry.md §2 の永続 schema 4 table を正本とする。
 * doc からの決定的 projection ではなく SqliteDesignRegistryStore（唯一の registry write
 * authority）が書く runtime 証跡のため、rebuild の truncate 対象外
 * （IMMUTABLE_RECEIPT_TABLES）とする。(from,to,relation) unique は edge_id 導出
 * （`relation:from->to`）+ PK と unique index で担保し、行本体は canonical JSON payload。
 */
export const HARNESS_DB_REGISTRY_TABLES: TableDef[] = [
  {
    name: "design_registry_nodes",
    columns: [
      pk("entity_id"),
      col("kind"),
      col("atom_role"),
      col("service_role"),
      col("revision"),
      col("authority"),
      col("semantic_digest"),
      col("payload"),
    ],
  },
  {
    name: "design_registry_edges",
    columns: [
      pk("edge_id"),
      col("from_entity_id"),
      col("to_entity_id"),
      col("relation"),
      col("revision"),
      col("authority"),
      col("semantic_digest"),
      col("payload"),
    ],
  },
  {
    name: "design_registry_versions",
    columns: [
      pk("version_id"),
      col("entity_id"),
      col("revision"),
      col("semantic_digest"),
      col("supersedes_revision"),
      col("payload"),
    ],
  },
  {
    name: "design_registry_heads",
    columns: [pk("head_id"), col("registry_head"), col("updated_at")],
  },
  {
    name: "design_registry_operations",
    columns: [
      pk("operation_id"),
      col("operation_digest"),
      col("before_registry_head"),
      col("after_registry_head"),
      col("payload"),
    ],
  },
];

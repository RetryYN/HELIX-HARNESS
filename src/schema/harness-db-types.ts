export type ColumnType = "TEXT" | "INTEGER" | "REAL";

export interface ColumnDef {
  name: string;
  type: ColumnType;
  /** PRIMARY KEY 列 (1 table 1 列、physical-data の PK に準拠)。 */
  primaryKey?: boolean;
}

export interface TableDef {
  name: string;
  columns: ColumnDef[];
}

export interface IndexDef {
  name: string;
  table: string;
  columns: string[];
  unique?: boolean;
}

export type ColumnType = "TEXT" | "INTEGER" | "REAL";

export interface ColumnDef {
  name: string;
  type: ColumnType;
  /** PRIMARY KEY 列 (1 table 1 列、physical-data の PK に準拠)。 */
  primaryKey?: boolean;
  notNull?: boolean;
}

export interface TableDef {
  name: string;
  columns: ColumnDef[];
  /** Registry-owned SQLite CHECK expressions. Values are static source, never user input. */
  checks?: string[];
}

export interface IndexDef {
  name: string;
  table: string;
  columns: string[];
  unique?: boolean;
}

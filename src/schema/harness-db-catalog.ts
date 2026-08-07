import { HARNESS_DB_INDEXES } from "./harness-db-indexes";
import { HARNESS_DB_CORE_TABLES } from "./harness-db-tables-core";
import { HARNESS_DB_DESIGN_TABLES } from "./harness-db-tables-design";
import { HARNESS_DB_EVALUATION_TABLES } from "./harness-db-tables-evaluation";
import { HARNESS_DB_GRAPH_EXPORT_TABLES } from "./harness-db-tables-graph";
import { HARNESS_DB_SCREEN_TABLES } from "./harness-db-tables-screen";

export const HARNESS_DB_TABLES = [
  ...HARNESS_DB_CORE_TABLES,
  ...HARNESS_DB_DESIGN_TABLES,
  ...HARNESS_DB_GRAPH_EXPORT_TABLES,
  ...HARNESS_DB_EVALUATION_TABLES,
  ...HARNESS_DB_SCREEN_TABLES,
];

export { HARNESS_DB_INDEXES };

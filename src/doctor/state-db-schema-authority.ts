import { existsSync } from "node:fs";
import {
  defaultHarnessDbPath,
  type HarnessDb,
  openHarnessDb,
  openHarnessDbReadOnly,
} from "../state-db/index";
import { migrate } from "../state-db/migration";
import { compareSchemaAuthority, readSqliteSchemaObjects } from "../state-db/schema-authority";

export interface StateDbSchemaAuthorityCheckInput {
  repoRoot?: string;
  actualDb?: HarnessDb;
}

export interface StateDbSchemaAuthorityCheckResult {
  ok: boolean;
  messages: string[];
}

/** live state DBをfresh canonical schemaとexact比較するdoctor hard gate。 */
export function checkStateDbSchemaAuthority(
  input: StateDbSchemaAuthorityCheckInput = {},
): StateDbSchemaAuthorityCheckResult {
  const repoRoot = input.repoRoot ?? process.cwd();
  const livePath = defaultHarnessDbPath(repoRoot);
  if (!input.actualDb && !existsSync(livePath)) {
    return {
      ok: true,
      messages: ["state-db-schema-authority - OK (live DB not materialized)"],
    };
  }

  let expectedDb: HarnessDb | undefined;
  let actualDb: HarnessDb | undefined = input.actualDb;
  try {
    expectedDb = openHarnessDb(":memory:", { repoRoot });
    migrate(expectedDb);
    actualDb ??= openHarnessDbReadOnly(livePath, { repoRoot });
    const comparison = compareSchemaAuthority(
      readSqliteSchemaObjects(expectedDb),
      readSqliteSchemaObjects(actualDb),
    );
    const detail = [
      `missing=${comparison.missing.join(",") || "none"}`,
      `extra=${comparison.extra.join(",") || "none"}`,
      `changed=${comparison.changed.join(",") || "none"}`,
    ].join(" ");
    return {
      ok: comparison.ok,
      messages: [
        comparison.ok
          ? `state-db-schema-authority - OK (${detail})`
          : `state-db-schema-authority - violation: ${detail}`,
      ],
    };
  } catch (error) {
    return {
      ok: false,
      messages: [
        `state-db-schema-authority - violation: schema comparison failed (${error instanceof Error ? error.message : String(error)})`,
      ],
    };
  } finally {
    expectedDb?.close();
    if (!input.actualDb) actualDb?.close();
  }
}

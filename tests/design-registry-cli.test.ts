// PLAN-L7-519-design-registry-cli / U-DRG-009（helix registry 読み取り表面）
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { describe, expect, it } from "vitest";
import { validateRegistryGraph } from "../src/design/design-registry";
import {
  createSqliteDesignRegistryStore,
  ensureDesignRegistryTables,
  listDesignRegistryOperations,
  readDesignRegistryStatus,
  seedSqliteDesignRegistryHead,
} from "../src/design/design-registry-sqlite-store";
import { buildRegistryCommit, commitRegistry } from "../src/design/design-registry-transaction";
import { openHarnessDb } from "../src/state-db";
import { buildDeclaration } from "./tools/design-registry-fixture";

const repoRoot = process.cwd();
const cliPath = join(repoRoot, "src", "cli.ts");
const tsxLoaderUrl = pathToFileURL(
  join(repoRoot, "node_modules", "tsx", "dist", "loader.mjs"),
).href;

function runCli(args: string[]) {
  return spawnSync(process.execPath, ["--import", tsxLoaderUrl, cliPath, ...args], {
    cwd: repoRoot,
    encoding: "utf8",
    env: { ...process.env, HELIX_SKIP_UPDATE_CHECK: "1" },
    timeout: 45_000,
    maxBuffer: 16 * 1024 * 1024,
  });
}

function makeDb() {
  const db = openHarnessDb(":memory:");
  ensureDesignRegistryTables(db);
  return db;
}

describe("U-DRG-009 helix registry 読み取り表面", () => {
  it("U-DRG-009: read helperがhead/counts/operations一覧をstore書込内容と一致して返し、CLIはschema_version付きJSONをexit 0で返す", async () => {
    const db = makeDb();
    try {
      seedSqliteDesignRegistryHead(db, "registry-head-genesis");
      const graph = validateRegistryGraph(buildDeclaration());
      if (!graph.ok) throw new Error("fixture graph must validate");
      const built = buildRegistryCommit({
        graph: graph.value,
        operation_id: "op-cli-1",
        expected_registry_head: "registry-head-genesis",
      });
      if (!built.ok) throw new Error("fixture bundle must build");
      const store = createSqliteDesignRegistryStore(db, "2026-08-08T00:00:00Z");
      const committed = await commitRegistry(built.value, store);
      expect(committed.ok).toBe(true);
      if (!committed.ok) return;
      const status = readDesignRegistryStatus(db);
      expect(status.registry_head).toBe(committed.value.after_registry_head);
      expect(status.counts.design_registry_nodes).toBe(built.value.nodes.length);
      expect(status.counts.design_registry_operations).toBe(1);
      const operations = listDesignRegistryOperations(db, 10);
      expect(operations).toHaveLength(1);
      expect(operations[0]?.operation_id).toBe("op-cli-1");
      expect(operations[0]?.before_registry_head).toBe("registry-head-genesis");
      expect(operations[0]?.after_registry_head).toBe(committed.value.after_registry_head);
      // limit<=0 / 非整数は空（fail-safe read）
      expect(listDesignRegistryOperations(db, 0)).toEqual([]);
      expect(listDesignRegistryOperations(db, Number.NaN)).toEqual([]);
    } finally {
      db.close();
    }

    const statusRun = runCli(["registry", "status", "--json"]);
    expect(statusRun.status, statusRun.stderr).toBe(0);
    const statusJson = JSON.parse(statusRun.stdout) as {
      schema_version: string;
      source_command: string;
      counts: Record<string, number>;
    };
    expect(statusJson.schema_version).toBe("registry-cli.v1");
    expect(statusJson.source_command).toBe("helix registry status --json");
    expect(typeof statusJson.counts.design_registry_nodes).toBe("number");

    const opsRun = runCli(["registry", "operations", "--json", "--limit", "5"]);
    expect(opsRun.status, opsRun.stderr).toBe(0);
    const opsJson = JSON.parse(opsRun.stdout) as {
      schema_version: string;
      source_command: string;
      count: number;
      operations: unknown[];
    };
    expect(opsJson.schema_version).toBe("registry-cli.v1");
    expect(opsJson.source_command).toBe("helix registry operations --json");
    expect(opsJson.count).toBe(opsJson.operations.length);
  }, 120_000);

  it("table欠落dbではhelperがthrowする（CLI typed error経路の入口）", () => {
    const db = openHarnessDb(":memory:");
    try {
      expect(() => readDesignRegistryStatus(db)).toThrow();
      expect(() => listDesignRegistryOperations(db, 5)).toThrow();
    } finally {
      db.close();
    }
  });

  it("空DBでは空状態を返す（fail-safe read）", () => {
    const db = makeDb();
    try {
      const status = readDesignRegistryStatus(db);
      expect(status.registry_head).toBe("");
      expect(status.counts.design_registry_nodes).toBe(0);
      expect(listDesignRegistryOperations(db, 10)).toEqual([]);
    } finally {
      db.close();
    }
  });
});

// PLAN-L7-515-screen-applicability-cli / U-SAPCLI-001（helix screen 読み取り表面）
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { describe, expect, it } from "vitest";
import {
  createSqliteScreenApplicabilityStore,
  ensureScreenApplicabilityTables,
  listScreenGateReceipts,
  readScreenStatus,
  seedSqliteScreenStore,
} from "../src/design/screen-applicability-sqlite-store";
import { openHarnessDb } from "../src/state-db";
import { NOW, seed, validCommit } from "./tools/screen-store-contract";

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
  ensureScreenApplicabilityTables(db);
  return db;
}

describe("U-SAPCLI-001 helix screen 読み取り表面", () => {
  it("U-SAPCLI-001: read helperがheads/counts/gate一覧をstore書込内容と一致して返し、CLIはschema_version付きJSONをexit 0で返す", async () => {
    const db = makeDb();
    try {
      seedSqliteScreenStore(db, seed());
      const store = createSqliteScreenApplicabilityStore(db, NOW);
      const committed = await store.commitStageClosureAndGate(validCommit());
      expect(committed.ok).toBe(true);
      const status = readScreenStatus(db);
      expect(status.stage_head).toBe(store.stageHead());
      expect(status.counts.screen_gate_receipts).toBe(1);
      expect(status.counts.screen_stage_completions).toBe(2);
      expect(status.counts.screen_terminal_receipts).toBe(1);
      const gates = listScreenGateReceipts(db, 10);
      expect(gates).toHaveLength(1);
      expect(gates[0].verdict).toBe("passed");
      expect(gates[0].operation_id).toBe("op-stage-closure-1");
      expect(gates[0].route).toBe("prototype_required");
    } finally {
      db.close();
    }

    const statusRun = runCli(["screen", "status", "--json"]);
    expect(statusRun.status).toBe(0);
    const statusJson = JSON.parse(statusRun.stdout) as {
      schema_version: string;
      source_command: string;
      counts: Record<string, number>;
    };
    expect(statusJson.schema_version).toBe("screen-cli.v1");
    expect(statusJson.source_command).toBe("helix screen status --json");
    expect(typeof statusJson.counts.screen_gate_receipts).toBe("number");

    const gatesRun = runCli(["screen", "gates", "--json", "--limit", "5"]);
    expect(gatesRun.status).toBe(0);
    const gatesJson = JSON.parse(gatesRun.stdout) as {
      schema_version: string;
      source_command: string;
      count: number;
      gates: unknown[];
    };
    expect(gatesJson.schema_version).toBe("screen-cli.v1");
    expect(gatesJson.source_command).toBe("helix screen gates --json");
    expect(gatesJson.count).toBe(gatesJson.gates.length);
  }, 120_000);

  it("table欠落dbではhelperがthrowする（CLI typed error経路の入口）", () => {
    const db = openHarnessDb(":memory:");
    try {
      expect(() => readScreenStatus(db)).toThrow();
      expect(() => listScreenGateReceipts(db, 5)).toThrow();
    } finally {
      db.close();
    }
  });

  it("空DBでは空状態を返す（fail-safe read）", () => {
    const db = makeDb();
    try {
      const status = readScreenStatus(db);
      expect(status.stage_head).toBe("");
      expect(status.gate_head).toBe("");
      expect(status.counts.screen_gate_receipts).toBe(0);
      expect(listScreenGateReceipts(db, 10)).toEqual([]);
    } finally {
      db.close();
    }
  });

  it("gate receiptsのlimitとverdict/route列が反映される", async () => {
    const db = makeDb();
    try {
      seedSqliteScreenStore(db, seed());
      const store = createSqliteScreenApplicabilityStore(db, NOW);
      const first = await store.commitStageClosureAndGate(validCommit());
      expect(first.ok).toBe(true);
      const gates = listScreenGateReceipts(db, 0);
      expect(gates).toEqual([]);
    } finally {
      db.close();
    }
  });
});

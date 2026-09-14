// PLAN-L7-534-screen-cli-readonly / U-SAPCLI-002（#175 申し送り「openHarnessDbReadOnly 二段構成」）。
//
// `helix screen status` / `helix screen gates` は「読み取り専用」と説明されているが、
// 実装は openHarnessDb（read-write）で開き ensureScreenApplicabilityTables を呼ぶため、
// **harness.db が無い repository で DB ファイルと screen 系 10 table を新規作成していた**。
//
// 実害は 2 つある:
//   1. 未初期化を「空状態」と見分けられなくなる（読んだだけで初期化済みになる）
//   2. read 経路が共有 DB を read-write で開き schema を変更する（並行 write との競合面が増える）
//
// oracle は合成 db ではなく **実 CLI を temp repository で spawn** して観測する。
// helper 単体では「CLI がファイルを作るか」を見られないためである。
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { afterAll, describe, expect, it } from "vitest";
import { openHarnessDb } from "../src/state-db";

const repoRoot = process.cwd();
const cliPath = join(repoRoot, "src", "cli.ts");
const tsxLoaderUrl = pathToFileURL(
  join(repoRoot, "node_modules", "tsx", "dist", "loader.mjs"),
).href;
const tempRoots: string[] = [];

function makeTempRepo(): string {
  const root = mkdtempSync(join(tmpdir(), "helix-screen-cli-"));
  tempRoots.push(root);
  mkdirSync(join(root, ".helix", "state"), { recursive: true });
  return root;
}

function runCliIn(cwd: string, args: string[]) {
  return spawnSync(process.execPath, ["--import", tsxLoaderUrl, cliPath, ...args], {
    cwd,
    encoding: "utf8",
    env: { ...process.env, HELIX_SKIP_UPDATE_CHECK: "1" },
    timeout: 60_000,
    maxBuffer: 16 * 1024 * 1024,
  });
}

afterAll(() => {
  for (const root of tempRoots) rmSync(root, { force: true, recursive: true });
});

describe("screen 読み取り CLI の read-only 境界 (PLAN-L7-534)", () => {
  it("U-SAPCLI-002: harness.db が無い repository で status/gates は DB を作らず未初期化を報告する", () => {
    // registry 読み取り CLI（PLAN-L7-519）も同一の欠陥を持っていたため同じ helper で直した。
    // 同じ契約なので同じ oracle で観測する。
    for (const command of [
      ["screen", "status", "--json"],
      ["screen", "gates", "--json"],
      ["registry", "status", "--json"],
      ["registry", "operations", "--json"],
    ]) {
      const root = makeTempRepo();
      const dbPath = join(root, ".helix", "harness.db");
      const run = runCliIn(root, command);
      expect(
        existsSync(dbPath),
        `${command.join(" ")} は harness.db を作ってはならない: ${run.stdout}${run.stderr}`,
      ).toBe(false);
      expect(run.status, `${command.join(" ")}: ${run.stderr}`).toBe(0);
      const payload = JSON.parse(run.stdout) as { schema_version: string; initialized: boolean };
      expect(payload.schema_version).toBe(`${command[0]}-cli.v1`);
      // 「未初期化」と「初期化済みで 0 件」を呼び出し側が区別できること。
      expect(payload.initialized).toBe(false);
    }
  });

  it("harness.db はあるが screen/registry table が無い場合も table を作らず未初期化を報告する", () => {
    // 二段構成の中段。DB は存在するが対象 table が無い状態で `CREATE TABLE IF NOT EXISTS` を
    // 撃つと、read しただけで初期化済みへ変わってしまう。
    for (const command of [
      ["screen", "status", "--json"],
      ["registry", "status", "--json"],
    ]) {
      const root = makeTempRepo();
      const dbPath = join(root, ".helix", "harness.db");
      const seeded = openHarnessDb(dbPath, { repoRoot: root });
      seeded.exec("CREATE TABLE IF NOT EXISTS unrelated_table (id TEXT PRIMARY KEY)");
      seeded.close();
      const run = runCliIn(root, command);
      expect(run.status, `${command.join(" ")}: ${run.stderr}`).toBe(0);
      const payload = JSON.parse(run.stdout) as { initialized: boolean };
      expect(payload.initialized, `${command.join(" ")} は未初期化を報告する`).toBe(false);

      // read 経路が table を作っていないこと（sqlite_master を直接確認する）。
      const after = openHarnessDb(dbPath, { repoRoot: root });
      const created = after
        .prepare(
          "SELECT COUNT(*) AS n FROM sqlite_master WHERE type = 'table' AND (name LIKE 'screen_%' OR name LIKE 'design_registry_%')",
        )
        .get() as { n: number };
      after.close();
      expect(Number(created.n), `${command.join(" ")} が table を作った`).toBe(0);
    }
  });

  it("破損した harness.db では typed JSON error + 非 0 exit へ正規化する", () => {
    const root = makeTempRepo();
    const dbPath = join(root, ".helix", "harness.db");
    writeFileSync(dbPath, "this is not a sqlite database\n");
    const run = runCliIn(root, ["screen", "status", "--json"]);
    expect(run.status, `破損 DB は非 0 exit: ${run.stdout}`).not.toBe(0);
    // stderr には node の ExperimentalWarning も混じるため、schema 付き JSON 行だけを取り出す。
    const errorLine = run.stderr
      .split(/\r?\n/)
      .find((line) => line.startsWith('{"schema_version"'));
    expect(errorLine, `typed JSON error 行が無い: ${run.stderr}`).toBeDefined();
    const payload = JSON.parse(errorLine ?? "{}") as { schema_version: string; error: string };
    expect(payload.schema_version).toBe("screen-cli.v1");
    expect(payload.error.length).toBeGreaterThan(0);
    // 破損を「空状態」として飲み込まないこと。
    expect(run.stdout).toBe("");
  });
});

import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { describe, expect, it } from "vitest";

// PLAN-L7-450-state-db-vscode-decoupling

describe("PLAN-L7-450 headless DB composition", () => {
  it("IT-SBOUND-001: fresh childはVS Code runtime無しでtree evidenceまでrebuildする", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-headless-rebuild-"));
    const preloadPath = join(root, "block-vscode.cjs");
    writeFileSync(
      preloadPath,
      [
        'const Module = require("node:module");',
        "const originalLoad = Module._load;",
        "Module._load = function (request, parent, isMain) {",
        '  if (request === "vscode" || request.startsWith("vscode/")) {',
        '    throw new Error("VS Code runtime is unavailable in headless mode");',
        "  }",
        "  return originalLoad.call(this, request, parent, isMain);",
        "};",
      ].join("\n"),
    );
    const compositionUrl = pathToFileURL(resolve("src/composition/db-rebuild-composition.ts")).href;
    const databaseUrl = pathToFileURL(resolve("src/state-db/index.ts")).href;
    const child = [
      `const { rebuildHarnessDb } = await import(${JSON.stringify(compositionUrl)});`,
      `const { openHarnessDb } = await import(${JSON.stringify(databaseUrl)});`,
      'const db = openHarnessDb(":memory:", { repoRoot: process.cwd() });',
      "try {",
      "  const result = rebuildHarnessDb({ repoRoot: process.cwd(), db });",
      '  const row = db.prepare("SELECT schema_version, root_count, node_count FROM visualization_tree_view WHERE tree_view_id = ?").get("visualization-tree-view:latest");',
      "  process.stdout.write(JSON.stringify({ ok: result.ok, rows: result.rowCounts.visualization_tree_view, row }));",
      "} finally { db.close(); }",
    ].join("\n");

    try {
      const result = spawnSync("node", ["--preload", preloadPath, "--eval", child], {
        cwd: process.cwd(),
        env: { ...process.env, HELIX_SKIP_UPDATE_CHECK: "1" },
        encoding: "utf8",
        timeout: 60_000,
      });
      const stdout = result.stdout;
      const stderr = result.stderr;
      expect(result.status, stderr.slice(0, 2_000)).toBe(0);
      expect(JSON.parse(stdout)).toMatchObject({
        ok: true,
        rows: 1,
        row: {
          schema_version: "visualization-tree-view.v1",
          root_count: 2,
        },
      });
      expect(
        (JSON.parse(stdout) as { row: { node_count: number } }).row.node_count,
      ).toBeGreaterThan(2);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  }, 70_000);
});

import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  componentCoverageSummary,
  loadUiTokens,
  renderAllScreens,
  renderAppShell,
  SCREEN_SPECS,
} from "../src/web";

const SCREEN_IDS = [
  "PM-01",
  "PM-02",
  "PM-03",
  "PM-04",
  "PM-05",
  "PM-06",
  "HM-01",
  "HM-02",
  "HM-03",
  "HM-04",
  "HM-05",
  "HM-06",
  "HM-07",
  "HM-08",
  "GD-01",
];

const repoRoot = process.cwd();
const cliPath = join(repoRoot, "src", "cli.ts");

function runCli(args: string[]) {
  return spawnSync("bun", [cliPath, ...args], {
    cwd: repoRoot,
    encoding: "utf8",
  });
}

describe("component-derived web UI registry (PLAN-L7-141)", () => {
  it("defines the 15 L2 screens with URL and component-derived composition", () => {
    expect(SCREEN_SPECS.map((screen) => screen.id)).toEqual(SCREEN_IDS);

    for (const screen of SCREEN_SPECS) {
      expect(screen.url).toMatch(/^\/(?:projects|project\/:case|harness|guide)/);
      expect(
        screen.specificComponents.length,
        `${screen.id} missing specific component`,
      ).toBeGreaterThan(0);
      expect(
        screen.commonComponents.length,
        `${screen.id} missing common component`,
      ).toBeGreaterThan(0);
      expect(screen.mission.length, `${screen.id} missing mission`).toBeGreaterThan(10);
    }
  });

  it("loads L4 tokens.yaml as the renderer token source", () => {
    const tokens = loadUiTokens();

    expect(tokens.mode).toBe("light");
    expect(tokens.color.status.ok.fg).toBe("#1A7F37");
    expect(tokens.color.status.warn.icon).toBe("alert");
    expect(tokens.size.layout.minWidth).toBe(1024);
    expect(tokens.motion.pollIntervalSec).toBe(30);
  });

  it("renders every screen as read-only HTML with CLI-copy action only", () => {
    const tokens = loadUiTokens();
    const rendered = renderAllScreens(tokens);

    expect(rendered).toHaveLength(15);
    for (const entry of rendered) {
      expect(entry.html).toContain(`data-screen-id="${entry.screen.id}"`);
      expect(entry.html).toContain('data-read-only="true"');
      expect(entry.html).toContain("CLIコピー");
      expect(entry.html).toContain("UI直接実行なし");
      expect(entry.html).not.toMatch(/fetch\(|XMLHttpRequest|method="post"|type="submit"/i);
    }
  });

  it("keeps table-dumper out of src/web and exposes component coverage", () => {
    const source = [
      "src/web/catalog.ts",
      "src/web/render.ts",
      "src/web/tokens.ts",
      "src/web/types.ts",
      "src/web/index.ts",
    ]
      .map((path) => readFileSync(path, "utf8"))
      .join("\n");

    expect(source).not.toMatch(/table[-_ ]?dumper/i);
    expect(source).toContain("HeatmapGrid");
    expect(source).toContain("TraceGraph");
    expect(source).toContain("DoctorResultTree");
    expect(componentCoverageSummary()).toEqual({
      screenCount: 15,
      commonCount: 10,
      specificCount: 40,
      readOnly: true,
    });
  });

  it("renders an app shell without inventing extra screens", () => {
    const shell = renderAppShell(loadUiTokens());

    for (const id of SCREEN_IDS) {
      expect(shell).toContain(`data-screen-id="${id}"`);
    }
    expect(shell.match(/data-screen-id=/g)).toHaveLength(15);
    expect(shell).toContain('lang="ja"');
  });

  it("exposes a CLI render surface for the static read-only UI", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-web-render-"));
    const out = join(root, "dashboard.html");
    try {
      const run = runCli(["web", "render", "--out", out, "--json"]);
      const payload = JSON.parse(run.stdout);

      expect(run.status).toBe(0);
      expect(payload).toMatchObject({
        ok: true,
        output_path: out,
        screenCount: 15,
        readOnly: true,
      });
      expect(existsSync(out)).toBe(true);
      expect(readFileSync(out, "utf8")).toContain('data-screen-id="PM-01"');
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});

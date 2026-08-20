import { spawnSync } from "node:child_process";
import { cpSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ensureCliBundle } from "./tools/cli-bundle";

// PLAN-L7-635-workflow-guide-dynamic-injection: U-WFGUIDE-008/009 の実CLI検証。
const repoRoot = process.cwd();
const cliBundlePath = ensureCliBundle(repoRoot);

function fixtureRoot(): string {
  const root = mkdtempSync(join(tmpdir(), "helix-workflow-guide-"));
  cpSync(join(repoRoot, "config"), join(root, "config"), { recursive: true });
  cpSync(join(repoRoot, "docs"), join(root, "docs"), { recursive: true });
  return root;
}

function runCli(root: string, args: string[], input?: string) {
  return spawnSync(process.execPath, [cliBundlePath, ...args], {
    cwd: root,
    encoding: "utf8",
    env: { ...process.env, HELIX_SKIP_UPDATE_CHECK: "1" },
    input,
    maxBuffer: 8 * 1024 * 1024,
    timeout: 45_000,
  });
}

describe("typed workflow guide CLI and SessionStart injection", () => {
  it("U-WFGUIDE-008: CLIは選択workflow_modelのdigest付きguideを返す", () => {
    const root = fixtureRoot();
    try {
      const result = runCli(root, [
        "workflow",
        "guide",
        "--workflow",
        "REVERSE",
        "--signal",
        "drift",
        "--drive",
        "agent",
        "--format",
        "json",
      ]);

      expect(result.status).toBe(0);
      const payload = JSON.parse(result.stdout) as {
        ok: boolean;
        guide: { identity: { target_axis: string; target_id: string }; guide_digest: string };
      };
      expect(payload).toMatchObject({
        ok: true,
        guide: { identity: { target_axis: "workflow_model", target_id: "REVERSE" } },
      });
      expect(payload.guide.guide_digest).toMatch(/^sha256:[a-f0-9]{64}$/u);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("U-WFGUIDE-009: SessionStartは明示されたguideだけをboundedに注入する", () => {
    const root = fixtureRoot();
    try {
      const result = runCli(
        root,
        ["session", "start", "--session", "workflow-guide-cli-test"],
        JSON.stringify({
          hook_event_name: "SessionStart",
          session_id: "workflow-guide-cli-test",
          workflow_id: "REVERSE",
          workflow_signal: "drift",
          specialist_drive: "agent",
        }),
      );

      expect(result.status).toBe(0);
      expect(result.stdout).toContain("workflow-guide (REVERSE):");
      expect(result.stdout).toContain("selected-signal: drift");
      expect(result.stdout).not.toContain("workflow-guide (RECOVERY):");
      expect(
        readFileSync(
          join(root, ".helix", "logs", "session", "workflow-guide-cli-test.jsonl"),
          "utf8",
        ),
      ).toContain('"event_type":"session_start"');
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});

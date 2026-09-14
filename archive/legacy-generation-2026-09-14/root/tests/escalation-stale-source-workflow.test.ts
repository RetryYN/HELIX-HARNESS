import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// PLAN-RECOVERY-109-escalation-source-workflow-profile — U-ESC-SRC-001/U-ESC-SRC-002
const SOURCE_WORKFLOW = join(process.cwd(), ".github", "workflows", "escalation-stale.yml");
const CONSUMER_TEMPLATE = join(
  process.cwd(),
  "docs",
  "templates",
  "github",
  "common",
  "escalation-stale.yml",
);

function runCommands(workflow: string): string[] {
  return workflow
    .split(/\r?\n/)
    .map((line) => line.match(/^\s*(?:-\s*)?run:\s+(.+?)\s*$/)?.[1])
    .filter((command): command is string => command !== undefined);
}

describe("source escalation-stale workflow profile boundary", () => {
  it("U-ESC-SRC-001: source workflowはconsumer doctorを起動しない", () => {
    const workflow = readFileSync(SOURCE_WORKFLOW, "utf8");

    expect(runCommands(workflow)).toEqual([
      "npm ci",
      "npm run helix -- status --json",
      "npm run helix -- completion decision-packet --json",
      "npm run helix -- completion review-bundle --json",
      "npm run helix -- doctor --scope toolchain --json",
    ]);
    expect(workflow).not.toContain("doctor --profile consumer");
  });

  it("U-ESC-SRC-002: consumer templateはconsumer doctorを維持する", () => {
    const template = readFileSync(CONSUMER_TEMPLATE, "utf8");

    expect(template).toContain("npm run helix -- doctor --profile consumer --json");
    expect(template).not.toContain("doctor --scope toolchain");
  });
});

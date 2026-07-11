import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { loadRetiredArtifactPaths } from "../src/lint/artifact-retirement-authority";

function sha256(text: string): string {
  return `sha256:${createHash("sha256").update(text).digest("hex")}`;
}

describe("artifact-retirement-authority", () => {
  it("loads the code-pinned repository authority bound to the approved retirement operation", () => {
    const retired = loadRetiredArtifactPaths(process.cwd());
    expect(retired.has("src/handover/index.ts")).toBe(true);
    expect(retired.has("tests/handover.test.ts")).toBe(true);
    expect(retired.has("src/cli.ts")).toBe(false);
    for (const path of retired) expect(existsSync(path), path).toBe(false);
  });

  it("fails closed when the retirement authority is not bound to the approved operation", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-artifact-retirement-authority-"));
    try {
      mkdirSync(join(root, "config"), { recursive: true });
      const authority = `${JSON.stringify({
        schemaVersion: "artifact-retirement-authority.v1",
        operationId: "retirement:expected",
        intentDigest: `sha256:${"ab".repeat(32)}`,
        approvalDecisionId: "retirement:approved",
        artifacts: [{ path: "src/retired.ts", disposition: "retired_deleted" }],
      })}\n`;
      writeFileSync(join(root, "config", "artifact-retirement-authority.json"), authority);
      writeFileSync(
        join(root, "config", "handover-retirement-enforce-authority.json"),
        JSON.stringify({
          operationId: "retirement:other",
          intentDigest: `sha256:${"ab".repeat(32)}`,
          approvalDecisionId: "retirement:approved",
          approvalStatus: "approved",
        }),
      );
      expect(() => loadRetiredArtifactPaths(root, sha256(authority))).toThrow(/unbound/);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});

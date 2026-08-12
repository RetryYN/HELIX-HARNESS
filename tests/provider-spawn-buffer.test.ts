import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("provider spawn output buffer contract", () => {
  it("U-ISSUE602-001: [PLAN-RECOVERY-56-codex-spawn-enobufs] provider spawnSyncに64 MiBのmaxBufferを渡す", () => {
    const source = readFileSync("src/cli.ts", "utf8");
    const providerSpawn = source.match(
      /const child = spawnSync\(admitted\.invocation\.command, admitted\.invocation\.args, \{[\s\S]*?\n {8}\}\);/u,
    )?.[0];

    expect(providerSpawn).toBeDefined();
    expect(providerSpawn).toContain("input: admitted.stdin");
    expect(providerSpawn).toContain("maxBuffer: 64 * 1024 * 1024");
  });
});

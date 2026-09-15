import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { REVIEWED_SAFE_DISPOSITIONS } from "../src/lint/l12-hybrid-reviewed-safe-v2";

// PLAN-L7-507-kimi-runtime-boundary
// AGENTS.md は Kimi 等の AGENTS.md 準拠エージェントも読む runtime boundary 正本であり、
// digest 固定 review から静かに外れると drift gate が後段で崩れる。registry と実ファイルの
// 同期を直接固定し、AGENTS.md 編集時に registry 再 review を強制する。
describe("Kimi runtime boundary: AGENTS.md reviewed-safe digest fence", () => {
  it("U-KIMIB-001: AGENTS.md reviewed-safe digest stays in sync with the file on disk", () => {
    const entry = REVIEWED_SAFE_DISPOSITIONS.find((row) => row.path === "AGENTS.md");
    expect(entry).toBeDefined();
    expect(entry?.finalDisposition).toBe("compatibility_labeled");
    const body = readFileSync(resolve(__dirname, "..", "AGENTS.md"), "utf-8");
    const actualDigest = createHash("sha256").update(body).digest("hex");
    expect(actualDigest).toBe(entry?.contentDigest);
  });
});

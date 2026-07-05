import { describe, expect, it } from "vitest";
import {
  allowlistSyncMessages,
  analyzeAllowlistSync,
  loadAllowlistSyncInput,
  parseDocAllowlist,
  parsePolicyAllowlist,
} from "../src/lint/allowlist-sync";
import { SUBAGENT_ALLOWLIST } from "../src/runtime/agent-guard-policy";

describe("U-ALSYNC: allowlist-sync (PLAN-L7-335)", () => {
  it("U-ALSYNC-001: 正本と転記が一致すれば pass", () => {
    const result = analyzeAllowlistSync({ policy: ["a", "b"], doc: ["b", "a"] });
    expect(result.ok).toBe(true);
    expect(allowlistSyncMessages(result)[0]).toContain("allowlist-sync - OK");
  });

  it("U-ALSYNC-002: 片側欠落は方向つき violation", () => {
    const result = analyzeAllowlistSync({ policy: ["a", "b"], doc: ["a", "c"] });
    expect(result.ok).toBe(false);
    expect(result.violations.map((v) => v.kind)).toEqual(["missing-in-doc", "missing-in-policy"]);
    const joined = allowlistSyncMessages(result).join("\n");
    expect(joined).toContain("b");
    expect(joined).toContain("c");
  });

  it("U-ALSYNC-003: parse 失敗 (null) は fail-close", () => {
    const result = analyzeAllowlistSync({ policy: null, doc: null });
    expect(result.ok).toBe(false);
    expect(result.violations.map((v) => v.kind)).toEqual(["policy-unreadable", "doc-unreadable"]);
  });

  it("U-ALSYNC-004: policy ソースの Set リテラルから entry を抽出できる", () => {
    const source = `export const SUBAGENT_ALLOWLIST: ReadonlySet<string> = new Set([\n  "one",\n  "two",\n]);`;
    expect(parsePolicyAllowlist(source)).toEqual(["one", "two"]);
    expect(parsePolicyAllowlist("nothing here")).toBeNull();
  });

  it("U-ALSYNC-005: CLAUDE.md の Allowlist 節 bullet を次見出しまで抽出できる", () => {
    const content = [
      "Allowlist（正本 = `src/runtime/agent-guard-policy.ts` の `SUBAGENT_ALLOWLIST`。本一覧は同期写し）:",
      "",
      "- `one`",
      "- `two`",
      "",
      "### 次の見出し",
      "- `three`",
    ].join("\n");
    expect(parseDocAllowlist(content)).toEqual(["one", "two"]);
    expect(parseDocAllowlist("no section")).toBeNull();
  });

  it("U-ALSYNC-006: 実 repo の転記が SUBAGENT_ALLOWLIST と一致する (real-repo regression)", () => {
    const input = loadAllowlistSyncInput(process.cwd());
    expect(input.policy).not.toBeNull();
    expect(new Set(input.policy)).toEqual(new Set(SUBAGENT_ALLOWLIST));
    const result = analyzeAllowlistSync(input);
    expect(result.violations).toEqual([]);
    expect(result.ok).toBe(true);
  });
});

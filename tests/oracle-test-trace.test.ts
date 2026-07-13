// PLAN-REVERSE-41 塊B: oracle 宣言 ⇔ 実テスト citation の突合 (IMP-128、forward-citation 規律)。
// test-design 宣言 oracle (U-*/IT-*) が tests/ に ID citation を持つか。NEW は fail、既存89は baseline。
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  analyzeOracleTestTrace,
  loadOracleTestTraceInput,
  ORACLE_TEST_TRACE_BASELINE,
} from "../src/lint/oracle-test-trace";

describe("analyzeOracleTestTrace (U-OTT-001..003)", () => {
  const base = {
    referenced: new Set(["U-FOO-001"]),
    baseline: new Set(["U-BAR-002"]),
  };

  it("U-OTT-001: 宣言済だが未 citation かつ baseline 外 = orphan (NEW fail-close)", () => {
    const r = analyzeOracleTestTrace({ declared: ["U-NEW-009"], ...base });
    expect(r.orphans).toContain("U-NEW-009");
    expect(r.ok).toBe(false);
  });

  it("U-OTT-002: tests に citation 済 oracle は orphan でない", () => {
    const r = analyzeOracleTestTrace({ declared: ["U-FOO-001"], ...base });
    expect(r.orphans).toHaveLength(0);
    expect(r.ok).toBe(true);
  });

  it("U-OTT-003: baseline 済 oracle は orphan でない (known-debt)", () => {
    const r = analyzeOracleTestTrace({ declared: ["U-BAR-002"], ...base });
    expect(r.orphans).toHaveLength(0);
  });
});

describe("loadOracleTestTraceInput real repo (U-OTT-004/005)", () => {
  it("U-OTT-004: 実 repo の orphan は 0 (baseline 適用後、NEW oracle は fail-close 回帰網)", () => {
    const r = analyzeOracleTestTrace(loadOracleTestTraceInput(process.cwd()));
    expect(r.orphans).toEqual([]);
  });

  it("U-OTT-005: baseline は 89 件スナップショット (縮小のみ可)", () => {
    expect(ORACLE_TEST_TRACE_BASELINE.size).toBe(89);
  });

  it("U-OTT-006: draft test-design の将来 oracle は実装済み oracle trace に混ぜない", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-oracle-trace-"));
    try {
      mkdirSync(join(root, "docs", "test-design"), { recursive: true });
      mkdirSync(join(root, "tests"), { recursive: true });
      writeFileSync(
        join(root, "docs", "test-design", "draft.md"),
        ["---", "status: draft", "---", "", "IT-FUTURE-001", ""].join("\n"),
      );
      writeFileSync(
        join(root, "docs", "test-design", "confirmed.md"),
        ["---", "status: confirmed", "---", "", "U-NOW-001", ""].join("\n"),
      );
      writeFileSync(join(root, "tests", "now.test.ts"), "// U-NOW-001\n");

      const input = loadOracleTestTraceInput(root);
      expect(input.declared).toEqual(["U-NOW-001"]);
      expect(analyzeOracleTestTrace(input).orphans).toEqual([]);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("U-OTT-007: 本文中の status: draft は frontmatter status を上書きできず、unknown statusはfail-closeで収集する", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-oracle-trace-frontmatter-"));
    try {
      mkdirSync(join(root, "docs", "test-design"), { recursive: true });
      mkdirSync(join(root, "tests"), { recursive: true });
      writeFileSync(
        join(root, "docs", "test-design", "confirmed-with-example.md"),
        [
          "---",
          "status: confirmed",
          "---",
          "",
          "```yaml",
          "status: draft",
          "```",
          "U-TRACE-001",
          "",
        ].join("\n"),
      );
      writeFileSync(
        join(root, "docs", "test-design", "unknown.md"),
        ["---", "status: proposed", "---", "", "U-TRACE-002", ""].join("\n"),
      );
      writeFileSync(join(root, "tests", "trace.test.ts"), "// U-TRACE-001\n");

      const input = loadOracleTestTraceInput(root);
      expect(input.declared.sort()).toEqual(["U-TRACE-001", "U-TRACE-002"]);
      expect(analyzeOracleTestTrace(input).orphans).toEqual(["U-TRACE-002"]);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});

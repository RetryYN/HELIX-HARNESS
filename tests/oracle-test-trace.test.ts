// @helix-repo-wide-guard
// PLAN-REVERSE-41 塊B / PLAN-RECOVERY-1669-oracle-id-registration:
// oracle 宣言 ⇔ 実テスト citation の突合と、未登録／宣言に無い多重出現の fail-close。
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  analyzeOracleTestTrace,
  isExplainedOraclePath,
  loadOracleTestTraceInput,
  ORACLE_FREEZE_PACKET_TEST_PATH,
  ORACLE_TEST_TRACE_BASELINE,
  ORACLE_UNDECLARED_MULTI_BASELINE,
  ORACLE_UNREGISTERED_BASELINE,
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

describe("oracle ID registration and undeclared multi (PLAN-RECOVERY-1669-oracle-id-registration)", () => {
  const emptyTrace = {
    declared: [] as string[],
    referenced: new Set<string>(),
    baseline: new Set<string>(),
  };

  it("U-OTT-008: L6/L8 未登録の it() ID は baseline 外なら fail-close", () => {
    const r = analyzeOracleTestTrace({
      ...emptyTrace,
      appearances: new Map([["U-NEWUNREG-001", ["tests/new.test.ts"]]]),
      registered: new Set(),
      unregisteredBaseline: new Set(),
    });
    expect(r.unregistered).toEqual(["U-NEWUNREG-001"]);
    expect(r.ok).toBe(false);
  });

  it("U-OTT-009: 未登録 baseline 済み ID は known-debt として green", () => {
    const r = analyzeOracleTestTrace({
      ...emptyTrace,
      appearances: new Map([["U-PRSCOPE-008", ["tests/branch-kind.test.ts"]]]),
      registered: new Set(),
      unregisteredBaseline: new Set(["U-PRSCOPE-008"]),
    });
    expect(r.unregistered).toEqual([]);
    expect(r.ok).toBe(true);
  });

  it("U-OTT-010: L8 が全 path を宣言した多重 citation は衝突でない", () => {
    const r = analyzeOracleTestTrace({
      ...emptyTrace,
      appearances: new Map([["U-L8MULTI-001", ["tests/a.test.ts", "tests/b.test.ts"]]]),
      registered: new Set(["U-L8MULTI-001"]),
      declaredPaths: new Map([["U-L8MULTI-001", ["tests/a.test.ts", "tests/b.test.ts"]]]),
    });
    expect(r.undeclaredMulti).toEqual([]);
    expect(r.ok).toBe(true);
  });

  it("U-OTT-011: PLAN verification_bindings が全 path を宣言した多重 citation は衝突でない", () => {
    const r = analyzeOracleTestTrace({
      ...emptyTrace,
      appearances: new Map([["U-PLANMULTI-001", ["tests/left.test.ts", "tests/right.test.ts"]]]),
      registered: new Set(["U-PLANMULTI-001"]),
      declaredPaths: new Map([["U-PLANMULTI-001", ["tests/left.test.ts", "tests/right.test.ts"]]]),
    });
    expect(r.undeclaredMulti).toEqual([]);
    expect(r.ok).toBe(true);
  });

  it("U-OTT-012: fast/slow pair は単純衝突でない", () => {
    const r = analyzeOracleTestTrace({
      ...emptyTrace,
      appearances: new Map([["U-LANE-001", ["tests/doctor.test.ts", "tests/slow/doctor.test.ts"]]]),
      registered: new Set(["U-LANE-001"]),
    });
    expect(r.undeclaredMulti).toEqual([]);
    expect(r.ok).toBe(true);
  });

  it("U-OTT-013: freeze 伝播の対は単純衝突でない", () => {
    const r = analyzeOracleTestTrace({
      ...emptyTrace,
      appearances: new Map([
        [
          "U-GHEP-008",
          ["tests/github-execution-episode-state.test.ts", ORACLE_FREEZE_PACKET_TEST_PATH],
        ],
      ]),
      registered: new Set(["U-GHEP-008"]),
    });
    expect(r.undeclaredMulti).toEqual([]);
    expect(r.ok).toBe(true);
  });

  it("U-OTT-014: 宣言に無い多重出現は fail-close", () => {
    const r = analyzeOracleTestTrace({
      ...emptyTrace,
      appearances: new Map([["U-COLLIDE-001", ["tests/one.test.ts", "tests/two.test.ts"]]]),
      registered: new Set(["U-COLLIDE-001"]),
      declaredPaths: new Map(),
      undeclaredMultiBaseline: new Set(),
    });
    expect(r.undeclaredMulti).toEqual(["U-COLLIDE-001"]);
    expect(r.ok).toBe(false);
  });

  it("U-OTT-015: doctor lane と単一 feature path の対は衝突でない", () => {
    const r = analyzeOracleTestTrace({
      ...emptyTrace,
      appearances: new Map([
        ["U-GREENCMD-003", ["tests/green-command-digest.test.ts", "tests/slow/doctor.test.ts"]],
      ]),
      registered: new Set(["U-GREENCMD-003"]),
    });
    expect(r.undeclaredMulti).toEqual([]);
    expect(r.ok).toBe(true);
  });

  it("U-OTT-016: 実 repo の未宣言多重は空のまま、未登録 baseline は引き上げない", () => {
    const live = loadOracleTestTraceInput(process.cwd());
    const r = analyzeOracleTestTrace(live);
    expect(r.undeclaredMulti).toEqual([]);
    expect(ORACLE_TEST_TRACE_BASELINE.size).toBe(89);
    expect(ORACLE_UNREGISTERED_BASELINE.size).toBe(454);
    expect(live.registered?.has("U-OTT-001")).toBe(true);
    expect(live.registered?.has("U-OTT-021")).toBe(true);
    expect(r.unregistered.every((id) => !ORACLE_UNREGISTERED_BASELINE.has(id))).toBe(true);
    expect(r.ok).toBe(r.orphans.length === 0 && r.unregistered.length === 0);
  });

  it("U-OTT-017: 既存未 citation baseline 89 件を現在値へ置き換えない", () => {
    expect(ORACLE_TEST_TRACE_BASELINE.size).toBe(89);
    expect(ORACLE_TEST_TRACE_BASELINE.has("U-PRSCOPE-008")).toBe(false);
  });

  it("U-OTT-018: 未登録 baseline は U-PRSCOPE-008 を含み、現在値代入の逃げ道を持たない", () => {
    expect(ORACLE_UNREGISTERED_BASELINE.has("U-PRSCOPE-008")).toBe(true);
    expect(ORACLE_UNREGISTERED_BASELINE.has("U-FAKE-999")).toBe(false);
    expect(ORACLE_UNREGISTERED_BASELINE.has("U-OTT-001")).toBe(false);
    expect(ORACLE_UNREGISTERED_BASELINE.size).toBe(454);
    const live = loadOracleTestTraceInput(process.cwd());
    expect(live.registered?.has("U-OTT-001")).toBe(true);
  });

  it("U-OTT-019: L8 宣言済み多重を衝突扱いする mutation を kill する", () => {
    const paths = ["tests/branch-kind.test.ts", "tests/harness-check-workflow.test.ts"];
    const declared = new Set(paths);
    const naiveCollision = paths.length > 1;
    const explained = paths.every((path) => isExplainedOraclePath(path, paths, declared));
    expect(naiveCollision).toBe(true);
    expect(explained).toBe(true);
    expect(ORACLE_UNDECLARED_MULTI_BASELINE.has("U-PRSCOPE-003")).toBe(false);
  });

  it("U-OTT-020: baseline を現在の未登録集合へ置き換える mutation を kill する", () => {
    const r = analyzeOracleTestTrace({
      ...emptyTrace,
      appearances: new Map([["U-NEWUNREG-002", ["tests/extra.test.ts"]]]),
      registered: new Set(),
      unregisteredBaseline: ORACLE_UNREGISTERED_BASELINE,
    });
    expect(ORACLE_UNREGISTERED_BASELINE.has("U-NEWUNREG-002")).toBe(false);
    expect(r.unregistered).toEqual(["U-NEWUNREG-002"]);
    expect(r.ok).toBe(false);
  });

  it("U-OTT-021: design 本文の例示 mention は tests-only ID を登録にしない", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-oracle-prose-mention-"));
    try {
      mkdirSync(join(root, "docs", "design", "harness", "L6-function-design"), { recursive: true });
      mkdirSync(join(root, "docs", "test-design", "harness"), { recursive: true });
      mkdirSync(join(root, "docs", "plans"), { recursive: true });
      mkdirSync(join(root, "tests"), { recursive: true });
      writeFileSync(
        join(root, "tests", "feature.test.ts"),
        [
          'import { it } from "vitest";',
          'it("U-PROSEMENTION-001: executable case", () => {});',
          "",
        ].join("\n"),
      );
      writeFileSync(
        join(root, "tests", "tableok.test.ts"),
        [
          'import { it } from "vitest";',
          'it("U-TABLEOK-001: registered via eligible table", () => {});',
          "",
        ].join("\n"),
      );
      writeFileSync(
        join(root, "tests", "tablecol.test.ts"),
        [
          'import { it } from "vitest";',
          'it("U-TABLECOL-001: registered via L6 oracle column", () => {});',
          "",
        ].join("\n"),
      );
      writeFileSync(
        join(root, "docs", "design", "harness", "L6-function-design", "example.md"),
        [
          "# example",
          "",
          "監査メモの例示として U-PROSEMENTION-001 は登録ではない。",
          "",
          "| 関数 | Signature | pre | post | invariant | oracle |",
          "|---|---|---|---|---|---|",
          "| `fn` | fn() => void | x | y | z | U-TABLECOL-001 |",
          "",
        ].join("\n"),
      );
      writeFileSync(
        join(root, "docs", "test-design", "harness", "L8-unit-test-design.md"),
        [
          "---",
          "status: confirmed",
          "---",
          "",
          "本文に U-PROSEMENTION-001 と書いても eligible 表が無い限り登録ではない。",
          "",
          "| U-ID | 対象 | 反例と期待結果 | test citation |",
          "|---|---|---|---|",
          "| U-TABLEOK-001 | eligible | 正規表だけが登録源 | `tests/tableok.test.ts` |",
          "",
        ].join("\n"),
      );
      writeFileSync(
        join(root, "docs", "plans", "PLAN-EXAMPLE.md"),
        ["---", "plan_id: PLAN-EXAMPLE", "verification_bindings: []", "---", ""].join("\n"),
      );

      const input = loadOracleTestTraceInput(root);
      expect(input.registered?.has("U-PROSEMENTION-001")).toBe(false);
      expect(input.registered?.has("U-TABLEOK-001")).toBe(true);
      expect(input.registered?.has("U-TABLECOL-001")).toBe(true);
      expect(input.appearances?.has("U-PROSEMENTION-001")).toBe(true);
      const result = analyzeOracleTestTrace(input);
      expect(result.unregistered).toContain("U-PROSEMENTION-001");
      expect(result.unregistered).not.toContain("U-TABLEOK-001");
      expect(result.unregistered).not.toContain("U-TABLECOL-001");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});

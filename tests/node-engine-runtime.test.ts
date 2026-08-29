import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  analyzeNodeEngineRuntime,
  assertNodeEngineRuntimeAuthority,
  parseNodeEngineRange,
  parseNodeVersion,
} from "../src/doctor/node-engine-runtime.js";

// PLAN-L7-643-node-engine-runtime-gate

function codes(range: string | null, runtime: string): string[] {
  return analyzeNodeEngineRuntime({ runtimeVersion: runtime, declaredRange: range }).findings.map(
    (finding) => finding.code,
  );
}

describe("node engine runtime gate", () => {
  it("U-NODEENG-001: 範囲外runtimeをout_of_rangeで拒否し範囲内は通す", () => {
    // Issue #660 の実測値そのもの: engines >=24.15.0 <25 に対し runtime v22.23.1。
    expect(codes(">=24.15.0 <25", "v22.23.1")).toEqual(["node_engine_runtime_out_of_range"]);
    expect(codes(">=24.15.0 <25", "v24.15.0")).toEqual([]);
    expect(codes(">=24.15.0 <25", "v24.99.1")).toEqual([]);
    // 上限は排他。25.0.0 は満たさない。
    expect(codes(">=24.15.0 <25", "v25.0.0")).toEqual(["node_engine_runtime_out_of_range"]);
    // 下限も排他ではない一方、patch 1 つ下は満たさない。
    expect(codes(">=24.15.0 <25", "v24.14.9")).toEqual(["node_engine_runtime_out_of_range"]);
  });

  it("U-NODEENG-002: engines宣言が無い場合はdeclaration_missingでfail-closeする", () => {
    const result = analyzeNodeEngineRuntime({ runtimeVersion: "v24.15.0", declaredRange: null });
    expect(result.ok).toBe(false);
    expect(result.findings.map((finding) => finding.code)).toEqual([
      "node_engine_declaration_missing",
    ]);
  });

  it("U-NODEENG-003: 解釈できないrangeを通さずrange_unsupportedで閉じる", () => {
    // 解釈できない range を「満たしている」と扱わないことが本 oracle の要点。
    for (const range of ["^24.15.0", "~24.15.0", ">=24 || <20", "24.x", "latest"]) {
      expect(codes(range, "v24.15.0"), range).toEqual(["node_engine_range_unsupported"]);
    }
    // runtime 側が壊れている場合も同じく閉じる。
    expect(codes(">=24.15.0 <25", "not-a-version")).toEqual(["node_engine_range_unsupported"]);
    // 空文字は range の解釈失敗ではなく未宣言として分類する（toolchain-pin と責務が重ならない）。
    expect(codes("", "v24.15.0")).toEqual(["node_engine_declaration_missing"]);
  });

  it("U-NODEENG-004: version表記の省略形を正規化する", () => {
    expect(parseNodeVersion("v24.15.0")).toEqual([24, 15, 0]);
    expect(parseNodeVersion("24.15")).toEqual([24, 15, 0]);
    expect(parseNodeVersion("24")).toEqual([24, 0, 0]);
    expect(parseNodeVersion("v24.15.0-nightly")).toBeNull();
    expect(parseNodeVersion("")).toBeNull();
  });

  it("U-NODEENG-005: comparator列をAND連結として解釈する", () => {
    expect(parseNodeEngineRange(">=24.15.0 <25")).toEqual([
      { operator: ">=", version: [24, 15, 0] },
      { operator: "<", version: [25, 0, 0] },
    ]);
    // 演算子省略は完全一致として扱う。
    expect(parseNodeEngineRange("24.15.0")).toEqual([{ operator: "=", version: [24, 15, 0] }]);
    expect(parseNodeEngineRange("^24")).toBeNull();
  });

  it("U-NODEENG-006: evidence write boundaryは範囲外runtimeをthrowで停止する", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-node-authority-"));
    try {
      writeFileSync(
        join(root, "package.json"),
        `${JSON.stringify({ engines: { node: ">=24.15.0 <25" } })}\n`,
      );

      expect(() => assertNodeEngineRuntimeAuthority(root, "v22.23.1")).toThrow(
        "node_engine_runtime_authority_rejected:node_engine_runtime_out_of_range",
      );
      expect(assertNodeEngineRuntimeAuthority(root, "v24.15.0")).toMatchObject({ ok: true });
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("U-NODEENG-007: review receipt CLIは入力解析・slot・GitHub writeより前にruntimeを検査する", () => {
    const source = readFileSync(join(process.cwd(), "src/cli.ts"), "utf8");
    const start = source.indexOf('.command("pr-review-receipt")');
    const end = source.indexOf('.command("pr-review-admission")', start);
    const command = source.slice(start, end);
    const authority = command.indexOf("assertNodeEngineRuntimeAuthority(process.cwd())");

    expect(start).toBeGreaterThanOrEqual(0);
    expect(authority).toBeGreaterThanOrEqual(0);
    expect(authority).toBeLessThan(command.indexOf("JSON.parse(opts.inputJson)"));
    expect(authority).toBeLessThan(command.indexOf("claimClaudePrReviewReceiptSlot"));
    expect(authority).toBeLessThan(command.indexOf("claudePrAuthorRuntimeAttestation"));
  });
});

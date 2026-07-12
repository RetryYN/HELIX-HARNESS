import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const l5 = readFileSync(
  "docs/design/harness/L5-detailed-design/source-boundary-architecture.md",
  "utf8",
);
const l6 = readFileSync(
  "docs/design/harness/L6-function-design/source-boundary-contracts.md",
  "utf8",
);
const l8 = readFileSync("docs/test-design/harness/L8-source-boundary-contracts.md", "utf8");
const l9 = readFileSync("docs/test-design/harness/L9-source-boundary-integration.md", "utf8");

describe("PLAN-L5/L6-79 source boundary design V-pair", () => {
  it("U-SBOUND-001/002/003: freezes forbidden directions and unspecified policy", () => {
    expect(l5).toContain("persistence→presentation");
    expect(l5).toContain("type-only import");
    expect(l5).toContain("`unspecified`としてfail-close");
    expect(l8).toContain("U-SBOUND-001");
    expect(l8).toContain("U-SBOUND-002");
    expect(l8).toContain("U-SBOUND-003");
  });

  it("U-SBOUND-004/005/006/007: freezes effect, projector, receipt, and policy contracts", () => {
    expect(l6).toContain("analyzerからwrite/child-process authorityへ直接到達できない");
    expect(l6).toContain("unspecified≠allow");
    expect(l6).toContain("timeout/nonzeroをsuccess化しない");
    for (const id of ["U-SBOUND-004", "U-SBOUND-005", "U-SBOUND-006", "U-SBOUND-007"]) {
      expect(l8).toContain(id);
    }
  });

  it("U-SBOUND-008: delegates edge extraction to PLAN-L7-428 without a second parser", () => {
    expect(l5).toContain("`PLAN-L7-428` W2");
    expect(l6).toContain("独自parserを作らない");
    expect(l8).toContain("U-SBOUND-008");
  });

  it("IT-SBOUND-001/002: freezes headless core and adapter-only integration", () => {
    expect(l9).toContain("IT-SBOUND-001");
    expect(l9).toContain("presentation import 0");
    expect(l9).toContain("IT-SBOUND-002");
    expect(l9).toContain("harness.db不要");
  });

  it("IT-SBOUND-003/004: freezes read-only and explicit effect counts", () => {
    expect(l9).toContain("IT-SBOUND-003");
    expect(l9).toContain("write set 0、child process 0");
    expect(l9).toContain("IT-SBOUND-004");
    expect(l9).toContain("child process 1回");
  });

  it("IT-SBOUND-005/006: freezes real graph coverage and mutation detection", () => {
    expect(l9).toContain("IT-SBOUND-005");
    expect(l9).toContain("policy coverage 32/32");
    expect(l9).toContain("IT-SBOUND-006");
    expect(l9).toContain("gate red");
  });
});

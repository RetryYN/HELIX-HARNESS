import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { derivePinChain } from "../src/lint/pin-chain-derivation";

// PLAN-RECOVERY-1670-pin-chain-derivation

function fixture(): string {
  const root = mkdtempSync(join(tmpdir(), "helix-pin-chain-"));
  mkdirSync(join(root, "docs/governance"), { recursive: true });
  mkdirSync(join(root, "src/lint"), { recursive: true });
  mkdirSync(join(root, "tests"), { recursive: true });
  writeFileSync(
    join(root, "docs/governance/feedback-test-owner-disposition-residual.json"),
    JSON.stringify({
      bindings: [
        {
          test_path: "tests/example.test.ts",
          test_file_sha256: "stale",
          expected_case_count: 1,
        },
      ],
    }),
  );
  writeFileSync(
    join(root, "docs/governance/feedback-test-owner-disposition-closure.json"),
    JSON.stringify({ bindings: [] }),
  );
  writeFileSync(
    join(root, "docs/governance/feedback-test-owner-disposition-direct.json"),
    JSON.stringify({ bindings: [] }),
  );
  writeFileSync(
    join(root, "tests/example.test.ts"),
    'it("one", () => {});\nit("two", () => {});\n',
  );
  writeFileSync(join(root, "src/lint/l12-hybrid-reviewed-safe-v2.ts"), "export const x = 1;\n");
  return root;
}

describe("PLAN-RECOVERY-1670 pin chain derivation", () => {
  it("U-PINCHAIN-001: changed testからdigestと件数pinのexact追従先を導出する", () => {
    const report = derivePinChain(fixture(), ["tests/example.test.ts"]);
    expect(report.status).toBe("ok");
    expect(report.findings).toEqual([
      expect.objectContaining({
        field: "expected_case_count",
        kind: "deterministic_pin",
        action: "refresh_candidate",
        recorded_value: 1,
        live_value: 2,
        stale: true,
      }),
      expect.objectContaining({
        field: "test_file_sha256",
        kind: "deterministic_pin",
        action: "refresh_candidate",
        live_value: expect.stringMatching(/^[a-f0-9]{64}$/u),
        stale: true,
      }),
    ]);
    expect(report.findings.every((finding) => /:\d+$/u.test(finding.location))).toBe(true);
  });

  it("U-PINCHAIN-002: 未登録surfaceを追従不要としてsilent successにしない", () => {
    const report = derivePinChain(fixture(), ["src/new-pin-shape.ts"]);
    expect(report.status).toBe("degraded");
    expect(report.findings).toEqual([]);
    expect(report.unsupported_surfaces).toEqual([
      "src/new-pin-shape.ts:pin_surface_not_registered",
    ]);
  });

  it("U-PINCHAIN-003: reviewed-safe pinは自動refreshせず再reviewへ送る", () => {
    const root = fixture();
    const target = "docs/plans/PLAN-L3-1639-bugbot-generation.md";
    mkdirSync(join(root, "docs/plans"), { recursive: true });
    writeFileSync(join(root, target), "changed semantic bytes\n");

    const report = derivePinChain(root, [target]);
    expect(report.status).toBe("ok");
    expect(report.findings).toEqual([
      expect.objectContaining({
        changed_path: target,
        dependent_path: "src/lint/l12-hybrid-reviewed-safe-v2.ts",
        field: "contentDigest",
        kind: "semantic_review_pin",
        action: "requires_reassessment",
        stale: true,
      }),
    ]);
  });
});

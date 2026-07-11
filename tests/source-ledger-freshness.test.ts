import { describe, expect, it } from "vitest";
import {
  sourceLedgerCheckedDate,
  sourceLedgerCheckedDateViolation,
  verificationSourceMetadataViolations,
} from "../src/lint/source-ledger-freshness";

describe("source ledger freshness", () => {
  it("extracts checked dates from Japanese source ledger headings", () => {
    expect(
      sourceLedgerCheckedDate(
        "S4 decision source ledger（確認日 2026-07-03）:",
        "S4 decision source ledger",
      ),
    ).toBe("2026-07-03");
    expect(
      sourceLedgerCheckedDate(
        "S4 decision source ledger（checked 2026-07-03、S4 判断 source 台帳）:",
        "S4 decision source ledger",
      ),
    ).toBe("2026-07-03");
  });

  it("rejects non-existent checked dates instead of relying on Date.parse normalization", () => {
    expect(
      sourceLedgerCheckedDateViolation(
        "S4 decision source ledger (checked 2026-02-31):",
        "S4 decision source ledger",
        "2026-07-02T00:00:00.000Z",
      ),
    ).toBe("S4 decision source ledger has invalid checked date: 2026-02-31");
    expect(
      sourceLedgerCheckedDateViolation(
        "S4 decision source ledger (checked 2026-04-31):",
        "S4 decision source ledger",
        "2026-07-02T00:00:00.000Z",
      ),
    ).toBe("S4 decision source ledger has invalid checked date: 2026-04-31");
  });

  it("allows a checked date that matches the local calendar day", () => {
    expect(
      sourceLedgerCheckedDateViolation(
        "S4 decision source ledger (checked 2026-07-10):",
        "S4 decision source ledger",
        "2026-07-09T17:04:00.000Z",
      ),
    ).toBeNull();
    expect(
      sourceLedgerCheckedDateViolation(
        "S4 decision source ledger (checked 2026-07-10):",
        "S4 decision source ledger",
        "2026-07-10T02:04:00+09:00",
      ),
    ).toBeNull();
  });

  it("rejects placeholder and future-action verification source metadata", () => {
    const violations = verificationSourceMetadataViolations({
      subject: "PLAN-X.phase",
      matrixName: "decisionVerificationCommandMatrix",
      row: {
        sourceUrl: "<sourceUrl>",
        sourceCheckedAt: "2026-07-02",
        latestOfficialStatus: "record later",
        sourceStatusDelta: "none",
        adoptionDecision: "must cite before approval",
        adoptionDecisionDelta: "none",
        workflowRouteImpact: "none",
      },
      now: "2026-07-02T00:00:00.000Z",
    });

    expect(violations).toEqual([
      {
        subject: "PLAN-X.phase",
        reason: "decisionVerificationCommandMatrix sourceUrl is missing or placeholder",
      },
      {
        subject: "PLAN-X.phase",
        reason: "decisionVerificationCommandMatrix latestOfficialStatus is missing or placeholder",
      },
      {
        subject: "PLAN-X.phase",
        reason: "decisionVerificationCommandMatrix adoptionDecision is missing or placeholder",
      },
    ]);
  });
});

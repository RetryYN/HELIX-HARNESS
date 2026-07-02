import { describe, expect, it } from "vitest";
import {
  sourceLedgerCheckedDateViolation,
  verificationSourceMetadataViolations,
} from "../src/lint/source-ledger-freshness";

describe("source ledger freshness", () => {
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

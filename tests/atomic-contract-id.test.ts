import { describe, expect, it } from "vitest";
import { isAtomicContractId } from "../src/schema/atomic-contract-id";

// PLAN-L7-686-atomic-contract-id-authority execution evidence.

describe("Atomic contract ID authority", () => {
  it("U-ATOMIC-ID-001: 2〜6 segmentの正規IDだけを受理する", () => {
    for (const value of ["GH-1", "GH-AC-041", "A-B-C-D-E-F", "A1-B2-C3-D4-E5-F6"]) {
      expect(isAtomicContractId(value), value).toBe(true);
    }
  });

  it("U-ATOMIC-ID-002: 7／8 segmentと不正文法を拒否する", () => {
    for (const value of [
      "A-B-C-D-E-F-G",
      "A-B-C-D-E-F-G-H",
      "A",
      "a-B",
      "A-b",
      "A--B",
      "A_B-C",
      " A-B",
      "A-B ",
      "",
      null,
    ]) {
      expect(isAtomicContractId(value), String(value)).toBe(false);
    }
  });
});

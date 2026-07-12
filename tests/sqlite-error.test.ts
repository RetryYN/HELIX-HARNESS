import { describe, expect, it } from "vitest";
import { isSqliteBusy } from "../src/runtime/sqlite-error";

describe("PLAN-L7-433 Q2 sqlite busy normalization", () => {
  it("U-SQLBUSY-001: recognizes Bun code and node:sqlite locked message", () => {
    const bun = Object.assign(new Error("query failed"), { code: "SQLITE_BUSY" });
    const node = Object.assign(new Error("database is locked"), { code: "ERR_SQLITE_ERROR" });
    expect(isSqliteBusy(bun)).toBe(true);
    expect(isSqliteBusy(node)).toBe(true);
  });

  it("U-SQLBUSY-002: rejects unrelated and non-Error values", () => {
    expect(isSqliteBusy(new Error("constraint failed"))).toBe(false);
    expect(isSqliteBusy({ code: "SQLITE_BUSY" })).toBe(false);
  });
});

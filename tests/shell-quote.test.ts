import { describe, expect, it } from "vitest";
import { shellQuote } from "../src/runtime/shell-quote";

describe("PLAN-L7-433 Q6 shell quote SSoT", () => {
  it("U-SHQUOTE-001: preserves the explicit safe token alphabet", () => {
    expect(shellQuote("feature/a_b-1.2:@+=,x")).toBe("feature/a_b-1.2:@+=,x");
  });

  it("U-SHQUOTE-002: quotes spaces, apostrophes, newlines, and empty values", () => {
    expect(shellQuote("two words")).toBe("'two words'");
    expect(shellQuote("it's")).toBe("'it'\\''s'");
    expect(shellQuote("line1\nline2")).toBe("'line1\nline2'");
    expect(shellQuote("")).toBe("''");
  });
});

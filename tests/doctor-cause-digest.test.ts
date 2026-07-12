import { describe, expect, it } from "vitest";
import { sha256Digest } from "../src/runtime/digest";
import { stableCauseDigest } from "../src/runtime/stable-cause-digest";

describe("PLAN-L7-449 stable cause digest", () => {
  it("U-DUR-001: returns a stable finite kind and typed SHA-256 without raw cause", () => {
    const secret = "/home/alice/private token=super-secret SELECT * FROM credentials";
    const first = stableCauseDigest(new Error(secret));
    const second = stableCauseDigest(new Error(secret));
    expect(first).toEqual(second);
    expect(first.causeKind).toBe("error");
    expect(first.digest).toMatch(/^sha256:[a-f0-9]{64}$/);
    expect(JSON.stringify(first)).not.toContain(secret);
    expect(JSON.stringify(first)).not.toContain("/home/alice");
    expect(first.digest).not.toBe(sha256Digest(secret));
    expect(stableCauseDigest(new Error("different path and token"))).toEqual(first);
  });

  it("U-DUR-002: never throws for proxy traps, cycles, throwing getters, or huge values", () => {
    const proxy = new Proxy(
      {},
      {
        getPrototypeOf: () => {
          throw new Error("trap secret");
        },
      },
    );
    const throwingError = new Error("safe");
    Object.defineProperty(throwingError, "message", {
      get: () => {
        throw new Error("getter secret");
      },
    });
    const cyclic: { self?: unknown } = {};
    cyclic.self = cyclic;
    const revoked = Proxy.revocable({}, {});
    revoked.revoke();

    expect(() => stableCauseDigest(proxy)).not.toThrow();
    expect(stableCauseDigest(proxy).causeKind).toBe("inaccessible");
    expect(() => stableCauseDigest(revoked.proxy)).not.toThrow();
    expect(stableCauseDigest(revoked.proxy).causeKind).toBe("inaccessible");
    expect(() => stableCauseDigest(throwingError)).not.toThrow();
    expect(stableCauseDigest(throwingError).causeKind).toBe("error");
    expect(stableCauseDigest(cyclic).causeKind).toBe("object");
    const huge = stableCauseDigest("x".repeat(100_000));
    expect(huge.truncated).toBe(false);
    expect(huge.digest).toMatch(/^sha256:[a-f0-9]{64}$/);
    for (const cause of [proxy, revoked.proxy, throwingError, cyclic, huge, null, 1, Symbol("x")]) {
      expect(stableCauseDigest(cause).truncated).toBe(false);
    }
  });

  it("U-DUR-001: distinguishes scalar types without invoking object coercion", () => {
    expect(stableCauseDigest(1)).not.toEqual(stableCauseDigest("1"));
    expect(stableCauseDigest(1)).toEqual(stableCauseDigest(99));
    expect(stableCauseDigest(null).causeKind).toBe("primitive");
    expect(stableCauseDigest(Symbol("x")).digest).toMatch(/^sha256:[a-f0-9]{64}$/);
  });

  it("U-DUR-001: preserves finite diagnostic classes without message-dependent identity", () => {
    const missing = Object.assign(new Error("/tmp/a missing"), { code: "ENOENT" });
    const denied = Object.assign(new Error("/different/path denied"), { code: "EACCES" });
    expect(stableCauseDigest(missing)).not.toEqual(stableCauseDigest(denied));
    expect(stableCauseDigest(new SyntaxError("token at /tmp/a"))).not.toEqual(
      stableCauseDigest(new TypeError("token at /tmp/b")),
    );
    expect(stableCauseDigest(Object.assign(new Error("one"), { code: "ENOENT" }))).toEqual(
      stableCauseDigest(Object.assign(new Error("two"), { code: "ENOENT" })),
    );
  });
});

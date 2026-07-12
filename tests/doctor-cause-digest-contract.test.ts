import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { doctorFailure, doctorFailureMessage } from "../src/doctor/failure";

describe("PLAN-L7-449 doctor failure contract", () => {
  it("U-DUR-003: emits only allowlisted identity, reason, and finite cause metadata", () => {
    const raw = "/home/alice/private token=secret SELECT password FROM users";
    const failure = doctorFailure("digest-inventory", "read_failed", new Error(raw));
    const message = doctorFailureMessage("digest-inventory - violation", failure);
    expect(message).toContain("reason=read_failed");
    expect(message).toContain("cause_kind=error");
    expect(message).toMatch(/cause_digest=sha256:[a-f0-9]{64}$/);
    expect(message).not.toContain(raw);
    expect(doctorFailure("../../unsafe", "check_failed", raw).checkId).toBe("invalid-check-id");
  });

  it("U-DUR-003: ratchets doctor raw-cause exposure and anonymous catches", () => {
    const source = readFileSync(join(process.cwd(), "src", "doctor", "index.ts"), "utf8");
    expect(source).not.toMatch(/String\((?:error|cause|err)\)/);
    expect(source).not.toMatch(/\$\{(?:error|cause|err)\}/);
    expect(source).not.toMatch(/(?:error|cause|err)\.(?:message|stack)/);
    expect(source.match(/catch\s*\{/g)?.length ?? 0).toBeLessThanOrEqual(127);
  });
});

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { aggregateInternalDoctorChecks } from "../src/doctor/check-registry";
import { checkRefactorCandidateTriage, runDoctor } from "../src/doctor/index";

describe("PLAN-RECOVERY-84 doctor check registry authority", () => {
  it("U-DOCCHECKREG-001: hard failureだけをfull verdictへ集約する", () => {
    const result = aggregateInternalDoctorChecks([
      { id: "hard-pass", severity: "hard", run: () => ({ ok: true, messages: [] }) },
      { id: "advisory", severity: "advisory", run: () => ({ ok: false, messages: [] }) },
      { id: "hard-fail", severity: "hard", run: () => ({ ok: false, messages: [] }) },
    ]);

    expect(result).toEqual({
      allOk: false,
      failingChecks: ["hard-fail"],
      registeredHardCount: 2,
      evaluatedHardCount: 2,
    });
  });

  it("U-DOCCHECKREG-002: 単一registry authorityを固定する", () => {
    const source = readFileSync("src/doctor/index.ts", "utf8");
    expect(source).toContain("ok: doctorAllChecksOk");
    expect(source).not.toContain("aggregateDoctorCheckStates");
    expect(source).not.toMatch(/ok:\s*\n\s+nfrRegistry\.ok\s+&&/);
  });

  it("U-DOCCHECKREG-003: advisory checkのliteral true型を固定する", () => {
    const result: { messages: string[]; ok: true } = checkRefactorCandidateTriage("/missing");
    expect(result.ok).toBe(true);
  });

  it("U-DOCCHECKREG-004: shared projection縮退をwarningとして観測する", () => {
    const result = runDoctor({
      repoRoot: "/missing",
      now: "2026-09-02T00:00:00.000Z",
      readText: () => null,
      listDir: () => [],
      buildSharedProjectionDb: () => {
        throw new Error("injected shared projection failure");
      },
    });

    const warning = result.messages.find((message) =>
      message.startsWith(
        "doctor: shared-projection-db - warning: shared rebuild unavailable; per-check fallback active",
      ),
    );
    expect(warning).toMatch(
      /reason=check_failed cause_kind=error cause_digest=sha256:[a-f0-9]{64}/,
    );
    expect(warning).not.toContain("injected shared projection failure");
    expect(result.ok).toBe(false);
  });
});

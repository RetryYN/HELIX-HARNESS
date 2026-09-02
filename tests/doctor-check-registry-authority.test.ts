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

  it("U-DOCCHECKREG-002/003: 単一registry authorityとadvisory literal型を固定する", () => {
    const source = readFileSync("src/doctor/index.ts", "utf8");
    const result: { messages: string[]; ok: true } = checkRefactorCandidateTriage("/missing");

    expect(result.ok).toBe(true);
    expect(source).toContain("ok: doctorAllChecksOk");
    expect(source).not.toContain("aggregateDoctorCheckStates");
    expect(source).not.toMatch(/ok:\s*\n\s+nfrRegistry\.ok\s+&&/);
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

    expect(result.messages).toContain(
      "doctor: shared-projection-db - warning: shared rebuild unavailable; per-check fallback active (injected shared projection failure)",
    );
    expect(result.ok).toBe(false);
  });
});

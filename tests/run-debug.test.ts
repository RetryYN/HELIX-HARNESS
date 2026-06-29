import { describe, expect, it } from "vitest";
import {
  appendRuntimeVerificationLogEvent,
  buildRunDebugObligation,
  buildRuntimeVerificationLogEvent,
  classifyRuntimeVerificationEvidence,
  DEFAULT_RUNTIME_VERIFICATION_LOG_PATH,
  rejectProjectionOnlyVerification,
  validateRuntimeVerificationLogCompleteness,
} from "../src/runtime/run-debug";

const baseLogInput = {
  plan_id: "PLAN-L7-999",
  requirement_id: "HR-FR-P2-04",
  test_oracle_id: "HU-PILLAR-PROV-01",
  claim: "works" as const,
  session_id: "session-1",
  source: "run-debug" as const,
  runtime_surface: "ut-tdd-cli" as const,
  correlation_id: "corr-1",
  evidence_path: ".ut-tdd/evidence/run-debug/session-1.jsonl",
  occurred_at: "2026-06-30T00:00:00.000Z",
  redaction_policy: "no-secret-material" as const,
};

describe("L7.5 RUN & Debug runtime verification contracts", () => {
  it("U-RUNDEBUG-001: runtime claim requires session/source/surface/time/evidence", () => {
    expect(classifyRuntimeVerificationEvidence(baseLogInput)).toBe("runtime_verified");
    expect(
      classifyRuntimeVerificationEvidence({
        ...baseLogInput,
        source: "projection",
      }),
    ).toBe("projection_only_unverified");
    expect(
      classifyRuntimeVerificationEvidence({
        ...baseLogInput,
        session_id: "",
      }),
    ).toBe("missing_runtime_provenance");
    expect(classifyRuntimeVerificationEvidence({ claim: "unit-helper" })).toBe("not_runtime_claim");
  });

  it("U-RUNDEBUG-002: runtime behavior creates obligation; unit-only skip needs reason and oracle", () => {
    expect(
      buildRunDebugObligation({
        capability_id: "adapter-hook",
        claim: "fired",
        runtime_behavior: true,
      }),
    ).toMatchObject({ kind: "required" });
    expect(
      buildRunDebugObligation({
        capability_id: "pure-helper",
        claim: "unit-helper",
        runtime_behavior: false,
        reason: "pure normalization helper",
        substitute_oracle: "U-HELPER-001",
      }),
    ).toMatchObject({ kind: "not_required", substitute_oracle: "U-HELPER-001" });
    expect(
      buildRunDebugObligation({
        capability_id: "pure-helper",
        claim: "unit-helper",
        runtime_behavior: false,
      }),
    ).toMatchObject({ kind: "blocked" });
  });

  it("U-RUNDEBUG-003: projection-only and missing-provenance classes cannot close runtime acceptance", () => {
    expect(rejectProjectionOnlyVerification("runtime_verified").accept).toBe(true);
    expect(rejectProjectionOnlyVerification("not_runtime_claim").accept).toBe(true);
    expect(rejectProjectionOnlyVerification("projection_only_unverified")).toEqual({
      accept: false,
      reason: "projection_only_unverified",
    });
    expect(rejectProjectionOnlyVerification("missing_runtime_provenance").accept).toBe(false);
  });

  it("U-RUNDEBUG-004: builds append-only runtime verification log events without secret-like values", () => {
    const event = buildRuntimeVerificationLogEvent(baseLogInput);
    expect(event.event_id).toContain("PLAN-L7-999");
    expect(event.requirement_id).toBe("HR-FR-P2-04");
    expect(event.test_oracle_id).toBe("HU-PILLAR-PROV-01");
    expect(() =>
      buildRuntimeVerificationLogEvent({
        ...baseLogInput,
        evidence_path: ".ut-tdd/evidence/token=secret123.jsonl",
      }),
    ).toThrow(/secret-like/);
  });

  it("U-RUNDEBUG-005: validates completeness for works/used/fired/executed runtime claims", () => {
    const event = buildRuntimeVerificationLogEvent(baseLogInput);
    expect(validateRuntimeVerificationLogCompleteness(event)).toEqual({ ok: true, findings: [] });
    expect(
      validateRuntimeVerificationLogCompleteness({
        ...event,
        session_id: "",
        correlation_id: "",
        evidence_path: "",
        requirement_id: null,
        test_oracle_id: null,
      }),
    ).toEqual({
      ok: false,
      findings: [
        "missing_session_id",
        "missing_correlation_id",
        "missing_evidence_path",
        "missing_requirement_or_oracle",
      ],
    });
  });

  it("U-RUNDEBUG-006: appends complete runtime verification events only", () => {
    const writes: Array<{ path: string; content: string }> = [];
    const written = appendRuntimeVerificationLogEvent(baseLogInput, {
      repoRoot: "/repo",
      appendText: (path, content) => writes.push({ path, content }),
    });

    expect(written.path).toBe(DEFAULT_RUNTIME_VERIFICATION_LOG_PATH);
    expect(written.completeness).toEqual({ ok: true, findings: [] });
    expect(writes).toEqual([
      {
        path: `/repo/${DEFAULT_RUNTIME_VERIFICATION_LOG_PATH}`,
        content: `${JSON.stringify(written.event)}\n`,
      },
    ]);
    expect(() =>
      appendRuntimeVerificationLogEvent(
        {
          ...baseLogInput,
          requirement_id: null,
          test_oracle_id: null,
        },
        {
          repoRoot: "/repo",
          appendText: () => {
            throw new Error("should not write incomplete events");
          },
        },
      ),
    ).toThrow(/incomplete/);
  });
});

import { describe, expect, it } from "vitest";
import { sha256Digest } from "../src/runtime/digest";
import {
  validateWindowsCanaryAdmissionPolicy,
  validateWindowsCanaryLeaseBinding,
} from "../src/runtime/windows-lite-canary-admission";

// PLAN-L7-696-windows-canary-policy-lease / Issue #1134

const HEAD = "a".repeat(40);
const digest = (seed: string) => sha256Digest(seed);

function policy() {
  return {
    schema_version: "helix-windows-lite-canary-admission.v1",
    policy_id: "windows-lite-canary-heavy",
    policy_version: "1.0.0",
    lane_id: "windows-lite-canary",
    max_active: 1,
    max_waiting: 4,
    lease_ttl_ms: 120_000,
    heartbeat_interval_ms: 30_000,
    backpressure_disposition: "retryable",
    measurement_window: { window_id: "rolling-100", sample_limit: 100 },
  };
}

function binding() {
  return {
    schema_version: "helix-windows-lite-canary-lease-binding.v1",
    assignment_id: "assignment-1134",
    pr_number: 1134,
    candidate_head: HEAD,
    linux_artifact_digest: digest("artifact"),
    profile_digest: digest("profile"),
    lane_id: "windows-lite-canary",
    run_id: "run-3315",
    run_attempt: 1,
    owner: "windows-runner-1",
    lease_id: "lease-1134-1",
    fence_token: 7,
    correlation_id: "correlation-1134",
    issued_at: "2026-08-28T07:30:00.000Z",
    expires_at: "2026-08-28T07:32:00.000Z",
  };
}

describe("Windows Lite canary admission policy／lease binding", () => {
  it("U-WLCA-001: exact policy schemaとbound／TTL関係だけを受理する", () => {
    const valid = validateWindowsCanaryAdmissionPolicy(policy());
    expect(valid.ok).toBe(true);
    if (!valid.ok) throw new Error(valid.failure_code);
    expect(Object.isFrozen(valid.policy)).toBe(true);
    expect(Object.isFrozen(valid.policy.measurement_window)).toBe(true);

    for (const invalid of [
      { ...policy(), max_active: 0 },
      { ...policy(), max_waiting: -1 },
      { ...policy(), heartbeat_interval_ms: 120_000 },
      { ...policy(), unknown: true },
      { ...policy(), measurement_window: { window_id: "rolling-100", sample_limit: 0 } },
    ]) {
      expect(validateWindowsCanaryAdmissionPolicy(invalid)).toEqual({
        ok: false,
        failure_code: "WINDOWS_CANARY_POLICY_INVALID",
      });
    }
  });

  it("U-WLCA-005: lease bindingのidentity／HEAD／artifact／owner／fenceをexact照合する", () => {
    const valid = validateWindowsCanaryLeaseBinding(binding());
    expect(valid.ok).toBe(true);
    if (!valid.ok) throw new Error(valid.failure_code);
    expect(Object.isFrozen(valid.binding)).toBe(true);

    for (const invalid of [
      { ...binding(), candidate_head: "bad" },
      { ...binding(), linux_artifact_digest: "sha256:bad" },
      { ...binding(), fence_token: 0 },
      { ...binding(), owner: "" },
      { ...binding(), extra: "not-allowed" },
    ]) {
      expect(validateWindowsCanaryLeaseBinding(invalid)).toEqual({
        ok: false,
        failure_code: "WINDOWS_CANARY_LEASE_BINDING_INVALID",
      });
    }
  });

  it("U-WLCA-009: run attemptとlease時間順序を推測せずfail-closeする", () => {
    for (const invalid of [
      { ...binding(), run_attempt: 0 },
      { ...binding(), run_attempt: 1.5 },
      { ...binding(), run_attempt: undefined },
      { ...binding(), expires_at: "2026-08-28T07:29:59.000Z" },
      { ...binding(), issued_at: "not-a-time" },
    ]) {
      expect(validateWindowsCanaryLeaseBinding(invalid)).toEqual({
        ok: false,
        failure_code: "WINDOWS_CANARY_LEASE_BINDING_INVALID",
      });
    }
  });

  it("U-WLCA-014: validatorは入力を変更せずdeep-frozen copyを返す", () => {
    const input = policy();
    const before = structuredClone(input);
    const result = validateWindowsCanaryAdmissionPolicy(input);
    expect(result.ok).toBe(true);
    expect(input).toEqual(before);
    expect(Object.isFrozen(input)).toBe(false);
    if (!result.ok) throw new Error(result.failure_code);
    expect(result.policy).not.toBe(input);
    expect(result.policy_digest).toMatch(/^sha256:[a-f0-9]{64}$/u);
  });
});

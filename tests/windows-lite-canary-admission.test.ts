import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { sha256Digest } from "../src/runtime/digest";
import {
  evaluateWindowsCanaryCompletion,
  evaluateWindowsCanaryLease,
  evaluateWindowsCanaryQueue,
  validateWindowsCanaryAdmissionPolicy,
  validateWindowsCanaryLeaseBinding,
} from "../src/runtime/windows-lite-canary-admission";

// PLAN-L7-696-windows-canary-policy-lease / Issue #1134
// PLAN-L7-697-windows-canary-queue-expiry / Issue #1135

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

function queueBinding(seed: string, overrides: Record<string, unknown> = {}) {
  return {
    ...binding(),
    assignment_id: `assignment-${seed}`,
    pr_number: Number(seed),
    run_id: `run-${seed}`,
    lease_id: `lease-${seed}`,
    correlation_id: `correlation-${seed}`,
    ...overrides,
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
    const source = readFileSync("src/runtime/windows-lite-canary-admission.ts", "utf8");
    expect(source).toContain("validateWorkGraphLease");
    expect(source).not.toContain("acquireWorkGraphLease");

    const valid = validateWindowsCanaryLeaseBinding(binding());
    expect(valid.ok).toBe(true);
    if (!valid.ok) throw new Error(valid.failure_code);
    expect(Object.isFrozen(valid.binding)).toBe(true);

    for (const invalid of [
      { ...binding(), schema_version: "helix-windows-lite-canary-lease-binding.v2" },
      { ...binding(), pr_number: 0 },
      { ...binding(), candidate_head: "bad" },
      { ...binding(), linux_artifact_digest: "sha256:bad" },
      { ...binding(), profile_digest: "sha256:bad" },
      { ...binding(), lane_id: "other-lane" },
      { ...binding(), run_id: "" },
      { ...binding(), lease_id: "" },
      { ...binding(), fence_token: 0 },
      { ...binding(), owner: "" },
      { ...binding(), correlation_id: "" },
      { ...binding(), extra: "not-allowed" },
    ]) {
      expect(validateWindowsCanaryLeaseBinding(invalid)).toEqual({
        ok: false,
        failure_code: "WINDOWS_CANARY_LEASE_BINDING_INVALID",
      });
    }

    for (const key of Object.keys(binding())) {
      const invalid = { ...binding() } as Record<string, unknown>;
      delete invalid[key];
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
      { ...binding(), issued_at: "2026-02-30T00:00:00.000Z" },
      { ...binding(), issued_at: "2026-08-28" },
      { ...binding(), issued_at: "08/28/2026" },
      { ...binding(), issued_at: "2026-08-28T07:30:00+00:00" },
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
    expect(result.policy_digest).toBe(
      "sha256:a671e28fc8539a04e4abeb535dd9d5885d1bc976494b78f307cdfaf45386e5a2",
    );

    const reversedPolicy = Object.fromEntries(Object.entries(policy()).reverse());
    const reorderedPolicy = validateWindowsCanaryAdmissionPolicy(reversedPolicy);
    expect(reorderedPolicy.ok).toBe(true);
    if (!reorderedPolicy.ok) throw new Error(reorderedPolicy.failure_code);
    expect(reorderedPolicy.policy_digest).toBe(result.policy_digest);

    const bindingInput = binding();
    const bindingBefore = structuredClone(bindingInput);
    const bindingResult = validateWindowsCanaryLeaseBinding(bindingInput);
    expect(bindingResult.ok).toBe(true);
    expect(bindingInput).toEqual(bindingBefore);
    expect(Object.isFrozen(bindingInput)).toBe(false);
    if (!bindingResult.ok) throw new Error(bindingResult.failure_code);
    expect(Object.isFrozen(bindingResult.binding)).toBe(true);
    expect(bindingResult.binding_digest).toBe(
      "sha256:6d81ee2c11608a4c7465b05ef6bd382f52a1cbb3cd5ef660ed0e871e6245fbe8",
    );
    const reorderedBinding = validateWindowsCanaryLeaseBinding(
      Object.fromEntries(Object.entries(binding()).reverse()),
    );
    expect(reorderedBinding.ok).toBe(true);
    if (!reorderedBinding.ok) throw new Error(reorderedBinding.failure_code);
    expect(reorderedBinding.binding_digest).toBe(bindingResult.binding_digest);
  });
});

describe("Windows Lite canary bounded queue／expiry", () => {
  it("bounded queueの統合挙動を決定的に評価する", () => {
    const first = queueBinding("1");
    const second = queueBinding("2");
    const admitted = evaluateWindowsCanaryQueue({
      policy: policy(),
      state: { state_known: true, active: [first], waiting: [] },
      candidate: second,
    });
    expect(admitted.ok).toBe(true);
    if (!admitted.ok) throw new Error(admitted.failure_code);
    expect(admitted.disposition).toBe("queued");
    expect(admitted.waiting.map((item) => item.assignment_id)).toEqual(["assignment-2"]);

    expect(
      evaluateWindowsCanaryQueue({
        policy: { ...policy(), max_waiting: 1 },
        state: { state_known: true, active: [queueBinding("7")], waiting: [first] },
        candidate: second,
      }),
    ).toEqual({ ok: false, failure_code: "WINDOWS_CANARY_QUEUE_BACKPRESSURED" });
    expect(
      evaluateWindowsCanaryQueue({
        policy: policy(),
        state: { state_known: true, active: [first], waiting: [] },
        candidate: second,
      }),
    ).toMatchObject({ ok: true, disposition: "queued" });
  });

  it("duplicateと不確実stateをfail-closeする", () => {
    const candidate = queueBinding("3");
    expect(
      evaluateWindowsCanaryQueue({
        policy: policy(),
        state: { state_known: false, active: [], waiting: [] },
        candidate,
      }),
    ).toEqual({ ok: false, failure_code: "WINDOWS_CANARY_STATE_UNCERTAIN" });
    expect(
      evaluateWindowsCanaryQueue({
        policy: policy(),
        state: { state_known: true, active: [candidate], waiting: [] },
        candidate,
      }),
    ).toEqual({ ok: false, failure_code: "WINDOWS_CANARY_DUPLICATE_ASSIGNMENT" });
  });

  it("expiry、heartbeat、owner、fenceをcurrent snapshotへ照合する", () => {
    const current = queueBinding("4");
    expect(
      evaluateWindowsCanaryLease({
        policy: policy(),
        binding: current,
        current,
        observed_at: "2026-08-28T07:31:00.000Z",
        last_heartbeat_at: "2026-08-28T07:30:45.000Z",
      }),
    ).toMatchObject({ ok: true });
    expect(
      evaluateWindowsCanaryLease({
        policy: policy(),
        binding: current,
        current,
        observed_at: current.expires_at,
        last_heartbeat_at: "2026-08-28T07:31:59.000Z",
      }),
    ).toEqual({ ok: false, failure_code: "WINDOWS_CANARY_LEASE_EXPIRED" });
    expect(
      evaluateWindowsCanaryLease({
        policy: policy(),
        binding: current,
        current: { ...current, fence_token: current.fence_token + 1 },
        observed_at: "2026-08-28T07:31:00.000Z",
        last_heartbeat_at: "2026-08-28T07:30:45.000Z",
      }),
    ).toEqual({ ok: false, failure_code: "WINDOWS_CANARY_STALE_FENCE" });
  });

  it("completionをHEAD／artifact／profile／attemptへexact bindする", () => {
    const current = queueBinding("5");
    expect(
      evaluateWindowsCanaryCompletion({ expected: current, completed: current }),
    ).toMatchObject({
      ok: true,
    });
    for (const completed of [
      { ...current, candidate_head: "b".repeat(40) },
      { ...current, linux_artifact_digest: digest("other") },
      { ...current, profile_digest: digest("other-profile") },
      { ...current, run_attempt: 2 },
      { ...current, expires_at: "2026-08-28T07:33:00.000Z" },
    ]) {
      expect(evaluateWindowsCanaryCompletion({ expected: current, completed })).toEqual({
        ok: false,
        failure_code: "WINDOWS_CANARY_COMPLETION_BINDING_MISMATCH",
      });
    }
  });

  it("U-WLCA-015: policy failureを後段のqueue successで相殺しない", () => {
    expect(
      evaluateWindowsCanaryQueue({
        policy: { ...policy(), max_active: 0 },
        state: { state_known: true, active: [], waiting: [] },
        candidate: queueBinding("6"),
      }),
    ).toEqual({ ok: false, failure_code: "WINDOWS_CANARY_POLICY_INVALID" });
  });

  it("U-WLCA-002: active bound到達時はcandidateをwaitingへ送る", () => {
    const result = evaluateWindowsCanaryQueue({
      policy: policy(),
      state: { state_known: true, active: [queueBinding("21")], waiting: [] },
      candidate: queueBinding("22"),
    });
    expect(result).toMatchObject({ ok: true, disposition: "queued" });
  });

  it("U-WLCA-003: waiting bound到達時はbackpressureする", () => {
    const result = evaluateWindowsCanaryQueue({
      policy: { ...policy(), max_waiting: 1 },
      state: { state_known: true, active: [queueBinding("23")], waiting: [queueBinding("24")] },
      candidate: queueBinding("25"),
    });
    expect(result).toEqual({ ok: false, failure_code: "WINDOWS_CANARY_QUEUE_BACKPRESSURED" });
  });

  it("U-WLCA-004: duplicate assignmentを拒否する", () => {
    const candidate = queueBinding("26");
    expect(
      evaluateWindowsCanaryQueue({
        policy: policy(),
        state: { state_known: true, active: [candidate], waiting: [] },
        candidate,
      }),
    ).toEqual({ ok: false, failure_code: "WINDOWS_CANARY_DUPLICATE_ASSIGNMENT" });
  });

  it("U-WLCA-006: expiryとpolicy由来heartbeat interval超過を拒否する", () => {
    const current = queueBinding("27");
    expect(
      evaluateWindowsCanaryLease({
        policy: policy(),
        binding: current,
        current,
        observed_at: "2026-08-28T07:29:59.999Z",
        last_heartbeat_at: "2026-08-28T07:29:59.999Z",
      }),
    ).toEqual({ ok: false, failure_code: "WINDOWS_CANARY_STATE_UNCERTAIN" });
    expect(
      evaluateWindowsCanaryLease({
        policy: policy(),
        binding: current,
        current,
        observed_at: "2026-08-28T07:30:10.000Z",
        last_heartbeat_at: "2026-08-28T07:29:59.999Z",
      }),
    ).toEqual({ ok: false, failure_code: "WINDOWS_CANARY_HEARTBEAT_STALE" });
    expect(
      evaluateWindowsCanaryLease({
        policy: policy(),
        binding: current,
        current,
        observed_at: current.expires_at,
        last_heartbeat_at: current.issued_at,
      }),
    ).toEqual({ ok: false, failure_code: "WINDOWS_CANARY_LEASE_EXPIRED" });
    expect(
      evaluateWindowsCanaryLease({
        policy: { ...policy(), heartbeat_interval_ms: 30_000 },
        binding: current,
        current,
        observed_at: "2026-08-28T07:31:00.001Z",
        last_heartbeat_at: "2026-08-28T07:30:30.000Z",
      }),
    ).toEqual({ ok: false, failure_code: "WINDOWS_CANARY_HEARTBEAT_STALE" });
  });

  it("U-WLCA-007: stale fenceを拒否する", () => {
    const current = queueBinding("28");
    expect(
      evaluateWindowsCanaryLease({
        policy: policy(),
        binding: current,
        current: { ...current, fence_token: 8 },
        observed_at: "2026-08-28T07:31:00.000Z",
        last_heartbeat_at: "2026-08-28T07:30:45.000Z",
      }),
    ).toEqual({ ok: false, failure_code: "WINDOWS_CANARY_STALE_FENCE" });
  });

  it("U-WLCA-008: leaseとcompletionのwrong bindingを拒否する", () => {
    const current = queueBinding("29");
    for (const stale of [
      { ...current, assignment_id: "assignment-other" },
      { ...current, candidate_head: "b".repeat(40) },
      { ...current, linux_artifact_digest: digest("wrong") },
      { ...current, profile_digest: digest("wrong-profile") },
      { ...current, run_attempt: current.run_attempt + 1 },
    ]) {
      expect(
        evaluateWindowsCanaryLease({
          policy: policy(),
          binding: stale,
          current,
          observed_at: "2026-08-28T07:31:00.000Z",
          last_heartbeat_at: "2026-08-28T07:30:45.000Z",
        }),
      ).toEqual({ ok: false, failure_code: "WINDOWS_CANARY_LEASE_BINDING_MISMATCH" });
    }
    expect(
      evaluateWindowsCanaryCompletion({
        expected: current,
        completed: { ...current, linux_artifact_digest: digest("wrong") },
      }),
    ).toEqual({ ok: false, failure_code: "WINDOWS_CANARY_COMPLETION_BINDING_MISMATCH" });
  });

  it("U-WLCA-010: unknown stateを拒否する", () => {
    expect(
      evaluateWindowsCanaryQueue({
        policy: policy(),
        state: { state_known: false, active: [], waiting: [] },
        candidate: queueBinding("30"),
      }),
    ).toEqual({ ok: false, failure_code: "WINDOWS_CANARY_STATE_UNCERTAIN" });
    expect(
      evaluateWindowsCanaryQueue({
        policy: policy(),
        state: { state_known: true, active: [], waiting: [], unknown: true },
        candidate: queueBinding("31"),
      }),
    ).toEqual({ ok: false, failure_code: "WINDOWS_CANARY_STATE_UNCERTAIN" });
    expect(
      evaluateWindowsCanaryQueue({
        policy: policy(),
        state: { state_known: true, active: [], waiting: [] },
        candidate: { ...queueBinding("32"), run_attempt: 0 },
      }),
    ).toEqual({ ok: false, failure_code: "WINDOWS_CANARY_LEASE_BINDING_INVALID" });
  });
});

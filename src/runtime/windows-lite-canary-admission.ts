import { canonicalJson, type Sha256Digest, sha256Digest } from "./digest";
import { validateWorkGraphLease } from "./work-graph-receipt-acceptance";

export type WindowsCanaryAdmissionFailureCode =
  | "WINDOWS_CANARY_POLICY_INVALID"
  | "WINDOWS_CANARY_LEASE_BINDING_INVALID";

export interface WindowsCanaryAdmissionPolicyV1 {
  readonly schema_version: "helix-windows-lite-canary-admission.v1";
  readonly policy_id: string;
  readonly policy_version: string;
  readonly lane_id: "windows-lite-canary";
  readonly max_active: number;
  readonly max_waiting: number;
  readonly lease_ttl_ms: number;
  readonly heartbeat_interval_ms: number;
  readonly backpressure_disposition: "retryable" | "fail_close";
  readonly measurement_window: {
    readonly window_id: string;
    readonly sample_limit: number;
  };
}

export interface WindowsCanaryLeaseBindingV1 {
  readonly schema_version: "helix-windows-lite-canary-lease-binding.v1";
  readonly assignment_id: string;
  readonly pr_number: number;
  readonly candidate_head: string;
  readonly linux_artifact_digest: Sha256Digest;
  readonly profile_digest: Sha256Digest;
  readonly lane_id: "windows-lite-canary";
  readonly run_id: string;
  readonly run_attempt: number;
  readonly owner: string;
  readonly lease_id: string;
  readonly fence_token: number;
  readonly correlation_id: string;
  readonly issued_at: string;
  readonly expires_at: string;
}

export type WindowsCanaryPolicyValidationResult =
  | {
      readonly ok: true;
      readonly policy: WindowsCanaryAdmissionPolicyV1;
      readonly policy_digest: Sha256Digest;
    }
  | { readonly ok: false; readonly failure_code: "WINDOWS_CANARY_POLICY_INVALID" };

export type WindowsCanaryLeaseBindingValidationResult =
  | {
      readonly ok: true;
      readonly binding: WindowsCanaryLeaseBindingV1;
      readonly binding_digest: Sha256Digest;
    }
  | { readonly ok: false; readonly failure_code: "WINDOWS_CANARY_LEASE_BINDING_INVALID" };

const POLICY_KEYS = [
  "backpressure_disposition",
  "heartbeat_interval_ms",
  "lane_id",
  "lease_ttl_ms",
  "max_active",
  "max_waiting",
  "measurement_window",
  "policy_id",
  "policy_version",
  "schema_version",
] as const;
const WINDOW_KEYS = ["sample_limit", "window_id"] as const;
const BINDING_KEYS = [
  "assignment_id",
  "candidate_head",
  "correlation_id",
  "expires_at",
  "fence_token",
  "issued_at",
  "lane_id",
  "lease_id",
  "linux_artifact_digest",
  "owner",
  "pr_number",
  "profile_digest",
  "run_attempt",
  "run_id",
  "schema_version",
] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function exactKeys(value: Record<string, unknown>, expected: readonly string[]): boolean {
  const actual = Object.keys(value).sort();
  const canonical = [...expected].sort();
  return (
    actual.length === canonical.length && actual.every((key, index) => key === canonical[index])
  );
}

function validIdentifier(value: unknown): value is string {
  return typeof value === "string" && /^[A-Za-z0-9][A-Za-z0-9._:/-]{0,127}$/u.test(value);
}

function validDigest(value: unknown): value is Sha256Digest {
  return typeof value === "string" && /^sha256:[a-f0-9]{64}$/u.test(value);
}

function positiveInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value > 0;
}

function validTimestamp(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) && new Date(parsed).toISOString() === value;
}

function deepFreeze<T>(value: T): T {
  if (Array.isArray(value)) {
    for (const item of value) deepFreeze(item);
    return Object.freeze(value);
  }
  if (typeof value === "object" && value !== null) {
    for (const item of Object.values(value)) deepFreeze(item);
    return Object.freeze(value);
  }
  return value;
}

export function validateWindowsCanaryAdmissionPolicy(
  value: unknown,
): WindowsCanaryPolicyValidationResult {
  if (!isRecord(value) || !exactKeys(value, POLICY_KEYS)) {
    return { ok: false, failure_code: "WINDOWS_CANARY_POLICY_INVALID" };
  }
  const window = value.measurement_window;
  if (
    value.schema_version !== "helix-windows-lite-canary-admission.v1" ||
    !validIdentifier(value.policy_id) ||
    !validIdentifier(value.policy_version) ||
    value.lane_id !== "windows-lite-canary" ||
    !positiveInteger(value.max_active) ||
    !positiveInteger(value.max_waiting) ||
    !positiveInteger(value.lease_ttl_ms) ||
    !positiveInteger(value.heartbeat_interval_ms) ||
    value.heartbeat_interval_ms >= value.lease_ttl_ms ||
    (value.backpressure_disposition !== "retryable" &&
      value.backpressure_disposition !== "fail_close") ||
    !isRecord(window) ||
    !exactKeys(window, WINDOW_KEYS) ||
    !validIdentifier(window.window_id) ||
    !positiveInteger(window.sample_limit)
  ) {
    return { ok: false, failure_code: "WINDOWS_CANARY_POLICY_INVALID" };
  }

  const policy = deepFreeze({
    schema_version: value.schema_version,
    policy_id: value.policy_id,
    policy_version: value.policy_version,
    lane_id: value.lane_id,
    max_active: value.max_active,
    max_waiting: value.max_waiting,
    lease_ttl_ms: value.lease_ttl_ms,
    heartbeat_interval_ms: value.heartbeat_interval_ms,
    backpressure_disposition: value.backpressure_disposition,
    measurement_window: {
      window_id: window.window_id,
      sample_limit: window.sample_limit,
    },
  } satisfies WindowsCanaryAdmissionPolicyV1);
  return { ok: true, policy, policy_digest: sha256Digest(canonicalJson(policy)) };
}

export function validateWindowsCanaryLeaseBinding(
  value: unknown,
): WindowsCanaryLeaseBindingValidationResult {
  if (!isRecord(value) || !exactKeys(value, BINDING_KEYS)) {
    return { ok: false, failure_code: "WINDOWS_CANARY_LEASE_BINDING_INVALID" };
  }
  if (
    value.schema_version !== "helix-windows-lite-canary-lease-binding.v1" ||
    !validIdentifier(value.assignment_id) ||
    !positiveInteger(value.pr_number) ||
    typeof value.candidate_head !== "string" ||
    !/^[a-f0-9]{40}$/u.test(value.candidate_head) ||
    !validDigest(value.linux_artifact_digest) ||
    !validDigest(value.profile_digest) ||
    value.lane_id !== "windows-lite-canary" ||
    !validIdentifier(value.run_id) ||
    !positiveInteger(value.run_attempt) ||
    !validIdentifier(value.owner) ||
    !validIdentifier(value.lease_id) ||
    !positiveInteger(value.fence_token) ||
    !validIdentifier(value.correlation_id) ||
    !validTimestamp(value.issued_at) ||
    !validTimestamp(value.expires_at)
  ) {
    return { ok: false, failure_code: "WINDOWS_CANARY_LEASE_BINDING_INVALID" };
  }
  if (
    !validateWorkGraphLease({
      acquired_at: value.issued_at,
      fence_token: value.fence_token,
      owner: value.owner,
    })
  ) {
    return { ok: false, failure_code: "WINDOWS_CANARY_LEASE_BINDING_INVALID" };
  }
  if (Date.parse(value.expires_at) <= Date.parse(value.issued_at)) {
    return { ok: false, failure_code: "WINDOWS_CANARY_LEASE_BINDING_INVALID" };
  }

  const binding = Object.freeze({
    schema_version: value.schema_version,
    assignment_id: value.assignment_id,
    pr_number: value.pr_number,
    candidate_head: value.candidate_head,
    linux_artifact_digest: value.linux_artifact_digest,
    profile_digest: value.profile_digest,
    lane_id: value.lane_id,
    run_id: value.run_id,
    run_attempt: value.run_attempt,
    owner: value.owner,
    lease_id: value.lease_id,
    fence_token: value.fence_token,
    correlation_id: value.correlation_id,
    issued_at: value.issued_at,
    expires_at: value.expires_at,
  } satisfies WindowsCanaryLeaseBindingV1);
  return { ok: true, binding, binding_digest: sha256Digest(canonicalJson(binding)) };
}

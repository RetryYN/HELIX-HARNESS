import { describe, expect, it } from "vitest";
import {
  CODEX_NATIVE_WORKER_POLICY_DIGEST,
  CODEX_NATIVE_WORKER_POLICY_SCHEMA,
  CODEX_NATIVE_WORKER_POLICY_VERSION,
  parseCodexNativeWorkerPolicy,
  resolveCodexNativeWorkerPolicy,
} from "../src/runtime/codex-native-worker-policy";

// PLAN-L7-640-luna-native-spawn-admission / U-LUNASPAWN-006..008

describe("Codex native worker policy provenance", () => {
  it("U-LUNASPAWN-006: current Luna/xhigh policyをversionとdigestへ束縛する", () => {
    expect(resolveCodexNativeWorkerPolicy()).toEqual({
      schema_version: CODEX_NATIVE_WORKER_POLICY_SCHEMA,
      policy_version: CODEX_NATIVE_WORKER_POLICY_VERSION,
      model: "gpt-5.6-luna",
      reasoning_effort: "xhigh",
      policy_digest: CODEX_NATIVE_WORKER_POLICY_DIGEST,
    });
  });

  it("U-LUNASPAWN-007: stale versionとdigest driftをfail-closeする", () => {
    const current = resolveCodexNativeWorkerPolicy();
    const { policy_digest: _digest, ...payload } = current;
    expect(() =>
      parseCodexNativeWorkerPolicy({ ...payload, policy_version: "0.9.0" }, current.policy_digest),
    ).toThrow("codex_native_worker_policy_invalid");
    expect(() => parseCodexNativeWorkerPolicy(payload, `sha256:${"0".repeat(64)}`)).toThrow(
      "codex_native_worker_policy_digest_mismatch",
    );
  });

  it("U-LUNASPAWN-008: caller由来の別model／effortをpolicyへ昇格しない", () => {
    const current = resolveCodexNativeWorkerPolicy();
    const { policy_digest: _digest, ...payload } = current;
    expect(() =>
      parseCodexNativeWorkerPolicy({ ...payload, model: "gpt-5.6-sol" }, current.policy_digest),
    ).toThrow("codex_native_worker_policy_invalid");
    expect(() =>
      parseCodexNativeWorkerPolicy({ ...payload, reasoning_effort: "high" }, current.policy_digest),
    ).toThrow("codex_native_worker_policy_invalid");
  });
});

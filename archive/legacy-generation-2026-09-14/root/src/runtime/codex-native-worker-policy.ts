import { createHash } from "node:crypto";
import { MODEL_IDS } from "../schema/model-registry";

export const CODEX_NATIVE_WORKER_POLICY_SCHEMA = "helix-codex-native-worker-policy.v1" as const;
export const CODEX_NATIVE_WORKER_POLICY_VERSION = "1.0.0" as const;
export const CODEX_NATIVE_WORKER_POLICY_DIGEST =
  "sha256:c826936d9c39da5956414fc12cc73424eb801afed1f6cbdf90f09dfc466af6bb" as const;

export interface CodexNativeWorkerPolicy {
  schema_version: typeof CODEX_NATIVE_WORKER_POLICY_SCHEMA;
  policy_version: typeof CODEX_NATIVE_WORKER_POLICY_VERSION;
  model: string;
  reasoning_effort: "xhigh";
  policy_digest: `sha256:${string}`;
}

type PolicyPayload = Omit<CodexNativeWorkerPolicy, "policy_digest">;

const RAW_POLICY: PolicyPayload = {
  schema_version: CODEX_NATIVE_WORKER_POLICY_SCHEMA,
  policy_version: CODEX_NATIVE_WORKER_POLICY_VERSION,
  model: MODEL_IDS.codex.worker,
  reasoning_effort: "xhigh",
};

function digestPolicy(policy: PolicyPayload): `sha256:${string}` {
  return `sha256:${createHash("sha256").update(JSON.stringify(policy)).digest("hex")}`;
}

export function parseCodexNativeWorkerPolicy(
  raw: unknown,
  expectedDigest: string,
): CodexNativeWorkerPolicy {
  if (raw === null || typeof raw !== "object" || Array.isArray(raw)) {
    throw new Error("codex_native_worker_policy_invalid");
  }
  const record = raw as Record<string, unknown>;
  if (
    Object.keys(record).sort().join("\0") !==
      ["model", "policy_version", "reasoning_effort", "schema_version"].sort().join("\0") ||
    record.schema_version !== CODEX_NATIVE_WORKER_POLICY_SCHEMA ||
    record.policy_version !== CODEX_NATIVE_WORKER_POLICY_VERSION ||
    record.model !== MODEL_IDS.codex.worker ||
    record.reasoning_effort !== "xhigh"
  ) {
    throw new Error("codex_native_worker_policy_invalid");
  }
  const payload = record as unknown as PolicyPayload;
  const policyDigest = digestPolicy(payload);
  if (policyDigest !== expectedDigest) {
    throw new Error("codex_native_worker_policy_digest_mismatch");
  }
  return { ...payload, policy_digest: policyDigest };
}

export function resolveCodexNativeWorkerPolicy(): CodexNativeWorkerPolicy {
  return parseCodexNativeWorkerPolicy(RAW_POLICY, CODEX_NATIVE_WORKER_POLICY_DIGEST);
}

import { createHash } from "node:crypto";

export type StableCauseKind = "error" | "string" | "object" | "primitive" | "inaccessible";

export type StableCauseDigest = {
  causeKind: StableCauseKind;
  digest: `sha256:${string}`;
  truncated: boolean;
};

const MAX_SCALAR_BYTES = 4096;

function boundedUtf8(value: string): { value: string; truncated: boolean } {
  const bytes = Buffer.from(value, "utf8");
  if (bytes.byteLength <= MAX_SCALAR_BYTES) return { value, truncated: false };
  return {
    value: bytes.subarray(0, MAX_SCALAR_BYTES).toString("utf8"),
    truncated: true,
  };
}

function digest(kind: StableCauseKind, scalar: string, truncated: boolean): StableCauseDigest {
  const hash = createHash("sha256").update(`${kind}\0${scalar}`, "utf8").digest("hex");
  return { causeKind: kind, digest: `sha256:${hash}`, truncated };
}

/**
 * 任意のthrow値をraw text非露出の診断識別子へ写す。Proxy/getter/coercion failureでもthrowしない。
 */
export function stableCauseDigest(cause: unknown): StableCauseDigest {
  try {
    if (typeof cause === "string") {
      const bounded = boundedUtf8(cause);
      return digest("string", bounded.value, bounded.truncated);
    }
    if (cause === null || cause === undefined || typeof cause !== "object") {
      const bounded = boundedUtf8(`${typeof cause}:${String(cause)}`);
      return digest("primitive", bounded.value, bounded.truncated);
    }
    try {
      if (cause instanceof Error) {
        const name = boundedUtf8(typeof cause.name === "string" ? cause.name : "Error");
        const message = boundedUtf8(typeof cause.message === "string" ? cause.message : "");
        return digest(
          "error",
          `${name.value}\0${message.value}`,
          name.truncated || message.truncated,
        );
      }
    } catch {
      return digest("inaccessible", "object", false);
    }
    return digest("object", "object", false);
  } catch {
    return digest("inaccessible", "unknown", false);
  }
}

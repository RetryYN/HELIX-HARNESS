import { createHash } from "node:crypto";

export type StableCauseKind = "error" | "string" | "object" | "primitive" | "inaccessible";

export type StableCauseDigest = {
  causeKind: StableCauseKind;
  digest: `sha256:${string}`;
  truncated: boolean;
};

function digest(kind: StableCauseKind, safeClass: string, truncated = false): StableCauseDigest {
  const canonical = `helix.doctor.cause.v1\0${kind}\0${safeClass}`;
  const hash = createHash("sha256").update(canonical, "utf8").digest("hex");
  return { causeKind: kind, digest: `sha256:${hash}`, truncated };
}

/**
 * 任意のthrow値をraw text非露出の診断識別子へ写す。Proxy/getter/coercion failureでもthrowしない。
 */
export function stableCauseDigest(cause: unknown): StableCauseDigest {
  try {
    if (typeof cause === "string") {
      const bucket = cause.length === 0 ? "empty" : cause.length <= 64 ? "short" : "long";
      return digest("string", bucket);
    }
    if (cause === null) return digest("primitive", "null");
    const primitiveType = typeof cause;
    if (primitiveType !== "object" && primitiveType !== "function") {
      const safeClass =
        primitiveType === "number"
          ? Number.isNaN(cause)
            ? "number:nan"
            : cause === Number.POSITIVE_INFINITY
              ? "number:pos_inf"
              : cause === Number.NEGATIVE_INFINITY
                ? "number:neg_inf"
                : "number:finite"
          : primitiveType;
      return digest("primitive", safeClass);
    }
    try {
      if (cause instanceof Error) {
        return digest("error", "error");
      }
    } catch {
      return digest("inaccessible", "object", false);
    }
    return digest("object", primitiveType === "function" ? "function" : "object");
  } catch {
    return digest("inaccessible", "unknown");
  }
}

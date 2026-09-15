import { sha256Digest } from "./digest";

export type StableCauseKind = "error" | "string" | "object" | "primitive" | "inaccessible";

export type StableCauseDigest = {
  causeKind: StableCauseKind;
  digest: `sha256:${string}`;
  truncated: boolean;
};

const FALLBACK_DIGEST: StableCauseDigest = {
  causeKind: "inaccessible",
  digest: "sha256:6cf9c013c17f18e7d5374a090c9130af0d8a5d26c4d0a155daebca543cb476f6",
  truncated: false,
};

function digest(kind: StableCauseKind, safeClass: string, truncated = false): StableCauseDigest {
  try {
    const canonical = `helix.doctor.cause.v1\0${kind}\0${safeClass}`;
    return { causeKind: kind, digest: sha256Digest(canonical), truncated };
  } catch {
    return FALLBACK_DIGEST;
  }
}

const ERROR_NAMES = new Set(["Error", "TypeError", "SyntaxError", "RangeError", "ReferenceError"]);
const ERROR_CODES = new Set([
  "ENOENT",
  "EACCES",
  "EPERM",
  "SQLITE_BUSY",
  "SQLITE_LOCKED",
  "ERR_SQLITE_ERROR",
]);

function safeErrorClass(error: Error): string | null {
  try {
    const nameValue: unknown = error.name;
    const codeValue: unknown = (error as Error & { code?: unknown }).code;
    const name =
      typeof nameValue === "string" && ERROR_NAMES.has(nameValue) ? nameValue : "OtherError";
    const code = typeof codeValue === "string" && ERROR_CODES.has(codeValue) ? codeValue : "other";
    return `${name}:${code}`;
  } catch {
    return null;
  }
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
        const safeClass = safeErrorClass(cause);
        return safeClass === null
          ? digest("inaccessible", "error-metadata")
          : digest("error", safeClass);
      }
    } catch {
      return digest("inaccessible", "object", false);
    }
    return digest("object", primitiveType === "function" ? "function" : "object");
  } catch {
    return FALLBACK_DIGEST;
  }
}

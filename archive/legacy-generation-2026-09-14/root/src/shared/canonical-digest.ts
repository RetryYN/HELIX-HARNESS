import { createHash } from "node:crypto";

export type Sha256Digest = `sha256:${string}`;

export function sha256Digest(value: string | Uint8Array): Sha256Digest {
  return `sha256:${createHash("sha256").update(value).digest("hex")}`;
}

export function canonicalJson(value: unknown, invalidMessage = "value is not JSON"): string {
  return canonicalJsonValue(value, invalidMessage, new Set<object>());
}

function canonicalJsonValue(
  value: unknown,
  invalidMessage: string,
  ancestors: Set<object>,
): string {
  if (value === null || typeof value === "boolean" || typeof value === "string") {
    return JSON.stringify(value);
  }
  if (typeof value === "number" && Number.isFinite(value)) return JSON.stringify(value);
  if (typeof value === "object" && value !== null) {
    if (ancestors.has(value)) throw new Error(invalidMessage);
    ancestors.add(value);
  }
  if (Array.isArray(value)) {
    try {
      return `[${value.map((item) => canonicalJsonValue(item, invalidMessage, ancestors)).join(",")}]`;
    } finally {
      ancestors.delete(value);
    }
  }
  if (typeof value !== "object") throw new Error(invalidMessage);
  const record = value as Record<string, unknown>;
  try {
    return `{${Object.keys(record)
      .sort()
      .map(
        (key) =>
          `${JSON.stringify(key)}:${canonicalJsonValue(record[key], invalidMessage, ancestors)}`,
      )
      .join(",")}}`;
  } finally {
    ancestors.delete(value);
  }
}

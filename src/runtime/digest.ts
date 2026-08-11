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

/**
 * locale非依存のbytewise全順序 (Issue #309)。
 *
 * `localeCompare` は ICU collation に依存するため 2 つの問題がある。
 * 1. 既定 locale ですら code-point 順と一致しない (`"aCode"` < `"BCode"` を返す)。
 * 2. U+0000 等の completely-ignorable 文字が照合で無視される。区切り文字として
 *    `\0` を挟んだ複合キーは区切りが効かず、異なるキーが等価と判定される。
 * 3. UTF-8変換はlone surrogateをU+FFFDへ置換するため、異なるJavaScript文字列が
 *    同じbyte列になる。byte比較が同値のときはUTF-16 code unitでtie-breakする。
 *
 * comparator が 0 を返した要素は `Array.prototype.sort` の安定性で入力順のまま残るため、
 * 2 は「入力順が変われば出力順も変わる」= digest 非決定性として顕在化する。
 * digest / Windows 互換検証へ載る整列は本関数を使う。
 */
export function compareBytewise(left: string, right: string): number {
  const utf8Order = Buffer.from(left, "utf8").compare(Buffer.from(right, "utf8"));
  if (utf8Order !== 0 || left === right) return utf8Order;

  // NodeのUTF-8変換はunpaired surrogateをU+FFFDへ置換するため、byte列だけでは
  // distinctな入力を区別できない。UTF-16 code unit列を安定したtie-breakに使う。
  const sharedLength = Math.min(left.length, right.length);
  for (let index = 0; index < sharedLength; index += 1) {
    const leftUnit = left.charCodeAt(index);
    const rightUnit = right.charCodeAt(index);
    if (leftUnit !== rightUnit) return leftUnit - rightUnit;
  }
  return left.length - right.length;
}

/** dynamic regex literalを安全に埋め込むための単一正本。 */
export function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * locale非依存のbytewise全順序 (Issue #309)。
 *
 * `localeCompare` は ICU collation に依存するため 2 つの問題がある。
 * 1. 既定 locale ですら code-point 順と一致しない (`"aCode"` < `"BCode"` を返す)。
 * 2. U+0000 等の completely-ignorable 文字が照合で無視される。区切り文字として
 *    `\0` を挟んだ複合キーは区切りが効かず、異なるキーが等価と判定される。
 *
 * comparator が 0 を返した要素は `Array.prototype.sort` の安定性で入力順のまま残るため、
 * 2 は「入力順が変われば出力順も変わる」= digest 非決定性として顕在化する。
 * digest / Windows 互換検証へ載る整列は本関数を使う。
 */
export function compareBytewise(left: string, right: string): number {
  return Buffer.from(left, "utf8").compare(Buffer.from(right, "utf8"));
}

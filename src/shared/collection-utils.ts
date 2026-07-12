/** machine ID/path向け: 重複除去後にlocale非依存のcode-unit昇順へ正規化する。 */
export function uniqueSorted<T extends string>(values: readonly T[]): T[] {
  return [...new Set(values)].sort();
}

/** 人間向け表示語向け: 重複除去後に実行localeのcollation順へ正規化する。 */
export function uniqueLocaleSorted(values: readonly string[]): string[] {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

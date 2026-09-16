/** SQLite driver間で異なるbusy/locked例外表現を単一契約へ正規化する。 */
export function isSqliteBusy(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const code = String((error as Error & { code?: unknown }).code ?? "");
  return /SQLITE_BUSY/i.test(code) || /database is locked|SQLITE_BUSY/i.test(error.message);
}

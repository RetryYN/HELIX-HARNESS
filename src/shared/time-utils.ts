/** 現在時刻をUTC ISO-8601で返す単一正本。 */
export function nowIso(): string {
  return new Date().toISOString();
}

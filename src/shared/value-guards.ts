/** array / nullを除外したplain JSON-like record判定の単一正本。 */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

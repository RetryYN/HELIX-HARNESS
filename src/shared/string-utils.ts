/** dynamic regex literalを安全に埋め込むための単一正本。 */
export function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

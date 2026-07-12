const SAFE_SHELL_TOKEN = /^[A-Za-z0-9_./:@+=,-]+$/;

/** POSIX shell command表示用の単一token quoting。command実行は可能ならexecFile系を優先する。 */
export function shellQuote(value: string): string {
  if (SAFE_SHELL_TOKEN.test(value)) return value;
  return `'${value.replace(/'/g, "'\\''")}'`;
}

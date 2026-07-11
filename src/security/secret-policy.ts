/**
 * secret 様 token の runtime 非依存 policy SSoT。
 *
 * lint / feedback / state-db のいずれにも所有させず、依存方向を
 * 各機能 module -> security の一方向に保つ。
 */
export const SECRET_PATTERN =
  /(\bsk-[A-Za-z0-9_-]{16,}|\bghp_[A-Za-z0-9_]{16,}|\bgithub_pat_[A-Za-z0-9_]{16,}|\bxox[baprs]-[A-Za-z0-9-]{16,})/;

export function isSecretLike(value: string): boolean {
  return SECRET_PATTERN.test(value);
}

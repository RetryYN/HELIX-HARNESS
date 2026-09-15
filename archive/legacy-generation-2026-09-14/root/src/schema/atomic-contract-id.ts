/**
 * requirements-owned atomic behavior contract identifier projection.
 *
 * Canonical form: 2..6 uppercase alphanumeric segments separated by one hyphen.
 */
export const ATOMIC_CONTRACT_ID_PATTERN = /^[A-Z][A-Z0-9]*(?:-[A-Z0-9]+){1,5}$/;

export function isAtomicContractId(value: unknown): value is string {
  return typeof value === "string" && ATOMIC_CONTRACT_ID_PATTERN.test(value);
}

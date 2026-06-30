export const SOURCE_LEDGER_MAX_AGE_DAYS = 90;

export function sourceLedgerHeadingPattern(ledgerLabel: string): RegExp {
  return new RegExp(`${escapeRegExp(ledgerLabel)} \\(checked \\d{4}-\\d{2}-\\d{2}\\)`);
}

export function hasSourceLedgerCheckedDate(text: string, ledgerLabel: string): boolean {
  return sourceLedgerHeadingPattern(ledgerLabel).test(text);
}

export function sourceLedgerCheckedDateViolation(
  text: string,
  ledgerLabel: string,
  now: string = new Date().toISOString(),
): string | null {
  const checkedDate = text.match(
    new RegExp(`${escapeRegExp(ledgerLabel)} \\(checked (\\d{4}-\\d{2}-\\d{2})\\)`),
  )?.[1];
  if (!checkedDate) return null;

  const checkedMs = Date.parse(`${checkedDate}T00:00:00.000Z`);
  const nowMs = Date.parse(now);
  if (Number.isNaN(checkedMs) || Number.isNaN(nowMs)) {
    return `${ledgerLabel} has invalid checked date: ${checkedDate}`;
  }
  if (checkedMs > nowMs) {
    return `${ledgerLabel} checked date is in the future: ${checkedDate}`;
  }
  const ageDays = Math.floor((nowMs - checkedMs) / 86_400_000);
  if (ageDays > SOURCE_LEDGER_MAX_AGE_DAYS) {
    return `${ledgerLabel} checked date is stale: ${checkedDate} (${ageDays}d > ${SOURCE_LEDGER_MAX_AGE_DAYS}d)`;
  }
  return null;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

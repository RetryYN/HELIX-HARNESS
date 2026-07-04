export const SOURCE_LEDGER_MAX_AGE_DAYS = 90;

export interface VerificationSourceMetadataRow {
  sourceUrl: string;
  sourceCheckedAt: string;
  latestOfficialStatus: string;
  sourceStatusDelta: string;
  adoptionDecision: string;
  adoptionDecisionDelta: string;
  workflowRouteImpact: string;
}

export interface VerificationSourceMetadataViolation {
  subject: string;
  reason: string;
}

export interface VerificationSourceMetadataViolationInput {
  subject: string;
  matrixName: string;
  row: VerificationSourceMetadataRow;
  now?: string;
}

export function sourceLedgerHeadingPattern(ledgerLabel: string): RegExp {
  const date = "\\d{4}-\\d{2}-\\d{2}";
  return new RegExp(
    `${escapeRegExp(ledgerLabel)}(?: \\(checked ${date}\\)|（(?:確認日|checked) ${date}(?:、[^）]*)?）)`,
  );
}

export function hasSourceLedgerCheckedDate(text: string, ledgerLabel: string): boolean {
  return sourceLedgerHeadingPattern(ledgerLabel).test(text);
}

export function sourceLedgerCheckedDate(text: string, ledgerLabel: string): string | null {
  const match = text.match(
    new RegExp(
      `${escapeRegExp(ledgerLabel)}(?: \\(checked (\\d{4}-\\d{2}-\\d{2})\\)|（(?:確認日|checked) (\\d{4}-\\d{2}-\\d{2})(?:、[^）]*)?）)`,
    ),
  );
  return match?.[1] ?? match?.[2] ?? null;
}

export function sourceLedgerCheckedDateViolation(
  text: string,
  ledgerLabel: string,
  now: string = new Date().toISOString(),
): string | null {
  const checkedDate = sourceLedgerCheckedDate(text, ledgerLabel);
  if (!checkedDate) return null;

  const checkedMs = strictDateMs(checkedDate);
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

export function verificationSourceMetadataViolations(
  input: VerificationSourceMetadataViolationInput,
): VerificationSourceMetadataViolation[] {
  const { subject, matrixName, row } = input;
  const now = input.now ?? new Date().toISOString();
  const violations: VerificationSourceMetadataViolation[] = [];
  const checkedMs = strictDateMs(row.sourceCheckedAt);
  const nowMs = Date.parse(now);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(row.sourceCheckedAt) || Number.isNaN(checkedMs)) {
    violations.push({
      subject,
      reason: `${matrixName} sourceCheckedAt is invalid: ${row.sourceCheckedAt}`,
    });
  } else if (checkedMs > nowMs) {
    violations.push({
      subject,
      reason: `${matrixName} sourceCheckedAt is in the future: ${row.sourceCheckedAt}`,
    });
  } else {
    const ageDays = Math.floor((nowMs - checkedMs) / 86_400_000);
    if (ageDays > SOURCE_LEDGER_MAX_AGE_DAYS) {
      violations.push({
        subject,
        reason: `${matrixName} sourceCheckedAt is stale: ${row.sourceCheckedAt} (${ageDays}d > ${SOURCE_LEDGER_MAX_AGE_DAYS}d)`,
      });
    }
  }

  for (const [field, value] of [
    ["sourceUrl", row.sourceUrl],
    ["latestOfficialStatus", row.latestOfficialStatus],
    ["sourceStatusDelta", row.sourceStatusDelta],
    ["adoptionDecision", row.adoptionDecision],
    ["adoptionDecisionDelta", row.adoptionDecisionDelta],
    ["workflowRouteImpact", row.workflowRouteImpact],
  ] as const) {
    if (isPlaceholderSourceMetadata(value)) {
      violations.push({
        subject,
        reason: `${matrixName} ${field} is missing or placeholder`,
      });
    }
  }

  if (/^https?:\/\//.test(row.sourceUrl) && !row.sourceUrl.startsWith("https://")) {
    violations.push({
      subject,
      reason: `${matrixName} sourceUrl must use https: ${row.sourceUrl}`,
    });
  }

  return violations;
}

function strictDateMs(value: string): number {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return Number.NaN;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const ms = Date.UTC(year, month - 1, day);
  const date = new Date(ms);
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return Number.NaN;
  }
  return ms;
}

function isPlaceholderSourceMetadata(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed || /^(TBD|TODO|N\/A|-|placeholder)$/i.test(trimmed)) return true;
  if (/^<[^>]+>$/.test(trimmed)) return true;
  return /\b(record later|to be recorded|fill in|must cite|cite before approval)\b/i.test(trimmed);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

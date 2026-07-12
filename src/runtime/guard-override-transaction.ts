export interface GuardBlockClassification {
  guardKind: "git" | "foreign_edit";
  operationClass: string;
  subjectDigest: string;
}

export interface OverrideAuditPort {
  commit(input: { nonce: string; reason: string; classification: GuardBlockClassification }): { status: "committed" | "reused" };
  abort(input: { nonce: string; reason: "consume_failed" }): void;
}

export interface OverrideMarkerPort {
  consume(expectedNonce: string): boolean;
}

function validAuditInput(input: {
  nonce: string;
  reason: string;
  classification: GuardBlockClassification;
}): boolean {
  return (
    input.nonce.length > 0 && input.nonce.length <= 128 &&
    input.reason.trim().length > 0 && input.reason.length <= 256 &&
    !/[\r\n]/.test(input.reason) &&
    !/(?:token|password|secret|credential)\s*[:=]/i.test(input.reason) &&
    input.classification.operationClass.length > 0 &&
    input.classification.operationClass.length <= 128 &&
    /^sha256:[0-9a-f]{64}$/.test(input.classification.subjectDigest)
  );
}

export type OverrideCommitResult =
  | { status: "allowed" }
  | { status: "blocked_audit_failure" }
  | { status: "blocked_consume_failure" }
  | { status: "blocked_reuse" }
  | { status: "blocked_invalid_authorization" };

export function commitOverrideUse(input: {
  nonce: string;
  reason: string;
  classification: GuardBlockClassification;
  audit: OverrideAuditPort;
  marker: OverrideMarkerPort;
}): OverrideCommitResult {
  if (!validAuditInput(input)) return { status: "blocked_invalid_authorization" };
  try {
    const reservation = input.audit.commit({
      nonce: input.nonce,
      reason: input.reason,
      classification: input.classification,
    });
    if (reservation.status === "reused") return { status: "blocked_reuse" };
  } catch {
    return { status: "blocked_audit_failure" };
  }
  try {
    if (input.marker.consume(input.nonce)) return { status: "allowed" };
    input.audit.abort({ nonce: input.nonce, reason: "consume_failed" });
    return { status: "blocked_consume_failure" };
  } catch {
    try { input.audit.abort({ nonce: input.nonce, reason: "consume_failed" }); } catch {}
    return { status: "blocked_consume_failure" };
  }
}

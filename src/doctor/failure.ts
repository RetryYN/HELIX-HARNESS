import { type StableCauseDigest, stableCauseDigest } from "../runtime/stable-cause-digest";

export type DoctorReasonCode = "read_failed" | "check_failed" | "invalid_state";
export type DoctorFailure = {
  checkId: string;
  reasonCode: DoctorReasonCode;
  cause: StableCauseDigest;
};
const SAFE_CHECK_ID = /^[a-z0-9][a-z0-9-]{0,95}$/;

export function doctorFailure(
  checkId: string,
  reasonCode: DoctorReasonCode,
  cause: unknown,
): DoctorFailure {
  return {
    checkId: SAFE_CHECK_ID.test(checkId) ? checkId : "invalid-check-id",
    reasonCode,
    cause: stableCauseDigest(cause),
  };
}

export function doctorFailureMessage(failure: DoctorFailure): string {
  return `${failure.checkId} - violation: reason=${failure.reasonCode} cause_kind=${failure.cause.causeKind} cause_digest=${failure.cause.digest}`;
}

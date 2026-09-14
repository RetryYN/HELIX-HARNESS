export interface ReviewCiGenerationCandidate {
  id: number;
  attempt: number;
  status: string;
  conclusion: string | null;
  updatedAt: string;
}

/**
 * review receiptを束縛できる最新の成功世代を返す。
 *
 * pending／cancelled／failureはrequired checkとして別途mergeを止めるが、既に成立した
 * exact-HEAD success evidenceのidentityを上書きしない。これによりreview admission自身の
 * failureが次attemptを永久にstale化する循環を避ける。
 */
export function selectLatestSuccessfulReviewCiGeneration<T extends ReviewCiGenerationCandidate>(
  candidates: readonly T[],
): T | null {
  return selectReviewCiGeneration(candidates, ["success"]);
}

/** 封緘用の観測結果。成功の認定ではなく、通知・merge許可には使用しない。 */
export function selectLatestTerminalReviewCiGeneration<T extends ReviewCiGenerationCandidate>(
  candidates: readonly T[],
): T | null {
  return selectReviewCiGeneration(candidates, [
    "success",
    "failure",
    "cancelled",
    "timed_out",
    "neutral",
    "skipped",
    "action_required",
    "stale",
    "startup_failure",
  ]);
}

function selectReviewCiGeneration<T extends ReviewCiGenerationCandidate>(
  candidates: readonly T[],
  conclusions: readonly string[],
): T | null {
  return (
    candidates
      .filter(
        (candidate) =>
          Number.isSafeInteger(candidate.id) &&
          candidate.id > 0 &&
          Number.isSafeInteger(candidate.attempt) &&
          candidate.attempt > 0 &&
          candidate.status === "completed" &&
          candidate.conclusion !== null &&
          conclusions.includes(candidate.conclusion) &&
          Number.isFinite(Date.parse(candidate.updatedAt)),
      )
      .sort((left, right) => {
        const updated = Date.parse(right.updatedAt) - Date.parse(left.updatedAt);
        if (updated !== 0) return updated;
        if (right.attempt !== left.attempt) return right.attempt - left.attempt;
        return right.id - left.id;
      })[0] ?? null
  );
}

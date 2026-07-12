/**
 * Historical artifact tombstone for PLAN-L7-366/431.
 *
 * The implementation moved to `src/orchestration/autonomous-loop-run-receipts.ts`
 * because runtime -> orchestration imports create a forbidden dependency cycle.
 * New consumers must import the orchestration owner directly; this module intentionally
 * exports no runtime facade so the old dependency direction cannot silently return.
 */
export const AUTONOMOUS_LOOP_RECEIPT_RELOCATION = {
  status: "moved",
  owner: "orchestration",
  target: "src/orchestration/autonomous-loop-run-receipts.ts",
} as const;

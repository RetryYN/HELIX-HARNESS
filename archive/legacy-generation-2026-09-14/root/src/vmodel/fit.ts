/**
 * Compatibility evidence anchor for the V-model fit artifact path.
 *
 * The executable fit projection lives in `src/state-db/vmodel-fit.ts` because it
 * is a current-location/read-model projection over harness.db state. Keeping this
 * file dependency-free prevents `vmodel -> state-db -> vmodel` cycles while
 * preserving the historical artifact path used by PLAN evidence audits.
 */

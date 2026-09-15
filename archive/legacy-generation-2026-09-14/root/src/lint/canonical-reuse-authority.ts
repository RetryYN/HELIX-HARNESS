export const CANONICAL_REUSE_AUTHORITY_PATH =
  "docs/governance/downstream-canonical-reuse-authority-2026-07-19.md";

export const CANONICAL_REUSE_BLOCKED_PATHS = [
  "docs/plans/PLAN-L3-00-master.md",
  "docs/plans/PLAN-L4-05-workflow-orchestration.md",
  "docs/plans/PLAN-L3-13-vmodel-docgen-fit.md",
  "docs/plans/PLAN-L7-421-design-coverage-catalog.md",
  "docs/plans/PLAN-L1-04-technical-requirements.md",
  "docs/test-design/harness/L1-operational-test-design.md",
  "docs/test-design/harness/L3-acceptance-test-design.md",
  "docs/test-design/harness/L7-unit-test-design.md",
  "docs/test-design/helix/L1-pillar-operational-test-design.md",
  "docs/test-design/helix/L2-screen-ux-test-design.md",
  "docs/test-design/helix/L3-pillar-acceptance-test-design.md",
  "docs/test-design/helix/L3-retention-purge-acceptance-test-design.md",
  "docs/test-design/helix/L5-layer-ledger-pair-gate-integration-test-design.md",
  "docs/test-design/helix/L5-python-worker-runtime-integration-test-design.md",
  "docs/test-design/helix/L5-universal-reverse-redesign-integration-test-design.md",
  "docs/test-design/helix/L6-layer-ledger-pair-gate-unit-test-design.md",
  "docs/test-design/helix/L6-pillar-unit-test-design.md",
  "docs/test-design/helix/L6-python-worker-runtime-unit-test-design.md",
  "docs/test-design/helix/L6-universal-reverse-redesign-unit-test-design.md",
  "docs/test-design/helix/L9-infinity-loop-platform-system-test-design.md",
  "docs/test-design/helix/vmodel-docgen-fit-acceptance.md",
] as const;

/** 既存L13/L14 physical PLAN読込専用。新規authoringへのpattern allowはしない。 */
export const LEGACY_PLAN_READ_ALLOWLIST = [
  "docs/plans/PLAN-L13-00-post-deploy-verification-master.md",
  "docs/plans/PLAN-L14-00-operations-feedback-master.md",
  "docs/plans/PLAN-M-00-verify-cutover.md",
  "docs/plans/PLAN-M-01-cutover-backfill.md",
  "docs/plans/PLAN-M-02-helix-identifier-rename.md",
] as const;

export const normalizeCanonicalAuthorityPath = (path: string): string => {
  const normalized = path.replaceAll("\\", "/");
  const docsIndex = normalized.lastIndexOf("/docs/");
  return docsIndex >= 0 ? normalized.slice(docsIndex + 1) : normalized.replace(/^\.\//, "");
};

export const assertCanonicalReuseAllowed = (path: string): void => {
  const repoRelative = normalizeCanonicalAuthorityPath(path);
  if ((CANONICAL_REUSE_BLOCKED_PATHS as readonly string[]).includes(repoRelative)) {
    throw new Error(`canonical reuse blocked pending authority delta: ${repoRelative}`);
  }
};

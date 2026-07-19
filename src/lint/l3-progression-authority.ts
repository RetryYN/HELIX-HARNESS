export const L3_PROGRESSION_AUTHORITY_MARKER = "HELIX:L3-PROGRESSION-AUTHORITY:v1";

export const L3_PROGRESSION_BLOCKER_PATHS = [
  "docs/adr/ADR-001-helix-harness-redesign-and-language.md",
  "docs/design/design-catalog.yaml",
  "docs/design/harness/L1-requirements/business-requirements.md",
  "docs/design/harness/L1-requirements/functional-requirements.md",
  "docs/design/harness/L1-requirements/nfr.md",
  "docs/design/harness/L1-requirements/screen-requirements.md",
  "docs/design/harness/L1-requirements/technical-requirements.md",
  "docs/design/harness/L2-screen/README.md",
  "docs/design/harness/L2-screen/business-flow.md",
  "docs/design/harness/L2-screen/screen-detail.md",
  "docs/design/harness/L2-screen/screen-flow.md",
  "docs/design/harness/L2-screen/screen-list.md",
  "docs/design/harness/L2-screen/ui-element.md",
  "docs/design/harness/L2-screen/wireframe.md",
  "docs/design/harness/L3-functional/README.md",
  "docs/design/harness/L3-functional/business-detail.md",
  "docs/design/harness/L3-functional/functional-requirements.md",
  "docs/design/harness/L3-functional/nfr-grade.md",
  "docs/design/harness/L3-functional/roadmap.md",
  "docs/design/helix/L0-charter/helix-charter_v0.1.md",
  "docs/design/helix/L1-requirements/hybrid-rebaseline-v0.5.0-remediation-delta.md",
  "docs/design/helix/L1-requirements/pillar-requirements.md",
  "docs/design/helix/L3-requirements/pillar-functional-requirements.md",
  "docs/design/helix/L3-requirements/vmodel-docgen-fit.md",
  "docs/governance/coding-rules.md",
  "docs/governance/document-system-map.md",
  "docs/governance/gate-design.md",
  "docs/governance/helix-harness-concept_v3.1.md",
  "docs/governance/helix-harness-extraction-plan_v0.1.md",
  "docs/governance/helix-harness-requirements_v1.2.md",
  "docs/governance/repository-structure.md",
  "docs/plans/PLAN-L0-01-helix-charter.md",
  "docs/plans/PLAN-L1-01-business-requirements.md",
  "docs/plans/PLAN-L1-02-functional-requirements.md",
  "docs/plans/PLAN-L1-03-screen-requirements.md",
  "docs/plans/PLAN-L1-04-technical-requirements.md",
  "docs/plans/PLAN-L1-05-nfr.md",
  "docs/plans/PLAN-L1-06-helix-solo-conversion.md",
  "docs/plans/PLAN-L1-07-infinity-loop-platform-requirements.md",
  "docs/plans/PLAN-L2-00-master.md",
  "docs/plans/PLAN-L2-01-screen-list.md",
  "docs/plans/PLAN-L2-04-wireframe.md",
  "docs/plans/PLAN-L3-00-master.md",
  "docs/plans/PLAN-L3-01-functional-detail.md",
  "docs/plans/PLAN-L3-02-business-detail.md",
  "docs/plans/PLAN-L3-03-nfr-grade.md",
  "docs/plans/PLAN-L3-05-harness-telemetry-closure.md",
  "docs/plans/PLAN-L3-06-helix-pillar-descent.md",
  "docs/plans/PLAN-L3-07-requirements-binding-enforcement.md",
  "docs/plans/PLAN-L3-08-message-catalog-externalization.md",
  "docs/plans/PLAN-L3-09-requirements-omission-guards.md",
  "docs/plans/PLAN-L3-10-message-catalog-externalization.md",
  "docs/plans/PLAN-L3-11-requirements-omission-guards.md",
  "docs/plans/PLAN-L3-13-vmodel-docgen-fit.md",
  "docs/process/README.md",
  "docs/process/forward/L00-L06-design-phase.md",
  "docs/process/forward/overview.md",
  "docs/process/gates.md",
] as const;

export type L3ProgressionAuthorityFinding = {
  path: string;
  reason: "missing_reviewed_digest" | "digest_mismatch";
};

export const verifyL3ProgressionAuthority = (): L3ProgressionAuthorityFinding[] => {
  const findings: L3ProgressionAuthorityFinding[] = [];
  for (const path of L3_PROGRESSION_BLOCKER_PATHS) {
    const expected = (L3_PROGRESSION_REVIEWED_DIGESTS as Record<string, string>)[path];
    if (!expected) {
      findings.push({ path, reason: "missing_reviewed_digest" });
      continue;
    }
    const actual = createHash("sha256").update(readFileSync(path)).digest("hex");
    if (actual !== expected) findings.push({ path, reason: "digest_mismatch" });
  }
  return findings;
};

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { L3_PROGRESSION_REVIEWED_DIGESTS } from "./l3-progression-reviewed-digests";

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  type GateEvidenceManifest,
  loadGateEvidenceManifests,
  validateGateEvidenceManifest,
} from "./gn-evidence-manifest";

export interface G10UxWorkflowInput {
  repoRoot?: string;
  l10VisualDesign: string;
  gatesMd: string;
  evidenceManifests: GateEvidenceManifest[];
}

export interface G10UxWorkflowResult {
  ok: boolean;
  missingWorkflowMarkers: string[];
  missingGateMarkers: string[];
  uxvCaseCount: number;
  manifestCount: number;
  selectedItemCount: number;
  mandatoryItemCount: number;
  violations: string[];
}

const CONFIG = {
  gate: "G10",
  schemaVersion: "g10-ux-evidence-v1",
  evidenceDir: ".helix/evidence/g10-ux",
  itemPrefix: "UXV-",
  doctorCheck: "g10-ux-workflow",
  requireAdvisorEvidence: true,
} as const;

const WORKFLOW_MARKERS = [
  "G10-WORKFLOW",
  "ux_test_strategy",
  "ux_test_plan",
  "ux_test_conditions",
  "ux_coverage_items",
  "ux_test_procedures",
  "ux_execution_evidence",
  "ux_exit_criteria",
  "ux_defect_routing",
] as const;

const GATE_MARKERS = ["G10", "real-data render", "screenshot", "a11y evidence", "frontend coverage"] as const;
const REQUIRED_UXV_FAMILY_PREFIXES = ["UXV-RENDER-", "UXV-A11Y-", "UXV-BLOCKER-"] as const;

function missingMarkers(text: string, markers: readonly string[]): string[] {
  return markers.filter((marker) => !text.includes(marker));
}

export function loadG10UxWorkflowInput(repoRoot = process.cwd()): G10UxWorkflowInput {
  return {
    repoRoot,
    l10VisualDesign: readFileSync(resolve(repoRoot, "docs/design/harness/L10-ux/visual-design.md"), "utf8"),
    gatesMd: readFileSync(resolve(repoRoot, "docs/process/gates.md"), "utf8"),
    evidenceManifests: loadGateEvidenceManifests(repoRoot, CONFIG),
  };
}

export function canLoadG10UxWorkflowInput(repoRoot: string): boolean {
  return (
    existsSync(resolve(repoRoot, "docs/design/harness/L10-ux/visual-design.md")) &&
    existsSync(resolve(repoRoot, "docs/process/gates.md"))
  );
}

export function analyzeG10UxWorkflow(input: G10UxWorkflowInput): G10UxWorkflowResult {
  const missingWorkflowMarkers = missingMarkers(input.l10VisualDesign, WORKFLOW_MARKERS);
  const missingGateMarkers = missingMarkers(input.gatesMd, GATE_MARKERS);
  const uxvCaseCount = new Set([...input.l10VisualDesign.matchAll(/\bUXV-[A-Z0-9-]+/g)].map((m) => m[0])).size;
  const selectedItemIds = new Set(input.evidenceManifests.flatMap((manifest) => manifest.selected_item_ids));
  const mandatoryItemIds = new Set(input.evidenceManifests.flatMap((manifest) => manifest.mandatory_item_ids));
  const violations: string[] = [];

  if (missingWorkflowMarkers.length > 0) {
    violations.push(`L10 UX workflow markers missing: ${missingWorkflowMarkers.join(", ")}`);
  }
  if (missingGateMarkers.length > 0) {
    violations.push(`G10 gate definition markers missing: ${missingGateMarkers.join(", ")}`);
  }
  if (uxvCaseCount < 3) {
    violations.push(`L10 visual design has too few UXV cases for a gate-significant workflow: ${uxvCaseCount}`);
  }
  if (input.evidenceManifests.length === 0) {
    violations.push(`G10 UX evidence manifest is missing under ${CONFIG.evidenceDir}`);
  }
  for (const prefix of REQUIRED_UXV_FAMILY_PREFIXES) {
    if (![...selectedItemIds].some((itemId) => itemId.startsWith(prefix))) {
      violations.push(`G10 selected UXV coverage missing ${prefix} family`);
    }
    if (![...mandatoryItemIds].some((itemId) => itemId.startsWith(prefix))) {
      violations.push(`G10 mandatory UXV coverage missing ${prefix} family`);
    }
  }
  for (const manifest of input.evidenceManifests) {
    violations.push(...validateGateEvidenceManifest(manifest, input.repoRoot, CONFIG));
  }

  return {
    ok: violations.length === 0,
    missingWorkflowMarkers,
    missingGateMarkers,
    uxvCaseCount,
    manifestCount: input.evidenceManifests.length,
    selectedItemCount: selectedItemIds.size,
    mandatoryItemCount: mandatoryItemIds.size,
    violations,
  };
}

export function g10UxWorkflowMessages(result: G10UxWorkflowResult): string[] {
  if (result.ok) {
    return [
      `g10-ux-workflow - OK (uxv_cases=${result.uxvCaseCount}, manifests=${result.manifestCount}, selected_uxv=${result.selectedItemCount}, mandatory_uxv=${result.mandatoryItemCount})`,
    ];
  }
  return [`g10-ux-workflow - violation: ${result.violations.join("; ")}`];
}

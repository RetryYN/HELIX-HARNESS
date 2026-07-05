import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  type GateEvidenceManifest,
  loadGateEvidenceManifests,
  validateGateEvidenceManifest,
} from "./gn-evidence-manifest";

export interface G9SystemWorkflowInput {
  repoRoot?: string;
  l9TestDesign: string;
  l9Boundary: string;
  gatesMd: string;
  evidenceManifests: GateEvidenceManifest[];
}

export interface G9SystemWorkflowResult {
  ok: boolean;
  missingWorkflowMarkers: string[];
  missingGateMarkers: string[];
  stCaseCount: number;
  manifestCount: number;
  selectedItemCount: number;
  mandatoryItemCount: number;
  violations: string[];
}

const CONFIG = {
  gate: "G9",
  schemaVersion: "g9-system-evidence-v1",
  evidenceDir: ".helix/evidence/g9-system",
  itemPrefix: "ST-",
  doctorCheck: "g9-system-workflow",
} as const;

const WORKFLOW_MARKERS = [
  "G9-WORKFLOW",
  "system_test_strategy",
  "system_test_plan",
  "system_test_conditions",
  "system_coverage_items",
  "system_test_procedures",
  "system_execution_evidence",
  "system_exit_criteria",
  "system_defect_routing",
] as const;

const GATE_MARKERS = [
  "G9",
  "ST-* evidence",
  "roadmap span coverage",
  "regression routing",
] as const;
const REQUIRED_ST_FAMILY_PREFIXES = [
  "ST-DATA-",
  "ST-ARCH-",
  "ST-FUNC-",
  "ST-EXT-",
  "ST-UI-",
  "ST-ASSET-",
] as const;

function missingMarkers(text: string, markers: readonly string[]): string[] {
  return markers.filter((marker) => !text.includes(marker));
}

export function loadG9SystemWorkflowInput(repoRoot = process.cwd()): G9SystemWorkflowInput {
  return {
    repoRoot,
    l9TestDesign: readFileSync(
      resolve(repoRoot, "docs/test-design/harness/L9-system-test-design.md"),
      "utf8",
    ),
    l9Boundary: readFileSync(
      resolve(repoRoot, "docs/design/harness/L9-system/system-evidence-boundary.md"),
      "utf8",
    ),
    gatesMd: readFileSync(resolve(repoRoot, "docs/process/gates.md"), "utf8"),
    evidenceManifests: loadGateEvidenceManifests(repoRoot, CONFIG),
  };
}

export function canLoadG9SystemWorkflowInput(repoRoot: string): boolean {
  return (
    existsSync(resolve(repoRoot, "docs/test-design/harness/L9-system-test-design.md")) &&
    existsSync(resolve(repoRoot, "docs/design/harness/L9-system/system-evidence-boundary.md")) &&
    existsSync(resolve(repoRoot, "docs/process/gates.md"))
  );
}

export function analyzeG9SystemWorkflow(input: G9SystemWorkflowInput): G9SystemWorkflowResult {
  const markerText = `${input.l9TestDesign}\n${input.l9Boundary}`;
  const missingWorkflowMarkers = missingMarkers(markerText, WORKFLOW_MARKERS);
  const missingGateMarkers = missingMarkers(input.gatesMd, GATE_MARKERS);
  const stCaseCount = new Set([...input.l9TestDesign.matchAll(/\bST-[A-Z0-9-]+/g)].map((m) => m[0]))
    .size;
  const selectedItemIds = new Set(
    input.evidenceManifests.flatMap((manifest) => manifest.selected_item_ids),
  );
  const mandatoryItemIds = new Set(
    input.evidenceManifests.flatMap((manifest) => manifest.mandatory_item_ids),
  );
  const violations: string[] = [];

  if (missingWorkflowMarkers.length > 0) {
    violations.push(`L9 system workflow markers missing: ${missingWorkflowMarkers.join(", ")}`);
  }
  if (missingGateMarkers.length > 0) {
    violations.push(`G9 gate definition markers missing: ${missingGateMarkers.join(", ")}`);
  }
  if (stCaseCount < 10) {
    violations.push(
      `L9 test design has too few ST cases for a gate-significant workflow: ${stCaseCount}`,
    );
  }
  if (input.evidenceManifests.length === 0) {
    violations.push(`G9 system evidence manifest is missing under ${CONFIG.evidenceDir}`);
  }
  for (const prefix of REQUIRED_ST_FAMILY_PREFIXES) {
    if (![...selectedItemIds].some((itemId) => itemId.startsWith(prefix))) {
      violations.push(`G9 selected ST coverage missing ${prefix} family`);
    }
    if (![...mandatoryItemIds].some((itemId) => itemId.startsWith(prefix))) {
      violations.push(`G9 mandatory ST coverage missing ${prefix} family`);
    }
  }
  for (const manifest of input.evidenceManifests) {
    violations.push(...validateGateEvidenceManifest(manifest, input.repoRoot, CONFIG));
  }

  return {
    ok: violations.length === 0,
    missingWorkflowMarkers,
    missingGateMarkers,
    stCaseCount,
    manifestCount: input.evidenceManifests.length,
    selectedItemCount: selectedItemIds.size,
    mandatoryItemCount: mandatoryItemIds.size,
    violations,
  };
}

export function g9SystemWorkflowMessages(result: G9SystemWorkflowResult): string[] {
  if (result.ok) {
    return [
      `g9-system-workflow - OK (st_cases=${result.stCaseCount}, manifests=${result.manifestCount}, selected_st=${result.selectedItemCount}, mandatory_st=${result.mandatoryItemCount})`,
    ];
  }
  return [`g9-system-workflow - violation: ${result.violations.join("; ")}`];
}

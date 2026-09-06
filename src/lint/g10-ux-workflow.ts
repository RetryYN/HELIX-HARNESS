import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { type EvidenceFileInspection, observeEvidenceFiles } from "./evidence-file-substance";
import {
  type GateEvidenceManifest,
  loadGateEvidenceManifests,
  validateGateEvidenceManifest,
} from "./gn-evidence-manifest";

export interface G10UxWorkflowInput {
  repoRoot?: string;
  evidenceObservations?: Readonly<Record<string, Readonly<EvidenceFileInspection>>>;
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
  activeManifestPaths: [".helix/evidence/g10-ux/20260906-selected-ux-evidence.json"],
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

const GATE_MARKERS = [
  "G10",
  "real-data render",
  "screenshot",
  "a11y evidence",
  "frontend coverage",
] as const;
const REQUIRED_UXV_FAMILY_PREFIXES = ["UXV-RENDER-", "UXV-A11Y-", "UXV-BLOCKER-"] as const;
const REQUIRED_ADVISOR_RECEIPT_PREFIX = {
  "UXV-RENDER-": "browser-render-receipt:",
  "UXV-A11Y-": "browser-a11y-receipt:",
  "UXV-BLOCKER-": "completion-blocker-receipt:",
} as const;

function missingMarkers(text: string, markers: readonly string[]): string[] {
  return markers.filter((marker) => !text.includes(marker));
}

export function loadG10UxWorkflowInput(repoRoot = process.cwd()): G10UxWorkflowInput {
  const evidenceManifests = loadGateEvidenceManifests(repoRoot, CONFIG);
  return {
    repoRoot,
    evidenceObservations: observeEvidenceFiles(
      repoRoot,
      evidenceManifests.flatMap((manifest) => [
        ...manifest.commands.map((command) => command.evidence_path),
        ...manifest.coverage.flatMap((entry) => entry.evidence_paths),
      ]),
    ),
    l10VisualDesign: readFileSync(
      resolve(repoRoot, "docs/design/harness/L10-ux/visual-design.md"),
      "utf8",
    ),
    gatesMd: readFileSync(resolve(repoRoot, "docs/process/gates.md"), "utf8"),
    evidenceManifests,
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
  const uxvCaseCount = new Set(
    [...input.l10VisualDesign.matchAll(/\bUXV-[A-Z0-9-]+/g)].map((m) => m[0]),
  ).size;
  const selectedItemIds = new Set(
    input.evidenceManifests.flatMap((manifest) => manifest.selected_item_ids),
  );
  const mandatoryItemIds = new Set(
    input.evidenceManifests.flatMap((manifest) => manifest.mandatory_item_ids),
  );
  const violations: string[] = [];

  if (missingWorkflowMarkers.length > 0) {
    violations.push(`L10 UX workflow markers missing: ${missingWorkflowMarkers.join(", ")}`);
  }
  if (missingGateMarkers.length > 0) {
    violations.push(`G10 gate definition markers missing: ${missingGateMarkers.join(", ")}`);
  }
  if (uxvCaseCount < 3) {
    violations.push(
      `L10 visual design has too few UXV cases for a gate-significant workflow: ${uxvCaseCount}`,
    );
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
    violations.push(...validateGateEvidenceManifest(manifest, input.evidenceObservations, CONFIG));
    for (const coverage of manifest.coverage) {
      const family = REQUIRED_UXV_FAMILY_PREFIXES.find((prefix) =>
        coverage.item_id.startsWith(prefix),
      );
      const required = family ? REQUIRED_ADVISOR_RECEIPT_PREFIX[family] : undefined;
      if (
        manifest.mandatory_item_ids.includes(coverage.item_id) &&
        required &&
        !coverage.advisor_evidence?.startsWith(required)
      ) {
        violations.push(
          `${manifest.manifest_path}: coverage ${coverage.item_id} requires ${required} evidence`,
        );
      } else if (manifest.mandatory_item_ids.includes(coverage.item_id) && required) {
        const claimedDigest = coverage.advisor_evidence?.slice(required.length).toLowerCase();
        if (
          !claimedDigest ||
          !/^sha256:[a-f0-9]{64}$/u.test(claimedDigest) ||
          !coverage.evidence_paths.some(
            (path) =>
              input.evidenceObservations?.[path]?.ok &&
              input.evidenceObservations[path].digest === claimedDigest,
          )
        ) {
          violations.push(
            `${manifest.manifest_path}: coverage ${coverage.item_id} receipt digest is not bound to its evidence bytes`,
          );
        }
      }
    }
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

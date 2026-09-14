import { sha256Digest } from "./digest";

export const CHANGE_PACKAGE_DELTA_ARCHIVE_SCHEMA_VERSION = "change-package-delta-archive.v1";

export type ChangePackageStatus = "draft" | "active" | "confirmed" | "accepted" | "archived";

export interface ArchiveDecisionRecord {
  rollback_path?: string | null;
  evidence_digest?: string | null;
}

export interface ChangePackageManifest {
  package_id: string;
  plan_id: string;
  plan_status: ChangePackageStatus | string;
  archive_requested?: boolean;
  design_paths?: string[];
  test_design_paths?: string[];
  acceptance_evidence_paths?: string[];
  delta_layers?: string[];
  archive_decision?: ArchiveDecisionRecord | null;
}

export interface ChangePackageDeltaArchiveReport {
  schema_version: typeof CHANGE_PACKAGE_DELTA_ARCHIVE_SCHEMA_VERSION;
  ok: boolean;
  dry_run: true;
  package_id: string;
  manifest_digest: string;
  delta_layers: string[];
  archive_allowed: boolean;
  rollback_path: string | null;
  evidence_digest: string | null;
  findings: Array<{ code: string; severity: "warning" | "error"; detail: string }>;
  source_command: string;
}

function present(value: string | null | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isActiveStatus(status: string): boolean {
  return ["draft", "active", "confirmed"].includes(status.toLowerCase());
}

export function buildChangePackageDeltaArchiveReport(
  manifest: ChangePackageManifest,
  options: { sourceCommand?: string } = {},
): ChangePackageDeltaArchiveReport {
  const findings: ChangePackageDeltaArchiveReport["findings"] = [];
  const designCount = (manifest.design_paths ?? []).length;
  const testDesignCount = (manifest.test_design_paths ?? []).length;
  const archiveDecision = manifest.archive_decision ?? {};
  const rollbackPath = archiveDecision.rollback_path ?? null;
  const evidenceDigest = archiveDecision.evidence_digest ?? null;

  if (manifest.archive_requested && isActiveStatus(String(manifest.plan_status))) {
    if (designCount === 0 && testDesignCount === 0) {
      findings.push({
        code: "archive_without_design_or_test_delta",
        severity: "error",
        detail: `${manifest.plan_id} archive request has no design/test-design delta binding`,
      });
    }
    if (!present(rollbackPath) || !present(evidenceDigest)) {
      findings.push({
        code: "archive_decision_missing_rollback_or_digest",
        severity: "error",
        detail: `${manifest.plan_id} archive decision requires rollback path and evidence digest`,
      });
    }
  }
  if ((manifest.acceptance_evidence_paths ?? []).length === 0) {
    findings.push({
      code: "change_package_missing_acceptance_evidence",
      severity: "warning",
      detail: `${manifest.package_id} has no acceptance evidence path`,
    });
  }

  return {
    schema_version: CHANGE_PACKAGE_DELTA_ARCHIVE_SCHEMA_VERSION,
    ok: !findings.some((finding) => finding.severity === "error"),
    dry_run: true,
    package_id: manifest.package_id,
    manifest_digest: sha256Digest(JSON.stringify(manifest)),
    delta_layers: manifest.delta_layers ?? [],
    archive_allowed:
      Boolean(manifest.archive_requested) &&
      !isActiveStatus(String(manifest.plan_status)) &&
      present(rollbackPath) &&
      present(evidenceDigest),
    rollback_path: rollbackPath,
    evidence_digest: evidenceDigest,
    findings,
    source_command: options.sourceCommand ?? "helix change package --dry-run --json",
  };
}

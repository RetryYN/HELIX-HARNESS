export const CROSS_REPO_SPEC_STORE_SCHEMA_VERSION = "cross-repo-spec-store.v1";

export type SpecStoreOperation = "read" | "write" | "sync" | "publish";

export interface CrossRepoSpecStoreManifest {
  store_id: string;
  source: string;
  ref: string;
  operation: SpecStoreOperation;
  read_only: boolean;
  consuming_plan_id?: string | null;
  artifact_digest?: string | null;
  action_binding_approval_present?: boolean;
}

export interface CrossRepoSpecStoreReport {
  schema_version: typeof CROSS_REPO_SPEC_STORE_SCHEMA_VERSION;
  ok: boolean;
  dry_run: true;
  store_id: string;
  source: string;
  ref: string;
  operation: SpecStoreOperation;
  read_only: boolean;
  trusted_artifact: boolean;
  findings: Array<{ code: string; severity: "warning" | "error"; detail: string }>;
  source_command: string;
}

function present(value: string | null | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isPinnedRef(ref: string): boolean {
  return /^[a-f0-9]{12,40}$/i.test(ref) || /^refs\/tags\/[A-Za-z0-9._-]+$/.test(ref);
}

export function buildCrossRepoSpecStoreReport(
  manifest: CrossRepoSpecStoreManifest,
  options: { sourceCommand?: string } = {},
): CrossRepoSpecStoreReport {
  const findings: CrossRepoSpecStoreReport["findings"] = [];
  if (!isPinnedRef(manifest.ref)) {
    findings.push({
      code: "unpinned_store_ref_fail_close",
      severity: "error",
      detail: `${manifest.store_id} ref must be a commit sha or refs/tags/*`,
    });
  }
  if (manifest.operation !== "read" || !manifest.read_only) {
    if (!manifest.action_binding_approval_present) {
      findings.push({
        code: "write_or_sync_requires_action_binding_approval",
        severity: "error",
        detail: `${manifest.store_id} ${manifest.operation} is disabled without action-binding approval`,
      });
    }
  }
  if (!present(manifest.consuming_plan_id) || !present(manifest.artifact_digest)) {
    findings.push({
      code: "consuming_plan_missing_store_digest",
      severity: "error",
      detail: `${manifest.store_id} consumption requires plan id and artifact digest`,
    });
  }

  return {
    schema_version: CROSS_REPO_SPEC_STORE_SCHEMA_VERSION,
    ok: !findings.some((finding) => finding.severity === "error"),
    dry_run: true,
    store_id: manifest.store_id,
    source: manifest.source,
    ref: manifest.ref,
    operation: manifest.operation,
    read_only: manifest.read_only,
    trusted_artifact: present(manifest.artifact_digest) && isPinnedRef(manifest.ref),
    findings,
    source_command: options.sourceCommand ?? "helix spec-store check --dry-run --json",
  };
}

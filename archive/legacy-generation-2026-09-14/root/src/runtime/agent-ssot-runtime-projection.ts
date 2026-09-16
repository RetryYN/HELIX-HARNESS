import { sha256Digest } from "./digest";
import {
  evaluateRuntimeCapabilityRoute,
  type RuntimeCapability,
} from "./runtime-capability-matrix";

export const AGENT_SSOT_RUNTIME_PROJECTION_SCHEMA_VERSION = "agent-ssot-runtime-projection.v1";

export type AgentSsotArtifactKind = "agent" | "skill" | "rule" | "hook_pack";
export type ProjectionCleanupPolicy = "owned_generated" | "preserve_user_modified" | "manual";
export type ProjectionAction = "write" | "skip" | "report";

export interface AgentSsotProjectionItem {
  artifact_id: string;
  kind: AgentSsotArtifactKind;
  runtime: string;
  source_path: string;
  source_content: string;
  target_path: string;
  generated_content: string;
  existing_content?: string | null;
  user_modified?: boolean;
  cleanup_policy: ProjectionCleanupPolicy;
  required_capability?: RuntimeCapability;
}

export interface AgentSsotProjectedFile {
  artifact_id: string;
  runtime: string;
  target_path: string;
  action: ProjectionAction;
  source_digest: string;
  generated_digest: string;
  cleanup_policy: ProjectionCleanupPolicy;
  unsupported_reason: string | null;
  drift: boolean;
  user_modified: boolean;
}

export interface AgentSsotRuntimeProjectionReport {
  schema_version: typeof AGENT_SSOT_RUNTIME_PROJECTION_SCHEMA_VERSION;
  ok: boolean;
  read_only: true;
  projected_files: AgentSsotProjectedFile[];
  drift_count: number;
  unsupported_count: number;
  findings: Array<{ code: string; severity: "warning" | "error"; detail: string }>;
  source_command: string;
}

export function buildAgentSsotRuntimeProjectionReport(
  items: AgentSsotProjectionItem[],
  options: { sourceCommand?: string } = {},
): AgentSsotRuntimeProjectionReport {
  const findings: AgentSsotRuntimeProjectionReport["findings"] = [];
  const projectedFiles = items.map((item) => {
    const required = item.required_capability ? [item.required_capability] : [];
    const route = evaluateRuntimeCapabilityRoute(item.runtime, required);
    const unsupportedReason = route.ok ? null : `${item.runtime} lacks ${route.missing.join(",")}`;
    const generatedDigest = sha256Digest(item.generated_content);
    const existingDigest =
      item.existing_content == null ? null : sha256Digest(item.existing_content);
    const drift = existingDigest != null && existingDigest !== generatedDigest;
    const userModified = item.user_modified === true;
    if (unsupportedReason) {
      findings.push({
        code: "unsupported_runtime_reported",
        severity: "warning",
        detail: `${item.artifact_id} cannot be projected silently: ${unsupportedReason}`,
      });
    }
    if (drift) {
      findings.push({
        code: "projection_drift",
        severity: userModified ? "warning" : "error",
        detail: `${item.target_path} differs from generated digest`,
      });
    }
    if (userModified) {
      findings.push({
        code: "user_modified_generated_file_preserved",
        severity: "warning",
        detail: `${item.target_path} is user-modified; projection must not overwrite it`,
      });
    }
    const action: ProjectionAction =
      unsupportedReason || userModified ? "skip" : drift ? "report" : "write";
    return {
      artifact_id: item.artifact_id,
      runtime: item.runtime,
      target_path: item.target_path,
      action,
      source_digest: sha256Digest(item.source_content),
      generated_digest: generatedDigest,
      cleanup_policy: item.cleanup_policy,
      unsupported_reason: unsupportedReason,
      drift,
      user_modified: userModified,
    };
  });

  return {
    schema_version: AGENT_SSOT_RUNTIME_PROJECTION_SCHEMA_VERSION,
    ok: !findings.some((finding) => finding.severity === "error"),
    read_only: true,
    projected_files: projectedFiles,
    drift_count: projectedFiles.filter((file) => file.drift).length,
    unsupported_count: projectedFiles.filter((file) => file.unsupported_reason != null).length,
    findings,
    source_command: options.sourceCommand ?? "helix agent ssot-project --dry-run --json",
  };
}

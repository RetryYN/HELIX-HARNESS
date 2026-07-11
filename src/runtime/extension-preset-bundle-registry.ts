import { createHash } from "node:crypto";

export const EXTENSION_PRESET_BUNDLE_REGISTRY_SCHEMA_VERSION =
  "extension-preset-bundle-registry.v1";

export type BundleCatalog = "official" | "community" | "local";
export type BundleKind = "extension" | "preset" | "bundle";

export interface BundleComponent {
  path: string;
  content: string;
  owned_by_registry?: boolean;
  user_modified?: boolean;
}

export interface ExtensionPresetBundleManifest {
  manifest_id: string;
  kind: BundleKind;
  catalog: BundleCatalog;
  role: string;
  install_allowed?: boolean;
  contains_secret_config?: boolean;
  components: BundleComponent[];
}

export interface ExtensionPresetBundleRegistryReport {
  schema_version: typeof EXTENSION_PRESET_BUNDLE_REGISTRY_SCHEMA_VERSION;
  ok: boolean;
  dry_run: true;
  manifest_id: string;
  catalog_policy: "install-allowed" | "discovery-only" | "blocked";
  install_plan: Array<{ path: string; digest: string; action: "write" | "skip" }>;
  hash_manifest: Array<{ path: string; digest: string }>;
  remove_plan: Array<{ path: string; remove_allowed: boolean; reason: string }>;
  findings: Array<{ code: string; severity: "warning" | "error"; detail: string }>;
  source_command: string;
}

function sha256(value: string): string {
  return `sha256:${createHash("sha256").update(value).digest("hex")}`;
}

export function buildExtensionPresetBundleRegistryReport(
  manifest: ExtensionPresetBundleManifest,
  options: { sourceCommand?: string } = {},
): ExtensionPresetBundleRegistryReport {
  const findings: ExtensionPresetBundleRegistryReport["findings"] = [];
  const communityDiscoveryOnly =
    manifest.catalog === "community" && manifest.install_allowed !== true;
  if (communityDiscoveryOnly) {
    findings.push({
      code: "community_catalog_discovery_only",
      severity: "warning",
      detail: `${manifest.manifest_id} is discovery-only by default`,
    });
  }
  if (manifest.contains_secret_config) {
    findings.push({
      code: "bundle_secret_config_blocked",
      severity: "error",
      detail: `${manifest.manifest_id} contains secret config material`,
    });
  }
  const blocked = findings.some((finding) => finding.severity === "error");
  const catalogPolicy = blocked
    ? "blocked"
    : communityDiscoveryOnly
      ? "discovery-only"
      : "install-allowed";
  const hashManifest = manifest.components.map((component) => ({
    path: component.path,
    digest: sha256(component.content),
  }));
  const installPlan = manifest.components.map((component) => ({
    path: component.path,
    digest: sha256(component.content),
    action: catalogPolicy === "install-allowed" ? ("write" as const) : ("skip" as const),
  }));
  const removePlan = manifest.components.map((component) => ({
    path: component.path,
    remove_allowed: component.owned_by_registry === true && component.user_modified !== true,
    reason:
      component.owned_by_registry === true && component.user_modified !== true
        ? "owned unchanged file"
        : "skip user-modified or non-owned file",
  }));
  return {
    schema_version: EXTENSION_PRESET_BUNDLE_REGISTRY_SCHEMA_VERSION,
    ok: !blocked,
    dry_run: true,
    manifest_id: manifest.manifest_id,
    catalog_policy: catalogPolicy,
    install_plan: installPlan,
    hash_manifest: hashManifest,
    remove_plan: removePlan,
    findings,
    source_command: options.sourceCommand ?? "helix extensions registry --dry-run --json",
  };
}

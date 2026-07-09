import { describe, expect, it } from "vitest";
import { buildExtensionPresetBundleRegistryReport } from "../src/runtime/extension-preset-bundle-registry";

describe("extension preset bundle registry", () => {
  it("keeps community catalog discovery-only by default and emits a hash manifest", () => {
    const report = buildExtensionPresetBundleRegistryReport({
      manifest_id: "bundle:community-ui",
      kind: "bundle",
      catalog: "community",
      role: "uiux",
      components: [{ path: "docs/skills/ui.md", content: "ui", owned_by_registry: true }],
    });

    expect(report.ok).toBe(true);
    expect(report.catalog_policy).toBe("discovery-only");
    expect(report.install_plan).toEqual([
      expect.objectContaining({ path: "docs/skills/ui.md", action: "skip" }),
    ]);
    expect(report.hash_manifest[0].digest).toMatch(/^sha256:[a-f0-9]{64}$/);
  });

  it("removes only registry-owned unchanged files and blocks secret config bundles", () => {
    const report = buildExtensionPresetBundleRegistryReport({
      manifest_id: "preset:secret",
      kind: "preset",
      catalog: "official",
      role: "se",
      install_allowed: true,
      contains_secret_config: true,
      components: [
        { path: "a.md", content: "a", owned_by_registry: true, user_modified: false },
        { path: "b.md", content: "b", owned_by_registry: true, user_modified: true },
      ],
    });

    expect(report.ok).toBe(false);
    expect(report.catalog_policy).toBe("blocked");
    expect(report.remove_plan).toEqual([
      expect.objectContaining({ path: "a.md", remove_allowed: true }),
      expect.objectContaining({ path: "b.md", remove_allowed: false }),
    ]);
    expect(report.findings).toEqual([
      expect.objectContaining({ code: "bundle_secret_config_blocked" }),
    ]);
  });
});

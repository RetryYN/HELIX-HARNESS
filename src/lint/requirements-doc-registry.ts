/**
 * 要件正本パス registry loader (PLAN-L7-461)。
 * ハードコード禁止原則: lint/gate は要件文書パスを本 loader 経由で解決し、
 * 正本切替 (例: v1.2→v1.3) は docs/governance/requirements-doc-registry.json の更新だけで完結させる。
 * canonical = 現行要件正本。compatibility = supersede 済み参照 (旧章構成に内容依存する gate の anchor)。
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

export const REQUIREMENTS_DOC_REGISTRY_PATH = "docs/governance/requirements-doc-registry.json";

export interface RequirementsDocRegistryV1 {
  schema: "requirements-doc-registry.v1";
  canonical: string;
  compatibility: string;
}

export function loadRequirementsDocRegistry(
  repoRoot: string = process.cwd(),
): RequirementsDocRegistryV1 {
  const raw = readFileSync(join(repoRoot, REQUIREMENTS_DOC_REGISTRY_PATH), "utf8");
  const parsed = JSON.parse(raw) as Partial<RequirementsDocRegistryV1>;
  if (parsed.schema !== "requirements-doc-registry.v1") {
    throw new Error(`requirements-doc-registry: unsupported schema (${String(parsed.schema)})`);
  }
  for (const key of ["canonical", "compatibility"] as const) {
    const value = parsed[key];
    if (typeof value !== "string" || !value.endsWith(".md") || value.trim() === "") {
      throw new Error(`requirements-doc-registry: invalid ${key} path`);
    }
  }
  return {
    schema: parsed.schema,
    canonical: parsed.canonical as string,
    compatibility: parsed.compatibility as string,
  };
}

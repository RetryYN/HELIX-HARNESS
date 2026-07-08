import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export const VMODEL_ZIP_FILENAME = "ハイブリッド設計ドキュメントv1-fixed.zip";

export const VMODEL_ZIP_REQUIRED_PATHS = [
  "docs/107_Vモデル・レベル定義.yaml",
  "docs/99_型付きスペック・自動検出設計書.yaml",
  "docs/catalog.yaml",
  "docs/profiles.yaml",
  "docs/52_文書化方針・テーラリング設計.yaml",
  "docs/112_プロダクトバックログ.yaml",
  "docs/116_スプリント計画.yaml",
  "docs/29_受入基準・BDDシナリオ.yaml",
  "tools/build.py",
  "tools/spec_check.py",
  "tools/spec_types.py",
  "tools/assign.py",
  "tools/schedule.py",
] as const;

export const VMODEL_ZIP_EXPECTED_INVENTORY_SIGNATURE = {
  rootPrefix: "hybrid-docgen",
  entriesTotal: 703,
  byExtension: {
    yaml: 208,
    md: 161,
    xlsx: 263,
    png: 26,
    py: 29,
    json: 9,
    feature: 3,
    yml: 1,
    txt: 1,
  },
} as const;

export type VmodelZipInventorySignatureStatus = "match" | "mismatch" | "advisory_missing";

export interface VmodelZipInventoryMismatch {
  field: string;
  expected: string | number;
  actual: string | number;
}

export interface VmodelZipInventorySignature {
  status: VmodelZipInventorySignatureStatus;
  expected_root_prefix: string;
  actual_root_prefix: string | null;
  expected_entries_total: number;
  actual_entries_total: number;
  expected_by_extension: Record<string, number>;
  actual_by_extension: Record<string, number>;
  mismatches: VmodelZipInventoryMismatch[];
}

export interface VmodelZipSourceBindingDefinition {
  bindingId: string;
  sourcePath: (typeof VMODEL_ZIP_REQUIRED_PATHS)[number];
  sourceCategory:
    | "l12_level_definition"
    | "typed_spec"
    | "catalog"
    | "tailoring"
    | "scrum_backlog"
    | "scrum_sprint"
    | "scrum_acceptance"
    | "reference_tool";
  l12Layers: string[];
  helixSurfaces: string[];
  evidenceTables: string[];
  requiredAction: string;
}

export type VmodelZipSourceBindingStatus = "bound" | "missing" | "advisory_missing";

export interface VmodelZipSourceBinding extends VmodelZipSourceBindingDefinition {
  status: VmodelZipSourceBindingStatus;
  sourcePresent: boolean;
  actualPath: string | null;
}

export const VMODEL_ZIP_SOURCE_BINDINGS: readonly VmodelZipSourceBindingDefinition[] = [
  {
    bindingId: "zip-source:l12-level-definition",
    sourcePath: "docs/107_Vモデル・レベル定義.yaml",
    sourceCategory: "l12_level_definition",
    l12Layers: ["L1", "L2", "L3", "L4", "L5", "L6", "L7", "L8", "L9", "L10", "L11", "L12"],
    helixSurfaces: ["current-location", "drive model", "artifact-remap", "Project view"],
    evidenceTables: ["plan_registry", "roadmap_rollups", "roadmap_band_coverage", "artifact_registry"],
    requiredAction:
      "ZIP L1-L12 level definition を HELIX L0-L14 compatibility projection と current-location へ接続する",
  },
  {
    bindingId: "zip-source:typed-spec",
    sourcePath: "docs/99_型付きスペック・自動検出設計書.yaml",
    sourceCategory: "typed_spec",
    l12Layers: ["L3", "L5", "L7", "L12"],
    helixSurfaces: ["design declarations", "design references", "design impact"],
    evidenceTables: ["design_declarations", "design_references", "design_impact"],
    requiredAction:
      "spec.defines / spec.refs 相当を design_declarations / design_references に投影する",
  },
  {
    bindingId: "zip-source:catalog",
    sourcePath: "docs/catalog.yaml",
    sourceCategory: "catalog",
    l12Layers: ["L1", "L2", "L3", "L4", "L5", "L6", "L7", "L8", "L9", "L10", "L11", "L12"],
    helixSurfaces: ["design coverage gate", "artifact remap", "Project view"],
    evidenceTables: ["artifact_registry", "design_declarations", "plan_registry"],
    requiredAction:
      "catalog の done/todo/na を design_coverage_gate と artifact_remap の done/missing/reverify へ接続する",
  },
  {
    bindingId: "zip-source:profiles",
    sourcePath: "docs/profiles.yaml",
    sourceCategory: "tailoring",
    l12Layers: ["L12"],
    helixSurfaces: ["tailoring gate", "vmodel fit"],
    evidenceTables: ["design_declarations", "artifact_registry"],
    requiredAction:
      "profile の required/optional/na を solo tailoring gate へ接続し、na を missing と誤判定しない",
  },
  {
    bindingId: "zip-source:tailoring-design",
    sourcePath: "docs/52_文書化方針・テーラリング設計.yaml",
    sourceCategory: "tailoring",
    l12Layers: ["L5", "L12"],
    helixSurfaces: ["tailoring gate", "design coverage gate"],
    evidenceTables: ["design_declarations", "design_references"],
    requiredAction:
      "詳細/標準/簡易/省略の粒度を L5 詳細設計と L12 coverage の検出規則へ接続する",
  },
  {
    bindingId: "zip-source:scrum-product-backlog",
    sourcePath: "docs/112_プロダクトバックログ.yaml",
    sourceCategory: "scrum_backlog",
    l12Layers: ["L2", "L3", "L6"],
    helixSurfaces: ["Scrum operation", "current-location", "drive model", "Project view"],
    evidenceTables: ["design_declarations", "plan_registry", "project_current_location"],
    requiredAction:
      "Scrum backlog の G/EP/US を L12 要求・要件・実装 frontier として current-location へ接続する",
  },
  {
    bindingId: "zip-source:scrum-sprint-plan",
    sourcePath: "docs/116_スプリント計画.yaml",
    sourceCategory: "scrum_sprint",
    l12Layers: ["L6", "L7", "L12"],
    helixSurfaces: ["Scrum operation", "current-location", "drive model", "Project view"],
    evidenceTables: ["plan_registry", "runtime_verification_events", "project_current_location"],
    requiredAction:
      "現在スプリントのタスク状態を DB 現在地と drive model へ投影し、Forward/Reverse の起点にする",
  },
  {
    bindingId: "zip-source:scrum-acceptance",
    sourcePath: "docs/29_受入基準・BDDシナリオ.yaml",
    sourceCategory: "scrum_acceptance",
    l12Layers: ["L3", "L11", "L12"],
    helixSurfaces: ["acceptance traceability", "Scrum operation", "Project view"],
    evidenceTables: ["design_declarations", "design_references", "test_runs"],
    requiredAction:
      "Scrum AC/BDD を acceptance traceability と L12 運用後検証の観測対象へ接続する",
  },
  {
    bindingId: "zip-source:build-tool-reference",
    sourcePath: "tools/build.py",
    sourceCategory: "reference_tool",
    l12Layers: ["L12"],
    helixSurfaces: ["vmodel fit", "doctor", "architecture guard"],
    evidenceTables: ["guardrail_decisions"],
    requiredAction:
      "Python generator は reference-only とし、HELIX core runtime へ昇格させない境界を検査する",
  },
  {
    bindingId: "zip-source:spec-check-reference",
    sourcePath: "tools/spec_check.py",
    sourceCategory: "reference_tool",
    l12Layers: ["L5", "L7", "L12"],
    helixSurfaces: ["design impact", "doctor", "relation graph"],
    evidenceTables: ["design_references", "design_impact"],
    requiredAction:
      "ZIP impact/check の考え方を HELIX design impact と relation graph の検出規則へ移植する",
  },
  {
    bindingId: "zip-source:spec-types-reference",
    sourcePath: "tools/spec_types.py",
    sourceCategory: "reference_tool",
    l12Layers: ["L5", "L6"],
    helixSurfaces: ["typed declaration parser", "projection writer"],
    evidenceTables: ["design_declarations", "design_references"],
    requiredAction:
      "ZIP typed spec の型境界を TS/Bun の parser と projection writer の契約へ移植する",
  },
] as const;

export interface ZipManifestEntry {
  path: string;
  normalizedPath: string;
  extension: string;
  method: number;
  compressedSize: number;
  uncompressedSize: number;
}

export interface VmodelZipRequiredEntry {
  path: string;
  present: boolean;
  actualPath: string | null;
}

export interface VmodelZipManifestResult {
  ok: boolean;
  archivePath: string;
  present: boolean;
  rootPrefix: string | null;
  entriesTotal: number;
  byExtension: Record<string, number>;
  inventorySignature: VmodelZipInventorySignature;
  required: VmodelZipRequiredEntry[];
  findings: Array<{
    code: "archive_missing" | "archive_parse_error" | "required_entry_missing";
    severity: "warn" | "error";
    detail: string;
  }>;
}

function extensionOf(path: string): string {
  if (path.endsWith("/")) return "(directory)";
  const base = path.split("/").pop() ?? path;
  const index = base.lastIndexOf(".");
  if (index <= 0 || index === base.length - 1) return "(none)";
  return base.slice(index + 1).toLowerCase();
}

function findEndOfCentralDirectory(buffer: Buffer): number {
  const minOffset = Math.max(0, buffer.length - 0xffff - 22);
  for (let offset = buffer.length - 22; offset >= minOffset; offset -= 1) {
    if (buffer.readUInt32LE(offset) === 0x06054b50) return offset;
  }
  return -1;
}

function commonRootPrefix(paths: string[]): string | null {
  const filePaths = paths.filter((path) => path.includes("/") && !path.startsWith("__MACOSX/"));
  if (filePaths.length === 0) return null;
  const roots = new Set(filePaths.map((path) => path.split("/", 1)[0]).filter(Boolean));
  if (roots.size !== 1) return null;
  const [root] = [...roots];
  if (!root) return null;
  return filePaths.every((path) => path === root || path.startsWith(`${root}/`)) ? root : null;
}

function buildVmodelZipInventorySignature(input: {
  present: boolean;
  rootPrefix: string | null;
  entriesTotal: number;
  byExtension: Record<string, number>;
}): VmodelZipInventorySignature {
  const expected = VMODEL_ZIP_EXPECTED_INVENTORY_SIGNATURE;
  const expectedByExtension = { ...expected.byExtension };
  const actualByExtension = Object.fromEntries(
    Object.keys(expectedByExtension).map((extension) => [
      extension,
      input.byExtension[extension] ?? 0,
    ]),
  );
  const mismatches: VmodelZipInventoryMismatch[] = [];
  if (!input.present) {
    return {
      status: "advisory_missing",
      expected_root_prefix: expected.rootPrefix,
      actual_root_prefix: null,
      expected_entries_total: expected.entriesTotal,
      actual_entries_total: 0,
      expected_by_extension: expectedByExtension,
      actual_by_extension: actualByExtension,
      mismatches,
    };
  }
  if (input.rootPrefix !== expected.rootPrefix) {
    mismatches.push({
      field: "root_prefix",
      expected: expected.rootPrefix,
      actual: input.rootPrefix ?? "-",
    });
  }
  if (input.entriesTotal !== expected.entriesTotal) {
    mismatches.push({
      field: "entries_total",
      expected: expected.entriesTotal,
      actual: input.entriesTotal,
    });
  }
  for (const [extension, expectedCount] of Object.entries(expectedByExtension)) {
    const actual = input.byExtension[extension] ?? 0;
    if (actual !== expectedCount) {
      mismatches.push({
        field: `extension:${extension}`,
        expected: expectedCount,
        actual,
      });
    }
  }
  return {
    status: mismatches.length === 0 ? "match" : "mismatch",
    expected_root_prefix: expected.rootPrefix,
    actual_root_prefix: input.rootPrefix,
    expected_entries_total: expected.entriesTotal,
    actual_entries_total: input.entriesTotal,
    expected_by_extension: expectedByExtension,
    actual_by_extension: actualByExtension,
    mismatches,
  };
}

export function readZipManifestEntries(archivePath: string): {
  entries: ZipManifestEntry[];
  rootPrefix: string | null;
} {
  const buffer = readFileSync(archivePath);
  const eocdOffset = findEndOfCentralDirectory(buffer);
  if (eocdOffset < 0) {
    throw new Error("ZIP end-of-central-directory record was not found");
  }

  const entriesOnThisDisk = buffer.readUInt16LE(eocdOffset + 8);
  const entriesTotal = buffer.readUInt16LE(eocdOffset + 10);
  if (entriesOnThisDisk !== entriesTotal) {
    throw new Error("multi-disk ZIP archives are not supported");
  }

  const centralDirectorySize = buffer.readUInt32LE(eocdOffset + 12);
  const centralDirectoryOffset = buffer.readUInt32LE(eocdOffset + 16);
  const centralDirectoryEnd = centralDirectoryOffset + centralDirectorySize;
  if (centralDirectoryEnd > buffer.length) {
    throw new Error("ZIP central-directory range is outside the archive");
  }

  const rawEntries: Array<Omit<ZipManifestEntry, "normalizedPath" | "extension">> = [];
  let offset = centralDirectoryOffset;
  for (let index = 0; index < entriesTotal; index += 1) {
    if (offset + 46 > centralDirectoryEnd || buffer.readUInt32LE(offset) !== 0x02014b50) {
      throw new Error(`ZIP central-directory header is invalid at entry ${index}`);
    }
    const method = buffer.readUInt16LE(offset + 10);
    const compressedSize = buffer.readUInt32LE(offset + 20);
    const uncompressedSize = buffer.readUInt32LE(offset + 24);
    const fileNameLength = buffer.readUInt16LE(offset + 28);
    const extraLength = buffer.readUInt16LE(offset + 30);
    const commentLength = buffer.readUInt16LE(offset + 32);
    const nameStart = offset + 46;
    const nameEnd = nameStart + fileNameLength;
    if (nameEnd > centralDirectoryEnd) {
      throw new Error(`ZIP central-directory filename is truncated at entry ${index}`);
    }
    const path = buffer.toString("utf8", nameStart, nameEnd).replace(/\\/g, "/");
    rawEntries.push({ path, method, compressedSize, uncompressedSize });
    offset = nameEnd + extraLength + commentLength;
  }

  const rootPrefix = commonRootPrefix(rawEntries.map((entry) => entry.path));
  const entries = rawEntries.map((entry): ZipManifestEntry => {
    const normalizedPath =
      rootPrefix && entry.path.startsWith(`${rootPrefix}/`)
        ? entry.path.slice(rootPrefix.length + 1)
        : entry.path;
    return {
      ...entry,
      normalizedPath,
      extension: extensionOf(normalizedPath),
    };
  });

  return { entries, rootPrefix };
}

export function analyzeVmodelZipManifest(
  repoRoot: string,
  input: {
    filename?: string;
    requiredPaths?: readonly string[];
  } = {},
): VmodelZipManifestResult {
  const filename = input.filename ?? VMODEL_ZIP_FILENAME;
  const archivePath = join(repoRoot, filename);
  const requiredPaths = input.requiredPaths ?? VMODEL_ZIP_REQUIRED_PATHS;
  if (!existsSync(archivePath)) {
    return {
      ok: true,
      archivePath,
      present: false,
      rootPrefix: null,
      entriesTotal: 0,
      byExtension: {},
      inventorySignature: buildVmodelZipInventorySignature({
        present: false,
        rootPrefix: null,
        entriesTotal: 0,
        byExtension: {},
      }),
      required: requiredPaths.map((path) => ({ path, present: false, actualPath: null })),
      findings: [
        {
          code: "archive_missing",
          severity: "warn",
          detail: `${filename} が無いため ZIP manifest 検査は advisory skip`,
        },
      ],
    };
  }

  try {
    const { entries, rootPrefix } = readZipManifestEntries(archivePath);
    const byExtension: Record<string, number> = {};
    const byNormalizedPath = new Map(entries.map((entry) => [entry.normalizedPath, entry]));
    for (const entry of entries) {
      byExtension[entry.extension] = (byExtension[entry.extension] ?? 0) + 1;
    }
    const required = requiredPaths.map((path): VmodelZipRequiredEntry => {
      const entry = byNormalizedPath.get(path);
      return {
        path,
        present: Boolean(entry),
        actualPath: entry?.path ?? null,
      };
    });
    const findings = required
      .filter((entry) => !entry.present)
      .map((entry) => ({
        code: "required_entry_missing" as const,
        severity: "error" as const,
        detail: `required ZIP source is missing: ${entry.path}`,
      }));
    const inventorySignature = buildVmodelZipInventorySignature({
      present: true,
      rootPrefix,
      entriesTotal: entries.length,
      byExtension,
    });
    return {
      ok: findings.length === 0 && inventorySignature.status === "match",
      archivePath,
      present: true,
      rootPrefix,
      entriesTotal: entries.length,
      byExtension,
      inventorySignature,
      required,
      findings,
    };
  } catch (error) {
    return {
      ok: false,
      archivePath,
      present: true,
      rootPrefix: null,
      entriesTotal: 0,
      byExtension: {},
      inventorySignature: buildVmodelZipInventorySignature({
        present: true,
        rootPrefix: null,
        entriesTotal: 0,
        byExtension: {},
      }),
      required: requiredPaths.map((path) => ({ path, present: false, actualPath: null })),
      findings: [
        {
          code: "archive_parse_error",
          severity: "error",
          detail: String(error),
        },
      ],
    };
  }
}

export function buildVmodelZipSourceBindings(
  result: VmodelZipManifestResult,
): VmodelZipSourceBinding[] {
  const requiredByPath = new Map(result.required.map((entry) => [entry.path, entry]));
  return VMODEL_ZIP_SOURCE_BINDINGS.map((binding): VmodelZipSourceBinding => {
    const requiredEntry = requiredByPath.get(binding.sourcePath);
    const sourcePresent = Boolean(result.present && requiredEntry?.present);
    return {
      ...binding,
      status: !result.present ? "advisory_missing" : sourcePresent ? "bound" : "missing",
      sourcePresent,
      actualPath: sourcePresent ? (requiredEntry?.actualPath ?? binding.sourcePath) : null,
    };
  });
}

export function vmodelZipManifestMessages(result: VmodelZipManifestResult): string[] {
  const bindings = buildVmodelZipSourceBindings(result);
  const bound = bindings.filter((binding) => binding.status === "bound").length;
  const missing = bindings.filter((binding) => binding.status === "missing").length;
  const advisory = bindings.filter((binding) => binding.status === "advisory_missing").length;
  const bindingStatus = missing > 0 ? "violation" : advisory > 0 ? "advisory" : "OK";
  const bindingTables = [...new Set(bindings.flatMap((binding) => binding.evidenceTables))].join(
    ",",
  );
  if (!result.present) {
    return [
      `vmodel-zip-manifest - advisory: ${result.findings[0]?.detail ?? "archive missing"}`,
      `vmodel-zip-inventory-signature - advisory: expected_entries=${result.inventorySignature.expected_entries_total}`,
      `vmodel-zip-source-bindings - advisory: bound=${bound} missing=${missing} advisory=${advisory} tables=${bindingTables || "-"}`,
    ];
  }
  const extensionSummary = ["yaml", "md", "xlsx", "png", "py", "json", "feature"]
    .map((extension) => `${extension}=${result.byExtension[extension] ?? 0}`)
    .join(" ");
  const presentRequired = result.required.filter((entry) => entry.present).length;
  const summary = result.ok
    ? `vmodel-zip-manifest - OK (entries=${result.entriesTotal}, root=${result.rootPrefix ?? "-"}, ${extensionSummary}, required=${presentRequired}/${result.required.length})`
    : `vmodel-zip-manifest - violation: entries=${result.entriesTotal}, root=${result.rootPrefix ?? "-"}, ${extensionSummary}, required=${presentRequired}/${result.required.length}`;
  return [
    summary,
    `vmodel-zip-inventory-signature - ${result.inventorySignature.status === "match" ? "OK" : "violation"}: status=${result.inventorySignature.status} entries=${result.inventorySignature.actual_entries_total}/${result.inventorySignature.expected_entries_total} root=${result.inventorySignature.actual_root_prefix ?? "-"}/${result.inventorySignature.expected_root_prefix} mismatches=${result.inventorySignature.mismatches.length}`,
    `vmodel-zip-source-bindings - ${bindingStatus}: bound=${bound} missing=${missing} advisory=${advisory} tables=${bindingTables || "-"}`,
    ...result.findings.map(
      (finding) => `vmodel-zip-manifest - ${finding.severity}: ${finding.code} (${finding.detail})`,
    ),
  ];
}

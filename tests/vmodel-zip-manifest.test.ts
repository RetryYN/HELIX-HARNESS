import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  analyzeVmodelZipManifest,
  buildVmodelZipSourceBindings,
  readZipManifestEntries,
  VMODEL_ZIP_FILENAME,
  VMODEL_ZIP_REQUIRED_PATHS,
  VMODEL_ZIP_SOURCE_BINDINGS,
  vmodelZipManifestMessages,
  vmodelZipSourceBindingDefinitionViolations,
} from "../src/vmodel/zip-manifest";

function minimalZip(paths: string[]): Buffer {
  const locals: Buffer[] = [];
  const centrals: Buffer[] = [];
  let offset = 0;
  for (const path of paths) {
    const name = Buffer.from(path, "utf8");
    const local = Buffer.alloc(30 + name.length);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0x0800, 6);
    local.writeUInt16LE(0, 8);
    local.writeUInt32LE(0, 14);
    local.writeUInt32LE(0, 18);
    local.writeUInt32LE(0, 22);
    local.writeUInt16LE(name.length, 26);
    name.copy(local, 30);

    const central = Buffer.alloc(46 + name.length);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0x0800, 8);
    central.writeUInt16LE(0, 10);
    central.writeUInt32LE(0, 16);
    central.writeUInt32LE(0, 20);
    central.writeUInt32LE(0, 24);
    central.writeUInt16LE(name.length, 28);
    central.writeUInt32LE(offset, 42);
    name.copy(central, 46);

    locals.push(local);
    centrals.push(central);
    offset += local.length;
  }

  const centralOffset = offset;
  const centralSize = centrals.reduce((sum, part) => sum + part.length, 0);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(paths.length, 8);
  eocd.writeUInt16LE(paths.length, 10);
  eocd.writeUInt32LE(centralSize, 12);
  eocd.writeUInt32LE(centralOffset, 16);

  return Buffer.concat([...locals, ...centrals, eocd]);
}

describe("V-model ZIP manifest", () => {
  it("root prefix を正規化して ZIP 必須 source を検出する", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-vmodel-zip-"));
    const archivePath = join(root, VMODEL_ZIP_FILENAME);
    try {
      writeFileSync(
        archivePath,
        minimalZip([
          ...VMODEL_ZIP_REQUIRED_PATHS.map((path) => `hybrid-docgen/${path}`),
          "hybrid-docgen/build/107_Vモデル・レベル定義_見本.xlsx",
          "hybrid-docgen/build/md/107_Vモデル・レベル定義.md",
        ]),
      );

      const manifest = readZipManifestEntries(archivePath);
      expect(manifest.rootPrefix).toBe("hybrid-docgen");
      expect(manifest.entries.map((entry) => entry.normalizedPath)).toContain(
        "docs/107_Vモデル・レベル定義.yaml",
      );

      const result = analyzeVmodelZipManifest(root);
      expect(result.ok).toBe(false);
      expect(result.entriesTotal).toBe(23);
      expect(result.byExtension).toMatchObject({ yaml: 16, py: 5, xlsx: 1, md: 1 });
      expect(result.inventorySignature).toMatchObject({
        status: "mismatch",
        expected_entries_total: 703,
        actual_entries_total: 23,
      });
      expect(result.required.every((entry) => entry.present)).toBe(true);
      const bindings = buildVmodelZipSourceBindings(result);
      expect(bindings).toHaveLength(21);
      expect(bindings.every((binding) => binding.status === "bound")).toBe(true);
      expect(vmodelZipSourceBindingDefinitionViolations()).toEqual([]);
      expect(
        bindings.find((binding) => binding.bindingId === "zip-source:typed-spec"),
      ).toMatchObject({
        sourcePath: "docs/99_型付きスペック・自動検出設計書.yaml",
        evidenceTables: ["design_declarations", "design_references", "design_impact"],
        helixSurfaces: ["design declarations", "design references", "design impact"],
      });
      expect(vmodelZipManifestMessages(result)[0]).toContain("vmodel-zip-manifest - violation");
      expect(vmodelZipManifestMessages(result)[0]).toContain("required=21/21");
      expect(vmodelZipManifestMessages(result)[1]).toContain(
        "vmodel-zip-inventory-signature - violation",
      );
      expect(vmodelZipManifestMessages(result)[2]).toContain("vmodel-zip-source-bindings - OK");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("必須 source と binding の全単射を強制する", () => {
    const withoutAssign = VMODEL_ZIP_SOURCE_BINDINGS.filter(
      (binding) => binding.sourcePath !== "tools/assign.py",
    );
    expect(vmodelZipSourceBindingDefinitionViolations(withoutAssign)).toContain(
      "missing_source_binding=tools/assign.py",
    );

    const duplicate = [...VMODEL_ZIP_SOURCE_BINDINGS, ...VMODEL_ZIP_SOURCE_BINDINGS.slice(0, 1)];
    expect(vmodelZipSourceBindingDefinitionViolations(duplicate)).toEqual(
      expect.arrayContaining([
        "duplicate_binding_id=zip-source:l12-level-definition",
        "duplicate_source_path=docs/107_Vモデル・レベル定義.yaml",
      ]),
    );
  });

  it("required source が不足している ZIP は violation にする", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-vmodel-zip-missing-"));
    try {
      writeFileSync(
        join(root, VMODEL_ZIP_FILENAME),
        minimalZip(["hybrid-docgen/docs/107_Vモデル・レベル定義.yaml"]),
      );

      const result = analyzeVmodelZipManifest(root);
      expect(result.ok).toBe(false);
      expect(result.required.filter((entry) => entry.present)).toHaveLength(1);
      expect(
        buildVmodelZipSourceBindings(result).filter((binding) => binding.status === "missing"),
      ).toHaveLength(20);
      expect(result.inventorySignature.status).toBe("mismatch");
      expect(result.findings.map((finding) => finding.code)).toContain("required_entry_missing");
      expect(vmodelZipManifestMessages(result)[0]).toContain("violation");
      expect(vmodelZipManifestMessages(result)[2]).toContain(
        "vmodel-zip-source-bindings - violation",
      );
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("正規化後の ZIP source path 重複を fail-close する", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-vmodel-zip-duplicate-"));
    try {
      const duplicatePath = "hybrid-docgen/docs/107_Vモデル・レベル定義.yaml";
      writeFileSync(
        join(root, VMODEL_ZIP_FILENAME),
        minimalZip([
          ...VMODEL_ZIP_REQUIRED_PATHS.map((path) => `hybrid-docgen/${path}`),
          duplicatePath,
        ]),
      );

      const result = analyzeVmodelZipManifest(root);
      expect(result.ok).toBe(false);
      expect(result.required.every((entry) => entry.present)).toBe(true);
      expect(result.findings).toContainEqual(
        expect.objectContaining({
          code: "duplicate_normalized_path",
          severity: "error",
        }),
      );
      expect(vmodelZipManifestMessages(result).join("\n")).toContain("duplicate_normalized_path");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("archive が無い場合は advisory skip として扱う", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-vmodel-zip-absent-"));
    try {
      const result = analyzeVmodelZipManifest(root);
      expect(result.ok).toBe(true);
      expect(result.present).toBe(false);
      expect(result.findings[0]).toMatchObject({
        code: "archive_missing",
        severity: "warn",
      });
      expect(result.inventorySignature.status).toBe("advisory_missing");
      expect(
        buildVmodelZipSourceBindings(result).every(
          (binding) => binding.status === "advisory_missing",
        ),
      ).toBe(true);
      expect(vmodelZipManifestMessages(result)[2]).toContain(
        "vmodel-zip-source-bindings - advisory",
      );
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});

import { readFileSync } from "node:fs";
import ts from "typescript";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";

const MANIFEST_PATH =
  "docs/test-design/helix/fixtures/layer-ledger-pair-gate-progress-s01.manifest";

interface ArtifactRecordV1 {
  path: string;
  slice_id: string;
}

interface StrictDesignManifestV1 {
  artifact_inventory: ArtifactRecordV1[];
}

function loadManifest(): StrictDesignManifestV1 {
  return parse(readFileSync(MANIFEST_PATH, "utf8")) as StrictDesignManifestV1;
}

function extractTypeScriptFences(content: string): string[] {
  return [...content.matchAll(/```ts\s*\n([\s\S]*?)```/g)].map(
    (match) => match[1] ?? "",
  );
}

function semanticDiagnostics(path: string, content: string): string[] {
  const virtualPath = `${path}.ts`;
  const options: ts.CompilerOptions = {
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    noEmit: true,
    skipLibCheck: true,
    strict: true,
    target: ts.ScriptTarget.ES2022,
  };
  const host = ts.createCompilerHost(options, true);
  const originalFileExists = host.fileExists.bind(host);
  const originalGetSourceFile = host.getSourceFile.bind(host);
  const originalReadFile = host.readFile.bind(host);

  host.fileExists = (candidate) =>
    candidate === virtualPath || originalFileExists(candidate);
  host.readFile = (candidate) =>
    candidate === virtualPath ? content : originalReadFile(candidate);
  host.getSourceFile = (candidate, languageVersion, onError, shouldCreate) =>
    candidate === virtualPath
      ? ts.createSourceFile(candidate, content, languageVersion, true)
      : originalGetSourceFile(
          candidate,
          languageVersion,
          onError,
          shouldCreate,
        );

  const program = ts.createProgram([virtualPath], options, host);
  return ts
    .getPreEmitDiagnostics(program)
    .filter((diagnostic) => !diagnostic.file || diagnostic.file.fileName === virtualPath)
    .map((diagnostic) => {
      const position =
        diagnostic.file && diagnostic.start !== undefined
          ? diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start)
          : null;
      const location = position
        ? `${path}:${position.line + 1}:${position.character + 1}`
        : path;
      return `${location} TS${diagnostic.code} ${ts.flattenDiagnosticMessageText(diagnostic.messageText, " ")}`;
    });
}

describe("Infinity Loop strict design contract", () => {
  const manifest = loadManifest();
  const artifacts = manifest.artifact_inventory;
  const functionDesigns = artifacts.filter((artifact) =>
    artifact.path.includes("/L6-function-design/"),
  );

  it("76成果物・19 L6スライスを固定分母として読む", () => {
    expect(artifacts).toHaveLength(76);
    expect(functionDesigns).toHaveLength(19);
  });

  it("76成果物の型宣言名をV1へ閉じる", () => {
    const findings: string[] = [];
    for (const artifact of artifacts) {
      const lines = readFileSync(artifact.path, "utf8").split(/\r?\n/);
      lines.forEach((line, index) => {
        const declaration = line.match(
          /^(?:export\s+)?(?:interface|type)\s+([A-Za-z0-9_]+)/,
        );
        if (declaration && !declaration[1]?.endsWith("V1")) {
          findings.push(`${artifact.path}:${index + 1}:${declaration[1]}`);
        }
      });
    }
    expect(findings).toEqual([]);
  });

  it("L6で未定義generic Resultへの縮退を認めない", () => {
    const findings = functionDesigns.flatMap((artifact) => {
      const content = readFileSync(artifact.path, "utf8");
      return /\bResult</.test(content) ? [artifact.path] : [];
    });
    expect(findings).toEqual([]);
  });

  it("全L6 TypeScript fenceを構文・意味の両方で閉じる", () => {
    const findings: string[] = [];
    for (const artifact of functionDesigns) {
      const content = readFileSync(artifact.path, "utf8");
      const fences = extractTypeScriptFences(content);
      if (fences.length === 0) {
        findings.push(`${artifact.path}: TypeScript fenceなし`);
        continue;
      }
      findings.push(...semanticDiagnostics(artifact.path, fences.join("\n")));
    }
    expect(findings).toEqual([]);
  }, 30_000);

  it("各sliceの4成果物を結合してschema衝突を拒否する", () => {
    const findings: string[] = [];
    const bySlice = new Map<string, ArtifactRecordV1[]>();
    for (const artifact of artifacts) {
      const current = bySlice.get(artifact.slice_id) ?? [];
      current.push(artifact);
      bySlice.set(artifact.slice_id, current);
    }
    for (const [sliceId, sliceArtifacts] of bySlice) {
      const fences = sliceArtifacts.flatMap((artifact) =>
        extractTypeScriptFences(readFileSync(artifact.path, "utf8")),
      );
      findings.push(
        ...semanticDiagnostics(
          `strict-design/${sliceId}`,
          fences.join("\n"),
        ),
      );
    }
    expect(findings).toEqual([]);
  }, 30_000);
});

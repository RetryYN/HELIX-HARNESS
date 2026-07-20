import { parse as parseYaml } from "yaml";
import { escapeRegExp } from "../shared/string-utils";
import { isRecord } from "../shared/value-guards";

export type DesignDeclarationSource = "frontmatter" | "fenced_yaml";

export interface DesignDeclaration {
  id: string;
  kind: string;
  title?: string;
  layer?: string;
  owner?: string;
  status?: string;
  sourcePath: string;
  source: DesignDeclarationSource;
}

export interface DesignReference {
  from: string;
  to: string;
  kind?: string;
  sourcePath: string;
  source: DesignDeclarationSource;
}

export type DesignDeclarationFindingCode =
  | "spec_missing"
  | "spec_parse_error"
  | "invalid_define"
  | "invalid_reference"
  | "declaration_only"
  | "undeclared_definition"
  | "duplicate_body_definition"
  | "duplicate_define"
  | "unresolved_reference"
  | "reference_source_missing";

export interface DesignDeclarationFinding {
  code: DesignDeclarationFindingCode;
  severity: "error" | "warn";
  path: string;
  detail: string;
}

export interface ParsedDesignDeclarationDoc {
  path: string;
  /** 同一 frontmatter parse 結果から取り出す従属契約。typed spec の再解析は禁止する。 */
  documentAgent: unknown;
  pairArtifact?: string;
  declarations: DesignDeclaration[];
  references: DesignReference[];
  findings: DesignDeclarationFinding[];
  ok: boolean;
}

export interface DesignDeclarationAnalysis {
  documents: ParsedDesignDeclarationDoc[];
  declarations: DesignDeclaration[];
  references: DesignReference[];
  findings: DesignDeclarationFinding[];
  ok: boolean;
}

interface SpecBlock {
  source: DesignDeclarationSource;
  value: unknown;
}

function stringField(value: unknown, key: string): string | undefined {
  if (!isRecord(value)) return undefined;
  const raw = value[key];
  return typeof raw === "string" && raw.trim() ? raw.trim() : undefined;
}

function frontmatterBlock(content: string): string | null {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  return match?.[1] ?? null;
}

function fencedYamlBlocks(content: string): string[] {
  const blocks: string[] = [];
  for (const match of content.matchAll(/```ya?ml\r?\n([\s\S]*?)\r?\n```/gi)) {
    if (match[1]?.trim()) blocks.push(match[1]);
  }
  return blocks;
}

function bodyWithoutDeclarationBlocks(content: string): string {
  return content
    .replace(/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/, "\n")
    .replace(/```ya?ml\r?\n[\s\S]*?\r?\n```/gi, "\n");
}

function bodyHasId(body: string, id: string): boolean {
  return new RegExp(`(^|[^A-Za-z0-9_-])${escapeRegExp(id)}([^A-Za-z0-9_-]|$)`).test(body);
}

function bodyDefinitionIds(body: string): string[] {
  const ignoredPrefixes = new Set(["PLAN", "ADR"]);
  // これらは本文に現れる規格・encoding名であり、design declaration IDではない。
  // 正当な一段ID (R-001 / TD-001 等) を命名規則だけで落とさないよう狭く除外する。
  const nonDeclarationTerms = new Set([
    "UTF-8",
    "UTF-16",
    "UTF-32",
    "ISO-8601",
    "RFC-3339",
    "SHA-256",
  ]);
  const ids = new Set<string>();
  for (const match of body.matchAll(/\b[A-Z][A-Za-z0-9]*(?:-[A-Za-z0-9]+)+\b/g)) {
    const id = match[0];
    const end = (match.index ?? 0) + id.length;
    const prefix = id.split("-", 1)[0];
    if (ignoredPrefixes.has(prefix)) continue;
    if (nonDeclarationTerms.has(id)) continue;
    if (/^L\d+$/i.test(prefix)) continue;
    if (id.endsWith("-ID")) continue;
    if (body.slice(end, end + 2) === "-*") continue;
    if (body.slice(end, end + 2) === "..") continue;
    ids.add(id);
  }
  return [...ids].sort();
}

function duplicateBodyDefinitionIds(body: string): string[] {
  const duplicates = new Set<string>();
  let seenInSection = new Set<string>();
  let idDefinitionTable = false;
  for (const line of body.split(/\r?\n/)) {
    if (/^#{1,6}\s+/.test(line)) {
      seenInSection = new Set<string>();
      idDefinitionTable = false;
      continue;
    }
    if (/^\|\s*ID\s*\|/i.test(line)) {
      idDefinitionTable = true;
      continue;
    }
    if (!line.startsWith("|")) {
      idDefinitionTable = false;
      continue;
    }
    if (!idDefinitionTable || /^\|\s*:?-+/.test(line)) continue;
    const match = line.match(/^\|\s*([A-Z][A-Za-z0-9]*(?:-[A-Za-z0-9]+)+)\s*\|/);
    const id = match?.[1];
    if (!id || id.endsWith("-ID")) continue;
    if (seenInSection.has(id)) duplicates.add(id);
    seenInSection.add(id);
  }
  return [...duplicates].sort();
}

function parseYamlDocument(input: {
  path: string;
  source: DesignDeclarationSource;
  text: string;
}): { value: unknown; finding?: DesignDeclarationFinding } {
  try {
    return { value: parseYaml(input.text) };
  } catch (error) {
    return {
      value: null,
      finding: {
        code: "spec_parse_error",
        severity: "error",
        path: input.path,
        detail: `${input.source}: ${String(error)}`,
      },
    };
  }
}

function extractSpecBlocks(
  path: string,
  content: string,
): {
  blocks: SpecBlock[];
  findings: DesignDeclarationFinding[];
  frontmatter: unknown;
} {
  const blocks: SpecBlock[] = [];
  const findings: DesignDeclarationFinding[] = [];
  let frontmatter: unknown;
  const fm = frontmatterBlock(content);
  if (fm) {
    const parsed = parseYamlDocument({ path, source: "frontmatter", text: fm });
    frontmatter = parsed.value;
    if (parsed.finding) findings.push(parsed.finding);
    if (isRecord(parsed.value) && parsed.value.spec !== undefined) {
      blocks.push({ source: "frontmatter", value: parsed.value.spec });
    }
  }

  for (const text of fencedYamlBlocks(content)) {
    const parsed = parseYamlDocument({ path, source: "fenced_yaml", text });
    if (parsed.finding) {
      findings.push(parsed.finding);
      continue;
    }
    if (isRecord(parsed.value) && parsed.value.spec !== undefined) {
      blocks.push({ source: "fenced_yaml", value: parsed.value.spec });
    }
  }

  if (blocks.length === 0 && findings.length === 0) {
    findings.push({
      code: "spec_missing",
      severity: "warn",
      path,
      detail: "spec.defines が無い。heuristic-only detection は完了根拠にしない",
    });
  }

  return { blocks, findings, frontmatter };
}

function parseDefine(input: { path: string; source: DesignDeclarationSource; value: unknown }): {
  declaration?: DesignDeclaration;
  finding?: DesignDeclarationFinding;
} {
  const id = stringField(input.value, "id");
  const kind = stringField(input.value, "kind");
  if (!id || !kind) {
    return {
      finding: {
        code: "invalid_define",
        severity: "error",
        path: input.path,
        detail: `${input.source}: defines[] は id と kind を必須にする`,
      },
    };
  }
  return {
    declaration: {
      id,
      kind,
      title: stringField(input.value, "title") ?? stringField(input.value, "name"),
      layer: stringField(input.value, "layer"),
      owner: stringField(input.value, "owner"),
      status: stringField(input.value, "status"),
      sourcePath: input.path,
      source: input.source,
    },
  };
}

function parseReference(input: {
  path: string;
  source: DesignDeclarationSource;
  value: unknown;
  field: "refs" | "traces";
}): { reference?: DesignReference; finding?: DesignDeclarationFinding } {
  const from = stringField(input.value, "from");
  const to = stringField(input.value, "to");
  if (!from || !to) {
    return {
      finding: {
        code: "invalid_reference",
        severity: "error",
        path: input.path,
        detail: `${input.source}: spec.${input.field}[] は from と to を必須にする`,
      },
    };
  }
  return {
    reference: {
      from,
      to,
      kind: stringField(input.value, "kind") ?? input.field,
      sourcePath: input.path,
      source: input.source,
    },
  };
}

export function parseDesignDeclarationDoc(
  path: string,
  content: string,
): ParsedDesignDeclarationDoc {
  const declarations: DesignDeclaration[] = [];
  const references: DesignReference[] = [];
  const findings: DesignDeclarationFinding[] = [];
  const extracted = extractSpecBlocks(path, content);
  findings.push(...extracted.findings);

  for (const block of extracted.blocks) {
    if (!isRecord(block.value)) {
      findings.push({
        code: "spec_parse_error",
        severity: "error",
        path,
        detail: `${block.source}: spec は object でなければならない`,
      });
      continue;
    }
    const defines = block.value.defines;
    if (!Array.isArray(defines)) {
      findings.push({
        code: "invalid_define",
        severity: "error",
        path,
        detail: `${block.source}: spec.defines は array でなければならない`,
      });
    } else {
      for (const value of defines) {
        const parsed = parseDefine({ path, source: block.source, value });
        if (parsed.declaration) declarations.push(parsed.declaration);
        if (parsed.finding) findings.push(parsed.finding);
      }
    }

    for (const field of ["refs", "traces"] as const) {
      const raw = block.value[field];
      if (raw === undefined) continue;
      if (!Array.isArray(raw)) {
        findings.push({
          code: "invalid_reference",
          severity: "error",
          path,
          detail: `${block.source}: spec.${field} は array でなければならない`,
        });
        continue;
      }
      for (const value of raw) {
        const parsed = parseReference({ path, source: block.source, value, field });
        if (parsed.reference) references.push(parsed.reference);
        if (parsed.finding) findings.push(parsed.finding);
      }
    }
  }

  const seen = new Map<string, DesignDeclaration>();
  for (const declaration of declarations) {
    const previous = seen.get(declaration.id);
    if (previous) {
      findings.push({
        code: "duplicate_define",
        severity: "error",
        path,
        detail: `${declaration.id}: ${previous.sourcePath} と ${declaration.sourcePath} で重複`,
      });
    } else {
      seen.set(declaration.id, declaration);
    }
  }

  const body = bodyWithoutDeclarationBlocks(content);
  for (const id of duplicateBodyDefinitionIds(body)) {
    findings.push({
      code: "duplicate_body_definition",
      severity: "error",
      path,
      detail: `${id}: 同一 section の本文定義 ID が重複している`,
    });
  }
  for (const declaration of declarations) {
    if (!bodyHasId(body, declaration.id)) {
      findings.push({
        code: "declaration_only",
        severity: "error",
        path,
        detail: `${declaration.id}: spec.defines にあるが本文に対応する定義が無い`,
      });
    }
  }

  return {
    path,
    documentAgent: isRecord(extracted.frontmatter)
      ? extracted.frontmatter.document_agent
      : undefined,
    pairArtifact: stringField(extracted.frontmatter, "pair_artifact"),
    declarations,
    references,
    findings,
    ok: findings.every((finding) => finding.severity !== "error"),
  };
}

export function analyzeDesignDeclarations(
  docs: { path: string; content: string }[],
): DesignDeclarationAnalysis {
  const documents = docs.map((doc) => parseDesignDeclarationDoc(doc.path, doc.content));
  const declarations = documents.flatMap((doc) => doc.declarations);
  const references = documents.flatMap((doc) => doc.references);
  const findings = documents.flatMap((doc) => doc.findings);
  const byId = new Map<string, DesignDeclaration>();

  for (const declaration of declarations) {
    const previous = byId.get(declaration.id);
    if (previous) {
      findings.push({
        code: "duplicate_define",
        severity: "error",
        path: declaration.sourcePath,
        detail: `${declaration.id}: ${previous.sourcePath} と ${declaration.sourcePath} で重複`,
      });
    } else {
      byId.set(declaration.id, declaration);
    }
  }

  for (const reference of references) {
    if (!byId.has(reference.from)) {
      findings.push({
        code: "reference_source_missing",
        severity: "error",
        path: reference.sourcePath,
        detail: `${reference.from} -> ${reference.to}: from が defines に存在しない`,
      });
    }
    if (!byId.has(reference.to)) {
      findings.push({
        code: "unresolved_reference",
        severity: "error",
        path: reference.sourcePath,
        detail: `${reference.from} -> ${reference.to}: to が defines に存在しない`,
      });
    }
  }

  for (const doc of documents) {
    const body = bodyWithoutDeclarationBlocks(
      docs.find((item) => item.path === doc.path)?.content ?? "",
    );
    for (const id of bodyDefinitionIds(body)) {
      if (!byId.has(id)) {
        findings.push({
          code: "undeclared_definition",
          severity: "error",
          path: doc.path,
          detail: `${id}: 本文に定義/参照があるが spec.defines に存在しない`,
        });
      }
    }
  }

  return {
    documents,
    declarations,
    references,
    findings,
    ok: findings.every((finding) => finding.severity !== "error"),
  };
}

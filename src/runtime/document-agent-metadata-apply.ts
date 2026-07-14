import { createHash } from "node:crypto";
import type {
  DocumentAgentMetadata,
  DocumentAgentMetadataReport,
  DocumentAgentScopeManifest,
} from "../schema/document-agent-metadata";

export interface DocumentAgentMetadataSource {
  read(path: string): string | null;
}

export interface DocumentAgentMetadataChange {
  path: string;
  beforeContent: string;
  content: string;
  beforeDigest: string;
  afterDigest: string;
}

export interface DocumentAgentMetadataApplyPlan {
  manifestDigest: string;
  selections: string[];
  changes: DocumentAgentMetadataChange[];
}

export interface DocumentAgentMetadataWritePort {
  write(change: DocumentAgentMetadataChange): { durable: boolean };
  restore(change: DocumentAgentMetadataChange): { durable: boolean };
}

export interface DocumentAgentMetadataApplyReceipt {
  ok: boolean;
  partial: boolean;
  changes: Array<{
    path: string;
    beforeDigest: string;
    afterDigest: string;
    durable: boolean;
    rolledBack: boolean;
  }>;
}

function digest(content: string): string {
  return `sha256:${createHash("sha256").update(content).digest("hex")}`;
}

function canonicalPath(path: string): boolean {
  return (
    path.length > 0 &&
    !path.startsWith("/") &&
    !path.includes("\\") &&
    !path.split("/").some((part) => !part || part === "." || part === "..")
  );
}

function yamlList(values: readonly string[]): string {
  return values.map((value) => `    - ${value}\n`).join("");
}

function renderMetadata(value: DocumentAgentMetadata): string {
  return [
    "document_agent:",
    "  defines:",
    yamlList(value.defines).trimEnd(),
    "  read_first:",
    yamlList(value.read_first).trimEnd(),
    "  done_when:",
    "    required_declaration_ids:",
    yamlList(value.done_when.required_declaration_ids).trimEnd(),
    "    required_read_first:",
    yamlList(value.done_when.required_read_first).trimEnd(),
    `    required_pair_artifact: ${value.done_when.required_pair_artifact ?? "null"}`,
    "    required_gates:",
    yamlList(value.done_when.required_gates).trimEnd(),
  ].join("\n");
}

export function renderDocumentAgentMetadata(
  content: string,
  metadata: DocumentAgentMetadata,
): string {
  const frontmatter = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!frontmatter) throw new Error("document_agent_frontmatter_required");
  const rendered = renderMetadata(metadata);
  const body = frontmatter[1];
  const existing = /^document_agent:\r?\n(?:(?:[ \t]+[^\r\n]*|)\r?\n)*/m;
  const nextBody = existing.test(body)
    ? body.replace(existing, `${rendered}\n`)
    : `${rendered}\n${body}`;
  return `${content.slice(0, frontmatter.index)}---\n${nextBody}\n---${content.slice(
    (frontmatter.index ?? 0) + frontmatter[0].length,
  )}`;
}

export function planDocumentAgentMetadataApply(input: {
  manifest: DocumentAgentScopeManifest;
  report: DocumentAgentMetadataReport;
  selection: readonly string[];
  source: DocumentAgentMetadataSource;
}): DocumentAgentMetadataApplyPlan {
  const repairable = new Set([
    "metadata_invalid",
    "defines_extra",
    "read_first_missing",
    "read_first_stale",
    "done_when_mismatch",
  ]);
  if (
    input.manifest.phase !== "apply" ||
    input.report.findings.some((finding) => !repairable.has(finding.code))
  )
    throw new Error("document_agent_apply_report_not_repairable");
  const selections = [...new Set(input.selection.map((path) => path.normalize("NFC")))].sort();
  if (selections.length === 0 || selections.some((path) => !canonicalPath(path)))
    throw new Error("document_agent_apply_selection_invalid");
  if (selections.some((path) => !input.manifest.documents.includes(path)))
    throw new Error("document_agent_apply_selection_out_of_scope");
  const changes = selections.map((path) => {
    const beforeContent = input.source.read(path);
    const metadata = input.report.proposed[path];
    if (beforeContent === null || !metadata)
      throw new Error("document_agent_apply_source_unavailable");
    const content = renderDocumentAgentMetadata(beforeContent, metadata);
    return {
      path,
      beforeContent,
      content,
      beforeDigest: digest(beforeContent),
      afterDigest: digest(content),
    };
  });
  return { manifestDigest: input.report.manifest_digest, selections, changes };
}

export function applyDocumentAgentMetadata(
  plan: DocumentAgentMetadataApplyPlan,
  port: DocumentAgentMetadataWritePort,
): DocumentAgentMetadataApplyReceipt {
  const receipts: DocumentAgentMetadataApplyReceipt["changes"] = [];
  try {
    for (const change of plan.changes) {
      const result = port.write(change);
      if (!result.durable) throw new Error("document_agent_apply_not_durable");
      receipts.push({ ...change, durable: true, rolledBack: false });
    }
    return { ok: true, partial: false, changes: receipts };
  } catch {
    let rollbackFailed = false;
    for (const receipt of [...receipts].reverse()) {
      try {
        receipt.rolledBack = port.restore(
          plan.changes.find(
            (change) => change.path === receipt.path,
          ) as DocumentAgentMetadataChange,
        ).durable;
        if (!receipt.rolledBack) rollbackFailed = true;
      } catch {
        rollbackFailed = true;
      }
    }
    return { ok: false, partial: rollbackFailed, changes: receipts };
  }
}

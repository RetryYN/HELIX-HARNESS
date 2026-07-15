import { canonicalJson, sha256Digest } from "./digest";
import type { SemanticDocumentDelta } from "./document-semantic-diff";

export interface DocumentChangeReport {
  schema_version: 1;
  base_snapshot_digest: string;
  current_snapshot_digest: string;
  delta: SemanticDocumentDelta;
  release_notes: string[];
  markdown: string;
  ok: boolean;
}

function section(title: string, values: string[]): string[] {
  return values.length === 0 ? [] : [`## ${title}`, ...values.map((value) => `- ${value}`), ""];
}

export function buildDocumentChangeReport(input: {
  baseSnapshotDigest: string;
  currentSnapshotDigest: string;
  delta: SemanticDocumentDelta;
}): DocumentChangeReport {
  const notes = [
    ...input.delta.added_documents.map((path) => `追加: ${path}`),
    ...input.delta.removed_documents.map((path) => `削除: ${path}`),
    ...input.delta.added_ids.map((id) => `定義追加: ${id}`),
    ...input.delta.removed_ids.map((id) => `定義削除: ${id}`),
    ...input.delta.history_added.map(({ path, line }) => `改版: ${path} — ${line}`),
    ...input.delta.findings
      .filter((finding) => finding.code === "unrecorded_change")
      .map((finding) => `要確認: ${finding.path} は改版履歴なしで変更されています`),
  ];
  const markdown = [
    "# 文書変更レポート",
    "",
    `- 基準snapshot: ${input.baseSnapshotDigest}`,
    `- 現在snapshot: ${input.currentSnapshotDigest}`,
    `- 判定: ${input.delta.ok ? "ok" : "blocked"}`,
    "",
    ...section("リリースノート", notes),
    ...section(
      "変更section",
      input.delta.changed_sections.map(({ path, section }) => `${path}#${section}`),
    ),
    ...section(
      "検出事項",
      input.delta.findings.map(
        (finding) => `${finding.severity}: ${finding.code} ${finding.path} — ${finding.detail}`,
      ),
    ),
  ].join("\n");
  return {
    schema_version: 1,
    base_snapshot_digest: input.baseSnapshotDigest,
    current_snapshot_digest: input.currentSnapshotDigest,
    delta: input.delta,
    release_notes: notes,
    markdown,
    ok: input.delta.ok,
  };
}

export function documentChangeReportDigest(report: DocumentChangeReport): string {
  return sha256Digest(canonicalJson(report));
}

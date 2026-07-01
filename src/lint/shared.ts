// A-120 共通化: lint / vmodel が各自コピペしていた frontmatter / DbC / TS module 判定を単一正本化する。
// 配置 = src/lint (domain-boundary: lint 内 import と vmodel→lint import は許可)。
import { basename } from "node:path";
import type ts from "typescript";

/**
 * frontmatter 1 行 `key: value` の value を取り出す。
 * 末尾の YAML inline コメント (` # ...`) は値に含めない (scrum-reverse 版を canonical 採用)。
 * 値なし / key 不在は undefined。
 */
export function fmValue(content: string, key: string): string | undefined {
  return content.match(new RegExp(`^${key}:\\s*(.+?)\\s*(?:#.*)?$`, "m"))?.[1]?.trim();
}

/**
 * PLAN frontmatter terminal statuses used by readiness gates.
 *
 * `archived` is intentionally separate: it closes active-work tracking, but it
 * does not prove delivered work. Unknown status values must not be treated as
 * terminal; schema/frontmatter gates own those violations.
 */
export const TERMINAL_PLAN_STATUSES: ReadonlySet<string> = new Set([
  "confirmed",
  "completed",
  "accepted",
]);

export function normalizedPlanStatus(status: string): string {
  return status.trim().toLowerCase();
}

export function isTerminalPlanStatus(status: string): boolean {
  return TERMINAL_PLAN_STATUSES.has(normalizedPlanStatus(status));
}

export function isClosedPlanStatus(status: string): boolean {
  const normalized = normalizedPlanStatus(status);
  return normalized === "archived" || TERMINAL_PLAN_STATUSES.has(normalized);
}

/** Markdown の `record_name:` 配下に `- field: value` 形式の実値が揃っているかを検査する。 */
export function missingRecordFields(
  text: string,
  recordName: string,
  fields: readonly string[],
): string[] {
  const body = recordBody(text, recordName);
  if (body === null) {
    return [recordName, ...fields];
  }
  return fields.filter((field) => {
    const value = recordFieldValueFromBody(body, field);
    return !value || value === "TBD" || value === "TODO" || value === "-";
  });
}

function recordBody(text: string, recordName: string): string | null {
  const header = text.match(new RegExp(`^\\s*${recordName}:\\s*$`, "m"));
  if (!header || header.index === undefined) {
    return null;
  }
  const section = text.slice(header.index);
  const nextHeading = section.search(/\n#{1,6}\s+/);
  return nextHeading >= 0 ? section.slice(0, nextHeading) : section;
}

function recordFieldValueFromBody(body: string, field: string): string | undefined {
  return body
    .match(new RegExp(`^\\s*-\\s*${field}:\\s*(.+?)\\s*$`, "m"))?.[1]
    ?.replace(/`/g, "")
    .trim();
}

/** Markdown の `record_name:` 配下にある `- field: value` の実値を返す。 */
export function recordFieldValue(
  text: string,
  recordName: string,
  field: string,
): string | undefined {
  const body = recordBody(text, recordName);
  if (body === null) return undefined;
  return recordFieldValueFromBody(body, field);
}

/** `allowed_outcome` が設計 enum と同じ集合を列挙しているかを検査する。 */
export function allowedOutcomeSetViolation(
  text: string,
  recordName: string,
  allowedOutcomes: readonly string[],
): string | null {
  const value = recordFieldValue(text, recordName, "allowed_outcome");
  if (!value || value === "TBD" || value === "TODO" || value === "-") {
    return null;
  }
  const escaped = allowedOutcomes.map((outcome) => outcome.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const known = new RegExp(`\\b(?:${escaped.join("|")})\\b`, "g");
  const found = new Set(value.match(known) ?? []);
  const unknown = value
    .replace(known, " ")
    .replace(/[<>"'`|,]/g, " ")
    .replace(/\//g, " ")
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean)
    .filter((token) => token !== "or" && token !== "and");
  const missing = allowedOutcomes.filter((outcome) => !found.has(outcome));
  if (missing.length === 0 && unknown.length === 0) return null;
  const parts = [
    missing.length > 0 ? `missing allowed_outcome ${missing.join(",")}` : "",
    unknown.length > 0 ? `unknown allowed_outcome ${unknown.join(",")}` : "",
  ].filter(Boolean);
  return `invalid allowed_outcome set for ${recordName}: ${parts.join("; ")}`;
}

// L6 機能設計の DbC テーブル見出し (関数仕様の substance マーカー)。
// l6-completion (freeze readiness) と l6-fr-coverage (FR 被覆) が同一判定を要するため共有する。
const DBC_TABLE_FULL =
  /\|\s*Function\(s\)\s*\|\s*Signature\s*\|\s*pre\s*\|\s*post\s*\|\s*invariant\s*\|\s*oracle\s*\|/i;
const DBC_TABLE_MIN = /\|\s*Function\s*\|\s*Signature\s*\|\s*pre\s*\|\s*post/i;

/** L6 spec doc が DbC 契約テーブル (Function/Signature/pre/post...) を持つか。 */
export function hasDbcTable(text: string): boolean {
  return DBC_TABLE_FULL.test(text) || DBC_TABLE_MIN.test(text);
}

// A-120 I-2: coding-rules / ddd-tdd-rules の境界チェックが各自コピペしていた
// TS module 解決 helper を単一正本化する (boundary 判定そのものは各 lint で別ルール = 統合しない)。

/** OS path 区切りを `/` に正規化。 */
export function normalizePath(path: string): string {
  return path.replaceAll("\\", "/");
}

/** AST ノード位置 → 1-origin 行番号。 */
export function lineOf(sourceFile: ts.SourceFile, pos: number): number {
  return sourceFile.getLineAndCharacterOfPosition(pos).line + 1;
}

/** `src/<module>/...` の <module> 名 (src 直下ファイルは拡張子除く basename)。src 外は null。 */
export function sourceModule(path: string): string | null {
  const parts = normalizePath(path).split("/");
  if (parts[0] !== "src") return null;
  if (parts.length === 2) return basename(parts[1], ".ts");
  return parts[1] ?? null;
}

/** 相対 import specifier を解決し、import 先の src module 名を返す。外部/src 外は null。 */
export function importedSourceModule(fromPath: string, specifier: string): string | null {
  if (!specifier.startsWith(".")) return null;
  const fromParts = normalizePath(fromPath).split("/");
  if (fromParts[0] !== "src") return null;
  const resolvedParts: string[] = [];
  for (const part of [...fromParts.slice(0, -1), ...specifier.split("/")]) {
    if (!part || part === ".") continue;
    if (part === "..") {
      resolvedParts.pop();
      continue;
    }
    resolvedParts.push(part);
  }
  if (resolvedParts[0] !== "src") return null;
  if (resolvedParts.length === 2) return basename(resolvedParts[1], ".ts");
  return resolvedParts[1] ?? null;
}

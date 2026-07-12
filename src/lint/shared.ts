// A-120 共通化: lint / vmodel が各自コピペしていた frontmatter / DbC / TS module 判定を単一正本化する。
// 配置 = src/lint (domain-boundary: lint 内 import と vmodel→lint import は許可)。
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";
import type ts from "typescript";
import { parse as parseYaml } from "yaml";

/**
 * Markdown の先頭 YAML frontmatter 本文を CRLF/LF 共通で抽出する単一正本。
 * opening/closing delimiter が欠ける入力や文書途中の delimiter は受理しない。
 */
export function markdownFrontmatter(content: string): string | null {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  return match?.[1]?.replaceAll("\r\n", "\n") ?? null;
}

/** frontmatter を plain mapping として読む。invalid YAML / sequence / scalar は null。 */
export function parseMarkdownFrontmatter(content: string): Record<string, unknown> | null {
  const raw = markdownFrontmatter(content);
  if (raw === null) return null;
  try {
    const parsed = parseYaml(raw);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

export interface LoadedPlanDoc {
  file: string;
  content: string;
}

/** readiness gate 群が共有する canonical PLAN snapshot loader。PLAN-*.md だけを安定順で読む。 */
export function loadPlanDocs(repoRoot: string = process.cwd()): LoadedPlanDoc[] {
  const plansDir = join(repoRoot, "docs", "plans");
  if (!existsSync(plansDir)) return [];
  return readdirSync(plansDir)
    .filter((file) => file.startsWith("PLAN-") && file.endsWith(".md"))
    .sort()
    .map((file) => ({ file, content: readFileSync(join(plansDir, file), "utf8") }));
}

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

export const SOURCE_LEDGER_MEANING_REVIEW_FIELDS = [
  "source_ledger_freshness",
  "source_status_delta",
  "adoption_decision_delta",
  "workflow_route_impact",
] as const;

export function sourceLedgerMeaningReviewFieldViolations(
  text: string,
  recordName: string,
): string[] {
  const violations: string[] = [];
  for (const field of SOURCE_LEDGER_MEANING_REVIEW_FIELDS) {
    const value = recordFieldValue(text, recordName, field);
    if (!value) continue;
    if (isPlaceholderRecordValue(value, field)) {
      violations.push(`structured ${field} must not be placeholder`);
      continue;
    }
    if (field === "source_ledger_freshness" && !hasFreshCheckedLedgerEvidence(value)) {
      violations.push(`${field} must cite fresh checked source ledger evidence`);
    }
    if (field === "source_status_delta" && !hasNoneOrChangedDelta(value)) {
      violations.push(`${field} must record none or changed official source status delta`);
    }
    if (field === "adoption_decision_delta" && !hasNoneOrChangedDelta(value)) {
      violations.push(`${field} must record none or changed adoption decision delta`);
    }
    if (field === "workflow_route_impact" && !hasWorkflowRouteImpact(value)) {
      violations.push(`${field} must record none or a named workflow reroute impact`);
    }
  }
  return violations;
}

function isPlaceholderRecordValue(value: string, field: string): boolean {
  const normalized = value.trim().toLowerCase();
  return (
    normalized === field.toLowerCase() ||
    normalized === "tbd" ||
    normalized === "todo" ||
    normalized === "-" ||
    /^<.+>$/.test(normalized)
  );
}

function hasFreshCheckedLedgerEvidence(value: string): boolean {
  return /\bfresh\b/i.test(value) && /checked|ledger|source/i.test(value);
}

function hasNoneOrChangedDelta(value: string): boolean {
  return /\bnone\b/i.test(value) || /\bchanged\b/i.test(value);
}

function hasWorkflowRouteImpact(value: string): boolean {
  return (
    /\bnone\b/i.test(value) ||
    /\b(?:S[34]|G(?:8|9|10|11|12|13|14)|version-up|cutover|action-binding|completion|Forward|Reverse|L(?:0|1|2|3|4|5|6|7|8|9|10|11|12|13|14))\b/i.test(
      value,
    )
  );
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

export function selectedAllowedOutcomeViolation(input: {
  text: string;
  recordName: string;
  allowedOutcomes: readonly string[];
  selectedOutcome?: string | null;
  selectedOutcomeLabel?: string;
}): string | null {
  const value = recordFieldValue(input.text, input.recordName, "allowed_outcome");
  if (!value || value === "TBD" || value === "TODO" || value === "-") {
    return null;
  }

  const selectedOutcomeLabel = input.selectedOutcomeLabel ?? "selected_outcome";
  if (
    input.selectedOutcome !== undefined &&
    input.selectedOutcome !== null &&
    !input.allowedOutcomes.includes(input.selectedOutcome)
  ) {
    return `invalid ${selectedOutcomeLabel} for ${input.recordName}: ${input.selectedOutcome}`;
  }

  const escaped = input.allowedOutcomes.map((outcome) =>
    outcome.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
  );
  const known = new RegExp(`\\b(?:${escaped.join("|")})\\b`, "g");
  const found = value.match(known) ?? [];
  const unknown = value
    .replace(known, " ")
    .replace(/[<>"'`|,]/g, " ")
    .replace(/\//g, " ")
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean)
    .filter((token) => token !== "or" && token !== "and");

  if (
    found.length === 1 &&
    unknown.length === 0 &&
    (input.selectedOutcome === undefined ||
      input.selectedOutcome === null ||
      found[0] === input.selectedOutcome)
  ) {
    return null;
  }

  const details = [
    found.length !== 1
      ? `allowed_outcome must select exactly one outcome, found=${found.join(",") || "none"}`
      : "",
    input.selectedOutcome !== undefined &&
    input.selectedOutcome !== null &&
    found.length === 1 &&
    found[0] !== input.selectedOutcome
      ? `allowed_outcome ${found[0]} does not match ${selectedOutcomeLabel} ${input.selectedOutcome}`
      : "",
    unknown.length > 0 ? `unknown allowed_outcome ${unknown.join(",")}` : "",
  ].filter(Boolean);
  return `invalid selected allowed_outcome for ${input.recordName}: ${details.join("; ")}`;
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

// A-120 I-2 / IMP-105: coding-rules / ddd-tdd-rules の import 境界判定を単一正本化する。
// rule id は module-boundary / domain-boundary のまま分け、禁止 matrix は共有する。
export const SOURCE_BOUNDARY_MODULES = [
  "assets",
  "audit",
  "cli",
  "config",
  "context",
  "doctor",
  "export",
  "feedback",
  "gate",
  "graph",
  "guardrail",
  "lint",
  "memory",
  "orchestration",
  "plan",
  "policy",
  "roster",
  "runtime",
  "schema",
  "search",
  "security",
  "shared",
  "setup",
  "skill-engine",
  "skills",
  "state-db",
  "task",
  "team",
  "vmodel",
  "vscode",
  "web",
  "workflow",
] as const;

export type SourceBoundaryModule = (typeof SOURCE_BOUNDARY_MODULES)[number];

const EMPTY_BOUNDARY: ReadonlySet<string> = new Set();
const SOURCE_BOUNDARY_MODULE_SET: ReadonlySet<string> = new Set(SOURCE_BOUNDARY_MODULES);

export function isSourceBoundaryModule(value: string): value is SourceBoundaryModule {
  return SOURCE_BOUNDARY_MODULE_SET.has(value);
}

const DISALLOWED_SOURCE_BOUNDARY_IMPORTS: Record<SourceBoundaryModule, ReadonlySet<string>> = {
  assets: EMPTY_BOUNDARY,
  audit: EMPTY_BOUNDARY,
  cli: EMPTY_BOUNDARY,
  config: EMPTY_BOUNDARY,
  context: EMPTY_BOUNDARY,
  doctor: EMPTY_BOUNDARY,
  export: EMPTY_BOUNDARY,
  feedback: EMPTY_BOUNDARY,
  gate: EMPTY_BOUNDARY,
  graph: EMPTY_BOUNDARY,
  guardrail: EMPTY_BOUNDARY,
  lint: new Set([
    "cli",
    "doctor",
    "gate",
    "handover",
    "plan",
    "runtime",
    "setup",
    "team",
    "vmodel",
  ]),
  memory: EMPTY_BOUNDARY,
  orchestration: EMPTY_BOUNDARY,
  plan: EMPTY_BOUNDARY,
  policy: EMPTY_BOUNDARY,
  roster: EMPTY_BOUNDARY,
  runtime: new Set(["cli", "doctor", "lint", "plan", "setup", "team", "vmodel"]),
  schema: new Set([
    "cli",
    "doctor",
    "gate",
    "handover",
    "lint",
    "plan",
    "runtime",
    "setup",
    "team",
    "vmodel",
  ]),
  search: EMPTY_BOUNDARY,
  security: EMPTY_BOUNDARY,
  shared: EMPTY_BOUNDARY,
  setup: EMPTY_BOUNDARY,
  "skill-engine": EMPTY_BOUNDARY,
  skills: EMPTY_BOUNDARY,
  "state-db": EMPTY_BOUNDARY,
  task: EMPTY_BOUNDARY,
  team: EMPTY_BOUNDARY,
  vmodel: EMPTY_BOUNDARY,
  vscode: EMPTY_BOUNDARY,
  web: EMPTY_BOUNDARY,
  workflow: EMPTY_BOUNDARY,
};

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

export function violatesSourceBoundary(
  fromModule: string | null,
  toModule: string | null,
): boolean {
  if (!fromModule || !toModule) return false;
  if (!isSourceBoundaryModule(fromModule)) return false;
  return DISALLOWED_SOURCE_BOUNDARY_IMPORTS[fromModule]?.has(toModule) ?? false;
}

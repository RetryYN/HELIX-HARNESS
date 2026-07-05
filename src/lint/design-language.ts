import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { basename, join, relative } from "node:path";

export interface DesignLanguageDoc {
  path: string;
  text: string;
}

export interface DesignLanguageViolation {
  path: string;
  line: number;
  excerpt: string;
  reason: "english-heading" | "english-prose";
  fingerprint: string;
}

export interface DesignLanguagePolicy {
  baselineViolations: number;
  baselineFingerprint?: string;
}

export interface DesignLanguageResult {
  checked: number;
  violations: DesignLanguageViolation[];
  baselineViolations: number;
  fingerprint: string;
  fingerprintDrift: boolean;
  newViolations: number;
  ok: boolean;
}

// 2026-07-04: human-facing docs reached zero English-prose debt. Keep the
// baseline at 0 so any new English-only prose fails closed.
export const DESIGN_LANGUAGE_BASELINE_VIOLATIONS = 0;
export const DESIGN_LANGUAGE_BASELINE_FINGERPRINT =
  "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";

const DESIGN_LANGUAGE_ROOTS = [
  join(".claude", "agents"),
  join(".claude", "commands"),
  join(".github", "ISSUE_TEMPLATE"),
  join(".ut-tdd", "audit"),
  join(".ut-tdd", "review"),
  join("docs", "adr"),
  join("docs", "archive"),
  join("docs", "design"),
  join("docs", "governance"),
  join("docs", "handover"),
  join("docs", "memory"),
  join("docs", "migration"),
  join("docs", "plans"),
  join("docs", "process"),
  join("docs", "reference"),
  join("docs", "research"),
  join("docs", "skills"),
  join("docs", "templates"),
  join("docs", "test-design"),
] as const;

const DESIGN_LANGUAGE_FILES = [
  "AGENTS.md",
  "CLAUDE.md",
  join(".claude", "CLAUDE.md"),
  join(".github", "PULL_REQUEST_TEMPLATE.md"),
  join("docs", "feedback-log.md"),
  join("docs", "improvement-backlog.md"),
] as const;

const JAPANESE_PATTERN = /[\u3040-\u30ff\u3400-\u9fff]/;
const ENGLISH_WORD_PATTERN = /\b[A-Za-z][A-Za-z'-]{2,}\b/g;
const INLINE_CODE_PATTERN = /`[^`]*`/g;
const URL_PATTERN = /https?:\/\/\S+/g;
const HTML_COMMENT_PATTERN = /<!--[\s\S]*?-->/g;

const TECHNICAL_WORD_ALLOWLIST = new Set([
  "ADR",
  "API",
  "ASCII",
  "Bun",
  "CI",
  "CLI",
  "Codex",
  "Claude",
  "DB",
  "DDD",
  "DoD",
  "FR",
  "GWT",
  "HELIX",
  "ID",
  "JSON",
  "LTS",
  "MCP",
  "PLAN",
  "PO",
  "PR",
  "README",
  "SSoT",
  "SQL",
  "TDD",
  "TS",
  "UI",
  "URL",
  "UT",
  "VRT",
  "YAML",
]);

function normalizeRel(path: string): string {
  return path.replace(/\\/g, "/");
}

function isReadmeLike(path: string): boolean {
  const name = basename(path);
  return /^readme(?:\.[a-z0-9_-]+)?\.md$/i.test(name);
}

function walkMarkdown(absDir: string, repoRoot: string, acc: DesignLanguageDoc[]): void {
  for (const entry of readdirSync(absDir, { withFileTypes: true })) {
    const abs = join(absDir, entry.name);
    if (entry.isDirectory()) {
      walkMarkdown(abs, repoRoot, acc);
      continue;
    }
    if (!entry.isFile() || !entry.name.endsWith(".md") || isReadmeLike(entry.name)) continue;
    if (!statSync(abs).isFile()) continue;
    acc.push({ path: normalizeRel(relative(repoRoot, abs)), text: readFileSync(abs, "utf8") });
  }
}

export function loadDesignLanguageDocs(repoRoot: string = process.cwd()): DesignLanguageDoc[] {
  const docs: DesignLanguageDoc[] = [];
  for (const rel of DESIGN_LANGUAGE_ROOTS) {
    const abs = join(repoRoot, rel);
    if (existsSync(abs)) walkMarkdown(abs, repoRoot, docs);
  }
  for (const rel of DESIGN_LANGUAGE_FILES) {
    const abs = join(repoRoot, rel);
    if (existsSync(abs) && statSync(abs).isFile() && !isReadmeLike(rel)) {
      docs.push({ path: normalizeRel(rel), text: readFileSync(abs, "utf8") });
    }
  }
  return docs.sort((a, b) => a.path.localeCompare(b.path));
}

function stripNonProse(line: string): string {
  return line
    .replace(HTML_COMMENT_PATTERN, " ")
    .replace(INLINE_CODE_PATTERN, " ")
    .replace(URL_PATTERN, " ")
    .replace(/\[[^\]]+\]\([^)]+\)/g, " ")
    .replace(/[`*_~>|#:[\](),.;/\\{}=+-]/g, " ");
}

function countEnglishWords(line: string): number {
  const words = stripNonProse(line).match(ENGLISH_WORD_PATTERN) ?? [];
  return words.filter((word) => !TECHNICAL_WORD_ALLOWLIST.has(word)).length;
}

function sha256Text(value: string): string {
  return `sha256:${createHash("sha256").update(value).digest("hex")}`;
}

function violationFingerprint(input: {
  path: string;
  line: number;
  excerpt: string;
  reason: DesignLanguageViolation["reason"];
}): string {
  return sha256Text(`${input.path}\0${input.line}\0${input.reason}\0${input.excerpt}`);
}

function aggregateFingerprint(violations: readonly DesignLanguageViolation[]): string {
  return sha256Text(
    violations
      .map((violation) => violation.fingerprint)
      .sort()
      .join("\n"),
  );
}

function isFrontmatterLine(line: string, inFrontmatter: boolean): boolean {
  if (line.trim() === "---") return true;
  if (!inFrontmatter) return false;
  return /^[A-Za-z0-9_-]+:/.test(line.trim()) || /^\s+-\s+/.test(line);
}

function isStructuredRecordHeader(line: string): boolean {
  return /^[a-z][a-z0-9_]*_record:\s*$/.test(line.trim());
}

function isStructuredRecordField(line: string): boolean {
  return /^\s+[A-Za-z0-9_-]+:/.test(line);
}

function shouldIgnoreLine(line: string, inFrontmatter: boolean): boolean {
  const trimmed = line.trim();
  if (trimmed.length === 0) return true;
  if (isFrontmatterLine(line, inFrontmatter)) return true;
  if (isStructuredRecordHeader(line)) return true;
  if (/^[-|: ]+$/.test(trimmed)) return true;
  if (/^```/.test(trimmed)) return true;
  if (/^<!--/.test(trimmed)) return true;
  if (!/[A-Za-z]/.test(trimmed)) return true;
  return JAPANESE_PATTERN.test(trimmed);
}

export function analyzeDesignLanguage(
  docs: DesignLanguageDoc[],
  policy: DesignLanguagePolicy = {
    baselineViolations: DESIGN_LANGUAGE_BASELINE_VIOLATIONS,
    baselineFingerprint: DESIGN_LANGUAGE_BASELINE_FINGERPRINT,
  },
): DesignLanguageResult {
  const violations: DesignLanguageViolation[] = [];
  for (const doc of docs) {
    let inCode = false;
    let inFrontmatter = false;
    let inStructuredRecord = false;
    const lines = doc.text.split(/\r?\n/);
    for (let index = 0; index < lines.length; index += 1) {
      const line = lines[index];
      const trimmed = line.trim();
      if (trimmed.length === 0) {
        inStructuredRecord = false;
      }
      if (index === 0 && trimmed === "---") {
        inFrontmatter = true;
        continue;
      }
      if (inFrontmatter && index > 0 && trimmed === "---") {
        inFrontmatter = false;
        continue;
      }
      if (/^```/.test(trimmed)) {
        inCode = !inCode;
        continue;
      }
      if (isStructuredRecordHeader(line)) {
        inStructuredRecord = true;
        continue;
      }
      if (inStructuredRecord && isStructuredRecordField(line)) continue;
      if (inStructuredRecord && !isStructuredRecordField(line)) {
        inStructuredRecord = false;
      }
      if (inCode || shouldIgnoreLine(line, inFrontmatter)) continue;
      const words = countEnglishWords(line);
      const isHeading = /^#{1,6}\s+/.test(trimmed);
      const threshold = isHeading ? 2 : 4;
      if (words < threshold) continue;
      const excerpt = trimmed.slice(0, 120);
      violations.push({
        path: doc.path,
        line: index + 1,
        excerpt,
        reason: isHeading ? "english-heading" : "english-prose",
        fingerprint: violationFingerprint({
          path: doc.path,
          line: index + 1,
          excerpt,
          reason: isHeading ? "english-heading" : "english-prose",
        }),
      });
    }
  }
  const fingerprint = aggregateFingerprint(violations);
  const fingerprintDrift = Boolean(
    policy.baselineFingerprint &&
      violations.length >= policy.baselineViolations &&
      fingerprint !== policy.baselineFingerprint,
  );
  const newViolations = Math.max(0, violations.length - policy.baselineViolations);
  return {
    checked: docs.length,
    violations,
    baselineViolations: policy.baselineViolations,
    fingerprint,
    fingerprintDrift,
    newViolations,
    ok: newViolations === 0 && !fingerprintDrift,
  };
}

export function designLanguageMessages(result: DesignLanguageResult): string[] {
  if (result.ok && result.violations.length === 0) {
    return [`design-language - OK (human-facing docs ${result.checked}, english prose 0)`];
  }
  if (result.ok) {
    return [
      `design-language - OK (human-facing docs ${result.checked}, english prose debt=${result.violations.length}/${result.baselineViolations}, fingerprint=${result.fingerprint}, new=0)`,
    ];
  }
  if (result.fingerprintDrift) {
    return [
      `design-language - violation: english prose fingerprint changed at frozen debt count (total=${result.violations.length}, baseline=${result.baselineViolations}, fingerprint=${result.fingerprint})。既存英語 prose の差し替えではなく、日本語化で debt を減らすか baseline fingerprint 更新 PLAN を通す`,
    ];
  }
  const sample = result.violations
    .slice(result.baselineViolations, result.baselineViolations + 8)
    .map((v) => `${v.path}:${v.line}:${v.reason}`)
    .join(", ");
  return [
    `design-language - violation: english prose increased by ${result.newViolations}件 (total=${result.violations.length}, baseline=${result.baselineViolations}, sample=${sample})。人間向け docs の説明文は日本語を正本にし、英語は識別子/開発用語に限る`,
  ];
}

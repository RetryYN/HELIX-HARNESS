/**
 * secret-scan gate — docs / `.helix/` runtime state 面の credential 露出を fail-close で検査
 * (PLAN-L7-410)。
 *
 * 背景: CLAUDE.md 安全境界「docs、examples、audit evidence に secrets を書かない」は
 * DB / audit 面 (`SECRET_PATTERN`、PLAN-L7-52 I-1 単一正本) でのみ機械強制され、docs/ と
 * `.helix/` の Markdown/JSON/YAML には scanner が無かった (enforcement 欠落)。
 * 上流 UT-TDD PR#25 の概念採取。narrow token 正本は再定義せず `SECRET_PATTERN` を共有し、
 * 広域 marker (aws / github / private-key / bearer / assignment) を lint 側で追加する。
 *
 * 純関数 (analyzeSecretScan) + I/O loader (loadSecretScanArtifacts) を分離 (lint 共通様式)。
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { SECRET_PATTERN } from "../state-db/index";

export interface SecretScanArtifact {
  path: string;
  text: string;
}

export interface SecretScanViolation {
  path: string;
  line: number;
  marker: string;
}

export interface SecretScanResult {
  checked: number;
  violations: SecretScanViolation[];
  ok: boolean;
}

const SECRET_SCAN_PATTERNS: ReadonlyArray<{ marker: string; pattern: RegExp }> = [
  { marker: "narrow-secret-token", pattern: SECRET_PATTERN },
  { marker: "aws-access-key", pattern: /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/ },
  { marker: "github-token", pattern: /\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9_]{16,}\b/ },
  { marker: "private-key-block", pattern: /-----BEGIN [A-Z ]*PRIVATE KEY-----/ },
  {
    marker: "authorization-bearer",
    pattern: /\bAuthorization\s*:\s*Bearer\s+["']?[A-Za-z0-9._~+/=-]{16,}/i,
  },
  {
    marker: "secret-assignment",
    pattern:
      /\b(?:api[_-]?key|access[_-]?token|client[_-]?secret|password|passwd)\s*[:=]\s*["'`]?[A-Za-z0-9._~+/=-]{12,}/i,
  },
];

/**
 * 例示・墨消し行の許容 marker。設計 doc / test design は redacted 例を正当に含むため、
 * これらの語を含む行は violation にしない (self-trigger 防止。上流 PR#25 の概念)。
 * `example` / `fake` / `sha256:` のような一般語は「説明文と実 secret の同一行同居」を
 * 丸ごと見逃すため含めない — 意図的な注記としてだけ書かれる明示的合図語に限定する
 * (review 所見 2026-07-11)。行単位 allow による残存 false-negative リスクは既知の
 * トレードオフとして PLAN-L7-410 §2 に記録する。
 */
const ALLOW_LINE_PATTERN = /(dummy|placeholder|redacted|fixture|not-a-secret|\*\*\*)/i;

export function analyzeSecretScan(artifacts: readonly SecretScanArtifact[]): SecretScanResult {
  const violations: SecretScanViolation[] = [];
  for (const artifact of artifacts) {
    const lines = artifact.text.split(/\r?\n/);
    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i];
      if (ALLOW_LINE_PATTERN.test(line)) continue;
      for (const { marker, pattern } of SECRET_SCAN_PATTERNS) {
        if (pattern.test(line)) {
          violations.push({ path: artifact.path, line: i + 1, marker });
        }
      }
    }
  }
  return { checked: artifacts.length, violations, ok: violations.length === 0 };
}

function toPosix(p: string): string {
  return p.split(sep).join("/");
}

function readArtifact(fullPath: string, relPath: string): SecretScanArtifact {
  return { path: toPosix(relPath), text: readFileSync(fullPath, "utf8") };
}

interface WalkContext {
  repoRoot: string;
  extensions: readonly string[];
  acc: SecretScanArtifact[];
}

function walkFiles(dir: string, ctx: WalkContext): void {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    let st: ReturnType<typeof statSync>;
    try {
      st = statSync(full);
    } catch {
      continue;
    }
    if (st.isDirectory()) {
      walkFiles(full, ctx);
      continue;
    }
    if (!ctx.extensions.some((ext) => name.endsWith(ext))) continue;
    ctx.acc.push(readArtifact(full, relative(ctx.repoRoot, full)));
  }
}

const DOC_EXTENSIONS = [".md", ".json", ".yaml", ".yml"] as const;
const STATE_EXTENSIONS = [".md", ".json", ".jsonl"] as const;

/** 走査対象。`.helix/` は generated runtime state だが audit evidence として track され得る。 */
const SECRET_SCAN_DIRS: ReadonlyArray<{ rel: string; extensions: readonly string[] }> = [
  { rel: "docs", extensions: DOC_EXTENSIONS },
  { rel: join(".helix", "audit"), extensions: STATE_EXTENSIONS },
  { rel: join(".helix", "handover"), extensions: STATE_EXTENSIONS },
  { rel: join(".helix", "logs"), extensions: STATE_EXTENSIONS },
  { rel: join(".helix", "memory"), extensions: STATE_EXTENSIONS },
];

const ROOT_SECRET_SCAN_DOCS = [
  "README.md",
  "CLAUDE.md",
  "AGENTS.md",
  join(".claude", "CLAUDE.md"),
] as const;

export function loadSecretScanArtifacts(repoRoot: string = process.cwd()): SecretScanArtifact[] {
  const acc: SecretScanArtifact[] = [];
  for (const { rel, extensions } of SECRET_SCAN_DIRS) {
    const dir = join(repoRoot, rel);
    if (existsSync(dir)) walkFiles(dir, { repoRoot, extensions, acc });
  }
  for (const rel of ROOT_SECRET_SCAN_DOCS) {
    const full = join(repoRoot, rel);
    if (existsSync(full)) acc.push(readArtifact(full, rel));
  }
  return acc.sort((a, b) => a.path.localeCompare(b.path));
}

export function secretScanMessages(result: SecretScanResult): string[] {
  if (result.ok) {
    return [`secret-scan — OK (artifacts ${result.checked}件 credential marker 0)`];
  }
  const sample = result.violations
    .slice(0, 8)
    .map((v) => `${v.path}:${v.line}:${v.marker}`)
    .join(", ");
  return [
    `secret-scan — violation: credential marker ${result.violations.length}件 (${sample})。` +
      "実 secret なら即時 revoke + 履歴からの除去を検討する (CLAUDE.md 安全境界)。" +
      "例示・墨消しによる誤検知なら、該当行に dummy / placeholder / redacted / fixture / not-a-secret のいずれかを明示的注記として追記する",
  ];
}

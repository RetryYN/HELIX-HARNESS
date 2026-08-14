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
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  analyzeSecretScan,
  type SecretScanArtifact,
  type SecretScanResult,
} from "../security/secret-policy";

export {
  analyzeSecretScan,
  type SecretScanArtifact,
  type SecretScanResult,
  type SecretScanViolation,
} from "../security/secret-policy";

import { walkFiles } from "../shared/file-walk";

function readArtifact(fullPath: string, relPath: string): SecretScanArtifact {
  return { path: relPath, text: readFileSync(fullPath, "utf8") };
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
    if (existsSync(dir)) {
      acc.push(
        ...walkFiles(dir, repoRoot, extensions).map((file) =>
          readArtifact(file.absolutePath, file.relativePath),
        ),
      );
    }
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

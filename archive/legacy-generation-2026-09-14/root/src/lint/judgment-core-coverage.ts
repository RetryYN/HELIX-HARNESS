import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fmValue } from "./shared";

/**
 * judgment-core-coverage (PLAN-L7-335)。
 *
 * 判断コア SSoT (`docs/skills/judgment-core.md` の `judgment_core_version`) と、
 * `.claude/agents/*.md` / `.claude/commands/*.md` の `judgment_core:` marker の同期を fail-close 検査する。
 * agent / command の判断基準は本文へ全文コピーせず SSoT を参照する設計のため、SSoT を
 * 改訂しても marker が追随しない silent 陳腐化 (5 軸レビュー 3 重記述と同型の drift) を機械で塞ぐ。
 * marker は `judgment_core: v<N>` (N = SSoT の judgment_core_version)。加えて agent 本文は
 * SSoT への参照 path (`docs/skills/judgment-core.md`) を含まなければならない。
 */

export const JUDGMENT_CORE_SSOT_PATH = "docs/skills/judgment-core.md";

export interface JudgmentCoreDoc {
  /** repo-relative path (メッセージ用)。 */
  path: string;
  /** `.claude/agents` | `.claude/commands` の別。 */
  kind: "agent" | "command";
  /** frontmatter `judgment_core:` の raw 値 (無ければ null)。 */
  marker: string | null;
  /** 本文が SSoT path を参照しているか。 */
  referencesSsot: boolean;
}

export interface JudgmentCoreCoverageInput {
  /** SSoT の judgment_core_version (parse 失敗は null → fail-close)。 */
  ssotVersion: number | null;
  docs: JudgmentCoreDoc[];
}

export interface JudgmentCoreViolation {
  kind: "missing-ssot-version" | "missing-marker" | "version-mismatch" | "missing-reference";
  path: string;
  detail: string;
}

export interface JudgmentCoreCoverageResult {
  ok: boolean;
  checked: number;
  expectedMarker: string | null;
  violations: JudgmentCoreViolation[];
}

function listMarkdown(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((name) => name.endsWith(".md"))
    .sort();
}

export function loadJudgmentCoreCoverageInput(repoRoot: string): JudgmentCoreCoverageInput {
  const ssotFile = join(repoRoot, ...JUDGMENT_CORE_SSOT_PATH.split("/"));
  let ssotVersion: number | null = null;
  if (existsSync(ssotFile)) {
    const raw = fmValue(readFileSync(ssotFile, "utf8"), "judgment_core_version");
    if (raw !== undefined && /^\d+$/.test(raw)) ssotVersion = Number(raw);
  }
  const docs: JudgmentCoreDoc[] = [];
  for (const kind of ["agent", "command"] as const) {
    const dir = join(repoRoot, ".claude", kind === "agent" ? "agents" : "commands");
    for (const name of listMarkdown(dir)) {
      const content = readFileSync(join(dir, name), "utf8");
      docs.push({
        path: `.claude/${kind === "agent" ? "agents" : "commands"}/${name}`,
        kind,
        marker: fmValue(content, "judgment_core") ?? null,
        referencesSsot: content.includes(JUDGMENT_CORE_SSOT_PATH),
      });
    }
  }
  return { ssotVersion, docs };
}

export function analyzeJudgmentCoreCoverage(
  input: JudgmentCoreCoverageInput,
): JudgmentCoreCoverageResult {
  const violations: JudgmentCoreViolation[] = [];
  const expectedMarker = input.ssotVersion === null ? null : `v${input.ssotVersion}`;
  if (expectedMarker === null) {
    violations.push({
      kind: "missing-ssot-version",
      path: JUDGMENT_CORE_SSOT_PATH,
      detail: "SSoT の judgment_core_version が読めない (存在しない / 数値でない)",
    });
    return { ok: false, checked: input.docs.length, expectedMarker, violations };
  }
  for (const doc of input.docs) {
    if (doc.marker === null) {
      violations.push({
        kind: "missing-marker",
        path: doc.path,
        detail: `frontmatter judgment_core: ${expectedMarker} が無い`,
      });
    } else if (doc.marker !== expectedMarker) {
      violations.push({
        kind: "version-mismatch",
        path: doc.path,
        detail: `judgment_core=${doc.marker} が SSoT (${expectedMarker}) と一致しない`,
      });
    }
    if (!doc.referencesSsot) {
      violations.push({
        kind: "missing-reference",
        path: doc.path,
        detail: `本文が ${JUDGMENT_CORE_SSOT_PATH} を参照していない`,
      });
    }
  }
  return {
    // 対象 0 件 (agents/ commands/ が空) は配線消失とみなし fail-close する。
    ok: input.docs.length > 0 && violations.length === 0,
    checked: input.docs.length,
    expectedMarker,
    violations,
  };
}

export function judgmentCoreCoverageMessages(result: JudgmentCoreCoverageResult): string[] {
  if (result.ok) {
    return [
      `judgment-core-coverage - OK (docs=${result.checked}, marker=${result.expectedMarker}, drift=0)`,
    ];
  }
  const messages = [
    `judgment-core-coverage - violation: 判断コア marker drift=${result.violations.length}`,
  ];
  for (const v of result.violations) {
    messages.push(`${v.path}: ${v.detail}`);
  }
  return messages;
}

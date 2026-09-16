import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

/**
 * verifier-provider-mismatch (PLAN-L7-304、PLAN-L7-176 §4 carry の doctor gate)。
 *
 * P2 loop の iteration 証跡 (`.helix/state/loop/*.iterations.jsonl`) を検査し、
 * worker と verifier が同一 provider なのに fallback 理由 (`blockedReason`) が
 * 記録されていない行を hybrid 自己評価 (self-evaluation) violation として検出する。
 * `selectVerifier` は hybrid で必ず反対 provider を返し、single-runtime fallback は
 * `blockedReason="intra_runtime_fallback"` を必ず残す設計 (L6 orchestration-memory §2.3)
 * のため、「同一 provider かつ blockedReason なし」は設計上存在してはならない行である。
 *
 * 証跡 jsonl を直接検査する (harness.db rebuild のタイミングに依存しない fail-close)。
 * 壊れた行は projection 側 (`loop-iteration-invalid` finding) が拾うため、ここでは
 * parse 不能行を件数として報告するだけで gate は落とさない。
 */

export interface VerifierProviderMismatchViolation {
  file: string;
  line: number;
  planId: string;
  iteration: number | null;
  provider: string;
}

export interface VerifierProviderMismatchResult {
  checkedFiles: number;
  checkedIterations: number;
  unparsableLines: number;
  violations: VerifierProviderMismatchViolation[];
  ok: boolean;
}

interface LoopIterationLine {
  planId?: unknown;
  iteration?: unknown;
  workerProvider?: unknown;
  verifierProvider?: unknown;
  blockedReason?: unknown;
}

function asNonEmptyString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

export function analyzeVerifierProviderMismatch(
  files: Array<{ path: string; content: string }>,
): VerifierProviderMismatchResult {
  const violations: VerifierProviderMismatchViolation[] = [];
  let checkedIterations = 0;
  let unparsableLines = 0;

  for (const file of files) {
    const lines = file.content.split("\n").filter((line) => line.trim().length > 0);
    lines.forEach((line, index) => {
      let record: LoopIterationLine | null = null;
      try {
        record = JSON.parse(line) as LoopIterationLine;
      } catch {
        record = null;
      }
      if (!record || typeof record !== "object") {
        unparsableLines += 1;
        return;
      }
      checkedIterations += 1;
      const worker = asNonEmptyString(record.workerProvider);
      const verifier = asNonEmptyString(record.verifierProvider);
      const blockedReason = asNonEmptyString(record.blockedReason);
      if (worker && verifier && worker === verifier && !blockedReason) {
        violations.push({
          file: file.path,
          line: index + 1,
          planId: asNonEmptyString(record.planId) ?? "(unknown)",
          iteration: typeof record.iteration === "number" ? record.iteration : null,
          provider: worker,
        });
      }
    });
  }

  return {
    checkedFiles: files.length,
    checkedIterations,
    unparsableLines,
    violations,
    ok: violations.length === 0,
  };
}

export function loadLoopIterationFiles(repoRoot: string): Array<{ path: string; content: string }> {
  const dir = join(repoRoot, ".helix", "state", "loop");
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((name) => name.endsWith(".iterations.jsonl"))
    .sort()
    .map((name) => {
      const path = join(dir, name);
      return {
        path: relative(repoRoot, path).replaceAll("\\", "/"),
        content: readFileSync(path, "utf8"),
      };
    });
}

export function verifierProviderMismatchMessages(result: VerifierProviderMismatchResult): string[] {
  if (result.ok) {
    return [
      `verifier-provider-mismatch - OK (files=${result.checkedFiles}, iterations=${result.checkedIterations}, unparsable=${result.unparsableLines}, self-evaluation rows=0)`,
    ];
  }
  const messages = [
    `verifier-provider-mismatch - violation: hybrid self-evaluation rows=${result.violations.length}`,
  ];
  for (const violation of result.violations) {
    messages.push(
      `self-evaluation ${violation.file}:${violation.line} plan=${violation.planId} iteration=${violation.iteration ?? "?"} provider=${violation.provider} (worker===verifier, blockedReason なし)`,
    );
  }
  return messages;
}

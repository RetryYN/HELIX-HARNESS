import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

/**
 * PLAN-REVERSE-694: live fullback negative oracleの実効性を、判定節の生成変異で測定する。
 * 各mutantはU-WFTERM-027..041 suiteで実行し、survived／pattern_missingを許容しない。
 * tracked sourceを一時的に書き換える開発者向けrunnerのため、専用worktreeで実行し、実行後に
 * `git diff --quiet` で変異が残っていないことを確認する。SIGKILL等の中断時は手動復元を行う。
 */

interface Mutant {
  readonly name: string;
  readonly target: string;
  readonly from: string;
  readonly to: string;
}

const SPECS = [
  "tests/workflow-classification-terminal-fullback.test.ts",
  "tests/github-workflow-classification-terminal-fullback.test.ts",
  "tests/workflow-classification-terminal-fullback-authority.test.ts",
] as const;

const MUTANTS: readonly Mutant[] = [
  {
    name: "review-head-binding-removed",
    target: "src/adapters/github-workflow-classification-terminal-fullback.ts",
    from: "if (receipt?.headSha === expectedHeadSha) return receipt;",
    to: "if (receipt) return receipt;",
  },
  {
    name: "ci-conclusion-guard-removed",
    target: "src/lint/workflow-classification-terminal-fullback.ts",
    from: 'slice.ciConclusion !== "success"',
    to: "false",
  },
  {
    name: "ci-head-binding-removed",
    target: "src/lint/workflow-classification-terminal-fullback.ts",
    from: "slice.ciHeadSha !== slice.headSha",
    to: "false",
  },
  {
    name: "merge-state-guard-removed",
    target: "src/lint/workflow-classification-terminal-fullback.ts",
    from: "if (!slice.merged) {",
    to: "if (false) {",
  },
  {
    name: "review-digest-guard-removed",
    target: "src/runtime/claude-pr-convergence.ts",
    from: "    if (digest != null) assertSha256(digest, field);",
    to: "    if (false) assertSha256(digest, field);",
  },
  {
    name: "db-convergence-guard-removed",
    target: "src/runtime/claude-pr-convergence.ts",
    from: "      !input.dbConverged\n",
    to: "      false\n",
  },
  {
    name: "invalid-issue-state-accepted",
    target: "src/adapters/github-workflow-classification-terminal-fullback.ts",
    from: `  throw new Error(\`workflow_classification_github_issue_state_invalid:#\${issueNumber}\`);`,
    to: '  return "open";',
  },
  {
    name: "empty-consumers-guard-removed",
    target: "src/adapters/github-workflow-classification-terminal-fullback.ts",
    from: "if (input.consumers.length === 0) {",
    to: "if (false) {",
  },
  {
    name: "empty-forward-slices-guard-removed",
    target: "src/adapters/github-workflow-classification-terminal-fullback.ts",
    from: "if (forwardSlices.length === 0) {",
    to: "if (false) {",
  },
  {
    name: "forward-slice-set-guard-removed",
    target: "src/lint/workflow-classification-terminal-fullback.ts",
    from: "JSON.stringify(actualSet) !== JSON.stringify(expectedSet)",
    to: "false",
  },
  {
    name: "consumer-set-guard-removed",
    target: "src/lint/workflow-classification-terminal-fullback.ts",
    from: "JSON.stringify([...new Set(actualConsumerNames)].sort()) !==\n      JSON.stringify([...new Set(expectedConsumerNames)].sort())",
    to: "false",
  },
  {
    name: "current-main-measurement-guard-removed",
    target: "src/lint/workflow-classification-terminal-fullback.ts",
    from: "if (digest(measurement) !== readAfter.measurementDigest) {",
    to: "if (false) {",
  },
];

function main(): void {
  const originals = new Map(
    [...new Set(MUTANTS.map((mutant) => mutant.target))].map((target) => [
      target,
      readFileSync(target, "utf8"),
    ]),
  );
  const survived: string[] = [];
  const missing: string[] = [];

  try {
    for (const mutant of MUTANTS) {
      const original = originals.get(mutant.target);
      if (original === undefined || !original.includes(mutant.from)) {
        missing.push(mutant.name);
        continue;
      }
      writeFileSync(mutant.target, original.replace(mutant.from, mutant.to));
      const run = spawnSync(
        "npx",
        ["--no-install", "vitest", "run", "--project", "fast", ...SPECS, "--reporter=dot"],
        { encoding: "utf8" },
      );
      const killed = run.status !== 0;
      process.stdout.write(`${killed ? "KILLED" : "SURVIVED"} ${mutant.name}\n`);
      if (!killed) survived.push(mutant.name);
      writeFileSync(mutant.target, original);
    }
  } finally {
    for (const [target, original] of originals) writeFileSync(target, original);
  }

  const failed = survived.length + missing.length;
  if (missing.length > 0) process.stdout.write(`pattern_missing_names=${missing.join(",")}\n`);
  process.stdout.write(
    `total=${MUTANTS.length} killed=${MUTANTS.length - failed} survived=${survived.length} pattern_missing=${missing.length}\n`,
  );
  if (failed > 0) process.exitCode = 1;
}

main();

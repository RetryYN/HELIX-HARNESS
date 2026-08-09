import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

/**
 * Issue #125: headless Claude completion boundaryの主要防御を実際に除去し、
 * U-ADAPTER-012/013が各mutationをRedへ戻すことを確認する。
 */
interface Mutant {
  readonly name: string;
  readonly target: string;
  readonly spec: string;
  readonly from: string;
  readonly to: string;
}

const MUTANTS: readonly Mutant[] = [
  {
    name: "headless-setting-sources-removed",
    target: "src/runtime/adapter.ts",
    spec: "tests/runtime-adapter.test.ts",
    from: "        ...(intent.execute ? CLAUDE_HEADLESS_SETTING_ARGS : []),",
    to: "        ...[],",
  },
  {
    name: "headless-marker-removed",
    target: "src/runtime/adapter.ts",
    spec: "tests/runtime-adapter.test.ts",
    from: '        ...(intent.execute ? { [CLAUDE_HEADLESS_EXECUTION_ENV]: "1" } : {}),',
    to: "        ...{},",
  },
  {
    name: "headless-wake-suppression-removed",
    target: "src/cli.ts",
    spec: "tests/runtime-hook-entrypoints.test.ts",
    from: '    if (process.env[CLAUDE_HEADLESS_EXECUTION_ENV] === "1") return;',
    to: '    if (process.env[CLAUDE_HEADLESS_EXECUTION_ENV] === "1") { /* mutation */ }',
  },
  {
    name: "provider-hard-kill-weakened",
    target: "src/runtime/adapter.ts",
    spec: "tests/runtime-adapter.test.ts",
    from: '  return { timeout: timeMs, killSignal: "SIGKILL" };',
    to: '  return { timeout: timeMs, killSignal: "SIGTERM" as "SIGKILL" };',
  },
  {
    name: "provider-timeout-cli-binding-bypassed",
    target: "src/cli.ts",
    spec: "tests/runtime-hook-entrypoints.test.ts",
    from: "          ...providerTimeout,",
    // timeout自体を除去するとmutation harnessも永久holdするため、接続を1msへ破壊して
    // 実process oracleがsealed 250ms bindingの不一致をRedにすることを有限に確認する。
    to: '          ...(providerTimeout ? { timeout: 1, killSignal: "SIGKILL" as const } : {}),',
  },
  {
    name: "codex-timeout-isolation-removed",
    target: "src/runtime/adapter.ts",
    spec: "tests/runtime-adapter.test.ts",
    from: '  if (provider !== "claude") return undefined;',
    to: '  if (provider !== "codex") return undefined;',
  },
  {
    name: "provider-timeout-class-collapsed",
    target: "src/runtime/adapter.ts",
    spec: "tests/runtime-adapter.test.ts",
    from: '      error_class: code === "ETIMEDOUT" ? "provider_timeout" : "provider_error",',
    to: '      error_class: "provider_error",',
  },
];

function main(): void {
  const originals = new Map<string, string>();
  const survived: string[] = [];
  const missing: string[] = [];
  try {
    for (const mutant of MUTANTS) {
      const original = originals.get(mutant.target) ?? readFileSync(mutant.target, "utf8");
      originals.set(mutant.target, original);
      if (!original.includes(mutant.from)) {
        missing.push(mutant.name);
        continue;
      }
      writeFileSync(mutant.target, original.replace(mutant.from, mutant.to));
      const run = spawnSync(
        "npx",
        [
          "vitest",
          "run",
          "--configLoader",
          "runner",
          "--project",
          "fast",
          mutant.spec,
          "--reporter=dot",
        ],
        { encoding: "utf8" },
      );
      const killed = run.status !== 0;
      process.stdout.write(`${killed ? "KILLED " : "SURVIVED"} ${mutant.name}\n`);
      if (!killed) survived.push(mutant.name);
      writeFileSync(mutant.target, original);
    }
  } finally {
    for (const [target, original] of originals) writeFileSync(target, original);
  }
  const failed = survived.length + missing.length;
  process.stdout.write(
    `total=${MUTANTS.length} killed=${MUTANTS.length - failed} survived=${survived.length} pattern_missing=${missing.length}\n`,
  );
  if (failed > 0) process.exitCode = 1;
}

main();

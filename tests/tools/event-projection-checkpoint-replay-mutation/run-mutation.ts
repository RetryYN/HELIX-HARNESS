import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

/**
 * PLAN-L7-636: pure event projection judgement の fail-close 分岐を実生成 mutant で検証する。
 * 各 mutant は同じ L8 suite で実行し、survived と pattern_missing を許容しない。
 */
const TARGET = "src/runtime/event-projection-checkpoint-replay.ts";
const SPEC = "tests/event-projection-checkpoint-replay.test.ts";

interface Mutant {
  readonly name: string;
  readonly from: string;
  readonly to: string;
}

const MUTANTS: readonly Mutant[] = [
  {
    name: "exact-envelope-keys-weakened",
    from: "    actual.length === canonical.length && actual.every((key, index) => key === canonical[index])",
    to: "    canonical.every((key) => actual.includes(key))",
  },
  {
    name: "payload-binding-check-removed",
    from: '  if (!isSha256Digest(input.payload_digest)) {\n    return { ok: false, failure_code: "EVENT_ENVELOPE_INCOMPLETE" };\n  }\n',
    to: "",
  },
  {
    name: "head-sha-check-removed",
    from: "    !isHeadSha(input.head_sha)\n  ) {",
    to: "    false\n  ) {",
  },
  {
    name: "future-timestamp-check-removed",
    from: '  if (Date.parse(input.envelope.occurred_at) > Date.parse(input.observedAt)) {\n    return { ok: false, failure_code: "EVENT_FUTURE_TIMESTAMP" };\n  }\n',
    to: "",
  },
  {
    name: "causation-resolution-check-removed",
    from: '  if (!cause) return { ok: false, failure_code: "EVENT_CAUSATION_UNRESOLVED" };\n',
    to: "",
  },
  {
    name: "correlation-binding-check-removed",
    from: '  if (cause.correlation_id !== input.envelope.correlation_id) {\n    return { ok: false, failure_code: "EVENT_CORRELATION_MISMATCH" };\n  }\n',
    to: "",
  },
  {
    name: "lifecycle-transition-check-removed",
    from: '  if (!nextStates?.has(input.envelope.event_type)) {\n    return { ok: false, failure_code: "EVENT_TRANSITION_ILLEGAL" };\n  }\n',
    to: "",
  },
  {
    name: "projection-internal-lane-check-removed",
    from: '  if (!internallyConsistent(input.rebuilt) || !internallyConsistent(input.readBack)) {\n    return { ok: false, failure_code: "EVENT_PROJECTION_DRIFT" };\n  }\n',
    to: "",
  },
  {
    name: "checkpoint-stale-head-check-removed",
    from: '  if (checkpoint.head_sha !== input.currentHeadSha) {\n    return { ok: false, failure_code: "EVENT_STALE_HEAD" };\n  }\n',
    to: "",
  },
  {
    name: "retry-budget-check-removed",
    from: '  if (!Number.isInteger(input.budget.max_attempts) || input.budget.max_attempts <= 0) {\n    return { ok: false, failure_code: "EVENT_RETRY_UNBOUNDED" };\n  }\n',
    to: "",
  },
];

function main(): void {
  const original = readFileSync(TARGET, "utf8");
  const survived: string[] = [];
  const missing: string[] = [];
  try {
    for (const mutant of MUTANTS) {
      if (!original.includes(mutant.from)) {
        missing.push(mutant.name);
        continue;
      }
      writeFileSync(TARGET, original.replace(mutant.from, mutant.to));
      const run = spawnSync(
        "npx",
        ["--no-install", "vitest", "run", "--project", "fast", SPEC, "--reporter=dot"],
        {
          encoding: "utf8",
        },
      );
      const killed = run.status !== 0;
      process.stdout.write(`${killed ? "KILLED" : "SURVIVED"} ${mutant.name}\n`);
      if (!killed) survived.push(mutant.name);
    }
  } finally {
    writeFileSync(TARGET, original);
  }
  const failed = survived.length + missing.length;
  if (missing.length > 0) process.stdout.write(`pattern_missing_names=${missing.join(",")}\n`);
  process.stdout.write(
    `total=${MUTANTS.length} killed=${MUTANTS.length - failed} survived=${survived.length} pattern_missing=${missing.length}\n`,
  );
  if (failed > 0) process.exitCode = 1;
}

main();

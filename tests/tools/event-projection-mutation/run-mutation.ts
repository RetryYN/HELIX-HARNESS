import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

/**
 * PLAN-L7-528: event projection / checkpoint replay の分岐除去 mutant を実生成し、
 * tests/event-projection-checkpoint-replay.test.ts が全件を killed にすることを検証する。
 * prose の「分岐網羅」主張ではなく、再現可能な command として mutation 到達性を裏付ける。
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
    name: "envelope-exact-key-weakened",
    from: "    actual.length === canonical.length && actual.every((key, index) => key === canonical[index])",
    to: "    canonical.every((key) => actual.includes(key))",
  },
  {
    name: "envelope-exact-set-check-removed",
    from: '  if (!isRecord(input) || !exactKeys(input, ENVELOPE_KEYS)) {\n    return failure("EVENT_ENVELOPE_INVALID");\n  }\n',
    to: '  if (!isRecord(input)) {\n    return failure("EVENT_ENVELOPE_INVALID");\n  }\n',
  },
  {
    name: "envelope-payload-digest-check-removed",
    from: '  if (!validDigest(input.payload_digest)) {\n    return failure("EVENT_ENVELOPE_INCOMPLETE");\n  }\n',
    to: "",
  },
  {
    name: "envelope-payload-digest-prefix-ignored",
    from: '  return typeof value === "string" && /^sha256:[a-f0-9]{64}$/u.test(value);',
    to: '  return typeof value === "string" && value.length > 0;',
  },
  {
    name: "envelope-head-sha-check-removed",
    from: '  if (!validSha(input.head_sha)) return failure("EVENT_ENVELOPE_INVALID");\n',
    to: "",
  },
  {
    name: "envelope-schema-version-check-removed",
    from: '  if (input.schema_version !== ORCHESTRATION_EVENT_SCHEMA) {\n    return failure("EVENT_ENVELOPE_INVALID");\n  }\n',
    to: "",
  },
  {
    // 独立レビュー指摘。exact 一致を「非空文字列」へ弱化する mutant。
    // U-EPR-103 だけが検出者であり、U-EPR-090（空文字）では killed にならない。
    name: "envelope-schema-version-weakened-to-non-empty",
    from: "  if (input.schema_version !== ORCHESTRATION_EVENT_SCHEMA) {",
    to: '  if (typeof input.schema_version !== "string" || input.schema_version.length === 0) {',
  },
  {
    name: "envelope-lane-id-check-removed",
    from: '  if (!validIdentifier(input.lane_id)) return failure("EVENT_ENVELOPE_INVALID");\n',
    to: "",
  },
  {
    name: "envelope-occurred-at-check-removed",
    from: '  if (!validTimestamp(input.occurred_at)) return failure("EVENT_ENVELOPE_INVALID");\n',
    to: "",
  },
  {
    name: "envelope-event-type-enum-check-removed",
    from: '  if (!EVENT_TYPES.includes(input.event_type as EventType)) {\n    return failure("EVENT_ENVELOPE_INVALID");\n  }\n',
    to: "",
  },
  {
    name: "envelope-origin-causation-rule-removed",
    from: '  if (input.causation_id === null && input.event_type !== "requested") {\n    return failure("EVENT_CAUSATION_UNRESOLVED");\n  }\n',
    to: "",
  },
  {
    name: "envelope-frozen-clone-shared",
    from: "  return { ok: true, envelope: frozenClone(input as unknown as OrchestrationEventEnvelopeV1) };",
    to: "  return { ok: true, envelope: input as unknown as OrchestrationEventEnvelopeV1 };",
  },
  {
    name: "frozen-clone-shares-input",
    from: "  return Object.freeze(structuredClone(value));",
    to: "  return Object.freeze(value);",
  },
  {
    name: "causal-future-timestamp-check-removed",
    from: '  if (Date.parse(envelope.occurred_at) > Date.parse(observedAt)) {\n    return failure("EVENT_FUTURE_TIMESTAMP");\n  }\n',
    to: "",
  },
  {
    name: "causal-future-timestamp-boundary-widened",
    from: "  if (Date.parse(envelope.occurred_at) > Date.parse(observedAt)) {",
    to: "  if (Date.parse(envelope.occurred_at) >= Date.parse(observedAt)) {",
  },
  {
    name: "causal-unresolved-causation-check-removed",
    from: '  if (!cause) return failure("EVENT_CAUSATION_UNRESOLVED");\n',
    to: "  if (!cause) return { ok: true };\n",
  },
  {
    name: "causal-correlation-check-removed",
    from: '  if (cause.correlation_id !== envelope.correlation_id) {\n    return failure("EVENT_CORRELATION_MISMATCH");\n  }\n',
    to: "",
  },
  {
    name: "causal-inversion-check-removed",
    from: '  if (Date.parse(cause.occurred_at) > Date.parse(envelope.occurred_at)) {\n    return failure("EVENT_CAUSAL_INVERSION");\n  }\n',
    to: "",
  },
  {
    name: "causal-inversion-boundary-widened",
    from: "  if (Date.parse(cause.occurred_at) > Date.parse(envelope.occurred_at)) {",
    to: "  if (Date.parse(cause.occurred_at) >= Date.parse(envelope.occurred_at)) {",
  },
  {
    name: "ingest-duplicate-snapshot-check-removed",
    from: '  if (duplicateEventIds(log)) return failure("EVENT_LOG_SNAPSHOT_INVALID");\n  const existing = findEntry(log, envelope.event_id);',
    to: "  const existing = findEntry(log, envelope.event_id);",
  },
  {
    name: "ingest-digest-comparison-removed",
    from: '  if (existing.payload_digest === envelope.payload_digest) {\n    return { ok: true, outcome: "duplicate_absorbed" };\n  }\n  return failure("EVENT_DUPLICATE_DIGEST_MISMATCH");',
    to: '  return { ok: true, outcome: "duplicate_absorbed" };',
  },
  {
    name: "ingest-duplicate-absorbed-becomes-appended",
    from: '    return { ok: true, outcome: "duplicate_absorbed" };',
    to: '    return { ok: true, outcome: "appended" };',
  },
  {
    name: "duplicate-event-id-detection-weakened",
    from: "  return new Set(ids).size !== ids.length;",
    to: "  return false;",
  },
  {
    name: "transition-origin-rule-removed",
    from: '    return envelope.event_type === "requested" ? { ok: true } : failure("EVENT_TRANSITION_ILLEGAL");',
    to: "    return { ok: true };",
  },
  {
    name: "transition-seal-check-removed",
    from: '  if (sealed) return failure("EVENT_TRANSITION_AFTER_SEAL");\n',
    to: "",
  },
  {
    name: "transition-machine-check-removed",
    from: '  if (!allowed.includes(envelope.event_type)) return failure("EVENT_TRANSITION_ILLEGAL");\n',
    to: "",
  },
  {
    name: "transition-correlation-filter-removed",
    from: "  const sameCorrelation = log.entries.filter(\n    (entry) => entry.correlation_id === envelope.correlation_id,\n  );",
    to: "  const sameCorrelation = [...log.entries];",
  },
  {
    name: "transition-previous-uses-first-entry",
    from: "  const previous = sameCorrelation[sameCorrelation.length - 1];",
    to: "  const previous = sameCorrelation[0];",
  },
  {
    name: "drift-orphan-lane-check-removed",
    from: '  if (readBack.lane_id !== rebuilt.lane_id) return failure("EVENT_ORPHAN_LANE");\n',
    to: "",
  },
  {
    name: "drift-identity-plan-id-ignored",
    from: "    rebuilt.identity.plan_id !== readBack.identity.plan_id ||",
    to: "    false ||",
  },
  {
    name: "drift-identity-parent-lane-ignored",
    from: "    rebuilt.identity.parent_lane_id !== readBack.identity.parent_lane_id ||",
    to: "    false ||",
  },
  {
    name: "drift-state-lifecycle-ignored",
    from: "    rebuilt.state.lifecycle_state !== readBack.state.lifecycle_state ||",
    to: "    false ||",
  },
  {
    name: "drift-state-head-sha-ignored",
    from: "    rebuilt.state.head_sha !== readBack.state.head_sha ||",
    to: "    false ||",
  },
  {
    name: "drift-state-last-event-ignored",
    from: "    rebuilt.state.last_event_id !== readBack.state.last_event_id",
    to: "    false",
  },
  {
    name: "drift-identity-block-removed",
    from: '  if (\n    rebuilt.identity.plan_id !== readBack.identity.plan_id ||\n    rebuilt.identity.parent_lane_id !== readBack.identity.parent_lane_id ||\n    rebuilt.identity.lane_id !== readBack.identity.lane_id\n  ) {\n    return failure("EVENT_PROJECTION_DRIFT");\n  }\n',
    to: "",
  },
  {
    name: "scope-snapshot-precheck-removed",
    from: '  if (duplicateEventIds(log)) return failure("EVENT_LOG_SNAPSHOT_INVALID");\n  if (!isRecord(scope) || !exactKeys(scope, SCOPE_KEYS)) {',
    to: "  if (!isRecord(scope) || !exactKeys(scope, SCOPE_KEYS)) {",
  },
  {
    name: "scope-exact-set-check-removed",
    from: '  if (!isRecord(scope) || !exactKeys(scope, SCOPE_KEYS)) {\n    return failure("EVENT_CHECKPOINT_SCOPE_MISSING");\n  }\n',
    to: '  if (!isRecord(scope)) {\n    return failure("EVENT_CHECKPOINT_SCOPE_MISSING");\n  }\n',
  },
  {
    name: "scope-field-format-check-removed",
    from: '  if (\n    !validSha(scope.head_sha) ||\n    !validIdentifier(scope.parent_lane_id) ||\n    !validIdentifier(scope.lane_id) ||\n    !validIdentifier(scope.from_event_id) ||\n    !validIdentifier(scope.to_event_id)\n  ) {\n    return failure("EVENT_CHECKPOINT_SCOPE_MISSING");\n  }\n',
    to: "",
  },
  {
    name: "scope-missing-endpoint-check-removed",
    from: '  if (fromIndex < 0 || toIndex < 0) return failure("EVENT_CHECKPOINT_SCOPE_MISSING");\n',
    to: "",
  },
  {
    name: "scope-inverted-range-check-removed",
    from: '  if (toIndex < fromIndex) return failure("EVENT_CHECKPOINT_SCOPE_MISSING");\n',
    to: "",
  },
  {
    name: "scope-lane-binding-ignored",
    from: '  if (log.lane_id !== scope.lane_id) return failure("EVENT_CHECKPOINT_SCOPE_MISSING");\n',
    to: "",
  },
  {
    name: "scope-slice-widened-to-whole-log",
    from: "  const eventIds = log.entries.slice(fromIndex, toIndex + 1).map((entry) => entry.event_id);",
    to: "  const eventIds = log.entries.map((entry) => entry.event_id);",
  },
  {
    name: "replay-head-binding-check-removed",
    from: '  if (!validSha(checkpoint.head_sha)) return failure("EVENT_CHECKPOINT_BINDING_MISSING");\n',
    to: "",
  },
  {
    name: "replay-parent-binding-check-removed",
    from: '  if (!validIdentifier(checkpoint.parent_lane_id)) {\n    return failure("EVENT_CHECKPOINT_BINDING_MISSING");\n  }\n',
    to: "",
  },
  {
    name: "replay-boundary-binding-check-removed",
    from: '  if (\n    !isRecord(boundary) ||\n    !validIdentifier(boundary.from_event_id) ||\n    !validIdentifier(boundary.to_event_id)\n  ) {\n    return failure("EVENT_CHECKPOINT_BINDING_MISSING");\n  }\n',
    to: "",
  },
  {
    name: "replay-stale-head-check-removed",
    from: '  if (checkpoint.head_sha !== request.currentHeadSha) return failure("EVENT_STALE_HEAD");\n',
    to: "",
  },
  {
    name: "replay-boundary-endpoint-check-removed",
    from: '  if (boundary.from_event_id !== first || boundary.to_event_id !== last) {\n    return failure("EVENT_CHECKPOINT_SCOPE_MISSING");\n  }\n',
    to: "",
  },
  {
    name: "replay-boundary-last-endpoint-ignored",
    from: "  if (boundary.from_event_id !== first || boundary.to_event_id !== last) {",
    to: "  if (boundary.from_event_id !== first) {",
  },
  {
    name: "replay-projection-digest-check-removed",
    from: '  if (checkpoint.projection_digest !== replayProjectionDigest) {\n    return failure("EVENT_REPLAY_NOT_IDEMPOTENT");\n  }\n',
    to: "",
  },
  {
    name: "replay-checkpoint-digest-check-removed",
    from: '  if (checkpoint.checkpoint_digest !== replayCheckpointDigest) {\n    return failure("EVENT_REPLAY_NOT_IDEMPOTENT");\n  }\n',
    to: "",
  },
  {
    name: "recovery-budget-validation-removed",
    from: '  if (\n    !isRecord(budget) ||\n    !Number.isInteger(budget.max_attempts) ||\n    Number(budget.max_attempts) <= 0 ||\n    !Number.isInteger(budget.attempt) ||\n    Number(budget.attempt) <= 0\n  ) {\n    return failure("EVENT_RETRY_UNBOUNDED");\n  }\n',
    to: "",
  },
  {
    name: "recovery-max-attempts-positivity-dropped",
    from: "    Number(budget.max_attempts) <= 0 ||",
    to: "    false ||",
  },
  {
    name: "recovery-max-attempts-integer-check-removed",
    from: "    !Number.isInteger(budget.max_attempts) ||",
    to: "    false ||",
  },
  {
    name: "recovery-attempt-integer-check-removed",
    from: "    !Number.isInteger(budget.attempt) ||",
    to: "    false ||",
  },
  {
    name: "recovery-attempt-positivity-dropped",
    from: "    Number(budget.attempt) <= 0",
    to: "    false",
  },
  {
    name: "recovery-exhaustion-boundary-widened",
    from: '  if (budget.attempt > budget.max_attempts) return { ok: true, route: "recovery" };',
    to: '  if (budget.attempt >= budget.max_attempts) return { ok: true, route: "recovery" };',
  },
  {
    name: "recovery-exhaustion-check-removed",
    from: '  if (budget.attempt > budget.max_attempts) return { ok: true, route: "recovery" };\n',
    to: "",
  },
  {
    name: "recovery-retryable-set-widened",
    from: '  if (RETRYABLE_CODES.includes(failureCode)) return { ok: true, route: "bounded_retry" };\n  return { ok: true, route: "recovery" };',
    to: '  return { ok: true, route: "bounded_retry" };',
  },
  {
    // L5 §2.5 の番号順を壊し lane を先着させる。U-EPR-101 だけが検出者。
    name: "drift-order-lane-first",
    from: "  const { rebuilt, readBack } = request;\n  if (\n    rebuilt.identity.plan_id !== readBack.identity.plan_id ||",
    to: '  const { rebuilt, readBack } = request;\n  if (readBack.lane_id !== rebuilt.lane_id) return failure("EVENT_ORPHAN_LANE");\n  if (\n    rebuilt.identity.plan_id !== readBack.identity.plan_id ||',
  },
  {
    // seal 判定を machine 判定の後ろへ回し AFTER_SEAL を ILLEGAL へ吸収させる。U-EPR-102 が検出者。
    name: "transition-order-machine-first",
    from: '  const sealed = sameCorrelation.some((entry) => log.sealed_event_ids.includes(entry.event_id));\n  if (sealed) return failure("EVENT_TRANSITION_AFTER_SEAL");\n  const previous = sameCorrelation[sameCorrelation.length - 1];\n  if (!previous) return failure("EVENT_TRANSITION_ILLEGAL");\n  const allowed = ALLOWED_TRANSITIONS[previous.event_type];\n  if (!allowed.includes(envelope.event_type)) return failure("EVENT_TRANSITION_ILLEGAL");',
    to: '  const previous = sameCorrelation[sameCorrelation.length - 1];\n  if (!previous) return failure("EVENT_TRANSITION_ILLEGAL");\n  const allowed = ALLOWED_TRANSITIONS[previous.event_type];\n  if (!allowed.includes(envelope.event_type)) return failure("EVENT_TRANSITION_ILLEGAL");\n  const sealed = sameCorrelation.some((entry) => log.sealed_event_ids.includes(entry.event_id));\n  if (sealed) return failure("EVENT_TRANSITION_AFTER_SEAL");',
  },
  {
    name: "recovery-retryable-set-emptied",
    from: '  if (RETRYABLE_CODES.includes(failureCode)) return { ok: true, route: "bounded_retry" };\n',
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
        // from パターンが実ソースに存在しない = その分岐を検証できていない。
        // 数字だけでは原因を追えないため名前を出力する。
        process.stdout.write(`MISSING  ${mutant.name}\n`);
        missing.push(mutant.name);
        continue;
      }
      writeFileSync(TARGET, original.replace(mutant.from, mutant.to));
      const run = spawnSync("npx", ["vitest", "run", SPEC, "--reporter=dot"], {
        encoding: "utf8",
      });
      const killed = run.status !== 0;
      process.stdout.write(`${killed ? "KILLED " : "SURVIVED"} ${mutant.name}\n`);
      if (!killed) survived.push(mutant.name);
    }
  } finally {
    writeFileSync(TARGET, original);
  }
  const failed = survived.length + missing.length;
  process.stdout.write(
    `total=${MUTANTS.length} killed=${MUTANTS.length - failed} survived=${survived.length} pattern_missing=${missing.length}\n`,
  );
  if (failed > 0) process.exitCode = 1;
}

main();

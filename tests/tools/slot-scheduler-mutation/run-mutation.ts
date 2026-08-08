import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

/**
 * PLAN-L7-527: slot scheduler / quota handover の分岐除去 mutant を実生成し、
 * tests/slot-scheduler-quota-handover.test.ts が全件を killed にすることを検証する。
 * prose の「分岐網羅」主張ではなく、再現可能な command として mutation 到達性を裏付ける。
 */
const TARGET = "src/runtime/slot-scheduler-quota-handover.ts";
const SPEC = "tests/slot-scheduler-quota-handover.test.ts";

interface Mutant {
  readonly name: string;
  readonly from: string;
  readonly to: string;
}

const MUTANTS: readonly Mutant[] = [
  {
    name: "slot-row-exact-key-weakened",
    from: "    actual.length === canonical.length && actual.every((key, index) => key === canonical[index])",
    to: "    canonical.every((key) => actual.includes(key))",
  },
  {
    name: "slot-state-enum-check-removed",
    from: '  if (!SLOT_STATES.includes(input.slot_state)) {\n    return { ok: false, failure_code: "SCHEDULER_INPUT_INVALID" };\n  }\n',
    to: "",
  },
  {
    name: "nested-quota-snapshot-check-removed",
    from: "    validQuotaSnapshot(value.quota_snapshot) &&",
    to: "    isRecord(value.quota_snapshot) &&",
  },
  {
    name: "nested-lease-check-removed",
    from: "    validLease(value.writer_lease) &&",
    to: "    isRecord(value.writer_lease) &&",
  },
  {
    name: "queue-limit-check-removed",
    from: '  if (!queueLimitValid(request.queue)) {\n    return { ok: false, failure_code: "SCHEDULER_QUEUE_UNBOUNDED" };\n  }\n  if (\n    !Number.isInteger(request.queue.capacity) ||',
    to: "  if (\n    !Number.isInteger(request.queue.capacity) ||",
  },
  {
    name: "queue-limit-positivity-dropped",
    from: "    Number.isInteger(queue.queue_limit) &&\n    queue.queue_limit > 0",
    to: "    Number.isInteger(queue.queue_limit)",
  },
  {
    name: "capacity-range-check-removed",
    from: "    request.queue.capacity < 1 ||\n    request.queue.capacity > MAX_SCHEDULER_CAPACITY",
    to: "    false",
  },
  {
    name: "dependency-readiness-check-removed",
    from: '  if (!candidate.dependency_ids.every((id) => request.readyDependencyIds.includes(id))) {\n    return { ok: false, failure_code: "SCHEDULER_DEPENDENCY_NOT_READY" };\n  }\n',
    to: "",
  },
  {
    name: "conflict-issue-axis-removed",
    from: "  if (left.issue_id === right.issue_id) return true;\n",
    to: "",
  },
  {
    name: "conflict-contract-axis-removed",
    from: "  if (left.behavior_contract_id === right.behavior_contract_id) return true;\n",
    to: "",
  },
  {
    name: "conflict-owner-axis-removed",
    from: "  if (left.responsibility_owner === right.responsibility_owner) return true;\n",
    to: "",
  },
  {
    name: "conflict-shared-authority-axis-removed",
    from: "  if (left.shared_authority_ids.some((id) => right.shared_authority_ids.includes(id))) return true;\n",
    to: "",
  },
  {
    name: "conflict-path-axis-removed",
    from: "  return pathsIntersect(left.allowed_paths, right.allowed_paths);",
    to: "  return false;",
  },
  {
    name: "path-prefix-match-narrowed",
    from: '    a === b || b.startsWith(a.endsWith("/") ? a : `${a}/`) || a.startsWith(`${b}/`);',
    to: "    a === b;",
  },
  {
    name: "capacity-exceeded-check-removed",
    from: '  if (request.running.length >= request.queue.capacity) {\n    return { ok: false, failure_code: "SCHEDULER_CAPACITY_EXCEEDED" };\n  }\n',
    to: "",
  },
  {
    name: "lease-lane-scope-dropped",
    from: "    if (row.parent_id !== candidate.parent_id || row.task_id !== candidate.task_id) return false;",
    to: "    if (false) return false;",
  },
  {
    name: "lease-owner-mismatch-ignored",
    from: "    if (row.writer_lease.owner !== candidate.writer_lease.owner) return true;",
    to: "",
  },
  {
    name: "lease-fence-token-mismatch-ignored",
    from: "    return row.writer_lease.fence_token !== candidate.writer_lease.fence_token;",
    to: "    return false;",
  },
  {
    name: "time-order-check-removed",
    from: '  if (!timeOrderValid(candidate)) {\n    return { ok: false, failure_code: "SCHEDULER_TIME_ORDER_INVALID" };\n  }\n',
    to: "",
  },
  {
    name: "queue-backpressure-check-removed",
    from: '  if (request.queue.entries.length >= request.queue.queue_limit) {\n    return { ok: false, failure_code: "SCHEDULER_QUEUE_BACKPRESSURE" };\n  }\n',
    to: "",
  },
  {
    name: "queue-duplicate-entry-ignored",
    from: "    request.queue.entries.includes(request.taskId) ||\n    request.queue.running.includes(request.taskId)",
    to: "    false",
  },
  {
    name: "queue-entry-unbounded-check-removed",
    from: '  if (!queueLimitValid(request.queue)) {\n    return { ok: false, failure_code: "SCHEDULER_QUEUE_UNBOUNDED" };\n  }\n  if (\n    !validIdentifier(request.taskId) ||',
    to: "  if (\n    !validIdentifier(request.taskId) ||",
  },
  {
    name: "handover-ack-replay-check-removed",
    from: '  if (request.alreadyAcked) {\n    return { ok: false, failure_code: "SCHEDULER_HANDOVER_ACK_REPLAY" };\n  }\n',
    to: "",
  },
  {
    name: "handover-target-lane-ignored",
    from: "    request.packet.lane_id !== request.expected.lane_id ||",
    to: "    false ||",
  },
  {
    name: "handover-target-reviewer-ignored",
    from: "    request.packet.target_reviewer !== request.expected.target_reviewer ||",
    to: "",
  },
  {
    name: "handover-candidate-head-ignored",
    from: "    request.packet.candidate_head !== request.expected.candidate_head",
    to: "    false",
  },
  {
    name: "quota-threshold-check-removed",
    from: '  if (current.row.quota_snapshot.consumed >= current.row.quota_snapshot.threshold) {\n    return { ok: false, failure_code: "SCHEDULER_QUOTA_EXHAUSTED" };\n  }\n',
    to: "",
  },
  {
    name: "handover-predecessor-release-check-removed",
    from: '  if (!request.predecessorReleased) {\n    return { ok: false, failure_code: "SCHEDULER_LEASE_DOUBLE_OWNERSHIP" };\n  }\n',
    to: "",
  },
  {
    name: "failure-isolation-lease-release-check-removed",
    from: '  if (!request.failedLeaseReleased) {\n    return { ok: false, failure_code: "SCHEDULER_LEASE_DOUBLE_OWNERSHIP" };\n  }\n',
    to: "",
  },
  {
    name: "failure-isolation-peer-state-ignored",
    from: "    left.slot_state === right.slot_state &&",
    to: "",
  },
  {
    name: "failure-isolation-peer-lease-ignored",
    from: "    left.writer_lease.owner === right.writer_lease.owner &&\n    left.writer_lease.fence_token === right.writer_lease.fence_token",
    to: "    true",
  },
  {
    name: "failure-isolation-queue-order-ignored",
    from: "    request.queueBefore.some((task, index) => task !== request.queueAfter[index])",
    to: "    false",
  },
  {
    name: "merge-authority-check-removed",
    from: '  if (request.requestsMergeOrderDecision) {\n    return { ok: false, failure_code: "SCHEDULER_MERGE_AUTHORITY_VIOLATION" };\n  }\n',
    to: "",
  },
  {
    name: "frontier-base-head-check-removed",
    from: '  if (request.revalidated.base_head !== request.mergedHead) {\n    return { ok: false, failure_code: "SCHEDULER_INPUT_INVALID" };\n  }\n',
    to: "",
  },
  {
    name: "frontier-ci-signal-ignored",
    from: "    request.revalidated.ci_passed !== true ||",
    to: "",
  },
  {
    name: "frontier-review-signal-ignored",
    from: "    request.revalidated.review_approved !== true ||",
    to: "",
  },
  {
    name: "frontier-db-receipt-ignored",
    from: "    !validDigest(request.revalidated.db_receipt_digest)",
    to: "    false",
  },
  {
    name: "capacity-evidence-lane-count-ignored",
    from: "    input.lane_count < input.claimed_capacity",
    to: "    false",
  },
  {
    name: "capacity-evidence-lane-count-type-ignored",
    from: '    typeof input.lane_count !== "number" ||\n    !Number.isInteger(input.lane_count) ||',
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

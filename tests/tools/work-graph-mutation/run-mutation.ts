import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

/**
 * PLAN-L7-525: work graph receipt admission の分岐除去 mutant を実生成し、
 * tests/work-graph-receipt-acceptance.test.ts が全件を killed にすることを検証する。
 * prose の「分岐網羅」主張ではなく、再現可能な command として mutation 到達性を裏付ける。
 */
const TARGET = "src/runtime/work-graph-receipt-acceptance.ts";
const SPEC = "tests/work-graph-receipt-acceptance.test.ts";

interface Mutant {
  readonly name: string;
  readonly from: string;
  readonly to: string;
}

const MUTANTS: readonly Mutant[] = [
  {
    name: "dependency-check-removed",
    from: '  if (!request.requiredDependencyEdgeIds.every((edge) => completed.has(edge))) {\n    return { ok: false, failure_code: "WORK_GRAPH_DEPENDENCY_NOT_READY" };\n  }\n',
    to: "",
  },
  {
    name: "exact-key-check-weakened",
    from: '  if (!validCellBinding(binding)) {\n    return { ok: false, failure_code: "WORK_GRAPH_CELL_BINDING_INVALID" };\n  }\n',
    to: '  if (!isRecord(binding)) {\n    return { ok: false, failure_code: "WORK_GRAPH_CELL_BINDING_INVALID" };\n  }\n  const _skip = binding as unknown as RequiredCellBindingV1;\n',
  },
  {
    name: "unknown-field-tolerated",
    from: "    actual.length === canonical.length && actual.every((key, index) => key === canonical[index])",
    to: "    canonical.every((key) => actual.includes(key))",
  },
  {
    name: "scope-check-removed",
    from: '  if (!withinScope(request.changedPaths, binding.allowed_paths, binding.forbidden_paths)) {\n    return { ok: false, failure_code: "WORK_GRAPH_SCOPE_PATH_VIOLATION" };\n  }\n',
    to: "",
  },
  {
    name: "forbidden-path-ignored",
    from: "  return changedPaths.every((path) => !covered(path, forbidden) && covered(path, allowed));",
    to: "  return changedPaths.every((path) => covered(path, allowed));",
  },
  {
    name: "cas-check-removed",
    from: "    request.lease.fence_token !== binding.writer_lease.fence_token ||\n    request.lease.owner !== binding.writer_lease.owner\n",
    to: "    false\n",
  },
  {
    name: "future-write-check-removed",
    from: '  if (snapshot === null) {\n    return { ok: false, failure_code: "WORK_GRAPH_RECEIPT_FUTURE_WRITE" };\n  }\n',
    to: '  if (snapshot === null) {\n    return { ok: false, failure_code: "WORK_GRAPH_DEPENDENCY_NOT_READY" };\n  }\n',
  },
  {
    name: "base-head-check-removed",
    from: '  if (binding.base_head !== request.expectedBaseHead) {\n    return { ok: false, failure_code: "WORK_GRAPH_HEAD_DRIFT" };\n  }\n',
    to: "",
  },
  {
    name: "delegation-verify-removed",
    from: "  if (delegation === null || !verifyDelegationRequestReceipt(delegation)) {",
    to: "  if (delegation === null) {",
  },
  {
    name: "terminal-verify-removed",
    from: '  if (!verifyWorkerLifecycleReceipt(canonicalJson(terminal))) {\n    return { ok: false, failure_code: "WORK_GRAPH_ORDER_DIGEST_MISSING" };\n  }\n',
    to: "",
  },
  {
    name: "review-verify-removed",
    from: "  if (review === null || !verifyWorkerIndependentReviewCapability(review)) {",
    to: "  if (review === null) {",
  },
  {
    name: "terminal-review-binding-removed",
    from: '  if (terminal.verifier_receipt_digest !== review.receipt_digest) {\n    return { ok: false, failure_code: "WORK_GRAPH_ORDER_DIGEST_MISSING" };\n  }\n',
    to: "",
  },
  {
    name: "target-reviewer-check-removed",
    from: '  if (delegation.required_cell_binding.target_reviewer !== review.reviewer_model.identity) {\n    return { ok: false, failure_code: "WORK_GRAPH_TARGET_REVIEWER_MISMATCH" };\n  }\n',
    to: "",
  },
  {
    name: "head-drift-check-removed",
    from: "    delegation.required_cell_binding.candidate_head !== request.repositoryHead ||\n    request.reviewHeadSha !== request.repositoryHead ||\n    terminal.head_sha !== request.repositoryHead\n",
    to: "    false\n",
  },
  {
    name: "review-verdict-check-removed",
    from: '  if (review.verdict !== "approve") {\n    return { ok: false, failure_code: "WORK_GRAPH_REVIEW_NOT_APPROVED" };\n  }\n',
    to: "",
  },
  {
    name: "self-acceptance-identity-only",
    from: "    left.identity === right.identity ||\n    left.session === right.session ||\n    left.context_digest === right.context_digest",
    to: "    left.identity === right.identity",
  },
  {
    name: "self-acceptance-check-removed",
    from: '  if (\n    sameActor(evaluator, review.worker_model) ||\n    sameActor(evaluator, review.reviewer_model)\n  ) {\n    return { ok: false, failure_code: "WORK_GRAPH_SELF_ACCEPTANCE" };\n  }\n',
    to: "",
  },
  {
    name: "lease-release-gate-removed",
    from: '  if (request.terminal === null || !verifyWorkerLifecycleReceipt(canonicalJson(request.terminal))) {\n    return { ok: false, failure_code: "WORK_GRAPH_LEASE_EARLY_RELEASE" };\n  }\n',
    to: "",
  },
  {
    name: "lease-cas-equality-removed",
    from: '  if (currentToken !== request.expectedFenceToken) {\n    return { ok: false, failure_code: "WORK_GRAPH_LEASE_CAS_STALE" };\n  }\n',
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

import { createHash } from "node:crypto";

type Sha256Digest = `sha256:${string}`;
const canonicalJson = (value: unknown): string => {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (value !== null && typeof value === "object")
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => `${JSON.stringify(key)}:${canonicalJson(item)}`)
      .join(",")}}`;
  return JSON.stringify(value);
};
const sha256Digest = (value: string): Sha256Digest =>
  `sha256:${createHash("sha256").update(value).digest("hex")}`;

export type ClosureConvergenceClassification =
  | "eligible"
  | "needs_design"
  | "needs_test_citation"
  | "needs_gate_authority"
  | "human_only"
  | "invalid_escalated";

export interface ClosureConvergenceCandidate {
  plan_id: string;
  classification: ClosureConvergenceClassification;
  reason?: string;
  owner?: string;
  next_decision_route?: string;
}

export interface ClosureConvergenceCycle {
  cycle_id: string;
  previous_cycle_digest: Sha256Digest | null;
  repository_head: string;
  proposal_digest: Sha256Digest;
  registry_before_digest: Sha256Digest;
  registry_after_digest: Sha256Digest;
  offset: number;
  limit: number;
  window_plan_ids: string[];
  window_digest: Sha256Digest;
  applied_plan_ids: string[];
  unresolved: ClosureConvergenceCandidate[];
  cycle_digest: Sha256Digest;
}

export interface ClosureConvergenceLedger {
  schema_version: "closure-authority-convergence-ledger.v1";
  initial_plan_ids: string[];
  cycles: ClosureConvergenceCycle[];
}

export interface ClosureConvergenceTtl {
  schema_version: "closure-authority-convergence-ttl.v1";
  repository_head: string;
  registry_generation: Sha256Digest;
  candidate_plan_ids: string[];
  candidate_digest: Sha256Digest;
  next_offset: number;
}

export interface ClosureAuthorityProductionInput {
  repository_head: string;
  expected_head: string;
  proposal_digest: Sha256Digest;
  expected_proposal_digest: Sha256Digest;
  registry_digest: Sha256Digest;
  expected_registry_digest: Sha256Digest;
  candidate_plan_ids: string[];
  candidates: ClosureConvergenceCandidate[];
  approved_plan_ids: string[];
  offset: number;
  limit: number;
  ledger: ClosureConvergenceLedger | null;
  ttl?: ClosureConvergenceTtl;
}

export interface ClosureAuthorityProductionRun {
  window_plan_ids: string[];
  window_digest: Sha256Digest;
  eligible_plan_ids: string[];
  unresolved: ClosureConvergenceCandidate[];
  next_offset: number;
  complete: boolean;
}

const HEAD = /^[0-9a-f]{40}$/;
const DIGEST = /^sha256:[0-9a-f]{64}$/;

function exactUniqueIds(ids: readonly string[], label: string): void {
  if (ids.some((id) => !/^PLAN-[A-Z0-9-]+$/.test(id)))
    throw new Error(`${label} contains invalid PLAN id`);
  if (new Set(ids).size !== ids.length) throw new Error(`${label} contains duplicate PLAN id`);
  if (ids.some((id, index) => index > 0 && ids[index - 1].localeCompare(id) >= 0))
    throw new Error(`${label} must be canonical sorted`);
}

function digestIds(ids: readonly string[]): Sha256Digest {
  return sha256Digest(canonicalJson(ids));
}

function digestWindow(ids: readonly string[], proposalDigest: Sha256Digest): Sha256Digest {
  return sha256Digest(canonicalJson({ plan_ids: ids, proposal_digest: proposalDigest }));
}

export function verifyClosureConvergenceLedger(ledger: ClosureConvergenceLedger): void {
  if (ledger.schema_version !== "closure-authority-convergence-ledger.v1")
    throw new Error("unsupported convergence ledger schema");
  exactUniqueIds(ledger.initial_plan_ids, "initial_plan_ids");
  let previous: Sha256Digest | null = null;
  let expectedOffset = 0;
  for (const cycle of ledger.cycles) {
    if (cycle.previous_cycle_digest !== previous) throw new Error("cycle ledger chain drift");
    if (cycle.offset !== expectedOffset) throw new Error("cycle ledger offset gap/replay");
    if (cycle.limit < 1 || cycle.limit > 100 || cycle.window_plan_ids.length > cycle.limit)
      throw new Error("cycle ledger invalid window bound");
    const expectedWindow = ledger.initial_plan_ids.slice(cycle.offset, cycle.offset + cycle.limit);
    if (canonicalJson(cycle.window_plan_ids) !== canonicalJson(expectedWindow))
      throw new Error("cycle ledger window changed");
    if (cycle.window_digest !== digestWindow(cycle.window_plan_ids, cycle.proposal_digest))
      throw new Error("cycle ledger window digest drift");
    exactUniqueIds(cycle.applied_plan_ids, "applied_plan_ids");
    if (cycle.applied_plan_ids.some((id) => !cycle.window_plan_ids.includes(id)))
      throw new Error("applied plan outside window");
    const body = { ...cycle, cycle_digest: undefined };
    delete body.cycle_digest;
    const digest = sha256Digest(canonicalJson(body));
    if (digest !== cycle.cycle_digest) throw new Error("cycle ledger digest drift");
    previous = digest;
    expectedOffset += cycle.window_plan_ids.length;
  }
}

export function runClosureAuthorityProductionOrchestration(
  input: ClosureAuthorityProductionInput,
): ClosureAuthorityProductionRun {
  if (!HEAD.test(input.repository_head) || input.repository_head !== input.expected_head)
    throw new Error("repository HEAD missing or stale");
  if (
    !DIGEST.test(input.proposal_digest) ||
    input.proposal_digest !== input.expected_proposal_digest
  )
    throw new Error("proposal digest missing or stale");
  if (
    !DIGEST.test(input.registry_digest) ||
    input.registry_digest !== input.expected_registry_digest
  )
    throw new Error("registry generation CAS mismatch");
  if (!Number.isSafeInteger(input.offset) || input.offset < 0) throw new Error("invalid offset");
  if (!Number.isSafeInteger(input.limit) || input.limit < 1 || input.limit > 100)
    throw new Error("limit must be 1..100");
  exactUniqueIds(input.candidate_plan_ids, "candidate_plan_ids");
  if (input.candidates.length !== input.candidate_plan_ids.length)
    throw new Error("candidate census cardinality drift");
  if (input.candidates.some((row, index) => row.plan_id !== input.candidate_plan_ids[index]))
    throw new Error("candidate census missing, duplicate, or reordered");
  const approved = new Set(input.approved_plan_ids);
  exactUniqueIds(input.approved_plan_ids, "approved_plan_ids");

  const ledger = input.ledger ?? {
    schema_version: "closure-authority-convergence-ledger.v1" as const,
    initial_plan_ids: [...input.candidate_plan_ids],
    cycles: [],
  };
  verifyClosureConvergenceLedger(ledger);
  if (canonicalJson(ledger.initial_plan_ids) !== canonicalJson(input.candidate_plan_ids))
    throw new Error("initial candidate set drift");
  const expectedOffset = ledger.cycles.reduce(
    (sum, cycle) => sum + cycle.window_plan_ids.length,
    0,
  );
  if (input.offset !== expectedOffset) throw new Error("committed window replay or offset gap");

  if (input.ttl) {
    if (input.ttl.schema_version !== "closure-authority-convergence-ttl.v1")
      throw new Error("unsupported convergence TTL schema");
    if (input.ttl.repository_head !== input.repository_head) throw new Error("TTL HEAD drift");
    if (input.ttl.registry_generation !== input.registry_digest)
      throw new Error("TTL authority generation drift");
    if (input.ttl.candidate_digest !== digestIds(input.ttl.candidate_plan_ids))
      throw new Error("TTL candidate digest drift");
    if (
      canonicalJson(input.ttl.candidate_plan_ids) !==
      canonicalJson(input.candidate_plan_ids.slice(input.offset))
    )
      throw new Error("TTL candidate suffix drift");
    if (input.ttl.next_offset !== input.offset) throw new Error("TTL offset drift");
  }

  const window = input.candidates.slice(input.offset, input.offset + input.limit);
  const eligible = window.filter((row) => row.classification === "eligible");
  if (eligible.some((row) => !approved.has(row.plan_id)))
    throw new Error("eligible candidate lacks independent approval");
  if (
    input.approved_plan_ids.some(
      (id) => input.candidates.find((row) => row.plan_id === id)?.classification !== "eligible",
    )
  )
    throw new Error("approval targets non-eligible candidate");
  const unresolved = window.filter((row) => row.classification !== "eligible");
  for (const row of unresolved) {
    if (!row.reason) throw new Error(`unresolved reason missing: ${row.plan_id}`);
    if (row.classification === "human_only" || row.classification === "invalid_escalated") {
      if (!row.owner || !row.next_decision_route)
        throw new Error(`terminal escalation route missing: ${row.plan_id}`);
    }
  }
  const nextOffset = input.offset + window.length;
  return {
    window_plan_ids: window.map((row) => row.plan_id),
    window_digest: digestWindow(
      window.map((row) => row.plan_id),
      input.proposal_digest,
    ),
    eligible_plan_ids: eligible.map((row) => row.plan_id),
    unresolved,
    next_offset: nextOffset,
    complete: nextOffset === input.candidate_plan_ids.length,
  };
}

export function appendClosureConvergenceCycle(input: {
  ledger: ClosureConvergenceLedger;
  run: ClosureAuthorityProductionRun;
  cycle_id: string;
  repository_head: string;
  proposal_digest: Sha256Digest;
  registry_before_digest: Sha256Digest;
  registry_after_digest: Sha256Digest;
  offset: number;
  limit: number;
}): ClosureConvergenceLedger {
  verifyClosureConvergenceLedger(input.ledger);
  const previous = input.ledger.cycles.at(-1)?.cycle_digest ?? null;
  const body = {
    cycle_id: input.cycle_id,
    previous_cycle_digest: previous,
    repository_head: input.repository_head,
    proposal_digest: input.proposal_digest,
    registry_before_digest: input.registry_before_digest,
    registry_after_digest: input.registry_after_digest,
    offset: input.offset,
    limit: input.limit,
    window_plan_ids: [...input.run.window_plan_ids],
    window_digest: input.run.window_digest,
    applied_plan_ids: [...input.run.eligible_plan_ids],
    unresolved: input.run.unresolved.map((row) => ({ ...row })),
  };
  const cycle: ClosureConvergenceCycle = {
    ...body,
    cycle_digest: sha256Digest(canonicalJson(body)),
  };
  const next = { ...input.ledger, cycles: [...input.ledger.cycles, cycle] };
  verifyClosureConvergenceLedger(next);
  return next;
}

export function buildClosureConvergenceTtl(input: {
  repository_head: string;
  registry_generation: Sha256Digest;
  candidate_plan_ids: string[];
  next_offset: number;
}): ClosureConvergenceTtl {
  const suffix = input.candidate_plan_ids.slice(input.next_offset);
  return {
    schema_version: "closure-authority-convergence-ttl.v1",
    repository_head: input.repository_head,
    registry_generation: input.registry_generation,
    candidate_plan_ids: suffix,
    candidate_digest: digestIds(suffix),
    next_offset: input.next_offset,
  };
}

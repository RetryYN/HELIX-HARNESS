import { execFileSync } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
import {
  closeSync,
  existsSync,
  fsyncSync,
  openSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import {
  githubReceiptImmutableDigest,
  validateGithubRequiredCheckReceipt,
} from "./closure-auto-approval";
import {
  acquireClosureMaterializationLock,
  releaseClosureMaterializationLock,
} from "./closure-materialization-lock";
import {
  CLOSURE_TERMINAL_BOUNDARY_PATH,
  loadClosureTerminalBoundaries,
  parseClosureTerminalBoundaryLedger,
  replaceClosureTerminalBoundaryProjection,
} from "./closure-terminal-boundaries";
import { buildProjectCurrentLocationSnapshot } from "./current-location";
import type { HarnessDb } from "./index";

type Digest = `sha256:${string}`;

export function terminalBoundaryClassificationForAuthority(
  classification: "eligible" | "authority_backfill_required" | "human_only" | "invalid",
): "human_only" | "invalid_escalated" | null {
  if (classification === "human_only") return "human_only";
  if (classification === "invalid") return "invalid_escalated";
  return null;
}
const sha256 = (value: string | Buffer): Digest =>
  `sha256:${createHash("sha256").update(value).digest("hex")}`;
const stable = (value: unknown): string => {
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  if (value && typeof value === "object")
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, item]) => `${JSON.stringify(key)}:${stable(item)}`)
      .join(",")}}`;
  return JSON.stringify(value);
};
const unique = (ids: readonly string[], label: string): void => {
  if (new Set(ids).size !== ids.length) throw new Error(`${label} duplicate`);
};

export function verifyClosureEpochTransition(input: {
  repoRoot: string;
  authorityHead: string;
  closureHead: string;
  authorityPlanIds: string[];
  closurePlanIds: string[];
  addedPlanIds: string[];
}) {
  const git = (...args: string[]) =>
    execFileSync("git", args, { cwd: input.repoRoot, encoding: "utf8" }).trim();
  if (git("status", "--porcelain=v1", "--untracked-files=all"))
    throw new Error("epoch transition requires clean merged worktree");
  if (
    git("rev-parse", "HEAD") !== input.closureHead ||
    git("rev-parse", "origin/main") !== input.closureHead
  )
    throw new Error("closure epoch must be merged current main");
  execFileSync("git", ["merge-base", "--is-ancestor", input.authorityHead, input.closureHead], {
    cwd: input.repoRoot,
  });
  unique(input.authorityPlanIds, "authority plans");
  unique(input.closurePlanIds, "closure plans");
  unique(input.addedPlanIds, "added plans");
  const expected = [...input.authorityPlanIds, ...input.addedPlanIds];
  if (stable(expected) !== stable(input.closurePlanIds))
    throw new Error("epoch plan deletion or untyped addition");
  return {
    valid: true as const,
    authority_head: input.authorityHead,
    closure_head: input.closureHead,
  };
}

export function appendClosureTerminalBoundaryEvent(input: {
  repoRoot: string;
  path: string;
  event: Record<string, unknown>;
}) {
  if (input.path !== CLOSURE_TERMINAL_BOUNDARY_PATH) throw new Error("non-canonical boundary path");
  const lock = acquireClosureMaterializationLock(input.repoRoot);
  try {
    const absolute = join(input.repoRoot, input.path);
    const before = readFileSync(absolute);
    const events = parseClosureTerminalBoundaryLedger(before);
    const existing = events.find(
      (row) =>
        row.event_kind === "boundary_opened" &&
        row.plan_id === input.event.plan_id &&
        !events.some(
          (candidate) =>
            candidate.event_kind === "boundary_resolved" &&
            candidate.supersedes_event_digest === row.event_digest,
        ),
    );
    if (existing) {
      const semanticKeys = [
        "authority_head",
        "initial_set_digest",
        "cycle_digest",
        "plan_id",
        "classification",
        "reason",
        "owner",
        "next_decision_route",
        "automation_terminal",
        "whole_program_blocker",
      ] as const;
      if (
        existing.registry_digest !== input.event.registry_generation ||
        semanticKeys.some((key) => existing[key] !== input.event[key])
      )
        throw new Error(`terminal boundary replay conflict: ${String(input.event.plan_id)}`);
      return existing;
    }
    const previous = (events.at(-1)?.event_digest as Digest | undefined) ?? null;
    const body = {
      schema_version: "closure-terminal-boundary-ledger.v1",
      boundary_key: `closure-boundary:${String(input.event.plan_id)}`,
      ...input.event,
      registry_digest: input.event.registry_generation,
      previous_event_digest: previous,
      supersedes_event_digest: null,
      resolution_authority: null,
    };
    delete (body as Record<string, unknown>).registry_generation;
    const row = { ...body, event_digest: sha256(stable(body)) };
    const next = Buffer.concat([before, Buffer.from(`${JSON.stringify(row)}\n`)]);
    parseClosureTerminalBoundaryLedger(next);
    const temp = `${absolute}.tmp-${randomUUID()}`;
    const fd = openSync(temp, "wx", 0o600);
    try {
      writeFileSync(fd, next);
      fsyncSync(fd);
    } finally {
      closeSync(fd);
    }
    try {
      renameSync(temp, absolute);
      const directory = openSync(dirname(absolute), "r");
      try {
        fsyncSync(directory);
      } finally {
        closeSync(directory);
      }
    } finally {
      if (existsSync(temp)) rmSync(temp, { force: true });
    }
    return row;
  } finally {
    releaseClosureMaterializationLock(lock);
  }
}

export function verifyClosureTerminalBoundaryLedger(input: { repoRoot: string; path: string }) {
  if (input.path !== CLOSURE_TERMINAL_BOUNDARY_PATH) throw new Error("non-canonical boundary path");
  const events = parseClosureTerminalBoundaryLedger(readFileSync(join(input.repoRoot, input.path)));
  return { events, last_event_digest: events.at(-1)?.event_digest ?? null };
}

export function projectClosureTerminalBoundaries(input: {
  repoRoot: string;
  db: HarnessDb;
  path: string;
}) {
  const head = execFileSync("git", ["rev-parse", "HEAD"], {
    cwd: input.repoRoot,
    encoding: "utf8",
  }).trim();
  const registry = readFileSync(
    join(input.repoRoot, "docs/governance/closure-authority-registry.yaml"),
  );
  const rows = loadClosureTerminalBoundaries({
    repoRoot: input.repoRoot,
    currentHead: head,
    registryDigest: sha256(registry),
  });
  replaceClosureTerminalBoundaryProjection(input.db, rows);
  return {
    open: rows.filter((row) => row.resolved_event_digest === null).length,
    whole_program_blockers: rows.filter((row) => row.whole_program_blocker === 1).length,
  };
}

export function buildClosureConvergenceTargetSet(input: {
  initialPlanIds: string[];
  eligiblePlanIds: string[];
  needsPlanIds: string[];
  humanOnlyPlanIds: string[];
  invalidEscalatedPlanIds: string[];
  terminalBoundaryEventDigests: Digest[];
}) {
  for (const [label, ids] of Object.entries(input)) if (Array.isArray(ids)) unique(ids, label);
  if (input.needsPlanIds.length) throw new Error("N=0 precondition failed: needs remain");
  const partition = [
    input.eligiblePlanIds,
    input.humanOnlyPlanIds,
    input.invalidEscalatedPlanIds,
  ].flat();
  if (
    partition.length !== input.initialPlanIds.length ||
    new Set(partition).size !== partition.length ||
    partition.some((id) => !input.initialPlanIds.includes(id))
  )
    throw new Error("target set partition overlap, missing, or excess");
  const body = {
    initial_plan_ids: input.initialPlanIds,
    automatable_plan_ids: input.eligiblePlanIds,
    human_only_plan_ids: input.humanOnlyPlanIds,
    invalid_escalated_plan_ids: input.invalidEscalatedPlanIds,
    initial_set_digest: sha256(stable(input.initialPlanIds)),
    terminal_boundary_digest: sha256(stable([...input.terminalBoundaryEventDigests].sort())),
  };
  return { ...body, target_set_digest: sha256(stable(body)) };
}

export function buildClosureEpochPlan(input: {
  targetSet: ReturnType<typeof buildClosureConvergenceTargetSet>;
}) {
  return {
    materialize_target_digest: input.targetSet.target_set_digest,
    auto_approve_target_digest: input.targetSet.target_set_digest,
  };
}

export async function runClosureEpochAutoApproval(input: {
  repoRoot: string;
  closureHead: string;
  targetSetDigest: Digest;
  github: { load: () => unknown; refetch: () => unknown };
  now: Date;
}) {
  const current = execFileSync("git", ["rev-parse", "HEAD"], {
    cwd: input.repoRoot,
    encoding: "utf8",
  }).trim();
  if (current !== input.closureHead) throw new Error("receipt acquisition HEAD drift");
  const initial = input.github.load() as Parameters<
    typeof validateGithubRequiredCheckReceipt
  >[0]["receipt"];
  if (initial === null) throw new Error("GitHub required-check receipt missing");
  const errors = validateGithubRequiredCheckReceipt({
    repoRoot: input.repoRoot,
    receipt: initial,
    now: input.now,
  });
  if (errors.length) throw new Error(`GitHub receipt invalid: ${errors.join(", ")}`);
  const refreshed = input.github.refetch() as Parameters<
    typeof validateGithubRequiredCheckReceipt
  >[0]["receipt"];
  if (refreshed === null) throw new Error("GitHub required-check refetch missing");
  const refreshErrors = validateGithubRequiredCheckReceipt({
    repoRoot: input.repoRoot,
    receipt: refreshed,
    now: input.now,
  });
  if (
    refreshErrors.length ||
    githubReceiptImmutableDigest(initial) !== githubReceiptImmutableDigest(refreshed)
  )
    throw new Error(`GitHub refetch CAS invalid: ${refreshErrors.join(", ")}`);
  return {
    allowed: true,
    target_set_digest: input.targetSetDigest,
    github_receipt_digest: githubReceiptImmutableDigest(initial),
  };
}

export function finalizeClosureConvergenceEpoch(input: {
  repoRoot: string;
  db: HarnessDb;
  authorityHead: string;
  closureHead: string;
  initialAuthorityPlanIds: string[];
  addedPlanIds: string[];
}) {
  const inventory = (head: string) => {
    const paths = execFileSync("git", ["ls-tree", "-r", "--name-only", head, "--", "docs/plans"], {
      cwd: input.repoRoot,
      encoding: "utf8",
    })
      .trim()
      .split("\n")
      .filter((path) => path.endsWith(".md"));
    const rows = new Map<string, { path: string; bytes: Buffer; status: string; digest: Digest }>();
    for (const path of paths) {
      const bytes = execFileSync("git", ["show", `${head}:${path}`], { cwd: input.repoRoot });
      const text = bytes.toString("utf8");
      const planId = text.match(/^plan_id:\s*([^\s]+)\s*$/m)?.[1];
      const status = text.match(/^status:\s*([^\s]+)\s*$/m)?.[1];
      if (!planId || !status) continue;
      if (rows.has(planId)) throw new Error(`duplicate tracked PLAN ID: ${planId}`);
      rows.set(planId, { path, bytes, status, digest: sha256(bytes) });
    }
    return rows;
  };
  const currentHead = execFileSync("git", ["rev-parse", "HEAD"], {
    cwd: input.repoRoot,
    encoding: "utf8",
  }).trim();
  const originHead = execFileSync("git", ["rev-parse", "origin/main"], {
    cwd: input.repoRoot,
    encoding: "utf8",
  }).trim();
  if (currentHead !== input.closureHead || originHead !== input.closureHead)
    throw new Error("finalize closure HEAD is not merged current main");
  execFileSync("git", ["merge-base", "--is-ancestor", input.authorityHead, input.closureHead], {
    cwd: input.repoRoot,
    stdio: "ignore",
  });
  unique(input.initialAuthorityPlanIds, "authority plans");
  unique(input.addedPlanIds, "added plans");
  if (input.addedPlanIds.some((id) => input.initialAuthorityPlanIds.includes(id)))
    throw new Error("added plans overlap authority set");
  const ids = [...input.initialAuthorityPlanIds, ...input.addedPlanIds];
  unique(ids, "final plans");
  const authorityInventory = inventory(input.authorityHead);
  const closureInventory = inventory(input.closureHead);
  for (const id of input.initialAuthorityPlanIds)
    if (!authorityInventory.has(id) || !closureInventory.has(id))
      throw new Error(`authority/closure PLAN inventory missing: ${id}`);
  for (const id of input.addedPlanIds)
    if (authorityInventory.has(id) || !closureInventory.has(id))
      throw new Error(`added PLAN inventory relation invalid: ${id}`);
  const boundaries = input.db
    .prepare("SELECT * FROM closure_terminal_boundaries WHERE resolved_event_digest IS NULL")
    .all();
  const human = boundaries
    .filter((row) => row.classification === "human_only")
    .map((row) => String(row.plan_id))
    .sort();
  const invalid = boundaries
    .filter((row) => row.classification === "invalid_escalated")
    .map((row) => String(row.plan_id))
    .sort();
  const accepted = ids
    .filter((id) => {
      const row = input.db
        .prepare("SELECT status, source_hash FROM plan_registry WHERE plan_id=?")
        .get(id);
      const tracked = closureInventory.get(id);
      if (!tracked || row?.status !== tracked.status)
        throw new Error(`PLAN DB/blob status exact join failed: ${id}`);
      const dbDigest = String(row.source_hash ?? "");
      if (dbDigest !== tracked.digest && dbDigest !== tracked.digest.slice(7))
        throw new Error(`PLAN DB/blob digest exact join failed: ${id}`);
      return tracked.status === "accepted";
    })
    .sort();
  const finalIds = [...accepted, ...human, ...invalid];
  if (
    finalIds.length !== ids.length ||
    new Set(finalIds).size !== ids.length ||
    finalIds.some((id) => !ids.includes(id))
  )
    throw new Error("final I=A union H union X conservation failed");
  for (const id of [...human, ...invalid]) {
    const authority = authorityInventory.get(id);
    const closure = closureInventory.get(id);
    if (!authority || !closure || authority.path !== closure.path)
      throw new Error(`terminal PLAN canonical path changed across epoch: ${id}`);
    const authorityBytes = authority.bytes;
    const closureBytes = closure.bytes;
    if (
      !authorityBytes.equals(closureBytes) ||
      !readFileSync(join(input.repoRoot, closure.path)).equals(closureBytes)
    )
      throw new Error(`terminal PLAN path/blob changed across epoch: ${id}`);
  }
  const snapshot = buildProjectCurrentLocationSnapshot(input.db);
  const remainingAutomatable = snapshot.closure.queue.route_counts.close_ready;
  if (remainingAutomatable !== 0) throw new Error("remaining automatable close_ready is not zero");
  const remainingFrontier = snapshot.closure.queue.items
    .filter((item) => ids.includes(item.planId))
    .map((item) => `${item.planId}:${item.nextAction}`)
    .sort();
  if (remainingFrontier.length !== 0)
    throw new Error(`final N/E frontier is not empty: ${remainingFrontier.join(",")}`);
  return {
    accepted_plan_ids: accepted,
    human_only_plan_ids: human,
    invalid_escalated_plan_ids: invalid,
    remaining_automatable_close_ready: remainingAutomatable,
    whole_program_completion_allowed: boundaries.every(
      (row) => Number(row.whole_program_blocker) === 0,
    ),
  };
}

export async function reconcileClosureEpochOperation(input: {
  repoRoot: string;
  idempotencyKey: string;
  localJournal: { phase: string; artifact_digest: Digest };
  remote: {
    branch_exists: boolean;
    pull_request_state: string;
    merge_head: string | null;
    required_check_state: string;
  };
}) {
  if (!input.idempotencyKey.endsWith(input.localJournal.artifact_digest))
    throw new Error("idempotency key digest mismatch");
  if (
    input.remote.pull_request_state === "merged" &&
    input.remote.required_check_state === "success"
  )
    return { next_phase: "closure_epoch", replay_remote_mutation: false };
  if (input.remote.pull_request_state === "open" && input.remote.required_check_state === "pending")
    return { next_phase: "wait_ci", replay_remote_mutation: false };
  return { next_phase: "reconcile_remote", replay_remote_mutation: false };
}

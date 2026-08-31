import { execFileSync } from "node:child_process";
import {
  closeSync,
  existsSync,
  fsyncSync,
  mkdirSync,
  openSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { parse as parseYaml } from "yaml";
import { canonicalJson, type Sha256Digest, sha256Digest } from "./digest";
import {
  type ForwardReverseTerminalReservationInput,
  type ForwardReverseTerminalReservationResult,
  reserveForwardReverseTerminalPair,
} from "./forward-reverse-terminal-reservation";

export const FORWARD_PLAN_AUTHORING_TRANSACTION_SCHEMA =
  "helix-forward-plan-authoring-transaction.v1" as const;

export interface ForwardPlanAuthoringTransactionInput {
  repoRoot: string;
  reservationInput: ForwardReverseTerminalReservationInput;
  forwardDocument: string;
  reverseDocument: string;
  dryRun?: boolean;
}

export interface ForwardPlanAuthoringTransactionResult {
  schema_version: typeof FORWARD_PLAN_AUTHORING_TRANSACTION_SCHEMA;
  ok: boolean;
  status: "planned" | "committed" | "idempotent" | "blocked";
  findings: readonly string[];
  written_paths: readonly string[];
  reservation: ForwardReverseTerminalReservationResult;
  transaction_digest: Sha256Digest | null;
}

interface AuthoringJournal {
  schema_version: typeof FORWARD_PLAN_AUTHORING_TRANSACTION_SCHEMA;
  transaction_digest: Sha256Digest;
  state: "prepared" | "committed";
  files: Array<{ final: string; staged: string; digest: Sha256Digest }>;
}

export interface ForwardPlanAuthoringTransactionDeps {
  currentHead(repoRoot: string): string;
  beforeCommit?(): void;
}

const defaultDeps: ForwardPlanAuthoringTransactionDeps = {
  currentHead: (repoRoot) =>
    execFileSync("git", ["rev-parse", "HEAD"], {
      cwd: repoRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim(),
};

function fsyncFile(path: string): void {
  const fd = openSync(path, "r");
  try {
    fsyncSync(fd);
  } finally {
    closeSync(fd);
  }
}

function fsyncDirectory(path: string): void {
  const fd = openSync(path, "r");
  try {
    fsyncSync(fd);
  } finally {
    closeSync(fd);
  }
}

function durableWrite(path: string, bytes: string): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, bytes, { flag: "wx", mode: 0o600 });
  fsyncFile(path);
  fsyncDirectory(dirname(path));
}

function durableReplace(path: string, bytes: string): void {
  const temporary = `${path}.${process.pid}.tmp`;
  rmSync(temporary, { force: true });
  durableWrite(temporary, bytes);
  renameSync(temporary, path);
  fsyncDirectory(dirname(path));
}

function processIsAlive(pid: number): boolean {
  if (!Number.isSafeInteger(pid) || pid <= 0) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function acquireAuthoringLock(lockDir: string): boolean {
  const ownerPath = join(lockDir, "owner.json");
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      mkdirSync(dirname(lockDir), { recursive: true });
      mkdirSync(lockDir);
      durableWrite(ownerPath, `${JSON.stringify({ pid: process.pid })}\n`);
      return true;
    } catch {
      let ownerPid: number | null = null;
      try {
        const owner = JSON.parse(readFileSync(ownerPath, "utf8")) as { pid?: unknown };
        ownerPid = typeof owner.pid === "number" ? owner.pid : null;
      } catch {
        // mkdir成功後owner書込み前に停止したlockもstaleとして回収する。
      }
      if (ownerPid !== null && processIsAlive(ownerPid)) return false;
      try {
        rmSync(lockDir, { recursive: true, force: true });
      } catch {
        return false;
      }
    }
  }
  return false;
}

function recoverAuthoringJournal(repoRoot: string, journalPath: string): void {
  if (!existsSync(journalPath)) return;
  const journal = JSON.parse(readFileSync(journalPath, "utf8")) as AuthoringJournal;
  if (
    journal.schema_version !== FORWARD_PLAN_AUTHORING_TRANSACTION_SCHEMA ||
    !["prepared", "committed"].includes(journal.state) ||
    !Array.isArray(journal.files) ||
    journal.files.length !== 2
  )
    throw new Error("authoring_journal_invalid");
  const stageRoot = `${resolve(repoRoot, ".helix/tmp/forward-plan-authoring")}/`;
  for (const file of journal.files) {
    if (
      !/^docs\/plans\/PLAN-[A-Za-z0-9-]+\.md$/u.test(file.final) ||
      !resolve(file.staged).startsWith(stageRoot) ||
      !/^sha256:[a-f0-9]{64}$/u.test(file.digest)
    )
      throw new Error("authoring_journal_path_invalid");
  }
  if (journal.state === "committed") {
    for (const file of journal.files) {
      const target = join(repoRoot, file.final);
      if (existsSync(target)) {
        if (sha256Digest(readFileSync(target, "utf8")) !== file.digest)
          throw new Error("authoring_recovery_digest_drift");
        continue;
      }
      if (
        !existsSync(file.staged) ||
        sha256Digest(readFileSync(file.staged, "utf8")) !== file.digest
      )
        throw new Error("authoring_recovery_stage_missing");
      mkdirSync(dirname(target), { recursive: true });
      renameSync(file.staged, target);
      fsyncDirectory(dirname(target));
    }
  } else {
    for (const file of journal.files) {
      const target = join(repoRoot, file.final);
      if (existsSync(target) && sha256Digest(readFileSync(target, "utf8")) === file.digest)
        rmSync(target, { force: true });
      rmSync(file.staged, { force: true });
    }
  }
  rmSync(journalPath, { force: true });
  fsyncDirectory(dirname(journalPath));
}

function documentContractFindings(
  document: string,
  contract: NonNullable<ForwardReverseTerminalReservationResult["forward"]>,
  expected: {
    kind: "add-impl" | "reverse";
    ownerIssue: number;
    responsibilityOwner: string;
  },
): string[] {
  const match = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/u.exec(document);
  if (!match?.[1]) return ["document_contract_drift"];
  let frontmatter: unknown;
  try {
    frontmatter = parseYaml(match[1]);
  } catch {
    return ["document_contract_drift"];
  }
  if (typeof frontmatter !== "object" || frontmatter === null || Array.isArray(frontmatter))
    return ["document_contract_drift"];
  const value = frontmatter as Record<string, unknown>;
  const dependencies =
    typeof value.dependencies === "object" &&
    value.dependencies !== null &&
    !Array.isArray(value.dependencies)
      ? (value.dependencies as Record<string, unknown>)
      : null;
  const references = dependencies?.references;
  if (
    value.plan_id !== contract.plan_id ||
    value.kind !== expected.kind ||
    value.status !== contract.status ||
    value.backfill_state !== contract.backfill_state ||
    value.completion_claim_allowed !== contract.completion_claim_allowed ||
    value.github_issue_id !== expected.ownerIssue ||
    value.responsibility_owner !== expected.responsibilityOwner ||
    !Array.isArray(references) ||
    !contract.references.every((reference) => references.includes(reference))
  )
    return ["document_contract_drift"];
  return [];
}

function emptyReservation(findings: readonly string[]): ForwardReverseTerminalReservationResult {
  return {
    schema_version: "helix-forward-reverse-terminal-reservation.v1",
    ok: false,
    findings,
    forward: null,
    reverse: null,
    reservations: [],
    reservation_projection: null,
  };
}

function blocked(
  findings: readonly string[],
  reservation: ForwardReverseTerminalReservationResult = emptyReservation(findings),
): ForwardPlanAuthoringTransactionResult {
  return {
    schema_version: FORWARD_PLAN_AUTHORING_TRANSACTION_SCHEMA,
    ok: false,
    status: "blocked",
    findings,
    written_paths: [],
    reservation,
    transaction_digest: null,
  };
}

export function authorForwardPlanTransaction(
  input: ForwardPlanAuthoringTransactionInput,
  deps: ForwardPlanAuthoringTransactionDeps = defaultDeps,
): ForwardPlanAuthoringTransactionResult {
  let currentHead: string;
  try {
    currentHead = deps.currentHead(input.repoRoot);
  } catch {
    return blocked(["current_head_unavailable"]);
  }
  if (currentHead !== input.reservationInput.candidate_head)
    return blocked(["stale_candidate_head"]);

  const forwardDigest = sha256Digest(input.forwardDocument);
  const reverseDigest = sha256Digest(input.reverseDocument);
  if (forwardDigest !== input.reservationInput.forward.plan_blob_digest)
    return blocked(["forward_document_digest_drift"]);
  if (reverseDigest !== input.reservationInput.allocation.reverse_plan_blob_digest)
    return blocked(["reverse_document_digest_drift"]);

  const reservation = reserveForwardReverseTerminalPair(input.reservationInput);
  if (!reservation.ok || !reservation.forward || !reservation.reverse)
    return blocked(reservation.findings, reservation);
  const contractFindings = [
    ...documentContractFindings(input.forwardDocument, reservation.forward, {
      kind: "add-impl",
      ownerIssue: input.reservationInput.forward.owner_issue,
      responsibilityOwner: input.reservationInput.forward.responsibility_owner,
    }),
    ...documentContractFindings(input.reverseDocument, reservation.reverse, {
      kind: "reverse",
      ownerIssue: input.reservationInput.forward.owner_issue,
      responsibilityOwner: input.reservationInput.forward.responsibility_owner,
    }),
  ];
  if (contractFindings.length > 0) return blocked(contractFindings, reservation);

  const forwardPath = `docs/plans/${reservation.forward.plan_id}.md`;
  const reversePath = `docs/plans/${reservation.reverse.plan_id}.md`;
  const transactionDigest = sha256Digest(
    canonicalJson({
      candidate_head: currentHead,
      reservation_digest: reservation.reservation_projection?.projection_digest,
      files: [
        [forwardPath, forwardDigest],
        [reversePath, reverseDigest],
      ],
    }),
  );
  if (input.dryRun) {
    return {
      schema_version: FORWARD_PLAN_AUTHORING_TRANSACTION_SCHEMA,
      ok: true,
      status: "planned",
      findings: [],
      written_paths: [],
      reservation,
      transaction_digest: transactionDigest,
    };
  }

  const documents = [
    { relative: forwardPath, bytes: input.forwardDocument, digest: forwardDigest },
    { relative: reversePath, bytes: input.reverseDocument, digest: reverseDigest },
  ];
  const journalPath = join(
    input.repoRoot,
    ".helix",
    "state",
    "forward-plan-authoring-journal.json",
  );
  const txDir = join(input.repoRoot, ".helix", "tmp", "forward-plan-authoring", transactionDigest);
  const lockDir = join(input.repoRoot, ".helix", "state", "forward-plan-authoring.lock");
  if (!acquireAuthoringLock(lockDir)) return blocked(["authoring_transaction_locked"], reservation);
  try {
    try {
      recoverAuthoringJournal(input.repoRoot, journalPath);
    } catch (error) {
      return blocked(
        [error instanceof Error ? error.message : "authoring_recovery_failed"],
        reservation,
      );
    }
    const existing = documents.map((file) => {
      const path = join(input.repoRoot, file.relative);
      return existsSync(path) ? sha256Digest(readFileSync(path, "utf8")) : null;
    });
    if (existing.every((digest, index) => digest === documents[index]?.digest)) {
      return {
        schema_version: FORWARD_PLAN_AUTHORING_TRANSACTION_SCHEMA,
        ok: true,
        status: "idempotent",
        findings: [],
        written_paths: [],
        reservation,
        transaction_digest: transactionDigest,
      };
    }
    if (existing.some((digest) => digest !== null))
      return blocked(["plan_path_collision"], reservation);
    if (existsSync(journalPath)) return blocked(["authoring_recovery_required"], reservation);
    mkdirSync(txDir, { recursive: true });
    const files = documents.map((file, index) => {
      const staged = join(txDir, `${index}.plan`);
      durableWrite(staged, file.bytes);
      return { final: file.relative, staged, digest: file.digest };
    });
    const journal: AuthoringJournal = {
      schema_version: FORWARD_PLAN_AUTHORING_TRANSACTION_SCHEMA,
      transaction_digest: transactionDigest,
      state: "prepared",
      files,
    };
    durableWrite(journalPath, `${JSON.stringify(journal)}\n`);
    deps.beforeCommit?.();
    if (deps.currentHead(input.repoRoot) !== currentHead) {
      rmSync(journalPath, { force: true });
      rmSync(txDir, { recursive: true, force: true });
      return blocked(["stale_candidate_head"], reservation);
    }
    for (const file of documents) {
      const target = join(input.repoRoot, file.relative);
      if (existsSync(target)) {
        rmSync(journalPath, { force: true });
        rmSync(txDir, { recursive: true, force: true });
        return blocked(["plan_path_collision"], reservation);
      }
    }
    journal.state = "committed";
    durableReplace(journalPath, `${JSON.stringify(journal)}\n`);
    try {
      for (const file of files) {
        const target = join(input.repoRoot, file.final);
        mkdirSync(dirname(target), { recursive: true });
        renameSync(file.staged, target);
        fsyncDirectory(dirname(target));
      }
    } catch {
      try {
        recoverAuthoringJournal(input.repoRoot, journalPath);
      } catch {
        return blocked(["materialization_recovery_failed"], reservation);
      }
      return {
        schema_version: FORWARD_PLAN_AUTHORING_TRANSACTION_SCHEMA,
        ok: true,
        status: "committed",
        findings: ["materialization_recovered"],
        written_paths: documents.map((file) => file.relative),
        reservation,
        transaction_digest: transactionDigest,
      };
    }
    rmSync(journalPath, { force: true });
    fsyncDirectory(dirname(journalPath));
    rmSync(txDir, { recursive: true, force: true });
    return {
      schema_version: FORWARD_PLAN_AUTHORING_TRANSACTION_SCHEMA,
      ok: true,
      status: "committed",
      findings: [],
      written_paths: documents.map((file) => file.relative),
      reservation,
      transaction_digest: transactionDigest,
    };
  } finally {
    rmSync(lockDir, { recursive: true, force: true });
  }
}

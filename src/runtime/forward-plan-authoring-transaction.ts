import { execFileSync } from "node:child_process";
import {
  closeSync,
  existsSync,
  fsyncSync,
  linkSync,
  lstatSync,
  mkdirSync,
  openSync,
  readFileSync,
  realpathSync,
  renameSync,
  rmSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { dirname, isAbsolute, relative, resolve, sep } from "node:path";
import { parse as parseYaml } from "yaml";
import {
  acquireClosureMaterializationLock,
  type ClosureMaterializationLock,
  releaseClosureMaterializationLock,
} from "../state-db/closure-materialization-lock";
import { canonicalJson, type Sha256Digest, sha256Digest } from "./digest";
import {
  type ForwardReverseTerminalReservationInput,
  type ForwardReverseTerminalReservationResult,
  reserveForwardReverseTerminalPair,
} from "./forward-reverse-terminal-reservation";
import {
  type OpenBranchPlanReservationSnapshot,
  projectOpenBranchPlanReservations,
} from "./open-branch-plan-identity-reservation";

export const FORWARD_PLAN_AUTHORING_TRANSACTION_SCHEMA =
  "helix-forward-plan-authoring-transaction.v2" as const;
export const OPEN_BRANCH_RESERVATION_AUTHORITY_PATH =
  ".helix/state/open-branch-plan-reservations.json" as const;
const RECEIPT_ROOT = ".helix/state/plan-allocator-receipts";
const JOURNAL = ".helix/state/forward-plan-authoring-journal.json";
const DIGEST = /^sha256:[a-f0-9]{64}$/u;

type Allocation = ForwardReverseTerminalReservationInput["allocation"];
interface AllocatorReceiptPayload {
  schema_version: "helix-plan-allocator-receipt.v1";
  issuer: "helix-plan-allocator";
  issued_main_head: string;
  assignment_id: string;
  lease_id: string;
  fence_token: string;
  reservation_authority_before_digest: Sha256Digest;
  allocation: Allocation;
}
interface AllocatorReceipt extends AllocatorReceiptPayload {
  receipt_digest: Sha256Digest;
}
interface JournalFile {
  action: "create" | "replace";
  final: string;
  staged: string;
  digest: Sha256Digest;
  before_digest: Sha256Digest | null;
}
interface JournalPayload {
  schema_version: typeof FORWARD_PLAN_AUTHORING_TRANSACTION_SCHEMA;
  state: "prepared" | "committed";
  transaction_digest: Sha256Digest;
  candidate_head: string;
  origin_main_head: string;
  allocator_receipt_digest: Sha256Digest;
  reservation_before_digest: Sha256Digest;
  reservation_after_digest: Sha256Digest;
  files: JournalFile[];
}
interface Journal extends JournalPayload {
  journal_digest: Sha256Digest;
}

export interface ForwardPlanAuthoringTransactionInput {
  repoRoot: string;
  reservationInput: Omit<ForwardReverseTerminalReservationInput, "allocation"> & {
    allocation: Omit<Allocation, "receipt_digest">;
  };
  reservationAuthorityPath: typeof OPEN_BRANCH_RESERVATION_AUTHORITY_PATH;
  forwardDocument: string;
  reverseDocument: string;
  dryRun?: boolean;
}
export interface ForwardPlanAuthoringTransactionResult {
  schema_version: typeof FORWARD_PLAN_AUTHORING_TRANSACTION_SCHEMA;
  ok: boolean;
  status: "planned" | "committed" | "idempotent" | "blocked" | "recovery_required";
  findings: readonly string[];
  written_paths: readonly string[];
  reservation: ForwardReverseTerminalReservationResult;
  transaction_digest: Sha256Digest | null;
  reservation_authority_digest: Sha256Digest | null;
}
export interface ForwardPlanAuthoringTransactionDeps {
  currentHead(root: string): string;
  originMainHead(root: string): string;
  acquireLock(root: string): ClosureMaterializationLock;
  releaseLock(lock: ClosureMaterializationLock): void;
  beforeCommit?(): void;
}

const git = (root: string, ref: string) =>
  execFileSync("git", ["rev-parse", ref], {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  }).trim();
const defaults: ForwardPlanAuthoringTransactionDeps = {
  currentHead: (root) => git(root, "HEAD"),
  originMainHead: (root) => git(root, "refs/remotes/origin/main"),
  acquireLock: acquireClosureMaterializationLock,
  releaseLock: releaseClosureMaterializationLock,
};
const emptyReservation = (
  findings: readonly string[],
): ForwardReverseTerminalReservationResult => ({
  schema_version: "helix-forward-reverse-terminal-reservation.v1",
  ok: false,
  findings,
  forward: null,
  reverse: null,
  reservations: [],
  reservation_projection: null,
});
const blocked = (
  findings: readonly string[],
  reservation = emptyReservation(findings),
): ForwardPlanAuthoringTransactionResult => ({
  schema_version: FORWARD_PLAN_AUTHORING_TRANSACTION_SCHEMA,
  ok: false,
  status: "blocked",
  findings,
  written_paths: [],
  reservation,
  transaction_digest: null,
  reservation_authority_digest: null,
});
const recoveryRequired = (
  finding: string,
  reservation: ForwardReverseTerminalReservationResult,
): ForwardPlanAuthoringTransactionResult => ({
  ...blocked([finding], reservation),
  status: "recovery_required",
});
const fsyncDir = (path: string) => {
  const fd = openSync(path, "r");
  try {
    fsyncSync(fd);
  } finally {
    closeSync(fd);
  }
};
function create(path: string, bytes: string) {
  mkdirSync(dirname(path), { recursive: true });
  const fd = openSync(path, "wx", 0o600);
  try {
    writeFileSync(fd, bytes);
    fsyncSync(fd);
  } finally {
    closeSync(fd);
  }
  fsyncDir(dirname(path));
}
function replace(path: string, bytes: string) {
  const temp = `${path}.${process.pid}.tmp`;
  rmSync(temp, { force: true });
  create(temp, bytes);
  renameSync(temp, path);
  fsyncDir(dirname(path));
}
const seal = (value: JournalPayload): Journal => ({
  ...value,
  journal_digest: sha256Digest(canonicalJson(value)),
});
const canonicalRelative = (path: string) =>
  path.length > 0 &&
  !isAbsolute(path) &&
  !path.includes("\\") &&
  path.split("/").every((part) => part !== "" && part !== "." && part !== "..");
const within = (root: string, target: string) => {
  const child = relative(root, target);
  return child === "" || (!child.startsWith(`..${sep}`) && child !== ".." && !isAbsolute(child));
};
function assertNoSymlinkComponents(root: string, path: string, includeLeaf: boolean): void {
  const parts = relative(root, path).split(sep).filter(Boolean);
  const checked = includeLeaf ? parts : parts.slice(0, -1);
  let cursor = root;
  for (const part of checked) {
    cursor = resolve(cursor, part);
    if (lstatSync(cursor).isSymbolicLink()) throw new Error("physical_path_boundary");
  }
}
function existing(root: string, rel: string) {
  if (!canonicalRelative(rel)) throw new Error("physical_path_invalid");
  const lexical = resolve(root, rel);
  if (!within(root, lexical)) throw new Error("physical_path_boundary");
  assertNoSymlinkComponents(root, lexical, true);
  const physical = realpathSync(lexical);
  if (!within(root, physical)) throw new Error("physical_path_boundary");
  return physical;
}
function target(root: string, rel: string) {
  if (!canonicalRelative(rel)) throw new Error("physical_path_invalid");
  const lexical = resolve(root, rel);
  assertNoSymlinkComponents(root, lexical, false);
  const parent = realpathSync(dirname(lexical));
  if (
    !within(root, lexical) ||
    !within(root, parent) ||
    lstatSync(dirname(lexical)).isSymbolicLink()
  )
    throw new Error("physical_path_boundary");
  return lexical;
}

function frontmatter(document: string): Record<string, unknown> | null {
  const match = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/u.exec(document);
  if (!match?.[1]) return null;
  try {
    const value = parseYaml(match[1]);
    return typeof value === "object" && value !== null && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}
function documentValid(
  document: string,
  contract: NonNullable<ForwardReverseTerminalReservationResult["forward"]>,
  expected: {
    kind: "add-impl" | "reverse";
    issue: number;
    owner: string;
    target: "ADD_FEATURE" | "REVERSE";
    version: string;
    digest: string;
  },
) {
  const value = frontmatter(document);
  if (!value) return false;
  const dependencies = value.dependencies as Record<string, unknown> | undefined;
  const references = dependencies?.references;
  const workflow = value.workflow_identity as Record<string, unknown> | undefined;
  return (
    value.plan_id === contract.plan_id &&
    value.kind === expected.kind &&
    value.status === "draft" &&
    value.backfill_state === "pending_reverse" &&
    value.completion_claim_allowed === false &&
    value.github_issue_id === expected.issue &&
    value.responsibility_owner === expected.owner &&
    Array.isArray(references) &&
    references.length === 1 &&
    references[0] === contract.references[0] &&
    workflow?.schema_version === "helix-plan-workflow-identity.v1" &&
    workflow.registry_version === expected.version &&
    workflow.registry_source_digest === expected.digest &&
    workflow.target_axis === "workflow_model" &&
    workflow.target_id === expected.target
  );
}
function journal(root: string): Journal {
  try {
    const parsed = JSON.parse(readFileSync(existing(root, JOURNAL), "utf8")) as Journal;
    const { journal_digest, ...payload } = parsed;
    const prefix = `.helix/tmp/forward-plan-authoring/${parsed.transaction_digest}/`;
    const files = Array.isArray(parsed.files) ? parsed.files : [];
    const expectedTransactionDigest = sha256Digest(
      canonicalJson({
        head: parsed.candidate_head,
        main: parsed.origin_main_head,
        allocator: parsed.allocator_receipt_digest,
        beforeDigest: parsed.reservation_before_digest,
        afterDigest: parsed.reservation_after_digest,
        plans: files.slice(0, 2).map((file) => [file.final, file.digest]),
      }),
    );
    if (
      parsed.schema_version !== FORWARD_PLAN_AUTHORING_TRANSACTION_SCHEMA ||
      !["prepared", "committed"].includes(parsed.state) ||
      journal_digest !== sha256Digest(canonicalJson(payload)) ||
      !DIGEST.test(journal_digest) ||
      parsed.transaction_digest !== expectedTransactionDigest ||
      !DIGEST.test(parsed.allocator_receipt_digest) ||
      !DIGEST.test(parsed.reservation_before_digest) ||
      !DIGEST.test(parsed.reservation_after_digest) ||
      files.length !== 4 ||
      files[0]?.action !== "create" ||
      files[1]?.action !== "create" ||
      files[2]?.action !== "create" ||
      files[3]?.action !== "replace" ||
      !files[0]?.final.startsWith("docs/plans/PLAN-") ||
      !files[1]?.final.startsWith("docs/plans/PLAN-REVERSE-") ||
      !files[2]?.final.startsWith(`${RECEIPT_ROOT}/`) ||
      files[3]?.final !== OPEN_BRANCH_RESERVATION_AUTHORITY_PATH ||
      new Set(files.map((file) => file.final)).size !== 4 ||
      new Set(files.map((file) => file.staged)).size !== 4 ||
      files.some(
        (file) =>
          !canonicalRelative(file.final) ||
          !canonicalRelative(file.staged) ||
          !file.staged.startsWith(prefix) ||
          !DIGEST.test(file.digest) ||
          (file.before_digest !== null && !DIGEST.test(file.before_digest)),
      )
    )
      throw new Error("authoring_journal_seal_invalid");
    return parsed;
  } catch {
    throw new Error("authoring_journal_seal_invalid");
  }
}
function recover(root: string) {
  if (!existsSync(resolve(root, JOURNAL))) return;
  const value = journal(root);
  for (const file of value.files) {
    const finalLexical = resolve(root, file.final);
    const stagedLexical = resolve(root, file.staged);
    if (value.state === "prepared") {
      if (file.action === "create" && !existsSync(finalLexical)) target(root, file.final);
      if (file.action === "replace") existing(root, file.final);
      if (file.action === "create" && existsSync(finalLexical))
        throw new Error("prepared_recovery_external_write");
      if (existsSync(stagedLexical)) unlinkSync(existing(root, file.staged));
      continue;
    }
    if (
      existsSync(finalLexical) &&
      sha256Digest(readFileSync(existing(root, file.final), "utf8")) === file.digest
    )
      continue;
    if (
      !existsSync(stagedLexical) ||
      sha256Digest(readFileSync(existing(root, file.staged), "utf8")) !== file.digest
    )
      throw new Error("committed_recovery_stage_missing");
    const staged = existing(root, file.staged);
    if (file.action === "create") {
      const final = target(root, file.final);
      linkSync(staged, final);
      unlinkSync(staged);
      fsyncDir(dirname(final));
    } else {
      if (
        !existsSync(finalLexical) ||
        sha256Digest(readFileSync(existing(root, file.final), "utf8")) !== file.before_digest
      )
        throw new Error("reservation_authority_cas_drift");
      const final = existing(root, file.final);
      renameSync(staged, final);
      fsyncDir(dirname(final));
    }
  }
  unlinkSync(existing(root, JOURNAL));
  fsyncDir(dirname(target(root, JOURNAL)));
}

export function authorForwardPlanTransaction(
  input: ForwardPlanAuthoringTransactionInput,
  deps: ForwardPlanAuthoringTransactionDeps = defaults,
): ForwardPlanAuthoringTransactionResult {
  let root: string, head: string, main: string;
  try {
    root = realpathSync(input.repoRoot);
    if (resolve(input.repoRoot) !== root) return blocked(["repository_realpath_mismatch"]);
    head = deps.currentHead(root);
    main = deps.originMainHead(root);
  } catch {
    return blocked(["git_or_repository_authority_unavailable"]);
  }
  if (head !== input.reservationInput.candidate_head) return blocked(["stale_candidate_head"]);
  if (
    main !== input.reservationInput.expected_main_head ||
    main !== input.reservationInput.observed_main_head
  )
    return blocked(["origin_main_authority_mismatch"]);
  let authorityBytes: string, authority: OpenBranchPlanReservationSnapshot;
  try {
    if (Object.hasOwn(input.reservationInput.allocation, "receipt_digest"))
      return blocked(["caller_allocator_receipt_forbidden"]);
    if (input.reservationAuthorityPath !== OPEN_BRANCH_RESERVATION_AUTHORITY_PATH)
      return blocked(["reservation_authority_path_invalid"]);
    authorityBytes = readFileSync(existing(root, input.reservationAuthorityPath), "utf8");
    authority = JSON.parse(authorityBytes) as OpenBranchPlanReservationSnapshot;
    if (canonicalJson(authority) !== canonicalJson(input.reservationInput.reservation_snapshot))
      return blocked(["reservation_authority_input_drift"]);
    if (!projectOpenBranchPlanReservations(authority).ok)
      return blocked(["reservation_authority_invalid"]);
  } catch (error) {
    return blocked([error instanceof Error ? error.message : "authority_invalid"]);
  }
  const forwardDigest = sha256Digest(input.forwardDocument),
    reverseDigest = sha256Digest(input.reverseDocument);
  if (forwardDigest !== input.reservationInput.forward.plan_blob_digest)
    return blocked(["forward_document_digest_drift"]);
  if (reverseDigest !== input.reservationInput.allocation.reverse_plan_blob_digest)
    return blocked(["reverse_document_digest_drift"]);
  const allocationPayload = { ...input.reservationInput.allocation };
  const allocation: Allocation = {
    ...allocationPayload,
    receipt_digest: sha256Digest(canonicalJson(allocationPayload)),
  };
  const issuedReservationInput: ForwardReverseTerminalReservationInput = {
    ...input.reservationInput,
    allocation,
  };
  const retryIds = new Set([allocation.forward_plan_id, allocation.reverse_plan_id]),
    retryReservations = authority.reservations.filter((entry) => retryIds.has(entry.plan_id)),
    exactRetry =
      retryReservations.length === 2 &&
      retryReservations.every(
        (entry) =>
          entry.owner_issue === input.reservationInput.forward.owner_issue &&
          entry.responsibility_owner === input.reservationInput.forward.responsibility_owner &&
          entry.head_sha === head &&
          entry.lifecycle === "active" &&
          entry.source.kind === "active_writer" &&
          entry.source.branch === input.reservationInput.branch &&
          entry.source.assignment_id === input.reservationInput.assignment_id &&
          entry.source.lease_id === input.reservationInput.lease_id &&
          entry.source.fence_token === input.reservationInput.fence_token &&
          ((entry.plan_id === allocation.forward_plan_id &&
            entry.plan_path === `docs/plans/${allocation.forward_plan_id}.md` &&
            entry.plan_blob_digest === forwardDigest) ||
            (entry.plan_id === allocation.reverse_plan_id &&
              entry.plan_path === `docs/plans/${allocation.reverse_plan_id}.md` &&
              entry.plan_blob_digest === reverseDigest)),
      ),
    reservation = reserveForwardReverseTerminalPair({
      ...issuedReservationInput,
      reservation_snapshot: exactRetry
        ? {
            ...authority,
            reservations: authority.reservations.filter((entry) => !retryIds.has(entry.plan_id)),
          }
        : authority,
    });
  if (!reservation.ok || !reservation.forward || !reservation.reverse)
    return blocked(reservation.findings, reservation);
  let catalog: Record<string, unknown>;
  try {
    catalog = JSON.parse(
      readFileSync(existing(root, "config/workflow-classification-catalog.v1.json"), "utf8"),
    ) as Record<string, unknown>;
  } catch {
    return blocked(["workflow_identity_authority_invalid"], reservation);
  }
  const source = catalog.source_registry as Record<string, unknown> | undefined,
    entities = catalog.entities as Array<Record<string, unknown>> | undefined;
  if (
    typeof source?.registry_version !== "string" ||
    typeof source.registry_source_digest !== "string" ||
    !Array.isArray(entities) ||
    !["ADD_FEATURE", "REVERSE"].every((id) =>
      entities.some((entity) => entity.axis === "workflow_model" && entity.id === id),
    )
  )
    return blocked(["workflow_identity_authority_invalid"], reservation);
  const common = {
    issue: input.reservationInput.forward.owner_issue,
    owner: input.reservationInput.forward.responsibility_owner,
    version: source.registry_version,
    digest: source.registry_source_digest,
  };
  if (
    !documentValid(input.forwardDocument, reservation.forward, {
      ...common,
      kind: "add-impl",
      target: "ADD_FEATURE",
    }) ||
    !documentValid(input.reverseDocument, reservation.reverse, {
      ...common,
      kind: "reverse",
      target: "REVERSE",
    })
  )
    return blocked(["document_contract_drift"], reservation);
  const forwardPath = `docs/plans/${reservation.forward.plan_id}.md`,
    reversePath = `docs/plans/${reservation.reverse.plan_id}.md`;
  const next: OpenBranchPlanReservationSnapshot = {
    ...authority,
    reservations: [
      ...(reservation.reservation_projection?.active_reservations ?? []),
      ...(reservation.reservation_projection?.released_reservations ?? []),
    ],
  };
  const nextBytes = `${canonicalJson(next)}\n`,
    beforeDigest = sha256Digest(authorityBytes),
    afterDigest = sha256Digest(nextBytes);
  const issuedReceiptPayload: AllocatorReceiptPayload = {
      schema_version: "helix-plan-allocator-receipt.v1",
      issuer: "helix-plan-allocator",
      issued_main_head: main,
      assignment_id: input.reservationInput.assignment_id,
      lease_id: input.reservationInput.lease_id,
      fence_token: input.reservationInput.fence_token,
      reservation_authority_before_digest: beforeDigest,
      allocation,
    },
    receiptPath = `${RECEIPT_ROOT}/${allocation.allocation_id}.json`;
  let receipt: AllocatorReceipt;
  if (exactRetry) {
    try {
      const persistedReceipt = JSON.parse(
          readFileSync(existing(root, receiptPath), "utf8"),
        ) as AllocatorReceipt,
        { receipt_digest: persistedDigest, ...persistedPayload } = persistedReceipt;
      if (
        persistedDigest !== sha256Digest(canonicalJson(persistedPayload)) ||
        persistedPayload.schema_version !== issuedReceiptPayload.schema_version ||
        persistedPayload.issuer !== issuedReceiptPayload.issuer ||
        persistedPayload.issued_main_head !== issuedReceiptPayload.issued_main_head ||
        persistedPayload.assignment_id !== issuedReceiptPayload.assignment_id ||
        persistedPayload.lease_id !== issuedReceiptPayload.lease_id ||
        persistedPayload.fence_token !== issuedReceiptPayload.fence_token ||
        canonicalJson(persistedPayload.allocation) !== canonicalJson(allocation)
      )
        return blocked(["idempotent_allocator_receipt_drift"], reservation);
      receipt = persistedReceipt;
    } catch {
      return blocked(["idempotent_allocator_receipt_drift"], reservation);
    }
  } else {
    receipt = {
      ...issuedReceiptPayload,
      receipt_digest: sha256Digest(canonicalJson(issuedReceiptPayload)),
    };
  }
  const receiptBytes = `${canonicalJson(receipt)}\n`,
    receiptDigest = sha256Digest(receiptBytes);
  const transactionDigest = sha256Digest(
    canonicalJson({
      head,
      main,
      allocator: receipt.receipt_digest,
      beforeDigest,
      afterDigest,
      plans: [
        [forwardPath, forwardDigest],
        [reversePath, reverseDigest],
      ],
    }),
  );
  const success = (
    status: "planned" | "committed" | "idempotent",
    paths: string[],
  ): ForwardPlanAuthoringTransactionResult => ({
    schema_version: FORWARD_PLAN_AUTHORING_TRANSACTION_SCHEMA,
    ok: true,
    status,
    findings: [],
    written_paths: paths,
    reservation,
    transaction_digest: transactionDigest,
    reservation_authority_digest: afterDigest,
  });
  if (input.dryRun) return success("planned", []);
  let lock: ClosureMaterializationLock;
  try {
    lock = deps.acquireLock(root);
  } catch {
    return blocked(["authoring_transaction_locked"], reservation);
  }
  try {
    recover(root);
    const authorityPath = existing(root, input.reservationAuthorityPath);
    if (sha256Digest(readFileSync(authorityPath, "utf8")) !== beforeDigest)
      return blocked(["reservation_authority_cas_drift"], reservation);
    if (deps.currentHead(root) !== head || deps.originMainHead(root) !== main)
      return blocked(["git_authority_drift"], reservation);
    mkdirSync(resolve(root, RECEIPT_ROOT), { recursive: true });
    existing(root, RECEIPT_ROOT);
    const createPaths = [forwardPath, reversePath, receiptPath],
      createTargets = createPaths.map((path) => target(root, path)),
      current = createTargets.map((path, index) =>
        existsSync(path)
          ? sha256Digest(readFileSync(existing(root, createPaths[index] as string), "utf8"))
          : null,
      );
    if (
      current[0] === forwardDigest &&
      current[1] === reverseDigest &&
      current[2] === receiptDigest
    ) {
      const reread = projectOpenBranchPlanReservations(
        JSON.parse(readFileSync(authorityPath, "utf8")),
      );
      return reread.projection_digest === reservation.reservation_projection?.projection_digest
        ? success("idempotent", [])
        : blocked(["idempotent_reservation_authority_drift"], reservation);
    }
    if (current.some((value) => value !== null))
      return blocked(["plan_path_collision"], reservation);
    const txRoot = `.helix/tmp/forward-plan-authoring/${transactionDigest}`;
    const files: Array<JournalFile & { bytes: string }> = [
      {
        action: "create",
        final: forwardPath,
        staged: `${txRoot}/0.stage`,
        digest: forwardDigest,
        before_digest: null,
        bytes: input.forwardDocument,
      },
      {
        action: "create",
        final: reversePath,
        staged: `${txRoot}/1.stage`,
        digest: reverseDigest,
        before_digest: null,
        bytes: input.reverseDocument,
      },
      {
        action: "create",
        final: receiptPath,
        staged: `${txRoot}/2.stage`,
        digest: receiptDigest,
        before_digest: null,
        bytes: receiptBytes,
      },
      {
        action: "replace",
        final: input.reservationAuthorityPath,
        staged: `${txRoot}/3.stage`,
        digest: afterDigest,
        before_digest: beforeDigest,
        bytes: nextBytes,
      },
    ];
    for (const file of files) {
      mkdirSync(dirname(resolve(root, file.staged)), { recursive: true });
      create(target(root, file.staged), file.bytes);
    }
    const payload: JournalPayload = {
      schema_version: FORWARD_PLAN_AUTHORING_TRANSACTION_SCHEMA,
      state: "prepared",
      transaction_digest: transactionDigest,
      candidate_head: head,
      origin_main_head: main,
      allocator_receipt_digest: receipt.receipt_digest,
      reservation_before_digest: beforeDigest,
      reservation_after_digest: afterDigest,
      files: files.map(({ bytes: _bytes, ...file }) => file),
    };
    create(target(root, JOURNAL), `${canonicalJson(seal(payload))}\n`);
    deps.beforeCommit?.();
    if (
      deps.currentHead(root) !== head ||
      deps.originMainHead(root) !== main ||
      sha256Digest(readFileSync(authorityPath, "utf8")) !== beforeDigest ||
      createPaths.some((path) => existsSync(resolve(root, path)))
    ) {
      recover(root);
      return blocked(["commit_authority_drift"], reservation);
    }
    payload.state = "committed";
    replace(existing(root, JOURNAL), `${canonicalJson(seal(payload))}\n`);
    recover(root);
    const persistedAuthorityPath = existing(root, input.reservationAuthorityPath),
      persistedReceiptPath = existing(root, receiptPath),
      persisted = readFileSync(persistedAuthorityPath, "utf8"),
      persistedReceipt = readFileSync(persistedReceiptPath, "utf8"),
      projection = projectOpenBranchPlanReservations(JSON.parse(persisted));
    if (
      sha256Digest(persisted) !== afterDigest ||
      sha256Digest(persistedReceipt) !== receiptDigest ||
      canonicalJson(JSON.parse(persistedReceipt)) !== canonicalJson(receipt) ||
      projection.projection_digest !== reservation.reservation_projection?.projection_digest
    )
      return blocked(["reservation_authority_reread_failed"], reservation);
    return success("committed", [
      forwardPath,
      reversePath,
      receiptPath,
      input.reservationAuthorityPath,
    ]);
  } catch (error) {
    const finding = error instanceof Error ? error.message : "authoring_transaction_failed";
    return existsSync(resolve(root, JOURNAL))
      ? recoveryRequired(finding, reservation)
      : blocked([finding], reservation);
  } finally {
    deps.releaseLock(lock);
  }
}

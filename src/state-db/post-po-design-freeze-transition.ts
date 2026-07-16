import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync, realpathSync } from "node:fs";
import { resolve, sep } from "node:path";
import { z } from "zod";
import type { HarnessDb } from "./index";

const PATHS = {
  critical: "docs/governance/generated/design-freeze-critical-path-v1.json",
  review: "docs/governance/generated/design-freeze-critical-path-independent-review-v1.json",
  audit:
    "docs/governance/generated/design-freeze-critical-path-source-rebound-independent-audit-v1.json",
  activationAudit: "docs/governance/generated/po7-activation-runtime-independent-audit-v1.json",
} as const;
const ZERO = createHash("sha256").update("genesis").digest("hex");
const stable = (value: unknown): string =>
  JSON.stringify(value, (_key, item) =>
    item && typeof item === "object" && !Array.isArray(item)
      ? Object.fromEntries(Object.entries(item).sort(([a], [b]) => a.localeCompare(b)))
      : item,
  );
const digest = (value: unknown): string =>
  createHash("sha256")
    .update(typeof value === "string" ? value : stable(value))
    .digest("hex");
const fileDigest = (path: string): string =>
  createHash("sha256").update(readFileSync(path)).digest("hex");
const schema = z
  .object({
    repoRoot: z.string().min(1),
    operationId: z.string().min(1),
    idempotencyKey: z.string().min(1),
    expectedAuthorityEpoch: z.number().int().positive(),
    expectedPo7EventDigest: z.string().regex(/^[0-9a-f]{64}$/),
    faultAfterWrite: z.number().int().positive().optional(),
  })
  .strict();
export type PostPoDesignFreezeTransitionInput = z.infer<typeof schema>;
export interface PostPoDesignFreezeTransitionReceipt {
  operationId: string;
  payloadDigest: string;
  freezeReceiptDigest: string;
  candidateDigest: string;
  writeSetDigest: string;
  replay: boolean;
}

function safePath(root: string, relative: string): string {
  const candidate = resolve(root, relative);
  const real = realpathSync(candidate);
  if (!(real === root || real.startsWith(`${root}${sep}`)))
    throw new Error("Design Freeze source path escape");
  return real;
}
function git(root: string, args: string[]): string {
  return execFileSync("git", ["-C", root, ...args], { encoding: "utf8" }).trim();
}
function observe(root: string, allowUnpushedHeadForTest = false) {
  const files = Object.fromEntries(
    Object.entries(PATHS).map(([name, path]) => [name, { path, absolute: safePath(root, path) }]),
  );
  const critical = JSON.parse(readFileSync(files.critical.absolute, "utf8"));
  const review = JSON.parse(readFileSync(files.review.absolute, "utf8"));
  const audit = JSON.parse(readFileSync(files.audit.absolute, "utf8"));
  const activationAudit = JSON.parse(readFileSync(files.activationAudit.absolute, "utf8"));
  if (
    critical.status !== "design_freeze_authority_activated_runtime_separated" ||
    critical.summary?.design_freeze_rows !== 8 ||
    critical.summary?.design_freeze_open_rows !== 0 ||
    critical.summary?.runtime_acceptance_rows_separated !== 5 ||
    critical.summary?.po_authority_activated_units !== 7
  )
    throw new Error("Design Freeze critical path not closed");
  if (
    !String(review.status).startsWith("independent_review_pass_") ||
    review.findings?.length !== 0 ||
    audit.status !== "independent_audit_pass_design_freeze_closed_runtime_separated" ||
    audit.findings?.length !== 0 ||
    activationAudit.status !== "independent_audit_pass_authority_activated" ||
    activationAudit.findings?.length !== 0
  )
    throw new Error("Design Freeze independent evidence not current");
  const sourceDigests = Object.fromEntries(
    Object.entries(files).map(([name, value]) => [name, fileDigest(value.absolute)]),
  );
  const headOid = git(root, ["rev-parse", "HEAD"]);
  const treeOid = git(root, ["rev-parse", "HEAD^{tree}"]);
  const remoteContainingRefs = git(root, ["branch", "-r", "--contains", headOid])
    .split("\n")
    .map((value) => value.trim())
    .filter(Boolean)
    .sort();
  if (remoteContainingRefs.length === 0 && !allowUnpushedHeadForTest)
    throw new Error("Design Freeze HEAD is not observed on a remote-tracking ref");
  const repositorySnapshotDigest = digest({ headOid, treeOid, remoteContainingRefs });
  const indexPolicyDigest = digest({
    version: "tracked-head-tree-only-v1",
    excludes: ["working-tree", "untracked", "ignored"],
  });
  const denominatorIds = critical.design_freeze_critical_path
    .map((row: { blocker_id: string }) => row.blocker_id)
    .sort();
  const denominatorDigest = digest(denominatorIds);
  const reviewerIdentityDigest = digest({
    schema: review.schema_version,
    generated_at: review.generated_at,
    status: review.status,
  });
  return {
    critical,
    sourceDigests,
    headOid,
    treeOid,
    remoteContainingRefs,
    repositorySnapshotDigest,
    indexPolicyDigest,
    denominatorIds,
    denominatorDigest,
    reviewerIdentityDigest,
  };
}
function po7(db: HarnessDb, epoch: number, eventDigest: string) {
  const latest = db
    .prepare(
      "SELECT authority_epoch,event_digest,status,freeze_blocker_status FROM po7_activation_projections ORDER BY authority_epoch DESC LIMIT 1",
    )
    .get();
  if (
    !latest ||
    Number(latest.authority_epoch) !== epoch ||
    String(latest.event_digest) !== eventDigest ||
    latest.status !== "active" ||
    latest.freeze_blocker_status !== "closed"
  )
    throw new Error("sealed PO7 latest head is not active");
  const projection = db
    .prepare(
      "SELECT * FROM po7_activation_projections WHERE authority_epoch=? AND event_digest=? AND status='active'",
    )
    .get(epoch, eventDigest);
  if (
    !projection ||
    Number(projection.group_count) !== 6 ||
    Number(projection.question_count) !== 22 ||
    projection.freeze_blocker_status !== "closed"
  )
    throw new Error("sealed PO7 projection missing");
  const operationId = String(projection.operation_id);
  const terminal = db
    .prepare(
      "SELECT * FROM po7_activation_terminal_receipts WHERE operation_id=? AND status='active'",
    )
    .get(operationId);
  const vmodel = db
    .prepare("SELECT * FROM po7_vmodel_authority_events WHERE operation_id=? AND status='active'")
    .get(operationId);
  const groups = db
    .prepare(
      "SELECT * FROM po7_group_option_receipts WHERE operation_id=? AND status='active' ORDER BY decision_group_id",
    )
    .all(operationId);
  const questions = db
    .prepare(
      "SELECT * FROM po7_question_answer_receipts WHERE operation_id=? AND status='active' ORDER BY question_id",
    )
    .all(operationId);
  if (!terminal || !vmodel || groups.length !== 6 || questions.length !== 22)
    throw new Error("sealed PO7 receipt denominator drift");
  const expectedGroupIds = Array.from(
    { length: 6 },
    (_value, index) => `UWR-PO-DG-${String(index + 1).padStart(2, "0")}`,
  );
  if (
    groups.map((row) => String(row.decision_group_id)).join("|") !== expectedGroupIds.join("|") ||
    new Set(questions.map((row) => String(row.question_id))).size !== 22 ||
    new Set(questions.map((row) => String(row.queue_id))).size !== 22
  )
    throw new Error("sealed PO7 canonical ID set drift");
  if (
    groups.some((row) => Number(row.authority_epoch) !== epoch || row.selected_option_id !== "A") ||
    questions.some(
      (row) => Number(row.authority_epoch) !== epoch || row.selected_option_id !== "A",
    ) ||
    Number(vmodel.authority_epoch) !== epoch ||
    String(vmodel.event_digest) !== eventDigest
  )
    throw new Error("sealed PO7 receipt epoch or selection drift");
  const authorityReceiptSetDigest = digest(
    [...groups.map((row) => digest(row)), digest(vmodel)].sort(),
  );
  return {
    operationId,
    terminal,
    vmodel,
    groups,
    questions,
    authorityReceiptSetDigest,
    terminalRowDigest: digest(terminal),
  };
}

export function commitPostPoDesignFreezeTransition(
  db: HarnessDb,
  raw: PostPoDesignFreezeTransitionInput,
  deps: { allowUnpushedHeadForTest?: boolean } = {},
): PostPoDesignFreezeTransitionReceipt {
  const input = schema.parse(raw);
  const root = realpathSync(input.repoRoot);
  const requestDigest = digest({
    operationId: input.operationId,
    idempotencyKey: input.idempotencyKey,
    expectedAuthorityEpoch: input.expectedAuthorityEpoch,
    expectedPo7EventDigest: input.expectedPo7EventDigest,
  });
  db.exec("BEGIN IMMEDIATE");
  try {
    const replay = db
      .prepare(
        "SELECT operation_id,request_digest FROM design_freeze_transition_operations WHERE idempotency_key=?",
      )
      .get(input.idempotencyKey);
    if (replay) {
      if (replay.request_digest !== requestDigest)
        throw new Error("Design Freeze idempotency conflict");
      const terminal = db
        .prepare("SELECT * FROM design_freeze_transition_terminal_receipts WHERE operation_id=?")
        .get(String(replay.operation_id));
      if (!terminal) throw new Error("Design Freeze reconcile required");
      db.exec("COMMIT");
      return {
        operationId: String(replay.operation_id),
        payloadDigest: String(terminal.payload_digest),
        freezeReceiptDigest: String(terminal.freeze_receipt_digest),
        candidateDigest: String(terminal.candidate_digest),
        writeSetDigest: String(terminal.write_set_digest),
        replay: true,
      };
    }
    const authority = po7(db, input.expectedAuthorityEpoch, input.expectedPo7EventDigest);
    const snapshot = observe(root, deps.allowUnpushedHeadForTest);
    const issuedAt = new Date().toISOString();
    const payloadDigest = digest({
      requestDigest,
      authorityReceiptSetDigest: authority.authorityReceiptSetDigest,
      sourceDigests: snapshot.sourceDigests,
      repositorySnapshotDigest: snapshot.repositorySnapshotDigest,
      indexPolicyDigest: snapshot.indexPolicyDigest,
      denominatorDigest: snapshot.denominatorDigest,
    });
    if (db.prepare("SELECT 1 FROM design_freeze_receipts WHERE status='current'").get())
      throw new Error("Design Freeze current receipt already exists");
    const authorityLinkDigest = digest({
      payloadDigest,
      po7OperationId: authority.operationId,
      po7EventDigest: input.expectedPo7EventDigest,
      terminalRowDigest: authority.terminalRowDigest,
      authorityReceiptSetDigest: authority.authorityReceiptSetDigest,
      epoch: input.expectedAuthorityEpoch,
    });
    const criticalSetDigest = digest(snapshot.sourceDigests);
    const freezeReceiptDigest = digest({
      payloadDigest,
      authorityLinkDigest,
      authorityReceiptSetDigest: authority.authorityReceiptSetDigest,
      criticalSetDigest,
      reviewerIdentityDigest: snapshot.reviewerIdentityDigest,
      headOid: snapshot.headOid,
      treeOid: snapshot.treeOid,
      repositorySnapshotDigest: snapshot.repositorySnapshotDigest,
      indexPolicyDigest: snapshot.indexPolicyDigest,
      denominatorCount: 8,
      denominatorDigest: snapshot.denominatorDigest,
      previousReceiptDigest: ZERO,
      status: "current",
    });
    const freezeProjectionDigest = digest({
      authorityLinkDigest,
      freezeReceiptDigest,
      designRows: 8,
      designOpenRows: 0,
      runtimeRowsSeparated: 5,
      status: "current",
    });
    const progressProjectionDigest = digest({
      freezeReceiptDigest,
      designRows: 8,
      designOpenRows: 0,
      runtimeRows: 5,
      implementationCredit: 0,
      verificationCredit: 0,
      coverageCredit: 0,
    });
    const candidateDigest = digest({
      layer: "L01",
      freezeReceiptDigest,
      headOid: snapshot.headOid,
      treeOid: snapshot.treeOid,
      authorityEpoch: input.expectedAuthorityEpoch,
      localState: "proposed",
      pairState: "pending_pair",
      freezeState: "not_frozen",
      counted: 0,
      remoteCreationState: "not_created",
    });
    const handoffDigest = digest({
      candidateDigest,
      freezeReceiptDigest,
      headOid: snapshot.headOid,
      treeOid: snapshot.treeOid,
      denominatorDigest: snapshot.denominatorDigest,
      authorityEpoch: input.expectedAuthorityEpoch,
      remoteAuthority: "not_granted",
    });
    const operationRow = [
      input.operationId,
      input.idempotencyKey,
      requestDigest,
      payloadDigest,
      input.expectedAuthorityEpoch,
      authorityLinkDigest,
      snapshot.sourceDigests.critical,
      snapshot.sourceDigests.review,
      snapshot.sourceDigests.audit,
      snapshot.sourceDigests.activationAudit,
      snapshot.headOid,
      snapshot.treeOid,
      snapshot.repositorySnapshotDigest,
      snapshot.indexPolicyDigest,
      snapshot.denominatorDigest,
      "current",
      issuedAt,
    ];
    const authorityRow = [
      `${input.operationId}:authority-link`,
      input.operationId,
      authorityLinkDigest,
      authority.operationId,
      input.expectedPo7EventDigest,
      authority.terminalRowDigest,
      authority.authorityReceiptSetDigest,
      input.expectedAuthorityEpoch,
      ZERO,
      "current",
      issuedAt,
    ];
    const freezeRow = [
      `${input.operationId}:freeze`,
      input.operationId,
      freezeReceiptDigest,
      payloadDigest,
      authority.authorityReceiptSetDigest,
      criticalSetDigest,
      snapshot.reviewerIdentityDigest,
      snapshot.headOid,
      snapshot.treeOid,
      snapshot.repositorySnapshotDigest,
      snapshot.indexPolicyDigest,
      8,
      snapshot.denominatorDigest,
      ZERO,
      "current",
      issuedAt,
    ];
    const freezeProjectionRow = [
      `${input.operationId}:freeze-projection`,
      input.operationId,
      authorityLinkDigest,
      freezeReceiptDigest,
      8,
      0,
      5,
      freezeProjectionDigest,
      "current",
      issuedAt,
    ];
    const progressRow = [
      `${input.operationId}:progress`,
      input.operationId,
      freezeReceiptDigest,
      8,
      0,
      5,
      0,
      0,
      0,
      progressProjectionDigest,
      "current",
      issuedAt,
    ];
    const candidateRow = [
      `${input.operationId}:L01`,
      input.operationId,
      candidateDigest,
      freezeReceiptDigest,
      snapshot.headOid,
      snapshot.treeOid,
      input.expectedAuthorityEpoch,
      "proposed",
      "pending_pair",
      "not_frozen",
      0,
      "not_created",
      "current",
      issuedAt,
    ];
    const handoffRow = [
      `${input.operationId}:L01-handoff`,
      input.operationId,
      handoffDigest,
      candidateDigest,
      freezeReceiptDigest,
      snapshot.headOid,
      snapshot.treeOid,
      snapshot.denominatorDigest,
      input.expectedAuthorityEpoch,
      "not_granted",
      "current",
      issuedAt,
    ];
    const outboxRow = [
      `${input.operationId}:outbox`,
      input.operationId,
      payloadDigest,
      candidateDigest,
      "local_reconcile_only",
      "pending",
      issuedAt,
    ];
    const writes = [
      ["design_freeze_transition_operations", operationRow],
      ["design_freeze_authority_link_events", authorityRow],
      ["design_freeze_receipts", freezeRow],
      ["design_freeze_projections", freezeProjectionRow],
      ["design_freeze_progress_projections", progressRow],
      ["design_freeze_l01_candidates", candidateRow],
      ["design_freeze_l01_handoffs", handoffRow],
      ["design_freeze_transition_outbox", outboxRow],
    ] as const;
    const writeSetDigest = digest(writes.map(([table, row]) => ({ table, row })));
    const terminalRow = [
      `${input.operationId}:terminal`,
      input.operationId,
      payloadDigest,
      authorityLinkDigest,
      freezeReceiptDigest,
      freezeProjectionDigest,
      progressProjectionDigest,
      candidateDigest,
      handoffDigest,
      writeSetDigest,
      "current",
      issuedAt,
    ];
    let count = 0;
    const insert = (table: string, row: readonly unknown[]) => {
      db.prepare(`INSERT INTO ${table} VALUES (${row.map(() => "?").join(",")})`).run(...row);
      count += 1;
      if (input.faultAfterWrite === count) throw new Error(`Design Freeze injected fault ${count}`);
    };
    for (const [table, row] of writes) insert(table, row);
    insert("design_freeze_transition_terminal_receipts", terminalRow);
    const after = observe(root, deps.allowUnpushedHeadForTest);
    if (digest(after) !== digest(snapshot))
      throw new Error("Design Freeze source changed during transaction");
    db.exec("COMMIT");
    return {
      operationId: input.operationId,
      payloadDigest,
      freezeReceiptDigest,
      candidateDigest,
      writeSetDigest,
      replay: false,
    };
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

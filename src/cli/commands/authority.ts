import { createHash, randomUUID } from "node:crypto";
import {
  closeSync,
  constants,
  fstatSync,
  fsyncSync,
  linkSync,
  lstatSync,
  mkdirSync,
  openSync,
  readFileSync,
  realpathSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { basename, dirname, isAbsolute, join, relative, resolve } from "node:path";
import type { Command } from "commander";
import { defaultHarnessDbPath, openHarnessDb } from "../../state-db/index";
import { migrate } from "../../state-db/migration";
import { activatePo7Decision } from "../../state-db/po7-decision-activation";
import { commitPostPoDesignFreezeTransition } from "../../state-db/post-po-design-freeze-transition";
import { commitPostPoDesignFreezeTransitionV2 } from "../../state-db/post-po-design-freeze-transition-v2";

type DbRow = Record<string, unknown>;

const AUTHORITY_EVIDENCE_ROOT = [".helix", "evidence", "authority"] as const;

export interface AuthorityEvidenceTarget {
  absolutePath: string;
  relativePath: string;
  repoRoot: string;
}

export interface AuthorityEvidenceWriteReceipt {
  digest: string;
  path: string;
  replayed: boolean;
}

export interface AuthorityEvidenceWriteHooks {
  writeTemp?: (fd: number, content: string) => void;
  beforePublish?: (tempPath: string) => void;
  afterBindingCheckBeforePublish?: (tempPath: string) => void;
  afterPublish?: () => void;
}

interface DirectoryIdentity {
  path: string;
  dev: number;
  ino: number;
}

function state(path: string): ReturnType<typeof lstatSync> | null {
  try {
    return lstatSync(path);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}

function readTrustedEvidence(path: string): string {
  const fd = openSync(path, constants.O_RDONLY | constants.O_NOFOLLOW);
  try {
    const opened = fstatSync(fd);
    const content = readFileSync(fd, "utf8");
    const after = lstatSync(path);
    if (
      !opened.isFile() ||
      after.isSymbolicLink() ||
      !after.isFile() ||
      opened.dev !== after.dev ||
      opened.ino !== after.ino
    )
      throw new Error("authority_evidence_post_read_identity_mismatch");
    return content;
  } finally {
    closeSync(fd);
  }
}

function pathSegments(path: string): string[] {
  return path.split("/").filter(Boolean);
}

function bindAuthorityDirectoryChain(target: AuthorityEvidenceTarget): DirectoryIdentity[] {
  const root = resolve(target.repoRoot);
  const parent = dirname(resolve(target.absolutePath));
  const inside = relative(root, parent);
  if (inside === ".." || inside.startsWith("../"))
    throw new Error("authority_evidence_target_untrusted");
  const paths = [root];
  let current = root;
  for (const segment of pathSegments(inside)) {
    current = join(current, segment);
    paths.push(current);
  }
  return paths.map((path) => {
    const entry = lstatSync(path);
    if (!entry.isDirectory() || entry.isSymbolicLink())
      throw new Error("authority_evidence_ancestor_identity_mismatch");
    const real = realpathSync(path);
    const realRoot = realpathSync(root);
    if (real !== realRoot && !real.startsWith(`${realRoot}/`))
      throw new Error("authority_evidence_ancestor_escape");
    return { path, dev: entry.dev, ino: entry.ino };
  });
}

function assertAuthorityDirectoryBinding(binding: readonly DirectoryIdentity[]): void {
  for (const expected of binding) {
    const current = lstatSync(expected.path);
    if (
      !current.isDirectory() ||
      current.isSymbolicLink() ||
      current.dev !== expected.dev ||
      current.ino !== expected.ino
    )
      throw new Error("authority_evidence_ancestor_identity_mismatch");
  }
}

function openBoundAuthorityParent(binding: readonly DirectoryIdentity[]): number {
  if (process.platform !== "linux" || binding.length === 0)
    throw new Error("authority_evidence_capability_unsupported");
  let fd = openSync(
    binding[0].path,
    constants.O_RDONLY | constants.O_DIRECTORY | constants.O_NOFOLLOW,
  );
  try {
    for (let index = 0; index < binding.length; index += 1) {
      const expected = binding[index];
      if (index > 0) {
        const next = openSync(
          `/proc/self/fd/${fd}/${basename(expected.path)}`,
          constants.O_RDONLY | constants.O_DIRECTORY | constants.O_NOFOLLOW,
        );
        closeSync(fd);
        fd = next;
      }
      const actual = fstatSync(fd);
      if (actual.dev !== expected.dev || actual.ino !== expected.ino)
        throw new Error("authority_evidence_ancestor_identity_mismatch");
    }
    return fd;
  } catch (error) {
    closeSync(fd);
    throw error;
  }
}

function assertTrustedDirectoryChain(base: string, segments: readonly string[]): void {
  let current = resolve(base);
  for (const segment of segments) {
    current = join(current, segment);
    const entry = state(current);
    if (!entry) return;
    if (!entry.isDirectory() || entry.isSymbolicLink())
      throw new Error("authority_evidence_root_untrusted");
  }
}

function ensureTrustedDirectoryChain(base: string, segments: readonly string[]): string {
  let current = resolve(base);
  if (process.platform !== "linux") {
    for (const segment of segments) {
      current = join(current, segment);
      const entry = state(current);
      if (!entry?.isDirectory() || entry.isSymbolicLink())
        throw new Error("authority_evidence_capability_unsupported");
    }
    return current;
  }
  let directoryFd = openSync(
    current,
    constants.O_RDONLY | constants.O_DIRECTORY | constants.O_NOFOLLOW,
  );
  try {
    for (const segment of segments) {
      current = join(current, segment);
      const capabilityPath = `/proc/self/fd/${directoryFd}/${segment}`;
      if (!state(capabilityPath)) {
        mkdirSync(capabilityPath);
        fsyncSync(directoryFd);
      }
      const nextFd = openSync(
        capabilityPath,
        constants.O_RDONLY | constants.O_DIRECTORY | constants.O_NOFOLLOW,
      );
      closeSync(directoryFd);
      directoryFd = nextFd;
      if (!fstatSync(directoryFd).isDirectory())
        throw new Error("authority_evidence_root_untrusted");
    }
  } finally {
    closeSync(directoryFd);
  }
  return current;
}

function resolveAuthorityEvidencePath(
  repoRoot: string,
  requestedPath: string,
): AuthorityEvidenceTarget {
  if (
    !requestedPath ||
    isAbsolute(requestedPath) ||
    requestedPath.includes("\\") ||
    requestedPath.includes("\0") ||
    requestedPath.startsWith(".helix/") ||
    requestedPath.split("/").some((part) => !part || part === "." || part === "..")
  )
    throw new Error("authority_evidence_path_invalid");
  const root = resolve(repoRoot, ...AUTHORITY_EVIDENCE_ROOT);
  const absolutePath = resolve(root, requestedPath);
  const inside = relative(root, absolutePath);
  if (!inside || inside === ".." || inside.startsWith("../"))
    throw new Error("authority_evidence_path_invalid");
  assertTrustedDirectoryChain(repoRoot, AUTHORITY_EVIDENCE_ROOT);
  assertTrustedDirectoryChain(root, pathSegments(relative(root, dirname(absolutePath))));
  const target = state(absolutePath);
  if (target?.isSymbolicLink()) throw new Error("authority_evidence_root_untrusted");
  return {
    absolutePath,
    relativePath: relative(resolve(repoRoot), absolutePath).split("\\").join("/"),
    repoRoot: resolve(repoRoot),
  };
}

export function planAuthorityEvidencePaths(
  repoRoot: string,
  input: { receiptOut: string; fullRowExportOut?: string },
): { receipt: AuthorityEvidenceTarget; fullRowExport?: AuthorityEvidenceTarget } {
  const receipt = resolveAuthorityEvidencePath(repoRoot, input.receiptOut);
  const fullRowExport = input.fullRowExportOut
    ? resolveAuthorityEvidencePath(repoRoot, input.fullRowExportOut)
    : undefined;
  if (fullRowExport?.absolutePath === receipt.absolutePath)
    throw new Error("authority_evidence_paths_conflict");
  return { receipt, fullRowExport };
}

export function writeAuthorityEvidence(
  target: AuthorityEvidenceTarget,
  content: string,
  hooks: AuthorityEvidenceWriteHooks = {},
): AuthorityEvidenceWriteReceipt {
  const expectedRoot = resolve(target.repoRoot, ...AUTHORITY_EVIDENCE_ROOT);
  const inside = relative(expectedRoot, resolve(target.absolutePath));
  const expectedRelative = relative(resolve(target.repoRoot), resolve(target.absolutePath))
    .split("\\")
    .join("/");
  if (
    !inside ||
    inside === ".." ||
    inside.startsWith("../") ||
    expectedRelative !== target.relativePath
  )
    throw new Error("authority_evidence_target_untrusted");
  const digest = createHash("sha256").update(content).digest("hex");
  const root = ensureTrustedDirectoryChain(target.repoRoot, AUTHORITY_EVIDENCE_ROOT);
  ensureTrustedDirectoryChain(root, pathSegments(relative(root, dirname(target.absolutePath))));
  const binding = bindAuthorityDirectoryChain(target);
  const existing = state(target.absolutePath);
  if (existing) {
    if (!existing.isFile() || existing.isSymbolicLink())
      throw new Error("authority_evidence_root_untrusted");
    if (readTrustedEvidence(target.absolutePath) !== content)
      throw new Error("authority_evidence_conflict");
    return { digest, path: target.relativePath, replayed: true };
  }
  if (process.platform !== "linux") throw new Error("authority_evidence_capability_unsupported");
  const parentFd = openBoundAuthorityParent(binding);
  const tempLeaf = `.${basename(target.absolutePath)}.tmp-${randomUUID()}`;
  const tempPath = `/proc/self/fd/${parentFd}/${tempLeaf}`;
  const publishPath = `/proc/self/fd/${parentFd}/${basename(target.absolutePath)}`;
  let fd: number | undefined;
  let published = false;
  try {
    fd = openSync(
      tempPath,
      constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL | constants.O_NOFOLLOW,
      0o600,
    );
    if (hooks.writeTemp) hooks.writeTemp(fd, content);
    else writeFileSync(fd, content, { encoding: "utf8" });
    fsyncSync(fd);
    closeSync(fd);
    fd = undefined;
    if (createHash("sha256").update(readTrustedEvidence(tempPath)).digest("hex") !== digest)
      throw new Error("authority_evidence_temp_digest_mismatch");
    hooks.beforePublish?.(tempPath);
    assertAuthorityDirectoryBinding(binding);
    hooks.afterBindingCheckBeforePublish?.(tempPath);
    linkSync(tempPath, publishPath);
    published = true;
    hooks.afterPublish?.();
    assertAuthorityDirectoryBinding(binding);
    if (createHash("sha256").update(readTrustedEvidence(publishPath)).digest("hex") !== digest)
      throw new Error("authority_evidence_post_write_identity_mismatch");
    fsyncSync(parentFd);
    unlinkSync(tempPath);
  } catch (error) {
    if (fd !== undefined) closeSync(fd);
    try {
      if (state(tempPath)) unlinkSync(tempPath);
    } catch {
      // The directory fd remains inode-bound; cleanup failure leaves a non-canonical temp.
    }
    if ((error as NodeJS.ErrnoException).code !== "EEXIST") {
      closeSync(parentFd);
      throw error;
    }
    if (readTrustedEvidence(publishPath) !== content) {
      closeSync(parentFd);
      throw new Error("authority_evidence_conflict");
    }
    closeSync(parentFd);
    return { digest, path: target.relativePath, replayed: true };
  }
  closeSync(parentFd);
  if (!published) throw new Error("authority_evidence_publish_incomplete");
  return { digest, path: target.relativePath, replayed: false };
}

interface EvidenceOutboxRow extends DbRow {
  operation_id: string;
  payload_digest: string;
  full_export_path: string;
  full_export_json: string;
  full_export_digest: string;
  command_receipt_path: string;
  command_receipt_json: string;
  command_receipt_digest: string;
}

export function preflightAuthorityEvidence(
  db: ReturnType<typeof openHarnessDb>,
  idempotencyKey: string,
  plan: { receipt: AuthorityEvidenceTarget; fullRowExport: AuthorityEvidenceTarget },
): void {
  const operation = db
    .prepare(
      "SELECT operation_id FROM design_freeze_v2_transition_operations WHERE idempotency_key=?",
    )
    .get(idempotencyKey);
  const outbox = operation
    ? (db
        .prepare("SELECT * FROM design_freeze_v2_evidence_outbox WHERE operation_id=?")
        .get(String(operation.operation_id)) as EvidenceOutboxRow | undefined)
    : undefined;
  for (const [target, expected] of [
    [plan.fullRowExport, outbox?.full_export_json],
    [plan.receipt, outbox?.command_receipt_json],
  ] as const) {
    const existing = state(target.absolutePath);
    if (!existing) continue;
    if (!existing.isFile() || existing.isSymbolicLink())
      throw new Error("authority_evidence_root_untrusted");
    if (expected === undefined || readTrustedEvidence(target.absolutePath) !== expected)
      throw new Error("authority_evidence_conflict_precommit");
  }
}

export function materializeAuthorityEvidence(
  db: ReturnType<typeof openHarnessDb>,
  operationId: string,
  plan: { receipt: AuthorityEvidenceTarget; fullRowExport: AuthorityEvidenceTarget },
  writer: typeof writeAuthorityEvidence = writeAuthorityEvidence,
): { replayed: boolean; receipt: string } {
  const outbox = db
    .prepare("SELECT * FROM design_freeze_v2_evidence_outbox WHERE operation_id=?")
    .get(operationId) as EvidenceOutboxRow | undefined;
  if (!outbox) throw new Error("authority_evidence_outbox_missing");
  if (
    outbox.full_export_path !== plan.fullRowExport.relativePath ||
    outbox.command_receipt_path !== plan.receipt.relativePath
  )
    throw new Error("authority_evidence_operation_path_conflict");
  for (const [target, content] of [
    [plan.fullRowExport, outbox.full_export_json],
    [plan.receipt, outbox.command_receipt_json],
  ] as const) {
    const existing = state(target.absolutePath);
    if (existing && (!existing.isFile() || existing.isSymbolicLink()))
      throw new Error("authority_evidence_root_untrusted");
    if (existing && readTrustedEvidence(target.absolutePath) !== content)
      throw new Error("authority_evidence_conflict");
  }
  const terminal = db
    .prepare("SELECT * FROM design_freeze_v2_evidence_terminal_receipts WHERE operation_id=?")
    .get(operationId);
  if (terminal) {
    // A terminal receipt is not permission to claim missing filesystem evidence.
    // Repair only from the operation-bound immutable outbox bytes.
    writer(plan.fullRowExport, outbox.full_export_json);
    writer(plan.receipt, outbox.command_receipt_json);
    return { replayed: true, receipt: outbox.command_receipt_json };
  }
  writer(plan.fullRowExport, outbox.full_export_json);
  writer(plan.receipt, outbox.command_receipt_json);
  const materializationDigest = createHash("sha256")
    .update(
      JSON.stringify({
        operation_id: operationId,
        payload_digest: outbox.payload_digest,
        full_export_digest: outbox.full_export_digest,
        command_receipt_digest: outbox.command_receipt_digest,
      }),
    )
    .digest("hex");
  db.exec("BEGIN IMMEDIATE");
  try {
    db.prepare(
      "INSERT INTO design_freeze_v2_evidence_terminal_receipts VALUES (?,?,?,?,?,?,?,?)",
    ).run(
      `${operationId}:evidence-terminal`,
      operationId,
      outbox.payload_digest,
      outbox.full_export_digest,
      outbox.command_receipt_digest,
      materializationDigest,
      "materialized",
      new Date().toISOString(),
    );
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
  return { replayed: false, receipt: outbox.command_receipt_json };
}

export function registerAuthorityCommands(program: Command): void {
  const authority = program.command("authority").description("authority receipt operations");
  authority
    .command("po7-activate")
    .description("activate Universal A×6 and VMAUTH approval from current repo-owned GO custody")
    .requiredOption("--operation-id <id>")
    .requiredOption("--idempotency-key <key>")
    .option("--expected-epoch <number>", "expected current authority epoch", "0")
    .option("--expected-previous-event <sha256>")
    .option("--execute", "write the single-transaction activation to .helix/harness.db")
    .option(
      "--receipt-out <path>",
      "write under .helix/evidence/authority using a root-relative path (requires --execute)",
    )
    .option("--json", "print JSON")
    .action(
      (opts: {
        operationId: string;
        idempotencyKey: string;
        expectedEpoch: string;
        expectedPreviousEvent?: string;
        execute?: boolean;
        receiptOut?: string;
        json?: boolean;
      }) => {
        const repoRoot = process.cwd();
        const evidenceTarget = opts.receiptOut
          ? planAuthorityEvidencePaths(repoRoot, { receiptOut: opts.receiptOut }).receipt
          : null;
        const epoch = Number(opts.expectedEpoch);
        if (!Number.isInteger(epoch) || epoch < 0)
          throw new Error("--expected-epoch must be a non-negative integer");
        if (opts.receiptOut && !opts.execute) throw new Error("--receipt-out requires --execute");
        const db = openHarnessDb(opts.execute ? defaultHarnessDbPath(repoRoot) : ":memory:", {
          repoRoot,
        });
        try {
          migrate(db);
          const receipt = activatePo7Decision(db, {
            repoRoot,
            operationId: opts.operationId,
            idempotencyKey: opts.idempotencyKey,
            expectedActivationEpoch: epoch,
            expectedPreviousEventDigest: opts.expectedPreviousEvent ?? null,
          });
          const operationId = receipt.operationId;
          const evidence = {
            operation: db
              .prepare("SELECT * FROM po7_activation_operations WHERE operation_id=?")
              .get(operationId),
            group_receipts: db
              .prepare(
                "SELECT * FROM po7_group_option_receipts WHERE operation_id=? ORDER BY decision_group_id",
              )
              .all(operationId),
            question_receipts: db
              .prepare(
                "SELECT * FROM po7_question_answer_receipts WHERE operation_id=? ORDER BY question_id",
              )
              .all(operationId),
            vmodel_event: db
              .prepare("SELECT * FROM po7_vmodel_authority_events WHERE operation_id=?")
              .get(operationId),
            projection: db
              .prepare("SELECT * FROM po7_activation_projections WHERE operation_id=?")
              .get(operationId),
            terminal: db
              .prepare("SELECT * FROM po7_activation_terminal_receipts WHERE operation_id=?")
              .get(operationId),
          };
          const output = {
            schema_version: "helix.po7-activation-command-receipt.v1",
            executed: opts.execute === true,
            db_path: opts.execute ? ".helix/harness.db" : ":memory:",
            ...receipt,
            evidence,
          };
          const rendered = `${JSON.stringify(output, null, 2)}\n`;
          if (evidenceTarget) writeAuthorityEvidence(evidenceTarget, rendered);
          process.stdout.write(
            opts.json
              ? rendered
              : `PO7 activation ${opts.execute ? "executed" : "dry-run"}: epoch=${receipt.authorityEpoch} event=${receipt.eventDigest}\n`,
          );
        } finally {
          db.close();
        }
      },
    );

  authority
    .command("design-freeze-transition")
    .description("commit the sealed PO7 to Design Freeze and local L01 pending-pair transition")
    .requiredOption("--operation-id <id>")
    .requiredOption("--idempotency-key <key>")
    .requiredOption("--expected-po7-event <sha256>")
    .option("--expected-epoch <number>", "expected PO7 authority epoch", "1")
    .option("--execute", "write the nine-boundary transaction to .helix/harness.db")
    .option("--receipt-out <path>", "root-relative path under .helix/evidence/authority")
    .option("--json")
    .action(
      (opts: {
        operationId: string;
        idempotencyKey: string;
        expectedPo7Event: string;
        expectedEpoch: string;
        execute?: boolean;
        receiptOut?: string;
        json?: boolean;
      }) => {
        const repoRoot = process.cwd();
        const evidenceTarget = opts.receiptOut
          ? planAuthorityEvidencePaths(repoRoot, { receiptOut: opts.receiptOut }).receipt
          : null;
        const epoch = Number(opts.expectedEpoch);
        if (!Number.isInteger(epoch) || epoch <= 0)
          throw new Error("--expected-epoch must be a positive integer");
        if (opts.receiptOut && !opts.execute) throw new Error("--receipt-out requires --execute");
        const db = openHarnessDb(opts.execute ? defaultHarnessDbPath(repoRoot) : ":memory:", {
          repoRoot,
        });
        try {
          migrate(db);
          if (!opts.execute)
            activatePo7Decision(db, {
              repoRoot,
              operationId: "DRYRUN-PO7-SEED",
              idempotencyKey: "DRYRUN-PO7-SEED",
              expectedActivationEpoch: 0,
              expectedPreviousEventDigest: null,
            });
          const po7Event = opts.execute
            ? opts.expectedPo7Event
            : String(
                db
                  .prepare(
                    "SELECT event_digest FROM po7_vmodel_authority_events WHERE status='active'",
                  )
                  .get()?.event_digest,
              );
          const receipt = commitPostPoDesignFreezeTransition(db, {
            repoRoot,
            operationId: opts.operationId,
            idempotencyKey: opts.idempotencyKey,
            expectedAuthorityEpoch: epoch,
            expectedPo7EventDigest: po7Event,
          });
          const evidence = Object.fromEntries(
            [
              "design_freeze_transition_operations",
              "design_freeze_authority_link_events",
              "design_freeze_receipts",
              "design_freeze_projections",
              "design_freeze_progress_projections",
              "design_freeze_l01_candidates",
              "design_freeze_l01_handoffs",
              "design_freeze_transition_outbox",
              "design_freeze_transition_terminal_receipts",
            ].map((table) => [
              table,
              db.prepare(`SELECT * FROM ${table} WHERE operation_id=?`).get(receipt.operationId),
            ]),
          );
          const output = {
            schema_version: "helix.post-po-design-freeze-transition-command-receipt.v1",
            executed: opts.execute === true,
            db_path: opts.execute ? ".helix/harness.db" : ":memory:",
            ...receipt,
            evidence,
          };
          const rendered = `${JSON.stringify(output, null, 2)}\n`;
          if (evidenceTarget) writeAuthorityEvidence(evidenceTarget, rendered);
          process.stdout.write(
            opts.json
              ? rendered
              : `Design Freeze transition ${opts.execute ? "executed" : "dry-run"}: freeze=${receipt.freezeReceiptDigest} candidate=${receipt.candidateDigest}\n`,
          );
        } finally {
          db.close();
        }
      },
    );

  authority
    .command("design-freeze-transition-v2")
    .description("commit the hardened four-head/19-slice/76-artifact Design Freeze transition")
    .requiredOption("--operation-id <id>")
    .requiredOption("--idempotency-key <key>")
    .requiredOption("--expected-po7-event <sha256>")
    .option("--expected-epoch <number>", "expected PO7 epoch", "1")
    .option("--expected-authority-head <sha256>")
    .option("--expected-freeze-head <sha256>")
    .option("--expected-progress-head <sha256>")
    .option("--expected-candidate-head <sha256>")
    .option("--supersedes-receipt <sha256>")
    .requiredOption("--expires-at <iso8601>")
    .requiredOption("--receipt-out <path>", "root-relative path under authority evidence root")
    .requiredOption(
      "--full-row-export-out <path>",
      "root-relative path under authority evidence root",
    )
    .option("--execute")
    .option("--json")
    .action(
      (opts: {
        operationId: string;
        idempotencyKey: string;
        expectedPo7Event: string;
        expectedEpoch: string;
        expectedAuthorityHead?: string;
        expectedFreezeHead?: string;
        expectedProgressHead?: string;
        expectedCandidateHead?: string;
        supersedesReceipt?: string;
        expiresAt: string;
        receiptOut: string;
        fullRowExportOut: string;
        execute?: boolean;
        json?: boolean;
      }) => {
        if (!opts.execute)
          throw new Error("v2 transition requires --execute after a clean pushed HEAD preflight");
        const repoRoot = process.cwd();
        const evidencePlan = planAuthorityEvidencePaths(repoRoot, {
          receiptOut: opts.receiptOut,
          fullRowExportOut: opts.fullRowExportOut,
        });
        const epoch = Number(opts.expectedEpoch);
        const zero = createHash("sha256").update("genesis").digest("hex");
        const db = openHarnessDb(defaultHarnessDbPath(repoRoot), { repoRoot });
        try {
          migrate(db);
          preflightAuthorityEvidence(db, opts.idempotencyKey, {
            receipt: evidencePlan.receipt,
            fullRowExport: evidencePlan.fullRowExport as AuthorityEvidenceTarget,
          });
          const receipt = commitPostPoDesignFreezeTransitionV2(db, {
            repoRoot,
            operationId: opts.operationId,
            idempotencyKey: opts.idempotencyKey,
            expectedPo7Epoch: epoch,
            expectedPo7EventDigest: opts.expectedPo7Event,
            expectedHeads: {
              authority: opts.expectedAuthorityHead ?? zero,
              freeze: opts.expectedFreezeHead ?? zero,
              progress: opts.expectedProgressHead ?? zero,
              candidate: opts.expectedCandidateHead ?? zero,
            },
            expiresAt: opts.expiresAt,
            supersedesReceiptDigest: opts.supersedesReceipt ?? zero,
            evidencePaths: {
              fullExport: (evidencePlan.fullRowExport as AuthorityEvidenceTarget).relativePath,
              commandReceipt: evidencePlan.receipt.relativePath,
            },
          });
          const materialized = materializeAuthorityEvidence(db, receipt.operationId, {
            receipt: evidencePlan.receipt,
            fullRowExport: evidencePlan.fullRowExport as AuthorityEvidenceTarget,
          });
          const rendered = materialized.receipt;
          process.stdout.write(
            opts.json
              ? rendered
              : `Design Freeze v2 current candidate=${receipt.candidateDigest}\n`,
          );
        } finally {
          db.close();
        }
      },
    );
}

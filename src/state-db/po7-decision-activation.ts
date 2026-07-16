import { createHash } from "node:crypto";
import { lstatSync, readFileSync, realpathSync } from "node:fs";
import { isAbsolute, relative, resolve, sep } from "node:path";
import { z } from "zod";
import type { HarnessDb } from "./index";

const HEX = /^[0-9a-f]{64}$/;
const sha = (value: string | Buffer): string => createHash("sha256").update(value).digest("hex");
const stable = (value: unknown): string => {
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  if (value && typeof value === "object")
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, child]) => `${JSON.stringify(key)}:${stable(child)}`)
      .join(",")}}`;
  return JSON.stringify(value);
};
const stableDigest = (value: unknown): string => sha(stable(value));

const activationSchema = z
  .object({
    repoRoot: z.string().min(1),
    operationId: z.string().min(1),
    idempotencyKey: z.string().min(1),
    expectedActivationEpoch: z.number().int().nonnegative(),
    expectedPreviousEventDigest: z.string().regex(HEX).nullable(),
    faultAfterWrite: z.number().int().positive().optional(),
  })
  .strict();
export type Po7ActivationInput = z.input<typeof activationSchema>;
export interface Po7ActivationReceipt {
  operationId: string;
  payloadDigest: string;
  eventDigest: string;
  writeSetDigest: string;
  authorityEpoch: number;
  replay: boolean;
}

const lifecycleSchema = z
  .object({
    repoRoot: z.string().min(1),
    operationId: z.string().min(1),
    idempotencyKey: z.string().min(1),
    expectedActivationEpoch: z.number().int().positive(),
    expectedPreviousEventDigest: z.string().regex(HEX),
    status: z.enum(["stale", "revoked"]),
    reason: z.string().min(1),
    faultAfterWrite: z.number().int().positive().optional(),
  })
  .strict();
export type Po7LifecycleInput = z.input<typeof lifecycleSchema>;

const PATHS = {
  universal: "docs/governance/generated/universal-workflow-po-decision-packet-v1.json",
  vmodel: "docs/governance/generated/vmodel-authority-decision-packet-v1.json",
  vmodelReceipt: "docs/governance/vmodel-authority-receipt-v1.md",
  authority: "docs/governance/generated/po-go-authority-event-v1.json",
} as const;
const GROUP_IDS = Array.from({ length: 6 }, (_, index) => `UWR-PO-DG-0${index + 1}`);
const GROUP_CARDINALITY = [3, 4, 4, 1, 6, 4];

function readCurrent(root: string, repoPath: string): Buffer {
  const rootReal = realpathSync(root);
  if (
    isAbsolute(repoPath) ||
    repoPath.split(/[\\/]+/).some((part) => !part || part === "." || part === "..")
  )
    throw new Error(`PO7 source path is not canonical: ${repoPath}`);
  let cursor = rootReal;
  for (const part of repoPath.split(/[\\/]+/)) {
    cursor = resolve(cursor, part);
    if (lstatSync(cursor).isSymbolicLink())
      throw new Error(`PO7 source path contains symlink: ${repoPath}`);
  }
  const target = resolve(rootReal, repoPath);
  const targetReal = realpathSync(target);
  const rel = relative(rootReal, targetReal);
  if (!rel || rel.startsWith(`..${sep}`) || rel === ".." || lstatSync(target).isSymbolicLink())
    throw new Error(`PO7 source path escapes or aliases repository: ${repoPath}`);
  return readFileSync(targetReal);
}

function parseJson<T extends Record<string, unknown>>(bytes: Buffer, label: string): T {
  try {
    return JSON.parse(bytes.toString("utf8")) as T;
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(`PO7 invalid JSON: ${label}: ${detail}`, { cause: error });
  }
}

interface Po7Option {
  option_id: string;
  decision: string;
}
interface Po7Group {
  decision_group_id: string;
  question_ids: string[];
  recommended_default: string;
  options: Po7Option[];
}
interface Po7QuestionMapping {
  question_id: string;
  queue_id: string;
  decision_group_id: string;
}
interface Po7UniversalPacket extends Record<string, unknown> {
  status: string;
  summary?: { selected_options?: number; activated_answers?: number };
  source_artifacts: Record<string, { path: string; sha256: string }>;
  decision_groups: Po7Group[];
  question_mapping: Po7QuestionMapping[];
}
interface Po7VmodelPacket extends Record<string, unknown> {
  status: string;
  approval?: { event_id?: string | null };
  packet_id: string;
  counts?: { missing_po_decisions?: number };
  missing_po_decisions?: Array<{ id?: string }>;
  source_snapshots: Record<string, { path: string; sha256: string }>;
}
interface Po7AuthorityEvent extends Record<string, unknown> {
  schema_version: string;
  status: string;
  payload_digest: string;
  raw_message: string;
  raw_message_sha256: string;
  normalized_decision: string;
  normalized_decision_sha256: string;
  actor: {
    actor_id: string;
    actor_authority: string;
    authority_expiry: string | null;
    authority_scope: string[];
  };
  actor_authority_evidence_sha256: string;
  universal_packet_sha256: string;
  vmodel_packet_sha256: string;
  native_event_id_available: boolean;
  native_event_id: string | null;
  session_id: string;
  event_id: string;
  observed_at: string;
  selections: Array<{ decision_group_id: string; selected_option_id: string }>;
  vmauth_decision_id: string;
  vmauth_approved: boolean;
}

function validateEmbeddedSources(
  root: string,
  sourceMap: Record<string, { path: string; sha256: string }>,
  expectedCount: number,
): string {
  const members = Object.values(sourceMap ?? {})
    .map((entry) => ({ path: entry.path, sha256: entry.sha256 }))
    .sort((a, b) => a.path.localeCompare(b.path));
  if (
    members.length !== expectedCount ||
    new Set(members.map((row) => row.path)).size !== expectedCount
  )
    throw new Error("PO7 source set denominator drift");
  for (const member of members) {
    if (!HEX.test(member.sha256) || sha(readCurrent(root, member.path)) !== member.sha256)
      throw new Error(`PO7 embedded source drift: ${member.path}`);
  }
  return stableDigest(members);
}

function decisionTableDigest(receipt: Buffer): string {
  const startToken = Buffer.from("## §1 authority decision", "utf8");
  const endToken = Buffer.from("### §1.1 machine decision packet", "utf8");
  const start = receipt.indexOf(startToken);
  const end = receipt.indexOf(endToken);
  if (start < 0 || end <= start) throw new Error("PO7 VMAUTH decision table span missing");
  const digest = sha(receipt.subarray(start, end));
  const declared = receipt
    .toString("utf8")
    .match(/§1 decision table[^|]*\| `([0-9a-f]{64})`/s)?.[1];
  if (declared !== digest) throw new Error("PO7 VMAUTH decision table digest drift");
  return digest;
}

function authorityPayloadDigest(authority: Record<string, unknown>): string {
  const copy = { ...authority };
  delete copy.payload_digest;
  return stableDigest(copy);
}

function loadAuthority(root: string) {
  const universalBytes = readCurrent(root, PATHS.universal);
  const universal = parseJson<Po7UniversalPacket>(universalBytes, PATHS.universal);
  const vmodelBytes = readCurrent(root, PATHS.vmodel);
  const vmodel = parseJson<Po7VmodelPacket>(vmodelBytes, PATHS.vmodel);
  const receiptBytes = readCurrent(root, PATHS.vmodelReceipt);
  const authorityBytes = readCurrent(root, PATHS.authority);
  const authority = parseJson<Po7AuthorityEvent>(authorityBytes, PATHS.authority);
  const universalDigest = sha(universalBytes);
  const vmodelDigest = sha(vmodelBytes);
  if (
    universal.status !== "candidate_not_activated" ||
    universal.summary?.selected_options !== 0 ||
    universal.summary?.activated_answers !== 0
  )
    throw new Error("PO7 Universal packet not pending");
  if (
    vmodel.status !== "pending_po_activation" ||
    vmodel.approval?.event_id !== null ||
    vmodel.packet_id !== "VMAUTH-2026-07-16-01"
  )
    throw new Error("PO7 VMAUTH packet not pending");
  if (
    vmodel.counts?.missing_po_decisions !== 1 ||
    vmodel.missing_po_decisions?.length !== 1 ||
    vmodel.missing_po_decisions[0]?.id !== "VMAUTH-PO-01"
  )
    throw new Error("PO7 VMAUTH decision exact set drift");
  const universalSourceSetDigest = validateEmbeddedSources(root, universal.source_artifacts, 3);
  const vmodelSourceSetDigest = validateEmbeddedSources(root, vmodel.source_snapshots, 7);
  const tableDigest = decisionTableDigest(receiptBytes);
  if (
    authority.schema_version !== "helix.po-go-authority-event.v1" ||
    authority.status !== "observed_pending_activation"
  )
    throw new Error("PO7 GO authority state invalid");
  if (
    authority.payload_digest !== authorityPayloadDigest(authority) ||
    sha(Buffer.from(authority.raw_message, "utf8")) !== authority.raw_message_sha256 ||
    sha(Buffer.from(authority.normalized_decision, "utf8")) !== authority.normalized_decision_sha256
  )
    throw new Error("PO7 GO custody digest drift");
  if (
    authority.raw_message !== "GO" ||
    authority.normalized_decision !== "DG01=A;DG02=A;DG03=A;DG04=A;DG05=A;DG06=A;VMAUTH=approve"
  )
    throw new Error("PO7 GO decision meaning invalid");
  if (
    authority.actor?.actor_id !== "PO" ||
    authority.actor?.actor_authority !== "requirements-and-authoring-authority" ||
    authority.actor?.authority_expiry !== null
  )
    throw new Error("PO7 actor authority invalid");
  const scopes = [...(authority.actor?.authority_scope ?? [])].sort();
  if (stable(scopes) !== stable(["universal-requirements-decision", "vmodel-authoring-authority"]))
    throw new Error("PO7 actor authority scope invalid");
  if (
    stableDigest(authority.actor) !== authority.actor_authority_evidence_sha256 ||
    authority.universal_packet_sha256 !== universalDigest ||
    authority.vmodel_packet_sha256 !== vmodelDigest
  )
    throw new Error("PO7 authority evidence or packet binding drift");
  if (
    authority.native_event_id_available !== false ||
    authority.native_event_id !== null ||
    !authority.session_id ||
    !authority.event_id ||
    Number.isNaN(Date.parse(authority.observed_at))
  )
    throw new Error("PO7 event/time custody invalid");
  const selections = [...authority.selections].sort((a, b) =>
    a.decision_group_id.localeCompare(b.decision_group_id),
  );
  if (
    stable(selections) !==
      stable(
        GROUP_IDS.map((decision_group_id) => ({ decision_group_id, selected_option_id: "A" })),
      ) ||
    authority.vmauth_decision_id !== "VMAUTH-PO-01" ||
    authority.vmauth_approved !== true
  )
    throw new Error("PO7 authority exact selection invalid");
  const groups = [...universal.decision_groups].sort((a, b) =>
    a.decision_group_id.localeCompare(b.decision_group_id),
  );
  if (
    groups.length !== 6 ||
    groups.some(
      (group, index) =>
        group.decision_group_id !== GROUP_IDS[index] ||
        group.question_ids.length !== GROUP_CARDINALITY[index] ||
        group.recommended_default !== "A" ||
        !group.options.some(
          (option) =>
            option.option_id === "A" &&
            typeof option.decision === "string" &&
            option.decision.length > 0,
        ),
    )
  )
    throw new Error("PO7 canonical group/A semantics drift");
  const mapping = universal.question_mapping;
  if (
    !Array.isArray(mapping) ||
    mapping.length !== 22 ||
    new Set(mapping.map((row) => row.question_id)).size !== 22 ||
    new Set(mapping.map((row) => row.queue_id)).size !== 22
  )
    throw new Error("PO7 canonical question/queue set drift");
  for (const row of mapping)
    if (
      !groups
        .find((group) => group.decision_group_id === row.decision_group_id)
        ?.question_ids.includes(row.question_id)
    )
      throw new Error("PO7 question mapping membership drift");
  const snapshotDigest = stableDigest({
    universalDigest,
    vmodelDigest,
    universalSourceSetDigest,
    vmodelSourceSetDigest,
    tableDigest,
    authorityPayloadDigest: authority.payload_digest,
  });
  return {
    universal,
    vmodel,
    authority,
    groups,
    mapping,
    universalDigest,
    vmodelDigest,
    universalSourceSetDigest,
    vmodelSourceSetDigest,
    tableDigest,
    snapshotDigest,
  };
}

function rowObject(row: unknown[]): unknown[] {
  return row;
}
function currentHead(db: HarnessDb): {
  authorityEpoch: number;
  eventDigest: string | null;
  status: string | null;
} {
  const row = db
    .prepare(
      "SELECT authority_epoch,event_digest,status FROM po7_activation_projections ORDER BY authority_epoch DESC LIMIT 1",
    )
    .get();
  return row
    ? {
        authorityEpoch: Number(row.authority_epoch),
        eventDigest: String(row.event_digest),
        status: String(row.status),
      }
    : { authorityEpoch: 0, eventDigest: null, status: null };
}

function observeCurrentAuthority(root: string): Record<string, string> {
  const observations = Object.fromEntries(
    Object.entries(PATHS).map(([name, path]) => {
      try {
        return [name, sha(readCurrent(root, path))];
      } catch {
        return [name, "unavailable"];
      }
    }),
  );
  for (const [packetName, packetPath, field] of [
    ["universal", PATHS.universal, "source_artifacts"],
    ["vmodel", PATHS.vmodel, "source_snapshots"],
  ] as const) {
    try {
      const packet = parseJson(readCurrent(root, packetPath), packetPath);
      for (const source of Object.values(packet[field] ?? {}) as Array<{ path?: string }>) {
        if (!source.path) continue;
        try {
          observations[`${packetName}:${source.path}`] = sha(readCurrent(root, source.path));
        } catch {
          observations[`${packetName}:${source.path}`] = "unavailable";
        }
      }
    } catch {
      observations[`${packetName}:embedded-set`] = "unavailable";
    }
  }
  return observations;
}

export function activatePo7Decision(db: HarnessDb, raw: Po7ActivationInput): Po7ActivationReceipt {
  const input = activationSchema.parse(raw);
  const root = realpathSync(input.repoRoot);
  const requestDigest = stableDigest({
    operationId: input.operationId,
    idempotencyKey: input.idempotencyKey,
    expectedActivationEpoch: input.expectedActivationEpoch,
    expectedPreviousEventDigest: input.expectedPreviousEventDigest,
  });
  db.exec("BEGIN IMMEDIATE");
  try {
    const replayOperation = db
      .prepare(
        "SELECT operation_id,request_digest FROM po7_activation_operations WHERE idempotency_key=?",
      )
      .get(input.idempotencyKey);
    if (replayOperation) {
      if (String(replayOperation.request_digest) !== requestDigest)
        throw new Error("PO7 idempotency conflict");
      const terminal = db
        .prepare(
          "SELECT payload_digest,event_digest,write_set_digest,authority_epoch FROM po7_activation_terminal_receipts WHERE operation_id=? AND status='active'",
        )
        .get(String(replayOperation.operation_id));
      if (!terminal) throw new Error("PO7 idempotency reconcile required");
      db.exec("COMMIT");
      return {
        operationId: String(replayOperation.operation_id),
        payloadDigest: String(terminal.payload_digest),
        eventDigest: String(terminal.event_digest),
        writeSetDigest: String(terminal.write_set_digest),
        authorityEpoch: Number(terminal.authority_epoch),
        replay: true,
      };
    }
    const authority = loadAuthority(root);
    const payload = {
      operationId: input.operationId,
      idempotencyKey: input.idempotencyKey,
      expectedActivationEpoch: input.expectedActivationEpoch,
      expectedPreviousEventDigest: input.expectedPreviousEventDigest,
      authorityPayloadDigest: authority.authority.payload_digest,
      universalPacketDigest: authority.universalDigest,
      universalSourceSetDigest: authority.universalSourceSetDigest,
      vmodelPacketDigest: authority.vmodelDigest,
      vmodelSourceSetDigest: authority.vmodelSourceSetDigest,
      decisionTableDigest: authority.tableDigest,
    };
    const payloadDigest = stableDigest(payload);
    const head = currentHead(db);
    if (
      head.authorityEpoch !== input.expectedActivationEpoch ||
      head.eventDigest !== input.expectedPreviousEventDigest ||
      head.status !== null
    )
      throw new Error("PO7 activation CAS conflict or consumed authority event");
    const epoch = head.authorityEpoch + 1;
    const issuedAt = authority.authority.observed_at;
    const eventDigest = stableDigest({
      payloadDigest,
      previousEventDigest: head.eventDigest,
      authorityEpoch: epoch,
    });
    const groupRows = authority.groups.map((group) => {
      const option = group.options.find((candidate) => candidate.option_id === "A");
      if (!option) throw new Error(`PO7 selected option missing: ${group.decision_group_id}`);
      return [
        `${input.operationId}:G:${group.decision_group_id}`,
        input.operationId,
        group.decision_group_id,
        "A",
        stableDigest(option.decision),
        authority.universalDigest,
        authority.universalSourceSetDigest,
        authority.authority.actor.actor_id,
        authority.authority.actor.actor_authority,
        authority.authority.actor_authority_evidence_sha256,
        input.idempotencyKey,
        epoch,
        stableDigest({ genesis: group.decision_group_id }),
        authority.authority.event_id,
        authority.authority.raw_message_sha256,
        authority.authority.normalized_decision_sha256,
        issuedAt,
        "active",
      ];
    });
    const mappingByQuestion = new Map(authority.mapping.map((row) => [row.question_id, row]));
    const questionRows = authority.groups.flatMap((group) =>
      group.question_ids.map((questionId) => {
        const map = mappingByQuestion.get(questionId);
        const option = group.options.find((candidate) => candidate.option_id === "A");
        if (!map || !option) throw new Error(`PO7 question binding missing: ${questionId}`);
        return [
          `${input.operationId}:Q:${questionId}`,
          input.operationId,
          questionId,
          map.queue_id,
          group.decision_group_id,
          "A",
          option.decision,
          stableDigest(option.decision),
          authority.universalDigest,
          authority.universalSourceSetDigest,
          authority.authority.event_id,
          authority.authority.raw_message_sha256,
          authority.authority.normalized_decision_sha256,
          epoch,
          issuedAt,
          "active",
        ];
      }),
    );
    const dispositionSetDigest = stableDigest(
      questionRows
        .map((row) => ({ question_id: String(row[2]), value_digest: row[7] }))
        .sort((a, b) => a.question_id.localeCompare(b.question_id)),
    );
    const queueSetDigest = stableDigest(
      questionRows
        .map((row) => ({ question_id: String(row[2]), queue_id: row[3] }))
        .sort((a, b) => a.question_id.localeCompare(b.question_id)),
    );
    const reasonDigest = stableDigest("activation");
    const vmodelRow = [
      `${input.operationId}:VMAUTH`,
      input.operationId,
      epoch,
      eventDigest,
      head.eventDigest ?? "",
      authority.vmodelDigest,
      authority.vmodelSourceSetDigest,
      authority.tableDigest,
      authority.authority.actor.actor_id,
      authority.authority.actor.actor_authority,
      authority.authority.actor_authority_evidence_sha256,
      "[]",
      input.idempotencyKey,
      epoch,
      authority.authority.event_id,
      authority.authority.raw_message_sha256,
      authority.authority.normalized_decision_sha256,
      "active",
      issuedAt,
    ];
    const projectionRow = [
      `PO7:${epoch}:active:${input.operationId}`,
      input.operationId,
      epoch,
      eventDigest,
      6,
      22,
      dispositionSetDigest,
      queueSetDigest,
      "closed",
      reasonDigest,
      "active",
      issuedAt,
    ];
    const operationRow = [
      input.operationId,
      input.idempotencyKey,
      requestDigest,
      payloadDigest,
      epoch,
      head.eventDigest ?? "",
      authority.universalDigest,
      authority.universalSourceSetDigest,
      authority.vmodelDigest,
      authority.vmodelSourceSetDigest,
      authority.tableDigest,
      authority.authority.payload_digest,
      authority.authority.actor.actor_id,
      authority.authority.actor.actor_authority,
      authority.authority.actor_authority_evidence_sha256,
      authority.authority.event_id,
      authority.authority.raw_message_sha256,
      authority.authority.normalized_decision_sha256,
      issuedAt,
      "active",
    ];
    const orderedWriteSet = [
      { table: "po7_activation_operations", row: operationRow },
      ...groupRows.map((row) => ({ table: "po7_group_option_receipts", row: rowObject(row) })),
      ...questionRows.map((row) => ({
        table: "po7_question_answer_receipts",
        row: rowObject(row),
      })),
      { table: "po7_vmodel_authority_events", row: vmodelRow },
      { table: "po7_activation_projections", row: projectionRow },
    ];
    const writeSetDigest = stableDigest(orderedWriteSet);
    const terminalRow = [
      `${input.operationId}:terminal`,
      input.operationId,
      payloadDigest,
      eventDigest,
      writeSetDigest,
      epoch,
      "active",
      issuedAt,
    ];
    let writes = 0;
    const fault = () => {
      writes += 1;
      if (input.faultAfterWrite === writes) throw new Error(`PO7 injected fault ${writes}`);
    };
    db.prepare(
      "INSERT INTO po7_activation_operations VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
    ).run(...operationRow);
    fault();
    const groupInsert = db.prepare(
      `INSERT INTO po7_group_option_receipts VALUES (${Array(18).fill("?").join(",")})`,
    );
    for (const row of groupRows) {
      groupInsert.run(...row);
      fault();
    }
    const questionInsert = db.prepare(
      `INSERT INTO po7_question_answer_receipts VALUES (${Array(16).fill("?").join(",")})`,
    );
    for (const row of questionRows) {
      questionInsert.run(...row);
      fault();
    }
    db.prepare(
      `INSERT INTO po7_vmodel_authority_events VALUES (${Array(19).fill("?").join(",")})`,
    ).run(...vmodelRow);
    fault();
    db.prepare(
      `INSERT INTO po7_activation_projections VALUES (${Array(12).fill("?").join(",")})`,
    ).run(...projectionRow);
    fault();
    db.prepare(
      `INSERT INTO po7_activation_terminal_receipts VALUES (${Array(8).fill("?").join(",")})`,
    ).run(...terminalRow);
    fault();
    if (loadAuthority(root).snapshotDigest !== authority.snapshotDigest)
      throw new Error("PO7 source changed during activation transaction");
    db.exec("COMMIT");
    return {
      operationId: input.operationId,
      payloadDigest,
      eventDigest,
      writeSetDigest,
      authorityEpoch: epoch,
      replay: false,
    };
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

export function transitionPo7Authority(
  db: HarnessDb,
  raw: Po7LifecycleInput,
): Po7ActivationReceipt {
  const input = lifecycleSchema.parse(raw);
  const root = realpathSync(input.repoRoot);
  const requestDigest = stableDigest({
    operationId: input.operationId,
    idempotencyKey: input.idempotencyKey,
    expectedActivationEpoch: input.expectedActivationEpoch,
    expectedPreviousEventDigest: input.expectedPreviousEventDigest,
    status: input.status,
    reason: input.reason,
  });
  db.exec("BEGIN IMMEDIATE");
  try {
    const replayOperation = db
      .prepare(
        "SELECT operation_id,request_digest FROM po7_activation_operations WHERE idempotency_key=?",
      )
      .get(input.idempotencyKey);
    if (replayOperation) {
      if (String(replayOperation.request_digest) !== requestDigest)
        throw new Error("PO7 idempotency conflict");
      const terminal = db
        .prepare(
          "SELECT payload_digest,event_digest,write_set_digest,authority_epoch FROM po7_activation_terminal_receipts WHERE operation_id=? AND status=?",
        )
        .get(String(replayOperation.operation_id), input.status);
      if (!terminal) throw new Error("PO7 lifecycle reconcile required");
      db.exec("COMMIT");
      return {
        operationId: String(replayOperation.operation_id),
        payloadDigest: String(terminal.payload_digest),
        eventDigest: String(terminal.event_digest),
        writeSetDigest: String(terminal.write_set_digest),
        authorityEpoch: Number(terminal.authority_epoch),
        replay: true,
      };
    }
    const priorEvent = db
      .prepare("SELECT * FROM po7_vmodel_authority_events WHERE event_digest=?")
      .get(input.expectedPreviousEventDigest);
    const priorOperation = priorEvent
      ? db
          .prepare("SELECT * FROM po7_activation_operations WHERE operation_id=?")
          .get(String(priorEvent.operation_id))
      : undefined;
    if (!priorEvent || !priorOperation)
      throw new Error("PO7 lifecycle sealed authority receipt missing");
    const currentObservation = observeCurrentAuthority(root);
    const payloadDigest = stableDigest({
      requestDigest,
      sealedAuthorityPayloadDigest: priorOperation.authority_event_payload_digest,
      currentObservation,
    });
    const head = currentHead(db);
    const validTransition = head.status === "active" && ["stale", "revoked"].includes(input.status);
    if (
      head.authorityEpoch !== input.expectedActivationEpoch ||
      head.eventDigest !== input.expectedPreviousEventDigest ||
      !validTransition
    )
      throw new Error("PO7 lifecycle CAS or transition conflict");
    const epoch = head.authorityEpoch + 1;
    const issuedAt = new Date().toISOString();
    const eventDigest = stableDigest({
      payloadDigest,
      previousEventDigest: head.eventDigest,
      authorityEpoch: epoch,
    });
    const reasonDigest = stableDigest({ reason: input.reason, currentObservation });
    const emptySetDigest = stableDigest([]);
    const priorGroups = db
      .prepare(
        "SELECT * FROM po7_group_option_receipts WHERE operation_id=? ORDER BY decision_group_id",
      )
      .all(String(priorEvent.operation_id));
    const priorQuestions = db
      .prepare(
        "SELECT * FROM po7_question_answer_receipts WHERE operation_id=? ORDER BY question_id",
      )
      .all(String(priorEvent.operation_id));
    if (priorGroups.length !== 6 || priorQuestions.length !== 22)
      throw new Error("PO7 lifecycle predecessor receipt denominator drift");
    const groupRows = priorGroups.map((row) => [
      `${input.operationId}:G:${row.decision_group_id}`,
      input.operationId,
      row.decision_group_id,
      row.selected_option_id,
      row.option_decision_digest,
      row.packet_digest,
      row.source_revision_digest,
      row.actor_id,
      row.actor_authority,
      row.authority_evidence_digest,
      input.idempotencyKey,
      epoch,
      stableDigest(row),
      row.answer_event_id,
      row.answer_message_digest,
      row.normalized_answer_digest,
      issuedAt,
      input.status,
    ]);
    const questionRows = priorQuestions.map((row) => [
      `${input.operationId}:Q:${row.question_id}`,
      input.operationId,
      row.question_id,
      row.queue_id,
      row.decision_group_id,
      row.selected_option_id,
      row.answer_value,
      row.answer_value_digest,
      row.packet_digest,
      row.source_revision_digest,
      row.answer_event_id,
      row.answer_message_digest,
      row.normalized_answer_digest,
      epoch,
      issuedAt,
      input.status,
    ]);
    const vmodelRow = [
      `${input.operationId}:VMAUTH`,
      input.operationId,
      epoch,
      eventDigest,
      head.eventDigest,
      priorOperation.vmodel_packet_digest,
      priorOperation.vmodel_source_set_digest,
      priorOperation.decision_table_digest,
      priorOperation.actor_id,
      priorOperation.actor_authority,
      priorOperation.authority_evidence_digest,
      priorEvent.co_authority_receipt_digests,
      input.idempotencyKey,
      epoch,
      priorOperation.answer_event_id,
      priorOperation.answer_message_digest,
      priorOperation.normalized_answer_digest,
      input.status,
      issuedAt,
    ];
    const projectionRow = [
      `PO7:${epoch}:${input.status}:${input.operationId}`,
      input.operationId,
      epoch,
      eventDigest,
      0,
      0,
      emptySetDigest,
      emptySetDigest,
      "reopened",
      reasonDigest,
      input.status,
      issuedAt,
    ];
    const operationRow = [
      input.operationId,
      input.idempotencyKey,
      requestDigest,
      payloadDigest,
      epoch,
      head.eventDigest,
      priorOperation.universal_packet_digest,
      priorOperation.universal_source_set_digest,
      priorOperation.vmodel_packet_digest,
      priorOperation.vmodel_source_set_digest,
      priorOperation.decision_table_digest,
      priorOperation.authority_event_payload_digest,
      priorOperation.actor_id,
      priorOperation.actor_authority,
      priorOperation.authority_evidence_digest,
      priorOperation.answer_event_id,
      priorOperation.answer_message_digest,
      priorOperation.normalized_answer_digest,
      issuedAt,
      input.status,
    ];
    const orderedWriteSet = [
      { table: "po7_activation_operations", row: operationRow },
      ...groupRows.map((row) => ({ table: "po7_group_option_receipts", row })),
      ...questionRows.map((row) => ({ table: "po7_question_answer_receipts", row })),
      { table: "po7_vmodel_authority_events", row: vmodelRow },
      { table: "po7_activation_projections", row: projectionRow },
    ];
    const writeSetDigest = stableDigest(orderedWriteSet);
    const terminalRow = [
      `${input.operationId}:terminal`,
      input.operationId,
      payloadDigest,
      eventDigest,
      writeSetDigest,
      epoch,
      input.status,
      issuedAt,
    ];
    let writes = 0;
    const fault = () => {
      writes += 1;
      if (input.faultAfterWrite === writes) throw new Error(`PO7 injected fault ${writes}`);
    };
    db.prepare(
      "INSERT INTO po7_activation_operations VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
    ).run(...operationRow);
    fault();
    const groupInsert = db.prepare(
      `INSERT INTO po7_group_option_receipts VALUES (${Array(18).fill("?").join(",")})`,
    );
    for (const row of groupRows) {
      groupInsert.run(...row);
      fault();
    }
    const questionInsert = db.prepare(
      `INSERT INTO po7_question_answer_receipts VALUES (${Array(16).fill("?").join(",")})`,
    );
    for (const row of questionRows) {
      questionInsert.run(...row);
      fault();
    }
    db.prepare(
      `INSERT INTO po7_vmodel_authority_events VALUES (${Array(19).fill("?").join(",")})`,
    ).run(...vmodelRow);
    fault();
    db.prepare(
      `INSERT INTO po7_activation_projections VALUES (${Array(12).fill("?").join(",")})`,
    ).run(...projectionRow);
    fault();
    db.prepare(
      `INSERT INTO po7_activation_terminal_receipts VALUES (${Array(8).fill("?").join(",")})`,
    ).run(...terminalRow);
    fault();
    db.exec("COMMIT");
    return {
      operationId: input.operationId,
      payloadDigest,
      eventDigest,
      writeSetDigest,
      authorityEpoch: epoch,
      replay: false,
    };
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

import { createHash } from "node:crypto";
import type { HarnessDb } from "./index";

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
const values = (row: Record<string, unknown>, names: string[]) => names.map((name) => row[name]);
const QUESTION_ORDER = [
  "UWR-Q-C-APPROVAL-03",
  "UWR-Q-B-018",
  "UWR-Q-B-022",
  "UWR-Q-C-MONEY-01",
  "UWR-Q-C-MONEY-02",
  "UWR-Q-C-MONEY-03",
  "UWR-Q-C-MONEY-04",
  "UWR-Q-C-DEADLINE-01",
  "UWR-Q-C-DEADLINE-04",
  "UWR-Q-R-020",
  "UWR-Q-R-021",
  "UWR-Q-C-PERSONAL-DATA-01",
  "UWR-Q-R-002",
  "UWR-Q-R-003",
  "UWR-Q-R-004",
  "UWR-Q-R-005",
  "UWR-Q-R-011",
  "UWR-Q-R-012",
  "UWR-Q-R-014",
  "UWR-Q-R-016",
  "UWR-Q-R-017",
  "UWR-Q-R-022",
] as const;

export interface SealedPo7AuthorityV1 {
  operationId: string;
  authorityEpoch: number;
  eventDigest: string;
  payloadDigest: string;
  terminalWriteSetDigest: string;
  terminalRowDigest: string;
  authorityReceiptDigests: string[];
  authorityReceiptSetDigest: string;
  fullRowSetDigest: string;
}

export function readAndValidateLatestSealedPo7Authority(
  db: HarnessDb,
  expectedEpoch: number,
  expectedEventDigest: string,
): SealedPo7AuthorityV1 {
  const latest = db
    .prepare("SELECT * FROM po7_activation_projections ORDER BY authority_epoch DESC LIMIT 1")
    .get() as Record<string, unknown> | undefined;
  if (
    !latest ||
    Number(latest.authority_epoch) !== expectedEpoch ||
    String(latest.event_digest) !== expectedEventDigest ||
    latest.status !== "active" ||
    latest.freeze_blocker_status !== "closed" ||
    Number(latest.group_count) !== 6 ||
    Number(latest.question_count) !== 22
  )
    throw new Error("sealed PO7 latest head is not active");
  const operationId = String(latest.operation_id);
  const operation = db
    .prepare("SELECT * FROM po7_activation_operations WHERE operation_id=? AND status='active'")
    .get(operationId) as Record<string, unknown> | undefined;
  const terminal = db
    .prepare(
      "SELECT * FROM po7_activation_terminal_receipts WHERE operation_id=? AND status='active'",
    )
    .get(operationId) as Record<string, unknown> | undefined;
  const vmodel = db
    .prepare("SELECT * FROM po7_vmodel_authority_events WHERE operation_id=? AND status='active'")
    .get(operationId) as Record<string, unknown> | undefined;
  const groups = db
    .prepare(
      "SELECT * FROM po7_group_option_receipts WHERE operation_id=? AND status='active' ORDER BY decision_group_id",
    )
    .all(operationId) as Record<string, unknown>[];
  const questionRows = db
    .prepare("SELECT * FROM po7_question_answer_receipts WHERE operation_id=? AND status='active'")
    .all(operationId) as Record<string, unknown>[];
  const questionById = new Map(questionRows.map((row) => [String(row.question_id), row]));
  const questions = QUESTION_ORDER.map((id) => questionById.get(id)).filter(
    (row): row is Record<string, unknown> => Boolean(row),
  );
  if (!operation || !terminal || !vmodel || groups.length !== 6 || questions.length !== 22)
    throw new Error("sealed PO7 receipt denominator drift");
  const groupIds = Array.from(
    { length: 6 },
    (_v, i) => `UWR-PO-DG-${String(i + 1).padStart(2, "0")}`,
  );
  if (
    groups.map((row) => row.decision_group_id).join("|") !== groupIds.join("|") ||
    questions.map((row) => row.question_id).join("|") !== QUESTION_ORDER.join("|") ||
    new Set(questions.map((row) => row.queue_id)).size !== 22
  )
    throw new Error("sealed PO7 canonical ID set drift");
  if (
    [...groups, ...questions, vmodel].some(
      (row) => Number(row.authority_epoch) !== expectedEpoch,
    ) ||
    groups.some((row) => row.selected_option_id !== "A") ||
    questions.some((row) => row.selected_option_id !== "A") ||
    vmodel.event_digest !== expectedEventDigest ||
    operation.payload_digest !== terminal.payload_digest ||
    terminal.event_digest !== expectedEventDigest
  )
    throw new Error("sealed PO7 row binding drift");
  const opCols = [
    "operation_id",
    "idempotency_key",
    "request_digest",
    "payload_digest",
    "authority_epoch",
    "previous_event_digest",
    "universal_packet_digest",
    "universal_source_set_digest",
    "vmodel_packet_digest",
    "vmodel_source_set_digest",
    "decision_table_digest",
    "authority_event_payload_digest",
    "actor_id",
    "actor_authority",
    "authority_evidence_digest",
    "answer_event_id",
    "answer_message_digest",
    "normalized_answer_digest",
    "observed_at",
    "status",
  ];
  const groupCols = [
    "receipt_id",
    "operation_id",
    "decision_group_id",
    "selected_option_id",
    "option_decision_digest",
    "packet_digest",
    "source_revision_digest",
    "actor_id",
    "actor_authority",
    "authority_evidence_digest",
    "idempotency_key",
    "authority_epoch",
    "previous_receipt_digest",
    "answer_event_id",
    "answer_message_digest",
    "normalized_answer_digest",
    "issued_at",
    "status",
  ];
  const questionCols = [
    "receipt_id",
    "operation_id",
    "question_id",
    "queue_id",
    "decision_group_id",
    "selected_option_id",
    "answer_value",
    "answer_value_digest",
    "packet_digest",
    "source_revision_digest",
    "answer_event_id",
    "answer_message_digest",
    "normalized_answer_digest",
    "authority_epoch",
    "issued_at",
    "status",
  ];
  const vmodelCols = [
    "event_id",
    "operation_id",
    "event_sequence",
    "event_digest",
    "previous_event_digest",
    "packet_digest",
    "source_set_digest",
    "decision_table_digest",
    "actor_id",
    "actor_authority",
    "authority_evidence_digest",
    "co_authority_receipt_digests",
    "idempotency_key",
    "authority_epoch",
    "answer_event_id",
    "answer_message_digest",
    "normalized_answer_digest",
    "status",
    "issued_at",
  ];
  const projectionCols = [
    "projection_id",
    "operation_id",
    "authority_epoch",
    "event_digest",
    "group_count",
    "question_count",
    "disposition_set_digest",
    "queue_set_digest",
    "freeze_blocker_status",
    "reason_digest",
    "status",
    "projected_at",
  ];
  const ordered = [
    { table: "po7_activation_operations", row: values(operation, opCols) },
    ...groups.map((row) => ({ table: "po7_group_option_receipts", row: values(row, groupCols) })),
    ...questions.map((row) => ({
      table: "po7_question_answer_receipts",
      row: values(row, questionCols),
    })),
    { table: "po7_vmodel_authority_events", row: values(vmodel, vmodelCols) },
    { table: "po7_activation_projections", row: values(latest, projectionCols) },
  ];
  const recomputedWriteSetDigest = digest(ordered);
  if (terminal.write_set_digest !== recomputedWriteSetDigest)
    throw new Error(
      `sealed PO7 terminal write-set digest drift: stored=${terminal.write_set_digest} recomputed=${recomputedWriteSetDigest}`,
    );
  const authorityReceiptDigests = [...groups.map((row) => digest(row)), digest(vmodel)].sort();
  return {
    operationId,
    authorityEpoch: expectedEpoch,
    eventDigest: expectedEventDigest,
    payloadDigest: String(terminal.payload_digest),
    terminalWriteSetDigest: recomputedWriteSetDigest,
    terminalRowDigest: digest(terminal),
    authorityReceiptDigests,
    authorityReceiptSetDigest: digest(authorityReceiptDigests),
    fullRowSetDigest: digest({
      operation,
      groups,
      questions,
      vmodel,
      projection: latest,
      terminal,
    }),
  };
}

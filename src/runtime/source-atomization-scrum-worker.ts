import { z } from "zod";
import { canonicalJson, sha256Digest } from "./digest.js";

export const SOURCE_ATOMIZATION_SCRUM_CAPABILITY_ID = "source_atomization.scrum_mode.v1" as const;

const digestSchema = z.string().regex(/^sha256:[0-9a-f]{64}$/);
const identifierSchema = z
  .string()
  .min(1)
  .max(128)
  .regex(/^[A-Za-z0-9._:-]+$/);

export const sourceAtomizationScrumRequestSchema = z
  .object({
    schema_version: z.literal("helix-source-atomization-request.v1"),
    capability_class: z.literal("source_atomization"),
    capability_id: z.literal(SOURCE_ATOMIZATION_SCRUM_CAPABILITY_ID),
    request_id: identifierSchema,
    source_id: identifierSchema,
    source_digest: digestSchema,
    markdown: z.string().max(1_000_000),
    proposal_only: z.literal(true),
  })
  .strict();

export const sourceAtomProposalSchema = z
  .object({
    ordinal: z.number().int().positive(),
    kind: z.enum(["heading", "list_item", "table_row"]),
    source_line: z.number().int().positive(),
    text: z.string().min(1),
    semantic_digest: digestSchema,
  })
  .strict();

export const sourceAtomizationScrumProposalSchema = z
  .object({
    schema_version: z.literal("helix-source-atomization-proposal.v1"),
    capability_class: z.literal("source_atomization"),
    capability_id: z.literal(SOURCE_ATOMIZATION_SCRUM_CAPABILITY_ID),
    request_id: identifierSchema,
    source_id: identifierSchema,
    source_digest: digestSchema,
    atoms: z.array(sourceAtomProposalSchema).max(100_000),
    proposal_only: z.literal(true),
    proposal_digest: digestSchema,
  })
  .strict();

export const sourceAtomizationScrumCompleteSchema = z
  .object({
    schema_version: z.literal("helix-source-atomization-complete.v1"),
    capability_id: z.literal(SOURCE_ATOMIZATION_SCRUM_CAPABILITY_ID),
    request_id: identifierSchema,
    atom_count: z.number().int().nonnegative(),
    proposal_digest: digestSchema,
    proposal_only: z.literal(true),
  })
  .strict();

export type SourceAtomizationScrumRequestV1 = z.infer<typeof sourceAtomizationScrumRequestSchema>;
export type SourceAtomizationScrumProposalV1 = z.infer<typeof sourceAtomizationScrumProposalSchema>;
export type SourceAtomizationScrumCompleteV1 = z.infer<typeof sourceAtomizationScrumCompleteSchema>;

export type SourceAtomizationWorkerFailureCode =
  | "HIL_WORKER_JSON_INVALID"
  | "HIL_WORKER_PAYLOAD_OVERSIZE"
  | "HIL_WORKER_RESULT_SCHEMA_INVALID"
  | "HIL_WORKER_PAYLOAD_DIGEST_MISMATCH"
  | "HIL_PYTHON_AUTHORITY_BYPASS"
  | "HIL_IPC_FAIL_OPEN";

export type SourceAtomizationWorkerValidation =
  | {
      ok: true;
      proposal: SourceAtomizationScrumProposalV1;
      complete: SourceAtomizationScrumCompleteV1;
    }
  | { ok: false; code: SourceAtomizationWorkerFailureCode };

const AUTHORITY_FIELD_PATTERN =
  /^(?:db|database|repository|repo|credential|credentials|secret|secrets|helix|state|current)(?:_|$)/i;

function hasAuthorityField(value: unknown): boolean {
  if (Array.isArray(value)) return value.some(hasAuthorityField);
  if (typeof value !== "object" || value === null) return false;
  return Object.entries(value).some(
    ([key, child]) => AUTHORITY_FIELD_PATTERN.test(key) || hasAuthorityField(child),
  );
}

function isTableDelimiter(value: string): boolean {
  const cells = value.replace(/^\|/, "").replace(/\|$/, "").split("|");
  return cells.length > 0 && cells.every((cell) => /^\s*:?-{3,}:?\s*$/.test(cell));
}

export function atomizeScrumMarkdown(
  request: SourceAtomizationScrumRequestV1,
): SourceAtomizationScrumProposalV1["atoms"] {
  const atoms: SourceAtomizationScrumProposalV1["atoms"] = [];
  for (const [index, rawLine] of request.markdown.split("\n").entries()) {
    const line = rawLine.endsWith("\r") ? rawLine.slice(0, -1) : rawLine;
    let kind: "heading" | "list_item" | "table_row" | null = null;
    let text = "";
    const heading = /^(#{1,6})\s+(.+?)\s*$/.exec(line);
    const listItem = /^\s*(?:[-+*]|\d+[.)])\s+(.+?)\s*$/.exec(line);
    if (heading) {
      kind = "heading";
      text = heading[2];
    } else if (listItem) {
      kind = "list_item";
      text = listItem[1];
    } else if (/^\s*\|.*\|\s*$/.test(line) && !isTableDelimiter(line)) {
      kind = "table_row";
      text = line.trim();
    }
    if (kind === null || text.length === 0) continue;
    const identity = {
      kind,
      source_id: request.source_id,
      source_line: index + 1,
      text,
    };
    atoms.push({
      ordinal: atoms.length + 1,
      kind,
      source_line: index + 1,
      text,
      semantic_digest: sha256Digest(canonicalJson(identity)),
    });
  }
  return atoms;
}

export function createSourceAtomizationScrumRequest(
  input: Omit<
    SourceAtomizationScrumRequestV1,
    "schema_version" | "capability_class" | "capability_id" | "source_digest" | "proposal_only"
  >,
): SourceAtomizationScrumRequestV1 {
  return {
    schema_version: "helix-source-atomization-request.v1",
    capability_class: "source_atomization",
    capability_id: SOURCE_ATOMIZATION_SCRUM_CAPABILITY_ID,
    ...input,
    source_digest: sha256Digest(input.markdown),
    proposal_only: true,
  };
}

export function validateSourceAtomizationScrumJsonLines(
  requestInput: unknown,
  stdout: string,
  maxLineBytes = 1_048_576,
): SourceAtomizationWorkerValidation {
  if (hasAuthorityField(requestInput)) return { ok: false, code: "HIL_PYTHON_AUTHORITY_BYPASS" };
  const requestResult = sourceAtomizationScrumRequestSchema.safeParse(requestInput);
  if (!requestResult.success) return { ok: false, code: "HIL_WORKER_RESULT_SCHEMA_INVALID" };
  const request = requestResult.data;
  if (request.source_digest !== sha256Digest(request.markdown)) {
    return { ok: false, code: "HIL_WORKER_PAYLOAD_DIGEST_MISMATCH" };
  }
  if (!stdout.endsWith("\n") || stdout.includes("\r") || stdout.startsWith("\uFEFF")) {
    return { ok: false, code: "HIL_WORKER_JSON_INVALID" };
  }
  const lines = stdout.slice(0, -1).split("\n");
  if (lines.length !== 2 || lines.some((line) => line.length === 0)) {
    return { ok: false, code: "HIL_IPC_FAIL_OPEN" };
  }
  if (lines.some((line) => Buffer.byteLength(line, "utf8") > maxLineBytes)) {
    return { ok: false, code: "HIL_WORKER_PAYLOAD_OVERSIZE" };
  }
  let rawProposal: unknown;
  let rawComplete: unknown;
  try {
    rawProposal = JSON.parse(lines[0]);
    rawComplete = JSON.parse(lines[1]);
  } catch {
    return { ok: false, code: "HIL_WORKER_JSON_INVALID" };
  }
  // Canonical encoding is part of the strict JSONL contract. Besides removing
  // representation ambiguity, this rejects duplicate keys because JSON.parse
  // cannot otherwise expose them to the schema validator.
  if (canonicalJson(rawProposal) !== lines[0] || canonicalJson(rawComplete) !== lines[1]) {
    return { ok: false, code: "HIL_WORKER_JSON_INVALID" };
  }
  if (hasAuthorityField(rawProposal) || hasAuthorityField(rawComplete)) {
    return { ok: false, code: "HIL_PYTHON_AUTHORITY_BYPASS" };
  }
  const proposalResult = sourceAtomizationScrumProposalSchema.safeParse(rawProposal);
  const completeResult = sourceAtomizationScrumCompleteSchema.safeParse(rawComplete);
  if (!proposalResult.success || !completeResult.success) {
    return { ok: false, code: "HIL_WORKER_RESULT_SCHEMA_INVALID" };
  }
  const proposal = proposalResult.data;
  const complete = completeResult.data;
  const expectedAtoms = atomizeScrumMarkdown(request);
  const proposalBody = { ...proposal, proposal_digest: undefined };
  delete proposalBody.proposal_digest;
  const expectedProposalDigest = sha256Digest(canonicalJson(proposalBody));
  if (
    proposal.request_id !== request.request_id ||
    proposal.source_id !== request.source_id ||
    proposal.source_digest !== request.source_digest ||
    canonicalJson(proposal.atoms) !== canonicalJson(expectedAtoms) ||
    proposal.proposal_digest !== expectedProposalDigest ||
    complete.request_id !== request.request_id ||
    complete.atom_count !== proposal.atoms.length ||
    complete.proposal_digest !== proposal.proposal_digest
  ) {
    return { ok: false, code: "HIL_WORKER_PAYLOAD_DIGEST_MISMATCH" };
  }
  return { ok: true, proposal, complete };
}

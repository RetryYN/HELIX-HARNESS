import { canonicalJson, type Sha256Digest, sha256Digest } from "./digest";

const MAX_OUTPUT_BYTES = 1024 * 1024;
const MAX_JSON_DEPTH = 64;
const MAX_JSON_NODES = 4_096;
const MAX_SCHEMA_DEPTH = 32;
const MAX_SCHEMA_NODES = 512;
const MAX_SCHEMA_PROPERTIES = 256;

type OutputSchemaNode =
  | {
      type: "object";
      properties: Readonly<Record<string, OutputSchemaNode>>;
      required: readonly string[];
      additional_properties: false;
    }
  | { type: "array"; items: OutputSchemaNode; min: number; max: number }
  | { type: "string"; min: number; max: number }
  | { type: "number"; integer: boolean; min: number; max: number }
  | { type: "boolean" }
  | { type: "null" }
  | { type: "literal"; value: string | number | boolean | null };

interface KnownOutputSchemaV1 {
  schema_language: "helix-worker-output-ast.v1";
  evaluator_semantics: "helix-worker-output-evaluator.v1";
  canonical_encoding: "canonical-json-exact.v1";
  dynamic_binding_policy: readonly ["descriptor_digest", "output_schema_digest", "payload_digest"];
  envelope_ast: OutputSchemaNode;
}

export type WorkerOutputFailureCode =
  | "WORKER_OUTPUT_SCHEMA_UNRESOLVED"
  | "WORKER_OUTPUT_OVERSIZE"
  | "WORKER_OUTPUT_UTF8_INVALID"
  | "WORKER_OUTPUT_NONCANONICAL"
  | "WORKER_OUTPUT_SCHEMA_INVALID"
  | "WORKER_OUTPUT_DIGEST_MISMATCH";

export interface WorkerOutputBinding {
  descriptor_digest: Sha256Digest;
  output_schema_digest: Sha256Digest;
}

export interface WorkerValidatedOutputCapability {
  readonly kind: "worker_validated_output";
  readonly descriptor_digest: Sha256Digest;
  readonly output_schema_digest: Sha256Digest;
  readonly payload_digest: Sha256Digest;
}

export type WorkerOutputAdmissionResult =
  | { ok: true; output: WorkerValidatedOutputCapability }
  | { ok: false; failure_code: WorkerOutputFailureCode };

const digestNode: OutputSchemaNode = { type: "string", min: 71, max: 71 };
const proposalPayloadNode: OutputSchemaNode = {
  type: "object",
  properties: {
    proposal_only: { type: "literal", value: true },
    schema_version: { type: "literal", value: "helix-worker-proposal.v1" },
    summary: { type: "string", min: 1, max: 20_000 },
  },
  required: ["proposal_only", "schema_version", "summary"],
  additional_properties: false,
};

const proposalSchema: KnownOutputSchemaV1 = {
  schema_language: "helix-worker-output-ast.v1",
  evaluator_semantics: "helix-worker-output-evaluator.v1",
  canonical_encoding: "canonical-json-exact.v1",
  dynamic_binding_policy: ["descriptor_digest", "output_schema_digest", "payload_digest"],
  envelope_ast: {
    type: "object",
    properties: {
      descriptor_digest: digestNode,
      output_schema_digest: digestNode,
      payload: proposalPayloadNode,
      payload_digest: digestNode,
      schema_version: { type: "literal", value: "helix-worker-output-envelope.v1" },
    },
    required: [
      "descriptor_digest",
      "output_schema_digest",
      "payload",
      "payload_digest",
      "schema_version",
    ],
    additional_properties: false,
  },
};

const blindEvaluationPayloadNode: OutputSchemaNode = {
  type: "object",
  properties: {
    observation: {
      type: "object",
      properties: {
        duration_ms: { type: "number", integer: true, min: 0, max: Number.MAX_SAFE_INTEGER },
        retry_count: { type: "number", integer: true, min: 0, max: Number.MAX_SAFE_INTEGER },
        token_count: { type: "number", integer: true, min: 0, max: Number.MAX_SAFE_INTEGER },
      },
      required: ["duration_ms", "retry_count", "token_count"],
      additional_properties: false,
    },
    packet_digest: digestNode,
    schema_version: { type: "literal", value: "helix-worker-blind-evaluation.v1" },
    scores: {
      type: "array",
      items: {
        type: "object",
        properties: {
          dimension_id: { type: "string", min: 1, max: 128 },
          score: { type: "number", integer: false, min: 0, max: Number.MAX_SAFE_INTEGER },
        },
        required: ["dimension_id", "score"],
        additional_properties: false,
      },
      min: 1,
      max: 256,
    },
  },
  required: ["observation", "packet_digest", "schema_version", "scores"],
  additional_properties: false,
};

const blindEvaluationSchema: KnownOutputSchemaV1 = {
  schema_language: "helix-worker-output-ast.v1",
  evaluator_semantics: "helix-worker-output-evaluator.v1",
  canonical_encoding: "canonical-json-exact.v1",
  dynamic_binding_policy: ["descriptor_digest", "output_schema_digest", "payload_digest"],
  envelope_ast: {
    type: "object",
    properties: {
      descriptor_digest: digestNode,
      output_schema_digest: digestNode,
      payload: blindEvaluationPayloadNode,
      payload_digest: digestNode,
      schema_version: { type: "literal", value: "helix-worker-output-envelope.v1" },
    },
    required: [
      "descriptor_digest",
      "output_schema_digest",
      "payload",
      "payload_digest",
      "schema_version",
    ],
    additional_properties: false,
  },
};

function schemaDigest(schema: KnownOutputSchemaV1): Sha256Digest {
  return sha256Digest(canonicalJson(schema));
}

export const WORKER_PROPOSAL_OUTPUT_SCHEMA_DIGEST = schemaDigest(proposalSchema);
export const WORKER_BLIND_EVALUATION_OUTPUT_SCHEMA_DIGEST = schemaDigest(blindEvaluationSchema);

const knownOutputSchemas = new Map<Sha256Digest, KnownOutputSchemaV1>([
  [WORKER_PROPOSAL_OUTPUT_SCHEMA_DIGEST, proposalSchema],
  [WORKER_BLIND_EVALUATION_OUTPUT_SCHEMA_DIGEST, blindEvaluationSchema],
]);
const validatedOutputs = new WeakSet<WorkerValidatedOutputCapability>();
const validatedPayloads = new WeakMap<WorkerValidatedOutputCapability, string>();

function failure(failure_code: WorkerOutputFailureCode): WorkerOutputAdmissionResult {
  return { ok: false, failure_code };
}

function validDigest(value: unknown): value is Sha256Digest {
  return typeof value === "string" && /^sha256:[a-f0-9]{64}$/u.test(value);
}

function validateSchemaDefinition(
  node: OutputSchemaNode,
  state = { depth: 0, nodes: 0, properties: 0 },
): boolean {
  state.nodes += 1;
  if (state.depth > MAX_SCHEMA_DEPTH || state.nodes > MAX_SCHEMA_NODES) return false;
  if (node.type === "object") {
    const keys = Object.keys(node.properties);
    state.properties += keys.length;
    if (
      state.properties > MAX_SCHEMA_PROPERTIES ||
      new Set(node.required).size !== node.required.length ||
      node.required.some((key) => !keys.includes(key))
    ) {
      return false;
    }
    for (const child of Object.values(node.properties)) {
      state.depth += 1;
      const valid = validateSchemaDefinition(child, state);
      state.depth -= 1;
      if (!valid) return false;
    }
  } else if (node.type === "array") {
    if (!Number.isSafeInteger(node.min) || !Number.isSafeInteger(node.max) || node.min > node.max)
      return false;
    state.depth += 1;
    const valid = validateSchemaDefinition(node.items, state);
    state.depth -= 1;
    if (!valid) return false;
  } else if (node.type === "string") {
    if (!Number.isSafeInteger(node.min) || !Number.isSafeInteger(node.max) || node.min > node.max)
      return false;
  } else if (node.type === "number") {
    if (!Number.isFinite(node.min) || !Number.isFinite(node.max) || node.min > node.max)
      return false;
  }
  return true;
}

function boundedLexicalJson(text: string): boolean {
  let depth = 0;
  let nodes = 0;
  let inString = false;
  let escaped = false;
  for (const char of text) {
    if (inString) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === '"') inString = false;
      continue;
    }
    if (char === '"') inString = true;
    else if (char === "{" || char === "[") {
      depth += 1;
      nodes += 1;
      if (depth > MAX_JSON_DEPTH || nodes > MAX_JSON_NODES) return false;
    } else if (char === "}" || char === "]") {
      depth -= 1;
      if (depth < 0) return false;
    } else if (char === ",") {
      nodes += 1;
      if (nodes > MAX_JSON_NODES) return false;
    }
  }
  return !inString && !escaped && depth === 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validateValue(
  node: OutputSchemaNode,
  value: unknown,
  state = { depth: 0, nodes: 0 },
): boolean {
  state.nodes += 1;
  if (state.depth > MAX_JSON_DEPTH || state.nodes > MAX_JSON_NODES) return false;
  if (node.type === "literal") return Object.is(value, node.value);
  if (node.type === "null") return value === null;
  if (node.type === "boolean") return typeof value === "boolean";
  if (node.type === "string")
    return typeof value === "string" && value.length >= node.min && value.length <= node.max;
  if (node.type === "number")
    return (
      typeof value === "number" &&
      Number.isFinite(value) &&
      (!node.integer || Number.isSafeInteger(value)) &&
      value >= node.min &&
      value <= node.max
    );
  if (node.type === "array") {
    if (!Array.isArray(value) || value.length < node.min || value.length > node.max) return false;
    for (const item of value) {
      state.depth += 1;
      const valid = validateValue(node.items, item, state);
      state.depth -= 1;
      if (!valid) return false;
    }
    return true;
  }
  if (!isRecord(value)) return false;
  const keys = Object.keys(value);
  const allowed = Object.keys(node.properties);
  if (keys.some((key) => !allowed.includes(key)) || node.required.some((key) => !(key in value)))
    return false;
  for (const key of keys) {
    const child = node.properties[key];
    if (!child) return false;
    state.depth += 1;
    const valid = validateValue(child, value[key], state);
    state.depth -= 1;
    if (!valid) return false;
  }
  return true;
}

export function formatWorkerOutputContract(
  outputSchemaDigest: Sha256Digest,
  descriptorDigest: Sha256Digest,
): string {
  const schema = knownOutputSchemas.get(outputSchemaDigest);
  if (!schema || !validDigest(descriptorDigest)) return "";
  return [
    "<HELIX_WORKER_OUTPUT_CONTRACT>",
    canonicalJson({
      schema_version: "helix-worker-output-contract.v1",
      descriptor_digest: descriptorDigest,
      output_schema_digest: outputSchemaDigest,
      output_schema: schema,
      relaxation_count: 0,
    }),
    "</HELIX_WORKER_OUTPUT_CONTRACT>",
  ].join("\n");
}

export function hasWorkerOutputContract(
  stdin: string | undefined,
  binding: WorkerOutputBinding,
): boolean {
  const contract = formatWorkerOutputContract(
    binding.output_schema_digest,
    binding.descriptor_digest,
  );
  return contract.length > 0 && typeof stdin === "string" && stdin.includes(contract);
}

export function admitWorkerOutput(
  raw: string | Buffer,
  binding: WorkerOutputBinding,
): WorkerOutputAdmissionResult {
  const schema = knownOutputSchemas.get(binding.output_schema_digest);
  if (!schema || schemaDigest(schema) !== binding.output_schema_digest)
    return failure("WORKER_OUTPUT_SCHEMA_UNRESOLVED");
  if (!validateSchemaDefinition(schema.envelope_ast))
    return failure("WORKER_OUTPUT_SCHEMA_UNRESOLVED");
  const bytes = typeof raw === "string" ? Buffer.from(raw, "utf8") : raw;
  if (bytes.byteLength === 0 || bytes.byteLength > MAX_OUTPUT_BYTES)
    return failure("WORKER_OUTPUT_OVERSIZE");
  if (bytes.byteLength >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf)
    return failure("WORKER_OUTPUT_NONCANONICAL");
  let text: string;
  try {
    text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    return failure("WORKER_OUTPUT_UTF8_INVALID");
  }
  if (!boundedLexicalJson(text)) return failure("WORKER_OUTPUT_OVERSIZE");
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return failure("WORKER_OUTPUT_SCHEMA_INVALID");
  }
  if (canonicalJson(parsed) !== text) return failure("WORKER_OUTPUT_NONCANONICAL");
  if (!validateValue(schema.envelope_ast, parsed)) return failure("WORKER_OUTPUT_SCHEMA_INVALID");
  if (!isRecord(parsed) || !isRecord(parsed.payload))
    return failure("WORKER_OUTPUT_SCHEMA_INVALID");
  if (
    parsed.descriptor_digest !== binding.descriptor_digest ||
    parsed.output_schema_digest !== binding.output_schema_digest
  ) {
    return failure("WORKER_OUTPUT_DIGEST_MISMATCH");
  }
  const payloadText = canonicalJson(parsed.payload);
  const payloadDigest = sha256Digest(payloadText);
  if (!validDigest(parsed.payload_digest) || parsed.payload_digest !== payloadDigest)
    return failure("WORKER_OUTPUT_DIGEST_MISMATCH");
  const output = Object.freeze({
    kind: "worker_validated_output" as const,
    descriptor_digest: binding.descriptor_digest,
    output_schema_digest: binding.output_schema_digest,
    payload_digest: payloadDigest,
  });
  validatedOutputs.add(output);
  validatedPayloads.set(output, payloadText);
  return { ok: true, output };
}

export function isWorkerValidatedOutput(value: unknown): value is WorkerValidatedOutputCapability {
  return (
    isRecord(value) && validatedOutputs.has(value as unknown as WorkerValidatedOutputCapability)
  );
}

export function readValidatedWorkerPayload(
  output: WorkerValidatedOutputCapability,
): string | undefined {
  return validatedOutputs.has(output) ? validatedPayloads.get(output) : undefined;
}

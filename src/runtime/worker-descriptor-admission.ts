import { z } from "zod";
import { canonicalJson, type Sha256Digest, sha256Digest } from "./digest";
import {
  SPECIALIST_AGENT_REGISTRY_VERSION,
  type SpecialistAgentRegistryEntry,
  specialistAgentRegistryEntrySchema,
} from "./specialist-agent-registry";

export const WORKER_CAPABILITY_CLASSES = [
  "implementation",
  "verification",
  "research",
  "benchmark",
  "semantic_core",
] as const;

export type WorkerCapabilityClassV1 = (typeof WORKER_CAPABILITY_CLASSES)[number];
export type WorkerDescriptorFailureCode =
  | "WORKER_DESCRIPTOR_INVALID"
  | "WORKER_DESCRIPTOR_NOT_FOUND"
  | "WORKER_DESCRIPTOR_AMBIGUOUS"
  | "WORKER_DESCRIPTOR_INACTIVE"
  | "WORKER_DESCRIPTOR_CAPABILITY_MISMATCH"
  | "WORKER_DESCRIPTOR_DIGEST_MISMATCH"
  | "WORKER_ADMISSION_DECISION_STALE";

export type WorkerDescriptorResult<T> =
  | { ok: true; value: T }
  | { ok: false; failureCodes: WorkerDescriptorFailureCode[] };

const digestSchema = z.custom<Sha256Digest>(
  (value) => typeof value === "string" && /^sha256:[a-f0-9]{64}$/.test(value),
  "invalid sha256 digest",
);
const idSchema = z.string().regex(/^[a-z0-9][a-z0-9-]*$/);
const contractVersionSchema = z.string().regex(/^[1-9][0-9]*\.[0-9]+\.[0-9]+$/);
const capabilitySchema = z.enum(WORKER_CAPABILITY_CLASSES);

const descriptorPayloadSchema = z
  .object({
    schema_version: z.literal("helix-worker-descriptor.v1"),
    agent_id: idSchema,
    contract_version: contractVersionSchema,
    provider: idSchema,
    capability_class: capabilitySchema,
    input_schema_digest: digestSchema,
    output_schema_digest: digestSchema,
  })
  .strict();

const descriptorSchema = descriptorPayloadSchema
  .extend({ descriptor_digest: digestSchema })
  .strict();

const requestSchema = z
  .object({
    agent_id: idSchema,
    contract_version: contractVersionSchema,
    capability_class: capabilitySchema,
  })
  .strict();

const sourceRegistrySchema = z.enum(["specialist_agent", "python_worker"]);

const registryEntrySchema = z
  .object({
    descriptor: descriptorSchema,
    status: z.enum(["active", "inactive"]),
    source_registry: sourceRegistrySchema,
    source_schema_version: z.string().regex(/^[a-z0-9][a-z0-9.-]*$/),
    source_record: z.unknown(),
    source_record_digest: digestSchema,
    source_entry_digest: digestSchema,
  })
  .strict();

const specialistProjectionSchema = z
  .object({
    schema_version: z.literal("helix-specialist-worker-projection.v1"),
    source_entry: specialistAgentRegistryEntrySchema,
    contract_version: contractVersionSchema,
    capability_class: capabilitySchema,
    input_schema_digest: digestSchema,
    output_schema_digest: digestSchema,
    status: z.enum(["active", "inactive"]),
  })
  .strict();

const pythonSourceEntrySchema = z
  .object({
    schema_version: z.literal("helix-python-worker-descriptor.v1"),
    worker_id: idSchema,
    worker_version: contractVersionSchema,
    provider: idSchema,
    capability_class: idSchema,
    request_schema: z.string().min(1),
    result_schema: z.string().min(1),
  })
  .strict();

const pythonProjectionSchema = z
  .object({
    schema_version: z.literal("helix-python-worker-projection.v1"),
    source_entry: pythonSourceEntrySchema,
    mapped_capability_class: capabilitySchema,
    input_schema_digest: digestSchema,
    output_schema_digest: digestSchema,
    status: z.enum(["active", "inactive"]),
  })
  .strict();

export type WorkerDescriptorPayloadV1 = z.infer<typeof descriptorPayloadSchema>;
export type WorkerDescriptorV1 = z.infer<typeof descriptorSchema>;
export type WorkerDescriptorRequestV1 = z.infer<typeof requestSchema>;
export type WorkerRegistryEntryV1 = z.infer<typeof registryEntrySchema>;

export interface WorkerRegistrySnapshotV1 {
  revision: number;
  registry_digest: Sha256Digest;
  entries: readonly WorkerRegistryEntryV1[];
}

export interface WorkerDescriptorAdmissionDecisionV1 {
  schema_version: "helix-worker-descriptor-admission.v1";
  disposition: "admitted" | "rejected";
  request: WorkerDescriptorRequestV1;
  registry_revision: number;
  registry_digest: Sha256Digest;
  descriptor_digest: Sha256Digest | null;
  source_entry_digest: Sha256Digest | null;
  reason_codes: readonly WorkerDescriptorFailureCode[];
  decision_digest: Sha256Digest;
}

const failureOrder: readonly WorkerDescriptorFailureCode[] = [
  "WORKER_DESCRIPTOR_INVALID",
  "WORKER_DESCRIPTOR_NOT_FOUND",
  "WORKER_DESCRIPTOR_AMBIGUOUS",
  "WORKER_DESCRIPTOR_INACTIVE",
  "WORKER_DESCRIPTOR_CAPABILITY_MISMATCH",
  "WORKER_DESCRIPTOR_DIGEST_MISMATCH",
  "WORKER_ADMISSION_DECISION_STALE",
];

function failures(...codes: WorkerDescriptorFailureCode[]): WorkerDescriptorFailureCode[] {
  const set = new Set(codes);
  return failureOrder.filter((code) => set.has(code));
}

function descriptorPayload(value: WorkerDescriptorV1): WorkerDescriptorPayloadV1 {
  const { descriptor_digest: _digest, ...payload } = value;
  return payload;
}

function withDescriptorDigest(payload: WorkerDescriptorPayloadV1): WorkerDescriptorV1 {
  return {
    ...payload,
    descriptor_digest: sha256Digest(canonicalJson(payload)),
  };
}

function sourceEntryPayload(entry: Omit<WorkerRegistryEntryV1, "source_entry_digest">) {
  return {
    schema_version: "helix-worker-source-entry.v1" as const,
    source_registry: entry.source_registry,
    source_schema_version: entry.source_schema_version,
    source_record_digest: entry.source_record_digest,
    status: entry.status,
    descriptor_digest: entry.descriptor.descriptor_digest,
  };
}

function withSourceEntryDigest(
  entry: Omit<WorkerRegistryEntryV1, "source_entry_digest">,
): WorkerRegistryEntryV1 {
  return {
    ...entry,
    source_entry_digest: sha256Digest(canonicalJson(sourceEntryPayload(entry))),
  };
}

function validateDescriptor(value: WorkerDescriptorV1): WorkerDescriptorFailureCode[] {
  return value.descriptor_digest === sha256Digest(canonicalJson(descriptorPayload(value)))
    ? []
    : ["WORKER_DESCRIPTOR_DIGEST_MISMATCH"];
}

function validateEntry(value: WorkerRegistryEntryV1): WorkerDescriptorFailureCode[] {
  const { source_entry_digest: _digest, ...payload } = value;
  let sourceIdentityValid = false;
  let sourceRecordDigestValid = false;
  if (value.source_registry === "specialist_agent") {
    const sourceParsed = specialistAgentRegistryEntrySchema.safeParse(value.source_record);
    if (sourceParsed.success) {
      sourceIdentityValid =
        sourceParsed.data.agent_id === value.descriptor.agent_id &&
        sourceParsed.data.runtime === value.descriptor.provider &&
        value.source_schema_version === SPECIALIST_AGENT_REGISTRY_VERSION;
      sourceRecordDigestValid =
        value.source_record_digest === sha256Digest(canonicalJson(sourceParsed.data));
    }
  } else {
    const sourceParsed = pythonSourceEntrySchema.safeParse(value.source_record);
    if (sourceParsed.success) {
      sourceIdentityValid =
        sourceParsed.data.worker_id === value.descriptor.agent_id &&
        sourceParsed.data.worker_version === value.descriptor.contract_version &&
        sourceParsed.data.provider === value.descriptor.provider &&
        value.source_schema_version === sourceParsed.data.schema_version;
      sourceRecordDigestValid =
        value.source_record_digest === sha256Digest(canonicalJson(sourceParsed.data));
    }
  }
  return failures(
    ...(!sourceIdentityValid ? (["WORKER_DESCRIPTOR_INVALID"] as const) : []),
    ...validateDescriptor(value.descriptor),
    ...(!sourceRecordDigestValid ? (["WORKER_DESCRIPTOR_DIGEST_MISMATCH"] as const) : []),
    ...(value.source_entry_digest === sha256Digest(canonicalJson(sourceEntryPayload(payload)))
      ? []
      : (["WORKER_DESCRIPTOR_DIGEST_MISMATCH"] as const)),
  );
}

export function parseWorkerDescriptor(raw: unknown): WorkerDescriptorResult<WorkerDescriptorV1> {
  const parsed = descriptorSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, failureCodes: ["WORKER_DESCRIPTOR_INVALID"] };
  const digestFailures = validateDescriptor(parsed.data);
  return digestFailures.length > 0
    ? { ok: false, failureCodes: digestFailures }
    : { ok: true, value: parsed.data };
}

export function projectSpecialistAgentEntry(
  raw: unknown,
): WorkerDescriptorResult<WorkerRegistryEntryV1> {
  const parsed = specialistProjectionSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, failureCodes: ["WORKER_DESCRIPTOR_INVALID"] };
  const source = parsed.data.source_entry as SpecialistAgentRegistryEntry;
  const descriptor = withDescriptorDigest({
    schema_version: "helix-worker-descriptor.v1",
    agent_id: source.agent_id,
    contract_version: parsed.data.contract_version,
    provider: source.runtime,
    capability_class: parsed.data.capability_class,
    input_schema_digest: parsed.data.input_schema_digest,
    output_schema_digest: parsed.data.output_schema_digest,
  });
  return {
    ok: true,
    value: withSourceEntryDigest({
      descriptor,
      status: parsed.data.status,
      source_registry: "specialist_agent",
      source_schema_version: SPECIALIST_AGENT_REGISTRY_VERSION,
      source_record: source,
      source_record_digest: sha256Digest(canonicalJson(source)),
    }),
  };
}

export function projectPythonWorkerEntry(
  raw: unknown,
): WorkerDescriptorResult<WorkerRegistryEntryV1> {
  const parsed = pythonProjectionSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, failureCodes: ["WORKER_DESCRIPTOR_INVALID"] };
  const source = parsed.data.source_entry;
  const descriptor = withDescriptorDigest({
    schema_version: "helix-worker-descriptor.v1",
    agent_id: source.worker_id,
    contract_version: source.worker_version,
    provider: source.provider,
    capability_class: parsed.data.mapped_capability_class,
    input_schema_digest: parsed.data.input_schema_digest,
    output_schema_digest: parsed.data.output_schema_digest,
  });
  return {
    ok: true,
    value: withSourceEntryDigest({
      descriptor,
      status: parsed.data.status,
      source_registry: "python_worker",
      source_schema_version: source.schema_version,
      source_record: source,
      source_record_digest: sha256Digest(canonicalJson(source)),
    }),
  };
}

function entrySortKey(entry: WorkerRegistryEntryV1): string {
  return [
    entry.descriptor.agent_id,
    entry.descriptor.contract_version,
    entry.descriptor.capability_class,
    entry.descriptor.descriptor_digest,
    entry.source_registry,
  ].join("\0");
}

export function canonicalizeWorkerRegistrySnapshot(
  entries: readonly WorkerRegistryEntryV1[],
  revision: number,
): WorkerDescriptorResult<WorkerRegistrySnapshotV1> {
  const codes: WorkerDescriptorFailureCode[] = [];
  if (!Number.isSafeInteger(revision) || revision < 1) codes.push("WORKER_DESCRIPTOR_INVALID");
  const parsedEntries: WorkerRegistryEntryV1[] = [];
  for (const entry of entries) {
    const parsed = registryEntrySchema.safeParse(entry);
    if (!parsed.success) {
      codes.push("WORKER_DESCRIPTOR_INVALID");
      continue;
    }
    parsedEntries.push(parsed.data);
    codes.push(...validateEntry(parsed.data));
  }
  const orderedFailures = failures(...codes);
  if (orderedFailures.length > 0) return { ok: false, failureCodes: orderedFailures };
  const orderedEntries = [...parsedEntries].sort((left, right) =>
    Buffer.from(entrySortKey(left)).compare(Buffer.from(entrySortKey(right))),
  );
  const digestPayload = {
    schema_version: "helix-worker-registry-snapshot.v1",
    revision,
    entries: orderedEntries,
  };
  return {
    ok: true,
    value: {
      revision,
      registry_digest: sha256Digest(canonicalJson(digestPayload)),
      entries: orderedEntries,
    },
  };
}

function validateSnapshot(snapshot: WorkerRegistrySnapshotV1): WorkerDescriptorFailureCode[] {
  const rebuilt = canonicalizeWorkerRegistrySnapshot(snapshot.entries, snapshot.revision);
  if (!rebuilt.ok) return rebuilt.failureCodes;
  return rebuilt.value.registry_digest === snapshot.registry_digest
    ? []
    : ["WORKER_DESCRIPTOR_DIGEST_MISMATCH"];
}

export function resolveWorkerDescriptor(
  request: WorkerDescriptorRequestV1,
  snapshot: WorkerRegistrySnapshotV1,
): WorkerDescriptorResult<WorkerRegistryEntryV1> {
  if (!requestSchema.safeParse(request).success) {
    return { ok: false, failureCodes: ["WORKER_DESCRIPTOR_INVALID"] };
  }
  const snapshotFailures = validateSnapshot(snapshot);
  if (snapshotFailures.length > 0) return { ok: false, failureCodes: snapshotFailures };
  const identityMatches = snapshot.entries.filter(
    (entry) =>
      entry.descriptor.agent_id === request.agent_id &&
      entry.descriptor.contract_version === request.contract_version,
  );
  if (identityMatches.length === 0) {
    return { ok: false, failureCodes: ["WORKER_DESCRIPTOR_NOT_FOUND"] };
  }
  if (identityMatches.length > 1) {
    return { ok: false, failureCodes: ["WORKER_DESCRIPTOR_AMBIGUOUS"] };
  }
  const match = identityMatches[0];
  if (match.status !== "active") {
    return { ok: false, failureCodes: ["WORKER_DESCRIPTOR_INACTIVE"] };
  }
  if (match.descriptor.capability_class !== request.capability_class) {
    return { ok: false, failureCodes: ["WORKER_DESCRIPTOR_CAPABILITY_MISMATCH"] };
  }
  return { ok: true, value: match };
}

function makeDecision(
  request: WorkerDescriptorRequestV1,
  snapshot: WorkerRegistrySnapshotV1,
  resolved: WorkerDescriptorResult<WorkerRegistryEntryV1>,
): WorkerDescriptorAdmissionDecisionV1 {
  const value = resolved.ok ? resolved.value : null;
  const payload = {
    schema_version: "helix-worker-descriptor-admission.v1" as const,
    disposition: resolved.ok ? ("admitted" as const) : ("rejected" as const),
    request,
    registry_revision: snapshot.revision,
    registry_digest: snapshot.registry_digest,
    descriptor_digest: value?.descriptor.descriptor_digest ?? null,
    source_entry_digest: value?.source_entry_digest ?? null,
    reason_codes: resolved.ok ? [] : resolved.failureCodes,
  };
  return { ...payload, decision_digest: sha256Digest(canonicalJson(payload)) };
}

export function evaluateWorkerDescriptorAdmission(
  request: WorkerDescriptorRequestV1,
  snapshot: WorkerRegistrySnapshotV1,
): WorkerDescriptorAdmissionDecisionV1 {
  return makeDecision(request, snapshot, resolveWorkerDescriptor(request, snapshot));
}

export function isWorkerAdmissionCurrent(
  decision: WorkerDescriptorAdmissionDecisionV1,
  request: WorkerDescriptorRequestV1,
  snapshot: WorkerRegistrySnapshotV1,
): boolean {
  const current = evaluateWorkerDescriptorAdmission(request, snapshot);
  return current.decision_digest === decision.decision_digest;
}

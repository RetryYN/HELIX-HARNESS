import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { canonicalJson, sha256Digest } from "../src/runtime/digest";
import {
  canonicalizeWorkerRegistrySnapshot,
  evaluateWorkerDescriptorAdmission,
  isWorkerAdmissionCurrent,
  parseWorkerDescriptor,
  projectPythonWorkerEntry,
  projectSpecialistAgentEntry,
  resolveWorkerDescriptor,
  type WorkerDescriptorV1,
  type WorkerRegistryEntryV1,
} from "../src/runtime/worker-descriptor-admission";

// PLAN-L7-497-worker-descriptor-admission

const digest = (seed: string) => sha256Digest(seed);

function descriptor(overrides: Partial<WorkerDescriptorV1> = {}): WorkerDescriptorV1 {
  const payload = {
    schema_version: "helix-worker-descriptor.v1" as const,
    agent_id: "kimi-worker",
    contract_version: "1.0.0",
    provider: "kimi",
    capability_class: "implementation" as const,
    input_schema_digest: digest("input"),
    output_schema_digest: digest("output"),
    ...overrides,
  };
  const { descriptor_digest: _ignored, ...digestPayload } = payload as WorkerDescriptorV1;
  return {
    ...digestPayload,
    descriptor_digest: sha256Digest(canonicalJson(digestPayload)),
    ...(overrides.descriptor_digest ? { descriptor_digest: overrides.descriptor_digest } : {}),
  };
}

function registryEntry(
  value = descriptor(),
  overrides: Partial<WorkerRegistryEntryV1> = {},
): WorkerRegistryEntryV1 {
  const defaultSourceRecord = {
    schema_version: "helix-python-worker-descriptor.v1" as const,
    worker_id: value.agent_id,
    worker_version: value.contract_version,
    provider: value.provider,
    capability_class: "analysis",
    request_schema: "worker-request.v1",
    result_schema: "worker-result.v1",
  };
  const payload = {
    descriptor: value,
    status: "active" as const,
    source_registry: "python_worker" as const,
    source_schema_version: "helix-python-worker-descriptor.v1",
    source_record: defaultSourceRecord,
    ...overrides,
  };
  const sourceRecordDigest =
    overrides.source_record_digest ?? sha256Digest(canonicalJson(payload.source_record));
  const digestPayload = {
    schema_version: "helix-worker-source-entry.v1",
    source_registry: payload.source_registry,
    source_schema_version: payload.source_schema_version,
    source_record_digest: sourceRecordDigest,
    status: payload.status,
    descriptor_digest: payload.descriptor.descriptor_digest,
  };
  const { source_entry_digest: _ignored, ...entryPayload } = payload;
  return {
    ...entryPayload,
    source_record_digest: sourceRecordDigest,
    source_entry_digest: sha256Digest(canonicalJson(digestPayload)),
    ...(overrides.source_entry_digest
      ? { source_entry_digest: overrides.source_entry_digest }
      : {}),
  };
}

const request = {
  agent_id: "kimi-worker",
  contract_version: "1.0.0",
  capability_class: "implementation" as const,
};

describe("WCC-FR-01 worker descriptor admission", () => {
  it("U-WDA-001: strict descriptorとversion境界を検証する", () => {
    expect(parseWorkerDescriptor(descriptor()).ok).toBe(true);
    expect(parseWorkerDescriptor({ ...descriptor(), extra: true }).ok).toBe(false);
    expect(parseWorkerDescriptor(descriptor({ contract_version: "0.29.2" })).ok).toBe(false);
    expect(parseWorkerDescriptor(descriptor({ agent_id: "Kimi" })).ok).toBe(false);
  });

  it("U-WDA-002: capability closed setだけを受理する", () => {
    for (const capability_class of [
      "implementation",
      "verification",
      "research",
      "benchmark",
      "semantic_core",
    ] as const) {
      expect(parseWorkerDescriptor(descriptor({ capability_class })).ok).toBe(true);
    }
    expect(parseWorkerDescriptor({ ...descriptor(), capability_class: "kimi" })).toMatchObject({
      ok: false,
      failureCodes: ["WORKER_DESCRIPTOR_INVALID"],
    });
  });

  it("U-WDA-003: descriptor digestはdigest field自身を除外して決定的にする", () => {
    const value = descriptor();
    expect(parseWorkerDescriptor(value)).toEqual({ ok: true, value });
    expect(
      parseWorkerDescriptor({
        ...value,
        descriptor_digest: sha256Digest(canonicalJson(value)),
      }),
    ).toMatchObject({ ok: false, failureCodes: ["WORKER_DESCRIPTOR_DIGEST_MISMATCH"] });
  });

  it("U-WDA-004: identityをexact解決してcapabilityを別検証する", () => {
    const snapshot = canonicalizeWorkerRegistrySnapshot([registryEntry()], 1);
    expect(snapshot.ok).toBe(true);
    if (!snapshot.ok) return;
    expect(resolveWorkerDescriptor(request, snapshot.value).ok).toBe(true);
    expect(
      resolveWorkerDescriptor({ ...request, contract_version: "1.0.1" }, snapshot.value),
    ).toMatchObject({ ok: false, failureCodes: ["WORKER_DESCRIPTOR_NOT_FOUND"] });
    expect(
      resolveWorkerDescriptor({ ...request, capability_class: "verification" }, snapshot.value),
    ).toMatchObject({
      ok: false,
      failureCodes: ["WORKER_DESCRIPTOR_CAPABILITY_MISMATCH"],
    });
  });

  it("U-WDA-005: 0件・複数・inactiveを区別して拒否する", () => {
    const empty = canonicalizeWorkerRegistrySnapshot([], 1);
    const duplicate = canonicalizeWorkerRegistrySnapshot([registryEntry(), registryEntry()], 1);
    const inactive = canonicalizeWorkerRegistrySnapshot(
      [registryEntry(descriptor(), { status: "inactive" })],
      1,
    );
    expect(empty.ok && resolveWorkerDescriptor(request, empty.value)).toMatchObject({
      ok: false,
      failureCodes: ["WORKER_DESCRIPTOR_NOT_FOUND"],
    });
    expect(duplicate.ok && resolveWorkerDescriptor(request, duplicate.value)).toMatchObject({
      ok: false,
      failureCodes: ["WORKER_DESCRIPTOR_AMBIGUOUS"],
    });
    expect(inactive.ok && resolveWorkerDescriptor(request, inactive.value)).toMatchObject({
      ok: false,
      failureCodes: ["WORKER_DESCRIPTOR_INACTIVE"],
    });
  });

  it("U-WDA-006: specialist sourceをread-only projectionする", () => {
    const sourceEntry = JSON.parse(readFileSync("config/specialist-agent-registry.json", "utf8"))
      .entries[0];
    const raw = Object.freeze({
      schema_version: "helix-specialist-worker-projection.v1",
      source_entry: sourceEntry,
      contract_version: "1.0.0",
      capability_class: "implementation",
      input_schema_digest: digest("specialist-input"),
      output_schema_digest: digest("specialist-output"),
      status: "active",
    });
    const before = canonicalJson(raw);
    const projected = projectSpecialistAgentEntry(raw);
    expect(projected).toMatchObject({
      ok: true,
      value: { descriptor: { agent_id: sourceEntry.agent_id, provider: "codex" } },
    });
    expect(canonicalJson(raw)).toBe(before);
    expect(projectSpecialistAgentEntry({ ...raw, inferred_capability: "implementation" }).ok).toBe(
      false,
    );
  });

  it("U-WDA-007: Python sourceを共通descriptorへread-only projectionする", () => {
    const raw = Object.freeze({
      schema_version: "helix-python-worker-projection.v1",
      source_entry: {
        schema_version: "helix-python-worker-descriptor.v1",
        worker_id: "python-semantic",
        worker_version: "1.2.0",
        provider: "python",
        capability_class: "analysis",
        request_schema: "semantic-request.v1",
        result_schema: "semantic-result.v1",
      },
      mapped_capability_class: "semantic_core",
      input_schema_digest: digest("python-input"),
      output_schema_digest: digest("python-output"),
      status: "active",
    });
    const before = canonicalJson(raw);
    expect(projectPythonWorkerEntry(raw)).toMatchObject({
      ok: true,
      value: {
        descriptor: {
          agent_id: "python-semantic",
          contract_version: "1.2.0",
          capability_class: "semantic_core",
        },
      },
    });
    expect(canonicalJson(raw)).toBe(before);
  });

  it("U-WDA-008: descriptor/source/snapshot digestの各driftを拒否する", () => {
    expect(
      canonicalizeWorkerRegistrySnapshot(
        [registryEntry(descriptor(), { source_entry_digest: digest("wrong-source") })],
        1,
      ),
    ).toMatchObject({ ok: false, failureCodes: ["WORKER_DESCRIPTOR_DIGEST_MISMATCH"] });
    expect(
      canonicalizeWorkerRegistrySnapshot(
        [registryEntry(descriptor(), { source_record_digest: digest("forged-record") })],
        1,
      ),
    ).toMatchObject({ ok: false, failureCodes: ["WORKER_DESCRIPTOR_DIGEST_MISMATCH"] });
    expect(
      canonicalizeWorkerRegistrySnapshot(
        [
          registryEntry(descriptor(), {
            source_record: {
              ...(registryEntry().source_record as Record<string, unknown>),
              worker_id: "other-worker",
            },
          }),
        ],
        1,
      ),
    ).toMatchObject({ ok: false, failureCodes: ["WORKER_DESCRIPTOR_INVALID"] });
    const snapshot = canonicalizeWorkerRegistrySnapshot([registryEntry()], 1);
    expect(snapshot.ok).toBe(true);
    if (!snapshot.ok) return;
    expect(
      resolveWorkerDescriptor(request, { ...snapshot.value, registry_digest: digest("drift") }),
    ).toMatchObject({ ok: false, failureCodes: ["WORKER_DESCRIPTOR_DIGEST_MISMATCH"] });
  });

  it("U-WDA-009: 全binding driftでdecisionをstaleにする", () => {
    const snapshot = canonicalizeWorkerRegistrySnapshot([registryEntry()], 1);
    expect(snapshot.ok).toBe(true);
    if (!snapshot.ok) return;
    const decision = evaluateWorkerDescriptorAdmission(request, snapshot.value);
    expect(isWorkerAdmissionCurrent(decision, request, snapshot.value)).toBe(true);
    const mismatchedRequest = { ...request, capability_class: "verification" as const };
    const rejected = evaluateWorkerDescriptorAdmission(mismatchedRequest, snapshot.value);
    const forged = {
      ...rejected,
      disposition: "admitted" as const,
      descriptor_digest: snapshot.value.entries[0]?.descriptor.descriptor_digest ?? null,
      source_entry_digest: snapshot.value.entries[0]?.source_entry_digest ?? null,
      reason_codes: [],
    };
    expect(isWorkerAdmissionCurrent(forged, mismatchedRequest, snapshot.value)).toBe(false);
    expect(
      isWorkerAdmissionCurrent(decision, { ...request, contract_version: "1.0.1" }, snapshot.value),
    ).toBe(false);
    const newer = canonicalizeWorkerRegistrySnapshot(snapshot.value.entries, 2);
    expect(newer.ok && isWorkerAdmissionCurrent(decision, request, newer.value)).toBe(false);
    const changedSource = canonicalizeWorkerRegistrySnapshot(
      [
        registryEntry(descriptor(), {
          source_record: {
            ...(registryEntry().source_record as Record<string, unknown>),
            result_schema: "worker-result.v2",
          },
        }),
      ],
      1,
    );
    expect(
      changedSource.ok && isWorkerAdmissionCurrent(decision, request, changedSource.value),
    ).toBe(false);
  });

  it("U-WDA-010: failureを固定順・重複なしで返す", () => {
    const broken = descriptor({ descriptor_digest: digest("broken") });
    const result = canonicalizeWorkerRegistrySnapshot(
      [registryEntry(broken, { source_entry_digest: digest("also-broken") })],
      0,
    );
    expect(result).toEqual({
      ok: false,
      failureCodes: ["WORKER_DESCRIPTOR_INVALID", "WORKER_DESCRIPTOR_DIGEST_MISMATCH"],
    });
  });

  it("U-WDA-011: entry入力順・locale・clockからdecision digestを隔離する", () => {
    const other = registryEntry(descriptor({ agent_id: "other-worker" }));
    const tiedDescriptor = descriptor({ agent_id: "tied-worker" });
    const tiedSource = registryEntry(tiedDescriptor).source_record as Record<string, unknown>;
    const tiedSourceA = registryEntry(tiedDescriptor, {
      source_record: {
        ...tiedSource,
        request_schema: "worker-request-A.v1",
      },
    });
    const tiedSourceB = registryEntry(tiedDescriptor, {
      source_record: {
        ...tiedSource,
        request_schema: "worker-request-B.v1",
      },
    });
    const left = canonicalizeWorkerRegistrySnapshot(
      [registryEntry(), tiedSourceA, other, tiedSourceB],
      1,
    );
    const right = canonicalizeWorkerRegistrySnapshot(
      [tiedSourceB, other, tiedSourceA, registryEntry()],
      1,
    );
    expect(left.ok && right.ok).toBe(true);
    if (!left.ok || !right.ok) return;
    expect(left.value.registry_digest).toBe(right.value.registry_digest);
    expect(evaluateWorkerDescriptorAdmission(request, left.value).decision_digest).toBe(
      evaluateWorkerDescriptorAdmission(request, right.value).decision_digest,
    );
  });

  it("U-WDA-012: wrapper/launch receipt責務をexportへ混載しない", async () => {
    const module = await import("../src/runtime/worker-descriptor-admission");
    expect(Object.keys(module).some((key) => /launch|spawn|receipt/i.test(key))).toBe(false);
  });

  it("U-WDA-013: 新registry/table/workflowを追加しないpure moduleにする", async () => {
    const source = await import("node:fs/promises").then(({ readFile }) =>
      readFile(new URL("../src/runtime/worker-descriptor-admission.ts", import.meta.url), "utf8"),
    );
    expect(source).not.toMatch(
      /node:(?:fs|child_process|net|http)|harness\.db|CREATE TABLE|provider adapter/i,
    );
  });
});

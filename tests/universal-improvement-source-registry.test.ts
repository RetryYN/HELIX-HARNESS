import { mkdirSync, mkdtempSync, rmSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  admitUniversalImprovementSource,
  analyzeUniversalImprovementSourceRegistry,
  loadUniversalImprovementSourceRegistry,
  UNIVERSAL_IMPROVEMENT_SOURCE_KINDS,
  type UniversalImprovementSourceObservation,
  validateUniversalImprovementSourceRegistryStructure,
} from "../src/runtime/universal-improvement-source-registry";

// PLAN-L7-703-universal-improvement-source-registry
function loadedRegistry() {
  const result = loadUniversalImprovementSourceRegistry(process.cwd());
  expect(result.ok).toBe(true);
  expect(result.physical_binding_verified).toBe(true);
  expect(result.registry_bytes_digest).toMatch(/^sha256:[a-f0-9]{64}$/u);
  expect(result.registry).not.toBeNull();
  if (!result.registry) throw new Error("test registry did not load");
  return { result, registry: result.registry };
}

function validObservation(
  sourceId: string,
  schemaVersion: string,
  detectorId: string,
  sourceRevision = "1",
): UniversalImprovementSourceObservation {
  return {
    source_id: sourceId,
    schema_version: schemaVersion,
    detector_id: detectorId,
    source_revision: sourceRevision,
    observed_at: "2026-08-30T00:00:00.000Z",
    payload_digest: `sha256:${"1".repeat(64)}`,
    evidence_digest: `sha256:${"2".repeat(64)}`,
  };
}

describe("Universal Improvement source registry", () => {
  it("U-UILSRC-001: requirements-owned registryが10 source kindをexactly oneずつ束縛する", () => {
    const { registry } = loadedRegistry();
    expect(registry.schema_version).toBe("helix-universal-improvement-source-registry.v1");
    expect(registry.registry_version).toBe("1.0.0");
    expect(registry.required_source_kinds).toEqual([...UNIVERSAL_IMPROVEMENT_SOURCE_KINDS]);
    expect(registry.entries.map((entry) => entry.source_kind)).toEqual([
      ...UNIVERSAL_IMPROVEMENT_SOURCE_KINDS,
    ]);
    expect(new Set(registry.entries.map((entry) => entry.source_id)).size).toBe(10);
    expect(new Set(registry.entries.map((entry) => entry.detector.detector_id)).size).toBe(10);
    expect(registry.entries.every((entry) => entry.failure_disposition === "fail_close")).toBe(
      true,
    );
    expect(registry.entries.every((entry) => entry.evidence_contract.read_only)).toBe(true);
  });

  it("U-UILSRC-002: duplicate source/detectorとrequired kind欠落をfail-closeする", () => {
    const { registry } = loadedRegistry();
    const duplicate = structuredClone(registry);
    duplicate.entries.push(structuredClone(duplicate.entries[0]));
    const duplicateResult = validateUniversalImprovementSourceRegistryStructure(duplicate);
    expect(duplicateResult.ok).toBe(false);
    expect(duplicateResult.findings.map((item) => item.code)).toEqual(
      expect.arrayContaining(["duplicate_source_id", "duplicate_detector_id"]),
    );

    const missingKind = structuredClone(registry);
    missingKind.entries = missingKind.entries.filter((entry) => entry.source_kind !== "review");
    const missingResult = validateUniversalImprovementSourceRegistryStructure(missingKind);
    expect(missingResult.ok).toBe(false);
    expect(missingResult.findings).toMatchObject([
      { code: "missing_source_kind", subject: "review" },
    ]);

    const missingRequirement = structuredClone(registry);
    missingRequirement.authority.requirement_ids =
      missingRequirement.authority.requirement_ids.slice(1);
    const missingRequirementResult =
      validateUniversalImprovementSourceRegistryStructure(missingRequirement);
    expect(missingRequirementResult.ok).toBe(false);
    expect(missingRequirementResult.findings).toMatchObject([
      { code: "registry_schema_invalid", subject: "authority.requirement_ids" },
    ]);

    const duplicateKind = structuredClone(registry);
    duplicateKind.entries[1].source_id = "UIL-SRC-011";
    duplicateKind.entries[1].detector.detector_id = "UIL-DET-011";
    duplicateKind.entries[1].source_kind = duplicateKind.entries[0].source_kind;
    const duplicateKindResult = validateUniversalImprovementSourceRegistryStructure(duplicateKind);
    expect(duplicateKindResult.ok).toBe(false);
    expect(duplicateKindResult.findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "duplicate_source_kind",
          subject: duplicateKind.entries[1].source_kind,
        }),
      ]),
    );

    const incompleteContract = structuredClone(registry);
    incompleteContract.entries[0].evidence_contract.required_fields =
      incompleteContract.entries[0].evidence_contract.required_fields.filter(
        (field) => field !== "source_revision",
      );
    incompleteContract.entries[0].evidence_contract.identity_fields =
      incompleteContract.entries[0].evidence_contract.identity_fields.filter(
        (field) => field !== "source_revision",
      );
    const incompleteContractResult =
      validateUniversalImprovementSourceRegistryStructure(incompleteContract);
    expect(incompleteContractResult.ok).toBe(false);
    expect(incompleteContractResult.findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "registry_schema_invalid",
          subject: "UIL-SRC-001.evidence_contract.required_fields",
        }),
        expect.objectContaining({
          code: "registry_schema_invalid",
          subject: "UIL-SRC-001.evidence_contract.identity_fields",
        }),
      ]),
    );
  });

  it("U-UILSRC-003: authority／detector digest driftとrepository外pathを拒否する", () => {
    const { registry } = loadedRegistry();
    const drifted = structuredClone(registry);
    drifted.entries[0].authority.source_digest = `sha256:${"0".repeat(64)}`;
    drifted.entries[0].detector.implementation.digest = `sha256:${"0".repeat(64)}`;
    const driftResult = analyzeUniversalImprovementSourceRegistry(drifted, process.cwd());
    expect(driftResult.ok).toBe(false);
    expect(driftResult.findings).toMatchObject([
      {
        code: "registry_input_mismatch",
        subject: "config/universal-improvement-source-registry.v1.json",
      },
    ]);

    const unsafe = structuredClone(registry);
    unsafe.entries[0].authority.artifact_path = "../outside.md";
    const unsafeResult = validateUniversalImprovementSourceRegistryStructure(unsafe);
    expect(unsafeResult.ok).toBe(false);
    expect(unsafeResult.registry).toBeNull();
    expect(unsafeResult.findings).toMatchObject([{ code: "registry_schema_invalid" }]);

    const escapedRegistryRoot = mkdtempSync(join(tmpdir(), "helix-uil-source-registry-"));
    try {
      mkdirSync(join(escapedRegistryRoot, "config"), { recursive: true });
      symlinkSync(
        join(process.cwd(), "config/universal-improvement-source-registry.v1.json"),
        join(escapedRegistryRoot, "config/universal-improvement-source-registry.v1.json"),
      );
      const escapedResult = loadUniversalImprovementSourceRegistry(escapedRegistryRoot);
      expect(escapedResult.ok).toBe(false);
      expect(escapedResult.registry).toBeNull();
      expect(escapedResult.findings).toMatchObject([{ code: "unsafe_source_path" }]);
    } finally {
      rmSync(escapedRegistryRoot, { recursive: true, force: true });
    }
  });

  it("U-UILSRC-004: valid observationだけをsource／schema／detector identityへadmitする", () => {
    const { result, registry } = loadedRegistry();
    const entry = registry.entries[0];
    const admitted = admitUniversalImprovementSource(
      result,
      validObservation(entry.source_id, entry.schema_version, entry.detector.detector_id),
      new Date("2026-08-30T12:00:00.000Z"),
    );
    expect(admitted.ok).toBe(true);
    expect(admitted.entry?.source_id).toBe(entry.source_id);
    expect(admitted.registry_version).toBe(registry.registry_version);
    expect(admitted.registry_source_digest).toBe(registry.authority.source_digest);
    expect(admitted.registry_bytes_digest).toBe(result.registry_bytes_digest);

    const unknown = admitUniversalImprovementSource(
      result,
      validObservation("UIL-SRC-999", entry.schema_version, entry.detector.detector_id),
      new Date("2026-08-30T12:00:00.000Z"),
    );
    expect(unknown.ok).toBe(false);
    expect(unknown.findings).toMatchObject([{ code: "unknown_source" }]);
  });

  it("U-UILSRC-010: 構造検査だけの結果を物理authority-bound admissionへ渡せない", () => {
    const { registry } = loadedRegistry();
    const structural = validateUniversalImprovementSourceRegistryStructure(registry);
    expect(structural.ok).toBe(true);
    expect(structural.physical_binding_verified).toBe(false);
    const entry = registry.entries[0];
    const admitted = admitUniversalImprovementSource(
      structural,
      validObservation(entry.source_id, entry.schema_version, entry.detector.detector_id),
      new Date("2026-08-30T12:00:00.000Z"),
    );
    expect(admitted.ok).toBe(false);
    expect(admitted.findings).toMatchObject([
      { code: "physical_binding_required", subject: "registry" },
    ]);
  });

  it("U-UILSRC-011: forged／変更済みresultをrepository-bound proofとして再利用できない", () => {
    const { result, registry } = loadedRegistry();
    const entry = registry.entries[0];
    const forged = {
      ...validateUniversalImprovementSourceRegistryStructure(registry),
      ok: true,
      physical_binding_verified: true,
      registry_bytes_digest: result.registry_bytes_digest,
    };
    expect(
      admitUniversalImprovementSource(
        forged,
        validObservation(entry.source_id, entry.schema_version, entry.detector.detector_id),
        new Date("2026-08-30T12:00:00.000Z"),
      ).findings,
    ).toMatchObject([{ code: "physical_binding_required" }]);

    expect(() => {
      (result as { registry_bytes_digest: string | null }).registry_bytes_digest =
        `sha256:${"f".repeat(64)}`;
    }).toThrow();
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.registry)).toBe(true);
    expect(
      admitUniversalImprovementSource(
        result,
        validObservation(entry.source_id, entry.schema_version, entry.detector.detector_id),
        new Date("2026-08-30T12:00:00.000Z"),
      ).ok,
    ).toBe(true);
  });

  it("U-UILSRC-005: wrong identity、必須field、digest、timestampを個別に拒否する", () => {
    const { result, registry } = loadedRegistry();
    const entry = registry.entries[0];
    const invalid = validObservation(entry.source_id, "wrong-schema.v1", "UIL-DET-999");
    invalid.source_revision = "";
    invalid.payload_digest = "not-a-digest";
    invalid.evidence_digest = "also-not-a-digest";
    invalid.observed_at = "not-a-timestamp";

    const admitted = admitUniversalImprovementSource(
      result,
      invalid,
      new Date("2026-08-30T12:00:00.000Z"),
    );
    expect(admitted.ok).toBe(false);
    expect(admitted.entry).toBeNull();
    expect(admitted.findings.map((item) => item.code)).toEqual(
      expect.arrayContaining([
        "source_schema_mismatch",
        "detector_identity_mismatch",
        "observation_field_missing",
        "observation_digest_invalid",
        "observation_timestamp_invalid",
      ]),
    );

    const wrongRevision = admitUniversalImprovementSource(
      result,
      validObservation(
        entry.source_id,
        entry.schema_version,
        entry.detector.detector_id,
        String(entry.revision + 1),
      ),
      new Date("2026-08-30T12:00:00.000Z"),
    );
    expect(wrongRevision.ok).toBe(false);
    expect(wrongRevision.findings).toMatchObject([
      { code: "source_revision_mismatch", subject: entry.source_id },
    ]);

    const future = validObservation(
      entry.source_id,
      entry.schema_version,
      entry.detector.detector_id,
    );
    future.observed_at = "2099-01-01T00:00:00.000Z";
    const futureResult = admitUniversalImprovementSource(
      result,
      future,
      new Date("2026-08-30T12:00:00.000Z"),
    );
    expect(futureResult.ok).toBe(false);
    expect(futureResult.findings).toMatchObject([
      { code: "observation_timestamp_future", subject: entry.source_id },
    ]);

    const invalidCalendar = validObservation(
      entry.source_id,
      entry.schema_version,
      entry.detector.detector_id,
    );
    invalidCalendar.observed_at = "2026-02-30T00:00:00.000Z";
    const invalidCalendarResult = admitUniversalImprovementSource(
      result,
      invalidCalendar,
      new Date("2026-08-30T12:00:00.000Z"),
    );
    expect(invalidCalendarResult.ok).toBe(false);
    expect(invalidCalendarResult.findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "observation_timestamp_invalid",
          subject: entry.source_id,
        }),
      ]),
    );

    const sensitive = validObservation(
      entry.source_id,
      entry.schema_version,
      entry.detector.detector_id,
    );
    sensitive.metadata = { secret: "must not be retained" };
    const sensitiveResult = admitUniversalImprovementSource(
      result,
      sensitive,
      new Date("2026-08-30T12:00:00.000Z"),
    );
    expect(sensitiveResult.ok).toBe(false);
    expect(sensitiveResult.findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "observation_sensitive_field_forbidden",
          subject: entry.source_id,
        }),
      ]),
    );

    const malformed = admitUniversalImprovementSource(
      result,
      null as unknown as UniversalImprovementSourceObservation,
      new Date("2026-08-30T12:00:00.000Z"),
    );
    expect(malformed.ok).toBe(false);
    expect(malformed.findings).toMatchObject([
      { code: "observation_field_missing", subject: "observation" },
    ]);
  });

  it("U-UILSRC-006: freshness windowを超えたobservationをstaleとして拒否する", () => {
    const { result, registry } = loadedRegistry();
    const entry = registry.entries[0];
    const admitted = admitUniversalImprovementSource(
      result,
      validObservation(entry.source_id, entry.schema_version, entry.detector.detector_id),
      new Date("2026-09-01T00:00:01.000Z"),
    );
    expect(admitted.ok).toBe(false);
    expect(admitted.findings).toMatchObject([
      { code: "observation_stale", subject: entry.source_id },
    ]);
  });
});

// PLAN-L7-550-nfr-typed-registry-quality-taxonomy
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import {
  admitNfrRegistryMigration,
  analyzeNfrRegistry,
  NFR_AI_CHARACTERISTICS,
  NFR_REGISTRY_REQUIRED_IDS,
  NFR_STANDARD_CHARACTERISTICS,
  type NfrAuthorityRole,
  type NfrEntryV1,
  type NfrRegistryFailureCode,
  type NfrRegistryV1,
  parseNfrRegistry,
} from "../src/requirements/nfr-registry";

const digest = `sha256:${"a".repeat(64)}` as const;
const tempRoots: string[] = [];

function makeEntry(
  nfrId: string,
  qualityFamily: NfrEntryV1["quality_family"],
  characteristic: NfrEntryV1["quality_characteristic"],
): NfrEntryV1 {
  const suffix = nfrId.slice(-3);
  const metricId = `metric-${suffix}`;
  return {
    nfr_id: nfrId,
    revision: 1,
    quality_family: qualityFamily,
    quality_characteristic: characteristic,
    source_authority: [
      {
        role: "l1_capability",
        canonical_layer: "L1",
        id: nfrId,
        artifact_path: "docs/source.md",
        locator: `§${suffix}`,
        source_digest: digest,
      },
    ],
    target_surface: [`surface-${suffix}`],
    metric: {
      id: metricId,
      name: `metric ${suffix}`,
      unit: "ratio",
      aggregation: "all",
      direction: "higher_is_better",
    },
    workload: { id: `workload-${suffix}`, description: "fixture", reference: "docs/workload.md" },
    environment: {
      profile_id: "node24-linux",
      description: "fixture",
      reference: "docs/environment.md",
    },
    data: { kind: "synthetic", reference: "tests/fixture.json" },
    sampling: {
      method: "all",
      minimum_sample_count: 1,
      value: null,
      unit: null,
      reference: "docs/sampling.md",
    },
    baseline: { status: "unknown", reason: "not measured", reference: "#220" },
    target: { status: "unknown", value: null, unit: null, reference: "#220" },
    slo: { status: "unknown", objective: null, unit: null, policy_ref: "#220" },
    error_budget: { status: "unknown", value: null, unit: null, reference: "#220" },
    hard_limit: { status: "unknown", value: null, unit: null, reference: "#220" },
    freshness_policy: {
      max_age_seconds: 3600,
      minimum_representativeness_ratio: 0.8,
      policy_ref: "#220",
    },
    threshold: {
      metric_id: metricId,
      unit: "ratio",
      comparator: "gte",
      inclusive: true,
      value: 1,
      policy_ref: "#220",
    },
    window: { kind: "run", value: 1, unit: "run" },
    probe: { id: `probe-${suffix}`, reference: "tests/nfr-registry.test.ts", read_only: true },
    oracle: {
      id: `U-NFRREG-${suffix}`,
      test_path: "tests/nfr-registry.test.ts",
      expectation: "fixture is structurally valid",
    },
    owner: "measurement-harness",
    evidence_path: "docs/evidence.md",
    remeasure_trigger: ["revision change"],
  };
}

const registry: NfrRegistryV1 = {
  schema_version: "helix-nfr-registry.v1",
  registry_id: "nfr-registry",
  entries: [
    makeEntry("HR-NFR-REG-001", "standard", "reliability"),
    makeEntry("HR-NFR-REG-002", "standard", "maintainability"),
    makeEntry("HR-NFR-REG-003", "ai_specific", "judgment_reproducibility"),
  ],
};

interface MutableRegistry {
  schema_version: string;
  registry_id: string;
  entries: Array<Record<string, unknown>>;
  [key: string]: unknown;
}

function candidate(): MutableRegistry {
  return structuredClone(registry) as unknown as MutableRegistry;
}

function object(value: unknown): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error("fixture object required");
  }
  return value as Record<string, unknown>;
}

function mutableEntry(value: MutableRegistry, index = 0): Record<string, unknown> {
  const entry = value.entries[index];
  if (!entry) throw new Error(`fixture entry ${index} required`);
  return entry;
}

function expectFailure(input: unknown, code: NfrRegistryFailureCode, repoRoot?: string): void {
  const result = analyzeNfrRegistry(input, repoRoot);
  expect(result.ok).toBe(false);
  if (!result.ok) expect(result.failureCodes).toContain(code);
}

function expectMigrationFailure(
  previous: unknown,
  next: unknown,
  code: NfrRegistryFailureCode,
): void {
  const result = admitNfrRegistryMigration(previous, next);
  expect(result.ok).toBe(false);
  if (!result.ok) expect(result.failureCodes).toContain(code);
}

afterAll(() => {
  for (const root of tempRoots) rmSync(root, { recursive: true, force: true });
});

describe("NFR typed registry", () => {
  it("U-NFRREG-001: root、entry、nested objectをstrict schemaで検証する", () => {
    expect(parseNfrRegistry(registry)).toEqual({ ok: true, value: registry });

    const rootExtra = candidate();
    rootExtra.extra = true;
    expectFailure(rootExtra, "registry_schema_invalid");

    const entryExtra = candidate();
    mutableEntry(entryExtra).extra = true;
    expectFailure(entryExtra, "registry_schema_invalid");

    const nestedExtra = candidate();
    object(mutableEntry(nestedExtra).metric).extra = true;
    expectFailure(nestedExtra, "registry_schema_invalid");
  });

  it("U-NFRREG-002: stable ID、revision、重複IDをfail-closeする", () => {
    const invalidId = candidate();
    mutableEntry(invalidId).nfr_id = "NFR-1";
    expectFailure(invalidId, "nfr_id_invalid");

    const invalidRevision = candidate();
    mutableEntry(invalidRevision).revision = 0;
    expectFailure(invalidRevision, "revision_invalid");

    const duplicate = candidate();
    mutableEntry(duplicate, 1).nfr_id = "HR-NFR-REG-001";
    expectFailure(duplicate, "duplicate_nfr_id");
  });

  it("U-NFRREG-003: 標準9特性とAI固有7特性をfamilyへexact分類する", () => {
    for (const characteristic of NFR_STANDARD_CHARACTERISTICS) {
      const input = candidate();
      mutableEntry(input).quality_family = "standard";
      mutableEntry(input).quality_characteristic = characteristic;
      expect(parseNfrRegistry(input).ok, characteristic).toBe(true);
    }
    for (const characteristic of NFR_AI_CHARACTERISTICS) {
      const input = candidate();
      mutableEntry(input).quality_family = "ai_specific";
      mutableEntry(input).quality_characteristic = characteristic;
      expect(parseNfrRegistry(input).ok, characteristic).toBe(true);
    }

    const mismatch = candidate();
    mutableEntry(mismatch).quality_characteristic = "grounding";
    expectFailure(mismatch, "quality_family_mismatch");

    const unknown = candidate();
    mutableEntry(unknown).quality_characteristic = "accuracy";
    expectFailure(unknown, "unknown_quality_characteristic");
  });

  it("U-NFRREG-004: authority必須、5 role、canonical layer対応を固定する", () => {
    const missing = candidate();
    mutableEntry(missing).source_authority = [];
    expectFailure(missing, "source_authority_missing");

    const roleCases: Array<[NfrAuthorityRole, "L1" | "L3" | null]> = [
      ["l1_capability", "L1"],
      ["l3_observable_behavior", "L3"],
      ["adr_technical_choice", null],
      ["policy_threshold_operation", null],
      ["runtime_profile_environment", null],
    ];
    for (const [role, layer] of roleCases) {
      const input = candidate();
      const authority = object((mutableEntry(input).source_authority as unknown[])[0]);
      authority.role = role;
      authority.canonical_layer = layer;
      expect(parseNfrRegistry(input).ok, role).toBe(true);
    }

    const mismatch = candidate();
    object((mutableEntry(mismatch).source_authority as unknown[])[0]).canonical_layer = "L3";
    expectFailure(mismatch, "authority_role_mismatch");
  });

  it("U-NFRREG-005: authority field混在とnfr-grade昇格を拒否しpath名からlayer推定しない", () => {
    const nonLayerMix = candidate();
    const mixedAuthority = object((mutableEntry(nonLayerMix).source_authority as unknown[])[0]);
    mixedAuthority.role = "adr_technical_choice";
    mixedAuthority.canonical_layer = "L1";
    expectFailure(nonLayerMix, "authority_field_mixing");

    const grade = candidate();
    object((mutableEntry(grade).source_authority as unknown[])[0]).artifact_path =
      "docs/migration/nfr-grade.md";
    expectFailure(grade, "authority_field_mixing");

    const noPhysicalInference = candidate();
    const pathAuthority = object(
      (mutableEntry(noPhysicalInference).source_authority as unknown[])[0],
    );
    pathAuthority.role = "adr_technical_choice";
    pathAuthority.canonical_layer = null;
    pathAuthority.artifact_path = "docs/design/helix/L1-requirements/technical-choice.md";
    expect(parseNfrRegistry(noPhysicalInference).ok).toBe(true);
  });

  it("U-NFRREG-006: source digest形式・実bytes・real path境界を検証する", () => {
    const invalidDigest = candidate();
    object((mutableEntry(invalidDigest).source_authority as unknown[])[0]).source_digest =
      "sha256:x";
    expectFailure(invalidDigest, "source_digest_invalid");

    const unsafe = candidate();
    object((mutableEntry(unsafe).source_authority as unknown[])[0]).artifact_path = "../source.md";
    expectFailure(unsafe, "unsafe_artifact_path");

    const root = mkdtempSync(join(tmpdir(), "helix-nfr-registry-"));
    tempRoots.push(root);
    mkdirSync(join(root, "docs"), { recursive: true });
    const bytes = "canonical source\n";
    writeFileSync(join(root, "docs/source.md"), bytes, "utf8");
    const actualDigest = `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
    const bound = candidate();
    for (const entry of bound.entries) {
      const authority = object((entry.source_authority as unknown[])[0]);
      authority.artifact_path = "docs/source.md";
      authority.source_digest = actualDigest;
    }
    expect(analyzeNfrRegistry(bound, root).ok).toBe(true);
    object((mutableEntry(bound).source_authority as unknown[])[0]).source_digest = digest;
    expectFailure(bound, "source_digest_mismatch", root);
  });

  it("U-NFRREG-007: surface、metric、workload、environment、dataの必須構造を検証する", () => {
    const emptySurface = candidate();
    mutableEntry(emptySurface).target_surface = [];
    expectFailure(emptySurface, "required_field_missing");

    const metricMissing = candidate();
    delete object(mutableEntry(metricMissing).metric).unit;
    expectFailure(metricMissing, "required_field_missing");

    const dataKind = candidate();
    object(mutableEntry(dataKind).data).kind = "production_secret";
    expectFailure(dataKind, "registry_schema_invalid");

    const workloadTraversal = candidate();
    object(mutableEntry(workloadTraversal).workload).reference = "../outside";
    expectFailure(workloadTraversal, "registry_schema_invalid");
  });

  it("U-NFRREG-008: sampling methodごとのvalue/unit構造とminimum countを固定する", () => {
    const validSampling = [
      { method: "all", minimum_sample_count: 1, value: null, unit: null, reference: "POL-1" },
      {
        method: "fixed_count",
        minimum_sample_count: 1,
        value: 10,
        unit: "count",
        reference: "POL-1",
      },
      { method: "ratio", minimum_sample_count: 1, value: 0.5, unit: "ratio", reference: "POL-1" },
      {
        method: "time_interval",
        minimum_sample_count: 1,
        value: 60,
        unit: "seconds",
        reference: "POL-1",
      },
    ];
    for (const sampling of validSampling) {
      const input = candidate();
      mutableEntry(input).sampling = sampling;
      expect(parseNfrRegistry(input).ok, sampling.method).toBe(true);
    }

    const invalid = candidate();
    mutableEntry(invalid).sampling = {
      method: "ratio",
      minimum_sample_count: 0,
      value: 1.1,
      unit: "ratio",
      reference: "POL-1",
    };
    expectFailure(invalid, "sampling_invalid");
  });

  it("U-NFRREG-009: baseline unknown|measured unionを損失なくstrict検証する", () => {
    const measured = candidate();
    mutableEntry(measured).baseline = {
      status: "measured",
      value: 0.9,
      unit: "ratio",
      reference: "evidence/baseline.json",
    };
    expect(parseNfrRegistry(measured).ok).toBe(true);

    const mixed = candidate();
    mutableEntry(mixed).baseline = {
      status: "unknown",
      reason: "not measured",
      reference: "#220",
      value: 1,
    };
    expectFailure(mixed, "registry_schema_invalid");

    const nonFinite = candidate();
    mutableEntry(nonFinite).baseline = {
      status: "measured",
      value: Number.NaN,
      unit: "ratio",
      reference: "evidence/baseline.json",
    };
    expectFailure(nonFinite, "registry_schema_invalid");
  });

  it("U-NFRREG-010: target、SLO、error budget、hard limitのunknown|declared構造を固定する", () => {
    const declared = candidate();
    mutableEntry(declared).target = {
      status: "declared",
      value: 0.99,
      unit: "ratio",
      reference: "POL-1",
    };
    mutableEntry(declared).slo = {
      status: "declared",
      objective: 0.99,
      unit: "ratio",
      policy_ref: "POL-1",
    };
    mutableEntry(declared).error_budget = {
      status: "declared",
      value: 0.01,
      unit: "ratio",
      reference: "POL-1",
    };
    mutableEntry(declared).hard_limit = {
      status: "declared",
      value: 1,
      unit: "ratio",
      reference: "POL-1",
    };
    expect(parseNfrRegistry(declared).ok).toBe(true);

    const invalidUnknown = candidate();
    mutableEntry(invalidUnknown).target = {
      status: "unknown",
      value: 1,
      unit: "ratio",
      reference: "#220",
    };
    expectFailure(invalidUnknown, "registry_schema_invalid");

    const invalidSlo = candidate();
    mutableEntry(invalidSlo).slo = {
      status: "declared",
      objective: null,
      unit: null,
      policy_ref: "POL-1",
    };
    expectFailure(invalidSlo, "slo_invalid");
  });

  it("U-NFRREG-011: freshness policy宣言のage・representativeness範囲を検証する", () => {
    for (const invalidPolicy of [
      { max_age_seconds: 0, minimum_representativeness_ratio: 0.8, policy_ref: "POL-1" },
      { max_age_seconds: 1, minimum_representativeness_ratio: -0.1, policy_ref: "POL-1" },
      { max_age_seconds: 1, minimum_representativeness_ratio: 1.1, policy_ref: "POL-1" },
    ]) {
      const input = candidate();
      mutableEntry(input).freshness_policy = invalidPolicy;
      expectFailure(input, "freshness_policy_invalid");
    }
  });

  it("U-NFRREG-012: thresholdをmetric/unit/comparator/inclusive/policyへ束縛する", () => {
    for (const comparator of ["lt", "lte", "eq", "gte", "gt"] as const) {
      const input = candidate();
      object(mutableEntry(input).threshold).comparator = comparator;
      expect(parseNfrRegistry(input).ok, comparator).toBe(true);
    }
    const between = candidate();
    object(mutableEntry(between).threshold).comparator = "between";
    object(mutableEntry(between).threshold).value = [0.8, 1];
    expect(parseNfrRegistry(between).ok).toBe(true);

    const metricMismatch = candidate();
    object(mutableEntry(metricMismatch).threshold).metric_id = "other";
    expectFailure(metricMismatch, "threshold_invalid");

    const reversed = candidate();
    object(mutableEntry(reversed).threshold).comparator = "between";
    object(mutableEntry(reversed).threshold).value = [1, 0.8];
    expectFailure(reversed, "threshold_invalid");
  });

  it("U-NFRREG-013: window/probe構造とimplementation detail混入を拒否する", () => {
    const invalidWindow = candidate();
    object(mutableEntry(invalidWindow).window).value = 0;
    expectFailure(invalidWindow, "registry_schema_invalid");

    const mutatingProbe = candidate();
    object(mutableEntry(mutatingProbe).probe).read_only = false;
    expectFailure(mutatingProbe, "implementation_detail_in_nfr");

    const implementationKey = candidate();
    mutableEntry(implementationKey).command = "npm run probe";
    expectFailure(implementationKey, "implementation_detail_in_nfr");
  });

  it("U-NFRREG-014: oracle、evidence、owner、remeasure trigger参照を検証する", () => {
    const oracle = candidate();
    object(mutableEntry(oracle).oracle).test_path = "src/not-a-test.ts";
    expectFailure(oracle, "oracle_reference_invalid");

    const evidence = candidate();
    mutableEntry(evidence).evidence_path = ".helix/private.json";
    expectFailure(evidence, "evidence_path_invalid");

    const owner = candidate();
    mutableEntry(owner).owner = "";
    expectFailure(owner, "owner_missing");

    const trigger = candidate();
    mutableEntry(trigger).remeasure_trigger = [];
    expectFailure(trigger, "remeasure_trigger_empty");
  });

  it("U-NFRREG-015: production registryをHR-NFR-REG-001..003へexact traceしpartialを拒否する", () => {
    const production = JSON.parse(readFileSync("config/nfr-registry.json", "utf8")) as unknown;
    const result = analyzeNfrRegistry(production, process.cwd());
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.entries.map((entry) => entry.nfr_id)).toEqual(NFR_REGISTRY_REQUIRED_IDS);
    }

    const partial = candidate();
    partial.entries.pop();
    expectFailure(partial, "required_field_missing");
  });

  it("U-NFRREG-016: analyzerは入力を変更せず同一入力へ決定的結果を返す", () => {
    const input = candidate();
    const before = JSON.stringify(input);
    const first = analyzeNfrRegistry(input);
    const second = analyzeNfrRegistry(input);
    expect(first).toEqual(second);
    expect(JSON.stringify(input)).toBe(before);
  });

  it("U-NFRREG-017: migration admissionはstable IDと一段のmaterial revisionを強制する", () => {
    const changed = candidate();
    mutableEntry(changed).revision = 2;
    object(mutableEntry(changed).metric).name = "revised metric";
    expect(admitNfrRegistryMigration(registry, changed).ok).toBe(true);

    const unchangedBump = candidate();
    mutableEntry(unchangedBump).revision = 2;
    expectMigrationFailure(registry, unchangedBump, "migration_revision_empty_bump");

    const changedWithoutRevision = candidate();
    object(mutableEntry(changedWithoutRevision).metric).name = "revised metric";
    expectMigrationFailure(registry, changedWithoutRevision, "migration_revision_not_incremented");

    const previousWithExtra = candidate();
    const removable = structuredClone(mutableEntry(previousWithExtra));
    removable.nfr_id = "HR-NFR-REG-004";
    removable.revision = 1;
    previousWithExtra.entries.push(removable);
    expectMigrationFailure(previousWithExtra, registry, "migration_entry_removed");

    const previousRevisionTwo = candidate();
    mutableEntry(previousRevisionTwo).revision = 2;
    object(mutableEntry(previousRevisionTwo).metric).name = "previous metric";
    expectMigrationFailure(previousRevisionTwo, registry, "migration_revision_regressed");

    const newEntryRevisionTwo = candidate();
    const added = structuredClone(mutableEntry(newEntryRevisionTwo));
    added.nfr_id = "HR-NFR-REG-004";
    added.revision = 2;
    newEntryRevisionTwo.entries.push(added);
    expectMigrationFailure(registry, newEntryRevisionTwo, "migration_new_entry_revision_invalid");
  });
});

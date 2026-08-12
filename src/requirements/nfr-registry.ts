import { createHash } from "node:crypto";
import { readFileSync, realpathSync } from "node:fs";
import { isAbsolute, relative, resolve } from "node:path";
import { isDeepStrictEqual } from "node:util";

export type NfrQualityFamily = "standard" | "ai_specific";
export type NfrStandardCharacteristic =
  | "functional_suitability"
  | "performance_efficiency"
  | "compatibility"
  | "interaction_capability"
  | "reliability"
  | "security"
  | "maintainability"
  | "flexibility"
  | "safety";
export type NfrAiCharacteristic =
  | "judgment_reproducibility"
  | "worker_verifier_independence"
  | "grounding"
  | "loop_termination"
  | "cost_efficiency"
  | "provider_degradation"
  | "memory_contamination_resistance";
export type NfrCharacteristic = NfrStandardCharacteristic | NfrAiCharacteristic;
export type NfrAuthorityRole =
  | "l1_capability"
  | "l3_observable_behavior"
  | "adr_technical_choice"
  | "policy_threshold_operation"
  | "runtime_profile_environment";
export type NfrRegistryFailureCode =
  | "registry_missing"
  | "registry_json_invalid"
  | "registry_schema_invalid"
  | "nfr_id_invalid"
  | "revision_invalid"
  | "duplicate_nfr_id"
  | "quality_family_mismatch"
  | "unknown_quality_characteristic"
  | "required_field_missing"
  | "sampling_invalid"
  | "slo_invalid"
  | "freshness_policy_invalid"
  | "threshold_invalid"
  | "source_authority_missing"
  | "authority_role_mismatch"
  | "authority_field_mixing"
  | "source_digest_invalid"
  | "source_digest_mismatch"
  | "unsafe_artifact_path"
  | "oracle_reference_invalid"
  | "evidence_path_invalid"
  | "owner_missing"
  | "remeasure_trigger_empty"
  | "implementation_detail_in_nfr"
  | "migration_entry_removed"
  | "migration_revision_regressed"
  | "migration_revision_not_incremented"
  | "migration_revision_empty_bump"
  | "migration_new_entry_revision_invalid";

export interface NfrEntryV1 {
  nfr_id: string;
  revision: number;
  quality_family: NfrQualityFamily;
  quality_characteristic: NfrCharacteristic;
  source_authority: readonly {
    role: NfrAuthorityRole;
    canonical_layer: "L1" | "L3" | null;
    id: string;
    artifact_path: string;
    locator: string;
    source_digest: `sha256:${string}`;
  }[];
  target_surface: readonly string[];
  metric: {
    id: string;
    name: string;
    unit: string;
    aggregation: string;
    direction: "higher_is_better" | "lower_is_better" | "in_range";
  };
  workload: { id: string; description: string; reference: string };
  environment: { profile_id: string; description: string; reference: string };
  data: { kind: "synthetic" | "fixture" | "redacted_observation" | "none"; reference: string };
  sampling: {
    method: "all" | "fixed_count" | "ratio" | "time_interval";
    minimum_sample_count: number;
    value: number | null;
    unit: string | null;
    reference: string;
  };
  baseline:
    | { status: "unknown"; reason: string; reference: string }
    | { status: "measured"; value: number; unit: string; reference: string };
  target: {
    status: "unknown" | "declared";
    value: number | null;
    unit: string | null;
    reference: string;
  };
  slo: {
    status: "unknown" | "declared";
    objective: number | null;
    unit: string | null;
    policy_ref: string;
  };
  error_budget: {
    status: "unknown" | "declared";
    value: number | null;
    unit: string | null;
    reference: string;
  };
  hard_limit: {
    status: "unknown" | "declared";
    value: number | null;
    unit: string | null;
    reference: string;
  };
  freshness_policy: {
    max_age_seconds: number;
    minimum_representativeness_ratio: number;
    policy_ref: string;
  };
  threshold: {
    metric_id: string;
    unit: string;
    comparator: "lt" | "lte" | "eq" | "gte" | "gt" | "between";
    inclusive: boolean;
    value: number | readonly [number, number];
    policy_ref: string;
  };
  window: { kind: "run" | "sample" | "release" | "time"; value: number; unit: string };
  probe: { id: string; reference: string; read_only: true };
  oracle: { id: string; test_path: string; expectation: string };
  owner: string;
  evidence_path: string;
  remeasure_trigger: readonly string[];
}

export interface NfrRegistryV1 {
  schema_version: "helix-nfr-registry.v1";
  registry_id: "nfr-registry";
  entries: readonly NfrEntryV1[];
}

export type NfrAnalysis =
  | { ok: true; value: NfrRegistryV1 }
  | {
      ok: false;
      failureCodes: readonly NfrRegistryFailureCode[];
      messages: readonly string[];
    };

export const NFR_STANDARD_CHARACTERISTICS = [
  "functional_suitability",
  "performance_efficiency",
  "compatibility",
  "interaction_capability",
  "reliability",
  "security",
  "maintainability",
  "flexibility",
  "safety",
] as const satisfies readonly NfrStandardCharacteristic[];

export const NFR_AI_CHARACTERISTICS = [
  "judgment_reproducibility",
  "worker_verifier_independence",
  "grounding",
  "loop_termination",
  "cost_efficiency",
  "provider_degradation",
  "memory_contamination_resistance",
] as const satisfies readonly NfrAiCharacteristic[];

export const NFR_REGISTRY_REQUIRED_IDS = [
  "HR-NFR-REG-001",
  "HR-NFR-REG-002",
  "HR-NFR-REG-003",
] as const;

const FAILURE_CODE_ORDER: readonly NfrRegistryFailureCode[] = [
  "registry_missing",
  "registry_json_invalid",
  "registry_schema_invalid",
  "nfr_id_invalid",
  "revision_invalid",
  "duplicate_nfr_id",
  "quality_family_mismatch",
  "unknown_quality_characteristic",
  "source_authority_missing",
  "authority_role_mismatch",
  "authority_field_mixing",
  "source_digest_invalid",
  "source_digest_mismatch",
  "unsafe_artifact_path",
  "required_field_missing",
  "sampling_invalid",
  "slo_invalid",
  "freshness_policy_invalid",
  "threshold_invalid",
  "oracle_reference_invalid",
  "evidence_path_invalid",
  "owner_missing",
  "remeasure_trigger_empty",
  "implementation_detail_in_nfr",
  "migration_entry_removed",
  "migration_revision_regressed",
  "migration_revision_not_incremented",
  "migration_revision_empty_bump",
  "migration_new_entry_revision_invalid",
];

const ROOT_KEYS = ["schema_version", "registry_id", "entries"] as const;
const ENTRY_KEYS = [
  "nfr_id",
  "revision",
  "quality_family",
  "quality_characteristic",
  "source_authority",
  "target_surface",
  "metric",
  "workload",
  "environment",
  "data",
  "sampling",
  "baseline",
  "target",
  "slo",
  "error_budget",
  "hard_limit",
  "freshness_policy",
  "threshold",
  "window",
  "probe",
  "oracle",
  "owner",
  "evidence_path",
  "remeasure_trigger",
] as const;
const AUTHORITY_KEYS = [
  "role",
  "canonical_layer",
  "id",
  "artifact_path",
  "locator",
  "source_digest",
] as const;
const STANDARD = new Set<string>(NFR_STANDARD_CHARACTERISTICS);
const AI_SPECIFIC = new Set<string>(NFR_AI_CHARACTERISTICS);
const AUTHORITY_ROLES = new Set<NfrAuthorityRole>([
  "l1_capability",
  "l3_observable_behavior",
  "adr_technical_choice",
  "policy_threshold_operation",
  "runtime_profile_environment",
]);
const DIGEST = /^sha256:[a-f0-9]{64}$/;
const OWNER = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
const ORACLE_ID = /^(?:U|ST)-[A-Z0-9][A-Z0-9-]*$/;
const NFR_ID = /^HR-NFR-REG-\d{3}$/;
const IMPLEMENTATION_DETAIL_KEYS = new Set([
  "algorithm",
  "class_name",
  "code",
  "command",
  "database_table",
  "endpoint",
  "framework",
  "function_name",
  "implementation",
  "implementation_detail",
  "library",
  "module_path",
  "sql",
]);

type JsonObject = Record<string, unknown>;
interface Finding {
  code: NfrRegistryFailureCode;
  message: string;
}

function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function addFinding(
  findings: Finding[],
  code: NfrRegistryFailureCode,
  path: string,
  detail: string,
): void {
  const message = `nfr-registry:${code}:${path}:${detail}`;
  if (!findings.some((finding) => finding.message === message)) findings.push({ code, message });
}

function strictObject(
  value: unknown,
  expectedKeys: readonly string[],
  findings: Finding[],
  path: string,
  options: {
    missingCode?: NfrRegistryFailureCode;
    extraCode?: NfrRegistryFailureCode;
    invalidCode?: NfrRegistryFailureCode;
  } = {},
): value is JsonObject {
  const invalidCode = options.invalidCode ?? "registry_schema_invalid";
  if (!isObject(value)) {
    addFinding(findings, invalidCode, path, "object required");
    return false;
  }
  const actual = Object.keys(value);
  const expected = new Set(expectedKeys);
  for (const key of expectedKeys) {
    if (!(key in value)) {
      addFinding(
        findings,
        options.missingCode ?? "required_field_missing",
        `${path}.${key}`,
        "missing",
      );
    }
  }
  for (const key of actual) {
    if (expected.has(key)) continue;
    addFinding(
      findings,
      options.extraCode ?? "registry_schema_invalid",
      `${path}.${key}`,
      "unknown field",
    );
    if (IMPLEMENTATION_DETAIL_KEYS.has(key)) {
      addFinding(
        findings,
        "implementation_detail_in_nfr",
        `${path}.${key}`,
        "implementation field is not an NFR declaration",
      );
    }
  }
  return true;
}

function nonEmptyString(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.trim().length > 0 &&
    !Array.from(value).some((character) => character.charCodeAt(0) < 32)
  );
}

function finiteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function positiveInteger(value: unknown): value is number {
  return Number.isSafeInteger(value) && Number(value) > 0;
}

function safeRepoPath(value: unknown): value is string {
  if (!nonEmptyString(value) || isAbsolute(value) || /^[A-Za-z]:[\\/]/u.test(value)) return false;
  if (value.includes("\\")) return false;
  const segments = value.split("/");
  if (segments.some((segment) => segment === "" || segment === "." || segment === ".."))
    return false;
  return !value.startsWith(".helix/") && !value.startsWith("node_modules/");
}

function validReference(value: unknown): value is string {
  if (!nonEmptyString(value) || isAbsolute(value) || /^[A-Za-z]:[\\/]/u.test(value)) return false;
  return !value.split(/[\\/]/u).includes("..");
}

function validStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every(nonEmptyString) &&
    new Set(value).size === value.length
  );
}

function validateTextObject(
  value: unknown,
  keys: readonly string[],
  textKeys: readonly string[],
  findings: Finding[],
  path: string,
): JsonObject | null {
  if (!strictObject(value, keys, findings, path)) return null;
  for (const key of textKeys) {
    if (!nonEmptyString(value[key])) {
      addFinding(findings, "required_field_missing", `${path}.${key}`, "non-empty string required");
    }
  }
  return value;
}

function validateAuthority(
  value: unknown,
  findings: Finding[],
  path: string,
  repoRoot?: string,
): void {
  if (!Array.isArray(value) || value.length === 0) {
    addFinding(
      findings,
      "source_authority_missing",
      path,
      "at least one authority reference required",
    );
    return;
  }
  const identities = new Set<string>();
  for (const [index, raw] of value.entries()) {
    const authorityPath = `${path}[${index}]`;
    if (
      !strictObject(raw, AUTHORITY_KEYS, findings, authorityPath, {
        extraCode: "authority_field_mixing",
      })
    ) {
      continue;
    }
    const role = raw.role;
    if (!AUTHORITY_ROLES.has(role as NfrAuthorityRole)) {
      addFinding(findings, "authority_role_mismatch", `${authorityPath}.role`, "unknown role");
    }
    const expectedLayer =
      role === "l1_capability" ? "L1" : role === "l3_observable_behavior" ? "L3" : null;
    if (raw.canonical_layer !== expectedLayer) {
      addFinding(
        findings,
        "authority_role_mismatch",
        `${authorityPath}.canonical_layer`,
        `role ${String(role)} requires ${String(expectedLayer)}`,
      );
      if (expectedLayer === null && raw.canonical_layer !== null) {
        addFinding(
          findings,
          "authority_field_mixing",
          `${authorityPath}.canonical_layer`,
          "non-layer authority cannot claim L1/L3",
        );
      }
    }
    if (!nonEmptyString(raw.id)) {
      addFinding(
        findings,
        "required_field_missing",
        `${authorityPath}.id`,
        "non-empty id required",
      );
    }
    if (!nonEmptyString(raw.locator)) {
      addFinding(
        findings,
        "required_field_missing",
        `${authorityPath}.locator`,
        "non-empty locator required",
      );
    }
    if (!safeRepoPath(raw.artifact_path)) {
      addFinding(
        findings,
        "unsafe_artifact_path",
        `${authorityPath}.artifact_path`,
        "canonical repo-relative path required",
      );
    } else if (raw.artifact_path.toLowerCase().endsWith("nfr-grade.md")) {
      addFinding(
        findings,
        "authority_field_mixing",
        `${authorityPath}.artifact_path`,
        "nfr-grade.md is compatibility material, not authority",
      );
    }
    if (!DIGEST.test(String(raw.source_digest))) {
      addFinding(
        findings,
        "source_digest_invalid",
        `${authorityPath}.source_digest`,
        "sha256 digest required",
      );
    }
    const identity = `${String(role)}\u0000${String(raw.id)}\u0000${String(raw.artifact_path)}\u0000${String(raw.locator)}`;
    if (identities.has(identity)) {
      addFinding(
        findings,
        "authority_field_mixing",
        authorityPath,
        "duplicate authority reference",
      );
    }
    identities.add(identity);

    if (repoRoot && safeRepoPath(raw.artifact_path) && DIGEST.test(String(raw.source_digest))) {
      try {
        const realRoot = realpathSync(repoRoot);
        const realSource = realpathSync(resolve(repoRoot, raw.artifact_path));
        const relativeSource = relative(realRoot, realSource);
        if (
          relativeSource === "" ||
          relativeSource === ".." ||
          relativeSource.startsWith(`..${process.platform === "win32" ? "\\" : "/"}`) ||
          isAbsolute(relativeSource)
        ) {
          addFinding(
            findings,
            "unsafe_artifact_path",
            `${authorityPath}.artifact_path`,
            "resolved path escapes repository",
          );
          continue;
        }
        const actual = `sha256:${createHash("sha256").update(readFileSync(realSource)).digest("hex")}`;
        if (actual !== raw.source_digest) {
          addFinding(
            findings,
            "source_digest_mismatch",
            `${authorityPath}.source_digest`,
            "digest differs from source bytes",
          );
        }
      } catch {
        addFinding(
          findings,
          "source_digest_mismatch",
          `${authorityPath}.source_digest`,
          "source cannot be resolved",
        );
      }
    }
  }
}

function validateMetric(value: unknown, findings: Finding[], path: string): JsonObject | null {
  const metric = validateTextObject(
    value,
    ["id", "name", "unit", "aggregation", "direction"],
    ["id", "name", "unit", "aggregation"],
    findings,
    path,
  );
  if (
    metric &&
    !["higher_is_better", "lower_is_better", "in_range"].includes(String(metric.direction))
  ) {
    addFinding(findings, "registry_schema_invalid", `${path}.direction`, "unknown direction");
  }
  return metric;
}

function validateSampling(value: unknown, findings: Finding[], path: string): void {
  if (
    !strictObject(
      value,
      ["method", "minimum_sample_count", "value", "unit", "reference"],
      findings,
      path,
      {
        invalidCode: "sampling_invalid",
        missingCode: "sampling_invalid",
        extraCode: "sampling_invalid",
      },
    )
  ) {
    return;
  }
  const method = value.method;
  const minimumValid = positiveInteger(value.minimum_sample_count);
  const referenceValid = validReference(value.reference);
  const valid =
    minimumValid &&
    referenceValid &&
    (method === "all"
      ? value.value === null && value.unit === null
      : method === "fixed_count"
        ? positiveInteger(value.value) && value.unit === "count"
        : method === "ratio"
          ? finiteNumber(value.value) &&
            value.value > 0 &&
            value.value <= 1 &&
            value.unit === "ratio"
          : method === "time_interval"
            ? finiteNumber(value.value) && value.value > 0 && nonEmptyString(value.unit)
            : false);
  if (!valid) addFinding(findings, "sampling_invalid", path, "sampling declaration is invalid");
}

function validateBaseline(value: unknown, findings: Finding[], path: string): void {
  if (!isObject(value)) {
    addFinding(findings, "registry_schema_invalid", path, "baseline object required");
    return;
  }
  if (value.status === "unknown") {
    strictObject(value, ["status", "reason", "reference"], findings, path);
    if (!nonEmptyString(value.reason) || !validReference(value.reference)) {
      addFinding(
        findings,
        "registry_schema_invalid",
        path,
        "unknown baseline needs reason/reference",
      );
    }
    return;
  }
  if (value.status === "measured") {
    strictObject(value, ["status", "value", "unit", "reference"], findings, path);
    if (
      !finiteNumber(value.value) ||
      !nonEmptyString(value.unit) ||
      !validReference(value.reference)
    ) {
      addFinding(findings, "registry_schema_invalid", path, "measured baseline is invalid");
    }
    return;
  }
  addFinding(findings, "registry_schema_invalid", `${path}.status`, "unknown baseline status");
}

function validateTarget(value: unknown, findings: Finding[], path: string): void {
  if (!strictObject(value, ["status", "value", "unit", "reference"], findings, path)) return;
  const valid =
    validReference(value.reference) &&
    (value.status === "unknown"
      ? value.value === null && value.unit === null
      : value.status === "declared"
        ? finiteNumber(value.value) && nonEmptyString(value.unit)
        : false);
  if (!valid)
    addFinding(findings, "registry_schema_invalid", path, "target declaration is invalid");
}

function validateSlo(value: unknown, findings: Finding[], path: string): void {
  if (
    !strictObject(value, ["status", "objective", "unit", "policy_ref"], findings, path, {
      invalidCode: "slo_invalid",
      missingCode: "slo_invalid",
      extraCode: "slo_invalid",
    })
  ) {
    return;
  }
  const valid =
    validReference(value.policy_ref) &&
    (value.status === "unknown"
      ? value.objective === null && value.unit === null
      : value.status === "declared"
        ? finiteNumber(value.objective) && nonEmptyString(value.unit)
        : false);
  if (!valid) addFinding(findings, "slo_invalid", path, "SLO declaration is invalid");
}

function validateBudgetOrLimit(value: unknown, findings: Finding[], path: string): void {
  if (!strictObject(value, ["status", "value", "unit", "reference"], findings, path)) return;
  const valid =
    validReference(value.reference) &&
    (value.status === "unknown"
      ? value.value === null && value.unit === null
      : value.status === "declared"
        ? finiteNumber(value.value) && nonEmptyString(value.unit)
        : false);
  if (!valid) addFinding(findings, "registry_schema_invalid", path, "declaration is invalid");
}

function validateFreshness(value: unknown, findings: Finding[], path: string): void {
  if (
    !strictObject(
      value,
      ["max_age_seconds", "minimum_representativeness_ratio", "policy_ref"],
      findings,
      path,
      {
        invalidCode: "freshness_policy_invalid",
        missingCode: "freshness_policy_invalid",
        extraCode: "freshness_policy_invalid",
      },
    )
  ) {
    return;
  }
  if (
    !positiveInteger(value.max_age_seconds) ||
    !finiteNumber(value.minimum_representativeness_ratio) ||
    value.minimum_representativeness_ratio < 0 ||
    value.minimum_representativeness_ratio > 1 ||
    !validReference(value.policy_ref)
  ) {
    addFinding(findings, "freshness_policy_invalid", path, "freshness declaration is invalid");
  }
}

function validateThreshold(
  value: unknown,
  metric: JsonObject | null,
  findings: Finding[],
  path: string,
): void {
  if (
    !strictObject(
      value,
      ["metric_id", "unit", "comparator", "inclusive", "value", "policy_ref"],
      findings,
      path,
      {
        invalidCode: "threshold_invalid",
        missingCode: "threshold_invalid",
        extraCode: "threshold_invalid",
      },
    )
  ) {
    return;
  }
  const comparator = value.comparator;
  const comparatorValid = ["lt", "lte", "eq", "gte", "gt", "between"].includes(String(comparator));
  const thresholdValueValid =
    comparator === "between"
      ? Array.isArray(value.value) &&
        value.value.length === 2 &&
        value.value.every(finiteNumber) &&
        Number(value.value[0]) <= Number(value.value[1])
      : finiteNumber(value.value);
  if (
    !metric ||
    value.metric_id !== metric.id ||
    value.unit !== metric.unit ||
    !comparatorValid ||
    typeof value.inclusive !== "boolean" ||
    !thresholdValueValid ||
    !validReference(value.policy_ref)
  ) {
    addFinding(findings, "threshold_invalid", path, "threshold binding is invalid");
  }
}

function validateEntry(
  raw: unknown,
  index: number,
  findings: Finding[],
  ids: Set<string>,
  repoRoot?: string,
): void {
  const path = `entries[${index}]`;
  if (!strictObject(raw, ENTRY_KEYS, findings, path)) return;

  if (!nonEmptyString(raw.nfr_id) || !NFR_ID.test(raw.nfr_id)) {
    addFinding(findings, "nfr_id_invalid", `${path}.nfr_id`, "HR-NFR-REG-NNN required");
  } else {
    if (ids.has(raw.nfr_id)) {
      addFinding(findings, "duplicate_nfr_id", `${path}.nfr_id`, raw.nfr_id);
    }
    ids.add(raw.nfr_id);
  }
  if (!positiveInteger(raw.revision)) {
    addFinding(findings, "revision_invalid", `${path}.revision`, "positive integer required");
  }

  const family = raw.quality_family;
  const characteristic = raw.quality_characteristic;
  const knownCharacteristic =
    nonEmptyString(characteristic) &&
    (STANDARD.has(characteristic) || AI_SPECIFIC.has(characteristic));
  if (!knownCharacteristic) {
    addFinding(
      findings,
      "unknown_quality_characteristic",
      `${path}.quality_characteristic`,
      String(characteristic),
    );
  } else if (
    (family === "standard" && !STANDARD.has(characteristic)) ||
    (family === "ai_specific" && !AI_SPECIFIC.has(characteristic)) ||
    (family !== "standard" && family !== "ai_specific")
  ) {
    addFinding(
      findings,
      "quality_family_mismatch",
      `${path}.quality_family`,
      `${String(family)}:${characteristic}`,
    );
  }
  if (family !== "standard" && family !== "ai_specific") {
    addFinding(findings, "quality_family_mismatch", `${path}.quality_family`, String(family));
  }

  validateAuthority(raw.source_authority, findings, `${path}.source_authority`, repoRoot);

  if (!validStringArray(raw.target_surface)) {
    addFinding(
      findings,
      "required_field_missing",
      `${path}.target_surface`,
      "unique non-empty surfaces required",
    );
  }
  const metric = validateMetric(raw.metric, findings, `${path}.metric`);
  const workload = validateTextObject(
    raw.workload,
    ["id", "description", "reference"],
    ["id", "description"],
    findings,
    `${path}.workload`,
  );
  if (workload && !validReference(workload.reference)) {
    addFinding(
      findings,
      "registry_schema_invalid",
      `${path}.workload.reference`,
      "invalid reference",
    );
  }
  const environment = validateTextObject(
    raw.environment,
    ["profile_id", "description", "reference"],
    ["profile_id", "description"],
    findings,
    `${path}.environment`,
  );
  if (environment && !validReference(environment.reference)) {
    addFinding(
      findings,
      "registry_schema_invalid",
      `${path}.environment.reference`,
      "invalid reference",
    );
  }
  if (strictObject(raw.data, ["kind", "reference"], findings, `${path}.data`)) {
    if (
      !["synthetic", "fixture", "redacted_observation", "none"].includes(String(raw.data.kind)) ||
      !validReference(raw.data.reference)
    ) {
      addFinding(
        findings,
        "registry_schema_invalid",
        `${path}.data`,
        "data declaration is invalid",
      );
    }
  }

  validateSampling(raw.sampling, findings, `${path}.sampling`);
  validateBaseline(raw.baseline, findings, `${path}.baseline`);
  validateTarget(raw.target, findings, `${path}.target`);
  validateSlo(raw.slo, findings, `${path}.slo`);
  validateBudgetOrLimit(raw.error_budget, findings, `${path}.error_budget`);
  validateBudgetOrLimit(raw.hard_limit, findings, `${path}.hard_limit`);
  validateFreshness(raw.freshness_policy, findings, `${path}.freshness_policy`);
  validateThreshold(raw.threshold, metric, findings, `${path}.threshold`);

  if (strictObject(raw.window, ["kind", "value", "unit"], findings, `${path}.window`)) {
    if (
      !["run", "sample", "release", "time"].includes(String(raw.window.kind)) ||
      !finiteNumber(raw.window.value) ||
      raw.window.value <= 0 ||
      !nonEmptyString(raw.window.unit)
    ) {
      addFinding(findings, "registry_schema_invalid", `${path}.window`, "window is invalid");
    }
  }
  if (strictObject(raw.probe, ["id", "reference", "read_only"], findings, `${path}.probe`)) {
    if (!nonEmptyString(raw.probe.id) || !validReference(raw.probe.reference)) {
      addFinding(
        findings,
        "registry_schema_invalid",
        `${path}.probe`,
        "probe reference is invalid",
      );
    }
    if (raw.probe.read_only !== true) {
      addFinding(
        findings,
        "implementation_detail_in_nfr",
        `${path}.probe.read_only`,
        "registry probe declaration must be read-only",
      );
    }
  }
  if (strictObject(raw.oracle, ["id", "test_path", "expectation"], findings, `${path}.oracle`)) {
    if (
      !nonEmptyString(raw.oracle.id) ||
      !ORACLE_ID.test(raw.oracle.id) ||
      !safeRepoPath(raw.oracle.test_path) ||
      !raw.oracle.test_path.startsWith("tests/") ||
      !raw.oracle.test_path.endsWith(".test.ts") ||
      !nonEmptyString(raw.oracle.expectation)
    ) {
      addFinding(
        findings,
        "oracle_reference_invalid",
        `${path}.oracle`,
        "oracle id/test/expectation binding is invalid",
      );
    }
  }
  if (!nonEmptyString(raw.owner) || !OWNER.test(raw.owner)) {
    addFinding(findings, "owner_missing", `${path}.owner`, "kebab-case owner required");
  }
  if (!safeRepoPath(raw.evidence_path)) {
    addFinding(
      findings,
      "evidence_path_invalid",
      `${path}.evidence_path`,
      "safe repo-relative evidence path required",
    );
  }
  if (!validStringArray(raw.remeasure_trigger)) {
    addFinding(
      findings,
      "remeasure_trigger_empty",
      `${path}.remeasure_trigger`,
      "unique non-empty triggers required",
    );
  }
}

export function analyzeNfrRegistry(input: unknown, repoRoot?: string): NfrAnalysis {
  const findings: Finding[] = [];
  if (
    !strictObject(input, ROOT_KEYS, findings, "registry", {
      missingCode: "registry_schema_invalid",
      extraCode: "registry_schema_invalid",
      invalidCode: "registry_schema_invalid",
    })
  ) {
    return {
      ok: false,
      failureCodes: ["registry_schema_invalid"],
      messages: findings.map((finding) => finding.message),
    };
  }
  if (input.schema_version !== "helix-nfr-registry.v1") {
    addFinding(
      findings,
      "registry_schema_invalid",
      "registry.schema_version",
      "helix-nfr-registry.v1 required",
    );
  }
  if (input.registry_id !== "nfr-registry") {
    addFinding(
      findings,
      "registry_schema_invalid",
      "registry.registry_id",
      "nfr-registry required",
    );
  }
  if (!Array.isArray(input.entries) || input.entries.length === 0) {
    addFinding(findings, "required_field_missing", "registry.entries", "non-empty array required");
  } else {
    const ids = new Set<string>();
    for (const [index, entry] of input.entries.entries()) {
      validateEntry(entry, index, findings, ids, repoRoot);
    }
    for (const requiredId of NFR_REGISTRY_REQUIRED_IDS) {
      if (!ids.has(requiredId)) {
        addFinding(
          findings,
          "required_field_missing",
          "registry.entries",
          `required trace ${requiredId} missing`,
        );
      }
    }
  }

  if (findings.length > 0) {
    const present = new Set(findings.map((finding) => finding.code));
    return {
      ok: false,
      failureCodes: FAILURE_CODE_ORDER.filter((code) => present.has(code)),
      messages: findings.map((finding) => finding.message),
    };
  }
  return { ok: true, value: input as unknown as NfrRegistryV1 };
}

function declarationWithoutRevision(entry: NfrEntryV1): Record<string, unknown> {
  const declaration = { ...entry } as Record<string, unknown>;
  delete declaration.revision;
  return declaration;
}

/**
 * Pure admission boundary for a registry revision. It validates the previous
 * snapshot structurally, validates the candidate against current source bytes,
 * and then enforces stable IDs plus one-step, material revisions. Persistence
 * and probe execution remain outside this module.
 */
export function admitNfrRegistryMigration(
  previousInput: unknown,
  candidateInput: unknown,
  repoRoot?: string,
): NfrAnalysis {
  const previous = analyzeNfrRegistry(previousInput);
  if (!previous.ok) {
    return {
      ok: false,
      failureCodes: previous.failureCodes,
      messages: previous.messages.map((message) => `previous:${message}`),
    };
  }

  const candidate = analyzeNfrRegistry(candidateInput, repoRoot);
  if (!candidate.ok) {
    return {
      ok: false,
      failureCodes: candidate.failureCodes,
      messages: candidate.messages.map((message) => `candidate:${message}`),
    };
  }

  const findings: Finding[] = [];
  const previousById = new Map(previous.value.entries.map((entry) => [entry.nfr_id, entry]));
  const candidateById = new Map(candidate.value.entries.map((entry) => [entry.nfr_id, entry]));

  for (const [nfrId, previousEntry] of previousById) {
    const candidateEntry = candidateById.get(nfrId);
    if (!candidateEntry) {
      addFinding(findings, "migration_entry_removed", `entries.${nfrId}`, "stable ID removed");
      continue;
    }
    if (candidateEntry.revision < previousEntry.revision) {
      addFinding(
        findings,
        "migration_revision_regressed",
        `entries.${nfrId}.revision`,
        `${previousEntry.revision}->${candidateEntry.revision}`,
      );
      continue;
    }

    const declarationChanged = !isDeepStrictEqual(
      declarationWithoutRevision(previousEntry),
      declarationWithoutRevision(candidateEntry),
    );
    if (!declarationChanged && candidateEntry.revision !== previousEntry.revision) {
      addFinding(
        findings,
        "migration_revision_empty_bump",
        `entries.${nfrId}.revision`,
        "revision changed without a declaration change",
      );
    } else if (declarationChanged && candidateEntry.revision !== previousEntry.revision + 1) {
      addFinding(
        findings,
        "migration_revision_not_incremented",
        `entries.${nfrId}.revision`,
        `material change requires ${previousEntry.revision + 1}`,
      );
    }
  }

  for (const [nfrId, candidateEntry] of candidateById) {
    if (!previousById.has(nfrId) && candidateEntry.revision !== 1) {
      addFinding(
        findings,
        "migration_new_entry_revision_invalid",
        `entries.${nfrId}.revision`,
        "new stable ID must start at revision 1",
      );
    }
  }

  if (findings.length > 0) {
    const present = new Set(findings.map((finding) => finding.code));
    return {
      ok: false,
      failureCodes: FAILURE_CODE_ORDER.filter((code) => present.has(code)),
      messages: findings.map((finding) => finding.message),
    };
  }
  return candidate;
}

export const parseNfrRegistry = analyzeNfrRegistry;

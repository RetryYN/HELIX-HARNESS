import { readFileSync, realpathSync } from "node:fs";
import { isAbsolute, relative, resolve, sep } from "node:path";
import { z } from "zod";
import { canonicalJson, sha256Digest } from "./digest";

export const UNIVERSAL_IMPROVEMENT_SOURCE_REGISTRY_PATH =
  "config/universal-improvement-source-registry.v1.json" as const;
export const UNIVERSAL_IMPROVEMENT_SOURCE_REGISTRY_INTEGRITY_PATH =
  "config/universal-improvement-source-registry.v1.integrity.json" as const;
export const UNIVERSAL_IMPROVEMENT_SOURCE_REGISTRY_SCHEMA_VERSION =
  "helix-universal-improvement-source-registry.v1" as const;
export const UNIVERSAL_IMPROVEMENT_SOURCE_REGISTRY_INTEGRITY_SCHEMA_VERSION =
  "helix-universal-improvement-source-registry-integrity.v1" as const;
export const UNIVERSAL_IMPROVEMENT_SOURCE_REGISTRY_ID =
  "universal-improvement-source-registry" as const;
export const UNIVERSAL_IMPROVEMENT_REQUIREMENTS_PATH =
  "docs/design/helix/L3-requirements/universal-improvement-loop-requirements.md" as const;

export const UNIVERSAL_IMPROVEMENT_SOURCE_KINDS = [
  "ci",
  "db",
  "requirements",
  "definition",
  "dependency",
  "review",
  "operations",
  "provider",
  "distribution",
  "resource_security",
] as const;

export type UniversalImprovementSourceKind = (typeof UNIVERSAL_IMPROVEMENT_SOURCE_KINDS)[number];

export const UNIVERSAL_IMPROVEMENT_REQUIREMENT_IDS = [
  "UIL-FR-001",
  "UIL-FR-002",
  "UIL-FR-003",
  "UIL-FR-004",
  "UIL-FR-005",
  "UIL-FR-006",
  "UIL-FR-007",
  "UIL-R-01",
  "UIL-R-02",
  "UIL-R-03",
  "UIL-R-04",
  "UIL-R-05",
  "UIL-R-06",
  "UIL-R-07",
  "UIL-R-08",
  "UIL-R-09",
  "UIL-R-10",
  "UIL-R-11",
  "UIL-R-12",
  "UIL-R-13",
  "UIL-R-14",
  "UIL-AC-001",
  "UIL-AC-002",
  "UIL-AC-003",
  "UIL-AC-004",
  "UIL-AC-005",
  "UIL-AC-006",
  "UIL-AC-007",
  "UIL-AC-008",
  "UIL-AC-009",
  "UIL-AC-010",
  "UIL-AC-011",
  "UIL-AC-012",
  "UIL-AC-013",
  "UIL-AC-014",
  "UIL-AC-015",
  "UIL-AC-016",
  "UIL-AC-017",
  "UIL-AC-018",
  "UIL-AC-019",
  "UIL-AC-020",
  "UIL-AC-021",
  "UIL-AC-022",
] as const;

export type UniversalImprovementRequirementId =
  (typeof UNIVERSAL_IMPROVEMENT_REQUIREMENT_IDS)[number];

const DIGEST_PATTERN = /^sha256:[a-f0-9]{64}$/u;
const SOURCE_ID_PATTERN = /^UIL-SRC-\d{3}$/u;
const DETECTOR_ID_PATTERN = /^UIL-DET-\d{3}$/u;
const VERSION_PATTERN = /^\d+\.\d+\.\d+$/u;
const SCHEMA_VERSION_PATTERN = /^[a-z][a-z0-9-]*\.v\d+$/u;
const FIELD_PATTERN = /^[a-z][a-z0-9_]*$/u;
const OWNER_PATTERN = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/u;

const REQUIRED_OBSERVATION_FIELDS = [
  "source_id",
  "schema_version",
  "detector_id",
  "source_revision",
  "observed_at",
  "payload_digest",
  "evidence_digest",
] as const;
const IDENTITY_OBSERVATION_FIELDS = [
  "source_id",
  "schema_version",
  "detector_id",
  "source_revision",
] as const;
const DIGEST_OBSERVATION_FIELDS = ["payload_digest", "evidence_digest"] as const;

const digestSchema = z.string().regex(DIGEST_PATTERN);
const sourceIdSchema = z.string().regex(SOURCE_ID_PATTERN);
const detectorIdSchema = z.string().regex(DETECTOR_ID_PATTERN);
const repoRelativePathSchema = z
  .string()
  .min(1)
  .refine(
    (path) =>
      !isAbsolute(path) &&
      !path.includes("\\") &&
      !path.includes("\0") &&
      path.split("/").every((part) => part !== "" && part !== "." && part !== ".."),
    "repository-relative POSIX path required",
  );

const authoritySchema = z
  .object({
    kind: z.enum([
      "requirements",
      "design",
      "runtime",
      "ci",
      "database",
      "dependency",
      "review",
      "operation",
      "provider",
      "distribution",
      "security",
    ]),
    artifact_path: repoRelativePathSchema,
    locator: z.string().min(1),
    source_digest: digestSchema,
  })
  .strict();

const detectorSchema = z
  .object({
    detector_id: detectorIdSchema,
    detector_version: z.string().regex(VERSION_PATTERN),
    implementation: z
      .object({
        kind: z.literal("repository_module"),
        path: repoRelativePathSchema,
        digest: digestSchema,
      })
      .strict(),
    deterministic: z.literal(true),
  })
  .strict();

const evidenceContractSchema = z
  .object({
    required_fields: z.array(z.string().regex(FIELD_PATTERN)).min(1),
    identity_fields: z.array(z.string().regex(FIELD_PATTERN)).min(1),
    digest_fields: z.array(z.string().regex(FIELD_PATTERN)).min(1),
    read_only: z.literal(true),
  })
  .strict()
  .superRefine((contract, context) => {
    const required = new Set(contract.required_fields);
    for (const field of contract.identity_fields) {
      if (!required.has(field)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["identity_fields"],
          message: `identity field is not required: ${field}`,
        });
      }
    }
    for (const field of contract.digest_fields) {
      if (!required.has(field)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["digest_fields"],
          message: `digest field is not required: ${field}`,
        });
      }
    }
    if (new Set(contract.required_fields).size !== contract.required_fields.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["required_fields"],
        message: "required_fields must be unique",
      });
    }
  });

const sourceEntrySchema = z
  .object({
    source_id: sourceIdSchema,
    source_kind: z.enum(UNIVERSAL_IMPROVEMENT_SOURCE_KINDS),
    owner: z.string().regex(OWNER_PATTERN),
    authority: authoritySchema,
    schema_version: z.string().regex(SCHEMA_VERSION_PATTERN),
    revision: z.number().int().positive(),
    retention: z
      .object({
        policy_ref: z.string().min(1),
        max_age_seconds: z.number().int().positive(),
      })
      .strict(),
    redaction: z
      .object({
        policy_ref: z.string().min(1),
        mode: z.enum(["digest_only", "metadata_only"]),
      })
      .strict(),
    failure_disposition: z.literal("fail_close"),
    detector: detectorSchema,
    evidence_contract: evidenceContractSchema,
    freshness: z
      .object({
        max_age_seconds: z.number().int().positive(),
        policy_ref: z.string().min(1),
      })
      .strict(),
    environments: z.array(z.string().regex(OWNER_PATTERN)).min(1),
    trigger_events: z.array(z.string().min(1)).min(1),
    status: z.literal("active"),
  })
  .strict();

const authorityRequirementIdSchema = z.string().regex(/^UIL-(?:FR-\d{3}|R-\d{2}|AC-\d{3})$/u);

const universalImprovementSourceObservationSchema = z
  .object({
    source_id: z.string(),
    schema_version: z.string(),
    detector_id: z.string(),
    source_revision: z.string(),
    observed_at: z.string(),
    payload_digest: z.string(),
    evidence_digest: z.string(),
  })
  .catchall(z.unknown());

export const universalImprovementSourceRegistrySchema = z
  .object({
    schema_version: z.literal(UNIVERSAL_IMPROVEMENT_SOURCE_REGISTRY_SCHEMA_VERSION),
    registry_id: z.literal(UNIVERSAL_IMPROVEMENT_SOURCE_REGISTRY_ID),
    registry_version: z.string().regex(VERSION_PATTERN),
    authority: z
      .object({
        kind: z.literal("requirements"),
        artifact_path: z.literal(UNIVERSAL_IMPROVEMENT_REQUIREMENTS_PATH),
        locator: z.string().min(1),
        source_digest: digestSchema,
        requirement_ids: z.array(authorityRequirementIdSchema).min(1),
      })
      .strict(),
    required_source_kinds: z.array(z.enum(UNIVERSAL_IMPROVEMENT_SOURCE_KINDS)).min(1),
    entries: z.array(sourceEntrySchema).min(1),
  })
  .strict();

export type UniversalImprovementSourceRegistry = z.infer<
  typeof universalImprovementSourceRegistrySchema
>;
export type UniversalImprovementSourceEntry = z.infer<typeof sourceEntrySchema>;

const universalImprovementSourceRegistryIntegritySchema = z
  .object({
    schema_version: z.literal(UNIVERSAL_IMPROVEMENT_SOURCE_REGISTRY_INTEGRITY_SCHEMA_VERSION),
    registry_path: z.literal(UNIVERSAL_IMPROVEMENT_SOURCE_REGISTRY_PATH),
    registry_bytes_digest: digestSchema,
    integrity_policy: z.literal("exact_bytes"),
  })
  .strict();

export type UniversalImprovementSourceRegistryFailureCode =
  | "registry_missing"
  | "registry_json_invalid"
  | "registry_schema_invalid"
  | "repository_root_required"
  | "registry_integrity_missing"
  | "registry_integrity_json_invalid"
  | "registry_integrity_schema_invalid"
  | "registry_bytes_digest_mismatch"
  | "registry_input_mismatch"
  | "physical_binding_required"
  | "duplicate_source_id"
  | "duplicate_detector_id"
  | "duplicate_source_kind"
  | "missing_source_kind"
  | "unsafe_source_path"
  | "source_missing"
  | "source_digest_mismatch"
  | "detector_missing"
  | "detector_digest_mismatch"
  | "unknown_source"
  | "source_schema_mismatch"
  | "source_revision_mismatch"
  | "detector_identity_mismatch"
  | "observation_field_missing"
  | "observation_digest_invalid"
  | "observation_timestamp_invalid"
  | "observation_timestamp_future"
  | "observation_sensitive_field_forbidden"
  | "observation_stale";

export interface UniversalImprovementSourceRegistryFinding {
  code: UniversalImprovementSourceRegistryFailureCode;
  subject: string;
  message: string;
}

export interface UniversalImprovementSourceRegistryResult {
  ok: boolean;
  registry: UniversalImprovementSourceRegistry | null;
  physical_binding_verified: boolean;
  registry_bytes_digest: string | null;
  findings: UniversalImprovementSourceRegistryFinding[];
}

export interface UniversalImprovementSourceObservation {
  source_id: string;
  schema_version: string;
  detector_id: string;
  source_revision: string;
  observed_at: string;
  payload_digest: string;
  evidence_digest: string;
  [key: string]: unknown;
}

export interface UniversalImprovementSourceAdmission {
  ok: boolean;
  entry: UniversalImprovementSourceEntry | null;
  registry_version: string | null;
  registry_source_digest: string | null;
  registry_bytes_digest: string | null;
  findings: UniversalImprovementSourceRegistryFinding[];
}

function finding(
  code: UniversalImprovementSourceRegistryFailureCode,
  subject: string,
  message: string,
): UniversalImprovementSourceRegistryFinding {
  return { code, subject, message };
}

function isSafeRepositoryPath(path: string): boolean {
  return repoRelativePathSchema.safeParse(path).success;
}

type RepositoryFileResolution =
  | { kind: "ok"; path: string }
  | { kind: "missing" }
  | { kind: "unsafe" };

function resolveRepositoryFile(repoRoot: string, path: string): RepositoryFileResolution {
  if (!isSafeRepositoryPath(path)) return { kind: "unsafe" };
  try {
    const realRoot = realpathSync(repoRoot);
    const realSource = realpathSync(resolve(realRoot, path));
    const relativeSource = relative(realRoot, realSource);
    if (
      relativeSource === "" ||
      relativeSource === ".." ||
      relativeSource.startsWith(`..${sep}`) ||
      isAbsolute(relativeSource)
    ) {
      return { kind: "unsafe" };
    }
    return { kind: "ok", path: realSource };
  } catch {
    return { kind: "missing" };
  }
}

function repositoryFileDigest(
  repoRoot: string,
  path: string,
): { kind: "ok"; digest: string } | { kind: "missing" } | { kind: "unsafe" } {
  const resolved = resolveRepositoryFile(repoRoot, path);
  if (resolved.kind !== "ok") return resolved;
  try {
    return { kind: "ok", digest: sha256Digest(readFileSync(resolved.path)) };
  } catch {
    return { kind: "missing" };
  }
}

function parseStrictTimestamp(value: unknown): number | null {
  if (typeof value !== "string") return null;
  const match =
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/u.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  const second = Number(match[6]);
  const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const daysInMonth = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > (daysInMonth[month - 1] ?? 0) ||
    hour > 23 ||
    minute > 59 ||
    second > 59
  ) {
    return null;
  }
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function collectForbiddenObservationFields(value: unknown, path: string, paths: Set<string>): void {
  if (Array.isArray(value)) {
    for (const [index, child] of value.entries()) {
      collectForbiddenObservationFields(child, `${path}[${index}]`, paths);
    }
    return;
  }
  if (typeof value !== "object" || value === null) return;
  for (const [key, child] of Object.entries(value)) {
    const childPath = `${path}.${key}`;
    if (
      /(?:raw[_-]?log|stdout|stderr|credential|secret|password|passwd|api[_-]?key|private[_-]?key|\btoken\b|\bpii\b)/iu.test(
        key,
      )
    ) {
      paths.add(childPath);
    }
    collectForbiddenObservationFields(child, childPath, paths);
  }
}

interface BoundSourceInput {
  findings: UniversalImprovementSourceRegistryFinding[];
  repoRoot: string;
  path: string;
  expectedDigest: string;
  subject: string;
  missingCode: "source_missing" | "detector_missing";
  mismatchCode: "source_digest_mismatch" | "detector_digest_mismatch";
}

function checkBoundSource(input: BoundSourceInput): void {
  const { findings, repoRoot, path, expectedDigest, subject, missingCode, mismatchCode } = input;
  const actual = repositoryFileDigest(repoRoot, path);
  if (actual.kind === "unsafe") {
    findings.push(finding("unsafe_source_path", subject, `unsafe repository path: ${path}`));
  } else if (actual.kind === "missing") {
    findings.push(finding(missingCode, subject, `source file is missing: ${path}`));
  } else if (actual.digest !== expectedDigest) {
    findings.push(
      finding(
        mismatchCode,
        subject,
        `expected=${expectedDigest} actual=${actual.digest} path=${path}`,
      ),
    );
  }
}

function analyzeUniversalImprovementSourceRegistryStructure(
  input: unknown,
): UniversalImprovementSourceRegistryResult {
  const parsed = universalImprovementSourceRegistrySchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      registry: null,
      physical_binding_verified: false,
      registry_bytes_digest: null,
      findings: [
        finding(
          "registry_schema_invalid",
          "registry",
          parsed.error.issues.map((issue) => `${issue.path.join(".")}:${issue.message}`).join("; "),
        ),
      ],
    };
  }

  const registry = parsed.data;
  const findings: UniversalImprovementSourceRegistryFinding[] = [];
  const sourceIds = new Set<string>();
  const detectorIds = new Set<string>();
  const sourceKinds = new Set<string>();

  const canonicalSourceKinds = new Set(UNIVERSAL_IMPROVEMENT_SOURCE_KINDS);
  const configuredSourceKinds = new Set(registry.required_source_kinds);
  if (
    configuredSourceKinds.size !== registry.required_source_kinds.length ||
    configuredSourceKinds.size !== canonicalSourceKinds.size ||
    !UNIVERSAL_IMPROVEMENT_SOURCE_KINDS.every((kind) => configuredSourceKinds.has(kind))
  ) {
    findings.push(
      finding(
        "registry_schema_invalid",
        "required_source_kinds",
        "required source kinds must equal the canonical source-kind set",
      ),
    );
  }

  const canonicalRequirementIds = new Set(UNIVERSAL_IMPROVEMENT_REQUIREMENT_IDS);
  const configuredRequirementIds = new Set(registry.authority.requirement_ids);
  if (
    configuredRequirementIds.size !== registry.authority.requirement_ids.length ||
    configuredRequirementIds.size !== canonicalRequirementIds.size ||
    !UNIVERSAL_IMPROVEMENT_REQUIREMENT_IDS.every((id) => configuredRequirementIds.has(id))
  ) {
    findings.push(
      finding(
        "registry_schema_invalid",
        "authority.requirement_ids",
        "authority requirement IDs must equal the canonical FR/R/AC set",
      ),
    );
  }

  for (const entry of registry.entries) {
    if (sourceIds.has(entry.source_id)) {
      findings.push(finding("duplicate_source_id", entry.source_id, "source_id must be unique"));
    }
    sourceIds.add(entry.source_id);
    if (sourceKinds.has(entry.source_kind)) {
      findings.push(
        finding(
          "duplicate_source_kind",
          entry.source_kind,
          "source_kind must have exactly one active registry entry",
        ),
      );
    }
    sourceKinds.add(entry.source_kind);

    const requiredFields = new Set(entry.evidence_contract.required_fields);
    const identityFields = new Set(entry.evidence_contract.identity_fields);
    const digestFields = new Set(entry.evidence_contract.digest_fields);
    for (const field of REQUIRED_OBSERVATION_FIELDS) {
      if (!requiredFields.has(field)) {
        findings.push(
          finding(
            "registry_schema_invalid",
            `${entry.source_id}.evidence_contract.required_fields`,
            `required observation field is missing from contract: ${field}`,
          ),
        );
      }
    }
    for (const field of IDENTITY_OBSERVATION_FIELDS) {
      if (!identityFields.has(field)) {
        findings.push(
          finding(
            "registry_schema_invalid",
            `${entry.source_id}.evidence_contract.identity_fields`,
            `identity observation field is missing from contract: ${field}`,
          ),
        );
      }
    }
    for (const field of DIGEST_OBSERVATION_FIELDS) {
      if (!digestFields.has(field)) {
        findings.push(
          finding(
            "registry_schema_invalid",
            `${entry.source_id}.evidence_contract.digest_fields`,
            `digest observation field is missing from contract: ${field}`,
          ),
        );
      }
    }

    if (detectorIds.has(entry.detector.detector_id)) {
      findings.push(
        finding("duplicate_detector_id", entry.detector.detector_id, "detector_id must be unique"),
      );
    }
    detectorIds.add(entry.detector.detector_id);
  }

  for (const sourceKind of UNIVERSAL_IMPROVEMENT_SOURCE_KINDS) {
    if (!sourceKinds.has(sourceKind)) {
      findings.push(
        finding(
          "missing_source_kind",
          sourceKind,
          "required source kind has no active registry entry",
        ),
      );
    }
  }

  return {
    ok: findings.length === 0,
    registry,
    physical_binding_verified: false,
    registry_bytes_digest: null,
    findings,
  };
}

export function validateUniversalImprovementSourceRegistryStructure(
  input: unknown,
): UniversalImprovementSourceRegistryResult {
  return analyzeUniversalImprovementSourceRegistryStructure(input);
}

export function analyzeUniversalImprovementSourceRegistry(
  input: unknown,
  repoRoot: string,
): UniversalImprovementSourceRegistryResult {
  const structural = analyzeUniversalImprovementSourceRegistryStructure(input);
  if (!repoRoot || repoRoot.trim().length === 0) {
    return {
      ...structural,
      ok: false,
      findings: [
        ...structural.findings,
        finding(
          "repository_root_required",
          "repository",
          "repository root is required for authority binding",
        ),
      ],
    };
  }
  if (!structural.registry || structural.findings.length > 0) return structural;

  const registryFile = resolveRepositoryFile(repoRoot, UNIVERSAL_IMPROVEMENT_SOURCE_REGISTRY_PATH);
  if (registryFile.kind === "missing") {
    return {
      ...structural,
      ok: false,
      findings: [
        ...structural.findings,
        finding(
          "registry_missing",
          UNIVERSAL_IMPROVEMENT_SOURCE_REGISTRY_PATH,
          "universal improvement source registry is missing",
        ),
      ],
    };
  }
  if (registryFile.kind === "unsafe") {
    return {
      ...structural,
      ok: false,
      findings: [
        ...structural.findings,
        finding(
          "unsafe_source_path",
          UNIVERSAL_IMPROVEMENT_SOURCE_REGISTRY_PATH,
          "registry path resolves outside the repository",
        ),
      ],
    };
  }

  let registryBytes: Buffer;
  let currentRaw: unknown;
  try {
    registryBytes = readFileSync(registryFile.path);
    currentRaw = JSON.parse(registryBytes.toString("utf8")) as unknown;
  } catch {
    return {
      ...structural,
      ok: false,
      findings: [
        ...structural.findings,
        finding(
          "registry_json_invalid",
          UNIVERSAL_IMPROVEMENT_SOURCE_REGISTRY_PATH,
          "registry JSON is invalid",
        ),
      ],
    };
  }

  const registryBytesDigest = sha256Digest(registryBytes);
  const currentParsed = universalImprovementSourceRegistrySchema.safeParse(currentRaw);
  if (
    !currentParsed.success ||
    canonicalJson(currentParsed.data) !== canonicalJson(structural.registry)
  ) {
    return {
      ...structural,
      ok: false,
      registry_bytes_digest: registryBytesDigest,
      findings: [
        ...structural.findings,
        finding(
          "registry_input_mismatch",
          UNIVERSAL_IMPROVEMENT_SOURCE_REGISTRY_PATH,
          "analyzed registry input does not match the current repository registry bytes",
        ),
      ],
    };
  }

  const integrityFile = resolveRepositoryFile(
    repoRoot,
    UNIVERSAL_IMPROVEMENT_SOURCE_REGISTRY_INTEGRITY_PATH,
  );
  if (integrityFile.kind === "missing") {
    return {
      ...structural,
      ok: false,
      registry_bytes_digest: registryBytesDigest,
      findings: [
        ...structural.findings,
        finding(
          "registry_integrity_missing",
          UNIVERSAL_IMPROVEMENT_SOURCE_REGISTRY_INTEGRITY_PATH,
          "registry exact-bytes integrity record is missing",
        ),
      ],
    };
  }
  if (integrityFile.kind === "unsafe") {
    return {
      ...structural,
      ok: false,
      registry_bytes_digest: registryBytesDigest,
      findings: [
        ...structural.findings,
        finding(
          "unsafe_source_path",
          UNIVERSAL_IMPROVEMENT_SOURCE_REGISTRY_INTEGRITY_PATH,
          "registry integrity path resolves outside the repository",
        ),
      ],
    };
  }

  let integrityRaw: unknown;
  try {
    integrityRaw = JSON.parse(readFileSync(integrityFile.path, "utf8")) as unknown;
  } catch {
    return {
      ...structural,
      ok: false,
      registry_bytes_digest: registryBytesDigest,
      findings: [
        ...structural.findings,
        finding(
          "registry_integrity_json_invalid",
          UNIVERSAL_IMPROVEMENT_SOURCE_REGISTRY_INTEGRITY_PATH,
          "registry exact-bytes integrity JSON is invalid",
        ),
      ],
    };
  }
  const integrity = universalImprovementSourceRegistryIntegritySchema.safeParse(integrityRaw);
  if (!integrity.success) {
    return {
      ...structural,
      ok: false,
      registry_bytes_digest: registryBytesDigest,
      findings: [
        ...structural.findings,
        finding(
          "registry_integrity_schema_invalid",
          UNIVERSAL_IMPROVEMENT_SOURCE_REGISTRY_INTEGRITY_PATH,
          integrity.error.issues
            .map((issue) => `${issue.path.join(".")}:${issue.message}`)
            .join("; "),
        ),
      ],
    };
  }

  const findings: UniversalImprovementSourceRegistryFinding[] = [];
  if (integrity.data.registry_bytes_digest !== registryBytesDigest) {
    findings.push(
      finding(
        "registry_bytes_digest_mismatch",
        UNIVERSAL_IMPROVEMENT_SOURCE_REGISTRY_PATH,
        `expected=${integrity.data.registry_bytes_digest} actual=${registryBytesDigest}`,
      ),
    );
  }
  for (const entry of structural.registry.entries) {
    checkBoundSource({
      findings,
      repoRoot,
      path: entry.authority.artifact_path,
      expectedDigest: entry.authority.source_digest,
      subject: entry.source_id,
      missingCode: "source_missing",
      mismatchCode: "source_digest_mismatch",
    });
    checkBoundSource({
      findings,
      repoRoot,
      path: entry.detector.implementation.path,
      expectedDigest: entry.detector.implementation.digest,
      subject: entry.detector.detector_id,
      missingCode: "detector_missing",
      mismatchCode: "detector_digest_mismatch",
    });
  }
  checkBoundSource({
    findings,
    repoRoot,
    path: structural.registry.authority.artifact_path,
    expectedDigest: structural.registry.authority.source_digest,
    subject: "registry-authority",
    missingCode: "source_missing",
    mismatchCode: "source_digest_mismatch",
  });
  return {
    ok: findings.length === 0,
    registry: structural.registry,
    physical_binding_verified: true,
    registry_bytes_digest: registryBytesDigest,
    findings,
  };
}

export function loadUniversalImprovementSourceRegistry(
  repoRoot: string,
): UniversalImprovementSourceRegistryResult {
  const registryFile = resolveRepositoryFile(repoRoot, UNIVERSAL_IMPROVEMENT_SOURCE_REGISTRY_PATH);
  if (registryFile.kind === "missing") {
    return {
      ok: false,
      registry: null,
      physical_binding_verified: false,
      registry_bytes_digest: null,
      findings: [
        finding(
          "registry_missing",
          UNIVERSAL_IMPROVEMENT_SOURCE_REGISTRY_PATH,
          "universal improvement source registry is missing",
        ),
      ],
    };
  }
  if (registryFile.kind === "unsafe") {
    return {
      ok: false,
      registry: null,
      physical_binding_verified: false,
      registry_bytes_digest: null,
      findings: [
        finding(
          "unsafe_source_path",
          UNIVERSAL_IMPROVEMENT_SOURCE_REGISTRY_PATH,
          "registry path resolves outside the repository",
        ),
      ],
    };
  }

  let raw: unknown;
  try {
    raw = JSON.parse(readFileSync(registryFile.path, "utf8")) as unknown;
  } catch {
    return {
      ok: false,
      registry: null,
      physical_binding_verified: false,
      registry_bytes_digest: null,
      findings: [
        finding(
          "registry_json_invalid",
          UNIVERSAL_IMPROVEMENT_SOURCE_REGISTRY_PATH,
          "registry JSON is invalid",
        ),
      ],
    };
  }
  return analyzeUniversalImprovementSourceRegistry(raw, repoRoot);
}

export function admitUniversalImprovementSource(
  registryResult: UniversalImprovementSourceRegistryResult,
  observation: UniversalImprovementSourceObservation,
  now: Date = new Date(),
): UniversalImprovementSourceAdmission {
  const base = {
    entry: null,
    registry_version: registryResult.registry?.registry_version ?? null,
    registry_source_digest: registryResult.registry?.authority.source_digest ?? null,
    registry_bytes_digest: registryResult.registry_bytes_digest,
  };
  if (!registryResult.ok || !registryResult.registry || !registryResult.physical_binding_verified) {
    const findings = [...registryResult.findings];
    if (!registryResult.physical_binding_verified) {
      findings.push(
        finding(
          "physical_binding_required",
          "registry",
          "source admission requires a repository-bound registry result",
        ),
      );
    }
    return { ok: false, ...base, findings };
  }

  const parsedObservation = universalImprovementSourceObservationSchema.safeParse(observation);
  if (!parsedObservation.success) {
    return {
      ok: false,
      ...base,
      findings: [
        finding(
          "observation_field_missing",
          "observation",
          parsedObservation.error.issues
            .map((issue) => `${issue.path.join(".")}:${issue.message}`)
            .join("; "),
        ),
      ],
    };
  }
  const admittedObservation = parsedObservation.data;

  const entry = registryResult.registry.entries.find(
    (candidate) => candidate.source_id === admittedObservation.source_id,
  );
  if (!entry) {
    return {
      ok: false,
      ...base,
      findings: [
        finding(
          "unknown_source",
          admittedObservation.source_id,
          "source_id is not registered by the current authority",
        ),
      ],
    };
  }

  const findings: UniversalImprovementSourceRegistryFinding[] = [];
  const forbiddenObservationFields = new Set<string>();
  collectForbiddenObservationFields(admittedObservation, "observation", forbiddenObservationFields);
  for (const path of [...forbiddenObservationFields].sort()) {
    findings.push(
      finding(
        "observation_sensitive_field_forbidden",
        admittedObservation.source_id,
        `sensitive observation field is forbidden: ${path}`,
      ),
    );
  }
  if (admittedObservation.schema_version !== entry.schema_version) {
    findings.push(
      finding(
        "source_schema_mismatch",
        admittedObservation.source_id,
        `expected=${entry.schema_version} actual=${admittedObservation.schema_version}`,
      ),
    );
  }
  if (admittedObservation.detector_id !== entry.detector.detector_id) {
    findings.push(
      finding(
        "detector_identity_mismatch",
        admittedObservation.source_id,
        `expected=${entry.detector.detector_id} actual=${admittedObservation.detector_id}`,
      ),
    );
  }
  if (admittedObservation.source_revision !== String(entry.revision)) {
    findings.push(
      finding(
        "source_revision_mismatch",
        admittedObservation.source_id,
        `expected=${entry.revision} actual=${admittedObservation.source_revision}`,
      ),
    );
  }
  for (const field of entry.evidence_contract.required_fields) {
    const value = admittedObservation[field];
    if (typeof value !== "string" || value.trim().length === 0) {
      findings.push(
        finding(
          "observation_field_missing",
          admittedObservation.source_id,
          `required observation field is missing: ${field}`,
        ),
      );
    }
  }
  if (!DIGEST_PATTERN.test(admittedObservation.payload_digest)) {
    findings.push(
      finding(
        "observation_digest_invalid",
        admittedObservation.source_id,
        "payload_digest must be a sha256 digest",
      ),
    );
  }
  if (!DIGEST_PATTERN.test(admittedObservation.evidence_digest)) {
    findings.push(
      finding(
        "observation_digest_invalid",
        admittedObservation.source_id,
        "evidence_digest must be a sha256 digest",
      ),
    );
  }
  const observedAt = parseStrictTimestamp(admittedObservation.observed_at);
  const nowAt = now instanceof Date ? now.getTime() : Number.NaN;
  if (observedAt === null || !Number.isFinite(nowAt)) {
    findings.push(
      finding(
        "observation_timestamp_invalid",
        admittedObservation.source_id,
        "observed_at and evaluation time must be valid timestamps",
      ),
    );
  } else if (observedAt > nowAt) {
    findings.push(
      finding(
        "observation_timestamp_future",
        admittedObservation.source_id,
        "observed_at must not be in the future",
      ),
    );
  } else if ((nowAt - observedAt) / 1000 > entry.freshness.max_age_seconds) {
    findings.push(
      finding(
        "observation_stale",
        admittedObservation.source_id,
        "max_age_seconds=" +
          entry.freshness.max_age_seconds +
          " age_seconds=" +
          Math.floor((nowAt - observedAt) / 1000),
      ),
    );
  }

  return {
    ok: findings.length === 0,
    entry: findings.length === 0 ? entry : null,
    registry_version: registryResult.registry.registry_version,
    registry_source_digest: registryResult.registry.authority.source_digest,
    registry_bytes_digest: registryResult.registry_bytes_digest,
    findings,
  };
}

export function universalImprovementSourceRegistryMessages(
  result: UniversalImprovementSourceRegistryResult,
): string[] {
  if (result.ok && result.registry) {
    return [
      `universal-improvement-source-registry - OK (entries=${result.registry.entries.length}, version=${result.registry.registry_version}, authority/detector drift=0)`,
    ];
  }
  const sample = result.findings
    .slice(0, 5)
    .map((item) => `${item.code}:${item.subject}`)
    .join(",");
  return [
    `universal-improvement-source-registry - violation ${result.findings.length}${sample ? ` (${sample})` : ""}`,
  ];
}

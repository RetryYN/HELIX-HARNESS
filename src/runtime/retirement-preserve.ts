import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, lstatSync, readdirSync, readFileSync } from "node:fs";
import { isAbsolute, join, posix } from "node:path";

export type PreservedArtifactKind = "provider_evidence" | "operations_transition";
export type RetirementSourceKind =
  | PreservedArtifactKind
  | "continuation_event"
  | "bounded_memory"
  | "feedback_event";

export interface PreserveProbeEvidence {
  ok: boolean;
  validatorOrCommand: string;
  schemaOrQueryVersion: string;
  checkedAt: string;
  exitCode: number;
  resultCount: number;
  outputDigest: string;
  evidencePath: string;
}

export interface PreserveArtifactInput {
  path: string;
  kind: PreservedArtifactKind;
  artifactId: string;
  role: "evidence" | "current_pointer" | "operations_design";
  content: string | Uint8Array;
  mode: number;
  tracked: boolean;
  symlink: boolean;
  provenance: {
    sourceCommit: string;
    capturedAt: string;
    collector: string;
    originalPath: string;
    sourceKind: "provider_runtime" | "authored_design";
    sourceId: string;
    owner: string;
    revision: string;
    createdAt: string;
  };
  schemaValidation: PreserveProbeEvidence;
  query: PreserveProbeEvidence;
  export: PreserveProbeEvidence;
  retention: {
    policyId: string;
    authority: string;
    mode: "until" | "indefinite";
    retainUntil: string | null;
    legalHold: boolean;
  };
}

export interface PreserveCollectionSpec {
  path: string;
  kind: PreservedArtifactKind;
  role: PreserveArtifactInput["role"];
  retention?: PreserveArtifactInput["retention"];
  owner: string;
}

export interface RetirementPreserveInventory {
  providerPaths: string[];
  operationsPaths: string[];
  archiveSourcePaths: string[];
  digest: string;
}

export interface PreserveManifestEntry {
  path: string;
  kind: PreservedArtifactKind;
  artifactId: string;
  role: PreserveArtifactInput["role"];
  originalDigest: string;
  byteCount: number;
  mode: number;
  tracked: boolean;
  symlink: false;
  provenance: PreserveArtifactInput["provenance"];
  schemaValidation: PreserveArtifactInput["schemaValidation"];
  query: PreserveArtifactInput["query"];
  export: PreserveArtifactInput["export"];
  retention: PreserveArtifactInput["retention"];
  metadataDigest: string;
}

export interface PreserveManifest {
  schemaVersion: "handover-preserve-manifest.v1";
  operationId: string;
  intentDigest: string;
  capturedAt: string;
  sourceRevision: string;
  retirementPhase: "shadow_read" | "memory_primary" | "legacy_write_disabled" | "cleanup";
  entries: PreserveManifestEntry[];
  countByKind: Record<PreservedArtifactKind, number>;
  physicalCount: number;
  logicalCount: number;
  countByRole: Record<PreserveArtifactInput["role"], number>;
  preservedDigest: string;
  manifestDigest: string;
}

export interface PreserveIntegrityResult {
  ok: boolean;
  missing: string[];
  extra: string[];
  changed: string[];
  invalidEvidence: string[];
}

export interface ArchiveArtifactInput {
  sourcePath: string;
  archivePath: string;
  content: string | Uint8Array;
  kind: "legacy_archive";
  logicalPath: string;
  mode: number;
  tracked: boolean;
  symlink: boolean;
  archiveReason: string;
  archivedAt: string;
  operationId: string;
  restoreInstructions: string;
}

export interface ArchiveManifestEntry {
  sourcePath: string;
  archivePath: string;
  logicalPath: string;
  digest: string;
  byteCount: number;
  kind: "legacy_archive";
  mode: number;
  tracked: boolean;
  symlink: false;
  archiveReason: string;
  archivedAt: string;
  operationId: string;
  restoreInstructions: string;
  runtimeReadable: false;
}

const SHA256 = /^sha256:[a-f0-9]{64}$/;
const UTC = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,9})?Z$/;
const LEGACY_PROVIDER_KIND_MISSING_IDS = new Set([
  "20260608083025-codex-to-claude-plan-l4-06",
  "20260616084105-codex-to-claude-plan-l7-62-runtime-portability-guard",
]);

function sha256(value: string | Uint8Array): string {
  return `sha256:${createHash("sha256").update(value).digest("hex")}`;
}

function canonicalJson(value: unknown): string {
  if (value === null || typeof value === "boolean" || typeof value === "string") {
    return JSON.stringify(value);
  }
  if (typeof value === "number" && Number.isFinite(value)) return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (typeof value !== "object") throw new Error("preserve manifest contains non-JSON value");
  return `{${Object.keys(value as Record<string, unknown>)
    .sort()
    .map(
      (key) => `${JSON.stringify(key)}:${canonicalJson((value as Record<string, unknown>)[key])}`,
    )
    .join(",")}}`;
}

function validPath(path: string): boolean {
  return (
    path.length > 0 &&
    !isAbsolute(path) &&
    !path.includes("\\") &&
    !path.includes("\0") &&
    path === posix.normalize(path) &&
    !path.startsWith("../") &&
    path !== ".."
  );
}

function validUtc(value: string): boolean {
  return UTC.test(value) && Number.isFinite(Date.parse(value));
}

function validProbe(value: PreserveProbeEvidence): boolean {
  return (
    typeof value.ok === "boolean" &&
    Number.isSafeInteger(value.exitCode) &&
    (!value.ok || value.exitCode === 0) &&
    Number.isSafeInteger(value.resultCount) &&
    value.resultCount >= 0 &&
    value.validatorOrCommand.trim().length > 0 &&
    value.schemaOrQueryVersion.trim().length > 0 &&
    validUtc(value.checkedAt) &&
    SHA256.test(value.outputDigest) &&
    validPath(value.evidencePath)
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function validateProviderEvidenceJson(content: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  let value: unknown;
  try {
    value = JSON.parse(content);
  } catch {
    return { valid: false, errors: ["json_invalid"] };
  }
  if (!isRecord(value)) return { valid: false, errors: ["root_invalid"] };
  const allowed = new Set([
    "schema_version",
    "handover_kind",
    "handover_id",
    "from",
    "to",
    "active_plan",
    "budget",
    "context",
    "created_at",
  ]);
  if (Object.keys(value).some((key) => !allowed.has(key))) errors.push("unknown_field");
  if (value.schema_version !== "provider-handover.v1") errors.push("schema_version_invalid");
  // 2026-06-16以前のtracked audit packetは同じv1 schema_versionでhandover_kindを持たない。
  // この既知variantだけを明示compatibilityとして許可し、未知値・他required欠落は拒否する。
  if (
    value.handover_kind === undefined &&
    !LEGACY_PROVIDER_KIND_MISSING_IDS.has(String(value.handover_id))
  ) {
    errors.push("kind_missing");
  } else if (value.handover_kind !== undefined && value.handover_kind !== "mechanical") {
    errors.push("kind_invalid");
  }
  if (!["claude", "codex"].includes(String(value.from))) errors.push("from_invalid");
  if (!["claude", "codex"].includes(String(value.to))) errors.push("to_invalid");
  if (value.from === value.to) errors.push("provider_pair_invalid");
  for (const field of ["handover_id", "active_plan"]) {
    if (typeof value[field] !== "string" || value[field].trim().length === 0) {
      errors.push(`${field}_invalid`);
    }
  }
  if (value.budget !== null && typeof value.budget !== "string") errors.push("budget_invalid");
  if (typeof value.created_at !== "string" || !validUtc(value.created_at)) {
    errors.push("created_at_invalid");
  }
  if (!isRecord(value.context)) {
    errors.push("context_invalid");
  } else if (
    typeof value.context.summary !== "string" ||
    !Array.isArray(value.context.next_actions) ||
    !Array.isArray(value.context.files) ||
    value.context.next_actions.some((item) => typeof item !== "string") ||
    value.context.files.some((item) => typeof item !== "string")
  ) {
    errors.push("context_invalid");
  }
  return { valid: errors.length === 0, errors };
}

export function validateOperationsTransitionMarkdown(content: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  if (!/^---\n[\s\S]*?\n---\n/.test(content)) errors.push("frontmatter_missing");
  if (!/^layer:\s*L(?:11|14)$/m.test(content)) errors.push("layer_invalid");
  if (!/^status:\s*confirmed$/m.test(content)) errors.push("status_invalid");
  if (!/^owner:\s*\S.+$/m.test(content)) errors.push("owner_missing");
  if (!/^retention_policy:\s*\S.+$/m.test(content)) errors.push("retention_policy_missing");
  if (!/^retention_authority:\s*\S.+$/m.test(content)) {
    errors.push("retention_authority_missing");
  }
  if (!/^retention_mode:\s*(?:indefinite|until)$/m.test(content)) {
    errors.push("retention_mode_invalid");
  }
  const forbidden = [
    /\.helix\/handover\/(?:provider\/)?CURRENT\.json/,
    /\bsrc\/handover\//,
    /\bhelix handover\b/,
    /\bhandover-[*]/,
  ];
  if (forbidden.some((pattern) => pattern.test(content))) {
    errors.push("retired_session_surface_reference");
  }
  return { valid: errors.length === 0, errors };
}

export function collectPreserveManifest(
  repoRoot: string,
  specs: readonly PreserveCollectionSpec[],
  context: {
    operationId: string;
    intentDigest: string;
    capturedAt: string;
    retirementPhase: PreserveManifest["retirementPhase"];
  },
): PreserveManifest {
  const sourceRevision = execFileSync("git", ["rev-parse", "HEAD"], {
    cwd: repoRoot,
    encoding: "utf8",
  }).trim();
  const raw = specs.map((spec) => {
    const absolute = join(repoRoot, spec.path);
    const stat = lstatSync(absolute);
    const content = readFileSync(absolute, "utf8");
    const validation =
      spec.kind === "provider_evidence"
        ? validateProviderEvidenceJson(content)
        : validateOperationsTransitionMarkdown(content);
    const retention = canonicalRetention(spec.kind, content);
    if (spec.retention && canonicalJson(spec.retention) !== canonicalJson(retention)) {
      throw new Error(`preserve retention policy mismatch: ${spec.path}`);
    }
    let tracked = true;
    try {
      execFileSync("git", ["ls-files", "--error-unmatch", "--", spec.path], {
        cwd: repoRoot,
        stdio: "ignore",
      });
    } catch {
      // git ls-files の非0は未追跡を表す正常な分類結果なので、tracked=falseへ明示変換する。
      tracked = false;
    }
    if (tracked) {
      try {
        execFileSync("git", ["diff", "--quiet", "--", spec.path], {
          cwd: repoRoot,
          stdio: "ignore",
        });
        execFileSync("git", ["diff", "--cached", "--quiet", "--", spec.path], {
          cwd: repoRoot,
          stdio: "ignore",
        });
      } catch (error) {
        const message = `preserve source is dirty: ${spec.path}`;
        throw new Error(message, { cause: error });
      }
    }
    let artifactRevision = sourceRevision;
    if (tracked) {
      const revision = execFileSync("git", ["log", "-1", "--format=%H", "--", spec.path], {
        cwd: repoRoot,
        encoding: "utf8",
      }).trim();
      if (revision) artifactRevision = revision;
    }
    let createdAt = context.capturedAt;
    if (spec.kind === "provider_evidence") {
      const parsed = JSON.parse(content) as { created_at?: unknown };
      if (typeof parsed.created_at === "string") createdAt = parsed.created_at;
    } else {
      const created = content.match(/^created:\s*(\d{4}-\d{2}-\d{2})$/m)?.[1];
      if (created) createdAt = `${created}T00:00:00Z`;
    }
    return {
      spec,
      content,
      stat,
      tracked,
      validation,
      retention,
      createdAt,
      artifactRevision,
      originalDigest: sha256(content),
    };
  });
  const counts = {
    provider_evidence: raw.filter((entry) => entry.spec.kind === "provider_evidence").length,
    operations_transition: raw.filter((entry) => entry.spec.kind === "operations_transition")
      .length,
  };
  const inputs: PreserveArtifactInput[] = raw.map((entry) => {
    const count = counts[entry.spec.kind];
    const probe = (input: {
      validatorOrCommand: string;
      schemaOrQueryVersion: string;
      ok: boolean;
      resultCount: number;
      outputDigest: string;
    }): PreserveProbeEvidence => ({
      ok: input.ok,
      validatorOrCommand: input.validatorOrCommand,
      schemaOrQueryVersion: input.schemaOrQueryVersion,
      checkedAt: context.capturedAt,
      exitCode: input.ok ? 0 : 1,
      resultCount: input.resultCount,
      outputDigest: input.outputDigest,
      evidencePath: entry.spec.path,
    });
    return {
      path: entry.spec.path,
      kind: entry.spec.kind,
      artifactId: `${entry.spec.kind}:${entry.spec.path}`,
      role: entry.spec.role,
      content: entry.content,
      mode: entry.stat.mode & 0o777,
      tracked: entry.tracked,
      symlink: entry.stat.isSymbolicLink(),
      provenance: {
        sourceCommit: entry.artifactRevision,
        capturedAt: context.capturedAt,
        collector: "collectPreserveManifest",
        originalPath: entry.spec.path,
        sourceKind:
          entry.spec.kind === "provider_evidence" ? "provider_runtime" : "authored_design",
        sourceId: entry.spec.path,
        owner: entry.spec.owner,
        revision: entry.artifactRevision,
        createdAt: entry.createdAt,
      },
      schemaValidation: probe({
        validatorOrCommand: "strict in-process schema validator",
        schemaOrQueryVersion:
          entry.spec.kind === "provider_evidence"
            ? "provider-handover.v1"
            : "operations-markdown.v1",
        ok: entry.validation.valid,
        resultCount: 1,
        outputDigest: sha256(canonicalJson(entry.validation)),
      }),
      query: probe({
        validatorOrCommand: "queryPreserveManifest",
        schemaOrQueryVersion: "preserve-query.v1",
        ok: true,
        resultCount: count,
        outputDigest: sha256("pending-query-probe"),
      }),
      export: probe({
        validatorOrCommand: "exportPreserveCollection",
        schemaOrQueryVersion: "preserve-export.v1",
        ok: true,
        resultCount: count,
        outputDigest: sha256("pending-export-probe"),
      }),
      retention: entry.retention,
    };
  });
  const draft = buildPreserveManifest(inputs, { ...context, sourceRevision });
  for (const input of inputs) {
    input.query.outputDigest = preserveQueryOutput(draft, input.kind).digest;
    input.export.outputDigest = exportPreserveCollection(draft, input.kind).digest;
  }
  return buildPreserveManifest(inputs, { ...context, sourceRevision });
}

export function collectRetirementPreserveInventory(repoRoot: string): RetirementPreserveInventory {
  const providerPaths = readdirSync(join(repoRoot, ".helix", "handover", "provider"))
    .filter((name) => name.endsWith(".json"))
    .map((name) => `.helix/handover/provider/${name}`)
    .sort();
  const operationsPaths = collectOperationsTransitionPaths(repoRoot);
  const archiveSourceRoot = join(repoRoot, "docs", "handover");
  const archiveSourcePaths = existsSync(archiveSourceRoot)
    ? readdirSync(archiveSourceRoot)
        .filter((name) => /^session-handover-.*\.md$/.test(name))
        .map((name) => `docs/handover/${name}`)
        .sort()
    : [];
  const basis = { providerPaths, operationsPaths, archiveSourcePaths };
  return { ...basis, digest: retirementPreserveInventoryDigest(basis) };
}

export function collectOperationsTransitionPaths(repoRoot: string): string[] {
  const result: string[] = [];
  const walk = (relativeRoot: string): void => {
    const absoluteRoot = join(repoRoot, relativeRoot);
    if (!existsSync(absoluteRoot)) return;
    for (const entry of readdirSync(absoluteRoot, { withFileTypes: true })) {
      const relativePath = posix.join(relativeRoot.replace(/\\/g, "/"), entry.name);
      if (entry.isDirectory()) {
        walk(relativePath);
        continue;
      }
      if (!entry.isFile() || !entry.name.endsWith(".md")) continue;
      const content = readFileSync(join(repoRoot, relativePath), "utf8");
      if (
        /\/(?:L11-|L14-)[^/]+\//.test(`/${relativePath}`) &&
        /^layer:\s*L(?:11|14)$/m.test(content)
      ) {
        result.push(relativePath);
      }
    }
  };
  walk("docs/design");
  return result.sort();
}

function canonicalRetention(
  kind: PreservedArtifactKind,
  content: string,
): PreserveArtifactInput["retention"] {
  const expected =
    kind === "provider_evidence"
      ? {
          policyId: "provider-audit",
          authority: "runtime-audit",
          mode: "indefinite" as const,
          retainUntil: null,
          legalHold: false,
        }
      : {
          policyId: "operations-governance",
          authority: "operations-governance",
          mode: "indefinite" as const,
          retainUntil: null,
          legalHold: false,
        };
  if (kind === "operations_transition") {
    const policy = content.match(/^retention_policy:\s*(\S+)$/m)?.[1];
    const authority = content.match(/^retention_authority:\s*(\S+)$/m)?.[1];
    const mode = content.match(/^retention_mode:\s*(\S+)$/m)?.[1];
    if (
      policy !== expected.policyId ||
      authority !== expected.authority ||
      mode !== expected.mode
    ) {
      throw new Error("operations retention frontmatter mismatch");
    }
  }
  return expected;
}

export function retirementPreserveInventoryDigest(
  inventory: Omit<RetirementPreserveInventory, "digest">,
): string {
  return sha256(canonicalJson(inventory));
}

function assertPreserveInput(input: PreserveArtifactInput): void {
  if (!validPath(input.path) || !validPath(input.provenance.originalPath)) {
    throw new Error("invalid preserve path");
  }
  if (!["provider_evidence", "operations_transition"].includes(input.kind)) {
    throw new Error("invalid preserve kind");
  }
  if (
    !input.artifactId.trim() ||
    !["evidence", "current_pointer", "operations_design"].includes(input.role) ||
    !Number.isInteger(input.mode) ||
    input.mode < 0 ||
    input.mode > 0o777 ||
    input.symlink ||
    (input.kind === "provider_evidence" && input.role === "operations_design") ||
    (input.kind === "operations_transition" && input.role !== "operations_design")
  ) {
    throw new Error("invalid preserve artifact identity");
  }
  if (
    !input.provenance.sourceCommit.trim() ||
    !input.provenance.collector.trim() ||
    !validUtc(input.provenance.capturedAt)
  ) {
    throw new Error("invalid preserve provenance");
  }
  if (
    !input.retention.policyId.trim() ||
    !input.retention.authority.trim() ||
    !input.provenance.sourceId.trim() ||
    !input.provenance.owner.trim() ||
    !input.provenance.revision.trim() ||
    !validUtc(input.provenance.createdAt)
  ) {
    throw new Error("invalid preserve metadata");
  }
  if (
    !validProbe(input.schemaValidation) ||
    !validProbe(input.query) ||
    !validProbe(input.export)
  ) {
    throw new Error("invalid preserve probe evidence");
  }
  if (
    (input.retention.mode === "until" &&
      (input.retention.retainUntil === null ||
        !validUtc(input.retention.retainUntil) ||
        Date.parse(input.retention.retainUntil) < Date.parse(input.provenance.capturedAt))) ||
    (input.retention.mode === "indefinite" && input.retention.retainUntil !== null)
  ) {
    throw new Error("invalid preserve retention");
  }
}

export function buildPreserveManifest(
  inputs: readonly PreserveArtifactInput[],
  context: {
    operationId: string;
    intentDigest: string;
    capturedAt: string;
    sourceRevision: string;
    retirementPhase: PreserveManifest["retirementPhase"];
  },
): PreserveManifest {
  if (
    !context.operationId.trim() ||
    !SHA256.test(context.intentDigest) ||
    !validUtc(context.capturedAt) ||
    !context.sourceRevision.trim() ||
    !["shadow_read", "memory_primary", "legacy_write_disabled", "cleanup"].includes(
      context.retirementPhase,
    )
  ) {
    throw new Error("invalid preserve manifest context");
  }
  const seen = new Set<string>();
  const entries = inputs
    .map((input): PreserveManifestEntry => {
      assertPreserveInput(input);
      const actualSchema =
        input.kind === "provider_evidence"
          ? validateProviderEvidenceJson(
              typeof input.content === "string"
                ? input.content
                : Buffer.from(input.content).toString("utf8"),
            )
          : validateOperationsTransitionMarkdown(
              typeof input.content === "string"
                ? input.content
                : Buffer.from(input.content).toString("utf8"),
            );
      if (input.schemaValidation.ok !== actualSchema.valid) {
        throw new Error(`preserve schema validation mismatch: ${actualSchema.errors.join(",")}`);
      }
      const identity = `${input.kind}\0${input.path}`;
      if (seen.has(identity)) throw new Error("duplicate preserve artifact");
      seen.add(identity);
      const bytes =
        typeof input.content === "string" ? Buffer.from(input.content) : Buffer.from(input.content);
      const withoutContent = {
        path: input.path,
        kind: input.kind,
        artifactId: input.artifactId,
        role: input.role,
        originalDigest: sha256(bytes),
        byteCount: bytes.byteLength,
        mode: input.mode,
        tracked: input.tracked,
        symlink: false as const,
        provenance: input.provenance,
        schemaValidation: input.schemaValidation,
        query: input.query,
        export: input.export,
        retention: input.retention,
      };
      return {
        ...withoutContent,
        metadataDigest: sha256(canonicalJson(withoutContent)),
      };
    })
    .sort((a, b) => a.kind.localeCompare(b.kind) || a.path.localeCompare(b.path));
  const countByKind = {
    provider_evidence: entries.filter((entry) => entry.kind === "provider_evidence").length,
    operations_transition: entries.filter((entry) => entry.kind === "operations_transition").length,
  };
  const countByRole = {
    evidence: entries.filter((entry) => entry.role === "evidence").length,
    current_pointer: entries.filter((entry) => entry.role === "current_pointer").length,
    operations_design: entries.filter((entry) => entry.role === "operations_design").length,
  };
  const physicalCount = entries.length;
  const logicalCount = physicalCount - countByRole.current_pointer;
  const preservedDigest = sha256(
    canonicalJson({
      entries: entries.map(preserveSemanticEntry),
      countByKind,
      physicalCount,
      logicalCount,
      countByRole,
    }),
  );
  return {
    schemaVersion: "handover-preserve-manifest.v1",
    ...context,
    entries,
    countByKind,
    physicalCount,
    logicalCount,
    countByRole,
    preservedDigest,
    manifestDigest: sha256(
      canonicalJson({
        schemaVersion: "handover-preserve-manifest.v1",
        ...context,
        entries,
        countByKind,
        physicalCount,
        logicalCount,
        countByRole,
      }),
    ),
  };
}

function preserveSemanticEntry(entry: PreserveManifestEntry): unknown {
  const { capturedAt: _capturedAt, collector: _collector, ...provenance } = entry.provenance;
  const semanticProbe = ({
    checkedAt: _checkedAt,
    evidencePath: _evidencePath,
    outputDigest: _outputDigest,
    ...probe
  }: PreserveProbeEvidence) => probe;
  const {
    metadataDigest: _metadataDigest,
    schemaValidation,
    query,
    export: exportProbe,
    ...artifact
  } = entry;
  return {
    ...artifact,
    provenance,
    schemaValidation: semanticProbe(schemaValidation),
    query: semanticProbe(query),
    export: semanticProbe(exportProbe),
  };
}

function isInvalidEvidence(entry: PreserveManifestEntry, manifest: PreserveManifest): boolean {
  return (
    !entry.schemaValidation.ok ||
    !entry.query.ok ||
    !entry.export.ok ||
    !SHA256.test(entry.originalDigest) ||
    !SHA256.test(entry.metadataDigest) ||
    entry.schemaValidation.resultCount !== 1 ||
    entry.query.resultCount !== manifest.countByKind[entry.kind] ||
    entry.export.resultCount !== manifest.countByKind[entry.kind]
  );
}

export function evaluatePreserveIntegrity(
  before: PreserveManifest,
  after: PreserveManifest,
): PreserveIntegrityResult {
  const beforeByKey = new Map(
    before.entries.map((entry) => [`${entry.kind}\0${entry.path}`, entry]),
  );
  const afterByKey = new Map(after.entries.map((entry) => [`${entry.kind}\0${entry.path}`, entry]));
  const missing = [...beforeByKey.keys()].filter((key) => !afterByKey.has(key)).sort();
  const extra = [...afterByKey.keys()].filter((key) => !beforeByKey.has(key)).sort();
  const changed = [...beforeByKey.entries()]
    .filter(([key, entry]) => {
      const candidate = afterByKey.get(key);
      return (
        !candidate ||
        canonicalJson(preserveSemanticEntry(entry)) !==
          canonicalJson(preserveSemanticEntry(candidate))
      );
    })
    .map(([key]) => key)
    .sort();
  const invalidEvidence = [...before.entries, ...after.entries]
    .filter((entry) => isInvalidEvidence(entry, before.entries.includes(entry) ? before : after))
    .map((entry) => `${entry.kind}\0${entry.path}`)
    .filter((key, index, all) => all.indexOf(key) === index)
    .sort();
  const countsMatch =
    before.countByKind.provider_evidence === after.countByKind.provider_evidence &&
    before.countByKind.operations_transition === after.countByKind.operations_transition;
  return {
    ok:
      countsMatch &&
      missing.length === 0 &&
      extra.length === 0 &&
      changed.length === 0 &&
      invalidEvidence.length === 0 &&
      before.preservedDigest === after.preservedDigest,
    missing,
    extra,
    changed,
    invalidEvidence,
  };
}

export function queryPreserveManifest(
  manifest: PreserveManifest,
  kind: PreservedArtifactKind,
): PreserveManifestEntry[] {
  return manifest.entries
    .filter((entry) => entry.kind === kind)
    .sort((a, b) => a.path.localeCompare(b.path));
}

export function preserveQueryOutput(
  manifest: PreserveManifest,
  kind: PreservedArtifactKind,
): { content: string; digest: string; count: number } {
  const rows = queryPreserveManifest(manifest, kind).map((entry) => ({
    path: entry.path,
    role: entry.role,
    originalDigest: entry.originalDigest,
  }));
  const content = `${canonicalJson(rows)}\n`;
  return { content, digest: sha256(content), count: rows.length };
}

export function exportPreserveCollection(
  manifest: PreserveManifest,
  kind: PreservedArtifactKind,
): { content: string; digest: string; count: number } {
  const rows = queryPreserveManifest(manifest, kind).map((entry) => ({
    path: entry.path,
    kind: entry.kind,
    artifactId: entry.artifactId,
    role: entry.role,
    originalDigest: entry.originalDigest,
    byteCount: entry.byteCount,
    mode: entry.mode,
    tracked: entry.tracked,
    symlink: entry.symlink,
    provenance: entry.provenance,
    retention: entry.retention,
  }));
  const content = `${canonicalJson(rows)}\n`;
  return { content, digest: sha256(content), count: rows.length };
}

export function exportPreserveManifest(manifest: PreserveManifest): {
  content: string;
  digest: string;
  count: number;
} {
  const content = `${canonicalJson(manifest)}\n`;
  return { content, digest: sha256(content), count: manifest.entries.length };
}

export function verifyProviderPointer(entries: readonly PreserveManifestEntry[]): {
  ok: boolean;
  reasons: string[];
} {
  const reasons: string[] = [];
  const pointers = entries.filter((entry) => entry.role === "current_pointer");
  const evidence = entries.filter((entry) => entry.role === "evidence");
  if (pointers.length !== 1) reasons.push("provider_pointer_count_invalid");
  if (
    pointers.length === 1 &&
    evidence.filter((entry) => entry.originalDigest === pointers[0]?.originalDigest).length !== 1
  ) {
    reasons.push("provider_pointer_target_invalid");
  }
  return { ok: reasons.length === 0, reasons };
}

export function assertContinuationSourceBoundary(kinds: readonly RetirementSourceKind[]): void {
  const forbidden = kinds.filter(
    (kind) => kind === "provider_evidence" || kind === "operations_transition",
  );
  if (forbidden.length > 0) {
    throw new Error(
      `preserved artifact cannot be continuation source: ${[...new Set(forbidden)].join(",")}`,
    );
  }
}

export function buildArchiveManifest(
  inputs: readonly ArchiveArtifactInput[],
): ArchiveManifestEntry[] {
  const sourcePaths = new Set<string>();
  const archivePaths = new Set<string>();
  const logicalPaths = new Set<string>();
  return inputs
    .map((input): ArchiveManifestEntry => {
      if (
        input.kind !== "legacy_archive" ||
        !validPath(input.sourcePath) ||
        !validPath(input.archivePath) ||
        input.sourcePath === input.archivePath ||
        !/^docs\/handover\/session-handover-[^/]+\.md$/.test(input.sourcePath) ||
        !input.archivePath.startsWith("docs/archive/handover/") ||
        !validPath(input.logicalPath) ||
        !Number.isInteger(input.mode) ||
        input.mode < 0 ||
        input.mode > 0o777 ||
        input.symlink ||
        !input.archiveReason.trim() ||
        !validUtc(input.archivedAt) ||
        !input.operationId.trim() ||
        !input.restoreInstructions.trim()
      ) {
        throw new Error("invalid archive artifact");
      }
      if (
        sourcePaths.has(input.sourcePath) ||
        archivePaths.has(input.archivePath) ||
        logicalPaths.has(input.logicalPath)
      ) {
        throw new Error("duplicate archive artifact");
      }
      sourcePaths.add(input.sourcePath);
      archivePaths.add(input.archivePath);
      logicalPaths.add(input.logicalPath);
      const bytes =
        typeof input.content === "string" ? Buffer.from(input.content) : Buffer.from(input.content);
      return {
        sourcePath: input.sourcePath,
        archivePath: input.archivePath,
        logicalPath: input.logicalPath,
        digest: sha256(bytes),
        byteCount: bytes.byteLength,
        kind: "legacy_archive",
        mode: input.mode,
        tracked: input.tracked,
        symlink: false,
        archiveReason: input.archiveReason,
        archivedAt: input.archivedAt,
        operationId: input.operationId,
        restoreInstructions: input.restoreInstructions,
        runtimeReadable: false,
      };
    })
    .sort((a, b) => a.sourcePath.localeCompare(b.sourcePath));
}

export function canDeleteArchivedSources(input: {
  manifest: readonly ArchiveManifestEntry[];
  archived: readonly {
    path: string;
    digest: string;
    byteCount: number;
    mode: number;
    tracked: boolean;
    symlink: boolean;
  }[];
}): {
  ok: boolean;
  missing: string[];
  changed: string[];
  extra: string[];
  duplicate: string[];
  invalid: string[];
} {
  const duplicateActual = input.archived
    .filter(
      (entry, index, all) => all.findIndex((candidate) => candidate.path === entry.path) !== index,
    )
    .map((entry) => entry.path);
  const invalid = input.archived
    .filter(
      (entry) =>
        !validPath(entry.path) ||
        !SHA256.test(entry.digest) ||
        !Number.isSafeInteger(entry.byteCount) ||
        entry.byteCount < 0 ||
        !Number.isInteger(entry.mode) ||
        entry.mode < 0 ||
        entry.mode > 0o777 ||
        typeof entry.tracked !== "boolean" ||
        entry.symlink !== false,
    )
    .map((entry) => entry.path)
    .sort();
  const expected = new Map(input.manifest.map((entry) => [entry.archivePath, entry]));
  const actual = new Map(input.archived.map((entry) => [entry.path, entry]));
  const missing = [...expected.keys()].filter((path) => !actual.has(path)).sort();
  const extra = [...actual.keys()].filter((path) => !expected.has(path)).sort();
  const changed = [...expected.entries()]
    .filter(([path, entry]) => {
      const candidate = actual.get(path);
      return (
        candidate !== undefined &&
        (candidate.digest !== entry.digest ||
          candidate.byteCount !== entry.byteCount ||
          candidate.mode !== entry.mode ||
          candidate.tracked !== entry.tracked ||
          candidate.symlink)
      );
    })
    .map(([path]) => path)
    .sort();
  return {
    ok:
      missing.length === 0 &&
      changed.length === 0 &&
      extra.length === 0 &&
      duplicateActual.length === 0 &&
      invalid.length === 0,
    missing,
    changed,
    extra,
    duplicate: [...new Set(duplicateActual)].sort(),
    invalid,
  };
}

export function collectArchivedTargets(
  repoRoot: string,
  manifest: readonly ArchiveManifestEntry[],
): Array<{
  path: string;
  digest: string;
  byteCount: number;
  mode: number;
  tracked: boolean;
  symlink: boolean;
}> {
  const result = [];
  for (const entry of manifest) {
    const absolute = join(repoRoot, entry.archivePath);
    if (!existsSync(absolute)) continue;
    const stat = lstatSync(absolute);
    const content = readFileSync(absolute);
    let tracked = true;
    try {
      execFileSync("git", ["ls-files", "--error-unmatch", "--", entry.archivePath], {
        cwd: repoRoot,
        stdio: "ignore",
      });
    } catch {
      tracked = false;
    }
    result.push({
      path: entry.archivePath,
      digest: sha256(content),
      byteCount: content.byteLength,
      mode: stat.mode & 0o777,
      tracked,
      symlink: stat.isSymbolicLink(),
    });
  }
  return result.sort((a, b) => a.path.localeCompare(b.path));
}

export function archiveManifestDigest(entries: readonly ArchiveManifestEntry[]): string {
  return sha256(
    canonicalJson([...entries].sort((a, b) => a.sourcePath.localeCompare(b.sourcePath))),
  );
}

export function evaluatePreservePhaseBinding(input: {
  checkpoint: { preserveDigest: string; archiveDigest: string };
  preserveManifest: PreserveManifest;
  archiveManifest: readonly ArchiveManifestEntry[];
}): { ok: boolean; reasons: string[] } {
  const reasons: string[] = [];
  if (input.checkpoint.preserveDigest !== input.preserveManifest.preservedDigest) {
    reasons.push("preserve_checkpoint_digest_mismatch");
  }
  if (input.checkpoint.archiveDigest !== archiveManifestDigest(input.archiveManifest)) {
    reasons.push("archive_checkpoint_digest_mismatch");
  }
  return { ok: reasons.length === 0, reasons };
}

export function evaluatePreservePhaseExit(input: {
  before: PreserveManifest;
  after: PreserveManifest;
  archiveManifest: readonly ArchiveManifestEntry[];
  archived: readonly {
    path: string;
    digest: string;
    byteCount: number;
    mode: number;
    tracked: boolean;
    symlink: boolean;
  }[];
  checkpoint: { preserveDigest: string; archiveDigest: string; inventoryDigest: string };
  inventory: RetirementPreserveInventory;
  continuationSourceKinds: readonly RetirementSourceKind[];
}): { ok: boolean; reasons: string[] } {
  const reasons: string[] = [];
  const providerPaths = queryPreserveManifest(input.after, "provider_evidence")
    .map((entry) => entry.path)
    .sort();
  const operationsPaths = queryPreserveManifest(input.after, "operations_transition")
    .map((entry) => entry.path)
    .sort();
  const archivePaths = input.archiveManifest.map((entry) => entry.sourcePath).sort();
  if (
    input.inventory.providerPaths.length < 2 ||
    input.inventory.operationsPaths.length === 0 ||
    input.inventory.archiveSourcePaths.length === 0 ||
    canonicalJson(providerPaths) !== canonicalJson(input.inventory.providerPaths) ||
    canonicalJson(operationsPaths) !== canonicalJson(input.inventory.operationsPaths) ||
    canonicalJson(archivePaths) !== canonicalJson(input.inventory.archiveSourcePaths)
  ) {
    reasons.push("preserve_inventory_incomplete");
  }
  if (
    input.inventory.digest !==
    retirementPreserveInventoryDigest({
      providerPaths: input.inventory.providerPaths,
      operationsPaths: input.inventory.operationsPaths,
      archiveSourcePaths: input.inventory.archiveSourcePaths,
    })
  ) {
    reasons.push("preserve_inventory_digest_invalid");
  }
  if (input.checkpoint.inventoryDigest !== input.inventory.digest) {
    reasons.push("preserve_inventory_checkpoint_mismatch");
  }
  const phases: PreserveManifest["retirementPhase"][] = [
    "shadow_read",
    "memory_primary",
    "legacy_write_disabled",
    "cleanup",
  ];
  const beforePhase = phases.indexOf(input.before.retirementPhase);
  const afterPhase = phases.indexOf(input.after.retirementPhase);
  if (
    input.before.operationId !== input.after.operationId ||
    input.before.intentDigest !== input.after.intentDigest ||
    beforePhase < 0 ||
    afterPhase !== beforePhase + 1 ||
    Date.parse(input.after.capturedAt) < Date.parse(input.before.capturedAt)
  ) {
    reasons.push("preserve_observation_fence_invalid");
  }
  if (!evaluatePreserveIntegrity(input.before, input.after).ok) {
    reasons.push("preserve_integrity_failed");
  }
  const pointer = verifyProviderPointer(queryPreserveManifest(input.after, "provider_evidence"));
  reasons.push(...pointer.reasons);
  if (!canDeleteArchivedSources({ manifest: input.archiveManifest, archived: input.archived }).ok) {
    reasons.push("archive_reconcile_failed");
  }
  reasons.push(
    ...evaluatePreservePhaseBinding({
      checkpoint: input.checkpoint,
      preserveManifest: input.after,
      archiveManifest: input.archiveManifest,
    }).reasons,
  );
  try {
    assertContinuationSourceBoundary(input.continuationSourceKinds);
  } catch {
    reasons.push("preserved_type_joined_to_continuation");
  }
  return { ok: reasons.length === 0, reasons };
}

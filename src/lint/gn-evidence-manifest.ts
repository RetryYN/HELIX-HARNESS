import { existsSync, readdirSync, readFileSync } from "node:fs";
import { isAbsolute, relative, resolve } from "node:path";
import { isRecord } from "../shared/value-guards";

export interface GateEvidenceCommand {
  command_id: string;
  command: string;
  runner: string;
  scope: string;
  exit_code: number;
  evidence_path: string;
  output_digest: string;
  item_ids: string[];
}

export interface GateEvidenceCoverage {
  item_id: string;
  status: string;
  evidence_paths: string[];
  command_ids: string[];
  notes?: string;
  advisor_evidence?: string;
}

export interface GateEvidenceManifest {
  manifest_path: string;
  schema_version: string;
  gate: string;
  profile: string;
  plan_id: string;
  selected_item_ids: string[];
  mandatory_item_ids: string[];
  deferred_item_ids: string[];
  commands: GateEvidenceCommand[];
  coverage: GateEvidenceCoverage[];
  exit_criteria: {
    all_mandatory_passed?: boolean;
    failed_mandatory_count?: number;
    stale_defer_count?: number;
    doctor_check?: string;
  };
}

export interface GateEvidenceConfig {
  gate: string;
  schemaVersion: string;
  evidenceDir: string;
  itemPrefix: string;
  doctorCheck: string;
  requireAdvisorEvidence?: boolean;
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string") ? value : [];
}

function evidenceCommands(value: unknown): GateEvidenceCommand[] {
  if (!Array.isArray(value)) return [];
  return value.filter(isRecord).map((item) => ({
    command_id: typeof item.command_id === "string" ? item.command_id : "",
    command: typeof item.command === "string" ? item.command : "",
    runner: typeof item.runner === "string" ? item.runner : "",
    scope: typeof item.scope === "string" ? item.scope : "",
    exit_code: typeof item.exit_code === "number" ? item.exit_code : -1,
    evidence_path: typeof item.evidence_path === "string" ? item.evidence_path : "",
    output_digest: typeof item.output_digest === "string" ? item.output_digest : "",
    item_ids: stringArray(item.item_ids),
  }));
}

function evidenceCoverage(value: unknown): GateEvidenceCoverage[] {
  if (!Array.isArray(value)) return [];
  return value.filter(isRecord).map((item) => ({
    item_id: typeof item.item_id === "string" ? item.item_id : "",
    status: typeof item.status === "string" ? item.status : "",
    evidence_paths: stringArray(item.evidence_paths),
    command_ids: stringArray(item.command_ids),
    notes: typeof item.notes === "string" ? item.notes : undefined,
    advisor_evidence: typeof item.advisor_evidence === "string" ? item.advisor_evidence : undefined,
  }));
}

function manifestFromJson(manifestPath: string, raw: unknown): GateEvidenceManifest {
  const doc = isRecord(raw) ? raw : {};
  const exitCriteria = isRecord(doc.exit_criteria) ? doc.exit_criteria : {};
  return {
    manifest_path: manifestPath,
    schema_version: typeof doc.schema_version === "string" ? doc.schema_version : "",
    gate: typeof doc.gate === "string" ? doc.gate : "",
    profile: typeof doc.profile === "string" ? doc.profile : "",
    plan_id: typeof doc.plan_id === "string" ? doc.plan_id : "",
    selected_item_ids: stringArray(doc.selected_item_ids),
    mandatory_item_ids: stringArray(doc.mandatory_item_ids),
    deferred_item_ids: stringArray(doc.deferred_item_ids),
    commands: evidenceCommands(doc.commands),
    coverage: evidenceCoverage(doc.coverage),
    exit_criteria: {
      all_mandatory_passed:
        typeof exitCriteria.all_mandatory_passed === "boolean"
          ? exitCriteria.all_mandatory_passed
          : undefined,
      failed_mandatory_count:
        typeof exitCriteria.failed_mandatory_count === "number"
          ? exitCriteria.failed_mandatory_count
          : undefined,
      stale_defer_count:
        typeof exitCriteria.stale_defer_count === "number"
          ? exitCriteria.stale_defer_count
          : undefined,
      doctor_check:
        typeof exitCriteria.doctor_check === "string" ? exitCriteria.doctor_check : undefined,
    },
  };
}

export function loadGateEvidenceManifests(
  repoRoot: string,
  config: GateEvidenceConfig,
): GateEvidenceManifest[] {
  const dir = resolve(repoRoot, config.evidenceDir);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((name) => name.endsWith(".json"))
    .sort()
    .map((name) => {
      const manifestPath = `${config.evidenceDir}/${name}`;
      const raw = JSON.parse(readFileSync(resolve(dir, name), "utf8")) as unknown;
      return manifestFromJson(manifestPath, raw);
    });
}

function normalizedPath(path: string): string {
  return path.replace(/\\/g, "/");
}

function pathExistsInsideRepo(repoRoot: string | undefined, path: string): boolean {
  if (!repoRoot || !path || isAbsolute(path)) return false;
  const resolved = resolve(repoRoot, path);
  const rel = relative(repoRoot, resolved);
  if (rel.startsWith("..") || isAbsolute(rel)) return false;
  return existsSync(resolved);
}

function hasAllowedEvidencePrefix(path: string): boolean {
  const normalized = normalizedPath(path);
  return [".helix/evidence/", "docs/", "src/", "tests/"].some((prefix) =>
    normalized.startsWith(prefix),
  );
}

export function validateGateEvidenceManifest(
  manifest: GateEvidenceManifest,
  repoRoot: string | undefined,
  config: GateEvidenceConfig,
): string[] {
  const violations: string[] = [];
  if (manifest.schema_version !== config.schemaVersion) {
    violations.push(`${manifest.manifest_path}: invalid schema_version`);
  }
  if (manifest.gate !== config.gate) {
    violations.push(`${manifest.manifest_path}: gate must be ${config.gate}`);
  }
  if (!manifest.profile || !manifest.plan_id) {
    violations.push(`${manifest.manifest_path}: profile and plan_id are required`);
  }
  if (manifest.commands.length === 0) {
    violations.push(`${manifest.manifest_path}: commands must not be empty`);
  }

  const commandIds = new Set(manifest.commands.map((command) => command.command_id));
  for (const command of manifest.commands) {
    if (!command.command_id || !command.command || !command.runner || !command.scope) {
      violations.push(`${manifest.manifest_path}: command entry has missing required fields`);
    }
    if (command.exit_code !== 0) {
      violations.push(
        `${manifest.manifest_path}: command ${command.command_id} exit_code is non-zero`,
      );
    }
    if (!/^sha256:[0-9a-f]{64}$/i.test(command.output_digest)) {
      violations.push(
        `${manifest.manifest_path}: command ${command.command_id} has invalid digest`,
      );
    }
    if (!pathExistsInsideRepo(repoRoot, command.evidence_path)) {
      violations.push(
        `${manifest.manifest_path}: command ${command.command_id} evidence_path missing`,
      );
    }
    if (!hasAllowedEvidencePrefix(command.evidence_path)) {
      violations.push(
        `${manifest.manifest_path}: command ${command.command_id} evidence_path prefix not allowed`,
      );
    }
    for (const itemId of command.item_ids) {
      if (!itemId.startsWith(config.itemPrefix)) {
        violations.push(
          `${manifest.manifest_path}: command ${command.command_id} has invalid item id ${itemId}`,
        );
      }
    }
  }

  const coverageByItem = new Map(manifest.coverage.map((entry) => [entry.item_id, entry]));
  for (const mandatoryItemId of manifest.mandatory_item_ids) {
    const coverage = coverageByItem.get(mandatoryItemId);
    if (!coverage) {
      violations.push(`${manifest.manifest_path}: missing coverage for ${mandatoryItemId}`);
      continue;
    }
    if (coverage.status !== "passed") {
      violations.push(
        `${manifest.manifest_path}: mandatory coverage ${mandatoryItemId} is not passed`,
      );
    }
    if (coverage.evidence_paths.length === 0 || coverage.command_ids.length === 0) {
      violations.push(
        `${manifest.manifest_path}: mandatory coverage ${mandatoryItemId} lacks evidence paths or command ids`,
      );
    }
    for (const commandId of coverage.command_ids) {
      if (!commandIds.has(commandId)) {
        violations.push(
          `${manifest.manifest_path}: coverage ${mandatoryItemId} references unknown command ${commandId}`,
        );
      }
    }
    for (const evidencePath of coverage.evidence_paths) {
      if (!pathExistsInsideRepo(repoRoot, evidencePath)) {
        violations.push(
          `${manifest.manifest_path}: coverage ${mandatoryItemId} evidence_path missing: ${evidencePath}`,
        );
      }
      if (!hasAllowedEvidencePrefix(evidencePath)) {
        violations.push(
          `${manifest.manifest_path}: coverage ${mandatoryItemId} evidence_path prefix not allowed: ${evidencePath}`,
        );
      }
    }
    if (config.requireAdvisorEvidence && !coverage.advisor_evidence) {
      violations.push(
        `${manifest.manifest_path}: coverage ${mandatoryItemId} requires advisor_evidence`,
      );
    }
  }

  if (manifest.exit_criteria.all_mandatory_passed !== true) {
    violations.push(`${manifest.manifest_path}: exit_criteria.all_mandatory_passed must be true`);
  }
  if (manifest.exit_criteria.failed_mandatory_count !== 0) {
    violations.push(`${manifest.manifest_path}: exit_criteria.failed_mandatory_count must be 0`);
  }
  if (manifest.exit_criteria.stale_defer_count !== 0) {
    violations.push(`${manifest.manifest_path}: exit_criteria.stale_defer_count must be 0`);
  }
  if (manifest.exit_criteria.doctor_check !== config.doctorCheck) {
    violations.push(
      `${manifest.manifest_path}: exit_criteria.doctor_check must be ${config.doctorCheck}`,
    );
  }
  return violations;
}

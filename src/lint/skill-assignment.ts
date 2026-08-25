import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { parse as parseYaml } from "yaml";
import { parseSkillApplicability } from "../schema/skill-applicability-registry.js";
import { markdownFrontmatter } from "./shared";

export const VALID_SKILL_LAYERS = [
  "L1",
  "L2",
  "L3",
  "L4",
  "L5",
  "L6",
  "L7",
  "L8",
  "L9",
  "L10",
  "L11",
  "L12",
] as const;

export const LEGACY_SKILL_LAYERS = ["L0", ...VALID_SKILL_LAYERS, "L13", "L14"] as const;

/** compatibility inventory専用。current scaffold／projectionへ再利用しない。 */
export const VALID_SKILL_DRIVE_MODELS = [
  "Forward",
  "Discovery",
  "Scrum",
  "Reverse",
  "Recovery",
  "Incident",
  "Refactor",
  "Retrofit",
  "Add-feature",
  "Research",
] as const;

export const VALID_SKILL_TYPES = [
  "design-contract",
  "drive-reverse",
  "orchestration",
  "process",
  "quality-gate-review",
  "review",
  "skill-map",
  "testing",
  "verification",
] as const;

export interface SkillAssignmentDoc {
  path: string;
  metadata: Record<string, unknown>;
}

export interface SkillAssignmentViolation {
  path: string;
  kind:
    | "missing-skill-type"
    | "unknown-skill-type"
    | "missing-layers"
    | "unknown-layer"
    | "missing-applicable-identities"
    | "invalid-current-applicability"
    | "legacy-field-on-current-skill"
    | "missing-drive-models"
    | "unknown-drive-model";
  value?: string;
}

export interface SkillAssignmentResult {
  ok: boolean;
  checked: number;
  currentChecked: number;
  compatibilityOnly: number;
  violations: SkillAssignmentViolation[];
}

function skillFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...skillFiles(path));
    else if (entry.isFile() && /\.(md|ya?ml)$/i.test(entry.name)) out.push(path);
  }
  return out.sort();
}

function parseMetadata(path: string): Record<string, unknown> {
  const content = readFileSync(path, "utf8");
  const raw = /\.md$/i.test(path) ? (markdownFrontmatter(content) ?? "") : content;
  if (!raw.trim()) return {};
  const parsed = parseYaml(raw);
  return parsed && typeof parsed === "object" && !Array.isArray(parsed)
    ? (parsed as Record<string, unknown>)
    : {};
}

function stringList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter(
      (item): item is string => typeof item === "string" && item.trim().length > 0,
    );
  }
  if (typeof value === "string" && value.trim().length > 0) {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

export function loadSkillAssignmentDocs(repoRoot: string): SkillAssignmentDoc[] {
  const root = join(repoRoot, "docs", "skills");
  return skillFiles(root).map((path) => ({
    path: relative(repoRoot, path).replace(/\\/g, "/"),
    metadata: parseMetadata(path),
  }));
}

export function analyzeSkillAssignments(docs: SkillAssignmentDoc[]): SkillAssignmentResult {
  const violations: SkillAssignmentViolation[] = [];
  const validSkillTypes = new Set<string>(VALID_SKILL_TYPES);
  const currentLayers = new Set<string>(VALID_SKILL_LAYERS);
  const legacyLayers = new Set<string>(LEGACY_SKILL_LAYERS);
  const legacyModels = new Set<string>(VALID_SKILL_DRIVE_MODELS);
  let currentChecked = 0;
  let compatibilityOnly = 0;

  for (const doc of docs) {
    const skillType = doc.metadata.skill_type;
    if (typeof skillType !== "string" || skillType.trim().length === 0) {
      violations.push({ path: doc.path, kind: "missing-skill-type" });
    } else if (!validSkillTypes.has(skillType)) {
      violations.push({ path: doc.path, kind: "unknown-skill-type", value: skillType });
    }

    const appliesTo =
      doc.metadata.applies_to && typeof doc.metadata.applies_to === "object"
        ? (doc.metadata.applies_to as Record<string, unknown>)
        : {};
    const layers = stringList(appliesTo.layers);
    if (layers.length === 0) violations.push({ path: doc.path, kind: "missing-layers" });

    const hasCurrent =
      Object.hasOwn(appliesTo, "applicable_identities") ||
      Object.hasOwn(appliesTo, "excluded_identities");
    const legacyDriveModels = stringList(appliesTo.drive_models);
    const layerAuthority = hasCurrent ? currentLayers : legacyLayers;
    for (const layer of layers) {
      if (!layerAuthority.has(layer)) {
        violations.push({ path: doc.path, kind: "unknown-layer", value: layer });
      }
    }

    if (hasCurrent) {
      currentChecked += 1;
      if (legacyDriveModels.length > 0) {
        violations.push({ path: doc.path, kind: "legacy-field-on-current-skill" });
      }
      try {
        parseSkillApplicability({
          applicable_identities: appliesTo.applicable_identities,
          excluded_identities: appliesTo.excluded_identities ?? [],
        });
      } catch (error) {
        violations.push({
          path: doc.path,
          kind: "invalid-current-applicability",
          value: error instanceof Error ? error.message : String(error),
        });
      }
      continue;
    }

    if (legacyDriveModels.length === 0) {
      violations.push({ path: doc.path, kind: "missing-applicable-identities" });
      violations.push({ path: doc.path, kind: "missing-drive-models" });
      continue;
    }
    compatibilityOnly += 1;
    for (const model of legacyDriveModels) {
      if (!legacyModels.has(model)) {
        violations.push({ path: doc.path, kind: "unknown-drive-model", value: model });
      }
    }
  }

  return {
    ok: docs.length > 0 && violations.length === 0,
    checked: docs.length,
    currentChecked,
    compatibilityOnly,
    violations,
  };
}

export function skillAssignmentMessages(result: SkillAssignmentResult): string[] {
  if (result.ok) {
    return [
      `skill-assignment - OK (checked=${result.checked}, current=${result.currentChecked}, compatibility_only=${result.compatibilityOnly})`,
    ];
  }
  if (result.checked === 0) {
    return ["skill-assignment - violation: docs/skills has no skill definitions"];
  }
  return result.violations.map((violation) => {
    const value = violation.value ? ` value=${violation.value}` : "";
    return `skill-assignment - violation: ${violation.path}: ${violation.kind}${value}`;
  });
}

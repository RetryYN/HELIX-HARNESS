import {
  analyzeSkillAssignments,
  VALID_SKILL_DRIVE_MODELS,
  VALID_SKILL_LAYERS,
  VALID_SKILL_TYPES,
} from "../lint/skill-assignment";

export interface SkillScaffoldInput {
  name: string;
  category: string;
  layers: readonly string[];
  driveModels: readonly string[];
  domainTags?: readonly string[];
  description?: string;
}

export interface SkillScaffoldFinding {
  field: string;
  message: string;
  value?: string;
}

export interface SkillScaffoldResult {
  ok: boolean;
  path: string;
  content: string;
  metadata: Record<string, unknown>;
  findings: SkillScaffoldFinding[];
}

function normalizeList(values: readonly string[] | undefined): string[] {
  const out: string[] = [];
  for (const value of values ?? []) {
    const trimmed = value.trim();
    if (trimmed.length > 0 && !out.includes(trimmed)) out.push(trimmed);
  }
  return out;
}

function slugifyName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function yamlScalar(value: string): string {
  return JSON.stringify(value);
}

function yamlList(values: readonly string[]): string {
  return values.map((value) => `    - ${yamlScalar(value)}`).join("\n");
}

function generatedSkillMarkdown(input: {
  name: string;
  category: string;
  layers: readonly string[];
  driveModels: readonly string[];
  domainTags: readonly string[];
  description: string;
}): string {
  const domainTags =
    input.domainTags.length === 0
      ? ""
      : ["domain_tags:", ...input.domainTags.map((tag) => `  - ${yamlScalar(tag)}`), ""].join(
          "\n",
        );
  return [
    "---",
    "schema_version: skill.v1",
    `name: ${yamlScalar(input.name)}`,
    `skill_type: ${yamlScalar(input.category)}`,
    "applies_to:",
    "  layers:",
    yamlList(input.layers),
    "  drive_models:",
    yamlList(input.driveModels),
    domainTags.trimEnd(),
    "---",
    "",
    `# ${input.name}`,
    "",
    input.description,
    "",
    "## この skill を読む条件",
    "",
    "- 対象タスクが frontmatter の layer / drive model / domain tag に一致する。",
    "- 既存の設計、テスト設計、実装境界を確認してから作業する。",
    "",
    "## 手順",
    "",
    "1. 対象 PLAN と関連する design / test-design を読む。",
    "2. 変更範囲、検証コマンド、review evidence を明確にする。",
    "3. 実装後に targeted test と `ut-tdd doctor` を実行する。",
    "",
  ]
    .filter((line) => line.length > 0 || line === "")
    .join("\n");
}

function assignmentFindings(path: string, metadata: Record<string, unknown>): SkillScaffoldFinding[] {
  return analyzeSkillAssignments([{ path, metadata }]).violations.map((violation) => ({
    field: violation.kind,
    message: `skill assignment violation: ${violation.kind}`,
    value: violation.value,
  }));
}

export function scaffoldSkill(input: SkillScaffoldInput): SkillScaffoldResult {
  const name = input.name.trim();
  const category = input.category.trim();
  const layers = normalizeList(input.layers);
  const driveModels = normalizeList(input.driveModels);
  const domainTags = normalizeList(input.domainTags);
  const slug = slugifyName(name);
  const path = slug.length > 0 ? `docs/skills/${slug}.md` : "docs/skills/invalid-skill.md";
  const metadata: Record<string, unknown> = {
    schema_version: "skill.v1",
    name,
    skill_type: category,
    applies_to: {
      layers,
      drive_models: driveModels,
    },
  };
  if (domainTags.length > 0) metadata.domain_tags = domainTags;

  const findings: SkillScaffoldFinding[] = [];
  if (name.length === 0) findings.push({ field: "name", message: "name is required" });
  if (slug.length === 0) findings.push({ field: "name", message: "name must contain ascii letters or digits" });
  findings.push(...assignmentFindings(path, metadata));

  const description =
    input.description?.trim() ||
    "この skill は HELIX Agent Harness の作業手順を補助するための初期 scaffold である。";

  return {
    ok: findings.length === 0,
    path,
    content: generatedSkillMarkdown({
      name,
      category,
      layers,
      driveModels,
      domainTags,
      description,
    }),
    metadata,
    findings,
  };
}

export const SKILL_SCAFFOLD_ALLOWED_VALUES = {
  categories: VALID_SKILL_TYPES,
  layers: VALID_SKILL_LAYERS,
  driveModels: VALID_SKILL_DRIVE_MODELS,
} as const;

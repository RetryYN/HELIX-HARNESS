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
  /**
   * 既存 catalog の slug 一覧 (重複ガード用、PLAN-L7-420)。CLI が docs/skills から供給する。
   * 完全一致は block、部分一致 (片方が他方を含む) は「既存 pack の拡張を検討」finding。
   */
  existingSlugs?: readonly string[];
}

export interface SkillScaffoldFinding {
  field: string;
  message: string;
  value?: string;
  /**
   * true = 助言 (ok を落とさない)。近似名の duplicate-risk 等、正当な包含名
   * (api / api-contract 型の責務分離) を block しないための区分 (PLAN-L7-420 review 是正)。
   */
  advisory?: boolean;
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

/**
 * hyphen 語境界での包含判定 (先頭・末尾だけでなく中間位置も対象。PLAN-L7-420 review round 2)。
 * 例: "advanced-api-contract-guide" は "api-contract" を語境界で包含する。
 * "rapid" は "api" を包含しない (語境界を跨ぐ substring は対象外)。
 */
function hyphenSegmentContains(haystack: string, needle: string): boolean {
  const hay = haystack.split("-");
  const nee = needle.split("-");
  if (nee.length === 0 || nee.length > hay.length) return false;
  for (let i = 0; i + nee.length <= hay.length; i++) {
    if (nee.every((segment, j) => hay[i + j] === segment)) return true;
  }
  return false;
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
      : ["domain_tags:", ...input.domainTags.map((tag) => `  - ${yamlScalar(tag)}`), ""].join("\n");
  // 品質 skeleton (PLAN-L7-420)。skill-authoring pack (PLAN-L7-419) の実証パターンに準拠:
  // 態度の先出し / 発火条件 / 視点カタログ or 手順 / 禁止事項 / 証跡。`<!-- 記入: -->` marker は
  // skill-quality gate の unfilled-scaffold 検査対象であり、記入完了まで doctor red になる。
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
    "<!-- 記入: 冒頭 1-2 文で「いつ読むか」(trigger) と、この pack が扱う判断の範囲を書く。",
    "     関連 pack との分担 (何はここ、何は他 pack が正本か) を 1 文で明示する。 -->",
    "",
    "## §0 出発点となる態度",
    "",
    "<!-- 記入: 目的そのものの再定義を 1 文で書く (例: テストの目的は確認ではなく壊れ方の発見)。",
    "     表面目標 (緑にする等) への最適化を反転させる逆説シグナルがあれば併記する。 -->",
    "",
    "## §1 判断フレーム",
    "",
    "<!-- 記入: apex モデルが暗黙に持つ経験則を、有限の明示リスト (視点カタログ・自問文・",
    "     判断順序) に外部化する。5±2 個のチャンクに収め、各項目は「頭の中で走らせる問い」",
    "     として書く。「迷ったら X」の判断閾値を最低 1 つ固定する。 -->",
    "",
    "## §2 手順と検証",
    "",
    "<!-- 記入: 実在する helix command / gate / state だけで手順を書く (skill-quality gate が",
    "     実在照合する)。done/pass 宣言に要求する証跡アンカー (command・exit code・path) を",
    "     明示する。feedback loop (fail したら直して再実行、pass まで進まない) を入れる。 -->",
    "",
    "## §3 アンチパターン (やってはいけないこと)",
    "",
    "<!-- 記入: この工程で局所最適に流れる典型 (gate を黙らせる等) を「なぜダメか / 代わりに」",
    "     の表で列挙する。ポジティブ指示だけでは境界が確定しない。 -->",
    "",
    "<!-- 記入完了チェック: (1) 上記 marker を全て削除 (2) SKILL_MAP.md trigger table へ行を追加",
    "     (3) bun run test tests/skill-quality.test.ts + helix doctor green を確認。 -->",
    "",
  ]
    .filter((line) => line.length > 0 || line === "")
    .join("\n");
}

function assignmentFindings(
  path: string,
  metadata: Record<string, unknown>,
): SkillScaffoldFinding[] {
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
  if (slug.length === 0)
    findings.push({ field: "name", message: "name must contain ascii letters or digits" });
  findings.push(...assignmentFindings(path, metadata));

  // 生成時 重複ガード (inventory-first の機械化、PLAN-L7-420)。完全一致のみ block し、
  // hyphen 語境界での包含は advisory に留める (api / api-contract 型の正当な責務分離を
  // 作成不能にしない。既存 catalog 自体が包含名を持つ)。
  for (const existing of input.existingSlugs ?? []) {
    const other = existing.trim().toLowerCase();
    if (other.length === 0 || slug.length === 0) continue;
    if (other === slug) {
      findings.push({
        field: "duplicate-slug",
        message: `既存 pack と slug が衝突: docs/skills/${other}.md。新規作成ではなく既存 pack を拡張する`,
        value: other,
      });
    } else if (hyphenSegmentContains(other, slug) || hyphenSegmentContains(slug, other)) {
      findings.push({
        field: "duplicate-risk",
        message: `近似名の既存 pack あり: docs/skills/${other}.md。責務分担を明確にできるなら作成可。まず既存 pack の拡張を検討する (inventory-first)`,
        value: other,
        advisory: true,
      });
    }
  }

  // 既定 description は穴埋め marker にする (旧既定文言「初期 scaffold である」は
  // skill-quality の generic-stub 検査の禁止句であり、生成物が gate を通れなくなる)。
  const description =
    input.description?.trim() ||
    "<!-- 記入: この pack がいつ読まれ (trigger)、何の判断を扱うかを 1-2 文で書く -->";

  return {
    ok: findings.every((finding) => finding.advisory === true),
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

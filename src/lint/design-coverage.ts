import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parse as parseYaml } from "yaml";

/**
 * design-coverage (PLAN-L7-421)。
 *
 * vmodel-docgen (PO 提供 ZIP) の catalog.yaml + `build.py coverage` 機構の TS/Bun 移植。
 * `docs/design/design-catalog.yaml` を設計文書種の採用状態の機械正本とし、次を fail-close で検査する:
 * (1) na には理由必須 (「gate を黙らせる na」の禁止を機械化)、(2) done には実在 artifact 必須
 * (done 宣言と実態の乖離 = ZIP coverage --strict 相当)、(3) source (zip-NN) の全件 trace と一意性、
 * (4) catalog 外の設計文書検出 (「勝手に作る」の禁止): `docs/design/` 配下の実在 doc が
 * どの item の artifact にも catalog の baseline (既存 doc の凍結リスト) にも無ければ red。
 */

export const DESIGN_CATALOG_PATH = "docs/design/design-catalog.yaml";
export const DESIGN_CATALOG_SCHEMA_VERSION = "design-catalog.v1";
export const DESIGN_CATALOG_STATUSES = ["done", "todo", "na"] as const;
export type DesignCatalogStatus = (typeof DESIGN_CATALOG_STATUSES)[number];

/** ZIP (vmodel-docgen) の文書種番号の全数。source は zip-01..zip-122 の完全一致集合でなければならない。 */
export const DESIGN_CATALOG_EXPECTED_SOURCE_COUNT = 122;

/** 期待 source 集合 (zip-01..zip-122)。catalog 側の編集だけでは trace の全数要求を回避できない。 */
export function expectedZipSources(): string[] {
  return Array.from(
    { length: DESIGN_CATALOG_EXPECTED_SOURCE_COUNT },
    (_, i) => `zip-${String(i + 1).padStart(2, "0")}`,
  );
}

/**
 * baseline (catalog 導入時に凍結した既存 doc リスト) の fingerprint pin。
 * catalog.yaml の baseline を書き足して rogue doc を正当化する攻撃は、この src 側定数を
 * 同時に更新しない限り red になる (コードレビュー面へ強制昇格)。更新手順: baseline を
 * 意図的に変更した場合のみ computeBaselineFingerprint の実測値でこの定数を更新する。
 */
export const DESIGN_BASELINE_FINGERPRINT_ALGO = "sha256";

export function computeBaselineFingerprint(baseline: string[]): string {
  const canonical = [...baseline].sort().join("\n");
  return `${DESIGN_BASELINE_FINGERPRINT_ALGO}:${createHash("sha256").update(canonical, "utf8").digest("hex")}`;
}

export const DESIGN_BASELINE_FINGERPRINT =
  "sha256:269bd33bab1ed39a36cb703b53bdc9e9244f361d146e8dc1c5bc3d3786165a66";

/** artifact として許可する配置 root。無関係ファイル (package.json 等) の done 偽装を機械的に弾く。 */
export const DESIGN_ARTIFACT_ALLOWED_PREFIXES = ["docs/", "src/", "tests/", ".claude/"] as const;
export const DESIGN_ARTIFACT_ALLOWED_FILES = ["CLAUDE.md", "AGENTS.md"] as const;

/** na_reason の形骸化 (「N/A」「-」等) を弾く実質下限と禁止句。 */
export const DESIGN_NA_REASON_MIN_CHARS = 10;
const TRIVIAL_NA_REASON = /^(n\/?a|なし|無し|-+|該当なし|対象外|不要|tbd|todo)$/i;

export interface DesignCatalogItem {
  id: string;
  name: string;
  category: string;
  source: string;
  status: DesignCatalogStatus | string;
  artifact?: string | string[];
  na_reason?: string;
  note?: string;
}

export interface DesignCatalog {
  schema_version: string;
  project: string;
  profile: string;
  categories: { id: string; name: string }[];
  items: DesignCatalogItem[];
  /** catalog 導入 (2026-07-11) 以前から存在する docs/design 配下 doc の凍結リスト。新規追加は artifact 経由のみ。 */
  baseline?: string[];
}

export interface DesignCoverageInput {
  /** parse 済み catalog (無ければ null → fail-close)。 */
  catalog: DesignCatalog | null;
  /** artifact path の実在判定器 (test では差し替え可能)。 */
  artifactExists: (repoRelativePath: string) => boolean;
  /** docs/design 配下に実在する design doc の repo 相対 path 一覧 (catalog 外検出の走査対象)。 */
  designDocs: string[];
  /** source の期待完全一致集合。省略時は検査しない (実運用の loadDesignCoverageInput は必ず供給する)。 */
  expectedSources?: string[];
  /** baseline の期待 fingerprint。省略時は検査しない (実運用は DESIGN_BASELINE_FINGERPRINT を供給)。 */
  expectedBaselineFingerprint?: string;
}

export type DesignCoverageViolationKind =
  | "missing-catalog"
  | "invalid-schema"
  | "unknown-status"
  | "unknown-category"
  | "duplicate-id"
  | "duplicate-source"
  | "missing-source"
  | "na-without-reason"
  | "done-without-artifact"
  | "artifact-not-found"
  | "untracked-design-doc"
  | "stale-baseline-entry"
  | "unknown-source"
  | "missing-zip-trace"
  | "trivial-na-reason"
  | "artifact-outside-scope"
  | "empty-adoption"
  | "baseline-fingerprint-drift";

export interface DesignCoverageViolation {
  kind: DesignCoverageViolationKind;
  item: string;
  detail: string;
}

export interface DesignCategoryCoverage {
  category: string;
  done: number;
  todo: number;
  na: number;
  /** done / (done + todo)。分母 0 (全件 na) のカテゴリは 0。 */
  coveragePercent: number;
}

export interface DesignCoverageResult {
  ok: boolean;
  checked: number;
  /** done / (done + todo)。na は分母に入れない (ZIP coverage と同一式)。 */
  coveragePercent: number;
  counts: { done: number; todo: number; na: number };
  /** カテゴリ別集計 (catalog.categories の宣言順)。 */
  categories: DesignCategoryCoverage[];
  violations: DesignCoverageViolation[];
}

export function loadDesignCoverageInput(repoRoot: string = process.cwd()): DesignCoverageInput {
  const path = join(repoRoot, ...DESIGN_CATALOG_PATH.split("/"));
  let catalog: DesignCatalog | null = null;
  if (existsSync(path)) {
    try {
      const parsed = parseYaml(readFileSync(path, "utf8"));
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        catalog = parsed as DesignCatalog;
      }
    } catch {
      catalog = null;
    }
  }
  return {
    catalog,
    artifactExists: (rel) => existsSync(join(repoRoot, ...rel.split("/"))),
    designDocs: listDesignDocs(repoRoot),
    expectedSources: expectedZipSources(),
    expectedBaselineFingerprint: DESIGN_BASELINE_FINGERPRINT,
  };
}

export const DESIGN_DOCS_ROOT = "docs/design";

/** docs/design 配下の markdown design doc を repo 相対 path で列挙する (catalog 外検出の走査対象)。 */
export function listDesignDocs(repoRoot: string): string[] {
  const root = join(repoRoot, ...DESIGN_DOCS_ROOT.split("/"));
  if (!existsSync(root)) return [];
  const docs: string[] = [];
  const walk = (dir: string, rel: string): void => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const childRel = `${rel}/${entry.name}`;
      if (entry.isDirectory()) {
        walk(join(dir, entry.name), childRel);
      } else if (entry.isFile() && entry.name.endsWith(".md")) {
        docs.push(childRel);
      }
    }
  };
  walk(root, DESIGN_DOCS_ROOT);
  return docs.sort();
}

/**
 * artifact path は正規形の repo 相対 path のみ許可する。
 * `docs/../package.json` のような traversal・絶対 path・`.` segment・空 segment・
 * Windows 区切りを弾き、許可 root 検査 (startsWith) の迂回を防ぐ。
 */
export function isCanonicalRepoRelativePath(path: string): boolean {
  if (
    path.length === 0 ||
    path.startsWith("/") ||
    path.startsWith("./") ||
    path.includes("\\") ||
    /^[A-Za-z]:/.test(path)
  )
    return false;
  const segments = path.split("/");
  return segments.every((s) => s.length > 0 && s !== "." && s !== "..");
}

function artifactList(item: DesignCatalogItem): string[] {
  if (Array.isArray(item.artifact)) {
    return item.artifact.filter((a): a is string => typeof a === "string" && a.trim().length > 0);
  }
  if (typeof item.artifact === "string" && item.artifact.trim().length > 0) return [item.artifact];
  return [];
}

export function analyzeDesignCoverage(input: DesignCoverageInput): DesignCoverageResult {
  const violations: DesignCoverageViolation[] = [];
  const catalog = input.catalog;

  if (catalog === null) {
    return {
      ok: false,
      checked: 0,
      coveragePercent: 0,
      counts: { done: 0, todo: 0, na: 0 },
      categories: [],
      violations: [
        {
          kind: "missing-catalog",
          item: DESIGN_CATALOG_PATH,
          detail: "design catalog が読めない (設計採否の機械正本の不在は fail-close)",
        },
      ],
    };
  }

  if (
    catalog.schema_version !== DESIGN_CATALOG_SCHEMA_VERSION ||
    !Array.isArray(catalog.categories) ||
    !Array.isArray(catalog.items)
  ) {
    return {
      ok: false,
      checked: 0,
      coveragePercent: 0,
      counts: { done: 0, todo: 0, na: 0 },
      categories: [],
      violations: [
        {
          kind: "invalid-schema",
          item: DESIGN_CATALOG_PATH,
          detail: `schema_version=${String(catalog.schema_version)} (期待: ${DESIGN_CATALOG_SCHEMA_VERSION}) / categories・items は配列必須`,
        },
      ],
    };
  }

  const categoryIds = new Set(catalog.categories.map((c) => c.id));
  const seenIds = new Map<string, number>();
  const seenSources = new Map<string, string>();
  const counts = { done: 0, todo: 0, na: 0 };
  const categoryCounts = new Map<string, { done: number; todo: number; na: number }>(
    catalog.categories.map((c) => [c.id, { done: 0, todo: 0, na: 0 }]),
  );
  const validStatuses = new Set<string>(DESIGN_CATALOG_STATUSES);

  for (const item of catalog.items) {
    const id = item.id ?? "(no-id)";
    seenIds.set(id, (seenIds.get(id) ?? 0) + 1);

    if (!validStatuses.has(item.status)) {
      violations.push({
        kind: "unknown-status",
        item: id,
        detail: `status "${String(item.status)}" は ${DESIGN_CATALOG_STATUSES.join("/")} のいずれかにする`,
      });
    } else {
      counts[item.status as DesignCatalogStatus] += 1;
      const perCategory = categoryCounts.get(item.category);
      if (perCategory) perCategory[item.status as DesignCatalogStatus] += 1;
    }

    if (!categoryIds.has(item.category)) {
      violations.push({
        kind: "unknown-category",
        item: id,
        detail: `category "${String(item.category)}" が categories に無い`,
      });
    }

    if (typeof item.source !== "string" || !/^zip-\d{2,3}$/.test(item.source)) {
      violations.push({
        kind: "missing-source",
        item: id,
        detail: `source "${String(item.source)}" は zip-NN 形式で ZIP 文書番号へ trace する`,
      });
    } else if (input.expectedSources && !input.expectedSources.includes(item.source)) {
      violations.push({
        kind: "unknown-source",
        item: id,
        detail: `source ${item.source} は期待集合 (zip-01..zip-${DESIGN_CATALOG_EXPECTED_SOURCE_COUNT}) の範囲外`,
      });
    } else if (seenSources.has(item.source)) {
      violations.push({
        kind: "duplicate-source",
        item: id,
        detail: `source ${item.source} が ${seenSources.get(item.source)} と重複`,
      });
    } else {
      seenSources.set(item.source, id);
    }

    if (item.status === "na") {
      const reason = (item.na_reason ?? "").trim();
      if (!reason) {
        violations.push({
          kind: "na-without-reason",
          item: id,
          detail: "na には na_reason 必須 (理由なき対象外は gate を黙らせる na とみなす)",
        });
      } else if (reason.length < DESIGN_NA_REASON_MIN_CHARS || TRIVIAL_NA_REASON.test(reason)) {
        violations.push({
          kind: "trivial-na-reason",
          item: id,
          detail: `na_reason "${reason}" は形骸化している (関心事が構造的に存在しない理由を ${DESIGN_NA_REASON_MIN_CHARS} 字以上で書く)`,
        });
      }
    }

    if (item.status === "done") {
      const artifacts = artifactList(item);
      if (artifacts.length === 0) {
        violations.push({
          kind: "done-without-artifact",
          item: id,
          detail: "done には対応 artifact (実在 path) 必須 (done 宣言と実態の乖離検出)",
        });
      } else {
        for (const artifact of artifacts) {
          const inScope =
            isCanonicalRepoRelativePath(artifact) &&
            (DESIGN_ARTIFACT_ALLOWED_FILES.includes(
              artifact as (typeof DESIGN_ARTIFACT_ALLOWED_FILES)[number],
            ) ||
              DESIGN_ARTIFACT_ALLOWED_PREFIXES.some((p) => artifact.startsWith(p)));
          if (!inScope) {
            violations.push({
              kind: "artifact-outside-scope",
              item: id,
              detail: `artifact ${artifact} は許可 root (${DESIGN_ARTIFACT_ALLOWED_PREFIXES.join(" ")}) の外 (無関係ファイルでの done 偽装を禁止)`,
            });
          } else if (!input.artifactExists(artifact)) {
            violations.push({
              kind: "artifact-not-found",
              item: id,
              detail: `artifact が実在しない: ${artifact}`,
            });
          }
        }
      }
    }
  }

  for (const [id, count] of seenIds) {
    if (count > 1) {
      violations.push({ kind: "duplicate-id", item: id, detail: `id が ${count} 回出現` });
    }
  }

  // catalog 外検出 (「勝手に作る」の禁止): docs/design 配下の実在 doc は、
  // いずれかの item の artifact か baseline (導入時凍結) に載っていなければならない。
  const tracked = new Set<string>();
  for (const item of catalog.items) {
    for (const artifact of artifactList(item)) tracked.add(artifact);
  }
  const baseline = Array.isArray(catalog.baseline)
    ? catalog.baseline.filter((b): b is string => typeof b === "string")
    : [];
  for (const frozen of baseline) tracked.add(frozen);
  const existingDocs = new Set(input.designDocs);
  for (const docPath of input.designDocs) {
    if (!tracked.has(docPath)) {
      violations.push({
        kind: "untracked-design-doc",
        item: docPath,
        detail:
          "catalog のどの item の artifact にも baseline にも無い design doc (catalog 経由で採否を宣言してから作る)",
      });
    }
  }
  for (const frozen of baseline) {
    if (!existingDocs.has(frozen)) {
      violations.push({
        kind: "stale-baseline-entry",
        item: frozen,
        detail: "baseline に載っている doc が実在しない (削除済みなら baseline から除去する)",
      });
    }
  }

  // baseline fingerprint pin: catalog.yaml の baseline 追記だけでは rogue doc を正当化できない
  // (src 側の DESIGN_BASELINE_FINGERPRINT を同時更新しない限り red = コードレビュー面へ強制)。
  if (input.expectedBaselineFingerprint !== undefined) {
    const actual = computeBaselineFingerprint(baseline);
    if (actual !== input.expectedBaselineFingerprint) {
      violations.push({
        kind: "baseline-fingerprint-drift",
        item: "baseline",
        detail: `baseline fingerprint 不一致 (actual ${actual})。意図的な変更なら src/lint/design-coverage.ts の pin を同時更新する`,
      });
    }
  }

  // source の全数 trace: 期待集合 (zip-01..zip-122) の欠番を許さない (件数偽装の禁止)。
  if (input.expectedSources) {
    for (const expected of input.expectedSources) {
      if (!seenSources.has(expected)) {
        violations.push({
          kind: "missing-zip-trace",
          item: expected,
          detail: `期待 source ${expected} に対応する item が catalog に無い (ZIP 文書種の黙殺を禁止)`,
        });
      }
    }
  }

  const denominator = counts.done + counts.todo;
  // 全件 na 等で採用集合が空になる catalog は「何も設計しない宣言」であり green にしない。
  if (catalog.items.length > 0 && denominator === 0) {
    violations.push({
      kind: "empty-adoption",
      item: "items",
      detail: "done + todo が 0 (全件 na での coverage 空洞化を禁止)",
    });
  }

  const coveragePercent =
    denominator === 0 ? 0 : Math.round((counts.done / denominator) * 1000) / 10;

  const categories: DesignCategoryCoverage[] = catalog.categories.map((c) => {
    const per = categoryCounts.get(c.id) ?? { done: 0, todo: 0, na: 0 };
    const perDenominator = per.done + per.todo;
    return {
      category: c.id,
      ...per,
      coveragePercent:
        perDenominator === 0 ? 0 : Math.round((per.done / perDenominator) * 1000) / 10,
    };
  });

  return {
    ok: violations.length === 0,
    checked: catalog.items.length,
    coveragePercent,
    counts,
    categories,
    violations,
  };
}

export function designCoverageMessages(result: DesignCoverageResult): string[] {
  const summary = `design-coverage - 総合 ${result.coveragePercent}% (done=${result.counts.done} / todo=${result.counts.todo} / na=${result.counts.na}, items=${result.checked})`;
  const messages: string[] = [];
  // カテゴリ別 % と todo 残 (PLAN-L7-421 §2: 総合 % / カテゴリ別 / todo 残)。全件 na のカテゴリは対象外として省く。
  const adopted = result.categories.filter((c) => c.done + c.todo > 0);
  const byCategory = adopted.map((c) => `${c.category} ${c.coveragePercent}%`).join(", ");
  const todoRemaining = adopted
    .filter((c) => c.todo > 0)
    .map((c) => `${c.category}=${c.todo}`)
    .join(", ");
  if (byCategory.length > 0) messages.push(`design-coverage - カテゴリ別: ${byCategory}`);
  if (todoRemaining.length > 0) messages.push(`design-coverage - todo 残: ${todoRemaining}`);
  if (result.ok) return [`${summary} - OK`, ...messages];
  const sample = result.violations
    .slice(0, 5)
    .map((v) => `${v.item}:${v.kind}`)
    .join(", ");
  return [
    `design-coverage - violation ${result.violations.length} 件。${summary}`,
    ...messages,
    `design-coverage - sample: ${sample} (na 理由・done artifact・zip trace を確認、PLAN-L7-421)`,
  ];
}

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * L12 canonical layer projection (PLAN-L7-460, HR-FR-VMCUT-02/05):
 * legacy L0-L14 から canonical L1-L12 への exact remap の機械 SSoT。
 * 正本は docs/design/helix/L3-requirements/vmodel-canonical-authority-cutover.md §1。
 * 一括 rename はせず legacy/canonical の二重表示 projection のみを提供する
 * (schema enum / PLAN ID policy の切替は二重表示 green 実績後の後続スライス)。
 */

export interface LayerProjectionEntry {
  legacy: string;
  canonical: string;
  canonicalLabel: string;
}

/** HR-FR-VMCUT-02 exact remap (legacy L0-L14 全 15 layer を被覆) */
export const LAYER_PROJECTION_MAP: readonly LayerProjectionEntry[] = [
  { legacy: "L0", canonical: "L1", canonicalLabel: "企画" },
  { legacy: "L1", canonical: "L2", canonicalLabel: "要求・画面・flow" },
  { legacy: "L2", canonical: "L2", canonicalLabel: "要求・画面・flow" },
  { legacy: "L3", canonical: "L3", canonicalLabel: "要件freeze" },
  { legacy: "L4", canonical: "L4", canonicalLabel: "基本設計" },
  { legacy: "L5", canonical: "L5", canonicalLabel: "詳細設計+test contract" },
  { legacy: "L6", canonical: "L5", canonicalLabel: "詳細設計+test contract" },
  { legacy: "L7", canonical: "L6", canonicalLabel: "実装" },
  { legacy: "L8", canonical: "L7", canonicalLabel: "TDD・単体" },
  { legacy: "L9", canonical: "L8", canonicalLabel: "結合" },
  { legacy: "L10", canonical: "L9", canonicalLabel: "総合" },
  { legacy: "L11", canonical: "L10", canonicalLabel: "受入" },
  { legacy: "L12", canonical: "L11", canonicalLabel: "受入/vmodel検証" },
  { legacy: "L13", canonical: "L12", canonicalLabel: "運用テスト・release" },
  { legacy: "L14", canonical: "L12", canonicalLabel: "運用テスト・release" },
];

export function projectLegacyLayer(legacy: string): LayerProjectionEntry | null {
  const normalized = legacy.trim().toUpperCase();
  return LAYER_PROJECTION_MAP.find((entry) => entry.legacy === normalized) ?? null;
}

/** L-token (L + 数字) だけを projection 対象にする。`cutover` 等の非 L-token は対象外 */
export function isLegacyLayerToken(token: string): boolean {
  return /^L\d+$/i.test(token.trim());
}

export interface DualProjectionInput {
  /** 走査で観測した legacy layer token (重複可、出所を message 用に持つ) */
  observedLayers: { token: string; source: string }[];
}

export interface DualProjectionRow {
  legacy: string;
  canonical: string;
  canonicalLabel: string;
  count: number;
}

export interface DualProjectionResult {
  ok: boolean;
  rows: DualProjectionRow[];
  unmapped: { token: string; source: string }[];
}

export function analyzeDualProjection(input: DualProjectionInput): DualProjectionResult {
  const counts = new Map<string, number>();
  const unmapped: { token: string; source: string }[] = [];
  for (const observed of input.observedLayers) {
    if (!isLegacyLayerToken(observed.token)) continue;
    const projected = projectLegacyLayer(observed.token);
    if (!projected) {
      unmapped.push(observed);
      continue;
    }
    counts.set(projected.legacy, (counts.get(projected.legacy) ?? 0) + 1);
  }
  const rows = LAYER_PROJECTION_MAP.filter((entry) => counts.has(entry.legacy)).map((entry) => ({
    legacy: entry.legacy,
    canonical: entry.canonical,
    canonicalLabel: entry.canonicalLabel,
    count: counts.get(entry.legacy) ?? 0,
  }));
  return { ok: unmapped.length === 0, rows, unmapped };
}

export function loadDualProjectionInput(repoRoot: string = process.cwd()): DualProjectionInput {
  const observedLayers: { token: string; source: string }[] = [];

  const designRoot = join(repoRoot, "docs/design/helix");
  for (const entry of readdirSync(designRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const match = entry.name.match(/^(L\d+)-/i);
    if (match) observedLayers.push({ token: match[1], source: `design-dir:${entry.name}` });
  }

  const plansRoot = join(repoRoot, "docs/plans");
  for (const entry of readdirSync(plansRoot, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith(".md")) continue;
    const content = readFileSync(join(plansRoot, entry.name), "utf8");
    const match = content.match(/^layer:\s*"?(\S+?)"?\s*$/m);
    if (match) observedLayers.push({ token: match[1], source: `plan:${entry.name}` });
  }

  return { observedLayers };
}

export function dualProjectionMessages(result: DualProjectionResult): string[] {
  if (!result.ok) {
    const sample = result.unmapped
      .slice(0, 5)
      .map((u) => `${u.token}@${u.source}`)
      .join(", ");
    return [
      `l12-dual-projection - violation: HR-FR-VMCUT-02 remap に無い legacy layer token ${result.unmapped.length} 件: ${sample} → remap SSoT (src/vmodel/layer-projection.ts) か authoring source を是正せよ (HR-FR-VMCUT-05 fail-close)`,
    ];
  }
  const dual = result.rows.map((row) => `${row.legacy}→${row.canonical}(${row.count})`).join(", ");
  return [`l12-dual-projection - OK (unmapped=0, 二重表示 legacy→canonical: ${dual})`];
}

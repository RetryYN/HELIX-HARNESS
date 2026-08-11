/**
 * UI Domain 実 asset gate（Issue #209 SA-UDP-02、PLAN-L7-540）。
 *
 * `config/ui-domain/harness-console-bundle.json`（L2 正本からの抽出 asset）を
 * `evaluateUiDomainBundle` へ通し、doctor から呼べる { ok, messages } を返す。
 *
 * SA-UDP-02 は「実 profile / 実 Pattern Contract / 実共通 Rule Pack の**同時 load**」を
 * 要求するため、bundle 評価（宣言された section だけ検査する）に加えて、実 asset には
 * 5 section 全部の宣言があることをこの gate で強制する。section を asset から消して
 * green を得る骨抜き経路（宣言しなければ検査されない）を塞ぐのが目的であり、
 * `evaluateUiDomainBundle` 側の任意宣言仕様（合成 bundle 用）は変えない。
 *
 * fail-open 禁止: asset 欠落・破損 JSON・schema 不一致はすべて ok=false。
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { evaluateUiDomainBundle } from "./ui-domain-pattern-profile";

export const UI_DOMAIN_BUNDLE_ASSET = "config/ui-domain/harness-console-bundle.json";

/** 実 asset に宣言を義務付ける section（graph は #257 到達まで対象外）。 */
export const REQUIRED_BUNDLE_SECTIONS: readonly string[] = [
  "domain",
  "contract",
  "profile",
  "pack",
  "pairwise",
];

/** L2 正本から抽出した canonical entity ID。asset 自身とは独立した完全性 oracle。 */
export const REQUIRED_UI_DOMAIN_ENTITY_IDS: readonly string[] = [
  "SCR-pm-01",
  "SCR-pm-02",
  "SCR-pm-03",
  "SCR-pm-04",
  "SCR-pm-05",
  "SCR-pm-06",
  "SCR-hm-01",
  "SCR-hm-02",
  "SCR-hm-03",
  "SCR-hm-04",
  "SCR-hm-05",
  "SCR-hm-06",
  "SCR-hm-07",
  "SCR-hm-08",
  "SCR-gd-01",
  "FLW-pm-drilldown",
  "FLW-handover-next-action",
  "NAV-pm-case-scope",
  "NAV-hm-harness-scope",
  "NAV-gd-category",
  "RGN-top-nav",
  "RGN-breadcrumb",
  "RGN-filter-bar",
  "RGN-main-content",
  "RGN-next-action",
  "CMP-data-table",
  "CMP-status-badge",
  "CMP-copy-button",
  "CMP-next-action-card",
  "CMP-filter-bar",
  "CMP-breadcrumb",
  "CMP-polling-indicator",
  "CMP-markdown-renderer",
  "CMP-mermaid-renderer",
  "CMP-yaml-frontmatter-view",
  "PTN-cli-copy",
  "PTN-url-query-state",
  "PTN-polling-refresh",
  "PTN-deep-link",
  "TOK-state-color",
  "TOK-spacing-grid",
  "TOK-typography",
  "TOK-emphasis",
  "CNT-cli-command-text",
  "CNT-next-action-text",
  "FBK-copied",
  "FBK-last-updated",
  "UST-ok",
  "UST-warn",
  "UST-error",
  "UST-empty",
  "UST-loading",
];

export interface UiDomainGateResultV1 {
  ok: boolean;
  messages: string[];
}

/** 実 asset を repo から読む（唯一の I/O 境界）。欠落・破損は throw する。 */
export function loadUiDomainBundleRaw(repoRoot: string = process.cwd()): unknown {
  return JSON.parse(readFileSync(join(repoRoot, UI_DOMAIN_BUNDLE_ASSET), "utf8"));
}

/** U-UDP-008: 実 asset の bundle 評価 + 必須 section 宣言強制（pure）。 */
export function analyzeUiDomainBundleGate(raw: unknown): UiDomainGateResultV1 {
  const messages: string[] = [];
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    return { ok: false, messages: ["ui-domain-bundle - violation: asset が record ではない"] };
  }
  const record = raw as Record<string, unknown>;
  for (const section of REQUIRED_BUNDLE_SECTIONS) {
    if (record[section] === undefined) {
      messages.push(
        `ui-domain-bundle - violation: section-missing:${section}（実 asset は 5 section 同時宣言が必須。宣言を消して検査を骨抜きにしない）`,
      );
    }
  }
  const domain = record.domain;
  if (typeof domain === "object" && domain !== null && !Array.isArray(domain)) {
    const entities = (domain as Record<string, unknown>).entities;
    if (Array.isArray(entities)) {
      const actualIds = entities.flatMap((entity) => {
        if (typeof entity !== "object" || entity === null || Array.isArray(entity)) return [];
        const id = (entity as Record<string, unknown>).entity_id;
        return typeof id === "string" ? [id] : [];
      });
      const actual = new Set(actualIds);
      const required = new Set(REQUIRED_UI_DOMAIN_ENTITY_IDS);
      const missing = REQUIRED_UI_DOMAIN_ENTITY_IDS.filter((id) => !actual.has(id));
      const unexpected = [...actual].filter((id) => !required.has(id));
      const duplicates = [...actual].filter(
        (id) => actualIds.filter((value) => value === id).length > 1,
      );
      if (missing.length > 0)
        messages.push(`ui-domain-bundle - violation: entity-missing:${missing.join(",")}`);
      if (unexpected.length > 0)
        messages.push(`ui-domain-bundle - violation: entity-unexpected:${unexpected.join(",")}`);
      if (duplicates.length > 0)
        messages.push(`ui-domain-bundle - violation: entity-duplicate:${duplicates.join(",")}`);
    }
  }
  const evaluated = evaluateUiDomainBundle(raw);
  if (!evaluated.ok) {
    for (const failure of evaluated.failures) {
      messages.push(
        `ui-domain-bundle - violation: bundle:${failure.code}:${failure.evidence_digest}`,
      );
    }
    return { ok: false, messages };
  }
  for (const section of evaluated.value.sections) {
    if (section.ok) continue;
    for (const failure of section.failures) {
      messages.push(
        `ui-domain-bundle - violation: section=${section.section} ${failure.code} (${failure.evidence_digest})`,
      );
    }
  }
  if (messages.length > 0) return { ok: false, messages };
  return {
    ok: true,
    messages: [
      `ui-domain-bundle — OK (5 section green、report_digest=${evaluated.value.report_digest})`,
    ],
  };
}

/** doctor 配線点: 実 repo の実 asset を検査する。 */
export function checkUiDomainBundleGate(repoRoot: string = process.cwd()): UiDomainGateResultV1 {
  let raw: unknown;
  try {
    raw = loadUiDomainBundleRaw(repoRoot);
  } catch (error) {
    return {
      ok: false,
      messages: [
        `ui-domain-bundle - violation: asset-missing:${UI_DOMAIN_BUNDLE_ASSET} (${
          error instanceof Error ? error.message.split("\n")[0] : "unknown"
        })`,
      ],
    };
  }
  return analyzeUiDomainBundleGate(raw);
}

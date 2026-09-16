/**
 * WCC pair-authority exact-graph lint (Issue #416 / PLAN-RECOVERY-32).
 *
 * Worker Common Contract の L3(要件)↔L10(受入) pair を、current
 * WCC-FR-01..09 / WCC-AC-01..07 / HAT-WCC-01..09 の exact trace graph として
 * 機械検証する。既存 `github-l3-trace-authority-hygiene` は ID 集合一致（件数と文言）
 * だけを検査するため、FR↔AC↔HAT の edge・欠落・重複・extra・mistrace は未証明だった。
 * 本 lint はその graph 整合を orphan/mistrace 配列 0 で fail-close する。
 *
 * 範型: src/lint/g3-trace.ts（orphan 配列を空配列で厳密検証する既存 pair-trace lint）。
 */
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..", "..");

export const WCC_L3_PATH = "docs/design/helix/L3-requirements/worker-common-contract.md";
export const WCC_L10_PATH = "docs/test-design/helix/worker-common-contract-acceptance.md";

/**
 * §2 provider対応表を根拠にするガバナンスAC/HATは対応FRを持たない。
 * これらは「FR無し」を明示的に許容するため allowlist 化し、想定外のFR無しは orphan として検出する。
 */
export const NO_FR_AC_ALLOWLIST: readonly string[] = ["WCC-AC-06"];
export const NO_FR_HAT_ALLOWLIST: readonly string[] = ["HAT-WCC-05"];

export interface WccDocSource {
  l3: string;
  l10: string;
}

export function loadWccDocs(repoRoot: string = ROOT): WccDocSource {
  return {
    l3: readFileSync(resolve(repoRoot, WCC_L3_PATH), "utf-8"),
    l10: readFileSync(resolve(repoRoot, WCC_L10_PATH), "utf-8"),
  };
}

/** `## §N ...` 見出しで区切られた本文から指定 heading の section 本文を切り出す。 */
export function sliceSection(doc: string, headingPrefix: string): string {
  const lines = doc.split("\n");
  const startIdx = lines.findIndex((line) => line.startsWith(headingPrefix));
  if (startIdx === -1) return "";
  let endIdx = lines.length;
  for (let i = startIdx + 1; i < lines.length; i++) {
    if (/^## /.test(lines[i])) {
      endIdx = i;
      break;
    }
  }
  return lines.slice(startIdx, endIdx).join("\n");
}

function duplicates(counts: Map<string, number>): string[] {
  return [...counts.entries()]
    .filter(([, n]) => n > 1)
    .map(([id]) => id)
    .sort();
}

/** L3 §1 の FR 定義表から `| \`WCC-FR-NN\` |` を抽出。 */
export function extractWccFrIds(l3: string): Map<string, number> {
  const section = sliceSection(l3, "## §1 provider");
  const acc = new Map<string, number>();
  for (const m of section.matchAll(/^\|\s*`(WCC-FR-\d{2})`\s*\|/gm)) {
    acc.set(m[1], (acc.get(m[1]) ?? 0) + 1);
  }
  return acc;
}

/** L3 §3 の AC 定義表から `| \`WCC-AC-NN\` |` を抽出。 */
export function extractWccAcIds(l3: string): Map<string, number> {
  const section = sliceSection(l3, "## §3 受入条件");
  const acc = new Map<string, number>();
  for (const m of section.matchAll(/^\|\s*`(WCC-AC-\d{2})`\s*\|/gm)) {
    acc.set(m[1], (acc.get(m[1]) ?? 0) + 1);
  }
  return acc;
}

/** L10 §3 trace 表から HAT ID を抽出。 */
export function extractWccHatIds(l10: string): Map<string, number> {
  const section = sliceSection(l10, "## §3 trace");
  const acc = new Map<string, number>();
  for (const m of section.matchAll(/^\|\s*`(HAT-WCC-\d{2})`\s*\|/gm)) {
    acc.set(m[1], (acc.get(m[1]) ?? 0) + 1);
  }
  return acc;
}

/** L10 §1 oracle 表の HAT ID（§3 との一致検査用）。 */
export function extractWccHatOracleIds(l10: string): Set<string> {
  const section = sliceSection(l10, "## §1 oracle");
  return new Set([...section.matchAll(/^\|\s*`(HAT-WCC-\d{2})`\s*\|/gm)].map((m) => m[1]));
}

/** table 行を `|` で列分割（先頭/末尾の空セルを除く）。 */
function cells(line: string): string[] {
  return line
    .replace(/^\||\|$/g, "")
    .split("|")
    .map((c) => c.trim());
}

function idsInCell(cell: string, pattern: RegExp): string[] {
  return [...new Set((cell.match(pattern) ?? []).map((s) => s.replace(/`/g, "")))].sort();
}

/** L3 §3 AC 表: AC → 対応FR[]（列: AC / 対応FR / ...）。 */
export function extractAcToFr(l3: string): Map<string, string[]> {
  const section = sliceSection(l3, "## §3 受入条件");
  const map = new Map<string, string[]>();
  for (const line of section.split("\n")) {
    const m = line.match(/^\|\s*`(WCC-AC-\d{2})`\s*\|/);
    if (!m) continue;
    const col = cells(line);
    const frCell = col[1] ?? "";
    map.set(m[1], idsInCell(frCell, /WCC-FR-\d{2}/g));
  }
  return map;
}

/** L10 §3 trace 表: HAT → {fr[], ac[]}（列: HAT / 対応FR / 対応AC / pair design）。 */
export function extractHatEdges(l10: string): Map<string, { fr: string[]; ac: string[] }> {
  const section = sliceSection(l10, "## §3 trace");
  const map = new Map<string, { fr: string[]; ac: string[] }>();
  for (const line of section.split("\n")) {
    const m = line.match(/^\|\s*`(HAT-WCC-\d{2})`\s*\|/);
    if (!m) continue;
    const col = cells(line);
    const frCell = col[1] ?? "";
    const acCell = col[2] ?? "";
    map.set(m[1], {
      fr: idsInCell(frCell, /WCC-FR-\d{2}/g),
      ac: idsInCell(acCell, /WCC-AC-\d{2}/g),
    });
  }
  return map;
}

export interface WccTraceResult {
  duplicateFr: string[];
  duplicateAc: string[];
  duplicateHat: string[];
  acRefsUnknownFr: string[];
  hatRefsUnknownFr: string[];
  hatRefsUnknownAc: string[];
  frWithoutAc: string[];
  frWithoutHat: string[];
  acWithoutHat: string[];
  unexpectedNoFrAc: string[];
  unexpectedNoFrHat: string[];
  staleNoFrAcAllowlist: string[];
  staleNoFrHatAllowlist: string[];
  hatMistrace: string[];
  hatOracleTraceMismatch: string[];
  totals: { fr: number; ac: number; hat: number };
}

export function wccTraceOk(r: WccTraceResult): boolean {
  return (
    r.duplicateFr.length === 0 &&
    r.duplicateAc.length === 0 &&
    r.duplicateHat.length === 0 &&
    r.acRefsUnknownFr.length === 0 &&
    r.hatRefsUnknownFr.length === 0 &&
    r.hatRefsUnknownAc.length === 0 &&
    r.frWithoutAc.length === 0 &&
    r.frWithoutHat.length === 0 &&
    r.acWithoutHat.length === 0 &&
    r.unexpectedNoFrAc.length === 0 &&
    r.unexpectedNoFrHat.length === 0 &&
    r.staleNoFrAcAllowlist.length === 0 &&
    r.staleNoFrHatAllowlist.length === 0 &&
    r.hatMistrace.length === 0 &&
    r.hatOracleTraceMismatch.length === 0
  );
}

export function analyzeWccTrace(docs?: WccDocSource): WccTraceResult {
  const d = docs ?? loadWccDocs();

  const frCounts = extractWccFrIds(d.l3);
  const acCounts = extractWccAcIds(d.l3);
  const hatCounts = extractWccHatIds(d.l10);
  const frSet = new Set(frCounts.keys());
  const acSet = new Set(acCounts.keys());
  const hatSet = new Set(hatCounts.keys());

  const acToFr = extractAcToFr(d.l3);
  const hatEdges = extractHatEdges(d.l10);
  const noFrAc = new Set(NO_FR_AC_ALLOWLIST);
  const noFrHat = new Set(NO_FR_HAT_ALLOWLIST);

  // 重複定義
  const duplicateFr = duplicates(frCounts);
  const duplicateAc = duplicates(acCounts);
  const duplicateHat = duplicates(hatCounts);

  // dangling ref（extra / mistrace: 未定義IDを指す edge）
  const acRefsUnknownFr = [
    ...new Set([...acToFr.values()].flat().filter((fr) => !frSet.has(fr))),
  ].sort();
  const hatRefsUnknownFr = [
    ...new Set([...hatEdges.values()].flatMap((e) => e.fr).filter((fr) => !frSet.has(fr))),
  ].sort();
  const hatRefsUnknownAc = [
    ...new Set([...hatEdges.values()].flatMap((e) => e.ac).filter((ac) => !acSet.has(ac))),
  ].sort();

  // forward completeness: 全FRが最低1つのACに、全FR/ACが最低1つのHATに被覆される
  const frCoveredByAc = new Set([...acToFr.values()].flat());
  const frCoveredByHat = new Set([...hatEdges.values()].flatMap((e) => e.fr));
  const acCoveredByHat = new Set([...hatEdges.values()].flatMap((e) => e.ac));
  const frWithoutAc = [...frSet].filter((fr) => !frCoveredByAc.has(fr)).sort();
  const frWithoutHat = [...frSet].filter((fr) => !frCoveredByHat.has(fr)).sort();
  const acWithoutHat = [...acSet].filter((ac) => !acCoveredByHat.has(ac)).sort();

  // FR無し AC/HAT が allowlist 外
  const unexpectedNoFrAc = [...acToFr.entries()]
    .filter(([ac, fr]) => fr.length === 0 && !noFrAc.has(ac))
    .map(([ac]) => ac)
    .sort();
  const unexpectedNoFrHat = [...hatEdges.entries()]
    .filter(([hat, e]) => e.fr.length === 0 && !noFrHat.has(hat))
    .map(([hat]) => hat)
    .sort();

  // allowlist が実体（AC/HATが存在し、実際にFR無し）に一致しない stale entry
  const staleNoFrAcAllowlist = [...noFrAc]
    .filter((ac) => !acSet.has(ac) || (acToFr.get(ac)?.length ?? 0) > 0)
    .sort();
  const staleNoFrHatAllowlist = [...noFrHat]
    .filter((hat) => !hatSet.has(hat) || (hatEdges.get(hat)?.fr.length ?? 0) > 0)
    .sort();

  // mistrace: 各HATの直接FRは、その参照ACのFR和集合の部分集合でなければならない
  const hatMistrace: string[] = [];
  for (const [hat, e] of hatEdges) {
    const acFrUnion = new Set(e.ac.flatMap((ac) => acToFr.get(ac) ?? []));
    const inconsistent = e.fr.filter((fr) => !acFrUnion.has(fr));
    if (inconsistent.length > 0) hatMistrace.push(`${hat}:${inconsistent.join(",")}`);
  }
  hatMistrace.sort();

  // §1 oracle 表と §3 trace 表の HAT 集合一致
  const oracleHats = extractWccHatOracleIds(d.l10);
  const traceHats = new Set(hatEdges.keys());
  const onlyOracle = [...oracleHats].filter((h) => !traceHats.has(h));
  const onlyTrace = [...traceHats].filter((h) => !oracleHats.has(h));
  const hatOracleTraceMismatch = [
    ...onlyOracle.map((h) => `oracle-only:${h}`),
    ...onlyTrace.map((h) => `trace-only:${h}`),
  ].sort();

  return {
    duplicateFr,
    duplicateAc,
    duplicateHat,
    acRefsUnknownFr,
    hatRefsUnknownFr,
    hatRefsUnknownAc,
    frWithoutAc,
    frWithoutHat,
    acWithoutHat,
    unexpectedNoFrAc,
    unexpectedNoFrHat,
    staleNoFrAcAllowlist,
    staleNoFrHatAllowlist,
    hatMistrace,
    hatOracleTraceMismatch,
    totals: { fr: frSet.size, ac: acSet.size, hat: hatSet.size },
  };
}

export function wccTraceMessages(r: WccTraceResult): string[] {
  if (wccTraceOk(r)) {
    return [`wcc-trace - OK (fr=${r.totals.fr}, ac=${r.totals.ac}, hat=${r.totals.hat})`];
  }
  const groups: [string, string[]][] = [
    ["duplicateFr", r.duplicateFr],
    ["duplicateAc", r.duplicateAc],
    ["duplicateHat", r.duplicateHat],
    ["acRefsUnknownFr", r.acRefsUnknownFr],
    ["hatRefsUnknownFr", r.hatRefsUnknownFr],
    ["hatRefsUnknownAc", r.hatRefsUnknownAc],
    ["frWithoutAc", r.frWithoutAc],
    ["frWithoutHat", r.frWithoutHat],
    ["acWithoutHat", r.acWithoutHat],
    ["unexpectedNoFrAc", r.unexpectedNoFrAc],
    ["unexpectedNoFrHat", r.unexpectedNoFrHat],
    ["staleNoFrAcAllowlist", r.staleNoFrAcAllowlist],
    ["staleNoFrHatAllowlist", r.staleNoFrHatAllowlist],
    ["hatMistrace", r.hatMistrace],
    ["hatOracleTraceMismatch", r.hatOracleTraceMismatch],
  ];
  const parts = groups
    .filter(([, ids]) => ids.length > 0)
    .map(([kind, ids]) => `${kind}=${ids.join(",")}`);
  return [`wcc-trace - violation: ${parts.join("; ")}`];
}

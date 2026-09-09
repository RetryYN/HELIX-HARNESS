/**
 * oracle 宣言 ⇔ 実テスト citation の突合 (IMP-128、PLAN-REVERSE-41 塊B、FR-L1-18 descent)。
 *
 * l6-fr-coverage は FR→oracle ID の接続のみで、その oracle に対応する**実テストが tests/ に
 * 実在するか**を見ない (coverage≠substance の穴、[[feedback_coverage_not_substance]])。本 lint は
 * confirmed な test-design で宣言された U-* / IT-* oracle ID が tests/ 内に citation を持つことを検査する。
 * draft test-design は将来の検証設計であり、実テスト未着手を「実装済み oracle の欠落」と誤認しない。
 *
 * forward-citation 規律: NEW oracle は tests に ID 明記必須 (未 citation = fail-close)。既存の
 * 未 citation 89 件は baseline (known-debt、縮小のみ可)。素朴 ID マッチは「テスト実在・ID 未記載」
 * を false-positive にする (2026-06-10 実測 89 件) ため、既存を baseline 化し NEW のみ gate する。
 *
 * Issue #1669 / ORACLE-ID-REGISTRATION-001: 逆方向も hard gate する。
 * tests の it() にある ID が L6/L8 未登録なら fail-close。宣言に無い多重出現も fail-close。
 * 登録源は L8 eligible 表と L6/L8 の U-ID / ID / oracle 列だけ。本文の例示・監査・否定文の
 * token mention は登録にしない。L8 citation または PLAN verification_bindings が全 path を
 * 宣言する多重、fast/slow pair、freeze 伝播、doctor lane は衝突にしない。
 * 既存未登録・未宣言多重は明示 baseline（縮小のみ）。
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { parse as parseYaml } from "yaml";
import { PLAN_SPECIFIC_ORACLE_ID_PATTERN } from "../schema/frontmatter";
import {
  ORACLE_TEST_TRACE_BASELINE,
  ORACLE_UNDECLARED_MULTI_BASELINE,
  ORACLE_UNREGISTERED_BASELINE,
} from "./oracle-test-trace-baseline";
import {
  extractExecutableOracleCases,
  parseEligibleOracleTable,
} from "./plan-specific-vpair-binding";

export {
  ORACLE_TEST_TRACE_BASELINE,
  ORACLE_UNDECLARED_MULTI_BASELINE,
  ORACLE_UNREGISTERED_BASELINE,
};

/** oracle ID パターン (U-RELGRAPH-001 / IT-DOCEXPORT-003 等)。
 *  注 (review Minor): IT-* は現状宣言 0 件で baseline 未収載。将来 IT-* oracle を test-design に
 *  追加する場合、forward-citation 規律により tests に ID 明記が無いと即 fail する (意図通り = NEW gate)。 */
const ORACLE_ID = /\b(?:U|IT)-[A-Z0-9]+-[0-9]{3}\b/g;

export const ORACLE_FREEZE_PACKET_TEST_PATH = "tests/l3-g3-freeze-packet-v2.test.ts";
export const ORACLE_DOCTOR_LANE_TEST_PATHS: ReadonlySet<string> = new Set([
  "tests/doctor.test.ts",
  "tests/slow/doctor.test.ts",
]);

export interface OracleTestTraceInput {
  /** test-design doc で宣言された oracle ID。 */
  declared: string[];
  /** tests/ 内で citation された oracle ID。 */
  referenced: Set<string>;
  /** known-debt allowlist (既存未 citation)。 */
  baseline: ReadonlySet<string>;
  /** it() で宣言された ID → 出現 test path。未指定時は登録／多重検査を行わない。 */
  appearances?: ReadonlyMap<string, readonly string[]>;
  /** L6/L8 の正規登録構造（eligible 表と U-ID / ID / oracle 列）にある exact ID。 */
  registered?: ReadonlySet<string>;
  /** L8 citation と PLAN verification_bindings が宣言した path。 */
  declaredPaths?: ReadonlyMap<string, readonly string[]>;
  /** 未登録の既存 debt。縮小のみ可。 */
  unregisteredBaseline?: ReadonlySet<string>;
  /** 宣言に無い多重出現の既存 debt。縮小のみ可。 */
  undeclaredMultiBaseline?: ReadonlySet<string>;
}

export interface OracleTestTraceResult {
  orphans: string[];
  unregistered: string[];
  undeclaredMulti: string[];
  ok: boolean;
}

export function isFastSlowOraclePair(left: string, right: string): boolean {
  if (left === right) return false;
  const normalize = (path: string): string => path.replace(/^tests\/slow\//, "tests/");
  return (
    normalize(left) === normalize(right) && left.includes("/slow/") !== right.includes("/slow/")
  );
}

export function isExplainedOraclePath(
  path: string,
  allPaths: readonly string[],
  declared: ReadonlySet<string>,
): boolean {
  if (declared.has(path)) return true;
  if (ORACLE_DOCTOR_LANE_TEST_PATHS.has(path)) return true;
  const hasDoctorLane = allPaths.some((candidate) => ORACLE_DOCTOR_LANE_TEST_PATHS.has(candidate));
  const nonLane = allPaths.filter((candidate) => !ORACLE_DOCTOR_LANE_TEST_PATHS.has(candidate));
  if (hasDoctorLane && nonLane.length <= 1) return true;
  const featurePaths = nonLane.filter((candidate) => candidate !== ORACLE_FREEZE_PACKET_TEST_PATH);
  if (
    nonLane.includes(ORACLE_FREEZE_PACKET_TEST_PATH) &&
    featurePaths.length === 1 &&
    nonLane.includes(path)
  ) {
    return true;
  }
  return allPaths.some((other) => other !== path && isFastSlowOraclePair(path, other));
}

/** 宣言済だが未 citation かつ baseline 外の oracle を orphan として返す。 */
export function analyzeOracleTestTrace(input: OracleTestTraceInput): OracleTestTraceResult {
  const orphans = [...new Set(input.declared)]
    .filter((id) => !input.referenced.has(id) && !input.baseline.has(id))
    .sort();
  const appearances = input.appearances ?? new Map<string, readonly string[]>();
  const registered = input.registered ?? new Set<string>();
  const declaredPaths = input.declaredPaths ?? new Map<string, readonly string[]>();
  const unregisteredBaseline = input.unregisteredBaseline ?? new Set<string>();
  const undeclaredMultiBaseline = input.undeclaredMultiBaseline ?? new Set<string>();

  const unregistered = [...appearances.keys()]
    .filter((id) => !registered.has(id) && !unregisteredBaseline.has(id))
    .sort();

  const undeclaredMulti = [...appearances.entries()]
    .filter(([, paths]) => paths.length > 1)
    .filter(([id, paths]) => {
      if (undeclaredMultiBaseline.has(id)) return false;
      const declared = new Set(declaredPaths.get(id) ?? []);
      return !paths.every((path) => isExplainedOraclePath(path, paths, declared));
    })
    .map(([id]) => id)
    .sort();

  return {
    orphans,
    unregistered,
    undeclaredMulti,
    ok: orphans.length === 0 && unregistered.length === 0 && undeclaredMulti.length === 0,
  };
}

function collectIds(dir: string, ext: string, acc: Set<string>): void {
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return;
  }
  for (const e of entries) {
    const full = join(dir, e);
    if (statSync(full).isDirectory()) {
      collectIds(full, ext, acc);
    } else if (e.endsWith(ext)) {
      for (const m of readFileSync(full, "utf8").matchAll(ORACLE_ID)) acc.add(m[0]);
    }
  }
}

/** opening YAML frontmatter だけから status を得る。本文・code example は判定対象にしない。 */
function testDesignStatus(text: string): string | null {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) return null;
  try {
    const frontmatter = parseYaml(match[1]) as { status?: unknown } | null;
    return typeof frontmatter?.status === "string" ? frontmatter.status : null;
  } catch {
    return null;
  }
}

/** draft/archived は実装済みoracle traceの対象外。status欠落・未知値はfail-closeで収集する。 */
function isTraceableTestDesign(text: string): boolean {
  const status = testDesignStatus(text);
  return status !== "draft" && status !== "archived";
}

function collectDeclaredIds(dir: string, acc: Set<string>): void {
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return;
  }
  for (const e of entries) {
    const full = join(dir, e);
    if (statSync(full).isDirectory()) {
      collectDeclaredIds(full, acc);
    } else if (e.endsWith(".md")) {
      const text = readFileSync(full, "utf8");
      if (isTraceableTestDesign(text)) {
        for (const m of text.matchAll(ORACLE_ID)) acc.add(m[0]);
      }
    }
  }
}

function walkFiles(dir: string, predicate: (name: string) => boolean, acc: string[]): void {
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return;
  }
  for (const entry of entries) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walkFiles(full, predicate, acc);
    else if (predicate(entry)) acc.push(full);
  }
}

function splitMarkdownTableRow(line: string): string[] | null {
  const trimmed = line.trim();
  if (!trimmed.startsWith("|") || !trimmed.endsWith("|")) return null;
  return trimmed
    .slice(1, -1)
    .split("|")
    .map((cell) => cell.trim());
}

function normalizeHeaderCell(cell: string): string {
  return cell.replace(/[`*_]/g, "").replace(/\s+/g, " ").trim().toLowerCase();
}

function isOracleRegistrationColumn(cell: string): boolean {
  const normalized = normalizeHeaderCell(cell);
  return (
    normalized === "u-id" ||
    normalized === "id" ||
    normalized === "oracle" ||
    normalized === "oracle id"
  );
}

function exactRegisteredOracleId(cell: string): string | null {
  const stripped = cell.replace(/^[`*_]+|[`*_]+$/g, "").trim();
  return PLAN_SPECIFIC_ORACLE_ID_PATTERN.test(stripped) ? stripped : null;
}

/** L6/L8 の U-ID / ID / oracle 列だけから exact ID を取る。本文 token と範囲展開はしない。 */
function extractRegisteredIdsFromOracleIdColumns(markdown: string, acc: Set<string>): void {
  const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
  let fenced = false;
  let idColumnIndexes: number[] = [];
  for (const line of lines) {
    if (/^\s*(```|~~~)/.test(line)) {
      fenced = !fenced;
      idColumnIndexes = [];
      continue;
    }
    if (fenced) continue;
    const cells = splitMarkdownTableRow(line);
    if (!cells) {
      idColumnIndexes = [];
      continue;
    }
    if (cells.every((cell) => /^:?-{3,}:?$/.test(cell))) continue;
    if (cells.some((cell) => isOracleRegistrationColumn(cell))) {
      idColumnIndexes = cells
        .map((cell, index) => (isOracleRegistrationColumn(cell) ? index : -1))
        .filter((index) => index >= 0);
      continue;
    }
    for (const index of idColumnIndexes) {
      const id = exactRegisteredOracleId(cells[index] ?? "");
      if (id) acc.add(id);
    }
  }
}

function addDeclaredPaths(
  id: string,
  paths: readonly string[],
  acc: Map<string, Set<string>>,
): void {
  const current = acc.get(id) ?? new Set<string>();
  for (const path of paths) current.add(path);
  acc.set(id, current);
}

function collectPlanDeclaredPaths(dir: string, acc: Map<string, Set<string>>): void {
  const files: string[] = [];
  walkFiles(dir, (name) => name.endsWith(".md"), files);
  for (const full of files) {
    const text = readFileSync(full, "utf8");
    const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
    if (!match) continue;
    let frontmatter: {
      verification_bindings?: Array<{ oracle_id?: unknown; test_path?: unknown }>;
    };
    try {
      frontmatter = parseYaml(match[1]) as typeof frontmatter;
    } catch {
      continue;
    }
    for (const binding of frontmatter.verification_bindings ?? []) {
      if (typeof binding?.oracle_id !== "string" || typeof binding.test_path !== "string") continue;
      if (!PLAN_SPECIFIC_ORACLE_ID_PATTERN.test(binding.oracle_id)) continue;
      if (!binding.test_path.startsWith("tests/")) continue;
      addDeclaredPaths(binding.oracle_id, [binding.test_path], acc);
    }
  }
}

export function loadOracleTestTraceInput(repoRoot: string): OracleTestTraceInput {
  const declaredSet = new Set<string>();
  collectDeclaredIds(join(repoRoot, "docs", "test-design"), declaredSet);
  const referenced = new Set<string>();
  collectIds(join(repoRoot, "tests"), ".ts", referenced);

  const registered = new Set<string>();
  const designFiles: string[] = [];
  walkFiles(join(repoRoot, "docs", "design"), (name) => name.endsWith(".md"), designFiles);
  for (const full of designFiles) {
    extractRegisteredIdsFromOracleIdColumns(readFileSync(full, "utf8"), registered);
  }
  const testDesignFiles: string[] = [];
  walkFiles(join(repoRoot, "docs", "test-design"), (name) => name.endsWith(".md"), testDesignFiles);
  const declaredPathSets = new Map<string, Set<string>>();
  for (const full of testDesignFiles) {
    const text = readFileSync(full, "utf8");
    extractRegisteredIdsFromOracleIdColumns(text, registered);
    const { rows } = parseEligibleOracleTable(text);
    for (const row of rows) {
      registered.add(row.oracleId);
      addDeclaredPaths(row.oracleId, row.testPaths, declaredPathSets);
    }
  }
  collectPlanDeclaredPaths(join(repoRoot, "docs", "plans"), declaredPathSets);

  const appearances = new Map<string, string[]>();
  const testFiles: string[] = [];
  walkFiles(join(repoRoot, "tests"), (name) => name.endsWith(".ts"), testFiles);
  for (const full of testFiles) {
    const rel = relative(repoRoot, full).replaceAll("\\", "/");
    const counts = extractExecutableOracleCases(readFileSync(full, "utf8"), rel);
    for (const [id] of counts) {
      const paths = appearances.get(id) ?? [];
      if (!paths.includes(rel)) paths.push(rel);
      appearances.set(id, paths);
    }
  }

  const declaredPaths = new Map<string, readonly string[]>();
  for (const [id, paths] of declaredPathSets) declaredPaths.set(id, [...paths].sort());

  return {
    declared: [...declaredSet],
    referenced,
    baseline: ORACLE_TEST_TRACE_BASELINE,
    appearances,
    registered,
    declaredPaths,
    unregisteredBaseline: ORACLE_UNREGISTERED_BASELINE,
    undeclaredMultiBaseline: ORACLE_UNDECLARED_MULTI_BASELINE,
  };
}

export function oracleTestTraceMessages(r: OracleTestTraceResult): string[] {
  if (r.ok) {
    return [
      "oracle-test-trace — OK (宣言 oracle 全件 tests citation / baseline 被覆、NEW 未 citation 0)",
    ];
  }
  const messages: string[] = [];
  if (r.orphans.length > 0) {
    messages.push(
      `oracle-test-trace — ⚠ tests 未 citation の宣言 oracle ${r.orphans.length} 件 (baseline 外): ${r.orphans.join(", ")}`,
    );
  }
  if (r.unregistered.length > 0) {
    messages.push(
      `oracle-test-trace — ⚠ L6/L8 未登録の test oracle ${r.unregistered.length} 件 (baseline 外): ${r.unregistered.join(", ")}`,
    );
  }
  if (r.undeclaredMulti.length > 0) {
    messages.push(
      `oracle-test-trace — ⚠ 宣言に無い多重出現 ${r.undeclaredMulti.length} 件 (baseline 外): ${r.undeclaredMulti.join(", ")}`,
    );
  }
  return messages;
}

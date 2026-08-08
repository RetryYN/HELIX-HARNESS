/**
 * semantic contract 層 — ADR-010 境界の実 repo gate（PLAN-L7-527、Issue #230 slice5）。
 *
 * L6設計 docs/design/helix/L6-function-design/semantic-contract-revalidator.md §5 を正本とする。
 * pure 関数群が正しくても配線 drift（Python への DB 露出・別 writer の追加・IMMUTABLE 登録漏れ）で
 * 境界は崩れうるため、静的検査を独立 gate として持つ（SA-PSC-03 の実 gate 面）。
 *
 * 保証範囲: 本 gate は素朴な drift を捕捉する best-effort な静的検査であり、識別子の
 * スコープ解決を行わない。分割代入・object property・配列要素・エイリアシング経由で
 * table 名を運ぶ書き方は検出できない。決定的な保証は L9 の実 gate assertion に委ねる。
 */
import { type Dirent, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { HARNESS_DB_SEMANTIC_TABLES } from "../schema/harness-db-tables-semantic";

export type SemanticBoundaryRuleV1 = "python-exposure" | "single-writer" | "immutable-registration";

export interface SemanticBoundaryViolationV1 {
  rule: SemanticBoundaryRuleV1;
  path: string;
  detail: string;
}

export interface SemanticBoundarySourceV1 {
  path: string;
  text: string;
}

export interface SemanticBoundaryInputV1 {
  /** `src/semantic/**` の source（Python 非露出の検査対象）。 */
  semanticSources: readonly SemanticBoundarySourceV1[];
  /** semantic table への write を持ちうる source 全件（単一 writer の検査対象）。 */
  writerCandidates: readonly SemanticBoundarySourceV1[];
  semanticTableNames: readonly string[];
  immutableTableNames: readonly string[];
}

export interface SemanticBoundaryResultV1 {
  ok: boolean;
  violations: readonly SemanticBoundaryViolationV1[];
  semanticSourceCount: number;
}

/** semantic table への write authority を持つ唯一の module（L6 §3）。 */
export const SEMANTIC_SINGLE_WRITER_PATH = "src/semantic/semantic-commit-store.ts";

/** table 定義と本 gate 自身は semantic table 名を持つが write authority ではない。 */
const WRITER_SCAN_EXEMPT_PATHS: ReadonlySet<string> = new Set([
  "src/schema/harness-db-tables-semantic.ts",
  "src/lint/semantic-boundary.ts",
]);

// Python 意味コアへ渡してはならない資源（ADR-010 決定2）への到達痕跡。
const EXPOSURE_PATTERNS: readonly { id: string; pattern: RegExp }[] = [
  { id: "db-path", pattern: /defaultHarnessDbPath|harness\.db|openHarnessDb\s*\(/ },
  { id: "credential", pattern: /GITHUB_TOKEN|GH_TOKEN|process\.env\.[A-Z_]*(TOKEN|SECRET|KEY)/ },
  { id: "helix-state", pattern: /["'`]\.helix\// },
  // repository write（ADR-010 決定2 の repository 非受渡し面）: filesystem 書込・git 実行。
  {
    id: "repository-write",
    pattern:
      /\b(writeFileSync|appendFileSync|rmSync|unlinkSync|mkdirSync|renameSync|cpSync|createWriteStream)\s*\(|simple-git/,
  },
  // Python への env / 引数受渡し面: process 起動そのものを semantic 層に持たせない。
  {
    id: "process-spawn",
    pattern: /\b(spawn|spawnSync|execSync|execFile|execFileSync|fork)\s*\(|node:child_process/,
  },
];

const WRITE_STATEMENT =
  /\b(INSERT\s+INTO|UPDATE|DELETE\s+FROM)\s+([a-z_]*semantic_result_[a-z_]*)/i;
// 動的テーブル名（テンプレートリテラル・文字列連結・ORM 風呼び出し）でのバイパスを塞ぐ多段検査:
// semantic table を指す識別子・文字列が現れる source に write 動詞が同居していれば違反とする。
const SEMANTIC_TABLE_REFERENCE = /semantic_result_[a-z_]*/i;
// 識別子追跡の枝で使う SQL 文脈限定の write 動詞（`.run(` 等の汎用メソッドを含めると
// 同名変数の偶発一致で誤検出するため、SQL キーワードだけに絞る）。
const SQL_WRITE_KEYWORD = /(\bINSERT\s+INTO|\bUPDATE\s|\bDELETE\s+FROM)/i;
// 先頭に \b を置くと `).insert(` のような非単語境界で取りこぼすため、単語系の枝だけに境界を付ける。
const WRITE_VERB =
  /(\bINSERT\s+INTO|\bUPDATE\s|\bDELETE\s+FROM|\.insert\s*\(|\.update\s*\(|\.delete\s*\(|\.upsert\s*\(|\.exec\s*\(|\.run\s*\()/i;

/**
 * 文字列リテラルを保持したままコメントだけを除去する簡易 tokenizer。
 * 行ベースの正規表現だと文字列中の `//`（URL 以外も含む）を境界と誤認し、同一行の
 * 後続コードごと削って検出漏れ（false negative）を生むため、リテラル区間を跨がない
 * 走査で除去する。文字列の中身は空白へ潰さず残す（違反痕跡はコード扱いのまま保つ）。
 */
export function stripComments(text: string): string {
  let out = "";
  let index = 0;
  let quote: string | null = null;
  while (index < text.length) {
    const char = text[index] as string;
    const next = text[index + 1];
    if (quote !== null) {
      out += char;
      if (char === "\\") {
        out += text[index + 1] ?? "";
        index += 2;
        continue;
      }
      if (char === quote) quote = null;
      index += 1;
      continue;
    }
    if (char === '"' || char === "'" || char === "`") {
      quote = char;
      out += char;
      index += 1;
      continue;
    }
    if (char === "/" && next === "/") {
      while (index < text.length && text[index] !== "\n") index += 1;
      out += " ";
      continue;
    }
    if (char === "/" && next === "*") {
      index += 2;
      while (index < text.length && !(text[index] === "*" && text[index + 1] === "/")) index += 1;
      index += 2;
      out += " ";
      continue;
    }
    out += char;
    index += 1;
  }
  return out;
}

function listFiles(root: string, dir: string): string[] {
  const out: string[] = [];
  let entries: Dirent[];
  try {
    entries = readdirSync(join(root, dir), { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    const child = `${dir}/${entry.name}`;
    if (entry.isDirectory()) {
      out.push(...listFiles(root, child));
      continue;
    }
    if (entry.name.endsWith(".ts")) out.push(child);
  }
  return out;
}

/** 実 repo から検査入力を読む（doctor / regression fence 用）。 */
export function loadSemanticBoundaryInputs(repoRoot: string): SemanticBoundaryInputV1 {
  const read = (path: string): SemanticBoundarySourceV1 => ({
    path,
    text: readFileSync(join(repoRoot, path), "utf8"),
  });
  const semanticPaths = listFiles(repoRoot, "src/semantic");
  // writer 候補は src/ 配下の全 TypeScript source（単一 writer 契約の全体検査）。
  const writerPaths = listFiles(repoRoot, "src");
  const projectionWriter = readFileSync(
    join(repoRoot, "src", "state-db", "projection-writer.ts"),
    "utf8",
  );
  const immutableBlock = /IMMUTABLE_RECEIPT_TABLES\s*=\s*new Set\(\[([\s\S]*?)\]\)/.exec(
    projectionWriter,
  );
  const immutableTableNames = [...(immutableBlock?.[1] ?? "").matchAll(/"([a-z_]+)"/g)].map(
    (match) => match[1] as string,
  );
  return {
    semanticSources: semanticPaths.map(read),
    writerCandidates: writerPaths.map(read),
    semanticTableNames: HARNESS_DB_SEMANTIC_TABLES.map((table) => table.name),
    immutableTableNames,
  };
}

/** `const table = "semantic_result_x"` 形式で semantic table 名を束縛した識別子を集める。 */
function collectTableBoundIdentifiers(code: string): string[] {
  const pattern =
    /(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*(?::[^=]+)?=\s*["'`][^"'`]*semantic_result_[a-z_]*/g;
  return [...code.matchAll(pattern)].map((match) => match[1] as string);
}

/**
 * 動的 SQL / ORM 経由の write を距離非依存で捕捉する。
 * - 同一行に semantic table 参照と write 動詞が同居する（ORM 風・1 行テンプレート）
 * - semantic table 名を束縛した識別子が write 動詞と同居する（宣言と使用が何行離れていてもよい）
 * table 名を列挙するだけの登録簿は識別子束縛も同一行同居も持たないため誤検出しない。
 */
function hasDynamicWriteReference(code: string): boolean {
  const lines = code.split("\n");
  for (const line of lines) {
    if (SEMANTIC_TABLE_REFERENCE.test(line) && WRITE_VERB.test(line)) return true;
  }
  const identifiers = collectTableBoundIdentifiers(code);
  if (identifiers.length === 0) return false;
  for (const line of lines) {
    // 識別子追跡はスコープを解決しないため、SQL キーワードを伴う行に限定して
    // 同名変数の偶発一致による誤検出（CI の false alarm）を避ける。
    if (!SQL_WRITE_KEYWORD.test(line)) continue;
    for (const identifier of identifiers) {
      if (new RegExp(`\\b${identifier}\\b`).test(line)) return true;
    }
  }
  return false;
}

/** U-PSC-006: ADR-010 境界の 3 不変条件を検査し、違反を種別ごとに全列挙する。 */
export function analyzeSemanticBoundary(input: SemanticBoundaryInputV1): SemanticBoundaryResultV1 {
  const violations: SemanticBoundaryViolationV1[] = [];

  // (1) Python 非露出: src/semantic は DB path / credential / .helix/ へ到達しない。
  //     transaction consumer だけは Node 側 store として HarnessDb 型を受け取るため、
  //     「DB を開く／path を解決する」痕跡のみを違反とする（型 import は対象外）。
  for (const source of input.semanticSources) {
    const code = stripComments(source.text);
    for (const { id, pattern } of EXPOSURE_PATTERNS) {
      if (pattern.test(code)) {
        violations.push({
          rule: "python-exposure",
          path: source.path,
          detail: `semantic layer must not reach ${id}`,
        });
      }
    }
  }

  // (2) 単一 writer: semantic_result_* への write は commit store だけが持つ。
  //     リテラル SQL だけでなく、テーブル名を変数化した動的 SQL / ORM 風呼び出しも
  //     「semantic table への言及 + write 動詞の同居」で捕捉する（バイパス遮断）。
  for (const source of input.writerCandidates) {
    if (source.path === SEMANTIC_SINGLE_WRITER_PATH) continue;
    if (WRITER_SCAN_EXEMPT_PATHS.has(source.path)) continue;
    const code = stripComments(source.text);
    const literal = WRITE_STATEMENT.exec(code);
    if (literal !== null) {
      violations.push({
        rule: "single-writer",
        path: source.path,
        detail: `unexpected write to ${literal[2]} outside ${SEMANTIC_SINGLE_WRITER_PATH}`,
      });
      continue;
    }
    if (hasDynamicWriteReference(code)) {
      violations.push({
        rule: "single-writer",
        path: source.path,
        detail: `semantic table reference with write verb outside ${SEMANTIC_SINGLE_WRITER_PATH}`,
      });
    }
  }

  // (3) rebuild 保持: semantic table は全件が IMMUTABLE_RECEIPT_TABLES に登録済み。
  const immutable = new Set(input.immutableTableNames);
  for (const table of input.semanticTableNames) {
    if (!immutable.has(table)) {
      violations.push({
        rule: "immutable-registration",
        path: "src/state-db/projection-writer.ts",
        detail: `${table} is not registered in IMMUTABLE_RECEIPT_TABLES`,
      });
    }
  }

  return {
    ok: violations.length === 0,
    violations,
    semanticSourceCount: input.semanticSources.length,
  };
}

export function semanticBoundaryMessages(result: SemanticBoundaryResultV1): string[] {
  if (result.ok) {
    return [
      `semantic-boundary - OK (semantic sources=${result.semanticSourceCount}; static 3-invariant subset of SA-PSC-03. drift / browser evidence / dynamic DB detection は L9)`,
    ];
  }
  return [
    `semantic-boundary - violation: ${result.violations.length} 件`,
    ...result.violations.map(
      (violation) =>
        `semantic-boundary - ${violation.rule}: ${violation.path} — ${violation.detail}`,
    ),
  ];
}

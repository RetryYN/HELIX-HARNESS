/**
 * task-lens (PLAN-L7-338)。
 *
 * 委譲 task 本文から「思考レンズ」(設計 / 検証 / テスト戦略 / トラブルシューティング) を
 * 決定論的 keyword 判定で検出し、レンズ別の思考チェックリスト (judgment-core の観点を
 * 領域へ先鋭化した distillation + 詳細 skill pack への pointer) を委譲 prompt へ機械注入する。
 * role-judgment (役割規律) が「どう振る舞うか」を与えるのに対し、task-lens は
 * 「何を考えるべきか」(観点の網羅) を与える。PLAN 経由でない freehand 委譲でも
 * skill pack への導線が途切れないようにする。
 * runtime module 内で閉じる (他 module への import なし、循環依存を作らない)。
 */

export type TaskLens = "design" | "verification" | "test-strategy" | "troubleshooting";

export const TASK_LENS_HEADER = "## HELIX 思考レンズ (task-lens)";

/**
 * レンズ別 keyword (小文字比較)。
 * - 日本語: includes 判定。ただしカタカナ語 (テスト / バグ / エラー / デバッグ) は前後が
 *   カタカナだと別語の部分列 (コン「テスト」/「バグ」ダッド) なので語境界を近似検査する。
 * - 英語: 語境界 regex + 一様な屈折 suffix (s/es/ed/ing)。suffix で覆えない形
 *   (debugging の子音重複、verify の y 変化) は明示形で列挙する。
 */
const LENS_KEYWORDS: Record<TaskLens, { ja: readonly string[]; en: readonly string[] }> = {
  design: {
    ja: ["設計", "アーキテクチャ", "分割", "モデリング", "構成"],
    en: ["design", "architecture", "schema", "interface", "refactor"],
  },
  verification: {
    ja: ["検証", "受入", "妥当性", "証跡"],
    en: [
      "verify",
      "verifies",
      "verified",
      "verifying",
      "verification",
      "acceptance",
      "evidence",
      "validate",
      "validated",
      "validating",
      "validation",
    ],
  },
  "test-strategy": {
    // カタカナ境界検査で棄却される正当複合語 (ユニットテスト等) は明示形で列挙する。
    ja: ["テスト", "ユニットテスト", "リグレッションテスト", "カバレッジ", "回帰"],
    en: ["test", "coverage", "regression", "oracle", "tdd"],
  },
  troubleshooting: {
    ja: ["バグ", "修正", "エラー", "障害", "調査", "デバッグ", "原因", "再現", "不具合"],
    en: [
      "bug",
      "fix",
      "error",
      "debug",
      "debugging",
      "debugged",
      "troubleshoot",
      "incident",
      "flaky",
      "crash",
    ],
  },
};

const KATAKANA_RE = /[゠-ヿ]/;

/**
 * 日本語 keyword の match 判定。カタカナ語は前後どちらかがカタカナなら別語の部分列と
 * みなして棄却する (コンテスト→テスト / バグダッド→バグ の誤爆抑制)。漢字語は includes のまま。
 */
function matchesJapaneseKeyword(text: string, keyword: string): boolean {
  if (!KATAKANA_RE.test(keyword)) return text.includes(keyword);
  let from = 0;
  while (true) {
    const index = text.indexOf(keyword, from);
    if (index < 0) return false;
    const before = index > 0 ? text[index - 1] : "";
    const after = index + keyword.length < text.length ? text[index + keyword.length] : "";
    if (!KATAKANA_RE.test(before) && !KATAKANA_RE.test(after)) return true;
    from = index + 1;
  }
}

/** regex 特殊文字を escape する (keyword 追加時の latent bug 防止)。 */
function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** 英語 keyword の語境界 regex (一様屈折 suffix 付き)。module load 時に構築して使い回す。 */
function englishPattern(keyword: string): RegExp {
  return new RegExp(`\\b${escapeRegex(keyword)}(?:s|es|ed|ing)?\\b`, "i");
}

const EN_PATTERNS: Record<TaskLens, readonly RegExp[]> = {
  design: LENS_KEYWORDS.design.en.map(englishPattern),
  verification: LENS_KEYWORDS.verification.en.map(englishPattern),
  "test-strategy": LENS_KEYWORDS["test-strategy"].en.map(englishPattern),
  troubleshooting: LENS_KEYWORDS.troubleshooting.en.map(englishPattern),
};

const LENS_LINES: Record<TaskLens, readonly string[]> = {
  design: [
    "### 設計レンズ",
    "- 着手前に既存資産を inventory し、再利用可否を先に判定する (重複実装を新規に起こさない)。",
    "- 採用案には対案 1 つ以上とトレードオフ比較。境界 (module / データ / 権限) と blast radius を明示する。",
    "- 新規成果物は上流設計 / PLAN generates へ trace させる (descent obligation)。",
    "- 詳細: docs/skills/design-doc.md / docs/skills/api-and-interface-design.md",
  ],
  verification: [
    "### 検証レンズ",
    "- 受入条件は falsifiable に書く (検証 command を書けない AC は AC ではない)。",
    "- oracle 強度: 弱い oracle (toBeTruthy 等) を「検証済み」と数えない。real behavior を assert する。",
    "- 主張と実測を分離する: green の実測 (exit code / output) だけを完了根拠にする。",
    "- 詳細: docs/skills/verification.md",
  ],
  "test-strategy": [
    "### テスト戦略レンズ",
    "- test-first (Red→Green→Refactor)。failing test を先に書き、正しい理由で失敗することを確認する。",
    "- 正常系 / 異常系 / 境界値±1 / 回帰の 4 分類で漏れを見る。unit を厚く、e2e は薄く。",
    "- 変更前に regression fence (既存挙動の test net) を確認し、薄ければ characterization test を先に足す。",
    "- 詳細: docs/skills/test-driven-development.md / docs/skills/testing.md",
  ],
  troubleshooting: [
    "### トラブルシューティングレンズ",
    "- 再現 → 最小化 → 二分切り分け → 根本原因 → 再発防止 test → 上流是正の順。対症 patch で閉じない。",
    "- 測定値が動いたら「自分が動く面を測っていないか」(環境 / 並行変更 / stale state) を先に疑う。",
    "- 修正は根本原因への最小差分 + 再発防止 test を対で出す。同一問題 3 回失敗で escalate。",
    "- 詳細: docs/skills/debugging-and-error-recovery.md / docs/skills/error-fix.md",
  ],
};

const LENS_ORDER: readonly TaskLens[] = [
  "design",
  "verification",
  "test-strategy",
  "troubleshooting",
];

/** task 本文から該当レンズを検出する (複数可、LENS_ORDER 順)。無 match は空配列。 */
export function detectTaskLenses(task: string | null | undefined): TaskLens[] {
  const text = (task ?? "").toLowerCase();
  if (!text.trim()) return [];
  return LENS_ORDER.filter((lens) => {
    const { ja } = LENS_KEYWORDS[lens];
    if (ja.some((keyword) => matchesJapaneseKeyword(text, keyword.toLowerCase()))) return true;
    return EN_PATTERNS[lens].some((pattern) => pattern.test(text));
  });
}

/**
 * 検出レンズの思考チェックリストを返す。無 match は空文字列 (注入しない)。
 * role-judgment と違い「常時注入」にしないのは、レンズは task 領域固有の観点であり、
 * 無関係なレンズを常に積むと context を浪費して S/N が下がるため (judgment-core §7 の
 * 「差分は 5 行以内」と同じ context 節約原則)。
 */
export function taskLensBrief(task: string | null | undefined): string {
  const lenses = detectTaskLenses(task);
  if (lenses.length === 0) return "";
  const lines: string[] = [TASK_LENS_HEADER];
  for (const lens of lenses) {
    lines.push(...LENS_LINES[lens]);
  }
  return lines.join("\n");
}

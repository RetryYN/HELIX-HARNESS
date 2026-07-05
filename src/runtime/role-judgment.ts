/**
 * role-judgment (PLAN-L7-337)。
 *
 * `helix codex --role` / `helix claude --role` の委譲 prompt に、role archetype に応じた
 * 判断ブリーフ (judgment-core の役割別差分) を機械注入する純関数群。従来、Codex 側委譲には
 * `.claude/agents/*.md` に相当する role 別判断基準の正本が構造的に欠落しており、判断規律は
 * 呼び出し側が --task へ都度手書きするしかなかった (PLAN-L7-335 棚卸しで確認した非対称)。
 * 本 module は tier-router の ROLE_ARCHETYPE / review-guard の role alias と同じ語彙で
 * archetype を解決し、adapter が全委譲 prompt へ同一ブリーフを載せることを保証する。
 */

export type RoleArchetype = "consult" | "verify" | "worker";
type RuntimeRouterRole = "tl" | "qa" | "uiux" | "se" | "docs";

const RUNTIME_ROLE_ARCHETYPE: Record<RuntimeRouterRole, RoleArchetype> = {
  tl: "consult",
  uiux: "consult",
  qa: "verify",
  se: "worker",
  docs: "worker",
};

/** review 系 alias → verify (review-guard READ_ONLY_DELEGATION_ROLES と同じ語彙)。 */
const VERIFY_ALIASES: ReadonlySet<string> = new Set([
  "reviewer",
  "review",
  "security",
  "audit",
  "code-review",
  "code-reviewer",
]);

/** 相談系 alias → consult。 */
const CONSULT_ALIASES: ReadonlySet<string> = new Set(["tl-advisor", "advisor"]);

/** role 文字列を archetype へ解決する (trim + lowercase)。未知 role は null (generic ブリーフ)。 */
export function roleArchetypeFor(role: string | null | undefined): RoleArchetype | null {
  const normalized = (role ?? "").trim().toLowerCase();
  if (!normalized) return null;
  if (normalized in RUNTIME_ROLE_ARCHETYPE) {
    return RUNTIME_ROLE_ARCHETYPE[normalized as RuntimeRouterRole];
  }
  if (VERIFY_ALIASES.has(normalized)) return "verify";
  if (CONSULT_ALIASES.has(normalized)) return "consult";
  return null;
}

export const ROLE_JUDGMENT_HEADER = "## HELIX 判断ブリーフ (judgment-core v1)";

const COMMON_LINES: readonly string[] = [
  "判断規律の正本: docs/skills/judgment-core.md (普遍 7 原則。evidence 無き断定をしない、",
  "不可逆・高影響操作 = auth / payments / PII / production / 外部 API 前提 等は自己判断せず escalate)。",
];

const ARCHETYPE_LINES: Record<RoleArchetype, readonly string[]> = {
  worker: [
    "- 完了報告は green な test / command の実測で裏付ける (実装した事実は完了根拠にならない)。",
    "- 要求に無い抽象化・拡張・防御コードを足さない (スコープ規律)。",
    "- 与えられた task boundary の外は推測で埋めず、根拠を添えて呼び出し側へ返す。",
  ],
  verify: [
    "- adversarial framing: 出発点は「この成果物は誤っている」。動いていても spec / AC 違反なら拒否する。",
    "- false positive 抑制: correctness / 要件に影響する所見のみ blocker。style・好みは suggestion 止まり。",
    "- severity-first: bug → risk → behavior regression → missing tests の順で出力する。",
    "- 所見には file:line の evidence を付け、確信の無い指摘は推測と明記する。",
  ],
  consult: [
    "- 出力契約: 結論 / 根拠 / 残リスク / 次の一手 の 4 点で返す。",
    "- 採用案には最低 1 つの対案とトレードオフ比較を付ける。",
    "- 助言のみを返す (実装・編集はしない)。",
  ],
};

/**
 * role に応じた判断ブリーフ本文を返す。未知 role でも共通規律 (正本参照 + escalation 境界) は
 * 必ず載せる (ブリーフ無し委譲を作らない)。
 */
export function roleJudgmentBrief(role: string | null | undefined): string {
  const archetype = roleArchetypeFor(role);
  const lines: string[] = [ROLE_JUDGMENT_HEADER, ...COMMON_LINES];
  if (archetype) {
    lines.push(`role archetype: ${archetype}`);
    lines.push(...ARCHETYPE_LINES[archetype]);
  } else {
    lines.push("- role 固有ブリーフ未定義。上記の普遍 7 原則に従い、判断は evidence で裏付ける。");
  }
  return lines.join("\n");
}

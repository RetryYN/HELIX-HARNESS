import type { ReasoningEffort } from "../schema/team";

/**
 * effort ladder (low→medium→high)。適応の 1 段上げ/下げに使う内部順序。
 * model-policy の REASONING_EFFORTS と同値だが、model-policy → model-effort の一方向依存
 * (selectTeamModel が本 module を使う) を保つため、循環を避けてここに閉じる。
 */
const EFFORT_LADDER: readonly ReasoningEffort[] = ["low", "medium", "high"];

/**
 * モデル別「標準 reasoning effort」と適応調整ルール (PLAN-L7-310)。
 *
 * PO ルール (2026-07-04): モデル世代で effort の置き方が違う (例: claude-sonnet-5 の標準は
 * `medium`、旧 claude-sonnet-4-6 とは異なる)。したがって:
 *   1. 各モデルの**標準 effort** を SSoT として持ち、既定はそれで投げる。
 *   2. 回答が**浅い** (shallow) なら effort を上げる。
 *   3. 思考時間が**長すぎる** (too slow) なら effort を下げる。
 *
 * 本 module は (1) の registry と (2)(3) の純粋な適応関数を提供する。実際の shallow / too-slow
 * 判定は呼び出し側 (runtime 観測) が渡す。ここは「観測 → 次の effort」の決定論的ルールに限定する。
 */

/**
 * family 単位の標準 effort。model id は family へ正規化して解決する
 * (`normalizeEffortFamily`)。世代サフィックス (例 -4-6 / -5 / 日付) は family に影響しない前提だが、
 * 世代で標準が変わるものは EXACT_MODEL_STANDARD_EFFORT で上書きする。
 */
export const FAMILY_STANDARD_EFFORT: Record<string, ReasoningEffort> = {
  fable: "high", // 最上位 advisor: 深い判断が既定
  opus: "high", // lead / 設計: 深い推論が既定
  sonnet: "medium", // worker: PO 指定の標準 (claude-sonnet-5 = medium)
  haiku: "low", // 軽量 / 高速: 浅く速いが既定
  frontier: "high", // gpt-5.5 (T0 相談・検証)
  worker: "medium", // gpt-5.4 (T1 専門 worker)
  spark: "low", // gpt-5.3-codex-spark (T2 軽量)
};

/**
 * 世代で標準 effort が変わる具体 model の上書き。PO ルールの起点:
 * claude-sonnet-5 は medium (family 既定と一致するが、4-6 との差異を明示するため列挙)。
 * 旧世代 claude-sonnet-4-6 は effort の置き方が異なり、既定を high として扱っていた。
 */
export const EXACT_MODEL_STANDARD_EFFORT: Record<string, ReasoningEffort> = {
  "claude-sonnet-5": "medium",
  "claude-sonnet-4-6": "high",
  "gpt-5.5": "high",
  "gpt-5.4": "medium",
};

/** model id / family 名から effort family を正規化する (曖昧・未知は null)。 */
export function normalizeEffortFamily(model: string | null | undefined): string | null {
  if (!model) return null;
  const value = model.toLowerCase();
  const families = Object.keys(FAMILY_STANDARD_EFFORT).filter((family) =>
    new RegExp(`\\b${family}\\b`).test(value),
  );
  return families.length === 1 ? families[0] : null;
}

/**
 * model の標準 effort を返す。exact 上書き → family 既定 → fallback "medium" の順で解決する。
 * (未知 model は安全側の medium にする。high で無駄に thinking を焚かず、low で浅くもしない。)
 */
export function standardEffortForModel(model: string | null | undefined): ReasoningEffort {
  if (model && model in EXACT_MODEL_STANDARD_EFFORT) {
    return EXACT_MODEL_STANDARD_EFFORT[model];
  }
  const family = normalizeEffortFamily(model);
  if (family) return FAMILY_STANDARD_EFFORT[family];
  return "medium";
}

export interface EffortObservation {
  /** 回答が浅い (根拠不足 / 表層的 / 見落とし) と観測された。 */
  shallow?: boolean;
  /** 思考時間が長すぎる (割に見合わない) と観測された。 */
  tooSlow?: boolean;
}

function raise(effort: ReasoningEffort): ReasoningEffort {
  const idx = EFFORT_LADDER.indexOf(effort);
  return EFFORT_LADDER[Math.min(idx + 1, EFFORT_LADDER.length - 1)];
}

function lower(effort: ReasoningEffort): ReasoningEffort {
  const idx = EFFORT_LADDER.indexOf(effort);
  return EFFORT_LADDER[Math.max(idx - 1, 0)];
}

/**
 * 観測に基づく適応調整 (PO ルール):
 *   - shallow のみ → 一段上げる (low→medium→high、high は据え置き)。
 *   - too slow のみ → 一段下げる (high→medium→low、low は据え置き)。
 *   - 両方 or どちらも無し → 現状維持 (矛盾/無信号は動かさない、安全側)。
 * 既定 (観測なし) は標準 effort をそのまま使うことを呼び出し側が保証する。
 */
export function adaptReasoningEffort(
  current: ReasoningEffort,
  observation: EffortObservation,
): ReasoningEffort {
  const shallow = observation.shallow === true;
  const tooSlow = observation.tooSlow === true;
  if (shallow === tooSlow) return current; // 両立 or 無信号 = 動かさない
  return shallow ? raise(current) : lower(current);
}

/**
 * model の標準 effort を起点に観測を 1 段適応させたものを返す (registry + rule の合成)。
 * runtime は「まず standard で投げ、shallow/too-slow を観測したら次ターンでこの結果を使う」。
 */
export function resolveAdaptiveEffort(
  model: string | null | undefined,
  observation: EffortObservation = {},
): ReasoningEffort {
  return adaptReasoningEffort(standardEffortForModel(model), observation);
}

import { EXACT_MODEL_STANDARD_EFFORT, FAMILY_STANDARD_EFFORT } from "../schema/model-registry";
import type { ReasoningEffort } from "../schema/team";

/**
 * effort ladder (low→medium→high→xhigh)。適応の下降と、明示された xhigh の保持に使う内部順序。
 * model-policy の REASONING_EFFORTS と同値だが、model-policy → model-effort の一方向依存
 * (selectTeamModel が本 module を使う) を保つため、循環を避けてここに閉じる。
 */
const EFFORT_LADDER: readonly ReasoningEffort[] = ["low", "medium", "high", "xhigh"];

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
 * family 単位 / 具体 model の標準 effort は `src/schema/model-registry.ts` へ外部化した (PLAN-L7-464)。
 * `FAMILY_STANDARD_EFFORT` は family 既定 (opus/sonnet=medium、fable/frontier=high、haiku/spark=low、
 * worker=xhigh)、`EXACT_MODEL_STANDARD_EFFORT` は世代で標準が変わる具体 model の上書き
 * (claude-sonnet-5=medium・sonnet-4-6=high、gpt-5.6/5.5/5.4 帯)。model id は family へ正規化して
 * 解決し (`normalizeEffortFamily`)、exact 上書き → family 既定 → medium fallback の順で解く。値は
 * `src/schema/model-registry.ts` が schema 検証 (fail-closed) して供給する。モデル更新や effort 帯の
 * 是正は同 config の該当セクションを編集する (コード変更不要)。
 */
export { EXACT_MODEL_STANDARD_EFFORT, FAMILY_STANDARD_EFFORT };

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

/**
 * effort の上限を適用する (Issue #881)。
 *
 * effort の authority は **model の標準 effort** (`standardEffortForModel`) であり、lane tier は
 * その上限としてのみ働く。tier だけで effort を決めると、lane に載る model と effort が束縛されず、
 * 既定 model が変わったときに乖離が検出されないまま通過する。
 */
export function capEffort(effort: ReasoningEffort, ceiling: ReasoningEffort): ReasoningEffort {
  return EFFORT_LADDER.indexOf(effort) <= EFFORT_LADDER.indexOf(ceiling) ? effort : ceiling;
}

export interface EffortObservation {
  /** 回答が浅い (根拠不足 / 表層的 / 見落とし) と観測された。 */
  shallow?: boolean;
  /** 思考時間が長すぎる (割に見合わない) と観測された。 */
  tooSlow?: boolean;
}

function raise(effort: ReasoningEffort): ReasoningEffort {
  // xhigh は requirements-owned policy が Luna native workerへ明示導出する値であり、
  // generic な shallow signalだけで既存 high modelをxhighへ昇格させない。
  if (effort === "high" || effort === "xhigh") return effort;
  const idx = EFFORT_LADDER.indexOf(effort);
  return EFFORT_LADDER[Math.min(idx + 1, EFFORT_LADDER.length - 1)];
}

function lower(effort: ReasoningEffort): ReasoningEffort {
  const idx = EFFORT_LADDER.indexOf(effort);
  return EFFORT_LADDER[Math.max(idx - 1, 0)];
}

/**
 * 観測に基づく適応調整 (PO ルール):
 *   - shallow のみ → 一段上げる (low→medium→high、high／xhigh は据え置き)。
 *   - too slow のみ → 一段下げる (xhigh→high→medium→low、low は据え置き)。
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

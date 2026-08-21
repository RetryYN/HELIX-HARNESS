import type { ReasoningEffort } from "./team";

/**
 * Model registry — モデル ID / 単価 / 標準 effort の **TypeScript consumer 側の唯一の正本** (SSoT、PLAN-L7-464)。
 *
 * model-policy / model-effort / token-tracker / tier-router に散在していた 5 テーブルを本 module 1 箇所へ
 * 集約した。**TypeScript consumer (model-policy / model-effort / token-tracker / tier-router と
 * その利用 test) の更新はこの `RAW_MODEL_REGISTRY` 1 ブロックの編集で完結**する (再 export のため
 * consumer / test の import は不変、散在 literal を編集して回らない)。
 * ただし `.claude/agents/*.md` frontmatter の `model:` は本 registry から**導出されない静的 projection**であり、
 * model ID 更新時は手動同期が必要である (`src/lint/agent-model-ssot.ts` が MODEL_IDS との drift を fail-close
 * で強制)。agent manifest を registry から自動導出する generator は別原子的 PLAN/PR で扱う (本 module の scope 外)。
 * 配置が `src/schema/` なのは、roster を使う team と単価を使う state-db の両 owner が module-boundary
 * policy 上 import できる共通の foundational layer だからである (state-db→team は deny のため team には
 * 置けない)。データは JSON ではなく TS const として持つ: `src/` 配下は runtime-portability policy で
 * 非 TS ファイルを禁じており、かつ esbuild single-bundle では外部 JSON の runtime path 解決が壊れるため、
 * TS const が唯一 portable で bundler-safe な externalization である。
 *
 * Node transactional boundary の原則に従い、raw data は**必ず `parseModelRegistry` が schema 検証**し、
 * 破損・型不整合 (effort enum 外 / 非数値単価 / 空 section 等) は fail-closed で throw する。
 * Python は本 registry を読まない (純 Node 消費、ADR-009/010 の cross-runtime 対象外)。
 */
const RAW_MODEL_REGISTRY = {
  modelIds: {
    claude: {
      opus: "claude-opus-5",
      sonnet: "claude-sonnet-5",
      haiku: "claude-haiku-4-5",
      fable: "claude-fable-5",
    },
    codex: {
      frontier: "gpt-5.6-sol",
      worker: "gpt-5.6-luna",
      spark: "gpt-5.3-codex-spark",
      mini: "gpt-5.4-mini",
      codex: "gpt-5.3-codex",
    },
  },
  // Claude モデル単価 ($/1M tokens) の **standard / list-price offline fallback**。
  // 出典 = Anthropic 公式 pricing (claude-api skill Current Models 表、2026-07-25 時点の standard price)。
  // ここで持つ costUsd は list price 由来であり **実請求 exact 値ではない**: 期間限定 promo / intro
  // (例: claude-sonnet-5 は 2026-08-31 まで intro $2/$10、以後 standard $3/$15) は **非モデル化**で、
  // 本表は standard $3/$15 を保持する。effective-date pricing (期間で変わる単価) の実装は別 Issue/原子的
  // PLAN へ carry する。opus 帯は世代据え置きで $5/$25 (claude-opus-5 = 4-8/4-7/4-6 と同額。
  // 歴史 usage 計算のため旧 id も残置)。
  claudePricing: {
    "claude-fable-5": { input: 10, output: 50 },
    "claude-opus-5": { input: 5, output: 25 },
    "claude-opus-4-8": { input: 5, output: 25 },
    "claude-opus-4-7": { input: 5, output: 25 },
    "claude-opus-4-6": { input: 5, output: 25 },
    "claude-sonnet-5": { input: 3, output: 15 },
    "claude-sonnet-4-6": { input: 3, output: 15 },
    "claude-haiku-4-5": { input: 1, output: 5 },
  },
  // OpenAI (Codex) モデル単価。正本 = OpenAI 公式 API pricing。cached=null は caching 非対応 (pro)。
  // 未掲載モデルは表に入れない = cost null (捏造禁止)。
  openaiPricing: {
    "gpt-5.6-sol": { input: 5, cached: 0.5, output: 30 },
    "gpt-5.6-terra": { input: 2.5, cached: 0.25, output: 15 },
    "gpt-5.6-luna": { input: 0.2, cached: 0.02, output: 1.2 },
    "gpt-5.5": { input: 5, cached: 0.5, output: 30 },
    "gpt-5.5-pro": { input: 30, cached: null, output: 180 },
    "gpt-5.4": { input: 2.5, cached: 0.25, output: 15 },
    "gpt-5.4-mini": { input: 0.75, cached: 0.075, output: 4.5 },
    "gpt-5.4-nano": { input: 0.2, cached: 0.02, output: 1.25 },
    "gpt-5.4-pro": { input: 30, cached: null, output: 180 },
    "gpt-5.3-codex": { input: 1.75, cached: 0.175, output: 14 },
  },
  // family 既定の標準 reasoning effort。opus は 2026-07-25 に high→medium 是正 (sonnet と同帯)。
  familyStandardEffort: {
    fable: "high",
    opus: "medium",
    sonnet: "medium",
    haiku: "low",
    frontier: "high",
    worker: "xhigh",
    spark: "low",
  },
  // 世代で標準が変わる具体 model の上書き。
  exactModelStandardEffort: {
    "claude-sonnet-5": "medium",
    "claude-sonnet-4-6": "high",
    "gpt-5.6-sol": "high",
    "gpt-5.6-terra": "medium",
    "gpt-5.6-luna": "xhigh",
    "gpt-5.5": "high",
    "gpt-5.4": "medium",
  },
};

const REASONING_EFFORTS: ReadonlySet<string> = new Set<ReasoningEffort>([
  "low",
  "medium",
  "high",
  "xhigh",
]);

function fail(message: string): never {
  throw new Error(`[model-registry] invalid model registry: ${message}`);
}

function asRecord(value: unknown, path: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    fail(`${path} must be an object`);
  }
  return value as Record<string, unknown>;
}

function asNonEmptyString(value: unknown, path: string): string {
  if (typeof value !== "string" || value.trim() === "") fail(`${path} must be a non-empty string`);
  return value;
}

function asFiniteNumber(value: unknown, path: string): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    fail(`${path} must be a finite number >= 0`);
  }
  return value;
}

function asEffort(value: unknown, path: string): ReasoningEffort {
  if (typeof value !== "string" || !REASONING_EFFORTS.has(value)) {
    fail(`${path} must be one of low|medium|high|xhigh (got ${JSON.stringify(value)})`);
  }
  return value as ReasoningEffort;
}

export interface ClaudeModelIds {
  opus: string;
  sonnet: string;
  haiku: string;
  fable: string;
}

export interface CodexModelIds {
  frontier: string;
  worker: string;
  spark: string;
  mini: string;
  codex: string;
}

export interface ModelIdRegistry {
  claude: ClaudeModelIds;
  codex: CodexModelIds;
}

export interface ClaudePrice {
  input: number;
  output: number;
}

export interface OpenAiPrice {
  input: number;
  cached: number | null;
  output: number;
}

function validateModelIds(raw: unknown): ModelIdRegistry {
  const root = asRecord(raw, "modelIds");
  const claude = asRecord(root.claude, "modelIds.claude");
  const codex = asRecord(root.codex, "modelIds.codex");
  return {
    claude: {
      opus: asNonEmptyString(claude.opus, "modelIds.claude.opus"),
      sonnet: asNonEmptyString(claude.sonnet, "modelIds.claude.sonnet"),
      haiku: asNonEmptyString(claude.haiku, "modelIds.claude.haiku"),
      fable: asNonEmptyString(claude.fable, "modelIds.claude.fable"),
    },
    codex: {
      frontier: asNonEmptyString(codex.frontier, "modelIds.codex.frontier"),
      worker: asNonEmptyString(codex.worker, "modelIds.codex.worker"),
      spark: asNonEmptyString(codex.spark, "modelIds.codex.spark"),
      mini: asNonEmptyString(codex.mini, "modelIds.codex.mini"),
      codex: asNonEmptyString(codex.codex, "modelIds.codex.codex"),
    },
  };
}

function validateClaudePricing(raw: unknown): Record<string, ClaudePrice> {
  const root = asRecord(raw, "claudePricing");
  const out: Record<string, ClaudePrice> = {};
  for (const [model, price] of Object.entries(root)) {
    const p = asRecord(price, `claudePricing.${model}`);
    out[model] = {
      input: asFiniteNumber(p.input, `claudePricing.${model}.input`),
      output: asFiniteNumber(p.output, `claudePricing.${model}.output`),
    };
  }
  if (Object.keys(out).length === 0) fail("claudePricing must not be empty");
  return out;
}

function validateOpenAiPricing(raw: unknown): Record<string, OpenAiPrice> {
  const root = asRecord(raw, "openaiPricing");
  const out: Record<string, OpenAiPrice> = {};
  for (const [model, price] of Object.entries(root)) {
    const p = asRecord(price, `openaiPricing.${model}`);
    const cached = p.cached;
    out[model] = {
      input: asFiniteNumber(p.input, `openaiPricing.${model}.input`),
      cached: cached === null ? null : asFiniteNumber(cached, `openaiPricing.${model}.cached`),
      output: asFiniteNumber(p.output, `openaiPricing.${model}.output`),
    };
  }
  if (Object.keys(out).length === 0) fail("openaiPricing must not be empty");
  return out;
}

function validateEffortMap(raw: unknown, path: string): Record<string, ReasoningEffort> {
  const root = asRecord(raw, path);
  const out: Record<string, ReasoningEffort> = {};
  for (const [key, value] of Object.entries(root)) {
    out[key] = asEffort(value, `${path}.${key}`);
  }
  if (Object.keys(out).length === 0) fail(`${path} must not be empty`);
  return out;
}

/** 検証済みの model registry 全体 (5 セクション)。 */
export interface ModelRegistry {
  modelIds: ModelIdRegistry;
  claudePricing: Record<string, ClaudePrice>;
  openaiPricing: Record<string, OpenAiPrice>;
  familyStandardEffort: Record<string, ReasoningEffort>;
  exactModelStandardEffort: Record<string, ReasoningEffort>;
}

/**
 * 任意の raw 値を model registry として schema 検証し、型付き registry を返す。
 * 破損・型不整合・空セクションは fail-closed で throw する (壊れた registry を silent 受理しない)。
 * RAW_MODEL_REGISTRY の取込に加え、テスト・doctor が任意入力の検証に使える純関数。
 */
export function parseModelRegistry(raw: unknown): ModelRegistry {
  const root = asRecord(raw, "(root)");
  return {
    modelIds: validateModelIds(root.modelIds),
    claudePricing: validateClaudePricing(root.claudePricing),
    openaiPricing: validateOpenAiPricing(root.openaiPricing),
    familyStandardEffort: validateEffortMap(root.familyStandardEffort, "familyStandardEffort"),
    exactModelStandardEffort: validateEffortMap(
      root.exactModelStandardEffort,
      "exactModelStandardEffort",
    ),
  };
}

/** RAW_MODEL_REGISTRY を検証した正本 (fail-closed)。 */
const MODEL_REGISTRY: ModelRegistry = parseModelRegistry(RAW_MODEL_REGISTRY);

/** 正本モデル ID カタログ (config 由来、検証済み)。 */
export const MODEL_IDS: ModelIdRegistry = MODEL_REGISTRY.modelIds;

/** Claude モデル単価 ($/1M tokens、config 由来・検証済み)。 */
export const CLAUDE_PRICING: Record<string, ClaudePrice> = MODEL_REGISTRY.claudePricing;

/** OpenAI (Codex) モデル単価 ($/1M tokens、config 由来・検証済み)。 */
export const OPENAI_PRICING: Record<string, OpenAiPrice> = MODEL_REGISTRY.openaiPricing;

/** family 既定の標準 reasoning effort (config 由来・検証済み)。 */
export const FAMILY_STANDARD_EFFORT: Record<string, ReasoningEffort> =
  MODEL_REGISTRY.familyStandardEffort;

/** 世代で標準 effort が変わる具体 model の上書き (config 由来・検証済み)。 */
export const EXACT_MODEL_STANDARD_EFFORT: Record<string, ReasoningEffort> =
  MODEL_REGISTRY.exactModelStandardEffort;

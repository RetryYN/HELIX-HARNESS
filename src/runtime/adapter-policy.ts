import type { AdapterProvider } from "./adapter";

export const CODEX_STDIN_ARGS = ["exec", "-"] as const;
export const CODEX_MODEL_FLAG = "-m";
export const CODEX_EFFORT_FLAG = "-c";
export const CODEX_EFFORT_CONFIG_KEY = "model_reasoning_effort";

export const CLAUDE_STDIN_ARGS = ["--print", "--input-format", "text"] as const;
export const CLAUDE_MODEL_FLAG = "--model";
export const CLAUDE_EFFORT_FLAG = "--effort";
export const CLAUDE_EFFORT_ENV = "CLAUDE_CODE_EFFORT_LEVEL";

export const ADAPTER_CONTEXT_HEADER = "HELIX context injection:";
export const REQUIRED_SKILL_LABEL = "required skill";
export const OPTIONAL_SKILL_LABEL = "optional skill";

/** 委譲 prompt へ載せる memory recall の見出し (read-only 宣言込み、PLAN-L7-406 / L6-64 §3)。 */
export const MEMORY_RECALL_HEADER = "HELIX memory recall (read-only, auto-injected):";
/** 委譲 prompt 向け memory surface budget (L6-64 §4: 委譲は recall を補助に留め token 予算を厳格化)。 */
export const DELEGATION_MEMORY_BUDGET = { maxEntries: 6, maxBodyChars: 200 } as const;

export const ADAPTER_AVAILABLE_MESSAGE = "adapter execution allowed";
export const ADAPTER_DRY_RUN_MESSAGE = "adapter dry-run plan";

export function unavailableProviderMessage(provider: AdapterProvider, mode: string): string {
  return `${provider} is not available in ${mode} mode`;
}

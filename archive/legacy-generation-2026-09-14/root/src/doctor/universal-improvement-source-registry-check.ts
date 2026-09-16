import type { LintResult } from "../plan/lint";
import {
  loadUniversalImprovementSourceRegistry,
  universalImprovementSourceRegistryMessages,
} from "../runtime/universal-improvement-source-registry";

export function checkUniversalImprovementSourceRegistry(repoRoot: string): LintResult {
  const result = loadUniversalImprovementSourceRegistry(repoRoot);
  return {
    ok: result.ok,
    messages: universalImprovementSourceRegistryMessages(result),
  };
}

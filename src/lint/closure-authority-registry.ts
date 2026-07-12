import {
  analyzeClosureAuthorityDrift,
  type ClosureAuthorityDrift,
  type ClosureAuthorityRegistry,
  loadClosureAuthorityRegistry,
} from "../policy/closure-authority-registry";

export const CLOSURE_AUTHORITY_REGISTRY_PATH =
  "docs/governance/closure-authority-registry.yaml" as const;

export interface ClosureAuthorityRegistryLintInput {
  registry: ClosureAuthorityRegistry;
  drifts: ClosureAuthorityDrift[];
}

export interface ClosureAuthorityRegistryLintResult {
  authorityCount: number;
  drifts: ClosureAuthorityDrift[];
  ok: boolean;
}

/** strict parse済みregistryをsource bytesとのdriftまで検査する純粋adapter。 */
export function analyzeClosureAuthorityRegistry(
  input: ClosureAuthorityRegistryLintInput,
): ClosureAuthorityRegistryLintResult {
  return {
    authorityCount: input.registry.authorities.length,
    drifts: [...input.drifts],
    ok: input.drifts.length === 0,
  };
}

/** repo-owned固定pathからstrict registryとsource driftを読み込む。 */
export function loadClosureAuthorityRegistryLintInput(
  repositoryRoot: string,
): ClosureAuthorityRegistryLintInput {
  const registry = loadClosureAuthorityRegistry({
    repositoryRoot,
    registryPath: CLOSURE_AUTHORITY_REGISTRY_PATH,
  });
  return {
    registry,
    drifts: analyzeClosureAuthorityDrift({ repositoryRoot, registry }),
  };
}

export function closureAuthorityRegistryMessages(
  result: ClosureAuthorityRegistryLintResult,
): string[] {
  if (result.ok)
    return [`closure-authority-registry - OK (authorities=${result.authorityCount}, drift=0)`];
  return result.drifts.map(
    (drift) =>
      `closure-authority-registry - violation: ${drift.plan_id} ${drift.code}: ${drift.message}`,
  );
}

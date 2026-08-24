import {
  type ProjectHookAuthorityResolution,
  projectHookAuthorityInputUnavailable,
  resolveProjectHookAuthority,
} from "./project-hook-authority";

export type ProjectHookAuthorityProviderResult =
  | { ok: true; input: unknown }
  | { ok: false; reason: "authority_input_unavailable" };

/**
 * Control Planeが明示authority inputを渡すport。
 * cwd／環境変数／primary tree／remoteから値を補完する実装はこのport契約に含めない。
 */
export interface ProjectHookAuthorityInputProvider {
  read(): ProjectHookAuthorityProviderResult;
}

function hasExactKeys(value: Record<string, unknown>, expected: readonly string[]): boolean {
  const actual = Object.keys(value).sort();
  return actual.length === expected.length && actual.every((key, index) => key === expected[index]);
}

function parseProviderResult(value: unknown): ProjectHookAuthorityProviderResult | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  if (record.ok === true && hasExactKeys(record, ["input", "ok"])) {
    return { ok: true, input: record.input };
  }
  if (
    record.ok === false &&
    record.reason === "authority_input_unavailable" &&
    hasExactKeys(record, ["ok", "reason"])
  ) {
    return { ok: false, reason: "authority_input_unavailable" };
  }
  return null;
}

export function resolveProjectHookAuthorityFromProvider(
  provider: ProjectHookAuthorityInputProvider,
): ProjectHookAuthorityResolution {
  let provided: ProjectHookAuthorityProviderResult | null;
  try {
    provided = parseProviderResult(provider.read());
  } catch {
    provided = null;
  }
  if (provided?.ok !== true) return projectHookAuthorityInputUnavailable();
  return resolveProjectHookAuthority(provided.input);
}

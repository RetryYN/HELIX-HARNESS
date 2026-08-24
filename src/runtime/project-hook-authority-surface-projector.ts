import { canonicalJson } from "./digest";
import type { ProjectHookAuthorityResolution } from "./project-hook-authority";

export const PROJECT_HOOK_AUTHORITY_SURFACES = [
  "session_start",
  "doctor",
  "status",
  "dispatch",
] as const;

export type ProjectHookAuthoritySurface = (typeof PROJECT_HOOK_AUTHORITY_SURFACES)[number];

export interface ProjectHookAuthoritySurfaceProjection {
  ok: boolean;
  bytes_by_surface: Readonly<Record<ProjectHookAuthoritySurface, string>>;
}

/**
 * 一度だけ解決済みのreceipt/failure bytesを4 surfaceへ複製するpure projector。
 * surface別のauthority再計算、field追加、repair hint、fallbackを行わない。
 */
export function projectProjectHookAuthoritySurfaces(
  resolution: ProjectHookAuthorityResolution,
): ProjectHookAuthoritySurfaceProjection {
  const bytes = canonicalJson(resolution.ok ? resolution.receipt : resolution.failure);
  return {
    ok: resolution.ok,
    bytes_by_surface: Object.freeze({
      session_start: bytes,
      doctor: bytes,
      status: bytes,
      dispatch: bytes,
    }),
  };
}

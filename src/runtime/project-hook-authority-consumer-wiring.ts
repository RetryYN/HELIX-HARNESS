import type { ProjectHookAuthorityInputProvider } from "./project-hook-authority-provider";
import { resolveProjectHookAuthorityFromProvider } from "./project-hook-authority-provider";
import {
  PROJECT_HOOK_AUTHORITY_SURFACES,
  type ProjectHookAuthoritySurface,
  projectProjectHookAuthoritySurfaces,
} from "./project-hook-authority-surface-projector";

export type ProjectHookAuthorityConsumer = ProjectHookAuthoritySurface;

export interface ProjectHookAuthorityDispatchAdmission {
  readonly ok: boolean;
  readonly bytes: string;
}

export interface ProjectHookAuthorityConsumerWiring {
  readonly ok: boolean;
  readonly bytesByConsumer: Readonly<Record<ProjectHookAuthorityConsumer, string>>;
  bytesFor(consumer: ProjectHookAuthorityConsumer): string;
  dispatchAdmission(): ProjectHookAuthorityDispatchAdmission;
}

function isConsumer(value: string): value is ProjectHookAuthorityConsumer {
  return (PROJECT_HOOK_AUTHORITY_SURFACES as readonly string[]).includes(value);
}

/**
 * Control Plane providerを一度だけresolveし、既存pure projectorの同一bytesをcurrent consumerへ配る。
 * consumer read時の再計算、cwd/env/remote fallback、repair side effectを持たない。
 */
export function createProjectHookAuthorityConsumerWiring(
  provider: ProjectHookAuthorityInputProvider,
): ProjectHookAuthorityConsumerWiring {
  const resolution = resolveProjectHookAuthorityFromProvider(provider);
  const projection = projectProjectHookAuthoritySurfaces(resolution);
  const bytesByConsumer = projection.bytes_by_surface;
  return Object.freeze({
    ok: projection.ok,
    bytesByConsumer,
    bytesFor(consumer: ProjectHookAuthorityConsumer): string {
      if (!isConsumer(consumer)) throw new Error("unknown project hook authority consumer");
      return bytesByConsumer[consumer];
    },
    dispatchAdmission(): ProjectHookAuthorityDispatchAdmission {
      return Object.freeze({ ok: projection.ok, bytes: bytesByConsumer.dispatch });
    },
  });
}

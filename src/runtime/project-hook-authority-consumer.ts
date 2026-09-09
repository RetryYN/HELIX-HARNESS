import type {
  ProjectHookAuthorityReceiptV1,
  ProjectHookAuthorityResolution,
} from "./project-hook-authority";
import {
  type ProjectHookAuthorityHostObservation,
  type ProjectHookAuthorityTransportDeps,
  resolveProjectHookAuthorityFromTransport,
} from "./project-hook-authority-envelope";
import {
  type ProjectHookAuthoritySurface,
  type ProjectHookAuthoritySurfaceProjection,
  projectProjectHookAuthoritySurfaces,
} from "./project-hook-authority-surface-projector";

export const PROJECT_HOOK_AUTHORITY_CONSUMER_WIRING_SCHEMA =
  "helix-project-hook-authority-consumer-wiring.v1" as const;

export interface ProjectHookAuthorityConsumerWiring {
  readonly schema_version: typeof PROJECT_HOOK_AUTHORITY_CONSUMER_WIRING_SCHEMA;
  readonly resolution: ProjectHookAuthorityResolution;
  readonly projection: ProjectHookAuthoritySurfaceProjection;
  readonly admitted_receipt: ProjectHookAuthorityReceiptV1 | null;
  readonly dispatch_allowed: boolean;
}

export interface ProjectHookAuthorityConsumerDependencies {
  resolve: typeof resolveProjectHookAuthorityFromTransport;
  project: typeof projectProjectHookAuthoritySurfaces;
}

const defaultDependencies: ProjectHookAuthorityConsumerDependencies = {
  resolve: resolveProjectHookAuthorityFromTransport,
  project: projectProjectHookAuthoritySurfaces,
};

export interface ProjectHookAuthorityConsumerInput {
  readonly raw_envelope: unknown;
  readonly host: ProjectHookAuthorityHostObservation;
  readonly transport_deps: ProjectHookAuthorityTransportDeps;
  readonly dependencies?: ProjectHookAuthorityConsumerDependencies;
}

/**
 * Control Plane transport envelopeを一度だけcanonical resolutionへ変換し、
 * projectorも一度だけ実行する。返却後のsurface参照はserialization、capture、resolverを
 * 再実行しない。admitted receiptが存在しないfailureではdispatchを許可しない。
 */
export function buildProjectHookAuthorityConsumerWiring(
  input: ProjectHookAuthorityConsumerInput,
): ProjectHookAuthorityConsumerWiring {
  const deps = input.dependencies ?? defaultDependencies;
  const resolution = deps.resolve(input.raw_envelope, input.host, input.transport_deps);
  const projection = deps.project(resolution);
  const admittedReceipt = resolution.ok ? resolution.receipt : null;
  return Object.freeze({
    schema_version: PROJECT_HOOK_AUTHORITY_CONSUMER_WIRING_SCHEMA,
    resolution,
    projection,
    admitted_receipt: admittedReceipt,
    dispatch_allowed: admittedReceipt !== null,
  }) as ProjectHookAuthorityConsumerWiring;
}

/** 4 surfaceは既にprojectorが生成した同一bytesを読むだけにする。 */
export function consumeProjectHookAuthoritySurface(
  wiring: ProjectHookAuthorityConsumerWiring,
  surface: ProjectHookAuthoritySurface,
): string {
  return wiring.projection.bytes_by_surface[surface];
}

export interface ProjectHookAuthorityDispatchAdmission {
  readonly allowed: boolean;
  readonly bytes: string;
  readonly reason: "admitted_receipt" | "project_hook_authority_not_admitted";
}

/**
 * provider processのspawn直前にのみ呼ぶ。resolutionを再計算せず、同じdispatch bytesと
 * admitted receiptの存在だけで判定する。
 */
export function admitProjectHookAuthorityDispatch(
  wiring: ProjectHookAuthorityConsumerWiring,
): ProjectHookAuthorityDispatchAdmission {
  return wiring.dispatch_allowed
    ? {
        allowed: true,
        bytes: consumeProjectHookAuthoritySurface(wiring, "dispatch"),
        reason: "admitted_receipt",
      }
    : {
        allowed: false,
        bytes: consumeProjectHookAuthoritySurface(wiring, "dispatch"),
        reason: "project_hook_authority_not_admitted",
      };
}

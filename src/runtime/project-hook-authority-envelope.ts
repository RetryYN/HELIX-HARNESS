import { z } from "zod";
import { canonicalJson, sha256Digest } from "./digest";
import {
  type ProjectHookAuthorityResolution,
  type ProjectHookAuthorityRootIdentityV1,
  type ProjectHookAuthoritySourceMaterialV1,
  projectHookAuthorityAssignmentBindingSchema,
  projectHookAuthorityInputUnavailable,
  projectHookAuthorityLifecyclePolicySchema,
  projectHookAuthorityRootIdentitySchema,
  projectHookAuthoritySourceMaterialSchema,
  projectHookAuthoritySourceStaleFailure,
  projectHookAuthorityTransportSchemaFailure,
  resolveProjectHookAuthority,
} from "./project-hook-authority";
import {
  captureProjectHookRepositoryIdentity,
  captureProjectHookSourceMaterial,
  nodeProjectHookPhysicalAdapterDeps,
  type ProjectHookPhysicalAdapterDeps,
} from "./project-hook-physical-adapter";

export const PROJECT_HOOK_AUTHORITY_TRANSPORT_ENVELOPE_SCHEMA =
  "helix-project-hook-authority-transport-envelope.v1" as const;
export const PROJECT_HOOK_AUTHORITY_STANDALONE_PROJECTION_SCHEMA =
  "helix-project-hook-authority-standalone-projection.v1" as const;

const headSchema = z.string().regex(/^[a-f0-9]{40}$/);
const stableIdSchema = z.string().regex(/^[A-Za-z0-9][A-Za-z0-9._:-]*$/);

/**
 * Control Planeが発行する期待値だけを運ぶtransport envelope。
 * hostのcwd、loader、current authorityの実測値はこのobjectへ混載しない。
 */
export const projectHookAuthorityTransportEnvelopeSchema = z
  .object({
    schema_version: z.literal(PROJECT_HOOK_AUTHORITY_TRANSPORT_ENVELOPE_SCHEMA),
    envelope_id: stableIdSchema,
    issued_at: z.string().datetime({ offset: true }),
    capture_locators: z
      .object({
        loader_root: z.string().min(1),
        session_project_root: z.string().min(1),
        current_authority_root: z.string().min(1),
      })
      .strict(),
    expected: z
      .object({
        execution_root: projectHookAuthorityRootIdentitySchema,
        loader_root: projectHookAuthorityRootIdentitySchema,
        session_project_root: projectHookAuthorityRootIdentitySchema,
        current_authority_root: projectHookAuthorityRootIdentitySchema,
        assignment_binding: projectHookAuthorityAssignmentBindingSchema,
        candidate_base_head: headSchema,
        current_authority_head: headSchema,
        source_material: projectHookAuthoritySourceMaterialSchema,
        current_authority_source_material: projectHookAuthoritySourceMaterialSchema,
        lifecycle_policy: projectHookAuthorityLifecyclePolicySchema,
      })
      .strict(),
  })
  .strict();

export type ProjectHookAuthorityTransportEnvelopeV1 = z.infer<
  typeof projectHookAuthorityTransportEnvelopeSchema
>;

/**
 * Hook entrypointがhostから採取した値。全rootを明示的に要求し、cwd/env/default fileで補完しない。
 * execution_rootは通常process.cwd()の観測値だが、authorityの期待値ではない。
 */
export interface ProjectHookAuthorityHostObservation {
  execution_root: string;
  loader_root: string;
  session_project_root: string;
  current_authority_root: string;
  captured_at: string;
}

export interface NodeProjectHookAuthorityHostDeps {
  cwd(): string;
}

export const nodeProjectHookAuthorityHostDeps: NodeProjectHookAuthorityHostDeps = {
  cwd: () => process.cwd(),
};

export function observeNodeProjectHookHost(
  roots: Omit<ProjectHookAuthorityHostObservation, "execution_root" | "captured_at"> & {
    captured_at: string;
  },
  deps: NodeProjectHookAuthorityHostDeps = nodeProjectHookAuthorityHostDeps,
): ProjectHookAuthorityHostObservation {
  return {
    execution_root: deps.cwd(),
    loader_root: roots.loader_root,
    session_project_root: roots.session_project_root,
    current_authority_root: roots.current_authority_root,
    captured_at: roots.captured_at,
  };
}

/**
 * CLI/hookの実行境界でhost locatorを組み立てる。cwdは実際の実行rootとして観測し、
 * 他の3 rootはtransportのcapture locatorだけを使う。locatorは期待identityではなく、root identity、
 * HEAD、source bytes、digestは後段で実filesystemから独立採取し、transport値をobservedへ
 * コピーしない。transportが不正な場合はlocatorを補完せずnullを返す。
 */
export function observeNodeProjectHookHostFromTransport(
  rawEnvelope: unknown,
  deps: NodeProjectHookAuthorityHostDeps = nodeProjectHookAuthorityHostDeps,
  now: () => string = () => new Date().toISOString(),
): ProjectHookAuthorityHostObservation | null {
  const parsed = projectHookAuthorityTransportEnvelopeSchema.safeParse(rawEnvelope);
  if (!parsed.success) return null;
  return observeNodeProjectHookHost(
    {
      loader_root: parsed.data.capture_locators.loader_root,
      session_project_root: parsed.data.capture_locators.session_project_root,
      current_authority_root: parsed.data.capture_locators.current_authority_root,
      captured_at: now(),
    },
    deps,
  );
}

export interface ProjectHookAuthorityTransportDeps {
  physical: ProjectHookPhysicalAdapterDeps;
}

function digest(value: unknown) {
  return sha256Digest(canonicalJson(value));
}

function captureSourceRoot(
  path: string,
  deps: ProjectHookPhysicalAdapterDeps,
): ProjectHookAuthorityRootIdentityV1 {
  return captureProjectHookRepositoryIdentity(path, deps);
}

function sourceEqual(
  observed: ProjectHookAuthoritySourceMaterialV1,
  expected: ProjectHookAuthoritySourceMaterialV1,
): boolean {
  return canonicalJson(observed) === canonicalJson(expected);
}

function rootEqual(
  observed: ProjectHookAuthorityRootIdentityV1,
  expected: ProjectHookAuthorityRootIdentityV1,
): boolean {
  return digest(observed) === digest(expected);
}

function resolveHostCurrentAuthorityAnchorRef(
  root: string,
  deps: ProjectHookPhysicalAdapterDeps,
): string {
  const refs = deps.physical
    .git(root, ["for-each-ref", "--format=%(symref)", "refs/remotes/*/HEAD"])
    .split("\n")
    .map((value) => value.trim())
    .filter((value) => /^refs\/remotes\/[^/]+\/[^/]+$/u.test(value));
  const unique = [...new Set(refs)];
  if (unique.length !== 1) throw new Error("current_authority_anchor_unavailable");
  return unique[0];
}

/**
 * Control Plane envelopeをexpected authorityに限定し、hostのroot/HEAD/source bytesを独立採取してから
 * 既存pure resolverへ渡す。envelopeのexpected値をobserved側へコピーする実装はここに置かない。
 */
export function resolveProjectHookAuthorityFromTransport(
  rawEnvelope: unknown,
  host: ProjectHookAuthorityHostObservation,
  deps: ProjectHookAuthorityTransportDeps = { physical: nodeProjectHookPhysicalAdapterDeps },
): ProjectHookAuthorityResolution {
  const parsed = projectHookAuthorityTransportEnvelopeSchema.safeParse(rawEnvelope);
  if (!parsed.success) return projectHookAuthorityTransportSchemaFailure();
  const { expected } = parsed.data;

  let observedExecutionRoot: ProjectHookAuthorityRootIdentityV1;
  let observedLoaderRoot: ProjectHookAuthorityRootIdentityV1;
  let observedSessionRoot: ProjectHookAuthorityRootIdentityV1;
  let observedCurrentAuthorityRoot: ProjectHookAuthorityRootIdentityV1;
  let observedRepositoryHead: string;
  let observedCurrentAuthorityHead: string;
  let hostCurrentAuthorityHead: string;
  let observedSourceMaterial: ProjectHookAuthoritySourceMaterialV1;
  let observedCurrentAuthoritySourceMaterial: ProjectHookAuthoritySourceMaterialV1;
  try {
    observedExecutionRoot = captureSourceRoot(host.execution_root, deps.physical);
    observedLoaderRoot = captureSourceRoot(host.loader_root, deps.physical);
    observedSessionRoot = captureSourceRoot(host.session_project_root, deps.physical);
    observedCurrentAuthorityRoot = captureSourceRoot(host.current_authority_root, deps.physical);
    observedRepositoryHead = deps.physical.git(observedExecutionRoot.canonical_realpath, [
      "rev-parse",
      "HEAD",
    ]);
    observedCurrentAuthorityHead = deps.physical.git(
      observedCurrentAuthorityRoot.canonical_realpath,
      ["rev-parse", "HEAD"],
    );
    // current authority anchorはtransport requestではなく、実行repositoryのgit common dirが
    // 所有する一意なremote default symbolic refから独立採取する。remote名やbranch名を固定せず、
    // default refが欠落・複数ならinput unavailableへ閉じる。
    const hostCurrentAuthorityAnchorRef = resolveHostCurrentAuthorityAnchorRef(
      observedExecutionRoot.canonical_realpath,
      deps,
    );
    hostCurrentAuthorityHead = deps.physical.git(observedExecutionRoot.canonical_realpath, [
      "rev-parse",
      hostCurrentAuthorityAnchorRef,
    ]);
    observedSourceMaterial = captureProjectHookSourceMaterial(
      observedExecutionRoot.canonical_realpath,
      deps.physical,
    );
    observedCurrentAuthoritySourceMaterial = captureProjectHookSourceMaterial(
      observedCurrentAuthorityRoot.canonical_realpath,
      deps.physical,
    );
  } catch {
    return projectHookAuthorityInputUnavailable();
  }

  const hostCommonDir = observedExecutionRoot.repository_common_dir;
  for (const [pointer, observed] of [
    ["/loader_root/repository_common_dir", observedLoaderRoot],
    ["/session_project_root/repository_common_dir", observedSessionRoot],
    ["/current_authority_root/repository_common_dir", observedCurrentAuthorityRoot],
  ] as const) {
    if (observed.repository_common_dir !== hostCommonDir)
      return projectHookAuthoritySourceStaleFailure(pointer, "foreign_git_common_dir");
  }
  if (observedCurrentAuthorityHead !== hostCurrentAuthorityHead)
    return projectHookAuthoritySourceStaleFailure(
      "/current_authority_anchor",
      "host_current_authority_head_mismatch",
    );

  const rootPairs: readonly [
    string,
    ProjectHookAuthorityRootIdentityV1,
    ProjectHookAuthorityRootIdentityV1,
  ][] = [
    ["/execution_root", observedExecutionRoot, expected.execution_root],
    ["/loader_root", observedLoaderRoot, expected.loader_root],
    ["/session_project_root", observedSessionRoot, expected.session_project_root],
    ["/current_authority_root", observedCurrentAuthorityRoot, expected.current_authority_root],
  ];
  for (const [pointer, observed, expectedRoot] of rootPairs) {
    if (!rootEqual(observed, expectedRoot))
      return projectHookAuthoritySourceStaleFailure(pointer, "host_observation_mismatch");
  }
  if (observedRepositoryHead !== expected.candidate_base_head)
    return projectHookAuthoritySourceStaleFailure("/repository_head", "execution_head_mismatch");
  if (observedCurrentAuthorityHead !== expected.current_authority_head)
    return projectHookAuthoritySourceStaleFailure(
      "/current_authority_head",
      "current_authority_head_mismatch",
    );
  if (!sourceEqual(observedSourceMaterial, expected.source_material))
    return projectHookAuthoritySourceStaleFailure("/source_material", "execution_source_mismatch");
  if (
    !sourceEqual(observedCurrentAuthoritySourceMaterial, expected.current_authority_source_material)
  )
    return projectHookAuthoritySourceStaleFailure(
      "/current_authority_source_material",
      "current_authority_source_mismatch",
    );

  return resolveProjectHookAuthority({
    schema_version: "helix-project-hook-authority-input.v1",
    execution_root: observedExecutionRoot,
    loader_root: observedLoaderRoot,
    session_project_root: observedSessionRoot,
    assignment_binding: structuredClone(expected.assignment_binding),
    repository_head: observedRepositoryHead,
    candidate_base_head: expected.candidate_base_head,
    current_authority_head: expected.current_authority_head,
    source_material: observedSourceMaterial,
    current_authority_source_material: structuredClone(observedCurrentAuthoritySourceMaterial),
    physical_evidence: {
      captured_at: host.captured_at,
      capture_source: deps.physical.platform === "win32" ? "windows-file-id" : "node-stat",
    },
    lifecycle_policy: structuredClone(expected.lifecycle_policy),
  });
}

export interface ProjectHookAuthorityStandaloneProjection {
  schema_version: typeof PROJECT_HOOK_AUTHORITY_STANDALONE_PROJECTION_SCHEMA;
  execution_mode: "standalone";
  read_only: true;
  status: "unavailable";
  doctor: "unavailable";
  dispatch: "unavailable_no_dispatch";
  reason: "control_plane_transport_envelope_required";
  side_effects: {
    project_hook_authority_execution: 0;
    provider_dispatch: 0;
    git_write: 0;
    github_write: 0;
    coordination_session_start: "preserved";
  };
}

export function projectStandaloneProjectHookAuthoritySurface(): ProjectHookAuthorityStandaloneProjection {
  return {
    schema_version: PROJECT_HOOK_AUTHORITY_STANDALONE_PROJECTION_SCHEMA,
    execution_mode: "standalone",
    read_only: true,
    status: "unavailable",
    doctor: "unavailable",
    dispatch: "unavailable_no_dispatch",
    reason: "control_plane_transport_envelope_required",
    side_effects: {
      project_hook_authority_execution: 0,
      provider_dispatch: 0,
      git_write: 0,
      github_write: 0,
      coordination_session_start: "preserved",
    },
  };
}

import { z } from "zod";
import type { Sha256Digest } from "./digest";
import type { ProjectHookAuthorityInputV1 } from "./project-hook-authority";
import type {
  ProjectHookAuthorityInputProvider,
  ProjectHookAuthorityProviderResult,
} from "./project-hook-authority-provider";
import {
  captureProjectHookAuthorityInput,
  type ProjectHookPhysicalAdapterDeps,
} from "./project-hook-physical-adapter";

const digestSchema = z.custom<Sha256Digest>(
  (value) => typeof value === "string" && /^sha256:[a-f0-9]{64}$/.test(value),
);
const stableIdSchema = z.string().regex(/^[A-Za-z0-9][A-Za-z0-9._:-]*$/);
const headSchema = z.string().regex(/^[a-f0-9]{40}$/);

const assignmentSnapshotSchema = z
  .object({
    assignment_id: stableIdSchema,
    worktree_root: z.string().min(1),
    loader_root: z.string().min(1),
    session_project_root: z.string().min(1),
    current_authority_root: z.string().min(1),
    branch: z.string().min(1),
    candidate_base_head: headSchema,
    current_authority_head: headSchema,
    lease_id: stableIdSchema,
    fence_token: stableIdSchema,
    assignment_root_digest: digestSchema,
    captured_at: z.string().datetime({ offset: true }),
    lifecycle_policy: z
      .object({
        timeout_ms: z.number().int(),
        hard_ceiling_ms: z.number().int(),
        child_termination_grace_ms: z.number().int(),
        parent_terminal_required: z.boolean(),
        notification_handoff: z.discriminatedUnion("kind", [
          z.object({ kind: z.literal("disabled") }).strict(),
          z
            .object({
              kind: z.literal("bounded_worker"),
              worker_id: stableIdSchema,
              lease_id: stableIdSchema,
              ttl_ms: z.number().int(),
              payload_digest: digestSchema,
            })
            .strict(),
        ]),
      })
      .strict(),
  })
  .strict();

export type ProjectHookAssignmentSnapshot = z.infer<typeof assignmentSnapshotSchema>;
export type ProjectHookAssignmentSnapshotResult =
  | { ok: true; snapshot: unknown }
  | { ok: false; reason: "assignment_unavailable" };
export type ProjectHookAssignmentSnapshotReader = () => ProjectHookAssignmentSnapshotResult;

function unavailable(): ProjectHookAuthorityProviderResult {
  return { ok: false, reason: "authority_input_unavailable" };
}

/**
 * Assignment kernelの明示snapshotだけをphysical captureへ接続するprovider adapter。
 * cwd／env／primary tree／origin/mainから欠落値を推測しない。
 */
export function createAssignmentProjectHookAuthorityProvider(
  readAssignment: ProjectHookAssignmentSnapshotReader,
  deps: ProjectHookPhysicalAdapterDeps,
): ProjectHookAuthorityInputProvider {
  return {
    read(): ProjectHookAuthorityProviderResult {
      try {
        const selected = readAssignment();
        if (selected.ok !== true) return unavailable();
        const parsed = assignmentSnapshotSchema.safeParse(selected.snapshot);
        if (!parsed.success) return unavailable();
        const snapshot = parsed.data;
        const input: ProjectHookAuthorityInputV1 = captureProjectHookAuthorityInput(
          {
            execution_root: snapshot.worktree_root,
            loader_root: snapshot.loader_root,
            session_project_root: snapshot.session_project_root,
            current_authority_root: snapshot.current_authority_root,
            assignment_binding: {
              kind: "assignment",
              assignment_id: snapshot.assignment_id,
              assignment_root_digest: snapshot.assignment_root_digest,
              branch: snapshot.branch,
              lease_id: snapshot.lease_id,
              fence_token: snapshot.fence_token,
            },
            candidate_base_head: snapshot.candidate_base_head,
            current_authority_head: snapshot.current_authority_head,
            captured_at: snapshot.captured_at,
            lifecycle_policy: snapshot.lifecycle_policy,
          },
          deps,
        );
        return { ok: true, input };
      } catch {
        return unavailable();
      }
    },
  };
}

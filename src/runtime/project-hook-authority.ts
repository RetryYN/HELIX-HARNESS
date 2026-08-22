import { z } from "zod";
import { canonicalJson, type Sha256Digest, sha256Digest } from "./digest";

export const PROJECT_HOOK_AUTHORITY_INPUT_SCHEMA = "helix-project-hook-authority-input.v1" as const;
export const PROJECT_HOOK_AUTHORITY_RECEIPT_SCHEMA =
  "helix-project-hook-authority-receipt.v1" as const;

const digestSchema = z.custom<Sha256Digest>(
  (value) => typeof value === "string" && /^sha256:[a-f0-9]{64}$/.test(value),
);
const headSchema = z.string().regex(/^[a-f0-9]{40}$/);
const stableIdSchema = z.string().regex(/^[A-Za-z0-9][A-Za-z0-9._:-]*$/);
const rootIdentitySchema = z
  .object({
    lexical_path: z.string().min(1),
    canonical_realpath: z.string().min(1),
    repository_common_dir: z.string().min(1),
    filesystem_identity: z
      .object({
        platform: z.enum(["linux", "darwin", "win32"]),
        device_id: z.string().min(1),
        file_id: z.string().min(1),
        evidence_kind: z.enum(["stat", "windows-file-id"]),
      })
      .strict(),
  })
  .strict();
const sourceMaterialSchema = z
  .object({
    hooks_config_digest: digestSchema,
    agent_guard_digest: digestSchema,
    worker_policy_digest: digestSchema,
  })
  .strict();
const assignmentBindingSchema = z.discriminatedUnion("kind", [
  z
    .object({
      kind: z.literal("session"),
      session_project_root_digest: digestSchema,
    })
    .strict(),
  z
    .object({
      kind: z.literal("assignment"),
      assignment_id: stableIdSchema,
      assignment_root_digest: digestSchema,
      branch: z.string().min(1),
      lease_id: stableIdSchema,
      fence_token: stableIdSchema,
    })
    .strict(),
]);
const lifecyclePolicySchema = z
  .object({
    timeout_ms: z.number().int().positive().max(60_000),
    hard_ceiling_ms: z.literal(60_000),
    child_termination_grace_ms: z.number().int().nonnegative().max(60_000),
    parent_terminal_required: z.literal(true),
    notification_handoff: z.discriminatedUnion("kind", [
      z.object({ kind: z.literal("disabled") }).strict(),
      z
        .object({
          kind: z.literal("bounded_worker"),
          worker_id: stableIdSchema,
          lease_id: stableIdSchema,
          ttl_ms: z.number().int().positive().max(60_000),
          payload_digest: digestSchema,
        })
        .strict(),
    ]),
  })
  .strict();

export const projectHookAuthorityInputSchema = z
  .object({
    schema_version: z.literal(PROJECT_HOOK_AUTHORITY_INPUT_SCHEMA),
    execution_root: rootIdentitySchema,
    loader_root: rootIdentitySchema,
    session_project_root: rootIdentitySchema,
    assignment_binding: assignmentBindingSchema,
    repository_head: headSchema,
    candidate_base_head: headSchema,
    current_authority_head: headSchema,
    source_material: sourceMaterialSchema,
    current_authority_source_material: sourceMaterialSchema,
    physical_evidence: z
      .object({
        captured_at: z.string().datetime({ offset: true }),
        capture_source: z.enum(["node-stat", "windows-file-id"]),
      })
      .strict(),
    lifecycle_policy: lifecyclePolicySchema,
  })
  .strict();

export type ProjectHookAuthorityInputV1 = z.infer<typeof projectHookAuthorityInputSchema>;
export type ProjectHookAuthorityFailureCode =
  | "schema_invalid"
  | "unsupported_physical_identity"
  | "project_hook_source_stale_or_foreign"
  | "hook_lifecycle_policy_invalid";

export interface ProjectHookAuthorityReceiptV1 {
  schema_version: typeof PROJECT_HOOK_AUTHORITY_RECEIPT_SCHEMA;
  authority_kind: "session" | "assignment";
  physical_repository_identity: z.infer<typeof rootIdentitySchema>;
  authority_root: string;
  repository_head: string;
  source_identity: z.infer<typeof sourceMaterialSchema>;
  assignment_binding: z.infer<typeof assignmentBindingSchema>;
  captured_at: string;
  receipt_digest: Sha256Digest;
}

export type ProjectHookAuthorityResolution =
  | { ok: true; receipt: ProjectHookAuthorityReceiptV1 }
  | {
      ok: false;
      code: ProjectHookAuthorityFailureCode;
      side_effects: { hook_execution: 0; dispatch: 0; git_write: 0; db_write: 0; github_write: 0 };
    };

const ZERO_SIDE_EFFECTS = Object.freeze({
  hook_execution: 0 as const,
  dispatch: 0 as const,
  git_write: 0 as const,
  db_write: 0 as const,
  github_write: 0 as const,
});

function canonicalDigest(value: unknown): Sha256Digest {
  return sha256Digest(canonicalJson(value));
}

function samePhysicalIdentity(
  left: z.infer<typeof rootIdentitySchema>,
  right: z.infer<typeof rootIdentitySchema>,
): boolean {
  return (
    left.canonical_realpath === right.canonical_realpath &&
    left.repository_common_dir === right.repository_common_dir &&
    left.filesystem_identity.platform === right.filesystem_identity.platform &&
    left.filesystem_identity.device_id === right.filesystem_identity.device_id &&
    left.filesystem_identity.file_id === right.filesystem_identity.file_id &&
    left.filesystem_identity.evidence_kind === right.filesystem_identity.evidence_kind
  );
}

export function resolveProjectHookAuthority(raw: unknown): ProjectHookAuthorityResolution {
  const parsed = projectHookAuthorityInputSchema.safeParse(raw);
  if (!parsed.success)
    return { ok: false, code: "schema_invalid", side_effects: ZERO_SIDE_EFFECTS };
  const input = parsed.data;
  const expectedRootDigest =
    input.assignment_binding.kind === "assignment"
      ? input.assignment_binding.assignment_root_digest
      : input.assignment_binding.session_project_root_digest;
  const selectedRoot = input.execution_root;
  const rootMatches =
    samePhysicalIdentity(selectedRoot, input.loader_root) &&
    (input.assignment_binding.kind === "assignment" ||
      samePhysicalIdentity(selectedRoot, input.session_project_root)) &&
    canonicalDigest(selectedRoot) === expectedRootDigest;
  const headsMatch =
    input.repository_head === input.candidate_base_head &&
    input.repository_head === input.current_authority_head;
  const sourceMatches =
    canonicalJson(input.source_material) === canonicalJson(input.current_authority_source_material);
  if (!rootMatches || !headsMatch || !sourceMatches) {
    return {
      ok: false,
      code: "project_hook_source_stale_or_foreign",
      side_effects: ZERO_SIDE_EFFECTS,
    };
  }
  const payload = {
    schema_version: PROJECT_HOOK_AUTHORITY_RECEIPT_SCHEMA,
    authority_kind: input.assignment_binding.kind,
    physical_repository_identity: selectedRoot,
    authority_root: selectedRoot.canonical_realpath,
    repository_head: input.repository_head,
    source_identity: input.source_material,
    assignment_binding: input.assignment_binding,
    captured_at: input.physical_evidence.captured_at,
  } as const;
  return { ok: true, receipt: { ...payload, receipt_digest: canonicalDigest(payload) } };
}

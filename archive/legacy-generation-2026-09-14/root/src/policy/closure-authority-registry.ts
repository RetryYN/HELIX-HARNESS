import { createHash } from "node:crypto";
import { lstatSync, readFileSync, realpathSync } from "node:fs";
import { isAbsolute, relative, resolve } from "node:path";
import { parse as parseYaml } from "yaml";
import { z } from "zod";

export const CLOSURE_AUTHORITY_REGISTRY_SCHEMA = "closure-authority-registry.v1" as const;

const digestSchema = z.string().regex(/^sha256:[0-9a-f]{64}$/);
const planIdSchema = z.string().regex(/^PLAN-[A-Z0-9]+-[A-Za-z0-9-]+$/);
const canonicalPathSchema = z
  .string()
  .min(1)
  .refine(
    (value) =>
      !isAbsolute(value) &&
      !value.includes("\\") &&
      !value.startsWith("./") &&
      !value.endsWith("/") &&
      !value.split("/").some((segment) => segment === "" || segment === "." || segment === ".."),
    "canonical repo-relative path required",
  );

const registryRowSchema = z
  .object({
    plan_id: planIdSchema,
    source_path: canonicalPathSchema,
    source_digest: digestSchema,
    capabilities: z
      .array(
        z.enum([
          "local_plan_status",
          "version_activation",
          "state_cutover",
          "external_publish",
          "charter_p8",
        ]),
      )
      .min(1),
    bindings: z
      .array(
        z
          .object({
            oracle_id: z.string().regex(/^U-[A-Z0-9]+-[0-9]{3}$/),
            parent_design: canonicalPathSchema,
            test_path: canonicalPathSchema,
          })
          .strict(),
      )
      .default([]),
    gates: z
      .array(
        z
          .object({
            gate_id: z.string().regex(/^[a-z][a-z0-9-]*$/),
            command_id: z.string().regex(/^[a-z][a-z0-9-]*$/),
            command: z.string().min(1),
          })
          .strict(),
      )
      .default([]),
    migration_reason: z.string().min(1).nullable(),
  })
  .strict()
  .superRefine((row, context) => {
    for (const [field, values] of [
      ["capability", row.capabilities],
      ["oracle", row.bindings.map((binding) => binding.oracle_id)],
      ["gate", row.gates.map((gate) => gate.gate_id)],
    ] as const) {
      const seen = new Set<string>();
      for (const value of values) {
        if (seen.has(value))
          context.addIssue({ code: z.ZodIssueCode.custom, message: `duplicate ${field} ${value}` });
        seen.add(value);
      }
    }
  });

const registrySchema = z
  .object({
    schema_version: z.literal(CLOSURE_AUTHORITY_REGISTRY_SCHEMA),
    authorities: z.array(registryRowSchema),
  })
  .strict()
  .superRefine((registry, context) => {
    const seen = new Set<string>();
    for (const row of registry.authorities) {
      if (seen.has(row.plan_id))
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: `duplicate authority ${row.plan_id}`,
        });
      seen.add(row.plan_id);
    }
  });

export type ClosureAuthorityRegistry = z.infer<typeof registrySchema>;
export type ClosureAuthority = z.infer<typeof registryRowSchema>;
export type ClosureAuthorityClassification =
  | "eligible"
  | "authority_backfill_required"
  | "human_only"
  | "invalid";

export interface ClosureAuthorityClassificationRow {
  plan_id: string;
  classification: ClosureAuthorityClassification;
  reason: string;
  authority: ClosureAuthority | null;
}

export interface ClosureAuthorityDrift {
  plan_id: string;
  code:
    | "source_missing"
    | "source_not_regular"
    | "source_outside_repository"
    | "source_digest_drift"
    | "plan_id_mismatch";
  message: string;
}

const sha256 = (value: string | Buffer): `sha256:${string}` =>
  `sha256:${createHash("sha256").update(value).digest("hex")}`;

export function parseClosureAuthorityRegistry(value: unknown): ClosureAuthorityRegistry {
  return registrySchema.parse(value);
}

export function loadClosureAuthorityRegistry(input: {
  repositoryRoot: string;
  registryPath: string;
}): ClosureAuthorityRegistry {
  const root = realpathSync(input.repositoryRoot);
  const path = resolve(root, input.registryPath);
  const rel = relative(root, path);
  if (rel.startsWith("..") || isAbsolute(rel))
    throw new Error("registry path is outside repository");
  const stat = lstatSync(path);
  if (!stat.isFile() || stat.isSymbolicLink())
    throw new Error("registry must be a canonical regular file");
  return parseClosureAuthorityRegistry(parseYaml(readFileSync(path, "utf8")));
}

export function analyzeClosureAuthorityDrift(input: {
  repositoryRoot: string;
  registry: ClosureAuthorityRegistry;
}): ClosureAuthorityDrift[] {
  const root = realpathSync(input.repositoryRoot);
  const drifts: ClosureAuthorityDrift[] = [];
  for (const authority of input.registry.authorities) {
    const path = resolve(root, authority.source_path);
    const rel = relative(root, path);
    if (rel.startsWith("..") || isAbsolute(rel)) {
      drifts.push({
        plan_id: authority.plan_id,
        code: "source_outside_repository",
        message: `${authority.source_path}: outside repository`,
      });
      continue;
    }
    try {
      const stat = lstatSync(path);
      if (!stat.isFile() || stat.isSymbolicLink() || realpathSync(path) !== path) {
        drifts.push({
          plan_id: authority.plan_id,
          code: "source_not_regular",
          message: `${authority.source_path}: canonical regular file required`,
        });
        continue;
      }
      const bytes = readFileSync(path);
      const actual = sha256(bytes);
      if (actual !== authority.source_digest)
        drifts.push({
          plan_id: authority.plan_id,
          code: "source_digest_drift",
          message: `${authority.source_path}: source digest drift`,
        });
      else {
        const match = /^---\n([\s\S]*?)\n---(?:\n|$)/.exec(bytes.toString("utf8"));
        let sourcePlanId = "";
        try {
          sourcePlanId = String(parseYaml(match?.[1] ?? "")?.plan_id ?? "");
        } catch {
          sourcePlanId = "";
        }
        if (sourcePlanId !== authority.plan_id)
          drifts.push({
            plan_id: authority.plan_id,
            code: "plan_id_mismatch",
            message: `${authority.source_path}: plan_id mismatch`,
          });
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT")
        drifts.push({
          plan_id: authority.plan_id,
          code: "source_missing",
          message: `${authority.source_path}: source missing`,
        });
      else throw error;
    }
  }
  return drifts;
}

const irreversibleCapabilities = new Set([
  "version_activation",
  "state_cutover",
  "external_publish",
  "charter_p8",
]);

/** Authority comes exclusively from the parsed repo-owned registry; no caller override is accepted. */
export function classifyClosureAuthorities(input: {
  candidatePlanIds: readonly string[];
  registry: ClosureAuthorityRegistry;
  drifts: readonly ClosureAuthorityDrift[];
}): ClosureAuthorityClassificationRow[] {
  const authorities = new Map(input.registry.authorities.map((row) => [row.plan_id, row]));
  const drifted = new Set(input.drifts.map((drift) => drift.plan_id));
  const counts = new Map<string, number>();
  for (const planId of input.candidatePlanIds) counts.set(planId, (counts.get(planId) ?? 0) + 1);
  return [...counts.keys()].map((planId) => {
    if ((counts.get(planId) ?? 0) > 1)
      return {
        plan_id: planId,
        classification: "invalid",
        reason: "duplicate candidate",
        authority: null,
      };
    const authority = authorities.get(planId) ?? null;
    if (!authority)
      return {
        plan_id: planId,
        classification: "human_only",
        reason: "default human: authority absent",
        authority,
      };
    if (drifted.has(planId))
      return {
        plan_id: planId,
        classification: "invalid",
        reason: "authority source drift",
        authority,
      };
    if (authority.capabilities.some((capability) => irreversibleCapabilities.has(capability)))
      return {
        plan_id: planId,
        classification: "human_only",
        reason: "irreversible capability",
        authority,
      };
    if (authority.migration_reason !== null)
      return {
        plan_id: planId,
        classification: "authority_backfill_required",
        reason: authority.migration_reason,
        authority,
      };
    if (authority.bindings.length === 0 || authority.gates.length === 0)
      return {
        plan_id: planId,
        classification: "invalid",
        reason: "binding or gate authority absent",
        authority,
      };
    return {
      plan_id: planId,
      classification: "eligible",
      reason: "strict authority complete",
      authority,
    };
  });
}

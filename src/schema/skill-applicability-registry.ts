import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, parse, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import {
  assertWorkflowClassificationAuthorityDigest,
  loadWorkflowClassificationRegistry,
  WORKFLOW_CLASSIFICATION_REGISTRY_PATH,
  type WorkflowClassificationRegistry,
  workflowClassificationAxisSchema,
  workflowClassificationRegistrySchema,
} from "./workflow-classification-registry.js";

export const SKILL_APPLICABILITY_REGISTRY_PATH =
  "docs/design/helix/L3-requirements/skill-applicability-registry.v1.json";

function findPackageRoot(modulePath: string): string {
  let current = dirname(modulePath);
  const filesystemRoot = parse(current).root;
  while (current !== filesystemRoot) {
    try {
      readFileSync(resolve(current, "package.json"));
      return current;
    } catch {
      current = dirname(current);
    }
  }
  throw new Error("skill applicability package root not found");
}

const PACKAGE_ROOT = findPackageRoot(fileURLToPath(import.meta.url));

const digestSchema = z.string().regex(/^sha256:[a-f0-9]{64}$/u);
const identityIdSchema = z.string().regex(/^[A-Z][A-Z0-9_]*$/u);

export const skillApplicabilityIdentitySchema = z
  .object({
    target_axis: workflowClassificationAxisSchema,
    target_id: identityIdSchema,
  })
  .strict();

const legacyConversionSchema = z
  .object({
    token: z.string().regex(/^[a-z][a-z0-9-]*$/u),
    target_axis: workflowClassificationAxisSchema,
    target_id: identityIdSchema,
  })
  .strict();

export const skillApplicabilityRegistrySchema = z
  .object({
    schema_version: z.literal("helix-skill-applicability-registry.v1"),
    registry_version: z.string().regex(/^\d+\.\d+\.\d+$/u),
    authority: z
      .object({
        kind: z.literal("requirements"),
        source: z.literal("docs/design/helix/L3-requirements/skill-applicability-authority.md"),
        source_digest: digestSchema,
      })
      .strict(),
    identity_reference: z
      .object({
        source: z.literal(WORKFLOW_CLASSIFICATION_REGISTRY_PATH),
        schema_version: z.literal("helix-workflow-classification-registry.v1"),
        registry_version: z.string().regex(/^\d+\.\d+\.\d+$/u),
        registry_source_digest: digestSchema,
        binding_key: z.tuple([z.literal("target_axis"), z.literal("target_id")]),
      })
      .strict(),
    current_contract: z
      .object({
        positive_field: z.literal("applicable_identities"),
        negative_field: z.literal("excluded_identities"),
        item_fields: z.tuple([z.literal("target_axis"), z.literal("target_id")]),
        allowed_axes: z.array(workflowClassificationAxisSchema).min(1).readonly(),
        implicit_default: z.literal(false),
        duplicate_disposition: z.literal("fail_close"),
        polarity_conflict_disposition: z.literal("fail_close"),
        unknown_identity_disposition: z.literal("fail_close"),
        emit_legacy_identity: z.literal(false),
      })
      .strict(),
    legacy_input_adapter: z
      .object({
        semantic_role: z.literal("compatibility_input_only"),
        accepted_fields: z.tuple([z.literal("drive_models")]),
        normalization: z.tuple([
          z.literal("trim"),
          z.literal("lowercase_en_us"),
          z.literal("underscore_to_hyphen"),
        ]),
        conversions: z.array(legacyConversionSchema).min(1).readonly(),
        ambiguous_tokens: z
          .array(z.string().regex(/^[a-z][a-z0-9-]*$/u))
          .min(1)
          .readonly(),
        unknown_disposition: z.literal("unsupported"),
        ambiguity_disposition: z.literal("ambiguous"),
        emit_legacy_identity: z.literal(false),
      })
      .strict(),
  })
  .strict()
  .superRefine((registry, context) => {
    const allowedAxes = new Set<string>();
    for (const axis of registry.current_contract.allowed_axes) {
      if (allowedAxes.has(axis)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["current_contract", "allowed_axes"],
          message: `duplicate skill applicability axis: ${axis}`,
        });
      }
      allowedAxes.add(axis);
    }
    const conversionTokens = new Set<string>();
    for (const conversion of registry.legacy_input_adapter.conversions) {
      if (conversionTokens.has(conversion.token)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["legacy_input_adapter", "conversions"],
          message: `duplicate legacy skill applicability token: ${conversion.token}`,
        });
      }
      conversionTokens.add(conversion.token);
    }
    const ambiguousTokens = new Set<string>();
    for (const token of registry.legacy_input_adapter.ambiguous_tokens) {
      if (ambiguousTokens.has(token)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["legacy_input_adapter", "ambiguous_tokens"],
          message: `duplicate ambiguous skill applicability token: ${token}`,
        });
      }
      if (conversionTokens.has(token)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["legacy_input_adapter", "ambiguous_tokens"],
          message: `legacy skill applicability token cannot be convertible and ambiguous: ${token}`,
        });
      }
      ambiguousTokens.add(token);
    }
  });

export type SkillApplicabilityIdentity = z.infer<typeof skillApplicabilityIdentitySchema>;
export type SkillApplicabilityRegistry = z.infer<typeof skillApplicabilityRegistrySchema>;

export interface SkillApplicability {
  applicable_identities: readonly SkillApplicabilityIdentity[];
  excluded_identities: readonly SkillApplicabilityIdentity[];
}

export type LegacySkillApplicabilityResult =
  | {
      disposition: "converted";
      identities: readonly SkillApplicabilityIdentity[];
      warnings: ReadonlyArray<{
        source_field: "drive_models";
        normalized_token: string;
      }>;
    }
  | { disposition: "ambiguous" | "unsupported"; token: string };

function digest(bytes: Uint8Array): string {
  return `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
}

function identityKey(identity: SkillApplicabilityIdentity): string {
  return `${identity.target_axis}:${identity.target_id}`;
}

function assertIdentityReference(
  identity: SkillApplicabilityIdentity,
  workflowRegistry: WorkflowClassificationRegistry,
  allowedAxes: ReadonlySet<string>,
): void {
  if (!allowedAxes.has(identity.target_axis)) {
    throw new Error(`skill applicability axis is not allowed: ${identity.target_axis}`);
  }
  const target = workflowRegistry.entities.find((entity) => entity.id === identity.target_id);
  if (!target) throw new Error(`unknown skill applicability identity: ${identityKey(identity)}`);
  if (target.axis !== identity.target_axis) {
    throw new Error(`skill applicability axis mismatch: ${identityKey(identity)}`);
  }
}

function revalidateInjectedBindings(
  registryInput: SkillApplicabilityRegistry,
  workflowRegistryInput: WorkflowClassificationRegistry,
  repoRoot: string,
): { registry: SkillApplicabilityRegistry; workflowRegistry: WorkflowClassificationRegistry } {
  const registry = skillApplicabilityRegistrySchema.parse(registryInput);
  const workflowRegistry = workflowClassificationRegistrySchema.parse(workflowRegistryInput);

  const authorityBytes = readFileSync(resolve(repoRoot, registry.authority.source));
  if (digest(authorityBytes) !== registry.authority.source_digest) {
    throw new Error("skill applicability requirements digest mismatch");
  }
  const workflowBytes = readFileSync(resolve(repoRoot, registry.identity_reference.source));
  if (digest(workflowBytes) !== registry.identity_reference.registry_source_digest) {
    throw new Error("skill applicability workflow registry digest mismatch");
  }
  const workflowAuthorityBytes = readFileSync(resolve(repoRoot, workflowRegistry.authority.source));
  assertWorkflowClassificationAuthorityDigest(workflowRegistry, workflowAuthorityBytes);

  if (workflowRegistry.schema_version !== registry.identity_reference.schema_version) {
    throw new Error("skill applicability workflow registry schema version mismatch");
  }
  if (workflowRegistry.registry_version !== registry.identity_reference.registry_version) {
    throw new Error("skill applicability workflow registry version mismatch");
  }

  const canonicalRegistry = loadSkillApplicabilityRegistry(repoRoot);
  const canonicalWorkflowRegistry = loadWorkflowClassificationRegistry(repoRoot);
  if (registry.registry_version !== canonicalRegistry.registry_version) {
    throw new Error("skill applicability registry version mismatch");
  }
  if (registry.authority.source_digest !== canonicalRegistry.authority.source_digest) {
    throw new Error("skill applicability requirements digest binding mismatch");
  }
  if (
    registry.identity_reference.registry_version !==
    canonicalRegistry.identity_reference.registry_version
  ) {
    throw new Error("skill applicability workflow registry version mismatch");
  }
  if (
    registry.identity_reference.registry_source_digest !==
    canonicalRegistry.identity_reference.registry_source_digest
  ) {
    throw new Error("skill applicability workflow registry digest binding mismatch");
  }
  if (workflowRegistry.registry_version !== canonicalWorkflowRegistry.registry_version) {
    throw new Error("workflow classification registry version mismatch");
  }
  if (
    workflowRegistry.authority.source_digest !== canonicalWorkflowRegistry.authority.source_digest
  ) {
    throw new Error("workflow classification requirements digest binding mismatch");
  }

  return { registry: canonicalRegistry, workflowRegistry: canonicalWorkflowRegistry };
}

export function loadSkillApplicabilityRegistry(
  repoRoot: string = PACKAGE_ROOT,
): SkillApplicabilityRegistry {
  const registry = skillApplicabilityRegistrySchema.parse(
    JSON.parse(readFileSync(resolve(repoRoot, SKILL_APPLICABILITY_REGISTRY_PATH), "utf8")),
  );
  const authorityBytes = readFileSync(resolve(repoRoot, registry.authority.source));
  if (digest(authorityBytes) !== registry.authority.source_digest) {
    throw new Error("skill applicability requirements digest mismatch");
  }
  const workflowBytes = readFileSync(resolve(repoRoot, registry.identity_reference.source));
  if (digest(workflowBytes) !== registry.identity_reference.registry_source_digest) {
    throw new Error("skill applicability workflow registry digest mismatch");
  }
  const workflowRegistry = loadWorkflowClassificationRegistry(repoRoot);
  if (workflowRegistry.registry_version !== registry.identity_reference.registry_version) {
    throw new Error("skill applicability workflow registry version mismatch");
  }
  const allowedAxes = new Set(registry.current_contract.allowed_axes);
  for (const conversion of registry.legacy_input_adapter.conversions) {
    assertIdentityReference(conversion, workflowRegistry, allowedAxes);
  }
  return registry;
}

export function parseSkillApplicability(
  input: unknown,
  options: {
    registry?: SkillApplicabilityRegistry;
    workflowRegistry?: WorkflowClassificationRegistry;
  } = {},
): SkillApplicability {
  let registry =
    options.registry === undefined ? loadSkillApplicabilityRegistry() : options.registry;
  let workflowRegistry =
    options.workflowRegistry === undefined
      ? loadWorkflowClassificationRegistry()
      : options.workflowRegistry;
  if (options.registry !== undefined || options.workflowRegistry !== undefined) {
    ({ registry, workflowRegistry } = revalidateInjectedBindings(
      registry,
      workflowRegistry,
      process.cwd(),
    ));
  }
  const parsed = z
    .object({
      applicable_identities: z.array(skillApplicabilityIdentitySchema).min(1).readonly(),
      excluded_identities: z.array(skillApplicabilityIdentitySchema).readonly().default([]),
    })
    .strict()
    .parse(input);
  const allowedAxes = new Set(registry.current_contract.allowed_axes);
  const positive = new Set<string>();
  for (const identity of parsed.applicable_identities) {
    assertIdentityReference(identity, workflowRegistry, allowedAxes);
    const key = identityKey(identity);
    if (positive.has(key)) throw new Error(`duplicate skill applicability identity: ${key}`);
    positive.add(key);
  }
  const negative = new Set<string>();
  for (const identity of parsed.excluded_identities) {
    assertIdentityReference(identity, workflowRegistry, allowedAxes);
    const key = identityKey(identity);
    if (negative.has(key)) throw new Error(`duplicate skill exclusion identity: ${key}`);
    if (positive.has(key)) throw new Error(`skill applicability polarity conflict: ${key}`);
    negative.add(key);
  }
  return parsed;
}

export function adaptLegacySkillApplicability(
  tokens: readonly string[],
  registry: SkillApplicabilityRegistry = loadSkillApplicabilityRegistry(),
): LegacySkillApplicabilityResult {
  if (tokens.length === 0) return { disposition: "unsupported", token: "" };
  const conversions = new Map(
    registry.legacy_input_adapter.conversions.map((item) => [item.token, item] as const),
  );
  const ambiguous = new Set(registry.legacy_input_adapter.ambiguous_tokens);
  const identities: SkillApplicabilityIdentity[] = [];
  const warnings: Array<{ source_field: "drive_models"; normalized_token: string }> = [];
  const seen = new Set<string>();
  for (const rawToken of tokens) {
    const token = rawToken.trim().toLocaleLowerCase("en-US").replaceAll("_", "-");
    if (ambiguous.has(token)) return { disposition: "ambiguous", token };
    const conversion = conversions.get(token);
    if (!conversion) return { disposition: "unsupported", token };
    const identity = {
      target_axis: conversion.target_axis,
      target_id: conversion.target_id,
    };
    const key = identityKey(identity);
    if (!seen.has(key)) {
      identities.push(identity);
      seen.add(key);
    }
    warnings.push({ source_field: "drive_models", normalized_token: token });
  }
  return {
    disposition: "converted",
    identities: Object.freeze(identities),
    warnings: Object.freeze(warnings),
  };
}

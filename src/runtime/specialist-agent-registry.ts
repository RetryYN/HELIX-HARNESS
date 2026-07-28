import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { isAbsolute, join } from "node:path";
import { z } from "zod";
import { MODEL_IDS } from "../schema/model-registry";
import { CODEX_AGENT_TYPE_ALLOWLIST, SUBAGENT_ALLOWLIST } from "./agent-guard-policy";

export const SPECIALIST_AGENT_REGISTRY_VERSION = "specialist-agent-registry.v1" as const;
export const SPECIALIST_DRIVES = ["be", "fe", "fullstack", "db", "agent"] as const;

const digestSchema = z.string().regex(/^sha256:[a-f0-9]{64}$/);
const idSchema = z.string().regex(/^[a-z0-9][a-z0-9-]*$/);
const repoRelativePathSchema = z
  .string()
  .min(1)
  .refine(
    (path) =>
      !isAbsolute(path) &&
      !path.includes("\\") &&
      !path.includes("\0") &&
      path.split("/").every((part) => part !== "" && part !== "." && part !== ".."),
    "sync source path must be a safe POSIX repository-relative path",
  );

export const specialistAgentRegistryEntrySchema = z
  .object({
    agent_id: idSchema,
    runtime: z.enum(["claude", "codex"]),
    launch_id: idSchema,
    role: idSchema,
    authority: z.enum(["worker", "verifier"]),
    drives: z.array(z.enum(SPECIALIST_DRIVES)).min(1),
    capabilities: z.array(idSchema).min(1),
    model_class: idSchema,
    provider_family: z.enum(["claude", "codex"]),
    verification_axes: z.array(idSchema),
    sync_source: z
      .object({
        kind: z.literal("repository_file"),
        path: repoRelativePathSchema,
        digest: digestSchema,
      })
      .strict(),
    allowlist_source: z.enum(["claude_subagent", "codex_agent_type"]),
  })
  .strict()
  .superRefine((entry, ctx) => {
    const expected = entry.runtime === "claude" ? "claude_subagent" : "codex_agent_type";
    if (entry.allowlist_source !== expected) {
      ctx.addIssue({
        code: "custom",
        path: ["allowlist_source"],
        message: `runtime=${entry.runtime} requires allowlist_source=${expected}`,
      });
    }
    if (entry.provider_family !== entry.runtime) {
      ctx.addIssue({
        code: "custom",
        path: ["provider_family"],
        message: "provider_family must equal the launch runtime",
      });
    }
    if (entry.authority === "verifier" && entry.verification_axes.length === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["verification_axes"],
        message: "verifier requires at least one verification axis",
      });
    }
  });

export const specialistAgentRegistrySchema = z
  .object({
    schema_version: z.literal(SPECIALIST_AGENT_REGISTRY_VERSION),
    entries: z.array(specialistAgentRegistryEntrySchema).min(1),
  })
  .strict();

export type SpecialistAgentRegistry = z.infer<typeof specialistAgentRegistrySchema>;
export type SpecialistAgentRegistryEntry = z.infer<typeof specialistAgentRegistryEntrySchema>;

export type SpecialistAgentRegistryFindingCode =
  | "registry_missing"
  | "registry_schema_invalid"
  | "duplicate_agent_id"
  | "definition_missing"
  | "definition_digest_mismatch"
  | "launch_not_allowlisted"
  | "model_class_not_in_ssot"
  | "worker_missing"
  | "verifier_missing"
  | "independent_verifier_missing";

export interface SpecialistAgentRegistryFinding {
  code: SpecialistAgentRegistryFindingCode;
  subject: string;
  message: string;
}

export interface SpecialistAgentRegistryResult {
  ok: boolean;
  registry: SpecialistAgentRegistry | null;
  findings: SpecialistAgentRegistryFinding[];
}

export interface SpecialistTeamRequest {
  drive: (typeof SPECIALIST_DRIVES)[number];
  required_capabilities: string[];
  required_verification_axes: string[];
}

export interface SpecialistTeamSelection {
  ok: boolean;
  worker: SpecialistAgentRegistryEntry | null;
  verifiers: SpecialistAgentRegistryEntry[];
  findings: SpecialistAgentRegistryFinding[];
}

function sha256(bytes: Buffer): string {
  return `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
}

function sortedUnique(values: readonly string[]): string[] {
  return [...new Set(values.map((value) => value.trim().toLowerCase()).filter(Boolean))].sort();
}

function entryAllowsLaunch(entry: SpecialistAgentRegistryEntry): boolean {
  return entry.runtime === "claude"
    ? SUBAGENT_ALLOWLIST.has(entry.launch_id)
    : CODEX_AGENT_TYPE_ALLOWLIST.has(entry.launch_id);
}

function entryModelClassExists(entry: SpecialistAgentRegistryEntry): boolean {
  return Object.hasOwn(MODEL_IDS[entry.provider_family], entry.model_class);
}

export function analyzeSpecialistAgentRegistry(input: {
  raw_registry: unknown;
  definition_digests: Readonly<Record<string, string | null>>;
}): SpecialistAgentRegistryResult {
  const parsed = specialistAgentRegistrySchema.safeParse(input.raw_registry);
  if (!parsed.success) {
    return {
      ok: false,
      registry: null,
      findings: [
        {
          code: "registry_schema_invalid",
          subject: "config/specialist-agent-registry.json",
          message: parsed.error.issues.map((issue) => issue.message).join("; "),
        },
      ],
    };
  }
  const findings: SpecialistAgentRegistryFinding[] = [];
  const ids = new Set<string>();
  for (const entry of parsed.data.entries) {
    if (ids.has(entry.agent_id)) {
      findings.push({
        code: "duplicate_agent_id",
        subject: entry.agent_id,
        message: "agent_id must be unique",
      });
    }
    ids.add(entry.agent_id);
    const actual = input.definition_digests[entry.sync_source.path];
    if (actual === null || actual === undefined) {
      findings.push({
        code: "definition_missing",
        subject: entry.sync_source.path,
        message: "sync source is missing",
      });
    } else if (actual !== entry.sync_source.digest) {
      findings.push({
        code: "definition_digest_mismatch",
        subject: entry.agent_id,
        message: `expected=${entry.sync_source.digest} actual=${actual}`,
      });
    }
    if (!entryAllowsLaunch(entry)) {
      findings.push({
        code: "launch_not_allowlisted",
        subject: entry.agent_id,
        message: `${entry.runtime}:${entry.launch_id} is not allowlisted`,
      });
    }
    if (!entryModelClassExists(entry)) {
      findings.push({
        code: "model_class_not_in_ssot",
        subject: entry.agent_id,
        message: `${entry.provider_family}:${entry.model_class} is not defined by MODEL_IDS`,
      });
    }
  }
  return {
    ok: findings.length === 0,
    registry: parsed.data,
    findings,
  };
}

export function loadSpecialistAgentRegistry(repoRoot: string): SpecialistAgentRegistryResult {
  const registryPath = join(repoRoot, "config", "specialist-agent-registry.json");
  if (!existsSync(registryPath)) {
    return {
      ok: false,
      registry: null,
      findings: [
        {
          code: "registry_missing",
          subject: "config/specialist-agent-registry.json",
          message: "specialist agent registry is missing",
        },
      ],
    };
  }
  let raw: unknown;
  try {
    raw = JSON.parse(readFileSync(registryPath, "utf8")) as unknown;
  } catch {
    return {
      ok: false,
      registry: null,
      findings: [
        {
          code: "registry_schema_invalid",
          subject: "config/specialist-agent-registry.json",
          message: "registry JSON is invalid",
        },
      ],
    };
  }
  const parsed = specialistAgentRegistrySchema.safeParse(raw);
  if (!parsed.success)
    return analyzeSpecialistAgentRegistry({ raw_registry: raw, definition_digests: {} });
  const definitionDigests: Record<string, string | null> = {};
  for (const path of new Set(parsed.data.entries.map((entry) => entry.sync_source.path))) {
    const absolute = join(repoRoot, path);
    definitionDigests[path] = existsSync(absolute) ? sha256(readFileSync(absolute)) : null;
  }
  return analyzeSpecialistAgentRegistry({
    raw_registry: raw,
    definition_digests: definitionDigests,
  });
}

export function selectSpecialistTeam(
  analysis: SpecialistAgentRegistryResult,
  request: SpecialistTeamRequest,
): SpecialistTeamSelection {
  if (!analysis.ok || !analysis.registry) {
    return { ok: false, worker: null, verifiers: [], findings: [...analysis.findings] };
  }
  const capabilities = sortedUnique(request.required_capabilities);
  const axes = sortedUnique(request.required_verification_axes);
  const entries = [...analysis.registry.entries].sort((left, right) =>
    left.agent_id.localeCompare(right.agent_id),
  );
  const worker =
    entries.find(
      (entry) =>
        entry.authority === "worker" &&
        entry.drives.includes(request.drive) &&
        capabilities.every((capability) => entry.capabilities.includes(capability)),
    ) ?? null;
  if (!worker) {
    return {
      ok: false,
      worker: null,
      verifiers: [],
      findings: [
        {
          code: "worker_missing",
          subject: request.drive,
          message: `no worker covers capabilities=${capabilities.join(",")}`,
        },
      ],
    };
  }
  const verifiers: SpecialistAgentRegistryEntry[] = [];
  const findings: SpecialistAgentRegistryFinding[] = [];
  for (const axis of axes) {
    const candidates = entries.filter(
      (entry) =>
        entry.authority === "verifier" &&
        entry.drives.includes(request.drive) &&
        entry.verification_axes.includes(axis),
    );
    if (candidates.length === 0) {
      findings.push({
        code: "verifier_missing",
        subject: axis,
        message: `no verifier covers drive=${request.drive}`,
      });
      continue;
    }
    const independent = candidates.find(
      (entry) => entry.provider_family !== worker.provider_family,
    );
    if (!independent) {
      findings.push({
        code: "independent_verifier_missing",
        subject: axis,
        message: `no cross-provider verifier for worker=${worker.agent_id}`,
      });
      continue;
    }
    if (!verifiers.some((entry) => entry.agent_id === independent.agent_id)) {
      verifiers.push(independent);
    }
  }
  return {
    ok: findings.length === 0,
    worker,
    verifiers,
    findings,
  };
}

export function specialistAgentRegistryMessages(result: SpecialistAgentRegistryResult): string[] {
  if (result.ok) {
    return [
      `specialist-agent-registry - OK (entries=${result.registry?.entries.length ?? 0}, definition/allowlist drift=0)`,
    ];
  }
  const sample = result.findings
    .slice(0, 5)
    .map((finding) => `${finding.code}:${finding.subject}`)
    .join(", ");
  return [`specialist-agent-registry - violation ${result.findings.length} (${sample})`];
}

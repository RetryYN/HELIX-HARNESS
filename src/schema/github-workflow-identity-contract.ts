import { z } from "zod";
import {
  resolveWorkflowClassificationSignalToken,
  type WorkflowClassificationCatalog,
} from "./workflow-classification-catalog.js";
import { workflowClassificationAxisSchema } from "./workflow-classification-registry.js";

export const GITHUB_WORKFLOW_IDENTITY_CONTRACT_SCHEMA =
  "helix-github-workflow-identity-contract.v1" as const;
export const GITHUB_WORKFLOW_IDENTITY_CONTRACT_MARKER =
  "<!-- HELIX:github-workflow-identity-contract:v1 -->" as const;

const digestSchema = z.string().regex(/^sha256:[a-f0-9]{64}$/u);
const identityIdSchema = z.string().regex(/^[A-Z][A-Z0-9_]*$/u);

export const githubWorkflowIdentityContractSchema = z
  .object({
    schema_version: z.literal(GITHUB_WORKFLOW_IDENTITY_CONTRACT_SCHEMA),
    registry_version: z.string().regex(/^\d+\.\d+\.\d+$/u),
    registry_source_digest: digestSchema,
    target_axis: workflowClassificationAxisSchema,
    target_id: identityIdSchema,
    signal_tokens: z.array(z.string().trim().min(1)).max(16).optional(),
  })
  .strict();

export type GithubWorkflowIdentityContract = z.infer<typeof githubWorkflowIdentityContractSchema>;

export type GithubWorkflowIdentityContractFailureReason =
  | "workflow_identity_contract_missing"
  | "workflow_identity_contract_duplicate"
  | "workflow_identity_contract_json_invalid"
  | "workflow_identity_contract_schema_invalid"
  | "workflow_identity_contract_legacy_field_forbidden"
  | "workflow_identity_contract_authority_drift"
  | "workflow_identity_contract_identity_unknown"
  | "workflow_identity_contract_signal_unknown"
  | "workflow_identity_contract_signal_decision_required"
  | "workflow_identity_contract_signal_ambiguous"
  | "workflow_identity_contract_signal_mismatch"
  | "workflow_identity_contract_issue_pr_mismatch";

export type GithubWorkflowIdentityContractResult =
  | { ok: true; contract: GithubWorkflowIdentityContract }
  | { ok: false; reason: GithubWorkflowIdentityContractFailureReason; detail: string };

const LEGACY_IDENTITY_FIELDS = new Set([
  "mode",
  "model",
  "route_mode",
  "catalog_route_id",
  "route_class",
]);

function objectValue(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function markedJsonBlocks(body: string): string[] {
  const suffix = body.split(GITHUB_WORKFLOW_IDENTITY_CONTRACT_MARKER)[1] ?? "";
  const match = suffix.match(/^[ \t]*\r?\n```json[ \t]*\r?\n([\s\S]*?)\r?\n```/u);
  return match ? [match[1] ?? ""] : [];
}

function markerCount(body: string): number {
  return body.split(GITHUB_WORKFLOW_IDENTITY_CONTRACT_MARKER).length - 1;
}

function signalFailureReason(
  disposition: "unknown" | "decision_required" | "ambiguous",
): GithubWorkflowIdentityContractFailureReason {
  return `workflow_identity_contract_signal_${disposition}`;
}

export function parseGithubWorkflowIdentityContract(
  body: string,
  catalog: WorkflowClassificationCatalog,
): GithubWorkflowIdentityContractResult {
  const markers = markerCount(body);
  if (markers === 0) {
    return { ok: false, reason: "workflow_identity_contract_missing", detail: "marker absent" };
  }
  if (markers !== 1) {
    return {
      ok: false,
      reason: "workflow_identity_contract_duplicate",
      detail: `marker_count=${markers}`,
    };
  }
  const blocks = markedJsonBlocks(body);
  if (blocks.length !== 1) {
    return {
      ok: false,
      reason: "workflow_identity_contract_json_invalid",
      detail: "marker must be followed by one fenced json object",
    };
  }
  let raw: unknown;
  try {
    raw = JSON.parse(blocks[0] ?? "");
  } catch {
    return {
      ok: false,
      reason: "workflow_identity_contract_json_invalid",
      detail: "json parse failed",
    };
  }
  const record = objectValue(raw);
  if (record && Object.keys(record).some((field) => LEGACY_IDENTITY_FIELDS.has(field))) {
    return {
      ok: false,
      reason: "workflow_identity_contract_legacy_field_forbidden",
      detail: Object.keys(record)
        .filter((field) => LEGACY_IDENTITY_FIELDS.has(field))
        .sort()
        .join(","),
    };
  }
  const parsed = githubWorkflowIdentityContractSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      reason: "workflow_identity_contract_schema_invalid",
      detail: parsed.error.issues.map((issue) => issue.path.join(".") || "root").join(","),
    };
  }
  const contract = parsed.data;
  if (
    contract.registry_version !== catalog.source_registry.registry_version ||
    contract.registry_source_digest !== catalog.source_registry.registry_source_digest
  ) {
    return {
      ok: false,
      reason: "workflow_identity_contract_authority_drift",
      detail: `${contract.registry_version}:${contract.registry_source_digest}`,
    };
  }
  const identityExists = catalog.entities.some(
    (entity) => entity.axis === contract.target_axis && entity.id === contract.target_id,
  );
  if (!identityExists) {
    return {
      ok: false,
      reason: "workflow_identity_contract_identity_unknown",
      detail: `${contract.target_axis}:${contract.target_id}`,
    };
  }
  for (const token of contract.signal_tokens ?? []) {
    const resolution = resolveWorkflowClassificationSignalToken(token, catalog);
    if (resolution.disposition !== "classified") {
      return {
        ok: false,
        reason: signalFailureReason(resolution.disposition),
        detail: token,
      };
    }
    if (
      resolution.target_axis !== contract.target_axis ||
      resolution.target_id !== contract.target_id
    ) {
      return {
        ok: false,
        reason: "workflow_identity_contract_signal_mismatch",
        detail: `${token}->${resolution.target_axis}:${resolution.target_id}`,
      };
    }
  }
  return { ok: true, contract };
}

export function compareIssuePrWorkflowIdentityContracts(
  issue: GithubWorkflowIdentityContract,
  pullRequest: GithubWorkflowIdentityContract,
): GithubWorkflowIdentityContractResult {
  const fields = [
    "registry_version",
    "registry_source_digest",
    "target_axis",
    "target_id",
  ] as const;
  const mismatches = fields.filter((field) => issue[field] !== pullRequest[field]);
  if (mismatches.length > 0) {
    return {
      ok: false,
      reason: "workflow_identity_contract_issue_pr_mismatch",
      detail: mismatches.join(","),
    };
  }
  return { ok: true, contract: pullRequest };
}

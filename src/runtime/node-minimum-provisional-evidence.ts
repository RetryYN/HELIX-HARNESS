import { createHash } from "node:crypto";

export const NODE_MINIMUM_PROVISIONAL_WORKFLOWS = [
  "build",
  "install",
  "source-cli",
  "sqlite",
  "test",
  "typecheck",
] as const;

export type NodeMinimumProvisionalFailure =
  | "HIL_NODE_AUTHORITY_BINDING_INVALID"
  | "HIL_NODE_WORKFLOW_SET_INVALID"
  | "HIL_NODE_WORKFLOW_UNVERIFIED";

export interface NodeMinimumAuthorityBinding {
  authority_head: string;
  node_version: string;
  npm_version: string;
  lock_digest: string;
  tree_digest: string;
  sqlite_api: string;
  sqlite_version: string;
  sqlite_compile_options_digest: string;
  artifact_digest: string;
}

export interface NodeMinimumWorkflowEvidence {
  workflow_id: string;
  evidence_digest: string;
  green: boolean;
}

export interface NodeMinimumProvisionalReceipt {
  schema_version: "helix-node-minimum-provisional-receipt.v1";
  status: "pass" | "blocked";
  terminal: false;
  authority_binding: NodeMinimumAuthorityBinding;
  required_workflow_ids: readonly string[];
  workflow_evidence: readonly NodeMinimumWorkflowEvidence[];
  failures: readonly NodeMinimumProvisionalFailure[];
  receipt_digest: string;
}

function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value !== null && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, child]) => `${JSON.stringify(key)}:${canonical(child)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

function digest(value: unknown): string {
  return createHash("sha256").update(canonical(value), "utf8").digest("hex");
}

const SHA256 = /^[0-9a-f]{64}$/;
const GIT_SHA = /^[0-9a-f]{40}$/;
const VERSION = /^\d+\.\d+\.\d+$/;

function bindingValid(binding: NodeMinimumAuthorityBinding): boolean {
  return (
    GIT_SHA.test(binding.authority_head) &&
    binding.node_version === "24.15.0" &&
    binding.npm_version === "11.12.1" &&
    SHA256.test(binding.lock_digest) &&
    SHA256.test(binding.tree_digest) &&
    binding.sqlite_api === "node:sqlite" &&
    VERSION.test(binding.sqlite_version) &&
    SHA256.test(binding.sqlite_compile_options_digest) &&
    SHA256.test(binding.artifact_digest)
  );
}

export function evaluateNodeMinimumProvisional(
  binding: NodeMinimumAuthorityBinding,
  workflows: readonly NodeMinimumWorkflowEvidence[],
): NodeMinimumProvisionalReceipt {
  const ordered = [...workflows].sort((left, right) =>
    left.workflow_id.localeCompare(right.workflow_id),
  );
  const failures: NodeMinimumProvisionalFailure[] = [];
  if (!bindingValid(binding)) failures.push("HIL_NODE_AUTHORITY_BINDING_INVALID");

  const ids = ordered.map((row) => row.workflow_id);
  const uniqueIds = new Set(ids);
  const exactSet =
    ids.length === NODE_MINIMUM_PROVISIONAL_WORKFLOWS.length &&
    uniqueIds.size === ids.length &&
    NODE_MINIMUM_PROVISIONAL_WORKFLOWS.every((id) => uniqueIds.has(id));
  if (!exactSet) failures.push("HIL_NODE_WORKFLOW_SET_INVALID");
  if (ordered.some((row) => !row.green || !SHA256.test(row.evidence_digest)))
    failures.push("HIL_NODE_WORKFLOW_UNVERIFIED");

  const core = {
    schema_version: "helix-node-minimum-provisional-receipt.v1" as const,
    status: failures.length === 0 ? ("pass" as const) : ("blocked" as const),
    terminal: false as const,
    authority_binding: { ...binding },
    required_workflow_ids: [...NODE_MINIMUM_PROVISIONAL_WORKFLOWS],
    workflow_evidence: ordered,
    failures: [...new Set(failures)].sort(),
  };
  return { ...core, receipt_digest: digest(core) };
}

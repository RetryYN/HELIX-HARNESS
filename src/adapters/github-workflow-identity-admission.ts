import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { z } from "zod";
import { parseMarkdownFrontmatter } from "../lint/shared.js";
import {
  compareIssuePrWorkflowIdentityContracts,
  GITHUB_WORKFLOW_IDENTITY_CONTRACT_MARKER,
  type GithubWorkflowIdentityContractFailureReason,
  parseGithubWorkflowIdentityContract,
} from "../schema/github-workflow-identity-contract.js";
import { loadWorkflowClassificationCatalog } from "../schema/workflow-classification-catalog.js";
import { workflowClassificationAxisSchema } from "../schema/workflow-classification-registry.js";

type GhApi = (endpoint: string) => unknown;

const planIdentitySchema = z
  .object({
    schema_version: z.literal("helix-plan-workflow-identity.v1"),
    registry_version: z.string().regex(/^\d+\.\d+\.\d+$/u),
    registry_source_digest: z.string().regex(/^sha256:[a-f0-9]{64}$/u),
    target_axis: workflowClassificationAxisSchema,
    target_id: z.string().regex(/^[A-Z][A-Z0-9_]*$/u),
  })
  .strict();

const typedPlanSchema = z.object({
  plan_id: z.string().min(1),
  github_issue_id: z.number().int().positive(),
  workflow_identity: planIdentitySchema,
});

export type GithubWorkflowIdentityAdmissionReason =
  | "workflow_identity_admission_multiple_plans"
  | "workflow_identity_admission_plan_invalid"
  | "workflow_identity_admission_authority_invalid"
  | "workflow_identity_admission_issue_api_failed"
  | "workflow_identity_admission_issue_invalid"
  | "workflow_identity_admission_plan_mismatch"
  | GithubWorkflowIdentityContractFailureReason;

export type GithubWorkflowIdentityAdmissionResult =
  | { ok: true; applicable: false; reason: "legacy_plan_without_typed_identity" }
  | {
      ok: true;
      applicable: true;
      plan_id: string;
      source_issue: number;
      target_axis: string;
      target_id: string;
    }
  | { ok: false; applicable: true; reason: GithubWorkflowIdentityAdmissionReason; detail: string };

function object(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function defaultGhApi(endpoint: string): unknown {
  return JSON.parse(
    execFileSync("gh", ["api", endpoint], { encoding: "utf8", maxBuffer: 8 * 1024 * 1024 }),
  ) as unknown;
}

export function admitGithubWorkflowIdentity(input: {
  repository: string;
  prBody: string;
  changedPaths: string[];
  repoRoot?: string;
  ghApi?: GhApi;
}): GithubWorkflowIdentityAdmissionResult {
  const repoRoot = input.repoRoot ?? process.cwd();
  let typedPlans: Array<{ path: string; frontmatter: Record<string, unknown> }>;
  try {
    typedPlans = input.changedPaths
      .filter((path) => /^docs\/plans\/PLAN-[^/]+\.md$/u.test(path))
      .flatMap((path) => {
        const frontmatter = parseMarkdownFrontmatter(readFileSync(resolve(repoRoot, path), "utf8"));
        return frontmatter?.workflow_identity === undefined ? [] : [{ path, frontmatter }];
      });
  } catch (error) {
    return {
      ok: false,
      applicable: true,
      reason: "workflow_identity_admission_plan_invalid",
      detail: error instanceof Error ? error.message : "PLAN read failed",
    };
  }
  if (typedPlans.length === 0) {
    return { ok: true, applicable: false, reason: "legacy_plan_without_typed_identity" };
  }
  if (typedPlans.length !== 1) {
    return {
      ok: false,
      applicable: true,
      reason: "workflow_identity_admission_multiple_plans",
      detail: typedPlans
        .map(({ path }) => path)
        .sort()
        .join(","),
    };
  }
  const plan = typedPlanSchema.safeParse(typedPlans[0]?.frontmatter);
  if (!plan.success) {
    return {
      ok: false,
      applicable: true,
      reason: "workflow_identity_admission_plan_invalid",
      detail: plan.error.issues.map((issue) => issue.path.join(".") || "root").join(","),
    };
  }
  const api = input.ghApi ?? defaultGhApi;
  let issue: Record<string, unknown> | null;
  try {
    issue = object(api(`repos/${input.repository}/issues/${plan.data.github_issue_id}`));
  } catch (error) {
    return {
      ok: false,
      applicable: true,
      reason: "workflow_identity_admission_issue_api_failed",
      detail: error instanceof Error ? error.message : `issue=${plan.data.github_issue_id}`,
    };
  }
  if (
    !issue ||
    issue.number !== plan.data.github_issue_id ||
    issue.pull_request !== undefined ||
    typeof issue.body !== "string"
  ) {
    return {
      ok: false,
      applicable: true,
      reason: "workflow_identity_admission_issue_invalid",
      detail: `issue=${plan.data.github_issue_id}`,
    };
  }
  let catalog: ReturnType<typeof loadWorkflowClassificationCatalog>;
  try {
    catalog = loadWorkflowClassificationCatalog(repoRoot);
  } catch (error) {
    return {
      ok: false,
      applicable: true,
      reason: "workflow_identity_admission_authority_invalid",
      detail: error instanceof Error ? error.message : "classification authority load failed",
    };
  }
  const issueContract = parseGithubWorkflowIdentityContract(issue.body, catalog);
  if (!issueContract.ok) return { ...issueContract, applicable: true };
  const prContract = parseGithubWorkflowIdentityContract(input.prBody, catalog);
  if (!prContract.ok) return { ...prContract, applicable: true };
  const pair = compareIssuePrWorkflowIdentityContracts(issueContract.contract, prContract.contract);
  if (!pair.ok) return { ...pair, applicable: true };
  const planIdentity = plan.data.workflow_identity;
  const mismatches = [
    "registry_version",
    "registry_source_digest",
    "target_axis",
    "target_id",
  ].filter(
    (field) =>
      planIdentity[field as keyof typeof planIdentity] !==
      prContract.contract[field as keyof typeof prContract.contract],
  );
  if (mismatches.length > 0) {
    return {
      ok: false,
      applicable: true,
      reason: "workflow_identity_admission_plan_mismatch",
      detail: mismatches.join(","),
    };
  }
  return {
    ok: true,
    applicable: true,
    plan_id: plan.data.plan_id,
    source_issue: plan.data.github_issue_id,
    target_axis: planIdentity.target_axis,
    target_id: planIdentity.target_id,
  };
}

export function githubWorkflowIdentityAdmissionMessage(
  result: GithubWorkflowIdentityAdmissionResult,
): string {
  if (result.ok && !result.applicable)
    return `github workflow-identity-admission: skipped ${result.reason}`;
  if (result.ok) {
    return `github workflow-identity-admission: ok plan=${result.plan_id} issue=${result.source_issue} identity=${result.target_axis}:${result.target_id}`;
  }
  return `github workflow-identity-admission: blocked ${result.reason} ${result.detail}`;
}

export { GITHUB_WORKFLOW_IDENTITY_CONTRACT_MARKER };

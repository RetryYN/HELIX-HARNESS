import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { z } from "zod";
import { parseMarkdownFrontmatter } from "../lint/shared.js";
import {
  compareIssuePrWorkflowIdentityContracts,
  GITHUB_WORKFLOW_IDENTITY_CONTRACT_MARKER,
  type GithubWorkflowIdentityContractFailureReason,
  type GithubWorkflowIdentityContractResult,
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

export const GITHUB_WORKFLOW_IDENTITY_MIGRATION_BUNDLE_MARKER =
  "<!-- HELIX:github-workflow-identity-migration-bundle:v1 -->" as const;
export const GITHUB_WORKFLOW_IDENTITY_TERMINAL_BUNDLE_MARKER =
  "<!-- HELIX:github-workflow-identity-terminal-bundle:v1 -->" as const;

const planPathSchema = z.string().regex(/^docs\/plans\/PLAN-[^/]+\.md$/u);
const migrationBundleSchema = z
  .object({
    schema_version: z.literal("helix-github-workflow-identity-migration-bundle.v1"),
    owner_plan: planPathSchema,
    plan_paths: z.array(planPathSchema).min(2),
  })
  .strict();
const terminalBundleSchema = z
  .object({
    schema_version: z.literal("helix-github-workflow-identity-terminal-bundle.v1"),
    owner_plan: planPathSchema,
    plan_paths: z.array(planPathSchema).min(2),
  })
  .strict();

export type GithubWorkflowIdentityAdmissionReason =
  | "workflow_identity_admission_multiple_plans"
  | "workflow_identity_admission_plan_invalid"
  | "workflow_identity_admission_authority_invalid"
  | "workflow_identity_admission_issue_api_failed"
  | "workflow_identity_admission_issue_invalid"
  | "workflow_identity_admission_plan_mismatch"
  | "workflow_identity_admission_bundle_contract_invalid"
  | "workflow_identity_admission_bundle_path_mismatch"
  | "workflow_identity_admission_bundle_authority_path_missing"
  | "workflow_identity_admission_bundle_owner_invalid"
  | "workflow_identity_admission_bundle_identity_mismatch"
  | "workflow_identity_admission_bundle_issue_mismatch"
  | GithubWorkflowIdentityAdmissionContractFailureReason
  | GithubWorkflowIdentityContractFailureReason;

export type GithubWorkflowIdentityContractSurface = "issue" | "pr";

export type GithubWorkflowIdentityAdmissionContractFailureReason =
  `${GithubWorkflowIdentityContractSurface}_${GithubWorkflowIdentityContractFailureReason}`;

export type GithubWorkflowIdentityAdmissionResult =
  | {
      ok: true;
      applicable: false;
      reason: "legacy_plan_without_typed_identity";
    }
  | {
      ok: true;
      applicable: true;
      plan_id: string;
      source_issue: number;
      target_axis: string;
      target_id: string;
      migration_bundle?: true;
      terminal_bundle?: true;
    }
  | {
      ok: false;
      applicable: true;
      reason: GithubWorkflowIdentityAdmissionReason;
      detail: string;
    };

function object(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

type GithubWorkflowIdentityContractFailure = Extract<
  GithubWorkflowIdentityContractResult,
  { ok: false }
>;

function mapContractFailure(
  surface: GithubWorkflowIdentityContractSurface,
  failure: GithubWorkflowIdentityContractFailure,
): Extract<GithubWorkflowIdentityAdmissionResult, { ok: false }> {
  return {
    ok: false,
    applicable: true,
    reason: `${surface}_${failure.reason}` as GithubWorkflowIdentityAdmissionContractFailureReason,
    detail: failure.detail,
  };
}

function defaultGhApi(endpoint: string): unknown {
  return JSON.parse(
    execFileSync("gh", ["api", endpoint], {
      encoding: "utf8",
      maxBuffer: 8 * 1024 * 1024,
    }),
  ) as unknown;
}

function parseMigrationBundle(
  body: string,
): { ok: true; bundle: z.infer<typeof migrationBundleSchema> } | { ok: false; detail: string } {
  const count = body.split(GITHUB_WORKFLOW_IDENTITY_MIGRATION_BUNDLE_MARKER).length - 1;
  if (count !== 1) return { ok: false, detail: `marker_count=${count}` };
  const suffix = body.split(GITHUB_WORKFLOW_IDENTITY_MIGRATION_BUNDLE_MARKER)[1] ?? "";
  const match = suffix.match(/^[ \t]*\r?\n```json[ \t]*\r?\n([\s\S]*?)\r?\n```/u);
  if (!match)
    return {
      ok: false,
      detail: "marker must be followed by one fenced json object",
    };
  let raw: unknown;
  try {
    raw = JSON.parse(match[1] ?? "");
  } catch {
    return { ok: false, detail: "json parse failed" };
  }
  const parsed = migrationBundleSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      detail: parsed.error.issues.map((issue) => issue.path.join(".") || "root").join(","),
    };
  }
  const sorted = [...parsed.data.plan_paths].sort();
  if (
    new Set(sorted).size !== sorted.length ||
    JSON.stringify(sorted) !== JSON.stringify(parsed.data.plan_paths)
  ) {
    return { ok: false, detail: "plan_paths must be unique and sorted" };
  }
  return { ok: true, bundle: parsed.data };
}

function parseTerminalBundle(
  body: string,
): { ok: true; bundle: z.infer<typeof terminalBundleSchema> } | { ok: false; detail: string } {
  const count = body.split(GITHUB_WORKFLOW_IDENTITY_TERMINAL_BUNDLE_MARKER).length - 1;
  if (count !== 1) return { ok: false, detail: `marker_count=${count}` };
  const suffix = body.split(GITHUB_WORKFLOW_IDENTITY_TERMINAL_BUNDLE_MARKER)[1] ?? "";
  const match = suffix.match(/^[ \t]*\r?\n```json[ \t]*\r?\n([\s\S]*?)\r?\n```/u);
  if (!match) {
    return { ok: false, detail: "marker must be followed by one fenced json object" };
  }
  let raw: unknown;
  try {
    raw = JSON.parse(match[1] ?? "");
  } catch {
    return { ok: false, detail: "json parse failed" };
  }
  const parsed = terminalBundleSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      detail: parsed.error.issues.map((issue) => issue.path.join(".") || "root").join(","),
    };
  }
  const sorted = [...parsed.data.plan_paths].sort();
  if (
    new Set(sorted).size !== sorted.length ||
    JSON.stringify(sorted) !== JSON.stringify(parsed.data.plan_paths)
  ) {
    return { ok: false, detail: "plan_paths must be unique and sorted" };
  }
  return { ok: true, bundle: parsed.data };
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
  const migrationBundleRequested = input.prBody.includes(
    GITHUB_WORKFLOW_IDENTITY_MIGRATION_BUNDLE_MARKER,
  );
  const terminalBundleRequested = input.prBody.includes(
    GITHUB_WORKFLOW_IDENTITY_TERMINAL_BUNDLE_MARKER,
  );
  if (migrationBundleRequested && terminalBundleRequested) {
    return {
      ok: false,
      applicable: true,
      reason: "workflow_identity_admission_bundle_contract_invalid",
      detail: "migration_and_terminal_markers_both_present",
    };
  }
  if (typedPlans.length === 0 && !migrationBundleRequested && !terminalBundleRequested) {
    return {
      ok: true,
      applicable: false,
      reason: "legacy_plan_without_typed_identity",
    };
  }
  let migrationBundle = false;
  let terminalBundle = false;
  let selectedPlan: (typeof typedPlans)[number] | undefined = typedPlans[0];
  if (migrationBundleRequested) {
    const parsedBundle = parseMigrationBundle(input.prBody);
    if (!parsedBundle.ok) {
      return {
        ok: false,
        applicable: true,
        reason: "workflow_identity_admission_bundle_contract_invalid",
        detail: parsedBundle.detail,
      };
    }
    const actualPlanPaths = input.changedPaths
      .filter((path) => /^docs\/plans\/PLAN-[^/]+\.md$/u.test(path))
      .sort();
    if (JSON.stringify(actualPlanPaths) !== JSON.stringify(parsedBundle.bundle.plan_paths)) {
      return {
        ok: false,
        applicable: true,
        reason: "workflow_identity_admission_bundle_path_mismatch",
        detail: actualPlanPaths.join(","),
      };
    }
    const typedPlanPaths = typedPlans.map(({ path }) => path).sort();
    if (JSON.stringify(typedPlanPaths) !== JSON.stringify(actualPlanPaths)) {
      return {
        ok: false,
        applicable: true,
        reason: "workflow_identity_admission_bundle_identity_mismatch",
        detail: "every manifested PLAN must have current workflow_identity",
      };
    }
    const authorityPaths = [
      "docs/design/helix/L3-requirements/workflow-classification-registry.v1.json",
      "config/workflow-classification-catalog.v1.json",
    ];
    const missingAuthorityPaths = authorityPaths.filter(
      (path) => !input.changedPaths.includes(path),
    );
    if (missingAuthorityPaths.length > 0) {
      return {
        ok: false,
        applicable: true,
        reason: "workflow_identity_admission_bundle_authority_path_missing",
        detail: missingAuthorityPaths.join(","),
      };
    }
    selectedPlan = typedPlans.find(({ path }) => path === parsedBundle.bundle.owner_plan);
    if (!selectedPlan) {
      return {
        ok: false,
        applicable: true,
        reason: "workflow_identity_admission_bundle_owner_invalid",
        detail: parsedBundle.bundle.owner_plan,
      };
    }
    migrationBundle = true;
  } else if (terminalBundleRequested) {
    const parsedBundle = parseTerminalBundle(input.prBody);
    if (!parsedBundle.ok) {
      return {
        ok: false,
        applicable: true,
        reason: "workflow_identity_admission_bundle_contract_invalid",
        detail: parsedBundle.detail,
      };
    }
    const actualPlanPaths = input.changedPaths
      .filter((path) => /^docs\/plans\/PLAN-[^/]+\.md$/u.test(path))
      .sort();
    if (JSON.stringify(actualPlanPaths) !== JSON.stringify(parsedBundle.bundle.plan_paths)) {
      return {
        ok: false,
        applicable: true,
        reason: "workflow_identity_admission_bundle_path_mismatch",
        detail: actualPlanPaths.join(","),
      };
    }
    const typedPlanPaths = typedPlans.map(({ path }) => path).sort();
    if (JSON.stringify(typedPlanPaths) !== JSON.stringify(actualPlanPaths)) {
      return {
        ok: false,
        applicable: true,
        reason: "workflow_identity_admission_bundle_identity_mismatch",
        detail: "every manifested terminal PLAN must have current workflow_identity",
      };
    }
    selectedPlan = typedPlans.find(({ path }) => path === parsedBundle.bundle.owner_plan);
    if (!selectedPlan) {
      return {
        ok: false,
        applicable: true,
        reason: "workflow_identity_admission_bundle_owner_invalid",
        detail: parsedBundle.bundle.owner_plan,
      };
    }
    terminalBundle = true;
  } else if (typedPlans.length !== 1) {
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
  if (!selectedPlan) {
    return {
      ok: false,
      applicable: true,
      reason: "workflow_identity_admission_plan_invalid",
      detail: "selected PLAN missing",
    };
  }
  const plan = typedPlanSchema.safeParse(selectedPlan.frontmatter);
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
  if (migrationBundle || terminalBundle) {
    const parsedPlans = typedPlans.map(({ path, frontmatter }) => ({
      path,
      parsed: typedPlanSchema.safeParse(frontmatter),
    }));
    const invalid = parsedPlans.find(({ parsed }) => !parsed.success);
    if (invalid) {
      return {
        ok: false,
        applicable: true,
        reason: "workflow_identity_admission_plan_invalid",
        detail: invalid.path,
      };
    }
    if (
      migrationBundle &&
      (plan.data.workflow_identity.target_axis !== "workflow_model" ||
        plan.data.workflow_identity.target_id !== "VERSION_UP")
    ) {
      return {
        ok: false,
        applicable: true,
        reason: "workflow_identity_admission_bundle_owner_invalid",
        detail: `${plan.data.workflow_identity.target_axis}:${plan.data.workflow_identity.target_id}`,
      };
    }
    const invalidIdentity = parsedPlans.find(({ parsed }) => {
      if (!parsed.success) return true;
      const identity = parsed.data.workflow_identity;
      return (
        identity.registry_version !== catalog.source_registry.registry_version ||
        identity.registry_source_digest !== catalog.source_registry.registry_source_digest ||
        !catalog.entities.some(
          (entity) => entity.axis === identity.target_axis && entity.id === identity.target_id,
        )
      );
    });
    if (invalidIdentity) {
      return {
        ok: false,
        applicable: true,
        reason: "workflow_identity_admission_bundle_identity_mismatch",
        detail: invalidIdentity.path,
      };
    }
    if (terminalBundle) {
      const issueMismatch = parsedPlans.find(
        ({ parsed }) => parsed.success && parsed.data.github_issue_id !== plan.data.github_issue_id,
      );
      if (issueMismatch) {
        return {
          ok: false,
          applicable: true,
          reason: "workflow_identity_admission_bundle_issue_mismatch",
          detail: issueMismatch.path,
        };
      }
    }
  }
  const issueContract = parseGithubWorkflowIdentityContract(issue.body, catalog);
  if (!issueContract.ok) return mapContractFailure("issue", issueContract);
  const prContract = parseGithubWorkflowIdentityContract(input.prBody, catalog);
  if (!prContract.ok) return mapContractFailure("pr", prContract);
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
    ...(migrationBundle ? { migration_bundle: true as const } : {}),
    ...(terminalBundle ? { terminal_bundle: true as const } : {}),
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

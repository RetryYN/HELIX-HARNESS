import { z } from "zod";

const nonEmpty = z.string().trim().min(1);

export const prReviewRouteInputSchema = z
  .object({
    workerId: nonEmpty,
    workerRuntime: nonEmpty,
    workerModel: nonEmpty,
    reviewEvidence: z.array(
      z
        .object({
          kind: z.enum(["cross_agent", "intra_runtime_subagent"]),
          reviewerId: nonEmpty,
          reviewerRuntime: nonEmpty,
          reviewerModel: nonEmpty,
          evidencePath: z.string(),
          greenCommand: z.string().optional(),
        })
        .strict(),
    ),
    allowIntraRuntimeFallback: z.boolean().optional(),
  })
  .strict();

export const ciAutoFixGateInputSchema = z
  .object({
    ciStatus: z.enum(["green", "red", "pending", "unavailable"]),
    confidence: z.number().finite().min(0).max(1),
    attempt: z.number().int().nonnegative(),
    failureKind: z.enum([
      "test_failure",
      "typecheck_failure",
      "lint_failure",
      "security_failure",
      "permission_failure",
      "unknown",
    ]),
    dryRun: z.boolean().optional(),
    // policyはcaller authorityではないためschemaに存在せず、strictで拒否する。
  })
  .strict();

export const releaseAutomationDecisionInputSchema = z
  .object({
    adrStatus: z.enum(["accepted", "draft", "missing"]),
    selectedTool: z.enum(["release-please", "semantic-release"]).optional(),
    conventionalCommits: z.boolean(),
    requiresPrReviewGate: z.boolean(),
    requiresDryRun: z.boolean(),
    mergeQueueEnabled: z.boolean(),
  })
  .strict();

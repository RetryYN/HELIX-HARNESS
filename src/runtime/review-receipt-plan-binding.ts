import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parse as parseYaml } from "yaml";
import { modelProviderFromId } from "../schema";

export type ReviewPlanBindingFailureReason =
  | "review_plan_binding_unavailable"
  | "review_plan_session_mismatch"
  | "review_plan_model_mismatch"
  | "review_plan_head_mismatch"
  | "review_plan_cross_agent_approval_missing";

export interface ReviewPlanEntryBinding {
  readonly review_kind: string;
  readonly verdict: string;
  readonly reviewer_session_id?: string;
  readonly reviewer_model?: string;
  readonly reviewed_head_sha?: string;
}

export interface ChangedPlanReviewBinding {
  readonly plan_id: string;
  readonly status: string;
  /** null はbaseに存在しない新規PLAN、undefinedはpure evaluatorへの旧入力互換。 */
  readonly base_status?: string | null;
  readonly review_entries: readonly ReviewPlanEntryBinding[];
  readonly parse_failure?: boolean;
}

export interface ReviewReceiptPlanBindingInput {
  readonly receipt: {
    readonly reviewer_session_id: string;
    readonly reviewer_model: string;
    readonly reviewed_head_sha: string;
  };
  readonly changed_plans: readonly ChangedPlanReviewBinding[];
}

export interface ReviewReceiptPlanBindingFailure {
  readonly plan_id: string;
  readonly reason: ReviewPlanBindingFailureReason;
}

export interface ReviewReceiptPlanBindingDecision {
  readonly ok: boolean;
  readonly failures: readonly ReviewReceiptPlanBindingFailure[];
}

const TERMINAL_PLAN_STATUSES = new Set(["confirmed", "completed", "accepted"]);
const TECHNICAL_APPROVAL_VERDICTS = new Set(["approve", "approve_after_fixes", "pass"]);

/**
 * 変更PLANのterminal化に使った独立review主体と、PRのsealed receipt主体を接合する。
 * draftはまだterminal化していないため母集団外とし、parse不能は状態を推測せず拒否する。
 */
export function evaluateReviewReceiptPlanBinding(
  input: ReviewReceiptPlanBindingInput,
): ReviewReceiptPlanBindingDecision {
  const failures: ReviewReceiptPlanBindingFailure[] = [];
  for (const plan of input.changed_plans) {
    if (plan.parse_failure) {
      failures.push({ plan_id: plan.plan_id, reason: "review_plan_binding_unavailable" });
      continue;
    }
    if (!TERMINAL_PLAN_STATUSES.has(plan.status)) continue;
    if (plan.base_status !== undefined && TERMINAL_PLAN_STATUSES.has(plan.base_status ?? "")) {
      continue;
    }
    const approvals = plan.review_entries.filter(
      (entry) =>
        entry.review_kind === "cross_agent" &&
        TECHNICAL_APPROVAL_VERDICTS.has(entry.verdict.toLowerCase()),
    );
    if (approvals.length === 0) {
      failures.push({
        plan_id: plan.plan_id,
        reason: "review_plan_cross_agent_approval_missing",
      });
      continue;
    }
    const sessionMatches = approvals.filter(
      (entry) => entry.reviewer_session_id === input.receipt.reviewer_session_id,
    );
    if (sessionMatches.length === 0) {
      failures.push({ plan_id: plan.plan_id, reason: "review_plan_session_mismatch" });
      continue;
    }
    const modelMatches = sessionMatches.filter((entry) => {
      if (!entry.reviewer_model) return false;
      const entryProvider = modelProviderFromId(entry.reviewer_model);
      const receiptProvider = modelProviderFromId(input.receipt.reviewer_model);
      if (entryProvider === "unknown" || entryProvider !== receiptProvider) return false;
      const unprefixed = (value: string) =>
        value
          .trim()
          .toLowerCase()
          .replace(/^[^:]+:/u, "");
      return unprefixed(entry.reviewer_model) === unprefixed(input.receipt.reviewer_model);
    });
    if (modelMatches.length === 0) {
      failures.push({ plan_id: plan.plan_id, reason: "review_plan_model_mismatch" });
      continue;
    }
    if (
      !modelMatches.some((entry) => entry.reviewed_head_sha === input.receipt.reviewed_head_sha)
    ) {
      failures.push({ plan_id: plan.plan_id, reason: "review_plan_head_mismatch" });
    }
  }
  return { ok: failures.length === 0, failures };
}

function parseChangedPlan(path: string, source: string): ChangedPlanReviewBinding {
  const fallbackId = path.split("/").at(-1)?.replace(/\.md$/u, "") ?? path;
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---/u);
  if (!match) {
    return { plan_id: fallbackId, status: "unknown", review_entries: [], parse_failure: true };
  }
  try {
    const frontmatter = parseYaml(match[1]) as Record<string, unknown> | null;
    if (
      !frontmatter ||
      typeof frontmatter.plan_id !== "string" ||
      typeof frontmatter.status !== "string"
    ) {
      return { plan_id: fallbackId, status: "unknown", review_entries: [], parse_failure: true };
    }
    const rawEntries = Array.isArray(frontmatter.review_evidence)
      ? frontmatter.review_evidence
      : [];
    const reviewEntries = rawEntries.flatMap((raw): ReviewPlanEntryBinding[] => {
      if (!raw || typeof raw !== "object" || Array.isArray(raw)) return [];
      const entry = raw as Record<string, unknown>;
      return [
        {
          review_kind: typeof entry.review_kind === "string" ? entry.review_kind : "",
          verdict: typeof entry.verdict === "string" ? entry.verdict : "",
          ...(typeof entry.reviewer_session_id === "string"
            ? { reviewer_session_id: entry.reviewer_session_id }
            : {}),
          ...(typeof entry.reviewer_model === "string"
            ? { reviewer_model: entry.reviewer_model }
            : {}),
          ...(typeof entry.reviewed_head_sha === "string"
            ? { reviewed_head_sha: entry.reviewed_head_sha }
            : {}),
        },
      ];
    });
    return {
      plan_id: frontmatter.plan_id,
      status: frontmatter.status,
      review_entries: reviewEntries,
    };
  } catch {
    return { plan_id: fallbackId, status: "unknown", review_entries: [], parse_failure: true };
  }
}

/** candidate branchで変更されたPLANだけをHEAD bytesから読む。 */
export function loadChangedPlanReviewBindings(
  repoRoot: string,
  baseRef = "origin/main",
): ChangedPlanReviewBinding[] {
  let output: string;
  try {
    output = execFileSync("git", ["diff", "--name-only", `${baseRef}...HEAD`, "--", "docs/plans"], {
      cwd: repoRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
  } catch {
    return [
      {
        plan_id: "changed-plan-set",
        status: "unknown",
        review_entries: [],
        parse_failure: true,
      },
    ];
  }
  return output
    .split(/\r?\n/u)
    .filter((path) => /^docs\/plans\/[^/]+\.md$/u.test(path))
    .map((path) => {
      try {
        const head = parseChangedPlan(path, readFileSync(join(repoRoot, path), "utf8"));
        let baseStatus: string | null = null;
        try {
          const baseSource = execFileSync("git", ["show", `${baseRef}:${path}`], {
            cwd: repoRoot,
            encoding: "utf8",
            stdio: ["ignore", "pipe", "ignore"],
          });
          const base = parseChangedPlan(path, baseSource);
          if (base.parse_failure) return { ...base, plan_id: head.plan_id };
          baseStatus = base.status;
        } catch {
          baseStatus = null;
        }
        return { ...head, base_status: baseStatus };
      } catch {
        return {
          plan_id: path.split("/").at(-1)?.replace(/\.md$/u, "") ?? path,
          status: "unknown",
          review_entries: [],
          parse_failure: true,
        } satisfies ChangedPlanReviewBinding;
      }
    });
}

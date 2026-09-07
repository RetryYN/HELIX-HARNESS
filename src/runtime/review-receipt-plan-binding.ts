import { execFileSync } from "node:child_process";
import { parse as parseYaml } from "yaml";
import { modelProviderFromId } from "../schema";

export type ReviewPlanBindingFailureReason =
  | "review_plan_binding_unavailable"
  | "review_plan_session_mismatch"
  | "review_plan_model_mismatch"
  | "review_plan_cross_agent_approval_missing"
  | "review_plan_receipt_locator_missing"
  | "review_plan_receipt_missing"
  | "review_plan_head_mismatch"
  | "review_plan_verdict_mismatch"
  | "review_plan_ci_generation_mismatch";

export interface ReviewPlanEntryBinding {
  readonly review_kind: string;
  readonly verdict: string;
  readonly reviewer_session_id?: string;
  readonly reviewer_model?: string;
  readonly reviewed_head_sha?: string;
  readonly receipt_url?: string;
  readonly ci_evidence_generation?: string;
}

export interface SealedReviewReceiptBinding {
  readonly comment_url: string;
  readonly reviewer_session_id: string;
  readonly reviewer_model: string;
  readonly reviewed_head_sha: string;
  readonly verdict: string;
  readonly ci_evidence_generation: string;
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

export function hasTerminalPlanPromotion(plans: readonly ChangedPlanReviewBinding[]): boolean {
  return plans.some(
    (plan) =>
      !plan.parse_failure &&
      TERMINAL_PLAN_STATUSES.has(plan.status) &&
      !TERMINAL_PLAN_STATUSES.has(plan.base_status ?? ""),
  );
}

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
    }
  }
  return { ok: failures.length === 0, failures };
}

/**
 * terminalへ昇格するPLANのreview_evidenceを、そこから引用されたsealed receiptそのものへ接合する。
 * 最終merge receiptとの同一性は要求しない。実装review後の証跡転記だけを行うmerge-only HEADもあるため、
 * PLANが明示したreceipt URLをlookup keyにして、そのreceiptのsession／model／HEAD／verdict／CI世代を照合する。
 */
export function evaluateReviewEvidenceReceiptJoin(input: {
  readonly changed_plans: readonly ChangedPlanReviewBinding[];
  readonly receipts: readonly SealedReviewReceiptBinding[];
}): ReviewReceiptPlanBindingDecision {
  const failures: ReviewReceiptPlanBindingFailure[] = [];
  for (const plan of input.changed_plans) {
    if (plan.parse_failure) {
      failures.push({ plan_id: plan.plan_id, reason: "review_plan_binding_unavailable" });
      continue;
    }
    if (
      !TERMINAL_PLAN_STATUSES.has(plan.status) ||
      (plan.base_status !== undefined && TERMINAL_PLAN_STATUSES.has(plan.base_status ?? ""))
    ) {
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
    const located = approvals.filter((entry) => entry.receipt_url);
    if (located.length === 0) {
      failures.push({ plan_id: plan.plan_id, reason: "review_plan_receipt_locator_missing" });
      continue;
    }
    let mismatch: ReviewPlanBindingFailureReason = "review_plan_receipt_missing";
    let matched = false;
    for (const entry of located) {
      const receipt = input.receipts.find((candidate) => candidate.comment_url === entry.receipt_url);
      if (!receipt) continue;
      if (entry.reviewer_session_id !== receipt.reviewer_session_id) {
        mismatch = "review_plan_session_mismatch";
        continue;
      }
      if (!entry.reviewer_model || !sameReviewModel(entry.reviewer_model, receipt.reviewer_model)) {
        mismatch = "review_plan_model_mismatch";
        continue;
      }
      if (!entry.reviewed_head_sha || entry.reviewed_head_sha !== receipt.reviewed_head_sha) {
        mismatch = "review_plan_head_mismatch";
        continue;
      }
      if (normalizeReviewVerdict(entry.verdict) !== normalizeReviewVerdict(receipt.verdict)) {
        mismatch = "review_plan_verdict_mismatch";
        continue;
      }
      if (
        !entry.ci_evidence_generation ||
        entry.ci_evidence_generation !== receipt.ci_evidence_generation
      ) {
        mismatch = "review_plan_ci_generation_mismatch";
        continue;
      }
      matched = true;
      break;
    }
    if (!matched) failures.push({ plan_id: plan.plan_id, reason: mismatch });
  }
  return { ok: failures.length === 0, failures };
}

function sameReviewModel(left: string, right: string): boolean {
  const leftProvider = modelProviderFromId(left);
  const rightProvider = modelProviderFromId(right);
  if (leftProvider === "unknown" || leftProvider !== rightProvider) return false;
  const unprefixed = (value: string) => value.trim().toLowerCase().replace(/^[^:]+:/u, "");
  return unprefixed(left) === unprefixed(right);
}

function normalizeReviewVerdict(value: string): "approve" | "block" | "unknown" {
  const normalized = value.trim().toLowerCase();
  if (TECHNICAL_APPROVAL_VERDICTS.has(normalized)) return "approve";
  if (normalized === "block" || normalized === "request_changes") return "block";
  return "unknown";
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
          ...(typeof entry.receipt_url === "string" ? { receipt_url: entry.receipt_url } : {}),
          ...(typeof entry.ci_evidence_generation === "string"
            ? { ci_evidence_generation: entry.ci_evidence_generation }
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
  expectedHead?: string,
): ChangedPlanReviewBinding[] {
  let output: string;
  let candidateHead: string;
  try {
    candidateHead = execFileSync("git", ["rev-parse", "HEAD"], {
      cwd: repoRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    if (expectedHead && candidateHead !== expectedHead) throw new Error("local_head_mismatch");
    output = execFileSync("git", ["diff", "--name-only", `${baseRef}...${candidateHead}`, "--", "docs/plans"], {
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
        const headSource = execFileSync("git", ["show", `${candidateHead}:${path}`], {
          cwd: repoRoot,
          encoding: "utf8",
          stdio: ["ignore", "pipe", "ignore"],
        });
        const head = parseChangedPlan(path, headSource);
        let baseStatus: string | null = null;
        try {
          const baseSource = execFileSync("git", ["show", `${baseRef}:${path}`], {
            cwd: repoRoot,
            encoding: "utf8",
            stdio: ["ignore", "pipe", "ignore"],
          });
          const base = parseChangedPlan(path, baseSource);
          if (base.parse_failure) {
            return { ...base, plan_id: head.plan_id, status: "unknown" };
          }
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

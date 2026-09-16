import { createHash } from "node:crypto";
import { isAtomicContractId } from "../schema/atomic-contract-id";

export const ISSUE_CLOSURE_GRAPH_SCHEMA = "helix-issue-closure-graph.v1" as const;
export const ISSUE_COMPLETION_RECEIPT_SCHEMA = "helix-issue-completion-receipt.v1" as const;

export interface IssueClosureGraphContract {
  schema_version: typeof ISSUE_CLOSURE_GRAPH_SCHEMA;
  canonical_contracts: Array<{ contract_id: string; owner_issue: number }>;
  child_issues: Array<{ number: number; expected_state: "open" | "closed" }>;
  successor_issues: Array<{ number: number; expected_state: "open" | "closed" }>;
}

export interface IssueCompletionReceipt {
  schema_version: typeof ISSUE_COMPLETION_RECEIPT_SCHEMA;
  contract_id: string;
  owner_issue: number;
  pr_number: number;
  head_sha: string;
  ci_run_id: number;
  review_comment_url: string;
  review_receipt_digest: string;
}

export interface ObservedIssueCompletionReceipt extends IssueCompletionReceipt {
  source_issue: number;
}

export interface IssueClosureGraphSnapshot {
  parent_issue: { number: number; state: "open" | "closed" };
  contract: IssueClosureGraphContract;
  issues: Array<{ number: number; state: "open" | "closed" }>;
  receipts: ObservedIssueCompletionReceipt[];
  pull_requests: Array<{
    number: number;
    head_sha: string;
    merged: boolean;
    ci_run_id: number;
    ci_head_sha: string;
    ci_conclusion: "success" | "failure" | "cancelled" | "pending";
    review_receipt_digest: string;
    review_head_sha: string;
    review_ci_run_id: number;
    review_verdict: "approve" | "block";
  }>;
}

export type IssueClosureGraphFailureCode =
  | "issue_closure_contract_missing"
  | "issue_closure_contract_invalid"
  | "issue_closure_contract_missing_from_exact_set"
  | "issue_closure_contract_duplicate"
  | "issue_closure_parent_not_open"
  | "issue_closure_child_missing"
  | "issue_closure_child_open"
  | "issue_closure_successor_missing"
  | "issue_closure_successor_unresolved"
  | "issue_closure_receipt_missing"
  | "issue_closure_receipt_duplicate"
  | "issue_closure_receipt_stale"
  | "issue_closure_receipt_head_mismatch"
  | "issue_closure_receipt_ci_mismatch"
  | "issue_closure_receipt_review_mismatch";

export interface IssueClosureGraphFinding {
  code: IssueClosureGraphFailureCode;
  subject: string;
  detail: string;
}

export interface IssueClosureGraphReport {
  schema_version: typeof ISSUE_CLOSURE_GRAPH_SCHEMA;
  ok: boolean;
  parent_issue: number;
  contract_count: number;
  findings: IssueClosureGraphFinding[];
  snapshot_digest: `sha256:${string}`;
}

const SHA_40 = /^[0-9a-f]{40}$/;
const SHA256 = /^sha256:[0-9a-f]{64}$/;

function isPositiveInteger(value: unknown): value is number {
  return Number.isSafeInteger(value) && Number(value) > 0;
}

function stable(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, entry]) => [key, stable(entry)]),
    );
  }
  return value;
}

function digest(value: unknown): `sha256:${string}` {
  return `sha256:${createHash("sha256")
    .update(JSON.stringify(stable(value)))
    .digest("hex")}`;
}

function exactKeys(value: Record<string, unknown>, expected: string[]): boolean {
  return Object.keys(value).sort().join("\0") === [...expected].sort().join("\0");
}

function isIssueRef(
  value: unknown,
): value is { number: number; expected_state: "open" | "closed" } {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return (
    exactKeys(record, ["number", "expected_state"]) &&
    isPositiveInteger(record.number) &&
    (record.expected_state === "open" || record.expected_state === "closed")
  );
}

export function parseIssueClosureGraphContract(body: string): IssueClosureGraphContract {
  const matches = [...body.matchAll(/```json\s*([\s\S]*?)```/g)];
  const candidates: unknown[] = [];
  for (const match of matches) {
    try {
      candidates.push(JSON.parse(match[1] ?? ""));
    } catch {
      // 他用途のJSON blockは本contract候補にしない。
    }
  }
  const raw = candidates.find(
    (candidate) =>
      candidate &&
      typeof candidate === "object" &&
      (candidate as Record<string, unknown>).schema_version === ISSUE_CLOSURE_GRAPH_SCHEMA,
  );
  if (!raw) throw new Error("issue_closure_contract_missing");
  const record = raw as Record<string, unknown>;
  if (
    !exactKeys(record, [
      "schema_version",
      "canonical_contracts",
      "child_issues",
      "successor_issues",
    ]) ||
    !Array.isArray(record.canonical_contracts) ||
    !Array.isArray(record.child_issues) ||
    !Array.isArray(record.successor_issues)
  ) {
    throw new Error("issue_closure_contract_invalid");
  }
  const canonicalContracts = record.canonical_contracts;
  if (
    canonicalContracts.length === 0 ||
    !canonicalContracts.every((entry) => {
      if (!entry || typeof entry !== "object") return false;
      const item = entry as Record<string, unknown>;
      return (
        exactKeys(item, ["contract_id", "owner_issue"]) &&
        typeof item.contract_id === "string" &&
        isAtomicContractId(item.contract_id) &&
        isPositiveInteger(item.owner_issue)
      );
    }) ||
    !record.child_issues.every(isIssueRef) ||
    !record.successor_issues.every(isIssueRef)
  ) {
    throw new Error("issue_closure_contract_invalid");
  }
  return raw as IssueClosureGraphContract;
}

export function auditIssueClosureGraph(
  snapshot: IssueClosureGraphSnapshot,
): IssueClosureGraphReport {
  const findings: IssueClosureGraphFinding[] = [];
  if (snapshot.parent_issue.state !== "open") {
    findings.push({
      code: "issue_closure_parent_not_open",
      subject: `#${snapshot.parent_issue.number}`,
      detail: "Issue-closing PR requires the current parent Issue to be open",
    });
  }
  const contracts = snapshot.contract.canonical_contracts;
  const contractCounts = new Map<string, number>();
  for (const contract of contracts) {
    contractCounts.set(contract.contract_id, (contractCounts.get(contract.contract_id) ?? 0) + 1);
  }
  for (const [contractId, count] of contractCounts) {
    if (count > 1) {
      findings.push({
        code: "issue_closure_contract_duplicate",
        subject: contractId,
        detail: `canonical contract ${contractId} appears ${count} times`,
      });
    }
  }

  const issues = new Map(snapshot.issues.map((issue) => [issue.number, issue]));
  for (const child of snapshot.contract.child_issues) {
    const actual = issues.get(child.number);
    if (!actual) {
      findings.push({
        code: "issue_closure_child_missing",
        subject: `#${child.number}`,
        detail: `declared child #${child.number} is absent from the GitHub snapshot`,
      });
    } else if (actual.state !== child.expected_state) {
      findings.push({
        code: "issue_closure_child_open",
        subject: `#${child.number}`,
        detail: `child #${child.number} expected ${child.expected_state}, actual ${actual.state}`,
      });
    }
  }
  for (const successor of snapshot.contract.successor_issues) {
    const actual = issues.get(successor.number);
    if (!actual) {
      findings.push({
        code: "issue_closure_successor_missing",
        subject: `#${successor.number}`,
        detail: `declared successor #${successor.number} is absent from the GitHub snapshot`,
      });
    } else if (actual.state !== successor.expected_state) {
      findings.push({
        code: "issue_closure_successor_unresolved",
        subject: `#${successor.number}`,
        detail: `successor #${successor.number} expected ${successor.expected_state}, actual ${actual.state}`,
      });
    }
  }

  const receiptsByContract = new Map<string, ObservedIssueCompletionReceipt[]>();
  for (const receipt of snapshot.receipts) {
    receiptsByContract.set(receipt.contract_id, [
      ...(receiptsByContract.get(receipt.contract_id) ?? []),
      receipt,
    ]);
  }
  const prs = new Map(snapshot.pull_requests.map((pr) => [pr.number, pr]));
  for (const contract of contracts) {
    const receipts = receiptsByContract.get(contract.contract_id) ?? [];
    if (receipts.length === 0) {
      findings.push({
        code: "issue_closure_receipt_missing",
        subject: contract.contract_id,
        detail: `completion receipt is missing for ${contract.contract_id}`,
      });
      continue;
    }
    if (receipts.length > 1) {
      findings.push({
        code: "issue_closure_receipt_duplicate",
        subject: contract.contract_id,
        detail: `completion receipt appears ${receipts.length} times for ${contract.contract_id}`,
      });
      continue;
    }
    const receipt = receipts[0] as ObservedIssueCompletionReceipt;
    if (
      !exactKeys(receipt as unknown as Record<string, unknown>, [
        "schema_version",
        "contract_id",
        "owner_issue",
        "source_issue",
        "pr_number",
        "head_sha",
        "ci_run_id",
        "review_comment_url",
        "review_receipt_digest",
      ]) ||
      receipt.schema_version !== ISSUE_COMPLETION_RECEIPT_SCHEMA ||
      receipt.owner_issue !== contract.owner_issue ||
      receipt.source_issue !== contract.owner_issue ||
      !isPositiveInteger(receipt.pr_number) ||
      !SHA_40.test(receipt.head_sha) ||
      !isPositiveInteger(receipt.ci_run_id) ||
      !/^https:\/\/github\.com\/[^/]+\/[^/]+\/pull\/\d+#issuecomment-\d+$/.test(
        receipt.review_comment_url,
      ) ||
      !SHA256.test(receipt.review_receipt_digest)
    ) {
      findings.push({
        code: "issue_closure_receipt_stale",
        subject: contract.contract_id,
        detail: `completion receipt schema or owner binding is invalid for ${contract.contract_id}`,
      });
      continue;
    }
    const pr = prs.get(receipt.pr_number);
    if (!pr?.merged) {
      findings.push({
        code: "issue_closure_receipt_stale",
        subject: contract.contract_id,
        detail: `receipt PR #${receipt.pr_number} is absent or not merged`,
      });
      continue;
    }
    if (pr.head_sha !== receipt.head_sha) {
      findings.push({
        code: "issue_closure_receipt_head_mismatch",
        subject: contract.contract_id,
        detail: `receipt HEAD ${receipt.head_sha} differs from PR HEAD ${pr.head_sha}`,
      });
    }
    if (
      pr.ci_run_id !== receipt.ci_run_id ||
      pr.ci_head_sha !== receipt.head_sha ||
      pr.ci_conclusion !== "success"
    ) {
      findings.push({
        code: "issue_closure_receipt_ci_mismatch",
        subject: contract.contract_id,
        detail: `receipt CI ${receipt.ci_run_id} is not the successful PR run`,
      });
    }
    if (
      pr.review_verdict !== "approve" ||
      pr.review_head_sha !== receipt.head_sha ||
      pr.review_ci_run_id !== receipt.ci_run_id ||
      pr.review_receipt_digest !== receipt.review_receipt_digest
    ) {
      findings.push({
        code: "issue_closure_receipt_review_mismatch",
        subject: contract.contract_id,
        detail: "receipt review digest or approve verdict differs from the PR evidence",
      });
    }
  }

  const declared = new Set(contracts.map((contract) => contract.contract_id));
  for (const receipt of snapshot.receipts) {
    if (!declared.has(receipt.contract_id)) {
      findings.push({
        code: "issue_closure_contract_missing_from_exact_set",
        subject: receipt.contract_id,
        detail: `receipt ${receipt.contract_id} is not declared by the canonical exact set`,
      });
    }
  }

  return {
    schema_version: ISSUE_CLOSURE_GRAPH_SCHEMA,
    ok: findings.length === 0,
    parent_issue: snapshot.parent_issue.number,
    contract_count: contracts.length,
    findings,
    snapshot_digest: digest(snapshot),
  };
}

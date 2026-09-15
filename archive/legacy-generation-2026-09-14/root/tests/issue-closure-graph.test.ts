import { describe, expect, it } from "vitest";
import {
  auditIssueClosureGraph,
  type IssueClosureGraphSnapshot,
  parseIssueClosureGraphContract,
} from "../src/lint/issue-closure-graph";

const HEAD = "a".repeat(40);
const REVIEW = `sha256:${"b".repeat(64)}`;

function snapshot(): IssueClosureGraphSnapshot {
  return {
    parent_issue: { number: 194, state: "open" },
    contract: {
      schema_version: "helix-issue-closure-graph.v1",
      canonical_contracts: [
        { contract_id: "WCC-FR-05", owner_issue: 227 },
        { contract_id: "WCC-FR-06", owner_issue: 227 },
      ],
      child_issues: [{ number: 227, expected_state: "closed" }],
      successor_issues: [{ number: 213, expected_state: "open" }],
    },
    issues: [
      { number: 227, state: "closed" },
      { number: 213, state: "open" },
    ],
    receipts: [
      {
        schema_version: "helix-issue-completion-receipt.v1",
        contract_id: "WCC-FR-05",
        owner_issue: 227,
        source_issue: 227,
        pr_number: 383,
        head_sha: HEAD,
        ci_run_id: 30860788408,
        review_comment_url: "https://github.com/RetryYN/HELIX-HARNESS/pull/383#issuecomment-1",
        review_receipt_digest: REVIEW,
      },
      {
        schema_version: "helix-issue-completion-receipt.v1",
        contract_id: "WCC-FR-06",
        owner_issue: 227,
        source_issue: 227,
        pr_number: 383,
        head_sha: HEAD,
        ci_run_id: 30860788408,
        review_comment_url: "https://github.com/RetryYN/HELIX-HARNESS/pull/383#issuecomment-1",
        review_receipt_digest: REVIEW,
      },
    ],
    pull_requests: [
      {
        number: 383,
        head_sha: HEAD,
        merged: true,
        ci_run_id: 30860788408,
        ci_head_sha: HEAD,
        ci_conclusion: "success",
        review_receipt_digest: REVIEW,
        review_head_sha: HEAD,
        review_ci_run_id: 30860788408,
        review_verdict: "approve",
      },
    ],
  };
}

describe("Issue closure graph", () => {
  it("U-ICGRAPH-001: canonical exact setとGitHub実状態・HEAD・CI・reviewを同時に照合する", () => {
    expect(auditIssueClosureGraph(snapshot())).toMatchObject({
      ok: true,
      parent_issue: 194,
      contract_count: 2,
      findings: [],
    });
  });

  it("U-ICGRAPH-002: missing/duplicate contractとopen child/unresolved successorをtyped failureにする", () => {
    const input = snapshot();
    input.parent_issue.state = "closed";
    input.contract.canonical_contracts.push({ contract_id: "WCC-FR-05", owner_issue: 227 });
    input.contract.canonical_contracts.push({ contract_id: "WCC-FR-07", owner_issue: 227 });
    input.issues = [
      { number: 227, state: "open" },
      { number: 213, state: "closed" },
    ];
    const result = auditIssueClosureGraph(input);
    expect(result.ok).toBe(false);
    expect(result.findings.map((finding) => finding.code)).toEqual(
      expect.arrayContaining([
        "issue_closure_contract_duplicate",
        "issue_closure_parent_not_open",
        "issue_closure_receipt_missing",
        "issue_closure_child_open",
        "issue_closure_successor_unresolved",
      ]),
    );
  });

  it("U-ICGRAPH-003: stale/別HEAD/CI red/review不一致receiptを拒否する", () => {
    const extraField = snapshot();
    Object.assign(extraField.receipts[0] ?? {}, { caller_claim: "pass" });
    expect(auditIssueClosureGraph(extraField).findings).toContainEqual(
      expect.objectContaining({ code: "issue_closure_receipt_stale" }),
    );

    const stale = snapshot();
    const currentPr = stale.pull_requests[0];
    if (!currentPr) throw new Error("fixture PR missing");
    stale.pull_requests[0] = {
      ...currentPr,
      head_sha: "c".repeat(40),
      ci_run_id: 99,
      ci_head_sha: "c".repeat(40),
      ci_conclusion: "failure",
      review_receipt_digest: `sha256:${"d".repeat(64)}`,
      review_head_sha: "c".repeat(40),
      review_ci_run_id: 99,
      review_verdict: "block",
    };
    expect(auditIssueClosureGraph(stale).findings.map((finding) => finding.code)).toEqual(
      expect.arrayContaining([
        "issue_closure_receipt_head_mismatch",
        "issue_closure_receipt_ci_mismatch",
        "issue_closure_receipt_review_mismatch",
      ]),
    );
  });

  it("U-ICGRAPH-004: PR本文の散文ではなくstrict JSON contractだけを受理する", () => {
    expect(() => parseIssueClosureGraphContract("Child Issues: none\nall done")).toThrow(
      "issue_closure_contract_missing",
    );
    expect(
      parseIssueClosureGraphContract(`
\`\`\`json
{"schema_version":"helix-issue-closure-graph.v1","canonical_contracts":[{"contract_id":"WCC-FR-05","owner_issue":227}],"child_issues":[{"number":227,"expected_state":"closed"}],"successor_issues":[]}
\`\`\``),
    ).toMatchObject({ canonical_contracts: [{ contract_id: "WCC-FR-05" }] });
  });

  it("U-ICGRAPH-006: closure contractも共有ID authorityの6 segment上限でfail-closeする", () => {
    const contract = (contractId: string) => `
\`\`\`json
{"schema_version":"helix-issue-closure-graph.v1","canonical_contracts":[{"contract_id":"${contractId}","owner_issue":227}],"child_issues":[{"number":227,"expected_state":"closed"}],"successor_issues":[]}
\`\`\``;
    expect(parseIssueClosureGraphContract(contract("A-B-C-D-E-F"))).toMatchObject({
      canonical_contracts: [{ contract_id: "A-B-C-D-E-F" }],
    });
    expect(() => parseIssueClosureGraphContract(contract("A-B-C-D-E-F-G"))).toThrow(
      "issue_closure_contract_invalid",
    );
  });

  it("U-ICGRAPH-005: #227/#194は未完contract receiptを残したままcloseできない", () => {
    for (const parent of [227, 194]) {
      const incomplete = snapshot();
      incomplete.parent_issue.number = parent;
      incomplete.receipts = incomplete.receipts.slice(0, 1);
      const result = auditIssueClosureGraph(incomplete);
      expect(result.ok).toBe(false);
      expect(result.findings).toContainEqual(
        expect.objectContaining({
          code: "issue_closure_receipt_missing",
          subject: "WCC-FR-06",
        }),
      );
    }
  });
});

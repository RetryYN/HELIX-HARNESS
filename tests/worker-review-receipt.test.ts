import { describe, expect, it } from "vitest";
import { canonicalJson, sha256Digest } from "../src/runtime/digest";
import type { WorkerIsolationExecutionOrigin } from "../src/runtime/worker-isolation-broker";
import {
  admitWorkerOutput,
  WORKER_PROPOSAL_OUTPUT_SCHEMA_DIGEST,
} from "../src/runtime/worker-output-admission";
import {
  admitWorkerIndependentReview,
  evaluateWorkerIndependentReview,
  isWorkerIndependentReview,
  workerProposalCapabilityDigest,
} from "../src/runtime/worker-review-receipt";

// PLAN-L7-502-worker-independent-review

const digest = (seed: string) => sha256Digest(seed);

function output() {
  const descriptorDigest = digest("descriptor");
  const payload = {
    proposal_only: true,
    schema_version: "helix-worker-proposal.v1",
    summary: "review candidate",
  };
  const result = admitWorkerOutput(
    canonicalJson({
      descriptor_digest: descriptorDigest,
      output_schema_digest: WORKER_PROPOSAL_OUTPUT_SCHEMA_DIGEST,
      payload,
      payload_digest: digest(canonicalJson(payload)),
      schema_version: "helix-worker-output-envelope.v1",
    }),
    {
      descriptor_digest: descriptorDigest,
      output_schema_digest: WORKER_PROPOSAL_OUTPUT_SCHEMA_DIGEST,
    },
  );
  if (!result.ok) throw new Error(result.failure_code);
  return result.output;
}

function origin(
  overrides: Partial<WorkerIsolationExecutionOrigin> = {},
): WorkerIsolationExecutionOrigin {
  return {
    kind: "worker_isolation_execution_origin",
    identity: "worker-a",
    session: "session-a",
    context_digest: digest("context-a"),
    fixture_digest: digest("fixture-a"),
    task_digest: digest("task-a"),
    risk_class: "low",
    runtime: "fixture-runtime",
    provider: "codex",
    model: "gpt-worker",
    effort: "medium",
    descriptor_digest: digest("descriptor"),
    registry_revision: 1,
    registry_digest: digest("registry"),
    decision_digest: digest("decision"),
    wrapper_origin_digest: digest("wrapper"),
    ...overrides,
  };
}

function input(proposal = output()) {
  const proposalDigest = workerProposalCapabilityDigest(proposal);
  if (!proposalDigest) throw new Error("sealed proposal fixture required");
  return {
    schema_version: "helix-worker-independent-review-receipt.v1",
    proposal_digest: proposalDigest,
    finding_digest: digest("findings"),
    verdict: "approve",
  };
}

describe("WCC-FR-06 independent worker review receipt", () => {
  it("U-WRR-001: derived originだけからcanonical receiptを生成する", () => {
    const proposal = output();
    const result = evaluateWorkerIndependentReview({
      input: input(proposal),
      proposalOutput: proposal,
      workerOrigin: origin(),
      reviewerOrigin: origin({
        identity: "reviewer-b",
        session: "session-b",
        context_digest: digest("context-b"),
      }),
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.receipt.worker_model.identity).toBe("worker-a");
    expect(result.receipt.reviewer_model.identity).toBe("reviewer-b");
    expect(isWorkerIndependentReview(result.receipt)).toBe(false);
  });

  it("U-WRR-002: copied proposalとproposal digest driftを拒否する", () => {
    const proposal = output();
    expect(
      evaluateWorkerIndependentReview({
        input: input(proposal),
        proposalOutput: { ...proposal },
        workerOrigin: origin(),
        reviewerOrigin: origin({
          identity: "reviewer-b",
          session: "session-b",
          context_digest: digest("context-b"),
        }),
      }),
    ).toEqual({
      ok: false,
      failure_code: "WORKER_REVIEW_PROPOSAL_UNSEALED",
    });
    expect(
      evaluateWorkerIndependentReview({
        input: { ...input(proposal), proposal_digest: digest("foreign") },
        proposalOutput: proposal,
        workerOrigin: origin(),
        reviewerOrigin: origin({
          identity: "reviewer-b",
          session: "session-b",
          context_digest: digest("context-b"),
        }),
      }),
    ).toEqual({
      ok: false,
      failure_code: "WORKER_REVIEW_PROPOSAL_DIGEST_MISMATCH",
    });
  });

  it("U-WRR-003: actor自己申告、unknown field、invalid digestをstrict拒否する", () => {
    const proposal = output();
    for (const changed of [
      { ...input(proposal), worker_model: origin() },
      { ...input(proposal), reviewer_model: origin() },
      { ...input(proposal), unknown: true },
      { ...input(proposal), finding_digest: "invalid" },
    ]) {
      expect(
        evaluateWorkerIndependentReview({
          input: changed,
          proposalOutput: proposal,
          workerOrigin: origin(),
          reviewerOrigin: origin({
            identity: "reviewer-b",
            session: "session-b",
            context_digest: digest("context-b"),
          }),
        }),
      ).toEqual({
        ok: false,
        failure_code: "WORKER_REVIEW_RECEIPT_SCHEMA_INVALID",
      });
    }
  });

  it("U-WRR-004: identity collisionを拒否する", () => {
    const proposal = output();
    expect(
      evaluateWorkerIndependentReview({
        input: input(proposal),
        proposalOutput: proposal,
        workerOrigin: origin(),
        reviewerOrigin: origin(),
      }),
    ).toEqual({
      ok: false,
      failure_code: "HIL_ORCHESTRATION_IDENTITY_NOT_SEPARATED",
    });
  });

  it("U-WRR-005: same provider/modelでも三軸独立ならgreen", () => {
    const proposal = output();
    expect(
      evaluateWorkerIndependentReview({
        input: input(proposal),
        proposalOutput: proposal,
        workerOrigin: origin(),
        reviewerOrigin: origin({
          identity: "reviewer-b",
          session: "session-b",
          context_digest: digest("context-b"),
        }),
      }).ok,
    ).toBe(true);
  });

  it("U-WRR-006: session collisionを拒否する", () => {
    const proposal = output();
    expect(
      evaluateWorkerIndependentReview({
        input: input(proposal),
        proposalOutput: proposal,
        workerOrigin: origin(),
        reviewerOrigin: origin({ identity: "reviewer-b" }),
      }),
    ).toEqual({ ok: false, failure_code: "HIL_ORCHESTRATION_SESSION_NOT_SEPARATED" });
  });

  it("U-WRR-007: context collisionを拒否する", () => {
    const proposal = output();
    expect(
      evaluateWorkerIndependentReview({
        input: input(proposal),
        proposalOutput: proposal,
        workerOrigin: origin(),
        reviewerOrigin: origin({ identity: "reviewer-b", session: "session-b" }),
      }),
    ).toEqual({ ok: false, failure_code: "HIL_ORCHESTRATION_CONTEXT_NOT_INDEPENDENT" });
  });

  it("U-WRR-008: broker originのないoutputをsealed reviewへ昇格しない", () => {
    const proposal = output();
    const reviewer = output();
    const fakeCurrent = {} as never;
    expect(
      admitWorkerIndependentReview({
        input: input(proposal),
        proposalOutput: proposal,
        reviewerOutput: reviewer,
        workerCurrent: fakeCurrent,
        reviewerCurrent: fakeCurrent,
      }),
    ).toEqual({ ok: false, failure_code: "WORKER_REVIEW_EXECUTION_ORIGIN_UNSEALED" });
  });
});

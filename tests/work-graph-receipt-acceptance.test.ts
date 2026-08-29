import { describe, expect, it } from "vitest";
import { canonicalJson, type Sha256Digest, sha256Digest } from "../src/runtime/digest";
import {
  acquireWorkGraphLease,
  type DelegationRequestOrderingRequest,
  evaluateDelegationRequestOrdering,
  evaluateParentAcceptanceOrdering,
  isDelegationRequestReceipt,
  isParentAcceptanceReceipt,
  type RequiredCellBindingV1,
  releaseWorkGraphLease,
  validateWorkGraphLease,
  type WorkGraphActorV1,
} from "../src/runtime/work-graph-receipt-acceptance";
import type { WorkerIsolationExecutionOrigin } from "../src/runtime/worker-isolation-broker";
import type {
  WorkerLifecycleEventV1,
  WorkerLifecycleReceiptCapability,
  WorkerLifecycleState,
} from "../src/runtime/worker-lifecycle-receipt";
import {
  admitWorkerOutput,
  WORKER_PROPOSAL_OUTPUT_SCHEMA_DIGEST,
} from "../src/runtime/worker-output-admission";
import {
  evaluateWorkerIndependentReview,
  type WorkerIndependentReviewCapability,
  workerProposalCapabilityDigest,
} from "../src/runtime/worker-review-receipt";

// PLAN-L7-525-work-graph-receipt-acceptance / issue #213

const digest = (seed: string): Sha256Digest => sha256Digest(seed);
const HEAD = "a".repeat(40);
const OTHER_HEAD = "b".repeat(40);

function workerOutput() {
  const descriptorDigest = digest("descriptor");
  const payload = {
    proposal_only: true,
    schema_version: "helix-worker-proposal.v1",
    summary: "work graph candidate",
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
    benchmark_definition_digest: null,
    judge_packet_digest: null,
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

const reviewerOrigin = (overrides: Partial<WorkerIsolationExecutionOrigin> = {}) =>
  origin({
    identity: "reviewer-b",
    session: "session-b",
    context_digest: digest("context-b"),
    ...overrides,
  });

function sealedReview(
  options: {
    verdict?: "approve" | "reject";
    reviewer?: Partial<WorkerIsolationExecutionOrigin>;
  } = {},
): WorkerIndependentReviewCapability {
  const proposal = workerOutput();
  const reviewer = workerOutput();
  const proposalDigest = workerProposalCapabilityDigest(proposal);
  if (!proposalDigest) throw new Error("sealed proposal fixture required");
  const result = evaluateWorkerIndependentReview({
    input: {
      schema_version: "helix-worker-independent-review-receipt.v1",
      proposal_digest: proposalDigest,
      finding_digest: reviewer.payload_digest,
      verdict: options.verdict ?? "approve",
    },
    proposalOutput: proposal,
    reviewerOutput: reviewer,
    workerOrigin: origin(),
    reviewerOrigin: reviewerOrigin(options.reviewer),
  });
  if (!result.ok) throw new Error(result.failure_code);
  return Object.freeze({
    kind: "worker_independent_review" as const,
    proposal_digest: result.receipt.proposal_digest,
    finding_digest: result.receipt.finding_digest,
    receipt_digest: sha256Digest(canonicalJson(result.receipt)),
    verdict: result.receipt.verdict,
    worker_model: result.receipt.worker_model,
    reviewer_model: result.receipt.reviewer_model,
  });
}

function reviewAdmission(options: {
  workerCurrent?: WorkerIsolationExecutionOrigin;
  reviewerCurrent?: WorkerIsolationExecutionOrigin;
}) {
  const proposal = workerOutput();
  const reviewer = workerOutput();
  const proposalDigest = workerProposalCapabilityDigest(proposal);
  if (!proposalDigest) throw new Error("sealed proposal fixture required");
  return evaluateWorkerIndependentReview({
    input: {
      schema_version: "helix-worker-independent-review-receipt.v1",
      proposal_digest: proposalDigest,
      finding_digest: reviewer.payload_digest,
      verdict: "approve",
    },
    proposalOutput: proposal,
    reviewerOutput: reviewer,
    workerOrigin: options.workerCurrent ?? origin(),
    reviewerOrigin: options.reviewerCurrent ?? reviewerOrigin(),
  });
}

function terminalReceipt(
  options: {
    headSha?: string;
    terminalState?: "accepted" | "rejected" | "quarantined";
    review?: WorkerIndependentReviewCapability;
  } = {},
): WorkerLifecycleReceiptCapability {
  const review = options.review ?? sealedReview();
  const terminalState: WorkerLifecycleState = options.terminalState ?? "accepted";
  const terminalReason = terminalState === "accepted" ? null : "fixture rejection";
  const headSha = options.headSha ?? HEAD;
  const runId = "run-fixture";
  const admissionDigest = digest("admission");
  const sandboxDigest = digest("sandbox");
  const observationDigest = digest("observation");
  const outputDigest = digest("output");
  const events: WorkerLifecycleEventV1[] = [];
  const append = (state: WorkerLifecycleState, evidenceDigest: Sha256Digest) => {
    const payload = {
      sequence: events.length + 1,
      state,
      evidence_digest: evidenceDigest,
      previous_event_digest: events.at(-1)?.event_digest ?? null,
    };
    events.push(Object.freeze({ ...payload, event_digest: sha256Digest(canonicalJson(payload)) }));
  };
  append("requested", sha256Digest(canonicalJson({ run_id: runId, parent_run_id: null })));
  append(
    "admitted",
    sha256Digest(
      canonicalJson({ admission_digest: admissionDigest, child_run_ids: [], head_sha: headSha }),
    ),
  );
  append("sandboxed", sandboxDigest);
  append("running", observationDigest);
  append("proposal_received", outputDigest);
  append("revalidated", review.receipt_digest);
  append(
    terminalState,
    sha256Digest(canonicalJson({ reason: terminalReason, review: review.receipt_digest })),
  );
  const payload = {
    kind: "worker_lifecycle_receipt" as const,
    schema_version: "helix-worker-lifecycle-receipt.v1" as const,
    run_id: runId,
    parent_run_id: null,
    child_run_ids: Object.freeze([] as string[]),
    head_sha: headSha,
    terminal_state: terminalState as "accepted" | "rejected" | "quarantined",
    terminal_reason: terminalReason,
    admission_digest: admissionDigest,
    sandbox_digest: sandboxDigest,
    diff_digest: digest("diff"),
    egress_digest: digest("egress"),
    output_digest: outputDigest,
    observation_digest: observationDigest,
    reviewer_verdict: terminalState === "accepted" ? ("approve" as const) : ("reject" as const),
    verifier_receipt_digest: review.receipt_digest,
    events: Object.freeze([...events]),
  };
  return Object.freeze({ ...payload, receipt_digest: sha256Digest(canonicalJson(payload)) });
}

function lease(
  overrides: Partial<{ fence_token: number; owner: string; acquired_at: string }> = {},
) {
  return { fence_token: 1, owner: "writer-a", acquired_at: "2026-08-08T00:00:00Z", ...overrides };
}

function cellBinding(overrides: Partial<RequiredCellBindingV1> = {}): RequiredCellBindingV1 {
  return {
    lane_id: "lane-213",
    issue_id: "issue-213",
    behavior_contract_id: "MIC-FR-001",
    responsibility_owner: "work-graph-receipt-acceptance",
    base_head: HEAD,
    candidate_head: HEAD,
    writer_lease: lease(),
    target_reviewer: "reviewer-b",
    effective_rule_packet_digest: digest("rule-packet"),
    allowed_paths: ["src/runtime"],
    forbidden_paths: [".helix"],
    lane_ready_receipt: {
      graph_snapshot_digest: digest("graph-snapshot"),
      dependency_edge_ids: ["edge-1", "edge-2"],
    },
    ...overrides,
  };
}

function delegationRequest(
  overrides: Partial<DelegationRequestOrderingRequest> = {},
): DelegationRequestOrderingRequest {
  return {
    requiredCellBinding: cellBinding(),
    requiredDependencyEdgeIds: ["edge-1"],
    changedPaths: ["src/runtime/work-graph-receipt-acceptance.ts"],
    expectedBaseHead: HEAD,
    lease: lease(),
    issuedAt: "2026-08-08T00:00:00Z",
    ...overrides,
  };
}

function sealedDelegation(overrides: Partial<DelegationRequestOrderingRequest> = {}) {
  const result = evaluateDelegationRequestOrdering(delegationRequest(overrides));
  if (!result.ok) throw new Error(result.failure_code);
  return result.receipt;
}

const evaluator: WorkGraphActorV1 = {
  identity: "tl-evaluator",
  session: "session-tl",
  context_digest: digest("context-tl"),
};

function acceptanceRequest(overrides: Record<string, unknown> = {}) {
  const review = sealedReview();
  return {
    delegation: sealedDelegation(),
    review,
    terminal: terminalReceipt({ review }),
    reviewHeadSha: HEAD,
    repositoryHead: HEAD,
    evaluator,
    sealedAt: "2026-08-08T01:00:00Z",
    ...overrides,
  };
}

function bindingWithout(field: keyof RequiredCellBindingV1) {
  const binding: Record<string, unknown> = { ...cellBinding() };
  delete binding[field];
  return binding;
}

describe("work graph と三段 receipt 検収 (U-WGR-001..045)", () => {
  it("U-WGR-046: 共有lease shape validatorはexact key／owner／fenceを検証する", () => {
    expect(validateWorkGraphLease(lease())).toBe(true);
    expect(validateWorkGraphLease({ ...lease(), extra: true })).toBe(false);
    expect(validateWorkGraphLease({ ...lease(), fence_token: -1 })).toBe(false);
    expect(validateWorkGraphLease({ ...lease(), owner: "" })).toBe(false);
  });

  it("U-WGR-001: READY・exact set・CAS 成立で delegation receipt を 1 件 seal する", () => {
    const result = evaluateDelegationRequestOrdering(delegationRequest());
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(isDelegationRequestReceipt(result.receipt)).toBe(true);
    expect(isDelegationRequestReceipt({ ...result.receipt })).toBe(false);
    expect(result.receipt.receipt_digest).toMatch(/^sha256:[a-f0-9]{64}$/u);
  });

  it("U-WGR-002: dependency edge 未完了を DEPENDENCY_NOT_READY で拒否する", () => {
    expect(
      evaluateDelegationRequestOrdering(
        delegationRequest({ requiredDependencyEdgeIds: ["edge-1", "edge-9"] }),
      ),
    ).toEqual({ ok: false, failure_code: "WORK_GRAPH_DEPENDENCY_NOT_READY" });
  });

  it("U-WGR-003: lane_id 欠落を CELL_BINDING_INVALID で拒否する", () => {
    expect(
      evaluateDelegationRequestOrdering(
        delegationRequest({ requiredCellBinding: bindingWithout("lane_id") }),
      ),
    ).toEqual({ ok: false, failure_code: "WORK_GRAPH_CELL_BINDING_INVALID" });
  });

  it("U-WGR-004: issue_id 欠落を CELL_BINDING_INVALID で拒否する", () => {
    expect(
      evaluateDelegationRequestOrdering(
        delegationRequest({ requiredCellBinding: bindingWithout("issue_id") }),
      ),
    ).toEqual({ ok: false, failure_code: "WORK_GRAPH_CELL_BINDING_INVALID" });
  });

  it("U-WGR-005: behavior_contract_id 欠落を CELL_BINDING_INVALID で拒否する", () => {
    expect(
      evaluateDelegationRequestOrdering(
        delegationRequest({ requiredCellBinding: bindingWithout("behavior_contract_id") }),
      ),
    ).toEqual({ ok: false, failure_code: "WORK_GRAPH_CELL_BINDING_INVALID" });
  });

  it("U-WGR-006: responsibility_owner 欠落を CELL_BINDING_INVALID で拒否する", () => {
    expect(
      evaluateDelegationRequestOrdering(
        delegationRequest({ requiredCellBinding: bindingWithout("responsibility_owner") }),
      ),
    ).toEqual({ ok: false, failure_code: "WORK_GRAPH_CELL_BINDING_INVALID" });
  });

  it("U-WGR-007: base_head 欠落を CELL_BINDING_INVALID で拒否する", () => {
    expect(
      evaluateDelegationRequestOrdering(
        delegationRequest({ requiredCellBinding: bindingWithout("base_head") }),
      ),
    ).toEqual({ ok: false, failure_code: "WORK_GRAPH_CELL_BINDING_INVALID" });
  });

  it("U-WGR-008: candidate_head 欠落を CELL_BINDING_INVALID で拒否する", () => {
    expect(
      evaluateDelegationRequestOrdering(
        delegationRequest({ requiredCellBinding: bindingWithout("candidate_head") }),
      ),
    ).toEqual({ ok: false, failure_code: "WORK_GRAPH_CELL_BINDING_INVALID" });
  });

  it("U-WGR-009: writer_lease 欠落を CELL_BINDING_INVALID で拒否する", () => {
    expect(
      evaluateDelegationRequestOrdering(
        delegationRequest({ requiredCellBinding: bindingWithout("writer_lease") }),
      ),
    ).toEqual({ ok: false, failure_code: "WORK_GRAPH_CELL_BINDING_INVALID" });
  });

  it("U-WGR-010: target_reviewer 欠落を CELL_BINDING_INVALID で拒否する", () => {
    expect(
      evaluateDelegationRequestOrdering(
        delegationRequest({ requiredCellBinding: bindingWithout("target_reviewer") }),
      ),
    ).toEqual({ ok: false, failure_code: "WORK_GRAPH_CELL_BINDING_INVALID" });
  });

  it("U-WGR-011: effective_rule_packet_digest 欠落を CELL_BINDING_INVALID で拒否する", () => {
    expect(
      evaluateDelegationRequestOrdering(
        delegationRequest({ requiredCellBinding: bindingWithout("effective_rule_packet_digest") }),
      ),
    ).toEqual({ ok: false, failure_code: "WORK_GRAPH_CELL_BINDING_INVALID" });
  });

  it("U-WGR-012: allowed_paths 欠落を CELL_BINDING_INVALID で拒否する", () => {
    expect(
      evaluateDelegationRequestOrdering(
        delegationRequest({ requiredCellBinding: bindingWithout("allowed_paths") }),
      ),
    ).toEqual({ ok: false, failure_code: "WORK_GRAPH_CELL_BINDING_INVALID" });
  });

  it("U-WGR-013: forbidden_paths 欠落を CELL_BINDING_INVALID で拒否する", () => {
    expect(
      evaluateDelegationRequestOrdering(
        delegationRequest({ requiredCellBinding: bindingWithout("forbidden_paths") }),
      ),
    ).toEqual({ ok: false, failure_code: "WORK_GRAPH_CELL_BINDING_INVALID" });
  });

  it("U-WGR-014: lane_ready_receipt 欠落を CELL_BINDING_INVALID で拒否する", () => {
    expect(
      evaluateDelegationRequestOrdering(
        delegationRequest({ requiredCellBinding: bindingWithout("lane_ready_receipt") }),
      ),
    ).toEqual({ ok: false, failure_code: "WORK_GRAPH_CELL_BINDING_INVALID" });
  });

  it("U-WGR-015: unknown 追加 field で欠落を相殺できない", () => {
    expect(
      evaluateDelegationRequestOrdering(
        delegationRequest({
          requiredCellBinding: { ...cellBinding(), extra_hint: "compensation" },
        }),
      ),
    ).toEqual({ ok: false, failure_code: "WORK_GRAPH_CELL_BINDING_INVALID" });
    expect(
      evaluateDelegationRequestOrdering(
        delegationRequest({
          requiredCellBinding: { ...bindingWithout("lane_id"), extra_hint: "compensation" },
        }),
      ),
    ).toEqual({ ok: false, failure_code: "WORK_GRAPH_CELL_BINDING_INVALID" });
  });

  it("U-WGR-016: stale base_head を定義済み code で拒否する", () => {
    expect(
      evaluateDelegationRequestOrdering(
        delegationRequest({ requiredCellBinding: cellBinding({ base_head: OTHER_HEAD }) }),
      ),
    ).toEqual({ ok: false, failure_code: "WORK_GRAPH_HEAD_DRIFT" });
    expect(
      evaluateDelegationRequestOrdering(
        delegationRequest({ requiredCellBinding: cellBinding({ base_head: "not-a-sha" }) }),
      ),
    ).toEqual({ ok: false, failure_code: "WORK_GRAPH_CELL_BINDING_INVALID" });
  });

  it("U-WGR-017: allowed_paths 外の changed path を拒否する", () => {
    expect(
      evaluateDelegationRequestOrdering(delegationRequest({ changedPaths: ["src/cli.ts"] })),
    ).toEqual({ ok: false, failure_code: "WORK_GRAPH_SCOPE_PATH_VIOLATION" });
  });

  it("U-WGR-018: forbidden_paths に一致する changed path を拒否する", () => {
    expect(
      evaluateDelegationRequestOrdering(
        delegationRequest({
          requiredCellBinding: cellBinding({ allowed_paths: ["src/runtime", ".helix"] }),
          changedPaths: [".helix/state/current-plan"],
        }),
      ),
    ).toEqual({ ok: false, failure_code: "WORK_GRAPH_SCOPE_PATH_VIOLATION" });
  });

  it("U-WGR-019: target_reviewer 不一致を TARGET_REVIEWER_MISMATCH で拒否する", () => {
    const review = sealedReview();
    expect(
      evaluateParentAcceptanceOrdering(
        acceptanceRequest({
          delegation: sealedDelegation({
            requiredCellBinding: cellBinding({ target_reviewer: "reviewer-z" }),
          }),
          review,
          terminal: terminalReceipt({ review }),
        }) as never,
      ),
    ).toEqual({ ok: false, failure_code: "WORK_GRAPH_TARGET_REVIEWER_MISMATCH" });
  });

  it("U-WGR-020: CAS 一致時に単調増加した fence token で owner を差し替える", () => {
    const result = acquireWorkGraphLease({
      laneId: "lane-213",
      currentLease: lease({ fence_token: 3, owner: "writer-old" }),
      expectedFenceToken: 3,
      owner: "writer-a",
      acquiredAt: "2026-08-08T00:00:00Z",
    });
    expect(result).toEqual({
      ok: true,
      lease: { fence_token: 4, owner: "writer-a", acquired_at: "2026-08-08T00:00:00Z" },
    });
  });

  it("U-WGR-021: stale read の CAS 取得を LEASE_CAS_STALE で拒否する", () => {
    expect(
      acquireWorkGraphLease({
        laneId: "lane-213",
        currentLease: lease({ fence_token: 4 }),
        expectedFenceToken: 3,
        owner: "writer-a",
        acquiredAt: "2026-08-08T00:00:00Z",
      }),
    ).toEqual({ ok: false, failure_code: "WORK_GRAPH_LEASE_CAS_STALE" });
  });

  it("U-WGR-022: 並行 acquire は先着 1 件へ収束する", () => {
    const current = lease({ fence_token: 2, owner: "writer-old" });
    const first = acquireWorkGraphLease({
      laneId: "lane-213",
      currentLease: current,
      expectedFenceToken: 2,
      owner: "writer-a",
      acquiredAt: "2026-08-08T00:00:00Z",
    });
    expect(first.ok).toBe(true);
    if (!first.ok) return;
    const second = acquireWorkGraphLease({
      laneId: "lane-213",
      currentLease: first.lease,
      expectedFenceToken: 2,
      owner: "writer-b",
      acquiredAt: "2026-08-08T00:00:01Z",
    });
    expect(second).toEqual({ ok: false, failure_code: "WORK_GRAPH_LEASE_CAS_STALE" });
    expect(first.lease.owner).toBe("writer-a");
  });

  it("U-WGR-023: terminal 未確定の解放要求を LEASE_EARLY_RELEASE で拒否する", () => {
    expect(releaseWorkGraphLease({ lease: lease(), terminal: null })).toEqual({
      ok: false,
      failure_code: "WORK_GRAPH_LEASE_EARLY_RELEASE",
    });
    const broken = { ...terminalReceipt(), head_sha: OTHER_HEAD };
    expect(releaseWorkGraphLease({ lease: lease(), terminal: broken })).toEqual({
      ok: false,
      failure_code: "WORK_GRAPH_LEASE_EARLY_RELEASE",
    });
  });

  it("U-WGR-024: terminal 確定後の解放要求を admit する", () => {
    for (const state of ["accepted", "rejected", "quarantined"] as const) {
      const result = releaseWorkGraphLease({
        lease: lease(),
        terminal: terminalReceipt({
          terminalState: state,
          review: sealedReview({ verdict: state === "accepted" ? "approve" : "reject" }),
        }),
      });
      expect(result.ok).toBe(true);
    }
  });

  it("U-WGR-025: reject 終端後の再割当は新しい fence token を要求する", () => {
    const reacquired = acquireWorkGraphLease({
      laneId: "lane-213",
      currentLease: lease({ fence_token: 1 }),
      expectedFenceToken: 1,
      owner: "writer-c",
      acquiredAt: "2026-08-08T02:00:00Z",
    });
    expect(reacquired.ok).toBe(true);
    if (!reacquired.ok) return;
    expect(reacquired.lease.fence_token).toBe(2);
    const result = evaluateDelegationRequestOrdering(
      delegationRequest({
        requiredCellBinding: cellBinding({ writer_lease: reacquired.lease }),
        lease: reacquired.lease,
      }),
    );
    expect(result.ok).toBe(true);
  });

  it("U-WGR-026: 旧 fence token の再利用を LEASE_CAS_STALE で拒否する", () => {
    expect(
      acquireWorkGraphLease({
        laneId: "lane-213",
        currentLease: lease({ fence_token: 2 }),
        expectedFenceToken: 1,
        owner: "writer-c",
        acquiredAt: "2026-08-08T02:00:00Z",
      }),
    ).toEqual({ ok: false, failure_code: "WORK_GRAPH_LEASE_CAS_STALE" });
    expect(
      evaluateDelegationRequestOrdering(
        delegationRequest({
          requiredCellBinding: cellBinding({ writer_lease: lease({ fence_token: 2 }) }),
          lease: lease({ fence_token: 1 }),
        }),
      ),
    ).toEqual({ ok: false, failure_code: "WORK_GRAPH_LEASE_CAS_STALE" });
  });

  it("U-WGR-027: graph snapshot 未確定の先書きを RECEIPT_FUTURE_WRITE で拒否する", () => {
    expect(
      evaluateDelegationRequestOrdering(
        delegationRequest({
          requiredCellBinding: cellBinding({
            lane_ready_receipt: { graph_snapshot_digest: null, dependency_edge_ids: ["edge-1"] },
          }),
        }),
      ),
    ).toEqual({ ok: false, failure_code: "WORK_GRAPH_RECEIPT_FUTURE_WRITE" });
  });

  it("U-WGR-028: review 未 seal のまま terminal を作れない既存契約が伝播する", () => {
    const review = sealedReview();
    const unsealed = { ...review, verdict: "reject" as const };
    const result = evaluateParentAcceptanceOrdering(
      acceptanceRequest({ review: unsealed, terminal: terminalReceipt({ review }) }) as never,
    );
    expect(result).toEqual({ ok: false, failure_code: "WORK_GRAPH_ORDER_DIGEST_MISSING" });
  });

  it("U-WGR-029: review 未 seal の acceptance を ORDER_DIGEST_MISSING で拒否する", () => {
    expect(evaluateParentAcceptanceOrdering(acceptanceRequest({ review: null }) as never)).toEqual({
      ok: false,
      failure_code: "WORK_GRAPH_ORDER_DIGEST_MISSING",
    });
  });

  it("U-WGR-030: terminal 未 seal の acceptance を ORDER_DIGEST_MISSING で拒否する", () => {
    const broken = { ...terminalReceipt(), diff_digest: digest("mutated") };
    expect(
      evaluateParentAcceptanceOrdering(acceptanceRequest({ terminal: broken }) as never),
    ).toEqual({ ok: false, failure_code: "WORK_GRAPH_ORDER_DIGEST_MISSING" });
    const foreign = terminalReceipt({ review: sealedReview({ reviewer: { model: "gpt-other" } }) });
    expect(
      evaluateParentAcceptanceOrdering(acceptanceRequest({ terminal: foreign }) as never),
    ).toEqual({ ok: false, failure_code: "WORK_GRAPH_ORDER_DIGEST_MISSING" });
  });

  it("U-WGR-031: 同一 identity の review 発行を既存 failure code で拒否する", () => {
    expect(reviewAdmission({ reviewerCurrent: reviewerOrigin({ identity: "worker-a" }) })).toEqual({
      ok: false,
      failure_code: "HIL_ORCHESTRATION_IDENTITY_NOT_SEPARATED",
    });
  });

  it("U-WGR-032: 同一 session の review 発行を既存 failure code で拒否する", () => {
    expect(reviewAdmission({ reviewerCurrent: reviewerOrigin({ session: "session-a" }) })).toEqual({
      ok: false,
      failure_code: "HIL_ORCHESTRATION_SESSION_NOT_SEPARATED",
    });
  });

  it("U-WGR-033: 同一 context_digest の review 発行を既存 failure code で拒否する", () => {
    expect(
      reviewAdmission({ reviewerCurrent: reviewerOrigin({ context_digest: digest("context-a") }) }),
    ).toEqual({ ok: false, failure_code: "HIL_ORCHESTRATION_CONTEXT_NOT_INDEPENDENT" });
  });

  it("U-WGR-034: evaluator=writer の自己 acceptance を拒否する", () => {
    expect(
      evaluateParentAcceptanceOrdering(
        acceptanceRequest({
          evaluator: {
            identity: "worker-a",
            session: "session-tl",
            context_digest: digest("context-tl"),
          },
        }) as never,
      ),
    ).toEqual({ ok: false, failure_code: "WORK_GRAPH_SELF_ACCEPTANCE" });
  });

  it("U-WGR-035: evaluator=reviewer の自己 acceptance を拒否する", () => {
    expect(
      evaluateParentAcceptanceOrdering(
        acceptanceRequest({
          evaluator: {
            identity: "tl-evaluator",
            session: "session-tl",
            context_digest: digest("context-b"),
          },
        }) as never,
      ),
    ).toEqual({ ok: false, failure_code: "WORK_GRAPH_SELF_ACCEPTANCE" });
  });

  it("U-WGR-036: delegation の candidate_head drift を拒否する", () => {
    const review = sealedReview();
    expect(
      evaluateParentAcceptanceOrdering(
        acceptanceRequest({
          delegation: sealedDelegation({
            requiredCellBinding: cellBinding({ candidate_head: OTHER_HEAD }),
          }),
          review,
          terminal: terminalReceipt({ review }),
        }) as never,
      ),
    ).toEqual({ ok: false, failure_code: "WORK_GRAPH_HEAD_DRIFT" });
  });

  it("U-WGR-037: review_head_sha の drift を拒否する", () => {
    expect(
      evaluateParentAcceptanceOrdering(acceptanceRequest({ reviewHeadSha: OTHER_HEAD }) as never),
    ).toEqual({ ok: false, failure_code: "WORK_GRAPH_HEAD_DRIFT" });
  });

  it("U-WGR-038: terminal head_sha の drift を拒否する", () => {
    const review = sealedReview();
    expect(
      evaluateParentAcceptanceOrdering(
        acceptanceRequest({
          review,
          terminal: terminalReceipt({ review, headSha: OTHER_HEAD }),
        }) as never,
      ),
    ).toEqual({ ok: false, failure_code: "WORK_GRAPH_HEAD_DRIFT" });
  });

  it("U-WGR-039: verdict=reject の acceptance を REVIEW_NOT_APPROVED で拒否する", () => {
    const review = sealedReview({ verdict: "reject" });
    expect(
      evaluateParentAcceptanceOrdering(
        acceptanceRequest({
          review,
          terminal: terminalReceipt({ review, terminalState: "rejected" }),
        }) as never,
      ),
    ).toEqual({ ok: false, failure_code: "WORK_GRAPH_REVIEW_NOT_APPROVED" });
  });

  it("U-WGR-040: terminal 欠落の acceptance を TERMINAL_MISSING で拒否する", () => {
    expect(
      evaluateParentAcceptanceOrdering(acceptanceRequest({ terminal: null }) as never),
    ).toEqual({ ok: false, failure_code: "WORK_GRAPH_TERMINAL_MISSING" });
  });

  it("U-WGR-041: 4 段が揃った入力で parent acceptance receipt を 1 件 seal する", () => {
    const request = acceptanceRequest();
    const result = evaluateParentAcceptanceOrdering(request as never);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(isParentAcceptanceReceipt(result.receipt)).toBe(true);
    expect(result.receipt.delegation_receipt_digest).toBe(request.delegation.receipt_digest);
    expect(result.receipt.review_receipt_digest).toBe(request.review.receipt_digest);
    expect(result.receipt.terminal_receipt_digest).toBe(request.terminal.receipt_digest);
    const { receipt_digest, ...payload } = result.receipt;
    expect(receipt_digest).toBe(sha256Digest(canonicalJson(payload)));
    expect(
      evaluateParentAcceptanceOrdering(
        acceptanceRequest({
          delegation: { ...request.delegation, issued_at: "2026-01-01T00:00:00Z" },
        }) as never,
      ),
    ).toEqual({ ok: false, failure_code: "WORK_GRAPH_ORDER_DIGEST_MISSING" });
  });

  it("U-WGR-042: 同一入力の再評価が同一 digest と lease owner を返す", () => {
    const first = evaluateDelegationRequestOrdering(delegationRequest());
    const second = evaluateDelegationRequestOrdering(delegationRequest());
    expect(first.ok && second.ok).toBe(true);
    if (!first.ok || !second.ok) return;
    expect(first.receipt.receipt_digest).toBe(second.receipt.receipt_digest);
    expect(first.receipt.required_cell_binding.writer_lease.owner).toBe(
      second.receipt.required_cell_binding.writer_lease.owner,
    );
    const request = acceptanceRequest();
    const a = evaluateParentAcceptanceOrdering(request as never);
    const b = evaluateParentAcceptanceOrdering(request as never);
    expect(a.ok && b.ok).toBe(true);
    if (!a.ok || !b.ok) return;
    expect(a.receipt.receipt_digest).toBe(b.receipt.receipt_digest);
  });

  it("U-WGR-043: 不正な identifier 形式を INPUT_INVALID で拒否する", () => {
    for (const binding of [cellBinding({ lane_id: "" }), cellBinding({ issue_id: "issue 213" })]) {
      expect(
        evaluateDelegationRequestOrdering(delegationRequest({ requiredCellBinding: binding })),
      ).toEqual({ ok: false, failure_code: "WORK_GRAPH_INPUT_INVALID" });
    }
  });

  it("U-WGR-044: delegation 判定の各分岐が独立に到達する", () => {
    const codes = [
      evaluateDelegationRequestOrdering(
        delegationRequest({ requiredDependencyEdgeIds: ["edge-9"] }),
      ),
      evaluateDelegationRequestOrdering(
        delegationRequest({ requiredCellBinding: bindingWithout("lane_id") }),
      ),
      evaluateDelegationRequestOrdering(delegationRequest({ changedPaths: ["docs/plans"] })),
      evaluateDelegationRequestOrdering(delegationRequest({ lease: lease({ fence_token: 9 }) })),
      evaluateDelegationRequestOrdering(
        delegationRequest({
          requiredCellBinding: cellBinding({
            lane_ready_receipt: { graph_snapshot_digest: null, dependency_edge_ids: ["edge-1"] },
          }),
        }),
      ),
    ].map((result) => (result.ok ? "ok" : result.failure_code));
    expect(codes).toEqual([
      "WORK_GRAPH_DEPENDENCY_NOT_READY",
      "WORK_GRAPH_CELL_BINDING_INVALID",
      "WORK_GRAPH_SCOPE_PATH_VIOLATION",
      "WORK_GRAPH_LEASE_CAS_STALE",
      "WORK_GRAPH_RECEIPT_FUTURE_WRITE",
    ]);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it("U-WGR-045: parent acceptance 判定の各分岐が独立に到達する", () => {
    const rejectReview = sealedReview({ verdict: "reject" });
    const codes = [
      evaluateParentAcceptanceOrdering(acceptanceRequest({ delegation: null }) as never),
      evaluateParentAcceptanceOrdering(acceptanceRequest({ terminal: null }) as never),
      evaluateParentAcceptanceOrdering(acceptanceRequest({ reviewHeadSha: OTHER_HEAD }) as never),
      evaluateParentAcceptanceOrdering(
        acceptanceRequest({
          review: rejectReview,
          terminal: terminalReceipt({ review: rejectReview, terminalState: "rejected" }),
        }) as never,
      ),
      evaluateParentAcceptanceOrdering(
        acceptanceRequest({
          evaluator: { identity: "worker-a", session: "s", context_digest: digest("c") },
        }) as never,
      ),
    ].map((result) => (result.ok ? "ok" : result.failure_code));
    expect(codes).toEqual([
      "WORK_GRAPH_ORDER_DIGEST_MISSING",
      "WORK_GRAPH_TERMINAL_MISSING",
      "WORK_GRAPH_HEAD_DRIFT",
      "WORK_GRAPH_REVIEW_NOT_APPROVED",
      "WORK_GRAPH_SELF_ACCEPTANCE",
    ]);
    expect(new Set(codes).size).toBe(codes.length);
  });
});

/** PLAN-L1-07-infinity-loop-platform-requirements — U-AGLC-010/U-AGLC-020 */

import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  type AgentMusterMemberV1,
  type AgentResultArtifactAdmissionDecisionV1,
  type AgentVerificationReceiptV1,
  type AgentVerificationResultV1,
  type AgentVerificationSubjectV1,
  enforceAgentRoleSeparation,
  evaluateAgentVerificationReceipt,
} from "../src/orchestration/harness-agent-standard";

const worker: AgentMusterMemberV1 = {
  member_index: 0,
  agent_id: "worker",
  contract_version: "1.0.0",
  role: "worker",
  provider_family: "codex",
  model_family: "gpt",
  context_digest: "worker-context",
  verification_pattern_digest: "patterns",
};
const verifier: AgentMusterMemberV1 = {
  ...worker,
  member_index: 1,
  agent_id: "verifier",
  role: "verifier",
  provider_family: "claude",
  model_family: "sonnet",
  context_digest: "verifier-context",
};
describe("agent verification separation", () => {
  it("U-AGLC-010: identity/role/provider/model familyを独立化する", () => {
    expect(enforceAgentRoleSeparation(worker, verifier).ok).toBe(true);
    expect(enforceAgentRoleSeparation(worker, { ...verifier, agent_id: "worker" })).toEqual(
      expect.objectContaining({ ok: false, code: "HIL_ROLE_SEPARATION_VIOLATION" }),
    );
    expect(enforceAgentRoleSeparation(worker, { ...verifier, provider_family: "codex" })).toEqual(
      expect.objectContaining({ ok: false, code: "HIL_AGENT_VERIFIER_NOT_INDEPENDENT" }),
    );
    expect(enforceAgentRoleSeparation(worker, { ...verifier, model_family: "gpt" }).ok).toBe(false);
  });

  it("U-AGLC-020: independent verifierのexact valid pass receiptだけを採用する", () => {
    const sha = (value: unknown): string =>
      createHash("sha256")
        .update(
          JSON.stringify(value, (_key, child) =>
            child && typeof child === "object" && !Array.isArray(child)
              ? Object.fromEntries(Object.entries(child).sort(([a], [b]) => a.localeCompare(b)))
              : child,
          ),
        )
        .digest("hex");
    const workerSubject: AgentVerificationSubjectV1 = {
      schema_version: "helix-agent-verification-subject.v1",
      instance_id: "worker-instance",
      role: "worker",
      provider_family: "codex",
      model_family: "gpt",
    };
    const verifierSubject: AgentVerificationSubjectV1 = {
      schema_version: "helix-agent-verification-subject.v1",
      instance_id: "verifier-instance",
      role: "verifier",
      provider_family: "claude",
      model_family: "sonnet",
    };
    const verificationResult: AgentVerificationResultV1 = {
      schema_version: "helix-agent-verification-result.v1",
      worker_instance_id: workerSubject.instance_id,
      oracle_id: "U-AGLC-020",
      input_digest: "a".repeat(64),
      result_digest: "b".repeat(64),
      evidence_digest: "c".repeat(64),
      artifact_admission_decision_digest: "d".repeat(64),
    };
    const admissionPreimage = {
      schema_version: "helix-agent-result-artifact-admission.v1" as const,
      instance_id: workerSubject.instance_id,
      relative_path: "results/output.json",
      digest: "9".repeat(64),
      fence: 4,
      state: "admitted" as const,
      admitted: true,
      acceptance_authority: false as const,
      terminal: false as const,
      verification_pending: true as const,
      failure_code: null,
    };
    const admission: AgentResultArtifactAdmissionDecisionV1 = {
      ...admissionPreimage,
      decision_digest: sha(admissionPreimage),
    };
    verificationResult.artifact_admission_decision_digest = admission.decision_digest;
    const receiptPreimage = {
      schema_version: "helix-agent-verification-receipt.v1" as const,
      worker_instance_id: workerSubject.instance_id,
      verifier_instance_id: verifierSubject.instance_id,
      oracle_id: verificationResult.oracle_id,
      input_digest: verificationResult.input_digest,
      result_digest: verificationResult.result_digest,
      evidence_digest: verificationResult.evidence_digest,
      artifact_admission_decision_digest: verificationResult.artifact_admission_decision_digest,
      worker_provider_family: workerSubject.provider_family,
      worker_model_family: workerSubject.model_family,
      verifier_provider_family: verifierSubject.provider_family,
      verifier_model_family: verifierSubject.model_family,
      receipt_state: "valid" as const,
      decision: "pass" as const,
    };
    const sealReceipt = (
      overrides: Partial<Omit<AgentVerificationReceiptV1, "receipt_digest">> = {},
    ): AgentVerificationReceiptV1 => {
      const preimage = { ...receiptPreimage, ...overrides };
      return { ...preimage, receipt_digest: sha(preimage) };
    };
    const receipt = sealReceipt();
    const accepted = evaluateAgentVerificationReceipt(
      workerSubject,
      verifierSubject,
      admission,
      verificationResult,
      receipt,
    );
    expect(accepted).toMatchObject({
      accepted: true,
      release_authority: false,
      terminal: false,
      failure_code: null,
    });
    expect(accepted.decision_digest).toMatch(/^[0-9a-f]{64}$/);

    const invalidCases: Array<
      [
        AgentVerificationSubjectV1,
        AgentVerificationSubjectV1,
        AgentVerificationResultV1,
        AgentVerificationReceiptV1,
      ]
    > = [
      [
        workerSubject,
        { ...verifierSubject, instance_id: workerSubject.instance_id },
        verificationResult,
        receipt,
      ],
      [
        workerSubject,
        { ...verifierSubject, provider_family: workerSubject.provider_family },
        verificationResult,
        receipt,
      ],
      [
        workerSubject,
        { ...verifierSubject, model_family: workerSubject.model_family },
        verificationResult,
        receipt,
      ],
      [workerSubject, verifierSubject, { ...verificationResult, oracle_id: "other" }, receipt],
      [
        workerSubject,
        verifierSubject,
        { ...verificationResult, input_digest: "e".repeat(64) },
        receipt,
      ],
      [
        workerSubject,
        verifierSubject,
        { ...verificationResult, result_digest: "e".repeat(64) },
        receipt,
      ],
      [
        workerSubject,
        verifierSubject,
        { ...verificationResult, evidence_digest: "e".repeat(64) },
        receipt,
      ],
      [
        workerSubject,
        verifierSubject,
        { ...verificationResult, artifact_admission_decision_digest: "e".repeat(64) },
        receipt,
      ],
      [workerSubject, verifierSubject, verificationResult, sealReceipt({ receipt_state: "stale" })],
      [
        workerSubject,
        verifierSubject,
        verificationResult,
        sealReceipt({ receipt_state: "revoked" }),
      ],
      [workerSubject, verifierSubject, verificationResult, sealReceipt({ decision: "fail" })],
      [
        workerSubject,
        verifierSubject,
        verificationResult,
        sealReceipt({ decision: "inconclusive" }),
      ],
      [
        workerSubject,
        verifierSubject,
        verificationResult,
        { ...receipt, receipt_digest: "e".repeat(64) },
      ],
      [{ ...workerSubject, unknown: true } as never, verifierSubject, verificationResult, receipt],
      [workerSubject, { ...verifierSubject, unknown: true } as never, verificationResult, receipt],
      [workerSubject, verifierSubject, { ...verificationResult, unknown: true } as never, receipt],
      [workerSubject, verifierSubject, verificationResult, { ...receipt, unknown: true } as never],
      [null as never, verifierSubject, verificationResult, receipt],
      [workerSubject, null as never, verificationResult, receipt],
      [workerSubject, verifierSubject, null as never, receipt],
      [workerSubject, verifierSubject, verificationResult, null as never],
    ];
    for (const args of invalidCases) {
      expect(
        evaluateAgentVerificationReceipt(args[0], args[1], admission, args[2], args[3]),
      ).toMatchObject({
        accepted: false,
        release_authority: false,
        terminal: false,
      });
    }
    expect(
      evaluateAgentVerificationReceipt(
        workerSubject,
        verifierSubject,
        { ...admission, decision_digest: "f".repeat(64) },
        verificationResult,
        receipt,
      ),
    ).toMatchObject({ accepted: false });
    expect(
      evaluateAgentVerificationReceipt(
        workerSubject,
        verifierSubject,
        { ...admission, unknown: true } as never,
        verificationResult,
        receipt,
      ),
    ).toMatchObject({ accepted: false });
    expect(
      evaluateAgentVerificationReceipt(
        workerSubject,
        verifierSubject,
        admission,
        verificationResult,
        sealReceipt({ worker_provider_family: "forged", worker_model_family: "forged" }),
      ),
    ).toMatchObject({ accepted: false });
    expect(
      evaluateAgentVerificationReceipt(
        workerSubject,
        verifierSubject,
        admission,
        verificationResult,
        sealReceipt({ verifier_provider_family: "forged", verifier_model_family: "forged" }),
      ),
    ).toMatchObject({ accepted: false });
  });
});

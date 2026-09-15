import { describe, expect, it } from "vitest";
import {
  RUNTIME_ORCHESTRATION_SCHEMA_VERSION,
  UNIVERSAL_WORKFLOW_ENVELOPE_VERSION,
  UNIVERSAL_WORKFLOW_SCHEMA_VERSION,
  validateUniversalWorkflowEnvelope,
  WORKFLOW_ATOM_KINDS,
} from "../src/workflow/universal-workflow-envelope";

// PLAN-L7-478-universal-workflow-envelope
const DIGEST = `sha256:${"a".repeat(64)}`;

function validEnvelope(): Record<string, unknown> {
  return {
    schema_version: UNIVERSAL_WORKFLOW_ENVELOPE_VERSION,
    source: { source_id: "source:order", revision: "r1", digest: DIGEST },
    workflow_model: {
      schema_version: UNIVERSAL_WORKFLOW_SCHEMA_VERSION,
      workflow_id: "workflow:order",
      revision: "r1",
      source_digest: DIGEST,
      atoms: [
        { atom_id: "target:order", kind: "target", value: "注文を完了する" },
        {
          atom_id: "actor:buyer",
          kind: "actor",
          actor_id: "buyer",
          responsibility: "注文者",
        },
        { atom_id: "state:draft", kind: "state", state_id: "draft", name: "下書き" },
        { atom_id: "state:done", kind: "state", state_id: "done", name: "完了" },
        { atom_id: "trigger:submit", kind: "trigger", trigger_id: "submit", event: "送信" },
        {
          atom_id: "data:amount",
          kind: "data",
          data_id: "amount",
          data_type: "integer",
          required: true,
          validation: "1以上",
          nullable: false,
          ssot: "order",
          mutable: false,
          sensitive: false,
          retention: "7年",
        },
        {
          atom_id: "condition:valid",
          kind: "condition",
          condition_id: "valid",
          expression: "amount > 0",
          data_ids: ["amount"],
        },
        {
          atom_id: "condition:retry",
          kind: "condition",
          condition_id: "retry",
          expression: "attempt < 3",
          data_ids: ["amount"],
        },
        {
          atom_id: "condition:stop",
          kind: "condition",
          condition_id: "stop",
          expression: "attempt >= 3",
          data_ids: ["amount"],
        },
        {
          atom_id: "action:commit",
          kind: "action",
          action_id: "commit",
          operation: "注文を確定する",
        },
        {
          atom_id: "transition:submit",
          kind: "transition",
          transition_id: "submit-order",
          current_state_id: "draft",
          trigger_id: "submit",
          condition_ids: ["valid"],
          action_ids: ["commit"],
          next_state_id: "done",
        },
        {
          atom_id: "loop:retry",
          kind: "loop",
          loop_id: "retry",
          return_state_id: "draft",
          continue_condition_id: "retry",
          stop_condition_id: "stop",
          max_iterations: 3,
          on_limit: "dead_letter",
        },
        {
          atom_id: "notification:done",
          kind: "notification",
          notification_id: "done-note",
          event: "注文完了",
          recipient_actor_ids: ["buyer"],
        },
        {
          atom_id: "audit:done",
          kind: "audit",
          audit_id: "done-audit",
          event: "注文完了",
          retained_for: "7年",
        },
        {
          atom_id: "terminal:done",
          kind: "terminal",
          terminal_id: "done",
          terminal_kind: "normal",
          state_id: "done",
          post_updates: ["在庫を更新"],
          notification_ids: ["done-note"],
          audit_ids: ["done-audit"],
          restartable: false,
        },
        {
          atom_id: "exception:commit",
          kind: "exception",
          exception_id: "commit-failed",
          source_transition_id: "submit-order",
          recovery_state_id: "draft",
        },
        {
          atom_id: "permission:commit",
          kind: "permission",
          permission_id: "commit-order",
          actor_id: "buyer",
          action_ids: ["commit"],
        },
        {
          atom_id: "timeout:submit",
          kind: "timeout",
          timeout_id: "submit-timeout",
          transition_id: "submit-order",
          duration_ms: 30_000,
          on_timeout_state_id: "draft",
        },
      ],
    },
    unresolved_items: [],
    derived_requirements: [
      {
        requirement_id: "FR-ORDER-001",
        source_transition_id: "submit-order",
        layer: "L3",
        status: "candidate",
      },
    ],
    coverage_report: {
      required_atom_kinds: [...WORKFLOW_ATOM_KINDS],
      covered_atom_kinds: [...WORKFLOW_ATOM_KINDS],
      missing_atom_kinds: [],
    },
    contract_candidates: [
      {
        contract_id: "contract:submit",
        source_transition_id: "submit-order",
        contract_kind: "oracle",
        statement: "有効な注文だけ完了する",
      },
    ],
    runtime_orchestration: {
      schema_version: RUNTIME_ORCHESTRATION_SCHEMA_VERSION,
      source_digest: DIGEST,
      execution_id: "execution:order",
      capability_constraints: ["order-write"],
      capacity_limit: 10,
      concurrency_limit: 2,
      fallback: "manual-review",
      dead_letter: "order-dead-letter",
    },
  };
}

describe("universal workflow envelope", () => {
  it("U-UWENV-001: exact atom setとcoverageを同じenvelopeへ束縛する", () => {
    expect(validateUniversalWorkflowEnvelope(validEnvelope())).toMatchObject({
      ok: true,
      activation_allowed: true,
      findings: [],
    });
  });

  it("U-UWENV-002: loopとterminalの必須field欠落を拒否する", () => {
    const input = validEnvelope();
    const model = input.workflow_model as { atoms: Record<string, unknown>[] };
    delete model.atoms.find((atom) => atom.kind === "loop")?.max_iterations;
    expect(validateUniversalWorkflowEnvelope(input)).toMatchObject({
      ok: false,
      activation_allowed: false,
    });
  });

  it("U-UWENV-003: condition dataのretention欠落を拒否する", () => {
    const input = validEnvelope();
    const model = input.workflow_model as { atoms: Record<string, unknown>[] };
    delete model.atoms.find((atom) => atom.kind === "data")?.retention;
    expect(validateUniversalWorkflowEnvelope(input).findings[0]?.code).toBe("schema_invalid");
  });

  it("U-UWENV-004: 5出力envelope欠落とsource digest driftを拒否する", () => {
    const missing = validEnvelope();
    delete missing.contract_candidates;
    expect(validateUniversalWorkflowEnvelope(missing).ok).toBe(false);

    const drift = validEnvelope();
    (drift.workflow_model as { source_digest: string }).source_digest = `sha256:${"b".repeat(64)}`;
    expect(
      validateUniversalWorkflowEnvelope(drift).findings.map((finding) => finding.code),
    ).toContain("source_digest_mismatch");
  });

  it("U-UWENV-005: 旧workflow schema単体とruntime composition欠落をactivationしない", () => {
    const workflowOnly = (validEnvelope().workflow_model ?? {}) as Record<string, unknown>;
    expect(validateUniversalWorkflowEnvelope(workflowOnly).activation_allowed).toBe(false);

    const oldRuntime = validEnvelope();
    (oldRuntime.runtime_orchestration as { schema_version: string }).schema_version =
      "workflow-model.v1";
    expect(validateUniversalWorkflowEnvelope(oldRuntime).activation_allowed).toBe(false);
  });

  it("生成物のmissing transition参照とcapacity超過を拒否する", () => {
    const missingReference = validEnvelope();
    (
      missingReference.derived_requirements as { source_transition_id: string }[]
    )[0].source_transition_id = "missing";
    expect(
      validateUniversalWorkflowEnvelope(missingReference).findings.map((finding) => finding.code),
    ).toContain("atom_reference_missing");

    const invalidLimit = validEnvelope();
    (
      invalidLimit.runtime_orchestration as {
        capacity_limit: number;
        concurrency_limit: number;
      }
    ).concurrency_limit = 11;
    expect(
      validateUniversalWorkflowEnvelope(invalidLimit).findings.map((finding) => finding.code),
    ).toContain("runtime_limit_invalid");
  });
});

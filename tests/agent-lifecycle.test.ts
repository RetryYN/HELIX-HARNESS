/** PLAN-L1-07-infinity-loop-platform-requirements — U-AGLC-011/012 */
import { describe, expect, it } from "vitest";
import {
  type AgentMusterV1,
  createAgentLifecycleInstance,
  type HarnessAgentContractV1,
  type HarnessAgentTaskV1,
  validateAgentLifecycleTransition,
} from "../src/orchestration/harness-agent-standard";

const contract: HarnessAgentContractV1 = {
  schema_version: "helix-agent-contract.v1",
  agent_id: "worker",
  contract_version: "1.2.3",
  supersedes: null,
  capability_class: "typescript",
  applicable_layers: ["L7"],
  applicable_drives: ["Forward"],
  task_kinds: ["implementation"],
  verification_patterns: ["artifact-contract"],
  role_archetype: "worker",
  provider_policy_id: "provider.v1",
  model_policy_id: "model.v1",
  context_pack_id: "context.v1",
  required_skills: [],
  required_reads: [],
  generates: [],
  forbidden_paths: [],
  blind_policy: "none",
  compatibility: ["node24-linux"],
  status: "eligible",
  source_digest: "a".repeat(64),
};
const task: HarnessAgentTaskV1 = {
  task_identity_digest: "task",
  plan_or_issue_id: "PLAN-L1-07",
  layer: "L7",
  drive: "Forward",
  task_kind: "implementation",
  task_risk: "high",
  capability_class: "typescript",
  required_role: "worker",
  compatibility: "node24-linux",
};
const member = {
  member_index: 0,
  agent_id: "worker",
  contract_version: "1.2.3",
  role: "worker" as const,
  provider_family: "codex",
  model_family: "gpt",
  context_digest: "context",
  verification_pattern_digest: "pattern",
};
const muster: AgentMusterV1 = {
  schema_version: "helix-agent-muster.v1",
  task_identity_digest: "task",
  verification_patterns: ["artifact-contract"],
  registry_snapshot_digest: "registry",
  policy_snapshot_digest: "policy",
  members: [member],
  team_digest: "team",
};

describe("agent lifecycle pure contract", () => {
  it("U-AGLC-011: 同一bindingからdeterministic mustered seedだけを生成する", () => {
    const first = createAgentLifecycleInstance(muster, member, contract, task, 1);
    const second = createAgentLifecycleInstance(muster, member, contract, task, 1);
    expect(first).toEqual(second);
    expect(first).toEqual(
      expect.objectContaining({
        ok: true,
        value: expect.objectContaining({ initial_state: "mustered" }),
      }),
    );
    if (first.ok) {
      expect(first.value).not.toHaveProperty("ready");
      expect(first.value).not.toHaveProperty("lease");
      expect(first.value).not.toHaveProperty("execution_authorized");
    }
    expect(createAgentLifecycleInstance(muster, member, contract, task, 0).ok).toBe(false);
  });

  it("U-AGLC-012: closed graphとverification prerequisiteだけを許可する", () => {
    expect(validateAgentLifecycleTransition("mustered", "leased", []).allowed).toBe(true);
    expect(validateAgentLifecycleTransition("running", "checkpointed", []).allowed).toBe(true);
    expect(validateAgentLifecycleTransition("checkpointed", "running", []).allowed).toBe(true);
    expect(validateAgentLifecycleTransition("failed", "verified", [])).toEqual(
      expect.objectContaining({
        allowed: false,
        failure_code: "HIL_AGENT_STATE_TRANSITION_INVALID",
      }),
    );
    expect(validateAgentLifecycleTransition("verification_pending", "released", [])).toEqual(
      expect.objectContaining({
        allowed: false,
        failure_code: "HIL_AGENT_STATE_TRANSITION_INVALID",
      }),
    );
    expect(validateAgentLifecycleTransition("verification_pending", "verified", [])).toEqual(
      expect.objectContaining({ allowed: false, failure_code: "HIL_AGENT_LIFECYCLE_INVALID" }),
    );
    expect(
      validateAgentLifecycleTransition("verification_pending", "verified", ["verification_pass"])
        .allowed,
    ).toBe(true);
    expect(validateAgentLifecycleTransition("retired", "leased", []).allowed).toBe(false);
  });
});

/** PLAN-L1-07-infinity-loop-platform-requirements — U-AGLC-005/006/007/008 */
import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  classifyAgentEligibility,
  compareAgentMusterRerun,
  type HarnessAgentContractV1,
  type HarnessAgentTaskV1,
  resolveAgentVerificationPatterns,
  resolveDeterministicAgentMuster,
} from "../src/orchestration/harness-agent-standard";

const digest = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
const contract: HarnessAgentContractV1 = {
  schema_version: "helix-agent-contract.v1",
  agent_id: "worker",
  contract_version: "1.0.0",
  supersedes: null,
  capability_class: "typescript",
  applicable_layers: ["L7"],
  applicable_drives: ["Forward"],
  task_kinds: ["implementation"],
  verification_patterns: ["artifact-contract", "independent-verifier", "adversarial-review"],
  role_archetype: "worker",
  provider_policy_id: "provider.v1",
  model_policy_id: "model.v1",
  context_pack_id: "implementation.v1",
  required_skills: [],
  required_reads: ["design.md"],
  generates: ["src/**"],
  forbidden_paths: [".helix/**"],
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

function eligiblePair() {
  const worker = classifyAgentEligibility(contract, task, contract.verification_patterns, {
    provider_family: "codex",
    model_family: "gpt",
    available: true,
  });
  const verifierContract = {
    ...contract,
    agent_id: "verifier",
    role_archetype: "verifier" as const,
    blind_policy: "claim-blind" as const,
  };
  const verifier = classifyAgentEligibility(
    verifierContract,
    { ...task, required_role: "verifier" },
    contract.verification_patterns,
    { provider_family: "claude", model_family: "sonnet", available: true },
  );
  if (!worker.ok || !verifier.ok) throw new Error("fixture eligibility failed");
  return [worker.value, verifier.value] as const;
}

describe("agent muster", () => {
  it("U-AGLC-005: eligibility constraintsをAND評価する", () => {
    expect(eligiblePair()).toHaveLength(2);
    expect(
      classifyAgentEligibility(
        { ...contract, status: "quarantined" },
        task,
        contract.verification_patterns,
        { provider_family: "codex", model_family: "gpt", available: true },
      ),
    ).toEqual(expect.objectContaining({ ok: false, code: "HIL_AGENT_MUSTER_NO_ELIGIBLE" }));
  });
  it("U-AGLC-006: task kindからversioned patternだけを解決する", () => {
    expect(
      resolveAgentVerificationPatterns("implementation", "helix-verification.v1", "high"),
    ).toEqual(
      expect.objectContaining({
        ok: true,
        value: expect.objectContaining({
          pattern_ids: ["adversarial-review", "artifact-contract", "independent-verifier"],
        }),
      }),
    );
    expect(
      resolveAgentVerificationPatterns("implementation-worker", "helix-verification.v1", "high").ok,
    ).toBe(false);
  });
  it("U-AGLC-008: 候補順によらないW-agent teamを生成する", () => {
    const pair = eligiblePair();
    const a = resolveDeterministicAgentMuster(task, contract.verification_patterns, pair);
    const b = resolveDeterministicAgentMuster(
      task,
      contract.verification_patterns,
      [...pair].reverse(),
    );
    expect(a.ok && b.ok).toBe(true);
    if (a.ok && b.ok) expect(a.value.team_digest).toBe(b.value.team_digest);
    expect(resolveDeterministicAgentMuster(task, contract.verification_patterns, []).ok).toBe(
      false,
    );
  });
  it("U-AGLC-007: normalized input/member/context/team mutationをfailure化する", () => {
    const result = resolveDeterministicAgentMuster(
      task,
      contract.verification_patterns,
      eligiblePair(),
    );
    if (!result.ok) throw new Error("fixture muster failed");
    const expected = {
      normalized_input_digest: "normalized",
      registry_snapshot_digest: result.value.registry_snapshot_digest,
      policy_snapshot_digest: result.value.policy_snapshot_digest,
      verification_pattern_digest: digest(result.value.verification_patterns),
      member_set_digest: digest(result.value.members),
      context_set_digest: digest(result.value.members.map((x) => x.context_digest)),
      expected_team_digest: result.value.team_digest,
    };
    expect(compareAgentMusterRerun(expected, "normalized", result.value).ok).toBe(true);
    expect(
      compareAgentMusterRerun(expected, "normalized", {
        ...result.value,
        members: [...result.value.members].reverse(),
      }),
    ).toEqual(expect.objectContaining({ ok: false, code: "HIL_AGENT_MUSTER_NONDETERMINISTIC" }));
  });
});

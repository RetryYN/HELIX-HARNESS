/** PLAN-L1-07-infinity-loop-platform-requirements — U-AGLC-010 */
import { describe, expect, it } from "vitest";
import {
  type AgentMusterMemberV1,
  enforceAgentRoleSeparation,
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
});

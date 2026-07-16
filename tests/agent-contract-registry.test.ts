/** PLAN-L1-07-infinity-loop-platform-requirements — U-AGLC-001/002 */
import { describe, expect, it } from "vitest";
import {
  type HarnessAgentContractV1,
  parseHarnessAgentContract,
  parseHarnessAgentRegistry,
  resolveAgentContractSupersession,
} from "../src/orchestration/harness-agent-standard";

const contract: HarnessAgentContractV1 = {
  schema_version: "helix-agent-contract.v1",
  agent_id: "worker",
  contract_version: "1.0.0",
  supersedes: null,
  capability_class: "typescript",
  applicable_layers: ["L7"],
  applicable_drives: ["Forward"],
  task_kinds: ["implementation"],
  verification_patterns: ["artifact-contract", "independent-verifier"],
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

describe("agent contract registry", () => {
  it("U-AGLC-001: closed schemaと同一identity異digestを拒否する", () => {
    expect(parseHarnessAgentContract(contract).ok).toBe(true);
    expect(
      parseHarnessAgentContract({ ...contract, agent_id: "", local_prompt: "manual" }),
    ).toEqual(expect.objectContaining({ ok: false, code: "HIL_AGENT_CONTRACT_INCOMPLETE" }));
    expect(parseHarnessAgentContract({ ...contract, contract_version: "latest" }).ok).toBe(false);
    expect(parseHarnessAgentContract({ ...contract, source_digest: "not-sha256" }).ok).toBe(false);
    expect(
      parseHarnessAgentRegistry([contract, { ...contract, source_digest: "b".repeat(64) }]),
    ).toEqual(expect.objectContaining({ findings: ["identity_conflict:worker@1.0.0"] }));
  });

  it("U-AGLC-002: retired不可逆とquarantine承認済みrevisionを強制する", () => {
    const candidate = {
      ...contract,
      contract_version: "1.1.0",
      supersedes: "1.0.0",
      source_digest: "c".repeat(64),
    };
    expect(
      resolveAgentContractSupersession({ ...contract, status: "retired" }, candidate, null),
    ).toEqual(expect.objectContaining({ ok: false, code: "HIL_AGENT_RETIRED_RECLAIM" }));
    expect(
      resolveAgentContractSupersession({ ...contract, status: "quarantined" }, candidate, null),
    ).toEqual(
      expect.objectContaining({ ok: false, code: "HIL_AGENT_QUARANTINE_RELEASE_UNAUTHORIZED" }),
    );
    expect(
      resolveAgentContractSupersession({ ...contract, status: "quarantined" }, candidate, {
        approval_digest: "approval",
        approved_agent_id: "worker",
        approved_candidate_version: "1.1.0",
      }).ok,
    ).toBe(true);
    expect(
      resolveAgentContractSupersession(contract, { ...candidate, contract_version: "0.9.0" }, null)
        .ok,
    ).toBe(false);
  });
});

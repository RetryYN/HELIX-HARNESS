/** PLAN-L1-07-infinity-loop-platform-requirements — U-AGLC-009 */
import { describe, expect, it } from "vitest";
import {
  buildBlindAgentPacket,
  type HarnessAgentContractV1,
} from "../src/orchestration/harness-agent-standard";

const verifier: HarnessAgentContractV1 = {
  schema_version: "helix-agent-contract.v1",
  agent_id: "verifier",
  contract_version: "1.0.0",
  supersedes: null,
  capability_class: "typescript",
  applicable_layers: ["L7"],
  applicable_drives: ["Forward"],
  task_kinds: ["implementation"],
  verification_patterns: ["independent-verifier"],
  role_archetype: "verifier",
  provider_policy_id: "provider.v1",
  model_policy_id: "model.v1",
  context_pack_id: "verify.v1",
  required_skills: [],
  required_reads: ["spec.md"],
  generates: [],
  forbidden_paths: ["src/**"],
  blind_policy: "claim-blind",
  compatibility: ["node24-linux"],
  status: "eligible",
  source_digest: "b".repeat(64),
};
const input = {
  contract: verifier,
  frozen_input_digest: "input",
  allowed_read_paths: ["spec.md"],
  oracle_ids: ["AC-1"],
  artifact_digests: ["result"],
  redacted_evidence_digests: ["evidence"],
};
describe("agent blind packet", () => {
  it("U-AGLC-009: closed packetだけを生成しauthor/chat/reasoningを個別拒否する", () => {
    const allowed = buildBlindAgentPacket(input);
    expect(allowed.ok).toBe(true);
    if (allowed.ok)
      expect([allowed.value.author_claim_count, allowed.value.private_context_count]).toEqual([
        0, 0,
      ]);
    for (const author_context of [
      { author_claims: ["done"] },
      { chat_context: ["self"] },
      { worker_reasoning: ["because"] },
    ])
      expect(buildBlindAgentPacket({ ...input, author_context })).toEqual(
        expect.objectContaining({ ok: false, code: "HIL_AGENT_BLIND_CONTEXT_LEAK" }),
      );
  });
});

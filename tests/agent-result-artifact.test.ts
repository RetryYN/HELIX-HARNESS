/** PLAN-L1-07-infinity-loop-platform-requirements — U-AGLC-019 */
import { describe, expect, it } from "vitest";
import {
  type AgentLeaseV1,
  admitAgentResultArtifact,
} from "../src/orchestration/harness-agent-standard";

const lease: AgentLeaseV1 = {
  schema_version: "helix-agent-lease.v1",
  lease_id: "lease-4",
  instance_id: "instance-1",
  owner_session_id: "session-1",
  owner_run_id: "run-1",
  fence: 4,
  acquired_at: "2026-07-17T00:00:00.000Z",
  heartbeat_at: "2026-07-17T00:00:05.000Z",
  expires_at: "2026-07-17T00:01:00.000Z",
  state: "active",
};
const instance = { instance_id: "instance-1", state: "completed" as const, current_fence: 4 };
const artifact = {
  schema_version: "helix-agent-result-artifact.v1" as const,
  relative_path: "results/output.json",
  digest: "b".repeat(64),
  fence: 4,
  state: "staged" as const,
};

describe("agent result artifact admission", () => {
  it("U-AGLC-019: artifact admissionだけを行いacceptance/terminal authorityを持たない", () => {
    expect(admitAgentResultArtifact(instance, lease, artifact)).toEqual(
      expect.objectContaining({
        admitted: true,
        state: "admitted",
        failure_code: null,
        acceptance_authority: false,
        terminal: false,
        verification_pending: true,
      }),
    );
    for (const invalid of [
      admitAgentResultArtifact({ ...instance, state: "running" }, lease, artifact),
      admitAgentResultArtifact(instance, lease, { ...artifact, relative_path: "/tmp/output" }),
      admitAgentResultArtifact(instance, lease, { ...artifact, relative_path: "../output" }),
      admitAgentResultArtifact(instance, lease, { ...artifact, digest: "A".repeat(64) }),
      admitAgentResultArtifact(instance, lease, { ...artifact, fence: 3 }),
      admitAgentResultArtifact(instance, lease, { ...artifact, state: "admitted" } as never),
      admitAgentResultArtifact(instance, lease, { ...artifact, unknown: true } as never),
    ])
      expect(invalid).toEqual(
        expect.objectContaining({
          admitted: false,
          failure_code: "HIL_AGENT_FENCING_REJECTED",
          acceptance_authority: false,
          terminal: false,
          verification_pending: true,
        }),
      );
  });
});

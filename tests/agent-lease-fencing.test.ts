/** PLAN-L1-07-infinity-loop-platform-requirements — U-AGLC-014/015/016 */
import { describe, expect, it, vi } from "vitest";
import {
  type AgentLeaseAcquisitionBundleV1,
  type AgentLeaseAcquisitionStoreV1,
  type AgentLeaseV1,
  acquireAgentLease,
  evaluateAgentLeaseLiveness,
  fenceAgentOperation,
} from "../src/orchestration/harness-agent-standard";

const bundle: AgentLeaseAcquisitionBundleV1 = {
  operation_id: "lease-op-1",
  payload_digest: "payload-1",
  instance_id: "instance-1",
  owner_id: "session-1/run-1",
  expected_instance_revision: 3,
  expected_event_head: "event-3",
  expected_projection_head: "projection-3",
  expected_lease_head: null,
  next_fence: 4,
  lease_row_digest: "lease-row-4",
  instance_state_fence_digest: "instance-fence-4",
  transition_event_digest: "event-4",
  projection_digest: "projection-4",
  receipt_digest: "receipt-4",
};

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

describe("agent lease and fencing authority", () => {
  it("U-AGLC-014: lease取得は単一CAS store呼出しへ閉じactive lease競合を保存層から返す", async () => {
    const committed = {
      ok: true as const,
      value: {
        operation_id: bundle.operation_id,
        payload_digest: bundle.payload_digest,
        mutation_kind: "lease_acquisition" as const,
        instance_id: bundle.instance_id,
        fence: bundle.next_fence,
        before_event_head: bundle.expected_event_head,
        after_event_head: bundle.transition_event_digest,
        before_projection_head: bundle.expected_projection_head,
        after_projection_head: bundle.projection_digest,
        write_set_digest: "writes",
        row_count_digest: "rows",
      },
    };
    const commitLeaseAcquisition = vi.fn().mockResolvedValue(committed);
    const store: AgentLeaseAcquisitionStoreV1 = { commitLeaseAcquisition };
    await expect(acquireAgentLease(bundle, store)).resolves.toEqual(committed);
    expect(commitLeaseAcquisition).toHaveBeenCalledTimes(1);
    expect(commitLeaseAcquisition).toHaveBeenCalledWith(bundle);

    const conflictStore: AgentLeaseAcquisitionStoreV1 = {
      commitLeaseAcquisition: vi.fn().mockResolvedValue({
        ok: false,
        code: "HIL_AGENT_LEASE_ALREADY_ACTIVE",
        findings: ["active_lease"],
      }),
    };
    await expect(acquireAgentLease(bundle, conflictStore)).resolves.toEqual(
      expect.objectContaining({ ok: false, code: "HIL_AGENT_LEASE_ALREADY_ACTIVE" }),
    );
    expect(conflictStore.commitLeaseAcquisition).toHaveBeenCalledTimes(1);
  });

  it("U-AGLC-015: owner/fence/heartbeat/expiryをtrusted nowで一括判定する", () => {
    const live = evaluateAgentLeaseLiveness(
      lease,
      { session_id: "session-1", run_id: "run-1" },
      4,
      "2026-07-17T00:00:30.000Z",
    );
    expect(live).toEqual(expect.objectContaining({ live: true, expired: false }));

    for (const decision of [
      evaluateAgentLeaseLiveness(
        lease,
        { session_id: "other", run_id: "run-1" },
        4,
        "2026-07-17T00:00:30.000Z",
      ),
      evaluateAgentLeaseLiveness(
        lease,
        { session_id: "session-1", run_id: "run-1" },
        3,
        "2026-07-17T00:00:30.000Z",
      ),
      evaluateAgentLeaseLiveness(
        lease,
        { session_id: "session-1", run_id: "run-1" },
        4,
        "2026-07-17T00:01:00.000Z",
      ),
    ])
      expect(decision.live).toBe(false);
    expect(
      evaluateAgentLeaseLiveness(
        lease,
        { session_id: "session-1", run_id: "run-1" },
        4,
        "2026-07-17T00:01:00.000Z",
      ),
    ).toEqual(expect.objectContaining({ expired: true, failure_code: "HIL_AGENT_LEASE_EXPIRED" }));
  });

  it("U-AGLC-016: current active lease/fenceだけを許しcompletionと複合操作を区別する", () => {
    expect(fenceAgentOperation("instance-1", lease, 4, "completion")).toEqual(
      expect.objectContaining({ accepted: true, failure_code: null }),
    );
    expect(fenceAgentOperation("instance-1", lease, 3, "completion")).toEqual(
      expect.objectContaining({ accepted: false, failure_code: "HIL_AGENT_FENCING_REJECTED" }),
    );
    for (const operation of ["tool", "checkpoint", "artifact", "resume"] as const) {
      expect(fenceAgentOperation("instance-1", lease, 3, operation)).toEqual(
        expect.objectContaining({ accepted: false, failure_code: "HIL_AGENT_FENCING_VIOLATION" }),
      );
    }
    expect(fenceAgentOperation("other-instance", lease, 4, "tool")).toEqual(
      expect.objectContaining({ accepted: false, failure_code: "HIL_AGENT_FENCING_VIOLATION" }),
    );
    expect(
      fenceAgentOperation("instance-1", { ...lease, state: "expired" }, 4, "completion"),
    ).toEqual(
      expect.objectContaining({ accepted: false, failure_code: "HIL_AGENT_FENCING_REJECTED" }),
    );
  });
});

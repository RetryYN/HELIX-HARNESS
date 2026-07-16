/** PLAN-L1-07-infinity-loop-platform-requirements — U-AGLC-017/018 */
import { describe, expect, it } from "vitest";
import {
  type AgentCheckpointInstanceV1,
  type AgentCheckpointV1,
  type AgentLeaseV1,
  resolveAgentResumeCheckpoint,
  sealDurableAgentCheckpoint,
} from "../src/orchestration/harness-agent-standard";

const D = { contract: "c".repeat(64), input: "d".repeat(64), context: "e".repeat(64) };
const instance: AgentCheckpointInstanceV1 = {
  instance_id: "instance-1",
  state: "checkpointed",
  current_fence: 4,
  checkpoint_sequence: 1,
  contract_digest: D.contract,
  input_digest: D.input,
  context_digest: D.context,
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
const payload = {
  schema_version: "helix-agent-checkpoint-state.v1" as const,
  sequence: 2,
  fence: 4,
  contract_digest: D.contract,
  input_digest: D.input,
  context_digest: D.context,
  state_digest: "2".repeat(64),
};
const manifest = [
  {
    schema_version: "helix-agent-artifact-manifest-entry.v1" as const,
    relative_path: "evidence/result.json",
    digest: "a".repeat(64),
  },
];
const currentInput = {
  contract_digest: D.contract,
  input_digest: D.input,
  context_digest: D.context,
};

describe("agent durable checkpoint", () => {
  it("U-AGLC-017: closed exact schema/binding/sequence/fenceとmanifestをdurable sealする", () => {
    const first = sealDurableAgentCheckpoint(instance, lease, payload, manifest);
    expect(first).toEqual(
      expect.objectContaining({
        ok: true,
        value: expect.objectContaining({
          sequence: 2,
          fence: 4,
          state: "durable",
        }),
      }),
    );
    expect(first).toEqual(sealDurableAgentCheckpoint(instance, lease, payload, manifest));
    for (const invalid of [
      sealDurableAgentCheckpoint(
        instance,
        lease,
        { ...payload, schema_version: "bad" } as never,
        [],
      ),
      sealDurableAgentCheckpoint(instance, lease, { ...payload, sequence: 3 }, []),
      sealDurableAgentCheckpoint(instance, lease, { ...payload, fence: 3 }, []),
      sealDurableAgentCheckpoint(
        instance,
        lease,
        { ...payload, context_digest: "f".repeat(64) },
        [],
      ),
      sealDurableAgentCheckpoint(instance, lease, { ...payload, state_digest: "A".repeat(64) }, []),
      sealDurableAgentCheckpoint(instance, lease, { ...payload, unknown: true } as never, []),
      sealDurableAgentCheckpoint(instance, lease, null as never, []),
      sealDurableAgentCheckpoint(instance, lease, payload, [
        { ...manifest[0], relative_path: "../escape" },
      ]),
      sealDurableAgentCheckpoint(instance, lease, payload, [
        { ...manifest[0], unknown: true } as never,
      ]),
    ])
      expect(invalid).toEqual(
        expect.objectContaining({ ok: false, code: "HIL_AGENT_CHECKPOINT_INVALID" }),
      );
  });

  it("U-AGLC-018: current fence/bindingの最大durableだけをresumeし混在/重複/commit不整合を拒否する", () => {
    const sealed = sealDurableAgentCheckpoint(instance, lease, payload, []);
    const older = sealDurableAgentCheckpoint(
      { ...instance, checkpoint_sequence: 0 },
      lease,
      { ...payload, sequence: 1, state_digest: "1".repeat(64) },
      [],
    );
    expect(sealed.ok && older.ok).toBe(true);
    if (!sealed.ok || !older.ok) return;
    const staged: AgentCheckpointV1 = {
      ...older.value,
      state: "staged",
      checkpoint_digest: "f".repeat(64),
    };
    const resumeInstance = { ...instance, checkpoint_sequence: 2 };
    expect(
      resolveAgentResumeCheckpoint(
        resumeInstance,
        lease,
        [staged, older.value, sealed.value],
        currentInput,
      ),
    ).toEqual(
      expect.objectContaining({ ok: true, checkpoint: expect.objectContaining({ sequence: 2 }) }),
    );
    expect(
      resolveAgentResumeCheckpoint(
        resumeInstance,
        lease,
        [{ ...sealed.value, state_digest: "f".repeat(64) }],
        currentInput,
      ),
    ).toEqual(expect.objectContaining({ ok: false, code: "HIL_AGENT_CHECKPOINT_INVALID" }));
    for (const malformed of [null, 1, "checkpoint", [], [sealed.value]]) {
      expect(
        resolveAgentResumeCheckpoint(
          resumeInstance,
          lease,
          [malformed as never, older.value, sealed.value],
          currentInput,
        ),
      ).toEqual(expect.objectContaining({ ok: false, code: "HIL_AGENT_CHECKPOINT_INVALID" }));
    }
    expect(
      resolveAgentResumeCheckpoint(
        resumeInstance,
        lease,
        [{ ...staged, unknown: true } as never, older.value, sealed.value],
        currentInput,
      ),
    ).toEqual(expect.objectContaining({ ok: false, code: "HIL_AGENT_CHECKPOINT_INVALID" }));
    expect(
      resolveAgentResumeCheckpoint(
        resumeInstance,
        lease,
        [{ ...sealed.value, unknown: true } as never],
        currentInput,
      ),
    ).toEqual(expect.objectContaining({ ok: false, code: "HIL_AGENT_CHECKPOINT_INVALID" }));
    expect(
      resolveAgentResumeCheckpoint(resumeInstance, lease, [sealed.value], {
        ...currentInput,
        input_digest: "f".repeat(64),
      }),
    ).toEqual(
      expect.objectContaining({
        ok: false,
        code: "HIL_AGENT_CHECKPOINT_INVALID",
        requires_new_instance: true,
      }),
    );
    expect(
      resolveAgentResumeCheckpoint(
        resumeInstance,
        lease,
        [sealed.value, { ...sealed.value, lease_id: "foreign", fence: 3 }],
        currentInput,
      ),
    ).toEqual(expect.objectContaining({ ok: false, code: "HIL_AGENT_FENCING_VIOLATION" }));
    expect(
      resolveAgentResumeCheckpoint(
        resumeInstance,
        lease,
        [sealed.value, sealed.value],
        currentInput,
      ),
    ).toEqual(expect.objectContaining({ ok: false, code: "HIL_AGENT_CHECKPOINT_INVALID" }));
    expect(resolveAgentResumeCheckpoint(instance, lease, [sealed.value], currentInput)).toEqual(
      expect.objectContaining({ ok: false, code: "HIL_AGENT_CHECKPOINT_INVALID" }),
    );
    const third = sealDurableAgentCheckpoint(
      { ...instance, checkpoint_sequence: 2 },
      lease,
      { ...payload, sequence: 3, state_digest: "3".repeat(64) },
      [],
    );
    expect(third.ok).toBe(true);
    if (!third.ok) return;
    expect(
      resolveAgentResumeCheckpoint(
        { ...instance, checkpoint_sequence: 3 },
        lease,
        [older.value, third.value],
        currentInput,
      ),
    ).toEqual(expect.objectContaining({ ok: false, code: "HIL_AGENT_CHECKPOINT_INVALID" }));
    expect(
      resolveAgentResumeCheckpoint(
        { ...resumeInstance, contract_digest: "f".repeat(64) },
        lease,
        [older.value, sealed.value],
        currentInput,
      ),
    ).toEqual(expect.objectContaining({ ok: false, code: "HIL_AGENT_CHECKPOINT_INVALID" }));
    expect(
      resolveAgentResumeCheckpoint(
        resumeInstance,
        { ...lease, fence: 5 },
        [sealed.value],
        currentInput,
      ),
    ).toEqual(expect.objectContaining({ ok: false, code: "HIL_AGENT_FENCING_VIOLATION" }));
  });
});

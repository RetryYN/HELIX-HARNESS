/** PLAN-L1-07-infinity-loop-platform-requirements — U-AGLC-013 */
import { describe, expect, it } from "vitest";
import {
  appendAgentLifecycleEvent,
  validateAgentLifecycleTransition,
} from "../src/orchestration/harness-agent-standard";

const head = {
  instance_id: "instance",
  state: "running" as const,
  sequence: 4,
  event_digest: "event-4",
  operation_ids: ["op-4"],
};
const transition = validateAgentLifecycleTransition("running", "checkpointed", []);
const operation = { operation_id: "op-5", expected_sequence: 5, payload_digest: "payload-5" };

describe("agent lifecycle append-only event", () => {
  it("U-AGLC-013: sequence/operation/previous digest chainをexactに固定する", () => {
    const first = appendAgentLifecycleEvent(head, operation, transition, 2);
    const second = appendAgentLifecycleEvent(head, operation, transition, 2);
    expect(first).toEqual(second);
    expect(first).toEqual(
      expect.objectContaining({
        ok: true,
        value: expect.objectContaining({ sequence: 5, previous_event_digest: "event-4" }),
      }),
    );
    for (const invalid of [
      appendAgentLifecycleEvent(head, { ...operation, expected_sequence: 6 }, transition, 2),
      appendAgentLifecycleEvent(head, { ...operation, operation_id: "op-4" }, transition, 2),
      appendAgentLifecycleEvent({ ...head, event_digest: "" }, operation, transition, 2),
      appendAgentLifecycleEvent(
        head,
        operation,
        validateAgentLifecycleTransition("failed", "verified", []),
        2,
      ),
    ])
      expect(invalid).toEqual(
        expect.objectContaining({ ok: false, code: "HIL_AGENT_EVENT_SEQUENCE_INVALID" }),
      );
    if (first.ok) {
      expect(first.value).not.toHaveProperty("ready");
      expect(first.value).not.toHaveProperty("lease");
      expect(first.value).not.toHaveProperty("execution_authorized");
    }
  });
});

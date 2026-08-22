import { describe, expect, it, vi } from "vitest";
import {
  dispatchLiteConsumerCommand,
  type LiteConsumerCommandHandlers,
} from "../src/setup/distribution-consumer-command-composition";

function handlers(): LiteConsumerCommandHandlers {
  const create = (commandId: keyof LiteConsumerCommandHandlers) =>
    vi.fn(() => ({ command_id: commandId, exit_code: 0, output: commandId }));
  return {
    setup_project: create("setup_project"),
    status: create("status"),
    consumer_doctor: create("consumer_doctor"),
    completion_decision_packet: create("completion_decision_packet"),
    completion_review_bundle: create("completion_review_bundle"),
    lifecycle_rehearsal: create("lifecycle_rehearsal"),
    minimal_delegated_workflow: create("minimal_delegated_workflow"),
  };
}

describe("PLAN-L7-653-distribution-lite-dependency-closure: consumer command composition", () => {
  // PLAN-L7-657-distribution-lite-consumer-canary — U-DISTCANARY-012
  it("U-DISTCANARY-012: lifecycle rehearsalを専用handlerへdispatchする", async () => {
    const ports = handlers();
    const result = await dispatchLiteConsumerCommand(
      ["lifecycle", "rehearsal", "--operation", "rollback", "--json"],
      ports,
    );
    expect(result).toMatchObject({
      ok: true,
      execution: { command_id: "lifecycle_rehearsal", exit_code: 0 },
    });
    expect(ports.lifecycle_rehearsal).toHaveBeenCalledOnce();
  });

  it("U-DISTCLOSE-009: admitted commandだけをexact handlerへdispatchする", async () => {
    const ports = handlers();
    const result = await dispatchLiteConsumerCommand(
      ["doctor", "--profile", "consumer", "--json"],
      ports,
    );
    expect(result).toMatchObject({
      ok: true,
      execution: { command_id: "consumer_doctor", exit_code: 0 },
    });
    expect(ports.consumer_doctor).toHaveBeenCalledOnce();
    for (const [id, handler] of Object.entries(ports)) {
      if (id !== "consumer_doctor") expect(handler).not.toHaveBeenCalled();
    }
  });

  it("U-DISTCLOSE-010: rejected Full commandはhandlerを一件も起動しない", async () => {
    const ports = handlers();
    const result = await dispatchLiteConsumerCommand(["team", "run"], ports);
    expect(result).toMatchObject({ ok: false, failure: { code: "command_unknown" } });
    for (const handler of Object.values(ports)) expect(handler).not.toHaveBeenCalled();
  });

  it("U-DISTCLOSE-011: handlerが別command identityを返した場合はfail-closeする", async () => {
    const ports = handlers();
    ports.status = vi.fn(() => ({
      command_id: "setup_project" as const,
      exit_code: 0,
      output: "wrong handler",
    }));
    await expect(dispatchLiteConsumerCommand(["status"], ports)).rejects.toThrow(
      "lite_consumer_handler_identity_mismatch:status:setup_project",
    );
  });
});

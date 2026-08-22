import { describe, expect, it } from "vitest";
import { admitLiteConsumerCommand } from "../src/setup/distribution-consumer-command-registry";

describe("PLAN-L7-653-distribution-lite-dependency-closure: consumer command registry", () => {
  it("U-DISTCLOSE-006: consumer verification exact command setだけを受理する", () => {
    const cases = [
      [["setup", "project", "--dry-run", "--json"], "setup_project"],
      [["status", "--json"], "status"],
      [["doctor", "--profile", "consumer", "--json"], "consumer_doctor"],
      [["completion", "decision-packet", "--json"], "completion_decision_packet"],
      [["completion", "review-bundle", "--json"], "completion_review_bundle"],
    ] as const;
    for (const [argv, commandId] of cases) {
      expect(admitLiteConsumerCommand(argv)).toMatchObject({ ok: true, command_id: commandId });
    }
  });

  it("U-DISTCLOSE-007: minimal delegated workflowはCodex／Claude dry-runだけを受理する", () => {
    for (const provider of ["codex", "claude"] as const) {
      expect(
        admitLiteConsumerCommand([provider, "--role", "se", "--task", "consumer smoke", "--json"]),
      ).toMatchObject({
        ok: true,
        command_id: "minimal_delegated_workflow",
        provider,
        dry_run: true,
      });
      expect(
        admitLiteConsumerCommand([
          provider,
          "--role",
          "se",
          "--task",
          "consumer smoke",
          "--execute",
        ]),
      ).toMatchObject({ ok: false, code: "option_not_allowed", token: "--execute" });
    }
  });

  it("U-DISTCLOSE-008: Full／excluded commandと曖昧なdelegationをfail-closeする", () => {
    for (const argv of [
      ["team", "run"],
      ["lane", "status"],
      ["security", "egress-check", "--dry-run"],
      ["doctor"],
      ["doctor", "--profile", "standalone"],
      ["codex", "--role", "se"],
      ["claude", "--role", "se", "--task", "x", "--task-file", "task.md"],
    ]) {
      expect(admitLiteConsumerCommand(argv)).toMatchObject({ ok: false });
    }
  });
});

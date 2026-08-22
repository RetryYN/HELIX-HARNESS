import { describe, expect, it } from "vitest";
import { dispatchLiteConsumerCommand } from "../src/setup/distribution-consumer-command-composition";
import { createLiteConsumerNodeHandlers } from "../src/setup/distribution-consumer-node-adapter";

function services() {
  const unavailable = () => ({ payload: { ok: false }, exit_code: 1 });
  return {
    setup_project: unavailable,
    status: unavailable,
    consumer_doctor: unavailable,
    completion_decision_packet: unavailable,
    completion_review_bundle: unavailable,
    minimal_delegated_workflow: (input: {
      provider: "codex" | "claude";
      role: string;
      task: string;
      plan_id: string | null;
      execute: false;
    }) => ({
      payload: {
        ...input,
        dry_run: true,
        stdin: `role archetype: worker\ntask: ${input.task}`,
      },
      exit_code: 0,
    }),
  };
}

describe("PLAN-L7-653-distribution-lite-dependency-closure: Node adapter", () => {
  it("U-DISTCLOSE-012: minimal workflowをprovider dry-run planへ一方向接続する", async () => {
    const result = await dispatchLiteConsumerCommand(
      ["codex", "--role", "se", "--task", "consumer smoke", "--json"],
      createLiteConsumerNodeHandlers({
        repo_root: process.cwd(),
        read_task_file: () => {
          throw new Error("unexpected task-file read");
        },
        services: services(),
      }),
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.execution.command_id).toBe("minimal_delegated_workflow");
    expect(JSON.parse(result.execution.output)).toMatchObject({
      provider: "codex",
      dry_run: true,
    });
    expect(JSON.parse(result.execution.output).stdin).toContain("role archetype: worker");
  });

  it("U-DISTCLOSE-013: task-file入力はadapter portだけを通してpromptへ投影する", async () => {
    const result = await dispatchLiteConsumerCommand(
      ["claude", "--role", "qa", "--task-file", "task.md", "--json"],
      createLiteConsumerNodeHandlers({
        repo_root: process.cwd(),
        read_task_file: (path) => (path === "task.md" ? "bounded task" : "unexpected"),
        services: services(),
      }),
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.execution.output).toContain("bounded task");
    expect(result.execution.output).not.toContain("task.md");
  });
});

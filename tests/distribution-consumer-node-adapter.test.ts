import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { dispatchLiteConsumerCommand } from "../src/setup/distribution-consumer-command-composition";
import {
  createLiteConsumerNodeHandlers,
  nodeLiteConsumerAdapterDeps,
} from "../src/setup/distribution-consumer-node-adapter";

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

  it("U-DISTCLOSE-013b: task-fileのtraversal／symlink／non-fileをread前に拒否する", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-lite-task-file-"));
    try {
      mkdirSync(join(root, "tasks"));
      writeFileSync(join(root, "tasks", "task.md"), "bounded task", "utf8");
      symlinkSync(join(root, "tasks"), join(root, "linked-tasks"), "dir");
      mkdirSync(join(root, "task-dir"));
      const deps = nodeLiteConsumerAdapterDeps(root, services());
      expect(deps.read_task_file("tasks/task.md")).toBe("bounded task");
      expect(() => deps.read_task_file("../outside.md")).toThrow(
        "lite_consumer_task_file_outside_root",
      );
      expect(() => deps.read_task_file("tasks/../tasks/task.md")).toThrow(
        "lite_consumer_task_file_unsafe",
      );
      expect(() => deps.read_task_file("C:\\tmp\\task.md")).toThrow(
        "lite_consumer_task_file_outside_root",
      );
      expect(() => deps.read_task_file("linked-tasks/task.md")).toThrow(
        "lite_consumer_task_file_unsafe",
      );
      expect(() => deps.read_task_file("task-dir")).toThrow("lite_consumer_task_file_unsafe");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});

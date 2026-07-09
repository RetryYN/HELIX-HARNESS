import { describe, expect, it } from "vitest";
import { buildStateMachineTemplatePlan } from "../src/runtime/state-machine-template-planner";

describe("state machine template planner", () => {
  it("selects a workflow template with tools, transitions, and exit criteria but never executes it", () => {
    const plan = buildStateMachineTemplatePlan({ task: "設計と検証を進める" });

    expect(plan.ok).toBe(true);
    expect(plan.selected_template_id).toBe("workflow:design-verify");
    expect(plan.generated_workflow).toMatchObject({
      allowed_tools: expect.arrayContaining(["tool:lsp-readonly"]),
      transitions: expect.arrayContaining(["plan", "review"]),
      exit_criteria: expect.arrayContaining(["verification command recorded"]),
    });
    expect(plan.validation.valid).toBe(true);
    expect(plan.executable).toBe(false);
  });

  it("drops execution triples that contain secret-like material", () => {
    const plan = buildStateMachineTemplatePlan({
      task: "テスト戦略",
      triples: [
        {
          task: "safe",
          template_id: "workflow:troubleshoot-test",
          outcome: "success",
          evidence_digest: "sha256:safe",
        },
        {
          task: "unsafe",
          template_id: "workflow:troubleshoot-test",
          outcome: "failure",
          evidence_digest: "token=secret",
        },
      ],
    });

    expect(plan.ok).toBe(false);
    expect(plan.execution_triples).toHaveLength(1);
    expect(JSON.stringify(plan)).not.toContain("token=secret");
    expect(plan.findings).toEqual([
      expect.objectContaining({ code: "execution_triple_secret_like_material_dropped" }),
    ]);
  });
});

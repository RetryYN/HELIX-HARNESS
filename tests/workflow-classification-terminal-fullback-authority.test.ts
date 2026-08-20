import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  loadWorkflowClassificationTerminalFullbackAuthority,
  workflowClassificationTerminalFullbackAuthoritySchema,
} from "../src/schema/workflow-classification-terminal-fullback-authority.js";

describe("workflow classification terminal fullback authority", () => {
  it("U-WFTERM-040: requirements-owned Forward slice／consumer集合を読み込む", () => {
    const authority = loadWorkflowClassificationTerminalFullbackAuthority();

    expect(authority.forward_slices.map((slice) => slice.plan_id)).toEqual([
      "PLAN-L7-561-workflow-classification-generated-catalog",
      "PLAN-L7-562-workflow-classification-typed-routing",
      "PLAN-L7-568-workflow-classification-legacy-adapter",
      "PLAN-L7-570-design-elicitation-typed-classification",
      "PLAN-L7-583-workflow-classification-drive-run-projection",
      "PLAN-L7-580-workflow-classification-catalog-doctor",
    ]);
    expect(authority.consumers).toEqual([
      { name: "typed-runtime", target_axis: "workflow_model", target_id: "REVERSE" },
    ]);
  });

  it("U-WFTERM-041: authorityのForward slice／consumer重複を受理しない", () => {
    const authority = JSON.parse(
      readFileSync(
        "docs/design/helix/L3-requirements/workflow-classification-terminal-fullback-authority.v1.json",
        "utf8",
      ),
    ) as Record<string, unknown> & {
      forward_slices: Array<Record<string, unknown>>;
      consumers: Array<Record<string, unknown>>;
    };
    authority.forward_slices.push({ ...authority.forward_slices[0] });
    authority.consumers.push({ ...authority.consumers[0] });

    expect(() => workflowClassificationTerminalFullbackAuthoritySchema.parse(authority)).toThrow(
      "duplicate terminal fullback plan id",
    );
  });
});

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

function text(path: string): string {
  return readFileSync(path, "utf8");
}

describe("PoC S3/S4 semantic boundary", () => {
  it("keeps requirements aligned with the schema rule that S3 verified is non-terminal", () => {
    const requirements = text("docs/governance/helix-agent-harness-requirements_v1.2.md");
    const schema = text("src/schema/frontmatter.ts");

    expect(requirements).toContain(
      "`kind=poc + status in [confirmed, completed]` → `workflow_phase=S4`",
    );
    expect(requirements).toContain("S3 verify pass は **検証証跡が揃った非終端状態**");
    expect(requirements).toContain("| `S4` | poc | Decide (decision_outcome 必須)");

    expect(schema).toContain("Discovery/Scrum の terminal 宣言は S4 decision 後のみ");
    expect(schema).toContain("decision_outcome は S4 outcome 専用");
    expect(schema).toContain('fm.workflow_phase !== "S4"');
    expect(schema).toContain("kind=poc の decision_outcome は workflow_phase=S4 専用");
    expect(schema).toContain("kind=poc の confirmed/completed は workflow_phase=S4");
  });

  it("documents Discovery and Scrum as S3 verified evidence pending S4 PO decision", () => {
    const discovery = text("docs/process/modes/discovery.md");
    const scrum = text("docs/process/modes/scrum.md");
    const modeIndex = text("docs/process/modes/README.md");

    for (const doc of [discovery, scrum]) {
      expect(doc).toContain("S3");
      expect(doc).toContain("verified evidence");
      expect(doc).toContain("status=draft");
      expect(doc).toContain("outstanding");
      expect(doc).toContain("decision_outcome");
      expect(doc).toContain("po_decision_pending");
      expect(doc).toContain("merged-plan-status");
    }

    expect(discovery).toContain(
      "S3 verify pass は検証証跡の成立であって、terminal status ではない",
    );
    expect(discovery).toContain("S4 `decision_outcome=confirmed` → **L1 要求定義**");
    expect(scrum).toContain("S3 verified increment");
    expect(scrum).toContain("S4 `decision_outcome=confirmed` 後");
    expect(modeIndex).toContain("S4 `decision_outcome=confirmed` → L1");
  });

  it("keeps implementation gates split: merged-plan-status exempts S3 evidence, status reports S4 action", () => {
    const mergedPlanStatus = text("src/lint/merged-plan-status.ts");
    const outstanding = text("src/lint/outstanding.ts");

    expect(mergedPlanStatus).toContain("isS3VerifiedPocPendingDecision");
    expect(mergedPlanStatus).toContain('p.workflowPhase === "S3"');
    expect(mergedPlanStatus).toContain("p.hasReviewEvidence === true");

    expect(outstanding).toContain("record the PO/S4 decision before promotion");
    expect(outstanding).toContain(
      "s4_decision_record with allowed_outcome confirmed / rejected / pivot",
    );
    expect(outstanding).toContain("decision_outcome recorded in the PLAN at S4");
    expect(outstanding).toContain("promotion_strategy_or_rejection_pivot_rationale");
  });
});

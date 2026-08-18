import { describe, expect, it } from "vitest";
import {
  buildWorkflowGuide,
  renderWorkflowGuideText,
  workflowModelIds,
} from "../src/workflow/workflow-guide";

const repoRoot = process.cwd();

// PLAN-L7-635-workflow-guide-dynamic-injection
describe("requirements-owned typed workflow guide", () => {
  it("U-WFGUIDE-001: workflow_model identityからdigest付きguideを生成する", () => {
    const result = buildWorkflowGuide({
      workflow: "REVERSE",
      signal: "drift",
      specialist_drive: "agent",
      repo_root: repoRoot,
    });

    expect(result).toMatchObject({ ok: true, exit_code: 0, findings: [] });
    expect(result.guide).toMatchObject({
      schema_version: "helix-workflow-guide.v1",
      identity: { target_axis: "workflow_model", target_id: "REVERSE" },
      entry: { selected_signal: "drift" },
      context: { specialist_drive: "AGENT" },
    });
    expect(result.guide?.guide_digest).toMatch(/^sha256:[a-f0-9]{64}$/u);
    expect(result.guide?.authority.catalog_digest).toMatch(/^sha256:[a-f0-9]{64}$/u);
    expect(result.guide?.phases.map((phase) => phase.id)).toEqual([
      "classify",
      "plan",
      "execute",
      "verify",
      "accept",
    ]);
  });

  it("U-WFGUIDE-002: guideは旧mode／model／共通route identityを出力しない", () => {
    const result = buildWorkflowGuide({ workflow: "RECOVERY", repo_root: repoRoot });
    const serialized = JSON.stringify(result);

    expect(result.ok).toBe(true);
    expect(serialized).not.toMatch(/"mode"|"model"|"catalog_route_id"|"route_class"/u);
    expect(serialized).not.toContain("forward_full_v");
  });

  it("U-WFGUIDE-003: development_styleをworkflow_modelへ偽装させない", () => {
    const result = buildWorkflowGuide({ workflow: "PRODUCTION_SCRUM", repo_root: repoRoot });

    expect(result).toMatchObject({ ok: false, exit_code: 2, guide: null });
    expect(result.findings.map((item) => item.code)).toContain(
      "workflow-guide-unsupported-identity",
    );
  });

  it("U-WFGUIDE-004: --driveはspecialist drive exact set以外を拒否する", () => {
    const result = buildWorkflowGuide({
      workflow: "REVERSE",
      specialist_drive: "scrum",
      repo_root: repoRoot,
    });

    expect(result).toMatchObject({ ok: false, exit_code: 2, guide: null });
    expect(result.findings.map((item) => item.code)).toContain(
      "workflow-guide-invalid-specialist-drive",
    );
  });

  it("U-WFGUIDE-005: signalとidentityの不一致・曖昧さを推測しない", () => {
    const mismatch = buildWorkflowGuide({
      workflow: "REVERSE",
      signal: "production_incident",
      repo_root: repoRoot,
    });
    const unresolved = buildWorkflowGuide({
      workflow: "REVERSE",
      signal: "user_feedback_iteration",
      repo_root: repoRoot,
    });

    expect(mismatch.findings.map((item) => item.code)).toContain(
      "workflow-guide-signal-identity-mismatch",
    );
    expect(unresolved.findings.map((item) => item.code)).toContain(
      "workflow-guide-signal-decision-required",
    );
    expect(mismatch.exit_code).toBe(2);
    expect(unresolved.exit_code).toBe(2);
  });

  it("U-WFGUIDE-006: registryのworkflow_model exact setを全件生成できる", () => {
    const ids = workflowModelIds(repoRoot);

    expect(ids.length).toBeGreaterThan(0);
    for (const id of ids) {
      const result = buildWorkflowGuide({ workflow: id, repo_root: repoRoot });
      expect(result.ok, id).toBe(true);
      expect(result.guide?.identity).toMatchObject({
        target_axis: "workflow_model",
        target_id: id,
      });
    }
  });

  it("U-WFGUIDE-007: text surfaceも選択guideだけをboundedに出す", () => {
    const result = buildWorkflowGuide({
      workflow: "ADD_FEATURE",
      signal: "feature_addition",
      repo_root: repoRoot,
    });

    if (!result.guide) throw new Error("expected ADD_FEATURE guide");
    const text = renderWorkflowGuideText(result.guide);
    expect(text).toContain("workflow-guide: ADD_FEATURE");
    expect(text).toContain("selected-signal: feature_addition");
    expect(text).toContain("guide-digest: sha256:");
    expect(text).not.toContain("REVERSE");
    expect(text).not.toContain("mode=");
  });
});

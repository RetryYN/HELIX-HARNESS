import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  analyzeWorkflowGuideAuthority,
  checkWorkflowGuideAuthority,
} from "../src/doctor/workflow-guide-authority";
import {
  buildWorkflowGuide,
  type WorkflowGuide,
  workflowModelIds,
} from "../src/workflow/workflow-guide";

// PLAN-L7-635-workflow-guide-dynamic-injection: U-WFGUIDE-010/011/012 authority doctor oracles.
const repoRoot = process.cwd();

function fixtureRoot(): string {
  const root = mkdtempSync(join(tmpdir(), "helix-workflow-guide-authority-"));
  cpSync(join(repoRoot, "config"), join(root, "config"), { recursive: true });
  cpSync(join(repoRoot, "docs"), join(root, "docs"), { recursive: true });
  return root;
}

function analyzeWithGuideMutation(mutate: (guide: WorkflowGuide) => WorkflowGuide) {
  return analyzeWorkflowGuideAuthority(repoRoot, {
    buildGuide: (input) => {
      const result = buildWorkflowGuide(input);
      return result.guide ? { ...result, guide: mutate(structuredClone(result.guide)) } : result;
    },
    workflowIds: workflowModelIds,
  });
}

describe("workflow guide authority doctor gate", () => {
  it("U-WFGUIDE-010: current registry exact setを全件生成しlegacy identityを出さない", () => {
    const result = analyzeWorkflowGuideAuthority(repoRoot);

    expect(result).toMatchObject({
      ok: true,
      generatedCount: result.workflowCount,
      findings: [],
    });
    expect(result.workflowCount).toBeGreaterThan(0);
    expect(checkWorkflowGuideAuthority(repoRoot)).toEqual({
      messages: [
        expect.stringMatching(/^workflow-guide-authority — OK \(workflows=\d+, generated=\d+\)$/),
      ],
      ok: true,
    });
  });

  it("U-WFGUIDE-011: catalogのauthority tuple driftをdoctorがfail-closeする", () => {
    const root = fixtureRoot();
    try {
      const catalogPath = join(root, "config", "workflow-classification-catalog.v1.json");
      const catalog = JSON.parse(readFileSync(catalogPath, "utf8")) as {
        source_registry: { registry_version: string };
      };
      catalog.source_registry.registry_version = "9.9.9";
      writeFileSync(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`);

      const result = analyzeWorkflowGuideAuthority(root);

      expect(result.ok).toBe(false);
      expect(result.findings[0]?.code).toBe("workflow_guide_generation_failed");
      expect(checkWorkflowGuideAuthority(root).ok).toBe(false);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("U-WFGUIDE-012: authority projectionの各退行を個別にfail-closeする", () => {
    const mutations: Array<{
      code: string;
      mutate: (guide: WorkflowGuide) => WorkflowGuide;
    }> = [
      {
        code: "workflow_guide_identity_mismatch",
        mutate: (guide) => ({
          ...guide,
          identity: { ...guide.identity, target_id: "__WRONG_WORKFLOW__" },
        }),
      },
      {
        code: "workflow_guide_authority_mismatch",
        mutate: (guide) => ({
          ...guide,
          authority: { ...guide.authority, requirements_version: "9.9.9" },
        }),
      },
      {
        code: "workflow_guide_signal_projection_mismatch",
        mutate: (guide) => ({
          ...guide,
          entry: {
            ...guide.entry,
            registered_signals: [...guide.entry.registered_signals, "__UNREGISTERED_SIGNAL__"],
          },
        }),
      },
      {
        code: "workflow_guide_legacy_identity_emitted",
        mutate: (guide) => ({ ...guide, mode: "reverse" }) as WorkflowGuide,
      },
      {
        code: "workflow_guide_duplicate_digest",
        mutate: (guide) => ({ ...guide, guide_digest: `sha256:${"0".repeat(64)}` }),
      },
    ];

    for (const { code, mutate } of mutations) {
      const result = analyzeWithGuideMutation(mutate);

      expect(result.ok).toBe(false);
      expect(result.findings.map((finding) => finding.code)).toContain(code);
    }
  });
});

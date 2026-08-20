import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  analyzeWorkflowGuideAuthority,
  checkWorkflowGuideAuthority,
} from "../src/doctor/workflow-guide-authority";

// PLAN-L7-635-workflow-guide-dynamic-injection: U-WFGUIDE-010/011 authority doctor oracles.
const repoRoot = process.cwd();

function fixtureRoot(): string {
  const root = mkdtempSync(join(tmpdir(), "helix-workflow-guide-authority-"));
  cpSync(join(repoRoot, "config"), join(root, "config"), { recursive: true });
  cpSync(join(repoRoot, "docs"), join(root, "docs"), { recursive: true });
  return root;
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
    expect(checkWorkflowGuideAuthority(repoRoot)).toEqual({ messages: [], ok: true });
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
});

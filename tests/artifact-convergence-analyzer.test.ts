import { describe, expect, it } from "vitest";
import { buildArtifactConvergenceReport } from "../src/runtime/artifact-convergence-analyzer";

describe("artifact convergence analyzer", () => {
  it("blocks completion claims for implemented-without-design and missing-test findings", () => {
    const report = buildArtifactConvergenceReport(
      [
        {
          artifact_id: "src:feature",
          type: "code",
          path: "src/feature.ts",
          line: 12,
          digest: "sha256:code",
        },
      ],
      { existingPlanIds: ["converge:missing_test:src:feature"] },
    );

    expect(report.ok).toBe(false);
    expect(report.completion_claim_allowed).toBe(false);
    expect(report.findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: "implemented_without_design",
          severity: "critical",
          source_artifact: expect.objectContaining({
            path: "src/feature.ts",
            line: 12,
            digest: "sha256:code",
          }),
        }),
        expect.objectContaining({ kind: "missing_test", severity: "critical" }),
      ]),
    );
    expect(report.generated_tasks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          task_id: "converge:missing_test:src:feature",
          duplicate: true,
        }),
      ]),
    );
  });
});

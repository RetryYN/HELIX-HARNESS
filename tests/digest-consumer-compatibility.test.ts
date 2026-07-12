import { describe, expect, it } from "vitest";
import { buildAgentSsotRuntimeProjectionReport } from "../src/runtime/agent-ssot-runtime-projection";
import { buildChangePackageDeltaArchiveReport } from "../src/runtime/change-package-delta-archive";
import { buildConstitutionTemplateStackReport } from "../src/runtime/constitution-template-stack";
import { retirementPreserveInventoryDigest } from "../src/runtime/retirement-preserve";

describe("IT-DIGEST-001 public consumer byte compatibility", () => {
  it("[PLAN-L7-438-digest-canonicalization-authority/IT-DIGEST-001] returns four hardcoded public API digests", () => {
    const change = buildChangePackageDeltaArchiveReport({
      package_id: "p",
      plan_id: "PLAN-L7-1",
      plan_status: "draft",
    });
    expect(change.manifest_digest).toBe(
      "sha256:387e0d13bf9baa226171a797bf78df8154e549d1dbfd008fe29022bd0407b1d5",
    );
    const agent = buildAgentSsotRuntimeProjectionReport([
      {
        artifact_id: "a",
        kind: "agent",
        runtime: "codex",
        source_path: "s",
        source_content: "source",
        target_path: "t",
        generated_content: "generated",
        cleanup_policy: "owned_generated",
      },
    ]);
    expect(agent.projected_files[0]?.source_digest).toBe(
      "sha256:41cf6794ba4200b839c53531555f0f3998df4cbb01a4d5cb0b94e3ca5e23947d",
    );
    const constitution = buildConstitutionTemplateStackReport([
      { key: "k", source: "project", priority: 1, content: "project" },
    ]);
    expect(constitution.resolved_artifacts[0]?.digest).toBe(
      "sha256:244210e48437b6556980a70249a99369934a352429034cef9d7bd253b3bf2c01",
    );
    expect(
      retirementPreserveInventoryDigest({
        providerPaths: ["provider"],
        operationsPaths: ["ops"],
        archiveSourcePaths: [],
      }),
    ).toBe("sha256:de06daedd445d56b70a9dc39f76b4c0bbf89163f4067cfce325f94609962fb46");
  });
});

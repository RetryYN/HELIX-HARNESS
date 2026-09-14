import { describe, expect, it } from "vitest";
import { buildAgentSsotRuntimeProjectionReport } from "../src/runtime/agent-ssot-runtime-projection";

describe("agent ssot runtime projection", () => {
  it("reports source/generated digests and preserves user-modified generated files", () => {
    const report = buildAgentSsotRuntimeProjectionReport([
      {
        artifact_id: "agent:test",
        kind: "agent",
        runtime: "codex",
        source_path: "docs/agents/test.md",
        source_content: "source",
        target_path: ".codex/agents/test.md",
        generated_content: "generated",
        existing_content: "user edit",
        user_modified: true,
        cleanup_policy: "preserve_user_modified",
        required_capability: "hooks",
      },
    ]);

    expect(report.ok).toBe(true);
    expect(report.projected_files[0]).toMatchObject({
      action: "skip",
      cleanup_policy: "preserve_user_modified",
      drift: true,
      user_modified: true,
    });
    expect(report.projected_files[0].source_digest).toMatch(/^sha256:[a-f0-9]{64}$/);
    expect(report.findings.map((finding) => finding.code)).toEqual(
      expect.arrayContaining(["projection_drift", "user_modified_generated_file_preserved"]),
    );
  });

  it("does not silently skip unsupported runtime capability projection", () => {
    const report = buildAgentSsotRuntimeProjectionReport([
      {
        artifact_id: "hook:test",
        kind: "hook_pack",
        runtime: "gemini",
        source_path: "docs/hooks/test.md",
        source_content: "source",
        target_path: ".gemini/hooks/test.md",
        generated_content: "generated",
        cleanup_policy: "owned_generated",
        required_capability: "hooks",
      },
    ]);

    expect(report.ok).toBe(true);
    expect(report.unsupported_count).toBe(1);
    expect(report.projected_files[0]).toMatchObject({
      action: "skip",
      unsupported_reason: "gemini lacks hooks",
    });
    expect(report.findings).toEqual([
      expect.objectContaining({ code: "unsupported_runtime_reported" }),
    ]);
  });
});

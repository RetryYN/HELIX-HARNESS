import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { buildAgentObservabilityProvenanceReport } from "../src/runtime/agent-observability-provenance";

describe("agent observability provenance", () => {
  it("indexes transcripts as metadata and blocks secret-like raw material", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-agent-observability-"));
    try {
      const codexDir = join(root, "codex");
      mkdirSync(codexDir, { recursive: true });
      writeFileSync(
        join(codexDir, "session-a.jsonl"),
        [
          JSON.stringify({
            payload: { model: "gpt-5.3-codex" },
          }),
          JSON.stringify({
            payload: {
              type: "token_count",
              info: {
                total_token_usage: {
                  input_tokens: 100,
                  cached_input_tokens: 10,
                  output_tokens: 20,
                  reasoning_output_tokens: 2,
                },
              },
            },
          }),
          JSON.stringify({
            tool_call: { command: "npx --no-install vitest run tests/example.test.ts" },
          }),
          JSON.stringify({ message: "api_key=should-not-be-persisted" }),
        ].join("\n"),
      );

      const report = buildAgentObservabilityProvenanceReport({
        repoRoot: root,
        codexDirs: [codexDir],
        claudeDirs: [],
        commitHash: "abc1234",
      });

      expect(report.ok).toBe(false);
      expect(report.transcript_index).toEqual([
        expect.objectContaining({
          session_id: "session-a",
          runtime: "codex",
          token_run_count: 1,
          redaction_policy: "blocked-sensitive",
        }),
      ]);
      expect(report.command_digests).toEqual([
        expect.objectContaining({ command_digest: expect.stringMatching(/^sha256:[a-f0-9]{64}$/) }),
      ]);
      expect(report.diff_attribution).toEqual([
        expect.objectContaining({
          commit_hash: "abc1234",
          agent_session_id: "session-a",
          truth_claim: false,
        }),
      ]);
      expect(JSON.stringify(report)).not.toContain("should-not-be-persisted");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});

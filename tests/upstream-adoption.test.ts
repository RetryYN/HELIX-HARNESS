import { describe, expect, it } from "vitest";
import {
  buildGuardGovernancePack,
  classifyTelemetryProvenance,
  classifyUpstreamA146Finding,
  curateDistributionDoc,
  evaluateFeDesignSubstance,
  resolveConsumerCliPath,
  validateDriveEntryMatrix,
  verifyGreenEvidenceBinding,
  verifyRuntimeMatcherEvidence,
} from "../src/runtime/upstream-adoption";

describe("upstream A-146 semantic adoption decisions (U-UPSTREAM)", () => {
  it("U-UPSTREAM-001: classifyUpstreamA146Finding accepts exactly A146-1..A146-8", () => {
    expect(classifyUpstreamA146Finding("A146-1")).toMatchObject({
      known: true,
      requirement_id: "HU-FR-01",
      contract_id: "HU-C01",
      oracle_id: "U-UPSTREAM-002",
    });
    expect(classifyUpstreamA146Finding("A146-8")).toMatchObject({
      known: true,
      requirement_id: "HU-FR-08",
      contract_id: "HU-C08",
      oracle_id: "U-UPSTREAM-009",
    });
    expect(classifyUpstreamA146Finding("A146-9")).toEqual({
      known: false,
      finding_id: "A146-9",
      requirement_id: null,
      contract_id: null,
      oracle_id: null,
    });
  });

  it("U-UPSTREAM-002: buildGuardGovernancePack keeps deferred surfaces separate from covered guards", () => {
    expect(
      buildGuardGovernancePack({
        claude_entrypoints: [".claude/hooks/work-guard.ts"],
        codex_entrypoints: [".codex/hooks.json"],
        deferred_surfaces: ["spawn_agent"],
        coverage_claims: [
          { surface: "apply_patch", implemented: true, covered: true },
          { surface: "spawn_agent", implemented: false, covered: false },
        ],
      }),
    ).toMatchObject({
      ok: true,
      claude_entrypoints: [".claude/hooks/work-guard.ts"],
      codex_entrypoints: [".codex/hooks.json"],
      deferred_surfaces: ["spawn_agent"],
      findings: [],
    });
    expect(
      buildGuardGovernancePack({
        claude_entrypoints: [".claude/hooks/work-guard.ts"],
        coverage_claims: [{ surface: "spawn_agent", implemented: false, covered: true }],
      }).findings,
    ).toEqual(
      expect.arrayContaining([
        "unimplemented_guard_claimed_covered:spawn_agent",
        "untracked_deferred_surface:spawn_agent",
      ]),
    );
  });

  it("U-UPSTREAM-003: resolveConsumerCliPath proves CLI resolution or returns fail-close remediation", () => {
    expect(resolveConsumerCliPath({ command: "helix", path_resolved: true })).toEqual({
      resolved: true,
      method: "path",
      remediation: null,
    });
    expect(
      resolveConsumerCliPath({ command: "helix", wrapper_path: "scripts/helix" }),
    ).toMatchObject({
      resolved: true,
      method: "wrapper",
    });
    expect(resolveConsumerCliPath({ command: "helix" })).toMatchObject({
      resolved: false,
      method: "fail_close",
    });
  });

  it("U-UPSTREAM-004: verifyGreenEvidenceBinding requires rerun evidence and digest update in one batch", () => {
    expect(
      verifyGreenEvidenceBinding({
        command: "npm test",
        exit_status: 0,
        output_digest: "sha256:abc",
        evidence_path: ".helix/evidence/test.json",
        run_batch_id: "batch-1",
        digest_batch_id: "batch-1",
      }),
    ).toEqual({ closed: true, reason: "same_batch_rerun_and_digest" });
    expect(
      verifyGreenEvidenceBinding({
        command: "npm test",
        exit_status: 0,
        output_digest: "sha256:abc",
        evidence_path: ".helix/evidence/test.json",
        run_batch_id: "batch-1",
        digest_batch_id: "batch-2",
      }),
    ).toEqual({ closed: false, reason: "batch_mismatch" });
    expect(verifyGreenEvidenceBinding({ hash_only_restamp: true })).toEqual({
      closed: false,
      reason: "hash_only_restamp",
    });
  });

  it("U-UPSTREAM-005: classifyTelemetryProvenance separates runtime/projected/derived/unknown", () => {
    expect(classifyTelemetryProvenance({ runtime_event_id: "session-1" })).toBe("runtime");
    expect(classifyTelemetryProvenance({ source: "runtime" })).toBe("unknown");
    expect(
      classifyTelemetryProvenance({ runtime_evidence_path: ".helix/evidence/run.jsonl" }),
    ).toBe("runtime");
    expect(classifyTelemetryProvenance({ projection_rule: "plan-registry" })).toBe("projected");
    expect(classifyTelemetryProvenance({ derived_from: "runtime+projection" })).toBe("derived");
    expect(classifyTelemetryProvenance({})).toBe("unknown");
  });

  it("U-UPSTREAM-006: curateDistributionDoc flags blanket governance allowlisting and dogfood docs", () => {
    expect(
      curateDistributionDoc({
        doc_path: "docs/templates/adapter/AGENTS.md",
        declared_audience: "consumer",
      }),
    ).toEqual({ audience: "consumer", allowed_for_consumer: true, warnings: [] });
    expect(
      curateDistributionDoc({
        doc_path: "docs/governance/internal-audit.md",
        declared_audience: "consumer",
        blanket_governance_allow: true,
      }),
    ).toMatchObject({
      audience: "consumer",
      allowed_for_consumer: false,
      warnings: ["blanket_governance_allowlist"],
    });
    expect(
      curateDistributionDoc({ doc_path: "audit/A-146.md", dogfood_marker: true }),
    ).toMatchObject({
      audience: "dogfood",
      allowed_for_consumer: false,
    });
  });

  it("U-UPSTREAM-007: evaluateFeDesignSubstance does not treat presence-only docs as populated", () => {
    expect(
      evaluateFeDesignSubstance({
        body: "The webview progress graph renders deterministic nodes, edges, filters, and drill-down state from markdown and harness.db projections.",
      }),
    ).toEqual({ status: "populated", reason: "body_substance_present" });
    expect(evaluateFeDesignSubstance({ body: "# UI" })).toEqual({
      status: "hollow",
      reason: "presence_only_or_short_body",
    });
    expect(evaluateFeDesignSubstance({ defer_marker: "Phase B" })).toEqual({
      status: "explicit_defer",
      reason: "Phase B",
    });
  });

  it("U-UPSTREAM-008: validateDriveEntryMatrix requires signal-mode and kind-drive agreement", () => {
    const matrix = {
      signal_to_mode: { implement: "forward", reverse: "reverse" },
      kind_drive: { "add-impl": ["agent"], reverse: ["agent", "fullstack"] },
    };
    expect(
      validateDriveEntryMatrix(
        { signal: "implement", mode: "forward", kind: "add-impl", drive: "agent" },
        matrix,
      ),
    ).toEqual({ kind: "auto_route", reason: "matrix_match" });
    expect(
      validateDriveEntryMatrix(
        { signal: "implement", mode: "reverse", kind: "add-impl", drive: "agent" },
        matrix,
      ),
    ).toEqual({ kind: "defer", reason: "signal_mode_mismatch" });
    expect(
      validateDriveEntryMatrix(
        { signal: "unknown", mode: "forward", kind: "add-impl", drive: "agent" },
        matrix,
      ),
    ).toEqual({ kind: "fail_close", reason: "unknown_signal_or_kind" });
  });

  it("U-UPSTREAM-009: verifyRuntimeMatcherEvidence needs target-runtime event and matcher fire evidence", () => {
    expect(
      verifyRuntimeMatcherEvidence({
        runtime_surface: "codex-hook",
        emitted_tool_event: "apply_patch",
        matcher: "apply_patch|write_file",
        matcher_fired: true,
        guard_result: "block",
      }),
    ).toEqual({ compatibility: "covered", reason: "target_runtime_matcher_evidence" });
    expect(verifyRuntimeMatcherEvidence({ expected_only: true })).toEqual({
      compatibility: "unverified",
      reason: "expected_only",
    });
    expect(
      verifyRuntimeMatcherEvidence({
        runtime_surface: "codex-hook",
        emitted_tool_event: "apply_patch",
        matcher: "write_file",
        matcher_fired: false,
        guard_result: "pass",
      }),
    ).toEqual({ compatibility: "incompatible", reason: "matcher_not_fired" });
    expect(
      verifyRuntimeMatcherEvidence({
        runtime_surface: "codex-hook",
        emitted_tool_event: "apply_patch",
        matcher: "write_file",
        matcher_fired: true,
        guard_result: "block",
      }),
    ).toEqual({ compatibility: "incompatible", reason: "tool_event_not_matched" });
  });
});

import { createHash } from "node:crypto";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  type ClosureSemanticAuthorityBundle,
  closureSemanticAuthorityBundleDigestPayload,
  loadClosureSemanticAuthorityBundle,
} from "../src/state-db/closure-evidence-semantic-authority";
import {
  buildProjectClosureEvidenceApplyPlan,
  buildProjectClosureEvidenceApprovalDraftPacket,
  buildProjectClosureEvidenceMaterializePacket,
  buildProjectClosureEvidenceProbePacket,
  buildProjectCurrentLocationSnapshot,
} from "../src/state-db/current-location";
import { openHarnessDb } from "../src/state-db/index";
import { rebuildHarnessDb } from "../src/state-db/projection-writer";

function fixture() {
  const db = openHarnessDb(":memory:", { repoRoot: process.cwd() });
  rebuildHarnessDb({ repoRoot: process.cwd(), db });
  const snapshot = buildProjectCurrentLocationSnapshot(db);
  const execution = {
    command: "npm run test:fast",
    session_id: "closure-probe:semantic-authority",
    correlation_id: "closure-correlation:semantic-authority",
    started_at: "2026-07-12T12:00:00.000Z",
    completed_at: "2026-07-12T12:01:00.000Z",
    exit_code: 0,
    status: "passed" as const,
    output_digest: `sha256:${"a".repeat(64)}`,
    stdout_bytes: 1,
    stderr_bytes: 0,
    output_excerpt: {
      stdout_head: "ok",
      stdout_tail: "ok",
      stderr_head: "",
      stderr_tail: "",
      truncated: false,
      limit: 4000,
    },
    error_message: null,
  };
  return { db, snapshot, execution };
}

describe("closure evidence semantic authority", () => {
  it("U-CESA-008/009/010: source digest、HEAD、oracle driftをfail-closeする", () => {
    const root = process.cwd();
    const dir = ".helix/tmp/closure-semantic-authority-test";
    rmSync(dir, { force: true, recursive: true });
    mkdirSync(dir, { recursive: true });
    const review = {
      authority_kind: "review" as const,
      plan_id: "PLAN-TEST-SEMANTIC",
      artifact_kind: "plan_review_evidence" as const,
      candidate_head: "a".repeat(40),
      reviewer: "Claude Code / Opus",
      reviewed_at: "2026-07-12T11:57:00.000Z",
      verdict: "approve" as const,
      worker_model: "codex:gpt-5.6-sol",
      reviewer_model: "claude:claude-opus-5",
      reviewer_runtime: "claude-code",
      reviewer_session_id: "review-session",
    };
    const runtime = {
      authority_kind: "runtime" as const,
      plan_id: review.plan_id,
      artifact_kind: "runtime_verification_evidence" as const,
      candidate_head: review.candidate_head,
      requirement_id: "REQ-1",
      test_oracle_id: "ORACLE-1",
      claim: "accepted runtime evidence",
      session_id: "runtime-session",
      correlation_id: "runtime-correlation",
      occurred_at: "2026-07-12T11:58:00.000Z",
      accept_status: "accepted" as const,
    };
    const sourceRecords = [
      { name: "review", authority: review },
      { name: "runtime", authority: runtime },
    ].map(({ name, authority }) => {
      const source_path = `${dir}/${name}.json`;
      const text = JSON.stringify(authority);
      writeFileSync(source_path, text);
      return {
        source_path,
        source_digest: `sha256:${createHash("sha256").update(text).digest("hex")}`,
        authority,
      };
    });
    const payload = {
      schema_version: "closure-evidence-semantic-authority-bundle.v1" as const,
      records: sourceRecords,
    };
    const bundle = {
      ...payload,
      bundle_digest: closureSemanticAuthorityBundleDigestPayload(payload),
    };
    const bundlePath = `${dir}/bundle.json`;
    writeFileSync(bundlePath, JSON.stringify(bundle));
    expect(loadClosureSemanticAuthorityBundle(root, bundlePath).records).toHaveLength(2);

    const wrongRuntime = { ...runtime, candidate_head: "b".repeat(40) };
    const wrongRuntimeText = JSON.stringify(wrongRuntime);
    writeFileSync(`${dir}/runtime.json`, wrongRuntimeText);
    const wrongHeadPayload = {
      ...payload,
      records: sourceRecords.map((record, index) =>
        index === 1
          ? {
              ...record,
              source_digest: `sha256:${createHash("sha256").update(wrongRuntimeText).digest("hex")}`,
              authority: wrongRuntime,
            }
          : record,
      ),
    };
    const wrongHead = {
      ...wrongHeadPayload,
      bundle_digest: closureSemanticAuthorityBundleDigestPayload(wrongHeadPayload),
    };
    writeFileSync(bundlePath, JSON.stringify(wrongHead));
    // U-CESA-009: 同一PLANでもcandidate HEAD不一致は拒否する。
    expect(() => loadClosureSemanticAuthorityBundle(root, bundlePath)).toThrow(
      /candidate HEAD mismatch/,
    );

    writeFileSync(
      bundlePath,
      JSON.stringify({ ...bundle, bundle_digest: `sha256:${"0".repeat(64)}` }),
    );
    expect(() => loadClosureSemanticAuthorityBundle(root, bundlePath)).toThrow(
      /bundle digest mismatch/,
    );
    rmSync(dir, { force: true, recursive: true });
  });

  it("U-CESA-010: structured testとruntimeのoracle不一致をfail-closeする", () => {
    const root = process.cwd();
    const dir = ".helix/tmp/closure-semantic-authority-oracle-test";
    rmSync(dir, { force: true, recursive: true });
    mkdirSync(dir, { recursive: true });
    const head = "a".repeat(40);
    const authorities = [
      {
        authority_kind: "structured_test" as const,
        plan_id: "PLAN-TEST-ORACLE-JOIN",
        artifact_kind: "structured_test_evidence" as const,
        candidate_head: head,
        recorded_at: "2026-07-12T11:57:00.000Z",
        case_name: "canonical oracle",
        oracle_id: "ORACLE-CANONICAL",
      },
      {
        authority_kind: "runtime" as const,
        plan_id: "PLAN-TEST-ORACLE-JOIN",
        artifact_kind: "runtime_verification_evidence" as const,
        candidate_head: head,
        requirement_id: "REQ-ORACLE-JOIN",
        test_oracle_id: "ORACLE-MUTATED",
        claim: "accepted runtime evidence",
        session_id: "runtime-session",
        correlation_id: "runtime-correlation",
        occurred_at: "2026-07-12T11:58:00.000Z",
        accept_status: "accepted" as const,
      },
    ];
    const records = authorities.map((authority, index) => {
      const source_path = `${dir}/${index}.json`;
      const text = JSON.stringify(authority);
      writeFileSync(source_path, text);
      return {
        source_path,
        source_digest: `sha256:${createHash("sha256").update(text).digest("hex")}`,
        authority,
      };
    });
    const payload = {
      schema_version: "closure-evidence-semantic-authority-bundle.v1" as const,
      records,
    };
    const bundlePath = `${dir}/bundle.json`;
    writeFileSync(
      bundlePath,
      JSON.stringify({
        ...payload,
        bundle_digest: closureSemanticAuthorityBundleDigestPayload(payload),
      }),
    );
    expect(() => loadClosureSemanticAuthorityBundle(root, bundlePath)).toThrow(
      /oracle join mismatch/,
    );
    rmSync(dir, { force: true, recursive: true });
  });

  it("U-CESA-006: typed bundleをPLANとartifact kindへexact joinする", () => {
    const { db, snapshot, execution } = fixture();
    try {
      const blocked = buildProjectClosureEvidenceMaterializePacket(snapshot, {
        action: "collect_evidence",
        limit: 1,
        probeExecution: execution,
      });
      const head = "a".repeat(40);
      const records: ClosureSemanticAuthorityBundle["records"] =
        blocked.materialized_candidates.map((candidate) => {
          const source = {
            source_path: `docs/evidence/${candidate.candidate_id}.authority.json`,
            source_digest: `sha256:${"b".repeat(64)}`,
          };
          if (candidate.artifact_path.endsWith("-test.json"))
            return {
              ...source,
              authority: {
                authority_kind: "structured_test" as const,
                plan_id: candidate.plan_id,
                artifact_kind: "structured_test_evidence" as const,
                candidate_head: head,
                recorded_at: "2026-07-12T11:59:00.000Z",
                case_name: "canonical exact oracle",
                oracle_id: "U-CESA-006",
              },
            };
          if (candidate.artifact_path.endsWith("-runtime.json"))
            return {
              ...source,
              authority: {
                authority_kind: "runtime" as const,
                plan_id: candidate.plan_id,
                artifact_kind: "runtime_verification_evidence" as const,
                candidate_head: head,
                requirement_id: "CLOSURE-SEMANTIC-AUTHORITY-JOIN-001",
                test_oracle_id: "U-CESA-006",
                claim: "accepted runtime evidence",
                session_id: "runtime-session",
                correlation_id: "runtime-correlation",
                occurred_at: "2026-07-12T11:58:00.000Z",
                accept_status: "accepted" as const,
              },
            };
          return {
            ...source,
            authority: {
              authority_kind: "review" as const,
              plan_id: candidate.plan_id,
              artifact_kind: "plan_review_evidence" as const,
              candidate_head: head,
              reviewer: "Claude Code / Opus",
              reviewed_at: "2026-07-12T11:57:00.000Z",
              verdict: "approve" as const,
              worker_model: "codex:gpt-5.6-sol",
              reviewer_model: "claude:claude-opus-5",
              reviewer_runtime: "claude-code",
              reviewer_session_id: "review-session",
            },
          };
        });
      const semanticAuthorityBundle = {
        schema_version: "closure-evidence-semantic-authority-bundle.v1" as const,
        records,
        bundle_digest: `sha256:${"c".repeat(64)}`,
      };
      const packet = buildProjectClosureEvidenceMaterializePacket(snapshot, {
        action: "collect_evidence",
        limit: 1,
        probeExecution: execution,
        semanticAuthorityBundle,
      });
      expect(packet.materialize_readiness.status).toBe("ready_for_approval");
      expect(packet.semantic_authority_bundle_digest).toBe(`sha256:${"c".repeat(64)}`);
      expect(packet.materialized_candidates).toHaveLength(3);
      expect(
        packet.materialized_candidates.every((candidate) => candidate.ready_for_approval),
      ).toBe(true);
      const runtime = packet.materialized_candidates.find((candidate) =>
        candidate.artifact_path.endsWith("-runtime.json"),
      );
      expect(runtime?.materialized_preview_lines.join("\n")).toContain("runtime-session");
      expect(runtime?.materialized_preview_lines.join("\n")).not.toContain(execution.session_id);
      expect(
        packet.materialized_candidates.flatMap(
          (candidate) => candidate.placeholder_resolution_sources,
        ),
      ).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            source: "semantic_authority_receipt",
            authority_source_digest: `sha256:${"b".repeat(64)}`,
          }),
        ]),
      );
      const draft = buildProjectClosureEvidenceApprovalDraftPacket(snapshot, {
        action: "collect_evidence",
        limit: 1,
        probeExecution: execution,
        semanticAuthorityBundle,
      });
      // U-CESA-011: semantic bundleを含む同一approval scope digestをdraftとapplyで再利用する。
      expect(draft.approval.approval_scope_digest).toBe(packet.approval.approval_scope_digest);
      const apply = buildProjectClosureEvidenceApplyPlan(snapshot, {
        action: "collect_evidence",
        limit: 1,
        probeExecution: execution,
        semanticAuthorityBundle,
        approvalRecordText: [
          `decision_id: ${draft.approval.decision_id}`,
          "outcome: approve_materialized_evidence",
          `approval_scope_digest: ${draft.approval.approval_scope_digest}`,
        ].join("\n"),
      });
      expect(apply.allowed_to_apply).toBe(true);
      expect(
        apply.patch_candidates.map((candidate) => candidate.materialized_preview_digest),
      ).toEqual(
        packet.materialized_candidates.map((candidate) => candidate.materialized_preview_digest),
      );
    } finally {
      db.close();
    }
  });

  it("U-CESA-007: wrong PLANのsemantic authorityはplaceholderを解決しない", () => {
    const { db, snapshot, execution } = fixture();
    try {
      const blocked = buildProjectClosureEvidenceMaterializePacket(snapshot, {
        action: "collect_evidence",
        limit: 1,
        probeExecution: execution,
      });
      const candidate = blocked.materialized_candidates[0];
      expect(candidate).toBeDefined();
      if (!candidate) throw new Error("fixture candidate missing");
      const packet = buildProjectClosureEvidenceMaterializePacket(snapshot, {
        action: "collect_evidence",
        limit: 1,
        probeExecution: execution,
        semanticAuthorityBundle: {
          schema_version: "closure-evidence-semantic-authority-bundle.v1",
          records: [
            {
              source_path: "docs/evidence/wrong.json",
              source_digest: `sha256:${"d".repeat(64)}`,
              authority: {
                authority_kind: "review",
                plan_id: `${candidate.plan_id}-WRONG`,
                artifact_kind: "plan_review_evidence",
                candidate_head: "a".repeat(40),
                reviewer: "Claude Code / Opus",
                reviewed_at: "2026-07-12T11:57:00.000Z",
                verdict: "approve",
                worker_model: "codex:gpt-5.6-sol",
                reviewer_model: "claude:claude-opus-5",
                reviewer_runtime: "claude-code",
                reviewer_session_id: "review-session",
              },
            },
          ],
          bundle_digest: `sha256:${"e".repeat(64)}`,
        },
      });
      expect(packet.materialize_readiness.status).toBe("blocked_placeholders");
      expect(packet.materialized_candidates[0]?.remaining_placeholders).toContain("<reviewer>");
    } finally {
      db.close();
    }
  });
  it("U-CESA-001: probe receiptはreview authorityをfail-closeする (PLAN-L7-440-closure-evidence-semantic-authority)", () => {
    const { db, snapshot, execution } = fixture();
    try {
      const probe = buildProjectClosureEvidenceProbePacket(snapshot, {
        action: "collect_evidence",
        limit: 1,
        execution,
      });
      expect(probe.placeholder_resolution.fillable_placeholders).toEqual(
        expect.arrayContaining(["<green command>", "<probe_completed_at>", "<output>"]),
      );
      expect(probe.placeholder_resolution.fillable_placeholders).not.toContain("<reviewer>");
      const packet = buildProjectClosureEvidenceMaterializePacket(snapshot, {
        action: "collect_evidence",
        limit: 1,
        probeExecution: execution,
      });
      expect(packet.materialize_readiness.status).toBe("blocked_placeholders");
      expect(packet.materialize_readiness.allowed_to_apply).toBe(false);
      expect(packet.materialized_candidates).toHaveLength(3);
      for (const candidate of packet.materialized_candidates) {
        expect(candidate.ready_for_approval).toBe(false);
        expect(candidate.remaining_placeholder_count).toBeGreaterThan(0);
      }
      const semantic = packet.materialized_candidates.flatMap(
        (candidate) => candidate.remaining_placeholders,
      );
      expect(semantic).toEqual(
        expect.arrayContaining([
          "<reviewer>",
          "<reviewed_at>",
          "<oracle_id>",
          "<test case name>",
          "<recorded_at>",
          "<requirement_id>",
          "<test_oracle_id>",
          "<runtime verification claim>",
          "<runtime_occurred_at>",
        ]),
      );
      expect(semantic).not.toContain("<probe_completed_at>");
    } finally {
      db.close();
    }
  });

  it("U-CESA-002: generic suiteはPLAN固有oracleを確定しない (PLAN-L7-440-closure-evidence-semantic-authority)", () => {
    const { db, snapshot, execution } = fixture();
    try {
      const packet = buildProjectClosureEvidenceMaterializePacket(snapshot, {
        action: "collect_evidence",
        limit: 1,
        probeExecution: execution,
      });
      expect(packet.materialized_candidates[1]?.remaining_placeholders).toEqual(
        expect.arrayContaining(["<oracle_id>", "<test case name>", "<recorded_at>"]),
      );
    } finally {
      db.close();
    }
  });

  it("U-CESA-003: probe時刻をruntime観測時刻へ昇格しない (PLAN-L7-440-closure-evidence-semantic-authority)", () => {
    const { db, snapshot, execution } = fixture();
    try {
      const packet = buildProjectClosureEvidenceMaterializePacket(snapshot, {
        action: "collect_evidence",
        limit: 1,
        probeExecution: execution,
      });
      const runtime = packet.materialized_candidates[2];
      expect(runtime?.remaining_placeholders).toContain("<runtime_occurred_at>");
      expect(runtime?.materialized_preview_lines.join("\n")).not.toContain(
        `occurred_at: "${execution.completed_at}"`,
      );
    } finally {
      db.close();
    }
  });

  it("U-CESA-004: probe receiptはprocess fieldだけを埋める (PLAN-L7-440-closure-evidence-semantic-authority)", () => {
    const { db, snapshot, execution } = fixture();
    try {
      const packet = buildProjectClosureEvidenceMaterializePacket(snapshot, {
        action: "collect_evidence",
        limit: 1,
        probeExecution: execution,
      });
      expect(packet.materialized_candidates[0]?.filled_placeholders).toEqual(
        expect.arrayContaining(["<green command>", "<probe_completed_at>", "<output>"]),
      );
      expect(packet.materialized_candidates[0]?.remaining_placeholders).toEqual(
        expect.arrayContaining(["<reviewer>", "<reviewed_at>"]),
      );
    } finally {
      db.close();
    }
  });

  it("U-CESA-005: rollbackは物理削除でなくappend-only compensationを要求する (PLAN-L7-440-closure-evidence-semantic-authority)", () => {
    const { db, snapshot, execution } = fixture();
    try {
      const plan = buildProjectClosureEvidenceApplyPlan(snapshot, {
        action: "collect_evidence",
        limit: 1,
        probeExecution: execution,
        approvalRecordText: null,
      });
      expect(plan.allowed_to_apply).toBe(false);
      for (const candidate of plan.patch_candidates) {
        expect(candidate.rollback_note).toMatch(/supersede|compensation/);
        expect(candidate.rollback_note).not.toMatch(/を削除|artifactを削除|blockだけを削除/);
      }
    } finally {
      db.close();
    }
  });
});

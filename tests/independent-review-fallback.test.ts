import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { sha256Digest } from "../src/runtime/digest";
import {
  buildKimiFallbackInvocation,
  buildKimiReviewSandboxPlan,
  buildProviderNeutralReviewReceipt,
  classifyReviewProviderFailure,
  evaluateKimiAcpTranscript,
  evaluateProviderNeutralReviewMerge,
  issueReviewFallbackLease,
  parseKimiReviewOutput,
  persistReviewFallbackLease,
  selectIndependentReviewProvider,
  validateProviderNeutralReviewReceipt,
} from "../src/runtime/independent-review-fallback";

const HEAD = "a".repeat(40);
const digest = (value: string) => sha256Digest(value);

describe("KIMI-REVIEW-FALLBACK-001 provider switch", () => {
  it("U-IRF-001: Claude healthy keeps the primary route", () => {
    expect(
      selectIndependentReviewProvider({
        primary: "claude",
        fallback: "kimi",
        primary_failure: null,
        candidate_head: HEAD,
        task_class: "pr_convergence_review",
        risk_class: "medium",
        admitted_fallback_task_classes: ["pr_convergence_review"],
      }),
    ).toEqual({ ok: true, provider: "claude", reason: "primary_healthy" });
  });

  it("U-IRF-002: sealed weekly quota evidence switches exactly once to Kimi", () => {
    const failure = classifyReviewProviderFailure({
      provider: "claude",
      candidate_head: HEAD,
      exit_code: 1,
      stderr: "You've hit your weekly limit · resets 11am (Asia/Tokyo)",
      observed_at: "2026-08-04T06:40:00.000Z",
    });
    expect(failure.ok).toBe(true);
    if (!failure.ok) return;
    expect(
      selectIndependentReviewProvider({
        primary: "claude",
        fallback: "kimi",
        primary_failure: failure.capability,
        candidate_head: HEAD,
        task_class: "pr_convergence_review",
        risk_class: "medium",
        admitted_fallback_task_classes: ["pr_convergence_review"],
      }),
    ).toEqual({
      ok: true,
      provider: "kimi",
      reason: "provider_quota_exhausted",
      evidence_digest: failure.capability.evidence_digest,
    });
  });

  it("U-IRF-003: forged failure and non-admitted/high-risk fallback fail closed", () => {
    const forged = {
      kind: "review_provider_failure" as const,
      provider: "claude" as const,
      candidate_head: HEAD,
      reason: "provider_quota_exhausted" as const,
      observed_at: "2026-08-04T06:40:00.000Z",
      evidence_digest: digest("forged"),
    };
    expect(
      selectIndependentReviewProvider({
        primary: "claude",
        fallback: "kimi",
        primary_failure: forged,
        candidate_head: HEAD,
        task_class: "pr_convergence_review",
        risk_class: "medium",
        admitted_fallback_task_classes: ["pr_convergence_review"],
      }),
    ).toEqual({ ok: false, failure_code: "REVIEW_FALLBACK_EVIDENCE_UNSEALED" });

    const failure = classifyReviewProviderFailure({
      provider: "claude",
      candidate_head: HEAD,
      exit_code: 1,
      stderr: "You've hit your weekly limit",
      observed_at: "2026-08-04T06:40:00.000Z",
    });
    expect(failure.ok).toBe(true);
    if (!failure.ok) return;
    expect(
      selectIndependentReviewProvider({
        primary: "claude",
        fallback: "kimi",
        primary_failure: failure.capability,
        candidate_head: HEAD,
        task_class: "pr_convergence_review",
        risk_class: "high",
        admitted_fallback_task_classes: ["pr_convergence_review"],
      }),
    ).toEqual({ ok: false, failure_code: "REVIEW_FALLBACK_RISK_NOT_ADMITTED" });
  });

  it("U-IRF-004: one repo/PR/HEAD/generation has one provider lease", () => {
    const first = issueReviewFallbackLease({
      repository: "RetryYN/HELIX-HARNESS",
      pr_number: 388,
      candidate_head: HEAD,
      generation: 1,
      provider: "kimi",
      issued_at: "2026-08-04T06:41:00.000Z",
      expires_at: "2026-08-04T07:01:00.000Z",
    });
    expect(first.ok).toBe(true);
    expect(
      issueReviewFallbackLease({
        repository: "RetryYN/HELIX-HARNESS",
        pr_number: 388,
        candidate_head: HEAD,
        generation: 1,
        provider: "claude",
        issued_at: "2026-08-04T06:42:00.000Z",
        expires_at: "2026-08-04T07:02:00.000Z",
      }),
    ).toEqual({ ok: false, failure_code: "REVIEW_FALLBACK_LEASE_CONFLICT" });
  });

  it("U-IRF-004A: durable circuit breaker rejects restart and generation retries on one HEAD", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-review-lease-"));
    try {
      const first = issueReviewFallbackLease({
        repository: "RetryYN/HELIX-HARNESS",
        pr_number: 390,
        candidate_head: HEAD,
        generation: 1,
        provider: "kimi",
        issued_at: "2026-08-04T06:41:00.000Z",
        expires_at: "2026-08-04T07:01:00.000Z",
      });
      const retry = issueReviewFallbackLease({
        repository: "RetryYN/HELIX-HARNESS",
        pr_number: 390,
        candidate_head: HEAD,
        generation: 2,
        provider: "kimi",
        issued_at: "2026-08-04T07:02:00.000Z",
        expires_at: "2026-08-04T07:22:00.000Z",
      });
      expect(first.ok).toBe(true);
      expect(retry.ok).toBe(true);
      if (!first.ok || !retry.ok) return;
      expect(persistReviewFallbackLease(root, first.capability)).toMatch(/\.json$/u);
      expect(persistReviewFallbackLease(root, retry.capability)).toBeNull();
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});

describe("KIMI-REVIEW-FALLBACK-001 Kimi boundary", () => {
  it("U-IRF-005: invocation selects ACP without prompt-mode auto permissions", () => {
    const invocation = buildKimiFallbackInvocation({
      executable: "/opt/kimi",
      model: "kimi-code/k3-256k",
      review_packet: "bounded review packet",
      kimi_code_home: "/run/helix/kimi-home",
    });
    expect(invocation.ok).toBe(true);
    if (!invocation.ok) return;
    expect(invocation.args).toEqual(["acp"]);
    expect(invocation.args).not.toContain("-p");
    expect(invocation.args).not.toContain("--auto");
    expect(invocation.args).not.toContain("--yolo");
    expect(invocation.env.KIMI_CODE_EXPERIMENTAL_FLAG).toBe("1");
    expect(invocation.env.KIMI_DISABLE_TELEMETRY).toBe("1");
  });

  it("U-IRF-005A: ACP transcript accepts messages only and marks every tool request", () => {
    const payload = JSON.stringify({
      schema_version: "helix-kimi-pr-review-output.v1",
      candidate_head: HEAD,
      verdict: "approve",
      blocker_count: 0,
      findings: [],
    });
    const base = [
      {
        jsonrpc: "2.0",
        id: 0,
        result: { protocolVersion: 1, agentInfo: { name: "Kimi Code CLI", version: "0.29.2" } },
      },
      { jsonrpc: "2.0", id: 1, result: { sessionId: "session-1" } },
      {
        jsonrpc: "2.0",
        id: 2,
        result: { configOptions: [{ id: "mode", currentValue: "plan" }] },
      },
      {
        jsonrpc: "2.0",
        id: 3,
        result: { configOptions: [{ id: "model", currentValue: "kimi-code/k3-256k" }] },
      },
      {
        jsonrpc: "2.0",
        method: "session/update",
        params: {
          sessionId: "session-1",
          update: {
            sessionUpdate: "agent_message_chunk",
            content: {
              type: "text",
              text: `HELIX_REVIEW_JSON_START\n${payload}\nHELIX_REVIEW_JSON_END`,
            },
          },
        },
      },
      { jsonrpc: "2.0", id: 4, result: { stopReason: "end_turn" } },
    ];
    expect(evaluateKimiAcpTranscript(base)).toMatchObject({
      session_id: "session-1",
      tool_activity: false,
    });
    expect(
      evaluateKimiAcpTranscript([
        ...base.slice(0, 4),
        {
          jsonrpc: "2.0",
          id: 77,
          method: "session/request_permission",
          params: { options: [{ optionId: "reject", kind: "reject_once" }] },
        },
        ...base.slice(4),
      ]),
    ).toMatchObject({ tool_activity: true });
    expect(evaluateKimiAcpTranscript([{ id: 0, result: { protocolVersion: 2 } }])).toBeNull();
  });

  it("U-IRF-006: strict marker output accepts exact findings and rejects tool evidence", () => {
    const payload = {
      schema_version: "helix-kimi-pr-review-output.v1",
      candidate_head: HEAD,
      verdict: "approve",
      blocker_count: 0,
      findings: [],
    };
    const output = `noise\nHELIX_REVIEW_JSON_START\n${JSON.stringify(payload)}\nHELIX_REVIEW_JSON_END\n`;
    expect(parseKimiReviewOutput(output, HEAD, false)).toMatchObject({ ok: true });
    expect(parseKimiReviewOutput(output, HEAD, true)).toEqual({
      ok: false,
      failure_code: "KIMI_REVIEW_TOOL_ACTIVITY_DETECTED",
    });
    expect(parseKimiReviewOutput(output.replace(HEAD, "b".repeat(40)), HEAD, false)).toEqual({
      ok: false,
      failure_code: "KIMI_REVIEW_HEAD_MISMATCH",
    });
  });

  it("U-IRF-007: provider-neutral receipt binds fallback evidence, output, CI and DB", () => {
    const failure = classifyReviewProviderFailure({
      provider: "claude",
      candidate_head: HEAD,
      exit_code: 1,
      stderr: "You've hit your weekly limit",
      observed_at: "2026-08-04T06:40:00.000Z",
    });
    expect(failure.ok).toBe(true);
    if (!failure.ok) return;
    const lease = issueReviewFallbackLease({
      repository: "RetryYN/HELIX-HARNESS",
      pr_number: 389,
      candidate_head: HEAD,
      generation: 1,
      provider: "kimi",
      issued_at: "2026-08-04T06:41:00.000Z",
      expires_at: "2026-08-04T07:01:00.000Z",
    });
    expect(lease.ok).toBe(true);
    if (!lease.ok) return;
    const parsed = parseKimiReviewOutput(
      `HELIX_REVIEW_JSON_START\n${JSON.stringify({
        schema_version: "helix-kimi-pr-review-output.v1",
        candidate_head: HEAD,
        verdict: "approve",
        blocker_count: 0,
        findings: [],
      })}\nHELIX_REVIEW_JSON_END`,
      HEAD,
      false,
    );
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    const built = buildProviderNeutralReviewReceipt({
      repository: "RetryYN/HELIX-HARNESS",
      pr_number: 389,
      candidate_head: HEAD,
      author_runtime: "codex",
      reviewer_provider: "kimi",
      reviewer_runtime: "kimi-code-cli",
      reviewer_model: "K3-256k",
      reviewer_session: "session-1",
      fallback_evidence: failure.capability,
      lease: lease.capability,
      review_packet_digest: digest("packet"),
      output: parsed.capability,
      ci_run_id: 123,
      ci_conclusion: "success",
      db_receipt_digest: digest("db"),
      db_converged: true,
      reviewed_at: "2026-08-04T06:50:00.000Z",
    });
    expect(built).toMatchObject({
      ok: true,
      receipt: { reviewer_provider: "kimi", verdict: "approve" },
    });
    if (!built.ok) return;
    expect(validateProviderNeutralReviewReceipt(built.receipt)).toEqual(built.receipt);
    expect(
      evaluateProviderNeutralReviewMerge(
        {
          repository: "RetryYN/HELIX-HARNESS",
          pr_number: 389,
          candidate_head: HEAD,
          state: "OPEN",
          required_checks_green: true,
          receipt_ci_matches_head: true,
        },
        built.receipt,
      ),
    ).toEqual({ ok: true, reasons: [] });
    expect(() =>
      validateProviderNeutralReviewReceipt({ ...built.receipt, candidate_head: "b".repeat(40) }),
    ).toThrow("provider_neutral_receipt_invalid");
  });

  it("U-IRF-008: sandbox mounts no repository and refuses an incomplete auth surface", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-kimi-plan-"));
    const executable = join(root, "kimi");
    const home = join(root, "home");
    mkdirSync(home);
    writeFileSync(executable, "binary");
    const invocation = buildKimiFallbackInvocation({
      executable,
      model: "kimi-code/k3-256k",
      review_packet: "bounded packet",
      kimi_code_home: home,
    });
    expect(invocation.ok).toBe(true);
    if (!invocation.ok) return;
    expect(
      buildKimiReviewSandboxPlan({
        bubblewrap_path: executable,
        invocation,
        host_kimi_code_home: home,
        scratch_path: root,
      }),
    ).toEqual({ ok: false, failure_code: "KIMI_REVIEW_AUTH_SURFACE_UNRESOLVED" });

    for (const directory of ["credentials", "oauth"]) mkdirSync(join(home, directory));
    for (const file of ["config.toml", "device_id"]) writeFileSync(join(home, file), "x");
    const planned = buildKimiReviewSandboxPlan({
      bubblewrap_path: executable,
      invocation,
      host_kimi_code_home: home,
      scratch_path: root,
    });
    expect(planned.ok).toBe(true);
    if (!planned.ok) return;
    expect(planned.plan.args).not.toContain(process.cwd());
    expect(planned.plan.args).toContain("/workspace");
    expect(planned.plan.args).toContain("acp");
  });
});

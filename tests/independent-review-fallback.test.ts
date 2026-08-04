import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { sha256Digest } from "../src/runtime/digest";
import {
  buildKimiFallbackInvocation,
  buildKimiReviewFallbackAdmission,
  buildKimiReviewSandboxPlan,
  buildProviderNeutralReviewReceipt,
  classifyKimiAcpError,
  classifyReviewProviderFailure,
  evaluateKimiAcpTranscript,
  evaluateProviderNeutralReviewMerge,
  issueReviewFallbackLease,
  loadProviderNeutralReviewReceipt,
  parseKimiReviewOutput,
  persistKimiReviewFallbackAdmission,
  persistProviderNeutralReviewReceipt,
  persistReviewFallbackLease,
  runKimiAcp,
  selectIndependentReviewProvider,
  validateClaudeAdmissionCommentEvidence,
  validateKimiReviewFallbackAdmission,
  validateKimiReviewFallbackAdmissionForImplementation,
  validateProviderNeutralReviewReceipt,
} from "../src/runtime/independent-review-fallback";

const HEAD = "a".repeat(40);
const digest = (value: string) => sha256Digest(value);

describe("KIMI-REVIEW-FALLBACK-001 provider switch", () => {
  it("U-IRF-004C: Claude S4 verifier comment is exact and mutation-sensitive", () => {
    const input = {
      repository: "RetryYN/HELIX-HARNESS",
      pr_number: 391,
      comment_url: "https://github.com/RetryYN/HELIX-HARNESS/pull/391#issuecomment-123",
      head_sha: HEAD,
      verdict: "approve" as const,
      blocker_count: 0,
      ci_run_id: 456,
      ci_conclusion: "success" as const,
      db_receipt_schema_version: "helix-l3-g3-logical-db-receipt.v1",
      db_receipt_digest: digest("db"),
      receipt_digest: digest("claude-receipt"),
      fetched_html_url: "https://github.com/RetryYN/HELIX-HARNESS/pull/391#issuecomment-123",
      fetched_body: [
        "<!-- HELIX:claude-pr-review-receipt:v2 -->",
        "Claude Code convergence review: verdict=approve, blockers=0",
        `HEAD: \`${HEAD}\``,
        "CI run: 456 (success)",
        `DB receipt: helix-l3-g3-logical-db-receipt.v1 / \`${digest("db")}\``,
        `receipt digest: \`${digest("claude-receipt")}\``,
      ].join("\n"),
    };
    expect(() => validateClaudeAdmissionCommentEvidence(input)).not.toThrow();
    for (const mutation of [
      { fetched_html_url: `${input.fetched_html_url}-wrong` },
      { fetched_body: input.fetched_body.replace("HELIX:claude", "HELIX:forged") },
      { fetched_body: input.fetched_body.replace(HEAD, "b".repeat(40)) },
      { fetched_body: input.fetched_body.replace("456", "457") },
      { fetched_body: input.fetched_body.replace(digest("db"), digest("wrong-db")) },
      {
        fetched_body: input.fetched_body.replace(digest("claude-receipt"), digest("wrong-receipt")),
      },
    ]) {
      expect(() => validateClaudeAdmissionCommentEvidence({ ...input, ...mutation })).toThrow(
        "kimi_review_admission_verifier_comment_unverified",
      );
    }
  });

  it("U-IRF-008B: exit 0 before the terminal ACP response fails immediately", async () => {
    const root = mkdtempSync(join(tmpdir(), "helix-kimi-early-exit-"));
    const worker = join(root, "exit-zero.mjs");
    writeFileSync(worker, "process.exit(0);\n");
    const started = Date.now();
    const result = await runKimiAcp(
      {
        command: process.execPath,
        args: [worker],
        env: {},
        cwd: root,
        policy_digest: digest("early-exit-policy"),
        model: "kimi-code/k3-256k",
      },
      "bounded packet",
      5_000,
    );
    expect(result).toEqual({ ok: false, failure_code: "KIMI_REVIEW_PROCESS_FAILED" });
    expect(Date.now() - started).toBeLessThan(1_000);
    rmSync(root, { recursive: true, force: true });
  });

  it("U-IRF-008A: ACP authentication errors are not misclassified as protocol drift", () => {
    expect(
      classifyKimiAcpError({
        jsonrpc: "2.0",
        id: 1,
        error: { code: -32000, message: "Authentication required" },
      }),
    ).toBe("KIMI_REVIEW_AUTH_SURFACE_UNRESOLVED");
    expect(
      classifyKimiAcpError({
        jsonrpc: "2.0",
        id: 1,
        error: { code: -32603, message: "unexpected provider response" },
      }),
    ).toBe("KIMI_REVIEW_ACP_PROTOCOL_INVALID");
  });
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

  it("U-IRF-004B: only an unexpired independent or PO-bootstrap S4 receipt admits the switch", () => {
    const benchmark = {
      schema_version: "helix-kimi-review-fallback-benchmark.v1",
      provider: "kimi",
      task_class: "pr_convergence_review",
      implementation_head: HEAD,
      cases: [
        ["clean_approve", "approve"],
        ["seeded_blocker", "block"],
        ["tool_request", "KIMI_REVIEW_TOOL_ACTIVITY_DETECTED"],
        ["schema_drift", "KIMI_REVIEW_OUTPUT_INVALID"],
        ["quota_switch", "kimi"],
      ].map(([case_id, observed_outcome]) => ({
        case_id,
        observed_outcome,
        passed: true,
        evidence_digest: digest(String(case_id)),
      })),
    };
    const negativeOracle = {
      schema_version: "helix-kimi-review-fallback-negative-oracle.v1",
      implementation_head: HEAD,
      mutations: [
        "remove_head_binding",
        "allow_high_risk",
        "allow_tool_activity",
        "reuse_stale_receipt",
      ].map((mutation_id) => ({ mutation_id, killed: true, evidence_digest: digest(mutation_id) })),
    };
    const receipt = buildKimiReviewFallbackAdmission({
      benchmark_evidence: benchmark,
      negative_oracle_evidence: negativeOracle,
      independent_verifier_receipt_digest: digest("claude-v2-receipt"),
      independent_verifier_implementation_head: HEAD,
      issued_at: "2026-08-04T06:00:00.000Z",
      expires_at: "2026-08-11T06:00:00.000Z",
    });
    expect(validateKimiReviewFallbackAdmission(receipt, "2026-08-05T06:00:00.000Z")).toEqual(
      receipt,
    );
    expect(
      validateKimiReviewFallbackAdmissionForImplementation(
        receipt,
        "2026-08-05T06:00:00.000Z",
        HEAD,
      ),
    ).toEqual(receipt);
    expect(() =>
      validateKimiReviewFallbackAdmissionForImplementation(
        receipt,
        "2026-08-05T06:00:00.000Z",
        "b".repeat(40),
      ),
    ).toThrow("kimi_review_admission_implementation_head_mismatch");
    expect(() =>
      buildKimiReviewFallbackAdmission({
        benchmark_evidence: benchmark,
        negative_oracle_evidence: negativeOracle,
        independent_verifier_receipt_digest: digest("claude-v2-receipt"),
        independent_verifier_implementation_head: "b".repeat(40),
        issued_at: receipt.issued_at,
        expires_at: receipt.expires_at,
      }),
    ).toThrow("kimi_review_admission_invalid");
    expect(() =>
      validateKimiReviewFallbackAdmission(
        { ...receipt, independent_verifier_provider: "kimi" },
        "2026-08-05T06:00:00.000Z",
      ),
    ).toThrow("kimi_review_admission_invalid");
    expect(() => validateKimiReviewFallbackAdmission(receipt, "2026-08-12T06:00:00.000Z")).toThrow(
      "kimi_review_admission_invalid",
    );
    expect(() =>
      buildKimiReviewFallbackAdmission({
        benchmark_evidence: { ...benchmark, cases: benchmark.cases.slice(1) },
        negative_oracle_evidence: negativeOracle,
        independent_verifier_receipt_digest: digest("claude-v2-receipt"),
        independent_verifier_implementation_head: HEAD,
        issued_at: receipt.issued_at,
        expires_at: receipt.expires_at,
      }),
    ).toThrow();
    expect(() =>
      buildKimiReviewFallbackAdmission({
        benchmark_evidence: benchmark,
        negative_oracle_evidence: { ...negativeOracle, implementation_head: "b".repeat(40) },
        independent_verifier_receipt_digest: digest("claude-v2-receipt"),
        independent_verifier_implementation_head: HEAD,
        issued_at: receipt.issued_at,
        expires_at: receipt.expires_at,
      }),
    ).toThrow("kimi_review_admission_invalid");
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
    expect(invocation.prompt).toContain("Do not call tools, request permissions, read files");
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
    expect(
      evaluateKimiAcpTranscript([
        ...base.slice(0, -1),
        {
          jsonrpc: "2.0",
          id: 4,
          method: "session/request_permission",
          params: { options: [{ optionId: "reject", kind: "reject_once" }] },
        },
        { jsonrpc: "2.0", id: 4, result: { stopReason: "end_turn" } },
      ]),
    ).toMatchObject({ completed: true, tool_activity: true });
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
    const admission = buildKimiReviewFallbackAdmission({
      benchmark_evidence: {
        schema_version: "helix-kimi-review-fallback-benchmark.v1",
        provider: "kimi",
        task_class: "pr_convergence_review",
        implementation_head: HEAD,
        cases: [
          ["clean_approve", "approve"],
          ["seeded_blocker", "block"],
          ["tool_request", "KIMI_REVIEW_TOOL_ACTIVITY_DETECTED"],
          ["schema_drift", "KIMI_REVIEW_OUTPUT_INVALID"],
          ["quota_switch", "kimi"],
        ].map(([case_id, observed_outcome]) => ({
          case_id,
          observed_outcome,
          passed: true,
          evidence_digest: digest(String(case_id)),
        })),
      },
      negative_oracle_evidence: {
        schema_version: "helix-kimi-review-fallback-negative-oracle.v1",
        implementation_head: HEAD,
        mutations: [
          "remove_head_binding",
          "allow_high_risk",
          "allow_tool_activity",
          "reuse_stale_receipt",
        ].map((mutation_id) => ({
          mutation_id,
          killed: true,
          evidence_digest: digest(mutation_id),
        })),
      },
      independent_verifier_receipt_digest: digest("claude-v2-receipt"),
      independent_verifier_implementation_head: HEAD,
      issued_at: "2026-08-04T06:00:00.000Z",
      expires_at: "2026-08-11T06:00:00.000Z",
    });
    const built = buildProviderNeutralReviewReceipt({
      repository: "RetryYN/HELIX-HARNESS",
      pr_number: 389,
      candidate_head: HEAD,
      author_runtime: "codex",
      reviewer_provider: "kimi",
      reviewer_runtime: "kimi-code-cli",
      reviewer_model: "K3-256k",
      reviewer_session: "session-1",
      admission_receipt: admission,
      fallback_implementation_head: HEAD,
      implementation_tree: "c".repeat(40),
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
    const provenanceRoot = mkdtempSync(join(tmpdir(), "helix-kimi-provenance-"));
    const admissionRoot = join(provenanceRoot, "admission");
    const receiptRoot = join(provenanceRoot, "receipts");
    persistKimiReviewFallbackAdmission(admissionRoot, admission);
    const canonicalPath = persistProviderNeutralReviewReceipt(receiptRoot, built.receipt);
    expect(loadProviderNeutralReviewReceipt(canonicalPath, receiptRoot, admissionRoot)).toEqual(
      built.receipt,
    );
    const forgedPath = join(provenanceRoot, "forged.json");
    writeFileSync(forgedPath, `${JSON.stringify(built.receipt)}\n`);
    expect(() => loadProviderNeutralReviewReceipt(forgedPath, receiptRoot, admissionRoot)).toThrow(
      "provider_neutral_receipt_noncanonical_path",
    );
    rmSync(admissionRoot, { recursive: true, force: true });
    expect(() =>
      loadProviderNeutralReviewReceipt(canonicalPath, receiptRoot, admissionRoot),
    ).toThrow("provider_neutral_admission_provenance_missing");
    rmSync(provenanceRoot, { recursive: true, force: true });
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
    ).toEqual({ ok: false, reasons: ["provider_neutral_receipt_advisory_only"] });
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

import {
  chmodSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { sha256Digest } from "../src/runtime/digest";
import {
  admitDeclaredReviewRisk,
  buildKimiFallbackInvocation,
  buildKimiReviewFallbackAdmission,
  buildKimiReviewSandboxPlan,
  buildProviderNeutralReviewReceipt,
  classifyKimiAcpError,
  classifyReviewProviderFailure,
  deriveReviewRiskClass,
  evaluateKimiAcpTranscript,
  evaluateProviderAuthWriteBack,
  evaluateProviderNeutralReviewMerge,
  issueReviewFallbackLease,
  loadProviderNeutralReviewReceipt,
  MAX_PROVIDER_AUTH_WRITE_BACK_BYTES,
  parseChangedPathsFromDiff,
  parseKimiReviewOutput,
  persistKimiReviewFallbackAdmission,
  persistProviderNeutralReviewReceipt,
  persistReviewFallbackLease,
  reclaimRotatedProviderAuth,
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
      expires_at: "2026-08-04T18:00:00.000Z",
    });
    expect(validateKimiReviewFallbackAdmission(receipt, "2026-08-04T12:00:00.000Z")).toEqual(
      receipt,
    );
    expect(
      validateKimiReviewFallbackAdmissionForImplementation(
        receipt,
        "2026-08-04T12:00:00.000Z",
        HEAD,
      ),
    ).toEqual(receipt);
    expect(() =>
      validateKimiReviewFallbackAdmissionForImplementation(
        receipt,
        "2026-08-04T12:00:00.000Z",
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
        "2026-08-04T12:00:00.000Z",
      ),
    ).toThrow("kimi_review_admission_invalid");
    expect(() => validateKimiReviewFallbackAdmission(receipt, "2026-08-04T18:00:00.001Z")).toThrow(
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
      expires_at: "2026-08-04T18:00:00.000Z",
    });
    const built = buildProviderNeutralReviewReceipt({
      repository: "RetryYN/HELIX-HARNESS",
      pr_number: 389,
      candidate_head: HEAD,
      declared_author_runtime: "codex",
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

describe("KIMI-REVIEW-FALLBACK-001 admission boundary hardening", () => {
  const benchmarkFixture = (head: string) => ({
    schema_version: "helix-kimi-review-fallback-benchmark.v1",
    provider: "kimi",
    task_class: "pr_convergence_review",
    implementation_head: head,
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
  });
  const negativeOracleFixture = (head: string) => ({
    schema_version: "helix-kimi-review-fallback-negative-oracle.v1",
    implementation_head: head,
    mutations: [
      "remove_head_binding",
      "allow_high_risk",
      "allow_tool_activity",
      "reuse_stale_receipt",
    ].map((mutation_id) => ({ mutation_id, killed: true, evidence_digest: digest(mutation_id) })),
  });

  it("U-IRF-003A: review risk は変更 path から導出され、過小申告を拒否する", () => {
    expect(deriveReviewRiskClass(["docs/plans/PLAN-X.md", "README.md"])).toEqual({
      ok: true,
      risk_class: "low",
    });
    expect(deriveReviewRiskClass(["src/runtime/impact-ci.ts"])).toEqual({
      ok: true,
      risk_class: "medium",
    });
    for (const sensitive of [
      ".github/workflows/harness-check.yml",
      "migrations/0001_init.sql",
      "src/state-db/projection-writer.ts",
      "src/lint/github-guards.ts",
      "src/runtime/payment-gateway.ts",
      "src/auth/session.ts",
    ]) {
      expect(deriveReviewRiskClass([sensitive])).toEqual({ ok: true, risk_class: "high" });
    }
    // runtime authority surface（hook 配線・subagent allowlist・指示正本）も high。
    for (const authority of [
      ".claude/settings.json",
      ".claude/agents/fe-lead.md",
      "CLAUDE.md",
      "AGENTS.md",
    ]) {
      expect(deriveReviewRiskClass([authority])).toEqual({ ok: true, risk_class: "high" });
    }
    // 分類対象が無い入力は fail-close する。
    expect(deriveReviewRiskClass([])).toEqual({
      ok: false,
      failure_code: "REVIEW_FALLBACK_RISK_UNCLASSIFIABLE",
    });
    // 自己申告 low でも、導出が high なら経路に乗らない。
    expect(
      admitDeclaredReviewRisk({
        declared: "low",
        changed_paths: [".github/workflows/harness-check.yml"],
        admitted_risk_classes: ["low", "medium"],
      }),
    ).toEqual({ ok: false, failure_code: "REVIEW_FALLBACK_RISK_UNDERDECLARED" });
    // 申告が導出以上でも、導出 risk が admitted に無ければ拒否する。
    expect(
      admitDeclaredReviewRisk({
        declared: "high",
        changed_paths: ["src/auth/session.ts"],
        admitted_risk_classes: ["low", "medium"],
      }),
    ).toEqual({ ok: false, failure_code: "REVIEW_FALLBACK_RISK_NOT_ADMITTED" });
    // 通常の source 変更は medium として admit される。
    expect(
      admitDeclaredReviewRisk({
        declared: "medium",
        changed_paths: ["src/runtime/impact-ci.ts", "tests/impact-ci.test.ts"],
        admitted_risk_classes: ["low", "medium"],
      }),
    ).toEqual({ ok: true, risk_class: "medium" });
  });

  it("U-IRF-003B: diff header を解釈できない場合は risk 導出を fail-close する", () => {
    const plain = [
      "diff --git a/src/runtime/impact-ci.ts b/src/runtime/impact-ci.ts",
      "index 1111111..2222222 100644",
      "--- a/src/runtime/impact-ci.ts",
      "+++ b/src/runtime/impact-ci.ts",
      "@@ -1,1 +1,1 @@",
      "-old",
      "+new",
    ].join("\n");
    expect(parseChangedPathsFromDiff(plain)).toEqual({
      ok: true,
      changed_paths: ["src/runtime/impact-ci.ts"],
    });

    // git は core.quotePath 既定で空白・非 ASCII path を quote する。素の `\S+` では
    // header に一致せず、黙って読み飛ばすと該当 file が risk 導出から漏れる。
    for (const quoted of [
      'diff --git "a/docs/設計 メモ.md" "b/docs/設計 メモ.md"',
      'diff --git "a/src/auth handler.ts" "b/src/auth handler.ts"',
    ]) {
      expect(parseChangedPathsFromDiff([quoted, "index 1..2 100644"].join("\n"))).toEqual({
        ok: false,
        failure_code: "REVIEW_FALLBACK_RISK_UNCLASSIFIABLE",
      });
    }

    // 混在 diff でも、解釈できない header が 1 行でもあれば全体を fail-close する
    // （quoted 分だけ落として残りで分類すると過小分類になる）。
    const mixed = [
      "diff --git a/README.md b/README.md",
      "index 1..2 100644",
      'diff --git "a/src/auth handler.ts" "b/src/auth handler.ts"',
      "index 3..4 100644",
    ].join("\n");
    expect(parseChangedPathsFromDiff(mixed)).toEqual({
      ok: false,
      failure_code: "REVIEW_FALLBACK_RISK_UNCLASSIFIABLE",
    });

    // header が 1 行も無ければ path 集合は空になり、admit 側が fail-close する。
    expect(parseChangedPathsFromDiff("")).toEqual({ ok: true, changed_paths: [] });
    expect(
      admitDeclaredReviewRisk({
        declared: "low",
        changed_paths: [],
        admitted_risk_classes: ["low", "medium"],
      }),
    ).toEqual({ ok: false, failure_code: "REVIEW_FALLBACK_RISK_UNCLASSIFIABLE" });
  });

  it("U-IRF-004D: S4 admission の有効期間には上限がある", () => {
    const bounded = buildKimiReviewFallbackAdmission({
      benchmark_evidence: benchmarkFixture(HEAD),
      negative_oracle_evidence: negativeOracleFixture(HEAD),
      independent_verifier_receipt_digest: digest("claude-v2-receipt"),
      independent_verifier_implementation_head: HEAD,
      issued_at: "2026-08-04T06:00:00.000Z",
      expires_at: "2026-08-05T05:59:59.000Z",
    });
    expect(bounded.expires_at).toBe("2026-08-05T05:59:59.000Z");
    // 24h を 1 秒でも超える window は build 時点で拒否する。
    expect(() =>
      buildKimiReviewFallbackAdmission({
        benchmark_evidence: benchmarkFixture(HEAD),
        negative_oracle_evidence: negativeOracleFixture(HEAD),
        independent_verifier_receipt_digest: digest("claude-v2-receipt"),
        independent_verifier_implementation_head: HEAD,
        issued_at: "2026-08-04T06:00:00.000Z",
        expires_at: "2026-08-05T06:00:01.000Z",
      }),
    ).toThrow("kimi_review_admission_invalid");
    // 既に永続した receipt を後から読む経路でも同じ上限が効く。
    const overlong = {
      ...bounded,
      expires_at: "2027-08-04T06:00:00.000Z",
    };
    expect(() => validateKimiReviewFallbackAdmission(overlong, "2026-08-04T07:00:00.000Z")).toThrow(
      "kimi_review_admission_invalid",
    );
  });

  it("U-IRF-004E: HEAD ごとの attempt slot は原子的に確保される", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-kimi-lease-slot-"));
    const lease = (generation: number) =>
      issueReviewFallbackLease({
        repository: "RetryYN/HELIX-HARNESS",
        pr_number: 391,
        candidate_head: HEAD,
        generation,
        provider: "kimi",
        issued_at: "2026-08-04T06:41:00.000Z",
        expires_at: "2026-08-04T07:01:00.000Z",
      });
    const first = lease(1);
    expect(first.ok).toBe(true);
    if (!first.ok) return;
    expect(persistReviewFallbackLease(root, first.capability)).toMatch(/\.json$/u);
    const slots = readdirSync(root).filter((name) => name.endsWith(".attempt"));
    expect(slots).toHaveLength(1);

    // TOCTOU 窓の再現: .json 走査では 0 件に見える状態でも、確保済み slot が再取得を止める。
    for (const name of readdirSync(root)) {
      if (name.endsWith(".json")) rmSync(join(root, name), { force: true });
    }
    const retry = lease(2);
    expect(retry.ok).toBe(true);
    if (!retry.ok) return;
    expect(persistReviewFallbackLease(root, retry.capability)).toBeNull();
    rmSync(root, { recursive: true, force: true });
  });

  it("U-IRF-007B: v3 receipt の author runtime は自己申告として扱い独立性のみ強制する", () => {
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
      pr_number: 393,
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
      benchmark_evidence: benchmarkFixture(HEAD),
      negative_oracle_evidence: negativeOracleFixture(HEAD),
      independent_verifier_receipt_digest: digest("claude-v2-receipt"),
      independent_verifier_implementation_head: HEAD,
      issued_at: "2026-08-04T06:00:00.000Z",
      expires_at: "2026-08-04T18:00:00.000Z",
    });
    const base = {
      repository: "RetryYN/HELIX-HARNESS",
      pr_number: 393,
      candidate_head: HEAD,
      reviewer_provider: "kimi" as const,
      reviewer_runtime: "kimi-code-cli",
      reviewer_model: "K3-256k",
      reviewer_session: "session-3",
      admission_receipt: admission,
      fallback_implementation_head: HEAD,
      implementation_tree: "c".repeat(40),
      fallback_evidence: failure.capability,
      lease: lease.capability,
      review_packet_digest: digest("packet"),
      output: parsed.capability,
      ci_run_id: 789,
      ci_conclusion: "success" as const,
      db_receipt_digest: digest("db"),
      db_converged: true as const,
      reviewed_at: "2026-08-04T06:50:00.000Z",
    };
    // codex 以外の申告も受理する（field は検証済み事実ではなく自己申告）。
    const claudeAuthored = buildProviderNeutralReviewReceipt({
      ...base,
      declared_author_runtime: "claude",
    });
    expect(claudeAuthored.ok).toBe(true);
    if (!claudeAuthored.ok) return;
    expect(claudeAuthored.receipt.declared_author_runtime).toBe("claude");
    expect(validateProviderNeutralReviewReceipt(claudeAuthored.receipt)).toEqual(
      claudeAuthored.receipt,
    );
    // 独立性（author != reviewer）は build と validate の双方で強制する。
    expect(
      buildProviderNeutralReviewReceipt({ ...base, declared_author_runtime: "kimi-code-cli" }),
    ).toEqual({ ok: false, failure_code: "INDEPENDENT_REVIEW_RECEIPT_BINDING_INVALID" });
    expect(() =>
      validateProviderNeutralReviewReceipt({
        ...claudeAuthored.receipt,
        declared_author_runtime: "kimi-code-cli",
      }),
    ).toThrow("provider_neutral_receipt_invalid");
    // 永続 receipt は任意 JSON なので型検証を明示する。非文字列だと `.length` が undefined になり、
    // 長さ判定も独立性判定も素通りする（旧 `!== "codex"` は非文字列を暗黙に拒否していた）。
    for (const forged of [42, null, ["codex"], { runtime: "codex" }, true]) {
      expect(() =>
        validateProviderNeutralReviewReceipt({
          ...claudeAuthored.receipt,
          declared_author_runtime: forged,
        }),
      ).toThrow("provider_neutral_receipt_invalid");
    }
    expect(() =>
      validateProviderNeutralReviewReceipt({
        ...claudeAuthored.receipt,
        declared_author_runtime: "",
      }),
    ).toThrow("provider_neutral_receipt_invalid");
    // build 入力も CLI 引数や receipt 再構成など任意 JSON 由来になり得るため、型・空文字の
    // 拒否を validate と同じ強度で build 側にも pin する（TypeScript の型は実行時保証ではない）。
    for (const forged of [42, null, ["codex"], { runtime: "codex" }, true, ""]) {
      expect(
        buildProviderNeutralReviewReceipt({
          ...base,
          declared_author_runtime: forged as unknown as string,
        }),
      ).toEqual({ ok: false, failure_code: "INDEPENDENT_REVIEW_RECEIPT_BINDING_INVALID" });
    }
  });

  it("U-IRF-007A: v3 receipt は lease の実行窓と時系列順序を束縛する", () => {
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
      pr_number: 392,
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
      benchmark_evidence: benchmarkFixture(HEAD),
      negative_oracle_evidence: negativeOracleFixture(HEAD),
      independent_verifier_receipt_digest: digest("claude-v2-receipt"),
      independent_verifier_implementation_head: HEAD,
      issued_at: "2026-08-04T06:00:00.000Z",
      expires_at: "2026-08-04T18:00:00.000Z",
    });
    const base = {
      repository: "RetryYN/HELIX-HARNESS",
      pr_number: 392,
      candidate_head: HEAD,
      declared_author_runtime: "codex" as const,
      reviewer_provider: "kimi" as const,
      reviewer_runtime: "kimi-code-cli",
      reviewer_model: "K3-256k",
      reviewer_session: "session-2",
      admission_receipt: admission,
      fallback_implementation_head: HEAD,
      implementation_tree: "c".repeat(40),
      fallback_evidence: failure.capability,
      lease: lease.capability,
      review_packet_digest: digest("packet"),
      output: parsed.capability,
      ci_run_id: 456,
      ci_conclusion: "success" as const,
      db_receipt_digest: digest("db"),
      db_converged: true as const,
    };
    const built = buildProviderNeutralReviewReceipt({
      ...base,
      reviewed_at: "2026-08-04T06:50:00.000Z",
    });
    expect(built.ok).toBe(true);
    if (!built.ok) return;
    expect(built.receipt.lease_issued_at).toBe("2026-08-04T06:41:00.000Z");
    expect(built.receipt.lease_expires_at).toBe("2026-08-04T07:01:00.000Z");
    expect(validateProviderNeutralReviewReceipt(built.receipt)).toEqual(built.receipt);

    // lease 期限切れ後に完了した review は receipt にならない。
    expect(
      buildProviderNeutralReviewReceipt({ ...base, reviewed_at: "2026-08-04T07:01:00.001Z" }),
    ).toEqual({ ok: false, failure_code: "INDEPENDENT_REVIEW_RECEIPT_BINDING_INVALID" });
    // lease 発行より前の review も拒否する。
    expect(
      buildProviderNeutralReviewReceipt({ ...base, reviewed_at: "2026-08-04T06:40:59.999Z" }),
    ).toEqual({ ok: false, failure_code: "INDEPENDENT_REVIEW_RECEIPT_BINDING_INVALID" });
    // 永続済み receipt を後から読む経路でも窓外の reviewed_at を拒否する。
    expect(() =>
      validateProviderNeutralReviewReceipt({
        ...built.receipt,
        reviewed_at: "2026-08-04T07:30:00.000Z",
      }),
    ).toThrow("provider_neutral_receipt_invalid");
  });
});

describe("provider auth write-back (U-IRF-010)", () => {
  const hostCredential = {
    access_token: "host-access",
    refresh_token: "host-refresh",
    expires_at: 1000,
    scope: "kimi-code",
    token_type: "Bearer",
    expires_in: 900,
  };
  const buf = (value: unknown) => Buffer.from(JSON.stringify(value));
  const rotated = {
    ...hostCredential,
    access_token: "new-access",
    refresh_token: "new-refresh",
    expires_at: 2000,
  };

  it("U-IRF-010a: rotate された credential だけを書き戻し、形が崩れた入力は fail-close する", () => {
    // 正: rotation を検出して書き戻す。
    expect(
      evaluateProviderAuthWriteBack({
        host: buf(hostCredential),
        staged: buf(rotated),
        staged_exists: true,
        staged_is_regular_file: true,
      }),
    ).toEqual({
      action: "write",
      host_digest: sha256Digest(JSON.stringify(hostCredential)),
      staged_digest: sha256Digest(JSON.stringify(rotated)),
    });
    // 正: 無変更なら書かない（不要な host 書き込みを起こさない）。
    expect(
      evaluateProviderAuthWriteBack({
        host: buf(hostCredential),
        staged: buf(hostCredential),
        staged_exists: true,
        staged_is_regular_file: true,
      }),
    ).toEqual({
      action: "skip",
      reason: "unchanged",
      host_digest: sha256Digest(JSON.stringify(hostCredential)),
    });
    // 負: worker 由来のバイト列が host 認証面へ通る操作なので、形の逸脱は全て拒否する。
    const cases: Array<[Parameters<typeof evaluateProviderAuthWriteBack>[0], string]> = [
      [
        {
          host: buf(hostCredential),
          staged: null,
          staged_exists: false,
          staged_is_regular_file: false,
        },
        "staged_missing",
      ],
      [
        {
          host: buf(hostCredential),
          staged: buf(rotated),
          staged_exists: true,
          staged_is_regular_file: false,
        },
        "staged_not_regular_file",
      ],
      [
        {
          host: buf(hostCredential),
          staged: Buffer.alloc(MAX_PROVIDER_AUTH_WRITE_BACK_BYTES + 1, 0x20),
          staged_exists: true,
          staged_is_regular_file: true,
        },
        "staged_too_large",
      ],
      [
        {
          host: buf(hostCredential),
          staged: Buffer.from("not json"),
          staged_exists: true,
          staged_is_regular_file: true,
        },
        "staged_not_json_object",
      ],
      [
        {
          host: buf(hostCredential),
          staged: buf([rotated]),
          staged_exists: true,
          staged_is_regular_file: true,
        },
        "staged_not_json_object",
      ],
      [
        {
          host: Buffer.from("not json"),
          staged: buf(rotated),
          staged_exists: true,
          staged_is_regular_file: true,
        },
        "host_not_json_object",
      ],
      [
        {
          host: buf(hostCredential),
          staged: buf({ ...rotated, extra: "x" }),
          staged_exists: true,
          staged_is_regular_file: true,
        },
        "key_set_mismatch",
      ],
      [
        {
          host: buf(hostCredential),
          staged: buf({ ...rotated, expires_in: "900" }),
          staged_exists: true,
          staged_is_regular_file: true,
        },
        "value_type_mismatch",
      ],
      [
        {
          host: buf(hostCredential),
          staged: buf({ ...rotated, refresh_token: "" }),
          staged_exists: true,
          staged_is_regular_file: true,
        },
        "empty_token",
      ],
      // 巻き戻し (古い credential の再投入) を拒否する。
      [
        {
          host: buf(hostCredential),
          staged: buf({ ...rotated, expires_at: 999 }),
          staged_exists: true,
          staged_is_regular_file: true,
        },
        "expiry_not_advanced",
      ],
    ];
    for (const [input, reason] of cases) {
      expect(evaluateProviderAuthWriteBack(input)).toEqual({ action: "reject", reason });
    }
  });

  it("U-IRF-010b: 書き戻しは backup を残して atomic に置換し、symlink は host を書き換えない", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-authwb-"));
    try {
      const hostPath = join(root, "kimi-code.json");
      const stagedPath = join(root, "staged.json");
      writeFileSync(hostPath, JSON.stringify(hostCredential));
      writeFileSync(stagedPath, JSON.stringify(rotated));
      const result = reclaimRotatedProviderAuth({
        host_credentials_path: hostPath,
        staged_credentials_path: stagedPath,
      });
      expect(result.wrote).toBe(true);
      expect(result.decision.action).toBe("write");
      expect(JSON.parse(readFileSync(hostPath, "utf8"))).toEqual(rotated);
      expect(JSON.parse(readFileSync(`${hostPath}.helix-bak`, "utf8"))).toEqual(hostCredential);

      // symlink 経由では書き戻さない（host 側の別 path への書き込み誘導を塞ぐ）。
      const victimPath = join(root, "victim.json");
      writeFileSync(victimPath, JSON.stringify({ ...rotated, expires_at: 3000 }));
      const linkPath = join(root, "linked.json");
      symlinkSync(victimPath, linkPath);
      writeFileSync(hostPath, JSON.stringify(hostCredential));
      const viaLink = reclaimRotatedProviderAuth({
        host_credentials_path: hostPath,
        staged_credentials_path: linkPath,
      });
      expect(viaLink).toEqual({
        decision: { action: "reject", reason: "staged_not_regular_file" },
        wrote: false,
        write_error: null,
        cleanup_failed: false,
      });
      expect(JSON.parse(readFileSync(hostPath, "utf8"))).toEqual(hostCredential);

      // 書き込み側も symlink を追従しない。`.helix-bak` へ事前に symlink が植えられていても、
      // host credential の平文は target へ流出せず、link 自体が regular file へ置き換わる。
      const bakVictim = join(root, "bak-victim.json");
      writeFileSync(bakVictim, "bak-victim-untouched");
      rmSync(`${hostPath}.helix-bak`, { force: true });
      symlinkSync(bakVictim, `${hostPath}.helix-bak`);
      writeFileSync(stagedPath, JSON.stringify(rotated));
      const planted = reclaimRotatedProviderAuth({
        host_credentials_path: hostPath,
        staged_credentials_path: stagedPath,
      });
      expect(planted.wrote).toBe(true);
      expect(readFileSync(bakVictim, "utf8")).toBe("bak-victim-untouched");
      expect(lstatSync(`${hostPath}.helix-bak`).isSymbolicLink()).toBe(false);
      expect(lstatSync(hostPath).isSymbolicLink()).toBe(false);
      expect(JSON.parse(readFileSync(hostPath, "utf8"))).toEqual(rotated);
      expect(JSON.parse(readFileSync(`${hostPath}.helix-bak`, "utf8"))).toEqual(hostCredential);

      // 書き込みフェーズの失敗を無言にしない。恒久的な I/O 失敗で書き戻しが効かなくなっても、
      // 「評価は write 可だったが書けなかった」ことが audit evidence に残らなければ、
      // 実行ごとに認証が失効する事象の再発を切り分けられない。
      const locked = mkdtempSync(join(tmpdir(), "helix-authwb-locked-"));
      const lockedHost = join(locked, "kimi-code.json");
      const lockedStaged = join(locked, "staged.json");
      writeFileSync(lockedHost, JSON.stringify(hostCredential));
      writeFileSync(lockedStaged, JSON.stringify(rotated));
      chmodSync(locked, 0o500);
      try {
        const failed = reclaimRotatedProviderAuth({
          host_credentials_path: lockedHost,
          staged_credentials_path: lockedStaged,
        });
        expect(failed.decision.action).toBe("write");
        expect(failed.wrote).toBe(false);
        expect(failed.write_error).toMatch(/^io_error:/u);
        expect(JSON.parse(readFileSync(lockedHost, "utf8"))).toEqual(hostCredential);
      } finally {
        chmodSync(locked, 0o700);
        rmSync(locked, { recursive: true, force: true });
      }
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});

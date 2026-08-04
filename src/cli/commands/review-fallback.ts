import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { join } from "node:path";
import type { Command } from "commander";
import { createL3G3LogicalDbReceipt } from "../../doctor/l3-g3-logical-db-receipt";
import {
  buildKimiFallbackInvocation,
  buildKimiReviewFallbackAdmission,
  buildProviderNeutralReviewReceipt,
  classifyReviewProviderFailure,
  executeKimiFallbackReview,
  issueReviewFallbackLease,
  persistKimiReviewFallbackAdmission,
  persistProviderNeutralReviewReceipt,
  persistReviewFallbackLease,
  type ReviewRiskClass,
  selectIndependentReviewProvider,
  validateKimiReviewFallbackAdmissionForImplementation,
} from "../../runtime/independent-review-fallback";

interface PrView {
  url: string;
  headRefOid: string;
  state: string;
  title: string;
  body: string;
  baseRefName: string;
}

function absoluteExecutable(candidates: readonly string[]): string | null {
  return candidates.find((candidate) => candidate.startsWith("/") && existsSync(candidate)) ?? null;
}

export function registerReviewFallbackCommand(github: Command): void {
  github
    .command("pr-review-fallback-admission")
    .description("build a Claude-verified scoped Kimi S4 admission receipt")
    .requiredOption("--input-json <json>", "fixture/oracle digests and bounded validity JSON")
    .option("--apply", "persist the S4 admission receipt")
    .option("--json", "JSON output")
    .action((opts: { inputJson: string; apply?: boolean; json?: boolean }) => {
      const raw = JSON.parse(opts.inputJson) as Record<string, unknown>;
      const receipt = buildKimiReviewFallbackAdmission({
        benchmark_evidence: JSON.parse(readFileSync(String(raw.benchmark_evidence_path), "utf8")),
        negative_oracle_evidence: JSON.parse(
          readFileSync(String(raw.negative_oracle_evidence_path), "utf8"),
        ),
        independent_verifier_provider: String(raw.independent_verifier_provider) as
          | "claude"
          | "human_po_bootstrap",
        bootstrap_authority_digest:
          raw.bootstrap_authority_digest === undefined
            ? undefined
            : (String(raw.bootstrap_authority_digest) as `sha256:${string}`),
        issued_at: String(raw.issued_at),
        expires_at: String(raw.expires_at),
      });
      const path = opts.apply
        ? persistKimiReviewFallbackAdmission(
            join(process.cwd(), ".helix", "runtime", "review-fallback", "admission"),
            receipt,
          )
        : null;
      process.stdout.write(
        `${JSON.stringify({ ok: true, dry_run: !opts.apply, receipt, receipt_path: path }, null, opts.json ? 2 : 0)}\n`,
      );
    });

  github
    .command("pr-review-fallback")
    .description("probe Claude and switch one bounded current-HEAD review to sandboxed Kimi ACP")
    .requiredOption("--pr <number>", "pull request number")
    .requiredOption("--ci-run <number>", "successful current-HEAD GitHub Actions run")
    .requiredOption("--admission-receipt <path>", "current Claude-verified Kimi S4 receipt")
    .option("--generation <number>", "review generation", "1")
    .option("--risk <class>", "low or medium", "medium")
    .option("--apply", "persist lease and provider-neutral receipt")
    .option("--json", "JSON output")
    .action(
      async (opts: {
        pr: string;
        ciRun: string;
        admissionReceipt: string;
        generation: string;
        risk: ReviewRiskClass;
        apply?: boolean;
        json?: boolean;
      }) => {
        const prNumber = Number(opts.pr);
        const generation = Number(opts.generation);
        const ciRunId = Number(opts.ciRun);
        if (!["low", "medium"].includes(opts.risk)) throw new Error("fallback_risk_not_admitted");
        const implementation = spawnSync("git", ["rev-parse", "HEAD"], {
          cwd: process.cwd(),
          encoding: "utf8",
        });
        if (implementation.status !== 0) {
          throw new Error("fallback_implementation_head_unresolved");
        }
        const admission = validateKimiReviewFallbackAdmissionForImplementation(
          JSON.parse(readFileSync(opts.admissionReceipt, "utf8")) as unknown,
          new Date().toISOString(),
          implementation.stdout.trim(),
        );
        if (!admission.admitted_risk_classes.includes(opts.risk as "low" | "medium")) {
          throw new Error("fallback_risk_not_admitted");
        }
        const viewed = spawnSync(
          "gh",
          ["pr", "view", String(prNumber), "--json", "url,headRefOid,state,title,body,baseRefName"],
          { cwd: process.cwd(), encoding: "utf8" },
        );
        if (viewed.status !== 0) throw new Error("pr_view_failed");
        const current = JSON.parse(viewed.stdout) as PrView;
        if (current.state !== "OPEN") throw new Error("pr_not_open");
        const repository =
          current.url.match(/^https:\/\/github\.com\/([^/]+\/[^/]+)\/pull\/\d+$/u)?.[1] ?? "";
        const diff = spawnSync("gh", ["pr", "diff", String(prNumber)], {
          cwd: tmpdir(),
          encoding: "utf8",
          maxBuffer: 512 * 1024,
        });
        if (diff.status !== 0) throw new Error("review_packet_diff_failed");
        const refreshed = spawnSync(
          "gh",
          ["pr", "view", String(prNumber), "--json", "headRefOid,state"],
          { cwd: process.cwd(), encoding: "utf8" },
        );
        const refreshedState =
          refreshed.status === 0
            ? (JSON.parse(refreshed.stdout) as { headRefOid?: string; state?: string })
            : null;
        if (refreshedState?.headRefOid !== current.headRefOid || refreshedState.state !== "OPEN") {
          throw new Error("review_packet_head_changed");
        }
        const packet = [
          `repository: ${repository}`,
          `pr_number: ${prNumber}`,
          `candidate_head: ${current.headRefOid}`,
          `base_branch: ${current.baseRefName}`,
          `title: ${current.title}`,
          "PR body:",
          current.body,
          "Exact GitHub PR diff:",
          diff.stdout,
        ].join("\n");

        const primary = spawnSync(
          "claude",
          ["-p", "Return exactly HELIX_REVIEW_PROVIDER_READY", "--tools", ""],
          { cwd: tmpdir(), encoding: "utf8", timeout: 20_000 },
        );
        if (primary.status === 0) {
          const output = { ok: false, provider: "claude", reason: "primary_healthy" };
          process.stdout.write(`${JSON.stringify(output, null, opts.json ? 2 : 0)}\n`);
          process.exitCode = 2;
          return;
        }
        const primaryErrorCode =
          primary.error && "code" in primary.error ? String(primary.error.code) : "";
        const primaryStderr =
          primaryErrorCode === "ETIMEDOUT"
            ? "claim timeout"
            : primaryErrorCode === "ENOENT"
              ? "provider unavailable"
              : `${primary.stdout}\n${primary.stderr}\n${primary.error?.message ?? ""}`;
        const failure = classifyReviewProviderFailure({
          provider: "claude",
          candidate_head: current.headRefOid,
          exit_code: primary.status ?? 1,
          stderr: primaryStderr,
          observed_at: new Date().toISOString(),
        });
        if (!failure.ok) throw new Error(failure.failure_code);
        const selected = selectIndependentReviewProvider({
          primary: "claude",
          fallback: "kimi",
          primary_failure: failure.capability,
          candidate_head: current.headRefOid,
          task_class: "pr_convergence_review",
          risk_class: opts.risk,
          admitted_fallback_task_classes: ["pr_convergence_review"],
        });
        if (!selected.ok || selected.provider !== "kimi") throw new Error("fallback_not_selected");
        const lease = issueReviewFallbackLease({
          repository,
          pr_number: prNumber,
          candidate_head: current.headRefOid,
          generation,
          provider: "kimi",
          issued_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 20 * 60 * 1000).toISOString(),
        });
        if (!lease.ok) throw new Error(lease.failure_code);
        const runtimeRoot = join(process.cwd(), ".helix", "runtime", "review-fallback");
        const leasePath = opts.apply
          ? persistReviewFallbackLease(join(runtimeRoot, "leases"), lease.capability)
          : null;
        if (opts.apply && !leasePath) throw new Error("fallback_lease_persist_failed");

        const kimiHome = join(homedir(), ".kimi-code");
        const kimi = absoluteExecutable([join(kimiHome, "bin", "kimi")]);
        const bubblewrap = absoluteExecutable([
          "/usr/bin/bwrap",
          join(homedir(), ".local/bin/bwrap"),
        ]);
        if (!kimi || !bubblewrap) throw new Error("fallback_runtime_unavailable");
        const invocation = buildKimiFallbackInvocation({
          executable: kimi,
          model: "kimi-code/k3-256k",
          review_packet: packet,
          kimi_code_home: kimiHome,
        });
        if (!invocation.ok) throw new Error(invocation.failure_code);
        const reviewed = await executeKimiFallbackReview({
          invocation,
          candidate_head: current.headRefOid,
          bubblewrap_path: bubblewrap,
          host_kimi_code_home: kimiHome,
          scratch_base: tmpdir(),
        });
        if (!reviewed.ok) throw new Error(reviewed.failure_code);
        if (reviewed.capability.verdict !== "approve") {
          process.stdout.write(
            `${JSON.stringify({ ok: false, review: reviewed.capability }, null, 2)}\n`,
          );
          process.exitCode = 1;
          return;
        }
        const ci = spawnSync(
          "gh",
          ["run", "view", String(ciRunId), "--json", "headSha,conclusion"],
          {
            cwd: process.cwd(),
            encoding: "utf8",
          },
        );
        const ciState = ci.status === 0 ? (JSON.parse(ci.stdout) as Record<string, unknown>) : {};
        if (ciState.headSha !== current.headRefOid || ciState.conclusion !== "success") {
          throw new Error("fallback_ci_head_not_green");
        }
        const db = createL3G3LogicalDbReceipt(process.cwd());
        if (!db.converged) throw new Error("fallback_db_not_converged");
        const built = buildProviderNeutralReviewReceipt({
          repository,
          pr_number: prNumber,
          candidate_head: current.headRefOid,
          author_runtime: "codex",
          reviewer_provider: "kimi",
          reviewer_runtime: "kimi-code-cli",
          reviewer_model: invocation.model,
          reviewer_session: reviewed.reviewer_session,
          fallback_evidence: failure.capability,
          lease: lease.capability,
          review_packet_digest: invocation.packet_digest,
          output: reviewed.capability,
          ci_run_id: ciRunId,
          ci_conclusion: "success",
          db_receipt_digest: db.receipt_digest,
          db_converged: true,
          reviewed_at: new Date().toISOString(),
        });
        if (!built.ok) throw new Error(built.failure_code);
        const receiptPath = opts.apply
          ? persistProviderNeutralReviewReceipt(join(runtimeRoot, "receipts"), built.receipt)
          : null;
        process.stdout.write(
          `${JSON.stringify({ ok: true, dry_run: !opts.apply, receipt: built.receipt, receipt_path: receiptPath }, null, opts.json ? 2 : 0)}\n`,
        );
      },
    );
}

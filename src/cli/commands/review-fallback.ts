import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import type { Command } from "commander";
import { createL3G3LogicalDbReceipt } from "../../doctor/l3-g3-logical-db-receipt";
import { claudeMemoryRuntimeRoot } from "../../runtime/claude-memory-wake";
import {
  CLAUDE_PR_REVIEW_RECEIPT_SCHEMA,
  loadClaudePrReviewReceipt,
} from "../../runtime/claude-pr-convergence";
import { renderProviderNeutralPrReviewComment } from "../../runtime/github-cross-review-admission";
import {
  admitDeclaredReviewRisk,
  buildKimiFallbackInvocation,
  buildKimiReviewFallbackAdmission,
  buildProviderNeutralReviewReceipt,
  classifyReviewProviderFailure,
  executeKimiFallbackReview,
  issueReviewFallbackLease,
  parseChangedPathsFromDiff,
  persistKimiReviewFallbackAdmission,
  persistProviderNeutralReviewReceipt,
  persistReviewFallbackLease,
  type ReviewRiskClass,
  selectIndependentReviewProvider,
  validateClaudeAdmissionCommentEvidence,
  validateKimiReviewFallbackAdmission,
  validateKimiReviewFallbackAdmissionForImplementation,
} from "../../runtime/independent-review-fallback";
import {
  computeReviewLaneClosureDigest,
  resolveReviewLaneProviderMaterial,
} from "../../runtime/review-lane-closure";

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

/**
 * 共有保管庫にはhistorical v1/v2 receiptも残るため、現行v3だけをdecodeする。
 * 不正な候補は無視し、期待digestが見つからなければ呼出側でfail-closeする。
 */
export function findCurrentClaudePrReviewReceipt(
  receiptRoot: string,
  expectedReceiptDigest: string,
): ReturnType<typeof loadClaudePrReviewReceipt> | null {
  for (const name of readdirSync(receiptRoot)
    .filter((entry) => entry.endsWith(".json"))
    .sort()) {
    const path = join(receiptRoot, name);
    let raw: unknown;
    try {
      raw = JSON.parse(readFileSync(path, "utf8")) as unknown;
    } catch {
      continue;
    }
    if (
      !raw ||
      typeof raw !== "object" ||
      (raw as { schemaVersion?: unknown }).schemaVersion !== CLAUDE_PR_REVIEW_RECEIPT_SCHEMA
    ) {
      continue;
    }
    try {
      const receipt = loadClaudePrReviewReceipt(path);
      if (receipt.receiptDigest === expectedReceiptDigest) return receipt;
    } catch {
      // malformed current receipts cannot satisfy the expected digest; keep fail-closed lookup.
    }
  }
  return null;
}

export function registerReviewFallbackCommand(github: Command): void {
  github
    .command("pr-review-fallback-admission")
    .description("build a Claude-verified scoped Kimi S4 admission receipt")
    .requiredOption("--input-json <json>", "fixture/oracle digests and bounded validity JSON")
    .requiredOption("--claude-receipt <path>", "canonical Claude v2 admission review receipt")
    .option("--apply", "persist the S4 admission receipt")
    .option("--json", "JSON output")
    .action(
      (opts: { inputJson: string; claudeReceipt: string; apply?: boolean; json?: boolean }) => {
        const raw = JSON.parse(opts.inputJson) as Record<string, unknown>;
        const canonicalClaudeRoot = resolve(
          claudeMemoryRuntimeRoot(process.cwd()),
          "..",
          "claude-pr-convergence",
          "receipts",
        );
        if (dirname(resolve(opts.claudeReceipt)) !== canonicalClaudeRoot) {
          throw new Error("kimi_review_admission_verifier_receipt_noncanonical");
        }
        const verifier = loadClaudePrReviewReceipt(opts.claudeReceipt);
        const expectedVerifierName = `${verifier.repository.replaceAll("/", "_")}_${verifier.prNumber}_${verifier.headSha}.json`;
        if (resolve(opts.claudeReceipt) !== join(canonicalClaudeRoot, expectedVerifierName)) {
          throw new Error("kimi_review_admission_verifier_receipt_filename_mismatch");
        }
        const verifierComment = verifier.commentUrl.match(
          /^https:\/\/github\.com\/([^/]+\/[^/]+)\/pull\/(\d+)#issuecomment-(\d+)$/u,
        );
        if (!verifierComment) {
          throw new Error("kimi_review_admission_verifier_comment_binding_invalid");
        }
        const fetchedComment = spawnSync(
          "gh",
          [
            "api",
            `repos/${verifier.repository}/issues/comments/${verifierComment[3]}`,
            "--jq",
            "{body: .body, html_url: .html_url}",
          ],
          { cwd: process.cwd(), encoding: "utf8" },
        );
        const commentEvidence =
          fetchedComment.status === 0
            ? (JSON.parse(fetchedComment.stdout) as { body?: string; html_url?: string })
            : null;
        validateClaudeAdmissionCommentEvidence({
          repository: verifier.repository,
          pr_number: verifier.prNumber,
          comment_url: verifier.commentUrl,
          head_sha: verifier.headSha,
          verdict: verifier.verdict,
          blocker_count: verifier.blockerCount,
          ci_run_id: verifier.ciRunId,
          ci_conclusion: verifier.ciConclusion,
          db_receipt_schema_version: verifier.dbReceiptSchemaVersion,
          db_receipt_digest: verifier.dbReceiptDigest,
          receipt_digest: verifier.receiptDigest,
          fetched_html_url: commentEvidence?.html_url,
          fetched_body: commentEvidence?.body,
        });
        if (
          verifier.verdict !== "approve" ||
          verifier.blockerCount !== 0 ||
          verifier.ciConclusion !== "success" ||
          verifier.dbConverged !== true
        ) {
          throw new Error("kimi_review_admission_verifier_receipt_invalid");
        }
        const receipt = buildKimiReviewFallbackAdmission({
          benchmark_evidence: JSON.parse(readFileSync(String(raw.benchmark_evidence_path), "utf8")),
          negative_oracle_evidence: JSON.parse(
            readFileSync(String(raw.negative_oracle_evidence_path), "utf8"),
          ),
          independent_verifier_receipt_digest: verifier.receiptDigest as `sha256:${string}`,
          independent_verifier_implementation_head: verifier.headSha,
          issued_at: String(raw.issued_at),
          expires_at: String(raw.expires_at),
        });
        // builder は決定的 pure core のため input.issued_at で構造を検査する。外部 I/O 境界では
        // wall clock を別途照合し、未来 issued_at による bounded validity の迂回を拒否する。
        validateKimiReviewFallbackAdmission(receipt, new Date().toISOString());
        const path = opts.apply
          ? persistKimiReviewFallbackAdmission(
              join(process.cwd(), ".helix", "runtime", "review-fallback", "admission"),
              receipt,
            )
          : null;
        process.stdout.write(
          `${JSON.stringify({ ok: true, dry_run: !opts.apply, receipt, receipt_path: path }, null, opts.json ? 2 : 0)}\n`,
        );
      },
    );

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
        const clean = spawnSync("git", ["status", "--porcelain=v1", "--untracked-files=all"], {
          cwd: process.cwd(),
          encoding: "utf8",
        });
        if (clean.status !== 0 || clean.stdout.trim() !== "") {
          throw new Error("fallback_implementation_dirty_or_drifted");
        }
        const implementation = spawnSync("git", ["rev-parse", "HEAD"], {
          cwd: process.cwd(),
          encoding: "utf8",
        });
        if (implementation.status !== 0) {
          throw new Error("fallback_implementation_head_unresolved");
        }
        const implementationTree = spawnSync("git", ["rev-parse", "HEAD^{tree}"], {
          cwd: process.cwd(),
          encoding: "utf8",
        });
        if (implementationTree.status !== 0) {
          throw new Error("fallback_implementation_tree_unresolved");
        }
        const canonicalAdmissionRoot = resolve(
          process.cwd(),
          ".helix",
          "runtime",
          "review-fallback",
          "admission",
        );
        if (dirname(resolve(opts.admissionReceipt)) !== canonicalAdmissionRoot) {
          throw new Error("fallback_admission_receipt_noncanonical");
        }
        // provider を含む lane closure を先に実測してから admission を照合する。
        // 「受け入れ試験を通した lane 実装」と「これから動かす lane 実装」の同一性は
        // repository の HEAD ではなく、この digest で担保する。
        const kimiHome = join(homedir(), ".kimi-code");
        const kimi = absoluteExecutable([join(kimiHome, "bin", "kimi")]);
        const bubblewrap = absoluteExecutable([
          "/usr/bin/bwrap",
          join(homedir(), ".local/bin/bwrap"),
        ]);
        if (!kimi || !bubblewrap) throw new Error("fallback_runtime_unavailable");
        const reviewerModel = "kimi-code/k3-256k";
        const laneClosureDigest = computeReviewLaneClosureDigest(
          process.cwd(),
          resolveReviewLaneProviderMaterial(kimi, reviewerModel),
        );
        const admission = validateKimiReviewFallbackAdmissionForImplementation(
          JSON.parse(readFileSync(opts.admissionReceipt, "utf8")) as unknown,
          new Date().toISOString(),
          laneClosureDigest,
        );
        const canonicalVerifierRoot = resolve(
          claudeMemoryRuntimeRoot(process.cwd()),
          "..",
          "claude-pr-convergence",
          "receipts",
        );
        const verifier = findCurrentClaudePrReviewReceipt(
          canonicalVerifierRoot,
          admission.independent_verifier_receipt_digest,
        );
        if (!verifier || verifier.headSha !== admission.admission_implementation_head) {
          throw new Error("fallback_admission_verifier_receipt_unresolved");
        }
        const verifierCommentId = verifier.commentUrl.match(/#issuecomment-(\d+)$/u)?.[1];
        if (!verifierCommentId) throw new Error("fallback_admission_verifier_comment_invalid");
        const verifierCommentResult = spawnSync(
          "gh",
          [
            "api",
            `repos/${verifier.repository}/issues/comments/${verifierCommentId}`,
            "--jq",
            "{body: .body, html_url: .html_url, created_at: .created_at, updated_at: .updated_at}",
          ],
          { cwd: process.cwd(), encoding: "utf8" },
        );
        if (verifierCommentResult.status !== 0) {
          throw new Error("fallback_admission_verifier_comment_unresolved");
        }
        const verifierComment = JSON.parse(verifierCommentResult.stdout) as {
          body?: string;
          html_url?: string;
          created_at?: string;
          updated_at?: string;
        };
        if (
          typeof verifierComment.body !== "string" ||
          verifierComment.html_url !== verifier.commentUrl ||
          typeof verifierComment.created_at !== "string" ||
          typeof verifierComment.updated_at !== "string"
        ) {
          throw new Error("fallback_admission_verifier_comment_invalid");
        }
        if (
          resolve(opts.admissionReceipt) !==
          join(canonicalAdmissionRoot, `${admission.receipt_digest.slice("sha256:".length)}.json`)
        ) {
          throw new Error("fallback_admission_receipt_filename_mismatch");
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
        const diff = spawnSync("gh", ["pr", "diff", String(prNumber), "--repo", repository], {
          cwd: process.cwd(),
          encoding: "utf8",
          maxBuffer: 512 * 1024,
        });
        if (diff.status !== 0) throw new Error("review_packet_diff_failed");
        // risk は呼び出し側の自己申告に委ねない。実 diff の path から導出し、過小申告と
        // 非 admitted risk を fail-close する。
        const changedPaths = parseChangedPathsFromDiff(diff.stdout);
        if (!changedPaths.ok) throw new Error(changedPaths.failure_code);
        const admittedRisk = admitDeclaredReviewRisk({
          declared: opts.risk,
          changed_paths: changedPaths.changed_paths,
          admitted_risk_classes: admission.admitted_risk_classes,
        });
        if (!admittedRisk.ok) throw new Error(admittedRisk.failure_code);
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

        if (!opts.apply) {
          process.stdout.write(
            `${JSON.stringify({ ok: true, dry_run: true, provider: "kimi", candidate_head: current.headRefOid, execution: "not_started" }, null, opts.json ? 2 : 0)}\n`,
          );
          return;
        }

        const preflightCi = spawnSync(
          "gh",
          ["run", "view", String(ciRunId), "--json", "headSha,conclusion"],
          { cwd: process.cwd(), encoding: "utf8" },
        );
        const preflightCiState =
          preflightCi.status === 0
            ? (JSON.parse(preflightCi.stdout) as Record<string, unknown>)
            : {};
        if (
          preflightCiState.headSha !== current.headRefOid ||
          preflightCiState.conclusion !== "success"
        ) {
          throw new Error("fallback_ci_head_not_green");
        }
        const preflightDb = createL3G3LogicalDbReceipt(process.cwd());
        if (!preflightDb.converged) throw new Error("fallback_db_not_converged");

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
          risk_class: admittedRisk.risk_class,
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
        const leasePath = persistReviewFallbackLease(join(runtimeRoot, "leases"), lease.capability);
        if (!leasePath) throw new Error("fallback_lease_persist_failed");

        const invocation = buildKimiFallbackInvocation({
          executable: kimi,
          model: reviewerModel,
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
        const postReviewPr = spawnSync(
          "gh",
          ["pr", "view", String(prNumber), "--json", "headRefOid,state"],
          { cwd: process.cwd(), encoding: "utf8" },
        );
        const postReviewPrState =
          postReviewPr.status === 0
            ? (JSON.parse(postReviewPr.stdout) as { headRefOid?: string; state?: string })
            : null;
        if (
          postReviewPrState?.headRefOid !== current.headRefOid ||
          postReviewPrState.state !== "OPEN"
        ) {
          throw new Error("fallback_review_head_changed");
        }
        const postReviewClean = spawnSync(
          "git",
          ["status", "--porcelain=v1", "--untracked-files=all"],
          { cwd: process.cwd(), encoding: "utf8" },
        );
        const postReviewImplementation = spawnSync("git", ["rev-parse", "HEAD", "HEAD^{tree}"], {
          cwd: process.cwd(),
          encoding: "utf8",
        });
        const postReviewIdentity = postReviewImplementation.stdout.trim().split(/\r?\n/u);
        if (
          postReviewClean.status !== 0 ||
          postReviewClean.stdout.trim() !== "" ||
          postReviewImplementation.status !== 0 ||
          postReviewIdentity[0] !== implementation.stdout.trim() ||
          postReviewIdentity[1] !== implementationTree.stdout.trim() ||
          // review 実行中に lane closure（source / provider binary）が差し替わっていないか
          // 再実測する。開始時の照合だけでは TOCTOU 窓が残る。
          computeReviewLaneClosureDigest(
            process.cwd(),
            resolveReviewLaneProviderMaterial(kimi, reviewerModel),
          ) !== laneClosureDigest
        ) {
          throw new Error("fallback_implementation_dirty_or_drifted");
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
          // 実 author runtime を機械検証する手段が無いため、検証済み事実ではなく
          // 自己申告であることを field 名で明示する。独立性は reviewer_runtime との
          // 相異で強制する。
          declared_author_runtime: "codex",
          reviewer_provider: "kimi",
          reviewer_runtime: "kimi-code-cli",
          reviewer_model: invocation.model,
          reviewer_session: reviewed.reviewer_session,
          admission_receipt: admission,
          fallback_implementation_head: implementation.stdout.trim(),
          fallback_lane_closure_digest: laneClosureDigest,
          implementation_tree: implementationTree.stdout.trim(),
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
        const receiptPath = persistProviderNeutralReviewReceipt(
          join(runtimeRoot, "receipts"),
          built.receipt,
        );
        const comment = spawnSync(
          "gh",
          [
            "pr",
            "comment",
            String(prNumber),
            "--body",
            renderProviderNeutralPrReviewComment(built.receipt, {
              admission_receipt: admission,
              admission_verifier_receipt: verifier,
              admission_verifier_comment: {
                body: verifierComment.body,
                html_url: verifierComment.html_url,
                created_at: verifierComment.created_at,
                updated_at: verifierComment.updated_at,
              },
              fallback_evidence: failure.capability,
              lease: lease.capability,
              output: reviewed.capability,
              logical_db_receipt: db,
            }),
          ],
          { cwd: process.cwd(), encoding: "utf8" },
        );
        if (comment.status !== 0) throw new Error("fallback_review_comment_failed");
        process.stdout.write(
          `${JSON.stringify({ ok: true, dry_run: false, receipt: built.receipt, receipt_path: receiptPath, comment_url: comment.stdout.trim() }, null, opts.json ? 2 : 0)}\n`,
        );
      },
    );
}

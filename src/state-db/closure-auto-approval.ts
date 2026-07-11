import { execFileSync } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
import {
  accessSync,
  appendFileSync,
  closeSync,
  existsSync,
  constants as fsConstants,
  fsyncSync,
  lstatSync,
  mkdirSync,
  openSync,
  readFileSync,
  realpathSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";
import { parse as parseYaml } from "yaml";
import { z } from "zod";
import {
  buildProjectClosureApplyPlan,
  buildProjectClosureReviewBundle,
  type ProjectClosureApplyPlan,
  type ProjectCurrentLocationSnapshot,
} from "./current-location";

export type ClosureCapability =
  | "local_plan_status"
  | "version_activation"
  | "state_cutover"
  | "external_publish"
  | "charter_p8";

export interface ClosureCandidateAuthority {
  plan_id: string;
  source_path: string;
  source_digest: `sha256:${string}`;
}

export interface ClosureAutoApprovalManifest {
  schema_version: "closure-auto-approval-manifest.v1";
  repository_head: string;
  generated_at: string;
  expires_at: string;
  candidates: ClosureCandidateAuthority[];
}

export interface ClosureAutoApprovalEvaluation {
  schema_version: "closure-auto-approval-evaluation.v2";
  allowed: boolean;
  authority_digest: `sha256:${string}`;
  repository_head: string;
  target_plan_ids: string[];
  blockers: string[];
  apply_plan: ProjectClosureApplyPlan;
  rendered_patches: Array<{
    plan_id: string;
    path: string;
    before_digest: `sha256:${string}`;
    after_digest: `sha256:${string}`;
    rendered: string;
  }>;
}

const sha256 = (value: string | Buffer): `sha256:${string}` =>
  `sha256:${createHash("sha256").update(value).digest("hex")}`;
const HEX_DIGEST = /^sha256:[0-9a-f]{64}$/;
const SAFE_RUN_ID = /^[A-Za-z0-9][A-Za-z0-9._:-]{7,127}$/;
const IRREVERSIBLE = new Set<ClosureCapability>([
  "version_activation",
  "state_cutover",
  "external_publish",
  "charter_p8",
]);
const digestSchema = z.string().regex(HEX_DIGEST);
const manifestSchema = z
  .object({
    schema_version: z.literal("closure-auto-approval-manifest.v1"),
    repository_head: z.string().regex(/^[0-9a-f]{40}$/),
    generated_at: z.string().datetime(),
    expires_at: z.string().datetime(),
    candidates: z.array(
      z
        .object({
          plan_id: z.string().regex(/^PLAN-[A-Z0-9]+-[A-Za-z0-9-]+$/),
          source_path: z.string().min(1),
          source_digest: digestSchema,
        })
        .strict(),
    ),
  })
  .strict();

export function parseClosureAutoApprovalManifest(value: unknown): ClosureAutoApprovalManifest {
  return manifestSchema.parse(value) as ClosureAutoApprovalManifest;
}

const runRecordSchema = z
  .object({
    schema_version: z.literal("closure-run-record.v1"),
    plan_id: z.string(),
    repository_head: z.string().regex(/^[0-9a-f]{40}$/),
    runs: z.array(
      z
        .object({
          run_id: z.string().regex(SAFE_RUN_ID),
          kind: z.enum(["test", "gate"]),
          oracle_id: z.string().min(1),
          command: z.string().min(1),
          exit_code: z.literal(0),
          output_path: z.string().min(1),
          output_digest: digestSchema,
          completed_at: z.string().datetime(),
        })
        .strict(),
    ),
  })
  .strict();

export function parseClosureBatchInteger(
  raw: string,
  input: { min: number; max?: number },
): number | null {
  if (!/^(?:0|[1-9][0-9]*)$/.test(raw)) return null;
  const value = Number(raw);
  if (
    !Number.isSafeInteger(value) ||
    value < input.min ||
    value > (input.max ?? Number.MAX_SAFE_INTEGER)
  )
    return null;
  return value;
}

export function closureAutoApprovalWindows(input: {
  total: number;
  batchSize: number;
  offset: number;
  all: boolean;
}): Array<{ offset: number; limit: number }> {
  const end = input.all ? input.total : Math.min(input.total, input.offset + input.batchSize);
  const windows: Array<{ offset: number; limit: number }> = [];
  for (let offset = input.offset; offset < end; offset += input.batchSize)
    windows.push({ offset, limit: Math.min(input.batchSize, end - offset) });
  return windows;
}

function canonicalFile(repoRoot: string, path: string): { absolute: string; error: string | null } {
  if (isAbsolute(path)) return { absolute: path, error: "absolute pathは禁止" };
  const absolute = resolve(repoRoot, path);
  const rel = relative(repoRoot, absolute);
  if (rel.startsWith("..") || isAbsolute(rel)) return { absolute, error: "repository外pathは禁止" };
  if (!existsSync(absolute)) return { absolute, error: "pathが存在しない" };
  if (lstatSync(absolute).isSymbolicLink()) return { absolute, error: "symlinkは禁止" };
  if (realpathSync(absolute) !== absolute) return { absolute, error: "canonical pathではない" };
  if (!lstatSync(absolute).isFile()) return { absolute, error: "regular fileではない" };
  return { absolute, error: null };
}

function renderAccepted(source: string): string {
  const frontmatter = /^---\n([\s\S]*?)\n---\n/.exec(source);
  if (!frontmatter) throw new Error("strict frontmatterが無い");
  const statusMatches = frontmatter[1]?.match(/^status:\s*[^\n]+$/gm) ?? [];
  if (statusMatches.length !== 1) throw new Error("frontmatter statusはexactly one必須");
  const nextFrontmatter = frontmatter[0].replace(/^status:\s*[^\n]+$/m, "status: accepted");
  const rendered = `${nextFrontmatter}${source.slice(frontmatter[0].length)}`;
  if (!/^---\n[\s\S]*?^status:\s*accepted\s*$/m.test(rendered))
    throw new Error("accepted render検証失敗");
  return rendered;
}

function planAuthority(source: string) {
  const match = /^---\n([\s\S]*?)\n---\n/.exec(source);
  if (!match?.[1]) throw new Error("strict frontmatterが無い");
  const parsed = z
    .object({
      plan_id: z.string(),
      status: z.enum(["completed", "confirmed"]),
      verification_bindings: z.array(
        z.object({ oracle_id: z.string(), test_path: z.string() }).passthrough(),
      ),
      closure_auto_authority: z
        .object({
          irreversible_impact: z.boolean(),
          capabilities: z.array(
            z.enum([
              "local_plan_status",
              "version_activation",
              "state_cutover",
              "external_publish",
              "charter_p8",
            ]),
          ),
          required_gates: z.array(z.object({ gate_id: z.string(), command: z.string() }).strict()),
        })
        .strict(),
    })
    .passthrough()
    .parse(parseYaml(match[1]));
  return parsed;
}

function validateCanonicalRuns(input: {
  repoRoot: string;
  planId: string;
  head: string;
  authority: ReturnType<typeof planAuthority>;
  planCommitMs: number;
  nowMs: number;
  seenRunIds: Set<string>;
}): string[] {
  const errors: string[] = [];
  const recordPath = `.helix/evidence/closure-runs/${input.planId}.json`;
  const canonical = canonicalFile(input.repoRoot, recordPath);
  if (canonical.error) return [`canonical run record ${canonical.error}`];
  let record: z.infer<typeof runRecordSchema>;
  try {
    record = runRecordSchema.parse(JSON.parse(readFileSync(canonical.absolute, "utf8")));
  } catch {
    return ["canonical run record schema不正"];
  }
  if (record.plan_id !== input.planId) errors.push("run record plan_id不一致");
  if (record.repository_head !== input.head) errors.push("run record HEAD不一致");
  const expectedTests = new Map(
    input.authority.verification_bindings.map((binding) => [binding.oracle_id, binding.test_path]),
  );
  const expectedGates = new Map(
    input.authority.closure_auto_authority.required_gates.map((gate) => [
      gate.gate_id,
      gate.command,
    ]),
  );
  const actualTests = new Set<string>();
  const actualGates = new Set<string>();
  for (const run of record.runs) {
    if (input.seenRunIds.has(run.run_id)) errors.push(`run_id重複: ${run.run_id}`);
    input.seenRunIds.add(run.run_id);
    const completedMs = Date.parse(run.completed_at);
    if (
      completedMs < input.planCommitMs ||
      completedMs > input.nowMs ||
      input.nowMs - completedMs > 86_400_000
    )
      errors.push(`${run.run_id}: run freshness不正`);
    const expectedCommand =
      run.kind === "test" ? expectedTests.get(run.oracle_id) : expectedGates.get(run.oracle_id);
    if (expectedCommand === undefined) errors.push(`${run.run_id}: oracle binding不正`);
    else if (run.kind === "test") {
      if (!run.command.includes(expectedCommand))
        errors.push(`${run.run_id}: test command allowlist不一致`);
      actualTests.add(run.oracle_id);
    } else {
      if (run.command !== expectedCommand)
        errors.push(`${run.run_id}: gate command allowlist不一致`);
      actualGates.add(run.oracle_id);
    }
    const output = canonicalFile(input.repoRoot, run.output_path);
    if (output.error) errors.push(`${run.run_id}: output ${output.error}`);
    else if (sha256(readFileSync(output.absolute)) !== run.output_digest)
      errors.push(`${run.run_id}: output artifact digest drift`);
  }
  if ([...expectedTests.keys()].sort().join("\n") !== [...actualTests].sort().join("\n"))
    errors.push("expected test集合 exact不一致");
  if ([...expectedGates.keys()].sort().join("\n") !== [...actualGates].sort().join("\n"))
    errors.push("expected gate集合 exact不一致");
  return errors;
}

export function currentRepositoryHead(repoRoot: string): string {
  return execFileSync("git", ["rev-parse", "HEAD"], { cwd: repoRoot, encoding: "utf8" }).trim();
}

export function canonicalClosureAuthorityDigest(
  repoRoot: string,
  manifest: ClosureAutoApprovalManifest,
): `sha256:${string}` {
  const materials = manifest.candidates.map((candidate) => {
    const runPath = `.helix/evidence/closure-runs/${candidate.plan_id}.json`;
    const runBytes = readFileSync(join(repoRoot, runPath));
    const record = runRecordSchema.parse(JSON.parse(runBytes.toString("utf8")));
    return {
      plan_id: candidate.plan_id,
      plan_digest: sha256(readFileSync(join(repoRoot, candidate.source_path))),
      run_record_digest: sha256(runBytes),
      output_digests: record.runs.map((run) => ({
        run_id: run.run_id,
        digest: sha256(readFileSync(join(repoRoot, run.output_path))),
      })),
    };
  });
  return sha256(JSON.stringify({ manifest, materials }));
}

export function evaluateClosureAutoApproval(input: {
  repoRoot: string;
  snapshot: ProjectCurrentLocationSnapshot;
  manifest: ClosureAutoApprovalManifest;
  limit: number;
  offset: number;
  now?: Date;
}): ClosureAutoApprovalEvaluation {
  const { repoRoot, manifest } = input;
  const nowMs = (input.now ?? new Date()).getTime();
  const generatedMs = Date.parse(manifest.generated_at);
  const expiresMs = Date.parse(manifest.expires_at);
  const bundle = buildProjectClosureReviewBundle(input.snapshot, {
    action: "close_ready",
    limit: input.limit,
    offset: input.offset,
  });
  const blockers: string[] = [];
  const head = currentRepositoryHead(repoRoot);
  const headCommitMs = Date.parse(
    execFileSync("git", ["show", "-s", "--format=%cI", "HEAD"], {
      cwd: repoRoot,
      encoding: "utf8",
    }).trim(),
  );
  if (manifest.schema_version !== "closure-auto-approval-manifest.v1")
    blockers.push("schema不一致");
  if (manifest.repository_head !== head) blockers.push("repository HEAD drift");
  if (
    !Number.isFinite(generatedMs) ||
    !Number.isFinite(expiresMs) ||
    nowMs < generatedMs ||
    nowMs > expiresMs
  )
    blockers.push("manifest freshness不正");
  if (expiresMs - generatedMs > 3_600_000) blockers.push("manifest TTL上限超過");
  if (manifest.candidates.length !== bundle.candidates.length)
    blockers.push("candidate cardinality不一致");
  const seen = new Set<string>();
  const seenRunIds = new Set<string>();
  for (const candidate of bundle.candidates) {
    const authority = manifest.candidates.find((item) => item.plan_id === candidate.planId);
    if (!authority) {
      blockers.push(`${candidate.planId}: authority欠落`);
      continue;
    }
    if (seen.has(authority.plan_id)) blockers.push(`${authority.plan_id}: authority重複`);
    seen.add(authority.plan_id);
    if (authority.source_path !== candidate.sourcePath)
      blockers.push(`${candidate.planId}: source path不一致`);
    const source = canonicalFile(repoRoot, authority.source_path);
    if (source.error) blockers.push(`${candidate.planId}: ${source.error}`);
    else {
      const sourceText = readFileSync(source.absolute, "utf8");
      if (sha256(sourceText) !== authority.source_digest)
        blockers.push(`${candidate.planId}: PLAN bytes drift`);
      try {
        const plan = planAuthority(sourceText);
        if (plan.plan_id !== candidate.planId) blockers.push(`${candidate.planId}: plan_id不一致`);
        const capabilityIrreversible = plan.closure_auto_authority.capabilities.some((value) =>
          IRREVERSIBLE.has(value),
        );
        const forcedIrreversible =
          candidate.planId === "PLAN-L7-146" || candidate.planId.startsWith("PLAN-M-02");
        if (plan.closure_auto_authority.irreversible_impact !== capabilityIrreversible)
          blockers.push(`${candidate.planId}: irreversible typed authority矛盾`);
        if (capabilityIrreversible || forcedIrreversible)
          blockers.push(`${candidate.planId}: human approval必須`);
        const planCommitMs = Date.parse(
          execFileSync("git", ["log", "-1", "--format=%cI", "--", authority.source_path], {
            cwd: repoRoot,
            encoding: "utf8",
          }).trim(),
        );
        blockers.push(
          ...validateCanonicalRuns({
            repoRoot,
            planId: candidate.planId,
            head,
            authority: plan,
            planCommitMs: Math.max(planCommitMs, headCommitMs),
            nowMs,
            seenRunIds,
          }).map((error) => `${candidate.planId}: ${error}`),
        );
      } catch (error) {
        blockers.push(
          `${candidate.planId}: PLAN authority schema不正: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }
  }
  let authorityDigest = sha256(JSON.stringify(manifest));
  try {
    authorityDigest = canonicalClosureAuthorityDigest(repoRoot, manifest);
  } catch {
    blockers.push("canonical authority digestを構築できない");
  }
  const approvalText = [
    "decision_id: closure-review:close_ready",
    "outcome: approve_closure_claim",
    `approval_scope_digest: ${bundle.review_scope.approval_scope_digest}`,
    `authority_digest: ${authorityDigest}`,
  ].join("\n");
  const applyPlan = buildProjectClosureApplyPlan(input.snapshot, {
    approvalRecordText: approvalText,
    approvalRecordPath: ".helix/audit/closure-auto-approval.jsonl",
    limit: input.limit,
    offset: input.offset,
  });
  blockers.push(...applyPlan.blocked_reasons);
  const renderedPatches: ClosureAutoApprovalEvaluation["rendered_patches"] = [];
  for (const patch of applyPlan.patch_candidates) {
    const canonical = canonicalFile(repoRoot, patch.source_path);
    if (canonical.error) {
      blockers.push(`${patch.plan_id}: render path ${canonical.error}`);
      continue;
    }
    try {
      const source = readFileSync(canonical.absolute, "utf8");
      accessSync(canonical.absolute, fsConstants.R_OK | fsConstants.W_OK);
      accessSync(dirname(canonical.absolute), fsConstants.W_OK);
      const rendered = renderAccepted(source);
      renderedPatches.push({
        plan_id: patch.plan_id,
        path: patch.source_path,
        before_digest: sha256(source),
        after_digest: sha256(rendered),
        rendered,
      });
    } catch (error) {
      blockers.push(`${patch.plan_id}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  if (renderedPatches.length !== bundle.candidates.length)
    blockers.push("render cardinality不一致");
  return {
    schema_version: "closure-auto-approval-evaluation.v2",
    allowed: blockers.length === 0,
    authority_digest: authorityDigest,
    repository_head: head,
    target_plan_ids: bundle.review_scope.plan_ids,
    blockers: [...new Set(blockers)],
    apply_plan: applyPlan,
    rendered_patches: renderedPatches,
  };
}

export function applyClosureAutoApprovalAtomic(input: {
  repoRoot: string;
  evaluation: ClosureAutoApprovalEvaluation;
  manifest: ClosureAutoApprovalManifest;
  auditPath?: string;
  failAfterRenameForTest?: number;
  now?: Date;
}): { applied: string[]; transaction_id: string } {
  const auditPath = join(
    input.repoRoot,
    input.auditPath ?? ".helix/audit/closure-auto-approval.jsonl",
  );
  mkdirSync(dirname(auditPath), { recursive: true });
  if (realpathSync(dirname(auditPath)) !== resolve(dirname(auditPath)))
    throw new Error("closure audit parent canonical path不一致");
  if (existsSync(auditPath) && lstatSync(auditPath).isSymbolicLink())
    throw new Error("closure audit symlinkは禁止");
  const journalPath = join(input.repoRoot, ".helix/state/closure-auto-approval-journal.json");
  mkdirSync(dirname(journalPath), { recursive: true });
  if (realpathSync(dirname(journalPath)) !== resolve(dirname(journalPath)))
    throw new Error("closure journal parent canonical path不一致");
  recoverClosureAutoApprovalTransaction(input.repoRoot, journalPath);
  const transactionId = randomUUID();
  const audit = (phase: string, status: string, detail: Record<string, unknown> = {}) =>
    (() => {
      const payload = {
        schema_version: "closure-auto-approval-audit.v1",
        transaction_id: transactionId,
        phase,
        status,
        head: currentRepositoryHead(input.repoRoot),
        authority_digest: input.evaluation.authority_digest,
        target_digest: sha256(JSON.stringify(input.evaluation.target_plan_ids)),
        at: new Date().toISOString(),
        ...detail,
      };
      const prior = existsSync(auditPath)
        ? readFileSync(auditPath, "utf8").trim().split("\n").at(-1)
        : undefined;
      const previousDigest = prior
        ? ((JSON.parse(prior).event_digest as string | undefined) ?? null)
        : null;
      const chained = { ...payload, previous_digest: previousDigest };
      const fd = openSync(auditPath, "a", 0o600);
      try {
        appendFileSync(
          fd,
          `${JSON.stringify({ ...chained, event_digest: sha256(JSON.stringify(chained)) })}\n`,
        );
        fsyncSync(fd);
      } finally {
        closeSync(fd);
      }
    })();
  audit("before", "started", { targets: input.evaluation.target_plan_ids });
  const backups = new Map<string, string>();
  const temps: string[] = [];
  try {
    if (!input.evaluation.allowed) throw new Error(input.evaluation.blockers.join("; "));
    if (currentRepositoryHead(input.repoRoot) !== input.manifest.repository_head)
      throw new Error("write直前HEAD CAS不一致");
    if (
      canonicalClosureAuthorityDigest(input.repoRoot, input.manifest) !==
      input.evaluation.authority_digest
    )
      throw new Error("write直前manifest CAS不一致");
    if ((input.now ?? new Date()).getTime() > Date.parse(input.manifest.expires_at))
      throw new Error("write直前manifest期限切れ");
    for (const authority of input.manifest.candidates) {
      const source = canonicalFile(input.repoRoot, authority.source_path);
      if (source.error || sha256(readFileSync(source.absolute)) !== authority.source_digest)
        throw new Error(`${authority.plan_id}: write直前PLAN bytes CAS不一致`);
    }
    for (const patch of input.evaluation.rendered_patches) {
      const absolute = join(input.repoRoot, patch.path);
      const before = readFileSync(absolute, "utf8");
      if (sha256(before) !== patch.before_digest)
        throw new Error(`${patch.plan_id}: write直前bytes CAS不一致`);
      const temp = `${absolute}.helix-auto-${transactionId}`;
      writeFileSync(temp, patch.rendered, { encoding: "utf8", flag: "wx" });
      if (sha256(readFileSync(temp)) !== patch.after_digest)
        throw new Error(`${patch.plan_id}: temp検証失敗`);
      backups.set(absolute, before);
      temps.push(temp);
    }
    const journal = {
      schema_version: "closure-auto-approval-journal.v1",
      transaction_id: transactionId,
      status: "prepared",
      entries: [...backups].map(([path, content]) => ({
        path: relative(input.repoRoot, path),
        before_content: content,
        before_digest: sha256(content),
      })),
    };
    const journalFd = openSync(journalPath, "w", 0o600);
    try {
      writeFileSync(journalFd, `${JSON.stringify(journal)}\n`);
      fsyncSync(journalFd);
    } finally {
      closeSync(journalFd);
    }
    let renamed = 0;
    for (let index = 0; index < input.evaluation.rendered_patches.length; index += 1) {
      const patch = input.evaluation.rendered_patches[index];
      if (!patch) continue;
      renameSync(temps[index] as string, join(input.repoRoot, patch.path));
      renamed += 1;
      if (input.failAfterRenameForTest === renamed) throw new Error("injected partial failure");
    }
    audit("after", "committed", { targets: input.evaluation.target_plan_ids });
    rmSync(journalPath);
    return { applied: [...input.evaluation.target_plan_ids], transaction_id: transactionId };
  } catch (error) {
    const rollbackErrors: string[] = [];
    for (const [path, content] of backups) {
      try {
        writeFileSync(path, content, "utf8");
      } catch (rollbackError) {
        rollbackErrors.push(
          rollbackError instanceof Error ? rollbackError.message : String(rollbackError),
        );
      }
    }
    for (const temp of temps) if (existsSync(temp)) rmSync(temp);
    audit("after", "rolled_back", {
      error: error instanceof Error ? error.message : String(error),
      rollback_errors: rollbackErrors,
    });
    if (existsSync(journalPath) && rollbackErrors.length === 0) rmSync(journalPath);
    throw error;
  }
}

export function recoverClosureAutoApprovalTransaction(
  repoRoot: string,
  journalPath = join(repoRoot, ".helix/state/closure-auto-approval-journal.json"),
): string[] {
  if (!existsSync(journalPath)) return [];
  if (lstatSync(journalPath).isSymbolicLink()) throw new Error("closure journal symlinkは禁止");
  const journal = z
    .object({
      schema_version: z.literal("closure-auto-approval-journal.v1"),
      transaction_id: z.string().uuid(),
      status: z.literal("prepared"),
      entries: z.array(
        z
          .object({ path: z.string(), before_content: z.string(), before_digest: digestSchema })
          .strict(),
      ),
    })
    .strict()
    .parse(JSON.parse(readFileSync(journalPath, "utf8")));
  const restored: string[] = [];
  const errors: string[] = [];
  for (const entry of journal.entries) {
    try {
      if (sha256(entry.before_content) !== entry.before_digest)
        throw new Error("journal digest不一致");
      const absolute = resolve(repoRoot, entry.path);
      if (relative(repoRoot, absolute).startsWith(".."))
        throw new Error("journal path repository外");
      writeFileSync(absolute, entry.before_content, "utf8");
      restored.push(entry.path);
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
    }
  }
  if (errors.length > 0) throw new Error(`closure journal recovery失敗: ${errors.join("; ")}`);
  rmSync(journalPath);
  return restored;
}

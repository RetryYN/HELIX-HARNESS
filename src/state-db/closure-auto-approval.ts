import { execFileSync } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
import {
  accessSync,
  appendFileSync,
  existsSync,
  constants as fsConstants,
  lstatSync,
  mkdirSync,
  readFileSync,
  realpathSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";
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

export interface ClosureRunAuthority {
  run_id: string;
  command: string;
  exit_code: 0;
  output_digest: `sha256:${string}`;
  completed_at: string;
}

export interface ClosureEvidenceAuthority {
  evidence_id: string;
  path: string;
  content_digest: `sha256:${string}`;
  run: ClosureRunAuthority;
}

export interface ClosureCandidateAuthority {
  plan_id: string;
  source_path: string;
  source_digest: `sha256:${string}`;
  irreversible_impact: boolean;
  capabilities: ClosureCapability[];
  expected_tests: ClosureEvidenceAuthority[];
  expected_gates: ClosureEvidenceAuthority[];
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

function validateEvidence(
  repoRoot: string,
  evidence: ClosureEvidenceAuthority,
  kind: "test" | "gate",
  nowMs: number,
  generatedMs: number,
): string[] {
  const errors: string[] = [];
  if (!evidence.evidence_id.startsWith(`${kind}:`)) errors.push(`${kind} evidence_id型不一致`);
  if (!HEX_DIGEST.test(evidence.content_digest)) errors.push(`${kind} content_digest不正`);
  if (!SAFE_RUN_ID.test(evidence.run.run_id)) errors.push(`${kind} run_id不正`);
  if (!HEX_DIGEST.test(evidence.run.output_digest)) errors.push(`${kind} output_digest不正`);
  if (evidence.run.exit_code !== 0) errors.push(`${kind} exit_code非green`);
  if (evidence.run.command.trim().length === 0) errors.push(`${kind} command欠落`);
  const completedMs = Date.parse(evidence.run.completed_at);
  if (
    !Number.isFinite(completedMs) ||
    completedMs > generatedMs ||
    nowMs - completedMs > 86_400_000
  )
    errors.push(`${kind} run freshness不正`);
  const canonical = canonicalFile(repoRoot, evidence.path);
  if (canonical.error) errors.push(`${kind} ${evidence.path}: ${canonical.error}`);
  else if (sha256(readFileSync(canonical.absolute)) !== evidence.content_digest)
    errors.push(`${kind} ${evidence.path}: content digest drift`);
  return errors;
}

export function currentRepositoryHead(repoRoot: string): string {
  return execFileSync("git", ["rev-parse", "HEAD"], { cwd: repoRoot, encoding: "utf8" }).trim();
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
    else if (sha256(readFileSync(source.absolute)) !== authority.source_digest)
      blockers.push(`${candidate.planId}: PLAN bytes drift`);
    const typedIrreversible = authority.capabilities.some((value) => IRREVERSIBLE.has(value));
    if (authority.irreversible_impact !== typedIrreversible)
      blockers.push(`${candidate.planId}: irreversible typed authority矛盾`);
    if (authority.irreversible_impact) blockers.push(`${candidate.planId}: human approval必須`);
    if (authority.expected_tests.length === 0)
      blockers.push(`${candidate.planId}: expected tests空`);
    if (authority.expected_gates.length === 0)
      blockers.push(`${candidate.planId}: expected gates空`);
    for (const evidence of authority.expected_tests)
      blockers.push(
        ...validateEvidence(repoRoot, evidence, "test", nowMs, generatedMs).map(
          (error) => `${candidate.planId}: ${error}`,
        ),
      );
    for (const evidence of authority.expected_gates)
      blockers.push(
        ...validateEvidence(repoRoot, evidence, "gate", nowMs, generatedMs).map(
          (error) => `${candidate.planId}: ${error}`,
        ),
      );
  }
  const authorityDigest = sha256(JSON.stringify(manifest));
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
      appendFileSync(
        auditPath,
        `${JSON.stringify({ ...payload, event_digest: sha256(JSON.stringify(payload)) })}\n`,
        "utf8",
      );
    })();
  audit("before", "started", { targets: input.evaluation.target_plan_ids });
  const backups = new Map<string, string>();
  const temps: string[] = [];
  try {
    if (!input.evaluation.allowed) throw new Error(input.evaluation.blockers.join("; "));
    if (currentRepositoryHead(input.repoRoot) !== input.manifest.repository_head)
      throw new Error("write直前HEAD CAS不一致");
    if (sha256(JSON.stringify(input.manifest)) !== input.evaluation.authority_digest)
      throw new Error("write直前manifest CAS不一致");
    if ((input.now ?? new Date()).getTime() > Date.parse(input.manifest.expires_at))
      throw new Error("write直前manifest期限切れ");
    for (const authority of input.manifest.candidates) {
      const source = canonicalFile(input.repoRoot, authority.source_path);
      if (source.error || sha256(readFileSync(source.absolute)) !== authority.source_digest)
        throw new Error(`${authority.plan_id}: write直前PLAN bytes CAS不一致`);
      for (const evidence of [...authority.expected_tests, ...authority.expected_gates]) {
        const file = canonicalFile(input.repoRoot, evidence.path);
        if (file.error || sha256(readFileSync(file.absolute)) !== evidence.content_digest)
          throw new Error(`${authority.plan_id}: write直前evidence bytes CAS不一致`);
      }
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
    let renamed = 0;
    for (let index = 0; index < input.evaluation.rendered_patches.length; index += 1) {
      const patch = input.evaluation.rendered_patches[index];
      if (!patch) continue;
      renameSync(temps[index] as string, join(input.repoRoot, patch.path));
      renamed += 1;
      if (input.failAfterRenameForTest === renamed) throw new Error("injected partial failure");
    }
    audit("after", "committed", { targets: input.evaluation.target_plan_ids });
    return { applied: [...input.evaluation.target_plan_ids], transaction_id: transactionId };
  } catch (error) {
    for (const [path, content] of backups) writeFileSync(path, content, "utf8");
    for (const temp of temps) if (existsSync(temp)) rmSync(temp);
    audit("after", "rolled_back", {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

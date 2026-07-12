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
import type { ClosureAuthorityRegistry } from "../policy/closure-authority-registry";
import {
  buildProjectClosureApplyPlan,
  buildProjectClosureReviewBundle,
  type ProjectClosureApplyPlan,
  type ProjectCurrentLocationSnapshot,
} from "./current-location";
import type { HarnessDb } from "./index";

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

export interface GithubRequiredCheckReceipt {
  schema_version: "github-required-check-receipt.v1";
  repository: string;
  check_run_id: number;
  head_sha: string;
  check_name: "harness-check";
  status: "completed";
  conclusion: "success";
  completed_at: string;
  app: { id: number; slug: string; owner: string };
  run_id: number;
  details_url: string;
  run_url: string;
  required: true;
  observed_at: string;
}
const githubReceiptSchema = z
  .object({
    schema_version: z.literal("github-required-check-receipt.v1"),
    repository: z.string().regex(/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/),
    check_run_id: z.number().int().positive(),
    head_sha: z.string().regex(/^[0-9a-f]{40}$/),
    check_name: z.literal("harness-check"),
    status: z.literal("completed"),
    conclusion: z.literal("success"),
    completed_at: z.string().datetime(),
    app: z
      .object({
        id: z.number().int().positive(),
        slug: z.string().min(1),
        owner: z.string().min(1),
      })
      .strict(),
    run_id: z.number().int().positive(),
    details_url: z.string().url(),
    run_url: z.string().url(),
    required: z.literal(true),
    observed_at: z.string().datetime(),
  })
  .strict();

const sha256 = (value: string | Buffer): `sha256:${string}` =>
  `sha256:${createHash("sha256").update(value).digest("hex")}`;
function fsyncPath(path: string): void {
  const fd = openSync(path, "r");
  try {
    fsyncSync(fd);
  } finally {
    closeSync(fd);
  }
}
function patchSetDigest(
  patches: Array<{ path: string; before_digest: string; after_digest: string }>,
): `sha256:${string}` {
  return sha256(
    JSON.stringify(
      [...patches]
        .map(({ path, before_digest, after_digest }) => ({ path, before_digest, after_digest }))
        .sort((left, right) => left.path.localeCompare(right.path)),
    ),
  );
}
const HEX_DIGEST = /^sha256:[0-9a-f]{64}$/;
const SAFE_RUN_ID = /^[A-Za-z0-9][A-Za-z0-9._:-]{7,127}$/;
const IRREVERSIBLE = new Set<ClosureCapability>([
  "version_activation",
  "state_cutover",
  "external_publish",
  "charter_p8",
]);
const FORCED_IRREVERSIBLE_PLAN_IDS = [
  "PLAN-L7-146-serverless-readonly-share",
  "PLAN-M-02-helix-identifier-rename",
] as const;

export function isForcedIrreversiblePlanId(planId: string): boolean {
  return FORCED_IRREVERSIBLE_PLAN_IDS.some(
    (canonical) => planId === canonical || planId.startsWith(`${canonical}-`),
  );
}
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
  .strict()
  .superRefine((value, context) => {
    const ids = new Set<string>();
    for (const candidate of value.candidates) {
      if (ids.has(candidate.plan_id))
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: `duplicate candidate ${candidate.plan_id}`,
        });
      ids.add(candidate.plan_id);
    }
  });

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

function planAuthority(source: string, registry?: ClosureAuthorityRegistry) {
  const match = /^---\n([\s\S]*?)\n---\n/.exec(source);
  if (!match?.[1]) throw new Error("strict frontmatterが無い");
  const schema = z
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
    .passthrough();
  const raw = parseYaml(match[1]);
  const parsed = schema.safeParse(raw);
  if (parsed.success) return parsed.data;
  const base = z
    .object({ plan_id: z.string(), status: z.enum(["completed", "confirmed"]) })
    .passthrough()
    .parse(raw);
  const authority = registry?.authorities.find((row) => row.plan_id === base.plan_id);
  if (
    !authority ||
    authority.source_digest !== sha256(source) ||
    authority.migration_reason !== null
  )
    throw parsed.error;
  return {
    ...base,
    verification_bindings: authority.bindings.map((binding) => ({
      oracle_id: binding.oracle_id,
      test_path: binding.test_path,
    })),
    closure_auto_authority: {
      irreversible_impact: authority.capabilities.some((capability) =>
        IRREVERSIBLE.has(capability),
      ),
      capabilities: authority.capabilities,
      required_gates: authority.gates.map((gate) => ({
        gate_id: gate.gate_id,
        command: gate.command,
      })),
    },
  };
}

function validateCanonicalRuns(input: {
  repoRoot: string;
  db: HarnessDb;
  planId: string;
  head: string;
  authority: ReturnType<typeof planAuthority>;
  planCommitMs: number;
  nowMs: number;
  seenRunIds: Set<string>;
}): string[] {
  const errors: string[] = [];
  ensureRunnerAttestationSchema(input.db);
  try {
    verifyRunnerAttestationChain(input.repoRoot, input.db);
  } catch (error) {
    errors.push(error instanceof Error ? error.message : String(error));
  }
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
    const dbRow =
      run.kind === "test"
        ? input.db
            .prepare(
              `SELECT tr.test_run_id AS run_id, tr.session_id, tr.command, tr.exit_code,
                      tr.evidence_path, tr.output_digest, tr.completed_at, tc.oracle_id
               FROM test_runs tr JOIN test_cases tc ON tc.test_run_id = tr.test_run_id
               WHERE tr.test_run_id = ? AND tr.plan_id = ? AND tc.oracle_id = ?`,
            )
            .get(run.run_id, input.planId, run.oracle_id)
        : input.db
            .prepare(
              `SELECT gate_run_id AS run_id, gate_id AS oracle_id, session_id, command,
                      exit_code, status, evidence_path, output_digest, checked_at AS completed_at
               FROM gate_runs WHERE gate_run_id = ? AND plan_id = ? AND gate_id = ?`,
            )
            .get(run.run_id, input.planId, run.oracle_id);
    if (!dbRow) errors.push(`${run.run_id}: canonical DB runner receipt欠落`);
    else if (run.kind === "test") {
      const selectedCaseCount = Number(
        input.db
          .prepare(
            "SELECT COUNT(*) AS count FROM test_cases WHERE test_run_id = ? AND oracle_id = ?",
          )
          .get(run.run_id, run.oracle_id)?.count ?? 0,
      );
      if (selectedCaseCount !== 1) errors.push(`${run.run_id}: selected test_case exactly-one違反`);
      if (String(dbRow.session_id ?? "").length < 8)
        errors.push(`${run.run_id}: DB receipt identity不正`);
      if (
        String(dbRow.command ?? "")
          .trim()
          .replace(/\s+/g, " ") !== run.command.trim().replace(/\s+/g, " ")
      )
        errors.push(`${run.run_id}: DB command不一致`);
      if (
        Number(dbRow.exit_code) !== 0 ||
        String(dbRow.output_digest ?? "") !== run.output_digest ||
        String(dbRow.evidence_path ?? "") !== run.output_path ||
        String(dbRow.completed_at ?? "") !== run.completed_at
      )
        errors.push(`${run.run_id}: DB green/output digest不一致`);
    } else {
      if (
        String(dbRow.session_id ?? "").length < 8 ||
        String(dbRow.command ?? "") !== run.command ||
        Number(dbRow.exit_code) !== 0 ||
        String(dbRow.status ?? "") !== "passed" ||
        String(dbRow.evidence_path ?? "") !== run.output_path ||
        String(dbRow.output_digest ?? "") !== run.output_digest ||
        String(dbRow.completed_at ?? "") !== run.completed_at
      )
        errors.push(`${run.run_id}: DB gate receipt field不一致`);
    }
    const attestation = input.db
      .prepare("SELECT * FROM runner_attestations WHERE run_id = ?")
      .get(run.run_id);
    if (!attestation) errors.push(`${run.run_id}: runner attestation欠落`);
    else {
      const latest = input.db
        .prepare(
          `SELECT run_id FROM runner_attestations
           WHERE plan_id = ? AND kind = ? AND oracle_id = ?
           ORDER BY completed_at DESC, event_digest DESC LIMIT 1`,
        )
        .get(input.planId, run.kind, run.oracle_id);
      if (String(latest?.run_id ?? "") !== run.run_id)
        errors.push(`${run.run_id}: latest authoritative receiptではない`);
      const exact =
        String(attestation.session_id ?? "") === String(dbRow?.session_id ?? run.run_id) &&
        String(attestation.plan_id ?? "") === input.planId &&
        String(attestation.kind ?? "") === run.kind &&
        String(attestation.oracle_id ?? "") === run.oracle_id &&
        String(attestation.repository_head ?? "") === input.head &&
        String(attestation.command ?? "")
          .trim()
          .replace(/\s+/g, " ") === run.command.trim().replace(/\s+/g, " ") &&
        Number(attestation.exit_code) === run.exit_code &&
        String(attestation.status ?? "") === (run.kind === "test" ? "passed" : "passed") &&
        String(attestation.evidence_path ?? "") === run.output_path &&
        String(attestation.output_digest ?? "") === run.output_digest &&
        String(attestation.completed_at ?? "") === run.completed_at &&
        String(attestation.signature ?? "") === String(attestation.event_digest ?? "");
      if (!exact) errors.push(`${run.run_id}: runner attestation exact join不一致`);
    }
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
      const command = run.command.trim().replace(/\s+/g, " ");
      const expectedArgv = `bunx vitest run ${expectedCommand}`;
      const expectedJsonArgv = `${expectedArgv} --reporter=json`;
      if (
        !/^bunx vitest run tests\/[A-Za-z0-9_./-]+\.test\.(?:ts|tsx)(?: --reporter=json)?$/.test(
          command,
        ) ||
        (command !== expectedArgv && command !== expectedJsonArgv)
      )
        errors.push(`${run.run_id}: test command exact argv不一致`);
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

export function isHarnessCheckRequired(
  policy: { contexts?: string[]; checks?: Array<{ context?: string; app_id?: number }> },
  appId: number,
): boolean {
  if (Array.isArray(policy.checks) && policy.checks.length > 0)
    return policy.checks.some(
      (row) => row.context === "harness-check" && Number(row.app_id) === appId,
    );
  return policy.contexts?.includes("harness-check") === true;
}

export function loadGithubRequiredCheckReceipt(repoRoot: string): GithubRequiredCheckReceipt {
  const head = currentRepositoryHead(repoRoot);
  const remote = execFileSync("git", ["remote", "get-url", "origin"], {
    cwd: repoRoot,
    encoding: "utf8",
  }).trim();
  const match = /github\.com[/:]([^/]+)\/([^/.]+)(?:\.git)?$/.exec(remote);
  if (!match?.[1] || !match[2]) throw new Error("GitHub originを解決できないためdry-run only");
  const repository = `${match[1]}/${match[2]}`;
  const response = JSON.parse(
    execFileSync("gh", ["api", `repos/${repository}/commits/${head}/check-runs`], {
      cwd: repoRoot,
      encoding: "utf8",
    }),
  ) as { check_runs?: Array<Record<string, unknown>> };
  const check = response.check_runs?.find(
    (row) =>
      row.name === "harness-check" && row.status === "completed" && row.conclusion === "success",
  );
  if (!check) throw new Error("current HEADのharness-check green receiptが無いためdry-run only");
  const required = JSON.parse(
    execFileSync(
      "gh",
      ["api", `repos/${repository}/branches/main/protection/required_status_checks`],
      { cwd: repoRoot, encoding: "utf8" },
    ),
  ) as { contexts?: string[]; checks?: Array<{ context?: string; app_id?: number }> };
  const app = check.app as Record<string, unknown> | undefined;
  const owner = app?.owner as Record<string, unknown> | undefined;
  const appId = Number(app?.id);
  if (!isHarnessCheckRequired(required, appId))
    throw new Error("harness-checkがrequired contextではない");
  const runUrl = String(check.html_url ?? "");
  const runId = Number(/\/actions\/runs\/([0-9]+)/.exec(runUrl)?.[1]);
  return {
    schema_version: "github-required-check-receipt.v1",
    repository,
    check_run_id: Number(check.id),
    head_sha: String(check.head_sha ?? ""),
    check_name: "harness-check",
    status: "completed",
    conclusion: "success",
    completed_at: String(check.completed_at ?? ""),
    app: { id: appId, slug: String(app?.slug ?? ""), owner: String(owner?.login ?? "") },
    run_id: runId,
    details_url: String(check.details_url ?? ""),
    run_url: runUrl,
    required: true,
    observed_at: new Date().toISOString(),
  };
}

export function validateGithubRequiredCheckReceipt(input: {
  repoRoot: string;
  receipt: GithubRequiredCheckReceipt | null;
  now?: Date;
}): string[] {
  const receipt = input.receipt;
  if (!receipt) return ["GitHub required-check receipt欠落: dry-run only"];
  const errors: string[] = [];
  if (!githubReceiptSchema.safeParse(receipt).success)
    errors.push("GitHub receipt strict schema不正");
  const remote = execFileSync("git", ["remote", "get-url", "origin"], {
    cwd: input.repoRoot,
    encoding: "utf8",
  }).trim();
  const origin = /github\.com[/:]([^/]+)\/([^/.]+)(?:\.git)?$/.exec(remote);
  if (!origin || receipt.repository !== `${origin[1]}/${origin[2]}`)
    errors.push("GitHub receipt repository不一致");
  if (receipt.head_sha !== currentRepositoryHead(input.repoRoot))
    errors.push("GitHub receipt HEAD不一致");
  if (
    receipt.check_name !== "harness-check" ||
    receipt.status !== "completed" ||
    receipt.conclusion !== "success" ||
    receipt.required !== true
  )
    errors.push("GitHub harness-check非green");
  if (!Number.isSafeInteger(receipt.check_run_id) || receipt.check_run_id <= 0)
    errors.push("GitHub check_run_id不正");
  if (!receipt.app.slug || !receipt.app.owner) errors.push("GitHub app identity不正");
  const urlPrefix = `https://github.com/${receipt.repository}/actions/runs/${receipt.run_id}`;
  if (
    receipt.run_url !== urlPrefix &&
    !receipt.run_url.startsWith(`${urlPrefix}/`) &&
    !receipt.run_url.startsWith(`${urlPrefix}?`)
  )
    errors.push("GitHub run URL不正");
  if (!receipt.details_url.startsWith(urlPrefix)) errors.push("GitHub details URL不正");
  const observed = Date.parse(receipt.observed_at);
  const completed = Date.parse(receipt.completed_at);
  if (
    !Number.isFinite(observed) ||
    Math.abs((input.now ?? new Date()).getTime() - observed) > 900_000
  )
    errors.push("GitHub receipt freshness不正");
  if (!Number.isFinite(completed) || completed > observed || observed - completed > 86_400_000)
    errors.push("GitHub check completion freshness不正");
  return errors;
}

export function githubReceiptImmutableDigest(
  receipt: GithubRequiredCheckReceipt,
): `sha256:${string}` {
  const { observed_at: _observedAt, ...immutable } = receipt;
  return sha256(JSON.stringify(immutable));
}

export function refetchGithubRequiredCheckReceipt(
  repoRoot: string,
  initial: GithubRequiredCheckReceipt,
  deps: {
    exec?: typeof execFileSync;
  } = {},
): GithubRequiredCheckReceipt {
  const exec = deps.exec ?? execFileSync;
  const check = JSON.parse(
    exec("gh", ["api", `repos/${initial.repository}/check-runs/${initial.check_run_id}`], {
      cwd: repoRoot,
      encoding: "utf8",
    }),
  ) as Record<string, unknown>;
  const app = check.app as Record<string, unknown> | undefined;
  const owner = app?.owner as Record<string, unknown> | undefined;
  const required = JSON.parse(
    exec(
      "gh",
      ["api", `repos/${initial.repository}/branches/main/protection/required_status_checks`],
      { cwd: repoRoot, encoding: "utf8" },
    ),
  ) as { contexts?: string[]; checks?: Array<{ context?: string; app_id?: number }> };
  const appId = Number(app?.id);
  const isRequired = isHarnessCheckRequired(required, appId);
  const runUrl = String(check.html_url ?? "");
  return {
    schema_version: "github-required-check-receipt.v1",
    repository: initial.repository,
    check_run_id: Number(check.id),
    head_sha: String(check.head_sha ?? ""),
    check_name: "harness-check",
    status: String(check.status) as "completed",
    conclusion: String(check.conclusion) as "success",
    completed_at: String(check.completed_at ?? ""),
    app: { id: appId, slug: String(app?.slug ?? ""), owner: String(owner?.login ?? "") },
    run_id: Number(/\/actions\/runs\/([0-9]+)/.exec(runUrl)?.[1]),
    details_url: String(check.details_url ?? ""),
    run_url: runUrl,
    required: isRequired as true,
    observed_at: new Date().toISOString(),
  };
}

function ensureRunnerAttestationSchema(db: HarnessDb): void {
  db.exec(`CREATE TABLE IF NOT EXISTS runner_attestations (
    event_digest TEXT PRIMARY KEY, previous_digest TEXT, run_id TEXT UNIQUE,
    session_id TEXT, plan_id TEXT, kind TEXT, oracle_id TEXT, repository_head TEXT,
    command TEXT, exit_code INTEGER, status TEXT, evidence_path TEXT,
    output_digest TEXT, completed_at TEXT, signature TEXT
  )`);
  db.exec(`CREATE TRIGGER IF NOT EXISTS runner_attestations_no_update
    BEFORE UPDATE ON runner_attestations BEGIN SELECT RAISE(ABORT, 'runner attestation immutable'); END`);
  db.exec(`CREATE TRIGGER IF NOT EXISTS runner_attestations_no_delete
    BEFORE DELETE ON runner_attestations BEGIN SELECT RAISE(ABORT, 'runner attestation immutable'); END`);
}

export function verifyRunnerAttestationChain(repoRoot: string, db: HarnessDb): string | null {
  ensureRunnerAttestationSchema(db);
  const path = join(repoRoot, ".helix/evidence/runner-attestations.jsonl");
  if (!existsSync(path)) return null;
  if (lstatSync(path).isSymbolicLink()) throw new Error("runner attestation symlinkは禁止");
  let previous: string | null = null;
  const fileDigests = new Set<string>();
  for (const line of readFileSync(path, "utf8").trim().split("\n").filter(Boolean)) {
    const event = JSON.parse(line) as Record<string, unknown>;
    const digest = String(event.event_digest ?? "");
    fileDigests.add(digest);
    const signature = String(event.signature ?? "");
    const payload = { ...event };
    delete payload.event_digest;
    delete payload.signature;
    if (
      event.previous_digest !== previous ||
      sha256(JSON.stringify(payload)) !== digest ||
      signature !== digest
    )
      throw new Error("runner attestation chain不正");
    const row = db.prepare("SELECT * FROM runner_attestations WHERE event_digest = ?").get(digest);
    const exactFields = [
      "event_digest",
      "previous_digest",
      "run_id",
      "session_id",
      "plan_id",
      "kind",
      "oracle_id",
      "repository_head",
      "command",
      "exit_code",
      "status",
      "evidence_path",
      "output_digest",
      "completed_at",
      "signature",
    ];
    if (
      !row ||
      exactFields.some((field) => String(row[field] ?? "") !== String(event[field] ?? ""))
    )
      throw new Error("runner attestation DB equality不正");
    previous = digest;
  }
  const dbDigests = new Set(
    db
      .prepare("SELECT event_digest FROM runner_attestations")
      .all()
      .map((row) => String(row.event_digest ?? "")),
  );
  if (
    fileDigests.size !== dbDigests.size ||
    [...fileDigests].some((digest) => !dbDigests.has(digest))
  )
    throw new Error("runner attestation JSONL/DB set不一致");
  return previous;
}

export interface RunnerAttestationInput {
  run_id: string;
  session_id: string;
  plan_id: string;
  kind: "test" | "gate";
  oracle_id: string;
  command: string;
  exit_code: number;
  status: string;
  evidence_path: string;
  completed_at: string;
}

export function appendRunnerAttestation(input: {
  repoRoot: string;
  db: HarnessDb;
  receipt: RunnerAttestationInput;
}): string {
  ensureRunnerAttestationSchema(input.db);
  const path = join(input.repoRoot, ".helix/evidence/runner-attestations.jsonl");
  mkdirSync(dirname(path), { recursive: true });
  if (existsSync(path) && lstatSync(path).isSymbolicLink())
    throw new Error("runner attestation symlinkは禁止");
  const previousDigest = existsSync(path)
    ? String(
        JSON.parse(readFileSync(path, "utf8").trim().split("\n").at(-1) ?? "{}").event_digest ?? "",
      ) || null
    : null;
  const evidence = canonicalFile(input.repoRoot, input.receipt.evidence_path);
  if (evidence.error) throw new Error(`runner evidence ${evidence.error}`);
  const payload = {
    schema_version: "runner-attestation.v1",
    previous_digest: previousDigest,
    ...input.receipt,
    repository_head: currentRepositoryHead(input.repoRoot),
    output_digest: sha256(readFileSync(evidence.absolute)),
  };
  const eventDigest = sha256(JSON.stringify(payload));
  const event = { ...payload, event_digest: eventDigest, signature: eventDigest };
  const fd = openSync(path, "a", 0o600);
  try {
    appendFileSync(fd, `${JSON.stringify(event)}\n`);
    fsyncSync(fd);
  } finally {
    closeSync(fd);
  }
  fsyncPath(dirname(path));
  input.db
    .prepare(
      `INSERT INTO runner_attestations
       (event_digest, previous_digest, run_id, session_id, plan_id, kind, oracle_id,
        repository_head, command, exit_code, status, evidence_path, output_digest,
        completed_at, signature) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      eventDigest,
      previousDigest,
      input.receipt.run_id,
      input.receipt.session_id,
      input.receipt.plan_id,
      input.receipt.kind,
      input.receipt.oracle_id,
      event.repository_head,
      input.receipt.command,
      input.receipt.exit_code,
      input.receipt.status,
      input.receipt.evidence_path,
      event.output_digest,
      input.receipt.completed_at,
      eventDigest,
    );
  return eventDigest;
}

export function canonicalClosureAuthorityDigest(
  repoRoot: string,
  manifest: ClosureAutoApprovalManifest,
  db: HarnessDb,
): `sha256:${string}` {
  ensureRunnerAttestationSchema(db);
  const materials = manifest.candidates.map((candidate) => {
    const testRows = db
      .prepare(
        `SELECT tr.*, tc.oracle_id FROM test_runs tr
         JOIN test_cases tc ON tc.test_run_id = tr.test_run_id
         WHERE tr.plan_id = ? ORDER BY tr.test_run_id, tc.oracle_id`,
      )
      .all(candidate.plan_id);
    const gateRows = db
      .prepare("SELECT * FROM gate_runs WHERE plan_id = ? ORDER BY gate_run_id")
      .all(candidate.plan_id);
    const attestationRows = db
      .prepare("SELECT * FROM runner_attestations WHERE plan_id = ? ORDER BY event_digest")
      .all(candidate.plan_id);
    return {
      plan_id: candidate.plan_id,
      plan_digest: sha256(readFileSync(join(repoRoot, candidate.source_path))),
      db_receipt_digest: sha256(JSON.stringify({ testRows, gateRows, attestationRows })),
      output_digests: [...testRows, ...gateRows].map((row) => ({
        run_id: String(row.test_run_id ?? row.gate_run_id ?? ""),
        digest: sha256(readFileSync(join(repoRoot, String(row.evidence_path ?? "")))),
      })),
    };
  });
  return sha256(JSON.stringify({ manifest, materials }));
}

export function evaluateClosureAutoApproval(input: {
  repoRoot: string;
  db: HarnessDb;
  snapshot: ProjectCurrentLocationSnapshot;
  manifest: ClosureAutoApprovalManifest;
  limit: number;
  offset: number;
  now?: Date;
  authorityRegistry?: ClosureAuthorityRegistry;
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
        const plan = planAuthority(sourceText, input.authorityRegistry);
        if (plan.plan_id !== candidate.planId) blockers.push(`${candidate.planId}: plan_id不一致`);
        const capabilityIrreversible = plan.closure_auto_authority.capabilities.some((value) =>
          IRREVERSIBLE.has(value),
        );
        const forcedIrreversible = isForcedIrreversiblePlanId(candidate.planId);
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
            db: input.db,
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
    authorityDigest = canonicalClosureAuthorityDigest(repoRoot, manifest, input.db);
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

export function verifyClosureAuditChain(auditPath: string): string | null {
  if (!existsSync(auditPath)) return null;
  if (lstatSync(auditPath).isSymbolicLink()) throw new Error("closure audit symlinkは禁止");
  let previous: string | null = null;
  for (const line of readFileSync(auditPath, "utf8").trim().split("\n").filter(Boolean)) {
    const event = JSON.parse(line) as Record<string, unknown>;
    const digest = String(event.event_digest ?? "");
    const payload = { ...event };
    delete payload.event_digest;
    if (event.previous_digest !== previous || sha256(JSON.stringify(payload)) !== digest)
      throw new Error("closure audit hash-chain不正");
    previous = digest;
  }
  return previous;
}

export function applyClosureAutoApprovalAtomic(input: {
  repoRoot: string;
  evaluation: ClosureAutoApprovalEvaluation;
  manifest: ClosureAutoApprovalManifest;
  db: HarnessDb;
  githubReceipt: GithubRequiredCheckReceipt | null;
  githubReceiptRefetch?: () => GithubRequiredCheckReceipt;
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
        target_digest: sha256(JSON.stringify([...input.evaluation.target_plan_ids].sort())),
        at: new Date().toISOString(),
        ...detail,
      };
      const previousDigest = verifyClosureAuditChain(auditPath);
      const chained = { ...payload, previous_digest: previousDigest };
      const eventDigest = sha256(JSON.stringify(chained));
      const fd = openSync(auditPath, "a", 0o600);
      try {
        appendFileSync(fd, `${JSON.stringify({ ...chained, event_digest: eventDigest })}\n`);
        fsyncSync(fd);
      } finally {
        closeSync(fd);
      }
      return eventDigest;
    })();
  const startedAuditDigest = audit("before", "started", {
    targets: input.evaluation.target_plan_ids,
    patch_set_digest: patchSetDigest(input.evaluation.rendered_patches),
  });
  const backups = new Map<string, string>();
  const temps: string[] = [];
  try {
    if (!input.evaluation.allowed) throw new Error(input.evaluation.blockers.join("; "));
    const githubErrors = validateGithubRequiredCheckReceipt({
      repoRoot: input.repoRoot,
      receipt: input.githubReceipt,
      now: input.now,
    });
    if (githubErrors.length > 0) throw new Error(githubErrors.join("; "));
    const initialReceipt = input.githubReceipt;
    if (!initialReceipt) throw new Error("GitHub required-check receipt欠落: dry-run only");
    const refetchedReceipt = input.githubReceiptRefetch?.() ?? initialReceipt;
    if (
      !refetchedReceipt ||
      githubReceiptImmutableDigest(refetchedReceipt) !==
        githubReceiptImmutableDigest(initialReceipt)
    )
      throw new Error("GitHub check-run write直前CAS不一致");
    const refetchErrors = validateGithubRequiredCheckReceipt({
      repoRoot: input.repoRoot,
      receipt: refetchedReceipt,
      now: input.now,
    });
    if (refetchErrors.length > 0) throw new Error(refetchErrors.join("; "));
    if (currentRepositoryHead(input.repoRoot) !== input.manifest.repository_head)
      throw new Error("write直前HEAD CAS不一致");
    if (
      canonicalClosureAuthorityDigest(input.repoRoot, input.manifest, input.db) !==
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
      fsyncPath(temp);
      if (sha256(readFileSync(temp)) !== patch.after_digest)
        throw new Error(`${patch.plan_id}: temp検証失敗`);
      backups.set(absolute, before);
      temps.push(temp);
    }
    const journal = {
      schema_version: "closure-auto-approval-journal.v1",
      transaction_id: transactionId,
      status: "prepared",
      started_audit_digest: startedAuditDigest,
      authority_digest: input.evaluation.authority_digest,
      target_digest: sha256(JSON.stringify([...input.evaluation.target_plan_ids].sort())),
      patch_set_digest: patchSetDigest(input.evaluation.rendered_patches),
      entries: [...backups].map(([path, content]) => ({
        path: relative(input.repoRoot, path),
        before_content: content,
        before_digest: sha256(content),
        after_digest:
          input.evaluation.rendered_patches.find(
            (patch) => patch.path === relative(input.repoRoot, path),
          )?.after_digest ?? "sha256:missing",
      })),
    };
    const journalFd = openSync(journalPath, "w", 0o600);
    try {
      writeFileSync(journalFd, `${JSON.stringify(journal)}\n`);
      fsyncSync(journalFd);
    } finally {
      closeSync(journalFd);
    }
    fsyncPath(dirname(journalPath));
    let renamed = 0;
    for (let index = 0; index < input.evaluation.rendered_patches.length; index += 1) {
      const patch = input.evaluation.rendered_patches[index];
      if (!patch) continue;
      renameSync(temps[index] as string, join(input.repoRoot, patch.path));
      fsyncPath(dirname(join(input.repoRoot, patch.path)));
      renamed += 1;
      if (input.failAfterRenameForTest === renamed) throw new Error("injected partial failure");
    }
    audit("after", "committed", { targets: input.evaluation.target_plan_ids });
    rmSync(journalPath);
    fsyncPath(dirname(journalPath));
    return { applied: [...input.evaluation.target_plan_ids], transaction_id: transactionId };
  } catch (error) {
    const rollbackErrors: string[] = [];
    for (const [path, content] of backups) {
      try {
        writeFileSync(path, content, "utf8");
        fsyncPath(path);
        fsyncPath(dirname(path));
      } catch (rollbackError) {
        rollbackErrors.push(
          rollbackError instanceof Error ? rollbackError.message : String(rollbackError),
        );
      }
    }
    for (const temp of temps)
      if (existsSync(temp)) {
        rmSync(temp);
        fsyncPath(dirname(temp));
      }
    audit("after", "rolled_back", {
      error: error instanceof Error ? error.message : String(error),
      rollback_errors: rollbackErrors,
    });
    if (existsSync(journalPath) && rollbackErrors.length === 0) {
      rmSync(journalPath);
      fsyncPath(dirname(journalPath));
    }
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
      started_audit_digest: digestSchema,
      authority_digest: digestSchema,
      target_digest: digestSchema,
      patch_set_digest: digestSchema,
      entries: z.array(
        z
          .object({
            path: z.string().regex(/^docs\/plans\/PLAN-[A-Za-z0-9-]+\.md$/),
            before_content: z.string(),
            before_digest: digestSchema,
            after_digest: digestSchema,
          })
          .strict(),
      ),
    })
    .strict()
    .parse(JSON.parse(readFileSync(journalPath, "utf8")));
  const restored: string[] = [];
  const errors: string[] = [];
  const auditPath = join(repoRoot, ".helix/audit/closure-auto-approval.jsonl");
  verifyClosureAuditChain(auditPath);
  const startedEvent = readFileSync(auditPath, "utf8")
    .trim()
    .split("\n")
    .map((line) => JSON.parse(line) as Record<string, unknown>)
    .find((event) => event.event_digest === journal.started_audit_digest);
  if (
    !startedEvent ||
    startedEvent.transaction_id !== journal.transaction_id ||
    startedEvent.phase !== "before" ||
    startedEvent.status !== "started" ||
    startedEvent.authority_digest !== journal.authority_digest ||
    startedEvent.target_digest !== journal.target_digest ||
    startedEvent.patch_set_digest !== journal.patch_set_digest
  )
    throw new Error("closure journal started audit pin欠落");
  const derivedTargets = journal.entries
    .map((entry) => /\/(PLAN-[A-Za-z0-9-]+)\.md$/.exec(entry.path)?.[1] ?? "")
    .sort();
  const derivedPatchSet = journal.entries
    .map(({ path, before_digest, after_digest }) => ({ path, before_digest, after_digest }))
    .sort((left, right) => left.path.localeCompare(right.path));
  if (
    new Set(derivedTargets).size !== journal.entries.length ||
    sha256(JSON.stringify(derivedTargets)) !== journal.target_digest ||
    sha256(JSON.stringify(derivedPatchSet)) !== journal.patch_set_digest
  )
    throw new Error("closure journal entry集合digest不一致");
  const auditRecovery = (status: "recovered" | "recovery_failed", detail: unknown) => {
    const payload = {
      schema_version: "closure-auto-approval-audit.v1",
      transaction_id: journal.transaction_id,
      phase: "recovery",
      status,
      detail,
      at: new Date().toISOString(),
      previous_digest: verifyClosureAuditChain(auditPath),
    };
    const fd = openSync(auditPath, "a", 0o600);
    try {
      appendFileSync(
        fd,
        `${JSON.stringify({ ...payload, event_digest: sha256(JSON.stringify(payload)) })}\n`,
      );
      fsyncSync(fd);
    } finally {
      closeSync(fd);
    }
  };
  for (const entry of journal.entries) {
    try {
      if (sha256(entry.before_content) !== entry.before_digest)
        throw new Error("journal digest不一致");
      const absolute = resolve(repoRoot, entry.path);
      if (relative(repoRoot, absolute).startsWith(".."))
        throw new Error("journal path repository外");
      if (lstatSync(absolute).isSymbolicLink() || !lstatSync(absolute).isFile())
        throw new Error("journal target regular non-symlink違反");
      const currentDigest = sha256(readFileSync(absolute));
      if (currentDigest !== entry.before_digest && currentDigest !== entry.after_digest)
        throw new Error("journal target current digest不一致");
      writeFileSync(absolute, entry.before_content, "utf8");
      fsyncPath(absolute);
      fsyncPath(dirname(absolute));
      restored.push(entry.path);
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
    }
  }
  if (errors.length > 0) {
    auditRecovery("recovery_failed", errors);
    throw new Error(`closure journal recovery失敗: ${errors.join("; ")}`);
  }
  auditRecovery("recovered", restored);
  rmSync(journalPath);
  fsyncPath(dirname(journalPath));
  return restored;
}

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { parse as parseYaml } from "yaml";
import { z } from "zod";
import { parseEligibleOracleTable } from "../lint/plan-specific-vpair-binding";
import type {
  BackfillBinding,
  BackfillL8Row,
  ClosureAuthorityBackfillBundle,
  ClosureAuthorityBackfillCandidate,
  CollectedBackfillTest,
  TypedAuthorityBlock,
} from "../policy/closure-authority-backfill";
import { buildClosureAuthorityBackfill } from "../policy/closure-authority-backfill";
import { parseClosureAuthorityRegistry } from "../policy/closure-authority-registry";
import {
  CLOSURE_GATE_ALLOWLIST_PATH,
  loadRepoOwnedGateAllowlist,
  readVerifiedRepoFile,
} from "./closure-authority-backfill-loader";
import { closureCommandDedupeKey } from "./closure-evidence-runner";
import {
  buildProjectClosureReviewBundle,
  buildProjectCurrentLocationSnapshot,
} from "./current-location";
import type { HarnessDb } from "./index";

type Digest = `sha256:${string}`;
const sha256 = (value: string | Buffer): Digest =>
  `sha256:${createHash("sha256").update(value).digest("hex")}`;
function stable(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  if (value !== null && typeof value === "object")
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, item]) => `${JSON.stringify(key)}:${stable(item)}`)
      .join(",")}}`;
  return JSON.stringify(value);
}
function verifyTrackedHeadFile(input: {
  repoRoot: string;
  head: string;
  path: string;
  digest: Digest;
}): void {
  const { repoRoot, head, path, digest } = input;
  const tracked = execFileSync("git", ["ls-files", "--error-unmatch", "--", path], {
    cwd: repoRoot,
    encoding: "utf8",
  }).trim();
  if (tracked !== path) throw new Error(`repo-owned tracked path mismatch: ${path}`);
  const tree = execFileSync("git", ["ls-tree", head, "--", path], {
    cwd: repoRoot,
    encoding: "utf8",
  }).trim();
  if (!/^100(?:644|755) blob [0-9a-f]{40}\t/.test(tree) || !tree.endsWith(`\t${path}`))
    throw new Error(`tracked regular blob required: ${path}`);
  const bytes = execFileSync("git", ["show", `${head}:${path}`], { cwd: repoRoot });
  if (sha256(bytes) !== digest) throw new Error(`tracked HEAD blob digest mismatch: ${path}`);
}

const intraRuntimeEvidenceSchema = z
  .object({
    schema_version: z.literal("closure-backfill-intra-runtime-review.v1"),
    worker_task_id: z.string().min(1),
    reviewer_task_id: z.string().min(1),
    termination_event_id: z.string().min(1),
    termination_status: z.literal("completed"),
    repository_head: z.string().regex(/^[0-9a-f]{40}$/),
    bundle_digest: z.string().regex(/^sha256:[0-9a-f]{64}$/),
    recompute_evidence_digest: z.string().regex(/^sha256:[0-9a-f]{64}$/),
  })
  .strict()
  .superRefine((value, context) => {
    if (value.worker_task_id === value.reviewer_task_id)
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "worker/reviewer task identity must differ",
      });
  });
export type IntraRuntimeReviewIdentityEvidence = z.infer<typeof intraRuntimeEvidenceSchema>;
export function parseIntraRuntimeReviewIdentityEvidence(
  value: unknown,
): IntraRuntimeReviewIdentityEvidence {
  return intraRuntimeEvidenceSchema.parse(value);
}

function frontmatter(bytes: Buffer): Record<string, unknown> {
  const match = /^---\n([\s\S]*?)\n---(?:\n|$)/.exec(bytes.toString("utf8"));
  if (!match) throw new Error("authority source frontmatter absent");
  const parsed = parseYaml(match[1] ?? "");
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
    throw new Error("authority source frontmatter invalid");
  return parsed as Record<string, unknown>;
}
const planBindingSchema = z
  .object({ oracle_id: z.string(), parent_design: z.string(), test_path: z.string() })
  .strict();
function verifyPlanFrontmatter(input: {
  bytes: Buffer;
  planId: string;
  bindings: readonly { oracle_id: string; parent_design: string; test_path: string }[];
}): void {
  const parsed = z
    .object({ plan_id: z.literal(input.planId), verification_bindings: z.array(planBindingSchema) })
    .passthrough()
    .parse(frontmatter(input.bytes));
  const normalize = (
    rows: readonly { oracle_id: string; parent_design: string; test_path: string }[],
  ) => rows.map((row) => stable(row)).sort((a, b) => a.localeCompare(b));
  if (stable(normalize(parsed.verification_bindings)) !== stable(normalize(input.bindings)))
    throw new Error(`${input.planId}: PLAN verification_bindings mismatch`);
}
function verifyL8ExactRow(input: { bytes: Buffer; oracleId: string; testPath: string }): void {
  const parsed = parseEligibleOracleTable(input.bytes.toString("utf8"));
  if (parsed.schemaErrors.length > 0) throw new Error(`${input.oracleId}: L8 table schema invalid`);
  const matches = parsed.rows.filter(
    (row) => row.oracleId === input.oracleId && row.testPaths.includes(input.testPath),
  );
  if (matches.length !== 1 || matches[0]?.testPaths.length !== 1)
    throw new Error(`${input.oracleId}: L8 exact row cardinality ${matches.length}`);
}

const classifications = new Set([
  "eligible_proposal",
  "needs_design",
  "needs_test_citation",
  "needs_gate_authority",
  "human_only",
  "invalid",
]);
function verifyStrictBundleDecisions(bundle: ClosureAuthorityBackfillBundle): void {
  const ids = bundle.candidate_plan_ids;
  if (new Set(ids).size !== ids.length)
    throw new Error("bundle candidate IDs must be canonical ordered unique");
  if (
    bundle.decisions.length !== ids.length ||
    bundle.decisions.some((decision, index) => decision.plan_id !== ids[index])
  )
    throw new Error("bundle decisions must exactly cover ordered candidates");
  for (const decision of bundle.decisions) {
    if (
      !classifications.has(decision.classification) ||
      !decision.reason.trim() ||
      !decision.required_action.trim() ||
      decision.evidence_digests.length === 0 ||
      decision.evidence_digests.some((digest) => !/^sha256:[0-9a-f]{64}$/.test(digest))
    )
      throw new Error(`${decision.plan_id}: decision schema/evidence invalid`);
    if (decision.classification === "eligible_proposal") {
      if (!decision.proposal || decision.proposal.plan_id !== decision.plan_id)
        throw new Error(`${decision.plan_id}: eligible proposal missing/mismatched`);
    } else if (decision.proposal !== null) {
      throw new Error(`${decision.plan_id}: noneligible proposal must be null`);
    }
  }
}

export function verifyClosureAuthorityBackfillCurrentContext(input: {
  repoRoot: string;
  db: HarnessDb;
  bundle: ClosureAuthorityBackfillBundle;
  expectedRegistryDigest?: Digest;
  allowMutableRegistry?: boolean;
}): ReturnType<typeof buildProjectClosureReviewBundle> {
  const git = (...args: string[]) =>
    execFileSync("git", args, { cwd: input.repoRoot, encoding: "utf8" }).trim();
  const head = git("rev-parse", "HEAD");
  const status = execFileSync("git", ["status", "--porcelain=v1", "--untracked-files=all"], {
    cwd: input.repoRoot,
    encoding: "utf8",
  }).trimEnd();
  const allowedRegistryDrift = " M docs/governance/closure-authority-registry.yaml";
  const statusRows = status === "" ? [] : status.split("\n");
  const originMain = git("rev-parse", "origin/main");
  if (
    head !== originMain ||
    head !== input.bundle.repository_head ||
    statusRows.some((row) => row !== allowedRegistryDrift) ||
    (statusRows.includes(allowedRegistryDrift) && !input.allowMutableRegistry)
  )
    throw new Error(
      `production git context must be clean current origin/main except the sealed registry generation; non-registry drift: head=${head} origin=${originMain} status=${JSON.stringify(statusRows)}`,
    );
  if (statusRows.includes(allowedRegistryDrift)) {
    const registry = readVerifiedRepoFile(
      input.repoRoot,
      "docs/governance/closure-authority-registry.yaml",
    );
    if (registry.digest !== input.expectedRegistryDigest)
      throw new Error("mutable registry drift is not ledger-sealed expected generation");
  }
  const snapshot = buildProjectCurrentLocationSnapshot(input.db);
  const count = snapshot.closure.queue.route_counts.close_ready;
  const review = buildProjectClosureReviewBundle(snapshot, {
    action: "close_ready",
    limit: Math.max(1, count),
    offset: 0,
  });
  if (
    stable(review.review_scope.plan_ids) !== stable(input.bundle.candidate_plan_ids) ||
    review.review_scope.approval_scope_digest !== input.bundle.review_scope_digest
  )
    throw new Error("current close_ready review scope mismatch");
  return review;
}
function authorityAtPointer(source: Record<string, unknown>, block: TypedAuthorityBlock): unknown {
  const parts = block.field_pointer.split("/").slice(1);
  let current: unknown = source;
  for (const part of parts) {
    if (!current || typeof current !== "object" || Array.isArray(current))
      throw new Error("authority field pointer absent");
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}
function normalizedAuthority(value: unknown): { capabilities: string[]; gates: unknown[] } {
  const row = z
    .object({
      capabilities: z.array(z.string()),
      gates: z.array(z.unknown()).optional(),
      required_gates: z.array(z.unknown()).optional(),
    })
    .passthrough()
    .parse(value);
  return {
    capabilities: [...row.capabilities].sort(),
    gates: [...(row.gates ?? row.required_gates ?? [])].sort((a, b) =>
      stable(a).localeCompare(stable(b)),
    ),
  };
}

function verifyPhysicalTestReceipt(input: {
  repoRoot: string;
  db: HarnessDb;
  head: string;
  testPath: string;
  planId: string;
  oracleId: string;
  now: string;
}): CollectedBackfillTest {
  const argv = ["--no-install", "vitest", "run", input.testPath, "--reporter=json"];
  const commandKey = closureCommandDedupeKey(input.head, {
    kind: "test",
    executable: "npx",
    argv,
  });
  const row = input.db
    .prepare(
      `SELECT * FROM closure_process_receipts WHERE repository_head=? AND dedupe_key=? ORDER BY completed_at DESC, process_receipt_key DESC LIMIT 1`,
    )
    .get(input.head, commandKey);
  if (!row) throw new Error(`persistent Vitest receipt absent: ${input.testPath}`);
  const stdoutPath = String(row.stdout_path ?? "");
  const stderrPath = String(row.stderr_path ?? "");
  const stdout = readVerifiedRepoFile(input.repoRoot, stdoutPath);
  const stderr = readVerifiedRepoFile(input.repoRoot, stderrPath);
  const completed = Date.parse(String(row.completed_at ?? ""));
  const receiptBasename = String(row.process_receipt_key ?? "").slice(7);
  if (
    row.schema_version !== "closure-process-receipt.v1" ||
    row.kind !== "test" ||
    row.repository_head !== input.head ||
    row.executable !== "npx" ||
    row.argv_json !== JSON.stringify(argv) ||
    row.dedupe_key !== commandKey ||
    !/^sha256:[0-9a-f]{64}$/.test(String(row.process_receipt_key ?? "")) ||
    Number(row.exit_code) !== 0 ||
    row.signal !== null ||
    Number(row.timed_out) !== 0 ||
    stdoutPath !== `.helix/evidence/process-receipts/${receiptBasename}.stdout` ||
    stderrPath !== `.helix/evidence/process-receipts/${receiptBasename}.stderr` ||
    row.stdout_digest !== stdout.digest ||
    row.stderr_digest !== stderr.digest ||
    !Number.isFinite(completed) ||
    Date.parse(input.now) - completed > 3_600_000 ||
    completed > Date.parse(input.now)
  )
    throw new Error(`persistent Vitest receipt invalid: ${input.testPath}`);
  const report = JSON.parse(stdout.bytes.toString("utf8"));
  if (!report || !Array.isArray(report.testResults)) throw new Error("Vitest artifact invalid");
  const assertions = report.testResults.flatMap((suite: { assertionResults?: unknown[] }) =>
    Array.isArray(suite.assertionResults) ? suite.assertionResults : [],
  ) as Array<{ fullName?: unknown; status?: unknown }>;
  const fullName = verifyCollectedVitestAssertions(assertions, input.planId, input.oracleId);
  return {
    test_path: input.testPath,
    full_name: fullName,
    status: "passed",
    source_digest: readVerifiedRepoFile(input.repoRoot, input.testPath).digest,
    canonical_realpath: true,
    symlink: false,
    receipt: {
      schema_version: "closure-process-receipt.v1",
      repository_head: input.head,
      kind: "test",
      executable: "npx",
      argv,
      stdout_digest: stdout.digest,
      completed_at: String(row.completed_at),
    },
  };
}

export function verifyCollectedVitestAssertions(
  assertions: readonly { fullName?: unknown; status?: unknown }[],
  planId: string,
  oracleId: string,
): string {
  const marker = `[${planId}/${oracleId}]`;
  const markerPattern = /\[(PLAN-[A-Z0-9]+-[A-Za-z0-9-]+)\/(U-[A-Z0-9]+-[0-9]{3})\]/g;
  const allMarkers = assertions.flatMap((assertion) =>
    typeof assertion.fullName === "string"
      ? [...assertion.fullName.matchAll(markerPattern)].map((match) => match[0])
      : [],
  );
  const matches = assertions.filter((assertion) => {
    if (typeof assertion.fullName !== "string") return false;
    const markers = [...assertion.fullName.matchAll(markerPattern)].map((match) => match[0]);
    return markers.length === 1 && markers[0] === marker;
  });
  if (
    allMarkers.length !== 1 ||
    allMarkers[0] !== marker ||
    matches.length !== 1 ||
    matches[0]?.status !== "passed" ||
    (matches[0]?.fullName as string).split(marker).length !== 2
  )
    throw new Error(`persistent Vitest oracle exact join failed: ${marker}`);
  const match = matches[0];
  if (!match || typeof match.fullName !== "string") throw new Error("Vitest exact match absent");
  return match.fullName;
}

const typedGateSchema = z
  .object({ gate_id: z.string(), command_id: z.string(), command: z.string() })
  .strict();
function loadTypedAuthorityBlock(input: {
  bytes: Buffer;
  path: string;
  digest: Digest;
  sourceKind: "confirmed_design" | "plan_frontmatter";
}): TypedAuthorityBlock | null {
  const meta = frontmatter(input.bytes);
  const key = meta.closure_authority
    ? "closure_authority"
    : meta.closure_auto_authority
      ? "closure_auto_authority"
      : null;
  if (!key) return null;
  const row = z
    .object({
      capabilities: z.array(z.string()),
      gates: z.array(typedGateSchema).optional(),
      required_gates: z.array(typedGateSchema).optional(),
    })
    .passthrough()
    .parse(meta[key]);
  return {
    source_kind: input.sourceKind,
    source_path: input.path,
    source_digest: input.digest,
    field_pointer: `/${key}`,
    status: input.sourceKind === "confirmed_design" ? String(meta.status ?? "") : undefined,
    capabilities: row.capabilities,
    gates: row.gates ?? row.required_gates ?? [],
  };
}

export function buildCurrentClosureAuthorityCandidate(input: {
  repoRoot: string;
  db: HarnessDb;
  head: string;
  planId: string;
  planPath: string;
  l8Bytes: Buffer;
  l8Digest: Digest;
  now: string;
}): ClosureAuthorityBackfillCandidate {
  const plan = readVerifiedRepoFile(input.repoRoot, input.planPath);
  verifyTrackedHeadFile({
    repoRoot: input.repoRoot,
    head: input.head,
    path: input.planPath,
    digest: plan.digest,
  });
  const meta = frontmatter(plan.bytes);
  if (meta.plan_id !== input.planId) throw new Error(`${input.planId}: canonical PLAN ID mismatch`);
  const bindings = z
    .array(planBindingSchema)
    .default([])
    .parse(meta.verification_bindings) as BackfillBinding[];
  const parsedL8 = parseEligibleOracleTable(input.l8Bytes.toString("utf8"));
  if (parsedL8.schemaErrors.length > 0) throw new Error("canonical L8 schema invalid");
  const l8Rows: BackfillL8Row[] = [];
  const collectedTests: CollectedBackfillTest[] = [];
  const parentBlocks: TypedAuthorityBlock[] = [];
  for (const binding of bindings) {
    const parent = readVerifiedRepoFile(input.repoRoot, binding.parent_design);
    verifyTrackedHeadFile({
      repoRoot: input.repoRoot,
      head: input.head,
      path: binding.parent_design,
      digest: parent.digest,
    });
    const test = readVerifiedRepoFile(input.repoRoot, binding.test_path);
    verifyTrackedHeadFile({
      repoRoot: input.repoRoot,
      head: input.head,
      path: binding.test_path,
      digest: test.digest,
    });
    const parentMeta = frontmatter(parent.bytes);
    const exactRows = parsedL8.rows.filter(
      (row) => row.oracleId === binding.oracle_id && row.testPaths.includes(binding.test_path),
    );
    for (const _row of exactRows)
      l8Rows.push({
        ...binding,
        source_path: "docs/test-design/harness/L8-unit-test-design.md",
        source_digest: input.l8Digest,
        parent_design_status: String(parentMeta.status ?? ""),
      });
    const block = loadTypedAuthorityBlock({
      bytes: parent.bytes,
      path: binding.parent_design,
      digest: parent.digest,
      sourceKind: "confirmed_design",
    });
    if (block) parentBlocks.push(block);
    try {
      collectedTests.push(
        verifyPhysicalTestReceipt({
          repoRoot: input.repoRoot,
          db: input.db,
          head: input.head,
          testPath: binding.test_path,
          planId: input.planId,
          oracleId: binding.oracle_id,
          now: input.now,
        }),
      );
    } catch (error) {
      if (!(error instanceof Error) || !error.message.includes("persistent Vitest receipt absent"))
        throw error;
    }
  }
  const uniqueParentBlocks = new Map(parentBlocks.map((block) => [stable(block), block]));
  return {
    plan_id: input.planId,
    plan_path: input.planPath,
    plan_digest: plan.digest,
    plan_slot_kind: "implementation_plan",
    plan_bindings: bindings,
    l8_rows: l8Rows,
    collected_tests: collectedTests,
    design_authority: uniqueParentBlocks.size === 1 ? [...uniqueParentBlocks.values()][0] : null,
    plan_authority: loadTypedAuthorityBlock({
      bytes: plan.bytes,
      path: input.planPath,
      digest: plan.digest,
      sourceKind: "plan_frontmatter",
    }),
  };
}

export function verifyCanonicalRebuiltBackfillBundle(
  caller: ClosureAuthorityBackfillBundle,
  rebuilt: ClosureAuthorityBackfillBundle,
): void {
  if (stable(rebuilt.decisions) !== stable(caller.decisions))
    throw new Error("bundle decisions differ from canonical production rebuild");
  if (
    stable(rebuilt.source_digests) !== stable(caller.source_digests) ||
    rebuilt.bundle_digest !== caller.bundle_digest
  )
    throw new Error("bundle canonical rebuild digest mismatch");
}

export function verifyClosureAuthorityBackfillProductionBundle(input: {
  repoRoot: string;
  db: HarnessDb;
  bundle: ClosureAuthorityBackfillBundle;
  gateAllowlistPath: string;
  now: string;
  expectedRegistryDigest?: Digest;
  allowMutableRegistry?: boolean;
}): { verified: true; source_digest: Digest } {
  const { bundle } = input;
  if (input.gateAllowlistPath !== CLOSURE_GATE_ALLOWLIST_PATH)
    throw new Error(`gate allowlist path must be ${CLOSURE_GATE_ALLOWLIST_PATH}`);
  const body = { ...bundle } as Record<string, unknown>;
  delete body.bundle_digest;
  if (sha256(stable(body)) !== bundle.bundle_digest) throw new Error("bundle body digest mismatch");
  verifyStrictBundleDecisions(bundle);
  const review = verifyClosureAuthorityBackfillCurrentContext({
    repoRoot: input.repoRoot,
    db: input.db,
    bundle,
    expectedRegistryDigest: input.expectedRegistryDigest,
    allowMutableRegistry: input.allowMutableRegistry,
  });
  const allowlist = loadRepoOwnedGateAllowlist({
    repoRoot: input.repoRoot,
    path: input.gateAllowlistPath,
    repositoryHead: bundle.repository_head,
  });
  const registry = readVerifiedRepoFile(
    input.repoRoot,
    "docs/governance/closure-authority-registry.yaml",
  );
  verifyTrackedHeadFile({
    repoRoot: input.repoRoot,
    head: bundle.repository_head,
    path: input.gateAllowlistPath,
    digest: allowlist.source_digest,
  });
  verifyTrackedHeadFile({
    repoRoot: input.repoRoot,
    head: bundle.repository_head,
    path: "docs/governance/closure-authority-registry.yaml",
    digest: bundle.registry_digest,
  });
  const expectedRegistryDigest = input.expectedRegistryDigest ?? bundle.registry_digest;
  if (registry.digest !== expectedRegistryDigest) throw new Error("registry digest drift");
  if (expectedRegistryDigest !== bundle.registry_digest) {
    const current = parseClosureAuthorityRegistry(parseYaml(registry.bytes.toString("utf8")));
    const baseline = parseClosureAuthorityRegistry(
      parseYaml(
        execFileSync(
          "git",
          ["show", `${bundle.repository_head}:docs/governance/closure-authority-registry.yaml`],
          { cwd: input.repoRoot, encoding: "utf8" },
        ),
      ),
    );
    const proposals = new Map<string, string>();
    for (const decision of bundle.decisions) {
      if (!decision.proposal) continue;
      const { field_sources: _sources, ...row } = decision.proposal;
      proposals.set(decision.plan_id, stable(row));
    }
    if (
      stable(current.authorities.slice(0, baseline.authorities.length)) !==
      stable(baseline.authorities)
    )
      throw new Error("mutable registry changed baseline authority rows");
    for (const row of current.authorities.slice(baseline.authorities.length)) {
      const expected = proposals.get(row.plan_id);
      if (expected === undefined || stable(row) !== expected)
        throw new Error(`${row.plan_id}: previously applied authority differs from full proposal`);
    }
  }
  const l8 = readVerifiedRepoFile(
    input.repoRoot,
    "docs/test-design/harness/L8-unit-test-design.md",
  );
  verifyTrackedHeadFile({
    repoRoot: input.repoRoot,
    head: bundle.repository_head,
    path: "docs/test-design/harness/L8-unit-test-design.md",
    digest: l8.digest,
  });
  const rebuiltCandidates: ClosureAuthorityBackfillCandidate[] = [];
  for (let offset = 0; offset < review.review_scope.plan_ids.length; offset += 100) {
    const ids = review.review_scope.plan_ids.slice(offset, offset + 100);
    const paths = review.review_scope.source_paths.slice(offset, offset + 100);
    for (let index = 0; index < ids.length; index += 1) {
      const planId = ids[index];
      const planPath = paths[index];
      if (!planId || !planPath) throw new Error("review scope plan/path cardinality mismatch");
      rebuiltCandidates.push(
        buildCurrentClosureAuthorityCandidate({
          repoRoot: input.repoRoot,
          db: input.db,
          head: bundle.repository_head,
          planId,
          planPath,
          l8Bytes: l8.bytes,
          l8Digest: l8.digest,
          now: input.now,
        }),
      );
    }
  }
  const rebuilt = buildClosureAuthorityBackfill({
    repository_head: bundle.repository_head,
    registry_digest: bundle.registry_digest,
    review_scope_digest: review.review_scope.approval_scope_digest as Digest,
    expected_plan_ids: review.review_scope.plan_ids,
    candidates: rebuiltCandidates,
    gate_allowlist: allowlist,
  });
  verifyCanonicalRebuiltBackfillBundle(bundle, rebuilt);
  for (const decision of bundle.decisions) {
    const proposal = decision.proposal;
    if (!proposal) continue;
    const plan = readVerifiedRepoFile(input.repoRoot, proposal.source_path);
    verifyTrackedHeadFile({
      repoRoot: input.repoRoot,
      head: bundle.repository_head,
      path: proposal.source_path,
      digest: plan.digest,
    });
    if (plan.digest !== proposal.source_digest)
      throw new Error(`${proposal.plan_id}: PLAN source digest drift`);
    verifyPlanFrontmatter({
      bytes: plan.bytes,
      planId: proposal.plan_id,
      bindings: proposal.bindings,
    });
    for (const binding of proposal.bindings) {
      const parent = readVerifiedRepoFile(input.repoRoot, binding.parent_design);
      const test = readVerifiedRepoFile(input.repoRoot, binding.test_path);
      const l8 = readVerifiedRepoFile(
        input.repoRoot,
        "docs/test-design/harness/L8-unit-test-design.md",
      );
      verifyTrackedHeadFile({
        repoRoot: input.repoRoot,
        head: bundle.repository_head,
        path: binding.parent_design,
        digest: parent.digest,
      });
      verifyTrackedHeadFile({
        repoRoot: input.repoRoot,
        head: bundle.repository_head,
        path: binding.test_path,
        digest: test.digest,
      });
      verifyTrackedHeadFile({
        repoRoot: input.repoRoot,
        head: bundle.repository_head,
        path: "docs/test-design/harness/L8-unit-test-design.md",
        digest: l8.digest,
      });
      if (frontmatter(parent.bytes).status !== "confirmed")
        throw new Error(`${binding.oracle_id}: parent design status not confirmed`);
      verifyL8ExactRow({
        bytes: l8.bytes,
        oracleId: binding.oracle_id,
        testPath: binding.test_path,
      });
      const matchingSources = proposal.field_sources.bindings.filter(
        (row) => row.plan === plan.digest && row.l8 === l8.digest && row.test === test.digest,
      );
      const sources = matchingSources[0];
      if (
        matchingSources.length !== 1 ||
        !sources ||
        sources.plan !== plan.digest ||
        sources.l8 !== l8.digest ||
        sources.test !== test.digest ||
        !decision.evidence_digests.includes(parent.digest) ||
        !bundle.source_digests.includes(parent.digest) ||
        !bundle.source_digests.includes(l8.digest) ||
        !bundle.source_digests.includes(test.digest) ||
        !l8.bytes.includes(binding.oracle_id) ||
        !parent.bytes.includes(binding.oracle_id)
      )
        throw new Error(`${proposal.plan_id}: binding source exact join failed`);
      verifyPhysicalTestReceipt({
        repoRoot: input.repoRoot,
        db: input.db,
        head: bundle.repository_head,
        testPath: binding.test_path,
        planId: proposal.plan_id,
        oracleId: binding.oracle_id,
        now: input.now,
      });
    }
    const authoritySource = proposal.field_sources.capabilities;
    const authorityBytes = readVerifiedRepoFile(input.repoRoot, authoritySource.source_path);
    verifyTrackedHeadFile({
      repoRoot: input.repoRoot,
      head: bundle.repository_head,
      path: authoritySource.source_path,
      digest: authorityBytes.digest,
    });
    if (authorityBytes.digest !== authoritySource.source_digest)
      throw new Error(`${proposal.plan_id}: authority source digest drift`);
    if (!bundle.source_digests.includes(authorityBytes.digest))
      throw new Error(`${proposal.plan_id}: authority source digest omitted from bundle`);
    const parsedAuthority = normalizedAuthority(
      authorityAtPointer(frontmatter(authorityBytes.bytes), authoritySource),
    );
    const expectedAuthority = normalizedAuthority({
      capabilities: proposal.capabilities,
      gates: proposal.gates,
    });
    if (stable(parsedAuthority) !== stable(expectedAuthority))
      throw new Error(`${proposal.plan_id}: authority typed block mismatch`);
    for (const gate of proposal.gates) {
      const allowed = allowlist.entries[gate.gate_id];
      if (!allowed || allowed.command_id !== gate.command_id || allowed.command !== gate.command)
        throw new Error(`${proposal.plan_id}: repo gate allowlist mismatch`);
    }
  }
  if (!bundle.source_digests.includes(allowlist.source_digest))
    throw new Error("gate allowlist digest omitted from bundle");
  return {
    verified: true,
    source_digest: sha256(stable([bundle.bundle_digest, allowlist.source_digest])),
  };
}

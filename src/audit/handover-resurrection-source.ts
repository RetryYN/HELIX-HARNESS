import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { extname, join, posix } from "node:path";
import { loadAndVerifyHandoverCutoverApproval } from "../lint/handover-cutover-approval";
import {
  analyzeHandoverResurrection,
  ENFORCE_AUTHORITY_PIN,
  parseEnforceAuthority,
  parseGeneratedResurrectionAuthority,
  parseGeneratedResurrectionBaselineFile,
  parsePreserveAuthority,
  parseResurrectionBaselineAuthority,
  parseResurrectionBaselineFile,
  type ResurrectionAnalysis,
  type ResurrectionCheckpointState,
  type ResurrectionFile,
  resurrectionPolicyDigest,
  type TypedAllowedArtifact,
} from "../lint/handover-resurrection";
import {
  latestCompletedRetirementCheckpoint,
  parseRetirementJournal,
} from "../runtime/continuation";
import {
  collectPreserveManifest,
  collectRetirementPreserveInventory,
  validateOperationsTransitionMarkdown,
  validateProviderEvidenceJson,
} from "../runtime/retirement-preserve";
import {
  buildCleanDistributionPlan,
  CONSUMER_CI_RUN_COMMANDS,
  CONSUMER_ESCALATION_WORKFLOW_RUN_COMMANDS,
  CONSUMER_VSCODE_TASK_COMMANDS,
  cleanDistributionSourcePath,
  loadTemplates,
  planHelixProjectSetup,
  renderBrownfieldSetupArtifacts,
  renderSetupArtifacts,
  transformCleanDistributionArtifact,
} from "../setup";

export {
  collectPreserveManifest,
  collectRetirementPreserveInventory,
  latestCompletedRetirementCheckpoint,
  parseRetirementJournal,
  validateOperationsTransitionMarkdown,
  validateProviderEvidenceJson,
};

export interface GeneratedResurrectionSourceFile {
  path: string;
  content: string;
}

const ACTIVE_SCAN_ROOTS = [
  "src",
  "scripts",
  ".helix/config",
  ".helix/handover/provider",
  ".helix/teams",
  ".claude",
  ".codex",
  ".github",
  ".vscode",
  "tests",
  "dist",
  "docs/handover",
  "docs/templates",
] as const;
const ACTIVE_TOP_LEVEL_FILES = ["AGENTS.md", "CLAUDE.md", "package.json", "bunfig.toml"] as const;
const ACTIVE_EXACT_FILES = [".helix/handover/CURRENT.json"] as const;
const ACTIVE_SCAN_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".json",
  ".yaml",
  ".yml",
  ".toml",
  ".md",
  ".sh",
  ".ps1",
]);

function sha256(value: string): string {
  return `sha256:${createHash("sha256").update(value).digest("hex")}`;
}

function canonicalJson(value: unknown): string {
  if (value === null || typeof value === "boolean" || typeof value === "string")
    return JSON.stringify(value);
  if (typeof value === "number" && Number.isFinite(value)) return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (typeof value !== "object") throw new Error("resurrection manifest is not JSON");
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${canonicalJson(record[key])}`)
    .join(",")}}`;
}

export function loadHandoverResurrectionFiles(repoRoot: string): ResurrectionFile[] {
  const files: ResurrectionFile[] = [];
  const walk = (relativeRoot: string): void => {
    const absolute = join(repoRoot, relativeRoot);
    if (!existsSync(absolute)) return;
    for (const entry of readdirSync(absolute, { withFileTypes: true })) {
      const path = posix.join(relativeRoot.replace(/\\/g, "/"), entry.name);
      if (entry.isDirectory()) {
        if (!["node_modules", ".git", "tmp"].includes(entry.name)) walk(path);
      } else if (
        entry.isFile() &&
        ACTIVE_SCAN_EXTENSIONS.has(extname(entry.name)) &&
        path !== "src/lint/handover-resurrection.ts" &&
        path !== "tests/handover-resurrection.test.ts"
      ) {
        files.push({ path, content: readFileSync(join(repoRoot, path), "utf8") });
      }
    }
  };
  for (const root of ACTIVE_SCAN_ROOTS) walk(root);
  for (const path of [...ACTIVE_TOP_LEVEL_FILES, ...ACTIVE_EXACT_FILES]) {
    if (existsSync(join(repoRoot, path)))
      files.push({ path, content: readFileSync(join(repoRoot, path), "utf8") });
  }
  return files.sort((a, b) => a.path.localeCompare(b.path));
}

/** setup/distribution/runtime から detector の入力 projection を組み立てる audit adapter。 */
export function loadGeneratedResurrectionSourceFiles(
  repoRoot: string,
): GeneratedResurrectionSourceFile[] {
  const templates = loadTemplates(repoRoot);
  const plan = planHelixProjectSetup("0-A", { dryRun: true });
  const project = (kind: string, path: string): string => `@projection/${kind}/${path}`;
  const fresh = renderSetupArtifacts(plan, templates).map((file) => ({
    ...file,
    path: project("fresh", file.path),
  }));
  const brownfield = renderBrownfieldSetupArtifacts(plan, templates, {
    "AGENTS.md": "# Consumer rules\n\nこの行はconsumer所有。\n",
    "CLAUDE.md": "# Consumer context\n\nこの行はconsumer所有。\n",
    "package.json": '{"name":"brownfield-consumer","scripts":{"keep":"true"}}\n',
    ".vscode/tasks.json":
      '{"version":"2.0.0","tasks":[{"label":"keep-existing","type":"shell","command":"true"}]}\n',
  }).map((file) => ({ ...file, path: project("brownfield", file.path) }));
  const commandContracts: GeneratedResurrectionSourceFile[] = [
    {
      path: project("command", ".github/workflows/harness-check.yml"),
      content: JSON.stringify(CONSUMER_CI_RUN_COMMANDS),
    },
    {
      path: project("command", ".github/workflows/escalation-stale.yml"),
      content: JSON.stringify(CONSUMER_ESCALATION_WORKFLOW_RUN_COMMANDS),
    },
    {
      path: project("command", ".vscode/tasks.json"),
      content: JSON.stringify(CONSUMER_VSCODE_TASK_COMMANDS),
    },
  ];
  const tracked = execFileSync("git", ["ls-files"], { cwd: repoRoot, encoding: "utf8" })
    .split(/\r?\n/)
    .filter((path) => path.length > 0 && existsSync(join(repoRoot, path)));
  const distributionPlan = buildCleanDistributionPlan({ paths: tracked });
  if (
    !distributionPlan.ok ||
    distributionPlan.missingRequired.length > 0 ||
    distributionPlan.denylistViolations.length > 0
  ) {
    throw new Error("clean distribution plan is incomplete for resurrection scan");
  }
  const distributionPaths = distributionPlan.artifactPaths.filter(
    (path) =>
      path !== "src/lint/handover-resurrection.ts" &&
      path !== "tests/handover-resurrection.test.ts",
  );
  const distribution = distributionPaths.map((artifactPath): GeneratedResurrectionSourceFile => {
    const sourcePath = cleanDistributionSourcePath(artifactPath, tracked);
    const absolute = join(repoRoot, sourcePath);
    if (!existsSync(absolute))
      throw new Error(`clean distribution source missing from resurrection scan: ${sourcePath}`);
    return {
      path: project("distribution", artifactPath),
      content: transformCleanDistributionArtifact(artifactPath, readFileSync(absolute, "utf8")),
    };
  });
  if (distribution.length !== distributionPaths.length)
    throw new Error("clean distribution resurrection projection is incomplete");
  return [...fresh, ...brownfield, ...commandContracts, ...distribution];
}

export function evaluateResurrectionCheckpointState(input: {
  journalText: string;
  expectedPreserveDigest: string;
  authorityText: string | null;
  authorityPin: typeof ENFORCE_AUTHORITY_PIN | null;
}): ResurrectionCheckpointState {
  const pending = {
    completeCheckpoint: null,
    expectedOperationId: "journal-derived-after-cutover",
    expectedIntentDigest: sha256("pending-cutover-intent"),
    expectedPreserveDigest: input.expectedPreserveDigest,
    expectedArchiveDigest: sha256("pending-archive-digest"),
  } satisfies ResurrectionCheckpointState;
  if (!input.journalText.trim()) return pending;
  const parsed = parseRetirementJournal(input.journalText);
  if (parsed.truncatedTail) throw new Error("retirement journal has truncated tail");
  const complete = parsed.entries.filter(
    (entry) => entry.phase === "complete" && entry.status === "completed",
  );
  if (complete.length === 0) return pending;
  if (
    new Set(complete.map((entry) => `${entry.operationId}\0${entry.intentDigest}`)).size !== 1 ||
    complete.length !== 1
  )
    throw new Error("retirement journal complete scope is ambiguous");
  if (input.authorityText === null)
    throw new Error("handover resurrection enforce authority is missing");
  const authority = parseEnforceAuthority(input.authorityText, input.authorityPin);
  const terminal = complete[0];
  if (!terminal) throw new Error("retirement complete checkpoint missing");
  const latest = latestCompletedRetirementCheckpoint(parsed.entries, {
    operationId: authority.operationId,
    intentDigest: authority.intentDigest,
  });
  const scoped = parsed.entries.filter(
    (entry) =>
      entry.operationId === authority.operationId && entry.intentDigest === authority.intentDigest,
  );
  const boundLine = input.journalText
    .split(/\r?\n/)
    .some((line) => line.length > 0 && sha256(line) === authority.journalEntryDigest);
  if (
    !boundLine ||
    latest !== terminal ||
    scoped.at(-1) !== terminal ||
    authority.preserveDigest !== input.expectedPreserveDigest
  )
    throw new Error("retirement enforce authority does not bind terminal checkpoint");
  return {
    completeCheckpoint: {
      operationId: terminal.operationId,
      intentDigest: terminal.intentDigest,
      preserveDigest: authority.preserveDigest,
      archiveDigest: authority.archiveDigest,
    },
    expectedOperationId: authority.operationId,
    expectedIntentDigest: authority.intentDigest,
    expectedPreserveDigest: input.expectedPreserveDigest,
    expectedArchiveDigest: authority.archiveDigest,
  };
}

export function loadResurrectionCheckpointState(
  repoRoot: string,
  expectedPreserveDigest: string,
): ResurrectionCheckpointState {
  const journalPath = join(repoRoot, ".helix/audit/session-handover-retirement.jsonl");
  if (!existsSync(journalPath))
    return evaluateResurrectionCheckpointState({
      journalText: "",
      expectedPreserveDigest,
      authorityText: null,
      authorityPin: ENFORCE_AUTHORITY_PIN,
    });
  const authorityPath = join(repoRoot, "config/handover-retirement-enforce-authority.json");
  const authorityText = existsSync(authorityPath) ? readFileSync(authorityPath, "utf8") : null;
  if (authorityText !== null) parseEnforceAuthority(authorityText, ENFORCE_AUTHORITY_PIN);
  const approval = loadAndVerifyHandoverCutoverApproval(repoRoot);
  if (
    authorityText !== null &&
    (JSON.parse(authorityText) as { approvalDecisionId?: string }).approvalDecisionId !==
      approval.decisionId
  )
    throw new Error("handover enforce authority approval decision mismatch");
  return evaluateResurrectionCheckpointState({
    journalText: readFileSync(journalPath, "utf8"),
    expectedPreserveDigest,
    authorityText,
    authorityPin: ENFORCE_AUTHORITY_PIN,
  });
}

/** repo/runtime/setup inputの構築とpure resurrection analyzerの接続点。 */
export function analyzeHandoverResurrectionShadowRepo(repoRoot: string): ResurrectionAnalysis {
  const read = (path: string): string => readFileSync(join(repoRoot, path), "utf8");
  const baselineText = read("config/handover-resurrection-baseline.json");
  const baseline = parseResurrectionBaselineFile(baselineText);
  verifyGitAuthority({
    repoRoot,
    authority: parseResurrectionBaselineAuthority(
      read("config/handover-resurrection-authority.json"),
    ),
    text: baselineText,
    digest: baseline.digest,
    message: "handover resurrection baseline authority mismatch",
  });
  const generatedText = read("config/handover-generated-resurrection-baseline.json");
  const generated = parseGeneratedResurrectionBaselineFile(generatedText);
  verifyGitAuthority({
    repoRoot,
    authority: parseGeneratedResurrectionAuthority(
      read("config/handover-generated-resurrection-authority.json"),
    ),
    text: generatedText,
    digest: generated.digest,
    message: "generated resurrection authority mismatch",
  });
  const inventory = collectRetirementPreserveInventory(repoRoot);
  const preserveAuthority = parsePreserveAuthority(read("config/handover-preserve-authority.json"));
  const actualPaths = [
    ...inventory.providerPaths.map((path) => ({ path, kind: "provider_evidence" as const })),
    ...inventory.operationsPaths.map((path) => ({ path, kind: "operations_transition" as const })),
  ].sort((a, b) => a.path.localeCompare(b.path));
  if (
    canonicalJson(actualPaths) !==
    canonicalJson(preserveAuthority.entries.map(({ path, kind }) => ({ path, kind })))
  )
    throw new Error("handover preserve inventory drift");
  for (const entry of preserveAuthority.entries)
    if (sha256(read(entry.path)) !== entry.digest)
      throw new Error(`handover preserve authority digest mismatch: ${entry.path}`);
  const preserve = collectPreserveManifest(
    repoRoot,
    [
      ...inventory.providerPaths.map((path) => ({
        path,
        kind: "provider_evidence" as const,
        role: path.endsWith("/CURRENT.json") ? ("current_pointer" as const) : ("evidence" as const),
        owner: "runtime-audit",
      })),
      ...inventory.operationsPaths.map((path) => ({
        path,
        kind: "operations_transition" as const,
        role: "operations_design" as const,
        owner: "operations-governance",
      })),
    ],
    {
      operationId: "handover-retirement:shadow-resurrection",
      intentDigest: resurrectionPolicyDigest(),
      capturedAt: new Date().toISOString(),
      retirementPhase: "shadow_read",
    },
  );
  const files = [
    ...loadHandoverResurrectionFiles(repoRoot),
    ...loadGeneratedResurrectionSourceFiles(repoRoot),
  ].sort((a, b) => a.path.localeCompare(b.path));
  const filesByPath = new Map(files.map((file) => [file.path, file]));
  const allowedArtifacts = preserve.entries.flatMap((entry): TypedAllowedArtifact[] => {
    const scanned = filesByPath.get(entry.path);
    const content = scanned?.content ?? read(entry.path);
    const validation =
      entry.kind === "provider_evidence"
        ? validateProviderEvidenceJson(content)
        : validateOperationsTransitionMarkdown(content);
    if (
      !validation.valid ||
      !entry.schemaValidation.ok ||
      entry.schemaValidation.exitCode !== 0 ||
      !entry.query.ok ||
      entry.query.exitCode !== 0 ||
      !entry.export.ok ||
      entry.export.exitCode !== 0 ||
      sha256(content) !== entry.originalDigest
    )
      throw new Error(`preserve validation failed for resurrection allowlist: ${entry.path}`);
    return scanned
      ? [
          {
            path: entry.path,
            kind: entry.kind,
            digest: entry.originalDigest,
            runtimeReadable: true,
            schemaValid: true,
            continuationJoined: false,
          },
        ]
      : [];
  });
  const fingerprints = [...new Set([...baseline.fingerprints, ...generated.fingerprints])].sort();
  return analyzeHandoverResurrection({
    files,
    allowedArtifacts,
    baseline: { fingerprints, digest: sha256(canonicalJson(fingerprints)) },
    checkpointState: loadResurrectionCheckpointState(repoRoot, preserve.preservedDigest),
  });
}

function verifyGitAuthority(input: {
  repoRoot: string;
  authority: {
    sourceRevision: string;
    baselinePath: string;
    baselineBlobOid: string;
    baselineFileDigest: string;
    baselineDigest: string;
  };
  text: string;
  digest: string;
  message: string;
}): void {
  const { repoRoot, authority, text, digest, message } = input;
  execFileSync("git", ["merge-base", "--is-ancestor", authority.sourceRevision, "HEAD"], {
    cwd: repoRoot,
    stdio: "ignore",
  });
  const revisionPath = `${authority.sourceRevision}:${authority.baselinePath}`;
  const blob = execFileSync("git", ["rev-parse", revisionPath], {
    cwd: repoRoot,
    encoding: "utf8",
  }).trim();
  const anchored = execFileSync("git", ["show", revisionPath], {
    cwd: repoRoot,
    encoding: "utf8",
    maxBuffer: 4 * 1024 * 1024,
  });
  if (
    blob !== authority.baselineBlobOid ||
    sha256(anchored) !== authority.baselineFileDigest ||
    text !== anchored ||
    digest !== authority.baselineDigest
  )
    throw new Error(message);
}

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { extname, join, posix } from "node:path";
import ts from "typescript";
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

export type ResurrectionCategory =
  | "command"
  | "module"
  | "symbol"
  | "schema"
  | "panel"
  | "path"
  | "writer"
  | "generated_surface"
  | "unclassified";

export interface ResurrectionPolicy {
  schemaVersion: "handover-resurrection-policy.v1";
  detectorPolicyVersion: string;
  forbidden: {
    commands: string[];
    modules: string[];
    symbols: string[];
    schemas: string[];
    panels: string[];
    paths: string[];
    writerSymbols: string[];
    generatedTokens: string[];
  };
}

export interface ResurrectionFile {
  path: string;
  content: string;
}

export interface TypedAllowedArtifact {
  path: string;
  kind: "provider_evidence" | "operations_transition" | "legacy_archive";
  digest: string;
  runtimeReadable: boolean;
  schemaValid: boolean;
  continuationJoined: boolean;
}

export interface ResurrectionFinding {
  code: string;
  category: ResurrectionCategory;
  path: string;
  symbol: string;
  evidence: string;
  fingerprint: string;
}

export interface ResurrectionBaseline {
  fingerprints: string[];
  digest: string;
}

export interface ResurrectionBaselineFile extends ResurrectionBaseline {
  schemaVersion: "handover-resurrection-baseline.v1";
  policyDigest: string;
}

export interface ResurrectionBaselineAuthority {
  schemaVersion: "handover-resurrection-authority.v1";
  baselinePath: "config/handover-resurrection-baseline.json";
  sourceRevision: string;
  baselineBlobOid: string;
  baselineFileDigest: string;
  baselineDigest: string;
  decisionId: string;
}

interface ResurrectionPreserveAuthority {
  schemaVersion: "handover-preserve-authority.v1";
  sourceRevision: string;
  entries: Array<{
    path: string;
    kind: "provider_evidence" | "operations_transition";
    digest: string;
  }>;
}

interface ResurrectionEnforceAuthority {
  schemaVersion: "handover-resurrection-enforce-authority.v1";
  operationId: string;
  intentDigest: string;
  preserveDigest: string;
  archiveDigest: string;
  journalEntryDigest: string;
  approvalDecisionId: string;
  approvalStatus: "approved";
}

export interface ResurrectionCheckpointState {
  completeCheckpoint: {
    operationId: string;
    intentDigest: string;
    preserveDigest: string;
    archiveDigest: string;
  } | null;
  expectedOperationId: string;
  expectedIntentDigest: string;
  expectedPreserveDigest: string;
  expectedArchiveDigest: string;
}

export type ResurrectionMode =
  | "pre_cutover_shadow"
  | "post_complete_enforce"
  | "invalid_precondition";

export interface ResurrectionAnalysis {
  ok: boolean;
  mode: ResurrectionMode;
  findings: ResurrectionFinding[];
  knownFindings: ResurrectionFinding[];
  newFindings: ResurrectionFinding[];
  preconditionErrors: string[];
  policyDigest: string;
}

export const HANDOVER_RESURRECTION_POLICY: ResurrectionPolicy = {
  schemaVersion: "handover-resurrection-policy.v1",
  detectorPolicyVersion: "1",
  forbidden: {
    commands: ["handover", "handover status"],
    modules: ["src/handover", "./handover", "../handover"],
    symbols: [
      "runHandover",
      "readHandover",
      "writeHandover",
      "generateHandover",
      "HandoverAggregate",
    ],
    schemas: ["HandoverSchema", "CURRENT.json"],
    panels: ["HandoverPanel"],
    paths: ["src/handover", ".helix/handover/CURRENT.json", "docs/handover"],
    writerSymbols: ["writeFile", "writeFileSync", "appendFile", "appendFileSync", "writeText"],
    generatedTokens: [
      "helix handover",
      "handover status",
      ".helix/handover/CURRENT.json",
      "HandoverPanel",
    ],
  },
};

const SHA256 = /^sha256:[a-f0-9]{64}$/;
const BASELINE_AUTHORITY_PIN: ResurrectionBaselineAuthority = {
  schemaVersion: "handover-resurrection-authority.v1",
  baselinePath: "config/handover-resurrection-baseline.json",
  sourceRevision: "69cc0f02ac1abe815eeb9f653ab2afa9a90df387",
  baselineBlobOid: "8874bc27f24f56331d2e71919a372d2998606865",
  baselineFileDigest: "sha256:89b51922804bf4fd376bc681637ec93a5644e39007db2f4af62ada6c46795a1a",
  baselineDigest: "sha256:799c0898015b6c6666182f50ab304887eba79d5716c3787061fa712d1e4b568e",
  decisionId: "PLAN-L7-416:shadow-baseline:scan-hardening-v1",
};
const PRESERVE_AUTHORITY_FILE_DIGEST =
  "sha256:dc460288ad0860ac02ec9b11f8265e58798d1f39e754524f7f5ec783e3900c22";
// PO confirmation前はnull固定。Sprint 3 atomic cutoverで承認済みauthority全体をpinする。
const ENFORCE_AUTHORITY_PIN: ResurrectionEnforceAuthority | null = null;

function sha256(value: string): string {
  return `sha256:${createHash("sha256").update(value).digest("hex")}`;
}

function canonicalJson(value: unknown): string {
  if (value === null || typeof value === "boolean" || typeof value === "string") {
    return JSON.stringify(value);
  }
  if (typeof value === "number" && Number.isFinite(value)) return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (typeof value !== "object") throw new Error("resurrection manifest is not JSON");
  return `{${Object.keys(value as Record<string, unknown>)
    .sort()
    .map(
      (key) => `${JSON.stringify(key)}:${canonicalJson((value as Record<string, unknown>)[key])}`,
    )
    .join(",")}}`;
}

function normalizedPath(path: string): string {
  const normalized = path.replace(/\\/g, "/");
  if (
    normalized.length === 0 ||
    normalized.startsWith("/") ||
    normalized.includes("\0") ||
    normalized.split("/").some((part) => part === "..")
  ) {
    throw new Error(`invalid resurrection path: ${path}`);
  }
  return posix.normalize(normalized);
}

function finding(input: {
  category: ResurrectionCategory;
  path: string;
  symbol: string;
  evidence: string;
}): ResurrectionFinding {
  const { category, path, symbol, evidence } = input;
  const code = `handover_resurrection_${category}`;
  return {
    code,
    category,
    path,
    symbol,
    evidence,
    fingerprint: sha256(canonicalJson({ code, category, path, symbol, evidence })),
  };
}

export function buildResurrectionBaseline(
  findings: readonly ResurrectionFinding[],
): ResurrectionBaseline {
  const fingerprints = [...new Set(findings.map((item) => item.fingerprint))].sort();
  return { fingerprints, digest: sha256(canonicalJson(fingerprints)) };
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
const ACTIVE_TOP_LEVEL_FILES = new Set(["AGENTS.md", "CLAUDE.md", "package.json", "bunfig.toml"]);
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

export function loadHandoverResurrectionFiles(repoRoot: string): ResurrectionFile[] {
  const files: ResurrectionFile[] = [];
  const walk = (relativeRoot: string): void => {
    const absolute = join(repoRoot, relativeRoot);
    if (!existsSync(absolute)) return;
    for (const entry of readdirSync(absolute, { withFileTypes: true })) {
      const path = posix.join(relativeRoot.replace(/\\/g, "/"), entry.name);
      if (entry.isDirectory()) {
        if (["node_modules", ".git", "tmp"].includes(entry.name)) continue;
        walk(path);
        continue;
      }
      if (
        !entry.isFile() ||
        !ACTIVE_SCAN_EXTENSIONS.has(extname(entry.name)) ||
        path === "src/lint/handover-resurrection.ts" ||
        path === "tests/handover-resurrection.test.ts"
      ) {
        continue;
      }
      files.push({ path, content: readFileSync(join(repoRoot, path), "utf8") });
    }
  };
  for (const root of ACTIVE_SCAN_ROOTS) walk(root);
  for (const path of [...ACTIVE_TOP_LEVEL_FILES, ...ACTIVE_EXACT_FILES]) {
    const absolute = join(repoRoot, path);
    if (existsSync(absolute)) files.push({ path, content: readFileSync(absolute, "utf8") });
  }
  return files.sort((a, b) => a.path.localeCompare(b.path));
}

export function parseResurrectionBaselineFile(text: string): ResurrectionBaselineFile {
  const raw = JSON.parse(text) as Partial<ResurrectionBaselineFile>;
  if (
    raw.schemaVersion !== "handover-resurrection-baseline.v1" ||
    raw.policyDigest !== resurrectionPolicyDigest() ||
    !Array.isArray(raw.fingerprints) ||
    raw.fingerprints.some((item) => typeof item !== "string" || !SHA256.test(item)) ||
    new Set(raw.fingerprints).size !== raw.fingerprints.length
  ) {
    throw new Error("invalid handover resurrection baseline");
  }
  const fingerprints = [...raw.fingerprints].sort();
  const digest = sha256(canonicalJson(fingerprints));
  if (raw.digest !== digest) throw new Error("handover resurrection baseline digest mismatch");
  return {
    schemaVersion: raw.schemaVersion,
    policyDigest: raw.policyDigest,
    fingerprints,
    digest,
  };
}

export function parseResurrectionBaselineAuthority(text: string): ResurrectionBaselineAuthority {
  const raw = JSON.parse(text) as Partial<ResurrectionBaselineAuthority>;
  if (
    raw.schemaVersion !== "handover-resurrection-authority.v1" ||
    raw.baselinePath !== "config/handover-resurrection-baseline.json" ||
    typeof raw.sourceRevision !== "string" ||
    !/^[a-f0-9]{40,64}$/.test(raw.sourceRevision) ||
    typeof raw.baselineBlobOid !== "string" ||
    !/^[a-f0-9]{40,64}$/.test(raw.baselineBlobOid) ||
    typeof raw.baselineFileDigest !== "string" ||
    !SHA256.test(raw.baselineFileDigest) ||
    typeof raw.baselineDigest !== "string" ||
    !SHA256.test(raw.baselineDigest) ||
    typeof raw.decisionId !== "string" ||
    !/^PLAN-L7-416:shadow-baseline:[a-z0-9-]+$/.test(raw.decisionId)
  ) {
    throw new Error("invalid handover resurrection baseline authority");
  }
  if (canonicalJson(raw) !== canonicalJson(BASELINE_AUTHORITY_PIN)) {
    throw new Error("handover resurrection baseline authority is not code-pinned");
  }
  return raw as ResurrectionBaselineAuthority;
}

function parsePreserveAuthority(text: string): ResurrectionPreserveAuthority {
  const raw = JSON.parse(text) as Partial<ResurrectionPreserveAuthority>;
  if (
    sha256(text) !== PRESERVE_AUTHORITY_FILE_DIGEST ||
    raw.schemaVersion !== "handover-preserve-authority.v1" ||
    raw.sourceRevision !== BASELINE_AUTHORITY_PIN.sourceRevision ||
    !Array.isArray(raw.entries) ||
    raw.entries.length === 0
  ) {
    throw new Error("invalid handover preserve authority");
  }
  const entries = raw.entries;
  for (const entry of entries) {
    if (
      !entry ||
      typeof entry.path !== "string" ||
      normalizedPath(entry.path) !== entry.path ||
      !["provider_evidence", "operations_transition"].includes(entry.kind) ||
      !SHA256.test(entry.digest)
    ) {
      throw new Error("invalid handover preserve authority entry");
    }
  }
  const sorted = [...entries].sort((a, b) => a.path.localeCompare(b.path));
  if (
    new Set(entries.map((entry) => entry.path)).size !== entries.length ||
    canonicalJson(entries) !== canonicalJson(sorted)
  ) {
    throw new Error("handover preserve authority entries are not canonical");
  }
  return raw as ResurrectionPreserveAuthority;
}

function parseEnforceAuthority(
  text: string,
  authorityPin: ResurrectionEnforceAuthority | null,
): ResurrectionEnforceAuthority {
  const raw = JSON.parse(text) as Partial<ResurrectionEnforceAuthority>;
  if (
    raw.schemaVersion !== "handover-resurrection-enforce-authority.v1" ||
    typeof raw.operationId !== "string" ||
    !raw.operationId.trim() ||
    typeof raw.intentDigest !== "string" ||
    !SHA256.test(raw.intentDigest) ||
    typeof raw.preserveDigest !== "string" ||
    !SHA256.test(raw.preserveDigest) ||
    typeof raw.archiveDigest !== "string" ||
    !SHA256.test(raw.archiveDigest) ||
    typeof raw.journalEntryDigest !== "string" ||
    !SHA256.test(raw.journalEntryDigest) ||
    typeof raw.approvalDecisionId !== "string" ||
    !/^handover-retirement-enforce:[a-zA-Z0-9:._-]+$/.test(raw.approvalDecisionId) ||
    raw.approvalStatus !== "approved"
  ) {
    throw new Error("invalid handover resurrection enforce authority");
  }
  if (authorityPin === null) {
    throw new Error("handover resurrection enforce authority is not code-pinned");
  }
  if (canonicalJson(raw) !== canonicalJson(authorityPin)) {
    throw new Error("handover resurrection enforce authority pin mismatch");
  }
  return raw as ResurrectionEnforceAuthority;
}

export function evaluateResurrectionCheckpointState(input: {
  journalText: string;
  expectedPreserveDigest: string;
  authorityText: string | null;
  authorityPin: ResurrectionEnforceAuthority | null;
}): ResurrectionCheckpointState {
  const { expectedPreserveDigest, journalText } = input;
  const pending = {
    completeCheckpoint: null,
    expectedOperationId: "journal-derived-after-cutover",
    expectedIntentDigest: sha256("pending-cutover-intent"),
    expectedPreserveDigest,
    expectedArchiveDigest: sha256("pending-archive-digest"),
  } satisfies ResurrectionCheckpointState;
  if (!journalText.trim()) return pending;
  const parsed = parseRetirementJournal(journalText);
  if (parsed.truncatedTail) throw new Error("retirement journal has truncated tail");
  const complete = parsed.entries.filter(
    (entry) => entry.phase === "complete" && entry.status === "completed",
  );
  if (complete.length === 0) return pending;
  const scopes = new Set(complete.map((entry) => `${entry.operationId}\0${entry.intentDigest}`));
  if (scopes.size !== 1 || complete.length !== 1) {
    throw new Error("retirement journal complete scope is ambiguous");
  }
  if (input.authorityText === null) {
    throw new Error("handover resurrection enforce authority is missing");
  }
  const authority = parseEnforceAuthority(input.authorityText, input.authorityPin);
  const terminal = complete[0];
  if (!terminal) throw new Error("retirement complete checkpoint missing");
  const latest = latestCompletedRetirementCheckpoint(parsed.entries, {
    operationId: authority.operationId,
    intentDigest: authority.intentDigest,
  });
  const scopedEntries = parsed.entries.filter(
    (entry) =>
      entry.operationId === authority.operationId && entry.intentDigest === authority.intentDigest,
  );
  const terminalLine = journalText
    .split(/\r?\n/)
    .find((line) => line.trim().length > 0 && sha256(line) === authority.journalEntryDigest);
  if (
    !terminalLine ||
    latest !== terminal ||
    scopedEntries.at(-1) !== terminal ||
    terminal.operationId !== authority.operationId ||
    terminal.intentDigest !== authority.intentDigest ||
    authority.preserveDigest !== expectedPreserveDigest
  ) {
    throw new Error("retirement enforce authority does not bind terminal checkpoint");
  }
  return {
    completeCheckpoint: {
      operationId: terminal.operationId,
      intentDigest: terminal.intentDigest,
      preserveDigest: authority.preserveDigest,
      archiveDigest: authority.archiveDigest,
    },
    expectedOperationId: authority.operationId,
    expectedIntentDigest: authority.intentDigest,
    expectedPreserveDigest,
    expectedArchiveDigest: authority.archiveDigest,
  };
}

export function loadResurrectionCheckpointState(
  repoRoot: string,
  expectedPreserveDigest: string,
): ResurrectionCheckpointState {
  const journalPath = join(repoRoot, ".helix", "audit", "session-handover-retirement.jsonl");
  if (!existsSync(journalPath)) {
    return evaluateResurrectionCheckpointState({
      journalText: "",
      expectedPreserveDigest,
      authorityText: null,
      authorityPin: ENFORCE_AUTHORITY_PIN,
    });
  }
  const authorityPath = join(repoRoot, "config", "handover-retirement-enforce-authority.json");
  return evaluateResurrectionCheckpointState({
    journalText: readFileSync(journalPath, "utf8"),
    expectedPreserveDigest,
    authorityText: existsSync(authorityPath) ? readFileSync(authorityPath, "utf8") : null,
    authorityPin: ENFORCE_AUTHORITY_PIN,
  });
}

export function verifyResurrectionBaselineAuthority(input: {
  repoRoot: string;
  baselineText: string;
  baseline: ResurrectionBaselineFile;
  authority: ResurrectionBaselineAuthority;
}): void {
  const { authority } = input;
  execFileSync("git", ["merge-base", "--is-ancestor", authority.sourceRevision, "HEAD"], {
    cwd: input.repoRoot,
    stdio: "ignore",
  });
  const blobOid = execFileSync(
    "git",
    ["rev-parse", `${authority.sourceRevision}:${authority.baselinePath}`],
    { cwd: input.repoRoot, encoding: "utf8" },
  ).trim();
  const anchoredText = execFileSync(
    "git",
    ["show", `${authority.sourceRevision}:${authority.baselinePath}`],
    { cwd: input.repoRoot, encoding: "utf8", maxBuffer: 4 * 1024 * 1024 },
  );
  if (
    blobOid !== authority.baselineBlobOid ||
    sha256(anchoredText) !== authority.baselineFileDigest ||
    input.baselineText !== anchoredText ||
    input.baseline.digest !== authority.baselineDigest
  ) {
    throw new Error("handover resurrection baseline authority mismatch");
  }
}

export function resurrectionMessages(result: ResurrectionAnalysis): string[] {
  const status = result.ok ? "OK" : "violation";
  return [
    `handover-resurrection - ${status}: mode=${result.mode} findings=${result.findings.length} known=${result.knownFindings.length} new=${result.newFindings.length} preconditions=${result.preconditionErrors.length}`,
    ...result.preconditionErrors.map(
      (error) => `handover-resurrection - violation: precondition=${error}`,
    ),
    ...result.newFindings
      .slice(0, 30)
      .map((item) => `handover-resurrection - violation: ${item.code}=${item.path}:${item.symbol}`),
  ];
}

export function analyzeHandoverResurrectionShadowRepo(repoRoot: string): ResurrectionAnalysis {
  const baselinePath = join(repoRoot, "config", "handover-resurrection-baseline.json");
  const baselineText = readFileSync(baselinePath, "utf8");
  const baseline = parseResurrectionBaselineFile(baselineText);
  const authority = parseResurrectionBaselineAuthority(
    readFileSync(join(repoRoot, "config", "handover-resurrection-authority.json"), "utf8"),
  );
  verifyResurrectionBaselineAuthority({ repoRoot, baselineText, baseline, authority });
  const inventory = collectRetirementPreserveInventory(repoRoot);
  const preserveAuthority = parsePreserveAuthority(
    readFileSync(join(repoRoot, "config", "handover-preserve-authority.json"), "utf8"),
  );
  const actualPaths = [
    ...inventory.providerPaths.map((path) => ({ path, kind: "provider_evidence" as const })),
    ...inventory.operationsPaths.map((path) => ({ path, kind: "operations_transition" as const })),
  ].sort((a, b) => a.path.localeCompare(b.path));
  const expectedPaths = preserveAuthority.entries.map(({ path, kind }) => ({ path, kind }));
  if (canonicalJson(actualPaths) !== canonicalJson(expectedPaths)) {
    throw new Error("handover preserve inventory drift");
  }
  for (const entry of preserveAuthority.entries) {
    if (sha256(readFileSync(join(repoRoot, entry.path), "utf8")) !== entry.digest) {
      throw new Error(`handover preserve authority digest mismatch: ${entry.path}`);
    }
  }
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
  const files = loadHandoverResurrectionFiles(repoRoot);
  const filesByPath = new Map(files.map((file) => [file.path, file]));
  const allowedArtifacts = preserve.entries.flatMap((entry): TypedAllowedArtifact[] => {
    const scannedFile = filesByPath.get(entry.path);
    const file = scannedFile ?? {
      path: entry.path,
      content: readFileSync(join(repoRoot, entry.path), "utf8"),
    };
    const validation =
      entry.kind === "provider_evidence"
        ? validateProviderEvidenceJson(file.content)
        : validateOperationsTransitionMarkdown(file.content);
    if (
      !validation.valid ||
      !entry.schemaValidation.ok ||
      entry.schemaValidation.exitCode !== 0 ||
      !entry.query.ok ||
      entry.query.exitCode !== 0 ||
      !entry.export.ok ||
      entry.export.exitCode !== 0 ||
      sha256(file.content) !== entry.originalDigest
    ) {
      throw new Error(`preserve validation failed for resurrection allowlist: ${entry.path}`);
    }
    if (!scannedFile) return [];
    return [
      {
        path: entry.path,
        kind: entry.kind,
        digest: entry.originalDigest,
        runtimeReadable: true,
        schemaValid: true,
        continuationJoined: false,
      },
    ];
  });
  return analyzeHandoverResurrection({
    files,
    allowedArtifacts,
    baseline,
    checkpointState: loadResurrectionCheckpointState(repoRoot, preserve.preservedDigest),
  });
}

export function resurrectionPolicyDigest(
  policy: ResurrectionPolicy = HANDOVER_RESURRECTION_POLICY,
): string {
  return sha256(canonicalJson(policy));
}

function validatePolicy(policy: ResurrectionPolicy): string[] {
  const errors: string[] = [];
  if (
    policy.schemaVersion !== "handover-resurrection-policy.v1" ||
    !policy.detectorPolicyVersion.trim()
  ) {
    errors.push("policy_version_invalid");
  }
  for (const [category, values] of Object.entries(policy.forbidden)) {
    if (
      !Array.isArray(values) ||
      values.length === 0 ||
      values.some((value) => typeof value !== "string" || value.trim().length === 0) ||
      new Set(values).size !== values.length
    ) {
      errors.push(`policy_category_invalid:${category}`);
    }
  }
  return errors;
}

export function deriveResurrectionMode(state: ResurrectionCheckpointState): {
  mode: ResurrectionMode;
  errors: string[];
} {
  if (!state.completeCheckpoint) return { mode: "pre_cutover_shadow", errors: [] };
  const checkpoint = state.completeCheckpoint;
  const errors: string[] = [];
  if (checkpoint.operationId !== state.expectedOperationId) errors.push("operation_mismatch");
  if (checkpoint.intentDigest !== state.expectedIntentDigest) errors.push("intent_mismatch");
  if (checkpoint.preserveDigest !== state.expectedPreserveDigest)
    errors.push("preserve_digest_mismatch");
  if (checkpoint.archiveDigest !== state.expectedArchiveDigest)
    errors.push("archive_digest_mismatch");
  return errors.length > 0
    ? { mode: "invalid_precondition", errors }
    : { mode: "post_complete_enforce", errors: [] };
}

function stringValue(node: ts.Node): string | null {
  return ts.isStringLiteralLike(node) ? node.text : null;
}

function staticString(node: ts.Expression, constants: ReadonlyMap<string, string>): string | null {
  if (ts.isStringLiteralLike(node)) return node.text;
  if (ts.isIdentifier(node)) return constants.get(node.text) ?? null;
  if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.PlusToken) {
    const left = staticString(node.left, constants);
    const right = staticString(node.right, constants);
    return left === null || right === null ? null : `${left}${right}`;
  }
  if (ts.isTemplateExpression(node)) {
    let value = node.head.text;
    for (const span of node.templateSpans) {
      const expression = staticString(span.expression, constants);
      if (expression === null) return null;
      value += expression + span.literal.text;
    }
    return value;
  }
  if (ts.isCallExpression(node) && /^(?:join|resolve)$/.test(callName(node))) {
    const values = node.arguments.map((argument) => staticString(argument, constants));
    return values.some((value) => value === null) ? null : values.join("/").replace(/\/+/g, "/");
  }
  return null;
}

function callName(node: ts.CallExpression): string {
  const expression = node.expression;
  if (ts.isIdentifier(expression)) return expression.text;
  if (ts.isPropertyAccessExpression(expression)) return expression.name.text;
  return "";
}

function scanTypeScript(file: ResurrectionFile, policy: ResurrectionPolicy): ResurrectionFinding[] {
  const path = normalizedPath(file.path);
  if (path === "src/lint/handover-resurrection.ts") return [];
  const source = ts.createSourceFile(path, file.content, ts.ScriptTarget.Latest, true);
  const findings: ResurrectionFinding[] = [];
  const constants = new Map<string, string>();
  const collectConstants = (node: ts.Node): void => {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.initializer &&
      staticString(node.initializer, constants) !== null
    ) {
      constants.set(node.name.text, staticString(node.initializer, constants) ?? "");
    }
    ts.forEachChild(node, collectConstants);
  };
  collectConstants(source);
  const add = (category: ResurrectionCategory, symbol: string, evidence: string) =>
    findings.push(finding({ category, path, symbol, evidence }));
  const visit = (node: ts.Node): void => {
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
      const moduleName = node.moduleSpecifier ? stringValue(node.moduleSpecifier) : null;
      if (
        moduleName &&
        !moduleName.includes("provider-handover") &&
        policy.forbidden.modules.some(
          (token) =>
            moduleName === token ||
            moduleName.includes("/handover") ||
            moduleName.endsWith(`/${token.replace(/^\.\.\//, "")}`),
        )
      ) {
        add("module", moduleName, node.getText(source));
      }
    }
    if (ts.isCallExpression(node)) {
      if (
        node.expression.kind === ts.SyntaxKind.ImportKeyword &&
        node.arguments.some((argument) => {
          const moduleName = staticString(argument, constants) ?? "";
          return policy.forbidden.modules.includes(moduleName) || moduleName.includes("/handover");
        })
      ) {
        add("module", "dynamic import", node.getText(source));
      }
      const name = callName(node);
      const strings = node.arguments
        .map((argument) => staticString(argument, constants))
        .filter((value): value is string => value !== null);
      if (
        strings.some((value) => policy.forbidden.commands.includes(value)) &&
        /command|route|case|option/i.test(name || node.parent.getText(source).slice(0, 80))
      ) {
        add(
          "command",
          strings.find((value) => policy.forbidden.commands.includes(value)) ?? "",
          node.getText(source),
        );
      }
      if (
        policy.forbidden.writerSymbols.includes(name) &&
        strings.some((value) =>
          value.replace(/\\/g, "/").replace(/\/+/g, "/").includes("handover/CURRENT.json"),
        )
      ) {
        add("writer", name, node.getText(source));
      }
    }
    if (ts.isIdentifier(node)) {
      if (policy.forbidden.symbols.includes(node.text))
        add("symbol", node.text, node.getText(source));
      if (policy.forbidden.schemas.includes(node.text))
        add("schema", node.text, node.getText(source));
      if (policy.forbidden.panels.includes(node.text))
        add("panel", node.text, node.getText(source));
    }
    if (ts.isStringLiteralLike(node) && node.text === "CURRENT.json") {
      const ancestry = node.parent.parent?.getText(source) ?? node.parent.getText(source);
      if (/handover/i.test(ancestry)) add("schema", "CURRENT.json", ancestry);
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return findings;
}

function scanGeneratedSurface(
  file: ResurrectionFile,
  policy: ResurrectionPolicy,
): ResurrectionFinding[] {
  const path = normalizedPath(file.path);
  const findings: ResurrectionFinding[] = [];
  for (const token of policy.forbidden.generatedTokens) {
    if (file.content.toLowerCase().includes(token.toLowerCase())) {
      findings.push(
        finding({ category: "generated_surface", path, symbol: token, evidence: token }),
      );
    }
  }
  return findings;
}

function scanPaths(
  files: readonly ResurrectionFile[],
  policy: ResurrectionPolicy,
): ResurrectionFinding[] {
  const findings: ResurrectionFinding[] = [];
  for (const file of files) {
    const path = normalizedPath(file.path);
    const lowerPath = path.toLowerCase();
    const forbiddenPath = policy.forbidden.paths.some(
      (forbidden) =>
        lowerPath === forbidden.toLowerCase() ||
        lowerPath.startsWith(`${forbidden.toLowerCase()}/`),
    );
    if (forbiddenPath) {
      findings.push(finding({ category: "path", path, symbol: path, evidence: path }));
    } else if (/(?:^|\/)handover(?:\/|[-_.])/i.test(path)) {
      findings.push(finding({ category: "unclassified", path, symbol: path, evidence: path }));
    }
  }
  return findings;
}

function validateAllowedArtifacts(
  files: readonly ResurrectionFile[],
  allowed: readonly TypedAllowedArtifact[],
): string[] {
  const errors: string[] = [];
  const filesByPath = new Map(files.map((file) => [normalizedPath(file.path), file]));
  for (const artifact of allowed) {
    const path = normalizedPath(artifact.path);
    const pathMatchesKind =
      (artifact.kind === "provider_evidence" && path.startsWith(".helix/handover/provider/")) ||
      (artifact.kind === "operations_transition" &&
        (path.startsWith("docs/design/harness/L11-operations/") ||
          path.startsWith("docs/design/harness/L14-operations/"))) ||
      (artifact.kind === "legacy_archive" && path.startsWith("docs/archive/handover/"));
    if (
      !SHA256.test(artifact.digest) ||
      !pathMatchesKind ||
      (artifact.kind === "legacy_archive" && artifact.runtimeReadable) ||
      !artifact.schemaValid ||
      artifact.continuationJoined ||
      (artifact.kind !== "legacy_archive" &&
        !["provider_evidence", "operations_transition"].includes(artifact.kind))
    ) {
      errors.push(`allowlist_invalid:${path}`);
      continue;
    }
    const file = filesByPath.get(path);
    if (!file) {
      errors.push(`allowlist_missing:${path}`);
      continue;
    }
    if (sha256(file.content) !== artifact.digest) errors.push(`allowlist_digest_mismatch:${path}`);
  }
  return errors;
}

export function analyzeHandoverResurrection(input: {
  files: readonly ResurrectionFile[];
  allowedArtifacts: readonly TypedAllowedArtifact[];
  baseline: ResurrectionBaseline;
  checkpointState: ResurrectionCheckpointState;
  policy?: ResurrectionPolicy;
}): ResurrectionAnalysis {
  const policy = input.policy ?? HANDOVER_RESURRECTION_POLICY;
  const preconditionErrors: string[] = [...validatePolicy(policy)];
  const expectedBaselineDigest = sha256(canonicalJson([...input.baseline.fingerprints].sort()));
  if (input.baseline.digest !== expectedBaselineDigest)
    preconditionErrors.push("baseline_digest_invalid");
  preconditionErrors.push(...validateAllowedArtifacts(input.files, input.allowedArtifacts));
  const mode = deriveResurrectionMode(input.checkpointState);
  preconditionErrors.push(...mode.errors.map((error) => `checkpoint_${error}`));

  const allowedPaths = new Set(
    input.allowedArtifacts.map((artifact) => normalizedPath(artifact.path)),
  );
  const liveFiles = input.files.filter((file) => !allowedPaths.has(normalizedPath(file.path)));
  const allowedSemanticFindings = input.allowedArtifacts.flatMap((artifact) => {
    const file = input.files.find(
      (candidate) => normalizedPath(candidate.path) === normalizedPath(artifact.path),
    );
    if (!file) return [];
    return [
      ...scanGeneratedSurface(file, policy),
      ...(/\.[cm]?[jt]sx?$/.test(file.path) ? scanTypeScript(file, policy) : []),
    ];
  });
  const findings = [
    ...allowedSemanticFindings,
    ...scanPaths(liveFiles, policy),
    ...liveFiles.flatMap((file) => [
      ...scanGeneratedSurface(file, policy),
      ...(/\.[cm]?[jt]sx?$/.test(file.path) ? scanTypeScript(file, policy) : []),
    ]),
  ];
  const unique = [...new Map(findings.map((item) => [item.fingerprint, item])).values()].sort(
    (a, b) => a.path.localeCompare(b.path) || a.code.localeCompare(b.code),
  );
  const baselineSet = new Set(input.baseline.fingerprints);
  const knownFindings = unique.filter((item) => baselineSet.has(item.fingerprint));
  const newFindings = unique.filter((item) => !baselineSet.has(item.fingerprint));
  const ok =
    preconditionErrors.length === 0 &&
    (mode.mode === "pre_cutover_shadow"
      ? newFindings.length === 0
      : mode.mode === "post_complete_enforce" && unique.length === 0);
  return {
    ok,
    mode: preconditionErrors.length > 0 ? "invalid_precondition" : mode.mode,
    findings: unique,
    knownFindings,
    newFindings,
    preconditionErrors,
    policyDigest: resurrectionPolicyDigest(policy),
  };
}

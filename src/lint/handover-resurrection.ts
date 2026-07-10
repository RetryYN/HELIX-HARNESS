import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { extname, join, posix } from "node:path";
import ts from "typescript";

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
  const baseline = parseResurrectionBaselineFile(readFileSync(baselinePath, "utf8"));
  return analyzeHandoverResurrection({
    files: loadHandoverResurrectionFiles(repoRoot),
    allowedArtifacts: [],
    baseline,
    checkpointState: {
      completeCheckpoint: null,
      expectedOperationId: "journal-derived-after-cutover",
      expectedIntentDigest: sha256("pending-cutover-intent"),
      expectedPreserveDigest: sha256("pending-preserve-digest"),
      expectedArchiveDigest: sha256("pending-archive-digest"),
    },
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

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import ts from "typescript";
import {
  importedSourceModule,
  lineOf,
  normalizePath,
  SOURCE_BOUNDARY_MODULES,
  sourceModule,
} from "./shared";
import {
  type BoundaryPolicy,
  evaluateSourceBoundary,
  type ModuleCatalog,
} from "./source-boundary-policy";
import { extractSourceEdges } from "./source-edge-extractor";

export const SOURCE_MODULE_CATALOG: ModuleCatalog = {
  owners: SOURCE_BOUNDARY_MODULES,
  ownerOf: sourceModule,
  resolve: importedSourceModule,
};

const ALLOWED_SOURCE_DIRECTIONS: Readonly<Record<string, readonly string[]>> = {
  assets: ["lint", "search", "state-db"],
  audit: ["lint", "runtime", "security", "setup", "shared"],
  cli: [
    "assets",
    "audit",
    "cli",
    "doctor",
    "feedback",
    "gate",
    "graph",
    "lint",
    "memory",
    "orchestration",
    "plan",
    "policy",
    "runtime",
    "search",
    "setup",
    "shared",
    "skill-engine",
    "skills",
    "state-db",
    "task",
    "team",
    "vmodel",
    "vscode",
    "workflow",
  ],
  config: ["config"],
  context: ["task"],
  doctor: [
    "audit",
    "config",
    "doctor",
    "lint",
    "orchestration",
    "plan",
    "runtime",
    "schema",
    "setup",
    "state-db",
    "task",
    "team",
    "vmodel",
    "vscode",
  ],
  export: ["lint"],
  feedback: ["feedback", "policy", "runtime", "shared", "state-db"],
  gate: ["gate", "lint", "plan", "runtime", "schema", "vmodel"],
  graph: ["lint", "vmodel"],
  guardrail: ["shared", "state-db"],
  lint: ["config", "lint", "policy", "schema", "security", "shared"],
  memory: ["memory", "security", "shared", "state-db"],
  orchestration: ["orchestration", "runtime", "schema", "task", "team"],
  plan: ["lint", "plan", "schema", "state-db"],
  policy: ["policy", "security", "shared"],
  runtime: ["memory", "policy", "runtime", "schema", "shared", "state-db"],
  schema: ["schema", "shared"],
  search: ["security", "state-db"],
  setup: ["setup", "shared"],
  "skill-engine": ["lint"],
  skills: ["shared", "state-db", "task"],
  "state-db": [
    "config",
    "export",
    "graph",
    "lint",
    "policy",
    "schema",
    "security",
    "shared",
    "state-db",
  ],
  task: ["runtime", "task", "team", "workflow"],
  team: ["orchestration", "runtime", "schema", "team", "workflow"],
  vmodel: ["lint", "plan", "runtime", "schema"],
  vscode: ["vscode"],
  web: ["web"],
  workflow: ["schema", "shared", "state-db", "workflow"],
};

const TEMPORARY_SOURCE_DIRECTIONS = [
  { from: "state-db", to: "vscode" },
  { from: "vscode", to: "state-db" },
] as const;

export const SOURCE_MODULE_POLICY: BoundaryPolicy = {
  defaults: Object.fromEntries(SOURCE_BOUNDARY_MODULES.map((owner) => [owner, "deny"])),
  evaluated_at: new Date().toISOString(),
  exceptions: [
    ...Object.entries(ALLOWED_SOURCE_DIRECTIONS).flatMap(([from, destinations]) =>
      destinations.map((to) => ({
        from,
        to,
        decision: "allow" as const,
        owner: "coding-rules",
        rationale: "reviewed live architecture direction",
        review_trigger: "source module catalog or ownership changes",
      })),
    ),
    ...TEMPORARY_SOURCE_DIRECTIONS.map(({ from, to }) => ({
      from,
      to,
      decision: "allow" as const,
      owner: "PLAN-L7-450-state-db-vscode-decoupling",
      rationale: "temporary architecture-cycle migration",
      review_trigger: "PLAN-L7-450 terminal or ownership changes",
      expiry: "2026-08-01T00:00:00Z",
      successor_plan: "PLAN-L7-450-state-db-vscode-decoupling",
    })),
  ],
};

export type CodingRulesScope = "source" | "test";

export interface CodingRulesDoc {
  path: string;
  text: string;
  scope: CodingRulesScope;
}

export interface CodingRuleViolation {
  path: string;
  line: number;
  rule: string;
  message: string;
}

export interface CodingRulesResult {
  checked: number;
  violations: CodingRuleViolation[];
  ok: boolean;
}

export interface CodingRulesPolicy {
  path: string;
  ruleIds: string[];
}

export interface CodingWorkflowDoc {
  path: string;
  text: string;
  exists: boolean;
}

interface WorkflowPatternRequirement {
  pattern: RegExp;
  message: string;
}

interface WorkflowDocRequirement {
  path: string;
  patterns: WorkflowPatternRequirement[];
}

const REQUIRED_RULE_IDS = [
  "no-explicit-any",
  "no-suppression-comment",
  "file-name-kebab",
  "max-source-params",
  "structured-error-handling",
  "module-boundary",
  "no-circular-dependency",
  "machine-surface-language",
];
const REQUIRED_WORKFLOW_DOCS: WorkflowDocRequirement[] = [
  {
    path: normalizePath(join("docs", "governance", "coding-rules.md")),
    patterns: [
      {
        pattern: /Workflow Placement/,
        message: "Coding-rule SSoT must define workflow placement.",
      },
      { pattern: /Forward L6/, message: "Coding-rule SSoT must anchor the Forward L6 timing." },
      { pattern: /Add-feature/, message: "Coding-rule SSoT must anchor Add-feature timing." },
    ],
  },
  {
    path: normalizePath(join("docs", "process", "forward", "L00-L06-design-phase.md")),
    patterns: [
      {
        pattern: /CODING-RULE-WORKFLOW/,
        message: "Forward workflow must carry the coding-rule anchor.",
      },
      {
        pattern: /docs\/governance\/coding-rules\.md/,
        message: "Forward workflow must reference the coding-rule SSoT.",
      },
    ],
  },
  {
    path: normalizePath(join("docs", "process", "modes", "add-feature.md")),
    patterns: [
      {
        pattern: /CODING-RULE-WORKFLOW/,
        message: "Add-feature workflow must carry the coding-rule anchor.",
      },
      {
        pattern: /docs\/governance\/coding-rules\.md/,
        message: "Add-feature workflow must reference the coding-rule SSoT.",
      },
      {
        pattern: /add-design/,
        message: "Add-feature workflow must place coding rules in add-design.",
      },
      { pattern: /add-impl/, message: "Add-feature workflow must gate add-impl on coding rules." },
    ],
  },
];
const SUPPRESSION_TOKENS = [
  ["@ts", "-ignore"].join(""),
  ["@ts", "-expect-error"].join(""),
  ["eslint", "-disable"].join(""),
  ["biome", "-ignore"].join(""),
];
const SUPPRESSION_PATTERN = new RegExp(SUPPRESSION_TOKENS.join("|"));
const KEBAB_TS_FILE_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*(?:\.test)?\.ts$/;
const MACHINE_SURFACE_LINE_PATTERN =
  /^\s*(?:doctor:\s*)?[a-z][a-z0-9-]*(?:\s+[a-z0-9-]+)?\s*(?:-|—)/i;
const NON_ASCII_DECISION_WORD_PATTERN = /警告|成功|失敗|承認|却下|未完了|完了/;
const ASCII_DECISION_TOKEN_PATTERN =
  /\b(OK|violation|warning|skipped|note|error|ready|not ready|completed|confirmed|draft|accepted|rejected|blocked|PASS|FAIL|green|red)\b/i;
function firstMatchingLine(text: string, pattern: RegExp): number {
  const lines = text.split(/\r?\n/);
  for (let i = 0; i < lines.length; i += 1) {
    if (pattern.test(lines[i])) return i + 1;
  }
  return 1;
}

function fileNameAllowed(path: string): boolean {
  const name = basename(path);
  return name === "index.ts" || KEBAB_TS_FILE_PATTERN.test(name);
}

function isFunctionLike(node: ts.Node): node is ts.FunctionLikeDeclaration {
  return (
    ts.isFunctionDeclaration(node) ||
    ts.isFunctionExpression(node) ||
    ts.isArrowFunction(node) ||
    ts.isMethodDeclaration(node) ||
    ts.isConstructorDeclaration(node)
  );
}

function catchHasOnlyThrow(block: ts.Block): boolean {
  return block.statements.length === 1 && ts.isThrowStatement(block.statements[0]);
}

function catchHasComment(block: ts.Block, sourceFile: ts.SourceFile): boolean {
  const text = block.getFullText(sourceFile);
  return text.includes("//") || text.includes("/*");
}

function machineSurfaceText(node: ts.Node, sourceFile: ts.SourceFile): string | null {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  if (!ts.isTemplateExpression(node)) return null;
  return node.getText(sourceFile).slice(1, -1);
}

function violatesMachineSurfaceLanguage(text: string): boolean {
  if (!MACHINE_SURFACE_LINE_PATTERN.test(text)) return false;
  if (!NON_ASCII_DECISION_WORD_PATTERN.test(text)) return false;
  return !ASCII_DECISION_TOKEN_PATTERN.test(text);
}

function isTestTitleLiteral(node: ts.Node): boolean {
  if (!ts.isStringLiteral(node) && !ts.isNoSubstitutionTemplateLiteral(node)) return false;
  const parent = node.parent;
  if (!ts.isCallExpression(parent) || parent.arguments[0] !== node) return false;
  return (
    ts.isIdentifier(parent.expression) &&
    ["describe", "it", "test"].includes(parent.expression.text)
  );
}

function collectTsDocs(
  repoRoot: string,
  relDir: string,
  scope: CodingRulesScope,
): CodingRulesDoc[] {
  const root = join(repoRoot, relDir);
  if (!existsSync(root)) return [];
  const docs: CodingRulesDoc[] = [];
  const visit = (absDir: string, relPrefix: string): void => {
    for (const entry of readdirSync(absDir, { withFileTypes: true })) {
      const relPath = normalizePath(join(relPrefix, entry.name));
      const absPath = join(absDir, entry.name);
      if (entry.isDirectory()) {
        visit(absPath, relPath);
        continue;
      }
      if (!entry.isFile() || !entry.name.endsWith(".ts")) continue;
      docs.push({ path: relPath, text: readFileSync(absPath, "utf8"), scope });
    }
  };
  visit(root, relDir);
  return docs.sort((a, b) => a.path.localeCompare(b.path));
}

function resolveSourceImportPath(
  fromPath: string,
  specifier: string,
  knownPaths: ReadonlySet<string>,
): string | null {
  if (!specifier.startsWith(".")) return null;
  const base = normalizePath(join(dirname(fromPath), specifier));
  const candidates = [`${base}.ts`, normalizePath(join(base, "index.ts"))];
  return candidates.find((candidate) => knownPaths.has(candidate)) ?? null;
}

function cycleKey(cycle: string[]): string {
  const body = cycle.slice(0, -1);
  const rotations = body.map((_, index) => [...body.slice(index), ...body.slice(0, index)]);
  const canonical = rotations.map((rotation) => [...rotation, rotation[0]].join(" -> ")).sort()[0];
  return canonical ?? cycle.join(" -> ");
}

const GRANDFATHERED_CIRCULAR_DEPENDENCY_KEYS: ReadonlySet<string> = new Set(
  [
    [
      "src/lint/proposal-document-coverage.ts",
      "src/lint/proposal-document-coverage-policy.ts",
      "src/lint/proposal-document-coverage.ts",
    ],
    ["src/runtime/adapter.ts", "src/runtime/adapter-policy.ts", "src/runtime/adapter.ts"],
    ["src/runtime/detect.ts", "src/runtime/adapter.ts", "src/runtime/detect.ts"],
    [
      "src/schema/harness-db.ts",
      "src/schema/harness-db-catalog.ts",
      "src/schema/harness-db-indexes.ts",
      "src/schema/harness-db.ts",
    ],
    [
      "src/schema/harness-db.ts",
      "src/schema/harness-db-catalog.ts",
      "src/schema/harness-db-tables-core.ts",
      "src/schema/harness-db.ts",
    ],
    [
      "src/schema/harness-db.ts",
      "src/schema/harness-db-catalog.ts",
      "src/schema/harness-db-tables-evaluation.ts",
      "src/schema/harness-db.ts",
    ],
    [
      "src/schema/harness-db.ts",
      "src/schema/harness-db-catalog.ts",
      "src/schema/harness-db-tables-graph.ts",
      "src/schema/harness-db.ts",
    ],
    ["src/setup/index.ts", "src/setup/templates.ts", "src/setup/index.ts"],
    ["src/task/classify.ts", "src/task/classify-policy.ts", "src/task/classify.ts"],
    [
      "src/task/classify.ts",
      "src/task/classify-policy.ts",
      "src/task/proposal-coverage-data.ts",
      "src/task/proposal-document-pack-types.ts",
      "src/task/classify.ts",
    ],
    ["src/task/tier-router.ts", "src/task/tier-router-policy.ts", "src/task/tier-router.ts"],
    ["src/team/model-policy.ts", "src/team/run.ts", "src/team/model-policy.ts"],
  ].map(cycleKey),
);

function circularDependencyViolations(docs: CodingRulesDoc[]): CodingRuleViolation[] {
  const sourceDocs = docs.filter((doc) => doc.scope === "source");
  const knownPaths = new Set(sourceDocs.map((doc) => doc.path));
  const byPath = new Map(sourceDocs.map((doc) => [doc.path, doc]));
  const graph = new Map(sourceDocs.map((doc) => [doc.path, [] as string[]]));

  for (const doc of sourceDocs) {
    const sourceFile = ts.createSourceFile(doc.path, doc.text, ts.ScriptTarget.Latest, true);
    const visit = (node: ts.Node): void => {
      if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
        const resolved = resolveSourceImportPath(doc.path, node.moduleSpecifier.text, knownPaths);
        if (resolved) graph.get(doc.path)?.push(resolved);
      }
      ts.forEachChild(node, visit);
    };
    visit(sourceFile);
  }

  const visiting = new Set<string>();
  const visited = new Set<string>();
  const reported = new Set<string>();
  const violations: CodingRuleViolation[] = [];
  const stack: string[] = [];

  const visit = (path: string): void => {
    if (visited.has(path)) return;
    if (visiting.has(path)) {
      const start = stack.indexOf(path);
      if (start < 0) return;
      const cycle = [...stack.slice(start), path];
      const key = cycleKey(cycle);
      if (GRANDFATHERED_CIRCULAR_DEPENDENCY_KEYS.has(key)) return;
      if (reported.has(key)) return;
      reported.add(key);
      violations.push({
        path,
        line: 1,
        rule: "no-circular-dependency",
        message: `Circular source import detected: ${cycle.join(" -> ")}.`,
      });
      return;
    }

    visiting.add(path);
    stack.push(path);
    for (const next of graph.get(path) ?? []) {
      visit(next);
    }
    stack.pop();
    visiting.delete(path);
    visited.add(path);
  };

  for (const path of byPath.keys()) {
    visit(path);
  }

  return violations.sort((a, b) => a.message.localeCompare(b.message));
}

export function loadCodingRuleDocs(repoRoot: string = process.cwd()): CodingRulesDoc[] {
  return [...collectTsDocs(repoRoot, "src", "source"), ...collectTsDocs(repoRoot, "tests", "test")];
}

export function loadCodingRulePolicy(repoRoot: string = process.cwd()): CodingRulesPolicy | null {
  const path = normalizePath(join("docs", "governance", "coding-rules.md"));
  const absPath = join(repoRoot, path);
  if (!existsSync(absPath)) return null;
  const text = readFileSync(absPath, "utf8");
  const ruleIds = [...text.matchAll(/^\s*-\s+id:\s*([a-z0-9-]+)\s*$/gm)].map((m) => m[1]);
  return { path, ruleIds };
}

export function loadCodingWorkflowDocs(repoRoot: string = process.cwd()): CodingWorkflowDoc[] {
  return REQUIRED_WORKFLOW_DOCS.map((requirement) => {
    const absPath = join(repoRoot, requirement.path);
    const exists = existsSync(absPath);
    return {
      path: requirement.path,
      text: exists ? readFileSync(absPath, "utf8") : "",
      exists,
    };
  });
}

function policyViolations(policy: CodingRulesPolicy | null): CodingRuleViolation[] {
  if (!policy) {
    return [
      {
        path: normalizePath(join("docs", "governance", "coding-rules.md")),
        line: 1,
        rule: "coding-policy-missing",
        message: "Coding-rule SSoT document is missing.",
      },
    ];
  }
  const declared = new Set(policy.ruleIds);
  const required = new Set(REQUIRED_RULE_IDS);
  const violations: CodingRuleViolation[] = [];
  for (const id of REQUIRED_RULE_IDS) {
    if (declared.has(id)) continue;
    violations.push({
      path: policy.path,
      line: 1,
      rule: "coding-policy-missing-rule",
      message: `Coding-rule SSoT is missing required rule id ${id}.`,
    });
  }
  for (const id of policy.ruleIds) {
    if (required.has(id)) continue;
    violations.push({
      path: policy.path,
      line: 1,
      rule: "coding-policy-unknown-rule",
      message: `Coding-rule SSoT declares unknown rule id ${id}.`,
    });
  }
  return violations;
}

function workflowViolations(docs: CodingWorkflowDoc[]): CodingRuleViolation[] {
  const byPath = new Map(docs.map((doc) => [doc.path, doc]));
  const violations: CodingRuleViolation[] = [];
  for (const requirement of REQUIRED_WORKFLOW_DOCS) {
    const doc = byPath.get(requirement.path);
    if (!doc?.exists) {
      violations.push({
        path: requirement.path,
        line: 1,
        rule: "coding-workflow-missing-doc",
        message: "Coding-rule workflow placement document is missing.",
      });
      continue;
    }
    for (const patternRequirement of requirement.patterns) {
      if (patternRequirement.pattern.test(doc.text)) continue;
      violations.push({
        path: requirement.path,
        line: 1,
        rule: "coding-workflow-missing-reference",
        message: patternRequirement.message,
      });
    }
  }
  return violations;
}

export function analyzeCodingRules(
  docs: CodingRulesDoc[],
  policy: CodingRulesPolicy | null = { path: "<default>", ruleIds: REQUIRED_RULE_IDS },
  workflowDocs: CodingWorkflowDoc[] = [],
): CodingRulesResult {
  const violations: CodingRuleViolation[] = [];
  violations.push(...policyViolations(policy));
  if (workflowDocs.length > 0) {
    violations.push(...workflowViolations(workflowDocs));
  }
  violations.push(...circularDependencyViolations(docs));
  for (const doc of docs) {
    if (!fileNameAllowed(doc.path)) {
      violations.push({
        path: doc.path,
        line: 1,
        rule: "file-name-kebab",
        message: "TypeScript file names must be kebab-case or index.ts.",
      });
    }

    if (SUPPRESSION_PATTERN.test(doc.text)) {
      violations.push({
        path: doc.path,
        line: firstMatchingLine(doc.text, SUPPRESSION_PATTERN),
        rule: "no-suppression-comment",
        message: "TypeScript or linter suppression comments are prohibited in checked code.",
      });
    }

    const sourceFile = ts.createSourceFile(doc.path, doc.text, ts.ScriptTarget.Latest, true);
    if (doc.scope === "source") {
      for (const edge of extractSourceEdges([{ path: doc.path, source: doc.text }])) {
        if (edge.specifier !== null && !edge.specifier.startsWith(".")) continue;
        const decision = evaluateSourceBoundary(edge, SOURCE_MODULE_CATALOG, SOURCE_MODULE_POLICY);
        if (decision.decision !== "allow") {
          violations.push({
            path: doc.path,
            line: edge.line,
            rule: "module-boundary",
            message: `Module boundary ${decision.decision}: ${decision.from_owner ?? "unknown"} -> ${decision.to_owner ?? "unknown"} (${decision.reason}).`,
          });
        }
      }
    }
    const visit = (node: ts.Node): void => {
      if (node.kind === ts.SyntaxKind.AnyKeyword) {
        violations.push({
          path: doc.path,
          line: lineOf(sourceFile, node.getStart(sourceFile)),
          rule: "no-explicit-any",
          message: "Use unknown, a generic, or a concrete type instead of explicit any.",
        });
      }
      const surfaceText = machineSurfaceText(node, sourceFile);
      if (surfaceText && !isTestTitleLiteral(node) && violatesMachineSurfaceLanguage(surfaceText)) {
        violations.push({
          path: doc.path,
          line: lineOf(sourceFile, node.getStart(sourceFile)),
          rule: "machine-surface-language",
          message:
            "Machine-facing status messages must carry ASCII English decision tokens such as OK, violation, warning, skipped, or note.",
        });
      }
      if (doc.scope === "source" && isFunctionLike(node) && node.parameters.length > 3) {
        violations.push({
          path: doc.path,
          line: lineOf(sourceFile, node.getStart(sourceFile)),
          rule: "max-source-params",
          message: "Source functions may accept at most 3 parameters; use an input object.",
        });
      }
      if (
        doc.scope === "source" &&
        ts.isCatchClause(node) &&
        ((node.block.statements.length === 0 && !catchHasComment(node.block, sourceFile)) ||
          catchHasOnlyThrow(node.block))
      ) {
        violations.push({
          path: doc.path,
          line: lineOf(sourceFile, node.getStart(sourceFile)),
          rule: "structured-error-handling",
          message:
            "Catch blocks must record, convert, return explicit failure state, or document fail-open intent; undocumented empty or rethrow-only catch is prohibited.",
        });
      }
      ts.forEachChild(node, visit);
    };
    visit(sourceFile);
  }
  return { checked: docs.length, violations, ok: violations.length === 0 };
}

export function codingRulesMessages(result: CodingRulesResult): string[] {
  if (result.ok) {
    return [`coding-rules — OK (TS docs ${result.checked}, violations 0)`];
  }
  const sample = result.violations
    .slice(0, 8)
    .map((v) => `${v.path}:${v.line}:${v.rule}`)
    .join(", ");
  return [
    `coding-rules — violation ${result.violations.length} (${sample}). Follow requirements coding-rule SSoT.`,
  ];
}

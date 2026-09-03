import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, realpathSync } from "node:fs";
import { join, relative, resolve, sep } from "node:path";
import type * as TS from "typescript";
import { parse as parseYaml } from "yaml";
import { canonicalJson, type Sha256Digest } from "../shared/canonical-digest";
import ts from "../shared/typescript-lazy";
import { extractExecutableOracleCases } from "./plan-specific-vpair-binding";
import { markdownFrontmatter } from "./shared";

export const DESIGN_REALITY_BINDING_MARKER = "HELIX:design-reality-binding:v1";
export const DESIGN_REALITY_BINDING_ACTIVATION_DATE = "2026-08-03";
export const DESIGN_REALITY_BINDING_ACTIVATION_COMMIT = "3859c339ec4844cc9a1e713e99450f28fd6ca7aa";
export const DESIGN_REALITY_EMPTY_FAILURE_BINDING_BASELINE_PATH =
  "config/design-reality-binding-empty-baseline.json";
export const DESIGN_REALITY_EMPTY_FAILURE_BINDING_SCHEMA_VERSION =
  "helix-design-reality-binding-empty-baseline.v1";

export interface DesignRealityEmptyFailureBindingBaseline {
  schema_version: typeof DESIGN_REALITY_EMPTY_FAILURE_BINDING_SCHEMA_VERSION;
  entries: string[];
  baseline_digest: Sha256Digest;
}

/**
 * 既存の空 failure binding は、実装済み failure が存在しないことを意味しない。
 * 既存設計の未materialize負債として初期集合をコードにも固定し、新規追加を
 * configだけで隠せないようにする。修正済みentryはconfigから削除して集合を縮小する。
 */
export const INITIAL_DESIGN_REALITY_EMPTY_FAILURE_BINDING_BASELINE: ReadonlyArray<string> = [
  "docs/design/helix/L4-basic-design/ai-decision-proposal-authority.md",
  "docs/design/helix/L4-basic-design/bounded-probe-history.md",
  "docs/design/helix/L4-basic-design/derived-requirement-trace.md",
  "docs/design/helix/L4-basic-design/design-reality-binding.md",
  "docs/design/helix/L4-basic-design/event-projection-checkpoint-replay.md",
  "docs/design/helix/L4-basic-design/measurement-evidence-evaluator.md",
  "docs/design/helix/L4-basic-design/nfr-typed-registry-quality-taxonomy.md",
  "docs/design/helix/L4-basic-design/project-hook-authority-boundary.md",
  "docs/design/helix/L4-basic-design/python-semantic-core-node-boundary.md",
  "docs/design/helix/L4-basic-design/requirement-refinement-authority.md",
  "docs/design/helix/L4-basic-design/slot-scheduler-quota-handover.md",
  "docs/design/helix/L4-basic-design/ui-domain-pattern-profile.md",
  "docs/design/helix/L4-basic-design/work-graph-receipt-acceptance.md",
  "docs/design/helix/L4-basic-design/worker-blind-benchmark.md",
  "docs/design/helix/L4-basic-design/worker-context-authority.md",
  "docs/design/helix/L4-basic-design/worker-descriptor-admission.md",
  "docs/design/helix/L4-basic-design/worker-independent-review.md",
  "docs/design/helix/L4-basic-design/worker-isolation-broker.md",
  "docs/design/helix/L4-basic-design/worker-isolation-policy.md",
  "docs/design/helix/L4-basic-design/worker-lifecycle-receipt.md",
  "docs/design/helix/L4-basic-design/worker-output-admission.md",
  "docs/design/helix/L4-basic-design/worker-risk-admission.md",
  "docs/design/helix/L4-basic-design/worker-wrapper-admission.md",
  "docs/design/helix/L4-basic-design/workflow-interview-unresolved.md",
  "docs/design/helix/L4-basic-design/workflow-switch-route-allocation-boundary.md",
  "docs/design/helix/L5-detail/ai-decision-proposal-authority.md",
  "docs/design/helix/L5-detail/bounded-probe-history.md",
  "docs/design/helix/L5-detail/claude-autonomous-permission-mode.md",
  "docs/design/helix/L5-detail/derived-requirement-trace.md",
  "docs/design/helix/L5-detail/design-registry.md",
  "docs/design/helix/L5-detail/development-model-runtime-routing.md",
  "docs/design/helix/L5-detail/event-projection-checkpoint-replay.md",
  "docs/design/helix/L5-detail/github-issue-native-graph-provider.md",
  "docs/design/helix/L5-detail/issue-native-graph-projection.md",
  "docs/design/helix/L5-detail/layer-ledger-pair-gate.md",
  "docs/design/helix/L5-detail/measurement-evidence-evaluator.md",
  "docs/design/helix/L5-detail/nfr-typed-registry-quality-taxonomy.md",
  "docs/design/helix/L5-detail/operation-scope.md",
  "docs/design/helix/L5-detail/project-hook-authority-schema.md",
  "docs/design/helix/L5-detail/python-worker-runtime.md",
  "docs/design/helix/L5-detail/requirement-refinement-authority.md",
  "docs/design/helix/L5-detail/slot-scheduler-quota-handover.md",
  "docs/design/helix/L5-detail/state-db-schema-ddl-authority.md",
  "docs/design/helix/L5-detail/ui-domain-pattern-profile.md",
  "docs/design/helix/L5-detail/work-graph-receipt-acceptance.md",
  "docs/design/helix/L5-detail/workflow-interview-unresolved.md",
  "docs/design/helix/L5-detail/workflow-switch-route-allocation-schema.md",
];

export function isHelixDesignRealityTarget(path: string): boolean {
  return /^docs\/design\/helix\/L[45]-/.test(path);
}

export function isDesignRealityPlanLayer(layer: unknown): boolean {
  return layer === "L4" || layer === "L5";
}

export function classifyAddDesignRealityTargets(
  layer: unknown,
  generates: unknown,
): { generatedDesigns: string[]; targetRequired: boolean } {
  const generatedDesigns = Array.isArray(generates)
    ? generates.flatMap((item) =>
        isRecord(item) &&
        typeof item.artifact_path === "string" &&
        isHelixDesignRealityTarget(item.artifact_path)
          ? [item.artifact_path]
          : [],
      )
    : [];
  return { generatedDesigns, targetRequired: isDesignRealityPlanLayer(layer) };
}

type RuntimeAsset =
  | {
      asset_id: string;
      classification: "existing_runtime";
      artifact_path: string;
      resource_kind: "typescript_export" | "typescript_type" | "json_schema" | "cli_command";
      resource_name: string;
      source_digest: `sha256:${string}`;
      current_authority: true;
    }
  | {
      asset_id: string;
      classification: "planned_new";
      behavior_contract_id: string;
      responsibility_owner: string;
      planned_artifact: string;
      downstream_plan: string;
      current_runtime: false;
    }
  | {
      asset_id: string;
      classification: "compatibility_only";
      artifact_path: string;
      reason: string;
      read_only: true;
      current_authority: false;
    };

export interface FailureReachabilityWitness {
  reason_code: string;
  reachability_mode: "identity_post_check" | "executable_oracle";
  source_path: string;
  source_symbol: string;
  test_path: string;
  oracle_id: string;
  identity_fields: string[];
  post_resolution_checks: string[];
  fixture: { registry: Record<string, string>[]; request: Record<string, string> };
  expected_reason: string;
  mutation: {
    remove_post_resolution_check: string;
    expected_reason_after_mutation: string;
    execution_test_path?: string;
    execution_oracle_id?: string;
    execution_helper?: string;
    execution_target?: string;
  };
}

export interface DesignRealityBinding {
  schema_version: "helix-design-reality-binding.v1";
  assets: RuntimeAsset[];
  declared_failure_codes: string[];
  failure_reachability: FailureReachabilityWitness[];
}

export interface DesignRealityFinding {
  file: string;
  reason: string;
  detail: string;
}

export interface DesignRealityAdvisory {
  file: string;
  reason:
    | "empty_failure_binding_baseline"
    | "prose_failure_binding_gap_candidate"
    | "empty_failure_binding_baseline_resolved";
  detail: string;
}

export interface DesignRealityResult {
  ok: boolean;
  checked: number;
  findings: DesignRealityFinding[];
  advisories: DesignRealityAdvisory[];
  empty_failure_binding_count: number;
  baseline_empty_failure_binding_count: number;
  prose_failure_binding_gap_candidates: number;
}

function finding(file: string, reason: string, detail: string): DesignRealityFinding {
  return { file, reason, detail };
}

function advisory(
  file: string,
  reason: DesignRealityAdvisory["reason"],
  detail: string,
): DesignRealityAdvisory {
  return { file, reason, detail };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isRepoPath(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    !value.startsWith("/") &&
    !value.split("/").includes("..")
  );
}

function comparePaths(left: string, right: string): number {
  return Buffer.from(left, "utf8").compare(Buffer.from(right, "utf8"));
}

function emptyFailureBindingBaselineDigest(entries: readonly string[]): Sha256Digest {
  return `sha256:${createHash("sha256").update(canonicalJson(entries)).digest("hex")}`;
}

function emptyFailureBindingBaselineDocument(
  entries: readonly string[],
): DesignRealityEmptyFailureBindingBaseline {
  const sorted = [...entries].sort(comparePaths);
  return {
    schema_version: DESIGN_REALITY_EMPTY_FAILURE_BINDING_SCHEMA_VERSION,
    entries: sorted,
    baseline_digest: emptyFailureBindingBaselineDigest(sorted),
  };
}

function validateEmptyFailureBindingBaseline(
  value: unknown,
): DesignRealityEmptyFailureBindingBaseline {
  if (
    !isRecord(value) ||
    value.schema_version !== DESIGN_REALITY_EMPTY_FAILURE_BINDING_SCHEMA_VERSION ||
    !Array.isArray(value.entries)
  ) {
    throw new Error("invalid design reality empty failure binding baseline schema");
  }
  const entries = value.entries.map((entry) => {
    if (!isRepoPath(entry) || !isHelixDesignRealityTarget(entry)) {
      throw new Error("invalid design reality empty failure binding baseline entry");
    }
    return entry;
  });
  const sorted = [...entries].sort(comparePaths);
  if (new Set(sorted).size !== sorted.length) {
    throw new Error("duplicate design reality empty failure binding baseline entry");
  }
  if (
    typeof value.baseline_digest !== "string" ||
    !/^sha256:[a-f0-9]{64}$/u.test(value.baseline_digest) ||
    value.baseline_digest !== emptyFailureBindingBaselineDigest(sorted)
  ) {
    throw new Error("design reality empty failure binding baseline digest mismatch");
  }
  return {
    schema_version: DESIGN_REALITY_EMPTY_FAILURE_BINDING_SCHEMA_VERSION,
    entries: sorted,
    baseline_digest: value.baseline_digest as Sha256Digest,
  };
}

export function loadDesignRealityEmptyFailureBindingBaseline(
  repoRoot: string,
): DesignRealityEmptyFailureBindingBaseline {
  const path = join(repoRoot, DESIGN_REALITY_EMPTY_FAILURE_BINDING_BASELINE_PATH);
  if (!existsSync(path)) return emptyFailureBindingBaselineDocument([]);
  return validateEmptyFailureBindingBaseline(JSON.parse(readFileSync(path, "utf8")));
}

const FAILURE_PROSE_HEADING_PATTERN =
  /^#{2,6}\s+.*(?:fail[- ]?close|failure|失敗|拒否|エラー|異常|不正|障害)/iu;
const FAILURE_PROSE_SIGNAL_PATTERN =
  /(?:fail[- ]?close|failure|error|reject|拒否|失敗|エラー|異常|不正|障害)/iu;

/**
 * 設計本文のfailure方針と空bindingの意味差候補を、hard failureとは分離して報告する。
 * JSON binding後ろの機械データは読まず、設計本文の見出しと節だけを対象にする。
 */
function failureProseSignal(content: string): string | null {
  const marker = `<!-- ${DESIGN_REALITY_BINDING_MARKER} -->`;
  const markerIndex = content.indexOf(marker);
  const beforeBinding = markerIndex >= 0 ? content.slice(0, markerIndex) : content;
  const lines = beforeBinding.split(/\r?\n/u);
  for (let index = 0; index < lines.length; index += 1) {
    const heading = lines[index];
    if (!FAILURE_PROSE_HEADING_PATTERN.test(heading)) continue;
    const section: string[] = [];
    for (let next = index + 1; next < lines.length; next += 1) {
      if (/^#{1,6}\s+/u.test(lines[next])) break;
      section.push(lines[next]);
    }
    if (FAILURE_PROSE_SIGNAL_PATTERN.test(section.join("\n"))) return heading.trim();
  }
  return null;
}

function insideRepo(repoRoot: string, path: string): boolean {
  const rel = relative(realpathSync(repoRoot), realpathSync(path));
  return rel !== ".." && !rel.startsWith(`..${sep}`) && !rel.startsWith(sep);
}

function parseBinding(content: string): unknown {
  const marker = `<!-- ${DESIGN_REALITY_BINDING_MARKER} -->`;
  const start = content.indexOf(marker);
  if (start < 0) return null;
  const rest = content.slice(start + marker.length);
  const match = rest.match(/```json\s*\n([\s\S]*?)\n```/);
  if (!match) return undefined;
  try {
    return JSON.parse(match[1]);
  } catch {
    return undefined;
  }
}

function exportedResources(source: string, fileName: string): Map<string, "type" | "value"> {
  const file = ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true);
  const names = new Map<string, "type" | "value">();
  for (const statement of file.statements) {
    const modifiers = ts.canHaveModifiers(statement) ? ts.getModifiers(statement) : undefined;
    if (!modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword)) continue;
    if (
      ts.isFunctionDeclaration(statement) ||
      ts.isClassDeclaration(statement) ||
      ts.isInterfaceDeclaration(statement) ||
      ts.isTypeAliasDeclaration(statement) ||
      ts.isEnumDeclaration(statement) ||
      ts.isVariableStatement(statement)
    ) {
      if (ts.isVariableStatement(statement)) {
        for (const declaration of statement.declarationList.declarations) {
          if (ts.isIdentifier(declaration.name)) names.set(declaration.name.text, "value");
        }
      } else if (statement.name) {
        names.set(
          statement.name.text,
          ts.isInterfaceDeclaration(statement) || ts.isTypeAliasDeclaration(statement)
            ? "type"
            : "value",
        );
      }
    }
  }
  return names;
}

function cliCommandNames(source: string, fileName: string): Set<string> {
  const file = ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true);
  const values = new Set<string>();
  const runtimeFactory = file.statements.find(
    (statement): statement is TS.FunctionDeclaration =>
      ts.isFunctionDeclaration(statement) &&
      statement.name?.text === "runtimeCommand" &&
      statement.parameters.length === 1 &&
      ts.isIdentifier(statement.parameters[0]?.name),
  );
  const runtimeFactoryParameter = runtimeFactory?.parameters[0]?.name;
  let runtimeFactoryBindsProgramCommand = false;
  if (runtimeFactory?.body && runtimeFactoryParameter && ts.isIdentifier(runtimeFactoryParameter)) {
    const inspectFactory = (node: TS.Node): void => {
      if (
        ts.isCallExpression(node) &&
        ts.isPropertyAccessExpression(node.expression) &&
        node.expression.name.text === "command" &&
        node.arguments[0] &&
        ts.isIdentifier(node.arguments[0]) &&
        node.arguments[0].text === runtimeFactoryParameter.text
      ) {
        runtimeFactoryBindsProgramCommand = true;
      }
      ts.forEachChild(node, inspectFactory);
    };
    inspectFactory(runtimeFactory.body);
  }
  const visit = (node: TS.Node): void => {
    if (
      ts.isCallExpression(node) &&
      ts.isPropertyAccessExpression(node.expression) &&
      node.expression.name.text === "command" &&
      node.arguments[0] &&
      (ts.isStringLiteral(node.arguments[0]) ||
        ts.isNoSubstitutionTemplateLiteral(node.arguments[0]))
    ) {
      values.add(node.arguments[0].text.split(/[ <[]/, 1)[0]);
    }
    if (
      runtimeFactoryBindsProgramCommand &&
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === "runtimeCommand" &&
      node.arguments.length === 1 &&
      node.arguments[0] &&
      (ts.isStringLiteral(node.arguments[0]) ||
        ts.isNoSubstitutionTemplateLiteral(node.arguments[0]))
    ) {
      values.add(node.arguments[0].text);
    }
    ts.forEachChild(node, visit);
  };
  visit(file);
  return values;
}

function jsonContainsExact(value: unknown, expected: string): boolean {
  if (value === expected) return true;
  if (Array.isArray(value)) return value.some((item) => jsonContainsExact(item, expected));
  if (!isRecord(value)) return false;
  return Object.entries(value).some(
    ([key, item]) => key === expected || jsonContainsExact(item, expected),
  );
}

function resolverFieldBinding(
  source: string,
  fileName: string,
  symbol: string,
): { identity: Set<string>; post: Set<string> } | null {
  const file = ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true);
  const declaration = file.statements.find(
    (statement): statement is TS.FunctionDeclaration =>
      ts.isFunctionDeclaration(statement) &&
      statement.name?.text === symbol &&
      statement.body !== undefined,
  );
  if (!declaration?.body) return null;
  const identity = new Set<string>();
  const post = new Set<string>();
  const collectComparisons = (node: TS.Node, target: Set<string>): void => {
    if (
      ts.isBinaryExpression(node) &&
      (node.operatorToken.kind === ts.SyntaxKind.EqualsEqualsEqualsToken ||
        node.operatorToken.kind === ts.SyntaxKind.ExclamationEqualsEqualsToken)
    ) {
      const accesses = [node.left, node.right].filter(ts.isPropertyAccessExpression);
      const request = accesses.find(
        (access) => ts.isIdentifier(access.expression) && access.expression.text === "request",
      );
      if (request) target.add(request.name.text);
    }
    ts.forEachChild(node, (child) => collectComparisons(child, target));
  };
  const visit = (node: TS.Node): void => {
    if (
      ts.isCallExpression(node) &&
      ts.isPropertyAccessExpression(node.expression) &&
      node.expression.name.text === "filter" &&
      node.arguments[0] &&
      (ts.isArrowFunction(node.arguments[0]) || ts.isFunctionExpression(node.arguments[0]))
    ) {
      collectComparisons(node.arguments[0], identity);
      return;
    }
    if (ts.isIfStatement(node)) collectComparisons(node.expression, post);
    ts.forEachChild(node, visit);
  };
  visit(declaration.body);
  return { identity, post };
}

function exportedFunctionSource(source: string, fileName: string, symbol: string): string | null {
  const file = ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true);
  const declaration = file.statements.find(
    (statement): statement is TS.FunctionDeclaration =>
      ts.isFunctionDeclaration(statement) && statement.name?.text === symbol,
  );
  return declaration?.getText(file) ?? null;
}

function executableOracleBody(source: string, fileName: string, oracleId: string): string | null {
  const file = ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true);
  let body: string | null = null;
  const visit = (node: TS.Node): void => {
    if (body !== null || !ts.isCallExpression(node) || !ts.isIdentifier(node.expression)) {
      ts.forEachChild(node, visit);
      return;
    }
    if (node.expression.text !== "it" && node.expression.text !== "test") {
      ts.forEachChild(node, visit);
      return;
    }
    const title = node.arguments[0];
    const callback = node.arguments[1];
    if (
      title &&
      ts.isStringLiteral(title) &&
      title.text.startsWith(`${oracleId}: `) &&
      callback &&
      (ts.isArrowFunction(callback) || ts.isFunctionExpression(callback))
    ) {
      body = callback.getText(file);
      return;
    }
    ts.forEachChild(node, visit);
  };
  visit(file);
  return body;
}

function oracleAssertsSymbolReason(input: {
  source: string;
  fileName: string;
  oracleId: string;
  symbol: string;
  reasonCode: string;
}): boolean {
  const { source, fileName, oracleId, symbol, reasonCode } = input;
  const file = ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true);
  let bound = false;
  const containsCall = (node: TS.Node): boolean => {
    let found = false;
    const visit = (candidate: TS.Node): void => {
      if (ts.isCallExpression(candidate)) {
        const callee = candidate.expression;
        if (
          (ts.isIdentifier(callee) && callee.text === symbol) ||
          (ts.isPropertyAccessExpression(callee) && callee.name.text === symbol)
        ) {
          found = true;
          return;
        }
      }
      ts.forEachChild(candidate, visit);
    };
    visit(node);
    return found;
  };
  const containsReason = (node: TS.Node): boolean => {
    let found = false;
    const visit = (candidate: TS.Node): void => {
      if (
        (ts.isStringLiteral(candidate) || ts.isNoSubstitutionTemplateLiteral(candidate)) &&
        candidate.text === reasonCode
      ) {
        found = true;
        return;
      }
      ts.forEachChild(candidate, visit);
    };
    visit(node);
    return found;
  };
  for (const node of file.statements) {
    const visit = (candidate: TS.Node, insideOracle: boolean): void => {
      if (bound) return;
      if (
        ts.isCallExpression(candidate) &&
        ts.isIdentifier(candidate.expression) &&
        (candidate.expression.text === "it" || candidate.expression.text === "test") &&
        candidate.arguments[0] &&
        ts.isStringLiteral(candidate.arguments[0]) &&
        candidate.arguments[0].text.startsWith(`${oracleId}: `) &&
        candidate.arguments[1] &&
        (ts.isArrowFunction(candidate.arguments[1]) ||
          ts.isFunctionExpression(candidate.arguments[1]))
      ) {
        ts.forEachChild(candidate.arguments[1], (child) => visit(child, true));
        return;
      }
      if (
        insideOracle &&
        ts.isCallExpression(candidate) &&
        ts.isPropertyAccessExpression(candidate.expression) &&
        ts.isCallExpression(candidate.expression.expression)
      ) {
        const expectCall = candidate.expression.expression;
        if (
          ts.isIdentifier(expectCall.expression) &&
          expectCall.expression.text === "expect" &&
          expectCall.arguments.some(containsCall) &&
          candidate.arguments.some(containsReason)
        ) {
          bound = true;
          return;
        }
      }
      ts.forEachChild(candidate, (child) => visit(child, insideOracle));
    };
    visit(node, false);
  }
  return bound;
}

function mutationRunnerBinding(input: {
  source: string;
  fileName: string;
  oracleId: string;
  helperName: string;
  target: string;
  targetOracleId: string;
}): boolean {
  const file = ts.createSourceFile(input.fileName, input.source, ts.ScriptTarget.Latest, true);
  const helper = file.statements.find(
    (statement): statement is TS.FunctionDeclaration =>
      ts.isFunctionDeclaration(statement) && statement.name?.text === input.helperName,
  );
  if (!helper?.body) return false;
  const helperCalls = new Set<string>();
  let hasReplace = false;
  let hasVitest = false;
  const inspectHelper = (node: TS.Node): void => {
    if (ts.isCallExpression(node)) {
      if (ts.isIdentifier(node.expression)) helperCalls.add(node.expression.text);
      if (ts.isPropertyAccessExpression(node.expression) && node.expression.name.text === "replace")
        hasReplace = true;
    }
    if (ts.isStringLiteral(node) && node.text === "vitest") hasVitest = true;
    ts.forEachChild(node, inspectHelper);
  };
  inspectHelper(helper.body);
  if (
    !["writeFileSync", "execFileSync", "unlinkSync"].every((name) => helperCalls.has(name)) ||
    !hasReplace ||
    !hasVitest
  )
    return false;
  let exactCall = false;
  const inspectOracle = (node: TS.Node, active: boolean): void => {
    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      (node.expression.text === "it" || node.expression.text === "test") &&
      node.arguments[0] &&
      ts.isStringLiteral(node.arguments[0]) &&
      node.arguments[0].text.startsWith(`${input.oracleId}: `) &&
      node.arguments[1] &&
      (ts.isArrowFunction(node.arguments[1]) || ts.isFunctionExpression(node.arguments[1]))
    ) {
      ts.forEachChild(node.arguments[1], (child) => inspectOracle(child, true));
      return;
    }
    if (
      active &&
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === input.helperName &&
      node.arguments[0] &&
      ts.isStringLiteral(node.arguments[0]) &&
      node.arguments[0].text === input.target &&
      node.arguments[2] &&
      ts.isStringLiteral(node.arguments[2]) &&
      node.arguments[2].text === input.targetOracleId
    )
      exactCall = true;
    ts.forEachChild(node, (child) => inspectOracle(child, active));
  };
  inspectOracle(file, false);
  return exactCall;
}

export function evaluateFailureWitness(
  witness: FailureReachabilityWitness,
  mutation = false,
): string {
  const identityFields = witness.identity_fields;
  const candidates = witness.fixture.registry.filter((entry) =>
    identityFields.every((field) => entry[field] === witness.fixture.request[field]),
  );
  if (candidates.length === 0) return "WORKER_DESCRIPTOR_NOT_FOUND";
  if (candidates.length > 1) return "WORKER_DESCRIPTOR_AMBIGUOUS";
  const checks = mutation
    ? witness.post_resolution_checks.filter(
        (field) => field !== witness.mutation.remove_post_resolution_check,
      )
    : witness.post_resolution_checks;
  for (const field of checks) {
    if (candidates[0][field] !== witness.fixture.request[field]) return witness.reason_code;
  }
  return "OK";
}

function validateWitness(input: {
  repoRoot: string;
  file: string;
  raw: unknown;
  index: number;
}): DesignRealityFinding[] {
  const { repoRoot, file, raw, index } = input;
  const subject = `failure_reachability[${index}]`;
  if (!isRecord(raw)) return [finding(file, "invalid_failure_witness", subject)];
  const requiredStrings = [
    "reason_code",
    "reachability_mode",
    "source_path",
    "source_symbol",
    "test_path",
    "oracle_id",
    "expected_reason",
  ];
  if (requiredStrings.some((key) => typeof raw[key] !== "string" || raw[key] === "")) {
    return [finding(file, "invalid_failure_witness", `${subject}: required string`)];
  }
  if (
    !Array.isArray(raw.identity_fields) ||
    !Array.isArray(raw.post_resolution_checks) ||
    !isRecord(raw.fixture) ||
    !isRecord(raw.mutation)
  ) {
    return [finding(file, "invalid_failure_witness", `${subject}: typed reachability fields`)];
  }
  const witness = raw as unknown as FailureReachabilityWitness;
  if (!isRepoPath(witness.source_path))
    return [finding(file, "invalid_source_path", witness.source_path)];
  const sourceAbsolute = resolve(repoRoot, witness.source_path);
  if (!existsSync(sourceAbsolute) || !insideRepo(repoRoot, sourceAbsolute)) {
    return [finding(file, "missing_reachability_source", witness.source_path)];
  }
  const source = readFileSync(sourceAbsolute, "utf8");
  const fields = resolverFieldBinding(source, witness.source_path, witness.source_symbol);
  if (!fields) return [finding(file, "missing_reachability_symbol", witness.source_symbol)];
  if (
    witness.reachability_mode === "identity_post_check" &&
    ([...fields.identity].sort().join(",") !== [...witness.identity_fields].sort().join(",") ||
      witness.post_resolution_checks.some((field) => !fields.post.has(field)))
  ) {
    return [
      finding(
        file,
        "implementation_identity_mismatch",
        `${witness.source_symbol}:identity=${[...fields.identity].sort().join("+")}:post=${[...fields.post].sort().join("+")}`,
      ),
    ];
  }
  if (!isRepoPath(witness.test_path))
    return [finding(file, "invalid_test_path", witness.test_path)];
  const testAbsolute = resolve(repoRoot, witness.test_path);
  if (!existsSync(testAbsolute) || !insideRepo(repoRoot, testAbsolute)) {
    return [finding(file, "missing_reachability_test", witness.test_path)];
  }
  const testSource = readFileSync(testAbsolute, "utf8");
  if (
    (extractExecutableOracleCases(testSource, witness.test_path).get(witness.oracle_id) ?? 0) !== 1
  ) {
    return [
      finding(file, "missing_executable_oracle", `${witness.test_path}#${witness.oracle_id}`),
    ];
  }
  const oracleBody = executableOracleBody(testSource, witness.test_path, witness.oracle_id) ?? "";
  if (
    !oracleBody.includes(witness.reason_code) ||
    !oracleAssertsSymbolReason({
      source: testSource,
      fileName: witness.test_path,
      oracleId: witness.oracle_id,
      symbol: witness.source_symbol,
      reasonCode: witness.reason_code,
    }) ||
    /\.toContain\s*\(/.test(oracleBody)
  ) {
    return [
      finding(file, "prose_only_reachability", `${witness.oracle_id}:${witness.reason_code}`),
    ];
  }
  if (witness.reachability_mode === "identity_post_check") {
    const actual = evaluateFailureWitness(witness);
    if (actual !== witness.expected_reason || actual !== witness.reason_code) {
      return [finding(file, "unreachable_failure", `${witness.reason_code}:actual=${actual}`)];
    }
    const mutated = evaluateFailureWitness(witness, true);
    if (mutated !== witness.mutation.expected_reason_after_mutation || mutated === actual) {
      return [finding(file, "mutation_not_red", `${witness.reason_code}:mutated=${mutated}`)];
    }
  } else if (
    witness.reachability_mode !== "executable_oracle" ||
    witness.expected_reason !== witness.reason_code ||
    witness.mutation.expected_reason_after_mutation !== "RED_BY_ORACLE" ||
    !(
      exportedFunctionSource(source, witness.source_path, witness.source_symbol)?.includes(
        witness.mutation.remove_post_resolution_check,
      ) ?? false
    ) ||
    !isRepoPath(witness.mutation.execution_test_path) ||
    typeof witness.mutation.execution_oracle_id !== "string" ||
    typeof witness.mutation.execution_helper !== "string"
  ) {
    return [finding(file, "invalid_executable_mutation", witness.reason_code)];
  }
  const mutationTestPath = witness.mutation.execution_test_path;
  if (mutationTestPath) {
    const mutationOracleId = witness.mutation.execution_oracle_id;
    const mutationHelper = witness.mutation.execution_helper;
    const executionTarget =
      witness.mutation.execution_target ?? witness.mutation.remove_post_resolution_check;
    if (!mutationTestPath || !mutationOracleId || !mutationHelper)
      return [finding(file, "invalid_executable_mutation", witness.reason_code)];
    const mutationTest = readFileSync(resolve(repoRoot, mutationTestPath), "utf8");
    if (
      (extractExecutableOracleCases(mutationTest, mutationTestPath).get(mutationOracleId) ?? 0) !==
        1 ||
      !mutationRunnerBinding({
        source: mutationTest,
        fileName: mutationTestPath,
        oracleId: mutationOracleId,
        helperName: mutationHelper,
        target: executionTarget,
        targetOracleId: witness.oracle_id,
      })
    ) {
      return [finding(file, "missing_executable_mutation_oracle", witness.reason_code)];
    }
  }
  return [];
}

function validateAsset(input: {
  repoRoot: string;
  file: string;
  raw: unknown;
  index: number;
}): DesignRealityFinding[] {
  const { repoRoot, file, raw, index } = input;
  if (
    !isRecord(raw) ||
    typeof raw.asset_id !== "string" ||
    typeof raw.classification !== "string"
  ) {
    return [finding(file, "invalid_asset", `assets[${index}]`)];
  }
  if (raw.classification === "planned_new") {
    const valid =
      typeof raw.behavior_contract_id === "string" &&
      raw.behavior_contract_id.length > 0 &&
      typeof raw.responsibility_owner === "string" &&
      raw.responsibility_owner.length > 0 &&
      isRepoPath(raw.planned_artifact) &&
      isRepoPath(raw.downstream_plan) &&
      raw.current_runtime === false;
    if (!valid) return [finding(file, "invalid_planned_new", raw.asset_id)];
    const planPath = resolve(repoRoot, raw.downstream_plan as string);
    if (!existsSync(planPath) || !insideRepo(repoRoot, planPath))
      return [finding(file, "missing_downstream_plan", raw.asset_id)];
    const plan = readFileSync(planPath, "utf8");
    const planFrontmatter = markdownFrontmatter(plan);
    const decodedPlan = planFrontmatter ? parseYaml(planFrontmatter) : null;
    const generated =
      isRecord(decodedPlan) && Array.isArray(decodedPlan.generates)
        ? decodedPlan.generates.some(
            (item) => isRecord(item) && item.artifact_path === raw.planned_artifact,
          )
        : false;
    if (!generated) return [finding(file, "planned_artifact_not_generated", raw.asset_id)];
    if (
      !isRecord(decodedPlan) ||
      decodedPlan.behavior_contract_id !== raw.behavior_contract_id ||
      decodedPlan.responsibility_owner !== raw.responsibility_owner
    )
      return [finding(file, "planned_contract_owner_mismatch", raw.asset_id)];
    if (existsSync(resolve(repoRoot, raw.planned_artifact as string)))
      return [finding(file, "planned_asset_already_exists", raw.asset_id)];
    return [];
  }
  if (raw.classification === "compatibility_only") {
    if (
      !isRepoPath(raw.artifact_path) ||
      typeof raw.reason !== "string" ||
      raw.reason.length === 0 ||
      raw.read_only !== true ||
      raw.current_authority !== false
    ) {
      return [finding(file, "invalid_compatibility_only", raw.asset_id)];
    }
    const compatibilityPath = resolve(repoRoot, raw.artifact_path);
    if (!existsSync(compatibilityPath) || !insideRepo(repoRoot, compatibilityPath))
      return [finding(file, "missing_compatibility_artifact", raw.asset_id)];
    return [];
  }
  if (raw.classification !== "existing_runtime")
    return [finding(file, "unknown_asset_classification", raw.asset_id)];
  if (
    !isRepoPath(raw.artifact_path) ||
    typeof raw.resource_name !== "string" ||
    !["typescript_export", "typescript_type", "json_schema", "cli_command"].includes(
      raw.resource_kind as string,
    ) ||
    typeof raw.source_digest !== "string" ||
    raw.current_authority !== true
  ) {
    return [finding(file, "invalid_existing_runtime", raw.asset_id)];
  }
  const absolute = resolve(repoRoot, raw.artifact_path);
  if (!existsSync(absolute) || !insideRepo(repoRoot, absolute))
    return [finding(file, "missing_runtime_artifact", raw.asset_id)];
  if (/^(docs\/(archive|migration)|legacy local state)\//.test(raw.artifact_path))
    return [finding(file, "non_current_runtime_authority", raw.asset_id)];
  const source = readFileSync(absolute, "utf8");
  if (`sha256:${createHash("sha256").update(source).digest("hex")}` !== raw.source_digest)
    return [finding(file, "stale_source_digest", raw.asset_id)];
  if (raw.resource_kind === "typescript_export" || raw.resource_kind === "typescript_type") {
    const actualKind = exportedResources(source, raw.artifact_path).get(raw.resource_name);
    const expectedKind = raw.resource_kind === "typescript_type" ? "type" : "value";
    if (actualKind !== expectedKind)
      return [finding(file, "missing_runtime_symbol", `${raw.asset_id}:${raw.resource_name}`)];
  }
  if (raw.resource_kind === "json_schema") {
    try {
      if (!jsonContainsExact(JSON.parse(source), raw.resource_name))
        return [finding(file, "missing_runtime_schema", raw.asset_id)];
    } catch {
      return [finding(file, "invalid_runtime_schema", raw.asset_id)];
    }
  }
  if (
    raw.resource_kind === "cli_command" &&
    !cliCommandNames(source, raw.artifact_path).has(raw.resource_name)
  )
    return [finding(file, "missing_cli_command", raw.asset_id)];
  return [];
}

function requiredByActivation(frontmatter: Record<string, unknown>): boolean {
  return (
    (frontmatter.layer === "L4" || frontmatter.layer === "L5") &&
    frontmatter.status === "confirmed" &&
    typeof frontmatter.updated === "string" &&
    frontmatter.updated >= DESIGN_REALITY_BINDING_ACTIVATION_DATE
  );
}

function changedSinceActivation(repoRoot: string): Set<string> | null {
  try {
    const output = execFileSync(
      "git",
      ["diff", "--name-only", `${DESIGN_REALITY_BINDING_ACTIVATION_COMMIT}..HEAD`],
      { cwd: repoRoot, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
    );
    return new Set(output.split(/\r?\n/).filter(Boolean));
  } catch {
    return null;
  }
}

export function analyzeDesignRealityBinding(
  repoRoot: string,
  files?: string[],
  options: {
    changedPaths?: ReadonlySet<string>;
    emptyFailureBindingBaseline?: DesignRealityEmptyFailureBindingBaseline;
  } = {},
): DesignRealityResult {
  const designFiles =
    files ??
    ["docs/design/helix/L4-basic-design", "docs/design/helix/L5-detail"].flatMap((dir) => {
      const absolute = join(repoRoot, dir);
      return readdirSync(absolute)
        .filter((name) => name.endsWith(".md"))
        .map((name) => join(dir, name));
    });
  const findings: DesignRealityFinding[] = [];
  const advisories: DesignRealityAdvisory[] = [];
  let emptyFailureBindingCount = 0;
  let baselineEmptyFailureBindingCount = 0;
  let proseFailureBindingGapCandidates = 0;
  let emptyFailureBindingBaseline: DesignRealityEmptyFailureBindingBaseline;
  try {
    emptyFailureBindingBaseline = options.emptyFailureBindingBaseline
      ? validateEmptyFailureBindingBaseline(options.emptyFailureBindingBaseline)
      : loadDesignRealityEmptyFailureBindingBaseline(repoRoot);
  } catch (error) {
    return {
      ok: false,
      checked: 0,
      findings: [finding("<baseline>", "empty_failure_binding_baseline_invalid", String(error))],
      advisories: [],
      empty_failure_binding_count: 0,
      baseline_empty_failure_binding_count: 0,
      prose_failure_binding_gap_candidates: 0,
    };
  }
  const baselinePaths = new Set(emptyFailureBindingBaseline.entries);
  const initialBaselinePaths = new Set(INITIAL_DESIGN_REALITY_EMPTY_FAILURE_BINDING_BASELINE);
  for (const path of emptyFailureBindingBaseline.entries) {
    if (!initialBaselinePaths.has(path)) {
      findings.push(finding("<baseline>", "empty_failure_binding_baseline_expanded", path));
    }
  }
  const observedDesignPaths = new Set(designFiles);
  const observedEmptyDesignPaths = new Set<string>();
  const changed = options.changedPaths ?? changedSinceActivation(repoRoot);
  let checked = 0;
  for (const file of designFiles) {
    const content = readFileSync(join(repoRoot, file), "utf8");
    const frontmatterRaw = markdownFrontmatter(content);
    const frontmatter = frontmatterRaw ? parseYaml(frontmatterRaw) : null;
    if (!isRecord(frontmatter)) continue;
    const parsed = parseBinding(content);
    const mechanicallyActivated = changed?.has(file) ?? false;
    if (parsed === null && !mechanicallyActivated && !requiredByActivation(frontmatter)) continue;
    checked += 1;
    if (
      !isRecord(parsed) ||
      parsed.schema_version !== "helix-design-reality-binding.v1" ||
      !Array.isArray(parsed.assets) ||
      !Array.isArray(parsed.declared_failure_codes) ||
      !Array.isArray(parsed.failure_reachability)
    ) {
      findings.push(finding(file, "missing_or_invalid_binding", DESIGN_REALITY_BINDING_MARKER));
      continue;
    }
    parsed.assets.forEach((asset, index) => {
      findings.push(...validateAsset({ repoRoot, file, raw: asset, index }));
    });
    parsed.failure_reachability.forEach((witness, index) => {
      findings.push(...validateWitness({ repoRoot, file, raw: witness, index }));
    });
    const declared = parsed.declared_failure_codes.flatMap((item) =>
      typeof item === "string" && item.length > 0 ? [item] : [],
    );
    const witnessed = parsed.failure_reachability.flatMap((item) =>
      isRecord(item) && typeof item.reason_code === "string" ? [item.reason_code] : [],
    );
    if (
      declared.length !== parsed.declared_failure_codes.length ||
      new Set(declared).size !== declared.length ||
      new Set(witnessed).size !== witnessed.length ||
      [...declared].sort().join(",") !== [...witnessed].sort().join(",")
    ) {
      findings.push(
        finding(
          file,
          "failure_code_coverage_mismatch",
          `declared=${declared.join(",")}:witnessed=${witnessed.join(",")}`,
        ),
      );
    }
    if (parsed.declared_failure_codes.length === 0 && parsed.failure_reachability.length === 0) {
      emptyFailureBindingCount += 1;
      observedEmptyDesignPaths.add(file);
      if (baselinePaths.has(file)) {
        baselineEmptyFailureBindingCount += 1;
        advisories.push(
          advisory(
            file,
            "empty_failure_binding_baseline",
            "declared_failure_codes と failure_reachability が空の既知baseline",
          ),
        );
      } else {
        findings.push(
          finding(
            file,
            "empty_failure_binding_not_in_baseline",
            "新規の空failure bindingはbaselineへ追加せず、failure contractをmaterializeすること",
          ),
        );
      }
      const proseHeading = failureProseSignal(content);
      if (proseHeading) {
        proseFailureBindingGapCandidates += 1;
        advisories.push(
          advisory(
            file,
            "prose_failure_binding_gap_candidate",
            `${proseHeading}:本文にfailure方針があるが、機械bindingは空`,
          ),
        );
      }
    }
  }
  for (const path of emptyFailureBindingBaseline.entries) {
    if (observedDesignPaths.has(path) && !observedEmptyDesignPaths.has(path)) {
      advisories.push(
        advisory(
          path,
          "empty_failure_binding_baseline_resolved",
          "空bindingが解消されたためbaselineから削除して集合を縮小すること",
        ),
      );
    }
  }
  if (!files && changed) {
    const plansDir = join(repoRoot, "docs/plans");
    for (const name of readdirSync(plansDir).filter((item) => item.endsWith(".md"))) {
      const path = join("docs/plans", name);
      if (!changed.has(path)) continue;
      const raw = markdownFrontmatter(readFileSync(join(repoRoot, path), "utf8"));
      const plan = raw ? parseYaml(raw) : null;
      if (!isRecord(plan) || plan.kind !== "add-design" || plan.status !== "confirmed") continue;
      const { generatedDesigns, targetRequired } = classifyAddDesignRealityTargets(
        plan.layer,
        plan.generates,
      );
      if (generatedDesigns.length === 0) {
        if (targetRequired)
          findings.push(finding(path, "add_design_reality_target_missing", String(plan.plan_id)));
        continue;
      }
      for (const designPath of generatedDesigns) {
        const design = existsSync(join(repoRoot, designPath))
          ? readFileSync(join(repoRoot, designPath), "utf8")
          : "";
        if (!design.includes(DESIGN_REALITY_BINDING_MARKER))
          findings.push(finding(path, "add_design_reality_binding_missing", designPath));
      }
    }
  }
  return {
    ok: findings.length === 0,
    checked,
    findings,
    advisories,
    empty_failure_binding_count: emptyFailureBindingCount,
    baseline_empty_failure_binding_count: baselineEmptyFailureBindingCount,
    prose_failure_binding_gap_candidates: proseFailureBindingGapCandidates,
  };
}

export function designRealityBindingMessages(result: DesignRealityResult): string[] {
  const messages = result.findings
    .slice(0, 12)
    .map(
      (item) => `design-reality-binding — violation: ${item.file}:${item.reason}:${item.detail}`,
    );
  if (result.advisories.length > 0) {
    messages.push(
      `design-reality-binding — advisory: empty=${result.empty_failure_binding_count}, baseline=${result.baseline_empty_failure_binding_count}, prose_gap_candidates=${result.prose_failure_binding_gap_candidates}`,
      ...result.advisories
        .slice(0, 8)
        .map(
          (item) => `design-reality-binding — advisory: ${item.file}:${item.reason}:${item.detail}`,
        ),
    );
  }
  if (messages.length > 0) return messages;
  return [`design-reality-binding — OK (checked=${result.checked})`];
}

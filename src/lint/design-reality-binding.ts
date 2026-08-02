import { existsSync, readdirSync, readFileSync, realpathSync } from "node:fs";
import { join, relative, resolve, sep } from "node:path";
import ts from "typescript";
import { parse as parseYaml } from "yaml";
import { sha256Digest } from "../runtime/digest";
import { extractExecutableOracleCases } from "./plan-specific-vpair-binding";
import { markdownFrontmatter } from "./shared";

export const DESIGN_REALITY_BINDING_MARKER = "HELIX:design-reality-binding:v1";
export const DESIGN_REALITY_BINDING_ACTIVATION_DATE = "2026-08-03";

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
  source_path: string;
  source_symbol: string;
  test_path: string;
  oracle_id: string;
  identity_fields: string[];
  post_resolution_checks: string[];
  fixture: { registry: Record<string, string>[]; request: Record<string, string> };
  expected_reason: string;
  mutation: { remove_post_resolution_check: string; expected_reason_after_mutation: string };
}

export interface DesignRealityBinding {
  schema_version: "helix-design-reality-binding.v1";
  assets: RuntimeAsset[];
  failure_reachability: FailureReachabilityWitness[];
}

export interface DesignRealityFinding {
  file: string;
  reason: string;
  detail: string;
}

export interface DesignRealityResult {
  ok: boolean;
  checked: number;
  findings: DesignRealityFinding[];
}

function finding(file: string, reason: string, detail: string): DesignRealityFinding {
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

function exportedNames(source: string, fileName: string): Set<string> {
  const file = ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true);
  const names = new Set<string>();
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
          if (ts.isIdentifier(declaration.name)) names.add(declaration.name.text);
        }
      } else if (statement.name) names.add(statement.name.text);
    }
  }
  return names;
}

function resolverFieldBinding(
  source: string,
  fileName: string,
  symbol: string,
): { identity: Set<string>; post: Set<string> } | null {
  const file = ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true);
  const declaration = file.statements.find(
    (statement): statement is ts.FunctionDeclaration =>
      ts.isFunctionDeclaration(statement) &&
      statement.name?.text === symbol &&
      statement.body !== undefined,
  );
  if (!declaration?.body) return null;
  const identity = new Set<string>();
  const post = new Set<string>();
  const collectComparisons = (node: ts.Node, target: Set<string>): void => {
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
  const visit = (node: ts.Node): void => {
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

function executableOracleBody(source: string, fileName: string, oracleId: string): string | null {
  const file = ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true);
  let body: string | null = null;
  const visit = (node: ts.Node): void => {
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

function validateWitness(
  repoRoot: string,
  file: string,
  raw: unknown,
  index: number,
): DesignRealityFinding[] {
  const subject = `failure_reachability[${index}]`;
  if (!isRecord(raw)) return [finding(file, "invalid_failure_witness", subject)];
  const requiredStrings = [
    "reason_code",
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
    [...fields.identity].sort().join(",") !== [...witness.identity_fields].sort().join(",") ||
    witness.post_resolution_checks.some((field) => !fields.post.has(field))
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
  if (!oracleBody.includes(witness.reason_code) || /\.toContain\s*\(/.test(oracleBody)) {
    return [
      finding(file, "prose_only_reachability", `${witness.oracle_id}:${witness.reason_code}`),
    ];
  }
  const actual = evaluateFailureWitness(witness);
  if (actual !== witness.expected_reason || actual !== witness.reason_code) {
    return [finding(file, "unreachable_failure", `${witness.reason_code}:actual=${actual}`)];
  }
  const mutated = evaluateFailureWitness(witness, true);
  if (mutated !== witness.mutation.expected_reason_after_mutation || mutated === actual) {
    return [finding(file, "mutation_not_red", `${witness.reason_code}:mutated=${mutated}`)];
  }
  return [];
}

function validateAsset(
  repoRoot: string,
  file: string,
  raw: unknown,
  index: number,
): DesignRealityFinding[] {
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
      typeof raw.responsibility_owner === "string" &&
      isRepoPath(raw.planned_artifact) &&
      isRepoPath(raw.downstream_plan) &&
      raw.current_runtime === false;
    if (!valid) return [finding(file, "invalid_planned_new", raw.asset_id)];
    const planPath = resolve(repoRoot, raw.downstream_plan as string);
    if (!existsSync(planPath) || !insideRepo(repoRoot, planPath))
      return [finding(file, "missing_downstream_plan", raw.asset_id)];
    const plan = readFileSync(planPath, "utf8");
    if (!plan.includes(raw.planned_artifact as string))
      return [finding(file, "planned_artifact_not_generated", raw.asset_id)];
    if (existsSync(resolve(repoRoot, raw.planned_artifact as string)))
      return [finding(file, "planned_asset_already_exists", raw.asset_id)];
    return [];
  }
  if (raw.classification === "compatibility_only") {
    if (
      !isRepoPath(raw.artifact_path) ||
      typeof raw.reason !== "string" ||
      raw.read_only !== true ||
      raw.current_authority !== false
    ) {
      return [finding(file, "invalid_compatibility_only", raw.asset_id)];
    }
    return [];
  }
  if (raw.classification !== "existing_runtime")
    return [finding(file, "unknown_asset_classification", raw.asset_id)];
  if (
    !isRepoPath(raw.artifact_path) ||
    typeof raw.resource_name !== "string" ||
    typeof raw.resource_kind !== "string" ||
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
  if (sha256Digest(source) !== raw.source_digest)
    return [finding(file, "stale_source_digest", raw.asset_id)];
  if (
    (raw.resource_kind === "typescript_export" || raw.resource_kind === "typescript_type") &&
    !exportedNames(source, raw.artifact_path).has(raw.resource_name)
  ) {
    return [finding(file, "missing_runtime_symbol", `${raw.asset_id}:${raw.resource_name}`)];
  }
  if (raw.resource_kind === "json_schema" && !source.includes(raw.resource_name))
    return [finding(file, "missing_runtime_schema", raw.asset_id)];
  if (raw.resource_kind === "cli_command" && !source.includes(raw.resource_name))
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

export function analyzeDesignRealityBinding(
  repoRoot: string,
  files?: string[],
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
  let checked = 0;
  for (const file of designFiles) {
    const content = readFileSync(join(repoRoot, file), "utf8");
    const frontmatterRaw = markdownFrontmatter(content);
    const frontmatter = frontmatterRaw ? parseYaml(frontmatterRaw) : null;
    if (!isRecord(frontmatter)) continue;
    const parsed = parseBinding(content);
    if (parsed === null && !requiredByActivation(frontmatter)) continue;
    checked += 1;
    if (
      !isRecord(parsed) ||
      parsed.schema_version !== "helix-design-reality-binding.v1" ||
      !Array.isArray(parsed.assets) ||
      !Array.isArray(parsed.failure_reachability)
    ) {
      findings.push(finding(file, "missing_or_invalid_binding", DESIGN_REALITY_BINDING_MARKER));
      continue;
    }
    parsed.assets.forEach((asset, index) => {
      findings.push(...validateAsset(repoRoot, file, asset, index));
    });
    parsed.failure_reachability.forEach((witness, index) => {
      findings.push(...validateWitness(repoRoot, file, witness, index));
    });
  }
  return { ok: findings.length === 0, checked, findings };
}

export function designRealityBindingMessages(result: DesignRealityResult): string[] {
  if (result.ok) return [`design-reality-binding — OK (checked=${result.checked})`];
  return result.findings
    .slice(0, 12)
    .map(
      (item) => `design-reality-binding — violation: ${item.file}:${item.reason}:${item.detail}`,
    );
}

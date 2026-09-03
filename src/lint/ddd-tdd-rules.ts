import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type * as TS from "typescript";
import ts from "../shared/typescript-lazy";
import {
  fmValue,
  importedSourceModule,
  lineOf,
  normalizePath,
  sourceModule,
  violatesSourceBoundary,
} from "./shared";

export type DddTddDocScope = "source" | "test";

export interface DddTddDoc {
  path: string;
  text: string;
  scope: DddTddDocScope;
}

export interface DddTddPolicy {
  path: string;
  text: string;
  ruleIds: string[];
}

export interface DddTddWorkflowDoc {
  path: string;
  text: string;
  exists: boolean;
}

export interface DddTddPlanDoc {
  path: string;
  text: string;
}

/**
 * PLAN/test-design から導出する mutation oracle の所在表。
 * これは新しい authority ではなく、oracle ID を既存の test path / L8 文書へ
 * 解決するための読み取り専用 inventory である。
 */
export type DddTddMutationOracleLocators = Readonly<Record<string, readonly string[]>>;

export interface DddTddInputs {
  policy: DddTddPolicy | null;
  workflowDocs: DddTddWorkflowDoc[];
  docs: DddTddDoc[];
  l7Text: string;
  l8Text: string;
  plans: DddTddPlanDoc[];
  mutationOracleLocators?: DddTddMutationOracleLocators;
}

export interface DddTddViolation {
  path: string;
  line: number;
  rule: string;
  message: string;
}

export interface DddTddResult {
  checked: number;
  baselineDebt: number;
  violations: DddTddViolation[];
  ok: boolean;
}

interface WorkflowRequirement {
  path: string;
  patterns: { pattern: RegExp; message: string }[];
}

interface EvidenceDates {
  redAt: string | null;
  greenAt: string | null;
}

const REQUIRED_RULE_IDS = [
  "domain-boundary",
  "invariant-test-trace",
  "red-first-evidence",
  "test-oracle-strength",
  "integration-gwt",
  "unit-oracle-substance",
  "mutation-oracle",
  "engineering-discipline-contract",
  "atomic-change-contract",
];

const REQUIRED_WORKFLOW_DOCS: WorkflowRequirement[] = [
  {
    path: normalizePath(join("docs", "governance", "ddd-tdd-rules.md")),
    patterns: [
      { pattern: /Workflow Placement/, message: "DDD/TDD SSoT must define workflow placement." },
      { pattern: /Forward L6/, message: "DDD/TDD SSoT must anchor Forward L6 timing." },
      { pattern: /G3/, message: "DDD/TDD SSoT must anchor the G3 discipline baseline." },
      { pattern: /L4\/L9/, message: "DDD/TDD SSoT must define the L4/L9 boundary contract." },
      { pattern: /L5\/L8/, message: "DDD/TDD SSoT must define the L5/L8 detailed contract." },
      { pattern: /no-code-first/, message: "DDD/TDD SSoT must define no-code-first ordering." },
      { pattern: /Add-feature/, message: "DDD/TDD SSoT must anchor Add-feature timing." },
      { pattern: /L7 Red/, message: "DDD/TDD SSoT must anchor L7 Red evidence." },
    ],
  },
  {
    path: normalizePath(join("docs", "process", "forward", "L00-L06-design-phase.md")),
    patterns: [
      { pattern: /DDD-TDD-WORKFLOW/, message: "Forward workflow must carry DDD/TDD anchor." },
      {
        pattern: /docs\/governance\/ddd-tdd-rules\.md/,
        message: "Forward workflow must reference the DDD/TDD SSoT.",
      },
      {
        pattern: /engineering_discipline_required/,
        message: "Forward workflow must require the engineering discipline PLAN contract.",
      },
    ],
  },
  {
    path: normalizePath(join("docs", "process", "modes", "add-feature.md")),
    patterns: [
      {
        pattern: /DDD-TDD-WORKFLOW/,
        message: "Add-feature workflow must carry DDD/TDD anchor.",
      },
      {
        pattern: /docs\/governance\/ddd-tdd-rules\.md/,
        message: "Add-feature workflow must reference the DDD/TDD SSoT.",
      },
      { pattern: /add-design/, message: "Add-feature must place DDD in add-design." },
      { pattern: /add-impl/, message: "Add-feature must place TDD evidence in add-impl." },
      {
        pattern: /engineering_discipline_required/,
        message: "Add-feature must require the engineering discipline PLAN contract.",
      },
    ],
  },
];

function collectDocs(repoRoot: string, relDir: string, scope: DddTddDocScope): DddTddDoc[] {
  const root = join(repoRoot, relDir);
  if (!existsSync(root)) return [];
  const docs: DddTddDoc[] = [];
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

function collectPlanDocs(repoRoot: string): DddTddPlanDoc[] {
  const root = join(repoRoot, "docs", "plans");
  if (!existsSync(root)) return [];
  return readdirSync(root)
    .filter((name) => /^PLAN-.*\.md$/.test(name))
    .sort()
    .map((name) => {
      const path = normalizePath(join("docs", "plans", name));
      return { path, text: readFileSync(join(root, name), "utf8") };
    });
}

function collectMarkdownFiles(repoRoot: string, relDir: string): { path: string; text: string }[] {
  const root = join(repoRoot, relDir);
  if (!existsSync(root)) return [];
  const files: { path: string; text: string }[] = [];
  const visit = (absDir: string, relPrefix: string): void => {
    for (const entry of readdirSync(absDir, { withFileTypes: true })) {
      const relPath = normalizePath(join(relPrefix, entry.name));
      const absPath = join(absDir, entry.name);
      if (entry.isDirectory()) {
        visit(absPath, relPath);
        continue;
      }
      if (!entry.isFile() || !entry.name.endsWith(".md")) continue;
      files.push({ path: relPath, text: readFileSync(absPath, "utf8") });
    }
  };
  visit(root, relDir);
  return files.sort((a, b) => a.path.localeCompare(b.path));
}

const MUTATION_ORACLE_ID_PATTERN = /\bU-[A-Za-z0-9]+(?:-[A-Za-z0-9]+)+\b/g;
const MUTATION_ORACLE_FIELD_PATTERN = /\boracle_id:\s*["'`]?([A-Za-z0-9][A-Za-z0-9._:-]*)/g;
const MUTATION_ORACLE_PATH_FIELD_PATTERN =
  /\b(?:test_path|artifact_path):\s*["'`]?((?:tests|docs\/test-design)\/[^\s,}"'`]+)/;

function mutationOracleIds(text: string): string[] {
  return [...text.matchAll(MUTATION_ORACLE_ID_PATTERN)].map((match) => match[0]);
}

function mutationOracleLocatorFromLine(line: string): string | null {
  const match = line.match(MUTATION_ORACLE_PATH_FIELD_PATTERN);
  if (!match?.[1]) return null;
  return normalizePath(match[1]);
}

function addMutationOracleLocator(
  registry: Map<string, Set<string>>,
  oracleId: string,
  locator: string,
): void {
  const existing = registry.get(oracleId) ?? new Set<string>();
  existing.add(locator);
  registry.set(oracleId, existing);
}

function collectMutationOracleLocators(
  repoRoot: string,
  plans: DddTddPlanDoc[],
): DddTddMutationOracleLocators {
  const registry = new Map<string, Set<string>>();

  // verification_bindings / generates の oracle_id は、近接する test_path または
  // test-design artifact が実在する場合だけ locator として登録する。
  for (const plan of plans) {
    const lines = plan.text.split(/\r?\n/);
    for (const [index, line] of lines.entries()) {
      const ids = [...line.matchAll(MUTATION_ORACLE_FIELD_PATTERN)].map((match) => match[1]);
      if (ids.length === 0) continue;
      const nearbyLines = lines.slice(Math.max(0, index - 2), Math.min(lines.length, index + 8));
      const locator = nearbyLines
        .map((candidate) => mutationOracleLocatorFromLine(candidate))
        .find((candidate) => candidate !== null);
      if (!locator) continue;
      const absoluteLocator = join(repoRoot, locator);
      if (!existsSync(absoluteLocator)) continue;
      for (const id of ids) addMutationOracleLocator(registry, id, locator);
    }
  }

  // L7/L8 test-design は oracle ID の定義面であり、文書自身を locator として
  // 登録する。任意の prose 中の ID ではなく、表行または oracle_id field の ID に限定する。
  for (const document of collectMarkdownFiles(repoRoot, join("docs", "test-design"))) {
    for (const line of document.text.split(/\r?\n/)) {
      const ids = line.trimStart().startsWith("|")
        ? mutationOracleIds(line)
        : [...line.matchAll(MUTATION_ORACLE_FIELD_PATTERN)].map((match) => match[1]);
      for (const id of ids) addMutationOracleLocator(registry, id, document.path);
    }
  }

  return Object.fromEntries(
    [...registry.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([id, locators]) => [id, [...locators].sort()]),
  );
}

function maybeRead(repoRoot: string, relPath: string): string {
  const absPath = join(repoRoot, relPath);
  return existsSync(absPath) ? readFileSync(absPath, "utf8") : "";
}

export function loadDddTddPolicy(repoRoot: string = process.cwd()): DddTddPolicy | null {
  const path = normalizePath(join("docs", "governance", "ddd-tdd-rules.md"));
  const absPath = join(repoRoot, path);
  if (!existsSync(absPath)) return null;
  const text = readFileSync(absPath, "utf8");
  const ruleIds = [...text.matchAll(/^\s*-\s+id:\s*([a-z0-9-]+)\s*$/gm)].map((m) => m[1]);
  return { path, text, ruleIds };
}

export function loadDddTddWorkflowDocs(repoRoot: string = process.cwd()): DddTddWorkflowDoc[] {
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

export function loadDddTddInputs(repoRoot: string = process.cwd()): DddTddInputs {
  const plans = collectPlanDocs(repoRoot);
  return {
    policy: loadDddTddPolicy(repoRoot),
    workflowDocs: loadDddTddWorkflowDocs(repoRoot),
    docs: [...collectDocs(repoRoot, "src", "source"), ...collectDocs(repoRoot, "tests", "test")],
    l7Text: maybeRead(
      repoRoot,
      normalizePath(join("docs", "test-design", "harness", "L7-unit-test-design.md")),
    ),
    l8Text: maybeRead(
      repoRoot,
      normalizePath(join("docs", "test-design", "harness", "L9-integration-test-design.md")),
    ),
    plans,
    mutationOracleLocators: collectMutationOracleLocators(repoRoot, plans),
  };
}

function policyViolations(policy: DddTddPolicy | null): DddTddViolation[] {
  if (!policy) {
    return [
      {
        path: normalizePath(join("docs", "governance", "ddd-tdd-rules.md")),
        line: 1,
        rule: "ddd-tdd-policy-missing",
        message: "DDD/TDD SSoT document is missing.",
      },
    ];
  }
  const declared = new Set(policy.ruleIds);
  const required = new Set(REQUIRED_RULE_IDS);
  const violations: DddTddViolation[] = [];
  for (const id of REQUIRED_RULE_IDS) {
    if (declared.has(id)) continue;
    violations.push({
      path: policy.path,
      line: 1,
      rule: "ddd-tdd-policy-missing-rule",
      message: `DDD/TDD SSoT is missing required rule id ${id}.`,
    });
  }
  for (const id of policy.ruleIds) {
    if (required.has(id)) continue;
    violations.push({
      path: policy.path,
      line: 1,
      rule: "ddd-tdd-policy-unknown-rule",
      message: `DDD/TDD SSoT declares unknown rule id ${id}.`,
    });
  }
  return violations;
}

function workflowViolations(docs: DddTddWorkflowDoc[]): DddTddViolation[] {
  const byPath = new Map(docs.map((doc) => [doc.path, doc]));
  const violations: DddTddViolation[] = [];
  for (const requirement of REQUIRED_WORKFLOW_DOCS) {
    const doc = byPath.get(requirement.path);
    if (!doc?.exists) {
      violations.push({
        path: requirement.path,
        line: 1,
        rule: "ddd-tdd-workflow-missing-doc",
        message: "DDD/TDD workflow placement document is missing.",
      });
      continue;
    }
    for (const patternRequirement of requirement.patterns) {
      if (patternRequirement.pattern.test(doc.text)) continue;
      violations.push({
        path: requirement.path,
        line: 1,
        rule: "ddd-tdd-workflow-missing-reference",
        message: patternRequirement.message,
      });
    }
  }
  return violations;
}

function domainBoundaryViolations(docs: DddTddDoc[]): DddTddViolation[] {
  const violations: DddTddViolation[] = [];
  for (const doc of docs.filter((d) => d.scope === "source")) {
    const sourceFile = ts.createSourceFile(doc.path, doc.text, ts.ScriptTarget.Latest, true);
    const visit = (node: TS.Node): void => {
      if (!ts.isImportDeclaration(node) || !ts.isStringLiteral(node.moduleSpecifier)) {
        ts.forEachChild(node, visit);
        return;
      }
      const fromModule = sourceModule(doc.path);
      const toModule = importedSourceModule(doc.path, node.moduleSpecifier.text);
      if (violatesSourceBoundary(fromModule, toModule)) {
        violations.push({
          path: doc.path,
          line: lineOf(sourceFile, node.moduleSpecifier.getStart(sourceFile)),
          rule: "domain-boundary",
          message: `Module ${fromModule} must not import ${toModule}; keep domain/governance boundaries acyclic.`,
        });
      }
      ts.forEachChild(node, visit);
    };
    visit(sourceFile);
  }
  return violations;
}

function invariantTraceViolations(policy: DddTddPolicy | null, l7Text: string): DddTddViolation[] {
  if (!policy) return [];
  const violations: DddTddViolation[] = [];
  for (const match of policy.text.matchAll(/id:\s*(DDD-INV-\d+)[^\n]*oracle:\s*(U-[A-Z0-9-]+)/g)) {
    const [, invariantId = "", oracle = ""] = match;
    if (l7Text.includes(oracle)) continue;
    violations.push({
      path: policy.path,
      line: policy.text.slice(0, match.index).split(/\r?\n/).length,
      rule: "invariant-test-trace",
      message: `Invariant ${invariantId} references ${oracle}, but the L7 test design does not define it.`,
    });
  }
  return violations;
}

function booleanField(text: string, key: string): boolean {
  return new RegExp(`^${key}:\\s*true\\s*$`, "m").test(text);
}

function evidenceDates(text: string): EvidenceDates {
  return {
    redAt: fmValue(text, "red_at") ?? null,
    greenAt: fmValue(text, "green_at") ?? null,
  };
}

function redFirstViolations(plans: DddTddPlanDoc[]): DddTddViolation[] {
  const violations: DddTddViolation[] = [];
  for (const plan of plans) {
    const status = fmValue(plan.text, "status") ?? null;
    const required = booleanField(plan.text, "tdd_red_required");
    if (status !== "confirmed" || !required) continue;
    const dates = evidenceDates(plan.text);
    if (!dates.redAt || !dates.greenAt) {
      violations.push({
        path: plan.path,
        line: 1,
        rule: "red-first-evidence",
        message: "Confirmed TDD plan requires red_at and green_at evidence.",
      });
      continue;
    }
    if (Date.parse(dates.redAt) > Date.parse(dates.greenAt)) {
      violations.push({
        path: plan.path,
        line: 1,
        rule: "red-first-evidence",
        message: "red_at must be earlier than or equal to green_at.",
      });
    }
  }
  return violations;
}

const DISCIPLINE_CUTOFF = Date.parse("2026-07-25T00:00:00Z");
const DISCIPLINE_LAYERS = new Set(["L3", "L4", "L5", "L6", "L7"]);
const NO_CODE_DECISIONS = new Set([
  "no_change",
  "delete",
  "configure",
  "reuse",
  "modify",
  "add_code",
]);
const DDD_MODELING_DECISIONS = new Set([
  "none",
  "entity",
  "aggregate",
  "value_object",
  "domain_service",
  "policy",
  "port",
  "adapter",
  "pure_function",
  "mixed",
]);
const COMPLEXITY_EFFECTS = new Set(["net_negative", "net_neutral", "justified_positive"]);
const REFACTOR_STEPS = new Set([
  "not_applicable",
  "characterize",
  "introduce_contract",
  "dual_green",
  "migrate_one_consumer",
  "verify_consumer_zero",
  "remove_legacy",
]);
const LEGACY_RETIREMENT_STATES = new Set([
  "not_applicable",
  "retained",
  "dual_green",
  "consumer_migration",
  "consumer_zero",
  "removed",
]);
const REQUIRED_DISCIPLINE_FIELDS = [
  "behavior_contract_id",
  "responsibility_owner",
  "change_slice",
  "refactor_step",
  "legacy_retirement_state",
  "no_code_decision",
  "ddd_modeling_decision",
  "contract_preconditions",
  "contract_postconditions",
  "contract_invariants",
  "contract_failures",
  "tdd_red_required",
  "complexity_effect",
];

function substantiveField(text: string, key: string): string | null {
  const value =
    fmValue(text, key)
      ?.trim()
      .replace(/^["']|["']$/g, "") ?? "";
  if (!value || /^(?:todo|tbd|placeholder|未定|-|—)$/i.test(value)) return null;
  return value;
}

/**
 * scope の閾値は DISCIPLINE_CUTOFF（時間）ただ一つとし、DISCIPLINE_LAYERS は
 * 「どの PLAN に contract を義務づけるか」だけに使う。cutoff 以降の PLAN が
 * engineering_discipline_required: true を宣言した時点で、layer に関わらずその宣言内容は
 * 検証対象になる（Issue #549）。宣言を無視すると layer: cross の PLAN が enum 外の語彙を
 * 自由に書けてしまい、実際に refactor_step / complexity_effect / legacy_retirement_state が
 * 正規語彙から漂流した。cutoff 前の PLAN は宣言していても従来どおり grandfathered のままとし、
 * 遡及的な記入要求を発生させない。
 */
function requiresEngineeringDiscipline(text: string): boolean {
  const created = fmValue(text, "created");
  if (!created) return false;
  const createdAt = Date.parse(created);
  if (!Number.isFinite(createdAt) || createdAt < DISCIPLINE_CUTOFF) return false;
  const layer = fmValue(text, "layer");
  return (
    booleanField(text, "engineering_discipline_required") ||
    (!!layer && DISCIPLINE_LAYERS.has(layer))
  );
}

function engineeringDisciplineViolations(plans: DddTddPlanDoc[]): DddTddViolation[] {
  const violations: DddTddViolation[] = [];
  for (const plan of plans) {
    if (!requiresEngineeringDiscipline(plan.text)) continue;
    if (!booleanField(plan.text, "engineering_discipline_required")) {
      violations.push({
        path: plan.path,
        line: 1,
        rule: "engineering-discipline-contract",
        message:
          "New L3-L7 PLANs must opt into the engineering discipline contract with engineering_discipline_required: true.",
      });
      continue;
    }
    for (const field of REQUIRED_DISCIPLINE_FIELDS) {
      if (substantiveField(plan.text, field)) continue;
      violations.push({
        path: plan.path,
        line: 1,
        rule: "engineering-discipline-contract",
        message: `Engineering discipline contract requires a substantive ${field} field.`,
      });
    }
    const noCodeDecision = substantiveField(plan.text, "no_code_decision");
    if (noCodeDecision && !NO_CODE_DECISIONS.has(noCodeDecision)) {
      violations.push({
        path: plan.path,
        line: 1,
        rule: "engineering-discipline-contract",
        message: `Unknown no_code_decision ${noCodeDecision}.`,
      });
    }
    const modelingDecision = substantiveField(plan.text, "ddd_modeling_decision");
    if (modelingDecision && !DDD_MODELING_DECISIONS.has(modelingDecision)) {
      violations.push({
        path: plan.path,
        line: 1,
        rule: "engineering-discipline-contract",
        message: `Unknown ddd_modeling_decision ${modelingDecision}.`,
      });
    }
    const complexityEffect = substantiveField(plan.text, "complexity_effect");
    if (complexityEffect && !COMPLEXITY_EFFECTS.has(complexityEffect)) {
      violations.push({
        path: plan.path,
        line: 1,
        rule: "engineering-discipline-contract",
        message: `Unknown complexity_effect ${complexityEffect}.`,
      });
    }
    if (
      (noCodeDecision === "add_code" || complexityEffect === "justified_positive") &&
      (!substantiveField(plan.text, "complexity_justification") ||
        !substantiveField(plan.text, "removal_trigger"))
    ) {
      violations.push({
        path: plan.path,
        line: 1,
        rule: "engineering-discipline-contract",
        message:
          "add_code or justified_positive requires complexity_justification and removal_trigger.",
      });
    }
    const changeSlice = substantiveField(plan.text, "change_slice");
    if (changeSlice && changeSlice !== "atomic") {
      violations.push({
        path: plan.path,
        line: 1,
        rule: "atomic-change-contract",
        message: `change_slice must be atomic, received ${changeSlice}.`,
      });
    }
    const refactorStep = substantiveField(plan.text, "refactor_step");
    if (refactorStep && !REFACTOR_STEPS.has(refactorStep)) {
      violations.push({
        path: plan.path,
        line: 1,
        rule: "atomic-change-contract",
        message: `Unknown refactor_step ${refactorStep}.`,
      });
    }
    const retirementState = substantiveField(plan.text, "legacy_retirement_state");
    if (retirementState && !LEGACY_RETIREMENT_STATES.has(retirementState)) {
      violations.push({
        path: plan.path,
        line: 1,
        rule: "atomic-change-contract",
        message: `Unknown legacy_retirement_state ${retirementState}.`,
      });
    }
    if (refactorStep === "remove_legacy" && retirementState !== "consumer_zero") {
      violations.push({
        path: plan.path,
        line: 1,
        rule: "atomic-change-contract",
        message: "remove_legacy requires legacy_retirement_state: consumer_zero.",
      });
    }
  }
  return violations;
}

const MUTATION_ORACLE_EVIDENCE_PATTERN =
  /^(?:mutation_oracle(?:_evidence)?|mutation_test(?:_evidence)?):\s*(.+)$/m;
const MUTATION_ORACLE_PLACEHOLDER =
  /^("|')?(?:todo|tbd|placeholder|none|n\/a|-|—|未定|なし)("|')?$/i;
const MUTATION_ORACLE_LOCATOR_PATTERN =
  /\b(?:tests\/[^\s"'`]+\.test\.ts|docs\/test-design\/[^\s"'`]+|\.helix\/audit\/[^\s"'`]+|vitest)\b/;
const MUTATION_ORACLE_KILL_SIGNAL_PATTERN = /\b(?:kill(?:ed|s)?|fail(?:ed|s)?|red|mutation)\b/i;

interface MutationOracleEvidenceResult {
  line: number;
  value: string;
  valid: boolean;
  failureReason?: string;
}

function mutationOracleEvidence(
  text: string,
  locators: DddTddMutationOracleLocators = {},
): MutationOracleEvidenceResult | null {
  const match = text.match(MUTATION_ORACLE_EVIDENCE_PATTERN);
  const value = match?.[1]?.trim().replace(/^["']|["']$/g, "") ?? "";
  if (!match || MUTATION_ORACLE_PLACEHOLDER.test(value)) return null;
  const line = text.slice(0, match.index).split(/\r?\n/).length;
  const hasExplicitLocator = MUTATION_ORACLE_LOCATOR_PATTERN.test(value);
  const oracleIds = mutationOracleIds(value);
  const resolvedOracleIds = oracleIds.filter((id) => (locators[id]?.length ?? 0) > 0);
  if (!hasExplicitLocator && resolvedOracleIds.length === 0) {
    return {
      line,
      value,
      valid: false,
      failureReason:
        oracleIds.length > 0 ? `unresolved-oracle-id:${oracleIds.join(",")}` : "locator-missing",
    };
  }
  if (!MUTATION_ORACLE_KILL_SIGNAL_PATTERN.test(value)) {
    return { line, value, valid: false, failureReason: "kill-signal-missing" };
  }
  return { line, value, valid: true };
}

function mutationOracleViolations(
  plans: DddTddPlanDoc[],
  locators: DddTddMutationOracleLocators = {},
): DddTddViolation[] {
  const violations: DddTddViolation[] = [];
  for (const plan of plans) {
    const status = fmValue(plan.text, "status") ?? null;
    const required =
      status === "confirmed" &&
      (booleanField(plan.text, "tdd_red_required") ||
        booleanField(plan.text, "mutation_oracle_required"));
    if (!required) continue;
    const evidence = mutationOracleEvidence(plan.text, locators);
    if (evidence?.valid) continue;
    const detail = evidence?.failureReason?.startsWith("unresolved-oracle-id:")
      ? ` Unresolvable oracle ID: ${evidence.failureReason.slice("unresolved-oracle-id:".length)}.`
      : evidence?.failureReason === "kill-signal-missing"
        ? " Include a fail/kill/red mutation result."
        : " Include a resolvable locator.";
    violations.push({
      path: plan.path,
      line: evidence?.line ?? 1,
      rule: "mutation-oracle",
      message:
        "Confirmed TDD plan requires concrete mutation_oracle_evidence showing the test would fail or kill the seeded defect. Accepted locators: tests/*.test.ts, docs/test-design/..., .helix/audit/..., vitest, or an oracle_id resolvable from PLAN bindings/generates or test-design." +
        detail,
    });
  }
  return violations;
}

function assertionSummary(text: string): { hasAssertion: boolean; weakOnly: boolean } {
  const expectCount = (text.match(/\bexpect\s*\(/g) ?? []).length;
  const assertCount = (text.match(/\bassert(?:\.|\s*\()/g) ?? []).length;
  if (expectCount === 0 && assertCount === 0) return { hasAssertion: false, weakOnly: false };
  const weakMatcherCount = (text.match(/\.toBe(?:Truthy|Falsy)\s*\(\s*\)/g) ?? []).length;
  return {
    hasAssertion: true,
    weakOnly: assertCount === 0 && expectCount > 0 && expectCount === weakMatcherCount,
  };
}

function testOracleViolations(docs: DddTddDoc[]): DddTddViolation[] {
  const violations: DddTddViolation[] = [];
  for (const doc of docs.filter((d) => d.scope === "test")) {
    const sourceFile = ts.createSourceFile(doc.path, doc.text, ts.ScriptTarget.Latest, true);
    const visit = (node: TS.Node): void => {
      if (!ts.isCallExpression(node)) {
        ts.forEachChild(node, visit);
        return;
      }
      const name = node.expression.getText(sourceFile);
      if (name !== "it" && name !== "test") {
        ts.forEachChild(node, visit);
        return;
      }
      const bodyNode = node.arguments[1];
      if (!bodyNode || (!ts.isArrowFunction(bodyNode) && !ts.isFunctionExpression(bodyNode))) {
        ts.forEachChild(node, visit);
        return;
      }
      const body = bodyNode.body.getText(sourceFile);
      const summary = assertionSummary(body);
      if (!summary.hasAssertion) {
        violations.push({
          path: doc.path,
          line: lineOf(sourceFile, node.getStart(sourceFile)),
          rule: "test-oracle-strength",
          message: "Test cases must contain an explicit expect/assert oracle.",
        });
      } else if (summary.weakOnly) {
        violations.push({
          path: doc.path,
          line: lineOf(sourceFile, node.getStart(sourceFile)),
          rule: "test-oracle-strength",
          message: "Test cases must not rely only on toBeTruthy/toBeFalsy weak assertions.",
        });
      }
      ts.forEachChild(node, visit);
    };
    visit(sourceFile);
  }
  return violations;
}

function baselineDebtKeys(policy: DddTddPolicy | null): Set<string> {
  const keys = new Set<string>();
  if (!policy) return keys;
  for (const match of policy.text.matchAll(
    /^\s*-\s+([^:\s]+\.test\.ts):(\d+)\s+([a-z0-9-]+)\s*$/gm,
  )) {
    const [, path = "", line = "", rule = ""] = match;
    keys.add(`${normalizePath(path)}:${line}:${rule}`);
  }
  return keys;
}

function violationKey(violation: DddTddViolation): string {
  return `${normalizePath(violation.path)}:${violation.line}:${violation.rule}`;
}

function integrationGwtViolations(l9Text: string): DddTddViolation[] {
  const headerMatch = l9Text.match(/\|\s*IT-ID[^|]*\|\s*Given[^|]*\|\s*When[^|]*\|\s*Then[^|]*\|/i);
  if (!headerMatch) {
    return [
      {
        path: normalizePath(
          join("docs", "test-design", "harness", "L9-integration-test-design.md"),
        ),
        line: 1,
        rule: "integration-gwt",
        message: "L9 integration test design must define an IT-ID/Given/When/Then table.",
      },
    ];
  }
  const section = l9Text.slice(headerMatch.index);
  const rows = section.split(/\r?\n/).filter((line) => /^\|\s*IT-[A-Z0-9-]+\s*\|/.test(line));
  const violations: DddTddViolation[] = [];
  if (rows.length === 0) {
    violations.push({
      path: normalizePath(join("docs", "test-design", "harness", "L9-integration-test-design.md")),
      line: l9Text.slice(0, headerMatch.index).split(/\r?\n/).length,
      rule: "integration-gwt",
      message: "L9 GWT table has no IT-* rows.",
    });
  }
  for (const row of rows) {
    const cells = row
      .split("|")
      .slice(1, -1)
      .map((cell) => cell.trim());
    if (cells[1] && cells[2] && cells[3]) continue;
    violations.push({
      path: normalizePath(join("docs", "test-design", "harness", "L9-integration-test-design.md")),
      line: l9Text.slice(0, l9Text.indexOf(row)).split(/\r?\n/).length,
      rule: "integration-gwt",
      message: `${cells[0] ?? "IT row"} must have non-empty Given, When, and Then cells.`,
    });
  }
  return violations;
}

/** L7 unit test-design table の expected-behavior 列で skeleton (骨格) とみなすマーカー / 最小実質長。 */
const UNIT_ORACLE_MIN_SUBSTANCE = 6;
const UNIT_ORACLE_SKELETON = /^(-|—|todo|tbd|placeholder|骨格|n\/a|wip)$/i;

/**
 * IMP-083 残差 (test-design substance): L6/L7 unit test-design の U-* oracle 行が**実ケースの
 * expected behavior** を持つ (空骨格でない) ことを検査する。pair-freeze は link 存在、oracle-test-trace
 * は citation、test-oracle-strength は test コードの assert を見るが、**unit test-design の U-* 行の
 * 期待結果セル中身**は従来どの gate も見なかった (freeze 時の骨格凍結を素通り)。FR-L1-50 (oracle strength)
 * 配下の追加 rule。末尾数字の oracle id (`U-…-NNN`、多セグメント `U-FR-L1-21-01` 等も含む) のみ対象 =
 * `U-ID` ヘッダ行を除外 (false-positive 回避、QA review Critical 反映)。expected-behavior は ID+target 列を
 * 除く残り全セルを連結して評価する (inline `|` で expected が分割されても拾う、QA review Minor 反映)。
 */
function unitOracleSubstanceViolations(l7Text: string): DddTddViolation[] {
  const path = normalizePath(join("docs", "test-design", "harness", "L7-unit-test-design.md"));
  const violations: DddTddViolation[] = [];
  for (const [index, line] of l7Text.split(/\r?\n/).entries()) {
    // 多セグメント oracle id を許容しつつ末尾 `-NNN` 必須 (`U-ID` ヘッダは末尾数字なしで除外)。
    if (!/^\|\s*U-[A-Z0-9-]+-[0-9]+\s*\|/.test(line)) continue;
    const cells = line
      .split("|")
      .slice(1, -1)
      .map((cell) => cell.trim());
    const id = cells[0] ?? "U row";
    // expected behavior = ID(0) + target(1) を除く残りセル連結 (inline pipe 分割を再結合)。
    const substance = cells.slice(2).join(" ").trim();
    if (substance.length < UNIT_ORACLE_MIN_SUBSTANCE || UNIT_ORACLE_SKELETON.test(substance)) {
      violations.push({
        path,
        line: index + 1,
        rule: "unit-oracle-substance",
        message: `${id} unit test-design row must describe a real expected behavior (non-skeleton).`,
      });
    }
  }
  return violations;
}

export function analyzeDddTddRules(inputs: DddTddInputs): DddTddResult {
  const violations: DddTddViolation[] = [];
  violations.push(...policyViolations(inputs.policy));
  violations.push(...workflowViolations(inputs.workflowDocs));
  violations.push(...domainBoundaryViolations(inputs.docs));
  violations.push(...invariantTraceViolations(inputs.policy, inputs.l7Text));
  violations.push(...redFirstViolations(inputs.plans));
  violations.push(...engineeringDisciplineViolations(inputs.plans));
  violations.push(...mutationOracleViolations(inputs.plans, inputs.mutationOracleLocators));
  violations.push(...testOracleViolations(inputs.docs));
  violations.push(...integrationGwtViolations(inputs.l8Text));
  violations.push(...unitOracleSubstanceViolations(inputs.l7Text));
  const baseline = baselineDebtKeys(inputs.policy);
  const activeViolations = violations.filter((violation) => !baseline.has(violationKey(violation)));
  return {
    checked: inputs.docs.length,
    baselineDebt: violations.length - activeViolations.length,
    violations: activeViolations,
    ok: activeViolations.length === 0,
  };
}

export function dddTddRulesMessages(result: DddTddResult): string[] {
  if (result.ok) {
    return [
      `ddd-tdd-rules - OK (TS docs ${result.checked}, violations 0, baseline debt ${result.baselineDebt})`,
    ];
  }
  const sample = result.violations
    .slice(0, 8)
    .map((v) => `${v.path}:${v.line}:${v.rule}`)
    .join(", ");
  return [`ddd-tdd-rules - violation ${result.violations.length} (${sample}).`];
}

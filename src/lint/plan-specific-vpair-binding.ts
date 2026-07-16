import { createHash } from "node:crypto";
import { existsSync, lstatSync, readdirSync, readFileSync, realpathSync, statSync } from "node:fs";
import { isAbsolute, join, relative, resolve } from "node:path";
import ts from "typescript";
import { parse as parseYaml } from "yaml";
import { checkCrossAgentModelPair, modelProviderFromId } from "../schema";
import { frontmatterSchema, PLAN_SPECIFIC_ORACLE_ID_PATTERN } from "../schema/frontmatter";
import {
  greenCommandViolationReason,
  type ReviewEntry,
  TECHNICAL_APPROVAL_VERDICTS,
} from "./review-evidence";

export const PLAN_SPECIFIC_VPAIR_AUTHORITY_SCHEMA =
  "plan-specific-vpair-binding-authority.v3" as const;
export const PLAN_SPECIFIC_VPAIR_AUTHORITY_PATH =
  "config/plan-specific-vpair-binding-authority.json" as const;
export const PLAN_SPECIFIC_VPAIR_LEGACY_IDENTITY_DIGEST =
  "sha256:18296bffa4a37adbab68e3602677eaa5008a26807866bff421d52e9597b30786";
export const PLAN_SPECIFIC_VPAIR_INITIAL_DIGEST =
  "sha256:bce8ab65d48750e30f39aeb673267bcf60a85da5f58eeeb8b42d7a7cd713787e";
export const PLAN_SPECIFIC_VPAIR_TERMINAL_DIGEST =
  "sha256:315c1a96a957f6d272b02af3cd65518665acb84d23fd33fe64c117fdb546000b";

export type PlanSpecificVpairReason =
  | "verification_bindings_absent"
  | "binding_schema_invalid"
  | "binding_parent_mismatch"
  | "oracle_not_declared"
  | "oracle_ambiguous"
  | "oracle_table_schema_invalid"
  | "oracle_test_citation_mismatch"
  | "test_not_generated"
  | "test_path_missing"
  | "plan_citation_missing"
  | "oracle_citation_missing"
  | "oracle_owned_by_multiple_plans"
  | "duplicate_binding"
  | "generated_test_unbound"
  | "baseline_plan_semantic_drift"
  | "baseline_authority_invalid"
  | "resolved_finding_reappeared";

export interface PlanSpecificVpairFinding {
  plan_id: string;
  reason: PlanSpecificVpairReason;
  detail: string | null;
  fingerprint: string;
}

export interface VerificationBinding {
  parent_design: string;
  oracle_id: string;
  test_path: string;
}

export interface PlanSpecificVpairPlan {
  path?: unknown;
  plan_id: unknown;
  kind: unknown;
  status: unknown;
  parent_design: unknown;
  pair_artifact: unknown;
  verification_bindings?: unknown;
  generates?: unknown;
  resolves_authority?: unknown;
  review_evidence?: unknown;
  title?: unknown;
  layer?: unknown;
  drive?: unknown;
  agent_slots?: unknown;
  dependencies?: unknown;
  /** Markdown bodyを含むPLAN全文。exact PLAN ID citationの検査対象はtest本文側。 */
  source?: string;
}

export interface EligibleOracleRow {
  oracleId: string;
  testPaths: string[];
  line: number;
}

export interface TestFileEvidence {
  exists: boolean;
  regular: boolean;
  symlink: boolean;
  insideRepo: boolean;
  source: string;
  executableOracleCases: ReadonlyMap<string, number>;
}

export interface PlanSpecificVpairAuthorityInitial {
  fingerprint: string;
  plan_id: string;
  reason: PlanSpecificVpairReason;
  detail: string | null;
  plan_path: string;
  plan_semantic_digest: string;
}

export interface PlanSpecificVpairAuthorityTombstone {
  fingerprint: string;
  resolved_at: string;
  resolution_plan_id: string;
  resolution_plan_semantic_digest: string;
  previous_digest: string;
  entry_digest: string;
}

export interface PlanSpecificVpairAuthority {
  schemaVersion: typeof PLAN_SPECIFIC_VPAIR_AUTHORITY_SCHEMA;
  initialAuthority: PlanSpecificVpairAuthorityInitial[];
  resolvedTombstones: PlanSpecificVpairAuthorityTombstone[];
}

export interface PlanSpecificVpairBindingInput {
  plans: PlanSpecificVpairPlan[];
  pairDocuments: ReadonlyMap<string, string>;
  testFiles: ReadonlyMap<string, TestFileEvidence>;
  authority?: unknown;
  /** code-side pin。adapter/doctorは必ず指定し、unit testでは省略可能。 */
  expectedInitialDigest?: string;
  expectedTerminalDigest?: string;
  expectedLegacyIdentityDigest?: string;
  /** resolution PLANの証拠snapshot。repo adapterは全PLANから構築する。 */
  resolutionPlans?: ReadonlyMap<string, PlanSpecificVpairPlan>;
}

export interface PlanSpecificVpairBindingResult {
  ok: boolean;
  checkedPlans: number;
  findings: PlanSpecificVpairFinding[];
  exempted: PlanSpecificVpairFinding[];
}

const SHA256 = /^sha256:[a-f0-9]{64}$/;
const UTC_INSTANT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;
const ELIGIBLE_HEADER = ["U-ID", "対象", "反例と期待結果", "test citation"];

function sha256(value: string): string {
  return `sha256:${createHash("sha256").update(value, "utf8").digest("hex")}`;
}

function canonicalizeSemanticValue(value: unknown, key = ""): unknown {
  if (typeof value === "string") return value.normalize("NFC");
  if (Array.isArray(value)) {
    const normalized = value.map((entry) => canonicalizeSemanticValue(entry));
    if (key === "generates")
      return normalized.sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
    if (key === "requires" || key === "references")
      return normalized.sort((a, b) => String(a).localeCompare(String(b)));
    return normalized;
  }
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([entryKey, entryValue]) => [
          entryKey,
          canonicalizeSemanticValue(entryValue, entryKey),
        ]),
    );
  return value;
}

function normalizedPlanBody(source: unknown): string {
  if (typeof source !== "string") return "";
  const body = source.replace(/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/, "");
  return `${body
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.replace(/[\t ]+$/g, ""))
    .join("\n")
    .trimEnd()
    .normalize("NFC")}\n`;
}

/** legacy exemptionをmutableな運用証跡ではなくPLANの設計・実装意味へ固定する。 */
export function planSemanticDigest(plan: PlanSpecificVpairPlan): string {
  const frontmatter = { ...(plan as unknown as Record<string, unknown>) };
  for (const mutable of [
    "path",
    "source",
    "updated",
    "owner",
    "review_evidence",
    "verification_bindings",
  ])
    delete frontmatter[mutable];
  return sha256(
    JSON.stringify({
      frontmatter: canonicalizeSemanticValue(frontmatter),
      body: normalizedPlanBody(plan.source),
    }),
  );
}

export function findingFingerprint(
  value: Pick<PlanSpecificVpairFinding, "plan_id" | "reason" | "detail">,
): string {
  return sha256(
    JSON.stringify({
      plan_id: value.plan_id,
      reason: value.reason,
      detail: value.detail ?? null,
    }),
  );
}

export function authorityInitialDigest(initial: PlanSpecificVpairAuthorityInitial[]): string {
  return sha256(
    `${initial.map((entry) => JSON.stringify(canonicalizeSemanticValue(entry))).join("\n")}\n`,
  );
}

/** v1 migration前のexact finding identity集合。v2 full-entry pinとは独立に永続固定する。 */
export function authorityLegacyIdentityDigest(
  initial: PlanSpecificVpairAuthorityInitial[],
): string {
  return sha256(`${initial.map((entry) => entry.fingerprint).join("\n")}\n`);
}

export function authorityTombstoneDigest(
  previousDigest: string,
  value: Pick<
    PlanSpecificVpairAuthorityTombstone,
    "fingerprint" | "resolved_at" | "resolution_plan_id" | "resolution_plan_semantic_digest"
  >,
): string {
  return sha256(
    `${previousDigest}\n${value.fingerprint}\n${value.resolved_at}\n${value.resolution_plan_id}\n${value.resolution_plan_semantic_digest}`,
  );
}

/** 解消PLANの設計意味とreview証拠をtombstoneへ固定する。 */
export function resolutionPlanSemanticDigest(plan: PlanSpecificVpairPlan): string {
  return sha256(
    JSON.stringify({
      plan: planSemanticDigest(plan),
      review_evidence: canonicalizeSemanticValue(plan.review_evidence ?? null),
    }),
  );
}

function validResolutionPlan(input: {
  plan: PlanSpecificVpairPlan | undefined;
  tombstone: PlanSpecificVpairAuthorityTombstone;
  initial: PlanSpecificVpairAuthorityInitial;
  plansById: ReadonlyMap<string, PlanSpecificVpairPlan>;
  rawFindings: readonly PlanSpecificVpairFinding[];
}): boolean {
  const { plan, tombstone, initial, plansById, rawFindings } = input;
  if (!plan || plan.status !== "completed" || plan.plan_id !== tombstone.resolution_plan_id)
    return false;
  const metadata = plan.resolves_authority;
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) return false;
  const record = metadata as Record<string, unknown>;
  if (
    Object.keys(record).sort().join(",") !== "authority_path,fingerprint,reason,target_plan_id" ||
    record.authority_path !== PLAN_SPECIFIC_VPAIR_AUTHORITY_PATH ||
    record.fingerprint !== tombstone.fingerprint ||
    record.target_plan_id !== initial.plan_id ||
    record.reason !== initial.reason
  )
    return false;
  const target = plansById.get(initial.plan_id);
  if (
    !target ||
    !frontmatterSchema.safeParse(target).success ||
    !frontmatterSchema.safeParse(plan).success ||
    target.path !== initial.plan_path ||
    (target.kind !== "impl" && target.kind !== "add-impl") ||
    target.status === "archived" ||
    !Array.isArray(target.verification_bindings) ||
    target.verification_bindings.length === 0 ||
    !plansById.has(String(plan.plan_id)) ||
    !Array.isArray(plan.verification_bindings) ||
    plan.verification_bindings.length === 0 ||
    rawFindings.some(
      (finding) => finding.plan_id === initial.plan_id || finding.plan_id === plan.plan_id,
    )
  )
    return false;
  if (!Array.isArray(plan.generates)) return false;
  const generated = new Map(
    plan.generates.flatMap((raw) => {
      if (!raw || typeof raw !== "object" || Array.isArray(raw)) return [];
      const item = raw as Record<string, unknown>;
      return typeof item.artifact_path === "string" && typeof item.artifact_type === "string"
        ? ([[item.artifact_path, item.artifact_type]] as const)
        : [];
    }),
  );
  if (
    generated.get(PLAN_SPECIFIC_VPAIR_AUTHORITY_PATH) !== "config" ||
    generated.get(initial.plan_path) !== "markdown_doc"
  )
    return false;
  if (!Array.isArray(plan.review_evidence)) return false;
  const independentlyReviewed = plan.review_evidence.some((raw) => {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return false;
    const review = raw as Record<string, unknown>;
    const kind = review.review_kind;
    const verdict = typeof review.verdict === "string" ? review.verdict.toLowerCase() : "";
    const worker = typeof review.worker_model === "string" ? review.worker_model.trim() : "";
    const reviewer = typeof review.reviewer_model === "string" ? review.reviewer_model.trim() : "";
    const modelsIndependent =
      kind === "cross_agent"
        ? checkCrossAgentModelPair(worker, reviewer).ok
        : kind === "intra_runtime_subagent" &&
          modelProviderFromId(worker) !== "unknown" &&
          modelProviderFromId(reviewer) !== "unknown" &&
          worker.toLowerCase() !== reviewer.toLowerCase();
    const reviewedAt = typeof review.reviewed_at === "string" ? review.reviewed_at : "";
    const testsGreenAt = typeof review.tests_green_at === "string" ? review.tests_green_at : "";
    const reviewedEpoch = Date.parse(reviewedAt);
    const testsGreenEpoch = Date.parse(testsGreenAt);
    const commands = Array.isArray(review.green_commands) ? review.green_commands : [];
    const commandTimesValid =
      commands.length > 0 &&
      commands.every((command) => {
        if (!command || typeof command !== "object" || Array.isArray(command)) return false;
        const completedAt = (command as Record<string, unknown>).completed_at;
        if (typeof completedAt !== "string") return false;
        const completedEpoch = Date.parse(completedAt);
        return Number.isFinite(completedEpoch) && completedEpoch <= testsGreenEpoch;
      });
    return (
      modelsIndependent &&
      TECHNICAL_APPROVAL_VERDICTS.has(verdict) &&
      Number.isFinite(testsGreenEpoch) &&
      Number.isFinite(reviewedEpoch) &&
      testsGreenEpoch <= reviewedEpoch &&
      commandTimesValid &&
      greenCommandViolationReason(review as unknown as ReviewEntry) === null
    );
  });
  return (
    independentlyReviewed &&
    SHA256.test(tombstone.resolution_plan_semantic_digest) &&
    resolutionPlanSemanticDigest(plan) === tombstone.resolution_plan_semantic_digest
  );
}

export function isCanonicalTestPath(value: unknown): value is string {
  if (
    typeof value !== "string" ||
    value.normalize("NFC") !== value ||
    !value.startsWith("tests/") ||
    isAbsolute(value) ||
    /^[A-Za-z]:/.test(value) ||
    value.includes("\\")
  ) {
    return false;
  }
  return value
    .split("/")
    .every((segment) => segment.length > 0 && segment !== "." && segment !== "..");
}

function splitTableRow(line: string): string[] | null {
  const trimmed = line.trim();
  if (!trimmed.startsWith("|") || !trimmed.endsWith("|")) return null;
  return trimmed
    .slice(1, -1)
    .split("|")
    .map((cell) => cell.trim());
}

/** L8 §5.3.1のexact eligible tableだけを抽出する。 */
export function parseEligibleOracleTable(source: string): {
  rows: EligibleOracleRow[];
  schemaErrors: string[];
} {
  const lines = source.replace(/\r\n?/g, "\n").split("\n");
  const rows: EligibleOracleRow[] = [];
  const schemaErrors: string[] = [];
  let fenced = false;
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i] ?? "";
    if (/^\s*(```|~~~)/.test(line)) {
      fenced = !fenced;
      continue;
    }
    if (fenced) continue;
    const header = splitTableRow(line);
    if (!header || JSON.stringify(header) !== JSON.stringify(ELIGIBLE_HEADER)) continue;
    const separator = splitTableRow(lines[i + 1] ?? "");
    if (!separator || separator.length !== 4 || !separator.every((c) => /^:?-{3,}:?$/.test(c))) {
      schemaErrors.push(`line ${i + 1}: eligible header has no canonical separator`);
      continue;
    }
    for (let j = i + 2; j < lines.length; j += 1) {
      const cells = splitTableRow(lines[j] ?? "");
      if (!cells) break;
      if (cells.length !== 4) {
        if (/U-[A-Z0-9-]+/.test(lines[j] ?? ""))
          schemaErrors.push(`line ${j + 1}: invalid oracle row`);
        continue;
      }
      const oracleId = cells[0] ?? "";
      if (!PLAN_SPECIFIC_ORACLE_ID_PATTERN.test(oracleId)) {
        if (/U-[A-Z0-9-]+/.test(oracleId)) schemaErrors.push(`line ${j + 1}: invalid oracle id`);
        continue;
      }
      const citations = [...(cells[3] ?? "").matchAll(/`([^`]+)`/g)].map((m) => m[1] ?? "");
      if (citations.length === 0 || citations.some((path) => !isCanonicalTestPath(path))) {
        schemaErrors.push(`line ${j + 1}: invalid test citation`);
        continue;
      }
      rows.push({ oracleId, testPaths: citations, line: j + 1 });
    }
  }
  return { rows, schemaErrors };
}

function staticTitle(node: ts.Expression | undefined): string | null {
  if (!node) return null;
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  return null;
}

function oracleTypeScriptProgram(source: string, fileName: string): ts.Program {
  const virtualName = fileName.startsWith("/") ? fileName : `/${fileName}`;
  const options: ts.CompilerOptions = {
    noLib: true,
    noResolve: true,
    target: ts.ScriptTarget.Latest,
    module: ts.ModuleKind.ESNext,
  };
  const host: ts.CompilerHost = {
    fileExists: (name) => name === virtualName,
    readFile: (name) => (name === virtualName ? source : undefined),
    getSourceFile: (name, languageVersion) =>
      name === virtualName
        ? ts.createSourceFile(name, source, languageVersion, true, ts.ScriptKind.TS)
        : undefined,
    getDefaultLibFileName: () => "/lib.d.ts",
    writeFile: () => undefined,
    getCurrentDirectory: () => "/",
    getDirectories: () => [],
    getCanonicalFileName: (name) => name,
    useCaseSensitiveFileNames: () => true,
    getNewLine: () => "\n",
  };
  return ts.createProgram([virtualName], options, host);
}

function isVitestOracleSymbol(symbol: ts.Symbol | undefined, callName: string): boolean {
  if (!symbol) return true;
  return (symbol.declarations ?? []).some((declaration) => {
    if (!ts.isImportSpecifier(declaration)) return false;
    const imported = declaration.propertyName?.text ?? declaration.name.text;
    const importDeclaration = declaration.parent.parent.parent;
    return (
      declaration.name.text === callName &&
      imported === callName &&
      ts.isImportDeclaration(importDeclaration) &&
      ts.isStringLiteral(importDeclaration.moduleSpecifier) &&
      importDeclaration.moduleSpecifier.text === "vitest"
    );
  });
}

/** comment/dead string/member call/dynamic titleを数えず、実CallExpressionだけを返す。 */
export function extractExecutableOracleCases(
  source: string,
  fileName = "test.ts",
): Map<string, number> {
  const program = oracleTypeScriptProgram(source, fileName);
  const file = program.getSourceFiles()[0];
  if (!file) return new Map();
  const checker = program.getTypeChecker();
  const counts = new Map<string, number>();
  const visit = (node: ts.Node): void => {
    const callback = ts.isCallExpression(node) ? node.arguments[1] : undefined;
    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      (node.expression.text === "it" || node.expression.text === "test") &&
      isVitestOracleSymbol(checker.getSymbolAtLocation(node.expression), node.expression.text) &&
      callback !== undefined &&
      (ts.isArrowFunction(callback) || ts.isFunctionExpression(callback))
    ) {
      const title = staticTitle(node.arguments[0]);
      const separator = title?.indexOf(": ") ?? -1;
      const candidate = separator > 0 ? title?.slice(0, separator) : undefined;
      const oracleId =
        candidate && PLAN_SPECIFIC_ORACLE_ID_PATTERN.test(candidate) ? candidate : undefined;
      if (oracleId) counts.set(oracleId, (counts.get(oracleId) ?? 0) + 1);
    }
    ts.forEachChild(node, visit);
  };
  visit(file);
  return counts;
}

function finding(
  planId: string,
  reason: PlanSpecificVpairReason,
  detail: string | null,
): PlanSpecificVpairFinding {
  const base = { plan_id: planId, reason, detail };
  return { ...base, fingerprint: findingFingerprint(base) };
}

function decodeBinding(raw: unknown): VerificationBinding | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const record = raw as Record<string, unknown>;
  if (
    Object.keys(record).sort().join(",") !== "oracle_id,parent_design,test_path" ||
    typeof record.parent_design !== "string" ||
    record.parent_design.length === 0 ||
    typeof record.oracle_id !== "string" ||
    !PLAN_SPECIFIC_ORACLE_ID_PATTERN.test(record.oracle_id) ||
    !isCanonicalTestPath(record.test_path)
  )
    return null;
  return record as unknown as VerificationBinding;
}

function generatedTestPaths(plan: PlanSpecificVpairPlan): Set<string> {
  if (!Array.isArray(plan.generates)) return new Set();
  return new Set(
    plan.generates.flatMap((raw) => {
      if (!raw || typeof raw !== "object" || Array.isArray(raw)) return [];
      const item = raw as Record<string, unknown>;
      return item.artifact_type === "test_code" && typeof item.artifact_path === "string"
        ? [item.artifact_path]
        : [];
    }),
  );
}

function validateAuthority(input: {
  raw: unknown;
  expectedInitialDigest?: string;
  expectedTerminalDigest?: string;
  expectedLegacyIdentityDigest?: string;
  resolutionPlans?: ReadonlyMap<string, PlanSpecificVpairPlan>;
  plansById: ReadonlyMap<string, PlanSpecificVpairPlan>;
  rawFindings: readonly PlanSpecificVpairFinding[];
}): {
  authority: PlanSpecificVpairAuthority | null;
  error: string | null;
  resolved: Set<string>;
} {
  if (!input.raw || typeof input.raw !== "object" || Array.isArray(input.raw))
    return { authority: null, error: "authority missing", resolved: new Set() };
  const authority = input.raw as PlanSpecificVpairAuthority;
  if (
    Object.keys(authority).sort().join(",") !==
      "initialAuthority,resolvedTombstones,schemaVersion" ||
    authority.schemaVersion !== PLAN_SPECIFIC_VPAIR_AUTHORITY_SCHEMA ||
    !Array.isArray(authority.initialAuthority) ||
    !Array.isArray(authority.resolvedTombstones)
  )
    return {
      authority: null,
      error: "authority schema invalid",
      resolved: new Set(),
    };
  const fingerprints = authority.initialAuthority.map((entry) => entry?.fingerprint);
  if (
    authority.initialAuthority.some(
      (entry) =>
        !entry ||
        Object.keys(entry).sort().join(",") !==
          "detail,fingerprint,plan_id,plan_path,plan_semantic_digest,reason" ||
        !SHA256.test(entry.fingerprint) ||
        typeof entry.plan_id !== "string" ||
        entry.plan_path !== `docs/plans/${entry.plan_id}.md` ||
        !SHA256.test(entry.plan_semantic_digest) ||
        !PLAN_SPECIFIC_VPAIR_REASONS.has(entry.reason) ||
        (entry.detail !== null && typeof entry.detail !== "string") ||
        findingFingerprint(entry) !== entry.fingerprint,
    ) ||
    new Set(fingerprints).size !== fingerprints.length ||
    JSON.stringify(fingerprints) !== JSON.stringify([...fingerprints].sort())
  )
    return {
      authority: null,
      error: "initial authority is noncanonical",
      resolved: new Set(),
    };
  const initialDigest = authorityInitialDigest(authority.initialAuthority);
  const legacyIdentityDigest = authorityLegacyIdentityDigest(authority.initialAuthority);
  if (
    input.expectedLegacyIdentityDigest &&
    legacyIdentityDigest !== input.expectedLegacyIdentityDigest
  )
    return {
      authority: null,
      error: "legacy authority identity drift",
      resolved: new Set(),
    };
  if (input.expectedInitialDigest && initialDigest !== input.expectedInitialDigest)
    return {
      authority: null,
      error: "initial authority digest drift",
      resolved: new Set(),
    };
  let previous = initialDigest;
  const resolved = new Set<string>();
  for (const tombstone of authority.resolvedTombstones) {
    const initialEntry = authority.initialAuthority.find(
      (entry) => entry.fingerprint === tombstone?.fingerprint,
    );
    if (
      !tombstone ||
      Object.keys(tombstone).sort().join(",") !==
        "entry_digest,fingerprint,previous_digest,resolution_plan_id,resolution_plan_semantic_digest,resolved_at" ||
      !SHA256.test(tombstone.fingerprint) ||
      !fingerprints.includes(tombstone.fingerprint) ||
      resolved.has(tombstone.fingerprint) ||
      !UTC_INSTANT.test(tombstone.resolved_at) ||
      typeof tombstone.resolution_plan_id !== "string" ||
      !initialEntry ||
      !validResolutionPlan({
        plan: input.resolutionPlans?.get(tombstone.resolution_plan_id),
        tombstone,
        initial: initialEntry,
        plansById: input.plansById,
        rawFindings: input.rawFindings,
      }) ||
      tombstone.previous_digest !== previous ||
      tombstone.entry_digest !== authorityTombstoneDigest(previous, tombstone)
    )
      return {
        authority: null,
        error: "resolved tombstone chain invalid",
        resolved: new Set(),
      };
    resolved.add(tombstone.fingerprint);
    previous = tombstone.entry_digest;
  }
  if (input.expectedTerminalDigest && previous !== input.expectedTerminalDigest)
    return {
      authority: null,
      error: "terminal authority digest drift",
      resolved: new Set(),
    };
  return { authority, error: null, resolved };
}

function isEligiblePlan(plan: PlanSpecificVpairPlan): boolean {
  return (plan.kind === "impl" || plan.kind === "add-impl") && plan.status !== "archived";
}

const PLAN_SPECIFIC_VPAIR_REASONS = new Set<PlanSpecificVpairReason>([
  "verification_bindings_absent",
  "binding_schema_invalid",
  "binding_parent_mismatch",
  "oracle_not_declared",
  "oracle_ambiguous",
  "oracle_table_schema_invalid",
  "oracle_test_citation_mismatch",
  "test_not_generated",
  "test_path_missing",
  "plan_citation_missing",
  "oracle_citation_missing",
  "oracle_owned_by_multiple_plans",
  "duplicate_binding",
  "generated_test_unbound",
  "baseline_plan_semantic_drift",
  "baseline_authority_invalid",
  "resolved_finding_reappeared",
]);

function uniqueFindings(items: PlanSpecificVpairFinding[]): PlanSpecificVpairFinding[] {
  return [...new Map(items.map((item) => [item.fingerprint, item])).values()].sort((a, b) =>
    a.fingerprint.localeCompare(b.fingerprint),
  );
}

export function analyzePlanSpecificVpairBindings(
  input: PlanSpecificVpairBindingInput,
): PlanSpecificVpairBindingResult {
  const rawFindings: PlanSpecificVpairFinding[] = [];
  const active = input.plans.filter(isEligiblePlan);
  const ownership = new Map<string, Map<string, Set<string>>>();
  const pairParseCache = new Map<string, ReturnType<typeof parseEligibleOracleTable>>();

  for (const plan of active) {
    const planId = typeof plan.plan_id === "string" ? plan.plan_id : "<invalid-plan-id>";
    if (
      plan.verification_bindings === undefined ||
      (Array.isArray(plan.verification_bindings) && plan.verification_bindings.length === 0)
    ) {
      rawFindings.push(finding(planId, "verification_bindings_absent", null));
      continue;
    }
    if (!Array.isArray(plan.verification_bindings)) {
      rawFindings.push(
        finding(
          planId,
          "binding_schema_invalid",
          "verification_bindings must be a non-empty array",
        ),
      );
      continue;
    }
    const bindings = plan.verification_bindings.map(decodeBinding);
    if (bindings.some((entry) => entry === null)) {
      rawFindings.push(
        finding(
          planId,
          "binding_schema_invalid",
          "verification_bindings must contain strict canonical entries",
        ),
      );
    }
    const valid = bindings.filter((entry): entry is VerificationBinding => entry !== null);
    const seen = new Set<string>();
    const generated = generatedTestPaths(plan);
    const boundTestPaths = new Set(valid.map((entry) => entry.test_path));
    for (const generatedPath of generated) {
      if (!boundTestPaths.has(generatedPath))
        rawFindings.push(finding(planId, "generated_test_unbound", generatedPath));
    }
    for (const binding of valid) {
      const tuple = `${binding.parent_design}\n${binding.oracle_id}\n${binding.test_path}`;
      if (seen.has(tuple)) rawFindings.push(finding(planId, "duplicate_binding", tuple));
      seen.add(tuple);
      if (binding.parent_design !== plan.parent_design) {
        rawFindings.push(
          finding(
            planId,
            "binding_parent_mismatch",
            `${binding.parent_design} != ${String(plan.parent_design)}`,
          ),
        );
      }
      const pairPath = typeof plan.pair_artifact === "string" ? plan.pair_artifact : "";
      let parsed = pairParseCache.get(pairPath);
      if (!parsed) {
        parsed = parseEligibleOracleTable(input.pairDocuments.get(pairPath) ?? "");
        pairParseCache.set(pairPath, parsed);
      }
      if (parsed.schemaErrors.length > 0)
        rawFindings.push(
          finding(planId, "oracle_table_schema_invalid", parsed.schemaErrors.join("; ")),
        );
      const rows = parsed.rows.filter((row) => row.oracleId === binding.oracle_id);
      if (rows.length === 0)
        rawFindings.push(finding(planId, "oracle_not_declared", binding.oracle_id));
      if (rows.length > 1) rawFindings.push(finding(planId, "oracle_ambiguous", binding.oracle_id));
      if (rows.length === 1 && !rows[0]?.testPaths.includes(binding.test_path)) {
        rawFindings.push(
          finding(
            planId,
            "oracle_test_citation_mismatch",
            `${binding.oracle_id} -> ${rows[0]?.testPaths.join(",")}`,
          ),
        );
      }
      if (!generated.has(binding.test_path))
        rawFindings.push(finding(planId, "test_not_generated", binding.test_path));
      const evidence = input.testFiles.get(binding.test_path);
      if (!evidence?.exists || !evidence.regular || evidence.symlink || !evidence.insideRepo) {
        rawFindings.push(finding(planId, "test_path_missing", binding.test_path));
      } else {
        const escapedPlanId = planId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        if (!new RegExp(`(^|[^A-Za-z0-9-])${escapedPlanId}(?![A-Za-z0-9-])`).test(evidence.source))
          rawFindings.push(finding(planId, "plan_citation_missing", binding.test_path));
        if ((evidence.executableOracleCases.get(binding.oracle_id) ?? 0) !== 1) {
          rawFindings.push(
            finding(planId, "oracle_citation_missing", `${binding.oracle_id}@${binding.test_path}`),
          );
        }
      }
      const byPath = ownership.get(binding.oracle_id) ?? new Map<string, Set<string>>();
      const owners = byPath.get(binding.test_path) ?? new Set<string>();
      owners.add(planId);
      byPath.set(binding.test_path, owners);
      ownership.set(binding.oracle_id, byPath);
    }
  }
  for (const [oracle, byPath] of ownership) {
    if (byPath.size <= 1) continue;
    for (const owners of byPath.values()) {
      for (const planId of owners)
        rawFindings.push(
          finding(
            planId,
            "oracle_owned_by_multiple_plans",
            `${oracle}: ${[...byPath.keys()].sort().join(",")}`,
          ),
        );
    }
  }

  let currentFindings = uniqueFindings(rawFindings);
  const activePlansById = new Map(
    active.flatMap((plan) =>
      typeof plan.plan_id === "string" ? ([[plan.plan_id, plan]] as const) : [],
    ),
  );
  let authority: ReturnType<typeof validateAuthority> | null = null;
  if (
    input.authority !== undefined ||
    input.expectedInitialDigest ||
    input.expectedTerminalDigest ||
    input.expectedLegacyIdentityDigest
  ) {
    authority = validateAuthority({
      raw: input.authority,
      expectedInitialDigest: input.expectedInitialDigest,
      expectedTerminalDigest: input.expectedTerminalDigest,
      expectedLegacyIdentityDigest: input.expectedLegacyIdentityDigest,
      resolutionPlans: input.resolutionPlans,
      plansById: activePlansById,
      rawFindings: currentFindings,
    });
    if (authority.error)
      currentFindings.push(finding("<authority>", "baseline_authority_invalid", authority.error));
  }
  const resolved = authority?.resolved ?? new Set<string>();
  const initial = new Set(
    authority?.authority?.initialAuthority.map((entry) => entry.fingerprint) ?? [],
  );
  for (const entry of authority?.authority?.initialAuthority ?? []) {
    if (resolved.has(entry.fingerprint)) continue;
    const plan = activePlansById.get(entry.plan_id);
    if (!plan) continue;
    const actualPath = typeof plan.path === "string" ? plan.path : "";
    const actualDigest = planSemanticDigest(plan);
    if (actualPath !== entry.plan_path || actualDigest !== entry.plan_semantic_digest) {
      currentFindings.push(
        finding(
          entry.plan_id,
          "baseline_plan_semantic_drift",
          `path=${entry.plan_path}/${actualPath || "-"};digest=${entry.plan_semantic_digest}/${actualDigest}`,
        ),
      );
    }
  }
  const currentFingerprints = new Set(currentFindings.map((item) => item.fingerprint));
  const unusedActiveExemptions = [...initial].filter(
    (fingerprint) => !resolved.has(fingerprint) && !currentFingerprints.has(fingerprint),
  );
  for (const fingerprint of unusedActiveExemptions) {
    currentFindings.push(
      finding("<authority>", "baseline_authority_invalid", `unused exemption ${fingerprint}`),
    );
  }
  currentFindings = uniqueFindings(currentFindings);
  const reappeared: PlanSpecificVpairFinding[] = [];
  for (const current of currentFindings) {
    if (resolved.has(current.fingerprint))
      reappeared.push(finding(current.plan_id, "resolved_finding_reappeared", current.fingerprint));
  }
  const allFindings = uniqueFindings([...currentFindings, ...reappeared]);
  const exempted = allFindings.filter(
    (item) => initial.has(item.fingerprint) && !resolved.has(item.fingerprint),
  );
  const findings = allFindings.filter(
    (item) => !initial.has(item.fingerprint) || resolved.has(item.fingerprint),
  );
  return {
    ok: findings.length === 0,
    checkedPlans: active.length,
    findings,
    exempted,
  };
}

export interface PlanSpecificVpairNodeLoaderOptions {
  plans: PlanSpecificVpairPlan[];
  pairPaths: string[];
  testPaths: string[];
  authority?: unknown;
  expectedInitialDigest?: string;
  expectedTerminalDigest?: string;
  expectedLegacyIdentityDigest?: string;
  resolutionPlans?: ReadonlyMap<string, PlanSpecificVpairPlan>;
}

/** Node I/O adapter。pure analyzerへfilesystem依存を持ち込まない。 */
export function loadPlanSpecificVpairBindingInput(
  repoRoot: string,
  options: PlanSpecificVpairNodeLoaderOptions,
): PlanSpecificVpairBindingInput {
  const root = realpathSync(repoRoot);
  const pairDocuments = new Map<string, string>();
  for (const path of new Set(options.pairPaths)) {
    const absolute = join(root, ...path.split("/"));
    pairDocuments.set(path, existsSync(absolute) ? readFileSync(absolute, "utf8") : "");
  }
  const testFiles = new Map<string, TestFileEvidence>();
  for (const path of new Set(options.testPaths)) {
    const absolute = resolve(root, path);
    let evidence: TestFileEvidence = {
      exists: false,
      regular: false,
      symlink: false,
      insideRepo: false,
      source: "",
      executableOracleCases: new Map(),
    };
    if (isCanonicalTestPath(path) && existsSync(absolute)) {
      const symbolic = lstatSync(absolute).isSymbolicLink();
      const real = realpathSync(absolute);
      const rel = relative(root, real);
      const insideRepo = rel !== "" && !rel.startsWith("..") && !isAbsolute(rel);
      const regular = statSync(real).isFile();
      const source = !symbolic && insideRepo && regular ? readFileSync(real, "utf8") : "";
      evidence = {
        exists: true,
        regular,
        symlink: symbolic,
        insideRepo,
        source,
        executableOracleCases: extractExecutableOracleCases(source, path),
      };
    }
    testFiles.set(path, evidence);
  }
  return { ...options, pairDocuments, testFiles };
}

function parsePlanFrontmatter(source: string): PlanSpecificVpairPlan | null {
  const match = source.match(/^---\n([\s\S]*?)\n---(?:\n|$)/);
  if (!match) return null;
  try {
    const raw = parseYaml(match[1]) as unknown;
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
    return { ...(raw as PlanSpecificVpairPlan), source };
  } catch {
    return null;
  }
}

/** repo全体を読むadapter。single-target lintでもownership/authorityはglobal snapshotで判定する。 */
export function loadPlanSpecificVpairBindingInputFromRepo(
  repoRoot: string,
  options: {
    expectedInitialDigest?: string;
    expectedTerminalDigest?: string;
    expectedLegacyIdentityDigest?: string;
    loadAuthority?: boolean;
  } = {},
): PlanSpecificVpairBindingInput {
  const plansDir = join(repoRoot, "docs", "plans");
  const plans = existsSync(plansDir)
    ? readdirSync(plansDir)
        .filter((name) => name.startsWith("PLAN-") && name.endsWith(".md"))
        .sort()
        .flatMap((name) => {
          const parsed = parsePlanFrontmatter(readFileSync(join(plansDir, name), "utf8"));
          return parsed ? [{ ...parsed, path: `docs/plans/${name}` }] : [];
        })
    : [];
  const pairPaths = plans.flatMap((plan) =>
    typeof plan.pair_artifact === "string" ? [plan.pair_artifact] : [],
  );
  const testPaths = plans.flatMap((plan) =>
    Array.isArray(plan.verification_bindings)
      ? plan.verification_bindings.flatMap((raw) => {
          const binding = decodeBinding(raw);
          return binding ? [binding.test_path] : [];
        })
      : [],
  );
  const authorityPath = join(repoRoot, PLAN_SPECIFIC_VPAIR_AUTHORITY_PATH);
  const authority =
    options.loadAuthority !== false && existsSync(authorityPath)
      ? (JSON.parse(readFileSync(authorityPath, "utf8")) as unknown)
      : undefined;
  const resolutionPlans = new Map(
    plans.flatMap((plan) =>
      typeof plan.plan_id === "string" ? ([[plan.plan_id, plan]] as const) : [],
    ),
  );
  return loadPlanSpecificVpairBindingInput(repoRoot, {
    plans,
    pairPaths,
    testPaths,
    authority,
    expectedInitialDigest: options.expectedInitialDigest,
    expectedTerminalDigest: options.expectedTerminalDigest,
    expectedLegacyIdentityDigest: options.expectedLegacyIdentityDigest,
    resolutionPlans,
  });
}

export function planSpecificVpairBindingMessages(result: PlanSpecificVpairBindingResult): string[] {
  if (result.ok) {
    return [
      `plan-specific-vpair-binding - OK (checked=${result.checkedPlans}, exempted=${result.exempted.length}, findings=0)`,
    ];
  }
  const sample = result.findings
    .slice(0, 8)
    .map((item) => `${item.plan_id}:${item.reason}${item.detail ? `(${item.detail})` : ""}`)
    .join(", ");
  return [
    `plan-specific-vpair-binding - violation ${result.findings.length} 件 (checked=${result.checkedPlans}, exempted=${result.exempted.length})`,
    `plan-specific-vpair-binding - sample: ${sample}`,
  ];
}

export function checkPlanSpecificVpairBindings(repoRoot: string): {
  ok: boolean;
  messages: string[];
  result: PlanSpecificVpairBindingResult | null;
} {
  if (!existsSync(repoRoot)) {
    return {
      ok: false,
      messages: ["plan-specific-vpair-binding - violation: repo root could not be read"],
      result: null,
    };
  }
  try {
    const result = analyzePlanSpecificVpairBindings(
      loadPlanSpecificVpairBindingInputFromRepo(repoRoot, {
        expectedInitialDigest: PLAN_SPECIFIC_VPAIR_INITIAL_DIGEST,
        expectedTerminalDigest: PLAN_SPECIFIC_VPAIR_TERMINAL_DIGEST,
        expectedLegacyIdentityDigest: PLAN_SPECIFIC_VPAIR_LEGACY_IDENTITY_DIGEST,
      }),
    );
    return { ok: result.ok, messages: planSpecificVpairBindingMessages(result), result };
  } catch {
    return {
      ok: false,
      messages: ["plan-specific-vpair-binding - violation: repository input could not be read"],
      result: null,
    };
  }
}

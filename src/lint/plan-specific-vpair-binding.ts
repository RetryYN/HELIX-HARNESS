import { createHash } from "node:crypto";
import { existsSync, lstatSync, readdirSync, readFileSync, realpathSync, statSync } from "node:fs";
import { isAbsolute, join, relative, resolve } from "node:path";
import ts from "typescript";
import { parse as parseYaml } from "yaml";

export const PLAN_SPECIFIC_VPAIR_AUTHORITY_SCHEMA =
  "plan-specific-vpair-binding-authority.v1" as const;
export const PLAN_SPECIFIC_VPAIR_AUTHORITY_PATH =
  "config/plan-specific-vpair-binding-authority.json" as const;
export const PLAN_SPECIFIC_VPAIR_INITIAL_DIGEST =
  "sha256:18296bffa4a37adbab68e3602677eaa5008a26807866bff421d52e9597b30786";
export const PLAN_SPECIFIC_VPAIR_TERMINAL_DIGEST =
  "sha256:18296bffa4a37adbab68e3602677eaa5008a26807866bff421d52e9597b30786";

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
  plan_id: unknown;
  kind: unknown;
  status: unknown;
  parent_design: unknown;
  pair_artifact: unknown;
  verification_bindings?: unknown;
  generates?: unknown;
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
}

export interface PlanSpecificVpairAuthorityTombstone {
  fingerprint: string;
  resolved_at: string;
  resolution_plan_id: string;
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
  /** resolution PLANがterminalかを判定するpure dependency。 */
  isTerminalResolutionPlan?: (planId: string) => boolean;
}

export interface PlanSpecificVpairBindingResult {
  ok: boolean;
  checkedPlans: number;
  findings: PlanSpecificVpairFinding[];
  exempted: PlanSpecificVpairFinding[];
}

const ORACLE_ID = /^U-[A-Z][A-Z0-9]*(?:-[A-Z0-9]+)*-\d{3}[a-z]*$/;
const SHA256 = /^sha256:[a-f0-9]{64}$/;
const UTC_INSTANT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;
const ELIGIBLE_HEADER = ["U-ID", "対象", "反例と期待結果", "test citation"];

function sha256(value: string): string {
  return `sha256:${createHash("sha256").update(value, "utf8").digest("hex")}`;
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
  return sha256(`${initial.map((entry) => entry.fingerprint).join("\n")}\n`);
}

export function authorityTombstoneDigest(
  previousDigest: string,
  value: Pick<
    PlanSpecificVpairAuthorityTombstone,
    "fingerprint" | "resolved_at" | "resolution_plan_id"
  >,
): string {
  return sha256(
    `${previousDigest}\n${value.fingerprint}\n${value.resolved_at}\n${value.resolution_plan_id}`,
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
      if (!ORACLE_ID.test(oracleId)) {
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

/** comment/dead string/member call/dynamic titleを数えず、実CallExpressionだけを返す。 */
export function extractExecutableOracleCases(
  source: string,
  fileName = "test.ts",
): Map<string, number> {
  const file = ts.createSourceFile(
    fileName,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  const counts = new Map<string, number>();
  const visit = (node: ts.Node): void => {
    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      (node.expression.text === "it" || node.expression.text === "test")
    ) {
      const title = staticTitle(node.arguments[0]);
      const match = title?.match(/^(U-[A-Z][A-Z0-9]*(?:-[A-Z0-9]+)*-\d{3}[a-z]*):\s+\S/);
      if (match) counts.set(match[1]!, (counts.get(match[1]!) ?? 0) + 1);
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
    !ORACLE_ID.test(record.oracle_id) ||
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

function validateAuthority(
  raw: unknown,
  expectedInitialDigest?: string,
  expectedTerminalDigest?: string,
  isTerminal: (id: string) => boolean = () => false,
): {
  authority: PlanSpecificVpairAuthority | null;
  error: string | null;
  resolved: Set<string>;
} {
  if (!raw || typeof raw !== "object" || Array.isArray(raw))
    return { authority: null, error: "authority missing", resolved: new Set() };
  const authority = raw as PlanSpecificVpairAuthority;
  if (
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
        !SHA256.test(entry.fingerprint) ||
        typeof entry.plan_id !== "string" ||
        typeof entry.reason !== "string" ||
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
  if (expectedInitialDigest && initialDigest !== expectedInitialDigest)
    return {
      authority: null,
      error: "initial authority digest drift",
      resolved: new Set(),
    };
  let previous = initialDigest;
  const resolved = new Set<string>();
  for (const tombstone of authority.resolvedTombstones) {
    if (
      !tombstone ||
      !SHA256.test(tombstone.fingerprint) ||
      !fingerprints.includes(tombstone.fingerprint) ||
      resolved.has(tombstone.fingerprint) ||
      !UTC_INSTANT.test(tombstone.resolved_at) ||
      typeof tombstone.resolution_plan_id !== "string" ||
      !isTerminal(tombstone.resolution_plan_id) ||
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
  if (expectedTerminalDigest && previous !== expectedTerminalDigest)
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

export function analyzePlanSpecificVpairBindings(
  input: PlanSpecificVpairBindingInput,
): PlanSpecificVpairBindingResult {
  const rawFindings: PlanSpecificVpairFinding[] = [];
  const active = input.plans.filter(isEligiblePlan);
  const ownership = new Map<string, Map<string, Set<string>>>();

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
      const parsed = parseEligibleOracleTable(input.pairDocuments.get(pairPath) ?? "");
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
        if (!evidence.source.includes(planId))
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

  let authority: ReturnType<typeof validateAuthority> | null = null;
  if (
    input.authority !== undefined ||
    input.expectedInitialDigest ||
    input.expectedTerminalDigest
  ) {
    authority = validateAuthority(
      input.authority,
      input.expectedInitialDigest,
      input.expectedTerminalDigest,
      input.isTerminalResolutionPlan,
    );
    if (authority.error)
      rawFindings.push(finding("<authority>", "baseline_authority_invalid", authority.error));
  }
  const resolved = authority?.resolved ?? new Set<string>();
  const initial = new Set(
    authority?.authority?.initialAuthority.map((entry) => entry.fingerprint) ?? [],
  );
  for (const current of rawFindings) {
    if (resolved.has(current.fingerprint))
      rawFindings.push(
        finding(current.plan_id, "resolved_finding_reappeared", current.fingerprint),
      );
  }
  const exempted = rawFindings.filter(
    (item) => initial.has(item.fingerprint) && !resolved.has(item.fingerprint),
  );
  const findings = rawFindings.filter(
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
  isTerminalResolutionPlan?: (planId: string) => boolean;
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
          return parsed ? [parsed] : [];
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
  const terminalPlans = new Set(
    plans.flatMap((plan) =>
      typeof plan.plan_id === "string" &&
      (plan.status === "confirmed" || plan.status === "completed")
        ? [plan.plan_id]
        : [],
    ),
  );
  return loadPlanSpecificVpairBindingInput(repoRoot, {
    plans,
    pairPaths,
    testPaths,
    authority,
    expectedInitialDigest: options.expectedInitialDigest,
    expectedTerminalDigest: options.expectedTerminalDigest,
    isTerminalResolutionPlan: (planId) => terminalPlans.has(planId),
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

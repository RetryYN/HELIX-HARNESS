import { existsSync, readdirSync, readFileSync } from "node:fs";
import { basename, extname, join } from "node:path";

export type HandoverRetirementKind =
  | "session_prose"
  | "provider_evidence"
  | "operations_transition"
  | "legacy_archive"
  | "compatibility_only";

export interface HandoverRetirementRule {
  ruleId: string;
  kind: HandoverRetirementKind;
  pathPattern: RegExp;
  excludePathPattern?: RegExp;
  contentPattern: RegExp;
  excludeContentPattern?: RegExp;
  owner: string;
  replacement: string;
  removalCheckpoint: "R3" | "memory_primary" | "legacy_write_disabled" | "cleanup" | "complete";
}

export interface HandoverRetirementReference {
  path: string;
  line: number;
  symbol: string;
}

export interface ClassifiedHandoverRetirementReference extends HandoverRetirementReference {
  kind: HandoverRetirementKind;
  ruleIds: string[];
  owner: string;
  replacement: string;
  removalCheckpoint: HandoverRetirementRule["removalCheckpoint"];
}

export interface HandoverRetirementInventoryResult {
  ok: boolean;
  scannedFiles: number;
  referenceCount: number;
  classified: ClassifiedHandoverRetirementReference[];
  unclassified: HandoverRetirementReference[];
  conflicts: Array<
    HandoverRetirementReference & { kinds: HandoverRetirementKind[]; ruleIds: string[] }
  >;
  preserveBoundaryViolations: Array<
    ClassifiedHandoverRetirementReference & {
      reason: "session_continuation_mixed_into_preserved_type";
    }
  >;
  activeSessionProse: ClassifiedHandoverRetirementReference[];
  retirementReady: boolean;
  byKind: Record<HandoverRetirementKind, number>;
}

const PROVIDER_MARKER = /provider delegation|provider_evidence|\.helix\/handover\/provider/i;
const OPERATIONS_MARKER =
  /operations?[-_ ](?:transition|handover)|operational[-_ ]handover|開発.{0,8}運用.{0,8}(?:移管|引継ぎ)/i;
const BOUNDARY_DECLARATION_MARKER =
  /(?:session|prose|セッション).{0,160}(?:provider|operations)|(?:provider|operations).{0,160}(?:session|prose|セッション)|provider delegation evidence.{0,160}operations transition|session_prose.{0,160}provider_evidence|provider_evidence.{0,160}operations_transition/i;
const REFERENCE_MARKER = /handover|CURRENT\.json|ハンドオーバー|引継ぎ|引き継ぎ|引き渡し/i;
const SESSION_MUTATION_MARKER =
  /(?:run|read|write|generate|derive|consume|load|save|update)Handover|(?:write|read|generate|consume|update).{0,40}CURRENT|CURRENT.{0,40}(?:writer|reader|pointer|stale|freshness|generator)|handover.{0,40}(?:next.action|pointer|stale|freshness|generator)|helix handover(?! provider)|session.{0,40}(?:next.action|continuation)|bounded recall/i;
const ALLOWED_PROVIDER_MUTATION_MARKER =
  /(?:run|read|write)ProviderHandover|(?:provider[-_ ]handover|handover\/provider).{0,80}CURRENT|CURRENT.{0,80}(?:provider[-_ ]handover|handover\/provider)|writes package and CURRENT/i;
const NEGATED_BOUNDARY_MARKER =
  /禁止|しない|別型|除外|must not|never|not (?:a |the )?(?:source|input)/i;
const PROVIDER_PATH = /provider-handover|handover\/provider/i;
const COMPATIBILITY_PATH =
  /handover-(?:mechanism|db-derivation)\.md$|tests\/handover(?:-completion-wording|-db-derivation|-derivation-wiring)?\.test\.ts$|tests\/handover\.test\.ts$/;
const ARCHIVE_PATH =
  /^(?:docs\/archive|docs\/handover)\/|^docs\/governance\/(?!session-handover-retirement-disposition).*audit.*\.md$/;

export const HANDOVER_RETIREMENT_RULES: readonly HandoverRetirementRule[] = [
  {
    ruleId: "provider-evidence-path",
    kind: "provider_evidence",
    pathPattern: PROVIDER_PATH,
    excludePathPattern: ARCHIVE_PATH,
    contentPattern: REFERENCE_MARKER,
    owner: "runtime audit",
    replacement: "監査証跡として保持し、progress/continuation/bounded recallへjoinしない",
    removalCheckpoint: "complete",
  },
  {
    ruleId: "typed-boundary-declaration",
    kind: "session_prose",
    pathPattern:
      /^(?:AGENTS|CLAUDE|README)\.md$|^package\.json$|^docs\/(?:adr|design|memory|test-design|governance|templates|migration|plans|process|reference|research|skills)\//,
    excludePathPattern: new RegExp(`${COMPATIBILITY_PATH.source}|${ARCHIVE_PATH.source}`),
    contentPattern: BOUNDARY_DECLARATION_MARKER,
    owner: "design/verification/governance",
    replacement: "session retirementとprovider/operations preserve境界を同じVペアで維持する",
    removalCheckpoint: "R3",
  },
  {
    ruleId: "provider-evidence-symbol",
    kind: "provider_evidence",
    pathPattern: /.*/,
    excludePathPattern: new RegExp(`${ARCHIVE_PATH.source}|${COMPATIBILITY_PATH.source}`),
    contentPattern: PROVIDER_MARKER,
    excludeContentPattern: new RegExp(
      `${OPERATIONS_MARKER.source}|${BOUNDARY_DECLARATION_MARKER.source}`,
      "i",
    ),
    owner: "runtime audit",
    replacement: "監査証跡として保持し、progress/continuation/bounded recallへjoinしない",
    removalCheckpoint: "complete",
  },
  {
    ruleId: "operations-transition-symbol",
    kind: "operations_transition",
    pathPattern: /.*/,
    excludePathPattern: new RegExp(`${ARCHIVE_PATH.source}|${COMPATIBILITY_PATH.source}`),
    contentPattern: OPERATIONS_MARKER,
    excludeContentPattern: PROVIDER_MARKER,
    owner: "operations governance",
    replacement: "運用設計artifactとして保持し、session continuationと型を共有しない",
    removalCheckpoint: "complete",
  },
  {
    ruleId: "compatibility-old-design",
    kind: "compatibility_only",
    pathPattern: COMPATIBILITY_PATH,
    contentPattern: REFERENCE_MARKER,
    owner: "design/QA",
    replacement: "retirement比較oracleに限定し、U-HRET/IT-CONTへ置換する",
    removalCheckpoint: "cleanup",
  },
  {
    ruleId: "legacy-archive",
    kind: "legacy_archive",
    pathPattern: /^(?:docs\/archive|docs\/handover)\//,
    contentPattern: REFERENCE_MARKER,
    owner: "archive",
    replacement: "歴史資料として保持し、runtime/doctorのlive sourceから除外する",
    removalCheckpoint: "complete",
  },
  {
    ruleId: "legacy-audit-evidence",
    kind: "legacy_archive",
    pathPattern: /^docs\/governance\/(?!session-handover-retirement-disposition).*audit.*\.md$/,
    contentPattern: REFERENCE_MARKER,
    owner: "governance archive",
    replacement: "監査時点の証跡として保持し、current runtime contractにしない",
    removalCheckpoint: "complete",
  },
  {
    ruleId: "session-prose-runtime",
    kind: "session_prose",
    pathPattern: /^(?:src|tests|scripts|\.claude|\.codex|\.github|\.vscode)\//,
    excludePathPattern: new RegExp(
      `${COMPATIBILITY_PATH.source}|${ARCHIVE_PATH.source}|${PROVIDER_PATH.source}`,
      "i",
    ),
    contentPattern: REFERENCE_MARKER,
    excludeContentPattern: new RegExp(`${PROVIDER_MARKER.source}|${OPERATIONS_MARKER.source}`, "i"),
    owner: "runtime/QA/adapter",
    replacement: "session-log + state-db + memory + feedbackのcontinuationへ置換する",
    removalCheckpoint: "cleanup",
  },
  {
    ruleId: "session-prose-governance",
    kind: "session_prose",
    pathPattern:
      /^(?:AGENTS|CLAUDE|README)\.md$|^package\.json$|^docs\/(?:adr|design|memory|test-design|governance|templates|migration|plans|process|reference|research|skills)\//,
    excludePathPattern: new RegExp(`${COMPATIBILITY_PATH.source}|${ARCHIVE_PATH.source}`),
    contentPattern: REFERENCE_MARKER,
    excludeContentPattern: new RegExp(`${PROVIDER_MARKER.source}|${OPERATIONS_MARKER.source}`, "i"),
    owner: "design/verification/governance",
    replacement: "Reverse-344 R3でcontinuation契約と対向oracleへatomic置換する",
    removalCheckpoint: "R3",
  },
] as const;

const INVENTORY_ROOTS = [
  "src",
  "tests",
  "scripts",
  ".claude",
  ".codex",
  ".github",
  ".vscode",
  "docs/adr",
  "docs/archive",
  "docs/design",
  "docs/handover",
  "docs/memory",
  "docs/migration",
  "docs/plans",
  "docs/process",
  "docs/reference",
  "docs/research",
  "docs/skills",
  "docs/test-design",
  "docs/governance",
  "docs/templates",
] as const;
const INVENTORY_FILES = ["AGENTS.md", "CLAUDE.md", "README.md", "package.json"] as const;
const INVENTORY_SELF_PATHS = new Set([
  "src/lint/handover-retirement.ts",
  "tests/handover-retirement.test.ts",
]);
const TEXT_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".md",
  ".json",
  ".toml",
  ".txt",
  ".yaml",
  ".yml",
  ".sh",
  ".ps1",
]);

function normalizePath(path: string): string {
  return path.replace(/\\/g, "/");
}

function collectTextFiles(root: string, relativeRoot: string, output: string[]): void {
  const absoluteRoot = join(root, relativeRoot);
  if (!existsSync(absoluteRoot)) return;
  for (const entry of readdirSync(absoluteRoot, { withFileTypes: true })) {
    const relativePath = normalizePath(join(relativeRoot, entry.name));
    if (entry.isDirectory()) {
      if (["node_modules", "dist", ".git"].includes(entry.name)) continue;
      collectTextFiles(root, relativePath, output);
      continue;
    }
    if (!entry.isFile()) continue;
    if (!TEXT_EXTENSIONS.has(extname(entry.name)) && basename(entry.name) !== "helix") continue;
    output.push(relativePath);
  }
}

export function loadHandoverRetirementReferences(repoRoot: string): {
  scannedFiles: number;
  references: HandoverRetirementReference[];
} {
  const paths: string[] = [];
  for (const root of INVENTORY_ROOTS) collectTextFiles(repoRoot, root, paths);
  for (const file of INVENTORY_FILES) {
    if (existsSync(join(repoRoot, file))) paths.push(file);
  }
  const uniquePaths = [...new Set(paths)].sort();
  const inventoryPaths = uniquePaths.filter((path) => !INVENTORY_SELF_PATHS.has(path));
  const references: HandoverRetirementReference[] = [];
  for (const path of inventoryPaths) {
    const lines = readFileSync(join(repoRoot, path), "utf8").split(/\r?\n/);
    for (let index = 0; index < lines.length; index += 1) {
      const symbol = lines[index]?.trim() ?? "";
      if (!REFERENCE_MARKER.test(symbol)) continue;
      references.push({ path, line: index + 1, symbol });
    }
  }
  return { scannedFiles: inventoryPaths.length, references };
}

function ruleMatches(
  reference: HandoverRetirementReference,
  rule: HandoverRetirementRule,
): boolean {
  return (
    rule.pathPattern.test(reference.path) &&
    !(rule.excludePathPattern?.test(reference.path) ?? false) &&
    rule.contentPattern.test(reference.symbol) &&
    !(rule.excludeContentPattern?.test(reference.symbol) ?? false)
  );
}

function hasPreserveBoundaryViolation(symbol: string): boolean {
  return symbol.split(/[.;。]/).some((clause) => {
    if (!SESSION_MUTATION_MARKER.test(clause)) return false;
    if (ALLOWED_PROVIDER_MUTATION_MARKER.test(clause)) return false;
    return !NEGATED_BOUNDARY_MARKER.test(clause);
  });
}

export function classifyHandoverRetirementReferences(
  references: readonly HandoverRetirementReference[],
  rules: readonly HandoverRetirementRule[] = HANDOVER_RETIREMENT_RULES,
  scannedFiles = 0,
): HandoverRetirementInventoryResult {
  const classified: ClassifiedHandoverRetirementReference[] = [];
  const unclassified: HandoverRetirementReference[] = [];
  const conflicts: HandoverRetirementInventoryResult["conflicts"] = [];
  for (const reference of references) {
    const matched = rules.filter((rule) => ruleMatches(reference, rule));
    const kinds = [...new Set(matched.map((rule) => rule.kind))];
    if (matched.length === 0) {
      unclassified.push(reference);
      continue;
    }
    if (kinds.length > 1) {
      conflicts.push({
        ...reference,
        kinds,
        ruleIds: matched.map((rule) => rule.ruleId),
      });
      continue;
    }
    const primary = matched[0];
    if (!primary) {
      unclassified.push(reference);
      continue;
    }
    classified.push({
      ...reference,
      kind: primary.kind,
      ruleIds: matched.map((rule) => rule.ruleId),
      owner: primary.owner,
      replacement: primary.replacement,
      removalCheckpoint: primary.removalCheckpoint,
    });
  }
  const byKind: Record<HandoverRetirementKind, number> = {
    session_prose: 0,
    provider_evidence: 0,
    operations_transition: 0,
    legacy_archive: 0,
    compatibility_only: 0,
  };
  for (const reference of classified) byKind[reference.kind] += 1;
  const preserveBoundaryViolations = classified
    .filter(
      (reference) =>
        (reference.kind === "provider_evidence" || reference.kind === "operations_transition") &&
        hasPreserveBoundaryViolation(reference.symbol),
    )
    .map((reference) => ({
      ...reference,
      reason: "session_continuation_mixed_into_preserved_type" as const,
    }));
  const activeSessionProse = classified.filter((reference) => reference.kind === "session_prose");
  const inventoryOk =
    unclassified.length === 0 && conflicts.length === 0 && preserveBoundaryViolations.length === 0;
  return {
    ok: inventoryOk,
    scannedFiles,
    referenceCount: references.length,
    classified,
    unclassified,
    conflicts,
    preserveBoundaryViolations,
    activeSessionProse,
    retirementReady:
      inventoryOk &&
      scannedFiles > 0 &&
      references.length > 0 &&
      activeSessionProse.length === 0 &&
      byKind.compatibility_only === 0,
    byKind,
  };
}

export function analyzeHandoverRetirementInventory(
  repoRoot: string,
  rules: readonly HandoverRetirementRule[] = HANDOVER_RETIREMENT_RULES,
): HandoverRetirementInventoryResult {
  const loaded = loadHandoverRetirementReferences(repoRoot);
  return classifyHandoverRetirementReferences(loaded.references, rules, loaded.scannedFiles);
}

export function handoverRetirementInventoryMessages(
  result: HandoverRetirementInventoryResult,
): string[] {
  const status = result.ok ? "OK" : "violation";
  return [
    `handover-retirement-inventory - ${status}: files=${result.scannedFiles} references=${result.referenceCount} classified=${result.classified.length} unclassified=${result.unclassified.length} conflicts=${result.conflicts.length} preserve_boundary=${result.preserveBoundaryViolations.length}`,
    `handover-retirement-inventory - kinds=${Object.entries(result.byKind)
      .map(([kind, count]) => `${kind}:${count}`)
      .join(",")}`,
    `handover-retirement-inventory - retirement-ready=${result.retirementReady} active_session_prose=${result.activeSessionProse.length} compatibility_only=${result.byKind.compatibility_only}`,
    ...result.unclassified
      .slice(0, 20)
      .map(
        (reference) =>
          `handover-retirement-inventory - violation: unclassified=${reference.path}:${reference.line}`,
      ),
    ...result.conflicts
      .slice(0, 20)
      .map(
        (reference) =>
          `handover-retirement-inventory - violation: conflict=${reference.path}:${reference.line}:${reference.kinds.join("+")}`,
      ),
    ...result.preserveBoundaryViolations
      .slice(0, 20)
      .map(
        (reference) =>
          `handover-retirement-inventory - violation: preserve-boundary=${reference.path}:${reference.line}:${reference.kind}`,
      ),
  ];
}

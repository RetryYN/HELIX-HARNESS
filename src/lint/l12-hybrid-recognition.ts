import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { extname, join } from "node:path";
import { REVIEWED_SAFE_DISPOSITIONS } from "./l12-hybrid-reviewed-safe-v2";

export const RECOGNITION_SIGNAL_IDS = [
  "legacy_vmodel_span",
  "legacy_pair_l1_l14",
  "legacy_pair_l2_l10",
  "legacy_pair_l3_l12",
  "removed_layer_l13_l14",
  "removed_gate_g13_g14",
  "bun_runtime",
  "python_proposal_only",
  "python_worker_boundary",
] as const;

export type RecognitionSignalId = (typeof RECOGNITION_SIGNAL_IDS)[number];

export interface RecognitionSignal {
  id: RecognitionSignalId;
  line: number;
  excerpt: string;
}

export interface RecognitionCandidate {
  path: string;
  contentDigest: string;
  disposition: RecognitionDisposition;
  reviewStatus: RecognitionReviewStatus;
  auditDisposition: RecognitionAuditDisposition;
  documentStatus?: string;
  signals: RecognitionSignal[];
}

export type RecognitionDisposition =
  | "current_authority_review"
  | "plan_review"
  | "executable_surface_review"
  | "historical_context_review"
  | "compatibility_authority_review";

export type RecognitionReviewStatus = "unresolved" | "context_labeled" | "historical_labeled";

export type RecognitionAuditDisposition =
  | "needs_manual_review"
  | "compatibility_labeled"
  | "false_positive_execution_command";

export type RecognitionFinalDisposition =
  | "conflict"
  | "compatibility_labeled"
  | "false_positive"
  | "historical"
  | "needs_manual_review";

type ReviewedSafeDisposition = (typeof REVIEWED_SAFE_DISPOSITIONS)[number];
const REVIEWED_SAFE_BY_PATH = new Map<string, ReviewedSafeDisposition>(
  REVIEWED_SAFE_DISPOSITIONS.map((entry) => [entry.path, entry] as const),
);

const SIGNAL_PATTERNS: ReadonlyArray<readonly [RecognitionSignalId, RegExp]> = [
  ["legacy_vmodel_span", /L0.{0,40}L14/iu],
  ["legacy_pair_l1_l14", /L1.{0,40}L14/iu],
  ["legacy_pair_l2_l10", /L2.{0,40}L10/iu],
  ["legacy_pair_l3_l12", /L3.{0,40}L12/iu],
  ["removed_layer_l13_l14", /\bL1[34]\b/u],
  ["removed_gate_g13_g14", /\bG1[34]\b/u],
  ["bun_runtime", /\bBun\b/iu],
  ["python_proposal_only", /proposal[ -]?only.{0,30}Python|Python.{0,30}proposal[ -]?only/iu],
  ["python_worker_boundary", /Python.{0,16}(?:worker|runtime)|(?:worker|runtime).{0,16}Python/iu],
];

const TEXT_EXTENSIONS = new Set([".md", ".json", ".jsonl", ".yaml", ".yml"]);
const EXCLUDED_PREFIXES = ["docs/archive/", "docs/migration/"];
const EXCLUDED_PATHS = new Set([
  "docs/governance/l12-hybrid-recognition-candidate-inventory-2026-07-19.md",
  "docs/governance/l12-hybrid-requirements-recognition-risk-audit-2026-07-19.md",
  "docs/governance/l12-hybrid-current-authority-disposition-2026-07-19.md",
]);
const CONTEXT_LABEL =
  /legacy|compatibility|historical|supersed|rollback|pre-cutover|reference only|旧|互換|履歴|過去|廃止/iu;

export function classifyRecognitionCandidate(path: string): RecognitionDisposition {
  if (
    path.includes("l12-canonical-vmodel-direction-directive") ||
    path.includes("vmodel-canonical-authority-cutover") ||
    path.includes("hybrid-rebaseline-v0.5.0-collision")
  ) {
    return "compatibility_authority_review";
  }
  if (path.startsWith("docs/plans/")) return "plan_review";
  if (
    path.startsWith("docs/research/") ||
    (path.startsWith("docs/governance/") && path.includes("-audit")) ||
    /docs\/adr\/ADR-00[1-8]-/u.test(path)
  ) {
    return "historical_context_review";
  }
  if (
    path.startsWith(".github/") ||
    path === "package.json" ||
    [".json", ".jsonl", ".yaml", ".yml"].includes(extname(path))
  ) {
    return "executable_surface_review";
  }
  return "current_authority_review";
}

export function classifyRecognitionReviewStatus(
  disposition: RecognitionDisposition,
  signals: readonly RecognitionSignal[],
): RecognitionReviewStatus {
  return signals.every((signal) => CONTEXT_LABEL.test(signal.excerpt))
    ? "context_labeled"
    : "unresolved";
}

export function classifyRecognitionAuditDisposition(
  disposition: RecognitionDisposition,
  signals: readonly RecognitionSignal[] = [],
): RecognitionAuditDisposition {
  if (disposition === "compatibility_authority_review") return "compatibility_labeled";
  const ids = new Set(signals.map((signal) => signal.id));
  const bunCommand =
    /bun\s+(?:run|test|src\/cli|x)|runner.{0,20}bun|Bun\/Node|Node\/Bun|Bun\s+CLI/iu;
  if (
    disposition === "plan_review" &&
    ids.size === 1 &&
    ids.has("bun_runtime") &&
    signals.every((signal) => bunCommand.test(signal.excerpt))
  ) {
    return "false_positive_execution_command";
  }
  return "needs_manual_review";
}

/** 2026-07-19の全文レビューと独立クロスレビューをpath単位で再現する最終判定。 */
export function classifyFinalRecognitionDisposition(
  candidate: RecognitionCandidate,
): RecognitionFinalDisposition {
  const reviewed = REVIEWED_SAFE_BY_PATH.get(candidate.path);
  if (!reviewed) return "conflict";
  if (reviewed.contentDigest !== candidate.contentDigest) return "needs_manual_review";
  return reviewed.finalDisposition;
}

export function detectL12HybridRecognitionSignals(body: string): RecognitionSignal[] {
  const lines = body.split(/\r?\n/u);
  const signals: RecognitionSignal[] = [];
  for (let index = 0; index < lines.length; index += 1) {
    const window = lines.slice(index, index + 3).join(" ");
    for (const [id, pattern] of SIGNAL_PATTERNS) {
      if (!pattern.test(window)) continue;
      if (signals.some((signal) => signal.id === id && signal.line === index + 1)) continue;
      signals.push({ id, line: index + 1, excerpt: window.trim().slice(0, 240) });
    }
  }
  return signals;
}

function collectTextFiles(root: string): string[] {
  return readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const path = join(root, entry.name);
    if (entry.isDirectory()) return collectTextFiles(path);
    return entry.isFile() && TEXT_EXTENSIONS.has(extname(path)) ? [path] : [];
  });
}

export function scanL12HybridRecognitionCandidates(
  roots: readonly string[] = ["docs", ".github"],
  explicitFiles: readonly string[] = [
    "AGENTS.md",
    "CLAUDE.md",
    ".claude/CLAUDE.md",
    "package.json",
  ],
): RecognitionCandidate[] {
  const paths = [...roots.flatMap(collectTextFiles), ...explicitFiles]
    .filter((path) => !EXCLUDED_PREFIXES.some((prefix) => path.startsWith(prefix)))
    .filter((path) => !EXCLUDED_PATHS.has(path))
    .sort();
  return paths.flatMap((path) => {
    const body = readFileSync(path, "utf8");
    const signals = detectL12HybridRecognitionSignals(body);
    if (signals.length === 0) return [];
    const disposition = classifyRecognitionCandidate(path);
    return [
      {
        path,
        contentDigest: createHash("sha256").update(body).digest("hex"),
        disposition,
        reviewStatus: classifyRecognitionReviewStatus(disposition, signals),
        auditDisposition: classifyRecognitionAuditDisposition(disposition, signals),
        ...(disposition === "plan_review"
          ? { documentStatus: body.match(/^status:\s*["']?([^\s"']+)["']?/mu)?.[1] ?? "missing" }
          : {}),
        signals,
      },
    ];
  });
}

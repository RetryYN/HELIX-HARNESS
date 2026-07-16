#!/usr/bin/env node

import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";

const reviewPath = "docs/governance/generated/helix-bun-plan-replacement-reachability-review-v1.json";
const outputPath = "docs/governance/generated/helix-bun-historical-stale-adjudication-v1.json";
const independentReviewPath = "docs/governance/generated/helix-bun-historical-stale-adjudication-independent-review-v1.json";
const independentReviewScript = "scripts/audit/review-bun-historical-stale-adjudication.py";
const descendantArtifacts = new Set([
  "docs/governance/generated/helix-bun-historical-retain-evidence-readjudication-v1.json",
  "docs/governance/generated/helix-bun-historical-retain-evidence-independent-review-v1.json",
  "docs/governance/generated/helix-df-bun-002-terminal-design-receipts-v1.json",
  "docs/governance/generated/helix-df-bun-002-terminal-design-receipts-independent-review-v1.json",
  "docs/governance/generated/design-freeze-critical-path-v1.json",
  "docs/governance/generated/design-freeze-critical-path-independent-review-v1.json",
  "docs/governance/generated/design-freeze-critical-path-source-rebound-independent-audit-v1.json",
  "docs/governance/generated/requirements-freeze-progress-independent-audit-v1.json",
  "docs/governance/generated/post-po-design-freeze-transition-independent-audit-v1.json",
  "docs/governance/generated/po7-decision-activation-contract-independent-audit-v1.json",
  "docs/governance/generated/hybrid-freeze-worktree-boundary-independent-audit-v1.json",
  "scripts/audit/audit-hybrid-freeze-worktree-boundary.py",
  "docs/governance/generated/repository-savepoint-layer-tag-design-audit-v1.json",
  "docs/governance/generated/repository-savepoint-layer-tag-design-independent-review-v1.json",
  "scripts/audit/audit-savepoint-layer-tag-design.py",
  "scripts/audit/review-savepoint-layer-tag-design.py",
]);
const sha = (value) => createHash("sha256").update(value).digest("hex");
const digest = (value) => sha(JSON.stringify(value));
const volatileCustodyPaths = new Set([
  "docs/governance/helix-requirements-freeze-readiness-ledger.md",
  "docs/governance/generated/README.md",
]);
const canonicalEvidenceBytes = (path, value) => {
  if (!volatileCustodyPaths.has(path)) return value;
  const canonical = value.toString("utf8").replace(/`[0-9a-f]{64}`/gu, "`<VOLATILE_GENERATED_SHA256>`");
  return Buffer.from(canonical, "utf8");
};
const smokeBase = Buffer.from(`generated artifact \`aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\` Bun path docs/x ID-1`, "utf8");
if (sha(canonicalEvidenceBytes("docs/governance/helix-requirements-freeze-readiness-ledger.md", smokeBase)) !== sha(canonicalEvidenceBytes("docs/governance/helix-requirements-freeze-readiness-ledger.md", Buffer.from(smokeBase.toString().replace(/a{64}/u, "b".repeat(64)))))) throw new Error("volatile hash canonicalization smoke failed");
if (sha(canonicalEvidenceBytes("docs/governance/helix-requirements-freeze-readiness-ledger.md", smokeBase)) === sha(canonicalEvidenceBytes("docs/governance/helix-requirements-freeze-readiness-ledger.md", Buffer.from(smokeBase.toString().replace("Bun path", "Node path"))))) throw new Error("semantic drift smoke failed");
const review = JSON.parse(readFileSync(reviewPath));
const target = review.records.filter((row) => row.semantic_class !== "active_consumer_command_replacement");

const listed = execFileSync("git", ["ls-files", "-co", "--exclude-standard", "-z"], { encoding: "utf8" }).split("\0").filter(Boolean);
const excluded = (path) => path === outputPath || path === independentReviewPath || path === independentReviewScript || descendantArtifacts.has(path) || path.startsWith(".git/") || path.includes("node_modules/") || path.includes("__pycache__/") || /\.(?:pyc|png|jpg|jpeg|gif|webp|zip|sqlite|db|woff2?|pdf)$/iu.test(path);
const corpus = [];
for (const path of [...new Set(listed)].sort()) {
  if (excluded(path) || !existsSync(path) || !statSync(path).isFile() || statSync(path).size > 5_000_000) continue;
  const bytes = readFileSync(path);
  if (bytes.includes(0)) continue;
  corpus.push({ path, sha256: sha(canonicalEvidenceBytes(path, bytes)), text: bytes.toString("utf8") });
}
const scopeRows = corpus.map(({ path, sha256 }) => ({ path, sha256 }));
const scopeDigest = digest(scopeRows);

const getSource = (row) => {
  if (!existsSync(row.file)) return { exists: false, line_text: null, file_sha256: null, plan_status: "missing" };
  const bytes = readFileSync(row.file);
  const sourceText = bytes.toString("utf8");
  const lineText = sourceText.split(/\r?\n/u)[row.line - 1] ?? "";
  const status = sourceText.match(/^(?:status|state):\s*["']?([^\n"']+)/imu)?.[1]?.trim().toLowerCase()
    ?? sourceText.match(/\b(?:status|state)\s*[=:]\s*(confirmed|complete|completed|closed|superseded|archived|draft|active)/iu)?.[1]?.toLowerCase()
    ?? "unknown";
  return { exists: true, line_text: lineText, line_sha256: sha(lineText), file_sha256: sha(bytes), plan_status: status };
};
const tokensFor = (row, source) => {
  const planStem = row.file.split("/").at(-1).replace(/\.md$/u, "").replace(/-v\d.*$/iu, "");
  const backticks = source.line_text?.match(/`([^`]{3,120})`/gu)?.map((value) => value.slice(1, -1)) ?? [];
  const ids = source.line_text?.match(/\b(?:PLAN-[A-Z0-9-]+|[A-Z][A-Za-z0-9]+(?:Gate|Registry|Engine|Runner|Adapter|Command)|[a-z][A-Za-z0-9_]+\.(?:ts|py|json))\b/gu) ?? [];
  return [...new Set([planStem, ...backticks, ...ids].filter((token) => token.length >= 5 && !/^(?:bun|npm|node|python)$/iu.test(token)))].sort();
};
const classifyPath = (path) => path.startsWith("docs/governance/generated/") ? "generated_consumer"
  : path.startsWith("src/") || path.startsWith("tests/") || path.startsWith("scripts/") || path.startsWith(".github/")
  ? "executable_or_test_consumer"
  : path.startsWith("docs/archive/") || path.startsWith("docs/migration/") || path.startsWith(".helix/evidence/")
    ? "historical_or_migration_consumer"
    : path.startsWith("docs/design/") || path.startsWith("docs/governance/") || path === "AGENTS.md" || path === "CLAUDE.md"
      ? "current_normative_consumer" : "other_consumer";

const records = target.map((row) => {
  const source = getSource(row);
  const tokens = tokensFor(row, source);
  const hits = [];
  for (const entry of corpus) {
    if (entry.path === row.file || entry.path === reviewPath) continue;
    const matched = tokens.filter((token) => entry.text.includes(token));
    if (matched.length) hits.push({ path: entry.path, sha256: entry.sha256, consumer_class: classifyPath(entry.path), matched_tokens: matched });
  }
  const isStrongSymbol = (token) => !/^PLAN-/u.test(token) && token !== tokens[0] && !/^bun\s/iu.test(token)
    && (token.includes("/") || /(?:Gate|Registry|Engine|Runner|Adapter|Command)$/u.test(token));
  const executableHits = hits.filter((hit) => hit.consumer_class === "executable_or_test_consumer" && hit.matched_tokens.some(isStrongSymbol));
  const normativeHits = hits.filter((hit) => hit.consumer_class === "current_normative_consumer" && hit.matched_tokens.some(isStrongSymbol));
  let adjudication;
  if (row.semantic_class === "stale_orphan") {
    adjudication = executableHits.length || normativeHits.length ? "active_reclassify" : "stale_orphan_retire_candidate";
  } else if (executableHits.length) {
    adjudication = "active_reclassify";
  } else if (/superseded|replaced/iu.test(source.plan_status) || normativeHits.length) {
    adjudication = "superseded_by_current";
  } else {
    adjudication = "immutable_historical_retain";
  }
  const custody = {
    receipt_type: "bun-plan-historical-custody-design.v1",
    source_atom_sha256: row.source_atom_sha256,
    source_file_sha256: source.file_sha256,
    source_line_sha256: source.line_sha256 ?? null,
    closed_world_scope_sha256: scopeDigest,
    retention: adjudication === "stale_orphan_retire_candidate" ? "retain_until_retire_challenge_independent_review_and_tombstone_receipt" : "retain_for_project_lifetime",
    runtime_mutation: false,
  };
  return {
    atom_id: row.atom_id,
    original_semantic_class: row.semantic_class,
    source: { path: row.file, line: row.line, ...source },
    search: { tokens, consumer_hits: hits, executable_symbol_hits: executableHits.length, normative_symbol_hits: normativeHits.length },
    adjudication,
    adjudication_reason: adjudication === "active_reclassify"
      ? "line-specific alias/ID/symbol has current executable or normative consumer; historical/stale classification must not hide an active obligation"
      : adjudication === "superseded_by_current"
        ? "current normative consumer preserves the concept while the PLAN atom remains non-executable historical evidence"
        : adjudication === "stale_orphan_retire_candidate"
          ? "closed-world search found no line-specific executable/normative consumer; deletion remains forbidden until challenge closure"
          : "source atom remains evidence-only and has no line-specific active consumer; immutable custody is the terminal design disposition",
    custody_retention_design_receipt: { ...custody, receipt_sha256: digest(custody) },
    retire_challenge: adjudication === "stale_orphan_retire_candidate" ? {
      status: "open_not_authorized_for_delete",
      required: ["independent closed-world replay", "owner/authority review", "alias expiry proof", "generated consumer zero", "tombstone digest", "rollback pointer"],
    } : null,
    target_trace: {
      hil_ids: ["HIL-BR-14", "HIL-FR-16", "HIL-FR-21", "HIL-FR-22"],
      hr_ids: ["HR-FR-HIL-09", "HR-FR-HIL-26"],
      hat_ids: ["HAT-HIL-09", "HAT-HIL-26"],
      hst_ids: ["HST-HIL-011", "HST-HIL-020", "HST-HIL-041"],
      trace_specificity: "common_source_coverage_edge_only",
      semantic_target_trace_required: true,
    },
    verified: false,
    coverage_credit: false,
  };
});

const counts = Object.fromEntries(["immutable_historical_retain", "superseded_by_current", "stale_orphan_retire_candidate", "active_reclassify"].map((name) => [name, records.filter((row) => row.adjudication === name).length]));
const output = {
  schema_version: "helix.bun-historical-stale-closed-world-adjudication.v1",
  status: "candidate_disposition_closed_world_semantic_review_required_not_promoted",
  generated_at: "2026-07-16",
  sources: [{ path: reviewPath, sha256: sha(readFileSync(reviewPath)) }],
  closed_world_search: { command: "git ls-files -co --exclude-standard -z", exclusions: [outputPath, independentReviewPath, independentReviewScript, ...descendantArtifacts, "binary and pyc extensions", "files over 5MB", "node_modules", "__pycache__"], files: scopeRows.length, scope_sha256: scopeDigest, manifest: scopeRows },
  summary: { rows: records.length, original_historical: records.filter((row) => row.original_semantic_class === "historical_execution_evidence").length, original_stale_orphan: records.filter((row) => row.original_semantic_class === "stale_orphan").length, adjudication_counts: counts, custody_design_receipts: records.length, retire_challenges: records.filter((row) => row.retire_challenge).length, runtime_mutations: 0, verified_true: 0, coverage_credit_true: 0 },
  invariants: ["rows=359+8=367", "every row has exactly one terminal candidate adjudication and custody receipt", "retire candidate never authorizes deletion", "runtime/verified/coverage remain zero"],
  records,
};
if (records.length !== 367 || output.summary.original_historical !== 359 || output.summary.original_stale_orphan !== 8) throw new Error("denominator drift");
if (Object.values(counts).reduce((a, b) => a + b, 0) !== 367) throw new Error("adjudication partition drift");
process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);

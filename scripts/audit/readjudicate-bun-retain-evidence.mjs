#!/usr/bin/env node

import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";

const candidatePath = "docs/governance/generated/helix-bun-historical-stale-adjudication-v1.json";
const reviewPath = "docs/governance/generated/helix-bun-historical-stale-adjudication-independent-review-v1.json";
const retainReviewPath = "docs/governance/generated/helix-bun-historical-retain-evidence-independent-review-v1.json";
const outputPath = "docs/governance/generated/helix-bun-historical-retain-evidence-readjudication-v1.json";
const descendantArtifacts = new Set([
  retainReviewPath,
  "scripts/audit/review-bun-historical-retain-evidence-readjudication.py",
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
const bytes = (path) => readFileSync(path);
const load = (path) => JSON.parse(bytes(path));
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
const source = (path) => ({ path, sha256: sha(bytes(path)) });

const candidate = load(candidatePath);
const review = load(reviewPath);
const retainReview = load(retainReviewPath);
const retainReviewById = new Map(retainReview.findings.map((row) => [row.atom_id, row]));
const retainReviewDecisionSet = retainReview.findings.map((row) => ({ atom_id: row.atom_id, review_decision: row.review_decision, issues: row.issues }));
const targets = new Set(review.findings.filter((row) => row.issues.includes("closed_world_alias_symbol_generated_consumer_unproven")).map((row) => row.atom_id));
const candidateById = new Map(candidate.records.map((row) => [row.atom_id, row]));

const listed = execFileSync("git", ["ls-files", "-co", "--exclude-standard", "-z"], { encoding: "utf8" }).split("\0").filter(Boolean);
const corpus = [];
for (const path of [...new Set(listed)].sort()) {
  if (path === outputPath || descendantArtifacts.has(path) || path.includes("__pycache__/") || !existsSync(path) || !statSync(path).isFile() || statSync(path).size > 5_000_000 || /\.(?:pyc|png|zip|db|sqlite|pdf|woff2?)$/iu.test(path)) continue;
  const content = bytes(path);
  if (content.includes(0)) continue;
  corpus.push({ path, sha256: sha(canonicalEvidenceBytes(path, content)), text: content.toString("utf8") });
}
const scopeManifest = corpus.map(({ path, sha256 }) => ({ path, sha256 }));
const scopeSha256 = digest(scopeManifest);

const historyCache = new Map();
const historyFor = (path) => {
  if (historyCache.has(path)) return historyCache.get(path);
  let commits = [];
  try {
    commits = execFileSync("git", ["log", "-n", "20", "--format=%H", "--", path], { encoding: "utf8" }).trim().split("\n").filter(Boolean);
  } catch { commits = []; }
  const value = { commit_count_observed: commits.length, commits, commit_set_sha256: digest(commits) };
  historyCache.set(path, value);
  return value;
};

const sectionFor = (path, lineNumber) => {
  if (!existsSync(path)) return { heading: null, text: "", semantic_window: "", sha256: null, start_line: null, end_line: null };
  const lines = bytes(path).toString("utf8").split(/\r?\n/u);
  const index = Math.max(0, lineNumber - 1);
  let start = index;
  while (start > 0 && !/^#{1,6}\s/u.test(lines[start])) start--;
  if (!/^#{1,6}\s/u.test(lines[start])) start = Math.max(0, index - 20);
  let end = index + 1;
  while (end < lines.length && !/^#{1,6}\s/u.test(lines[end]) && end - start < 120) end++;
  const text = lines.slice(start, end).join("\n");
  const semanticWindow = lines.slice(Math.max(start, index - 4), Math.min(end, index + 5)).join("\n");
  return { heading: /^#{1,6}\s/u.test(lines[start]) ? lines[start] : null, text, semantic_window: semanticWindow, sha256: sha(text), start_line: start + 1, end_line: end };
};

const tokensFor = (section) => {
  const paths = section.semantic_window.match(/(?:src|tests|scripts|docs|\.github)\/[A-Za-z0-9_./\\-]+(?:\.[A-Za-z0-9_-]+)?/gu) ?? [];
  const ids = section.semantic_window.match(/\b(?:HIL|HR-FR-HIL|HAT-HIL|HST-HIL|HAC-HIL)-[A-Z0-9.-]+\b/gu) ?? [];
  const symbols = section.semantic_window.match(/\b[A-Z][A-Za-z0-9]*(?:Gate|Registry|Engine|Runner|Adapter|Command|Projection|Ledger|Receipt)\b/gu) ?? [];
  return [...new Set([...paths, ...ids, ...symbols].map((value) => value.replace(/[),.;:`]+$/u, "")).filter((value) => value.length >= 6 && !value.startsWith("PLAN-")))].sort();
};

const records = [...targets].sort().map((atomId) => {
  const base = candidateById.get(atomId);
  if (!base) throw new Error(`missing candidate ${atomId}`);
  const section = sectionFor(base.source.path, base.source.line);
  const tokens = tokensFor(section);
  const tokenEvidence = tokens.map((token) => {
    const pathExists = token.includes("/") && existsSync(token);
    const hits = corpus.filter((entry) => entry.path !== base.source.path && entry.text.includes(token)).map((entry) => ({ path: entry.path, sha256: entry.sha256, generated_consumer: entry.path.startsWith("docs/governance/generated/"), executable_consumer: /^(?:src|tests|scripts|\.github)\//u.test(entry.path) }));
    return { token, current_path_exists: pathExists, hits };
  });
  const activeEvidence = tokenEvidence.filter((item) => item.current_path_exists && /^(?:src|tests|scripts|\.github)\//u.test(item.token) || item.hits.some((hit) => hit.executable_consumer));
  const generatedHits = tokenEvidence.flatMap((item) => item.hits.filter((hit) => hit.generated_consumer).map((hit) => ({ token: item.token, ...hit })));
  const history = historyFor(base.source.path);
  const planStatus = base.source.plan_status;
  let adjudication;
  const historicalBunSyntax = /\bbun(?:x)?\b/iu.test(base.source.line_text ?? "");
  if (activeEvidence.length && !historicalBunSyntax) adjudication = "active_reclassify";
  else if (base.source.exists && /completed|closed|confirmed|historical|archived/iu.test(planStatus) && history.commit_count_observed > 0 && section.sha256 && tokens.length > 0) adjudication = "immutable_historical_retain";
  else adjudication = "explicit_challenge";
  const independentReview = retainReviewById.get(atomId);
  if (!independentReview) throw new Error(`missing retain independent review ${atomId}`);
  adjudication = independentReview.review_decision === "retain_supported" ? "immutable_historical_retain" : "explicit_challenge";
  const currentBunHits = independentReview.active_authority_hits ?? [];
  const authorityHits = currentBunHits.filter((hit) => !/^tests\//u.test(hit.path));
  const fixtureHits = currentBunHits.filter((hit) => /^tests\//u.test(hit.path));
  const obligationClass = authorityHits.length && fixtureHits.length ? "mixed_authority_and_fixture" : authorityHits.length ? "authority_surface" : fixtureHits.length ? "fixture_surface" : null;
  const receiptBody = {
    atom_id: atomId,
    source_atom_sha256: base.custody_retention_design_receipt.source_atom_sha256,
    source_file_sha256: base.source.file_sha256,
    surrounding_section_sha256: section.sha256,
    linked_token_set_sha256: digest(tokens),
    git_commit_set_sha256: history.commit_set_sha256,
    search_scope_sha256: scopeSha256,
    adjudication,
  };
  return {
    atom_id: atomId,
    original_adjudication: base.adjudication,
    source: { path: base.source.path, line: base.source.line, plan_status: planStatus, current_exists: base.source.exists, file_sha256: base.source.file_sha256 },
    surrounding_section: { heading: section.heading, start_line: section.start_line, end_line: section.end_line, sha256: section.sha256 },
    semantic_trace: { linked_tokens: tokens, token_evidence: tokenEvidence, generated_consumer_hits: generatedHits, historical_bun_syntax: historicalBunSyntax, plan_stem_used_as_evidence: false },
    git_history: history,
    adjudication,
    adjudication_reason: adjudication === "immutable_historical_retain" ? "independent review supports immutable historical retention" : "independent review supports the existing challenge or requires an over-classified retain to return to explicit challenge; supersede/retire is forbidden",
    independent_review: { review_decision: independentReview.review_decision, issues: independentReview.issues },
    current_bun_string_design_obligation: obligationClass ? { status: "open", classification: obligationClass, authority_hits: authorityHits, fixture_hits: fixtureHits, denominator_relationship: "overlap_dimension_not_row_denominator", historical_custody_effect: "none" } : null,
    explicit_challenge: adjudication === "explicit_challenge" ? { status: "open", missing: [tokens.length === 0 ? "line-specific linked ID/path/symbol" : null, history.commit_count_observed === 0 ? "git history custody" : null, !section.sha256 ? "surrounding section digest" : null].filter(Boolean), prohibited_until_resolved: ["superseded_by_current", "retire", "delete"] } : null,
    target_trace: base.target_trace,
    custody_receipt_candidate: { ...receiptBody, receipt_sha256: digest(receiptBody), retention: adjudication === "immutable_historical_retain" ? "retain_for_project_lifetime" : "retain_until_active_route_or_challenge_terminal_receipt" },
    runtime_mutation: false,
    verified: false,
    coverage_credit: false,
  };
});

const count = (name) => records.filter((row) => row.adjudication === name).length;
const output = {
  schema_version: "helix.bun-historical-retain-evidence-readjudication.v1",
  status: "second_stage_semantic_trace_complete_runtime_untouched",
  generated_at: "2026-07-16",
  sources: [source(candidatePath), source(reviewPath), { path: retainReviewPath, normalized_decision_sha256: digest(retainReviewDecisionSet), binding: "decision fields only; candidate file hash is excluded to prevent candidate/review digest recursion" }],
  search_contract: { plan_stem_as_evidence: "forbidden", git_history: "git log -n 20 --format=%H -- <source path>", corpus: "git ls-files -co --exclude-standard", scope_files: scopeManifest.length, scope_sha256: scopeSha256, manifest: scopeManifest },
  summary: { rows: records.length, immutable_historical_retain: count("immutable_historical_retain"), active_reclassify: count("active_reclassify"), explicit_challenge: count("explicit_challenge"), superseded: 0, retire: 0, custody_receipt_candidates: records.length, current_bun_string_candidates: records.filter((row) => row.current_bun_string_design_obligation).length, current_bun_string_design_obligations: Object.fromEntries(["authority_surface", "fixture_surface", "mixed_authority_and_fixture"].map((name) => [name, records.filter((row) => row.current_bun_string_design_obligation?.classification === name).length])), runtime_mutations: 0, verified_true: 0, coverage_credit_true: 0 },
  invariants: ["rows=333", "independent review fixes retain=260 and challenge=73", "PLAN stem is never evidence", "every row has surrounding-section and git-history audit", "137 current Bun string candidates remain a separate authority/fixture Design-obligation overlap dimension", "unsupported rows challenge rather than supersede/retire", "runtime/verified/coverage remain zero"],
  records,
};
if (records.length !== 333 || output.summary.immutable_historical_retain + output.summary.active_reclassify + output.summary.explicit_challenge !== 333) throw new Error("readjudication denominator drift");
if (output.summary.immutable_historical_retain !== 260 || output.summary.explicit_challenge !== 73 || output.summary.active_reclassify !== 0 || output.summary.current_bun_string_candidates !== 137) throw new Error("independent review disposition drift");
if (output.summary.superseded || output.summary.retire || output.summary.runtime_mutations || output.summary.verified_true || output.summary.coverage_credit_true) throw new Error("safety invariant failed");
process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);

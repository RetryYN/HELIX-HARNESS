#!/usr/bin/env python3
"""Materialize SCF-B-0126 for the fixed-base residual 120 legacy source assets.

This is a static research generator. It reads archive bytes only with ``git
show BASE:path`` and never imports or executes archive code.
"""
from __future__ import annotations

import hashlib
import json
import subprocess
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BUNDLE = ROOT / "scaffold/legacy-implementation-residual-0126"
BASE_REVISION = "5562f04da0f3205f9aa58205ec0d478419fc4f2e"
PRODUCT_RESEARCH_COMMIT = "b3a3c49b34bfaa1cca5861075d1de18c0e5e7204"
BINDING_ID = "SCF-B-0126"
ARCHIVE_PREFIX = "archive/legacy-generation-2026-09-14/root/"
PHASE = "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl"
DISPOSITION = "docs/governance/legacy-asset-disposition.jsonl"
DECISIONS = "docs/governance/legacy-asset-decisions.jsonl"
READ_AFTER = "docs/governance/legacy-asset-copy-read-after.jsonl"
MANIFEST = "archive/legacy-generation-2026-09-14/MANIFEST.sha256"
BOUNDARY = "docs/concept/product-boundary.md"
L1 = {
    "HELIX-HARNESS": "docs/helix-harness/L1-planning/product-intent.md",
    "HELIX-OS": "docs/helix-os/L1-planning/system-intent.md",
    "HELIX-Web": "docs/helix-web/L1-planning/product-intent.md",
    "HELIX-Web-OS": "docs/helix-web-os/L1-planning/system-intent.md",
}
FAILURE_SOURCE = "docs/governance/audits/source-rebaseline/legacy-ci-ai-runtime-source-inventory.md"
CONSUMER_SOURCE = "docs/governance/audits/source-rebaseline/legacy-ci-consumer-relation-inventory.md"
WAVE_PATHS = {
    n: (f"docs/governance/legacy-requirement-direct-semantic-review-wave{n}.jsonl" if n <= 36 else f"scaffold/legacy-semantic-review-wave{n}/legacy-requirement-direct-semantic-review-wave{n}.jsonl")
    for n in range(1, 51)
}
PRODUCT_RESEARCH_BUNDLES = (
    "scaffold/legacy-asset-product-classification-0107/classification-research.jsonl",
    "scaffold/legacy-lint-candidate-product-classification-0128/classification-research.jsonl",
    "scaffold/legacy-lint-product-classification-0108/classification-research.jsonl",
    "scaffold/legacy-runtime-product-classification-0117/classification-research.jsonl",
    "scaffold/legacy-runtime-residual-product-classification-0133/classification-research.jsonl",
    "scaffold/legacy-schema-product-classification-0120/classification-research.jsonl",
    "scaffold/legacy-source-product-classification-0123/classification-research.jsonl",
    "scaffold/legacy-state-db-product-classification-0127/classification-research.jsonl",
)
EXISTING_RESEARCH_PREFIXES = (
    "src/lint/", "src/runtime/", "src/schema/", "src/workflow/",
    "src/setup/", "src/cli/", "src/requirements/", "src/shared/",
)
UNRESEARCHED_PREFIX_ASSET_PATHS = (
    ('LEGACY-ASSET-D331F13A1FA21B0C05FE', 'src/cli/commands/issue-hierarchy-census.ts'),
    ('LEGACY-ASSET-08F8688895B787BD3D5C', 'src/cli/commands/rename.ts'),
    ('LEGACY-ASSET-313DC99AEF53834D9207', 'src/cli/commands/route.ts'),
    ('LEGACY-ASSET-C4C93ABA07B48AAB6D05', 'src/cli/full-regression-shards.ts'),
    ('LEGACY-ASSET-110F52E3C367C3DCCFE5', 'src/cli/helpers.ts'),
    ('LEGACY-ASSET-B85C45D7C5621BD8201C', 'src/cli/lite-canary-selector.ts'),
    ('LEGACY-ASSET-A3EC7F28F52F2808041E', 'src/cli/preflight-gate-aggregation.ts'),
    ('LEGACY-ASSET-354670A58AC796DDC80F', 'src/requirements/nfr-registry.ts'),
    ('LEGACY-ASSET-4329EAEA146D5D97E088', 'src/requirements/requirement-generated-view-generator.ts'),
    ('LEGACY-ASSET-555329E1E192F23D2865', 'src/requirements/requirement-generated-view.ts'),
    ('LEGACY-ASSET-85F302A8E7280A166171', 'src/schema/atomic-contract-id.ts'),
    ('LEGACY-ASSET-11C75CC63968FB9A5BD2', 'src/schema/current-location-workflow-identity-resolver.ts'),
    ('LEGACY-ASSET-187E43CE3096B88CA8B4', 'src/schema/current-location-workflow-identity.ts'),
    ('LEGACY-ASSET-EEC2DA57D64EC4908112', 'src/schema/design-declarations.ts'),
    ('LEGACY-ASSET-132E6449FA96E5CABBBF', 'src/schema/green-command.ts'),
    ('LEGACY-ASSET-9BFD3E86A8F5AE0DA720', 'src/schema/harness-db-catalog.ts'),
    ('LEGACY-ASSET-E9FF2DF247348F5608F2', 'src/schema/harness-db-indexes.ts'),
    ('LEGACY-ASSET-1ABE9822E36400BC82C2', 'src/schema/harness-db-table-builders.ts'),
    ('LEGACY-ASSET-5442594ED146AD72850C', 'src/schema/harness-db-tables-design.ts'),
    ('LEGACY-ASSET-30539BEC772802F50C9D', 'src/schema/harness-db-tables-graph.ts'),
    ('LEGACY-ASSET-B8033A9BCD9CC70BF8F6', 'src/schema/harness-db-tables-registry.ts'),
    ('LEGACY-ASSET-E4EDA1517A4F062B2D64', 'src/schema/harness-db-tables-screen.ts'),
    ('LEGACY-ASSET-8A390337BEE15CED1AA2', 'src/schema/harness-db-tables-semantic.ts'),
    ('LEGACY-ASSET-18579F09E6B2C29E5622', 'src/schema/harness-db-types.ts'),
    ('LEGACY-ASSET-F0ED1811C81FD1184188', 'src/schema/harness-db.ts'),
    ('LEGACY-ASSET-2B68A62292FADDC5BCA6', 'src/schema/loop-plan-id.ts'),
    ('LEGACY-ASSET-18EBF31B40C9A58DE958', 'src/schema/model-registry.ts'),
    ('LEGACY-ASSET-3D7D5062903EE9CEDFEF', 'src/schema/open-branch-plan-reservation-authority.ts'),
    ('LEGACY-ASSET-414CC59CA35B28BB7AF4', 'src/schema/runtime-verification.ts'),
    ('LEGACY-ASSET-3AEDBB3A9A7B549C4C24', 'src/schema/team.ts'),
    ('LEGACY-ASSET-97D1784D53918F126E3B', 'src/schema/visualization-contract.ts'),
    ('LEGACY-ASSET-72ECA3C318F8028A6D91', 'src/schema/visualization-tree-contract.ts'),
    ('LEGACY-ASSET-E595E192F58FF3B1A2A0', 'src/schema/visualization-view-contract.ts'),
    ('LEGACY-ASSET-DBCE67DF3C1FE8648191', 'src/schema/workflow-execution-policy-projection.ts'),
    ('LEGACY-ASSET-67D77EEBF1209346882C', 'src/schema/workflow-execution-policy-registry.ts'),
    ('LEGACY-ASSET-CD0EAE866A7CA2A0D1F8', 'src/setup/update-check.ts'),
    ('LEGACY-ASSET-4A9AB5B2EF182BC30431', 'src/shared/canonical-digest.ts'),
    ('LEGACY-ASSET-6B10C0467A1A1918D46E', 'src/shared/collection-utils.ts'),
    ('LEGACY-ASSET-F6A0AC0CAC1590A754EC', 'src/shared/commit-subject.ts'),
    ('LEGACY-ASSET-5BABA53229DF9A5DECEF', 'src/shared/file-walk.ts'),
    ('LEGACY-ASSET-E9F6609D6EBDEBD288BC', 'src/shared/repo-info.ts'),
    ('LEGACY-ASSET-EFFA71383D8FAE4EBBBA', 'src/shared/shell-quote.ts'),
    ('LEGACY-ASSET-F2B7BCF14B8563B15C14', 'src/shared/string-utils.ts'),
    ('LEGACY-ASSET-0996E33E11CB9283EEC8', 'src/shared/time-utils.ts'),
    ('LEGACY-ASSET-8F85476FEB95D1284680', 'src/shared/typescript-lazy.ts'),
    ('LEGACY-ASSET-ECE1AFAAE85425CD29BB', 'src/shared/value-guards.ts'),
    ('LEGACY-ASSET-F5C9B1066B7337E45182', 'src/workflow/cli-workflow-identity-projection.ts'),
    ('LEGACY-ASSET-3290C9A3BA7FAD7BA07C', 'src/workflow/contracts-extras.ts'),
    ('LEGACY-ASSET-4D3446684F730BFEB99E', 'src/workflow/contracts-types.ts'),
    ('LEGACY-ASSET-66A3EB90764ABB6E7F57', 'src/workflow/current-location-workflow-identity.ts'),
    ('LEGACY-ASSET-F45E18DC5CE003BD8D91', 'src/workflow/skill-applicability-authoring.ts'),
    ('LEGACY-ASSET-D73981AB049C177AC184', 'src/workflow/universal-workflow-envelope.ts'),
    ('LEGACY-ASSET-D641C9E49847C74848CE', 'src/workflow/workflow-interview-unresolved.ts'),
)
UNRESEARCHED_PREFIX_ASSET_IDS = frozenset(a for a, _ in UNRESEARCHED_PREFIX_ASSET_PATHS)
UNRESEARCHED_PREFIX_SOURCE_PATHS = frozenset(p for _, p in UNRESEARCHED_PREFIX_ASSET_PATHS)
if len(UNRESEARCHED_PREFIX_ASSET_PATHS) != 53 or len(UNRESEARCHED_PREFIX_ASSET_IDS) != 53 or len(UNRESEARCHED_PREFIX_SOURCE_PATHS) != 53:
    raise AssertionError("unresearched prefix residual pin drift")
PRODUCTS = ("HELIX-HARNESS", "HELIX-OS", "HELIX-Web", "HELIX-Web-OS")

# These are manually read source-semantic pins. A path is never sufficient:
# each non-insufficient candidate requires a concrete source marker, span, and
# explanation of the product boundary. The validator repeats these pins.
def p(category: str, products: list[str], marker: str, reason: str, length: int = 18) -> dict:
    return {"category": category, "products": products, "marker": marker, "reason": reason, "length": length}

D_H = {
    "src/config/requirements-binding-policy.ts": p("direct_product_basis", ["HELIX-HARNESS"], "export const REQUIREMENTS_BINDING_POLICY_TERMS", "The source fixes requirements binding terms and L1-L2 viewpoint limits; this is HARNESS requirement/process artifact policy."),
    "src/context/doc-router.ts": p("direct_product_basis", ["HELIX-HARNESS"], "export function buildDocIndex", "The source builds a canonical document index and routes task context to source sections; this is HARNESS artifact/context navigation."),
    "src/graph/loader.ts": p("direct_product_basis", ["HELIX-HARNESS"], "Relation graph source set loader", "The source assembles requirement, design, implementation, and test relation evidence for V-model coverage; the reviewed contract is HARNESS trace structure."),
    "src/plan/lint-policy.ts": p("direct_product_basis", ["HELIX-HARNESS"], "const DESIGN_LAYERS_REQUIRING_SUB_DOC", "The source enforces plan/document layer completeness and reverse trace obligations; this is HARNESS process and verification readiness semantics."),
    "src/task/proposal-coverage-data.ts": p("direct_product_basis", ["HELIX-HARNESS"], "export const DOCUMENT_PACKS", "The source declares required document packs and coverage for proposal/design work; this is HARNESS process artifact completeness."),
    "src/task/proposal-document-pack-types.ts": p("direct_product_basis", ["HELIX-HARNESS"], "export interface DocumentPack", "The source defines document-pack levels, required documents, and reasons; this is HARNESS design/process artifact structure."),
    "src/semantic/semantic-intake-receipt.ts": p("direct_product_basis", ["HELIX-HARNESS"], "export function computeInventoryDigest", "The source fixes intake source inventory, divergence ruling, and atom disposition digests without write authority; this is HARNESS artifact intake evidence."),
}
D_O = {
    "src/audit/branches.ts": p("direct_product_basis", ["HELIX-OS"], "export function analyzeBranches", "The source evaluates branch reachability, protection, worktree use, and stale dispositions; these are HELIX-OS repository/state controls."),
    "src/audit/enforcement-route-input.ts": p("direct_product_basis", ["HELIX-OS"], "export const prReviewRouteInputSchema", "The source constrains review, CI autofix, and release automation route inputs; these are HELIX-OS operational admission controls."),
    "src/audit/quality.ts": p("direct_product_basis", ["HELIX-OS"], "export function runQualityAudit", "The source scans repository content for secrets, unsafe commands, provider literals, and legacy runtime references; this is HELIX-OS repository governance."),
    "src/audit/repository-hygiene.ts": p("direct_product_basis", ["HELIX-OS"], "export function analyzeRepositoryHygiene", "The source combines main, open-PR, writer, and worktree evidence into repository hygiene dispositions; this is HELIX-OS state/control operation."),
    "src/doctor/check-registry.ts": p("direct_product_basis", ["HELIX-OS"], "export function aggregateInternalDoctorChecks", "The source aggregates hard and advisory doctor checks into operational readiness; this is HELIX-OS control and diagnostics."),
    "src/doctor/failure.ts": p("direct_product_basis", ["HELIX-OS"], "export function doctorFailure", "The source creates stable typed failure codes for operational doctor read/check/state failures; this is HELIX-OS diagnostic control."),
    "src/doctor/nfr-registry-check.ts": p("direct_product_basis", ["HELIX-OS"], "export function checkNfrRegistry", "The source checks the NFR registry as a doctor lint boundary; this is HELIX-OS operational readiness evidence."),
    "src/doctor/result.ts": p("direct_product_basis", ["HELIX-OS"], "export type DoctorScope", "The source defines doctor scopes, timings, check runs, and aggregated results; this is HELIX-OS diagnostics/state projection."),
    "src/guardrail/ledger.ts": p("direct_product_basis", ["HELIX-OS"], "export function recordGuardrailDecision", "The source records normalized guardrail decisions into state-backed ledger rows; this is HELIX-OS authority and state control."),
    "src/policy/active-plan-selection.ts": p("direct_product_basis", ["HELIX-OS"], "export function selectActivePlanId", "The source selects a unique active plan from canonical plan IDs and fail-closes empty/unknown choices; this is HELIX-OS control state."),
    "src/policy/closure-authority-registry.ts": p("direct_product_basis", ["HELIX-OS"], "export function analyzeClosureAuthorityDrift", "The source validates closure authority registry paths, digests, and drift; this is HELIX-OS authority/state governance."),
    "src/policy/filesystem-durability.ts": p("direct_product_basis", ["HELIX-OS"], "export function supportsDirectoryFsync", "The source defines filesystem durability and atomic rename collision checks for state writes; this is HELIX-OS operational persistence control."),
    "src/search/index.ts": p("direct_product_basis", ["HELIX-OS"], "export function upsertSearchReference", "The source writes and queries state-backed search references; this is HELIX-OS operational state indexing."),
    "src/security/secret-policy.ts": p("direct_product_basis", ["HELIX-OS"], "export function isSecretLike", "The source centralizes secret-like token detection and scan violations for repository/state boundaries; this is HELIX-OS safety governance."),
    "src/task/tier-router-policy.ts": p("direct_product_basis", ["HELIX-OS"], "export const ROLE_ARCHETYPE", "The source maps operational roles, tiers, providers, and review policy; this is HELIX-OS delegation/control routing."),
    "src/task/tier-router.ts": p("direct_product_basis", ["HELIX-OS"], "export function route", "The source resolves task difficulty, risk, provider placement, frontier approval, and cross assignment; this is HELIX-OS orchestration control."),
    "src/team/model-effort.ts": p("direct_product_basis", ["HELIX-OS"], "export function adaptReasoningEffort", "The source adapts model reasoning effort from runtime observations under fixed model policy; this is HELIX-OS worker orchestration."),
    "src/team/run-policy.ts": p("direct_product_basis", ["HELIX-OS"], "export const TEAM_RUN_REQUIRES_HYBRID_MESSAGE", "The source fixes team-run hybrid, provider, dry-run, and dependency failure policy messages; this is HELIX-OS execution control."),
}
C_HO = {
    "src/adapters/document-semantic-diff-fs.ts": p("multi_product_conflict", ["HELIX-HARNESS", "HELIX-OS"], "export function loadDocumentSemanticDiffReportFromGit", "The source compares HARNESS document semantic artifacts while reading Git/current repository state through an operational adapter; artifact and OS state boundaries meet."),
    "src/adapters/open-branch-plan-reservation-authority.ts": p("multi_product_conflict", ["HELIX-HARNESS", "HELIX-OS"], "export function buildOpenBranchPlanReservationAuthoritySnapshot", "The source binds plan material and branch reservations to authority snapshots; HARNESS plan artifact meaning and HELIX-OS branch/state control compete."),
    "src/assets/catalog.ts": p("multi_product_conflict", ["HELIX-HARNESS", "HELIX-OS"], "export function catalogAutomationAssets", "The source catalogs skills, rosters, commands, metadata drift, search references, and HarnessDb rows; artifact catalog and OS state projection overlap."),
    "src/composition/db-rebuild-composition.ts": p("multi_product_conflict", ["HELIX-HARNESS", "HELIX-OS"], "export function rebuildHarnessDb", "The source rebuilds harness.db while summarizing visualization/V-model tree state; HARNESS evidence projection and OS persistence operation meet."),
    "src/design/design-registry-screen-intake.ts": p("multi_product_conflict", ["HELIX-HARNESS", "HELIX-Web"], "export function buildScreenIntake", "The source maps requirement catalog and screen traces into a design registry; HARNESS requirement/design trace and Web screen responsibility overlap."),
    "src/design/screen-applicability-sqlite-store.ts": p("multi_product_conflict", ["HELIX-HARNESS", "HELIX-Web"], "export function ensureScreenApplicabilityTables", "The source persists screen applicability and gate receipts in SQLite; HARNESS capability/design contract and Web screen state meet."),
    "src/design/screen-applicability-store.ts": p("multi_product_conflict", ["HELIX-HARNESS", "HELIX-Web"], "export function buildScreenStageClosureCommit", "The source validates no-UI/UI completion, agreement, backpropagation, and screen-stage closure; HARNESS capability evidence and Web presentation applicability overlap."),
    "src/design/ui-domain-gate.ts": p("multi_product_conflict", ["HELIX-HARNESS", "HELIX-Web"], "export function analyzeUiDomainBundleGate", "The source gates the harness-console UI domain bundle against required entities; HARNESS domain contract and Web UI boundary cannot yield one owner."),
    "src/doctor/workflow-guide-authority.ts": p("multi_product_conflict", ["HELIX-HARNESS", "HELIX-OS"], "export function analyzeWorkflowGuideAuthority", "The source compares workflow guide identity/digests with installed catalogs and registries; HARNESS workflow artifact guidance and OS authority/control overlap."),
    "src/export/document-export.ts": p("multi_product_conflict", ["HELIX-HARNESS", "HELIX-Web"], "export function renderDocumentExport", "The source projects canonical HARNESS documents into CSV/Markdown/XLSX/PPTX presentation formats; artifact export and Web presentation responsibility meet."),
    "src/measurement/bounded-probe-history.ts": p("multi_product_conflict", ["HELIX-HARNESS", "HELIX-OS"], "export function appendBoundedProbeRun", "The source binds bounded verification probes and measurement evidence to append-only DB history; HARNESS measurement contract and OS execution/state control overlap."),
    "src/policy/closure-authority-backfill.ts": p("multi_product_conflict", ["HELIX-HARNESS", "HELIX-OS"], "export interface ClosureAuthorityBackfillCandidate", "The source models closure-authority backfill candidates, typed authority blocks, and decisions; HARNESS closure evidence and OS authority migration overlap."),
    "src/policy/historical-vpair-migration-authority.ts": p("multi_product_conflict", ["HELIX-HARNESS", "HELIX-OS"], "export function classifyHistoricalVpairMigration", "The source classifies historical V-pair migration candidates against authority rows and decisions; HARNESS V-model history and OS migration authority overlap."),
    "src/semantic/semantic-commit-store.ts": p("multi_product_conflict", ["HELIX-HARNESS", "HELIX-OS"], "export function buildSemanticCommit", "The source validates semantic envelopes and appends transaction receipts to HarnessDb; HARNESS semantic artifact and OS transaction writer boundaries meet."),
    "src/semantic/semantic-contract-revalidator.ts": p("multi_product_conflict", ["HELIX-HARNESS", "HELIX-OS"], "export function revalidateSemanticEnvelope", "The source revalidates semantic provenance, digests, paths, and contract envelopes at the Node execution boundary; artifact contract and OS execution control overlap."),
    "src/team/launch-policy.ts": p("multi_product_conflict", ["HELIX-HARNESS", "HELIX-OS"], "export interface TeamLaunchRecommendation", "The source turns task difficulty/risk and artifact work into team launch recommendations; HARNESS process judgement and OS worker orchestration compete."),
    "src/gate/review-tier.ts": p("multi_product_conflict", ["HELIX-HARNESS", "HELIX-OS"], "export function evaluateGateReview", "The source evaluates V-model review checklist and human judgement gates with cross-agent execution context; HARNESS acceptance semantics and OS review routing overlap."),
    "src/gate/static.ts": p("multi_product_conflict", ["HELIX-HARNESS", "HELIX-OS"], "export function analyzeLayerPairGate", "The source evaluates pair freeze, verification groups, coverage, and repository inputs; HARNESS pair evidence and OS gate/readiness control overlap."),
    "src/vscode/extension-manifest.ts": p("multi_product_conflict", ["HELIX-HARNESS", "HELIX-Web"], "export function helixVscodeContributionManifest", "The source contributes HARNESS/project visualization views and commands to VS Code; HARNESS artifact projection and Web presentation responsibility overlap."),
    "src/vscode/extension.ts": p("multi_product_conflict", ["HELIX-HARNESS", "HELIX-Web"], "export async function activate", "The source activates the visualization extension and registers a repository UI surface; HARNESS visualization evidence and Web presentation responsibility overlap."),
    "src/vscode/tree-decoration.ts": p("multi_product_conflict", ["HELIX-HARNESS", "HELIX-Web"], "export function decorateVscodeTree", "The source turns a visualization contract into a VS Code tree with user commands; HARNESS evidence shape and Web/UI presentation overlap."),
    "src/vscode/tree-view-provider.ts": p("multi_product_conflict", ["HELIX-HARNESS", "HELIX-Web"], "export function buildVisualizationTreeView", "The source projects a HARNESS visualization contract into a VS Code view; artifact projection and presentation boundary compete."),
    "src/web/share.ts": p("multi_product_conflict", ["HELIX-Web", "HELIX-Web-OS"], "export function buildReadOnlyShareBundle", "The source builds a read-only Cloudflare share bundle with webhook verification and deployment/activation prohibitions; Web presentation and Web-OS service/deployment boundaries meet."),
    "src/feedback/lifecycle-node.ts": p("direct_product_basis", ["HELIX-OS"], "export function nodeFeedbackLifecycleDeps", "The source binds feedback lifecycle events to HarnessDb, filesystem journal, and fencing dependencies; this is HELIX-OS operational state/control."),
}
I = {
    ".claude/hooks/git-command-guard.ts": p("insufficient_basis", [], "PreToolUse(Bash / exec_command) hook", "The source is an archived Claude hook entry that delegates to runtime guards; its wrapper role and shared runtime dependency do not establish a four-product owner.", 12),
    ".claude/hooks/session-log.ts": p("insufficient_basis", [], "Backward-compatible Claude Code session-log shim", "The source is a backward-compatible hook shim selecting CLI session commands; it lacks a product-specific semantic contract and must remain non-executed evidence.", 12),
    ".claude/hooks/work-guard.ts": p("insufficient_basis", [], "Claude Code PreToolUse(Edit|Write|MultiEdit) hook entry", "The source is a hook entry delegating work/secret guards; wrapper and shared runtime semantics are insufficient for product classification.", 12),
    "scripts/audit-l12-hybrid-recognition.ts": p("insufficient_basis", [], "#!/usr/bin/env -S npx --no-install tsx", "The source is a command wrapper around lint recognition functions; the wrapper alone does not establish HARNESS or OS responsibility.", 12),
    "scripts/helix": p("insufficient_basis", [], "HELIX thin POSIX entrypoint", "The source is a thin launcher selecting checkout source or packaged dist; it is shared infrastructure without product-boundary proof.", 8),
    "scripts/helix.ps1": p("insufficient_basis", [], "HELIX thin Windows PowerShell entrypoint", "The source is a thin Windows launcher selecting checkout source or packaged dist; it is shared infrastructure without product-boundary proof.", 8),
    "src/feedback/lifecycle.ts": p("insufficient_basis", [], "export * from \"../policy/feedback-lifecycle\"", "The source is a two-line re-export facade; it contains no independent semantic span from which product responsibility can be established.", 2),
    "src/plan/lint-types.ts": p("insufficient_basis", [], "interface LintResult", "The source contains shared plan-lint type declarations only; types without behavior or boundary context are insufficient for product classification.", 12),
    "src/vmodel/design-declarations.ts": p("insufficient_basis", [], "export * from \"../schema/design-declarations\"", "The source is a one-line V-model re-export facade; it contains no independent product responsibility evidence.", 1),
    "src/vmodel/fit.ts": p("insufficient_basis", [], "Compatibility evidence anchor for the V-model fit artifact path", "The source explicitly identifies itself as a compatibility anchor while executable projection lives elsewhere; this path alone cannot establish product ownership.", 8),
    "src/vmodel/zip-manifest.ts": p("insufficient_basis", [], "export * from \"../schema/hybrid-vmodel-manifest\"", "The source is a one-line manifest re-export facade; it lacks an independent semantic owner span.", 1),
    "src/vscode/extension-adapter.ts": p("insufficient_basis", [], "export interface VscodeApiLike", "The source defines generic VS Code adapter interfaces and validation; the adapter contract alone does not resolve HARNESS versus Web responsibility.", 16),
    "src/web/.gitkeep": p("insufficient_basis", [], "中央 Web UI service の home", "The source is a repository placeholder describing a future Web home and L2 boundary; it contains no implemented semantic span for product classification.", 3),
    "src/web/index.ts": p("insufficient_basis", [], "export { componentCoverageSummary", "The source is a re-export index for Web modules; it contains no independent product responsibility span.", 12),
}
D_WEB = {
    "src/web/catalog.ts": p("direct_product_basis", ["HELIX-Web"], "export const COMMON_COMPONENTS", "The source declares read-only common and screen-specific UI components and status states; this is HELIX-Web presentation responsibility."),
    "src/web/render.ts": p("direct_product_basis", ["HELIX-Web"], "export function renderScreen", "The source renders read-only screens, status badges, and the app shell as HTML; this is HELIX-Web presentation behavior."),
    "src/web/tokens.ts": p("direct_product_basis", ["HELIX-Web"], "export function loadUiTokens", "The source loads and validates UI color, layout, and component tokens for screen rendering; this is HELIX-Web presentation configuration."),
    "src/web/types.ts": p("direct_product_basis", ["HELIX-Web"], "export interface ScreenSpec", "The source defines screen, component, status, and rendered-screen contracts; this is HELIX-Web presentation data structure."),
}

REVIEW_SPECS: dict[str, dict] = {}
for group in (D_H, D_O, C_HO, D_WEB, I):
    REVIEW_SPECS.update(group)
if set(REVIEW_SPECS) != set(I) | set(D_H) | set(D_O) | set(C_HO) | set(D_WEB):
    raise AssertionError("review spec construction failure")

BOUNDARY_RANGES = [(36, 39), (54, 65), (86, 89)]
L1_RANGES = {
    "HELIX-HARNESS": [(22, 35), (54, 58)],
    "HELIX-OS": [(22, 40), (59, 63)],
    "HELIX-Web": [(24, 35), (45, 49)],
    "HELIX-Web-OS": [(14, 23), (37, 44)],
}
HUMAN_JUDGMENT = [
    "product_owner_and_boundary_decision",
    "source_semantic_anchor_acceptance",
    "phase_admission_and_successor_assignment",
    "legacy_consumer_closure_and_failure_disposition",
    "formal_asset_classification_update",
]


def tagged(data: bytes) -> str:
    return "sha256:" + hashlib.sha256(data).hexdigest()


def git_bytes(path: str, base: str = BASE_REVISION) -> bytes:
    return subprocess.check_output(["git", "show", f"{base}:{path}"])


def git_bytes_at(path: str, revision: str) -> bytes:
    try:
        return subprocess.check_output(["git", "show", f"{revision}:{path}"])
    except subprocess.CalledProcessError as exc:
        raise AssertionError(f"E_PRODUCT_RESEARCH_INPUT {path}") from exc


def read_product_jsonl(path: str) -> list[tuple[int, dict]]:
    rows = []
    for n, line in enumerate(git_bytes_at(path, PRODUCT_RESEARCH_COMMIT).decode().splitlines(), 1):
        if not line.strip():
            continue
        try:
            row = json.loads(line, object_pairs_hook=_strict_pairs)
        except (json.JSONDecodeError, TypeError, ValueError) as exc:
            raise AssertionError(f"E_JSON {path}:{n}: {exc}") from exc
        if not isinstance(row, dict):
            raise AssertionError(f"E_JSON {path}:{n}: top-level JSON object required")
        rows.append((n, row))
    return rows


def product_record_info(row: dict, bundle: str) -> dict:
    ledger = row.get("asset_ledger", {})
    exact = row.get("source_exact", {})
    phase = row.get("phase_ledger", {})
    classification = row.get("classification", {})
    source_path = row.get("source_path") or exact.get("source_path") or ledger.get("source_path") or phase.get("source_path")
    source_sha = exact.get("sha256") or ledger.get("source_sha256") or row.get("source_sha256") or phase.get("source_sha256")
    if isinstance(source_sha, str) and source_sha.startswith("sha256:"):
        source_sha = source_sha[7:]
    products = classification.get("candidate_products") if isinstance(classification, dict) else None
    if products is None:
        products = row.get("candidate_products") or []
    category = classification.get("category") if isinstance(classification, dict) else None
    if category is None:
        category = row.get("classification_category") or row.get("classification_state")
    return {"asset_id": row.get("asset_id"), "source_path": source_path, "source_sha256": source_sha, "bundle": bundle, "category": category, "candidate_products": products}


def product_research_union() -> dict[str, list[dict]]:
    by_id: dict[str, list[dict]] = {}
    for bundle in PRODUCT_RESEARCH_BUNDLES:
        for _, row in read_product_jsonl(bundle):
            info = product_record_info(row, bundle)
            if not info["asset_id"] or not info["source_path"] or not info["source_sha256"]:
                raise AssertionError(f"E_PRODUCT_RESEARCH_INPUT {bundle}")
            by_id.setdefault(info["asset_id"], []).append(info)
    if len(by_id) != 429:
        raise AssertionError(f"E_PRODUCT_RESEARCH_UNION union={len(by_id)}")
    for asset_id, records in by_id.items():
        if len({(r["source_path"], r["source_sha256"]) for r in records}) != 1:
            raise AssertionError(f"E_PRODUCT_RESEARCH_UNION {asset_id}")
    return by_id


def git_blob(path: str, base: str = BASE_REVISION) -> str:
    return subprocess.check_output(["git", "rev-parse", f"{base}:{path}"], text=True).strip()


def git_tree_entry(path: str, base: str = BASE_REVISION) -> dict[str, str]:
    raw = subprocess.check_output(["git", "ls-tree", base, "--", path], text=True)
    lines = [line for line in raw.splitlines() if line]
    if len(lines) != 1 or "\t" not in lines[0]:
        raise AssertionError(f"E_SOURCE_TREE exact path {path}")
    header, entry_path = lines[0].split("\t", 1)
    parts = header.split()
    if len(parts) != 3 or entry_path != path:
        raise AssertionError(f"E_SOURCE_TREE path {path}")
    mode, entry_type, oid = parts
    if entry_type != "blob" or mode not in {"100644", "100755"} or len(oid) != 40:
        raise AssertionError(f"E_SOURCE_TREE mode/type {path}")
    return {"mode": mode, "type": entry_type}


UNRESEARCHED_PROFILE_REASON = "This implementation_source asset is absent from the prior research asset-ID set; no direct product evidence is retained, so it remains insufficient basis pending dedicated review."

def unique_anchor_marker(path: str) -> str:
    lines = git_bytes(ARCHIVE_PREFIX + path).decode(errors="replace").splitlines()
    for line in lines:
        marker = line.strip()
        if marker and sum(marker in candidate for candidate in lines) == 1:
            return marker
    raise AssertionError(f"no unique static anchor for {path}")

for _, _path in UNRESEARCHED_PREFIX_ASSET_PATHS:
    REVIEW_SPECS[_path] = p("insufficient_basis", [], unique_anchor_marker(_path), UNRESEARCHED_PROFILE_REASON, 1)
if len(REVIEW_SPECS) != 120:
    raise AssertionError(f"review profile count drift: {len(REVIEW_SPECS)}")

def read_jsonl(path: str) -> list[tuple[int, dict]]:
    rows = []
    for n, line in enumerate(git_bytes(path).decode().splitlines(), 1):
        if not line.strip():
            continue
        try:
            row = json.loads(line, object_pairs_hook=_strict_pairs)
        except (json.JSONDecodeError, TypeError, ValueError) as exc:
            raise AssertionError(f"E_JSON {path}:{n}: {exc}") from exc
        if not isinstance(row, dict):
            raise AssertionError(f"E_JSON {path}:{n}: top-level JSON object required")
        rows.append((n, row))
    return rows


def _strict_pairs(pairs: list[tuple[str, object]]) -> dict:
    result = {}
    for key, value in pairs:
        if key in result:
            raise ValueError(f"duplicate JSON key: {key}")
        result[key] = value
    return result


def manifest_sha256(source_path: str) -> str:
    for line in git_bytes(MANIFEST).decode(errors="replace").splitlines():
        if line.endswith(f" {source_path}"):
            digest, path = line.split(maxsplit=1)
            if path == source_path:
                return "sha256:" + digest
    raise AssertionError(f"E_ARCHIVE_MANIFEST {source_path}")


def canonical(value: object) -> bytes:
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()


def row_digest(row: dict) -> str:
    return tagged(canonical(row))


def range_receipt(path: str, start: int, end: int) -> dict:
    lines = git_bytes(path).decode(errors="replace").splitlines()
    if start < 1 or end > len(lines) or start > end:
        raise AssertionError(f"range outside {path}: {start}-{end}")
    text = "\n".join(lines[start - 1:end])
    return {"path": path, "line_start": start, "line_end": end, "line_text_sha256": tagged(text.encode()), "line_text": lines[start - 1:end]}


def boundary_receipt() -> dict:
    return {"path": BOUNDARY, "blob": git_blob(BOUNDARY), "sha256": tagged(git_bytes(BOUNDARY)), "ranges": [range_receipt(BOUNDARY, *r) for r in BOUNDARY_RANGES]}


def l1_receipts(products: list[str]) -> dict:
    return {product: {"path": L1[product], "blob": git_blob(L1[product]), "sha256": tagged(git_bytes(L1[product])), "ranges": [range_receipt(L1[product], *r) for r in L1_RANGES[product]]} for product in products}


def anchor(path: str, spec: dict) -> dict:
    lines = git_bytes(path).decode(errors="replace").splitlines()
    hits = [i for i, line in enumerate(lines, 1) if spec["marker"] in line]
    exact = [i for i, line in enumerate(lines, 1) if line.strip().startswith(spec["marker"]) and (len(line.strip()) == len(spec["marker"]) or not line.strip()[len(spec["marker"])].isalnum() and line.strip()[len(spec["marker"])] not in "_$")]
    if exact:
        hits = exact
    if len(hits) != 1:
        raise AssertionError(f"marker {spec['marker']!r} in {path}: {hits}")
    start = hits[0]
    end = min(len(lines), start + spec["length"] - 1)
    text = "\n".join(lines[start - 1:end])
    return {"marker": spec["marker"], "line_start": start, "line_end": end, "line_text": lines[start - 1:end], "line_text_sha256": tagged(text.encode()), "interpretation": spec["reason"], "products_considered": spec["products"] or list(PRODUCTS)}


def static_source(asset: dict, spec: dict) -> dict:
    archive_path = ARCHIVE_PREFIX + asset["source_path"]
    tree = git_tree_entry(archive_path)
    data = git_bytes(archive_path)
    ledger_sha = asset.get("source_sha256")
    ledger_match = tagged(data) == "sha256:" + ledger_sha
    a = anchor(archive_path, spec)
    archive_digest = tagged(data)
    manifest_digest = manifest_sha256(asset["source_path"])
    manifest_match = archive_digest == manifest_digest
    manifest_resolution = {"status": "matched"} if manifest_match else {"status": "pending_human_source_resolution", "formal_admission": "stopped", "reuse_decision": "stopped", "reason": "archive bytes and manifest entry differ; static evidence is retained"}
    return {"archive_path": archive_path, "source_path": asset["source_path"], "mode": tree["mode"], "type": tree["type"], "blob": git_blob(archive_path), "bytes": len(data), "line_count": len(data.decode(errors="replace").splitlines()), "sha256": archive_digest, "ledger_source_sha256": "sha256:" + ledger_sha, "ledger_digest_match": ledger_match, "archive_manifest_sha256": manifest_digest, "archive_manifest_match": manifest_match, "archive_manifest_resolution": manifest_resolution, "semantic_anchor": a, "read_mode": "git_object_static_read_only"}


def archive_source_provenance(initial_targets: set[str], dispositions: dict[str, tuple[int, dict]]) -> list[dict]:
    result = []
    for asset_id in sorted(initial_targets):
        asset = dispositions[asset_id][1]
        source_exact = static_source(asset, REVIEW_SPECS[asset["source_path"]])
        source_exact.pop("semantic_anchor")
        result.append({"asset_id": asset_id, "source_path": asset["source_path"], "source_exact": source_exact})
    return result


def phase_target_set(phase_rows: dict[str, tuple[int, dict]], wave_asset_ids: set[str]) -> list[str]:
    unresolved = {a: row for a, (_, row) in phase_rows.items() if row.get("product_classification_status") == "unresolved"}
    implementation = {a: row for a, row in unresolved.items() if row.get("artifact_evidence_kind") == "implementation_source"}
    prefix_ids = {a for a, row in unresolved.items() if any(row.get("source_path", "").startswith(prefix) for prefix in EXISTING_RESEARCH_PREFIXES)}
    declared = {a: row.get("source_path") for a, row in unresolved.items() if a in UNRESEARCHED_PREFIX_ASSET_IDS}
    if declared != dict(UNRESEARCHED_PREFIX_ASSET_PATHS):
        raise AssertionError("unresearched prefix asset ID/path pin drift")
    if not UNRESEARCHED_PREFIX_ASSET_IDS <= prefix_ids:
        raise AssertionError("unresearched prefix residual outside fixed prefix set")
    prior_research_ids = prefix_ids - UNRESEARCHED_PREFIX_ASSET_IDS
    legacy_existing = prior_research_ids | (wave_asset_ids & set(unresolved))
    if len(prior_research_ids) != 205 or len(legacy_existing) != 227:
        raise AssertionError(f"legacy existing research union drift: prior={len(prior_research_ids)} union={len(legacy_existing)}")
    initial_targets = set(implementation) - legacy_existing
    if len(initial_targets) != 120:
        raise AssertionError(f"expected initial 120 residual implementation assets, got {len(initial_targets)}")
    product_union = product_research_union()
    product_ids = set(product_union)
    product_ids_for_unresolved = product_ids & set(unresolved)
    overlap = initial_targets & product_ids_for_unresolved
    targets = sorted(initial_targets - product_ids_for_unresolved)
    if len(overlap) != 53 or len(targets) != 67:
        raise AssertionError(f"expected overlap=53/new=67, got overlap={len(overlap)} new={len(targets)}")
    if len(product_ids_for_unresolved) != 280:
        raise AssertionError(f"expected unresolved product union=280, got {len(product_ids_for_unresolved)}")
    return targets


def overlap_reconciliation(initial_targets: set[str], product_union: dict[str, list[dict]], phase_rows: dict[str, tuple[int, dict]]) -> dict:
    entries = []
    for asset_id in sorted(initial_targets & set(product_union)):
        source_path = phase_rows[asset_id][1]["source_path"]
        source_sha256 = phase_rows[asset_id][1].get("source_sha256")
        spec = REVIEW_SPECS[source_path]
        if any(r["source_path"] != source_path or r["source_sha256"] != source_sha256 for r in product_union[asset_id]):
            raise AssertionError(f"E_PRODUCT_RESEARCH_UNION {asset_id}")
        candidate_results = [{"bundle": r["bundle"], "category": r["category"], "candidate_products": r["candidate_products"]} for r in product_union[asset_id]]
        candidate_results.sort(key=lambda r: r["bundle"])
        same_candidate_result = all(r["category"] == spec["category"] and r["candidate_products"] == spec["products"] for r in candidate_results)
        entries.append({"asset_id": asset_id, "source_path": source_path, "source_sha256": "sha256:" + product_union[asset_id][0]["source_sha256"], "overlap_status": "same_source_same_candidate_result" if same_candidate_result else "same_source_different_candidate_result", "comparison_basis": "source_path_sha256_and_candidate_category_products", "method_identity_claimed": False, "research_scope": "existing_main_product_research_union", "evidence_completeness": "existing_bundle_static_evidence_present; candidate difference retained for human reconciliation", "bundle_revision": PRODUCT_RESEARCH_COMMIT, "denominator_role": "existing_research_union", "archive_provenance_ref": "archive_source_provenance:" + asset_id, "target_category": spec["category"], "target_products": spec["products"], "existing_candidate_results": candidate_results})
    same = sum(e["overlap_status"] == "same_source_same_candidate_result" for e in entries)
    return {"bundle_revision": PRODUCT_RESEARCH_COMMIT, "bundle_paths": list(PRODUCT_RESEARCH_BUNDLES), "union_count": len(product_union), "initial_target_count": len(initial_targets), "overlap_count": len(entries), "new_target_count": len(initial_targets) - len(entries), "candidate_result_comparison": "category_and_candidate_products_exact_equality; method_identity_not_claimed", "same_source_same_candidate_result_count": same, "same_source_different_candidate_result_count": len(entries) - same, "entries": entries}


def history(asset_id: str, dispositions: dict[str, tuple[int, dict]], decisions: list[tuple[int, dict]], read_afters: list[tuple[int, dict]]) -> dict:
    dline, drow = dispositions[asset_id]
    return {"disposition": {"path": DISPOSITION, "line": dline, "row_sha256": row_digest(drow), "source_path": drow.get("source_path"), "source_sha256": drow.get("source_sha256"), "disposition": drow.get("disposition"), "asset_class": drow.get("asset_class"), "product_target": drow.get("product_target"), "implementation_status": drow.get("implementation_status"), "consumer_refs": sorted(drow.get("consumer_refs", [])), "decision_record_ref": drow.get("decision_record_ref"), "read_after_record_ref": drow.get("read_after_record_ref")}, "decisions": [{"path": DECISIONS, "line": n, "row_sha256": row_digest(r), "decision_id": r.get("decision_id"), "product_target": r.get("product_target"), "disposition": r.get("disposition")} for n, r in decisions if r.get("asset_id") == asset_id], "read_after": [{"path": READ_AFTER, "line": n, "row_sha256": row_digest(r), "read_after_id": r.get("read_after_id"), "result": r.get("result"), "digest_match": r.get("digest_match"), "consumer_match": r.get("consumer_match")} for n, r in read_afters if r.get("asset_id") == asset_id], "failure_consumer_static": {"failure": {"path": FAILURE_SOURCE, "blob": git_blob(FAILURE_SOURCE), "sha256": tagged(git_bytes(FAILURE_SOURCE)), "read_mode": "git_object_static_read_only"}, "consumer": {"path": CONSUMER_SOURCE, "blob": git_blob(CONSUMER_SOURCE), "sha256": tagged(git_bytes(CONSUMER_SOURCE)), "read_mode": "git_object_static_read_only"}}, "closure_status": "asset-level history/consumer closure absent; global failure/consumer inventories retained for human review"}


def make_record(asset_id: str, phase_rows: dict[str, tuple[int, dict]], dispositions: dict[str, tuple[int, dict]], decisions: list[tuple[int, dict]], read_afters: list[tuple[int, dict]], boundary: dict) -> dict:
    phase_line, phase = phase_rows[asset_id]
    asset_line, asset = dispositions[asset_id]
    spec = REVIEW_SPECS[asset["source_path"]]
    source = static_source(asset, spec)
    category = spec["category"]
    status = {"direct_product_basis": "reviewed_candidate", "multi_product_conflict": "reviewed_conflict", "insufficient_basis": "reviewed_insufficient_basis"}[category]
    products = list(spec["products"])
    return {
        "asset_id": asset_id,
        "source_path": asset["source_path"],
        "anchor_line_coverage": {"source_line_count": source["line_count"], "anchor_line_count": source["semantic_anchor"]["line_end"] - source["semantic_anchor"]["line_start"] + 1, "coverage_ratio": round((source["semantic_anchor"]["line_end"] - source["semantic_anchor"]["line_start"] + 1) / source["line_count"], 6)},
        "source_exact": source,
        "phase_evidence": {"path": PHASE, "line": phase_line, "row_sha256": row_digest(phase), "product_classification_status": phase.get("product_classification_status"), "artifact_evidence_kind": phase.get("artifact_evidence_kind"), "source_path": phase.get("source_path"), "source_sha256": phase.get("source_sha256"), "candidate_phase_targets": phase.get("candidate_phase_targets") or []},
        "legacy_asset_evidence": {"path": DISPOSITION, "line": asset_line, "row_sha256": row_digest(asset), "disposition": asset.get("disposition"), "asset_class": asset.get("asset_class"), "product_target": asset.get("product_target"), "implementation_status": asset.get("implementation_status"), "consumer_refs": sorted(asset.get("consumer_refs", [])), "decision_record_ref": asset.get("decision_record_ref"), "read_after_record_ref": asset.get("read_after_record_ref")},
        "classification": {"category": category, "candidate_products": products, "semantic_status": status, "reason": spec["reason"] + " Candidate only; formal product authority remains unresolved."},
        "boundary_evidence": {"product_boundary": boundary, "l1": l1_receipts(products or list(PRODUCTS))},
        "legacy_history_failure_consumer": history(asset_id, dispositions, decisions, read_afters),
        "legacy_implementation_shrinkage_evidence": {"artifact_evidence_kind": phase.get("artifact_evidence_kind"), "implementation_evidence_state": phase.get("implementation_evidence_state"), "legacy_implementation_status": phase.get("legacy_implementation_status"), "disposition_implementation_status": asset.get("implementation_status"), "legacy_execution_performed": phase.get("legacy_execution_performed"), "interpretation": "implementation source presence is historical static evidence; unknown status and pending consumer closure are preserved"},
        "wave_semantic_links": [],
        "wave_edge_count": 0,
        "human_judgment_remaining": HUMAN_JUDGMENT,
        "authority_effect": "none",
        "formal_asset_classification_updated": False,
        "new_build_allowed": False,
        "research_scope": "new_residual_after_main_product_union",
        "evidence_completeness": "source_anchor_product_boundary_and_legacy_static_evidence; human_resolution_pending",
        "overlap_status": "not_in_main_product_research_union",
        "bundle_revision": PRODUCT_RESEARCH_COMMIT,
        "denominator_role": "new_target",
    }


def build() -> None:
    BUNDLE.mkdir(parents=True, exist_ok=True)
    phase_list = read_jsonl(PHASE)
    phase_rows = {r["asset_id"]: (n, r) for n, r in phase_list}
    unresolved_ids = {a for a, (_, row) in phase_rows.items() if row.get("product_classification_status") == "unresolved"}
    dispositions = {r["asset_id"]: (n, r) for n, r in read_jsonl(DISPOSITION)}
    decisions = read_jsonl(DECISIONS)
    read_afters = read_jsonl(READ_AFTER)
    wave_rows = []
    wave_asset_ids = set()
    for wave, path in WAVE_PATHS.items():
        rows = read_jsonl(path)
        wave_rows.extend((wave, path, n, row) for n, row in rows)
        wave_asset_ids.update(row.get("asset_id") for _, row in [(n, row) for n, row in rows] if row.get("asset_id"))
    unresolved_wave = {a for a in wave_asset_ids if phase_rows.get(a, (0, {}))[1].get("product_classification_status") == "unresolved"}
    if len(wave_rows) != 598 or len(wave_asset_ids) != 355:
        raise AssertionError(f"E_WAVE_EDGE_SET recomputed edges={len(wave_rows)} assets={len(wave_asset_ids)}")
    targets = phase_target_set(phase_rows, unresolved_wave)
    prefix_ids = {a for a, (_, row) in phase_rows.items() if row.get("product_classification_status") == "unresolved" and any(row.get("source_path", "").startswith(prefix) for prefix in EXISTING_RESEARCH_PREFIXES)}
    prior_research_ids = prefix_ids - UNRESEARCHED_PREFIX_ASSET_IDS
    legacy_existing = prior_research_ids | unresolved_wave
    initial_targets = set(a for a, (_, row) in phase_rows.items() if row.get("product_classification_status") == "unresolved" and row.get("artifact_evidence_kind") == "implementation_source") - legacy_existing
    product_union = product_research_union()
    if not {phase_rows[a][1]["source_path"] for a in targets} <= set(REVIEW_SPECS):
        raise AssertionError("review spec/source target set mismatch")
    if any(a not in dispositions for a in targets):
        raise AssertionError("target absent from asset disposition")
    boundary = boundary_receipt()
    records = [make_record(a, phase_rows, dispositions, decisions, read_afters, boundary) for a in targets]
    ledger = BUNDLE / "classification-research.jsonl"
    ledger.write_text("".join(json.dumps(r, ensure_ascii=False, sort_keys=True, separators=(",", ":")) + "\n" for r in records))
    source_paths = [ARCHIVE_PREFIX + phase_rows[a][1]["source_path"] for a in sorted(initial_targets)]
    global_inputs = [PHASE, DISPOSITION, DECISIONS, READ_AFTER, BOUNDARY, *L1.values(), FAILURE_SOURCE, CONSUMER_SOURCE, "docs/governance/legacy-asset-reuse-control.md", "docs/governance/new-generation-start-here.md", MANIFEST]
    input_paths = [*WAVE_PATHS.values(), *global_inputs, *source_paths]
    if len(input_paths) != len(set(input_paths)):
        raise AssertionError("input paths duplicated")
    input_digests = [{"path": pth, "blob": git_blob(pth), "bytes": len(git_bytes(pth)), "sha256": tagged(git_bytes(pth))} for pth in input_paths]
    categories = Counter(r["classification"]["category"] for r in records)
    phase_counts = Counter("|".join(phase_rows[a][1].get("candidate_phase_targets") or []) for a in targets)
    target_paths = [phase_rows[a][1]["source_path"] for a in targets]
    inventory = {
        "schema_revision": 1,
        "binding_id": BINDING_ID,
        "base_revision": BASE_REVISION,
        "base_source_mode": "all input and archive evidence bytes from fixed BASE Git objects",
        "scope": "fixed BASE unresolved implementation_source residual after latest main product research union 429 and explicit overlap reconciliation; exact 67 new assets from the initial 120-asset tranche",
        "existing_research_union": {"expected_unresolved_assets": 1792, "prior_research_asset_count": len(prior_research_ids), "prior_research_asset_ids_sha256": tagged("\n".join(sorted(prior_research_ids)).encode()), "unresearched_prefix_asset_count": 0, "unresearched_prefix_asset_ids": [], "unresearched_prefix_source_paths": [], "existing_union_count": len(legacy_existing | (set(product_union) & unresolved_ids)), "pre_target_residual_unresolved_count": 1792 - len(legacy_existing | (set(product_union) & unresolved_ids)), "new_target_count": 67, "post_batch_remaining_unresolved_count": 1792 - len(legacy_existing | (set(product_union) & unresolved_ids)) - 67, "denominator_labels": {"existing_union": "existing_unresolved_union", "pre_target_residual": "pre_target_residual_unresolved", "new_target": "new_target", "post_batch_remaining": "post_batch_remaining_unresolved"}, "existing_prefixes": list(EXISTING_RESEARCH_PREFIXES), "wave_unresolved_assets": 64, "target_wave_overlap": 0, "legacy_prior_research_asset_count": len(prior_research_ids), "legacy_existing_union_count": 227, "legacy_unresearched_prefix_asset_count": 53, "product_research_union_count": 429, "product_research_unresolved_union_count": 280, "initial_target_count": 120, "target_existing_research_overlap": 53},
        "wave_source_paths": WAVE_PATHS,
        "counts": {"wave_files": 50, "wave_edges_scanned": len(wave_rows), "wave_unique_assets_scanned": len(wave_asset_ids), "target_assets": len(records), "target_wave_edges": 0, "categories": dict(sorted(categories.items())), "target_asset_artifact_evidence_kinds": {"implementation_source": len(records)}},
        "phase_candidate_distribution": dict(sorted(phase_counts.items())),
        "expected_sets": {"target_asset_count": 67, "target_asset_ids": targets, "target_asset_ids_sha256": tagged("\n".join(targets).encode()), "source_paths": target_paths},
        "input_digests": input_digests,
        "archive_source_provenance": archive_source_provenance(initial_targets, dispositions),
        "product_research_union": {"bundle_revision": PRODUCT_RESEARCH_COMMIT, "bundle_paths": list(PRODUCT_RESEARCH_BUNDLES), "union_count": 429, "unresolved_union_count": 280, "union_asset_ids_sha256": tagged("\n".join(sorted(product_union)).encode()), "bundle_input_count": 8, "bundle_inputs": [{"path": pth, "blob": subprocess.check_output(["git", "rev-parse", f"{PRODUCT_RESEARCH_COMMIT}:{pth}"], text=True).strip(), "bytes": len(git_bytes_at(pth, PRODUCT_RESEARCH_COMMIT)), "sha256": tagged(git_bytes_at(pth, PRODUCT_RESEARCH_COMMIT))} for pth in PRODUCT_RESEARCH_BUNDLES]},
        "old_asset_source_mode": "archive bytes are read through git show BASE:<archive-path>; never executed",
        "formal_update": {"formal_asset_classification_updated": False, "phase_ledger_updated": False, "product_route_updated": False, "successor_updated": False, "new_build_allowed": False, "authority_effect": "none"},
        "classification_rule": {"direct_product_basis": "concrete source span plus product-boundary interpretation and counterevidence; path alone is invalid", "multi_product_conflict": "concrete source span maps to two product boundaries and no single owner is proposed", "insufficient_basis": "wrapper/re-export/shared infrastructure or source span lacks product-boundary proof; Wave scope is not inherited"},
        "authority_boundary": {"authority_effect": "none", "classification_state": "research_proposal_pending_human_product_review", "formal_asset_classification_updated": False, "new_build_allowed": False},
        "history_failure_consumer": {"disposition_rows": len(records), "decision_rows_for_targets": sum(bool(r["legacy_history_failure_consumer"]["decisions"]) for r in records), "read_after_rows_for_targets": sum(bool(r["legacy_history_failure_consumer"]["read_after"]) for r in records), "failure_consumer_refs_are_static_global_inventory": True},
        "overlap_reconciliation": overlap_reconciliation(initial_targets, product_union, phase_rows),
        "archive_manifest_resolution": {
            "status": "pending_human_source_resolution",
            "formal_admission": "stopped",
            "reuse_decision": "stopped",
            "mismatches": [{
                "source_path": "scripts/helix.ps1",
                "archive_sha256": "sha256:2b86bf027686c55db9ab6e8828361db69b9e7ccbf51111c438d90ee1ed21908b",
                "manifest_sha256": "sha256:9e5b68aefd8920fc248fc16d0c90305d0327c39362ae3e82621cbc1b53060bd7",
                "manifest_path": MANIFEST,
                "reason": "archive bytes and manifest entry differ; static evidence is retained, but formal admission and legacy reuse remain stopped pending human/source resolution",
            }],
        },
        "binding_upstream": {
            "policy": "all nonarchive input_digests and product research bundle inputs are Binding upstream; archive static references remain in inventory/records because SCF-OS-003 forbids archive upstream paths",
            "nonarchive_input_count": len([path for path in input_paths if not path.startswith("archive/")]),
            "product_bundle_input_count": len(PRODUCT_RESEARCH_BUNDLES),
            "total_nonarchive_upstream_count": len([path for path in input_paths if not path.startswith("archive/")]) + len(PRODUCT_RESEARCH_BUNDLES),
            "archive_input_count": len([path for path in input_paths if path.startswith("archive/")]),
            "archive_upstream_count": 0,
            "archive_nonexecution_boundary": "archive source/runtime/test/CI is read through fixed BASE Git objects only and never executed",
        },
        "edge_contract": {"target_wave_edges": 0, "duplicate_edges_forbidden": True, "missing_edges_forbidden": True},
        "artifacts": ["scaffold/bindings/SCF-B-0126.json", "scaffold/legacy-implementation-residual-0126/README.md", "scaffold/legacy-implementation-residual-0126/PR-DRAFT.md", "scaffold/legacy-implementation-residual-0126/generate.py", "scaffold/legacy-implementation-residual-0126/validate.py", "scaffold/legacy-implementation-residual-0126/selfcheck.py", "scaffold/legacy-implementation-residual-0126/inventory.json", "scaffold/legacy-implementation-residual-0126/classification-research.jsonl"],
        "negative_cases": [
            'target_set_missing',
            'target_set_duplicate',
            'source_blob_tamper',
            'source_line_anchor_tamper',
            'classification_category_tamper',
            'classification_product_tamper',
            'wave_edge_injection',
            'phase_status_tamper',
            'asset_ledger_tamper',
            'legacy_status_promotion_tamper',
            'legacy_disposition_or_product_resolution_tamper',
            'legacy_consumer_tamper',
            'history_tamper',
            'history_consumer_closure_tamper',
            'implementation_evidence_tamper',
            'boundary_blob_tamper',
            'authority_promotion',
            'formal_update_reversal_tamper',
            'inventory_schema_tamper',
            'inventory_source_paths_tamper',
            'phase_evidence_extra_key_tamper',
            'boundary_extra_product_tamper',
            'boundary_extra_key_tamper',
            'source_nested_extra_key_tamper',
            'classification_nested_extra_key_tamper',
            'history_nested_extra_key_tamper',
            'shrink_nested_extra_key_tamper',
            'read_mode_tamper',
            'input_digest_missing',
            'input_digest_duplicate',
            'input_digest_schema_tamper',
            'inventory_scope_tamper',
            'fixed_base_pin_tamper',
            'output_digest_tamper',
            'human_judgment_tamper',
            'ledger_digest_match_tamper',
            'wave_denominator_tamper',
            'existing_union_tamper',
            'inventory_top_level_extra_key_tamper',
            'inventory_top_level_missing_key_tamper',
            'review_pin_tamper',
            'generator_profile_category_tamper',
            'generator_profile_products_tamper',
            'ledger_duplicate_key_json',
            'nested_duplicate_key_json',
            'inventory_duplicate_key_json',
            'malformed_json',
            'nonobject_json',
            'anchor_line_coverage_tamper',
            'binding_upstream_stale_tamper',
            'research_scope_tamper',
            'overlap_reconciliation_tamper',
            'product_research_union_tamper',
            'pre_target_residual_tamper',
            'post_batch_remaining_tamper',
            'denominator_label_tamper',
            'source_symlink_mode_tamper',
            'source_tree_type_tamper',
            'source_nonregular_mode_tamper',
            'source_path_mismatch_tamper',
            'archive_manifest_mismatch_tamper',
            'asset_source_alias_tamper',
            'overlap_archive_tree_mode_tamper',
            'overlap_archive_tree_type_tamper',
            'overlap_archive_path_tamper',
            'overlap_archive_manifest_tamper',
            'record_asset_id_missing',
            'record_asset_id_none',
            'record_asset_id_bool',
            'record_archive_manifest_sha_tamper',
            'record_archive_manifest_match_tamper',
            'inventory_archive_manifest_resolution_tamper',
            'inventory_binding_upstream_tamper',
            'input_digest_blob_tamper',
            'input_digest_bytes_tamper',
            'input_digest_sha_tamper',
        ],
    }
    inventory["output_sha256"] = tagged(ledger.read_bytes())
    (BUNDLE / "inventory.json").write_text(json.dumps(inventory, ensure_ascii=False, sort_keys=True, indent=2) + "\n")


if __name__ == "__main__":
    build()

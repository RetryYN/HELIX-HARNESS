#!/usr/bin/env python3
"""Independent static validator for SCF-B-0126.

The validator does not import generate.py. All source bytes and expected target
sets are re-derived from fixed BASE Git objects.
"""
from __future__ import annotations

import hashlib
import json
import subprocess
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BUNDLE = ROOT / "scaffold/legacy-implementation-residual-0126"
LEDGER = BUNDLE / "classification-research.jsonl"
INVENTORY = BUNDLE / "inventory.json"
BASE_REVISION = "5562f04da0f3205f9aa58205ec0d478419fc4f2e"
BINDING_ID = "SCF-B-0126"
ARCHIVE_PREFIX = "archive/legacy-generation-2026-09-14/root/"
PHASE = "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl"
DISPOSITION = "docs/governance/legacy-asset-disposition.jsonl"
DECISIONS = "docs/governance/legacy-asset-decisions.jsonl"
READ_AFTER = "docs/governance/legacy-asset-copy-read-after.jsonl"
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
EXISTING_RESEARCH_PREFIXES = (
    "src/lint/", "src/runtime/", "src/schema/", "src/workflow/",
    "src/setup/", "src/cli/", "src/requirements/", "src/shared/",
)
EXPECTED_MISMATCH_PATHS = {"scripts/helix.ps1"}
EXPECTED_PRODUCTS = ("HELIX-HARNESS", "HELIX-OS", "HELIX-Web", "HELIX-Web-OS")
EXPECTED_SCOPE = "fixed BASE unresolved implementation_source residual after existing research union exact 67 assets"
EXPECTED_ARTIFACTS_ORDERED = [
    "scaffold/bindings/SCF-B-0126.json",
    "scaffold/legacy-implementation-residual-0126/README.md",
    "scaffold/legacy-implementation-residual-0126/PR-DRAFT.md",
    "scaffold/legacy-implementation-residual-0126/generate.py",
    "scaffold/legacy-implementation-residual-0126/validate.py",
    "scaffold/legacy-implementation-residual-0126/selfcheck.py",
    "scaffold/legacy-implementation-residual-0126/inventory.json",
    "scaffold/legacy-implementation-residual-0126/classification-research.jsonl",
]
EXPECTED_ARTIFACTS = set(EXPECTED_ARTIFACTS_ORDERED)
EXPECTED_RULES = {
    "direct_product_basis": "concrete source span plus product-boundary interpretation and counterevidence; path alone is invalid",
    "multi_product_conflict": "concrete source span maps to two product boundaries and no single owner is proposed",
    "insufficient_basis": "wrapper/re-export/shared infrastructure or source span lacks product-boundary proof; Wave scope is not inherited",
}
EXPECTED_NEGATIVE_CASES = [
    "target_set_missing_or_duplicate",
    "source_blob_tamper",
    "source_line_anchor_tamper",
    "classification_category_tamper",
    "classification_product_tamper",
    "wave_edge_injection",
    "phase_status_tamper",
    "asset_ledger_tamper",
    "legacy_status_promotion_tamper",
    "legacy_disposition_or_product_resolution_tamper",
    "legacy_consumer_tamper",
    "history_tamper",
    "history_consumer_closure_tamper",
    "boundary_blob_tamper",
    "authority_promotion",
    "formal_update_reversal_tamper",
    "inventory_schema_tamper",
    "inventory_source_paths_tamper",
    "input_digest_missing_or_duplicate",
    "input_digest_schema_tamper",
    "inventory_scope_tamper",
    "fixed_base_pin_tamper",
    "output_digest_tamper",
]
EXPECTED_INVENTORY_KEYS = {
    "schema_revision",
    "binding_id",
    "base_revision",
    "base_source_mode",
    "scope",
    "existing_research_union",
    "wave_source_paths",
    "counts",
    "phase_candidate_distribution",
    "expected_sets",
    "input_digests",
    "old_asset_source_mode",
    "formal_update",
    "classification_rule",
    "authority_boundary",
    "history_failure_consumer",
    "edge_contract",
    "artifacts",
    "negative_cases",
    "output_sha256",
}
EXPECTED_INPUT_DIGEST_KEYS = {"path", "blob", "bytes", "sha256"}
EXPECTED_RECORD_KEYS = {"asset_id", "source_path", "source_exact", "phase_evidence", "legacy_asset_evidence", "classification", "boundary_evidence", "legacy_history_failure_consumer", "legacy_implementation_shrinkage_evidence", "wave_semantic_links", "wave_edge_count", "human_judgment_remaining", "authority_effect", "formal_asset_classification_updated", "new_build_allowed"}
EXPECTED_SOURCE_KEYS = {"archive_path", "source_path", "blob", "bytes", "line_count", "sha256", "ledger_source_sha256", "ledger_digest_match", "semantic_anchor", "read_mode"}
EXPECTED_CLASSIFICATION_KEYS = {"category", "candidate_products", "semantic_status", "reason"}
EXPECTED_PROFILES = {'.claude/hooks/git-command-guard.ts': {'category': 'insufficient_basis',
                                        'length': 12,
                                        'marker': 'PreToolUse(Bash / exec_command) hook',
                                        'products': [],
                                        'reason': 'The source is an archived Claude hook entry that delegates to runtime guards; its wrapper role and shared '
                                                  'runtime dependency do not establish a four-product owner.'},
 '.claude/hooks/session-log.ts': {'category': 'insufficient_basis',
                                  'length': 12,
                                  'marker': 'Backward-compatible Claude Code session-log shim',
                                  'products': [],
                                  'reason': 'The source is a backward-compatible hook shim selecting CLI session commands; it lacks a product-specific '
                                            'semantic contract and must remain non-executed evidence.'},
 '.claude/hooks/work-guard.ts': {'category': 'insufficient_basis',
                                 'length': 12,
                                 'marker': 'Claude Code PreToolUse(Edit|Write|MultiEdit) hook entry',
                                 'products': [],
                                 'reason': 'The source is a hook entry delegating work/secret guards; wrapper and shared runtime semantics are insufficient '
                                           'for product classification.'},
 'scripts/audit-l12-hybrid-recognition.ts': {'category': 'insufficient_basis',
                                             'length': 12,
                                             'marker': '#!/usr/bin/env -S npx --no-install tsx',
                                             'products': [],
                                             'reason': 'The source is a command wrapper around lint recognition functions; the wrapper alone does not '
                                                       'establish HARNESS or OS responsibility.'},
 'scripts/helix': {'category': 'insufficient_basis',
                   'length': 7,
                   'marker': 'HELIX thin POSIX entrypoint',
                   'products': [],
                   'reason': 'The source is a thin launcher selecting checkout source or packaged dist; it is shared infrastructure without product-boundary '
                             'proof.'},
 'scripts/helix.ps1': {'category': 'insufficient_basis',
                       'length': 8,
                       'marker': 'HELIX thin Windows PowerShell entrypoint',
                       'products': [],
                       'reason': 'The source is a thin Windows launcher selecting checkout source or packaged dist; it is shared infrastructure without '
                                 'product-boundary proof.'},
 'src/adapters/document-semantic-diff-fs.ts': {'category': 'multi_product_conflict',
                                               'length': 16,
                                               'marker': 'export function loadDocumentSemanticDiffReportFromGit',
                                               'products': ['HELIX-HARNESS', 'HELIX-OS'],
                                               'reason': 'The source compares HARNESS document semantic artifacts while reading Git/current repository state '
                                                         'through an operational adapter; artifact and OS state boundaries meet.'},
 'src/adapters/open-branch-plan-reservation-authority.ts': {'category': 'multi_product_conflict',
                                                            'length': 18,
                                                            'marker': 'export function buildOpenBranchPlanReservationAuthoritySnapshot',
                                                            'products': ['HELIX-HARNESS', 'HELIX-OS'],
                                                            'reason': 'The source binds plan material and branch reservations to authority snapshots; HARNESS '
                                                                      'plan artifact meaning and HELIX-OS branch/state control compete.'},
 'src/assets/catalog.ts': {'category': 'multi_product_conflict',
                           'length': 18,
                           'marker': 'export function catalogAutomationAssets',
                           'products': ['HELIX-HARNESS', 'HELIX-OS'],
                           'reason': 'The source catalogs skills, rosters, commands, metadata drift, search references, and HarnessDb rows; artifact catalog '
                                     'and OS state projection overlap.'},
 'src/audit/branches.ts': {'category': 'direct_product_basis',
                           'length': 18,
                           'marker': 'export function analyzeBranches',
                           'products': ['HELIX-OS'],
                           'reason': 'The source evaluates branch reachability, protection, worktree use, and stale dispositions; these are HELIX-OS '
                                     'repository/state controls.'},
 'src/audit/enforcement-route-input.ts': {'category': 'direct_product_basis',
                                          'length': 18,
                                          'marker': 'export const prReviewRouteInputSchema',
                                          'products': ['HELIX-OS'],
                                          'reason': 'The source constrains review, CI autofix, and release automation route inputs; these are HELIX-OS '
                                                    'operational admission controls.'},
 'src/audit/quality.ts': {'category': 'direct_product_basis',
                          'length': 18,
                          'marker': 'export function runQualityAudit',
                          'products': ['HELIX-OS'],
                          'reason': 'The source scans repository content for secrets, unsafe commands, provider literals, and legacy runtime references; this '
                                    'is HELIX-OS repository governance.'},
 'src/audit/repository-hygiene.ts': {'category': 'direct_product_basis',
                                     'length': 18,
                                     'marker': 'export function analyzeRepositoryHygiene',
                                     'products': ['HELIX-OS'],
                                     'reason': 'The source combines main, open-PR, writer, and worktree evidence into repository hygiene dispositions; this is '
                                               'HELIX-OS state/control operation.'},
 'src/composition/db-rebuild-composition.ts': {'category': 'multi_product_conflict',
                                               'length': 6,
                                               'marker': 'export function rebuildHarnessDb',
                                               'products': ['HELIX-HARNESS', 'HELIX-OS'],
                                               'reason': 'The source rebuilds harness.db while summarizing visualization/V-model tree state; HARNESS evidence '
                                                         'projection and OS persistence operation meet.'},
 'src/config/requirements-binding-policy.ts': {'category': 'direct_product_basis',
                                               'length': 18,
                                               'marker': 'export const REQUIREMENTS_BINDING_POLICY_TERMS',
                                               'products': ['HELIX-HARNESS'],
                                               'reason': 'The source fixes requirements binding terms and L1-L2 viewpoint limits; this is HARNESS '
                                                         'requirement/process artifact policy.'},
 'src/context/doc-router.ts': {'category': 'direct_product_basis',
                               'length': 18,
                               'marker': 'export function buildDocIndex',
                               'products': ['HELIX-HARNESS'],
                               'reason': 'The source builds a canonical document index and routes task context to source sections; this is HARNESS '
                                         'artifact/context navigation.'},
 'src/design/design-registry-screen-intake.ts': {'category': 'multi_product_conflict',
                                                 'length': 18,
                                                 'marker': 'export function buildScreenIntake',
                                                 'products': ['HELIX-HARNESS', 'HELIX-Web'],
                                                 'reason': 'The source maps requirement catalog and screen traces into a design registry; HARNESS '
                                                           'requirement/design trace and Web screen responsibility overlap.'},
 'src/design/screen-applicability-sqlite-store.ts': {'category': 'multi_product_conflict',
                                                     'length': 18,
                                                     'marker': 'export function ensureScreenApplicabilityTables',
                                                     'products': ['HELIX-HARNESS', 'HELIX-Web'],
                                                     'reason': 'The source persists screen applicability and gate receipts in SQLite; HARNESS '
                                                               'capability/design contract and Web screen state meet.'},
 'src/design/screen-applicability-store.ts': {'category': 'multi_product_conflict',
                                              'length': 18,
                                              'marker': 'export function buildScreenStageClosureCommit',
                                              'products': ['HELIX-HARNESS', 'HELIX-Web'],
                                              'reason': 'The source validates no-UI/UI completion, agreement, backpropagation, and screen-stage closure; '
                                                        'HARNESS capability evidence and Web presentation applicability overlap.'},
 'src/design/ui-domain-gate.ts': {'category': 'multi_product_conflict',
                                  'length': 18,
                                  'marker': 'export function analyzeUiDomainBundleGate',
                                  'products': ['HELIX-HARNESS', 'HELIX-Web'],
                                  'reason': 'The source gates the harness-console UI domain bundle against required entities; HARNESS domain contract and Web '
                                            'UI boundary cannot yield one owner.'},
 'src/doctor/check-registry.ts': {'category': 'direct_product_basis',
                                  'length': 18,
                                  'marker': 'export function aggregateInternalDoctorChecks',
                                  'products': ['HELIX-OS'],
                                  'reason': 'The source aggregates hard and advisory doctor checks into operational readiness; this is HELIX-OS control and '
                                            'diagnostics.'},
 'src/doctor/failure.ts': {'category': 'direct_product_basis',
                           'length': 15,
                           'marker': 'export function doctorFailure',
                           'products': ['HELIX-OS'],
                           'reason': 'The source creates stable typed failure codes for operational doctor read/check/state failures; this is HELIX-OS '
                                     'diagnostic control.'},
 'src/doctor/nfr-registry-check.ts': {'category': 'direct_product_basis',
                                      'length': 18,
                                      'marker': 'export function checkNfrRegistry',
                                      'products': ['HELIX-OS'],
                                      'reason': 'The source checks the NFR registry as a doctor lint boundary; this is HELIX-OS operational readiness '
                                                'evidence.'},
 'src/doctor/result.ts': {'category': 'direct_product_basis',
                          'length': 18,
                          'marker': 'export type DoctorScope',
                          'products': ['HELIX-OS'],
                          'reason': 'The source defines doctor scopes, timings, check runs, and aggregated results; this is HELIX-OS diagnostics/state '
                                    'projection.'},
 'src/doctor/workflow-guide-authority.ts': {'category': 'multi_product_conflict',
                                            'length': 18,
                                            'marker': 'export function analyzeWorkflowGuideAuthority',
                                            'products': ['HELIX-HARNESS', 'HELIX-OS'],
                                            'reason': 'The source compares workflow guide identity/digests with installed catalogs and registries; HARNESS '
                                                      'workflow artifact guidance and OS authority/control overlap.'},
 'src/export/document-export.ts': {'category': 'multi_product_conflict',
                                   'length': 18,
                                   'marker': 'export function renderDocumentExport',
                                   'products': ['HELIX-HARNESS', 'HELIX-Web'],
                                   'reason': 'The source projects canonical HARNESS documents into CSV/Markdown/XLSX/PPTX presentation formats; artifact '
                                             'export and Web presentation responsibility meet.'},
 'src/feedback/lifecycle-node.ts': {'category': 'direct_product_basis',
                                    'length': 18,
                                    'marker': 'export function nodeFeedbackLifecycleDeps',
                                    'products': ['HELIX-OS'],
                                    'reason': 'The source binds feedback lifecycle events to HarnessDb, filesystem journal, and fencing dependencies; this is '
                                              'HELIX-OS operational state/control.'},
 'src/feedback/lifecycle.ts': {'category': 'insufficient_basis',
                               'length': 2,
                               'marker': 'export * from "../policy/feedback-lifecycle"',
                               'products': [],
                               'reason': 'The source is a two-line re-export facade; it contains no independent semantic span from which product '
                                         'responsibility can be established.'},
 'src/gate/review-tier.ts': {'category': 'multi_product_conflict',
                             'length': 18,
                             'marker': 'export function evaluateGateReview',
                             'products': ['HELIX-HARNESS', 'HELIX-OS'],
                             'reason': 'The source evaluates V-model review checklist and human judgement gates with cross-agent execution context; HARNESS '
                                       'acceptance semantics and OS review routing overlap.'},
 'src/gate/static.ts': {'category': 'multi_product_conflict',
                        'length': 18,
                        'marker': 'export function analyzeLayerPairGate',
                        'products': ['HELIX-HARNESS', 'HELIX-OS'],
                        'reason': 'The source evaluates pair freeze, verification groups, coverage, and repository inputs; HARNESS pair evidence and OS '
                                  'gate/readiness control overlap.'},
 'src/graph/loader.ts': {'category': 'direct_product_basis',
                         'length': 18,
                         'marker': 'Relation graph source set loader',
                         'products': ['HELIX-HARNESS'],
                         'reason': 'The source assembles requirement, design, implementation, and test relation evidence for V-model coverage; the reviewed '
                                   'contract is HARNESS trace structure.'},
 'src/guardrail/ledger.ts': {'category': 'direct_product_basis',
                             'length': 18,
                             'marker': 'export function recordGuardrailDecision',
                             'products': ['HELIX-OS'],
                             'reason': 'The source records normalized guardrail decisions into state-backed ledger rows; this is HELIX-OS authority and state '
                                       'control.'},
 'src/measurement/bounded-probe-history.ts': {'category': 'multi_product_conflict',
                                              'length': 18,
                                              'marker': 'export function appendBoundedProbeRun',
                                              'products': ['HELIX-HARNESS', 'HELIX-OS'],
                                              'reason': 'The source binds bounded verification probes and measurement evidence to append-only DB history; '
                                                        'HARNESS measurement contract and OS execution/state control overlap.'},
 'src/plan/lint-policy.ts': {'category': 'direct_product_basis',
                             'length': 18,
                             'marker': 'const DESIGN_LAYERS_REQUIRING_SUB_DOC',
                             'products': ['HELIX-HARNESS'],
                             'reason': 'The source enforces plan/document layer completeness and reverse trace obligations; this is HARNESS process and '
                                       'verification readiness semantics.'},
 'src/plan/lint-types.ts': {'category': 'insufficient_basis',
                            'length': 12,
                            'marker': 'interface LintResult',
                            'products': [],
                            'reason': 'The source contains shared plan-lint type declarations only; types without behavior or boundary context are '
                                      'insufficient for product classification.'},
 'src/policy/active-plan-selection.ts': {'category': 'direct_product_basis',
                                         'length': 18,
                                         'marker': 'export function selectActivePlanId',
                                         'products': ['HELIX-OS'],
                                         'reason': 'The source selects a unique active plan from canonical plan IDs and fail-closes empty/unknown choices; '
                                                   'this is HELIX-OS control state.'},
 'src/policy/closure-authority-backfill.ts': {'category': 'multi_product_conflict',
                                              'length': 18,
                                              'marker': 'export interface ClosureAuthorityBackfillCandidate',
                                              'products': ['HELIX-HARNESS', 'HELIX-OS'],
                                              'reason': 'The source models closure-authority backfill candidates, typed authority blocks, and decisions; '
                                                        'HARNESS closure evidence and OS authority migration overlap.'},
 'src/policy/closure-authority-registry.ts': {'category': 'direct_product_basis',
                                              'length': 18,
                                              'marker': 'export function analyzeClosureAuthorityDrift',
                                              'products': ['HELIX-OS'],
                                              'reason': 'The source validates closure authority registry paths, digests, and drift; this is HELIX-OS '
                                                        'authority/state governance.'},
 'src/policy/filesystem-durability.ts': {'category': 'direct_product_basis',
                                         'length': 18,
                                         'marker': 'export function supportsDirectoryFsync',
                                         'products': ['HELIX-OS'],
                                         'reason': 'The source defines filesystem durability and atomic rename collision checks for state writes; this is '
                                                   'HELIX-OS operational persistence control.'},
 'src/policy/historical-vpair-migration-authority.ts': {'category': 'multi_product_conflict',
                                                        'length': 18,
                                                        'marker': 'export function classifyHistoricalVpairMigration',
                                                        'products': ['HELIX-HARNESS', 'HELIX-OS'],
                                                        'reason': 'The source classifies historical V-pair migration candidates against authority rows and '
                                                                  'decisions; HARNESS V-model history and OS migration authority overlap.'},
 'src/search/index.ts': {'category': 'direct_product_basis',
                         'length': 18,
                         'marker': 'export function upsertSearchReference',
                         'products': ['HELIX-OS'],
                         'reason': 'The source writes and queries state-backed search references; this is HELIX-OS operational state indexing.'},
 'src/security/secret-policy.ts': {'category': 'direct_product_basis',
                                   'length': 18,
                                   'marker': 'export function isSecretLike',
                                   'products': ['HELIX-OS'],
                                   'reason': 'The source centralizes secret-like token detection and scan violations for repository/state boundaries; this is '
                                             'HELIX-OS safety governance.'},
 'src/semantic/semantic-commit-store.ts': {'category': 'multi_product_conflict',
                                           'length': 18,
                                           'marker': 'export function buildSemanticCommit',
                                           'products': ['HELIX-HARNESS', 'HELIX-OS'],
                                           'reason': 'The source validates semantic envelopes and appends transaction receipts to HarnessDb; HARNESS semantic '
                                                     'artifact and OS transaction writer boundaries meet.'},
 'src/semantic/semantic-contract-revalidator.ts': {'category': 'multi_product_conflict',
                                                   'length': 18,
                                                   'marker': 'export function revalidateSemanticEnvelope',
                                                   'products': ['HELIX-HARNESS', 'HELIX-OS'],
                                                   'reason': 'The source revalidates semantic provenance, digests, paths, and contract envelopes at the Node '
                                                             'execution boundary; artifact contract and OS execution control overlap.'},
 'src/semantic/semantic-intake-receipt.ts': {'category': 'direct_product_basis',
                                             'length': 18,
                                             'marker': 'export function computeInventoryDigest',
                                             'products': ['HELIX-HARNESS'],
                                             'reason': 'The source fixes intake source inventory, divergence ruling, and atom disposition digests without '
                                                       'write authority; this is HARNESS artifact intake evidence.'},
 'src/task/proposal-coverage-data.ts': {'category': 'direct_product_basis',
                                        'length': 11,
                                        'marker': 'export const DOCUMENT_PACKS',
                                        'products': ['HELIX-HARNESS'],
                                        'reason': 'The source declares required document packs and coverage for proposal/design work; this is HARNESS process '
                                                  'artifact completeness.'},
 'src/task/proposal-document-pack-types.ts': {'category': 'direct_product_basis',
                                              'length': 18,
                                              'marker': 'export interface DocumentPack',
                                              'products': ['HELIX-HARNESS'],
                                              'reason': 'The source defines document-pack levels, required documents, and reasons; this is HARNESS '
                                                        'design/process artifact structure.'},
 'src/task/tier-router-policy.ts': {'category': 'direct_product_basis',
                                    'length': 18,
                                    'marker': 'export const ROLE_ARCHETYPE',
                                    'products': ['HELIX-OS'],
                                    'reason': 'The source maps operational roles, tiers, providers, and review policy; this is HELIX-OS delegation/control '
                                              'routing.'},
 'src/task/tier-router.ts': {'category': 'direct_product_basis',
                             'length': 18,
                             'marker': 'export function route',
                             'products': ['HELIX-OS'],
                             'reason': 'The source resolves task difficulty, risk, provider placement, frontier approval, and cross assignment; this is '
                                       'HELIX-OS orchestration control.'},
 'src/team/launch-policy.ts': {'category': 'multi_product_conflict',
                               'length': 18,
                               'marker': 'export interface TeamLaunchRecommendation',
                               'products': ['HELIX-HARNESS', 'HELIX-OS'],
                               'reason': 'The source turns task difficulty/risk and artifact work into team launch recommendations; HARNESS process judgement '
                                         'and OS worker orchestration compete.'},
 'src/team/model-effort.ts': {'category': 'direct_product_basis',
                              'length': 18,
                              'marker': 'export function adaptReasoningEffort',
                              'products': ['HELIX-OS'],
                              'reason': 'The source adapts model reasoning effort from runtime observations under fixed model policy; this is HELIX-OS worker '
                                        'orchestration.'},
 'src/team/run-policy.ts': {'category': 'direct_product_basis',
                            'length': 18,
                            'marker': 'export const TEAM_RUN_REQUIRES_HYBRID_MESSAGE',
                            'products': ['HELIX-OS'],
                            'reason': 'The source fixes team-run hybrid, provider, dry-run, and dependency failure policy messages; this is HELIX-OS execution '
                                      'control.'},
 'src/vmodel/design-declarations.ts': {'category': 'insufficient_basis',
                                       'length': 1,
                                       'marker': 'export * from "../schema/design-declarations"',
                                       'products': [],
                                       'reason': 'The source is a one-line V-model re-export facade; it contains no independent product responsibility '
                                                 'evidence.'},
 'src/vmodel/fit.ts': {'category': 'insufficient_basis',
                       'length': 7,
                       'marker': 'Compatibility evidence anchor for the V-model fit artifact path',
                       'products': [],
                       'reason': 'The source explicitly identifies itself as a compatibility anchor while executable projection lives elsewhere; this path '
                                 'alone cannot establish product ownership.'},
 'src/vmodel/zip-manifest.ts': {'category': 'insufficient_basis',
                                'length': 1,
                                'marker': 'export * from "../schema/hybrid-vmodel-manifest"',
                                'products': [],
                                'reason': 'The source is a one-line manifest re-export facade; it lacks an independent semantic owner span.'},
 'src/vscode/extension-adapter.ts': {'category': 'insufficient_basis',
                                     'length': 16,
                                     'marker': 'export interface VscodeApiLike',
                                     'products': [],
                                     'reason': 'The source defines generic VS Code adapter interfaces and validation; the adapter contract alone does not '
                                               'resolve HARNESS versus Web responsibility.'},
 'src/vscode/extension-manifest.ts': {'category': 'multi_product_conflict',
                                      'length': 18,
                                      'marker': 'export function helixVscodeContributionManifest',
                                      'products': ['HELIX-HARNESS', 'HELIX-Web'],
                                      'reason': 'The source contributes HARNESS/project visualization views and commands to VS Code; HARNESS artifact '
                                                'projection and Web presentation responsibility overlap.'},
 'src/vscode/extension.ts': {'category': 'multi_product_conflict',
                             'length': 18,
                             'marker': 'export async function activate',
                             'products': ['HELIX-HARNESS', 'HELIX-Web'],
                             'reason': 'The source activates the visualization extension and registers a repository UI surface; HARNESS visualization evidence '
                                       'and Web presentation responsibility overlap.'},
 'src/vscode/tree-decoration.ts': {'category': 'multi_product_conflict',
                                   'length': 11,
                                   'marker': 'export function decorateVscodeTree',
                                   'products': ['HELIX-HARNESS', 'HELIX-Web'],
                                   'reason': 'The source turns a visualization contract into a VS Code tree with user commands; HARNESS evidence shape and '
                                             'Web/UI presentation overlap.'},
 'src/vscode/tree-view-provider.ts': {'category': 'multi_product_conflict',
                                      'length': 3,
                                      'marker': 'export function buildVisualizationTreeView',
                                      'products': ['HELIX-HARNESS', 'HELIX-Web'],
                                      'reason': 'The source projects a HARNESS visualization contract into a VS Code view; artifact projection and '
                                                'presentation boundary compete.'},
 'src/web/.gitkeep': {'category': 'insufficient_basis',
                      'length': 3,
                      'marker': '中央 Web UI service の home',
                      'products': [],
                      'reason': 'The source is a repository placeholder describing a future Web home and L2 boundary; it contains no implemented semantic span '
                                'for product classification.'},
 'src/web/catalog.ts': {'category': 'direct_product_basis',
                        'length': 18,
                        'marker': 'export const COMMON_COMPONENTS',
                        'products': ['HELIX-Web'],
                        'reason': 'The source declares read-only common and screen-specific UI components and status states; this is HELIX-Web presentation '
                                  'responsibility.'},
 'src/web/index.ts': {'category': 'insufficient_basis',
                      'length': 12,
                      'marker': 'export { componentCoverageSummary',
                      'products': [],
                      'reason': 'The source is a re-export index for Web modules; it contains no independent product responsibility span.'},
 'src/web/render.ts': {'category': 'direct_product_basis',
                       'length': 18,
                       'marker': 'export function renderScreen',
                       'products': ['HELIX-Web'],
                       'reason': 'The source renders read-only screens, status badges, and the app shell as HTML; this is HELIX-Web presentation behavior.'},
 'src/web/share.ts': {'category': 'multi_product_conflict',
                      'length': 18,
                      'marker': 'export function buildReadOnlyShareBundle',
                      'products': ['HELIX-Web', 'HELIX-Web-OS'],
                      'reason': 'The source builds a read-only Cloudflare share bundle with webhook verification and deployment/activation prohibitions; Web '
                                'presentation and Web-OS service/deployment boundaries meet.'},
 'src/web/tokens.ts': {'category': 'direct_product_basis',
                       'length': 18,
                       'marker': 'export function loadUiTokens',
                       'products': ['HELIX-Web'],
                       'reason': 'The source loads and validates UI color, layout, and component tokens for screen rendering; this is HELIX-Web presentation '
                                 'configuration.'},
 'src/web/types.ts': {'category': 'direct_product_basis',
                      'length': 16,
                      'marker': 'export interface ScreenSpec',
                      'products': ['HELIX-Web'],
                      'reason': 'The source defines screen, component, status, and rendered-screen contracts; this is HELIX-Web presentation data structure.'}}
EXPECTED_HUMAN = ["product_owner_and_boundary_decision", "source_semantic_anchor_acceptance", "phase_admission_and_successor_assignment", "legacy_consumer_closure_and_failure_disposition", "formal_asset_classification_update"]
BOUNDARY_RANGES = [(36, 39), (54, 65), (86, 89)]
L1_RANGES = {"HELIX-HARNESS": [(22, 35), (54, 58)], "HELIX-OS": [(22, 40), (59, 63)], "HELIX-Web": [(24, 35), (45, 49)], "HELIX-Web-OS": [(14, 23), (37, 44)]}


def fail(code: str, message: str) -> None:
    raise AssertionError(f"{code}: {message}")


def tagged(data: bytes) -> str:
    return "sha256:" + hashlib.sha256(data).hexdigest()


def git_bytes(path: str, base: str = BASE_REVISION) -> bytes:
    try:
        return subprocess.check_output(["git", "show", f"{base}:{path}"])
    except subprocess.CalledProcessError as exc:
        fail("E_BASE_SOURCE", path)
        raise exc


def git_blob(path: str, base: str = BASE_REVISION) -> str:
    try:
        return subprocess.check_output(["git", "rev-parse", f"{base}:{path}"], text=True).strip()
    except subprocess.CalledProcessError as exc:
        fail("E_BASE_SOURCE", path)
        raise exc


def canonical(value: object) -> bytes:
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()


def row_digest(row: dict) -> str:
    return tagged(canonical(row))


def read_jsonl(path: str) -> list[tuple[int, dict]]:
    rows = []
    for n, line in enumerate(git_bytes(path).decode().splitlines(), 1):
        if line.strip(): rows.append((n, json.loads(line)))
    return rows


def expected_legacy_asset_evidence(asset: dict, line: int) -> dict:
    return {
        "path": DISPOSITION,
        "line": line,
        "row_sha256": row_digest(asset),
        "disposition": asset.get("disposition"),
        "asset_class": asset.get("asset_class"),
        "product_target": asset.get("product_target"),
        "implementation_status": asset.get("implementation_status"),
        "consumer_refs": sorted(asset.get("consumer_refs", [])),
        "decision_record_ref": asset.get("decision_record_ref"),
        "read_after_record_ref": asset.get("read_after_record_ref"),
    }


def expected_history_failure_consumer(
    asset: dict,
    line: int,
    decisions: list[tuple[int, dict]],
    read_afters: list[tuple[int, dict]],
) -> dict:
    failure = git_bytes(FAILURE_SOURCE)
    consumer = git_bytes(CONSUMER_SOURCE)
    disposition = expected_legacy_asset_evidence(asset, line)
    disposition.update({"source_path": asset.get("source_path"), "source_sha256": asset.get("source_sha256")})
    return {
        "disposition": disposition,
        "decisions": [
            {
                "path": DECISIONS,
                "line": n,
                "row_sha256": row_digest(row),
                "decision_id": row.get("decision_id"),
                "product_target": row.get("product_target"),
                "disposition": row.get("disposition"),
            }
            for n, row in decisions
            if row.get("asset_id") == asset.get("asset_id")
        ],
        "read_after": [
            {
                "path": READ_AFTER,
                "line": n,
                "row_sha256": row_digest(row),
                "read_after_id": row.get("read_after_id"),
                "result": row.get("result"),
                "digest_match": row.get("digest_match"),
                "consumer_match": row.get("consumer_match"),
            }
            for n, row in read_afters
            if row.get("asset_id") == asset.get("asset_id")
        ],
        "failure_consumer_static": {
            "failure": {
                "path": FAILURE_SOURCE,
                "blob": git_blob(FAILURE_SOURCE),
                "sha256": tagged(failure),
                "read_mode": "git_object_static_read_only",
            },
            "consumer": {
                "path": CONSUMER_SOURCE,
                "blob": git_blob(CONSUMER_SOURCE),
                "sha256": tagged(consumer),
                "read_mode": "git_object_static_read_only",
            },
        },
        "closure_status": "asset-level history/consumer closure absent; global failure/consumer inventories retained for human review",
    }


def range_check(receipt: dict, expected_path: str, start: int, end: int) -> None:
    if receipt.get("path") != expected_path or receipt.get("line_start") != start or receipt.get("line_end") != end:
        fail("E_BOUNDARY_ANCHOR", f"range {expected_path} {start}-{end}")
    lines = git_bytes(expected_path).decode(errors="replace").splitlines()
    text = "\n".join(lines[start - 1:end])
    if receipt.get("line_text") != lines[start - 1:end] or receipt.get("line_text_sha256") != tagged(text.encode()):
        fail("E_BOUNDARY_ANCHOR", expected_path)


def derive_targets(phase_rows: dict[str, tuple[int, dict]]) -> tuple[list[str], set[str], set[str]]:
    unresolved = {a: row for a, (_, row) in phase_rows.items() if row.get("product_classification_status") == "unresolved"}
    implementation = {a: row for a, row in unresolved.items() if row.get("artifact_evidence_kind") == "implementation_source"}
    wave_assets = set()
    for path in WAVE_PATHS.values():
        for _, row in read_jsonl(path):
            if row.get("asset_id") in unresolved:
                wave_assets.add(row["asset_id"])
    existing = {a for a, row in unresolved.items() if any(row.get("source_path", "").startswith(prefix) for prefix in EXISTING_RESEARCH_PREFIXES)} | wave_assets
    if len(unresolved) != 1792: fail("E_TARGET_SET", f"unresolved={len(unresolved)}")
    if len(existing) != 280: fail("E_TARGET_SET", f"existing_union={len(existing)}")
    targets = sorted(set(implementation) - existing)
    if len(targets) != 67: fail("E_TARGET_SET", f"targets={len(targets)}")
    return targets, wave_assets, existing


def check_source(record: dict, expected: dict, asset: dict) -> None:
    path = asset["source_path"]
    exact = record.get("source_exact")
    if not isinstance(exact, dict): fail("E_SOURCE_ANCHOR", path)
    if set(exact) != EXPECTED_SOURCE_KEYS: fail("E_SOURCE_ANCHOR", path)
    archive = ARCHIVE_PREFIX + path
    if exact.get("archive_path") != archive or exact.get("source_path") != path: fail("E_SOURCE_ANCHOR", path)
    data = git_bytes(archive)
    if exact.get("blob") != git_blob(archive) or exact.get("bytes") != len(data) or exact.get("line_count") != len(data.decode(errors="replace").splitlines()): fail("E_OLD_ASSET_SOURCE", path)
    if exact.get("sha256") != tagged(data) or exact.get("ledger_source_sha256") != "sha256:" + asset.get("source_sha256", ""): fail("E_OLD_ASSET_SOURCE", path)
    match = exact.get("ledger_digest_match")
    if (not match) != (path in EXPECTED_MISMATCH_PATHS): fail("E_OLD_ASSET_SOURCE", f"ledger mismatch declaration {path}")
    if exact.get("read_mode") != "git_object_static_read_only": fail("E_READ_MODE", path)
    anchor = exact.get("semantic_anchor")
    if not isinstance(anchor, dict) or anchor.get("marker") != expected["marker"]: fail("E_SOURCE_ANCHOR", path)
    lines = data.decode(errors="replace").splitlines()
    hits = [i for i, line in enumerate(lines, 1) if expected["marker"] in line]
    exact_hits = [i for i, line in enumerate(lines, 1) if line.strip().startswith(expected["marker"]) and (len(line.strip()) == len(expected["marker"]) or not line.strip()[len(expected["marker"])].isalnum() and line.strip()[len(expected["marker"])] not in "_$")]
    if exact_hits: hits = exact_hits
    if len(hits) != 1: fail("E_SOURCE_ANCHOR", path)
    start, end = hits[0], min(len(lines), hits[0] + expected["length"] - 1)
    text = "\n".join(lines[start - 1:end])
    if anchor.get("line_start") != start or anchor.get("line_end") != end or anchor.get("line_text") != lines[start - 1:end] or anchor.get("line_text_sha256") != tagged(text.encode()): fail("E_SOURCE_ANCHOR", path)
    if anchor.get("interpretation") != expected["reason"] or anchor.get("products_considered") != (expected["products"] or list(EXPECTED_PRODUCTS)): fail("E_SOURCE_ANCHOR", path)


def check() -> None:
    try:
        subprocess.check_call(["git", "merge-base", "--is-ancestor", BASE_REVISION, "HEAD"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    except subprocess.CalledProcessError:
        fail("E_BASE_NOT_ANCESTOR", BASE_REVISION)
    inv = json.loads(INVENTORY.read_text())
    rows = [json.loads(line) for line in LEDGER.read_text().splitlines() if line.strip()]
    phase_list = read_jsonl(PHASE)
    phase = {r["asset_id"]: (n, r) for n, r in phase_list}
    disp = {r["asset_id"]: (n, r) for n, r in read_jsonl(DISPOSITION)}
    decisions = read_jsonl(DECISIONS)
    read_afters = read_jsonl(READ_AFTER)
    targets, wave_assets, existing = derive_targets(phase)
    if sorted(r.get("asset_id") for r in rows) != targets or len({r.get("asset_id") for r in rows}) != 67: fail("E_TARGET_SET", "ledger IDs")
    if set(inv.get("expected_sets", {}).get("target_asset_ids", [])) != set(targets) or inv.get("expected_sets", {}).get("target_asset_count") != 67: fail("E_INVENTORY_DECLARATION", "target set")
    if set(inv) != EXPECTED_INVENTORY_KEYS: fail("E_INVENTORY_DECLARATION", "inventory schema keys")
    if inv.get("schema_revision") != 1: fail("E_INVENTORY_DECLARATION", "schema revision")
    if inv.get("expected_sets") != {
        "target_asset_count": 67,
        "target_asset_ids": targets,
        "target_asset_ids_sha256": tagged("\n".join(targets).encode()),
        "source_paths": [phase[a][1]["source_path"] for a in targets],
    }: fail("E_INVENTORY_DECLARATION", "target/source path sets")
    if inv.get("base_revision") != BASE_REVISION or inv.get("base_source_mode") != "all input and archive evidence bytes from fixed BASE Git objects": fail("E_BASE_PIN", "inventory")
    if inv.get("scope") != EXPECTED_SCOPE or inv.get("artifacts") != EXPECTED_ARTIFACTS_ORDERED or inv.get("negative_cases") != EXPECTED_NEGATIVE_CASES: fail("E_INVENTORY_DECLARATION", "scope/artifacts/negative cases")
    if inv.get("classification_rule") != EXPECTED_RULES: fail("E_INVENTORY_DECLARATION", "classification rule")
    if inv.get("authority_boundary") != {"authority_effect": "none", "classification_state": "research_proposal_pending_human_product_review", "formal_asset_classification_updated": False, "new_build_allowed": False}: fail("E_INVENTORY_DECLARATION", "authority boundary")
    if inv.get("binding_id") != BINDING_ID: fail("E_INVENTORY_DECLARATION", "binding id")
    if inv.get("formal_update") != {
        "formal_asset_classification_updated": False,
        "phase_ledger_updated": False,
        "product_route_updated": False,
        "successor_updated": False,
        "new_build_allowed": False,
        "authority_effect": "none",
    }: fail("E_AUTHORITY_PROMOTION", "formal update")
    if inv.get("counts", {}).get("target_wave_edges") != 0 or inv.get("counts", {}).get("wave_files") != 50 or inv.get("counts", {}).get("wave_edges_scanned") != 598 or inv.get("counts", {}).get("wave_unique_assets_scanned") != 355: fail("E_WAVE_EDGE_SET", "wave denominator")
    if inv.get("wave_source_paths") != {str(n): path for n, path in WAVE_PATHS.items()}: fail("E_WAVE_EDGE_SET", "wave input paths")
    if inv.get("existing_research_union") != {"expected_unresolved_assets": 1792, "existing_union_count": 280, "residual_unresolved_count": 1512, "existing_prefixes": list(EXISTING_RESEARCH_PREFIXES), "wave_unresolved_assets": 64, "target_wave_overlap": 0}: fail("E_INVENTORY_DECLARATION", "research union")
    if inv.get("old_asset_source_mode") != "archive bytes are read through git show BASE:<archive-path>; never executed": fail("E_INVENTORY_DECLARATION", "source mode")
    if inv.get("existing_research_union", {}).get("existing_union_count") != 280 or inv.get("existing_research_union", {}).get("residual_unresolved_count") != 1512: fail("E_INVENTORY_DECLARATION", "union counts")
    categories = Counter()
    expected_paths = set(EXPECTED_PROFILES)
    if expected_paths != {phase[a][1]["source_path"] for a in targets}: fail("E_REVIEW_PIN", "profile target paths")
    for row in rows:
        if set(row) != EXPECTED_RECORD_KEYS: fail("E_RECORD_SCHEMA", row.get("asset_id", ""))
        aid = row["asset_id"]
        if aid not in phase or aid not in disp: fail("E_TARGET_SET", aid)
        asset = disp[aid][1]
        path = asset["source_path"]
        expected = EXPECTED_PROFILES.get(path)
        if expected is None: fail("E_REVIEW_PIN", path)
        if row.get("source_path") != path: fail("E_SOURCE_ANCHOR", aid)
        check_source(row, expected, asset)
        pe = row.get("phase_evidence", {})
        pline, prow = phase[aid]
        for k, v in {"path": PHASE, "line": pline, "row_sha256": row_digest(prow), "product_classification_status": "unresolved", "artifact_evidence_kind": "implementation_source", "source_path": path, "source_sha256": prow.get("source_sha256"), "candidate_phase_targets": prow.get("candidate_phase_targets") or []}.items():
            if pe.get(k) != v: fail("E_PHASE_STATUS", aid)
        le = row.get("legacy_asset_evidence", {})
        dline, drow = disp[aid]
        if le != expected_legacy_asset_evidence(drow, dline): fail("E_OLD_LEDGER_RECORD", aid)
        cls = row.get("classification", {})
        if set(cls) != EXPECTED_CLASSIFICATION_KEYS: fail("E_RECORD_SCHEMA", aid)
        if cls.get("category") != expected["category"] or cls.get("candidate_products") != expected["products"]: fail("E_CLASSIFICATION", aid)
        if cls.get("semantic_status") != {"direct_product_basis": "reviewed_candidate", "multi_product_conflict": "reviewed_conflict", "insufficient_basis": "reviewed_insufficient_basis"}[expected["category"]]: fail("E_CLASSIFICATION", aid)
        if cls.get("reason") != expected["reason"] + " Candidate only; formal product authority remains unresolved.": fail("E_CLASSIFICATION", aid)
        categories[expected["category"]] += 1
        if row.get("wave_semantic_links") != [] or row.get("wave_edge_count") != 0: fail("E_WAVE_EDGE_SET", aid)
        shrink = row.get("legacy_implementation_shrinkage_evidence", {})
        expected_shrink = {"artifact_evidence_kind": "implementation_source", "implementation_evidence_state": phase[aid][1].get("implementation_evidence_state"), "legacy_implementation_status": phase[aid][1].get("legacy_implementation_status"), "disposition_implementation_status": drow.get("implementation_status"), "legacy_execution_performed": phase[aid][1].get("legacy_execution_performed"), "interpretation": "implementation source presence is historical static evidence; unknown status and pending consumer closure are preserved"}
        if shrink != expected_shrink: fail("E_IMPLEMENTATION_EVIDENCE", aid)
        if row.get("authority_effect") != "none" or row.get("formal_asset_classification_updated") is not False or row.get("new_build_allowed") is not False: fail("E_AUTHORITY_PROMOTION", aid)
        if row.get("human_judgment_remaining") != EXPECTED_HUMAN: fail("E_HUMAN_JUDGMENT", aid)
        h = row.get("legacy_history_failure_consumer", {})
        if h != expected_history_failure_consumer(drow, dline, decisions, read_afters): fail("E_HISTORY", aid)
        bnd = row.get("boundary_evidence", {})
        pb = bnd.get("product_boundary", {})
        bd = git_bytes(BOUNDARY)
        if pb.get("path") != BOUNDARY or pb.get("blob") != git_blob(BOUNDARY) or pb.get("sha256") != tagged(bd): fail("E_BOUNDARY_ANCHOR", aid)
        if len(pb.get("ranges", [])) != len(BOUNDARY_RANGES): fail("E_BOUNDARY_ANCHOR", aid)
        for rec, rg in zip(pb.get("ranges", []), BOUNDARY_RANGES): range_check(rec, BOUNDARY, *rg)
        for product in expected["products"] or EXPECTED_PRODUCTS:
            lr = bnd.get("l1", {}).get(product, {})
            b = git_bytes(L1[product])
            if lr.get("path") != L1[product] or lr.get("blob") != git_blob(L1[product]) or lr.get("sha256") != tagged(b): fail("E_BOUNDARY_ANCHOR", aid)
            if len(lr.get("ranges", [])) != len(L1_RANGES[product]): fail("E_BOUNDARY_ANCHOR", aid)
            for rec, rg in zip(lr.get("ranges", []), L1_RANGES[product]): range_check(rec, L1[product], *rg)
    expected_counts = {
        "wave_files": 50,
        "wave_edges_scanned": 598,
        "wave_unique_assets_scanned": 355,
        "target_assets": 67,
        "target_wave_edges": 0,
        "categories": dict(sorted(categories.items())),
        "target_asset_artifact_evidence_kinds": {"implementation_source": 67},
    }
    if inv.get("counts") != expected_counts: fail("E_INVENTORY_DECLARATION", "counts")
    phase_distribution = Counter("|".join(phase[a][1].get("candidate_phase_targets") or []) for a in targets)
    if inv.get("phase_candidate_distribution") != dict(sorted(phase_distribution.items())): fail("E_INVENTORY_DECLARATION", "phase distribution")
    if inv.get("edge_contract") != {"target_wave_edges": 0, "duplicate_edges_forbidden": True, "missing_edges_forbidden": True}: fail("E_INVENTORY_DECLARATION", "edge contract")
    if inv.get("history_failure_consumer") != {"disposition_rows": 67, "decision_rows_for_targets": 0, "read_after_rows_for_targets": 0, "failure_consumer_refs_are_static_global_inventory": True}: fail("E_INVENTORY_DECLARATION", "history/failure/consumer declaration")
    global_inputs = [PHASE, DISPOSITION, DECISIONS, READ_AFTER, BOUNDARY, *L1.values(), FAILURE_SOURCE, CONSUMER_SOURCE, "docs/governance/legacy-asset-reuse-control.md", "docs/governance/new-generation-start-here.md", "archive/legacy-generation-2026-09-14/MANIFEST.sha256"]
    expected_input_paths = [*WAVE_PATHS.values(), *global_inputs, *[ARCHIVE_PREFIX + phase[a][1]["source_path"] for a in targets]]
    paths = [x.get("path") for x in inv.get("input_digests", [])]
    if paths != expected_input_paths or len(paths) != len(set(paths)): fail("E_INPUT_DIGEST", "input path set/order")
    for item in inv["input_digests"]:
        if set(item) != EXPECTED_INPUT_DIGEST_KEYS: fail("E_INPUT_DIGEST", "input digest schema")
        b = git_bytes(item["path"])
        if item.get("blob") != git_blob(item["path"]) or item.get("bytes") != len(b) or item.get("sha256") != tagged(b): fail("E_INPUT_DIGEST", item.get("path", ""))
    if inv.get("output_sha256") != tagged(LEDGER.read_bytes()): fail("E_OUTPUT_DIGEST", "ledger")
    print(f"SCF-B-0126 validate: PASS records=67 categories={dict(sorted(categories.items()))} target_wave_edges=0 union=280")


if __name__ == "__main__":
    check()

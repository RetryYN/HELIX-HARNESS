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
PRODUCT_RESEARCH_COMMIT = "b3a3c49b34bfaa1cca5861075d1de18c0e5e7204"
BINDING_ID = "SCF-B-0126"
ARCHIVE_PREFIX = "archive/legacy-generation-2026-09-14/root/"
PHASE = "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl"
DISPOSITION = "docs/governance/legacy-asset-disposition.jsonl"
DECISIONS = "docs/governance/legacy-asset-decisions.jsonl"
READ_AFTER = "docs/governance/legacy-asset-copy-read-after.jsonl"
MANIFEST = "archive/legacy-generation-2026-09-14/MANIFEST.sha256"
BINDING_FILE = ROOT / "scaffold/bindings/SCF-B-0126.json"
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
EXPECTED_MISMATCH_PATHS = {"scripts/helix.ps1"}
EXPECTED_PRODUCTS = ("HELIX-HARNESS", "HELIX-OS", "HELIX-Web", "HELIX-Web-OS")
EXPECTED_SCOPE = "fixed BASE unresolved implementation_source residual after latest main product research union 429 and explicit overlap reconciliation; exact 67 new assets from the initial 120-asset tranche"
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
    'review_pin_tamper',
    'ledger_digest_match_tamper',
    'wave_denominator_tamper',
    'existing_union_tamper',
    'inventory_top_level_extra_key_tamper',
    'inventory_top_level_missing_key_tamper',
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
    "archive_manifest_resolution",
    "binding_upstream",
    "overlap_reconciliation",
    "product_research_union",
    "archive_source_provenance",
}
EXPECTED_INPUT_DIGEST_KEYS = {"path", "blob", "bytes", "sha256"}
EXPECTED_RECORD_KEYS = {"asset_id", "source_path", "source_exact", "phase_evidence", "legacy_asset_evidence", "classification", "boundary_evidence", "legacy_history_failure_consumer", "legacy_implementation_shrinkage_evidence", "wave_semantic_links", "wave_edge_count", "human_judgment_remaining", "authority_effect", "formal_asset_classification_updated", "new_build_allowed", "anchor_line_coverage", "research_scope", "evidence_completeness", "overlap_status", "bundle_revision", "denominator_role"}
EXPECTED_SOURCE_KEYS = {"archive_path", "source_path", "blob", "bytes", "line_count", "sha256", "ledger_source_sha256", "ledger_digest_match", "archive_manifest_sha256", "archive_manifest_match", "archive_manifest_resolution", "semantic_anchor", "read_mode", "mode", "type"}
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


def strict_pairs(pairs: list[tuple[str, object]]) -> dict:
    result = {}
    for key, value in pairs:
        if key in result:
            raise ValueError(f"duplicate JSON key: {key}")
        result[key] = value
    return result


def strict_json(text: str, label: str, require_object: bool = True) -> object:
    try:
        value = json.loads(text, object_pairs_hook=strict_pairs)
    except (json.JSONDecodeError, TypeError, ValueError) as exc:
        fail("E_JSON", f"{label}: {exc}")
    if require_object and not isinstance(value, dict):
        fail("E_JSON", f"{label}: top-level JSON object required")
    return value


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


def git_tree_entry(path: str, base: str = BASE_REVISION) -> dict[str, str]:
    try:
        raw = subprocess.check_output(["git", "ls-tree", base, "--", path], text=True)
    except subprocess.CalledProcessError as exc:
        fail("E_SOURCE_TREE", path)
        raise exc
    lines = [line for line in raw.splitlines() if line]
    if len(lines) != 1 or "\t" not in lines[0]:
        fail("E_SOURCE_TREE", f"exact path {path}")
    header, entry_path = lines[0].split("\t", 1)
    parts = header.split()
    if len(parts) != 3 or entry_path != path:
        fail("E_SOURCE_TREE", f"path {path}")
    mode, entry_type, oid = parts
    if entry_type != "blob" or mode not in {"100644", "100755"} or len(oid) != 40:
        fail("E_SOURCE_TREE", f"mode/type {path}")
    return {"mode": mode, "type": entry_type}


def git_bytes_at(path: str, revision: str) -> bytes:
    try:
        return subprocess.check_output(["git", "show", f"{revision}:{path}"])
    except subprocess.CalledProcessError as exc:
        fail("E_PRODUCT_RESEARCH_INPUT", path)
        raise exc


def git_blob_at(path: str, revision: str) -> str:
    try:
        return subprocess.check_output(["git", "rev-parse", f"{revision}:{path}"], text=True).strip()
    except subprocess.CalledProcessError as exc:
        fail("E_PRODUCT_RESEARCH_INPUT", path)
        raise exc


def read_product_jsonl(path: str) -> list[tuple[int, dict]]:
    rows = []
    for n, line in enumerate(git_bytes_at(path, PRODUCT_RESEARCH_COMMIT).decode().splitlines(), 1):
        if line.strip():
            row = strict_json(line, f"{PRODUCT_RESEARCH_COMMIT}:{path}:{n}")
            if not isinstance(row, dict):
                fail("E_JSON", f"{path}:{n}: top-level JSON object required")
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
    return {
        "asset_id": row.get("asset_id"),
        "source_path": source_path,
        "source_sha256": source_sha,
        "bundle": bundle,
        "category": category,
        "candidate_products": products,
    }


def product_research_union() -> dict[str, list[dict]]:
    by_id: dict[str, list[dict]] = {}
    for bundle in PRODUCT_RESEARCH_BUNDLES:
        for _, row in read_product_jsonl(bundle):
            info = product_record_info(row, bundle)
            if not info["asset_id"] or not info["source_path"] or not info["source_sha256"]:
                fail("E_PRODUCT_RESEARCH_INPUT", bundle)
            by_id.setdefault(info["asset_id"], []).append(info)
    if len(by_id) != 429:
        fail("E_PRODUCT_RESEARCH_UNION", f"union={len(by_id)}")
    for asset_id, records in by_id.items():
        if len({(r["source_path"], r["source_sha256"]) for r in records}) != 1:
            fail("E_PRODUCT_RESEARCH_UNION", asset_id)
    return by_id


def manifest_sha256(source_path: str) -> str:
    expected = f" {source_path}"
    for line in git_bytes(MANIFEST).decode(errors="replace").splitlines():
        if line.endswith(expected):
            digest, path = line.split(maxsplit=1)
            if path == source_path:
                return "sha256:" + digest
    fail("E_ARCHIVE_MANIFEST", source_path)


def expected_nonarchive_input_paths() -> list[str]:
    global_inputs = [PHASE, DISPOSITION, DECISIONS, READ_AFTER, BOUNDARY, *L1.values(), FAILURE_SOURCE, CONSUMER_SOURCE, "docs/governance/legacy-asset-reuse-control.md", "docs/governance/new-generation-start-here.md", MANIFEST]
    return [*WAVE_PATHS.values(), *[path for path in global_inputs if not path.startswith("archive/")]]


def expected_binding_upstream() -> list[dict]:
    upstream = [{"path": path, "sha256": tagged(git_bytes(path))[7:]} for path in expected_nonarchive_input_paths()]
    upstream.extend({"path": path, "sha256": tagged(git_bytes_at(path, PRODUCT_RESEARCH_COMMIT))[7:]} for path in PRODUCT_RESEARCH_BUNDLES)
    return upstream


UNRESEARCHED_PROFILE_REASON = "This implementation_source asset is absent from the prior research asset-ID set; no direct product evidence is retained, so it remains insufficient basis pending dedicated review."

def unique_anchor_marker(path: str) -> str:
    lines = git_bytes(ARCHIVE_PREFIX + path).decode(errors="replace").splitlines()
    for line in lines:
        marker = line.strip()
        if marker and sum(marker in candidate for candidate in lines) == 1:
            return marker
    fail("E_SOURCE_ANCHOR", path)

for _, _path in UNRESEARCHED_PREFIX_ASSET_PATHS:
    EXPECTED_PROFILES[_path] = {"category": "insufficient_basis", "products": [], "marker": unique_anchor_marker(_path), "reason": UNRESEARCHED_PROFILE_REASON, "length": 1}
if len(EXPECTED_PROFILES) != 120:
    fail("E_REVIEW_PIN", f"profile count {len(EXPECTED_PROFILES)}")

def canonical(value: object) -> bytes:
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()


def row_digest(row: dict) -> str:
    return tagged(canonical(row))


def read_jsonl(path: str) -> list[tuple[int, dict]]:
    rows = []
    for n, line in enumerate(git_bytes(path).decode().splitlines(), 1):
        if line.strip():
            row = strict_json(line, f"{path}:{n}")
            if not isinstance(row, dict):
                fail("E_JSON", f"{path}:{n}: top-level JSON object required")
            rows.append((n, row))
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



def expected_range_receipt(path: str, start: int, end: int) -> dict:
    lines = git_bytes(path).decode(errors="replace").splitlines()
    text = "\n".join(lines[start - 1:end])
    return {"path": path, "line_start": start, "line_end": end, "line_text_sha256": tagged(text.encode()), "line_text": lines[start - 1:end]}


def expected_boundary_receipt() -> dict:
    return {"path": BOUNDARY, "blob": git_blob(BOUNDARY), "sha256": tagged(git_bytes(BOUNDARY)), "ranges": [expected_range_receipt(BOUNDARY, *rg) for rg in BOUNDARY_RANGES]}


def expected_l1_receipts(products: list[str]) -> dict:
    return {product: {"path": L1[product], "blob": git_blob(L1[product]), "sha256": tagged(git_bytes(L1[product])), "ranges": [expected_range_receipt(L1[product], *rg) for rg in L1_RANGES[product]]} for product in products}


def expected_source_exact(asset: dict, spec: dict) -> dict:
    path = asset["source_path"]
    archive = ARCHIVE_PREFIX + path
    tree = git_tree_entry(archive)
    data = git_bytes(archive)
    lines = data.decode(errors="replace").splitlines()
    hits = [i for i, line in enumerate(lines, 1) if spec["marker"] in line]
    exact_hits = [i for i, line in enumerate(lines, 1) if line.strip().startswith(spec["marker"]) and (len(line.strip()) == len(spec["marker"]) or not line.strip()[len(spec["marker"])] .isalnum() and line.strip()[len(spec["marker"])] not in "_$")]
    if exact_hits:
        hits = exact_hits
    if len(hits) != 1:
        fail("E_SOURCE_ANCHOR", path)
    start = hits[0]
    end = min(len(lines), start + spec["length"] - 1)
    text = "\n".join(lines[start - 1:end])
    anchor = {"marker": spec["marker"], "line_start": start, "line_end": end, "line_text": lines[start - 1:end], "line_text_sha256": tagged(text.encode()), "interpretation": spec["reason"], "products_considered": spec["products"] or list(EXPECTED_PRODUCTS)}
    ledger_sha = asset.get("source_sha256")
    archive_digest = tagged(data)
    manifest_digest = manifest_sha256(path)
    manifest_match = archive_digest == manifest_digest
    manifest_resolution = {"status": "matched"} if manifest_match else {"status": "pending_human_source_resolution", "formal_admission": "stopped", "reuse_decision": "stopped", "reason": "archive bytes and manifest entry differ; static evidence is retained"}
    return {"archive_path": archive, "source_path": path, "mode": tree["mode"], "type": tree["type"], "blob": git_blob(archive), "bytes": len(data), "line_count": len(lines), "sha256": archive_digest, "ledger_source_sha256": "sha256:" + ledger_sha, "ledger_digest_match": archive_digest == "sha256:" + ledger_sha, "archive_manifest_sha256": manifest_digest, "archive_manifest_match": manifest_match, "archive_manifest_resolution": manifest_resolution, "semantic_anchor": anchor, "read_mode": "git_object_static_read_only"}


def expected_archive_source_provenance(initial_targets: set[str], dispositions: dict[str, tuple[int, dict]]) -> list[dict]:
    result = []
    for asset_id in sorted(initial_targets):
        source_path = dispositions[asset_id][1]["source_path"]
        spec = EXPECTED_PROFILES.get(source_path)
        if spec is None: fail("E_REVIEW_PIN", source_path)
        source_exact = expected_source_exact(dispositions[asset_id][1], spec)
        source_exact.pop("semantic_anchor")
        result.append({"asset_id": asset_id, "source_path": source_path, "source_exact": source_exact})
    return result


def expected_record(asset_id: str, phase: dict[str, tuple[int, dict]], dispositions: dict[str, tuple[int, dict]], decisions: list[tuple[int, dict]], read_afters: list[tuple[int, dict]]) -> dict:
    phase_line, phase_row = phase[asset_id]
    disposition_line, disposition_row = dispositions[asset_id]
    path = disposition_row["source_path"]
    spec = EXPECTED_PROFILES[path]
    category = spec["category"]
    products = list(spec["products"])
    status = {"direct_product_basis": "reviewed_candidate", "multi_product_conflict": "reviewed_conflict", "insufficient_basis": "reviewed_insufficient_basis"}[category]
    source_exact = expected_source_exact(disposition_row, spec)
    anchor_line_count = source_exact["semantic_anchor"]["line_end"] - source_exact["semantic_anchor"]["line_start"] + 1
    return {
        "asset_id": asset_id,
        "source_path": path,
        "anchor_line_coverage": {"source_line_count": source_exact["line_count"], "anchor_line_count": anchor_line_count, "coverage_ratio": round(anchor_line_count / source_exact["line_count"], 6)},
        "source_exact": source_exact,
        "phase_evidence": {"path": PHASE, "line": phase_line, "row_sha256": row_digest(phase_row), "product_classification_status": phase_row.get("product_classification_status"), "artifact_evidence_kind": phase_row.get("artifact_evidence_kind"), "source_path": phase_row.get("source_path"), "source_sha256": phase_row.get("source_sha256"), "candidate_phase_targets": phase_row.get("candidate_phase_targets") or []},
        "legacy_asset_evidence": expected_legacy_asset_evidence(disposition_row, disposition_line),
        "classification": {"category": category, "candidate_products": products, "semantic_status": status, "reason": spec["reason"] + " Candidate only; formal product authority remains unresolved."},
        "boundary_evidence": {"product_boundary": expected_boundary_receipt(), "l1": expected_l1_receipts(products or list(EXPECTED_PRODUCTS))},
        "legacy_history_failure_consumer": expected_history_failure_consumer(disposition_row, disposition_line, decisions, read_afters),
        "legacy_implementation_shrinkage_evidence": {"artifact_evidence_kind": phase_row.get("artifact_evidence_kind"), "implementation_evidence_state": phase_row.get("implementation_evidence_state"), "legacy_implementation_status": phase_row.get("legacy_implementation_status"), "disposition_implementation_status": disposition_row.get("implementation_status"), "legacy_execution_performed": phase_row.get("legacy_execution_performed"), "interpretation": "implementation source presence is historical static evidence; unknown status and pending consumer closure are preserved"},
        "wave_semantic_links": [],
        "wave_edge_count": 0,
        "human_judgment_remaining": EXPECTED_HUMAN,
        "authority_effect": "none",
        "formal_asset_classification_updated": False,
        "new_build_allowed": False,
        "research_scope": "new_residual_after_main_product_union",
        "evidence_completeness": "source_anchor_product_boundary_and_legacy_static_evidence; human_resolution_pending",
        "overlap_status": "not_in_main_product_research_union",
        "bundle_revision": PRODUCT_RESEARCH_COMMIT,
        "denominator_role": "new_target",
    }


def derive_targets(phase_rows: dict[str, tuple[int, dict]]) -> tuple[list[str], set[str], set[str]]:
    unresolved = {a: row for a, (_, row) in phase_rows.items() if row.get("product_classification_status") == "unresolved"}
    implementation = {a: row for a, row in unresolved.items() if row.get("artifact_evidence_kind") == "implementation_source"}
    wave_assets = set()
    wave_edge_count = 0
    wave_all_asset_ids = set()
    for path in WAVE_PATHS.values():
        wave_rows = read_jsonl(path)
        wave_edge_count += len(wave_rows)
        wave_all_asset_ids.update(row.get("asset_id") for _, row in wave_rows if row.get("asset_id"))
        for _, row in wave_rows:
            if row.get("asset_id") in unresolved:
                wave_assets.add(row["asset_id"])
    if wave_edge_count != 598 or len(wave_all_asset_ids) != 355: fail("E_WAVE_EDGE_SET", f"recomputed edges={wave_edge_count} assets={len(wave_all_asset_ids)}")
    prefix_ids = {a for a, row in unresolved.items() if any(row.get("source_path", "").startswith(prefix) for prefix in EXISTING_RESEARCH_PREFIXES)}
    declared = {a: row.get("source_path") for a, row in unresolved.items() if a in UNRESEARCHED_PREFIX_ASSET_IDS}
    if len(unresolved) != 1792: fail("E_TARGET_SET", f"unresolved={len(unresolved)}")
    if declared != dict(UNRESEARCHED_PREFIX_ASSET_PATHS): fail("E_TARGET_SET", "unresearched prefix asset ID/path pin")
    if not UNRESEARCHED_PREFIX_ASSET_IDS <= prefix_ids: fail("E_TARGET_SET", "unresearched prefix residual outside prefix set")
    prior_research_ids = prefix_ids - UNRESEARCHED_PREFIX_ASSET_IDS
    legacy_existing = prior_research_ids | wave_assets
    if len(prior_research_ids) != 205 or len(legacy_existing) != 227: fail("E_TARGET_SET", f"legacy_existing prior={len(prior_research_ids)} union={len(legacy_existing)}")
    initial_targets = set(implementation) - legacy_existing
    if len(initial_targets) != 120: fail("E_TARGET_SET", f"initial_targets={len(initial_targets)}")
    product_union = product_research_union()
    product_ids = set(product_union)
    product_ids_for_unresolved = product_ids & set(unresolved)
    overlap = initial_targets & product_ids_for_unresolved
    targets = sorted(initial_targets - product_ids_for_unresolved)
    if len(overlap) != 53 or len(targets) != 67: fail("E_TARGET_SET", f"overlap={len(overlap)} targets={len(targets)}")
    if len(product_ids_for_unresolved) != 280: fail("E_PRODUCT_RESEARCH_UNION", f"unresolved_union={len(product_ids_for_unresolved)}")
    return targets, wave_assets, legacy_existing | product_ids_for_unresolved


def check_category_invariant(classification: dict, asset_id: str) -> None:
    category = classification.get("category")
    products = classification.get("candidate_products")
    if category not in {"direct_product_basis", "multi_product_conflict", "insufficient_basis"} or not isinstance(products, list) or any(product not in EXPECTED_PRODUCTS for product in products):
        fail("E_CLASSIFICATION", asset_id)
    if category == "direct_product_basis" and len(products) != 1:
        fail("E_CLASSIFICATION", asset_id)
    if category == "multi_product_conflict" and len(products) < 2:
        fail("E_CLASSIFICATION", asset_id)
    if category == "insufficient_basis" and products:
        fail("E_CLASSIFICATION", asset_id)


def check_source(record: dict, expected: dict, asset: dict) -> None:
    path = asset["source_path"]
    exact = record.get("source_exact")
    if not isinstance(exact, dict): fail("E_SOURCE_ANCHOR", path)
    if set(exact) != EXPECTED_SOURCE_KEYS: fail("E_SOURCE_ANCHOR", path)
    archive = ARCHIVE_PREFIX + path
    if exact.get("archive_path") != archive or exact.get("source_path") != path: fail("E_SOURCE_TREE", path)
    tree = git_tree_entry(archive)
    if exact.get("mode") != tree["mode"] or exact.get("type") != tree["type"]: fail("E_SOURCE_TREE", path)
    data = git_bytes(archive)
    if exact.get("blob") != git_blob(archive) or exact.get("bytes") != len(data) or exact.get("line_count") != len(data.decode(errors="replace").splitlines()): fail("E_OLD_ASSET_SOURCE", path)
    if exact.get("sha256") != tagged(data) or exact.get("ledger_source_sha256") != "sha256:" + asset.get("source_sha256", ""): fail("E_OLD_ASSET_SOURCE", path)
    match = exact.get("ledger_digest_match")
    if (not match) != (path in EXPECTED_MISMATCH_PATHS): fail("E_OLD_ASSET_SOURCE", f"ledger mismatch declaration {path}")
    archive_digest = tagged(data)
    manifest_digest = manifest_sha256(path)
    if exact.get("archive_manifest_sha256") != manifest_digest or exact.get("archive_manifest_match") != (archive_digest == manifest_digest): fail("E_ARCHIVE_MANIFEST", path)
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


def expected_union_declaration(existing: set[str], prefix_ids: set[str]) -> dict:
    prior = prefix_ids - UNRESEARCHED_PREFIX_ASSET_IDS
    return {"expected_unresolved_assets": 1792, "prior_research_asset_count": len(prior), "prior_research_asset_ids_sha256": tagged("\n".join(sorted(prior)).encode()), "unresearched_prefix_asset_count": 0, "unresearched_prefix_asset_ids": [], "unresearched_prefix_source_paths": [], "existing_union_count": len(existing), "pre_target_residual_unresolved_count": 1792 - len(existing), "new_target_count": 67, "post_batch_remaining_unresolved_count": 1792 - len(existing) - 67, "denominator_labels": {"existing_union": "existing_unresolved_union", "pre_target_residual": "pre_target_residual_unresolved", "new_target": "new_target", "post_batch_remaining": "post_batch_remaining_unresolved"}, "existing_prefixes": list(EXISTING_RESEARCH_PREFIXES), "wave_unresolved_assets": 64, "target_wave_overlap": 0, "legacy_prior_research_asset_count": len(prior), "legacy_existing_union_count": 227, "legacy_unresearched_prefix_asset_count": 53, "product_research_union_count": 429, "product_research_unresolved_union_count": 280, "initial_target_count": 120, "target_existing_research_overlap": 53}


def expected_overlap_reconciliation(initial_targets: set[str], product_union: dict[str, list[dict]], phase: dict[str, tuple[int, dict]]) -> dict:
    entries = []
    for asset_id in sorted(initial_targets & set(product_union)):
        source_path = phase[asset_id][1]["source_path"]
        source_sha256 = phase[asset_id][1].get("source_sha256")
        spec = EXPECTED_PROFILES[source_path]
        if any(r["source_path"] != source_path or r["source_sha256"] != source_sha256 for r in product_union[asset_id]):
            fail("E_PRODUCT_RESEARCH_UNION", asset_id)
        candidate_results = [{"bundle": r["bundle"], "category": r["category"], "candidate_products": r["candidate_products"]} for r in product_union[asset_id]]
        candidate_results.sort(key=lambda r: r["bundle"])
        same_candidate_result = all(r["category"] == spec["category"] and r["candidate_products"] == spec["products"] for r in candidate_results)
        entries.append({
            "asset_id": asset_id,
            "source_path": source_path,
            "source_sha256": "sha256:" + product_union[asset_id][0]["source_sha256"],
            "overlap_status": "same_source_same_candidate_result" if same_candidate_result else "same_source_different_candidate_result",
            "comparison_basis": "source_path_sha256_and_candidate_category_products",
            "method_identity_claimed": False,
            "research_scope": "existing_main_product_research_union",
            "evidence_completeness": "existing_bundle_static_evidence_present; candidate difference retained for human reconciliation",
            "bundle_revision": PRODUCT_RESEARCH_COMMIT,
            "denominator_role": "existing_research_union",
            "archive_provenance_ref": "archive_source_provenance:" + asset_id,
            "target_category": spec["category"],
            "target_products": spec["products"],
            "existing_candidate_results": candidate_results,
        })
    same = sum(e["overlap_status"] == "same_source_same_candidate_result" for e in entries)
    different = len(entries) - same
    return {
        "bundle_revision": PRODUCT_RESEARCH_COMMIT,
        "bundle_paths": list(PRODUCT_RESEARCH_BUNDLES),
        "union_count": len(product_union),
        "initial_target_count": len(initial_targets),
        "overlap_count": len(entries),
        "new_target_count": len(initial_targets) - len(entries),
        "candidate_result_comparison": "category_and_candidate_products_exact_equality; method_identity_not_claimed",
        "same_source_same_candidate_result_count": same,
        "same_source_different_candidate_result_count": different,
        "entries": entries,
    }

def check() -> None:
    try:
        subprocess.check_call(["git", "merge-base", "--is-ancestor", BASE_REVISION, "HEAD"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    except subprocess.CalledProcessError:
        fail("E_BASE_NOT_ANCESTOR", BASE_REVISION)
    inv = strict_json(INVENTORY.read_text(), str(INVENTORY))
    if not isinstance(inv, dict):
        fail("E_JSON", f"{INVENTORY}: top-level JSON object required")
    rows = []
    for n, line in enumerate(LEDGER.read_text().splitlines(), 1):
        if line.strip():
            row = strict_json(line, f"{LEDGER}:{n}")
            if not isinstance(row, dict):
                fail("E_JSON", f"{LEDGER}:{n}: top-level JSON object required")
            rows.append(row)
    binding = strict_json(BINDING_FILE.read_text(), str(BINDING_FILE))
    if not isinstance(binding, dict):
        fail("E_JSON", f"{BINDING_FILE}: top-level JSON object required")
    phase_list = read_jsonl(PHASE)
    phase = {r["asset_id"]: (n, r) for n, r in phase_list}
    disp = {r["asset_id"]: (n, r) for n, r in read_jsonl(DISPOSITION)}
    decisions = read_jsonl(DECISIONS)
    read_afters = read_jsonl(READ_AFTER)
    targets, wave_assets, existing = derive_targets(phase)
    product_union = product_research_union()
    legacy_existing = {a for a, (_, row) in phase.items() if row.get("product_classification_status") == "unresolved" and any(row.get("source_path", "").startswith(prefix) for prefix in EXISTING_RESEARCH_PREFIXES)} - UNRESEARCHED_PREFIX_ASSET_IDS | wave_assets
    initial_targets = set(a for a, (_, row) in phase.items() if row.get("product_classification_status") == "unresolved" and row.get("artifact_evidence_kind") == "implementation_source") - legacy_existing
    expected_overlap = expected_overlap_reconciliation(initial_targets, product_union, phase)
    if sorted(r.get("asset_id") for r in rows) != targets or len({r.get("asset_id") for r in rows}) != 67: fail("E_TARGET_SET", "ledger IDs")
    source_aliases = {}
    for row in rows:
        exact_source = row.get("source_exact")
        if not isinstance(exact_source, dict): fail("E_RECORD_SCHEMA", row.get("asset_id", ""))
        source_key = (row.get("source_path"), exact_source.get("sha256"))
        prior_asset = source_aliases.setdefault(source_key, row.get("asset_id"))
        if prior_asset != row.get("asset_id"): fail("E_SOURCE_ALIAS", f"{source_key}: {prior_asset}/{row.get('asset_id')}")
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
    prefix_ids_for_union = {a for a, (_, row) in phase.items() if row.get("product_classification_status") == "unresolved" and any(row.get("source_path", "").startswith(prefix) for prefix in EXISTING_RESEARCH_PREFIXES)}
    if inv.get("existing_research_union") != expected_union_declaration(existing, prefix_ids_for_union): fail("E_INVENTORY_DECLARATION", "research union")
    if inv.get("old_asset_source_mode") != "archive bytes are read through git show BASE:<archive-path>; never executed": fail("E_INVENTORY_DECLARATION", "source mode")
    if inv.get("existing_research_union", {}).get("existing_union_count") != 280 or inv.get("existing_research_union", {}).get("pre_target_residual_unresolved_count") != 1512 or inv.get("existing_research_union", {}).get("new_target_count") != 67 or inv.get("existing_research_union", {}).get("post_batch_remaining_unresolved_count") != 1445: fail("E_INVENTORY_DECLARATION", "denominator counts")
    if inv.get("product_research_union") != {
        "bundle_revision": PRODUCT_RESEARCH_COMMIT,
        "bundle_paths": list(PRODUCT_RESEARCH_BUNDLES),
        "union_count": 429,
        "unresolved_union_count": 280,
        "union_asset_ids_sha256": tagged("\n".join(sorted(product_union)).encode()),
        "bundle_input_count": 8,
        "bundle_inputs": [{"path": pth, "blob": git_blob_at(pth, PRODUCT_RESEARCH_COMMIT), "bytes": len(git_bytes_at(pth, PRODUCT_RESEARCH_COMMIT)), "sha256": tagged(git_bytes_at(pth, PRODUCT_RESEARCH_COMMIT))} for pth in PRODUCT_RESEARCH_BUNDLES],
    }: fail("E_PRODUCT_RESEARCH_UNION", "union declaration")
    if inv.get("overlap_reconciliation") != expected_overlap: fail("E_OVERLAP_RECONCILIATION", "overlap metadata")
    expected_archive_provenance = expected_archive_source_provenance(initial_targets, disp)
    if inv.get("archive_source_provenance") != expected_archive_provenance: fail("E_ARCHIVE_PROVENANCE", "initial target archive provenance")
    categories = Counter()
    expected_paths = set(EXPECTED_PROFILES)
    if not {phase[a][1]["source_path"] for a in targets} <= expected_paths: fail("E_REVIEW_PIN", "profile target paths")
    for row in rows:
        if set(row) != EXPECTED_RECORD_KEYS: fail("E_RECORD_SCHEMA", row.get("asset_id", ""))
        aid = row["asset_id"]
        if aid not in phase or aid not in disp: fail("E_TARGET_SET", aid)
        asset = disp[aid][1]
        path = asset["source_path"]
        expected = EXPECTED_PROFILES.get(path)
        if expected is None: fail("E_REVIEW_PIN", path)
        if row.get("source_path") != path: fail("E_SOURCE_ANCHOR", aid)
        expected_coverage = expected_record(aid, phase, disp, decisions, read_afters)["anchor_line_coverage"]
        if row.get("anchor_line_coverage") != expected_coverage: fail("E_ANCHOR_COVERAGE", aid)
        cls = row.get("classification", {})
        if set(cls) != EXPECTED_CLASSIFICATION_KEYS: fail("E_RECORD_SCHEMA", aid)
        check_category_invariant(cls, aid)
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
        check_category_invariant(cls, aid)
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
        # Full independent reconstruction closes the prior subset-comparison gap:
        # every nested key/value is derived from fixed BASE bytes and compared.
        expected_full = expected_record(aid, phase, disp, decisions, read_afters)
        if row != expected_full:
            if row.get("phase_evidence") != expected_full["phase_evidence"]: fail("E_PHASE_STATUS", aid)
            if row.get("source_exact") != expected_full["source_exact"]: fail("E_SOURCE_ANCHOR", aid)
            if row.get("classification") != expected_full["classification"]: fail("E_CLASSIFICATION", aid)
            if row.get("boundary_evidence") != expected_full["boundary_evidence"]: fail("E_BOUNDARY_ANCHOR", aid)
            if row.get("legacy_history_failure_consumer") != expected_full["legacy_history_failure_consumer"]: fail("E_HISTORY", aid)
            if row.get("legacy_implementation_shrinkage_evidence") != expected_full["legacy_implementation_shrinkage_evidence"]: fail("E_IMPLEMENTATION_EVIDENCE", aid)
            if row.get("anchor_line_coverage") != expected_full["anchor_line_coverage"]: fail("E_ANCHOR_COVERAGE", aid)
            fail("E_RECORD_SCHEMA", aid)
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
    expected_manifest_resolution = {
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
    }
    if inv.get("archive_manifest_resolution") != expected_manifest_resolution: fail("E_ARCHIVE_MANIFEST", "resolution declaration")
    expected_binding = expected_binding_upstream()
    if inv.get("binding_upstream") != {
        "policy": "all nonarchive input_digests and product research bundle inputs are Binding upstream; archive static references remain in inventory/records because SCF-OS-003 forbids archive upstream paths",
        "nonarchive_input_count": 63,
        "product_bundle_input_count": 8,
        "total_nonarchive_upstream_count": len(expected_binding),
        "archive_input_count": 121,
        "archive_upstream_count": 0,
        "archive_nonexecution_boundary": "archive source/runtime/test/CI is read through fixed BASE Git objects only and never executed",
    }: fail("E_BINDING_UPSTREAM", "binding upstream policy")
    if binding.get("id") != BINDING_ID or binding.get("upstream") != expected_binding: fail("E_BINDING_UPSTREAM", "path/raw SHA closure")
    global_inputs = [PHASE, DISPOSITION, DECISIONS, READ_AFTER, BOUNDARY, *L1.values(), FAILURE_SOURCE, CONSUMER_SOURCE, "docs/governance/legacy-asset-reuse-control.md", "docs/governance/new-generation-start-here.md", MANIFEST]
    expected_input_paths = [*WAVE_PATHS.values(), *global_inputs, *[ARCHIVE_PREFIX + phase[a][1]["source_path"] for a in sorted(initial_targets)]]
    paths = [x.get("path") for x in inv.get("input_digests", [])]
    if paths != expected_input_paths or len(paths) != len(set(paths)): fail("E_INPUT_DIGEST", "input path set/order")
    for item in inv["input_digests"]:
        if set(item) != EXPECTED_INPUT_DIGEST_KEYS: fail("E_INPUT_DIGEST", "input digest schema")
        b = git_bytes(item["path"])
        if item.get("blob") != git_blob(item["path"]) or item.get("bytes") != len(b) or item.get("sha256") != tagged(b): fail("E_INPUT_DIGEST", item.get("path", ""))
    if inv.get("output_sha256") != tagged(LEDGER.read_bytes()): fail("E_OUTPUT_DIGEST", "ledger")
    print(f"SCF-B-0126 validate: PASS records=67 categories={dict(sorted(categories.items()))} target_wave_edges=0 product_union=429 unresolved_existing_union=280 pre_target_residual=1512 new_target=67 post_batch_remaining=1445 overlap=53")


if __name__ == "__main__":
    check()

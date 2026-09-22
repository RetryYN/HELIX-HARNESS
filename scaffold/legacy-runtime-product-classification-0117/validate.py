#!/usr/bin/env python3
"""Independent fail-closed validator for SCF-B-0117 runtime research."""
from __future__ import annotations
import hashlib, json, subprocess
from collections import Counter, defaultdict
from functools import lru_cache
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BUNDLE = ROOT / "scaffold/legacy-runtime-product-classification-0117"
LEDGER = BUNDLE / "classification-research.jsonl"
INVENTORY = BUNDLE / "inventory.json"
BASE_REVISION = "5562f04da0f3205f9aa58205ec0d478419fc4f2e"
FIXED_BASE_REVISION = BASE_REVISION
BINDING_ID_FIXED = "SCF-B-0117"
ARCHIVE_PREFIX_FIXED = "archive/legacy-generation-2026-09-14/root/"
PHASE_FIXED = "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl"
DISPOSITION_FIXED = "docs/governance/legacy-asset-disposition.jsonl"
DECISIONS_FIXED = "docs/governance/legacy-asset-decisions.jsonl"
READ_AFTER_FIXED = "docs/governance/legacy-asset-copy-read-after.jsonl"
CROSSWALK_FIXED = "docs/governance/legacy-requirement-implementation-crosswalk-bootstrap.jsonl"
DECOMPOSITION_FIXED = "docs/governance/legacy-ir-product-unit-decomposition-bootstrap.jsonl"
BOUNDARY_FIXED = "docs/concept/product-boundary.md"
L1_FIXED = {"HELIX-HARNESS": "docs/helix-harness/L1-planning/product-intent.md", "HELIX-OS": "docs/helix-os/L1-planning/system-intent.md", "HELIX-Web": "docs/helix-web/L1-planning/product-intent.md", "HELIX-Web-OS": "docs/helix-web-os/L1-planning/system-intent.md"}
FAILURE_SOURCE_FIXED = "docs/governance/audits/source-rebaseline/legacy-ci-ai-runtime-source-inventory.md"
CONSUMER_SOURCE_FIXED = "docs/governance/audits/source-rebaseline/legacy-ci-consumer-relation-inventory.md"
WAVE_PATHS_FIXED = {n: (f"docs/governance/legacy-requirement-direct-semantic-review-wave{n}.jsonl" if n <= 36 else f"scaffold/legacy-semantic-review-wave{n}/legacy-requirement-direct-semantic-review-wave{n}.jsonl") for n in range(1, 51)}
GLOBAL_INPUTS_FIXED = [PHASE_FIXED, DISPOSITION_FIXED, DECISIONS_FIXED, READ_AFTER_FIXED, CROSSWALK_FIXED, DECOMPOSITION_FIXED, BOUNDARY_FIXED, *L1_FIXED.values(), FAILURE_SOURCE_FIXED, CONSUMER_SOURCE_FIXED, "docs/governance/legacy-asset-decision-log.md", "docs/governance/legacy-asset-reuse-control.md", "docs/governance/new-generation-start-here.md", "archive/legacy-generation-2026-09-14/MANIFEST.sha256"]
PRODUCTS = ("HELIX-HARNESS", "HELIX-OS", "HELIX-Web", "HELIX-Web-OS")
BOUNDARY_RANGES_FIXED = {"HELIX-HARNESS": [(36, 36), (54, 61), (86, 89)], "HELIX-OS": [(37, 37), (55, 65), (86, 89)], "HELIX-Web": [(38, 38), (56, 56), (63, 70)], "HELIX-Web-OS": [(39, 39), (57, 57), (63, 70)]}
L1_RANGES_FIXED = {"HELIX-HARNESS": [(22, 24), (54, 58)], "HELIX-OS": [(22, 25), (59, 63)], "HELIX-Web": [(24, 26), (47, 49)], "HELIX-Web-OS": [(14, 15), (39, 44)]}
FAILURE_RANGES_FIXED = [(17, 23), (52, 63)]
CONSUMER_RANGES_FIXED = [(24, 36), (38, 50)]
EXPECTED_NEGATIVE_CASES = ['target_record_omission', 'target_record_duplicate', 'edge_omission', 'edge_duplicate', 'source_digest_tamper', 'source_anchor_tamper', 'source_profile_tamper', 'candidate_product_tamper', 'classification_category_tamper', 'semantic_review_tamper', 'boundary_digest_tamper', 'input_digest_omission', 'input_digest_duplicate', 'input_digest_extra_path', 'authority_promotion', 'record_top_level_extra_key', 'source_read_mode_tamper', 'inventory_authority_promotion', 'inventory_scope_tamper', 'inventory_formal_update_tamper', 'inventory_classification_rule_tamper', 'inventory_counts_artifact_kind_tamper', 'inventory_edge_count_tamper', 'fixed_BASE_non_ancestor', 'generator_review_spec_tamper', 'generator_anchor_tamper', 'generator_l1_tamper', 'base_pin_tamper', 'base_source_missing', 'history_tamper', 'human_judgment_tamper', 'input_digest_value_tamper', 'inventory_negative_case_tamper', 'output_digest_tamper', 'phase_status_tamper', 'source_line_range_tamper', 'inventory_overlap_tamper']
RECORD_KEYS = frozenset({"artifact_evidence_kinds", "asset_id", "asset_ledger", "authority_effect", "boundary_evidence", "candidate_products", "classification_category", "classification_reason", "classification_state", "failure_consumer_static_refs", "formal_asset_classification_updated", "human_judgment_remaining", "l1_evidence", "legacy_history_failure_consumer", "manual_semantic_review", "new_build_allowed", "observed_wave_products", "phase_ledger", "semantic_link_statuses", "source_exact", "source_profile", "unit_product_candidates", "wave_semantic_links"})
SOURCE_KEYS = frozenset({"archive_path", "blob", "bytes", "ledger_source_sha256", "line_count", "read_mode", "semantic_anchors", "sha256", "source_path"})
# Fixed BASE semantic review pins are independent of generate.py.  Generator
# table/anchor/L1 mutations followed by regeneration must fail against these.
PINNED_REVIEWS = {'LEGACY-ASSET-005BC4871A50775F70D9': {'category': 'direct_product_basis',
                                       'end': 243,
                                       'name': 'upstream-adoption',
                                       'products': ['HELIX-OS'],
                                       'reason': 'The governance pack classifies provenance, consumer CLI resolution, green evidence and distribution curation with fail-close decisions; this is OS '
                                                 'upstream control.',
                                       'start': 174},
 'LEGACY-ASSET-03809A409B394AB2A6A0': {'category': 'multi_product_conflict',
                                       'end': 652,
                                       'name': 'summary-surface-audit',
                                       'products': ['HELIX-HARNESS', 'HELIX-OS'],
                                       'reason': 'The audit checks semantic requirement fields and workflow-route commands while also exposing operational doctor/status projections; presentation '
                                                 'contract and OS state projection compete.',
                                       'start': 576},
 'LEGACY-ASSET-04F72C685179FF8BD977': {'category': 'direct_product_basis',
                                       'end': 325,
                                       'name': 'issue-hierarchy',
                                       'products': ['HELIX-OS'],
                                       'reason': 'The audit projects issue hierarchy/dependency relations and detects native graph drift and closure inconsistencies; this is OS governance state '
                                                 'projection.',
                                       'start': 244},
 'LEGACY-ASSET-056CA8C741C37F80F010': {'category': 'insufficient_basis',
                                       'end': 59,
                                       'name': 'run-debug',
                                       'products': [],
                                       'reason': 'The source appends a runtime verification log event, but this narrow log port does not establish the product contract that consumes it.',
                                       'start': 43},
 'LEGACY-ASSET-0659C4937EA6463385A0': {'category': 'direct_product_basis',
                                       'end': 292,
                                       'name': 'git-command-guard-hook',
                                       'products': ['HELIX-OS'],
                                       'reason': 'The hook parses a command, consults guard override evidence and records an audit before permitting destructive Git mutation; this is OS mutation '
                                                 'authority.',
                                       'start': 193},
 'LEGACY-ASSET-0E2E02992D58E7F38342': {'category': 'direct_product_basis',
                                       'end': 247,
                                       'name': 'project-hook-authority',
                                       'products': ['HELIX-OS'],
                                       'reason': 'The authority resolver validates root identity, source material, assignment binding and lifecycle policy, returning typed stale/unavailable '
                                                 'failures; this is OS hook authority.',
                                       'start': 183},
 'LEGACY-ASSET-0F431CE7CE360BCBB909': {'category': 'multi_product_conflict',
                                       'end': 486,
                                       'name': 'independent-review-fallback',
                                       'products': ['HELIX-HARNESS', 'HELIX-OS'],
                                       'reason': 'The source selects and persists an independent review provider and sandbox fallback; review admission is HARNESS-facing while provider '
                                                 'process/sandbox authority is OS-facing.',
                                       'start': 415},
 'LEGACY-ASSET-11897227DA713AD4F8D9': {'category': 'direct_product_basis',
                                       'end': 230,
                                       'name': 'resident-lane-assignment',
                                       'products': ['HELIX-OS'],
                                       'reason': 'The projection validates resident lane assignment state and review/takeover returns, preserving typed failure codes; this is OS worker lane '
                                                 'authority.',
                                       'start': 126},
 'LEGACY-ASSET-188DE92635DFB97B0200': {'category': 'direct_product_basis',
                                       'end': 122,
                                       'name': 'review-lane-closure',
                                       'products': ['HELIX-HARNESS'],
                                       'reason': 'The manifest binds review-lane source closure and provider material to a digest, so admission concerns the reviewed implementation surface; this is '
                                                 'HARNESS review closure.',
                                       'start': 70},
 'LEGACY-ASSET-1990CEECA06542AB596E': {'category': 'direct_product_basis',
                                       'end': 320,
                                       'name': 'physical-filesystem-identity',
                                       'products': ['HELIX-OS'],
                                       'reason': 'The evaluator binds realpath/device/inode and no-follow file identity before mutation, rejecting symlink or target drift; this is OS filesystem '
                                                 'safety.',
                                       'start': 231},
 'LEGACY-ASSET-19A610B205CBDA47E56C': {'category': 'multi_product_conflict',
                                       'end': 65,
                                       'name': 'parallel-candidate-verifier-council',
                                       'products': ['HELIX-HARNESS', 'HELIX-OS'],
                                       'reason': 'The council aggregates candidate verification findings and provider evidence; verification decision belongs to HARNESS but runtime/provider quorum '
                                                 'belongs to OS.',
                                       'start': 29},
 'LEGACY-ASSET-1BCE113F756891A391B5': {'category': 'direct_product_basis',
                                       'end': 274,
                                       'name': 'secret-egress-hook',
                                       'products': ['HELIX-OS'],
                                       'reason': 'The hook scans write/Git egress inputs for secret material and blocks without emitting raw values; this is OS security egress control.',
                                       'start': 195},
 'LEGACY-ASSET-1D6DB6DC80D2AC0703DF': {'category': 'direct_product_basis',
                                       'end': 473,
                                       'name': 'forward-plan-authoring-transaction',
                                       'products': ['HELIX-HARNESS'],
                                       'reason': 'The transaction validates and authors a forward plan against an open-branch reservation and emits plan identity evidence; this is HARNESS plan '
                                                 'authoring control.',
                                       'start': 384},
 'LEGACY-ASSET-2631E318C16FC44D5CBB': {'category': 'insufficient_basis',
                                       'end': 6,
                                       'name': 'sqlite-error',
                                       'products': [],
                                       'reason': 'The source normalizes SQLite busy/locked error text only; the utility has no product-specific responsibility evidence.',
                                       'start': 2},
 'LEGACY-ASSET-2ABC963F7A0266EF9F34': {'category': 'direct_product_basis',
                                       'end': 87,
                                       'name': 'detect',
                                       'products': ['HELIX-OS'],
                                       'reason': 'The source detects available runtime providers and derives judgment-gate next action, requiring human review when independent runtime evidence is '
                                                 'absent; this is OS runtime coordination.',
                                       'start': 53},
 'LEGACY-ASSET-3705801CEFFE5E9A650A': {'category': 'direct_product_basis',
                                       'end': 442,
                                       'name': 'event-projection-checkpoint-replay',
                                       'products': ['HELIX-OS'],
                                       'reason': 'The replay evaluator checks append-only event causal order, idempotent ingest, projection drift and checkpoint recovery; this is OS state projection '
                                                 'integrity.',
                                       'start': 395},
 'LEGACY-ASSET-378CB2CCCD11F9A49502': {'category': 'direct_product_basis',
                                       'end': 156,
                                       'name': 'provider-process-lifecycle',
                                       'products': ['HELIX-OS'],
                                       'reason': 'The classifier admits provider success only after deadline, signal and process-tree conditions are satisfied, preventing exit-zero false success; '
                                                 'this is OS provider lifecycle control.',
                                       'start': 67},
 'LEGACY-ASSET-3D00C8AE4485F9A73BC4': {'category': 'direct_product_basis',
                                       'end': 124,
                                       'name': 'review-guard',
                                       'products': ['HELIX-HARNESS'],
                                       'reason': 'The assessment detects working-tree mutations during read-only delegated review and summarizes staged review changes; the source explicitly protects '
                                                 'the HARNESS review role boundary.',
                                       'start': 82},
 'LEGACY-ASSET-54BC82E959CE2AC7C7DC': {'category': 'insufficient_basis',
                                       'end': 367,
                                       'name': 'lint-effect-executor',
                                       'products': [],
                                       'reason': 'The source executes probe/materialize effects under digest and authorization checks, but the generic lint effect port does not by itself establish '
                                                 'product ownership.',
                                       'start': 298},
 'LEGACY-ASSET-5744016467850DE3A937': {'category': 'direct_product_basis',
                                       'end': 345,
                                       'name': 'windows-lite-canary-admission',
                                       'products': ['HELIX-OS'],
                                       'reason': 'The queue/lease/completion evaluators bind policy, Linux artifact digest, profile digest and canary receipts; this is OS platform admission.',
                                       'start': 281},
 'LEGACY-ASSET-62F229FEA91354E5AFC2': {'category': 'direct_product_basis',
                                       'end': 145,
                                       'name': 'author-runtime-evidence',
                                       'products': ['HELIX-OS'],
                                       'reason': 'The function parses GitHub author evidence and attests whether a change came from Claude, Codex, mixed or external automation with fail-closed '
                                                 'missing evidence; this is OS runtime identity control.',
                                       'start': 119},
 'LEGACY-ASSET-6C10AEB57D40C1F87EDD': {'category': 'direct_product_basis',
                                       'end': 100,
                                       'name': 'harness-taxonomy-curation-policy',
                                       'products': ['HELIX-HARNESS'],
                                       'reason': 'The report curates external sources into explicit HARNESS taxonomy families and rejects unverified or risky entries; the source names the Harness '
                                                 'taxonomy contract and implements its review rules.',
                                       'start': 49},
 'LEGACY-ASSET-6E877985485265009C94': {'category': 'direct_product_basis',
                                       'end': 62,
                                       'name': 'document-change-report',
                                       'products': ['HELIX-HARNESS'],
                                       'reason': 'The function builds a deterministic document change report with changed paths, semantic counts and digests; this supports HARNESS design and '
                                                 'requirement review trace.',
                                       'start': 18},
 'LEGACY-ASSET-6FFF5231508FD86DF72D': {'category': 'direct_product_basis',
                                       'end': 235,
                                       'name': 'project-hook-authority-envelope',
                                       'products': ['HELIX-OS'],
                                       'reason': 'The envelope verifies transport schema, source material and root identity before resolving project hook authority; this is OS authority transport.',
                                       'start': 174},
 'LEGACY-ASSET-70ECD1B2070D140F5260': {'category': 'multi_product_conflict',
                                       'end': 91,
                                       'name': 'constitution-template-stack',
                                       'products': ['HELIX-HARNESS', 'HELIX-OS'],
                                       'reason': 'The source resolves core/role/preset/project policy templates and reports override findings; template/design contract is HARNESS-facing while '
                                                 'project authority resolution is OS-facing.',
                                       'start': 37},
 'LEGACY-ASSET-7416102E3368E3D45C60': {'category': 'direct_product_basis',
                                       'end': 108,
                                       'name': 'cursor-cloud-run-authority',
                                       'products': ['HELIX-OS'],
                                       'reason': 'The classifier and follow-up decisions bind Cursor cloud run state, terminal status and read-after evidence; this is OS external-provider run '
                                                 'authority.',
                                       'start': 47},
 'LEGACY-ASSET-7481F54819EC67D6C940': {'category': 'direct_product_basis',
                                       'end': 129,
                                       'name': 'work-guard-hook',
                                       'products': ['HELIX-OS'],
                                       'reason': 'The hook collects stdin, Git/session state and one-shot foreign-edit overrides, blocking unverifiable worktree ownership; this is OS work-safety '
                                                 'control.',
                                       'start': 45},
 'LEGACY-ASSET-74E9B73BFADA4F637023': {'category': 'direct_product_basis',
                                       'end': 35,
                                       'name': 'project-hook-authority-surface-projector',
                                       'products': ['HELIX-OS'],
                                       'reason': 'The projector copies one resolved receipt/failure byte surface across session, doctor, status and dispatch without recomputing authority; this is OS '
                                                 'state projection.',
                                       'start': 22},
 'LEGACY-ASSET-77A70068271118050C5F': {'category': 'direct_product_basis',
                                       'end': 625,
                                       'name': 'event-projection-checkpoint-transaction',
                                       'products': ['HELIX-OS'],
                                       'reason': 'The transaction appends an orchestration event, updates projection state and rebuilds/readbacks checkpoint data with rollback failure codes; this is '
                                                 'OS durable state management.',
                                       'start': 508},
 'LEGACY-ASSET-80284B17A3D619B38B02': {'category': 'insufficient_basis',
                                       'end': 87,
                                       'name': 'extension-preset-bundle-registry',
                                       'products': [],
                                       'reason': 'The source validates extension/preset bundle metadata, but catalog records alone do not establish HARNESS, OS or end-product ownership.',
                                       'start': 43},
 'LEGACY-ASSET-8103CB72D521BA20508A': {'category': 'insufficient_basis',
                                       'end': 115,
                                       'name': 'lint-artifact-write-port',
                                       'products': [],
                                       'reason': 'The source writes lint artifacts through a durable port, but the generic write boundary is shared infrastructure and lacks product-specific contract '
                                                 'evidence.',
                                       'start': 73},
 'LEGACY-ASSET-8990109AFE59ED987AAD': {'category': 'direct_product_basis',
                                       'end': 333,
                                       'name': 'machine-safety-guard',
                                       'products': ['HELIX-OS'],
                                       'reason': 'The classifier blocks broad, dynamic, host-destructive and interpreter deletion operations while permitting a proven single-file case; this is OS '
                                                 'machine safety.',
                                       'start': 271},
 'LEGACY-ASSET-8E94EB9298BDD0A9C52E': {'category': 'direct_product_basis',
                                       'end': 108,
                                       'name': 'isolated-worktree-sandbox-runner',
                                       'products': ['HELIX-OS'],
                                       'reason': 'The plan fixes worktree/sandbox identity, writable paths, and cleanup evidence for isolated provider work; this is OS worker isolation.',
                                       'start': 56},
 'LEGACY-ASSET-8F7D49723BBFDCB671F3': {'category': 'direct_product_basis',
                                       'end': 109,
                                       'name': 'project-hook-assignment-provider',
                                       'products': ['HELIX-OS'],
                                       'reason': 'The provider captures project hook authority input through an explicit physical adapter and returns unavailable rather than inventing authority; '
                                                 'this is OS hook authority.',
                                       'start': 70},
 'LEGACY-ASSET-9239582BF077143F3BE7': {'category': 'direct_product_basis',
                                       'end': 182,
                                       'name': 'hosted-preflight',
                                       'products': ['HELIX-OS'],
                                       'reason': 'The preflight validates hosted adapter parity and refuses an unproven surface before operation; this is OS execution-surface safety.',
                                       'start': 136},
 'LEGACY-ASSET-943484807D702E10503B': {'category': 'direct_product_basis',
                                       'end': 161,
                                       'name': 'review-receipt-plan-binding',
                                       'products': ['HELIX-HARNESS'],
                                       'reason': 'The evaluator joins review receipts to changed plans, rejects terminal promotion and checks evidence availability; this is HARNESS plan/review '
                                                 'admission.',
                                       'start': 84},
 'LEGACY-ASSET-9A7879BDE021D95B23A8': {'category': 'direct_product_basis',
                                       'end': 97,
                                       'name': 'project-hook-authority-consumer',
                                       'products': ['HELIX-OS'],
                                       'reason': 'The consumer admits dispatch only from a resolved hook authority surface and preserves failure receipts; this is OS execution authority.',
                                       'start': 83},
 'LEGACY-ASSET-9C454F2D93A8F34BD997': {'category': 'insufficient_basis',
                                       'end': 34,
                                       'name': 'digest',
                                       'products': [],
                                       'reason': 'The source provides locale-independent byte ordering only; a utility primitive has no direct product-responsibility evidence.',
                                       'start': 21},
 'LEGACY-ASSET-A098EACAF07A5848E6B1': {'category': 'direct_product_basis',
                                       'end': 354,
                                       'name': 'atomic-slice-admission',
                                       'products': ['HELIX-HARNESS'],
                                       'reason': 'The evaluator admits or splits an atomic change slice, checks scope expansion and blocker evidence, and returns a design/no-code decision; this is '
                                                 'HARNESS change-scope and design admission behavior.',
                                       'start': 273},
 'LEGACY-ASSET-A1918FF3AB1C2FC43DD2': {'category': 'direct_product_basis',
                                       'end': 152,
                                       'name': 'claude-unanswered-review-detector',
                                       'products': ['HELIX-HARNESS'],
                                       'reason': 'The detector matches review requests to independent receipt responses and reports unanswered review obligations; this is HARNESS review convergence '
                                                 'evidence.',
                                       'start': 83},
 'LEGACY-ASSET-A261EDD8340978C36E85': {'category': 'direct_product_basis',
                                       'end': 219,
                                       'name': 'full-regression-shards',
                                       'products': ['HELIX-HARNESS'],
                                       'reason': 'The validator checks regression shard scope, required cells, base head and receipt evidence; this is HARNESS verification-plan admission.',
                                       'start': 150},
 'LEGACY-ASSET-A29A0AB597D503A96126': {'category': 'direct_product_basis',
                                       'end': 600,
                                       'name': 'git-command-guard',
                                       'products': ['HELIX-OS'],
                                       'reason': 'The pure guard classifies destructive Git and GitHub lifecycle commands, blocks cross-runtime history damage and requires a reasoned override; this '
                                                 'is OS safety control.',
                                       'start': 515},
 'LEGACY-ASSET-A52E28E25240059292CA': {'category': 'direct_product_basis',
                                       'end': 103,
                                       'name': 'skill-efficacy-evaluation',
                                       'products': ['HELIX-HARNESS'],
                                       'reason': 'The report compares with-skill and without-skill evidence and requires reproducible grading artifacts; this is HARNESS process-efficacy evaluation.',
                                       'start': 50},
 'LEGACY-ASSET-A5A9E2A2B0F2FCDDAA37': {'category': 'direct_product_basis',
                                       'end': 55,
                                       'name': 'repo-wide-guard-runner',
                                       'products': ['HELIX-HARNESS'],
                                       'reason': 'The runner discovers and loads repository-wide guard tests marked by the explicit harness marker; this is HARNESS verification surface discovery.',
                                       'start': 14},
 'LEGACY-ASSET-A9457783A0DD4C3BC8BF': {'category': 'direct_product_basis',
                                       'end': 106,
                                       'name': 'artifact-convergence-analyzer',
                                       'products': ['HELIX-HARNESS'],
                                       'reason': 'The report body compares design, test, plan, code and task artifacts, emits convergence findings, and creates actionable source-linked tasks; the '
                                                 'reviewed behavior is a HARNESS V-model artifact convergence contract.',
                                       'start': 52},
 'LEGACY-ASSET-AADAA0185060BAAD6ED3': {'category': 'multi_product_conflict',
                                       'end': 440,
                                       'name': 'work-graph-receipt-acceptance',
                                       'products': ['HELIX-HARNESS', 'HELIX-OS'],
                                       'reason': 'The source orders delegation/parent acceptance receipts and verifies worker independent-review capability; work-graph admission is HARNESS-facing '
                                                 'while worker/lane capability is OS-facing.',
                                       'start': 363},
 'LEGACY-ASSET-AAFCC2AFDF5341BE272B': {'category': 'direct_product_basis',
                                       'end': 96,
                                       'name': 'closure-evidence-probe-context',
                                       'products': ['HELIX-OS'],
                                       'reason': 'The evaluator checks repository identity, HEAD, clean status and matching worktree before a closure probe; this is OS execution-context authority.',
                                       'start': 42},
 'LEGACY-ASSET-AC2078FFF049D6B56D19': {'category': 'multi_product_conflict',
                                       'end': 901,
                                       'name': 'claude-pr-convergence',
                                       'products': ['HELIX-HARNESS', 'HELIX-OS'],
                                       'reason': 'The source validates independent review receipt and author-runtime attestation: the review/acceptance contract is HARNESS-facing while runtime '
                                                 'identity and GitHub evidence are OS-facing, so one owner cannot be inferred.',
                                       'start': 807},
 'LEGACY-ASSET-AF851B7714F4CF28BAC6': {'category': 'direct_product_basis',
                                       'end': 134,
                                       'name': 'source-content-mirror-completeness',
                                       'products': ['HELIX-OS'],
                                       'reason': 'The report checks repository refs, default tree/content digests, chunk completeness and resumable mirror failures; this is OS source-state '
                                                 'projection control.',
                                       'start': 53},
 'LEGACY-ASSET-B2F20C4B9B906D64ABE7': {'category': 'direct_product_basis',
                                       'end': 63,
                                       'name': 'machine-safety-guard-hook',
                                       'products': ['HELIX-OS'],
                                       'reason': 'The hook resolves interpreter scripts and applies the machine safety classifier before shell execution, failing closed on unverifiable inputs; this '
                                                 'is OS host-safety control.',
                                       'start': 18},
 'LEGACY-ASSET-B89E68FDA8828A31C2CC': {'category': 'insufficient_basis',
                                       'end': 88,
                                       'name': 'lint-probe-adapter',
                                       'products': [],
                                       'reason': 'The source adapts a bounded probe process, but command execution transport is shared infrastructure without a product-boundary proof.',
                                       'start': 55},
 'LEGACY-ASSET-BCB2A97BC83FB76A5299': {'category': 'direct_product_basis',
                                       'end': 86,
                                       'name': 'lane-hygiene',
                                       'products': ['HELIX-OS'],
                                       'reason': 'The inspector parses worktree porcelain and checks lane cleanliness against a base; this is OS lane and worktree hygiene.',
                                       'start': 50},
 'LEGACY-ASSET-C1D2CD1AD08E4795DDA7': {'category': 'multi_product_conflict',
                                       'end': 318,
                                       'name': 'preflight-gate-aggregation',
                                       'products': ['HELIX-HARNESS', 'HELIX-OS'],
                                       'reason': 'The aggregator joins repository/design preflight gates with runtime/adapter observations and fail-close outcomes; both V-model admission and '
                                                 'operational execution boundaries are present.',
                                       'start': 244},
 'LEGACY-ASSET-C3E8F2E627FF65D14D40': {'category': 'multi_product_conflict',
                                       'end': 80,
                                       'name': 'cross-repo-spec-store',
                                       'products': ['HELIX-HARNESS', 'HELIX-OS'],
                                       'reason': 'The source checks consuming plan/spec artifact binding and pinned refs while also deciding trusted cross-repository synchronization; plan evidence '
                                                 'and operational authority remain in conflict.',
                                       'start': 38},
 'LEGACY-ASSET-C9F2BAEB228B54A70B30': {'category': 'direct_product_basis',
                                       'end': 87,
                                       'name': 'state-machine-tool-policy',
                                       'products': ['HELIX-OS'],
                                       'reason': 'The report applies hard/advisory/unsupported tool policy to a state-machine request and fails on forbidden transitions; this is OS runtime policy.',
                                       'start': 30},
 'LEGACY-ASSET-CA75125CF4AF556C8AFE': {'category': 'direct_product_basis',
                                       'end': 227,
                                       'name': 'helix-bench-task-dataset',
                                       'products': ['HELIX-HARNESS'],
                                       'reason': 'The validator checks benchmark tasks across Requirement Binding, Design Trace, Controlled Implementation and Review Convergence with fixture and '
                                                 'acceptance digests; this is HARNESS V-model evaluation.',
                                       'start': 158},
 'LEGACY-ASSET-CB54A21D333CCCF28C2F': {'category': 'direct_product_basis',
                                       'end': 276,
                                       'name': 'forced-stop',
                                       'products': ['HELIX-OS'],
                                       'reason': 'The scanner records forced-stop/session evidence and produces recovery proposals without exposing raw text; this is OS runtime interruption and '
                                                 'recovery control.',
                                       'start': 233},
 'LEGACY-ASSET-CB77EEC105E86D91D3D4': {'category': 'direct_product_basis',
                                       'end': 198,
                                       'name': 'worktree-state',
                                       'products': ['HELIX-OS'],
                                       'reason': 'The state resolver combines Git porcelain, session touched files and target worktree identity before evaluating an edit; this is OS worktree '
                                                 'authority.',
                                       'start': 104},
 'LEGACY-ASSET-CE2CFBC3F1D10851A80F': {'category': 'direct_product_basis',
                                       'end': 152,
                                       'name': 'work-guard',
                                       'products': ['HELIX-OS'],
                                       'reason': "The pure guard blocks edits to another runtime's uncommitted files and requires evidence-backed override; this is OS shared-worktree safety.",
                                       'start': 71},
 'LEGACY-ASSET-D12276F3EFCECCAF6BCE': {'category': 'insufficient_basis',
                                       'end': 87,
                                       'name': 'stable-cause-digest',
                                       'products': [],
                                       'reason': 'The source creates privacy-safe error cause digests, but generic diagnostic normalization does not establish a product owner.',
                                       'start': 52},
 'LEGACY-ASSET-D3024F31E935199C0F12': {'category': 'direct_product_basis',
                                       'end': 46,
                                       'name': 'git-argument-boundary',
                                       'products': ['HELIX-OS'],
                                       'reason': 'The functions reject unsafe remote and revision arguments before Git transport interpretation; this is OS command boundary safety.',
                                       'start': 12},
 'LEGACY-ASSET-D6685205557CA51A9C36': {'category': 'direct_product_basis',
                                       'end': 295,
                                       'name': 'runtime-capability-matrix',
                                       'products': ['HELIX-OS'],
                                       'reason': 'The route evaluator compares requested capability with runtime support and returns a bounded route decision; this is OS runtime capability '
                                                 'governance.',
                                       'start': 248},
 'LEGACY-ASSET-D91666F646834FF23D1A': {'category': 'direct_product_basis',
                                       'end': 73,
                                       'name': 'guard-override-transaction',
                                       'products': ['HELIX-OS'],
                                       'reason': 'The transaction consumes a one-shot override marker and commits an auditable guard-block classification, preventing replay; this is OS guard '
                                                 'authority.',
                                       'start': 43},
 'LEGACY-ASSET-DAC14BD5812CD0847F72': {'category': 'direct_product_basis',
                                       'end': 149,
                                       'name': 'forward-reverse-terminal-reservation',
                                       'products': ['HELIX-HARNESS'],
                                       'reason': 'The function reserves a forward/reverse terminal pair and validates the plan contract and terminal evidence; this is HARNESS V-model plan terminal '
                                                 'binding.',
                                       'start': 80},
 'LEGACY-ASSET-DD75DA8ECC15CD756777': {'category': 'direct_product_basis',
                                       'end': 51,
                                       'name': 'project-hook-authority-provider',
                                       'products': ['HELIX-OS'],
                                       'reason': 'The provider consumes explicit authority input and returns an unavailable result when it cannot be supplied, avoiding ambient inference; this is OS '
                                                 'authority control.',
                                       'start': 40},
 'LEGACY-ASSET-DF4F7AD0127375C31C07': {'category': 'direct_product_basis',
                                       'end': 98,
                                       'name': 'security-credential-egress-guard',
                                       'products': ['HELIX-OS'],
                                       'reason': 'The report evaluates offline/allowlist egress policy and credential-bearing activation, returning typed findings; this is OS security boundary '
                                                 'control.',
                                       'start': 41},
 'LEGACY-ASSET-E4CD3DA31B73501A05DF': {'category': 'direct_product_basis',
                                       'end': 93,
                                       'name': 'change-package-delta-archive',
                                       'products': ['HELIX-HARNESS'],
                                       'reason': 'The report checks plan design/test deltas, rollback path and evidence digest before archiving a change package; this is HARNESS controlled change '
                                                 'evidence.',
                                       'start': 46},
 'LEGACY-ASSET-E6B0919504EF52342FCB': {'category': 'direct_product_basis',
                                       'end': 173,
                                       'name': 'document-semantic-diff',
                                       'products': ['HELIX-HARNESS'],
                                       'reason': 'The diff compares document snapshots and reports added, removed and changed semantic records with stable digests; this is HARNESS document trace and '
                                                 'review evidence.',
                                       'start': 122},
 'LEGACY-ASSET-E9D11CEAEA7EE4720211': {'category': 'direct_product_basis',
                                       'end': 133,
                                       'name': 'project-hook-physical-adapter',
                                       'products': ['HELIX-OS'],
                                       'reason': 'The adapter reads physical repository identity, configured source material and hook authority input for the resolver; this is OS physical authority '
                                                 'capture.',
                                       'start': 108},
 'LEGACY-ASSET-EDC29797436934B734FD': {'category': 'insufficient_basis',
                                       'end': 5,
                                       'name': 'issue-closure-graph',
                                       'products': [],
                                       'reason': 'The source is a compatibility tombstone pointing to a lint owner; no runtime responsibility remains to classify.',
                                       'start': 1},
 'LEGACY-ASSET-F3DD5EBFD553A3B9A740': {'category': 'direct_product_basis',
                                       'end': 314,
                                       'name': 'open-branch-plan-identity-reservation',
                                       'products': ['HELIX-HARNESS'],
                                       'reason': 'The projection validates open-branch plan identity reservations, terminal evidence and plan IDs; it binds plan lifecycle evidence in the HARNESS '
                                                 'authoring layer.',
                                       'start': 243},
 'LEGACY-ASSET-FD595ADFDF0375614AFB': {'category': 'insufficient_basis',
                                       'end': 130,
                                       'name': 'document-report-write-port',
                                       'products': [],
                                       'reason': 'The source validates a report write path and receipt, but generic artifact I/O does not identify whether the consuming contract is HARNESS or OS.',
                                       'start': 89},
 'LEGACY-ASSET-FFAC21BE2BDCF034C1D7': {'category': 'insufficient_basis',
                                       'end': 9,
                                       'name': 'autonomous-loop-run-receipts',
                                       'products': [],
                                       'reason': 'The source is an explicit relocation tombstone with no runtime behavior; it preserves a dependency-direction history but cannot establish a current '
                                                 'product boundary.',
                                       'start': 1}}
EXPECTED_TARGET_IDS = ('LEGACY-ASSET-005BC4871A50775F70D9', 'LEGACY-ASSET-03809A409B394AB2A6A0', 'LEGACY-ASSET-04F72C685179FF8BD977', 'LEGACY-ASSET-056CA8C741C37F80F010', 'LEGACY-ASSET-0659C4937EA6463385A0', 'LEGACY-ASSET-0E2E02992D58E7F38342', 'LEGACY-ASSET-0F431CE7CE360BCBB909', 'LEGACY-ASSET-11897227DA713AD4F8D9', 'LEGACY-ASSET-188DE92635DFB97B0200', 'LEGACY-ASSET-1990CEECA06542AB596E', 'LEGACY-ASSET-19A610B205CBDA47E56C', 'LEGACY-ASSET-1BCE113F756891A391B5', 'LEGACY-ASSET-1D6DB6DC80D2AC0703DF', 'LEGACY-ASSET-2631E318C16FC44D5CBB', 'LEGACY-ASSET-2ABC963F7A0266EF9F34', 'LEGACY-ASSET-3705801CEFFE5E9A650A', 'LEGACY-ASSET-378CB2CCCD11F9A49502', 'LEGACY-ASSET-3D00C8AE4485F9A73BC4', 'LEGACY-ASSET-54BC82E959CE2AC7C7DC', 'LEGACY-ASSET-5744016467850DE3A937', 'LEGACY-ASSET-62F229FEA91354E5AFC2', 'LEGACY-ASSET-6C10AEB57D40C1F87EDD', 'LEGACY-ASSET-6E877985485265009C94', 'LEGACY-ASSET-6FFF5231508FD86DF72D', 'LEGACY-ASSET-70ECD1B2070D140F5260', 'LEGACY-ASSET-7416102E3368E3D45C60', 'LEGACY-ASSET-7481F54819EC67D6C940', 'LEGACY-ASSET-74E9B73BFADA4F637023', 'LEGACY-ASSET-77A70068271118050C5F', 'LEGACY-ASSET-80284B17A3D619B38B02', 'LEGACY-ASSET-8103CB72D521BA20508A', 'LEGACY-ASSET-8990109AFE59ED987AAD', 'LEGACY-ASSET-8E94EB9298BDD0A9C52E', 'LEGACY-ASSET-8F7D49723BBFDCB671F3', 'LEGACY-ASSET-9239582BF077143F3BE7', 'LEGACY-ASSET-943484807D702E10503B', 'LEGACY-ASSET-9A7879BDE021D95B23A8', 'LEGACY-ASSET-9C454F2D93A8F34BD997', 'LEGACY-ASSET-A098EACAF07A5848E6B1', 'LEGACY-ASSET-A1918FF3AB1C2FC43DD2', 'LEGACY-ASSET-A261EDD8340978C36E85', 'LEGACY-ASSET-A29A0AB597D503A96126', 'LEGACY-ASSET-A52E28E25240059292CA', 'LEGACY-ASSET-A5A9E2A2B0F2FCDDAA37', 'LEGACY-ASSET-A9457783A0DD4C3BC8BF', 'LEGACY-ASSET-AADAA0185060BAAD6ED3', 'LEGACY-ASSET-AAFCC2AFDF5341BE272B', 'LEGACY-ASSET-AC2078FFF049D6B56D19', 'LEGACY-ASSET-AF851B7714F4CF28BAC6', 'LEGACY-ASSET-B2F20C4B9B906D64ABE7', 'LEGACY-ASSET-B89E68FDA8828A31C2CC', 'LEGACY-ASSET-BCB2A97BC83FB76A5299', 'LEGACY-ASSET-C1D2CD1AD08E4795DDA7', 'LEGACY-ASSET-C3E8F2E627FF65D14D40', 'LEGACY-ASSET-C9F2BAEB228B54A70B30', 'LEGACY-ASSET-CA75125CF4AF556C8AFE', 'LEGACY-ASSET-CB54A21D333CCCF28C2F', 'LEGACY-ASSET-CB77EEC105E86D91D3D4', 'LEGACY-ASSET-CE2CFBC3F1D10851A80F', 'LEGACY-ASSET-D12276F3EFCECCAF6BCE', 'LEGACY-ASSET-D3024F31E935199C0F12', 'LEGACY-ASSET-D6685205557CA51A9C36', 'LEGACY-ASSET-D91666F646834FF23D1A', 'LEGACY-ASSET-DAC14BD5812CD0847F72', 'LEGACY-ASSET-DD75DA8ECC15CD756777', 'LEGACY-ASSET-DF4F7AD0127375C31C07', 'LEGACY-ASSET-E4CD3DA31B73501A05DF', 'LEGACY-ASSET-E6B0919504EF52342FCB', 'LEGACY-ASSET-E9D11CEAEA7EE4720211', 'LEGACY-ASSET-EDC29797436934B734FD', 'LEGACY-ASSET-F3DD5EBFD553A3B9A740', 'LEGACY-ASSET-FD595ADFDF0375614AFB', 'LEGACY-ASSET-FFAC21BE2BDCF034C1D7')
EXPECTED_MANUAL_REVIEWED_ASSET_IDS = frozenset(EXPECTED_TARGET_IDS)
EXPECTED_RUNTIME_WAVE_OVERLAP_IDS = ('LEGACY-ASSET-04F72C685179FF8BD977', 'LEGACY-ASSET-0F431CE7CE360BCBB909', 'LEGACY-ASSET-188DE92635DFB97B0200', 'LEGACY-ASSET-1D6DB6DC80D2AC0703DF', 'LEGACY-ASSET-3705801CEFFE5E9A650A', 'LEGACY-ASSET-77A70068271118050C5F', 'LEGACY-ASSET-8E94EB9298BDD0A9C52E', 'LEGACY-ASSET-943484807D702E10503B', 'LEGACY-ASSET-A098EACAF07A5848E6B1', 'LEGACY-ASSET-A1918FF3AB1C2FC43DD2', 'LEGACY-ASSET-A52E28E25240059292CA', 'LEGACY-ASSET-AC2078FFF049D6B56D19', 'LEGACY-ASSET-AF851B7714F4CF28BAC6', 'LEGACY-ASSET-CA75125CF4AF556C8AFE', 'LEGACY-ASSET-E4CD3DA31B73501A05DF', 'LEGACY-ASSET-E6B0919504EF52342FCB')

def fail(code: str, message: str) -> None:
    raise AssertionError(f"{code}: {message}")

def tagged(data: bytes) -> str:
    return "sha256:" + hashlib.sha256(data).hexdigest()

def canonical(value: object) -> str:
    return tagged(json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode())

@lru_cache(maxsize=None)
def git_bytes(path: str, base: str = BASE_REVISION) -> bytes:
    try:
        return subprocess.check_output(["git", "show", f"{base}:{path}"])
    except subprocess.CalledProcessError as exc:
        fail("E_BASE_SOURCE", f"missing fixed-base path {path}: {exc}")

@lru_cache(maxsize=None)
def git_blob(path: str, base: str = BASE_REVISION) -> str:
    try:
        return subprocess.check_output(["git", "rev-parse", f"{base}:{path}"], text=True).strip()
    except subprocess.CalledProcessError as exc:
        fail("E_BASE_SOURCE", f"missing fixed-base blob {path}: {exc}")

def local_json(path: Path):
    return json.loads(path.read_text())

def local_jsonl(path: Path):
    return [json.loads(x) for x in path.read_text().splitlines() if x.strip()]

def base_jsonl(path: str):
    return [(i, json.loads(x)) for i, x in enumerate(git_bytes(path).decode().splitlines(), 1) if x.strip()]

def row_digest(row: dict) -> str:
    return canonical(row)

def receipt(path: str, start: int, end: int) -> dict:
    lines = git_bytes(path).decode(errors="replace").splitlines()
    if not (1 <= start <= end <= len(lines)):
        fail("E_SOURCE_LINE", f"range outside {path}:{start}-{end}")
    text = "\n".join(lines[start - 1:end])
    return {"path": path, "blob": git_blob(path), "line_start": start, "line_end": end, "line_count": end - start + 1, "line_text_sha256": tagged(text.encode()), "line_text": lines[start - 1:end]}

def assert_receipt(actual: dict, path: str, start: int, end: int, code: str = "E_BOUNDARY_DIGEST") -> None:
    if actual != receipt(path, start, end):
        fail(code, f"receipt mismatch {path}:{start}-{end}")

def expected_anchor(path: str, pin: dict) -> list[dict]:
    lines = git_bytes(path).decode(errors="replace").splitlines()
    start, end = pin["start"], pin["end"]
    if not (1 <= start <= end <= len(lines)):
        fail("E_SOURCE_LINE", f"pinned source range outside {path}:{start}-{end}")
    text = "\n".join(lines[start - 1:end])
    return [{"line_start": start, "line_end": end, "line_text": lines[start - 1:end], "line_text_sha256": tagged(text.encode()), "interpretation": pin["reason"], "products_considered": list(pin["products"]) or list(PRODUCTS)}]

def compact_crosswalk(row: dict, line: int) -> dict:
    fields = ["crosswalk_id", "source_requirement_id", "unit_candidate_id", "product_scope", "responsibility_summary", "direct_legacy_asset_link_status", "phase_classification_status", "direct_phase_candidates", "current_requirement_implementation_status", "legacy_requirement_implementation_status", "consumer_closure_status", "successor_assignment_status", "legacy_execution_performed", "new_build_allowed", "authority_effect", "unresolved"]
    out = {k: row.get(k) for k in fields}
    out.update({"path": CROSSWALK_FIXED, "line": line, "row_sha256": row_digest(row)})
    return out

def compact_decomp(parent: dict, unit: dict, line: int) -> dict:
    return {"path": DECOMPOSITION_FIXED, "line": line, "decomposition_id": parent.get("decomposition_id"), "source_requirement_id": parent.get("source_requirement_id"), "unit_candidate_id": unit.get("unit_candidate_id"), "unit_kind": unit.get("unit_kind"), "product_target": unit.get("product_target"), "direct_phase_candidates": unit.get("direct_phase_candidates"), "phase_classification_status": unit.get("phase_classification_status"), "semantic_coverage_status": unit.get("semantic_coverage_status"), "authority_effect": unit.get("authority_effect"), "row_sha256": canonical({"parent": parent.get("source_requirement_id"), "unit": unit})}

def wave_link(item):
    wave, path, line, row = item
    edge_base = {"wave": wave, "path": path, "line": line, "asset_id": row["asset_id"], "unit_candidate_id": row.get("unit_candidate_id"), "semantic_link_status": row.get("semantic_link_status")}
    return {"edge_id": canonical(edge_base), "wave": wave, "path": path, "line": line, "row_sha256": row_digest(row), "asset_id": row["asset_id"], "source_requirement_id": row.get("source_requirement_id"), "artifact_evidence_kind": row.get("artifact_evidence_kind"), "unit_candidate_id": row.get("unit_candidate_id"), "semantic_link_status": row.get("semantic_link_status"), "semantic_relation": row.get("semantic_relation"), "candidate_product_targets": row.get("candidate_product_targets") or [], "product_scope": row.get("product_scope") or [], "candidate_phase_targets": row.get("candidate_phase_targets") or [], "source_path": row.get("source_path"), "source_sha256": row.get("source_sha256"), "source_statement_semantic_digest": row.get("source_statement_semantic_digest"), "source_statement_text": row.get("source_statement_text"), "source_text_spans": row.get("source_text_spans") or [], "evidence_refs": row.get("evidence_refs") or [], "legacy_asset_evidence_state": row.get("legacy_asset_evidence_state"), "legacy_execution_status": row.get("legacy_execution_status"), "consumer_closure_status": row.get("consumer_closure_status"), "observed_consumer_refs": row.get("observed_consumer_refs") or [], "counterevidence": row.get("counterevidence") or [], "unresolved": row.get("unresolved") or [], "product_alignment_status": row.get("product_alignment_status"), "authority_effect": row.get("authority_effect"), "new_build_allowed": row.get("new_build_allowed")}

def expected_links(rows):
    return sorted([wave_link(x) for x in rows], key=lambda x: (x["wave"], x["line"], x["edge_id"]))

def boundary_evidence():
    return {product: {"path": BOUNDARY_FIXED, "blob": git_blob(BOUNDARY_FIXED), "ranges": [receipt(BOUNDARY_FIXED, *pair) for pair in pairs]} for product, pairs in BOUNDARY_RANGES_FIXED.items()}

def l1_evidence():
    return {product: {"path": path, "blob": git_blob(path), "ranges": [receipt(path, *pair) for pair in L1_RANGES_FIXED[product]]} for product, path in L1_FIXED.items()}

def expected_history(aid, dispositions, decisions, read_afters):
    line, row = dispositions[aid]
    return {"disposition": {"path": DISPOSITION_FIXED, "line": line, "row_sha256": row_digest(row), "asset_id": aid, "revision": row.get("revision"), "disposition": row.get("disposition"), "asset_class": row.get("asset_class"), "product_target": row.get("product_target"), "authority_status": row.get("authority_status"), "implementation_status": row.get("implementation_status"), "consumer_refs": sorted(row.get("consumer_refs", [])), "decision_record_ref": row.get("decision_record_ref"), "read_after_record_ref": row.get("read_after_record_ref")}, "decisions": [{"path": DECISIONS_FIXED, "line": n, "row_sha256": row_digest(r), "decision_id": r.get("decision_id"), "disposition": r.get("disposition"), "product_target": r.get("product_target"), "consumer_refs": sorted(r.get("consumer_refs", []))} for n, r in decisions if r.get("asset_id") == aid], "read_after": [{"path": READ_AFTER_FIXED, "line": n, "row_sha256": row_digest(r), "read_after_id": r.get("read_after_id"), "result": r.get("result"), "digest_match": r.get("digest_match"), "consumer_match": r.get("consumer_match"), "failure": r.get("failure"), "consumer_refs_observed": sorted(r.get("consumer_refs_observed", []))} for n, r in read_afters if r.get("asset_id") == aid], "state_boundary": "disposition remains unresolved; decision/read-after rows are preserved as historical evidence and do not confer product authority"}

def expected_manual(path: str, pin: dict):
    category, products = pin["category"], pin["products"]
    status = {"direct_product_basis": "reviewed_candidate", "multi_product_conflict": "reviewed_conflict", "insufficient_basis": "reviewed_insufficient_basis"}[category]
    counter = [{"product": product, "evidence": receipt(BOUNDARY_FIXED, *BOUNDARY_RANGES_FIXED[product][1]), "interpretation": f"product-boundary text for {product} remains the human counter-boundary; the source span does not establish an approved owner"} for product in (products or PRODUCTS)]
    return {"status": status, "source_spans": expected_anchor(path, pin), "candidate_products": list(products), "l1_evidence": {p: l1_evidence()[p] for p in products}, "interpretation": pin["reason"], "boundary_counterevidence": counter, "consumer_boundary": {"status": "pending", "interpretation": "legacy consumer relation is retained as a pending closure boundary; no direct semantic link is accepted", "refs": [receipt(CONSUMER_SOURCE_FIXED, *pair) for pair in CONSUMER_RANGES_FIXED]}}

def verify_base():
    try:
        subprocess.check_call(["git", "merge-base", "--is-ancestor", BASE_REVISION, "HEAD"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    except subprocess.CalledProcessError:
        fail("E_BASE_NOT_ANCESTOR", f"fixed BASE {BASE_REVISION} is not an ancestor of HEAD")

def verify_inputs(inventory, targets, phase_by_asset):
    source_paths = [ARCHIVE_PREFIX_FIXED + phase_by_asset[a][1]["source_path"] for a in targets]
    expected_paths = [*WAVE_PATHS_FIXED.values(), *GLOBAL_INPUTS_FIXED, *source_paths]
    actual = inventory.get("input_digests")
    if not isinstance(actual, list) or [x.get("path") for x in actual] != expected_paths or len({x.get("path") for x in actual}) != len(expected_paths):
        fail("E_INPUT_SET", "input digest path set/order differs from fixed target source set")
    for item in actual:
        data = git_bytes(item["path"])
        expected = {"path": item["path"], "blob": git_blob(item["path"]), "bytes": len(data), "sha256": tagged(data)}
        if item != expected:
            fail("E_INPUT_DIGEST", f"input digest mismatch {item.get('path')}")

def verify_static_ranges(record):
    expected_boundary, expected_l1 = boundary_evidence(), l1_evidence()
    if record.get("boundary_evidence") != expected_boundary: fail("E_BOUNDARY_DIGEST", record.get("asset_id", ""))
    if record.get("l1_evidence") != expected_l1: fail("E_BOUNDARY_DIGEST", record.get("asset_id", ""))
    static = record.get("failure_consumer_static_refs", {})
    for key, path, pairs in (("failure", FAILURE_SOURCE_FIXED, FAILURE_RANGES_FIXED), ("consumer", CONSUMER_SOURCE_FIXED, CONSUMER_RANGES_FIXED)):
        expected = {"path": path, "blob": git_blob(path), "ranges": [receipt(path, *pair) for pair in pairs]}
        if static.get(key) != expected: fail("E_BOUNDARY_DIGEST", f"{record.get('asset_id')}:{key}")

def verify():
    verify_base()
    inventory, rows = local_json(INVENTORY), local_jsonl(LEDGER)
    if BASE_REVISION != FIXED_BASE_REVISION or inventory.get("base_revision") != FIXED_BASE_REVISION or inventory.get("base_source_mode") != "all input and archive evidence bytes from fixed BASE Git objects": fail("E_BASE_PIN", "BASE pin/source mode drift")
    if inventory.get("negative_cases") != EXPECTED_NEGATIVE_CASES: fail("E_INVENTORY", "negative case declaration drift")
    phase_rows = base_jsonl(PHASE_FIXED)
    phase_by_asset = {r["asset_id"]: (n, r) for n, r in phase_rows}
    targets = sorted(a for a, (_, r) in phase_by_asset.items() if r.get("product_classification_status") == "unresolved" and r.get("source_path", "").startswith("src/runtime/"))
    if tuple(targets) != EXPECTED_TARGET_IDS or len(targets) != 73: fail("E_TARGET_SET", "fixed BASE target ID set drift")
    if set(PINNED_REVIEWS) != set(targets): fail("E_REVIEW_PIN", "independent review pin set drift")
    verify_inputs(inventory, targets, phase_by_asset)
    if len(rows) != 73 or sorted(r.get("asset_id") for r in rows) != targets or len({r.get("asset_id") for r in rows}) != 73: fail("E_TARGET_SET", "records have missing, duplicate, or extra target asset")
    expected_set = {"target_asset_count": 73, "target_asset_ids": targets, "target_asset_ids_sha256": tagged("\n".join(targets).encode()), "source_paths": [phase_by_asset[a][1]["source_path"] for a in targets]}
    if inventory.get("expected_sets") != expected_set: fail("E_TARGET_SET", "expected target set declaration drift")
    dispositions = {r["asset_id"]: (n, r) for n, r in base_jsonl(DISPOSITION_FIXED)}
    decisions, read_afters = base_jsonl(DECISIONS_FIXED), base_jsonl(READ_AFTER_FIXED)
    wave_rows = []
    for wave, path in WAVE_PATHS_FIXED.items(): wave_rows.extend((wave, path, n, r) for n, r in base_jsonl(path))
    if len(wave_rows) != 598 or len({x[3]["asset_id"] for x in wave_rows}) != 355: fail("E_EXPECTED_DENOMINATOR", "Wave denominator drift")
    by_asset = defaultdict(list)
    for item in wave_rows: by_asset[item[3]["asset_id"]].append(item)
    cw = {r["unit_candidate_id"]: compact_crosswalk(r, n) for n, r in base_jsonl(CROSSWALK_FIXED)}
    decomp = {}
    for n, parent in base_jsonl(DECOMPOSITION_FIXED):
        for unit in parent.get("candidate_units", []): decomp[unit["unit_candidate_id"]] = compact_decomp(parent, unit, n)
    expected_categories = Counter(); expected_edges = 0
    for record in rows:
        aid = record.get("asset_id")
        if set(record) != RECORD_KEYS: fail("E_RECORD_SCHEMA", f"record key set mismatch {aid}")
        if aid not in PINNED_REVIEWS: fail("E_TARGET_SET", aid)
        pin = PINNED_REVIEWS[aid]
        phase_line, phase = phase_by_asset[aid]
        expected_phase = {"path": PHASE_FIXED, "line": phase_line, "row_sha256": row_digest(phase), "product_classification_status": phase.get("product_classification_status"), "candidate_product_targets": phase.get("candidate_product_targets") or [], "candidate_phase_targets": phase.get("candidate_phase_targets") or [], "source_path": phase.get("source_path"), "source_sha256": phase.get("source_sha256"), "consumer_closure_status": phase.get("consumer_closure_status")}
        if record.get("phase_ledger") != expected_phase: fail("E_PHASE_STATUS", aid)
        disp_line, disp = dispositions[aid]
        expected_asset = {"path": DISPOSITION_FIXED, "line": disp_line, "row_sha256": row_digest(disp), "source_path": disp.get("source_path"), "source_sha256": disp.get("source_sha256"), "disposition": disp.get("disposition"), "product_target": disp.get("product_target"), "authority_status": disp.get("authority_status"), "implementation_status": disp.get("implementation_status"), "consumer_refs": sorted(disp.get("consumer_refs", []))}
        if record.get("asset_ledger") != expected_asset: fail("E_HISTORY", aid)
        if disp.get("disposition") != "unresolved" or disp.get("product_target") != "unresolved" or disp.get("authority_status") != "historical": fail("E_PHASE_STATUS", aid)
        source = record.get("source_exact", {}); archive_path = ARCHIVE_PREFIX_FIXED + disp["source_path"]; data = git_bytes(archive_path)
        if set(source) != SOURCE_KEYS or source.get("archive_path") != archive_path or source.get("source_path") != disp["source_path"] or source.get("blob") != git_blob(archive_path) or source.get("bytes") != len(data) or source.get("line_count") != len(data.decode(errors="replace").splitlines()) or source.get("sha256") != tagged(data) or source.get("ledger_source_sha256") != "sha256:" + disp["source_sha256"] or source.get("read_mode") != "git_object_static_read_only": fail("E_SOURCE_DIGEST", aid)
        for anchor in source.get("semantic_anchors", []):
            if not isinstance(anchor.get("line_start"), int) or not isinstance(anchor.get("line_end"), int) or anchor["line_start"] < 1 or anchor["line_start"] > anchor["line_end"] or anchor["line_end"] > source.get("line_count", 0): fail("E_SOURCE_LINE", aid)
        if source.get("semantic_anchors") != expected_anchor(archive_path, pin): fail("E_SOURCE_ANCHOR", aid)
        links = expected_links(by_asset.get(aid, []))
        if record.get("wave_semantic_links") != links: fail("E_EDGE_SET", aid)
        expected_edges += len(links)
        wave_products = sorted({p for link in links for p in (link.get("candidate_product_targets") or []) + (link.get("product_scope") or [])})
        name = disp["source_path"].rsplit("/", 1)[-1].removesuffix(".ts")
        status = {"direct_product_basis": "reviewed_candidate", "multi_product_conflict": "reviewed_conflict", "insufficient_basis": "reviewed_insufficient_basis"}[pin["category"]]
        expected_profile = {"name": name, "base_category": pin["category"], "source_products": pin["products"], "wave_products": wave_products, "profile_reason": pin["reason"], "semantic_review_status": status}
        if record.get("source_profile") != expected_profile: fail("E_PROFILE", aid)
        unit_ids = sorted({x["unit_candidate_id"] for x in links if x.get("unit_candidate_id")})
        units = record.get("unit_product_candidates")
        if [u.get("unit_candidate_id") for u in units] != unit_ids: fail("E_CANDIDATE_PRODUCTS", aid)
        for unit in units:
            uid = unit.get("unit_candidate_id")
            if uid not in cw or uid not in decomp or unit.get("crosswalk") != cw[uid] or unit.get("decomposition") != decomp[uid]: fail("E_CANDIDATE_PRODUCTS", f"{aid}:{uid}")
        if record.get("classification_category") != pin["category"] or record.get("classification_reason") != pin["reason"] + " Candidate only; formal product authority remains unresolved." or record.get("candidate_products") != pin["products"] or record.get("observed_wave_products") != wave_products: fail("E_CLASSIFICATION", aid)
        if record.get("manual_semantic_review") != expected_manual(archive_path, pin): fail("E_SEMANTIC_REVIEW", aid)
        if record.get("semantic_link_statuses") != sorted({x.get("semantic_link_status") for x in links}) or record.get("artifact_evidence_kinds") != (sorted({x.get("artifact_evidence_kind") for x in links}) if links else ["implementation_source"]): fail("E_EDGE_SET", aid)
        if record.get("legacy_history_failure_consumer") != expected_history(aid, dispositions, decisions, read_afters): fail("E_HISTORY", aid)
        if record.get("authority_effect") != "none" or record.get("classification_state") != "research_proposal_pending_human_product_review" or record.get("formal_asset_classification_updated") is not False or record.get("new_build_allowed") is not False: fail("E_AUTHORITY_PROMOTION", aid)
        if record.get("human_judgment_remaining") != ["product_owner_and_boundary_decision", "source_semantic_anchor_acceptance", "phase_admission_and_successor_assignment", "legacy_consumer_closure_and_failure_disposition", "formal_asset_classification_update"]: fail("E_HUMAN_JUDGMENT", aid)
        verify_static_ranges(record)
        expected_categories[pin["category"]] += 1
    counts = inventory.get("counts", {})
    phase_distribution = Counter(tuple(phase_by_asset[a][1].get("candidate_phase_targets") or []) for a in targets)
    evidence_counts = Counter(phase_by_asset[a][1].get("artifact_evidence_kind") for a in targets)
    expected_counts = {"wave_files": 50, "wave_edges": 598, "wave_unique_assets": 355, "target_assets": 73, "target_wave_edges": expected_edges, "target_wave_linked_assets": sum(bool(by_asset.get(a)) for a in targets), "categories": dict(sorted(expected_categories.items())), "target_asset_artifact_evidence_kinds": dict(sorted(evidence_counts.items())), "target_phase_candidate_distribution": {"|".join(k): v for k, v in sorted(phase_distribution.items())}}
    if counts != expected_counts: fail("E_EXPECTED_DENOMINATOR", "inventory counts mismatch")
    if inventory.get("review_counts") != {"source_semantic_reviewed": 73, "source_semantic_review_pending": 0, "direct_candidate_basis": expected_categories["direct_product_basis"], "multi_product_conflict": expected_categories["multi_product_conflict"], "insufficient_basis": expected_categories["insufficient_basis"]}: fail("E_SEMANTIC_REVIEW", "review counts mismatch")
    if set(inventory.get("manual_reviewed_asset_ids", [])) != set(targets) or len(inventory.get("manual_reviewed_asset_ids", [])) != 73: fail("E_SEMANTIC_REVIEW", "manual reviewed set mismatch")
    expected_meta = {"schema_revision": 1, "binding_id": BINDING_ID_FIXED, "scope": "phase product unresolved + src/runtime/ exact 73 assets", "wave_source_paths": {str(n): path for n, path in WAVE_PATHS_FIXED.items()}, "expected_sets": expected_set, "old_asset_source_mode": "archive bytes are read through git show BASE:<archive-path>; never executed", "formal_update": {"formal_asset_classification_updated": False, "phase_ledger_updated": False, "product_route_updated": False, "successor_updated": False, "new_build_allowed": False, "authority_effect": "none"}, "classification_rule": {"direct_product_basis": "a reviewed concrete source span mapped to one product L1 with explicit boundary counterevidence and pending consumer evidence", "multi_product_conflict": "reviewed source behavior contains concrete responsibilities mapped to two product boundaries; no single owner is proposed", "insufficient_basis": "source is generic, tombstone, shared infrastructure, or lacks an accepted product-boundary proof; observed Wave scope is not inherited"}, "boundary_refs": {"product_boundary": BOUNDARY_FIXED, "l1": L1_FIXED}, "history_failure_consumer": {"disposition_rows": 73, "decision_rows_for_targets": sum(bool(r["legacy_history_failure_consumer"]["decisions"]) for r in rows), "read_after_rows_for_targets": sum(bool(r["legacy_history_failure_consumer"]["read_after"]) for r in rows), "failure_consumer_refs_are_static_global_inventory": True}, "edge_contract": {"edge_identity": "edge_id derived from wave/path/line/asset_id/unit_candidate_id/semantic_link_status", "duplicate_edges_forbidden": True, "missing_edges_forbidden": True}, "authority_boundary": {"authority_effect": "none", "classification_state": "research_proposal_pending_human_product_review", "formal_asset_classification_updated": False, "new_build_allowed": False}, "artifacts": ["scaffold/bindings/SCF-B-0117.json", "scaffold/legacy-runtime-product-classification-0117/README.md", "scaffold/legacy-runtime-product-classification-0117/PR-DRAFT.md", "scaffold/legacy-runtime-product-classification-0117/generate.py", "scaffold/legacy-runtime-product-classification-0117/validate.py", "scaffold/legacy-runtime-product-classification-0117/selfcheck.py", "scaffold/legacy-runtime-product-classification-0117/inventory.json", "scaffold/legacy-runtime-product-classification-0117/classification-research.jsonl"]}
    expected_overlap = {"reference_bundle_counts": {"wave_unresolved_product": 64, "lint_unresolved_src": 95, "runtime_unresolved_src": 73}, "pairwise_intersections": {"runtime_wave_unresolved_product": 16, "runtime_lint_unresolved_src": 0, "wave_unresolved_product_lint_unresolved_src": 14}, "union_count": 202, "runtime_wave_overlap_asset_ids": list(EXPECTED_RUNTIME_WAVE_OVERLAP_IDS), "runtime_lint_overlap_asset_ids": []}
    expected_top = set(expected_meta) | {"base_revision", "base_source_mode", "counts", "input_digests", "output_sha256", "review_counts", "manual_reviewed_asset_ids", "negative_cases", "research_overlap"}
    if set(inventory) != expected_top: fail("E_INVENTORY_DECLARATION", "inventory top-level key set mismatch")
    for key, value in expected_meta.items():
        if inventory.get(key) != value: fail("E_INVENTORY_DECLARATION", f"inventory {key} mismatch")
    if inventory.get("research_overlap") != expected_overlap: fail("E_OVERLAP", "research bundle intersection declaration drift")
    if inventory.get("output_sha256") != tagged(LEDGER.read_bytes()): fail("E_OUTPUT_DIGEST", "classification output digest mismatch")
    print(f"SCF-B-0117 validate: PASS records=73 target_edges={expected_edges} categories={dict(sorted(expected_categories.items()))}")
    return {"rows": rows, "inventory": inventory}

if __name__ == "__main__":
    verify()

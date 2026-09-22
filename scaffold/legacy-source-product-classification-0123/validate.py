#!/usr/bin/env python3
"""Independent fail-closed validator for SCF-B-0123 runtime research."""
from __future__ import annotations
import hashlib, json, subprocess
from collections import Counter, defaultdict
from functools import lru_cache
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BUNDLE = ROOT / "scaffold/legacy-source-product-classification-0123"
LEDGER = BUNDLE / "classification-research.jsonl"
INVENTORY = BUNDLE / "inventory.json"
BASE_REVISION = "5562f04da0f3205f9aa58205ec0d478419fc4f2e"
FIXED_BASE_REVISION = BASE_REVISION
BINDING_ID_FIXED = "SCF-B-0123"
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
SOURCE_PREFIXES_FIXED = ("src/workflow/", "src/setup/", "src/cli/", "src/requirements/", "src/shared/")
BOUNDARY_RANGES_FIXED = {"HELIX-HARNESS": [(36, 36), (54, 61), (86, 89)], "HELIX-OS": [(37, 37), (55, 65), (86, 89)], "HELIX-Web": [(38, 38), (56, 56), (63, 70)], "HELIX-Web-OS": [(39, 39), (57, 57), (63, 70)]}
L1_RANGES_FIXED = {"HELIX-HARNESS": [(22, 24), (54, 58)], "HELIX-OS": [(22, 25), (59, 63)], "HELIX-Web": [(24, 26), (47, 49)], "HELIX-Web-OS": [(14, 15), (39, 44)]}
FAILURE_RANGES_FIXED = [(17, 23), (52, 63)]
CONSUMER_RANGES_FIXED = [(24, 36), (38, 50)]
REFERENCE_INVENTORY_PINS = {
    "wave_unresolved_product": {"binding_id": "SCF-B-0107", "path": "scaffold/legacy-asset-product-classification-0107/inventory.json", "sha256": "sha256:0bbcd6433312154f131d9d4ff71e47886ae352aba87f96f62cb97715117f6393", "count": 64},
    "lint_unresolved_src": {"binding_id": "SCF-B-0108", "path": "scaffold/legacy-lint-product-classification-0108/inventory.json", "sha256": "sha256:66f46326fa5344921365252bbec17058b3dddb97733674373758215d1e76a267", "count": 95},
    "runtime_unresolved_src": {"binding_id": "SCF-B-0117", "path": "scaffold/legacy-runtime-product-classification-0117/inventory.json", "sha256": "sha256:6451b00b8ba68fdfa7960a3593c73d168f1d9be64d64d7275b0c5e12fe22f496", "count": 73},
}
SCHEMA_DEPENDENCY = {"binding_id": "SCF-B-0120", "commit": "30e2b06bdf636fa18afb0e7a58fb0c14a72eb7f2", "path": "scaffold/legacy-schema-product-classification-0120/inventory.json", "sha256": "sha256:5d4beecc52546acaa7825d323fa1fc557faf1212f48a480845a717cef904314b", "count": 31}
CATEGORY_RULES = {
    "direct_product_basis": {"status": "reviewed_candidate", "product_count": 1},
    "multi_product_conflict": {"status": "reviewed_conflict", "product_count": 2},
    "insufficient_basis": {"status": "reviewed_insufficient_basis", "product_count": 0},
}
EXPECTED_NEGATIVE_CASES = ['target_record_omission', 'target_record_duplicate', 'edge_omission', 'edge_duplicate', 'source_digest_tamper', 'source_anchor_tamper', 'source_line_range_tamper', 'source_profile_tamper', 'candidate_product_tamper', 'classification_category_tamper', 'semantic_review_tamper', 'legacy_evidence_tamper', 'boundary_digest_tamper', 'input_digest_omission', 'input_digest_duplicate', 'input_digest_extra_path', 'authority_promotion', 'record_top_level_extra_key', 'source_read_mode_tamper', 'inventory_authority_promotion', 'inventory_scope_tamper', 'inventory_formal_update_tamper', 'inventory_classification_rule_tamper', 'inventory_artifact_kind_denominator_tamper', 'inventory_edge_denominator_tamper', 'fixed_base_non_ancestor', 'generator_review_spec_tamper', 'generator_anchor_tamper', 'generator_l1_tamper', 'generator_products_tamper', 'base_pin_tamper', 'base_source_missing', 'history_tamper', 'asset_ledger_nested_tamper', 'phase_nested_tamper', 'history_nested_tamper', 'failure_consumer_static_ref_tamper', 'unit_candidate_nested_tamper', 'semantic_edge_field_tamper', 'human_judgment_tamper', 'input_digest_value_tamper', 'inventory_negative_case_tamper', 'output_digest_tamper', 'phase_status_tamper', 'inventory_overlap_tamper', 'asset_id_missing', 'unit_candidate_non_dict', 'unit_candidate_top_level_extra', 'failure_consumer_top_level_extra', 'failure_consumer_nested_extra', 'inventory_manual_ids_tamper', 'inventory_top_level_extra', 'direct_category_cardinality', 'conflict_category_cardinality', 'insufficient_category_cardinality', 'manual_l1_evidence_mismatch']
RECORD_KEYS = frozenset({"artifact_evidence_kinds", "asset_id", "asset_ledger", "authority_effect", "boundary_evidence", "candidate_products", "classification_category", "classification_reason", "classification_state", "failure_consumer_static_refs", "formal_asset_classification_updated", "human_judgment_remaining", "l1_evidence", "legacy_history_failure_consumer", "legacy_implementation_shrinkage_evidence", "manual_semantic_review", "new_build_allowed", "observed_wave_products", "phase_ledger", "semantic_link_statuses", "source_exact", "source_profile", "unit_product_candidates", "wave_semantic_links"})
SOURCE_KEYS = frozenset({"archive_path", "blob", "bytes", "ledger_source_sha256", "line_count", "read_mode", "semantic_anchors", "sha256", "source_path"})
# Fixed BASE semantic review pins are independent of generate.py.  Generator
# table/anchor/L1 mutations followed by regeneration must fail against these.
PINNED_REVIEWS = {'LEGACY-ASSET-02FA69982286FDE5A8C9': {'category': 'direct_product_basis',
                                       'end': 126,
                                       'legacy': 'The source explicitly rejects authority escalation and only proposes next-state actions; '
                                                 'no AI decision, learning update, or operational state mutation was performed.',
                                       'name': 'ai-decision-proposal',
                                       'products': ['HELIX-OS'],
                                       'reason': 'The validator constrains AI decision proposals, required operational metrics, and '
                                                 'forbidden authority-escalation actions; this is HELIX-OS learning and control safety.',
                                       'start': 72},
 'LEGACY-ASSET-04C6A8AFA15A1BDF0A1D': {'category': 'direct_product_basis',
                                       'end': 104,
                                       'legacy': 'The adapter retains provider and filesystem safety boundaries, but no node service or '
                                                 'consumer was executed.',
                                       'name': 'distribution-consumer-node-adapter',
                                       'products': ['HELIX-OS'],
                                       'reason': 'The adapter contracts provider delegation, setup, status, doctor, and completion '
                                                 'decision services for a Lite consumer; these are HELIX-OS operational service controls.',
                                       'start': 30},
 'LEGACY-ASSET-07A927901B7F9981783F': {'category': 'direct_product_basis',
                                       'end': 63,
                                       'legacy': 'The CLI is historical consumer-operation evidence; provider delegation, service state, '
                                                 'and filesystem writes were not executed.',
                                       'name': 'distribution-consumer-cli',
                                       'products': ['HELIX-OS'],
                                       'reason': 'The source composes the Lite consumer command registry, node adapter, services, provider '
                                                 'delegation, and completion receipts; this is HELIX-OS distribution/consumer operation.',
                                       'start': 23},
 'LEGACY-ASSET-08F8688895B787BD3D5C': {'category': 'direct_product_basis',
                                       'end': 113,
                                       'legacy': 'The source provides no-write rehearsal and gated cutover surfaces; no rename, state '
                                                 'mutation, or authority transition was performed.',
                                       'name': 'rename',
                                       'products': ['HELIX-OS'],
                                       'reason': 'The CLI exposes identifier rename audit, rehearsal, backup, smoke, monitoring, approval, '
                                                 'and cutover planning over HELIX state paths; this is HELIX-OS operational control.',
                                       'start': 14},
 'LEGACY-ASSET-0996E33E11CB9283EEC8': {'category': 'insufficient_basis',
                                       'end': 4,
                                       'legacy': 'The helper is shared static evidence and was not used to establish freshness or runtime '
                                                 'success.',
                                       'name': 'time-utils',
                                       'products': [],
                                       'reason': 'The utility returns an ISO timestamp; generic time formatting does not identify a '
                                                 'product owner.',
                                       'start': 2},
 'LEGACY-ASSET-0D09591FDF9E486737C0': {'category': 'direct_product_basis',
                                       'end': 129,
                                       'legacy': 'The source fail-closes unknown and ambiguous classifications; no catalog read, route '
                                                 'decision, or legacy identity emission was executed.',
                                       'name': 'workflow-classification-routing',
                                       'products': ['HELIX-OS'],
                                       'reason': 'The router matches a signal to the installed workflow classification catalog, reports '
                                                 'unknown/ambiguous/decision-required states, and preserves unresolved-until-decision '
                                                 'semantics; this is HELIX-OS authority routing.',
                                       'start': 35},
 'LEGACY-ASSET-110F52E3C367C3DCCFE5': {'category': 'insufficient_basis',
                                       'end': 38,
                                       'legacy': 'The old helper is retained as shared static evidence with no product-specific authority, '
                                                 'consumer closure, or execution claim.',
                                       'name': 'helpers',
                                       'products': [],
                                       'reason': 'The helper only formats packet freshness, verification-source, and record-template '
                                                 'strings; generic formatting does not prove a product-boundary owner.',
                                       'start': 9},
 'LEGACY-ASSET-11379713A3797CAC3141': {'category': 'direct_product_basis',
                                       'end': 458,
                                       'legacy': 'The shadow compiler and linkage rules are historical static evidence; no shadow was '
                                                 'promoted, executed, or treated as implementation closure.',
                                       'name': 'requirement-ir-shadow',
                                       'products': ['HELIX-HARNESS'],
                                       'reason': 'The source defines requirement, system-contract, acceptance, and system-test shadow '
                                                 'records plus linkage and digest validation; this is HARNESS requirement artifact '
                                                 'structure.',
                                       'start': 379},
 'LEGACY-ASSET-313DC99AEF53834D9207': {'category': 'direct_product_basis',
                                       'end': 59,
                                       'legacy': 'The route command preserves approval and audit shrinkage boundaries; no audit write, '
                                                 'workflow execution, or authority promotion was performed.',
                                       'name': 'route',
                                       'products': ['HELIX-OS'],
                                       'reason': 'The CLI builds an approval audit event and evaluates typed workflow execution routing '
                                                 'with fail-closed conditions; this is HELIX-OS execution and audit control.',
                                       'start': 15},
 'LEGACY-ASSET-321E904B969DE1EE27C9': {'category': 'multi_product_conflict',
                                       'end': 440,
                                       'legacy': 'The builder preserves source/digest/remote guards but was not run and does not establish '
                                                 'release or implementation success.',
                                       'name': 'distribution-lite-package',
                                       'products': ['HELIX-HARNESS', 'HELIX-OS'],
                                       'reason': 'The package builder gathers HARNESS source and requirement documents, validates '
                                                 'distribution identity, and creates a Lite artifact for DevOS; artifact ownership and '
                                                 'distribution operation are distinct boundaries.',
                                       'start': 352},
 'LEGACY-ASSET-3290C9A3BA7FAD7BA07C': {'category': 'multi_product_conflict',
                                       'end': 142,
                                       'legacy': 'The helpers preserve shared contract and operational guardrails without deciding owner, '
                                                 'consumer closure, or implementation status.',
                                       'name': 'contracts-extras',
                                       'products': ['HELIX-HARNESS', 'HELIX-OS'],
                                       'reason': 'The contract helpers combine capability/skill and folder-rule artifact semantics with '
                                                 'command catalogs, partition paths, and operational readiness; HARNESS artifact meaning '
                                                 'and HELIX-OS control overlap.',
                                       'start': 23},
 'LEGACY-ASSET-354670A58AC796DDC80F': {'category': 'multi_product_conflict',
                                       'end': 261,
                                       'legacy': 'The registry is static quality/authority evidence; no NFR approval, runtime profile, or '
                                                 'formal owner was assigned.',
                                       'name': 'nfr-registry',
                                       'products': ['HELIX-HARNESS', 'HELIX-OS'],
                                       'reason': 'The NFR registry defines requirement quality characteristics and authority roles '
                                                 'including runtime profile environment; HARNESS quality semantics and HELIX-OS '
                                                 'operational authority overlap.',
                                       'start': 142},
 'LEGACY-ASSET-4010B567B1B736F68EF2': {'category': 'multi_product_conflict',
                                       'end': 179,
                                       'legacy': 'The gate preserves canonical/frozen and migration allowlist boundaries; no authority '
                                                 'gate, file read, promotion, or consumer migration was run.',
                                       'name': 'requirement-authority-gate',
                                       'products': ['HELIX-HARNESS', 'HELIX-OS'],
                                       'reason': 'The gate validates canonical requirement authority, frozen baseline material, migration '
                                                 'consumers, and source reads; HARNESS requirement authority and HELIX-OS '
                                                 'promotion/migration control overlap.',
                                       'start': 60},
 'LEGACY-ASSET-412ED61BCBBD6ACCC3C1': {'category': 'direct_product_basis',
                                       'end': 52,
                                       'legacy': 'The old command surface remains unresolved static process evidence; guide generation, '
                                                 'consumer closure, and current implementation were not executed or promoted.',
                                       'name': 'workflow',
                                       'products': ['HELIX-HARNESS'],
                                       'reason': 'The CLI declares requirements-owned typed workflow surfaces and builds a bounded guide '
                                                 'from workflow identity; the span is a HARNESS process and artifact contract.',
                                       'start': 8},
 'LEGACY-ASSET-429C4F8FB5B0332F798C': {'category': 'multi_product_conflict',
                                       'end': 161,
                                       'legacy': 'The projection preserves exclusion and consumer-safety guards; no artifact catalog, '
                                                 'package, or distribution authority was produced.',
                                       'name': 'distribution-artifact-projection',
                                       'products': ['HELIX-HARNESS', 'HELIX-OS'],
                                       'reason': 'The projection catalogs HARNESS capability artifacts while excluding harness.db, '
                                                 'environment, and local state from a distribution package; artifact content and '
                                                 'distribution operation cross product boundaries.',
                                       'start': 103},
 'LEGACY-ASSET-4329EAEA146D5D97E088': {'category': 'direct_product_basis',
                                       'end': 25,
                                       'legacy': 'The generator is old static projection evidence; no generated view was written or '
                                                 'accepted as current authority.',
                                       'name': 'requirement-generated-view-generator',
                                       'products': ['HELIX-HARNESS'],
                                       'reason': 'The source renders the canonical requirement IR into the generated '
                                                 'requirement-definition view and records source counts and root digest; this is a HARNESS '
                                                 'artifact projection.',
                                       'start': 11},
 'LEGACY-ASSET-499354506CDE051E21CF': {'category': 'direct_product_basis',
                                       'end': 47,
                                       'legacy': 'The identity resolver preserves legacy repository rejection/compatibility evidence; no '
                                                 'remote, package, or update operation was accessed.',
                                       'name': 'distribution-identity',
                                       'products': ['HELIX-OS'],
                                       'reason': 'The source validates current, legacy-compatible, and explicit distribution repository '
                                                 'identities and rejects invalid remotes; distribution identity is HELIX-OS operation '
                                                 'control.',
                                       'start': 3},
 'LEGACY-ASSET-4A9AB5B2EF182BC30431': {'category': 'insufficient_basis',
                                       'end': 43,
                                       'legacy': 'The helper is shared infrastructure evidence with no product-specific consumer or '
                                                 'authority claim.',
                                       'name': 'canonical-digest',
                                       'products': [],
                                       'reason': 'The utility canonicalizes JSON and computes SHA-256 digests; generic serialization and '
                                                 'hashing do not identify a product owner.',
                                       'start': 9},
 'LEGACY-ASSET-4D3446684F730BFEB99E': {'category': 'insufficient_basis',
                                       'end': 59,
                                       'legacy': 'The shared type vocabulary is static historical evidence and has no standalone '
                                                 'implementation or boundary proof.',
                                       'name': 'contracts-types',
                                       'products': [],
                                       'reason': 'The file only declares generic Finding, ContractResult, projection, test, and command '
                                                 'evidence shapes; type declarations alone do not establish a product owner.',
                                       'start': 51},
 'LEGACY-ASSET-555329E1E192F23D2865': {'category': 'direct_product_basis',
                                       'end': 372,
                                       'legacy': 'The source explicitly retains legacy Markdown until cutover; rendering and parsing were '
                                                 'not executed and no authority cutover is claimed.',
                                       'name': 'requirement-generated-view',
                                       'products': ['HELIX-HARNESS'],
                                       'reason': 'The source renders and parses the requirement IR view while preserving the legacy '
                                                 'Markdown authority boundary; the reviewed behavior is a HARNESS requirement presentation '
                                                 'contract.',
                                       'start': 273},
 'LEGACY-ASSET-58C7AC6F205F982B0729': {'category': 'direct_product_basis',
                                       'end': 37,
                                       'legacy': 'The dispatcher preserves typed failure admission but was not run and does not establish '
                                                 'a current consumer implementation.',
                                       'name': 'distribution-consumer-command-composition',
                                       'products': ['HELIX-OS'],
                                       'reason': 'The dispatcher admits a registered Lite consumer command and returns typed execution or '
                                                 'failure results; this is HELIX-OS command and distribution control.',
                                       'start': 24},
 'LEGACY-ASSET-5AADD905DFEE4E4071D6': {'category': 'insufficient_basis',
                                       'end': 1,
                                       'legacy': 'The re-export is retained as static compatibility evidence and does not establish an '
                                                 'implementation or owner.',
                                       'name': 'workflow-classification-legacy-adapter',
                                       'products': [],
                                       'reason': 'The source is a one-line re-export of the schema legacy adapter; this file itself has no '
                                                 'independent product-boundary behavior.',
                                       'start': 1},
 'LEGACY-ASSET-5BABA53229DF9A5DECEF': {'category': 'insufficient_basis',
                                       'end': 44,
                                       'legacy': 'The file walker is shared static infrastructure; no filesystem traversal or consumer '
                                                 'closure was executed.',
                                       'name': 'file-walk',
                                       'products': [],
                                       'reason': 'The utility walks filesystem paths and returns file metadata; generic traversal does not '
                                                 'establish a product boundary.',
                                       'start': 13},
 'LEGACY-ASSET-5C2DF2B855AA1C9CB445': {'category': 'multi_product_conflict',
                                       'end': 131,
                                       'legacy': 'The profile validator preserves source-authority and refinement mismatch failures; no '
                                                 'profile was accepted as formal distribution authority.',
                                       'name': 'distribution-profile',
                                       'products': ['HELIX-HARNESS', 'HELIX-OS'],
                                       'reason': 'The profile requires HELIX-HARNESS source authority and a DevOS distribution repository '
                                                 'while validating capability and refinement digests; source artifact ownership and '
                                                 'distribution authority overlap.',
                                       'start': 68},
 'LEGACY-ASSET-5D86AA4EF7034A49C54C': {'category': 'multi_product_conflict',
                                       'end': 339,
                                       'legacy': 'The deterministic package path is historical build evidence only; no package, release, '
                                                 'or distribution authority was created.',
                                       'name': 'distribution-package-builder',
                                       'products': ['HELIX-HARNESS', 'HELIX-OS'],
                                       'reason': 'The package builder binds HARNESS source repository and requirements identity to a DevOS '
                                                 'distribution manifest and deterministic tar inputs; HARNESS artifact meaning and '
                                                 'HELIX-OS distribution control conflict.',
                                       'start': 210},
 'LEGACY-ASSET-5EC2737F0CEF4B72F223': {'category': 'multi_product_conflict',
                                       'end': 55,
                                       'legacy': 'The source is a cutover command, but no cutover or output write was performed; current '
                                                 'authority remains unchanged.',
                                       'name': 'requirement-ir-authority-cutover',
                                       'products': ['HELIX-HARNESS', 'HELIX-OS'],
                                       'reason': 'The command promotes a requirement shadow into canonical shards and manifest output, '
                                                 'combining HARNESS requirement artifact meaning with HELIX-OS authority/cutover '
                                                 'operation.',
                                       'start': 16},
 'LEGACY-ASSET-64E68EA11CDB499951A2': {'category': 'direct_product_basis',
                                       'end': 163,
                                       'legacy': 'Fallback selection and receipt persistence remain historical compatibility evidence; no '
                                                 'provider process, GitHub review, or execution admission was run.',
                                       'name': 'review-fallback',
                                       'products': ['HELIX-OS'],
                                       'reason': 'The command surface derives admitted review risk, selects an independent provider, and '
                                                 'validates provider-neutral review receipts; this is HELIX-OS review orchestration and '
                                                 'fallback control.',
                                       'start': 54},
 'LEGACY-ASSET-66A3EB90764ABB6E7F57': {'category': 'direct_product_basis',
                                       'end': 23,
                                       'legacy': 'The source preserves typed identity and legacy compatibility as static evidence; no '
                                                 'current-location read or authority resolution was executed.',
                                       'name': 'current-location-workflow-identity',
                                       'products': ['HELIX-OS'],
                                       'reason': 'The composition boundary resolves current workflow identity against the installed '
                                                 'authority catalog for CLI/read-model consumers; this is HELIX-OS operational identity '
                                                 'control.',
                                       'start': 7},
 'LEGACY-ASSET-6B10C0467A1A1918D46E': {'category': 'insufficient_basis',
                                       'end': 9,
                                       'legacy': 'The helper remains shared static evidence without implementation or product ownership '
                                                 'inference.',
                                       'name': 'collection-utils',
                                       'products': [],
                                       'reason': 'The utility sorts and deduplicates strings; generic collection behavior provides no '
                                                 'product-boundary proof.',
                                       'start': 2},
 'LEGACY-ASSET-7EFC65F55C9558943274': {'category': 'multi_product_conflict',
                                       'end': 258,
                                       'legacy': 'The source fail-closes identity, digest, path, and runtime-input mismatches; no artifact '
                                                 'was admitted or published.',
                                       'name': 'distribution-lite-consumer-canary',
                                       'products': ['HELIX-HARNESS', 'HELIX-OS'],
                                       'reason': 'The canary validates a HARNESS source identity, requirements digest, distribution '
                                                 'documents, runtime inputs, and consumer artifact; HARNESS artifact contract and HELIX-OS '
                                                 'distribution admission conflict.',
                                       'start': 185},
 'LEGACY-ASSET-7FC5B506E0B82D54278D': {'category': 'multi_product_conflict',
                                       'end': 284,
                                       'legacy': 'Dependency and canary analysis remain static package evidence; no source execution, '
                                                 'package build, or canary admission occurred.',
                                       'name': 'distribution-dependency-closure',
                                       'products': ['HELIX-HARNESS', 'HELIX-OS'],
                                       'reason': 'The analyzer traverses TypeScript dependency edges and Lite canary coverage over HARNESS '
                                                 'source while enforcing distribution/runtime package closure; source artifact meaning and '
                                                 'OS distribution control overlap.',
                                       'start': 165},
 'LEGACY-ASSET-8F85476FEB95D1284680': {'category': 'insufficient_basis',
                                       'end': 37,
                                       'legacy': 'The lazy loader preserves a shared dependency boundary; no compiler load or owner '
                                                 'promotion was performed.',
                                       'name': 'typescript-lazy',
                                       'products': [],
                                       'reason': 'The utility lazily resolves the TypeScript module for multiple owners and explicitly '
                                                 'avoids owner-specific reverse dependencies; its shared loading role is insufficient for '
                                                 'product classification.',
                                       'start': 13},
 'LEGACY-ASSET-96B81A6EE3E834E03144': {'category': 'direct_product_basis',
                                       'end': 75,
                                       'legacy': 'The command is marked migration-only and was not run; the shadow remains a static '
                                                 'candidate and cannot replace requirement authority.',
                                       'name': 'requirement-ir-shadow-generator',
                                       'products': ['HELIX-HARNESS'],
                                       'reason': 'The migration-only command compiles requirement source documents into a shadow IR with '
                                                 'stable shard digests; this is HARNESS requirement migration evidence.',
                                       'start': 26},
 'LEGACY-ASSET-9EE409F304E148DD975C': {'category': 'direct_product_basis',
                                       'end': 81,
                                       'legacy': 'The old review detector is static evidence of a fail-closed review-state workflow; no '
                                                 'provider, filesystem write, or review admission was executed.',
                                       'name': 'claude-unanswered-review-detector',
                                       'products': ['HELIX-OS'],
                                       'reason': 'The CLI command reads review state, detects unanswered Claude review subjects, and emits '
                                                 'a report through runtime review state; this is HELIX-OS review and state control.',
                                       'start': 27},
 'LEGACY-ASSET-A3EC7F28F52F2808041E': {'category': 'direct_product_basis',
                                       'end': 58,
                                       'legacy': 'The preflight aggregator remains unexecuted state evidence; no gate was opened, closed, '
                                                 'or promoted.',
                                       'name': 'preflight-gate-aggregation',
                                       'products': ['HELIX-OS'],
                                       'reason': 'The command aggregates preflight gate results and emits a bounded operational result '
                                                 'from runtime evidence; this is HELIX-OS execution readiness control.',
                                       'start': 25},
 'LEGACY-ASSET-B09097E01CEC58F07B16': {'category': 'direct_product_basis',
                                       'end': 88,
                                       'legacy': 'The old readiness query is static database/state evidence; no database, workflow run, or '
                                                 'readiness decision was executed.',
                                       'name': 'readiness',
                                       'products': ['HELIX-OS'],
                                       'reason': 'The evaluator reads workflow runs, findings, gates, and human-required guardrails from '
                                                 'harness.db and produces automation readiness rows; the operational state and human block '
                                                 'control are HELIX-OS responsibilities.',
                                       'start': 39},
 'LEGACY-ASSET-B85C45D7C5621BD8201C': {'category': 'direct_product_basis',
                                       'end': 151,
                                       'legacy': 'The selector is static orchestration evidence and explicitly depends on admission '
                                                 'inputs; no GitHub event, canary run, or release action was executed.',
                                       'name': 'lite-canary-selector',
                                       'products': ['HELIX-OS'],
                                       'reason': 'The CLI composition root passes Git metadata and distribution fast-check results into a '
                                                 'canary lane selector; this is HELIX-OS CI/distribution operation control.',
                                       'start': 52},
 'LEGACY-ASSET-C070EF163B7D48606ECE': {'category': 'direct_product_basis',
                                       'end': 496,
                                       'legacy': 'The old evaluator is retained as static NFR/measurement evidence; no current measurement '
                                                 'run, consumer closure, or formal quality authority is asserted.',
                                       'name': 'measurement-evidence-evaluator',
                                       'products': ['HELIX-HARNESS'],
                                       'reason': 'The evaluator validates measurement observations, baseline binding, freshness, '
                                                 'representativeness, thresholds, and hard limits as explicit quality evidence; these are '
                                                 'HARNESS verification and completion contract semantics.',
                                       'start': 407},
 'LEGACY-ASSET-C4C93ABA07B48AAB6D05': {'category': 'multi_product_conflict',
                                       'end': 124,
                                       'legacy': 'Shard planning and receipt validation are static evidence only; no regression, CI, or '
                                                 'receipt admission was executed.',
                                       'name': 'full-regression-shards',
                                       'products': ['HELIX-HARNESS', 'HELIX-OS'],
                                       'reason': 'The command plans and validates regression shards and receipts, combining HARNESS '
                                                 'verification evidence with HELIX-OS runtime/CI execution control; a single product owner '
                                                 'cannot be inferred.',
                                       'start': 42},
 'LEGACY-ASSET-C6570CC25A043BB2B417': {'category': 'direct_product_basis',
                                       'end': 328,
                                       'legacy': 'The trace census remains an unexecuted historical analyzer; missing links and consumer '
                                                 'closure require human review and no formal trace authority is added.',
                                       'name': 'requirement-definition-trace-census',
                                       'products': ['HELIX-HARNESS'],
                                       'reason': 'The census compiles requirement, system contract, and acceptance-case trace relations '
                                                 'and reports definition gaps; this is HARNESS V-model trace evidence.',
                                       'start': 234},
 'LEGACY-ASSET-CD0EAE866A7CA2A0D1F8': {'category': 'direct_product_basis',
                                       'end': 221,
                                       'legacy': 'Update checking remains historical network/cache control evidence; no remote request, '
                                                 'cache write, or update was executed.',
                                       'name': 'update-check',
                                       'products': ['HELIX-OS'],
                                       'reason': 'The update checker validates the distribution identity, manifest, cache freshness, '
                                                 'remote policy, and update availability; this is HELIX-OS distribution operation control.',
                                       'start': 142},
 'LEGACY-ASSET-D331F13A1FA21B0C05FE': {'category': 'multi_product_conflict',
                                       'end': 68,
                                       'legacy': 'The command is documented as read-only and does not write GitHub; the old contract '
                                                 'census and consumer closure remain unexecuted.',
                                       'name': 'issue-hierarchy-census',
                                       'products': ['HELIX-HARNESS', 'HELIX-OS'],
                                       'reason': 'The read-only census checks GitHub Issue hierarchy contracts that express HARNESS '
                                                 'requirement/process relationships while using HELIX-OS GitHub projection and operational '
                                                 'source loading; one owner is not established.',
                                       'start': 37},
 'LEGACY-ASSET-D6339A02201B20481C3F': {'category': 'direct_product_basis',
                                       'end': 85,
                                       'legacy': 'The canonical promotion helper is historical source evidence only; no promotion, current '
                                                 'authority, or implementation completion was performed.',
                                       'name': 'requirement-authority',
                                       'products': ['HELIX-HARNESS'],
                                       'reason': 'The source models canonical requirement IR records, root and semantic digests, and the '
                                                 'requirements authority shape; this is the HARNESS requirement artifact boundary.',
                                       'start': 49},
 'LEGACY-ASSET-D641C9E49847C74848CE': {'category': 'direct_product_basis',
                                       'end': 184,
                                       'legacy': 'The evaluator keeps unresolved questions pending human decisions; no interview result, '
                                                 'workflow authority, or implementation was produced.',
                                       'name': 'workflow-interview-unresolved',
                                       'products': ['HELIX-HARNESS'],
                                       'reason': 'The interview evaluator records unresolved workflow ambiguity, contradiction, missing '
                                                 'authority, and missing branch signals; this is HARNESS requirements elicitation and '
                                                 'clarification evidence.',
                                       'start': 85},
 'LEGACY-ASSET-D73981AB049C177AC184': {'category': 'multi_product_conflict',
                                       'end': 122,
                                       'legacy': 'The schema preserves unresolved, authority-missing, and branch-missing findings; no '
                                                 'workflow envelope was executed or promoted.',
                                       'name': 'universal-workflow-envelope',
                                       'products': ['HELIX-HARNESS', 'HELIX-OS'],
                                       'reason': 'The envelope schema binds workflow atoms, unresolved/authority findings, derived '
                                                 'requirements, contracts, and runtime orchestration; HARNESS workflow artifact meaning '
                                                 'and HELIX-OS execution/state control meet.',
                                       'start': 3},
 'LEGACY-ASSET-D8787D8B14310B1A1E77': {'category': 'direct_product_basis',
                                       'end': 341,
                                       'legacy': 'The guide source preserves stale and authority-digest guards; no guide was built, '
                                                 'routed, or accepted as a current process authority.',
                                       'name': 'workflow-guide',
                                       'products': ['HELIX-HARNESS'],
                                       'reason': 'The guide builder resolves requirements-owned workflow registry identity, gates, stale '
                                                 'conditions, and bounded work phases; this is HARNESS workflow process and artifact '
                                                 'guidance.',
                                       'start': 222},
 'LEGACY-ASSET-DC7FD5CB8C1B4F9C8E29': {'category': 'multi_product_conflict',
                                       'end': 221,
                                       'legacy': 'The service layer contains path, symlink, and state guards; no consumer service, '
                                                 'workflow, or external runtime was started.',
                                       'name': 'distribution-lite-consumer-services',
                                       'products': ['HELIX-OS', 'HELIX-Web-OS'],
                                       'reason': 'The services manage consumer-lite state, workflow commands, provider delegation, and a '
                                                 'consumer workflow file; HELIX-OS distribution control and HELIX-Web-OS service/runtime '
                                                 'operation both appear.',
                                       'start': 122},
 'LEGACY-ASSET-DF48E86F1E92DB436CFF': {'category': 'direct_product_basis',
                                       'end': 194,
                                       'legacy': 'The old route evaluator preserves fail-closed dispositions and typed receipts; no policy '
                                                 'load, command execution, or approval was performed.',
                                       'name': 'workflow-execution-routing',
                                       'products': ['HELIX-OS'],
                                       'reason': 'The evaluator combines classification routing, execution policy projection, registered '
                                                 'command binding, approval requirements, and typed receipts; this is HELIX-OS execution '
                                                 'control.',
                                       'start': 100},
 'LEGACY-ASSET-E1B0DC33FA5DDC799FFB': {'category': 'direct_product_basis',
                                       'end': 116,
                                       'legacy': 'The trace compiler preserves unresolved findings and digest links as historical '
                                                 'evidence; no derived requirement or acceptance artifact was generated or accepted.',
                                       'name': 'derived-requirement-trace',
                                       'products': ['HELIX-HARNESS'],
                                       'reason': 'The source compiles workflow atoms into requirement, system-contract, acceptance, and '
                                                 'V-model pair trace artifacts; this is HARNESS requirement and verification trace '
                                                 'structure.',
                                       'start': 7},
 'LEGACY-ASSET-E9F6609D6EBDEBD288BC': {'category': 'insufficient_basis',
                                       'end': 40,
                                       'legacy': 'The repository reader retains dependency-injected static behavior and was not executed '
                                                 'against a live repository.',
                                       'name': 'repo-info',
                                       'products': [],
                                       'reason': 'The utility reads repository HEAD and package version through injected dependencies; '
                                                 'generic repository metadata does not establish a product owner.',
                                       'start': 17},
 'LEGACY-ASSET-ECE1AFAAE85425CD29BB': {'category': 'insufficient_basis',
                                       'end': 11,
                                       'legacy': 'The value guard is shared static infrastructure and was not executed.',
                                       'name': 'value-guards',
                                       'products': [],
                                       'reason': 'The utility checks records and recursively freezes values; generic data guards do not '
                                                 'establish a product-boundary owner.',
                                       'start': 7},
 'LEGACY-ASSET-EFFA71383D8FAE4EBBBA': {'category': 'insufficient_basis',
                                       'end': 7,
                                       'legacy': 'The quoting helper is shared static evidence; no shell command was executed.',
                                       'name': 'shell-quote',
                                       'products': [],
                                       'reason': 'The utility quotes one shell token; generic command-string safety does not prove '
                                                 'HARNESS, OS, Web, or Web-OS ownership.',
                                       'start': 4},
 'LEGACY-ASSET-F2B7BCF14B8563B15C14': {'category': 'insufficient_basis',
                                       'end': 4,
                                       'legacy': 'The helper is shared static evidence with no product authority or execution claim.',
                                       'name': 'string-utils',
                                       'products': [],
                                       'reason': 'The utility escapes regular-expression text; generic string handling provides no '
                                                 'product-boundary proof.',
                                       'start': 2},
 'LEGACY-ASSET-F38F4C78F60DF814428A': {'category': 'direct_product_basis',
                                       'end': 150,
                                       'legacy': 'The source is explicitly a lifecycle rehearsal with path/digest guards; no consumer '
                                                 'copy, rollback, or release state was changed.',
                                       'name': 'distribution-lite-consumer-lifecycle',
                                       'products': ['HELIX-OS'],
                                       'reason': 'The lifecycle source validates safe consumer paths, immutable engine pins, snapshot '
                                                 'digests, and rollback rehearsal; this is HELIX-OS distribution and state control.',
                                       'start': 91},
 'LEGACY-ASSET-F45E18DC5CE003BD8D91': {'category': 'insufficient_basis',
                                       'end': 4,
                                       'legacy': 'The re-export preserves a legacy module boundary only; the underlying adapter and '
                                                 'consumer closure require separate review.',
                                       'name': 'skill-applicability-authoring',
                                       'products': [],
                                       'reason': 'The source is a one-line re-export of a schema adapter; it contains no independent '
                                                 'product responsibility span from which to infer ownership.',
                                       'start': 1},
 'LEGACY-ASSET-F5C9B1066B7337E45182': {'category': 'direct_product_basis',
                                       'end': 54,
                                       'legacy': 'The projection preserves legacy-input shrinkage and typed output requirements; no state '
                                                 'snapshot or CLI output was executed.',
                                       'name': 'cli-workflow-identity-projection',
                                       'products': ['HELIX-OS'],
                                       'reason': 'The projection publishes only an authority-validated typed workflow identity and rejects '
                                                 'legacy identity emission at the CLI boundary; this is HELIX-OS authority control.',
                                       'start': 17},
 'LEGACY-ASSET-F6A0AC0CAC1590A754EC': {'category': 'insufficient_basis',
                                       'end': 42,
                                       'legacy': 'The commit analysis is static shared tooling evidence and does not establish CI, '
                                                 'release, or product authority.',
                                       'name': 'commit-subject',
                                       'products': [],
                                       'reason': 'The utility checks conventional commit subject formatting and generated-message '
                                                 'exceptions; repository hygiene alone does not prove a product owner.',
                                       'start': 20},
 'LEGACY-ASSET-FB68EE8F149A118B21C4': {'category': 'direct_product_basis',
                                       'end': 45,
                                       'legacy': 'The registry is static command-boundary evidence; no provider command, consumer state, '
                                                 'or release operation was executed.',
                                       'name': 'distribution-consumer-command-registry',
                                       'products': ['HELIX-OS'],
                                       'reason': 'The registry defines bounded Lite consumer command identities, provider admission, '
                                                 'dry-run flags, and failure codes; this is HELIX-OS distribution operation control.',
                                       'start': 1},
 'LEGACY-ASSET-FC956FCBF42A39429E96': {'category': 'multi_product_conflict',
                                       'end': 341,
                                       'legacy': 'The source explicitly leaves screen mock and adapter composition as later stages; no '
                                                 'design requirement, Web surface, or implementation was generated.',
                                       'name': 'design-elicitation',
                                       'products': ['HELIX-HARNESS', 'HELIX-Web'],
                                       'reason': 'The engine derives screen design requirements from backend capabilities, harness.db '
                                                 'projections, CLI capabilities, and screen traces; HARNESS requirement/design meaning and '
                                                 'HELIX-Web presentation responsibility compete.',
                                       'start': 261}}
EXPECTED_TARGET_IDS = ('LEGACY-ASSET-02FA69982286FDE5A8C9', 'LEGACY-ASSET-04C6A8AFA15A1BDF0A1D', 'LEGACY-ASSET-07A927901B7F9981783F', 'LEGACY-ASSET-08F8688895B787BD3D5C', 'LEGACY-ASSET-0996E33E11CB9283EEC8', 'LEGACY-ASSET-0D09591FDF9E486737C0', 'LEGACY-ASSET-110F52E3C367C3DCCFE5', 'LEGACY-ASSET-11379713A3797CAC3141', 'LEGACY-ASSET-313DC99AEF53834D9207', 'LEGACY-ASSET-321E904B969DE1EE27C9', 'LEGACY-ASSET-3290C9A3BA7FAD7BA07C', 'LEGACY-ASSET-354670A58AC796DDC80F', 'LEGACY-ASSET-4010B567B1B736F68EF2', 'LEGACY-ASSET-412ED61BCBBD6ACCC3C1', 'LEGACY-ASSET-429C4F8FB5B0332F798C', 'LEGACY-ASSET-4329EAEA146D5D97E088', 'LEGACY-ASSET-499354506CDE051E21CF', 'LEGACY-ASSET-4A9AB5B2EF182BC30431', 'LEGACY-ASSET-4D3446684F730BFEB99E', 'LEGACY-ASSET-555329E1E192F23D2865', 'LEGACY-ASSET-58C7AC6F205F982B0729', 'LEGACY-ASSET-5AADD905DFEE4E4071D6', 'LEGACY-ASSET-5BABA53229DF9A5DECEF', 'LEGACY-ASSET-5C2DF2B855AA1C9CB445', 'LEGACY-ASSET-5D86AA4EF7034A49C54C', 'LEGACY-ASSET-5EC2737F0CEF4B72F223', 'LEGACY-ASSET-64E68EA11CDB499951A2', 'LEGACY-ASSET-66A3EB90764ABB6E7F57', 'LEGACY-ASSET-6B10C0467A1A1918D46E', 'LEGACY-ASSET-7EFC65F55C9558943274', 'LEGACY-ASSET-7FC5B506E0B82D54278D', 'LEGACY-ASSET-8F85476FEB95D1284680', 'LEGACY-ASSET-96B81A6EE3E834E03144', 'LEGACY-ASSET-9EE409F304E148DD975C', 'LEGACY-ASSET-A3EC7F28F52F2808041E', 'LEGACY-ASSET-B09097E01CEC58F07B16', 'LEGACY-ASSET-B85C45D7C5621BD8201C', 'LEGACY-ASSET-C070EF163B7D48606ECE', 'LEGACY-ASSET-C4C93ABA07B48AAB6D05', 'LEGACY-ASSET-C6570CC25A043BB2B417', 'LEGACY-ASSET-CD0EAE866A7CA2A0D1F8', 'LEGACY-ASSET-D331F13A1FA21B0C05FE', 'LEGACY-ASSET-D6339A02201B20481C3F', 'LEGACY-ASSET-D641C9E49847C74848CE', 'LEGACY-ASSET-D73981AB049C177AC184', 'LEGACY-ASSET-D8787D8B14310B1A1E77', 'LEGACY-ASSET-DC7FD5CB8C1B4F9C8E29', 'LEGACY-ASSET-DF48E86F1E92DB436CFF', 'LEGACY-ASSET-E1B0DC33FA5DDC799FFB', 'LEGACY-ASSET-E9F6609D6EBDEBD288BC', 'LEGACY-ASSET-ECE1AFAAE85425CD29BB', 'LEGACY-ASSET-EFFA71383D8FAE4EBBBA', 'LEGACY-ASSET-F2B7BCF14B8563B15C14', 'LEGACY-ASSET-F38F4C78F60DF814428A', 'LEGACY-ASSET-F45E18DC5CE003BD8D91', 'LEGACY-ASSET-F5C9B1066B7337E45182', 'LEGACY-ASSET-F6A0AC0CAC1590A754EC', 'LEGACY-ASSET-FB68EE8F149A118B21C4', 'LEGACY-ASSET-FC956FCBF42A39429E96')
EXPECTED_MANUAL_REVIEWED_ASSET_IDS = frozenset(EXPECTED_TARGET_IDS)
EXPECTED_SOURCE_WAVE_OVERLAP_IDS = ('LEGACY-ASSET-04C6A8AFA15A1BDF0A1D', 'LEGACY-ASSET-11379713A3797CAC3141', 'LEGACY-ASSET-4010B567B1B736F68EF2', 'LEGACY-ASSET-412ED61BCBBD6ACCC3C1', 'LEGACY-ASSET-429C4F8FB5B0332F798C', 'LEGACY-ASSET-C6570CC25A043BB2B417', 'LEGACY-ASSET-D6339A02201B20481C3F', 'LEGACY-ASSET-D8787D8B14310B1A1E77', 'LEGACY-ASSET-DF48E86F1E92DB436CFF', 'LEGACY-ASSET-F38F4C78F60DF814428A', 'LEGACY-ASSET-FC956FCBF42A39429E96')

def fail(code: str, message: str) -> None:
    raise AssertionError(f"{code}: {message}")

def tagged(data: bytes) -> str:
    return "sha256:" + hashlib.sha256(data).hexdigest()

def canonical(value: object) -> str:
    return tagged(json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode())


def fixed_inventory_ids(pin: dict) -> set[str]:
    data = (ROOT / pin["path"]).read_bytes()
    if tagged(data) != pin["sha256"]:
        fail("E_OVERLAP", f"reference inventory digest drift {pin['path']}")
    obj = json.loads(data)
    ids = obj.get("expected_sets", {}).get("target_asset_ids")
    if not isinstance(ids, list) or len(ids) != pin["count"] or len(set(ids)) != pin["count"]:
        fail("E_OVERLAP", f"reference inventory target set drift {pin['path']}")
    if obj.get("binding_id") != pin["binding_id"] or obj.get("expected_sets", {}).get("target_asset_count") != pin["count"]:
        fail("E_OVERLAP", f"reference inventory identity/count drift {pin['path']}")
    return set(ids)


def fixed_schema_ids() -> set[str]:
    try:
        subprocess.check_call(["git", "merge-base", "--is-ancestor", BASE_REVISION, SCHEMA_DEPENDENCY["commit"]], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        data = subprocess.check_output(["git", "show", f"{SCHEMA_DEPENDENCY['commit']}:{SCHEMA_DEPENDENCY['path']}"], stderr=subprocess.PIPE)
    except subprocess.CalledProcessError as exc:
        fail("E_OVERLAP", f"schema dependency is unavailable: {exc}")
    if tagged(data) != SCHEMA_DEPENDENCY["sha256"]:
        fail("E_OVERLAP", "schema dependency inventory digest drift")
    obj = json.loads(data)
    ids = obj.get("expected_sets", {}).get("target_asset_ids")
    if not isinstance(ids, list) or len(ids) != SCHEMA_DEPENDENCY["count"] or len(set(ids)) != SCHEMA_DEPENDENCY["count"]:
        fail("E_OVERLAP", "schema dependency target set drift")
    if obj.get("binding_id") != SCHEMA_DEPENDENCY["binding_id"] or obj.get("expected_sets", {}).get("target_asset_count") != SCHEMA_DEPENDENCY["count"]:
        fail("E_OVERLAP", "schema dependency identity/count drift")
    return set(ids)


def expected_research_overlap(source_ids: set[str]) -> dict:
    sets = {name: fixed_inventory_ids(pin) for name, pin in REFERENCE_INVENTORY_PINS.items()}
    sets["schema_unresolved_src"] = fixed_schema_ids()
    sets["source_prefix_unresolved"] = set(source_ids)
    pair_names = [
        ("schema_unresolved_src", "wave_unresolved_product", "schema_wave_unresolved_product"),
        ("schema_unresolved_src", "lint_unresolved_src", "schema_lint_unresolved_src"),
        ("schema_unresolved_src", "runtime_unresolved_src", "schema_runtime_unresolved_src"),
        ("runtime_unresolved_src", "wave_unresolved_product", "runtime_wave_unresolved_product"),
        ("runtime_unresolved_src", "lint_unresolved_src", "runtime_lint_unresolved_src"),
        ("wave_unresolved_product", "lint_unresolved_src", "wave_unresolved_product_lint_unresolved_src"),
        ("source_prefix_unresolved", "wave_unresolved_product", "source_wave_unresolved_product"),
        ("source_prefix_unresolved", "lint_unresolved_src", "source_lint_unresolved_src"),
        ("source_prefix_unresolved", "runtime_unresolved_src", "source_runtime_unresolved_src"),
        ("source_prefix_unresolved", "schema_unresolved_src", "source_schema_unresolved_src"),
    ]
    intersections = {key: len(sets[left] & sets[right]) for left, right, key in pair_names}
    intersection_ids = {key: sorted(sets[left] & sets[right]) for left, right, key in pair_names}
    result = {
        "reference_bundle_counts": {name: len(ids) for name, ids in sets.items()},
        "reference_inventory_pins": {name: pin for name, pin in REFERENCE_INVENTORY_PINS.items()},
        "schema_dependency": SCHEMA_DEPENDENCY,
        "pairwise_intersections": intersections,
        "union_count": len(set().union(*sets.values())),
    }
    result.update({f"{key}_asset_ids": value for key, value in intersection_ids.items() if key != "source_schema_unresolved_src"})
    result["source_schema_overlap_asset_ids"] = intersection_ids["source_schema_unresolved_src"]
    return result

@lru_cache(maxsize=None)
def git_bytes(path: str, base: str = BASE_REVISION) -> bytes:
    try:
        return subprocess.check_output(["git", "show", f"{base}:{path}"], stderr=subprocess.PIPE)
    except subprocess.CalledProcessError as exc:
        fail("E_BASE_SOURCE", f"missing fixed-base path {path}: {exc}")

@lru_cache(maxsize=None)
def git_blob(path: str, base: str = BASE_REVISION) -> str:
    try:
        return subprocess.check_output(["git", "rev-parse", f"{base}:{path}"], text=True, stderr=subprocess.PIPE).strip()
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

def verify_category_invariant(record: dict, pin: dict) -> None:
    category = record.get("classification_category")
    rule = CATEGORY_RULES.get(category)
    if rule is None:
        fail("E_CLASSIFICATION", f"unknown category {record.get('asset_id')}")
    products = record.get("candidate_products")
    manual = record.get("manual_semantic_review")
    if not isinstance(products, list) or len(products) != rule["product_count"] or len(set(products)) != len(products):
        fail("E_CLASSIFICATION", f"category/product cardinality mismatch {record.get('asset_id')}")
    if not isinstance(manual, dict) or manual.get("status") != rule["status"] or manual.get("candidate_products") != products:
        fail("E_SEMANTIC_REVIEW", f"category review status mismatch {record.get('asset_id')}")
    l1 = manual.get("l1_evidence")
    expected_l1 = l1_evidence()
    if not isinstance(l1, dict) or set(l1) != set(products) or any(l1.get(product) != expected_l1[product] for product in products):
        fail("E_SEMANTIC_REVIEW", f"category L1 evidence mismatch {record.get('asset_id')}")
    if pin.get("category") != category or pin.get("products") != products:
        fail("E_CLASSIFICATION", f"human review pin drift {record.get('asset_id')}")

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
    if not isinstance(static, dict) or set(static) != {"failure", "consumer"}:
        fail("E_BOUNDARY_DIGEST", f"failure/consumer static ref key set mismatch {record.get('asset_id', '')}")
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
    targets = sorted(a for a, (_, r) in phase_by_asset.items() if r.get("product_classification_status") == "unresolved" and any(r.get("source_path", "").startswith(prefix) for prefix in SOURCE_PREFIXES_FIXED))
    if tuple(targets) != EXPECTED_TARGET_IDS or len(targets) != 59: fail("E_TARGET_SET", "fixed BASE target ID set drift")
    if set(PINNED_REVIEWS) != set(targets): fail("E_REVIEW_PIN", "independent review pin set drift")
    verify_inputs(inventory, targets, phase_by_asset)
    if any(not isinstance(row, dict) for row in rows): fail("E_RECORD_SCHEMA", "record is not an object")
    row_ids = [row.get("asset_id") for row in rows]
    if any(not isinstance(asset_id, str) or not asset_id for asset_id in row_ids): fail("E_TARGET_SET", "record asset_id is missing or not a string")
    if len(rows) != 59 or sorted(row_ids) != targets or len(set(row_ids)) != 59: fail("E_TARGET_SET", "records have missing, duplicate, or extra target asset")
    expected_set = {"target_asset_count": 59, "target_asset_ids": targets, "target_asset_ids_sha256": tagged("\n".join(targets).encode()), "source_paths": [phase_by_asset[a][1]["source_path"] for a in targets]}
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
        if not isinstance(aid, str) or not aid: fail("E_TARGET_SET", "asset_id is missing or not a string")
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
        if not isinstance(units, list) or any(not isinstance(unit, dict) for unit in units):
            fail("E_CANDIDATE_PRODUCTS", f"unit candidate list/object invalid {aid}")
        if any(set(unit) != {"unit_candidate_id", "crosswalk", "decomposition"} for unit in units):
            fail("E_CANDIDATE_PRODUCTS", f"unit candidate key set mismatch {aid}")
        if [u.get("unit_candidate_id") for u in units] != unit_ids: fail("E_CANDIDATE_PRODUCTS", aid)
        for unit in units:
            uid = unit.get("unit_candidate_id")
            if uid not in cw or uid not in decomp or unit.get("crosswalk") != cw[uid] or unit.get("decomposition") != decomp[uid]: fail("E_CANDIDATE_PRODUCTS", f"{aid}:{uid}")
        verify_category_invariant(record, pin)
        if record.get("classification_reason") != pin["reason"] + " Candidate only; formal product authority remains unresolved." or record.get("observed_wave_products") != wave_products: fail("E_CLASSIFICATION", aid)
        if record.get("manual_semantic_review") != expected_manual(archive_path, pin): fail("E_SEMANTIC_REVIEW", aid)
        expected_legacy = {"disposition": disp.get("disposition"), "implementation_status": disp.get("implementation_status"), "execution_performed": False, "interpretation": pin["legacy"], "source_anchor": expected_anchor(archive_path, pin)}
        if record.get("legacy_implementation_shrinkage_evidence") != expected_legacy: fail("E_LEGACY_EVIDENCE", aid)
        if record.get("semantic_link_statuses") != sorted({x.get("semantic_link_status") for x in links}) or record.get("artifact_evidence_kinds") != (sorted({x.get("artifact_evidence_kind") for x in links}) if links else ["implementation_source"]): fail("E_EDGE_SET", aid)
        if record.get("legacy_history_failure_consumer") != expected_history(aid, dispositions, decisions, read_afters): fail("E_HISTORY", aid)
        if record.get("authority_effect") != "none" or record.get("classification_state") != "research_proposal_pending_human_product_review" or record.get("formal_asset_classification_updated") is not False or record.get("new_build_allowed") is not False: fail("E_AUTHORITY_PROMOTION", aid)
        if record.get("human_judgment_remaining") != ["product_owner_and_boundary_decision", "source_semantic_anchor_acceptance", "phase_admission_and_successor_assignment", "legacy_consumer_closure_and_failure_disposition", "formal_asset_classification_update"]: fail("E_HUMAN_JUDGMENT", aid)
        verify_static_ranges(record)
        expected_categories[pin["category"]] += 1
    counts = inventory.get("counts", {})
    phase_distribution = Counter(tuple(phase_by_asset[a][1].get("candidate_phase_targets") or []) for a in targets)
    evidence_counts = Counter(phase_by_asset[a][1].get("artifact_evidence_kind") for a in targets)
    expected_counts = {"wave_files": 50, "wave_edges": 598, "wave_unique_assets": 355, "target_assets": 59, "target_wave_edges": expected_edges, "target_wave_linked_assets": sum(bool(by_asset.get(a)) for a in targets), "categories": dict(sorted(expected_categories.items())), "target_asset_artifact_evidence_kinds": dict(sorted(evidence_counts.items())), "target_phase_candidate_distribution": {"|".join(k): v for k, v in sorted(phase_distribution.items())}}
    if counts != expected_counts: fail("E_EXPECTED_DENOMINATOR", "inventory counts mismatch")
    if inventory.get("review_counts") != {"source_semantic_reviewed": 59, "source_semantic_review_pending": 0, "direct_candidate_basis": expected_categories["direct_product_basis"], "multi_product_conflict": expected_categories["multi_product_conflict"], "insufficient_basis": expected_categories["insufficient_basis"]}: fail("E_SEMANTIC_REVIEW", "review counts mismatch")
    if set(inventory.get("manual_reviewed_asset_ids", [])) != set(targets) or len(inventory.get("manual_reviewed_asset_ids", [])) != 59: fail("E_SEMANTIC_REVIEW", "manual reviewed set mismatch")
    expected_meta = {"schema_revision": 1, "binding_id": BINDING_ID_FIXED, "scope": "phase product unresolved + five source prefixes exact 59 assets", "wave_source_paths": {str(n): path for n, path in WAVE_PATHS_FIXED.items()}, "expected_sets": expected_set, "old_asset_source_mode": "archive bytes are read through git show BASE:<archive-path>; never executed", "formal_update": {"formal_asset_classification_updated": False, "phase_ledger_updated": False, "product_route_updated": False, "successor_updated": False, "new_build_allowed": False, "authority_effect": "none"}, "classification_rule": {"direct_product_basis": "a reviewed concrete source span mapped to one product L1 with explicit boundary counterevidence and pending consumer evidence", "multi_product_conflict": "reviewed source behavior contains concrete responsibilities mapped to two product boundaries; no single owner is proposed", "insufficient_basis": "source is generic, tombstone, shared infrastructure, or lacks an accepted product-boundary proof; observed Wave scope is not inherited"}, "boundary_refs": {"product_boundary": BOUNDARY_FIXED, "l1": L1_FIXED}, "history_failure_consumer": {"disposition_rows": 59, "decision_rows_for_targets": sum(bool(r["legacy_history_failure_consumer"]["decisions"]) for r in rows), "read_after_rows_for_targets": sum(bool(r["legacy_history_failure_consumer"]["read_after"]) for r in rows), "failure_consumer_refs_are_static_global_inventory": True}, "edge_contract": {"edge_identity": "edge_id derived from wave/path/line/asset_id/unit_candidate_id/semantic_link_status", "duplicate_edges_forbidden": True, "missing_edges_forbidden": True}, "authority_boundary": {"authority_effect": "none", "classification_state": "research_proposal_pending_human_product_review", "formal_asset_classification_updated": False, "new_build_allowed": False}, "artifacts": ["scaffold/bindings/SCF-B-0123.json", "scaffold/legacy-source-product-classification-0123/README.md", "scaffold/legacy-source-product-classification-0123/PR-DRAFT.md", "scaffold/legacy-source-product-classification-0123/generate.py", "scaffold/legacy-source-product-classification-0123/validate.py", "scaffold/legacy-source-product-classification-0123/selfcheck.py", "scaffold/legacy-source-product-classification-0123/inventory.json", "scaffold/legacy-source-product-classification-0123/classification-research.jsonl"]}
    expected_overlap = expected_research_overlap(set(targets))
    expected_top = set(expected_meta) | {"base_revision", "base_source_mode", "counts", "input_digests", "output_sha256", "review_counts", "manual_reviewed_asset_ids", "negative_cases", "research_overlap"}
    if set(inventory) != expected_top: fail("E_INVENTORY_DECLARATION", "inventory top-level key set mismatch")
    for key, value in expected_meta.items():
        if inventory.get(key) != value: fail("E_INVENTORY_DECLARATION", f"inventory {key} mismatch")
    if inventory.get("research_overlap") != expected_overlap: fail("E_OVERLAP", "research bundle intersection declaration drift")
    if inventory.get("output_sha256") != tagged(LEDGER.read_bytes()): fail("E_OUTPUT_DIGEST", "classification output digest mismatch")
    print(f"SCF-B-0123 validate: PASS records=59 target_edges={expected_edges} categories={dict(sorted(expected_categories.items()))}")
    return {"rows": rows, "inventory": inventory}

if __name__ == "__main__":
    verify()

#!/usr/bin/env python3
"""Independent fail-closed validator for SCF-B-0120 runtime research."""
from __future__ import annotations
import hashlib, json, subprocess
from collections import Counter, defaultdict
from functools import lru_cache
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BUNDLE = ROOT / "scaffold/legacy-schema-product-classification-0120"
LEDGER = BUNDLE / "classification-research.jsonl"
INVENTORY = BUNDLE / "inventory.json"
BINDING = ROOT / "scaffold/bindings/SCF-B-0120.json"
BASE_REVISION = "5562f04da0f3205f9aa58205ec0d478419fc4f2e"
BINDING_ID_FIXED = "SCF-B-0120"
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
SISTER_INVENTORIES_FIXED = {
    "lint_unresolved_src": "scaffold/legacy-lint-product-classification-0108/inventory.json",
    "runtime_unresolved_src": "scaffold/legacy-runtime-product-classification-0117/inventory.json",
}
SISTER_INVENTORY_BLOBS_FIXED = {
    "scaffold/legacy-lint-product-classification-0108/inventory.json": "a97ebd5190bef017b94499e75caf5a95dae162d8",
    "scaffold/legacy-runtime-product-classification-0117/inventory.json": "0003d5aa7bc4a3defc43b4b51c280941c206f1e4",
}
EXPECTED_NEGATIVE_CASES = ['target_record_omission', 'target_record_duplicate', 'edge_omission', 'edge_duplicate', 'source_digest_tamper', 'source_anchor_tamper', 'source_profile_tamper', 'candidate_product_tamper', 'classification_category_tamper', 'semantic_review_tamper', 'legacy_evidence_tamper', 'boundary_digest_tamper', 'input_digest_omission', 'input_digest_duplicate', 'input_digest_extra_path', 'authority_promotion', 'record_top_level_extra_key', 'source_read_mode_tamper', 'inventory_authority_promotion', 'inventory_scope_tamper', 'inventory_formal_update_tamper', 'inventory_classification_rule_tamper', 'inventory_counts_artifact_kind_tamper', 'inventory_edge_count_tamper', 'fixed_BASE_non_ancestor', 'generator_review_spec_tamper', 'generator_anchor_tamper', 'generator_l1_tamper', 'base_pin_tamper', 'base_source_missing', 'history_tamper', 'human_judgment_tamper', 'input_digest_value_tamper', 'inventory_negative_case_tamper', 'output_digest_tamper', 'phase_status_tamper', 'source_line_range_tamper', 'inventory_overlap_tamper', 'category_evidence_invariant_direct', 'category_evidence_invariant_conflict', 'category_evidence_invariant_insufficient', 'failure_consumer_static_refs_key_closure', 'unit_product_candidates_key_closure', 'asset_id_type', 'unit_product_candidates_type', 'sister_inventory_blob_tamper', 'generator_category_pin_tamper', 'generator_products_pin_tamper', 'review_pin_omission', 'ledger_record_duplicate_key', 'ledger_nested_duplicate_key', 'inventory_duplicate_key', 'ledger_malformed_json', 'inventory_nonobject_json', 'binding_upstream_omission', 'binding_upstream_extra_path', 'binding_wave1_digest_tamper', 'binding_wave37_digest_tamper', 'binding_wave50_digest_tamper']
EXPECTED_NONARCHIVE_INPUT_PATHS = tuple(path for path in [*WAVE_PATHS_FIXED.values(), *GLOBAL_INPUTS_FIXED] if not path.startswith("archive/"))
EXPECTED_ARCHIVE_INPUT_PATHS = tuple(path for path in [*WAVE_PATHS_FIXED.values(), *GLOBAL_INPUTS_FIXED] if path.startswith("archive/"))
RECORD_KEYS = frozenset({"artifact_evidence_kinds", "asset_id", "asset_ledger", "authority_effect", "boundary_evidence", "candidate_products", "classification_category", "classification_reason", "classification_state", "failure_consumer_static_refs", "formal_asset_classification_updated", "human_judgment_remaining", "l1_evidence", "legacy_history_failure_consumer", "legacy_implementation_shrinkage_evidence", "manual_semantic_review", "new_build_allowed", "observed_wave_products", "phase_ledger", "semantic_link_statuses", "source_exact", "source_profile", "unit_product_candidates", "wave_semantic_links"})
SOURCE_KEYS = frozenset({"archive_path", "blob", "bytes", "ledger_source_sha256", "line_count", "read_mode", "semantic_anchors", "sha256", "source_path"})
# Fixed BASE semantic review pins are independent of generate.py.  Generator
# table/anchor/L1 mutations followed by regeneration must fail against these.
PINNED_REVIEWS = {'LEGACY-ASSET-11C75CC63968FB9A5BD2': {'category': 'direct_product_basis',
                                       'end': 243,
                                       'legacy': 'Disposition remains unresolved with implementation_status=unknown; the source documents a legacy compatibility shrinkage rule (legacy input accepted '
                                                 'only with warning and no emitted legacy identity), but no current runtime execution or authority promotion is asserted.',
                                       'name': 'current-location-workflow-identity-resolver',
                                       'products': ['HELIX-OS'],
                                       'reason': 'The resolver binds current workflow identity to the installed authority catalog, rejects ambiguous typed/legacy input, and suppresses legacy '
                                                 'identity emission; this is HELIX-OS authority and execution routing control.',
                                       'start': 139},
 'LEGACY-ASSET-132E6449FA96E5CABBBF': {'category': 'direct_product_basis',
                                       'end': 41,
                                       'legacy': 'Disposition remains unresolved with implementation_status=unknown; the command matcher is preserved as old verification evidence without declaring a '
                                                 'current route or execution success.',
                                       'name': 'green-command',
                                       'products': ['HELIX-HARNESS'],
                                       'reason': 'The source binds green command kinds to test, typecheck, lint, doctor, and V-model verification command evidence; this is a HARNESS verification '
                                                 'admission contract.',
                                       'start': 21},
 'LEGACY-ASSET-18579F09E6B2C29E5622': {'category': 'insufficient_basis',
                                       'end': 17,
                                       'legacy': 'Disposition remains unresolved with implementation_status=unknown; generic types preserve old schema vocabulary but provide no implementation or '
                                                 'shrinkage decision.',
                                       'name': 'harness-db-types',
                                       'products': [],
                                       'reason': 'The source defines generic ColumnDef, TableDef, and IndexDef shapes; type declarations alone do not identify a product owner or runtime authority.',
                                       'start': 10},
 'LEGACY-ASSET-187E43CE3096B88CA8B4': {'category': 'direct_product_basis',
                                       'end': 21,
                                       'legacy': 'Disposition remains unresolved with implementation_status=unknown; the type contract preserves legacy/typed transition evidence without claiming '
                                                 'implementation closure.',
                                       'name': 'current-location-workflow-identity',
                                       'products': ['HELIX-OS'],
                                       'reason': 'The source defines typed workflow identity and receipt dispositions for stale, unsupported, and converted authority observations; this is HELIX-OS '
                                                 'operational authority evidence.',
                                       'start': 5},
 'LEGACY-ASSET-18EBF31B40C9A58DE958': {'category': 'direct_product_basis',
                                       'end': 271,
                                       'legacy': 'Disposition remains unresolved with implementation_status=unknown; the source retains pricing/model registry history and explicitly avoids unlisted '
                                                 'model cost invention, but no provider execution is claimed.',
                                       'name': 'model-registry',
                                       'products': ['HELIX-OS'],
                                       'reason': 'The source validates provider model IDs, pricing, and reasoning effort maps as a bounded runtime capability registry; this is HELIX-OS provider and '
                                                 'operational control.',
                                       'start': 239},
 'LEGACY-ASSET-1ABE9822E36400BC82C2': {'category': 'insufficient_basis',
                                       'end': 2,
                                       'legacy': 'Disposition remains unresolved with implementation_status=unknown; generic helpers have no product-boundary or consumer closure evidence and remain '
                                                 'static only.',
                                       'name': 'harness-db-table-builders',
                                       'products': [],
                                       'reason': 'The source provides generic table/primary-key builder helpers; shared schema construction alone does not establish HARNESS or HELIX-OS '
                                                 'responsibility.',
                                       'start': 1},
 'LEGACY-ASSET-1AE119F9830818EAA0D5': {'category': 'direct_product_basis',
                                       'end': 103,
                                       'legacy': 'Disposition remains unresolved with implementation_status=unknown; the explicit legacy adapter and fail-close dispositions are shrinkage evidence, '
                                                 'not proof of current implementation or authority.',
                                       'name': 'workflow-classification-legacy-adapter',
                                       'products': ['HELIX-OS'],
                                       'reason': 'The adapter converts bounded legacy mode/model input to a typed workflow identity, marks ambiguous/unsupported values, and sets '
                                                 'emit_legacy_identity=false; this is HELIX-OS compatibility control.',
                                       'start': 43},
 'LEGACY-ASSET-2B68A62292FADDC5BCA6': {'category': 'direct_product_basis',
                                       'end': 7,
                                       'legacy': 'Disposition remains unresolved with implementation_status=unknown; the old identifier helper is static evidence and does not prove a current plan '
                                                 'implementation.',
                                       'name': 'loop-plan-id',
                                       'products': ['HELIX-HARNESS'],
                                       'reason': 'The source validates a bounded PLAN loop identity used by the HARNESS plan and verification contract; the identifier grammar is an artifact identity '
                                                 'rule.',
                                       'start': 4},
 'LEGACY-ASSET-30539BEC772802F50C9D': {'category': 'direct_product_basis',
                                       'end': 103,
                                       'legacy': 'Disposition remains unresolved with implementation_status=unknown; graph/export schema is old static evidence and its writer, migration, and '
                                                 'consumer closure remain unproven.',
                                       'name': 'harness-db-tables-graph',
                                       'products': ['HELIX-HARNESS'],
                                       'reason': 'The source declares relation graph, document export, and verification profile evidence tables, which preserve HARNESS design and verification trace '
                                                 'artifacts.',
                                       'start': 4},
 'LEGACY-ASSET-32FD3269C766571AD5DA': {'category': 'multi_product_conflict',
                                       'end': 50,
                                       'legacy': 'Disposition remains unresolved with implementation_status=unknown; terminal fullback retains requirements and legacy fallback evidence but has no '
                                                 'approved successor or execution closure.',
                                       'name': 'workflow-classification-terminal-fullback-authority',
                                       'products': ['HELIX-HARNESS', 'HELIX-OS'],
                                       'reason': 'The schema binds requirements authority, forward plan slices, and operational consumers for terminal fullback; HARNESS requirements/plan meaning and '
                                                 'OS authority execution overlap.',
                                       'start': 14},
 'LEGACY-ASSET-3AEDBB3A9A7B549C4C24': {'category': 'multi_product_conflict',
                                       'end': 96,
                                       'legacy': 'Disposition remains unresolved with implementation_status=unknown; team schema preserves safety defaults and provider constraints without proving an '
                                                 'executing team runtime or single owner.',
                                       'name': 'team',
                                       'products': ['HELIX-HARNESS', 'HELIX-OS'],
                                       'reason': 'The source validates team strategy, provider/model overrides, parallelism, and serialization reasons; HARNESS delegation/process contract and OS '
                                                 'runtime/provider control overlap.',
                                       'start': 74},
 'LEGACY-ASSET-3D7D5062903EE9CEDFEF': {'category': 'multi_product_conflict',
                                       'end': 91,
                                       'legacy': 'Disposition remains unresolved with implementation_status=unknown; reservation authority is retained as old schema evidence with no approved plan '
                                                 'owner, writer, or successor.',
                                       'name': 'open-branch-plan-reservation-authority',
                                       'products': ['HELIX-HARNESS', 'HELIX-OS'],
                                       'reason': 'The source validates plan reservation, terminal evidence, pull request, and writer surfaces; HARNESS plan identity and OS authority/writer control '
                                                 'are inseparable in this contract.',
                                       'start': 78},
 'LEGACY-ASSET-414CC59CA35B28BB7AF4': {'category': 'direct_product_basis',
                                       'end': 199,
                                       'legacy': 'Disposition remains unresolved with implementation_status=unknown; runtime evidence schemas are read-only historical evidence and old execution was '
                                                 'not performed.',
                                       'name': 'runtime-verification',
                                       'products': ['HELIX-OS'],
                                       'reason': 'The source classifies runtime claims, rejects projection-only evidence, and builds privacy-safe verification log events; this is HELIX-OS runtime '
                                                 'evidence and state control.',
                                       'start': 140},
 'LEGACY-ASSET-5442594ED146AD72850C': {'category': 'direct_product_basis',
                                       'end': 123,
                                       'legacy': 'Disposition remains unresolved with implementation_status=unknown; design projection table declarations are retained for static comparison and no '
                                                 'database implementation is claimed.',
                                       'name': 'harness-db-tables-design',
                                       'products': ['HELIX-HARNESS'],
                                       'reason': 'The source declares design and requirement trace projection tables used to preserve HARNESS artifact relationships; the reviewed schema is a HARNESS '
                                                 'V-model artifact contract.',
                                       'start': 4},
 'LEGACY-ASSET-67D77EEBF1209346882C': {'category': 'multi_product_conflict',
                                       'end': 228,
                                       'legacy': 'Disposition remains unresolved with implementation_status=unknown; raw command and legacy identity suppression are preserved as shrinkage evidence, '
                                                 'not formal authority.',
                                       'name': 'workflow-execution-policy-registry',
                                       'products': ['HELIX-HARNESS', 'HELIX-OS'],
                                       'reason': 'The registry binds requirements source digests and classification identities to command/policy bindings and approval stages; HARNESS policy meaning '
                                                 'and OS execution control conflict.',
                                       'start': 129},
 'LEGACY-ASSET-72ECA3C318F8028A6D91': {'category': 'insufficient_basis',
                                       'end': 23,
                                       'legacy': 'Disposition remains unresolved with implementation_status=unknown; the generic tree contract is preserved as static evidence and has no old '
                                                 'implementation/consumer closure.',
                                       'name': 'visualization-tree-contract',
                                       'products': [],
                                       'reason': 'The source explicitly calls itself an adapter-neutral tree contract and assigns presentation decoration to adapters; no product boundary is proven '
                                                 'by this generic DTO.',
                                       'start': 1},
 'LEGACY-ASSET-85F302A8E7280A166171': {'category': 'direct_product_basis',
                                       'end': 10,
                                       'legacy': 'Disposition remains unresolved with implementation_status=unknown; the source is retained as a static contract helper and no current implementation '
                                                 'or consumer closure is asserted.',
                                       'name': 'atomic-contract-id',
                                       'products': ['HELIX-HARNESS'],
                                       'reason': 'The source explicitly projects a requirements-owned atomic behavior contract identifier and validates its canonical form; this is a HARNESS '
                                                 'requirement and contract identity boundary.',
                                       'start': 8},
 'LEGACY-ASSET-8A390337BEE15CED1AA2': {'category': 'direct_product_basis',
                                       'end': 54,
                                       'legacy': 'Disposition remains unresolved with implementation_status=unknown; semantic table declarations are retained without treating them as a formal '
                                                 'product route.',
                                       'name': 'harness-db-tables-semantic',
                                       'products': ['HELIX-HARNESS'],
                                       'reason': 'The source declares semantic requirement, layer, and trace projection tables for the HARNESS V-model contract.',
                                       'start': 13},
 'LEGACY-ASSET-95ACDEA21F7AF6996D4A': {'category': 'direct_product_basis',
                                       'end': 177,
                                       'legacy': 'Disposition remains unresolved with implementation_status=unknown; the source preserves the transition from legacy workflow values to current typed '
                                                 'identity and does not emit legacy identity as effective authority.',
                                       'name': 'workflow-classification-catalog',
                                       'products': ['HELIX-OS'],
                                       'reason': 'The source projects the installed workflow classification registry into a typed catalog and rejects stale or mismatched source digests; this is '
                                                 'HELIX-OS authority projection.',
                                       'start': 131},
 'LEGACY-ASSET-97D1784D53918F126E3B': {'category': 'insufficient_basis',
                                       'end': 79,
                                       'legacy': 'Disposition remains unresolved with implementation_status=unknown; adapter-neutral presentation types are retained as shrinkage/boundary evidence '
                                                 'without inheriting Web or HARNESS ownership.',
                                       'name': 'visualization-contract',
                                       'products': [],
                                       'reason': 'The source is an adapter-neutral visualization DTO and explicitly says builders/adapters own extension while this layer owns no I/O; the span is '
                                                 'insufficient to classify a product owner.',
                                       'start': 41},
 'LEGACY-ASSET-9BFD3E86A8F5AE0DA720': {'category': 'multi_product_conflict',
                                       'end': 20,
                                       'legacy': 'Disposition remains unresolved with implementation_status=unknown; the old catalog is schema evidence only, and migration/writer implementation plus '
                                                 'product closure are unverified.',
                                       'name': 'harness-db-catalog',
                                       'products': ['HELIX-HARNESS', 'HELIX-OS'],
                                       'reason': 'The catalog enumerates harness.db tables while the same registry is consumed by migration and projection writers; HARNESS artifact schema and OS '
                                                 'state/writer control meet, so one owner cannot be inferred.',
                                       'start': 10},
 'LEGACY-ASSET-B5482F292A2E654347E8': {'category': 'direct_product_basis',
                                       'end': 135,
                                       'legacy': 'Disposition remains unresolved with implementation_status=unknown; roadmap validation remains old planning evidence with no accepted successor or '
                                                 'execution closure.',
                                       'name': 'roadmap',
                                       'products': ['HELIX-HARNESS'],
                                       'reason': 'The source validates roadmap gates, spans, feature packs, and ordering constraints; this is HARNESS process and V-model planning contract behavior.',
                                       'start': 85},
 'LEGACY-ASSET-B8033A9BCD9CC70BF8F6': {'category': 'direct_product_basis',
                                       'end': 65,
                                       'legacy': 'Disposition remains unresolved with implementation_status=unknown; registry declarations are retained as schema evidence without asserting '
                                                 'implementation or authority.',
                                       'name': 'harness-db-tables-registry',
                                       'products': ['HELIX-HARNESS'],
                                       'reason': 'The source declares registry tables for requirement and plan artifact identity, matching HARNESS contract and trace storage responsibilities.',
                                       'start': 13},
 'LEGACY-ASSET-C6CF7E1C334856500558': {'category': 'multi_product_conflict',
                                       'end': 323,
                                       'legacy': 'Disposition remains unresolved with implementation_status=unknown; legacy conversion and registry revalidation are shrinkage/compatibility evidence, '
                                                 'not a formal product route.',
                                       'name': 'skill-applicability-registry',
                                       'products': ['HELIX-HARNESS', 'HELIX-OS'],
                                       'reason': 'The source loads and revalidates skill applicability identities against workflow authority, combining HARNESS skill applicability semantics with '
                                                 'HELIX-OS package/authority loading and adapter control.',
                                       'start': 249},
 'LEGACY-ASSET-D60AE87D9DFA0740F4A8': {'category': 'multi_product_conflict',
                                       'end': 123,
                                       'legacy': 'Disposition remains unresolved with implementation_status=unknown; comments preserve a possible runtime authority distinction, but old execution and '
                                                 'consumer closure remain unverified.',
                                       'name': 'harness-db-tables-evaluation',
                                       'products': ['HELIX-HARNESS', 'HELIX-OS'],
                                       'reason': 'The source combines model/evaluation and verification evidence projections with a Node transactional runtime boundary; HARNESS evaluation meaning '
                                                 'and OS state operation conflict.',
                                       'start': 4},
 'LEGACY-ASSET-DBCE67DF3C1FE8648191': {'category': 'direct_product_basis',
                                       'end': 121,
                                       'legacy': 'Disposition remains unresolved with implementation_status=unknown; legacy identity and raw command emission are explicitly suppressed in the old '
                                                 'source, while execution and consumer closure remain unproven.',
                                       'name': 'workflow-execution-policy-projection',
                                       'products': ['HELIX-OS'],
                                       'reason': 'The projection carries typed identity, registered command, fail-close policy, and source digests into an execution policy surface; this is HELIX-OS '
                                                 'operational policy control.',
                                       'start': 68},
 'LEGACY-ASSET-E4EDA1517A4F062B2D64': {'category': 'direct_product_basis',
                                       'end': 94,
                                       'legacy': 'Disposition remains unresolved with implementation_status=unknown; screen schema is read-only historical evidence and its consumer closure is not '
                                                 'established.',
                                       'name': 'harness-db-tables-screen',
                                       'products': ['HELIX-HARNESS'],
                                       'reason': 'The source declares screen and requirement-to-screen projection tables that preserve HARNESS requirement and design trace, not a web service '
                                                 'runtime.',
                                       'start': 14},
 'LEGACY-ASSET-E595E192F58FF3B1A2A0': {'category': 'multi_product_conflict',
                                       'end': 32,
                                       'legacy': 'Disposition remains unresolved with implementation_status=unknown; adapter-neutral DTOs preserve a boundary split and explicitly leave I/O ownership '
                                                 'to adapters, so no product route is promoted.',
                                       'name': 'visualization-view-contract',
                                       'products': ['HELIX-HARNESS', 'HELIX-Web'],
                                       'reason': 'The aggregate contract exposes project progress/design/runtime evidence and harness growth/telemetry views; HARNESS artifact meaning and HELIX-Web '
                                                 'presentation responsibility compete.',
                                       'start': 13},
 'LEGACY-ASSET-E9FF2DF247348F5608F2': {'category': 'multi_product_conflict',
                                       'end': 102,
                                       'legacy': 'Disposition remains unresolved with implementation_status=unknown; index declarations preserve old storage design but do not establish which product '
                                                 'owns the writer or operational lifecycle.',
                                       'name': 'harness-db-indexes',
                                       'products': ['HELIX-HARNESS', 'HELIX-OS'],
                                       'reason': 'The source defines indexes over requirement, plan, evidence, and runtime state projections; HARNESS trace semantics and HELIX-OS database/state '
                                                 'operation overlap.',
                                       'start': 3},
 'LEGACY-ASSET-EEC2DA57D64EC4908112': {'category': 'direct_product_basis',
                                       'end': 446,
                                       'legacy': 'Disposition remains unresolved with implementation_status=unknown; the old source provides static design declaration parsing evidence only and was '
                                                 'not executed or promoted.',
                                       'name': 'design-declarations',
                                       'products': ['HELIX-HARNESS'],
                                       'reason': 'The analyzer parses design declarations and references, detects undeclared or duplicate definitions, and returns a V-model design contract finding '
                                                 'set; this is HARNESS design trace evidence.',
                                       'start': 381},
 'LEGACY-ASSET-F0ED1811C81FD1184188': {'category': 'multi_product_conflict',
                                       'end': 71,
                                       'legacy': 'Disposition remains unresolved with implementation_status=unknown; the source preserves old schema/migration coupling but cannot decide product '
                                                 'owner or implementation success.',
                                       'name': 'harness-db',
                                       'products': ['HELIX-HARNESS', 'HELIX-OS'],
                                       'reason': 'The source calls harness.db projection schema a single source, generates DDL, and validates identifiers before projection writes; HARNESS artifact '
                                                 'schema and OS migration/writer control are both present.',
                                       'start': 24}}
EXPECTED_TARGET_IDS = ('LEGACY-ASSET-11C75CC63968FB9A5BD2', 'LEGACY-ASSET-132E6449FA96E5CABBBF', 'LEGACY-ASSET-18579F09E6B2C29E5622', 'LEGACY-ASSET-187E43CE3096B88CA8B4', 'LEGACY-ASSET-18EBF31B40C9A58DE958', 'LEGACY-ASSET-1ABE9822E36400BC82C2', 'LEGACY-ASSET-1AE119F9830818EAA0D5', 'LEGACY-ASSET-2B68A62292FADDC5BCA6', 'LEGACY-ASSET-30539BEC772802F50C9D', 'LEGACY-ASSET-32FD3269C766571AD5DA', 'LEGACY-ASSET-3AEDBB3A9A7B549C4C24', 'LEGACY-ASSET-3D7D5062903EE9CEDFEF', 'LEGACY-ASSET-414CC59CA35B28BB7AF4', 'LEGACY-ASSET-5442594ED146AD72850C', 'LEGACY-ASSET-67D77EEBF1209346882C', 'LEGACY-ASSET-72ECA3C318F8028A6D91', 'LEGACY-ASSET-85F302A8E7280A166171', 'LEGACY-ASSET-8A390337BEE15CED1AA2', 'LEGACY-ASSET-95ACDEA21F7AF6996D4A', 'LEGACY-ASSET-97D1784D53918F126E3B', 'LEGACY-ASSET-9BFD3E86A8F5AE0DA720', 'LEGACY-ASSET-B5482F292A2E654347E8', 'LEGACY-ASSET-B8033A9BCD9CC70BF8F6', 'LEGACY-ASSET-C6CF7E1C334856500558', 'LEGACY-ASSET-D60AE87D9DFA0740F4A8', 'LEGACY-ASSET-DBCE67DF3C1FE8648191', 'LEGACY-ASSET-E4EDA1517A4F062B2D64', 'LEGACY-ASSET-E595E192F58FF3B1A2A0', 'LEGACY-ASSET-E9FF2DF247348F5608F2', 'LEGACY-ASSET-EEC2DA57D64EC4908112', 'LEGACY-ASSET-F0ED1811C81FD1184188')
EXPECTED_MANUAL_REVIEWED_ASSET_IDS = frozenset(EXPECTED_TARGET_IDS)

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

def _strict_object(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            raise ValueError(f"duplicate JSON key: {key}")
        result[key] = value
    return result

def _strict_json(text: str, context: str):
    try:
        value = json.loads(text, object_pairs_hook=_strict_object)
    except (json.JSONDecodeError, ValueError) as exc:
        fail("E_JSON", f"{context}: malformed or duplicate-key JSON ({exc})")
    if not isinstance(value, dict):
        fail("E_JSON", f"{context}: expected JSON object")
    return value

def local_json(path: Path):
    return _strict_json(path.read_text(), str(path))

def local_jsonl(path: Path):
    rows = []
    for line_number, text in enumerate(path.read_text().splitlines(), 1):
        if not text.strip():
            continue
        rows.append(_strict_json(text, f"{path}:{line_number}"))
    return rows

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


def overlap_from_fixed_scopes(phase_by_asset: dict, by_asset: dict, schema_ids: list[str]) -> dict:
    """Re-derive Wave from BASE and verify pinned sister inventory ID sets."""
    unresolved = {aid for aid, (_, row) in phase_by_asset.items() if row.get("product_classification_status") == "unresolved"}
    sister_sets = {}
    for key, path in SISTER_INVENTORIES_FIXED.items():
        try:
            blob = subprocess.check_output(["git", "rev-parse", f"HEAD:{path}"], text=True).strip()
        except (subprocess.CalledProcessError, OSError) as exc:
            fail("E_OVERLAP", f"sister inventory missing {path}: {exc}")
        if blob != SISTER_INVENTORY_BLOBS_FIXED[path]:
            fail("E_OVERLAP", f"sister inventory blob drift {path}")
        try:
            inventory = json.loads(subprocess.check_output(["git", "show", f"HEAD:{path}"]))
        except (subprocess.CalledProcessError, OSError, json.JSONDecodeError) as exc:
            fail("E_OVERLAP", f"sister inventory unreadable {path}: {exc}")
        expected_scope = {"lint_unresolved_src": "phase product unresolved + implementation_source + src/lint/ exact 95 assets", "runtime_unresolved_src": "phase product unresolved + src/runtime/ exact 73 assets"}[key]
        expected_count = {"lint_unresolved_src": 95, "runtime_unresolved_src": 73}[key]
        expected_sets = inventory.get("expected_sets", {})
        target_ids = expected_sets.get("target_asset_ids")
        if inventory.get("base_revision") != BASE_REVISION or inventory.get("scope") != expected_scope or expected_sets.get("target_asset_count") != expected_count or not isinstance(target_ids, list) or len(target_ids) != expected_count or len(set(target_ids)) != expected_count or any(not isinstance(aid, str) for aid in target_ids):
            fail("E_OVERLAP", f"sister inventory scope drift {path}")
        sister_sets[key] = set(target_ids)
    scopes = {
        "wave_unresolved_product": {aid for aid in by_asset if aid in unresolved},
        "lint_unresolved_src": sister_sets["lint_unresolved_src"],
        "runtime_unresolved_src": sister_sets["runtime_unresolved_src"],
        "schema_unresolved_src": set(schema_ids),
    }
    return {
        "reference_bundle_counts": {key: len(value) for key, value in scopes.items()},
        "pairwise_intersections": {
            "schema_wave_unresolved_product": len(scopes["schema_unresolved_src"] & scopes["wave_unresolved_product"]),
            "schema_lint_unresolved_src": len(scopes["schema_unresolved_src"] & scopes["lint_unresolved_src"]),
            "schema_runtime_unresolved_src": len(scopes["schema_unresolved_src"] & scopes["runtime_unresolved_src"]),
            "runtime_wave_unresolved_product": len(scopes["runtime_unresolved_src"] & scopes["wave_unresolved_product"]),
            "runtime_lint_unresolved_src": len(scopes["runtime_unresolved_src"] & scopes["lint_unresolved_src"]),
            "wave_unresolved_product_lint_unresolved_src": len(scopes["wave_unresolved_product"] & scopes["lint_unresolved_src"]),
        },
        "union_count": len(set().union(*scopes.values())),
        "sister_inventory_sources": {key: {"path": path, "commit": "HEAD", "blob": SISTER_INVENTORY_BLOBS_FIXED[path], "target_asset_count": len(scopes[key])} for key, path in SISTER_INVENTORIES_FIXED.items()},
        "schema_wave_overlap_asset_ids": sorted(scopes["schema_unresolved_src"] & scopes["wave_unresolved_product"]),
        "schema_lint_overlap_asset_ids": sorted(scopes["schema_unresolved_src"] & scopes["lint_unresolved_src"]),
        "schema_runtime_overlap_asset_ids": sorted(scopes["schema_unresolved_src"] & scopes["runtime_unresolved_src"]),
    }

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
    expected_archive_paths = [*EXPECTED_ARCHIVE_INPUT_PATHS, *source_paths]
    actual_archive_paths = [x.get("path") for x in actual if isinstance(x, dict) and str(x.get("path", "")).startswith("archive/")]
    if actual_archive_paths != expected_archive_paths or len(actual_archive_paths) != 32:
        fail("E_ARCHIVE_EVIDENCE", "archive static evidence path set/order differs from fixed BASE target sources")
    for item in actual:
        data = git_bytes(item["path"])
        expected = {"path": item["path"], "blob": git_blob(item["path"]), "bytes": len(data), "sha256": tagged(data)}
        if item != expected:
            fail("E_INPUT_DIGEST", f"input digest mismatch {item.get('path')}")

def verify_binding_input_closure(inventory):
    binding = local_json(BINDING)
    upstream = binding.get("upstream")
    if not isinstance(upstream, list) or any(not isinstance(item, dict) for item in upstream):
        fail("E_BINDING_INPUT_SET", "Binding upstream must be an object list")
    expected_paths = list(EXPECTED_NONARCHIVE_INPUT_PATHS)
    actual_paths = [item.get("path") for item in upstream]
    if actual_paths != expected_paths or len(actual_paths) != 66 or len(set(actual_paths)) != 66:
        fail("E_BINDING_INPUT_SET", "Binding upstream must close over the 66 non-archive inventory inputs in order")
    inventory_items = inventory.get("input_digests")
    if not isinstance(inventory_items, list):
        fail("E_BINDING_INPUT_SET", "inventory input_digests is not a list")
    inventory_by_path = {item.get("path"): item for item in inventory_items if isinstance(item, dict)}
    for item in upstream:
        path, raw = item.get("path"), item.get("sha256")
        if not isinstance(raw, str) or len(raw) != 64 or any(ch not in "0123456789abcdef" for ch in raw):
            fail("E_BINDING_INPUT_DIGEST", f"Binding upstream raw SHA is invalid: {path}")
        expected = inventory_by_path.get(path, {}).get("sha256")
        if expected != f"sha256:{raw}":
            fail("E_BINDING_INPUT_DIGEST", f"Binding upstream SHA differs from inventory: {path}")

def verify_static_ranges(record):
    expected_boundary, expected_l1 = boundary_evidence(), l1_evidence()
    if record.get("boundary_evidence") != expected_boundary: fail("E_BOUNDARY_DIGEST", record.get("asset_id", ""))
    if record.get("l1_evidence") != expected_l1: fail("E_BOUNDARY_DIGEST", record.get("asset_id", ""))
    static = record.get("failure_consumer_static_refs", {})
    if not isinstance(static, dict) or set(static) != {"failure", "consumer"}:
        fail("E_STATIC_REF_SCHEMA", record.get("asset_id", ""))
    for key, path, pairs in (("failure", FAILURE_SOURCE_FIXED, FAILURE_RANGES_FIXED), ("consumer", CONSUMER_SOURCE_FIXED, CONSUMER_RANGES_FIXED)):
        if not isinstance(static.get(key), dict) or set(static[key]) != {"path", "blob", "ranges"}:
            fail("E_STATIC_REF_SCHEMA", f"{record.get('asset_id')}:{key}")
        if not isinstance(static[key].get("ranges"), list) or any(not isinstance(item, dict) or set(item) != {"path", "blob", "line_start", "line_end", "line_count", "line_text_sha256", "line_text"} for item in static[key]["ranges"]):
            fail("E_STATIC_REF_SCHEMA", f"{record.get('asset_id')}:{key}:ranges")
        expected = {"path": path, "blob": git_blob(path), "ranges": [receipt(path, *pair) for pair in pairs]}
        if static.get(key) != expected: fail("E_BOUNDARY_DIGEST", f"{record.get('asset_id')}:{key}")


def verify_category_evidence(record, pin):
    category = record.get("classification_category")
    products = record.get("candidate_products")
    review = record.get("manual_semantic_review")
    reviewed_products = review.get("candidate_products") if isinstance(review, dict) else None
    reviewed_l1 = review.get("l1_evidence") if isinstance(review, dict) else None
    if category not in {"direct_product_basis", "multi_product_conflict", "insufficient_basis"} or not isinstance(products, list) or any(not isinstance(p, str) for p in products) or not isinstance(reviewed_products, list) or any(not isinstance(p, str) for p in reviewed_products) or not isinstance(reviewed_l1, dict) or any(not isinstance(p, str) for p in reviewed_l1):
        fail("E_CLASSIFICATION", record.get("asset_id", ""))
    if category == "direct_product_basis":
        valid = len(products) == len(reviewed_products) == len(reviewed_l1) == 1
    elif category == "multi_product_conflict":
        valid = len(products) == len(reviewed_products) == len(reviewed_l1) and len(products) >= 2
    else:
        valid = not products and not reviewed_products and not reviewed_l1
    if not valid or set(products) != set(reviewed_products) or set(products) != set(reviewed_l1):
        fail("E_CLASSIFICATION", record.get("asset_id", ""))

def verify():
    verify_base()
    inventory, rows = local_json(INVENTORY), local_jsonl(LEDGER)
    if inventory.get("base_revision") != BASE_REVISION or inventory.get("base_source_mode") != "all input and archive evidence bytes from fixed BASE Git objects": fail("E_BASE_PIN", "BASE pin/source mode drift")
    if inventory.get("negative_cases") != EXPECTED_NEGATIVE_CASES: fail("E_INVENTORY", "negative case declaration drift")
    phase_rows = base_jsonl(PHASE_FIXED)
    phase_by_asset = {r["asset_id"]: (n, r) for n, r in phase_rows}
    targets = sorted(a for a, (_, r) in phase_by_asset.items() if r.get("product_classification_status") == "unresolved" and r.get("source_path", "").startswith("src/schema/"))
    if tuple(targets) != EXPECTED_TARGET_IDS or len(targets) != 31: fail("E_TARGET_SET", "fixed BASE target ID set drift")
    if set(PINNED_REVIEWS) != set(targets): fail("E_REVIEW_PIN", "independent review pin set drift")
    verify_inputs(inventory, targets, phase_by_asset)
    verify_binding_input_closure(inventory)
    if len(rows) != 31 or any(not isinstance(r, dict) or not isinstance(r.get("asset_id"), str) for r in rows) or sorted(r.get("asset_id") for r in rows) != targets or len({r.get("asset_id") for r in rows}) != 31: fail("E_TARGET_SET", "records have missing, duplicate, or extra target asset")
    expected_set = {"target_asset_count": 31, "target_asset_ids": targets, "target_asset_ids_sha256": tagged("\n".join(targets).encode()), "source_paths": [phase_by_asset[a][1]["source_path"] for a in targets]}
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
        verify_category_evidence(record, pin)
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
        if not isinstance(units, list) or any(not isinstance(unit, dict) or set(unit) != {"unit_candidate_id", "crosswalk", "decomposition"} or not isinstance(unit.get("unit_candidate_id"), str) for unit in units):
            fail("E_CANDIDATE_PRODUCTS", aid)
        if [u.get("unit_candidate_id") for u in units] != unit_ids: fail("E_CANDIDATE_PRODUCTS", aid)
        for unit in units:
            uid = unit.get("unit_candidate_id")
            if uid not in cw or uid not in decomp or unit.get("crosswalk") != cw[uid] or unit.get("decomposition") != decomp[uid]: fail("E_CANDIDATE_PRODUCTS", f"{aid}:{uid}")
        if record.get("classification_category") != pin["category"] or record.get("classification_reason") != pin["reason"] + " Candidate only; formal product authority remains unresolved." or record.get("candidate_products") != pin["products"] or record.get("observed_wave_products") != wave_products: fail("E_CLASSIFICATION", aid)
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
    expected_counts = {"wave_files": 50, "wave_edges": 598, "wave_unique_assets": 355, "target_assets": 31, "target_wave_edges": expected_edges, "target_wave_linked_assets": sum(bool(by_asset.get(a)) for a in targets), "categories": dict(sorted(expected_categories.items())), "target_asset_artifact_evidence_kinds": dict(sorted(evidence_counts.items())), "target_phase_candidate_distribution": {"|".join(k): v for k, v in sorted(phase_distribution.items())}}
    if counts != expected_counts: fail("E_EXPECTED_DENOMINATOR", "inventory counts mismatch")
    if inventory.get("review_counts") != {"source_semantic_reviewed": 31, "source_semantic_review_pending": 0, "direct_candidate_basis": expected_categories["direct_product_basis"], "multi_product_conflict": expected_categories["multi_product_conflict"], "insufficient_basis": expected_categories["insufficient_basis"]}: fail("E_SEMANTIC_REVIEW", "review counts mismatch")
    if set(inventory.get("manual_reviewed_asset_ids", [])) != set(targets) or len(inventory.get("manual_reviewed_asset_ids", [])) != 31: fail("E_SEMANTIC_REVIEW", "manual reviewed set mismatch")
    expected_meta = {"schema_revision": 1, "binding_id": BINDING_ID_FIXED, "scope": "phase product unresolved + src/schema/ exact 31 assets", "wave_source_paths": {str(n): path for n, path in WAVE_PATHS_FIXED.items()}, "expected_sets": expected_set, "old_asset_source_mode": "archive bytes are read through git show BASE:<archive-path>; never executed", "formal_update": {"formal_asset_classification_updated": False, "phase_ledger_updated": False, "product_route_updated": False, "successor_updated": False, "new_build_allowed": False, "authority_effect": "none"}, "classification_rule": {"direct_product_basis": "a reviewed concrete source span mapped to one product L1 with explicit boundary counterevidence and pending consumer evidence", "multi_product_conflict": "reviewed source behavior contains concrete responsibilities mapped to two product boundaries; no single owner is proposed", "insufficient_basis": "source is generic, tombstone, shared infrastructure, or lacks an accepted product-boundary proof; observed Wave scope is not inherited"}, "boundary_refs": {"product_boundary": BOUNDARY_FIXED, "l1": L1_FIXED}, "history_failure_consumer": {"disposition_rows": 31, "decision_rows_for_targets": sum(bool(r["legacy_history_failure_consumer"]["decisions"]) for r in rows), "read_after_rows_for_targets": sum(bool(r["legacy_history_failure_consumer"]["read_after"]) for r in rows), "failure_consumer_refs_are_static_global_inventory": True}, "edge_contract": {"edge_identity": "edge_id derived from wave/path/line/asset_id/unit_candidate_id/semantic_link_status", "duplicate_edges_forbidden": True, "missing_edges_forbidden": True}, "authority_boundary": {"authority_effect": "none", "classification_state": "research_proposal_pending_human_product_review", "formal_asset_classification_updated": False, "new_build_allowed": False}, "artifacts": ["scaffold/bindings/SCF-B-0120.json", "scaffold/legacy-schema-product-classification-0120/README.md", "scaffold/legacy-schema-product-classification-0120/PR-DRAFT.md", "scaffold/legacy-schema-product-classification-0120/generate.py", "scaffold/legacy-schema-product-classification-0120/validate.py", "scaffold/legacy-schema-product-classification-0120/selfcheck.py", "scaffold/legacy-schema-product-classification-0120/inventory.json", "scaffold/legacy-schema-product-classification-0120/classification-research.jsonl"]}
    expected_overlap = overlap_from_fixed_scopes(phase_by_asset, by_asset, targets)
    expected_top = set(expected_meta) | {"base_revision", "base_source_mode", "counts", "input_digests", "output_sha256", "review_counts", "manual_reviewed_asset_ids", "negative_cases", "research_overlap"}
    if set(inventory) != expected_top: fail("E_INVENTORY_DECLARATION", "inventory top-level key set mismatch")
    for key, value in expected_meta.items():
        if inventory.get(key) != value: fail("E_INVENTORY_DECLARATION", f"inventory {key} mismatch")
    if inventory.get("research_overlap") != expected_overlap: fail("E_OVERLAP", "research bundle intersection declaration drift")
    if inventory.get("output_sha256") != tagged(LEDGER.read_bytes()): fail("E_OUTPUT_DIGEST", "classification output digest mismatch")
    print(f"SCF-B-0120 validate: PASS records=31 target_edges={expected_edges} categories={dict(sorted(expected_categories.items()))}")
    return {"rows": rows, "inventory": inventory}

if __name__ == "__main__":
    verify()

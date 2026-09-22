#!/usr/bin/env python3
"""Materialize SCF-B-0120 static research for unresolved src/schema assets."""
from __future__ import annotations

import hashlib
import json
import subprocess
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BUNDLE = ROOT / "scaffold/legacy-schema-product-classification-0120"
BASE_REVISION = "5562f04da0f3205f9aa58205ec0d478419fc4f2e"
BINDING_ID = "SCF-B-0120"
ARCHIVE_PREFIX = "archive/legacy-generation-2026-09-14/root/"
PHASE = "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl"
DISPOSITION = "docs/governance/legacy-asset-disposition.jsonl"
DECISIONS = "docs/governance/legacy-asset-decisions.jsonl"
READ_AFTER = "docs/governance/legacy-asset-copy-read-after.jsonl"
CROSSWALK = "docs/governance/legacy-requirement-implementation-crosswalk-bootstrap.jsonl"
DECOMPOSITION = "docs/governance/legacy-ir-product-unit-decomposition-bootstrap.jsonl"
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
GLOBAL_INPUTS = [
    PHASE, DISPOSITION, DECISIONS, READ_AFTER, CROSSWALK, DECOMPOSITION,
    BOUNDARY, *L1.values(), FAILURE_SOURCE, CONSUMER_SOURCE,
    "docs/governance/legacy-asset-decision-log.md",
    "docs/governance/legacy-asset-reuse-control.md",
    "docs/governance/new-generation-start-here.md",
    "archive/legacy-generation-2026-09-14/MANIFEST.sha256",
]
PRODUCTS = ("HELIX-HARNESS", "HELIX-OS", "HELIX-Web", "HELIX-Web-OS")
SISTER_INVENTORIES = {
    "lint_unresolved_src": "scaffold/legacy-lint-product-classification-0108/inventory.json",
    "runtime_unresolved_src": "scaffold/legacy-runtime-product-classification-0117/inventory.json",
}
SISTER_INVENTORY_BLOBS = {
    "scaffold/legacy-lint-product-classification-0108/inventory.json": "a97ebd5190bef017b94499e75caf5a95dae162d8",
    "scaffold/legacy-runtime-product-classification-0117/inventory.json": "0003d5aa7bc4a3defc43b4b51c280941c206f1e4",
}

# Every entry is a source-semantic review record.  The marker is located in
# the fixed BASE blob, so the stored line/digest is not inferred from a path
# name.  Classification remains a candidate research result, never authority.
def spec(category: str, products: list[str], marker: str | None, length: int, reason: str, legacy: str = "") -> dict:
    return {"category": category, "products": products, "marker": marker, "length": length, "reason": reason, "legacy": legacy}

DIRECT_H = {
    "atomic-contract-id": spec("direct_product_basis", ["HELIX-HARNESS"], "export function isAtomicContractId", 3, "The source explicitly projects a requirements-owned atomic behavior contract identifier and validates its canonical form; this is a HARNESS requirement and contract identity boundary.", "Disposition remains unresolved with implementation_status=unknown; the source is retained as a static contract helper and no current implementation or consumer closure is asserted."),
    "design-declarations": spec("direct_product_basis", ["HELIX-HARNESS"], "export function analyzeDesignDeclarations", 66, "The analyzer parses design declarations and references, detects undeclared or duplicate definitions, and returns a V-model design contract finding set; this is HARNESS design trace evidence.", "Disposition remains unresolved with implementation_status=unknown; the old source provides static design declaration parsing evidence only and was not executed or promoted."),
    "green-command": spec("direct_product_basis", ["HELIX-HARNESS"], "export function greenCommandMatchesKind", 21, "The source binds green command kinds to test, typecheck, lint, doctor, and V-model verification command evidence; this is a HARNESS verification admission contract.", "Disposition remains unresolved with implementation_status=unknown; the command matcher is preserved as old verification evidence without declaring a current route or execution success."),
    "harness-db-tables-design": spec("direct_product_basis", ["HELIX-HARNESS"], "export const HARNESS_DB_DESIGN_TABLES", 120, "The source declares design and requirement trace projection tables used to preserve HARNESS artifact relationships; the reviewed schema is a HARNESS V-model artifact contract.", "Disposition remains unresolved with implementation_status=unknown; design projection table declarations are retained for static comparison and no database implementation is claimed."),
    "harness-db-tables-graph": spec("direct_product_basis", ["HELIX-HARNESS"], "export const HARNESS_DB_GRAPH_EXPORT_TABLES", 100, "The source declares relation graph, document export, and verification profile evidence tables, which preserve HARNESS design and verification trace artifacts.", "Disposition remains unresolved with implementation_status=unknown; graph/export schema is old static evidence and its writer, migration, and consumer closure remain unproven."),
    "harness-db-tables-registry": spec("direct_product_basis", ["HELIX-HARNESS"], "export const HARNESS_DB_REGISTRY_TABLES", 62, "The source declares registry tables for requirement and plan artifact identity, matching HARNESS contract and trace storage responsibilities.", "Disposition remains unresolved with implementation_status=unknown; registry declarations are retained as schema evidence without asserting implementation or authority."),
    "harness-db-tables-screen": spec("direct_product_basis", ["HELIX-HARNESS"], "export const HARNESS_DB_SCREEN_TABLES", 82, "The source declares screen and requirement-to-screen projection tables that preserve HARNESS requirement and design trace, not a web service runtime.", "Disposition remains unresolved with implementation_status=unknown; screen schema is read-only historical evidence and its consumer closure is not established."),
    "harness-db-tables-semantic": spec("direct_product_basis", ["HELIX-HARNESS"], "export const HARNESS_DB_SEMANTIC_TABLES", 42, "The source declares semantic requirement, layer, and trace projection tables for the HARNESS V-model contract.", "Disposition remains unresolved with implementation_status=unknown; semantic table declarations are retained without treating them as a formal product route."),
    "loop-plan-id": spec("direct_product_basis", ["HELIX-HARNESS"], "export function assertLoopPlanId", 4, "The source validates a bounded PLAN loop identity used by the HARNESS plan and verification contract; the identifier grammar is an artifact identity rule.", "Disposition remains unresolved with implementation_status=unknown; the old identifier helper is static evidence and does not prove a current plan implementation."),
    "roadmap": spec("direct_product_basis", ["HELIX-HARNESS"], "export function validateRoadmapStructure", 51, "The source validates roadmap gates, spans, feature packs, and ordering constraints; this is HARNESS process and V-model planning contract behavior.", "Disposition remains unresolved with implementation_status=unknown; roadmap validation remains old planning evidence with no accepted successor or execution closure."),
}
DIRECT_O = {
    "current-location-workflow-identity-resolver": spec("direct_product_basis", ["HELIX-OS"], "export function resolveCurrentLocationWorkflowIdentity", 105, "The resolver binds current workflow identity to the installed authority catalog, rejects ambiguous typed/legacy input, and suppresses legacy identity emission; this is HELIX-OS authority and execution routing control.", "Disposition remains unresolved with implementation_status=unknown; the source documents a legacy compatibility shrinkage rule (legacy input accepted only with warning and no emitted legacy identity), but no current runtime execution or authority promotion is asserted."),
    "current-location-workflow-identity": spec("direct_product_basis", ["HELIX-OS"], "export interface CurrentLocationWorkflowIdentity", 17, "The source defines typed workflow identity and receipt dispositions for stale, unsupported, and converted authority observations; this is HELIX-OS operational authority evidence.", "Disposition remains unresolved with implementation_status=unknown; the type contract preserves legacy/typed transition evidence without claiming implementation closure."),
    "model-registry": spec("direct_product_basis", ["HELIX-OS"], "export function parseModelRegistry", 35, "The source validates provider model IDs, pricing, and reasoning effort maps as a bounded runtime capability registry; this is HELIX-OS provider and operational control.", "Disposition remains unresolved with implementation_status=unknown; the source retains pricing/model registry history and explicitly avoids unlisted model cost invention, but no provider execution is claimed."),
    "runtime-verification": spec("direct_product_basis", ["HELIX-OS"], "export function classifyRuntimeVerificationEvidence", 60, "The source classifies runtime claims, rejects projection-only evidence, and builds privacy-safe verification log events; this is HELIX-OS runtime evidence and state control.", "Disposition remains unresolved with implementation_status=unknown; runtime evidence schemas are read-only historical evidence and old execution was not performed."),
    "workflow-classification-catalog": spec("direct_product_basis", ["HELIX-OS"], "export function projectWorkflowClassificationCatalog", 70, "The source projects the installed workflow classification registry into a typed catalog and rejects stale or mismatched source digests; this is HELIX-OS authority projection.", "Disposition remains unresolved with implementation_status=unknown; the source preserves the transition from legacy workflow values to current typed identity and does not emit legacy identity as effective authority."),
    "workflow-classification-legacy-adapter": spec("direct_product_basis", ["HELIX-OS"], "export function adaptLegacyWorkflowClassification", 61, "The adapter converts bounded legacy mode/model input to a typed workflow identity, marks ambiguous/unsupported values, and sets emit_legacy_identity=false; this is HELIX-OS compatibility control.", "Disposition remains unresolved with implementation_status=unknown; the explicit legacy adapter and fail-close dispositions are shrinkage evidence, not proof of current implementation or authority."),
    "workflow-execution-policy-projection": spec("direct_product_basis", ["HELIX-OS"], "export function projectWorkflowExecutionPolicy", 54, "The projection carries typed identity, registered command, fail-close policy, and source digests into an execution policy surface; this is HELIX-OS operational policy control.", "Disposition remains unresolved with implementation_status=unknown; legacy identity and raw command emission are explicitly suppressed in the old source, while execution and consumer closure remain unproven."),
}
CONFLICT = {
    "harness-db-catalog": spec("multi_product_conflict", ["HELIX-HARNESS", "HELIX-OS"], "export const HARNESS_DB_TABLES", 11, "The catalog enumerates harness.db tables while the same registry is consumed by migration and projection writers; HARNESS artifact schema and OS state/writer control meet, so one owner cannot be inferred.", "Disposition remains unresolved with implementation_status=unknown; the old catalog is schema evidence only, and migration/writer implementation plus product closure are unverified."),
    "harness-db-indexes": spec("multi_product_conflict", ["HELIX-HARNESS", "HELIX-OS"], "export const HARNESS_DB_INDEXES", 100, "The source defines indexes over requirement, plan, evidence, and runtime state projections; HARNESS trace semantics and HELIX-OS database/state operation overlap.", "Disposition remains unresolved with implementation_status=unknown; index declarations preserve old storage design but do not establish which product owns the writer or operational lifecycle."),
    "harness-db-tables-evaluation": spec("multi_product_conflict", ["HELIX-HARNESS", "HELIX-OS"], "export const HARNESS_DB_EVALUATION_TABLES", 120, "The source combines model/evaluation and verification evidence projections with a Node transactional runtime boundary; HARNESS evaluation meaning and OS state operation conflict.", "Disposition remains unresolved with implementation_status=unknown; comments preserve a possible runtime authority distinction, but old execution and consumer closure remain unverified."),
    "harness-db": spec("multi_product_conflict", ["HELIX-HARNESS", "HELIX-OS"], "export const SCHEMA_VERSION", 48, "The source calls harness.db projection schema a single source, generates DDL, and validates identifiers before projection writes; HARNESS artifact schema and OS migration/writer control are both present.", "Disposition remains unresolved with implementation_status=unknown; the source preserves old schema/migration coupling but cannot decide product owner or implementation success."),
    "open-branch-plan-reservation-authority": spec("multi_product_conflict", ["HELIX-HARNESS", "HELIX-OS"], "export const openBranchPlanReservationAuthorityInputSchema", 28, "The source validates plan reservation, terminal evidence, pull request, and writer surfaces; HARNESS plan identity and OS authority/writer control are inseparable in this contract.", "Disposition remains unresolved with implementation_status=unknown; reservation authority is retained as old schema evidence with no approved plan owner, writer, or successor."),
    "skill-applicability-registry": spec("multi_product_conflict", ["HELIX-HARNESS", "HELIX-OS"], "export function loadSkillApplicabilityRegistry", 75, "The source loads and revalidates skill applicability identities against workflow authority, combining HARNESS skill applicability semantics with HELIX-OS package/authority loading and adapter control.", "Disposition remains unresolved with implementation_status=unknown; legacy conversion and registry revalidation are shrinkage/compatibility evidence, not a formal product route."),
    "team": spec("multi_product_conflict", ["HELIX-HARNESS", "HELIX-OS"], "export const teamDefinitionSchema", 23, "The source validates team strategy, provider/model overrides, parallelism, and serialization reasons; HARNESS delegation/process contract and OS runtime/provider control overlap.", "Disposition remains unresolved with implementation_status=unknown; team schema preserves safety defaults and provider constraints without proving an executing team runtime or single owner."),
    "visualization-view-contract": spec("multi_product_conflict", ["HELIX-HARNESS", "HELIX-Web"], "export interface VisualizationContract", 20, "The aggregate contract exposes project progress/design/runtime evidence and harness growth/telemetry views; HARNESS artifact meaning and HELIX-Web presentation responsibility compete.", "Disposition remains unresolved with implementation_status=unknown; adapter-neutral DTOs preserve a boundary split and explicitly leave I/O ownership to adapters, so no product route is promoted."),
    "workflow-classification-terminal-fullback-authority": spec("multi_product_conflict", ["HELIX-HARNESS", "HELIX-OS"], "export const workflowClassificationTerminalFullbackAuthoritySchema", 37, "The schema binds requirements authority, forward plan slices, and operational consumers for terminal fullback; HARNESS requirements/plan meaning and OS authority execution overlap.", "Disposition remains unresolved with implementation_status=unknown; terminal fullback retains requirements and legacy fallback evidence but has no approved successor or execution closure."),
    "workflow-execution-policy-registry": spec("multi_product_conflict", ["HELIX-HARNESS", "HELIX-OS"], "export const workflowExecutionPolicyRegistrySchema", 100, "The registry binds requirements source digests and classification identities to command/policy bindings and approval stages; HARNESS policy meaning and OS execution control conflict.", "Disposition remains unresolved with implementation_status=unknown; raw command and legacy identity suppression are preserved as shrinkage evidence, not formal authority."),
}
INSUFFICIENT = {
    "harness-db-table-builders": spec("insufficient_basis", [], "export const col", 2, "The source provides generic table/primary-key builder helpers; shared schema construction alone does not establish HARNESS or HELIX-OS responsibility.", "Disposition remains unresolved with implementation_status=unknown; generic helpers have no product-boundary or consumer closure evidence and remain static only."),
    "harness-db-types": spec("insufficient_basis", [], "export interface TableDef", 8, "The source defines generic ColumnDef, TableDef, and IndexDef shapes; type declarations alone do not identify a product owner or runtime authority.", "Disposition remains unresolved with implementation_status=unknown; generic types preserve old schema vocabulary but provide no implementation or shrinkage decision."),
    "visualization-contract": spec("insufficient_basis", [], "export interface ClosureReviewScopeView", 39, "The source is an adapter-neutral visualization DTO and explicitly says builders/adapters own extension while this layer owns no I/O; the span is insufficient to classify a product owner.", "Disposition remains unresolved with implementation_status=unknown; adapter-neutral presentation types are retained as shrinkage/boundary evidence without inheriting Web or HARNESS ownership."),
    "visualization-tree-contract": spec("insufficient_basis", [], None, 23, "The source explicitly calls itself an adapter-neutral tree contract and assigns presentation decoration to adapters; no product boundary is proven by this generic DTO.", "Disposition remains unresolved with implementation_status=unknown; the generic tree contract is preserved as static evidence and has no old implementation/consumer closure."),
}

REVIEW_SPECS = {**DIRECT_H, **DIRECT_O, **CONFLICT, **INSUFFICIENT}

BOUNDARY_RANGES = {
    "HELIX-HARNESS": [(36, 36), (54, 61), (86, 89)],
    "HELIX-OS": [(37, 37), (55, 65), (86, 89)],
    "HELIX-Web": [(38, 38), (56, 56), (63, 70)],
    "HELIX-Web-OS": [(39, 39), (57, 57), (63, 70)],
}
L1_RANGES = {
    "HELIX-HARNESS": [(22, 24), (54, 58)],
    "HELIX-OS": [(22, 25), (59, 63)],
    "HELIX-Web": [(24, 26), (47, 49)],
    "HELIX-Web-OS": [(14, 15), (39, 44)],
}
FAILURE_RANGES = [(17, 23), (52, 63)]
CONSUMER_RANGES = [(24, 36), (38, 50)]
NEGATIVE_CASES = [
    "target_record_omission", "target_record_duplicate", "edge_omission", "edge_duplicate",
    "source_digest_tamper", "source_anchor_tamper", "source_profile_tamper", "candidate_product_tamper",
    "classification_category_tamper", "semantic_review_tamper", "legacy_evidence_tamper", "boundary_digest_tamper", "input_digest_omission",
    "input_digest_duplicate", "input_digest_extra_path", "authority_promotion", "record_top_level_extra_key",
    "source_read_mode_tamper", "inventory_authority_promotion", "inventory_scope_tamper", "inventory_formal_update_tamper",
    "inventory_classification_rule_tamper", "inventory_counts_artifact_kind_tamper", "inventory_edge_count_tamper",
    "fixed_BASE_non_ancestor", "generator_review_spec_tamper", "generator_anchor_tamper",
    "generator_l1_tamper", "base_pin_tamper", "base_source_missing", "history_tamper",
    "human_judgment_tamper", "input_digest_value_tamper", "inventory_negative_case_tamper",
    "output_digest_tamper", "phase_status_tamper", "source_line_range_tamper",
    "inventory_overlap_tamper",
    "category_evidence_invariant_direct", "category_evidence_invariant_conflict", "category_evidence_invariant_insufficient",
    "failure_consumer_static_refs_key_closure", "unit_product_candidates_key_closure",
    "asset_id_type", "unit_product_candidates_type", "sister_inventory_blob_tamper", "generator_category_pin_tamper", "generator_products_pin_tamper", "review_pin_omission",
    "ledger_record_duplicate_key", "ledger_nested_duplicate_key", "inventory_duplicate_key",
    "ledger_malformed_json", "inventory_nonobject_json", "binding_upstream_omission",
    "binding_upstream_extra_path", "binding_wave1_digest_tamper", "binding_wave37_digest_tamper",
    "binding_wave50_digest_tamper",
]


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def tagged(data: bytes) -> str:
    return "sha256:" + sha(data)


def canonical(value: object) -> str:
    return tagged(json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode())


def sister_inventory(path: str) -> dict:
    expected_blob = SISTER_INVENTORY_BLOBS[path]
    actual_blob = subprocess.check_output(["git", "rev-parse", f"HEAD:{path}"], text=True).strip()
    if actual_blob != expected_blob:
        raise AssertionError(f"sister inventory blob drift: {path}")
    return json.loads(subprocess.check_output(["git", "show", f"HEAD:{path}"]))


def overlap_from_fixed_scopes(phase_by_asset: dict, by_asset: dict, schema_ids: list[str]) -> dict:
    """Re-derive sister research scopes from fixed BASE phase/Wave observations.

    Wave is re-derived from fixed BASE; lint/runtime IDs come from pinned
    sister inventories whose BASE and scope declarations are checked before
    their sets are used.  No sister classification record is imported.
    """
    unresolved = {aid for aid, (_, row) in phase_by_asset.items() if row.get("product_classification_status") == "unresolved"}
    wave_ids = {aid for aid in by_asset if aid in unresolved}
    sister_sets = {}
    for key, path in SISTER_INVENTORIES.items():
        inventory = sister_inventory(path)
        expected_scope = {"lint_unresolved_src": "phase product unresolved + implementation_source + src/lint/ exact 95 assets", "runtime_unresolved_src": "phase product unresolved + src/runtime/ exact 73 assets"}[key]
        expected_count = {"lint_unresolved_src": 95, "runtime_unresolved_src": 73}[key]
        expected_sets = inventory.get("expected_sets", {})
        target_ids = expected_sets.get("target_asset_ids")
        if inventory.get("base_revision") != BASE_REVISION or inventory.get("scope") != expected_scope or expected_sets.get("target_asset_count") != expected_count or not isinstance(target_ids, list) or len(target_ids) != expected_count or len(set(target_ids)) != expected_count or any(not isinstance(aid, str) for aid in target_ids):
            raise AssertionError(f"sister inventory scope drift: {path}")
        sister_sets[key] = set(target_ids)
    scopes = {
        "wave_unresolved_product": wave_ids,
        "lint_unresolved_src": sister_sets["lint_unresolved_src"],
        "runtime_unresolved_src": sister_sets["runtime_unresolved_src"],
        "schema_unresolved_src": set(schema_ids),
    }
    pairwise = {
        "schema_wave_unresolved_product": len(scopes["schema_unresolved_src"] & scopes["wave_unresolved_product"]),
        "schema_lint_unresolved_src": len(scopes["schema_unresolved_src"] & scopes["lint_unresolved_src"]),
        "schema_runtime_unresolved_src": len(scopes["schema_unresolved_src"] & scopes["runtime_unresolved_src"]),
        "runtime_wave_unresolved_product": len(scopes["runtime_unresolved_src"] & scopes["wave_unresolved_product"]),
        "runtime_lint_unresolved_src": len(scopes["runtime_unresolved_src"] & scopes["lint_unresolved_src"]),
        "wave_unresolved_product_lint_unresolved_src": len(scopes["wave_unresolved_product"] & scopes["lint_unresolved_src"]),
    }
    return {
        "reference_bundle_counts": {key: len(value) for key, value in scopes.items()},
        "pairwise_intersections": pairwise,
        "union_count": len(set().union(*scopes.values())),
        "sister_inventory_sources": {key: {"path": path, "commit": "HEAD", "blob": SISTER_INVENTORY_BLOBS[path], "target_asset_count": len(scopes[key])} for key, path in SISTER_INVENTORIES.items()},
        "schema_wave_overlap_asset_ids": sorted(scopes["schema_unresolved_src"] & scopes["wave_unresolved_product"]),
        "schema_lint_overlap_asset_ids": sorted(scopes["schema_unresolved_src"] & scopes["lint_unresolved_src"]),
        "schema_runtime_overlap_asset_ids": sorted(scopes["schema_unresolved_src"] & scopes["runtime_unresolved_src"]),
    }


def git_bytes(path: str) -> bytes:
    return subprocess.check_output(["git", "show", f"{BASE_REVISION}:{path}"])


def git_blob(path: str) -> str:
    return subprocess.check_output(["git", "rev-parse", f"{BASE_REVISION}:{path}"], text=True).strip()


def read_jsonl(path: str) -> list[tuple[int, dict]]:
    return [(i, json.loads(line)) for i, line in enumerate(git_bytes(path).decode().splitlines(), 1) if line.strip()]


def row_digest(row: dict) -> str:
    return canonical(row)


def range_receipt(path: str, start: int, end: int) -> dict:
    lines = git_bytes(path).decode(errors="replace").splitlines()
    if not (1 <= start <= end <= len(lines)):
        raise AssertionError(f"range outside source: {path}:{start}-{end}")
    text = "\n".join(lines[start - 1:end])
    return {"path": path, "blob": git_blob(path), "line_start": start, "line_end": end, "line_count": end - start + 1, "line_text_sha256": tagged(text.encode()), "line_text": lines[start - 1:end]}


def boundary_receipts() -> dict:
    return {product: {"path": BOUNDARY, "blob": git_blob(BOUNDARY), "ranges": [range_receipt(BOUNDARY, *r) for r in ranges]} for product, ranges in BOUNDARY_RANGES.items()}


def l1_receipts() -> dict:
    return {product: {"path": path, "blob": git_blob(path), "ranges": [range_receipt(path, *r) for r in L1_RANGES[product]]} for product, path in L1.items()}


def compact_crosswalk(row: dict, line: int) -> dict:
    fields = ["crosswalk_id", "source_requirement_id", "unit_candidate_id", "product_scope", "responsibility_summary", "direct_legacy_asset_link_status", "phase_classification_status", "direct_phase_candidates", "current_requirement_implementation_status", "legacy_requirement_implementation_status", "consumer_closure_status", "successor_assignment_status", "legacy_execution_performed", "new_build_allowed", "authority_effect", "unresolved"]
    out = {k: row.get(k) for k in fields}
    out.update({"path": CROSSWALK, "line": line, "row_sha256": row_digest(row)})
    return out


def compact_decomp(parent: dict, unit: dict, line: int) -> dict:
    return {"path": DECOMPOSITION, "line": line, "decomposition_id": parent.get("decomposition_id"), "source_requirement_id": parent.get("source_requirement_id"), "unit_candidate_id": unit.get("unit_candidate_id"), "unit_kind": unit.get("unit_kind"), "product_target": unit.get("product_target"), "direct_phase_candidates": unit.get("direct_phase_candidates"), "phase_classification_status": unit.get("phase_classification_status"), "semantic_coverage_status": unit.get("semantic_coverage_status"), "authority_effect": unit.get("authority_effect"), "row_sha256": canonical({"parent": parent.get("source_requirement_id"), "unit": unit})}


def history_receipt(asset_id: str, dispositions: dict, decisions: list[tuple[int, dict]], read_afters: list[tuple[int, dict]]) -> dict:
    line, row = dispositions[asset_id]
    return {
        "disposition": {"path": DISPOSITION, "line": line, "row_sha256": row_digest(row), "asset_id": asset_id, "revision": row.get("revision"), "disposition": row.get("disposition"), "asset_class": row.get("asset_class"), "product_target": row.get("product_target"), "authority_status": row.get("authority_status"), "implementation_status": row.get("implementation_status"), "consumer_refs": sorted(row.get("consumer_refs", [])), "decision_record_ref": row.get("decision_record_ref"), "read_after_record_ref": row.get("read_after_record_ref")},
        "decisions": [{"path": DECISIONS, "line": n, "row_sha256": row_digest(r), "decision_id": r.get("decision_id"), "disposition": r.get("disposition"), "product_target": r.get("product_target"), "consumer_refs": sorted(r.get("consumer_refs", []))} for n, r in decisions if r.get("asset_id") == asset_id],
        "read_after": [{"path": READ_AFTER, "line": n, "row_sha256": row_digest(r), "read_after_id": r.get("read_after_id"), "result": r.get("result"), "digest_match": r.get("digest_match"), "consumer_match": r.get("consumer_match"), "failure": r.get("failure"), "consumer_refs_observed": sorted(r.get("consumer_refs_observed", []))} for n, r in read_afters if r.get("asset_id") == asset_id],
        "state_boundary": "disposition remains unresolved; decision/read-after rows are preserved as historical evidence and do not confer product authority",
    }


def profile_for(name: str) -> tuple[str, list[str], str, dict]:
    if name not in REVIEW_SPECS:
        raise AssertionError(f"unreviewed source {name}")
    s = REVIEW_SPECS[name]
    return s["category"], list(s["products"]), s["reason"], s


def _anchor_for(path: str, review: dict) -> list[dict]:
    lines = git_bytes(path).decode(errors="replace").splitlines()
    marker = review.get("marker")
    if marker:
        starts = [i for i, line in enumerate(lines, 1) if marker in line]
        if len(starts) > 1:
            # Prefer a declaration line whose trimmed text starts with the
            # marker; substring matches in similarly named failure helpers are
            # not semantic anchors.
            exact = [
                i for i, line in enumerate(lines, 1)
                if line.strip().startswith(marker)
                and (len(line.strip()) == len(marker) or not line.strip()[len(marker)].isalnum() and line.strip()[len(marker)] not in "_$")
            ]
            if exact:
                starts = exact
        if len(starts) != 1:
            raise AssertionError(f"marker {marker!r} not unique in {path}: {starts}")
        start = starts[0]
    else:
        starts = [i for i, line in enumerate(lines, 1) if line.strip() and not line.lstrip().startswith(("import ", "from "))]
        start = starts[0] if starts else 1
    end = min(len(lines), start + review["length"] - 1)
    text = "\n".join(lines[start - 1:end])
    return [{"line_start": start, "line_end": end, "line_text": lines[start - 1:end], "line_text_sha256": tagged(text.encode()), "interpretation": review["reason"], "products_considered": list(review["products"]) or list(PRODUCTS)}]


def archive_source(asset: dict, review: dict) -> dict:
    archive_path = ARCHIVE_PREFIX + asset["source_path"]
    data = git_bytes(archive_path)
    if sha(data) != asset["source_sha256"]:
        raise AssertionError(f"source digest mismatch for {asset['asset_id']}")
    return {"archive_path": archive_path, "source_path": asset["source_path"], "blob": git_blob(archive_path), "bytes": len(data), "line_count": len(data.decode(errors="replace").splitlines()), "sha256": tagged(data), "ledger_source_sha256": "sha256:" + asset["source_sha256"], "semantic_anchors": _anchor_for(archive_path, review), "read_mode": "git_object_static_read_only"}


def wave_link(item: tuple[int, str, int, dict]) -> dict:
    wave, path, line, row = item
    edge_base = {"wave": wave, "path": path, "line": line, "asset_id": row["asset_id"], "unit_candidate_id": row.get("unit_candidate_id"), "semantic_link_status": row.get("semantic_link_status")}
    return {"edge_id": canonical(edge_base), "wave": wave, "path": path, "line": line, "row_sha256": row_digest(row), "asset_id": row["asset_id"], "source_requirement_id": row.get("source_requirement_id"), "artifact_evidence_kind": row.get("artifact_evidence_kind"), "unit_candidate_id": row.get("unit_candidate_id"), "semantic_link_status": row.get("semantic_link_status"), "semantic_relation": row.get("semantic_relation"), "candidate_product_targets": row.get("candidate_product_targets") or [], "product_scope": row.get("product_scope") or [], "candidate_phase_targets": row.get("candidate_phase_targets") or [], "source_path": row.get("source_path"), "source_sha256": row.get("source_sha256"), "source_statement_semantic_digest": row.get("source_statement_semantic_digest"), "source_statement_text": row.get("source_statement_text"), "source_text_spans": row.get("source_text_spans") or [], "evidence_refs": row.get("evidence_refs") or [], "legacy_asset_evidence_state": row.get("legacy_asset_evidence_state"), "legacy_execution_status": row.get("legacy_execution_status"), "consumer_closure_status": row.get("consumer_closure_status"), "observed_consumer_refs": row.get("observed_consumer_refs") or [], "counterevidence": row.get("counterevidence") or [], "unresolved": row.get("unresolved") or [], "product_alignment_status": row.get("product_alignment_status"), "authority_effect": row.get("authority_effect"), "new_build_allowed": row.get("new_build_allowed")}


def manual_review(review: dict, archive_path: str, boundary: dict, l1: dict) -> dict:
    category, products = review["category"], review["products"]
    status = {"direct_product_basis": "reviewed_candidate", "multi_product_conflict": "reviewed_conflict", "insufficient_basis": "reviewed_insufficient_basis"}[category]
    counter = []
    for product in (products or PRODUCTS):
        ranges = BOUNDARY_RANGES[product]
        counter.append({"product": product, "evidence": range_receipt(BOUNDARY, *ranges[1]), "interpretation": f"product-boundary text for {product} remains the human counter-boundary; the source span does not establish an approved owner"})
    return {"status": status, "source_spans": _anchor_for(archive_path, review), "candidate_products": list(products), "l1_evidence": {p: l1[p] for p in products}, "interpretation": review["reason"], "boundary_counterevidence": counter, "consumer_boundary": {"status": "pending", "interpretation": "legacy consumer relation is retained as a pending closure boundary; no direct semantic link is accepted", "refs": [range_receipt(CONSUMER_SOURCE, *r) for r in CONSUMER_RANGES]}}


def make_record(asset_id: str, phase_item: tuple[int, dict], asset_item: tuple[int, dict], wave_items: list[tuple[int, str, int, dict]], cw: dict, decomp: dict, decisions: list[tuple[int, dict]], read_afters: list[tuple[int, dict]], dispositions: dict, boundary: dict, l1: dict) -> dict:
    phase_line, phase = phase_item
    asset_line, asset = asset_item
    name = asset["source_path"].rsplit("/", 1)[-1].removesuffix(".ts")
    category, products, reason, review = profile_for(name)
    links = [wave_link(x) for x in wave_items]
    wave_products = sorted({p for link in links for p in (link.get("candidate_product_targets") or []) + (link.get("product_scope") or [])})
    unit_ids = sorted({link["unit_candidate_id"] for link in links if link.get("unit_candidate_id")})
    units = [{"unit_candidate_id": uid, "crosswalk": cw[uid], "decomposition": decomp[uid]} for uid in unit_ids]
    phase_receipt = {"path": PHASE, "line": phase_line, "row_sha256": row_digest(phase), "product_classification_status": phase.get("product_classification_status"), "candidate_product_targets": phase.get("candidate_product_targets") or [], "candidate_phase_targets": phase.get("candidate_phase_targets") or [], "source_path": phase.get("source_path"), "source_sha256": phase.get("source_sha256"), "consumer_closure_status": phase.get("consumer_closure_status")}
    asset_receipt = {"path": DISPOSITION, "line": asset_line, "row_sha256": row_digest(asset), "source_path": asset.get("source_path"), "source_sha256": asset.get("source_sha256"), "disposition": asset.get("disposition"), "product_target": asset.get("product_target"), "authority_status": asset.get("authority_status"), "implementation_status": asset.get("implementation_status"), "consumer_refs": sorted(asset.get("consumer_refs", []))}
    review_obj = manual_review(review, ARCHIVE_PREFIX + asset["source_path"], boundary, l1)
    return {
        "asset_id": asset_id, "classification_category": category, "classification_reason": reason + " Candidate only; formal product authority remains unresolved.", "classification_state": "research_proposal_pending_human_product_review", "authority_effect": "none", "formal_asset_classification_updated": False, "new_build_allowed": False,
        "source_profile": {"name": name, "base_category": category, "source_products": products, "wave_products": wave_products, "profile_reason": reason, "semantic_review_status": review_obj["status"]},
        "phase_ledger": phase_receipt, "asset_ledger": asset_receipt, "source_exact": archive_source(asset, review),
        "wave_semantic_links": sorted(links, key=lambda x: (x["wave"], x["line"], x["edge_id"])), "unit_product_candidates": units,
        "candidate_products": products, "observed_wave_products": wave_products, "semantic_link_statuses": sorted({x.get("semantic_link_status") for x in links}), "artifact_evidence_kinds": sorted({x.get("artifact_evidence_kind") for x in links}) if links else ["implementation_source"],
        "legacy_history_failure_consumer": history_receipt(asset_id, dispositions, decisions, read_afters), "boundary_evidence": boundary, "l1_evidence": l1,
        "manual_semantic_review": review_obj,
        "legacy_implementation_shrinkage_evidence": {"disposition": asset.get("disposition"), "implementation_status": asset.get("implementation_status"), "execution_performed": False, "interpretation": review.get("legacy", ""), "source_anchor": review_obj["source_spans"]},
        "failure_consumer_static_refs": {"failure": {"path": FAILURE_SOURCE, "blob": git_blob(FAILURE_SOURCE), "ranges": [range_receipt(FAILURE_SOURCE, *r) for r in FAILURE_RANGES]}, "consumer": {"path": CONSUMER_SOURCE, "blob": git_blob(CONSUMER_SOURCE), "ranges": [range_receipt(CONSUMER_SOURCE, *r) for r in CONSUMER_RANGES]}},
        "human_judgment_remaining": ["product_owner_and_boundary_decision", "source_semantic_anchor_acceptance", "phase_admission_and_successor_assignment", "legacy_consumer_closure_and_failure_disposition", "formal_asset_classification_update"],
    }


def build() -> None:
    BUNDLE.mkdir(parents=True, exist_ok=True)
    wave_rows = []
    for wave, path in WAVE_PATHS.items():
        wave_rows.extend((wave, path, line, row) for line, row in read_jsonl(path))
    by_asset: defaultdict[str, list] = defaultdict(list)
    for item in wave_rows:
        by_asset[item[3]["asset_id"]].append(item)
    phase_by_asset = {row["asset_id"]: (line, row) for line, row in read_jsonl(PHASE)}
    disposition_by_asset = {row["asset_id"]: (line, row) for line, row in read_jsonl(DISPOSITION)}
    decisions, read_afters = read_jsonl(DECISIONS), read_jsonl(READ_AFTER)
    cw = {row["unit_candidate_id"]: compact_crosswalk(row, line) for line, row in read_jsonl(CROSSWALK)}
    decomp: dict = {}
    for line, parent in read_jsonl(DECOMPOSITION):
        for unit in parent.get("candidate_units", []):
            decomp[unit["unit_candidate_id"]] = compact_decomp(parent, unit, line)
    targets = sorted(a for a, (line, row) in phase_by_asset.items() if row.get("product_classification_status") == "unresolved" and row.get("source_path", "").startswith("src/schema/"))
    if len(targets) != 31:
        raise AssertionError(f"expected 31 target assets, got {len(targets)}")
    if set(phase_by_asset[a][1]["source_path"].rsplit("/", 1)[-1].removesuffix(".ts") for a in targets) != set(REVIEW_SPECS):
        raise AssertionError("schema review spec set does not match target asset set")
    if any(a not in disposition_by_asset for a in targets):
        raise AssertionError("target absent from disposition ledger")
    boundary, l1 = boundary_receipts(), l1_receipts()
    records = [make_record(a, phase_by_asset[a], disposition_by_asset[a], by_asset.get(a, []), cw, decomp, decisions, read_afters, disposition_by_asset, boundary, l1) for a in targets]
    research_overlap = overlap_from_fixed_scopes(phase_by_asset, by_asset, targets)
    out = BUNDLE / "classification-research.jsonl"
    out.write_text("".join(json.dumps(r, ensure_ascii=False, sort_keys=True, separators=(",", ":")) + "\n" for r in records))
    source_paths = [ARCHIVE_PREFIX + phase_by_asset[a][1]["source_path"] for a in targets]
    input_paths = [*WAVE_PATHS.values(), *GLOBAL_INPUTS, *source_paths]
    if len(input_paths) != len(set(input_paths)):
        raise AssertionError("input path list duplicated")
    input_digests = [{"path": p, "blob": git_blob(p), "bytes": len(git_bytes(p)), "sha256": tagged(git_bytes(p))} for p in input_paths]
    category_counts = Counter(r["classification_category"] for r in records)
    category_counts = Counter({key: category_counts.get(key, 0) for key in ("direct_product_basis", "multi_product_conflict", "insufficient_basis")})
    inventory = {
        "schema_revision": 1, "binding_id": BINDING_ID, "base_revision": BASE_REVISION, "base_source_mode": "all input and archive evidence bytes from fixed BASE Git objects",
        "scope": "phase product unresolved + src/schema/ exact 31 assets",
        "wave_source_paths": WAVE_PATHS,
        "counts": {"wave_files": 50, "wave_edges": len(wave_rows), "wave_unique_assets": len(by_asset), "target_assets": len(records), "target_wave_edges": sum(len(r["wave_semantic_links"]) for r in records), "target_wave_linked_assets": sum(bool(r["wave_semantic_links"]) for r in records), "categories": dict(sorted(category_counts.items())), "target_asset_artifact_evidence_kinds": {"implementation_source": sum(1 for a in targets if phase_by_asset[a][1].get("artifact_evidence_kind") == "implementation_source")}},
        "review_counts": {"source_semantic_reviewed": len(records), "source_semantic_review_pending": 0, "direct_candidate_basis": category_counts["direct_product_basis"], "multi_product_conflict": category_counts["multi_product_conflict"], "insufficient_basis": category_counts["insufficient_basis"]},
        "expected_sets": {"target_asset_count": 31, "target_asset_ids": targets, "target_asset_ids_sha256": tagged("\n".join(targets).encode()), "source_paths": [phase_by_asset[a][1]["source_path"] for a in targets]},
        "input_digests": input_digests,
        "old_asset_source_mode": "archive bytes are read through git show BASE:<archive-path>; never executed",
        "formal_update": {"formal_asset_classification_updated": False, "phase_ledger_updated": False, "product_route_updated": False, "successor_updated": False, "new_build_allowed": False, "authority_effect": "none"},
        "classification_rule": {"direct_product_basis": "a reviewed concrete source span mapped to one product L1 with explicit boundary counterevidence and pending consumer evidence", "multi_product_conflict": "reviewed source behavior contains concrete responsibilities mapped to two product boundaries; no single owner is proposed", "insufficient_basis": "source is generic, tombstone, shared infrastructure, or lacks an accepted product-boundary proof; observed Wave scope is not inherited"},
        "manual_reviewed_asset_ids": targets,
        "negative_cases": NEGATIVE_CASES,
        "research_overlap": research_overlap,
        "boundary_refs": {"product_boundary": BOUNDARY, "l1": L1}, "history_failure_consumer": {"disposition_rows": 31, "decision_rows_for_targets": sum(bool(r["legacy_history_failure_consumer"]["decisions"]) for r in records), "read_after_rows_for_targets": sum(bool(r["legacy_history_failure_consumer"]["read_after"]) for r in records), "failure_consumer_refs_are_static_global_inventory": True},
        "edge_contract": {"edge_identity": "edge_id derived from wave/path/line/asset_id/unit_candidate_id/semantic_link_status", "duplicate_edges_forbidden": True, "missing_edges_forbidden": True},
        "authority_boundary": {"authority_effect": "none", "classification_state": "research_proposal_pending_human_product_review", "formal_asset_classification_updated": False, "new_build_allowed": False},
        "artifacts": ["scaffold/bindings/SCF-B-0120.json", "scaffold/legacy-schema-product-classification-0120/README.md", "scaffold/legacy-schema-product-classification-0120/PR-DRAFT.md", "scaffold/legacy-schema-product-classification-0120/generate.py", "scaffold/legacy-schema-product-classification-0120/validate.py", "scaffold/legacy-schema-product-classification-0120/selfcheck.py", "scaffold/legacy-schema-product-classification-0120/inventory.json", "scaffold/legacy-schema-product-classification-0120/classification-research.jsonl"],
        "output_sha256": tagged(out.read_bytes()),
    }
    phase_dist = Counter(tuple(phase_by_asset[a][1].get("candidate_phase_targets") or []) for a in targets)
    inventory["counts"]["target_phase_candidate_distribution"] = {"|".join(k): v for k, v in sorted(phase_dist.items())}
    (BUNDLE / "inventory.json").write_text(json.dumps(inventory, ensure_ascii=False, sort_keys=True, indent=2) + "\n")


if __name__ == "__main__":
    build()

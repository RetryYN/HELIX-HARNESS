#!/usr/bin/env python3
"""Build a static human-review packet for the 36 PR #2078 candidate conflicts.

This reads pinned Git objects only. It never imports or executes archive code or
the #2078 generator; target-generator literals are inspected with Python AST.
"""
from __future__ import annotations

import ast
import hashlib
import json
import subprocess
from collections import Counter
from functools import lru_cache
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BUNDLE = ROOT / "scaffold/legacy-overlap-reconciliation-0144"
BINDING_PATH = ROOT / "scaffold/bindings/SCF-B-0144.json"
PREVIOUS_BASE_REVISION = "2c94d171e9b1f2cb28aaceedf591129fb8e4db2e"
BASE_REVISION = "7afee33ae892fe1a3cf1085fac4e02d923ece01d"
ARCHIVE_REVISION = "5562f04da0f3205f9aa58205ec0d478419fc4f2e"
INITIAL_TARGET_REVISION = "886c2436a71e079913c395693c2edd9ddce52113"
PREVIOUS_TARGET_REVISION = "8c8cf851b47c88f6d814dc828a38743fc3cd45b3"
TARGET_REVISION = "c55ffc91b08aabb0a0216168b3cf2b1e5fe6bf03"
TARGET_BUNDLE = "scaffold/legacy-implementation-residual-0126"
TARGET_GENERATOR = f"{TARGET_BUNDLE}/generate.py"
TARGET_INVENTORY = f"{TARGET_BUNDLE}/inventory.json"
TARGET_RECORDS = f"{TARGET_BUNDLE}/classification-research.jsonl"
TARGET_BINDING = "scaffold/bindings/SCF-B-0126.json"
MAIN_BUNDLES = (
    "scaffold/legacy-asset-product-classification-0107/classification-research.jsonl",
    "scaffold/legacy-lint-candidate-product-classification-0128/classification-research.jsonl",
    "scaffold/legacy-lint-product-classification-0108/classification-research.jsonl",
    "scaffold/legacy-runtime-product-classification-0117/classification-research.jsonl",
    "scaffold/legacy-runtime-residual-product-classification-0133/classification-research.jsonl",
    "scaffold/legacy-schema-product-classification-0120/classification-research.jsonl",
    "scaffold/legacy-source-product-classification-0123/classification-research.jsonl",
    "scaffold/legacy-state-db-product-classification-0127/classification-research.jsonl",
)
PHASE = "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl"
DISPOSITION = "docs/governance/legacy-asset-disposition.jsonl"
DECISIONS = "docs/governance/legacy-asset-decisions.jsonl"
READ_AFTER = "docs/governance/legacy-asset-copy-read-after.jsonl"
MANIFEST = "archive/legacy-generation-2026-09-14/MANIFEST.sha256"
BOUNDARY = "docs/concept/product-boundary.md"
FAILURE_SOURCE = "docs/governance/audits/source-rebaseline/legacy-ci-ai-runtime-source-inventory.md"
CONSUMER_SOURCE = "docs/governance/audits/source-rebaseline/legacy-ci-consumer-relation-inventory.md"
L1_PATHS = {
    "HELIX-HARNESS": "docs/helix-harness/L1-planning/product-intent.md",
    "HELIX-OS": "docs/helix-os/L1-planning/system-intent.md",
    "HELIX-Web": "docs/helix-web/L1-planning/product-intent.md",
    "HELIX-Web-OS": "docs/helix-web-os/L1-planning/system-intent.md",
}
PRODUCTS = tuple(L1_PATHS)
PROFILE_REASON = (
    "This implementation_source asset is absent from the prior research asset-ID set; "
    "no direct product evidence is retained, so it remains insufficient basis pending dedicated review."
)
OVERLAP_STATUS = "same_source_different_candidate_result"
ARCHIVE_PREFIX = "archive/legacy-generation-2026-09-14/root/"
AUTHORITY = {
    "authority_effect": "none",
    "formal_asset_classification_updated": False,
    "formal_route_updated": False,
    "phase_admission_updated": False,
    "successor_assignment": None,
    "implementation_status_promoted": False,
    "consumer_closure_created": False,
    "new_build_allowed": False,
}


def tagged(data: bytes) -> str:
    return "sha256:" + hashlib.sha256(data).hexdigest()


def canonical(value: object) -> bytes:
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"), allow_nan=False).encode()


def strict_pairs(pairs: list[tuple[str, object]]) -> dict:
    out = {}
    for key, value in pairs:
        if key in out:
            raise ValueError(f"duplicate JSON key: {key}")
        out[key] = value
    return out


def reject_json_constant(value: str):
    raise ValueError(f"non-standard JSON constant: {value}")


@lru_cache(maxsize=None)
def git_bytes(revision: str, path: str) -> bytes:
    try:
        return subprocess.check_output(["git", "show", f"{revision}:{path}"], cwd=ROOT)
    except subprocess.CalledProcessError as exc:
        raise AssertionError(f"E_INPUT_MISSING {revision}:{path}") from exc


@lru_cache(maxsize=None)
def git_tree(revision: str, path: str) -> dict[str, str]:
    raw = subprocess.check_output(["git", "ls-tree", revision, "--", path], cwd=ROOT, text=True)
    rows = [line for line in raw.splitlines() if line]
    if len(rows) != 1 or "\t" not in rows[0]:
        raise AssertionError(f"E_SOURCE_TREE exact path {revision}:{path}")
    header, actual_path = rows[0].split("\t", 1)
    mode, typ, oid = header.split()
    if actual_path != path or typ != "blob" or mode not in {"100644", "100755"}:
        raise AssertionError(f"E_SOURCE_TREE blob/mode/path {revision}:{path}")
    return {"path": actual_path, "mode": mode, "type": typ, "blob": oid}


def strict_json(data: bytes, path: str) -> object:
    try:
        return json.loads(data.decode("utf-8"), object_pairs_hook=strict_pairs, parse_constant=reject_json_constant)
    except (UnicodeDecodeError, json.JSONDecodeError, TypeError, ValueError) as exc:
        raise AssertionError(f"E_JSON {path}: {exc}") from exc


def strict_jsonl(data: bytes, path: str) -> list[tuple[int, dict]]:
    rows = []
    try:
        lines = data.decode("utf-8").splitlines()
    except UnicodeDecodeError as exc:
        raise AssertionError(f"E_JSON {path}: {exc}") from exc
    for line_no, line in enumerate(lines, 1):
        if not line.strip():
            continue
        try:
            row = json.loads(line, object_pairs_hook=strict_pairs, parse_constant=reject_json_constant)
        except (json.JSONDecodeError, TypeError, ValueError) as exc:
            raise AssertionError(f"E_JSON {path}:{line_no}: {exc}") from exc
        if not isinstance(row, dict):
            raise AssertionError(f"E_JSON {path}:{line_no}: object required")
        rows.append((line_no, row))
    return rows


def ast_value(tree: ast.Module, name: str):
    for node in tree.body:
        if isinstance(node, ast.Assign) and any(isinstance(t, ast.Name) and t.id == name for t in node.targets):
            return ast.literal_eval(node.value)
        if isinstance(node, ast.AnnAssign) and isinstance(node.target, ast.Name) and node.target.id == name:
            return ast.literal_eval(node.value)
    raise AssertionError(f"E_TARGET_METHOD missing literal {name}")


def target_method_pins() -> tuple[str, dict[str, str], dict[str, list[tuple[int, int]]], list[tuple[int, int]], dict[str, list[tuple[int, int]]]]:
    raw = git_bytes(TARGET_REVISION, TARGET_GENERATOR)
    source = raw.decode("utf-8")
    tree = ast.parse(source, filename=TARGET_GENERATOR)
    pairs = ast_value(tree, "UNRESEARCHED_PREFIX_ASSET_PATHS")
    if not isinstance(pairs, (tuple, list)) or len(pairs) != 53:
        raise AssertionError("E_TARGET_METHOD exact 53 path/ID literals")
    path_to_id = {}
    id_to_path = {}
    for asset_id, source_path in pairs:
        if source_path in path_to_id or asset_id in id_to_path:
            raise AssertionError("E_TARGET_METHOD duplicate path/ID literals")
        path_to_id[source_path] = asset_id
        id_to_path[asset_id] = source_path
    reason = ast_value(tree, "UNRESEARCHED_PROFILE_REASON")
    if reason != PROFILE_REASON:
        raise AssertionError("E_TARGET_METHOD profile reason drift")
    products = ast_value(tree, "PRODUCTS")
    l1 = ast_value(tree, "L1")
    l1_ranges = ast_value(tree, "L1_RANGES")
    boundary_ranges = ast_value(tree, "BOUNDARY_RANGES")
    if tuple(products) != PRODUCTS or l1 != L1_PATHS:
        raise AssertionError("E_TARGET_METHOD four-product L1 roots drift")
    # Check the exact source-level fallback contract without executing it.
    required_fragments = (
        "def unique_anchor_marker(path: str) -> str:",
        "marker = line.strip()",
        "if marker and sum(marker in candidate for candidate in lines) == 1:",
        'REVIEW_SPECS[_path] = p("insufficient_basis", [], unique_anchor_marker(_path), UNRESEARCHED_PROFILE_REASON, 1)',
        '"new_residual_after_main_product_union"',
    )
    if any(fragment not in source for fragment in required_fragments):
        raise AssertionError("E_TARGET_METHOD fallback source contract drift")
    return reason, path_to_id, l1, boundary_ranges, l1_ranges


def row_digest(row: dict) -> str:
    return tagged(canonical(row))


def input_digest(revision: str, path: str, purpose: str, archive: bool = False) -> dict:
    data = git_bytes(revision, path)
    entry = git_tree(revision, path)
    return {
        "revision": revision,
        "path": path,
        "type": entry["type"],
        "mode": entry["mode"],
        "blob": entry["blob"],
        "bytes": len(data),
        "sha256": tagged(data),
        "archive_static_only": archive,
        "purpose": purpose,
    }


def parse_manifest(revision: str, source_path: str) -> str:
    matches = []
    for line in git_bytes(revision, MANIFEST).decode("utf-8", errors="replace").splitlines():
        if line.endswith(" " + source_path):
            digest, path = line.split(maxsplit=1)
            if path == source_path:
                matches.append("sha256:" + digest)
    if len(matches) != 1:
        raise AssertionError(f"E_MANIFEST entry cardinality {source_path}={len(matches)}")
    return matches[0]


def archive_evidence(source_path: str, expected_sha: str) -> tuple[dict, bytes]:
    path = ARCHIVE_PREFIX + source_path
    tree = git_tree(ARCHIVE_REVISION, path)
    data = git_bytes(ARCHIVE_REVISION, path)
    sha = tagged(data)
    if sha != expected_sha:
        raise AssertionError(f"E_SOURCE_IDENTITY archive digest {source_path}")
    manifest_sha = parse_manifest(ARCHIVE_REVISION, source_path)
    if manifest_sha != sha:
        raise AssertionError(f"E_MANIFEST archived bytes mismatch {source_path}")
    return ({
        "archive_revision": ARCHIVE_REVISION,
        "archive_path": path,
        "source_path": source_path,
        **tree,
        "bytes": len(data),
        "line_count": len(data.decode("utf-8", errors="replace").splitlines()),
        "sha256": sha,
        "manifest_path": MANIFEST,
        "manifest_sha256": manifest_sha,
        "manifest_match": True,
        "read_mode": "git_object_static_read_only",
        "execution_performed": False,
    }, data)


def unique_anchor(source_bytes: bytes) -> dict:
    lines = source_bytes.decode("utf-8", errors="replace").splitlines()
    for number, line in enumerate(lines, 1):
        marker = line.strip()
        if marker and sum(marker in candidate for candidate in lines) == 1:
            text_hash = tagged(marker.encode("utf-8"))
            return {
                "marker": marker,
                "line_start": number,
                "line_end": number,
                "line_text": [line],
                "line_text_sha256": tagged(line.encode("utf-8")),
                "marker_sha256": text_hash,
                "interpretation": PROFILE_REASON,
                "products_considered": list(PRODUCTS),
                "source_selection_method": "#2078 unique_anchor_marker reproduced from pinned generator literal/helper",
            }
    raise AssertionError("E_TARGET_METHOD no unique marker")


def range_receipt(revision: str, path: str, start: int, end: int) -> dict:
    data = git_bytes(revision, path)
    lines = data.decode("utf-8", errors="replace").splitlines()
    if start < 1 or end < start or end > len(lines):
        raise AssertionError(f"E_L1_RANGE {revision}:{path}:{start}-{end}")
    selected = lines[start - 1:end]
    text = "\n".join(selected)
    tree = git_tree(revision, path)
    return {
        "path": path,
        "blob": tree["blob"],
        "line_start": start,
        "line_end": end,
        "line_text": selected,
        "line_text_sha256": tagged(text.encode("utf-8")),
        "source_revision": revision,
    }


def target_boundary_pool(l1_map: dict, boundary_ranges: list, l1_ranges: dict) -> dict:
    return {
        "status": "reconstructed_from_pinned_target_helper; not emitted as an overlap-row counterevidence field",
        "product_boundary": {
            "path": BOUNDARY,
            "sha256": tagged(git_bytes(ARCHIVE_REVISION, BOUNDARY)),
            "ranges": [range_receipt(ARCHIVE_REVISION, BOUNDARY, a, b) for a, b in boundary_ranges],
        },
        "four_product_l1_comparison_pool": {
            product: {
                "path": l1_map[product],
                "sha256": tagged(git_bytes(ARCHIVE_REVISION, l1_map[product])),
                "ranges": [range_receipt(ARCHIVE_REVISION, l1_map[product], a, b) for a, b in l1_ranges[product]],
            }
            for product in PRODUCTS
        },
        "counterevidence_authored_by_target_overlap_result": None,
        "interpretation": "No target-specific counterevidence was persisted for excluded overlap rows. This four-product boundary/L1 pool is supplied for human comparison only.",
    }


def main_records() -> tuple[dict[str, list[dict]], dict[str, tuple[int, dict]]]:
    by_id: dict[str, list[dict]] = {}
    sources: dict[str, tuple[int, dict]] = {}
    for bundle in MAIN_BUNDLES:
        raw = git_bytes(BASE_REVISION, bundle)
        for line, row in strict_jsonl(raw, bundle):
            asset_id = row.get("asset_id")
            if not isinstance(asset_id, str):
                raise AssertionError(f"E_MAIN_RECORD {bundle}:{line} missing asset_id")
            by_id.setdefault(asset_id, []).append({"bundle": bundle, "line": line, "row": row, "row_sha256": row_digest(row)})
    if len(by_id) != 429:
        raise AssertionError(f"E_MAIN_RESULT prior main candidate union expected 429 IDs got {len(by_id)}")
    for asset_id, results in by_id.items():
        identity = {
            (r["row"].get("source_exact", {}).get("source_path"), r["row"].get("source_exact", {}).get("sha256"))
            for r in results
        }
        if len(identity) != 1:
            raise AssertionError(f"E_MAIN_RESULT same-ID source path/SHA alias {asset_id}")
        for result in results:
            row = result["row"]
            nested = row.get("classification", {}) if isinstance(row.get("classification"), dict) else {}
            category = row.get("classification_category") or nested.get("category")
            products = row.get("candidate_products", nested.get("candidate_products", []))
            valid = ((category == "direct_product_basis" and isinstance(products, list) and len(products) == 1)
                     or (category == "multi_product_conflict" and isinstance(products, list) and len(products) >= 2)
                     or (category == "insufficient_basis" and products == []))
            if not valid or any(product not in PRODUCTS for product in products):
                raise AssertionError(f"E_MAIN_RESULT category/product invariant {asset_id}")
    for path in (PHASE, DISPOSITION):
        for line, row in strict_jsonl(git_bytes(BASE_REVISION, path), path):
            asset_id = row.get("asset_id")
            if isinstance(asset_id, str):
                sources.setdefault(asset_id, (line, row))
    return by_id, sources


def current_main_union_evidence(prior_main_by_id: dict[str, list[dict]]) -> dict:
    target_rows = strict_jsonl(git_bytes(BASE_REVISION, TARGET_RECORDS), TARGET_RECORDS)
    target_ids = [row["asset_id"] for _, row in target_rows]
    if len(target_ids) != 67 or len(set(target_ids)) != 67 or set(target_ids) & set(prior_main_by_id):
        raise AssertionError("E_MAIN_UNION current main must be 429 prior IDs plus 67 disjoint #2078 residual IDs")
    merged_tree = git_tree(BASE_REVISION, TARGET_RECORDS)
    pinned_tree = git_tree(TARGET_REVISION, TARGET_RECORDS)
    if merged_tree["blob"] != pinned_tree["blob"] or merged_tree["mode"] != pinned_tree["mode"]:
        raise AssertionError("E_MAIN_UNION merged #2078 residual records differ from immutable c55 pin")
    return {
        "prior_main_candidate_union_count": len(prior_main_by_id),
        "merged_2078_residual_count": len(target_ids),
        "merged_2078_residual_ids_sha256": tagged(canonical(sorted(target_ids))),
        "merged_2078_residual_disjoint_from_prior_main": True,
        "current_main_union_count": len(set(prior_main_by_id) | set(target_ids)),
    }


def target_phase_inputs(asset_id: str) -> dict:
    phase_rows = {row.get("asset_id"): (line, row) for line, row in strict_jsonl(git_bytes(ARCHIVE_REVISION, PHASE), PHASE)}
    disp_rows = {row.get("asset_id"): (line, row) for line, row in strict_jsonl(git_bytes(ARCHIVE_REVISION, DISPOSITION), DISPOSITION)}
    if asset_id not in phase_rows or asset_id not in disp_rows:
        raise AssertionError(f"E_TARGET_PHASE missing {asset_id}")
    pline, phase = phase_rows[asset_id]
    dline, disposition = disp_rows[asset_id]
    if phase.get("source_path") != disposition.get("source_path") or phase.get("source_sha256") != disposition.get("source_sha256"):
        raise AssertionError(f"E_TARGET_PHASE path/SHA alias {asset_id}")
    return {
        "phase": {
            "path": PHASE, "line": pline, "row_sha256": row_digest(phase),
            "source_path": phase.get("source_path"), "source_sha256": phase.get("source_sha256"),
            "product_classification_status": phase.get("product_classification_status"),
            "artifact_evidence_kind": phase.get("artifact_evidence_kind"),
            "implementation_evidence_state": phase.get("implementation_evidence_state"),
            "legacy_implementation_status": phase.get("legacy_implementation_status"),
            "candidate_phase_targets": phase.get("candidate_phase_targets") or [],
            "candidate_product_targets": phase.get("candidate_product_targets") or [],
            "legacy_execution_performed": phase.get("legacy_execution_performed"),
        },
        "disposition": {
            "path": DISPOSITION, "line": dline, "row_sha256": row_digest(disposition),
            "disposition": disposition.get("disposition"), "asset_class": disposition.get("asset_class"),
            "implementation_status": disposition.get("implementation_status"),
            "product_target": disposition.get("product_target"),
            "consumer_refs": sorted(disposition.get("consumer_refs", [])),
            "decision_record_ref": disposition.get("decision_record_ref"),
            "read_after_record_ref": disposition.get("read_after_record_ref"),
        },
        "scope_note": "Inputs reconstructed from the #2078 fixed BASE for review context; overlap row itself stores no phase/history output.",
    }


def target_history(asset_id: str) -> dict:
    decisions = [(line, row) for line, row in strict_jsonl(git_bytes(ARCHIVE_REVISION, DECISIONS), DECISIONS) if row.get("asset_id") == asset_id]
    after = [(line, row) for line, row in strict_jsonl(git_bytes(ARCHIVE_REVISION, READ_AFTER), READ_AFTER) if row.get("asset_id") == asset_id]
    return {
        "decisions": [{"path": DECISIONS, "line": n, "row_sha256": row_digest(row), "decision_id": row.get("decision_id"), "product_target": row.get("product_target"), "disposition": row.get("disposition")} for n, row in decisions],
        "read_after": [{"path": READ_AFTER, "line": n, "row_sha256": row_digest(row), "read_after_id": row.get("read_after_id"), "result": row.get("result"), "digest_match": row.get("digest_match"), "consumer_match": row.get("consumer_match")} for n, row in after],
        "failure_consumer_static": {
            "failure": {"path": FAILURE_SOURCE, "blob": git_tree(ARCHIVE_REVISION, FAILURE_SOURCE)["blob"], "sha256": tagged(git_bytes(ARCHIVE_REVISION, FAILURE_SOURCE)), "read_mode": "git_object_static_read_only"},
            "consumer": {"path": CONSUMER_SOURCE, "blob": git_tree(ARCHIVE_REVISION, CONSUMER_SOURCE)["blob"], "sha256": tagged(git_bytes(ARCHIVE_REVISION, CONSUMER_SOURCE)), "read_mode": "git_object_static_read_only"},
        },
        "closure_status": "asset-level consumer closure is not inferred from historical refs",
    }


def target_archive_entry(target_inventory: dict, asset_id: str) -> dict:
    hits = [x for x in target_inventory["archive_source_provenance"] if x.get("asset_id") == asset_id]
    if len(hits) != 1:
        raise AssertionError(f"E_TARGET_ARCHIVE provenance cardinality {asset_id}")
    return hits[0]


def overlap_snapshot(revision: str) -> tuple[list[dict], list[dict]]:
    inventory = strict_json(git_bytes(revision, TARGET_INVENTORY), TARGET_INVENTORY)
    rows = sorted(inventory.get("overlap_reconciliation", {}).get("entries", []), key=lambda x: x.get("asset_id", ""))
    conflicts = [x for x in rows if x.get("overlap_status") == OVERLAP_STATUS]
    if len(rows) != 53 or len(conflicts) != 36:
        raise AssertionError(f"E_REPIN_COUNTS {revision}: overlaps={len(rows)} conflicts={len(conflicts)}")
    return rows, conflicts


def repin_stability(current_inventory: dict) -> dict:
    old_rows, old_conflicts = overlap_snapshot(PREVIOUS_TARGET_REVISION)
    new_rows = sorted(current_inventory.get("overlap_reconciliation", {}).get("entries", []), key=lambda x: x.get("asset_id", ""))
    new_conflicts = [x for x in new_rows if x.get("overlap_status") == OVERLAP_STATUS]
    old_ids = [x["asset_id"] for x in old_conflicts]
    new_ids = [x["asset_id"] for x in new_conflicts]
    old_sources = [(x["asset_id"], x["source_path"], x["source_sha256"]) for x in old_conflicts]
    new_sources = [(x["asset_id"], x["source_path"], x["source_sha256"]) for x in new_conflicts]
    old_candidates = [(x["asset_id"], x["target_category"], x["target_products"], x["existing_candidate_results"]) for x in old_conflicts]
    new_candidates = [(x["asset_id"], x["target_category"], x["target_products"], x["existing_candidate_results"]) for x in new_conflicts]
    return {
        "from_head": PREVIOUS_TARGET_REVISION,
        "to_head": TARGET_REVISION,
        "overlap_count_previous": len(old_rows),
        "overlap_count_current": len(new_rows),
        "conflict_count_previous": len(old_conflicts),
        "conflict_count_current": len(new_conflicts),
        "previous_overlap_rows_sha256": tagged(canonical(old_rows)),
        "current_overlap_rows_sha256": tagged(canonical(new_rows)),
        "previous_conflict_id_set_sha256": tagged(canonical(old_ids)),
        "current_conflict_id_set_sha256": tagged(canonical(new_ids)),
        "previous_conflict_source_identity_sha256": tagged(canonical(old_sources)),
        "current_conflict_source_identity_sha256": tagged(canonical(new_sources)),
        "previous_conflict_candidate_results_sha256": tagged(canonical(old_candidates)),
        "current_conflict_candidate_results_sha256": tagged(canonical(new_candidates)),
        "overlap_rows_unchanged": old_rows == new_rows,
        "conflict_id_set_unchanged": old_ids == new_ids,
        "conflict_source_identity_unchanged": old_sources == new_sources,
        "conflict_target_and_main_candidate_summaries_unchanged": old_candidates == new_candidates,
        "recomputed_main_candidate_result_rows": len(new_conflicts),
        "changed_overlap_row_count": sum(a != b for a, b in zip(old_rows, new_rows)) + abs(len(old_rows) - len(new_rows)),
        "history_only_previous_pin": True,
    }


def candidate_reason_candidates(main: dict, target_span: dict, main_spans: list, target_scope: dict) -> list[dict]:
    results = []
    membership = target_scope["scope_membership_evidence"]
    if (
        target_scope["target_overlap_scope"] == "existing_main_product_research_union"
        and membership["target_overlap_status"] == OVERLAP_STATUS
        and membership["fallback_profile_contains_asset_id"] is True
        and membership["fallback_profile_reason_claims_asset_absent"] is True
        and membership["main_union_contains_asset_id"] is True
    ):
        results.append({
            "type": "scope_difference",
            "evidence_refs": ["target.scope.scope_membership_evidence", "target.overlap_result", "main.input_union"],
            "basis": "The #2078 UNRESEARCHED_PREFIX_ASSET_PATHS fallback reason asserts this asset ID was absent from prior research, while its overlap row and the retained source-specific result place it in the prior 429-ID union. The current main union is 496 after adding 67 disjoint residual assets; this is a research-scope difference for human review, not a semantic conflict.",
        })
    if not main_spans or any((s.get("line_start"), s.get("line_end"), s.get("line_text_sha256")) != (target_span.get("line_start"), target_span.get("line_end"), tagged("\n".join(target_span.get("line_text", [])).encode("utf-8"))) for s in main_spans):
        results.append({
            "type": "evidence_span_difference",
            "evidence_refs": ["main.source_spans", "target.reconstructed_source_span"],
            "basis": "The main result retains source-specific span(s); #2078's fallback chooses one unique non-empty line. Their line bounds or text digest differ.",
        })
    if (
        main.get("manual_semantic_review", {}).get("status")
        and main_spans
        and target_span.get("interpretation") == PROFILE_REASON
        and main.get("classification_reason")
    ):
        results.append({
            "type": "research_method_state_difference",
            "evidence_refs": ["main.manual_semantic_review", "main.source_spans", "target.profile_reason", "target.method.classification_rule"],
            "basis": "The main side has source-specific semantic review and spans, while #2078 supplies only a generic insufficient-basis fallback for an unresearched-prefix set. This records research, method, and state difference; it is not a semantic interpretation conflict because both sides did not independently research the source.",
        })
    if main.get("classification_category") != "insufficient_basis" or main.get("candidate_products") != []:
        results.append({
            "type": "classification_rule_difference",
            "evidence_refs": ["main.classification", "main.manual_semantic_review", "target.fallback_profile"],
            "basis": "The main result has a direct or multi-product semantic review; the #2078 overlap candidate inherits the generic insufficient-basis rule for the unresearched-prefix set.",
        })
    if not results:
        results.append({"type": "unresolved", "evidence_refs": ["main", "target"], "basis": "Static records do not establish a supported difference cause."})
    return results


def make_record(entry: dict, main_results: list[dict], target_inv: dict, path_to_id: dict[str, str], l1: dict, boundary_ranges: list, l1_ranges: dict) -> dict:
    asset_id = entry["asset_id"]
    if len(main_results) != 1:
        raise AssertionError(f"E_MAIN_RESULT expected single result {asset_id} got {len(main_results)}")
    existing = main_results[0]
    main = existing["row"]
    source_path = entry["source_path"]
    if path_to_id.get(source_path) != asset_id:
        raise AssertionError(f"E_TARGET_METHOD fallback target ID/path mismatch {asset_id}")
    source_sha = entry["source_sha256"]
    if not source_sha.startswith("sha256:"):
        raise AssertionError(f"E_SOURCE_IDENTITY malformed source digest {asset_id}")
    archive, source_bytes = archive_evidence(source_path, source_sha)
    main_exact = main.get("source_exact", {})
    if main.get("asset_id") != asset_id or main_exact.get("source_path") != source_path or main_exact.get("sha256") != source_sha:
        raise AssertionError(f"E_SOURCE_IDENTITY main row path/SHA mismatch {asset_id}")
    if main_exact.get("blob") != archive["blob"] or main_exact.get("bytes") != archive["bytes"]:
        raise AssertionError(f"E_SOURCE_IDENTITY main row archive object mismatch {asset_id}")
    target_span = unique_anchor(source_bytes)
    target_source = target_archive_entry(target_inv, asset_id)
    te = target_source["source_exact"]
    if target_source.get("source_path") != source_path or te.get("sha256") != source_sha or te.get("blob") != archive["blob"]:
        raise AssertionError(f"E_TARGET_ARCHIVE path/SHA/blob mismatch {asset_id}")
    target_l1_pool = target_boundary_pool(l1, boundary_ranges, l1_ranges)
    main_spans = main_exact.get("semantic_anchors", [])
    target_scope = {
        "main_union_scope": "current_main_product_research_union (496 IDs = prior candidate union 429 + merged #2078 residual 67; comparison uses the prior source-specific candidate records)",
        "target_overlap_scope": entry.get("research_scope"),
        "target_generator_scope": "new_residual_after_main_product_union; overlap candidates are excluded from emitted 67-record target JSONL",
        "target_fallback_profile_scope": "UNRESEARCHED_PREFIX_ASSET_PATHS (53 static ID/path literals); generic rationale refers to absent prior research IDs",
        "scope_membership_evidence": {
            "fallback_profile_contains_asset_id": path_to_id.get(source_path) == asset_id,
            "fallback_profile_reason_claims_asset_absent": "absent from the prior research asset-ID set" in PROFILE_REASON,
            "main_union_contains_asset_id": main.get("asset_id") == asset_id,
            "main_union_asset_count": 496,
            "prior_main_candidate_union_asset_count": 429,
            "merged_2078_residual_asset_count": 67,
            "target_overlap_status": entry.get("overlap_status"),
        },
    }
    phase = target_phase_inputs(asset_id)
    target_context = {
        "classification_result": {
            "category": entry["target_category"],
            "candidate_products": entry["target_products"],
            "reason": PROFILE_REASON,
            "result_origin": "#2078 generate.py literal profile; overlap row is summarized in inventory and has no classification JSONL record",
        },
        "source_spans": {
            "semantic_span": target_span,
            "emission_status": "reconstructed from pinned helper and fixed archive bytes; not emitted in #2078 overlap row",
        },
        "product_boundary_and_l1": target_l1_pool,
        "counterevidence": {
            "status": "not_recorded_for_overlap_row",
            "available_human_counterevidence": target_l1_pool["four_product_l1_comparison_pool"],
            "note": "All four L1 roots are a comparison pool only; no product candidate is inferred from them.",
        },
        "method": {
            "profile_set": "UNRESEARCHED_PREFIX_ASSET_PATHS",
            "selection": "first non-empty unique source line via unique_anchor_marker; span length 1",
            "classification_rule": "insufficient_basis; candidate_products=[]",
            "scope": target_scope,
            "source_exclusion": "#2078 final classification JSONL excludes all 53 overlap entries; target result is inventory summary plus generator profile.",
            "generator_source_sha256": tagged(git_bytes(TARGET_REVISION, TARGET_GENERATOR)),
            "inventory_overlap_row_sha256": row_digest(entry),
        },
        "phase_implementation_context": phase,
        "history_failure_consumer_context": target_history(asset_id),
        "human_judgment_remaining": True,
        "authority_effect": "none",
        "formal_route_created": False,
        "new_build_allowed": False,
    }
    main_context = {
        "result": {
            "category": main["classification_category"],
            "candidate_products": main.get("candidate_products", []),
            "reason": main.get("classification_reason"),
            "classification_state": main.get("classification_state"),
        },
        "source_spans": main_spans,
        "product_boundary_evidence": main.get("boundary_evidence"),
        "l1_evidence": main.get("l1_evidence"),
        "counterevidence": main.get("manual_semantic_review", {}).get("boundary_counterevidence", []),
        "manual_semantic_review": main.get("manual_semantic_review"),
        "method": {
            "bundle": existing["bundle"],
            "row": existing["line"],
            "row_sha256": existing["row_sha256"],
            "source_profile": main.get("source_profile"),
            "manual_review_status": main.get("manual_semantic_review", {}).get("status"),
            "classification_schema": "classification_category + candidate_products + manual_semantic_review + source_exact.semantic_anchors",
            "scope": "source-specific candidate is retained in the prior 429-record union; current main union is 496 after merging 67 disjoint #2078 residual records",
        },
        "phase_implementation_context": {
            "phase_ledger": main.get("phase_ledger"),
            "legacy_implementation_shrinkage_evidence": main.get("legacy_implementation_shrinkage_evidence"),
            "legacy_history_failure_consumer": main.get("legacy_history_failure_consumer"),
            "failure_consumer_static_refs": main.get("failure_consumer_static_refs"),
            "legacy_implementation_status": main.get("legacy_implementation_shrinkage_evidence", {}).get("implementation_status"),
            "phase_candidate_targets": (main.get("phase_ledger") or {}).get("candidate_phase_targets", []),
            "closure_status": (main.get("legacy_history_failure_consumer") or {}).get("state_boundary"),
        },
        "authority_effect": main.get("authority_effect"),
        "formal_asset_classification_updated": main.get("formal_asset_classification_updated"),
        "new_build_allowed": main.get("new_build_allowed"),
    }
    differences = candidate_reason_candidates(main, target_span, main_spans, target_scope)
    return {
        "asset_id": asset_id,
        "source_identity": {
            "source_path": source_path,
            "source_sha256": source_sha,
            "main_revision": BASE_REVISION,
            "target_revision": TARGET_REVISION,
            "target_archive_revision": ARCHIVE_REVISION,
            "archive_provenance": archive,
            "main_record_source_exact": {
                "archive_path": main_exact.get("archive_path"),
                "blob": main_exact.get("blob"),
                "bytes": main_exact.get("bytes"),
                "line_count": main_exact.get("line_count"),
                "ledger_source_sha256": main_exact.get("ledger_source_sha256"),
                "sha256": main_exact.get("sha256"),
                "read_mode": main_exact.get("read_mode"),
            },
            "target_overlap_source_exact": {
                "archive_path": te.get("archive_path"),
                "blob": te.get("blob"),
                "bytes": te.get("bytes"),
            "line_count": te.get("line_count"),
            "ledger_source_sha256": te.get("ledger_source_sha256"),
            "sha256": te.get("sha256"),
            "mode": te.get("mode"),
            "type": te.get("type"),
            "ledger_digest_match": te.get("ledger_digest_match"),
            "archive_manifest_sha256": te.get("archive_manifest_sha256"),
            "archive_manifest_match": te.get("archive_manifest_match"),
            "archive_manifest_resolution": te.get("archive_manifest_resolution"),
            "read_mode": te.get("read_mode"),
        },
            "identity_checks": {
                "main_and_target_source_path_equal": True,
                "main_and_target_source_sha256_equal": True,
                "archive_blob_sha_manifest_all_match": True,
                "type_blob_regular_mode": archive["type"] == "blob" and archive["mode"] in {"100644", "100755"},
            },
        },
        "main_existing_result": main_context,
        "target_2078_result": target_context,
        "difference_reason_candidates": differences,
        "resolution": {
            "status": "comparison_state_reconciled; main_candidate_disposition_unapproved",
            "comparison_treatment": "research_method_state_difference",
            "semantic_conflict_decision_required": False,
            "main_candidate_disposition": "unapproved; retain for the ordinary candidate disposition process; this comparison neither approves nor rejects it",
            "winner_selected": False,
            "formal_route_created": False,
            "questions": [],
        },
        **AUTHORITY,
    }


def collect_inputs(target_inv: dict, entries: list[dict]) -> list[dict]:
    inputs = []
    for path in MAIN_BUNDLES:
        inputs.append(input_digest(BASE_REVISION, path, "main candidate-result union input"))
    for path, purpose in (
        (TARGET_GENERATOR, "#2078 target method/profile static source; inspected as text/AST only"),
        (TARGET_INVENTORY, "#2078 overlap row/source identity/result pin"),
        (TARGET_RECORDS, "#2078 emitted-target exclusion proof"),
        (TARGET_BINDING, "#2078 scaffold boundary/method provenance"),
    ):
        inputs.append(input_digest(TARGET_REVISION, path, purpose))
    for path, purpose in (
        (BOUNDARY, "four-product boundary roots"), (PHASE, "phase-candidate/source identity"),
        (DISPOSITION, "legacy disposition and implementation status"), (DECISIONS, "legacy decision history"),
        (READ_AFTER, "legacy read-after history"),
        (FAILURE_SOURCE, "static failure inventory"), (CONSUMER_SOURCE, "static consumer inventory"),
        *[(path, "approved four-product L1 evidence root") for path in L1_PATHS.values()],
    ):
        inputs.append(input_digest(BASE_REVISION, path, purpose))
        if tagged(git_bytes(BASE_REVISION, path)) != tagged(git_bytes(ARCHIVE_REVISION, path)):
            raise AssertionError(f"E_INPUT_REVISION target/base doc drift requires explicit comparison: {path}")
    inputs.append(input_digest(BASE_REVISION, MANIFEST, "archive MANIFEST digest cross-check; static archive reference", archive=True))
    # Pin every contested legacy blob as static inventory provenance, not as a Binding upstream.
    for entry in entries:
        inputs.append(input_digest(ARCHIVE_REVISION, ARCHIVE_PREFIX + entry["source_path"], "contested archive source bytes; static Git object read only", archive=True))
    unique = {}
    for item in inputs:
        key = (item["revision"], item["path"])
        if key in unique and unique[key] != item:
            raise AssertionError(f"E_INPUT_DUPLICATE {key}")
        unique[key] = item
    return sorted(unique.values(), key=lambda x: (x["revision"], x["path"]))


def main_rebaseline(prior_main_by_id: dict[str, list[dict]]) -> dict:
    paths = sorted(set((*MAIN_BUNDLES, BOUNDARY, PHASE, DISPOSITION, DECISIONS, READ_AFTER, MANIFEST, FAILURE_SOURCE, CONSUMER_SOURCE, *L1_PATHS.values())))
    comparisons = []
    for path in paths:
        previous = git_tree(PREVIOUS_BASE_REVISION, path)
        current = git_tree(BASE_REVISION, path)
        if previous["blob"] != current["blob"] or previous["mode"] != current["mode"]:
            raise AssertionError(f"E_MAIN_REBASELINE fixed input changed: {path}")
        comparisons.append({"path": path, "blob": current["blob"], "mode": current["mode"]})
    changed_scaffold = subprocess.check_output(["git", "diff", "--name-only", PREVIOUS_BASE_REVISION, BASE_REVISION, "--", "scaffold"], cwd=ROOT, text=True).splitlines()
    added_scaffold = subprocess.check_output(["git", "diff", "--name-only", "--diff-filter=A", PREVIOUS_BASE_REVISION, BASE_REVISION, "--", "scaffold"], cwd=ROOT, text=True).splitlines()
    expected_added = sorted([TARGET_BINDING, f"{TARGET_BUNDLE}/PR-DRAFT.md", f"{TARGET_BUNDLE}/README.md", TARGET_RECORDS, TARGET_GENERATOR, TARGET_INVENTORY, f"{TARGET_BUNDLE}/selfcheck.py", f"{TARGET_BUNDLE}/validate.py"])
    prior_scaffold_changes = [path for path in changed_scaffold if path not in added_scaffold]
    if added_scaffold != expected_added or prior_scaffold_changes:
        raise AssertionError("E_MAIN_REBASELINE unexpected Scaffold delta while merging #2078")
    merged_2078_objects = []
    for path in (TARGET_BINDING, f"{TARGET_BUNDLE}/PR-DRAFT.md", f"{TARGET_BUNDLE}/README.md", TARGET_RECORDS, TARGET_GENERATOR, TARGET_INVENTORY, f"{TARGET_BUNDLE}/selfcheck.py", f"{TARGET_BUNDLE}/validate.py"):
        current = git_tree(BASE_REVISION, path)
        pinned = git_tree(TARGET_REVISION, path)
        if current["blob"] != pinned["blob"] or current["mode"] != pinned["mode"]:
            raise AssertionError(f"E_MAIN_REBASELINE merged #2078 object differs from immutable c55 pin: {path}")
        merged_2078_objects.append({"path": path, "blob": current["blob"], "mode": current["mode"]})
    return {
        "previous_main_revision": PREVIOUS_BASE_REVISION,
        "current_main_revision": BASE_REVISION,
        "unchanged_fixed_input_count": len(comparisons),
        "unchanged_fixed_inputs": comparisons,
        "new_scaffold_paths": added_scaffold,
        "other_scaffold_changes": changed_scaffold,
        "merged_2078_objects": merged_2078_objects,
        "current_main_union": current_main_union_evidence(prior_main_by_id),
    }


def binding_upstream(inputs: list[dict]) -> list[dict]:
    # Open-PR objects are pinned and checked by the generator/validator through git show;
    # Binding upstream paths must exist in the fixed main checkout for scfctl validation.
    selected = [x for x in inputs if x["revision"] == BASE_REVISION and not x["archive_static_only"] and not x["path"].startswith("archive/")]
    by_path = {}
    for item in selected:
        existing = by_path.get(item["path"])
        if existing and existing != item["sha256"]:
            raise AssertionError(f"E_BINDING_UPSTREAM conflicting same path {item['path']}")
        by_path[item["path"]] = item["sha256"]
    return [{"path": path, "sha256": by_path[path].removeprefix("sha256:")} for path in sorted(by_path)]


def build() -> None:
    target_inv = strict_json(git_bytes(TARGET_REVISION, TARGET_INVENTORY), TARGET_INVENTORY)
    if not isinstance(target_inv, dict):
        raise AssertionError("E_TARGET_INVENTORY object required")
    _, path_to_id, l1, boundary_ranges, l1_ranges = target_method_pins()
    entries = target_inv.get("overlap_reconciliation", {}).get("entries", [])
    conflicts = [e for e in entries if e.get("overlap_status") == OVERLAP_STATUS]
    if len(entries) != 53 or len(conflicts) != 36:
        raise AssertionError(f"E_TARGET_SET overlap53/conflict36 expected; got {len(entries)}/{len(conflicts)}")
    main_by_id, _ = main_records()
    out_rows = []
    for entry in sorted(conflicts, key=lambda e: e["asset_id"]):
        results = main_by_id.get(entry["asset_id"], [])
        out_rows.append(make_record(entry, results, target_inv, path_to_id, l1, boundary_ranges, l1_ranges))
    ids = [r["asset_id"] for r in out_rows]
    if len(ids) != 36 or len(set(ids)) != 36:
        raise AssertionError("E_TARGET_SET exact 36 unique IDs")
    output = b"".join(canonical(row) + b"\n" for row in out_rows)
    inputs = collect_inputs(target_inv, conflicts)
    counts = Counter(reason["type"] for row in out_rows for reason in row["difference_reason_candidates"])
    main_counts = Counter(row["main_existing_result"]["result"]["category"] for row in out_rows)
    target_counts = Counter(row["target_2078_result"]["classification_result"]["category"] for row in out_rows)
    repin = repin_stability(target_inv)
    if not all(repin[key] for key in ("overlap_rows_unchanged", "conflict_id_set_unchanged", "conflict_source_identity_unchanged", "conflict_target_and_main_candidate_summaries_unchanged")) or repin["changed_overlap_row_count"] != 0:
        raise AssertionError("E_REPIN_STABILITY #2078 HEAD update changed overlap evidence; inspect before proceeding")
    inventory = {
        "schema_revision": 1,
        "binding_id": "SCF-B-0144",
        "bundle_revision": "SCF-B-0144 generated revision 5",
        "base_revision": BASE_REVISION,
        "main_rebaseline": main_rebaseline(main_by_id),
        "current_main_union": current_main_union_evidence(main_by_id),
        "archive_revision": ARCHIVE_REVISION,
        "target_pr": 2078,
        "initial_target_head_pin": INITIAL_TARGET_REVISION,
        "target_head_pin": TARGET_REVISION,
        "repin_stability_from_previous_head": repin,
        "target_head_pin_history": [
            {"head": INITIAL_TARGET_REVISION, "status": "initial_pin", "note": "first comparison pin requested before PR #2078 advanced"},
            {"head": PREVIOUS_TARGET_REVISION, "status": "previous_repin", "note": "PR #2078 advanced from the initial pin; overlap53/conflict36 IDs and source identities were rechecked"},
            {"head": TARGET_REVISION, "status": "current_repin", "note": "PR #2078 advanced from 8c8cf851; overlap53/conflict36 IDs, source identities, and candidate summaries were recomputed and remained unchanged; target inventory/generator pins were refreshed"},
        ],
        "target_head_follow_policy": "STOP the current baseline/review if PR #2078 advances beyond c55ffc91b08aabb0a0216168b3cf2b1e5fe6bf03 or main advances beyond 7afee33ae892fe1a3cf1085fac4e02d923ece01d. Do not present this packet as current until the exact new HEADs and rebase base are inspected, pins are explicitly refreshed, generator/validator/selfcheck are rerun, and all set/evidence changes are reviewed and recorded. No floating branch ref is followed automatically. This stop rule is operator-enforced; the validator checks pinned objects and does not query remote branch HEADs or establish review freshness.",
        "subject_count": 36,
        "new_asset_research_count": 0,
        "adds_assets_to_main_union": False,
        "target_overlap_count": 53,
        "other_overlap_same_result_count": 17,
        "conflict_status": OVERLAP_STATUS,
        "main_union_asset_count": 496,
        "prior_main_candidate_union_asset_count": 429,
        "merged_2078_residual_asset_count": 67,
        "exact_target_asset_ids": ids,
        "category_counts_main_existing": dict(sorted(main_counts.items())),
        "category_counts_target_2078": dict(sorted(target_counts.items())),
        "difference_reason_candidate_counts": dict(sorted(counts.items())),
        "difference_reason_vocabulary": ["scope_difference", "evidence_span_difference", "research_method_state_difference", "classification_rule_difference", "unresolved"],
        "semantic_interpretation_conflict_policy": "A semantic interpretation conflict requires both sides to have independently researched source-specific evidence and to retain incompatible interpretations. The #2078 rows here are generic insufficient-basis fallbacks, so the 36 records contain zero such conflicts.",
        "semantic_interpretation_conflict_count": 0,
        "candidate_reason_policy": "Reasons are evidence-backed non-exclusive candidates; no winner, owner, formal route, phase, successor, implementation status, or consumer closure is generated.",
        "authority_boundary": {**AUTHORITY, "formal_update": "none", "research_only": True, "LABO": "excluded; Issue #2089 hold remains in force"},
        "target_overlap_reconciliation_pin": {
            "inventory_path": TARGET_INVENTORY,
            "inventory_sha256": tagged(git_bytes(TARGET_REVISION, TARGET_INVENTORY)),
            "overlap_rows_sha256": tagged(canonical(conflicts)),
            "target_generator_path": TARGET_GENERATOR,
            "target_generator_sha256": tagged(git_bytes(TARGET_REVISION, TARGET_GENERATOR)),
            "target_records_path": TARGET_RECORDS,
            "target_records_sha256": tagged(git_bytes(TARGET_REVISION, TARGET_RECORDS)),
            "target_result_emission": "36 excluded overlap results are not JSONL records; candidate values are in inventory and target fallback literals in generator.",
        },
        "input_digests": inputs,
        "binding_upstream_digests": binding_upstream(inputs),
        "source_identity_checks": {
            "exact_same_source_path_sha_for_all_36": True,
            "archive_blob_type_mode_and_manifest_checked": True,
            "all_archive_reads": "git_object_static_read_only",
            "archive_runtime_test_ci_hook_adapter_execution": False,
        },
        "negative_cases": [
            "N01-json-duplicate-key", "N02-target-set-omission", "N03-target-set-duplicate",
            "N04-main-result-mutation", "N05-target-result-mutation", "N06-source-sha-alias",
            "N07-source-span-tamper", "N08-l1-evidence-tamper", "N09-reason-evidence-tamper",
            "N10-formal-authority-promotion", "N11-phase-status-promotion", "N12-upstream-digest-stale",
            "N13-output-digest-stale", "N14-scope-membership-evidence-tamper",
            "N15-json-nan", "N16-json-infinity", "N17-json-negative-infinity",
            "N18-nested-authority-promotion", "N19-main-review-unbound", "N20-source-provenance-forgery",
            "N21-inventory-id-and-pin-forgery", "N22-reason-wording-drift", "N23-strict-json-types",
            "N24-inventory-policy-drift", "N25-repin-stability-drift", "N26-main-union-drift",
            "N27-main-rebaseline-drift", "N28-binding-drift",
            "N29-negative-case-contract-drift",
            "N30-malformed-container-fails-closed",
            "N31-nested-unknown-key",
            "N32-record-unknown-key", "N33-target-source-span-tamper", "N34-target-product-evidence-unknown-key",
        ],
        "outputs": {"records_sha256": tagged(output), "records_bytes": len(output), "record_count": len(out_rows)},
    }
    inventory["inventory_sha256"] = tagged(canonical({k: v for k, v in inventory.items() if k != "inventory_sha256"}))
    binding = {
        "schema_revision": 1,
        "id": "SCF-B-0144",
        "kind": "scaffold",
        "title": "#2078 overlap 36件のresearch/method/state comparison",
        "product": "HELIX-HARNESS",
        "owner_candidate": "四製品product-boundaryの候補結果差分照合（正式owner未解決）",
        "state": "registered",
        "reason": "main 7afee33aの旧429件source-specific候補と#2078固定HEAD c55ffc91の候補を照合し、同一source path/SHAの36件について候補値、source span、L1根拠、counterevidence、research/method/stateとscope差を記録する。現main unionは429+67=496件であり、比較対象429件と分けて示す。#2078側はgeneric fallbackのためsemantic interpretation conflictには数えない。勝者・formal route・新規asset研究を生成しない。",
        "upstream": binding_upstream(inputs),
        "role": "legacy-asset-overlap-reconciliation-research-state-0144-static",
        "obligations": [
            "#2078 overlap 53件のうちsame_source_different_candidate_result exact 36件のみを旧main source-specific候補union429と固定c55候補で照合する。現main union496は旧429+追加67件として別記し、36件を新規研究へ加算しない",
            "両結果のsource span、interpretation、candidate product/L1 roots、counterevidence availability、method/scopeをside-by-sideで保持し、target-emitted evidenceとstatic reconstructionを区別する",
            "scope_difference/evidence_span_difference/research_method_state_difference/classification_rule_difference/unresolvedを証拠参照付きnon-exclusive reason candidateとして扱う。semantic interpretation conflictは両側が独立にsource-specific researchを行い、解釈が両立しない場合だけとする。勝者や正式routeを作らない",
            "main 2c94d171から7afee33aへの再baselineでは四製品L1・分類8 JSONLを含む固定入力20 pathのblob/modeが不変。mainへ追加された#2078の8 Scaffold filesはすべてc55固定objectと一致し、旧429件に67件を加えた現union496件を確認した。#2078は初期HEAD 886c2436、前回HEAD 8c8cf851から現HEAD c55ffc91へ明示pin済み。#2078またはmainが進んだら停止し、新HEAD/base確認後に完全再検証・差分reviewをする。自動追随しない",
            "旧archiveはGit blob静的readのみ。runtime/test/CI/hook/adapterを実行しない。LABO適用を含め4製品以外を扱わない",
            "phase candidate/implementation status/history/failure/consumerは候補分類から分離し、formal classification/phase/successor/closureを更新しない",
        ],
        "connections": {
            "boundary": "research-only; authority_effect=none; no formal route, classification update, phase admission, successor, implementation promotion, closure, or new build",
            "consumers": ["comparison evidence; existing main candidate dispositions remain unapproved for their ordinary disposition process"],
            "dependencies": ["main candidate comparison union 429 at 7afee33a plus current union 496 after merging the exact 67 #2078 residual rows", "#2078 exact target HEAD object c55ffc91, verified byte-identical to merged main objects", "four-product L1 and product-boundary", "fixed archive source blobs/MANIFEST"],
        },
        "operations": {
            "allowed": ["read pinned Git objects statically", "write scaffold comparison artifacts", "run generator/validator/selfcheck/scfctl"],
            "forbidden": ["execute archive source/runtime/test/CI/hook/adapter", "select a winning product result", "update formal route/classification/phase/successor/implementation/consumer closure", "apply LABO classification", "merge/close/deploy"],
        },
        "artifacts": [
            "scaffold/bindings/SCF-B-0144.json",
            "scaffold/legacy-overlap-reconciliation-0144/README.md",
            "scaffold/legacy-overlap-reconciliation-0144/PR-DRAFT.md",
            "scaffold/legacy-overlap-reconciliation-0144/generate.py",
            "scaffold/legacy-overlap-reconciliation-0144/validate.py",
            "scaffold/legacy-overlap-reconciliation-0144/selfcheck.py",
            "scaffold/legacy-overlap-reconciliation-0144/inventory.json",
            "scaffold/legacy-overlap-reconciliation-0144/classification-reconciliation.jsonl",
            "scaffold/legacy-overlap-reconciliation-0144/human-judgment-packet.md",
        ],
        "verification": {
            "evidence_kind": "scaffold",
            "scope": ["source_revision_stale", "deterministic_behavior", "negative_case", "forbidden_write_scope"],
            "oracles": [
                "validator independently reads the pinned #2078 inventory/generator, eight prior main classification inputs, and merged 67-row residual set without importing generate.py",
                "validator checks exactly 36 conflict IDs, all 53 overlap rows, prior candidate union429 and current main union496, same path/SHA, archive blob/type/mode/MANIFEST, spans, candidate/L1/counterevidence and method/scope pins",
                "strict JSON parsing, all input Git-object SHA pins, authority invariants, exact negative-case execution and deterministic output digests",
            ],
            "negative_cases": [
                "N01-json-duplicate-key", "N02-target-set-omission", "N03-target-set-duplicate",
                "N04-main-result-mutation", "N05-target-result-mutation", "N06-source-sha-alias",
                "N07-source-span-tamper", "N08-l1-evidence-tamper", "N09-reason-evidence-tamper",
                "N10-formal-authority-promotion", "N11-phase-status-promotion", "N12-upstream-digest-stale",
                "N13-output-digest-stale", "N14-scope-membership-evidence-tamper",
                "N15-json-nan", "N16-json-infinity", "N17-json-negative-infinity",
                "N18-nested-authority-promotion", "N19-main-review-unbound", "N20-source-provenance-forgery",
                "N21-inventory-id-and-pin-forgery", "N22-reason-wording-drift", "N23-strict-json-types",
                "N24-inventory-policy-drift", "N25-repin-stability-drift", "N26-main-union-drift",
                "N27-main-rebaseline-drift", "N28-binding-drift",
                "N29-negative-case-contract-drift",
                "N30-malformed-container-fails-closed",
                "N31-nested-unknown-key",
                "N32-record-unknown-key", "N33-target-source-span-tamper", "N34-target-product-evidence-unknown-key",
            ],
        },
        "replacement": {"formal_artifacts": [], "issue": 2078, "role_target": None, "status": "pending"},
        "created": "2026-09-23",
        "updated": "2026-09-23",
    }
    BUNDLE.mkdir(parents=True, exist_ok=True)
    records_path = BUNDLE / "classification-reconciliation.jsonl"
    records_path.write_bytes(output)
    (BUNDLE / "inventory.json").write_bytes(canonical(inventory) + b"\n")
    BINDING_PATH.parent.mkdir(parents=True, exist_ok=True)
    BINDING_PATH.write_bytes(json.dumps(binding, ensure_ascii=False, sort_keys=True, indent=2).encode() + b"\n")
    render_packet(out_rows)
    print(f"SCF-B-0144 generated {len(out_rows)} conflicts; new_asset_research_count=0; reasons={dict(sorted(counts.items()))}")


def render_packet(rows: list[dict]) -> None:
    lines = [
        "# #2078 overlap差分のresearch-state comparison packet",
        "",
        f"main `{BASE_REVISION}` とimmutable #2078 HEAD `{TARGET_REVISION}` を固定。overlap 53件中36件の候補差分を比較し、新規asset研究数は0。",
        f"旧main `{PREVIOUS_BASE_REVISION}` から新mainへの固定入力20 path（四製品L1・旧main分類8 JSONLを含む）のblob/modeはすべて不変。mainへ追加された#2078の8 Scaffold filesはc55固定objectと一致。旧candidate union429に#2078の新規67件を足した現main unionは496。36件の比較候補は旧429対c55 fallbackとして保持。",
        "各assetの両候補、根拠span、L1/boundary、counterevidence、phase/history/consumerは `classification-reconciliation.jsonl` に完全収録。",
        "#2078は36件を最終classification JSONLから除外しており、target側のspan/L1は同HEADのgenerator helper・literalから固定archive bytesに対して静的に再構成した。出力済みtarget evidenceとは表示上も分離した。",
        "36件は旧mainの429 candidate recordsにsource-specific research/spanがある一方、#2078側はgeneric insufficient-basis fallbackのため、research/method/state差として記録した。semantic interpretation conflictは両側が独立にsource-specific researchを行い、解釈が両立しない場合だけを指す。今回その件数は0で、この比較から36件のconflict judgmentは求めない。旧main候補の通常採否は未承認のまま別途保持する。現main unionは429+67=496件だが、候補比較は旧429件対固定c55候補のままである。勝者・正式route・phase・successor・実装成立・consumer closureは決めない。#2078またはmainが固定HEADから進んだ場合は再baselineする。",
        "",
        "| Asset ID | source path | JSONL row | main候補 | #2078候補 | 差分理由候補 | 処置 |",
        "|---|---|---:|---|---|---|---|",
    ]
    for record_no, row in enumerate(rows, 1):
        main = row["main_existing_result"]["result"]
        target = row["target_2078_result"]["classification_result"]
        reasons = ", ".join(x["type"] for x in row["difference_reason_candidates"])
        lines.append(f"| `{row['asset_id']}` | `{row['source_identity']['source_path']}` | {record_no} | `{main['category']}` {main.get('candidate_products', [])} | `{target['category']}` {target['candidate_products']} | {reasons} | 調査状態差。旧main候補の通常採否は未承認 |")
    lines += [
        "",
        "レビュー時はsource spanの差と、candidate/L1 evidenceの差を分けて確認する。target-side counterevidenceはoverlap行に保存されていないため、添付の4製品L1は照合用poolとして扱う。phase候補、implementation status、歴史的consumer/failureはcandidate owner判断から独立している。",
        "",
    ]
    (BUNDLE / "human-judgment-packet.md").write_text("\n".join(lines), encoding="utf-8")


if __name__ == "__main__":
    build()
